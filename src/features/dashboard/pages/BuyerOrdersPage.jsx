import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { useOrdersStore } from "@/stores/ordersStore";
import { SkeletonOrderCards } from "@/components/ui/Skeleton";
import { OrderCard } from "../components/OrderCard";

const STATUS_TABS = [
  { id: "all", label: "All orders" },
  { id: "pending_verification", label: "Pending" },
  { id: "locked", label: "Confirmed" },
  { id: "ready", label: "Ready for pickup" },
  { id: "delivered", label: "Delivered" },
  { id: "rejected", label: "Rejected" },
];

export function BuyerOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const hasLoaded = useOrdersStore((s) => s.hasLoaded);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending_verification: orders.filter((o) => o.status === "pending_verification").length,
      locked: orders.filter((o) => o.status === "locked").length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      rejected: orders.filter((o) => o.status === "rejected").length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.items.some(
            (i) =>
              i.name?.toLowerCase().includes(q) ||
              i.merchantName?.toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="mt-1 text-sm text-body">
            Your locked-in prices. Show the rotating pickup code at the store -
            you can collect partial quantities across multiple visits.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by product, merchant, or order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-surface-sunken p-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`flex flex-1 min-w-max items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-body"
              }`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                    statusFilter === tab.id
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-body"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending verification banner */}
        {counts.pending_verification > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>{counts.pending_verification}</strong> order{counts.pending_verification > 1 ? "s are" : " is"} awaiting
              payment verification (2–3 hours).
            </span>
          </div>
        )}

        {/* Rejected banner */}
        {counts.rejected > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span>
              <strong>{counts.rejected}</strong> order{counts.rejected > 1 ? "s were" : " was"} rejected, check the Rejected tab for details.
            </span>
          </div>
        )}

        {/* Ready alert banner */}
        {counts.ready > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>{counts.ready}</strong> order{counts.ready > 1 ? "s are" : " is"} ready for
              pickup, show your rotating code at the store!
            </span>
          </div>
        )}

        {/* Orders list */}
        {!hasLoaded && orders.length === 0 ? (
          <SkeletonOrderCards count={3} label="Loading your orders" />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="font-medium text-body">
              {orders.length === 0
                ? "No orders yet"
                : "No orders match your search"}
            </p>
            {orders.length === 0 && (
              <>
                <p className="mt-1 text-sm text-muted">
                  Browse products and lock in a price to get started.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 hover:bg-accent transition-all"
                >
                  Browse products
                </Link>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
