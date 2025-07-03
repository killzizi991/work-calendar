const CACHE_NAME = 'work-calendar-final-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Установка Service Worker и кеширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кеширование ресурсов');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Все ресурсы успешно кешированы');
        return self.skipWaiting();
      })
  );
});

// Стратегия кеширования: сначала из кеша, потом сеть
self.addEventListener('fetch', event => {
  // Игнорируем POST-запросы и запросы из других источников
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кешированный ответ, если он есть
        if (cachedResponse) {
          return cachedResponse;
        }

        // Иначе выполняем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Проверяем валидность ответа
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ для кеширования
            const responseToCache = response.clone();

            // Кешируем новый ресурс
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Ошибка при запросе:', error);
            // Можно вернуть fallback-страницу
            // return caches.match('/offline.html');
          });
      })
  );
});

// Активация Service Worker и очистка старых кешей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем кеши, не входящие в белый список
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Удаление старого кеша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Активируем Service Worker для всех клиентов
      return self.clients.claim();
    })
  );
});

// Обработчик фоновых синхронизаций
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncCalendarData());
  }
});

// Функция фоновой синхронизации данных
function syncCalendarData() {
  // Здесь можно реализовать синхронизацию с сервером
  return Promise.resolve();
}
