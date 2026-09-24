"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory, type CategoryInput } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FieldLabel } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";

const LOCALES = ["lt", "en", "ru", "pl"] as const;
type L = (typeof LOCALES)[number];
type Localized = Record<L, string>;

export type CategoryRow = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  sortOrder: number;
  productCount: number;
};

const empty = { lt: "", en: "", ru: "", pl: "" };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryRow | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(category: CategoryRow) {
    if (category.productCount > 0) {
      setError("Kategorijos su produktais ištrinti negalima – pirmiausia perkelkite produktus.");
      return;
    }
    if (!confirm(`Ištrinti kategoriją „${category.name.lt}“?`)) return;
    const result = await deleteCategory(category.id);
    if (result.ok) router.refresh();
    else setError("Nepavyko ištrinti kategorijos.");
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-left text-xs text-stone-500 uppercase">
              <th className="px-4 py-2.5">Pavadinimas</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Produktų</th>
              <th className="px-4 py-2.5 text-right">Veiksmai</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-stone-50">
                <td className="px-4 py-2.5 font-semibold">{category.name.lt}</td>
                <td className="px-4 py-2.5 text-stone-500">{category.slug}</td>
                <td className="px-4 py-2.5">{category.productCount}</td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(category)}
                      className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-vine-700"
                      aria-label="Redaguoti"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(category)}
                      className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Ištrinti"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing === null ? (
        <Button type="button" size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden /> Nauja kategorija
        </Button>
      ) : (
        <CategoryForm
          key={editing === "new" ? "new" : editing.id}
          category={editing === "new" ? null : editing}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onDone,
  onCancel,
}: {
  category: CategoryRow | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<L>("lt");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);
  const [name, setName] = useState<Localized>(category?.name ?? { ...empty });
  const [description, setDescription] = useState<Localized>(category?.description ?? { ...empty });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim() || !name.lt.trim()) {
      setError("Užpildykite slug ir lietuvišką pavadinimą");
      return;
    }
    setSaving(true);
    setError(null);
    const input: CategoryInput = {
      id: category?.id,
      slug: slug.trim().toLowerCase(),
      name,
      description: description.lt ? description : undefined,
      sortOrder,
    };
    const result = await saveCategory(input);
    setSaving(false);
    if (result.ok) onDone();
    else setError(result.error === "SLUG_TAKEN" ? "Toks slug jau užimtas" : "Nepavyko išsaugoti");
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-5">
      <h2 className="mb-4 font-bold">
        {category ? `Redaguoti: ${category.name.lt}` : "Nauja kategorija"}
      </h2>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Slug *</FieldLabel>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="pvz., vynines"
          />
        </div>
        <div>
          <FieldLabel>Rikiavimo eilė</FieldLabel>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))}
          />
        </div>
      </div>

      <div className="mb-3 flex gap-1 rounded-xl bg-stone-100 p-1">
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
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div>
          <FieldLabel>
            Pavadinimas ({tab.toUpperCase()}){tab === "lt" && " *"}
          </FieldLabel>
          <Input value={name[tab]} onChange={(e) => setName({ ...name, [tab]: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Aprašymas ({tab.toUpperCase()})</FieldLabel>
          <Textarea
            rows={2}
            value={description[tab]}
            onChange={(e) => setDescription({ ...description, [tab]: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saugoma..." : "Išsaugoti"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Atšaukti
        </Button>
      </div>
    </form>
  );
}
