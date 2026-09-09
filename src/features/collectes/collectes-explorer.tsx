"use client";

import { useMemo, useState } from "react";
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

const CollectesMap = dynamic(() => import("./collectes-map").then((mod) => mod.CollectesMap), {
  ssr: false,
  loading: () => (
    <div className="border-border bg-surface h-80 w-full animate-pulse rounded-2xl border lg:h-full" />
  ),
});

type GeoStatus = "idle" | "loading" | "denied" | "unsupported";

export function CollectesExplorer({ collectes }: { collectes: Collecte[] }) {
  const t = useTranslations("Collectes");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [origin, setOrigin] = useState<Point | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);

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

      <p className="text-muted text-sm">{t("visibleCount", { count: visible.length })}</p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
          {visible.map((collecte) => (
            <li key={collecte.id}>
              <ExplorerCard
                collecte={collecte}
                distanceKm={collecte.distanceKm}
                active={collecte.id === activeId}
                onSelect={() => setActiveId(collecte.id)}
              />
            </li>
          ))}
          {visible.length === 0 ? (
            <li className="text-muted text-sm">{t("noneMatchFilters")}</li>
          ) : null}
        </ul>

        <div className="lg:sticky lg:top-20 lg:h-[70vh]">
          <CollectesMap
            collectes={visible}
            activeId={activeId}
            origin={origin}
            onSelect={setActiveId}
          />
        </div>
      </div>
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

  return (
    <div
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
