import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET all exploitation techniques with CVE counts
export async function GET() {
  try {
    const techniques = await prisma.exploitationTechnique.findMany({
      include: {
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
    } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
    }

    // Create the technique
    const technique = await prisma.exploitationTechnique.create({
      data: {
        name,
        description,
        detailedDescription: detailedDescription || '',
        mitigations: Array.isArray(mitigations) ? mitigations : [],
        references: Array.isArray(references) ? references : [],
        contextSpecificImpact: Array.isArray(contextSpecificImpact) ? contextSpecificImpact : [],
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
