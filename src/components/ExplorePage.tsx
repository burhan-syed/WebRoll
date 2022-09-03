import React from "react";
import ExploreNavBar from "./ExploreNavBar";

const site = "https://www.troddit.com"

export default function ExplorePage(){
  return (
    <>
      <div className="z-10 order-2 md:order-1">
        <ExploreNavBar site={site} />
      </div>
      <div className="relative flex flex-1  overflow-y-auto order-1 md:order-2">
        <div className="relative flex flex-1 items-center flex-col">
          <iframe
            className="z-10 flex-1 w-full bg-transparent"
            src={site}
          ></iframe>
        </div>
      </div>
      <div className="fixed top-0 left-0 z-0 bg-blue-500 h-screen w-screen"></div>
    </>
  );
};

