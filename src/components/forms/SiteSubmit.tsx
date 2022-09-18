import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { HelpCircle, CornerDownLeft } from "react-feather";
import { DevTool } from "@hookform/devtools";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import type { SiteResData } from "../../types";
import SiteCard from "../SiteCard";

interface SiteFormData {
  url: string;
  sourceLink?: string;
  description?: string;
  category: string;
  tags: { name: string }[];
  privacy: boolean;
  captchaToken: string;
}

const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

const categories = [
  {
    category: "Arts & Design",
    description: "Painting, Illustration, Photography, Sculpting",
  },
  // {
  //   category: "Autos & Vehicles",
  //   description: "Cars, Motorcycles, Boats, Bikes, Aircraft",
  // },
  {
    category: "Beauty & Fashion",
    description: "Cosmetics, Hygiene, Makeup, Fashion",
  },
  {
    category: "Books & Literature",
    description: "Poetry, E-Books, Writer Resources, Publishing",
  },
  {
    category: "Business & Economics",
    description: "Entrepreneurship, Money, Stocks, Finance, Investing",
  },
  {
    category: "Food & Cooking",
    description: "Food, Cooking, Baking, Nutrition, World Cuisines",
  },
  {
    category: "Games",
    description: "Video Games, Consoles, Toys, Board Games",
  },
  {
    category: "Health & Fitness",
    description: "Fitness, Mental health, Psychology, Medicine",
  },
  {
    category: "Hobbies & Leisure",
    description: "Ceramics, Knitting, Outdoors, Hiking, Travel",
  },
  {
    category: "Home & Garden",
    description: "Interior Decor, Gardening, Construction, personal Farming",
  },
  {
    category: "Jobs & Education",
    description:
      "Online Courses and Certifications, Internships, Jobs, Career Resources",
  },
  {
    category: "Music & Audio",
    description: "Radios, Music Stations, Sounds, Music History",
  },
  {
    category: "Nature & Animals",
    description: "Earth, Ecology, Farming, Pets, and wild Animals",
  },
  {
    category: "Other",
    description: "Anything else",
  },
  {
    category: "People & Society",
    description: "Anthropology, Social networks, News, History",
  },
  {
    category: "Philosophy & Life",
    description: "Philosophy, Beliefs, Religion, Self-Improvement",
  },
  {
    category: "Science & Math",
    description: "Research, Biology, Chemistry, Physics, Astronomy",
  },
  {
    category: "Sports",
    description:
      "Soccer, Baseball, Curling, Darts, Tennis, and any other Sport",
  },
  {
    category: "Technology",
    description:
      "Computer Science, Hardware, Engineering, Internet, Programming",
  },
  {
    category: "TV, Movies, Videos",
    description: "TV Series, Cable TV, Videos, Streaming",
  },
];

