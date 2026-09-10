"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

type Theme = "system" | "light" | "dark";

const ORDER: Theme[] = ["system", "light", "dark"];
const STORAGE_KEY = "theme";
const EVENT = "bonsang:themechange";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTheme(): Theme {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage indisponible (mode privé, quota) : le choix reste sur cette page.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle() {
  const t = useTranslations("Theme");
  // Avant l'hydratation : « système » (identique côté serveur), puis valeur réelle.
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);

  const cycle = () => apply(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]);

  const label = `${t("label")} : ${t(theme)}`;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="text-muted hover:bg-surface hover:text-fg rounded-full p-2"
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (theme === "light") {
    return (
      <svg {...common}>
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg {...common}>
        <path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="15" height="10" rx="1.5" />
      <path d="M7 17h6M10 14v3" />
    </svg>
  );
}
