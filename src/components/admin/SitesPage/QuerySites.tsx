import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import type { SitesQuery, SiteResData } from "../../../types";
import Paginator from "../../ui/buttons/Paginator";
import SiteCardHorizontal from "../../ui/SiteCardHorizontal";
import SmallSiteCard from "../../ui/SmallSiteCard";

interface SitesQueryResponseData {
  data?: SiteResData[];
  nextCursor: string | undefined;
  total?: number;
}

export default function QuerySites({
  categories,
  status = ["REVIEW", "PARSING", "BANNED", "APPROVED"],
  sort,
}: SitesQuery) {
  const fetchSites = async (fetchParams: QueryFunctionContext) => {
    const params = new URLSearchParams({
      categories: JSON.stringify(categories ?? ""),
      status: JSON.stringify(status),
      sort: JSON.stringify(sort ?? ""),
      cursor: JSON.stringify(fetchParams.pageParam?.nextCursor  ?? "")
    }).toString();
    const res = await fetch(`/api/query/get-sites?${params}`, {
      method: "get",
    });
    const data = (await res.json()) as SitesQueryResponseData | undefined;
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
  } = useInfiniteQuery(["sites", status, sort, categories], fetchSites, {
    enabled: status?.length > 0,
    getNextPageParam: (lastPage) => (lastPage?.nextCursor ? {nextCursor: lastPage.nextCursor} : undefined),
  });

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
      <span className="absolute z-20 bg-accent p-2 rounded-sm">total:{data?.pages?.[0]?.total}</span>
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
            const site = allRows[virtualRow.index];

            return (
              <div
                key={virtualRow.index}
                className={
                  virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                }
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {isLoaderRow ? (
                  hasNextPage ? (
                    "Loading more..."
                  ) : (
                    "Nothing more to load"
                  )
                ) : site && (
                  <a href={`/sites/${site.id}`}>
                    <SiteCardHorizontal site={site} key={site.id} admin={true}/>
                  </a>
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
