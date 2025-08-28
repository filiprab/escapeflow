// =============================================================================
// DATABASE TYPES - Based on Prisma schema (Primary types used by components)
// =============================================================================

export interface CVEDescription {
  id: string;
  cveId: string;
  lang: string;
  description: string;
}

export interface CVEReference {
  id: string;
  cveId: string;
  url: string;
}

export interface CVELabel {
  id: string;
  cveId: string;
  operatingSystems: string[];
  components: string[];
}

export interface CVEMetric {
  id: string;
  cveId: string;
  baseScore: number;
  baseSeverity: string;
  vectorString: string;
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentialityImpact: string;
  integrityImpact: string;
  availabilityImpact: string;
  version: string;
}

export interface CVEProblemType {
  id: string;
  cveId: string;
  description: string;
  cweId?: string;
  type?: string;
  lang: string;
}

export interface CVEVersion {
  id: string;
  affectedProductId: string;
  version: string;
  status: string;
  lessThan?: string;
  versionType: string;
}

export interface CVEAffectedProduct {
  id: string;
  cveId: string;
  vendor: string;
  product: string;
  versions: CVEVersion[];
}

export interface CVERecord {
  id: string;
  cveId: string;
  dataType: string;
  dataVersion: string;
  state: string;
  assignerOrgId: string;
  assignerShortName: string;
  dateReserved: string;
  datePublished: string;
  dateUpdated: string;
  createdAt: string;
  updatedAt: string;
  descriptions: CVEDescription[];
  references: CVEReference[];
  labels: CVELabel | null;
  metrics: CVEMetric[];
  problemTypes: CVEProblemType[];
  affectedProducts: CVEAffectedProduct[];
}

// Utility types for components
export interface CVEListItem {
  id: string;
  cveId: string;
  datePublished: string;
  dateUpdated: string;
  state: string;
  descriptions: CVEDescription[];
  labels: CVELabel | null;
  metrics: CVEMetric[];
  references: CVEReference[];
}

// =============================================================================
// FILTER AND API TYPES - Used for search and filtering functionality
// =============================================================================

export interface CVEFilter {
  operatingSystems: string[];
  components: string[];
  search: string;
}

// =============================================================================
// CVSS PARSING TYPES - Used for parsing CVSS vector strings
// =============================================================================

export interface ParsedCVSSComponents {
  version: string;
  attackVector?: string;
  attackComplexity?: string;
  privilegesRequired?: string;
  userInteraction?: string;
  scope?: string;
  confidentialityImpact?: string;
  integrityImpact?: string;
  availabilityImpact?: string;
}

// =============================================================================
// EXTERNAL API TYPES - Raw CVE data from external sources (NVD, etc.)
// =============================================================================

export interface CVEMetadata {
  cveId: string;
  assignerOrgId: string;
  state: string;
  assignerShortName: string;
  dateReserved: string;
  datePublished: string;
  dateUpdated: string;
}

export interface CVEVersionRaw {
  version: string;
  status: string;
  lessThan: string;
  versionType: string;
}

export interface CVEAffectedRaw {
  vendor: string;
  product: string;
  versions: CVEVersionRaw[];
}

export interface CVEDescriptionRaw {
  lang: string;
  value: string;
}

export interface CVEProblemTypeDescriptionRaw {
  lang: string;
  description: string;
  type?: string;
  cweId?: string;
}

export interface CVEProblemTypeRaw {
  descriptions: CVEProblemTypeDescriptionRaw[];
}

export interface CVEReferenceRaw {
  url: string;
}

export interface CVEProviderMetadata {
  orgId: string;
  shortName: string;
  dateUpdated: string;
}

export interface CVSSMetrics {
  scope: string;
  version: string;
  baseScore: number;
  attackVector: string;
  baseSeverity: string;
  vectorString: string;
  integrityImpact: string;
  userInteraction: string;
  attackComplexity: string;
  availabilityImpact: string;
  privilegesRequired: string;
  confidentialityImpact: string;
}

export interface CVSSV4Metrics {
  version: string;
  baseScore: number;
  baseSeverity: string;
  vectorString: string;
  attackVector?: string;
  attackComplexity?: string;
  privilegesRequired?: string;
  userInteraction?: string;
  scope?: string;
  vulnerabilityConfidentialityImpact?: string;
  vulnerabilityIntegrityImpact?: string;
  vulnerabilityAvailabilityImpact?: string;
}

export interface CVEMetricRaw {
  cvssV3_1?: CVSSMetrics;
  cvssV4_0?: CVSSV4Metrics;
  other?: {
    type: string;
    content: unknown;
  };
}

export interface CVECNA {
  affected?: CVEAffectedRaw[];
  descriptions?: CVEDescriptionRaw[];
  problemTypes?: CVEProblemTypeRaw[];
  providerMetadata: CVEProviderMetadata;
  references?: CVEReferenceRaw[];
  metrics?: CVEMetricRaw[];
}

export interface CVEADP {
  problemTypes?: CVEProblemTypeRaw[];
  metrics?: CVEMetricRaw[];
  title?: string;
  providerMetadata?: CVEProviderMetadata;
}

export interface CVEContainers {
  cna: CVECNA;
  adp?: CVEADP[];
}

export interface CVELabelsRaw {
  operating_systems: string[];
  components: string[];
}

export interface CVERecordRaw {
  dataType: string;
  dataVersion: string;
  cveMetadata: CVEMetadata;
  containers: CVEContainers;
  labels: CVELabelsRaw;
}

export interface CVEDatabase {
  total_cves: number;
  fetched_at: string;
  labeled_at: string;
  cve_details: Record<string, CVERecordRaw>;
}

export type MetricToProcess = CVEMetricRaw;