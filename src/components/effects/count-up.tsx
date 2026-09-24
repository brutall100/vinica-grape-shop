"use client";

import { useEffect, useRef } from "react";

/**
 * Shows `children` (e.g. "−35 °C") and, when scrolled into view, counts the
 * number inside it up from zero. The final text is server-rendered, so it is
 * correct without JavaScript and for search engines.
 */
export function CountUp({ value, children }: { value: number; children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1200);
        const current = Math.round(value * (1 - Math.pow(1 - t, 3)));
        el.textContent =
          t < 1
            ? children.replace(/[−-]?\d+/, current < 0 ? `−${-current}` : String(current))
            : children;
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      run();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = children;
    };
  }, [value, children]);

  return <span ref={ref}>{children}</span>;
}
