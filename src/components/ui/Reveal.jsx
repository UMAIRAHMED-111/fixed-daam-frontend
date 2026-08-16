import { useEffect, useLayoutEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll reveal that enhances an already-visible default.
 *
 * The element renders visible. Only after JS confirms it can animate (motion
 * allowed, IntersectionObserver present) does it hide itself, synchronously,
 * before paint, and then animate in when scrolled to. If JS never runs, the
 * observer never fires, or the renderer doesn't scroll (crawlers, headless
 * screenshots, print), the content is simply there.
 *
 * @param {Object} props
 * @param {number} [props.delay=0] - Seconds to stagger this item behind its siblings
 * @param {number} [props.y=14] - Distance in px to travel
 * @param {string} [props.as="div"] - Element to render
 */
export function Reveal({ delay = 0, y = 14, as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [shown, setShown] = useState(true);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    setCanAnimate(true);
    setShown(false);
  }, []);

  useEffect(() => {
    if (!canAnimate || shown) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    observer.observe(node);

    // Safety net: if the observer never fires (odd viewport, zero-height parent),
    // show the content anyway rather than leaving a blank section.
    const timer = setTimeout(() => setShown(true), 1200);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [canAnimate, shown]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: canAnimate
          ? `opacity var(--dur-slow) var(--ease-out-quart) ${delay}s, transform var(--dur-slow) var(--ease-out-quart) ${delay}s`
          : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
