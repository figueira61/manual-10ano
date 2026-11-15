const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento, serializar } = require('./dom-minimo.js');

let Manual;
let aleatorioOriginal;

beforeEach(() => {
  globalThis.document = criarDocumento();
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  aleatorioOriginal = Math.random;
  Math.random = () => 0.5;
  Manual = carregar('js/texto.js', 'js/quiz.js', 'js/render.js');
});

afterEach(() => {
  Math.random = aleatorioOriginal;
  delete globalThis.document;
  delete globalThis.katex;
});

function gerada(extra) {
  return Object.assign({
    tipo: 'numerica', enunciado: 'Calcula $2+3$.', resposta: 5, tolerancia: 0,
    resolucao: ['x'],
    resolucaoDetalhada: [
      { passo: 'Somar', porque: 'porque $a+b$ é soma', calculo: '2+3=5' },
      { passo: 'Conferir', porque: 'ver o resultado', calculo: '5-3=2', bloco: true },
      { passo: 'Responder', porque: 'fim' },
    ],
    verificacao: { passo: 'Subtrair', calculo: '5-3=2' },
    errosTipicos: [], gerador: 'g', id: 'g1', semente: 1,
  }, extra);
}

function escrever(el, valor) {
  el.querySelector('input.campo-numero').value = valor;
}
function carregarBotao(el, texto) {
  return Array.from(el.querySelectorAll('button')).find((b) => b.textContent === texto);
}

// ---- Sem opções novas: o DOM e o fluxo ficam como estavam (capturado antes da alteração). ----
const BANCO = [
  { tipo: 'escolha', enunciado: 'Quanto é $1+1$?', opcoes: ['1', '2', '3'], correta: 1, resolucao: ['Soma.'], explicacao: 'Porque sim.' },
  { tipo: 'numerica', enunciado: 'Calcula', resposta: 2.5, unidade: 'm', resolucao: ['a', 'b'] },
  { tipo: 'vf', enunciado: 'V?', correta: true, resolucao: [] },
];

function cenarioAtual() {
  const el = document.createElement('div');
  const out = [];
  Manual.quiz.montar(el, BANCO, (c, t) => out.push('fim ' + c + '/' + t), () => {});
  out.push(serializar(el));
  el.querySelectorAll('input')[1].checked = true;
  el.querySelector('button').click();
  out.push(serializar(el));
  el.querySelector('button').click();
  el.querySelector('input').value = '2,5';
  el.querySelector('button').click();
  out.push(serializar(el));
  el.querySelector('button').click();
  el.querySelectorAll('input')[0].checked = true;
  el.querySelector('button').click();
  out.push(serializar(el));
  el.querySelector('button').click();
  out.push(serializar(el));
  const el2 = document.createElement('div');
  Manual.quiz.montar(el2, [gerada({ esquema: { id: 'e1' } })], () => {}, () => {}, {
    montarEsquema(pai) { pai.appendChild(document.createElement('figure')); return { destruir() {} }; },
  });
  el2.querySelector('input').value = '4';
  el2.querySelector('button').click();
  out.push(serializar(el2));
  return out.join('\n');
}

