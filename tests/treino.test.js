const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregarTudo } = require('../tools/verificar-geradores.js');

const RAIZ = path.join(__dirname, '..');
const M = carregarTudo();
for (const f of ['js/nucleo.js', 'conteudos/indice.js', 'js/aprendizagem.js', 'js/selecao.js', 'js/miniquiz.js', 'js/treino.js']) require(path.join(RAIZ, f));
const T = M.treino;
const rng = (s) => M.aleatorio.criar(s);
const agora = new Date('2026-11-14T12:00:00Z');

const matA = M.indice.find((d) => d.id === 'mat-a');
const comGeradores = [];
matA.temas.forEach((t) => t.subtemas.forEach((s) => {
  if (M.geradores.doSubtema('mat-a', s.id).length) comGeradores.push('mat-a/' + t.id + '/' + s.id);
}));
const [k1, k2, k3, k4] = comGeradores;

const tent = (resultado, i, extra) => Object.assign({
  disciplina: 'mat-a', tema: 'funcoes', subtema: 'afim', tipo: 'x', semente: i, formato: 'numerica',
  modo: 'treino', resultado, criado_em: new Date(Date.UTC(2026, 10, 1, 10, i)).toISOString(),
}, extra);

test('nivelInicial', () => {
  assert.equal(T.nivelInicial('nao_resolvido'), 0);
  assert.equal(T.nivelInicial('dificuldade'), 1);
  assert.equal(T.nivelInicial('domina'), 2);
  assert.equal(T.nivelInicial(null), 1);
});

test('nivelAtual: duas certas sobem, errada desce, quiz não conta', () => {
  const k = 'mat-a/funcoes/afim';
  const h = [tent('certa', 1), tent('certa', 2)];
  assert.equal(T.nivelAtual(h, k, 'dificuldade'), 2);
  assert.equal(T.nivelAtual(h.concat([tent('errada', 3)]), k, 'dificuldade'), 1);
  const comQuiz = h.concat([tent('errada', 3, { modo: 'quiz' })]);
  assert.equal(T.nivelAtual(comQuiz, k, 'dificuldade'), 2);
  assert.equal(T.nivelAtual([tent('certa', 1, { subtema: 'outro' }), tent('certa', 2, { subtema: 'outro' })], k, 'dificuldade'), 1);
  // a janela recomeça quando o nível muda: duas certas, subida, uma certa não sobe outra vez
  assert.equal(T.nivelAtual([tent('certa', 1), tent('certa', 2), tent('certa', 3)], k, 'nao_resolvido'), 1);
});

test('sugestao sem estados: primeiros subtemas de Matemática A, por ordem do índice', () => {
  assert.deepEqual(T.sugestao([], M.indice, agora), comGeradores.slice(0, 3));
  assert.equal(T.sugestao([], M.indice, agora, 2).length, 2);
});

test('sugestao: nao_resolvido antes de dificuldade', () => {
  const r = T.sugestao([{ chave: k1, estado: 'dificuldade' }, { chave: k2, estado: 'nao_resolvido' }], M.indice, agora);
  assert.ok(r.indexOf(k2) >= 0 && r.indexOf(k2) < r.indexOf(k1));
  assert.equal(r.length, 3);
  assert.equal(new Set(r).size, 3);
});

test('sugestao: chave em revisão hoje vem primeiro', () => {
  const r = T.sugestao([
    { chave: k1, estado: 'nao_resolvido', proxima_revisao: null },
    { chave: k3, estado: 'domina', proxima_revisao: '2026-11-14' },
  ], M.indice, agora);
  assert.equal(r[0], k3);
  assert.equal(new Set(r).size, r.length);
});

