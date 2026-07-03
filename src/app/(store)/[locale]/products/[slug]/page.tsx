import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { pickLocale } from "@/lib/localized";
import { Price, effectivePriceCents } from "@/components/store/price";
import { ProductGallery } from "@/components/store/product-gallery";
import { AddToCart } from "@/components/store/add-to-cart";
import { ProductCard } from "@/components/store/product-card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Snowflake } from "lucide-react";
import { getPathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const name = pickLocale(product.name, locale);
  const description = pickLocale(product.description, locale).slice(0, 160);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] =
      siteUrl + getPathname({ locale: l, href: { pathname: "/products/[slug]", params: { slug } } });
  }

  return {
    title: name,
    description,
    alternates: {
      canonical: languages[locale],
      languages,
    },
    openGraph: {
      title: name,
      description,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as never);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const ta = await getTranslations("attributes");
  const tc = await getTranslations("common");

  const name = pickLocale(product.name, locale);
  const description = pickLocale(product.description, locale);
  const growingInfo = pickLocale(product.growingInfo, locale);
  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  const attributes: [string, string][] = [
    [ta("usage"), ta(`usageValues.${product.usage}`)],
    [ta("ripening"), ta(`ripeningValues.${product.ripening}`)],
    [ta("berryColor"), ta(`berryColorValues.${product.berryColor}`)],
    ...(product.frostResistance != null
      ? ([[ta("frostResistance"), `${product.frostResistance} °C`]] as [string, string][])
      : []),
    [ta("seedless"), product.seedless ? ta("yes") : ta("no")],
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productUrl =
    siteUrl + getPathname({ locale: locale as never, href: { pathname: "/products/[slug]", params: { slug } } });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description.slice(0, 300),
    image: product.images.map((i) => siteUrl + i.url),
    url: productUrl,
    brand: { "@type": "Brand", name: "Vinica" },
    offers: {
      "@type": "Offer",
      price: (effectivePriceCents(product) / 100).toFixed(2),
      priceCurrency: "EUR",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("breadcrumbHome"),
        item: siteUrl + getPathname({ locale: locale as never, href: "/" }),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("breadcrumbCatalog"),
        item: siteUrl + getPathname({ locale: locale as never, href: "/catalog" }),
      },
      { "@type": "ListItem", position: 3, name, item: productUrl },
    ],
  };

  return (
    <div className="container-shop py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-stone-500">
        <Link href="/" className="hover:text-vine-700">
          {t("breadcrumbHome")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href="/catalog" className="hover:text-vine-700">
          {t("breadcrumbCatalog")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="font-semibold text-stone-800">{name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
          name={name}
        />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="vine">{pickLocale(product.category.name, locale)}</Badge>
            {product.frostResistance != null && (
              <Badge variant="blue">
                <Snowflake className="mr-1 h-3 w-3" aria-hidden />
                {product.frostResistance} °C
              </Badge>
            )}
            {product.seedless && <Badge variant="amber">{ta("seedless")}</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            {name}
          </h1>

          <div className="mt-4">
            <Price
              priceCents={product.priceCents}
              salePriceCents={product.salePriceCents}
              locale={locale}
              className="text-3xl text-stone-900"
            />
          </div>

          <p className="mt-2 text-sm font-semibold">
            {product.stock > 0 ? (
              product.stock <= 5 ? (
                <span className="text-amber-700">{tc("lowStock", { count: product.stock })}</span>
              ) : (
                <span className="text-vine-700">{tc("inStock")}</span>
              )
            ) : (
              <span className="text-stone-500">{tc("outOfStock")}</span>
            )}
          </p>

          <div className="mt-6">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                name,
                priceCents: effectivePriceCents(product),
                image: product.images[0]?.url ?? null,
                maxStock: product.stock,
              }}
            />
          </div>

          <section className="mt-8">
            <h2 className="mb-2 font-display text-xl font-bold text-stone-900">
              {t("description")}
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-stone-700">{description}</p>
          </section>

          {growingInfo && (
            <section className="mt-6">
              <h2 className="mb-2 font-display text-xl font-bold text-stone-900">
                {t("growingInfo")}
              </h2>
              <p className="leading-relaxed whitespace-pre-line text-stone-700">{growingInfo}</p>
            </section>
          )}

          <section className="mt-6">
            <h2 className="mb-3 font-display text-xl font-bold text-stone-900">
              {t("attributes")}
            </h2>
            <dl className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
              {attributes.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-stone-900">
            {t("relatedTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
