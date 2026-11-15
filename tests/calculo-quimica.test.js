const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Q, D;
const perto = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b} (±${tol})`);
const pertoRel = (a, b, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${a} !~ ${b} (rel ${rel})`);

beforeEach(() => {
  const M = carregar('esquemas/fqa/calculo-dados.js', 'esquemas/fqa/calculo-quimica.js');
  Q = M.quimica;
  D = M.dadosQuimicos;
});

// ---------- massas e quantidade de matéria ----------

test('massaMolar: H2O = 18,02 g/mol com a TP do IAVE', () => {
  perto(Q.massaMolar({ H: 2, O: 1 }), 18.02, 0.005);
  assert.equal(Q.massaMolar({ H: 2, O: 1 }), 18.02);
  assert.equal(Q.massaMolar({ C: 6, H: 12, O: 6 }), 180.18); // 6·12,01 + 12·1,01 + 6·16,00
  assert.equal(Q.massaMolar({ Na: 1, Cl: 1 }), 58.44);
  assert.throws(() => Q.massaMolar({ Xx: 1 }), /Xx/);
  assert.throws(() => Q.massaMolar({ H: 1.5 }), /inteiro/);
  assert.throws(() => Q.massaMolar({}), /vazia/);
});

test('massaAtomicaMedia: cloro em [35,44; 35,46] e cálculo à mão', () => {
  const m = Q.massaAtomicaMedia(D.isotopos.Cl);
  assert.ok(m >= 35.44 && m <= 35.46, String(m));
  perto(Q.massaAtomicaMedia([{ a: 10, massa: 10, abundancia: 20 }, { a: 11, massa: 11, abundancia: 80 }]), 10.8);
  // abundâncias em fração dão o mesmo resultado
  perto(Q.massaAtomicaMedia([{ a: 10, massa: 10, abundancia: 0.2 }, { a: 11, massa: 11, abundancia: 0.8 }]), 10.8);
  assert.throws(() => Q.massaAtomicaMedia([]));
});

test('n, m, N e átomos na amostra', () => {
  perto(Q.nDeMassa(36.04, 18.02), 2);
  perto(Q.massaDeN(0.5, 18.02), 9.01);
  pertoRel(Q.entidades(2), 1.204e24);
  pertoRel(Q.nDeEntidades(3.01e23), 0.5);
  // 0,5 mol de H2O têm 2 × 0,5 × NA átomos de H
  pertoRel(Q.atomosNaAmostra(0.5, { H: 2, O: 1 }, 'H'), 6.02e23);
  assert.equal(Q.atomosNaAmostra(0.5, { H: 2, O: 1 }, 'C'), 0);
  assert.throws(() => Q.nDeMassa(1, 0));
});

test('massaDeN e atomosNaAmostra: validam as entradas', () => {
  assert.equal(Q.massaDeN(0, 18.02), 0);
  for (const n of [-1, NaN, Infinity, undefined]) {
    assert.throws(() => Q.massaDeN(n, 18.02), /n/);
    assert.throws(() => Q.atomosNaAmostra(n, { H: 2 }, 'H'), /n/);
  }
  for (const M of [0, -18, NaN, Infinity]) assert.throws(() => Q.massaDeN(1, M), /M/);
  assert.throws(() => Q.atomosNaAmostra(1, null, 'H'), /fórmula/);
  assert.throws(() => Q.atomosNaAmostra(1, { H: -2 }, 'H'));
  assert.throws(() => Q.atomosNaAmostra(1, { H: 1.5 }, 'H'));
});

// ---------- radiação e átomo de hidrogénio ----------

test('energiaFotao: a partir de λ ou de f', () => {
  const r = Q.energiaFotao({ lambda: 500e-9 });
  pertoRel(r.E, 3.98e-19, 0.002);
  pertoRel(r.E, 6.63e-34 * 3.0e8 / 500e-9);
  pertoRel(r.f, 6.0e14);
  assert.equal(r.lambda, 500e-9);
  const s = Q.energiaFotao({ f: 6.0e14 });
  pertoRel(s.E, 6.63e-34 * 6.0e14);
  pertoRel(s.lambda, 5.0e-7);
  assert.throws(() => Q.energiaFotao({}));
  assert.throws(() => Q.energiaFotao({ f: 1e14, lambda: 1e-6 }));
  assert.throws(() => Q.energiaFotao({ lambda: -1 }));
});

