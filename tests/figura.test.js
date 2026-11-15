const test = require('node:test');
const assert = require('node:assert');
const { carregar } = require('./ajuda');
const { criarDocumento } = require('./dom-minimo');

const FICHEIROS = ['js/nucleo.js', 'esquemas/nucleo/figura.js'];

function def(extra) {
  return Object.assign({
    titulo: 'Átomo de teste',
    largura: 200,
    altura: 120,
    partes: [
      { id: 'nucleo', rotulo: 'Núcleo', descricao: 'Protões e neutrões.', explodir: { dx: 0, dy: -30 },
        desenhar: (g, c) => g.appendChild(c('circle', { cx: 100, cy: 60, r: 15 })) },
      { id: 'nuvem', rotulo: 'Nuvem eletrónica', descricao: 'Zona dos eletrões.', explodir: { dx: 40, dy: 10 },
        desenhar: (g, c) => g.appendChild(c('circle', { cx: 100, cy: 60, r: 50 })) },
      { id: 'eletrao', rotulo: 'Eletrão', explodir: { dx: -40, dy: 20 },
        desenhar: (g, c) => g.appendChild(c('circle', { cx: 150, cy: 60, r: 4 })) },
    ],
  }, extra);
}

function montar(opcoes, extra) {
  const M = carregar(...FICHEIROS);
  globalThis.document = criarDocumento();
  const el = document.createElement('div');
  const inst = M.figura.criarEsquema(def(extra)).montar(el, opcoes || {});
  return { M, el, inst };
}

test('proximoEstado: máquina de estados', () => {
  const { figura } = carregar(...FICHEIROS);
  assert.equal(figura.proximoEstado('montada', 'separar'), 'explodida');
  assert.equal(figura.proximoEstado('explodida', 'juntar'), 'montada');
  for (const e of ['montada', 'explodida']) {
    const f = figura.proximoEstado(e, { tipo: 'focar', id: 'a' });
    assert.deepEqual(f, { foco: 'a', anterior: e });
    assert.equal(figura.proximoEstado(f, 'esc'), e);
  }
  const f2 = figura.proximoEstado(figura.proximoEstado('explodida', { tipo: 'focar', id: 'a' }), { tipo: 'focar', id: 'b' });
  assert.deepEqual(f2, { foco: 'b', anterior: 'explodida' });
  assert.equal(figura.proximoEstado('montada', 'esc'), 'montada');
});

test('posicoes: 375 px usa lista (modo e legendas)', () => {
  const { figura } = carregar(...FICHEIROS);
  const p = figura.posicoes(def(), 'explodida', 375);
  assert.equal(figura.modoLegendas(375), 'lista');
  assert.equal(figura.modoLegendas(700), 'lateral');
  for (const id of Object.keys(p)) assert.equal(p[id].legenda.lista, true);
});

test('posicoes: legendas laterais cabem na largura', () => {
  const { figura } = carregar(...FICHEIROS);
  const p = figura.posicoes(def(), 'explodida', 600);
  for (const id of Object.keys(p)) {
    assert.ok(p[id].legenda.largura > 0);
    assert.ok(p[id].legenda.x >= 0 && p[id].legenda.x + p[id].legenda.largura <= 600);
  }
});

test('posicoes: explodida desloca exatamente explodir; montada fica em 0', () => {
  const { figura } = carregar(...FICHEIROS);
  const d = def();
  const e = figura.posicoes(d, 'explodida', 600);
  const m = figura.posicoes(d, 'montada', 600);
  for (const parte of d.partes) {
    assert.equal(e[parte.id].x, parte.explodir.dx);
    assert.equal(e[parte.id].y, parte.explodir.dy);
    assert.equal(m[parte.id].x, 0);
    assert.equal(m[parte.id].y, 0);
  }
});

