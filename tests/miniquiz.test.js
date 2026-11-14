const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregarTudo } = require('../tools/verificar-geradores.js');

const RAIZ = path.join(__dirname, '..');
const M = carregarTudo();
for (const f of ['js/aprendizagem.js', 'js/selecao.js', 'js/miniquiz.js']) require(path.join(RAIZ, f));
const Q = M.miniquiz;

const SUB = 'afim';
const banco = (n) => Array.from({ length: n }, (_, i) => ({
  id: SUB + '-q' + String(i + 1).padStart(2, '0'), tipo: 'escolha', enunciado: '?', opcoes: ['a', 'b'], correta: 0,
}));
const defs = M.geradores.doSubtema('mat-a', SUB);
const rng = (s) => M.aleatorio.criar(s);

test('candidatos: um por gerador × formato × contexto e um por pergunta de banco', () => {
  const b = banco(4);
  const c = Q.candidatos('mat-a', SUB, b, rng(1));
  const esperados = defs.reduce((s, d) => s + d.formatos.length * M.geradores.contextosDe(d).length, 0);
  assert.equal(c.filter((x) => x.gerador).length, esperados);
  assert.equal(c.filter((x) => x.banco).length, 4);
  const g = c.find((x) => x.gerador);
  const def = M.geradores.obter(g.gerador);
  assert.equal(g.tipo, def.id);
  assert.equal(g.competencia, def.tipo);
  assert.ok(def.formatos.includes(g.formato));
  assert.ok(Number.isInteger(g.semente) && g.semente >= 0 && g.semente < 4294967296);
  const k = c.find((x) => x.banco);
  assert.deepEqual([k.tipo, k.competencia, k.formato, k.banco], [b[0].id, b[0].id, 'escolha', b[0]]);
  // rng fixo -> mesmas sementes
  assert.deepEqual(Q.candidatos('mat-a', SUB, b, rng(1)).map((x) => x.semente), c.map((x) => x.semente));
});

test('montarPerguntas: 5 perguntas, tipos distintos, >= 3 geradas com erros típicos e resolução detalhada', () => {
  for (let s = 0; s < 60; s++) {
    const p = Q.montarPerguntas('mat-a', SUB, banco(5), [], { n: 5, rng: rng(s) });
    assert.equal(p.length, 5);
    assert.equal(new Set(p.map((x) => x.id)).size, 5);
    const geradas = p.filter((x) => x.gerador);
    assert.ok(geradas.length >= 3, 'seed ' + s + ': ' + geradas.length + ' geradas');
    for (const g of geradas) {
      assert.ok(Array.isArray(g.errosTipicos));
      assert.ok(g.resolucaoDetalhada.length > 0);
      assert.ok(g.resolucaoDetalhada.every((x) => typeof x.passo === 'string' && typeof x.porque === 'string'));
      assert.ok(Number.isInteger(g.semente));
    }
  }
});

test('montarPerguntas: com banco grande continua a garantir >= 3 geradas', () => {
  for (let s = 0; s < 60; s++) {
    const p = Q.montarPerguntas('mat-a', SUB, banco(30), [], { n: 5, rng: rng(s) });
    assert.equal(p.length, 5);
    assert.equal(new Set(p.map((x) => x.id)).size, 5);
    assert.ok(p.filter((x) => x.gerador).length >= 3);
  }
});

test('montarPerguntas: mesma semente e formato -> exatamente o mesmo exercício', () => {
  const a = Q.montarPerguntas('mat-a', SUB, banco(5), [], { rng: rng(7) });
  const b = Q.montarPerguntas('mat-a', SUB, banco(5), [], { rng: rng(7) });
  assert.deepEqual(a, b);
});

test('montarPerguntas: uma semente vista no histórico nunca volta', () => {
  for (let s = 0; s < 30; s++) {
    const primeira = Q.montarPerguntas('mat-a', SUB, banco(5), [], { rng: rng(s) });
    const hist = primeira.filter((x) => x.gerador).map((x, i) => ({
      id: 'h' + i, tipo: x.id, semente: x.semente, resultado: 'certa', primeira_tentativa: true,
      criado_em: new Date(Date.UTC(2026, 10, 1, 10, i)).toISOString(),
    }));
    // mesmo rng -> os candidatos têm as mesmas sementes; as vistas ficam de fora
    const segunda = Q.montarPerguntas('mat-a', SUB, banco(5), hist, { rng: rng(s) });
    for (const x of segunda.filter((y) => y.gerador)) {
      assert.ok(!hist.some((h) => h.tipo === x.id && h.semente === x.semente), 'semente repetida em ' + x.id);
    }
    assert.ok(segunda.filter((x) => x.gerador).length >= 3);
  }
});

test('montarPerguntas: ultimoErro -> 1.ª pergunta da mesma competência noutro formato', () => {
  const def = defs.find((d) => d.formatos.length >= 2);
  const ult = { competencia: def.tipo, formato: def.formatos[0] };
  for (let s = 0; s < 40; s++) {
    const p = Q.montarPerguntas('mat-a', SUB, banco(5), [], { rng: rng(s), ultimoErro: ult });
    assert.equal(p[0].competencia, def.tipo);
    assert.notEqual(p[0].formato, def.formatos[0]);
    assert.ok(p.filter((x) => x.gerador).length >= 3);
  }
});

test('montarPerguntas: subtema sem geradores usa só o banco', () => {
  const b = banco(6).map((x) => Object.assign({}, x, { id: x.id.replace(SUB, 'xpto') }));
  const p = Q.montarPerguntas('mat-a', 'xpto', b, [], { rng: rng(3) });
  assert.equal(p.length, 5);
  assert.ok(p.every((x) => b.includes(x)));
});

test('ultimoErroDe: última tentativa do subtema errada num gerador -> competência e formato', () => {
  const def = defs[0];
  const h = [
    { id: 'a', disciplina: 'mat-a', subtema: SUB, tipo: def.id, formato: def.formatos[0], resultado: 'errada', criado_em: '2026-11-01T10:00:00Z' },
    { id: 'b', disciplina: 'mat-a', subtema: 'outro', tipo: 'x', formato: 'vf', resultado: 'certa', criado_em: '2026-11-01T11:00:00Z' },
  ];
  assert.deepEqual(Q.ultimoErroDe('mat-a', SUB, h), { competencia: def.tipo, formato: def.formatos[0] });
  h.push({ id: 'c', disciplina: 'mat-a', subtema: SUB, tipo: def.id, formato: def.formatos[0], resultado: 'certa', criado_em: '2026-11-01T12:00:00Z' });
  assert.equal(Q.ultimoErroDe('mat-a', SUB, h), null);
  // errada numa pergunta de banco: não força repetir a mesma pergunta
  assert.equal(Q.ultimoErroDe('mat-a', SUB, [{ id: 'd', disciplina: 'mat-a', subtema: SUB, tipo: 'afim-q01', formato: 'escolha', resultado: 'errada', criado_em: '2026-11-01T10:00:00Z' }]), null);
  assert.equal(Q.ultimoErroDe('mat-a', SUB, []), null);
  assert.equal(Q.ultimoErroDe('mat-a', SUB, null), null);
});
