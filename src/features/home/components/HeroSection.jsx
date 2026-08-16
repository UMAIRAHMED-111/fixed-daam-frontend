import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { APP_NAME } from "../constants";
import { RateBoard } from "./RateBoard";

/**
 * The board hero: the only dark surface on the site. It states the argument in
 * the shop's own vernacular, then hands off to a bright storefront below.
 */
export function HeroSection() {
  const products = useInventoryStore((s) => s.products);

  return (
    <section className="relative overflow-hidden bg-board text-chalk">
      {/* Faint chalk grid, like a board that has been written on for years */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-40 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-36">
        <div>
          <h1 className="text-display text-[clamp(3.5rem,10vw,6rem)] text-chalk">
            Today&apos;s daam.
            <br />
            <span className="text-primary">Held.</span>
          </h1>

          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-chalk-dim">
            Pay for what you need at today&apos;s rate. Collect it from the shop when
            you are ready, in one visit or five. The price does not move again.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <a
              href="#shop"
              className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-accent active:translate-y-px"
            >
              See today&apos;s rates
              <ArrowRight
                className="h-4 w-4 transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)] group-hover:translate-x-1"
                aria-hidden
              />
            </a>
            <Link
              to="/merchant"
              className="inline-flex min-h-[54px] items-center justify-center gap-1.5 rounded-xl px-2 text-base font-medium text-chalk-dim underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-chalk hover:underline"
            >
              Or sell on {APP_NAME}
            </Link>
          </div>

          <p className="mt-7 text-sm text-chalk-dim">
            No account needed to browse, or to check out.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <RateBoard products={products} />
        </div>
      </div>
    </section>
  );
}
