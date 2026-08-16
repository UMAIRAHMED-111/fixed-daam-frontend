import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package, Lock } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  getUom,
  formatUomSuffix,
  formatQuantity,
} from "../data/uomData";
import { pickStockImage } from "../data/categoryImages";
import { ProductImage } from "../components/ProductImage";
import { Badge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatAmount } from "@/lib/money";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const inventoryProducts = useInventoryStore((s) => s.products);
  const [product, setProduct] = useState(() => inventoryProducts.find((p) => p.id === id) ?? null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [quantity, setQuantity] = useState("1");

  const addItem = useCartStore((s) => s.addItem);

  // Signed-out shoppers browse from the landing page; signed-in ones from the dashboard.
  const backTo = isAuthenticated ? "/dashboard" : "/";

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
        <p className="text-body">Product not found.</p>
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 min-h-[44px] touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to products
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [pickStockImage(product)];
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

  /** Straight to checkout with just this item, delivery and payment live there. */
  const handleBuyNow = () => {
    const qty = parseQty();
    if (qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    addItem(product, qty);
    navigate("/checkout?stage=customer");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="mb-4 min-h-[44px] -ml-1 inline-flex items-center gap-2 rounded-lg pl-1 pr-3 py-2.5 text-sm font-medium text-body hover:bg-surface-sunken hover:text-foreground touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to products
        </button>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Slideshow */}
          <div className="flex-1">
            <div className="relative aspect-square max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              {product.images?.length ? (
                <img
                  src={images[slideIndex]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProductImage
                  product={product}
                  alt=""
                  className="h-full w-full object-cover"
                  emojiSize="text-8xl"
                />
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/90 p-2 shadow hover:bg-surface touch-manipulation"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 text-body" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/90 p-2 shadow hover:bg-surface touch-manipulation"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 text-body" />
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
                        <span className={`h-2 w-2 rounded-full block ${i === slideIndex ? "bg-primary" : "bg-border-strong"}`} />
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
              <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
                {product.category}
              </span>
              {isBundle ? (
                <Badge tone="brand" size="sm">
                  <Package className="h-3 w-3" aria-hidden />
                  {product.bundleLabel?.trim() || "Bundle"}
                </Badge>
              ) : product.uom && product.uom !== "each" ? (
                <Badge tone="neutral" size="sm">Sold per {uomDef.short}</Badge>
              ) : null}
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.025em] text-foreground sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Sold by <span className="font-medium text-body">{product.merchantName ?? "Store"}</span>
            </p>
            {product.description && (
              <p className="mt-4 max-w-[60ch] leading-relaxed text-body">{product.description}</p>
            )}

            {/* Price is the content on this page, give it the weight. */}
            <div className="mt-6 border-y border-border py-5">
              <p className="tnum text-4xl font-extrabold leading-none tracking-[-0.03em] text-foreground">
                <span className="mr-1.5 align-top text-base font-bold text-muted">PKR</span>
                {formatAmount(product.price)}
              </p>
              {priceSuffix && (
                <p className="mt-2 text-sm text-muted">
                  per {priceSuffix.replace(/^\//, "")}
                </p>
              )}
              <p className="mt-3 flex items-start gap-2 text-sm text-body">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                This price is locked the moment you check out, collect whenever
                you&apos;re ready, in as many visits as you like.
              </p>
            </div>

            {/* Bundle composition */}
            {isBundle && product.bundleSize && innerUom && (
              <div className="mt-5 rounded-xl bg-primary-soft px-4 py-3 ring-1 ring-inset ring-primary/15">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary-ink">
                  <Package className="h-4 w-4" aria-hidden />
                  What&apos;s in each {product.bundleLabel?.trim() || "bundle"}
                </p>
                <p className="tnum mt-1 text-sm text-body">
                  {product.bundleSize.toLocaleString()} × {innerUom.short} per{" "}
                  {product.bundleLabel?.trim() || "bundle"}
                </p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-body mb-1.5">
                Quantity {!uomDef.integer && <span className="text-xs font-normal text-muted">(in {uomDef.short})</span>}
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
                  className="w-28 min-h-[44px] rounded-lg border border-border px-3 py-2 text-center text-base focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                />
                <span className="text-sm text-muted">
                  {isBundle
                    ? (qtyParsed === 1
                        ? (product.bundleLabel?.trim() || "bundle")
                        : `${product.bundleLabel?.trim() || "bundle"}s`)
                    : (uomDef.value === "each"
                        ? (qtyParsed === 1 ? "unit" : "units")
                        : uomDef.short)}
                  <span className="text-muted"> · {Number(product.stock).toLocaleString()} in stock</span>
                </span>
              </div>
              {qtyParsed > 0 && (
                <p className="mt-2 text-sm text-body">
                  {isBundle && product.bundleSize && innerUom ? (
                    <>
                      = {formatQuantity(qtyParsed, product)} ·{" "}
                      <span className="text-muted">
                        contains {(qtyParsed * product.bundleSize).toLocaleString()} {innerUom.short} total
                      </span>
                    </>
                  ) : (
                    <>= {formatQuantity(qtyParsed, product)}</>
                  )}
                </p>
              )}
              <p className="tnum mt-3 flex items-baseline justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                <span>Order total</span>
                <span className="text-lg">PKR {formatAmount(previewTotal)}</span>
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handleAddToCart}>
                Add to cart
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={Number(product.stock) <= 0}
              >
                {Number(product.stock) > 0 ? "Buy now and lock the price" : "Out of stock"}
              </Button>
            </div>
            <p className="mt-3 text-center text-sm text-muted sm:text-left">
              Delivery and payment are handled at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