test('sugestao: tudo dominado e sem revisão não fica vazio; chaves sem geradores ficam de fora', () => {
  // com fqa disponível, as chaves com geradores são as de todas as disciplinas
  const todas = [];
  M.indice.filter((d) => d.disponivel).forEach((d) => d.temas.forEach((t) => t.subtemas.forEach((s) => {
    if (M.geradores.doSubtema(d.id, s.id).length) todas.push(d.id + '/' + t.id + '/' + s.id);
  })));
  assert.ok(todas.some((k) => k.startsWith('fqa/')));
  const estados = todas.map((chave) => ({ chave, estado: 'domina', proxima_revisao: '2099-01-01' }));
  estados.push({ chave: 'mat-a/xx/yy', estado: 'nao_resolvido' });
  const r = T.sugestao(estados, M.indice, agora);
  assert.ok(r.length > 0);
  r.forEach((k) => assert.ok(todas.includes(k)));
});

test('montarTreino: uma chave dá 9 perguntas sem pares (tipo, semente) repetidos', () => {
  const p = T.montarTreino([k1], [], { n: 9, rng: rng(1) });
  assert.equal(p.length, 9);
  p.forEach((q) => assert.equal(q.chave, k1));
  assert.equal(new Set(p.map((q) => q.id + ':' + q.semente)).size, 9);
});

test('montarTreino: duas chaves repartem 5/4', () => {
  const p = T.montarTreino([k1, k2], [], { n: 9, rng: rng(2) });
  assert.equal(p.length, 9);
  assert.equal(p.filter((q) => q.chave === k1).length, 5);
  assert.equal(p.filter((q) => q.chave === k2).length, 4);
});

test('montarTreino: n limitado a 8-10', () => {
  assert.equal(T.montarTreino([k1, k2, k3], [], { n: 20, rng: rng(3) }).length, 10);
  assert.equal(T.montarTreino([k1], [], { n: 2, rng: rng(3) }).length, 8);
});

test('montarTreino: chave sem geradores passa as vagas às outras', () => {
  const p = T.montarTreino(['mat-a/xx/yy', k1], [], { n: 9, rng: rng(4) });
  assert.equal(p.length, 9);
  p.forEach((q) => assert.equal(q.chave, k1));
});

test('resumo: melhorias, dificuldades e próximas revisões', () => {
  const r = T.resumo(
    [{ chave: k1, resultado: 'errada' }, { chave: k1, resultado: 'certa' }, { chave: k2, resultado: 'errada' }, { chave: k3, resultado: 'certa' }],
    { [k1]: 'dificuldade', [k2]: 'dificuldade', [k3]: null },
    { [k1]: { estado: 'domina', proxima_revisao: '2026-11-17' }, [k2]: { estado: 'dificuldade', proxima_revisao: '2026-11-15' }, [k3]: null },
  );
  assert.deepEqual(r.melhorias, [k1]);
  assert.deepEqual(r.dificuldades, [k2]);
  assert.deepEqual(r.proximas, [{ chave: k1, proxima_revisao: '2026-11-17' }, { chave: k2, proxima_revisao: '2026-11-15' }]);
});

test('montarTreino: 9 perguntas únicas em todas as chaves e várias sementes', () => {
  for (const k of comGeradores) {
    for (let s = 0; s < 5; s++) {
      const p = T.montarTreino([k], [], { n: 9, rng: rng(s) });
      assert.equal(p.length, 9, k);
      assert.equal(new Set(p.map((q) => q.id + ':' + q.semente)).size, 9, k);
    }
  }
});

const histDe = (chave, perguntas, resultado, extra) => {
  const [disciplina, tema, subtema] = chave.split('/');
  return perguntas.map((q, i) => Object.assign({
    disciplina, tema, subtema, tipo: q.id, semente: q.semente, formato: q.formato, contexto: q.contexto,
    modo: 'treino', resultado, criado_em: new Date(Date.UTC(2026, 10, 1, 10, i)).toISOString(),
  }, extra));
};

