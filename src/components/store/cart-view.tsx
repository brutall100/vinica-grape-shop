"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBasket, ArrowRight } from "lucide-react";

export function CartView({ locale }: { locale: string }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const { items, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="container-shop py-12 text-stone-400">{tc("loading")}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-shop flex flex-col items-center py-20 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <ShoppingBasket className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900">{t("empty")}</h1>
        <p className="mt-2 max-w-sm text-stone-600">{t("emptyText")}</p>
        <Link href="/catalog" className={`mt-6 ${buttonClasses("primary", "lg")}`}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4">
              <Link
                href={{ pathname: "/products/[slug]", params: { slug: item.slug } }}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-dark"
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={{ pathname: "/products/[slug]", params: { slug: item.slug } }}
                    className="font-display font-bold text-stone-900 hover:text-vine-700"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="cursor-pointer p-1 text-stone-400 hover:text-red-600"
                    aria-label={tc("remove")}
                  >
                    <Trash2 className="h-4.5 w-4.5" aria-hidden />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center rounded-full border border-stone-300">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-l-full text-stone-600 hover:bg-stone-100"
                      aria-label="-"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.productId, Math.min(item.maxStock, item.quantity + 1))
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-full text-stone-600 hover:bg-stone-100"
                      aria-label="+"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-stone-900">
                    {formatPrice(item.priceCents * item.quantity, locale)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between text-base">
            <span className="text-stone-600">{t("subtotal")}</span>
            <span className="text-xl font-bold text-stone-900">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-500">{t("shippingNote")}</p>
          <Link href="/checkout" className={`mt-5 w-full ${buttonClasses("primary", "lg")}`}>
            {t("checkout")} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/catalog"
            className="mt-3 block text-center text-sm font-semibold text-vine-700 hover:text-vine-800"
          >
            {t("continueShopping")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
