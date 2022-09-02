import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

interface SiteFormData {
  url: string;
  sourceLink?: string;
  description?: string;
  category: string;
  tags: { name: string }[];
  privacy: boolean;
}
const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

const categories = [
  {
    category: "Arts, Design",
    description: "Painting, Illustration, Fashion, Photography, Sculpting",
  },
  {
    category: "Business, Economics",
    description: "Entrepreneurship, Jobs, Money, Stocks",
  },
  {
    category: "Culture, Society",
    description: "Law, Sociology, Traveling, Politics",
  },
  {
    category: "Education, Learning",
    description: "Teaching, Knowledge Sharing, Schools",
  },
  {
    category: "Food, Cooking",
    description: "Food, Cooking, Baking, Nutrition",
  },
  {
    category: "Fun Stuff",
    description: "Anything really weird, funny, or satiric",
  },
  {
    category: "Gaming",
    description: "Video Games, Consoles, Toys, Board Games",
  },
  {
    category: "Health",
    description: "Fitness, Mental health, Psychology, Medicine",
  },
  { category: "History", description: "Anything relating to the past" },
  {
    category: "Home, Garden",
    description: "Interior, Gardening, Construction, personal Farming",
  },
  {
    category: "Literature, Writing",
    description: "Books, Magazines, Writing, Publishing",
  },
  { category: "Music, Audio", description: "Bands, Music Theory, Sounds" },
  {
    category: "Nature, Animals",
    description: "Earth, Ecology, Farming, Animals (wild & domesticated)",
  },
  {
    category: "Other",
    description: "Anything else",
  },
  {
    category: "Philosophy, Life",
    description: "Philosophy, Beliefs, Religion, Self-Improvement",
  },
  {
    category: "Science, Math",
    description: "Research, Biology, Chemistry, Physics, Astronomy",
  },
  { category: "Social", description: "Social networks" },
  {
    category: "Sports",
    description:
      "Soccer, Baseball, Curling, Darts, Crossfit, and any other Sport",
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

const SiteSubmit = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
  } = useForm<SiteFormData>({ defaultValues: { tags: [{ name: "" }] } });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });
  const onFormSubmit = (data: SiteFormData) => {
    console.log("f?", data);
  };

  const cTags = watch("tags");

  const checkNewTag = () => {
    //console.log(cTags);
    const last = cTags[cTags.length - 1];
    console.log(last.name.match(/[A-Za-z]+/), last.name);
    if (last.name === "") {
      clearErrors("tags");
      return 1;
    }
    if (last.name.match(/[A-Za-z]+/)?.[0]?.length !== last.name.length) {
      setError("tags", { type: "pattern" });
      return 1;
    }
    if (last.name.trim()?.length > 0 && last.name.trim()?.length < 3) {
      setError("tags", { type: "minLength" });
      return 1;
    }
    clearErrors("tags");
    const dups = cTags.filter((t, i) => {
      if (i === cTags.length - 1) {
        return false;
      }
      if (t.name.trim().toUpperCase() === last.name.trim().toUpperCase()) {
        return true;
      }
      return false;
    });
    if (dups.length > 0) {
      setError("tags", { type: "duplicate" });
    }
    return dups.length > 0;
  };

  return (
    <>
      <h1>submit a site</h1>
      <form
        action=""
        onSubmit={handleSubmit(onFormSubmit)}
        className=" flex flex-col gap-4 border min-w-full flex-1"
      >
        <div>
          <h2 className="mb-0 pb-0">URL</h2>
          <label className="label text-xs text-error">
            <span className="label-text-al"></span>
            {errors.url?.type === "required" && (
              <span className="label-text-alt text-error">url required</span>
            )}
            {errors.url?.type === "pattern" && (
              <span className="label-text-alt text-error">invalid url</span>
            )}
            {errors.url?.type === "siteExists" && (
              <span className="label-text-alt text-error">site exists</span>
            )}
            {/* {errors.url?.type && (
              <button type="button" onClick={() => clearErrors("url")}>
                x
              </button>
            )} */}
            {/* <span className="label-text-alt text-error">err</span>{" "} */}
          </label>
          <input
            className={
              "input w-full " +
              (errors.url?.type ? "input-error" : "input-accent")
            }
            type="text"
            placeholder="url"
            {...register("url", { required: true, pattern: urlPattern })}
          />
        </div>

        <h2 className="mb-0 pb-4 w-full flex justify-between items-baseline">
          Category
          {errors.category?.type === "required" && (
            <span className="label-text-alt text-error font-normal ml-auto">
              category required
            </span>
          )}
        </h2>

        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1">
          {categories.map((category) => (
            <label
              key={category.category}
              className="flex items-start gap-2 px-4 cursor-pointer select-none "
            >
              <input
                className="radio radio-xs checked:bg-accent"
                type={"radio"}
                id={category.category}
                value={category.category}
                {...register("category", { required: true })}
              />
              <div className="flex flex-col -mt-0.5 ">
                <span className="font-semibold">{category.category}</span>
                <span className="text-xs pt-1">{category.description}</span>
              </div>
            </label>
          ))}
        </div>

        <>
          <div className="">
            <h2 className="mb-0 pb-0">Tags</h2>
            {fields.map((field, index) => (
              <>
                {index === fields.length - 1 && (
                  <div key={field.name}>
                    <>
                      <label className="label">
                        <span className="label-text-alt"></span>
                        {errors.tags?.type === "pattern" ? (
                          <span className="label-text-alt text-error">
                            letters only
                          </span>
                        ) : errors.tags?.type === "minLength" ? (
                          <span className="label-text-alt text-error">
                            3 characters minimum
                          </span>
                        ) : errors.tags?.type === "duplicate" ? (
                          <span className="label-text-alt text-error">
                            duplicate
                          </span>
                        ) : (
                          cTags.length < 4 && (
                            <span className="label-text-alt text-error">
                              enter at least 3 tags
                            </span>
                          )
                        )}
                      </label>
                      <input
                        className={
                          "input w-full " +
                          (errors.tags?.type || cTags.length < 4
                            ? "input-error"
                            : "input-accent")
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
                          pattern: /[A-Za-z]/,
                          minLength: 3,
                        })}
                      />
                    </>
                  </div>
                )}
              </>
            ))}

            <div className="flex gap-1 flex-wrap select-none py-4">
              {fields.map((field, index) => (
                <div key={field.name}>
                  {index !== fields.length - 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn btn-xs text-xs flex items-center px-2 rounded-full bg-accent-focus "
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
          <label className="flex justify-between items-center cursor-pointer select-none">
            <span className="label-text">Privacy Respecting</span>
            <input
              type="checkbox"
              className="toggle toggle-accent"
              {...register("privacy")}
            />
          </label>
        </div>
        <button className="btn btn-primary my-10" type="submit">
          submit
        </button>
      </form>
      <DevTool control={control} />
    </>
  );
};

export default SiteSubmit;
