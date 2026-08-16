import { Search } from "lucide-react";

export function SearchBar({ value, onChange, placeholder = "Search products…" }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[44px] rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation sm:text-sm"
        aria-label="Search products"
      />
    </div>
  );
}
