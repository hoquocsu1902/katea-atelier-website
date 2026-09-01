const CACHE = "katea-v1";
const ASSETS = ["/", "/index.html", "/css/main.css", "/js/app.js", "/js/ui.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes("res.cloudinary.com")) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(r => r || fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