test('svgSeguro rejeita marcação perigosa', () => {
  const { figura } = carregar(...FICHEIROS);
  assert.equal(figura.svgSeguro('<g><circle r="3"/></g>'), true);
  assert.equal(figura.svgSeguro('<use href="#a"/>'), true);
  for (const mau of ['<script>x()</script>', '<g onload="x()"/>', '<a href="javascript:x()"/>',
    '<foreignObject/>', '<image href="http://x.pt/a.png"/>', '<use xlink:href="//x"/>', '<G ONCLICK = "x"/>']) {
    assert.equal(figura.svgSeguro(mau), false, mau);
  }
});

test('criarEsquema lança com svg inseguro', () => {
  const { figura } = carregar(...FICHEIROS);
  const mau = def();
  mau.partes[0] = { id: 'x', rotulo: 'X', explodir: { dx: 0, dy: 0 }, svg: '<circle onload="x()" r="2"/>' };
  assert.throws(() => figura.criarEsquema(mau));
  const mau2 = def();
  mau2.partes[0] = { id: 'x', rotulo: 'X', explodir: { dx: 0, dy: 0 }, svg: '<script>1</script>' };
  assert.throws(() => figura.criarEsquema(mau2));
});

test('montar: N botões de parte com aria-label', () => {
  const { el } = montar();
  const partes = el.querySelectorAll('.figura-parte');
  assert.equal(partes.length, 3);
  for (const p of partes) {
    assert.ok(p.getAttribute('aria-label'));
    assert.equal(p.getAttribute('tabindex'), '0');
  }
  assert.equal(el.querySelectorAll('.figura-item').length, 3);
});

test('montar: separar, focar com Enter, Esc volta, juntar', () => {
  const { el, inst } = montar();
  const raiz = el.querySelector('.figura');
  const sep = el.querySelector('.figura-separar');
  assert.equal(sep.textContent, 'Separar as partes');
  assert.equal(inst.estado(), 'montada');
  sep.click();
  assert.equal(inst.estado(), 'explodida');
  assert.equal(sep.textContent, 'Juntar');
  assert.ok(raiz.classList.contains('figura-explodida'));
  const parte = el.querySelectorAll('.figura-parte')[1];
  parte.dispatch('keydown', { key: 'Enter' });
  assert.deepEqual(inst.estado(), { foco: 'nuvem', anterior: 'explodida' });
  assert.ok(parte.classList.contains('figura-foco'));
  assert.ok(el.querySelectorAll('.figura-parte')[0].classList.contains('figura-esbatida'));
  assert.match(el.querySelector('.figura-descricao').textContent, /Zona dos eletrões/);
  raiz.dispatch('keydown', { key: 'Escape' });
  assert.equal(inst.estado(), 'explodida');
  assert.equal(el.querySelector('.figura-descricao').textContent, '');
  sep.click();
  assert.equal(inst.estado(), 'montada');
});

test('montar: Ampliar abre diálogo e fecha com Fechar e Esc', () => {
  const { el } = montar();
  const amp = el.querySelector('.figura-ampliar');
  amp.click();
  const dlg = el.querySelector('.figura-dialogo');
  assert.ok(dlg);
  assert.equal(dlg.getAttribute('role'), 'dialog');
  assert.equal(dlg.getAttribute('aria-modal'), 'true');
  assert.equal(dlg.querySelectorAll('.figura-parte').length, 3);
  dlg.querySelector('.figura-fechar').click();
  assert.equal(el.querySelector('.figura-dialogo'), null);
  assert.equal(globalThis.document.activeElement, amp);
  amp.click();
  el.querySelector('.figura-dialogo').dispatch('keydown', { key: 'Escape' });
  assert.equal(el.querySelector('.figura-dialogo'), null);
  assert.equal(globalThis.document.activeElement, amp);
});

test('destruir remove os ouvintes', () => {
  const { el, inst } = montar();
  const sep = el.querySelector('.figura-separar');
  const partes = el.querySelectorAll('.figura-parte');
  const raiz = el.querySelector('.figura');
  inst.destruir();
  sep.click();
  partes[0].dispatch('keydown', { key: 'Enter' });
  assert.equal(inst.estado(), 'montada');
  for (const n of [sep, raiz, partes[0]]) {
    for (const l of Object.values(n.ouvintes)) assert.equal(l.length, 0);
  }
  assert.equal(el.querySelector('.figura'), null);
});

