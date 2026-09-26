"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { cardClasses } from "@/components/ui/card";
import { chipClasses, SEGMENT_GROUP, segmentClasses } from "@/components/ui/chip";
import { inputClasses } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatIsoDate } from "@/lib/dates";

import { DON_KINDS } from "./types";
import {
  DEFAULT_FILTERS,
  type Filters,
  type Period,
  PERIODS,
  type Point,
  RADII_KM,
  type Sort,
  SORTS,
  filterCollectes,
  sortCollectes,
  toggleKind,
  withDistance,
  withinRadius,
} from "./filter";
import type { Collecte } from "./types";
import { ExplorerCard } from "./explorer-card";
import { DeferredMap, MapUnavailable } from "./explorer-map";
import { MapErrorBoundary } from "./map-error-boundary";

type GeoStatus = "idle" | "loading" | "denied" | "unsupported";

export function CollectesExplorer({ collectes }: { collectes: Collecte[] }) {
  const t = useTranslations("Collectes");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [origin, setOrigin] = useState<Point | null>(null);
  const [sort, setSort] = useState<Sort>("date");
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  // Lien profond `?id=` : présélectionne la collecte visée par un lien partagé.
  const [activeId, setActiveId] = useState<string | null>(() => searchParams.get("id"));
  const [mapFailed, setMapFailed] = useState(false);
  // Vue mobile : liste ou carte (les deux côte à côte dès `lg`).
  const [view, setView] = useState<"list" | "map">(() => (searchParams.get("id") ? "map" : "list"));

  const selectCollecte = (id: string | null) => {
    setActiveId(id);
    if (id) setView("map");
    // Reflète la sélection dans l'URL (sans entrée d'historique) : la page devient
    // partageable telle quelle.
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("id", id);
    else params.delete("id");
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  };

  const buildShareUrl = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    const path = `${pathname}?${params.toString()}`;
    return typeof window === "undefined" ? path : `${window.location.origin}${path}`;
  };

  const today = formatIsoDate(new Date());

  const visible = useMemo(() => {
    const withDist = withDistance(filterCollectes(collectes, filters, today), origin);
    const ranged = origin ? withinRadius(withDist, filters.radiusKm) : withDist;
    return sortCollectes(ranged, sort);
  }, [collectes, filters, origin, sort, today]);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // « Autour de moi » implique naturellement un tri par distance.
        setSort("distance");
        setGeoStatus("idle");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className={cardClasses({ variant: "soft", className: "flex flex-col gap-3 p-4" })}>
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
                className={chipClasses(active)}
              >
                {t(`kinds.${kind}`)}
              </button>
            );
          })}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <div className={SEGMENT_GROUP}>
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={filters.period === period}
                onClick={() => setFilters((f) => ({ ...f, period: period as Period }))}
                className={segmentClasses(filters.period === period)}
              >
                {t(`periods.${period}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={locate}
            disabled={geoStatus === "loading"}
            className={chipClasses(
              origin !== null,
              "flex items-center gap-1.5 disabled:opacity-60",
            )}
          >
            {geoStatus === "loading" ? t("locating") : t("locate")}
          </button>
          {geoStatus === "denied" ? (
            <span className="text-muted text-xs">{t("locateDenied")}</span>
          ) : null}
          {geoStatus === "unsupported" ? (
            <span className="text-muted text-xs">{t("locateUnsupported")}</span>
          ) : null}

          {origin ? (
            <>
              <label className="text-muted flex items-center gap-1.5 text-sm">
                {t("radiusLabel")}
                <select
                  value={filters.radiusKm ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      radiusKm: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className={inputClasses("rounded-full px-3 py-1")}
                >
                  <option value="">{t("radiusAny")}</option>
                  {RADII_KM.map((km) => (
                    <option key={km} value={km}>
                      {t("radiusValue", { km })}
                    </option>
                  ))}
                </select>
              </label>

              <div className={SEGMENT_GROUP} role="group" aria-label={t("sortLabel")}>
                {SORTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={sort === option}
                    onClick={() => setSort(option)}
                    className={segmentClasses(sort === option)}
                  >
                    {t(`sorts.${option}`)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted text-sm" role="status" aria-live="polite">
          {t("visibleCount", { count: visible.length })}
        </p>

        <div className={cn(SEGMENT_GROUP, "lg:hidden")} role="group" aria-label={t("viewToggle")}>
          {(["list", "map"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => setView(option)}
              className={segmentClasses(view === option)}
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
                shareUrl={buildShareUrl(collecte.id)}
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
