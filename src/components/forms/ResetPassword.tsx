import { useState } from "react";
import { Eye, EyeOff } from "react-feather";
import { useForm } from "react-hook-form";

interface ResetData {
  email?: string;
  password1?: string;
  password2?: string;
  key?: string;
}

export default function ResetPassword({ resetKey }: { resetKey?: string }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
  } = useForm<ResetData>({ defaultValues: { key: resetKey } });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const onFormSubmit = async (data: ResetData) => {
    clearErrors();
    setSubmitError("");
    setLoading(true);
    if (resetKey) {
      if (data?.password1 !== data?.password2) {
        setError("password2", { message: "passwords do not match" });
      } else {
        try {
          const res = await fetch("/api/auth/reset", {
            method: "post",
            body: JSON.stringify(data),
          });
          if (res.ok) {
            setSubmitted("password was reset");
          } else {
            setSubmitError("something went wrong");
          }
        } catch (err) {
          setSubmitError("something went wrong");
        }
      }
    } else {
      try {
        const res = await fetch("/api/auth/send-reset", {
          method: "post",
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setSubmitted("Reset email sent. Check your spam folder.");
        } else {
          setSubmitError("something went wrong");
        }
      } catch (err) {
        setSubmitError("something went wrong");
      }
    }
    setLoading(false);
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="form-control gap-2 max-w-xl w-full "
      >
        {resetKey ? (
          <div className="flex flex-col gap-2">
            <label className="input-group">
              <input
                className="input w-full"
                placeholder="password"
                type={showP1 ? "text" : "password"}
                {...register("password1", {
                  required: true,
                  minLength: 9,
                })}
              />
              <span className="text-neutral">
                <button type="button" onClick={() => setShowP1((s) => !s)}>
                  {showP1 ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </span>
            </label>
            <label className="input-group">
              <input
                className="input w-full"
                placeholder="repeat password"
                type={showP2 ? "text" : "password"}
                {...register("password2", {
                  required: true,
                  minLength: 9,
                })}
              />
              <span className="text-neutral">
                <button type="button" onClick={() => setShowP2((s) => !s)}>
                  {showP2 ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </span>
            </label>

            <label>
              <span className="label-text-alt text-error">
                {errors.password1?.type === "minLength"
                  ? "password must be at least 9 characters"
                  : errors.password1?.type === "required" ||
                    errors.password2?.type === "required"
                  ? "enter matching passwords"
                  : errors.password2?.message
                  ? errors.password2.message
                  : ""}
              </span>
            </label>
          </div>
        ) : (
          <div className="flex flex-col">
            <label>
              <span className="label-text">Enter you account email</span>
            </label>
            <input
              className="input"
              placeholder="email"
              type="email"
              {...register("email", { required: true })}
            />
            <label>
              <span className="label-text-alt text-error">
                {errors.email?.type === "required"
                  ? "email required"
                  : errors.email?.type
                  ? "invalid email"
                  : ""}
              </span>
            </label>
          </div>
        )}
        <button
          disabled={!!submitted}
          type="submit"
          className={"btn btn-primary " + (loading ? "loading" : "")}
        >
          {resetKey ? "Update Password" : "Send Password Reset Email"}
        </button>
      </form>
      <div className="flex items-center justify-center">
        {submitted && (
          <label>
            <span className="label label-text">{submitted}</span>
          </label>
        )}
        {submitError && (
          <label>
            <span className="label label-text text-error">{submitError}</span>
          </label>
        )}
      </div>
    </>
  );
}
