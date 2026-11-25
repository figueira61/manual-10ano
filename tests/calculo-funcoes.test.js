const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let F;
beforeEach(() => {
  F = carregar('esquemas/mat-a/calculo-funcoes.js').calc.funcoes;
});

test('função afim', () => {
  assert.deepEqual(F.afim(2, -4), { zero: 2, monotonia: 'crescente' });
  assert.deepEqual(F.afim(0, 3), { zero: null, monotonia: 'constante' });
  assert.deepEqual(F.afim(-1, 1), { zero: 1, monotonia: 'decrescente' });
});

test('função quadrática', () => {
  const q = F.quadratica(1, -2, -3);
  assert.equal(q.delta, 16);
  assert.deepEqual(q.zeros, [-1, 3]);
  assert.deepEqual(q.vertice, [1, -4]);
  assert.equal(q.eixo, 1);
  assert.equal(q.concavidade, 'cima');
  assert.deepEqual(q.extremo, { tipo: 'minimo', valor: -4 });
  assert.deepEqual(F.quadratica(1, 0, 1).zeros, []);
  assert.deepEqual(F.quadratica(1, -2, 1).zeros, [1]);
  const n = F.quadratica(-1, 0, 4);
  assert.equal(n.concavidade, 'baixo');
  assert.deepEqual(n.extremo, { tipo: 'maximo', valor: 4 });
  assert.deepEqual(n.zeros, [-2, 2]);
  assert.throws(() => F.quadratica(0, 1, 1), Error);
});

test('forma canónica para geral', () => {
  assert.deepEqual(F.canonicaParaGeral(2, 1, 3), { a: 2, b: -4, c: 5 });
});

test('inequações do 2.º grau', () => {
  const inf = Infinity;
  assert.deepEqual(F.inequacao2(1, 0, -1, '>').intervalos, [
    { de: -inf, ate: -1, fechadoDe: false, fechadoAte: false },
    { de: 1, ate: inf, fechadoDe: false, fechadoAte: false },
  ]);
  assert.deepEqual(F.inequacao2(1, 0, -1, '<=').intervalos, [
    { de: -1, ate: 1, fechadoDe: true, fechadoAte: true },
  ]);
  assert.deepEqual(F.inequacao2(1, 0, 1, '<').intervalos, []);
  assert.deepEqual(F.inequacao2(1, 0, 1, '>').intervalos, [
    { de: -inf, ate: inf, fechadoDe: false, fechadoAte: false },
  ]);
  // zero duplo: x² > 0 exclui 0; x² >= 0 é tudo; x² <= 0 é {0}
  assert.equal(F.inequacao2(1, 0, 0, '>').intervalos.length, 2);
  assert.deepEqual(F.inequacao2(1, 0, 0, '<=').intervalos, [
    { de: 0, ate: 0, fechadoDe: true, fechadoAte: true },
  ]);
  assert.deepEqual(F.inequacao2(1, 0, 0, '>=').intervalos, [
    { de: -inf, ate: inf, fechadoDe: false, fechadoAte: false },
  ]);
  // concavidade para baixo
  assert.deepEqual(F.inequacao2(-1, 0, 1, '>').intervalos, [
    { de: -1, ate: 1, fechadoDe: false, fechadoAte: false },
  ]);
});

test('funções definidas por ramos', () => {
  const ramos = [
    { de: -Infinity, ate: 0, incluiDe: false, incluiAte: false, f: (x) => -x },
    { de: 0, ate: Infinity, incluiDe: true, incluiAte: false, f: (x) => x * x },
  ];
  assert.equal(F.avaliarRamos(ramos, -2), 2);
  assert.equal(F.avaliarRamos(ramos, 0), 0);
  assert.equal(F.avaliarRamos(ramos, 3), 9);
  assert.equal(F.avaliarRamos([ramos[1]], -1), undefined);
});

test('quadratica tolera ruído de vírgula flutuante em Δ', () => {
  const q = F.quadratica(0.1, -0.2, 0.1);
  assert.equal(q.delta, 0);
  assert.deepEqual(q.zeros, [1]);
  assert.deepEqual(q.vertice, [1, 0]);
  for (let ai = 1; ai <= 30; ai++) {
    for (let hi = -20; hi <= 20; hi++) {
      const a = ai / 10, h = hi / 2;
      const g = F.canonicaParaGeral(a, h, 0);
      const r = F.quadratica(g.a, g.b, g.c);
      assert.equal(r.delta, 0, `a=${a} h=${h}`);
      assert.equal(r.zeros.length, 1, `a=${a} h=${h}`);
    }
  }
});

