"use client";

import { useMemo, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { checkoutSchema } from "@/lib/checkout-schema";
import { placeOrder } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FieldLabel, FieldError } from "@/components/ui/input";
import { PickupPointSelect } from "./pickup-point-select";
import { Package, Truck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type ShippingMethod = "OMNIVA" | "LP_EXPRESS" | "COURIER";

export type ShippingPrices = {
  omnivaCents: number;
  lpExpressCents: number;
  courierCents: number;
  freeFromCents: number | null;
};

export function CheckoutForm({ prices }: { prices: ShippingPrices }) {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const { items, clear } = useCart();
  const hydrated = useHydrated();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<ShippingMethod>("OMNIVA");
  const [terminal, setTerminal] = useState<{ id: string; name: string } | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const shippingCents = useMemo(() => {
    if (prices.freeFromCents != null && subtotal >= prices.freeFromCents) return 0;
    return method === "OMNIVA"
      ? prices.omnivaCents
      : method === "LP_EXPRESS"
        ? prices.lpExpressCents
        : prices.courierCents;
  }, [method, subtotal, prices]);

  const methods: { value: ShippingMethod; label: string; icon: typeof Package; price: number }[] = [
    { value: "OMNIVA", label: t("shippingOmniva"), icon: Package, price: prices.omnivaCents },
    {
      value: "LP_EXPRESS",
      label: t("shippingLpexpress"),
      icon: Package,
      price: prices.lpExpressCents,
    },
    { value: "COURIER", label: t("shippingCourier"), icon: Truck, price: prices.courierCents },
  ];

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-600">{tc("empty")}</p>
        <Link href="/catalog" className="mt-3 inline-block font-semibold text-vine-700">
          {tc("emptyCta")}
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const input = {
      name,
      email,
      phone,
      shippingMethod: method,
      terminalId: terminal?.id,
      terminalName: terminal?.name,
      address: address || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      note: note || undefined,
      locale: locale as "lt" | "en" | "ru" | "pl",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const result = await placeOrder(parsed.data);
      if (result.ok) {
        clear();
        window.location.assign(result.redirectUrl);
        return;
      }
      if (result.field && result.field in parsed.data) {
        setErrors({ [result.field]: result.error });
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError("generic");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (key: string) => {
    const code = errors[key];
    return code ? t(`errors.${code}` as never) : undefined;
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start"
      noValidate
    >
      <div className="space-y-8">
        {/* Contact */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-stone-900">{t("contactInfo")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="co-name">{t("name")}</FieldLabel>
              <Input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <FieldError>{err("name")}</FieldError>
            </div>
            <div>
              <FieldLabel htmlFor="co-email">{t("email")}</FieldLabel>
              <Input
                id="co-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <FieldError>{err("email")}</FieldError>
            </div>
            <div>
              <FieldLabel htmlFor="co-phone">{t("phone")}</FieldLabel>
              <Input
                id="co-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+370"
              />
              <FieldError>{err("phone")}</FieldError>
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-stone-900">{t("shipping")}</h2>
          <div className="grid gap-2.5">
            {methods.map((m) => (
              <label
                key={m.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                  method === m.value
                    ? "border-vine-600 bg-vine-50"
                    : "border-stone-200 hover:border-stone-300",
                )}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={method === m.value}
                  onChange={() => {
                    setMethod(m.value);
                    setTerminal(null);
                  }}
                  className="h-4 w-4 accent-vine-700"
                />
                <m.icon className="h-5 w-5 text-stone-500" aria-hidden />
                <span className="flex-1 text-sm font-semibold text-stone-800">{m.label}</span>
                <span className="text-sm font-bold text-stone-900">
                  {prices.freeFromCents != null && subtotal >= prices.freeFromCents
                    ? t("freeShipping")
                    : formatPrice(m.price, locale)}
                </span>
              </label>
            ))}
          </div>

          {prices.freeFromCents != null && subtotal < prices.freeFromCents && (
            <p className="mt-3 text-xs text-stone-500">
              {t("freeShippingFrom", { amount: formatPrice(prices.freeFromCents, locale) })}
            </p>
          )}

          {method !== "COURIER" ? (
            <div className="mt-4">
              <FieldLabel>{t("selectPickupPoint")}</FieldLabel>
              <PickupPointSelect
                provider={method}
                value={terminal?.id ?? null}
                onSelect={(p) => setTerminal({ id: p.id, name: `${p.city}, ${p.name}` })}
              />
              {terminal && (
                <p className="mt-2 text-sm font-semibold text-vine-700">{terminal.name}</p>
              )}
              <FieldError>{err("terminalId")}</FieldError>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="co-address">{t("address")}</FieldLabel>
                <Input
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                />
                <FieldError>{err("address")}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="co-city">{t("city")}</FieldLabel>
                <Input
                  id="co-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                />
                <FieldError>{err("city")}</FieldError>
              </div>
              <div>
                <FieldLabel htmlFor="co-postal">{t("postalCode")}</FieldLabel>
                <Input
                  id="co-postal"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  autoComplete="postal-code"
                  placeholder="LT-"
                />
                <FieldError>{err("postalCode")}</FieldError>
              </div>
            </div>
          )}

          <div className="mt-4">
            <FieldLabel htmlFor="co-note">{t("note")}</FieldLabel>
            <Textarea
              id="co-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-display text-xl font-bold text-stone-900">{t("payment")}</h2>
          <div className="flex items-center gap-3 rounded-xl border border-vine-600 bg-vine-50 p-3.5">
            <CreditCard className="h-5 w-5 text-stone-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-stone-800">{t("payStripe")}</p>
              <p className="text-xs text-stone-500">{t("payStripeNote")}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="rounded-2xl border border-stone-200 bg-white p-6 lg:sticky lg:top-20">
        <h2 className="mb-4 font-display text-xl font-bold text-stone-900">{t("orderSummary")}</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span className="text-stone-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold text-stone-900">
                {formatPrice(item.priceCents * item.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-600">{tc("subtotal")}</dt>
            <dd className="font-semibold">{formatPrice(subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-600">{t("shippingCost")}</dt>
            <dd className="font-semibold">
              {shippingCents === 0 ? t("freeShipping") : formatPrice(shippingCents, locale)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 text-base">
            <dt className="font-bold text-stone-900">{t("total")}</dt>
            <dd className="text-xl font-bold text-stone-900">
              {formatPrice(subtotal + shippingCents, locale)}
            </dd>
          </div>
        </dl>

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {t(`errors.${serverError}` as never)}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
          {submitting ? t("processing") : t("placeOrder")}
        </Button>

        <p className="mt-3 text-center text-xs text-stone-500">
          {t.rich("agreeTerms", {
            link: (chunks) => (
              <Link href="/terms" className="underline hover:text-vine-700" target="_blank">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </aside>
    </form>
  );
}
