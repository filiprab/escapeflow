/**
 * CVSS v3.1 Calculator
 *
 * Implements the official CVSS v3.1 specification for calculating base scores.
 * Reference: https://www.first.org/cvss/v3.1/specification-document
 */

// Metric value mappings to numeric scores
export const CVSS_VALUES = {
  attackVector: {
    NETWORK: 0.85,
    ADJACENT_NETWORK: 0.62,
    LOCAL: 0.55,
    PHYSICAL: 0.20,
  },
  attackComplexity: {
    LOW: 0.77,
    HIGH: 0.44,
  },
  privilegesRequired: {
    // Values depend on Scope
    unchanged: {
      NONE: 0.85,
      LOW: 0.62,
      HIGH: 0.27,
    },
    changed: {
      NONE: 0.85,
      LOW: 0.68,
      HIGH: 0.50,
    },
  },
  userInteraction: {
    NONE: 0.85,
    REQUIRED: 0.62,
  },
  impact: {
    NONE: 0,
    LOW: 0.22,
    HIGH: 0.56,
  },
} as const;

// Metric display labels and short codes for vector string
export const METRIC_OPTIONS = {
  attackVector: [
    { label: 'Network', value: 'NETWORK', code: 'N' },
    { label: 'Adjacent Network', value: 'ADJACENT_NETWORK', code: 'A' },
    { label: 'Local', value: 'LOCAL', code: 'L' },
    { label: 'Physical', value: 'PHYSICAL', code: 'P' },
  ],
  attackComplexity: [
    { label: 'Low', value: 'LOW', code: 'L' },
    { label: 'High', value: 'HIGH', code: 'H' },
  ],
  privilegesRequired: [
    { label: 'None', value: 'NONE', code: 'N' },
    { label: 'Low', value: 'LOW', code: 'L' },
    { label: 'High', value: 'HIGH', code: 'H' },
  ],
  userInteraction: [
    { label: 'None', value: 'NONE', code: 'N' },
    { label: 'Required', value: 'REQUIRED', code: 'R' },
  ],
  scope: [
    { label: 'Unchanged', value: 'UNCHANGED', code: 'U' },
    { label: 'Changed', value: 'CHANGED', code: 'C' },
  ],
  confidentialityImpact: [
    { label: 'None', value: 'NONE', code: 'N' },
    { label: 'Low', value: 'LOW', code: 'L' },
    { label: 'High', value: 'HIGH', code: 'H' },
  ],
  integrityImpact: [
    { label: 'None', value: 'NONE', code: 'N' },
    { label: 'Low', value: 'LOW', code: 'L' },
    { label: 'High', value: 'HIGH', code: 'H' },
  ],
  availabilityImpact: [
    { label: 'None', value: 'NONE', code: 'N' },
    { label: 'Low', value: 'LOW', code: 'L' },
    { label: 'High', value: 'HIGH', code: 'H' },
  ],
} as const;

export interface CVSSMetrics {
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentialityImpact: string;
  integrityImpact: string;
  availabilityImpact: string;
}

export interface CVSSResult {
  baseScore: number;
  baseSeverity: string;
  vectorString: string;
  impactSubScore: number;
  exploitabilitySubScore: number;
}

/**
 * Round up to 1 decimal place (per CVSS spec)
 */
function roundUp(value: number): number {
  return Math.ceil(value * 10) / 10;
}

/**
 * Get severity rating from base score
 */
function getSeverity(score: number): string {
  if (score === 0) return 'None';
  if (score < 4.0) return 'Low';
  if (score < 7.0) return 'Medium';
  if (score < 9.0) return 'High';
  return 'Critical';
}

/**
 * Generate CVSS v3.1 vector string
 */
export function generateVectorString(metrics: CVSSMetrics): string {
  const codes = {
    AV: METRIC_OPTIONS.attackVector.find(o => o.value === metrics.attackVector)?.code,
    AC: METRIC_OPTIONS.attackComplexity.find(o => o.value === metrics.attackComplexity)?.code,
    PR: METRIC_OPTIONS.privilegesRequired.find(o => o.value === metrics.privilegesRequired)?.code,
    UI: METRIC_OPTIONS.userInteraction.find(o => o.value === metrics.userInteraction)?.code,
    S: METRIC_OPTIONS.scope.find(o => o.value === metrics.scope)?.code,
    C: METRIC_OPTIONS.confidentialityImpact.find(o => o.value === metrics.confidentialityImpact)?.code,
    I: METRIC_OPTIONS.integrityImpact.find(o => o.value === metrics.integrityImpact)?.code,
    A: METRIC_OPTIONS.availabilityImpact.find(o => o.value === metrics.availabilityImpact)?.code,
  };

  return `CVSS:3.1/AV:${codes.AV}/AC:${codes.AC}/PR:${codes.PR}/UI:${codes.UI}/S:${codes.S}/C:${codes.C}/I:${codes.I}/A:${codes.A}`;
}

