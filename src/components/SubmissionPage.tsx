import React, { useState } from "react";
import type { SiteResData } from "../types";
import SiteSubmit from "./forms/SiteSubmit";
import SiteCard from "./SiteCard";

const SubmissionPage = ({ userIp }: { userIp: string }) => {
  const [submissions, setSubmissions] = useState<SiteResData[]>([]);
  const returnSubmissions = (submission: SiteResData) => {
    console.log("submit:", submission);
    setSubmissions((s) => [submission, ...s]);
  };

  return (
    <>
      <div className="rounded-lg border border-base-300 shadow-lg">
        <SiteSubmit userIP={userIp} returnSubmissions={returnSubmissions} />
      </div>
      <h2>submissions</h2>
      <div className="rounded-lg border border-base-300 shadow-lg">
          <SiteCard url="" name="test" categories={[{category:"",description:""}]} description="" tags={[{tag:""}]} />
        </div>
      {submissions.map((submission) => (
        <div className="rounded-lg border border-base-300 shadow-lg">
          <SiteCard {...submission} />
        </div>
      ))}
    </>
  );
};

export default SubmissionPage;
