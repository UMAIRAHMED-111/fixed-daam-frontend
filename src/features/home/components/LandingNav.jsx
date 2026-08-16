import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  UserCircle,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/StatusBadge";
import { CartDrawer } from "@/features/dashboard/components/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { getGuestOrders } from "@/lib/guestOrders";
import { formatAmount } from "@/lib/money";

const LINKS = [
  { href: "/#shop", label: "Shop" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-merchants", label: "For merchants" },
];

const ROLE_LABEL = { buyer: "Buyer", merchant: "Merchant", admin: "Admin" };
const ROLE_TONE = { buyer: "info", merchant: "brand", admin: "danger" };

/**
 * Site header.
 *
 * The cart carries the primary action, because buying needs no account here.
 * Accounts get exactly one entrance named by job: shoppers sign in at /auth,
 * shops at /merchant. Two identical buttons pointing at the same door is what
 * sent shopkeepers into the buyer form.
 *
 * On the home page it starts transparent so the rate board runs to the top of
 * the window, then turns solid once you scroll past it.
 */
export function LandingNav() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [guestOrderCount, setGuestOrderCount] = useState(0);
  const accountRef = useRef(null);
  const accountTriggerRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const items = useCartStore((s) => s.items);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const hasCart = cartCount > 0;

  const isHome = location.pathname === "/";
  const overBoard = isHome && !scrolled && !menuOpen;

  // Guest tracking links live on the device, so only offer the route when this
  // device actually has one.
  useEffect(() => {
    setGuestOrderCount(getGuestOrders().length);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return undefined;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // The mobile sheet covers the page; don't let the page scroll behind it.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Account menu: Escape closes, clicking away closes, focus returns to the trigger.
  useEffect(() => {
    if (!accountOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [accountOpen]);

  const linkClass = overBoard
    ? "text-chalk-dim hover:text-chalk"
    : "text-body hover:text-foreground";
  const quietButtonClass = overBoard
    ? "border-chalk/25 text-chalk hover:bg-chalk/10"
    : "border-border-strong text-foreground hover:bg-surface-sunken";

  const firstName = (user?.name ?? "Account").split(" ")[0];
  const role = user?.role ?? "buyer";

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  return (
    <>
      <header
        className={`top-0 z-[var(--z-sticky)] w-full transition-colors duration-[var(--dur)] ${
          isHome ? "fixed left-0 right-0" : "sticky"
        } ${
          overBoard
            ? "bg-transparent"
            : "border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-80"
            aria-label="FixedDaam home"
          >
            <Logo variant="compact" dark={overBoard} />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${linkClass}`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Guests only see this once they have an order saved on this device. */}
            {!isAuthenticated && guestOrderCount > 0 && (
              <Link
                to="/track"
                className={`hidden min-h-[42px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors duration-[var(--dur-fast)] sm:inline-flex ${linkClass}`}
              >
                <Package className="h-4 w-4" aria-hidden />
                Your orders
              </Link>
            )}

            {/* The cart is the one action that matters, so it is the one filled button. */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={
                hasCart
                  ? "inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-[var(--dur-fast)] hover:bg-accent"
                  : `relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ${
                      overBoard
                        ? "text-chalk hover:bg-chalk/10"
                        : "text-body hover:bg-surface-sunken"
                    }`
              }
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            >
              <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
              {hasCart && (
                <span className="tnum whitespace-nowrap">
                  <span className="hidden sm:inline">Cart · </span>
                  PKR {formatAmount(cartTotal)}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  ref={accountTriggerRef}
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors duration-[var(--dur-fast)] ${quietButtonClass}`}
                >
                  <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="max-w-[8rem] truncate">{firstName}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-[var(--dur-fast)] ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account"
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-[var(--z-dropdown)] w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-e3)]"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {user?.email}
                      </p>
                      <Badge tone={ROLE_TONE[role]} size="sm">
                        {ROLE_LABEL[role]}
                      </Badge>
                    </div>
                    <Link
                      to="/dashboard"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex min-h-[44px] items-center gap-2.5 px-4 text-sm text-body transition-colors hover:bg-surface-sunken hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted" aria-hidden />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex min-h-[44px] items-center gap-2.5 px-4 text-sm text-body transition-colors hover:bg-surface-sunken hover:text-foreground"
                    >
                      <Package className="h-4 w-4 text-muted" aria-hidden />
                      {role === "buyer" ? "My orders" : "Orders"}
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex min-h-[44px] items-center gap-2.5 px-4 text-sm text-body transition-colors hover:bg-surface-sunken hover:text-foreground"
                    >
                      <UserCircle className="h-4 w-4 text-muted" aria-hidden />
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeMenus();
                        logout();
                      }}
                      className="flex min-h-[44px] w-full items-center gap-2.5 border-t border-border px-4 text-left text-sm text-body transition-colors hover:bg-surface-sunken hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4 text-muted" aria-hidden />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className={`hidden min-h-[42px] items-center rounded-xl border px-5 text-sm font-medium transition-colors duration-[var(--dur-fast)] sm:inline-flex ${quietButtonClass}`}
              >
                Sign in
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] md:hidden ${
                overBoard ? "text-chalk hover:bg-chalk/10" : "text-body hover:bg-surface-sunken"
              }`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet: every door spelled out, so nobody has to guess. */}
      {menuOpen && (
        <div
          id="site-menu"
          className="fixed inset-0 top-16 z-[var(--z-modal)] flex flex-col overflow-y-auto bg-surface px-4 pb-8 pt-4 md:hidden"
        >
          <nav className="flex flex-col">
            {LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMenus}
                className="flex min-h-[56px] items-center border-b border-border text-lg font-medium text-foreground"
              >
                {label}
              </a>
            ))}
            <Link
              to="/merchant"
              onClick={closeMenus}
              className="flex min-h-[56px] items-center gap-2.5 border-b border-border text-lg font-medium text-foreground"
            >
              <Store className="h-5 w-5 text-muted" aria-hidden />
              Sell on FixedDaam
            </Link>
            {!isAuthenticated && guestOrderCount > 0 && (
              <Link
                to="/track"
                onClick={closeMenus}
                className="flex min-h-[56px] items-center gap-2.5 border-b border-border text-lg font-medium text-foreground"
              >
                <Package className="h-5 w-5 text-muted" aria-hidden />
                Your orders
              </Link>
            )}
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-sunken px-4 py-3">
                  <p className="min-w-0 truncate text-sm text-body">{user?.email}</p>
                  <Badge tone={ROLE_TONE[role]} size="sm">
                    {ROLE_LABEL[role]}
                  </Badge>
                </div>
                <Link
                  to="/dashboard"
                  onClick={closeMenus}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground"
                >
                  Go to dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    logout();
                  }}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-border-strong px-6 font-medium text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={closeMenus}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-border-strong px-6 font-medium text-foreground"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
