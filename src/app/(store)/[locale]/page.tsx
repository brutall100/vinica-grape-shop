import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFeaturedProducts, getCategories } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
import { ProductCard } from "@/components/store/product-card";
import { pickLocale } from "@/lib/localized";
import { buttonClasses } from "@/components/ui/button";
import { Sprout, ShieldCheck, MessageCircleHeart, PackageCheck, ArrowRight } from "lucide-react";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as never);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [featured, categories, settings] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getStoreSettings(),
  ]);

  const why = [
    { icon: Sprout, title: t("why1Title"), text: t("why1Text") },
    { icon: ShieldCheck, title: t("why2Title"), text: t("why2Text") },
    { icon: MessageCircleHeart, title: t("why3Title"), text: t("why3Text") },
    { icon: PackageCheck, title: t("why4Title"), text: t("why4Text") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-vine-950">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, #74994b 0, transparent 45%), radial-gradient(circle at 80% 20%, #873e48 0, transparent 45%)",
          }}
        />
        <div className="container-shop relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold tracking-widest text-vine-300 uppercase">
              {tc("tagline")}
            </p>
            <h1 className="font-display text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className={buttonClasses("primary", "lg")}>
                {t("heroCta")} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-12 items-center rounded-full border border-white/25 px-7 text-base font-semibold text-white hover:bg-white/10"
              >
                {t("heroSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-shop py-14 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("featuredTitle")}
          </h2>
          <Link
            href="/catalog"
            className="hidden items-center gap-1 text-sm font-semibold text-vine-700 hover:text-vine-800 sm:flex"
          >
            {tc("viewAll")} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/catalog" className={buttonClasses("outline", "md")}>
            {tc("viewAll")}
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-cream-dark py-14 sm:py-20">
        <div className="container-shop">
          <h2 className="mb-8 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            {t("categoriesTitle")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={{ pathname: "/catalog", query: { category: category.slug } }}
                className="group rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-vine-700">
                  {pickLocale(category.name, locale)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">
                  {pickLocale(category.description, locale)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-vine-700">
                  {category._count.products} <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-shop py-14 sm:py-20">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-stone-900 sm:text-3xl">
          {t("whyTitle")}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {why.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vine-100 text-vine-700">
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
        <div className="rounded-3xl bg-wine-800 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-wine-100">{t("ctaText")}</p>
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="mt-7 inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-wine-800 hover:bg-wine-50"
            >
              {t("ctaButton")}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
