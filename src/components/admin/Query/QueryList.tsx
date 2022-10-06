import type { Reports } from "@prisma/client";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import type {
  SitesQuery,
  SitesQueryResponseData,
  SiteReportsQueryResponseData,
} from "../../../types";
import ReportSiteCard from "../../ui/ReportSiteCard";
import SiteCardHorizontal from "../../ui/SiteCardHorizontal";

interface QueryList extends SitesQuery {
  mode: "REPORTS" | "SITES";
  reportTypes?: string[];
}

export default function QueryList({
  mode,
  categories,
  status = ["REVIEW", "PARSING", "BANNED", "APPROVED"],
  reportTypes = ["BROKEN", "DISPLAY"],
  sort,
}: QueryList) {
  const fetchSites = async (fetchParams: QueryFunctionContext) => {
    const params = new URLSearchParams({
      categories: JSON.stringify(categories ?? ""),
      status: JSON.stringify(status),
      reportTypes: JSON.stringify(reportTypes),
      sort: JSON.stringify(sort ?? ""),
      cursor: JSON.stringify(fetchParams.pageParam?.nextCursor ?? ""),
    }).toString();
    const res = await fetch(
      `${
        mode === "SITES" ? "/api/query/query-sites" : "/api/query/query-reports"
      }?${params}`,
      {
        method: "get",
      }
    );
    const data = (await res.json()) as
      | SitesQueryResponseData
      | SiteReportsQueryResponseData;
    //console.log("data?", data);
    return {
      sites: data?.data,
      nextCursor: data?.nextCursor,
      total: data?.total,
    };
  };
  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    mode === "SITES"
      ? ["sites", status, sort, categories]
      : ["reports", reportTypes],
    fetchSites,
    {
      enabled: status?.length > 0 && !!mode,
      getNextPageParam: (lastPage) =>
        lastPage?.nextCursor ? { nextCursor: lastPage.nextCursor } : undefined,
    }
  );

  const allRows = data ? data.pages.flatMap((d) => d.sites?.flat()) : [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);
  return (
    <div className="flex flex-col flex-grow gap-2 ">
      <span className="absolute z-20 bg-accent p-2 rounded-sm">
        total:{data?.pages?.[0]?.total}
      </span>
      <div
        ref={parentRef}
        className="flex justify-center flex-grow max-h-screen pt-2"
        style={{
          //height: `500px`,
          width: `100%`,
          overflow: "auto",
        }}
      >
        <div
          className="max-w-3xl"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow = virtualRow.index > allRows.length - 1;
            const site = allRows[virtualRow.index] as any;

            return (
              <div
                key={virtualRow.index}
                className={"min-w-full"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderRow
                  ? hasNextPage
                    ? "Loading more..."
                    : "Nothing more to load"
                  : site && (
                      <>
                        {mode === "SITES" ? (
                          <a
                            href={`/sites/${site.id}`}
                            target="_blank"
                            className="w-full"
                          >
                            <SiteCardHorizontal
                              site={site}
                              key={site.id}
                              admin={true}
                            />
                          </a>
                        ) : (
                          <a
                            href={`/dashboard/admin/reports/${site.id}`}
                            target="_blank"
                            className="w-full"
                          >
                            <ReportSiteCard
                              site={site}
                              key={site.id}
                              admin={true}
                            />
                          </a>
                        )}
                      </>
                    )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-grow"></div>
    </div>
  );
}
