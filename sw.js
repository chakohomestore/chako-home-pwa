/* Basit service worker: site dosyalarını önbelleğe alır, internet yoksa son halini gösterir.
   Sitede büyük bir değişiklik yaparsanız aşağıdaki sürüm numarasını artırın (v1 -> v2). */
var CACHE = 'chako-v3';
var SHELL = ['/', '/index.html', '/css/styles.css', '/js/app.js', '/products.json', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Amazon görsellerine ve fontlara dokunma

  // Önce internetten dene (güncel içerik), olmazsa önbellekten ver
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('/index.html'); });
    })
  );
});
