const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let A;
beforeEach(() => { A = carregar('js/aprendizagem.js').aprendizagem; });

let n = 0;
function t(o = {}) {
  n++;
  return {
    id: 'id' + String(n).padStart(4, '0'), subtema: 'afim', disciplina: 'mat-a', tema: 'funcoes',
    tipo: 'calculo', semente: n, resultado: 'certa', primeira_tentativa: true,
    viu_resolucao: false, usou_pista: false, erro_tipico: null,
    criado_em: '2026-11-10T10:00:00Z', ...o,
  };
}
const D1 = '2026-11-10T10:00:00Z', D2 = '2026-11-11T10:00:00Z', D3 = '2026-11-12T10:00:00Z';

test('sem tentativas -> null', () => {
  assert.equal(A.classificarSubtema([]).estado, null);
});
test('1 certa -> dificuldade', () => {
  assert.equal(A.classificarSubtema([t()]).estado, 'dificuldade');
});
test('3 certas no mesmo dia -> dificuldade', () => {
  const r = [t({ criado_em: '2026-11-10T09:00:00Z' }), t({ criado_em: '2026-11-10T10:00:00Z' }), t({ criado_em: '2026-11-10T11:00:00Z' })];
  assert.equal(A.classificarSubtema(r).estado, 'dificuldade');
});
test('3 certas em 2 dias -> domina', () => {
  assert.equal(A.classificarSubtema([t({ criado_em: D1 }), t({ criado_em: D2 }), t({ criado_em: D3 })]).estado, 'domina');
});
test('3 certas com pista -> dificuldade', () => {
  assert.equal(A.classificarSubtema([t({ criado_em: D1 }), t({ criado_em: D2, usou_pista: true }), t({ criado_em: D3 })]).estado, 'dificuldade');
});
test('2 erradas seguidas com sementes diferentes -> nao_resolvido', () => {
  const r = A.classificarSubtema([t({ resultado: 'errada', semente: 1, criado_em: D1 }), t({ resultado: 'errada', semente: 2, criado_em: D2 })]);
  assert.equal(r.estado, 'nao_resolvido');
  assert.equal(r.tipos.calculo, 'nao_resolvido');
});
test('2 erradas com a mesma semente -> nao e nao_resolvido', () => {
  const r = A.classificarSubtema([t({ resultado: 'errada', semente: 5, criado_em: D1 }), t({ resultado: 'errada', semente: 5, criado_em: D2 })]);
  assert.equal(r.estado, 'dificuldade');
  assert.deepEqual(r.tipos, {});
});
test('banco (semente nula): tentativas distintas contam', () => {
  const r = A.estadoTipo([t({ resultado: 'errada', semente: null, criado_em: D1 }), t({ resultado: 'errada', semente: null, criado_em: D2 })]);
  assert.equal(r, 'nao_resolvido');
});
test('errada, errada, certa -> recuperado', () => {
  const r = A.classificarSubtema([t({ resultado: 'errada', criado_em: D1 }), t({ resultado: 'errada', criado_em: D2 }), t({ criado_em: D3 })]);
  assert.equal(r.estado, 'dificuldade');
  assert.deepEqual(r.tipos, {});
});
test('janela: tipo errado fora da janela de 6 deixa de contar -> domina', () => {
  const velhas = Array.from({ length: 6 }, (_, i) => t({ tipo: 'a', resultado: 'errada', semente: 100 + i, criado_em: '2026-11-01T1' + i + ':00:00Z' }));
  const certas = [t({ tipo: 'b', criado_em: D1 }), t({ tipo: 'b', criado_em: D2 }), t({ tipo: 'b', criado_em: D3 })];
  // janela de 6 = 3 erradas do tipo a + 3 certas do tipo b: tipo a ainda nao resolvido
  assert.equal(A.classificarSubtema([...velhas, ...certas]).estado, 'nao_resolvido');
  const mais = [...velhas, ...certas,
    t({ tipo: 'b', criado_em: '2026-11-13T10:00:00Z' }), t({ tipo: 'b', criado_em: '2026-11-13T11:00:00Z' }), t({ tipo: 'b', criado_em: '2026-11-14T12:00:00Z' })];
  const r = A.classificarSubtema(mais);
  assert.equal(r.estado, 'domina');
  assert.deepEqual(r.tipos, {});
});
test('fora de ordem = ordenado', () => {
  const l = [t({ criado_em: D1 }), t({ criado_em: D2 }), t({ criado_em: D3 })];
  assert.deepEqual(A.classificarSubtema([l[2], l[0], l[1]]), A.classificarSubtema(l));
});
test('mesmo instante: desempata por id', () => {
  const x = t({ id: 'a', resultado: 'errada', criado_em: D1 });
  const y = t({ id: 'b', criado_em: D1 });
  assert.equal(A.estadoTipo([y, x]), null);
  assert.deepEqual(A.classificarSubtema([y, x]), A.classificarSubtema([x, y]));
});
test('diaLisboa', () => {
  assert.equal(A.diaLisboa('2026-11-12T23:30:00Z'), '2026-11-12');
  assert.equal(A.diaLisboa('2026-11-13T00:30:00Z'), '2026-11-13');
  assert.equal(A.diaLisboa('2026-07-12T23:30:00Z'), '2026-07-13');
});
test('domina conta dias de Lisboa', () => {
  const r = A.classificarSubtema([t({ criado_em: '2026-11-12T22:00:00Z' }), t({ criado_em: '2026-11-12T23:30:00Z' }), t({ criado_em: '2026-11-13T00:30:00Z' })]);
  assert.equal(r.estado, 'domina');
});
test('classificarTudo agrupa por disciplina/tema/subtema', () => {
  const r = A.classificarTudo([t({ criado_em: D1 }), t({ subtema: 'quad', criado_em: D1, resultado: 'errada' })]);
  assert.deepEqual(Object.keys(r).sort(), ['mat-a/funcoes/afim', 'mat-a/funcoes/quad']);
  assert.equal(r['mat-a/funcoes/afim'].estado, 'dificuldade');
});
