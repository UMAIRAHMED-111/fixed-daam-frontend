import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuthStore } from "@/stores/authStore";
import { useOrdersStore } from "@/stores/ordersStore";
import { toast } from "sonner";

function OrderStatusBadge({ status }) {
  const labels = { locked: "New", ready: "Ready for pickup", delivered: "Delivered" };
  const styles = {
    locked: "bg-amber-100 text-amber-800",
    ready: "bg-blue-100 text-blue-800",
    delivered: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status] ?? "bg-slate-100"}`}>
      {labels[status] ?? status}
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleMarkReady = async (orderId) => {
    try {
      await markReady(orderId);
      toast.success("Order marked ready for pickup.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await markDelivered(orderId);
      toast.success("Order marked delivered.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    }
  };

  if (user?.role !== "merchant") {
    return null;
  }

  const myOrderItems = (order) =>
    order.items.filter((i) => i.merchantId === merchantId);
  const orderTotalForMerchant = (order) =>
    myOrderItems(order).reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-slate-600">
          Orders containing your products. Mark ready when prepared, then delivered when collected.
        </p>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">No orders yet.</p>
            <p className="mt-1 text-sm text-slate-500">Orders that include your products will appear here.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => {
              const myItems = myOrderItems(order);
              const total = orderTotalForMerchant(order);
              return (
                <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-slate-500">{order.id}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="mt-2 font-semibold text-slate-900">${Number(total).toFixed(2)} (your items)</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {myItems.map((item, i) => (
                          <li key={i}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:shrink-0">
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        <QRCodeSVG value={order.qrValue} size={100} />
                      </div>
                      {order.status === "locked" && (
                        <button
                          type="button"
                          onClick={() => handleMarkReady(order.id)}
                          className="min-h-[44px] rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all touch-manipulation"
                        >
                          Mark ready for pickup
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          type="button"
                          onClick={() => handleMarkDelivered(order.id)}
                          className="min-h-[44px] rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all touch-manipulation"
                        >
                          Mark delivered
                        </button>
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
