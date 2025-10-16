import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cves/[cveId]/pocs - Get all PoCs for a CVE
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string }> }
) {
  try {
    const { cveId } = await params;
    const decodedCveId = decodeURIComponent(cveId);

    const pocs = await prisma.cveProofOfConcept.findMany({
      where: { cveId: decodedCveId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pocs);
  } catch (error) {
    console.error('Error fetching PoCs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proof of concepts' },
      { status: 500 }
    );
  }
}

// POST /api/cves/[cveId]/pocs - Add a new PoC
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string }> }
) {
  try {
    const { cveId } = await params;
    const decodedCveId = decodeURIComponent(cveId);
    const body = await request.json();

    const { title, url, description, author, code, language } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Must have either URL or code
    if (!url && !code) {
      return NextResponse.json(
        { error: 'Either URL or code is required' },
        { status: 400 }
      );
    }

    // Verify CVE exists
    const cve = await prisma.cve.findUnique({
      where: { cveId: decodedCveId },
    });

    if (!cve) {
      return NextResponse.json(
        { error: 'CVE not found' },
        { status: 404 }
      );
    }

    const poc = await prisma.cveProofOfConcept.create({
      data: {
        cveId: decodedCveId,
        title,
        url,
        description,
        author,
        code,
        language,
      },
    });

    return NextResponse.json(poc, { status: 201 });
  } catch (error) {
    console.error('Error creating PoC:', error);
    return NextResponse.json(
      { error: 'Failed to create proof of concept' },
      { status: 500 }
    );
  }
}
