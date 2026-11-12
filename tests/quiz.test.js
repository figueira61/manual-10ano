const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/quiz.js');
});

test('lerNumero aceita vírgula ou ponto como separador decimal', () => {
  assert.equal(Manual.quiz.lerNumero('2,5'), 2.5);
  assert.equal(Manual.quiz.lerNumero('2.5'), 2.5);
});

test('lerNumero ignora espaços nas pontas e internos e aceita sinal inicial', () => {
  assert.equal(Manual.quiz.lerNumero(' -3 '), -3);
  assert.equal(Manual.quiz.lerNumero('+4'), 4);
  assert.equal(Manual.quiz.lerNumero('1 000'), 1000);
});

test('lerNumero rejeita vírgula e ponto juntos, letras, vazio e dois separadores', () => {
  assert.ok(Number.isNaN(Manual.quiz.lerNumero('1.234,5')));
  assert.ok(Number.isNaN(Manual.quiz.lerNumero('abc')));
  assert.ok(Number.isNaN(Manual.quiz.lerNumero('')));
  assert.ok(Number.isNaN(Manual.quiz.lerNumero('2,5,1')));
});

const numerica = {
  tipo: 'numerica',
  enunciado: 'Quanto custa?',
  resposta: 307.58,
  tolerancia: 0.01,
  unidade: '€',
  resolucao: ['passo 1', 'passo 2'],
  explicacao: 'Porque sim.',
  verificar: () => 307.58,
};

test('corrigir numerica dentro da tolerância está certa', () => {
  assert.equal(Manual.quiz.corrigir(numerica, '307,58').certa, true);
  assert.equal(Manual.quiz.corrigir(numerica, '307.585').certa, true);
});

test('corrigir numerica fora da tolerância está errada mas válida', () => {
  const r = Manual.quiz.corrigir(numerica, '307,6');
  assert.equal(r.valida, true);
  assert.equal(r.certa, false);
});

test('corrigir numerica com texto inválido não conta como errada', () => {
  const r = Manual.quiz.corrigir(numerica, 'x');
  assert.equal(r.valida, false);
  assert.equal(r.certa, false);
});

test('corrigir numerica devolve respostaCorreta com unidade, resolução e explicação', () => {
  const r = Manual.quiz.corrigir(numerica, '307,58');
  assert.equal(r.respostaCorreta, '307,58 €');
  assert.deepEqual(r.resolucao, ['passo 1', 'passo 2']);
  assert.equal(r.explicacao, 'Porque sim.');
});

test('corrigir numerica inválida ainda devolve respostaCorreta, resolução e explicação', () => {
  const r = Manual.quiz.corrigir(numerica, 'x');
  assert.equal(r.respostaCorreta, '307,58 €');
  assert.deepEqual(r.resolucao, ['passo 1', 'passo 2']);
  assert.equal(r.explicacao, 'Porque sim.');
});

test('corrigir numerica sem tolerância usa 1e-9 e sem unidade não acrescenta espaço', () => {
  const p = { tipo: 'numerica', enunciado: 'x', resposta: 2.5, resolucao: [], verificar: () => 2.5 };
  assert.equal(Manual.quiz.corrigir(p, '2,5').certa, true);
  assert.equal(Manual.quiz.corrigir(p, '2,5000001').certa, false);
  assert.equal(Manual.quiz.corrigir(p, '2,5').respostaCorreta, '2,5');
});

test('corrigir numerica sem resolução ou explicação devolve [] e ""', () => {
  const p = { tipo: 'numerica', enunciado: 'x', resposta: 1, verificar: () => 1 };
  const r = Manual.quiz.corrigir(p, '1');
  assert.deepEqual(r.resolucao, []);
  assert.equal(r.explicacao, '');
});

const escolha = {
  tipo: 'escolha',
  enunciado: 'Qual?',
  opcoes: ['A', 'B', 'C'],
  correta: 1,
  explicacao: 'É a B.',
  resolucao: ['ver B'],
};

