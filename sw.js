importScripts('lista-cache.js');

const PREFIXO = 'manual10-';
const NOME_CACHE = PREFIXO + self.VERSAO_CACHE;

self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(NOME_CACHE)
      .then(function (cache) {
        // cache: 'reload' ignora a cache HTTP, para não pré-carregar ficheiros antigos.
        return cache.addAll(self.LISTA_CACHE.map(function (u) {
          return new Request(u, { cache: 'reload' });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys()
      .then(function (nomes) {
        return Promise.all(nomes
          .filter(function (n) { return n.indexOf(PREFIXO) === 0 && n !== NOME_CACHE; })
          .map(function (n) { return caches.delete(n); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (evento) {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  // Navegações: serve sempre index.html; restantes: ignora a query string.
  const chave = pedido.mode === 'navigate'
    ? new URL('index.html', self.registration.scope).href
    : url.origin + url.pathname;

  evento.respondWith(
    caches.open(NOME_CACHE)
      .then(function (cache) { return cache.match(chave); })
      .then(function (resposta) { return resposta || fetch(pedido); })
  );
});
