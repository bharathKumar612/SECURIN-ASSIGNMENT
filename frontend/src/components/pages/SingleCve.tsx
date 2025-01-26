import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { SingleCVEData } from "@/types/responses/FetchSingleCveResponse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const SingleCve = () => {
  const { cveId } = useParams();
  const [cveData, setCveData] = useState<SingleCVEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCveInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get<SingleCVEData>(
          `${BASE_URL}/cve/${cveId}`
        );
        setCveData(response.data);
      } catch (error) {
        setError("Failed to fetch CVE data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCveInfo();
  }, [cveId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cveData) return null;

  const metrics = cveData.cve.metrics?.cvssMetricV2?.[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{cveData.cve.id}</h1>
        <div className="flex gap-2">
          <Badge
            variant={
              metrics?.baseSeverity === "HIGH" ? "destructive" : "secondary"
            }
          >
            Severity: {metrics?.baseSeverity || "N/A"}
          </Badge>
          <Badge>Score: {metrics?.baseScore || "N/A"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {cveData.cve.descriptions?.[0]?.value || "No description available"}
        </CardContent>
      </Card>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>CVSS V2 Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Access Vector</TableCell>
                    <TableCell>{metrics.accessVector}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Access Complexity</TableCell>
                    <TableCell>{metrics.accessComplexity}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Authentication</TableCell>
                    <TableCell>{metrics.authentication}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Impact Type</TableHead>
                    <TableHead>Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Confidentiality</TableCell>
                    <TableCell>{metrics.confidentialityImpact}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Integrity</TableCell>
                    <TableCell>{metrics.integrityImpact}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Availability</TableCell>
                    <TableCell>{metrics.availabilityImpact}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score Type</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Base Score</TableCell>
                    <TableCell>{metrics.baseScore}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Exploitability</TableCell>
                    <TableCell>{metrics.exploitabilityScore}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Impact</TableCell>
                    <TableCell>{metrics.impactScore}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {cveData.cve.configurations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Affected Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cveData.cve.configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-mono">
                        {config.cveId}
                      </TableCell>
                      <TableCell>{config.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SingleCve;
