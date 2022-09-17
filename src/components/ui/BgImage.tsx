import { useEffect, useState } from "react";

const BgImage = ({src, loadEvent = () => {}, loadEventParams=""}: {src: string; loadEvent?:Function; loadEventParams?:any}) => {
  const [loaded, setLoaded] = useState(false); 
  useEffect(() => {
   setLoaded(false); 
  }, [src])
  
  return (
    <>
    <img
      className={"aspect-video max-h-[50vh] lg:max-h-[80vh] z-10  " + " transition-opacity duration-500 " + (loaded ? " opacity-100 shadow " : " opacity-0 ")}
      src={src}
      alt=""
      onLoad={() => {loadEvent(loadEventParams);setLoaded(true)}}
    />
    <img
      className={"w-full h-full absolute blur-3xl brightness-[0.8] "  + " transition-opacity " + (loaded ? " opacity-100 shadow " : " opacity-0 ")}
      src={src}
      alt=""
    />
    <span
      className="absolute bottom-2 text-xs text-white text-opacity-50  "
      style={{ textShadow: "0px 1px #FFFFFF20" }}
    >
      embed unavailable, displaying screenshot
    </span>
  </>
  )
}

export default BgImage