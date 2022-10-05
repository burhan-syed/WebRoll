import { useState } from "react";

export default function ResolveAReport({ reportID }: { reportID: number }) {
  const [parseLoading, setParseLoading] = useState(false);
  const [resolved, setResolved] = useState(false); 
  const onParseRequest = async () => {
    setParseLoading(true);
    try {
      const res = await fetch("/api/admin/resolve-reports", {
        method: "post",
        body: JSON.stringify({ reportID: reportID }),
      });
      if(res.ok){
        setResolved(true); 
      }
    } catch (err) {
      console.error("accept report error", err);
    }
    setParseLoading(false);
  };
  return (
    <button
      disabled={resolved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onParseRequest();
      }}
      className={"btn  btn-primary w-full " + (parseLoading ? "loading" : "")}
    >
      {resolved ? "RESOLVED" : "RESOLVE"}
    </button>
  );
}
