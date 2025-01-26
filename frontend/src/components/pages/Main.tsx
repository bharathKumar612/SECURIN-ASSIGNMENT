import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CVEEntry,
  CVEResponse,
} from "@/types/responses/FetchTableDataResponse";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { BASE_URL } from "@/lib/constants";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router";

const RESULTS_PER_PAGE_OPTIONS = [10, 50, 100] as const;
type ResultsPerPage = (typeof RESULTS_PER_PAGE_OPTIONS)[number];

const Main: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CVEEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [resultsPerPage, setResultsPerPage] = useState<ResultsPerPage>(
    RESULTS_PER_PAGE_OPTIONS[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<CVEResponse>(
        `${BASE_URL}/cve/list?resultsPerPage=${resultsPerPage}&startIndex=${
          pageNumber - 1
        }`
      );

      setData(response.data.cves);
      setTotalRecords(response.data.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, resultsPerPage]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setPageNumber(page);
  }, []);

  const handleResultsPerPageChange = useCallback((value: string) => {
    const newValue = Number(value) as ResultsPerPage;
    if (RESULTS_PER_PAGE_OPTIONS.includes(newValue)) {
      setResultsPerPage(newValue);
      setPageNumber(1);
    }
  }, []);

  const totalPages = Math.ceil(totalRecords / resultsPerPage);
  const startRecord = (pageNumber - 1) * resultsPerPage + 1;
  const endRecord = Math.min(pageNumber * resultsPerPage, totalRecords);

  if (error) {
    return (
      <Card className="w-full max-w-6xl mx-auto my-8">
        <CardContent className="p-6">
          <div className="text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto my-8">
      <CardHeader>
        <CardTitle>CVE Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="rounded-md border">
            <ScrollArea className="h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold">CVE ID</TableHead>
                    <TableHead className="font-semibold">IDENTIFIER</TableHead>
                    <TableHead className="font-semibold">
                      PUBLISHED DATE
                    </TableHead>
                    <TableHead className="font-semibold">
                      LAST MODIFIED DATE
                    </TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row) => (
                      <TableRow
                        key={row.id}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/cves/${row.id}`);
                        }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.sourceIdentifier}</TableCell>
                        <TableCell>{formatDate(row.published)}</TableCell>
                        <TableCell>{formatDate(row.lastModified)}</TableCell>
                        <TableCell>{row.vulnStatus}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Results per page:</span>
              <Select
                value={resultsPerPage.toString()}
                onValueChange={handleResultsPerPageChange}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS_PER_PAGE_OPTIONS.map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {totalRecords > 0
                  ? `${startRecord}-${endRecord} of ${totalRecords} records`
                  : "No records"}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        pageNumber > 1 && handlePageChange(pageNumber - 1)
                      }
                      className={
                        pageNumber <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      aria-disabled={pageNumber <= 1}
                    />
                  </PaginationItem>
                  {(() => {
                    const VISIBLE_PAGES = 5;
                    const halfVisible = Math.floor(VISIBLE_PAGES / 2);
                    let startPage = Math.max(1, pageNumber - halfVisible);
                    const endPage = Math.min(
                      totalPages,
                      startPage + VISIBLE_PAGES - 1
                    );

                    if (endPage - startPage + 1 < VISIBLE_PAGES) {
                      startPage = Math.max(1, endPage - VISIBLE_PAGES + 1);
                    }

                    return (
                      <>
                        {startPage > 1 && (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(1)}
                                className="cursor-pointer"
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {startPage > 2 && (
                              <PaginationItem>
                                <span className="px-4">...</span>
                              </PaginationItem>
                            )}
                          </>
                        )}

                        {Array.from(
                          { length: endPage - startPage + 1 },
                          (_, i) => startPage + i
                        ).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={pageNumber === page}
                              className="cursor-pointer"
                              aria-current={
                                pageNumber === page ? "page" : undefined
                              }
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        {endPage < totalPages && (
                          <>
                            {endPage < totalPages - 1 && (
                              <PaginationItem>
                                <span className="px-4">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(totalPages)}
                                className="cursor-pointer"
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                      </>
                    );
                  })()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        pageNumber < totalPages &&
                        handlePageChange(pageNumber + 1)
                      }
                      className={
                        pageNumber >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      aria-disabled={pageNumber >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Main;
