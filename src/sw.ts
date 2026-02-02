/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Precache all assets injected by Vite PWA plugin
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching rules (migrated from vite.config.ts workbox config)
registerRoute(
  ({ url }) => /^https:\/\/api\.anthropic\.com\/.*/.test(url.href),
  new NetworkOnly()
);

registerRoute(
  ({ url }) => /^https:\/\/.*\.googleapis\.com\/.*/.test(url.href),
  new NetworkFirst({
    cacheName: 'firebase-auth',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 3600 })],
  })
);

registerRoute(
  ({ url }) => /^https:\/\/.*\.firebaseio\.com\/.*/.test(url.href),
  new NetworkOnly()
);

registerRoute(
  ({ url }) => /^https:\/\/firestore\.googleapis\.com\/.*/.test(url.href),
  new NetworkOnly()
);

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Kaizen Quest';
  const options = {
    body: data.body || 'Il est temps de progresser !',
    icon: '/icon-192x192.svg',
    badge: '/icon-192x192.svg',
    tag: 'kaizen-quest-daily',
    renotify: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if one is open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(url);
    })
  );
});