/**
 * Calculate CVSS v3.1 Base Score
 */
export function calculateCVSS(metrics: CVSSMetrics): CVSSResult {
  // Get impact values
  const impactConf = CVSS_VALUES.impact[metrics.confidentialityImpact as keyof typeof CVSS_VALUES.impact];
  const impactInteg = CVSS_VALUES.impact[metrics.integrityImpact as keyof typeof CVSS_VALUES.impact];
  const impactAvail = CVSS_VALUES.impact[metrics.availabilityImpact as keyof typeof CVSS_VALUES.impact];

  // Calculate ISCBase
  const iscBase = 1 - ((1 - impactConf) * (1 - impactInteg) * (1 - impactAvail));

  // Calculate Impact Sub Score based on Scope
  let impactSubScore: number;
  if (metrics.scope === 'UNCHANGED') {
    impactSubScore = 6.42 * iscBase;
  } else {
    impactSubScore = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
  }

  // If impact <= 0, base score is 0
  if (impactSubScore <= 0) {
    return {
      baseScore: 0,
      baseSeverity: 'None',
      vectorString: generateVectorString(metrics),
      impactSubScore: 0,
      exploitabilitySubScore: 0,
    };
  }

  // Get Privileges Required value (depends on Scope)
  const prValue = metrics.scope === 'UNCHANGED'
    ? CVSS_VALUES.privilegesRequired.unchanged[metrics.privilegesRequired as keyof typeof CVSS_VALUES.privilegesRequired.unchanged]
    : CVSS_VALUES.privilegesRequired.changed[metrics.privilegesRequired as keyof typeof CVSS_VALUES.privilegesRequired.changed];

  // Calculate Exploitability Sub Score
  const exploitabilitySubScore = 8.22 *
    CVSS_VALUES.attackVector[metrics.attackVector as keyof typeof CVSS_VALUES.attackVector] *
    CVSS_VALUES.attackComplexity[metrics.attackComplexity as keyof typeof CVSS_VALUES.attackComplexity] *
    prValue *
    CVSS_VALUES.userInteraction[metrics.userInteraction as keyof typeof CVSS_VALUES.userInteraction];

  // Calculate Base Score
  let baseScore: number;
  if (metrics.scope === 'UNCHANGED') {
    baseScore = roundUp(Math.min(impactSubScore + exploitabilitySubScore, 10));
  } else {
    baseScore = roundUp(Math.min(1.08 * (impactSubScore + exploitabilitySubScore), 10));
  }

  return {
    baseScore,
    baseSeverity: getSeverity(baseScore),
    vectorString: generateVectorString(metrics),
    impactSubScore,
    exploitabilitySubScore,
  };
}

/**
 * Parse a CVSS vector string back to metrics
 */
export function parseVectorString(vectorString: string): CVSSMetrics | null {
  if (!vectorString.startsWith('CVSS:3.1/')) {
    return null;
  }

  const parts = vectorString.substring(9).split('/');
  const metrics: Partial<CVSSMetrics> = {};

  for (const part of parts) {
    const [key, value] = part.split(':');

    switch (key) {
      case 'AV':
        metrics.attackVector = METRIC_OPTIONS.attackVector.find(o => o.code === value)?.value;
        break;
      case 'AC':
        metrics.attackComplexity = METRIC_OPTIONS.attackComplexity.find(o => o.code === value)?.value;
        break;
      case 'PR':
        metrics.privilegesRequired = METRIC_OPTIONS.privilegesRequired.find(o => o.code === value)?.value;
        break;
      case 'UI':
        metrics.userInteraction = METRIC_OPTIONS.userInteraction.find(o => o.code === value)?.value;
        break;
      case 'S':
        metrics.scope = METRIC_OPTIONS.scope.find(o => o.code === value)?.value;
        break;
      case 'C':
        metrics.confidentialityImpact = METRIC_OPTIONS.confidentialityImpact.find(o => o.code === value)?.value;
        break;
      case 'I':
        metrics.integrityImpact = METRIC_OPTIONS.integrityImpact.find(o => o.code === value)?.value;
        break;
      case 'A':
        metrics.availabilityImpact = METRIC_OPTIONS.availabilityImpact.find(o => o.code === value)?.value;
        break;
    }
  }

  // Validate all required fields are present
  if (
    metrics.attackVector &&
    metrics.attackComplexity &&
    metrics.privilegesRequired &&
    metrics.userInteraction &&
    metrics.scope &&
    metrics.confidentialityImpact &&
    metrics.integrityImpact &&
    metrics.availabilityImpact
  ) {
    return metrics as CVSSMetrics;
  }

  return null;
}