// ---------------------------------------------------------------- condições f(x) = k, < k, > k, ≤ k, ≥ k pelo gráfico
const PONTOS = [{ x: -3, y: 2 }, { x: -1, y: -2 }, { x: 1, y: 2 }, { x: 3, y: -1 }];
const perto = (a, b, ctx) => assert.ok(Math.abs(a - b) < 1e-9, (ctx || '') + ' ' + a + ' ≉ ' + b);
function igualCondicao(r, esperado) {
  assert.equal(r.intervalos.length, esperado.intervalos.length, JSON.stringify(r));
  r.intervalos.forEach((i, n) => {
    const e = esperado.intervalos[n];
    perto(i.a, e.a, 'a'); perto(i.b, e.b, 'b');
    assert.equal(i.fechadoA, e.fechadoA, 'fechadoA ' + JSON.stringify(i));
    assert.equal(i.fechadoB, e.fechadoB, 'fechadoB ' + JSON.stringify(i));
  });
  assert.equal(r.pontosIsolados.length, esperado.pontosIsolados.length, JSON.stringify(r));
  r.pontosIsolados.forEach((x, n) => perto(x, esperado.pontosIsolados[n], 'ponto'));
}

test('resolverCondicao: f(x) = 0 dá os três zeros', () => {
  igualCondicao(F.resolverCondicao(PONTOS, '=', 0), { intervalos: [], pontosIsolados: [-2, 0, 7 / 3] });
});

test('resolverCondicao: f(x) < 0, aberto nos zeros e fechado no extremo do domínio', () => {
  igualCondicao(F.resolverCondicao(PONTOS, '<', 0), {
    intervalos: [{ a: -2, b: 0, fechadoA: false, fechadoB: false }, { a: 7 / 3, b: 3, fechadoA: false, fechadoB: true }],
    pontosIsolados: [],
  });
});

test('resolverCondicao: f(x) ≤ 0 fecha os zeros', () => {
  igualCondicao(F.resolverCondicao(PONTOS, '<=', 0), {
    intervalos: [{ a: -2, b: 0, fechadoA: true, fechadoB: true }, { a: 7 / 3, b: 3, fechadoA: true, fechadoB: true }],
    pontosIsolados: [],
  });
});

test('resolverCondicao: f(x) > 5 é o conjunto vazio', () => {
  igualCondicao(F.resolverCondicao(PONTOS, '>', 5), { intervalos: [], pontosIsolados: [] });
});

test('resolverCondicao: f(x) ≥ 2 só em pontos isolados (extremo do domínio e máximo)', () => {
  igualCondicao(F.resolverCondicao(PONTOS, '>=', 2), { intervalos: [], pontosIsolados: [-3, 1] });
  igualCondicao(F.resolverCondicao(PONTOS, '>', 2), { intervalos: [], pontosIsolados: [] });
});

test('resolverCondicao: os complementares cobrem o domínio; troço sobre y = k; ponto isolado com intervalo', () => {
  // f(x) > 0 é o complementar de f(x) ≤ 0 em [−3, 3]
  igualCondicao(F.resolverCondicao(PONTOS, '>', 0), {
    intervalos: [{ a: -3, b: -2, fechadoA: true, fechadoB: false }, { a: 0, b: 7 / 3, fechadoA: false, fechadoB: false }],
    pontosIsolados: [],
  });
  // troço horizontal em y = 1, entre x = 0 e x = 2
  const plano = [{ x: -2, y: 3 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: -1 }];
  igualCondicao(F.resolverCondicao(plano, '=', 1), { intervalos: [{ a: 0, b: 2, fechadoA: true, fechadoB: true }], pontosIsolados: [] });
  igualCondicao(F.resolverCondicao(plano, '>', 1), { intervalos: [{ a: -2, b: 0, fechadoA: true, fechadoB: false }], pontosIsolados: [] });
  igualCondicao(F.resolverCondicao(plano, '>=', 1), { intervalos: [{ a: -2, b: 2, fechadoA: true, fechadoB: true }], pontosIsolados: [] });
  // mínimo que toca em y = k: f(x) ≤ k junta um intervalo e um ponto isolado
  const toque = [{ x: -3, y: -2 }, { x: -1, y: 2 }, { x: 1, y: 0 }, { x: 3, y: 2 }];
  igualCondicao(F.resolverCondicao(toque, '<=', 0), { intervalos: [{ a: -3, b: -2, fechadoA: true, fechadoB: true }], pontosIsolados: [1] });
  // ordenados e unidos: tudo
  igualCondicao(F.resolverCondicao(toque, '<=', 9), { intervalos: [{ a: -3, b: 3, fechadoA: true, fechadoB: true }], pontosIsolados: [] });
  assert.throws(() => F.resolverCondicao(toque, '!=', 0), Error);
});

test('resolverCondicao só em Manual.calc.funcoes (sem o alias Manual.funcoes, que não tinha consumidores)', () => {
  assert.equal(globalThis.Manual.funcoes, undefined);
  assert.equal(typeof globalThis.Manual.calc.funcoes.resolverCondicao, 'function');
});
