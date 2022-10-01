//import QuerySites from "./QuerySites";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemo, useState } from "react";
import type { ReportType, SiteStatus } from "@prisma/client";
import QueryList from "./QueryList";
const queryClient = new QueryClient();

const statuses = [
  "PARSING",
  "REVIEW",
  "APPROVED",
  "REPORTED",
  "REJECTED",
  "BANNED",
];

const reportTypes = [
  "BROKEN",
  "CATEGORY",
  "DISPLAY",
  "OTHER",
  "TAGS",
  "TAGS",
  "TOS",
];

const StatusSelector = ({
  selections,
  selected,
  updateSelected,
}: {
  selections: string[];
  selected: boolean[];
  updateSelected: Function;
}) => {
  return (
    <>
      {selections.map((s: string, i: number) => (
        <label key={s} className="label cursor-pointer">
          <span className="label-text">{s}</span>
          <input
            type={"checkbox"}
            id={`status-${s}`}
            name={s}
            value={s}
            checked={selected[i]}
            className={"checkbox"}
            onChange={(e) => {
              updateSelected(s as unknown as SiteStatus);
            }}
          />
        </label>
      ))}
    </>
  );
};
const defaults = ["REVIEW", "PARSING", "DISPLAY", "TOS"];
const checkInDefault = (i: number, mode: "SITES" | "REPORTS") => {
  let isIndex = false;
  let arrToCheck = mode === "SITES" ? statuses : reportTypes;
  defaults.forEach((d) => {
    if (i === arrToCheck.indexOf(d)) {
      isIndex = true;
    }
  });
  return isIndex;
};
export default function QueryPage({ mode }: { mode: "SITES" | "REPORTS" }) {

  const selections = useMemo(() => mode === "SITES" ? statuses : reportTypes , [mode])

  const [selected, setSelected] = useState<boolean[]>(() =>
    new Array(selections.length)
      .fill(false)
      ?.map((v, i) => (checkInDefault(i, mode) ? true : v))
  );
  const updateSelected = (status: SiteStatus | ReportType) => {
    const position = selections.indexOf(status);
    setSelected((p) => {
      const s = p.map((item, index) => (index === position ? !item : item));
      return s;
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-row gap-1 w-full justify-center items-center bg-base-300">
        <StatusSelector
          selections={selections}
          selected={selected}
          updateSelected={updateSelected}
        />
      </div>
      <QueryList
        key={mode}
        mode={mode}
        status={statuses.filter((s, i) => selected[i]) as SiteStatus[]}
        reportTypes={reportTypes.filter((s,i) => selected[i]) as ReportType[]}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
