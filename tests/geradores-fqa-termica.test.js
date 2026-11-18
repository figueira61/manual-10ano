// Geradores de Física — Energia, fenómenos térmicos e radiação (js/geradores/fqa/fisica-termica.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregarTudo } = require('../tools/verificar-geradores.js');
const { bateria, itensDe } = require('./geradores-fisica-comum.js');

const M = carregarTudo();
require('../js/quiz.js');
require('../js/aprendizagem.js');
require('../js/painel.js');
const G = M.geradores;

const IDS = [
  'transferencias-mecanismo', 'transferencias-equilibrio', 'transferencias-infravermelho',
];
const SUBTEMAS = ['transferencias', 'balancos', 'rendimento'];
const defs = () => G.todos().filter((d) => d.disciplina === 'fqa' && d.tema === 'termica');
const itens = (id, s, f) => itensDe(G, id, s, f);

test('regista os geradores de térmica, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  assert.deepEqual(defs().map((d) => d.id), IDS);
  for (const d of defs()) {
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(SUBTEMAS.includes(d.subtema), d.id);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, d.id);
  }
});

bateria(M, IDS);

// Corpus de cada gerador qualitativo, lido a partir dos itens gerados (dados.situacao / dados.afirmacao).
function corpus(id, campo) {
  const vistos = new Map();
  for (const p of itens(id, 400)) {
    const k = p.dados[campo];
    const texto = p.formato === 'vf' ? p.enunciado : p.enunciado;
    if (!vistos.has(k)) vistos.set(k, texto);
  }
  return vistos;
}

test('mecanismo: ≥ 10 situações distintas; a verdade bate com os critérios (fluido, contacto); vf com as duas respostas', () => {
  const c = corpus('transferencias-mecanismo', 'situacao');
  assert.ok(c.size >= 10, 'só ' + c.size + ' situações');
  const enunciados = new Set();
  const porMec = {};
  for (const p of itens('transferencias-mecanismo', 300, ['escolha'])) {
    enunciados.add(p.enunciado);
    porMec[p.opcoes[p.correta]] = (porMec[p.opcoes[p.correta]] || 0) + 1;
    assert.equal(p.opcoes.length, 3);
    assert.deepEqual([...p.opcoes].sort(), ['Condução', 'Convecção', 'Radiação']);
  }
  assert.equal(enunciados.size, c.size, 'situações com o mesmo texto');
  for (const m of ['Condução', 'Convecção', 'Radiação']) assert.ok(porMec[m] >= 30, m + ': ' + porMec[m]);
  const vf = [...itens('transferencias-mecanismo', 200, ['vf'])];
  assert.ok(vf.some((p) => p.correta) && vf.some((p) => !p.correta));
  for (const p of vf) if (!p.correta) assert.match(p.errosTipicos[0].codigo, /_(em_vez_de_(conducao|conveccao|radiacao)|no_vazio)$/);
});

test('equilíbrio: ≥ 10 situações distintas; quem cede energia é o corpo mais quente e o equilíbrio fica entre as duas temperaturas', () => {
  const c = corpus('transferencias-equilibrio', 'situacao');
  assert.ok(c.size >= 10, 'só ' + c.size + ' situações');
  const cenas = new Set();
  for (const p of itens('transferencias-equilibrio', 300, ['escolha'])) {
    const t = [...p.enunciado.matchAll(/(−?\d+) °C/g)].map((m) => Number(m[1].replace('−', '-')));
    assert.equal(t.length, 2, p.enunciado);
    cenas.add(p.enunciado);
    const certa = p.opcoes[p.correta];
    assert.match(certa, new RegExp('entre ' + String(Math.min(...t)).replace('-', '−') + ' °C e ' + Math.max(...t) + ' °C'));
    assert.ok(p.errosTipicos.every((e) => !/mesma temperatura, entre/.test(p.opcoes[e.opcao])));
  }
  assert.equal(cenas.size, c.size, 'situações com o mesmo texto');
  const vf = [...itens('transferencias-equilibrio', 200, ['vf'])];
  assert.ok(vf.some((p) => p.correta) && vf.some((p) => !p.correta));
});

test('infravermelho: ≥ 10 afirmações distintas, verdadeiras e falsas; na escolha só uma é verdadeira', () => {
  const c = corpus('transferencias-infravermelho', 'afirmacao');
  assert.ok(c.size >= 10, 'só ' + c.size + ' afirmações');
  const textos = new Set();
  const vf = [...itens('transferencias-infravermelho', 400, ['vf'])];
  for (const p of vf) textos.add(p.enunciado);
  const ids = new Set(vf.map((p) => p.dados.afirmacao));
  assert.equal(textos.size, ids.size, 'afirmações com o mesmo texto');
  assert.ok(ids.size >= 10);
  assert.ok(vf.some((p) => p.correta) && vf.some((p) => !p.correta));
  const verdadeiras = new Set(vf.filter((p) => p.correta).map((p) => p.enunciado));
  const falsas = new Set(vf.filter((p) => !p.correta).map((p) => p.enunciado));
  for (const p of itens('transferencias-infravermelho', 100, ['escolha'])) {
    assert.ok(verdadeiras.has(p.opcoes[p.correta]) || !falsas.has(p.opcoes[p.correta]));
    p.errosTipicos.forEach((e) => assert.ok(!verdadeiras.has(p.opcoes[e.opcao]), p.opcoes[e.opcao]));
  }
});
