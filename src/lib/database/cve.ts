import { prisma } from './client';
import type { CVEFilter } from '@/types/cve';
import type { Prisma } from '@prisma/client';

export interface CVESearchParams extends CVEFilter {
  page?: number;
  limit?: number;
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

function buildCveWhereClause({
  operatingSystems = [],
  components = [],
  severityLevels = [],
  search = '',
}: Pick<CVESearchParams, 'operatingSystems' | 'components' | 'severityLevels' | 'search'>): Prisma.CveWhereInput {
  const where: Prisma.CveWhereInput = {};

  if (search) {
    where.OR = [
      {
        cveId: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        descriptions: {
          some: {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      },
    ];
  }

  if (operatingSystems.length > 0 || components.length > 0) {
    where.labels = {
      ...(operatingSystems.length > 0 && {
        operatingSystems: {
          hasSome: operatingSystems,
        },
      }),
      ...(components.length > 0 && {
        components: {
          hasSome: components,
        },
      }),
    };
  }

  if (severityLevels.length > 0) {
    const scoreRanges: { gte?: number; lt?: number }[] = [];

    if (severityLevels.includes('Critical')) {
      scoreRanges.push({ gte: 9.0 });
    }
    if (severityLevels.includes('High')) {
      scoreRanges.push({ gte: 7.0, lt: 9.0 });
    }
    if (severityLevels.includes('Medium')) {
      scoreRanges.push({ gte: 4.0, lt: 7.0 });
    }
    if (severityLevels.includes('Low')) {
      scoreRanges.push({ lt: 4.0 });
    }

    if (scoreRanges.length > 0) {
      where.metrics = {
        some: {
          OR: scoreRanges.map(range => ({
            baseScore: range,
          })),
        },
      };
    }
  }

  return where;
}

function sanitizeCveIds(ids: string[] = []) {
  return Array.from(
    new Set(
      ids
        .map(id => id.trim())
        .filter(id => id.length > 0)
    )
  );
}

export async function getCVEs(params: CVESearchParams) {
  const {
    operatingSystems = [],
    components = [],
    severityLevels = [],
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'datePublished',
    sortOrder = 'desc',
  } = params;

  const skip = (page - 1) * limit;
  
  const where = buildCveWhereClause({ operatingSystems, components, severityLevels, search });

  // Build orderBy clause
  let orderBy: Prisma.CveOrderByWithRelationInput = {};
  if (sortBy === 'baseScore' || sortBy === 'severity') {
    // For severity/baseScore sorting, we need to handle it in application logic
    // since Prisma doesn't easily support ordering by related field values
    orderBy = {
      datePublished: 'desc', // Default ordering, we'll sort by score in application
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  const [cves, total] = await Promise.all([
    prisma.cve.findMany({
      where,
      include: {
        descriptions: true,
        labels: true,
        metrics: true,
        references: true,
        affectedProducts: {
          include: {
            versions: true,
          },
        },
        problemTypes: true,
      },
      orderBy,
      skip: sortBy === 'baseScore' || sortBy === 'severity' ? 0 : skip, // Don't skip if we need to sort by score
      take: sortBy === 'baseScore' || sortBy === 'severity' ? undefined : limit, // Don't limit if we need to sort by score
    }),
    prisma.cve.count({ where }),
  ]);

  let sortedCves = cves;

  // Apply application-level sorting for baseScore/severity
  if (sortBy === 'baseScore' || sortBy === 'severity') {
    sortedCves = cves.sort((a, b) => {
      const scoreA = a.metrics?.[0]?.baseScore || 0;
      const scoreB = b.metrics?.[0]?.baseScore || 0;
      
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });

    // Apply pagination after sorting
    sortedCves = sortedCves.slice(skip, skip + limit);
  }

  return {
    cves: sortedCves,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCVEById(cveId: string) {
  return prisma.cve.findUnique({
    where: { cveId },
    include: {
      descriptions: true,
      references: true,
      affectedProducts: {
        include: {
          versions: true,
        },
      },
      labels: true,
      metrics: true,
      problemTypes: true,
      techniqueLinks: {
        include: {
          technique: {
            include: {
              targetComponent: true,
            },
          },
        },
      },
    },
  });
}

export async function getAllOperatingSystems() {
  const labels = await prisma.cveLabel.findMany({
    select: {
      operatingSystems: true,
    },
  });

  const osSet = new Set<string>();
  labels.forEach((label) => {
    label.operatingSystems.forEach((os) => osSet.add(os));
  });

  return Array.from(osSet).sort();
}

export async function getAllComponents() {
  const labels = await prisma.cveLabel.findMany({
    select: {
      components: true,
    },
  });

  const componentSet = new Set<string>();
  labels.forEach((label) => {
    label.components.forEach((component) => componentSet.add(component));
  });

  return Array.from(componentSet).sort();
}
export async function updateCVEDescription(cveId: string, description: string, language: string = 'en') {
  return prisma.cveDescription.updateMany({
    where: { 
      cveId,
      lang: language 
    },
    data: { 
      description 
    },
  });
}

export async function updateCVELabels(cveId: string, operatingSystems: string[], components: string[]) {
  // Validate operating systems against allowed values
  const allowedOS = ['Android', 'iOS', 'Windows', 'Linux', 'macOS'];
  const invalidOS = operatingSystems.filter(os => !allowedOS.includes(os));
  if (invalidOS.length > 0) {
    throw new Error(`Invalid operating systems: ${invalidOS.join(', ')}. Allowed: ${allowedOS.join(', ')}`);
  }

  return prisma.cveLabel.upsert({
    where: { cveId },
    update: {
      operatingSystems,
      components,
    },
    create: {
      cveId,
      operatingSystems,
      components,
    },
  });
}

export async function updateCVEReferences(cveId: string, references: string[]) {
  // Delete existing references and create new ones
  await prisma.cveReference.deleteMany({
    where: { cveId },
  });

  if (references.length > 0) {
    await prisma.cveReference.createMany({
      data: references.map(url => ({
        cveId,
        url,
      })),
    });
  }

  return prisma.cveReference.findMany({
    where: { cveId },
  });
}

export async function updateCVE(cveId: string, data: Prisma.CveUpdateInput) {
  return prisma.cve.update({
    where: { cveId },
    data,
    include: {
      descriptions: true,
      references: true,
      labels: true,
      metrics: true,
      problemTypes: true,
      affectedProducts: {
        include: {
          versions: true,
        },
      },
    },
  });
}

export interface CreateCVEData {
  cveId: string;
  assignerOrgId: string;
  assignerShortName: string;
  dateReserved: Date;
  datePublished: Date;
  dateUpdated: Date;
  descriptions: Array<{
    lang: string;
    description: string;
  }>;
  references?: Array<{
    url: string;
  }>;
  labels?: {
    operatingSystems: string[];
    components: string[];
  };
  metrics?: Array<{
    baseScore: number;
    baseSeverity: string;
    vectorString: string;
    attackVector: string;
    attackComplexity: string;
    privilegesRequired: string;
    userInteraction: string;
    scope: string;
    confidentialityImpact: string;
    integrityImpact: string;
    availabilityImpact: string;
    cvssVersion: string;
  }>;
  problemTypes?: Array<{
    description: string;
    cweId?: string;
    type?: string;
    lang: string;
  }>;
  affectedProducts?: Array<{
    vendor: string;
    product: string;
    versions: Array<{
      version: string;
      status: string;
      lessThan?: string;
      versionType: string;
    }>;
  }>;
}

export async function createCVE(data: CreateCVEData) {
  // Validate operating systems against allowed values
  const allowedOS = ['Android', 'iOS', 'Windows', 'Linux', 'macOS'];
  if (data.labels?.operatingSystems) {
    const invalidOS = data.labels.operatingSystems.filter(os => !allowedOS.includes(os));
    if (invalidOS.length > 0) {
      throw new Error(`Invalid operating systems: ${invalidOS.join(', ')}. Allowed: ${allowedOS.join(', ')}`);
    }
  }

  // Check if CVE already exists
  const existingCVE = await prisma.cve.findUnique({
    where: { cveId: data.cveId }
  });

  if (existingCVE) {
    throw new Error(`CVE ${data.cveId} already exists`);
  }

  // Create CVE with all related data in a transaction
  return prisma.$transaction(async (tx) => {
    // Create the main CVE record
    await tx.cve.create({
      data: {
        cveId: data.cveId,
        dataType: 'CVE_RECORD',
        dataVersion: '5.1',
        state: 'PUBLISHED',
        assignerOrgId: data.assignerOrgId,
        assignerShortName: data.assignerShortName,
        dateReserved: data.dateReserved,
        datePublished: data.datePublished,
        dateUpdated: data.dateUpdated,
      },
    });

    // Create descriptions
    if (data.descriptions && data.descriptions.length > 0) {
      await tx.cveDescription.createMany({
        data: data.descriptions.map(desc => ({
          cveId: data.cveId,
          lang: desc.lang,
          description: desc.description,
        })),
      });
    }

    // Create references
    if (data.references && data.references.length > 0) {
      await tx.cveReference.createMany({
        data: data.references.map(ref => ({
          cveId: data.cveId,
          url: ref.url,
        })),
      });
    }

    // Create labels
    if (data.labels) {
      await tx.cveLabel.create({
        data: {
          cveId: data.cveId,
          operatingSystems: data.labels.operatingSystems,
          components: data.labels.components,
        },
      });
    }

    // Create metrics
    if (data.metrics && data.metrics.length > 0) {
      await tx.cveMetric.createMany({
        data: data.metrics.map(metric => ({
          cveId: data.cveId,
          baseScore: metric.baseScore,
          baseSeverity: metric.baseSeverity,
          vectorString: metric.vectorString,
          attackVector: metric.attackVector,
          attackComplexity: metric.attackComplexity,
          privilegesRequired: metric.privilegesRequired,
          userInteraction: metric.userInteraction,
          scope: metric.scope,
          confidentialityImpact: metric.confidentialityImpact,
          integrityImpact: metric.integrityImpact,
          availabilityImpact: metric.availabilityImpact,
          cvssVersion: metric.cvssVersion,
        })),
      });
    }

    // Create problem types
    if (data.problemTypes && data.problemTypes.length > 0) {
      await tx.cveProblemType.createMany({
        data: data.problemTypes.map(pt => ({
          cveId: data.cveId,
          description: pt.description,
          cweId: pt.cweId,
          type: pt.type,
          lang: pt.lang,
        })),
      });
    }

    // Return the complete CVE with all relations
    return tx.cve.findUnique({
      where: { cveId: data.cveId },
      include: {
        descriptions: true,
        references: true,
        labels: true,
        metrics: true,
        problemTypes: true,
        affectedProducts: {
          include: {
            versions: true,
          },
        },
      },
    });
  });
}
export async function deleteCVE(cveId: string) {
  return prisma.cve.delete({
    where: { cveId },
  });
}

export async function deleteCVEsByIds(cveIds: string[]) {
  const ids = sanitizeCveIds(cveIds);

  if (ids.length === 0) {
    return { count: 0 };
  }

  return prisma.cve.deleteMany({
    where: {
      cveId: {
        in: ids,
      },
    },
  });
}

export async function deleteCVEsByFilter(
  filter: Pick<CVESearchParams, 'operatingSystems' | 'components' | 'severityLevels' | 'search'>,
  excludeIds: string[] = [],
) {
  const where = buildCveWhereClause(filter);
  const excludes = sanitizeCveIds(excludeIds);

  if (excludes.length > 0) {
    const baseAnd = Array.isArray(where.AND)
      ? [...where.AND]
      : where.AND
      ? [where.AND]
      : [];

    where.AND = [
      ...baseAnd,
      {
        cveId: {
          notIn: excludes,
        },
      },
    ];
  }

  return prisma.cve.deleteMany({
    where,
  });
}
