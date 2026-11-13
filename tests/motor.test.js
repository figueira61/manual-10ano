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
  dados['manual10.historico.v1'] = '{lixo';
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
  assert.equal(JSON.parse(dados['manual10.historico.v1']).itens.length, 2);
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
  assert.deepEqual(guardados.map((g) => g.intervalo_dias), [1, 3, 7]);
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
  assert.ok(JSON.parse(dados['manual10.historico.v1']).itens.some((i) => i.id === nova.id));
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
  const antes = dados['manual10.historico.v1'];
  d.resolver([t('errada', 1, '2026-11-12T09:00:00Z')]);
  await antigo;
  assert.equal(dados['manual10.historico.v1'], antes);
  assert.equal(JSON.parse(antes).dono, 'B');
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
