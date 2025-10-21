import { NextResponse } from 'next/server';
import { searchNVD, type CVESearchResult } from '@/lib/api/nvd-search';
import { detectOperatingSystems } from '@/lib/utils/os-detection';
import { detectTargetComponent } from '@/lib/utils/component-mapping';
import { createCVE, cveExists } from '@/lib/database/cve';
import { parseCVSSVector } from '@/lib/cvss-parser';
import {
  getLastBulkUpdateTime,
  setLastBulkUpdateTime,
  isBulkUpdateInProgress,
  markBulkUpdateInProgress,
  markBulkUpdateComplete
} from '@/lib/database/metadata';

// Configuration
const CONFIG = {
  // NVD allows max 120 day windows for date-based queries
  WINDOW_DAYS: 120,
  // Rate limiting: 0.6s with API key, 6s without
  RATE_LIMIT_MS: process.env.NVD_API_KEY ? 600 : 6000,
};

/**
 * Stream progress updates to the client
 */
function sendProgressUpdate(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
  type: 'progress' | 'complete' | 'error',
  data: Record<string, unknown>
) {
  const message = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  controller.enqueue(encoder.encode(message));
}

/**
 * POST /api/cves/bulk-update
 *
 * Performs a bulk import of Chrome CVEs from NVD API using CPE matching.
 * Two-phase approach:
 *   Phase 1: Fetch all CVE data from NVD across all 120-day windows
 *   Phase 2: Store all fetched data into the database
 * Returns a stream of progress updates.
 */
