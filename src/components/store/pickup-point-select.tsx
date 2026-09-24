"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Check, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Point = { id: string; name: string; city: string };

export function PickupPointSelect({
  provider,
  value,
  onSelect,
}: {
  provider: "OMNIVA" | "LP_EXPRESS";
  value: string | null;
  onSelect: (point: Point) => void;
}) {
  const t = useTranslations("checkout");
  const [loaded, setLoaded] = useState<{ provider: string; points: Point[] } | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pickup-points?provider=${provider}`)
      .then((r) => r.json())
      .then((data: Point[]) => {
        if (!cancelled) setLoaded({ provider, points: data });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ provider, points: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [provider]);

  // while the newly selected provider's list is loading, show the loading state
  const points = loaded?.provider === provider ? loaded.points : null;
  const selected = points?.find((p) => p.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!points) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? points.filter((p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q))
      : points;
    return list.slice(0, 60);
  }, [points, query]);

  return (
    <div>
      <Input
        placeholder={selected ? `${selected.city} — ${selected.name}` : t("searchPickupPoint")}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        aria-label={t("pickupPoint")}
      />
      {open && (
        <ul className="mt-2 max-h-56 divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-200 bg-white">
          {points === null ? (
            <li className="px-4 py-3 text-sm text-stone-400">…</li>
          ) : filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-stone-400">—</li>
          ) : (
            filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-vine-50",
                    p.id === value && "bg-vine-50 font-semibold",
                  )}
                >
                  {p.id === value ? (
                    <Check className="h-4 w-4 shrink-0 text-vine-700" aria-hidden />
                  ) : (
                    <MapPin className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
                  )}
                  <span>
                    <span className="font-semibold">{p.city}</span> — {p.name}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
