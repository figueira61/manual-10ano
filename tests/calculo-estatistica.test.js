const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let E;
const perto = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} !~ ${b}`);
const DADOS = [2, 4, 4, 4, 5, 5, 7, 9];

beforeEach(() => {
  E = carregar('esquemas/mat-a/calculo-estatistica.js').calc.estatistica;
});

test('medidas de tendência central', () => {
  assert.equal(E.media(DADOS), 5);
  assert.equal(E.mediana(DADOS), 4.5);
  assert.deepEqual(E.moda(DADOS), [4]);
  assert.deepEqual(E.moda([1, 1, 2, 2, 3]), [1, 2]);
  assert.deepEqual(E.moda([1, 2, 3]), []);
  assert.deepEqual(E.moda([]), []);
});

test('dispersão amostral', () => {
  perto(E.variancia(DADOS), 32 / 7);
  perto(E.desvioPadrao(DADOS), 2.13809, 1e-5);
  const soma = E.desvios(DADOS).reduce((s, d) => s + d.desvio, 0);
  perto(soma, 0);
  assert.deepEqual(E.desvios([1, 3])[0], { x: 1, desvio: -1, quadrado: 1 });
  assert.ok(Number.isNaN(E.desvioPadrao([3])));
  assert.ok(Number.isNaN(E.variancia([3])));
  assert.equal(E.amplitude(DADOS), 7);
});

test('percentis e quartis (método português)', () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(E.percentil(xs, 25), 3);
  assert.equal(E.percentil(xs, 50), 5.5);
  assert.equal(E.percentil(xs, 75), 8);
  assert.deepEqual(E.quartis(xs), { q1: 3, q2: 5.5, q3: 8 });
  assert.equal(E.amplitudeInterquartil(xs), 5);
  assert.deepEqual(E.extremosQuartis(xs), { min: 1, q1: 3, q2: 5.5, q3: 8, max: 10 });
  assert.equal(E.percentil([5, 1, 3], 50), 3);
});

test('listas vazias', () => {
  assert.ok(Number.isNaN(E.media([])));
  assert.ok(Number.isNaN(E.mediana([])));
  assert.ok(Number.isNaN(E.percentil([], 50)));
  assert.ok(Number.isNaN(E.amplitude([])));
  assert.ok(Number.isNaN(E.variancia([])));
});

test('tabela de frequências', () => {
  const t = E.tabelaFrequencias([1, 2, 2, 3]);
  assert.deepEqual(t, [
    { valor: 1, absoluta: 1, absolutaAcumulada: 1, relativa: 0.25, relativaAcumulada: 0.25 },
    { valor: 2, absoluta: 2, absolutaAcumulada: 3, relativa: 0.5, relativaAcumulada: 0.75 },
    { valor: 3, absoluta: 1, absolutaAcumulada: 4, relativa: 0.25, relativaAcumulada: 1 },
  ]);
  assert.deepEqual(E.tabelaFrequencias([]), []);
});

test('classes e dados agrupados', () => {
  const c = E.classes([1, 2, 3, 4, 10], 5);
  assert.deepEqual(c.map(({ de, ate, absoluta }) => ({ de, ate, absoluta })), [
    { de: 1, ate: 6, absoluta: 4 },
    { de: 6, ate: 11, absoluta: 1 },
  ]);
  assert.deepEqual(c.map((k) => k.marca), [3.5, 8.5]);
  // o último intervalo inclui o máximo
  const d = E.classes([0, 5, 10], 5);
  assert.deepEqual(d.map((k) => k.absoluta), [1, 2]);
  perto(E.mediaAgrupada(c), (3.5 * 4 + 8.5) / 5);
  const g = [{ de: 0, ate: 2, absoluta: 2, marca: 1 }, { de: 2, ate: 4, absoluta: 2, marca: 3 }];
  perto(E.mediaAgrupada(g), 2);
  perto(E.desvioPadraoAgrupado(g), Math.sqrt(4 / 3));
  assert.ok(Number.isNaN(E.mediaAgrupada([])));
  assert.deepEqual(E.classes([], 5), []);
});

test('correlação e regressão', () => {
  perto(E.correlacao([[1, 2], [2, 4], [3, 6]]), 1);
  perto(E.correlacao([[1, 6], [2, 4], [3, 2]]), -1);
  assert.ok(Number.isNaN(E.correlacao([[1, 1], [2, 1], [3, 1]])));
  assert.ok(Number.isNaN(E.correlacao([[1, 1]])));
  const r = E.regressao([[1, 2], [2, 4], [3, 6]]);
  perto(r.declive, 2);
  perto(r.ordenada, 0);
  assert.equal(E.regressao([[1, 1], [1, 2]]), null);
});

test('propriedades de transformação afim', () => {
  const xs = [3, 8, 1, 9, 4, 4];
  perto(E.media(xs.map((x) => 2 * x + 3)), 2 * E.media(xs) + 3);
  perto(E.desvioPadrao(xs.map((x) => 2 * x + 3)), 2 * E.desvioPadrao(xs));
});
