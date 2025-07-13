import { NextRequest, NextResponse } from 'next/server';
import { getCVEById, deleteCVE } from '@/lib/database/cve';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string }> }
) {
  try {
    const { cveId } = await params;
    const cve = await getCVEById(cveId);
    
    if (!cve) {
      return NextResponse.json(
        { error: 'CVE not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(cve);
  } catch (error) {
    console.error('Error fetching CVE:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVE' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string }> }
) {
  try {
    const { cveId } = await params;
    await deleteCVE(cveId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CVE:', error);
    return NextResponse.json(
      { error: 'Failed to delete CVE' },
      { status: 500 }
    );
  }
}