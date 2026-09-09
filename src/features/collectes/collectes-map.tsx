"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map as MlMap, Marker, NavigationControl } from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Point } from "./filter";
import type { Collecte } from "./types";

const STYLE_LIGHT = "https://tiles.openfreemap.org/styles/positron";
const STYLE_DARK = "https://tiles.openfreemap.org/styles/dark";
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
  onSelect: (id: string) => void;
};

export function CollectesMap({ collectes, activeId, origin, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef(new globalThis.Map<string, Marker>());

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
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

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
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", collecte.nom || collecte.ville);
      el.className =
        "size-3.5 cursor-pointer rounded-full border-2 border-white bg-[#d21f2c] shadow-sm";
      el.addEventListener("click", () => onSelect(collecte.id));

      markersRef.current.set(
        collecte.id,
        new Marker({ element: el }).setLngLat([collecte.lng, collecte.lat]).addTo(map),
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

    const el = document.createElement("div");
    el.className = "size-4 rounded-full border-2 border-white bg-blue-600 shadow";
    markersRef.current.set(
      ORIGIN_KEY,
      new Marker({ element: el }).setLngLat([origin.lng, origin.lat]).addTo(map),
    );
  }, [origin]);

  // Centre sur la collecte sélectionnée et la met en évidence.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const [id, marker] of markersRef.current) {
      if (id === ORIGIN_KEY) continue;
      marker.getElement().classList.toggle("ring-3", id === activeId);
      marker.getElement().classList.toggle("ring-[#d21f2c]/50", id === activeId);
    }

    if (!activeId) return;
    const collecte = collectes.find((c) => c.id === activeId);
    if (collecte && collecte.lat !== null && collecte.lng !== null) {
      map.flyTo({ center: [collecte.lng, collecte.lat], zoom: 13, duration: motionDuration(600) });
    }
  }, [activeId, collectes]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Carte des collectes"
      className="border-border h-80 w-full overflow-hidden rounded-2xl border lg:h-full"
    />
  );
}
