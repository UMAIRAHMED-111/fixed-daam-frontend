import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatQuantity } from "../data/uomData";

const STATUS_LABEL = {
  pending_verification: "Pending",
  locked: "New",
  ready: "Ready",
  delivered: "Delivered",
  rejected: "Rejected",
};

const STATUS_BADGE = {
  pending_verification: "bg-amber-100 text-amber-700",
  locked: "bg-blue-100 text-blue-800",
  ready: "bg-emerald-100 text-emerald-800",
  delivered: "bg-slate-100 text-slate-600",
  rejected: "bg-red-100 text-red-700",
};

function StatPill({ Icon, value, label, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${tones[tone]}`}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-bold leading-none">{value}</p>
        <p className="text-[11px] font-medium opacity-80 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function MerchantDetail({ merchantId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/v1/admin/merchants/${merchantId}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load merchant detail");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [merchantId]);

  if (loading) {
    return (
      <div className="px-5 py-4 text-sm text-slate-500">Loading details…</div>
    );
  }
  if (!data) return null;

  const { products, orders } = data;

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 space-y-6">
      {/* Products */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Package className="h-4 w-4 text-primary" />
          Products ({products.length})
        </h4>
        {products.length === 0 ? (
          <p className="text-xs text-slate-500">No products yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">Stock</th>
                  <th className="px-3 py-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {p.name}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.category}</td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      PKR {Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {p.stock}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders */}
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ShoppingBag className="h-4 w-4 text-primary" />
          Orders ({orders.length})
        </h4>
        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">No orders for this merchant yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[o.status] ?? STATUS_BADGE.pending_verification
                      }`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">
                  Buyer:{" "}
                  <span className="font-medium text-slate-800">
                    {o.buyerName || o.buyerEmail || "—"}
                  </span>
                  {o.buyerEmail && o.buyerName && (
                    <span className="text-slate-400"> ({o.buyerEmail})</span>
                  )}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {o.items.map((it, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-600"
                    >
                      <span>
                        {it.name} · {formatQuantity(it.quantity, it)}
                      </span>
                      <span>PKR {(it.price * it.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-xs font-semibold text-slate-900">
                  Subtotal: PKR {Number(o.merchantSubtotal).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AdminMerchantsPage() {
  const user = useAuthStore((s) => s.user);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/v1/admin/merchants")
      .then((res) => setMerchants(res.data.results ?? []))
      .catch(() => toast.error("Failed to load merchants"))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") return null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return merchants;
    return merchants.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phoneNumber?.toLowerCase().includes(q)
    );
  }, [merchants, search]);

  const totals = useMemo(
    () => ({
      merchants: merchants.length,
      products: merchants.reduce((s, m) => s + (m.stats?.totalProducts ?? 0), 0),
      orders: merchants.reduce((s, m) => s + (m.stats?.totalOrders ?? 0), 0),
      revenue: merchants.reduce((s, m) => s + (m.stats?.deliveredRevenue ?? 0), 0),
    }),
    [merchants]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Merchants</h1>
          <p className="mt-1 text-sm text-slate-600">
            All registered merchants with their products and orders.
          </p>
        </div>

        {/* Top stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Store className="mb-2 h-5 w-5 text-violet-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.merchants}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Merchants</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Package className="mb-2 h-5 w-5 text-blue-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.products}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Products</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <ShoppingBag className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.orders}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Orders</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <TrendingUp className="mb-2 h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              PKR {Number(totals.revenue).toFixed(0)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Delivered revenue
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search merchants by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
        </div>

        {/* List */}
        {loading && merchants.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">Loading merchants…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Store className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="font-medium text-slate-700">
              {merchants.length === 0
                ? "No merchants yet"
                : "No merchants match your search"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((m) => {
              const isOpen = expandedId === m.id;
              return (
                <li
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : m.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-700">
                      {m.name?.[0]?.toUpperCase() ?? "M"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {m.name}
                        </h3>
                        {m.isEmailVerified && (
                          <span
                            title="Email verified"
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {m.email}
                        </span>
                        {m.phoneNumber && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {m.phoneNumber}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Date(m.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatPill
                          Icon={Package}
                          value={`${m.stats.activeProducts}/${m.stats.totalProducts}`}
                          label="Products active"
                          tone="blue"
                        />
                        <StatPill
                          Icon={ShoppingBag}
                          value={m.stats.totalOrders}
                          label="Orders"
                          tone="primary"
                        />
                        <StatPill
                          Icon={TrendingUp}
                          value={`PKR ${Number(m.stats.deliveredRevenue).toFixed(0)}`}
                          label="Delivered revenue"
                          tone="emerald"
                        />
                      </div>
                    </div>
                    <div className="shrink-0 self-center text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </button>

                  {isOpen && <MerchantDetail merchantId={m.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
