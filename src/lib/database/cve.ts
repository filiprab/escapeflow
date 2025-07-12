import { prisma } from './client';
import type { CVEFilter } from '@/data/cveTypes';

export interface CVESearchParams extends CVEFilter {
  page?: number;
  limit?: number;
  sortBy?: 'datePublished' | 'dateUpdated' | 'baseScore';
  sortOrder?: 'asc' | 'desc';
}

export async function getCVEs(params: CVESearchParams) {
  const {
    operatingSystems = [],
    components = [],
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'datePublished',
    sortOrder = 'desc',
  } = params;

  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {};

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
      some: {
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
      },
    };
  }

  // Build orderBy clause
  let orderBy: any = {};
  if (sortBy === 'baseScore') {
    orderBy = {
      metrics: {
        _count: 'desc', // CVEs with metrics first
      },
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
      skip,
      take: limit,
    }),
    prisma.cve.count({ where }),
  ]);

  return {
    cves,
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

export async function createCVE(data: any) {
  // Implementation for creating new CVEs
  // This would include validation and proper data transformation
  throw new Error('CVE creation not yet implemented');
}

export async function updateCVE(cveId: string, data: any) {
  // Implementation for updating CVEs
  // This would include validation and proper data transformation
  throw new Error('CVE update not yet implemented');
}

export async function deleteCVE(cveId: string) {
  return prisma.cve.delete({
    where: { cveId },
  });
}