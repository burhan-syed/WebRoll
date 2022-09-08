import React, { useEffect, useState } from "react";
import ExploreNavBar from "./ui/ExploreNavBar";
import type { SiteResData } from "../types";
const site = "https://www.troddit.com";

export default function ExplorePage({
  initialSites,
  ip,
  session,
}: {
  initialSites: SiteResData[];
  ip: string;
  session: string;
}) {
  const [sites, setSites] = useState(() => initialSites);
  console.log("sites:", sites);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (sites) {
    }
  }, [index]);

  const advance = async () => {
    console.log("advance", sites, index);
    if(index >= 10 && sites.length > index){
      //console.log('reset')
      setIndex(0);
      setSites(s => s.splice(index))
    }
    else if (sites.length > index + 1) {
      setIndex((i) => (i += 1));
    }
    if((sites.length - index) < 3){
      let more = (await (await fetch("/api/random", {
        body: JSON.stringify({ userIP: ip, session: session }),
        method: "post",
      })).json())
        .data as SiteResData[];
      console.log("more?", more);
      if(more?.length > 0){
        setSites((p) => [...p, ...more]);
      }else if(!(sites.length > index + 1) && location) {
        location.reload(); 
      }
    }

  };

  return (
    <>
      <div className="z-10 order-2 md:order-1">
        <ExploreNavBar site={sites[index]} advance={advance} />
      </div>
      <div className="relative flex flex-1  overflow-y-auto order-1 md:order-2">
        <div className="relative flex flex-1 items-center flex-col">
          <iframe
            className="flex-1 w-full bg-transparent"
            src={sites[index].url}
          ></iframe>
        </div>
      </div>
      <div className="fixed top-0 left-0 z-0 bg-base-300 h-screen w-screen"></div>
    </>
  );
}
