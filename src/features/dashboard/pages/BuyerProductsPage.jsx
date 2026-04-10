import { useEffect, useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { FiltersSidebar } from "../components/FiltersSidebar";
import { ProductGrid } from "../components/ProductGrid";
import { useInventoryStore } from "@/stores/inventoryStore";

export function BuyerProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const fetchAllProducts = useInventoryStore((s) => s.fetchAllProducts);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <div className="w-full sm:max-w-xs">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
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
            <ProductGrid
              search={search}
              category={category}
              priceMin={priceMin}
              priceMax={priceMax}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
