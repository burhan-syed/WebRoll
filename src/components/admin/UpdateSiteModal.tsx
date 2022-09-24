import { X } from "react-feather";
import UpdateSiteForm from "./UpdateSiteForm";
export default function ReportModal({ siteID }: { siteID: string }) {
  return (
    <>
      <input type="checkbox" id="update-modal" className="modal-toggle" />
      <label htmlFor="update-modal" className="modal cursor-pointer">
        <label
          className="modal-box relative bg-base-100/80 backdrop-blur-md"
          htmlFor=""
        >
          <label
            htmlFor="update-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            <X />
          </label>
          <div className="my-0.5">
            update
            <UpdateSiteForm/>
          </div>
        </label>
      </label>
    </>
  );
}
