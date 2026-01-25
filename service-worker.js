// Service Worker for Cinestoke - Cache static assets
const CACHE_NAME = 'cinestoke-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - cache-first for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests except for fonts and images
  if (url.origin !== self.location.origin) {
    // Allow Google Fonts
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.match(request).then((cached) => {
          return cached || fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          });
        })
      );
      return;
    }
    return;
  }

  // Cache-first strategy for static assets (images, fonts, CSS, JS)
  // Note: Videos are excluded because they return 206 partial responses which can't be cached
  const isVideo = request.destination === 'video' || url.pathname.endsWith('.mp4');

  if (
    !isVideo && (
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')
    )
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached, but update cache in background
          fetch(request).then((response) => {
            // Only cache complete responses (status 200), not partial (206)
            if (response.ok && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          }).catch(() => {});
          return cached;
        }
        // Not cached - fetch and cache
        return fetch(request).then((response) => {
          // Only cache complete responses (status 200), not partial (206)
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML documents
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
});
