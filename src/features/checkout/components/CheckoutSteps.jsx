import { Check } from "lucide-react";
import { CHECKOUT_STAGES } from "../constants";

/**
 * Numbered stage rail: Contact → Delivery → Payment → Place order.
 * Completed stages are clickable so shoppers can go back and edit.
 *
 * @param {Object} props
 * @param {number} props.currentIndex - Index of the active stage
 * @param {number} props.reachedIndex - Furthest stage the shopper may open
 * @param {(stageId: string) => void} props.onSelect
 */
export function CheckoutSteps({ currentIndex, reachedIndex, onSelect }) {
  const current = CHECKOUT_STAGES[currentIndex];

  return (
    <nav aria-label="Checkout progress" className="mb-6 sm:mb-8">
      {/* Mobile: one line + a progress bar, instead of a rail that wraps to two rows. */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{current?.step}</p>
          <p className="tnum text-xs text-muted">
            Step {currentIndex + 1} of {CHECKOUT_STAGES.length}
          </p>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out-quart)]"
            style={{
              width: `${((currentIndex + 1) / CHECKOUT_STAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <ol className="hidden flex-wrap items-center gap-y-2 text-sm sm:flex">
        {CHECKOUT_STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index < currentIndex;
          const canOpen = index <= reachedIndex && !isCurrent;

          return (
            <li key={stage.id} className="flex items-center">
              <button
                type="button"
                onClick={() => canOpen && onSelect(stage.id)}
                disabled={!canOpen}
                aria-current={isCurrent ? "step" : undefined}
                className={`inline-flex min-h-[36px] items-center gap-2 rounded-lg px-2 py-1 transition ${
                  canOpen ? "hover:bg-surface-sunken" : "cursor-default"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrent
                        ? "bg-primary text-white"
                        : "bg-surface-sunken text-muted"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                </span>
                <span
                  className={`font-medium ${
                    isCurrent
                      ? "text-foreground"
                      : isDone
                        ? "text-body"
                        : "text-muted"
                  }`}
                >
                  {stage.step}
                </span>
              </button>
              {index < CHECKOUT_STAGES.length - 1 && (
                <span className="mx-1 h-px w-4 bg-slate-200 sm:w-8" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
