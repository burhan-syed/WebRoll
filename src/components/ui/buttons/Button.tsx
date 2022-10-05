import { useEffect, useState } from "react";
import { Flag, Share, ThumbsUp } from "react-feather";
import type { minSiteResDataWithLikes } from "../../../types";

export default function Button({
  type,
  label,
  styles,
  site,
  iconSize = 15,
  tooltipLocation = "bottom",
}: {
  type: "share" | "report" | "like";
  label?: string;
  styles?: string;
  tooltipLocation?: "top" | "bottom";
  iconSize?: number;
  site: minSiteResDataWithLikes;
}) {
  const [liked, setLiked] = useState(() =>
    site.likes?.length > 0 ? site.likes[0]?.direction : false
  );
  useEffect(() => {
    setLiked(site.likes?.length > 0 ? site.likes[0]?.direction : false);
  }, [site]);

  const handleLike = async () => {
    setLiked((l) => {
      fetch("/api/update-likes", {
        body: JSON.stringify({
          siteID: site.id,
          direction: !l,
        }),
        method: "post",
      });
      return !l;
    });
  };

  const clickAction = async () => {
    switch (type) {
      case "like":
        await handleLike();
        break;
      case "report":
        break;
      case "share":
        const protocol = window.location.protocol;
        const domain = window.location.host;
        const shareLink = `${protocol}//${domain}/sites/${site.id}`;
        const shareData = {
          title: site.name,
          text: `Visit ${site.name} on WebRoll`,
          url: `/sites/${site.id}`,
        };
        try {
          await navigator.share(shareData);
        } catch (err) {
          navigator.clipboard.writeText(shareLink);
          setAlertMessage("link copied!");
          setAlertTriggered((t) => !t);
        }

        break;
      default:
        break;
    }
  };

  const [alertTriggered, setAlertTriggered] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (alertMessage) {
      timeout = setTimeout(() => {
        setAlertTriggered(false);
        setAlertMessage("");
      }, 1000);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [alertTriggered]);

  if (type === "report") {
    return (
      <>
        <label htmlFor="report-modal" className={"btn modal-button " + styles}>
          <>
            <Flag size={iconSize} />
            {label ? label : "Report"}
          </>
        </label>
      </>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        clickAction();
      }}
      className={"btn relative " + styles}
    >
      {type === "share" ? (
        <>
          <Share size={iconSize} />
          {label ? label : "Share"}
        </>
      ) : type === "like" ? (
        <>
          <ThumbsUp
            size={iconSize}
            className={"brightness-125"}
            fill={liked ? "#5C7F67" : "#5C7F6700"}
          />
          {typeof label === "string" ? label : liked ? "Unlike" : "Like"}
        </>
      ) : (
        <></>
      )}
      <div
        className={
          `absolute  tooltip tooltip-open tooltip-accent w-24 bg-success transition-transform  capitalize ` +
          (tooltipLocation === "bottom"
            ? " tooltip-bottom origin-top bottom-0 "
            : " top-0 ") +
          (alertTriggered && alertMessage ? " scale-100 " : " scale-0 ")
        }
        data-tip={`${alertMessage}`}
      ></div>
    </button>
  );
}
