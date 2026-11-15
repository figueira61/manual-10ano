// Fase 3A, tarefa 1: Teste e Treino com mais de uma disciplina (DOM falso).
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = [
  'js/nucleo.js', 'js/aleatorio.js', 'js/aprendizagem.js', 'js/selecao.js', 'js/fila.js',
  'esquemas/mat-a/calculo-cidadania.js', 'esquemas/mat-a/calculo-estatistica.js', 'esquemas/mat-a/calculo-geometria.js',
  'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js',
  'js/geradores/mat-a/cidadania.js', 'js/geradores/mat-a/estatistica.js', 'js/geradores/mat-a/geometria-sintetica.js',
  'js/geradores/mat-a/funcoes.js', 'js/geradores/mat-a/geometria-analitica.js',
  'js/miniquiz.js', 'js/treino.js', 'js/teste.js', 'js/router.js', 'js/texto.js', 'js/quiz.js', 'js/render.js',
  'conteudos/indice.js', 'js/vistas-estudo.js',
];

let Manual;
beforeEach(() => {
  globalThis.document = criarDocumento();
  document.addEventListener = () => {};
  document.removeEventListener = () => {};
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  Manual = carregar(...BASE);
  Manual.conta = { guardarTentativa: () => Promise.resolve(), registaTentativas: () => true };
  Manual.motor = { historico: () => [], estadoDe: () => null, registar: () => {}, aoMudar: () => () => {} };
});
afterEach(() => { delete globalThis.document; delete globalThis.katex; });

function escolherDisciplina(principal, id) {
  const radio = principal.querySelectorAll('input').find((i) => i.type === 'radio' && i.value === id);
  radio.checked = true;
  radio.dispatch('change');
}

// Uma segunda disciplina disponível e com geradores (falsos), só para estes testes.
function juntarFqa() {
  const fqa = Manual.indice.find((d) => d.id === 'fqa');
  fqa.disponivel = true;
  Manual.geradores.registar({
    id: 'fqa-teste', disciplina: 'fqa', tema: 'elementos', subtema: 'atomo', tipo: 'teste', nome: 'Falso',
    formatos: ['numerica'], gerar: () => ({}), verificarIndependente: () => true, limites: () => true,
  });
  return fqa;
}

test('teste: só há disciplinas disponíveis com geradores; sem escolha não há temas', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  const radios = principal.querySelectorAll('input').filter((i) => i.type === 'radio' && i.name === 'teste-disciplina');
  assert.deepEqual(radios.map((r) => r.value), ['mat-a']);
  assert.match(principal.textContent, /Disciplina/);
  assert.equal(radios.some((r) => r.checked), false);
  assert.equal(principal.querySelectorAll('input').filter((i) => i.type === 'checkbox' && /teste-tema/.test(i.id)).length, 0);
  const ir = principal.querySelectorAll('button').find((b) => /Começar o teste/.test(b.textContent));
  assert.equal(ir.disabled, true);
  v.destruir();
});

test('teste: escolher mat-a mostra os 5 temas; fqa (indisponível) não é oferecida', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  escolherDisciplina(principal, 'mat-a');
  const temas = principal.querySelectorAll('input').filter((i) => i.type === 'checkbox' && /teste-tema/.test(i.id));
  assert.equal(temas.length, 5);
  assert.ok(temas.every((t) => t.checked));
  assert.doesNotMatch(principal.textContent, /Física e Química/);
  const ir = principal.querySelectorAll('button').find((b) => /Começar o teste/.test(b.textContent));
  assert.equal(ir.disabled, false);
  v.destruir();
});

test('teste: com duas disciplinas, trocar de disciplina troca os temas', () => {
  juntarFqa();
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  const radios = principal.querySelectorAll('input').filter((i) => i.type === 'radio' && i.name === 'teste-disciplina');
  assert.deepEqual(radios.map((r) => r.value), ['mat-a', 'fqa']);
  escolherDisciplina(principal, 'fqa');
  const rotulos = () => principal.querySelectorAll('input').filter((i) => i.type === 'checkbox' && /teste-tema/.test(i.id)).map((i) => i.id);
  assert.deepEqual(rotulos(), ['teste-tema-fqa-elementos']);
  escolherDisciplina(principal, 'mat-a');
  assert.equal(rotulos().length, 5);
  v.destruir();
});

test('treino: a escolha livre agrupa por disciplina, com o título por cima dos temas', () => {
  juntarFqa();
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, {});
  const titulos = principal.querySelectorAll('h3').map((h) => h.textContent);
  assert.deepEqual(titulos, ['Matemática A', 'Física e Química A']);
  const legendas = principal.querySelectorAll('legend').map((l) => l.textContent);
  assert.ok(legendas.indexOf('Elementos químicos e sua organização') > legendas.indexOf('Funções'));
  v.destruir();
});

test('treino: o esquema do feedback usa a disciplina da chave de cada pergunta', () => {
  const usadas = [];
  Manual.render.esquemaExercicio = (pai, esquema, disciplina) => { usadas.push(esquema.id + '@' + disciplina); return { destruir() {} }; };
  const perguntas = [
    { tipo: 'numerica', enunciado: 'a', resposta: 1, tolerancia: 0, resolucao: ['x'], chave: 'fqa/elementos/atomo', esquema: { id: 'e1' } },
    { tipo: 'numerica', enunciado: 'b', resposta: 1, tolerancia: 0, resolucao: ['x'], chave: 'mat-a/funcoes/afim', esquema: { id: 'e2' } },
  ];
  Manual.treino.montarTreino = () => perguntas;
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, { subtema: 'mat-a/funcoes/afim' });
  for (let i = 0; i < 2; i++) {
    principal.querySelector('input.campo-numero').value = '1';
    principal.querySelectorAll('button').find((b) => b.textContent === 'Verificar').click();
    const seg = principal.querySelectorAll('button').find((b) => /Seguinte|Ver resultado/.test(b.textContent));
    seg.click();
  }
  assert.deepEqual(usadas, ['e1@fqa', 'e2@mat-a']);
  v.destruir();
});

test('disciplina fqa: a página mostra "Física — em breve" sem ligação (índice declara porFazer)', () => {
  const fqa = Manual.indice.find((d) => d.id === 'fqa');
  assert.deepEqual(fqa.porFazer, ['Física']);
  assert.equal(fqa.disponivel, false);
  fqa.disponivel = true; // forçado no teste
  const pai = document.createElement('main');
  Manual.render.notaPorFazer(pai, fqa);
  assert.equal(pai.textContent, 'Física — em breve');
  assert.equal(pai.querySelectorAll('a').length, 0);
});

test('índice: fqa com 2 temas e 12 subtemas, ainda indisponível', () => {
  const fqa = Manual.indice.find((d) => d.id === 'fqa');
  assert.equal(fqa.disponivel, false);
  assert.deepEqual(fqa.temas.map((t) => [t.id, t.subtemas.length]), [['elementos', 5], ['materia', 7]]);
  assert.deepEqual(fqa.temas.flatMap((t) => t.subtemas.map((s) => s.id)), [
    'atomo', 'mole', 'espectros', 'configuracao', 'tabela-periodica', 'ligacao', 'geometria', 'carbono', 'gases', 'solucoes',
    'entalpia', 'fotoquimica']);
  assert.ok(fqa.temas.every((t) => t.subtemas.every((s) => s.titulo && Array.isArray(s.palavras) && s.palavras.length)));
});
