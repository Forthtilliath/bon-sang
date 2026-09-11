"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  type GeoJSONSource,
  LngLatBounds,
  Map as MlMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import { useFormatter, useTranslations } from "next-intl";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Point } from "./filter";
import { collecteAddress } from "./normalize";
import type { Collecte } from "./types";

// Fonds CARTO (vectoriels, gratuits, sans clé) : `voyager` et `dark-matter` sont
// assortis, donc la bascule clair/sombre reste homogène.
const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const FRANCE_CENTER: [number, number] = [2.35, 46.6];
const SOURCE_ID = "collectes";

// Couleurs alignées sur `globals.css` (paint MapLibre : pas de `var(--…)`).
const MARKER_LIGHT = { fill: "#d21f2c", ring: "#b3161f" };
const MARKER_DARK = { fill: "#f0434f", ring: "#d81f2a" };

const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

function prefersDark(): boolean {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark") return true;
  if (explicit === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function styleUrl(): string {
  return prefersDark() ? STYLE_DARK : STYLE_LIGHT;
}

function markerColors() {
  return prefersDark() ? MARKER_DARK : MARKER_LIGHT;
}

function motionDuration(ms: number): number {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

type Props = {
  collectes: Collecte[];
  activeId: string | null;
  origin: Point | null;
  onSelect: (id: string | null) => void;
  /** Appelé si la carte ne peut pas démarrer (WebGL indisponible, contexte perdu). */
  onError?: () => void;
};

type PopupHelpers = {
  t: ReturnType<typeof useTranslations<"Collectes">>;
  format: ReturnType<typeof useFormatter>;
};

function toFeatureCollection(collectes: Collecte[]): GeoJSON.FeatureCollection {
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
function addClusterLayers(map: MlMap) {
  if (map.getSource(SOURCE_ID)) return;
  const { fill, ring } = markerColors();

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
      "circle-color": fill,
      "circle-opacity": 0.92,
      "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 26],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
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
    paint: { "text-color": "#fff" },
  });

  map.addLayer({
    id: "unclustered",
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": fill,
      "circle-radius": ["case", ["boolean", ["feature-state", "active"], false], 9, 6],
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "active"], false], 4, 2],
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "active"], false],
        ring,
        "#fff",
      ],
    },
  });
}