// Capturado com o js/quiz.js anterior a esta alteração.
const FIXTURE_ANTES = [
  "(div (div.pergunta (p.pergunta-n[.tabIndex=-1] \"Pergunta 1 de 3\") (p.enunciado \"Quanto é \" (span.math \"<1+1>\") \"?\") (div.opcoes (label.opcao (input[.type=radio,.name=qi]) (span \"1\")) (label.opcao (input[.type=radio,.name=qi]) (span \"3\")) (label.opcao (input[.type=radio,.name=qi]) (span \"2\"))) (p.aviso-erro[role=alert,.hidden=true]) (button.botao.botao-principal[.type=button] \"Verificar\") (div.feedback[aria-live=polite])))",
  "(div (div.pergunta (p.pergunta-n[.tabIndex=-1] \"Pergunta 1 de 3\") (p.enunciado \"Quanto é \" (span.math \"<1+1>\") \"?\") (div.opcoes (label.opcao (input[.type=radio,.name=qi,.disabled=true]) (span \"1\")) (label.opcao (input[.type=radio,.name=qi,.disabled=true,.checked=true]) (span \"3\")) (label.opcao (input[.type=radio,.name=qi,.disabled=true]) (span \"2\"))) (p.aviso-erro[role=alert,.hidden=true]) (button.botao.botao-principal[.type=button] \"Seguinte\") (div.feedback.errado[aria-live=polite] (p.veredicto \"✘ Errado.\") (p.resposta-correta \"Resposta correta: \" (span \"2\")) (p.feedback-titulo \"Resolução\") (ol.passos (li \"Soma.\")) (p.explicacao \"Porque sim.\"))))",
  "(div (div.pergunta (p.pergunta-n[.tabIndex=-1] \"Pergunta 2 de 3\") (p.enunciado \"Calcula\") (div.opcoes (input.campo-numero[aria-label=Resposta,.type=text,.disabled=true,.autocomplete=off,.value=2,5]) (span.unidade \" m\")) (p.aviso-erro[role=alert,.hidden=true]) (button.botao.botao-principal[.type=button] \"Seguinte\") (div.feedback.certo[aria-live=polite] (p.veredicto \"✔ Certo!\") (p.resposta-correta \"Resposta correta: \" (span \"2,5 m\")) (p.feedback-titulo \"Resolução\") (ol.passos (li \"a\") (li \"b\")))))",
  "(div (div.pergunta (p.pergunta-n[.tabIndex=-1] \"Pergunta 3 de 3\") (p.enunciado \"V?\") (div.opcoes (label.opcao (input[.type=radio,.name=qi,.disabled=true,.checked=true]) (span \"Verdadeiro\")) (label.opcao (input[.type=radio,.name=qi,.disabled=true]) (span \"Falso\"))) (p.aviso-erro[role=alert,.hidden=true]) (button.botao.botao-principal[.type=button] \"Ver resultado\") (div.feedback.certo[aria-live=polite] (p.veredicto \"✔ Certo!\") (p.resposta-correta \"Resposta correta: \" (span \"Verdadeiro\")))))",
  "fim 2/3",
  "(div (div.pergunta.resultado (p.pontuacao \"Acertaste 2 de 3.\") (button.botao.botao-principal[.type=button] \"Repetir\")))",
  "(div (div.pergunta (p.pergunta-n[.tabIndex=-1] \"Pergunta 1 de 1\") (p.enunciado \"Calcula \" (span.math \"<2+3>\") \".\") (div.opcoes (input.campo-numero[aria-label=Resposta,.type=text,.disabled=true,.autocomplete=off,.value=4])) (p.aviso-erro[role=alert,.hidden=true]) (button.botao.botao-principal[.type=button] \"Ver resultado\") (div.feedback.errado[aria-live=polite] (p.veredicto \"✘ Errado.\") (p.resposta-correta \"Resposta correta: \" (span \"5\")) (p.feedback-titulo \"Resolução\") (ol.passos (li (p.passo-texto (strong \"Somar\") \" — porque \" (span.math \"<a+b>\") \" é soma\") (div.passo-calculo (span.math \"<2+3=5>\"))) (li (p.passo-texto (strong \"Conferir\") \" — ver o resultado\") (div.passo-calculo (span.math.math-bloco \"<5-3=2>\"))) (li (p.passo-texto (strong \"Responder\") \" — fim\"))) (div.verificacao (p.passo-texto (strong \"Verificação: \") \"Subtrair\") (div.passo-calculo (span.math \"<5-3=2>\"))) (figure))))",
].join('\n');

test('sem opções novas o DOM do quiz é igual ao anterior', () => {
  assert.equal(cenarioAtual(), FIXTURE_ANTES);
});

// ---- Teste: sem feedback até ao fim, revisão final ----
function montarTeste(perguntas, extra, aoResponder, aoTerminar) {
  const el = document.createElement('div');
  const ctl = Manual.quiz.montar(el, perguntas, aoTerminar || (() => {}), aoResponder || (() => {}),
    Object.assign({ modo: 'teste' }, extra));
  return { el, ctl };
}

function espiarIntervalos() {
  const ativos = new Set();
  const original = { si: globalThis.setInterval, ci: globalThis.clearInterval };
  let n = 0;
  const estado = { ativos, tique: null };
  globalThis.setInterval = (fn) => { n += 1; ativos.add(n); estado.tique = fn; return n; };
  globalThis.clearInterval = (id) => { ativos.delete(id); };
  estado.repor = () => { globalThis.setInterval = original.si; globalThis.clearInterval = original.ci; };
  return estado;
}

test('teste: depois de verificar só aparece "Resposta registada." e o botão Seguinte', () => {
  const { el } = montarTeste([gerada(), gerada({ resposta: 7 })], {
    montarEsquema() { throw new Error('não devia montar esquema'); },
  });
  escrever(el, '5');
  el.querySelector('button').click();
  assert.equal(el.querySelector('.resposta-correta'), null);
  assert.equal(el.querySelector('.veredicto'), null);
  assert.equal(el.querySelector('.passos'), null);
  assert.equal(el.querySelector('.feedback').textContent, 'Resposta registada.');
  assert.ok(carregarBotao(el, 'Seguinte'));
  assert.equal(el.querySelector('.feedback').classes.has('certo'), false);
});