test('montarTreino: nunca repete uma semente já vista no mesmo tipo', () => {
  for (const k of [k1, k4]) {
    const antes = T.montarTreino([k], [], { n: 9, rng: rng(7) });
    const hist = histDe(k, antes, 'certa');
    const vistos = new Set(antes.map((q) => q.id + ':' + q.semente));
    for (let s = 0; s < 10; s++) {
      const depois = T.montarTreino([k], hist, { n: 9, rng: rng(s) });
      assert.ok(depois.length > 0);
      depois.forEach((q) => assert.ok(!vistos.has(q.id + ':' + q.semente), 'repetido ' + q.id + ':' + q.semente));
    }
  }
});

// subtema com um gerador de vários formatos, para o erro poder mudar de formato
const kMulti = comGeradores.find((k) => M.geradores.doSubtema('mat-a', k.split('/')[2]).some((d) => d.formatos.length > 1));
const defMulti = M.geradores.doSubtema('mat-a', kMulti.split('/')[2]).find((d) => d.formatos.length > 1);
const erroEm = (formato) => histDe(kMulti, [{ id: defMulti.id, semente: 123456, formato }], 'errada')[0];

test('montarTreino: a primeira pergunta depois de um erro tem a mesma competência noutro formato', () => {
  const hist = [erroEm(defMulti.formatos[0])];
  for (let s = 0; s < 20; s++) {
    const p = T.montarTreino([kMulti], hist, { n: 9, rng: rng(s) });
    assert.equal(p[0].competencia, defMulti.tipo);
    assert.notEqual(p[0].formato, defMulti.formatos[0]);
  }
});

test('aposErro: troca a próxima pergunta da mesma chave, mantendo o tamanho', () => {
  for (let s = 0; s < 10; s++) {
    const ps = T.montarTreino([kMulti, k1], [], { n: 9, rng: rng(s) });
    const i = ps.findIndex((q) => q.chave === kMulti);
    const j = ps.findIndex((q, x) => x > i && q.chave === kMulti);
    const copia = ps.slice();
    const ref = ps;
    assert.equal(T.aposErro(ps, i, [], rng(s + 100)), true);
    assert.equal(ps, ref);
    assert.equal(ps.length, copia.length);
    ps.forEach((q, x) => { if (x !== j) assert.equal(q, copia[x], 'só o índice ' + j + ' muda'); });
    const nova = ps[j];
    assert.equal(nova.chave, kMulti);
    assert.equal(nova.competencia, copia[i].competencia);
    const mesmoPar = (a) => a.id + ':' + a.semente;
    assert.equal(copia.concat(ps.filter((_, x) => x !== j)).filter((q) => mesmoPar(q) === mesmoPar(nova)).length, 0);
    const defs = M.geradores.doSubtema('mat-a', kMulti.split('/')[2]);
    const variantes = defs.some((d) => d.tipo === copia[i].competencia && (d.formatos.length > 1 || M.geradores.contextosDe(d).length > 1));
    if (variantes) assert.ok(nova.formato !== copia[i].formato || nova.contexto !== copia[i].contexto);
  }
});

test('aposErro: false e array intacto sem pergunta posterior da mesma chave', () => {
  const ps = T.montarTreino([kMulti, k1], [], { n: 9, rng: rng(5) });
  const ultimo = ps.map((q) => q.chave).lastIndexOf(kMulti);
  const copia = ps.slice();
  assert.equal(T.aposErro(ps, ultimo, [], rng(1)), false);
  assert.deepEqual(ps, copia);
  assert.equal(T.aposErro(ps, 99, [], rng(1)), false);
});

test('aposErro: não devolve pares presentes no histórico', () => {
  const ps = T.montarTreino([kMulti], [], { n: 9, rng: rng(3) });
  const hist = histDe(kMulti, T.montarTreino([kMulti], [], { n: 9, rng: rng(4) }), 'certa');
  const vistos = new Set(hist.map((t) => t.tipo + ':' + t.semente));
  assert.equal(T.aposErro(ps, 0, hist, rng(9)), true);
  assert.ok(!vistos.has(ps[1].id + ':' + ps[1].semente));
});
