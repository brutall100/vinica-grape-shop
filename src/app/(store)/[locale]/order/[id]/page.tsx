import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
};

export const metadata: Metadata = { robots: { index: false } };

const statusVariant: Record<string, "vine" | "amber" | "blue" | "stone" | "red"> = {
  PENDING: "amber",
  PAID: "vine",
  SHIPPED: "blue",
  COMPLETED: "vine",
  CANCELLED: "red",
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { paid } = await searchParams;
  setRequestLocale(locale as never);

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const t = await getTranslations("order");
  const tCheckout = await getTranslations("checkout");
  const paidView = order.status !== "PENDING" || paid === "1";
  const destination =
    order.terminalName ?? [order.address, order.city, order.postalCode].filter(Boolean).join(", ");

  return (
    <div className="container-shop max-w-2xl py-10 sm:py-16">
      <div className="text-center">
        <div
          className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
            paidView ? "bg-vine-100 text-vine-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {paidView ? (
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          ) : (
            <Clock className="h-8 w-8" aria-hidden />
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-900">
          {paidView ? t("thankYouTitle") : t("paymentPendingTitle")}
        </h1>
        <p className="mt-2 text-stone-600">
          {paidView ? t("thankYouText", { email: order.customerEmail }) : t("paymentPendingText")}
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="font-bold text-stone-900">
            {t("orderNumber")} {order.number}
          </span>
          <Badge variant={statusVariant[order.status]}>{t(`status.${order.status}`)}</Badge>
        </p>
      </div>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-3 font-display text-lg font-bold text-stone-900">{t("itemsTitle")}</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 py-2.5">
              <span className="text-stone-700">
                {item.nameSnapshot} × {item.quantity}
              </span>
              <span className="font-semibold text-stone-900">
                {formatPrice(item.unitPriceCents * item.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">{t("shippingTitle")}</dt>
            <dd className="font-semibold">{formatPrice(order.shippingCents, locale)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-900">
            <dt>{tCheckout("total")}</dt>
            <dd>{formatPrice(order.totalCents, locale)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-6 text-sm">
        <h2 className="mb-2 font-display text-lg font-bold text-stone-900">{t("shippingTitle")}</h2>
        <p className="text-stone-700">{destination}</p>
        <p className="mt-1 text-stone-500">
          {order.customerName} · {order.customerPhone}
        </p>
      </section>

      <div className="mt-8 text-center">
        <Link href="/catalog" className={buttonClasses("primary", "md")}>
          {t("backToShop")}
        </Link>
      </div>
    </div>
  );
}
