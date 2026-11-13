const test = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda');

function ambiente(papel, extra) {
  const M = carregar('js/aprendizagem.js', 'js/motor.js');
  const guardados = [];
  const conta = Object.assign({
    estado: () => ({ papel, perfil: papel ? { id: 'u1' } : null }),
    guardarEstado: async (e) => { guardados.push(e); },
    tentativas: async () => [],
    estados: async () => [],
  }, extra);
  const dados = {};
  const arm = { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = v; } };
  return { M, conta, guardados, arm, dados };
}
let n = 0;
function t(res, semente, quando, extra) {
  n += 1;
  return Object.assign({ id: 'id' + n, disciplina: 'mat-a', tema: 'f', subtema: 'afim', tipo: 'numerica', semente,
    resultado: res, primeira_tentativa: true, viu_resolucao: false, usou_pista: false, criado_em: quando }, extra);
}
const CH = 'mat-a/f/afim';
const AGORA = () => new Date('2026-11-13T10:00:00Z');

test('aluna: 2 erradas com sementes diferentes -> nao_resolvido, intervalo 1', async () => {
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  let avisos = 0; m.aoMudar(() => { avisos += 1; });
  m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
  m.registar(t('errada', 2, '2026-11-13T09:05:00Z'));
  assert.equal(m.estadoDe(CH).estado, 'nao_resolvido');
  assert.equal(guardados.length, 2);
  assert.equal(guardados[1].intervalo_dias, 1);
  assert.equal(guardados[1].chave, CH);
  assert.equal(avisos, 2);
  assert.equal(m.estadoDe('x/y/z'), null);
});

test('encarregado nunca guarda estado', () => {
  const { M, conta, guardados, arm } = ambiente('encarregado');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
  assert.equal(guardados.length, 0);
  assert.equal(m.estadoDe(CH).estado, 'dificuldade');
});

test('armazenamento que lanca nao impede o motor', () => {
  const { M, conta } = ambiente('aluna');
  const mau = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  const m = M.criarMotor({ conta, armazenamento: mau, agora: AGORA });
  assert.doesNotThrow(() => {
    m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
    m.registar(t('errada', 2, '2026-11-13T09:05:00Z'));
  });
  assert.equal(m.estadoDe(CH).estado, 'nao_resolvido');
});

test('historico corrompido e tolerado', async () => {
  const { M, conta, arm, dados } = ambiente('aluna');
  dados['manual10.historico.v1:u1'] = '{lixo';
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('certa', 1, '2026-11-13T09:00:00Z'));
  assert.equal(m.estadoDe(CH).estado, 'dificuldade');
});

