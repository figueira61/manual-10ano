const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let F, D;
const perto = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b} (±${tol})`);

beforeEach(() => {
  const M = carregar('esquemas/fqa/calculo-dados-fisica.js', 'esquemas/fqa/calculo-fisica.js');
  F = M.fisica;
  D = M.dadosFisica;
});

// ---------- dados ----------

test('dados: valores de referência e g = 10', () => {
  assert.equal(D.constantes.g, 10);
  const c = D.capacidadeTermicaMassica;
  assert.equal(c.agua, 4.18e3);
  assert.equal(c.gelo, 2.1e3);
  for (const k of ['aluminio', 'cobre', 'ferro', 'chumbo']) assert.ok(c[k] > 100 && c[k] < 1000, k);
  assert.ok(c.aluminio > c.ferro && c.ferro > c.cobre && c.cobre > c.chumbo);
  assert.equal(D.entalpiaMassica.fusaoGelo, 3.34e5);
  assert.equal(D.entalpiaMassica.vaporizacaoAgua, 2.26e6);
  assert.equal(D.temperaturas.fusaoGelo, 0);
  assert.equal(D.temperaturas.ebulicaoAgua, 100);
  const { pilha, painel } = D.modelos;
  assert.ok(pilha.epsilon >= 1.5 && pilha.epsilon <= 9 && pilha.r >= 0.5 && pilha.r <= 2);
  assert.ok(painel.Isc > 0 && painel.Uoc > painel.UT && painel.UT > 0 && painel.area > 0);
});

test('fontes: cada bloco de dados tem fonte (texto não vazio); os modelos dizem que são ilustrativos', () => {
  for (const bloco of Object.keys(D)) {
    if (bloco === 'fontes') continue;
    assert.equal(typeof D.fontes[bloco], 'string', bloco);
    assert.ok(D.fontes[bloco].trim().length > 20, bloco);
  }
  assert.match(D.fontes.modelos, /ilustrativ/i);
});

// ---------- energia mecânica ----------

test('ec, epg, em, vDeEc', () => {
  assert.equal(F.ec(2, 3), 9);
  assert.equal(F.ec(2, -3), 9);
  assert.equal(F.epg(2, 5), 100);
  assert.equal(F.epg(2, -5), -100);
  assert.equal(F.em(2, 3, 5), 109);
  perto(F.vDeEc(9, 2), 3);
  assert.throws(() => F.ec(0, 3), /m/);
  assert.throws(() => F.vDeEc(-1, 2));
});

test('trabalho: W = F d cos α, com o sinal do ângulo', () => {
  perto(F.trabalho(10, 2, 60), 10);
  assert.equal(F.trabalho(10, 2, 90), 0);
  assert.equal(F.trabalho(10, 2, 0), 20);
  assert.equal(F.trabalho(10, 2, 180), -20);
  perto(F.trabalho(10, 2, 120), -10);
  assert.throws(() => F.trabalho(-1, 2, 0));
});

test('travagem: d = Ec / Fa', () => {
  perto(F.travagem({ m: 1000, v0: 20, Fa: 5000 }), 40);
  assert.equal(F.travagem({ m: 1000, v0: 0, Fa: 5000 }), 0);
  assert.throws(() => F.travagem({ m: 1000, v0: 20, Fa: 0 }));
});

test('conservacao: v no fundo e erro se não chega à altura', () => {
  perto(F.conservacao({ h0: 5, v0: 0, h: 0 }), 10);
  perto(F.conservacao({ h0: 0, v0: 10, h: 5 }), 0);
  perto(F.conservacao({ h0: 2, v0: 4, h: 1 }), Math.sqrt(36));
  assert.throws(() => F.conservacao({ h0: 0, v0: 2, h: 5 }), /não chega/);
});

test('comAtrito: sem atrito conserva a energia mecânica', () => {
  const p = F.comAtrito({ m: 2, h0: 5, v0: 0, Fa: 0, percurso: [{ tipo: 'plano', comprimento: 10, desnivel: -5 }, { tipo: 'horizontal', comprimento: 4 }] });
  assert.equal(p.length, 3);
  assert.deepEqual(p.map((x) => x.s), [0, 10, 14]);
  perto(p[1].v, 10);
  perto(p[2].v, 10);
  for (const x of p) { perto(x.ec + x.epg, 100); assert.equal(x.dissipada, 0); assert.equal(x.parou, false); }
});

test('comAtrito: com atrito, energia dissipada = Fa · s e Em0 = Ec + Epg + dissipada', () => {
  const p = F.comAtrito({ m: 2, h0: 5, v0: 0, Fa: 2, percurso: [{ tipo: 'plano', comprimento: 10, desnivel: -5 }, { tipo: 'horizontal', comprimento: 4 }] });
  perto(p[1].dissipada, 20);
  perto(p[1].ec, 80);
  perto(p[2].ec, 72);
  perto(p[2].v, Math.sqrt(72));
  for (const x of p) perto(x.ec + x.epg + x.dissipada, 100, 1e-9);
});

test('comAtrito: quando a energia acaba, para no troço e nunca dá NaN', () => {
  // Ec0 = 25 J; horizontal com Fa = 10 N para ao fim de 2,5 m
  const p = F.comAtrito({ m: 2, h0: 0, v0: 5, Fa: 10, percurso: [{ tipo: 'horizontal', comprimento: 10 }, { tipo: 'horizontal', comprimento: 10 }] });
  const ult = p[p.length - 1];
  assert.equal(ult.parou, true);
  perto(ult.s, 2.5);
  assert.equal(ult.v, 0);
  assert.equal(ult.ec, 0);
  perto(ult.dissipada, 25);
  assert.equal(p.length, 2);
  for (const x of p) for (const k of ['s', 'h', 'v', 'ec', 'epg', 'dissipada']) assert.ok(Number.isFinite(x[k]), k);
  // a subir: Ec0 = 100 J, sobe 10 m num plano com 5 m de desnível e Fa = 5 N
  // Ec(x) = 100 − (2·10·5/10 + 5) x = 100 − 15 x → para em x = 6,667 m, h = 3,333 m
  const q = F.comAtrito({ m: 2, h0: 0, v0: 10, Fa: 5, percurso: [{ tipo: 'plano', comprimento: 10, desnivel: 5 }] });
  const fim = q[q.length - 1];
  assert.equal(fim.parou, true);
  perto(fim.s, 100 / 15);
  perto(fim.h, 50 / 15);
  perto(fim.ec + fim.epg + fim.dissipada, 100);
  // percurso com atrito enorme logo de início
  const r = F.comAtrito({ m: 1, h0: 1, v0: 0, Fa: 1000, percurso: [{ tipo: 'plano', comprimento: 2, desnivel: -1 }] });
  assert.equal(r[r.length - 1].parou, true);
  for (const x of r) assert.ok(!Number.isNaN(x.v));
});

test('comAtrito: valida o percurso', () => {
  assert.throws(() => F.comAtrito({ m: 1, h0: 0, v0: 1, Fa: 0, percurso: [] }));
  assert.throws(() => F.comAtrito({ m: 1, h0: 0, v0: 1, Fa: 0, percurso: [{ tipo: 'plano', comprimento: 1, desnivel: 2 }] }));
  assert.throws(() => F.comAtrito({ m: 1, h0: 0, v0: 1, Fa: 0, percurso: [{ tipo: 'horizontal', comprimento: 1, desnivel: 1 }] }));
  assert.throws(() => F.comAtrito({ m: 1, h0: 0, v0: 1, Fa: -1, percurso: [{ tipo: 'horizontal', comprimento: 1 }] }));
});

test('ressalto: alturas sucessivas', () => {
  assert.deepEqual(F.ressalto(1, 0.8, 3), [0.8, 0.64, 0.512]);
  assert.throws(() => F.ressalto(1, 1.2, 3));
  assert.throws(() => F.ressalto(1, 0.8, 0));
});

// ---------- circuitos ----------

test('resistências em série e em paralelo', () => {
  assert.equal(F.resistenciaSerie([6, 3]), 9);
  assert.equal(F.resistenciaParalelo([6, 3]), 2);
  assert.equal(F.resistenciaParalelo([10, 10, 10, 10]), 2.5);
  assert.throws(() => F.resistenciaParalelo([]));
  assert.throws(() => F.resistenciaSerie([6, 0]));
});

test('circuito: série e paralelo com fonte ideal', () => {
  const s = F.circuito({ U: 12, rs: [2, 4], ligacao: 'serie' });
  assert.equal(s.Req, 6);
  assert.equal(s.I, 2);
  assert.deepEqual(s.porComponente.map((c) => c.U), [4, 8]);
  assert.deepEqual(s.porComponente.map((c) => c.P), [8, 16]);
  const p = F.circuito({ U: 12, rs: [6, 3], ligacao: 'paralelo' });
  assert.equal(p.Req, 2);
  assert.equal(p.I, 6);
  assert.deepEqual(p.porComponente.map((c) => c.I), [2, 4]);
  assert.deepEqual(p.porComponente.map((c) => c.U), [12, 12]);
  assert.throws(() => F.circuito({ U: 12, rs: [6], ligacao: 'misto' }));
});

test('gerador: curto-circuito, rendimento e balanço εI = UI + rI²', () => {
  const cc = F.gerador({ epsilon: 9, r: 1, Rext: 0 });
  assert.equal(cc.I, 9);
  assert.equal(cc.U, 0);
  assert.equal(cc.rendimento, 0);
  const g = F.gerador({ epsilon: 9, r: 1, Rext: 8 });
  assert.equal(g.I, 1);
  assert.equal(g.U, 8);
  perto(g.rendimento, 8 / 9);
  perto(g.Ptotal, g.Putil + g.Pdissipada);
  assert.equal(g.Ptotal, 9);
  assert.throws(() => F.gerador({ epsilon: 9, r: 0, Rext: 0 }));
});

test('caracteristicaDeDoisPontos: ε e r a partir de dois pontos (I, U)', () => {
  assert.deepEqual(F.caracteristicaDeDoisPontos([1, 8], [2, 7]), { epsilon: 9, r: 1 });
  const m = D.modelos.pilha;
  const a = F.gerador({ epsilon: m.epsilon, r: m.r, Rext: 2 });
  const b = F.gerador({ epsilon: m.epsilon, r: m.r, Rext: 10 });
  const k = F.caracteristicaDeDoisPontos([a.I, a.U], [b.I, b.U]);
  perto(k.epsilon, m.epsilon);
  perto(k.r, m.r);
  assert.throws(() => F.caracteristicaDeDoisPontos([1, 8], [1, 7]));
  assert.throws(() => F.caracteristicaDeDoisPontos([1, 7], [2, 8]), /r/);
});

// ---------- térmica ----------

test('calor e calorFase', () => {
  assert.equal(F.calor(0.5, 4180, 20), 41800);
  assert.equal(F.calor(0.5, 4180, -20), -41800);
  assert.equal(F.calorFase(0.1, 3.34e5), 33400);
  assert.throws(() => F.calor(0, 4180, 20));
});

test('aquecimentoGelo: troços gelo, fusão, água e ebulição com tempos encadeados', () => {
  const t = F.aquecimentoGelo({ m: 0.1, theta0: -10, thetaF: 100, P: 100, vaporizar: true });
  assert.deepEqual(t.map((x) => x.fase), ['gelo', 'fusao', 'agua', 'ebulicao']);
  perto(t[0].Q, 0.1 * 2100 * 10);
  perto(t[1].Q, 0.1 * 3.34e5);
  perto(t[2].Q, 0.1 * 4180 * 100);
  perto(t[3].Q, 0.1 * 2.26e6);
  assert.equal(t[0].t0, 0);
  for (let i = 0; i < t.length; i++) {
    perto(t[i].t1 - t[i].t0, t[i].Q / 100);
    if (i > 0) assert.equal(t[i].t0, t[i - 1].t1);
  }
  assert.deepEqual([t[1].theta0, t[1].theta1, t[3].theta0, t[3].theta1], [0, 0, 100, 100]);
  // até 40 °C, partindo de gelo a 0 °C: sem troço de gelo
  const u = F.aquecimentoGelo({ m: 0.2, theta0: 0, thetaF: 40, P: 50 });
  assert.deepEqual(u.map((x) => x.fase), ['fusao', 'agua']);
  assert.equal(u[1].theta1, 40);
  // até −2 °C: só gelo
  assert.deepEqual(F.aquecimentoGelo({ m: 0.2, theta0: -10, thetaF: -2, P: 50 }).map((x) => x.fase), ['gelo']);
  assert.throws(() => F.aquecimentoGelo({ m: 0.1, theta0: 5, thetaF: 50, P: 100 }));
  assert.throws(() => F.aquecimentoGelo({ m: 0.1, theta0: -5, thetaF: 120, P: 100 }));
  assert.throws(() => F.aquecimentoGelo({ m: 0.1, theta0: -5, thetaF: 50, P: 100, vaporizar: true }));
});

test('mistura: só líquidos (média pesada)', () => {
  const c = D.capacidadeTermicaMassica.agua;
  const r = F.mistura([{ m: 0.1, c, theta: 80 }, { m: 0.1, c, theta: 20 }]);
  perto(r.thetaEq, 50);
  assert.equal(r.geloDerretido, 0);
  perto(r.trocas[0].Q + r.trocas[1].Q, 0, 1e-9);
  assert.ok(r.trocas[0].Q < 0 && r.trocas[1].Q > 0);
});

test('mistura: água e metal', () => {
  const cA = D.capacidadeTermicaMassica.agua, cCu = D.capacidadeTermicaMassica.cobre;
  const r = F.mistura([{ m: 0.2, c: cA, theta: 20 }, { m: 0.1, c: cCu, theta: 100 }]);
  const esperado = (0.2 * cA * 20 + 0.1 * cCu * 100) / (0.2 * cA + 0.1 * cCu);
  perto(r.thetaEq, esperado);
  assert.ok(r.thetaEq > 20 && r.thetaEq < 30);
  perto(r.trocas[0].Q + r.trocas[1].Q, 0, 1e-9);
});

test('mistura: gelo a 0 °C que não derrete todo → θeq = 0 °C e massa derretida', () => {
  const r = F.mistura([{ m: 0.5, c: 4180, theta: 20 }, { m: 0.5, theta: 0, fase: 'gelo' }]);
  assert.equal(r.thetaEq, 0);
  perto(r.geloDerretido, 0.5 * 4180 * 20 / 3.34e5);
  perto(r.geloRestante, 0.5 - r.geloDerretido);
  perto(r.trocas[0].Q + r.trocas[1].Q, 0, 1e-9);
});

test('mistura: gelo a 0 °C que derrete todo → θeq > 0 com a fusão no balanço', () => {
  const r = F.mistura([{ m: 1, c: 4180, theta: 60 }, { m: 0.1, theta: 0, fase: 'gelo' }]);
  // 1·4180·(θ − 60) + 0,1·3,34e5 + 0,1·4180·θ = 0
  const esperado = (4180 * 60 - 0.1 * 3.34e5) / (4180 * 1.1);
  perto(r.thetaEq, esperado);
  perto(r.geloDerretido, 0.1);
  assert.equal(r.geloRestante, 0);
  perto(r.trocas[0].Q + r.trocas[1].Q, 0, 1e-9);
});

test('mistura: valida as entradas', () => {
  assert.throws(() => F.mistura([{ m: 1, c: 4180, theta: 20 }]));
  assert.throws(() => F.mistura([{ m: 1, c: 4180, theta: 20 }, { m: 0.1, theta: -5, fase: 'gelo' }]), /0 °C/);
  assert.throws(() => F.mistura([{ m: 1, c: 4180, theta: 20 }, { m: 0.1, c: 0, theta: 5 }]));
});

// ---------- rendimento e painel ----------

test('rendimento: útil / fornecida, nunca maior que 1', () => {
  assert.equal(F.rendimento(3, 4), 0.75);
  assert.equal(F.rendimento(0, 4), 0);
  assert.throws(() => F.rendimento(5, 4), /1/);
  assert.throws(() => F.rendimento(1, 0));
});

test('painel: carga maior → U maior e I menor; ponto na curva modelo', () => {
  const p = D.modelos.painel;
  const a = F.painel({ irradiancia: 1000, Rcarga: 2 });
  const b = F.painel({ irradiancia: 1000, Rcarga: 100 });
  assert.ok(b.U > a.U && b.I < a.I);
  for (const x of [a, b]) {
    perto(x.U / x.I, x === a ? 2 : 100, 1e-6);
    perto(x.I, p.Isc * (1 - Math.exp((x.U - p.Uoc) / p.UT)), 1e-9);
    perto(x.P, x.U * x.I);
    assert.ok(x.rendimento > 0 && x.rendimento < 1);
  }
  const cc = F.painel({ irradiancia: 1000, Rcarga: 0 });
  assert.equal(cc.U, 0);
  perto(cc.I, p.Isc * (1 - Math.exp(-p.Uoc / p.UT)));
  // Isc proporcional à irradiância
  perto(F.painel({ irradiancia: 500, Rcarga: 0 }).I, cc.I / 2);
  assert.throws(() => F.painel({ irradiancia: 0, Rcarga: 10 }));
});

test('painelPotenciaMaxima: entre os extremos e maior que a de qualquer carga', () => {
  const p = D.modelos.painel;
  const max = F.painelPotenciaMaxima(1000);
  const a = F.painel({ irradiancia: 1000, Rcarga: 2 });
  const b = F.painel({ irradiancia: 1000, Rcarga: 100 });
  assert.ok(max.U > a.U && max.U < b.U);
  assert.ok(max.P >= a.P && max.P >= b.P);
  for (const R of [1, 5, 10, 12, 15, 20, 50]) assert.ok(max.P >= F.painel({ irradiancia: 1000, Rcarga: R }).P - 1e-9, String(R));
  // forma de uma curva real: fator de forma entre 0,6 e 0,85; rendimento típico (5 %–25 %)
  const ff = max.P / (p.Isc * p.Uoc);
  assert.ok(ff > 0.6 && ff < 0.85, String(ff));
  const eta = max.P / (1000 * p.area);
  assert.ok(eta > 0.05 && eta < 0.25, String(eta));
  perto(max.I, max.P / max.U);
});
