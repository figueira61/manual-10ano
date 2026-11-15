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

test('posicoes: 375 px não passa a largura e usa lista', () => {
  const { figura } = carregar(...FICHEIROS);
  const p = figura.posicoes(def(), 'explodida', 375);
  for (const id of Object.keys(p)) assert.ok(p[id].legenda.x + p[id].legenda.largura <= 375, id);
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
