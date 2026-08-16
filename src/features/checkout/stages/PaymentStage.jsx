import { useRef, useState } from "react";
import { Building2, Copy, Check, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { BANK_DETAILS } from "../constants";
import { StageCard } from "../components/StageCard";
import { Button } from "@/components/ui/Button";
import { formatAmount } from "@/lib/money";

const ROWS = [
  { label: "Bank", value: BANK_DETAILS.bankName },
  { label: "Account title", value: BANK_DETAILS.accountName },
  { label: "Account number", value: BANK_DETAILS.accountNumber, copyable: true },
  { label: "Branch", value: BANK_DETAILS.branch },
  { label: "IBAN", value: BANK_DETAILS.iban, copyable: true },
];

/**
 * Stage 3, bank transfer plus the payment screenshot an admin verifies.
 *
 * @param {Object} props
 * @param {number} props.total - Amount the buyer must transfer
 * @param {{file: File|null, preview: string|null}} props.payment
 * @param {(payment: {file: File, preview: string}) => void} props.onChange
 * @param {() => void} props.onSubmit
 * @param {() => void} props.onBack
 */
export function PaymentStage({ total, payment, onChange, onSubmit, onBack }) {
  const fileInputRef = useRef(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ file, preview: URL.createObjectURL(file) });
  };

  const clearFile = () => {
    onChange({ file: null, preview: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleContinue = () => {
    if (!payment.file) {
      toast.error("Upload your payment screenshot to continue.");
      return;
    }
    onSubmit();
  };

  return (
    <StageCard
      heading="Payment"
      description="Transfer the total to the account below, then upload the receipt. An admin verifies it before your price is locked."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-body shadow-sm">
              <Building2 className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Bank transfer</p>
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

        <div>
          <p className="mb-2 text-sm font-medium text-body">
            Proof of payment <span className="text-red-500">*</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {payment.preview ? (
            <div className="relative inline-block">
              <img
                src={payment.preview}
                alt="Payment proof preview"
                className="max-h-48 max-w-full rounded-xl border border-border bg-background object-contain"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted shadow transition hover:text-red-600"
                aria-label="Remove payment proof"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong py-6 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Upload payment screenshot
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button size="lg" className="flex-1" onClick={handleContinue}>
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
