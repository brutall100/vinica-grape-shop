import { InfoPage, infoMetadata } from "@/components/store/info-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return infoMetadata(locale, "aboutTitle", "/about");
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  return <InfoPage locale={locale} titleKey="aboutTitle" bodyKey="aboutBody" />;
}
