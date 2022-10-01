import { useEffect, useState } from "react";
import { CornerDownLeft } from "react-feather";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { SiteFormData } from "../../types";

export default function TagsInput({}) {
  const {
    register,
    control,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
    setValue,
  } = useFormContext<SiteFormData>();

  const { fields, append, remove } = useFieldArray<SiteFormData, "tags", "id">({
    control,
    name: "tags",
  });
  const cTags = watch("tags");

  const [tagError, setTagError] = useState("");
  const checkNewTag = () => {
    //console.log(cTags);
    if (cTags.length > 20) {
      setTagError("maximumNumber");
      return 1;
    }
    const last = cTags[cTags.length - 1];
    const lastName = last.name.trim();
    //console.log(lastName.match(/[A-Za-z0-9 ]+/), lastName);
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
    if (cTags.length < 20 && tagError === "maximumNumber") {
      setTagError("");
    }
  }, [cTags.length, tagError]);

  return (
    <>
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
                  <span className="label-text-alt text-error">duplicate</span>
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
                  {...register(`tags.${index}.name` as const, {})}
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
    </>
  );
}
