import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatAmount } from "@/lib/money";
import { getGuestOrders, guestOrderPath } from "@/lib/guestOrders";

/**
 * Orders placed as a guest on this device.
 *
 * A guest has no account, so there is no server-side list to fetch: these come
 * from the tracking links saved at checkout. That makes the list device-local,
 * which the page says plainly rather than pretending otherwise.
 */
export function GuestOrdersPage() {
  // Read on the first render, not in an effect. These come straight out of
  // localStorage with nothing to wait for, so deferring it only bought a frame
  // of "no orders saved on this device" before the real list replaced it.
  const [orders] = useState(getGuestOrders);

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
          Your orders
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Orders you placed as a guest on this device. Each one opens with the tracking
          link saved at checkout.
        </p>

        {orders.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={Package}
            title="No orders saved on this device"
            description="Guest tracking links are kept per device. Open the link from your confirmation, or sign in if you placed the order with an account."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/#shop"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
                >
                  Browse the shop
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border-strong px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
                >
                  Sign in
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {orders.map((order) => (
                <li key={order.orderId}>
                  <Link
                    to={guestOrderPath(order.orderId, order.token)}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-sunken"
                  >
                    <div className="min-w-0">
                      <p className="tnum font-semibold text-foreground">
                        #{order.orderId?.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">
                        {order.placedAt
                          ? new Date(order.placedAt).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })
                          : "Saved on this device"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {order.total != null && (
                        <span className="tnum text-sm font-semibold text-foreground">
                          PKR {formatAmount(order.total)}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-center text-sm text-muted">
              Want these on every device?{" "}
              <Link to="/auth" className="font-medium text-primary hover:underline">
                Create an account
              </Link>{" "}
              with the same email and they join it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
