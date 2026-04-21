import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

export function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0 || isPlacing) return;
    setIsPlacing(true);
    try {
      const order = await addOrder(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );
      setLastOrder(order);
      clearCart();
      setCheckingOut(true);
      toast.success("Order placed! Your price is locked.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  const closeAndReset = () => {
    setLastOrder(null);
    setCheckingOut(false);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeAndReset}
        aria-hidden
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <h2 className="text-lg font-semibold text-slate-900">Cart</h2>
          <button
            type="button"
            onClick={closeAndReset}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 touch-manipulation"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          {checkingOut && lastOrder ? (
            <div className="text-center py-6">
              <h3 className="font-semibold text-slate-900">Order confirmed</h3>
              <p className="mt-2 text-sm text-slate-600">Use this QR code to collect your order.</p>
              <div className="mt-4 flex justify-center">
                <QRCodeSVG value={lastOrder.qrValue} size={180} className="rounded-lg border border-slate-200 p-2 bg-white" />
              </div>
              <Link
                to="/dashboard/orders"
                onClick={closeAndReset}
                className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all"
              >
                View orders
              </Link>
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <img
                    src={item.image}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-600">${Number(item.price).toFixed(2)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                        className="min-h-[44px] w-14 rounded border border-slate-200 px-2 py-2 text-base touch-manipulation"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="min-h-[44px] inline-flex items-center rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 hover:underline touch-manipulation"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!checkingOut && items.length > 0 && (
          <div className="border-t border-slate-200 p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p className="flex justify-between text-sm font-semibold text-slate-900">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPlacing}
              className="mt-4 w-full min-h-[52px] rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {isPlacing ? "Placing order…" : "Buy now — lock price"}
            </button>
          </div>
        )}
        {!checkingOut && items.length > 0 && (
          <button
            type="button"
            onClick={closeAndReset}
            className="w-full border-t border-slate-200 p-4 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 min-h-[48px] pb-[max(1rem,env(safe-area-inset-bottom))] touch-manipulation"
          >
            Continue shopping
          </button>
        )}
      </div>
    </>
  );
}
