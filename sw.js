const CACHE_NAME = 'game-library-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    // استراتيجية: حاول جلب الملف من الإنترنت أولاً، إذا فشل (أوفلاين) هاته من الـ Cache
    fetch(e.request).catch(() => caches.match(e.request))
  );
});