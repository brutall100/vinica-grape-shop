import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";
import { GrapeMark } from "@/components/store/logo";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Suvestinė", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produktai", icon: Package },
  { href: "/admin/categories", label: "Kategorijos", icon: FolderTree },
  { href: "/admin/orders", label: "Užsakymai", icon: ShoppingCart },
  { href: "/admin/settings", label: "Nustatymai", icon: Settings },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-stone-200 bg-deep text-on-deep-muted lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2">
            <GrapeMark className="h-7 w-7 [&_*]:!text-on-deep" />
            <span className="font-bold text-on-deep">Vinica admin</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap hover:bg-on-deep/10 hover:text-on-deep"
            >
              <Icon className="h-4.5 w-4.5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 lg:block">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-on-deep/10 hover:text-on-deep"
          >
            <ExternalLink className="h-4.5 w-4.5" aria-hidden /> Peržiūrėti parduotuvę
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-on-deep/10 hover:text-on-deep"
            >
              <LogOut className="h-4.5 w-4.5" aria-hidden /> Atsijungti
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
