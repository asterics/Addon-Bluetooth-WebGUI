importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');

if (!workbox) {
    console.log("Workbox in service worker failed to load!");
}
self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener('install', (event) => {
    console.log('installing service worker ...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    clients.claim();
    self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({activated: true}));
    });
    console.log('service worker active!');
});

workbox.routing.registerRoute(({url, request, event}) => {
    let isApiCall = url.origin.includes("proxy.asterics-foundation.org") || url.origin.includes("api.github.com");
    let useStale = (url.pathname.indexOf('serviceWorker.js') === -1 && url.pathname.indexOf('workbox-sw.js') === -1 && !isApiCall); //do not cache serviceWorker.js
    return useStale;
}, new workbox.strategies.StaleWhileRevalidate());

workbox.routing.registerRoute(({url, request, event}) => {
    let isApiCall = url.origin.includes("proxy.asterics-foundation.org") || url.origin.includes("api.github.com");
    return isApiCall;
}, new workbox.strategies.NetworkFirst());