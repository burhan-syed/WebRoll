import { useState } from "react";

export default function ResendVerifEmail({
  key,
  email,
  disabled = false
}: {
  key?: string;
  email?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const resendVerification = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "post",
        body: JSON.stringify({ key: key, email: email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setErr(res?.status === 401 ? email ? "This account does not exist or is already verified. Is this the correct email?" : "something went wrong" : "something went wrong");
      }
    } catch (err) {
      setErr("something went wrong");
    }
    setLoading(false); 
  };

  return (
    <>
      <button
        disabled={sent || disabled}
        onClick={resendVerification}
        className={"btn btn-primary w-full " + (loading ? "loading" : "")}
      >
        Resend Verification Email
      </button>
      <label className="flex items-center justify-center">
        {sent ? (
          <span className="text-sm">
            Email was sent. Check your spam folder.
          </span>
        ) : (
          err && <span className="text-error text-sm">{err}</span>
        )}
      </label>
    </>
  );
}
