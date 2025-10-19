import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET - Fetch single privilege escalation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const escalation = await prisma.privilegeEscalation.findUnique({
      where: { id },
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
    });

    if (!escalation) {
      return NextResponse.json(
        { error: 'Privilege escalation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(escalation);
  } catch (error) {
    console.error('Error fetching privilege escalation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privilege escalation' },
      { status: 500 }
    );
  }
}

// PUT - Update privilege escalation
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      sourcePrivilegeId,
      targetPrivilegeId,
      techniqueId,
      targetComponentId,
      visibleInVisualization,
    } = body;

    // Check if escalation exists
    const existing = await prisma.privilegeEscalation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Privilege escalation not found' },
        { status: 404 }
      );
    }

    // Validate required fields (only validate if provided)
    if (sourcePrivilegeId && targetPrivilegeId && sourcePrivilegeId === targetPrivilegeId) {
      return NextResponse.json(
        { error: 'Source and target privileges must be different' },
        { status: 400 }
      );
    }

    // If privileges are being updated, validate escalation direction
    const finalSourceId = sourcePrivilegeId || existing.sourcePrivilegeId;
    const finalTargetId = targetPrivilegeId || existing.targetPrivilegeId;

    const [sourcePriv, targetPriv] = await Promise.all([
      prisma.privilegeContext.findUnique({ where: { id: finalSourceId } }),
      prisma.privilegeContext.findUnique({ where: { id: finalTargetId } }),
    ]);

    if (!sourcePriv || !targetPriv) {
      return NextResponse.json(
        { error: 'Source or target privilege context not found' },
        { status: 404 }
      );
    }

    if (sourcePriv.order >= targetPriv.order) {
      return NextResponse.json(
        { error: `Invalid escalation direction: ${sourcePriv.level} (order ${sourcePriv.order}) must come before ${targetPriv.level} (order ${targetPriv.order}) in the escalation chain` },
        { status: 400 }
      );
    }

    // Verify technique and component exist if being updated
    if (techniqueId) {
      const technique = await prisma.exploitationTechnique.findUnique({
        where: { id: techniqueId },
      });
      if (!technique) {
        return NextResponse.json(
          { error: 'Exploitation technique not found' },
          { status: 404 }
        );
      }
    }

    if (targetComponentId) {
      const component = await prisma.targetComponent.findUnique({
        where: { id: targetComponentId },
      });
      if (!component) {
        return NextResponse.json(
          { error: 'Target component not found' },
          { status: 404 }
        );
      }
    }

    // Update the privilege escalation
    const updated = await prisma.privilegeEscalation.update({
      where: { id },
      data: {
        ...(sourcePrivilegeId && { sourcePrivilegeId }),
        ...(targetPrivilegeId && { targetPrivilegeId }),
        ...(techniqueId && { techniqueId }),
        ...(targetComponentId && { targetComponentId }),
        ...(visibleInVisualization !== undefined && { visibleInVisualization }),
      },
      include: {
        sourcePrivilege: true,
        targetPrivilege: true,
        technique: true,
        targetComponent: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating privilege escalation:', error);
    return NextResponse.json(
      { error: 'Failed to update privilege escalation' },
      { status: 500 }
    );
  }
}

// DELETE - Delete privilege escalation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if escalation exists
    const existing = await prisma.privilegeEscalation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Privilege escalation not found' },
        { status: 404 }
      );
    }

    // Delete the privilege escalation
    await prisma.privilegeEscalation.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Privilege escalation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting privilege escalation:', error);
    return NextResponse.json(
      { error: 'Failed to delete privilege escalation' },
      { status: 500 }
    );
  }
}
