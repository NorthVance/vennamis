// CFG: Cache
const CACHE_NAME = 'vennamis-core-v40';
const ASSETS = ['/'];

// INIT: Install
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// EXEC: Fetch
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});
