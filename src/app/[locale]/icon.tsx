import { ImageResponse } from "next/og";

import { routing } from "@/i18n/routing";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pastille rouge globule cerclée d'encre, goutte jaune plasma (cf. BrandMark). */}
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14.5" fill="#b8102b" stroke="#1f1216" strokeWidth="3" />
        <path d="M16 7s6 6.6 6 10.8a6 6 0 0 1-12 0C10 13.6 16 7 16 7Z" fill="#f4c24f" />
      </svg>
    </div>,
    size,
  );
}
