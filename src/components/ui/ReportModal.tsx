import ReportForm from "../forms/ReportForm";
import { X } from "react-feather";
import type { Categories, Tags } from "@prisma/client";
export default function ReportModal({
  siteID,
  siteTags,
  categories,
  siteCategories
}: {
  siteID: string;
  siteTags?: { tag: { tag: string; }; }[];
  categories: Categories[];
  siteCategories?: {
    category: string;
  }[];
}) {
  return (
    <>
      <input type="checkbox" id="report-modal" className="modal-toggle" />
      <label htmlFor="report-modal" className="modal cursor-pointer ">
        <label
          className="modal-box relative bg-base-100/80 backdrop-blur-md "
          htmlFor=""
        >
          <label
            htmlFor="report-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            <X />
          </label>
          <div className="my-0.5">
            <ReportForm key={siteID} siteID={siteID} siteTags={siteTags} categories={categories} siteCategories={siteCategories} />
          </div>
        </label>
      </label>
    </>
  );
}
