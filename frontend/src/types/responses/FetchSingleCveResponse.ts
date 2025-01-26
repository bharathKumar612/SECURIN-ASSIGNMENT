export interface SingleCVEData {
  cve: {
    id: string;
    sourceIdentifier: string;
    published: string;
    lastModified: string;
    vulnStatus: string;
    configurations: Array<{
      id: string;
      cveId: string;
    }>;
    descriptions: Array<{
      id: string;
      lang: string;
      value: string;
      cveId: string;
    }>;
    metrics: {
      id: string;
      cveId: string;
      cvssMetricV2: Array<{
        id: string;
        source: string;
        type: string;
        vectorString: string;
        baseScore: number;
        accessVector: string;
        accessComplexity: string;
        authentication: string;
        confidentialityImpact: string;
        integrityImpact: string;
        availabilityImpact: string;
        baseSeverity: string;
        exploitabilityScore: number;
        impactScore: number;
        metricsId: string;
      }>;
    };
  };
}
