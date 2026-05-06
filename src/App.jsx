import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/features/home";
import { AuthPage, VerifyEmailPage, AdminLoginPage } from "@/features/auth";
import { DashboardPage, DashboardIndex, DashboardOrdersPage } from "@/features/dashboard";
import { ProductDetailPage } from "@/features/dashboard/pages/ProductDetailPage";
import { MerchantInventoryPage } from "@/features/dashboard/pages/MerchantInventoryPage";
import { MerchantProductFormPage } from "@/features/dashboard/pages/MerchantProductFormPage";
import { BuyerOrdersPage } from "@/features/dashboard/pages/BuyerOrdersPage";
import { UserProfilePage } from "@/features/dashboard/pages/UserProfilePage";
import { AdminOrdersPage } from "@/features/dashboard/pages/AdminOrdersPage";
import { AdminMerchantsPage } from "@/features/dashboard/pages/AdminMerchantsPage";
import { AdminBuyersPage } from "@/features/dashboard/pages/AdminBuyersPage";
import { NotFoundPage } from "@/features/not-found";
import { TermsPage } from "@/features/legal/TermsPage";
import { PrivacyPage } from "@/features/legal/PrivacyPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
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
          <Route path="admin/orders" element={<AdminOrdersPage />} />
          <Route path="admin/merchants" element={<AdminMerchantsPage />} />
          <Route path="admin/buyers" element={<AdminBuyersPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
