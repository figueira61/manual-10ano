globalThis.Manual = globalThis.Manual || {};

// Números dos geradores de Física (fisica-movimentos.js, fisica-eletricidade.js e fisica-termica.js): um só sítio
// para os algarismos significativos, a notação das opções (regra 14), os valores intermédios (regra 15), os dados
// do enunciado e o fecho dos itens numéricos. Carrega depois de ajudas.js e antes dos três ficheiros de Física.
// Manual.formatar só é lido dentro das funções (no Node carrega depois deste ficheiro).
//
// Cada ficheiro pede o seu conjunto com G.fisicaNumeros.criar(opcoes):
//   grandesEmCientifica — valores intermédios exatos a partir de 10⁵ em notação científica (eletricidade, térmica:
//                         energias em J da ordem de 10⁶); sem ela ficam escritos por extenso (movimentos: 178 200 J);
//   afastarNaEscolha    — também na escolha os erros ficam a mais de 10 tolerâncias da resposta (movimentos).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const { tex, fechar, confere } = A;

  const AS3 = ' Apresenta o resultado com três algarismos significativos.';
  const cient = (x, as) => Manual.formatar.cientifico(x, as);
  const aAS = (v, k) => Number(Number(v).toPrecision(k)) + 0;
  const exatoAS = (v, k) => Math.abs(aAS(v, k) - v) <= 1e-9 * Math.abs(v);
  // Valor a meio entre dois arredondamentos (…5 no 4.º algarismo): re-sortear, para não haver dúvida no arredondamento.
  function ambiguo(v, k) {
    const e = Math.floor(Math.log10(Math.abs(v)));
    const s = Math.abs(v) / Math.pow(10, e - k + 1);
    return Math.abs(s - Math.floor(s) - 0.5) < 1e-6;
  }
  // Menor número de algarismos significativos (até 3) que escreve v exatamente.
  const asMin = (v) => [1, 2, 3].find((k) => exatoAS(v, k)) || 3;
  // Valor em LaTeX: exato com os algarismos que tem; arredondado com 3 a.s.; notação científica se muito grande ou pequeno.
  function texN(v) {
    if (v === 0) return '0';
    const r = aAS(v, 3);
    const exato = exatoAS(v, 3);
    const a = Math.abs(r);
    if (a >= 1e4 || a < 1e-3) return cient(r, exato ? asMin(r) : 3);
    if (exato || a >= 100) return tex(r, 6);
    return (r < 0 ? '-' : '') + a.toPrecision(3).replace('.', '{,}');
  }
  // « = » se o valor mostrado é exato, « ≈ » se foi arredondado.
  const igual = (v) => (exatoAS(v, 3) ? ' = ' : ' \\approx ');
  // O mesmo para um resultado mostrado com a precisão da resposta (3 a.s.).
  const eqN = (v, ok = true) => (ok && exatoAS(v, 3) ? ' = ' : ' \\approx ') + texN(v);
  // Valores intermédios (regra 15): exatos quando têm até 4 casas decimais, senão com 4 a.s.
  // (folga absoluta de no máximo 1e-7, para que um valor grande como 78 026,666… não passe por exato)
  const ex4 = (v) => Math.abs(v - Math.round(v * 1e4) / 1e4) <= Math.min(1e-7, 1e-9 * Math.max(1, Math.abs(v)));
  // Dado do enunciado: $2,5\,kg$.
  const q = (v, u) => '$' + tex(v) + '\\,' + u + '$';
  // Número entre parênteses se for negativo (sem sinais duplos nas contas).
  const par = (v) => (v < 0 ? '(' + tex(v) + ')' : tex(v));
  const parN = (v) => (v < 0 ? '(' + texN(v) + ')' : texN(v));
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  // Fração em LaTeX, sem «/1» (com denominador 1 fica só o numerador).
  const sobre = (num, den) => (den === '1' ? num : '\\dfrac{' + num + '}{' + den + '}');

  // Texto de uma opção (regra 14): uma só notação por item, escolhida a partir das opções mostradas.
  // sci: todas em notação científica com 3 a.s.; senão todas em notação normal com 3 a.s.
  function texOp(v, sci) {
    if (sci) {
      // sempre com «× 10^e» (também 10^0), para todas as opções terem a mesma forma
      const [mant, e] = Math.abs(v).toExponential(2).split('e');
      return (v < 0 ? '-' : '') + mant.replace('.', '{,}') + ' \\times 10^{' + Number(e) + '}';
    }
    const r = aAS(v, 3);
    const a = Math.abs(r);
    if (a >= 1000) return tex(r, 0);
    return (r < 0 ? '-' : '') + a.toPrecision(3).replace('.', '{,}');
  }
  const precisaSci = (vals) => {
    const ab = vals.filter((x) => x !== 0).map(Math.abs);
    return Math.max(...ab) >= 1e4 || Math.min(...ab) < 1e-3;
  };
  const textoDe = (u, sci) => (v) => '$' + texOp(v, sci) + (u ? '\\,' + u : '') + '$';
  // Formatador das explicações: a mesma string da opção (sem unidade quando a explicação a dispensa).
  const vtDe = (sci) => (v, u) => '$' + texOp(v, sci) + (u ? '\\,' + u : '') + '$';
  // Explicação de um erro: função do formatador do item (ou texto fixo).
  const explicar = (e, f) => Object.assign({}, e, { explicacao: typeof e.explicacao === 'function' ? e.explicacao(f) : e.explicacao });
  // A mesma resposta, por outro caminho, comparada como o item a mostra (verificarIndependente).
  const confereN = (p, valor, u) => confere(p, aAS(valor, 3), textoDe(u, p.dados.sci));

  function criar({ grandesEmCientifica = false, afastarNaEscolha = false } = {}) {
    // exI: texI escreve v exatamente (com grandesEmCientifica, a partir de 10⁵ só se v tiver até 4 a.s.).
    const exI = (v) => ex4(v) && (!grandesEmCientifica || Math.abs(v) < 1e5 || exatoAS(v, 4));
    function texI(v) {
      if (ex4(v)) return grandesEmCientifica && Math.abs(v) >= 1e5 ? cient(v, [1, 2, 3, 4].find((k) => exatoAS(v, k)) || 4) : tex(v, 4);
      const a = Math.abs(v);
      if (a >= 1e5 || a < 1e-3) return cient(v, 4);
      if (a >= 1000) return tex(aAS(v, 4), 0);
      return (v < 0 ? '-' : '') + a.toPrecision(4).replace('.', '{,}');
    }
    // « = valor » ou « ≈ valor » de um resultado intermédio; ok = false quando algum operando já foi arredondado.
    const eqI = (v, ok = true) => (ok && exI(v) ? ' = ' : ' \\approx ') + texI(v);
    const parI = (v) => (v < 0 ? '(' + texI(v) + ')' : texI(v));

    // Fecha um item numérico (ou de escolha). Resposta exata quando tem até 3 a.s.; senão pede 3 a.s. (algarismos: 3).
    // Erros: arredondados a 3 a.s., e só os que ficam longe de 0 (um «0» escrito nunca é erro típico) e na escala da resposta.
    // o: { erros: [{ codigo, valor, explicacao(vt) }], unidade, u (LaTeX), verificacao(resposta) → { passo, calculo, valor },
    //      escala (fator máximo entre uma opção e a resposta; 10⁴ por omissão; a troca kWh ↔ J pede 10⁷) }.
    function fecharNum(rng, formato, ex, exato, o) {
      if (!Number.isFinite(exato) || exato === 0) return null;
      // Curto: exato com ≤ 3 a.s. e ≤ 3 casas decimais (o quiz, sem `algarismos`, mostra até 3 casas).
      const curto = exatoAS(exato, 3) && Math.abs(Number(exato.toFixed(3)) - exato) <= 1e-12;
      if (!curto && ambiguo(exato, 3)) return null;
      const resposta = aAS(exato, 3);
      const tol = A.tolMeiaUnidade(resposta, 3);
      const relativa = Math.abs(resposta) >= 1e4 || Math.abs(resposta) < 1e-3;
      const R = Math.abs(resposta);
      const esc = o.escala || 1e4;
      const candidatos = o.erros
        .filter((e) => e && Number.isFinite(e.valor))
        .map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }))
        .filter((e) => ((formato === 'escolha' && !afastarNaEscolha) || Math.abs(e.valor) > 10 * tol) && Math.abs(e.valor) > R / esc && Math.abs(e.valor) < R * esc);
      // As opções que vão ser mostradas (a certa e os primeiros erros distintos, com o mesmo filtro de `fechar`),
      // para escolher a notação do item.
      const filtrados = relativa ? A.filtrarErros(resposta, tol, candidatos, 1e-9 * R, tol / R) : A.filtrarErros(resposta, tol, candidatos);
      const mostrados = formato === 'escolha' ? filtrados.slice(0, 3) : filtrados;
      const sci = precisaSci([resposta].concat(mostrados.map((e) => e.valor)));
      const erros = candidatos.map((e) => explicar(e, vtDe(sci)));
      if (!curto && formato === 'numerica') ex.enunciado += AS3;
      ex.dados = Object.assign({}, ex.dados, { sci });
      const v = o.verificacao(resposta);
      const base = { resposta, unidade: o.unidade, texto: textoDe(o.u, sci), erros, verificacao: Object.assign({}, v, { valor: aAS(v.valor, 3) }) };
      if (!curto) base.algarismos = 3;
      if (relativa) base.toleranciaRelativa = tol / R; else base.tolerancia = tol;
      return fechar(rng, formato, ex, base);
    }

    return {
      AS3, cient, aAS, exatoAS, ambiguo, asMin, texN, igual, eqN, ex4, exI, texI, eqI, parI, q, par, parN, plural, sobre,
      texOp, precisaSci, textoDe, vtDe, explicar, fecharNum, confereN,
    };
  }

  G.fisicaNumeros = { criar };
})();
