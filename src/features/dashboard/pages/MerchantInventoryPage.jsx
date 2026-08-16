import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, PackageSearch, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/StatusBadge";
import { PANEL_CLASS } from "@/lib/styles";
import { formatAmount } from "@/lib/money";
import { ProductImage } from "../components/ProductImage";
import { SearchBar } from "../components/SearchBar";
import { formatTenor, formatUomSuffix } from "../data/uomData";

/** Stock below this many units gets flagged so the merchant can restock in time. */
const LOW_STOCK = 10;

/** Stock cell: available count, reserved hold, and a low-stock flag. */
function StockCell({ product }) {
  const stock = Number(product.stock ?? 0);
  const reserved = Number(product.reserved ?? 0);

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <p className="tnum text-sm font-semibold text-foreground">
        {stock.toLocaleString()}
        <span className="ml-1 text-xs font-normal text-muted">available</span>
      </p>
      {reserved > 0 && (
        <Badge tone="warning" size="sm">
          {reserved} reserved
        </Badge>
      )}
      {stock <= 0 ? (
        <Badge tone="danger" size="sm">
          Out of stock
        </Badge>
      ) : (
        stock <= LOW_STOCK && (
          <Badge tone="warning" size="sm">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            Low
          </Badge>
        )
      )}
    </div>
  );
}

export function MerchantInventoryPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const merchantId = user?.id;
  const fetchMerchantProducts = useInventoryStore((s) => s.fetchMerchantProducts);
  const products = useInventoryStore((s) => s.getByMerchant(merchantId));
  const loading = useInventoryStore((s) => s.loading);
  const removeProduct = useInventoryStore((s) => s.removeProduct);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (merchantId) {
      fetchMerchantProducts(merchantId);
    }
  }, [merchantId, fetchMerchantProducts]);

  useEffect(() => {
    if (user?.role !== "merchant") {
      navigate("/dashboard", { replace: true });
    }
  }, [user?.role, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.category, p.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [products, search]);

  const totals = useMemo(
    () => ({
      items: products.length,
      units: products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0),
      reserved: products.reduce((sum, p) => sum + Number(p.reserved ?? 0), 0),
    }),
    [products]
  );

  if (user?.role !== "merchant") {
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

  const addButton = (
    <Link
      to="/dashboard/inventory/new"
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-accent active:translate-y-px"
    >
      <Plus className="h-4 w-4" aria-hidden />
      Add product
    </Link>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageHeader
          title="Inventory"
          description={
            totals.items > 0
              ? `${totals.items} ${totals.items === 1 ? "product" : "products"} · ${totals.units.toLocaleString()} units available${
                  totals.reserved > 0 ? ` · ${totals.reserved} reserved for locked orders` : ""
                }`
              : user?.storeName
                ? `Store: ${user.storeName}`
                : undefined
          }
          actions={addButton}
        />

        {products.length > 3 && (
          <div className="mb-4 max-w-sm">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search your products…"
            />
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className={`${PANEL_CLASS} divide-y divide-border overflow-hidden`}>
            <SkeletonRows count={5} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products yet"
            description="Add what you sell, set today's price, and buyers can lock it in. You keep the stock until they collect."
            action={addButton}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={`Nothing matches “${search}”`}
            description="Try a different product name or category."
          />
        ) : (
          <div className={`${PANEL_CLASS} overflow-hidden`}>
            {/* Column headers, desktop only; the rows stay readable stacked on mobile. */}
            <div className="hidden grid-cols-[minmax(0,1fr)_9rem_9rem_7rem] gap-4 border-b border-border bg-surface-sunken px-4 py-2.5 text-2xs font-semibold uppercase tracking-wide text-muted sm:grid">
              <span>Product</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
              <span className="text-right">Actions</span>
            </div>

            <ul className="divide-y divide-border">
              {filtered.map((p) => {
                const suffix = formatUomSuffix(p).replace(/^\//, "");
                const tenor = formatTenor(p);
                return (
                  <li
                    key={p.id}
                    className="grid grid-cols-1 gap-3 px-4 py-3 transition-colors duration-[var(--dur-fast)] hover:bg-surface-sunken sm:grid-cols-[minmax(0,1fr)_9rem_9rem_7rem] sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sunken">
                        <ProductImage
                          product={p}
                          alt=""
                          className="h-full w-full object-cover"
                          emojiSize="text-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {p.category}
                          {suffix && ` · per ${suffix}`}
                          {tenor && ` · valid ${tenor}`}
                          {p.isActive === false && " · hidden from buyers"}
                        </p>
                      </div>
                    </div>

                    <p className="tnum text-sm font-semibold text-foreground sm:text-right">
                      <span className="mr-1 text-xs font-normal text-muted sm:hidden">
                        Price
                      </span>
                      PKR {formatAmount(p.price)}
                    </p>

                    <div className="sm:justify-self-end">
                      <StockCell product={p} />
                    </div>

                    <div className="flex items-center gap-1 sm:justify-end">
                      <Link
                        to={`/dashboard/inventory/${p.id}/edit`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-body transition-colors duration-[var(--dur-fast)] hover:bg-surface hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        <span className="sm:sr-only lg:not-sr-only">Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="inline-flex min-h-[40px] w-10 items-center justify-center rounded-lg text-muted transition-colors duration-[var(--dur-fast)] hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                        aria-label={`Remove ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
