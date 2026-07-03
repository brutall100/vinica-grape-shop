import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GrapeMark } from "./logo";
import { getStoreSettings } from "@/lib/settings";
import { Mail, Phone } from "lucide-react";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  const settings = await getStoreSettings();

  return (
    <footer className="mt-16 border-t border-stone-200 bg-vine-950 text-stone-300">
      <div className="container-shop grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <GrapeMark className="[&_*]:!text-stone-100" />
            <span className="font-display text-2xl font-bold text-white">{tc("siteName")}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-400">{t("description")}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">{t("shop")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/catalog" className="hover:text-white">
                {tn("catalog")}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                {tn("cart")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">{t("info")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                {tn("about")}
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-white">
                {tn("delivery")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                {t("terms")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">
            {t("contacts")}
          </h3>
          <ul className="space-y-2 text-sm">
            {settings.contactEmail && (
              <li>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Mail className="h-4 w-4" aria-hidden /> {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && (
              <li>
                <a
                  href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Phone className="h-4 w-4" aria-hidden /> {settings.contactPhone}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shop py-5 text-xs text-stone-500">
          © {new Date().getFullYear()} {tc("siteName")}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
