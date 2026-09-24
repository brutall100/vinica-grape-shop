import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getPathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";

type Href = Parameters<typeof getPathname>[0]["href"];

function entry(
  href: Href,
  lastModified: Date,
  changeFrequency: "daily" | "weekly" | "monthly",
  priority: number,
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = siteUrl + getPathname({ locale, href });
  }
  return {
    url: languages.lt,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    entry("/", now, "daily", 1),
    entry("/catalog", now, "daily", 0.9),
    ...products.map((p) =>
      entry({ pathname: "/products/[slug]", params: { slug: p.slug } }, p.updatedAt, "weekly", 0.8),
    ),
    entry("/about", now, "monthly", 0.5),
    entry("/delivery", now, "monthly", 0.5),
    entry("/terms", now, "monthly", 0.3),
    entry("/privacy", now, "monthly", 0.3),
  ];
}
