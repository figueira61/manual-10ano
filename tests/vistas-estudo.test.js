// Fumo das vistas Treino e Teste com o documento falso: montam, comecam e param sem lançar erros.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

let Manual;
beforeEach(() => {
  globalThis.document = criarDocumento();
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  Manual = carregar('js/nucleo.js', 'js/aleatorio.js', 'js/aprendizagem.js', 'js/selecao.js',
    'esquemas/mat-a/calculo-cidadania.js', 'esquemas/mat-a/calculo-estatistica.js', 'esquemas/mat-a/calculo-geometria.js',
    'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/formatar.js',
    'js/geradores/registo.js', 'js/geradores/ajudas.js',
    'js/geradores/mat-a/cidadania.js', 'js/geradores/mat-a/estatistica.js', 'js/geradores/mat-a/geometria-sintetica.js',
    'js/geradores/mat-a/funcoes.js', 'js/geradores/mat-a/geometria-analitica.js',
    'js/miniquiz.js', 'js/treino.js', 'js/teste.js', 'js/router.js', 'js/texto.js', 'js/quiz.js', 'js/render.js',
    'conteudos/indice.js', 'js/vistas-estudo.js');
});
afterEach(() => { delete globalThis.document; delete globalThis.katex; });

function texto(no) { return no.textContent; }

test('treino sem subtema mostra a sugestão e a escolha livre', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, {});
  const t = texto(principal);
  assert.match(t, /Sugestão de hoje/);
  assert.match(t, /~10 min/);
  assert.match(t, /Escolha livre/);
  v.destruir();
});

test('treino com subtema começa logo o quiz; destruir não lança', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, { subtema: 'mat-a/funcoes/afim' });
  assert.ok(principal.querySelector('.pergunta'), 'há uma pergunta');
  v.destruir();
});

test('teste: configuração, começa e mostra a pergunta', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  assert.match(texto(principal), /Com cronómetro/);
  const botoes = principal.querySelectorAll('button').filter((b) => /Começar o teste/.test(b.textContent));
  assert.equal(botoes.length, 1);
  botoes[0].click();
  assert.ok(principal.querySelector('.pergunta'));
  v.destruir();
});

test('treino: a sugestão refaz-se quando o motor muda, mantém as caixas marcadas e destruir desliga', () => {
  let estados = {};
  let ouvinte = null;
  let desligou = 0;
  Manual.motor = {
    historico: () => [],
    estadoDe: (k) => estados[k] || null,
    aoMudar: (fn) => { ouvinte = fn; return () => { desligou += 1; ouvinte = null; }; },
  };
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, {});
  const sugestao = () => principal.querySelectorAll('section').find((c) => /Sugestão de hoje/.test(c.textContent)).querySelectorAll('li').map((li) => li.textContent);
  const antes = sugestao();
  assert.ok(antes.length > 0);
  const caixa = principal.querySelectorAll('input').find((i) => i.type === 'checkbox');
  caixa.checked = true;
  assert.equal(typeof ouvinte, 'function');
  const ultima = 'mat-a/funcoes/afim';
  estados = { [ultima]: { estado: 'dificuldade', proxima_revisao: '2000-01-01' } };
  ouvinte({});
  const depois = sugestao();
  assert.notDeepEqual(depois, antes);
  assert.ok(depois.length > 0);
  assert.equal(principal.querySelectorAll('input').find((i) => i.type === 'checkbox').checked, true, 'a escolha livre mantém-se');
  assert.equal(desligou, 0);
  v.destruir();
  assert.equal(desligou, 1);
});

test('treino: começar a sessão desliga a subscrição do motor', () => {
  let desligou = 0;
  Manual.motor = { historico: () => [], estadoDe: () => null, aoMudar: () => () => { desligou += 1; } };
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, {});
  principal.querySelectorAll('button').find((b) => b.textContent === 'Começar').click();
  assert.equal(desligou, 1);
  v.destruir();
  assert.equal(desligou, 1);
});
