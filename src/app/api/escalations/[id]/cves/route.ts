import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

/**
 * GET /api/escalations/[id]/cves
 *
 * Get all CVEs linked to a specific escalation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: escalationId } = await params;

    // Verify escalation exists
    const escalation = await prisma.privilegeEscalation.findUnique({
      where: { id: escalationId },
      include: {
        sourcePrivilege: true,
        targetPrivilege: true,
        technique: true,
        targetComponent: true,
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { error: 'Escalation not found' },
        { status: 404 }
      );
    }

    // Get all CVEs linked to this escalation
    const cveLinks = await prisma.escalationCveLink.findMany({
      where: { escalationId },
      include: {
        cve: {
          include: {
            descriptions: true,
            metrics: true,
            labels: true,
          },
        },
      },
      orderBy: {
        cve: {
          datePublished: 'desc',
        },
      },
    });

    return NextResponse.json({
      escalation: {
        id: escalation.id,
        sourcePrivilege: escalation.sourcePrivilege.level,
        targetPrivilege: escalation.targetPrivilege.level,
        technique: escalation.technique.name,
        targetComponent: escalation.targetComponent.name,
      },
      cves: cveLinks.map(link => link.cve),
      total: cveLinks.length,
    });
  } catch (error) {
    console.error('Error fetching escalation CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escalation CVEs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/escalations/[id]/cves
 *
 * Link a CVE to an escalation
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: escalationId } = await params;
    const body = await request.json();
    const { cveId } = body;

    if (!cveId) {
      return NextResponse.json(
        { error: 'Missing required field: cveId' },
        { status: 400 }
      );
    }

    // Verify escalation exists
    const escalation = await prisma.privilegeEscalation.findUnique({
      where: { id: escalationId },
    });

    if (!escalation) {
      return NextResponse.json(
        { error: 'Escalation not found' },
        { status: 404 }
      );
    }

    // Verify CVE exists
    const cve = await prisma.cve.findUnique({
      where: { cveId },
    });

    if (!cve) {
      return NextResponse.json(
        { error: 'CVE not found' },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.escalationCveLink.findUnique({
      where: {
        escalationId_cveId: {
          escalationId,
          cveId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'CVE is already linked to this escalation' },
        { status: 409 }
      );
    }

    // Create the link
    const link = await prisma.escalationCveLink.create({
      data: {
        escalationId,
        cveId,
      },
      include: {
        cve: {
          include: {
            descriptions: true,
            metrics: true,
          },
        },
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error linking CVE to escalation:', error);
    return NextResponse.json(
      { error: 'Failed to link CVE to escalation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/escalations/[id]/cves
 *
 * Unlink a CVE from an escalation
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: escalationId } = await params;
    const { searchParams } = new URL(request.url);
    const cveId = searchParams.get('cveId');

    if (!cveId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: cveId' },
        { status: 400 }
      );
    }

    // Find and delete the link
    const link = await prisma.escalationCveLink.findUnique({
      where: {
        escalationId_cveId: {
          escalationId,
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

    await prisma.escalationCveLink.delete({
      where: {
        id: link.id,
      },
    });

    return NextResponse.json(
      { message: 'CVE unlinked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unlinking CVE from escalation:', error);
    return NextResponse.json(
      { error: 'Failed to unlink CVE from escalation' },
      { status: 500 }
    );
  }
}
