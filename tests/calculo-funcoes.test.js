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
