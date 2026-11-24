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
  'circuitos-lei-ohm', 'circuitos-associacao', 'circuitos-potencia-energia', 'circuitos-cc-ca',
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

// ---------------------------------------------------------------- circuitos-cc-ca
// Classificação de cada fonte (tabela própria do teste, a da brief): CC = contínua, CA = alternada.
const TIPO_FONTE = { pilha: 'cc', bateria: 'cc', painel: 'cc', tomada: 'ca', alternador: 'ca' };
// Verdade de uma afirmação sobre as fontes, lida no próprio texto (outro caminho que não o do gerador).
function verdadeCorrente(texto, tipos) {
  const diz = (t) => {
    if (/contínua|sempre o mesmo/.test(t) && !/alternada|muda/.test(t)) return 'cc';
    if (/alternada|muda/.test(t) && !/contínua|sempre o mesmo/.test(t)) return 'ca';
    throw new Error('sem leitura: ' + t);
  };
  if (tipos.length === 1) return diz(texto) === tipos[0];
  if (/^(As duas|Nas duas)/.test(texto)) return tipos.every((t) => t === diz(texto));
  const [a, b] = texto.split(/ e a segunda|; na segunda/);
  assert.ok(a && b, 'afirmação com duas partes: ' + texto);
  return diz(a) === tipos[0] && diz(b) === tipos[1];
}
// Tapa as fontes (os dados do item), com a preposição e o artigo («pela bateria…» e «por uma pilha…» dão o mesmo X):
// o que sobra é a estrutura.
const tapaFontes = (t) => {
  let r = t;
  for (const f of G.obter('circuitos-cc-ca').fontes) for (const n of [f.por, f.nome[0].toUpperCase() + f.nome.slice(1), f.nome]) r = r.split(n).join('X');
  return r;
};

test('circuitos-cc-ca: formatos escolha e vf, subtema circuitos, tipo cc-ca', () => {
  const d = G.obter('circuitos-cc-ca');
  assert.ok(d, 'gerador circuitos-cc-ca existe');
  assert.deepEqual(d.formatos, ['escolha', 'vf']);
  assert.equal(d.subtema, 'circuitos');
  assert.equal(d.tipo, 'cc-ca');
});

test('circuitos-cc-ca: cada fonte sorteada é classificada certo (pilha, bateria, painel: CC; tomada, alternador: CA)', () => {
  const vistas = new Set();
  for (const p of itens('circuitos-cc-ca', 400)) {
    const tipos = p.dados.fontes.map((f) => TIPO_FONTE[f]);
    p.dados.fontes.forEach((f) => { assert.ok(f in TIPO_FONTE, f); vistas.add(f); });
    if (p.formato === 'escolha') {
      assert.equal(p.dados.fontes.length, 2);
      assert.notEqual(p.dados.fontes[0], p.dados.fontes[1]);
      p.opcoes.forEach((o, i) => assert.equal(verdadeCorrente(o, tipos), i === p.correta, p.dados.fontes + ': ' + o));
    } else {
      assert.equal(p.dados.fontes.length, 1);
      const frase = p.enunciado.split(/(?<=\.) /).pop();
      assert.equal(verdadeCorrente(frase, tipos), p.correta, p.enunciado);
    }
  }
  assert.deepEqual([...vistas].sort(), Object.keys(TIPO_FONTE).sort());
});

test('circuitos-cc-ca: a tomada (e o alternador) dão 230 V a 50 Hz e mudam de sentido 100 vezes por segundo, sem valor eficaz nem amplitude', () => {
  let comRede = 0;
  for (const p of itens('circuitos-cc-ca', 200)) {
    const txt = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque + ' ' + (r.calculo || '')), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.passo, p.verificacao.calculo]).join(' ');
    assert.ok(!/eficaz|amplitude|máxim/i.test(txt), txt);
    if (p.dados.fontes.includes('tomada')) {
      comRede++;
      assert.match(txt, /230\s*V/);
      assert.match(txt, /50\s*Hz/);
      assert.match(txt, /100 vezes por segundo/);
    }
  }
  assert.ok(comRede > 50, String(comRede));
});

test('circuitos-cc-ca: códigos de erro (cada fonte tomada pelo outro tipo, as duas erradas, as duas trocadas)', () => {
  const codigos = new Set();
  for (const p of itens('circuitos-cc-ca', 300)) p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  assert.deepEqual([...codigos].sort(), ['alternador_como_continua', 'as_duas_alternadas_como_continuas', 'as_duas_continuas_como_alternadas',
    'bateria_como_alternada', 'painel_como_alternada', 'pilha_como_alternada', 'tomada_como_continua', 'trocou_continua_com_alternada']);
  // o código diz a fonte que se errou (lida na explicação)
  for (const p of itens('circuitos-cc-ca', 100)) for (const e of p.errosTipicos) {
    const m = e.codigo.match(/^(pilha|bateria|painel|tomada|alternador)_como_(continua|alternada)$/);
    if (!m) continue;
    assert.equal(TIPO_FONTE[m[1]], m[2] === 'alternada' ? 'cc' : 'ca', e.codigo);
    assert.ok(p.dados.fontes.includes(m[1]), e.codigo + ' em ' + p.dados.fontes);
  }
});

