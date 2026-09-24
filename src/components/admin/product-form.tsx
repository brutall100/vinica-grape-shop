"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  saveProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  type ProductInput,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, FieldLabel } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2, Upload } from "lucide-react";

const LOCALES = ["lt", "en", "ru", "pl"] as const;
type L = (typeof LOCALES)[number];
type Localized = Record<L, string>;

const emptyLocalized: Localized = { lt: "", en: "", ru: "", pl: "" };

export type ProductFormData = {
  id?: string;
  slug: string;
  name: Localized;
  description: Localized;
  growingInfo: Localized;
  priceEur: string;
  salePriceEur: string;
  stock: number;
  published: boolean;
  featured: boolean;
  categoryId: string;
  ripening: string;
  frostResistance: string;
  berryColor: string;
  usage: string;
  seedless: boolean;
};

export type ProductImageData = { id: string; url: string; alt: string };

const errorMessages: Record<string, string> = {
  SLUG_TAKEN: "Toks nuorodos pavadinimas (slug) jau užimtas",
  UNAUTHORIZED: "Sesija baigėsi – prisijunkite iš naujo",
  UNSUPPORTED_TYPE: "Netinkamas failo formatas (leidžiama: JPG, PNG, WebP, AVIF, SVG)",
  FILE_TOO_LARGE: "Failas per didelis (iki 8 MB)",
};

function errText(code: string) {
  return errorMessages[code] ?? "Nepavyko išsaugoti. Patikrinkite laukus ir bandykite dar kartą.";
}

