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
