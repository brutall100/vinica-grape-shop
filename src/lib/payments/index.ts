import type { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { montonioProvider } from "./montonio";

const providers: PaymentProvider[] = [stripeProvider, montonioProvider];

export function getPaymentProvider(): PaymentProvider {
  return providers.find((p) => p.isConfigured()) ?? stripeProvider;
}

export { stripeProvider, montonioProvider };
