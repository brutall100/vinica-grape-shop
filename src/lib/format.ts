const localeMap: Record<string, string> = {
  lt: "lt-LT",
  en: "en-GB",
  ru: "ru-RU",
  pl: "pl-PL",
};

export function formatPrice(cents: number, locale = "lt"): string {
  return new Intl.NumberFormat(localeMap[locale] ?? "lt-LT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
