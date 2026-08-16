import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, Menu, UserCircle, Store, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { CartDrawer } from "./CartDrawer";
import { APP_NAME } from "@/features/home/constants";

export function DashboardNav() {
  const { user, logout } = useAuthStore();
  const email = user?.email ?? "User";
  const isMerchant = user?.role === "merchant";
  const isAdmin = user?.role === "admin";
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const location = useLocation();
  const isOrders = location.pathname === "/dashboard/orders";
  const isAdminOrders = location.pathname === "/dashboard/admin/orders";
  const isAdminMerchants = location.pathname === "/dashboard/admin/merchants";
  const isAdminBuyers = location.pathname === "/dashboard/admin/buyers";
  const isInventory = location.pathname.startsWith("/dashboard/inventory");
  const isProfile = location.pathname === "/dashboard/profile";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          {/* The wordmark goes home, the way a wordmark does everywhere else.
              Pointing it at /dashboard left buyers with no way back to the
              storefront. The nav links below still cover the dashboard. */}
          <Link
            to="/"
            className="flex shrink-0 items-center transition opacity-90 hover:opacity-100"
            aria-label={`${APP_NAME} home`}
          >
            <Logo variant="compact" />
          </Link>

          {/* Desktop: full nav */}
          <div className="hidden flex-1 items-center justify-end gap-2 sm:gap-4 md:flex">
            {!isAdmin && (
              <Link
                to={isMerchant ? "/dashboard/inventory" : "/dashboard"}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition min-h-[44px] flex items-center shrink-0 ${
                  isMerchant ? (isInventory ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken")
                    : (!isOrders && !isInventory ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken")
                }`}
              >
                {isMerchant ? "Inventory" : "Products"}
              </Link>
            )}
            <Link
              to={isAdmin ? "/dashboard/admin/orders" : "/dashboard/orders"}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition min-h-[44px] flex items-center gap-1.5 shrink-0 ${
                (isOrders || isAdminOrders) ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken"
              }`}
            >
              <Package className="h-4 w-4 shrink-0" aria-hidden />
              Orders
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/dashboard/admin/merchants"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition min-h-[44px] flex items-center gap-1.5 shrink-0 ${
                    isAdminMerchants ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken"
                  }`}
                >
                  <Store className="h-4 w-4 shrink-0" aria-hidden />
                  Merchants
                </Link>
                <Link
                  to="/dashboard/admin/buyers"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition min-h-[44px] flex items-center gap-1.5 shrink-0 ${
                    isAdminBuyers ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken"
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" aria-hidden />
                  Buyers
                </Link>
              </>
            )}
            {!isMerchant && !isAdmin && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-body hover:bg-surface-sunken hover:text-foreground"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            )}
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isAdmin ? "bg-red-100 text-red-700" : isMerchant ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
            }`}>
              {isAdmin ? "Admin" : isMerchant ? "Merchant" : "Buyer"}
            </span>
            <Link
              to="/dashboard/profile"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition ${
                isProfile ? "text-primary bg-primary/10" : "text-body hover:bg-surface-sunken"
              }`}
              aria-label="Your profile"
              title={email}
            >
              <UserCircle className="h-5 w-5" />
            </Link>
            <Button
              variant="secondary"
              className="min-h-[44px] shrink-0 border-border-strong text-body"
              onClick={() => logout()}
            >
              Sign out
            </Button>
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            {!isMerchant && !isAdmin && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-body hover:bg-surface-sunken hover:text-foreground"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
            )}
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-body hover:bg-surface-sunken"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border bg-surface md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {!isAdmin && (
                  <Link
                    to={isMerchant ? "/dashboard/inventory" : "/dashboard"}
                    onClick={closeMobileMenu}
                    className={`min-h-[44px] flex items-center rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isMerchant ? (isInventory ? "bg-primary/10 text-primary" : "text-body hover:bg-background")
                        : (!isOrders && !isInventory ? "bg-primary/10 text-primary" : "text-body hover:bg-background")
                    }`}
                  >
                    {isMerchant ? "Inventory" : "Products"}
                  </Link>
                )}
                <Link
                  to={isAdmin ? "/dashboard/admin/orders" : "/dashboard/orders"}
                  onClick={closeMobileMenu}
                  className={`min-h-[44px] flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    (isOrders || isAdminOrders) ? "bg-primary/10 text-primary" : "text-body hover:bg-background"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/dashboard/admin/merchants"
                      onClick={closeMobileMenu}
                      className={`min-h-[44px] flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isAdminMerchants ? "bg-primary/10 text-primary" : "text-body hover:bg-background"
                      }`}
                    >
                      <Store className="h-4 w-4" />
                      Merchants
                    </Link>
                    <Link
                      to="/dashboard/admin/buyers"
                      onClick={closeMobileMenu}
                      className={`min-h-[44px] flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isAdminBuyers ? "bg-primary/10 text-primary" : "text-body hover:bg-background"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Buyers
                    </Link>
                  </>
                )}
                <Link
                  to="/dashboard/profile"
                  onClick={closeMobileMenu}
                  className={`min-h-[44px] flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isProfile ? "bg-primary/10 text-primary" : "text-body hover:bg-background"
                  }`}
                >
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <div className="min-h-[44px] flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm text-muted truncate">{email}</span>
                  <span className={`ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isAdmin ? "bg-red-100 text-red-700" : isMerchant ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
                  }`}>
                    {isAdmin ? "Admin" : isMerchant ? "Merchant" : "Buyer"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { closeMobileMenu(); logout(); }}
                  className="min-h-[44px] flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body hover:bg-background"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
