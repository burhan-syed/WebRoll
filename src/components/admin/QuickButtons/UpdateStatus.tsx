import type { SiteStatus } from "@prisma/client";
import React, { useState } from "react";

export default function UpdateStatus({
  updateStatus,
  siteID,
  onUpdate = (s: SiteStatus) => {},
}: {
  updateStatus: SiteStatus;
  siteID: string;
  onUpdate: Function;
}) {
  const [loading, setLoading] = useState(false);
  const changeStatus = async (status: SiteStatus) => {
    setLoading(true);
    const res = await fetch("/api/update-site", {
      method: "post",
      body: JSON.stringify({ siteData: { id: siteID, status: status } }),
    });
    if (res.ok) {
      const data = await res.json();
      const updatedStatus = data?.data?.status;
      if (updatedStatus) {
        onUpdate(updatedStatus);
      }
    }
    setLoading(false);

  };
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        changeStatus(updateStatus);
      }}
      className={
        "btn btn-sm " +
        (updateStatus === "APPROVED"
          ? "btn-primary"
          : updateStatus === "REJECTED"
          ? "btn-warning"
          : updateStatus === "BANNED"
          ? "btn-error"
          : "") +
        (loading ? " loading" : "")
      }
    >
      {updateStatus === "APPROVED"
        ? "approve"
        : updateStatus === "REJECTED"
        ? "reject"
        : updateStatus === "BANNED"
        ? "ban"
        : updateStatus}
    </button>
  );
}
