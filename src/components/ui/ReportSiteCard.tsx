import type { Reports, SiteStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { ExternalLink } from "react-feather";
import type { SiteResWithReportsData } from "../../types";
import ParseSite from "../admin/ParseSite";
import UpdateStatuses from "../admin/UpdateStatuses";
import SecureImg from "./SecureImg";

export default function ReportSiteCard({
  site,
  admin = false,
}: {
  site: SiteResWithReportsData;
  admin?: boolean;
}) {
  const groupedReports = useMemo(() => {
    let grouped = new Map<string, number>();
    site.Reports.forEach((r) => {
      let v = grouped.get(r.type);
      if (v) {
        grouped.set(r.type, (v += 1));
      } else {
        grouped.set(r.type, 1);
      }
    });
    return grouped;
  }, [site.Reports]);
  const [status, setStatus] = useState(() => site.status);
  const onUpdateStatus = (newStatus: SiteStatus) => {
    setStatus(newStatus);
  };
  return (
    <div className="flex h-28 ">
      <SecureImg styles="bg-neutral aspect-video h-full" imgKey={site.imgKey} />

      <div className="flex gap-2 bg-base-100/80 backdrop-blur-md shadow-md h-full p-2 rounded-md hover:shadow-xl min-w-full">
        <figure className="flex-none aspect-square w-10 flex items-start justify-center">
          <img
            className={"aspect-square w-[32px] flex-none"}
            src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${site.url}&size=32`}
          />
        </figure>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-row justify-between">
            <h2 className={"font-semibold line-clamp-1 "}>
              {site.name.replace(/\/+$/, "")}
            </h2>
          </div>

          <span className={"flex"}>
            {Array.from(groupedReports.keys()).map((r) => (
              <span key={r}>
                {r}:{groupedReports.get(r)},
              </span>
            ))}
          </span>
          <div className="flex items-center w-full mt-auto gap-1">
            {admin && (
              <>
               <div className="max-w-xs mr-2">
                  <ParseSite siteID={site.id} />
                </div>
                <UpdateStatuses
                  siteID={site.id}
                  statuses={["APPROVED", "REJECTED", "BANNED", "REVIEW"]}
                  onUpdateStatus={onUpdateStatus}
                />
              </>
            )}
            <a
              href={site.url}
              target={"_blank"}
              className="link link-primary flex items-center gap-0.5 max-w-full text-xs ml-auto"
            >
              <span className="truncate">{site.url}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
