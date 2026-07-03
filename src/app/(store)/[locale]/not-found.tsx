import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="container-shop flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-bold text-vine-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">{t("title")}</h1>
      <p className="mt-2 max-w-sm text-stone-600">{t("text")}</p>
      <Link href="/" className={`mt-6 ${buttonClasses("primary", "md")}`}>
        {t("backHome")}
      </Link>
    </div>
  );
}
