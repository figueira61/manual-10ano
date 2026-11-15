const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = ['esquemas/fqa/calculo-dados.js', 'esquemas/fqa/calculo-quimica.js', 'esquemas/fqa/calculo-moleculas.js',
  'esquemas/mat-a/formatar.js', 'js/nucleo.js', 'esquemas/nucleo/controlos.js', 'esquemas/nucleo/proj3d.js', 'esquemas/nucleo/figura.js'];

// Monta um esquema com o documento falso e regista os elementos criados (para contar ouvintes).
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
function escolher(el, k, v) { const s = el.querySelectorAll('select')[k]; s.value = v; s.dispatch('change'); }
function botao(el, txt) { const b = Array.from(el.querySelectorAll('button')).find((x) => x.textContent.includes(txt)); assert.ok(b, txt); b.click(); }
function ciclo(id, opcoes) {
  const { montado, ouvintes } = montar(id, opcoes);
  assert.ok(ouvintes() > 0, 'tem ouvintes ativos');
  montado.destruir();
  assert.equal(ouvintes(), 0, 'zero ouvintes depois de destruir');
}

// ---------- catálogo: atomos3d e retoques ----------

test('catálogo: atomos3d válido e com os ângulos de ligação do catálogo', () => {
  const M = carregar(...BASE);
  const ids = ['HCl', 'H2O', 'NH3', 'CH4', 'CO2', 'BF3', 'HCN', 'O3'];
  for (const id of ids) {
    const m = M.moleculas.obter(id);
    assert.deepEqual(M.moleculas.validar(id), [], id);
    assert.equal(m.atomos3d.length, m.atomos.length, id);
    const c = M.moleculas.centrais(id)[0];
    if (c === undefined) continue;
    const viz = m.ligacoes.map(([i, j]) => (i === c ? j : j === c ? i : -1)).filter((x) => x >= 0);
    const v = viz.map((j) => ['x', 'y', 'z'].map((k) => m.atomos3d[j][k] - m.atomos3d[c][k]));
    for (let a = 0; a < v.length; a++) for (let b = a + 1; b < v.length; b++) {
      const dot = v[a][0] * v[b][0] + v[a][1] * v[b][1] + v[a][2] * v[b][2];
      const ang = Math.acos(dot / (Math.hypot(...v[a]) * Math.hypot(...v[b]))) * 180 / Math.PI;
      assert.ok(Math.abs(ang - m.angulo) < 0.1, id + ' ' + ang);
    }
  }
});

test('catálogo: N2 é nitrogénio; atomos3d desalinhado é rejeitado', () => {
  const M = carregar(...BASE);
  assert.equal(M.moleculas.obter('N2').nome, 'nitrogénio');
  const m = M.moleculas.obter('H2O');
  const guarda = m.atomos3d;
  m.atomos3d = guarda.slice(0, 2);
  assert.ok(M.moleculas.validar('H2O').length > 0);
  m.atomos3d = guarda;
});

test('catálogo: os dois pares não ligantes da água ficam simétricos acima do O', () => {
  const M = carregar(...BASE);
  const [p1, p2] = M.moleculas.disposicao('H2O').atomos[0].paresAngulos;
  assert.ok(Math.abs((p1 + p2) - 540) < 1e-9, 'simétricos em torno da vertical (270°)');
  assert.ok(p1 > 180 && p2 < 360 && p2 - p1 >= 90, 'abertos');
});

// ---------- fqa-molecula: alt, notas e padding ----------

test('fqa-molecula: alt nomeia átomos e ligações, sem nome da molécula', () => {
  const { el } = montar('fqa-molecula', { molecula: 'H2O', modo: 'lewis' });
  const alt = el.querySelector('svg').getAttribute('aria-label');
  assert.ok(alt.includes('O ligado a 2 H'), alt);
  assert.ok(alt.includes('2 pares não ligantes no O'), alt);
  assert.ok(!/água|angular|polar/i.test(alt), alt);
  const est = montar('fqa-molecula', { molecula: 'CO2' }).el.querySelector('svg').getAttribute('aria-label');
  assert.ok(est.includes('C ligado a 2 O por ligação dupla'), est);
  assert.ok(!/pares não ligantes/.test(est), est);
});

