import { useState } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  Store,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDeliverableQty } from "../data/uomData";

/**
 * Format a Date as a friendly relative-time label, falling back to a short
 * absolute date if it's older than a week.
 */
function relativeTime(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function fullTimestamp(input) {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Reusable pickup-history timeline.
 * @param {Array} history – pickup events from the order
 * @param {string} [hideMerchantId] – when set, hide the merchant label on entries
 *        from this merchant (avoids "Acme Store" repeating on the merchant's own page)
 * @param {string} [emptyHint] – text shown when there's no history yet
 * @param {boolean} [defaultOpen]
 */
export function PickupHistory({
  history,
  hideMerchantId = null,
  emptyHint = "No items collected yet.",
  defaultOpen = false,
}) {
  const events = Array.isArray(history) ? history : [];
  const [open, setOpen] = useState(defaultOpen);
  const hasEvents = events.length > 0;

  // Newest first.
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <div className="border-t border-slate-100 bg-slate-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-100/60 transition-colors"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <History className="h-4 w-4 text-primary" />
          Pickup history
          {hasEvents && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {sorted.length}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500">
          {!open && hasEvents && (
            <span>Last collected {relativeTime(sorted[0].at)}</span>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-4">
          {!hasEvents ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
              <Clock className="mx-auto mb-1 h-4 w-4 text-slate-300" />
              {emptyHint}
            </p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-slate-200 pl-5">
              {sorted.map((evt, idx) => {
                const showMerchant =
                  evt.merchantName &&
                  (!hideMerchantId ||
                    String(evt.merchantId) !== String(hideMerchantId));
                return (
                  <li key={idx} className="relative">
                    <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-50">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {relativeTime(evt.at)}
                        </p>
                        <p
                          className="text-[11px] text-slate-400"
                          title={fullTimestamp(evt.at)}
                        >
                          {fullTimestamp(evt.at)}
                        </p>
                      </div>
                      {showMerchant && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                          <Store className="h-3 w-3" />
                          {evt.merchantName}
                        </p>
                      )}
                      <ul className="mt-2 space-y-1">
                        {(evt.items || []).map((it, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="truncate text-slate-700">
                              {it.name}
                            </span>
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              + {formatDeliverableQty(it.quantity, it)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
