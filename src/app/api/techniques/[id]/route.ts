import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET single exploitation technique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const technique = await prisma.exploitationTechnique.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cveLinks: true,
            escalations: true,
          },
        },
      },
    });

    if (!technique) {
      return NextResponse.json(
        { error: 'Exploitation technique not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(technique);
  } catch (error) {
    console.error('Error fetching exploitation technique:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exploitation technique' },
      { status: 500 }
    );
  }
}

// PUT update exploitation technique
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
      detailedDescription,
      mitigations,
      references,
      contextSpecificImpact,
    } = body;

    // Check if technique exists
    const existing = await prisma.exploitationTechnique.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Exploitation technique not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Update the technique
    const updated = await prisma.exploitationTechnique.update({
      where: { id },
      data: {
        name,
        description,
        detailedDescription: detailedDescription || '',
        mitigations: Array.isArray(mitigations) ? mitigations : [],
        references: Array.isArray(references) ? references : [],
        contextSpecificImpact: Array.isArray(contextSpecificImpact) ? contextSpecificImpact : [],
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating exploitation technique:', error);
    return NextResponse.json(
      { error: 'Failed to update exploitation technique' },
      { status: 500 }
    );
  }
}

// DELETE exploitation technique
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if technique exists
    const technique = await prisma.exploitationTechnique.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cveLinks: true,
          },
        },
      },
    });

    if (!technique) {
      return NextResponse.json(
        { error: 'Exploitation technique not found' },
        { status: 404 }
      );
    }

    // Warn if CVE links exist (soft delete - allow deletion)
    if (technique._count.cveLinks > 0) {
      console.warn(
        `Deleting technique "${technique.name}" which is linked to ${technique._count.cveLinks} CVE(s)`
      );
    }

    // Delete the technique (cascading delete will remove CVE links)
    await prisma.exploitationTechnique.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exploitation technique:', error);
    return NextResponse.json(
      { error: 'Failed to delete exploitation technique' },
      { status: 500 }
    );
  }
}
