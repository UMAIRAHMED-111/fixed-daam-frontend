import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";
import { CartDrawer } from "@/features/dashboard/components/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { APP_NAME } from "../constants";

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const navLinks = [
    { to: "/#shop", label: "Shop" },
    { to: "/#how-it-works", label: "How it works" },
    { to: "/#for-merchants", label: "For merchants" },
  ];

  const cartButton = (
    <button
      type="button"
      onClick={() => setCartOpen(true)}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 touch-manipulation"
      aria-label={`Cart, ${cartCount} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center transition opacity-90 hover:opacity-100"
            aria-label={`${APP_NAME} home`}
          >
            <Logo variant="compact" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ to, label }) => (
              <a
                key={to}
                href={to}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {label}
              </a>
            ))}
            {cartButton}
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" className="min-h-[44px]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="tertiary" className="min-h-[44px] text-slate-700 hover:text-slate-900 hover:bg-slate-100">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="primary" className="min-h-[44px]">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {cartButton}
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 touch-manipulation"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-200 bg-white md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map(({ to, label }) => (
                  <a
                    key={to}
                    href={to}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                      "min-h-[44px] flex items-center"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full min-h-[44px] mt-2">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <span
                        className={cn(
                          "block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          "min-h-[44px] flex items-center"
                        )}
                      >
                        Sign in
                      </span>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <Button variant="primary" className="w-full min-h-[44px] mt-2">
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
