globalThis.Manual = globalThis.Manual || {};

(function () {
  const JANELA_TIPO = 4;
  const JANELA_SUBTEMA = 6;
  const SEGUIDAS_DOMINA = 3;

  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
  });

  const INTERVALOS = [1, 3, 7, 14, 30];
  const PRIORIDADE = { nao_resolvido: 0, dificuldade: 1, domina: 2 };

  function diaLisboa(dataIso) {
    if (dataIso == null || dataIso === '') return null;
    const d = new Date(dataIso);
    return Number.isNaN(d.getTime()) ? null : formato.format(d);
  }

  function valida(t) {
    return t !== null && typeof t === 'object' && Number.isFinite(Date.parse(t.criado_em));
  }

  function ordenar(lista) {
    return (Array.isArray(lista) ? lista : []).filter(valida).sort((a, b) => {
      const ta = Date.parse(a.criado_em), tb = Date.parse(b.criado_em);
      if (ta !== tb) return ta - tb;
      const ia = String(a.id), ib = String(b.id);
      return ia < ib ? -1 : ia > ib ? 1 : 0;
    });
  }

  function estadoTipo(tentativasDoTipo) {
    const janela = ordenar(tentativasDoTipo).slice(-JANELA_TIPO);
    if (janela.length < 2) return null;
    const a = janela[janela.length - 2], b = janela[janela.length - 1];
    if (a.resultado !== 'errada' || b.resultado !== 'errada') return null;
    const sa = a.semente == null ? null : a.semente;
    const sb = b.semente == null ? null : b.semente;
    if (sa === null && sb === null) return a.id !== b.id ? 'nao_resolvido' : null;
    return sa !== sb ? 'nao_resolvido' : null;
  }

  function limpa(t) {
    return t.resultado === 'certa' && t.primeira_tentativa && !t.viu_resolucao && !t.usou_pista;
  }

  function classificarSubtema(tentativasDoSubtema) {
    const ordenadas = ordenar(tentativasDoSubtema);
    if (!ordenadas.length) return { estado: null, tipos: {} };
    const janela = ordenadas.slice(-JANELA_SUBTEMA);
    const presentes = new Set(janela.map((t) => t.tipo));
    const tipos = {};
    presentes.forEach((tipo) => {
      const e = estadoTipo(ordenadas.filter((t) => t.tipo === tipo));
      if (e) tipos[tipo] = e;
    });
    if (Object.keys(tipos).length) return { estado: 'nao_resolvido', tipos };
    const ultimas = janela.slice(-SEGUIDAS_DOMINA);
    if (ultimas.length === SEGUIDAS_DOMINA && ultimas.every(limpa)
      && new Set(ultimas.map((t) => diaLisboa(t.criado_em))).size >= 2) {
      return { estado: 'domina', tipos };
    }
    return { estado: 'dificuldade', tipos };
  }

  function classificarTudo(tentativas) {
    const grupos = {};
    (Array.isArray(tentativas) ? tentativas : []).filter(valida).forEach((t) => {
      const chave = t.disciplina + '/' + t.tema + '/' + t.subtema;
      (grupos[chave] = grupos[chave] || []).push(t);
    });
    const saida = {};
    Object.keys(grupos).forEach((c) => { saida[c] = classificarSubtema(grupos[c]); });
    return saida;
  }

  function somarDias(dia, n) {
    const [a, m, d] = dia.split('-').map(Number);
    return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
  }

  function proximaRevisao(intervaloAtual, tentativa, agora) {
    let intervalo;
    if (tentativa.resultado === 'errada') {
      intervalo = INTERVALOS[0];
    } else if (limpa(tentativa)) {
      const i = INTERVALOS.indexOf(intervaloAtual);
      intervalo = intervaloAtual == null || i < 0 ? INTERVALOS[0] : INTERVALOS[Math.min(i + 1, INTERVALOS.length - 1)];
    } else {
      intervalo = intervaloAtual == null || INTERVALOS.indexOf(intervaloAtual) < 0 ? INTERVALOS[0] : intervaloAtual;
    }
    return { intervalo_dias: intervalo, proxima_revisao: somarDias(diaLisboa(agora.toISOString()), intervalo) };
  }

  function proximoNivel(nivel, historicoNoNivel) {
    const h = Array.isArray(historicoNoNivel) ? historicoNoNivel : [];
    if (h[h.length - 1] === 'errada') return Math.max(0, nivel - 1);
    if (h.length >= 2 && h[h.length - 1] === 'certa' && h[h.length - 2] === 'certa') return Math.min(2, nivel + 1);
    return nivel;
  }

  function emRevisao(estados, agora) {
    const hoje = diaLisboa(agora.toISOString());
    return (Array.isArray(estados) ? estados : [])
      .filter((e) => e && e.proxima_revisao && e.proxima_revisao <= hoje)
      .sort((a, b) => {
        const pa = PRIORIDADE[a.estado] ?? 3, pb = PRIORIDADE[b.estado] ?? 3;
        if (pa !== pb) return pa - pb;
        return a.proxima_revisao < b.proxima_revisao ? -1 : a.proxima_revisao > b.proxima_revisao ? 1 : 0;
      })
      .map((e) => e.chave);
  }

  Manual.aprendizagem = {
    INTERVALOS, diaLisboa, estadoTipo, classificarSubtema, classificarTudo,
    proximaRevisao, proximoNivel, emRevisao,
  };
})();
