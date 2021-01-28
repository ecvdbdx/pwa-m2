const STATIC_CACHE = "v1.1";
const OFFLINE_PAGE = "offline.html";

self.addEventListener("install", (event) => {
  console.log("[SW] Installation event", event);

  /* Force new installed worker to activate */
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        "/",
        "/style.css",
        OFFLINE_PAGE,
        "/resilient-02.html",
      ]);
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
      .catch((error) => {
        console.log("Fetch failed; returning offline page instead.", error);

        return caches.match(OFFLINE_PAGE).then((offlineResponse) => {
          return offlineResponse;
        });
      })
  );
});
