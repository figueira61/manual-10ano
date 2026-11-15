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

test('teste: com uma só disciplina disponível, vem escolhida e com os 5 temas à vista; fqa (indisponível) não é oferecida', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  const radios = principal.querySelectorAll('input').filter((i) => i.type === 'radio' && i.name === 'teste-disciplina');
  assert.deepEqual(radios.map((r) => r.value), ['mat-a']);
  assert.match(principal.textContent, /Disciplina/);
  assert.equal(radios[0].checked, true);
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
  assert.equal(radios.some((r) => r.checked), false, 'com duas disciplinas não há nenhuma escolhida');
  assert.equal(principal.querySelectorAll('input').filter((i) => i.type === 'checkbox' && /teste-tema/.test(i.id)).length, 0);
  assert.equal(principal.querySelectorAll('button').find((b) => /Começar o teste/.test(b.textContent)).disabled, true);
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

// Carrega o js/app.js a sério (documento e janela falsos) com o hash dado; devolve o <main>.
function abrirApp(hash, forcarFqa) {
  const path = require('node:path');
  const principal = document.createElement('main');
  const el = {};
  globalThis.window = { location: { hash }, addEventListener() {}, scrollTo() {}, localStorage: null };
  globalThis.location = { protocol: 'file:', hash };
  globalThis.history = { replaceState() {} };
  globalThis.navigator = {};
  document.getElementById = (id) => (id === 'principal' ? principal : (el[id] = el[id] || document.createElement('div')));
  document.body = document.createElement('body');
  Object.assign(Object.getPrototypeOf(document.createElement('div')), { insertBefore(n) { this.appendChild(n); return n; } });
  document.createElementNS = (ns, tag) => document.createElement(tag);
  Object.assign(Manual, {
    conta: { iniciar: () => Promise.resolve(), aoMudar() {}, registaTentativas: () => true },
    criarMotor: () => ({ carregar() {}, aoMudar: () => () => {}, historico: () => [], estadoDe: () => null }),
    vistasConta: { montarTopo() {}, montar() { return null; } },
    tema: { ligar() {} },
  });
  Manual.carregarScript = () => Promise.reject(new Error('sem rede'));
  const f = path.join(__dirname, '..', 'js', 'app.js');
  const extra = ['js/icones.js', 'js/progresso.js', 'js/pesquisa.js'];
  for (const e of extra) { const abs = path.join(__dirname, '..', e); delete require.cache[abs]; require(abs); }
  if (forcarFqa) Manual.indice.find((d) => d.id === 'fqa').disponivel = true;
  delete require.cache[f];
  require(f);
  return principal;
}

test('app: a página da disciplina fqa (disponível forçado) mostra os temas e "Física — em breve" sem ligação', () => {
  const principal = abrirApp('#/fqa', true);
  assert.match(principal.textContent, /Física e Química A/);
  assert.match(principal.textContent, /Elementos químicos e sua organização/);
  const itens = principal.querySelectorAll('li').filter((li) => li.textContent === 'Física — em breve');
  assert.equal(itens.length, 1);
  assert.equal(itens[0].querySelectorAll('a').length, 0);
});

test('app: com fqa indisponível, o tema e o subtema dão "Página não encontrada"; a disciplina diz "Em breve"', () => {
  for (const hash of ['#/fqa/elementos', '#/fqa/elementos/atomo']) {
    const principal = abrirApp(hash, false);
    assert.match(principal.textContent, /Página não encontrada/, hash);
    assert.doesNotMatch(principal.textContent, /Constituição do átomo|A carregar/, hash);
  }
  assert.doesNotMatch(abrirApp('#/fqa', false).textContent, /Física — em breve/);
});

test('app: com fqa disponível forçado, a página do tema lista os subtemas', () => {
  const principal = abrirApp('#/fqa/elementos', true);
  assert.match(principal.textContent, /Constituição do átomo/);
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

test('app: disciplina desconhecida (#/xyz/a/b, #/xyz/a) dá "Página não encontrada" sem lançar', () => {
  for (const hash of ['#/xyz/a/b', '#/xyz/a']) {
    const principal = abrirApp(hash, false);
    assert.match(principal.textContent, /Página não encontrada/, hash);
  }
});
