import { useEffect, useState } from "react";
import { LayoutGrid, Store } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { FiltersSidebar } from "../components/FiltersSidebar";
import { ProductGrid } from "../components/ProductGrid";
import { MerchantSectionsView } from "../components/MerchantSectionsView";
import { useInventoryStore } from "@/stores/inventoryStore";

const VIEW_MODES = [
  { id: "grid", label: "Grid", Icon: LayoutGrid },
  { id: "byMerchant", label: "By Merchant", Icon: Store },
];

export function BuyerProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const fetchAllProducts = useInventoryStore((s) => s.fetchAllProducts);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse and lock in prices from merchants
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:max-w-xs">
              <SearchBar value={search} onChange={setSearch} />
            </div>

            {/* View toggle */}
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
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-56">
            <FiltersSidebar
              category={category}
              setCategory={setCategory}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
            />
          </div>

          <div className="min-w-0 flex-1">
            {viewMode === "grid" ? (
              <ProductGrid
                search={search}
                category={category}
                priceMin={priceMin}
                priceMax={priceMax}
              />
            ) : (
              <MerchantSectionsView
                search={search}
                category={category}
                priceMin={priceMin}
                priceMax={priceMax}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
