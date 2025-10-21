import { NextResponse } from 'next/server';
import { getLastBulkUpdateTime, isBulkUpdateInProgress } from '@/lib/database/metadata';

/**
 * GET /api/cves/bulk-update/status
 *
 * Returns the status of bulk CVE updates
 */
export async function GET() {
  try {
    const lastUpdate = await getLastBulkUpdateTime();
    const isRunning = await isBulkUpdateInProgress();

    return NextResponse.json({
      lastUpdate: lastUpdate || null,
      isRunning,
    });
  } catch (error) {
    console.error('Error fetching bulk update status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
