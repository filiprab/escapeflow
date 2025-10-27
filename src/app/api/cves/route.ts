import { NextRequest, NextResponse } from 'next/server';
import { getCVEs, getAllOperatingSystems, getAllComponents, createCVE, CreateCVEData } from '@/lib/database/cve';
import { fetchFromNVD, validateCVEId } from '@/lib/api/external-cve';
import { transformExternalCVEData, createDefaultCVEData } from '@/lib/utils/cve-transform';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if requesting filter options
    if (searchParams.get('type') === 'filters') {
      const [operatingSystems, components] = await Promise.all([
        getAllOperatingSystems(),
        getAllComponents(),
      ]);
      
      return NextResponse.json({
        operatingSystems,
        components,
        severityLevels: ['Critical', 'High', 'Medium', 'Low'],
      });
    }

    // Parse query parameters
    const params = {
      search: searchParams.get('search') || '',
      operatingSystems: searchParams.getAll('os'),
      components: searchParams.getAll('component'),
      severityLevels: searchParams.getAll('severity'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: (searchParams.get('sortBy') as 'datePublished' | 'dateUpdated' | 'baseScore' | 'cveId' | 'severity') || 'datePublished',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await getCVEs(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVEs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cveId, source, cveData } = body;

    if (!cveId) {
      return NextResponse.json(
        { error: 'CVE ID is required' },
        { status: 400 }
      );
    }

    // Validate CVE ID format
    if (!validateCVEId(cveId)) {
      return NextResponse.json(
        { error: `Invalid CVE ID format: ${cveId}. Expected format: CVE-YYYY-NNNN` },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!cveData || !cveData.descriptions || cveData.descriptions.length === 0 || !cveData.descriptions[0].description) {
      return NextResponse.json(
        { error: 'At least one description is required' },
        { status: 400 }
      );
    }

    let createData: CreateCVEData;

    // Always use NVD as the source for fetching external data
    if (source === 'NVD') {
      try {
        // Fetch data from NVD
        const externalData = await fetchFromNVD(cveId);

        // Transform external data
        const baseData = transformExternalCVEData(externalData, body.additionalLabels);

        // Transform references from cveData if they exist (string[] to {url: string}[])
        let transformedReferences = baseData.references;
        if (cveData?.references && Array.isArray(cveData.references)) {
          transformedReferences = cveData.references
            .filter((ref: unknown) => ref && typeof ref === 'string' && (ref as string).trim())
            .map((ref: unknown) => ({ url: (ref as string).trim() }));
        }

        // Merge with provided overrides, ensuring references are properly formatted
        createData = {
          ...baseData,
          ...(cveData || {}),
          references: transformedReferences, // Use transformed references
          cveId, // Always preserve the CVE ID
        };
      } catch (error) {
        console.error('Failed to fetch from NVD:', error);
        return NextResponse.json(
          { error: `Failed to fetch base data from NVD: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else {
      // No external source provided, use manual approach with defaults
      const defaultData = createDefaultCVEData(cveId);

      // Transform references from string[] to {url: string}[] if needed
      let transformedReferences = undefined;
      if (cveData.references && Array.isArray(cveData.references)) {
        transformedReferences = cveData.references
          .filter((ref: unknown) => ref && typeof ref === 'string' && (ref as string).trim())
          .map((ref: unknown) => ({ url: (ref as string).trim() }));
      }

      createData = {
        ...defaultData,
        ...cveData, // User input overrides defaults
        references: transformedReferences, // Use transformed references
        cveId, // Ensure CVE ID is preserved
      };
    }

    // Create the CVE in the database
    const createdCVE = await createCVE(createData);

    return NextResponse.json({
      success: true,
      message: `${cveId} created successfully`,
      cve: createdCVE,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Failed to create CVE:', error);
    
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 } // Conflict
        );
      }
      
      if (error.message.includes('Invalid operating systems')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create CVE' },
      { status: 500 }
    );
  }
}