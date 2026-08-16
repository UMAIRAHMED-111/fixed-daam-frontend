import { useEffect, useState, useMemo } from "react";
import { Search, Package, Clock, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { INPUT_CLASS, PANEL_CLASS } from "@/lib/styles";
import { formatAmount } from "@/lib/money";
import { formatQuantity } from "../data/uomData";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending_verification", label: "Needs review" },
  { id: "locked", label: "Approved" },
  { id: "ready", label: "Ready" },
  { id: "delivered", label: "Collected" },
  { id: "rejected", label: "Rejected" },
];

export function AdminOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_verification");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/admin/orders", { params: { limit: 100 } });
      const data = res.data;
      setOrders(data.results ?? (Array.isArray(data) ? data : []));
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
          o.items?.some((i) => i.name?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  // Land the admin where the work is: the verification queue if anything is
  // waiting, otherwise the full list rather than an empty tab.
  const [hasPickedTab, setHasPickedTab] = useState(false);
  useEffect(() => {
    if (hasPickedTab || loading || orders.length === 0) return;
    setStatusFilter(counts.pending_verification > 0 ? "pending_verification" : "all");
    setHasPickedTab(true);
  }, [hasPickedTab, loading, orders.length, counts.pending_verification]);

  if (user?.role !== "admin") return null;

  const updateOrderInState = (updated) =>
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

  const handleApprove = async (orderId) => {
    setActionLoading(orderId + "-approve");
    try {
      const res = await api.patch(`/v1/admin/orders/${orderId}/verify`, { action: "approve" });
      updateOrderInState(res.data);
      toast.success("Payment approved, order is now active.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId) => {
    setActionLoading(orderId + "-reject");
    try {
      const res = await api.patch(`/v1/admin/orders/${orderId}/verify`, {
        action: "reject",
        note: rejectionNote.trim() || null,
      });
      updateOrderInState(res.data);
      setRejectingId(null);
      setRejectionNote("");
      toast.success("Payment rejected.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject order");
    } finally {
      setActionLoading(null);
    }
  };

  const queueSummary = [
    { label: "awaiting review", value: counts.pending_verification, tone: "warning" },
    { label: "approved", value: counts.locked, tone: "info" },
    { label: "ready", value: counts.ready, tone: "success" },
    { label: "collected", value: counts.delivered, tone: "neutral" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageHeader
          title="Payment verification"
          description="Approve or reject the payment proof buyers upload at checkout. Approving locks their price and releases the order to the merchant."
        />

        {/* Queue state as one line of counts, not four identical metric cards. */}
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3">
          {queueSummary.map(({ label, value, tone }) => (
            <p key={label} className="flex items-baseline gap-1.5 text-sm">
              <span
                className={`tnum text-base font-bold ${
                  value === 0
                    ? "text-muted"
                    : tone === "warning"
                      ? "text-warning"
                      : "text-foreground"
                }`}
              >
                {value}
              </span>
              <span className="text-muted">{label}</span>
            </p>
          ))}
        </div>

        {counts.pending_verification > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning ring-1 ring-inset ring-warning/20">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              <strong className="tnum">{counts.pending_verification}</strong> order
              {counts.pending_verification > 1 ? "s are" : " is"} waiting on you, buyers
              can&apos;t collect until their payment is approved.
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by buyer name, order ID, or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-10`}
            aria-label="Search orders"
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
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                  statusFilter === tab.id ? "bg-primary text-white" : "bg-slate-200 text-body"
                }`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading && orders.length === 0 ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${PANEL_CLASS} p-5`}>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-4 h-3 w-48" />
                <Skeleton className="mt-2 h-3 w-40" />
                <Skeleton className="mt-4 h-9 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              orders.length === 0
                ? "No orders yet"
                : search
                  ? `Nothing matches “${search}”`
                  : `Nothing ${STATUS_TABS.find((t) => t.id === statusFilter)?.label.toLowerCase() ?? "here"}`
            }
            description={
              orders.length === 0
                ? "Orders appear here the moment a buyer checks out. You'll verify their payment proof before the merchant prepares anything."
                : search
                  ? "Try a buyer name, an order ID, or a product name."
                  : "Nothing needs attention in this tab right now."
            }
            action={
              statusFilter !== "all" && orders.length > 0 ? (
                <Button variant="secondary" onClick={() => setStatusFilter("all")}>
                  View all orders
                </Button>
              ) : null
            }
          />
        ) : (
          <ul className="space-y-4">
            {filtered.map((order) => {
              const isPending = order.status === "pending_verification";
              const isRejected = order.status === "rejected";
              const isApproving = actionLoading === order.id + "-approve";
              const isRejecting = actionLoading === order.id + "-reject";
              const showRejectForm = rejectingId === order.id;

              return (
                <li key={order.id} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} audience="admin" />
                      <span className="font-mono text-xs text-muted">
                        #{order.id?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                    {/* Buyer + items */}
                    <div className="flex-1 min-w-0">
                      {(order.buyerName || order.buyerEmail) && (
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {(order.buyerName || order.buyerEmail)?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            {order.buyerName && (
                              <p className="text-sm font-semibold text-foreground truncate">{order.buyerName}</p>
                            )}
                            {order.buyerEmail && (
                              <p className="text-xs text-muted truncate">{order.buyerEmail}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <ul className="space-y-1.5">
                        {order.items?.map((item, i) => (
                          <li key={i} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-body truncate">
                              {item.name}{" "}
                              <span className="text-muted">· {formatQuantity(item.quantity, item)}</span>
                            </span>
                            <span className="shrink-0 text-muted">
                              PKR {formatAmount(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-3 text-sm font-semibold text-foreground">
                        Total: PKR {formatAmount(order.total)}
                      </p>

                      {isRejected && order.rejectionNote && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                          Rejection note: {order.rejectionNote}
                        </p>
                      )}
                    </div>

                    {/* Payment proof / status */}
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      {isPending && order.paymentProof && (
                        <div>
                          <p className="mb-1.5 text-center text-xs font-medium text-muted">
                            Payment proof
                          </p>
                          <button
                            type="button"
                            onClick={() => setLightboxSrc(order.paymentProof)}
                            className="block overflow-hidden rounded-xl border border-border hover:border-primary transition-colors"
                            title="Click to enlarge"
                          >
                            <img
                              src={order.paymentProof}
                              alt="Payment proof"
                              className="h-28 w-28 object-cover"
                            />
                          </button>
                        </div>
                      )}

                      {isRejected && (
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject actions */}
                  {isPending && (
                    <div className="border-t border-border px-5 py-4">
                      {showRejectForm ? (
                        <div className="space-y-3">
                          <textarea
                            rows={2}
                            placeholder="Rejection reason (optional)…"
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReject(order.id)}
                              disabled={isRejecting}
                              className="min-h-[44px] flex-1 rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 transition-all disabled:opacity-60"
                            >
                              {isRejecting ? "Rejecting…" : "Confirm reject"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setRejectingId(null); setRejectionNote(""); }}
                              className="min-h-[44px] rounded-2xl border border-border px-4 text-sm font-medium text-body hover:bg-background transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleApprove(order.id)}
                            disabled={isApproving}
                            className="min-h-[44px] flex-1 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-accent transition-all touch-manipulation disabled:opacity-60"
                          >
                            {isApproving ? "Approving…" : "Approve payment"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(order.id)}
                            className="min-h-[44px] flex-1 rounded-2xl border-2 border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all touch-manipulation"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Payment proof lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Payment proof"
            className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
