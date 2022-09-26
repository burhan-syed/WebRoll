import { useState } from 'react'
import { HelpCircle } from 'react-feather';
import { useFormContext } from "react-hook-form";
import type { SiteFormData } from '../../types';

export default function PrivacyRespectToggle() {
  const {
    register,
  } = useFormContext<SiteFormData>();
  const [showPrivacyHelp, setShowPrivacyHelp] = useState(false)
  return (
    <>
         <label className="flex justify-between items-center cursor-pointer select-none px-1 py-2">
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
          </div>
    </>
  )
}
