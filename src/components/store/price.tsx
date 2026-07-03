import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  priceCents,
  salePriceCents,
  locale,
  className,
}: {
  priceCents: number;
  salePriceCents?: number | null;
  locale: string;
  className?: string;
}) {
  if (salePriceCents != null && salePriceCents < priceCents) {
    return (
      <span className={cn("flex items-baseline gap-2", className)}>
        <span className="font-bold text-wine-700">{formatPrice(salePriceCents, locale)}</span>
        <s className="text-sm font-normal text-stone-400">{formatPrice(priceCents, locale)}</s>
      </span>
    );
  }
  return <span className={cn("font-bold", className)}>{formatPrice(priceCents, locale)}</span>;
}

export function effectivePriceCents(p: { priceCents: number; salePriceCents: number | null }) {
  return p.salePriceCents != null && p.salePriceCents < p.priceCents
    ? p.salePriceCents
    : p.priceCents;
}
