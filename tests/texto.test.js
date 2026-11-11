const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/texto.js');
});

test('math inline entre textos', () => {
  assert.deepEqual(Manual.texto.partir('a $x^2$ b'), [
    { tipo: 'texto', valor: 'a ' },
    { tipo: 'math', valor: 'x^2', display: false },
    { tipo: 'texto', valor: ' b' },
  ]);
});

test('$$...$$ é math display', () => {
  assert.deepEqual(Manual.texto.partir('$$f(x)$$'), [
    { tipo: 'math', valor: 'f(x)', display: true },
  ]);
});

test('\\$ é um cifrão literal e junta-se ao texto', () => {
  assert.deepEqual(Manual.texto.partir('custa \\$5'), [{ tipo: 'texto', valor: 'custa $5' }]);
});

test('**negrito**', () => {
  assert.deepEqual(Manual.texto.partir('**zeros** de f'), [
    { tipo: 'negrito', valor: 'zeros' },
    { tipo: 'texto', valor: ' de f' },
  ]);
});

test('$ sem fecho é texto literal', () => {
  assert.deepEqual(Manual.texto.partir('preço $3'), [{ tipo: 'texto', valor: 'preço $3' }]);
});

test('string vazia dá lista vazia', () => {
  assert.deepEqual(Manual.texto.partir(''), []);
});
