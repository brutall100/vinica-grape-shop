import { Resend } from "resend";
import type { OrderWithItems } from "@/lib/payments/types";
import { formatPrice } from "@/lib/format";

const subjects: Record<string, (n: number) => string> = {
  lt: (n) => `Jūsų užsakymas Nr. ${n} gautas – Vinica`,
  en: (n) => `Your order no. ${n} has been received – Vinica`,
  ru: (n) => `Ваш заказ № ${n} получен – Vinica`,
  pl: (n) => `Twoje zamówienie nr ${n} zostało przyjęte – Vinica`,
};

const headings: Record<string, { thanks: string; items: string; shipping: string; total: string }> =
  {
    lt: { thanks: "Ačiū už užsakymą!", items: "Prekės", shipping: "Pristatymas", total: "Iš viso" },
    en: {
      thanks: "Thank you for your order!",
      items: "Items",
      shipping: "Shipping",
      total: "Total",
    },
    ru: { thanks: "Спасибо за заказ!", items: "Товары", shipping: "Доставка", total: "Итого" },
    pl: {
      thanks: "Dziękujemy za zamówienie!",
      items: "Produkty",
      shipping: "Dostawa",
      total: "Razem",
    },
  };

// E-mail clients do not support CSS variables, so the palette is repeated here.
// Keep in sync with :root in src/app/globals.css.
const EMAIL_COLORS = { text: "#2a2118", heading: "#4f7a2b", border: "#e4dccc" };

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );

function orderEmailHtml(order: OrderWithItems): string {
  const locale = order.locale in headings ? order.locale : "lt";
  const h = headings[locale];
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 12px 6px 0">${escapeHtml(i.nameSnapshot)} × ${i.quantity}</td><td style="padding:6px 0;text-align:right">${formatPrice(i.unitPriceCents * i.quantity, locale)}</td></tr>`,
    )
    .join("");
  const destination =
    order.terminalName ?? [order.address, order.city, order.postalCode].filter(Boolean).join(", ");

  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:${EMAIL_COLORS.text}">
  <h1 style="color:${EMAIL_COLORS.heading}">${h.thanks}</h1>
  <p><strong>Nr. ${order.number}</strong></p>
  <h3>${h.items}</h3>
  <table style="width:100%;border-collapse:collapse">${rows}
    <tr><td style="padding:6px 12px 6px 0;border-top:1px solid ${EMAIL_COLORS.border}">${h.shipping}</td><td style="padding:6px 0;text-align:right;border-top:1px solid ${EMAIL_COLORS.border}">${formatPrice(order.shippingCents, locale)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;font-weight:bold">${h.total}</td><td style="padding:6px 0;text-align:right;font-weight:bold">${formatPrice(order.totalCents, locale)}</td></tr>
  </table>
  <h3>${h.shipping}</h3>
  <p>${escapeHtml(destination)}</p>
</div>`;
}

/**
 * Sends the order confirmation email via Resend. Without RESEND_API_KEY the
 * email is logged to the server console instead, so development keeps working.
 */
export async function sendOrderConfirmation(order: OrderWithItems): Promise<void> {
  const locale = order.locale in subjects ? order.locale : "lt";
  const subject = subjects[locale](order.number);
  const html = orderEmailHtml(order);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email] (Resend not configured) To: ${order.customerEmail} — ${subject}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Vinica <onboarding@resend.dev>",
      to: order.customerEmail,
      subject,
      html,
    });
  } catch (error) {
    // Never fail an order because the confirmation email bounced
    console.error("[email] Failed to send order confirmation:", error);
  }
}
