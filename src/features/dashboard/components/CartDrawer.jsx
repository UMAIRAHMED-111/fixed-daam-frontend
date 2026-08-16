import { useNavigate } from "react-router-dom";
import { X, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import {
  getUom,
  formatUomSuffix,
  formatQuantity,
} from "@/features/dashboard/data/uomData";
import { formatAmount } from "@/lib/money";

/**
 * Cart drawer, review and adjust the cart. Delivery, payment and placing the order
 * all happen on the staged checkout page.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 */
export function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const goToCheckout = () => {
    onClose();
    navigate("/checkout?stage=customer");
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-border p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <h2 className="text-lg font-semibold text-foreground">Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted hover:bg-surface-sunken hover:text-body touch-manipulation"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const uomDef = getUom(item.uom);
                const isBundle = item.uom === "bundle";
                const innerUom = isBundle && item.bundleUom ? getUom(item.bundleUom) : null;
                const priceSuffix = formatUomSuffix(item);
                return (
                  <li key={item.productId} className="flex gap-4 rounded-xl border border-border bg-slate-50/50 p-3">
                    <img
                      src={item.image}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      {isBundle && (
                        <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                          <Package className="h-3 w-3" />
                          {item.bundleLabel?.trim() || "Bundle"}
                          {item.bundleSize && innerUom && (
                            <span className="opacity-90">
                              · {item.bundleSize} {innerUom.short}
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-sm text-body">
                        PKR {formatAmount(item.price)}
                        {priceSuffix && (
                          <span className="text-xs text-muted"> {priceSuffix}</span>
                        )}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          inputMode={uomDef.integer ? "numeric" : "decimal"}
                          min={uomDef.step}
                          step={uomDef.step}
                          value={item.quantity}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            if (!Number.isFinite(n)) return;
                            updateQuantity(
                              item.productId,
                              uomDef.integer ? Math.max(0, Math.floor(n)) : Math.max(0, n)
                            );
                          }}
                          className="min-h-[44px] w-20 rounded border border-border px-2 py-2 text-base touch-manipulation"
                        />
                        <span className="text-xs text-muted">
                          {formatQuantity(item.quantity, item)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="min-h-[44px] ml-auto inline-flex items-center rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 hover:underline touch-manipulation"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-border p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="flex justify-between text-sm font-semibold text-foreground">
              <span>Subtotal</span>
              <span>PKR {formatAmount(subtotal)}</span>
            </p>
            <p className="text-xs text-muted">
              Delivery and payment are handled at checkout.
            </p>
            <button
              type="button"
              onClick={goToCheckout}
              className="w-full min-h-[52px] rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-accent transition-all"
            >
              Check out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] text-sm font-medium text-body hover:text-foreground touch-manipulation"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
