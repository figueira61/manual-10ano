// Geradores de Matemática A — Modelos Matemáticos para a Cidadania (js/geradores/mat-a/cidadania.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-cidadania.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/cidadania.js',
];
const IDS = [
  'maiorias-limiar', 'maiorias-vencedor', 'maiorias-em-falta',
  'borda-pontos', 'borda-vencedor', 'borda-divergencia',
  'hondt-stlague-hondt-mandatos', 'hondt-stlague-stlague-mandatos', 'hondt-stlague-ultimo-mandato',
  'salarios-ss', 'salarios-liquido', 'salarios-irs-anual', 'salarios-hora',
  'juros-simples-montante', 'juros-composto-montante', 'juros-capital-inicial',
];

let M, G;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
});

test('regista os 16 geradores de cidadania, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'cidadania').map((d) => d.id);
  assert.deepEqual(ids, IDS);
  for (const id of IDS) {
    const d = G.obter(id);
    assert.equal(d.disciplina, 'mat-a');
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, id);
  }
});

// A verificação de 200 sementes de cada gerador corre em tests/geradores-todos.test.js.

// Snapshots pequenos (semente 7), conferidos à mão.
test('snapshot: maiorias-limiar (votos), semente 7', () => {
  const p = G.gerar('maiorias-limiar', 7, { formato: 'numerica', contexto: 'votos' });
  assert.match(p.enunciado, /Joana teve 162 votos, Helena teve 131 votos e Rita teve 230 votos/);
  assert.equal(p.resposta, 262); // ⌊523/2⌋ + 1
  assert.equal(p.verificacao.valor, 262);
});

test('snapshot: hondt-stlague-hondt-mandatos, semente 7', () => {
  const p = G.gerar('hondt-stlague-hondt-mandatos', 7, { formato: 'numerica' });
  assert.deepEqual(p.dados, { votos: [430, 1020, 11730, 8480], M: 8, partido: 1 });
  assert.equal(p.resposta, 0); // C 5, D 3, A 0, B 0
  assert.deepEqual(p.esquema.opcoes.mandatos, 8);
});

test('snapshot: salarios-irs-anual, semente 7', () => {
  const p = G.gerar('salarios-irs-anual', 7, { formato: 'numerica' });
  assert.match(p.enunciado, /ilustrativ/);
  assert.equal(p.dados.R, 10000);
  assert.equal(p.resposta, 1440); // 8000 × 0,13 + 2000 × 0,20
  assert.equal(p.tolerancia, 0.005);
});

test('snapshot: juros-composto-montante (mensal), semente 7', () => {
  const p = G.gerar('juros-composto-montante', 7, { formato: 'numerica', contexto: 'mensal' });
  assert.deepEqual(p.dados, { C0: 600, r: 0.01, t: 6, n: 12 });
  assert.equal(p.resposta, 637.09); // 600 × (1 + 0,01/12)^72
});

test('snapshot: hondt-stlague-stlague-mandatos (escolha: distribuição), semente 7', () => {
  const p = G.gerar('hondt-stlague-stlague-mandatos', 7, { formato: 'escolha' });
  assert.match(p.enunciado, /Como ficam distribuídos os 8 mandatos/);
  assert.equal(p.opcoes[p.correta], 'A 0 – B 0 – C 5 – D 3'); // ímpares: C 11 730/1, /3, /5, /7, /9; D 8480/1, /3, /5
  assert.ok(p.resolucaoDetalhada[0].bloco && p.resolucaoDetalhada[0].calculo.startsWith('\\begin{array}'));
  assert.ok(p.resolucao[0].includes('$$\\begin{array}'));
});

test('mandatos: só erros reais (sem códigos contagem_*), em numérica e escolha', () => {
  for (const id of ['hondt-stlague-hondt-mandatos', 'hondt-stlague-stlague-mandatos']) {
    for (const formato of ['numerica', 'escolha']) {
      for (let s = 1; s <= 100; s++) {
        const p = G.gerar(id, s, { formato });
        assert.ok(p.errosTipicos.every((e) => !/^contagem_/.test(e.codigo)), id + ' ' + formato + ' ' + s);
      }
    }
  }
});
