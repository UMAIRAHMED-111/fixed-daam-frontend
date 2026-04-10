import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/features/home";
import { AuthPage, VerifyEmailPage } from "@/features/auth";
import { DashboardPage, DashboardIndex, DashboardOrdersPage } from "@/features/dashboard";
import { ProductDetailPage } from "@/features/dashboard/pages/ProductDetailPage";
import { MerchantInventoryPage } from "@/features/dashboard/pages/MerchantInventoryPage";
import { MerchantProductFormPage } from "@/features/dashboard/pages/MerchantProductFormPage";
import { BuyerOrdersPage } from "@/features/dashboard/pages/BuyerOrdersPage";
import { UserProfilePage } from "@/features/dashboard/pages/UserProfilePage";
import { NotFoundPage } from "@/features/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardIndex />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="orders" element={<DashboardOrdersPage />} />
          <Route path="inventory" element={<MerchantInventoryPage />} />
          <Route path="inventory/new" element={<MerchantProductFormPage />} />
          <Route path="inventory/:id/edit" element={<MerchantProductFormPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
