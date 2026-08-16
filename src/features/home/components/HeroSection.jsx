import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "../constants";
import { HeroVisual } from "./HeroVisual";

const PROOF = [
  "No hidden fees",
  "Collect in parts",
  "Karachi delivery",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface">
      {/* A single warm bloom behind the type, the only decoration on this fold. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[-30%] h-[70%] bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,oklch(0.646_0.19_42/0.13),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="text-center lg:text-left">
          <h1 className="text-display text-[clamp(2.5rem,7vw,4.75rem)] text-foreground">
            Stop paying{" "}
            <span className="text-primary">tomorrow&apos;s prices</span> today.
          </h1>

          <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-body lg:mx-0">
            Pay once at today&apos;s rate. Your groceries wait with the merchant, your
            price stays put, and you collect whenever you&apos;re ready.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <a
              href="#shop"
              className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-accent active:translate-y-px"
            >
              Start shopping
              <ArrowRight
                className="h-4 w-4 transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)] group-hover:translate-x-1"
                aria-hidden
              />
            </a>
            <Link
              to="/auth?type=merchant"
              className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-border-strong bg-surface px-7 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-surface-sunken"
            >
              Sell on {APP_NAME}
            </Link>
          </div>

          {/* Hairline proof row, no icon boxes, no card. */}
          <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted lg:justify-start">
            {PROOF.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
