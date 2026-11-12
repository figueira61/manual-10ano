globalThis.Manual = globalThis.Manual || {};
Manual.calc = Manual.calc || {};

Manual.calc.funcoes = (function () {
  // Evita -0 nos resultados.
  const n0 = (x) => x + 0;

  function afim(m, b) {
    return {
      zero: m === 0 ? null : n0(-b / m),
      monotonia: m > 0 ? 'crescente' : m < 0 ? 'decrescente' : 'constante',
    };
  }

  function quadratica(a, b, c) {
    if (a === 0) throw new Error('quadratica: a não pode ser 0');
    const delta = b * b - 4 * a * c;
    let zeros = [];
    if (delta === 0) {
      zeros = [n0(-b / (2 * a))];
    } else if (delta > 0) {
      const raiz = Math.sqrt(delta);
      zeros = [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)].map(n0).sort((x, y) => x - y);
    }
    const h = n0(-b / (2 * a));
    const k = n0(c - (b * b) / (4 * a));
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

  return { afim, quadratica, canonicaParaGeral, inequacao2, avaliarRamos };
})();
