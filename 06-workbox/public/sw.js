importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);

const STATIC_CACHE = "v1.1";
const { precaching, core } = workbox;

/* Create cache */
core.setCacheNameDetails({ prefix: STATIC_CACHE });

precaching.precacheAndRoute([], {});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activation event", event);
});

self.addEventListener("fetch", (event) => {
  console.log("[SW] Fetch event", event);
  event.respondWith(
    caches
      .match(event.request)
      .then((responseFromCache) => {
        if (responseFromCache) {
          return responseFromCache;
        }
        return fetch(event.request);
      })
      .catch(() => {
        return fetch(event.request);
      })
  );
});
