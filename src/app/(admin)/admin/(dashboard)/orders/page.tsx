import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, Prisma } from "@prisma/client";

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

const shippingLabels: Record<string, string> = {
  OMNIVA: "Omniva",
  LP_EXPRESS: "LP Express",
  COURIER: "Kurjeris",
};

const tabs: { value: string; label: string }[] = [
  { value: "", label: "Visi" },
  { value: "PENDING", label: "Laukia" },
  { value: "PAID", label: "Apmokėti" },
  { value: "SHIPPED", label: "Išsiųsti" },
  { value: "COMPLETED", label: "Įvykdyti" },
  { value: "CANCELLED", label: "Atšaukti" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where: Prisma.OrderWhereInput =
    status && status in statusLabels ? { status: status as OrderStatus } : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Užsakymai</h1>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold",
              (status ?? "") === tab.value
                ? "bg-vine-700 text-white"
                : "bg-white text-stone-600 hover:bg-stone-100",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-500 uppercase">
              <th className="px-4 py-2.5">Nr.</th>
              <th className="px-4 py-2.5">Pirkėjas</th>
              <th className="px-4 py-2.5">Prekės</th>
              <th className="px-4 py-2.5">Pristatymas</th>
              <th className="px-4 py-2.5">Suma</th>
              <th className="px-4 py-2.5">Būsena</th>
              <th className="px-4 py-2.5">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                  Užsakymų nėra.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/admin/orders/${order.id}`} className="text-vine-700">
                      #{order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-xs text-stone-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} vnt.
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {shippingLabels[order.shippingMethod]}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatPrice(order.totalCents, "lt")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {order.createdAt.toLocaleDateString("lt-LT")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
