import type { Categories } from "@prisma/client";
import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { SiteResData } from "../../types";
import CategorySelect from "./CategorySelect";
import TagsInput from "./TagsInput";

interface UpdateFormData {
  name?: string;
  description?: string;
  url?: string;
  tags: { name: string }[];
  categories?: (string | null)[];
  allowEmbed?: boolean;
  sourceLink?: string | null;
}
interface SubmitUpdateFormData {
  name?: string;
  description?: string;
  url?: string;
  tags: string[];
  categories?: string[];
  allowEmbed?: boolean;
  sourceLink?: string;
}

const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

export default function SiteUpdateForm({
  site,
  categories,
}: {
  site: SiteResData;
  categories: Categories[];
}) {
  const defaultCatgs = useMemo(() => {
    const flat = site.categories?.map((c) => c.category);
    return categories.map((c) =>
      flat?.includes(c.category) ? c.category : null
    );
  }, [site.categories]);
  const formMethods = useForm<UpdateFormData>({
    defaultValues: {
      url: site.url,
      name: site.name,
      description: site.description ?? "",
      categories: defaultCatgs,
      tags: [
        ...(site.tags && site.tags?.length > 0
          ? [...site.tags, { tag: { tag: "" } }]
          : [{ tag: { tag: "" } }]),
      ]?.map((t) => ({ name: t.tag.tag })),
      allowEmbed: site.allowEmbed,
      sourceLink: site.sourceLink,
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

  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const onFormSubmit = async (data: UpdateFormData) => {
    setFormSubmitLoading(true);
    //console.log("data?", data);
    const updatedData = (() => {
      let updateData = {} as SubmitUpdateFormData;
      let catgs = data.categories?.filter((c) => c) as string[];
      let tags = data.tags
        ?.slice(0, -1)
        .map((t) => t.name)
        .filter((t) => t);
      if (
        catgs &&
        catgs?.sort().join(",") !==
          site.categories
            .map((c) => c.category)
            .sort()
            .join(",")
      ) {
        updateData.categories = catgs;
      }
      if (
        tags.sort().join(",") !==
        site.tags
          .map((t) => t.tag.tag)
          .sort()
          .join(",")
      ) {
        updateData.tags = tags;
      }
      if (data.description !== site.description) {
        updateData.description = data.description;
      }
      if (data.url !== site.url) {
        updateData.url = data.url;
      }
      if (data.allowEmbed !== site.allowEmbed) {
        updateData.allowEmbed = data.allowEmbed;
      }
      if (data.sourceLink && data.sourceLink !== site.sourceLink) {
        updateData.sourceLink = data.sourceLink;
      }
      if (data.name !== site.name) {
        updateData.name = data.name;
      }
      return updateData;
    })();
    //console.log("update?", updatedData);
    if (!(Object.keys(updatedData).length > 0)) {
      return;
    }
    try {
      const res = await fetch("/api/update-site", {
        method: "post",
        body: JSON.stringify({
          siteData: { ...updatedData, id: site.id },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {}
    setFormSubmitLoading(false);
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form
          className={"form-control gap-2"}
          onSubmit={handleSubmit(onFormSubmit)}
        >
          <div>
            <label>
              <span className="label-text">url</span>
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
          <div>
            <label>
              <span className="label-text">source link</span>
            </label>
            <label className="input-group">
              <span>{`https://`}</span>
              <input
                className={
                  "input bg-base-200 w-full " +
                  (errors.sourceLink?.type
                    ? " input-error "
                    : " input-primary ")
                }
                type="text"
                placeholder="url"
                {...register("sourceLink", {
                  required: false,
                  pattern: urlPattern,
                })}
              />
            </label>
          </div>
          <div>
            <label>
              <span className="label-text">title</span>
            </label>

            <input
              className={
                "input bg-base-200 w-full " +
                (errors.url?.type ? " input-error " : " input-primary ")
              }
              type="text"
              placeholder="name"
              {...register("name", { required: false })}
            />
          </div>
          <div className="flex flex-col">
            <label>
              <span className="label-text">description</span>
            </label>

            <textarea
              className="textarea"
              placeholder="description"
              {...register("description")}
            />
          </div>
          <div className="flex flex-col">
            <label>
              <span className="label-text">categories</span>
            </label>

            <CategorySelect categories={categories} showDescriptions={true} />
          </div>
          <div className="flex flex-col">
            <label>
              <span className="label-text">tags</span>
            </label>

            <TagsInput />
          </div>
          <div>
            <label className="label cursor-pointer">
              <span className="label-text">Enable Embed</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                {...register("allowEmbed")}
              />
            </label>
          </div>

          <button
            disabled={formSubmitLoading || submitted}
            className={
              "btn btn-primary text-base-100 shadow-xl  " +
              (formSubmitLoading ? " loading " : "")
            }
            type={"submit"}
          >
            submit
          </button>
          {submitted && <span>submitted</span>}
        </form>
      </FormProvider>
    </>
  );
}
