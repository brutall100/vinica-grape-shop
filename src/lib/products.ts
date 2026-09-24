import { prisma } from "@/lib/prisma";
import type { BerryColor, GrapeUsage, Prisma, RipeningTime } from "@prisma/client";

export type CatalogFilters = {
  category?: string;
  color?: string;
  usage?: string;
  ripening?: string;
  seedless?: boolean;
  sort?: string;
};

const BERRY_COLORS = ["GREEN", "YELLOW", "PINK", "RED", "BLUE"];
const USAGES = ["TABLE", "WINE", "UNIVERSAL"];
const RIPENINGS = ["VERY_EARLY", "EARLY", "MEDIUM", "LATE"];

export function parseCatalogFilters(params: Record<string, string | string[] | undefined>) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const filters: CatalogFilters = {
    category: one(params.category) || undefined,
    color: BERRY_COLORS.includes(one(params.color) ?? "") ? one(params.color) : undefined,
    usage: USAGES.includes(one(params.usage) ?? "") ? one(params.usage) : undefined,
    ripening: RIPENINGS.includes(one(params.ripening) ?? "") ? one(params.ripening) : undefined,
    seedless: one(params.seedless) === "1" || undefined,
    sort: one(params.sort) || undefined,
  };
  return filters;
}

const sortOrders: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ priceCents: "asc" }],
  "price-desc": [{ priceCents: "desc" }],
  name: [{ slug: "asc" }],
};

export async function getCatalogProducts(filters: CatalogFilters) {
  return prisma.product.findMany({
    where: {
      published: true,
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.color ? { berryColor: filters.color as BerryColor } : {}),
      ...(filters.usage ? { usage: filters.usage as GrapeUsage } : {}),
      ...(filters.ripening ? { ripening: filters.ripening as RipeningTime } : {}),
      ...(filters.seedless ? { seedless: true } : {}),
    },
    orderBy: sortOrders[filters.sort ?? ""] ?? [{ featured: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
  });
}

export async function getFeaturedProducts(limit = 4) {
  return prisma.product.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return prisma.product.findMany({
    where: { published: true, categoryId, id: { not: productId } },
    take: limit,
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: true },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });
}

export type CatalogProduct = Awaited<ReturnType<typeof getCatalogProducts>>[number];

/** Numbers shown in the home page hero (they count up on screen). */
export async function getStoreStats() {
  const [varieties, frost, categories] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.product.aggregate({ where: { published: true }, _min: { frostResistance: true } }),
    prisma.category.count(),
  ]);
  return { varieties, coldestFrost: frost._min.frostResistance, categories };
}
