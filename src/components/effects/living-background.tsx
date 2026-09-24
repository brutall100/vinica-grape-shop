"use client";

import { useEffect, useRef } from "react";
import { VINE_LEAF_SVG } from "./vine-leaf";

const LEAF_COLORS = ["var(--leaf-1)", "var(--leaf-2)", "var(--leaf-3)"];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Fixed, non-interactive background: sun + grape glows, trellis texture,
 * falling vine leaves and floating pollen. Every particle gets random size,
 * speed, delay and drift so the motion feels natural.
 */
export function LivingBackground() {
  const particles = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = particles.current;
    if (!layer) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const phone = window.matchMedia("(max-width: 640px)");

    const build = () => {
      layer.replaceChildren();
      if (reduceMotion.matches) return;

      // half the particles on phones
      const leafCount = phone.matches ? 7 : 14;
      const moteCount = phone.matches ? 12 : 24;

      for (let i = 0; i < leafCount; i++) {
        const dur = rand(16, 30);
        const leaf = document.createElement("span");
        leaf.className = "leaf";
        leaf.innerHTML = VINE_LEAF_SVG;
        leaf.style.cssText = [
          `--x:${rand(-5, 100).toFixed(1)}vw`,
          `--size:${rand(14, 34).toFixed(0)}px`,
          `--dur:${dur.toFixed(1)}s`,
          // negative delay: some leaves are already mid-fall on first paint
          `--delay:${(-rand(0, dur)).toFixed(1)}s`,
          `--drift:${rand(-18, 18).toFixed(0)}vw`,
          `--sway:${rand(12, 40).toFixed(0)}px`,
          `--sway-dur:${rand(2.5, 5).toFixed(1)}s`,
          `--r0:${rand(0, 360).toFixed(0)}deg`,
          `--spin:${rand(-160, 160).toFixed(0)}deg`,
          `--leaf-color:${LEAF_COLORS[i % LEAF_COLORS.length]}`,
        ].join(";");
        layer.appendChild(leaf);
      }

      for (let i = 0; i < moteCount; i++) {
        const dur = rand(10, 22);
        const mote = document.createElement("span");
        mote.className = "mote";
        mote.style.cssText = [
          `--x:${rand(0, 100).toFixed(1)}vw`,
          `--y:${rand(30, 105).toFixed(1)}vh`,
          `--size:${rand(2, 5).toFixed(1)}px`,
          `--dur:${dur.toFixed(1)}s`,
          `--delay:${(-rand(0, dur)).toFixed(1)}s`,
          `--drift:${rand(-8, 8).toFixed(1)}vw`,
          `--o:${rand(0.4, 0.9).toFixed(2)}`,
        ].join(";");
        layer.appendChild(mote);
      }
    };

    build();
    reduceMotion.addEventListener("change", build);
    phone.addEventListener("change", build);
    return () => {
      reduceMotion.removeEventListener("change", build);
      phone.removeEventListener("change", build);
    };
  }, []);

  return (
    <div className="living-bg" aria-hidden>
      <div className="living-bg__glow living-bg__glow--sun" />
      <div className="living-bg__glow living-bg__glow--grape" />
      <div className="living-bg__trellis" />
      <div ref={particles} className="living-bg__particles" />
    </div>
  );
}
