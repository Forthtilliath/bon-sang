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

import type { Point } from "./filter";
import {
  addClusterLayers,
  FRANCE_CENTER,
  motionDuration,
  SOURCE_ID,
  styleUrl,
  toFeatureCollection,
} from "./map-layers";
import { popupContent, type PopupHelpers } from "./map-popup";
import type { Collecte } from "./types";

import "maplibre-gl/dist/maplibre-gl.css";
import "./collectes-map.css";

type Props = {
  collectes: Collecte[];
  activeId: string | null;
  origin: Point | null;
  onSelect: (id: string | null) => void;
  /** Appelé si la carte ne peut pas démarrer (WebGL indisponible, contexte perdu). */
  onError?: () => void;
};

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
      className="border-ink shadow-sticker h-80 w-full overflow-hidden rounded-3xl border-2 lg:h-full"
    />
  );
}
