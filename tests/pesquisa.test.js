const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;
let indice;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/router.js', 'js/pesquisa.js');
  indice = [
    {
      id: 'mat-a',
      nome: 'Matemática A',
      disponivel: true,
      temas: [
        {
          id: 'funcoes',
          titulo: 'Funções',
          subtemas: [
            { id: 'quadratica', titulo: 'Função quadrática', palavras: ['parábola', 'vértice'] },
            { id: 'afim', titulo: 'Função afim', palavras: ['reta', 'declive'] },
          ],
        },
      ],
    },
    {
      id: 'fq',
      nome: 'Físico-Química',
      disponivel: false,
      temas: [
        {
          id: 'mecanica',
          titulo: 'Mecânica',
          subtemas: [{ id: 'vertical', titulo: 'Queda vertical', palavras: ['vértice'] }],
        },
      ],
    },
  ];
});

test('encontra por palavra-chave sem acentos', () => {
  const r = Manual.pesquisa.procurar(indice, 'parabola');
  assert.deepEqual(r, [
    {
      disciplina: 'mat-a',
      tema: 'funcoes',
      subtema: 'quadratica',
      titulo: 'Função quadrática',
      caminho: '#/mat-a/funcoes/quadratica',
    },
  ]);
});

test('ignora maiúsculas e acentos no termo e no título', () => {
  const r = Manual.pesquisa.procurar(indice, 'QUADRÁTICA');
  assert.equal(r.length, 1);
  assert.equal(r[0].subtema, 'quadratica');
});

test('pesquisa por prefixo parcial em palavras', () => {
  const r = Manual.pesquisa.procurar(indice, 'vert');
  assert.deepEqual(
    r.map((x) => x.subtema),
    ['quadratica'],
  );
});

test('termo com menos de 2 caracteres devolve []', () => {
  assert.deepEqual(Manual.pesquisa.procurar(indice, 'a'), []);
  assert.deepEqual(Manual.pesquisa.procurar(indice, ' a '), []);
  assert.deepEqual(Manual.pesquisa.procurar(indice, ''), []);
});

test('disciplinas com disponivel:false são ignoradas', () => {
  assert.deepEqual(Manual.pesquisa.procurar(indice, 'queda'), []);
  assert.equal(Manual.pesquisa.procurar(indice, 'vértice').length, 1);
});

test('sem resultados devolve []', () => {
  assert.deepEqual(Manual.pesquisa.procurar(indice, 'logaritmo'), []);
});
