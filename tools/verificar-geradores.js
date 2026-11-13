// Verificação bloqueante dos geradores de exercícios (spec §6.2).
// Uso: npm run verificar  (2000 sementes por gerador × formato × contexto; sai com 1 se houver erros)
// Como módulo: verificar(def, { sementes, katex }) -> string[] (mensagens de erro; vazio = passa).
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const MAX_MENSAGENS = 20;
const CODIGO = /^[a-z0-9_]+$/;
const PROIBIDO = /NaN|undefined|Infinity|[−-]\s*[−-]|\+\s*[−-]/;

let katexPadrao = null;
function obterKatex() {
  if (!katexPadrao) katexPadrao = require(path.join(RAIZ, 'vendor', 'katex', 'katex.min.js'));
  return katexPadrao;
}

// Fórmulas entre $$…$$ e $…$ (ignora \$). Devolve { formulas, desequilibrado }.
function extrairFormulas(texto) {
  const formulas = [];
  let i = 0;
  let desequilibrado = false;
  while (i < texto.length) {
    if (texto[i] === '\\' && texto[i + 1] === '$') { i += 2; continue; }
    if (texto[i] !== '$') { i++; continue; }
    const delim = texto.startsWith('$$', i) ? '$$' : '$';
    const fim = texto.indexOf(delim, i + delim.length);
    if (fim < 0) { desequilibrado = true; break; }
    formulas.push(texto.slice(i + delim.length, fim));
    i = fim + delim.length;
  }
  return { formulas, desequilibrado };
}

// Textos da pergunta: [rótulo, texto, éLatex] (éLatex: o campo é todo LaTeX, sem $).
function textosDe(p) {
  const r = [['enunciado', p.enunciado, false]];
  if (p.unidade !== undefined) r.push(['unidade', p.unidade, false]);
  (p.opcoes || []).forEach((o, i) => r.push(['opcoes[' + i + ']', o, false]));
  (p.resolucaoDetalhada || []).forEach((s, i) => {
    r.push(['resolucao[' + i + '].passo', s.passo, false]);
    r.push(['resolucao[' + i + '].porque', s.porque, false]);
    if (s.calculo !== undefined) r.push(['resolucao[' + i + '].calculo', s.calculo, true]);
  });
  if (p.verificacao) {
    r.push(['verificacao.passo', p.verificacao.passo, false]);
    if (p.verificacao.calculo !== undefined) r.push(['verificacao.calculo', p.verificacao.calculo, true]);
  }
  (p.errosTipicos || []).forEach((e, i) => r.push(['errosTipicos[' + i + '].explicacao', e.explicacao, false]));
  return r;
}

function verificarEstrutura(p) {
  const e = [];
  if (typeof p.enunciado !== 'string' || p.enunciado.trim() === '') e.push('enunciado vazio');
  if (!Array.isArray(p.resolucaoDetalhada) || p.resolucaoDetalhada.length === 0) e.push('resolução vazia');
  else p.resolucaoDetalhada.forEach((s, i) => {
    if (typeof s.passo !== 'string' || !s.passo.trim() || typeof s.porque !== 'string' || !s.porque.trim()) {
      e.push('passo ' + i + ' sem passo/porque');
    }
  });
  const v = p.verificacao;
  if (!v || typeof v.passo !== 'string' || !v.passo.trim() || typeof v.calculo !== 'string' || !('valor' in v)) {
    e.push('verificacao sem { passo, calculo, valor }');
  }
  if (!Array.isArray(p.errosTipicos)) e.push('errosTipicos não é lista');
  if (p.formato === 'numerica') {
    if (typeof p.resposta !== 'number' || !Number.isFinite(p.resposta)) e.push('resposta numérica inválida');
    if (typeof p.tolerancia !== 'number' || !(p.tolerancia >= 0)) e.push('tolerancia inválida');
  } else if (p.formato === 'escolha') {
    if (!Array.isArray(p.opcoes) || p.opcoes.length < 2 || p.opcoes.some((o) => typeof o !== 'string')) e.push('opcoes inválidas');
    else if (!Number.isInteger(p.correta) || p.correta < 0 || p.correta >= p.opcoes.length) e.push('correta fora das opções');
  } else if (p.formato === 'vf') {
    if (typeof p.correta !== 'boolean') e.push('correta de vf não é booleano');
  }
  return e;
}

