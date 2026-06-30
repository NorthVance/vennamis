// CFG: Cache Versioning
const CACHE_NAME = 'vennamis-core-v41';

// INIT: Force Install
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// EXEC: Purge Old Cache on Activation
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(cache => {
                    if (cache !== CACHE_NAME) return caches.delete(cache);
                })
            );
        })
    );
    self.clients.claim();
});

// EXEC: Network-First Strategy (Bypass Cache for dynamic assets)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then(response => {
                // If valid response, clone and cache it
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache ONLY if network fails (Offline mode)
                return caches.match(e.request);
            })
    );
});
