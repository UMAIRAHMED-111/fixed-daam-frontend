/**
 * FixedDaam logo: a padlock mark plus the wordmark.
 *
 * The mark is inline SVG rather than the bitmap in /public, which is a JPEG
 * without transparency and shows a white box on dark surfaces. Inline also means
 * it stays crisp and can take the surrounding text colour.
 */
function LockMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
      <path
        d="M10 20V14a6 6 0 0 1 12 0v6"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <rect
        x="9"
        y="19"
        width="14"
        height="9"
        rx="2.5"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2"
      />
      <path
        d="M13 24l2.5 2.5L21 21"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {Object} props
 * @param {"default"|"compact"} [props.variant="default"] - compact hides the wordmark on phones
 * @param {boolean} [props.dark=false] - set on dark surfaces so the wordmark stays legible
 * @param {string} [props.className]
 */
export function Logo({ variant = "default", className = "", dark = false }) {
  const wordClass = dark ? "text-chalk" : "text-foreground";
  const accentClass = dark ? "text-stamp" : "text-primary";

  return (
    <span
      className={`inline-flex items-center gap-2.5 font-bold tracking-[-0.01em] ${className}`}
    >
      <LockMark className="h-8 w-8 shrink-0" />
      <span
        className={`text-lg sm:text-xl ${wordClass} ${
          variant === "compact" ? "hidden sm:inline" : ""
        }`}
      >
        Fixed<span className={accentClass}>Daam</span>
      </span>
    </span>
  );
}

/** Icon only, for tight spaces such as the footer. */
export function LogoIcon({ className = "h-8 w-8" }) {
  return <LockMark className={className} />;
}
