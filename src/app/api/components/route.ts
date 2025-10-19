import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export interface TargetComponentAPI {
  id: string;
  name: string;
  description: string;
  sourcePrivilege?: {
    id: string;
    level: string;
    color: string;
    order: number;
  } | null;
  targetPrivilege?: {
    id: string;
    level: string;
    color: string;
    order: number;
  } | null;
  escalations?: Array<{
    id: string;
    sourcePrivilege: {
      id: string;
      level: string;
      color: string;
      order: number;
    };
    targetPrivilege: {
      id: string;
      level: string;
      color: string;
      order: number;
    };
    technique: {
      id: string;
      name: string;
      description: string;
    };
  }>;
  cveCount: number;
}

export async function GET() {
  try {
    // Fetch all target components with privilege context info and escalations
    const components = await prisma.targetComponent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sourcePrivilege: {
          select: {
            id: true,
            level: true,
            color: true,
            order: true,
          },
        },
        targetPrivilege: {
          select: {
            id: true,
            level: true,
            color: true,
            order: true,
          },
        },
        escalations: {
          select: {
            id: true,
            sourcePrivilege: {
              select: {
                id: true,
                level: true,
                color: true,
                order: true,
              },
            },
            targetPrivilege: {
              select: {
                id: true,
                level: true,
                color: true,
                order: true,
              },
            },
            technique: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date since privileges are optional now
      },
    });

    // Count CVEs for each component by matching targetComponent string field
    const transformedComponents: TargetComponentAPI[] = await Promise.all(
      components.map(async (comp) => {
        const cveCount = await prisma.cveLabel.count({
          where: {
            targetComponent: comp.name,
          },
        });

        return {
          id: comp.id,
          name: comp.name,
          description: comp.description,
          sourcePrivilege: comp.sourcePrivilege ? {
            id: comp.sourcePrivilege.id,
            level: comp.sourcePrivilege.level,
            color: comp.sourcePrivilege.color,
            order: comp.sourcePrivilege.order,
          } : null,
          targetPrivilege: comp.targetPrivilege ? {
            id: comp.targetPrivilege.id,
            level: comp.targetPrivilege.level,
            color: comp.targetPrivilege.color,
            order: comp.targetPrivilege.order,
          } : null,
          escalations: comp.escalations,
          cveCount,
        };
      })
    );

    return NextResponse.json({
      components: transformedComponents,
      total: transformedComponents.length,
    });
  } catch (error) {
    console.error('Error fetching target components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target components' },
      { status: 500 }
    );
  }
}

// POST - Create new target component
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      sourcePrivilegeId,
      targetPrivilegeId,
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Optional: Validate privileges if provided
    if (sourcePrivilegeId && targetPrivilegeId) {
      // Validate that source and target are different
      if (sourcePrivilegeId === targetPrivilegeId) {
        return NextResponse.json(
          { error: 'Source and target privileges must be different' },
          { status: 400 }
        );
      }

      // Fetch privileges to validate order
      const [sourcePriv, targetPriv] = await Promise.all([
        prisma.privilegeContext.findUnique({ where: { id: sourcePrivilegeId } }),
        prisma.privilegeContext.findUnique({ where: { id: targetPrivilegeId } }),
      ]);

      if (!sourcePriv || !targetPriv) {
        return NextResponse.json(
          { error: 'Source or target privilege context not found' },
          { status: 404 }
        );
      }

      // Validate escalation direction (source must come before target)
      if (sourcePriv.order >= targetPriv.order) {
        return NextResponse.json(
          { error: `Invalid escalation direction: ${sourcePriv.level} (order ${sourcePriv.order}) must come before ${targetPriv.level} (order ${targetPriv.order}) in the escalation chain` },
          { status: 400 }
        );
      }
    }

    // Check if a component with this name already exists
    const existing = await prisma.targetComponent.findFirst({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A component with this name already exists' },
        { status: 409 }
      );
    }

    // Create the target component
    const created = await prisma.targetComponent.create({
      data: {
        name,
        description,
        ...(sourcePrivilegeId && { sourcePrivilegeId }),
        ...(targetPrivilegeId && { targetPrivilegeId }),
      },
      include: {
        sourcePrivilege: true,
        targetPrivilege: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating target component:', error);
    return NextResponse.json(
      { error: 'Failed to create target component' },
      { status: 500 }
    );
  }
}
