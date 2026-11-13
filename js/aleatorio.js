globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  // Gerador pseudoaleatório com semente (mulberry32). Devolve valores em [0, 1).
  Manual.aleatorio = Manual.aleatorio || {};

  Manual.aleatorio.criar = function (semente) {
    let estado = semente >>> 0;
    return function () {
      estado = (estado + 0x6d2b79f5) >>> 0;
      let t = estado;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Inteiro entre min e max, ambos inclusivos.
  Manual.aleatorio.inteiro = function (rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  };

  // Permutação de uma cópia da lista (Fisher–Yates); a original não é alterada.
  Manual.aleatorio.baralhar = function (rng, lista) {
    const r = lista.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = r[i];
      r[i] = r[j];
      r[j] = tmp;
    }
    return r;
  };

  // Semente nova de 32 bits: criptográfica quando disponível, senão Math.random.
  Manual.aleatorio.novaSemente = function () {
    const cripto = globalThis.crypto;
    if (cripto && typeof cripto.getRandomValues === 'function') {
      const v = new Uint32Array(1);
      cripto.getRandomValues(v);
      return v[0];
    }
    return Math.floor(Math.random() * 4294967296);
  };
})();
