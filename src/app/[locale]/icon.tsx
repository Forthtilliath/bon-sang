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
        background: "#d21f2c",
        color: "#ffffff",
        fontSize: 22,
        fontWeight: 700,
        borderRadius: 7,
        fontFamily: "sans-serif",
      }}
    >
      B
    </div>,
    size,
  );
}
