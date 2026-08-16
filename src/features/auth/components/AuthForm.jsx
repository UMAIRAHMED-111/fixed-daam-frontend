import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { trimFormData } from "@/lib/formUtils";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { loginSchema, buyerSignUpSchema, merchantSignUpSchema } from "../schemas/authSchemas";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/Dialog";

export function AuthForm({ authType = "buyer" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const isMerchant = authType === "merchant";
  const from = location.state?.from?.pathname;
  const [isSignUp, setIsSignUp] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  // Shown after a failed sign-in: the most common cause is being at the wrong door.
  const [showDoorHint, setShowDoorHint] = useState(false);

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
    setShowDoorHint(false);
    try {
      const res = await api.post("/v1/auth/login", {
        email: cleaned.email,
        password: cleaned.password,
        role,
      });
      const { user } = res.data;
      login(user);
      loginForm.reset();
      let target = from && from !== "/auth" ? from : "/dashboard";
      if (!isMerchant && target.startsWith("/dashboard/inventory")) target = "/dashboard";
      if (role !== "admin" && target.startsWith("/dashboard/admin")) target = "/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
      setShowDoorHint(true);
    }
  };

  const handleSignUp = async (data) => {
    const cleaned = trimFormData(data);
    try {
      const body = {
        email: cleaned.email,
        password: cleaned.password,
        role,
        name: cleaned.name || cleaned.storeName,
        phoneNumber: cleaned.phoneNumber,
      };
      await api.post("/v1/auth/register", body);
      signUpForm.reset();
      setRegisteredEmail(cleaned.email);
      loginForm.setValue("email", cleaned.email);
      setShowVerifyModal(true);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const handleVerifyModalClose = () => {
    setShowVerifyModal(false);
    switchToSignIn();
  };

  return (
    <>
      <Dialog open={showVerifyModal} onOpenChange={handleVerifyModalClose}>
        <Dialog.Header>
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0l-9.75 6.75L2.25 6.75" />
              </svg>
            </div>
          </div>
          <Dialog.Title className="text-center text-xl">Check your inbox</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description className="text-center mb-1">
          We sent a verification link to
        </Dialog.Description>
        <p className="text-center font-semibold text-foreground text-sm mb-4 break-all">{registeredEmail}</p>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Click the link in the email to verify your account. Once verified, you can sign in.
        </p>
        <button
          type="button"
          onClick={handleVerifyModalClose}
          className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-accent transition-colors touch-manipulation"
        >
          Got it, go to sign in
        </button>
      </Dialog>

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
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-accent transition-colors disabled:opacity-50 touch-manipulation"
          >
            {loginForm.formState.isSubmitting ? "Please wait…" : "Sign in"}
          </button>
          {showDoorHint && (
            <p className="rounded-xl bg-surface-sunken px-4 py-3 text-center text-sm text-body">
              {isMerchant
                ? "Shopper accounts do not work here."
                : "Shop accounts only."}{" "}
              <Link
                to={isMerchant ? "/auth" : "/merchant"}
                className="font-semibold text-primary hover:underline"
              >
                {isMerchant ? "Buyer sign-in" : "Merchant sign-in"}
              </Link>{" "}
              is a separate door.
            </p>
          )}
          <p className="text-center text-sm text-muted">
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
          <FormField label="Phone number" required error={signUpForm.formState.errors.phoneNumber?.message} id="phoneNumber">
            <Input type="tel" placeholder="e.g. +92 300 1234567" {...signUpForm.register("phoneNumber")} />
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
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-primary accent-primary cursor-pointer"
                {...signUpForm.register("termsAccepted")}
              />
              <span className="text-sm text-body leading-snug">
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
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-accent transition-colors disabled:opacity-50 touch-manipulation"
          >
            {signUpForm.formState.isSubmitting ? "Please wait…" : "Create account"}
          </button>
          <p className="text-center text-sm text-muted">
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
