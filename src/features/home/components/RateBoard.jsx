import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, Lock } from "lucide-react";
import { formatAmount } from "@/lib/money";
import { formatTenor, getTenorExpiry, getUom } from "@/features/dashboard/data/uomData";

/**
 * What one unit of the price is, short enough for a board column. The merchant's
 * own bundle label ("Butter Bundle - 5 Pieces") is too long to survive here, so
 * bundles fall back to their composition.
 */
const boardUnit = (p) => {
  if (p.uom !== "bundle") return `per ${getUom(p.uom).short}`;
  const inner = p.bundleUom ? getUom(p.bundleUom) : null;
  if (!p.bundleSize) return "per pack";
  if (!inner || inner.value === "each") return `per pack of ${p.bundleSize}`;
  return `per pack of ${p.bundleSize} × ${inner.short}`;
};

/**
 * The rate board.
 *
 * A kiryana's price board, with the one column a bazaar board can't have: how
 * long the price is good for. Every figure here comes from the live catalogue —
 * the merchant's price, the merchant's tenor, and the date that tenor lands on
 * if you buy today. Nothing is illustrative, so nothing has to be disclaimed.
 *
 * (It used to show a made-up "bazaar" column climbing above the locked price.
 * Invented comparison numbers read as invented, which undercuts the one thing
 * this board is for: being believable about price.)
 *
 * @param {Object} props
 * @param {Array} props.products - Live catalogue items
 * @param {boolean} props.hasLoaded - Whether the catalogue fetch has settled
 */
