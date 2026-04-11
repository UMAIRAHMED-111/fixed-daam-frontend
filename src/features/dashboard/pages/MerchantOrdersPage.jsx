import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Package, ClipboardList, Clock, CheckCircle2, Truck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "locked", label: "New" },
  { id: "ready", label: "Ready" },
  { id: "delivered", label: "Delivered" },
];

const STATUS_CONFIG = {
  locked: { label: "New order", className: "bg-amber-100 text-amber-800" },
  ready: { label: "Ready for pickup", className: "bg-blue-100 text-blue-800" },
  delivered: { label: "Delivered", className: "bg-slate-100 text-slate-600" },
};

function StatusBadge({ status }) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.locked;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function MerchantOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const merchantId = user?.id;
  const orders = useOrdersStore((s) => s.getOrdersForMerchant(merchantId));
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const markReady = useOrdersStore((s) => s.markReady);
  const markDelivered = useOrdersStore((s) => s.markDelivered);
  const loading = useOrdersStore((s) => s.loading);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (user?.role !== "merchant") return null;

  const getMyItems = useCallback(
    (order) => order.items.filter((i) => i.merchantId === merchantId),
    [merchantId]
  );

  const getMySubtotal = useCallback(
    (order) =>
      getMyItems(order).reduce((s, i) => s + i.price * i.quantity, 0),
    [getMyItems]
  );

  const counts = useMemo(
    () => ({
      all: orders.length,
      locked: orders.filter((o) => o.status === "locked").length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    let list = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (o) =>
          o.id?.toLowerCase().includes(q) ||
          o.buyerName?.toLowerCase().includes(q) ||
          o.buyerEmail?.toLowerCase().includes(q) ||
          getMyItems(o).some((i) => i.name?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, statusFilter, search, getMyItems]);

  const handleMarkReady = async (orderId) => {
    setActionLoading(orderId + "-ready");
    try {
      await markReady(orderId);
      toast.success("Order marked ready for pickup.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setActionLoading(orderId + "-delivered");
    try {
      await markDelivered(orderId);
      toast.success("Order marked as delivered.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setActionLoading(null);
    }
  };

  const STATS = [
    {
      label: "Total",
      value: counts.all,
      Icon: ClipboardList,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label: "New",
      value: counts.locked,
      Icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Ready",
      value: counts.ready,
      Icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Delivered",
      value: counts.delivered,
      Icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage orders that include your products.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} aria-hidden />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">
                {value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* New-order alert */}
        {counts.locked > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>{counts.locked}</strong> new order
              {counts.locked > 1 ? "s need" : " needs"} your attention.
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by buyer name, order ID, or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
          />
        </div>

        {/* Status tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`flex flex-1 min-w-max items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                    statusFilter === tab.id
                      ? "bg-primary text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading && orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500 text-sm">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="font-medium text-slate-700">
              {orders.length === 0
                ? "No orders yet"
                : "No orders match your search"}
            </p>
            {orders.length === 0 && (
              <p className="mt-1 text-sm text-slate-500">
                Orders containing your products will appear here.
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((order) => {
              const items = getMyItems(order);
              const subtotal = getMySubtotal(order);
              const isReadyLoading = actionLoading === order.id + "-ready";
              const isDeliveredLoading = actionLoading === order.id + "-delivered";

              return (
                <li
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} />
                      <span className="font-mono text-xs text-slate-400">
                        #{order.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Buyer info */}
                      {(order.buyerName || order.buyerEmail) && (
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {(order.buyerName || order.buyerEmail)?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {order.buyerName && (
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {order.buyerName}
                              </p>
                            )}
                            {order.buyerEmail && (
                              <p className="text-xs text-slate-500 truncate">
                                {order.buyerEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <ul className="space-y-2">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-4 text-sm"
                          >
                            <span className="text-slate-700 truncate">
                              {item.name}{" "}
                              <span className="text-slate-400">× {item.quantity}</span>
                            </span>
                            <span className="shrink-0 text-slate-500">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-4 text-sm font-semibold text-slate-900">
                        Subtotal: ${Number(subtotal).toFixed(2)}
                      </p>
                    </div>

                    {/* QR + actions */}
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                        <QRCodeSVG value={order.qrValue} size={100} />
                      </div>

                      {order.status === "locked" && (
                        <button
                          type="button"
                          onClick={() => handleMarkReady(order.id)}
                          disabled={isReadyLoading}
                          className="w-full min-h-[44px] rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-all touch-manipulation disabled:opacity-60"
                        >
                          {isReadyLoading ? "Updating…" : "Mark ready"}
                        </button>
                      )}

                      {order.status === "ready" && (
                        <button
                          type="button"
                          onClick={() => handleMarkDelivered(order.id)}
                          disabled={isDeliveredLoading}
                          className="w-full min-h-[44px] rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all touch-manipulation disabled:opacity-60"
                        >
                          {isDeliveredLoading ? "Updating…" : "Mark delivered"}
                        </button>
                      )}

                      {order.status === "delivered" && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                          Collected
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
