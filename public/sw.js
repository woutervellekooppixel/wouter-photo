const CACHE_NAME = 'wouter-photo-v1'
const STATIC_CACHE = 'static-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/portfolio',
  '/about',
  '/blog',
  '/shop',
  '/favicon.png',
  '/logo.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip analytics requests
  if (request.url.includes('google-analytics') || request.url.includes('gtag')) return
  
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response
        }
        
        // Fetch from network and cache for images
        return fetch(request).then(response => {
          // Don't cache if not successful
          if (!response.ok) return response
          
          // Cache images and API responses
          if (request.url.includes('/photos/') || 
              request.url.includes('/api/') ||
              request.destination === 'image') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone))
          }
          
          return response
        })
      })
      .catch(() => {
        // Fallback for offline navigation
        if (request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})
