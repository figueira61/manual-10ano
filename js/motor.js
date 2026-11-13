globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  // Histórico local por dono: <prefixo>:<id da conta> ou <prefixo>:visitante.
  // A chave antiga, sem sufixo, é migrada para a do dono que lá estava.
  const PREFIXO_HISTORICO = 'manual10.historico.v1';
  const MAXIMO = 500;
  const DIAS_REMOTAS = 90;
  const MAX_PENDENTES = 200;
  const ESPERA_RECARREGAR_MS = 60000;
  // Chave reservada em `tipos`: dia de Lisboa do último avanço do intervalo (a tabela não tem coluna).
  const ULTIMO_AVANCO = '_ultimo_avanco';

  function ehObjeto(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  function chaveHistorico(dono) {
    return PREFIXO_HISTORICO + ':' + (dono || 'visitante');
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

  function avancoDe(e) {
    return e && ehObjeto(e.tipos) && typeof e.tipos[ULTIMO_AVANCO] === 'string' ? e.tipos[ULTIMO_AVANCO] : null;
  }

  function comAvanco(tipos, dia) {
    const r = Object.assign({}, ehObjeto(tipos) ? tipos : {});
    delete r[ULTIMO_AVANCO];
    if (dia) r[ULTIMO_AVANCO] = dia;
    return r;
  }

  // Motor adaptativo: mantém o histórico recente de tentativas e o estado por subtema.
  // Nunca lança erro; se o armazenamento ou a conta falharem, trabalha em memória.
  Manual.criarMotor = function (opcoes) {
    const o = opcoes || {};
    const conta = o.conta;
    const armazenamento = o.armazenamento;
    const agora = typeof o.agora === 'function' ? o.agora : function () { return new Date(); };
    const A = Manual.aprendizagem;
    const ouvintes = new Set();
    let estados = {};
    let estadosDono; // dono a que `estados` pertence
    let geracao = 0;
    let carregadoPara; // dono cujos estados remotos foram lidos com sucesso
    let pendentes = []; // tentativas de alunas à espera dos estados remotos
    let memoria = { dono: null, itens: [] };
    let aCarregar = 0;
    let ultimoCarregar = -Infinity;

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

    function migrarChaveAntiga() {
      try {
        if (!armazenamento) return;
        const bruto = armazenamento.getItem(PREFIXO_HISTORICO);
        if (bruto == null) return;
        let lido = null;
        try { lido = JSON.parse(bruto); } catch (erro) { lido = null; }
        if (ehObjeto(lido) && Array.isArray(lido.itens)) {
          const dono = lido.dono || null;
          const atuais = analisar(armazenamento.getItem(chaveHistorico(dono)), dono);
          armazenamento.setItem(chaveHistorico(dono), JSON.stringify({ dono: dono, itens: junta(atuais, lido.itens) }));
        }
        if (typeof armazenamento.removeItem === 'function') armazenamento.removeItem(PREFIXO_HISTORICO);
      } catch (erro) {
        // fica para a próxima
      }
    }

    // Relê o armazenamento do dono (duas abas) e junta o que está em memória.
    function lerHistorico(dono) {
      if (memoria.dono !== dono) memoria = { dono: dono, itens: [] };
      let guardados = [];
      try {
        if (armazenamento) guardados = analisar(armazenamento.getItem(chaveHistorico(dono)), dono);
      } catch (erro) {
        guardados = [];
      }
      return junta(guardados, memoria.itens);
    }

    function guardarHistorico(dono, itens) {
      memoria = { dono: dono, itens: itens };
      try {
        if (armazenamento) armazenamento.setItem(chaveHistorico(dono), JSON.stringify({ dono: dono, itens: itens }));
      } catch (erro) {
        // fica em memória
      }
    }

    function notificar() {
      Array.from(ouvintes).forEach(function (fn) {
        try { fn(); } catch (erro) { /* um ouvinte com erro não afeta os outros */ }
      });
    }

    // Próxima revisão a partir do estado `base`: no máximo um avanço por dia de Lisboa.
    function revisao(base, t, agoraD) {
      const atual = base ? base.intervalo_dias : null;
      const ultimo = avancoDe(base);
      const r = A.proximaRevisao(atual, t, agoraD, ultimo);
      const avancou = A.INTERVALOS.indexOf(atual) >= 0 && r.intervalo_dias > atual;
      return {
        intervalo_dias: r.intervalo_dias,
        proxima_revisao: r.proxima_revisao,
        dia: avancou ? A.diaLisboa(agoraD.toISOString()) : ultimo,
      };
    }

    function guardar(e) {
      if (!e || !e.estado || !conta || typeof conta.guardarEstado !== 'function') return;
      try {
        const linha = Object.assign({}, e, { atualizado_em: agora().toISOString() });
        Promise.resolve(conta.guardarEstado(linha)).catch(function () {});
      } catch (erro) {
        // sem rede: o estado volta a calcular-se a partir das tentativas
      }
    }

    function registar(t) {
      try {
        if (!ehObjeto(t) || typeof t.id !== 'string') return;
        const info = infoConta();
        if (estadosDono !== info.dono) {
          estados = {};
          estadosDono = info.dono;
          pendentes = [];
          carregadoPara = undefined;
        }
        const existentes = lerHistorico(info.dono);
        if (existentes.some(function (i) { return i.id === t.id; })) return;
        const itens = junta(existentes, [t]);
        guardarHistorico(info.dono, itens);
        const chave = chaveDe(t);
        const c = A.classificarSubtema(itens.filter(function (i) { return chaveDe(i) === chave; }));
        if (!c.estado) return; // tentativa sem data válida: nada a calcular nem a guardar
        const agoraD = agora();
        const r = revisao(estados[chave] || null, t, agoraD);
        const novo = {
          chave: chave, estado: c.estado, tipos: comAvanco(c.tipos, r.dia),
          proxima_revisao: r.proxima_revisao, intervalo_dias: r.intervalo_dias,
        };
        estados[chave] = novo;
        if (info.aluna && carregadoPara !== info.dono) {
          // guarda-se depois de ler os estados remotos
          pendentes.push(t);
          if (pendentes.length > MAX_PENDENTES) pendentes.splice(0, pendentes.length - MAX_PENDENTES);
          if (!aCarregar && Number.isFinite(ultimoCarregar) && agoraD.getTime() - ultimoCarregar >= ESPERA_RECARREGAR_MS) {
            carregar();
          }
        } else if (info.aluna) {
          guardar(novo);
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
        estado: e.estado, tipos: comAvanco(e.tipos, null),
        proxima_revisao: e.proxima_revisao == null ? null : e.proxima_revisao,
        intervalo_dias: e.intervalo_dias == null ? null : e.intervalo_dias,
      };
    }

    async function carregar() {
      const minha = ++geracao;
      aCarregar += 1;
      try {
        ultimoCarregar = agora().getTime();
        migrarChaveAntiga();
        const info = infoConta();
        let itens = lerHistorico(info.dono);
        let remotos = [];
        let remotosOk = false;
        if (info.aluna && conta) {
          try {
            const desde = new Date(agora().getTime() - DIAS_REMOTAS * 86400000).toISOString();
            const t = await conta.tentativas({ desde: desde, alunaId: info.dono });
            if (Array.isArray(t)) itens = junta(itens, t.filter(ehObjeto));
          } catch (erro) { /* só local */ }
          try {
            const e = await conta.estados(info.dono);
            if (Array.isArray(e)) {
              remotos = e.filter(function (x) { return ehObjeto(x) && x.chave; });
              remotosOk = true;
            }
          } catch (erro) { /* sem estados remotos: não se guarda nada até os ler */ }
        }
        if (minha !== geracao || infoConta().dono !== info.dono) return;
        // o que foi registado durante a espera não se perde
        itens = junta(lerHistorico(info.dono), itens);
        guardarHistorico(info.dono, itens);
        const mesmoDono = estadosDono === info.dono;
        const anteriores = mesmoDono ? estados : {};
        const novos = {};
        remotos.forEach(function (e) {
          novos[e.chave] = {
            chave: e.chave, estado: e.estado, tipos: ehObjeto(e.tipos) ? e.tipos : {},
            proxima_revisao: e.proxima_revisao, intervalo_dias: e.intervalo_dias,
          };
        });
        const calculados = A.classificarTudo(itens);
        Object.keys(calculados).forEach(function (chave) {
          const base = novos[chave] || (!remotosOk && anteriores[chave])
            || { chave: chave, tipos: {}, proxima_revisao: null, intervalo_dias: null };
          novos[chave] = Object.assign({}, base, {
            estado: calculados[chave].estado,
            tipos: comAvanco(calculados[chave].tipos, avancoDe(base)),
          });
        });
        const pend = mesmoDono ? pendentes : [];
        estados = novos;
        estadosDono = info.dono;
        if (!info.aluna) {
          pendentes = [];
        } else if (!remotosOk) {
          // fica tudo em espera; volta a tentar-se mais tarde (evento online ou próximo registo)
          pendentes = pend;
          if (!mesmoDono) carregadoPara = undefined;
        } else {
          carregadoPara = info.dono;
          pendentes = [];
          const agoraD = agora();
          pend.forEach(function (t) {
            const chave = chaveDe(t);
            const base = estados[chave];
            if (!base || !base.estado) return;
            const r = revisao(base, t, agoraD);
            estados[chave] = Object.assign({}, base, {
              tipos: comAvanco(base.tipos, r.dia),
              proxima_revisao: r.proxima_revisao, intervalo_dias: r.intervalo_dias,
            });
            guardar(estados[chave]);
          });
        }
      } catch (erro) {
        // mantém o que há
      } finally {
        aCarregar -= 1;
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
