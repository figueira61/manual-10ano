const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const TIPOS_BLOCO = ['texto', 'definicao', 'exemplo', 'erro-frequente', 'formula', 'quadro', 'codigo', 'esquema'];
const EPS = 1e-12;

function ficheiroEsquema(d, id) {
  const M = globalThis.Manual;
  return M && M.ficheiroEsquema ? M.ficheiroEsquema(d, id) : 'esquemas/' + d + '/' + id + '.js';
}

function naoVazio(v) {
  return Array.isArray(v) && v.length > 0;
}

// Compara verificar() com o valor esperado; devolve mensagem de erro ou null.
function compararVerificar(verificar, esperado, tol) {
  if (typeof verificar !== 'function') return 'verificar não é uma função';
  let obtido;
  try {
    obtido = verificar();
  } catch (e) {
    return 'verificar() lançou erro: ' + (e && e.message ? e.message : e);
  }
  if (!(Math.abs(obtido - esperado) <= tol + EPS)) {
    return 'verificar() = ' + obtido + ' não coincide com ' + esperado + ' (tolerância ' + tol + ')';
  }
  return null;
}

function validarPergunta(p, i, ctx, erros) {
  const loc = ctx + ' pergunta ' + (i + 1);
  if (p.tipo === 'escolha') {
    const ops = Array.isArray(p.opcoes) ? p.opcoes : [];
    if (!Number.isInteger(p.correta) || p.correta < 0 || p.correta >= ops.length) {
      erros.push(loc + ': correta (' + p.correta + ') fora do intervalo das opções');
    }
    if (new Set(ops).size !== ops.length) erros.push(loc + ': opções duplicadas');
  }
  if (p.tipo === 'numerica' || p.calculo === true) {
    if (!naoVazio(p.resolucao)) erros.push(loc + ': resolucao precisa de pelo menos 1 passo');
  }
  if (p.tipo === 'numerica') {
    const tol = p.tolerancia == null ? 1e-9 : p.tolerancia;
    const msg = compararVerificar(p.verificar, p.resposta, tol);
    if (msg) erros.push(loc + ': ' + msg);
  }
}

function validarBloco(b, i, d, ctx, existeFicheiro, erros) {
  const loc = ctx + ' bloco ' + (i + 1);
  if (!b || !TIPOS_BLOCO.includes(b.tipo)) {
    erros.push(loc + ': tipo de bloco desconhecido (' + (b && b.tipo) + ')');
    return;
  }
  if (b.tipo === 'exemplo' && b.resultado !== undefined && b.verificar !== undefined) {
    const msg = compararVerificar(b.verificar, b.resultado, 1e-9);
    if (msg) erros.push(loc + ' (exemplo): ' + msg);
  }
  if (b.tipo === 'esquema') {
    const f = ficheiroEsquema(d, b.id);
    if (!existeFicheiro(f)) erros.push(loc + ': esquema "' + b.id + '" não existe (' + f + ')');
  }
}

function validarSubtema(s, d, t, existeFicheiro, erros) {
  const ctx = d + '/' + t + '/' + s.id;
  if (!s.titulo) erros.push(ctx + ': falta titulo');
  if (!naoVazio(s.ae)) erros.push(ctx + ': ae vazio');
  if (!s.minutos) erros.push(ctx + ': falta minutos');
  if (!naoVazio(s.essencial)) erros.push(ctx + ': essencial vazio');
  if (!naoVazio(s.resumo)) erros.push(ctx + ': resumo vazio');
  const quiz = Array.isArray(s.quiz) ? s.quiz : [];
  if (quiz.length < 4 || quiz.length > 6) {
    erros.push(ctx + ': quiz precisa de 4-6 perguntas (tem ' + quiz.length + ')');
  }
  (s.essencial || []).forEach((b, i) => validarBloco(b, i, d, ctx, existeFicheiro, erros));
  quiz.forEach((p, i) => validarPergunta(p, i, ctx, erros));
}

