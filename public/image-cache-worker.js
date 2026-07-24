"use strict";

const IMAGE_CACHE = "redline-catalog-images-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    !requestUrl.pathname.startsWith("/catalog-images/")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(IMAGE_CACHE);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) return cachedResponse;

      const networkResponse = await fetch(event.request);
      if (networkResponse.ok) {
        await cache.put(event.request, networkResponse.clone());
      }

      return networkResponse;
    })(),
  );
});
