// Tên cache phải khớp với ASSET_CACHE_PREFIX trong profile.tsx để tính năng xóa cache hoạt động
const CACHE_NAME = 'english-leveling-assets-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // Thêm các đường dẫn static file quan trọng khác nếu cần
];

// Cài đặt Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Kích hoạt và dọn dẹp cache cũ
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1 && cacheName.startsWith('english-leveling-assets')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Chiến lược Cache First, sau đó Network (cho assets)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
