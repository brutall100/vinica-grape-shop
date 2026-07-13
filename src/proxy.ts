import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, static files, Next.js internals and the (non-localized) admin area.
  // Note: "api/" (with slash) so this doesn't also match pathnames like /apie-mus.
  matcher: "/((?!api/|_next|_vercel|admin|.*\\..*).*)",
};
