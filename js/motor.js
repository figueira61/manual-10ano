globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  const CHAVE_HISTORICO = 'manual10.historico.v1';
  const MAXIMO = 500;
  const DIAS_REMOTAS = 90;

  function ehObjeto(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  function junta(a, b) {
    const vistos = new Set();
    const r = [];
    a.concat(b).forEach(function (i) {
      if (!ehObjeto(i) || typeof i.id !== 'string' || vistos.has(i.id)) return;
      vistos.add(i.id);
      r.push(i);
    });
    r.sort(function (x, y) {
      const tx = Date.parse(x.criado_em) || 0, ty = Date.parse(y.criado_em) || 0;
      if (tx !== ty) return tx - ty;
      return String(x.id) < String(y.id) ? -1 : 1;
    });
    return r.slice(-MAXIMO);
  }

  function chaveDe(t) {
    return t.disciplina + '/' + t.tema + '/' + t.subtema;
  }

  // Motor adaptativo: mantém o histórico recente de tentativas e o estado por subtema.
  // Nunca lança erro; se o armazenamento ou a conta falharem, trabalha em memória.
  Manual.criarMotor = function (opcoes) {
    const o = opcoes || {};
    const conta = o.conta;
    const armazenamento = o.armazenamento;
    const agora = typeof o.agora === 'function' ? o.agora : function () { return new Date(); };
    const ouvintes = new Set();
    let estados = {};
    let estadosDono; // dono a que `estados` pertence
    let geracao = 0;
    let carregadoPara; // dono cujos estados remotos já foram lidos
    let pendentes = []; // { t } de alunas à espera dos estados remotos
    let memoria = { dono: null, itens: [] };

    function infoConta() {
      try {
        const e = conta && conta.estado();
        return {
          aluna: !!e && e.papel === 'aluna',
          dono: e && e.perfil && e.perfil.id ? e.perfil.id : null,
        };
      } catch (erro) {
        return { aluna: false, dono: null };
      }
    }

    function analisar(bruto, dono) {
      try {
        const lido = JSON.parse(bruto);
        if (!ehObjeto(lido) || !Array.isArray(lido.itens) || (lido.dono || null) !== dono) return [];
        return lido.itens;
      } catch (erro) {
        return [];
      }
    }

    // Relê o armazenamento (duas abas) e junta o que está em memória.
    function lerHistorico(dono) {
      if (memoria.dono !== dono) memoria = { dono: dono, itens: [] };
      let guardados = [];
      try {
        if (armazenamento) guardados = analisar(armazenamento.getItem(CHAVE_HISTORICO), dono);
      } catch (erro) {
        guardados = [];
      }
      return junta(guardados, memoria.itens);
    }

    function guardarHistorico(dono, itens) {
      memoria = { dono: dono, itens: itens };
      try {
        if (armazenamento) armazenamento.setItem(CHAVE_HISTORICO, JSON.stringify({ dono: dono, itens: itens }));
      } catch (erro) {
        // fica em memória
      }
    }

    function notificar() {
      Array.from(ouvintes).forEach(function (fn) {
        try { fn(); } catch (erro) { /* um ouvinte com erro não afeta os outros */ }
      });
    }

    function registar(t) {
      try {
        if (!ehObjeto(t) || typeof t.id !== 'string') return;
        const info = infoConta();
        if (estadosDono !== info.dono) {
          estados = {};
          estadosDono = info.dono;
          pendentes = [];
        }
        const existentes = lerHistorico(info.dono);
        if (existentes.some(function (i) { return i.id === t.id; })) return;
        const itens = junta(existentes, [t]);
        guardarHistorico(info.dono, itens);
        const chave = chaveDe(t);
        const c = Manual.aprendizagem.classificarSubtema(itens.filter(function (i) { return chaveDe(i) === chave; }));
        const anterior = estados[chave] || null;
        const r = Manual.aprendizagem.proximaRevisao(anterior ? anterior.intervalo_dias : null, t, agora());
        const novo = {
          chave: chave, estado: c.estado, tipos: c.tipos,
          proxima_revisao: r.proxima_revisao, intervalo_dias: r.intervalo_dias,
        };
        estados[chave] = novo;
        if (info.aluna && carregadoPara !== info.dono) {
          pendentes.push(t); // guarda-se depois de ler os estados remotos
        } else if (info.aluna && conta && typeof conta.guardarEstado === 'function') {
          try {
            Promise.resolve(conta.guardarEstado(Object.assign({}, novo))).catch(function () {});
          } catch (erro) {
            // sem rede: o estado volta a calcular-se a partir das tentativas
          }
        }
        notificar();
      } catch (erro) {
        // nunca lança
      }
    }

    function estadoDe(chave) {
      const e = estados[chave];
      if (!e || !e.estado) return null;
      return {
        estado: e.estado, tipos: e.tipos || {},
        proxima_revisao: e.proxima_revisao == null ? null : e.proxima_revisao,
        intervalo_dias: e.intervalo_dias == null ? null : e.intervalo_dias,
      };
    }

    async function carregar() {
      const minha = ++geracao;
      try {
        const info = infoConta();
        let itens = lerHistorico(info.dono);
        let remotos = [];
        if (info.aluna && conta) {
          try {
            const desde = new Date(agora().getTime() - DIAS_REMOTAS * 86400000).toISOString();
            const t = await conta.tentativas({ desde: desde });
            if (Array.isArray(t)) itens = junta(itens, t.filter(ehObjeto));
          } catch (erro) { /* só local */ }
          try {
            const e = await conta.estados();
            if (Array.isArray(e)) remotos = e.filter(function (x) { return ehObjeto(x) && x.chave; });
          } catch (erro) { /* só local */ }
        }
        if (minha !== geracao || infoConta().dono !== info.dono) return;
        // o que foi registado durante a espera não se perde
        itens = junta(lerHistorico(info.dono), itens);
        guardarHistorico(info.dono, itens);
        const novos = {};
        remotos.forEach(function (e) {
          novos[e.chave] = {
            chave: e.chave, estado: e.estado, tipos: e.tipos || {},
            proxima_revisao: e.proxima_revisao, intervalo_dias: e.intervalo_dias,
          };
        });
        const calculados = Manual.aprendizagem.classificarTudo(itens);
        Object.keys(calculados).forEach(function (chave) {
          const base = novos[chave] || { chave: chave, proxima_revisao: null, intervalo_dias: null };
          novos[chave] = Object.assign({}, base, { estado: calculados[chave].estado, tipos: calculados[chave].tipos });
        });
        const pend = estadosDono === info.dono ? pendentes : [];
        estados = novos;
        estadosDono = info.dono;
        pendentes = [];
        if (info.aluna) carregadoPara = info.dono;
        pend.forEach(function (t) {
          const chave = chaveDe(t);
          const base = estados[chave];
          const r = Manual.aprendizagem.proximaRevisao(base.intervalo_dias, t, agora());
          estados[chave] = Object.assign({}, base, r);
          if (conta && typeof conta.guardarEstado === 'function') {
            try {
              Promise.resolve(conta.guardarEstado(Object.assign({}, estados[chave]))).catch(function () {});
            } catch (erro) { /* volta a calcular-se */ }
          }
        });
      } catch (erro) {
        // mantém o que há
      }
      notificar();
    }

    return {
      registar: registar,
      estadoDe: estadoDe,
      carregar: carregar,
      aoMudar: function (fn) {
        ouvintes.add(fn);
        return function () { ouvintes.delete(fn); };
      },
    };
  };
})();