export function RateBoard({ products = [], hasLoaded = false }) {
  // One clock reading for the whole board, so the header date and every
  // "till" date agree with each other.
  const now = useMemo(() => new Date(), []);

  const rows = useMemo(() => {
    // One line per staple. Two sizes of the same butter would read as padding,
    // not as a basket, so keep the first of each distinct item.
    const seen = new Set();
    const distinct = products.filter((p) => {
      const staple = String(p.name).split(/[\s,-]+/)[0].toLowerCase();
      if (seen.has(staple)) return false;
      seen.add(staple);
      return true;
    });

    return distinct.slice(0, 3).map((p) => {
      const expiry = getTenorExpiry(p, now);
      return {
        id: p.id,
        name: p.name,
        unit: boardUnit(p),
        price: Number(p.price) || 0,
        tenor: formatTenor(p),
        till: expiry
          ? expiry.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              ...(expiry.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
            })
          : null,
      };
    });
  }, [products, now]);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Rows get chalked on one after another, then the stamp comes down on top.
  const [written, setWritten] = useState(() => (reduceMotion ? 99 : 0));
  const [stamped, setStamped] = useState(() => reduceMotion);

  // Only rows that aren't on the board yet get written. A later refetch must not
  // blank the board and chalk it again — the catalogue reloading is not an event
  // a reader needs animated at them.
  const writtenRef = useRef(written);
  const write = (n) => {
    writtenRef.current = Math.max(writtenRef.current, n);
    setWritten(writtenRef.current);
  };

  useEffect(() => {
    if (reduceMotion || rows.length === 0) return undefined;
    const from = writtenRef.current;
    if (from >= rows.length) {
      setStamped(true);
      return undefined;
    }

    const timers = rows.slice(from).map((_, k) =>
      setTimeout(() => write(from + k + 1), 260 + k * 220)
    );
    const stampTimer = setTimeout(() => setStamped(true), 320 + (rows.length - from) * 220);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(stampTimer);
    };
  }, [rows.length, reduceMotion]);

  const today = now.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const isLoading = !hasLoaded && rows.length === 0;
  const total = products.length;
  // Nothing on the board expires: say that once down the whole column instead of
  // stamping "no expiry" on every line.
  const allOpen = rows.length > 0 && rows.every((r) => !r.tenor);

  // When the shops last touched a rate. Real freshness beats a "live" badge
  // that means nothing, so it goes next to the item count.
  const lastSet = useMemo(() => {
    const newest = products.reduce((max, p) => {
      const t = new Date(p.updatedAt ?? p.createdAt ?? 0).getTime();
      return Number.isFinite(t) && t > max ? t : max;
    }, 0);
    if (!newest) return null;
    const midnight = (d) => new Date(d).setHours(0, 0, 0, 0);
    const days = Math.round((midnight(now) - midnight(newest)) / 86400000);
    if (days <= 0) return "set today";
    if (days === 1) return "set yesterday";
    return `set ${new Date(newest).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  }, [products, now]);

  return (
    <figure className="relative w-full max-w-[30rem]">
      <div className="overflow-hidden rounded-2xl bg-board-raised ring-1 ring-board-line/60 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-baseline justify-between gap-4 border-b border-board-line/60 px-5 py-3.5">
          <p className="label-cap text-chalk-dim">Rate board</p>
          <p className="label-cap tnum text-chalk-dim">
            {rows.length > 0 && (
              <span className="mr-2 inline-flex items-center gap-1.5 text-stamp">
                <span className="relative flex h-1.5 w-1.5">
                  {!reduceMotion && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stamp opacity-70" />
                  )}
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-stamp" />
                </span>
                Live
              </span>
            )}
            {today}
          </p>
        </div>

        <table className="w-full">
          <caption className="sr-only-text">
            Today&apos;s rates from shops on FixedDaam, with how long each price
            is held after you buy it.
          </caption>
          <thead>
            <tr className="label-cap text-chalk-dim">
              <th scope="col" className="px-5 pb-2 pt-3 text-left font-bold">
                Item
              </th>
              <th scope="col" className="whitespace-nowrap px-2 pb-2 pt-3 text-right font-bold">
                Your daam
                {/* Currency belongs on the board, but not at the cost of a
                    three-line header on a phone. */}
                <span className="hidden font-medium opacity-70 sm:inline"> PKR</span>
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-5 pb-2 pt-3 text-right font-bold text-stamp"
              >
                Held for
              </th>
            </tr>
          </thead>
          <tbody className="text-display">
            {isLoading &&
              [0, 1, 2].map((i) => (
                <tr key={i} className="border-t border-board-line/40">
                  <td className="px-5 py-[1.35rem]" colSpan={3}>
                    <span
                      className="block h-3.5 animate-pulse rounded bg-chalk/10"
                      style={{ width: `${80 - i * 12}%`, animationDelay: `${i * 160}ms` }}
                    />
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr className="border-t border-board-line/40">
                <td className="px-5 py-8 text-center" colSpan={3}>
                  <p className="font-sans text-sm text-chalk-dim">
                    Shops are still posting today&apos;s rates. The board fills in
                    as they list.
                  </p>
                </td>
              </tr>
            )}

            {rows.map((row, i) => (
              <tr
                key={row.id}
                className={`border-t border-board-line/40 ${
                  reduceMotion
                    ? ""
                    : "transition-[opacity,transform] duration-500 ease-[var(--ease-out-quart)]"
                } ${written > i ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
              >
                <td className="max-w-[10.5rem] px-5 py-3 font-sans normal-case tracking-normal">
                  <span className="block truncate text-sm font-medium text-chalk">
                    {row.name}
                  </span>
                  {row.unit && (
                    <span className="mt-0.5 block truncate text-xs text-chalk-dim">
                      {row.unit}
                    </span>
                  )}
                </td>
                <td className="tnum px-2 py-3 text-right align-top text-2xl text-chalk">
                  {formatAmount(row.price).replace(".00", "")}
                </td>
                {allOpen ? (
                  i === 0 && (
                    <td
                      className="border-l border-board-line/40 px-5 text-center align-middle"
                      rowSpan={rows.length}
                    >
                      <span className="block whitespace-nowrap text-xl leading-none text-stamp">
                        No expiry
                      </span>
                      <span className="mt-1.5 block font-sans text-xs normal-case tracking-normal text-chalk-dim">
                        collect any time
                      </span>
                    </td>
                  )
                ) : (
                  <td className="px-5 py-3 text-right align-top">
                    <span className="tnum block whitespace-nowrap text-xl text-stamp">
                      {row.tenor || "No expiry"}
                    </span>
                    <span className="mt-0.5 block whitespace-nowrap font-sans text-xs normal-case tracking-normal text-chalk-dim">
                      {row.till ? `till ${row.till}` : "collect any time"}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="flex items-start gap-2 border-t border-board-line/40 py-3 pl-5 pr-24 font-sans text-xs leading-relaxed text-chalk-dim sm:pr-28">
          {rows.length > 0 ? (
            <>
              <CalendarClock className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {allOpen
                  ? "Pay today’s daam, collect whenever you’re ready — in one visit or five."
                  : "Pay today’s daam, collect inside your window — in one visit or five."}{" "}
                <a href="#shop" className="font-medium text-chalk underline underline-offset-2">
                  {total} {total === 1 ? "item" : "items"} on the board
                </a>
                {lastSet ? `, rates ${lastSet}.` : "."}
              </span>
            </>
          ) : (
            <>
              <Lock className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Every rate posted here is held for the window the shop sets on it.
              </span>
            </>
          )}
        </p>
      </div>

      {/* The stamp: pressed once on load, then it just sits there like ink. */}
      <div
        className={`pointer-events-none absolute -bottom-4 right-2 sm:-right-5 ${
          reduceMotion ? "" : "transition-all duration-500 ease-[var(--ease-out-expo)]"
        } ${stamped ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
        style={{ transform: `rotate(-9deg) ${stamped ? "scale(1)" : "scale(1.25)"}` }}
        aria-hidden
      >
        <div className="flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full border-[3px] border-stamp/90 bg-board/85 text-center backdrop-blur-[1px] sm:h-24 sm:w-24">
          <span className="label-cap text-[0.5rem] text-stamp">Fixed</span>
          <span className="text-display text-2xl leading-none text-stamp sm:text-3xl">
            Daam
          </span>
          <span className="mt-0.5 font-sans text-[0.6rem] font-semibold tracking-wide text-stamp">
            دام
          </span>
        </div>
      </div>
    </figure>
  );
}
