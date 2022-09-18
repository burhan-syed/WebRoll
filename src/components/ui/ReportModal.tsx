import ReportForm from "../forms/ReportForm";
import { X } from "react-feather";
const ReportModal = ({sessionID, siteID}: {sessionID:string, siteID:string}) => {
  return (
    <>
      <input type="checkbox" id="report-modal" className="modal-toggle" />
      <label htmlFor="report-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100/80 backdrop-blur-md" htmlFor="">
        <label htmlFor="report-modal" className="btn btn-sm btn-circle absolute right-2 top-2"><X/></label>
        <div className="my-0.5">
        <ReportForm sessionID={sessionID} siteID={siteID}/>

        </div>
        </label>
      </label>
    </>
  );
};

export default ReportModal;
