import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { BuyerProductsPage } from "./pages/BuyerProductsPage";
import { BuyerOrdersPage } from "./pages/BuyerOrdersPage";
import { MerchantOrdersPage } from "./pages/MerchantOrdersPage";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "buyer";
  const location = useLocation();
  const isInventoryRoute = location.pathname.startsWith("/dashboard/inventory");

  if (isInventoryRoute && role !== "merchant") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet context={{ role }} />;
}

/** Index route: buyers see products, merchants redirect to inventory */
export function DashboardIndex() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "merchant") {
    return <Navigate to="/dashboard/inventory" replace />;
  }
  return <BuyerProductsPage />;
}

/** Orders route: buyer or merchant view by role */
export function DashboardOrdersPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "merchant") {
    return <MerchantOrdersPage />;
  }
  return <BuyerOrdersPage />;
}
