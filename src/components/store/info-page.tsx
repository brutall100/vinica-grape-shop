import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";

type InfoHref = "/about" | "/delivery" | "/privacy" | "/terms";

export async function infoMetadata(
  locale: string,
  metaKey: string,
  href?: InfoHref,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t(metaKey),
    ...(href ? { alternates: localizedAlternates(href, locale) } : {}),
  };
}

export async function InfoPage({
  locale,
  titleKey,
  bodyKey,
}: {
  locale: string;
  titleKey: string;
  bodyKey: string;
}) {
  setRequestLocale(locale as never);
  const t = await getTranslations("info");

  return (
    <article className="container-shop max-w-3xl py-10 sm:py-16">
      <h1 className="mb-6 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
        {t(titleKey)}
      </h1>
      <div className="text-base leading-relaxed whitespace-pre-line text-stone-700">
        {t(bodyKey)}
      </div>
    </article>
  );
}
