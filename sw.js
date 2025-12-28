// Service Worker for Planner Premium ULTRA PWA

const CACHE_NAME = 'planner-ultra-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/task-create.html',
  '/stats.html',
  '/calendar.html',
  '/subscription.html',
  '/achievements.html',
  '/js/auth.js',
  '/js/gamification.js',
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Error caching files', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Don't cache certain requests (like API calls)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    // Handle API requests separately
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we get a valid response, return it
          if (response.status === 200) {
            return response;
          }
          
          // Otherwise, try to get from cache
          return caches.match(event.request)
            .then(cacheResponse => {
              return cacheResponse || response;
            });
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              
              // If not in cache, return offline page for HTML requests
              if (event.request.destination === 'document') {
                return caches.match('/index.html');
              }
              
              // For other requests, return error
              return new Response('Offline', { status: 503 });
            });
        })
    );
  } else {
    // For static assets, try cache first then network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Otherwise, fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Add to cache for future requests
              if (networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return networkResponse;
            })
            .catch(() => {
              // If network fails, return offline page for HTML requests
              if (event.request.destination === 'document') {
                return caches.match('/index.html');
              }
              
              // For other requests, return error
              return new Response('Offline', { status: 503 });
            });
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  return self.clients.claim();
});

// Listen for message events from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification handler (future implementation)
self.addEventListener('push', event => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Planner ULTRA', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
