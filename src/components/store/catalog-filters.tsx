"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/input";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterValues = {
  category?: string;
  color?: string;
  usage?: string;
  ripening?: string;
  seedless?: boolean;
  sort?: string;
};

const COLORS = ["GREEN", "YELLOW", "PINK", "RED", "BLUE"] as const;
const USAGES = ["TABLE", "WINE", "UNIVERSAL"] as const;
const RIPENINGS = ["VERY_EARLY", "EARLY", "MEDIUM", "LATE"] as const;
const SORTS = ["newest", "price-asc", "price-desc", "name"] as const;

const sortKeys: Record<(typeof SORTS)[number], string> = {
  newest: "sortNewest",
  "price-asc": "sortPriceAsc",
  "price-desc": "sortPriceDesc",
  name: "sortName",
};

export function CatalogFilters({
  categories,
  values,
}: {
  categories: { slug: string; name: string }[];
  values: FilterValues;
}) {
  const t = useTranslations("catalog");
  const ta = useTranslations("attributes");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function apply(patch: Partial<FilterValues>) {
    const next = { ...values, ...patch };
    const query: Record<string, string> = {};
    if (next.category) query.category = next.category;
    if (next.color) query.color = next.color;
    if (next.usage) query.usage = next.usage;
    if (next.ripening) query.ripening = next.ripening;
    if (next.seedless) query.seedless = "1";
    if (next.sort) query.sort = next.sort;
    router.push({ pathname: "/catalog", query }, { scroll: false });
  }

  const hasFilters = Boolean(
    values.category || values.color || values.usage || values.ripening || values.seedless,
  );

  const fields = (
    <>
      <div>
        <label className="mb-1 block text-xs font-bold text-stone-500 uppercase">
          {t("category")}
        </label>
        <Select
          value={values.category ?? ""}
          onChange={(e) => apply({ category: e.target.value || undefined })}
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-stone-500 uppercase">
          {t("usage")}
        </label>
        <Select
          value={values.usage ?? ""}
          onChange={(e) => apply({ usage: e.target.value || undefined })}
        >
          <option value="">—</option>
          {USAGES.map((u) => (
            <option key={u} value={u}>
              {ta(`usageValues.${u}`)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-stone-500 uppercase">
          {t("berryColor")}
        </label>
        <Select
          value={values.color ?? ""}
          onChange={(e) => apply({ color: e.target.value || undefined })}
        >
          <option value="">—</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {ta(`berryColorValues.${c}`)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-stone-500 uppercase">
          {t("ripening")}
        </label>
        <Select
          value={values.ripening ?? ""}
          onChange={(e) => apply({ ripening: e.target.value || undefined })}
        >
          <option value="">—</option>
          {RIPENINGS.map((r) => (
            <option key={r} value={r}>
              {ta(`ripeningValues.${r}`)}
            </option>
          ))}
        </Select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm font-semibold text-stone-700">
        <input
          type="checkbox"
          checked={Boolean(values.seedless)}
          onChange={(e) => apply({ seedless: e.target.checked || undefined })}
          className="h-4 w-4 accent-vine-700"
        />
        {t("seedless")}
      </label>
      {hasFilters && (
        <button
          type="button"
          onClick={() =>
            apply({
              category: undefined,
              color: undefined,
              usage: undefined,
              ripening: undefined,
              seedless: undefined,
            })
          }
          className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-wine-700 hover:text-wine-800"
        >
          <X className="h-4 w-4" aria-hidden /> {t("clearFilters")}
        </button>
      )}
    </>
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 lg:hidden"
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {open ? t("hideFilters") : t("showFilters")}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-stone-500 sm:block">{t("sort")}:</span>
          <Select
            value={values.sort ?? "newest"}
            onChange={(e) => apply({ sort: e.target.value })}
            className="w-auto"
            aria-label={t("sort")}
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(sortKeys[s])}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end",
          open ? "grid" : "hidden lg:grid",
        )}
      >
        {fields}
      </div>
    </div>
  );
}
