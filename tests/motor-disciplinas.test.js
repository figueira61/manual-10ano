// Fase 3A, tarefa 1: várias disciplinas, notação científica com tolerância relativa e figura no enunciado.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const CAMINHO_HARNESS = path.join(__dirname, '..', 'tools', 'verificar-geradores.js');

// ---------- lerNumero e corrigir ----------

test('lerNumero: notação científica (E, e, ×10^, x 10^, ×10 em sobrescrito)', () => {
  const M = carregar('js/quiz.js');
  for (const t of ['6,02e23', '6.02E23', '6,02×10^23', '6,02 x 10^23', '6,02*10^23', '6,02×10²³', '6,02 × 10 ^ 23', '6,02E+23']) {
    assert.equal(M.quiz.lerNumero(t), 6.02e23, t);
  }
  assert.equal(M.quiz.lerNumero('1,6×10⁻¹⁹'), 1.6e-19);
  assert.equal(M.quiz.lerNumero('1,6e-19'), 1.6e-19);
  assert.equal(M.quiz.lerNumero('−1,6×10^−19'), -1.6e-19);
  assert.equal(M.quiz.lerNumero('2,5'), 2.5);
});

test('lerNumero: notações científicas incompletas ou absurdas dão NaN', () => {
  const M = carregar('js/quiz.js');
  for (const t of ['6,02×10^', '6,02e', '×10^3', '6,02×10', '6,02×10^2,5', '1e999', 'e23', '6,02×10²a']) {
    assert.ok(Number.isNaN(M.quiz.lerNumero(t)), t);
  }
});

test('corrigir: toleranciaRelativa, e com as duas basta cumprir uma', () => {
  const M = carregar('js/quiz.js');
  const p = { tipo: 'numerica', enunciado: 'x', resposta: 6.02e23, toleranciaRelativa: 0.005 };
  assert.equal(M.quiz.corrigir(p, '6,03e23').certa, true);
  assert.equal(M.quiz.corrigir(p, '6,02e22').certa, false);
  assert.equal(M.quiz.corrigir(p, '6,02e22').valida, true);
  const ambas = { tipo: 'numerica', enunciado: 'x', resposta: 100, tolerancia: 0.5, toleranciaRelativa: 0.1 };
  assert.equal(M.quiz.corrigir(ambas, '109').certa, true); // só a relativa
  assert.equal(M.quiz.corrigir(ambas, '111').certa, false);
  const abs = { tipo: 'numerica', enunciado: 'x', resposta: 0.001, tolerancia: 0.5, toleranciaRelativa: 0.01 };
  assert.equal(M.quiz.corrigir(abs, '0,4').certa, true); // só a absoluta
  assert.equal(M.quiz.corrigir({ tipo: 'numerica', enunciado: 'x', resposta: 5, tolerancia: 0 }, '5,1').certa, false);
});

test('corrigir: a resposta correta com tolerância relativa aparece em notação científica legível', () => {
  const M = carregar('js/quiz.js');
  const p = { tipo: 'numerica', gerador: 'g', enunciado: 'x', resposta: 6.02e23, toleranciaRelativa: 0.005, unidade: 'mol' };
  const texto = M.quiz.corrigir(p, '1').respostaCorreta;
  assert.equal(texto, '6,02×10²³ mol');
  assert.equal(M.quiz.lerNumero(texto.split(' ')[0]), 6.02e23);
  assert.equal(M.quiz.textoNumero({ gerador: 'g', resposta: 1.6e-19, toleranciaRelativa: 0.01 }), '1,6×10⁻¹⁹');
});

// ---------- registo, ajudas e harness ----------

const FICHEIROS_GER = ['js/nucleo.js', 'js/aleatorio.js', 'esquemas/mat-a/formatar.js', 'js/geradores/registo.js', 'js/geradores/ajudas.js'];

function defGrande(extra = {}) {
  const G = globalThis.Manual.geradores;
  return Object.assign({
    id: 'teste-grande', disciplina: 'mat-a', tema: 'testes', subtema: 'grandes', tipo: 'grande',
    nome: 'Valor muito grande', formatos: ['numerica'],
    gerar(semente, { rng }) {
      const a = G.ajudas.entre(rng, 2, 9);
      const r = a * 1e20;
      return {
        enunciado: 'Qual é o valor de $' + a + ' \\times 10^{20}$?',
        resolucao: [{ passo: 'Ler', porque: 'Lê-se diretamente.', calculo: a + ' \\times 10^{20}' }],
        verificacao: { passo: 'Conferir', calculo: a + ' \\times 10^{20}', valor: r },
        resposta: r, toleranciaRelativa: 0.005,
        errosTipicos: [{ codigo: 'expoente_menos_um', valor: r / 10, explicacao: 'Esqueceste-te de um expoente.' }],
        dados: { a },
      };
    },
    verificarIndependente: (p) => Math.abs(p.resposta - p.dados.a * 1e20) <= 0.005 * p.dados.a * 1e20,
    limites: () => true,
  }, extra);
}

let M, verificar;
beforeEach(() => {
  M = carregar(...FICHEIROS_GER);
  delete require.cache[CAMINHO_HARNESS];
  verificar = require(CAMINHO_HARNESS).verificar;
});

test('tolMeiaUnidade: meia unidade do último algarismo significativo', () => {
  const t = M.geradores.ajudas.tolMeiaUnidade;
  assert.equal(t(0.5, 2), 0.005);
  assert.equal(t(1234, 2), 50);
  assert.equal(t(6.02e23, 3), 0.5e21);
  assert.equal(t(-0.0456, 2), 0.0005);
});

test('registo: toleranciaRelativa e figuraEnunciado passam para a pergunta', () => {
  M.geradores.registar(defGrande({
    gerar: (s, o) => Object.assign(defGrande().gerar(s, o), { figuraEnunciado: { id: 'afim', opcoes: { a: 1 } } }),
  }));
  const p = M.geradores.gerar('teste-grande', 3);
  assert.equal(p.toleranciaRelativa, 0.005);
  assert.equal(p.tolerancia, undefined);
  assert.deepEqual(p.figuraEnunciado, { id: 'afim', opcoes: { a: 1 } });
});

test('harness: numérica com toleranciaRelativa passa; sem nenhuma tolerância falha', () => {
  assert.deepEqual(verificar(defGrande(), { sementes: 100 }), []);
  const sem = defGrande();
  const g = sem.gerar;
  sem.gerar = (s, o) => { const ex = g(s, o); delete ex.toleranciaRelativa; return ex; };
  const e = verificar(sem, { sementes: 5 });
  assert.ok(e.length > 0 && e.every((x) => /tolerancia/.test(x)), e.join('\n'));
});

test('harness: figuraEnunciado com esquema inexistente falha, com esquema existente passa', () => {
  const com = (id) => {
    const d = defGrande();
    const g = d.gerar;
    d.gerar = (s, o) => Object.assign(g(s, o), { figuraEnunciado: { id, opcoes: {} } });
    return d;
  };
  assert.deepEqual(verificar(com('afim'), { sementes: 5 }), []);
  const e = verificar(com('nao-existe'), { sementes: 5 });
  assert.ok(e.length > 0 && e.every((x) => /figuraEnunciado/.test(x)), e.join('\n'));
});

test('harness: carrega os cálculos de todas as disciplinas (esquemas/*/calculo-*.js)', () => {
  delete require.cache[CAMINHO_HARNESS];
  const Manual = require(CAMINHO_HARNESS).carregarTudo();
  assert.ok(Manual.geradores.todos().length >= 77);
  assert.equal(typeof Manual.ficheiroEsquema, 'function');
});
