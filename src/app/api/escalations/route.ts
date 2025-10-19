import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export interface PrivilegeEscalationAPI {
  id: string;
  sourcePrivilege: {
    id: string;
    level: string;
    color: string;
    order: number;
    capabilities: string[];
    restrictions: string[];
    examples: string[];
  };
  targetPrivilege: {
    id: string;
    level: string;
    color: string;
    order: number;
    capabilities: string[];
    restrictions: string[];
    examples: string[];
  };
  technique: {
    id: string;
    name: string;
    description: string;
    detailedDescription: string;
  };
  targetComponent: {
    id: string;
    name: string;
    description: string;
  };
  visibleInVisualization: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');
    const techniqueId = searchParams.get('techniqueId');
    const visibleOnly = searchParams.get('visibleOnly') === 'true';

    // Build query filters
    const where: {
      targetComponentId?: string;
      techniqueId?: string;
      visibleInVisualization?: boolean;
    } = {};

    if (componentId) {
      where.targetComponentId = componentId;
    }
    if (techniqueId) {
      where.techniqueId = techniqueId;
    }
    if (visibleOnly) {
      where.visibleInVisualization = true;
    }

    // Fetch escalations with all related data
    const escalations = await prisma.privilegeEscalation.findMany({
      where,
      include: {
        sourcePrivilege: {
          select: {
            id: true,
            level: true,
            color: true,
            order: true,
            capabilities: true,
            restrictions: true,
            examples: true,
          },
        },
        targetPrivilege: {
          select: {
            id: true,
            level: true,
            color: true,
            order: true,
            capabilities: true,
            restrictions: true,
            examples: true,
          },
        },
        technique: {
          select: {
            id: true,
            name: true,
            description: true,
            detailedDescription: true,
            mitigations: true,
            references: true,
            contextSpecificImpact: true,
          },
        },
        targetComponent: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        sourcePrivilege: {
          order: 'asc',
        },
      },
    });

    return NextResponse.json({
      escalations,
      total: escalations.length,
    });
  } catch (error) {
    console.error('Error fetching privilege escalations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privilege escalations' },
      { status: 500 }
    );
  }
}

// POST - Create new privilege escalation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sourcePrivilegeId,
      targetPrivilegeId,
      techniqueId,
      targetComponentId,
      visibleInVisualization = true,
    } = body;

    // Validate required fields
    if (!sourcePrivilegeId || !targetPrivilegeId || !techniqueId || !targetComponentId) {
      return NextResponse.json(
        { error: 'Missing required fields: sourcePrivilegeId, targetPrivilegeId, techniqueId, targetComponentId' },
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

    // Verify technique and component exist
    const [technique, component] = await Promise.all([
      prisma.exploitationTechnique.findUnique({ where: { id: techniqueId } }),
      prisma.targetComponent.findUnique({ where: { id: targetComponentId } }),
    ]);

    if (!technique) {
      return NextResponse.json(
        { error: 'Exploitation technique not found' },
        { status: 404 }
      );
    }

    if (!component) {
      return NextResponse.json(
        { error: 'Target component not found' },
        { status: 404 }
      );
    }

    // Check if this exact escalation already exists
    const existing = await prisma.privilegeEscalation.findFirst({
      where: {
        sourcePrivilegeId,
        targetPrivilegeId,
        techniqueId,
        targetComponentId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This privilege escalation already exists' },
        { status: 409 }
      );
    }

    // Create the privilege escalation
    const created = await prisma.privilegeEscalation.create({
      data: {
        sourcePrivilegeId,
        targetPrivilegeId,
        techniqueId,
        targetComponentId,
        visibleInVisualization,
      },
      include: {
        sourcePrivilege: true,
        targetPrivilege: true,
        technique: true,
        targetComponent: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating privilege escalation:', error);
    return NextResponse.json(
      { error: 'Failed to create privilege escalation' },
      { status: 500 }
    );
  }
}
