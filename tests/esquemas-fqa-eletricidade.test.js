const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = ['esquemas/fqa/calculo-dados-fisica.js', 'esquemas/fqa/calculo-fisica.js', 'js/nucleo.js', 'esquemas/nucleo/controlos.js', 'esquemas/nucleo/figura.js'];

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
  const dt = Array.from(el.querySelectorAll('dt')).find((d) => d.textContent === rotulo);
  assert.ok(dt, rotulo);
  return dt.parentNode.childNodes[dt.parentNode.childNodes.indexOf(dt) + 1].textContent;
};
const resumo = (el) => Array.from(el.querySelectorAll('p')).find((p) => p.classes.has('esq-resumo'));

// Todos os elementos desenhados (texto estimado por caracteres) ficam dentro do viewBox.
function dentroDoViewBox(el, ctx) {
  const svg = el.querySelectorAll('svg')[0];
  const [, , W, H] = svg.getAttribute('viewBox').split(' ').map(Number);
  const x = (v, o) => assert.ok(v >= 0 && v <= W, ctx + ' ' + o + ' x = ' + v);
  const y = (v, o) => assert.ok(v >= 0 && v <= H, ctx + ' ' + o + ' y = ' + v);
  const num = (e, k) => Number(e.getAttribute(k));
  Array.from(el.querySelectorAll('line')).forEach((l) => { x(num(l, 'x1'), 'line'); x(num(l, 'x2'), 'line'); y(num(l, 'y1'), 'line'); y(num(l, 'y2'), 'line'); });
  Array.from(el.querySelectorAll('rect')).forEach((r) => {
    x(num(r, 'x'), 'rect'); x(num(r, 'x') + num(r, 'width'), 'rect'); y(num(r, 'y'), 'rect'); y(num(r, 'y') + num(r, 'height'), 'rect');
  });
  Array.from(el.querySelectorAll('circle')).forEach((c) => {
    const r = num(c, 'r');
    x(num(c, 'cx') - r, 'circle'); x(num(c, 'cx') + r, 'circle'); y(num(c, 'cy') - r, 'circle'); y(num(c, 'cy') + r, 'circle');
  });
  Array.from(el.querySelectorAll('path')).forEach((p) => {
    let cx = 0, cy = 0;
    (p.getAttribute('d').match(/[MLHV][^MLHV]*/g) || []).forEach((seg) => {
      const n = seg.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (seg[0] === 'H') cx = n[0]; else if (seg[0] === 'V') cy = n[0]; else { cx = n[0]; cy = n[1]; }
      x(cx, 'path'); y(cy, 'path');
    });
  });
  Array.from(el.querySelectorAll('text')).forEach((t) => {
    const tx = num(t, 'x'), ty = num(t, 'y'), tam = num(t, 'font-size') || 10;
    const w = t.textContent.length * tam * 0.6, a = t.getAttribute('text-anchor');
    const [e, d] = a === 'end' ? [tx - w, tx] : a === 'middle' ? [tx - w / 2, tx + w / 2] : [tx, tx + w];
    x(e, 'texto "' + t.textContent + '" esquerda'); x(d, 'texto "' + t.textContent + '" direita');
    y(ty - tam, 'texto "' + t.textContent + '" topo'); y(ty + tam * 0.25, 'texto "' + t.textContent + '" base');
  });
}

test('os esquemas de eletricidade montam e desmontam sem ouvintes', () => {
  ciclo('fqa-circuito');
  ciclo('fqa-gerador');
  ciclo('fig-circuito', {});
});

test('fqa-circuito: 6 Ω e 3 Ω em paralelo a 6 V dão Req = 2 Ω, I = 3 A, 1 A e 2 A', () => {
  const { el } = montar('fqa-circuito', { ligacao: 'paralelo', n: 2, rs: [6, 3], U: 6 });
  assert.equal(valor(el, 'Resistência equivalente Req'), '2,00 Ω');
  assert.equal(valor(el, 'Corrente total I (amperímetro)'), '3,00 A');
  assert.match(valor(el, 'Resistência R1 = 6 Ω'), /^I = 1,00 A; U = 6,00 V; P = 6,00 W$/);
  assert.match(valor(el, 'Resistência R2 = 3 Ω'), /^I = 2,00 A; U = 6,00 V; P = 12,00 W$/);
  assert.match(resumo(el).textContent, /Req = 2,00 Ω, I = 3,00 A; I1 = 1,00 A, I2 = 2,00 A/);
  assert.ok(!/NaN|Infinity|undefined/.test(ver(el)));
});

test('fqa-circuito: em série soma as resistências e a corrente é comum', () => {
  const { el } = montar('fqa-circuito', { ligacao: 'serie', n: 3, rs: [2, 4, 6], U: 12 });
  assert.equal(valor(el, 'Resistência equivalente Req'), '12,00 Ω');
  assert.equal(valor(el, 'Corrente total I (amperímetro)'), '1,00 A');
  assert.match(valor(el, 'Resistência R3 = 6 Ω'), /^I = 1,00 A; U = 6,00 V; P = 6,00 W$/);
  assert.ok(ver(el).includes('A') && Array.from(el.querySelectorAll('text')).some((t) => t.textContent === 'V'));
});

