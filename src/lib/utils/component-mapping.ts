/**
 * Target Component Mapping and Auto-Labeling Utilities
 *
 * This file defines the canonical list of target components for CVE classification
 * and provides intelligent keyword-based auto-labeling functionality.
 *
 * Design principles:
 * - ONE target component per CVE (or null if uncertain)
 * - Keyword-based detection from CVE descriptions
 * - Priority-based matching (exact names > technology keywords > patterns)
 * - Leave empty rather than guess incorrectly
 */

/**
 * Canonical target component names aligned with browser attack surface areas.
 * Each component represents a specific code module/subsystem that can be targeted.
 */
export const TARGET_COMPONENTS = [
  'V8 JavaScript Engine',
  'Blink Rendering Engine',
  'WebGL/ANGLE',
  'Skia Graphics',
  'WebRTC',
  'IPC/Mojo',
  'Media/Codecs',
  'PDFium',
  'Network Stack',
  'Browser UI',
  'Sandbox/Kernel',
] as const;

export type TargetComponent = typeof TARGET_COMPONENTS[number];

/**
 * Keyword mapping with priority levels for auto-labeling.
 * Priority 1 = Exact component names (highest confidence)
 * Priority 2 = Technology-specific keywords
 * Priority 3 = Attack pattern keywords (lowest confidence)
 */
interface ComponentKeywords {
  component: TargetComponent;
  priority: 1 | 2 | 3;
  keywords: string[];
  description: string;
}

const COMPONENT_KEYWORDS: ComponentKeywords[] = [
  // Priority 1: Exact Component Names (Highest Confidence)
  {
    component: 'V8 JavaScript Engine',
    priority: 1,
    keywords: [
      ' V8 ',
      ' v8 ',
      'in V8',
      'type confusion in V8',
      'V8 in Google Chrome',
      'V8 API',
    ],
    description: 'JavaScript engine, JIT compiler, WebAssembly runtime',
  },
  {
    component: 'Blink Rendering Engine',
    priority: 1,
    keywords: [
      'Blink',
      'in HTML',
      'in DOM',
      'in CSS',
      'in Animation',
      'in Compositing',
      'in Layout',
      'Shadow DOM',
      'Web Components',
    ],
    description: 'HTML/CSS rendering engine, DOM implementation',
  },
  {
    component: 'WebGL/ANGLE',
    priority: 1,
    keywords: [
      'ANGLE',
      'WebGL',
      'WebGPU',
      'in GPU ',
      'OpenGL',
    ],
    description: 'Graphics API layer, GPU process',
  },
  {
    component: 'Skia Graphics',
    priority: 1,
    keywords: [
      'Skia',
      'in Skia',
    ],
    description: '2D graphics library used for rendering',
  },
  {
    component: 'WebRTC',
    priority: 1,
    keywords: [
      'WebRTC',
      'Media Stream',
      'Media Capture',
      'RTC',
      'PeerConnection',
    ],
    description: 'Real-time communication APIs',
  },
  {
    component: 'IPC/Mojo',
    priority: 1,
    keywords: [
      'Mojo',
      ' IPC ',
      'inter-process',
    ],
    description: 'Inter-process communication layer',
  },
  {
    component: 'PDFium',
    priority: 1,
    keywords: [
      'PDFium',
      'in PDF',
      'crafted PDF file',
    ],
    description: 'PDF rendering engine',
  },

  // Priority 2: Technology-Specific Keywords
  {
    component: 'Media/Codecs',
    priority: 2,
    keywords: [
      'in Media',
      'in Audio',
      'in Video',
      'WebAudio',
      'in Codecs',
      'libvpx',
      'WebCodecs',
      'codec',
    ],
    description: 'Audio/video processing, media codecs',
  },
  {
    component: 'Network Stack',
    priority: 2,
    keywords: [
      'in Network',
      'Fetch API',
      'Background Fetch',
      'QUIC',
      'in Loader',
      'cross-origin',
      'CORS',
      'SSRF',
    ],
    description: 'Network protocols, fetch APIs, CORS handling',
  },
  {
    component: 'Browser UI',
    priority: 2,
    keywords: [
      'DevTools',
      'Browser UI',
      'Tab Strip',
      'Tab Groups',
      'Omnibox',
      'in Downloads',
      'in Autofill',
      'Custom Tabs',
      'in Settings',
      'in Navigation',
      'UI spoofing',
      'specific UI gestures',
      'Fullscreen',
    ],
    description: 'Browser UI components, user-facing interfaces',
  },

  // Priority 3: Attack Pattern Keywords (Lowest Confidence)
  {
    component: 'Sandbox/Kernel',
    priority: 3,
    keywords: [
      'sandbox escape',
      'privilege escalation',
      'elevation of privilege',
      'compromised the renderer process',
      'compromised the GPU process',
      'kernel',
      'driver',
    ],
    description: 'Sandbox escape, privilege escalation, kernel-level exploits',
  },
];

