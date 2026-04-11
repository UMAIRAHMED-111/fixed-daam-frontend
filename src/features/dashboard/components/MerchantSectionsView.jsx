import { useMemo } from "react";
import { Store } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useInventoryStore } from "@/stores/inventoryStore";

export function MerchantSectionsView({ search, category, priceMin, priceMax }) {
  const allProducts = useInventoryStore((s) => s.products);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    const q = (search ?? "").toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.merchantName?.toLowerCase().includes(q)
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (priceMin !== "" && priceMin != null)
      list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax !== "" && priceMax != null)
      list = list.filter((p) => p.price <= Number(priceMax));
    return list;
  }, [search, category, priceMin, priceMax, allProducts]);

  const merchantSections = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      const key = p.merchantId ?? p.merchantName ?? "unknown";
      const name = p.merchantName || "Unknown Store";
      if (!groups[key]) groups[key] = { name, products: [] };
      groups[key].products.push(p);
    });
    return Object.values(groups).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filtered]);

  if (merchantSections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-600">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {merchantSections.map((merchant) => (
        <section key={merchant.name} aria-labelledby={`merchant-${merchant.name}`}>
          {/* Merchant header */}
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Store className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <h2
                id={`merchant-${merchant.name}`}
                className="font-bold text-slate-900"
              >
                {merchant.name}
              </h2>
              <p className="text-xs text-slate-500">
                {merchant.products.length}{" "}
                {merchant.products.length === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>

          {/* Products grid */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {merchant.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
