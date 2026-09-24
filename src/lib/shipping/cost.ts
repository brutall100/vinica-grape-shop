import type { ShippingMethod } from "@prisma/client";
import type { StoreSettings } from "@/lib/settings";

export function shippingCostCents(
  method: ShippingMethod,
  subtotalCents: number,
  settings: StoreSettings,
): number {
  if (settings.freeShippingFromCents != null && subtotalCents >= settings.freeShippingFromCents) {
    return 0;
  }
  switch (method) {
    case "OMNIVA":
      return settings.omnivaPriceCents;
    case "LP_EXPRESS":
      return settings.lpExpressPriceCents;
    case "COURIER":
      return settings.courierPriceCents;
  }
}
