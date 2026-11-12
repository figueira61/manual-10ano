const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/config.js', 'js/fila.js', 'js/conta.js');
});

function memoria() {
  const d = {};
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } };
}

// Cliente falso com a mesma forma do supabase-js usada pelo adaptador.
function falso(opcoes = {}) {
  const f = {
    chamadas: [],
    tabelas: { perfis: [{ id: 'u1', papel: 'aluna', nome: 'Ana' }], tentativas: [], estados: [], ligacoes: [] },
    falhaUpsert: false,
    erroEntrar: null,
    erroRpc: null,
    sessao: null,
    ouvinte: null,
    ...opcoes,
  };
  f.auth = {
    signUp: async (a) => {
      f.chamadas.push(['signUp', a]);
      return { data: { user: { id: 'u1' }, session: f.sessao }, error: null };
    },
    signInWithPassword: async () => {
      if (f.erroEntrar) return { data: null, error: { message: f.erroEntrar } };
      f.sessao = { user: { id: 'u1' } };
      if (f.ouvinte) f.ouvinte('SIGNED_IN', f.sessao);
      return { data: { session: f.sessao, user: f.sessao.user }, error: null };
    },
    signOut: async () => {
      f.sessao = null;
      if (f.ouvinte) f.ouvinte('SIGNED_OUT', null);
      return { error: null };
    },
    getSession: async () => ({ data: { session: f.sessao }, error: null }),
    onAuthStateChange: (fn) => {
      f.ouvinte = fn;
      return { data: { subscription: { unsubscribe() {} } } };
    },
  };
  f.from = (t) => {
    const q = {
      filtros: [],
      upsert: async (itens, o) => {
        f.chamadas.push(['upsert', t, itens, o]);
        if (f.falhaUpsert) return { error: { message: 'Failed to fetch' } };
        f.tabelas[t].push(...[].concat(itens));
        return { error: null };
      },
      select() { return q; },
      eq(c, v) { q.filtros.push([c, v]); return q; },
      gte(c, v) { q.filtros.push([c + '>=', v]); return q; },
      order() { return q; },
      limit() { return q; },
      delete() { q.apagar = true; return q; },
      then(res, rej) {
        f.chamadas.push(['consulta', t, q.filtros, !!q.apagar]);
        return Promise.resolve({ data: f.tabelas[t].slice(), error: null }).then(res, rej);
      },
    };
    return q;
  };
  f.rpc = async (nome, args) => {
    f.chamadas.push(['rpc', nome, args]);
    if (f.erroRpc) return { data: null, error: { message: f.erroRpc } };
    return { data: nome === 'gerar_codigo_ligacao' ? 'ABCD2345' : null, error: null };
  };
  return f;
}

const tentativa = () => ({
  disciplina: 'mat-a', tema: 'funcoes', tipo: 'escolha', modo: 'quiz', resultado: 'certa',
});

test('sem cliente: modo local, tentativa vai para a fila e não lança', async () => {
  const arm = memoria();
  await Manual.conta.iniciar({ armazenamento: arm });
  assert.equal(Manual.conta.estado().modo, 'local');
  assert.equal(Manual.conta.estado().autenticado, false);
  const t = await Manual.conta.guardarTentativa(tentativa());
  assert.ok(t.id && t.criado_em);
  assert.deepEqual(await Manual.conta.sincronizar(), { enviados: 0, restantes: 1 });
});

test('entrar: erros mapeados para códigos PT', async () => {
  const f = falso({ erroEntrar: 'Invalid login credentials' });
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await assert.rejects(Manual.conta.entrar('a@b.pt', 'x'), { codigo: 'credenciais' });
  f.erroEntrar = 'Email not confirmed';
  await assert.rejects(Manual.conta.entrar('a@b.pt', 'x'), { codigo: 'email_por_confirmar' });
  f.erroEntrar = 'Failed to fetch';
  await assert.rejects(Manual.conta.entrar('a@b.pt', 'x'), { codigo: 'rede' });
  f.erroEntrar = 'qualquer coisa';
  await assert.rejects(Manual.conta.entrar('a@b.pt', 'x'), { codigo: 'desconhecido' });
});

