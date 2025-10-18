import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET single privilege context
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const privilege = await prisma.privilegeContext.findUnique({
      where: { id },
    });

    if (!privilege) {
      return NextResponse.json(
        { error: 'Privilege context not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(privilege);
  } catch (error) {
    console.error('Error fetching privilege context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privilege context' },
      { status: 500 }
    );
  }
}

// PUT - Update privilege context
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      level,
      capabilities,
      restrictions,
      examples,
      color,
      order,
      description,
    } = body;

    // Validate required fields
    if (!level || !Array.isArray(capabilities) || !Array.isArray(restrictions) || !Array.isArray(examples)) {
      return NextResponse.json(
        { error: 'Missing required fields: level, capabilities, restrictions, examples must be provided' },
        { status: 400 }
      );
    }

    // Check if level is being changed and if it conflicts with another privilege context
    const existingWithSameLevel = await prisma.privilegeContext.findFirst({
      where: {
        level,
        id: { not: id },
      },
    });

    if (existingWithSameLevel) {
      return NextResponse.json(
        { error: 'A privilege context with this level already exists' },
        { status: 409 }
      );
    }

    // Update the privilege context
    const updated = await prisma.privilegeContext.update({
      where: { id },
      data: {
        level,
        capabilities,
        restrictions,
        examples,
        color: color || 'gray',
        order: order !== undefined ? order : undefined,
        description: description || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating privilege context:', error);
    return NextResponse.json(
      { error: 'Failed to update privilege context' },
      { status: 500 }
    );
  }
}

// DELETE privilege context
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if any target components reference this privilege context
    const componentsUsingAsSource = await prisma.targetComponent.count({
      where: { sourcePrivilegeId: id },
    });

    const componentsUsingAsTarget = await prisma.targetComponent.count({
      where: { targetPrivilegeId: id },
    });

    const totalUsage = componentsUsingAsSource + componentsUsingAsTarget;

    if (totalUsage > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete privilege context: ${totalUsage} target component(s) are using it`,
          usageCount: totalUsage,
        },
        { status: 409 }
      );
    }

    // Delete the privilege context
    await prisma.privilegeContext.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting privilege context:', error);
    return NextResponse.json(
      { error: 'Failed to delete privilege context' },
      { status: 500 }
    );
  }
}
