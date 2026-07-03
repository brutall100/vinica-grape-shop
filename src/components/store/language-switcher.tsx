"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = { lt: "LT", en: "EN", ru: "RU", pl: "PL" };
const names: Record<string, string> = {
  lt: "Lietuvių",
  en: "English",
  ru: "Русский",
  pl: "Polski",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function switchTo(nextLocale: string) {
    setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace({ pathname, params } as any, { locale: nextLocale as (typeof locales)[number] });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 cursor-pointer items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" aria-hidden />
        {labels[locale]}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-stone-50",
                  l === locale ? "font-bold text-vine-700" : "text-stone-700",
                )}
              >
                {names[l]}
                <span className="text-xs text-stone-400">{labels[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
