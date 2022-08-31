import React from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";

interface SiteFormData {
  url: string;
  sourceLink?: string;
  description?: string;
  category: string;
  tags: string[];
}
const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

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
  } = useForm<SiteFormData>({});

  const onFormSubmit = (data: SiteFormData) => {};

  return (
    <>
      <form action="" onSubmit={handleSubmit(onFormSubmit)}>
        <div>
          <input
            type="text"
            placeholder="url"
            {...register("url", { required: true, pattern: urlPattern })}
          />
        </div>
        <div>
        {errors.url?.type === "required" && (
          <span className="text-red-400">title required</span>
        )}
        {errors.url?.type === "pattern" && (
          <span className="text-red-400">only letters</span>
        )}
         {errors.url?.type === "postAlreadyExists" && (
          <span className="text-red-400">post exists</span>
        )}
        {errors.url?.type && (
          <button type="button" onClick={() => clearErrors("url")}>
            x
          </button>
        )}
      </div>
      </form>
      <DevTool control={control} /> {/* set up the dev tool */}
    </>
  );
};

export default SiteSubmit;
