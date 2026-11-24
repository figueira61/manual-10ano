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
  'transferencias-mecanismo', 'transferencias-equilibrio', 'transferencias-infravermelho', 'transferencias-coletor',
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
  let pista = 0;
  for (const p of itens('transferencias-equilibrio', 300, ['escolha'])) {
    const t = [...p.enunciado.matchAll(/(−?\d+) °C/g)].map((m) => Number(m[1].replace('−', '-')));
    assert.equal(t.length, 2, p.enunciado);
    cenas.add(p.enunciado);
    const certa = p.opcoes[p.correta];
    assert.match(certa, new RegExp('entre ' + String(Math.min(...t)).replace('-', '−') + ' °C e ' + Math.max(...t) + ' °C'));
    // nenhuma opção errada diz que o corpo quente cede energia ao frio até ficarem à mesma temperatura, entre as duas
    const inicioCerto = certa.split(' até ')[0];
    assert.ok(p.errosTipicos.every((e) => !(p.opcoes[e.opcao].startsWith(inicioCerto) && /mesma temperatura, entre/.test(p.opcoes[e.opcao]))));
    if (p.opcoes.filter((o) => /entre/.test(o)).length === 1) pista++;
  }
  // a frase «à mesma temperatura, entre …» não denuncia a resposta (lição da revisão)
  assert.equal(pista, 0, 'a certa é a única com o intervalo em ' + pista + ' itens');
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

// ---------------------------------------------------------------- correções da revisão (fix round 1)
test('nenhum texto de um gerador de FQ-A tem «{,}» fora de $…$ (300 sementes)', () => {
  for (const d of G.todos().filter((x) => x.disciplina === 'fqa')) {
    for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 300; s++) {
      const p = G.gerar(d.id, s, { formato, contexto });
      const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao));
      for (const t of textos) {
        const fora = String(t).replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\$[^$]*\$/g, '');
        assert.ok(!fora.includes('{,}'), d.id + ' ' + s + ': ' + t);
      }
    }
  }
});

test('opções de rendimento plausíveis: no máximo uma acima de 100 % e nenhuma acima de 1000 % (500 sementes)', () => {
  for (const id of ['rendimento-energia', 'rendimento-painel']) for (const p of itens(id, 500, ['escolha'])) {
    if (!/\\%/.test(p.opcoes[0])) continue;
    const v = p.opcoes.map((o) => lerTex(nucleo(o)));
    assert.ok(v.filter((x) => x > 100).length <= 1 && v.every((x) => x <= 1000), id + ' ' + p.contexto + ' ' + p.semente + ': ' + p.opcoes.join(' ; '));
  }
});

test('misturas: com gelo em excesso nenhuma opção passa da massa de gelo; nenhuma temperatura de água fora de 0–100 °C', () => {
  for (const p of itens('balancos-mistura', 500, ['escolha'])) {
    const v = p.opcoes.map((o) => lerTex(nucleo(o)));
    if (p.dados.excesso) assert.ok(v.every((x) => x <= p.dados.m2 * 1000 + 1e-9), p.semente + ': ' + p.opcoes.join(' ; '));
    else assert.ok(v.every((x) => x >= 0 && x <= 100), p.contexto + ' ' + p.semente + ': ' + p.opcoes.join(' ; '));
  }
});

test('energia dissipada: cada aparelho com a sua gama de potências (uma ventoinha não tem 2000 W)', () => {
  const gamas = { 'Um berbequim': [400, 1000], 'Um aspirador': [600, 2000], 'Uma ventoinha': [30, 120], 'Um motor elétrico': [200, 2000] };
  const vistos = new Set();
  for (const p of itens('rendimento-energia', 300)) {
    if (p.contexto !== 'dissipada') continue;
    const ap = Object.keys(gamas).find((k) => p.enunciado.startsWith(k));
    assert.ok(ap, p.enunciado);
    vistos.add(ap);
    assert.ok(p.dados.P >= gamas[ap][0] && p.dados.P <= gamas[ap][1], ap + ' ' + p.dados.P);
  }
  assert.equal(vistos.size, 4);
});

test('equilíbrio: só corpos finitos e fechados (sem rios nem o corpo humano como reservatório)', () => {
  for (const p of itens('transferencias-equilibrio', 300)) assert.ok(!/(^|\s)rio\b|febre|braço/.test(p.enunciado), p.enunciado);
});

test('painel (AL): U e I medidas com três casas decimais, e o ponto de curto-circuito/circuito aberto nomeado pela resistência', () => {
  for (const p of itens('rendimento-painel-maximo', 60)) {
    const U = [...p.enunciado.matchAll(/\$U = ([\d{},]+)\\,\\mathrm\{V\}\$/g)].map((m) => m[1]);
    const I = [...p.enunciado.matchAll(/\$I = ([\d{},]+)\\,\\mathrm\{A\}\$/g)].map((m) => m[1]);
    assert.equal(U.length, 6, p.enunciado);
    assert.equal(I.length, 6, p.enunciado);
    for (const v of U.concat(I)) assert.match(v, /^\d\{,\}\d{3}$/, p.enunciado);
    for (const e of p.errosTipicos) {
      // várias medições podem ter a mesma corrente: o ponto nomeia-se pela resistência, não por «maior corrente»
      assert.ok(!/ponto de maior corrente|ponto de maior \$U\$/.test(e.explicacao), e.explicacao);
      if (/^potencia_maxima_em_(curto_circuito|circuito_aberto)$/.test(e.codigo)) assert.match(e.explicacao, /(menor|maior) resistência de carga/, e.explicacao);
    }
  }
});

