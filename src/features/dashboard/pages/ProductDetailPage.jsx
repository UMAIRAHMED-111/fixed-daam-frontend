import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, X, Package } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  getUom,
  formatUomSuffix,
  formatQuantity,
} from "../data/uomData";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inventoryProducts = useInventoryStore((s) => s.products);
  const [product, setProduct] = useState(() => inventoryProducts.find((p) => p.id === id) ?? null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [showOrderSuccess, setShowOrderSuccess] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const fileInputRef = useRef(null);

  const addItem = useCartStore((s) => s.addItem);
  const addOrder = useOrdersStore((s) => s.addOrder);

  // If product not found in local store, fetch it directly from the API
  useEffect(() => {
    if (!product && id) {
      api
        .get(`/v1/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch(() => {});
    }
  }, [id, product]);

  // Helpers (safe to call before product check, but only used after)
  const uomDef = product ? getUom(product.uom) : null;
  const parseQty = () => {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return uomDef?.integer ? Math.floor(n) : Number(n.toFixed(3));
  };

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 gap-3">
        <p className="text-slate-600">Product not found.</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 min-h-[44px] touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to products
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["https://picsum.photos/seed/placeholder/800/600"];
  const isBundle = product.uom === "bundle";
  const innerUom = isBundle && product.bundleUom ? getUom(product.bundleUom) : null;
  const priceSuffix = formatUomSuffix(product);
  const qtyParsed = parseQty();
  const previewTotal = qtyParsed * Number(product.price || 0);
  const goPrev = () => setSlideIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setSlideIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    const qty = parseQty();
    if (qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    addItem(product, qty);
    toast.success("Added to cart");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentFile(file);
    setPaymentPreview(URL.createObjectURL(file));
  };

  const handleBuyNow = async () => {
    if (!paymentFile) {
      toast.error("Please upload your proof of payment before placing the order.");
      return;
    }
    const qty = parseQty();
    if (qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setOrderLoading(true);
    try {
      const order = await addOrder(
        [{ productId: product.id, quantity: qty }],
        paymentFile
      );
      setShowOrderSuccess(order);
      toast.success("Order placed! Your price is locked.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (showOrderSuccess) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <span className="text-3xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Order submitted!</h2>
          <p className="mt-2 text-slate-600">
            Your payment proof is under review. We'll notify you once it's verified (usually within 2–3 days). Your price is locked in.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate("/dashboard/orders")}
              className="min-h-[48px] rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all"
            >
              View my orders
            </button>
            <button
              type="button"
              onClick={() => { setShowOrderSuccess(null); navigate("/dashboard"); }}
              className="min-h-[48px] rounded-2xl border-2 border-slate-200 px-6 font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-4 min-h-[44px] -ml-1 inline-flex items-center gap-2 rounded-lg pl-1 pr-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to products
        </button>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Slideshow */}
          <div className="flex-1">
            <div className="relative aspect-square max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src={images[slideIndex]}
                alt=""
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 p-2 shadow hover:bg-white touch-manipulation"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 text-slate-700" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 p-2 shadow hover:bg-white touch-manipulation"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 text-slate-700" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSlideIndex(i)}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 -m-2 transition-colors touch-manipulation"
                        aria-label={`Go to image ${i + 1}`}
                      >
                        <span className={`h-2 w-2 rounded-full block ${i === slideIndex ? "bg-primary" : "bg-slate-400"}`} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Info + actions */}
          <div className="flex-1 max-w-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-primary">{product.category}</span>
              {isBundle ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  <Package className="h-3 w-3" />
                  {product.bundleLabel?.trim() || "Bundle"}
                </span>
              ) : product.uom && product.uom !== "each" ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Sold per {uomDef.short}
                </span>
              ) : null}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-2 text-slate-600">{product.description}</p>
            <p className="mt-4 text-2xl font-bold text-slate-900">
              PKR {Number(product.price).toFixed(2)}
              {priceSuffix && (
                <span className="ml-1 text-sm font-medium text-slate-500">
                  {priceSuffix}
                </span>
              )}
            </p>
            <p className="mt-1 text-sm text-slate-500">Sold by {product.merchantName ?? "Store"}</p>

            {/* Bundle composition */}
            {isBundle && product.bundleSize && innerUom && (
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                  <Package className="h-4 w-4" />
                  What's in each {product.bundleLabel?.trim() || "bundle"}
                </p>
                <p className="mt-1 text-sm text-violet-700">
                  <strong>{product.bundleSize}</strong> × {innerUom.short}
                  <span className="ml-1 text-violet-600/80">
                    (i.e. {(product.bundleSize).toLocaleString()} {innerUom.short} per {product.bundleLabel?.trim() || "bundle"})
                  </span>
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quantity {!uomDef.integer && <span className="text-xs font-normal text-slate-500">(in {uomDef.short})</span>}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  inputMode={uomDef.integer ? "numeric" : "decimal"}
                  min={uomDef.step}
                  max={product.stock}
                  step={uomDef.step}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n) || n <= 0) {
                      setQuantity(String(uomDef.step));
                      return;
                    }
                    const clamped = Math.min(product.stock, n);
                    setQuantity(uomDef.integer ? String(Math.max(1, Math.floor(clamped))) : String(clamped));
                  }}
                  className="w-28 min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-center text-base focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                />
                <span className="text-sm text-slate-500">
                  {isBundle
                    ? (qtyParsed === 1
                        ? (product.bundleLabel?.trim() || "bundle")
                        : `${product.bundleLabel?.trim() || "bundle"}s`)
                    : (uomDef.value === "each"
                        ? (qtyParsed === 1 ? "unit" : "units")
                        : uomDef.short)}
                  <span className="text-slate-400"> · {Number(product.stock).toLocaleString()} in stock</span>
                </span>
              </div>
              {qtyParsed > 0 && (
                <p className="mt-2 text-sm text-slate-700">
                  {isBundle && product.bundleSize && innerUom ? (
                    <>
                      = {formatQuantity(qtyParsed, product)} ·{" "}
                      <span className="text-slate-500">
                        contains {(qtyParsed * product.bundleSize).toLocaleString()} {innerUom.short} total
                      </span>
                    </>
                  ) : (
                    <>= {formatQuantity(qtyParsed, product)}</>
                  )}
                </p>
              )}
              <p className="mt-2 text-base font-semibold text-slate-900">
                Order total:{" "}
                <span className="text-primary">
                  PKR {previewTotal.toFixed(2)}
                </span>
              </p>
            </div>
            {/* bank account to send payment to . the payment will be sent to fixeddaam admin */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Send payment to:</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-medium">
                  <span>DB</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bank Name: DBBL</p>
                  <p className="text-sm text-slate-600">Account: XXXXXXXXXXXXXXXX</p>
                  <p className="text-sm text-slate-600">Branch: Gulshan</p>
                  <p className="text-sm text-slate-600">Account Name: FixedDaam Ltd.</p>
                  <p className="text-sm text-slate-600">IBAN: PKXXXXXXXXXXXXXXXXXXXXXXXX</p>
                </div>
              </div>
            </div>
            {/* Payment proof */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Proof of payment <span className="text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-slate-500">(required to place order)</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {paymentPreview ? (
                <div className="relative inline-block">
                  <img
                    src={paymentPreview}
                    alt="Payment proof preview"
                    className="max-h-40 max-w-full rounded-xl border border-slate-200 object-contain bg-slate-50"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload payment screenshot
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className="min-h-[52px] flex-1 rounded-2xl border-2 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={orderLoading || !paymentFile}
                className="min-h-[52px] flex-1 rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {orderLoading ? "Placing order…" : "Buy now — lock price"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
