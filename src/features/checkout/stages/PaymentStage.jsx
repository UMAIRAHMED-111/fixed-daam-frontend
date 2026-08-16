import { useState } from "react";
import { Building2, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_DETAILS, WHATSAPP_NUMBER, whatsappLink } from "@/lib/contact";
import { StageCard } from "../components/StageCard";
import { Button } from "@/components/ui/Button";
import { formatAmount } from "@/lib/money";

const ROWS = [
  { label: "Bank", value: PAYMENT_DETAILS.bankName },
  { label: "Account", value: PAYMENT_DETAILS.accountNumber, copyable: true },
  { label: "Account name", value: PAYMENT_DETAILS.accountName },
];

/**
 * Stage 2: where to send the money, and where to send the proof.
 *
 * Nothing is uploaded here. Buyers place the order and send the confirmation
 * screenshot over WhatsApp, which an admin matches to the order before
 * approving it. If a payment never arrives, we chase it.
 *
 * @param {Object} props
 * @param {number} props.total - Amount the buyer must transfer
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onBack
 */
export function PaymentStage({ total, onSubmit, onBack }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Couldn't copy, please copy it manually.");
    }
  };

  return (
    <StageCard
      heading="Payment"
      description="Transfer the total to the account below, then place your order. Send us the confirmation screenshot on WhatsApp and an admin approves it."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-body shadow-sm">
              <Building2 className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Send payment to</p>
              <p className="text-xs text-muted">
                Send exactly PKR {formatAmount(total)}
              </p>
            </div>
          </div>
          <dl className="space-y-2">
            {ROWS.map(({ label, value, copyable }) => (
              <div key={label} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                  <span className="truncate">{value}</span>
                  {copyable && (
                    <button
                      type="button"
                      onClick={() => handleCopy(label, value)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-body"
                      aria-label={`Copy ${label}`}
                    >
                      {copied === label ? (
                        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-ink">
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            After you pay
          </p>
          <p className="mt-1.5 text-sm text-body">
            Please send the confirmation screenshot to{" "}
            <a
              href={whatsappLink("Hi, here is my payment confirmation for my FixedDaam order.")}
              target="_blank"
              rel="noreferrer"
              className="tnum font-semibold text-primary-ink underline underline-offset-2"
            >
              {WHATSAPP_NUMBER}
            </a>{" "}
            on WhatsApp. Nothing to upload here.
          </p>
          <p className="mt-2 text-xs text-muted">
            You can place the order first. If we don&apos;t see the payment, we&apos;ll
            reach out and ask.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button size="lg" className="flex-1" onClick={onSubmit}>
            Review order
          </Button>
          <Button variant="secondary" size="lg" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    </StageCard>
  );
}
