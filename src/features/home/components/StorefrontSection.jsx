import { useEffect, useState } from "react";
import { LayoutGrid, Store } from "lucide-react";
import { SearchBar } from "@/features/dashboard/components/SearchBar";
import { ProductGrid } from "@/features/dashboard/components/ProductGrid";
import { MerchantSectionsView } from "@/features/dashboard/components/MerchantSectionsView";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Loader } from "@/components/ui/Loader";

const VIEW_MODES = [
  { id: "byMerchant", label: "By merchant", Icon: Store },
  { id: "grid", label: "All products", Icon: LayoutGrid },
];

/**
 * Public storefront on the landing page — anyone can browse merchants and their
 * products without signing in. Sign-in is only required at checkout.
 */
export function StorefrontSection() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("byMerchant");

  const products = useInventoryStore((s) => s.products);
  const loading = useInventoryStore((s) => s.loading);
  const fetchAllProducts = useInventoryStore((s) => s.fetchAllProducts);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <section id="shop" className="scroll-mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Shop
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Browse our merchants
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Lock today&apos;s price on anything below. Browse freely — you only need an
              account when you check out.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:max-w-xs">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="flex shrink-0 gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {VIEW_MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => setViewMode(id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all touch-manipulation ${
                    viewMode === id
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="font-medium text-slate-700">No products listed yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Merchants are still stocking their shelves — check back soon.
            </p>
          </div>
        ) : viewMode === "byMerchant" ? (
          <MerchantSectionsView search={search} />
        ) : (
          <ProductGrid search={search} />
        )}
      </div>
    </section>
  );
}