test('modo exercício esconde rótulos e marca o destaque', () => {
  const { el } = montar({ modo: 'exercicio', destacar: 'nuvem' });
  assert.equal(el.querySelectorAll('.figura-legenda').length, 0);
  const partes = el.querySelectorAll('.figura-parte');
  for (const p of partes) assert.ok(!/Núcleo|Nuvem|Eletrão/.test(p.getAttribute('aria-label')));
  assert.ok(!/Núcleo|Nuvem|Eletrão/.test(el.querySelector('.figura-lista').textContent));
  assert.ok(partes[1].classList.contains('figura-destaque'));
  assert.ok(!partes[0].classList.contains('figura-destaque'));
  const nums = el.querySelectorAll('.figura-num');
  assert.equal(nums.length, 1);
  assert.equal(nums[0].textContent, '2');
});

// ---------- ronda de correções 1 ----------

function montarLargura(w, opcoes, extra) {
  const M = carregar(...FICHEIROS);
  globalThis.document = criarDocumento();
  const el = document.createElement('div');
  el.clientWidth = w;
  const inst = M.figura.criarEsquema(def(extra)).montar(el, opcoes || {});
  return { M, el, inst };
}

test('375 px: modo lista com itens numerados e sem legendas laterais', () => {
  const { el } = montarLargura(375);
  assert.equal(el.querySelectorAll('.figura-legenda').length, 0);
  const itens = el.querySelectorAll('.figura-item');
  assert.equal(itens.length, 3);
  itens.forEach((it, i) => assert.ok(it.textContent.startsWith((i + 1) + '. '), it.textContent));
});

test('>= 480 px: cada caixa de legenda cabe na largura', () => {
  const { figura } = carregar(...FICHEIROS);
  for (const w of [480, 600, 900]) {
    const p = figura.posicoes(def(), 'explodida', w);
    for (const id of Object.keys(p)) {
      const l = p[id].legenda;
      assert.equal(l.lista, false);
      assert.ok(l.largura > 0 && l.x >= 0 && l.x + l.largura <= w, w + ' ' + id);
    }
  }
  const { el } = montarLargura(600);
  assert.equal(el.querySelectorAll('.figura-legenda').length, 3);
});

test('toque na legenda e no item da lista foca a parte (com propagação)', () => {
  const { el, inst } = montar();
  el.querySelector('.figura-separar').click();
  el.querySelectorAll('.figura-legenda')[0].dispatch('click', { bubbles: true });
  assert.equal(typeof inst.estado(), 'object');
  assert.equal(inst.estado().anterior, 'explodida');
  el.querySelector('.figura-svg').dispatch('click', { bubbles: true });
  assert.equal(inst.estado(), 'explodida');
  el.querySelectorAll('.figura-item')[2].dispatch('click', { bubbles: true });
  assert.equal(inst.estado().foco, 'eletrao');
  el.querySelectorAll('.figura-parte')[0].dispatch('click', { bubbles: true });
  assert.equal(inst.estado().foco, 'nucleo');
});

test('Esc com o foco em qualquer ponto do componente', () => {
  const { el, inst } = montar();
  el.querySelectorAll('.figura-parte')[0].click();
  el.querySelector('.figura-item').dispatch('keydown', { key: 'Escape', bubbles: true });
  assert.equal(inst.estado(), 'montada');
});

test('tocar fora (pointerdown no documento) volta; dentro não; destruir remove o ouvinte', () => {
  const { el, inst } = montar();
  const doc = globalThis.document;
  assert.equal(doc.ouvintes.pointerdown.length, 1);
  el.querySelectorAll('.figura-parte')[0].click();
  doc.dispatch('pointerdown', { target: el.querySelector('.figura-descricao') });
  assert.equal(typeof inst.estado(), 'object');
  doc.dispatch('pointerdown', { target: { parentNode: null } });
  assert.equal(inst.estado(), 'montada');
  inst.destruir();
  assert.equal(doc.ouvintes.pointerdown.length, 0);
});

