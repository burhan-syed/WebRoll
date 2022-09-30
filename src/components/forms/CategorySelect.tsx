import type { Categories } from "@prisma/client";
import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { SiteFormData } from "../../types";

export default function CategorySelect({
  categories,
  maxCount,
  minCount,
  showDescriptions = true,
  styles=""
}: {
  categories: Categories[];
  maxCount?: number;
  minCount?: number;
  showDescriptions?: boolean;
  styles?:string
}) {
  const {
    register,
    control,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
    ///setValue,
  } = useFormContext<SiteFormData>();

  const { field } = useController({
    control,
    name: "categories",
  });
  const [value, setValue] = useState(field.value || []);

  useEffect(() => {
    const count = value.filter((v) => v)?.length;

    if (maxCount && count > maxCount) {
      setError("categories", {
        type: "maxLength",
        message: "select no more than two",
      });
    } else if (minCount && (!count || count < minCount)) {
      setError("categories", {
        type: "minLength",
        message: "select at least one",
      });
    } else if (minCount && maxCount && value.includes("Fun") && count < 2) {
      setError("categories", {
        type: "minLength",
        message: `select two when "Fun" is selected`,
      });
    } else if (maxCount && minCount && count > 0) {
      clearErrors("categories");
    }
  }, [value]);

  return (
    <>
      {categories.map((category, i) => (
        <label
          key={category.category}
          className={"flex items-start gap-2 px-4 cursor-pointer select-none " + (styles)}
        >
          <input
            className={
              "checkbox " + (showDescriptions ? " mt-1.5 " : " ") + 
              (value.includes(category.category) ? " checkbox-primary " : "")
            }
            type={"checkbox"}
            //id={category.category}
            value={category.category}
            checked={value.includes(category.category)}
            onChange={(e: any) => {
              const valueCopy = [...value];
              //update checkbox value
              (valueCopy[i] = e.target.checked ? e.target.value : null),
                //send data to react-hook-form
                field.onChange(valueCopy);
              //update local state
              setValue(valueCopy);
            }}
            //{...register("category", { required: true })}
          />
       
          <div className={"flex flex-col  items-start "}>
            <span className="text-base-content font-light ">
              {category.category}
            </span>
            {showDescriptions && (
              <span className="text-xs pt-1 font-light">
                {category.description}
              </span>
            )}
          </div>
        </label>
      ))}
    </>
  );
}