export default function SiteSubmit({
  userIP,
  sessionID,
  returnSubmissions = (a: SiteResData) => {},
}: {
  userIP: string;
  sessionID: string;
  returnSubmissions: Function;
}) {
  const submitButton = useRef<HTMLButtonElement>(null);
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
  } = useForm<SiteFormData>({
    defaultValues: { tags: [{ name: "" }], captchaToken: "" },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

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
    setFormError("");
    setPrevSubmission(undefined);
    console.log("f?", data);
    setFormSubmitLoading(true);
    if (captchaValue) {
      clearErrors("captchaToken");
      console.log("captcha:", captchaValue);
      try {
        const res = await fetch("/api/submit", {
          body: JSON.stringify({
            ...data,
            userIP: userIP,
            sessionID: sessionID,
          }),
          method: "post",
        });
        const resData = await res.json();
        console.log("return?", resData);
        if (resData?.data?.["url"]) {
          if (res.ok) {
            setPrevSubmission(undefined);
            clearErrors();
            window.location.href = `/site/${resData.data.id}`;
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
        console.log("form error?", err);
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
          {errors.category?.type === "required" ? (
            <span className="label-text-alt text-error font-normal ml-auto">
              category required
            </span>
          ) : (
            <span className="text-sm"></span>
          )}
        </h2>

        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1">
          {categories.map((category) => (
            <label
              key={category.category}
              className="flex items-start gap-2 px-4 cursor-pointer select-none "
            >
              <input
                className="radio radio-xs checked:bg-primary mt-1.5"
                type={"radio"}
                id={category.category}
                value={category.category}
                {...register("category", { required: true })}
              />
              <div className="flex flex-col items-start  ">
                <span className="text-base-content text-lg font-light ">
                  {category.category}
                </span>
                <span className="text-xs pt-1 font-light">
                  {category.description}
                </span>
              </div>
            </label>
          ))}
        </div>

        <>
          <div className="">
            <h2 className="mb-0 pb-0 flex items-baseline justify-between flex-wrap">
              Site Tags<span className="text-sm">Site Topics & Keywords</span>
            </h2>
            {fields.map((field, index) => (
              <div key={field.name}>
                {index === fields.length - 1 && (
                  <>
                    <label className="label">
                      <span className="label-text-alt"></span>
                      {tagError === "pattern" ? (
                        <span className="label-text-alt text-error">
                          invalid characters
                        </span>
                      ) : tagError === "minLength" ? (
                        <span className="label-text-alt text-error">
                          2 characters minimum
                        </span>
                      ) : tagError === "maxLength" ? (
                        <span className="label-text-alt text-error">
                          tag is too long
                        </span>
                      ) : tagError === "duplicate" ? (
                        <span className="label-text-alt text-error">
                          duplicate
                        </span>
                      ) : tagError === "maximumNumber" ? (
                        <span className="label-text-alt text-error">
                          20 maximum tags
                        </span>
                      ) : errors.tags?.type === "minAmount" ? (
                        <span className="label-text-alt text-error">
                          enter at least 3 tags
                        </span>
                      ) : (
                        cTags.length < 20 && (
                          <span className="label-text-alt text-primary">
                            you can enter more
                          </span>
                        )
                      )}
                    </label>
                    <label className="input-group">
                      <input
                        className={
                          "input w-full " +
                          (errors.tags?.type || tagError
                            ? "input-error bg-base-200 "
                            : "input-primary ")
                        }
                        onKeyDown={(e) => {
                          //console.log("F?", cTags);
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!checkNewTag()) {
                              append({
                                name: "",
                              });
                            }
                          }
                        }}
                        placeholder={"tags"}
                        key={field.id} // important to include key with field's id
                        {...register(`tags.${index}.name` as const, {
                          //required: true,
                          //pattern: /[A-Za-z]/,
                          //minLength: 3,
                        })}
                      />
                      <span className="px-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!checkNewTag()) {
                              append({
                                name: "",
                              });
                            }
                          }}
                          className="w-full h-full pl-3 pr-4"
                        >
                          <CornerDownLeft />
                        </button>
                      </span>
                    </label>
                  </>
                )}
              </div>
            ))}

            <div className="flex gap-1 flex-wrap select-none py-4">
              {fields.map((field, index) => (
                <div key={field.name}>
                  {index !== fields.length - 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn btn-xs text-xs text-base-100 flex items-center px-2 rounded-full bg-primary-focus "
                    >
                      <span className="mr-0.5">{field.name}</span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 flex-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>

        <div>
          <h2 className="justify-between items-baseline flex flex-wrap">
            Extra<span className="text-sm">Optional Info</span>
          </h2>

          {/* <label className="flex justify-between items-center cursor-pointer select-none px-1 py-2">
            <span className="label-text flex items-center gap-2">
              Privacy Respecting
              <button
                className="outline-none"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPrivacyHelp((s) => !s);
                }}
              >
                <HelpCircle size={20} />
              </button>
            </span>

            <input
              type="checkbox"
              className="toggle toggle-primary"
              {...register("privacy")}
            />
          </label>
          <div
            className={
              "collapse " +
              (showPrivacyHelp ? "collapse-open" : "collapse-close")
            }
          >
            <div className="collapse-content">
              <p
                className={
                  "border border-base-content text-sm shadow-xl rounded-md p-4 "
                }
              >
                {`A site can be considered "Privacy Respecting" if it meets all of the following criteria:`}
                <ul>
                  <li>The site does not collect and sell user data</li>
                  <li>
                    The site does not use intrusive analytics tools such as
                    Google Analytics
                  </li>
                  <li>The site source code is publicly available</li>
                </ul>
                {`Most sites will not meet these criteria. Sites submitted with this toggled will be scrutinized.`}
              </p>
            </div>
          </div> */}
        </div>
        <div>
          <label className="label" htmlFor="sourceLink w-full">
            <span className="label-text flex items-center gap-2">
              source link{" "}
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
            (formError ? "" : " mb-12 ") +
            (errors.captchaToken?.type === "required" ? "mt-10" : " mt-10 ") +
            (formSubmitLoading ? " loading " : "")
          }
          type={"submit"}
        >
          submit
        </button>
        <span className="text-error text-sm flex items-center justify-center">
          {formError}
        </span>
      </form>
      {prevSubmission && (
        <>
          <div className="my-10">
            <SiteCard {...prevSubmission} />
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

      {/* <DevTool control={control} /> */}
    </>
  );
}
