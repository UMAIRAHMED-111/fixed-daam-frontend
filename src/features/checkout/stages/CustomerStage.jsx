import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { trimFormData } from "@/lib/formUtils";
import { useAuthStore } from "@/stores/authStore";
import { customerSchema } from "../schemas/checkoutSchemas";
import { StageCard } from "../components/StageCard";

/**
 * Stage 1: who the order belongs to.
 *
 * Guests check out with contact details alone. The email is what ties the order
 * to them: it receives the receipt, and registering with that same email later
 * pulls the order into their account.
 *
 * @param {Object} props
 * @param {{name: string, email: string, phoneNumber: string}} props.customer
 * @param {(customer: object) => void} props.onSubmit
 */
export function CustomerStage({ customer, onSubmit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const form = useForm({
    defaultValues: customer,
    resolver: zodResolver(customerSchema),
    mode: "onSubmit",
  });

  // Account details arrive after the first render (and again right after signing
  // in), so re-seed the form unless the shopper has already started typing.
  useEffect(() => {
    if (!form.formState.isDirty) form.reset(customer);
  }, [customer, form]);

  const goToAuth = () => navigate("/auth", { state: { from: location } });
  const handleContinue = (data) => onSubmit(trimFormData(data));

  return (
    <StageCard
      heading="Contact details"
      description={
        isAuthenticated
          ? "We use these to reach you about your order and pickup."
          : "No account needed. These are how we send your receipt and pickup code."
      }
    >
      {!isAuthenticated && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-3">
          <p className="text-sm text-body">Already have an account?</p>
          <Button variant="secondary" size="sm" onClick={goToAuth}>
            Sign in
          </Button>
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-4">
        <FormField
          label="Email"
          required
          error={form.formState.errors.email?.message}
          id="checkout-email"
          hint={
            isAuthenticated
              ? "Tied to your account. Change it from your profile."
              : "Your receipt and pickup code go here."
          }
        >
          <Input
            type="email"
            placeholder="you@example.com"
            readOnly={isAuthenticated}
            className={isAuthenticated ? "cursor-not-allowed bg-surface-sunken" : undefined}
            {...form.register("email")}
          />
        </FormField>

        <FormField
          label="Full name"
          required
          error={form.formState.errors.name?.message}
          id="checkout-name"
        >
          <Input type="text" placeholder="Your full name" {...form.register("name")} />
        </FormField>

        <FormField
          label="Phone number"
          required
          error={form.formState.errors.phoneNumber?.message}
          id="checkout-phone"
          hint="So the merchant can reach you about collection."
        >
          <Input
            type="tel"
            placeholder="e.g. +92 300 1234567"
            {...form.register("phoneNumber")}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth isLoading={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : isAuthenticated
              ? "Continue to delivery"
              : "Continue as guest"}
        </Button>
      </form>
    </StageCard>
  );
}
