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

test('cientifico: LaTeX com mantissa em [1, 10), vírgula e algarismos significativos', () => {
  const T = carregar('esquemas/mat-a/formatar.js').formatar;
  assert.equal(T.cientifico(6.022e23, 3), '6{,}02 \\times 10^{23}');
  assert.equal(T.cientifico(3.978e-19, 3), '3{,}98 \\times 10^{-19}');
  assert.equal(T.cientifico(3e8, 3), '3{,}00 \\times 10^{8}');
  assert.equal(T.cientifico(9.996e-7, 3), '1{,}00 \\times 10^{-6}');
  assert.equal(T.cientifico(656.9e-9, 2), '6{,}6 \\times 10^{-7}');
  assert.equal(T.cientifico(-2.18e-18, 3), '-2{,}18 \\times 10^{-18}');
  assert.equal(T.cientifico(22.4, 1), '2 \\times 10^{1}');
  assert.equal(T.cientifico(1.5, 2), '1{,}5 \\times 10^{0}');
  assert.equal(T.cientifico(0, 3), '0');
  assert.throws(() => T.cientifico(Infinity, 3));
  assert.throws(() => T.cientifico(1, 0));
});
