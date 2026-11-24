// Geradores de Química — Elementos químicos e sua organização (js/geradores/fqa/elementos.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { verificar, carregarTudo } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
require('../js/quiz.js');
require('../js/aprendizagem.js');
const G = M.geradores;
const D = M.dadosQuimicos;

const IDS = [
  'atomo-particulas', 'atomo-isotopos', 'atomo-escala', 'atomo-figura',
  'mole-massa-atomica', 'mole-quantidade', 'mole-atomos', 'mole-algarismos-incerteza',
  'espectros-energia-foton', 'espectros-zona', 'espectros-bohr', 'espectros-transicao-h', 'espectros-classificar-transicao',
  'configuracao-escrever', 'configuracao-contar', 'configuracao-identificar',
  'tabela-periodica-posicao', 'tabela-periodica-comparar', 'tabela-periodica-iao', 'tabela-periodica-picnometro',
];
const SUBTEMAS = ['atomo', 'mole', 'espectros', 'configuracao', 'tabela-periodica'];
const defs = () => G.todos().filter((d) => d.disciplina === 'fqa' && d.tema === 'elementos');
// Todas as combinações formato × contexto de um gerador, para as sementes dadas.
function* itens(id, sementes) {
  const d = G.obter(id);
  for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= sementes; s++) {
    yield G.gerar(id, s, { formato, contexto });
  }
}

test('regista os 20 geradores de elementos, ≥ 3 por subtema, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  assert.deepEqual(defs().map((d) => d.id), IDS);
  for (const sub of SUBTEMAS) assert.ok(G.doSubtema('fqa', sub).length >= 3, sub);
  for (const d of defs()) {
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(SUBTEMAS.includes(d.subtema), d.id);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, d.id);
  }
});

for (const id of IDS) {
  test('gerador ' + id + ' passa a verificação (200 sementes)', () => {
    assert.deepEqual(verificar(G.obter(id), { sementes: 200 }), []);
  });
}

// Snapshots da semente 1 (primeiro formato e primeiro contexto), conferidos à mão.
test('snapshots da semente 1', () => {
  const g = (id) => G.gerar(id, 1);
  const certa = (p) => p.opcoes[p.correta];
  let p = g('atomo-particulas');
  assert.match(p.enunciado, /\{\}\^\{20\}_\{10\}\\mathrm\{Ne\}/);
  assert.equal(p.resposta, 10); // N = A − Z = 20 − 10
  p = g('atomo-isotopos');
  assert.match(p.enunciado, /\{\}\^\{14\}_\{7\}\\mathrm\{N\}/);
  assert.equal(certa(p), '${}^{15}_{7}\\mathrm{N}$'); // mesmo Z, outro A
  p = g('atomo-escala');
  assert.equal(p.resposta, 0.1); // S: 100 pm = 0,1 nm
  p = g('atomo-figura');
  assert.deepEqual(p.figuraEnunciado, { id: 'fig-atomo', opcoes: { modo: 'exercicio', destacar: 'neutrao' } });
  assert.equal(certa(p), 'Neutrão'); // parte 4 da figura
  p = g('mole-massa-atomica');
  assert.equal(p.resposta, 14.01); // (14,0031 × 99,636 + 15,0001 × 0,364)/100 = 14,0067
  p = g('mole-quantidade');
  assert.match(p.enunciado, /5\{,\}74\\,\\mathrm\{g\}\$ de propano/);
  assert.equal(p.resposta, 0.13); // 5,74 / 44,11 = 0,13013 → 0,130 mol
  assert.equal(p.algarismos, 3);
  p = g('mole-atomos');
  assert.equal(p.resposta, 2.07e24); // 0,574 × 6,02 × 10²³ × 6 (H no etanol)
  p = g('mole-algarismos-incerteza');
  assert.match(p.enunciado, /0\{,\}0220/);
  assert.equal(certa(p), '3');
  p = g('espectros-energia-foton');
  assert.equal(p.resposta, 3.11e-19); // 6,63 × 10⁻³⁴ × 3,00 × 10⁸ / 6,4 × 10⁻⁷ = 3,108 × 10⁻¹⁹ J
  p = g('espectros-zona');
  assert.equal(certa(p), 'Infravermelho'); // 2 × 10⁻⁶ m
  p = g('espectros-transicao-h');
  assert.equal(p.resposta, 2.04e-18); // 2,18 × 10⁻¹⁸ × (1 − 1/16)
  p = g('espectros-classificar-transicao');
  assert.equal(certa(p), 'De emissão, da série de Balmer, no visível.'); // n = 3 → n = 2
  p = g('configuracao-escrever');
  assert.equal(certa(p), '$[\\mathrm{Ne}]\\,\\mathrm{3s}^{2}\\,\\mathrm{3p}^{3}$'); // P
  p = g('configuracao-contar');
  assert.equal(p.resposta, 3); // P: 3p³ com 3 desemparelhados
  p = g('configuracao-identificar');
  assert.match(p.enunciado, /\\mathrm\{3s\}\^\{3\}/);
  assert.equal(certa(p), 'É impossível: um subnível tem mais eletrões do que o máximo permitido.');
  p = g('tabela-periodica-posicao');
  assert.equal(certa(p), 'Período 3, grupo 15'); // Z = 15
  p = g('tabela-periodica-comparar');
  assert.match(certa(p), /^A energia de ionização do enxofre é maior/); // Na e S, período 3
  p = g('tabela-periodica-iao');
  assert.equal(certa(p), '$\\mathrm{Mg^{2+}}$');
  p = g('tabela-periodica-picnometro');
  const { m0, mA, m1, m2 } = p.dados;
  assert.equal(p.resposta, Number(((m1 - m0) / (mA + (m1 - m0) - m2)).toPrecision(3)));
  assert.equal(p.resposta, 11.4);
});

