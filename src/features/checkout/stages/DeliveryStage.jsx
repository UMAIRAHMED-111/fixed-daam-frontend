import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Truck } from "lucide-react";
import { TEXTAREA_CLASS } from "@/lib/styles";
import { FormErrorMessage } from "@/components/ui/FormErrorMessage";
import { trimFormData } from "@/lib/formUtils";
import { deliverySchema } from "../schemas/checkoutSchemas";
import { DELIVERY_CITY, DELIVERY_FEE } from "../constants";
import { StageCard } from "../components/StageCard";
import { Button } from "@/components/ui/Button";
import { formatAmount } from "@/lib/money";

const METHODS = [
  {
    id: "pickup",
    Icon: Store,
    title: "Collect from the merchant",
    description:
      "Show your rotating pickup code at the store whenever you're ready. Collect in parts if you like.",
    price: "Free",
  },
  {
    id: "delivery",
    Icon: Truck,
    title: "Standard delivery",
    description: `Delivered to your door. Currently available in ${DELIVERY_CITY} only.`,
    price: `PKR ${formatAmount(DELIVERY_FEE)}`,
  },
];

/**
 * Stage 2, pickup or delivery, mirroring a shipping-method step.
 *
 * @param {Object} props
 * @param {{method: string, address: string}} props.delivery
 * @param {(delivery: object) => void} props.onSubmit
 * @param {(method: string) => void} props.onMethodChange - Fires on selection so the
 *   order summary shows the fee immediately, before the stage is submitted.
 * @param {() => void} props.onBack
 */
export function DeliveryStage({ delivery, onSubmit, onMethodChange, onBack }) {
  const form = useForm({
    defaultValues: delivery,
    resolver: zodResolver(deliverySchema),
    mode: "onSubmit",
  });

  const method = form.watch("method");
  const addressError = form.formState.errors.address?.message;

  useEffect(() => {
    onMethodChange(method);
  }, [method, onMethodChange]);

  return (
    <StageCard heading="How would you like to get it?">
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(trimFormData(data)))}
        className="space-y-4"
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Delivery method</legend>
          {METHODS.map(({ id, Icon, title, description, price }) => {
            const isSelected = method === id;
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  value={id}
                  {...form.register("method")}
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    isSelected ? "text-primary" : "text-muted"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {price}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-body">{description}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {method === "delivery" && (
          <div>
            <label
              htmlFor="checkout-address"
              className="mb-1.5 block text-sm font-medium text-body"
            >
              Delivery address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="checkout-address"
              rows={3}
              placeholder={`House / street / area, ${DELIVERY_CITY}`}
              className={TEXTAREA_CLASS}
              {...form.register("address")}
            />
            {addressError && <FormErrorMessage message={addressError} />}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
          <Button type="submit" size="lg" className="flex-1">
            Continue to payment
          </Button>
          <Button variant="secondary" size="lg" onClick={onBack}>
            Back
          </Button>
        </div>
      </form>
    </StageCard>
  );
}
