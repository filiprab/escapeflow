import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  CVEDatabase,
  CVEDescriptionRaw as CVEDescription,
  CVEReferenceRaw as CVEReference,
  CVEVersionRaw as CVEVersion,
  CVEProblemTypeDescriptionRaw as CVEProblemTypeDescription,
  MetricToProcess
} from '../src/types/cve';
import { parseCVSSVector } from '../src/lib/cvss-parser';

const prisma = new PrismaClient();


async function main() {
  console.log('Starting database seed...');

  // Read the existing CVE data
  const cveDataPath = join(process.cwd(), 'prisma', 'cve_details.json');
  const cveDataRaw = readFileSync(cveDataPath, 'utf8');
  const cveData: CVEDatabase = JSON.parse(cveDataRaw);

  console.log(`Processing ${cveData.total_cves} CVEs...`);

  let processedCount = 0;
  const cveEntries = Object.entries(cveData.cve_details);

  for (const [cveId, cveRecord] of cveEntries) {
    try {
      // Handle both NVD API format (with cve.id) and transformed format (with cveMetadata)
      const cveData = (cveRecord as any).cve ? (cveRecord as any).cve : cveRecord;

      // Extract metadata - handle both formats
      let metadata;
      if ((cveRecord as any).cveMetadata) {
        // Transformed CVE.org-like format
        metadata = (cveRecord as any).cveMetadata;
      } else {
        // Raw NVD API format - create metadata from cve object
        metadata = {
          cveId: cveData.id,
          dateReserved: cveData.published,
          datePublished: cveData.published,
          dateUpdated: cveData.lastModified,
          state: 'PUBLISHED',
          assignerOrgId: cveData.sourceIdentifier || 'nvd@nist.gov',
          assignerShortName: 'NVD'
        };
      }

      // Parse dates
      const dateReserved = new Date(metadata.dateReserved);
      const datePublished = new Date(metadata.datePublished);
      const dateUpdated = new Date(metadata.dateUpdated);

      // Create the main CVE record
      const cve = await prisma.cve.create({
        data: {
          cveId: metadata.cveId,
          dataType: (cveRecord as any).dataType || 'CVE_RECORD',
          dataVersion: (cveRecord as any).dataVersion || '5.1',
          state: metadata.state,
          assignerOrgId: metadata.assignerOrgId,
          assignerShortName: metadata.assignerShortName,
          dateReserved,
          datePublished,
          dateUpdated,
        },
      });

      // Create descriptions - handle both formats
      let descriptions: any[] = [];
      if ((cveRecord as any).containers?.cna?.descriptions) {
        // Transformed format
        descriptions = (cveRecord as any).containers.cna.descriptions;
      } else if (cveData.descriptions) {
        // NVD API format
        descriptions = cveData.descriptions;
      }

      if (descriptions && descriptions.length > 0) {
        await prisma.cveDescription.createMany({
          data: descriptions.map((desc: any) => ({
            cveId: cve.cveId,
            lang: desc.lang,
            description: desc.value || desc.description,
          })),
        });
      }

      // Create references - handle both formats
      let references: any[] = [];
      if ((cveRecord as any).containers?.cna?.references) {
        // Transformed format
        references = (cveRecord as any).containers.cna.references;
      } else if (cveData.references) {
        // NVD API format
        references = cveData.references.map((ref: any) => ({ url: ref.url }));
      }

      if (references && references.length > 0) {
        await prisma.cveReference.createMany({
          data: references.map((ref: any) => ({
            cveId: cve.cveId,
            url: ref.url,
          })),
        });
      }

      // Create affected products and versions - handle both formats
      let affected: any[] = [];
      if ((cveRecord as any).containers?.cna?.affected) {
        // Transformed format
        affected = (cveRecord as any).containers.cna.affected;
      }
      // Note: Raw NVD API format doesn't provide affected products in a structured way

      if (affected && affected.length > 0) {
        for (const affectedItem of affected) {
          const affectedProduct = await prisma.cveAffectedProduct.create({
            data: {
              cveId: cve.cveId,
              vendor: affectedItem.vendor,
              product: affectedItem.product,
            },
          });

          if (affectedItem.versions && affectedItem.versions.length > 0) {
            await prisma.cveVersion.createMany({
              data: affectedItem.versions.map((version: CVEVersion) => ({
                affectedProductId: affectedProduct.id,
                version: version.version,
                status: version.status,
                lessThan: version.lessThan || null,
                versionType: version.versionType || 'unknown',
              })),
            });
          }
        }
      }

      // Create labels
      // Note: Source data has been auto-labeled with targetComponent.
      // Run scripts/auto-label-components.ts to relabel if needed.
      if (cveRecord.labels) {
        const targetComponent = cveRecord.labels.targetComponent || null;

        await prisma.cveLabel.create({
          data: {
            cveId: cve.cveId,
            operatingSystems: cveRecord.labels.operating_systems || [],
            targetComponent: targetComponent,
          },
        });
      }

      // Create metrics (CVSS data) - handle both formats
      let metricsToProcess: MetricToProcess[] = [];

      if ((cveRecord as any).containers?.cna?.metrics) {
        // Transformed format - CNA is authoritative
        metricsToProcess = (cveRecord as any).containers.cna.metrics;
      } else if ((cveRecord as any).containers?.adp) {
        // Transformed format - Fall back to ADP only if no CNA metrics exist
        for (const adp of (cveRecord as any).containers.adp) {
          if (adp.metrics && adp.metrics.length > 0) {
            metricsToProcess.push(...adp.metrics);
          }
        }
      } else if (cveData.metrics) {
        // Raw NVD API format - transform metrics
        const metrics = cveData.metrics;
        // Handle CVSS v3.1 metrics
        if (metrics.cvssMetricV31) {
          for (const metric of metrics.cvssMetricV31) {
            if (metric.cvssData) {
              metricsToProcess.push({ cvssV3_1: metric.cvssData } as any);
            }
          }
        }
        // Handle CVSS v3.0 metrics if no v3.1
        if (metricsToProcess.length === 0 && metrics.cvssMetricV30) {
          for (const metric of metrics.cvssMetricV30) {
            if (metric.cvssData) {
              metricsToProcess.push({ cvssV3_0: metric.cvssData } as any);
            }
          }
        }
      }
      
      // Process metrics - support CVSS v3.0, v3.1 and v4.0
      for (const metric of metricsToProcess) {
        if (metric.cvssV3_0) {
          // Parse individual components from vector string if not provided
          const parsedMetrics = parseCVSSVector(metric.cvssV3_0.vectorString);
          
          await prisma.cveMetric.create({
            data: {
              cveId: cve.cveId,
              cvssVersion: metric.cvssV3_0.version,
              baseScore: metric.cvssV3_0.baseScore,
              baseSeverity: metric.cvssV3_0.baseSeverity,
              vectorString: metric.cvssV3_0.vectorString,
              // Use parsed values if individual fields aren't provided in the raw data
              attackVector: metric.cvssV3_0.attackVector || parsedMetrics?.attackVector || null,
              attackComplexity: metric.cvssV3_0.attackComplexity || parsedMetrics?.attackComplexity || null,
              privilegesRequired: metric.cvssV3_0.privilegesRequired || parsedMetrics?.privilegesRequired || null,
              userInteraction: metric.cvssV3_0.userInteraction || parsedMetrics?.userInteraction || null,
              scope: metric.cvssV3_0.scope || parsedMetrics?.scope || null,
              confidentialityImpact: metric.cvssV3_0.confidentialityImpact || parsedMetrics?.confidentialityImpact || null,
              integrityImpact: metric.cvssV3_0.integrityImpact || parsedMetrics?.integrityImpact || null,
              availabilityImpact: metric.cvssV3_0.availabilityImpact || parsedMetrics?.availabilityImpact || null,
              metricsJson: metric as any,
            },
          });
        } else if (metric.cvssV3_1) {
          // Parse individual components from vector string if not provided
          const parsedMetrics = parseCVSSVector(metric.cvssV3_1.vectorString);
          
          await prisma.cveMetric.create({
            data: {
              cveId: cve.cveId,
              cvssVersion: metric.cvssV3_1.version,
              baseScore: metric.cvssV3_1.baseScore,
              baseSeverity: metric.cvssV3_1.baseSeverity,
              vectorString: metric.cvssV3_1.vectorString,
              // Use parsed values if individual fields aren't provided in the raw data
              attackVector: metric.cvssV3_1.attackVector || parsedMetrics?.attackVector || null,
              attackComplexity: metric.cvssV3_1.attackComplexity || parsedMetrics?.attackComplexity || null,
              privilegesRequired: metric.cvssV3_1.privilegesRequired || parsedMetrics?.privilegesRequired || null,
              userInteraction: metric.cvssV3_1.userInteraction || parsedMetrics?.userInteraction || null,
              scope: metric.cvssV3_1.scope || parsedMetrics?.scope || null,
              confidentialityImpact: metric.cvssV3_1.confidentialityImpact || parsedMetrics?.confidentialityImpact || null,
              integrityImpact: metric.cvssV3_1.integrityImpact || parsedMetrics?.integrityImpact || null,
              availabilityImpact: metric.cvssV3_1.availabilityImpact || parsedMetrics?.availabilityImpact || null,
              metricsJson: metric as any,
            },
          });
        } else if (metric.cvssV4_0) {
          await prisma.cveMetric.create({
            data: {
              cveId: cve.cveId,
              cvssVersion: metric.cvssV4_0.version,
              baseScore: metric.cvssV4_0.baseScore,
              baseSeverity: metric.cvssV4_0.baseSeverity,
              vectorString: metric.cvssV4_0.vectorString,
              // Map v4.0 fields to v3.1 compatible fields where possible
              attackVector: metric.cvssV4_0.attackVector || null,
              attackComplexity: metric.cvssV4_0.attackComplexity || null,
              privilegesRequired: metric.cvssV4_0.privilegesRequired || null,
              userInteraction: metric.cvssV4_0.userInteraction || null,
              scope: metric.cvssV4_0.scope || null,
              confidentialityImpact: metric.cvssV4_0.vulnerabilityConfidentialityImpact || null,
              integrityImpact: metric.cvssV4_0.vulnerabilityIntegrityImpact || null,
              availabilityImpact: metric.cvssV4_0.vulnerabilityAvailabilityImpact || null,
              metricsJson: metric as any,
            },
          });
        }
      }

      // Create problem types - handle both formats
      let problemTypes: any[] = [];
      if ((cveRecord as any).containers?.cna?.problemTypes) {
        // Transformed format
        problemTypes = (cveRecord as any).containers.cna.problemTypes;
      }
      // Note: Raw NVD API format stores weaknesses, not problem types

      if (problemTypes && problemTypes.length > 0) {
        for (const problemType of problemTypes) {
          if (problemType.descriptions && problemType.descriptions.length > 0) {
            await prisma.cveProblemType.createMany({
              data: problemType.descriptions.map((desc: CVEProblemTypeDescription) => ({
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
        console.log(`Processed ${processedCount}/${cveData.total_cves} CVEs...`);
      }
    } catch (error) {
      console.error(`Error processing CVE ${cveId}:`, error);
      // Continue with next CVE
    }
  }

  console.log(`Successfully seeded ${processedCount} CVEs!`);

  // Seed privilege contexts
  console.log('Seeding privilege contexts...');

  const privilegeContextsPath = join(process.cwd(), 'prisma', 'privilege-contexts-seed.json');
  const privilegeContextsRaw = readFileSync(privilegeContextsPath, 'utf8');
  const privilegeContexts = JSON.parse(privilegeContextsRaw);

  for (const context of privilegeContexts) {
    await prisma.privilegeContext.upsert({
      where: { id: context.id },
      update: {
        level: context.level,
        capabilities: context.capabilities,
        restrictions: context.restrictions,
        examples: context.examples,
        color: context.color,
        order: context.order,
        description: context.description,
      },
      create: {
        id: context.id,
        level: context.level,
        capabilities: context.capabilities,
        restrictions: context.restrictions,
        examples: context.examples,
        color: context.color,
        order: context.order,
        description: context.description,
      },
    });
  }

  console.log(`Successfully seeded ${privilegeContexts.length} privilege contexts!`);

  // Seed target components
  console.log('Seeding target components...');

  const targetComponentsPath = join(process.cwd(), 'prisma', 'target-components-seed.json');
  const targetComponentsRaw = readFileSync(targetComponentsPath, 'utf8');
  const targetComponents: Array<{
    name: string;
    description: string;
    sourcePrivilegeLevel: string;
    targetPrivilegeLevel: string;
  }> = JSON.parse(targetComponentsRaw);

  // First, clear existing target components to avoid duplicates on re-seed
  await prisma.targetComponent.deleteMany({});

  for (const component of targetComponents) {
    // Find the privilege context IDs by level
    const sourcePrivilege = await prisma.privilegeContext.findUnique({
      where: { level: component.sourcePrivilegeLevel },
    });
    const targetPrivilege = await prisma.privilegeContext.findUnique({
      where: { level: component.targetPrivilegeLevel },
    });

    if (!sourcePrivilege || !targetPrivilege) {
      console.warn(`⚠️  Warning: Could not find privileges for component "${component.name}"`);
      console.warn(`   Source: ${component.sourcePrivilegeLevel}, Target: ${component.targetPrivilegeLevel}`);
      continue;
    }

    await prisma.targetComponent.create({
      data: {
        name: component.name,
        description: component.description,
        sourcePrivilegeId: sourcePrivilege.id,
        targetPrivilegeId: targetPrivilege.id,
      },
    });
  }

  console.log(`Successfully seeded ${targetComponents.length} target components!`);

  // Print summary of components by privilege context
  console.log('\nTarget Components Summary:');
  const componentsByPrivilege = new Map<string, string[]>();
  for (const component of targetComponents) {
    const key = `${component.sourcePrivilegeLevel} → ${component.targetPrivilegeLevel}`;
    if (!componentsByPrivilege.has(key)) {
      componentsByPrivilege.set(key, []);
    }
    componentsByPrivilege.get(key)!.push(component.name);
  }

  for (const [escalation, components] of componentsByPrivilege.entries()) {
    console.log(`  ${escalation}:`);
    components.forEach(name => console.log(`    - ${name}`));
  }

  // Seed exploitation techniques
  console.log('\nSeeding exploitation techniques...');

  const techniquesPath = join(process.cwd(), 'prisma', 'exploitation-techniques-seed.json');
  const techniquesRaw = readFileSync(techniquesPath, 'utf8');
  const techniques: Array<{
    name: string;
    description: string;
    detailedDescription: string;
    mitigations: string[];
    references: string[];
    contextSpecificImpact: string[];
    relevantCVEs?: string[];
  }> = JSON.parse(techniquesRaw);

  // Clear existing techniques to avoid duplicates on re-seed
  await prisma.exploitationTechnique.deleteMany({});

  for (const technique of techniques) {
    await prisma.exploitationTechnique.create({
      data: {
        name: technique.name,
        description: technique.description,
        detailedDescription: technique.detailedDescription,
        mitigations: technique.mitigations,
        references: technique.references,
        contextSpecificImpact: technique.contextSpecificImpact,
      },
    });
  }

  console.log(`Successfully seeded ${techniques.length} exploitation techniques!`);

  // Link CVEs to exploitation techniques
  console.log('\nLinking CVEs to exploitation techniques...');

  let cveLinksCreated = 0;
  let cveLinksSkipped = 0;

  for (const technique of techniques) {
    if (!technique.relevantCVEs || technique.relevantCVEs.length === 0) {
      continue;
    }

    // Find the technique in the database
    const techniqueRecord = await prisma.exploitationTechnique.findFirst({
      where: { name: technique.name },
    });

    if (!techniqueRecord) {
      console.warn(`⚠️  Could not find technique "${technique.name}" in database`);
      continue;
    }

    // Link each CVE to the technique
    for (const cveId of technique.relevantCVEs) {
      try {
        // Check if the CVE exists
        const cveExists = await prisma.cve.findUnique({
          where: { cveId },
        });

        if (!cveExists) {
          console.warn(`⚠️  CVE ${cveId} not found in database, skipping link for technique "${technique.name}"`);
          cveLinksSkipped++;
          continue;
        }

        // Create the link
        await prisma.techniqueCveLink.create({
          data: {
            techniqueId: techniqueRecord.id,
            cveId,
          },
        });

        cveLinksCreated++;
      } catch (error) {
        // Handle duplicate key errors gracefully
        if ((error as any).code === 'P2002') {
          // This CVE is already linked to this technique
          continue;
        }
        console.error(`Error linking CVE ${cveId} to technique "${technique.name}":`, error);
      }
    }
  }

  console.log(`Successfully linked ${cveLinksCreated} CVEs to exploitation techniques!`);
  if (cveLinksSkipped > 0) {
    console.log(`⚠️  Skipped ${cveLinksSkipped} CVE links (CVEs not found in database)`);
  }

  // Seed privilege escalations
  console.log('\nSeeding privilege escalations...');

  const escalationsPath = join(process.cwd(), 'prisma', 'privilege-escalations-seed.json');
  const escalationsRaw = readFileSync(escalationsPath, 'utf8');
  const escalationsData: Array<{
    sourcePrivilegeLevel: string;
    targetPrivilegeLevel: string;
    componentName: string;
    techniqueName: string;
    visibleInVisualization?: boolean;
  }> = JSON.parse(escalationsRaw);

  // Clear existing escalations to avoid duplicates on re-seed
  await prisma.privilegeEscalation.deleteMany({});

  let escalationsCreated = 0;
  for (const escalation of escalationsData) {
    // Find the IDs we need
    const sourcePrivilege = await prisma.privilegeContext.findFirst({
      where: { level: escalation.sourcePrivilegeLevel },
    });
    const targetPrivilege = await prisma.privilegeContext.findFirst({
      where: { level: escalation.targetPrivilegeLevel },
    });
    const component = await prisma.targetComponent.findFirst({
      where: { name: escalation.componentName },
    });
    const technique = await prisma.exploitationTechnique.findFirst({
      where: { name: escalation.techniqueName },
    });

    if (!sourcePrivilege) {
      console.warn(`⚠️  Skipping escalation: source privilege "${escalation.sourcePrivilegeLevel}" not found`);
      continue;
    }
    if (!targetPrivilege) {
      console.warn(`⚠️  Skipping escalation: target privilege "${escalation.targetPrivilegeLevel}" not found`);
      continue;
    }
    if (!component) {
      console.warn(`⚠️  Skipping escalation: component "${escalation.componentName}" not found`);
      continue;
    }
    if (!technique) {
      console.warn(`⚠️  Skipping escalation: technique "${escalation.techniqueName}" not found`);
      continue;
    }

    await prisma.privilegeEscalation.create({
      data: {
        sourcePrivilegeId: sourcePrivilege.id,
        targetPrivilegeId: targetPrivilege.id,
        techniqueId: technique.id,
        targetComponentId: component.id,
        visibleInVisualization: escalation.visibleInVisualization ?? true,
      },
    });
    escalationsCreated++;
  }

  console.log(`Successfully seeded ${escalationsCreated} privilege escalations!`);

  // Print escalation summary
  console.log('\nPrivilege Escalations Summary:');
  const escalationsByPath = new Map<string, Array<{ component: string; technique: string }>>();

  for (const escalation of escalationsData) {
    const key = `${escalation.sourcePrivilegeLevel} → ${escalation.targetPrivilegeLevel}`;
    if (!escalationsByPath.has(key)) {
      escalationsByPath.set(key, []);
    }
    escalationsByPath.get(key)!.push({
      component: escalation.componentName,
      technique: escalation.techniqueName,
    });
  }

  for (const [path, escalations] of escalationsByPath.entries()) {
    console.log(`  ${path}:`);
    escalations.forEach(({ component, technique }) =>
      console.log(`    - ${component} via ${technique}`)
    );
  }

  // Link CVEs to specific escalations
  console.log('\nLinking CVEs to privilege escalations...');

  const escalationCveLinksPath = join(process.cwd(), 'prisma', 'escalation-cve-links-seed.json');
  let escalationCveLinksData: Array<{
    componentName: string;
    techniqueName: string;
    sourceLevel: string;
    targetLevel: string;
    cveIds: string[];
  }> = [];

  try {
    const escalationCveLinksRaw = readFileSync(escalationCveLinksPath, 'utf8');
    escalationCveLinksData = JSON.parse(escalationCveLinksRaw);
  } catch (error) {
    console.warn('⚠️  escalation-cve-links-seed.json not found, skipping escalation CVE links');
  }

  let escalationCveLinksCreated = 0;
  let escalationCveLinksSkipped = 0;

  for (const link of escalationCveLinksData) {
    // Find the specific escalation
    const escalation = await prisma.privilegeEscalation.findFirst({
      where: {
        targetComponent: {
          name: link.componentName,
        },
        technique: {
          name: link.techniqueName,
        },
        sourcePrivilege: {
          level: link.sourceLevel,
        },
        targetPrivilege: {
          level: link.targetLevel,
        },
      },
    });

    if (!escalation) {
      console.warn(
        `⚠️  Escalation not found: ${link.componentName} (${link.sourceLevel} → ${link.targetLevel}) via ${link.techniqueName}`
      );
      continue;
    }

    // Link each CVE to the escalation
    if (link.cveIds && link.cveIds.length > 0) {
      for (const cveId of link.cveIds) {
        try {
          // Check if the CVE exists
          const cveExists = await prisma.cve.findUnique({
            where: { cveId },
          });

          if (!cveExists) {
            console.warn(
              `⚠️  CVE ${cveId} not found in database, skipping link for escalation ${link.componentName}`
            );
            escalationCveLinksSkipped++;
            continue;
          }

          // Create the link
          await prisma.escalationCveLink.create({
            data: {
              escalationId: escalation.id,
              cveId,
            },
          });

          escalationCveLinksCreated++;
        } catch (error) {
          // Handle duplicate key errors gracefully
          if ((error as any).code === 'P2002') {
            // This CVE is already linked to this escalation
            continue;
          }
          console.error(
            `Error linking CVE ${cveId} to escalation ${link.componentName}:`,
            error
          );
        }
      }
    }
  }

  console.log(`Successfully linked ${escalationCveLinksCreated} CVEs to privilege escalations!`);
  if (escalationCveLinksSkipped > 0) {
    console.log(`⚠️  Skipped ${escalationCveLinksSkipped} escalation CVE links (CVEs not found in database)`);
  }

  // Seed system metadata
  console.log('\nSeeding system metadata...');

  // Set initial last bulk update time to 2025-10-25T16:00:17.532953Z
  await prisma.systemMetadata.upsert({
    where: { key: 'cve_last_bulk_update' },
    update: { value: '2025-10-25T16:00:17.532953Z' },
    create: {
      key: 'cve_last_bulk_update',
      value: '2025-10-25T16:00:17.532953Z',
    },
  });

  // Set bulk update not in progress
  await prisma.systemMetadata.upsert({
    where: { key: 'cve_bulk_update_in_progress' },
    update: { value: 'false' },
    create: {
      key: 'cve_bulk_update_in_progress',
      value: 'false',
    },
  });

  console.log('Successfully seeded system metadata!');

  console.log('\nDatabase seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });