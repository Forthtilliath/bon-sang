import type { FeatureCollection } from "geojson";
import type { Map as MlMap } from "maplibre-gl";

import type { Collecte } from "./types";

// Fonds CARTO (vectoriels, gratuits, sans clé) : `voyager` et `dark-matter` sont
// assortis, donc la bascule clair/sombre reste homogène.
const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
export const FRANCE_CENTER: [number, number] = [2.35, 46.6];
export const SOURCE_ID = "collectes";

// Couleurs alignées sur `globals.css` (paint MapLibre : pas de `var(--…)`).
// Collectes en rouge globule, grappes en jaune plasma, sélection cerclée de plasma.
const MARKER_LIGHT = { fill: "#b8102b", cluster: "#f4c24f", ink: "#1f1216", halo: "#f7f1e8" };
const MARKER_DARK = { fill: "#ff6273", cluster: "#ffc94d", ink: "#1a0f05", halo: "#150b0e" };

const EMPTY_FC: FeatureCollection = { type: "FeatureCollection", features: [] };

function prefersDark(): boolean {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark") return true;
  if (explicit === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function styleUrl(): string {
  return prefersDark() ? STYLE_DARK : STYLE_LIGHT;
}

function markerColors() {
  return prefersDark() ? MARKER_DARK : MARKER_LIGHT;
}

export function motionDuration(ms: number): number {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

export function toFeatureCollection(collectes: Collecte[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: collectes
      .filter((c) => c.lat !== null && c.lng !== null)
      .map((c) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [c.lng as number, c.lat as number] },
        properties: { id: c.id },
      })),
  };
}

/** Source clusterisée + couches cercle/symbole. Rejouée après chaque `setStyle`. */
export function addClusterLayers(map: MlMap) {
  if (map.getSource(SOURCE_ID)) return;
  const { fill, cluster, ink, halo } = markerColors();

  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: EMPTY_FC,
    cluster: true,
    clusterRadius: 48,
    clusterMaxZoom: 13,
    promoteId: "id",
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": cluster,
      "circle-radius": ["step", ["get", "point_count"], 16, 10, 21, 30, 27],
      "circle-stroke-width": 2.5,
      "circle-stroke-color": ink,
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Open Sans Bold", "Noto Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
    },
    paint: { "text-color": ink },
  });

  map.addLayer({
    id: "unclustered",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": fill,
      "circle-radius": ["case", ["boolean", ["feature-state", "active"], false], 10, 7],
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "active"], false], 5, 2],
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "active"], false],
        cluster,
        halo,
      ],
    },
  });
}
