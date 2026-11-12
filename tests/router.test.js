const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/router.js');
});

test('hash vazio ou só "#/" é o início', () => {
  assert.deepEqual(Manual.router.analisar(''), { vista: 'inicio' });
  assert.deepEqual(Manual.router.analisar('#/'), { vista: 'inicio' });
});

test('#/mat-a é uma disciplina', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a'), { vista: 'disciplina', disciplina: 'mat-a' });
});

test('#/mat-a/resumos são os resumos da disciplina', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/resumos'), { vista: 'resumos', disciplina: 'mat-a' });
});

test('#/mat-a/funcoes é um tema', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/funcoes'), {
    vista: 'tema',
    disciplina: 'mat-a',
    tema: 'funcoes',
  });
});

test('#/mat-a/funcoes/quadratica é um subtema', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/funcoes/quadratica'), {
    vista: 'subtema',
    disciplina: 'mat-a',
    tema: 'funcoes',
    subtema: 'quadratica',
  });
});

test('#/pesquisa?q=... é pesquisa com o termo decodificado', () => {
  assert.deepEqual(Manual.router.analisar('#/pesquisa?q=parab%C3%B3la'), {
    vista: 'pesquisa',
    termo: 'parabóla',
  });
});

test('mais de 3 segmentos é naoEncontrado', () => {
  assert.equal(Manual.router.analisar('#/mat-a/a/b/c').vista, 'naoEncontrado');
});

test('segmento com maiúsculas ou espaços é naoEncontrado', () => {
  assert.equal(Manual.router.analisar('#/MAT A').vista, 'naoEncontrado');
  assert.equal(Manual.router.analisar('#/mat-a/Funcoes').vista, 'naoEncontrado');
});

test('caminho inverte analisar para os formatos suportados', () => {
  const hashes = [
    '#/',
    '#/mat-a',
    '#/mat-a/resumos',
    '#/mat-a/funcoes',
    '#/mat-a/funcoes/quadratica',
    '#/pesquisa?q=x%20y',
  ];
  for (const h of hashes) {
    assert.equal(Manual.router.caminho(Manual.router.analisar(h)), h, h);
  }
});

test('caminho codifica o termo de pesquisa', () => {
  assert.equal(
    Manual.router.caminho({ vista: 'pesquisa', termo: 'parabóla' }),
    '#/pesquisa?q=parab%C3%B3la'
  );
});

test('nomes reservados são vistas de um só segmento', () => {
  for (const nome of ['entrar', 'registar', 'conta', 'privacidade', 'progresso', 'treino', 'teste', 'encarregado']) {
    assert.deepEqual(Manual.router.analisar('#/' + nome), { vista: nome });
    assert.equal(Manual.router.caminho({ vista: nome }), '#/' + nome);
  }
  assert.deepEqual(Manual.router.analisar('#/mat-a'), { vista: 'disciplina', disciplina: 'mat-a' });
  assert.deepEqual(Manual.router.analisar('#/conta/x'), { vista: 'tema', disciplina: 'conta', tema: 'x' });
});
