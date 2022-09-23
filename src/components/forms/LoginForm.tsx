import { signIn } from "@astro-auth/client";
import { useState } from "react";
import { Eye, EyeOff } from "react-feather";
import { useForm } from "react-hook-form";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginForm({ signUp = false }: { signUp?: boolean }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
  } = useForm<LoginData>();
  const [loading, setLoading] = useState(false);
  const [showP1, setShowP1] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const onFormSubmit = async (data: LoginData) => {
    clearErrors();
    setLoading(true);
    if (signUp) {
      try {
        const res = await fetch("/api/auth/signup", {
          body: JSON.stringify(data),
          method: "post",
        });
        console.log("response?", res);
        const resData = await res.json();
        if (res.ok) {
          setAccountCreated(true);
        } else if (resData?.["ERROR"] === "email") {
          setError("email", { message: "email in use" });
        } else {
          setError("email", { message: "something went wrong" });
        }
      } catch (err) {
        setError("email", { message: "something went wrong" });
        setLoading(false);
      }
    } else {
      const s = await signIn({
        provider: "credential",
        // callbackURL: "/dashboard/admin",
        login: {
          email: data.email,
          password: data.password,
        },
      });
      if (!s.redirect) {
        setError("email", { message: "invalid credentials" });
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
        <div className="flex flex-col">
          <label>
            <span className="label-text-alt text-error">
              {errors.email?.message}
            </span>
          </label>
          <input
            className="input"
            placeholder="email"
            type="email"
            {...register("email", { required: true })}
          />
        </div>
        <div className="flex flex-col">
          <label className="input-group">
            <input
              className="input w-full"
              placeholder="password"
              type={showP1 ? "text" : "password"}
              {...register("password", {
                required: true,
                minLength: signUp ? 9 : 0,
              })}
            />
            <span className="text-neutral">
              <button type="button" onClick={() => setShowP1((s) => !s)}>
                {showP1 ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </span>
          </label>
          <label>
            <span className="label-text-alt text-error">
              {errors.password?.type === "minLength"
                ? "password must be at least 9 characters"
                : ""}
            </span>
          </label>
        </div>

        <button
          disabled={accountCreated}
          type="submit"
          className={"btn btn-primary " + (loading ? "loading" : "")}
        >
          {signUp ? "Sign Up" : "Log In"}
        </button>
      </form>
      {!signUp && errors.email?.message === "invalid credentials" && (
        <div className="flex flex-col">
          <label>
            <span className="label label-text">Forgot your password?</span>
          </label>
          <a className="btn" href="/auth/reset">
            Reset Password
          </a>
          <label>
            <span className="label label-text">Is your account verified?</span>
          </label>
          <a className="btn" href="/auth/verify">
            Resend Verification
          </a>
        </div>
      )}
      {accountCreated && (
        <div className="flex flex-col gap-4">
          <h2>Account Created</h2>
          <span>Check your email to verify your account prior to logging in.</span>
        </div>
      )}
    </>
  );
}