test('carregar junta remotas sem duplicar e usa estados remotos', async () => {
  const a = t('errada', 1, '2026-11-12T09:00:00Z');
  const b = t('errada', 2, '2026-11-12T09:05:00Z');
  const { M, conta, arm, dados } = ambiente('aluna', {
    tentativas: async (o) => { assert.ok(o.desde.startsWith('2026-08-15')); return [a, b]; },
    estados: async () => [{ chave: 'mat-a/f/outro', estado: 'domina', tipos: {}, proxima_revisao: '2026-12-01', intervalo_dias: 7 }],
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  m.registar(a);
  await m.carregar();
  assert.equal(JSON.parse(dados['manual10.historico.v1:u1']).itens.length, 2);
  assert.equal(m.estadoDe(CH).estado, 'nao_resolvido');
  assert.equal(m.estadoDe('mat-a/f/outro').estado, 'domina');
});

test('carregar sem sessao usa so o local e nunca lanca', async () => {
  const { M, conta, arm } = ambiente(null, { tentativas: async () => { throw new Error('x'); } });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
  const m2 = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m2.carregar();
  assert.equal(m2.estadoDe(CH).estado, 'dificuldade');
});

test('3 certas em 2 dias -> domina e intervalo avanca', async () => {
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('certa', 1, '2026-11-12T10:00:00Z'));
  m.registar(t('certa', 2, '2026-11-13T09:00:00Z'));
  m.registar(t('certa', 3, '2026-11-13T09:10:00Z'));
  assert.equal(m.estadoDe(CH).estado, 'domina');
  assert.deepEqual(guardados.map((g) => g.intervalo_dias), [1, 3, 3]); // um avanço por dia (I3)
});

function atraso() {
  let resolver;
  const p = new Promise((r) => { resolver = r; });
  return { p, resolver };
}

test('registar durante carregar em curso nao perde a tentativa', async () => {
  const d = atraso();
  const { M, conta, arm, dados } = ambiente('aluna', { tentativas: () => d.p });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  const c = m.carregar();
  const nova = t('errada', 1, '2026-11-13T09:00:00Z');
  m.registar(nova);
  d.resolver([]);
  await c;
  assert.ok(JSON.parse(dados['manual10.historico.v1:u1']).itens.some((i) => i.id === nova.id));
  assert.equal(m.estadoDe(CH).estado, 'dificuldade');
});

test('carregar antigo de outra conta nao escreve nada', async () => {
  const d = atraso();
  let dono = 'A';
  let primeira = true;
  const { M, conta, arm, dados } = ambiente('aluna', {
    estado: () => ({ papel: 'aluna', perfil: { id: dono } }),
    tentativas: () => (primeira ? ((primeira = false), d.p) : Promise.resolve([])),
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  const antigo = m.carregar();
  dono = 'B';
  await m.carregar();
  const antes = dados['manual10.historico.v1:B'];
  d.resolver([t('errada', 1, '2026-11-12T09:00:00Z')]);
  await antigo;
  assert.equal(dados['manual10.historico.v1:B'], antes);
  assert.equal(JSON.parse(antes).dono, 'B');
  assert.equal(dados['manual10.historico.v1:A'], undefined);
  assert.equal(m.estadoDe(CH), null);
});

test('intervalo de visitante nao passa para a aluna que entra', async () => {
  let papel = null, id = null;
  const { M, conta, guardados, arm } = ambiente('aluna', {
    estado: () => ({ papel, perfil: id ? { id } : null }),
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  m.registar(t('certa', 1, '2026-11-12T10:00:00Z'));
  m.registar(t('certa', 2, '2026-11-13T09:00:00Z'));
  assert.equal(m.estadoDe(CH).intervalo_dias, 3);
  papel = 'aluna'; id = 'B';
  await m.carregar();
  assert.equal(m.estadoDe(CH), null);
  m.registar(t('certa', 3, '2026-11-13T09:10:00Z'));
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].intervalo_dias, 1);
});

test('registar com id repetido nao avanca o intervalo', () => {
  const { M, conta, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  const a = t('certa', 1, '2026-11-13T09:00:00Z');
  m.registar(a);
  m.registar(a);
  assert.equal(m.estadoDe(CH).intervalo_dias, 1);
});

test('registar antes dos estados remotos so guarda depois e com o intervalo remoto', async () => {
  const d = atraso();
  const { M, conta, guardados, arm } = ambiente('aluna', { estados: () => d.p });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  const c = m.carregar();
  m.registar(t('certa', 1, '2026-11-13T09:00:00Z'));
  assert.equal(guardados.length, 0);
  d.resolver([{ chave: CH, estado: 'dominio', tipos: {}, proxima_revisao: '2026-11-13', intervalo_dias: 7 }]);
  await c;
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].intervalo_dias, 14);
});

// ---------- vaga final de correções ----------

const HIST = 'manual10.historico.v1';

test('C1: tentativa construida pelo quiz chega ao motor com o mesmo id enviado para a conta', () => {
  const M = carregar('js/fila.js', 'js/quiz.js', 'js/aprendizagem.js', 'js/motor.js', 'js/render.js');
  const enviados = [];
  M.conta = {
    estado: () => ({ papel: null, perfil: null }),
    guardarTentativa: async (x) => { const c = Object.assign({}, x); enviados.push(c); return c; },
  };
  const dados = {};
  const arm = { getItem: (k) => (k in dados ? dados[k] : null), setItem: (k, v) => { dados[k] = v; } };
  M.motor = M.criarMotor({ conta: M.conta, armazenamento: arm });
  const ctx = { disciplina: 'mat-a', tema: 'f', subtema: 'afim' };
  const p = { id: 'afim-q01', tipo: 'numerica' };
  for (let i = 0; i < 2; i++) {
    const tt = M.quiz.construirTentativa(ctx, p, 0, 'errada', 1000, 'sessao', null);
    M.render.registarTentativa(tt);
  }
  assert.equal(enviados.length, 2);
  assert.equal(typeof enviados[0].id, 'string');
  assert.ok(Number.isFinite(Date.parse(enviados[0].criado_em)));
  const local = JSON.parse(dados[HIST + ':visitante']).itens;
  assert.deepEqual(local.map((i) => i.id).sort(), enviados.map((e) => e.id).sort());
  assert.equal(M.motor.estadoDe(CH).estado, 'nao_resolvido');
});

test('I1: historico da aluna sobrevive a um carregar sem sessao; visitante e aluna nao se misturam', async () => {
  let papel = 'aluna', id = 'u1';
  const { M, conta, arm, dados } = ambiente('aluna', { estado: () => ({ papel, perfil: id ? { id } : null }) });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
  const daAluna = dados[HIST + ':u1'];
  assert.equal(JSON.parse(daAluna).itens.length, 1);
  // novo carregamento da página: a sessão ainda não é conhecida
  papel = null; id = null;
  const m2 = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m2.carregar();
  assert.equal(dados[HIST + ':u1'], daAluna);
  assert.equal(m2.estadoDe(CH), null);
  m2.registar(t('certa', 2, '2026-11-13T09:10:00Z'));
  assert.equal(JSON.parse(dados[HIST + ':visitante']).itens.length, 1);
  assert.equal(dados[HIST + ':u1'], daAluna);
  papel = 'aluna'; id = 'u1';
  await m2.carregar();
  assert.equal(m2.estadoDe(CH).estado, 'dificuldade');
  assert.equal(JSON.parse(dados[HIST + ':u1']).itens.length, 1);
});

test('I1: chave antiga unica e migrada para a chave do dono', async () => {
  const { M, conta, arm, dados } = ambiente('aluna');
  dados[HIST] = JSON.stringify({ dono: 'u1', itens: [t('errada', 1, '2026-11-13T09:00:00Z')] });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  assert.equal(JSON.parse(dados[HIST + ':u1']).itens.length, 1);
  assert.equal(m.estadoDe(CH).estado, 'dificuldade');
});

test('I2: estados() falha -> nada guardado; carregar seguinte guarda com o intervalo remoto', async () => {
  let falhar = true;
  const { M, conta, guardados, arm } = ambiente('aluna', {
    estados: async () => {
      if (falhar) throw new Error('rede');
      return [{ chave: CH, estado: 'dificuldade', tipos: {}, proxima_revisao: '2026-11-13', intervalo_dias: 7 }];
    },
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('certa', 1, '2026-11-13T09:00:00Z'));
  assert.equal(guardados.length, 0);
  falhar = false;
  await m.carregar();
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].intervalo_dias, 14);
});

test('I2: registar volta a tentar carregar no maximo uma vez por minuto', async () => {
  let pedidos = 0, falhar = true;
  let relogio = new Date('2026-11-13T10:00:00Z').getTime();
  const { M, conta, guardados, arm } = ambiente('aluna', {
    estados: async () => { pedidos += 1; if (falhar) throw new Error('rede'); return []; },
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: () => new Date(relogio) });
  await m.carregar();
  assert.equal(pedidos, 1);
  m.registar(t('errada', 1, '2026-11-13T09:00:00Z'));
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(pedidos, 1);
  relogio += 61000;
  falhar = false;
  m.registar(t('errada', 2, '2026-11-13T09:01:00Z'));
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(pedidos, 2);
  assert.equal(guardados.length, 2);
});

test('I2: pendentes limitados a 200 (sai o mais antigo)', async () => {
  let falhar = true;
  const { M, conta, guardados, arm } = ambiente('aluna', {
    estados: async () => { if (falhar) throw new Error('rede'); return []; },
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  for (let i = 0; i < 205; i++) m.registar(t('errada', 1000 + i, '2026-11-13T09:00:00Z', { subtema: 's' + i }));
  falhar = false;
  await m.carregar();
  assert.equal(guardados.length, 200);
  assert.equal(guardados[0].chave, 'mat-a/f/s5');
});

test('I3: no maximo um avanco por dia de Lisboa; dia seguinte avanca; errada volta a 1', async () => {
  let relogio = new Date('2026-11-13T10:00:00Z');
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: () => relogio });
  await m.carregar();
  for (let i = 0; i < 5; i++) m.registar(t('certa', 10 + i, '2026-11-13T09:0' + i + ':00Z'));
  assert.deepEqual(guardados.map((g) => g.intervalo_dias), [1, 3, 3, 3, 3]);
  assert.equal(guardados[4].tipos._ultimo_avanco, '2026-11-13');
  relogio = new Date('2026-11-14T10:00:00Z');
  m.registar(t('certa', 20, '2026-11-14T09:00:00Z'));
  assert.equal(guardados[5].intervalo_dias, 7);
  m.registar(t('errada', 21, '2026-11-14T09:05:00Z'));
  assert.equal(guardados[6].intervalo_dias, 1);
  assert.equal(m.estadoDe(CH).tipos._ultimo_avanco, undefined);
});

test('I3: dia do ultimo avanco vindo do servidor e respeitado', async () => {
  const { M, conta, guardados, arm } = ambiente('aluna', {
    estados: async () => [{ chave: CH, estado: 'dificuldade', tipos: { _ultimo_avanco: '2026-11-13' }, proxima_revisao: '2026-11-16', intervalo_dias: 3 }],
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('certa', 1, '2026-11-13T09:00:00Z'));
  assert.equal(guardados[0].intervalo_dias, 3);
  assert.equal(guardados[0].tipos._ultimo_avanco, '2026-11-13');
});

test('M1+M2: linhas com atualizado_em; consultas filtradas pelo dono', async () => {
  const pedidos = [];
  const { M, conta, guardados, arm } = ambiente('aluna', {
    tentativas: async (o) => { pedidos.push(['t', o.alunaId]); return []; },
    estados: async (a) => { pedidos.push(['e', a]); return []; },
  });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  assert.deepEqual(pedidos, [['t', 'u1'], ['e', 'u1']]);
  m.registar(t('certa', 1, '2026-11-13T09:00:00Z'));
  assert.equal(guardados[0].atualizado_em, '2026-11-13T10:00:00.000Z');
});

test('M3: tentativa sem data valida nunca guarda estado null', async () => {
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  await m.carregar();
  m.registar(t('certa', 1, 'lixo'));
  assert.equal(guardados.length, 0);
  assert.equal(m.estadoDe(CH), null);
});

test('M3: pendente cujo estado nao se calcula nao e guardado', async () => {
  const d = atraso();
  const { M, conta, guardados, arm } = ambiente('aluna', { estados: () => d.p });
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  const c = m.carregar();
  m.registar(t('certa', 1, 'lixo'));
  d.resolver([]);
  await c;
  assert.equal(guardados.length, 0);
});
