import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Public address of the shop. Uses NEXT_PUBLIC_SITE_URL when set, otherwise the
 * production domain Vercel provides automatically, otherwise localhost.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

type Href = Parameters<typeof getPathname>[0]["href"];

/**
 * Builds canonical + hreflang alternates for a localized route,
 * e.g. /katalogas ↔ /en/catalog ↔ /ru/katalog ↔ /pl/katalog.
 */
export function localizedAlternates(href: Href, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = siteUrl + getPathname({ locale: l, href });
  }
  languages["x-default"] = languages.lt;
  return {
    canonical: languages[locale as Locale],
    languages,
  };
}