test('Ti²⁺ = [Ar] 3d²: é sempre a resposta certa e [Ar] 4s² é sempre um erro (tirou_3d_antes_de_4s)', () => {
  const certa = '$[\\mathrm{Ar}]\\,\\mathrm{3d}^{2}$';
  const errada = '$[\\mathrm{Ar}]\\,\\mathrm{4s}^{2}$';
  let vistos = 0;
  for (const formato of ['escolha', 'vf']) {
    for (let s = 1; s <= 2000; s++) {
      const p = G.gerar('configuracao-escrever', s, { formato, contexto: 'iao' });
      if (!(p.dados.simbolo === 'Ti' && p.dados.carga === 2)) continue;
      vistos++;
      if (formato === 'escolha') {
        assert.equal(p.opcoes[p.correta], certa, 'semente ' + s);
        const i = p.opcoes.indexOf(errada);
        if (i >= 0) assert.equal(p.errosTipicos.find((e) => e.opcao === i).codigo, 'tirou_3d_antes_de_4s');
      } else if (p.enunciado.includes(errada)) {
        assert.equal(p.correta, false, 'semente ' + s);
        assert.equal(p.errosTipicos[0].codigo, 'tirou_3d_antes_de_4s');
      } else if (p.enunciado.includes(certa)) {
        assert.equal(p.correta, true, 'semente ' + s);
      }
      assert.ok(!(p.formato === 'vf' && p.correta === true && !p.enunciado.includes(certa)), 'semente ' + s);
    }
  }
  assert.ok(vistos >= 100, 'Ti²⁺ apareceu ' + vistos + ' vezes');
});

test('resposta em notação científica corrige com toleranciaRelativa (e deteta o erro típico)', () => {
  const Q = M.quiz;
  const p = G.gerar('espectros-energia-foton', 1, { formato: 'numerica', contexto: 'E-de-lambda' });
  assert.equal(p.tolerancia, undefined);
  assert.ok(p.toleranciaRelativa > 0 && p.toleranciaRelativa < 0.01);
  assert.equal(p.resposta, 3.11e-19);
  assert.equal(Q.textoNumero(p), '3,11×10⁻¹⁹');
  for (const certo of ['3,11e-19', '3,11×10^-19', '3.11E-19', '3,11×10⁻¹⁹']) assert.ok(Q.corrigir(p, certo).certa, certo);
  for (const errado of ['3,2e-19', '3,11e-18', '1e-19']) assert.ok(!Q.corrigir(p, errado).certa, errado);
  const r = Q.corrigir(p, '3,11e-28');
  assert.ok(!r.certa);
  assert.equal(r.erroTipico.codigo, 'nao_converteu_nm_em_m');
  assert.equal(Q.corrigir(p, '1,04e-27').erroTipico.codigo, 'usou_h_sobre_lambda');
  // Todas as numéricas de notação científica usam toleranciaRelativa (sem tolerância absoluta).
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 20; s++) {
      const q = G.gerar(id, s, { formato: 'numerica', contexto });
      if (q.resposta !== 0 && (Math.abs(q.resposta) >= 1e5 || Math.abs(q.resposta) < 1e-3)) {
        assert.ok(q.toleranciaRelativa > 0 && q.tolerancia === undefined, id + ' ' + contexto + ' ' + s);
      }
    }
  }
});

test('«com três algarismos significativos»: algarismos = 3 e a resposta já arredondada', () => {
  let n = 0;
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 30; s++) {
      const p = G.gerar(id, s, { formato: 'numerica', contexto });
      const pede = /três algarismos significativos/.test(p.enunciado);
      assert.equal(p.algarismos === 3, pede, id + ' ' + contexto + ' ' + s);
      if (pede) {
        n++;
        assert.equal(Number(p.resposta.toPrecision(3)), p.resposta, id + ' ' + s);
      }
    }
  }
  assert.ok(n > 100);
});

