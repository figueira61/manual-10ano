// Verificação (200 sementes) de todos os geradores registados em js/geradores/**: npm test cobre-os à medida que entram.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verificar, carregarTudo } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
const defs = M.geradores.todos();

test('os geradores carregam sem erros', () => {
  assert.ok(Array.isArray(defs));
});

for (const def of defs) {
  test('gerador ' + def.id + ' passa a verificação (200 sementes)', () => {
    assert.deepEqual(verificar(def, { sementes: 200 }), []);
  });
}

test('a resposta correta mostrada de cada numérica gerada lê-se como a resposta', () => {
  require('../js/quiz.js');
  const Q = globalThis.Manual.quiz;
  for (const def of defs.filter((d) => d.formatos.includes('numerica'))) {
    for (const contexto of M.geradores.contextosDe(def)) {
      for (let s = 1; s <= 20; s++) {
        const p = M.geradores.gerarDe(def, s, { formato: 'numerica', contexto });
        const t = Q.textoNumero(p);
        assert.ok(Math.abs(Q.lerNumero(t) - p.resposta) < 1e-9, def.id + ' ' + p.resposta + ' → ' + t);
        if (p.unidade === '€') assert.match(t, /,\d\d$/, def.id + ': ' + t);
      }
    }
  }
});
