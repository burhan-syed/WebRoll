import type { ReportType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ReportFormData {
  reportType: ReportType;
}
const ReportForm = ({
  sessionID,
  siteID,
}: {
  sessionID: string;
  siteID: string;
}) => {
  const options = [
    { value: "CATEGORY", label: "Incorrect category" },
    { value: "BROKEN", label: "Site is broken" },
    { value: "TAGS", label: "Invalid tags" },
    { value: "TOS", label: "Breaks WebRoll submission rules" },
    { value: "OTHER", label: "Something else" },
  ];
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
    setValue,
  } = useForm<ReportFormData>();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); 
  const onFormSubmit = async (data: ReportFormData) => {
    console.log("submit..", data);
    clearErrors(); 
    setLoading(true); 
    try{
      const res = await fetch("/api/report", {
        body: JSON.stringify({
          ...data,
          sessionID: sessionID,
          siteID,
        }),
        method: "post",
      });
      if(res.ok){
        setSubmitted(true); 
      }else{
        setError("reportType", {message: "something went wrong"})
      }
    }catch(err){

    }

    setLoading(false); 
  };

  useEffect(() => {
  
    return () => {
      setLoading(false);
      setSubmitted(false);
      reset(); 
    }
  }, [siteID])
  

  return (
    <form className="form-control gap-4" onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label className="label">
          <span className="label-text">Select a Report Reason</span>
        </label>
        <select
          className="select w-full select-secondary border border-neutral"
          {...register("reportType", { required: true })}
        >
          {options.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <button
        disabled={submitted}
        type={"submit"}
        className={"btn btn-primary w-full " + (loading ? " loading " : "")}
      >
        Submit
      </button>
      {
        errors.reportType?.message ? <span className="w-full text-center text-error">{errors.reportType.message}</span> : 
        submitted && <span className="w-full text-center text-success">report received</span>
      }
    </form>
  );
};

export default ReportForm;
