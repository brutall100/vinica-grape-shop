import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Vercel Blob storage (production image uploads)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