test('figura do átomo em modo exercício: a ordem das partes é a da figura e o enunciado não revela a resposta', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'esquemas', 'fqa', 'fig-atomo.js'), 'utf8');
  const ordem = [...src.matchAll(/\{ id: '([a-z]+)', rotulo: '([^']+)'/g)].map((m) => [m[1], m[2]]);
  assert.equal(ordem.length, 5);
  const vistos = new Set();
  for (const p of itens('atomo-figura', 60)) {
    const n = Number(p.enunciado.match(/número (\d)/)[1]);
    assert.equal(p.figuraEnunciado.opcoes.destacar, ordem[n - 1][0]);
    assert.equal(p.figuraEnunciado.opcoes.modo, 'exercicio');
    assert.ok(!p.enunciado.toLowerCase().includes(ordem[n - 1][1].toLowerCase()), p.enunciado);
    if (p.contexto === 'nome') assert.equal(p.opcoes[p.correta], ordem[n - 1][1]);
    vistos.add(p.figuraEnunciado.opcoes.destacar);
  }
  assert.equal(vistos.size, 5);
});

test('comparações de EI e raio: só representativos, sem exceções de EI, sem raios iguais, e a certa bate com os dados', () => {
  const exc = D.excecoesEI.concat(D.excecoesEIGrupo);
  for (const p of itens('tabela-periodica-comparar', 150)) {
    const { x, y, afirmacao } = p.dados;
    const a = D.elementos[x];
    const b = D.elementos[y];
    assert.ok(a.bloco !== 'd' && b.bloco !== 'd' && a.grupo !== 18 && b.grupo !== 18);
    assert.ok(!exc.includes(x + '>' + y) && !exc.includes(y + '>' + x), x + ' ' + y);
    assert.notEqual(a.raio, b.raio);
    assert.ok(p.contexto === 'periodo' ? a.periodo === b.periodo : a.grupo === b.grupo);
    const campo = afirmacao.prop === 'ei' ? 'ei1' : 'raio';
    const maior = D.elementos[afirmacao.maior][campo] > D.elementos[afirmacao.maior === x ? y : x][campo];
    if (p.formato === 'vf') assert.equal(p.correta, maior);
    else assert.ok(maior);
  }
});

test('configurações só até Z = 23, escritas pela ordem de preenchimento (4s antes de 3d)', () => {
  for (const id of ['configuracao-escrever', 'configuracao-contar', 'configuracao-identificar']) {
    for (const p of itens(id, 80)) {
      assert.ok(p.dados.z >= 1 && p.dados.z <= 23, id);
      for (const t of [p.enunciado].concat(p.opcoes || [])) {
        // Ordem de escrita: nunca 3d antes de 4s na mesma configuração.
        const i3d = t.indexOf('\\mathrm{3d}');
        const i4s = t.indexOf('\\mathrm{4s}');
        if (i3d >= 0 && i4s >= 0) assert.ok(i4s < i3d, id + ': ' + t);
      }
    }
  }
});

test('escolha: cada opção errada tem um código próprio; explicações sem dois «dois pontos» numa frase', () => {
  const semFormulas = (t) => String(t).replace(/\$\$[\s\S]*?\$\$/g, 'F').replace(/\$[^$]*\$/g, 'F');
  for (const id of IDS) {
    for (const p of itens(id, 25)) {
      if (p.formato === 'escolha') {
        const codigos = p.errosTipicos.map((e) => e.codigo);
        assert.equal(new Set(codigos).size, codigos.length, id + ' ' + p.contexto + ' ' + p.semente);
      }
      const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao));
      for (const t of textos) {
        for (const frase of semFormulas(t).split(/(?<=[.?!])\s+/)) {
          assert.ok((frase.match(/:\s/g) || []).length < 2, id + ': ' + frase);
        }
      }
    }
  }
});

test('as explicações dos erros numéricos mostram o valor do erro', () => {
  const Q = M.quiz;
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 15; s++) {
      const p = G.gerar(id, s, { formato: 'numerica', contexto });
      for (const e of p.errosTipicos) {
        // O valor aparece na explicação (como número decimal, com vírgula, ou em notação científica).
        const v = e.valor;
        const mant = Math.abs(v).toExponential(2).split('e')[0].replace('.', '{,}');
        const formas = [String(v).replace('.', ','), Q.textoNumero({ resposta: v, gerador: 'x' }), mant, mant.replace(/0+$/, '').replace(/\{,\}$/, ''),
          Math.abs(v).toFixed(2).replace('.', ','), Math.abs(v).toFixed(2).replace('.', '{,}'), Math.abs(v).toPrecision(3).replace('.', '{,}'), Math.abs(v).toPrecision(3).replace('.', ','),
          Math.abs(v).toLocaleString('pt-PT', { maximumFractionDigits: 8 })];
        assert.ok(formas.some((f) => e.explicacao.includes(f)), id + ' ' + contexto + ' ' + s + ' ' + e.codigo + ' ' + v + ': ' + e.explicacao);
      }
    }
  }
});