/**
 * Interface for auto-labeling result with confidence information
 */
export interface LabelingResult {
  component: TargetComponent | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchedKeyword?: string;
  priority?: 1 | 2 | 3;
}

/**
 * Auto-detect target component from CVE description using keyword matching.
 * Returns the highest-priority match, or null if no confident match found.
 *
 * @param description - CVE description text
 * @returns LabelingResult with component and confidence level
 */
export function detectTargetComponent(description: string): LabelingResult {
  if (!description || description.trim().length === 0) {
    return { component: null, confidence: 'none' };
  }

  const lowerDesc = description.toLowerCase();

  // Sort by priority (1 = highest priority)
  const sortedKeywords = [...COMPONENT_KEYWORDS].sort((a, b) => a.priority - b.priority);

  for (const entry of sortedKeywords) {
    for (const keyword of entry.keywords) {
      const lowerKeyword = keyword.toLowerCase();

      if (lowerDesc.includes(lowerKeyword)) {
        const confidence =
          entry.priority === 1 ? 'high' :
          entry.priority === 2 ? 'medium' :
          'low';

        // Return first match (highest priority due to sort)
        return {
          component: entry.component,
          confidence,
          matchedKeyword: keyword,
          priority: entry.priority,
        };
      }
    }
  }

  // No match found
  return { component: null, confidence: 'none' };
}

/**
 * Validates that a component is in the allowed list.
 * Throws an error if the component is invalid.
 */
export function validateComponent(component: string | null): void {
  if (component === null) {
    return; // Null is allowed (means unlabeled)
  }

  if (!TARGET_COMPONENTS.includes(component as TargetComponent)) {
    throw new Error(
      `Invalid target component: "${component}". Allowed components: ${TARGET_COMPONENTS.join(', ')}`
    );
  }
}

/**
 * Get component description for UI display
 */
export function getComponentDescription(component: TargetComponent): string {
  const entry = COMPONENT_KEYWORDS.find(k => k.component === component);
  return entry?.description || '';
}

/**
 * Get all components grouped by attack surface area
 */
export function getComponentsByCategory() {
  return {
    'Renderer Process': [
      'V8 JavaScript Engine',
      'Blink Rendering Engine',
      'WebRTC',
      'Media/Codecs',
      'PDFium',
    ],
    'GPU Process': [
      'WebGL/ANGLE',
      'Skia Graphics',
    ],
    'Browser Process': [
      'Network Stack',
      'Browser UI',
    ],
    'Cross-Process': [
      'IPC/Mojo',
    ],
    'System Level': [
      'Sandbox/Kernel',
    ],
  };
}

/**
 * Statistics helper for auto-labeling analysis
 */
export interface ComponentStats {
  component: TargetComponent | 'Unlabeled';
  count: number;
  percentage: number;
  confidenceLevels?: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Calculate statistics for a set of labeling results
 */
export function calculateLabelingStats(results: LabelingResult[]): ComponentStats[] {
  const stats = new Map<TargetComponent | 'Unlabeled', {
    count: number;
    high: number;
    medium: number;
    low: number;
  }>();

  // Initialize all components
  TARGET_COMPONENTS.forEach(comp => {
    stats.set(comp, { count: 0, high: 0, medium: 0, low: 0 });
  });
  stats.set('Unlabeled', { count: 0, high: 0, medium: 0, low: 0 });

  // Count results
  results.forEach(result => {
    const key = result.component || 'Unlabeled';
    const entry = stats.get(key)!;
    entry.count++;
    if (result.confidence === 'high') entry.high++;
    if (result.confidence === 'medium') entry.medium++;
    if (result.confidence === 'low') entry.low++;
  });

  // Calculate percentages and convert to array
  const total = results.length;
  return Array.from(stats.entries())
    .map(([component, data]) => ({
      component,
      count: data.count,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
      confidenceLevels: {
        high: data.high,
        medium: data.medium,
        low: data.low,
      },
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
}
