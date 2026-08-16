import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, UserCircle } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TEXTAREA_CLASS } from "@/lib/styles";
import { trimFormData } from "@/lib/formUtils";
import { useAuthStore } from "@/stores/authStore";
import { customerSchema } from "../schemas/checkoutSchemas";
import { StageCard } from "../components/StageCard";

/**
 * Stage 1: who the order belongs to and where it goes.
 *
 * Buying as a guest is the default and is said out loud, because an account is
 * genuinely optional here. The email is what ties the order to them: it receives
 * the receipt, and registering with that same email later pulls the order in.
 *
 * @param {Object} props
 * @param {{name: string, email: string, phoneNumber: string, address: string}} props.customer
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
      heading="Your details"
      description={
        isAuthenticated
          ? "We use these to reach you about your order and its delivery."
          : "No account needed. These are how we send your receipt and reach you about delivery."
      }
    >
      {!isAuthenticated && (
        <div className="mb-5 rounded-xl border border-border bg-surface-sunken p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Buying as a guest
          </p>
          <p className="mt-1 text-sm text-body">
            Fill in the details below and place your order. No sign-up, no password.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted">Already have an account?</p>
            <Button variant="secondary" size="sm" onClick={goToAuth}>
              Sign in instead
            </Button>
          </div>
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
              : "Your receipt and order updates go here."
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
          hint="So we can reach you about delivery."
        >
          <Input
            type="tel"
            placeholder="e.g. +92 300 1234567"
            {...form.register("phoneNumber")}
          />
        </FormField>

        <FormField
          label="Delivery address"
          required
          error={form.formState.errors.address?.message}
          id="checkout-address"
          hint="Delivery is included with every order. Message us on WhatsApp when you want it delivered."
        >
          <textarea
            id="checkout-address"
            rows={3}
            placeholder="House / street / area, city"
            className={TEXTAREA_CLASS}
            {...form.register("address")}
          />
        </FormField>

        <p className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-body">
          <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          Delivery comes with every purchase at no extra cost. Collect it whenever
          you&apos;re ready, in as many visits as you like.
        </p>

        <Button type="submit" size="lg" fullWidth isLoading={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : isAuthenticated
              ? "Continue to payment"
              : "Continue as guest"}
        </Button>
      </form>
    </StageCard>
  );
}
