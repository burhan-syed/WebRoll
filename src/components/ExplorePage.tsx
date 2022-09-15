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
      {/* <div className="fixed bottom-1/2 left-0 z-20 text-xl bg-black text-white">
        {index},{sites[index].allowEmbed ? "allowed" : "nope"}
      </div> */}
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
              <div className="flex items-start overflow-hidden md:items-center justify-center flex-grow relative shadow-inner">
                <div className="fixed z-20 top-1/2 left-1/2 card -translate-y-1/2 -translate-x-1/2 bg-base-100/80 backdrop-blur-md shadow-xl   max-w-sm md:max-w-2xl border border-base-200 w-full">
                  <div className="card-body ">
                    <p>We can't display this site directly but you can visit it below</p>
                  
                    <h2 className="card-title">{sites[index].name}</h2>
                    <a href={sites[index].url}>{sites[index].url}</a>
                    <p className="max-h-80 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary text-sm text-neutral ">{sites[index].description}</p>
                    <div className="card-actions justify-end mt-2">
                      <a href={`/site/${sites[index].id}`} className="btn">View Page</a>
                      <a href={sites[index].url} className="btn btn-primary">Visit Site</a>
                    </div>
                  </div>
                </div>
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
                  className="w-full h-full absolute blur-lg brightness-[0.8]"
                  src={siteImgURL.img}
                  alt="site screen"
                />
                <span
                  className="absolute bottom-2 text-xs text-neutral text-opacity-50"
                  style={{ textShadow: "0px 1px #FFFFFF90" }}
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
