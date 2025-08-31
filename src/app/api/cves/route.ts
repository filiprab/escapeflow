import { NextRequest, NextResponse } from 'next/server';
import { getCVEs, getAllOperatingSystems, getAllComponents, createCVE, CreateCVEData } from '@/lib/database/cve';
import { fetchFromNVD, fetchFromCVEOrg, validateCVEId } from '@/lib/api/external-cve';
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
    const { mode, cveId, source, cveData } = body;

    if (!mode || !cveId) {
      return NextResponse.json(
        { error: 'Mode and CVE ID are required' },
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

    let createData: CreateCVEData;

    switch (mode) {
      case 'manual':
        if (!cveData) {
          return NextResponse.json(
            { error: 'CVE data is required for manual mode' },
            { status: 400 }
          );
        }

        // Validate required fields for manual entry
        if (!cveData.descriptions || cveData.descriptions.length === 0 || !cveData.descriptions[0].description) {
          return NextResponse.json(
            { error: 'At least one description is required' },
            { status: 400 }
          );
        }

        // Create default structure and merge with user input
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
        break;

      case 'hybrid':
        // Fetch external data first, then allow overrides
        if (!source || !['NVD', 'CVE.org'].includes(source)) {
          return NextResponse.json(
            { error: 'Source must be either "NVD" or "CVE.org" for hybrid mode' },
            { status: 400 }
          );
        }

        try {
          // Fetch data from external source
          const externalData = source === 'NVD' 
            ? await fetchFromNVD(cveId)
            : await fetchFromCVEOrg(cveId);

          // Transform external data
          const baseData = transformExternalCVEData(externalData, body.additionalLabels);

          // Merge with provided overrides
          createData = {
            ...baseData,
            ...(cveData || {}),
            cveId, // Always preserve the CVE ID
          };
        } catch (error) {
          console.error(`Failed to fetch from ${source} for hybrid mode:`, error);
          return NextResponse.json(
            { error: `Failed to fetch base data from ${source}: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported mode: ${mode}. Supported modes: manual, hybrid` },
          { status: 400 }
        );
    }

    // Create the CVE in the database
    const createdCVE = await createCVE(createData);

    return NextResponse.json({
      success: true,
      message: `CVE ${cveId} created successfully`,
      cve: createdCVE,
      mode
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