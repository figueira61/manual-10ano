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
const num = (s) => Number(String(s).replace(/[\s  ]/g, '').replace(',', '.').match(/-?[\d.]+/)[0]);
const valor = (el, rotulo) => {
  const dt = Array.from(el.querySelectorAll('dt')).find((d) => d.textContent === rotulo);
  assert.ok(dt, rotulo);
  return dt.parentNode.childNodes[dt.parentNode.childNodes.indexOf(dt) + 1].textContent;
};
const resumo = (el) => Array.from(el.querySelectorAll('p')).find((p) => p.classes.has('esq-resumo'));
const vivos = (el) => Array.from(el.querySelectorAll('p')).filter((p) => p.getAttribute('aria-live'));
const setas = (el) => Array.from(el.querySelectorAll('line')).filter((l) => l.classes.has('seta'));

// Todos os elementos desenhados (texto estimado por caracteres) ficam dentro do viewBox.
function dentroDoViewBox(el, ctx, dims) {
  const svg = el.querySelectorAll('svg')[0];
  const [, , W, H] = dims || svg.getAttribute('viewBox').split(' ').map(Number);
  const x = (v, o) => assert.ok(v >= 0 && v <= W, ctx + ' ' + o + ' x = ' + v);
  const y = (v, o) => assert.ok(v >= 0 && v <= H, ctx + ' ' + o + ' y = ' + v);
  const n = (e, k) => Number(e.getAttribute(k));
  Array.from(el.querySelectorAll('line')).forEach((l) => { x(n(l, 'x1'), 'line'); x(n(l, 'x2'), 'line'); y(n(l, 'y1'), 'line'); y(n(l, 'y2'), 'line'); });
  Array.from(el.querySelectorAll('rect')).forEach((r) => {
    x(n(r, 'x'), 'rect'); x(n(r, 'x') + n(r, 'width'), 'rect'); y(n(r, 'y'), 'rect'); y(n(r, 'y') + n(r, 'height'), 'rect');
  });
  Array.from(el.querySelectorAll('circle')).forEach((c) => {
    const r = n(c, 'r');
    x(n(c, 'cx') - r, 'circle'); x(n(c, 'cx') + r, 'circle'); y(n(c, 'cy') - r, 'circle'); y(n(c, 'cy') + r, 'circle');
  });
  Array.from(el.querySelectorAll('path')).forEach((p) => {
    let cx = 0, cy = 0;
    (p.getAttribute('d').match(/[MLHV][^MLHV]*/g) || []).forEach((seg) => {
      const v = seg.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (seg[0] === 'H') cx = v[0]; else if (seg[0] === 'V') cy = v[0]; else { cx = v[0]; cy = v[1]; }
      assert.ok(!Number.isNaN(cx) && !Number.isNaN(cy), ctx + ' path NaN ' + p.getAttribute('d'));
      x(cx, 'path'); y(cy, 'path');
    });
  });
  Array.from(el.querySelectorAll('text')).forEach((t) => {
    const tx = n(t, 'x'), ty = n(t, 'y'), tam = n(t, 'font-size') || 10;
    const w = t.textContent.length * tam * 0.6, a = t.getAttribute('text-anchor');
    const [e, d] = a === 'end' ? [tx - w, tx] : a === 'middle' ? [tx - w / 2, tx + w / 2] : [tx, tx + w];
    x(e, 'texto "' + t.textContent + '" esquerda'); x(d, 'texto "' + t.textContent + '" direita');
    y(ty - tam, 'texto "' + t.textContent + '" topo'); y(ty + tam * 0.25, 'texto "' + t.textContent + '" base');
  });
}

test('os esquemas de térmica montam e desmontam sem ouvintes', () => {
  ciclo('fqa-transferencias');
  ciclo('fqa-aquecimento');
  ciclo('fqa-mistura');
  ciclo('fqa-painel');
  ciclo('fig-calorimetro', {});
  ciclo('fig-painel', {});
});

