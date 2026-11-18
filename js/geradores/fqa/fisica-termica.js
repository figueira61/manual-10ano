globalThis.Manual = globalThis.Manual || {};

// Geradores de Física e Química A — Física, tema «Energia, fenómenos térmicos e radiação».
// Subtemas: transferencias, balancos, rendimento (ids <subtema>-<tipo>).
// Valores de referência (c, Δh) só de Manual.dadosFisica; cálculos de Manual.fisica (calor, calorFase, aquecimentoGelo,
// mistura, rendimento, painel, painelPotenciaMaxima). verificarIndependente e a verificação usam outro caminho.
// Os geradores qualitativos de transferências têm um corpus escrito à mão, cada situação com a sua verdade.
// Convenções: ΔU = W + Q + R, positivos quando o sistema recebe energia; Q de quem cede é negativo; rendimento ≤ 100 %.
// Manual.dadosFisica e Manual.fisica só são lidos dentro de gerar (carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const Fis = () => Manual.fisica;
  const D = () => Manual.dadosFisica;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const { tex, fechar, fecharTexto, confere, entre, vfDe, chave } = A;
  const tentar = (construir) => A.tentar(construir, 'termica');
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'fqa', tema: 'termica', id: def.subtema + '-' + def.tipo }, def));
  }
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  // ---------------------------------------------------------------- números (os mesmos de fisica-movimentos.js)
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
  // Valores intermédios (regra 15): exatos quando têm até 4 casas decimais, senão com 4 a.s.
  const exI = (v) => Math.abs(v - Math.round(v * 1e4) / 1e4) <= 1e-9 * Math.max(1, Math.abs(v));
  function texI(v) {
    if (exI(v)) return Math.abs(v) >= 1e5 ? cient(v, [1, 2, 3, 4].find((k) => exatoAS(v, k)) || 4) : tex(v, 4);
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) return cient(v, 4);
    if (a >= 1000) return tex(aAS(v, 4), 0);
    return (v < 0 ? '-' : '') + a.toPrecision(4).replace('.', '{,}');
  }
  // « = valor » ou « ≈ valor » de um resultado intermédio; ok = false quando algum operando já foi arredondado.
  const eqI = (v, ok = true) => (ok && exI(v) && exatoAS(v, 4) ? ' = ' : ' \\approx ') + texI(v);
  // O mesmo para um resultado mostrado com a precisão da resposta (3 a.s.).
  const eqN = (v, ok = true) => (ok && exatoAS(v, 3) ? ' = ' : ' \\approx ') + texN(v);
  // Dado do enunciado: $2,5\,V$.
  const q = (v, u) => '$' + tex(v) + '\\,' + u + '$';
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);

  const UN = {
    J: '\\mathrm{J}', kJ: '\\mathrm{kJ}', kg: '\\mathrm{kg}', g: '\\mathrm{g}', C: '{}^{\\circ}\\mathrm{C}', W: '\\mathrm{W}',
    s: '\\mathrm{s}', min: '\\mathrm{min}', m2: '\\mathrm{m^2}', Wm2: '\\mathrm{W\\,m^{-2}}', V: '\\mathrm{V}', A: '\\mathrm{A}',
    pct: '\\%', cU: '\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}', hU: '\\mathrm{J\\,kg^{-1}}',
  };
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

  // Fecha um item numérico (ou de escolha). Resposta exata quando tem até 3 a.s.; senão pede 3 a.s. (algarismos: 3).
  // Erros: arredondados a 3 a.s., e só os que ficam longe de 0 (um «0» escrito nunca é erro típico) e na escala da resposta.
  // o: { erros: [{ codigo, valor, explicacao(vt) }], unidade, u (LaTeX), verificacao(resposta) → { passo, calculo, valor } }.
  function fecharNum(rng, formato, ex, exato, o) {
    if (!Number.isFinite(exato) || exato === 0) return null;
    // Curto: exato com ≤ 3 a.s. e ≤ 3 casas decimais (o quiz, sem `algarismos`, mostra até 3 casas).
    const curto = exatoAS(exato, 3) && Math.abs(Number(exato.toFixed(3)) - exato) <= 1e-12;
    if (!curto && ambiguo(exato, 3)) return null;
    const resposta = aAS(exato, 3);
    const tol = A.tolMeiaUnidade(resposta, 3);
    const relativa = Math.abs(resposta) >= 1e4 || Math.abs(resposta) < 1e-3;
    const R = Math.abs(resposta);
    const esc = o.escala || 1e4; // fator máximo entre uma opção e a resposta (a troca kWh ↔ J pede 10⁷)
    const candidatos = o.erros
      .filter((e) => e && Number.isFinite(e.valor))
      .map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }))
      .filter((e) => (formato === 'escolha' || Math.abs(e.valor) > 10 * tol) && Math.abs(e.valor) > R / esc && Math.abs(e.valor) < R * esc);
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
  // A mesma resposta, por outro caminho, comparada como o item a mostra (verificarIndependente).
  const confereN = (p, valor, u) => confere(p, aAS(valor, 3), textoDe(u, p.dados.sci));

  // Escolha com n opções de texto (fecharTexto usa sempre 4); valorTexto é a opção a que chega a verificação.
  function fecharTextoN(rng, ex, certa, erros, valorTexto, n) {
    const e = A.escolhaDeErros(rng, certa, erros, n);
    return Object.assign(ex, e, { verificacao: Object.assign({}, ex.verificacao, { valor: e.opcoes.findIndex((t) => chave(t) === chave(valorTexto)) }) });
  }
  // Artigos e contrações: «o bloco» → «ao bloco», «do bloco»; «a água» → «à água», «da água».
  const artigo = (n) => n.split(' ')[0];
  const ao = (n) => ({ o: 'ao', a: 'à', os: 'aos', as: 'às' })[artigo(n)] + n.slice(artigo(n).length);
  const doDe = (n) => ({ o: 'do', a: 'da', os: 'dos', as: 'das' })[artigo(n)] + n.slice(artigo(n).length);
  const feminino = (n) => artigo(n) === 'a' || artigo(n) === 'as';

  // ================================================================ transferencias
  // Situações do quotidiano; a verdade é o mecanismo (mec) e os critérios (fluido em movimento, contacto, vazio),
  // escritos à mão. A verificação reencontra o mecanismo pelos critérios: fluido em movimento → convecção;
  // contacto direto → condução; nenhum dos dois → radiação.
  const MECANISMOS = { conducao: 'Condução', conveccao: 'Convecção', radiacao: 'Radiação' };
  const SITUACOES_MEC = [
    { id: 'panela', texto: 'Numa panela ao lume, toda a água aquece, e não só a que está junto ao fundo.', mec: 'conveccao', fluido: true, contacto: false, porque: 'a água aquecida junto ao fundo fica menos densa e sobe, e a mais fria desce. São correntes de convecção, em que a própria água se desloca' },
    { id: 'colher', texto: 'Uma colher de metal mergulhada numa sopa quente fica com o cabo quente.', mec: 'conducao', fluido: false, contacto: true, porque: 'a energia passa de partícula em partícula ao longo do metal, por colisões, sem que o metal se desloque' },
    { id: 'sol', texto: 'A energia do Sol chega à Terra através do espaço, praticamente vazio.', mec: 'radiacao', fluido: false, contacto: false, vazio: true, porque: 'no vazio não há partículas, e só a radiação eletromagnética se propaga sem meio material' },
    { id: 'lareira', texto: 'Sentado à frente de uma lareira, a alguns metros dela, sentes a cara aquecer.', mec: 'radiacao', fluido: false, contacto: false, porque: 'o ar quente da lareira sobe pela chaminé e o ar conduz mal a energia. O que chega à cara, à distância, é a radiação (sobretudo infravermelha) emitida pelas chamas e pelas brasas' },
    { id: 'aquecedor', texto: 'O ar aquecido por um aquecedor junto ao chão sobe e acaba por aquecer toda a sala.', mec: 'conveccao', fluido: true, contacto: false, porque: 'o ar quente, menos denso, sobe e o ar frio, mais denso, desce. É o próprio ar que se desloca e leva a energia' },
    { id: 'caneca', texto: 'Ao pegares numa caneca de chá quente, a tua mão aquece.', mec: 'conducao', fluido: false, contacto: true, porque: 'a mão está em contacto com a caneca e a energia passa da caneca, mais quente, para a mão, por colisões entre partículas' },
    { id: 'brisa', texto: 'Num dia de sol, junto à praia, o ar quente sobre a areia sobe e é substituído por ar mais fresco vindo do mar.', mec: 'conveccao', fluido: true, contacto: false, porque: 'é o ar, um fluido, que se desloca: o quente sobe e o fresco ocupa o seu lugar (a brisa marítima)' },
    { id: 'ferro', texto: 'Um ferro de engomar quente aquece a roupa em que está pousado.', mec: 'conducao', fluido: false, contacto: true, porque: 'a base do ferro está em contacto com a roupa e a energia passa por colisões entre partículas, sem deslocação de matéria' },
    { id: 'termografia', texto: 'Uma câmara termográfica deteta, à distância, uma pessoa num quarto às escuras.', mec: 'radiacao', fluido: false, contacto: false, porque: 'a câmara recebe a radiação infravermelha que o corpo da pessoa emite, sem contacto' },
    { id: 'frigorifico', texto: 'Num frigorífico com o congelador em cima, o ar arrefecido junto ao congelador desce e arrefece os alimentos das prateleiras de baixo.', mec: 'conveccao', fluido: true, contacto: false, porque: 'o ar frio, mais denso, desce e o ar mais quente sobe. É o próprio ar que se desloca' },
    { id: 'areia', texto: 'Ao andares descalço na areia ao sol, sentes os pés a escaldar.', mec: 'conducao', fluido: false, contacto: true, porque: 'os pés estão em contacto com a areia quente e a energia passa da areia para os pés por colisões entre partículas' },
    { id: 'satelite', texto: 'Um satélite em órbita, no espaço, aquece do lado virado para o Sol.', mec: 'radiacao', fluido: false, contacto: false, vazio: true, porque: 'no espaço praticamente não há matéria, e só a radiação se propaga no vazio' },
    { id: 'gelo', texto: 'Um cubo de gelo derrete na palma da tua mão.', mec: 'conducao', fluido: false, contacto: true, porque: 'o gelo está em contacto com a mão, mais quente, e recebe energia por colisões entre partículas' },
    { id: 'lampada', texto: 'Com a mão ao lado de uma lâmpada de incandescência acesa, sem lhe tocar, sentes calor.', mec: 'radiacao', fluido: false, contacto: false, porque: 'o filamento muito quente emite muita radiação infravermelha, que chega à mão sem contacto; o ar quente sobe e não vai para o lado' },
    { id: 'aquecimento-central', texto: 'Num aquecimento central, a água quente que circula nos tubos leva a energia da caldeira até aos radiadores das salas.', mec: 'conveccao', fluido: true, contacto: false, porque: 'é a própria água, um fluido, que se desloca e leva consigo a energia' },
  ];
  const mecPelosCriterios = (s) => (s.fluido ? 'conveccao' : s.contacto ? 'conducao' : 'radiacao');
  const PORQUE_MEC = {
    conducao: 'A condução precisa de contacto: a energia passa de partícula em partícula, por colisões, sem deslocação de matéria.',
    conveccao: 'A convecção só acontece em fluidos (líquidos e gases), com deslocação do próprio fluido.',
    radiacao: 'A radiação transfere energia por ondas eletromagnéticas, sem contacto nem meio material, mas aqui não é o mecanismo principal.',
  };
  // Códigos escritos por extenso (a leitura estática dos códigos, no painel e nos testes, só vê literais).
  const CODIGO_MEC = {
    'conducao>conveccao': { codigo: 'conducao_em_vez_de_conveccao' }, 'radiacao>conveccao': { codigo: 'radiacao_em_vez_de_conveccao' },
    'conveccao>conducao': { codigo: 'conveccao_em_vez_de_conducao' }, 'radiacao>conducao': { codigo: 'radiacao_em_vez_de_conducao' },
    'conducao>radiacao': { codigo: 'conducao_em_vez_de_radiacao' }, 'conveccao>radiacao': { codigo: 'conveccao_em_vez_de_radiacao' },
    'conducao>vazio': { codigo: 'conducao_no_vazio' }, 'conveccao>vazio': { codigo: 'conveccao_no_vazio' },
  };
  function erroMec(s, errado) {
    if (s.vazio && errado !== 'radiacao') {
      return { codigo: CODIGO_MEC[errado + '>vazio'].codigo, explicacao: (errado === 'conducao' ? 'A condução precisa de partículas que colidam umas com as outras' : 'A convecção é o movimento de um fluido') + ', e no vazio não há matéria. Aqui, ' + s.porque + '.' };
    }
    return { codigo: CODIGO_MEC[errado + '>' + s.mec].codigo, explicacao: PORQUE_MEC[errado] + ' Aqui, ' + s.porque + '.' };
  }

  registar({
    subtema: 'transferencias', tipo: 'mecanismo', nome: 'Condução, convecção ou radiação numa situação do quotidiano',
    formatos: ['escolha', 'vf'], nOpcoes: 3,
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const s = escolher(rng, SITUACOES_MEC);
        const criterio = s.fluido ? 'há um fluido em movimento' : s.contacto ? 'há contacto direto, sem fluido em movimento' : 'não há contacto nem fluido em movimento';
        const resolucao = [
          { passo: 'Procurar contacto ou fluido em movimento', porque: 'Na condução a energia passa por contacto; na convecção desloca-se um fluido; na radiação não é preciso nem contacto nem meio material. Nesta situação, ' + criterio + '.' },
          { passo: 'Concluir', porque: maiuscula(MECANISMOS[s.mec].toLowerCase()) + ', porque ' + s.porque + '.' },
        ];
        const verificacao = { passo: 'Confirmar pelos critérios (fluido em movimento: convecção; só contacto: condução; nenhum dos dois: radiação)', calculo: '\\text{' + criterio + '}' };
        const certa = MECANISMOS[mecPelosCriterios(s)];
        const errados = Object.keys(MECANISMOS).filter((m) => m !== s.mec);
        if (formato === 'escolha') {
          const erros = errados.map((m) => Object.assign({ texto: MECANISMOS[m] }, erroMec(s, m)));
          return fecharTextoN(rng, { enunciado: s.texto + ' Esta transferência de energia acontece sobretudo por…', resolucao, dados: { situacao: s.id }, verificacao, esquema: { id: 'fqa-transferencias' } }, MECANISMOS[s.mec], erros, certa, 3);
        }
        const errado = escolher(rng, errados);
        const frase = (m) => s.texto + ' Esta transferência de energia acontece sobretudo por ' + MECANISMOS[m].toLowerCase() + '.';
        const v = vfDe(rng, frase(s.mec), frase(errado), erroMec(s, errado));
        return Object.assign({ resolucao, dados: { situacao: s.id, mostrado: v.correta ? s.mec : errado }, esquema: { id: 'fqa-transferencias' } }, v, { verificacao: Object.assign({}, verificacao, { valor: (v.correta ? s.mec : errado) === mecPelosCriterios(s) }) });
      });
    },
    verificarIndependente(p) {
      const s = SITUACOES_MEC.find((x) => x.id === p.dados.situacao);
      if (!s) return false;
      const m = mecPelosCriterios(s);
      if (p.formato === 'vf') return p.correta === (p.dados.mostrado === m);
      return p.opcoes[p.correta] === MECANISMOS[m];
    },
    limites(p) {
      return SITUACOES_MEC.some((x) => x.id === p.dados.situacao);
    },
  });

  // Dois corpos que só trocam energia um com o outro; a verdade é quem cede energia (cede), escrita à mão e conferida
  // pelas temperaturas.
  const SITUACOES_EQ = [
    { id: 'cobre', cena: 'Um bloco de cobre a 80 °C é mergulhado em água a 20 °C, num recipiente isolado.', a: 'o bloco de cobre', ta: 80, b: 'a água', tb: 20, cede: 'a' },
    { id: 'lata', cena: 'Uma lata de refrigerante a 5 °C é mergulhada num balde com água a 25 °C.', a: 'a lata', ta: 5, b: 'a água do balde', tb: 25, cede: 'b' },
    { id: 'ovo', cena: 'Um ovo cozido a 90 °C é posto numa taça com água fria a 15 °C.', a: 'o ovo', ta: 90, b: 'a água fria', tb: 15, cede: 'a' },
    { id: 'colher', cena: 'Uma colher de alumínio a 20 °C é mergulhada numa chávena de chá a 70 °C.', a: 'a colher', ta: 20, b: 'o chá', tb: 70, cede: 'b' },
    { id: 'termometro', cena: 'Um termómetro a 22 °C é posto debaixo do braço de uma pessoa com febre, a 38 °C.', a: 'o termómetro', ta: 22, b: 'o corpo da pessoa', tb: 38, cede: 'b' },
    { id: 'prego', cena: 'Um prego de ferro a 300 °C, acabado de sair da forja, é mergulhado num balde com água a 18 °C.', a: 'o prego', ta: 300, b: 'a água do balde', tb: 18, cede: 'a' },
    { id: 'leite', cena: 'Junta-se leite a 4 °C, acabado de sair do frigorífico, a um café a 75 °C.', a: 'o leite', ta: 4, b: 'o café', tb: 75, cede: 'b' },
    { id: 'garrafa', cena: 'Uma garrafa de água a 28 °C é mergulhada na água de um rio, a 12 °C.', a: 'a garrafa de água', ta: 28, b: 'a água do rio', tb: 12, cede: 'a' },
    { id: 'chumbo', cena: 'Um bloco de chumbo a 100 °C é mergulhado em óleo a 25 °C, num recipiente isolado.', a: 'o bloco de chumbo', ta: 100, b: 'o óleo', tb: 25, cede: 'a' },
    { id: 'botija', cena: 'Uma botija de água quente a 60 °C é posta numa cama, entre os lençóis, a 15 °C.', a: 'a botija', ta: 60, b: 'os lençóis', tb: 15, cede: 'a' },
    { id: 'pedra', cena: 'Uma pedra aquecida ao sol, a 45 °C, é posta numa poça de água a 20 °C.', a: 'a pedra', ta: 45, b: 'a água da poça', tb: 20, cede: 'a' },
    { id: 'gelado', cena: 'Uma taça de gelado a −8 °C fica pousada numa mesa de madeira a 22 °C.', a: 'o gelado', ta: -8, b: 'a mesa', tb: 22, cede: 'b' },
  ];
  const grau = (t) => String(t).replace('-', '−') + ' °C';

  registar({
    subtema: 'transferencias', tipo: 'equilibrio', nome: 'Sentido do calor e equilíbrio térmico',
    formatos: ['escolha', 'vf'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const s = escolher(rng, SITUACOES_EQ);
        const [Q, tq, F, tf] = s.cede === 'a' ? [s.a, s.ta, s.b, s.tb] : [s.b, s.tb, s.a, s.ta];
        const dois = feminino(Q) && feminino(F) ? 'as duas' : 'os dois';
        const intervalo = 'entre ' + grau(tf) + ' e ' + grau(tq);
        const certa = maiuscula(Q) + ' cede energia ' + ao(F) + ' até ficarem ' + dois + ' à mesma temperatura, ' + intervalo + '.';
        const erros = baralhar(rng, [
          { codigo: 'sentido_do_calor_trocado', texto: maiuscula(F) + ' cede energia ' + ao(Q) + ' até ficarem ' + dois + ' à mesma temperatura.', explicacao: 'O calor passa espontaneamente do corpo a temperatura mais alta para o de temperatura mais baixa. Quem cede energia é ' + Q + ', a ' + grau(tq) + '.' },
          { codigo: 'frio_transferido', texto: maiuscula(F) + ' transfere frio para ' + Q + ' até ficarem ' + dois + ' à mesma temperatura.', explicacao: 'Não há «frio» a passar. É ' + Q + ', mais quente, que cede energia ' + ao(F) + ', que aquece.' },
          { codigo: 'equilibrio_como_energias_internas_iguais', texto: maiuscula(Q) + ' cede energia ' + ao(F) + ' até ' + dois + ' terem a mesma energia interna.', explicacao: 'O equilíbrio térmico é ter a mesma temperatura, não a mesma energia interna (que depende também da massa e do material).' },
          { codigo: 'equilibrio_a_temperatura_do_corpo_frio', texto: maiuscula(Q) + ' cede energia ' + ao(F) + ' até ficar à temperatura inicial ' + doDe(F) + ', ' + grau(tf) + '.', explicacao: 'Ao receber energia, ' + F + ' também aquece. A temperatura final fica ' + intervalo + ', e não nos ' + grau(tf) + ' iniciais.' },
        ]);
        const resolucao = [
          { passo: 'Comparar as temperaturas', porque: maiuscula(Q) + ' está a ' + grau(tq) + ' e ' + F + ' a ' + grau(tf) + '. O calor é a energia transferida espontaneamente do corpo a temperatura mais alta para o de temperatura mais baixa.' },
          { passo: 'Até quando', porque: 'A transferência acaba quando ' + dois + ' atingem a mesma temperatura (equilíbrio térmico), ' + intervalo + '. ' + maiuscula(Q) + ' arrefece e ' + F + ' aquece.' },
        ];
        const verificacao = { passo: 'Quem cede energia é o que está a temperatura mais alta', calculo: tex(tq) + '\\,{}^{\\circ}\\mathrm{C} > ' + tex(tf) + '\\,{}^{\\circ}\\mathrm{C}' };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado: s.cena + ' Considera que só há trocas de energia entre estes dois corpos. O que acontece?', resolucao, dados: { situacao: s.id }, verificacao }, certa, erros, certa);
        const falsa = erros[0];
        const v = vfDe(rng, s.cena + ' ' + certa, s.cena + ' ' + falsa.texto, { codigo: falsa.codigo, explicacao: falsa.explicacao });
        return Object.assign({ resolucao, dados: { situacao: s.id, codigo: v.correta ? null : falsa.codigo } }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const s = SITUACOES_EQ.find((x) => x.id === p.dados.situacao);
      if (!s) return false;
      const quente = s.ta > s.tb ? s.a : s.b;
      const frio = s.ta > s.tb ? s.b : s.a;
      const certa = maiuscula(quente) + ' cede energia ' + ao(frio);
      if (p.formato === 'vf') return p.correta === (p.enunciado.includes(certa) && /mesma temperatura, entre/.test(p.enunciado));
      return p.opcoes[p.correta].startsWith(certa) && /mesma temperatura, entre/.test(p.opcoes[p.correta]);
    },
    limites(p) {
      return SITUACOES_EQ.some((x) => x.id === p.dados.situacao);
    },
  });

  // Afirmações sobre a radiação emitida pelos corpos (infravermelho, termografia); a verdade é escrita à mão.
  const AFIRMACOES_IV = [
    { id: 'todos-emitem', v: true, texto: 'Todos os corpos emitem radiação eletromagnética, qualquer que seja a sua temperatura.', porque: 'Todos os corpos emitem radiação; o que muda com a temperatura é a potência emitida e a zona do espectro em que emitem mais.' },
    { id: 'ambiente-iv', v: true, texto: 'À temperatura ambiente, os corpos emitem sobretudo radiação infravermelha.', porque: 'À temperatura ambiente a radiação emitida é sobretudo infravermelha, invisível; por isso os objetos não brilham no escuro.' },
    { id: 'mais-quente', v: true, texto: 'Quanto maior é a temperatura de um corpo, maior é a potência da radiação que emite.', porque: 'Um corpo mais quente emite radiação com maior potência (e mais deslocada para comprimentos de onda menores).' },
    { id: 'termografia', v: true, texto: 'Uma câmara termográfica forma imagens a partir da radiação infravermelha emitida pelos corpos.', porque: 'A termografia deteta a radiação infravermelha emitida: zonas mais quentes emitem mais e aparecem com outra cor.' },
    { id: 'gelo-emite', v: true, texto: 'Um cubo de gelo também emite radiação, sobretudo no infravermelho.', porque: 'Mesmo a 0 °C o gelo emite radiação, com menor potência do que um corpo mais quente.' },
    { id: 'vazio', v: true, texto: 'A radiação é a única forma de transferência de energia que se propaga no vazio.', porque: 'A condução e a convecção precisam de matéria; a radiação eletromagnética propaga-se no vazio (é assim que a energia do Sol chega à Terra).' },
    { id: 'equilibrio', v: true, texto: 'Um corpo em equilíbrio térmico com a vizinhança emite e absorve radiação com a mesma potência.', porque: 'Em equilíbrio térmico o corpo continua a emitir, mas absorve com a mesma potência, por isso a sua temperatura não muda.' },
    { id: 'lambda-maior', v: true, texto: 'A radiação infravermelha tem comprimento de onda maior do que o da luz visível.', porque: 'No espectro, o infravermelho fica a seguir ao vermelho, com comprimentos de onda maiores do que os da luz visível.' },
    { id: 'so-quentes', v: false, texto: 'Só os corpos muito quentes, como uma brasa, emitem radiação.', codigo: 'so_corpos_quentes_emitem_radiacao', explicacao: 'Não são só os corpos muito quentes: todos os corpos emitem radiação. À temperatura ambiente ela é infravermelha e, por isso, invisível.' },
    { id: 'gelo-nao-emite', v: false, texto: 'Um cubo de gelo, por estar frio, não emite radiação nenhuma.', codigo: 'so_corpos_quentes_emitem_radiacao', explicacao: 'O gelo também emite radiação (no infravermelho), só que com menor potência do que um corpo mais quente. Todos os corpos emitem radiação.' },
    { id: 'ambiente-visivel', v: false, texto: 'À temperatura ambiente, os corpos emitem sobretudo luz visível.', codigo: 'emissao_ambiente_no_visivel', explicacao: 'À temperatura ambiente os corpos emitem sobretudo no infravermelho, que não vemos. Só a temperaturas muito altas (uma brasa, um filamento) emitem também luz visível.' },
    { id: 'meio', v: false, texto: 'A radiação infravermelha precisa de um meio material, como o ar, para se propagar.', codigo: 'radiacao_precisa_de_meio', explicacao: 'A radiação eletromagnética, incluindo a infravermelha, propaga-se no vazio. É assim que a energia do Sol chega à Terra.' },
    { id: 'termografia-visivel', v: false, texto: 'Uma câmara termográfica forma a imagem com a luz visível refletida pelos corpos.', codigo: 'termografia_com_luz_visivel', explicacao: 'A câmara termográfica deteta a radiação infravermelha emitida pelos próprios corpos; por isso funciona às escuras.' },
    { id: 'quente-menos', v: false, texto: 'Quanto mais quente está um corpo, menos radiação emite.', codigo: 'mais_quente_emite_menos', explicacao: 'É ao contrário: quanto maior a temperatura, maior a potência da radiação emitida.' },
    { id: 'equilibrio-nao-emite', v: false, texto: 'Um corpo em equilíbrio térmico com a vizinhança deixa de emitir radiação.', codigo: 'equilibrio_sem_emissao', explicacao: 'Continua a emitir. Em equilíbrio térmico emite e absorve com a mesma potência, por isso a temperatura não muda.' },
    { id: 'lambda-menor', v: false, texto: 'A radiação infravermelha tem comprimento de onda menor do que o da luz visível.', codigo: 'infravermelho_com_lambda_menor', explicacao: 'O infravermelho fica a seguir ao vermelho no espectro: tem comprimento de onda maior (e fotões de menor energia) do que a luz visível.' },
  ];
  const afirmacao = (id) => AFIRMACOES_IV.find((x) => x.id === id);

  registar({
    subtema: 'transferencias', tipo: 'infravermelho', nome: 'Radiação emitida pelos corpos e infravermelho (verdadeiro ou falso)',
    formatos: ['vf', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const verdadeiras = AFIRMACOES_IV.filter((x) => x.v), falsas = AFIRMACOES_IV.filter((x) => !x.v);
        if (formato === 'vf') {
          const a = rng() < 0.5 ? escolher(rng, verdadeiras) : escolher(rng, falsas);
          return {
            enunciado: a.texto,
            correta: a.v,
            errosTipicos: a.v ? [] : [{ codigo: a.codigo, explicacao: a.explicacao }],
            resolucao: [{ passo: a.v ? 'É verdadeira' : 'É falsa', porque: a.v ? a.porque : a.explicacao }],
            dados: { afirmacao: a.id },
            verificacao: { passo: 'Confrontar com o que se sabe da radiação emitida pelos corpos', calculo: '\\text{' + (a.v ? 'verdadeira' : 'falsa') + '}', valor: afirmacao(a.id).v },
          };
        }
        const c = escolher(rng, verdadeiras);
        const vistos = new Set();
        const erros = baralhar(rng, falsas).filter((f) => !vistos.has(f.codigo) && vistos.add(f.codigo)).map((f) => ({ codigo: f.codigo, texto: f.texto, explicacao: f.explicacao }));
        return fecharTexto(rng, {
          enunciado: 'Qual das afirmações sobre a radiação emitida pelos corpos é verdadeira?',
          resolucao: [{ passo: 'Procurar a afirmação verdadeira', porque: c.porque }],
          dados: { afirmacao: c.id },
          verificacao: { passo: 'Confrontar cada afirmação com o que se sabe da radiação emitida pelos corpos', calculo: '\\text{só uma é verdadeira}' },
        }, c.texto, erros, c.texto);
      });
    },
    verificarIndependente(p) {
      const a = afirmacao(p.dados.afirmacao);
      if (!a) return false;
      if (p.formato === 'vf') return p.enunciado === a.texto && p.correta === a.v;
      return a.v && p.opcoes[p.correta] === a.texto && p.opcoes.filter((o) => AFIRMACOES_IV.some((x) => x.v && x.texto === o)).length === 1;
    },
    limites(p) {
      return !!afirmacao(p.dados.afirmacao);
    },
  });

  // @@GERADORES@@
})();
