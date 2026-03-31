/* SparkNorge Service Worker v2.1
 * Krav: Apple App Store krever offline-støtte for at appen ikke
 * skal se ut som en ren nettside-wrapper (Guideline 4.2)
 */
'use strict';

const CACHE_NAME = 'sparknorge-v2.1';
const OFFLINE_URL = '/index.html';

// Filer som caches ved installasjon (app shell)
const PRECACHE = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE).catch(err => {
        console.warn('[SW] Pre-cache failed (some files missing):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET, chrome-extension, and API requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // For navigation requests: try network, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  // For assets: try cache first, then network, update cache
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Only cache successful same-origin or CDN responses
        if (
          response.ok &&
          (request.url.includes(self.location.origin) ||
           request.url.includes('unpkg.com') ||
           request.url.includes('cdn.jsdelivr.net'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached || new Response('', { status: 503 }));
    })
  );
});

// ── Push Notifications (iOS 16.4+) ───────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'SparkNorge';
  const options = {
    body: data.body || 'Ny varsling fra SparkNorge',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'sparknorge-notification',
    data: { url: data.url || '/' },
    requireInteraction: false,
    silent: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); return; }
      return clients.openWindow(url);
    })
  );
});