test('fqa-transferencias: mostra os 3 mecanismos e o calor do corpo quente para o frio', () => {
  const { el } = montar('fqa-transferencias', { Tquente: 80 });
  for (const m of ['Condução', 'Convecção', 'Radiação']) assert.ok(ver(el).includes(m), m);
  assert.equal(valor(el, 'Sentido do calor'), 'do corpo quente (80 °C) para o corpo frio (20 °C)');
  assert.match(ver(el), /espontaneamente do corpo mais quente para o mais frio/);
  assert.match(ver(el), /infravermelha/);
  assert.match(resumo(el).textContent, /o calor passa do quente para o frio/);
  assert.ok(setas(el).length > 0);
});

test('fqa-transferencias: com temperaturas iguais há equilíbrio térmico e não há setas', () => {
  const { el } = montar('fqa-transferencias', {});
  mexer(el, 0, 20);
  assert.equal(valor(el, 'Sentido do calor'), 'não há (equilíbrio térmico)');
  assert.match(resumo(el).textContent, /equilíbrio térmico, não há calor/);
  assert.equal(setas(el).length, 0);
  el.querySelectorAll('svg')[0].dispatch('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(Number(slider(el, 0).value), 25);
  assert.equal(vivos(el).length, 1);
  assert.ok(!/\n/.test(vivos(el)[0].textContent));
});

test('fqa-transferencias: tudo dentro do viewBox nos extremos', () => {
  for (const T of [20, 25, 80, 200]) {
    const { el } = montar('fqa-transferencias', { Tquente: T });
    dentroDoViewBox(el, 'T=' + T);
  }
});

test('fqa-aquecimento: patamares a 0 °C e 100 °C e energia de cada troço igual à de aquecimentoGelo', () => {
  const NOMES = { gelo: 'Aquecimento do gelo', fusao: 'Fusão', agua: 'Aquecimento da água', ebulicao: 'Ebulição' };
  for (const [m, theta0, P] of [[0.5, -20, 500], [0.1, -5, 1000], [1, -20, 100], [0.3, 0, 250]]) {
    const { el, M } = montar('fqa-aquecimento', { m, theta0, P });
    const ref = M.fisica.aquecimentoGelo({ m, theta0, thetaF: 100, P, vaporizar: true });
    const pat = Array.from(el.querySelectorAll('line')).filter((l) => l.classes.has('troco-fusao') || l.classes.has('troco-ebulicao'));
    assert.equal(pat.length, 2);
    pat.forEach((l) => assert.equal(l.getAttribute('y1'), l.getAttribute('y2'), 'patamar horizontal'));
    assert.notEqual(pat[0].getAttribute('y1'), pat[1].getAttribute('y1'));
    assert.ok(ver(el).includes('Fusão a 0 °C') && ver(el).includes('Ebulição a 100 °C'));
    ref.forEach((s) => {
      const rot = Array.from(el.querySelectorAll('dt')).find((d) => d.textContent.startsWith(NOMES[s.fase]));
      assert.ok(rot, s.fase);
      const v = rot.parentNode.childNodes[rot.parentNode.childNodes.indexOf(rot) + 1].textContent;
      assert.ok(Math.abs(num(v.split(';')[0]) - s.Q / 1000) <= 0.051, s.fase + ' ' + v);
    });
    assert.ok(!/NaN|Infinity|undefined/.test(ver(el)));
  }
});

test('fqa-aquecimento: sliders, teclado e aria-live único', () => {
  const { el } = montar('fqa-aquecimento', {});
  mexer(el, 2, 1000);
  assert.match(resumo(el).textContent, /P = 1000 W/);
  mexer(el, 1, 0);
  assert.ok(!ver(el).includes('Aquecimento do gelo'));
  el.querySelectorAll('svg')[0].dispatch('keydown', { key: 'ArrowLeft', preventDefault() {} });
  assert.equal(Number(slider(el, 2).value), 950);
  assert.equal(vivos(el).length, 1);
});

test('fqa-aquecimento: tudo dentro do viewBox nos extremos', () => {
  for (const m of [0.1, 1]) for (const theta0 of [-20, 0]) for (const P of [100, 1000]) {
    const { el } = montar('fqa-aquecimento', { m, theta0, P });
    dentroDoViewBox(el, 'm=' + m + ' θ0=' + theta0 + ' P=' + P);
  }
});

test('fqa-mistura: água + água dá θeq pela média ponderada e ΣQ = 0', () => {
  const { el } = montar('fqa-mistura', { tipo: 'agua-agua', m1: 0.2, theta1: 20, m2: 0.1, theta2: 80 });
  assert.equal(valor(el, 'Temperatura de equilíbrio θeq'), '40,0 °C');
  assert.match(valor(el, 'Balanço Q cedido + Q recebido'), /= 0,00 kJ$/);
  assert.ok(!/NaN|Infinity|undefined/.test(ver(el)));
});

test('fqa-mistura: água + metal usa a capacidade térmica mássica de dadosFisica', () => {
  const { el, M } = montar('fqa-mistura', { tipo: 'agua-metal', metal: 'cobre', m1: 0.2, theta1: 20, m2: 0.1, theta2: 100 });
  assert.match(valor(el, 'Capacidade térmica mássica do cobre'), new RegExp('^' + M.dadosFisica.capacidadeTermicaMassica.cobre + ' '));
  const ref = M.fisica.mistura([{ m: 0.2, fase: 'agua', theta: 20 }, { m: 0.1, c: M.dadosFisica.capacidadeTermicaMassica.cobre, theta: 100 }]);
  assert.equal(valor(el, 'Temperatura de equilíbrio θeq'), ref.thetaEq.toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' °C');
  for (const [id, nome] of [['aluminio', 'Alumínio'], ['ferro', 'Ferro'], ['chumbo', 'Chumbo']]) {
    Array.from(el.querySelectorAll('button')).find((b) => b.textContent === nome).click();
    assert.match(valor(el, 'Capacidade térmica mássica do ' + nome.toLowerCase()), new RegExp('^' + M.dadosFisica.capacidadeTermicaMassica[id] + ' '));
  }
});

test('fqa-mistura: com gelo em excesso θeq = 0 °C e "gelo por derreter"', () => {
  const { el, M } = montar('fqa-mistura', { tipo: 'agua-gelo', m1: 0.1, theta1: 10, m2: 0.5 });
  assert.equal(valor(el, 'Temperatura de equilíbrio θeq'), '0,0 °C (gelo por derreter)');
  assert.match(ver(el), /gelo por derreter/);
  assert.match(resumo(el).textContent, /^θeq = 0 °C: há gelo por derreter/);
  const ref = M.fisica.mistura([{ m: 0.1, fase: 'agua', theta: 10 }, { m: 0.5, fase: 'gelo', theta: 0 }]);
  assert.equal(ref.thetaEq, 0);
  assert.equal(num(valor(el, 'Gelo por derreter')), Math.round(ref.geloRestante * 1000));
  assert.match(valor(el, 'Balanço Q cedido + Q recebido'), /= 0,00 kJ$/);
});

test('fqa-mistura: com pouco gelo todo derrete, sem gelo por derreter', () => {
  const { el } = montar('fqa-mistura', { tipo: 'agua-gelo', m1: 0.5, theta1: 80, m2: 0.05 });
  assert.ok(!/gelo por derreter/.test(ver(el)));
  assert.match(valor(el, 'Gelo derretido'), /^50 g de 50 g$/);
});

test('fqa-mistura: botões, sliders e aria-live único; gelo desativa θ2; sem NaN', () => {
  const { el } = montar('fqa-mistura', {});
  botao(el, 'Água + gelo');
  assert.ok(slider(el, 3).disabled);
  botao(el, 'Água + metal');
  assert.ok(!slider(el, 3).disabled);
  for (const v of [0, 50, 100]) { mexer(el, 3, v); mexer(el, 1, 100 - v); assert.ok(!/NaN|Infinity|undefined/.test(ver(el))); }
  assert.equal(vivos(el).length, 1);
  assert.ok(!/\n/.test(vivos(el)[0].textContent));
});

test('fqa-mistura: tudo dentro do viewBox para todos os tipos e extremos', () => {
  for (const tipo of ['agua-agua', 'agua-metal', 'agua-gelo']) for (const metal of ['aluminio', 'chumbo']) {
    for (const [m1, t1, m2, t2] of [[0.05, 0, 1, 100], [1, 100, 0.05, 0], [1, 100, 1, 100]]) {
      const { el } = montar('fqa-mistura', { tipo, metal, m1, theta1: t1, m2, theta2: t2 });
      dentroDoViewBox(el, tipo + ' ' + metal + ' ' + [m1, t1, m2, t2]);
    }
  }
});

test('fqa-painel: mostra o ponto de potência máxima e um rendimento que nunca passa de 100 %', () => {
  const { el, M } = montar('fqa-painel', {});
  assert.ok(ver(el).includes('potência máxima'));
  assert.ok(Array.from(el.querySelectorAll('circle')).some((c) => c.classes.has('ponto-max')));
  assert.ok(Array.from(el.querySelectorAll('path')).some((p) => p.classes.has('curva')));
  const mx = M.fisica.painelPotenciaMaxima(1000);
  assert.ok(valor(el, 'Ponto de potência máxima').endsWith('P = ' + mx.P.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' W'));
  assert.match(ver(el), /ilustrativo/);
  for (const G of [100, 250, 550, 1000]) {
    for (const R of [1, 5, 10, 25, 60]) {
      mexer(el, 1, G); mexer(el, 0, R);
      const eta = num(valor(el, 'Rendimento η = P/(G A)'));
      assert.ok(eta >= 0 && eta < 100, 'η = ' + eta);
      assert.ok(num(valor(el, 'Rendimento no ponto de potência máxima')) < 100);
      assert.ok(!/NaN|Infinity|undefined/.test(ver(el)));
    }
  }
});

test('fqa-painel: a potência de funcionamento não excede a máxima; teclado e aria-live', () => {
  const { el } = montar('fqa-painel', { G: 500, Rcarga: 10 });
  const P = num(valor(el, 'Ponto de funcionamento').split('P = U I =')[1]);
  const Pmax = num(valor(el, 'Ponto de potência máxima').split('P =').pop());
  assert.ok(P <= Pmax + 0.005);
  el.querySelectorAll('svg')[0].dispatch('keydown', { key: 'ArrowRight', preventDefault() {} });
  assert.equal(Number(slider(el, 0).value), 15);
  assert.equal(vivos(el).length, 1);
  assert.ok(!/\n/.test(vivos(el)[0].textContent));
});

test('fqa-painel: tudo dentro do viewBox nos extremos', () => {
  for (const G of [100, 500, 1000]) for (const Rcarga of [1, 10, 60]) {
    const { el } = montar('fqa-painel', { G, Rcarga });
    dentroDoViewBox(el, 'G=' + G + ' R=' + Rcarga);
  }
});

test('fig-calorimetro: tem as 6 partes, cada uma com a descrição do seu papel', () => {
  const { el } = montar('fig-calorimetro', {});
  for (const r of ['Vaso', 'Isolamento', 'Tampa', 'Termómetro', 'Agitador', 'Resistência de aquecimento']) assert.ok(ver(el).includes(r), r);
});

test('fig-painel: tem as 5 partes e as descrições do amperímetro e do voltímetro', () => {
  const { el } = montar('fig-painel', {});
  for (const r of ['Painel', 'Fonte de luz', 'Reóstato', 'Amperímetro', 'Voltímetro']) assert.ok(ver(el).includes(r), r);
  const fonte = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'esquemas/fqa/fig-painel.js'), 'utf8');
  assert.match(fonte, /amperímetro liga-se em série/);
  assert.match(fonte, /voltímetro liga-se em paralelo/);
  const cal = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'esquemas/fqa/fig-calorimetro.js'), 'utf8');
  assert.match(cal, /efeito Joule/);
});

