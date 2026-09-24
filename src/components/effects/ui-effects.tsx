"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Site-wide micro-interactions:
 * - ripple on every `.btn`
 * - fade/slide-in for `[data-reveal]` when scrolled into view
 */
export function UiEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(".btn");
      if (!target || reducedMotion() || (target as HTMLButtonElement).disabled) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      ripple.addEventListener("animationend", () => ripple.remove());
      target.appendChild(ripple);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
