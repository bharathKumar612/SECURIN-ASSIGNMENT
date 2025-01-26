export interface CVEEntry {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
}

export interface CVEResponse {
  cves: CVEEntry[];
  totalResults: number;
  startIndex: number;
  resultsPerPage: number;
}
