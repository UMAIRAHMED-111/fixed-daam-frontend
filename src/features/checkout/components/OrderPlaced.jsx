import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock, Copy, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { formatAmount } from "@/lib/money";
import { guestOrderPath } from "@/lib/guestOrders";

/**
 * Post-order confirmation: what happens next, not just "thanks".
 *
 * Guests get their tracking link front and centre, since it is the only way back
 * to the order.
 *
 * @param {Object} props
 * @param {Object} props.order - Order returned by the API
 * @param {string} [props.guestToken] - Present when checked out without an account
 */
export function OrderPlaced({ order, guestToken }) {
  const [copied, setCopied] = useState(false);
  const isDelivery = Boolean(order?.delivery);
  const trackPath = guestToken ? guestOrderPath(order?.id, guestToken) : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${trackPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Bookmark this page instead.");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-[var(--shadow-e1)] sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft">
          <Clock className="h-7 w-7 text-warning" aria-hidden />
        </div>
        <h1 className="text-xl font-bold text-foreground">Order placed</h1>
        <p className="mt-2 text-body">
          Your items are reserved and their prices are locked. An admin is reviewing your
          payment proof, usually within 2 to 3 hours.
        </p>

        <dl className="mt-6 space-y-2 rounded-xl bg-surface-sunken p-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Order</dt>
            <dd className="tnum truncate font-medium text-foreground">
              #{order?.id?.slice(-8).toUpperCase()}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Total</dt>
            <dd className="tnum font-medium text-foreground">
              PKR {formatAmount(order?.total)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Collection</dt>
            <dd className="font-medium text-foreground">
              {isDelivery ? "Delivery" : "Pickup from merchant"}
            </dd>
          </div>
        </dl>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary-soft p-3 text-left text-xs text-body">
          <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          {isDelivery
            ? "Once your payment is approved, the merchant prepares your order for delivery."
            : "Once your payment is approved, a rotating pickup code appears on your order. Show it at the store to collect."}
        </p>

        {trackPath ? (
          <div className="mt-6 rounded-xl border border-border p-4 text-left">
            <p className="text-sm font-semibold text-foreground">Save your tracking link</p>
            <p className="mt-1 text-xs text-body">
              You checked out as a guest, so this link is how you follow the order and
              get your pickup code. We have saved it on this device too.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                to={trackPath}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-[var(--dur-fast)] hover:bg-accent"
              >
                Track this order
              </Link>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-surface-sunken"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Registering later with the same email pulls this order into your account.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard/orders"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-colors duration-[var(--dur-fast)] hover:bg-accent"
            >
              View my orders
            </Link>
            <Link
              to="/#shop"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-border-strong px-6 font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-surface-sunken"
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
