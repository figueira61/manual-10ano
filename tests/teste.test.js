const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregarTudo } = require('../tools/verificar-geradores.js');

const RAIZ = path.join(__dirname, '..');
const M = carregarTudo();
for (const f of ['js/nucleo.js', 'conteudos/indice.js', 'js/aprendizagem.js', 'js/selecao.js', 'js/miniquiz.js', 'js/treino.js', 'js/teste.js']) require(path.join(RAIZ, f));
const T = M.teste;
const rng = (s) => M.aleatorio.criar(s);
const porTema = (ps) => ps.reduce((o, p) => { const t = p.chave.split('/')[1]; o[t] = (o[t] || 0) + 1; return o; }, {});

test('TAMANHOS', () => assert.deepEqual(T.TAMANHOS, [10, 15, 20]));

test('montarTeste: 10 com 2 temas dá 5/5, sem tipos repetidos e com chave', () => {
  for (let s = 0; s < 10; s++) {
    const r = T.montarTeste('mat-a', ['funcoes', 'estatistica'], 10, [], rng(s));
    assert.equal(r.pedidas, 10);
    assert.equal(r.perguntas.length, 10);
    assert.deepEqual(porTema(r.perguntas), { funcoes: 5, estatistica: 5 });
    assert.equal(new Set(r.perguntas.map((p) => p.id)).size, 10);
    assert.ok(r.perguntas.every((p) => /^mat-a\/(funcoes|estatistica)\/[^/]+$/.test(p.chave)));
  }
});

test('montarTeste: 15 com 3 temas dá 5/5/5', () => {
  const temas = M.indice.find((d) => d.id === 'mat-a').temas.map((t) => t.id).slice(0, 3);
  const r = T.montarTeste('mat-a', temas, 15, [], rng(3));
  const c = porTema(r.perguntas);
  assert.deepEqual(temas.map((t) => c[t]), [5, 5, 5]);
});

test('montarTeste: ignora sementes já vistas no mesmo tipo', () => {
  const a = T.montarTeste('mat-a', ['funcoes'], 5, [], rng(7));
  const hist = a.perguntas.map((p) => ({ tipo: p.id, semente: p.semente }));
  const b = T.montarTeste('mat-a', ['funcoes'], 5, hist, rng(7));
  const vistos = new Set(hist.map((h) => h.tipo + ':' + h.semente));
  assert.ok(b.perguntas.every((p) => !vistos.has(p.id + ':' + p.semente)));
});

test('montarTeste: tema com poucos tipos é completado pelos outros; sem tipos suficientes, faltam perguntas', () => {
  const fun = M.geradores.doSubtema('mat-a', 'afim').slice(0, 2).map((d) => d.id);
  const orig = M.geradores.doSubtema;
  // Tema "funcoes" reduzido a 2 tipos: simulado por um doSubtema que só devolve 2 geradores nesse tema.
  const fT = M.indice.find((d) => d.id === 'mat-a').temas.find((t) => t.id === 'funcoes');
  const subs = new Set(fT.subtemas.map((s) => s.id));
  M.geradores.doSubtema = (d, s) => {
    const todos = orig.call(M.geradores, d, s);
    if (!subs.has(s)) return todos;
    return todos.filter((x) => fun.includes(x.id));
  };
  try {
    const r = T.montarTeste('mat-a', ['funcoes', 'estatistica'], 10, [], rng(1));
    const c = porTema(r.perguntas);
    assert.ok(c.funcoes <= 2);
    assert.equal(r.perguntas.length, 10);
    assert.equal(new Set(r.perguntas.map((p) => p.id)).size, 10);
    const r2 = T.montarTeste('mat-a', ['funcoes'], 10, [], rng(1));
    assert.ok(r2.perguntas.length < r2.pedidas);
    assert.equal(r2.pedidas, 10);
  } finally { M.geradores.doSubtema = orig; }
});

test('montarTeste: candidato que falha a gerar é trocado por outro do mesmo tema', () => {
  const orig = M.treino.materializar;
  let falhas = 0;
  M.treino.materializar = (c) => (falhas++ < 2 ? null : orig(c));
  try {
    const r = T.montarTeste('mat-a', ['funcoes'], 5, [], rng(2));
    assert.equal(r.perguntas.length, 5);
    assert.equal(new Set(r.perguntas.map((p) => p.id)).size, 5);
  } finally { M.treino.materializar = orig; }
});

test('nota', () => {
  assert.deepEqual(T.nota(7, 10), { valores: 14, percentagem: 70 });
  assert.deepEqual(T.nota(2, 3), { valores: 13.3, percentagem: 67 });
  assert.deepEqual(T.nota(0, 0), { valores: 0, percentagem: 0 });
});


test('temasARever: só temas abaixo de 50 %, do pior para o melhor', () => {
  const r = (tema, resultado) => ({ pergunta: { chave: 'mat-a/' + tema + '/x' }, resultado });
  const f = [r('funcoes', 'certa'), r('funcoes', 'errada'), r('funcoes', 'errada'), r('funcoes', 'errada')];
  const e = [r('estatistica', 'certa'), r('estatistica', 'certa'), r('estatistica', 'certa'), r('estatistica', 'errada')];
  assert.deepEqual(T.temasARever(f.concat(e)), [{ tema: 'funcoes', certas: 1, total: 4 }]);
  const g = [r('geometria', 'errada'), r('geometria', 'errada')];
  assert.deepEqual(T.temasARever(f.concat(e, g)).map((x) => x.tema), ['geometria', 'funcoes']);
  assert.deepEqual(T.temasARever([r('a', 'certa'), r('a', 'errada')]), []);
});
