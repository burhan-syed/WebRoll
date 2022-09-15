import { useEffect, useState } from "react";
import ExploreNavBar from "./ui/ExploreNavBar";
import type { minSiteResDataWithLikes } from "../types";

export default function ExplorePage({
  initialSites,
  initialSiteImgURL,
  ip,
  session,
}: {
  initialSites: minSiteResDataWithLikes[];
  ip: string;
  session: string;
  initialSiteImgURL: string;
}) {
  const [sites, setSites] = useState(() => initialSites);
  const [siteImgURL, setSiteImgURL] = useState(() => ({
    url: initialSites[0].url,
    img: initialSiteImgURL,
  }));
  console.log("sites:", sites);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const fetchSecureImage = async (url: string, imgId: string | null) => {
      const img = (await (await fetch(`/api/images/${imgId}`)).json())?.url;
      console.log("fetch..", img);

      setSiteImgURL({ url: url, img: img });
    };
    if (sites[index].allowEmbed === false) {
      siteImgURL.url !== sites[index].url &&
        fetchSecureImage(sites[index].url, sites[index].imgKey);
    }
  }, [index]);

  useEffect(() => {
    console.log("imgurl?", siteImgURL);
  }, [siteImgURL]);

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
            body: JSON.stringify({ userIP: ip, sessionID: session }),
            method: "post",
          })
        ).json()
      ).data as minSiteResDataWithLikes[];
      console.log("more?", more);
      if (more?.length > 0) {
        setSites((p) => [...p, ...more]);
      } else if (!(sites.length > index + 1) && location) {
        location.reload();
      }
    }
  };

  const [advanced, setAdvanced] = useState(0);
  const [sitesAdvanced, setSitesAdvanced] = useState(new Set());
  const handleSiteLoad = (site: minSiteResDataWithLikes) => {
    setAdvanced((p) => p + 1);
    setSitesAdvanced((pSites) => {
      if (!pSites.has(site.id)) {
        fetch("/api/update-view", {
          body: JSON.stringify({ siteID: site.id, sessionID: session }),
          method: "post",
        });
      }
      pSites.add(site.id);
      return pSites;
    });

    let rollHistory = JSON.parse(
      localStorage.getItem("webroll_history") ?? "[]"
    ) as { site: string; time: Date }[];
    localStorage.setItem(
      "webroll_history",
      JSON.stringify([{ site: site.id, time: new Date() }, ...rollHistory])
    );
  };

  return (
    <>
      <nav className="min-w-full fixed bottom-0 md:bottom-auto md:top-0 z-50">
        <ExploreNavBar
          site={sites[index]}
          advance={advance}
          advanced={advanced}
          ip={ip}
          sessionID={session}
        />
      </nav>
      {/* <div className="relative flex flex-grow  overflow-y-auto order-1 md:order-2"> */}
      <div className="fixed bottom-1/2 left-0 z-20 text-xl bg-black text-white">
        {index},{sites[index].allowEmbed ? "allowed" : "nope"}
      </div>
      <main className="min-w-full bg-base-300 min-h-screen flex flex-col">
        <div className="h-0 md:h-20"></div>
        <div className="flex-grow flex flex-col">
          {sites[index].allowEmbed === true ? (
            <iframe
              className="flex-1 h-full w-full bg-transparent"
              src={sites[index].url}
              onLoad={() => {
                console.log("iframe loaded");
                handleSiteLoad(sites[index]);
              }}
              onError={() => {
                console.log("iframe error");
                setAdvanced((p) => p + 1);
              }}
            ></iframe>
          ) : (
            siteImgURL.url === sites[index].url && (
              <div className="flex items-start md:items-center justify-center flex-grow relative shadow-inner">
                <img
                  className="w-full z-10 shadow"
                  src={siteImgURL.img}
                  alt="site screen"
                  onLoad={() => {
                    console.log("img loaded");
                    handleSiteLoad(sites[index]);
                  }}
                />
                <img
                  className="w-full h-full absolute blur-lg "
                  src={siteImgURL.img}
                  alt="site screen"
                />
                <span
                  className="absolute bottom-2 text-xs text-neutral text-opacity-50"
                  style={{ textShadow: "0px 1px #FFFF" }}
                >
                  embed unavailable, showing screenshot
                </span>
              </div>
            )
          )}
        </div>

        <div className="md:h-0 h-20"></div>
      </main>
    </>
  );
}
