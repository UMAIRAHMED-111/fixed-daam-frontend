import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import { APP_NAME } from "../constants";

/**
 * The one drenched moment on the page. Orange carries the whole band, no card
 * floating inside a tinted section, no hedging neutrals around the edge.
 */
export function CtaSection() {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <Reveal>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-primary-foreground">
            Today&apos;s price, tomorrow&apos;s groceries.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-lg leading-relaxed text-primary-foreground/90">
            Join {APP_NAME}, lock what you need at the rate you see now, and collect it
            when it suits you.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to="/auth"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl bg-surface px-8 text-base font-semibold text-primary-ink shadow-[var(--shadow-e3)] transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-surface-sunken active:translate-y-px"
            >
              Create your account
            </Link>
            <a
              href="#shop"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-primary-foreground/40 px-8 text-base font-medium text-primary-foreground transition-colors duration-[var(--dur-fast)] hover:bg-primary-foreground/10"
            >
              Browse merchants
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
