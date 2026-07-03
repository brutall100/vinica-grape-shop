import type { Locale } from "@/i18n/routing";

export type LocalizedString = Record<Locale, string>;

/**
 * Picks the translation for the given locale from a JSON column,
 * falling back to Lithuanian (the source language) and then to any value.
 */
export function pickLocale(value: unknown, locale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const map = value as Partial<Record<string, string>>;
  return map[locale] || map.lt || Object.values(map).find(Boolean) || "";
}
