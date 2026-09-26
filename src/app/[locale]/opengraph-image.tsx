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
        background: "#2a0f16",
        color: "#f7f1e8",
        fontFamily: "sans-serif",
      }}
    >
      {/* Grosse goutte rouge globule qui déborde à droite. */}
      <svg
        width="420"
        height="520"
        viewBox="0 0 24 24"
        style={{ position: "absolute", right: -60, top: 70, transform: "rotate(14deg)" }}
      >
        <path
          d="M12 2.5s7.25 7.9 7.25 12.9a7.25 7.25 0 0 1-14.5 0C4.75 10.4 12 2.5 12 2.5Z"
          fill="#b8102b"
          stroke="#f4c24f"
          strokeWidth="0.4"
        />
      </svg>
      <div style={{ display: "flex", fontSize: 120, fontWeight: 700, letterSpacing: -3 }}>
        <span>{BRAND_PREFIX}</span>
        <span style={{ color: "#f4c24f", fontStyle: "italic" }}>{BRAND_HIGHLIGHT}</span>
      </div>
      <div style={{ fontSize: 40, color: "#cbb5ad", maxWidth: 820, lineHeight: 1.3 }}>
        {t("description")}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 96,
          fontSize: 26,
          color: "#1f1216",
          background: "#f4c24f",
          padding: "8px 22px",
          borderRadius: 999,
          fontWeight: 600,
        }}
      >
        {BRAND_FOOTER}
      </div>
    </div>,
    size,
  );
}
