import Stripe from "stripe";
import type { CreatePaymentResult, OrderWithItems, PaymentProvider } from "./types";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) stripeClient = new Stripe(key);
  return stripeClient;
}

export const stripeProvider: PaymentProvider = {
  method: "STRIPE",

  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },

  async createPayment(order: OrderWithItems, returnUrl: string): Promise<CreatePaymentResult> {
    const stripe = getStripe();
    if (!stripe) return { kind: "not-configured" };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: [
        ...order.items.map((item) => ({
          price_data: {
            currency: "eur",
            product_data: { name: item.nameSnapshot },
            unit_amount: item.unitPriceCents,
          },
          quantity: item.quantity,
        })),
        ...(order.shippingCents > 0
          ? [
              {
                price_data: {
                  currency: "eur",
                  product_data: { name: "Pristatymas / Shipping" },
                  unit_amount: order.shippingCents,
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      success_url: `${returnUrl}?paid=1`,
      cancel_url: `${returnUrl}?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour to pay
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { kind: "redirect", url: session.url };
  },
};
