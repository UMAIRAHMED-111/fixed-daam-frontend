import { Link } from "react-router-dom";

export function ProductCard({ product }) {
  const image = product.images?.[0] ?? product.image ?? `https://picsum.photos/seed/${product.id}/400/400`;

  return (
    <Link
      to={`/dashboard/product/${product.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
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
        </p>
      </div>
    </Link>
  );
}