test('teste: a revisão final mostra N blocos com "Resposta correta" e chama aoTerminar com as respostas', () => {
  const chamadas = [];
  const resp = [];
  const qs = [gerada(), gerada({ resposta: 7 }), gerada({ resposta: 9 })];
  const { el } = montarTeste(qs, {}, (x) => resp.push(x), (...a) => chamadas.push(a));
  ['5', '1', '9'].forEach((v) => {
    escrever(el, v);
    el.querySelector('button').click();
    el.querySelector('button').click();
  });
  assert.equal(el.querySelectorAll('.resposta-correta').length, 3);
  assert.equal(el.querySelectorAll('.revisao-item').length, 3);
  assert.equal(el.querySelectorAll('.verificacao').length, 3);
  assert.equal(resp.length, 3, 'aoResponder é chamado em cada Verificar');
  assert.equal(chamadas.length, 1);
  const [certas, total, respostas] = chamadas[0];
  assert.equal(certas, 2);
  assert.equal(total, 3);
  assert.deepEqual(respostas.map((r) => r.resultado), ['certa', 'errada', 'certa']);
  assert.equal(respostas[1].resposta, '1');
  assert.equal(respostas[1].pergunta, qs[1]);
  assert.equal(respostas[0].erroTipico, null);
  assert.equal(el.querySelector('.pontuacao').textContent, 'Acertaste 2 de 3.');
});

test('teste: a revisão monta o esquema e destruir() destrói-o; opcoes.fim substitui o cartão final', () => {
  const montados = [];
  const { el, ctl } = montarTeste([gerada({ esquema: { id: 'e' } })], {
    montarEsquema(pai) {
      const m = { destruido: false, destruir() { this.destruido = true; } };
      montados.push(m);
      pai.appendChild(document.createElement('figure'));
      return m;
    },
    fim(cartao, certas, total, respostas) {
      cartao.appendChild(document.createTextNode('Nota ' + certas + '/' + total + ' ' + respostas.length));
    },
  });
  escrever(el, '5');
  el.querySelector('button').click();
  el.querySelector('button').click();
  assert.equal(montados.length, 1);
  assert.equal(el.querySelector('.resultado').textContent, 'Nota 1/1 1');
  assert.equal(el.querySelector('.pontuacao'), null);
  assert.equal(carregarBotao(el, 'Repetir'), undefined);
  ctl.destruir();
  assert.equal(montados[0].destruido, true);
});

test('teste: "Rever no manual" aparece na revisão quando há ligação', () => {
  const { el } = montarTeste([gerada()], { ligacaoRever: () => '#/mat-a/funcoes/afim' });
  escrever(el, '5');
  el.querySelector('button').click();
  el.querySelector('button').click();
  const a = el.querySelector('a.ligacao-rever');
  assert.equal(a.textContent, 'Rever no manual');
  assert.equal(a.href, '#/mat-a/funcoes/afim');
});

test('teste: cronómetro em role=timer, aria-live=off; destruir() deixa 0 intervalos ativos', () => {
  const e = espiarIntervalos();
  try {
    const { el, ctl } = montarTeste([gerada()], { cronometro: true });
    const t = el.querySelector('.cronometro');
    assert.equal(t.getAttribute('role'), 'timer');
    assert.equal(t.getAttribute('aria-live'), 'off');
    assert.match(t.textContent, /^\d\d:\d\d$/);
    assert.equal(e.ativos.size, 1);
    e.tique();
    ctl.destruir();
    assert.equal(e.ativos.size, 0);
  } finally {
    e.repor();
  }
});

test('teste: o intervalo também pára ao terminar', () => {
  const e = espiarIntervalos();
  try {
    const { el } = montarTeste([gerada()], { cronometro: true });
    escrever(el, '5');
    el.querySelector('button').click();
    el.querySelector('button').click();
    assert.equal(e.ativos.size, 0);
  } finally {
    e.repor();
  }
});

// ---- Treino: níveis de ajuda ----
function montarTreino(perguntas, nivel, aoResponder, extra) {
  const el = document.createElement('div');
  const ctl = Manual.quiz.montar(el, perguntas, () => {}, aoResponder || (() => {}),
    Object.assign({ modo: 'treino', nivel: () => nivel }, extra));
  return { el, ctl };
}

