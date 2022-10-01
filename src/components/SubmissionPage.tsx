import type { Categories } from "@prisma/client";
import { useState } from "react";
import type { SiteResData } from "../types";
import SiteSubmit from "./forms/SiteSubmit";
import SiteCard from "./ui/SiteCard";

export default function SubmissionPage({ categories }: { categories: Categories[] }) {
  const [submissions, setSubmissions] = useState<SiteResData[]>([]);
  const returnSubmissions = (submission: SiteResData) => {
    setSubmissions((s) => [submission, ...s]);
  };

  return (
    <>
      {submissions.length > 0 ? (
        <>
          {submissions.map((submission) => (
            <div className="rounded-lg border border-base-300 shadow-lg bg-base-100/90  backdrop-blur-md ">
              <div className="my-5"></div>

              <SiteCard site={submission} />
              <div className="my-5"></div>
              <span className="w-full flex items-center justify-center">
                You should be redirected soon. If nothing is happening click
                <a href={`/sites/${submission.id}`}>{" here "}</a>to view the
                site page.
              </span>
            </div>
          ))}
          <div className="rounded-lg border border-base-300 shadow-lg p-4 bg-base-100/90  backdrop-blur-md  ">
            <button
              onClick={() => setSubmissions([])}
              className="btn btn-primary text-base-100 shadow-xl w-full"
            >
              Submit Another Site
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-base-300 shadow-lg bg-base-100/90  backdrop-blur-md ">
          <SiteSubmit returnSubmissions={returnSubmissions} categories={categories} />
        </div>
      )}
    </>
  );
}
