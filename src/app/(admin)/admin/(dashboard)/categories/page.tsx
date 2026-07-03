import { prisma } from "@/lib/prisma";
import { CategoryManager, type CategoryRow } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

function toLocalized(value: unknown): Record<"lt" | "en" | "ru" | "pl", string> {
  const map = (value ?? {}) as Partial<Record<string, string>>;
  return { lt: map.lt ?? "", en: map.en ?? "", ru: map.ru ?? "", pl: map.pl ?? "" };
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: toLocalized(c.name),
    description: toLocalized(c.description),
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Kategorijos</h1>
      <CategoryManager categories={rows} />
    </div>
  );
}
