import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PATCH /api/cves/[cveId]/pocs/[pocId] - Update a PoC
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string; pocId: string }> }
) {
  try {
    const { pocId } = await params;
    const body = await request.json();

    const { title, url, description, author, code, language } = body;

    const poc = await prisma.cveProofOfConcept.update({
      where: { id: pocId },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(description !== undefined && { description }),
        ...(author !== undefined && { author }),
        ...(code !== undefined && { code }),
        ...(language !== undefined && { language }),
      },
    });

    return NextResponse.json(poc);
  } catch (error) {
    console.error('Error updating PoC:', error);
    return NextResponse.json(
      { error: 'Failed to update proof of concept' },
      { status: 500 }
    );
  }
}

// DELETE /api/cves/[cveId]/pocs/[pocId] - Delete a PoC
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string; pocId: string }> }
) {
  try {
    const { pocId } = await params;

    await prisma.cveProofOfConcept.delete({
      where: { id: pocId },
    });

    return NextResponse.json({ message: 'Proof of concept deleted successfully' });
  } catch (error) {
    console.error('Error deleting PoC:', error);
    return NextResponse.json(
      { error: 'Failed to delete proof of concept' },
      { status: 500 }
    );
  }
}