test('isótopos: todas as espécies mostradas são nuclídeos que existem (estáveis ou radioativos dos dados)', () => {
  const existe = (z, a) => {
    const s = Object.keys(D.elementos).find((k) => D.elementos[k].z === z);
    return [D.nuclideosEstaveis, D.nuclideosRadioativos].some((l) => (l[s] || []).includes(a));
  };
  for (const p of itens('atomo-isotopos', 150)) {
    const textos = [p.enunciado].concat(p.opcoes || []);
    for (const t of textos) for (const m of t.matchAll(/\{\}\^\{(\d+)\}_\{(\d+)\}/g)) assert.ok(existe(Number(m[2]), Number(m[1])), m[0] + ' em ' + t);
  }
  for (const s of Object.keys(D.isotopos)) for (const i of D.isotopos[s]) assert.ok(D.nuclideosEstaveis[s] ? D.nuclideosEstaveis[s].includes(i.a) : s === 'H', s + i.a);
});

test('ião mais provável: nenhuma opção com carga de módulo maior do que 3 (nada de Li⁷⁻ ou F⁷⁺)', () => {
  for (const p of itens('tabela-periodica-iao', 100)) {
    for (const t of [p.enunciado].concat(p.opcoes || [])) for (const m of t.matchAll(/\^\{(\d*)[+-]\}/g)) assert.ok(Number(m[1] || 1) <= 3, t);
  }
});

// ---------------------------------------------------------------- espectros-bohr
// Verdade de uma afirmação sobre a transição ni → nf, lida no próprio texto (outro caminho que não o do gerador).
const INF = 'inf';
function verdadeBohr(texto, ni, nf) {
  const sobe = nf === INF || nf > ni;
  if (/absorve/.test(texto)) return sobe;
  if (/emite/.test(texto)) return !sobe;
  if (/estado fundamental/.test(texto)) return nf === 1;
  if (/estado excitado/.test(texto)) return nf !== INF && nf >= 2;
  if (/ionizado/.test(texto)) return nf === INF;
  if (/energia do eletrão aumenta/.test(texto)) return sobe;
  if (/energia do eletrão diminui/.test(texto)) return !sobe;
  if (/é negativa/.test(texto)) return true;
  if (/é positiva/.test(texto)) return false;
  throw new Error('afirmação sem leitura: ' + texto);
}

test('espectros-bohr: formatos escolha e vf, subtema espectros, tipo bohr', () => {
  const d = G.obter('espectros-bohr');
  assert.ok(d, 'gerador espectros-bohr existe');
  assert.deepEqual(d.formatos, ['escolha', 'vf']);
  assert.equal(d.subtema, 'espectros');
  assert.equal(d.tipo, 'bohr');
});

test('espectros-bohr: em 500 sementes a resposta é coerente com a transição sorteada', () => {
  const vistos = new Set();
  for (const p of itens('espectros-bohr', 500)) {
    const { ni, nf } = p.dados;
    assert.ok(Number.isInteger(ni) && ni >= 1 && ni <= 4, 'ni ' + ni);
    assert.ok(nf === INF || (Number.isInteger(nf) && nf >= 1 && nf <= 4 && nf !== ni), 'nf ' + nf);
    vistos.add(nf === INF ? 'ionizacao' : nf > ni ? 'sobe' : 'desce');
    if (nf === 1) vistos.add('fundamental');
    if (p.formato === 'escolha') {
      p.opcoes.forEach((o, i) => assert.equal(verdadeBohr(o, ni, nf), i === p.correta, ni + ' → ' + nf + ': ' + o));
    } else {
      const frase = p.enunciado.split(/(?<=\$\.) /).pop();
      assert.equal(verdadeBohr(frase, ni, nf), p.correta, ni + ' → ' + nf + ': ' + p.enunciado);
    }
  }
  assert.deepEqual([...vistos].sort(), ['desce', 'fundamental', 'ionizacao', 'sobe']);
});

test('espectros-bohr: os erros típicos são os da brief (absorção/emissão, n = 1 excitado, energia positiva ou a diminuir com n)', () => {
  const codigos = new Set();
  for (const p of itens('espectros-bohr', 300)) p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  for (const c of ['trocou_emissao_com_absorcao', 'fundamental_como_excitado', 'excitado_como_fundamental',
    'ionizacao_como_excitacao', 'energia_diminui_com_n', 'energia_dos_niveis_positiva']) assert.ok(codigos.has(c), c);
});
