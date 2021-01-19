self.addEventListener("install", (event) => {
  console.log("[SW] Installation event", event);

  /* Force new installed worker to activate */
  self.skipWaiting();

  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/style.css"]);
    })
  );
});

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
