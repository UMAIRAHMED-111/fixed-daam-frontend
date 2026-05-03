import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { productFormSchema } from "../schemas/productSchema";
import { CATEGORIES } from "../data/productsData";
import { api } from "@/lib/api";

export function MerchantProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isEdit = id && id !== "new";
  const getProduct = useInventoryStore((s) => s.getProductById);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const product = isEdit ? getProduct(id) : null;

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", description: "", price: 0, category: "", stock: 0 },
  });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (product && user?.id === product.merchantId) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        category: product.category,
        stock: product.stock,
      });
      setImages(product.images ?? []);
    }
  }, [product, user?.id, form]);

  useEffect(() => {
    if (user?.role !== "merchant") {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.role, navigate]);

  if (user?.role !== "merchant") {
    return null;
  }

  if (isEdit && !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-slate-600">Product not found.</p>
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

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateProduct(id, {
          name: data.name,
          description: data.description || "",
          price: data.price,
          category: data.category,
          stock: data.stock,
          images,
        });
        toast.success("Product updated");
      } else {
        await addProduct({
          merchantId: user.id,
          merchantName: user.storeName ?? user.name ?? "My Store",
          name: data.name,
          description: data.description || "",
          price: data.price,
          category: data.category,
          stock: data.stock,
          images,
        });
        toast.success("Product added");
      }
      navigate("/dashboard/inventory", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/dashboard/inventory")}
          className="mb-4 min-h-[44px] -ml-1 inline-flex items-center gap-2 rounded-lg pl-1 pr-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
          Back to inventory
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FormField label="Product name" required error={form.formState.errors.name?.message} id="name">
            <Input placeholder="e.g. Wireless Headphones" {...form.register("name")} />
          </FormField>
          <FormField label="Description" error={form.formState.errors.description?.message} id="description">
            <textarea
              placeholder="Short description"
              rows={3}
              className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition touch-manipulation"
              {...form.register("description")}
            />
          </FormField>
          <FormField label="Category" required error={form.formState.errors.category?.message} id="category">
            <select
              className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              {...form.register("category")}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Price (PKR)" required error={form.formState.errors.price?.message} id="price">
              <Input type="number" step="0.01" min={0} placeholder="0.00" {...form.register("price")} />
            </FormField>
            <FormField label="Stock" required error={form.formState.errors.stock?.message} id="stock">
              <Input type="number" min={0} placeholder="0" {...form.register("stock")} />
            </FormField>
          </div>

          {/* Images */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Images</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 touch-manipulation"
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
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 hover:border-primary hover:text-primary transition-colors"
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
              className="min-h-[48px] flex-1 rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all touch-manipulation disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "Saving…" : isEdit ? "Update product" : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/inventory")}
              className="min-h-[48px] rounded-2xl border-2 border-slate-200 px-6 font-medium text-slate-700 hover:bg-slate-50 transition-all touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
