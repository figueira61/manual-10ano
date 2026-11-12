const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

test('fator: (x − a)² com o sinal tratado', () => {
  const T = carregar('esquemas/mat-a/formatar.js').formatar;
  assert.equal(T.fator('x', -1), '(x + 1)²');
  assert.equal(T.fator('y', 0), 'y²');
  assert.equal(T.fator('z', 2.5), '(z − 2,5)²');
});

test('aprox: "≈ " só quando o valor mostrado (3 casas) difere do real', () => {
  const T = carregar('esquemas/mat-a/formatar.js').formatar;
  assert.equal(T.aprox(2.5), '');
  assert.equal(T.aprox(1 / 3), '≈ ');
  assert.equal(T.aprox(-2 / 3), '≈ ');
  assert.equal(T.aprox(0.0004), '≈ ');
});
