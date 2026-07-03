"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ShoppingBasket, Menu, X } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { LanguageSwitcher } from "./language-switcher";
import { GrapeMark } from "./logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/catalog", key: "catalog" },
  { href: "/about", key: "about" },
  { href: "/delivery", key: "delivery" },
] as const;

function CartLink() {
  const t = useTranslations("nav");
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link
      href="/cart"
      aria-label={t("cart")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
    >
      <ShoppingBasket className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine-700 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // close the mobile menu when navigation changes the path
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-cream/85 backdrop-blur-md">
      <div className="container-shop flex h-16 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2" aria-label={tc("siteName")}>
          <GrapeMark />
          <span className="font-display text-2xl font-bold tracking-tight text-vine-900">
            {tc("siteName")}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                pathname === item.href
                  ? "bg-vine-100 text-vine-800"
                  : "text-stone-700 hover:bg-stone-100",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <CartLink />
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-stone-700 hover:bg-stone-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-stone-200 bg-cream px-4 pt-2 pb-4 md:hidden"
          aria-label="Mobile"
        >
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-lg px-3 py-3 text-base font-semibold text-stone-800 hover:bg-stone-100"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
