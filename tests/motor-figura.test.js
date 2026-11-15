// Fase 3A, tarefa 1: figura no enunciado do quiz e nota "em breve" da disciplina (DOM falso).
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

// ---------- quiz: figura no enunciado ----------

function perguntaComFigura(extra) {
  return Object.assign({
    tipo: 'numerica', enunciado: 'Quanto é $2+3$?', resposta: 5, tolerancia: 0, resolucao: ['x'],
    gerador: 'g', id: 'g1', semente: 1, figuraEnunciado: { id: 'fig-teste', opcoes: { k: 1 } },
    esquema: { id: 'esq-resposta' },
  }, extra);
}

let Q;
beforeEach(() => {
  globalThis.document = criarDocumento();
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  Q = carregar('js/texto.js', 'js/quiz.js', 'js/render.js');
});
afterEach(() => { delete globalThis.document; delete globalThis.katex; });

test('quiz: figuraEnunciado monta-se antes de Verificar, depois do enunciado e antes das opções; o esquema da resposta só depois', () => {
  const chamadas = [];
  const el = document.createElement('div');
  const ctl = Q.quiz.montar(el, [perguntaComFigura()], null, null, {
    montarEsquema(pai, esquema, pergunta) {
      chamadas.push(esquema.id);
      const f = document.createElement('figure');
      f.className = 'esq-' + esquema.id;
      pai.appendChild(f);
      assert.equal(pergunta.id, 'g1');
      return { destruir() { chamadas.push('destruir ' + esquema.id); } };
    },
  });
  assert.deepEqual(chamadas, ['fig-teste']);
  const filhos = el.querySelector('.pergunta').children.map((c) => String(c.className).split(' ')[0]);
  assert.ok(filhos.indexOf('enunciado') >= 0 && filhos.indexOf('enunciado') < filhos.indexOf('esq-fig-teste'), filhos.join());
  assert.ok(filhos.indexOf('esq-fig-teste') < filhos.indexOf('opcoes'), filhos.join());
  el.querySelector('input.campo-numero').value = '5';
  el.querySelectorAll('button').find((b) => b.textContent === 'Verificar').click();
  assert.deepEqual(chamadas, ['fig-teste', 'esq-resposta']);
  ctl.destruir();
  assert.deepEqual(chamadas.slice(2).sort(), ['destruir esq-resposta', 'destruir fig-teste']);
});

test('quiz: sem figuraEnunciado não se monta nada antes de Verificar', () => {
  const chamadas = [];
  const el = document.createElement('div');
  Q.quiz.montar(el, [perguntaComFigura({ figuraEnunciado: undefined })], null, null, {
    montarEsquema(pai, esquema) { chamadas.push(esquema.id); return null; },
  });
  assert.deepEqual(chamadas, []);
});

test('quiz em modo teste e treino também mostram a figura do enunciado', () => {
  for (const modo of ['teste', 'treino']) {
    const chamadas = [];
    const el = document.createElement('div');
    Q.quiz.montar(el, [perguntaComFigura()], null, null, {
      modo, montarEsquema(pai, esquema) { chamadas.push(esquema.id); return null; },
    });
    assert.deepEqual(chamadas, ['fig-teste'], modo);
  }
});
