// Gera lista-cache.js (lista de pré-carregamento do service worker).
// Uso: npm run cache
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PASTAS_EXCLUIDAS = new Set(['.superpowers', '.git', '.claude', 'node_modules', 'docs', 'tests', 'tools']);
const FICHEIROS_EXCLUIDOS = new Set([
  'sw.js', 'lista-cache.js', 'package.json', 'package-lock.json', 'README.md', 'esquemas/nucleo/demo.html',
]);

const EXTENSOES_TEXTO = /\.(html|js|css|svg|webmanifest|json|md|txt)$/;

function listarFicheiros(raiz) {
  const resultado = [];
  function percorrer(relativo) {
    const abs = path.join(raiz, relativo);
    for (const entrada of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = relativo ? relativo + '/' + entrada.name : entrada.name;
      if (entrada.isDirectory()) {
        if (!PASTAS_EXCLUIDAS.has(entrada.name)) percorrer(rel);
      } else if (!FICHEIROS_EXCLUIDOS.has(rel) && !entrada.name.startsWith('.')) {
        resultado.push(rel);
      }
    }
  }
  percorrer('');
  return resultado.sort();
}

function versao(raiz, lista) {
  const hash = crypto.createHash('sha1');
  for (const f of lista) {
    hash.update(f + '\0');
    let dados = fs.readFileSync(path.join(raiz, f));
    // Fins de linha normalizados nos ficheiros de texto: o hash não depende do autocrlf do git.
    if (EXTENSOES_TEXTO.test(f)) dados = Buffer.from(dados.toString('utf8').split('\r\n').join('\n'));
    hash.update(dados);
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 10);
}

function gerarConteudo(raiz) {
  const lista = listarFicheiros(raiz);
  return '// Ficheiro gerado por tools/gerar-lista-cache.js (npm run cache). Não editar.\n'
    + 'self.LISTA_CACHE = ' + JSON.stringify(lista, null, 2) + ';\n'
    + "self.VERSAO_CACHE = '" + versao(raiz, lista) + "';\n";
}

if (require.main === module) {
  const raiz = path.join(__dirname, '..');
  fs.writeFileSync(path.join(raiz, 'lista-cache.js'), gerarConteudo(raiz));
  console.log('lista-cache.js atualizado.');
}

module.exports = { listarFicheiros, gerarConteudo };
