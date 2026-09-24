"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/checkout-schema";
import { getStoreSettings } from "@/lib/settings";
import { shippingCostCents } from "@/lib/shipping/cost";
import { getPaymentProvider } from "@/lib/payments";
import { sendOrderConfirmation } from "@/lib/email";
import { pickLocale } from "@/lib/localized";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export type CheckoutResult =
  { ok: true; redirectUrl: string } | { ok: false; error: string; field?: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: issue.path.join(".") };
  }
  const data = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) }, published: true },
  });
  if (products.length !== data.items.length) {
    return { ok: false, error: "stockChanged" };
  }

  const lines = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPriceCents =
      product.salePriceCents != null && product.salePriceCents < product.priceCents
        ? product.salePriceCents
        : product.priceCents;
    return { product, quantity: item.quantity, unitPriceCents };
  });

  for (const line of lines) {
    if (line.product.stock < line.quantity) {
      return { ok: false, error: "stockChanged" };
    }
  }

  const settings = await getStoreSettings();
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
  const shippingCents = shippingCostCents(data.shippingMethod, subtotalCents, settings);
  const provider = getPaymentProvider();

  // Reserve stock and create the order atomically; conditional decrement
  // prevents overselling under concurrent checkouts.
  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const updated = await tx.product.updateMany({
          where: { id: line.product.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) throw new Error("OUT_OF_STOCK");
      }
      const order = await tx.order.create({
        data: {
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          shippingMethod: data.shippingMethod,
          terminalId: data.terminalId || null,
          terminalName: data.terminalName || null,
          address: data.address || null,
          city: data.city || null,
          postalCode: data.postalCode || null,
          note: data.note || null,
          locale: data.locale,
          paymentMethod: provider.method,
          subtotalCents,
          shippingCents,
          totalCents: subtotalCents + shippingCents,
          items: {
            create: lines.map((l) => ({
              productId: l.product.id,
              nameSnapshot: pickLocale(l.product.name, data.locale),
              unitPriceCents: l.unitPriceCents,
              quantity: l.quantity,
            })),
          },
        },
      });
      return order.id;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { ok: false, error: "stockChanged" };
    }
    console.error("placeOrder failed:", error);
    return { ok: false, error: "generic" };
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderPath = getPathname({
    locale: data.locale as Locale,
    href: { pathname: "/order/[id]", params: { id: order.id } },
  });
  const orderUrl = siteUrl + orderPath;

  if (provider.isConfigured()) {
    try {
      const payment = await provider.createPayment(order, orderUrl);
      if (payment.kind === "redirect") {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentId: null }, // session id is stored by the webhook
        });
        return { ok: true, redirectUrl: payment.url };
      }
    } catch (error) {
      console.error("Payment session creation failed:", error);
      // fall through: order stays PENDING, customer sees the order page
    }
  } else {
    // No payment provider configured (development / not yet connected):
    // keep the order PENDING and confirm by email so testing is possible.
    await sendOrderConfirmation(order);
  }

  return { ok: true, redirectUrl: orderPath };
}
