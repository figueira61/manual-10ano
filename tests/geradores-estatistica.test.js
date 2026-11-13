// Geradores de Matemática A — Estatística (js/geradores/mat-a/estatistica.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-estatistica.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/estatistica.js',
];
const IDS = [
  'conceitos-populacao-amostra', 'conceitos-tipo-variavel', 'conceitos-enviesamento',
  'frequencias-histograma-freq-relativa', 'frequencias-histograma-freq-acumulada',
  'frequencias-histograma-classe-modal', 'frequencias-histograma-amplitude-classe',
  'localizacao-media', 'localizacao-mediana', 'localizacao-quartil',
  'dispersao-amplitude-aiq', 'dispersao-desvio-padrao', 'dispersao-comparar',
  'propriedades-media-transformada', 'propriedades-desvio-transformado', 'propriedades-outlier',
  'bivariada-previsao', 'bivariada-sinal-r', 'bivariada-interpretar-declive',
];

let M, G, verificar;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
  const harness = path.join(__dirname, '..', 'tools', 'verificar-geradores.js');
  delete require.cache[harness];
  verificar = require(harness).verificar;
});

test('regista os 19 geradores de estatística, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'estatistica').map((d) => d.id);
  assert.deepEqual(ids, IDS);
  for (const id of IDS) {
    const d = G.obter(id);
    assert.equal(d.disciplina, 'mat-a');
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, id);
  }
});

test('conceitos usam um conjunto escrito de pelo menos 8 estudos', () => {
  assert.ok(G.contextosDe(G.obter('conceitos-populacao-amostra')).length >= 8);
  assert.ok(G.contextosDe(G.obter('conceitos-enviesamento')).length >= 8);
});

for (const id of IDS) {
  test(id + ' passa a verificação (200 sementes)', () => {
    assert.deepEqual(verificar(G.obter(id), { sementes: 200 }), []);
  });
}

// Snapshots pequenos (semente 7), conferidos à mão.
test('snapshot: localizacao-mediana (par), semente 7', () => {
  const p = G.gerar('localizacao-mediana', 7, { formato: 'numerica', contexto: 'par' });
  assert.deepEqual(p.dados.xs, [20, 16, 13, 12, 12, 9]);
  assert.equal(p.resposta, 12.5); // 9, 12, 12, 13, 16, 20 → (12 + 13)/2
});

test('snapshot: dispersao-desvio-padrao, semente 7', () => {
  const p = G.gerar('dispersao-desvio-padrao', 7, { formato: 'numerica' });
  assert.deepEqual(p.dados.xs, [22, 29, 27, 8, 12, 16]);
  assert.equal(p.resposta, 8.39); // média 19, Σd² = 352, √(352/5) ≈ 8,39
  assert.equal(p.arredondamento, 'às centésimas');
  assert.ok(p.resolucaoDetalhada[1].bloco && p.resolucaoDetalhada[1].calculo.startsWith('\\begin{array}'));
});

test('snapshot: localizacao-quartil (q3), semente 7', () => {
  const p = G.gerar('localizacao-quartil', 7, { formato: 'numerica', contexto: 'q3' });
  assert.deepEqual(p.dados.xs, [20, 16, 13, 12, 12, 9, 14, 16]);
  assert.equal(p.resposta, 16); // p = 8 × 75/100 = 6 → (x₆ + x₇)/2 = (16 + 16)/2
});

test('snapshot: bivariada-previsao (preco), semente 7', () => {
  const p = G.gerar('bivariada-previsao', 7, { formato: 'numerica', contexto: 'preco' });
  assert.match(p.enunciado, /\$y = -8x \+ 150\$/);
  assert.equal(p.resposta, 110); // −8 × 5 + 150
  assert.equal(p.esquema.id, 'regressao');
});

test('snapshot: frequencias-histograma-freq-acumulada (relativa), semente 7', () => {
  const p = G.gerar('frequencias-histograma-freq-acumulada', 7, { formato: 'numerica', contexto: 'relativa' });
  assert.match(p.enunciado, /Que percentagem dos alunos tem pelo menos 1 irmão\?/);
  assert.equal(p.resposta, 85); // (20 − 3)/20
  assert.equal(p.unidade, '%');
});

test('escolha: cada opção errada tem um código próprio (sem distratores genéricos)', () => {
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('escolha')) continue;
    for (const contexto of G.contextosDe(d)) {
      for (let s = 1; s <= 30; s++) {
        const p = G.gerar(id, s, { formato: 'escolha', contexto });
        const codigos = p.errosTipicos.map((e) => e.codigo);
        assert.equal(new Set(codigos).size, codigos.length, id + ' ' + contexto + ' ' + s);
      }
    }
  }
});
