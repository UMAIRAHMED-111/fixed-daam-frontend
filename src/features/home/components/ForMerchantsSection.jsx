import { Link } from "react-router-dom";
import { Reveal } from "@/components/ui/Reveal";
import { MERCHANT_STEPS } from "../constants";

/**
 * Merchant pitch. Two columns: the argument on the left, the mechanics as a
 * ruled list on the right, no card grid, no repeated icon boxes.
 */
export function ForMerchantsSection() {
  return (
    <section
      id="for-merchants"
      className="scroll-mt-16 border-t border-border bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <h2 className="text-display text-[clamp(2.25rem,5vw,3.25rem)] text-foreground">
              Sell today. Hand over later.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body">
              Take payment up front, hold the stock, and hand it over when the customer
              shows their code. Cash in hand now, no card terminal, no chargebacks.
            </p>
            <Link
              to="/merchant"
              className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-[var(--shadow-brand)] transition-[background-color,transform] duration-[var(--dur-fast)] hover:bg-accent active:translate-y-px"
            >
              Open a merchant account
            </Link>
          </Reveal>

          <ol className="divide-y divide-border border-y border-border">
            {MERCHANT_STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={i * 0.06}
                className="flex gap-5 py-6"
              >
                <span className="tnum shrink-0 pt-1 text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-[-0.01em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-body">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
