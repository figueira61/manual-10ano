const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

let M, Mol;
const OBRIGATORIAS = ['H2', 'O2', 'N2', 'Cl2', 'HCl', 'HF', 'H2O', 'NH3', 'CH4', 'CO2', 'BF3', 'HCN', 'C2H6', 'C2H4', 'C2H2',
  'C3H8', 'C3H6', 'C4H10', 'CH3OH', 'C2H5OH', 'CH3CHO', 'CH3COCH3', 'CH3COOH', 'CH3NH2', 'O3'];
const GEOMETRIAS = ['linear', 'angular', 'triangular plana', 'piramidal trigonal', 'tetraédrica'];

beforeEach(() => {
  delete globalThis.document;
  M = carregar('esquemas/fqa/calculo-dados.js', 'esquemas/fqa/calculo-moleculas.js', 'esquemas/fqa/calculo-quimica.js');
  Mol = M.moleculas;
});

test('o catálogo tem as 25 moléculas pedidas, com nome e fórmula KaTeX', () => {
  for (const id of OBRIGATORIAS) {
    const m = Mol.catalogo[id];
    assert.ok(m, id);
    assert.ok(m.nome && /^\\mathrm\{/.test(m.formula), id);
  }
});

test('valência: soma dos eletrões de valência = 2 × (pares ligantes + não ligantes)', () => {
  for (const id of Object.keys(Mol.catalogo)) {
    const c = Mol.contar(id);
    assert.equal(c.eletroesValencia, 2 * (c.paresLigantes + c.paresNaoLigantes), id);
  }
});

test('valências de H, B, C, N, O, F, Cl', () => {
  const v = (el) => Mol.eletroesValenciaAtomo(el);
  assert.deepEqual(['H', 'B', 'C', 'N', 'O', 'F', 'Cl'].map(v), [1, 3, 4, 5, 6, 7, 7]);
});

test('octeto: H com 2, os outros com 8; só o BF3 (B com 6) é exceção declarada', () => {
  for (const id of Object.keys(Mol.catalogo)) {
    const o = Mol.octeto(id);
    assert.ok(o.cumpre, id + ' ' + JSON.stringify(o.excecoes));
    if (id === 'BF3') {
      assert.equal(Mol.catalogo[id].excecaoOcteto, true);
      assert.deepEqual(o.excecoes, [{ atomo: 0, el: 'B', eletroes: 6 }]);
    } else {
      assert.deepEqual(o.excecoes, [], id);
      assert.ok(!Mol.catalogo[id].excecaoOcteto, id);
    }
  }
  // sem declaração, o BF3 não cumpriria
  const copia = Mol.catalogo.BF3.excecaoOcteto;
  Mol.catalogo.BF3.excecaoOcteto = false;
  assert.equal(Mol.octeto('BF3').cumpre, false);
  Mol.catalogo.BF3.excecaoOcteto = copia;
});

test('O3: ressonância, uma dupla e uma simples, octeto cumprido', () => {
  const m = Mol.catalogo.O3;
  assert.equal(m.ressonancia, true);
  const c = Mol.contar('O3');
  assert.deepEqual([c.ligacoesSimples, c.duplas, c.paresLigantes, c.paresNaoLigantes, c.eletroesValencia], [1, 1, 3, 6, 18]);
  assert.ok(Mol.octeto('O3').cumpre);
  for (const id of Object.keys(Mol.catalogo)) if (id !== 'O3') assert.ok(!Mol.catalogo[id].ressonancia, id);
});

test('contar: H2O, NH3, N2, CO2, CH4, C2H4', () => {
  assert.deepEqual(Mol.contar('H2O'), { paresLigantes: 2, paresNaoLigantes: 2, ligacoesSimples: 2, duplas: 0, triplas: 0, eletroesValencia: 8 });
  const n = Mol.contar('NH3');
  assert.deepEqual([n.paresLigantes, n.paresNaoLigantes], [3, 1]);
  const n2 = Mol.contar('N2');
  assert.deepEqual([n2.triplas, n2.paresLigantes, n2.paresNaoLigantes, n2.eletroesValencia], [1, 3, 2, 10]);
  const co2 = Mol.contar('CO2');
  assert.deepEqual([co2.duplas, co2.paresLigantes, co2.paresNaoLigantes], [2, 4, 4]);
  const ch4 = Mol.contar('CH4');
  assert.deepEqual([ch4.paresLigantes, ch4.paresNaoLigantes], [4, 0]);
  const c2h4 = Mol.contar('C2H4');
  assert.deepEqual([c2h4.ligacoesSimples, c2h4.duplas, c2h4.paresNaoLigantes], [4, 1, 0]);
  assert.throws(() => Mol.contar('XX'), /desconhecida/);
});

test('a fórmula molecular corresponde aos átomos (contagem de C e H)', () => {
  const casos = { CH4: [1, 4], C2H6: [2, 6], C2H4: [2, 4], C2H2: [2, 2], C3H8: [3, 8], C3H6: [3, 6], C4H10: [4, 10],
    CH3OH: [1, 4], C2H5OH: [2, 6], CH3CHO: [2, 4], CH3COCH3: [3, 6], CH3COOH: [2, 4], CH3NH2: [1, 5] };
  for (const [id, [c, h]] of Object.entries(casos)) {
    const at = Mol.catalogo[id].atomos;
    assert.equal(at.filter((a) => a.el === 'C').length, c, id);
    assert.equal(at.filter((a) => a.el === 'H').length, h, id);
  }
});

test('validar: o catálogo todo é válido e atomos3d é opcional (só H2O, NH3, CH4, CO2, BF3, HCN, HCl, O3 o têm)', () => {
  const COM3D = ['H2O', 'NH3', 'CH4', 'CO2', 'BF3', 'HCN', 'HCl', 'O3'];
  for (const id of Object.keys(Mol.catalogo)) {
    assert.equal(Mol.catalogo[id].atomos3d !== undefined, COM3D.includes(id), id);
    assert.deepEqual(Mol.validar(id), [], id);
  }
  const guarda = Mol.catalogo.H2O.atomos3d;
  Mol.catalogo.H2O.atomos3d = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
  assert.ok(Mol.validar('H2O').length > 0);
  Mol.catalogo.H2O.atomos3d = 'x';
  assert.ok(Mol.validar('H2O').length > 0);
  Mol.catalogo.H2O.atomos3d = guarda;
  assert.deepEqual(Mol.validar('H2O'), []);
  Mol.catalogo.H2.atomos3d = [{ el: 'H', x: 0, y: 0, z: 0 }, { el: 'H', x: 1, y: 0, z: 0 }];
  assert.deepEqual(Mol.validar('H2'), []);
  delete Mol.catalogo.H2.atomos3d;
});

test('geometria: nomes PT-PT; diatómicas lineares sem ângulo; mais de um centro → null + centros', () => {
  for (const id of Object.keys(Mol.catalogo)) {
    const m = Mol.catalogo[id];
    const cs = Mol.centrais(id);
    if (cs.length === 0) {
      assert.equal(m.geometria, 'linear', id);
      assert.equal(m.angulo, null, id);
    } else if (cs.length === 1) {
      assert.ok(GEOMETRIAS.includes(m.geometria), id);
      assert.ok(Number.isFinite(m.angulo), id);
    } else {
      assert.equal(m.geometria, null, id);
      assert.equal(m.angulo, null, id);
      assert.equal(m.centros.length, cs.length, id);
      for (const c of m.centros) { assert.ok(GEOMETRIAS.includes(c.geometria), id); assert.ok(Number.isFinite(c.angulo), id); }
    }
  }
  const g = (id) => [Mol.catalogo[id].geometria, Mol.catalogo[id].angulo];
  assert.deepEqual(g('H2O'), ['angular', 104.5]);
  assert.deepEqual(g('NH3'), ['piramidal trigonal', 107]);
  assert.deepEqual(g('CH4'), ['tetraédrica', 109.5]);
  assert.deepEqual(g('BF3'), ['triangular plana', 120]);
  assert.deepEqual(g('CO2'), ['linear', 180]);
  assert.deepEqual(g('HCN'), ['linear', 180]);
});

test('geometria coerente com os pares do átomo central (repulsão de pares)', () => {
  const esperado = (nLig, nPares) => ({ '2,0': 'linear', '3,0': 'triangular plana', '4,0': 'tetraédrica', '3,1': 'piramidal trigonal', '2,2': 'angular', '2,1': 'angular' })[nLig + ',' + nPares];
  const verificar = (id, i, geometria) => {
    const m = Mol.catalogo[id];
    const dom = m.ligacoes.filter(([p, q]) => p === i || q === i).length; // vizinhos = domínios de ligação
    assert.equal(esperado(dom, m.atomos[i].pares), geometria, id + ' átomo ' + i);
  };
  for (const id of Object.keys(Mol.catalogo)) {
    const m = Mol.catalogo[id];
    const cs = Mol.centrais(id);
    if (cs.length === 1) verificar(id, cs[0], m.geometria);
    if (cs.length > 1) for (const c of m.centros) verificar(id, c.atomo, c.geometria);
  }
});

test('polaridade coerente com a geometria', () => {
  const p = (id) => Mol.catalogo[id].polar;
  for (const id of ['CO2', 'CH4', 'BF3']) assert.equal(p(id), false, id);
  for (const id of ['H2O', 'NH3', 'HCl', 'HF', 'HCN', 'O3']) assert.equal(p(id), true, id);
  for (const id of Object.keys(Mol.catalogo)) {
    const m = Mol.catalogo[id];
    const cs = Mol.centrais(id);
    if (cs.length === 0) assert.equal(m.polar, m.atomos[0].el !== m.atomos[1].el, id); // diatómicas
    else if (cs.length === 1) {
      const c = cs[0];
      const terminais = new Set(m.atomos.filter((_, i) => i !== c).map((a) => a.el));
      const simetrica = m.atomos[c].pares === 0 && terminais.size === 1;
      assert.equal(m.polar, !simetrica, id);
    } else {
      // só C e H (hidrocarbonetos) → apolar; com grupo funcional → polar
      const soCH = m.atomos.every((a) => a.el === 'C' || a.el === 'H');
      assert.equal(m.polar, !soCH, id);
    }
  }
});

test('grupos funcionais e tipos de hidrocarboneto', () => {
  const gf = { CH3OH: 'alcool', C2H5OH: 'alcool', CH3CHO: 'aldeido', CH3COCH3: 'cetona', CH3COOH: 'acido', CH3NH2: 'amina' };
  for (const id of Object.keys(Mol.catalogo)) assert.equal(Mol.catalogo[id].grupoFuncional, gf[id] || null, id);
  const sat = ['CH4', 'C2H6', 'C3H8', 'C4H10'];
  const insat = ['C2H4', 'C2H2', 'C3H6'];
  for (const id of Object.keys(Mol.catalogo)) {
    assert.equal(Mol.catalogo[id].tipo, sat.includes(id) ? 'hidrocarboneto-saturado' : insat.includes(id) ? 'insaturado' : null, id);
  }
  // insaturado ⇔ tem dupla ou tripla C–C
  for (const id of insat) {
    const m = Mol.catalogo[id];
    assert.ok(m.ligacoes.some(([i, j, o]) => o > 1 && m.atomos[i].el === 'C' && m.atomos[j].el === 'C'), id);
  }
});

test('disposição: pares não ligantes nos espaços livres, sem sobrepor ligações', () => {
  for (const id of Object.keys(Mol.catalogo)) {
    const m = Mol.catalogo[id];
    const d = Mol.disposicao(id);
    d.atomos.forEach((a, i) => {
      assert.equal(a.paresAngulos.length, m.atomos[i].pares, id);
      for (const ang of a.paresAngulos) {
        for (const [p, q] of m.ligacoes) {
          const o = p === i ? q : q === i ? p : -1;
          if (o < 0) continue;
          const dir = (Math.atan2(m.atomos[o].y - a.y, m.atomos[o].x - a.x) * 180) / Math.PI;
          const dif = Math.abs(((ang - dir + 540) % 360) - 180);
          assert.ok(dif >= 40, id + ' par a ' + dif + '° de uma ligação');
        }
      }
    });
  }
  // água: pares simétricos em cima (y negativo no ecrã)
  const [p1, p2] = Mol.disposicao('H2O').atomos[0].paresAngulos;
  assert.ok(Math.abs(Math.sin((p1 * Math.PI) / 180) + 1) < 0.6 && Math.abs(Math.sin((p2 * Math.PI) / 180) + 1) < 0.6);
});

test('coordenadas: nenhum par de átomos sobreposto', () => {
  for (const id of Object.keys(Mol.catalogo)) {
    const at = Mol.catalogo[id].atomos;
    for (let i = 0; i < at.length; i++) for (let j = i + 1; j < at.length; j++) {
      assert.ok(Math.hypot(at[i].x - at[j].x, at[i].y - at[j].y) >= 0.6, id + ' ' + i + ',' + j);
    }
  }
});

// ---------- esquema fqa-molecula ----------

function montar(opcoes) {
  globalThis.document = criarDocumento();
  const M2 = carregar('esquemas/fqa/calculo-dados.js', 'esquemas/fqa/calculo-moleculas.js', 'esquemas/fqa/calculo-quimica.js',
    'js/nucleo.js', 'esquemas/fqa/fqa-molecula.js');
  const el = document.createElement('div');
  const def = M2.esquemas.obter('fqa-molecula');
  const montado = def.montar(el, opcoes);
  return { M: M2, el, montado };
}

test('fqa-molecula: regista-se e desenha átomos, traços e (só em Lewis) pares', () => {
  const { M: M2, el } = montar({ molecula: 'H2O', modo: 'lewis' });
  assert.ok(M2.esquemas.obter('fqa-molecula'));
  assert.equal(el.querySelectorAll('circle.mol-atomo').length, 3);
  assert.equal(el.querySelectorAll('text.mol-simbolo').length, 3);
  assert.equal(el.querySelectorAll('line.mol-traco').length, 2);
  assert.equal(el.querySelectorAll('circle.mol-par').length, 4); // 2 pares × 2 pontos
  const est = montar({ molecula: 'H2O', modo: 'estrutura' }).el;
  assert.equal(est.querySelectorAll('circle.mol-par').length, 0);
  assert.equal(est.querySelectorAll('line.mol-traco').length, 2);
});

test('fqa-molecula: traços = soma das ordens de ligação; pontos = 2 × pares, para todas as moléculas', () => {
  for (const id of OBRIGATORIAS) {
    const { M: M2, el } = montar({ molecula: id, modo: 'lewis' });
    const c = M2.moleculas.contar(id);
    assert.equal(el.querySelectorAll('circle.mol-atomo').length, M2.moleculas.catalogo[id].atomos.length, id);
    assert.equal(el.querySelectorAll('line.mol-traco').length, c.paresLigantes, id);
    assert.equal(el.querySelectorAll('circle.mol-par').length, 2 * c.paresNaoLigantes, id);
  }
});

test('fqa-molecula: o modo omissão é estrutura (sem pares) e CO2 tem 4 traços', () => {
  const { el } = montar({ molecula: 'CO2' });
  assert.equal(el.querySelectorAll('circle.mol-par').length, 0);
  assert.equal(el.querySelectorAll('line.mol-traco').length, 4);
});

test('fqa-molecula: não revela nome, geometria nem polaridade por omissão', () => {
  const { el } = montar({ molecula: 'H2O', modo: 'lewis' });
  const svg = el.querySelector('svg');
  const alt = svg.getAttribute('aria-label');
  assert.match(alt, /^Estrutura de uma molécula/);
  assert.ok(!/água|angular|polar|H2O/i.test(alt), alt);
  assert.match(alt, /3 átomos/);
  assert.match(alt, /O ligado a 2 H/);
  assert.match(alt, /2 pares não ligantes/);
  assert.equal(svg.getAttribute('role'), 'img');
  assert.ok(!/água|angular|polar/i.test(el.textContent), el.textContent);
  assert.equal(el.querySelectorAll('.mol-info').length, 0);
});

test('fqa-molecula: mostrarInfo acrescenta nome, geometria e polaridade (em texto e no alt)', () => {
  const { el } = montar({ molecula: 'H2O', modo: 'lewis', mostrarInfo: true });
  const alt = el.querySelector('svg').getAttribute('aria-label');
  assert.match(alt, /água/i);
  assert.match(alt, /angular/);
  assert.match(alt, /polar/);
  const info = el.querySelector('.mol-info').textContent;
  assert.match(info, /água/i);
  assert.match(info, /angular/);
  assert.match(info, /104,5/);
  assert.match(info, /polar/);
  const apolar = montar({ molecula: 'CO2', mostrarInfo: true }).el.querySelector('.mol-info').textContent;
  assert.match(apolar, /apolar/);
});

test('fqa-molecula: molécula com vários centros mostra as geometrias locais com mostrarInfo', () => {
  const { el } = montar({ molecula: 'C2H5OH', mostrarInfo: true });
  const info = el.querySelector('.mol-info').textContent;
  assert.match(info, /etanol/i);
  assert.match(info, /tetraédrica/);
});

test('fqa-molecula: molécula desconhecida lança erro; destruir limpa', () => {
  globalThis.document = criarDocumento();
  const { el, montado } = montar({ molecula: 'H2O' });
  assert.ok(el.querySelector('svg'));
  montado.destruir();
  assert.equal(el.querySelector('svg'), null);
  assert.throws(() => montar({ molecula: 'XYZ' }), /desconhecida/);
});

test('fqa-molecula: o SVG escala (viewBox, 100%) e só usa cores do tema', () => {
  const { el } = montar({ molecula: 'C4H10', modo: 'lewis' });
  const svg = el.querySelector('svg');
  assert.match(svg.getAttribute('viewBox'), /^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);
  assert.equal(svg.getAttribute('width'), '100%');
  const fonte = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'esquemas/fqa/fqa-molecula.js'), 'utf8');
  assert.ok(!/#[0-9a-fA-F]{3,6}\b/.test(fonte), 'sem cores fixas');
});
