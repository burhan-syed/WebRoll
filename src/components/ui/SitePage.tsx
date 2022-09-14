import type { SiteStatus } from "@prisma/client";
import React from "react";
import { ExternalLink, Flag, Share } from "react-feather";

interface SiteData {
  url: string;
  id: string;
  name: string;
  description: string | null;
  status: SiteStatus;
  imgKey: string | null;
  sourceLink: string | null;
  views: number;
  allowEmbed: boolean;
  likes: number;
  categories: {
    category: string;
    description: string | null;
  }[];
  tags: {
    tag: string;
  }[];
}

const SitePage = ({
  siteImgURL,
  siteData,
}: {
  siteImgURL: string;
  siteData: SiteData;
}) => {
  return (
    <div className="flex flex-col flex-grow ">
      <header
        className="fixed top-0 w-screen flex items-center justify-center  aspect-video bg-scroll bg-cover bg-no-repeat bg-top z-0 bg-neutral md:invisible"
        style={siteImgURL ? { backgroundImage: `url(${siteImgURL})` } : {}}
      >
        {!siteImgURL && <span className="text-xs">no image</span>}
      </header>
      <div className="aspect-video w-full md:invisible md:w-0"></div>
      <div className="rounded-t-2xl md:rounded-t-none bg-base-200 border-t border-base-100 -mt-10 md:mt-0 z-10 relative flex-grow  flex flex-col overflow-auto">
        {/* <div className="flex items-center justify-center mt-0.5 absolute h-4 top-0 z-20">
        <div className="bg-neutral rounded opacity-40 w-1/3 h-2 z-20"></div>

        </div> */}
        <div
          className=" md:max-w-none m-auto flex-grow flex flex-col min-w-full "
          style={{}}
        >
          <h1 className="text-2xl p-4 pb-0 ">
            <a
              href={siteData.url}
              target={"_blank"}
              rel={"norefferer"}
              className="flex items-start md:flex-row-reverse justify-between gap-1 no-underline font-light"
            >
              <span className="">{siteData.name.replace(/\/+$/, '')}</span>
              <img
                className={"my-0 aspect-square"}
                src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${siteData.url}&size=32`}
              ></img>
            </a>
          </h1>
          <div className="flex flex-col flex-grow lg:flex-row-reverse lg:justify-end ">
            <p className="my-0 pt-0 px-4 lg:hidden lg:p-0 lg:m-0  ">
              {siteData.description}
            </p>
            <div
              className={
                " rounded-none shadow-inner h-[50vh] lg:h-auto lg:flex-grow bg-neutral w-full lg:w-2/3 xl:w-3/4 relative " +
                (siteData.allowEmbed ? "  " : " hidden md:block my-4 lg:my-0 ")
              }
            >
              {siteData.allowEmbed ? (
                <iframe className="w-full h-full " src={siteData.url}></iframe>
              ) : (
                <div className="flex items-center justify-center h-[50vh] lg:h-full ">
                  <img
                    className="w-full z-10 shadow"
                    src={siteImgURL}
                    alt="site screen"
                  />
                  <img
                    className="w-full h-full absolute blur-lg "
                    src={siteImgURL} 
                    alt="site screen"
                  />
                  <span className="absolute bottom-2 text-xs text-neutral text-opacity-50" style={{textShadow: "0px 1px #FFFF"}}>
                    embed unavailable, showing screenshot
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col lg:w-1/3 xl:w-1/4 lg:px-4 ">
              <span className="w-full lg:flex items-center justify-start hidden order-1  ">
                <a
                  href={siteData.url}
                  target={"_blank"}
                  className="link link-primary flex items-center gap-2 max-w-full"
                >
                  <span className="truncate">{siteData.url}</span>
                  <ExternalLink size={15} />
                </a>
              </span>
              <p className="pt-0 hidden lg:block order-2 ">
                {siteData.description}
              </p>
              <div className="flex-grow lg:order-3"></div>

              <div className="w-full lg:order-4 order-5 ">
                <p className="mb-4 flex flex-col gap-1 bg-base-100 p-4  font-light text-sm shadow w-full">
                  <span className="flex justify-between">
                    <span>views</span>
                    {siteData.views}
                  </span>
                  <span className="flex justify-between">
                    <span>likes</span>
                    {siteData.likes}
                  </span>
                  {siteData.sourceLink && (
                    <span className="flex justify-between">
                      <span>source</span>
                      <a
                        className="font-light"
                        href={siteData.sourceLink}
                        target={"_blank"}
                        rel={"norefferer"}
                      >
                        {siteData.sourceLink}
                      </a>
                    </span>
                  )}
                  <span className="flex justify-between">
                    <span>category</span>
                    {siteData.categories[0].category}
                  </span>
                  <span className="flex justify-between">
                    <span>status</span>
                    {siteData.status}
                  </span>
                </p>
                <div className="bg-base-100 text-sm border p-4 pt-2 shadow w-full ">
                  <span className="">tags</span>
                  <div className="my-1"></div>
                  <div className="flex justify-center items-center gap-1">
                    {siteData.tags.length > 0 ? (
                      <>
                        {siteData.tags.map((tag) => (
                          <div className="lowercase btn btn-xs text-xs font-light text-base-100 flex items-center px-2 rounded-full bg-primary-focus">
                            {tag.tag}
                          </div>
                        ))}
                      </>
                    ) : (
                      <span>no tags found</span>
                    )}
                  </div>
                </div>
                {siteData.status === "REVIEW" && (
                  <div className="text-sm font-semibold text-neutral text-center mx-auto py-2">
                    <span>{`Submitted site under review.`}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center w-full justify-between gap-4 max-w-lg mx-auto my-4 px-4 lg:order-5 order-4">
                <span className="w-full flex items-center justify-center lg:invisible ">
                  <a
                    href={siteData.url}
                    target={"_blank"}
                    className="link link-primary flex items-center gap-2 max-w-full"
                  >
                    <span className="truncate">{siteData.url}</span>
                    <ExternalLink size={15} />
                  </a>
                </span>
                <button className="btn btn-ghost btn-active w-full gap-2 btn-sm ">
                  <Share size={15} />
                  Share
                </button>
                <button className="btn btn-ghost btn-active w-full gap-2 btn-sm ">
                  <Flag size={15} />
                  Report
                </button>
              </div>

              <div className="max-w-lg px-4 py-4 w-full mx-auto order-6">
                <a
                  href="/submit"
                  className="btn btn-primary text-base-100 shadow-xl w-full capitalize max-w-lg"
                >
                  Submit A Site
                </a>
              </div>

              <p className="text-xs font-light text-center px-4 max-w-lg mx-auto order-7">{`Please use the Report button if you think this site is categorized incorrectly, has invalid tags, is broken, or breaks WebRoll submission rules. `}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePage;