test('fqa-painel: a resistência de carga chega à da potência máxima a qualquer irradiância', () => {
  const { el, M } = montar('fqa-painel', {});
  const max = Number(slider(el, 0).max);
  for (const G of [100, 300, 1000]) {
    const mx = M.fisica.painelPotenciaMaxima(G);
    assert.ok(max >= 2 * (mx.U / mx.I), 'G = ' + G + ': máximo ' + max + ' Ω, R_mp = ' + mx.U / mx.I);
  }
  mexer(el, 1, 100);
  mexer(el, 0, max);
  assert.ok(!/NaN|Infinity|undefined/.test(ver(el)));
});

test('fig-calorimetro e fig-painel: tudo o que se desenha fica dentro da figura (290 × 190)', () => {
  for (const id of ['fig-calorimetro', 'fig-painel']) {
    const { el } = montar(id, {});
    const partes = Array.from(el.querySelectorAll('g')).filter((g) => g.classes.has('figura-parte'));
    assert.ok(partes.length >= 5);
    partes.forEach((g) => dentroDoViewBox(g, id + ' ' + g.getAttribute('aria-label'), [0, 0, 290, 190]));
  }
});

// Lê os pontos de um caminho com M, L, H e V, por subcaminho (começado por M).
function subcaminhos(d) {
  return d.split(/(?=M)/).filter(Boolean).map((sub) => {
    const pts = [];
    let cx = 0, cy = 0;
    (sub.match(/[MLHV][^MLHV]*/g) || []).forEach((seg) => {
      const v = seg.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (seg[0] === 'H') cx = v[0]; else if (seg[0] === 'V') cy = v[0]; else { cx = v[0]; cy = v[1]; }
      pts.push([cx, cy]);
    });
    return pts;
  });
}