// Regra 2: verificacao.valor coincide com a resposta.
function regra2(p) {
  const v = p.verificacao.valor;
  if (p.formato === 'numerica') {
    if (typeof v !== 'number' || !(Math.abs(v - p.resposta) <= p.tolerancia + 1e-9)) {
      return ['verificacao.valor ' + v + ' ≠ resposta ' + p.resposta];
    }
  } else if (v !== p.correta) {
    return ['verificacao.valor ' + v + ' ≠ correta ' + p.correta];
  }
  return [];
}

// Regra 3: opções distintas, cada errada com erro típico, erros ≠ resposta, códigos válidos.
function regra3(p) {
  const e = [];
  for (const t of p.errosTipicos) {
    if (typeof t.codigo !== 'string' || !CODIGO.test(t.codigo) || t.codigo.length > 80) e.push('código de erro inválido: ' + t.codigo);
    if (typeof t.explicacao !== 'string' || !t.explicacao.trim()) e.push('erro ' + t.codigo + ' sem explicação');
  }
  if (p.formato === 'numerica') {
    for (const t of p.errosTipicos) {
      if (typeof t.valor !== 'number' || !Number.isFinite(t.valor)) e.push('erro ' + t.codigo + ' sem valor numérico');
      else if (Math.abs(t.valor - p.resposta) <= p.tolerancia + 1e-9) e.push('erro ' + t.codigo + ' dá a resposta certa (' + t.valor + ')');
    }
  } else if (p.formato === 'escolha') {
    const norm = p.opcoes.map((o) => o.replace(/\s+/g, ' ').trim());
    if (new Set(norm).size !== norm.length) e.push('opções repetidas: ' + JSON.stringify(p.opcoes));
    for (const t of p.errosTipicos) {
      if (!Number.isInteger(t.opcao) || t.opcao < 0 || t.opcao >= p.opcoes.length) e.push('erro ' + t.codigo + ' sem opção válida');
      else if (t.opcao === p.correta) e.push('erro ' + t.codigo + ' aponta a opção certa');
    }
    p.opcoes.forEach((o, i) => {
      if (i !== p.correta && !p.errosTipicos.some((t) => t.opcao === i)) e.push('opção ' + i + ' sem erro típico');
    });
  }
  return e;
}

// Regra 4: textos limpos e fórmulas aceites pelo KaTeX.
function regra4(p, katex) {
  const e = [];
  for (const [rotulo, texto, latex] of textosDe(p)) {
    if (typeof texto !== 'string') { e.push(rotulo + ' não é texto'); continue; }
    const m = texto.match(PROIBIDO);
    if (m) e.push(rotulo + ' contém "' + m[0] + '": ' + texto);
    let formulas;
    if (latex) formulas = [texto];
    else {
      const x = extrairFormulas(texto);
      if (x.desequilibrado) e.push(rotulo + ' com $ desequilibrado: ' + texto);
      formulas = x.formulas;
    }
    for (const f of formulas) {
      try {
        katex.renderToString(f, { throwOnError: true, strict: 'error' });
      } catch (err) {
        e.push(rotulo + ' rejeitado pelo KaTeX (' + String(err.message).split('\n')[0] + '): ' + f);
      }
    }
  }
  return e;
}

function listaSementes(sementes) {
  if (Array.isArray(sementes)) return sementes;
  const n = sementes === undefined ? 200 : sementes;
  return Array.from({ length: n }, (_, i) => i + 1);
}

