// Páginas «O meu progresso» e «Educandas» com o documento falso e um Manual.conta de mentira (sem Supabase).
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

let Manual;
beforeEach(() => {
  globalThis.document = criarDocumento();
  globalThis.window = { location: { hash: '' } };
  globalThis.katex = { render(v, el) { el.textContent = '<' + v + '>'; } };
  Manual = carregar('js/nucleo.js', 'js/aleatorio.js', 'js/aprendizagem.js', 'js/selecao.js',
    'esquemas/mat-a/calculo-cidadania.js', 'esquemas/mat-a/calculo-estatistica.js', 'esquemas/mat-a/calculo-geometria.js',
    'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/formatar.js',
    'js/geradores/registo.js', 'js/geradores/ajudas.js',
    'js/geradores/mat-a/cidadania.js', 'js/geradores/mat-a/estatistica.js', 'js/geradores/mat-a/geometria-sintetica.js',
    'js/geradores/mat-a/funcoes.js', 'js/geradores/mat-a/geometria-analitica.js',
    'js/miniquiz.js', 'js/treino.js', 'js/teste.js', 'js/painel.js', 'js/router.js', 'js/texto.js', 'js/quiz.js', 'js/render.js',
    'conteudos/indice.js', 'js/vistas-conta.js', 'js/vistas-estudo.js', 'js/vistas-progresso.js');
  Manual.motor = { historico: () => [], estadoDe: () => null, aoMudar: () => () => {} };
});
afterEach(() => { delete globalThis.document; delete globalThis.window; delete globalThis.katex; });

const esperar = () => new Promise((r) => setImmediate(r));

function stubConta(o) {
  const pedidos = { tentativas: [], estados: [] };
  Manual.conta = {
    estado: () => o.estado,
    aoMudar: () => () => {},
    ligacoes: () => Promise.resolve(o.ligacoes || []),
    tentativas: (a) => { pedidos.tentativas.push(a); return o.erro ? Promise.reject(new Error('x')) : Promise.resolve((o.tentativas || {})[a.alunaId] || []); },
    estados: (id) => { pedidos.estados.push(id); return o.erro ? Promise.reject(new Error('x')) : Promise.resolve((o.estados || {})[id] || []); },
  };
  return pedidos;
}
const ENC = { autenticado: true, papel: 'encarregado', perfil: { nome: 'E' } };

test('encarregado sem ligações: mensagem e formulário do código', async () => {
  stubConta({ estado: ENC, ligacoes: [] });
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.encarregado(principal);
  await esperar(); await esperar();
  assert.match(principal.textContent, /Ainda não tens nenhuma educanda ligada/);
  assert.match(principal.textContent, /Código da educanda/);
  v.destruir();
});

test('encarregado com duas ligações: seletor com etiqueta e troca de educanda', async () => {
  const ts = (n) => [{ criado_em: new Date().toISOString(), resultado: 'certa', tipo: 'x', chave: 'mat-a/funcoes/afim' }].slice(0, n);
  const pedidos = stubConta({
    estado: ENC,
    ligacoes: [{ id: 1, aluna_id: 'a', nome: 'Ana' }, { id: 2, aluna_id: 'b', nome: null }],
    tentativas: { a: ts(1), b: [] },
  });
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.encarregado(principal);
  await esperar(); await esperar(); await esperar();
  const sel = principal.querySelector('select');
  assert.ok(sel, 'há um select');
  const label = Array.from(principal.querySelectorAll('label')).find((l) => l.htmlFor === sel.id);
  assert.equal(label.textContent, 'Educanda');
  assert.deepEqual(Array.from(sel.children).map((o) => o.textContent), ['Ana', 'Educanda sem nome']);
  assert.deepEqual(pedidos.tentativas.map((p) => p.alunaId), ['a']);
  assert.ok(pedidos.tentativas[0].desde, 'envia desde');
  assert.match(principal.textContent, /Última atividade: \d\d\/\d\d\/\d{4}/);
  assert.equal(Array.from(principal.querySelectorAll('a')).filter((a) => a.textContent === 'Treinar').length, 0, 'sem Treinar');
  assert.equal(principal.querySelectorAll('button').length, 0, 'sem botões');
  sel.value = 'b';
  sel.dispatch('change');
  await esperar(); await esperar(); await esperar();
  assert.deepEqual(pedidos.tentativas.map((p) => p.alunaId), ['a', 'b']);
  assert.deepEqual(pedidos.estados, ['a', 'b']);
  assert.match(principal.textContent, /Última atividade: ainda sem atividade/);
  v.destruir();
});

test('encarregado: erro de leitura mostra a mensagem e não lança', async () => {
  stubConta({ estado: ENC, ligacoes: [{ id: 1, aluna_id: 'a', nome: 'Ana' }], erro: true });
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.encarregado(principal);
  await esperar(); await esperar(); await esperar();
  assert.match(principal.textContent, /Não foi possível ler os dados desta educanda\./);
  v.destruir();
});

test('encarregado: falha em ligacoes() tem mensagem própria', async () => {
  stubConta({ estado: ENC });
  Manual.conta.ligacoes = () => Promise.reject(new Error('x'));
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.encarregado(principal);
  await esperar(); await esperar(); await esperar();
  assert.match(principal.textContent, /Não foi possível ler as tuas ligações\. Tenta outra vez mais tarde\./);
  assert.doesNotMatch(principal.textContent, /desta educanda/);
  v.destruir();
});

test('encarregado: papel diferente vê o aviso e a ligação para entrar', () => {
  stubConta({ estado: { autenticado: true, papel: 'aluna' } });
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.encarregado(principal);
  assert.match(principal.textContent, /Esta página é para encarregados de educação\./);
  assert.ok(Array.from(principal.querySelectorAll('a')).some((a) => a.href === '#/entrar'));
  v.destruir();
});

test('progresso como visitante: aviso local e ligação «Criar conta»', () => {
  stubConta({ estado: { autenticado: false, papel: null, perfil: null } });
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.progresso(principal);
  assert.match(principal.textContent, /Este progresso só está guardado neste dispositivo\./);
  assert.ok(Array.from(principal.querySelectorAll('a')).some((a) => a.textContent === 'Criar conta'));
  assert.match(principal.textContent, /Domina/);
  assert.match(principal.textContent, /Sem tentativas/);
  assert.match(principal.textContent, /Semana de \d\d\/\d\d/);
  assert.match(principal.textContent, /Erros mais frequentes/);
  v.destruir();
});

test('progresso: o encarregado é redirecionado para #/encarregado', () => {
  stubConta({ estado: ENC });
  const principal = document.createElement('main');
  Manual.vistasProgresso.progresso(principal);
  assert.equal(window.location.hash, '#/encarregado');
});

test('progresso: subtema com dificuldade mostra o rótulo em texto e «Treinar»', () => {
  stubConta({ estado: { autenticado: false, papel: null } });
  Manual.motor.estadoDe = (k) => (k === 'mat-a/funcoes/afim' ? { estado: 'dificuldade', proxima_revisao: null } : null);
  const principal = document.createElement('main');
  const v = Manual.vistasProgresso.progresso(principal);
  assert.ok(Array.from(principal.querySelectorAll('span.estado-dificuldade')).some((s) => s.textContent === 'Com dificuldade'));
  assert.ok(Array.from(principal.querySelectorAll('a')).some((a) => a.textContent === 'Treinar' && a.href === '#/treino?s=mat-a/funcoes/afim'));
  v.destruir();
});
