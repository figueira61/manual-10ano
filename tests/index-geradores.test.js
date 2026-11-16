// index.html carrega todos os ficheiros de js/geradores/** pela ordem certa, e todos estão na lista de cache.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ficheirosGeradores } = require('../tools/verificar-geradores.js');
const { listarFicheiros } = require('../tools/gerar-lista-cache.js');

const RAIZ = path.join(__dirname, '..');
const rel = (f) => path.relative(RAIZ, f).split(path.sep).join('/');
const geradores = ficheirosGeradores().map(rel);
const scripts = [...fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const pos = (f) => scripts.indexOf(f);

test('index.html inclui cada ficheiro de js/geradores/**', () => {
  assert.ok(geradores.length >= 7);
  for (const f of geradores) assert.ok(pos(f) >= 0, 'falta no index.html: ' + f);
  assert.deepEqual(scripts.filter((s) => s.startsWith('js/geradores/') && !geradores.includes(s)), [], 'scripts de geradores inexistentes');
});

test('index.html: registo.js, depois ajudas.js, depois os temas, e só depois miniquiz.js e render.js', () => {
  const registo = pos('js/geradores/registo.js');
  const ajudas = pos('js/geradores/ajudas.js');
  const temas = geradores.filter((f) => /^js\/geradores\/[^/]+\//.test(f)).map(pos);
  assert.ok(registo >= 0 && registo < ajudas, 'registo.js antes de ajudas.js');
  for (const t of temas) assert.ok(ajudas < t, 'ajudas.js antes dos temas');
  // Química depois de todos os geradores de Matemática A.
  const matA = geradores.filter((f) => f.startsWith('js/geradores/mat-a/')).map(pos);
  const fqa = geradores.filter((f) => f.startsWith('js/geradores/fqa/')).map(pos);
  assert.ok(fqa.length >= 1, 'há geradores de fqa');
  for (const q of fqa) assert.ok(q > Math.max(...matA), 'geradores de fqa depois dos de Matemática A');
  assert.ok(pos('js/geradores/fqa/elementos.js') < pos('js/miniquiz.js'), 'elementos.js antes de miniquiz.js');
  assert.ok(pos('js/geradores/fqa/elementos.js') < pos('js/geradores/fqa/materia.js'), 'materia.js depois de elementos.js');
  assert.ok(pos('js/geradores/fqa/materia.js') < pos('js/miniquiz.js'), 'materia.js antes de miniquiz.js');
  const ultimo = Math.max(...temas);
  for (const consumidor of ['js/miniquiz.js', 'js/render.js']) {
    assert.ok(pos(consumidor) > ultimo, consumidor + ' depois de todos os geradores');
  }
});

test('lista-cache inclui cada ficheiro de js/geradores/**', () => {
  const lista = listarFicheiros(RAIZ);
  for (const f of geradores) assert.ok(lista.includes(f), 'falta na lista de cache: ' + f);
  const emDisco = fs.readFileSync(path.join(RAIZ, 'lista-cache.js'), 'utf8');
  for (const f of geradores) assert.ok(emDisco.includes('"' + f + '"'), 'falta em lista-cache.js: ' + f);
});

test('index.html: treino.js, teste.js e vistas-estudo.js depois de miniquiz.js e antes de app.js; todos em cache', () => {
  const lista = fs.readFileSync(path.join(RAIZ, 'lista-cache.js'), 'utf8');
  for (const f of ['js/treino.js', 'js/teste.js', 'js/painel.js', 'js/vistas-estudo.js']) {
    assert.ok(pos(f) > pos('js/miniquiz.js'), f + ' depois de miniquiz.js');
    assert.ok(pos(f) < pos('js/app.js'), f + ' antes de app.js');
    assert.ok(lista.includes('"' + f + '"'), 'falta em lista-cache.js: ' + f);
  }
  assert.ok(pos('js/vistas-estudo.js') > pos('js/teste.js'), 'vistas-estudo.js depois de teste.js');
  assert.ok(pos('js/painel.js') > pos('js/teste.js'), 'painel.js depois de teste.js');
  assert.ok(pos('js/vistas-estudo.js') > pos('js/render.js'), 'vistas-estudo.js depois de render.js');
  assert.ok(pos('js/vistas-estudo.js') > pos('js/motor.js'), 'vistas-estudo.js depois de motor.js');
});

test('index.html: vistas-progresso.js depois de vistas-estudo.js, de vistas-conta.js e de painel.js, antes de app.js; em cache', () => {
  const lista = fs.readFileSync(path.join(RAIZ, 'lista-cache.js'), 'utf8');
  const f = 'js/vistas-progresso.js';
  for (const antes of ['js/vistas-estudo.js', 'js/vistas-conta.js', 'js/painel.js', 'js/motor.js']) assert.ok(pos(f) > pos(antes), f + ' depois de ' + antes);
  assert.ok(pos(f) < pos('js/app.js'), f + ' antes de app.js');
  assert.ok(lista.includes('"' + f + '"'), 'falta em lista-cache.js: ' + f);
});
