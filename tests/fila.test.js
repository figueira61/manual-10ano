const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const CHAVE = 'manual10.fila.v1';
const REGEX_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

let Manual;

beforeEach(() => {
  Manual = carregar('js/fila.js');
});

// Armazenamento falso em memória, com a mesma forma de localStorage.
function armazenamentoFalso(inicial) {
  const dados = new Map();
  if (inicial !== undefined) dados.set(CHAVE, inicial);
  return {
    dados,
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
  };
}

function item(id) {
  return { id, tentativa: { enunciado: 'x' } };
}

function ids(lista) {
  return lista.map((i) => i.id);
}

test('juntar dois itens e ler os pendentes', () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  f.juntar(item('b'));
  assert.deepEqual(ids(f.pendentes()), ['a', 'b']);
  assert.equal(f.tamanho(), 2);
});

test('juntar com id repetido não duplica', () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  f.juntar(item('a'));
  assert.deepEqual(ids(f.pendentes()), ['a']);
});

test('o estado persiste entre duas filas com o mesmo armazenamento', () => {
  const arm = armazenamentoFalso();
  Manual.criarFila(arm).juntar(item('a'));
  const nova = Manual.criarFila(arm);
  assert.deepEqual(ids(nova.pendentes()), ['a']);
  nova.juntar(item('b'));
  assert.deepEqual(ids(Manual.criarFila(arm).pendentes()), ['a', 'b']);
  assert.deepEqual(JSON.parse(arm.dados.get(CHAVE)).map((i) => i.id), ['a', 'b']);
});

test('chave de armazenamento personalizada é respeitada', () => {
  const arm = armazenamentoFalso();
  Manual.criarFila(arm, 'outra.chave').juntar(item('a'));
  assert.equal(arm.dados.has(CHAVE), false);
  assert.ok(arm.dados.has('outra.chave'));
});

test('marcarEnviados remove só os ids indicados', () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  f.juntar(item('b'));
  f.juntar(item('c'));
  f.marcarEnviados(['b']);
  assert.deepEqual(ids(f.pendentes()), ['a', 'c']);
  assert.equal(f.tamanho(), 2);
});

test('pendentes devolve uma cópia que não altera a fila', () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  f.pendentes().pop();
  assert.equal(f.tamanho(), 1);
});

test('armazenamento cujo getItem lança: não lança e funciona em memória', () => {
  const arm = {
    getItem: () => {
      throw new Error('bloqueado');
    },
    setItem: () => {
      throw new Error('bloqueado');
    },
  };
  let f;
  assert.doesNotThrow(() => {
    f = Manual.criarFila(arm);
  });
  assert.doesNotThrow(() => f.juntar(item('a')));
  assert.doesNotThrow(() => f.marcarEnviados(['a']));
  assert.equal(f.tamanho(), 0);
  f.juntar(item('b'));
  assert.deepEqual(ids(f.pendentes()), ['b']);
});

test('setItem a lançar não interrompe o estado em memória', () => {
  const arm = {
    getItem: () => null,
    setItem: () => {
      throw new Error('cheio');
    },
  };
  const f = Manual.criarFila(arm);
  assert.doesNotThrow(() => f.juntar(item('a')));
  assert.deepEqual(ids(f.pendentes()), ['a']);
});

test('JSON corrompido começa vazio', () => {
  const f = Manual.criarFila(armazenamentoFalso('{x'));
  assert.equal(f.tamanho(), 0);
  f.juntar(item('a'));
  assert.deepEqual(ids(f.pendentes()), ['a']);
});

test('JSON que não é uma lista começa vazio', () => {
  assert.equal(Manual.criarFila(armazenamentoFalso('{"a":1}')).tamanho(), 0);
  assert.equal(Manual.criarFila(armazenamentoFalso('null')).tamanho(), 0);
});

