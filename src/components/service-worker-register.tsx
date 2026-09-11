"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker de l'app shell (`public/sw.js`) : quiz d'éligibilité
 * et `/mon-suivi` restent utilisables hors ligne après une première visite en ligne.
 * Production uniquement (pas de cache à traquer en dev, où le build change sans cesse).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : l'app reste utilisable en ligne, simplement sans mode hors-ligne.
    });
  }, []);

  return null;
}
