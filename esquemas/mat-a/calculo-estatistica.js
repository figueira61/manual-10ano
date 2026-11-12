globalThis.Manual = globalThis.Manual || {};
Manual.calc = Manual.calc || {};

Manual.calc.estatistica = (function () {
  const soma = (xs) => xs.reduce((s, x) => s + x, 0);
  const ordenar = (xs) => xs.slice().sort((a, b) => a - b);

  function media(xs) {
    return xs.length ? soma(xs) / xs.length : NaN;
  }

  // Método do ensino secundário português: p = n·k/100;
  // p inteiro -> (x_p + x_{p+1})/2, senão x_{ceil(p)} (índices a partir de 1).
  function percentil(xs, k) {
    const n = xs.length;
    if (!n) return NaN;
    const o = ordenar(xs);
    const p = (n * k) / 100;
    const arred = Math.round(p);
    if (Math.abs(p - arred) < 1e-9) {
      const i = Math.min(Math.max(arred, 1), n - 1);
      return n === 1 ? o[0] : (o[i - 1] + o[i]) / 2;
    }
    return o[Math.min(Math.max(Math.ceil(p), 1), n) - 1];
  }

  const mediana = (xs) => percentil(xs, 50);

  function moda(xs) {
    if (!xs.length) return [];
    const freq = new Map();
    for (const x of xs) freq.set(x, (freq.get(x) || 0) + 1);
    const max = Math.max(...freq.values());
    const min = Math.min(...freq.values());
    if (max === min) return [];
    return [...freq.entries()].filter(([, f]) => f === max).map(([x]) => x).sort((a, b) => a - b);
  }

  function quartis(xs) {
    return { q1: percentil(xs, 25), q2: percentil(xs, 50), q3: percentil(xs, 75) };
  }

  function amplitude(xs) {
    return xs.length ? Math.max(...xs) - Math.min(...xs) : NaN;
  }

  function amplitudeInterquartil(xs) {
    const q = quartis(xs);
    return q.q3 - q.q1;
  }

  function desvios(xs) {
    const m = media(xs);
    return xs.map((x) => ({ x, desvio: x - m, quadrado: (x - m) * (x - m) }));
  }

  function variancia(xs) {
    if (xs.length < 2) return NaN;
    return soma(desvios(xs).map((d) => d.quadrado)) / (xs.length - 1);
  }

  const desvioPadrao = (xs) => Math.sqrt(variancia(xs));

  function tabelaFrequencias(xs) {
    const n = xs.length;
    const freq = new Map();
    for (const x of xs) freq.set(x, (freq.get(x) || 0) + 1);
    let acum = 0;
    return [...freq.keys()]
      .sort((a, b) => a - b)
      .map((valor) => {
        const absoluta = freq.get(valor);
        acum += absoluta;
        return {
          valor,
          absoluta,
          absolutaAcumulada: acum,
          relativa: absoluta / n,
          relativaAcumulada: acum / n,
        };
      });
  }

  // Intervalos [de, ate[; o último inclui o máximo.
  function classes(xs, amplitudeClasse, inicio) {
    if (!xs.length || !(amplitudeClasse > 0)) return [];
    const min = inicio === undefined ? Math.min(...xs) : inicio;
    const max = Math.max(...xs);
    const n = Math.max(1, Math.ceil((max - min) / amplitudeClasse - 1e-9));
    const res = [];
    for (let i = 0; i < n; i++) {
      const de = min + i * amplitudeClasse;
      const ate = de + amplitudeClasse;
      res.push({ de, ate, absoluta: 0, marca: (de + ate) / 2 });
    }
    for (const x of xs) {
      if (x < min) continue;
      const i = Math.min(Math.floor((x - min) / amplitudeClasse), n - 1);
      res[i].absoluta++;
    }
    return res;
  }

  function mediaAgrupada(cls) {
    const n = soma(cls.map((c) => c.absoluta));
    return n ? soma(cls.map((c) => c.marca * c.absoluta)) / n : NaN;
  }

  function desvioPadraoAgrupado(cls) {
    const n = soma(cls.map((c) => c.absoluta));
    if (n < 2) return NaN;
    const m = mediaAgrupada(cls);
    return Math.sqrt(soma(cls.map((c) => c.absoluta * (c.marca - m) * (c.marca - m))) / (n - 1));
  }

  function extremosQuartis(xs) {
    const q = quartis(xs);
    return {
      min: xs.length ? Math.min(...xs) : NaN,
      q1: q.q1,
      q2: q.q2,
      q3: q.q3,
      max: xs.length ? Math.max(...xs) : NaN,
    };
  }

  function somasPares(pares) {
    const xs = pares.map((p) => p[0]);
    const ys = pares.map((p) => p[1]);
    const mx = media(xs);
    const my = media(ys);
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < pares.length; i++) {
      sxx += (xs[i] - mx) * (xs[i] - mx);
      syy += (ys[i] - my) * (ys[i] - my);
      sxy += (xs[i] - mx) * (ys[i] - my);
    }
    return { mx, my, sxx, syy, sxy };
  }

  function correlacao(pares) {
    if (pares.length < 2) return NaN;
    const { sxx, syy, sxy } = somasPares(pares);
    if (sxx < 1e-12 || syy < 1e-12) return NaN;
    return sxy / Math.sqrt(sxx * syy);
  }

  function regressao(pares) {
    if (pares.length < 2) return null;
    const { mx, my, sxx, sxy } = somasPares(pares);
    if (sxx < 1e-12) return null;
    const declive = sxy / sxx;
    return { declive, ordenada: my - declive * mx };
  }

  return {
    media, mediana, moda, percentil, quartis, amplitude, amplitudeInterquartil,
    desvios, variancia, desvioPadrao, tabelaFrequencias, classes, mediaAgrupada,
    desvioPadraoAgrupado, extremosQuartis, correlacao, regressao,
  };
})();
