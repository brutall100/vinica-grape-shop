import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "main" } });
  if (settings) return settings;
  return prisma.storeSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

export type StoreSettings = Awaited<ReturnType<typeof getStoreSettings>>;
