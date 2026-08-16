import { Link } from "react-router-dom";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { AuthForm } from "./components/AuthForm";

/**
 * Merchant sign-in.
 *
 * Deliberately unlike the buyer page: it sits on the board surface, so a
 * shopkeeper and a shopper can tell at a glance which door they are at. Same
 * form underneath, different role sent to the API.
 */
export function MerchantAuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-board px-4 py-12 [padding-bottom:max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="label-cap text-stamp">For shops</p>
          <h1 className="text-display mt-2 text-[clamp(2.25rem,7vw,3rem)] text-chalk">
            Sell on FixedDaam
          </h1>
          <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-chalk-dim">
            Take payment up front, hold the goods, and hand them over when the buyer
            shows their code.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] sm:p-8">
          <AuthForm authType="merchant" />
        </div>
      </div>

      <Link
        to="/auth"
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-chalk-dim transition-colors hover:bg-chalk/10 hover:text-chalk"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Here to shop instead? Go to buyer sign-in
      </Link>

      <Link
        to="/"
        className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-chalk-dim/80 transition-colors hover:bg-chalk/10 hover:text-chalk"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Back to the shop
      </Link>
    </div>
  );
}
