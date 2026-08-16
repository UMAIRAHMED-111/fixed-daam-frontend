import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Store } from "lucide-react";
import { AuthForm } from "./components/AuthForm";

/**
 * Buyer sign-in.
 *
 * Buyers and merchants sign in through separate doors. Sharing one card with a
 * role toggle meant people picked the wrong side and hit a role mismatch, so
 * each account type now gets a page that looks and reads like its own thing.
 */
export function AuthPage() {
  const [searchParams] = useSearchParams();

  // Old links carried ?type=merchant. Send those to the merchant door.
  if (searchParams.get("type") === "merchant") {
    return <Navigate to="/merchant" replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-12 [padding-bottom:max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-e2)] sm:p-8">
        <p className="label-cap text-primary">Shopping</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-foreground">
          Sign in to buy
        </h1>
        <p className="mt-1.5 text-sm text-body">
          Hold today&apos;s price, keep your pickup code, and see everything waiting for
          you at the shop.
        </p>

        <div className="mt-6">
          <AuthForm authType="buyer" />
        </div>
      </div>

      <Link
        to="/merchant"
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-body transition-colors hover:bg-surface-sunken hover:text-foreground"
      >
        <Store className="h-4 w-4 text-muted" aria-hidden />
        Selling on FixedDaam? Go to merchant sign-in
      </Link>

      <Link
        to="/"
        className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to the shop
      </Link>
    </div>
  );
}
