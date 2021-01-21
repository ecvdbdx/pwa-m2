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

  event.waitUntil(self.clients.claim());

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

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SAY_HELLO") {
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clients) => {
        if (clients && clients.length) {
          /* Send a response from Service Worker - the clients array is ordered by last focused */
          setTimeout(() => {
            clients[0].postMessage({
              type: "SAY_HELLO",
              payload: "Hello back from the Service Worker !",
            });
          }, 2000);
        }
      });
  }
});
