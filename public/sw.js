/* Service worker for dimasc.tf.
 *
 * GitHub Pages caches every response for ten minutes, hashed assets included,
 * so each return visit re-downloads the framework and the room. This worker
 * gives the site the caching its files deserve:
 *
 *   _next/static/*            cache-first      (content-hashed, immutable)
 *   images, fonts, room files stale-while-revalidate
 *   pages, route data, JSON   network-first, cache only as an offline fallback
 *
 * Nothing is precached: the first visit costs exactly what it did before.
 */
const VERSION = "v1";
const STATIC = `dm-static-${VERSION}`;
const MEDIA = `dm-media-${VERSION}`;
const PAGES = `dm-pages-${VERSION}`;
const LIMITS = { [STATIC]: 300, [MEDIA]: 200, [PAGES]: 80 };

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("dm-") && !LIMITS[name])
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const MEDIA_PATH = /\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?)$/i;
const DATA_PATH = /\.(?:json|txt|xml)$/i;

function classify(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;
  if (url.pathname.startsWith("/_next/static/")) return STATIC;
  if (request.mode === "navigate" || request.destination === "document")
    return PAGES;
  if (url.searchParams.has("_rsc") || DATA_PATH.test(url.pathname))
    return PAGES;
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    MEDIA_PATH.test(url.pathname)
  )
    return MEDIA;
  return null;
}

async function trim(name) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  const extra = keys.length - LIMITS[name];
  if (extra > 0) await Promise.all(keys.slice(0, extra).map((k) => cache.delete(k)));
}

async function put(name, request, response) {
  if (!response || !response.ok || response.type !== "basic") return;
  const cache = await caches.open(name);
  await cache.put(request, response);
  trim(name).catch(() => {});
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  put(STATIC, request, response.clone()).catch(() => {});
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const refresh = fetch(request)
    .then((response) => {
      put(MEDIA, request, response.clone()).catch(() => {});
      return response;
    })
    .catch(() => cached);
  return cached || refresh;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    put(PAGES, request, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: false });
    if (cached) return cached;
    if (request.mode === "navigate") {
      const home = await caches.match(new URL("/", self.location.origin).href);
      if (home) return home;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const bucket = classify(request);
  if (!bucket) return;
  event.respondWith(
    bucket === STATIC
      ? cacheFirst(request)
      : bucket === MEDIA
        ? staleWhileRevalidate(request)
        : networkFirst(request),
  );
});
