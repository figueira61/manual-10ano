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
  const e1 = t({ id: 'a', resultado: 'errada', semente: 1, criado_em: D1 });
  const e2 = t({ id: 'b', resultado: 'errada', semente: 2, criado_em: D1 });
  const c = t({ id: 'c', resultado: 'certa', criado_em: D1 });
  assert.equal(A.estadoTipo([c, e2, e1]), null);
  assert.equal(A.estadoTipo([e1, e2, c]), null);
  const r = [{ ...c, id: 'a' }, { ...e1, id: 'b' }, { ...e2, id: 'c' }];
  assert.equal(A.estadoTipo(r), 'nao_resolvido');
  assert.equal(A.estadoTipo(r.slice().reverse()), 'nao_resolvido');
});
test('entradas invalidas sao ignoradas sem lancar', () => {
  const lixo = [null, undefined, 5, 'x', {}, { criado_em: 'lixo' }, t({ criado_em: null })];
  const bom = [t({ criado_em: D1 }), t({ criado_em: D2 }), t({ criado_em: D3 })];
  assert.deepEqual(A.classificarSubtema([...lixo, ...bom]), A.classificarSubtema(bom));
  assert.equal(A.classificarSubtema(lixo).estado, null);
  assert.equal(A.estadoTipo(lixo), null);
  assert.deepEqual(Object.keys(A.classificarTudo([...lixo, ...bom])), ['mat-a/funcoes/afim']);
  assert.deepEqual(A.classificarTudo(lixo), {});
  assert.deepEqual(A.classificarTudo(null), {});
});
test('diaLisboa devolve null para entrada invalida', () => {
  [null, undefined, 'lixo', '', {}, NaN].forEach((v) => assert.equal(A.diaLisboa(v), null));
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

// Task 3
test('INTERVALOS', () => {
  assert.deepEqual(A.INTERVALOS, [1, 3, 7, 14, 30]);
});
test('proximaRevisao: sequencia de acertos limpos', () => {
  const agora = new Date('2026-11-13T10:00:00Z');
  let iv = null; const vistos = [];
  for (let i = 0; i < 6; i++) { iv = A.proximaRevisao(iv, t(), agora).intervalo_dias; vistos.push(iv); }
  assert.deepEqual(vistos, [1, 3, 7, 14, 30, 30]);
});
test('proximaRevisao: errada volta a 1', () => {
  const agora = new Date('2026-11-13T10:00:00Z');
  assert.equal(A.proximaRevisao(14, t({ resultado: 'errada' }), agora).intervalo_dias, 1);
});
test('proximaRevisao: certa com ajuda mantem (null -> 1)', () => {
  const agora = new Date('2026-11-13T10:00:00Z');
  assert.equal(A.proximaRevisao(7, t({ usou_pista: true }), agora).intervalo_dias, 7);
  assert.equal(A.proximaRevisao(7, t({ viu_resolucao: true }), agora).intervalo_dias, 7);
  assert.equal(A.proximaRevisao(7, t({ primeira_tentativa: false }), agora).intervalo_dias, 7);
  assert.equal(A.proximaRevisao(null, t({ usou_pista: true }), agora).intervalo_dias, 1);
});
test('proximaRevisao: datas em dias de Lisboa', () => {
  const agora = new Date('2026-11-13T10:00:00Z');
  assert.equal(A.proximaRevisao(1, t(), agora).proxima_revisao, '2026-11-16');
  assert.equal(A.proximaRevisao(3, t({ usou_pista: true }), new Date('2026-12-30T10:00:00Z')).proxima_revisao, '2027-01-02');
  assert.equal(A.proximaRevisao(7, t({ usou_pista: true }), new Date('2026-12-30T10:00:00Z')).proxima_revisao, '2027-01-06');
  // 23:30Z em verao ja e dia seguinte em Lisboa
  assert.equal(A.proximaRevisao(null, t(), new Date('2026-07-12T23:30:00Z')).proxima_revisao, '2026-07-14');
  // atravessa mudanca de hora (outubro 2026)
  assert.equal(A.proximaRevisao(7, t({ usou_pista: true }), new Date('2026-10-20T12:00:00Z')).proxima_revisao, '2026-10-27');
});
test('proximoNivel', () => {
  assert.equal(A.proximoNivel(0, ['certa', 'certa']), 1);
  assert.equal(A.proximoNivel(2, ['certa', 'certa']), 2);
  assert.equal(A.proximoNivel(1, ['errada']), 0);
  assert.equal(A.proximoNivel(0, ['errada']), 0);
  assert.equal(A.proximoNivel(1, ['certa']), 1);
  assert.equal(A.proximoNivel(1, ['errada', 'certa', 'certa']), 2);
  assert.equal(A.proximoNivel(1, []), 1);
});
test('emRevisao: vencidos por prioridade e data', () => {
  const agora = new Date('2026-11-13T10:00:00Z');
  const r = A.emRevisao([
    { chave: 'futuro', estado: 'nao_resolvido', proxima_revisao: '2026-11-14' },
    { chave: 'dom', estado: 'domina', proxima_revisao: '2026-11-01' },
    { chave: 'nr', estado: 'nao_resolvido', proxima_revisao: '2026-11-13' },
    { chave: 'semdata', estado: 'nao_resolvido', proxima_revisao: null },
    { chave: 'dif', estado: 'dificuldade', proxima_revisao: '2026-11-05' },
    { chave: 'dif0', estado: 'dificuldade', proxima_revisao: '2026-11-02' },
  ], agora);
  assert.deepEqual(r, ['nr', 'dif0', 'dif', 'dom']);
});
