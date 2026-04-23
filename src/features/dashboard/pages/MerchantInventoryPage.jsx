import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { toast } from "sonner";

export function MerchantInventoryPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const merchantId = user?.id;
  const fetchMerchantProducts = useInventoryStore((s) => s.fetchMerchantProducts);
  const products = useInventoryStore((s) => s.getByMerchant(merchantId));
  const removeProduct = useInventoryStore((s) => s.removeProduct);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (merchantId) {
      fetchMerchantProducts(merchantId);
    }
  }, [merchantId, fetchMerchantProducts]);

  if (user?.role !== "merchant") {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from inventory?`)) return;
    setDeletingId(id);
    try {
      await removeProduct(id);
      toast.success("Product removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            {user?.storeName && (
              <p className="mt-1 text-sm text-slate-600">Store: {user.storeName}</p>
            )}
          </div>
          <Link
            to="/dashboard/inventory/new"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all touch-manipulation"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Add product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">You have no products yet.</p>
            <p className="mt-1 text-sm text-slate-500">Add your first product to start selling.</p>
            <Link
              to="/dashboard/inventory/new"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add product
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-100">
                  <img
                    src={p.images?.[0] ?? "https://picsum.photos/seed/placeholder/400/400"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-medium text-primary">{p.category}</span>
                  <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.description || "—"}</p>
                  <p className="mt-auto pt-3 text-lg font-bold text-slate-900">
                    PKR {Number(p.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">Stock: {p.stock}</p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/dashboard/inventory/${p.id}/edit`}
                      className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="flex min-h-[44px] items-center justify-center rounded-xl border border-red-200 bg-white px-3 text-sm font-medium text-red-600 hover:bg-red-50 touch-manipulation disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
