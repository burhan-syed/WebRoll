import { useEffect, useState } from "react";
import ExploreNavBar from "./ui/ExploreNavBar";
import type { minSiteResDataWithLikes } from "../types";
import BgImage from "./ui/BgImage";
import ReportModal from "./ui/ReportModal";

export default function ExplorePage({
  initialSites,
  initialSiteImgURL,
  ip,
}: {
  initialSites: minSiteResDataWithLikes[];
  ip: string;
  initialSiteImgURL: string;
}) {
  const [sites, setSites] = useState(() => initialSites);
  const [siteImgURL, setSiteImgURL] = useState(() => ({
    url: initialSites[0].url,
    img: initialSiteImgURL,
  }));
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

  //prevent hydration mismatch
  useEffect(() => {
    setIndex(0);
    setSites(initialSites);
    setSiteImgURL({ url: initialSites[0].url, img: initialSiteImgURL });
  }, [initialSiteImgURL, initialSiteImgURL]);

  const [ratelimitMessage, setRateLimitMessage] = useState(""); 
  useEffect(() => {
    let timeout: NodeJS.Timeout; 
    if(ratelimitMessage){
      timeout = setTimeout(() => {setRateLimitMessage("")}, 5000)
    }
    return () => {
      timeout && clearTimeout(timeout); 
    }
  }, [ratelimitMessage])

  const advance = async () => {
    console.log("advance", sites, index);
    if (index >= 10 && sites.length > index) {
      setIndex(0);
      setSites((s) => s.splice(index));
    } else if (sites.length > index + 1) {
      setIndex((i) => (i += 1));
    }
    if (sites.length - index < 3) {
      const res = await fetch("/api/random", { method: "get" });
      if (res.ok) {
        let more = (await res.json()).data as minSiteResDataWithLikes[];
        if (more?.length > 0) {
          setRateLimitMessage("");
          setSites((p) => [...p, ...more]);
        } else if (!(sites.length > index + 1) && location) {
          location.reload();
        }
      } else if (res.status === 429) {
        setRateLimitMessage("Woah, chill on that button!")
      } else {
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
          body: JSON.stringify({ siteID: site.id }),
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
        />
      </nav>
      {/* <div className="fixed bottom-1/2 left-0 z-20 text-xl bg-black text-white">
        {index},{sites[index].allowEmbed ? "allowed" : "nope"}
      </div> */}
      <main className="min-w-full bg-base-300 min-h-screen flex flex-col">
        <div className="h-0 md:h-20"></div>
        <div
          className="flex-grow flex flex-col bg-neutral"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--sc)) 1px, rgba(0, 0, 0, 0) 1px)`,
            backgroundSize: `5px 5px`,
          }}
        >
          <div className={"fixed top-0 md:bottom-0 md:top-auto left-1/2 -translate-x-1/2 z-50  w-60  " + "transition-all duration-200  " + (ratelimitMessage ? " opacity-100 translate-y-1/3 md:-translate-y-1/3 ease-in " : " opacity-100 -translate-y-full md:translate-y-full ease-out ")}><div className="alert alert-warning shadow-md border border-error">{ratelimitMessage}</div></div>
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
              <div className="flex  overflow-hidden items-start md:items-center justify-center flex-grow relative shadow-inner">
                <div className="fixed z-20 top-1/2 left-1/2 card -translate-y-1/2 -translate-x-1/2 bg-base-100/80 backdrop-blur-md shadow-xl   max-w-sm md:max-w-2xl border border-base-200 w-full">
                  <div className="card-body ">
                    <p>
                      We can't display this site directly but you can visit it
                      below
                    </p>

                    <h2 className="card-title">{sites[index].name}</h2>
                    <a href={sites[index].url}>{sites[index].url}</a>
                    <p className="max-h-80 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary text-sm text-neutral ">
                      {sites[index].description}
                    </p>
                    <div className="card-actions justify-center md:justify-end mt-2">
                      <a href={sites[index].url} className="btn btn-primary">
                        Visit Site
                      </a>
                    </div>
                  </div>
                </div>
                <BgImage
                  src={siteImgURL.img}
                  loadEvent={handleSiteLoad}
                  loadEventParams={sites[index]}
                />
              </div>
            )
          )}
        </div>

        <div className="md:h-0 h-20"></div>
      </main>
      <ReportModal siteID={sites[index].id} />
    </>
  );
}
