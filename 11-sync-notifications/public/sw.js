importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);

/* Uncomment to disable console logs */
// self.__WB_DISABLE_DEV_LOGS = true;

const STATIC_CACHE = "v1.1";
const {
  precaching,
  core,
  routing,
  strategies,
  cacheableResponse,
  expiration,
  backgroundSync,
} = workbox;

/**** Cache statics ****/
core.setCacheNameDetails({ prefix: STATIC_CACHE });

precaching.precacheAndRoute([], {});

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new strategies.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
  })
);

// Cache the underlying font files.
routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new strategies.CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      /* Take response code 0 into account. See https://stackoverflow.com/questions/39109789/what-limitations-apply-to-opaque-responses */
      new cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      /* Set expiration in one year */
      new expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

/**** Background Sync ****/
const bgSyncQueue = new backgroundSync.Queue("Answers", {
  /* Retry for a max of 24 hours */
  maxRetentionTime: 24 * 60,

  /* To include custom logic (notifications etc...) we have to implement our own replayRequest */
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);

        const url = await entry.request.referrer;

        if (self.Notification.permission === "granted") {
          self.registration.showNotification(
            "Vos réponses en attente ont bien été synchronisées",
            {
              icon: "./icons/android-icon-192x192.png",
              body: url,
            }
          );

          /* Redirect user to the page the request went from on notification click */
          self.addEventListener("notificationclick", async (event) => {
            event.notification.close();
            event.waitUntil(
              self.clients
                .matchAll({ includeUncontrolled: true, type: "window" })
                .then((windowClients) => {
                  /* Check if there is already a window/tab open with the target URL */
                  const alreadyOpenedtab = windowClients.find(
                    (client) => client.url === url
                  );
                  /* If so, just focus it. */
                  if (alreadyOpenedtab) {
                    alreadyOpenedtab.focus();
                    return;
                  }

                  /* If not, then open the target URL in a new window/tab. */
                  if (self.clients.openWindow) {
                    self.clients.openWindow(url);
                    return;
                  }
                })
            );
          });
        }
      } catch (error) {
        /* If error, send back request to queue to be retried later */
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

self.addEventListener("fetch", (event) => {
  const promiseChain = fetch(event.request.clone()).catch(() => {
    return bgSyncQueue.pushRequest({ request: event.request });
  });

  event.waitUntil(promiseChain);
});

/**** Accept service worker updates ****/
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
    self.clients.claim();
  }
});
