import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

// GET all CVEs linked to a technique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch technique with linked CVEs
    const technique = await prisma.exploitationTechnique.findUnique({
      where: { id },
      include: {
        cveLinks: {
          include: {
            cve: {
              include: {
                proofOfConcepts: true,
                descriptions: true,
                metrics: {
                  take: 1,
                  orderBy: {
                    baseScore: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!technique) {
      return NextResponse.json(
        { error: 'Technique not found' },
        { status: 404 }
      );
    }

    // Transform to include CVE details
    const linkedCves = technique.cveLinks.map(link => ({
      linkId: link.id,
      cveId: link.cve.cveId,
      state: link.cve.state,
      datePublished: link.cve.datePublished,
      description: link.cve.descriptions[0]?.description || '',
      baseScore: link.cve.metrics[0]?.baseScore || null,
      baseSeverity: link.cve.metrics[0]?.baseSeverity || null,
      pocCount: link.cve.proofOfConcepts.length,
      proofOfConcepts: link.cve.proofOfConcepts.map(poc => ({
        id: poc.id,
        title: poc.title,
        url: poc.url,
        author: poc.author,
        description: poc.description,
      })),
    }));

    return NextResponse.json(linkedCves);
  } catch (error) {
    console.error('Error fetching technique CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technique CVEs' },
      { status: 500 }
    );
  }
}

// POST link a CVE to a technique
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: techniqueId } = await params;
    const { cveId } = await request.json();

    if (!cveId) {
      return NextResponse.json(
        { error: 'Missing required field: cveId' },
        { status: 400 }
      );
    }

    // Validate technique exists
    const technique = await prisma.exploitationTechnique.findUnique({
      where: { id: techniqueId },
    });

    if (!technique) {
      return NextResponse.json(
        { error: 'Technique not found' },
        { status: 404 }
      );
    }

    // Validate CVE exists (by cveId string, not database ID)
    const cve = await prisma.cve.findUnique({
      where: { cveId },
    });

    if (!cve) {
      return NextResponse.json(
        { error: `CVE ${cveId} not found in database` },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.techniqueCveLink.findUnique({
      where: {
        techniqueId_cveId: {
          techniqueId,
          cveId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'CVE is already linked to this technique' },
        { status: 400 }
      );
    }

    // Create the link
    const link = await prisma.techniqueCveLink.create({
      data: {
        techniqueId,
        cveId,
      },
      include: {
        cve: {
          include: {
            proofOfConcepts: true,
            descriptions: true,
            metrics: {
              take: 1,
              orderBy: {
                baseScore: 'desc',
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      linkId: link.id,
      cveId: link.cve.cveId,
      state: link.cve.state,
      datePublished: link.cve.datePublished,
      description: link.cve.descriptions[0]?.description || '',
      baseScore: link.cve.metrics[0]?.baseScore || null,
      baseSeverity: link.cve.metrics[0]?.baseSeverity || null,
      pocCount: link.cve.proofOfConcepts.length,
      proofOfConcepts: link.cve.proofOfConcepts.map(poc => ({
        id: poc.id,
        title: poc.title,
        url: poc.url,
        author: poc.author,
        description: poc.description,
      })),
    }, { status: 201 });
  } catch (error) {
    console.error('Error linking CVE to technique:', error);
    return NextResponse.json(
      { error: 'Failed to link CVE to technique' },
      { status: 500 }
    );
  }
}

// DELETE unlink a CVE from a technique
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: techniqueId } = await params;
    const { searchParams } = new URL(request.url);
    const cveId = searchParams.get('cveId');

    if (!cveId) {
      return NextResponse.json(
        { error: 'Missing required parameter: cveId' },
        { status: 400 }
      );
    }

    // Check if link exists
    const link = await prisma.techniqueCveLink.findUnique({
      where: {
        techniqueId_cveId: {
          techniqueId,
          cveId,
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'CVE link not found' },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.techniqueCveLink.delete({
      where: {
        techniqueId_cveId: {
          techniqueId,
          cveId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking CVE from technique:', error);
    return NextResponse.json(
      { error: 'Failed to unlink CVE from technique' },
      { status: 500 }
    );
  }
}
