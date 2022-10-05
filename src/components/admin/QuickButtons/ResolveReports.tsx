import { useState } from "react";

export default function ResolveReports({ siteID }: { siteID: string }) {
  const [parseLoading, setParseLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [tryResolveAll, setTryResolveAll] = useState(false);
  const onParseRequest = async () => {
    setParseLoading(true);
    try {
      const res = await fetch("/api/admin/resolve-reports", {
        method: "post",
        body: JSON.stringify({ siteID: siteID }),
      });
      if (res.ok) {
        setResolved(true);
        setTryResolveAll(false);
      }
    } catch (err) {
      console.error("report resolve request error", err);
    }
    setParseLoading(false);
  };
  if (!tryResolveAll) {
    return (
      <button
        disabled={tryResolveAll || resolved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTryResolveAll(true);
        }}
        className={"btn  btn-error w-full " + (parseLoading ? "loading" : "")}
      >
        {resolved ? "Resolved" : "RESOLVE ALL REPORTS"}
      </button>
    );
  } else {
    return (
      <div className="w-full">
        <span>Are you sure?</span>
        <div className="flex flex-row w-full items-center">
          <button
            className="btn btn-primary w-2/3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTryResolveAll(false);
            }}
          >
            No
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onParseRequest();
            }}
            className={"btn  btn-error w-1/3 " + (parseLoading ? "loading" : "")}
          >
            Yes
          </button>
        </div>
      </div>
    );
  }
}
