const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const CHAVE = 'manual10.progresso.v1';
const CHAVE_SUBTEMA = 'mat-a/funcoes/quadratica';

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/progresso.js');
});

// Armazenamento falso em memória, com a mesma forma de localStorage.
function armazenamentoFalso(inicial) {
  const dados = new Map();
  if (inicial !== undefined) dados.set(CHAVE, inicial);
  return {
    dados,
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
  };
}

test('marcar e ler um subtema como lido', () => {
  const p = Manual.criarProgresso(armazenamentoFalso());
  assert.equal(p.lido(CHAVE_SUBTEMA), false);
  p.marcarLido(CHAVE_SUBTEMA);
  assert.equal(p.lido(CHAVE_SUBTEMA), true);
  assert.equal(p.lido('mat-a/funcoes/outra'), false);
});

test('o estado persiste entre duas instâncias com o mesmo armazenamento', () => {
  const arm = armazenamentoFalso();
  Manual.criarProgresso(arm).marcarLido(CHAVE_SUBTEMA);
  Manual.criarProgresso(arm).registarQuiz(CHAVE_SUBTEMA, 3, 5);

  const nova = Manual.criarProgresso(arm);
  assert.equal(nova.lido(CHAVE_SUBTEMA), true);
  assert.deepEqual(nova.melhorQuiz(CHAVE_SUBTEMA), { certas: 3, total: 5 });

  const gravado = JSON.parse(arm.dados.get(CHAVE));
  assert.deepEqual(gravado, {
    lidos: { [CHAVE_SUBTEMA]: true },
    quizzes: { [CHAVE_SUBTEMA]: { certas: 3, total: 5 } },
  });
});

test('melhorQuiz mantém 4/5 depois de registar 3/5', () => {
  const p = Manual.criarProgresso(armazenamentoFalso());
  p.registarQuiz(CHAVE_SUBTEMA, 4, 5);
  p.registarQuiz(CHAVE_SUBTEMA, 3, 5);
  assert.deepEqual(p.melhorQuiz(CHAVE_SUBTEMA), { certas: 4, total: 5 });
});

test('registarQuiz substitui por uma proporção superior', () => {
  const p = Manual.criarProgresso(armazenamentoFalso());
  p.registarQuiz(CHAVE_SUBTEMA, 3, 5);
  p.registarQuiz(CHAVE_SUBTEMA, 5, 5);
  assert.deepEqual(p.melhorQuiz(CHAVE_SUBTEMA), { certas: 5, total: 5 });
});

test('melhorQuiz sem quizzes feitos devolve null', () => {
  const p = Manual.criarProgresso(armazenamentoFalso());
  assert.equal(p.melhorQuiz(CHAVE_SUBTEMA), null);
});

test('armazenamento cujo getItem lança: não lança e funciona em memória', () => {
  const arm = {
    getItem: () => {
      throw new Error('bloqueado');
    },
    setItem: () => {
      throw new Error('bloqueado');
    },
  };
  let p;
  assert.doesNotThrow(() => {
    p = Manual.criarProgresso(arm);
  });
  assert.doesNotThrow(() => p.marcarLido(CHAVE_SUBTEMA));
  assert.equal(p.lido(CHAVE_SUBTEMA), true);
  assert.doesNotThrow(() => p.registarQuiz(CHAVE_SUBTEMA, 2, 4));
  assert.deepEqual(p.melhorQuiz(CHAVE_SUBTEMA), { certas: 2, total: 4 });
});

test('setItem a lançar não interrompe o estado em memória', () => {
  const arm = {
    getItem: () => null,
    setItem: () => {
      throw new Error('cheio');
    },
  };
  const p = Manual.criarProgresso(arm);
  assert.doesNotThrow(() => p.marcarLido(CHAVE_SUBTEMA));
  assert.equal(p.lido(CHAVE_SUBTEMA), true);
});

test('getItem devolve JSON corrompido: começa vazio', () => {
  const p = Manual.criarProgresso(armazenamentoFalso('{corrompido'));
  assert.equal(p.lido(CHAVE_SUBTEMA), false);
  assert.equal(p.melhorQuiz(CHAVE_SUBTEMA), null);
  p.marcarLido(CHAVE_SUBTEMA);
  assert.equal(p.lido(CHAVE_SUBTEMA), true);
});

test('armazenamento null: funciona em memória', () => {
  const p = Manual.criarProgresso(null);
  p.marcarLido(CHAVE_SUBTEMA);
  p.registarQuiz(CHAVE_SUBTEMA, 1, 2);
  assert.equal(p.lido(CHAVE_SUBTEMA), true);
  assert.deepEqual(p.melhorQuiz(CHAVE_SUBTEMA), { certas: 1, total: 2 });
});
