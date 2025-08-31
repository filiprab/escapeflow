import { NextRequest, NextResponse } from 'next/server';
import { getCVEById, deleteCVE, updateCVEDescription, updateCVELabels, updateCVEReferences } from '@/lib/database/cve';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cveId: string }> }
) {
  try {
    const { cveId } = await params;
    
    const body = await request.json();
    const { field, data } = body;

    if (!field || !data) {
      return NextResponse.json(
        { error: 'Field and data are required' },
        { status: 400 }
      );
    }

    switch (field) {
      case 'description':
        if (typeof data.description !== 'string') {
          return NextResponse.json(
            { error: 'Description must be a string' },
            { status: 400 }
          );
        }
        await updateCVEDescription(cveId, data.description, data.language || 'en');
        break;
        
      case 'labels':
        if (!Array.isArray(data.operatingSystems) || !Array.isArray(data.components)) {
          return NextResponse.json(
            { error: 'Operating systems and components must be arrays' },
            { status: 400 }
          );
        }
        await updateCVELabels(cveId, data.operatingSystems, data.components);
        break;
        
      case 'references':
        if (!Array.isArray(data.references)) {
          return NextResponse.json(
            { error: 'References must be an array of URLs' },
            { status: 400 }
          );
        }
        
        // Validate URLs
        for (const url of data.references) {
          try {
            new URL(url);
          } catch {
            return NextResponse.json(
              { error: `Invalid URL: ${url}` },
              { status: 400 }
            );
          }
        }
        
        await updateCVEReferences(cveId, data.references);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unsupported field: ${field}` },
          { status: 400 }
        );
    }

    // Return updated CVE data
    const updatedCve = await getCVEById(cveId);
    
    return NextResponse.json({
      success: true,
      message: `CVE ${field} updated successfully`,
      cve: updatedCve
    });

  } catch (error: unknown) {
    console.error('Failed to update CVE:', error);
    
    if (error instanceof Error && error.message.includes('Invalid operating systems')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update CVE data' },
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