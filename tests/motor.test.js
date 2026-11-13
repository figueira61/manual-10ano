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

test('aluna: 2 erradas com sementes diferentes -> nao_resolvido, intervalo 1', () => {
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
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

test('3 certas em 2 dias -> domina e intervalo avanca', () => {
  const { M, conta, guardados, arm } = ambiente('aluna');
  const m = M.criarMotor({ conta, armazenamento: arm, agora: AGORA });
  m.registar(t('certa', 1, '2026-11-12T10:00:00Z'));
  m.registar(t('certa', 2, '2026-11-13T09:00:00Z'));
  m.registar(t('certa', 3, '2026-11-13T09:10:00Z'));
  assert.equal(m.estadoDe(CH).estado, 'domina');
  assert.deepEqual(guardados.map((g) => g.intervalo_dias), [1, 3, 7]);
});
