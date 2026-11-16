globalThis.Manual = globalThis.Manual || {};
Manual.geradores = Manual.geradores || {};

// Ajudas comuns aos geradores (sem DOM; aleatoriedade só através do rng recebido).
Manual.geradores.ajudas = (function () {
  const arred = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const igual = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);
  // Utilitários numéricos dos geradores: limpo apaga o ruído de vírgula flutuante (e o −0), proximo compara números
  // com tolerância 1e-9, r2 arredonda às centésimas (com um empurrão de 1e-7 para os casos a meio, p. ex. 2,675).
  const limpo = arred;
  const proximo = (a, b) => Math.abs(a - b) < 1e-9;
  const r2 = (v) => Math.round(v * 100 + (v >= 0 ? 1e-7 : -1e-7)) / 100 + 0;

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

  // Repete construir() até devolver um exercício (null = re-sortear; escolhaDeErros sem opções também re-sorteia).
  // tema: prefixo da mensagem de erro (p. ex. 'cidadania').
  function tentar(construir, tema) {
    for (let i = 0; i < 500; i++) {
      try {
        const r = construir();
        if (r) return r;
      } catch (err) {
        if (!/^escolhaDeErros/.test(err.message)) throw err;
      }
    }
    throw new Error(tema + ': sem parâmetros válidos ao fim de 500 tentativas');
  }

  // Tolerância absoluta de meia unidade do último algarismo significativo de valor arredondado a `as` algarismos
  // (p. ex. tolMeiaUnidade(0.5, 2) = 0,005 e tolMeiaUnidade(1234, 2) = 50).
  function tolMeiaUnidade(valor, as) {
    if (!Number.isFinite(valor) || valor === 0) throw new Error('tolMeiaUnidade: valor inválido');
    const expoente = Math.floor(Math.log10(Math.abs(Number(valor.toPrecision(as)))));
    return Number((0.5 * Math.pow(10, expoente - as + 1)).toPrecision(12));
  }

  // Tolerância absoluta efetiva de uma resposta: a maior entre a absoluta e a relativa (quando existem).
  function tolEfetiva(resposta, tol, rel) {
    return Math.max(tol === undefined ? 0 : tol, rel === undefined ? 0 : rel * Math.abs(resposta));
  }

  // Folga das comparações numéricas: 1e-9, ou 1e-9 × |resposta| quando a resposta só tem tolerância relativa
  // (valores muito pequenos, p. ex. 3,98 × 10⁻¹⁹ J, em que 1e-9 absoluto tornaria tudo igual).
  function folga(resposta, tol, rel) {
    return tol === undefined && rel !== undefined ? 1e-9 * Math.abs(resposta) : 1e-9;
  }

  // Erros numéricos utilizáveis: valor finito, fora da tolerância da resposta e distinto dos anteriores.
  // tol é a tolerância absoluta (ou o resultado de tolEfetiva); eps é a folga (ajudas.folga, 1e-9 por omissão).
  // rel (só quando a resposta tem apenas tolerância relativa): dois erros são iguais se diferem menos de rel × o maior,
  // para que valores de ordens de grandeza diferentes (2 × 10⁻²² e 2 × 10⁻²⁸) não se tomem pelo mesmo.
  function filtrarErros(resposta, tol, lista, eps = 1e-9, rel) {
    const r = [];
    const iguais = (x, y) => (rel === undefined
      ? Math.abs(x - y) <= tol + eps
      : Math.abs(x - y) <= (rel + 1e-9) * Math.max(Math.abs(x), Math.abs(y)));
    for (const e of lista) {
      if (!e || typeof e.valor !== 'number' || !Number.isFinite(e.valor)) continue;
      if (Math.abs(e.valor - resposta) <= tol + eps) continue;
      if (r.some((x) => iguais(x.valor, e.valor))) continue;
      r.push(e);
    }
    return r;
  }

  // Fecha um exercício numérico ou de escolha múltipla (null = re-sortear: numérica sem erros típicos utilizáveis).
  // o: { resposta, tolerancia | toleranciaRelativa, algarismos?, unidade, texto(v), erros, verificacao: { passo, calculo, valor }, arredondamento? }
  function fechar(rng, formato, ex, o) {
    const soRel = o.tolerancia === undefined ? o.toleranciaRelativa : undefined;
    const erros = filtrarErros(o.resposta, tolEfetiva(o.resposta, o.tolerancia, o.toleranciaRelativa), o.erros, folga(o.resposta, o.tolerancia, o.toleranciaRelativa), soRel);
    if (formato === 'numerica') {
      if (!erros.length) return null;
      Object.assign(ex, { resposta: o.resposta, unidade: o.unidade, errosTipicos: erros, verificacao: o.verificacao });
      if (o.tolerancia !== undefined) ex.tolerancia = o.tolerancia;
      if (o.toleranciaRelativa !== undefined) ex.toleranciaRelativa = o.toleranciaRelativa;
      if (o.algarismos !== undefined) ex.algarismos = o.algarismos;
    } else {
      const e = escolhaDeErros(rng, o.texto(o.resposta), erros.map((x) => Object.assign({}, x, { texto: o.texto(x.valor) })));
      const alvo = chave(o.texto(o.verificacao.valor));
      Object.assign(ex, e, { verificacao: Object.assign({}, o.verificacao, { valor: e.opcoes.findIndex((t) => chave(t) === alvo) }) });
    }
    if (o.arredondamento) ex.arredondamento = o.arredondamento;
    return ex;
  }

  // Escolha múltipla com opções de texto (nomes, afirmações): certa + erros com texto próprio.
  // valorTexto: a opção a que chega a verificação (vira o índice em verificacao.valor).
  function fecharTexto(rng, ex, certa, erros, valorTexto) {
    const e = escolhaDeErros(rng, certa, erros);
    return Object.assign(ex, e, { verificacao: Object.assign({}, ex.verificacao, { valor: e.opcoes.findIndex((t) => chave(t) === chave(valorTexto)) }) });
  }

  // Confere a resposta de um exercício numérico/escolha com o valor obtido por outro método.
  function confere(p, valor, texto) {
    if (p.formato === 'numerica') return Math.abs(p.resposta - valor) <= tolEfetiva(p.resposta, p.tolerancia, p.toleranciaRelativa) + folga(p.resposta, p.tolerancia, p.toleranciaRelativa);
    return chave(p.opcoes[p.correta]) === chave(texto(valor));
  }

  // ---------------------------------------------------------------- frações e coeficientes em LaTeX
  // v = n/d com d ≥ 1 mínimo (null se não houver d ≤ 1000).
  function fracao(v) {
    if (!Number.isFinite(v)) return null;
    for (let d = 1; d <= 1000; d++) {
      const n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-7) return { n: Math.round(n) + 0, d };
    }
    return null;
  }
  // Número racional para LaTeX: inteiro ou \dfrac{n}{d}.
  function texQ(v) {
    const f = fracao(arred(v));
    if (!f) throw new Error('texQ: valor não racional ' + v);
    if (f.d === 1) return tex(f.n);
    return (f.n < 0 ? '-' : '') + '\\dfrac{' + tex(Math.abs(f.n)) + '}{' + tex(f.d) + '}';
  }
  // Coeficiente vezes variável, sem o 1: cx(1, 'x') = 'x', cx(-1, 'x^2') = '-x^2', cx(3, 'x') = '3x'.
  const cx = (k, v) => (k === 1 ? v : k === -1 ? '-' + v : texQ(k) + v);
  // Produto k × X, com −X quando k = −1 e X quando k = 1.
  const vezesTex = (k, X) => (k === 1 ? X : k === -1 ? '-' + X : texQ(k) + ' \\times ' + X);
  // Igualdades encadeadas sem membros vazios nem repetidos seguidos: cadeia('a', 'b', 'b') = 'a = b'.
  const cadeia = (...ps) => ps.filter((x, i, l) => x !== '' && (i === 0 || x !== l[i - 1])).join(' = ');
  // n/d = resultado, sem «= …» repetido nem divisão por 1.
  function divTex(n, d) {
    const r = texQ(arred(n / d));
    if (d === 1) return r;
    const q = '\\dfrac{' + texQ(n) + '}{' + texQ(d) + '}';
    return q === r ? r : q + ' = ' + r;
  }

  // ---------------------------------------------------------------- pontos (uma só notação por item)
  // Os pontos (e vetores) escrevem-se com um separador provisório; notacaoPontos escolhe a notação do item inteiro:
  // (a; b) ou (a; b; c) se algum ponto do item tem uma coordenada não inteira, (a, b) ou (a, b, c) caso contrário.
  const SEP = '§';
  const texPonto = (P) => '(' + P.map((v) => tex(v)).join(SEP) + ')';
  function notacaoPontos(ex) {
    const textos = [];
    (function recolher(v) {
      if (typeof v === 'string') textos.push(v);
      else if (Array.isArray(v)) v.forEach(recolher);
      else if (v && typeof v === 'object') Object.keys(v).forEach((k) => recolher(v[k]));
    })(ex);
    const decimal = textos.some((t) => (t.match(/\([^()§]*(?:§[^()§]*)+\)/g) || []).some((p) => p.includes('{,}')));
    const sep = decimal ? ';\\ ' : ', ';
    return (function trocar(v) {
      if (typeof v === 'string') return v.split(SEP).join(sep);
      if (Array.isArray(v)) return v.map(trocar);
      if (v && typeof v === 'object') {
        const o = {};
        Object.keys(v).forEach((k) => { o[k] = trocar(v[k]); });
        return o;
      }
      return v;
    })(ex);
  }
  // Leitura de "$(a, b)$", "$(a;\ b)$", "$(a, b, c)$"… → [a, b, …] (null se não for um ponto).
  function lerPonto(t) {
    const s = String(t).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/\\ /g, '').replace(/\s/g, '');
    const m = s.match(/^\((-?[\d.]+(?:[,;]-?[\d.]+)+)\)$/);
    return m ? m[1].split(/[,;]/).map(Number) : null;
  }

  return {
    fmt, tex, tolMeiaUnidade, tolEfetiva, folga, chave, entre, diferenteDe, escolhaDeErros, vfDe, tentar, filtrarErros, fechar, fecharTexto, confere,
    fracao, texQ, cx, vezesTex, cadeia, divTex, SEP, texPonto, notacaoPontos, lerPonto, limpo, proximo, r2,
  };
})();
