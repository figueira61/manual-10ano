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

  // ---------------------------------------------------------------- números (js/geradores/fqa/fisica-comum.js)
  const {
    dado, percentagem, cient, texN, igual, exI, texI, eqI, eqN, q, par, sobre, confereN, fecharNum,
  } = G.fisicaNumeros.criar({ grandesEmCientifica: true });

  const UN = {
    J: '\\mathrm{J}', kJ: '\\mathrm{kJ}', kg: '\\mathrm{kg}', g: '\\mathrm{g}', C: '{}^{\\circ}\\mathrm{C}', W: '\\mathrm{W}',
    s: '\\mathrm{s}', min: '\\mathrm{min}', m2: '\\mathrm{m^2}', Wm2: '\\mathrm{W\\,m^{-2}}', V: '\\mathrm{V}', A: '\\mathrm{A}',
    pct: '\\%', cU: '\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}', hU: '\\mathrm{J\\,kg^{-1}}',
  };

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
    radiacao: 'A radiação transfere energia por ondas eletromagnéticas, sem contacto nem meio material, mas não é o mecanismo principal nesta situação.',
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
    { id: 'cubo-aluminio', cena: 'Um cubo de alumínio a 150 °C é posto num copo com água a 20 °C, num recipiente isolado.', a: 'o cubo de alumínio', ta: 150, b: 'a água do copo', tb: 20, cede: 'a' },
    { id: 'prego', cena: 'Um prego de ferro a 300 °C, acabado de sair da forja, é mergulhado num balde com água a 18 °C.', a: 'o prego', ta: 300, b: 'a água do balde', tb: 18, cede: 'a' },
    { id: 'leite', cena: 'Junta-se leite a 4 °C, acabado de sair do frigorífico, a um café a 75 °C.', a: 'o leite', ta: 4, b: 'o café', tb: 75, cede: 'b' },
    { id: 'garrafa', cena: 'Uma garrafa de sumo a 30 °C é mergulhada numa caixa térmica fechada com água a 5 °C.', a: 'a garrafa de sumo', ta: 30, b: 'a água da caixa', tb: 5, cede: 'a' },
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
          { codigo: 'sentido_do_calor_trocado', texto: maiuscula(F) + ' cede energia ' + ao(Q) + ' até ficarem ' + dois + ' à mesma temperatura, ' + intervalo + '.', explicacao: 'O calor passa espontaneamente do corpo a temperatura mais alta para o de temperatura mais baixa. Quem cede energia é ' + Q + ', a ' + grau(tq) + '.' },
          { codigo: 'frio_transferido', texto: maiuscula(F) + ' transfere frio para ' + Q + ' até ficarem ' + dois + ' à mesma temperatura, ' + intervalo + '.', explicacao: 'Não há «frio» a passar. É ' + Q + ', mais quente, que cede energia ' + ao(F) + ', que aquece.' },
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

  // ================================================================ balancos
  // Valores de referência em LaTeX com os algarismos que têm (4180 → 4,18 × 10³; 2100 → 2,1 × 10³; 900 → 900).
  const cTex = (c) => (c >= 1000 ? cient(c, String(c).replace(/0+$/, '').length) : tex(c));
  const hTex = (h) => cient(h, String(h).replace(/0+$/, '').length);
  const MATERIAIS = [
    { id: 'agua', nome: 'água', corpo: 'água' },
    { id: 'aluminio', nome: 'alumínio', corpo: 'um bloco de alumínio' },
    { id: 'cobre', nome: 'cobre', corpo: 'um bloco de cobre' },
    { id: 'ferro', nome: 'ferro', corpo: 'uma peça de ferro' },
    { id: 'chumbo', nome: 'chumbo', corpo: 'um bloco de chumbo' },
  ];
  const cDe = (id) => D().capacidadeTermicaMassica[id];
  const cDado = (mat) => '$c_{\\text{' + mat.nome + '}} = ' + cTex(cDe(mat.id)) + '\\,' + UN.cU + '$';
  const temp = (t) => '$' + dado(t) + '\\,' + UN.C + '$';
  const graus = (t) => tex(t) + '\\,' + UN.C;

  registar({
    subtema: 'balancos', tipo: 'calor', nome: 'Energia transferida como calor, Q = m c Δθ (energia, c ou temperatura final)',
    formatos: ['numerica', 'escolha'], contextos: ['energia', 'capacidade', 'temperatura'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const mat = escolher(rng, MATERIAIS);
        const c = cDe(mat.id);
        const ti = entre(rng, 10, 30, 1);
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'energia') {
          const emG = formato === 'escolha' || rng() < 0.5;
          const mg = entre(rng, 100, 1000, 50);
          const m = A.limpo(mg / 1000);
          const dT = entre(rng, 5, mat.id === 'agua' ? 60 : 150, 5);
          const tf = ti + dT;
          const Q = A.limpo(m * c * dT);
          exato = Q;
          unidade = 'J';
          u = UN.J;
          const res = [];
          if (emG) res.push({ passo: 'Passar a massa a quilogramas', porque: 'A capacidade térmica mássica está por quilograma: $1\\,\\mathrm{kg} = 1000\\,\\mathrm{g}$.', calculo: 'm = ' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}' });
          res.push({ passo: 'Variação de temperatura', porque: 'Na expressão entra a variação, $\\Delta\\theta = \\theta_f - \\theta_i$ (uma variação de 1 °C é igual a uma variação de 1 K).', calculo: '\\Delta\\theta = ' + tex(tf) + ' - ' + tex(ti) + ' = ' + graus(dT) });
          res.push({ passo: 'Aplicar $Q = m c \\Delta\\theta$', porque: 'O corpo aquece, por isso recebe energia: $Q > 0$.', calculo: 'Q = ' + tex(m) + ' \\times ' + cTex(c) + ' \\times ' + tex(dT) + igual(Q) + texN(Q) + '\\,\\mathrm{J}' });
          ex = {
            enunciado: 'Calcula a energia que é preciso fornecer a ' + (emG ? q(mg, UN.g) : q(m, UN.kg)) + ' de ' + mat.nome + ' para a sua temperatura subir de ' + temp(ti) + ' para ' + temp(tf) + ', sem perdas (' + cDado(mat) + ').',
            resolucao: res,
            dados: { contexto, mat: mat.id, m, ti, tf },
          };
          erros = [
            { codigo: 'somou_273_a_variacao', valor: m * c * (dT + 273), explicacao: (vt) => 'Somaste 273 à variação de temperatura e obtiveste ' + vt(m * c * (dT + 273), UN.J) + '. Uma variação de $' + tex(dT) + '\\,{}^{\\circ}\\mathrm{C}$ é uma variação de $' + tex(dT) + '\\,\\mathrm{K}$.' },
            { codigo: 'usou_temperatura_final_em_vez_da_variacao', valor: m * c * tf, explicacao: (vt) => 'Usaste a temperatura final e obtiveste ' + vt(m * c * tf, UN.J) + '. Na expressão entra a variação, $\\Delta\\theta = ' + tex(dT) + '\\,{}^{\\circ}\\mathrm{C}$.' },
          ];
          if (emG) erros.push({ codigo: 'massa_em_gramas', valor: mg * c * dT, explicacao: (vt) => 'Usaste a massa em gramas e obtiveste ' + vt(mg * c * dT, UN.J) + '. No SI a massa está em kg ($' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}$).' });
          verificacao = () => ({ passo: 'Pela capacidade térmica do corpo, $C = m c$ (energia por grau)', calculo: 'C = ' + tex(m) + ' \\times ' + cTex(c) + eqI(m * c) + '\\,\\mathrm{J\\,{}^{\\circ}C^{-1}};\\ Q = C \\Delta\\theta = ' + texI(m * c) + ' \\times ' + tex(dT) + eqN(m * c * dT, exI(m * c)) + '\\,\\mathrm{J}', valor: Fis().calor(m, c, dT) });
        } else if (contexto === 'capacidade') {
          const m = entre(rng, 0.1, 2, 0.05);
          if (m === 1) return null;
          const dT = entre(rng, 4, mat.id === 'agua' ? 50 : 80, 2);
          const tf = ti + dT;
          const Q = A.limpo(m * c * dT);
          if (!exI(Q)) return null;
          exato = c;
          unidade = 'J kg⁻¹ °C⁻¹';
          u = UN.cU;
          ex = {
            enunciado: 'Um corpo de ' + q(m, UN.kg) + ' recebe ' + q(Q, UN.J) + ' de energia, sem perdas, e a sua temperatura sobe de ' + temp(ti) + ' para ' + temp(tf) + '. Calcula a capacidade térmica mássica do material de que é feito.',
            resolucao: [
              { passo: 'Variação de temperatura', porque: '$\\Delta\\theta = \\theta_f - \\theta_i$.', calculo: '\\Delta\\theta = ' + tex(tf) + ' - ' + tex(ti) + ' = ' + graus(dT) },
              { passo: 'Isolar $c$ em $Q = m c \\Delta\\theta$', porque: 'Divide-se a energia pela massa e pela variação de temperatura.', calculo: 'c = \\dfrac{Q}{m \\Delta\\theta} = \\dfrac{' + tex(Q) + '}{' + tex(m) + ' \\times ' + tex(dT) + '}' + igual(c) + texN(c) + '\\,' + UN.cU },
            ],
            dados: { contexto, Q, m, ti, tf },
          };
          erros = [
            { codigo: 'multiplicou_em_vez_de_dividir', valor: Q * m * dT, explicacao: (vt) => 'Multiplicaste $Q \\times m \\times \\Delta\\theta$ e obtiveste ' + vt(Q * m * dT) + '. Isola-se $c$: $c = Q/(m \\Delta\\theta)$.' },
            { codigo: 'esqueceu_a_massa_no_calor', valor: Q / dT, explicacao: (vt) => 'Dividiste só pela variação de temperatura e obtiveste ' + vt(Q / dT) + ' (é a capacidade térmica do corpo, em $\\mathrm{J\\,{}^{\\circ}C^{-1}}$). Falta dividir pela massa.' },
            { codigo: 'esqueceu_a_variacao_de_temperatura', valor: Q / m, explicacao: (vt) => 'Dividiste só pela massa e obtiveste ' + vt(Q / m) + '. Falta dividir pela variação de temperatura, $' + tex(dT) + '\\,{}^{\\circ}\\mathrm{C}$.' },
            { codigo: 'usou_temperatura_final_em_vez_da_variacao', valor: Q / (m * tf), explicacao: (vt) => 'Dividiste pela temperatura final e obtiveste ' + vt(Q / (m * tf), UN.cU) + '. Na expressão entra a variação, $\\Delta\\theta = ' + tex(dT) + '\\,{}^{\\circ}\\mathrm{C}$.' },
          ];
          verificacao = (r) => ({ passo: 'Recalcular a energia com o valor obtido: tem de dar $Q$', calculo: tex(m) + ' \\times ' + texN(r) + ' \\times ' + tex(dT) + ' = ' + tex(m * r * dT, 4) + '\\,\\mathrm{J}', valor: Q / m / dT });
        } else {
          const mg = entre(rng, 100, 800, 50);
          const m = A.limpo(mg / 1000);
          const Q = entre(rng, 2000, 40000, 500);
          const dT = Q / (m * c);
          if (dT < 3 || dT > (mat.id === 'agua' ? 60 : 200)) return null;
          const tf = ti + dT;
          exato = tf;
          unidade = '°C';
          u = UN.C;
          ex = {
            enunciado: maiuscula(mat.corpo === 'água' ? 'uma porção de água' : mat.corpo) + ' de ' + q(mg, UN.g) + ', a ' + temp(ti) + ', recebe ' + q(Q, UN.J) + ' de energia, sem perdas (' + cDado(mat) + '). Calcula a temperatura final.',
            resolucao: [
              { passo: 'Passar a massa a quilogramas', porque: 'A capacidade térmica mássica está por quilograma.', calculo: 'm = ' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}' },
              { passo: 'Variação de temperatura', porque: 'De $Q = m c \\Delta\\theta$ vem $\\Delta\\theta = Q/(m c)$.', calculo: '\\Delta\\theta = \\dfrac{' + tex(Q) + '}{' + tex(m) + ' \\times ' + cTex(c) + '}' + eqI(dT) + '\\,' + UN.C },
              { passo: 'Temperatura final', porque: 'O corpo recebe energia, por isso aquece: $\\theta_f = \\theta_i + \\Delta\\theta$.', calculo: '\\theta_f = ' + tex(ti) + ' + ' + texI(dT) + eqN(tf, exI(dT)) + '\\,' + UN.C },
            ],
            dados: { contexto, mat: mat.id, m, ti, Q },
          };
          erros = [
            { codigo: 'deu_a_variacao_de_temperatura', valor: dT, explicacao: (vt) => vt(dT, UN.C) + ' é a variação de temperatura. A temperatura final soma-a à inicial, ' + temp(ti) + '.' },
            { codigo: 'subtraiu_a_variacao', valor: ti - dT >= -40 ? ti - dT : NaN, explicacao: (vt) => 'Subtraíste a variação e obtiveste ' + vt(ti - dT, UN.C) + '. O corpo recebe energia, por isso aquece: $\\theta_f = \\theta_i + \\Delta\\theta$.' },
            { codigo: 'massa_em_gramas', valor: ti + Q / (mg * c), explicacao: (vt) => 'Usaste a massa em gramas e obtiveste ' + vt(ti + Q / (mg * c), UN.C) + '. No SI a massa está em kg ($' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}$).' },
          ];
          verificacao = () => ({ passo: 'Recalcular a energia com $\\Delta\\theta$ (por arredondar): tem de dar $Q$', calculo: tex(m) + ' \\times ' + cTex(c) + ' \\times ' + texI(dT) + eqI(m * c * dT, exI(dT)) + '\\,\\mathrm{J}', valor: ti + Q / m / c });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'energia') return confereN(p, (d.m * cDe(d.mat)) * (d.tf - d.ti), UN.J);
      if (d.contexto === 'capacidade') return confereN(p, (d.Q / (d.tf - d.ti)) / d.m, UN.cU);
      return confereN(p, d.ti + (d.Q / cDe(d.mat)) / d.m, UN.C);
    },
    limites(p) {
      const d = p.dados;
      if (d.contexto === 'capacidade') return d.tf > d.ti;
      const tf = d.contexto === 'energia' ? d.tf : d.ti + d.Q / (d.m * cDe(d.mat));
      return tf > d.ti && tf <= (d.mat === 'agua' ? 95 : 250);
    },
  });

  registar({
    subtema: 'balancos', tipo: 'fase', nome: 'Fusão e vaporização, Q = m Δh, e aquecimento do gelo até água líquida',
    formatos: ['numerica', 'escolha'], contextos: ['fusao', 'vaporizacao', 'gelo-agua'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const H = D().entalpiaMassica;
        const cA = cDe('agua'), cG = D().capacidadeTermicaMassica.gelo;
        const hF = '$\\Delta h_{\\text{fusão}} = ' + hTex(H.fusaoGelo) + '\\,' + UN.hU + '$';
        const hV = '$\\Delta h_{\\text{vaporização}} = ' + hTex(H.vaporizacaoAgua) + '\\,' + UN.hU + '$';
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto !== 'gelo-agua') {
          const fusao = contexto === 'fusao';
          const mg = entre(rng, 50, 500, 10);
          const m = A.limpo(mg / 1000);
          const dh = fusao ? H.fusaoGelo : H.vaporizacaoAgua;
          const outra = fusao ? H.vaporizacaoAgua : H.fusaoGelo;
          const Q = A.limpo((m * dh) / 1000);
          exato = Q;
          unidade = 'kJ';
          u = UN.kJ;
          ex = {
            enunciado: (fusao ? 'Calcula a energia necessária para fundir completamente ' + q(mg, UN.g) + ' de gelo a $0\\,' + UN.C + '$' : 'Calcula a energia necessária para vaporizar completamente ' + q(mg, UN.g) + ' de água a $100\\,' + UN.C + '$') + ', em quilojoules, à pressão normal (' + hF + '; ' + hV + ').',
            resolucao: [
              { passo: 'Passar a massa a quilogramas', porque: 'A variação de entalpia mássica está por quilograma.', calculo: 'm = ' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}' },
              { passo: 'Aplicar $Q = m \\Delta h$', porque: (fusao ? 'Fundir é passar de sólido a líquido: usa-se a variação de entalpia mássica de fusão.' : 'Vaporizar é passar de líquido a gasoso: usa-se a variação de entalpia mássica de vaporização.') + ' A temperatura não muda durante a mudança de estado.', calculo: 'Q = ' + tex(m) + ' \\times ' + hTex(dh) + eqI(m * dh) + '\\,\\mathrm{J}' + igual(Q) + texN(Q) + '\\,\\mathrm{kJ}' },
            ],
            dados: { contexto, m },
          };
          erros = [
            { codigo: fusao ? 'usou_entalpia_de_vaporizacao' : 'usou_entalpia_de_fusao', valor: (m * outra) / 1000, explicacao: (vt) => 'Usaste a variação de entalpia mássica de ' + (fusao ? 'vaporização' : 'fusão') + ' e obtiveste ' + vt((m * outra) / 1000, UN.kJ) + '. ' + (fusao ? 'Fundir é passar de sólido a líquido.' : 'Vaporizar é passar de líquido a gasoso.') },
            { codigo: 'massa_em_gramas', valor: (mg * dh) / 1000, explicacao: (vt) => 'Usaste a massa em gramas e obtiveste ' + vt((mg * dh) / 1000, UN.kJ) + '. A variação de entalpia mássica está por quilograma ($' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}$).' },
            { codigo: 'dividiu_em_vez_de_multiplicar', valor: dh / m / 1000, explicacao: (vt) => 'Dividiste $\\Delta h$ pela massa e obtiveste ' + vt(dh / m / 1000, UN.kJ) + '. A energia é $Q = m \\Delta h$: multiplica-se.' },
          ];
          verificacao = () => ({ passo: 'Com $\\Delta h$ em quilojoules por quilograma ($' + tex(dh / 1000) + '\\,\\mathrm{kJ\\,kg^{-1}}$)', calculo: 'Q = ' + tex(m) + ' \\times ' + tex(dh / 1000) + igual(m * (dh / 1000)) + texN(m * (dh / 1000)) + '\\,\\mathrm{kJ}', valor: Fis().calorFase(m, dh) / 1000 });
        } else {
          const m = entre(rng, 0.1, 1, 0.05);
          const t0 = -entre(rng, 2, 20, 1);
          const tF = entre(rng, 0, 60, 5);
          const trocos = Fis().aquecimentoGelo({ m, theta0: t0, thetaF: tF, P: 500, fundir: tF === 0 });
          const [Q1, Q2, Q3 = 0] = trocos.map((t) => t.Q);
          const Q = Q1 + Q2 + Q3;
          // o aquecimento (sem a fusão) não pode ser desprezável, senão «esqueceu a fusão» ficaria perto de 0
          if (Q - Q2 < 0.2 * Q) return null;
          exato = Q;
          unidade = 'J';
          u = UN.J;
          ex = {
            enunciado: 'Calcula a energia necessária para transformar ' + q(m, UN.kg) + ' de gelo a ' + temp(t0) + ' em água líquida a ' + temp(tF) + ', à pressão normal e sem perdas ($c_{\\text{gelo}} = ' + cTex(cG) + '\\,' + UN.cU + '$; $c_{\\text{água}} = ' + cTex(cA) + '\\,' + UN.cU + '$; ' + hF + ').',
            resolucao: [
              { passo: 'Aquecer o gelo até 0 °C', porque: 'Primeiro o gelo aquece, ainda sólido, com a capacidade térmica mássica do gelo.', calculo: 'Q_1 = ' + tex(m) + ' \\times ' + cTex(cG) + ' \\times ' + tex(-t0) + eqI(Q1) + '\\,\\mathrm{J}' },
              { passo: 'Fundir o gelo a 0 °C', porque: 'Durante a fusão a temperatura não muda: $Q_2 = m \\Delta h_{\\text{fusão}}$.', calculo: 'Q_2 = ' + tex(m) + ' \\times ' + hTex(H.fusaoGelo) + eqI(Q2) + '\\,\\mathrm{J}' },
            ].concat(tF > 0 ? [{ passo: 'Aquecer a água líquida', porque: 'A água de fusão aquece de 0 °C até ' + tex(tF) + ' °C, com a capacidade térmica mássica da água.', calculo: 'Q_3 = ' + tex(m) + ' \\times ' + cTex(cA) + ' \\times ' + tex(tF) + eqI(Q3) + '\\,\\mathrm{J}' }] : []).concat([
              { passo: 'Somar os troços', porque: 'A energia total é a soma das energias de cada troço da curva de aquecimento.', calculo: 'Q = ' + [Q1, Q2].concat(tF > 0 ? [Q3] : []).map(texI).join(' + ') + eqN(Q) + '\\,\\mathrm{J}' },
            ]),
            dados: { contexto, m, t0, tF },
            esquema: { id: 'fqa-aquecimento', opcoes: { m, theta0: t0, P: 500 } },
          };
          erros = [
            { codigo: 'esqueceu_a_fusao_no_balanco', valor: Q - Q2, explicacao: (vt) => 'Esqueceste a fusão e obtiveste ' + vt(Q - Q2, UN.J) + '. Para o gelo passar a água líquida é preciso ainda $m \\Delta h_{\\text{fusão}} = ' + texI(Q2) + '\\,\\mathrm{J}$.' },
            { codigo: 'usou_c_da_agua_para_o_gelo', valor: Q - Q1 + m * cA * -t0, explicacao: (vt) => 'Usaste a capacidade térmica mássica da água líquida para aquecer o gelo e obtiveste ' + vt(Q - Q1 + m * cA * -t0, UN.J) + '. Para o gelo, $c = ' + cTex(cG) + '\\,' + UN.cU + '$.' },
            { codigo: 'esqueceu_aquecer_o_gelo', valor: Q - Q1, explicacao: (vt) => 'Começaste pela fusão e obtiveste ' + vt(Q - Q1, UN.J) + '. O gelo está a ' + temp(t0) + ': primeiro tem de aquecer até 0 °C ($' + texI(Q1) + '\\,\\mathrm{J}$).' },
          ];
          if (tF > 0) erros.push({ codigo: 'esqueceu_aquecer_a_agua', valor: Q - Q3, explicacao: (vt) => 'Paraste na fusão e obtiveste ' + vt(Q - Q3, UN.J) + '. Falta aquecer a água de 0 °C até ' + tex(tF) + ' °C ($' + texI(Q3) + '\\,\\mathrm{J}$).' });
          verificacao = () => {
            const porKg = cG * -t0 + H.fusaoGelo + cA * tF;
            return { passo: 'Energia por quilograma de gelo e só depois a massa', calculo: cTex(cG) + ' \\times ' + tex(-t0) + ' + ' + hTex(H.fusaoGelo) + (tF > 0 ? ' + ' + cTex(cA) + ' \\times ' + tex(tF) : '') + eqI(porKg) + '\\,\\mathrm{J\\,kg^{-1}};\\ ' + texI(porKg) + ' \\times ' + tex(m) + eqN(porKg * m, exI(porKg)) + '\\,\\mathrm{J}', valor: porKg * m };
          };
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const H = Manual.dadosFisica.entalpiaMassica, C = Manual.dadosFisica.capacidadeTermicaMassica;
      if (d.contexto === 'fusao') return confereN(p, d.m * (H.fusaoGelo / 1000), UN.kJ);
      if (d.contexto === 'vaporizacao') return confereN(p, d.m * (H.vaporizacaoAgua / 1000), UN.kJ);
      return confereN(p, d.m * C.gelo * -d.t0 + d.m * H.fusaoGelo + d.m * C.agua * d.tF, UN.J);
    },
    limites(p) {
      const d = p.dados;
      return d.m > 0 && d.m <= 1 && (d.contexto !== 'gelo-agua' || (d.t0 < 0 && d.t0 >= -20 && d.tF >= 0 && d.tF <= 60));
    },
  });

  // Misturas num recipiente isolado (sem perdas e capacidade térmica do recipiente desprezável), com os valores do
  // esquema fqa-mistura (massas de 0,05 kg a 1 kg em passos de 0,05 kg; temperaturas de 0 °C a 100 °C em passos de 5 °C).
  const METAIS = MATERIAIS.filter((x) => x.id !== 'agua');

  registar({
    subtema: 'balancos', tipo: 'mistura', nome: 'Misturas e temperatura de equilíbrio (água, metal e gelo)',
    formatos: ['numerica', 'escolha'], contextos: ['agua-agua', 'agua-metal', 'agua-gelo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const cA = cDe('agua');
        const Lf = D().entalpiaMassica.fusaoGelo, Lv = D().entalpiaMassica.vaporizacaoAgua;
        const isolado = ', num recipiente isolado (sem perdas; despreza a capacidade térmica do recipiente)';
        let ex, exato, erros, verificacao, unidade = '°C', u = UN.C, dados, metal;
        const m1 = entre(rng, 0.1, 0.6, 0.05);
        const t1 = contexto === 'agua-agua' ? entre(rng, 0, 40, 5) : contexto === 'agua-metal' ? entre(rng, 15, 25, 5) : entre(rng, 20, 80, 5);
        const balanco = (t, corpos) => ({ passo: 'Balanço energético: $Q_{cedido} + Q_{recebido} = 0$', porque: 'Num sistema isolado, a energia que o corpo mais quente cede (Q < 0) é recebida pelo mais frio (Q > 0).', calculo: corpos.map((k, i) => 'Q_' + (i + 1) + ' = ' + tex(k.m) + ' \\times ' + cTex(k.c) + ' \\times ' + (t - k.t < 0 ? '(' + texI(t - k.t) + ')' : texI(t - k.t)) + eqI(k.m * k.c * (t - k.t), exI(t))).join(';\\ ') + '\\,\\mathrm{J}' });
        if (contexto === 'agua-agua' || contexto === 'agua-metal') {
          const ehMetal = contexto === 'agua-metal';
          metal = ehMetal ? escolher(rng, METAIS) : null;
          const c2 = ehMetal ? cDe(metal.id) : cA;
          const m2 = entre(rng, 0.1, ehMetal ? 1 : 0.6, 0.05);
          const t2 = ehMetal ? entre(rng, 80, 100, 5) : entre(rng, 50, 100, 5);
          if (!ehMetal && m1 === m2) return null;
          const r = Fis().mistura([{ m: m1, theta: t1, fase: 'agua' }, ehMetal ? { m: m2, c: c2, theta: t2 } : { m: m2, theta: t2, fase: 'agua' }]);
          const t = r.thetaEq;
          exato = t;
          ex = {
            enunciado: (ehMetal ? maiuscula(metal.corpo) + ' de ' + q(m2, UN.kg) + ', a ' + temp(t2) + ', é mergulhad' + (metal.corpo.startsWith('uma') ? 'a' : 'o') + ' em ' + q(m1, UN.kg) + ' de água a ' + temp(t1) : 'Misturam-se ' + q(m1, UN.kg) + ' de água a ' + temp(t1) + ' com ' + q(m2, UN.kg) + ' de água a ' + temp(t2)) + isolado + '. Calcula a temperatura de equilíbrio ($c_{\\text{água}} = ' + cTex(cA) + '\\,' + UN.cU + '$' + (ehMetal ? '; ' + cDado(metal) : '') + ').',
            resolucao: [
              { passo: 'Escrever o balanço', porque: 'O corpo mais quente cede energia e o mais frio recebe, até terem a mesma temperatura $\\theta$: $m_1 c_1 (\\theta - \\theta_1) + m_2 c_2 (\\theta - \\theta_2) = 0$.' },
              { passo: 'Isolar $\\theta$', porque: 'É uma média das temperaturas pesada por $m c$ de cada corpo.', calculo: '\\theta = \\dfrac{m_1 c_1 \\theta_1 + m_2 c_2 \\theta_2}{m_1 c_1 + m_2 c_2}' + (ehMetal
                ? ' = \\dfrac{' + tex(m1) + ' \\times ' + cTex(cA) + ' \\times ' + tex(t1) + ' + ' + tex(m2) + ' \\times ' + tex(c2) + ' \\times ' + tex(t2) + '}{' + tex(m1) + ' \\times ' + cTex(cA) + ' + ' + tex(m2) + ' \\times ' + tex(c2) + '}'
                : ' = \\dfrac{' + tex(m1) + ' \\times ' + tex(t1) + ' + ' + tex(m2) + ' \\times ' + tex(t2) + '}{' + tex(m1) + ' + ' + tex(m2) + '}') + igual(t) + texN(t) + '\\,' + UN.C },
            ],
          };
          dados = { tipo: contexto, m1, theta1: t1, m2, theta2: t2 };
          if (ehMetal) dados.metal = metal.id;
          const media = (t1 + t2) / 2;
          erros = [{ codigo: 'media_das_temperaturas_sem_massas', valor: media, explicacao: (vt) => vt(media, UN.C) + ' é a média simples das temperaturas. Cada corpo pesa na média conforme o seu $m c$.' }];
          if (ehMetal) {
            erros.push({ codigo: 'usou_c_da_agua_para_o_metal', valor: (m1 * t1 + m2 * t2) / (m1 + m2), explicacao: (vt) => 'Pesaste só pelas massas, como se o ' + metal.nome + ' tivesse a capacidade térmica mássica da água, e obtiveste ' + vt((m1 * t1 + m2 * t2) / (m1 + m2), UN.C) + '. O ' + metal.nome + ' tem $c$ muito menor, por isso a temperatura fica mais perto da da água.' });
            erros.push({ codigo: 'trocou_as_capacidades_termicas', valor: (m1 * c2 * t1 + m2 * cA * t2) / (m1 * c2 + m2 * cA), explicacao: (vt) => 'Trocaste as capacidades térmicas mássicas da água e do ' + metal.nome + ' e obtiveste ' + vt((m1 * c2 * t1 + m2 * cA * t2) / (m1 * c2 + m2 * cA), UN.C) + '.' });
          } else {
            erros.push({ codigo: 'trocou_as_massas', valor: (m2 * t1 + m1 * t2) / (m1 + m2), explicacao: (vt) => 'Trocaste as massas das duas porções de água e obtiveste ' + vt((m2 * t1 + m1 * t2) / (m1 + m2), UN.C) + '. A temperatura de equilíbrio fica mais perto da temperatura da porção maior.' });
            const sinal = (m1 * t1 - m2 * t2) / (m1 - m2);
            // só como água líquida plausível (0 °C a 100 °C)
            if (sinal > 0 && sinal < 100) erros.push({ codigo: 'sinais_do_balanco_trocados', valor: sinal, explicacao: (vt) => 'Igualaste $m_1 (\\theta - \\theta_1)$ a $m_2 (\\theta - \\theta_2)$, sem o sinal de menos, e obtiveste ' + vt(sinal, UN.C) + '. A energia cedida é negativa: $Q_1 + Q_2 = 0$.' });
          }
          const corpos = [{ m: m1, c: cA, t: t1 }, { m: m2, c: c2, t: t2 }];
          verificacao = () => Object.assign(balanco(t, corpos), { passo: 'As energias trocadas (com $\\theta$ por arredondar) têm de se anular: $Q_1 + Q_2 = 0$', valor: t });
        } else {
          const excesso = rng() < 0.5;
          const m2 = entre(rng, 0.05, 0.4, 0.05);
          const Qdisp = m1 * cA * t1;
          if (excesso !== Qdisp < m2 * Lf) return null;
          const r = Fis().mistura([{ m: m1, theta: t1, fase: 'agua' }, { m: m2, theta: 0, fase: 'gelo' }]);
          dados = { tipo: 'agua-gelo', m1, theta1: t1, m2, theta2: 0, excesso, thetaEq: r.thetaEq };
          const enun = 'Num recipiente isolado (sem perdas; despreza a capacidade térmica do recipiente) juntam-se ' + q(m2, UN.kg) + ' de gelo a $0\\,' + UN.C + '$ a ' + q(m1, UN.kg) + ' de água a ' + temp(t1) + ' ($c_{\\text{água}} = ' + cTex(cA) + '\\,' + UN.cU + '$; $\\Delta h_{\\text{fusão}} = ' + hTex(Lf) + '\\,' + UN.hU + '$). ';
          const passoComparar = { passo: 'O gelo funde todo?', porque: 'Compara-se a energia que a água pode ceder até 0 °C com a necessária para fundir todo o gelo.', calculo: 'Q_{\\text{água}} = ' + tex(m1) + ' \\times ' + cTex(cA) + ' \\times ' + tex(t1) + eqI(Qdisp) + '\\,\\mathrm{J};\\ Q_{\\text{fusão}} = ' + tex(m2) + ' \\times ' + hTex(Lf) + eqI(m2 * Lf) + '\\,\\mathrm{J}' };
          if (!excesso) {
            const t = r.thetaEq;
            if (t < 2) return null;
            exato = t;
            ex = {
              enunciado: enun + 'Calcula a temperatura de equilíbrio.',
              resolucao: [passoComparar, { passo: 'Todo o gelo funde e a água de fusão aquece', porque: 'Como $Q_{\\text{água}} > Q_{\\text{fusão}}$, todo o gelo funde e a mistura fica acima de 0 °C. Balanço: $m_2 \\Delta h + m_2 c\\,\\theta + m_1 c (\\theta - \\theta_1) = 0$.', calculo: '\\theta = \\dfrac{m_1 c \\theta_1 - m_2 \\Delta h}{(m_1 + m_2) c}' + igual(t) + texN(t) + '\\,' + UN.C }],
            };
            const sem = (m1 * t1) / (m1 + m2);
            const semAgua = (Qdisp - m2 * Lf) / (m1 * cA);
            const somou = (Qdisp + m2 * Lf) / ((m1 + m2) * cA);
            erros = [
              { codigo: 'esqueceu_a_fusao_no_balanco', valor: sem, explicacao: (vt) => 'Tratou-se o gelo como água a 0 °C e obtiveste ' + vt(sem, UN.C) + '. O gelo precisa primeiro de $m \\Delta h_{\\text{fusão}}$ para fundir.' },
              { codigo: 'esqueceu_aquecer_a_agua_de_fusao', valor: semAgua, explicacao: (vt) => 'Esqueceste que a água que resulta da fusão também aquece até $\\theta$ e obtiveste ' + vt(semAgua, UN.C) + '. No denominador entra a massa total, $m_1 + m_2$.' },
              { codigo: 'fusao_com_sinal_trocado', valor: somou <= 100 ? somou : NaN, explicacao: (vt) => 'Somaste a energia de fusão em vez de a subtrair e obtiveste ' + vt(somou, UN.C) + '. Fundir o gelo gasta energia que a água cede: a mistura fica mais fria.' },
            ];
            verificacao = () => ({ passo: 'Energia recebida pelo gelo (fusão e aquecimento até $\\theta$) e cedida pela água, com $\\theta$ por arredondar', calculo: 'Q_{gelo} = ' + tex(m2) + ' \\times ' + hTex(Lf) + ' + ' + tex(m2) + ' \\times ' + cTex(cA) + ' \\times ' + texI(t) + eqI(m2 * Lf + m2 * cA * t, false) + '\\,\\mathrm{J};\\ Q_{\\text{água}} = ' + tex(m1) + ' \\times ' + cTex(cA) + ' \\times (' + texI(t - t1) + ')' + eqI(m1 * cA * (t - t1), false) + '\\,\\mathrm{J}', valor: (Qdisp - m2 * Lf) / ((m1 + m2) * cA) });
          } else {
            const mf = (Qdisp / Lf) * 1000;
            exato = mf;
            unidade = 'g';
            u = UN.g;
            ex = {
              enunciado: enun + 'Mostra que nem todo o gelo funde e calcula a massa de gelo que funde, em gramas.',
              resolucao: [passoComparar, { passo: 'Há gelo em excesso', porque: 'Como $Q_{\\text{água}} < Q_{\\text{fusão}}$, a água arrefece até 0 °C sem fundir todo o gelo: a temperatura de equilíbrio é 0 °C, com gelo e água.', calculo: '\\theta_{eq} = 0\\,' + UN.C }, { passo: 'Massa de gelo que funde', porque: 'Funde a massa de gelo cuja fusão gasta a energia cedida pela água: $m_f \\Delta h = Q_{\\text{água}}$.', calculo: 'm_f = \\dfrac{' + texI(Qdisp) + '}{' + hTex(Lf) + '}' + eqI(Qdisp / Lf) + '\\,\\mathrm{kg}' + igual(mf) + texN(mf) + '\\,\\mathrm{g}' }],
            };
            erros = [
              { codigo: 'supos_que_todo_o_gelo_funde', valor: m2 * 1000, explicacao: (vt) => vt(m2 * 1000, UN.g) + ' é toda a massa de gelo. A água só tem energia para fundir uma parte: $m_f = Q_{\\text{água}}/\\Delta h_{\\text{fusão}}$.' },
              { codigo: 'usou_entalpia_de_vaporizacao', valor: (Qdisp / Lv) * 1000, explicacao: (vt) => 'Usaste a variação de entalpia mássica de vaporização e obtiveste ' + vt((Qdisp / Lv) * 1000, UN.g) + '. Fundir é passar de sólido a líquido.' },
              { codigo: 'usou_c_do_gelo_para_a_agua', valor: ((m1 * D().capacidadeTermicaMassica.gelo * t1) / Lf) * 1000, explicacao: (vt) => 'Usaste a capacidade térmica mássica do gelo para a água que arrefece e obtiveste ' + vt(((m1 * D().capacidadeTermicaMassica.gelo * t1) / Lf) * 1000, UN.g) + '. A água líquida tem $c = ' + cTex(cA) + '\\,' + UN.cU + '$.' },
              // só se a massa obtida não passar da massa de gelo (uma opção maior do que o gelo todo não é plausível)
              { codigo: 'somou_273_a_variacao', valor: (m1 * cA * (t1 + 273)) / Lf <= m2 ? ((m1 * cA * (t1 + 273)) / Lf) * 1000 : NaN, explicacao: (vt) => 'Somaste 273 à variação de temperatura da água e obtiveste ' + vt(((m1 * cA * (t1 + 273)) / Lf) * 1000, UN.g) + '. A água arrefece $' + tex(t1) + '\\,{}^{\\circ}\\mathrm{C}$, que é uma variação de $' + tex(t1) + '\\,\\mathrm{K}$.' },
            ];
            verificacao = () => ({ passo: 'Pela mistura calculada com o modelo: gelo derretido e temperatura final', calculo: '\\theta_{eq} = ' + tex(r.thetaEq) + '\\,' + UN.C + ';\\ m_f' + eqI(r.geloDerretido * 1000) + '\\,\\mathrm{g} < ' + tex(m2 * 1000) + '\\,\\mathrm{g}', valor: r.geloDerretido * 1000 });
          }
        }
        ex.dados = Object.assign({ contexto }, dados);
        ex.esquema = { id: 'fqa-mistura', opcoes: Object.assign({ tipo: dados.tipo, m1: dados.m1, theta1: dados.theta1, m2: dados.m2, theta2: dados.theta2 }, dados.metal ? { metal: dados.metal } : {}) };
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const C = Manual.dadosFisica.capacidadeTermicaMassica, Lf = Manual.dadosFisica.entalpiaMassica.fusaoGelo;
      if (d.contexto === 'agua-gelo') {
        const Qa = d.m1 * C.agua * d.theta1;
        if (d.excesso) return Qa < d.m2 * Lf && confereN(p, (Qa / Lf) * 1000, UN.g);
        // θ pela energia que sobra depois da fusão, repartida por toda a água
        return confereN(p, (Qa - d.m2 * Lf) / (C.agua * (d.m1 + d.m2)), UN.C);
      }
      const c2 = d.metal ? C[d.metal] : C.agua;
      return confereN(p, d.theta1 + (d.m2 * c2 * (d.theta2 - d.theta1)) / (d.m1 * C.agua + d.m2 * c2), UN.C);
    },
    limites(p) {
      const d = p.dados;
      const passo = (x, s) => Math.abs(x / s - Math.round(x / s)) < 1e-9;
      return [d.m1, d.m2].every((m) => m >= 0.05 && m <= 1 && passo(m, 0.05)) && [d.theta1, d.theta2].every((t) => t >= 0 && t <= 100 && passo(t, 5));
    },
  });

  // Primeira Lei: ΔU = W + Q + R, cada termo positivo quando o sistema recebe energia.
  registar({
    subtema: 'balancos', tipo: 'primeira-lei', nome: 'Primeira Lei da Termodinâmica e os sinais de W, Q e R',
    formatos: ['numerica', 'escolha'], contextos: ['expansao', 'compressao', 'radiacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const a = entre(rng, 200, 2000, 50);
        const b = entre(rng, 100, 1900, 50);
        let ex, erros, termos;
        if (contexto === 'expansao') {
          // o gás recebe Q = a e realiza o trabalho |W| = b sobre a vizinhança
          termos = { W: -b, Q: a, R: 0 };
          ex = { enunciado: 'Um gás num cilindro recebe ' + q(a, UN.J) + ' de energia como calor e, ao expandir-se, realiza ' + q(b, UN.J) + ' de trabalho sobre a vizinhança (empurra o êmbolo). Calcula a variação da energia interna do gás.' };
        } else if (contexto === 'compressao') {
          termos = { W: a, Q: -b, R: 0 };
          ex = { enunciado: 'Um gás num cilindro é comprimido: o êmbolo realiza sobre ele ' + q(a, UN.J) + ' de trabalho e, ao mesmo tempo, o gás cede ' + q(b, UN.J) + ' de energia como calor à vizinhança. Calcula a variação da energia interna do gás.' };
        } else {
          termos = { W: 0, Q: -b, R: a };
          ex = { enunciado: 'Uma pedra ao sol absorve ' + q(a, UN.J) + ' de energia da radiação solar e, no mesmo intervalo de tempo, cede ' + q(b, UN.J) + ' de energia como calor ao ar à sua volta. Calcula a variação da energia interna da pedra (despreza o trabalho).' };
        }
        const { W, Q, R } = termos;
        const dU = W + Q + R;
        if (Math.abs(dU) < 50) return null;
        const recebido = a, cedido = b;
        const lista = [['W', W], ['Q', Q], ['R', R]].filter((x) => x[1] !== 0);
        ex.resolucao = [
          { passo: 'Sinal de cada termo', porque: 'Na Primeira Lei, $\\Delta U = W + Q + R$, cada termo é positivo quando o sistema recebe energia e negativo quando a cede.', calculo: lista.map((x) => x[0] + ' = ' + tex(x[1]) + '\\,\\mathrm{J}').join(';\\ ') },
          { passo: 'Somar', porque: dU > 0 ? 'O sistema recebe mais energia do que cede: a energia interna aumenta.' : 'O sistema cede mais energia do que recebe: a energia interna diminui.', calculo: '\\Delta U = ' + lista.map((x) => par(x[1])).join(' + ') + ' = ' + tex(dU) + '\\,\\mathrm{J}' },
        ];
        ex.dados = { contexto, a, b };
        erros = [
          { codigo: 'sinais_da_primeira_lei_trocados', valor: -dU, explicacao: (vt) => 'Trocaste os sinais e obtiveste ' + vt(-dU, UN.J) + '. A energia recebida pelo sistema entra com sinal positivo e a cedida com sinal negativo.' },
          contexto === 'expansao'
            ? { codigo: 'trabalho_realizado_com_sinal_positivo', valor: a + b, explicacao: (vt) => 'Somaste o trabalho como positivo e obtiveste ' + vt(a + b, UN.J) + '. Quando o gás realiza trabalho sobre a vizinhança, cede energia: $W = ' + tex(-b) + '\\,\\mathrm{J}$.' }
            : { codigo: 'calor_cedido_com_sinal_positivo', valor: a + b, explicacao: (vt) => 'Somaste o calor cedido como positivo e obtiveste ' + vt(a + b, UN.J) + '. A energia que o sistema cede como calor entra com sinal negativo: $Q = ' + tex(-b) + '\\,\\mathrm{J}$.' },
          contexto === 'expansao'
            ? { codigo: 'esqueceu_o_trabalho_na_primeira_lei', valor: a, explicacao: (vt) => vt(a, UN.J) + ' é só o calor recebido. Falta o trabalho realizado pelo gás, $W = ' + tex(-b) + '\\,\\mathrm{J}$.' }
            : { codigo: 'esqueceu_o_calor_na_primeira_lei', valor: a, explicacao: (vt) => vt(a, UN.J) + ' é só a energia recebida (' + (contexto === 'compressao' ? 'trabalho' : 'radiação') + '). Falta o calor cedido, $Q = ' + tex(-b) + '\\,\\mathrm{J}$.' },
        ];
        const verificacao = () => ({ passo: 'Energia recebida menos energia cedida (em módulo)', calculo: tex(recebido) + ' - ' + tex(cedido) + ' = ' + tex(recebido - cedido) + '\\,\\mathrm{J}', valor: recebido - cedido });
        return fecharNum(rng, formato, ex, dU, { erros, unidade: 'J', u: UN.J, verificacao });
      });
    },
    verificarIndependente(p) {
      return confereN(p, p.dados.a - p.dados.b, UN.J);
    },
    limites(p) {
      return p.dados.a > 0 && p.dados.b > 0 && Math.abs(p.dados.a - p.dados.b) >= 50;
    },
  });

  // ================================================================ rendimento
  // Rendimentos plausíveis de cada tipo de aparelho (nunca acima de 100 %).
  // Potências plausíveis de cada aparelho: [nome, mínimo, máximo, passo] (W).
  const APARELHOS_P = [['Um berbequim', 400, 1000, 50], ['Um aspirador', 600, 2000, 100], ['Uma ventoinha', 30, 120, 10], ['Um motor elétrico', 200, 2000, 100]];
  // Regra 3 (opções plausíveis): na escolha, no máximo uma opção impossível (rendimento > 100 %), e nunca acima de 1000 %;
  // os erros vêm pela ordem de preferência, por isso fica o primeiro. Na numérica todos servem para reconhecer o erro.
  function umImpossivel(erros, formato) {
    if (formato !== 'escolha') return erros;
    let visto = false;
    return erros.filter((e) => {
      if (!(e.valor > 100)) return true;
      if (visto || e.valor > 1000) return false;
      visto = true;
      return true;
    });
  }
  const DISPOSITIVOS = [
    { nome: 'Um motor elétrico', forn: 'energia elétrica', util: 'energia mecânica útil', eta: [0.7, 0.95] },
    { nome: 'O motor a gasolina de um automóvel', forn: 'energia (libertada na combustão)', util: 'energia mecânica útil', eta: [0.2, 0.35] },
    { nome: 'Uma lâmpada LED', forn: 'energia elétrica', util: 'energia da luz visível emitida', eta: [0.25, 0.45] },
    { nome: 'Um coletor solar térmico', forn: 'energia da radiação solar', util: 'energia transferida para a água', eta: [0.4, 0.7] },
    { nome: 'Uma central termoelétrica', forn: 'energia (libertada na combustão)', util: 'energia elétrica produzida', eta: [0.3, 0.45] },
  ];

  registar({
    subtema: 'rendimento', tipo: 'energia', nome: 'Rendimento e energia dissipada (aparelhos e aquecimento de água)',
    formatos: ['numerica', 'escolha'], contextos: ['rendimento', 'dissipada', 'chaleira'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ex, exato, erros, verificacao, unidade = '%', u = UN.pct;
        if (contexto === 'rendimento') {
          const d = escolher(rng, DISPOSITIVOS);
          const Ef = entre(rng, 1000, 9000, 500);
          const Eu = Math.round((Ef * entre(rng, d.eta[0], d.eta[1], 0.01)) / 10) * 10;
          const eta = Eu / Ef;
          if (eta < d.eta[0] || eta > d.eta[1] || Math.abs(eta - 0.5) < 1e-9) return null;
          const Ed = Ef - Eu;
          exato = eta * 100;
          ex = {
            enunciado: d.nome + ' recebe ' + q(Ef, UN.J) + ' de ' + d.forn + ' e fornece ' + q(Eu, UN.J) + ' de ' + d.util + '. Calcula o seu rendimento, em percentagem.',
            resolucao: [{ passo: 'Rendimento', porque: 'O rendimento é a fração da energia fornecida que é útil, $\\eta = E_{\\text{útil}}/E_{fornecida}$. O resto é dissipado (sobretudo como energia térmica), por isso $\\eta < 100\\,\\%$.', calculo: '\\eta = \\dfrac{' + tex(Eu) + '}{' + tex(Ef) + '} \\times 100' + igual(exato) + texN(exato) + '\\,\\%' }],
            dados: { contexto, Ef, Eu },
          };
          erros = [
            { codigo: 'rendimento_maior_do_que_1', valor: (Ef / Eu) * 100, explicacao: (vt) => 'Calculaste $E_{fornecida}/E_{\\text{útil}}$ e obtiveste ' + vt((Ef / Eu) * 100, UN.pct) + ': dividiste ao contrário. O rendimento nunca passa de 100 %.' },
            { codigo: 'deu_a_fracao_dissipada', valor: (Ed / Ef) * 100, explicacao: (vt) => vt((Ed / Ef) * 100, UN.pct) + ' é a fração dissipada ($' + tex(Ed) + '\\,\\mathrm{J}$ em $' + tex(Ef) + '\\,\\mathrm{J}$). O rendimento é a fração útil.' },
            { codigo: 'dividiu_pela_energia_dissipada', valor: (Eu / Ed) * 100, explicacao: (vt) => 'Dividiste a energia útil pela dissipada e obtiveste ' + vt((Eu / Ed) * 100, UN.pct) + '. O rendimento compara a energia útil com a fornecida (toda a energia recebida) e nunca passa de 100 %.' },
          ];
          verificacao = () => ({ passo: 'Pela energia dissipada: $\\eta = 1 - E_{diss}/E_{fornecida}$', calculo: 'E_{diss} = ' + tex(Ef) + ' - ' + tex(Eu) + ' = ' + tex(Ed) + '\\,\\mathrm{J};\\ \\left(1 - \\dfrac{' + tex(Ed) + '}{' + tex(Ef) + '}\\right) \\times 100' + igual((1 - Ed / Ef) * 100) + texN((1 - Ed / Ef) * 100) + '\\,\\%', valor: Fis().rendimento(Eu, Ef) * 100 });
        } else if (contexto === 'dissipada') {
          // cada aparelho com a sua gama de potências (regra 16)
          const [ap, Pmin, Pmax, Ppasso] = escolher(rng, APARELHOS_P);
          const P = entre(rng, Pmin, Pmax, Ppasso);
          const etaP = entre(rng, 60, 95, 5);
          const eta = etaP / 100;
          const tmin = escolher(rng, [1, 2, 5, 10]);
          const ts = tmin * 60;
          const Ef = P * ts;
          const Ed = A.limpo(Ef * (1 - eta));
          exato = Ed;
          unidade = 'J';
          u = UN.J;
          ex = {
            enunciado: ap + ' de potência ' + q(P, UN.W) + ', com rendimento de ' + percentagem(etaP) + ', funciona durante ' + q(tmin, UN.min) + '. Calcula a energia dissipada nesse tempo.',
            resolucao: [
              { passo: 'Energia fornecida', porque: '$E = P\\,\\Delta t$, com o tempo em segundos ($' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$).', calculo: 'E_{forn} = ' + tex(P) + ' \\times ' + tex(ts) + ' = ' + texI(Ef) + '\\,\\mathrm{J}' },
              { passo: 'Energia dissipada', porque: 'Se ' + etaP + ' % da energia é útil, os outros ' + (100 - etaP) + ' % são dissipados.', calculo: 'E_{diss} = ' + tex(A.limpo(1 - eta)) + ' \\times ' + texI(Ef) + igual(Ed) + texN(Ed) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, P, etaP, tmin },
          };
          erros = [
            { codigo: 'deu_energia_util_em_vez_de_dissipada', valor: Ef * eta, explicacao: (vt) => vt(Ef * eta, UN.J) + ' é a energia útil (' + etaP + ' %). A dissipada é o resto, ' + (100 - etaP) + ' % da energia fornecida.' },
            { codigo: 'tempo_em_minutos', valor: P * tmin * (1 - eta), explicacao: (vt) => 'Usaste o tempo em minutos e obtiveste ' + vt(P * tmin * (1 - eta), UN.J) + '. Em joules o tempo está em segundos: $' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$.' },
            { codigo: 'deu_a_energia_fornecida', valor: Ef, explicacao: (vt) => vt(Ef, UN.J) + ' é toda a energia fornecida. Só ' + (100 - etaP) + ' % dela é dissipada.' },
            { codigo: 'confundiu_potencia_com_energia', valor: P * (1 - eta), explicacao: (vt) => vt(P * (1 - eta)) + ' é a potência dissipada (em watts), não a energia. Multiplica-se pelo tempo.' },
          ];
          verificacao = () => ({ passo: 'Pela diferença entre a energia fornecida e a útil', calculo: texI(Ef) + ' - ' + texI(Ef * eta) + eqN(Ef - Ef * eta, exI(Ef * eta)) + '\\,\\mathrm{J}', valor: Ef - Ef * eta });
        } else {
          const cA = cDe('agua');
          const P = escolher(rng, [1500, 1800, 2000, 2200, 2400]);
          const m = entre(rng, 0.5, 1.7, 0.1);
          const ti = entre(rng, 15, 25, 1);
          const tf = escolher(rng, [80, 90, 100]);
          const tmin = entre(rng, 1.5, 10, 0.5);
          const ts = tmin * 60;
          const Qu = m * cA * (tf - ti);
          const Ef = P * ts;
          const eta = Qu / Ef;
          if (eta < 0.6 || eta > 0.95) return null;
          exato = eta * 100;
          ex = {
            enunciado: 'Uma chaleira elétrica de ' + q(P, UN.W) + ' aquece ' + q(m, UN.kg) + ' de água de ' + temp(ti) + ' até ' + temp(tf) + ' em ' + q(tmin, UN.min) + ' ($c_{\\text{água}} = ' + cTex(cA) + '\\,' + UN.cU + '$). Calcula o rendimento da chaleira, em percentagem.',
            resolucao: [
              { passo: 'Energia útil', porque: 'É a energia que a água recebe ao aquecer, $Q = m c \\Delta\\theta$.', calculo: 'E_{\\text{útil}} = ' + tex(m) + ' \\times ' + cTex(cA) + ' \\times ' + tex(tf - ti) + eqI(Qu) + '\\,\\mathrm{J}' },
              { passo: 'Energia fornecida', porque: '$E = P\\,\\Delta t$, com o tempo em segundos ($' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$).', calculo: 'E_{forn} = ' + tex(P) + ' \\times ' + tex(ts) + ' = ' + texI(Ef) + '\\,\\mathrm{J}' },
              { passo: 'Rendimento', porque: '$\\eta = E_{\\text{útil}}/E_{forn}$; parte da energia aquece a própria chaleira e o ar.', calculo: '\\eta = \\dfrac{' + texI(Qu) + '}{' + texI(Ef) + '} \\times 100' + eqN(exato, exI(Qu)) + '\\,\\%' },
            ],
            dados: { contexto, P, m, ti, tf, tmin },
          };
          // por ordem de preferência: na escolha fica no máximo um valor impossível (umImpossivel)
          erros = [
            { codigo: 'rendimento_maior_do_que_1', valor: (Ef / Qu) * 100, explicacao: (vt) => 'Calculaste $E_{forn}/E_{\\text{útil}}$ e obtiveste ' + vt((Ef / Qu) * 100, UN.pct) + ': dividiste ao contrário. O rendimento nunca passa de 100 %.' },
            { codigo: 'deu_a_fracao_dissipada', valor: (1 - eta) * 100, explicacao: (vt) => vt((1 - eta) * 100, UN.pct) + ' é a fração da energia fornecida que não aqueceu a água (aqueceu a chaleira e o ar). O rendimento é a fração útil.' },
            { codigo: 'converteu_minutos_em_segundos_com_3600', valor: (Qu / (P * tmin * 3600)) * 100, explicacao: (vt) => 'Passaste os minutos a segundos multiplicando por 3600 e obtiveste ' + vt((Qu / (P * tmin * 3600)) * 100, UN.pct) + '. Um minuto tem 60 s ($3600\\,\\mathrm{s}$ é uma hora).' },
            { codigo: 'usou_temperatura_final_em_vez_da_variacao', valor: ((m * cA * tf) / Ef) * 100, explicacao: (vt) => 'Usaste a temperatura final em vez da variação e obtiveste ' + vt(((m * cA * tf) / Ef) * 100, UN.pct) + '. A água aquece só $' + tex(tf - ti) + '\\,{}^{\\circ}\\mathrm{C}$, e o rendimento nunca passa de 100 %.' },
            { codigo: 'tempo_em_minutos', valor: (Qu / (P * tmin)) * 100, explicacao: (vt) => 'Usaste o tempo em minutos e obtiveste ' + vt((Qu / (P * tmin)) * 100, UN.pct) + ', mais de 100 %, o que é impossível. Em joules o tempo está em segundos.' },
          ];
          verificacao = () => ({ passo: 'Pelas potências: potência útil média $E_{\\text{útil}}/\\Delta t$ comparada com a potência da chaleira', calculo: '\\dfrac{' + texI(Qu) + '}{' + tex(ts) + '}' + eqI(Qu / ts, exI(Qu)) + '\\,\\mathrm{W};\\ \\dfrac{' + texI(Qu / ts) + '}{' + tex(P) + '} \\times 100' + eqN((Qu / ts / P) * 100, exI(Qu / ts)) + '\\,\\%', valor: Fis().rendimento(Fis().calor(m, cA, tf - ti), Ef) * 100 });
        }
        if (unidade === '%') erros = umImpossivel(erros, formato);
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'rendimento') return confereN(p, 100 - ((d.Ef - d.Eu) / d.Ef) * 100, UN.pct);
      if (d.contexto === 'dissipada') return confereN(p, d.P * d.tmin * 60 - d.P * d.tmin * 60 * (d.etaP / 100), UN.J);
      return confereN(p, ((d.m * Manual.dadosFisica.capacidadeTermicaMassica.agua * (d.tf - d.ti)) / (d.tmin * 60) / d.P) * 100, UN.pct);
    },
    limites(p) {
      const d = p.dados;
      if (d.contexto === 'rendimento') return d.Eu < d.Ef;
      if (d.contexto === 'dissipada') return d.etaP > 0 && d.etaP < 100;
      const eta = (d.m * Manual.dadosFisica.capacidadeTermicaMassica.agua * (d.tf - d.ti)) / (d.P * d.tmin * 60);
      return eta > 0 && eta <= 0.95;
    },
  });

  // AL do painel fotovoltaico: pontos (U, I) do painel modelo (Manual.dadosFisica.modelos.painel) para várias resistências
  // de carga, com U e I arredondadas às milésimas, como numa medição, e todas escritas com essas três casas (U ≥ 0,4 V e
  // I ≥ 0,1 A, por isso têm pelo menos 3 a.s.). P = U I de cada ponto é exata.
  const CARGAS = [2, 4, 6, 8, 10, 12, 15, 20, 30, 50];
  const mil = (v) => v.toFixed(3).replace('.', '{,}');
  const ptT = (x) => '$R = ' + dado(x.R) + '\\,\\Omega$, $U = ' + mil(x.U) + '\\,\\mathrm{V}$ e $I = ' + mil(x.I) + '\\,\\mathrm{A}$';

  registar({
    subtema: 'rendimento', tipo: 'painel-maximo', nome: 'Painel fotovoltaico: potência de cada ponto e ponto de potência máxima',
    formatos: ['numerica', 'escolha'], contextos: ['potencia-maxima', 'resistencia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const Gi = escolher(rng, [400, 600, 800, 1000]);
        const Rs = baralhar(rng, CARGAS).slice(0, 6).sort((a, b) => a - b);
        const pts = Rs.map((R) => {
          const f = Fis().painel({ irradiancia: Gi, Rcarga: R });
          const U = Math.round(f.U * 1000) / 1000, I = Math.round(f.I * 1000) / 1000;
          return { R, U, I, P: A.limpo(U * I) };
        });
        if (pts.some((x) => x.I < 0.005)) return null;
        let k = 0;
        pts.forEach((x, i) => { if (x.P > pts[k].P) k = i; });
        const outros = pts.filter((x, i) => i !== k).map((x) => x.P);
        if (k === 0 || k === pts.length - 1 || pts[k].P < 1.01 * Math.max(...outros)) return null;
        const mx = pts[k], ab = pts[pts.length - 1], cc = pts[0];
        const enunciado = 'Numa atividade laboratorial, um pequeno painel fotovoltaico, iluminado com irradiância constante, foi ligado a várias resistências de carga. Os valores medidos foram ' + pts.map(ptT).join('; ') + '. ';
        const passoP = { passo: 'Potência em cada ponto', porque: 'A potência fornecida pelo painel é $P = U I$; calcula-se para cada resistência de carga.', calculo: pts.map((x, i) => 'P_' + (i + 1) + ' = ' + mil(x.U) + ' \\times ' + mil(x.I) + igual(x.P) + texN(x.P)).join(';\\ ') + '\\,\\mathrm{W}' };
        const passoMax = { passo: 'Ponto de potência máxima', porque: 'A potência é nula nos extremos da curva (em curto-circuito $U = 0$; em circuito aberto $I = 0$) e é máxima num ponto intermédio, aqui com $R = ' + dado(mx.R) + '\\,\\Omega$ e $P' + igual(mx.P) + texN(mx.P) + '\\,\\mathrm{W}$.' };
        let ex, exato, erros, unidade, u;
        if (contexto === 'potencia-maxima') {
          exato = mx.P;
          unidade = 'W';
          u = UN.W;
          ex = { enunciado: enunciado + 'Qual é a maior potência fornecida pelo painel nestas medições?', resolucao: [passoP, passoMax] };
          erros = [
            { codigo: 'potencia_maxima_em_circuito_aberto', valor: ab.P, explicacao: (vt) => vt(ab.P, UN.W) + ' é a potência no ponto de maior $U$ (perto do circuito aberto), onde a corrente já é pequena. O máximo fica num ponto intermédio.' },
            { codigo: 'potencia_maxima_em_curto_circuito', valor: cc.P, explicacao: (vt) => vt(cc.P, UN.W) + ' é a potência no ponto de maior corrente (perto do curto-circuito), onde $U$ é pequena. O máximo fica num ponto intermédio.' },
            { codigo: 'potencia_maxima_como_umax_vezes_imax', valor: ab.U * cc.I, explicacao: (vt) => 'Multiplicaste a maior tensão pela maior corrente e obtiveste ' + vt(ab.U * cc.I, UN.W) + '. Esses valores não acontecem no mesmo ponto: a potência calcula-se ponto a ponto.' },
          ];
        } else {
          exato = mx.R;
          unidade = 'Ω';
          u = '\\Omega';
          ex = { enunciado: enunciado + 'Com que resistência de carga é máxima a potência fornecida pelo painel?', resolucao: [passoP, passoMax] };
          erros = [
            { codigo: 'potencia_maxima_em_circuito_aberto', valor: ab.R, explicacao: (vt) => 'Com ' + vt(ab.R, '\\Omega') + ' a diferença de potencial é a maior, mas a corrente é pequena: $P = ' + mil(ab.U) + ' \\times ' + mil(ab.I) + '$ não é o máximo.' },
            { codigo: 'potencia_maxima_em_curto_circuito', valor: cc.R, explicacao: (vt) => 'Com ' + vt(cc.R, '\\Omega') + ' a corrente é a maior, mas a diferença de potencial é pequena: $P = ' + mil(cc.U) + ' \\times ' + mil(cc.I) + '$ não é o máximo.' },
            { codigo: 'calculou_a_potencia_em_vez_da_resistencia', valor: mx.P, explicacao: (vt) => 'Obtiveste ' + vt(mx.P) + ', que é a potência máxima (em watts). Pede-se a resistência de carga desse ponto.' },
          ];
        }
        const verificacao = () => ({ passo: 'Comparar com os pontos vizinhos: a potência sobe até esse ponto e depois desce', calculo: 'P_' + k + igual(pts[k - 1].P) + texN(pts[k - 1].P) + ' < P_' + (k + 1) + igual(mx.P) + texN(mx.P) + ' > P_' + (k + 2) + igual(pts[k + 1].P) + texN(pts[k + 1].P) + '\\,\\mathrm{W}', valor: contexto === 'resistencia' ? mx.R : Math.max(...pts.map((x) => x.U * x.I)) });
        ex.dados = { contexto, G: Gi, pontos: pts.map((x) => [x.R, x.U, x.I]) };
        ex.esquema = { id: 'fqa-painel', opcoes: { G: Gi, Rcarga: mx.R } };
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const pts = p.dados.pontos.map(([R, U, I]) => ({ R, P: U * I }));
      const mx = pts.reduce((a, x) => (x.P > a.P ? x : a));
      return p.dados.contexto === 'resistencia' ? confereN(p, mx.R, '\\Omega') : confereN(p, mx.P, UN.W);
    },
    limites(p) {
      return p.dados.pontos.length === 6 && p.dados.pontos.every(([R, U, I]) => R > 0 && U > 0 && I > 0);
    },
  });

  registar({
    subtema: 'rendimento', tipo: 'painel', nome: 'Rendimento de um painel fotovoltaico (irradiância × área)',
    formatos: ['numerica', 'escolha'], contextos: ['rendimento', 'potencia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const Ar = entre(rng, 1.6, 2, 0.1);
        const Gi = entre(rng, 600, 1000, 50);
        const Pin = A.limpo(Gi * Ar);
        let ex, exato, erros, verificacao, unidade, u;
        const passoInc = { passo: 'Potência da radiação incidente', porque: 'A irradiância é a potência da radiação por unidade de área: a potência que chega ao painel é $G A$.', calculo: 'P_{inc} = ' + tex(Gi) + ' \\times ' + tex(Ar) + ' = ' + tex(Pin) + '\\,\\mathrm{W}' };
        if (contexto === 'rendimento') {
          const P = Math.round(Pin * entre(rng, 0.15, 0.22, 0.01));
          const eta = P / Pin;
          if (eta < 0.14 || eta > 0.23) return null;
          exato = eta * 100;
          unidade = '%';
          u = UN.pct;
          ex = {
            enunciado: 'Um painel fotovoltaico com ' + q(Ar, UN.m2) + ' de área, iluminado com uma irradiância de ' + q(Gi, UN.Wm2) + ', fornece uma potência elétrica de ' + q(P, UN.W) + '. Calcula o rendimento do painel, em percentagem.',
            resolucao: [passoInc, { passo: 'Rendimento', porque: '$\\eta = P_{\\text{elétrica}}/P_{inc}$: só uma pequena parte da energia da radiação passa a energia elétrica.', calculo: '\\eta = \\dfrac{' + tex(P) + '}{' + tex(Pin) + '} \\times 100' + igual(exato) + texN(exato) + '\\,\\%' }],
            dados: { contexto, A: Ar, G: Gi, P },
          };
          erros = [
            { codigo: 'esqueceu_a_area_do_painel', valor: (P / Gi) * 100, explicacao: (vt) => 'Dividiste a potência pela irradiância e obtiveste ' + vt((P / Gi) * 100, UN.pct) + ', esquecendo a área. A potência incidente é $G A = ' + tex(Pin) + '\\,\\mathrm{W}$.' },
            { codigo: 'rendimento_maior_do_que_1', valor: (Pin / P) * 100, explicacao: (vt) => 'Calculaste $P_{inc}/P_{\\text{elétrica}}$ e obtiveste ' + vt((Pin / P) * 100, UN.pct) + ': dividiste ao contrário. O rendimento nunca passa de 100 %.' },
            { codigo: 'deu_a_fracao_dissipada', valor: 100 - eta * 100, explicacao: (vt) => vt(100 - eta * 100, UN.pct) + ' é a fração da energia incidente que não passa a energia elétrica. O rendimento é a fração útil.' },
          ];
          verificacao = () => ({ passo: 'Por metro quadrado: potência elétrica por unidade de área comparada com a irradiância', calculo: '\\dfrac{' + tex(P) + '}{' + tex(Ar) + '}' + eqI(P / Ar) + '\\,\\mathrm{W\\,m^{-2}};\\ \\dfrac{' + texI(P / Ar) + '}{' + tex(Gi) + '} \\times 100' + eqN((P / Ar / Gi) * 100, exI(P / Ar)) + '\\,\\%', valor: Fis().rendimento(P, Pin) * 100 });
        } else {
          const etaP = entre(rng, 15, 22, 1);
          const P = (etaP / 100) * Pin;
          exato = P;
          unidade = 'W';
          u = UN.W;
          ex = {
            enunciado: 'Um painel fotovoltaico com ' + q(Ar, UN.m2) + ' de área e rendimento de ' + percentagem(etaP) + ' está iluminado com uma irradiância de ' + q(Gi, UN.Wm2) + '. Calcula a potência elétrica que fornece.',
            resolucao: [passoInc, { passo: 'Potência elétrica', porque: 'O rendimento é a fração da potência incidente que passa a potência elétrica: $P = \\eta\\,G A$.', calculo: 'P = ' + tex(etaP / 100) + ' \\times ' + tex(Pin) + igual(P) + texN(P) + '\\,\\mathrm{W}' }],
            dados: { contexto, A: Ar, G: Gi, etaP },
          };
          erros = [
            { codigo: 'nao_dividiu_a_percentagem_por_100', valor: etaP * Pin, explicacao: (vt) => 'Usaste o rendimento como $' + etaP + '$ em vez de $' + tex(etaP / 100) + '$ e obtiveste ' + vt(etaP * Pin, UN.W) + '. A percentagem divide-se por 100: ' + etaP + ' % = $' + tex(etaP / 100) + '$.' },
            { codigo: 'esqueceu_a_area_do_painel', valor: (etaP / 100) * Gi, explicacao: (vt) => 'Esqueceste a área e obtiveste ' + vt((etaP / 100) * Gi, UN.W) + ' (é a potência por metro quadrado). Multiplica-se ainda por $' + tex(Ar) + '\\,\\mathrm{m^2}$.' },
            { codigo: 'deu_a_potencia_da_radiacao_incidente', valor: Pin, explicacao: (vt) => vt(Pin, UN.W) + ' é a potência da radiação que chega ao painel. Só ' + etaP + ' % dela passa a potência elétrica.' },
          ];
          verificacao = () => ({ passo: 'Primeiro por metro quadrado ($\\eta G$) e depois pela área', calculo: tex(etaP / 100) + ' \\times ' + tex(Gi) + eqI((etaP / 100) * Gi) + '\\,\\mathrm{W\\,m^{-2}};\\ ' + texI((etaP / 100) * Gi) + ' \\times ' + tex(Ar) + eqN((etaP / 100) * Gi * Ar, exI((etaP / 100) * Gi)) + '\\,\\mathrm{W}', valor: (etaP / 100) * Gi * Ar });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'rendimento') return confereN(p, ((d.P / d.A) / d.G) * 100, UN.pct);
      return confereN(p, ((d.etaP * d.G) / 100) * d.A, UN.W);
    },
    limites(p) {
      const d = p.dados;
      const eta = d.contexto === 'rendimento' ? d.P / (d.G * d.A) : d.etaP / 100;
      return eta > 0.1 && eta < 0.25 && d.A <= 2 && d.G <= 1000;
    },
  });
})();
