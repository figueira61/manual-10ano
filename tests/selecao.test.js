const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let M, S;
beforeEach(() => {
  M = carregar('js/aleatorio.js', 'js/aprendizagem.js', 'js/selecao.js');
  S = M.selecao;
});

let n = 0;
function t(tipo, o = {}) {
  n++;
  return {
    id: 'h' + String(n).padStart(4, '0'), tipo, semente: n, resultado: 'certa',
    primeira_tentativa: true, viu_resolucao: false, usou_pista: false,
    criado_em: '2026-11-10T10:' + String(n % 60).padStart(2, '0') + ':00Z', ...o,
  };
}
const errada = (tipo, o) => t(tipo, { resultado: 'errada', primeira_tentativa: false, ...o });

test('pesoTipo: 4, 3, 2, 0.5, 1', () => {
  assert.equal(S.pesoTipo([errada('a'), errada('a')]), 4);
  assert.equal(S.pesoTipo([errada('a'), t('a'), t('a')]), 3);
  assert.equal(S.pesoTipo([]), 2);
  assert.equal(S.pesoTipo([t('a'), t('a'), t('a')]), 0.5);
  assert.equal(S.pesoTipo([t('a'), t('a')]), 1);
  assert.equal(S.pesoTipo([t('a', { usou_pista: true }), t('a'), t('a')]), 1);
});

test('escolher: frequências 4 : 2 : 0,5 com n=1', () => {
  const hist = [errada('nr'), errada('nr'), t('dom'), t('dom'), t('dom')];
  const cands = [
    { tipo: 'nr', competencia: 'c', formato: 'f', semente: 900001, subtema: 's' },
    { tipo: 'sp', competencia: 'c', formato: 'f', semente: 900002, subtema: 's' },
    { tipo: 'dom', competencia: 'c', formato: 'f', semente: 900003, subtema: 's' },
  ];
  const rng = M.aleatorio.criar(12345);
  const cont = { nr: 0, sp: 0, dom: 0 };
  const N = 10000;
  for (let i = 0; i < N; i++) cont[S.escolher(cands, hist, { n: 1, rng })[0].tipo]++;
  const esperado = { nr: 4 / 6.5, sp: 2 / 6.5, dom: 0.5 / 6.5 };
  Object.keys(esperado).forEach((k) => {
    const f = cont[k] / N;
    assert.ok(Math.abs(f - esperado[k]) / esperado[k] <= 0.1, k + ' ' + f);
  });
});

test('escolher: nunca devolve semente já vista', () => {
  const hist = [t('a', { semente: 5 }), t('a', { semente: 6 })];
  const cands = [5, 6, 7].map((s) => ({ tipo: 'a', competencia: 'c', formato: 'f', semente: s, subtema: 's' }));
  const rng = M.aleatorio.criar(1);
  for (let i = 0; i < 50; i++) {
    const r = S.escolher(cands, hist, { n: 3, rng });
    assert.equal(r.length, 1);
    assert.equal(r[0].semente, 7);
  }
});

test('escolher: semente vista noutro tipo não exclui', () => {
  const hist = [t('a', { semente: 5 })];
  const r = S.escolher([{ tipo: 'b', competencia: 'c', formato: 'f', semente: 5, subtema: 's' }], hist, { n: 1, rng: M.aleatorio.criar(1) });
  assert.equal(r.length, 1);
});

test('escolher: ultimoErro força competência com outro formato', () => {
  const cands = [
    { tipo: 'a', competencia: 'x', formato: 'num', subtema: 's' },
    { tipo: 'b', competencia: 'x', formato: 'graf', subtema: 's' },
    { tipo: 'c', competencia: 'y', formato: 'graf', subtema: 's' },
  ];
  const ult = { competencia: 'x', formato: 'num' };
  for (let i = 0; i < 40; i++) {
    const r = S.escolher(cands, [], { n: 2, rng: M.aleatorio.criar(i), ultimoErro: ult });
    assert.equal(r[0].tipo, 'b');
    assert.equal(r.length, 2);
  }
});

test('escolher: ultimoErro sem alternativa de formato -> qualquer da competência', () => {
  const cands = [
    { tipo: 'a', competencia: 'x', formato: 'num', subtema: 's' },
    { tipo: 'c', competencia: 'y', formato: 'graf', subtema: 's' },
  ];
  for (let i = 0; i < 40; i++) {
    const r = S.escolher(cands, [], { n: 1, rng: M.aleatorio.criar(i), ultimoErro: { competencia: 'x', formato: 'num' } });
    assert.equal(r[0].tipo, 'a');
  }
});

