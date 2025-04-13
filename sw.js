const CACHE_NAME = 'quranlingo-v2';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './pwa.js',
  './install.js',
  './version.js',
  './word_meanings.js',
  './surahs.json',
  './manifest.json',
  './mascot.svg',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network-first strategy for HTML and JS files, cache-first for others
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For index.html, app.js, and sw.js, use network-first strategy
  if (url.pathname.endsWith('index.html') ||
      url.pathname.endsWith('app.js') ||
      url.pathname.endsWith('sw.js') ||
      url.pathname === '/' ||
      url.pathname === '') {

    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we got a valid response, clone it and update the cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fetch fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other resources, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // If not in cache, fetch from network
          return fetch(event.request).then(
            response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
    );
  }
});
