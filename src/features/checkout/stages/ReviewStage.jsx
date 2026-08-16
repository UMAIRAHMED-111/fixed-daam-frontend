import { Pencil } from "lucide-react";
import { PAYMENT_DETAILS, WHATSAPP_NUMBER } from "@/lib/contact";
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
 * Stage 3, everything in one place before the order is placed.
 *
 * @param {Object} props
 * @param {{name: string, email: string, phoneNumber: string, address: string}} props.customer
 * @param {boolean} props.isPlacing
 * @param {(stageId: string) => void} props.onEdit
 * @param {() => void} props.onPlaceOrder
 * @param {() => void} props.onBack
 */
export function ReviewStage({ customer, isPlacing, onEdit, onPlaceOrder, onBack }) {
  return (
    <StageCard heading="Review your order">
      <div className="rounded-xl border border-border">
        <div className="px-4">
          <ReviewRow label="Contact" onEdit={() => onEdit("customer")}>
            <p className="font-medium text-foreground">{customer.name}</p>
            <p className="text-body">{customer.email}</p>
            <p className="text-body">{customer.phoneNumber}</p>
          </ReviewRow>

          <ReviewRow label="Delivery" onEdit={() => onEdit("customer")}>
            <p className="font-medium text-foreground">Included, no extra charge</p>
            <p className="whitespace-pre-line text-body">{customer.address}</p>
          </ReviewRow>

          <ReviewRow label="Payment" onEdit={() => onEdit("payment")}>
            <p className="font-medium text-foreground">
              {PAYMENT_DETAILS.bankName} transfer
            </p>
            <p className="tnum text-body">
              {PAYMENT_DETAILS.accountNumber} · {PAYMENT_DETAILS.accountName}
            </p>
          </ReviewRow>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Placing the order reserves your items and locks their prices. Send the payment
        confirmation screenshot to {WHATSAPP_NUMBER} on WhatsApp and an admin approves
        it, usually within 2–3 hours.
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
