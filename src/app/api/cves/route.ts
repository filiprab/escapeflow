import { NextRequest, NextResponse } from 'next/server';
import { getCVEs, getAllOperatingSystems, getAllComponents } from '@/lib/database/cve';

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