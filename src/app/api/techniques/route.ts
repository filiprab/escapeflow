import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET all exploitation techniques with target component info and CVE counts
export async function GET() {
  try {
    const techniques = await prisma.exploitationTechnique.findMany({
      include: {
        targetComponent: {
          include: {
            sourcePrivilege: true,
            targetPrivilege: true,
          },
        },
        _count: {
          select: {
            cveLinks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include CVE count
    const transformed = techniques.map(technique => ({
      id: technique.id,
      name: technique.name,
      description: technique.description,
      detailedDescription: technique.detailedDescription,
      mitigations: technique.mitigations,
      references: technique.references,
      contextSpecificImpact: technique.contextSpecificImpact,
      targetComponentId: technique.targetComponentId,
      targetComponent: {
        id: technique.targetComponent.id,
        name: technique.targetComponent.name,
        description: technique.targetComponent.description,
        sourcePrivilege: {
          id: technique.targetComponent.sourcePrivilege.id,
          level: technique.targetComponent.sourcePrivilege.level,
          color: technique.targetComponent.sourcePrivilege.color,
          order: technique.targetComponent.sourcePrivilege.order,
        },
        targetPrivilege: {
          id: technique.targetComponent.targetPrivilege.id,
          level: technique.targetComponent.targetPrivilege.level,
          color: technique.targetComponent.targetPrivilege.color,
          order: technique.targetComponent.targetPrivilege.order,
        },
      },
      cveCount: technique._count.cveLinks,
      createdAt: technique.createdAt,
      updatedAt: technique.updatedAt,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching exploitation techniques:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exploitation techniques' },
      { status: 500 }
    );
  }
}

// POST create new exploitation technique
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      detailedDescription,
      mitigations,
      references,
      contextSpecificImpact,
      targetComponentId,
    } = body;

    // Validate required fields
    if (!name || !description || !targetComponentId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, targetComponentId' },
        { status: 400 }
      );
    }

    // Validate that target component exists
    const targetComponent = await prisma.targetComponent.findUnique({
      where: { id: targetComponentId },
    });

    if (!targetComponent) {
      return NextResponse.json(
        { error: `Target component with ID "${targetComponentId}" not found` },
        { status: 404 }
      );
    }

    // Create the technique
    const technique = await prisma.exploitationTechnique.create({
      data: {
        name,
        description,
        detailedDescription: detailedDescription || '',
        pocs: [], // Empty array - PoCs come from linked CVEs
        mitigations: Array.isArray(mitigations) ? mitigations : [],
        references: Array.isArray(references) ? references : [],
        contextSpecificImpact: Array.isArray(contextSpecificImpact) ? contextSpecificImpact : [],
        targetComponentId,
      },
      include: {
        targetComponent: {
          include: {
            sourcePrivilege: true,
            targetPrivilege: true,
          },
        },
      },
    });

    return NextResponse.json(technique, { status: 201 });
  } catch (error) {
    console.error('Error creating exploitation technique:', error);
    return NextResponse.json(
      { error: 'Failed to create exploitation technique' },
      { status: 500 }
    );
  }
}
