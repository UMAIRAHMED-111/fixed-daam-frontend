import { cn } from "@/lib/cn";

/**
 * Skeleton: placeholder block that mirrors the shape of the content it replaces.
 * Product surfaces load into skeletons, not spinners: the layout shouldn't jump
 * once data lands.
 */
export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-surface-sunken", className)}
      aria-hidden
    />
  );
}

/** Row of skeletons matching the product/order card grid. */
export function SkeletonCards({ count = 6, className }) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="mt-4 h-3 w-16" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-4 h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Stack of skeleton rows matching a dense list/table. */
export function SkeletonRows({ count = 5, className }) {
  return (
    <div className={cn("space-y-px", className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-surface px-4 py-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
