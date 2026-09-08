import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// `proxy.ts` s'appelait `middleware.ts` jusqu'à Next.js 16.
export default createMiddleware(routing);

export const config = {
  // Tout sauf les routes d'API, les internes Next et les fichiers avec extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
