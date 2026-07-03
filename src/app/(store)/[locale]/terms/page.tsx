import { InfoPage, infoMetadata } from "@/components/store/info-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return infoMetadata(locale, "termsTitle");
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  return <InfoPage locale={locale} titleKey="termsTitle" bodyKey="termsBody" />;
}