function el(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Contenu DOM d'une bulle d'info de collecte (jamais de HTML brut : `textContent`). */
function popupContent(collecte: Collecte, { t, format }: PopupHelpers): HTMLElement {
  const root = el("div", "ofm-popup");
  root.append(el("strong", "ofm-popup__title", collecte.nom || collecte.ville));

  const place = collecteAddress(collecte);
  if (place) root.append(el("span", "ofm-popup__muted", place));

  if (collecte.fixe) {
    root.append(el("span", "ofm-popup__accent", t("permanent")));
    if (collecte.horaires)
      root.append(el("span", "ofm-popup__muted ofm-popup__pre", collecte.horaires));
  } else if (collecte.date) {
    const when = format.dateTime(new Date(`${collecte.date}T12:00:00`), { dateStyle: "full" });
    const hours = collecte.heureDebut
      ? ` · ${collecte.heureDebut}${collecte.heureFin ? `–${collecte.heureFin}` : ""}`
      : "";
    root.append(el("span", "ofm-popup__accent", `${when}${hours}`));
  }

  if (collecte.typesDon.length > 0) {
    const tags = el("span", "ofm-popup__tags");
    for (const kind of collecte.typesDon) {
      tags.append(el("span", "ofm-popup__tag", t(`kinds.${kind}`)));
    }
    root.append(tags);
  }

  if (collecte.placesRestantes === 0) {
    root.append(el("span", "ofm-popup__accent", t("full")));
  } else if (typeof collecte.placesRestantes === "number") {
    root.append(
      el("span", "ofm-popup__muted", t("spotsLeft", { count: collecte.placesRestantes })),
    );
  }

  if (collecte.rdvUrl) {
    const link = el("a", "ofm-popup__link", t("book"));
    (link as HTMLAnchorElement).href = collecte.rdvUrl;
    (link as HTMLAnchorElement).target = "_blank";
    (link as HTMLAnchorElement).rel = "noopener noreferrer";
    root.append(link);
  }

  return root;
}

export function CollectesMap({ collectes, activeId, origin, onSelect, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const originMarkerRef = useRef<Marker | null>(null);
  const popupRef = useRef<Popup | null>(null);
  // Vrai quand on retire la bulle par code (évite de déclencher `onSelect(null)`).
  const closingPopupRef = useRef(false);

  const collectesRef = useRef(collectes);
  const activeIdRef = useRef(activeId);
  const onSelectRef = useRef(onSelect);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onErrorRef.current = onError;
  }, [onSelect, onError]);

  const removePopup = useCallback(() => {
    if (!popupRef.current) return;
    closingPopupRef.current = true;
    popupRef.current.remove();
    closingPopupRef.current = false;
    popupRef.current = null;
  }, []);

  const t = useTranslations("Collectes");
  const format = useFormatter();
  const helpersRef = useRef<PopupHelpers>({ t, format });
  useEffect(() => {
    helpersRef.current = { t, format };
  }, [t, format]);

  /** (Re)pousse les données dans la source et recadre la vue. */
  const applyData = useCallback(() => {
    const map = mapRef.current;
    const source = map?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!map || !source) return;

    const fc = toFeatureCollection(collectesRef.current);
    source.setData(fc);

    if (activeIdRef.current) {
      map.setFeatureState({ source: SOURCE_ID, id: activeIdRef.current }, { active: true });
    }

    // Ne recadre pas si une collecte est sélectionnée (on reste sur son survol).
    if (fc.features.length > 0 && !activeIdRef.current) {
      const bounds = new LngLatBounds();
      for (const feature of fc.features) {
        bounds.extend((feature.geometry as GeoJSON.Point).coordinates as [number, number]);
      }
      map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: motionDuration(400) });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    let map: MlMap;
    try {
      map = new MlMap({
        container,
        style: styleUrl(),
        center: FRANCE_CENTER,
        zoom: 4.5,
      });
    } catch {
      // WebGL indisponible : la liste prend le relais.
      onErrorRef.current?.();
      return;
    }

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    const setupLayers = () => {
      addClusterLayers(map);
      applyData();
    };

    map.on("load", () => map.resize());
    // `style.load` couvre le chargement initial et chaque bascule de thème
    // (`setStyle` purge la source et les couches, qu'on rejoue ici).
    map.on("style.load", setupLayers);
    map.on("webglcontextlost", () => onErrorRef.current?.());

    map.on("click", "clusters", (event) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      if (clusterId == null) return;
      const source = map.getSource(SOURCE_ID) as GeoJSONSource;
      void source.getClusterExpansionZoom(clusterId).then((zoom) => {
        map.easeTo({
          center: (feature!.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
          duration: motionDuration(400),
        });
      });
    });

    map.on("click", "unclustered", (event) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === "string") onSelectRef.current(id);
    });

    for (const layer of ["clusters", "unclustered"] as const) {
      map.on("mouseenter", layer, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => map.setStyle(styleUrl());
    media.addEventListener("change", onThemeChange);
    // Bascule de thème manuelle (émise par le sélecteur de thème de l'en-tête).
    window.addEventListener("bonsang:themechange", onThemeChange);

    // La colonne carte est masquée/affichée selon la vue mobile : on suit sa taille.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    return () => {
      media.removeEventListener("change", onThemeChange);
      window.removeEventListener("bonsang:themechange", onThemeChange);
      resizeObserver.disconnect();
      removePopup();
      originMarkerRef.current?.remove();
      originMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [applyData, removePopup]);

  // Nouvelle liste filtrée : on met à jour la source et on recadre.
  useEffect(() => {
    collectesRef.current = collectes;
    applyData();
  }, [collectes, applyData]);

  // Marqueur de position (géolocalisation).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    originMarkerRef.current?.remove();
    originMarkerRef.current = null;
    if (!origin) return;

    const dot = document.createElement("div");
    dot.className = "ofm-origin";
    originMarkerRef.current = new Marker({ element: dot })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
  }, [origin]);

  // Centre sur la collecte sélectionnée, la met en évidence et ouvre sa bulle d'info.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const previousActive = activeIdRef.current;
    activeIdRef.current = activeId;

    if (map.getSource(SOURCE_ID)) {
      if (previousActive && previousActive !== activeId) {
        map.setFeatureState({ source: SOURCE_ID, id: previousActive }, { active: false });
      }
      if (activeId) {
        map.setFeatureState({ source: SOURCE_ID, id: activeId }, { active: true });
      }
    }

    const collecte = activeId ? collectes.find((c) => c.id === activeId) : null;

    if (!collecte || collecte.lat === null || collecte.lng === null) {
      removePopup();
      return;
    }

    map.flyTo({ center: [collecte.lng, collecte.lat], zoom: 13, duration: motionDuration(600) });

    removePopup();
    const popup = new Popup({
      offset: 16,
      maxWidth: "280px",
      className: "ofm-popup-shell",
      closeOnClick: false,
    })
      .setLngLat([collecte.lng, collecte.lat])
      .setDOMContent(popupContent(collecte, helpersRef.current))
      .addTo(map);
    popup.on("close", () => {
      if (!closingPopupRef.current) onSelect(null);
    });
    popupRef.current = popup;

    // Accessibilité clavier : la bulle devient un dialogue focusable, Escape la
    // ferme, le bouton de fermeture reçoit un libellé traduit.
    const popupEl = popup.getElement();
    popupEl.setAttribute("role", "dialog");
    popupEl.setAttribute("aria-label", collecte.nom || collecte.ville);
    popupEl.tabIndex = -1;
    popupEl
      .querySelector(".maplibregl-popup-close-button")
      ?.setAttribute("aria-label", helpersRef.current.t("mapPopupClose"));
    popupEl.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onSelect(null);
      }
    };
    popupEl.addEventListener("keydown", onKeyDown);

    return () => {
      popupEl.removeEventListener("keydown", onKeyDown);
    };
  }, [activeId, collectes, onSelect, removePopup]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t("mapLabel")}
      className="border-border h-80 w-full overflow-hidden rounded-2xl border lg:h-full"
    />
  );
}
