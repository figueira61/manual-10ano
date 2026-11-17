const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const lerTudo = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8').split('\r').join('');

// O DOM falso não mede layout: estes testes fixam por texto as regras que evitam deslocamento horizontal a 375 px.
test('a revisão do Teste tem uma coluna que pode encolher (minmax(0, 1fr))', () => {
  const css = lerTudo('css/base.css');
  const m = css.match(/^\.revisao \{([^}]*)\}/m);
  assert.ok(m, 'falta a regra .revisao');
  assert.match(m[1], /display:\s*grid/);
  assert.match(m[1], /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('equações químicas: cada espécie no seu \mathrm{}, para a linha poder quebrar', () => {
  const dir = path.join(RAIZ, 'conteudos', 'fqa');
  const todos = fs.readdirSync(dir).filter((x) => x.endsWith('.js')).map((x) => 'conteudos/fqa/' + x).concat('js/geradores/fqa/materia.js');
  assert.ok(todos.length > 3);
  for (const f of todos) {
    const s = lerTudo(f);
    // Um grupo \mathrm{…} (sem chavetas dentro) com « + » ou seta no interior não quebra em KaTeX.
    for (const m of s.matchAll(/\\mathrm\{([^{}'\n]*)\}/g)) {
      assert.ok(!/ \+ |\\(long)?rightarrow/.test(m[1]), f + ': ' + m[0]);
    }
  }
});
