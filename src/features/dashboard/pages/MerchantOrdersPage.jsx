import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  KeyRound,
  ScanLine,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";
import {
  formatQuantity,
  getDeliverableTotal,
  getDeliverableUomShort,
  isDeliverableInteger,
  getDeliverableStep,
  getRemainingDeliverable,
  formatDeliverableQty,
  getUom,
} from "../data/uomData";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending_verification", label: "Pending" },
  { id: "locked", label: "New" },
  { id: "ready", label: "Ready" },
  { id: "delivered", label: "Delivered" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_CONFIG = {
  pending_verification: { label: "Pending payment", className: "bg-amber-100 text-amber-700" },
  locked: { label: "New order", className: "bg-blue-100 text-blue-800" },
  ready: { label: "Ready for pickup", className: "bg-emerald-100 text-emerald-800" },
  delivered: { label: "Delivered", className: "bg-slate-100 text-slate-600" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_verification;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

const formatNum = (n) => {
  const num = Number(n) || 0;
  return Number.isInteger(num) ? String(num) : Number(num.toFixed(3)).toString();
};

/**
 * Inline pickup panel — lets the merchant dispense partial quantities
 * against the buyer's live TOTP code.
 */
function PickupPanel({ order, merchantId, initialCode = "" }) {
  const fulfillOrder = useOrdersStore((s) => s.fulfillOrder);

  // Track each merchant-owned item by its index in the order.
  const merchantItems = useMemo(
    () =>
      order.items
        .map((item, idx) => ({ item, idx }))
        .filter(
          ({ item }) =>
            item.merchantId && String(item.merchantId) === String(merchantId)
        ),
    [order.items, merchantId]
  );

  const buildInitialQty = useCallback(
    () =>
      merchantItems.reduce((acc, { item, idx }) => {
        const remaining = getRemainingDeliverable(item);
        // Default: prefill the remaining qty so "give all" is one click away.
        acc[idx] = remaining > 0 ? formatNum(remaining) : "0";
        return acc;
      }, {}),
    [merchantItems]
  );

  const [qty, setQty] = useState(buildInitialQty);
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset prefill when the order's delivered counts change (e.g. after a partial pickup).
  useEffect(() => {
    setQty(buildInitialQty());
  }, [buildInitialQty]);

  // External code entered upstream (top form) — prefill once.
  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  const allRemaining = merchantItems.every(
    ({ item }) => getRemainingDeliverable(item) <= 1e-6
  );

  const handleChange = (idx, value) => {
    setQty((prev) => ({ ...prev, [idx]: value }));
    setError("");
  };

  const setMax = (idx, item) => {
    const remaining = getRemainingDeliverable(item);
    setQty((prev) => ({ ...prev, [idx]: formatNum(remaining) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from the buyer");
      return;
    }
    const pickups = [];
    for (const { item, idx } of merchantItems) {
      const raw = qty[idx];
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n) || n < 0) {
        setError("Enter a valid quantity for every item");
        return;
      }
      if (n === 0) continue;
      const remaining = getRemainingDeliverable(item);
      if (n > remaining + 1e-6) {
        setError(
          `${item.name}: only ${formatDeliverableQty(remaining, item)} remaining`
        );
        return;
      }
      pickups.push({ itemIndex: idx, quantity: n });
    }
    if (pickups.length === 0) {
      setError("Enter at least one item to dispense");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const updated = await fulfillOrder(order.id, code, pickups);
      const stillRemaining = updated.items.some(
        (item) =>
          item.merchantId &&
          String(item.merchantId) === String(merchantId) &&
          getRemainingDeliverable(item) > 1e-6
      );
      if (stillRemaining) {
        toast.success("Pickup recorded. Buyer can collect the rest later.");
      } else if (updated.status === "delivered") {
        toast.success("Pickup complete — order fully delivered.");
      } else {
        toast.success("Pickup recorded for your items.");
      }
      // Clear the code so the merchant has to ask the buyer for a fresh one next time.
      setCode("");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to record pickup";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (allRemaining) {
    return (
      <div className="border-t border-slate-100 bg-emerald-50/50 px-5 py-4">
        <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          You've dispensed all of your items in this order.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <ScanLine className="h-4 w-4 text-primary" />
        Record pickup
      </div>

      <ul className="space-y-3">
        {merchantItems.map(({ item, idx }) => {
          const total = getDeliverableTotal(item);
          const delivered = Number(item.quantityDelivered || 0);
          const remaining = Math.max(0, total - delivered);
          const unit = getDeliverableUomShort(item);
          const step = getDeliverableStep(item);
          const integer = isDeliverableInteger(item);
          const innerUom = item.uom === "bundle" && item.bundleUom ? getUom(item.bundleUom) : null;
          const progress = total > 0 ? Math.min(1, delivered / total) : 0;

          return (
            <li
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-slate-800 truncate">
                  {item.name}
                  {item.uom === "bundle" && item.bundleSize && innerUom && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      ({item.quantity} × {item.bundleSize} {innerUom.short})
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDeliverableQty(delivered, item)} / {formatDeliverableQty(total, item)} given
                </p>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {remaining <= 1e-6 ? (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  All dispensed
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Give now
                  </label>
                  <input
                    type="number"
                    inputMode={integer ? "numeric" : "decimal"}
                    min={0}
                    max={remaining}
                    step={step}
                    value={qty[idx] ?? ""}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="min-h-[44px] w-24 rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
                  />
                  <span className="text-xs text-slate-500">{unit}</span>
                  <button
                    type="button"
                    onClick={() => setMax(idx, item)}
                    className="ml-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Max ({formatDeliverableQty(remaining, item)})
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Buyer's 6-digit pickup code
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="min-h-[44px] w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-xl font-bold font-mono tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] flex-1 rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-all touch-manipulation disabled:opacity-60"
        >
          {submitting ? "Recording…" : "Confirm pickup"}
        </button>
      </div>
    </form>
  );
}

export function MerchantOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const merchantId = user?.id;
  const orders = useOrdersStore((s) => s.getOrdersForMerchant(merchantId));
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const markReady = useOrdersStore((s) => s.markReady);
  const validateCode = useOrdersStore((s) => s.validateCode);
  const loading = useOrdersStore((s) => s.loading);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  // Which order's pickup panel is currently expanded, plus the code that opened it.
  const [pickupOpenId, setPickupOpenId] = useState(null);
  const [pickupCodePrefill, setPickupCodePrefill] = useState("");
  const orderRefs = useRef({});

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (user?.role !== "merchant") return null;

  const getMyItems = useCallback(
    (order) => order.items.filter((i) => i.merchantId === merchantId),
    [merchantId]
  );

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

  const handleCodeValidate = async (e) => {
    e.preventDefault();
    const code = codeInput.trim();
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter a valid 6-digit code");
      return;
    }
    setCodeLoading(true);
    setCodeError("");
    try {
      const order = await validateCode(code);
      if (order.status !== "ready") {
        setCodeError(
          `Order found, but it's "${order.status.replace("_", " ")}", not ready for pickup.`
        );
        return;
      }
      // Make sure the matching order is visible, then auto-open its pickup panel.
      setStatusFilter("all");
      setSearch("");
      setPickupOpenId(order.id);
      setPickupCodePrefill(code);
      setCodeInput("");
      // Scroll to the order card after the next paint.
      setTimeout(() => {
        const el = orderRefs.current[order.id];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } catch (err) {
      setCodeError(err.response?.data?.message || "Code not found");
    } finally {
      setCodeLoading(false);
    }
  };

  const STATS = [
    { label: "Pending", value: counts.pending_verification, Icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "New", value: counts.locked, Icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Ready", value: counts.ready, Icon: Truck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Delivered", value: counts.delivered, Icon: CheckCircle2, color: "text-slate-500", bg: "bg-slate-100" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Verify payments, prepare orders, and dispense items at pickup.
          </p>
        </div>

        {/* Quick lookup by code */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-slate-800">Buyer at the counter?</h2>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Type their 6-digit pickup code to jump straight to the order.
          </p>
          <form onSubmit={handleCodeValidate} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value.replace(/\D/g, ""));
                setCodeError("");
              }}
              className="flex-1 min-h-[44px] rounded-xl border border-slate-200 px-4 text-center text-xl font-bold font-mono tracking-widest text-slate-900 placeholder:text-slate-300 placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={codeLoading || codeInput.length !== 6}
              className="min-h-[44px] rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {codeLoading ? "Checking…" : "Find order"}
            </button>
          </form>
          {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} aria-hidden />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {counts.pending_verification > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
            <span>
              <strong>{counts.pending_verification}</strong> order
              {counts.pending_verification > 1 ? "s are" : " is"} awaiting payment verification.
            </span>
          </div>
        )}

        {counts.locked > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500 animate-pulse" />
            <span>
              <strong>{counts.locked}</strong> new order{counts.locked > 1 ? "s need" : " needs"} your attention.
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
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
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none ${
                  statusFilter === tab.id ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                }`}>
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
              {orders.length === 0 ? "No orders yet" : "No orders match your search"}
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
              const isPending = order.status === "pending_verification";
              const isRejected = order.status === "rejected";
              const isReady = order.status === "ready";
              const isDelivered = order.status === "delivered";
              const isReadyLoading = actionLoading === order.id + "-ready";
              const pickupOpen = pickupOpenId === order.id;

              const myRemaining = items.reduce(
                (sum, item) => sum + getRemainingDeliverable(item),
                0
              );

              return (
                <li
                  key={order.id}
                  ref={(el) => {
                    if (el) orderRefs.current[order.id] = el;
                    else delete orderRefs.current[order.id];
                  }}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                    pickupOpen ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                  }`}
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
                      {(order.buyerName || order.buyerEmail) && (
                        <div className="mb-4">
                          <p className="mb-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">Customer</p>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {(order.buyerName || order.buyerEmail)?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              {order.buyerName && (
                                <p className="text-sm font-semibold text-slate-800 truncate">{order.buyerName}</p>
                              )}
                              {order.buyerEmail && (
                                <p className="text-xs text-slate-500 truncate">{order.buyerEmail}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mb-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">Items</p>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => {
                          const total = getDeliverableTotal(item);
                          const delivered = Number(item.quantityDelivered || 0);
                          const remaining = Math.max(0, total - delivered);
                          const fullyDelivered = remaining <= 1e-6;
                          return (
                            <li key={i} className="text-sm">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-700 truncate">
                                  {item.name}{" "}
                                  <span className="text-slate-400">· {formatQuantity(item.quantity, item)}</span>
                                </span>
                                <span className="shrink-0 text-slate-600 font-medium">
                                  PKR {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                              {(isReady || isDelivered) && total > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full bg-emerald-500"
                                      style={{ width: `${Math.min(100, (delivered / total) * 100)}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`text-[11px] font-medium ${
                                      fullyDelivered ? "text-emerald-700" : "text-slate-500"
                                    }`}
                                  >
                                    {formatDeliverableQty(delivered, item)} / {formatDeliverableQty(total, item)}
                                  </span>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      {order.total != null && (
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="text-xs font-medium text-slate-500">Total</span>
                          <span className="text-sm font-bold text-slate-900">
                            PKR {order.total.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {isRejected && order.rejectionNote && (
                        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                          Rejection note: {order.rejectionNote}
                        </p>
                      )}
                    </div>

                    {/* Right column */}
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      {isPending && order.paymentProof && (
                        <div>
                          <p className="mb-1.5 text-center text-xs font-medium text-slate-500">
                            Payment proof
                          </p>
                          <button
                            type="button"
                            onClick={() => setLightboxSrc(order.paymentProof)}
                            className="block overflow-hidden rounded-xl border border-slate-200 hover:border-primary transition-colors"
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

                      <div className="w-28 h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                        {items[0]?.image ? (
                          <img
                            src={items[0].image}
                            alt={items[0].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-10 w-10 text-slate-300" aria-hidden />
                        )}
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

                      {isReady && myRemaining > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (pickupOpen) {
                              setPickupOpenId(null);
                              setPickupCodePrefill("");
                            } else {
                              setPickupOpenId(order.id);
                              setPickupCodePrefill("");
                            }
                          }}
                          className="w-full min-h-[44px] rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all touch-manipulation"
                        >
                          {pickupOpen ? "Close pickup" : "Open pickup"}
                        </button>
                      )}

                      {isReady && myRemaining <= 1e-6 && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Your items dispensed
                        </span>
                      )}

                      {isDelivered && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                          Collected
                        </span>
                      )}

                      {isRejected && (
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="border-t border-slate-100 px-5 py-3">
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        Awaiting admin payment verification.
                      </p>
                    </div>
                  )}

                  {isReady && pickupOpen && (
                    <PickupPanel
                      order={order}
                      merchantId={merchantId}
                      initialCode={pickupCodePrefill}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
