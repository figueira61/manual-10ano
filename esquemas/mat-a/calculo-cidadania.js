globalThis.Manual = globalThis.Manual || {};
Manual.calc = Manual.calc || {};

Manual.calc.cidadania = (function () {
  const EPS = 1e-9;

  // ilustrativo — não corresponde às tabelas oficiais
  const ESCALOES_IRS_ILUSTRATIVOS = [
    { ate: 8000, taxa: 0.13 },
    { ate: 20000, taxa: 0.2 },
    { ate: 40000, taxa: 0.3 },
    { ate: 80000, taxa: 0.4 },
    { ate: Infinity, taxa: 0.48 },
  ];

  // ilustrativo — não corresponde às tabelas oficiais
  const TABELA_RETENCAO_ILUSTRATIVA = [
    { ate: 900, taxa: 0 },
    { ate: 1200, taxa: 0.1 },
    { ate: 1800, taxa: 0.2 },
    { ate: 3000, taxa: 0.25 },
    { ate: Infinity, taxa: 0.3 },
  ];

  function indicesDoMaximo(valores) {
    const max = Math.max(...valores);
    return valores.reduce((a, v, i) => (v === max ? a.concat(i) : a), []);
  }

  function maioria(votos) {
    const total = votos.reduce((s, v) => s + v, 0);
    const limiarAbsoluta = Math.floor(total / 2) + 1;
    const topo = indicesDoMaximo(votos);
    const idx = votos.findIndex((v) => v >= limiarAbsoluta);
    return {
      total,
      limiarAbsoluta,
      simples: topo.length === 1 ? topo[0] : null,
      absoluta: idx === -1 ? null : idx,
    };
  }

  function borda(boletins, nCandidatos) {
    const pontos = new Array(nCandidatos).fill(0);
    for (const b of boletins) {
      b.ordem.forEach((cand, pos) => {
        pontos[cand] += (nCandidatos - pos) * b.quantidade;
      });
    }
    const topo = indicesDoMaximo(pontos);
    return { pontos, vencedor: topo.length === 1 ? topo[0] : null };
  }

  // Empate de quocientes: menos votos primeiro; se igual, menor índice.
  function distribuir(votos, mandatos, divisor) {
    const quocientes = votos.map((v) =>
      Array.from({ length: mandatos }, (_, k) => v / divisor(k)));
    const obtidos = new Array(votos.length).fill(0);
    const atribuicoes = [];
    for (let m = 0; m < mandatos; m++) {
      let melhor = -1;
      for (let p = 0; p < votos.length; p++) {
        if (melhor === -1) { melhor = p; continue; }
        const qa = quocientes[p][obtidos[p]];
        const qb = quocientes[melhor][obtidos[melhor]];
        if (qa > qb + EPS) melhor = p;
        else if (Math.abs(qa - qb) < EPS && votos[p] < votos[melhor]) melhor = p;
      }
      const k = obtidos[melhor];
      atribuicoes.push({ partido: melhor, divisor: divisor(k), quociente: quocientes[melhor][k] });
      obtidos[melhor] += 1;
    }
    return { mandatos: obtidos, quocientes, atribuicoes };
  }

  const hondt = (votos, mandatos) => distribuir(votos, mandatos, (k) => k + 1);
  const stLague = (votos, mandatos) => distribuir(votos, mandatos, (k) => 2 * k + 1);

  function jurosSimples(capital, taxaAnual, anos) {
    const juro = capital * taxaAnual * anos;
    return { juro, montante: capital + juro };
  }

  function jurosCompostos(capital, taxaAnual, anos, periodosPorAno) {
    const n = periodosPorAno;
    const montante = capital * Math.pow(1 + taxaAnual / n, n * anos);
    const total = Math.round(n * anos);
    const passos = [];
    for (let k = 1; k <= total; k++) {
      passos.push({ periodo: k, montante: capital * Math.pow(1 + taxaAnual / n, k) });
    }
    return { juro: montante - capital, montante, passos };
  }

  function irsAnual(rendimentoColetavel, escaloes) {
    const parcelas = [];
    let imposto = 0;
    let de = 0;
    for (const e of escaloes) {
      const base = Math.max(0, Math.min(rendimentoColetavel, e.ate) - de);
      const valor = base * e.taxa;
      parcelas.push({ de, ate: e.ate, base, taxa: e.taxa, valor });
      imposto += valor;
      de = e.ate;
      if (rendimentoColetavel <= e.ate) break;
    }
    return { imposto, parcelas };
  }

  function salario(brutoMensal, opcoes) {
    const { taxaSS = 0.11, tabelaRetencao = TABELA_RETENCAO_ILUSTRATIVA } = opcoes || {};
    const ss = brutoMensal * taxaSS;
    const escalao = tabelaRetencao.find((e) => brutoMensal <= e.ate)
      || tabelaRetencao[tabelaRetencao.length - 1];
    const taxaRetencao = escalao.taxa;
    const retencao = brutoMensal * taxaRetencao;
    return { bruto: brutoMensal, ss, taxaRetencao, retencao, liquido: brutoMensal - ss - retencao };
  }

  return {
    maioria, borda, hondt, stLague, jurosSimples, jurosCompostos, irsAnual, salario,
    ESCALOES_IRS_ILUSTRATIVOS, TABELA_RETENCAO_ILUSTRATIVA,
  };
})();