function validar({ indice, temas, ae, existeFicheiro }) {
  const erros = [];
  for (const disc of indice) {
    const d = disc.id;
    const ficheiros = (temas && temas[d]) || [];
    const cobertos = new Set();
    const idsTema = new Set();

    for (const tIdx of disc.temas) {
      const tema = ficheiros.find((x) => x.id === tIdx.id);
      if (!tema) {
        erros.push(d + '/' + tIdx.id + ': tema do índice sem ficheiro de tema');
        continue;
      }
      const idsSub = new Set();
      for (const s of tema.subtemas) {
        if (idsSub.has(s.id)) erros.push(d + '/' + tema.id + '/' + s.id + ': id de subtema duplicado');
        idsSub.add(s.id);
      }
      const doIndice = new Set(tIdx.subtemas.map((s) => s.id));
      for (const id of doIndice) {
        if (!idsSub.has(id)) erros.push(d + '/' + tema.id + '/' + id + ': subtema do índice em falta no ficheiro de tema');
      }
      for (const id of idsSub) {
        if (!doIndice.has(id)) erros.push(d + '/' + tema.id + '/' + id + ': subtema no ficheiro de tema em falta no índice');
      }
      for (const s of tema.subtemas) {
        validarSubtema(s, d, tema.id, existeFicheiro, erros);
        (s.ae || []).forEach((a) => cobertos.add(a));
      }
    }

    for (const tema of ficheiros) {
      if (idsTema.has(tema.id)) erros.push(d + '/' + tema.id + ': id de tema duplicado');
      idsTema.add(tema.id);
      if (!disc.temas.some((x) => x.id === tema.id)) {
        erros.push(d + '/' + tema.id + ': tema no ficheiro em falta no índice');
      }
    }

    for (const objetivo of (ae && ae[d]) || []) {
      if (!cobertos.has(objetivo)) erros.push(d + ': objetivo AE não coberto por nenhum subtema: "' + objetivo + '"');
    }
  }
  return erros;
}

function carregarScript(rel) {
  require(path.join(RAIZ, rel));
}

function principal() {
  const existeFicheiro = (c) => fs.existsSync(path.join(RAIZ, c));
  if (!existeFicheiro('conteudos/indice.js')) {
    console.error('Erro: conteudos/indice.js não existe.');
    return 1;
  }
  delete globalThis.Manual;
  try {
    carregarScript('js/nucleo.js');
    const Manual = globalThis.Manual;
    carregarScript('conteudos/indice.js');
    const dirEsq = path.join(RAIZ, 'esquemas');
    if (fs.existsSync(dirEsq)) {
      for (const sub of fs.readdirSync(dirEsq, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        for (const f of fs.readdirSync(path.join(dirEsq, sub.name))) {
          if (/^calculo-.*\.js$/.test(f)) carregarScript('esquemas/' + sub.name + '/' + f);
        }
      }
    }
    const temas = {};
    const ae = {};
    for (const disc of Manual.indice) {
      if (!disc.disponivel) continue;
      const d = disc.id;
      if (existeFicheiro('conteudos/' + d + '/ae.js')) carregarScript('conteudos/' + d + '/ae.js');
      ae[d] = (Manual.ae && Manual.ae[d]) || [];
      temas[d] = [];
      for (const t of disc.temas) {
        const f = Manual.ficheiroTema(d, t.id);
        if (!existeFicheiro(f)) continue;
        carregarScript(f);
        const tema = Manual.obterTema(d, t.id);
        if (tema) temas[d].push(tema);
      }
    }
    const indice = Manual.indice.filter((x) => x.disponivel);
    const erros = validar({ indice, temas, ae, existeFicheiro });
    if (erros.length) {
      for (const e of erros) console.error(e);
      console.error(erros.length + ' erro(s).');
      return 1;
    }
    let subtemas = 0;
    let perguntas = 0;
    for (const d of Object.keys(temas)) {
      for (const t of temas[d]) {
        for (const s of t.subtemas) {
          subtemas++;
          perguntas += s.quiz.length;
        }
      }
    }
    console.log('Conteúdos válidos: ' + subtemas + ' subtemas, ' + perguntas + ' perguntas');
    return 0;
  } catch (e) {
    console.error('Erro ao carregar conteúdos: ' + (e && e.message ? e.message : e));
    return 1;
  }
}

module.exports = { validar };

if (require.main === module) process.exit(principal());
