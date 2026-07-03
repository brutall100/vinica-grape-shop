import type { CreatePaymentResult, OrderWithItems, PaymentProvider } from "./types";

/**
 * Montonio / Paysera integration stub.
 *
 * To enable Lithuanian bank payments:
 * 1. Sign up at https://montonio.com (or https://www.paysera.lt) and get API keys.
 * 2. Add MONTONIO_ACCESS_KEY / MONTONIO_SECRET_KEY to the environment.
 * 3. Implement createPayment below: create an order via the Montonio Orders API
 *    (https://docs.montonio.com) and return the paymentUrl it responds with.
 * 4. Add a webhook route (src/app/api/webhooks/montonio/route.ts) that verifies
 *    the order token (JWT signed with the secret key) and marks the order PAID —
 *    mirror src/app/api/webhooks/stripe/route.ts.
 * 5. Register the provider in src/lib/payments/index.ts.
 */
export const montonioProvider: PaymentProvider = {
  method: "MONTONIO",

  isConfigured() {
    return false; // flip once the steps above are done
  },

  async createPayment(_order: OrderWithItems, _returnUrl: string): Promise<CreatePaymentResult> {
    return { kind: "not-configured" };
  },
};
