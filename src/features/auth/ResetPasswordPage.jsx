import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, KeyRound, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { resetPasswordSchema } from "./schemas/authSchemas";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

/**
 * Landing page for the link in the reset-password email
 * (`/reset-password?token=…`, built in the backend's email service).
 *
 * The token is spent server-side on success and every session for that account
 * is signed out, so this page clears any local session before sending people to
 * sign in again with the new password.
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const logout = useAuthStore((s) => s.logout);
  const [done, setDone] = useState(false);

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const watchedPassword = form.watch("password");

  const handleSubmit = async (data) => {
    try {
      await api.post(
        "/v1/auth/reset-password",
        { password: data.password },
        { params: { token } }
      );
      // The server has just invalidated every session for this account. Drop the
      // stale local one so the app doesn't keep rendering as signed in.
      await logout();
      setDone(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        toast.error("This reset link has expired or has already been used. Please request a new one.");
      } else if (status === 429) {
        toast.error("Too many password reset requests. Please try again in an hour.");
      } else {
        toast.error(err.response?.data?.message || "Couldn't reset your password. Please try again.");
      }
    }
  };

  const shell = (children) => (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-12 [padding-bottom:max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-e2)] sm:p-8">
        {children}
      </div>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to the shop
      </Link>
    </div>
  );

  // No token means the link was mangled in transit or someone opened the URL by
  // hand. Say so plainly instead of showing a form that cannot possibly work.
  if (!token) {
    return shell(
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <TriangleAlert className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Reset link incomplete</h1>
        <p className="mt-2 text-sm text-body">
          This page needs the token from your reset email. Open the link in that email
          again, or request a fresh one from the sign-in page.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-accent"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return shell(
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Password updated</h1>
        <p className="mt-2 text-sm text-body">
          You&rsquo;ve been signed out everywhere else for safety. Sign in with your new
          password to carry on.
        </p>
        <button
          type="button"
          onClick={() => navigate("/auth", { replace: true })}
          className="mt-6 min-h-[48px] w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-accent touch-manipulation"
        >
          Go to sign in
        </button>
        <p className="mt-3 text-sm text-muted">
          Selling on FixedDaam?{" "}
          <Link to="/merchant" className="font-medium text-primary hover:underline">
            Merchant sign-in
          </Link>
        </p>
      </div>
    );
  }

  return shell(
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary">
          <KeyRound className="h-5 w-5" aria-hidden />
        </div>
        <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
          Choose a new password
        </h1>
      </div>
      <p className="mt-2 text-sm text-body">
        Pick something you don&rsquo;t use anywhere else. This link works once and
        expires 10 minutes after it was sent.
      </p>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-4">
        <FormField
          label="New password"
          required
          error={form.formState.errors.password?.message}
          id="rp-password"
        >
          <PasswordInput
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            {...form.register("password")}
          />
          <PasswordStrengthMeter password={watchedPassword} />
        </FormField>

        <FormField
          label="Confirm new password"
          required
          error={form.formState.errors.confirmPassword?.message}
          id="rp-confirm-password"
        >
          <PasswordInput
            placeholder="••••••••"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
        </FormField>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-accent disabled:opacity-50 touch-manipulation"
        >
          {form.formState.isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}