test('escolher: ultimoErro sem a competência -> escolha normal', () => {
  const cands = [{ tipo: 'c', competencia: 'y', formato: 'graf', subtema: 's' }];
  const r = S.escolher(cands, [], { n: 1, rng: M.aleatorio.criar(1), ultimoErro: { competencia: 'x', formato: 'num' } });
  assert.equal(r[0].tipo, 'c');
});

test('escolher: no máximo um candidato por tipo', () => {
  const cands = [1, 2, 3].map((s) => ({ tipo: 'a', competencia: 'c', formato: 'f', semente: s, subtema: 's' }));
  assert.equal(S.escolher(cands, [], { n: 3, rng: M.aleatorio.criar(1) }).length, 1);
});

test('escolher: banco prefere perguntas não vistas, depois as vistas há mais tempo', () => {
  const hist = [
    t('p1', { semente: null, criado_em: '2026-11-10T10:00:00Z' }),
    t('p2', { semente: null, criado_em: '2026-11-11T10:00:00Z' }),
  ];
  const cands = ['p1', 'p2', 'p3'].map((x) => ({ tipo: x, competencia: x, formato: 'f', subtema: 's' }));
  for (let i = 0; i < 30; i++) {
    const r = S.escolher(cands, hist, { n: 2, rng: M.aleatorio.criar(i) });
    assert.deepEqual(r.map((c) => c.tipo).sort(), ['p1', 'p3']);
  }
});

test('escolher: mesma semente de rng -> mesma escolha', () => {
  const cands = ['a', 'b', 'c', 'd', 'e'].map((x, i) => ({ tipo: x, competencia: x, formato: 'f', semente: i, subtema: 's' }));
  const a = S.escolher(cands, [], { n: 3, rng: M.aleatorio.criar(99) });
  const b = S.escolher(cands, [], { n: 3, rng: M.aleatorio.criar(99) });
  assert.deepEqual(a, b);
});

test('escolher: entradas inválidas não lançam', () => {
  const cands = [{ tipo: 'a', competencia: 'c', formato: 'f', subtema: 's' }];
  assert.equal(S.escolher(cands, null, { n: 1, rng: M.aleatorio.criar(1) }).length, 1);
  assert.deepEqual(S.escolher(null, [], { n: 1, rng: M.aleatorio.criar(1) }), []);
});

function banco(temas, porTema) {
  const r = [];
  temas.forEach((tm) => { for (let i = 0; i < porTema; i++) r.push({ tipo: tm + i, tema: tm, competencia: 'c', formato: 'f', subtema: 's' }); });
  return r;
}
const contar = (r) => r.reduce((o, c) => { o[c.tema] = (o[c.tema] || 0) + 1; return o; }, {});

test('estratificar: 10 por 3 temas -> 4/3/3', () => {
  const r = S.estratificar(banco(['a', 'b', 'c'], 8), ['a', 'b', 'c'], 10, M.aleatorio.criar(1));
  assert.deepEqual(contar(r), { a: 4, b: 3, c: 3 });
  assert.equal(new Set(r.map((c) => c.tipo)).size, 10);
});

test('estratificar: quota não preenchida passa aos temas seguintes', () => {
  const cands = banco(['a'], 1).concat(banco(['b'], 8), banco(['c'], 8));
  const r = S.estratificar(cands, ['a', 'b', 'c'], 10, M.aleatorio.criar(1));
  assert.equal(r.length, 10);
  assert.equal(contar(r).a, 1);
  assert.equal(contar(r).b + contar(r).c, 9);
});

test('estratificar: n maior que candidatos devolve todos sem repetir', () => {
  const r = S.estratificar(banco(['a', 'b'], 2), ['a', 'b'], 50, M.aleatorio.criar(1));
  assert.equal(r.length, 4);
  assert.equal(new Set(r.map((c) => c.tipo)).size, 4);
});

test('estratificar: determinístico com a mesma semente', () => {
  const cands = banco(['a', 'b'], 6);
  assert.deepEqual(S.estratificar(cands, ['a', 'b'], 5, M.aleatorio.criar(7)), S.estratificar(cands, ['a', 'b'], 5, M.aleatorio.criar(7)));
});
