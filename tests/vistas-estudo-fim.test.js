// Ecrãs finais do Treino, do Teste e do mini-quiz, e o menu da conta, com o documento falso (sem Supabase).
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
  'conteudos/indice.js', 'js/vistas-conta.js', 'js/vistas-estudo.js',
];
const K = 'mat-a/funcoes/afim';

let Manual, estados, tentativas;

function escolherDisciplina(principal, id) {
  const radio = Array.from(principal.querySelectorAll('input')).find((i) => i.type === 'radio' && i.value === id);
  radio.checked = true;
  radio.dispatch('change');
}

function ligarStubs() {
  Manual.conta = {
    guardarTentativa: (t) => { tentativas.push(t); return Promise.resolve(); },
    registaTentativas: () => true,
  };
  Manual.motor = {
    historico: () => [],
    estadoDe: (k) => estados[k] || null,
    registar: (t) => { if (Manual.motor.aoRegistar) Manual.motor.aoRegistar(t); },
    aoMudar: () => () => {},
  };
}

beforeEach(() => {
  globalThis.document = criarDocumento();
  document.addEventListener = () => {};
  document.removeEventListener = () => {};
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  Manual = carregar(...BASE);
  estados = {};
  tentativas = [];
  ligarStubs();
});
afterEach(() => { delete globalThis.document; delete globalThis.katex; });

// Percorre o quiz até aparecer o cartão final; `certas(i)` decide (força) o resultado de cada resposta.
function jogar(raiz, certas) {
  const resultados = [];
  const original = Manual.quiz.corrigir;
  Manual.quiz.corrigir = (p, resp) => {
    const r = original(p, resp);
    if (!r.valida) return r;
    const c = !!certas(resultados.length);
    resultados.push(c);
    return Object.assign({}, r, { certa: c });
  };
  for (let guarda = 0; guarda < 40 && !raiz.querySelector('.resultado'); guarda++) {
    const campos = Array.from(raiz.querySelectorAll('input'));
    const texto = campos.find((x) => x.type === 'text');
    if (texto) texto.value = '1';
    else { const radio = campos.find((x) => x.type === 'radio'); if (radio) radio.checked = true; }
    const botao = raiz.querySelector('.pergunta button.botao-principal');
    botao.click(); // Verificar
    botao.click(); // Seguinte / Ver resultado
  }
  Manual.quiz.corrigir = original;
  assert.ok(raiz.querySelector('.resultado'), 'chegou ao cartão final');
  return resultados;
}

const textos = (raiz, sel) => Array.from(raiz.querySelectorAll(sel)).map((x) => x.textContent);
const botaoComTexto = (raiz, re) => Array.from(raiz.querySelectorAll('button')).find((b) => re.test(b.textContent));

test('Treino: resumo com "Ainda com dificuldade em…" e "Próxima revisão: dd/mm"; aposErro e extras do treino', () => {
  estados[K] = { estado: 'dificuldade', proxima_revisao: '2026-11-16' };
  const chamadas = [];
  const aposErro = Manual.treino.aposErro;
  Manual.treino.aposErro = (...a) => { chamadas.push(a[1]); return aposErro(...a); };
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, { subtema: K });
  jogar(principal, () => false);
  const t = principal.textContent;
  assert.match(t, /Ainda com dificuldade em…/);
  assert.match(t, /Próxima revisão: 16\/11/);
  assert.doesNotMatch(t, /Melhoraste em…/);
  assert.ok(chamadas.length >= 1, 'aposErro chamado após erro');
  assert.equal(chamadas[0], 0);
  assert.ok(tentativas.length >= 8);
  for (const x of tentativas) {
    assert.equal(x.modo, 'treino');
    assert.equal(x.disciplina, 'mat-a');
    assert.equal(x.subtema, 'afim');
    assert.ok([0, 1, 2].includes(x.nivel_ajuda));
    assert.equal(typeof x.usou_pista, 'boolean');
    assert.equal(x.viu_resolucao, false);
  }
  v.destruir();
});

test('Treino: resumo com "Melhoraste em…" quando o estado sobe', () => {
  estados[K] = { estado: 'dificuldade', proxima_revisao: null };
  Manual.motor.aoRegistar = () => { estados[K] = { estado: 'domina', proxima_revisao: '2026-12-01' }; };
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, { subtema: K });
  jogar(principal, () => true);
  const t = principal.textContent;
  assert.match(t, /Melhoraste em…/);
  assert.match(t, /Próxima revisão: 01\/12/);
  assert.doesNotMatch(t, /Ainda com dificuldade em…/);
  v.destruir();
});

test('Treino: responderMiniquiz recebe o objeto do modo treino', () => {
  const vistos = [];
  const original = Manual.render.responderMiniquiz;
  Manual.render.responderMiniquiz = (c, r, extra) => { vistos.push(extra); return original(c, r, extra); };
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.treino(principal, { subtema: K });
  jogar(principal, (i) => i % 2 === 0);
  assert.ok(vistos.length >= 8);
  vistos.forEach((e) => { assert.equal(e.modo, 'treino'); assert.equal(e.viu_resolucao, false); assert.equal(typeof e.usou_pista, 'boolean'); });
  v.destruir();
});

test('Teste: nota com vírgula decimal (14,0 / 70 %)', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  escolherDisciplina(principal, 'mat-a');
  botaoComTexto(principal, /Começar o teste/).click();
  const res = jogar(principal, (i) => i < 7);
  assert.ok(res.length >= 10); // a revisão volta a corrigir cada resposta
  assert.match(principal.querySelector('.resultado').textContent, /Nota: 14,0 valores \(70 %\)/);
  v.destruir();
});