test('fqa-molecula: mostrarInfo mostra a nota do O3, a nota do propeno e tem padding', () => {
  const o3 = montar('fqa-molecula', { molecula: 'O3', mostrarInfo: true }).el;
  assert.match(o3.querySelector('.mol-info').textContent, /ressonância/);
  const p = montar('fqa-molecula', { molecula: 'C3H6', mostrarInfo: true }).el.querySelector('.mol-info');
  assert.match(p.textContent, /0,4 D/);
  assert.ok(p.style.padding, 'padding');
  const sem = montar('fqa-molecula', { molecula: 'O3' }).el;
  assert.ok(!/ressonância/.test(sem.textContent) && !/ressonância/.test(sem.querySelector('svg').getAttribute('aria-label')));
});

// ---------- fqa-energia-distancia ----------

test('potencialMorse: mínimo (re, −De) com os valores de dadosQuimicos', () => {
  const M = carregar(...BASE);
  for (const [k, re, De] of [['H-H', 74, 432], ['Cl-Cl', 199, 240], ['H-Cl', 127, 428]]) {
    const l = M.dadosQuimicos.ligacoes[k];
    assert.equal(l.comprimento, re);
    assert.equal(l.energia, De);
    const m = M.quimica.potencialMorse(k, re);
    assert.ok(Math.abs(m.V + De) < 1e-9);
    assert.ok(M.quimica.potencialMorse(k, re - 10).V > -De && M.quimica.potencialMorse(k, re + 10).V > -De);
    assert.ok(M.quimica.potencialMorse(k, 100 * re).V > -0.001 * De, 'tende para 0');
    assert.ok(M.quimica.potencialMorse(k, 0.5 * re).V > 0, 'repulsão forte: energia positiva');
  }
});

test('fqa-energia-distancia: H–H marca o mínimo em 74 pm e −432 kJ/mol', () => {
  const { el } = montar('fqa-energia-distancia', {});
  assert.equal(el.querySelectorAll('circle.minimo').length, 1);
  assert.ok(ver(el).includes('mínimo: 74 pm; −432 kJ/mol'));
  assert.ok(ver(el).includes('Equilíbrio'));
  assert.ok(ver(el).includes('ilustrativa'));
  assert.ok(ver(el).includes('a = 0,0243'));
  assert.equal(el.querySelectorAll('path.curva').length, 1);
});

test('fqa-energia-distancia: atração à direita do mínimo, repulsão à esquerda, longe = átomos independentes', () => {
  const { el } = montar('fqa-energia-distancia', {});
  mexer(el, 0, 50);
  assert.ok(ver(el).includes('Predomina a repulsão'));
  mexer(el, 0, 100);
  assert.ok(ver(el).includes('Predomina a atração'));
  mexer(el, 0, 222);
  assert.ok(ver(el).includes('praticamente independentes'));
});

test('fqa-energia-distancia: outras ligações usam os dados; teclado altera r; ciclo sem ouvintes', () => {
  const { el } = montar('fqa-energia-distancia', { ligacao: 'Cl-Cl' });
  assert.ok(ver(el).includes('199 pm') && ver(el).includes('240 kJ/mol'));
  escolher(el, 0, 'H-Cl');
  assert.ok(ver(el).includes('mínimo: 127 pm; −428 kJ/mol'));
  const svg = el.querySelector('svg');
  svg.ouvintes.keydown[0]({ key: 'ArrowRight', preventDefault() {}, shiftKey: false });
  assert.ok(ver(el).includes('132 pm'));
  ciclo('fqa-energia-distancia', {});
});

// ---------- fqa-geometria ----------

test('fqa-geometria: NH3 mostra piramidal trigonal, polar, 1 par não ligante e 107°', () => {
  const { el } = montar('fqa-geometria', { molecula: 'NH3' });
  const t = ver(el);
  assert.ok(t.includes('piramidal trigonal'));
  assert.ok(t.includes('molécula polar'));
  assert.ok(t.includes('≈ 107°'));
  assert.equal(el.querySelectorAll('circle.atomo3d').length, 4);
  assert.equal(el.querySelectorAll('line.ligacao3d').length, 3);
  assert.equal(el.querySelectorAll('circle.par-nl').length, 1);
});

