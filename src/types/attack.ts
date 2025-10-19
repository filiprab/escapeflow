/**
 * Core attack flow types used throughout the application
 */

export interface ExploitationTechnique {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  cves: string[];
  pocs: string[];
  mitigations: string[];
  references: string[];
  contextSpecificImpact?: string[];
}

export interface PrivilegeInfo {
  level: string;
  capabilities: string[];
  restrictions: string[];
  examples: string[];
}

export interface PrivilegeEscalation {
  id: string;
  sourcePrivilege: string;
  targetPrivilege: string;
  sourcePrivilegeInfo: PrivilegeInfo;
  targetPrivilegeInfo: PrivilegeInfo;
  technique: ExploitationTechnique;
  componentId: string;
  componentName: string;
}

export interface TargetComponent {
  id: string;
  name: string;
  description: string;
  sourcePrivilege: string;
  targetPrivilege: string;
  sourcePrivilegeInfo: PrivilegeInfo;
  targetPrivilegeInfo: PrivilegeInfo;
  techniques: ExploitationTechnique[];
  escalations?: PrivilegeEscalation[];
}

export interface AttackVector {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  cves: string[];
  pocs: string[];
  sourcePrivilege: string;
  targetPrivilege: string;
  mitigations: string[];
  references: string[];
  contextSpecificImpact?: string[];
  componentId: string;
  techniqueId: string;
  escalationId?: string;
}
