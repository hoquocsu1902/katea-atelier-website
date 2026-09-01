const CACHE = "katea-v2";
const ASSETS = ["/", "/index.html", "/css/main.css", "/js/app.js", "/js/ui.js"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE ? caches.delete(k) : null))).then(()=> self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Network-first for HTML/JS to ensure mobile gets latest deploy instantly
  if (e.request.mode === "navigate" || url.pathname.endsWith(".js") || url.pathname.endsWith(".html")) {
    e.respondWith(fetch(e.request).then(res=>{ const c=res.clone(); caches.open(CACHE).then(cache=>cache.put(e.request,c)); return res; }).catch(()=> caches.match(e.request)));
    return;
  }
  if (url.hostname.includes("res.cloudinary.com")) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(r => r || fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
