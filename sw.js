// Service Worker para Planner Premium ULTRA PWA
const CACHE_NAME = 'planner-ultra-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js'
];

// Instalação - cachear recursos
self.addEventListener('install', event => {
  console.log('✅ Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('❌ Erro ao cachear:', err))
  );
  self.skipWaiting();
});

// Ativação - limpar cache antigo
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - estratégia Network First (sempre tenta rede primeiro)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta é válida, cachear
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), buscar do cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // Se não estiver no cache, retornar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Notificações Push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '📋 Nova atualização no seu planner!',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'planner-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('✨ Planner Premium ULTRA', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tarefas') {
    event.waitUntil(syncTarefas());
  }
});

async function syncTarefas() {
  console.log('🔄 Sincronizando tarefas...');
  // Aqui você pode adicionar lógica para sincronizar dados offline
  // com o Supabase quando voltar online
}

console.log('🚀 Service Worker carregado com sucesso!');
