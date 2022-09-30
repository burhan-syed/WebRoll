import type { Categories } from "@prisma/client";
import { X } from "react-feather";
import type { SiteResData } from "../../types";
import SiteUpdateForm from "../forms/SiteUpdateForm";
export default function ReportModal({ site,categories }: { site:SiteResData, categories:Categories[] }) {
  return (
    <>
      <input type="checkbox" id="update-modal" className="modal-toggle" />
      <label htmlFor="update-modal" className="modal cursor-pointer">
        <label
          className="modal-box max-w-3xl relative bg-base-100/80 backdrop-blur-md"
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
            <SiteUpdateForm site={site} categories={categories}/>
          </div>
        </label>
      </label>
    </>
  );
}
