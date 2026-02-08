const CACHE_NAME = 'allora-cache-v10';

// Lista de URLs para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/imagens_app/logo_agenda.png',
  '/imagens_app/colunistas1.png',
  '/imagens_app/colunistas2.png',
  '/imagens_app/versusX.png',
  '/imagens_app/zap.png',
  '/icons/icon-192.png',
  // Adicione aqui outros arquivos estáticos que você quer cachear
];

// Instalação do Service Worker e cache dos arquivos
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Falha ao cachear arquivos:', error);
      })
  );
  self.skipWaiting(); // Força o Service Worker a se tornar ativo imediatamente
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('Service Worker: Removendo cache antigo:', key);
            return caches.delete(key);
          })
      );
    })
  );
  clients.claim(); // Assume o controle de todas as páginas abertas
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna a resposta cacheada ou faz a requisição à rede
        if (response) {
          console.log('Service Worker: Recuperando do cache:', event.request.url);
          return response;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            // Atualiza o cache com a resposta da rede, se for um GET e não falhar
            if (event.request.method === 'GET' && networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Se a requisição falhar (offline), retorna uma resposta genérica
            if (event.request.destination === 'document') {
              console.log('Service Worker: Offline, retornando página padrão');
              return caches.match('/index.html');
            }
            console.log('Service Worker: Offline, recurso não disponível:', event.request.url);
            return new Response('Offline: Recurso não disponível', { status: 404 });
          });
      })
  );
});


