import { useState } from "react";

export default function ApplyReportt({ reportID }: { reportID: number }) {
  const [parseLoading, setParseLoading] = useState(false);
  const [applied, setApplied] = useState(false); 
  const onParseRequest = async () => {
    setParseLoading(true);
    try {
      const res = await fetch("/api/admin/accept-report", {
        method: "post",
        body: JSON.stringify({ reportID: reportID }),
      });
      if(res.ok){
        setApplied(true); 
      }
    } catch (err) {
      console.error("accept report error", err);
    }
    setParseLoading(false);
  };
  return (
    <button
      disabled={applied}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onParseRequest();
      }}
      className={"btn  btn-primary w-full " + (parseLoading ? "loading" : "")}
    >
      {applied ? "APPLIED" : "APPLY REPORT"}
    </button>
  );
}
