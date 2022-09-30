import ReportForm from "../forms/ReportForm";
import { X } from "react-feather";
import type { Categories, Tags } from "@prisma/client";
import CategoriesSelectForm from "../forms/CategoriesSelectForm";
export default function CategorySelectModal({
  categories,
  userCategories,
  onCategorySelectUpdate
}: {
  categories: Categories[];
  userCategories: string[];
  onCategorySelectUpdate?:Function;
}) {
  return (
    <>
      <input type="checkbox" id="category-modal" className="modal-toggle" />
      <label htmlFor="category-modal" className="modal cursor-pointer ">
        <label
          className="modal-box relative bg-base-100/80 backdrop-blur-md "
          htmlFor=""
        >
          <label
            htmlFor="category-modal"
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            <X />
          </label>
          <div className="my-0.5">
            <CategoriesSelectForm
              categories={categories}
              userCategories={userCategories}
              onCategorySelectUpdate={onCategorySelectUpdate}
              styles=""
            />
          </div>
        </label>
      </label>
    </>
  );
}
