import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { formatUomSuffix, getUom } from "../data/uomData";

export function ProductCard({ product }) {
  const image = product.images?.[0] ?? product.image ?? `https://picsum.photos/seed/${product.id}/400/400`;
  const isBundle = product.uom === "bundle";
  const innerUom = isBundle && product.bundleUom ? getUom(product.bundleUom) : null;
  const priceSuffix = formatUomSuffix(product);

  return (
    <Link
      to={`/dashboard/product/${product.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isBundle && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
            <Package className="h-3 w-3" />
            {product.bundleLabel?.trim() || "Bundle"}
            {product.bundleSize && innerUom && (
              <span className="opacity-90">
                · {product.bundleSize} {innerUom.short}
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium text-primary">{product.category}</span>
        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.merchantName && (
          <p className="mt-0.5 text-xs text-slate-500">{product.merchantName}</p>
        )}
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
        <p className="mt-auto pt-3 text-lg font-bold text-slate-900">
          PKR {Number(product.price).toFixed(2)}
          {priceSuffix && (
            <span className="ml-1 text-xs font-medium text-slate-500">
              {priceSuffix}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
