/**
 * FixedDaam logo: FD mark image + wordmark. Use for nav and marketing.
 * @param {Object} props
 * @param {"default"|"compact"} [props.variant="default"] - compact hides wordmark on small screens
 * @param {string} [props.className]
 * @param {boolean} [props.dark] - no effect when using image logo
 */
export function Logo({ variant = "default", className = "", dark = false }) {
  const textClass = dark ? "text-white" : "text-foreground";
  const accentClass = dark ? "text-white" : "text-primary";

  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}
      aria-hidden
    >
      <img
        src="/logo.png"
        alt=""
        // Header is 4rem tall, the mark has to sit inside it, not overrun it.
        className="h-9 w-auto shrink-0 object-contain sm:h-10"
        width={40}
        height={40}
        fetchpriority="high"
      />
      <span className={`text-lg sm:text-xl ${textClass} hidden sm:inline`}>
        Fixed<span className={accentClass}>Daam</span>
      </span>
      {variant !== "compact" && (
        <span className={`text-lg sm:text-xl ${textClass} sm:hidden`}>
          Fixed<span className={accentClass}>Daam</span>
        </span>
      )}
    </span>
  );
}

/**
 * Icon-only: FD logo image. Use when only the mark is needed (e.g. footer).
 */
export function LogoIcon({ className = "h-8 w-auto" }) {
  return (
    <img
      src="/logo.png"
      alt="FixedDaam"
      className={`object-contain ${className}`}
      width={32}
      height={32}
    />
  );
}
