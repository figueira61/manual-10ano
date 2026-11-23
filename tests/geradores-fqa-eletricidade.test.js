// Geradores de Física — Energia e fenómenos elétricos (js/geradores/fqa/fisica-eletricidade.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregarTudo } = require('../tools/verificar-geradores.js');
const { bateria, itensDe, nucleo, lerTex } = require('./geradores-fisica-comum.js');

const M = carregarTudo();
require('../js/quiz.js');
require('../js/aprendizagem.js');
require('../js/painel.js');
const G = M.geradores;

const IDS = [
  'circuitos-lei-ohm', 'circuitos-associacao', 'circuitos-potencia-energia',
  'gerador-caracteristica', 'gerador-dois-pontos', 'gerador-balanco',
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

test('característica: U = ε − rI (U < ε); curto-circuito (Rext = 0) dá I = ε/r sem divisão por zero', () => {
  let curtos = 0;
  for (const p of itens('gerador-caracteristica', 120)) {
    const d = p.dados;
    if (p.formato !== 'numerica') continue;
    const tol = p.tolerancia + 1e-9;
    if (d.contexto === 'tensao') assert.ok(Math.abs(p.resposta - (d.eps - d.r * d.I)) <= tol && p.resposta < d.eps);
    if (d.contexto === 'corrente') {
      assert.ok(Math.abs(p.resposta - d.eps / (d.r + d.Rext)) <= tol);
      if (d.Rext === 0) {
        curtos++;
        assert.ok(Math.abs(p.resposta - d.eps / d.r) <= tol);
        assert.ok(p.errosTipicos.every((e) => Number.isFinite(e.valor)));
        assert.ok(!p.errosTipicos.some((e) => e.codigo === 'esqueceu_resistencia_interna'));
        assert.ok(/curto-circuito/.test(p.enunciado));
      }
    }
  }
  assert.ok(curtos >= 5, 'poucos curto-circuitos: ' + curtos);
  for (let s = 1; s <= 200; s++) assert.notEqual(G.gerar('gerador-caracteristica', s, { formato: 'escolha', contexto: 'corrente' }).dados.Rext, 0);
});

test('dois pontos: r é o simétrico do declive, ε a ordenada na origem e I_cc = ε/r', () => {
  for (const p of itens('gerador-dois-pontos', 80)) {
    if (p.formato !== 'numerica') continue;
    const { I1, U1, I2, U2 } = p.dados;
    const r = (U1 - U2) / (I2 - I1), eps = U1 + r * I1;
    const v = p.contexto === 'resistencia-interna' ? r : p.contexto === 'fem' ? eps : eps / r;
    assert.ok(Math.abs(p.resposta - v) <= p.tolerancia + 1e-9, p.contexto + ' ' + p.semente);
    if (p.contexto === 'resistencia-interna') assert.ok(p.resposta > 0);
  }
});

test('balanço do gerador: ε I = U I + r I² e nenhum rendimento passa de 100 %', () => {
  for (const p of itens('gerador-balanco', 120)) {
    const { eps, r, I } = p.dados;
    const U = eps - r * I;
    assert.ok(Math.abs(eps * I - (U * I + r * I * I)) < 1e-9);
    if (p.formato !== 'numerica') continue;
    if (p.contexto === 'rendimento') {
      assert.ok(p.resposta > 0 && p.resposta <= 100, String(p.resposta));
      for (const e of p.errosTipicos) if (e.valor > 100) assert.match(e.explicacao, /100 %/);
    }
  }
  // no máximo uma opção impossível (> 100 %) por item de escolha
  for (const p of itens('gerador-balanco', 300, ['escolha'])) {
    if (p.contexto !== 'rendimento') continue;
    assert.ok(p.opcoes.map((o) => lerTex(nucleo(o))).filter((v) => v > 100).length <= 1, p.opcoes.join(' ; '));
  }
});

test('kWh: o tempo em minutos em vez de horas tem código próprio (tempo_em_minutos é só minutos em vez de segundos)', () => {
  const codigos = new Set();
  for (const p of itens('circuitos-potencia-energia', 80)) {
    for (const e of p.errosTipicos) codigos.add(p.contexto + ':' + e.codigo);
  }
  assert.ok(codigos.has('energia-kwh:tempo_em_minutos_em_vez_de_horas'));
  assert.ok(![...codigos].includes('energia-kwh:tempo_em_minutos'));
});

test('lei de Ohm (tensão): nenhum erro típico passa de 10³ vezes a resposta', () => {
  for (const p of itens('circuitos-lei-ohm', 200)) if (p.contexto === 'tensao') for (const e of p.errosTipicos) assert.ok(Math.abs(e.valor) <= 1000 * p.resposta + 1e-9, e.codigo + ' ' + e.valor);
});
