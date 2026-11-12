const test = require('node:test');
const assert = require('node:assert');
const { carregar } = require('./ajuda');

const FICHEIROS = [
  'esquemas/nucleo/referencial.js',
  'esquemas/nucleo/ponto.js',
  'esquemas/nucleo/controlos.js',
  'esquemas/nucleo/desenho.js',
  'esquemas/nucleo/proj3d.js',
];

function perto(a, b, eps = 1e-9) {
  assert.ok(Math.abs(a - b) < eps, `${a} !≈ ${b}`);
}

test('os ficheiros carregam em Node sem DOM', () => {
  const M = carregar(...FICHEIROS);
  assert.equal(typeof M.nucleo.transformacao, 'function');
  assert.equal(typeof M.nucleo.amostrarFuncao, 'function');
  assert.equal(typeof M.nucleo.projetar, 'function');
});

test('transformacao: cantos e centro', () => {
  const { transformacao } = carregar(...FICHEIROS).nucleo;
  const t = transformacao({ xmin: -5, xmax: 5, ymin: -5, ymax: 5 }, 100, 100);
  assert.deepEqual(t.paraEcra([0, 0]), [50, 50]);
  assert.deepEqual(t.paraEcra([5, 5]), [100, 0]);
  assert.deepEqual(t.paraEcra([-5, -5]), [0, 100]);
});

test('transformacao: ida e volta', () => {
  const { transformacao } = carregar(...FICHEIROS).nucleo;
  const t = transformacao({ xmin: -3, xmax: 7, ymin: -2, ymax: 4 }, 320, 200);
  const p = [1.7, -0.4];
  const q = t.paraMundo(t.paraEcra(p));
  perto(q[0], p[0]);
  perto(q[1], p[1]);
});

test('transformacao: caixa não quadrada em ecrã quadrado mantém 1:1', () => {
  const { transformacao } = carregar(...FICHEIROS).nucleo;
  const t = transformacao({ xmin: 0, xmax: 10, ymin: 0, ymax: 5 }, 100, 100);
  const a = t.paraEcra([0, 0]);
  const b = t.paraEcra([1, 1]);
  perto(b[0] - a[0], a[1] - b[1]);
  // centrado: a caixa ocupa 100 px de largura e 50 de altura
  perto(t.paraEcra([0, 0])[1], 75);
  perto(t.paraEcra([0, 5])[1], 25);
});

test('amostrarFuncao: 1/x parte-se em segmentos', () => {
  const { amostrarFuncao } = carregar(...FICHEIROS).nucleo;
  const seg = amostrarFuncao((x) => 1 / x, -1, 1);
  assert.ok(seg.length >= 2);
});

test('amostrarFuncao: x em [0,1] com n=10 dá 1 segmento de 11 pontos', () => {
  const { amostrarFuncao } = carregar(...FICHEIROS).nucleo;
  const seg = amostrarFuncao((x) => x, 0, 1, 10);
  assert.equal(seg.length, 1);
  assert.equal(seg[0].length, 11);
});

test('amostrarFuncao: valores não finitos quebram o traçado', () => {
  const { amostrarFuncao } = carregar(...FICHEIROS).nucleo;
  const seg = amostrarFuncao((x) => (x > 0.4 && x < 0.6 ? NaN : x), 0, 1, 10);
  assert.equal(seg.length, 2);
});

test('amostrarFuncao: o intervalo de y explícito altera o resultado', () => {
  const { amostrarFuncao } = carregar(...FICHEIROS).nucleo;
  const f = (x) => (x < 0.5 ? 0 : 1000);
  assert.equal(amostrarFuncao(f, 0, 1, 10).length, 1);
  assert.equal(amostrarFuncao(f, 0, 1, 10, { ymin: 0, ymax: 10 }).length, 2);
});

test('amostrarFuncao: salto grande parte o traçado sem amostras não finitas', () => {
  const { amostrarFuncao } = carregar(...FICHEIROS).nucleo;
  const f = (x) => 1 / x;
  const n = 399; // x=0 não é amostrado
  for (let i = 0; i <= n; i++) assert.ok(Number.isFinite(f(-1 + (2 * i) / n)));
  assert.ok(amostrarFuncao(f, -1, 1, n).length >= 2);
});

test('arredondar remove ruído de vírgula flutuante', () => {
  const { arredondar } = carregar(...FICHEIROS).nucleo;
  assert.equal(arredondar(0.1 + 0.2), 0.3);
  assert.equal(arredondar(2.5), 2.5);
});

test('projetar: eixos com azimute e elevação 0', () => {
  const { projetar } = carregar(...FICHEIROS).nucleo;
  const o = { azimute: 0, elevacao: 0 };
  const a = projetar([1, 0, 0], o);
  perto(a[0], 1); perto(a[1], 0);
  const b = projetar([0, 0, 1], o);
  perto(b[0], 0); perto(b[1], 1);
  const c = projetar([0, 1, 0], { azimute: Math.PI / 2, elevacao: 0 });
  perto(c[0], -1); perto(c[1], 0);
});
