import { useForm } from "react-hook-form";
import ResendVerifEmail from "../auth/ResendVerifEmail";

export default function ResendVerificationForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
    watch,
  } = useForm<{ email: string }>({mode: "onChange" });
  const email = watch("email");
  return (
    <div className="flex flex-col gap-2 w-full">
      <form onSubmit={(e) => {e.preventDefault(); e.stopPropagation();}} className="flex flex-col w-full">
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
      </form>
      <ResendVerifEmail disabled={!!errors.email?.type || !email} email={email}/>
    </div>
  );
}
