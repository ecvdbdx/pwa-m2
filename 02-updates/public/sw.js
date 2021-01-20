const STATIC_CACHE = "v1.1";

self.addEventListener("install", (event) => {
  console.log("[SW] Installation event", event);

  /* Force new installed worker to activate */
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(["/", "/style.css"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activation event", event);

  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== STATIC_CACHE) {
          caches.delete(cacheName);
        }
      })
    );
  });
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
