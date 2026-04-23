import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inventoryProducts = useInventoryStore((s) => s.products);
  const [product, setProduct] = useState(() => inventoryProducts.find((p) => p.id === id) ?? null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
  const goPrev = () => setSlideIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setSlideIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
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
    setOrderLoading(true);
    try {
      const order = await addOrder([{ productId: product.id, quantity }], paymentFile);
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
            <span className="text-sm font-medium text-primary">{product.category}</span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-2 text-slate-600">{product.description}</p>
            <p className="mt-4 text-2xl font-bold text-slate-900">PKR {Number(product.price).toFixed(2)}</p>
            <p className="mt-1 text-sm text-slate-500">Sold by {product.merchantName ?? "Store"}</p>
            <div className="mt-6 flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                className="w-20 min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-center text-base focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              />
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