test('fig-painel: o voltímetro está em paralelo com o painel e o amperímetro em série no circuito', () => {
  const { el } = montar('fig-painel', {});
  const por = (tag, cls) => Array.from(el.querySelectorAll(tag)).filter((e) => e.classes.has(cls));
  const [T1, T2] = por('circle', 'terminal').map((c) => [Number(c.getAttribute('cx')), Number(c.getAttribute('cy'))]);
  assert.deepEqual([T1, T2], [[128, 80], [128, 120]]);
  const volt = por('circle', 'voltimetro')[0], amp = por('circle', 'amperimetro')[0];
  const ponto = (c, dx, dy) => [Number(c.getAttribute('cx')) + dx, Number(c.getAttribute('cy')) + dy];
  const r = (c) => Number(c.getAttribute('r'));
  // voltímetro: um fio de cada terminal do painel, cada um a acabar num lado do círculo
  const fv = subcaminhos(por('path', 'fio-voltimetro')[0].getAttribute('d'));
  assert.equal(fv.length, 2);
  assert.deepEqual(fv[0][0], T1);
  assert.deepEqual(fv[1][0], T2);
  assert.deepEqual(fv[0][fv[0].length - 1], ponto(volt, 0, -r(volt)));
  assert.deepEqual(fv[1][fv[1].length - 1], ponto(volt, 0, r(volt)));
  // circuito principal: T+ → amperímetro → reóstato → T−
  const fp = subcaminhos(por('path', 'fio-principal')[0].getAttribute('d'));
  assert.deepEqual(fp[0][0], T1);
  assert.deepEqual(fp[0][fp[0].length - 1], ponto(amp, -r(amp), 0));
  assert.deepEqual(fp[1][0], ponto(amp, r(amp), 0));
  assert.deepEqual(fp[fp.length - 1][fp[fp.length - 1].length - 1], T2);
  const reo = Array.from(el.querySelectorAll('rect')).find((q) => Number(q.getAttribute('width')) === 90);
  const rx = Number(reo.getAttribute('x')), ry = Number(reo.getAttribute('y')) + Number(reo.getAttribute('height')) / 2;
  assert.deepEqual(fp[1][fp[1].length - 1], [rx + 90, ry]);
  assert.deepEqual(fp[2][0], [rx, ry]);
  // o amperímetro não está ligado aos terminais do voltímetro: mede só a corrente da carga
  assert.ok(Math.abs(Number(amp.getAttribute('cy')) - Number(volt.getAttribute('cy'))) > r(amp));
});
