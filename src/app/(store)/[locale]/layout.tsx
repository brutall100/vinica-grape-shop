import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, locales, type Locale } from "@/i18n/routing";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { LivingBackground } from "@/components/effects/living-background";
import { ThemeScript } from "@/components/effects/theme-script";
import { UiEffects } from "@/components/effects/ui-effects";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("homeTitle"),
      template: "%s | Vinica",
    },
    description: t("homeDescription"),
    openGraph: {
      type: "website",
      siteName: "Vinica",
      locale,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();
  setRequestLocale(locale as Locale);
  const tc = await getTranslations({ locale, namespace: "common" });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vinica",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vinica",
    url: siteUrl,
    inLanguage: ["lt", "en", "ru", "pl"],
  };

  return (
    <html
      lang={locale}
      data-theme="light"
      className={`${manrope.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main" className="skip-link">
          {tc("skipToContent")}
        </a>
        <LivingBackground />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <NextIntlClientProvider>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
        <UiEffects />
      </body>
    </html>
  );
}
