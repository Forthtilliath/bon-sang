"use client";

import { useCallback, useEffect, useRef } from "react";
import { LngLatBounds, Map as MlMap, Marker, NavigationControl, Popup } from "maplibre-gl";
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
const ORIGIN_KEY = "__origin__";

function styleUrl(): string {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? STYLE_DARK : STYLE_LIGHT;
}

function motionDuration(ms: number): number {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

type Props = {
  collectes: Collecte[];
  activeId: string | null;
  origin: Point | null;
  onSelect: (id: string | null) => void;
};

type PopupHelpers = {
  t: ReturnType<typeof useTranslations<"Collectes">>;
  format: ReturnType<typeof useFormatter>;
};

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

  if (typeof collecte.placesRestantes === "number") {
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

export function CollectesMap({ collectes, activeId, origin, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef(new globalThis.Map<string, Marker>());
  const popupRef = useRef<Popup | null>(null);
  // Vrai quand on retire la bulle par code (évite de déclencher `onSelect(null)`).
  const closingPopupRef = useRef(false);

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

  useEffect(() => {
    const container = containerRef.current;
    const markers = markersRef.current;
    if (!container || mapRef.current) return;

    const map = new MlMap({
      container,
      style: styleUrl(),
      center: FRANCE_CENTER,
      zoom: 4.5,
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => map.resize());
    mapRef.current = map;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onThemeChange = () => map.setStyle(styleUrl());
    media.addEventListener("change", onThemeChange);

    return () => {
      media.removeEventListener("change", onThemeChange);
      removePopup();
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, [removePopup]);

  // (Re)pose les marqueurs des collectes quand la liste filtrée change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of markersRef.current) {
      if (id !== ORIGIN_KEY) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    const bounds = new LngLatBounds();
    let count = 0;

    for (const collecte of collectes) {
      if (collecte.lat === null || collecte.lng === null) continue;
      const marker = document.createElement("button");
      marker.type = "button";
      marker.setAttribute("aria-label", collecte.nom || collecte.ville);
      marker.className = "ofm-marker";
      marker.addEventListener("click", () => onSelect(collecte.id));

      markersRef.current.set(
        collecte.id,
        new Marker({ element: marker }).setLngLat([collecte.lng, collecte.lat]).addTo(map),
      );
      bounds.extend([collecte.lng, collecte.lat]);
      count += 1;
    }

    if (count > 0) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: motionDuration(400) });
    }
  }, [collectes, onSelect]);

  // Marqueur de position (géolocalisation).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.get(ORIGIN_KEY)?.remove();
    markersRef.current.delete(ORIGIN_KEY);
    if (!origin) return;

    const dot = document.createElement("div");
    dot.className = "ofm-marker ofm-marker--origin";
    markersRef.current.set(
      ORIGIN_KEY,
      new Marker({ element: dot }).setLngLat([origin.lng, origin.lat]).addTo(map),
    );
  }, [origin]);

  // Centre sur la collecte sélectionnée, la met en évidence et ouvre sa bulle d'info.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of markersRef.current) {
      if (id === ORIGIN_KEY) continue;
      marker.getElement().classList.toggle("ofm-marker--active", id === activeId);
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
  }, [activeId, collectes, onSelect, removePopup]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Carte des collectes"
      className="border-border h-80 w-full overflow-hidden rounded-2xl border lg:h-full"
    />
  );
}
