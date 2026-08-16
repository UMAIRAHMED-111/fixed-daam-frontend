import { useMemo, useState } from "react";
import { Store } from "lucide-react";
import { SearchBar } from "@/features/dashboard/components/SearchBar";
import { ProductCard } from "@/features/dashboard/components/ProductCard";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInventoryStore } from "@/stores/inventoryStore";

/**
 * The shop. Grouped by merchant, because a buyer collects in person and needs to
 * know whose counter they are walking up to.
 */
export function StorefrontSection() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const products = useInventoryStore((s) => s.products);
  const loading = useInventoryStore((s) => s.loading);

  const categories = useMemo(() => {
    const counts = new Map();
    products.forEach((p) => {
      if (!p.category) return;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [products]);

  const merchants = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return [p.name, p.description, p.category, p.merchantName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q));
    });

    const groups = new Map();
    matched.forEach((p) => {
      const key = p.merchantId ?? p.merchantName ?? "unknown";
      if (!groups.has(key)) {
        groups.set(key, { name: p.merchantName || "Unknown store", products: [] });
      }
      groups.get(key).products.push(p);
    });
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, category]);

  const shown = merchants.reduce((sum, m) => sum + m.products.length, 0);
  const isFiltered = Boolean(search.trim()) || category !== "all";

  const chip = (id, label, count) => (
    <button
      key={id}
      type="button"
      onClick={() => setCategory(id)}
      aria-pressed={category === id}
      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${
        category === id
          ? "border-foreground bg-foreground text-background"
          : "border-border-strong bg-surface text-body hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {label}
      {count != null && (
        <span className={`tnum text-xs ${category === id ? "opacity-70" : "text-muted"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <section id="shop" className="scroll-mt-16 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-display text-[clamp(2.25rem,5vw,3.25rem)] text-foreground">
              The shop
            </h2>
            <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-body">
              Every price here is the price you pay, fixed the moment you check out.
              Browse without an account.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search an item or a shop…"
            />
          </div>
        </div>

        {categories.length > 1 && (
          <div className="mt-7 flex flex-wrap gap-2">
            {chip("all", "Everything", products.length)}
            {categories.map(([name, count]) => chip(name, name, count))}
          </div>
        )}

        {loading && products.length === 0 ? (
          <SkeletonCards className="mt-10" count={6} />
        ) : merchants.length === 0 ? (
          <EmptyState
            className="mt-10"
            icon={Store}
            title={isFiltered ? "Nothing matches that" : "No products listed yet"}
            description={
              isFiltered
                ? "Try another item or shop name, or clear the filter."
                : "Shops are still stocking their shelves. Check back shortly."
            }
            action={
              isFiltered ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-surface-sunken"
                >
                  Show everything
                </button>
              ) : null
            }
          />
        ) : (
          <div className="mt-10 space-y-14">
            {merchants.map((merchant) => (
              <section key={merchant.name} aria-label={merchant.name}>
                <div className="mb-5 flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-2.5">
                  <h3 className="flex items-center gap-2.5 text-xl font-bold tracking-[-0.01em] text-foreground">
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

        {isFiltered && shown > 0 && (
          <p className="tnum mt-8 text-sm text-muted">
            {shown} {shown === 1 ? "item" : "items"} shown.{" "}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="font-medium text-primary hover:underline"
            >
              Show everything
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
