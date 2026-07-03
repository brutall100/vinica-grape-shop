"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");

  return (
    <div className="container-shop flex flex-col items-center py-24 text-center">
      <p className="font-display text-6xl font-bold text-wine-200">:(</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">{t("error")}</h1>
      <Button className="mt-6" onClick={reset}>
        ↻
      </Button>
    </div>
  );
}
