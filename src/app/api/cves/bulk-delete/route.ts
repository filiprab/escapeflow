import { NextRequest, NextResponse } from 'next/server';
import { deleteCVEsByFilter, deleteCVEsByIds } from '@/lib/database/cve';
import type { CVEFilter } from '@/types/cve';

interface BulkDeleteRequest {
  ids?: unknown;
  selectAll?: boolean;
  excludeIds?: unknown;
  filter?: unknown;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map(item => (typeof item === 'string' ? item.trim() : ''))
        .filter((item): item is string => item.length > 0)
    )
  );
}

function normalizeFilter(filter: unknown): CVEFilter | null {
  if (!filter || typeof filter !== 'object') {
    return null;
  }

  const candidate = filter as Partial<CVEFilter>;

  return {
    operatingSystems: normalizeStringArray(candidate.operatingSystems),
    components: normalizeStringArray(candidate.components),
    severityLevels: normalizeStringArray(candidate.severityLevels),
    search: typeof candidate.search === 'string' ? candidate.search : '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkDeleteRequest;
    const selectAll = body.selectAll === true;
    const excludeIds = normalizeStringArray(body.excludeIds);

    if (selectAll) {
      const filter = normalizeFilter(body.filter);

      if (!filter) {
        return NextResponse.json(
          { error: 'Filter criteria are required when deleting all CVEs' },
          { status: 400 }
        );
      }

      const result = await deleteCVEsByFilter(filter, excludeIds);
      return NextResponse.json({
        success: true,
        deletedCount: result.count,
      });
    }

    const ids = normalizeStringArray(body.ids);

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No CVE IDs provided for bulk deletion' },
        { status: 400 }
      );
    }

    const result = await deleteCVEsByIds(ids);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Failed to bulk delete CVEs:', error);
    return NextResponse.json(
      { error: 'Failed to delete CVEs' },
      { status: 500 }
    );
  }
}
