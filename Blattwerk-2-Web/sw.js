"use strict";

const release = "2.0.0";
const scope = new URL(self.registration.scope);
const namespace = `blattwerk:${scope.href}:`;
const cacheName = namespace + release;
const appPage = new URL("index.html", scope);
const assets = new Set([
  "index.html",
  `styles.css?v=${release}`,
  `pflege.js?v=${release}`,
  `daten.js?v=${release}`,
  `kamera.js?v=${release}`,
  `oberflaeche.js?v=${release}`,
  `app.js?v=${release}`,
  "vendor/exif-reader.js?v=4.54.0",
  "manifest.webmanifest",
  "assets/mark.svg",
  "assets/app-icon-192.png",
  "assets/app-icon-512.png",
  "assets/monstera-hero.jpg",
  "assets/monstera.jpg",
  "assets/snake.jpg",
  "assets/pothos.jpg",
  "assets/peace.jpg",
  "assets/spider.jpg",
  "assets/haworthia.jpg"
].map(path => new URL(path, scope).href));

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(
    [...assets].map(url => new Request(url, { cache: "reload" }))
  )));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.filter(name => name.startsWith(namespace) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const appNavigation = request.mode === "navigate" && url.origin === scope.origin
    && (url.pathname === scope.pathname || url.pathname === appPage.pathname);
  if (!appNavigation && !assets.has(url.href)) return;
  const key = appNavigation ? appPage.href : url.href;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(key)) ?? fetch(request);
  })());
});
