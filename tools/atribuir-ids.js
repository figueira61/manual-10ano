// Atribui um id estável (<subtema>-qNN) a cada pergunta de quiz dos ficheiros de tema.
// Edição textual mínima: acrescenta uma linha "id: '...'," a seguir à abertura de cada pergunta.
// Falha (código != 0) se o número de ids inseridos não for o esperado. Idempotente.
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');

function atribuirFicheiro(rel, tema) {
  const caminho = path.join(RAIZ, rel);
  const original = fs.readFileSync(caminho, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const linhas = original.split(/\r?\n/);
  const saida = [];
  let esperadas = 0;
  let inseridas = 0;
  let jaTinham = 0;
  let subtema = -1;
  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i];
    saida.push(linha);
    i++;
    const m = /^(\s*)quiz: \[\s*$/.exec(linha);
    if (!m) continue;
    subtema++;
    const s = tema.subtemas[subtema];
    if (!s) throw new Error(rel + ': mais arrays quiz do que subtemas');
    const recuo = m[1] + '  ';
    let n = 0;
    while (i < linhas.length && !new RegExp('^' + m[1] + '\],?\s*$').test(linhas[i])) {
      const l = linhas[i];
      saida.push(l);
      i++;
      if (l === recuo + '{') {
        n++;
        const id = s.id + '-q' + String(n).padStart(2, '0');
        if (/^\s*id: '/.test(linhas[i])) {
          jaTinham++;
        } else {
          saida.push(recuo + '  id: \'' + id + '\',');
          inseridas++;
        }
      }
    }
    if (n !== s.quiz.length) {
      throw new Error(rel + ' / ' + s.id + ': encontradas ' + n + ' perguntas no texto, esperadas ' + s.quiz.length);
    }
    esperadas += n;
  }
  if (subtema + 1 !== tema.subtemas.length) {
    throw new Error(rel + ': ' + (subtema + 1) + ' arrays quiz no texto, ' + tema.subtemas.length + ' subtemas');
  }
  if (inseridas + jaTinham !== esperadas) {
    throw new Error(rel + ': ids inseridos (' + inseridas + ') + existentes (' + jaTinham + ') != ' + esperadas);
  }
  if (inseridas > 0) fs.writeFileSync(caminho, saida.join(eol), 'utf8');
  return { esperadas, inseridas };
}

function principal() {
  delete globalThis.Manual;
  require(path.join(RAIZ, 'js/nucleo.js'));
  const Manual = globalThis.Manual;
  require(path.join(RAIZ, 'conteudos/indice.js'));
  let esperadas = 0;
  let inseridas = 0;
  for (const disc of Manual.indice) {
    if (!disc.disponivel) continue;
    for (const t of disc.temas) {
      const rel = Manual.ficheiroTema(disc.id, t.id);
      if (!fs.existsSync(path.join(RAIZ, rel))) continue;
      require(path.join(RAIZ, rel));
      const r = atribuirFicheiro(rel, Manual.obterTema(disc.id, t.id));
      esperadas += r.esperadas;
      inseridas += r.inseridas;
      console.log(rel + ': ' + r.inseridas + ' ids inseridos (' + r.esperadas + ' perguntas)');
    }
  }
  console.log('Total: ' + inseridas + ' inseridos, ' + esperadas + ' perguntas');
  return 0;
}

try {
  process.exitCode = principal();
} catch (e) {
  console.error('Erro: ' + (e && e.message ? e.message : e));
  process.exitCode = 1;
}