test('zonaEspectro: zonas e fronteiras', () => {
  assert.equal(Q.zonaEspectro(1e-12), 'gama');
  assert.equal(Q.zonaEspectro(1e-10), 'X');
  assert.equal(Q.zonaEspectro(121.6e-9), 'UV');
  assert.equal(Q.zonaEspectro(400e-9), 'visivel');
  assert.equal(Q.zonaEspectro(656e-9), 'visivel');
  assert.equal(Q.zonaEspectro(700e-9), 'IV');
  assert.equal(Q.zonaEspectro(1.875e-6), 'IV');
  assert.equal(Q.zonaEspectro(0.12), 'micro-ondas');
  assert.equal(Q.zonaEspectro(3), 'radio');
  assert.throws(() => Q.zonaEspectro(0));
});

test('energiaNivelH: E_n = −2,18 × 10⁻¹⁸ / n² J', () => {
  assert.equal(Q.energiaNivelH(1), -2.18e-18);
  pertoRel(Q.energiaNivelH(2), -5.45e-19);
  pertoRel(Q.energiaNivelH(3), -2.18e-18 / 9);
  assert.throws(() => Q.energiaNivelH(0));
  assert.throws(() => Q.energiaNivelH(1.5));
});

test('transicaoH(3, 2): emissão da série de Balmer, λ ≈ 656 nm', () => {
  const t = Q.transicaoH(3, 2);
  assert.equal(t.tipo, 'emissao');
  assert.equal(t.serie, 'Balmer');
  assert.ok(Math.abs(t.lambda - 656e-9) <= 3e-9, String(t.lambda));
  // ΔE = E_final − E_inicial (negativo na emissão); λ = hc/|ΔE|
  pertoRel(t.deltaE, -2.18e-18 / 4 + 2.18e-18 / 9);
  pertoRel(t.lambda, 6.63e-34 * 3.0e8 / Math.abs(t.deltaE));
  assert.equal(Q.zonaEspectro(t.lambda), 'visivel');
});

test('transicaoH: absorção de Lyman, Paschen e séries sem nome', () => {
  const a = Q.transicaoH(1, 4);
  assert.equal(a.tipo, 'absorcao');
  assert.equal(a.serie, 'Lyman');
  assert.ok(a.deltaE > 0);
  assert.equal(Q.zonaEspectro(a.lambda), 'UV');
  const p = Q.transicaoH(4, 3);
  assert.equal(p.serie, 'Paschen');
  assert.equal(Q.zonaEspectro(p.lambda), 'IV');
  assert.equal(Q.transicaoH(5, 4).serie, null);
  assert.equal(Q.transicaoH(2, 5).serie, 'Balmer');
  assert.throws(() => Q.transicaoH(2, 2));
  assert.throws(() => Q.transicaoH(0, 2));
});

// ---------- configurações eletrónicas ----------

test('configuracao(8): O, 1s^2 2s^2 2p^4, 2 desemparelhados', () => {
  const c = Q.configuracao(8);
  assert.equal(c.spd, '1s^2 2s^2 2p^4');
  assert.equal(c.cerne, '[He] 2s^2 2p^4');
  assert.equal(c.desemparelhados, 2);
  assert.equal(c.orbitaisOcupadas, 5);
  assert.equal(c.valencia, 6);
  assert.deepEqual(c.subniveis, [{ nome: '1s', eletroes: 2 }, { nome: '2s', eletroes: 2 }, { nome: '2p', eletroes: 4 }]);
  assert.deepEqual(c.caixas, [
    { subnivel: '1s', orbitais: [['↑', '↓']] },
    { subnivel: '2s', orbitais: [['↑', '↓']] },
    { subnivel: '2p', orbitais: [['↑', '↓'], ['↑'], ['↑']] },
  ]);
});

test('configuracao(23): V, [Ar] 4s^2 3d^3 (ordem de preenchimento)', () => {
  const c = Q.configuracao(23);
  assert.equal(c.cerne, '[Ar] 4s^2 3d^3');
  assert.equal(c.spd, '1s^2 2s^2 2p^6 3s^2 3p^6 4s^2 3d^3');
  assert.equal(c.desemparelhados, 3);
  assert.equal(c.valencia, 5);
  assert.equal(c.orbitaisOcupadas, 13);
  const d = c.caixas.find((x) => x.subnivel === '3d');
  assert.deepEqual(d.orbitais, [['↑'], ['↑'], ['↑'], [], []]);
});

