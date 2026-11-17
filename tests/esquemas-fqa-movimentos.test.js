const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = ['esquemas/fqa/calculo-dados-fisica.js', 'esquemas/fqa/calculo-fisica.js', 'js/nucleo.js', 'esquemas/nucleo/controlos.js'];

function montar(id, opcoes) {
  globalThis.document = criarDocumento();
  const criados = [];
  const cria = document.createElement;
  const criaNS = document.createElementNS;
  document.createElement = (t) => { const e = cria(t); criados.push(e); return e; };
  document.createElementNS = (n, t) => { const e = criaNS(n, t); criados.push(e); return e; };
  const M = carregar(...BASE, 'esquemas/fqa/' + id + '.js');
  const el = document.createElement('div');
  const montado = M.esquemas.obter(id).montar(el, opcoes);
  const ouvintes = () => criados.reduce((n, e) => n + Object.values(e.ouvintes).reduce((a, l) => a + l.length, 0), 0);
  return { M, el, montado, ouvintes };
}
const ver = (el) => el.textContent;
const slider = (el, k) => el.querySelectorAll('input')[k];
function mexer(el, k, v) { const s = slider(el, k); s.value = String(v); s.dispatch('input'); }
function botao(el, txt) { const b = Array.from(el.querySelectorAll('button')).find((x) => x.textContent.includes(txt)); assert.ok(b, txt); b.click(); }
function ciclo(id, opcoes) {
  const { montado, ouvintes } = montar(id, opcoes);
  assert.ok(ouvintes() > 0, 'tem ouvintes ativos');
  montado.destruir();
  assert.equal(ouvintes(), 0, 'zero ouvintes depois de destruir');
}
const valor = (el, rotulo) => {
  const dts = Array.from(el.querySelectorAll('dt'));
  const dt = dts.find((d) => d.textContent === rotulo);
  assert.ok(dt, rotulo);
  return dt.parentNode.childNodes[dt.parentNode.childNodes.indexOf(dt) + 1].textContent;
};

test('os três esquemas montam e desmontam sem ouvintes', () => {
  ciclo('fqa-energias');
  ciclo('fqa-trabalho');
  ciclo('fqa-ressalto');
});

test('fqa-energias: sem atrito, Em é constante ao longo do percurso', () => {
  const { el } = montar('fqa-energias', { percurso: 'montanha-russa', h0: 3, v0: 2 });
  const total = slider(el, 3).max;
  const lidos = new Set();
  for (const s of [0, 1.5, 4, 7, 9.5, Number(total)]) {
    mexer(el, 3, s);
    lidos.add(valor(el, 'Energia mecânica Em = Ec + Epg'));
    assert.ok(!/NaN/.test(ver(el)));
  }
  assert.equal(lidos.size, 1, Array.from(lidos).join(' | '));
  assert.ok(!/O carrinho para/.test(ver(el)));
});

test('fqa-energias: com atrito grande o carrinho para e não há NaN', () => {
  const { el } = montar('fqa-energias', { percurso: 'rampa-plano', h0: 2.5, v0: 0, Fa: 3 });
  mexer(el, 3, 8);
  assert.match(ver(el), /O carrinho para em s = [\d,]+ m/);
  assert.ok(!/NaN|undefined/.test(ver(el)));
});

test('fqa-energias: numa subida para momentaneamente', () => {
  const { el } = montar('fqa-energias', { percurso: 'montanha-russa', h0: 2.2, v0: 0, Fa: 1.5 });
  assert.match(ver(el), /momentaneamente/);
  assert.match(ver(el), /O carrinho para em s = /);
});

test('fqa-energias: botões de percurso e teclado', () => {
  const { el, montado } = montar('fqa-energias');
  botao(el, 'Montanha-russa');
  const svg = el.querySelectorAll('svg')[0];
  svg.dispatch('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(Number(slider(el, 3).value), 0.1);
  assert.ok(!/NaN/.test(ver(el)));
  montado.destruir();
});

test('fqa-trabalho: a 90° mostra W = 0 J, trabalho nulo', () => {
  const { el } = montar('fqa-trabalho', { F: 30, d: 4, alfa: 90 });
  assert.match(ver(el), /W = 0 J/);
  assert.match(ver(el), /trabalho nulo/);
});

test('fqa-trabalho: potente a 0° e resistente a 180°, com sinal', () => {
  const { el } = montar('fqa-trabalho', { F: 10, d: 5, alfa: 0 });
  assert.match(ver(el), /W = 50 J/);
  assert.match(ver(el), /trabalho potente/);
  mexer(el, 2, 180);
  assert.match(ver(el), /W = −50 J/);
  assert.match(ver(el), /trabalho resistente/);
});

test('fqa-ressalto: h0 = 1 e fração 0,8 dão 0,80, 0,64 e 0,51', () => {
  const { el } = montar('fqa-ressalto', { h0: 1, fracao: 0.8 });
  const t = ver(el);
  assert.ok(t.includes('0,80') && t.includes('0,64') && t.includes('0,51'), t);
  assert.ok(!/NaN/.test(t));
  assert.equal(Array.from(el.querySelectorAll('tr')).length, 6);
});

test('fqa-trabalho: setas e rótulos ficam dentro do viewBox para α notáveis e F máximo', () => {
  for (const alfa of [0, 90, 135, 180]) {
    for (const d of [0, 10]) {
      const { el } = montar('fqa-trabalho', { F: 100, d, alfa });
      const svg = el.querySelectorAll('svg')[0];
      const largura = Number(svg.getAttribute('viewBox').split(' ')[2]);
      const dentro = (x, ctx) => assert.ok(x >= 0 && x <= largura, ctx + ' x = ' + x + ' (α = ' + alfa + ')');
      Array.from(el.querySelectorAll('line')).forEach((l) => { dentro(Number(l.getAttribute('x1')), 'line x1'); dentro(Number(l.getAttribute('x2')), 'line x2'); });
      Array.from(el.querySelectorAll('polygon')).forEach((p) => p.getAttribute('points').split(' ').forEach((pt) => dentro(Number(pt.split(',')[0]), 'seta')));
      Array.from(el.querySelectorAll('text')).forEach((t) => {
        const x = Number(t.getAttribute('x')), w = t.textContent.length * 5.5, a = t.getAttribute('text-anchor');
        const [e, dd] = a === 'end' ? [x - w, x] : a === 'middle' ? [x - w / 2, x + w / 2] : [x, x + w];
        dentro(e, 'texto "' + t.textContent + '" esquerda'); dentro(dd, 'texto "' + t.textContent + '" direita');
      });
    }
  }
});

test('fqa-trabalho: as setas do teclado mudam o ângulo', () => {
  const { el } = montar('fqa-trabalho', { F: 10, d: 5, alfa: 30 });
  const svg = el.querySelectorAll('svg')[0];
  svg.dispatch('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(Number(slider(el, 2).value), 31);
  svg.dispatch('keydown', { key: 'ArrowLeft', shiftKey: true, preventDefault() {} });
  assert.equal(Number(slider(el, 2).value), 21);
  assert.match(ver(el), /α = 21°/);
});
