import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { trimFormData } from "@/lib/formUtils";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { loginSchema, buyerSignUpSchema, merchantSignUpSchema } from "../schemas/authSchemas";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const GOOGLE_ICON = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);


export function AuthForm({ authType = "buyer" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isMerchant = authType === "merchant";
  const from = location.state?.from?.pathname;
  const [isSignUp, setIsSignUp] = useState(false);

  const role = isMerchant ? "merchant" : "buyer";

  // Separate form instances so schemas never conflict
  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const signUpForm = useForm({
    defaultValues: isMerchant
      ? { storeName: "", phoneNumber: "", email: "", password: "", confirmPassword: "", termsAccepted: false }
      : { name: "", email: "", password: "", confirmPassword: "", termsAccepted: false },
    resolver: zodResolver(isMerchant ? merchantSignUpSchema : buyerSignUpSchema),
    mode: "onSubmit",
  });

  // Watch password for live strength meter
  const watchedPassword = signUpForm.watch("password");

  const switchToSignUp = () => {
    const email = loginForm.getValues("email");
    setIsSignUp(true);
    if (email) signUpForm.setValue("email", email);
  };

  const switchToSignIn = () => {
    const email = signUpForm.getValues("email");
    setIsSignUp(false);
    if (email) loginForm.setValue("email", email);
  };

  const handleLogin = async (data) => {
    const cleaned = trimFormData(data);
    try {
      const res = await api.post("/v1/auth/login", {
        email: cleaned.email,
        password: cleaned.password,
        role,
      });
      const { user, tokens } = res.data;
      login(user, tokens.access.token, tokens.refresh.token);
      loginForm.reset();
      let target = from && from !== "/auth" ? from : "/dashboard";
      if (!isMerchant && target.startsWith("/dashboard/inventory")) target = "/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const handleSignUp = async (data) => {
    const cleaned = trimFormData(data);
    try {
      const body = {
        email: cleaned.email,
        password: cleaned.password,
        role,
      };
      if (isMerchant) {
        body.name = cleaned.storeName;
        body.phoneNumber = cleaned.phoneNumber;
      } else {
        body.name = cleaned.name;
      }
      await api.post("/v1/auth/register", body);
      toast.success("Account created! Please check your email to verify your account, then sign in.");
      signUpForm.reset();
      switchToSignIn();
      loginForm.setValue("email", cleaned.email);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const googleUrl = import.meta.env.VITE_AUTH_GOOGLE_URL || "";

  const handleSso = (url, provider) => {
    if (url) {
      window.location.href = `${url}?type=${authType}`;
    } else {
      toast.info(`${provider} SSO will be available once configured.`);
    }
  };

  return (
    <>
      {/* SSO */}
      <div className="space-y-3">
        {googleUrl ? (
          <a
            href={`${googleUrl}?type=${authType}`}
            className="flex w-full min-h-[48px] items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors touch-manipulation"
          >
            {GOOGLE_ICON}
            Continue with Google
          </a>
        ) : (
          <button
            type="button"
            onClick={() => handleSso(googleUrl, "Google")}
            className="flex w-full min-h-[48px] items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors touch-manipulation"
          >
            {GOOGLE_ICON}
            Continue with Google
          </button>
        )}
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs font-medium">
          <span className="bg-white px-2 text-slate-500">or continue with email</span>
        </div>
      </div>

      {/* ── Sign-in form ── */}
      {!isSignUp && (
        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
          <FormField label="Email" required error={loginForm.formState.errors.email?.message} id="email">
            <Input type="email" placeholder="you@example.com" {...loginForm.register("email")} />
          </FormField>
          <FormField label="Password" required error={loginForm.formState.errors.password?.message} id="password">
            <PasswordInput placeholder="••••••••" {...loginForm.register("password")} />
          </FormField>
          <button
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {loginForm.formState.isSubmitting ? "Please wait…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-slate-500">
            No account?{" "}
            <button type="button" onClick={switchToSignUp} className="text-primary font-medium hover:underline">
              Create account
            </button>
          </p>
        </form>
      )}

      {/* ── Sign-up form ── */}
      {isSignUp && (
        <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">

          {isMerchant ? (
            /* ── Merchant fields ── */
            <>
              <FormField label="Store / Business name" required error={signUpForm.formState.errors.storeName?.message} id="storeName">
                <Input type="text" placeholder="e.g. Ahmed's Electronics" {...signUpForm.register("storeName")} />
              </FormField>
              <FormField label="Phone number" required error={signUpForm.formState.errors.phoneNumber?.message} id="phoneNumber">
                <Input type="tel" placeholder="e.g. +92 300 1234567" {...signUpForm.register("phoneNumber")} />
              </FormField>
            </>
          ) : (
            /* ── Buyer fields ── */
            <FormField label="Full name" required error={signUpForm.formState.errors.name?.message} id="name">
              <Input type="text" placeholder="Your full name" {...signUpForm.register("name")} />
            </FormField>
          )}

          <FormField label="Email" required error={signUpForm.formState.errors.email?.message} id="su-email">
            <Input type="email" placeholder="you@example.com" {...signUpForm.register("email")} />
          </FormField>

          <FormField label="Password" required error={signUpForm.formState.errors.password?.message} id="su-password">
            <PasswordInput placeholder="Min. 8 characters" {...signUpForm.register("password")} />
            <PasswordStrengthMeter password={watchedPassword} />
          </FormField>

          <FormField label="Confirm password" required error={signUpForm.formState.errors.confirmPassword?.message} id="confirmPassword">
            <PasswordInput placeholder="••••••••" {...signUpForm.register("confirmPassword")} />
          </FormField>

          {/* Terms and conditions */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary accent-primary cursor-pointer"
                {...signUpForm.register("termsAccepted")}
              />
              <span className="text-sm text-slate-600 leading-snug">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {signUpForm.formState.errors.termsAccepted && (
              <p className="text-xs text-red-500 pl-7">
                {signUpForm.formState.errors.termsAccepted.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={signUpForm.formState.isSubmitting}
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {signUpForm.formState.isSubmitting ? "Please wait…" : "Create account"}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button type="button" onClick={switchToSignIn} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </form>
      )}
    </>
  );
}
