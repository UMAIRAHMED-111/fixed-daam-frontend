import { useState } from "react";
import { ChevronDown, Lock, ShoppingBag } from "lucide-react";
import { ProductImage } from "@/features/dashboard/components/ProductImage";
import { formatQuantity, formatTenor } from "@/features/dashboard/data/uomData";
import { formatAmount, formatPkr } from "@/lib/money";

/**
 * Order summary panel, sticky beside the form on desktop, collapsible bar on mobile.
 *
 * Delivery is included in every purchase, so the total is the goods and nothing
 * else. The delivery line stays visible to make that plain rather than silent.
 *
 * @param {Object} props
 * @param {Array} props.items - Cart items
 */
export function OrderSummary({ items }) {
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const lines = (
    <>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.productId} className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-surface-sunken">
                <ProductImage
                  product={item}
                  alt=""
                  className="h-full w-full object-cover"
                  emojiSize="text-2xl"
                />
              </div>
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-bold text-white">
                {item.quantity > 99 ? "99+" : item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              {item.merchantName && (
                <p className="truncate text-xs text-muted">{item.merchantName}</p>
              )}
              <p className="mt-0.5 text-xs text-muted">
                {formatQuantity(item.quantity, item)}
              </p>
              {formatTenor(item) && (
                <p className="mt-0.5 text-xs text-muted">
                  Valid {formatTenor(item)} after purchase
                </p>
              )}
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {formatPkr(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <p className="flex justify-between text-body">
          <span>Subtotal</span>
          <span>{formatPkr(subtotal)}</span>
        </p>
        <p className="flex justify-between text-body">
          <span>Delivery</span>
          <span className="font-medium text-success">Included</span>
        </p>
        <p className="flex items-baseline justify-between border-t border-border pt-3 text-base font-bold text-foreground">
          <span>Total</span>
          <span>
            <span className="mr-1 text-xs font-medium text-muted">PKR</span>
            {formatAmount(total)}
          </span>
        </p>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-body">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        These prices are locked at today&apos;s rate. Collect whenever you&apos;re ready
        and the price won&apos;t move.
      </p>
    </>
  );

  return (
    <>
      {/* Mobile: collapsible summary bar */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpenOnMobile((o) => !o)}
          aria-expanded={openOnMobile}
          className="flex w-full min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 text-left shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            <ShoppingBag className="h-4 w-4" aria-hidden />
            {openOnMobile ? "Hide order summary" : "Show order summary"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${openOnMobile ? "rotate-180" : ""}`}
              aria-hidden
            />
          </span>
          <span className="text-base font-bold text-foreground">{formatPkr(total)}</span>
        </button>
        {openOnMobile && (
          <div className="mt-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            {lines}
          </div>
        )}
      </div>

      {/* Desktop: sticky panel */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-4 flex items-center justify-between text-sm font-semibold text-foreground">
            Order summary
            <span className="text-xs font-medium text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>
          {lines}
        </div>
      </aside>
    </>
  );
}
