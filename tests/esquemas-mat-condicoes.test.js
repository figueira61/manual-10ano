// Esquema «condicoes» (esquemas/mat-a/condicoes.js): f(x) □ k lido no gráfico de uma polilinha.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = ['js/nucleo.js', 'esquemas/nucleo/referencial.js', 'esquemas/nucleo/controlos.js', 'esquemas/nucleo/desenho.js',
  'esquemas/mat-a/formatar.js', 'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/condicoes.js'];

function montar(opcoes) {
  globalThis.document = criarDocumento();
  const criados = [];
  const cria = document.createElement;
  const criaNS = document.createElementNS;
  document.createElement = (t) => { const e = cria(t); criados.push(e); return e; };
  document.createElementNS = (n, t) => { const e = criaNS(n, t); criados.push(e); return e; };
  const M = carregar(...BASE);
  const el = document.createElement('div');
  const montado = M.esquemas.obter('condicoes').montar(el, opcoes);
  const ouvintes = () => criados.reduce((n, e) => n + Object.values(e.ouvintes).reduce((a, l) => a + l.length, 0), 0);
  return { el, montado, ouvintes, criados };
}
const valor = (el, inicio) => {
  const dt = Array.from(el.querySelectorAll('dt')).find((d) => d.textContent.startsWith(inicio));
  assert.ok(dt, inicio);
  return dt.parentNode.childNodes[dt.parentNode.childNodes.indexOf(dt) + 1].textContent;
};
const pega = (criados) => criados.find((e) => e.getAttribute && e.getAttribute('role') === 'slider');
const tecla = (g, key, extra) => g.dispatch('keydown', Object.assign({ key, preventDefault() {} }, extra));

test('condicoes: exemplo do manual, f(x) < 0, com a solução em texto', () => {
  const { el } = montar({ pontos: [[-3, 2], [-1, -2], [1, 2], [3, -1]], sinal: '<', k: 0 });
  assert.equal(valor(el, 'Conjunto-solução'), ']−2, 0[ ∪ ]7/3, 3]');
  assert.equal(valor(el, 'f(x) = 0'), 'x = −2, x = 0, x = 7/3');
  assert.equal(valor(el, 'Domínio'), '[−3, 3]');
  assert.match(valor(el, 'Gráfico de f'), /\(−3, 2\), \(−1, −2\), \(1, 2\), \(3, −1\)/);
});

test('condicoes: a reta y = k muda com o teclado e a condição com a lista', () => {
  const { el, criados } = montar({ pontos: [[-3, 2], [-1, -2], [1, 2], [3, -1]], sinal: '>=', k: 1 });
  const g = pega(criados);
  assert.ok(g, 'pega com role slider');
  assert.equal(g.getAttribute('tabindex'), '0');
  tecla(g, 'ArrowUp');
  tecla(g, 'ArrowUp');
  assert.equal(g.getAttribute('aria-valuenow'), '2');
  assert.equal(valor(el, 'Conjunto-solução'), '{−3} ∪ {1}');
  tecla(g, 'PageUp');
  assert.equal(valor(el, 'Conjunto-solução'), '∅ (não há soluções)');
  tecla(g, 'PageDown');
  tecla(g, 'PageDown');
  tecla(g, 'ArrowDown', { shiftKey: true });
  assert.equal(g.getAttribute('aria-valuenow'), '0.9');
  const sel = el.querySelector('select');
  sel.value = '<=';
  sel.dispatch('change');
  assert.match(valor(el, 'Conjunto-solução'), /^\[/);
  assert.match(valor(el, 'Conjunto-solução de f(x) ≤ 0,9'), /∪/);
});

test('condicoes: realça a solução no eixo Ox (bolas cheias e vazias)', () => {
  const { el } = montar({ pontos: [[-3, 2], [-1, -2], [1, 2], [3, -1]], sinal: '<', k: 0 });
  const solucao = Array.from(el.querySelectorAll('g')).find((g) => g.getAttribute('data-camada') === 'solucao');
  const bolas = Array.from(solucao.childNodes).filter((n) => n.tagName === 'CIRCLE' && n.style.stroke === 'var(--cor-3)');
  assert.equal(bolas.length, 4);
  assert.deepEqual(bolas.map((b) => b.style.fill === 'var(--cor-3)'), [false, false, false, true]);
});

test('condicoes: em modo enunciado não mostra a solução nem controlos', () => {
  const { el, criados } = montar({ pontos: [[-4, 1], [-1, -2], [2, 1]], sinal: '<', k: 0, modo: 'enunciado' });
  assert.equal(el.querySelector('select'), null);
  assert.equal(pega(criados), undefined);
  const texto = el.textContent;
  assert.ok(!/Conjunto-solução|solução/i.test(texto), texto);
  assert.equal(valor(el, 'Reta'), 'y = 0');
  const solucao = Array.from(el.querySelectorAll('g')).find((g) => g.getAttribute('data-camada') === 'solucao');
  assert.equal(solucao.childNodes.length, 0);
  const svg = el.querySelector('svg');
  assert.ok(!/solução/i.test(svg.getAttribute('aria-label')), svg.getAttribute('aria-label'));
});

test('condicoes: tudo dentro do viewBox e destruir remove os ouvintes', () => {
  const { el, montado, ouvintes } = montar({ pontos: [[-5, 4], [-2, -3], [1, 0], [4, 3]], sinal: '<=', k: 3 });
  const [, , W, H] = el.querySelector('svg').getAttribute('viewBox').split(' ').map(Number);
  const n = (e, a) => Number(e.getAttribute(a));
  for (const l of Array.from(el.querySelectorAll('line'))) {
    for (const a of ['x1', 'x2']) assert.ok(n(l, a) >= -0.01 && n(l, a) <= W + 0.01, a + ' ' + n(l, a));
    for (const a of ['y1', 'y2']) assert.ok(n(l, a) >= -0.01 && n(l, a) <= H + 0.01, a + ' ' + n(l, a));
  }
  for (const c of Array.from(el.querySelectorAll('circle')).filter((c) => c.getAttribute('cx') !== null)) {
    assert.ok(n(c, 'cx') >= 0 && n(c, 'cx') <= W && n(c, 'cy') >= 0 && n(c, 'cy') <= H);
  }
  assert.ok(ouvintes() > 0);
  montado.destruir();
  assert.equal(ouvintes(), 0);
});

test('condicoes: pontos inválidos caem no exemplo por omissão', () => {
  const { el } = montar({ pontos: [[1, 2], [0, 3]], sinal: '=', k: 0 });
  assert.equal(valor(el, 'Domínio'), '[−3, 3]');
});
