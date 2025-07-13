// Database CVE types based on Prisma schema
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
  labels: CVELabel[];
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
  labels: CVELabel[];
  metrics: CVEMetric[];
  references: CVEReference[];
}