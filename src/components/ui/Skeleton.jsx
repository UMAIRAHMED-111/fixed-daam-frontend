import { cn } from "@/lib/cn";

/**
 * Skeleton: placeholder block that mirrors the shape of the content it replaces.
 * Surfaces load into skeletons, not spinners, so the layout doesn't jump once
 * data lands and the page never flashes an empty state on its way to being full.
 *
 * Every block is `aria-hidden`; the composed variants below carry a single
 * `role="status"` for the whole region, so a screen reader hears "Loading" once
 * per area instead of once per grey rectangle.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-skeleton", className)}
      aria-hidden
    />
  );
}

/**
 * One announced loading region, whatever shape sits inside it.
 *
 * @param {Object} props
 * @param {string} [props.label] - What is loading, for screen readers
 */
export function SkeletonRegion({ label = "Loading", className, children }) {
  return (
    <div className={className} role="status" aria-label={label}>
      {children}
    </div>
  );
}

/**
 * Lines of body copy. The last line is short, the way a real paragraph ends.
 *
 * @param {Object} props
 * @param {number} [props.lines]
 */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * The card grid itself, with no announced region around it, so it can nest
 * inside a larger loading region without stacking `role="status"` landmarks.
 */
function CardGrid({ count, className }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-1 flex-col p-4">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grid of product cards, mirroring `ProductCard`: 4:3 image, category, name, price. */
export function SkeletonCards({ count = 6, className, label = "Loading products" }) {
  return (
    <SkeletonRegion label={label}>
      <CardGrid count={count} className={className} />
    </SkeletonRegion>
  );
}

/** Stack of skeleton rows matching a dense list/table. */
export function SkeletonRows({ count = 5, className, label = "Loading" }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-px", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-surface px-4 py-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Order cards, mirroring `OrderCard`: status header, merchant-grouped items,
 * and the footer that carries the next step.
 */
export function SkeletonOrderCards({ count = 3, className, label = "Loading orders" }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-5 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="px-5 py-4">
            <Skeleton className="mb-3 h-3 w-28" />
            <div className="space-y-2.5">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3.5 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border px-5 py-4">
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * Expandable people rows, mirroring the admin buyer and merchant lists:
 * avatar, name, contact meta, and a stat block on the right.
 */
export function SkeletonPeopleRows({ count = 4, className, label = "Loading" }) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        >
          <div className="flex items-start gap-4 p-5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-40" />
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                <Skeleton className="h-3 w-44" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-5 shrink-0 rounded" />
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** The inline panel that opens under an admin row when it's expanded. */
export function SkeletonDetailPanel({ className, label = "Loading details" }) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("border-t border-border bg-surface-sunken/40 px-5 py-5", className)}
    >
      <Skeleton className="h-3.5 w-32" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/**
 * Product page, mirroring `ProductDetailPage`: square gallery beside the
 * title, price block, quantity control and the two actions.
 */
export function SkeletonProductDetail({ className, label = "Loading product" }) {
  return (
    <SkeletonRegion
      label={label}
      className={cn("flex flex-col gap-8 lg:flex-row lg:gap-12", className)}
    >
      <div className="flex-1">
        <Skeleton className="aspect-square w-full max-w-lg rounded-2xl" />
      </div>

      <div className="max-w-lg flex-1">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-3 h-9 w-4/5" />
        <Skeleton className="mt-3 h-3.5 w-40" />
        <SkeletonText className="mt-5" lines={2} />

        <div className="mt-6 border-y border-border py-5">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-3 h-3.5 w-24" />
          <Skeleton className="mt-4 h-3.5 w-full" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-3.5 w-20" />
          <div className="mt-2 flex items-center gap-3">
            <Skeleton className="h-11 w-28 rounded-lg" />
            <Skeleton className="h-3.5 w-36" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </SkeletonRegion>
  );
}

/** Products grouped under merchant headers, mirroring `MerchantSectionsView`. */
export function SkeletonMerchantSections({
  sections = 2,
  perSection = 3,
  className,
  label = "Loading products",
}) {
  return (
    <SkeletonRegion label={label} className={cn("space-y-10", className)}>
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i}>
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </div>
          <CardGrid count={perSection} className="sm:gap-5" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** A form card waiting on the record it's about to edit. */
export function SkeletonForm({ fields = 5, className, label = "Loading form" }) {
  return (
    <SkeletonRegion
      label={label}
      className={cn(
        "space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm",
        className
      )}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-24 rounded-2xl" />
      </div>
    </SkeletonRegion>
  );
}
