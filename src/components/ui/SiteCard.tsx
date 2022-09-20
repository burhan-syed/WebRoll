import { Share, ExternalLink, Search } from "react-feather";
import type { SiteResData } from "../../types";
import SecureImg from "..//ui/SecureImg";

export default function SiteCard ({
  id,
  url,
  name,
  description,
  categories,
  imgKey,
  status,
}: SiteResData) {
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
                  : status === "REPORTED" || status === "PARSING"
                  ? " badge-warning "
                  : status === "BANNED"
                  ? " badge-error "
                  : " badge-error-content ")
              }
            >
              {status}
            </span>
          </h1>
          <span className="flex w-full items-center justify-between gap-2 pb-2">
            <span className="text-md font-semibold ">
              {categories[0].category}
            </span>
            <a
              href={url}
              target={"_blank"}
              className="link link-primary flex items-center gap-2"
            >
              <span className="max-w-md truncate">{url}</span>
              <ExternalLink size={15} />
            </a>
          </span>
          {imgKey && (
            <div
              style={{
                backgroundImage: `radial-gradient(circle, hsl(var(--sc)) 1px, rgba(0, 0, 0, 0) 1px)`,
                backgroundSize: `5px 5px`,
              }}
              className="bg-neutral rounded-sm overflow-hidden p-2 aspect-video flex items-center justify-center max-h-[80vh]"
            >
              <SecureImg
                imgKey={imgKey}
                styles={"rounded-md my-0 aspect-video "}
              />
            </div>
          )}

          {description && (
            <p className="pb-4 font-light text-sm">{description}</p>
          )}
          <div className="my-4"></div>
          <div className="flex flex-col items-center w-full justify-between gap-4">
            <button className="btn btn-ghost btn-active w-full gap-2 btn-sm ">
              <Share size={15} />
              Share
            </button>
            <a
              href={`/site/${id}`}
              target={"_blank"}
              className="btn btn-ghost btn-active w-full gap-2 btn-sm "
            >
              <Search size={15} />
              Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

