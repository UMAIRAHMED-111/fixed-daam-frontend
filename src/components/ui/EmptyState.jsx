import { cn } from "@/lib/cn";

/**
 * EmptyState: teaches the screen instead of announcing absence.
 * Every empty view should say what belongs here and how to get one.
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - lucide icon component
 * @param {string} props.title - What's missing, in the user's words
 * @param {string} [props.description] - How to fill it
 * @param {React.ReactNode} [props.action] - Primary way forward
 */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-sunken text-muted">
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      )}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-body">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
