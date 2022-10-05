import type { SiteStatus } from "@prisma/client";
import { useState } from "react";
import { ExternalLink } from "react-feather";
import type { minSiteResData } from "../../types";
import ParseSite from "../admin/QuickButtons/ParseSite";
import UpdateStatuses from "../admin/QuickButtons/UpdateStatuses";
import SecureImg from "./SecureImg";

export default function SiteCardHorizontal({
  site,
  admin = false,
}: {
  site: minSiteResData;
  admin?: boolean;
}) {
  const [status, setStatus] = useState(() => site.status);
  const onUpdateStatus = (newStatus: SiteStatus) => {
    setStatus(newStatus);
  };
  return (
    <div className="flex h-28 ">
      <SecureImg styles="bg-neutral aspect-video h-full" imgKey={site.imgKey} />

      <div className="flex gap-2 bg-base-100/80 backdrop-blur-md shadow-md h-full p-2 rounded-md hover:shadow-xl flex-grow min-w-full">
        <figure className="flex-none aspect-square w-10 flex items-start justify-center">
          <img
            className={"aspect-square w-[32px] flex-none"}
            src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${site.url}&size=32`}
          />
        </figure>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-row justify-between">
            <h2
              className={
                "font-semibold line-clamp-2 " +
                (site.description ? "" : "md:mt-2")
              }
            >
              {site.name.replace(/\/+$/, "")}
            </h2>
            <span
              className={
                "badge badge-outline p-0.5 flex-none text-xs" +
                (status === "REVIEW"
                  ? " badge-primary "
                  : status === "APPROVED"
                  ? " badge-success "
                  : status === "REPORTED" || status === "PARSING"
                  ? " badge-warning "
                  : status === "BANNED"
                  ? " badge-error "
                  : " badge-error-content ")
              }
            >
              {status}
            </span>
          </div>

          <p className="overflow-auto max-h-[2rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary text-xs ">
            {site.description}
          </p>
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
