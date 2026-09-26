"use client";

import { type ComponentProps, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const CollectesMap = dynamic(() => import("./collectes-map").then((mod) => mod.CollectesMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="border-ink bg-surface h-80 w-full animate-pulse rounded-3xl border-2 lg:h-full" />
  );
}

/**
 * Diffère le chargement du bundle `maplibre-gl` : la carte (et son import) n'est
 * montée qu'une fois le conteneur proche du viewport, ou plus tôt si `eager`
 * (bascule vers la vue carte, sélection d'une collecte).
 */
export function DeferredMap({
  eager,
  ...props
}: ComponentProps<typeof CollectesMap> & { eager?: boolean }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // `false` au rendu serveur et à la 1re passe client (hydratation identique),
  // `true` ensuite : évite toute divergence sur le contenu de cette colonne.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const canObserve = hydrated && typeof IntersectionObserver !== "undefined";
  const visible = eager === true || inView || (hydrated && !canObserve);

  useEffect(() => {
    if (visible || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  if (visible) return <CollectesMap {...props} />;
  return (
    <div
      ref={ref}
      aria-hidden
      className="border-ink bg-surface h-80 w-full animate-pulse rounded-3xl border-2 lg:h-full"
    />
  );
}

export function MapUnavailable() {
  const t = useTranslations("Collectes");
  return (
    <div className="border-ink bg-surface text-muted flex h-80 w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed p-6 text-center text-sm lg:h-full">
      <p className="font-display text-fg text-lg font-semibold">{t("mapUnavailable")}</p>
      <p className="max-w-xs">{t("mapUnavailableHint")}</p>
    </div>
  );
}
