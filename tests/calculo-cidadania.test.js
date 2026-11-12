const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let C;
const perto = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} !~ ${b}`);

beforeEach(() => {
  C = carregar('esquemas/mat-a/calculo-cidadania.js').calc.cidadania;
});

test('maioria: simples e absoluta', () => {
  const r = C.maioria([270, 153, 201]);
  assert.equal(r.total, 624);
  assert.equal(r.limiarAbsoluta, 313);
  assert.equal(r.simples, 0);
  assert.equal(r.absoluta, null);
  assert.equal(C.maioria([5, 5, 1]).simples, null);
  assert.equal(C.maioria([7, 2, 1]).absoluta, 0);
});

test('borda: pontos e vencedor', () => {
  const r = C.borda([
    { ordem: [0, 1, 2], quantidade: 4 },
    { ordem: [1, 2, 0], quantidade: 3 },
    { ordem: [2, 1, 0], quantidade: 2 },
  ], 3);
  assert.deepEqual(r.pontos, [17, 21, 16]);
  assert.equal(r.vencedor, 1);
  assert.equal(C.borda([{ ordem: [0, 1], quantidade: 1 }, { ordem: [1, 0], quantidade: 1 }], 2).vencedor, null);
});

test('hondt e St. Laguë divergem', () => {
  assert.deepEqual(C.hondt([10000, 6000, 3500, 1500], 7).mandatos, [4, 2, 1, 0]);
  assert.deepEqual(C.stLague([10000, 6000, 3500, 1500], 7).mandatos, [3, 2, 1, 1]);
  assert.deepEqual(C.hondt([10000, 6000, 3500, 1500], 6).mandatos, [3, 2, 1, 0]);
  assert.deepEqual(C.hondt([12000, 7500, 4500, 3000], 8).mandatos, [4, 2, 1, 1]);
});

test('hondt: quocientes e atribuições', () => {
  const r = C.hondt([10000, 6000, 3500, 1500], 6);
  assert.equal(r.quocientes.length, 4);
  assert.equal(r.quocientes[0].length, 6);
  perto(r.quocientes[0][1], 5000);
  assert.equal(r.atribuicoes.length, 6);
  assert.deepEqual(r.atribuicoes[0], { partido: 0, divisor: 1, quociente: 10000 });
});

test('hondt: empate vai para o partido com menos votos', () => {
  const r = C.hondt([100, 50], 2);
  assert.deepEqual(r.mandatos, [1, 1]);
  assert.equal(r.atribuicoes[1].partido, 1);
});

test('hondt: casos limite', () => {
  assert.deepEqual(C.hondt([10, 0], 2).mandatos, [2, 0]);
  const r = C.hondt([10, 5], 0);
  assert.deepEqual(r.mandatos, [0, 0]);
  assert.deepEqual(r.atribuicoes, []);
});

test('juros simples e compostos', () => {
  const s = C.jurosSimples(1000, 0.05, 2);
  perto(s.juro, 100);
  perto(s.montante, 1100);
  perto(C.jurosCompostos(1000, 0.03, 1, 1).montante, 1030);
  perto(C.jurosCompostos(1000, 0.05, 2, 1).montante, 1102.5);
  const c = C.jurosCompostos(300, 0.03, 10 / 12, 12);
  assert.equal(c.passos.length, 10);
  assert.equal(c.passos[0].periodo, 1);
  perto(c.passos[0].montante, 300 * (1 + 0.03 / 12));
  perto(c.juro, c.montante - 300);
});

test('irsAnual progressivo', () => {
  const r = C.irsAnual(15000, [{ ate: 10000, taxa: 0.1 }, { ate: Infinity, taxa: 0.2 }]);
  perto(r.imposto, 2000);
  assert.equal(r.parcelas.length, 2);
  assert.equal(r.parcelas[1].base, 5000);
});

test('salario', () => {
  const r = C.salario(1000, { tabelaRetencao: [{ ate: 900, taxa: 0 }, { ate: Infinity, taxa: 0.1 }] });
  perto(r.ss, 110);
  perto(r.retencao, 100);
  perto(r.liquido, 790);
  assert.equal(r.taxaRetencao, 0.1);
});

test('constantes ilustrativas exportadas', () => {
  assert.ok(C.ESCALOES_IRS_ILUSTRATIVOS.length >= 4);
  assert.equal(C.ESCALOES_IRS_ILUSTRATIVOS.at(-1).ate, Infinity);
  assert.equal(C.TABELA_RETENCAO_ILUSTRATIVA.at(-1).ate, Infinity);
});
