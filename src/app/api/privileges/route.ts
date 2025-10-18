import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export interface PrivilegeContext {
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
  color: string;
  description?: string;
}

export async function GET() {
  try {
    // Fetch all privilege contexts from the dedicated table
    const privileges = await prisma.privilegeContext.findMany({
      orderBy: {
        order: 'asc', // Sorted by escalation order
      },
      select: {
        id: true,
        level: true,
        capabilities: true,
        restrictions: true,
        examples: true,
        color: true,
        description: true,
        order: true,
      },
    });

    // Transform the data to match the expected format
    const transformedPrivileges = privileges.map((priv) => ({
      id: priv.id,
      level: priv.level,
      capabilities: priv.capabilities,
      restrictions: priv.restrictions,
      examples: priv.examples,
      color: priv.color,
      description: priv.description,
      order: priv.order,
    }));

    return NextResponse.json({
      privileges: transformedPrivileges,
      total: transformedPrivileges.length,
    });
  } catch (error) {
    console.error('Error fetching privilege contexts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privilege contexts' },
      { status: 500 }
    );
  }
}

// POST - Create new privilege context
export async function POST(request: Request) {
  try {
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

    // Check if level already exists
    const existing = await prisma.privilegeContext.findUnique({
      where: { level },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A privilege context with this level already exists' },
        { status: 409 }
      );
    }

    // If no order specified, set it to max + 1
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await prisma.privilegeContext.aggregate({
        _max: { order: true },
      });
      finalOrder = (maxOrder._max.order ?? 0) + 1;
    }

    // Create the privilege context
    const created = await prisma.privilegeContext.create({
      data: {
        level,
        capabilities,
        restrictions,
        examples,
        color: color || 'gray',
        order: finalOrder,
        description: description || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating privilege context:', error);
    return NextResponse.json(
      { error: 'Failed to create privilege context' },
      { status: 500 }
    );
  }
}
