import { DevTool } from "@hookform/devtools";
import type { Categories, ReportType, Tags } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CategorySelect from "./CategorySelect";
import TagsInput from "./TagsInput";

interface ReportFormData {
  reportType: ReportType;
  tags: { name: string }[];
  categories?: (string | null)[];
}
const options = [
  { value: "DISPLAY", label: "Site works but doesn't display on WebRoll" },
  { value: "BROKEN", label: "Site is broken" },
  { value: "CATEGORY", label: "Invalid category" },
  { value: "TAGS", label: "Invalid tags" },
  { value: "TOS", label: "Breaks WebRoll submission rules" },
  { value: "OTHER", label: "Something else" },
];

export default function ReportForm({
  siteID,
  siteTags,
  categories,
  siteCategories,
}: {
  siteID: string;
  siteTags?: { tag: { tag: string } }[];
  siteCategories?: {
    category: string;
  }[];
  categories: Categories[];
}) {
  const defaultCatgs = useMemo(() => {
    const flat = siteCategories?.map((c) => c.category);
    return categories.map((c) =>
      flat?.includes(c.category) ? c.category : null
    );
  }, [siteCategories]);
  const formMethods = useForm<ReportFormData>({
    defaultValues: {
      categories: defaultCatgs,
      tags: [
        ...(siteTags && siteTags?.length > 0
          ? [...siteTags, { tag: { tag: "" } }]
          : [{ tag: { tag: "" } }]),
      ]?.map((t) => ({ name: t.tag.tag })),
    },
  });

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
  } = formMethods;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const onFormSubmit = async (data: ReportFormData) => {
    console.log("submit..", data);
    if (
      reportType === "CATEGORY" &&
      siteCategories
        ?.map((c) => c.category)
        .sort()
        .join(",") ===
        data.categories
          ?.filter((c) => c)
          .sort()
          .join(",")
    ) {
      setError("categories", {
        type: "required",
        message: "change the category or select more!",
      });
      return;
    } else if (
      reportType === "TAGS" &&
      siteTags
        ?.map((t) => t.tag.tag?.toUpperCase())
        .filter((t) => t)
        .sort()
        .join(",") ===
        data.tags
          .map((t) => t.name.toUpperCase())
          .filter((t) => t)
          .sort()
          .join(",")
    ) {
      console.log(
        siteTags
          ?.map((t) => t.tag.tag?.toUpperCase())
          .filter((t) => t)
          .sort()
          .join(","),
        data.tags
          .map((t) => t.name.toUpperCase())
          .filter((t) => t)
          .sort()
          .join(",")
      );
      setError("tags", {
        type: "required",
        message: "change the tags or add more!",
      });
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        body: JSON.stringify({
          ...data,
          categories: reportType === "CATEGORY" ? data.categories : undefined,
          tags: reportType === "TAGS" ? data.tags : undefined,
          siteID,
        }),
        method: "post",
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("reportType", { message: "something went wrong" });
      }
    } catch (err) {}

    setLoading(false);
  };

  const reportType = watch("reportType");
  const categorySelect = watch("categories");
  useEffect(() => {
    const noNullCategories = categorySelect?.filter((c) => c);
    if (noNullCategories && reportType === "CATEGORY") {
      if (noNullCategories?.length > 2) {
        setError("categories", {
          type: "maxLength",
          message: "Select no more than two",
        });
      } else if (noNullCategories.length < 1) {
        setError("categories", {
          type: "minLength",
          message: "Select at least one",
        });
      } else if (
        noNullCategories.includes("Fun") &&
        noNullCategories.length < 2
      ) {
        setError("categories", {
          type: "minLength",
          message: `Select 2 when "Fun" checked`,
        });
      } else {
        clearErrors("categories");
      }
    } else if (reportType !== "CATEGORY") {
      clearErrors("categories");
    }
  }, [categorySelect, reportType]);
  useEffect(() => {
    if (reportType !== "TAGS") {
      clearErrors("tags");
    }
  }, [reportType]);

  return (
    <FormProvider {...formMethods}>
      <form
        className="form-control gap-4"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        <div>
          <label className="label">
            <span className="label-text">Select a Report Reason</span>
          </label>
          <select
            className="select w-full select-secondary border border-neutral"
            {...register("reportType", { required: true })}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {reportType === "CATEGORY" && (
          <div className="flex flex-col gap-0.5">
            <label className="label">
              <span className="label-text">Correct the category:</span>
            </label>
            <div className="flex flex-col gap-1">
              <CategorySelect
                categories={categories}
                showDescriptions={false}
                minCount={1}
                maxCount={2}
              />
            </div>

            <label className="label">
              <span className="label-text-alt text-error">
                {errors.categories?.message}
              </span>
            </label>
          </div>
        )}
        {reportType === "TAGS" && siteTags && (
          <div className="flex flex-col gap-0.5">
            <label className="label">
              <span className="label-text">Correct the tags:</span>
              {!(
                siteTags.map((t) => t.tag.tag).filter((t) => t).length > 0
              ) && <span className="label-text-alt">no tags found</span>}
            </label>
            <div className="">
              <TagsInput />
            </div>

            <label className="label">
              <span className="label-text-alt text-error">
                {errors.tags?.message}
              </span>
            </label>
          </div>
        )}

        <button
          disabled={submitted}
          type={"submit"}
          className={"btn btn-primary w-full " + (loading ? " loading " : "")}
        >
          Submit
        </button>
        {errors.reportType?.message ? (
          <span className="w-full text-center text-error">
            {errors.reportType.message}
          </span>
        ) : (
          submitted && (
            <span className="w-full text-center">Report received! Thanks!</span>
          )
        )}
        {/* <DevTool control={control} /> */}
      </form>
    </FormProvider>
  );
}
