import { Lock, TrendingUp } from "lucide-react";

/**
 * The brand's physical object: a price ticket, stamped and locked.
 *
 * Reads as a receipt from the stall, tabular figures, hairline rules, one orange
 * stamp. The rising market price beside the locked one is the entire pitch in a
 * single glance.
 */
export function HeroVisual() {
  return (
    <div className="relative w-full max-w-[26rem]">
      {/* Ticket */}
      <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-e3)]">
        <div className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-5">
          <div>
            <p className="text-sm font-semibold text-foreground">Nurpur Butter · 200g</p>
            <p className="mt-0.5 text-xs text-muted">Fixed Daam · Karachi</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-primary-ink ring-1 ring-inset ring-primary/20">
            <Lock className="h-3 w-3" aria-hidden />
            Locked
          </span>
        </div>

        <div className="flex items-end justify-between gap-6 py-6">
          <div>
            <p className="text-xs font-medium text-muted">You paid</p>
            <p className="tnum mt-1 text-4xl font-extrabold tracking-[-0.03em] text-foreground">
              <span className="mr-1 align-top text-base font-bold text-muted">PKR</span>
              760
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-xs font-medium text-muted">
              <TrendingUp className="h-3.5 w-3.5 text-danger" aria-hidden />
              Market today
            </p>
            <p className="tnum mt-1 text-2xl font-bold text-muted line-through decoration-danger/60 decoration-2">
              880
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-success-soft px-4 py-3">
          <p className="text-sm font-semibold text-success">You&apos;re PKR 120 ahead</p>
          <p className="mt-0.5 text-xs text-body">
            Collect any time. Partial pickups welcome.
          </p>
        </div>

        {/* Perforation + stub, so the card reads as a real ticket */}
        <div className="relative mt-6 border-t border-dashed border-border pt-5">
          <span
            className="absolute -left-[29px] -top-2.5 h-5 w-5 rounded-full border border-border bg-background"
            aria-hidden
          />
          <span
            className="absolute -right-[29px] -top-2.5 h-5 w-5 rounded-full border border-border bg-background"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
                Pickup code
              </p>
              <p className="tnum mt-1 text-xl font-bold tracking-[0.2em] text-foreground">
                4 8 2 9 1 6
              </p>
            </div>
            <p className="text-right text-2xs leading-tight text-muted">
              Rotates every
              <br />
              30 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Grounding shadow so the ticket sits on the page rather than floating */}
      <div
        className="mx-auto mt-3 h-6 w-[85%] rounded-[50%] bg-foreground/[0.06] blur-xl"
        aria-hidden
      />
    </div>
  );
}
