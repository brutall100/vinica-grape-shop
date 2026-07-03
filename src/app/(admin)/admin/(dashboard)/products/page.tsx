import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { pickLocale } from "@/lib/localized";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Produktai</h1>
        <Link href="/admin/products/new" className={buttonClasses("primary", "sm")}>
          <Plus className="h-4 w-4" aria-hidden /> Naujas produktas
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-500 uppercase">
              <th className="px-4 py-2.5">Produktas</th>
              <th className="px-4 py-2.5">Kategorija</th>
              <th className="px-4 py-2.5">Kaina</th>
              <th className="px-4 py-2.5">Likutis</th>
              <th className="px-4 py-2.5">Būsena</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 font-semibold text-vine-700"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    {pickLocale(product.name, "lt")}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-stone-600">
                  {pickLocale(product.category.name, "lt")}
                </td>
                <td className="px-4 py-2.5 font-semibold">
                  {formatPrice(product.salePriceCents ?? product.priceCents, "lt")}
                  {product.salePriceCents != null && (
                    <s className="ml-1.5 text-xs font-normal text-stone-400">
                      {formatPrice(product.priceCents, "lt")}
                    </s>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={product.stock <= 5 ? "font-bold text-amber-600" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex gap-1.5">
                    <Badge variant={product.published ? "vine" : "stone"}>
                      {product.published ? "Publikuotas" : "Paslėptas"}
                    </Badge>
                    {product.featured && <Badge variant="amber">TOP</Badge>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
