import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const shippingLabels: Record<string, string> = {
  OMNIVA: "Omniva paštomatas",
  LP_EXPRESS: "LP Express paštomatas",
  COURIER: "Kurjeris",
};

const paymentLabels: Record<string, string> = {
  STRIPE: "Stripe (kortelė)",
  MONTONIO: "Montonio (bankas)",
};

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-stone-500 hover:text-vine-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Visi užsakymai
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Užsakymas #{order.number}</h1>
          <p className="text-sm text-stone-500">
            {order.createdAt.toLocaleString("lt-LT")} · {paymentLabels[order.paymentMethod]}
            {order.paidAt && ` · apmokėta ${order.paidAt.toLocaleString("lt-LT")}`}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 font-bold">Pirkėjas</h2>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm">
            <a href={`mailto:${order.customerEmail}`} className="text-vine-700">
              {order.customerEmail}
            </a>
          </p>
          <p className="text-sm">
            <a href={`tel:${order.customerPhone.replace(/\s/g, "")}`} className="text-vine-700">
              {order.customerPhone}
            </a>
          </p>
          {order.note && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {order.note}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 font-bold">Pristatymas</h2>
          <p className="text-sm font-semibold">{shippingLabels[order.shippingMethod]}</p>
          <p className="text-sm text-stone-600">
            {order.terminalName ??
              [order.address, order.city, order.postalCode].filter(Boolean).join(", ")}
          </p>
          {order.terminalId && (
            <p className="mt-1 text-xs text-stone-400">Terminalo ID: {order.terminalId}</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-3 font-bold">Prekės</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2.5">
              <span>
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span className="font-semibold">
                {formatPrice(item.unitPriceCents * item.quantity, "lt")}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Tarpinė suma</dt>
            <dd className="font-semibold">{formatPrice(order.subtotalCents, "lt")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Pristatymas</dt>
            <dd className="font-semibold">{formatPrice(order.shippingCents, "lt")}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Iš viso</dt>
            <dd>{formatPrice(order.totalCents, "lt")}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
