import { InfoPage, infoMetadata } from "@/components/store/info-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return infoMetadata(locale, "deliveryTitle", "/delivery");
}

export default async function DeliveryPage({ params }: Props) {
  const { locale } = await params;
  return <InfoPage locale={locale} titleKey="deliveryTitle" bodyKey="deliveryBody" />;
}
