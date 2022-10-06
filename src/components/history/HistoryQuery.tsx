import type { HistoryPage, minSiteResData } from "../../types";
import { useQuery } from "@tanstack/react-query";
import SmallSiteCard from "../ui/SmallSiteCard";

export default function HistoryQuery({ items }: { items: HistoryPage[] }) {
  const fetchSites = async () => {
    const params = new URLSearchParams({
      sites: JSON.stringify(items.map((s) => s.site)),
    }).toString();
    const res = await fetch(`/api/query/get-sites?${params}`, {
      method: "get",
    });
    const data = await res.json();
    return {
      sites: data?.data ?? [],
    } as { sites: minSiteResData[] };
  };

  const query = useQuery(["history", items.map((s) => s.site)], fetchSites, {
    enabled: items && items.length > 0,
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <ul className="flex flex-col flex-grow gap-2 ">
        {query?.data?.sites ? (
          <>
            {query.data?.sites?.map((site) => (
              <li>
                <a rel="preload" href={`/sites/${site.id}`}>
                  <SmallSiteCard site={site as minSiteResData} />
                </a>
              </li>
            ))}
          </>
        ) : query?.isLoading ? (
          <>
            {items.map((s) => (
              <li>
                <div className="flex gap-2 bg-base-100/80 backdrop-blur-md shadow-md h-28 p-2 overflow-hidden rounded-md hover:shadow-xl">
                  <div
                    className={
                      " w-[32px] h-[32px] animate-pulse rounded-full bg-base-300 mt-2"
                    }
                  />
                  <div className="flex flex-col gap-1 w-full mt-2">
                    <div className={"h-6 w-2/3 bg-base-200 animate-pulse rounded-md"}></div>
                    <p className="flex flex-col gap-0.5">
                      <div className="h-4 w-full bg-base-200 animate-pulse rounded-md"></div>
                      <div className="h-4 w-2/3 bg-base-200 animate-pulse rounded-md"></div>

                    </p>
                    <span className="w-32 h-4 animate-pulse rounded-md bg-base-200 ml-auto mt-auto"></span>
                  </div>
                </div>
              </li>
            ))}
          </>
        ) : (
          <span className="my-auto mx-auto">something went wrong</span>
        )}
      </ul>
    </>
  );
}
