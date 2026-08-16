import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { formatUomSuffix, getUom } from "../data/uomData";
import { ProductImage } from "./ProductImage";
import { Badge } from "@/components/ui/StatusBadge";
import { formatAmount } from "@/lib/money";
import { useAuthStore } from "@/stores/authStore";

/**
 * ProductCard: photo, name, and the price doing the talking.
 * The price is the content here, so it gets the weight and tabular figures.
 */
export function ProductCard({ product }) {
  const isBundle = product.uom === "bundle";
  const innerUom = isBundle && product.bundleUom ? getUom(product.bundleUom) : null;
  const priceSuffix = formatUomSuffix(product);
  const stock = Number(product.stock ?? 0);

  // Signed-out shoppers browse the public product page; signed-in users stay
  // inside the dashboard shell.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const href = isAuthenticated
    ? `/dashboard/product/${product.id}`
    : `/product/${product.id}`;

  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-[var(--dur)] ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-e2)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-sunken">
        <ProductImage
          product={product}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
        />
        {isBundle && (
          <Badge tone="brand" size="sm" className="absolute left-2.5 top-2.5 bg-surface/95 backdrop-blur">
            {product.bundleLabel?.trim() || "Bundle"}
            {product.bundleSize && innerUom && (
              <span className="font-medium opacity-80">
                {product.bundleSize} × {innerUom.short}
              </span>
            )}
          </Badge>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/75 backdrop-blur-[1px]">
            <Badge tone="neutral">Out of stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
          {product.category}
        </p>
        <h3 className="mt-1.5 font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-primary-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-body">{product.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="tnum text-xl font-bold leading-none tracking-[-0.02em] text-foreground">
              <span className="mr-1 text-xs font-semibold text-muted">PKR</span>
              {formatAmount(product.price)}
            </p>
            {priceSuffix && (
              <p className="mt-1.5 truncate text-xs text-muted">
                per {priceSuffix.replace(/^\//, "")}
              </p>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-[var(--dur)] group-hover:opacity-100">
            <Lock className="h-3 w-3" aria-hidden />
            Lock price
          </span>
        </div>
      </div>
    </Link>
  );
}
