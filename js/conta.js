globalThis.Manual = globalThis.Manual || {};

// Adaptador de contas (Supabase). É o único ficheiro, além de config.js, que conhece o Supabase.
// Sem cliente (biblioteca ausente ou modo de testes) tudo funciona só com a fila local.
(function () {
  const Manual = globalThis.Manual;

  let cliente = null;
  let fila = Manual.criarFila(null);
  let sessao = null;
  let perfil = null;
  let papel = null;
  const ouvintes = new Set();
  let emCurso = null;
  let ligadoOnline = false;
  let armazenamento = null;
  let quarentena = Manual.criarQuarentena(null);

  const PAGINA = 1000; // limite de linhas por resposta do PostgREST
  const CHAVE_ULTIMO_PAPEL = 'manual10.ultimo_papel';

  // Erro que não se resolve a repetir o mesmo pedido: 4xx (exceto 401/408/429) ou
  // dados inválidos/violação de restrição do Postgres (classes 22 e 23).
  function erroPermanente(estadoHttp, codigoPg) {
    if (/^2[23][0-9A-Z]{3}$/.test(String(codigoPg || ''))) return true;
    const s = Number(estadoHttp);
    return s >= 400 && s < 500 && s !== 401 && s !== 408 && s !== 429;
  }

  // Decide se uma resposta ao quiz é registada: nunca numa conta de encarregado e, enquanto o
  // papel não é conhecido, também não se a última conta deste dispositivo era de encarregado.
  function podeRegistar(papelAtual, ultimoPapel) {
    if (papelAtual) return papelAtual === 'aluna';
    return ultimoPapel !== 'encarregado';
  }

  function lerUltimoPapel() {
    try {
      return armazenamento ? armazenamento.getItem(CHAVE_ULTIMO_PAPEL) : null;
    } catch (e) {
      return null;
    }
  }

  function guardarUltimoPapel(p) {
    try {
      if (armazenamento && p) armazenamento.setItem(CHAVE_ULTIMO_PAPEL, p);
    } catch (e) {
      // sem armazenamento: só vale para esta sessão
    }
  }

  function erro(codigo, causa) {
    const e = new Error(codigo + (causa && causa.message ? ': ' + causa.message : ''));
    e.codigo = codigo;
    if (causa) e.causa = causa;
    return e;
  }

  // Traduz o erro do supabase-js (ou do fetch) num Error com `codigo`.
  function traduzir(causa) {
    if (causa && causa.codigo) return causa;
    const texto = String((causa && causa.message) || causa || '').toLowerCase();
    const cod = String((causa && causa.code) || '').toLowerCase();
    const estado = causa && causa.status;
    if (estado === 429 || cod.includes('rate_limit') || texto.includes('rate limit') || texto.includes('too many requests')) {
      return erro('demasiados_pedidos', causa);
    }
    if (cod === 'user_already_exists' || cod === 'email_exists' || texto.includes('already registered') || texto.includes('already been registered')) {
      return erro('ja_registado', causa);
    }
    if (cod === 'weak_password' || texto.includes('weak password') || texto.includes('at least 6 characters') || texto.includes('password should be')) {
      return erro('palavra_passe_fraca', causa);
    }
    if (texto.includes('invalid login credentials')) return erro('credenciais', causa);
    if (texto.includes('email not confirmed')) return erro('email_por_confirmar', causa);
    if (texto.includes('codigo_invalido')) return erro('codigo_invalido', causa);
    if (texto.includes('papel_invalido')) return erro('papel_invalido', causa);
    if (
      texto.includes('nao_autenticado') ||
      texto.includes('auth session missing') ||
      texto.includes('jwt expired')
    ) {
      return erro('sem_sessao', causa);
    }
    if (
      texto.includes('failed to fetch') ||
      texto.includes('networkerror') ||
      texto.includes('network request failed') ||
      texto.includes('load failed') ||
      texto.includes('fetch failed')
    ) {
      return erro('rede', causa);
    }
    return erro('desconhecido', causa);
  }

  // Executa uma operação do cliente e devolve `data`; qualquer falha vira Error com `codigo`.
  async function chamar(operacao) {
    let resposta;
    try {
      resposta = await operacao();
    } catch (causa) {
      throw traduzir(causa);
    }
    if (resposta && resposta.error) throw traduzir(resposta.error);
    return resposta ? resposta.data : null;
  }

  function exigirSessao() {
    if (!cliente || !sessao || !sessao.user) throw erro('sem_sessao');
    return sessao.user.id;
  }

  function notificar() {
    for (const fn of Array.from(ouvintes)) {
      try {
        fn(estado());
      } catch (e) {
        // um ouvinte com erro não impede os outros
      }
    }
  }

  async function carregarPerfil() {
    perfil = null;
    papel = null;
    if (!sessao || !sessao.user) return;
    const u = sessao.user; // capturado antes do await: sair() pode limpar a sessão entretanto
    const meta = u.user_metadata || {};
    try {
      const linhas = await chamar(() =>
        cliente.from('perfis').select('*').eq('id', u.id).limit(1)
      );
      if (!sessao || !sessao.user || sessao.user.id !== u.id) return;
      const p = Array.isArray(linhas) ? linhas[0] : null;
      if (p) {
        perfil = { id: p.id, nome: p.nome == null ? null : p.nome };
        papel = p.papel;
        return;
      }
    } catch (e) {
      // sem rede: usa os metadados do registo
    }
    if (!sessao || !sessao.user || sessao.user.id !== u.id) return;
    perfil = { id: u.id, nome: meta.nome == null ? null : meta.nome };
    papel = meta.papel || null;
  }

  async function definirSessao(nova) {
    sessao = nova || null;
    await carregarPerfil();
    guardarUltimoPapel(papel);
    notificar();
  }

  function estado() {
    return {
      autenticado: !!(sessao && sessao.user),
      papel: papel,
      perfil: perfil,
      modo: cliente ? 'online' : 'local',
    };
  }

  function aoMudar(fn) {
    ouvintes.add(fn);
    return function desligar() {
      ouvintes.delete(fn);
    };
  }

  function armazenamentoPadrao() {
    try {
      return globalThis.localStorage || null;
    } catch (e) {
      return null;
    }
  }

  function criarClientePadrao() {
    const lib = globalThis.supabase;
    const cfg = Manual.config;
    if (!lib || typeof lib.createClient !== 'function' || !cfg || !cfg.supabaseUrl) return null;
    try {
      return lib.createClient(cfg.supabaseUrl, cfg.supabaseChavePublica, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    } catch (e) {
      return null;
    }
  }

  async function iniciar(opcoes) {
    const o = opcoes || {};
    cliente = o.cliente || criarClientePadrao();
    armazenamento = o.armazenamento || armazenamentoPadrao();
    fila = Manual.criarFila(armazenamento);
    quarentena = Manual.criarQuarentena(armazenamento);
    sessao = null;
    perfil = null;
    papel = null;
    if (!cliente) {
      notificar();
      return estado();
    }
    try {
      cliente.auth.onAuthStateChange(function (evento, nova) {
        // Sem await dentro do callback (o supabase-js pode bloquear se se chamar a API aqui).
        const mudou = (nova && nova.user && nova.user.id) !== (sessao && sessao.user && sessao.user.id);
        if (!mudou && evento !== 'SIGNED_OUT') return;
        Promise.resolve()
          .then(() => definirSessao(nova))
          .then(() => (nova ? sincronizar() : null))
          .catch(() => {});
      });
    } catch (e) {
      // sem subscrição: o estado atualiza-se nas chamadas explícitas
    }
    if (!ligadoOnline && typeof globalThis.addEventListener === 'function') {
      ligadoOnline = true;
      globalThis.addEventListener('online', function () {
        sincronizar();
      });
    }
    try {
      const dados = await chamar(() => cliente.auth.getSession());
      await definirSessao(dados && dados.session);
    } catch (e) {
      notificar();
    }
    await sincronizar();
    return estado();
  }

  async function registar(email, palavraPasse, papelPedido, nome) {
    if (!cliente) throw erro('rede');
    const dados = await chamar(() =>
      cliente.auth.signUp({
        email: email,
        password: palavraPasse,
        options: { data: { papel: papelPedido, nome: nome } },
      })
    );
    const nova = dados && dados.session;
    if (nova) {
      await definirSessao(nova);
      await sincronizar();
    }
    return { precisaConfirmar: !nova };
  }

  async function entrar(email, palavraPasse) {
    if (!cliente) throw erro('rede');
    const dados = await chamar(() =>
      cliente.auth.signInWithPassword({ email: email, password: palavraPasse })
    );
    await definirSessao(dados && dados.session);
    await sincronizar();
    return estado();
  }

  // Chave usada pelo supabase-js: sb-<ref do projeto>-auth-token (ref = subdomínio do URL).
  function removerSessaoGuardada() {
    try {
      const ref = new URL(Manual.config.supabaseUrl).hostname.split('.')[0];
      if (armazenamento) armazenamento.removeItem('sb-' + ref + '-auth-token');
    } catch (e) {
      // armazenamento indisponível: nada a remover
    }
  }

  async function sair() {
    // Limpa sempre o estado local e resolve mesmo offline. No supabase-js 2.x, se o pedido de
    // logout falha por rede, signOut devolve/lança o erro ANTES de apagar a sessão guardada;
    // por isso, nesse caso removemos nós a chave da sessão, para não voltar a entrar ao recarregar.
    if (cliente) {
      let falhou = false;
      try {
        const r = await cliente.auth.signOut();
        falhou = !!(r && r.error);
      } catch (e) {
        falhou = true;
      }
      if (falhou) {
        // Sem isto, o cliente em memória podia renovar o token e voltar a guardar a sessão.
        try {
          if (typeof cliente.auth.stopAutoRefresh === 'function') await cliente.auth.stopAutoRefresh();
        } catch (e) {
          // continua: o importante é remover a sessão guardada
        }
        removerSessaoGuardada();
      }
    }
    await definirSessao(null);
  }

  // Completa e guarda uma tentativa na fila; tenta enviar. Nunca lança por falta de rede.
  async function guardarTentativa(t) {
    const item = Object.assign({}, t);
    if (!item.id) item.id = Manual.uuid();
    if (!item.criado_em) item.criado_em = new Date().toISOString();
    if (!item.aluna_id && sessao && sessao.user) item.aluna_id = sessao.user.id;
    fila.juntar(item, sessao && sessao.user ? sessao.user.id : null);
    await sincronizar();
    return item;
  }

  // upsert das linhas; um erro devolvido pelo servidor leva `permanente` (ver erroPermanente).
  async function inserirTentativas(linhas) {
    let r;
    try {
      r = await cliente.from('tentativas').upsert(linhas, { onConflict: 'id', ignoreDuplicates: true });
    } catch (causa) {
      throw traduzir(causa);
    }
    if (r && r.error) {
      const e = traduzir(r.error);
      e.permanente = erroPermanente(r.status, r.error.code);
      throw e;
    }
  }

  // Lote recusado de forma permanente: reenvia item a item; os que voltam a ser recusados
  // saem da fila para a quarentena. Um erro de rede a meio deixa o resto na fila.
  async function enviarUmAUm(linhas) {
    const aceites = [];
    for (const linha of linhas) {
      try {
        await inserirTentativas([linha]);
        aceites.push(linha.id);
      } catch (e) {
        if (!e.permanente) break;
        quarentena.juntar(Object.assign({}, linha, {
          motivo: String(e.message || '').slice(0, 200),
          em_quarentena_desde: new Date().toISOString(),
        }));
        fila.marcarEnviados([linha.id]);
      }
    }
    return aceites;
  }

  // Só envia itens desta conta (ou sem dono, que passam a ser dela); os outros ficam pendentes.
  async function enviarLote(lote) {
    const uid = sessao.user.id;
    // Só uma conta de aluna envia (e reclama itens de visitante); um encarregado nunca.
    if (papel !== 'aluna') return [];
    const meus = lote.filter((i) => !i.aluna_id || i.aluna_id === uid);
    if (meus.length === 0) return [];
    // Itens de visitante passam a ser desta conta; gravar já na fila impede reatribuição posterior.
    meus.forEach((i) => {
      if (!i.aluna_id) fila.atualizar(i.id, { aluna_id: uid });
    });
    const linhas = meus.map((i) => Object.assign({}, i, { aluna_id: uid }));
    try {
      await inserirTentativas(linhas);
    } catch (e) {
      if (!e.permanente) throw e; // rede/5xx: tudo fica na fila
      return enviarUmAUm(linhas);
    }
    return meus.map((i) => i.id);
  }

  function sincronizar() {
    if (!cliente || !sessao || !sessao.user) {
      return Promise.resolve({ enviados: 0, restantes: fila.tamanho() });
    }
    if (!emCurso) {
      emCurso = Manual.enviarFila(fila, enviarLote)
        .catch(() => ({ enviados: 0, restantes: fila.tamanho() }))
        .then((r) => {
          emCurso = null;
          return r;
        });
    }
    return emCurso;
  }

  // O PostgREST devolve no máximo 1000 linhas por pedido: pede páginas até vir uma curta.
  // `construir()` cria a consulta (com ordem total, para as páginas não se sobreporem).
  async function todasAsPaginas(construir) {
    const todas = [];
    for (let inicio = 0; ; inicio += PAGINA) {
      const pagina = (await chamar(() => construir().range(inicio, inicio + PAGINA - 1))) || [];
      todas.push(...pagina);
      if (pagina.length < PAGINA) return todas;
    }
  }

  async function tentativas(opcoes) {
    exigirSessao();
    const o = opcoes || {};
    return todasAsPaginas(function () {
      let q = cliente.from('tentativas').select('*');
      if (o.alunaId) q = q.eq('aluna_id', o.alunaId);
      if (o.desde) q = q.gte('criado_em', o.desde);
      return q.order('criado_em', { ascending: true }).order('id', { ascending: true });
    });
  }

  async function estados(alunaId) {
    exigirSessao();
    return todasAsPaginas(function () {
      let q = cliente.from('estados').select('*');
      if (alunaId) q = q.eq('aluna_id', alunaId);
      return q.order('aluna_id', { ascending: true }).order('chave', { ascending: true });
    });
  }

  async function guardarEstado(e) {
    const uid = exigirSessao();
    const linha = Object.assign({}, e, { aluna_id: uid });
    await chamar(() => cliente.from('estados').upsert(linha, { onConflict: 'aluna_id,chave' }));
    return linha;
  }

  async function gerarCodigoLigacao() {
    exigirSessao();
    return chamar(() => cliente.rpc('gerar_codigo_ligacao'));
  }

  async function ligarEncarregado(codigo) {
    exigirSessao();
    return chamar(() => cliente.rpc('usar_codigo_ligacao', { codigo: codigo }));
  }

  // Ligações da conta, cada uma com `nome` da outra parte (o encarregado, para a aluna;
  // a educanda, para o encarregado). Sem nome visível, `nome` fica null.
  async function ligacoes() {
    const uid = exigirSessao();
    const linhas = (await chamar(() => cliente.from('ligacoes').select('*'))) || [];
    const outra = (l) => (l.aluna_id === uid ? l.encarregado_id : l.aluna_id);
    const ids = [...new Set(linhas.map(outra))];
    const nomes = new Map();
    if (ids.length) {
      const perfis = (await chamar(() => cliente.from('perfis').select('id, nome').in('id', ids))) || [];
      perfis.forEach((p) => nomes.set(p.id, p.nome == null ? null : p.nome));
    }
    return linhas.map((l) => Object.assign({}, l, { nome: nomes.has(outra(l)) ? nomes.get(outra(l)) : null }));
  }

  async function revogarLigacao(id) {
    exigirSessao();
    await chamar(() => cliente.from('ligacoes').delete().eq('id', id));
  }

  async function exportar() {
    const uid = exigirSessao();
    const linhas = await chamar(() => cliente.from('perfis').select('*').eq('id', uid).limit(1));
    // Filtra pelo próprio id: um encarregado exporta só os seus dados, não os da educanda.
    return {
      perfil: (Array.isArray(linhas) && linhas[0]) || null,
      tentativas: await tentativas({ alunaId: uid }),
      estados: await estados(uid),
      ligacoes: await ligacoes(),
    };
  }

  async function apagarConta() {
    const uid = exigirSessao();
    await chamar(() => cliente.rpc('apagar_conta'));
    // Limpa desta máquina os itens pendentes da conta apagada e os de visitante.
    try {
      const meus = fila.pendentes().filter((i) => !i.aluna_id || i.aluna_id === uid).map((i) => i.id);
      if (meus.length) fila.marcarEnviados(meus);
    } catch (e) {
      // a fila nunca impede o apagamento
    }
    // Histórico local do motor adaptativo desta conta (ver js/motor.js).
    try {
      if (armazenamento) armazenamento.removeItem('manual10.historico.v1:' + uid);
    } catch (e) {
      // armazenamento indisponível: nada a remover
    }
    try {
      await cliente.auth.signOut();
    } catch (e) {
      // a conta já não existe; a sessão local expira sozinha
    }
    await definirSessao(null);
  }

  Manual.conta = {
    iniciar: iniciar,
    estado: estado,
    aoMudar: aoMudar,
    registar: registar,
    entrar: entrar,
    sair: sair,
    guardarTentativa: guardarTentativa,
    sincronizar: sincronizar,
    tentativas: tentativas,
    estados: estados,
    guardarEstado: guardarEstado,
    gerarCodigoLigacao: gerarCodigoLigacao,
    ligarEncarregado: ligarEncarregado,
    ligacoes: ligacoes,
    revogarLigacao: revogarLigacao,
    exportar: exportar,
    apagarConta: apagarConta,
    erroPermanente: erroPermanente,
    podeRegistar: podeRegistar,
    // Verdadeiro se as respostas desta sessão devem ser registadas (ver podeRegistar).
    registaTentativas: function () {
      return podeRegistar(papel, lerUltimoPapel());
    },
    // Verdadeiro se o dispositivo deixou de guardar a fila (as respostas vivem só em memória).
    armazenamentoFalhou: function () {
      return fila.armazenamentoFalhou();
    },
  };
})();
