// Vite replaces these tokens in dist/sw.js after each production build.
const CACHE_VERSION = "__ORBIT_CACHE_VERSION__";
const API_BASE_URL = "__ORBIT_API_URL__";
const CACHE_NAME = `orbit-shell-${CACHE_VERSION}`;
const SHELL_URLS = ["/", "/index.html", "/manifest.webmanifest"];
const ICON_URLS = ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png"];
const apiBase = new URL(API_BASE_URL, self.location.origin);

function isApiRequest(url) {
  if (url.origin === apiBase.origin && apiBase.origin !== self.location.origin) return true;
  if (url.origin !== apiBase.origin) return false;
  const path = apiBase.pathname.replace(/\/$/, "");
  return path === "" || url.pathname === path || url.pathname.startsWith(`${path}/`);
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_URLS);
    // The PNGs are generated separately; missing icons must not prevent SW installation.
    await Promise.allSettled(ICON_URLS.map((url) => cache.add(url)));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("orbit-shell-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "orbit-outbox") return;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "FLUSH_OUTBOX" }));
  }));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Authenticated API, cross-origin, WebSocket and mutation traffic always bypass caches.
  if (request.method !== "GET" || url.origin !== self.location.origin || isApiRequest(url) || /(^|\/)ws(\/|$)/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await fetch(request);
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match("/index.html");
        if (fallback) return fallback;
        throw new Error("Offline shell unavailable");
      }
    })());
    return;
  }

  if (/^\/assets\/.*-[A-Za-z0-9_-]{8,}\.[^/]+$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok && response.type === "basic") await cache.put(request, response.clone());
      return response;
    })());
  }
});

self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
  event.waitUntil(self.registration.showNotification(payload.title || "Orbit", {
    body: payload.body || "Yeni bildiriminiz var.",
    data: { url: "/notifications" },
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/notifications", self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil(self.clients.openWindow(url.pathname));
});
