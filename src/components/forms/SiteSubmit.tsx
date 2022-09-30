import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { HelpCircle, CornerDownLeft } from "react-feather";
import { DevTool } from "@hookform/devtools";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { SiteResData, SiteFormData } from "../../types";
import SiteCard from "../ui/SiteCard";
import type { Categories } from "@prisma/client";
import TagsInput from "./TagsInput";
import CategorySelect from "./CategorySelect";

const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

export default function SiteSubmit({
  returnSubmissions = (a: SiteResData) => {},
  categories,
}: {
  returnSubmissions: Function;
  categories: Categories[];
}) {
  const submitButton = useRef<HTMLButtonElement>(null);
  const formMethods = useForm<SiteFormData>({
    defaultValues: { tags: [{ name: "" }], captchaToken: "" },
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
  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "tags",
  // });

  const [showPrivacyHelp, setShowPrivacyHelp] = useState(false);
  const [showSourceHelp, setShowSourceHelp] = useState(false);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const cTags = watch("tags");
  const isPrivate = watch("privacy");
  const captchaValue = watch("captchaToken");
  useEffect(() => {
    if (captchaValue) {
      clearErrors("captchaToken");
      console.log("submit?");
      submitButton.current?.click();
    }
  }, [captchaValue]);

  const captchaRef = useRef<HCaptcha>(null);
  const [prevSubmission, setPrevSubmission] = useState<SiteResData>();
  const [formError, setFormError] = useState("");
  const onFormSubmit = async (data: SiteFormData) => {
    clearErrors();
    let catgCount = data?.categories?.filter(c => c)?.length; 
    if(!catgCount || catgCount < 1 || catgCount > 2 || (data?.categories?.includes("Fun") && catgCount < 2)){
      const errMessage = (catgCount < 1 || !catgCount ? "select at least one" :  catgCount > 2 ? "no more than two" : (data?.categories?.includes("Fun") && catgCount < 2) ? "select two" : "invalid")
      setError("categories", {message:errMessage  }); 
      setFormError(errMessage); 
      return; 
    }
    setFormError("");
    setPrevSubmission(undefined);
    setFormSubmitLoading(true);
    if (captchaValue) {
      clearErrors("captchaToken");
      //console.log("captcha:", captchaValue);
      try {
        const res = await fetch("/api/submit", {
          body: JSON.stringify({
            ...data,
          }),
          method: "post",
        });
        const resData = await res.json();
        //console.log("return?", resData);
        if (resData?.data?.["url"]) {
          if (res.ok) {
            setPrevSubmission(undefined);
            clearErrors();
            window.location.href = `/sites/${resData.data.id}`;
            returnSubmissions(resData.data);
          } else if (resData?.["ERROR"]) {
            setError("url", { type: "siteExists" });
            setFormError(`${resData?.["ERROR"]}:`);
            setPrevSubmission(resData.data);
          }
        } else if (resData?.["ERROR"]) {
          setFormError(resData["ERROR"]);
        }
      } catch (err) {
        //console.log("form error?", err);
        setFormError("Something went wrong");
      }

      setFormSubmitLoading(false);
    } else {
      setFormSubmitLoading(false);
      setError("captchaToken", { type: "required" });
      captchaRef.current?.execute();
    }
  };
  const [tagError, setTagError] = useState("");
  const checkNewTag = () => {
    //console.log(cTags);
    if (cTags.length > 20) {
      setTagError("maximumNumber");
      return 1;
    }
    const last = cTags[cTags.length - 1];
    const lastName = last.name.trim();
    console.log(lastName.match(/[A-Za-z0-9 ]+/), lastName);
    if (last.name === "") {
      setTagError("");
      return 1;
    }
    if (lastName.match(/[A-Za-z0-9 ]+/)?.[0]?.length !== lastName.length) {
      setTagError("pattern");
      return 1;
    }
    if (lastName?.length > 0 && lastName?.replaceAll(" ", "")?.length < 2) {
      setTagError("minLength");
      return 1;
    }
    if (lastName?.length > 0 && lastName?.length > 48) {
      setTagError("maxLength");
      return 1;
    }
    setTagError("");
    //clearErrors("tags");
    const dups = cTags.filter((t, i) => {
      if (i === cTags.length - 1) {
        return false;
      }
      if (t.name.trim().toUpperCase() === lastName.toUpperCase()) {
        return true;
      }
      return false;
    });
    if (dups.length > 0) {
      setTagError("duplicate");
    }
    return dups.length > 0;
  };

  useEffect(() => {
    if (cTags.length < 4) {
      setError("tags", { type: "minAmount" });
    } else {
      clearErrors("tags");
    }
  }, [cTags.length < 4]);

  return (
    <>
      <FormProvider {...formMethods}>
        <form
          action=""
          onSubmit={handleSubmit(onFormSubmit)}
          className=" flex flex-col gap-4 min-w-full flex-1 px-4 rounded-lg"
          // style={{ scrollMarginTop: "80px" }}
        >
          <div>
            <h2 className="mb-0 pb-0 flex items-baseline justify-between flex-wrap">
              Site URL<span className="text-sm">Enter the site's URL</span>
            </h2>
            <label className="label text-xs ">
              <span className="label-text"></span>
              {errors.url?.type === "required" && (
                <span className="label-text-alt text-error">url required</span>
              )}
              {errors.url?.type === "pattern" && (
                <span className="label-text-alt text-error">invalid url</span>
              )}
              {errors.url?.type === "siteExists" && (
                <span className="label-text-alt text-error">site exists</span>
              )}
            </label>
            <label className="input-group">
              <span>{`https://`}</span>
              <input
                className={
                  "input bg-base-200 w-full " +
                  (errors.url?.type ? " input-error " : " input-primary ")
                }
                type="text"
                placeholder="url"
                {...register("url", { required: true, pattern: urlPattern })}
              />
            </label>
          </div>

          <h2 className="mb-0 pb-4 w-full flex justify-between items-baseline">
            Site Category
            <span className="label-text-alt text-error font-normal ml-auto">
              {errors.categories?.type === "required" ? (
                "category required"
              ) : errors.categories?.message ? (
                <>{errors.categories.message}</>
              ) : (
                ""
              )}
            </span>
          </h2>

          <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 text-lg">
            <CategorySelect maxCount={2} minCount={1} categories={categories} />
          </div>

          <>
            <div className="">
              <h2 className="mb-0 pb-0 flex items-baseline justify-between flex-wrap">
                Site Tags<span className="text-sm">Site Topics & Keywords</span>
              </h2>
              <TagsInput />
            </div>
          </>

          <div>
            <h2 className="justify-between items-baseline flex flex-wrap">
              Extra<span className="text-sm">Optional Info</span>
            </h2>
          </div>
          <div>
            <label className="label" htmlFor="sourceLink w-full">
              <span className="label-text flex items-center gap-2">
                source link
                <button
                  className="outline-none"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSourceHelp((s) => !s);
                  }}
                >
                  <HelpCircle size={20} />
                </button>
              </span>
              {errors.sourceLink?.type && (
                <span className="label-text-alt text-error">
                  {errors.sourceLink.type === "required"
                    ? "source required for privacy respecting sites"
                    : errors.sourceLink.type === "pattern"
                    ? "invalid url"
                    : ""}
                </span>
              )}
            </label>
            <input
              className={
                "input bg-base-200 w-full " +
                (errors.sourceLink?.type ? "input-error" : " ")
              }
              type={"url"}
              placeholder={"url"}
              {...register("sourceLink", {
                required: isPrivate,
                pattern: urlPattern,
              })}
            />
            <div
              className={
                "collapse " +
                (showSourceHelp ? "collapse-open" : "collapse-close")
              }
            >
              <div className="collapse-content">
                <p
                  className={
                    "border border-base-content shadow-xl text-sm  rounded-md p-4 "
                  }
                >
                  {`A link to the source code for the site or its primary product.`}
                </p>
              </div>
            </div>
          </div>
          <div className="">
            <HCaptcha
              size="invisible"
              sitekey={
                import.meta.env.MODE === "production"
                  ? "39185a62-e29f-441d-8be0-b2989f326879"
                  : "10000000-ffff-ffff-ffff-000000000001"
              }
              ref={captchaRef}
              onError={(e) => {
                console.log("captcha error", e);
              }}
              onVerify={(t) => {
                console.log(t);
                setValue("captchaToken", t);
                //setFormSubmitLoading(false);
                //formRef.current?.submit();
              }}
              onExpire={() => setValue("captchaToken", "")}
            />
          </div>
          {/* {errors.captchaToken?.type === "required" && (
          <span className="label label-text-alt text-error text-xs text-right flex items-center justify-center">
            submit after completing captcha
          </span>
        )} */}
          <button
            ref={submitButton}
            className={
              "btn btn-primary text-base-100 shadow-xl  " +
              (formError ? "  " : " mb-12 ") +
              (errors.captchaToken?.type === "required" ? "mt-10" : " mt-10 ") +
              (formSubmitLoading ? " loading " : "")
            }
            type={"submit"}
          >
            submit
          </button>
          <span  className="text-error text-sm flex items-center justify-center mb-12">
            {formError}
          </span>
        </form>
      </FormProvider>
      {prevSubmission && (
        <>
          <div className="my-10">
            <SiteCard site={prevSubmission} />
            <div className="p-4">
              <button
                onClick={() => {
                  setFormError("");
                  setPrevSubmission(undefined);
                  reset();
                }}
                className="btn btn-primary w-full"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )}

      <DevTool control={control} />
    </>
  );
}