export async function POST() {
  // Check if an update is already in progress
  const inProgress = await isBulkUpdateInProgress();
  if (inProgress) {
    return NextResponse.json(
      { error: 'A bulk update is already in progress' },
      { status: 409 }
    );
  }

  // Create a stream for progress updates
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Mark as in progress
        await markBulkUpdateInProgress();

        // Get start date from database (required - should be seeded)
        const lastUpdateTime = await getLastBulkUpdateTime();
        if (!lastUpdateTime) {
          throw new Error('Last bulk update time not found in database. Please ensure the database is properly seeded.');
        }
        const overallStartDate = new Date(lastUpdateTime);
        const overallEndDate = new Date(); // Current date/time

        // PHASE 1: Fetch all CVE data from NVD across all 120-day windows
        sendProgressUpdate(encoder, controller, 'progress', {
          message: 'Fetching CVE data from NVD...',
          phase: 'fetch',
          imported: 0,
          skipped: 0,
          failed: 0,
        });

        const allCVEs: CVESearchResult[] = [];
        let windowStart = new Date(overallStartDate);
        let windowCount = 0;

        while (windowStart < overallEndDate) {
          // Calculate window end (min of 120 days or overall end date)
          const windowEnd = new Date(windowStart);
          windowEnd.setDate(windowEnd.getDate() + CONFIG.WINDOW_DAYS);

          console.log(windowStart);
          console.log(windowEnd);

          if (windowEnd > overallEndDate) {
            windowEnd.setTime(overallEndDate.getTime());
          }

          windowCount++;

          try {
            sendProgressUpdate(encoder, controller, 'progress', {
              message: `Fetching window ${windowCount}: ${windowStart.toISOString().split('T')[0]} to ${windowEnd.toISOString().split('T')[0]}`,
              phase: 'fetch',
              windowCount,
              imported: 0,
              skipped: 0,
              failed: 0,
            });

            // Fetch CVE data from NVD using CPE matching for this date window
            const searchResults = await searchNVD(
              windowStart.toISOString(),
              windowEnd.toISOString()
            );

            allCVEs.push(...searchResults.results);

            sendProgressUpdate(encoder, controller, 'progress', {
              message: `Fetched ${searchResults.results.length} CVEs from window ${windowCount}`,
              phase: 'fetch',
              windowCount,
              totalFetched: allCVEs.length,
              imported: 0,
              skipped: 0,
              failed: 0,
            });

            // Rate limit between window fetches
            await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_MS));

          } catch (error) {
            console.error(`Error fetching window ${windowStart.toISOString()} - ${windowEnd.toISOString()}:`, error);
            sendProgressUpdate(encoder, controller, 'progress', {
              message: `Failed to fetch window: ${error instanceof Error ? error.message : 'Unknown error'}`,
              phase: 'fetch',
              windowCount,
              imported: 0,
              skipped: 0,
              failed: 0,
            });
            // Continue to next window instead of breaking
          }

          // Move to next 120-day window
          windowStart = new Date(windowEnd);
        }

        // PHASE 2: Store all fetched CVEs into the database
        sendProgressUpdate(encoder, controller, 'progress', {
          message: `Fetched ${allCVEs.length} total CVEs. Starting database import...`,
          phase: 'store',
          totalFetched: allCVEs.length,
          imported: 0,
          skipped: 0,
          failed: 0,
        });

        let totalImported = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (const cveResult of allCVEs) {
          const { cveId } = cveResult;

          try {
            // Check if CVE already exists
            const exists = await cveExists(cveId);
            if (exists) {
              totalSkipped++;
              sendProgressUpdate(encoder, controller, 'progress', {
                current: totalImported + totalSkipped + totalFailed,
                total: allCVEs.length,
                cveId,
                status: 'skipped',
                phase: 'store',
                imported: totalImported,
                skipped: totalSkipped,
                failed: totalFailed,
              });
              continue;
            }

            // Use CVE data directly from searchNVD (no second API call needed!)
            const nvdData = cveResult;

            // Auto-detect OS labels
            const osLabels = detectOperatingSystems(nvdData.description);

            // Auto-detect target component
            const componentResult = detectTargetComponent(nvdData.description);
            const targetComponent =
              (componentResult.confidence === 'high' || componentResult.confidence === 'medium')
                ? componentResult.component
                : null;

            // Insert into database
            try {
              await createCVE({
                cveId: nvdData.cveId,
                assignerOrgId: 'nvd@nist.gov',
                assignerShortName: 'NVD',
                dateReserved: nvdData.datePublished ? new Date(nvdData.datePublished) : new Date(),
                datePublished: nvdData.datePublished ? new Date(nvdData.datePublished) : new Date(),
                dateUpdated: nvdData.dateUpdated ? new Date(nvdData.dateUpdated) : new Date(),
                descriptions: [{
                  lang: 'en',
                  description: nvdData.description,
                }],
                references: nvdData.references && nvdData.references.length > 0
                  ? nvdData.references.map((url: string) => ({ url }))
                  : undefined,
                labels: {
                  operatingSystems: osLabels,
                  targetComponent,
                },
                metrics: nvdData.cvssScore && nvdData.cvssSeverity && nvdData.cvssVector
                  ? (() => {
                      // Parse CVSS vector for detailed fields
                      const parsedComponents = parseCVSSVector(nvdData.cvssVector);
                      return [{
                        baseScore: nvdData.cvssScore,
                        baseSeverity: nvdData.cvssSeverity,
                        vectorString: nvdData.cvssVector,
                        cvssVersion: nvdData.cvssVersion || '3.1',
                        attackVector: parsedComponents?.attackVector || 'NETWORK',
                        attackComplexity: parsedComponents?.attackComplexity || 'LOW',
                        privilegesRequired: parsedComponents?.privilegesRequired || 'NONE',
                        userInteraction: parsedComponents?.userInteraction || 'NONE',
                        scope: parsedComponents?.scope || 'UNCHANGED',
                        confidentialityImpact: parsedComponents?.confidentialityImpact || 'NONE',
                        integrityImpact: parsedComponents?.integrityImpact || 'NONE',
                        availabilityImpact: parsedComponents?.availabilityImpact || 'NONE',
                      }];
                    })()
                  : undefined,
                problemTypes: nvdData.problemTypes,
                affectedProducts: nvdData.affectedProducts,
              });

              totalImported++;

              // Send progress update
              sendProgressUpdate(encoder, controller, 'progress', {
                current: totalImported + totalSkipped + totalFailed,
                total: allCVEs.length,
                cveId,
                status: 'imported',
                phase: 'store',
                osLabels,
                targetComponent,
                confidence: componentResult.confidence,
                imported: totalImported,
                skipped: totalSkipped,
                failed: totalFailed,
              });
            } catch (error) {
              console.error(`Failed to insert ${cveId} into database:`, error);
              totalFailed++;
              sendProgressUpdate(encoder, controller, 'progress', {
                current: totalImported + totalSkipped + totalFailed,
                total: allCVEs.length,
                cveId,
                status: 'failed',
                phase: 'store',
                error: error instanceof Error ? error.message : 'Database error',
                imported: totalImported,
                skipped: totalSkipped,
                failed: totalFailed,
              });
            }

          } catch (error) {
            console.error(`Error processing ${cveId}:`, error);
            totalFailed++;
          }
        }

        // Update last update timestamp
        await setLastBulkUpdateTime();

        // Mark as complete
        await markBulkUpdateComplete();

        // Send completion message
        sendProgressUpdate(encoder, controller, 'complete', {
          imported: totalImported,
          skipped: totalSkipped,
          failed: totalFailed,
          total: totalImported + totalSkipped + totalFailed,
        });

        controller.close();

      } catch (error) {
        console.error('Bulk update error:', error);

        // Mark as complete even on error
        await markBulkUpdateComplete();

        sendProgressUpdate(encoder, controller, 'error', {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
