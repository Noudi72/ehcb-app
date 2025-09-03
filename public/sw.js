// SERVICE WORKER DEAKTIVIERT - DEBUGGING
// Dieser Service Worker macht nichts, um Caching-Probleme zu vermeiden

console.log('🚫 SERVICE WORKER DEAKTIVIERT FÜR DEBUGGING');

// Lösche alle existierenden Caches
self.addEventListener('install', (event) => {
  console.log('🗑️ Lösche alle Caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Lösche Cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Alle Caches gelöscht');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker aktiviert - übernehme Kontrolle');
  event.waitUntil(self.clients.claim());
});

// Keine Fetch-Interception - alles geht direkt an den Server
self.addEventListener('fetch', (event) => {
  // Tu nichts - lass alle Requests normal durchgehen
});

// SERVICE WORKER DEAKTIVIERT - DEBUGGING
// Dieser Service Worker macht nichts, um Caching-Probleme zu vermeiden

console.log('🚫 SERVICE WORKER DEAKTIVIERT FÜR DEBUGGING');

// Lösche alle existierenden Caches
self.addEventListener('install', (event) => {
  console.log('🗑️ Lösche alle Caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('🗑️ Lösche Cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Alle Caches gelöscht');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker aktiviert - übernehme Kontrolle');
  event.waitUntil(self.clients.claim());
});

// Keine Fetch-Interception - alles geht direkt an den Server
self.addEventListener('fetch', (event) => {
  // Tu nichts - lass alle Requests normal durchgehen
});

// Installation des Service Workers
self.addEventListener('install', (event) => {
  console.log('Service Worker installiert');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geöffnet:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Cache-Fehler (ignoriert):', error);
          return Promise.resolve(); // Ignoriere Cache-Fehler
        });
      })
      .catch((error) => {
        console.log('Service Worker Install-Fehler (ignoriert):', error);
        return Promise.resolve(); // Ignoriere Fehler
      })
  );
  // Erzwinge sofortige Aktivierung
  self.skipWaiting();
});

// Aktivierung des Service Workers
self.addEventListener('activate', (event) => {
  console.log('Service Worker aktiviert');
  event.waitUntil(
    // Alte Caches löschen (ausser aktuelle Version)
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Übernehme sofort die Kontrolle
  return self.clients.claim();
});

// Vereinfachtes Fetch-Handling (nur für wichtige Ressourcen)
self.addEventListener('fetch', (event) => {
  // Nur für gleiche Origin
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback bei Netzwerk-Fehler
          return caches.match(event.request)
            .then((response) => {
              return response || new Response('Offline - Seite nicht verfügbar', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Push-Benachrichtigungen verarbeiten
self.addEventListener('push', (event) => {
  console.log('Push-Nachricht empfangen:', event);
  
  const options = {
    body: 'Neue Benachrichtigung von EHC Biel Spirit 🏒',
    icon: `${BASE_URL}/u18-team_app-icon.png`,
    badge: `${BASE_URL}/u18-team_app-icon.png`,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'App öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.message || options.body;
      options.title = data.title || 'EHC Biel Spirit';
      options.data.url = data.url || '/';
    } catch (error) {
      console.log('Push-Daten Parse-Fehler:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('EHC Biel Spirit', options)
  );
});

// Notification-Klicks verarbeiten
self.addEventListener('notificationclick', (event) => {
  console.log('Notification geklickt:', event);
  
  event.notification.close();

  if (event.action === 'explore' || event.action === '') {
    // App öffnen
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || `${BASE_URL}/`)
    );
  }
  // Bei 'close' nichts tun
});

// Message-Handling für Kommunikation mit der App
self.addEventListener('message', (event) => {
  console.log('Service Worker Message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
