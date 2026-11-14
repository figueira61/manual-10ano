// Geradores de Matemática A — Estatística (js/geradores/mat-a/estatistica.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
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

let M, G;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
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

// A verificação de 200 sementes de cada gerador corre em tests/geradores-todos.test.js.

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

test('previsão (escolha): todas as opções são valores possíveis no contexto', () => {
  const LIM = { estudo: [0, 20], temperatura: [0, 300], preco: [0, 300], carro: [0, 40] };
  for (const contexto of Object.keys(LIM)) {
    for (let s = 1; s <= 100; s++) {
      const p = G.gerar('bivariada-previsao', s, { formato: 'escolha', contexto });
      for (const o of p.opcoes) {
        const v = Number(o.split(' ')[0].replace(',', '.'));
        assert.ok(v > LIM[contexto][0] && v <= LIM[contexto][1], contexto + ' ' + s + ': ' + o);
        if (contexto === 'temperatura' || contexto === 'preco') assert.ok(Number.isInteger(v), contexto + ' ' + s + ': ' + o);
      }
    }
  }
});

test('outlier: o valor corrigido fica para lá de Q3 + 1,5·AIQ (ou abaixo de Q1 − 1,5·AIQ) por pelo menos uma AIQ', () => {
  const C = M.calc.estatistica;
  for (const contexto of ['maximo', 'minimo']) {
    for (let s = 1; s <= 100; s++) {
      const { xs, novo } = G.gerar('propriedades-outlier', s, { contexto }).dados;
      const q1 = C.percentil(xs, 25);
      const q3 = C.percentil(xs, 75);
      const aiq = q3 - q1;
      if (contexto === 'maximo') assert.ok(novo >= q3 + 2.5 * aiq, s + '');
      else assert.ok(novo <= q1 - 2.5 * aiq, s + '');
    }
  }
});

test('classe modal: o erro «valores diferentes» só aparece numa classe com repetidos e com os números certos', () => {
  let visto = 0;
  const N = 500;
  for (let s = 1; s <= N; s++) {
    const p = G.gerar('frequencias-histograma-classe-modal', s, { contexto: 'lista' });
    const e = p.errosTipicos.find((x) => x.codigo === 'contou_valores_diferentes');
    if (!e) continue;
    visto++;
    const { xs, a, h } = p.dados;
    const deClasse = (lo) => xs.filter((x) => x >= lo && x < lo + h);
    // Classe apontada pela opção errada e classe modal (opção certa), lidas do próprio item.
    const lo = Number(p.opcoes[e.opcao].match(/\[(\d+)/)[1]);
    const loM = Number(p.opcoes[p.correta].match(/\[(\d+)/)[1]);
    const obs = deClasse(lo).length;
    const dif = new Set(deClasse(lo)).size;
    assert.ok(dif < obs, 'semente ' + s + ': ' + dif + ' diferentes e ' + obs + ' observações');
    assert.notEqual(lo, loM);
    // É mesmo a classe com mais valores diferentes (o que escolhe quem comete o erro).
    for (let j = 0; j < 5; j++) {
      const outra = a + j * h;
      if (outra !== lo) assert.ok(new Set(deClasse(outra)).size < dif, 'semente ' + s);
    }
    // A explicação usa estes números.
    assert.ok(e.explicacao.includes('tem ' + dif + ' valores diferentes e ' + obs + ' observações'), e.explicacao);
    assert.ok(e.explicacao.includes(deClasse(loM).length + ' observações'), e.explicacao);
  }
  assert.ok(visto >= N / 5, 'aparece em ' + visto + ' de ' + N);
});

test('sem frases com dois «dois pontos» seguidos nas explicações e passos', () => {
  const semFormulas = (t) => String(t).replace(/\$\$[\s\S]*?\$\$/g, 'F').replace(/\$[^$]*\$/g, 'F');
  for (const id of IDS) {
    const d = G.obter(id);
    for (const formato of d.formatos) {
      for (const contexto of G.contextosDe(d)) {
        for (let s = 1; s <= 20; s++) {
          const p = G.gerar(id, s, { formato, contexto });
          const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao));
          for (const t of textos) {
            for (const frase of semFormulas(t).split(/(?<=[.?!])\s+/)) {
              assert.ok((frase.match(/:\s/g) || []).length < 2, id + ': ' + frase);
            }
          }
        }
      }
    }
  }
});
