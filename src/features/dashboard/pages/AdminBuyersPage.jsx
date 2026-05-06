import { useEffect, useState, useMemo } from "react";
import {
  Search,
  User as UserIcon,
  ShoppingBag,
  Wallet,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Store,
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
    amber: "bg-amber-50 text-amber-700",
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

function BuyerDetail({ buyerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/v1/admin/buyers/${buyerId}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load buyer detail");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  if (loading) {
    return <div className="px-5 py-4 text-sm text-slate-500">Loading details…</div>;
  }
  if (!data) return null;

  const { orders } = data;

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <ShoppingBag className="h-4 w-4 text-primary" />
        Orders ({orders.length})
      </h4>
      {orders.length === 0 ? (
        <p className="text-xs text-slate-500">No orders placed yet.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => {
            const merchantNames = [
              ...new Set(o.items.map((it) => it.merchantName).filter(Boolean)),
            ];
            return (
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
                    {o.redemptionCode && (
                      <span className="font-mono text-[11px] text-slate-500">
                        Code: {o.redemptionCode}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(o.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {merchantNames.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-600">
                    <Store className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-500">From:</span>
                    <span className="font-medium text-slate-800">
                      {merchantNames.join(", ")}
                    </span>
                  </p>
                )}

                <ul className="mt-2 space-y-0.5">
                  {o.items.map((it, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-600"
                    >
                      <span className="truncate">
                        {it.name} · {formatQuantity(it.quantity, it)}
                      </span>
                      <span className="shrink-0">
                        PKR {(it.price * it.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex items-center justify-between">
                  {o.status === "rejected" && o.rejectionNote ? (
                    <p className="text-xs text-red-600">
                      Rejected: {o.rejectionNote}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs font-semibold text-slate-900">
                    Total: PKR {Number(o.total).toFixed(2)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function AdminBuyersPage() {
  const user = useAuthStore((s) => s.user);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/v1/admin/buyers")
      .then((res) => setBuyers(res.data.results ?? []))
      .catch(() => toast.error("Failed to load buyers"))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") return null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return buyers;
    return buyers.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.phoneNumber?.toLowerCase().includes(q)
    );
  }, [buyers, search]);

  const totals = useMemo(
    () => ({
      buyers: buyers.length,
      orders: buyers.reduce((s, b) => s + (b.stats?.totalOrders ?? 0), 0),
      spent: buyers.reduce((s, b) => s + (b.stats?.deliveredSpent ?? 0), 0),
      pending: buyers.reduce(
        (s, b) => s + (b.stats?.statusCounts?.pending_verification ?? 0),
        0
      ),
    }),
    [buyers]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Buyers</h1>
          <p className="mt-1 text-sm text-slate-600">
            All registered buyers with their order history.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <UserIcon className="mb-2 h-5 w-5 text-sky-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.buyers}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Buyers</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <ShoppingBag className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.orders}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Orders</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Wallet className="mb-2 h-5 w-5 text-emerald-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              PKR {Number(totals.spent).toFixed(0)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Delivered spend
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Clock className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-2xl font-bold text-slate-900 leading-none">
              {totals.pending}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pending payments
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search buyers by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
        </div>

        {loading && buyers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">Loading buyers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <UserIcon
              className="mx-auto mb-3 h-10 w-10 text-slate-300"
              aria-hidden
            />
            <p className="font-medium text-slate-700">
              {buyers.length === 0
                ? "No buyers yet"
                : "No buyers match your search"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((b) => {
              const isOpen = expandedId === b.id;
              return (
                <li
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : b.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-base font-bold text-sky-700">
                      {b.name?.[0]?.toUpperCase() ?? "B"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {b.name}
                        </h3>
                        {b.isEmailVerified && (
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
                          {b.email}
                        </span>
                        {b.phoneNumber && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {b.phoneNumber}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {new Date(b.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </span>
                        {b.stats.lastOrderAt && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last order{" "}
                            {new Date(
                              b.stats.lastOrderAt
                            ).toLocaleDateString(undefined, {
                              dateStyle: "medium",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatPill
                          Icon={ShoppingBag}
                          value={b.stats.totalOrders}
                          label="Orders"
                          tone="primary"
                        />
                        <StatPill
                          Icon={Wallet}
                          value={`PKR ${Number(b.stats.deliveredSpent).toFixed(0)}`}
                          label="Delivered spend"
                          tone="emerald"
                        />
                        {b.stats.statusCounts.pending_verification > 0 && (
                          <StatPill
                            Icon={Clock}
                            value={b.stats.statusCounts.pending_verification}
                            label="Pending"
                            tone="amber"
                          />
                        )}
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

                  {isOpen && <BuyerDetail buyerId={b.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
