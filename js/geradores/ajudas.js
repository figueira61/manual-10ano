globalThis.Manual = globalThis.Manual || {};
Manual.geradores = Manual.geradores || {};

// Ajudas comuns aos geradores (sem DOM; aleatoriedade só através do rng recebido).
Manual.geradores.ajudas = (function () {
  const arred = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const igual = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);

  // Número formatado para texto (vírgula decimal, menos tipográfico). Sem casas: Manual.formatar.num (até 3).
  function fmt(n, casas) {
    if (casas === undefined) return Manual.formatar.num(n);
    const f = Math.pow(10, casas);
    return (arred(Math.round(n * f) / f) + 0).toLocaleString('pt-PT', { maximumFractionDigits: casas }).replace(/-/g, '−');
  }

  // Número para dentro de uma fórmula LaTeX: menos "-", decimal "{,}", milhares "\," (como o pt-PT: a partir de 5 algarismos).
  function tex(n, casas = 3) {
    const f = Math.pow(10, casas);
    const v = arred(Math.round(n * f) / f) + 0;
    const [inteira, resto] = Math.abs(v).toFixed(casas).split('.');
    const decimal = (resto || '').replace(/0+$/, '');
    const agrupada = inteira.length >= 5 ? inteira.replace(/\B(?=(\d{3})+$)/g, '\\,') : inteira;
    return (v < 0 ? '-' : '') + agrupada + (decimal ? '{,}' + decimal : '');
  }

  // Chave canónica de uma opção, para detetar opções iguais escritas de formas diferentes
  // ("$-1{,}5$", "−1,5", "-1.5" → mesmo número).
  function chave(texto) {
    const t = String(texto)
      .replace(/\$/g, '')
      .replace(/\\,/g, '')
      .replace(/\{,\}/g, ',')
      .replace(/\s+/g, '')
      .replace(/−/g, '-')
      .replace(/\./g, ',');
    if (/^[-+]?\d+(,\d+)?$/.test(t)) return 'n:' + arred(Number(t.replace(',', '.')));
    return 't:' + t;
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

  // Escolha múltipla: certa (texto) + n − 1 distratores, um por erro típico ({ codigo, texto, explicacao, valor? }),
  // pela ordem dada, descartando os que repetem (chave canónica) a certa ou outro distrator.
  // Lança se não houver n opções distintas: o gerador deve dar distratores suficientes ou re-sortear.
  function escolhaDeErros(rng, certa, errosTipicos, n = 4) {
    const vistos = [chave(certa)];
    const escolhidos = [];
    for (const e of errosTipicos) {
      if (escolhidos.length >= n - 1) break;
      const k = chave(e.texto);
      if (vistos.includes(k)) continue;
      vistos.push(k);
      escolhidos.push(e);
    }
    if (escolhidos.length < n - 1) {
      throw new Error('escolhaDeErros: só ' + (escolhidos.length + 1) + ' opções distintas de ' + n);
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

  return { fmt, tex, chave, entre, diferenteDe, escolhaDeErros, vfDe };
})();
