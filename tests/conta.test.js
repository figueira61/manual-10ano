const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/config.js', 'js/fila.js', 'js/conta.js');
});

function memoria() {
  const d = {};
  return {
    d,
    getItem: (k) => (k in d ? d[k] : null),
    setItem: (k, v) => { d[k] = String(v); },
    removeItem: (k) => { delete d[k]; },
  };
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
    stopAutoRefresh: async () => { f.chamadas.push(['stopAutoRefresh']); },
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
        const lista = [].concat(itens);
        const r = f.respostaUpsert && f.respostaUpsert(lista);
        if (r) return r;
        f.tabelas[t].push(...lista);
        return { error: null, status: 201 };
      },
      select() { return q; },
      eq(c, v) { q.filtros.push([c, v]); return q; },
      in(c, v) { q.filtros.push([c + ' in', v]); return q; },
      gte(c, v) { q.filtros.push([c + '>=', v]); return q; },
      order() { return q; },
      limit() { return q; },
      range(a, b) { q.intervalo = [a, b]; return q; },
      delete() { q.apagar = true; return q; },
      then(res, rej) {
        f.chamadas.push(['consulta', t, q.filtros, !!q.apagar, q.intervalo]);
        // Aplica os filtros como o PostgREST (o RLS não é simulado) e o intervalo pedido.
        let linhas = f.tabelas[t].filter((l) => q.filtros.every(([c, v]) => {
          if (c.endsWith(' in')) return v.includes(l[c.slice(0, -3)]);
          if (c.endsWith('>=')) return l[c.slice(0, -2)] >= v;
          return l[c] === v;
        }));
        if (q.intervalo) linhas = linhas.slice(q.intervalo[0], q.intervalo[1] + 1);
        return Promise.resolve({ data: linhas, error: null }).then(res, rej);
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

test('importação: tentativa de visitante recebe o aluna_id ao entrar', async () => {
  const f = falso();
  const arm = memoria();
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.guardarTentativa(tentativa());
  await Manual.conta.entrar('a@b.pt', 'x');
  const up = f.chamadas.filter((c) => c[0] === 'upsert' && c[1] === 'tentativas');
  assert.equal(up.length, 1);
  assert.equal(up[0][2][0].aluna_id, 'u1');
});

test('item de outra conta nunca é enviado e fica na fila', async () => {
  const f = falso();
  const arm = memoria();
  Manual.criarFila(arm).juntar({ id: 'x1', aluna_id: 'u2', disciplina: 'd' });
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(f.chamadas.filter((c) => c[0] === 'upsert').length, 0);
  assert.deepEqual(await Manual.conta.sincronizar(), { enviados: 0, restantes: 1 });
});

test('atribuição persistida: envio falhado não permite reatribuir a outra conta', async () => {
  const f = falso();
  const arm = memoria();
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.guardarTentativa(tentativa());
  f.falhaUpsert = true;
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(Manual.criarFila(arm).pendentes()[0].aluna_id, 'u1');
});

test('erros de autenticação: já registado, palavra-passe fraca, limite de pedidos', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  const casos = [
    [{ message: 'User already registered' }, 'ja_registado'],
    [{ code: 'user_already_exists', message: 'x' }, 'ja_registado'],
    [{ message: 'Password should be at least 6 characters' }, 'palavra_passe_fraca'],
    [{ code: 'weak_password', message: 'x' }, 'palavra_passe_fraca'],
    [{ status: 429, message: 'x' }, 'demasiados_pedidos'],
    [{ message: 'email rate limit exceeded' }, 'demasiados_pedidos'],
  ];
  for (const [e, codigo] of casos) {
    f.auth.signUp = async () => ({ data: null, error: e });
    await assert.rejects(Manual.conta.registar('a@b.pt', 'x', 'aluna', 'A'), { codigo });
  }
});

test('sair limpa o estado mesmo que signOut falhe offline', async () => {
  const f = falso();
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  f.auth.signOut = async () => { throw new TypeError('Failed to fetch'); };
  await Manual.conta.sair();
  assert.equal(Manual.conta.estado().autenticado, false);
});

