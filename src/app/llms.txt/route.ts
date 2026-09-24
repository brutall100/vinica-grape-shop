import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/localized";
import { getPathname } from "@/i18n/navigation";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

/**
 * llms.txt — a machine-readable site summary for AI assistants and crawlers
 * (see https://llmstxt.org). Helps AI search surface the shop and its products.
 */
export async function GET() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { slug: "asc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const productLines = products
    .map((p) => {
      const url =
        siteUrl +
        getPathname({
          locale: "lt",
          href: { pathname: "/products/[slug]", params: { slug: p.slug } },
        });
      const price = ((p.salePriceCents ?? p.priceCents) / 100).toFixed(2);
      const attrs = [
        p.frostResistance != null ? `atsparumas šalčiui iki ${p.frostResistance}°C` : null,
        p.seedless ? "besėklė" : null,
      ]
        .filter(Boolean)
        .join(", ");
      return `- [${pickLocale(p.name, "lt")}](${url}): ${price} EUR${attrs ? ` (${attrs})` : ""} — ${pickLocale(p.description, "lt").split("\n")[0].slice(0, 140)}`;
    })
    .join("\n");

  const categoryLines = categories
    .map((c) => {
      const url =
        siteUrl +
        getPathname({ locale: "lt", href: { pathname: "/catalog", query: { category: c.slug } } });
      return `- [${pickLocale(c.name, "lt")}](${url})`;
    })
    .join("\n");

  const body = `# Vinica — vynuogių sodinukų el. parduotuvė

> Lietuviškas vynuogių medelynas, parduodantis Baltijos klimatui pritaikytus vynuogių sodinukus internetu. Pristatymas per Omniva ir LP Express paštomatus bei kurjeriu visoje Lietuvoje. Svetainė veikia lietuvių, anglų, rusų ir lenkų kalbomis.

Vinica is a Lithuanian grapevine nursery e-shop selling cold-hardy grapevine seedlings (table, wine and seedless varieties) adapted to the Baltic climate, with delivery across Lithuania.

## Kategorijos / Categories

${categoryLines}

## Produktai / Products

${productLines}

## Puslapiai / Pages

- [Katalogas](${siteUrl + getPathname({ locale: "lt", href: "/catalog" })}): visos parduodamos veislės su filtrais
- [Pristatymas ir apmokėjimas](${siteUrl + getPathname({ locale: "lt", href: "/delivery" })}): pristatymo būdai ir kainos
- [Apie mus](${siteUrl + getPathname({ locale: "lt", href: "/about" })}): medelyno istorija
- [Catalog (EN)](${siteUrl + getPathname({ locale: "en", href: "/catalog" })}): full catalog in English
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
