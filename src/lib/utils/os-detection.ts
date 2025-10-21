/**
 * Operating System Detection Utility
 *
 * Automatically detects which operating systems are affected by a CVE based
 * on keywords in the description text.
 *
 * Design principles:
 * - Case-insensitive keyword matching
 * - Return all OSes if none specifically mentioned (conservative approach)
 * - Support multiple OSes in a single description
 */

/**
 * Operating system names that match the database enum
 */
export const ALL_OPERATING_SYSTEMS = [
  'Android',
  'iOS',
  'Windows',
  'macOS',
  'Linux'
] as const;

export type OperatingSystem = typeof ALL_OPERATING_SYSTEMS[number];

/**
 * Keyword mappings for each operating system.
 * Multiple keywords per OS for better detection accuracy.
 */
const OS_KEYWORDS: Record<OperatingSystem, string[]> = {
  'Android': ['android'],
  'iOS': ['ios', 'iphone', 'ipad', 'ipod'],
  'Windows': ['windows', 'win32', 'win64'],
  'macOS': ['macos', 'mac os', 'osx', 'os x', 'darwin'],
  'Linux': ['linux', 'ubuntu', 'debian', 'fedora', 'rhel', 'centos']
};

/**
 * Detects which operating systems are affected based on CVE description.
 *
 * @param description - The CVE description text
 * @returns Array of operating system names
 *
 * Logic:
 * - If any OS keywords are found, returns only those OSes
 * - If no OS keywords are found, returns ALL OSes (conservative approach -
 *   assume all platforms affected if not specified)
 *
 * @example
 * detectOperatingSystems("Chrome on Android devices")
 * // Returns: ["Android"]
 *
 * @example
 * detectOperatingSystems("Windows and macOS users affected")
 * // Returns: ["Windows", "macOS"]
 *
 * @example
 * detectOperatingSystems("Type confusion vulnerability in V8")
 * // Returns: ["Android", "iOS", "Windows", "macOS", "Linux"] // All OSes
 */
export function detectOperatingSystems(description: string): OperatingSystem[] {
  if (!description || description.trim().length === 0) {
    return [...ALL_OPERATING_SYSTEMS]; // Default to all if no description
  }

  const lowerDesc = description.toLowerCase();
  const detectedOSes = new Set<OperatingSystem>();

  // Check each OS's keywords
  for (const [os, keywords] of Object.entries(OS_KEYWORDS) as [OperatingSystem, string[]][]) {
    for (const keyword of keywords) {
      // Use word boundary matching to avoid false positives
      // e.g., "windows" should not match "windowsills"
      const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (regex.test(lowerDesc)) {
        detectedOSes.add(os);
        break; // Found a match for this OS, no need to check other keywords
      }
    }
  }

  // If no specific OS was detected, assume all platforms are affected
  if (detectedOSes.size === 0) {
    return [...ALL_OPERATING_SYSTEMS];
  }

  // Return detected OSes in consistent order
  return ALL_OPERATING_SYSTEMS.filter(os => detectedOSes.has(os));
}

/**
 * Validates that the provided OS names are valid
 */
export function validateOperatingSystems(oses: string[]): boolean {
  return oses.every(os => ALL_OPERATING_SYSTEMS.includes(os as OperatingSystem));
}

/**
 * Statistics helper for OS detection analysis
 */
export interface OSDetectionStats {
  os: OperatingSystem | 'All OSes (default)';
  count: number;
  percentage: number;
}

/**
 * Calculate statistics for a set of OS detection results
 */
export function calculateOSStats(allResults: OperatingSystem[][]): OSDetectionStats[] {
  const stats = new Map<string, number>();

  // Count occurrences
  for (const result of allResults) {
    if (result.length === ALL_OPERATING_SYSTEMS.length) {
      // All OSes detected (default case)
      stats.set('All OSes (default)', (stats.get('All OSes (default)') || 0) + 1);
    } else {
      // Specific OSes detected
      for (const os of result) {
        stats.set(os, (stats.get(os) || 0) + 1);
      }
    }
  }

  const total = allResults.length;

  return Array.from(stats.entries())
    .map(([os, count]) => ({
      os: os as OperatingSystem | 'All OSes (default)',
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
}
