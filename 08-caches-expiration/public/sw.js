importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js"
);

const STATIC_CACHE = "v1.1";
const {
  precaching,
  core,
  routing,
  strategies,
  cacheableResponse,
  expiration,
} = workbox;

/* Create cache */
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
