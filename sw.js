// ⚡ Change this version number every time you push an update
// This forces the installed app to refresh automatically
const CACHE_VERSION = 'studyflow-v5';

const FILES = [
  './index.html',
  './manifest.json'
];

// INSTALL — cache all files fresh
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(FILES))
  );
  // Activate immediately, don't wait for old tabs to close
  self.skipWaiting();
});

// ACTIVATE — delete ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});

// FETCH — network first, fallback to cache
// This means users always get the latest version if online
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Save fresh copy to cache
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(e.request, copy));
        return response;
      })
      .catch(() => {
        // If offline, serve from cache
        return caches.match(e.request);
      })
  );
});

// NOTIFY app when a new version is available
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
