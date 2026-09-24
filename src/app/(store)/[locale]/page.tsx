import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localizedAlternates } from "@/lib/seo";
import { getFeaturedProducts, getCategories, getStoreStats } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { ProductCard } from "@/components/store/product-card";
import { HeroVine } from "@/components/store/hero-vine";
import { CountUp } from "@/components/effects/count-up";
import { pickLocale } from "@/lib/localized";
import { buttonClasses } from "@/components/ui/button";
import { VineLeaf } from "@/components/effects/vine-leaf";
import { Sprout, ShieldCheck, MessageCircleHeart, PackageCheck, ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localizedAlternates("/", locale) };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as never);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [featured, categories, settings, stats] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getStoreSettings(),
    getStoreStats(),
  ]);

  const why = [
    { icon: Sprout, title: t("why1Title"), text: t("why1Text") },
    { icon: ShieldCheck, title: t("why2Title"), text: t("why2Text") },
    { icon: MessageCircleHeart, title: t("why3Title"), text: t("why3Text") },
    { icon: PackageCheck, title: t("why4Title"), text: t("why4Text") },
  ];

  const heroStats = [
    { value: stats.varieties, text: String(stats.varieties), label: t("statVarieties") },
    ...(stats.coldestFrost != null
      ? [
          {
            value: stats.coldestFrost,
            text: `${stats.coldestFrost < 0 ? "−" : ""}${Math.abs(stats.coldestFrost)} °C`,
            label: t("statFrost"),
          },
        ]
      : []),
    { value: stats.categories, text: String(stats.categories), label: t("statCategories") },
  ];

  return (
    <div>
      {/* Hero — text sits on a glassy panel above the live vineyard background */}
      <section className="container-shop grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div className="hero-panel p-6 sm:p-10" data-reveal>
          <p className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-vine-700 uppercase">
            <VineLeaf className="h-4 w-4" /> {tc("tagline")}
          </p>
          <h1 className="font-display text-4xl leading-tight font-bold text-stone-900 sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className={buttonClasses("primary", "lg")}>
              {t("heroCta")} <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
            </Link>
            <Link href="/about" className={buttonClasses("outline", "lg")}>
              {t("heroSecondary")}
            </Link>
          </div>
          <dl className="mt-9 grid grid-cols-3 gap-3 border-t border-stone-200 pt-6">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold text-wine-700 sm:text-3xl">
                  <CountUp value={stat.value}>{stat.text}</CountUp>
                </dd>
                <dd aria-hidden className="mt-1 text-xs leading-snug text-stone-500 sm:text-sm">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto hidden aspect-[400/420] w-full max-w-md lg:block">
          <HeroVine />
        </div>
      </section>

      {/* Featured products */}
      <section className="container-shop py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4" data-reveal>
          <h2 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("featuredTitle")}
          </h2>
          <Link
            href="/catalog"
            className="link-arrow hidden items-center gap-1 text-sm font-semibold text-vine-700 hover:text-vine-800 sm:flex"
          >
            {tc("viewAll")} <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {featured.map((product, i) => (
            <div
              key={product.id}
              data-reveal
              className="flex"
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <ProductCard product={product} locale={locale} />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/catalog" className={buttonClasses("outline", "md")}>
            {tc("viewAll")}
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream-dark/60 py-12 backdrop-blur-[2px] sm:py-16">
        <div className="container-shop">
          <h2
            className="mb-8 font-display text-2xl font-bold text-stone-900 sm:text-3xl"
            data-reveal
          >
            {t("categoriesTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={{ pathname: "/catalog", query: { category: category.slug } }}
                className="group leaf-card link-arrow border border-stone-200 bg-white p-6"
                data-reveal
                style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-vine-700">
                  {pickLocale(category.name, locale)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                  {pickLocale(category.description, locale)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-vine-700">
                  <CountUp value={category._count.products}>
                    {String(category._count.products)}
                  </CountUp>
                  <ArrowRight className="btn-arrow h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-shop py-12 sm:py-16">
        <h2
          className="mb-10 text-center font-display text-2xl font-bold text-stone-900 sm:text-3xl"
          data-reveal
        >
          {t("whyTitle")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="leaf-card leaf-card-hover border border-stone-200 bg-white p-6 text-center"
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl rounded-bl-md bg-vine-100 text-vine-700">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mb-2 font-bold text-stone-900">{title}</h3>
              <p className="text-sm leading-relaxed text-stone-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-shop pb-4">
        <div
          className="relative overflow-hidden rounded-[2rem] rounded-bl-lg bg-deep-grape px-6 py-12 text-center sm:px-12 sm:py-16"
          data-reveal
        >
          <VineLeaf className="absolute -top-6 -right-6 h-32 w-32 rotate-12 text-on-deep opacity-10" />
          <h2 className="relative font-display text-2xl font-bold text-on-deep sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-on-deep-muted">{t("ctaText")}</p>
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="btn relative mt-7 inline-flex h-12 items-center rounded-full bg-on-deep px-7 text-base font-semibold text-deep-grape"
            >
              {t("ctaButton")}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