test('sair offline remove a sessão guardada (chave derivada do URL)', async () => {
  const f = falso();
  const arm = memoria();
  const chave = 'sb-dhflcwqwmhbyxqcsxvlh-auth-token';
  arm.setItem(chave, '{"access_token":"x"}');
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  f.auth.signOut = async () => { throw new TypeError('Failed to fetch'); };
  await Manual.conta.sair();
  assert.equal(arm.getItem(chave), null);
  assert.equal(Manual.conta.estado().autenticado, false);
  // também quando devolve {error}
  arm.setItem(chave, 'y');
  f.auth.signOut = async () => ({ error: { message: 'Failed to fetch' } });
  await Manual.conta.sair();
  assert.equal(arm.getItem(chave), null);
});

test('encarregado com sessão: item de visitante não é reclamado nem enviado', async () => {
  const f = falso();
  f.tabelas.perfis = [{ id: 'u1', papel: 'encarregado', nome: 'Rui' }];
  const arm = memoria();
  Manual.criarFila(arm).juntar({ id: 'v1', disciplina: 'd' });
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(f.chamadas.filter((c) => c[0] === 'upsert').length, 0);
  const pend = Manual.criarFila(arm).pendentes();
  assert.equal(pend.length, 1);
  assert.equal(pend[0].aluna_id, undefined);
});

test('apagarConta limpa da fila local os itens da conta e de visitante, não os de outras', async () => {
  const f = falso();
  const arm = memoria();
  const q = Manual.criarFila(arm);
  q.juntar({ id: 'a', aluna_id: 'u1' });
  q.juntar({ id: 'b' });
  q.juntar({ id: 'c', aluna_id: 'u2' });
  f.falhaUpsert = true;
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(Manual.criarFila(arm).pendentes().length, 3);
  await Manual.conta.apagarConta();
  assert.deepEqual(Manual.criarFila(arm).pendentes().map((i) => i.id), ['c']);
});

// ---------- vaga final de correções ----------

function linhasTentativas(n, aluna) {
  return Array.from({ length: n }, (_, i) => ({ id: 't' + i, aluna_id: aluna, criado_em: String(i).padStart(6, '0') }));
}

test('tentativas e estados paginam de 1000 em 1000 até uma página curta; exportar recebe tudo', async () => {
  const f = falso();
  f.tabelas.tentativas = linhasTentativas(2500, 'u1');
  f.tabelas.estados = Array.from({ length: 1000 }, (_, i) => ({ aluna_id: 'u1', chave: 'k' + i }));
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  f.chamadas.length = 0;
  assert.equal((await Manual.conta.tentativas()).length, 2500);
  const paginas = f.chamadas.filter((c) => c[0] === 'consulta' && c[1] === 'tentativas').map((c) => c[4]);
  assert.deepEqual(paginas, [[0, 999], [1000, 1999], [2000, 2999]]);
  assert.equal((await Manual.conta.estados()).length, 1000);
  const x = await Manual.conta.exportar();
  assert.equal(x.tentativas.length, 2500);
  assert.equal(x.estados.length, 1000);
  assert.equal(new Set(x.tentativas.map((t) => t.id)).size, 2500);
});

test('erroPermanente: 4xx exceto 401/408/429 e códigos Postgres 22xxx/23xxx', () => {
  const p = Manual.conta.erroPermanente;
  assert.equal(p(400, '22P02'), true);
  assert.equal(p(409, '23505'), true);
  assert.equal(p(403, '42501'), true);
  assert.equal(p(undefined, '23514'), true);
  assert.equal(p(401, 'PGRST301'), false);
  assert.equal(p(408, ''), false);
  assert.equal(p(429, ''), false);
  assert.equal(p(500, ''), false);
  assert.equal(p(503, ''), false);
  assert.equal(p(0, ''), false);
  assert.equal(p(undefined, undefined), false);
});

