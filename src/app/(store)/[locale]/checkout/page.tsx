import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStoreSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/store/checkout-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("checkoutTitle"), robots: { index: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as never);
  const t = await getTranslations("checkout");
  const settings = await getStoreSettings();

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="mb-8 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
        {t("title")}
      </h1>
      <CheckoutForm
        prices={{
          omnivaCents: settings.omnivaPriceCents,
          lpExpressCents: settings.lpExpressPriceCents,
          courierCents: settings.courierPriceCents,
          freeFromCents: settings.freeShippingFromCents,
        }}
      />
    </div>
  );
}
