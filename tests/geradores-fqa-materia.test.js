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
  'carbono-hidrocarboneto', 'carbono-grupo-funcional', 'carbono-nome',
  'gases-volume-molar', 'gases-massa-volumica', 'gases-fracao-molar',
  'solucoes-concentracao', 'solucoes-diluicao', 'solucoes-composicao', 'solucoes-material',
];
const SUBTEMAS = ['ligacao', 'geometria', 'carbono', 'gases', 'solucoes'];
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
  p = g('carbono-hidrocarboneto');
  assert.match(p.enunciado, /cadeia aberta/);
  p = g('carbono-grupo-funcional');
  assert.ok(p.figuraEnunciado && p.figuraEnunciado.opcoes.modo === 'estrutura');
  p = g('carbono-nome');
  assert.ok(/^(Etano|Propano|Butano|Eteno|Propeno|Etino|Propino)$/.test(certa(p)));
  p = g('gases-volume-molar');
  assert.match(p.enunciado, /0\{,\}574\\,\\mathrm\{mol\}\$ de cloro/);
  assert.equal(p.resposta, 12.9); // 0,574 × 22,4 = 12,86
  assert.equal(p.algarismos, 3);
  p = g('gases-massa-volumica');
  assert.equal(p.resposta, 3.17); // 70,90 / 22,4 = 3,165
  p = g('gases-fracao-molar');
  assert.equal(p.resposta, 0.487); // 4,83 / (4,83 + 5,09)
  p = g('solucoes-concentracao');
  assert.match(p.enunciado, /2\{,\}39\\,\\mathrm\{g\}\$ de cloreto de sódio/);
  assert.equal(p.resposta, 0.409); // 2,39 / 58,44 / 0,1000
  p = g('solucoes-diluicao');
  assert.equal(p.resposta, 5); // 0,0394 × 250,0 / 1,97 = 5,00 mL
  p = g('solucoes-composicao');
  assert.equal(p.resposta, 1.16); // 5,74 / (5,74 + 488) × 100
  p = g('solucoes-material');
  assert.deepEqual(p.figuraEnunciado, { id: 'fig-material-solucao', opcoes: { modo: 'exercicio', destacar: 'balao' } });
  assert.equal(certa(p), 'Balão volumétrico'); // peça 6 da figura
});

test('soluções: c_iV_f = c_fV_i, mL não convertidos e massa do solvente aparecem como erros típicos', () => {
  const codigos = new Set();
  for (const id of ['solucoes-concentracao', 'solucoes-diluicao', 'solucoes-composicao']) for (const p of itens(id, 40)) p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  for (const c of ['trocou_os_volumes_na_diluicao', 'nao_converteu_ml_em_dm3', 'usou_a_massa_do_solvente', 'usou_10_elevado_a_3_no_ppm']) assert.ok(codigos.has(c), c);
});

test('figura do material em modo exercício: a ordem das peças é a da figura e o enunciado não revela a resposta', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'esquemas', 'fqa', 'fig-material-solucao.js'), 'utf8');
  const ordem = [...src.matchAll(/\{ id: '([a-z-]+)', rotulo: '([^']+)'/g)].map((m) => [m[1], m[2]]);
  assert.equal(ordem.length, 9);
  const vistos = new Set();
  for (const p of itens('solucoes-material', 80)) {
    const n = Number(p.enunciado.match(/número (\d)/)[1]);
    assert.equal(p.figuraEnunciado.opcoes.destacar, ordem[n - 1][0]);
    assert.ok(!p.enunciado.toLowerCase().includes(ordem[n - 1][1].toLowerCase()), p.enunciado);
    if (p.contexto === 'nome') assert.equal(certa(p), ordem[n - 1][1]);
    vistos.add(p.figuraEnunciado.opcoes.destacar);
  }
  assert.equal(vistos.size, 9);
});

test('gases: V_m só em PTN e com o valor dos dados; «V_m com a massa» e cm³ não convertidos são erros típicos', () => {
  const Vm = D.constantes.Vm;
  const codigos = new Set();
  for (const p of itens('gases-volume-molar', 80)) {
    if (/V_m/.test(p.enunciado)) assert.match(p.enunciado, /PTN/);
    assert.ok(p.enunciado.includes('V_m = ' + String(Vm).replace('.', '{,}')));
    p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  }
  assert.ok(codigos.has('usou_o_volume_molar_com_a_massa') && codigos.has('nao_converteu_cm3_em_dm3'));
});

test('grupo funcional: a certa é a do catálogo e o enunciado não revela o nome', () => {
  const NOMES = { alcool: 'Álcool', aldeido: 'Aldeído', cetona: 'Cetona', acido: 'Ácido carboxílico' };
  for (const p of itens('carbono-grupo-funcional', 60)) {
    const m = Mol.obter(p.dados.molecula);
    assert.ok(!p.enunciado.includes(m.nome), p.enunciado);
    if (p.formato === 'escolha') assert.equal(certa(p), NOMES[m.grupoFuncional]);
  }
});

test('todos os códigos de erro emitidos estão no snapshot de textos (leitura estática)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const linhas = new Set(fs.readFileSync(path.join(__dirname, 'fixtures', 'erros-humanizados.txt'), 'utf8').split(/\r?\n/).map((l) => l.split(' → ')[0]));
  for (const id of IDS) for (const p of itens(id, 40)) for (const e of p.errosTipicos) assert.ok(linhas.has(e.codigo), 'código sem texto no snapshot: ' + e.codigo);
});

test('textos sem comandos LaTeX que perderam a barra (mathrm, dfrac, text)', () => {
  for (const id of IDS) for (const p of itens(id, 30)) {
    const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque + ' ' + (r.calculo || '')), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.calculo]);
    for (const t of textos) assert.ok(!/(^|[^\\a-z])(mathrm|dfrac|text)\{/.test(String(t)), id + ': ' + t);
  }
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