test('fqa-geometria: todas as moléculas da lista (≥ 8) têm lóbulos = pares não ligantes e ligações = soma das ordens', () => {
  const { el, M } = montar('fqa-geometria', {});
  const opcoes = Array.from(el.querySelectorAll('option'));
  assert.ok(opcoes.length >= 8);
  for (const o of opcoes) {
    escolher(el, 0, o.value);
    const m = M.moleculas.catalogo[o.value];
    const c = M.moleculas.centrais(o.value)[0];
    const centro = c !== undefined ? c : m.atomos.findIndex((a) => a.el !== 'H');
    assert.equal(el.querySelectorAll('circle.par-nl').length, m.atomos[centro].pares, o.value);
    assert.equal(el.querySelectorAll('circle.atomo3d').length, m.atomos.length, o.value);
    const ordens = m.ligacoes.reduce((s, l) => s + l[2], 0);
    assert.equal(el.querySelectorAll('line.ligacao3d').length, ordens, o.value);
    assert.ok(ver(el).includes(m.geometria), o.value);
    assert.ok(ver(el).includes(m.polar ? 'molécula polar' : 'molécula apolar'), o.value);
  }
});

test('fqa-geometria: H2O (angular, 104,5°, 2 pares), CO2 (apolar, 180°) e BF3 (exceção ao octeto)', () => {
  const { el } = montar('fqa-geometria', { molecula: 'H2O' });
  assert.ok(ver(el).includes('angular') && ver(el).includes('104,5°'));
  assert.ok(ver(el).includes('Pares não ligantes no O'));
  escolher(el, 0, 'CO2');
  assert.ok(ver(el).includes('linear') && ver(el).includes('180°') && ver(el).includes('molécula apolar'));
  escolher(el, 0, 'BF3');
  assert.ok(ver(el).includes('triangular plana') && ver(el).includes('6 eletrões'));
});

test('fqa-geometria: roda com botões e teclado; o aria-label muda; ciclo sem ouvintes', () => {
  const { el } = montar('fqa-geometria', { molecula: 'CH4' });
  const svg = el.querySelector('svg');
  const antes = svg.getAttribute('aria-label');
  botao(el, '▶');
  const depois = svg.getAttribute('aria-label');
  assert.notEqual(antes, depois);
  svg.ouvintes.keydown[0]({ key: 'ArrowUp', preventDefault() {} });
  assert.notEqual(svg.getAttribute('aria-label'), depois);
  botao(el, 'Repor vista');
  assert.equal(svg.getAttribute('aria-label'), antes);
  assert.equal(svg.getAttribute('role'), 'group');
  ciclo('fqa-geometria', {});
});

// ---------- fqa-diluicao ----------

test('fqa-diluicao: ci = 0,5, Vi = 10 e Vf = 50 dão cf = 0,1 mol/dm³ e fator 5', () => {
  const { el } = montar('fqa-diluicao', { ci: 0.5, Vi: 10, Vf: 50 });
  const dd = Array.from(el.querySelectorAll('dd')).map((x) => x.textContent);
  assert.ok(dd.includes('0,1 mol/dm³'), dd.join(' | '));
  assert.ok(dd.includes('5'), dd.join(' | '));
  assert.ok(ver(el).includes('0,5 mol/dm³') && ver(el).includes('10 mL') && ver(el).includes('50 mL'));
  assert.equal(el.querySelectorAll('circle.soluto').length, 32, 'o mesmo número de partículas antes e depois');
  assert.equal(el.querySelectorAll('rect.liquido').length, 1);
});

test('fqa-diluicao: o slider de Vi e o balão atualizam cf e o fator; Vi nunca passa de Vf', () => {
  const { el } = montar('fqa-diluicao', { ci: 1, Vi: 10, Vf: 100 });
  assert.ok(ver(el).includes('0,1 mol/dm³'));
  mexer(el, 1, 25);
  assert.ok(Array.from(el.querySelectorAll('dd')).some((x) => x.textContent === '0,25 mol/dm³'));
  escolher(el, 0, '50');
  assert.ok(Array.from(el.querySelectorAll('dd')).some((x) => x.textContent === '0,5 mol/dm³'));
  assert.ok(Array.from(el.querySelectorAll('dd')).some((x) => x.textContent === '2'));
  assert.equal(slider(el, 1).max, '50');
  mexer(el, 0, 2);
  assert.ok(Array.from(el.querySelectorAll('dd')).some((x) => x.textContent === '1 mol/dm³'));
});

test('fqa-diluicao: monta com opções vazias e desmonta sem ouvintes', () => {
  const { el } = montar('fqa-diluicao', {});
  assert.ok(el.querySelector('svg').getAttribute('aria-label').includes('fator de diluição'));
  ciclo('fqa-diluicao', {});
  ciclo('fqa-diluicao', { ci: 0.5, Vi: 10, Vf: 50 });
});