test('fqa-circuito: botões e sliders atualizam; o aria-live é uma linha só', () => {
  const { el } = montar('fqa-circuito', {});
  const vivos = Array.from(el.querySelectorAll('p')).filter((p) => p.getAttribute('aria-live'));
  assert.equal(vivos.length, 1);
  assert.ok(!/\n/.test(vivos[0].textContent));
  botao(el, 'Em série');
  mexer(el, 0, 12);
  assert.match(resumo(el).textContent, /^Em série a 12,0 V/);
  botao(el, '3 resistências');
  assert.equal(el.querySelectorAll('input').length, 4);
  assert.match(valor(el, 'Resistência R3 = 6 Ω'), /^I = /);
  const svg = el.querySelectorAll('svg')[0];
  svg.dispatch('keydown', { key: 'ArrowLeft', preventDefault() {} });
  assert.equal(Number(slider(el, 0).value), 11.5);
});

test('fqa-circuito: tudo dentro do viewBox, em série e em paralelo, com valores extremos', () => {
  for (const ligacao of ['serie', 'paralelo']) {
    for (const n of [2, 3]) {
      for (const [U, R] of [[12, 1], [12, 20], [1, 1], [12.5, 10]]) {
        const { el } = montar('fqa-circuito', { ligacao, n, rs: [R, R, R], U });
        dentroDoViewBox(el, ligacao + ' n=' + n + ' U=' + U + ' R=' + R);
      }
    }
  }
});

test('fqa-gerador: Rext = 0 mostra curto-circuito, I = ε/r, U = 0, rendimento 0, sem Infinity nem NaN', () => {
  const { el, M } = montar('fqa-gerador', { Rext: 0 });
  const { epsilon, r } = M.dadosFisica.modelos.pilha;
  assert.match(ver(el), /urto-circuito/);
  assert.equal(valor(el, 'Corrente I'), (epsilon / r).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' A (I = ε/r, a corrente máxima)');
  assert.match(valor(el, 'Tensão nos terminais U'), /^0,00 V/);
  assert.equal(valor(el, 'Rendimento η = U/ε'), '0,0 %');
  assert.match(resumo(el).textContent, /^Curto-circuito/);
  assert.ok(!/Infinity|NaN|undefined/.test(ver(el)));
});

test('fqa-gerador: Rext = 3 Ω com a pilha dá I = 1 A, U = 3 V e balanço de potências', () => {
  const { el } = montar('fqa-gerador', { Rext: 3 });
  assert.equal(valor(el, 'Corrente I'), '1,00 A');
  assert.equal(valor(el, 'Tensão nos terminais U'), '3,00 V');
  assert.equal(valor(el, 'Potência útil UI'), '3,00 W');
  assert.equal(valor(el, 'Potência dissipada no gerador rI²'), '1,50 W');
  assert.equal(valor(el, 'Potência total εI'), '4,50 W');
  assert.equal(valor(el, 'Rendimento η = U/ε'), '66,7 %');
  assert.ok(!/urto-circuito \(/.test(ver(el)));
});

test('fqa-gerador: slider e teclado, sem NaN em todo o intervalo', () => {
  const { el } = montar('fqa-gerador', {});
  for (const v of [0, 0.5, 1.5, 10, 20]) { mexer(el, 0, v); assert.ok(!/Infinity|NaN/.test(ver(el)), 'Rext = ' + v); }
  mexer(el, 0, 1.5);
  assert.ok(!/urto-circuito \(/.test(ver(el)));
  el.querySelectorAll('svg')[0].dispatch('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(Number(slider(el, 0).value), 2);
  const vivos = Array.from(el.querySelectorAll('p')).filter((p) => p.getAttribute('aria-live'));
  assert.equal(vivos.length, 1);
});

test('fqa-gerador: tudo dentro do viewBox para valores extremos', () => {
  for (const Rext of [0, 0.5, 3, 20]) {
    for (const [epsilon, r] of [[12, 0.5], [1, 5], [4.5, 1.5], [12, 5], [1, 0.5]]) {
      const { el } = montar('fqa-gerador', { Rext, epsilon, r });
      dentroDoViewBox(el, 'Rext=' + Rext + ' ε=' + epsilon + ' r=' + r);
    }
  }
});

test('fig-circuito: tem as 6 partes e descreve o papel do amperímetro e do voltímetro', () => {
  const { el } = montar('fig-circuito', {});
  for (const r of ['Fonte', 'Interruptor', 'Resistência', 'Amperímetro', 'Voltímetro', 'Fios']) assert.ok(ver(el).includes(r), r);
  const fonte = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'esquemas/fqa/fig-circuito.js'), 'utf8');
  assert.match(fonte, /amperímetro liga-se em série e mede a corrente/);
  assert.match(fonte, /voltímetro liga-se em paralelo com o componente/);
});
