import type { Categories } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CategorySelect from "./CategorySelect";

export default function CategoriesSelectForm({
  categories,
  userCategories,
  onCategorySelectUpdate,
  label = "Select Categories:",
  styles="",
  reload = false,
}: {
  categories: Categories[];
  userCategories: string[];
  label?: string;
  onCategorySelectUpdate?: Function;
  reload?:boolean;
  styles?:string;
}) {
  const defaultCatgs = useMemo(() => {
    return categories.map((c) =>
      userCategories?.includes(c.category) ? c.category : null
    );
  }, [userCategories]);
  const formMethods = useForm<{ categories: (string | null)[] }>({
    defaultValues: {
      categories: defaultCatgs,
    },
  });
  const { handleSubmit, watch } = formMethods;
  const selectedCategories = watch("categories");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const onFormSubmit = async (data: { categories: (string | null)[] }) => {
    console.log("submit..", data);

    setLoading(true);
    try {
      const res = await fetch("/api/update-user-categories", {
        body: JSON.stringify({
          ...data,
        }),
        method: "post",
      });
      if (res.ok) {
        const updCategories = (await res.json())?.data as {
          category: string;
        }[];
        console.log("updC?", updCategories);
        if (updCategories && onCategorySelectUpdate) {
          await onCategorySelectUpdate(updCategories.map((c) => c.category));
        }
        if(reload){
          location.reload();
        }
        setSubmitted(true);
      } else {
      }
    } catch (err) {}

    setLoading(false);
  };
  useEffect(() => {
    setSubmitted(false);
  }, [selectedCategories]);
  return (
    <>
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col w-full gap-1"
        >
          {label && (
            <label>
              <span className="label-text">{label}</span>
            </label>
          )}

          <CategorySelect categories={categories} showDescriptions={false} styles={styles} />
          <button
            disabled={submitted}
            type="submit"
            className={"btn btn-primary my-1" + (loading ? " loading" : "")}
          >
            Apply
          </button>
          {submitted && (
            <label className="flex flex-col w-full justify-center items-center">
              <span className="label-text">categories updated {reload ? <><button onClick={() => {location.reload()}} className="btn btn-sm btn-ghost lowercase font-light text-sm">{"(click here if page is not reloading)"}</button></> : ""}</span>
            </label>
          )}
        </form>
      </FormProvider>
    </>
  );
}
