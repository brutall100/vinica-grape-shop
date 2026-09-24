import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale } from "@/lib/localized";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { Snowflake } from "lucide-react";
import type { CatalogProduct } from "@/lib/products";

export async function ProductCard({
  product,
  locale,
}: {
  product: CatalogProduct;
  locale: string;
}) {
  const t = await getTranslations("attributes");
  const tc = await getTranslations("common");
  const name = pickLocale(product.name, locale);
  const image = product.images[0];
  const onSale = product.salePriceCents != null && product.salePriceCents < product.priceCents;

  return (
    <Link
      href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}
      className="group leaf-card flex w-full flex-col overflow-hidden border border-stone-200 bg-white"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-dark">
        {image && (
          <Image
            src={image.url}
            alt={image.alt || name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {onSale && <Badge variant="wine">{tc("sale")}</Badge>}
          {product.stock <= 0 && <Badge variant="stone">{tc("outOfStock")}</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-vine-700">
          {name}
        </h3>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge variant="vine">{t(`usageValues.${product.usage}`)}</Badge>
          {product.frostResistance != null && (
            <Badge variant="blue">
              <Snowflake className="mr-1 h-3 w-3" aria-hidden />
              {product.frostResistance} °C
            </Badge>
          )}
          {product.seedless && <Badge variant="amber">{t("seedless")}</Badge>}
        </div>
        <div className="mt-auto pt-1">
          <Price
            priceCents={product.priceCents}
            salePriceCents={product.salePriceCents}
            locale={locale}
            className="text-lg text-stone-900"
          />
        </div>
      </div>
    </Link>
  );
}
