globalThis.Manual = globalThis.Manual || {};

(function () {
  const JANELA_TIPO = 4;
  const JANELA_SUBTEMA = 6;
  const SEGUIDAS_DOMINA = 3;

  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit',
  });

  function diaLisboa(dataIso) {
    return formato.format(new Date(dataIso));
  }

  function ordenar(lista) {
    return (lista || []).slice().sort((a, b) => {
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
    (tentativas || []).forEach((t) => {
      const chave = t.disciplina + '/' + t.tema + '/' + t.subtema;
      (grupos[chave] = grupos[chave] || []).push(t);
    });
    const saida = {};
    Object.keys(grupos).forEach((c) => { saida[c] = classificarSubtema(grupos[c]); });
    return saida;
  }

  Manual.aprendizagem = { diaLisboa, estadoTipo, classificarSubtema, classificarTudo };
})();
