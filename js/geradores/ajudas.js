globalThis.Manual = globalThis.Manual || {};
Manual.geradores = Manual.geradores || {};

// Ajudas comuns aos geradores (sem DOM; aleatoriedade só através do rng recebido).
Manual.geradores.ajudas = (function () {
  const arred = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const igual = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);
  const normalizar = (t) => String(t).replace(/\s+/g, ' ').trim();

  // Número formatado para texto (vírgula decimal, menos tipográfico). Sem casas: Manual.formatar.num (até 3).
  function fmt(n, casas) {
    if (casas === undefined) return Manual.formatar.num(n);
    const f = Math.pow(10, casas);
    return (arred(Math.round(n * f) / f) + 0).toLocaleString('pt-PT', { maximumFractionDigits: casas }).replace(/-/g, '−');
  }

  // Valor em {min, min + passo, …} ≤ max, uniforme.
  function entre(rng, min, max, passo = 1) {
    const n = Math.floor(arred((max - min) / passo));
    return arred(min + passo * Manual.aleatorio.inteiro(rng, 0, n));
  }

  // Repete gerar(rng) até obter um valor fora de proibidos.
  function diferenteDe(rng, gerar, proibidos) {
    for (let i = 0; i < 1000; i++) {
      const v = gerar(rng);
      if (!proibidos.some((p) => igual(p, v))) return v;
    }
    throw new Error('diferenteDe: sem valor permitido após 1000 tentativas');
  }

  // Escolha múltipla: certa (texto) + até n − 1 distratores, um por erro típico ({ codigo, texto, explicacao, valor? }),
  // pela ordem dada, descartando os que repetem a certa ou outro distrator. Se faltarem distratores devolve menos
  // opções: o gerador deve re-sortear.
  function escolhaDeErros(rng, certa, errosTipicos, n = 4) {
    const vistos = [normalizar(certa)];
    const escolhidos = [];
    for (const e of errosTipicos) {
      if (escolhidos.length >= n - 1) break;
      const t = normalizar(e.texto);
      if (vistos.includes(t)) continue;
      vistos.push(t);
      escolhidos.push(e);
    }
    const itens = Manual.aleatorio.baralhar(rng, [{ certa: true, texto: certa }].concat(escolhidos.map((e) => ({ erro: e, texto: e.texto }))));
    const opcoes = itens.map((i) => i.texto);
    const correta = itens.findIndex((i) => i.certa);
    const erros = [];
    itens.forEach((i, indice) => {
      if (i.certa) return;
      const e = Object.assign({}, i.erro, { opcao: indice });
      delete e.texto;
      erros.push(e);
    });
    return { opcoes, correta, errosTipicos: erros };
  }

  // Verdadeiro/falso: sorteia a afirmação certa ou a falsa; a falsa traz o erro típico correspondente.
  function vfDe(rng, afirmacaoCerta, afirmacaoFalsa, erroFalsa) {
    const verdadeira = rng() < 0.5;
    return verdadeira
      ? { enunciado: afirmacaoCerta, correta: true, errosTipicos: [] }
      : { enunciado: afirmacaoFalsa, correta: false, errosTipicos: [erroFalsa] };
  }

  return { fmt, entre, diferenteDe, escolhaDeErros, vfDe };
})();
