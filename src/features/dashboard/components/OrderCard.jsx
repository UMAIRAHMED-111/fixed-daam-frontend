import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Store, ChevronDown, ChevronUp } from "lucide-react";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";

export function OrderCard({ order }) {
  const markDelivered = useOrdersStore((s) => s.markDelivered);
  const [qrOpen, setQrOpen] = useState(order.status === "ready");
  const [loading, setLoading] = useState(false);

  const isDelivered = order.status === "delivered";
  const isReady = order.status === "ready";
  const isLocked = order.status === "locked";
  const isPending = order.status === "pending_verification";
  const isRejected = order.status === "rejected";

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

  const handleMarkCollected = async () => {
    setLoading(true);
    try {
      await markDelivered(order.id);
      toast.success("Order marked as collected!");
    } catch {
      toast.error("Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

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
              {group.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-slate-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    PKR {(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* QR + action footer */}
      <div className="border-t border-slate-100 px-5 py-4">
        {isPending && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Payment proof submitted. Verification takes 2–3 days. Your price is locked in.
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
            <button
              type="button"
              onClick={() => setQrOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-orange-600 transition-colors"
            >
              {qrOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {qrOpen ? "Hide" : "Show"} QR code
            </button>

            {isReady && (
              <button
                type="button"
                onClick={handleMarkCollected}
                disabled={loading}
                className="ml-auto min-h-[44px] rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-orange-600 transition-all touch-manipulation disabled:opacity-60"
              >
                {loading ? "Updating…" : "Mark as collected"}
              </button>
            )}

            {isLocked && (
              <p className="ml-auto text-xs text-slate-500">
                Store is preparing your order
              </p>
            )}

            {isDelivered && (
              <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                Collected
              </span>
            )}
          </div>
        )}

        {qrOpen && !isPending && !isRejected && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <QRCodeSVG value={order.qrValue} size={140} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
