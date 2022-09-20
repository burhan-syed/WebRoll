import { useEffect, useState } from "react";
import { Flag, Share } from "react-feather";
import type { minSiteResData } from "../../../types";

export default function Button({
  type,
  label,
  styles,
  site,
  tooltipLocation = "bottom",
}: {
  type: "share" | "report";
  label?: string;
  styles?: string;
  tooltipLocation?: "top" | "bottom";
  site: minSiteResData;
}) {
  const clickAction = async () => {
    switch (type) {
      case "report":
        break;
      case "share":
        const domain = window.location.host;
        const shareLink = `${domain}/site/${site.id}`;
        const shareData = {
          title: site.name,
          text: "Learn web development on MDN!",
          url: shareLink,
        };
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log("copied");
          navigator.clipboard.writeText(shareLink);
        }
        setAlertMessage("link copied!");
        setAlertTriggered((t) => !t);

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
            <Flag size={15} />
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
          <Share size={15} />
          {label ? label : "Share"}
        </>
      ) : type === "report" ? (
        <>
          <Flag size={15} />
          {label ? label : "Report"}
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
