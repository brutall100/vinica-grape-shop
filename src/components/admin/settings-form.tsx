"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings, type SettingsInput } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";

type Props = {
  initial: {
    omnivaEur: string;
    lpExpressEur: string;
    courierEur: string;
    freeFromEur: string;
    contactEmail: string;
    contactPhone: string;
  };
};

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  function toCents(value: string): number | null {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return null;
    const parsed = Math.round(parseFloat(trimmed) * 100);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const omniva = toCents(form.omnivaEur);
    const lp = toCents(form.lpExpressEur);
    const courier = toCents(form.courierEur);
    if (omniva == null || lp == null || courier == null) {
      setMessage("Patikrinkite pristatymo kainas");
      return;
    }

    const input: SettingsInput = {
      omnivaPriceCents: omniva,
      lpExpressPriceCents: lp,
      courierPriceCents: courier,
      freeShippingFromCents: toCents(form.freeFromEur),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
    };

    setSaving(true);
    const result = await saveSettings(input);
    setSaving(false);
    setMessage(result.ok ? "Išsaugota ✓" : "Nepavyko išsaugoti");
    if (result.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-bold">Pristatymo kainos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Omniva paštomatas €</FieldLabel>
            <Input inputMode="decimal" value={form.omnivaEur} onChange={(e) => set("omnivaEur", e.target.value)} />
          </div>
          <div>
            <FieldLabel>LP Express paštomatas €</FieldLabel>
            <Input inputMode="decimal" value={form.lpExpressEur} onChange={(e) => set("lpExpressEur", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Kurjeris €</FieldLabel>
            <Input inputMode="decimal" value={form.courierEur} onChange={(e) => set("courierEur", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Nemokamas pristatymas nuo € (tuščia – išjungta)</FieldLabel>
            <Input inputMode="decimal" value={form.freeFromEur} onChange={(e) => set("freeFromEur", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-bold">Kontaktai</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>El. paštas</FieldLabel>
            <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </div>
          <div>
            <FieldLabel>Telefonas</FieldLabel>
            <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saugoma..." : "Išsaugoti"}
        </Button>
        {message && <span className="text-sm font-semibold text-stone-600">{message}</span>}
      </div>
    </form>
  );
}
