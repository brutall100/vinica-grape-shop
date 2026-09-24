import type { Order, OrderItem } from "@prisma/client";

export type OrderWithItems = Order & { items: OrderItem[] };

export type CreatePaymentResult = { kind: "redirect"; url: string } | { kind: "not-configured" };

export interface PaymentProvider {
  /** Machine name stored on the order (PaymentMethod enum value). */
  readonly method: "STRIPE" | "MONTONIO";
  /** Whether the required API keys are present. */
  isConfigured(): boolean;
  /** Creates a hosted payment page for the order and returns the redirect URL. */
  createPayment(order: OrderWithItems, returnUrl: string): Promise<CreatePaymentResult>;
}
