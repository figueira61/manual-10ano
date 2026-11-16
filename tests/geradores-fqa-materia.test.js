// Geradores de Química — Propriedades e transformações da matéria (js/geradores/fqa/materia.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verificar, carregarTudo } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
require('../js/quiz.js');
require('../js/aprendizagem.js');
const G = M.geradores;
const D = M.dadosQuimicos;
const Mol = M.moleculas;

const IDS = [
  'ligacao-tipo', 'ligacao-lewis', 'ligacao-parametros',
  'geometria-forma', 'geometria-polaridade', 'geometria-intermoleculares',
];
const SUBTEMAS = ['ligacao', 'geometria'];
const defs = () => G.todos().filter((d) => d.disciplina === 'fqa' && d.tema === 'materia');
function* itens(id, sementes) {
  const d = G.obter(id);
  for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= sementes; s++) {
    yield G.gerar(id, s, { formato, contexto });
  }
}
const certa = (p) => p.opcoes[p.correta];

test('regista os geradores de matéria, ≥ 3 por subtema, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
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
  let p = g('ligacao-tipo');
  assert.match(p.enunciado, /hidrogénio e de oxigénio na água/);
  assert.equal(certa(p), 'Covalente');
  p = g('ligacao-lewis');
  assert.match(p.enunciado, /\\mathrm\{CO_2\}/);
  assert.equal(p.resposta, 4); // 2 pares não ligantes em cada O
  assert.deepEqual(p.figuraEnunciado, { id: 'fqa-molecula', opcoes: { molecula: 'CO2', modo: 'estrutura' } });
  p = g('ligacao-parametros');
  assert.match(p.enunciado, /N\{\\equiv\}N\}\$ com a ligação \$\\mathrm\{N\{=\}N/);
  assert.match(certa(p), /mais forte e mais curta/);
  p = g('geometria-forma');
  assert.match(p.enunciado, /\\mathrm\{CH_4\}/);
  assert.equal(certa(p), 'Tetraédrica, com ângulo de ligação de cerca de 109,5°');
  p = g('geometria-polaridade');
  assert.equal(certa(p), '$\\mathrm{N_2}$');
  p = g('geometria-intermoleculares');
  assert.match(p.enunciado, /metano/);
  assert.equal(certa(p), 'Só dispersão de London');
});

test('geometria: a resposta certa é a do catálogo, nunca a geometria dos pares de eletrões', () => {
  for (const p of itens('geometria-forma', 80)) {
    const m = Mol.obter(p.dados.molecula);
    if (p.formato === 'escolha') assert.ok(certa(p).startsWith(m.geometria.charAt(0).toUpperCase() + m.geometria.slice(1) + ','), p.dados.molecula);
    for (const e of p.errosTipicos) if (e.codigo === 'deu_a_geometria_dos_pares') assert.ok(Mol.obter(p.dados.molecula).atomos.some((a) => a.pares > 0));
  }
});

test('polaridade: «ligações polares → molécula polar» só aparece como erro e a certa bate com o catálogo', () => {
  for (const p of itens('geometria-polaridade', 80)) {
    const m = Mol.obter(p.dados.molecula);
    if (p.formato === 'escolha' && p.contexto === 'apolar') assert.equal(m.polar, false);
    if (p.formato === 'escolha' && p.contexto === 'justificacao') assert.ok(certa(p).startsWith(m.polar ? 'É polar:' : 'É apolar:'));
  }
});

test('figuras de enunciado: fqa-molecula nunca com mostrarInfo', () => {
  for (const id of IDS) for (const p of itens(id, 30)) {
    if (!p.figuraEnunciado) continue;
    if (p.figuraEnunciado.id === 'fqa-molecula') assert.ok(!p.figuraEnunciado.opcoes.mostrarInfo, id);
  }
});

test('tipo de ligação: iónica só entre metal e não metal, metálica só entre metais', () => {
  for (const p of itens('ligacao-tipo', 100)) {
    const metais = p.dados.elementos.filter((s) => ['Li', 'Na', 'K', 'Mg', 'Ca', 'Al', 'Cu', 'Fe'].includes(s)).length;
    const tipo = metais === 0 ? 'Covalente' : metais === p.dados.elementos.length ? 'Metálica' : 'Iónica';
    if (p.formato === 'escolha') assert.equal(certa(p), tipo);
  }
});

test('Lewis: contagens batem com o catálogo de moléculas', () => {
  for (const p of itens('ligacao-lewis', 60)) {
    const c = Mol.contar(p.dados.molecula);
    const v = { 'nao-ligantes': c.paresNaoLigantes, ligantes: c.paresLigantes, valencia: c.eletroesValencia }[p.dados.contexto];
    if (p.formato === 'numerica') assert.equal(p.resposta, v);
    else assert.equal(certa(p), String(v));
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

void D;
