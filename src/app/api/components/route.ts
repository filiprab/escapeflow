import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { validateComponent } from '@/lib/utils/component-mapping';

export interface TargetComponentAPI {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: {
    level: string;
    color: string;
    order: number;
  };
  targetPrivilege: {
    level: string;
    color: string;
    order: number;
  };
  cveCount: number;
}

export async function GET() {
  try {
    // Fetch all target components with privilege context info
    const components = await prisma.targetComponent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sourcePrivilege: {
          select: {
            level: true,
            color: true,
            order: true,
          },
        },
        targetPrivilege: {
          select: {
            level: true,
            color: true,
            order: true,
          },
        },
      },
      orderBy: {
        sourcePrivilege: {
          order: 'asc', // Sort by escalation order
        },
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
          sourcePrivilege: {
            level: comp.sourcePrivilege.level,
            color: comp.sourcePrivilege.color,
            order: comp.sourcePrivilege.order,
          },
          targetPrivilege: {
            level: comp.targetPrivilege.level,
            color: comp.targetPrivilege.color,
            order: comp.targetPrivilege.order,
          },
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
    if (!name || !description || !sourcePrivilegeId || !targetPrivilegeId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, sourcePrivilegeId, targetPrivilegeId' },
        { status: 400 }
      );
    }

    // Validate that name is from canonical list
    try {
      validateComponent(name);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid component name' },
        { status: 400 }
      );
    }

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

    // Check if this exact escalation path already exists
    const existing = await prisma.targetComponent.findFirst({
      where: {
        name,
        sourcePrivilegeId,
        targetPrivilegeId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A component with this name and privilege escalation already exists' },
        { status: 409 }
      );
    }

    // Create the target component
    const created = await prisma.targetComponent.create({
      data: {
        name,
        description,
        sourcePrivilegeId,
        targetPrivilegeId,
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
