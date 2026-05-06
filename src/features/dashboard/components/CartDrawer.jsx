import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Upload, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";
import {
  getUom,
  formatUomSuffix,
  formatQuantity,
} from "@/features/dashboard/data/uomData";

export function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrdersStore((s) => s.addOrder);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const fileInputRef = useRef(null);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentFile(file);
    setPaymentPreview(URL.createObjectURL(file));
  };

  const handleCheckout = async () => {
    if (items.length === 0 || isPlacing) return;
    if (!paymentFile) {
      toast.error("Please upload your proof of payment before placing the order.");
      return;
    }
    setIsPlacing(true);
    try {
      const order = await addOrder(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentFile
      );
      setLastOrder(order);
      clearCart();
      setPaymentFile(null);
      setPaymentPreview(null);
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
    setPaymentFile(null);
    setPaymentPreview(null);
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
            <div className="text-center py-6 px-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-2xl">⏳</span>
              </div>
              <h3 className="font-semibold text-slate-900">Order submitted!</h3>
              <p className="mt-2 text-sm text-slate-600">
                Your payment proof is under review. We'll notify you once it's verified (usually within 2–3 hours). Your price is locked in.
              </p>
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
              {items.map((item) => {
                const uomDef = getUom(item.uom);
                const isBundle = item.uom === "bundle";
                const innerUom = isBundle && item.bundleUom ? getUom(item.bundleUom) : null;
                const priceSuffix = formatUomSuffix(item);
                return (
                  <li key={item.productId} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <img
                      src={item.image}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
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
                      <p className="text-sm text-slate-600">
                        PKR {Number(item.price).toFixed(2)}
                        {priceSuffix && (
                          <span className="text-xs text-slate-500"> {priceSuffix}</span>
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
                          className="min-h-[44px] w-20 rounded border border-slate-200 px-2 py-2 text-base touch-manipulation"
                        />
                        <span className="text-xs text-slate-500">
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
        {!checkingOut && items.length > 0 && (
          <div className="border-t border-slate-200 p-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
            <p className="flex justify-between text-sm font-semibold text-slate-900">
              <span>Total</span>
              <span>PKR {totalAmount.toFixed(2)}</span>
            </p>
            {/* Payment proof upload */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Proof of payment <span className="text-red-500">*</span></p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {paymentPreview ? (
                <div className="relative">
                  <img
                    src={paymentPreview}
                    alt="Payment proof preview"
                    className="w-full max-h-36 object-contain rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => { setPaymentFile(null); setPaymentPreview(null); fileInputRef.current.value = ""; }}
                    className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow text-slate-500 hover:text-red-600"
                    aria-label="Remove proof"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload screenshot
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPlacing || !paymentFile}
              className="w-full min-h-[52px] rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all disabled:opacity-50"
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