test('capacidade térmica mássica (escolha): opções em notação normal, sem o Q m Δθ milhares de vezes maior do que c', () => {
  for (const p of itens('balancos-calor', 200, ['escolha'])) {
    if (p.contexto !== 'capacidade') continue;
    assert.equal(p.dados.sci, false, p.opcoes.join(' ; '));
    for (const o of p.opcoes) assert.ok(!/\\times 10\^/.test(o), o);
    for (const e of p.errosTipicos) assert.ok(Math.abs(e.valor) < 1e4, e.codigo + ' ' + e.valor);
  }
});

// ---------------------------------------------------------------- coletor solar (transferencias-coletor)
// Critérios de cada peça (o mecanismo certo), lidos no texto da função: vidro → luz visível, convecção e infravermelho
// (efeito de estufa); placa escura → absorve radiação; tubos → condução para o fluido, que a transporta; isolamento → condução.
const CRIT_COLETOR = {
  vidro: (t) => /luz visível/i.test(t) && /convecção/.test(t) && /radiação infravermelha/.test(t) && /estufa/.test(t),
  placa: (t) => /absorver a radiação solar/i.test(t),
  tubos: (t) => /condução/.test(t) && /fluido/.test(t) && /transport/.test(t),
  isolamento: (t) => /reduzir as perdas de energia por condução/i.test(t),
};
const NOME_COLETOR = { vidro: /vidro/, placa: /placa/, tubos: /tubos/, isolamento: /isolamento/ };

test('coletor: gerador transferencias-coletor com os formatos escolha e numérica, e a figura fig-coletor', () => {
  const d = G.obter('transferencias-coletor');
  assert.ok(d);
  assert.deepEqual(d.formatos, ['escolha', 'numerica']);
  for (const p of itens('transferencias-coletor', 10)) assert.deepEqual(p.esquema, { id: 'fig-coletor' });
});

test('coletor (escolha): cada peça com o mecanismo certo, nas duas direções (função da peça, peça da função)', () => {
  const vistas = { funcao: {}, peca: {} };
  for (const p of itens('transferencias-coletor', 400, ['escolha'])) {
    const d = p.dados;
    assert.equal(p.opcoes.length, 4);
    vistas[d.direcao][d.peca] = (vistas[d.direcao][d.peca] || 0) + 1;
    const certa = p.opcoes[p.correta];
    if (d.direcao === 'funcao') {
      assert.match(p.enunciado, NOME_COLETOR[d.peca]);
      assert.ok(CRIT_COLETOR[d.peca](certa), d.peca + ': ' + certa);
      // cada opção é a função de exatamente uma peça, e as erradas não servem para a peça pedida
      for (const o of p.opcoes) assert.equal(Object.keys(CRIT_COLETOR).filter((k) => CRIT_COLETOR[k](o)).length, 1, o);
      p.opcoes.filter((o) => o !== certa).forEach((o) => assert.ok(!CRIT_COLETOR[d.peca](o), o));
    } else {
      assert.ok(CRIT_COLETOR[d.peca](p.enunciado), p.enunciado);
      assert.equal(Object.keys(CRIT_COLETOR).filter((k) => CRIT_COLETOR[k](p.enunciado)).length, 1, p.enunciado);
      assert.match(certa, NOME_COLETOR[d.peca]);
      for (const o of p.opcoes) assert.equal(Object.keys(NOME_COLETOR).filter((k) => NOME_COLETOR[k].test(o)).length, 1, o);
    }
    for (const e of p.errosTipicos) assert.match(e.codigo, /^coletor_trocou_com_(o_vidro|a_placa|os_tubos|o_isolamento)$/);
  }
  for (const dir of ['funcao', 'peca']) for (const k of Object.keys(CRIT_COLETOR)) assert.ok(vistas[dir][k] >= 30, dir + ' ' + k + ': ' + vistas[dir][k]);
});

