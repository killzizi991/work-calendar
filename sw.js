const CACHE_NAME = 'work-calendar-final-v4'; // Изменили версию кэша
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
  console.log('Установка новой версии Service Worker v4');
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
