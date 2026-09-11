// Service worker « app shell » : rend le quiz d'éligibilité et /mon-suivi
// utilisables hors ligne après une première visite en ligne. Ne préchauffe ni
// ne met en cache les données de collectes (API EFS) ni les ressources
// cross-origin (tuiles CARTO, polices) : elles doivent toujours venir du réseau.
const CACHE_NAME = "bon-sang-shell-v1";

// Les deux locales (FR sans préfixe, EN sous /en) des pages utilisables hors ligne.
const SHELL_URLS = ["/", "/eligibilite", "/mon-suivi", "/en", "/en/eligibilite", "/en/mon-suivi"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});

/** Navigation : réseau d'abord (contenu à jour), repli sur le cache hors ligne. */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    void cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? (await caches.match("/")) ?? Response.error();
  }
}

/** Assets statiques Next (fingerprintés par contenu) : cache d'abord. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  void cache.put(request, response.clone());
  return response;
}
