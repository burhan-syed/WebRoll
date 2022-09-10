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
      {submissions.length > 0 ? (
        <>
          {/* <div className="rounded-lg border border-base-300 shadow-lg bg-base-100 ">
            <SiteCard
              url="https://test.com"
              name="test name"
              categories={[{ category: "category", description: "" }]}
              description="site description"
              tags={[{ tag: "tag1" }, { tag: "tag2" }, { tag: "tag3" }]}
              status="REVIEW"
            />
          </div> */}
          {submissions.map((submission) => (
            <div className="rounded-lg border border-base-300 shadow-lg bg-base-100 ">
              <SiteCard {...submission} />
            </div>
          ))}
          <div className="rounded-lg border border-base-300 shadow-lg p-4 bg-base-100  ">
            <button onClick={() => setSubmissions([])} className="btn btn-primary text-base-100 shadow-xl w-full">
              Submit Another Site
            </button>
          </div>{" "}
        </>
      ) : (
        <div className="rounded-lg border border-base-300 shadow-lg bg-base-100 ">
          <SiteSubmit userIP={userIp} returnSubmissions={returnSubmissions} />
        </div>
      )}
    </>
  );
};

export default SubmissionPage;
