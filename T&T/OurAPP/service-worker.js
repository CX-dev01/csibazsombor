// ===============================
// VERSION
// ===============================
const CACHE_VERSION = "v9";
const CACHE_NAME = `our-relationship-${CACHE_VERSION}`;

// FILES TO CACHE
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./icon.png",
  "./offline.html",

  // JS
  "./updater.js",
  "./gallery-function.js",
  "./button-function.js",
  "../../JS/snow.js", 

  // Images
  "./Images/hug.jpg",
];


// ===============================
// INSTALL
// ===============================
self.addEventListener("install", event => {
  console.log("[SW] Installing version:", CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
      .catch(err => {
        console.error("[SW] Install failed:", err);
      })
  );

  self.skipWaiting();
});


// ===============================
// ACTIVATE
// ===============================
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


// ===============================
// FETCH (Offline First Strategy)
// ===============================
self.addEventListener("fetch", event => {
  const req = event.request;

  // Only handle same-origin requests
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(req).then(cachedResponse => {

      // If found in cache → return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise try network
      return fetch(req)
        .then(networkResponse => {

          // If bad response → return it without caching
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Clone response
          const responseClone = networkResponse.clone();

          // Save to cache
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(req, responseClone);
            });

          return networkResponse;
        })
        .catch(() => {
          // If navigation request → show offline page
          if (req.mode === "navigate") {
            return caches.match("./offline.html");
          }

          // Otherwise return basic offline response
          return new Response("You are offline.", {
            status: 503,
            statusText: "Offline"
          });
        });

    })
  );
});


// ===============================
// MANUAL UPDATE SUPPORT
// ===============================
self.addEventListener("message", event => {
  if (!event.data) return;

  if (event.data.type === "MANUAL_UPDATE") {
    console.log("[SW] Manual update triggered");
    self.skipWaiting();
  }
});


// ===============================
console.log("[SW] Service Worker Ready!");