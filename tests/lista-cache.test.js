const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { listarFicheiros, gerarConteudo } = require('../tools/gerar-lista-cache.js');

const RAIZ = path.join(__dirname, '..');

function js(pasta) {
  return fs.readdirSync(path.join(RAIZ, pasta)).filter((f) => f.endsWith('.js')).map((f) => pasta + '/' + f);
}

test('a lista inclui os ficheiros essenciais', () => {
  const lista = listarFicheiros(RAIZ);
  for (const f of ['index.html', 'manifest.webmanifest', 'icone.svg', 'js/app.js', 'vendor/katex/katex.min.js']) {
    assert.ok(lista.includes(f), 'falta ' + f);
  }
  for (const f of [...js('esquemas/mat-a'), ...js('conteudos/mat-a')]) {
    assert.ok(lista.includes(f), 'falta ' + f);
  }
});

test('a lista está ordenada, sem barra inicial e sem duplicados', () => {
  const lista = listarFicheiros(RAIZ);
  assert.deepStrictEqual(lista, [...lista].sort());
  assert.strictEqual(new Set(lista).size, lista.length);
  assert.ok(lista.every((f) => !f.startsWith('/') && !f.includes('\\')));
});

test('a lista exclui o que não é do site', () => {
  const lista = listarFicheiros(RAIZ);
  const proibido = /^(tests|tools|docs|\.claude|\.git|\.superpowers|node_modules)\//;
  assert.deepStrictEqual(lista.filter((f) => proibido.test(f)), []);
  for (const f of ['esquemas/nucleo/demo.html', 'sw.js', 'lista-cache.js', 'package.json', 'README.md']) {
    assert.ok(!lista.includes(f), 'não devia incluir ' + f);
  }
});

test('lista-cache.js em disco está atualizado (corra npm run cache)', () => {
  const emDisco = fs.readFileSync(path.join(RAIZ, 'lista-cache.js'), 'utf8');
  assert.strictEqual(emDisco, gerarConteudo(RAIZ));
});
