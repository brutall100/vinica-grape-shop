import { defineRouting } from "next-intl/routing";

export const locales = ["lt", "en", "ru", "pl"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "lt",
  localePrefix: "as-needed",
  // The URL alone determines the language (better for SEO and predictability);
  // visitors switch languages with the header control.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/catalog": {
      lt: "/katalogas",
      en: "/catalog",
      ru: "/katalog",
      pl: "/katalog",
    },
    "/products/[slug]": {
      lt: "/produktas/[slug]",
      en: "/products/[slug]",
      ru: "/product/[slug]",
      pl: "/produkt/[slug]",
    },
    "/cart": {
      lt: "/krepselis",
      en: "/cart",
      ru: "/korzina",
      pl: "/koszyk",
    },
    "/checkout": {
      lt: "/atsiskaitymas",
      en: "/checkout",
      ru: "/oformlenie",
      pl: "/zamowienie",
    },
    "/order/[id]": {
      lt: "/uzsakymas/[id]",
      en: "/order/[id]",
      ru: "/zakaz/[id]",
      pl: "/zamowienie/[id]",
    },
    "/about": {
      lt: "/apie-mus",
      en: "/about",
      ru: "/o-nas",
      pl: "/o-nas",
    },
    "/delivery": {
      lt: "/pristatymas",
      en: "/delivery",
      ru: "/dostavka",
      pl: "/dostawa",
    },
    "/privacy": {
      lt: "/privatumo-politika",
      en: "/privacy-policy",
      ru: "/politika-konfidencialnosti",
      pl: "/polityka-prywatnosci",
    },
    "/terms": {
      lt: "/taisykles",
      en: "/terms",
      ru: "/pravila",
      pl: "/regulamin",
    },
  },
});
