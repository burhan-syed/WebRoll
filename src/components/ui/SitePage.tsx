import { ExternalLink, Flag, Share } from "react-feather";
import type { SiteResDataWithLikes } from "../../types";

const SitePage = ({
  siteImgURL,
  siteData,
}: {
  siteImgURL: string;
  siteData: SiteResDataWithLikes;
}) => {
  return (
    <div className="flex flex-col flex-grow ">
      <header
        className="fixed top-0 w-screen flex items-center justify-center  aspect-video bg-scroll bg-cover bg-top z-10  md:invisible bg-neutral"
        style={
          siteImgURL
            ? {
                backgroundImage: `url(${siteImgURL})`,
                backgroundRepeat: `no-repeat`,
              }
            : {
                backgroundImage: `radial-gradient(circle, hsl(var(--sc)) 1px, rgba(0, 0, 0, 0) 1px)`,
                backgroundSize: `5px 5px`,
              }
        }
      >
        {/* {!siteImgURL && <span className="text-xs">no image</span>} */}
      </header>
      <header
        className="fixed top-0 w-screen h-screen  flex items-center justify-center  aspect-video bg-scroll bg-cover bg-no-repeat bg-top bg-neutral md:top-20 "
        style={
          siteImgURL
            ? { backgroundImage: `url(${siteImgURL})` }
            : {
                backgroundImage: `radial-gradient(circle, hsl(var(--sc)) 1px, rgba(0, 0, 0, 0) 1px)`,
                backgroundSize: `5px 5px`,
              }
        }
      >
        {!siteImgURL && <span className="text-xs">no image</span>}
      </header>
      <div className="aspect-video w-full md:invisible md:w-0"></div>
      <div className="rounded-t-2xl md:rounded-t-none bg-base-200/80 md:bg-base-200 border-t border-base-100 -mt-10 md:mt-0 z-10 relative flex-grow  flex flex-col overflow-auto backdrop-blur-md">
        <div className="flex items-center justify-center  absolute h-4 top-0 z-20 w-full md:hidden">
          <div className="bg-black rounded opacity-40 w-10 h-1 z-20"></div>
        </div>
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
              <span className="">{siteData.name.replace(/\/+$/, "")}</span>
              <img
                className={"my-0 aspect-square"}
                src={`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${siteData.url}&size=32`}
              ></img>
            </a>
          </h1>
          <div className="flex flex-col flex-grow lg:flex-row-reverse lg:justify-end ">
            {siteData.description && (
              <p className="my-0 pt-0 px-4 pb-2 lg:hidden lg:p-0 lg:m-0  ">
                {siteData.description}
              </p>
            )}

            {/* <div className="py-2"></div> */}
            <div
              className={
                " rounded-none shadow-inner h-[50vh] lg:h-auto lg:flex-grow bg-neutral w-full lg:w-2/3 xl:w-3/4 relative " +
                (siteData.allowEmbed ? "  " : " hidden md:block my-4 lg:my-0 ")
              }
              style={{
                backgroundImage: `radial-gradient(circle, hsl(var(--sc)) 1px, rgba(0, 0, 0, 0) 1px)`,
                backgroundSize: `5px 5px`,
              }}
            >
              {siteData.allowEmbed ? (
                <iframe className="w-full h-full " src={siteData.url}></iframe>
              ) : (
                <div className="flex items-center justify-center h-[50vh] lg:h-full overflow-hidden">
                  {siteImgURL ? (
                    <>
                      <img
                        className="aspect-video max-h-[50vh] lg:max-h-[80vh] z-10 shadow"
                        src={siteImgURL}
                        alt=""
                      />
                      <img
                        className="w-full h-full absolute blur-3xl brightness-[0.8] "
                        src={siteImgURL}
                        alt=""
                      />
                      <span
                        className="absolute bottom-2 text-xs text-white text-opacity-50 "
                        style={{ textShadow: "0px 1px #FFFFFF20" }}
                      >
                        embed unavailable, displaying screenshot
                      </span>
                    </>
                  ) : (
                    <span
                      className="absolute bottom-2 text-xs text-white text-opacity-50 "
                      style={{ textShadow: "0px 1px #FFFFFF20" }}
                    >
                      awaiting screenshot
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col lg:w-1/3 xl:w-1/4 lg:px-4 flex-grow md:bg-base-200">
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
                <p className=" mb-0 flex flex-col gap-1 bg-base-100 p-4  font-light text-sm shadow w-full">
                  <span className="flex justify-between">
                    <span>views</span>
                    {siteData.views}
                  </span>
                  <span className="flex justify-between">
                    <span>likes</span>
                    <span>{siteData.likes}</span>
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
                {(siteData.status === "REVIEW" ||
                  siteData.status === "PARSING") && (
                  <div className=" mt-4 text-sm font-semibold text-neutral text-center mx-auto py-2">
                    {siteData.status === "REVIEW" ? (
                      <span>{`Submitted site under review.`}</span>
                    ) : (
                      <span>{`Site is being parsed. Check back later for review status.`}</span>
                    )}
                  </div>
                )}
                <div className="my-4"></div>
                <div className="bg-base-100 text-sm border p-4 pt-2 shadow w-full ">
                  <span className="">tags</span>
                  <div className="my-1"></div>
                  <div className="flex justify-center items-center flex-wrap gap-1">
                    {siteData.tags.length > 0 ? (
                      <>
                        {siteData.tags.map((tag) => (
                          <div
                            key={tag.tag.tag}
                            className="lowercase btn btn-xs text-xs font-light text-base-100 flex items-center px-2 rounded-full bg-primary-focus"
                          >
                            {tag.tag.tag}
                          </div>
                        ))}
                      </>
                    ) : (
                      <span>no tags found</span>
                    )}
                  </div>
                </div>
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
              <div className="flex-grow order-6 lg:hidden"></div>
              <div className="max-w-lg px-4 py-4 w-full mx-auto order-7">
                <a
                  href="/submit"
                  className="btn btn-primary text-base-100 shadow-xl w-full capitalize max-w-lg"
                >
                  Submit A Site
                </a>
              </div>

              <p className="text-xs font-light text-center px-4 max-w-lg mx-auto order-8">{`Please use the Report button if you think this site is categorized incorrectly, has invalid tags, is broken, or breaks WebRoll submission rules. `}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePage;