function verificar(def, opcoes = {}) {
  const G = globalThis.Manual && globalThis.Manual.geradores;
  if (!G || typeof G.gerarDe !== 'function') throw new Error('Manual.geradores não carregado (js/geradores/registo.js)');
  const katex = opcoes.katex || obterKatex();
  const erros = [];
  let total = 0;
  const reportar = (regra, ctx, msgs) => {
    for (const m of msgs) {
      total++;
      if (erros.length < MAX_MENSAGENS) erros.push(def.id + ' [' + regra + '] ' + ctx + ': ' + m);
    }
  };
  for (const formato of def.formatos) {
    for (const contexto of G.contextosDe(def)) {
      for (const semente of listaSementes(opcoes.sementes)) {
        const ctx = 'semente ' + semente + ' formato ' + formato + ' contexto ' + contexto;
        const o = { formato, contexto };
        let p;
        try {
          p = G.gerarDe(def, semente, o);
        } catch (err) {
          reportar('gerar', ctx, ['exceção: ' + err.message]);
          continue;
        }
        const estrutura = verificarEstrutura(p);
        if (estrutura.length) { reportar('estrutura', ctx, estrutura); continue; }
        let independente;
        try { independente = def.verificarIndependente(p); } catch (err) { independente = 'exceção: ' + err.message; }
        if (independente !== true) reportar('regra 1', ctx, ['verificarIndependente devolveu ' + independente]);
        reportar('regra 2', ctx, regra2(p));
        reportar('regra 3', ctx, regra3(p));
        reportar('regra 4', ctx, regra4(p, katex));
        let dentro;
        try { dentro = def.limites(p); } catch (err) { dentro = 'exceção: ' + err.message; }
        if (dentro !== true) reportar('regra 5', ctx, ['fora dos limites declarados (' + dentro + ')']);
        let outra;
        try { outra = G.gerarDe(def, semente, o); } catch (err) { outra = { erro: err.message }; }
        if (JSON.stringify(outra) !== JSON.stringify(p)) reportar('regra 6', ctx, ['gerar duas vezes deu exercícios diferentes']);
      }
    }
  }
  if (total > erros.length) erros.push(def.id + ': … ' + total + ' erros no total');
  return erros;
}

// Ficheiros de geradores (js/geradores/**/*.js), registo e ajudas primeiro.
function ficheirosGeradores() {
  const base = path.join(RAIZ, 'js', 'geradores');
  const r = [];
  (function percorrer(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) percorrer(abs);
      else if (ent.name.endsWith('.js')) r.push(abs);
    }
  })(base);
  const primeiros = ['registo.js', 'ajudas.js'].map((f) => path.join(base, f));
  return primeiros.concat(r.filter((f) => !primeiros.includes(f)));
}

function carregarTudo() {
  delete globalThis.Manual;
  const mat = path.join(RAIZ, 'esquemas', 'mat-a');
  const calculo = fs.readdirSync(mat).filter((f) => /^calculo-.*\.js$/.test(f)).sort().map((f) => path.join(mat, f));
  const ficheiros = [path.join(RAIZ, 'js', 'aleatorio.js'), ...calculo, path.join(mat, 'formatar.js'), ...ficheirosGeradores()];
  for (const f of ficheiros) require(f);
  return globalThis.Manual;
}

function principal() {
  const M = carregarTudo();
  const defs = M.geradores.todos();
  let falhas = 0;
  for (const def of defs) {
    const erros = verificar(def, { sementes: 2000 });
    if (erros.length) {
      falhas++;
      console.error('✗ ' + def.id);
      for (const e of erros) console.error('  ' + e);
    } else {
      console.log('✓ ' + def.id);
    }
  }
  console.log(defs.length + ' geradores verificados, ' + falhas + ' com erros.');
  process.exitCode = falhas ? 1 : 0;
}

if (require.main === module) principal();

module.exports = { verificar, extrairFormulas, carregarTudo };
