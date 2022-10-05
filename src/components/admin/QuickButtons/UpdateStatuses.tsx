import type { SiteStatus } from "@prisma/client";
import UpdateStatus from "./UpdateStatus";

export default function UpdateStatuses({
  statuses = ["APPROVED", "REJECTED", "BANNED"],
  siteID,
  onUpdateStatus = () => {},
}: {
  statuses: SiteStatus[];
  siteID: string;
  onUpdateStatus?: Function;
}) {
  return (
    <>
      {statuses?.map((s) => (
        <div key={s}>
          <UpdateStatus
            siteID={siteID}
            updateStatus={s as unknown as SiteStatus}
            onUpdate={onUpdateStatus}
          />
        </div>
      ))}
    </>
  );
}
