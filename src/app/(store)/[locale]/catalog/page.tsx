import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCatalogProducts, getCategories, parseCatalogFilters } from "@/lib/products";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { pickLocale } from "@/lib/localized";
import { localizedAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("catalogTitle"),
    description: t("catalogDescription"),
    alternates: localizedAlternates("/catalog", locale),
  };
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as never);
  const t = await getTranslations("catalog");

  const filters = parseCatalogFilters(await searchParams);
  const [products, categories] = await Promise.all([getCatalogProducts(filters), getCategories()]);

  return (
    <div className="container-shop py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-stone-600">{t("subtitle")}</p>
      </header>

      <CatalogFilters
        categories={categories.map((c) => ({ slug: c.slug, name: pickLocale(c.name, locale) }))}
        values={filters}
      />

      <p className="mb-4 text-sm text-stone-500" aria-live="polite">
        {t("resultsCount", { count: products.length })}
      </p>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">
          {t("noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