export function ProductForm({
  initial,
  images,
  categories,
}: {
  initial?: ProductFormData;
  images: ProductImageData[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(
    initial ?? {
      slug: "",
      name: { ...emptyLocalized },
      description: { ...emptyLocalized },
      growingInfo: { ...emptyLocalized },
      priceEur: "",
      salePriceEur: "",
      stock: 0,
      published: true,
      featured: false,
      categoryId: categories[0]?.id ?? "",
      ripening: "MEDIUM",
      frostResistance: "",
      berryColor: "BLUE",
      usage: "UNIVERSAL",
      seedless: false,
    },
  );
  const [tab, setTab] = useState<L>("lt");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setLocalized = (key: "name" | "description" | "growingInfo", value: string) =>
    setForm((f) => ({ ...f, [key]: { ...f[key], [tab]: value } }));

  function toCents(value: string): number | null {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return null;
    const parsed = Math.round(parseFloat(trimmed) * 100);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = toCents(form.priceEur);
    if (!priceCents || priceCents < 1) {
      setError("Įveskite teisingą kainą");
      return;
    }
    if (!form.slug || !form.name.lt || !form.description.lt || !form.categoryId) {
      setError("Užpildykite privalomus laukus (slug, pavadinimas LT, aprašymas LT, kategorija)");
      return;
    }

    const input: ProductInput = {
      id: form.id,
      slug: form.slug.trim().toLowerCase(),
      name: form.name,
      description: form.description,
      growingInfo: form.growingInfo.lt ? form.growingInfo : undefined,
      priceCents,
      salePriceCents: toCents(form.salePriceEur),
      stock: form.stock,
      published: form.published,
      featured: form.featured,
      categoryId: form.categoryId,
      ripening: form.ripening as ProductInput["ripening"],
      frostResistance: form.frostResistance ? parseInt(form.frostResistance, 10) : null,
      berryColor: form.berryColor as ProductInput["berryColor"],
      usage: form.usage as ProductInput["usage"],
      seedless: form.seedless,
    };

    setSaving(true);
    const result = await saveProduct(input);
    setSaving(false);
    if (result.ok) {
      if (!form.id && result.id) {
        router.replace(`/admin/products/${result.id}`);
      } else {
        router.refresh();
      }
    } else {
      setError(errText(result.error));
    }
  }

  async function upload(file: File) {
    if (!form.id) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("productId", form.id);
    fd.set("file", file);
    fd.set("alt", form.name.lt);
    const result = await uploadProductImage(fd);
    setUploading(false);
    if (result.ok) router.refresh();
    else setError(errText(result.error));
  }

  async function removeProduct() {
    if (!form.id) return;
    if (!confirm("Ar tikrai norite ištrinti šį produktą?")) return;
    const result = await deleteProduct(form.id);
    if (result.ok) router.push("/admin/products");
    else setError(errText(result.error));
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        {/* Translations */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="mb-4 flex gap-1 rounded-xl bg-stone-100 p-1">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setTab(l)}
                className={cn(
                  "flex-1 cursor-pointer rounded-lg py-1.5 text-sm font-bold uppercase",
                  tab === l ? "bg-white shadow-sm" : "text-stone-500 hover:text-stone-800",
                )}
              >
                {l}
                {l !== "lt" && !form.name[l] && <span className="ml-1 text-amber-500">•</span>}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <FieldLabel>
                Pavadinimas ({tab.toUpperCase()}){tab === "lt" && " *"}
              </FieldLabel>
              <Input
                value={form.name[tab]}
                onChange={(e) => setLocalized("name", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>
                Aprašymas ({tab.toUpperCase()}){tab === "lt" && " *"}
              </FieldLabel>
              <Textarea
                rows={5}
                value={form.description[tab]}
                onChange={(e) => setLocalized("description", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Auginimas ir priežiūra ({tab.toUpperCase()})</FieldLabel>
              <Textarea
                rows={3}
                value={form.growingInfo[tab]}
                onChange={(e) => setLocalized("growingInfo", e.target.value)}
              />
            </div>
            {tab !== "lt" && (
              <p className="text-xs text-stone-500">
                Palikus tuščią, parduotuvėje bus rodomas lietuviškas tekstas.
              </p>
            )}
          </div>
        </section>

        {/* Attributes */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Veislės savybės</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Paskirtis</FieldLabel>
              <Select value={form.usage} onChange={(e) => set("usage", e.target.value)}>
                <option value="TABLE">Valgomoji</option>
                <option value="WINE">Vyninė</option>
                <option value="UNIVERSAL">Universali</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Sunokimas</FieldLabel>
              <Select value={form.ripening} onChange={(e) => set("ripening", e.target.value)}>
                <option value="VERY_EARLY">Labai ankstyvas</option>
                <option value="EARLY">Ankstyvas</option>
                <option value="MEDIUM">Vidutinis</option>
                <option value="LATE">Vėlyvas</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Uogų spalva</FieldLabel>
              <Select value={form.berryColor} onChange={(e) => set("berryColor", e.target.value)}>
                <option value="GREEN">Žalia</option>
                <option value="YELLOW">Gintarinė</option>
                <option value="PINK">Rausva</option>
                <option value="RED">Raudona</option>
                <option value="BLUE">Mėlyna</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Atsparumas šalčiui (°C)</FieldLabel>
              <Input
                type="number"
                max={0}
                min={-50}
                placeholder="pvz., -25"
                value={form.frostResistance}
                onChange={(e) => set("frostResistance", e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.seedless}
                onChange={(e) => set("seedless", e.target.checked)}
                className="h-4 w-4 accent-vine-700"
              />
              Besėklė veislė
            </label>
          </div>
        </section>

        {/* Images */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Nuotraukos</h2>
          {!form.id ? (
            <p className="text-sm text-stone-500">Nuotraukas galėsite įkelti išsaugoję produktą.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const result = await deleteProductImage(img.id);
                        if (result.ok) router.refresh();
                      }}
                      className="absolute top-1 right-1 cursor-pointer rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow group-hover:opacity-100"
                      aria-label="Ištrinti nuotrauką"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-vine-500 hover:text-vine-600"
                >
                  <Upload className="h-5 w-5" aria-hidden />
                  <span className="text-xs font-semibold">
                    {uploading ? "Keliama..." : "Įkelti"}
                  </span>
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file);
                  e.target.value = "";
                }}
              />
            </>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-4 font-bold">Pardavimas</h2>
          <div className="space-y-4">
            <div>
              <FieldLabel>Nuoroda (slug) *</FieldLabel>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="pvz., solaris"
              />
            </div>
            <div>
              <FieldLabel>Kategorija *</FieldLabel>
              <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Kaina € *</FieldLabel>
                <Input
                  inputMode="decimal"
                  value={form.priceEur}
                  onChange={(e) => set("priceEur", e.target.value)}
                  placeholder="12.00"
                />
              </div>
              <div>
                <FieldLabel>Akcijos kaina €</FieldLabel>
                <Input
                  inputMode="decimal"
                  value={form.salePriceEur}
                  onChange={(e) => set("salePriceEur", e.target.value)}
                />
              </div>
            </div>
            <div>
              <FieldLabel>Likutis (vnt.)</FieldLabel>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", Math.max(0, parseInt(e.target.value || "0", 10)))}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-4 w-4 accent-vine-700"
              />
              Publikuotas parduotuvėje
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-vine-700"
              />
              Rodyti pagrindiniame (TOP)
            </label>
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Saugoma..." : "Išsaugoti"}
          </Button>
          {form.id && (
            <Button type="button" variant="danger" onClick={removeProduct}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
