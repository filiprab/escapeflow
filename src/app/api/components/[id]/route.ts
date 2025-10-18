import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { validateComponent } from '@/lib/utils/component-mapping';

// GET single target component
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const component = await prisma.targetComponent.findUnique({
      where: { id },
      include: {
        sourcePrivilege: true,
        targetPrivilege: true,
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Target component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('Error fetching target component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target component' },
      { status: 500 }
    );
  }
}

// PUT - Update target component
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Update the target component
    const updated = await prisma.targetComponent.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating target component:', error);
    return NextResponse.json(
      { error: 'Failed to update target component' },
      { status: 500 }
    );
  }
}

// DELETE target component
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if any exploitation techniques reference this component
    const techniquesCount = await prisma.exploitationTechnique.count({
      where: { targetComponentId: id },
    });

    if (techniquesCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete component: ${techniquesCount} exploitation technique(s) are using it`,
          usageCount: techniquesCount,
        },
        { status: 409 }
      );
    }

    // Get CVE count for warning (but still allow deletion)
    const component = await prisma.targetComponent.findUnique({
      where: { id },
      select: { name: true },
    });

    if (component) {
      const cveCount = await prisma.cveLabel.count({
        where: { targetComponent: component.name },
      });

      // Just log it for awareness, don't block deletion
      if (cveCount > 0) {
        console.warn(`Deleting component "${component.name}" which is referenced by ${cveCount} CVEs`);
      }
    }

    // Delete the target component
    await prisma.targetComponent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting target component:', error);
    return NextResponse.json(
      { error: 'Failed to delete target component' },
      { status: 500 }
    );
  }
}
