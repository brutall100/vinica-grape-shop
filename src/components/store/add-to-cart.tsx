"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Minus, Plus, Check, ShoppingBasket } from "lucide-react";

export function AddToCart({
  product,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    priceCents: number;
    image: string | null;
    maxStock: number;
  };
}) {
  const t = useTranslations();
  const add = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.maxStock <= 0) {
    return (
      <div className="rounded-xl bg-stone-100 px-5 py-4 text-center font-semibold text-stone-500">
        {t("common.outOfStock")}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-stone-300 bg-white">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-l-full text-stone-600 hover:bg-stone-100"
          aria-label="-"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-bold" aria-label={t("common.quantity")}>
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.maxStock, q + 1))}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-r-full text-stone-600 hover:bg-stone-100"
          aria-label="+"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        size="lg"
        className="flex-1 sm:flex-none"
        onClick={() => {
          add(product, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" aria-hidden /> {t("product.addedToCart")}
          </>
        ) : (
          <>
            <ShoppingBasket className="h-5 w-5" aria-hidden /> {t("common.addToCart")}
          </>
        )}
      </Button>
    </div>
  );
}
