import QuerySites from "./QuerySites";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import type { SiteStatus } from "@prisma/client";
const queryClient = new QueryClient();
const statuses = [
  "PARSING",
  "REVIEW",
  "APPROVED",
  "REPORTED",
  "REJECTED",
  "BANNED",
];
const StatusSelector = ({
  statuses,
  selectedStatuses,
  updateSelectedStatuses,
}: {
  statuses: string[];
  selectedStatuses: boolean[];
  updateSelectedStatuses: Function;
}) => {
  return (
    <>
      {statuses.map((s: string, i: number) => (
        <label key={s} className="label cursor-pointer">
          <span className="label-text">{s}</span>
          <input
            type={"checkbox"}
            id={`status-${s}`}
            name={s}
            value={s}
            checked={selectedStatuses[i]}
            className={"checkbox"}
            onChange={(e) => {
              updateSelectedStatuses(s as unknown as SiteStatus);
            }}
          />
        </label>
      ))}
    </>
  );
};

export default function SitesPage() {
  const [selectedStatuses, setSelectedStatuses] = useState<boolean[]>(() =>
    (new Array(statuses.length).fill(false))?.map((v,i) => (i === statuses.indexOf("REVIEW") ? true : v))
  );
  const updateSelectedStatuses = (status: SiteStatus) => {
    const position = statuses.indexOf(status);
    setSelectedStatuses((p) => {
      const s = p.map((item, index) => (index === position ? !item : item));
      return s;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-row gap-1 w-full justify-center items-center bg-base-300">
        <StatusSelector
          statuses={statuses}
          selectedStatuses={selectedStatuses}
          updateSelectedStatuses={updateSelectedStatuses}
        />
      </div>
      <QuerySites
        status={statuses.filter((s, i) => selectedStatuses[i]) as SiteStatus[]}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