test('destruir fecha o diálogo aberto sem mexer no foco', () => {
  const { el, inst } = montar();
  const amp = el.querySelector('.figura-ampliar');
  amp.click();
  assert.equal(globalThis.document.activeElement, el.querySelector('.figura-fechar'));
  inst.destruir();
  assert.equal(el.querySelector('.figura-dialogo'), null);
  assert.equal(el.querySelector('.figura'), null);
  assert.notEqual(globalThis.document.activeElement, amp);
});

test('modo exercício não revela o rótulo, o id nem a descrição (também no diálogo)', () => {
  const { el } = montar({ modo: 'exercicio', destacar: 'nuvem' });
  const { serializar } = require('./dom-minimo');
  el.querySelectorAll('.figura-parte')[1].click();
  assert.equal(el.querySelector('.figura-descricao').textContent, '');
  el.querySelector('.figura-ampliar').click();
  const tudo = serializar(el);
  assert.ok(!/nuvem|eletrónica|Núcleo|nucleo|Eletrão|eletrao|Zona dos|Protões/i.test(tudo), tudo);
});

test('legendas escondidas não aparecem esbatidas em montada+foco', () => {
  const { el } = montar();
  el.querySelectorAll('.figura-parte')[0].click();
  for (const l of el.querySelectorAll('.figura-legenda')) assert.ok(!l.classList.contains('figura-esbatida'));
  el.querySelector('.figura-separar').click();
  el.querySelectorAll('.figura-parte')[0].click();
  const esb = el.querySelectorAll('.figura-legenda').filter((l) => l.classList.contains('figura-esbatida'));
  assert.equal(esb.length, 2);
});

test('falha ao construir não deixa nós na página', () => {
  const M = carregar(...FICHEIROS);
  globalThis.document = criarDocumento();
  const el = document.createElement('div');
  const mau = def();
  mau.partes[1] = { id: 'x', rotulo: 'X', explodir: { dx: 0, dy: 0 }, svg: '<circle r="2"/>' };
  const esq = M.figura.criarEsquema(mau);
  assert.throws(() => esq.montar(el, {}));
  assert.equal(el.childNodes.length, 0);
  assert.equal((globalThis.document.ouvintes.pointerdown || []).length, 0);
});

test('arvoreSegura: prefixo de espaço de nomes, style, on*, href externo', () => {
  const { figura } = carregar(...FICHEIROS);
  const n = (localName, attrs, filhos) => ({
    localName,
    attributes: (attrs || []).map(([name, value]) => ({ name, localName: name.split(':').pop(), value })),
    childNodes: filhos || [],
  });
  assert.equal(figura.arvoreSegura(n('svg', [], [n('g', [['fill', 'red']], [n('circle')])])), true);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('use', [['xlink:href', '#a']])])), true);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('script')])), false);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('g', [], [n('foreignObject')])])), false);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('style')])), false);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('g', [['onclick', 'x()']])])), false);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('image', [['xlink:href', 'http://x']])])), false);
  assert.equal(figura.arvoreSegura(n('svg', [], [n('image', [['href', 'a.png']])])), false);
});

test('svgSeguro: prefixo de espaço de nomes e style/@import', () => {
  const { figura } = carregar(...FICHEIROS);
  assert.equal(figura.svgSeguro('<s:script xmlns:s="http://www.w3.org/2000/svg">x</s:script>'), false);
  assert.equal(figura.svgSeguro('<s:foreignObject xmlns:s="http://www.w3.org/2000/svg"/>'), false);
  assert.equal(figura.svgSeguro('<style>@import "http://x/a.css";</style>'), false);
  assert.equal(figura.svgSeguro('<g style="fill:url(http://x)"/>'), false);
});
