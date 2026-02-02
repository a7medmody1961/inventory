const CACHE_NAME = 'game-library-v9-offline'; // قمت بتغيير الإصدار لضمان التحديث
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // المكتبات الخارجية (مهم جداً إضافتها هنا لتعمل أوفلاين)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest',
  
  // ملفات Firebase الأساسية
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// 1. تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (e) => {
  self.skipWaiting(); // تفعيل التحديث فوراً
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. تفعيل الـ Service Worker وحذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  return self.clients.claim();
});

// 3. استراتيجية الشبكة (Network) مع السقوط للكاش (Cache Fallback)
// يحاول يجيب من النت، لو فشل يجيب من الكاش
self.addEventListener('fetch', (e) => {
  // تجاهل طلبات chrome-extension أو غير http
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // تحديث الكاش بالنسخة الجديدة لو النت شغال (اختياري لتحسين الأداء)
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // لو النت فاصل، هات من الكاش
        return caches.match(e.request);
      })
  );
});