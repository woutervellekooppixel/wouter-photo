// Service worker disabled temporarily due to caching issues
const CACHE_NAME = 'wouter-photo-disabled';

self.addEventListener('install', (event) => {
  // Clear all caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear all caches and claim all clients
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache, always fetch from network
  event.respondWith(fetch(event.request));
});
