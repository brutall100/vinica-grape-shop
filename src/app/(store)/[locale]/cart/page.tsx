import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/store/cart-view";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("cartTitle"), robots: { index: false } };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as never);
  return <CartView locale={locale} />;
}
