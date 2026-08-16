import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Minimal checkout header, no shop nav, so nothing competes with completing the order.
 */
export function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center opacity-90 transition hover:opacity-100"
          aria-label="FixedDaam home"
        >
          <Logo variant="compact" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted sm:inline-flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Secure checkout
          </span>
          <Link
            to="/#shop"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-medium text-body transition hover:bg-surface-sunken hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Keep shopping
          </Link>
        </div>
      </div>
    </header>
  );
}
