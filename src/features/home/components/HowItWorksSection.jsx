import { Reveal } from "@/components/ui/Reveal";
import { HOW_IT_WORKS_STEPS } from "../constants";

/**
 * Lock, send proof, reach out. A genuine sequence, so it is set as a pickup
 * slip: three stubs on one perforated strip, numbered because the order matters.
 */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-display text-[clamp(2.25rem,5vw,3.25rem)] text-foreground">
            Three steps, then the price stops moving
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-body">
            No app to install and no card kept on file. Pay once, send us the
            screenshot, and ask for delivery whenever it suits you.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-0">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.08}
              className={`relative rounded-xl bg-surface-sunken p-6 sm:rounded-none ${
                i > 0
                  ? "sm:border-l-2 sm:border-dashed sm:border-border-strong"
                  : ""
              }`}
            >
              {/* Punched hole where the stub would tear */}
              {i > 0 && (
                <span
                  className="absolute -left-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-surface sm:block"
                  aria-hidden
                />
              )}
              <span className="text-display tnum block text-4xl text-primary">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold tracking-[-0.01em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-body">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
