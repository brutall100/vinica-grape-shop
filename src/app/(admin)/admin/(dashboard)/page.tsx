import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Euro, ShoppingCart, Package, TriangleAlert } from "lucide-react";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "vine" | "amber" | "blue" | "stone" | "red"> = {
  PENDING: "amber",
  PAID: "vine",
  SHIPPED: "blue",
  COMPLETED: "vine",
  CANCELLED: "red",
};

const statusLabels: Record<string, string> = {
  PENDING: "Laukia apmokėjimo",
  PAID: "Apmokėtas",
  SHIPPED: "Išsiųstas",
  COMPLETED: "Įvykdytas",
  CANCELLED: "Atšauktas",
};

export default async function AdminDashboardPage() {
  const [orderCount, newOrders, revenue, lowStock, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
      _sum: { totalCents: true },
    }),
    prisma.product.count({ where: { published: true, stock: { lte: 5 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  const stats = [
    {
      label: "Pajamos (apmokėta)",
      value: formatPrice(revenue._sum.totalCents ?? 0, "lt"),
      icon: Euro,
    },
    { label: "Užsakymai iš viso", value: String(orderCount), icon: ShoppingCart },
    { label: "Laukia išsiuntimo", value: String(newOrders), icon: Package },
    { label: "Senka likutis (≤5)", value: String(lowStock), icon: TriangleAlert },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Suvestinė</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">{label}</p>
              <Icon className="h-5 w-5 text-stone-400" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-bold">Naujausi užsakymai</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-vine-700">
            Visi užsakymai →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-stone-500">Užsakymų dar nėra.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-xs text-stone-500 uppercase">
                  <th className="px-5 py-2.5">Nr.</th>
                  <th className="px-5 py-2.5">Pirkėjas</th>
                  <th className="px-5 py-2.5">Suma</th>
                  <th className="px-5 py-2.5">Būsena</th>
                  <th className="px-5 py-2.5">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-5 py-3 font-semibold">
                      <Link href={`/admin/orders/${order.id}`} className="text-vine-700">
                        #{order.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{order.customerName}</td>
                    <td className="px-5 py-3 font-semibold">
                      {formatPrice(order.totalCents, "lt")}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-stone-500">
                      {order.createdAt.toLocaleDateString("lt-LT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
