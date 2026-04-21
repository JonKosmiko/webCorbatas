const CACHE_NAME = 'webCorbatas_v8';
const ASSETS = [
  './',
  './index.html',
  './css/estilos.css',
  './img/c01.png',
  './img/c02.png',
  './img/c03.png',
  './img/c04.png',
  './img/c05.png',
  './img/c06.png',
  './img/c07.png',
  './img/c08.png',
  './img/c09.png',
  './img/c10.png',
  './img/c11.png',
  './img/c12.png',
  './img/inicio_01.jpg',
  './img/inicio_dobleA.jpg',
  './img/inicio_dobleB.jpg',
  './img/inicio_final.jpg',
  './img/inicio_invitados.jpg',
  './img/inicio_novio.jpg',
  './img/inicio_portada.jpg',
  './img/inicio_seccion_americana.jpg',
  './img/inicio_seccion_camisa.jpg',
  './img/inicio_seccion_chaleco.jpg',
  './img/inicio_seccion_corbatas.jpg',
  './img/inicio_seccion_pantalon.jpg',
  './img/inicio_seccion_zapato.jpg',
  './fonts/PlayfairDisplay-Black.ttf',
  './fonts/PlayfairDisplay-Bold.ttf',
  './fonts/PlayfairDisplay-Italic.ttf',
  './fonts/PlayfairDisplay-Regular.ttf',
  './icono-192.png',
  './icono-512.png',
];

// 1. INSTALACIÓN: Guardamos todo lo básico
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caché abierta y assets guardados');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVACIÓN: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 3. FETCH: Estrategia híbrida
self.addEventListener('fetch', (event) => {
  
  // A. Si el usuario navega (va a la home o refresca)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // B. Para el resto de assets (imágenes, CSS, fuentes)
  // Usamos Stale-While-Revalidate: Sirve rápido de caché, actualiza de red.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Si la respuesta es válida, guardamos copia en caché
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si no hay red, no pasa nada, ya estamos intentando servir de caché
        });

        // Devolvemos la respuesta de caché si existe, sino esperamos a la de red
        return cachedResponse || fetchPromise;
      });
    })
  );
});