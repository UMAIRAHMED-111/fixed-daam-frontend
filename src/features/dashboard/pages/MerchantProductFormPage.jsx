import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X, Package, CalendarClock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Skeleton, SkeletonForm } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { productFormSchema } from "../schemas/productSchema";
import { CATEGORIES } from "../data/productsData";
import {
  UOM_OPTIONS,
  BUNDLE_BASE_UOM_OPTIONS,
  TENOR_UNIT_OPTIONS,
  formatTenor,
  getUom,
} from "../data/uomData";
import { api } from "@/lib/api";

export function MerchantProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isEdit = id && id !== "new";
  // Subscribe to the list itself, not to the getter: selecting the getter never
  // changes identity, so the page would not re-render when a fetch lands and the
  // form would sit empty on a cold load.
  const products = useInventoryStore((s) => s.products);
  const hasLoaded = useInventoryStore((s) => s.hasLoaded);
  const fetchMerchantProducts = useInventoryStore((s) => s.fetchMerchantProducts);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const product = isEdit ? products.find((p) => p.id === id) : null;

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      uom: "each",
      stock: 0,
      bundleSize: "",
      bundleUom: "",
      bundleLabel: "",
      tenorValue: "",
      tenorUnit: "",
    },
  });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const uom = form.watch("uom");
  const uomDef = getUom(uom);
  const isBundle = uom === "bundle";
  const bundleSize = form.watch("bundleSize");
  const bundleUom = form.watch("bundleUom");
  const bundleLabel = form.watch("bundleLabel");
  const tenorValue = form.watch("tenorValue");
  const tenorUnit = form.watch("tenorUnit");
  const tenorPreview = formatTenor({ tenorValue, tenorUnit });
  const reserved = Number(product?.reserved ?? 0);
  const stockInput = Number(form.watch("stock") ?? 0);

  useEffect(() => {
    if (product && user?.id === product.merchantId) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        category: product.category,
        uom: product.uom ?? "each",
        stock: product.stock,
        bundleSize: product.bundleSize ?? "",
        bundleUom: product.bundleUom ?? "",
        bundleLabel: product.bundleLabel ?? "",
        tenorValue: product.tenorValue ?? "",
        tenorUnit: product.tenorUnit ?? "",
      });
      setImages(product.images ?? []);
    }
  }, [product, user?.id, form]);

  useEffect(() => {
    if (user?.role !== "merchant") {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.role, navigate]);

  // Landing straight on the edit URL (a bookmark, or a refresh) arrives with an
  // empty store, so pull the inventory in rather than claiming the product is gone.
  useEffect(() => {
    if (isEdit && !product && !hasLoaded && user?.id) {
      fetchMerchantProducts(user.id);
    }
  }, [isEdit, product, hasLoaded, user?.id, fetchMerchantProducts]);

  if (user?.role !== "merchant") {
    return null;
  }

  if (isEdit && !product) {
    // Still fetching: show the shape of the form, not a verdict on the product.
    if (!hasLoaded) {
      return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
          <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
            <Skeleton className="mb-4 h-11 w-40 rounded-lg" />
            <Skeleton className="h-8 w-48" />
            <SkeletonForm className="mt-6" fields={6} label="Loading product" />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-body">Product not found.</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/inventory")}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 min-h-[44px] touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to inventory
        </button>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/v1/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, res.data.url]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // Display helpers driven by UOM
  const priceUnitLabel = isBundle
    ? `Price per ${bundleLabel?.trim() || "bundle"}`
    : `Price per ${uomDef.short}`;
  const stockLabel = isBundle
    ? `Stock (${bundleLabel?.trim() || "bundles"})`
    : `Stock (in ${uomDef.short})`;
  const stockPlaceholder = uomDef.integer ? "0" : "0.00";
  const innerUomDef = bundleUom ? getUom(bundleUom) : null;

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      description: data.description || "",
      price: Number(data.price),
      category: data.category,
      uom: data.uom,
      stock: Number(data.stock),
      bundleSize:
        data.uom === "bundle" && data.bundleSize !== ""
          ? Number(data.bundleSize)
          : null,
      bundleUom: data.uom === "bundle" ? data.bundleUom || null : null,
      bundleLabel: data.uom === "bundle" ? data.bundleLabel?.trim() || "" : "",
      // Blank tenor means the purchase never expires; the pair travels together
      // so half-filled input clears both rather than storing a dangling number.
      tenorValue:
        data.tenorValue !== "" && data.tenorUnit ? Number(data.tenorValue) : null,
      tenorUnit:
        data.tenorValue !== "" && data.tenorUnit ? data.tenorUnit : null,
      images,
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
        toast.success("Product updated");
      } else {
        await addProduct({
          ...payload,
          merchantId: user.id,
          merchantName: user.storeName ?? user.name ?? "My Store",
        });
        toast.success("Product added");
      }
      navigate("/dashboard/inventory", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard/inventory")}
          className="mb-4 min-h-[44px] -ml-1 inline-flex items-center gap-2 rounded-lg pl-1 pr-3 py-2.5 text-sm font-medium text-body hover:bg-surface-sunken hover:text-foreground touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to inventory
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <FormField
            label="Product name"
            required
            error={form.formState.errors.name?.message}
            id="name"
          >
            <Input
              placeholder="e.g. Wireless Headphones"
              {...form.register("name")}
            />
          </FormField>

          <FormField
            label="Description"
            error={form.formState.errors.description?.message}
            id="description"
          >
            <textarea
              placeholder="Short description"
              rows={3}
              className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition touch-manipulation"
              {...form.register("description")}
            />
          </FormField>

          <FormField
            label="Category"
            required
            error={form.formState.errors.category?.message}
            id="category"
          >
            <select
              className="w-full min-h-[44px] rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              {...form.register("category")}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          {/* Unit of measure */}
          <FormField
            label="Unit of measure"
            required
            error={form.formState.errors.uom?.message}
            id="uom"
          >
            <select
              className="w-full min-h-[44px] rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              {...form.register("uom")}
            >
              {UOM_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              How customers buy this, by piece, by weight, or as a bundle.
            </p>
          </FormField>

          {/* Bundle-only fields */}
          {isBundle && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                <Package className="h-4 w-4" />
                Bundle details
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Bundle size"
                  required
                  error={form.formState.errors.bundleSize?.message}
                  id="bundleSize"
                >
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="e.g. 12"
                    {...form.register("bundleSize")}
                  />
                </FormField>

                <FormField
                  label="What's inside"
                  required
                  error={form.formState.errors.bundleUom?.message}
                  id="bundleUom"
                >
                  <select
                    className="w-full min-h-[44px] rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                    {...form.register("bundleUom")}
                  >
                    <option value="">Select base unit</option>
                    {BUNDLE_BASE_UOM_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField
                label="Bundle label"
                error={form.formState.errors.bundleLabel?.message}
                id="bundleLabel"
              >
                <Input
                  placeholder="e.g. case, sack, carton, pack"
                  {...form.register("bundleLabel")}
                />
                <p className="mt-1.5 text-xs text-muted">
                  Shown to buyers. Defaults to "bundle" if left blank.
                </p>
              </FormField>

              {bundleSize && innerUomDef && (
                <div className="rounded-lg bg-surface border border-violet-200 px-3 py-2 text-xs text-violet-800">
                  Each {bundleLabel?.trim() || "bundle"} contains{" "}
                  <strong>
                    {bundleSize} × {innerUomDef.short}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Tenor: how long the buyer's purchase stays valid after they order.
              Optional, because plenty of goods simply don't expire. */}
          <div className="rounded-xl border border-border bg-surface-sunken/60 p-4 space-y-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                Validity after purchase
              </p>
              <p className="mt-1 text-xs text-muted">
                How long a buyer has to take delivery once they&apos;ve paid. Shown on
                the product page and on their order. Leave blank for no time limit.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Valid for"
                error={form.formState.errors.tenorValue?.message}
                id="tenorValue"
              >
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 6"
                  {...form.register("tenorValue")}
                />
              </FormField>

              <FormField
                label="Unit"
                error={form.formState.errors.tenorUnit?.message}
                id="tenorUnit"
              >
                <select
                  className="w-full min-h-[44px] rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                  {...form.register("tenorUnit")}
                >
                  <option value="">No time limit</option>
                  {TENOR_UNIT_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {tenorPreview && (
              <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-body">
                Buyers see: <strong>Valid {tenorPreview} after purchase</strong>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={`${priceUnitLabel} (PKR)`}
              required
              error={form.formState.errors.price?.message}
              id="price"
            >
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                {...form.register("price")}
              />
            </FormField>
            <FormField
              label={stockLabel}
              required
              error={form.formState.errors.stock?.message}
              id="stock"
            >
              <Input
                type="number"
                min={0}
                step={uomDef.step}
                placeholder={stockPlaceholder}
                {...form.register("stock")}
              />
              {isEdit && reserved > 0 && (
                <p
                  className={`mt-1.5 text-xs ${
                    stockInput < 0 ? "text-red-600" : "text-amber-700"
                  }`}
                >
                  <strong>{reserved}</strong> {uomDef.short} currently reserved by
                  in-flight orders. The number above is what's available to sell now -
                  reserved units are tracked separately and won't be affected by edits here.
                </p>
              )}
            </FormField>
          </div>

          {/* Images */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-body">Images</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-body hover:bg-background hover:border-border-strong transition-colors disabled:opacity-50 touch-manipulation"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                {uploading ? "Uploading…" : "Upload from device"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((url, i) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-sunken"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 touch-manipulation"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-8 text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-6 w-6" aria-hidden />
                <p className="text-sm">Click to upload images</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={form.formState.isSubmitting || uploading}
              className="min-h-[48px] flex-1 rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-accent transition-all touch-manipulation disabled:opacity-50"
            >
              {form.formState.isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Update product"
                  : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/inventory")}
              className="min-h-[48px] rounded-2xl border-2 border-border px-6 font-medium text-body hover:bg-background transition-all touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
