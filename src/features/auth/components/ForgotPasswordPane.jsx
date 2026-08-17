import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { forgotPasswordSchema } from "../schemas/authSchemas";

/**
 * Request a password reset link.
 *
 * Shared by the buyer, merchant and admin sign-in cards so all three doors
 * behave identically. The server answers 204 whether or not the address has an
 * account, and this pane says the same thing either way: telling someone "no
 * account with that email" here would undo the point of that.
 *
 * @param {Object} props
 * @param {string} [props.defaultEmail] Carried over from the sign-in field.
 * @param {() => void} props.onBack
 * @param {string} [props.accent] Tailwind classes for the submit button.
 */
export function ForgotPasswordPane({ defaultEmail = "", onBack, accent }) {
  const [sentTo, setSentTo] = useState(null);

  const form = useForm({
    defaultValues: { email: defaultEmail },
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const submitClass =
    accent ||
    "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-accent";

  const handleSubmit = async (data) => {
    try {
      await api.post("/v1/auth/forgot-password", { email: data.email });
      setSentTo(data.email);
    } catch (err) {
      // 429 is the one failure worth naming: the person is being told to wait,
      // not that anything is wrong with their address.
      const message =
        err.response?.status === 429
          ? "Too many reset requests. Please try again in an hour."
          : err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  if (sentTo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-primary">
            <MailCheck className="h-7 w-7" aria-hidden />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Check your inbox</p>
          <p className="mt-1.5 text-sm text-body">
            If an account exists for{" "}
            <span className="font-semibold text-foreground break-all">{sentTo}</span>, a
            reset link is on its way. It expires in 10 minutes.
          </p>
        </div>
        <p className="rounded-xl bg-surface-sunken px-4 py-3 text-center text-sm text-body">
          Nothing arrived? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="font-semibold text-primary hover:underline"
          >
            try another email
          </button>
          .
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-border-strong px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <p className="font-semibold text-foreground">Reset your password</p>
        <p className="mt-1 text-sm text-body">
          Enter the email you signed up with and we&rsquo;ll send you a link to choose a
          new password.
        </p>
      </div>

      <FormField label="Email" required error={form.formState.errors.email?.message} id="fp-email">
        <Input type="email" placeholder="you@example.com" autoComplete="email" {...form.register("email")} />
      </FormField>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className={`w-full min-h-[48px] inline-flex items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50 touch-manipulation ${submitClass}`}
      >
        {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-body transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to sign in
      </button>
    </form>
  );
}
