import { cn } from "@/lib/cn";

/**
 * One vocabulary for order status across buyer, merchant and admin screens.
 * Label wording differs by audience; the color never does.
 */
export const ORDER_STATUS = {
  pending_verification: {
    tone: "warning",
    buyer: "Awaiting approval",
    merchant: "Awaiting approval",
    admin: "Needs review",
  },
  locked: { tone: "info", buyer: "Price locked", merchant: "New order", admin: "Approved" },
  ready: { tone: "success", buyer: "Ready for pickup", merchant: "Ready", admin: "Ready" },
  delivered: { tone: "neutral", buyer: "Collected", merchant: "Collected", admin: "Collected" },
  rejected: { tone: "danger", buyer: "Rejected", merchant: "Rejected", admin: "Rejected" },
};

const TONES = {
  neutral: "bg-surface-sunken text-body ring-border",
  info: "bg-info-soft text-info ring-info/20",
  success: "bg-success-soft text-success ring-success/20",
  warning: "bg-warning-soft text-warning ring-warning/25",
  danger: "bg-danger-soft text-danger ring-danger/20",
  brand: "bg-primary-soft text-primary-ink ring-primary/20",
};

/**
 * Badge: small status pill with a semantic tone.
 *
 * @param {Object} props
 * @param {"neutral"|"info"|"success"|"warning"|"danger"|"brand"} [props.tone="neutral"]
 * @param {"sm"|"md"} [props.size="md"]
 */
export function Badge({ tone = "neutral", size = "md", className, children, ...rest }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        TONES[tone] ?? TONES.neutral,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/**
 * StatusBadge: order status rendered for a given audience.
 *
 * @param {Object} props
 * @param {string} props.status - Raw status from the API
 * @param {"buyer"|"merchant"|"admin"} [props.audience="buyer"]
 */
export function StatusBadge({ status, audience = "buyer", size = "md", className }) {
  const config = ORDER_STATUS[status];
  if (!config) return null;
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config[audience] ?? config.buyer}
    </Badge>
  );
}
