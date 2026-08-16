import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { formatAmount } from "@/lib/money";

/**
 * The rate board.
 *
 * A kiryana's price board, except one column has stopped moving. Bazaar rates
 * climb while the locked column sits still under a stamp. This is the whole
 * product argument, so it gets to be the loudest thing on the site.
 *
 * The bazaar column is illustrative, not a market feed, and says so.
 *
 * @param {Object} props
 * @param {Array} props.products - Real catalogue items; falls back to staples
 */
export function RateBoard({ products = [] }) {
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

    const source = distinct.length
      ? distinct.slice(0, 3)
      : [
          { id: "a", name: "Cooking oil, 5 L", price: 4200 },
          { id: "b", name: "Rice, 10 kg", price: 3600 },
          { id: "c", name: "Washing powder, 1 kg", price: 850 },
        ];
    // A steady, deterministic climb per row, so the board reads as a market
    // that has moved rather than random noise.
    return source.map((p, i) => {
      const drift = [0.14, 0.09, 0.11, 0.07][i % 4];
      return {
        id: p.id,
        name: p.name,
        locked: Number(p.price) || 0,
        market: Math.round((Number(p.price) || 0) * (1 + drift)),
      };
    });
  }, [products]);

  const [shown, setShown] = useState(() => rows.map((r) => r.locked));
  const [bumped, setBumped] = useState(null);
  const [stamped, setStamped] = useState(false);
  const frameRef = useRef(null);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Count the bazaar column up from the locked price to today's rate, once.
  useEffect(() => {
    if (reduceMotion) {
      setShown(rows.map((r) => r.market));
      setStamped(true);
      return undefined;
    }

    setShown(rows.map((r) => r.locked));
    const start = performance.now();
    const DURATION = 1400;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      // ease-out-quart, so the climb decelerates into the final rate
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(rows.map((r) => Math.round(r.locked + (r.market - r.locked) * eased)));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    const stampTimer = setTimeout(() => setStamped(true), 900);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      clearTimeout(stampTimer);
    };
  }, [rows, reduceMotion]);

  // After the climb, nudge one row every few seconds. The point is that the
  // bazaar never settles, which is exactly what the locked column answers.
  useEffect(() => {
    if (reduceMotion || rows.length === 0) return undefined;
    let i = 0;
    const interval = setInterval(() => {
      const index = i % rows.length;
      i += 1;
      setShown((current) =>
        current.map((value, idx) => (idx === index ? value + Math.max(1, Math.round(value * 0.004)) : value))
      );
      setBumped(index);
      setTimeout(() => setBumped(null), 900);
    }, 3200);
    return () => clearInterval(interval);
  }, [rows.length, reduceMotion]);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <figure className="relative w-full max-w-[30rem]">
      <div className="overflow-hidden rounded-2xl bg-board-raised ring-1 ring-board-line/60 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-baseline justify-between gap-4 border-b border-board-line/60 px-5 py-3.5">
          <p className="label-cap text-chalk-dim">Rate board</p>
          <p className="label-cap tnum text-chalk-dim">{today}</p>
        </div>

        <table className="w-full">
          <caption className="sr-only-text">
            Today&apos;s bazaar rates compared with the price FixedDaam holds for
            you. Bazaar figures are illustrative.
          </caption>
          <thead>
            <tr className="label-cap text-chalk-dim">
              <th scope="col" className="px-5 pb-2 pt-3 text-left font-bold">
                Item
              </th>
              <th scope="col" className="px-2 pb-2 pt-3 text-right font-bold">
                Bazaar
              </th>
              <th scope="col" className="px-5 pb-2 pt-3 text-right font-bold text-stamp">
                Your daam
              </th>
            </tr>
          </thead>
          <tbody className="text-display">
            {rows.map((row, i) => (
              <tr key={row.id} className="border-t border-board-line/40">
                <td className="max-w-[11rem] truncate px-5 py-3 font-sans text-sm font-medium normal-case tracking-normal text-chalk">
                  {row.name}
                </td>
                <td
                  className="tnum px-2 py-3 text-right text-2xl text-chalk-dim"
                  aria-hidden
                >
                  <span
                    className={`inline-flex items-center gap-1 transition-colors duration-500 ${
                      bumped === i ? "text-danger" : ""
                    }`}
                  >
                    <ArrowUp
                      className={`h-3.5 w-3.5 transition-opacity duration-500 ${
                        bumped === i ? "opacity-100" : "opacity-45"
                      }`}
                    />
                    {formatAmount(shown[i] ?? row.market).replace(".00", "")}
                  </span>
                </td>
                <td className="tnum px-5 py-3 text-right text-2xl text-chalk">
                  {formatAmount(row.locked).replace(".00", "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="border-t border-board-line/40 py-3 pl-5 pr-24 font-sans text-xs leading-relaxed text-chalk-dim sm:pr-28">
          Your daam is what you pay at checkout and what you collect at, however
          long you wait. Bazaar figures shown for comparison.
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
