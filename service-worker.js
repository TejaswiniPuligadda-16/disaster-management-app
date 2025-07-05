const CACHE_NAME = "disaster-help-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/dashboard.html",
  "/offline.html",
  "/emergency-kit.pdf",
  "/style.css",
  "/app.js",
  "/alert.mp3",
  "https://cdn.tailwindcss.com" // Add external if used
];

// ✅ Install Service Worker and cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ✅ Activate and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ Intercept network requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache if available
      if (response) return response;

      // Try to fetch from network
      return fetch(event.request).catch(() => {
        // Fallback to offline.html for navigations
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});

