"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { Minus, Plus, Check, ShoppingBasket } from "lucide-react";
import { VineLeaf } from "@/components/effects/vine-leaf";

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
  // bumps on every click so a fresh leaf sprouts out of the button each time
  const [sprouts, setSprouts] = useState(0);

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
          aria-label={`${t("common.quantity")} −1`}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-10 text-center font-bold" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.maxStock, q + 1))}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-r-full text-stone-600 hover:bg-stone-100"
          aria-label={`${t("common.quantity")} +1`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <span className="relative flex flex-1 sm:flex-none">
        {sprouts > 0 && <VineLeaf key={sprouts} className="sprout-pop" />}
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            add(product, quantity);
            setAdded(true);
            setSprouts((n) => n + 1);
            setTimeout(() => setAdded(false), 2000);
          }}
        >
          {added ? (
            <>
              <Check className="basket-wiggle h-5 w-5" aria-hidden /> {t("product.addedToCart")}
            </>
          ) : (
            <>
              <ShoppingBasket className="h-5 w-5" aria-hidden /> {t("common.addToCart")}
            </>
          )}
        </Button>
      </span>
    </div>
  );
}
