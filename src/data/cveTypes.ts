export interface CVEMetadata {
  cveId: string;
  assignerOrgId: string;
  state: string;
  assignerShortName: string;
  dateReserved: string;
  datePublished: string;
  dateUpdated: string;
}

export interface CVEVersion {
  version: string;
  status: string;
  lessThan: string;
  versionType: string;
}

export interface CVEAffected {
  vendor: string;
  product: string;
  versions: CVEVersion[];
}

export interface CVEDescription {
  lang: string;
  value: string;
}

export interface CVEProblemTypeDescription {
  lang: string;
  description: string;
  type?: string;
  cweId?: string;
}

export interface CVEProblemType {
  descriptions: CVEProblemTypeDescription[];
}

export interface CVEReference {
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

export interface CVEMetric {
  cvssV3_1?: CVSSMetrics;
  cvssV4_0?: CVSSV4Metrics;
  other?: {
    type: string;
    content: unknown;
  };
}

export interface CVECNA {
  affected?: CVEAffected[];
  descriptions?: CVEDescription[];
  problemTypes?: CVEProblemType[];
  providerMetadata: CVEProviderMetadata;
  references?: CVEReference[];
  metrics?: CVEMetric[];
}

export interface CVEADP {
  problemTypes?: CVEProblemType[];
  metrics?: CVEMetric[];
  title?: string;
  providerMetadata?: CVEProviderMetadata;
}

export interface CVEContainers {
  cna: CVECNA;
  adp?: CVEADP[];
}

export interface CVELabels {
  operating_systems: string[];
  components: string[];
}

export interface CVERecord {
  dataType: string;
  dataVersion: string;
  cveMetadata: CVEMetadata;
  containers: CVEContainers;
  labels: CVELabels;
}

export interface CVEDatabase {
  total_cves: number;
  fetched_at: string;
  labeled_at: string;
  cve_details: Record<string, CVERecord>;
}

export interface CVEFilter {
  operatingSystems: string[];
  components: string[];
  search: string;
}

export type MetricToProcess = CVEMetric;