test('treino nível 1: botão de pista mostra o 1.º passo sem cálculo, desativa-se e aoResponder traz usouPista', () => {
  const resp = [];
  const { el } = montarTreino([gerada(), gerada()], 1, (x) => resp.push(x));
  const pista = carregarBotao(el, 'Dá-me uma pista');
  assert.ok(pista);
  pista.click();
  const caixa = el.querySelector('.pista');
  assert.match(caixa.textContent, /^Somar — porque /);
  assert.equal(caixa.querySelector('.passo-calculo'), null);
  assert.ok(caixa.querySelector('.math'), 'o porquê continua a ser composto com KaTeX');
  assert.equal(pista.disabled, true);
  assert.equal(el.querySelector('.ajuda').getAttribute('aria-live'), 'polite');
  assert.equal(document.activeElement, caixa, 'o foco vai para a pista revelada');
  assert.equal(caixa.tabIndex, -1);
  escrever(el, '5');
  el.querySelector('button.botao-principal').click();
  assert.equal(resp[0].usouPista, true);
  assert.equal(resp[0].nivel, 1);
  assert.equal(resp[0].viuPassos, false);
  carregarBotao(el, 'Seguinte').click();
  escrever(el, '5');
  el.querySelector('button.botao-principal').click();
  assert.equal(resp[1].usouPista, false);
});

test('treino nível 0: os passos revelam-se um a um, sem cálculo; viuPassos só depois de abrir um', () => {
  const resp = [];
  const { el } = montarTreino([gerada(), gerada()], 0, (x) => resp.push(x));
  assert.match(el.textContent, /Vamos por passos/);
  assert.equal(el.querySelectorAll('.ajuda-passos li').length, 0);
  const prox = carregarBotao(el, 'Próximo passo');
  for (let i = 1; i <= 3; i++) {
    prox.click();
    assert.equal(el.querySelectorAll('.ajuda-passos li').length, i);
    assert.equal(document.activeElement, el.querySelectorAll('.ajuda-passos li')[i - 1], 'o foco vai para o passo novo');
  }
  assert.equal(el.querySelector('.ajuda-passos').getAttribute('aria-live'), 'polite');
  assert.equal(el.querySelector('.ajuda-passos .passo-calculo'), null);
  assert.equal(prox.disabled, true);
  assert.equal(el.querySelectorAll('.ajuda-passos li')[1].textContent, 'Conferir — ver o resultado');
  assert.ok(!el.querySelector('input.campo-numero').disabled);
  escrever(el, '5');
  el.querySelector('button.botao-principal').click();
  assert.equal(resp[0].viuPassos, true);
  assert.equal(resp[0].usouPista, false);
  assert.equal(resp[0].nivel, 0);
  carregarBotao(el, 'Seguinte').click();
  escrever(el, '5');
  el.querySelector('button.botao-principal').click();
  assert.equal(resp[1].viuPassos, false);
});

test('treino: sem resolucaoDetalhada, nível 2 ou nível inválido não há botões de ajuda', () => {
  const sem = gerada({ resolucaoDetalhada: undefined });
  [0, 1].forEach((n) => {
    const { el } = montarTreino([sem], n);
    assert.equal(carregarBotao(el, 'Dá-me uma pista'), undefined);
    assert.equal(carregarBotao(el, 'Próximo passo'), undefined);
  });
  [2, undefined, 7, null].forEach((n) => {
    const { el } = montarTreino([gerada()], n);
    assert.equal(carregarBotao(el, 'Dá-me uma pista'), undefined);
    assert.equal(carregarBotao(el, 'Próximo passo'), undefined);
  });
  const el = document.createElement('div');
  Manual.quiz.montar(el, [gerada()], () => {}, () => {}, { modo: 'treino' });
  assert.equal(carregarBotao(el, 'Dá-me uma pista'), undefined);
});

test('treino: o feedback tem "Rever no manual" quando há ligação; fora do treino não há ajuda', () => {
  const { el } = montarTreino([gerada()], 2, null, { ligacaoRever: () => '#/x' });
  escrever(el, '5');
  el.querySelector('button.botao-principal').click();
  assert.equal(el.querySelector('.feedback a.ligacao-rever').href, '#/x');
  const el2 = document.createElement('div');
  Manual.quiz.montar(el2, [gerada()], () => {}, () => {}, { nivel: () => 1 });
  assert.equal(carregarBotao(el2, 'Dá-me uma pista'), undefined);
});

test('o quiz lê a lista pela mesma referência (troca no sítio) e aoResponder traz nivel 2 por omissão', () => {
  const lista = [gerada(), gerada()];
  const el = document.createElement('div');
  const resp = [];
  Manual.quiz.montar(el, () => lista, () => {}, (x) => resp.push(x));
  lista[1] = gerada({ resposta: 6 });
  escrever(el, '5');
  el.querySelector('button').click();
  el.querySelector('button').click();
  escrever(el, '6');
  el.querySelector('button').click();
  assert.equal(resp[1].resultado, 'certa');
  assert.deepEqual([resp[0].nivel, resp[0].usouPista, resp[0].viuPassos], [2, false, false]);
});
