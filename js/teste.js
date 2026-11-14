globalThis.Manual = globalThis.Manual || {};

// Teste: lógica pura (amostra estratificada por tema e nota 0–20). Sem DOM.
(function () {
  const Manual = globalThis.Manual;
  const TAMANHOS = [10, 15, 20];

  function subtemasDoTema(disciplina, tema) {
    const d = (Manual.indice || []).find(function (x) { return x && x.id === disciplina; });
    const t = d && (d.temas || []).find(function (x) { return x.id === tema; });
    return t ? (t.subtemas || []).map(function (s) { return s.id; }) : [];
  }

  function montarTeste(disciplina, temas, n, historico, rng) {
    const lista = Array.isArray(temas) ? temas : [];
    const hist = Array.isArray(historico) ? historico : [];
    const vistos = new Set(hist.filter(Boolean).map(function (t) { return t.tipo + ':' + t.semente; }));
    const todos = [];
    lista.forEach(function (tema) {
      subtemasDoTema(disciplina, tema).forEach(function (subtema) {
        Manual.miniquiz.candidatos(disciplina, subtema, [], rng).forEach(function (c) {
          if (!c.gerador || vistos.has(c.tipo + ':' + c.semente)) return;
          todos.push(Object.assign({}, c, { tema: tema, subtema: subtema }));
        });
      });
    });

    const perguntas = [];
    const usados = new Set();
    let escolhidos = Manual.selecao.estratificar(todos, lista, n, rng);
    const falhados = new Set();
    // Candidatos que falham a gerar são trocados por outro do mesmo tema, noutro tipo.
    for (let ronda = 0; ronda < 50 && escolhidos.length; ronda++) {
      const falharam = [];
      escolhidos.forEach(function (c) {
        const p = Manual.treino.materializar(c);
        usados.add(c.tipo);
        if (p) perguntas.push(Object.assign({}, p, { chave: disciplina + '/' + c.tema + '/' + c.subtema }));
        else { falhados.add(c.tipo); falharam.push(c.tema); }
      });
      escolhidos = [];
      falharam.forEach(function (tema) {
        const alt = todos.find(function (c) { return c.tema === tema && !usados.has(c.tipo) && !falhados.has(c.tipo); });
        if (alt) { usados.add(alt.tipo); escolhidos.push(alt); }
      });
    }
    return { perguntas: perguntas, pedidas: n };
  }

  function nota(certas, total) {
    if (!(total > 0)) return { valores: 0, percentagem: 0 };
    return { valores: Math.round(200 * certas / total) / 10, percentagem: Math.round(100 * certas / total) };
  }

  function temasARever(respostas) {
    const por = new Map();
    (Array.isArray(respostas) ? respostas : []).forEach(function (r) {
      if (!r || !r.pergunta || !r.pergunta.chave) return;
      const tema = String(r.pergunta.chave).split('/')[1];
      if (!tema) return;
      const e = por.get(tema) || { tema: tema, certas: 0, total: 0 };
      e.total++;
      if (r.resultado === 'certa') e.certas++;
      por.set(tema, e);
    });
    return Array.from(por.values())
      .filter(function (e) { return e.certas / e.total < 0.5; })
      .sort(function (a, b) { return a.certas / a.total - b.certas / b.total; });
  }

  Manual.teste = { TAMANHOS: TAMANHOS, montarTeste: montarTeste, nota: nota, temasARever: temasARever };
})();
