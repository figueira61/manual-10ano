const path = require('node:path');

const RAIZ = path.join(__dirname, '..');

// Carrega ficheiros clássicos (relativos à raiz) num Manual limpo e devolve-o.
function carregar(...caminhos) {
  delete globalThis.Manual;
  const absolutos = caminhos.map((c) => path.join(RAIZ, c));
  for (const abs of absolutos) delete require.cache[abs];
  for (const abs of absolutos) require(abs);
  return globalThis.Manual;
}

module.exports = { carregar };
