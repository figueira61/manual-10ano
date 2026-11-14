globalThis.Manual = globalThis.Manual || {};

// Mini-quiz do subtema: mistura exercícios gerados (Manual.geradores) com o banco de perguntas,
// escolhidos por Manual.selecao.escolher a partir do histórico do motor. Sem DOM.
(function () {
  const Manual = globalThis.Manual;
  const MIN_GERADAS = 3;

  // Semente de 32 bits: do rng dado (determinístico nos testes) ou nova.
  function semente(rng) {
    return typeof rng === 'function' ? Math.floor(rng() * 4294967296) : Manual.aleatorio.novaSemente();
  }

  function geradoresDe(disciplina, subtema) {
    return Manual.geradores && typeof Manual.geradores.doSubtema === 'function'
      ? Manual.geradores.doSubtema(disciplina, subtema)
      : [];
  }

  function candidatos(disciplina, subtema, banco, rng) {
    const r = [];
    geradoresDe(disciplina, subtema).forEach(function (def) {
      def.formatos.forEach(function (formato) {
        Manual.geradores.contextosDe(def).forEach(function (contexto) {
          r.push({ tipo: def.id, competencia: def.tipo, formato: formato, contexto: contexto, semente: semente(rng), gerador: def.id });
        });
      });
    });
    (Array.isArray(banco) ? banco : []).forEach(function (p) {
      if (p && p.id) r.push({ tipo: p.id, competencia: p.id, formato: p.tipo, banco: p });
    });
    return r;
  }

  function materializar(c) {
    if (c.banco) return c.banco;
    try {
      return Manual.geradores.gerar(c.gerador, c.semente, { formato: c.formato, contexto: c.contexto });
    } catch (erro) {
      return null; // um gerador com problemas nunca impede o quiz
    }
  }

  function montarPerguntas(disciplina, subtema, banco, historico, opcoes) {
    const o = opcoes || {};
    const n = o.n === undefined ? 5 : o.n;
    const rng = o.rng;
    const cands = candidatos(disciplina, subtema, banco, rng);
    const hist = Array.isArray(historico) ? historico : [];
    const escolha = Manual.selecao.escolher(cands, hist, { n: n, rng: rng, ultimoErro: o.ultimoErro || undefined });

    const nGeradores = new Set(cands.filter(function (c) { return c.gerador; }).map(function (c) { return c.tipo; })).size;
    const minimo = nGeradores >= MIN_GERADAS ? Math.min(MIN_GERADAS, n) : 0;
    const geradas = escolha.filter(function (c) { return c.gerador; }).length;
    if (geradas < minimo) {
      const usados = new Set(escolha.map(function (c) { return c.tipo; }));
      const extra = Manual.selecao.escolher(
        cands.filter(function (c) { return c.gerador && !usados.has(c.tipo); }),
        hist, { n: minimo - geradas, rng: rng });
      // troca perguntas de banco, a começar pelo fim (a primeira pode ser a escolhida por ultimoErro)
      for (let i = escolha.length - 1; i >= 0 && extra.length; i--) {
        if (escolha[i].banco) escolha[i] = extra.shift();
      }
      extra.forEach(function (c) { if (escolha.length < n) escolha.push(c); });
    }
    return escolha.map(materializar).filter(Boolean);
  }

  // Competência e formato da última tentativa do subtema, quando foi errada num exercício gerado.
  // O contexto não é registado na tentativa: fica por saber (a seleção compara então só o formato).
  function ultimoErroDe(disciplina, subtema, historico) {
    const doSubtema = (Array.isArray(historico) ? historico : []).filter(function (t) {
      return t && t.disciplina === disciplina && t.subtema === subtema && Number.isFinite(Date.parse(t.criado_em));
    });
    if (!doSubtema.length) return null;
    const ultima = doSubtema.reduce(function (a, b) { return Date.parse(b.criado_em) >= Date.parse(a.criado_em) ? b : a; });
    if (ultima.resultado !== 'errada') return null;
    const def = Manual.geradores && Manual.geradores.obter(ultima.tipo);
    if (!def) return null;
    return { competencia: def.tipo, formato: ultima.formato };
  }

  Manual.miniquiz = { candidatos: candidatos, montarPerguntas: montarPerguntas, ultimoErroDe: ultimoErroDe };
})();
