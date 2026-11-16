const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let D;
beforeEach(() => {
  D = carregar('esquemas/fqa/calculo-dados.js').dadosQuimicos;
});

const porZ = () => Object.entries(D.elementos)
  .map(([simbolo, e]) => Object.assign({ simbolo }, e))
  .sort((a, b) => a.z - b.z);
const representativo = (e) => e.grupo <= 2 || e.grupo >= 13;

test('elementos: Z = 1 a 36, todos com massa atómica, grupo, período e bloco', () => {
  const els = porZ();
  assert.deepEqual(els.map((e) => e.z), Array.from({ length: 36 }, (_, i) => i + 1));
  for (const e of els) {
    assert.equal(typeof e.nome, 'string', e.simbolo);
    assert.ok(Number.isFinite(e.massaAtomica) && e.massaAtomica > 0, e.simbolo);
    assert.equal(Math.round(e.massaAtomica * 100) / 100, e.massaAtomica, `${e.simbolo}: 2 casas decimais`);
    assert.ok(e.grupo >= 1 && e.grupo <= 18, e.simbolo);
    assert.ok(e.periodo >= 1 && e.periodo <= 4, e.simbolo);
    assert.ok(['s', 'p', 'd'].includes(e.bloco), e.simbolo);
  }
});

test('elementos: massas atómicas da TP do IAVE (amostra)', () => {
  const m = (s) => D.elementos[s].massaAtomica;
  assert.equal(m('H'), 1.01);
  assert.equal(m('C'), 12.01);
  assert.equal(m('O'), 16.0);
  assert.equal(m('Cl'), 35.45);
  assert.equal(m('Cu'), 63.55);
  assert.equal(m('Kr'), 83.8);
});

test('elementos: massa atómica cresce com Z, exceto Ar>K, Co>Ni (pares conhecidos)', () => {
  const els = porZ();
  const inversoes = [];
  for (let i = 1; i < els.length; i++) {
    if (els[i].massaAtomica < els[i - 1].massaAtomica) inversoes.push(els[i - 1].simbolo + '>' + els[i].simbolo);
  }
  assert.deepEqual(inversoes, ['Ar>K', 'Co>Ni']);
});

test('elementos: posição na TP (amostra), He no grupo 18 com bloco s', () => {
  assert.deepEqual(['grupo', 'periodo', 'bloco'].map((k) => D.elementos.He[k]), [18, 1, 's']);
  assert.deepEqual(['grupo', 'periodo', 'bloco'].map((k) => D.elementos.Cl[k]), [17, 3, 'p']);
  assert.deepEqual(['grupo', 'periodo', 'bloco'].map((k) => D.elementos.V[k]), [5, 4, 'd']);
  assert.deepEqual(['grupo', 'periodo', 'bloco'].map((k) => D.elementos.Zn[k]), [12, 4, 'd']);
  assert.deepEqual(['grupo', 'periodo', 'bloco'].map((k) => D.elementos.K[k]), [1, 4, 's']);
});

test('ei1 para todos (kJ/mol, inteiro); raio só nos representativos com valor de Slater', () => {
  for (const e of porZ()) {
    assert.ok(Number.isInteger(e.ei1) && e.ei1 > 300 && e.ei1 < 2500, e.simbolo);
    if (!representativo(e)) assert.equal(e.raio, undefined, e.simbolo);
    else if (e.grupo !== 18) assert.ok(Number.isInteger(e.raio) && e.raio > 0, e.simbolo);
  }
  // Slater (1964) não dá raios para os gases nobres
  for (const s of ['He', 'Ne', 'Ar', 'Kr']) assert.equal(D.elementos[s].raio, undefined, s);
});

// Pares de Z consecutivos nos períodos 2–4 em que pelo menos um é representativo.
function paresPeriodo() {
  const els = porZ();
  const pares = [];
  for (let i = 1; i < els.length; i++) {
    const a = els[i - 1], b = els[i];
    if (a.periodo !== b.periodo || a.periodo < 2 || a.periodo > 4) continue;
    if (!representativo(a) && !representativo(b)) continue;
    pares.push([a, b]);
  }
  return pares;
}

