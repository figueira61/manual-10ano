globalThis.Manual = globalThis.Manual || {};
Manual.calc = Manual.calc || {};

Manual.calc.funcoes = (function () {
  // Evita -0 nos resultados.
  const n0 = (x) => x + 0;
  // Arredonda a 1e-9 (elimina ruído de vírgula flutuante) e evita -0.
  const r9 = (x) => Math.round(x * 1e9) / 1e9 + 0;

  function afim(m, b) {
    return {
      zero: m === 0 ? null : n0(-b / m),
      monotonia: m > 0 ? 'crescente' : m < 0 ? 'decrescente' : 'constante',
    };
  }

  function quadratica(a, b, c) {
    if (a === 0) throw new Error('quadratica: a não pode ser 0');
    let delta = b * b - 4 * a * c;
    // Δ dentro do ruído de arredondamento conta como 0
    if (Math.abs(delta) <= 1e-9 * Math.max(1, b * b, Math.abs(4 * a * c))) delta = 0;
    delta = r9(delta);
    let zeros = [];
    if (delta === 0) {
      zeros = [r9(-b / (2 * a))];
    } else if (delta > 0) {
      const raiz = Math.sqrt(delta);
      zeros = [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)].map(r9).sort((x, y) => x - y);
    }
    const h = r9(-b / (2 * a));
    const k = r9(c - (b * b) / (4 * a));
    return {
      delta,
      zeros,
      vertice: [h, k],
      eixo: h,
      concavidade: a > 0 ? 'cima' : 'baixo',
      extremo: { tipo: a > 0 ? 'minimo' : 'maximo', valor: k },
    };
  }

  // a(x-h)² + k = ax² - 2ah·x + (ah² + k)
  function canonicaParaGeral(a, h, k) {
    return { a, b: n0(-2 * a * h), c: n0(a * h * h + k) };
  }

  function inequacao2(a, b, c, sinal) {
    const procuraPositivo = sinal === '>' || sinal === '>=';
    const fechado = sinal === '>=' || sinal === '<=';
    const q = quadratica(a, b, c);
    const todos = [{ de: -Infinity, ate: Infinity, fechadoDe: false, fechadoAte: false }];
    // sinal de f fora das raízes (ou em todo o lado, sem raízes) é o de a
    const foraSatisfaz = a > 0 === procuraPositivo;

    if (q.zeros.length === 0) return { intervalos: foraSatisfaz ? todos : [] };

    if (q.zeros.length === 1) {
      const r = q.zeros[0];
      if (foraSatisfaz) {
        if (fechado) return { intervalos: todos };
        return {
          intervalos: [
            { de: -Infinity, ate: r, fechadoDe: false, fechadoAte: false },
            { de: r, ate: Infinity, fechadoDe: false, fechadoAte: false },
          ],
        };
      }
      return { intervalos: fechado ? [{ de: r, ate: r, fechadoDe: true, fechadoAte: true }] : [] };
    }

    const [r1, r2] = q.zeros;
    if (foraSatisfaz) {
      return {
        intervalos: [
          { de: -Infinity, ate: r1, fechadoDe: false, fechadoAte: fechado },
          { de: r2, ate: Infinity, fechadoDe: fechado, fechadoAte: false },
        ],
      };
    }
    return { intervalos: [{ de: r1, ate: r2, fechadoDe: fechado, fechadoAte: fechado }] };
  }

  function avaliarRamos(ramos, x) {
    for (const r of ramos) {
      const acimaDe = r.incluiDe ? x >= r.de : x > r.de;
      const abaixoAte = r.incluiAte ? x <= r.ate : x < r.ate;
      if (acimaDe && abaixoAte) return r.f(x);
    }
    return undefined;
  }

  // Condição f(x) □ k (□ ∈ =, <, >, <=, >=) para f contínua e afim por troços, dada pelos vértices
  // ordenados [{x, y}] e definida em [pontos[0].x, pontos.at(-1).x].
  // Devolve { intervalos: [{a, b, fechadoA, fechadoB}], pontosIsolados: [x] }, unidos e ordenados.
  // Método: parte-se o domínio nos vértices e nos pontos onde f(x) = k; entre dois cortes seguidos f − k tem
  // sinal constante. Percorre-se a sequência ponto, troço aberto, ponto, … e juntam-se as partes seguidas que
  // satisfazem a condição.
  const TESTES = {
    '=': (d) => d === 0, '<': (d) => d < 0, '>': (d) => d > 0, '<=': (d) => d <= 0, '>=': (d) => d >= 0,
  };
  function resolverCondicao(pontos, sinal, k) {
    const ok = TESTES[sinal];
    if (!ok) throw new Error('resolverCondicao: sinal inválido ' + sinal);
    if (!Array.isArray(pontos) || pontos.length < 2) throw new Error('resolverCondicao: são precisos 2 pontos');
    const eps = 1e-9;
    const dif = (y) => (Math.abs(y - k) <= eps ? 0 : y - k);
    // cortes: [x, f(x) − k]
    const cortes = [[pontos[0].x, dif(pontos[0].y)]];
    for (let i = 0; i + 1 < pontos.length; i++) {
      const P = pontos[i], Q = pontos[i + 1];
      const dp = dif(P.y), dq = dif(Q.y);
      if (dp * dq < 0) cortes.push([n0(P.x + ((k - P.y) * (Q.x - P.x)) / (Q.y - P.y)), 0]);
      cortes.push([Q.x, dq]);
    }
    // f no meio de cada troço aberto entre cortes seguidos (afim por troços: basta um ponto)
    const fEm = (x) => {
      for (let i = 0; i + 1 < pontos.length; i++) {
        const P = pontos[i], Q = pontos[i + 1];
        if (x >= P.x && x <= Q.x) return P.y + ((Q.y - P.y) * (x - P.x)) / (Q.x - P.x);
      }
      return NaN;
    };
    // partes: { x } (ponto) ou { de, ate } (aberto), com a marca da condição
    const partes = [{ x: cortes[0][0], sim: ok(cortes[0][1]) }];
    for (let i = 1; i < cortes.length; i++) {
      const de = cortes[i - 1][0], ate = cortes[i][0];
      partes.push({ de, ate, sim: ok(dif(fEm((de + ate) / 2))) });
      partes.push({ x: ate, sim: ok(cortes[i][1]) });
    }
    const intervalos = [], pontosIsolados = [];
    let i = 0;
    while (i < partes.length) {
      if (!partes[i].sim) { i++; continue; }
      let j = i;
      while (j + 1 < partes.length && partes[j + 1].sim) j++;
      const A = partes[i], B = partes[j];
      if (i === j && A.x !== undefined) pontosIsolados.push(A.x);
      else {
        intervalos.push({
          a: A.x !== undefined ? A.x : A.de,
          b: B.x !== undefined ? B.x : B.ate,
          fechadoA: A.x !== undefined,
          fechadoB: B.x !== undefined,
        });
      }
      i = j + 1;
    }
    return { intervalos, pontosIsolados };
  }

  return { afim, quadratica, canonicaParaGeral, inequacao2, avaliarRamos, resolverCondicao };
})();
