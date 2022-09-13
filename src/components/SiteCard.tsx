import React from "react";
import { Share, ExternalLink } from "react-feather";
import type { SiteResData } from "../types";
import SecureImg from "./ui/SecureImg";
// interface Props{
//   url:string,
//   name:string,
//   description?:string,
//   categories: {category:string,description:string}[],
//   tags: {tag:string}[]
// }
const SiteCard = ({
  url,
  name,
  description,
  categories,
  tags,
  imgKey,
  status,
}: SiteResData) => {
  return (
    <div className="card bg-base-100 ">
      <div className="card-body p-4  ">
        <div className=" ">
          <h1 className="card-title text-2xl font-semibold flex items-start justify-between ">
            <span className="flex items-center justify-start gap-1">
              <img
                className={"my-0 aspect-square"}
                src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=32`}
              ></img>
              {name}
            </span>

            <span
              className={
                "badge badge-outline mt-1 mr-1 p-3 flex-none " +
                (status === "REVIEW"
                  ? " badge-primary "
                  : status === "APPROVED"
                  ? " badge-success "
                  : status === "QUARANTINE"
                  ? " badge-warning "
                  : status === "BANNED"
                  ? " badge-error "
                  : " badge-error-content ")
              }
            >
              {status === "REVIEW"
                ? "IN REVIEW"
                : status === "APPROVED"
                ? "APPROVED"
                : status === "QUARANTINE"
                ? "QUARANTINE"
                : status === "BANNED"
                ? "BANNED"
                : "?"}
            </span>
          </h1>
          <span className="">
            <a
              href={url}
              target={"_blank"}
              className="link link-primary flex items-centergap-2"
            >
              {url}
              <ExternalLink size={15} />
            </a>
          </span>
          {imgKey && (
            <div className="bg-neutral rounded-sm overflow-hidden p-2 aspect-video flex items-center justify-center max-h-[80vh]">
              <SecureImg imgKey={imgKey} styles={"rounded-md my-0 aspect-video "} />
            </div>
          )}
          <span className="text-md font-semibold pb-2">
            {categories[0].category}
          </span>
          {description && (
            <p className="pb-4 font-light text-sm">{description}</p>
          )}
          <div className="flex items-center w-full justify-between gap-1">
            <button className="btn btn-ghost btn-active w-full gap-2 btn-sm ">
              <Share size={15} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteCard;
