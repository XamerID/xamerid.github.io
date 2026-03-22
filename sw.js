const CACHE_NAME = 'pwa-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/main.js',
    '/server.js',
    '/manifest.json',
    '/lib/jsmediatags.min.js',
    '/lib/lame.min.js',
    '/lib/browser-id3-writer.min.js',
    '/lib/icon.woff2',
    '/lib/icon.webp'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('save as cache...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                return cachedResponse || fetch(event.request);
            })
    );
});