test('corrigir escolha com índice certo e errado', () => {
  assert.equal(Manual.quiz.corrigir(escolha, 1).certa, true);
  assert.equal(Manual.quiz.corrigir(escolha, 0).certa, false);
  assert.equal(Manual.quiz.corrigir(escolha, 0).valida, true);
});

test('corrigir escolha devolve o texto da opção correta', () => {
  const r = Manual.quiz.corrigir(escolha, 0);
  assert.equal(r.respostaCorreta, 'B');
  assert.equal(r.explicacao, 'É a B.');
  assert.deepEqual(r.resolucao, ['ver B']);
});

const vf = { tipo: 'vf', enunciado: 'Verdade?', correta: false, explicacao: 'É falso.' };

test('corrigir vf com booleano certo e errado', () => {
  assert.equal(Manual.quiz.corrigir(vf, false).certa, true);
  assert.equal(Manual.quiz.corrigir(vf, true).certa, false);
});

test('corrigir vf devolve Verdadeiro/Falso como respostaCorreta', () => {
  assert.equal(Manual.quiz.corrigir(vf, true).respostaCorreta, 'Falso');
  assert.equal(Manual.quiz.corrigir({ ...vf, correta: true }, true).respostaCorreta, 'Verdadeiro');
});

test('lerNumero aceita o sinal menos tipográfico (U+2212)', () => {
  assert.equal(Manual.quiz.lerNumero('\u22123,5'), -3.5);
  assert.equal(Manual.quiz.lerNumero(' \u22122 '), -2);
});

test('corrigir numerica na fronteira da tolerância está certa', () => {
  assert.equal(Manual.quiz.corrigir(numerica, '307,59').certa, true);
  assert.equal(Manual.quiz.corrigir(numerica, '307,57').certa, true);
  assert.equal(Manual.quiz.corrigir(numerica, '307,60').certa, false);
});

test('corrigir numerica formata a resposta negativa com o sinal menos tipográfico', () => {
  const p = { tipo: 'numerica', enunciado: 'x', resposta: -1.5, verificar: () => -1.5 };
  assert.equal(Manual.quiz.corrigir(p, '-1,5').respostaCorreta, '\u22121,5');
  assert.equal(Manual.quiz.corrigir(p, '\u22121,5').certa, true);
});

test('ordemOpcoes devolve uma permutação de 0..n-1', () => {
  let s = 0;
  const aleatorio = () => { s = (s * 7 + 3) % 10; return s / 10; };
  const o = Manual.quiz.ordemOpcoes(5, aleatorio);
  assert.deepEqual([...o].sort(), [0, 1, 2, 3, 4]);
});

test('ordemOpcoes é determinística com aleatorio injetado e embaralha', () => {
  assert.deepEqual(Manual.quiz.ordemOpcoes(4, () => 0), [1, 2, 3, 0]);
  assert.deepEqual(Manual.quiz.ordemOpcoes(4, () => 0.999), [0, 1, 2, 3]);
  assert.deepEqual(Manual.quiz.ordemOpcoes(0), []);
  assert.deepEqual(Manual.quiz.ordemOpcoes(1), [0]);
});

test('construirTentativa devolve a tentativa do mini-quiz com os valores exatos', () => {
  const contexto = { disciplina: 'mat-a', tema: 'funcoes', subtema: 'afim' };
  const pergunta = { tipo: 'numerica', enunciado: '?', resposta: 1 };
  const t = Manual.quiz.construirTentativa(contexto, pergunta, 2, 'certa', 4321, 'sessao-1');
  assert.deepEqual(t, {
    disciplina: 'mat-a',
    tema: 'funcoes',
    subtema: 'afim',
    tipo: 'afim#q2',
    semente: null,
    formato: 'numerica',
    modo: 'quiz',
    nivel_ajuda: 2,
    resultado: 'certa',
    primeira_tentativa: true,
    viu_resolucao: false,
    usou_pista: false,
    erro_tipico: null,
    duracao_ms: 4321,
    sessao_id: 'sessao-1',
  });
});
