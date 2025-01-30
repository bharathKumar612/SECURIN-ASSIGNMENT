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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  const [publishedStartDate, setPublishedStartDate] = useState<string>("");
  const [publishedEndDate, setPublishedEndDate] = useState<string>("");
  const [modifiedStartDate, setModifiedStartDate] = useState<string>("");
  const [modifiedEndDate, setModifiedEndDate] = useState<string>("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        resultsPerPage: resultsPerPage.toString(),
        startIndex: (pageNumber - 1).toString(),
      });

      if (publishedStartDate)
        params.append("publishedStartDate", publishedStartDate);
      if (publishedEndDate) params.append("publishedEndDate", publishedEndDate);
      if (modifiedStartDate)
        params.append("modifiedStartDate", modifiedStartDate);
      if (modifiedEndDate) params.append("modifiedEndDate", modifiedEndDate);

      const response = await axios.get<CVEResponse>(
        `${BASE_URL}/cve/list?${params.toString()}`
      );

      setData(response.data.cves);
      setTotalRecords(response.data.totalResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    pageNumber,
    resultsPerPage,
    publishedStartDate,
    publishedEndDate,
    modifiedStartDate,
    modifiedEndDate,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page") || "1");
    const perPage = parseInt(
      params.get("resultsPerPage") || RESULTS_PER_PAGE_OPTIONS[0].toString()
    );
    const pubStart = params.get("publishedStartDate") || "";
    const pubEnd = params.get("publishedEndDate") || "";
    const modStart = params.get("modifiedStartDate") || "";
    const modEnd = params.get("modifiedEndDate") || "";

    setPageNumber(page);
    setResultsPerPage(perPage as ResultsPerPage);
    setPublishedStartDate(pubStart);
    setPublishedEndDate(pubEnd);
    setModifiedStartDate(modStart);
    setModifiedEndDate(modEnd);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", pageNumber.toString());
    params.set("resultsPerPage", resultsPerPage.toString());
    if (publishedStartDate)
      params.set("publishedStartDate", publishedStartDate);
    if (publishedEndDate) params.set("publishedEndDate", publishedEndDate);
    if (modifiedStartDate) params.set("modifiedStartDate", modifiedStartDate);
    if (modifiedEndDate) params.set("modifiedEndDate", modifiedEndDate);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  }, [
    pageNumber,
    resultsPerPage,
    publishedStartDate,
    publishedEndDate,
    modifiedStartDate,
    modifiedEndDate,
  ]);

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
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publishedStartDate">Published Date Range</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    id="publishedStartDate"
                    value={publishedStartDate}
                    onChange={(e) => {
                      setPublishedStartDate(e.target.value);
                      setPageNumber(1);
                    }}
                    placeholder="Start date"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    id="publishedEndDate"
                    value={publishedEndDate}
                    onChange={(e) => {
                      setPublishedEndDate(e.target.value);
                      setPageNumber(1);
                    }}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modifiedStartDate">
                Last Modified Date Range
              </Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    id="modifiedStartDate"
                    value={modifiedStartDate}
                    onChange={(e) => {
                      setModifiedStartDate(e.target.value);
                      setPageNumber(1);
                    }}
                    placeholder="Start date"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    id="modifiedEndDate"
                    value={modifiedEndDate}
                    onChange={(e) => {
                      setModifiedEndDate(e.target.value);
                      setPageNumber(1);
                    }}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setPublishedStartDate("");
                setPublishedEndDate("");
                setModifiedStartDate("");
                setModifiedEndDate("");
                setPageNumber(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

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
