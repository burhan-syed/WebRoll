import { useEffect, useState } from "react";
import { Info, ExternalLink, Search } from "react-feather";
import type { minSiteResDataWithLikes } from "../../types";
import Button from "./buttons/Button";

import DiceButton from "./buttons/DiceButton";

interface NavBarProps {
  site: minSiteResDataWithLikes;
  advance: Function;
  advanced: number;
  ip: string;
}

export default function ExploreNavBar({
  site,
  advance,
  advanced,
  ip,
}: NavBarProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [liked, setLiked] = useState<boolean>(() =>
    site.likes?.length > 0 ? site.likes[0]?.direction : false
  );
  useEffect(() => {
    console.log("likes?", site.likes, site.url);
    setLiked(site.likes?.length > 0 ? site.likes[0]?.direction : false);
  }, [site]);

  const handleLike = async () => {
    setLiked((l) => {
      fetch("/api/update-likes", {
        body: JSON.stringify({
          siteID: site.id,
          ip,
          direction: !l,
        }),
        method: "post",
      });
      return !l;
    });
  };
  return (
    <>
      <div
        className="min-w-full navbar p-0 px-0.5 sm:px-2  md:pb-0 bg-base-100 h-20 relative border-t border-t-base-300 md:border-b md:border-b-base-300 md:border-t-transparent items-center justify-between w-full"
        onClick={() => setShowInfo(false)}
      >
        <h1>
          <a
            href="/"
            className="btn btn-ghost normal-case text-base md:text-xl "
          >
            WebRoll
          </a>
        </h1>
        <div className="flex flex-col absolute left-1/2  -translate-x-1/2  mb-2 md:mb-0 md:mt-2">
          <div className="flex items-center gap-2 order-2 md:order-1 ">
            <div className="order-2 md:order-1">
              <DiceButton action={advance} advanced={advanced} />
            </div>
            <div className="order-3 md:order-2">
              <Button
                type="like"
                site={site}
                iconSize={20}
                label={""}
                styles="btn btn-ghost"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInfo((s) => !s);
              }}
              className="btn btn-ghost order-1 md:order-3"
            >
              <Info size={20} />
            </button>
          </div>
          <a
            target={"_blank"}
            href={site.url}
            className="text-[10px] text-info-content mx-auto order-1 md:order-2 pb-1 md:pb-0 md:pt-1"
          >
            {site.url}
          </a>
        </div>
        {/* <div className="dropdown"> */}
        <label
          htmlFor="my-drawer-4"
          className="btn btn-ghost drawer-button z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M 4 6 h 16 M 4 12 h 16 M 13 18 h 7"
            />
          </svg>
        </label>
      </div>
      {showInfo && (
        <div className="card fixed bottom-[4.9rem] md:top-[4.9rem] md:bottom-auto left-1/2 -translate-x-1/2 bg-base-100 border shadow-2xl border-base-300 ">
          <div className="card-body p-4 w-[80vw] max-w-3xl ">
            <div className="flex justify-between sm:flex-col gap-1 ">
              <div className="w-2/3 sm:w-auto">
                <h1 className="card-title text-lg sm:text-xl font-light">{site.name}</h1>
                <h2 className="text-md font-light pb-2  py-0.5 flex items-center justify-between gap-2 flex-wrap">
                  <span>{site.categories.map(c => c.category).join(",")} </span>{" "}
                  <a
                    href={site.url}
                    target={"_blank"}
                    className="link link-primary flex items-center gap-2 max-w-lg truncate"
                  >
                    <span className="truncate">{site.url}</span>
                    <ExternalLink size={15} className="flex-none" />
                  </a>
                </h2>
                {(site.description || true) && (
                  <p className="pb-4 font-light text-sm">{site.description}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:w-full justify-evenly gap-1 w-1/3">
                <Button
                  styles={"btn btn-ghost btn-active sm:w-1/3 h-1/3 gap-1 sm:gap-2 sm:h-auto btn-sm  "}
                  type={"share"}
                  site={site}
                  tooltipLocation={"top"}
                />
                <a
                  href={`/sites/${site.id}`}
                  className="btn btn-ghost btn-active sm:w-1/3 h-1/3 gap-1 sm:gap-2 sm:h-auto btn-sm "
                >
                  <Search size={15} />
                  Details
                </a>
                <Button
                  styles={"btn btn-ghost btn-active sm:w-1/3 h-1/3 gap-1 sm:gap-2 sm:h-auto btn-sm "}
                  type={"report"}
                  site={site}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