test('EI cresce ao longo do período (2–4), exceto os pares de excecoesEI', () => {
  assert.deepEqual(D.excecoesEI, ['Be>B', 'N>O', 'Mg>Al', 'P>S', 'Zn>Ga', 'As>Se']);
  const encontradas = [];
  for (const [a, b] of paresPeriodo()) {
    if (b.ei1 <= a.ei1) encontradas.push(a.simbolo + '>' + b.simbolo);
  }
  assert.deepEqual(encontradas, D.excecoesEI);
});

test('EI decresce ao descer no grupo (1, 2, 13–18), exceto os pares de excecoesEIGrupo', () => {
  assert.deepEqual(D.excecoesEIGrupo, ['Ga>Al']);
  const encontradas = [];
  for (const g of [1, 2, 13, 14, 15, 16, 17, 18]) {
    const col = porZ().filter((e) => e.grupo === g);
    assert.ok(col.length >= 2, 'grupo ' + g);
    for (let i = 1; i < col.length; i++) {
      if (col[i].ei1 >= col[i - 1].ei1) encontradas.push(col[i].simbolo + '>' + col[i - 1].simbolo);
    }
  }
  assert.deepEqual(encontradas, D.excecoesEIGrupo);
});

test('raio: nunca aumenta ao longo do período e cresce ao descer no grupo (sem exceções)', () => {
  const empates = [];
  for (const [a, b] of paresPeriodo()) {
    if (a.raio === undefined || b.raio === undefined) continue;
    assert.ok(b.raio <= a.raio, `${a.simbolo} ${a.raio} → ${b.simbolo} ${b.raio}`);
    if (b.raio === a.raio) empates.push(a.simbolo + '=' + b.simbolo);
  }
  // Os raios de Slater estão arredondados a 5 pm: estes pares ficam empatados e não se comparam.
  assert.deepEqual(empates, ['P=S', 'S=Cl', 'As=Se', 'Se=Br']);
  for (const g of [1, 2, 13, 14, 15, 16, 17]) {
    const col = porZ().filter((e) => e.grupo === g && e.raio !== undefined);
    assert.ok(col.length >= 2, 'grupo ' + g);
    for (let i = 1; i < col.length; i++) assert.ok(col[i].raio > col[i - 1].raio, `${col[i - 1].simbolo} → ${col[i].simbolo}`);
  }
});

test('isótopos: elementos pedidos, abundâncias somam 100 % e média ≈ massa atómica da TP', () => {
  assert.deepEqual(Object.keys(D.isotopos).sort(), ['B', 'C', 'Cl', 'Cu', 'H', 'Li', 'Mg', 'N', 'Ne', 'O']);
  for (const [s, lista] of Object.entries(D.isotopos)) {
    const soma = lista.reduce((t, i) => t + i.abundancia, 0);
    assert.ok(Math.abs(soma - 100) < 1e-6, `${s}: ${soma}`);
    for (const i of lista) {
      assert.ok(Number.isInteger(i.a) && Math.abs(i.massa - i.a) < 0.1, `${s}-${i.a}`);
    }
    const media = lista.reduce((t, i) => t + i.massa * i.abundancia, 0) / 100;
    assert.ok(Math.abs(media - D.elementos[s].massaAtomica) < 0.01, `${s}: ${media}`);
  }
});

test('ligações: todas as chaves pedidas, com energia (kJ/mol) e comprimento (pm)', () => {
  const chaves = ['H-H', 'C-C', 'C=C', 'C≡C', 'O=O', 'N≡N', 'C-H', 'O-H', 'N-H', 'C=O', 'C-O', 'H-Cl', 'Cl-Cl',
    'C-Cl', 'H-Br', 'Br-Br', 'H-I', 'I-I', 'H-F', 'F-F', 'O-O', 'N-N', 'N=N', 'C-N', 'C≡N'];
  assert.deepEqual(Object.keys(D.ligacoes).sort(), chaves.slice().sort());
  for (const [k, l] of Object.entries(D.ligacoes)) {
    assert.ok(Number.isInteger(l.energia) && l.energia > 100 && l.energia < 1000, k);
    assert.ok(Number.isInteger(l.comprimento) && l.comprimento > 50 && l.comprimento < 300, k);
  }
});