test('item venenoso: o lote é reenviado item a item; os bons entram, o mau vai para a quarentena', async () => {
  const f = falso();
  const arm = memoria();
  f.respostaUpsert = (itens) =>
    itens.some((i) => i.disciplina === 'mau')
      ? { error: { code: '22P02', message: 'invalid input syntax' }, status: 400 }
      : null;
  const q = Manual.criarFila(arm);
  q.juntar({ id: 'a', disciplina: 'd' });
  q.juntar({ id: 'mau1', disciplina: 'mau' });
  q.juntar({ id: 'b', disciplina: 'd' });
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.deepEqual(f.tabelas.tentativas.map((t) => t.id).sort(), ['a', 'b']);
  assert.equal(Manual.criarFila(arm).tamanho(), 0);
  assert.deepEqual(Manual.criarQuarentena(arm).itens().map((i) => i.id), ['mau1']);
  // nunca mais bloqueia: um novo envio não volta a tentar o item mau
  f.chamadas.length = 0;
  await Manual.conta.guardarTentativa(tentativa());
  const ups = f.chamadas.filter((c) => c[0] === 'upsert');
  assert.equal(ups.length, 1);
  assert.equal(ups[0][2].length, 1);
});

test('erro de rede ou 5xx no envio: tudo fica na fila e nada vai para a quarentena', async () => {
  const respostas = [
    { error: { message: 'Service Unavailable', code: '' }, status: 503 },
    { error: { message: 'TypeError: Failed to fetch', code: '' }, status: 0 },
  ];
  for (const resposta of respostas) {
    Manual = carregar('js/nucleo.js', 'js/config.js', 'js/fila.js', 'js/conta.js');
    const f = falso();
    const arm = memoria();
    f.respostaUpsert = () => resposta;
    const q = Manual.criarFila(arm);
    q.juntar({ id: 'a', disciplina: 'd' });
    q.juntar({ id: 'b', disciplina: 'd' });
    await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
    await Manual.conta.entrar('a@b.pt', 'x');
    assert.equal(Manual.criarFila(arm).tamanho(), 2);
    assert.equal(Manual.criarQuarentena(arm).itens().length, 0);
    assert.equal(f.chamadas.filter((c) => c[0] === 'upsert').length, 1);
  }
});

