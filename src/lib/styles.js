/**
 * Shared control styles. One vocabulary for every surface, if a button looks
 * different on two screens, one of them is wrong.
 *
 * Every interactive class covers default / hover / focus / active / disabled.
 */

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const INPUT_CLASS =
  `w-full min-h-[44px] rounded-xl border border-input bg-surface px-3.5 py-2.5 text-base text-foreground transition-[border-color,box-shadow] duration-[var(--dur-fast)] hover:border-border-strong ${FOCUS} focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted touch-manipulation sm:text-sm`;

export const SELECT_CLASS =
  `w-full min-h-[44px] rounded-xl border border-input bg-surface px-3.5 py-2.5 text-base text-foreground transition-[border-color,box-shadow] duration-[var(--dur-fast)] hover:border-border-strong ${FOCUS} focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-surface-sunken sm:text-sm`;

export const TEXTAREA_CLASS =
  `w-full min-h-[88px] rounded-xl border border-input bg-surface px-3.5 py-2.5 text-base text-foreground transition-[border-color,box-shadow] duration-[var(--dur-fast)] hover:border-border-strong ${FOCUS} focus-visible:border-primary resize-y sm:text-sm`;

const BUTTON_BASE =
  `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur-fast)] ${FOCUS} disabled:opacity-55 disabled:pointer-events-none active:translate-y-px touch-manipulation`;

export const BUTTON_PRIMARY_CLASS = `${BUTTON_BASE} bg-primary text-primary-foreground shadow-[var(--shadow-brand)] hover:bg-accent`;

export const BUTTON_SECONDARY_CLASS = `${BUTTON_BASE} border border-border-strong bg-surface text-foreground hover:bg-surface-sunken`;

export const BUTTON_TERTIARY_CLASS = `${BUTTON_BASE} text-body hover:bg-surface-sunken hover:text-foreground`;

export const BUTTON_DANGER_CLASS = `${BUTTON_BASE} border border-danger/25 bg-surface text-danger hover:bg-danger-soft`;

/** Size ramp shared by every button variant. */
export const BUTTON_SIZES = {
  sm: "min-h-[36px] px-3 text-sm",
  md: "min-h-[44px] px-4 text-sm",
  lg: "min-h-[52px] px-6 text-base",
};

/** Panel/card surface used across dashboards. */
export const PANEL_CLASS =
  "rounded-2xl border border-border bg-surface shadow-[var(--shadow-e1)]";