test('configuracao: regra de Hund (N, C, Ne) e casos pequenos (H, He)', () => {
  assert.equal(Q.configuracao(7).desemparelhados, 3);
  assert.equal(Q.configuracao(6).desemparelhados, 2);
  assert.deepEqual(Q.configuracao(6).caixas[2].orbitais, [['↑'], ['↑'], []]);
  assert.equal(Q.configuracao(10).desemparelhados, 0);
  assert.equal(Q.configuracao(10).cerne, '[He] 2s^2 2p^6');
  assert.equal(Q.configuracao(10).valencia, 8);
  assert.equal(Q.configuracao(1).spd, '1s^1');
  assert.equal(Q.configuracao(1).cerne, '1s^1');
  assert.equal(Q.configuracao(2).cerne, '1s^2');
  assert.equal(Q.configuracao(2).valencia, 2);
  assert.equal(Q.configuracao(19).cerne, '[Ar] 4s^1');
  assert.equal(Q.configuracao(18).cerne, '[Ne] 3s^2 3p^6');
});

test('configuracao: catiões tiram primeiro de 4s; aniões acrescentam', () => {
  const ti = Q.configuracao(22, 2);
  assert.equal(ti.cerne, '[Ar] 3d^2');
  assert.equal(ti.spd, '1s^2 2s^2 2p^6 3s^2 3p^6 3d^2');
  assert.equal(ti.desemparelhados, 2);
  assert.equal(Q.configuracao(23, 2).cerne, '[Ar] 3d^3');
  assert.equal(Q.configuracao(23, 1).cerne, '[Ar] 4s^1 3d^3');
  assert.equal(Q.configuracao(21, 3).cerne, '[Ne] 3s^2 3p^6');
  assert.equal(Q.configuracao(11, 1).spd, '1s^2 2s^2 2p^6');
  assert.equal(Q.configuracao(13, 3).cerne, '[He] 2s^2 2p^6');
  assert.equal(Q.configuracao(17, -1).spd, '1s^2 2s^2 2p^6 3s^2 3p^6');
  assert.equal(Q.configuracao(8, -2).cerne, '[He] 2s^2 2p^6');
  assert.equal(Q.configuracao(1, -1).spd, '1s^2');
});

test('configuracao: erros para Z > 23 e cargas inválidas', () => {
  assert.throws(() => Q.configuracao(24), /23/);
  assert.throws(() => Q.configuracao(0));
  assert.throws(() => Q.configuracao(2.5));
  assert.throws(() => Q.configuracao(8, 0.5), /carga/);
  assert.throws(() => Q.configuracao(1, 1), /carga/); // sem eletrões
  assert.throws(() => Q.configuracao(3, 4), /carga/);
  assert.throws(() => Q.configuracao(23, -1), /carga/); // 24 eletrões
});

test('posicaoTP: a partir da configuração, coerente com os dados (Z = 1–23)', () => {
  assert.deepEqual(Q.posicaoTP(17), { grupo: 17, periodo: 3, bloco: 'p' });
  assert.deepEqual(Q.posicaoTP(2), { grupo: 18, periodo: 1, bloco: 's' });
  assert.deepEqual(Q.posicaoTP(1), { grupo: 1, periodo: 1, bloco: 's' });
  assert.deepEqual(Q.posicaoTP(10), { grupo: 18, periodo: 2, bloco: 'p' });
  assert.deepEqual(Q.posicaoTP(20), { grupo: 2, periodo: 4, bloco: 's' });
  assert.deepEqual(Q.posicaoTP(22), { grupo: 4, periodo: 4, bloco: 'd' });
  for (const e of Object.values(D.elementos)) {
    assert.deepEqual(Q.posicaoTP(e.z), { grupo: e.grupo, periodo: e.periodo, bloco: e.bloco }, 'Z=' + e.z);
  }
});