test('ligações: simples → dupla → tripla, energia cresce e comprimento decresce', () => {
  for (const serie of [['C-C', 'C=C', 'C≡C'], ['N-N', 'N=N', 'N≡N']]) {
    for (let i = 1; i < serie.length; i++) {
      const a = D.ligacoes[serie[i - 1]], b = D.ligacoes[serie[i]];
      assert.ok(b.energia > a.energia, serie[i]);
      assert.ok(b.comprimento < a.comprimento, serie[i]);
    }
  }
});

test('ligações: halogénios H-X, energia decresce e comprimento cresce de F a I', () => {
  const serie = ['H-F', 'H-Cl', 'H-Br', 'H-I'].map((k) => D.ligacoes[k]);
  for (let i = 1; i < serie.length; i++) {
    assert.ok(serie[i].energia < serie[i - 1].energia);
    assert.ok(serie[i].comprimento > serie[i - 1].comprimento);
  }
});

test('constantes do formulário', () => {
  assert.deepEqual(D.constantes, { NA: 6.02e23, h: 6.63e-34, c: 3.0e8, Vm: 22.4, EnH: -2.18e-18 });
});

test('fontes: cada bloco de dados e cada campo dos elementos tem fonte', () => {
  for (const bloco of Object.keys(D)) {
    if (bloco === 'fontes') continue;
    assert.equal(typeof D.fontes[bloco], 'string', bloco);
    assert.ok(D.fontes[bloco].length > 20, bloco);
  }
  const campos = new Set();
  for (const e of Object.values(D.elementos)) for (const k of Object.keys(e)) campos.add(k);
  for (const k of campos) {
    if (['z', 'nome', 'grupo', 'periodo', 'bloco'].includes(k)) continue; // em fontes.elementos
    assert.equal(typeof D.fontes[k], 'string', k);
  }
});

test('espectro: zonas contíguas, por ordem crescente de comprimento de onda', () => {
  const z = D.espectro;
  assert.deepEqual(z.map((x) => x.zona), ['gama', 'X', 'UV', 'visivel', 'IV', 'micro-ondas', 'radio']);
  assert.equal(z[0].min, 0);
  assert.equal(z[z.length - 1].max, Infinity);
  for (let i = 1; i < z.length; i++) assert.equal(z[i].min, z[i - 1].max);
});

test('riscas: Na e He com linhas visíveis (400–700 nm) por ordem crescente e fonte', () => {
  assert.deepEqual(Object.keys(D.riscas).sort(), ['He', 'Na']);
  assert.deepEqual(D.riscas.Na.linhas, [589.0, 589.6]);
  for (const r of Object.values(D.riscas)) {
    assert.ok(r.nome && r.linhas.length >= 2);
    r.linhas.forEach((l, i) => {
      assert.ok(l >= 400 && l < 700);
      if (i) assert.ok(l > r.linhas[i - 1]);
    });
  }
  assert.ok(/NIST/.test(D.fontes.riscas));
});

test('energias de remoção (Na): uma por subnível ocupado, a decrescer 1s > 2s > 2p > 3s, e 3s = EI', () => {
  carregar('esquemas/fqa/calculo-quimica.js');
  const Q = globalThis.Manual.quimica;
  const na = D.energiasRemocao.Na;
  const c = Q.configuracao(D.elementos.Na.z);
  assert.deepEqual(na.map((x) => x.subnivel), c.subniveis.map((s) => s.nome));
  assert.deepEqual(na.map((x) => x.eletroes), c.subniveis.map((s) => s.eletroes));
  assert.equal(new Set(na.map((x) => x.energia)).size, c.subniveis.length);
  for (let i = 1; i < na.length; i++) assert.ok(na[i - 1].energia > na[i].energia, na[i - 1].subnivel + ' > ' + na[i].subnivel);
  assert.equal(na[na.length - 1].energia, D.elementos.Na.ei1);
  assert.deepEqual(na.map((x) => x.energia), [104117, 6847, 3665, 496]);
});
