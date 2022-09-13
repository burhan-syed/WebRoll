import React, { useState } from "react";
import { ThumbsUp, Flag, Info, Menu, Share } from "react-feather";
import Dice from "./icons/Dice";
import type { SiteResData } from "../../types";

import DiceButton from "./buttons/DiceButton";

interface NavBarProps {
  site: SiteResData;
  advance: Function;
}

export default function ExploreNavBar({ site, advance }: NavBarProps) {
  const [showInfo, setShowInfo] = useState(false);

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
            <DiceButton action={advance} />

            </div>
            <button className="btn btn-ghost order-3 md:order-2 ">
              <ThumbsUp size={20} />
            </button>
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
          <span className="text-[10px] text-info-content mx-auto order-1 md:order-2 pb-1 md:pb-0 md:pt-1">
            {site.url}
          </span>
        </div>
        {/* <div className="dropdown"> */}
          <label htmlFor="my-drawer-4" className="btn btn-ghost drawer-button z-50">
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
          {/* <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content  mt-3 p-2 shadow-2xl bg-base-100 rounded-box w-52 bottom-[130%] top-auto right-0 origin-bottom-left md:top-full md:bottom-auto md:origin-top-right border border-base-300"
          >
            <li>
              <a href="/explore">Explore</a>
            </li>
            <li>
              <a href="/submit">Submit</a>
            </li>
            <li>
              <a>About</a>
            </li>
          </ul>
        </div> */}
      </div>
      {showInfo && (
        <div className="card fixed bottom-[4.9rem] md:top-[4.9rem] md:bottom-auto left-1/2 -translate-x-1/2 bg-base-100 border shadow-2xl border border-base-300 ">
          <div className="card-body p-4 w-[80vw] max-w-3xl ">
            <div className=" ">
              <h2 className="card-title text-lg">{site.name}</h2>
              <h3 className="text-md font-semibold pb-2">
                {site.categories[0].category}
              </h3>
              {(site.description || true) && (
                <p className="pb-4 font-light text-sm">{site.description}</p>
              )}

              <div className="flex items-center w-full justify-between gap-1">
                <button className="btn btn-ghost btn-active w-1/2 gap-2 btn-sm ">
                  <Share size={15} />
                  Share
                </button>
                <button className="btn btn-ghost btn-active w-1/2 gap-2 btn-sm ">
                  <Flag size={15} />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
