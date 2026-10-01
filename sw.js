const CACHE = "katea-v4";
// NOTE: keep V in sync with the ?v= cache-bust in index.html
const V = "b1d46f7";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  `/css/variables.css?v=${V}`,
  `/css/main.css?v=${V}`,
  `/css/header.css?v=${V}`,
  `/css/hero.css?v=${V}`,
  `/css/products.css?v=${V}`,
  `/css/sections.css?v=${V}`,
  `/css/modals.css?v=${V}`,
  `/css/footer.css?v=${V}`,
  `/css/responsive.css?v=${V}`,
  `/css/brand-refresh.css?v=${V}`,
  `/css/hero-upgrade.css?v=${V}`,
  `/js/data/products.js?v=${V}`,
  `/js/data/collections.js?v=${V}`,
  `/js/currency.js?v=${V}`,
  `/js/whatsapp.js?v=${V}`,
  `/js/search.js?v=${V}`,
  `/js/ui.js?v=${V}`,
  `/js/app.js?v=${V}`,
  "/assets/images/hero-identity.jpg",
];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE ? caches.delete(k) : null))).then(()=> self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Network-first for HTML/JS to ensure mobile gets latest deploy instantly
  if (e.request.mode === "navigate" || url.pathname.endsWith(".js") || url.pathname.endsWith(".html")) {
    e.respondWith(fetch(e.request).then(res=>{ const c=res.clone(); caches.open(CACHE).then(cache=>cache.put(e.request,c)); return res; }).catch(()=> caches.match(e.request)));
    return;
  }
  // Cache-first for images and fonts (Cloudinary, local assets, Google Fonts)
  if (url.hostname.includes("res.cloudinary.com") || url.hostname.includes("fonts.g") || e.request.destination === "image" || e.request.destination === "font") {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(e.request).then(r => r || fetch(e.request).then(res => { cache.put(e.request, res.clone()); return res; }).catch(()=> r))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
