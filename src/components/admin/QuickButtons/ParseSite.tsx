import { useState } from "react";

export default function ParseSite({ siteID }: { siteID: string }) {
  const [parseLoading, setParseLoading] = useState(false);

  const onParseRequest = async () => {
    setParseLoading(true);
    try {
      const res = await fetch("/api/admin/parse-site", {
        method: "post",
        body: JSON.stringify({ siteID: siteID }),
      });
    } catch (err) {
      console.error("parse request error", err);
    }
    setParseLoading(false);
  };
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onParseRequest();
      }}
      className={"btn btn-sm btn-error w-full " + (parseLoading ? "loading" : "")}
    >
      parse
    </button>
  );
}
