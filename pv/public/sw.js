// Bump VERSION to invalidate old caches after a deploy that changes the shell.
const VERSION = "v2";
const SHELL_CACHE = `pv-shell-${VERSION}`;
const RUNTIME_CACHE = `pv-runtime-${VERSION}`;

const SHELL_URLS = [
  "/",
  "/about",
  "/books",
  "/teachings",
  "/contact",
  "/blog",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Pages: network first so content stays fresh, cached copy when offline.
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: true })) ||
      (await caches.match("/")) ||
      Response.error()
    );
  }
}

// Hashed build assets, images and fonts: serve from cache, refresh in the background.
async function handleAsset(event) {
  const { request } = event;
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Admin and API responses are private or live data: never cache them.
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(?:png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname) ||
    SHELL_URLS.includes(url.pathname)
  ) {
    event.respondWith(handleAsset(event));
  }
});
