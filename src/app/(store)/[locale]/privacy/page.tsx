import { InfoPage, infoMetadata } from "@/components/store/info-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return infoMetadata(locale, "privacyTitle", "/privacy");
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  return <InfoPage locale={locale} titleKey="privacyTitle" bodyKey="privacyBody" />;
}
