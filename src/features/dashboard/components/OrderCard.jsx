import { useState, useEffect, useRef } from "react";
import { Store, ChevronDown, ChevronUp, RefreshCw, Package, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatQuantity,
  getUom,
  getDeliverableTotal,
  formatDeliverableQty,
  getRemainingDeliverable,
} from "@/features/dashboard/data/uomData";
import { PickupHistory } from "./PickupHistory";

const TOTP_WINDOW = 120; // seconds — keep in sync with backend STEP_SECONDS

function PickupCode({ orderId }) {
  const [code, setCode] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const tickRef = useRef(null);
  const cancelledRef = useRef(false);

  const fetchCode = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/v1/orders/${orderId}/pickup-code`);
      if (cancelledRef.current) return;
      setCode(res.data.code);
      setSecondsLeft(Math.max(1, Number(res.data.expiresIn) || TOTP_WINDOW));
    } catch {
      if (!cancelledRef.current) setError(true);
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    fetchCode();
    return () => {
      cancelledRef.current = true;
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (secondsLeft <= 0 || !code) return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          fetchCode();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, secondsLeft > 0]);

  const progress = Math.max(0, Math.min(1, secondsLeft / TOTP_WINDOW));
  const isExpiring = secondsLeft <= 10;
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timeLabel = secondsLeft >= 60 ? `${mm}:${ss}` : `${secondsLeft}s`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-8 py-5 shadow-sm text-center">
      <p className="mb-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
        Pickup Code
      </p>

      {error ? (
        <div>
          <p className="text-sm text-red-600">Couldn't load code.</p>
          <button
            type="button"
            onClick={fetchCode}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-orange-600"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      ) : loading && !code ? (
        <p className="text-4xl font-bold tracking-[0.25em] text-slate-300 font-mono">
          ••••••
        </p>
      ) : (
        <>
          <p
            className={`text-4xl font-bold tracking-[0.25em] font-mono transition-colors ${
              isExpiring ? "text-red-600" : "text-slate-900"
            }`}
            aria-live="polite"
          >
            {code}
          </p>

          <div className="mx-auto mt-3 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-[width] duration-1000 ease-linear ${
                isExpiring ? "bg-red-500" : "bg-primary"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <p
            className={`mt-2 text-xs font-medium ${
              isExpiring ? "text-red-600" : "text-slate-500"
            }`}
          >
            Expires in {timeLabel}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Show this code to the merchant at pickup
          </p>
        </>
      )}
    </div>
  );
}

export function OrderCard({ order }) {
  const [codeOpen, setCodeOpen] = useState(order.status === "ready");

  const isDelivered = order.status === "delivered";
  const isReady = order.status === "ready";
  const isLocked = order.status === "locked";
  const isPending = order.status === "pending_verification";
  const isRejected = order.status === "rejected";

  // Aggregate fulfillment progress across all items.
  const totalItems = order.items?.length ?? 0;
  const fullyDeliveredItems = (order.items ?? []).filter(
    (item) => getRemainingDeliverable(item) <= 1e-6 && getDeliverableTotal(item) > 0
  ).length;
  const hasPartial =
    isReady &&
    (order.items ?? []).some(
      (item) =>
        Number(item.quantityDelivered || 0) > 0 &&
        getRemainingDeliverable(item) > 1e-6
    );

  const statusConfig = {
    pending_verification: { label: "Pending verification", className: "bg-amber-100 text-amber-700" },
    locked: { label: "Preparing", className: "bg-blue-100 text-blue-800" },
    ready: { label: "Ready for pickup", className: "bg-emerald-100 text-emerald-800" },
    delivered: { label: "Delivered", className: "bg-slate-100 text-slate-600" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  };
  const { label, className: badgeClass } =
    statusConfig[order.status] ?? statusConfig.pending_verification;

  // Group items by merchant
  const merchantGroups = Object.values(
    order.items.reduce((acc, item) => {
      const key = item.merchantId ?? item.merchantName ?? "unknown";
      if (!acc[key]) acc[key] = { name: item.merchantName || "Unknown Store", items: [] };
      acc[key].items.push(item);
      return acc;
    }, {})
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
            {label}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-900">
          PKR {Number(order.total).toFixed(2)}
        </span>
      </div>

      {/* Items grouped by merchant */}
      <div className="divide-y divide-slate-100">
        {merchantGroups.map((group) => (
          <div key={group.name} className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Store className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                {group.name}
              </span>
            </div>
            <ul className="space-y-1.5">
              {group.items.map((item, i) => {
                const isBundle = item.uom === "bundle";
                const innerUom = isBundle && item.bundleUom ? getUom(item.bundleUom) : null;
                const total = getDeliverableTotal(item);
                const delivered = Number(item.quantityDelivered || 0);
                const remaining = Math.max(0, total - delivered);
                const showProgress = (isReady || isDelivered) && total > 0;
                const fullyCollected = remaining <= 1e-6;
                return (
                  <li key={i} className="flex flex-col gap-0.5 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-700 truncate">
                        {item.name}
                        <span className="text-slate-400"> · {formatQuantity(item.quantity, item)}</span>
                      </span>
                      <span className="text-slate-500 shrink-0">
                        PKR {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    {isBundle && item.bundleSize && innerUom && (
                      <span className="inline-flex items-center gap-1 self-start text-[11px] text-violet-700">
                        <Package className="h-3 w-3" />
                        {item.bundleSize} {innerUom.short} per {item.bundleLabel?.trim() || "bundle"}
                      </span>
                    )}
                    {showProgress && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-emerald-500 transition-[width] duration-300"
                            style={{ width: `${Math.min(100, (delivered / total) * 100)}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-medium ${
                            fullyCollected ? "text-emerald-700" : "text-slate-500"
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
          </div>
        ))}
      </div>

      {/* QR + action footer */}
      <div className="border-t border-slate-100 px-5 py-4">
        {isPending && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Payment proof submitted. Verification takes 2–3 hours. Your price is locked in.
          </p>
        )}

        {isRejected && (
          <div className="rounded-lg bg-red-50 px-3 py-2">
            <p className="text-xs font-medium text-red-700">Payment rejected.</p>
            {order.rejectionNote && (
              <p className="mt-0.5 text-xs text-red-600">Reason: {order.rejectionNote}</p>
            )}
          </div>
        )}

        {!isPending && !isRejected && (
          <div className="flex flex-wrap items-center gap-3">
            {isReady && (
              <button
                type="button"
                onClick={() => setCodeOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-orange-600 transition-colors"
              >
                {codeOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {codeOpen ? "Hide" : "Show"} pickup code
              </button>
            )}

            {isReady && hasPartial && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                Partially collected · come back for the rest
              </span>
            )}

            {isReady && totalItems > 0 && fullyDeliveredItems > 0 && !hasPartial && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {fullyDeliveredItems}/{totalItems} items collected
              </span>
            )}

            {isLocked && (
              <p className="ml-auto text-xs text-slate-500">
                Store is preparing your order
              </p>
            )}

            {isDelivered && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Fully collected
              </span>
            )}
          </div>
        )}

        {isReady && (
          <p className="mt-3 text-xs text-slate-500">
            Show the rotating pickup code to the merchant. They can dispense
            partial quantities — the order stays open until everything is collected.
          </p>
        )}

        {codeOpen && !isPending && !isRejected && !isDelivered && (
          <div className="mt-4 flex justify-center">
            <PickupCode orderId={order.id} />
          </div>
        )}
      </div>

      {(isReady || isDelivered) && (
        <PickupHistory
          history={order.pickupHistory}
          emptyHint="Nothing collected yet — show your code at the store."
          defaultOpen={isReady && (order.pickupHistory?.length ?? 0) > 0}
        />
      )}
    </div>
  );
}
