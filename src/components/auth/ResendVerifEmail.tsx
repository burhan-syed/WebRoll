import { useState } from "react";

export default function ResendVerifEmail({
  key,
  email,
}: {
  key?: string;
  email?: string;
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
        setErr("something went wrong");
      }
    } catch (err) {
      setErr("something went wrong");
    }
    setLoading(false); 
  };

  return (
    <>
      <button
        disabled={sent}
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
