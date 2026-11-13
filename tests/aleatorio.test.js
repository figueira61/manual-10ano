const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/aleatorio.js');
});

test('mesma semente produz a mesma sequência', () => {
  const a = Manual.aleatorio.criar(42);
  const b = Manual.aleatorio.criar(42);
  const sa = Array.from({ length: 5 }, () => a());
  const sb = Array.from({ length: 5 }, () => b());
  assert.deepEqual(sa, sb);
});

test('sementes diferentes produzem sequências diferentes', () => {
  const a = Manual.aleatorio.criar(1);
  const b = Manual.aleatorio.criar(2);
  const sa = Array.from({ length: 5 }, () => a());
  const sb = Array.from({ length: 5 }, () => b());
  assert.notDeepEqual(sa, sb);
});

test('valores ficam sempre em [0, 1)', () => {
  const rng = Manual.aleatorio.criar(7);
  for (let i = 0; i < 10000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `valor fora de [0,1): ${v}`);
  }
});

test('inteiro(rng, 1, 6) fica em 1..6 e produz os seis valores', () => {
  const rng = Manual.aleatorio.criar(123);
  const vistos = new Set();
  for (let i = 0; i < 1000; i++) {
    const v = Manual.aleatorio.inteiro(rng, 1, 6);
    assert.ok(Number.isInteger(v) && v >= 1 && v <= 6, `valor inválido: ${v}`);
    vistos.add(v);
  }
  assert.equal(vistos.size, 6);
});

test('baralhar devolve uma permutação sem alterar a lista original', () => {
  const rng = Manual.aleatorio.criar(99);
  const original = [1, 2, 3, 4, 5, 6, 7, 8];
  const copia = original.slice();
  const baralhada = Manual.aleatorio.baralhar(rng, original);
  assert.deepEqual(original, copia);
  assert.notEqual(baralhada, original);
  assert.deepEqual([...baralhada].sort((x, y) => x - y), copia);
});

test('novaSemente é inteiro de 32 bits', () => {
  for (let i = 0; i < 100; i++) {
    const s = Manual.aleatorio.novaSemente();
    assert.ok(Number.isInteger(s) && s >= 0 && s < 2 ** 32, `semente inválida: ${s}`);
  }
});

test('novaSemente usa Math.random quando crypto não existe', () => {
  const descritor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const aleatorioOriginal = Math.random;
  try {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    Math.random = () => 0.5;
    assert.equal(Manual.aleatorio.novaSemente(), 2 ** 31);
  } finally {
    Math.random = aleatorioOriginal;
    if (descritor) Object.defineProperty(globalThis, 'crypto', descritor);
  }
});
