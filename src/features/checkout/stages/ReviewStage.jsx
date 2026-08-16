import { Pencil } from "lucide-react";
import { DELIVERY_CITY } from "../constants";
import { StageCard } from "../components/StageCard";
import { Button } from "@/components/ui/Button";

/** One reviewable line: label, value, and a jump-back-to-edit link. */
function ReviewRow({ label, children, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary transition hover:bg-primary/10"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </button>
    </div>
  );
}

/**
 * Stage 4, everything in one place before the order is placed.
 *
 * @param {Object} props
 * @param {{name: string, email: string, phoneNumber: string}} props.customer
 * @param {{method: string, address: string}} props.delivery
 * @param {{file: File|null, preview: string|null}} props.payment
 * @param {boolean} props.isPlacing
 * @param {(stageId: string) => void} props.onEdit
 * @param {() => void} props.onPlaceOrder
 * @param {() => void} props.onBack
 */
export function ReviewStage({
  customer,
  delivery,
  payment,
  isPlacing,
  onEdit,
  onPlaceOrder,
  onBack,
}) {
  const isDelivery = delivery.method === "delivery";

  return (
    <StageCard heading="Review your order">
      <div className="rounded-xl border border-border">
        <div className="px-4">
          <ReviewRow label="Contact" onEdit={() => onEdit("customer")}>
            <p className="font-medium text-foreground">{customer.name}</p>
            <p className="text-body">{customer.email}</p>
            <p className="text-body">{customer.phoneNumber}</p>
          </ReviewRow>

          <ReviewRow label="Delivery" onEdit={() => onEdit("delivery")}>
            {isDelivery ? (
              <>
                <p className="font-medium text-foreground">
                  Standard delivery ({DELIVERY_CITY})
                </p>
                <p className="whitespace-pre-line text-body">{delivery.address}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-foreground">Collect from the merchant</p>
                <p className="text-body">
                  Show your rotating pickup code at the store.
                </p>
              </>
            )}
          </ReviewRow>

          <ReviewRow label="Payment" onEdit={() => onEdit("payment")}>
            <p className="font-medium text-foreground">Bank transfer</p>
            <p className="text-body">
              {payment.file?.name ?? "Payment screenshot attached"}
            </p>
            {payment.preview && (
              <img
                src={payment.preview}
                alt="Payment proof"
                className="mt-2 max-h-24 rounded-lg border border-border object-contain"
              />
            )}
          </ReviewRow>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Placing the order reserves your items and locks their prices. An admin reviews
        your payment proof, usually within 2–3 hours, and your pickup code becomes
        available once it&apos;s approved.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
        <Button size="lg" className="flex-1" onClick={onPlaceOrder} isLoading={isPlacing}>
          {isPlacing ? "Placing order…" : "Place order and lock the price"}
        </Button>
        <Button variant="secondary" size="lg" onClick={onBack} disabled={isPlacing}>
          Back
        </Button>
      </div>
    </StageCard>
  );
}
