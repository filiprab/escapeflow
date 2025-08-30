import { prisma } from './client';
import type { CVEFilter } from '@/types/cve';
import type { Prisma } from '@prisma/client';

export interface CVESearchParams extends CVEFilter {
  page?: number;
  limit?: number;
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity';
  sortOrder?: 'asc' | 'desc';
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
  
  // Build where clause
  const where: Prisma.CveWhereInput = {};

  // Search in CVE ID and descriptions
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

  // Filter by operating systems and components
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

  // Filter by severity levels
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
            baseScore: range
          }))
        }
      };
    }
  }

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
/*
export async function createCVE(data: Prisma.CveCreateInput) {
  // Implementation for creating new CVEs
  // This would include validation and proper data transformation
  throw new Error('CVE creation not yet implemented');
}

export async function updateCVE(cveId: string, data: Prisma.CveUpdateInput) {
  // Implementation for updating CVEs
  // This would include validation and proper data transformation
  throw new Error('CVE update not yet implemented');
}
*/
export async function deleteCVE(cveId: string) {
  return prisma.cve.delete({
    where: { cveId },
  });
}