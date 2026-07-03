import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/localized";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

function toLocalized(value: unknown): Record<"lt" | "en" | "ru" | "pl", string> {
  const map = (value ?? {}) as Partial<Record<string, string>>;
  return { lt: map.lt ?? "", en: map.en ?? "", ru: map.ru ?? "", pl: map.pl ?? "" };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const initial: ProductFormData = {
    id: product.id,
    slug: product.slug,
    name: toLocalized(product.name),
    description: toLocalized(product.description),
    growingInfo: toLocalized(product.growingInfo),
    priceEur: (product.priceCents / 100).toFixed(2),
    salePriceEur: product.salePriceCents != null ? (product.salePriceCents / 100).toFixed(2) : "",
    stock: product.stock,
    published: product.published,
    featured: product.featured,
    categoryId: product.categoryId,
    ripening: product.ripening,
    frostResistance: product.frostResistance != null ? String(product.frostResistance) : "",
    berryColor: product.berryColor,
    usage: product.usage,
    seedless: product.seedless,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{pickLocale(product.name, "lt")}</h1>
      <ProductForm
        initial={initial}
        images={product.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt }))}
        categories={categories.map((c) => ({ id: c.id, name: pickLocale(c.name, "lt") }))}
      />
    </div>
  );
}
