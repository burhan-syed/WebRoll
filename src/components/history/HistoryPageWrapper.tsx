import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Trash } from "react-feather";
import { useEffect, useState } from "react";
import type { HistoryPage } from "../../types";
import Paginator from "../ui/buttons/Paginator";
import Refresh from "../ui/buttons/Refresh";
import HistoryQuery from "./HistoryQuery";
const queryClient = new QueryClient();

export default function HistoryPageWrapper() {
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [historyPages, setHistoryPages] = useState<HistoryPage[][]>();
  const [cPage, setCPage] = useState(1);
  const [pages, setPages] = useState([1]);
  useEffect(() => {
    setLoading(true);
    const history = localStorage.getItem("webroll_history");
    if (history) {
      const historyParsed = JSON.parse(history) as HistoryPage[];
      const sitesPerPage = 10;
      setHistoryPages(() => {
        let pages = new Array(
          Math.ceil(historyParsed.length / sitesPerPage)
        ).fill([]);
        pages = pages.map((g, i) => [
          ...historyParsed.slice(i * sitesPerPage, (i + 1) * sitesPerPage),
        ]);
        //console.log("pages:", pages, pages[0]);
        return pages;
      });
    }
    setLoading(false);
  }, [refresh]);

  useEffect(() => {
    if (historyPages && historyPages?.length > 1) {
      const totalPages = historyPages.length;
      setPages(() =>
        Array.from(Array(totalPages), (e, i) => {
          const pNum = i + 1;
          return (totalPages <= 7 ? pNum : cPage < 5 && pNum < 6) ||
            (totalPages - pNum < 5 && totalPages - cPage < 4)
            ? pNum
            : Math.abs(cPage - pNum) < 2
            ? pNum
            : pNum === 1 || pNum === totalPages
            ? pNum
            : -100;
        }).filter((pNum, i) =>
          pNum > 0
            ? true
            : pNum === 1 || pNum === totalPages
            ? true
            : totalPages - i === 2 || i === 1
            ? true
            : false
        )
      );
    }
  }, [cPage, historyPages]);

  const doRefresh = () => {
    setCPage(1);
    setRefresh((r) => (r += 1));
  };

  const clearAll = () => {
    localStorage.removeItem("webroll_history");
    queryClient.invalidateQueries();
    setHistoryPages(undefined);
    setCPage(1);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col p-4 flex-grow bg-base-100/90 backdrop-blur-md border-base-300 rounded-lg not-prose">
        <h1 className="text-3xl mb-6 flex items-center justify-between gap-2">
          History
          <div className="flex z-10 items-center">
            <div
              className={
                "tooltip hover:tooltip-open tooltip-bottom " +
                (historyPages && historyPages.length > 0 ? "" : " hidden ")
              }
              data-tip="clear all"
            >
              <label
                htmlFor="clear-history"
                className="btn btn-ghost rounded-full "
              >
                <Trash />
              </label>
            </div>
            <div
              className="tooltip hover:tooltip-open tooltip-bottom"
              data-tip="refresh"
            >
              <Refresh
                styles={
                  "btn btn-ghost rounded-full " + (loading ? "" : " group ")
                }
                iconStyles={loading ? " animate-spin " : ""}
                size={20}
                clickAction={doRefresh}
              />
            </div>
          </div>
        </h1>
        {historyPages && historyPages.length > 0 ? (
          <>
            <HistoryQuery items={historyPages[cPage - 1]} />
          </>
        ) : (
          <span>no history</span>
        )}
      </div>
      {historyPages && historyPages?.length > 1 && (
        <div className="flex relative py-2 px-4 bg-base-100/90 backdrop-blur-md border-base-300 rounded-lg">
          <div className="btn-group mx-auto">
            <Paginator
              currentPage={cPage}
              pages={pages}
              buttons={true}
              buttonAction={setCPage}
            />
          </div>
        </div>
      )}
      <input type="checkbox" id="clear-history" className="modal-toggle" />
      <label htmlFor="clear-history" className="modal cursor-pointer ">
        <label
          className="modal-box relative bg-base-100/80 backdrop-blur-md "
          htmlFor=""
        >
          <h3 className="font-bold text-lg">Clear All History?</h3>
          <p className="py-4">This cannot be undone.</p>
          <div className="modal-action">
            <label
              onClick={clearAll}
              htmlFor="clear-history"
              className="btn btn-warning"
            >
              Yes
            </label>
            <label htmlFor="clear-history" className="btn btn-primary">
              No
            </label>
          </div>
        </label>
      </label>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
