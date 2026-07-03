import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/localized";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Naujas produktas</h1>
      <ProductForm
        images={[]}
        categories={categories.map((c) => ({ id: c.id, name: pickLocale(c.name, "lt") }))}
      />
    </div>
  );
}
