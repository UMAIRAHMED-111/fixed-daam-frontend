import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const called = useRef(false); // prevent double-call in React Strict Mode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please use the link from your email.");
      return;
    }

    api
      .get("/v1/auth/verify-email", { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully. You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may have expired. Please request a new one."
        );
      });
  }, [token]);

  // Start countdown once verified
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      navigate("/auth");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 text-center">

        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
            <h1 className="text-lg font-semibold text-slate-900">Verifying your email…</h1>
            <p className="mt-2 text-sm text-slate-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Email verified!</h1>
            <p className="mt-2 text-slate-600">{message}</p>
            <p className="mt-4 text-sm text-slate-500">
              Redirecting to sign in in{" "}
              <span className="font-semibold text-primary">{countdown}</span> second{countdown !== 1 ? "s" : ""}…
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="mt-4 w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-colors"
            >
              Sign in now
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Verification failed</h1>
            <p className="mt-2 text-slate-600">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="mt-6 w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-colors"
            >
              Back to sign in
            </button>
          </>
        )}

      </div>
    </div>
  );
}
