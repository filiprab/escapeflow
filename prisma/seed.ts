import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface CVEData {
  total_cves: number;
  fetched_at: string;
  labeled_at: string;
  cve_details: Record<string, any>;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Read the existing CVE data
  const cveDataPath = join(process.cwd(), 'src', 'data', 'chromium_cve_details.json');
  const cveDataRaw = readFileSync(cveDataPath, 'utf8');
  const cveData: CVEData = JSON.parse(cveDataRaw);

  console.log(`📊 Processing ${cveData.total_cves} CVEs...`);

  let processedCount = 0;
  const cveEntries = Object.entries(cveData.cve_details);

  for (const [cveId, cveRecord] of cveEntries) {
    try {
      // Parse dates
      const dateReserved = new Date(cveRecord.cveMetadata.dateReserved);
      const datePublished = new Date(cveRecord.cveMetadata.datePublished);
      const dateUpdated = new Date(cveRecord.cveMetadata.dateUpdated);

      // Create the main CVE record
      const cve = await prisma.cve.create({
        data: {
          cveId: cveRecord.cveMetadata.cveId,
          dataType: cveRecord.dataType,
          dataVersion: cveRecord.dataVersion,
          state: cveRecord.cveMetadata.state,
          assignerOrgId: cveRecord.cveMetadata.assignerOrgId,
          assignerShortName: cveRecord.cveMetadata.assignerShortName,
          dateReserved,
          datePublished,
          dateUpdated,
        },
      });

      // Create descriptions
      if (cveRecord.containers.cna.descriptions?.length > 0) {
        await prisma.cveDescription.createMany({
          data: cveRecord.containers.cna.descriptions.map((desc: any) => ({
            cveId: cve.cveId,
            lang: desc.lang,
            description: desc.value,
          })),
        });
      }

      // Create references
      if (cveRecord.containers.cna.references?.length > 0) {
        await prisma.cveReference.createMany({
          data: cveRecord.containers.cna.references.map((ref: any) => ({
            cveId: cve.cveId,
            url: ref.url,
          })),
        });
      }

      // Create affected products and versions
      if (cveRecord.containers.cna.affected?.length > 0) {
        for (const affected of cveRecord.containers.cna.affected) {
          const affectedProduct = await prisma.cveAffectedProduct.create({
            data: {
              cveId: cve.cveId,
              vendor: affected.vendor,
              product: affected.product,
            },
          });

          if (affected.versions?.length > 0) {
            await prisma.cveVersion.createMany({
              data: affected.versions.map((version: any) => ({
                affectedProductId: affectedProduct.id,
                version: version.version,
                status: version.status,
                lessThan: version.lessThan || null,
                versionType: version.versionType,
              })),
            });
          }
        }
      }

      // Create labels
      if (cveRecord.labels) {
        await prisma.cveLabel.create({
          data: {
            cveId: cve.cveId,
            operatingSystems: cveRecord.labels.operating_systems || [],
            components: cveRecord.labels.components || [],
          },
        });
      }

      // Create metrics (CVSS data)
      if (cveRecord.containers.adp?.length > 0) {
        for (const adp of cveRecord.containers.adp) {
          if (adp.metrics?.length > 0) {
            for (const metric of adp.metrics) {
              if (metric.cvssV3_1) {
                await prisma.cveMetric.create({
                  data: {
                    cveId: cve.cveId,
                    cvssVersion: metric.cvssV3_1.version,
                    baseScore: metric.cvssV3_1.baseScore,
                    baseSeverity: metric.cvssV3_1.baseSeverity,
                    vectorString: metric.cvssV3_1.vectorString,
                    attackVector: metric.cvssV3_1.attackVector,
                    attackComplexity: metric.cvssV3_1.attackComplexity,
                    privilegesRequired: metric.cvssV3_1.privilegesRequired,
                    userInteraction: metric.cvssV3_1.userInteraction,
                    scope: metric.cvssV3_1.scope,
                    confidentialityImpact: metric.cvssV3_1.confidentialityImpact,
                    integrityImpact: metric.cvssV3_1.integrityImpact,
                    availabilityImpact: metric.cvssV3_1.availabilityImpact,
                    metricsJson: metric,
                  },
                });
              }
            }
          }
        }
      }

      // Create problem types
      if (cveRecord.containers.cna.problemTypes?.length > 0) {
        for (const problemType of cveRecord.containers.cna.problemTypes) {
          if (problemType.descriptions?.length > 0) {
            await prisma.cveProblemType.createMany({
              data: problemType.descriptions.map((desc: any) => ({
                cveId: cve.cveId,
                lang: desc.lang,
                description: desc.description,
                type: desc.type || null,
                cweId: desc.cweId || null,
              })),
            });
          }
        }
      }

      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`✅ Processed ${processedCount}/${cveData.total_cves} CVEs...`);
      }
    } catch (error) {
      console.error(`❌ Error processing CVE ${cveId}:`, error);
      // Continue with next CVE
    }
  }

  console.log(`🎉 Successfully seeded ${processedCount} CVEs!`);

  // Now seed attack surface data from attackData.ts
  console.log('🗡️  Seeding attack surface data...');
  
  // Import and seed attack data here if needed
  // For now, we'll just note that this is where it would go
  console.log('📝 Attack surface data seeding can be added later');

  console.log('✨ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });