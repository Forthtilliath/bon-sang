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
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2s10 12.2 10 18a10 10 0 0 1-20 0C6 14.2 16 2 16 2Z" fill="#d21f2c" />
        <ellipse cx="12.5" cy="17" rx="2.4" ry="3.4" fill="#ffffff" fillOpacity="0.35" />
      </svg>
    </div>,
    size,
  );
}
