import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, Store, Truck } from "lucide-react";
import { api } from "@/lib/api";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { PickupCode } from "@/features/dashboard/components/OrderCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatAmount } from "@/lib/money";
import { formatQuantity } from "@/features/dashboard/data/uomData";
import { getGuestOrderToken, rememberGuestOrder } from "@/lib/guestOrders";

/** What the buyer should do next, per status. */
const NEXT_STEP = {
  pending_verification:
    "We are checking your payment proof. This usually takes 2 to 3 hours, and your price is already locked.",
  locked:
    "Payment approved and your price is locked. The merchant is preparing your order.",
  ready: "Ready for collection. Show the code below at the store.",
  delivered: "Collected. Thanks for shopping with us.",
  rejected:
    "Your payment could not be verified, so the order was cancelled and the stock released.",
};

/**
 * Guest order tracking. The token in the link (or remembered on this device)
 * stands in for a session and unlocks this one order.
 */
export function GuestOrderPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || getGuestOrderToken(orderId);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      setError("missing");
      return undefined;
    }

    api
      .get(`/v1/orders/guest/${orderId}`, { params: { token } })
      .then((res) => {
        if (cancelled) return;
        setOrder(res.data);
        // Keep the link on this device so they can come back without the URL.
        rememberGuestOrder({
          orderId,
          token,
          total: res.data.total,
          placedAt: res.data.createdAt,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.status === 403 ? "invalid" : "failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  const showCode = order && ["locked", "ready"].includes(order.status);

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {loading ? (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-6 h-24 w-full" />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertTriangle}
            title={
              error === "invalid"
                ? "This tracking link is no longer valid"
                : error === "missing"
                  ? "This link is missing its tracking code"
                  : "We couldn't load that order"
            }
            description="Open the full link from your order confirmation, on the device you ordered from. If you have an account, sign in to see the order there instead."
            action={
              <Link
                to="/#shop"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
              >
                Back to the shop
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                  Your order
                </h1>
                <p className="tnum mt-1 text-sm text-muted">
                  #{order.id?.slice(-8).toUpperCase()} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <StatusBadge status={order.status} audience="buyer" />
            </div>

            <p className="mt-4 rounded-xl bg-surface-sunken px-4 py-3 text-sm text-body">
              {NEXT_STEP[order.status]}
            </p>

            {order.status === "rejected" && order.rejectionNote && (
              <p className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                Reason: {order.rejectionNote}
              </p>
            )}

            {showCode && (
              <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                <PickupCode
                  orderId={order.id}
                  codeUrl={`/v1/orders/guest/${order.id}/pickup-code?token=${encodeURIComponent(token)}`}
                />
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border bg-surface">
              <ul className="divide-y divide-border">
                {order.items?.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {formatQuantity(item.quantity, item)}
                        {item.merchantName && ` · ${item.merchantName}`}
                      </p>
                    </div>
                    <p className="tnum shrink-0 text-sm font-semibold text-foreground">
                      PKR {formatAmount(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4">
                <span className="flex items-center gap-2 text-sm text-body">
                  {order.delivery ? (
                    <>
                      <Truck className="h-4 w-4 text-muted" aria-hidden />
                      Delivery to {order.deliveryAddress}
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4 text-muted" aria-hidden />
                      Collect from the merchant
                    </>
                  )}
                </span>
                <span className="tnum shrink-0 text-base font-bold text-foreground">
                  PKR {formatAmount(order.total)}
                </span>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted">
              Want all your orders in one place?{" "}
              <Link to="/auth" className="font-medium text-primary hover:underline">
                Create an account
              </Link>{" "}
              with this same email and this order joins it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
