import type { SiteStatus } from "@prisma/client";
import { useState } from "react";
import { ExternalLink } from "react-feather";
import type { minSiteResData } from "../../types";
import UpdateStatuses from "../admin/UpdateStatuses";

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
  }
  return (
    <div className="flex gap-2 bg-base-100/80 backdrop-blur-md shadow-md h-28 p-2 overflow-hidden rounded-md hover:shadow-xl">
      <figure className="flex-none aspect-square w-10 flex items-center justify-center">
        <img
          className={"aspect-square w-[32px] flex-none"}
          src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${site.url}&size=32`}
        />
      </figure>
      <div className="flex flex-col gap-1 w-full">
        <h2
          className={
            "font-semibold line-clamp-2 " + (site.description ? "" : "md:mt-2")
          }
        >
          {site.name.replace(/\/+$/, "")}
        </h2>
        <p className="overflow-auto max-h-[2rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary text-xs ">
          {site.description}
        </p>
        <div className="flex items-center w-full mt-auto gap-1">
          <span
            className={
              "badge badge-outline p-1 flex-none text-cs" +
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
          {admin && (
            <>
            <UpdateStatuses siteID={site.id} statuses={["APPROVED", "REJECTED", "BANNED", "REVIEW"]} onUpdateStatus={onUpdateStatus}/>
       
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
  );
}
