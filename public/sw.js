const CACHE_NAME = 'pomodash-v1';
const APP_SHELL = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/modal.js',
    './js/storage.js',
    './js/tasks.js',
    './js/timer.js',
    './js/resources.js',
    './js/biblioteca.js',
    './js/dashboard.js',
    './js/navigation.js',
    './js/utils.js',
    './manifest.webmanifest',
    './icons/icon.svg',
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))),
        ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            });
        }),
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('./'));
});
