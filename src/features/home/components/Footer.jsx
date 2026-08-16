import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/stores/authStore";
import { getGuestOrders } from "@/lib/guestOrders";

const SECTION_LINKS = [
  { href: "/#shop", label: "Shop" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-merchants", label: "For merchants" },
];

const LEGAL_LINKS = [
  { to: "/terms", label: "Terms" },
  { to: "/privacy", label: "Privacy" },
];

const linkClass =
  "flex min-h-[44px] items-center text-sm text-body transition-colors hover:text-foreground sm:min-h-0";

/**
 * Footer. Every door is listed here by name, so anyone who scrolled past the
 * header still knows where shoppers sign in and where shops do.
 */
export function Footer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hasGuestOrders, setHasGuestOrders] = useState(false);

  useEffect(() => {
    setHasGuestOrders(getGuestOrders().length > 0);
  }, []);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center transition-opacity hover:opacity-80"
              aria-label="FixedDaam home"
            >
              <Logo />
            </Link>
            <p className="mt-3 max-w-[34ch] text-sm text-body">
              Pay at today&apos;s price, collect when you are ready. The rate does not
              move while your order waits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-1 sm:gap-x-16">
            <nav aria-label="Site">
              <p className="label-cap mb-2 text-muted">Browse</p>
              {SECTION_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className={linkClass}>
                  {label}
                </a>
              ))}
            </nav>

            <nav aria-label="Accounts">
              <p className="label-cap mb-2 text-muted">Accounts</p>
              {isAuthenticated ? (
                <Link to="/dashboard" className={linkClass}>
                  Dashboard
                </Link>
              ) : (
                <Link to="/auth" className={linkClass}>
                  Sign in to buy
                </Link>
              )}
              <Link to="/merchant" className={linkClass}>
                Sell on FixedDaam
              </Link>
              {!isAuthenticated && hasGuestOrders && (
                <Link to="/track" className={linkClass}>
                  Your orders
                </Link>
              )}
              {LEGAL_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className={linkClass}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted">
          Pay now, buy later. Hedge against growing prices.
        </p>
      </div>
    </footer>
  );
}