test('entradas sem id são ignoradas ao ler', () => {
  const arm = armazenamentoFalso(JSON.stringify([item('a'), { semId: true }, 7]));
  assert.deepEqual(ids(Manual.criarFila(arm).pendentes()), ['a']);
});

test('armazenamento null: funciona em memória', () => {
  const f = Manual.criarFila(null);
  f.juntar(item('a'));
  f.juntar(item('a'));
  assert.deepEqual(ids(f.pendentes()), ['a']);
});

test('enviarFila com envio que rejeita: nada se perde', async () => {
  const f = Manual.criarFila(armazenamentoFalso());
  for (let n = 0; n < 5; n++) f.juntar(item('i' + n));
  const r = await Manual.enviarFila(f, () => Promise.reject(new Error('rede')));
  assert.deepEqual(r, { enviados: 0, restantes: 5 });
  assert.equal(f.tamanho(), 5);
});

test('enviarFila com 120 itens faz 3 chamadas de 50, 50 e 20', async () => {
  const f = Manual.criarFila(armazenamentoFalso());
  for (let n = 0; n < 120; n++) f.juntar(item('i' + n));
  const tamanhos = [];
  const r = await Manual.enviarFila(f, async (lote) => {
    tamanhos.push(lote.length);
    return lote.map((i) => i.id);
  });
  assert.deepEqual(tamanhos, [50, 50, 20]);
  assert.deepEqual(r, { enviados: 120, restantes: 0 });
  assert.equal(f.tamanho(), 0);
});

test('enviarFila que aceita só parte: só os aceites saem', async () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  f.juntar(item('b'));
  f.juntar(item('c'));
  let chamadas = 0;
  const r = await Manual.enviarFila(f, async (lote) => {
    chamadas++;
    // Aceita 'a' e 'c' na primeira ronda; 'b' fica por enviar e não há mais progresso.
    return lote.map((i) => i.id).filter((id) => id !== 'b');
  });
  assert.equal(chamadas, 2);
  assert.deepEqual(r, { enviados: 2, restantes: 1 });
  assert.deepEqual(ids(f.pendentes()), ['b']);
});

test('enviarFila ignora ids devolvidos que não estavam no lote', async () => {
  const f = Manual.criarFila(armazenamentoFalso());
  f.juntar(item('a'));
  const r = await Manual.enviarFila(f, async () => ['a', 'fantasma']);
  assert.deepEqual(r, { enviados: 1, restantes: 0 });
});

test('enviarFila com fila vazia não chama enviar', async () => {
  const f = Manual.criarFila(armazenamentoFalso());
  let chamadas = 0;
  const r = await Manual.enviarFila(f, async () => {
    chamadas++;
    return [];
  });
  assert.equal(chamadas, 0);
  assert.deepEqual(r, { enviados: 0, restantes: 0 });
});

test('uuid tem formato v4 e 1000 chamadas são únicas', () => {
  const valores = new Set();
  for (let n = 0; n < 1000; n++) {
    const u = Manual.uuid();
    assert.match(u, REGEX_V4);
    valores.add(u);
  }
  assert.equal(valores.size, 1000);
});

test('uuid sem randomUUID usa getRandomValues (stub temporário)', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const preencher = (bytes) => bytes.fill(0xff);
  Object.defineProperty(globalThis, 'crypto', {
    value: { getRandomValues: preencher },
    configurable: true,
    writable: true,
  });
  try {
    assert.equal(Manual.uuid(), 'ffffffff-ffff-4fff-bfff-ffffffffffff');
  } finally {
    Object.defineProperty(globalThis, 'crypto', original);
  }
});

test('uuid sem randomUUID com bytes a zero: formato válido', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: { getRandomValues: (bytes) => bytes.fill(0) },
    configurable: true,
    writable: true,
  });
  try {
    assert.equal(Manual.uuid(), '00000000-0000-4000-8000-000000000000');
  } finally {
    Object.defineProperty(globalThis, 'crypto', original);
  }
});
