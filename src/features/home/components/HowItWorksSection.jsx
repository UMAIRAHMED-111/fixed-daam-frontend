import { Reveal } from "@/components/ui/Reveal";
import { HOW_IT_WORKS_STEPS } from "../constants";

/**
 * Three ordered steps, the numbers carry real information here (you cannot
 * collect before you pay), so the sequence is the layout rather than three cards.
 */
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-[-0.03em] text-foreground">
            Three steps, then the price stops moving
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-body">
            No app to install, no card on file. Pay once, keep the code, collect when it
            suits you.
          </p>
        </Reveal>

        <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.08}
              className="relative border-t-2 border-foreground pt-5"
            >
              <span className="tnum block text-sm font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-[-0.01em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[38ch] leading-relaxed text-body">
                {step.description}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