test('Teste: "Temas a rever" liga a #/treino?s= e as tentativas levam o modo teste', () => {
  const principal = document.createElement('main');
  const v = Manual.vistasEstudo.teste(principal);
  escolherDisciplina(principal, 'mat-a');
  botaoComTexto(principal, /Começar o teste/).click();
  jogar(principal, () => false);
  const cartao = principal.querySelector('.resultado');
  assert.match(cartao.textContent, /Nota: 0,0 valores \(0 %\)/);
  assert.match(cartao.textContent, /Temas a rever/);
  const hrefs = Array.from(cartao.querySelectorAll('a')).map((a) => a.href);
  assert.ok(hrefs.some((h) => /^#\/treino\?s=mat-a\/[a-z0-9-]+\/[a-z0-9-]+$/.test(h)), 'ligação #/treino?s=: ' + hrefs);
  assert.equal(tentativas.length, 10);
  tentativas.forEach((x) => { assert.equal(x.modo, 'teste'); assert.equal(x.nivel_ajuda, 2); });
  v.destruir();
});

test('mini-quiz: "Treinar este subtema" no cartão final, uma só vez mesmo depois de Repetir', () => {
  Manual.indice.length = 0;
  Manual.indice.push({ id: 'mat-a', nome: 'Matemática A', disponivel: true, temas: [{ id: 'funcoes', titulo: 'Funções', subtemas: [{ id: 'afim', titulo: 'Afim' }] }] });
  Manual.obterTema = () => ({ titulo: 'Funções' });
  Manual.miniquiz = undefined;
  const subtema = {
    id: 'afim', titulo: 'Afim', minutos: 5, essencial: [], resumo: [],
    quiz: [{ tipo: 'vf', enunciado: 'Verdade?', resposta: true, explicacao: 'sim' }],
  };
  const el = document.createElement('div');
  Manual.render.subtema(el, 'mat-a', 'funcoes', subtema, { registarQuiz() {}, marcarLido() {} });
  const ligacoes = () => Array.from(el.querySelectorAll('.resultado a')).filter((a) => a.textContent === 'Treinar este subtema');
  jogar(el.querySelector('.quiz'), () => true);
  assert.equal(ligacoes().length, 1);
  assert.equal(ligacoes()[0].href, '#/treino?s=' + K);
  el.querySelector('.resultado button').click(); // Repetir
  assert.equal(el.querySelectorAll('.resultado').length, 0);
  jogar(el.querySelector('.quiz'), () => true);
  assert.equal(ligacoes().length, 1);
});

test('mini-quiz: sem geradores no subtema não há "Treinar este subtema"', () => {
  Manual.indice.length = 0;
  Manual.indice.push({ id: 'mat-a', nome: 'Matemática A', disponivel: true, temas: [{ id: 'funcoes', titulo: 'Funções', subtemas: [{ id: 'sem-geradores', titulo: 'X' }] }] });
  Manual.obterTema = () => ({ titulo: 'Funções' });
  Manual.miniquiz = undefined;
  const subtema = {
    id: 'sem-geradores', titulo: 'X', minutos: 5, essencial: [], resumo: [],
    quiz: [{ tipo: 'vf', enunciado: 'Verdade?', resposta: true, explicacao: 'sim' }],
  };
  const el = document.createElement('div');
  Manual.render.subtema(el, 'mat-a', 'funcoes', subtema, { registarQuiz() {}, marcarLido() {} });
  jogar(el.querySelector('.quiz'), () => true);
  assert.ok(el.querySelector('.resultado'));
  assert.equal(Array.from(el.querySelectorAll('.resultado a')).filter((a) => a.textContent === 'Treinar este subtema').length, 0);
});

test('menu da conta por papel', () => {
  let ouvinte = null;
  let est = { autenticado: false, papel: null, perfil: null };
  Manual.conta = { estado: () => est, aoMudar: (fn) => { ouvinte = fn; return () => {}; } };
  const zona = document.createElement('div');
  Manual.vistasConta.montarTopo(zona);
  assert.deepEqual(textos(zona, 'a'), ['Entrar']);
  est = { autenticado: true, papel: 'aluna', perfil: { nome: 'Ana' } };
  ouvinte(est);
  assert.deepEqual(textos(zona, '.menu-item'), ['O meu progresso', 'Treino', 'Teste', 'A minha conta', 'Sair']);
  est = { autenticado: true, papel: 'encarregado', perfil: { nome: 'Rui' } };
  ouvinte(est);
  assert.deepEqual(textos(zona, '.menu-item'), ['Educandas', 'A minha conta', 'Sair']);
  assert.equal(Array.from(zona.querySelectorAll('a')).find((a) => a.textContent === 'Educandas').href, '#/encarregado');
});

test('Teste e Treino: regiões de mensagem escondidas enquanto não há mensagem', () => {
  const p = document.createElement('main');
  const v = Manual.vistasEstudo.teste(p);
  assert.equal(p.querySelector('.aviso-erro').hidden, true);
  v.destruir();
  const p2 = document.createElement('main');
  const v2 = Manual.vistasEstudo.treino(p2, {});
  const vazios = Array.from(p2.querySelectorAll('p')).filter((x) => x.classes.has('campo-ajuda') && x.textContent === '');
  assert.ok(vazios.length >= 1 && vazios.every((x) => x.hidden === true));
  v2.destruir();
});
