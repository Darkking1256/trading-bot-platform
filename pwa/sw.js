const CACHE_NAME = 'trading-bot-pro-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/market-data',
  '/api/portfolio',
  '/api/trades',
  '/api/analytics',
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - try network first, fallback to cache
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/static/') || 
               url.pathname.startsWith('/icons/') ||
               url.pathname.endsWith('.js') ||
               url.pathname.endsWith('.css')) {
      // Static assets - cache first, fallback to network
      event.respondWith(handleStaticRequest(request));
    } else {
      // Navigation requests - network first, fallback to cache
      event.respondWith(handleNavigationRequest(request));
    }
  } else if (request.method === 'POST') {
    // POST requests - try network, queue for background sync if offline
    event.respondWith(handlePostRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for API request:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('Serving API from cache:', request.url);
    return cachedResponse;
  }

  // Return offline response for API requests
  return new Response(
    JSON.stringify({ 
      error: 'Offline mode', 
      message: 'Data not available offline',
      timestamp: new Date().toISOString()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle static requests
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url);
    return new Response('Not found', { status: 404 });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for navigation:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline page
  const offlineResponse = await caches.match('/offline.html');
  return offlineResponse || new Response('Offline', { status: 503 });
}

// Handle POST requests
async function handlePostRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed for POST request:', request.url);
    
    // Queue for background sync
    if ('sync' in self.registration) {
      try {
        await self.registration.sync.register('background-sync');
        console.log('Background sync registered for:', request.url);
      } catch (syncError) {
        console.error('Failed to register background sync:', syncError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline mode', 
        message: 'Request queued for background sync',
        timestamp: new Date().toISOString()
      }),
      {
        status: 202,
        statusText: 'Accepted',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    for (const item of offlineData) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineData(item.id);
          console.log('Synced offline data:', item.url);
        }
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New trading alert',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Trading Bot Pro', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event - handle communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_API_DATA':
      cacheApiData(data);
      break;
    case 'GET_CACHED_DATA':
      getCachedData(data).then(result => {
        event.ports[0].postMessage(result);
      });
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache API data
async function cacheApiData(data) {
  const cache = await caches.open(API_CACHE);
  const response = new Response(JSON.stringify(data.data), {
    headers: { 'Content-Type': 'application/json' }
  });
  await cache.put(data.url, response);
}

// Get cached data
async function getCachedData(url) {
  const cache = await caches.open(API_CACHE);
  const response = await cache.match(url);
  
  if (response) {
    return await response.json();
  }
  
  return null;
}

// IndexedDB operations for offline data
async function getOfflineData() {
  // Implementation would use IndexedDB to store offline data
  return [];
}

async function removeOfflineData(id) {
  // Implementation would remove data from IndexedDB
  console.log('Removed offline data:', id);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync') {
    console.log('Periodic sync triggered');
    event.waitUntil(syncOfflineData());
  }
});

console.log('Service Worker loaded');