// Quem responde só pela estrutura das opções (com as fontes tapadas): aprende em 2000 sementes, por contexto, que
// opção costuma estar certa em cada conjunto de opções (ou que valor tem cada afirmação), e aplica isso noutras 2000.
test('circuitos-cc-ca: responder só pela estrutura não ajuda (escolha ≈ 0,25; vf ≈ 0,5)', () => {
  const d = G.obter('circuitos-cc-ca');
  for (const formato of d.formatos) {
    const lista = (a, b) => {
      const l = [];
      for (const contexto of G.contextosDe(d)) for (let s = a; s <= b; s++) l.push(G.gerar('circuitos-cc-ca', s, { formato, contexto }));
      return l;
    };
    const chaveDe = (p) => (formato === 'escolha' ? tapaFontes(p.enunciado) + ' || ' + p.opcoes.map(tapaFontes).sort().join(' | ') : tapaFontes(p.enunciado));
    const certoDe = (p) => (formato === 'escolha' ? tapaFontes(p.opcoes[p.correta]) : String(p.correta));
    const treino = {};
    for (const p of lista(1, 2000)) {
      assert.ok(!/pilha|bateria|painel|tomada|alternador/.test(chaveDe(p)), 'fonte por tapar: ' + chaveDe(p));
      const t = (treino[chaveDe(p)] = treino[chaveDe(p)] || {});
      t[certoDe(p)] = (t[certoDe(p)] || 0) + 1;
    }
    const teste = lista(2001, 4000);
    let certos = 0;
    for (const p of teste) {
      const t = treino[chaveDe(p)] || {};
      const palpite = Object.keys(t).sort((x, y) => t[y] - t[x])[0];
      if (palpite === certoDe(p)) certos++;
    }
    const taxa = certos / teste.length;
    console.log('adivinho por estrutura, circuitos-cc-ca ' + formato + ': ' + taxa.toFixed(3));
    if (formato === 'escolha') assert.ok(taxa >= 0.2 && taxa <= 0.3, formato + ': ' + taxa.toFixed(3));
    else assert.ok(taxa <= 0.56, formato + ': ' + taxa.toFixed(3));
  }
});

test('circuitos-cc-ca: nenhuma opção ou afirmação é sempre verdadeira ou sempre falsa', () => {
  const visto = {};
  for (const p of itens('circuitos-cc-ca', 1000)) {
    const marca = (texto, v) => { const k = p.formato + ': ' + tapaFontes(texto); (visto[k] = visto[k] || new Set()).add(v); };
    if (p.formato === 'escolha') p.opcoes.forEach((o, i) => marca(o, i === p.correta));
    else marca(p.enunciado, p.correta);
  }
  for (const [k, v] of Object.entries(visto)) assert.equal(v.size, 2, k);
});

test('circuitos-cc-ca: o esquema da resposta é fqa-corrente e não há figura no enunciado', () => {
  for (const p of itens('circuitos-cc-ca', 50)) {
    assert.equal(p.esquema.id, 'fqa-corrente');
    assert.ok(['cc', 'ca'].includes(p.esquema.opcoes.modo));
    assert.equal(p.figuraEnunciado, undefined);
  }
});

test('circuitos-cc-ca: o alternador produz corrente a 50 Hz (não «roda a 50 Hz»); o enunciado diz «a primeira / a segunda» como as opções', () => {
  for (const p of itens('circuitos-cc-ca', 200)) {
    const txt = [p.enunciado].concat(p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao)).join(' ');
    assert.ok(!/roda/.test(txt), txt);
    if (p.dados.fontes.includes('alternador')) assert.match(txt, /produz corrente a 50 Hz/);
    if (p.formato === 'escolha') assert.match(p.enunciado, /a primeira é .*; a segunda é /);
  }
});

test('circuitos-cc-ca: no escolha, a nota do esquema diz qual das fontes o gráfico mostra', () => {
  for (const p of itens('circuitos-cc-ca', 100, ['escolha'])) {
    const [a1, a2] = p.dados.fontes.map((f) => TIPO_FONTE[f]);
    const nota = p.esquema.opcoes.nota;
    assert.equal(p.esquema.opcoes.modo, a1);
    if (a1 === a2) assert.match(nota, /^As duas fontes/);
    else assert.match(nota, /primeira fonte .*«Corrente (contínua|alternada)» para ver a da segunda/);
  }
});

test('circuitos-cc-ca: verificarIndependente recusa um item adulterado (resposta, afirmação ou contagem trocadas)', () => {
  const d = G.obter('circuitos-cc-ca');
  for (const p of itens('circuitos-cc-ca', 40)) {
    assert.equal(d.verificarIndependente(p), true);
    const q = JSON.parse(JSON.stringify(p));
    if (q.formato === 'vf') q.correta = !q.correta; else q.correta = (q.correta + 1) % 4;
    assert.equal(d.verificarIndependente(q), false, 'resposta trocada');
    const r = JSON.parse(JSON.stringify(p));
    r.verificacao.calculo = r.verificacao.calculo.replace(/= 0(?=;|$)/, '= 9').replace(/= 100/, '= 0');
    assert.equal(d.verificarIndependente(r), false, 'contagem trocada: ' + r.verificacao.calculo);
  }
});
