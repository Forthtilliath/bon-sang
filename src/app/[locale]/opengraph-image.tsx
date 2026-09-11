import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { assertLocale } from "@/lib/locale";

export const alt = "Bon Sang";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Nom de marque (logo), jamais traduit : hissé en constantes hors JSX (cf.
// `i18next/no-literal-string`, qui ne vérifie que les littéraux de l'arbre JSX).
const BRAND_PREFIX = "Bon ";
const BRAND_HIGHLIGHT = "Sang";
const BRAND_FOOTER = "bon-sang";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: "80px 96px",
        background: "radial-gradient(1200px 600px at 15% 0%, #3a0d10 0%, #0b0b0d 55%), #0b0b0d",
        color: "#ececee",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 108, fontWeight: 700, letterSpacing: -2 }}>
        <span>{BRAND_PREFIX}</span>
        <span style={{ color: "#f0434f" }}>{BRAND_HIGHLIGHT}</span>
      </div>
      <div style={{ fontSize: 40, color: "#a0a0ab", maxWidth: 900, lineHeight: 1.3 }}>
        {t("description")}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 96,
          fontSize: 26,
          color: "#f0434f",
          fontWeight: 600,
        }}
      >
        {BRAND_FOOTER}
      </div>
    </div>,
    size,
  );
}
