"use client";

import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import { useFormatter, useTranslations } from "next-intl";

import { ExternalLink } from "@/components/ui/external-link";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import { DON_KINDS } from "./types";
import {
  DEFAULT_FILTERS,
  type Filters,
  type Period,
  PERIODS,
  type Point,
  filterCollectes,
  toggleKind,
  withDistance,
} from "./filter";
import type { Collecte } from "./types";
import { MapErrorBoundary } from "./map-error-boundary";

const CollectesMap = dynamic(() => import("./collectes-map").then((mod) => mod.CollectesMap), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="border-border bg-surface h-80 w-full animate-pulse rounded-2xl border lg:h-full" />
  );
}

/**
 * Diffère le chargement du bundle `maplibre-gl` : la carte (et son import) n'est
 * montée qu'une fois le conteneur proche du viewport, ou plus tôt si `eager`
 * (bascule vers la vue carte, sélection d'une collecte).
 */
function DeferredMap({
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
      className="border-border bg-surface h-80 w-full animate-pulse rounded-2xl border lg:h-full"
    />
  );
}

type GeoStatus = "idle" | "loading" | "denied" | "unsupported";

export function CollectesExplorer({ collectes }: { collectes: Collecte[] }) {
  const t = useTranslations("Collectes");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [origin, setOrigin] = useState<Point | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  // Vue mobile : liste ou carte (les deux côte à côte dès `lg`).
  const [view, setView] = useState<"list" | "map">("list");

  const selectCollecte = (id: string | null) => {
    setActiveId(id);
    if (id) setView("map");
  };

  const today = formatIsoDate(new Date());

  const visible = useMemo(
    () => withDistance(filterCollectes(collectes, filters, today), origin),
    [collectes, filters, origin, today],
  );

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">{t("filterKinds")}</legend>
          {DON_KINDS.map((kind) => {
            const active = filters.kinds.includes(kind);
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters((f) => ({ ...f, kinds: toggleKind(f.kinds, kind) }))}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary-subtle text-primary"
                    : "border-border text-muted hover:bg-surface",
                )}
              >
                {t(`kinds.${kind}`)}
              </button>
            );
          })}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <div className="border-border flex rounded-full border p-0.5 text-sm">
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={filters.period === period}
                onClick={() => setFilters((f) => ({ ...f, period: period as Period }))}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors",
                  filters.period === period ? "bg-primary text-primary-fg" : "text-muted",
                )}
              >
                {t(`periods.${period}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={locate}
            disabled={geoStatus === "loading"}
            className="border-border text-muted hover:bg-surface rounded-full border px-3 py-1 text-sm disabled:opacity-60"
          >
            {geoStatus === "loading" ? t("locating") : t("locate")}
          </button>
          {geoStatus === "denied" ? (
            <span className="text-muted text-xs">{t("locateDenied")}</span>
          ) : null}
          {geoStatus === "unsupported" ? (
            <span className="text-muted text-xs">{t("locateUnsupported")}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted text-sm" role="status" aria-live="polite">
          {t("visibleCount", { count: visible.length })}
        </p>

        <div
          className="border-border flex rounded-full border p-0.5 text-sm lg:hidden"
          role="group"
          aria-label={t("viewToggle")}
        >
          {(["list", "map"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                view === option ? "bg-primary text-primary-fg" : "text-muted",
              )}
            >
              {t(`views.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul
          className={cn(
            "max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1 lg:flex",
            view === "map" ? "hidden" : "flex",
          )}
        >
          {visible.map((collecte) => (
            <li key={collecte.id}>
              <ExplorerCard
                collecte={collecte}
                distanceKm={collecte.distanceKm}
                active={collecte.id === activeId}
                onSelect={() => selectCollecte(collecte.id)}
              />
            </li>
          ))}
          {visible.length === 0 ? (
            <li className="text-muted text-sm">{t("noneMatchFilters")}</li>
          ) : null}
        </ul>

        <div
          className={cn(
            "lg:sticky lg:top-20 lg:block lg:h-[70vh]",
            view === "list" ? "hidden" : "block",
          )}
        >
          {mapFailed ? (
            <MapUnavailable />
          ) : (
            <MapErrorBoundary onError={() => setMapFailed(true)} fallback={<MapUnavailable />}>
              <DeferredMap
                eager={activeId !== null || view === "map"}
                collectes={visible}
                activeId={activeId}
                origin={origin}
                onSelect={setActiveId}
                onError={() => setMapFailed(true)}
              />
            </MapErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

function MapUnavailable() {
  const t = useTranslations("Collectes");
  return (
    <div className="border-border bg-surface text-muted flex h-80 w-full flex-col items-center justify-center gap-1 rounded-2xl border p-6 text-center text-sm lg:h-full">
      <p className="text-fg font-medium">{t("mapUnavailable")}</p>
      <p className="max-w-xs">{t("mapUnavailableHint")}</p>
    </div>
  );
}

function ExplorerCard({
  collecte,
  distanceKm,
  active,
  onSelect,
}: {
  collecte: Collecte;
  distanceKm: number | null;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("Collectes");
  const format = useFormatter();
  const ref = useRef<HTMLDivElement>(null);

  // Sélection depuis la carte : ramène la fiche correspondante dans la liste.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border p-4 text-sm transition-colors",
        active ? "border-primary bg-primary-subtle" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex flex-col gap-1.5 text-left"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="font-medium">{collecte.nom || collecte.ville}</span>
          {collecte.fixe ? (
            <span className="text-primary text-xs font-medium">{t("permanent")}</span>
          ) : collecte.date ? (
            <span className="text-primary text-xs font-medium">
              {format.dateTime(new Date(`${collecte.date}T12:00:00`), { dateStyle: "medium" })}
              {collecte.heureDebut ? ` · ${collecte.heureDebut}` : ""}
            </span>
          ) : null}
        </span>
        <span className="text-muted">
          {[collecte.codePostal, collecte.ville].filter(Boolean).join(" ")}
          {distanceKm !== null ? ` · ${t("distance", { km: Math.round(distanceKm) })}` : ""}
        </span>
      </button>
      <span className="flex flex-wrap gap-1.5">
        {collecte.typesDon.map((kind) => (
          <span
            key={kind}
            className="border-border text-muted rounded-full border px-2 py-0.5 text-xs"
          >
            {t(`kinds.${kind}`)}
          </span>
        ))}
      </span>
      {collecte.rdvUrl ? (
        <ExternalLink href={collecte.rdvUrl} className="text-xs">
          {t("book")}
        </ExternalLink>
      ) : null}
    </div>
  );
}
