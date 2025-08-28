/**
 * CVSS v3.1 Vector String Parser
 * Parses CVSS vector strings and extracts individual metric components
 */

import type { ParsedCVSSComponents } from '@/types/cve';

/**
 * Parse CVSS v3.1 vector string into individual components
 * Example: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:H/I:N/A:N"
 */
export function parseCVSSVector(vectorString: string): ParsedCVSSComponents | null {
  if (!vectorString || !vectorString.startsWith('CVSS:3.1/')) {
    return null;
  }

  const metrics: ParsedCVSSComponents = {
    version: '3.1'
  };

  // Split the vector string by '/' and process each component
  const components = vectorString.split('/');
  
  for (const component of components) {
    if (component === 'CVSS:3.1') continue;
    
    const [key, value] = component.split(':');
    if (!key || !value) continue;

    switch (key) {
      case 'AV': // Attack Vector
        metrics.attackVector = mapAttackVector(value);
        break;
      case 'AC': // Attack Complexity  
        metrics.attackComplexity = mapAttackComplexity(value);
        break;
      case 'PR': // Privileges Required
        metrics.privilegesRequired = mapPrivilegesRequired(value);
        break;
      case 'UI': // User Interaction
        metrics.userInteraction = mapUserInteraction(value);
        break;
      case 'S': // Scope
        metrics.scope = mapScope(value);
        break;
      case 'C': // Confidentiality Impact
        metrics.confidentialityImpact = mapImpact(value);
        break;
      case 'I': // Integrity Impact
        metrics.integrityImpact = mapImpact(value);
        break;
      case 'A': // Availability Impact
        metrics.availabilityImpact = mapImpact(value);
        break;
      // Skip temporal and environmental metrics (E, RL, RC, etc.)
    }
  }

  return metrics;
}

function mapAttackVector(value: string): string {
  switch (value) {
    case 'N': return 'NETWORK';
    case 'A': return 'ADJACENT_NETWORK';
    case 'L': return 'LOCAL';
    case 'P': return 'PHYSICAL';
    default: return value;
  }
}

function mapAttackComplexity(value: string): string {
  switch (value) {
    case 'L': return 'LOW';
    case 'H': return 'HIGH';
    default: return value;
  }
}

function mapPrivilegesRequired(value: string): string {
  switch (value) {
    case 'N': return 'NONE';
    case 'L': return 'LOW';
    case 'H': return 'HIGH';
    default: return value;
  }
}

function mapUserInteraction(value: string): string {
  switch (value) {
    case 'N': return 'NONE';
    case 'R': return 'REQUIRED';
    default: return value;
  }
}

function mapScope(value: string): string {
  switch (value) {
    case 'U': return 'UNCHANGED';
    case 'C': return 'CHANGED';
    default: return value;
  }
}

function mapImpact(value: string): string {
  switch (value) {
    case 'N': return 'NONE';
    case 'L': return 'LOW';
    case 'H': return 'HIGH';
    default: return value;
  }
}
