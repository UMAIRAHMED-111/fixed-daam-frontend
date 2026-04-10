import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { productFormSchema, parseImageUrls } from "../schemas/productSchema";
import { CATEGORIES } from "../data/productsData";

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
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      imageUrls: "",
    },
  });

  useEffect(() => {
    if (product && user?.id === product.merchantId) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrls: (product.images ?? []).join("\n"),
      });
    }
  }, [product, user?.id, form]);

  if (user?.role !== "merchant") {
    navigate("/dashboard", { replace: true });
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

  const onSubmit = async (data) => {
    const images = parseImageUrls(data.imageUrls);
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
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Price ($)" required error={form.formState.errors.price?.message} id="price">
              <Input type="number" step="0.01" min={0} placeholder="0.00" {...form.register("price")} />
            </FormField>
            <FormField label="Stock" required error={form.formState.errors.stock?.message} id="stock">
              <Input type="number" min={0} placeholder="0" {...form.register("stock")} />
            </FormField>
          </div>
          <FormField label="Image URLs (one per line)" error={form.formState.errors.imageUrls?.message} id="imageUrls">
            <textarea
              placeholder="https://example.com/image1.jpg"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition font-mono"
              {...form.register("imageUrls")}
            />
          </FormField>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="min-h-[48px] flex-1 rounded-2xl bg-primary font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all touch-manipulation disabled:opacity-50"
              disabled={form.formState.isSubmitting}
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
