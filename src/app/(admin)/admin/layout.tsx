import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeScript } from "@/components/effects/theme-script";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Vinica administravimas", template: "%s | Vinica admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" data-theme="light" className={manrope.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-stone-100 font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
