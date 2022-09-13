import React, { useEffect, useState } from "react";
import ExploreNavBar from "./ui/ExploreNavBar";
import type { SiteResData } from "../types";
import SecureImg from "./ui/SecureImg";
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
    if (index >= 10 && sites.length > index) {
      //console.log('reset')
      setIndex(0);
      setSites((s) => s.splice(index));
    } else if (sites.length > index + 1) {
      setIndex((i) => (i += 1));
    }
    if (sites.length - index < 3) {
      let more = (
        await (
          await fetch("/api/random", {
            body: JSON.stringify({ userIP: ip, session: session }),
            method: "post",
          })
        ).json()
      ).data as SiteResData[];
      console.log("more?", more);
      if (more?.length > 0) {
        setSites((p) => [...p, ...more]);
      } else if (!(sites.length > index + 1) && location) {
        location.reload();
      }
    }
  };

  return (
    <>
      <nav className="min-w-full fixed bottom-0 md:bottom-auto md:top-0 z-50">
        <ExploreNavBar site={sites[index]} advance={advance} />
      </nav>
      {/* <div className="relative flex flex-grow  overflow-y-auto order-1 md:order-2"> */}
      <main className="min-w-full bg-base-300 min-h-screen flex flex-col">
        <div className="h-0 md:h-20"></div>
        <div className="flex-grow flex flex-col">
          {sites[index].allowEmbed ? (
            <iframe
              className="flex-1 h-full w-full bg-transparent"
              src={sites[index].url}
            ></iframe>
          ) : (
            <div className="flex items-start md:items-center">
              <SecureImg
                imgKey={sites[index].imgKey}
                styles={"min-w-full aspect-video"}
              />
            </div>
          )}
        </div>

        <div className="md:h-0 h-20"></div>
      </main>
      {/* </div> */}
      {/* <div className="fixed top-0 left-0 z-0 bg-base-300 h-screen w-screen">a</div> */}
    </>
  );
}
