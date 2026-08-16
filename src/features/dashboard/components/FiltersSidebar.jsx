import { CATEGORIES } from "../data/productsData";

export function FiltersSidebar({
  category,
  setCategory,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
}) {
  return (
    <aside className="space-y-6 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h3 className="text-sm font-semibold text-foreground">Filters</h3>
      <div>
        <label className="block text-xs font-medium text-body mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-body mb-2">
          Price range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Min"
            value={priceMin ?? ""}
            onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : "")}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Max"
            value={priceMax ?? ""}
            onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : "")}
            className="w-full min-h-[44px] rounded-lg border border-border bg-background px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
        </div>
      </div>
    </aside>
  );
}
