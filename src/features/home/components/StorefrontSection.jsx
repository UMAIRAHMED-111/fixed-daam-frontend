import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";
import { SearchBar } from "@/features/dashboard/components/SearchBar";
import { ProductCard } from "@/features/dashboard/components/ProductCard";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInventoryStore } from "@/stores/inventoryStore";

/**
 * Public storefront, browse merchants and their stock without an account.
 * Grouped by merchant, because "who am I collecting from" is the question a
 * buyer actually has before they lock a price.
 */
export function StorefrontSection() {
  const [search, setSearch] = useState("");

  const products = useInventoryStore((s) => s.products);
  const loading = useInventoryStore((s) => s.loading);
  const fetchAllProducts = useInventoryStore((s) => s.fetchAllProducts);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const merchants = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = q
      ? products.filter((p) =>
          [p.name, p.description, p.category, p.merchantName]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(q))
        )
      : products;

    const groups = new Map();
    matched.forEach((p) => {
      const key = p.merchantId ?? p.merchantName ?? "unknown";
      if (!groups.has(key)) {
        groups.set(key, { name: p.merchantName || "Unknown store", products: [] });
      }
      groups.get(key).products.push(p);
    });
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search]);

  const totalShown = merchants.reduce((sum, m) => sum + m.products.length, 0);

  return (
    <section id="shop" className="scroll-mt-16 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-[-0.03em] text-foreground">
              What&apos;s in the market today
            </h2>
            <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-body">
              Every price below is the price you pay, locked the moment you check out.
              No account needed to look around.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search products or stores…"
            />
          </div>
        </div>

        {loading && products.length === 0 ? (
          <SkeletonCards className="mt-10" count={6} />
        ) : merchants.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Store}
            title={search ? `Nothing matches “${search}”` : "No products listed yet"}
            description={
              search
                ? "Try a different product or store name."
                : "Merchants are still stocking their shelves, check back shortly."
            }
          />
        ) : (
          <div className="mt-12 space-y-16">
            {merchants.map((merchant) => (
              <section key={merchant.name} aria-label={merchant.name}>
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.01em] text-foreground">
                    <Store className="h-4 w-4 text-primary" aria-hidden />
                    {merchant.name}
                  </h3>
                  <p className="tnum shrink-0 text-sm text-muted">
                    {merchant.products.length}{" "}
                    {merchant.products.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {merchant.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {search && totalShown > 0 && (
          <p className="tnum mt-8 text-sm text-muted">
            {totalShown} {totalShown === 1 ? "result" : "results"} for “{search}”
          </p>
        )}
      </div>
    </section>
  );
}