test('posicaoTP: Z = 24–36 a partir dos dados; erro fora de 1–36', () => {
  assert.deepEqual(Q.posicaoTP(35), { grupo: 17, periodo: 4, bloco: 'p' }); // Br
  assert.deepEqual(Q.posicaoTP(36), { grupo: 18, periodo: 4, bloco: 'p' }); // Kr
  assert.deepEqual(Q.posicaoTP(30), { grupo: 12, periodo: 4, bloco: 'd' }); // Zn
  assert.deepEqual(Q.posicaoTP(24), { grupo: 6, periodo: 4, bloco: 'd' }); // Cr
  for (const z of [0, 37, 2.5, -1]) assert.throws(() => Q.posicaoTP(z), /1–36/);
  assert.throws(() => Q.configuracao(24), /23/); // configuracao mantém o limite
});

// ---------- AL: densidade relativa ----------

test('densidadeRelativa: método do picnómetro', () => {
  // vazio 30,00 g; com água 80,00 g; com metal (seco) 57,00 g; com metal e água 104,00 g
  // m(metal) = 27,00 g; m(água deslocada) = 80,00 + 27,00 − 104,00 = 3,00 g → d = 9,00
  perto(Q.densidadeRelativa({ mPicnometroVazio: 30, mComAgua: 80, mComMetal: 57, mComMetalEAgua: 104 }), 9);
  assert.throws(() => Q.densidadeRelativa({ mPicnometroVazio: 30, mComAgua: 80, mComMetal: 57, mComMetalEAgua: 107 }));
});

// ---------- soluções ----------

test('concentrações, percentagens e ppm', () => {
  perto(Q.concentracao(0.2, 0.5), 0.4);
  perto(Q.concentracaoMassica(5, 0.25), 20);
  perto(Q.percentagemMassa(5, 200), 2.5);
  perto(Q.percentagemVolume(12, 100), 12);
  perto(Q.ppm(0.002, 1000), 2);
  assert.throws(() => Q.concentracao(1, 0));
  assert.throws(() => Q.percentagemMassa(10, 5));
});

test('diluicao: resolve a incógnita e dá o fator', () => {
  const r = Q.diluicao({ ci: 0.5, Vi: 10, Vf: 50 });
  perto(r.cf, 0.1);
  perto(r.fator, 5);
  const v = Q.diluicao({ ci: 2, cf: 0.5, Vf: 100 });
  perto(v.Vi, 25);
  perto(v.fator, 4);
  perto(Q.diluicao({ Vi: 10, cf: 0.1, Vf: 50 }).ci, 0.5);
  perto(Q.diluicao({ ci: 1, Vi: 10, cf: 0.25 }).Vf, 40);
  assert.throws(() => Q.diluicao({ ci: 1, Vi: 10 }));
  assert.throws(() => Q.diluicao({ ci: 1, Vi: 10, cf: 0.5, Vf: 20 }));
  assert.throws(() => Q.diluicao({ ci: 0.1, Vi: 50, Vf: 10 }), /fator/);
});

// ---------- gases ----------

test('gases em PTN', () => {
  perto(Q.volumeGasPTN(2), 44.8);
  perto(Q.nDeVolumePTN(11.2), 0.5);
  perto(Q.massaVolumicaGas(32.0), 32 / 22.4);
  perto(Q.fracaoMolar(1, 4), 0.25);
  assert.throws(() => Q.fracaoMolar(5, 4));
});

// ---------- entalpia e fotoquímica ----------

test('deltaHLigacoes: H2 + Cl2 → 2 HCl', () => {
  const L = D.ligacoes;
  const esperado = L['H-H'].energia + L['Cl-Cl'].energia - 2 * L['H-Cl'].energia;
  assert.equal(esperado, 432 + 240 - 2 * 428); // −184 kJ/mol
  const r = Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } });
  assert.equal(r.somaQuebradas, 672);
  assert.equal(r.somaFormadas, 856);
  assert.equal(r.deltaH, esperado);
  assert.throws(() => Q.deltaHLigacoes({ quebradas: { 'X-Y': 1 }, formadas: {} }), /X-Y/);
});

test('lambdaParaQuebrarLigacao: E por molécula = E/NA', () => {
  const E = D.ligacoes['O=O'].energia;
  const porMolecula = E * 1000 / 6.02e23;
  pertoRel(Q.lambdaParaQuebrarLigacao(E), 6.63e-34 * 3.0e8 / porMolecula);
  assert.equal(Q.zonaEspectro(Q.lambdaParaQuebrarLigacao(E)), 'UV');
  assert.throws(() => Q.lambdaParaQuebrarLigacao(0));
});
