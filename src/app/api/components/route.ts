import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export interface TargetComponentAPI {
  id: string;
  name: string;
  description: string;
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
    cveCount: number;
  }>;
  cveCount: number;
}

export async function GET() {
  try {
    // Fetch all target components with escalations
    const components = await prisma.targetComponent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
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
            cveLinks: {
              select: {
                cveId: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
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
          escalations: comp.escalations.map(esc => ({
            id: esc.id,
            sourcePrivilege: esc.sourcePrivilege,
            targetPrivilege: esc.targetPrivilege,
            technique: esc.technique,
            cveCount: esc.cveLinks?.length || 0,
          })),
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
    const { name, description } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      );
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
