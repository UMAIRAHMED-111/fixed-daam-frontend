import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { ProductImage } from "@/features/dashboard/components/ProductImage";
import { formatAmount } from "@/lib/money";
import { getUom, formatQuantity } from "@/features/dashboard/data/uomData";

/**
 * Cart drawer.
 *
 * Review and adjust only. Delivery, payment and placing the order happen on the
 * checkout page, so this stays a short list and one clear way forward.
 *
 * Behaves like a dialog: Escape closes it, focus moves inside and stays there,
 * the page behind does not scroll, and focus returns where it came from.
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
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (!open) return undefined;

    returnFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Keep tabbing inside the drawer while it is open.
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const goToCheckout = () => {
    onClose();
    navigate("/checkout?stage=customer");
  };

  const step = (item, direction) => {
    const uom = getUom(item.uom);
    const next = Number((item.quantity + direction * uom.step).toFixed(3));
    updateQuantity(item.productId, next > 0 ? next : 0);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[var(--z-backdrop)] bg-foreground/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="fixed right-0 top-0 z-[var(--z-modal)] flex h-full w-full max-w-md flex-col bg-surface shadow-[var(--shadow-e3)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="flex items-baseline gap-2 text-lg font-bold text-foreground">
            Your cart
            {count > 0 && (
              <span className="tnum text-sm font-medium text-muted">
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-sunken hover:text-foreground"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-sunken">
                <ShoppingBag className="h-6 w-6 text-muted" aria-hidden />
              </div>
              <p className="font-semibold text-foreground">Nothing held yet</p>
              <p className="mt-1.5 max-w-[32ch] text-sm text-body">
                Add something from a shop and its price stops moving the moment you
                check out.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border-strong px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
              >
                Browse the shop
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const uom = getUom(item.uom);
                return (
                  <li key={item.productId} className="flex gap-3 py-4 first:pt-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-sunken">
                      <ProductImage
                        product={item}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                        emojiSize="text-2xl"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {formatQuantity(item.quantity, item)}
                            {item.merchantName && ` · ${item.merchantName}`}
                          </p>
                        </div>
                        <p className="tnum shrink-0 text-sm font-semibold text-foreground">
                          PKR {formatAmount(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-lg border border-border">
                          <button
                            type="button"
                            onClick={() => step(item, -1)}
                            className="flex h-9 w-9 items-center justify-center rounded-l-lg text-body transition-colors hover:bg-surface-sunken"
                            aria-label={`Less ${item.name}`}
                          >
                            <Minus className="h-4 w-4" aria-hidden />
                          </button>
                          <span className="tnum min-w-[3rem] px-1 text-center text-sm font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => step(item, 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-r-lg text-body transition-colors hover:bg-surface-sunken"
                            aria-label={`More ${item.name}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <p className="sr-only-text">
                        Quantity steps by {uom.step} {uom.short}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="space-y-3 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="tnum flex items-baseline justify-between text-base font-bold text-foreground">
              <span>Subtotal</span>
              <span>PKR {formatAmount(subtotal)}</span>
            </p>
            <p className="text-xs text-muted">
              Delivery and payment are handled at checkout. Your price is held from the
              moment it is approved.
            </p>
            <button
              type="button"
              onClick={goToCheckout}
              className="min-h-[52px] w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors duration-[var(--dur-fast)] hover:bg-accent"
            >
              Check out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] w-full text-sm font-medium text-body transition-colors hover:text-foreground"
            >
              Keep shopping
            </button>
          </footer>
        )}
      </div>
    </>
  );
}
