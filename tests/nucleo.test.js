const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js');
});

test('registarIndice guarda o indice', () => {
  const disciplinas = [{ id: 'mat-a', nome: 'Matemática A', disponivel: true, temas: [] }];
  Manual.registarIndice(disciplinas);
  assert.equal(Manual.indice, disciplinas);
});

test('registarTema guarda e obterTema devolve', () => {
  Manual.registarTema('mat-a', { id: 'funcoes', subtemas: [] });
  assert.equal(Manual.obterTema('mat-a', 'funcoes').id, 'funcoes');
  assert.equal(Manual.obterTema('mat-a', 'x'), undefined);
});

test('registarTema com id repetido lança erro', () => {
  Manual.registarTema('mat-a', { id: 'funcoes', subtemas: [] });
  assert.throws(
    () => Manual.registarTema('mat-a', { id: 'funcoes', subtemas: [] }),
    /duplicado/
  );
});

test('esquemas.registar e obter', () => {
  const def = { montar() { return { destruir() {} }; } };
  Manual.esquemas.registar('referencial', def);
  assert.equal(Manual.esquemas.obter('referencial'), def);
  assert.equal(Manual.esquemas.obter('inexistente'), undefined);
});

test('esquemas.registar com id repetido lança erro', () => {
  const def = { montar() { return { destruir() {} }; } };
  Manual.esquemas.registar('referencial', def);
  assert.throws(() => Manual.esquemas.registar('referencial', def), /duplicado/);
});

test('ficheiroTema e ficheiroEsquema devolvem os caminhos', () => {
  assert.equal(Manual.ficheiroTema('mat-a', 'funcoes'), 'conteudos/mat-a/funcoes.js');
  assert.equal(Manual.ficheiroEsquema('mat-a', 'calculo-funcoes'), 'esquemas/mat-a/calculo-funcoes.js');
});