test('coletor (escolha): sem pistas na estrutura, quem adivinha pela forma das opções acerta ≈ 25 % (2000 sementes)', () => {
  const ps = [...itens('transferencias-coletor', 2000, ['escolha'])];
  const palavras = (t) => new Set((t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]{4,}/g) || []));
  const argmax = (xs) => xs.indexOf(Math.max(...xs));
  const argmin = (xs) => xs.indexOf(Math.min(...xs));
  const comuns = (p) => { const e = palavras(p.enunciado); return p.opcoes.map((o) => [...palavras(o)].filter((w) => e.has(w)).length); };
  const adivinhos = {
    'mais longa': (p) => argmax(p.opcoes.map((o) => o.length)),
    'mais curta': (p) => argmin(p.opcoes.map((o) => o.length)),
    primeira: () => 0,
    'última': (p) => p.opcoes.length - 1,
    'mais palavras do enunciado': (p) => argmax(comuns(p)),
    'menos palavras do enunciado': (p) => argmin(comuns(p)),
  };
  for (const [nome, f] of Object.entries(adivinhos)) {
    const taxa = ps.filter((p) => f(p) === p.correta).length / ps.length;
    assert.ok(taxa > 0.2 && taxa < 0.3, nome + ': ' + taxa);
  }
  // nenhuma opção é certa (ou errada) só por ser quem é: cada texto é certo em ≈ 1/4 das vezes em que aparece
  const conta = new Map();
  for (const p of ps) p.opcoes.forEach((o, i) => { const c = conta.get(o) || [0, 0]; c[0]++; if (i === p.correta) c[1]++; conta.set(o, c); });
  for (const [o, [n, certas]] of conta) assert.ok(certas / n > 0.18 && certas / n < 0.32, o + ': ' + certas + '/' + n);
});

test('coletor (numérica): η = E_útil/E_incidente, com E_incidente = G A Δt, nunca acima de 100 % e com os dados do enunciado', () => {
  const N = G.fisicaNumeros.criar();
  const cA = M.dadosFisica.capacidadeTermicaMassica.agua;
  const S = M.dadosFisica.solar;
  const casos = new Set();
  const temp = (t) => '$' + N.dado(t) + '\\,{}^{\\circ}\\mathrm{C}$';
  for (const p of itens('transferencias-coletor', 400, ['numerica'])) {
    const d = p.dados;
    casos.add(d.caso);
    const Einc = d.G * d.A * d.tmin * 60;
    assert.ok(d.G >= S.irradiancia[0] && d.G <= S.irradiancia[1], 'G = ' + d.G);
    assert.ok(d.A >= 1 && d.A <= 3, 'A = ' + d.A);
    for (const t of [N.q(d.G, '\\mathrm{W\\,m^{-2}}'), N.q(d.A, '\\mathrm{m^2}'), N.q(d.tmin, '\\mathrm{min}')]) assert.ok(p.enunciado.includes(t), t + ' :: ' + p.enunciado);
    const cod = (c) => p.errosTipicos.find((e) => e.codigo === c);
    const perto = (a, b) => Math.abs(a - b) <= 0.006 * Math.abs(b);
    if (d.caso === 'rendimento') {
      const Eu = d.m * cA * (d.tf - d.ti);
      const eta = Eu / Einc;
      assert.ok(eta >= S.rendimentoColetor[0] - 1e-9 && eta <= S.rendimentoColetor[1] + 1e-9, 'η = ' + eta);
      assert.ok(d.tf > d.ti && d.tf <= 70, d.ti + ' → ' + d.tf);
      assert.ok(p.resposta > 0 && p.resposta <= 100);
      assert.ok(Math.abs(p.resposta - eta * 100) <= tolDe(p), p.semente + ': ' + p.resposta + ' vs ' + eta * 100);
      for (const t of [N.q(d.m, '\\mathrm{kg}'), temp(d.ti), temp(d.tf)]) assert.ok(p.enunciado.includes(t), t);
      assert.ok(perto(cod('rendimento_maior_do_que_1').valor, (Einc / Eu) * 100));
      assert.ok(perto(cod('esqueceu_a_area_do_coletor').valor, (Eu / (d.G * d.tmin * 60)) * 100));
      assert.ok(perto(cod('esqueceu_o_tempo_na_energia_incidente').valor, (Eu / (d.G * d.A)) * 100));
      for (const e of p.errosTipicos) if (e.valor > 100) assert.match(e.explicacao, /100 %/, e.codigo);
    } else {
      assert.equal(d.caso, 'energia');
      assert.ok(d.etaP >= S.rendimentoColetor[0] * 100 && d.etaP <= S.rendimentoColetor[1] * 100);
      assert.ok(p.enunciado.includes(N.percentagem(d.etaP)));
      assert.ok(Math.abs(p.resposta - (d.etaP / 100) * Einc) <= tolDe(p));
      assert.ok(p.resposta < Einc);
      assert.ok(perto(cod('deu_a_energia_incidente_em_vez_da_util').valor, Einc));
      // (a potência útil, em W, fica a menos de 10 tolerâncias de 0 numa resposta em J e é descartada, regra 7)
      assert.ok(perto(cod('esqueceu_a_area_do_coletor').valor, (d.etaP / 100) * d.G * d.tmin * 60));
      if (cod('confundiu_potencia_com_energia')) assert.ok(perto(cod('confundiu_potencia_com_energia').valor, (d.etaP / 100) * d.G * d.A));
    }
  }
  assert.deepEqual([...casos].sort(), ['energia', 'rendimento']);
});
