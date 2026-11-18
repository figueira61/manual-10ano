// Geradores de Física — Energia e fenómenos elétricos (js/geradores/fqa/fisica-eletricidade.js).
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
  'circuitos-lei-ohm', 'circuitos-associacao', 'circuitos-potencia-energia',
];
const SUBTEMAS = ['circuitos', 'gerador'];
const defs = () => G.todos().filter((d) => d.disciplina === 'fqa' && d.tema === 'eletricidade');
const itens = (id, s, f) => itensDe(G, id, s, f);

test('regista os geradores de eletricidade, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  assert.deepEqual(defs().map((d) => d.id), IDS);
  for (const d of defs()) {
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(SUBTEMAS.includes(d.subtema), d.id);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, d.id);
  }
});

bateria(M, IDS);

test('lei de Ohm: R = U/I, U = R I e I = Q/Δt (com o tempo em minutos convertido)', () => {
  for (const p of itens('circuitos-lei-ohm', 80)) {
    const d = p.dados;
    const v = d.contexto === 'resistencia' ? d.U / d.I : d.contexto === 'tensao' ? d.R * d.ImA / 1000 : d.Q / (d.tmin * 60);
    assert.ok(Math.abs(p.resposta - v) <= (p.tolerancia || 0) + 1e-9, p.contexto + ' ' + p.semente);
    if (d.contexto === 'carga') assert.ok(p.errosTipicos.some((e) => e.codigo === 'tempo_em_minutos'));
    if (d.contexto === 'tensao') assert.ok(p.errosTipicos.some((e) => e.codigo === 'corrente_em_miliamperes'));
  }
});

test('associação: em paralelo R_eq é menor do que a menor; em série as tensões somam U; a corrente total é a soma dos ramos', () => {
  for (const p of itens('circuitos-associacao', 80)) {
    const { rs, U } = p.dados;
    assert.equal(p.esquema.id, 'fqa-circuito');
    assert.deepEqual(p.esquema.opcoes.rs, rs);
    assert.ok(rs.every((R) => Number.isInteger(R) && R >= 1 && R <= 20) && (U === undefined || (U >= 1 && U <= 12)));
    if (p.formato !== 'numerica') continue;
    const soma = rs.reduce((a, R) => a + R, 0);
    const inv = rs.reduce((a, R) => a + 1 / R, 0);
    const tol = p.tolerancia + 1e-9;
    if (p.contexto === 'paralelo-req') {
      assert.ok(p.resposta < Math.min(...rs), String(p.semente));
      assert.ok(Math.abs(p.resposta - 1 / inv) <= tol);
      assert.ok(p.errosTipicos.some((e) => e.codigo === 'somou_resistencias_em_paralelo'));
    }
    if (p.contexto === 'serie-tensao') {
      assert.ok(Math.abs(p.resposta - U * rs[p.dados.k] / soma) <= tol);
      assert.ok(p.resposta < U);
    }
    if (p.contexto === 'paralelo-corrente') assert.ok(Math.abs(p.resposta - rs.reduce((a, R) => a + U / R, 0)) <= tol);
  }
});

test('potência e energia: P = R I², E = P Δt e 1 kWh = 3,6 × 10⁶ J nos dois sentidos', () => {
  for (const p of itens('circuitos-potencia-energia', 80)) {
    const d = p.dados;
    const v = d.contexto === 'potencia' ? d.R * d.I * d.I : d.contexto === 'efeito-joule' ? d.R * d.I * d.I * d.tmin * 60
      : d.contexto === 'energia-kwh' ? (d.P * d.tmin * 60) / 3.6e6 : (d.P / 1000) * (d.tmin / 60) * 3.6e6;
    if (p.formato === 'numerica') {
      const tol = p.tolerancia !== undefined ? p.tolerancia : p.toleranciaRelativa * Math.abs(p.resposta);
      assert.ok(Math.abs(p.resposta - v) <= tol + 1e-9, p.contexto + ' ' + p.semente);
    }
    if (d.contexto === 'energia-kwh') assert.ok(Math.abs((d.P / 1000) * (d.tmin / 60) * 3.6e6 - d.P * d.tmin * 60) < 1e-6);
  }
});
