import { z } from "zod";

export const checkoutSchema = z
  .object({
    name: z.string().trim().min(3, "nameRequired").max(120),
    email: z.string().trim().email("emailInvalid").max(200),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{8,20}$/, "phoneInvalid"),
    shippingMethod: z.enum(["OMNIVA", "LP_EXPRESS", "COURIER"]),
    terminalId: z.string().trim().max(64).optional(),
    terminalName: z.string().trim().max(200).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional(),
    note: z.string().trim().max(1000).optional(),
    locale: z.enum(["lt", "en", "ru", "pl"]),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, "cartEmpty"),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "COURIER") {
      if (!data.address) {
        ctx.addIssue({ code: "custom", path: ["address"], message: "addressRequired" });
      }
      if (!data.city) {
        ctx.addIssue({ code: "custom", path: ["city"], message: "cityRequired" });
      }
      if (!data.postalCode) {
        ctx.addIssue({ code: "custom", path: ["postalCode"], message: "postalCodeRequired" });
      }
    } else if (!data.terminalId) {
      ctx.addIssue({ code: "custom", path: ["terminalId"], message: "terminalRequired" });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
