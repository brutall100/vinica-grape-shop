"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/** Light/dark switch. Remembers the choice; otherwise follows the system setting. */
export function ThemeToggle() {
  const t = useTranslations("nav");

  useEffect(() => {
    const system = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (!savedTheme()) applyTheme(system.matches ? "dark" : "light");
    };
    system.addEventListener("change", follow);
    return () => system.removeEventListener("change", follow);
  }, []);

  const toggle = () => {
    const next: Theme =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage unavailable (private mode) — the switch still works for this visit
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("toggleTheme")}
      title={t("toggleTheme")}
      className="theme-toggle relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
    >
      <Sun className="icon-sun h-5 w-5" aria-hidden />
      <Moon className="icon-moon h-5 w-5" aria-hidden />
    </button>
  );
}
