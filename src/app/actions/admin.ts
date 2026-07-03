"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { saveUpload } from "@/lib/storage";
import type { OrderStatus } from "@prisma/client";

const localizedSchema = z.object({
  lt: z.string().trim().min(1),
  en: z.string().trim(),
  ru: z.string().trim(),
  pl: z.string().trim(),
});

// Empty translations fall back to Lithuanian so the storefront never shows blanks
function fillLocalized(value: z.infer<typeof localizedSchema>) {
  return {
    lt: value.lt,
    en: value.en || value.lt,
    ru: value.ru || value.lt,
    pl: value.pl || value.lt,
  };
}

const productSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: localizedSchema,
  description: localizedSchema,
  growingInfo: localizedSchema.optional(),
  priceCents: z.number().int().min(1),
  salePriceCents: z.number().int().min(1).nullable(),
  stock: z.number().int().min(0),
  published: z.boolean(),
  featured: z.boolean(),
  categoryId: z.string().min(1),
  ripening: z.enum(["VERY_EARLY", "EARLY", "MEDIUM", "LATE"]),
  frostResistance: z.number().int().min(-50).max(0).nullable(),
  berryColor: z.enum(["GREEN", "YELLOW", "PINK", "RED", "BLUE"]),
  usage: z.enum(["TABLE", "WINE", "UNIVERSAL"]),
  seedless: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

function fail(error: unknown): ActionResult {
  console.error("Admin action failed:", error);
  const message = error instanceof Error ? error.message : "UNKNOWN";
  return { ok: false, error: message };
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = productSchema.parse(input);
    const payload = {
      slug: data.slug,
      name: fillLocalized(data.name),
      description: fillLocalized(data.description),
      growingInfo: data.growingInfo?.lt ? fillLocalized(data.growingInfo) : undefined,
      priceCents: data.priceCents,
      salePriceCents: data.salePriceCents,
      stock: data.stock,
      published: data.published,
      featured: data.featured,
      categoryId: data.categoryId,
      ripening: data.ripening,
      frostResistance: data.frostResistance,
      berryColor: data.berryColor,
      usage: data.usage,
      seedless: data.seedless,
    };

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== data.id) return { ok: false, error: "SLUG_TAKEN" };

    const product = data.id
      ? await prisma.product.update({ where: { id: data.id }, data: payload })
      : await prisma.product.create({ data: payload });

    revalidatePath("/", "layout");
    return { ok: true, id: product.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      // keep history intact — hide the product instead of deleting it
      await prisma.product.update({ where: { id }, data: { published: false, stock: 0 } });
    } else {
      await prisma.product.delete({ where: { id } });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function uploadProductImage(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const productId = formData.get("productId");
    const file = formData.get("file");
    const alt = formData.get("alt");
    if (typeof productId !== "string" || !(file instanceof File)) {
      return { ok: false, error: "BAD_REQUEST" };
    }
    const url = await saveUpload(file);
    const max = await prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });
    await prisma.productImage.create({
      data: {
        productId,
        url,
        alt: typeof alt === "string" ? alt : "",
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProductImage(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.productImage.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const categorySchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  name: localizedSchema,
  description: localizedSchema.optional(),
  sortOrder: z.number().int(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = categorySchema.parse(input);
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== data.id) return { ok: false, error: "SLUG_TAKEN" };

    const payload = {
      slug: data.slug,
      name: fillLocalized(data.name),
      description: data.description?.lt ? fillLocalized(data.description) : undefined,
      sortOrder: data.sortOrder,
    };
    const category = data.id
      ? await prisma.category.update({ where: { id: data.id }, data: payload })
      : await prisma.category.create({ data: payload });

    revalidatePath("/", "layout");
    return { ok: true, id: category.id };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) return { ok: false, error: "CATEGORY_NOT_EMPTY" };
    await prisma.category.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
    const order = await prisma.order.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      // return reserved stock to the shelf
      await prisma.$transaction([
        prisma.order.update({ where: { id }, data: { status } }),
        ...order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      ]);
    } else if (order.status === "CANCELLED" && status !== "CANCELLED") {
      // re-activating a cancelled order takes the stock again
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { status, paidAt: status === "PAID" ? new Date() : order.paidAt },
        }),
        ...order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      ]);
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          status,
          paidAt: status === "PAID" && !order.paidAt ? new Date() : order.paidAt,
        },
      });
    }

    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const settingsSchema = z.object({
  omnivaPriceCents: z.number().int().min(0),
  lpExpressPriceCents: z.number().int().min(0),
  courierPriceCents: z.number().int().min(0),
  freeShippingFromCents: z.number().int().min(0).nullable(),
  contactEmail: z.string().trim().email().or(z.literal("")),
  contactPhone: z.string().trim().max(30),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = settingsSchema.parse(input);
    await prisma.storeSettings.upsert({
      where: { id: "main" },
      update: data,
      create: { id: "main", ...data },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