test('entrar: estado com papel e perfil; aoMudar chamado e desligável', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  let n = 0;
  const desligar = Manual.conta.aoMudar(() => n++);
  await Manual.conta.entrar('a@b.pt', 'x');
  const e = Manual.conta.estado();
  assert.equal(e.autenticado, true);
  assert.equal(e.papel, 'aluna');
  assert.deepEqual(e.perfil, { id: 'u1', nome: 'Ana' });
  assert.equal(e.modo, 'online');
  assert.ok(n >= 1);
  desligar();
  const antes = n;
  await Manual.conta.sair();
  assert.equal(n, antes);
  assert.equal(Manual.conta.estado().autenticado, false);
});

test('registar envia papel e nome nos metadados', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.registar('a@b.pt', 'segredo12', 'encarregado', 'Mãe');
  const c = f.chamadas.find((x) => x[0] === 'signUp')[1];
  assert.deepEqual(c, {
    email: 'a@b.pt',
    password: 'segredo12',
    options: { data: { papel: 'encarregado', nome: 'Mãe' } },
  });
});

test('guardarTentativa autenticado faz upsert idempotente', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  const t = await Manual.conta.guardarTentativa(tentativa());
  const up = f.chamadas.filter((c) => c[0] === 'upsert' && c[1] === 'tentativas');
  assert.equal(up.length, 1);
  assert.deepEqual(up[0][3], { onConflict: 'id', ignoreDuplicates: true });
  assert.equal(up[0][2][0].id, t.id);
  assert.equal(up[0][2][0].aluna_id, 'u1');
  assert.equal((await Manual.conta.sincronizar()).restantes, 0);
});

test('falha de rede deixa pendente; sincronizar envia uma vez', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  f.falhaUpsert = true;
  await Manual.conta.guardarTentativa(tentativa());
  assert.equal(f.tabelas.tentativas.length, 0);
  f.falhaUpsert = false;
  assert.deepEqual(await Manual.conta.sincronizar(), { enviados: 1, restantes: 0 });
  assert.equal(f.tabelas.tentativas.length, 1);
  assert.deepEqual(await Manual.conta.sincronizar(), { enviados: 0, restantes: 0 });
  assert.equal(f.tabelas.tentativas.length, 1);
});

test('guardarEstado usa onConflict aluna_id,chave', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  await Manual.conta.guardarEstado({ chave: 'mat-a/funcoes/afim', estado: 'domina' });
  const up = f.chamadas.find((c) => c[0] === 'upsert' && c[1] === 'estados');
  assert.equal(up[3].onConflict, 'aluna_id,chave');
  assert.equal(up[2].aluna_id, 'u1');
});

test('códigos de ligação: erros do RPC mapeados', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(await Manual.conta.gerarCodigoLigacao(), 'ABCD2345');
  f.erroRpc = 'codigo_invalido';
  await assert.rejects(Manual.conta.ligarEncarregado('XXXXXXXX'), { codigo: 'codigo_invalido' });
  f.erroRpc = 'papel_invalido';
  await assert.rejects(Manual.conta.ligarEncarregado('XXXXXXXX'), { codigo: 'papel_invalido' });
  f.erroRpc = 'nao_autenticado';
  await assert.rejects(Manual.conta.gerarCodigoLigacao(), { codigo: 'sem_sessao' });
});

test('sem sessão: operações de conta rejeitam com sem_sessao', async () => {
  await Manual.conta.iniciar({ cliente: falso(), armazenamento: memoria() });
  await assert.rejects(Manual.conta.exportar(), { codigo: 'sem_sessao' });
  await assert.rejects(Manual.conta.gerarCodigoLigacao(), { codigo: 'sem_sessao' });
});

test('exportar agrega as quatro coleções; apagarConta chama o RPC', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  const x = await Manual.conta.exportar();
  assert.deepEqual(Object.keys(x).sort(), ['estados', 'ligacoes', 'perfil', 'tentativas']);
  assert.equal(x.perfil.nome, 'Ana');
  await Manual.conta.apagarConta();
  assert.ok(f.chamadas.some((c) => c[0] === 'rpc' && c[1] === 'apagar_conta'));
  assert.equal(Manual.conta.estado().autenticado, false);
});

test('carregar em Node sem window não lança', () => {
  assert.equal(typeof Manual.conta.iniciar, 'function');
});
