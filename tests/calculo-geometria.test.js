const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let G;
const perto = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`);
const pontoPerto = (p, q) => {
  assert.equal(p.length, q.length);
  p.forEach((v, i) => perto(v, q[i]));
};
const A = [0, 0], B = [4, 0], C = [0, 3];

beforeEach(() => {
  G = carregar('esquemas/mat-a/calculo-geometria.js').calc.geometria;
});

test('distância, ponto médio e vetores', () => {
  assert.equal(G.distancia([1, 2, 2], [0, 0, 0]), 3);
  assert.equal(G.distancia([0, 0], [3, 4]), 5);
  assert.deepEqual(G.pontoMedio([0, 0], [4, 2]), [2, 1]);
  assert.deepEqual(G.pontoMedio([0, 0, 0], [2, 4, 6]), [1, 2, 3]);
  assert.deepEqual(G.vetor([1, 1], [4, 5]), [3, 4]);
  assert.deepEqual(G.somar([1, 2], [3, 4]), [4, 6]);
  assert.deepEqual(G.subtrair([3, 4], [1, 2]), [2, 2]);
  assert.deepEqual(G.escalar(2, [1, -3, 2]), [2, -6, 4]);
  assert.equal(G.norma([3, 4]), 5);
  assert.deepEqual(G.pontoMaisVetor([1, 1], [2, 3]), [3, 4]);
  assert.deepEqual(G.retaVetorial([1, 1], [2, 3], 2), [5, 7]);
});

test('colineares', () => {
  assert.equal(G.colineares([2, 4], [1, 2]), true);
  assert.equal(G.colineares([1, 0], [0, 1]), false);
  assert.equal(G.colineares([0, 0], [1, 5]), true);
  assert.equal(G.colineares([1, 2, 3], [2, 4, 6]), true);
  assert.equal(G.colineares([1, 2, 3], [2, 4, 7]), false);
});

test('equação reduzida e mediatriz', () => {
  const r = G.equacaoReduzida([0, 1], [2, 4]);
  perto(r.m, 2);
  perto(r.b, 1);
  assert.deepEqual(G.equacaoReduzida([3, 0], [0, 5]), { vertical: 3 });
  assert.equal(G.equacaoReduzida([3, 0], [0, 0]), null);
  // mediatriz de [AB] com A(0,0), B(4,0): x = 2
  const m = G.mediatriz(A, B);
  perto(m.a * 2 + m.b * 0, m.c);
  perto(m.a * 2 + m.b * 5, m.c);
  assert.ok(Math.abs(m.b) < 1e-9);
});

test('centros notáveis do triângulo', () => {
  const O = G.circuncentro(A, B, C);
  pontoPerto(O.centro, [2, 1.5]);
  perto(O.raio, 2.5);
  pontoPerto(G.ortocentro(A, B, C), [0, 0]);
  pontoPerto(G.baricentro(A, B, C), [4 / 3, 1]);
  const I = G.incentro(A, B, C);
  pontoPerto(I.centro, [1, 1]);
  perto(I.raio, 1);
  const N = G.circunferenciaNovePontos(A, B, C);
  pontoPerto(N.centro, [1, 0.75]);
  perto(N.raio, 1.25);
  const g = G.baricentro(A, B, C), h = G.ortocentro(A, B, C);
  assert.equal(G.colineares(G.vetor(O.centro, g), G.vetor(O.centro, h)), true);
});

test('triângulo degenerado', () => {
  const P = [0, 0], Q = [1, 1], R = [2, 2];
  assert.equal(G.degenerado(P, Q, R), true);
  assert.equal(G.degenerado(A, B, C), false);
  assert.equal(G.circuncentro(P, Q, R), null);
  assert.equal(G.incentro(P, Q, R), null);
  assert.equal(G.ortocentro(P, Q, R), null);
  assert.equal(G.baricentro(P, Q, R), null);
  assert.equal(G.circunferenciaNovePontos(P, Q, R), null);
});
