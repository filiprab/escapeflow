/**
 * System Metadata Database Functions
 *
 * Provides functions to manage system-wide metadata stored in the database.
 * Used for tracking things like last bulk update timestamps, feature flags, etc.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Metadata keys used in the system
 */
export const METADATA_KEYS = {
  CVE_LAST_BULK_UPDATE: 'cve_last_bulk_update',
  CVE_BULK_UPDATE_IN_PROGRESS: 'cve_bulk_update_in_progress',
} as const;

export type MetadataKey = typeof METADATA_KEYS[keyof typeof METADATA_KEYS];

/**
 * Get a metadata value by key
 *
 * @param key - Metadata key
 * @returns Value string or null if not found
 */
export async function getSystemMetadata(key: MetadataKey): Promise<string | null> {
  try {
    const record = await prisma.systemMetadata.findUnique({
      where: { key }
    });

    return record?.value || null;
  } catch (error) {
    console.error(`Error getting system metadata for key "${key}":`, error);
    return null;
  }
}

/**
 * Set a metadata value (creates if doesn't exist, updates if it does)
 *
 * @param key - Metadata key
 * @param value - Value to store
 */
export async function setSystemMetadata(key: MetadataKey, value: string): Promise<void> {
  try {
    await prisma.systemMetadata.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  } catch (error) {
    console.error(`Error setting system metadata for key "${key}":`, error);
    throw new Error(`Failed to set system metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a metadata value
 *
 * @param key - Metadata key
 */
export async function deleteSystemMetadata(key: MetadataKey): Promise<void> {
  try {
    await prisma.systemMetadata.delete({
      where: { key }
    }).catch(() => {
      // Ignore if doesn't exist
    });
  } catch (error) {
    console.error(`Error deleting system metadata for key "${key}":`, error);
  }
}

/**
 * Get the last CVE bulk update timestamp
 *
 * @returns ISO timestamp string or null if never run
 */
export async function getLastBulkUpdateTime(): Promise<string | null> {
  return await getSystemMetadata(METADATA_KEYS.CVE_LAST_BULK_UPDATE);
}

/**
 * Set the last CVE bulk update timestamp to now
 */
export async function setLastBulkUpdateTime(): Promise<void> {
  await setSystemMetadata(METADATA_KEYS.CVE_LAST_BULK_UPDATE, new Date().toISOString());
}

/**
 * Check if a bulk update is currently in progress
 *
 * @returns true if in progress
 */
export async function isBulkUpdateInProgress(): Promise<boolean> {
  const value = await getSystemMetadata(METADATA_KEYS.CVE_BULK_UPDATE_IN_PROGRESS);
  return value === 'true';
}

/**
 * Mark bulk update as in progress
 */
export async function markBulkUpdateInProgress(): Promise<void> {
  await setSystemMetadata(METADATA_KEYS.CVE_BULK_UPDATE_IN_PROGRESS, 'true');
}

/**
 * Mark bulk update as complete
 */
export async function markBulkUpdateComplete(): Promise<void> {
  await setSystemMetadata(METADATA_KEYS.CVE_BULK_UPDATE_IN_PROGRESS, 'false');
}

/**
 * Get all metadata (for debugging/admin purposes)
 */
export async function getAllMetadata(): Promise<Record<string, string>> {
  try {
    const records = await prisma.systemMetadata.findMany();
    return Object.fromEntries(records.map(r => [r.key, r.value]));
  } catch (error) {
    console.error('Error getting all metadata:', error);
    return {};
  }
}
