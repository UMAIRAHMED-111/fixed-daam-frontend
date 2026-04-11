import { useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { useInventoryStore } from "@/stores/inventoryStore";

export function ProductGrid({ search, category, priceMin, priceMax }) {
  const allProducts = useInventoryStore((s) => s.products);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    const q = (search ?? "").toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    if (priceMin != null && priceMin !== "") {
      list = list.filter((p) => p.price >= Number(priceMin));
    }
    if (priceMax != null && priceMax !== "") {
      list = list.filter((p) => p.price <= Number(priceMax));
    }
    return list;
  }, [search, category, priceMin, priceMax, allProducts]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
