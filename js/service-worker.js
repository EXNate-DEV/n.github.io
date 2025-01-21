self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('assets')
            .then(async (cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/app.html'
                ]);
            })
    );
});

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open("assets");
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return Response.error();
    }
  }

self.addEventListener('fetch', (event) => {
    event.respondWith(cacheFirst(event.request));
});