test('ligacoes devolve o nome da outra parte (lado da aluna e lado do encarregado)', async () => {
  const f = falso();
  f.tabelas.perfis.push({ id: 'e1', papel: 'encarregado', nome: 'Rui' });
  f.tabelas.ligacoes = [{ id: 'l1', aluna_id: 'u1', encarregado_id: 'e1', criado_em: '2026-11-12T10:00:00Z' }];
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  const l = await Manual.conta.ligacoes();
  assert.equal(l[0].nome, 'Rui');
  assert.equal(l[0].id, 'l1');

  Manual = carregar('js/nucleo.js', 'js/config.js', 'js/fila.js', 'js/conta.js');
  const g = falso();
  g.tabelas.perfis = [{ id: 'u1', papel: 'encarregado', nome: 'Rui' }, { id: 'a9', papel: 'aluna', nome: 'Ana' }];
  g.tabelas.ligacoes = [{ id: 'l2', aluna_id: 'a9', encarregado_id: 'u1', criado_em: '2026-11-12T10:00:00Z' }];
  await Manual.conta.iniciar({ cliente: g, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal((await Manual.conta.ligacoes())[0].nome, 'Ana');
});

test('exportar de um encarregado: só o próprio perfil e ligações, nenhuma linha da educanda', async () => {
  const f = falso();
  f.tabelas.perfis = [{ id: 'u1', papel: 'encarregado', nome: 'Rui' }, { id: 'a9', papel: 'aluna', nome: 'Ana' }];
  f.tabelas.ligacoes = [{ id: 'l2', aluna_id: 'a9', encarregado_id: 'u1', criado_em: '2026-11-12T10:00:00Z' }];
  f.tabelas.tentativas = linhasTentativas(3, 'a9');
  f.tabelas.estados = [{ aluna_id: 'a9', chave: 'k' }];
  await Manual.conta.iniciar({ cliente: f, armazenamento: memoria() });
  await Manual.conta.entrar('a@b.pt', 'x');
  const x = await Manual.conta.exportar();
  assert.equal(x.perfil.id, 'u1');
  assert.deepEqual(x.tentativas, []);
  assert.deepEqual(x.estados, []);
  assert.equal(x.ligacoes.length, 1);
});

test('sair com signOut falhado: pára a renovação automática antes de remover a sessão', async () => {
  const f = falso();
  const arm = memoria();
  const chave = 'sb-dhflcwqwmhbyxqcsxvlh-auth-token';
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  arm.setItem(chave, 'x');
  const removerOriginal = arm.removeItem;
  arm.removeItem = (k) => { f.chamadas.push(['removeItem', k]); removerOriginal(k); };
  f.auth.signOut = async () => { throw new TypeError('Failed to fetch'); };
  await Manual.conta.sair();
  const ordem = f.chamadas.filter((c) => c[0] === 'stopAutoRefresh' || c[0] === 'removeItem').map((c) => c[0]);
  assert.deepEqual(ordem, ['stopAutoRefresh', 'removeItem']);
  assert.equal(arm.getItem(chave), null);
  // sem stopAutoRefresh no cliente: não lança
  delete f.auth.stopAutoRefresh;
  await Manual.conta.entrar('a@b.pt', 'x');
  await Manual.conta.sair();
  assert.equal(Manual.conta.estado().autenticado, false);
});

test('podeRegistar: decisão pura a partir do papel atual e do último papel neste dispositivo', () => {
  const p = Manual.conta.podeRegistar;
  assert.equal(p('aluna', 'encarregado'), true);
  assert.equal(p('encarregado', null), false);
  assert.equal(p(null, 'encarregado'), false);
  assert.equal(p(null, 'aluna'), true);
  assert.equal(p(null, null), true);
});

test('último papel fica guardado no dispositivo e trava o registo enquanto o papel não é conhecido', async () => {
  const f = falso();
  f.tabelas.perfis = [{ id: 'u1', papel: 'encarregado', nome: 'Rui' }];
  const arm = memoria();
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  assert.equal(Manual.conta.registaTentativas(), true);
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(arm.getItem('manual10.ultimo_papel'), 'encarregado');
  assert.equal(Manual.conta.registaTentativas(), false);
  await Manual.conta.sair();
  assert.equal(Manual.conta.registaTentativas(), false);
  f.tabelas.perfis = [{ id: 'u1', papel: 'aluna', nome: 'Ana' }];
  await Manual.conta.entrar('a@b.pt', 'x');
  assert.equal(arm.getItem('manual10.ultimo_papel'), 'aluna');
  assert.equal(Manual.conta.registaTentativas(), true);
});

test('armazenamentoFalhou reflete a fila', async () => {
  const arm = { getItem: () => null, setItem: () => { throw new Error('cheio'); }, removeItem() {} };
  await Manual.conta.iniciar({ armazenamento: arm });
  assert.equal(Manual.conta.armazenamentoFalhou(), false);
  await Manual.conta.guardarTentativa(tentativa());
  assert.equal(Manual.conta.armazenamentoFalhou(), true);
});

// ---------- vaga final da fase 2B ----------
test('guardarTentativa mantém id e criado_em fornecidos', async () => {
  const arm = memoria();
  await Manual.conta.iniciar({ armazenamento: arm });
  const t = await Manual.conta.guardarTentativa(Object.assign(tentativa(), { id: 'fixo', criado_em: '2026-11-13T09:00:00.000Z' }));
  assert.equal(t.id, 'fixo');
  assert.equal(t.criado_em, '2026-11-13T09:00:00.000Z');
});

test('apagarConta apaga o histórico local dessa conta; sair não apaga nada', async () => {
  const f = falso();
  const arm = memoria();
  arm.setItem('manual10.historico.v1:u1', '{"dono":"u1","itens":[]}');
  arm.setItem('manual10.historico.v1:u2', '{"dono":"u2","itens":[]}');
  arm.setItem('manual10.historico.v1:visitante', '{"dono":null,"itens":[]}');
  await Manual.conta.iniciar({ cliente: f, armazenamento: arm });
  await Manual.conta.entrar('a@b.pt', 'x');
  await Manual.conta.sair();
  assert.ok(arm.getItem('manual10.historico.v1:u1'));
  await Manual.conta.entrar('a@b.pt', 'x');
  await Manual.conta.apagarConta();
  assert.equal(arm.getItem('manual10.historico.v1:u1'), null);
  assert.ok(arm.getItem('manual10.historico.v1:u2'));
  assert.ok(arm.getItem('manual10.historico.v1:visitante'));
});
