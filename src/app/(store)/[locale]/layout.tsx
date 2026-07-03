import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, locales, type Locale } from "@/i18n/routing";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "cyrillic"],
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

  return (
    <html lang={locale} className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
