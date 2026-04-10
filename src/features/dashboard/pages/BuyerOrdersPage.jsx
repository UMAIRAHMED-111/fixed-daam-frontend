import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useOrdersStore } from "@/stores/ordersStore";
import { OrderCard } from "../components/OrderCard";

export function BuyerOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const fetchOrders = useOrdersStore((s) => s.fetchOrders);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <Link
            to="/dashboard"
            className="min-h-[44px] -ml-1 inline-flex items-center gap-2 rounded-lg pl-1 pr-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
            Back to products
          </Link>
        </div>
        <p className="mb-6 text-slate-600">
          Your locked-in purchases. Show the QR code when you collect your order.
        </p>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">You have no orders yet.</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:bg-orange-600 transition-all"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
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
