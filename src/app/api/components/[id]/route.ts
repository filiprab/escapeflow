import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET single target component
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const component = await prisma.targetComponent.findUnique({
      where: { id },
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
    const { name, description } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Update the target component
    const updated = await prisma.targetComponent.update({
      where: { id },
      data: {
        name,
        description,
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

    // Check if any escalations reference this component
    const escalationsCount = await prisma.privilegeEscalation.count({
      where: { targetComponentId: id },
    });

    if (escalationsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete component: ${escalationsCount} escalation path(s) are using it`,
          usageCount: escalationsCount,
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
