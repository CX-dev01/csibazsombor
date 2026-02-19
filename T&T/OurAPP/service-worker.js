const CACHE_VERSION = "v8";
const CACHE_NAME = `our-relationship-${CACHE_VERSION}`;;

// Files required for offline usage
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./icon.png",
  "./offline.html",

  // JS used by page
  "./updater.js",
  "./gallery-function.js",
  "./button-function.js",
  "../../JS/snow.js",

  // Minimum images required offline
  "./Images/hug.jpg",
];

// -------------------------
// INSTALL: Cache all assets
// -------------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
          console.log("[SW] Cached:", asset);
        } catch (err) {
          console.warn("[SW] Failed to cache:", asset);
        }
      }
    })
  );
  self.skipWaiting();
});


// -------------------------
// ACTIVATE: Delete old caches
// -------------------------
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ---------------------------------------
// FETCH: Offline-first for local resources
// ---------------------------------------
self.addEventListener("fetch", event => {
  const req = event.request;

  // Only handle requests to the same domain / app folder
  if (req.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(req).then(cachedResp => {
        return cachedResp || fetch(req)
          .then(networkResp => {
            // Save network response into cache if OK
            if (networkResp.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(req, networkResp.clone());
              });
            }
            return networkResp;
          })
          .catch(() => {
            // Fallback offline page only for navigations
            if (req.mode === "navigate") {
              return caches.match("./offline.html");
            }
          });
      })
    );
  }
});

// -------------------------
// MANUAL UPDATE SUPPORT
// -------------------------
self.addEventListener("message", event => {
  if (!event.data) return;

  if (event.data.type === "MANUAL_UPDATE") {
    console.log("[SW] Manual update triggered");
    self.skipWaiting();
  }
});

// -------------------------
// LOG: SW loaded
// -------------------------
console.log("[SW] Service Worker Ready!");
