// Geradores de Física — Energia, fenómenos térmicos e radiação (js/geradores/fqa/fisica-termica.js).
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
  'transferencias-mecanismo', 'transferencias-equilibrio', 'transferencias-infravermelho',
  'balancos-calor', 'balancos-fase', 'balancos-mistura', 'balancos-primeira-lei',
  'rendimento-energia', 'rendimento-painel-maximo', 'rendimento-painel',
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

const tolDe = (p) => (p.tolerancia !== undefined ? p.tolerancia : p.toleranciaRelativa * Math.abs(p.resposta)) + 1e-9;

test('Q = m c Δθ: energia, capacidade térmica mássica (dá o valor tabelado) e temperatura final', () => {
  const C = M.dadosFisica.capacidadeTermicaMassica;
  for (const p of itens('balancos-calor', 80, ['numerica'])) {
    const d = p.dados;
    if (d.contexto === 'energia') assert.ok(Math.abs(p.resposta - d.m * C[d.mat] * (d.tf - d.ti)) <= tolDe(p));
    if (d.contexto === 'capacidade') assert.ok(Object.values(C).includes(p.resposta), String(p.resposta));
    if (d.contexto === 'temperatura') assert.ok(p.resposta > d.ti && Math.abs(p.resposta - (d.ti + d.Q / (d.m * C[d.mat]))) <= tolDe(p));
  }
});

test('mudanças de estado: Q = m Δh e o gelo até água líquida soma os troços; nenhum troço esquecido é a resposta', () => {
  const H = M.dadosFisica.entalpiaMassica;
  for (const p of itens('balancos-fase', 80, ['numerica'])) {
    const d = p.dados;
    if (d.contexto === 'fusao') assert.ok(Math.abs(p.resposta - d.m * H.fusaoGelo / 1000) <= tolDe(p));
    if (d.contexto === 'vaporizacao') assert.ok(Math.abs(p.resposta - d.m * H.vaporizacaoAgua / 1000) <= tolDe(p));
    if (d.contexto === 'gelo-agua') {
      const total = M.fisica.aquecimentoGelo({ m: d.m, theta0: d.t0, thetaF: d.tF, P: 500, fundir: d.tF === 0 }).reduce((a, t) => a + t.Q, 0);
      assert.ok(Math.abs(p.resposta - total) <= tolDe(p));
      assert.ok(p.errosTipicos.some((e) => e.codigo === 'esqueceu_a_fusao_no_balanco'));
      assert.deepEqual(p.esquema, { id: 'fqa-aquecimento', opcoes: { m: d.m, theta0: d.t0, P: 500 } });
    }
  }
});

test('misturas: θeq entre as temperaturas iniciais; com gelo em excesso θeq = 0 °C e pede-se a massa que funde (< massa de gelo)', () => {
  let excesso = 0, funde = 0;
  for (const p of itens('balancos-mistura', 150)) {
    const d = p.dados;
    assert.equal(p.esquema.id, 'fqa-mistura');
    assert.equal(p.esquema.opcoes.tipo, d.tipo);
    const r = M.fisica.mistura([{ m: d.m1, theta: d.theta1, fase: 'agua' }, d.tipo === 'agua-gelo' ? { m: d.m2, theta: 0, fase: 'gelo' } : d.metal ? { m: d.m2, c: M.dadosFisica.capacidadeTermicaMassica[d.metal], theta: d.theta2 } : { m: d.m2, theta: d.theta2, fase: 'agua' }]);
    if (d.tipo === 'agua-gelo' && d.excesso) {
      excesso++;
      assert.equal(r.thetaEq, 0);
      assert.equal(d.thetaEq, 0);
      assert.ok(r.geloRestante > 0);
      assert.ok(p.resolucaoDetalhada.some((x) => (x.calculo || '').includes('\\theta_{eq} = 0\\,{}^{\\circ}\\mathrm{C}')));
      if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - r.geloDerretido * 1000) <= tolDe(p) && p.resposta < d.m2 * 1000);
    } else {
      if (d.tipo === 'agua-gelo') { funde++; assert.ok(r.geloRestante < 1e-12); }
      assert.ok(r.thetaEq > Math.min(d.theta1, d.theta2) && r.thetaEq < Math.max(d.theta1, d.theta2));
      if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - r.thetaEq) <= tolDe(p));
    }
  }
  assert.ok(excesso >= 20 && funde >= 20, excesso + ' / ' + funde);
});

test('Primeira Lei: ΔU = W + Q + R, com o trabalho realizado e o calor cedido negativos', () => {
  for (const p of itens('balancos-primeira-lei', 80, ['numerica'])) {
    const { a, b } = p.dados;
    assert.equal(p.resposta, a - b);
    assert.ok(p.errosTipicos.some((e) => e.codigo === 'sinais_da_primeira_lei_trocados' && e.valor === b - a));
  }
});

test('nenhum rendimento passa de 100 %: as respostas em % de rendimento ficam em ]0, 100] e cada opção acima de 100 % é um erro que o diz', () => {
  for (const id of ['rendimento-energia', 'rendimento-painel']) for (const p of itens(id, 150)) {
    if (p.contexto === 'dissipada' || p.contexto === 'potencia') continue;
    if (p.formato === 'numerica') assert.ok(p.resposta > 0 && p.resposta <= 100, id + ' ' + p.semente + ': ' + p.resposta);
    else {
      const v = lerTex(nucleo(p.opcoes[p.correta]));
      assert.ok(v > 0 && v <= 100, id + ' ' + p.opcoes[p.correta]);
    }
    for (const e of p.errosTipicos) if (e.valor > 100) assert.match(e.explicacao, /100 %/, id + ' ' + e.codigo);
  }
});

test('rendimento: η = útil/fornecida; energia dissipada = (1 − η) P Δt; chaleira com Δt em segundos', () => {
  const cA = M.dadosFisica.capacidadeTermicaMassica.agua;
  for (const p of itens('rendimento-energia', 80, ['numerica'])) {
    const d = p.dados;
    const v = d.contexto === 'rendimento' ? (d.Eu / d.Ef) * 100 : d.contexto === 'dissipada' ? d.P * d.tmin * 60 * (1 - d.etaP / 100) : (d.m * cA * (d.tf - d.ti)) / (d.P * d.tmin * 60) * 100;
    assert.ok(Math.abs(p.resposta - v) <= tolDe(p), p.contexto + ' ' + p.semente);
  }
});

test('painel: o máximo está num ponto intermédio da tabela; P = U I de cada ponto e η = P/(G A)', () => {
  for (const p of itens('rendimento-painel-maximo', 80)) {
    const pts = p.dados.pontos;
    const P = pts.map(([, U, I]) => U * I);
    const k = P.indexOf(Math.max(...P));
    assert.ok(k > 0 && k < pts.length - 1);
    assert.deepEqual(p.esquema, { id: 'fqa-painel', opcoes: { G: p.dados.G, Rcarga: pts[k][0] } });
    if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - (p.contexto === 'resistencia' ? pts[k][0] : P[k])) <= tolDe(p));
  }
  for (const p of itens('rendimento-painel', 80, ['numerica'])) {
    const d = p.dados;
    const v = d.contexto === 'rendimento' ? (d.P / (d.G * d.A)) * 100 : (d.etaP / 100) * d.G * d.A;
    assert.ok(Math.abs(p.resposta - v) <= tolDe(p));
  }
});
