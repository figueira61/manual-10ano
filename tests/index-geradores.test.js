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
  const temas = geradores.filter((f) => f.startsWith('js/geradores/mat-a/')).map(pos);
  assert.ok(registo >= 0 && registo < ajudas, 'registo.js antes de ajudas.js');
  for (const t of temas) assert.ok(ajudas < t, 'ajudas.js antes dos temas');
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
