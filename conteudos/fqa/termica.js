globalThis.Manual = globalThis.Manual || {};

// Física e Química A — Física: tema «Energia, fenómenos térmicos e radiação».
// Capacidades térmicas mássicas, entalpias mássicas e temperaturas de mudança de estado vêm de Manual.dadosFisica (fontes
// no próprio ficheiro de dados); o painel fotovoltaico é o modelo ilustrativo de Manual.dadosFisica.modelos.painel.
// Os resultados dos exemplos e das perguntas numéricas são confirmados pelo validador com Manual.fisica (verificar).
// Convenção: ΔU = W + Q + R, com cada termo positivo quando o sistema recebe energia.
(function () {
  const D = Manual.dadosFisica;
  const F = Manual.fisica;
  const C = D.capacidadeTermicaMassica;
  const H = D.entalpiaMassica;
  const PAINEL = D.modelos.painel;

  // número com vírgula decimal: em KaTeX ({,}) e em texto corrido (,)
  const dec = (x, casas) => x.toFixed(casas).replace('.', '{,}');
  const decT = (x, casas) => x.toFixed(casas).replace('.', ',').replace('-', '−');
  // notação científica em KaTeX, mantissa em [1, 10) com `as` algarismos significativos
  const cient = (x, as) => {
    const [m, e] = x.toExponential(as - 1).split('e');
    return m.replace('.', '{,}') + ' \\times 10^{' + Number(e) + '}';
  };
  // arredonda a `casas` casas decimais sem o artefacto de vírgula flutuante
  const arred = (x, casas) => Math.round((x + Math.sign(x) * 1e-9) * 10 ** casas) / 10 ** casas;
  const soma = (xs) => xs.reduce((a, x) => a + x, 0);
  // valores de referência escritos para KaTeX (4,18 × 10³, 900, …)
  const cA = C.agua, cG = C.gelo, cAl = C.aluminio;
  // algarismos significativos do valor de referência (4180 → 3; 2100 → 2), para não inventar zeros
  const cTex = (c) => (c >= 1000 ? cient(c, String(c).replace(/0+$/, '').length) : String(c));
  // inteiro com espaço fino nos milhares a partir de 10 000 (20 900 J)
  const mil = (x) => (Math.abs(x) >= 10000 ? String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : String(Math.round(x)));
  const unC = '\\,\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}';
  const unH = '\\,\\mathrm{J\\,kg^{-1}}';

  // reta de mínimos quadrados y = declive x + ordenada
  const reta = (xs, ys) => {
    const n = xs.length;
    const sx = soma(xs), sy = soma(ys);
    const sxy = soma(xs.map((x, i) => x * ys[i])), sxx = soma(xs.map((x) => x * x));
    const declive = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return { declive, ordenada: (sy - declive * sx) / n };
  };

  // Curva de aquecimento: 0,50 kg de gelo a −20 °C até água a 100 °C, com 500 W (sem perdas).
  const CURVA = F.aquecimentoGelo({ m: 0.5, theta0: -20, thetaF: 100, P: 500 });
  const CURVA_Q = soma(CURVA.map((t) => t.Q));
  const CURVA_T = CURVA[CURVA.length - 1].t1;

  // Misturas em recipiente isolado.
  const MIX = F.mistura([{ m: 0.2, theta: 20, fase: 'agua' }, { m: 0.1, theta: 80, fase: 'agua' }]);
  const MIXG = F.mistura([{ m: 0.3, theta: 50, fase: 'agua' }, { m: 0.05, theta: 0, fase: 'gelo' }]);

  // AL «capacidade térmica mássica»: bloco de alumínio de 1,000 kg aquecido por uma resistência (U = 12,0 V, I = 2,50 A).
  // Temperaturas ilustrativas a cada 120 s; reta de mínimos quadrados θ(t); c = P / (m × declive).
  const ALC = { m: 1, U: 12, I: 2.5, t: [0, 120, 240, 360, 480, 600], theta: [18.0, 21.8, 25.6, 29.5, 33.3, 37.1] };
  ALC.P = ALC.U * ALC.I;
  ALC.reta = reta(ALC.t, ALC.theta);
  ALC.c = ALC.P / (ALC.m * ALC.reta.declive);
  ALC.erro = Math.abs(ALC.c - cAl) / cAl * 100;

  // AL «entalpia mássica de fusão do gelo»: 0,200 kg de água a 40,0 °C e 0,040 kg de gelo a 0 °C num calorímetro.
  // θeq medida (ilustrativa) 21,0 °C; a prevista sem perdas vem de Manual.fisica.mistura.
  const ALH = { ma: 0.2, thetaA: 40, mg: 0.04, thetaEq: 21 };
  ALH.prevista = F.mistura([{ m: ALH.ma, theta: ALH.thetaA, fase: 'agua' }, { m: ALH.mg, theta: 0, fase: 'gelo' }]).thetaEq;
  ALH.cedida = -F.calor(ALH.ma, cA, ALH.thetaEq - ALH.thetaA); // energia cedida pela água morna (> 0)
  ALH.aquecer = F.calor(ALH.mg, cA, ALH.thetaEq - 0); // aquecimento da água de fusão, de 0 °C a θeq
  ALH.dh = (ALH.cedida - ALH.aquecer) / ALH.mg;
  ALH.erro = Math.abs(ALH.dh - H.fusaoGelo) / H.fusaoGelo * 100;

  // Painel fotovoltaico (modelo): pontos de funcionamento a 1000 W m⁻² para várias resistências de carga e potência máxima.
  const G0 = PAINEL.irradianciaReferencia;
  const PONTOS = [2, 5, 8, 10, 12, 15, 20, 40].map((R) => Object.assign({ R }, F.painel({ irradiancia: G0, Rcarga: R })));
  const MAX = F.painelPotenciaMaxima(G0);
  const MAX500 = F.painelPotenciaMaxima(500);
  const PINC = G0 * PAINEL.area; // potência da radiação incidente, W

  Manual.registarTema('fqa', {
    id: 'termica',
    titulo: 'Energia, fenómenos térmicos e radiação',
    subtemas: [
      // ------------------------------------------------------------------
      {
        id: 'transferencias',
        titulo: 'Sistemas termodinâmicos e transferências de energia',
        ae: [
          'Compreender os processos e os mecanismos de transferências de energia em sistemas termodinâmicos.',
          'Distinguir, na transferência de energia por calor, a radiação da condução e da convecção.',
          'Explicitar que todos os corpos emitem radiação e que à temperatura ambiente emitem predominantemente no infravermelho, dando exemplos de aplicação.',
          'Identificar a temperatura como a propriedade que determina se um sistema está ou não em equilíbrio térmico com outros e reconhecer que o aumento da temperatura de um sistema implica, em geral, um aumento da energia cinética média das suas partículas.',
          'Identificar calor como a energia transferida espontaneamente entre sistemas a diferentes temperaturas.',
        ],
        minutos: 14,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'Um **sistema termodinâmico** é um sistema com um número enorme de partículas (um gás num cilindro, a água de uma panela), em que interessa a sua **energia interna**. Pode ser **isolado** (não troca energia nem matéria com a vizinhança), **fechado** (troca energia, mas não matéria) ou **aberto** (troca energia e matéria).',
          },
          {
            tipo: 'definicao',
            texto: 'A **energia interna** $U$ de um sistema é a soma das energias das suas partículas: a energia cinética (do movimento de agitação) e a energia potencial (das interações entre elas). Aumenta com a massa e com a temperatura e muda nas mudanças de estado.',
          },
          {
            tipo: 'definicao',
            texto: 'A **temperatura** é a propriedade que determina se um sistema está ou não em **equilíbrio térmico** com outros: dois sistemas em contacto estão em equilíbrio térmico quando têm a mesma temperatura, e aí deixa de haver transferência de energia entre eles. Em geral, quando a temperatura de um sistema aumenta, aumenta a **energia cinética média** das suas partículas (agitam-se mais).',
          },
          {
            tipo: 'texto',
            texto: 'É por isso que um termómetro funciona: deixa-se em contacto com o corpo até ficar em equilíbrio térmico com ele, e então tem a mesma temperatura. No SI, a temperatura mede-se em kelvin (K): $T/\\mathrm{K} = \\theta/{}^{\\circ}\\mathrm{C} + 273{,}15$. Uma **variação** de temperatura tem o mesmo valor nas duas escalas: subir $10\\,{}^{\\circ}\\mathrm{C}$ é subir $10\\,\\mathrm{K}$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'A água de um copo passa de 20 °C para 35 °C. Exprime as duas temperaturas em kelvin e calcula a variação de temperatura nas duas escalas.',
            resolucao: [
              '$T_i = 20 + 273{,}15 = ' + dec(20 + 273.15, 2) + '\\,\\mathrm{K}$ e $T_f = 35 + 273{,}15 = ' + dec(35 + 273.15, 2) + '\\,\\mathrm{K}$.',
              '$\\Delta\\theta = 35 - 20 = 15\\,{}^{\\circ}\\mathrm{C}$ e $\\Delta T = ' + dec(35 + 273.15, 2) + ' - ' + dec(20 + 273.15, 2) + ' = ' + arred((35 + 273.15) - (20 + 273.15), 2) + '\\,\\mathrm{K}$: o mesmo valor.',
            ],
            resultado: 15,
            verificar: () => arred((35 + 273.15) - (20 + 273.15), 6),
          },
          {
            tipo: 'definicao',
            texto: '**Calor** é a energia transferida **espontaneamente** entre sistemas a temperaturas diferentes: sempre do sistema a temperatura **mais alta** para o de temperatura **mais baixa**, até ficarem em equilíbrio térmico. O calor transfere-se por três mecanismos: **condução**, **convecção** e **radiação** (quadro abaixo). A energia também se pode transferir como **trabalho** (por ação de forças: comprimir um gás, agitar um líquido).',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Um corpo **não contém calor**: tem energia interna. Calor é energia **em trânsito**, que só existe enquanto passa de um corpo para outro por haver uma diferença de temperatura. Também não há "frio" a passar: quando agarras num gelado, é a tua mão que **cede** energia ao gelado.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Mecanismo', 'Como acontece', 'Meio material?', 'Exemplo'],
            linhas: [
              ['Condução', 'as partículas mais agitadas transferem energia às vizinhas por colisões, sem transporte de matéria', 'sim (sobretudo sólidos)', 'a pega metálica de uma panela aquece'],
              ['Convecção', 'o fluido aquecido fica menos denso e sobe, o mais frio desce: correntes de convecção, com transporte de matéria', 'sim (líquidos e gases)', 'a água de uma panela aquece toda; o ar de uma sala aquece a partir do aquecedor'],
              ['Radiação', 'emissão e absorção de radiação eletromagnética', 'não: propaga-se também no vazio', 'o Sol aquece a Terra; sentes o calor de uma lareira à distância'],
            ],
          },
          {
            tipo: 'esquema',
            id: 'fqa-transferencias',
            opcoes: { Tquente: 80 },
            legenda: 'Muda a temperatura do corpo quente: a energia passa sempre do corpo mais quente para o mais frio, por condução, convecção e radiação. Com as duas temperaturas iguais (equilíbrio térmico), deixa de haver calor.',
          },
          {
            tipo: 'texto',
            texto: 'Por convenção, nos balanços da Primeira Lei (subtema seguinte), a energia transferida por radiação conta-se à parte, no termo $R$; $Q$ fica para a condução e a convecção.',
          },
          {
            tipo: 'texto',
            texto: '**Condutividade térmica.** Os materiais diferem na rapidez com que conduzem a energia: os **metais** são bons condutores térmicos; o ar, a lã, a cortiça, a madeira e o esferovite são maus condutores (**isoladores térmicos**). Os isoladores usados nas casas e na roupa funcionam, em grande parte, por prenderem ar parado, que conduz mal e não forma correntes de convecção.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Numa sala, uma barra de metal e uma tábua de madeira estão há horas à mesma temperatura, 20 °C. Porque é que o metal parece mais frio ao toque?',
            resolucao: [
              'Os dois estão em equilíbrio térmico com a sala: têm a **mesma temperatura**.',
              'A mão (a cerca de 35 °C) cede energia aos dois, mas o metal é melhor condutor térmico: retira energia da pele **mais depressa**, e a pele arrefece mais. O tato sente essa rapidez, não a temperatura do objeto.',
            ],
          },
          {
            tipo: 'texto',
            texto: '**Todos os corpos emitem radiação.** A radiação emitida depende da temperatura: quanto mais quente o corpo, mais energia emite por segundo e maior a frequência predominante. À **temperatura ambiente** (e à do corpo humano), os corpos emitem **predominantemente no infravermelho**, invisível para nós; só corpos muito quentes, como um ferro em brasa ou o filamento de uma lâmpada, emitem também luz visível. Os corpos também absorvem radiação: as superfícies escuras e baças absorvem e emitem mais; as claras e polidas refletem mais.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Aplicação do infravermelho', 'Como funciona'],
            linhas: [
              ['Termografia (câmaras térmicas)', 'formam uma imagem com o infravermelho emitido: mostram fugas de energia nas casas, zonas inflamadas do corpo, pessoas no escuro'],
              ['Termómetro de infravermelho', 'mede a temperatura sem contacto, a partir do infravermelho que a testa ou o objeto emite'],
              ['Comando à distância', 'um LED emite impulsos de infravermelho (não por estar quente) que o televisor deteta'],
              ['Garrafa-termo', 'o vácuo entre as paredes impede a condução e a convecção; as paredes espelhadas refletem a radiação'],
            ],
          },
        ],
        resumo: [
          'Sistema isolado: não troca energia nem matéria; fechado: só energia; aberto: energia e matéria.',
          'Energia interna: energias cinética e potencial das partículas.',
          'Temperatura: decide o equilíbrio térmico; sobe, em geral, com a energia cinética média das partículas. $T/\\mathrm{K} = \\theta/{}^{\\circ}\\mathrm{C} + 273{,}15$; $\\Delta T = \\Delta\\theta$.',
          'Calor: energia transferida espontaneamente do mais quente para o mais frio, até ao equilíbrio térmico. Não está "contido" num corpo.',
          'Condução (colisões, sem transporte de matéria), convecção (correntes num fluido), radiação (também no vazio).',
          'Todos os corpos emitem radiação; à temperatura ambiente, sobretudo infravermelho (termografia, termómetros de IV).',
        ],
        quiz: [
          {
            id: 'transferencias-q01',
            tipo: 'escolha',
            enunciado: 'Numa panela ao lume, a água aquece toda, e não só a que está junto ao fundo. Isso acontece sobretudo por…',
            opcoes: [
              'convecção: a água quente, menos densa, sobe e a mais fria desce.',
              'condução: a energia passa de partícula em partícula pela água parada.',
              'radiação: a chama emite infravermelho que atravessa toda a água.',
              'convecção: a água fria, mais leve, sobe e a quente desce.',
            ],
            correta: 0,
            explicacao: 'Num fluido aquecido por baixo formam-se correntes de convecção: a água do fundo aquece, fica menos densa e sobe, e a mais fria desce para o lugar dela, com transporte de matéria.',
            errosTipicos: [
              { codigo: 'conducao_em_vez_de_conveccao', opcao: 1, explicacao: 'A água conduz mal a energia; o que a distribui são as correntes de convecção, em que a própria água se move.' },
              { codigo: 'radiacao_em_vez_de_conveccao', opcao: 2, explicacao: 'A chama aquece o fundo da panela; dentro da água, a energia espalha-se pelas correntes de convecção, não pela radiação da chama.' },
              { codigo: 'densidade_trocada_na_conveccao', opcao: 3, explicacao: 'É ao contrário: a água quente é menos densa e sobe; a fria, mais densa, desce.' },
            ],
          },
          {
            id: 'transferencias-q02',
            tipo: 'escolha',
            enunciado: 'A energia do Sol chega à Terra através do espaço, praticamente vazio, por…',
            opcoes: ['radiação.', 'condução.', 'convecção.', 'condução e convecção.'],
            correta: 0,
            explicacao: 'A condução e a convecção precisam de um meio material; a radiação eletromagnética propaga-se também no vazio.',
            errosTipicos: [
              { codigo: 'conducao_no_vazio', opcao: 1, explicacao: 'A condução precisa de partículas que colidam umas com as outras; no vazio não há partículas. Só a radiação atravessa o vazio.' },
              { codigo: 'conveccao_no_vazio', opcao: 2, explicacao: 'A convecção é o movimento de um fluido; no vazio não há fluido. Só a radiação atravessa o vazio.' },
            ],
          },
          {
            id: 'transferencias-q03',
            tipo: 'vf',
            enunciado: 'Um corpo a 80 °C contém mais calor do que o mesmo corpo a 20 °C.',
            correta: false,
            explicacao: 'Um corpo não contém calor: a 80 °C tem mais **energia interna**. Calor é a energia transferida entre corpos a temperaturas diferentes, só enquanto essa transferência acontece.',
            errosTipicos: [
              { codigo: 'calor_contido_num_corpo', explicacao: 'O que um corpo tem é energia interna. Calor é energia em trânsito, transferida por haver uma diferença de temperatura.' },
            ],
          },
          {
            id: 'transferencias-q04',
            tipo: 'escolha',
            enunciado: 'Um bloco de cobre a 80 °C é mergulhado em água a 20 °C, num recipiente isolado. O que acontece?',
            opcoes: [
              'O cobre cede energia à água até os dois ficarem à mesma temperatura.',
              'A água cede "frio" ao cobre até os dois ficarem à mesma temperatura.',
              'O cobre cede energia à água até os dois terem a mesma energia interna.',
              'O cobre cede energia à água até ficar a 20 °C.',
            ],
            correta: 0,
            explicacao: 'O calor passa espontaneamente do corpo mais quente para o mais frio e deixa de passar quando as temperaturas se igualam (equilíbrio térmico), a um valor entre 20 °C e 80 °C.',
            errosTipicos: [
              { codigo: 'frio_transferido', opcao: 1, explicacao: 'Não há "frio" a passar: é o cobre, mais quente, que cede energia à água, mais fria.' },
              { codigo: 'equilibrio_como_energias_internas_iguais', opcao: 2, explicacao: 'O equilíbrio térmico é ter a mesma **temperatura**, não a mesma energia interna (que depende também da massa e da substância).' },
              { codigo: 'equilibrio_a_temperatura_do_corpo_frio', opcao: 3, explicacao: 'Ao receber energia, a água aquece: a temperatura final fica entre 20 °C e 80 °C, não nos 20 °C iniciais da água.' },
            ],
          },
          {
            id: 'transferencias-q05',
            tipo: 'vf',
            enunciado: 'O corpo humano, a cerca de 37 °C, emite radiação, sobretudo no infravermelho.',
            correta: true,
            explicacao: 'Todos os corpos emitem radiação; a temperaturas como a ambiente ou a do corpo humano, sobretudo no infravermelho. É essa radiação que as câmaras térmicas e os termómetros de infravermelho detetam.',
            errosTipicos: [
              { codigo: 'so_corpos_quentes_emitem_radiacao', explicacao: 'Não são só os corpos muito quentes: todos os corpos emitem radiação. À temperatura do corpo humano ela é infravermelha e, por isso, invisível.' },
            ],
          },
          {
            id: 'transferencias-q06',
            tipo: 'escolha',
            enunciado: 'Numa sala a 20 °C, um puxador metálico parece mais frio ao toque do que a porta de madeira. Porquê?',
            opcoes: [
              'O metal é melhor condutor térmico: retira energia da mão mais depressa.',
              'O metal está a uma temperatura mais baixa do que a madeira.',
              'O metal transfere frio para a mão.',
              'A madeira produz calor.',
            ],
            correta: 0,
            explicacao: 'Os dois estão em equilíbrio térmico com a sala, à mesma temperatura. O metal conduz melhor e retira energia da mão mais depressa: é isso que o tato sente.',
            errosTipicos: [
              { codigo: 'metal_a_temperatura_mais_baixa', opcao: 1, explicacao: 'Há horas na mesma sala, os dois estão em equilíbrio térmico com ela: têm a mesma temperatura. A diferença está na condutividade térmica.' },
              { codigo: 'frio_transferido', opcao: 2, explicacao: 'Não há "frio" a passar: é a mão, mais quente, que cede energia ao metal, e mais depressa do que à madeira.' },
              { codigo: 'madeira_produz_calor', opcao: 3, explicacao: 'A madeira não produz energia; conduz mal, por isso retira energia da mão devagar e parece menos fria.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'balancos',
        titulo: 'Balanços energéticos',
        ae: [
          'Compreender a Primeira Lei da Termodinâmica e enquadrar as descobertas científicas que levaram à sua formulação no contexto histórico, social e político.',
          'Explicar fenómenos do dia a dia utilizando balanços energéticos.',
          'Aplicar, na resolução de problemas de balanços energéticos, os conceitos de capacidade térmica mássica e de variação de entalpia mássica de transição de fase, descrevendo argumentos e raciocínios, explicando as soluções encontradas.',
          'Determinar, experimentalmente, a capacidade térmica mássica de um material e a variação de entalpia mássica de fusão do gelo, avaliando os procedimentos, interpretando os resultados e comunicando as conclusões.',
          'Determinar a variação de energia interna de um sistema num aquecimento ou arrefecimento, aplicando os conceitos de capacidade térmica mássica e de variação de entalpia (de fusão ou de vaporização), interpretando o sinal dessa variação.',
        ],
        minutos: 20,
        essencial: [
          {
            tipo: 'definicao',
            texto: '**Primeira Lei da Termodinâmica.** A energia interna de um sistema só varia por transferências de energia com a vizinhança, como trabalho ($W$), calor ($Q$) ou radiação ($R$): $$\\Delta U = W + Q + R$$ Cada termo é **positivo** quando o sistema **recebe** energia e **negativo** quando a **cede**. Num sistema isolado, $\\Delta U = 0$: é a conservação da energia.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um gás num cilindro recebe 500 J de energia como calor e, ao expandir-se, realiza 200 J de trabalho sobre a vizinhança (empurra o êmbolo). Calcula a variação da sua energia interna.',
            resolucao: [
              'O gás recebe calor: $Q = +500\\,\\mathrm{J}$. Ao realizar trabalho, cede energia: $W = -200\\,\\mathrm{J}$. Não há radiação: $R = 0$.',
              '$\\Delta U = W + Q + R = -200 + 500 + 0 = ' + (-200 + 500) + '\\,\\mathrm{J}$: a energia interna aumenta.',
            ],
            resultado: 300,
            verificar: () => -200 + 500 + 0,
          },
          {
            tipo: 'texto',
            texto: '**Um pouco de história.** Até meados do século XIX, muitos cientistas pensavam que o calor era um fluido invisível (o "calórico") contido nos corpos. Com a Revolução Industrial e as máquinas a vapor, e com a competição industrial e militar entre as nações pela eficiência dessas máquinas, tornou-se importante perceber a relação entre calor e trabalho. Por volta de 1840, o médico alemão **Julius Robert Mayer** propôs que o calor e o trabalho são formas de transferir a mesma coisa, a energia, que se conserva. O inglês **James Prescott Joule** mostrou-o com medições: pesos a cair faziam rodar pás dentro de água e a água aquecia, sempre na mesma proporção entre o trabalho realizado e o aumento de temperatura. Daí nasceu a Primeira Lei, e a unidade de energia chama-se joule em sua honra.',
          },
          {
            tipo: 'definicao',
            texto: 'A **capacidade térmica mássica** $c$ de um material é a energia necessária para aumentar de $1\\,{}^{\\circ}\\mathrm{C}$ (ou $1\\,\\mathrm{K}$) a temperatura de $1\\,\\mathrm{kg}$ desse material. Unidade SI: $\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}$ (igual a $\\mathrm{J\\,kg^{-1}\\,K^{-1}}$). Sem mudança de estado: $$Q = m\\, c\\, \\Delta\\theta$$',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Material', '$c$ / ($\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}$)'],
            linhas: [
              ['Água (líquida)', '$' + cTex(cA) + '$'],
              ['Gelo', '$' + cTex(cG) + '$'],
              ['Alumínio', '$' + cTex(cAl) + '$'],
              ['Ferro', '$' + cTex(C.ferro) + '$'],
              ['Cobre', '$' + cTex(C.cobre) + '$'],
              ['Chumbo', '$' + cTex(C.chumbo) + '$'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a energia necessária para aquecer 2,0 kg de água de 20 °C para 80 °C ($c_{\\text{água}} = ' + cTex(cA) + unC + '$).',
            resolucao: [
              '$\\Delta\\theta = 80 - 20 = 60\\,{}^{\\circ}\\mathrm{C}$.',
              '$Q = m c \\Delta\\theta = 2{,}0 \\times ' + cTex(cA) + ' \\times 60 \\approx ' + cient(F.calor(2, cA, 60), 2) + '\\,\\mathrm{J}$.',
            ],
            resultado: 501600,
            verificar: () => F.calor(2, cA, 60),
          },
          {
            tipo: 'texto',
            texto: 'A água tem uma capacidade térmica mássica muito elevada: com a mesma energia, aquece muito menos do que outros materiais. Com $9000\\,\\mathrm{J}$, $1{,}0\\,\\mathrm{kg}$ de água aquece cerca de $' + dec(9000 / F.calor(1, cA, 1), 1) + '\\,{}^{\\circ}\\mathrm{C}$, e $1{,}0\\,\\mathrm{kg}$ de alumínio, $' + dec(9000 / F.calor(1, cAl, 1), 0) + '\\,{}^{\\circ}\\mathrm{C}$. Por isso a água serve para arrefecer motores e para aquecer casas por radiadores, e o mar torna o clima das zonas costeiras mais ameno.',
          },
          {
            tipo: 'erro-frequente',
            texto: '$\\Delta\\theta$ é uma **variação**, $\\theta_f - \\theta_i$: não uses só a temperatura final. E $\\Delta\\theta$ em °C é igual a $\\Delta T$ em K, por isso **não** somes 273 a uma variação. Num arrefecimento, $\\Delta\\theta < 0$ e $Q < 0$: o corpo cede energia. A massa entra em kg.',
          },
          {
            tipo: 'definicao',
            texto: '**Mudanças de estado.** Durante a fusão ou a ebulição de uma substância pura, a pressão constante, a **temperatura não muda**: a energia recebida serve para vencer as interações entre as partículas (aumenta a energia potencial delas), não para as agitar mais. A **variação de entalpia mássica** de fusão (ou de vaporização) $\\Delta h$ é a energia necessária para fundir (ou vaporizar) 1 kg da substância, à temperatura da mudança de estado: $$Q = m\\, \\Delta h$$',
          },
          {
            tipo: 'texto',
            texto: 'Para a água, à pressão normal: fusão a 0 °C, com $\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$; ebulição a 100 °C, com $\\Delta h_{\\text{vaporização}} = ' + cient(H.vaporizacaoAgua, 3) + unH + '$. Nas mudanças inversas (solidificação, condensação), a mesma energia é **cedida**: $Q = -m\\,\\Delta h$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a energia necessária para fundir 0,50 kg de gelo a 0 °C ($\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$).',
            resolucao: [
              '$Q = m\\,\\Delta h = 0{,}50 \\times ' + cient(H.fusaoGelo, 3) + ' = ' + cient(F.calorFase(0.5, H.fusaoGelo), 3) + '\\,\\mathrm{J}$. A temperatura fica em 0 °C durante toda a fusão.',
            ],
            resultado: 167000,
            verificar: () => F.calorFase(0.5, H.fusaoGelo),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Aquecem-se 0,50 kg de gelo a −20 °C até a água chegar a 100 °C (sem ferver), com uma potência de 500 W e sem perdas. Calcula a energia de cada troço e o tempo total ($c_{\\text{gelo}} = ' + cTex(cG) + unC + '$; $c_{\\text{água}} = ' + cTex(cA) + unC + '$; $\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$).',
            resolucao: [
              'Gelo de −20 °C a 0 °C: $Q_1 = 0{,}50 \\times ' + cTex(cG) + ' \\times 20 = ' + cient(CURVA[0].Q, 2) + '\\,\\mathrm{J}$.',
              'Fusão a 0 °C: $Q_2 = 0{,}50 \\times ' + cient(H.fusaoGelo, 3) + ' = ' + cient(CURVA[1].Q, 3) + '\\,\\mathrm{J}$.',
              'Água de 0 °C a 100 °C: $Q_3 = 0{,}50 \\times ' + cTex(cA) + ' \\times 100 = ' + cient(CURVA[2].Q, 3) + '\\,\\mathrm{J}$.',
              'Total: $Q = ' + cient(CURVA_Q, 3) + '\\,\\mathrm{J}$; tempo: $\\Delta t = \\dfrac{Q}{P} = \\dfrac{' + cient(CURVA_Q, 3) + '}{500} = ' + Math.round(CURVA_T) + '\\,\\mathrm{s}$ (cerca de ' + Math.round(CURVA_T / 60) + ' min).',
            ],
            resultado: 794,
            verificar: () => CURVA_T,
          },
          {
            tipo: 'esquema',
            id: 'fqa-aquecimento',
            opcoes: { m: 0.5, theta0: -20, P: 500 },
            legenda: 'Curva de aquecimento: nos patamares (fusão a 0 °C e ebulição a 100 °C) a temperatura não muda, apesar de a água continuar a receber energia. Muda a massa e a potência e compara a duração de cada troço.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Quando há mudança de estado, **não te esqueças do patamar**: a energia de fusão (ou de vaporização) soma-se à do aquecimento. No exemplo anterior, a fusão gasta cerca de ' + Math.round(CURVA[1].Q / CURVA[0].Q) + ' vezes mais energia do que aquecer o gelo de −20 °C a 0 °C, e cerca de ' + Math.round(CURVA[1].Q / CURVA[2].Q * 100) + ' % da que é precisa para aquecer a água de 0 °C a 100 °C.',
          },
          {
            tipo: 'texto',
            texto: '**Variação de energia interna.** Se um sistema só troca energia como calor ($W = 0$, $R = 0$), $\\Delta U = Q$: num **aquecimento** ou numa fusão, $\\Delta U > 0$ (a energia interna aumenta); num **arrefecimento** ou numa solidificação, $\\Delta U < 0$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma garrafa com 0,30 kg de água arrefece no frigorífico de 60 °C para 20 °C. Calcula a variação da energia interna da água ($c_{\\text{água}} = ' + cTex(cA) + unC + '$).',
            resolucao: [
              '$\\Delta U = Q = m c \\Delta\\theta = 0{,}30 \\times ' + cTex(cA) + ' \\times (20 - 60) \\approx ' + cient(F.calor(0.3, cA, -40), 2) + '\\,\\mathrm{J}$.',
              'O sinal negativo diz que a água **cedeu** energia: a sua energia interna diminuiu.',
            ],
            resultado: -50160,
            verificar: () => F.calor(0.3, cA, 20 - 60),
          },
          {
            tipo: 'definicao',
            texto: '**Misturas.** Num recipiente isolado (sem trocas com o exterior), os corpos trocam energia entre si até ficarem à mesma temperatura, a **temperatura de equilíbrio** $\\theta_{eq}$. A energia cedida por uns é recebida pelos outros: $$Q_{\\text{cedido}} + Q_{\\text{recebido}} = 0$$ (o $Q$ de quem cede é negativo, por isso a soma é nula). Com dois corpos: $Q_1 + Q_2 = 0$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Misturam-se 0,20 kg de água a 20 °C com 0,10 kg de água a 80 °C, num recipiente isolado. Calcula a temperatura de equilíbrio.',
            resolucao: [
              '$Q_1 + Q_2 = 0$: $0{,}20\\, c\\, (\\theta_{eq} - 20) + 0{,}10\\, c\\, (\\theta_{eq} - 80) = 0$ (o $c$ da água simplifica; o $Q$ da água quente sai negativo).',
              '$0{,}30\\, \\theta_{eq} = 0{,}20 \\times 20 + 0{,}10 \\times 80 = 12$, logo $\\theta_{eq} = ' + MIX.thetaEq + '\\,{}^{\\circ}\\mathrm{C}$: mais perto de 20 °C, porque essa massa é maior.',
            ],
            resultado: 40,
            verificar: () => MIX.thetaEq,
          },
          {
            tipo: 'exemplo',
            enunciado: 'Num recipiente isolado juntam-se 0,050 kg de gelo a 0 °C a 0,30 kg de água a 50 °C. Todo o gelo funde. Calcula a temperatura de equilíbrio ($c_{\\text{água}} = ' + cTex(cA) + unC + '$; $\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$).',
            resolucao: [
              'O gelo recebe energia para fundir e, depois, a água de fusão aquece de 0 °C a $\\theta_{eq}$; a água morna arrefece de 50 °C a $\\theta_{eq}$.',
              '$0{,}050 \\times ' + cient(H.fusaoGelo, 3) + ' + 0{,}050 \\times ' + cTex(cA) + ' \\times (\\theta_{eq} - 0) + 0{,}30 \\times ' + cTex(cA) + ' \\times (\\theta_{eq} - 50) = 0$',
              '$\\theta_{eq} \\approx ' + dec(MIXG.thetaEq, 1) + '\\,{}^{\\circ}\\mathrm{C}$. Sem a fusão (como se fosse água a 0 °C), daria cerca de ' + decT(F.mistura([{ m: 0.3, theta: 50, fase: 'agua' }, { m: 0.05, theta: 0, fase: 'agua' }]).thetaEq, 1) + ' °C.',
            ],
            resultado: 31.4,
            verificar: () => arred(MIXG.thetaEq, 1),
          },
          {
            tipo: 'esquema',
            id: 'fqa-mistura',
            opcoes: { tipo: 'agua-gelo', m1: 0.3, theta1: 50, m2: 0.05 },
            legenda: 'Mistura água com água, com um metal ou com gelo a 0 °C: a temperatura de equilíbrio fica entre as iniciais, e a energia cedida é igual à recebida. Com muito gelo, o equilíbrio é a 0 °C e sobra gelo por fundir.',
          },
          {
            tipo: 'texto',
            texto: '**AL: capacidade térmica mássica de um metal.** Um bloco de metal, de massa conhecida, é aquecido por uma resistência de aquecimento metida num orifício; um termómetro (ou sensor) noutro orifício mede a temperatura. Mede-se a potência da resistência, $P = U I$ (voltímetro e amperímetro), e regista-se a temperatura ao longo do tempo. Se toda a energia aquecer o bloco, $P\\,\\Delta t = m c \\Delta\\theta$: o gráfico de $\\theta$ em função de $t$ é uma reta de declive $\\dfrac{P}{m c}$. Isola-se o bloco e põe-se um pouco de óleo nos orifícios, para melhorar o contacto térmico.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['$t$ / s', '$\\theta$ / °C'],
            linhas: ALC.t.map((t, i) => ['$' + t + '$', '$' + dec(ALC.theta[i], 1) + '$']),
          },
          {
            tipo: 'exemplo',
            enunciado: 'A tabela tem dados ilustrativos para um bloco de alumínio de 1,000 kg, aquecido por uma resistência com $U = 12{,}0\\,\\mathrm{V}$ e $I = 2{,}50\\,\\mathrm{A}$. Determina a capacidade térmica mássica do alumínio e o erro relativo, comparando com o valor tabelado (' + cAl + ' J kg⁻¹ °C⁻¹).',
            resolucao: [
              '$P = U I = 12{,}0 \\times 2{,}50 = ' + dec(ALC.P, 1) + '\\,\\mathrm{W}$.',
              'Regressão linear de $\\theta$ em função de $t$: declive $\\approx ' + dec(ALC.reta.declive, 5) + '\\,{}^{\\circ}\\mathrm{C\\,s^{-1}}$.',
              '$c = \\dfrac{P}{m \\times \\text{declive}} = \\dfrac{' + dec(ALC.P, 1) + '}{1{,}000 \\times ' + dec(ALC.reta.declive, 5) + '} \\approx ' + Math.round(ALC.c) + unC + '$.',
              'Erro relativo: $\\dfrac{|' + Math.round(ALC.c) + ' - ' + cAl + '|}{' + cAl + '} \\times 100 \\approx ' + dec(ALC.erro, 0) + '\\,\\%$. O valor sai por excesso porque parte da energia se perde para a vizinhança: o bloco aquece menos do que aqueceria sem perdas.',
            ],
            resultado: 941,
            verificar: () => Math.round(ALC.c),
          },
          {
            tipo: 'esquema',
            id: 'fig-calorimetro',
            legenda: 'Calorímetro: toca na figura para separar as peças e ver para que serve cada uma (isolamento, tampa, termómetro, agitador, resistência de aquecimento).',
          },
          {
            tipo: 'texto',
            texto: '**AL: variação de entalpia mássica de fusão do gelo.** Num calorímetro com água morna, de massa e temperatura conhecidas, junta-se gelo a 0 °C (bem escorrido, sem água líquida) e agita-se até todo o gelo fundir; regista-se a temperatura mínima, a de equilíbrio. A massa de gelo obtém-se pesando o calorímetro antes e depois. Sem perdas, a energia cedida pela água morna funde o gelo e aquece a água que resultou da fusão até $\\theta_{eq}$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Num calorímetro com 0,200 kg de água a 40,0 °C juntaram-se 0,040 kg de gelo a 0 °C; a temperatura de equilíbrio medida foi ' + decT(ALH.thetaEq, 1) + ' °C (dados ilustrativos). Determina a variação de entalpia mássica de fusão do gelo e o erro relativo ($c_{\\text{água}} = ' + cTex(cA) + unC + '$; valor tabelado: $' + cient(H.fusaoGelo, 3) + unH + '$).',
            resolucao: [
              'Energia cedida pela água morna: $0{,}200 \\times ' + cTex(cA) + ' \\times (40{,}0 - ' + dec(ALH.thetaEq, 1) + ') \\approx ' + cient(ALH.cedida, 4) + '\\,\\mathrm{J}$.',
              'Energia para aquecer a água de fusão de 0 °C a ' + decT(ALH.thetaEq, 1) + ' °C: $0{,}040 \\times ' + cTex(cA) + ' \\times ' + dec(ALH.thetaEq, 1) + ' \\approx ' + cient(ALH.aquecer, 4) + '\\,\\mathrm{J}$.',
              'A diferença fundiu o gelo: $\\Delta h_{\\text{fusão}} = \\dfrac{' + cient(ALH.cedida, 4) + ' - ' + cient(ALH.aquecer, 4) + '}{0{,}040} \\approx ' + cient(ALH.dh, 3) + unH + '$.',
              'Erro relativo $\\approx ' + dec(ALH.erro, 0) + '\\,\\%$. Sem perdas, a temperatura de equilíbrio seria ' + decT(ALH.prevista, 1) + ' °C; a medida é mais alta, por exemplo porque o gelo tinha alguma água líquida à superfície (havia menos gelo a fundir do que se julgava) ou porque o próprio calorímetro (vaso, agitador, termómetro) também arrefeceu e cedeu energia, o que não entrou no balanço.',
            ],
            resultado: 309000,
            verificar: () => Math.round(ALH.dh / 1000) * 1000,
          },
        ],
        resumo: [
          'Primeira Lei: $\\Delta U = W + Q + R$ (positivos quando o sistema recebe energia); sistema isolado: $\\Delta U = 0$.',
          'Mayer e Joule (anos 1840): calor e trabalho transferem energia, que se conserva.',
          'Sem mudança de estado: $Q = m c \\Delta\\theta$ ($\\Delta\\theta$ igual em °C e em K).',
          'Mudança de estado, a temperatura constante: $Q = m\\,\\Delta h$ (fusão do gelo $3{,}34 \\times 10^{5}$, vaporização da água $2{,}26 \\times 10^{6}\\,\\mathrm{J\\,kg^{-1}}$).',
          'Aquecimento: $\\Delta U > 0$; arrefecimento: $\\Delta U < 0$.',
          'Mistura isolada: $Q_{\\text{cedido}} + Q_{\\text{recebido}} = 0$ ($Q_{\\text{cedido}} < 0$); não esquecer a fusão do gelo.',
        ],
        quiz: [
          {
            id: 'balancos-q01',
            tipo: 'numerica',
            enunciado: 'Calcula a energia necessária para aquecer 250 g de água de 15 °C para 35 °C, em joules ($c_{\\text{água}} = ' + cTex(cA) + unC + '$).',
            resposta: 20900,
            tolerancia: 50,
            resolucao: [
              '$m = 0{,}250\\,\\mathrm{kg}$; $\\Delta\\theta = 35 - 15 = 20\\,{}^{\\circ}\\mathrm{C}$',
              '$Q = m c \\Delta\\theta = 0{,}250 \\times ' + cTex(cA) + ' \\times 20 = ' + mil(F.calor(0.25, cA, 20)) + '\\,\\mathrm{J}$',
            ],
            verificar: () => F.calor(0.25, cA, 20),
            errosTipicos: [
              { codigo: 'somou_273_a_variacao', valor: 306185, explicacao: 'Obtiveste cerca de $3{,}06 \\times 10^{5}\\,\\mathrm{J}$ por somares 273 à variação. Uma variação de 20 °C é uma variação de 20 K: $Q = 20\\,900\\,\\mathrm{J}$.' },
              { codigo: 'usou_temperatura_final_em_vez_da_variacao', valor: 36575, explicacao: 'Usaste só a temperatura final (35 °C) e obtiveste 36 575 J. Na fórmula entra a variação, $\\Delta\\theta = 20\\,{}^{\\circ}\\mathrm{C}$: $Q = 20\\,900\\,\\mathrm{J}$.' },
              { codigo: 'massa_em_gramas', valor: 20900000, explicacao: 'Usaste a massa em gramas e obtiveste $2{,}09 \\times 10^{7}$. No SI, $250\\,\\mathrm{g} = 0{,}250\\,\\mathrm{kg}$: $Q = 20\\,900\\,\\mathrm{J}$.' },
            ],
          },
          {
            id: 'balancos-q02',
            tipo: 'numerica',
            enunciado: 'Um bloco metálico de 0,500 kg recebe 4500 J e a sua temperatura sobe 10 °C, sem perdas. Calcula a capacidade térmica mássica do metal, em J kg⁻¹ °C⁻¹.',
            resposta: 900,
            tolerancia: 1,
            resolucao: [
              '$Q = m c \\Delta\\theta \\Leftrightarrow c = \\dfrac{Q}{m \\Delta\\theta}$',
              '$c = \\dfrac{4500}{0{,}500 \\times 10} = ' + 4500 / F.calor(0.5, 1, 10) + unC + '$ (o valor do alumínio)',
            ],
            verificar: () => 4500 / F.calor(0.5, 1, 10),
            errosTipicos: [
              { codigo: 'massa_em_gramas', valor: 0.9, explicacao: 'Usaste a massa em gramas (500) e obtiveste 0,9. No SI a massa está em kg: $c = \\dfrac{4500}{0{,}500 \\times 10} = 900' + unC + '$.' },
              { codigo: 'multiplicou_em_vez_de_dividir', valor: 22500, explicacao: 'Multiplicaste $Q \\times m \\times \\Delta\\theta$ e obtiveste 22 500. Isola $c$: $c = \\dfrac{Q}{m \\Delta\\theta} = 900' + unC + '$.' },
            ],
          },
          {
            id: 'balancos-q03',
            tipo: 'numerica',
            enunciado: 'Calcula a energia necessária para fundir completamente 0,200 kg de gelo a 0 °C, em quilojoules ($\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$; $\\Delta h_{\\text{vaporização}} = ' + cient(H.vaporizacaoAgua, 3) + unH + '$).',
            resposta: 66.8,
            tolerancia: 0.1,
            resolucao: [
              '$Q = m\\,\\Delta h_{\\text{fusão}} = 0{,}200 \\times ' + cient(H.fusaoGelo, 3) + ' = ' + cient(F.calorFase(0.2, H.fusaoGelo), 3) + '\\,\\mathrm{J}$',
              'Em quilojoules: $' + dec(F.calorFase(0.2, H.fusaoGelo) / 1000, 1) + '\\,\\mathrm{kJ}$',
            ],
            verificar: () => F.calorFase(0.2, H.fusaoGelo) / 1000,
            errosTipicos: [
              { codigo: 'usou_entalpia_de_vaporizacao', valor: 452, explicacao: 'Usaste a variação de entalpia mássica de vaporização e obtiveste 452 kJ. Fundir é passar de sólido a líquido: $0{,}200 \\times 3{,}34 \\times 10^{5}\\,\\mathrm{J} = 66{,}8\\,\\mathrm{kJ}$.' },
              { codigo: 'respondeu_em_joules', valor: 66800, explicacao: 'Respondeste 66 800, que é o valor em joules; pede-se em quilojoules: 66,8 kJ.' },
            ],
          },
          {
            id: 'balancos-q04',
            tipo: 'numerica',
            enunciado: 'Num recipiente isolado, misturam-se 0,10 kg de água a 90 °C com 0,30 kg de água a 10 °C. Calcula a temperatura de equilíbrio, em °C.',
            resposta: 30,
            tolerancia: 0.5,
            resolucao: [
              '$0{,}10\\, c\\, (\\theta_{eq} - 90) + 0{,}30\\, c\\, (\\theta_{eq} - 10) = 0$',
              '$0{,}40\\, \\theta_{eq} = 0{,}10 \\times 90 + 0{,}30 \\times 10 = 12$, logo $\\theta_{eq} = ' + F.mistura([{ m: 0.1, theta: 90, fase: 'agua' }, { m: 0.3, theta: 10, fase: 'agua' }]).thetaEq + '\\,{}^{\\circ}\\mathrm{C}$',
            ],
            verificar: () => F.mistura([{ m: 0.1, theta: 90, fase: 'agua' }, { m: 0.3, theta: 10, fase: 'agua' }]).thetaEq,
            errosTipicos: [
              { codigo: 'media_das_temperaturas_sem_massas', valor: 50, explicacao: '50 °C é a média simples das temperaturas; só seria assim com massas iguais. Há três vezes mais água fria, por isso $\\theta_{eq} = 30\\,{}^{\\circ}\\mathrm{C}$, mais perto de 10 °C.' },
            ],
          },
          {
            id: 'balancos-q05',
            tipo: 'escolha',
            enunciado: 'Um gás recebe 300 J de energia como calor e realiza 100 J de trabalho sobre a vizinhança. A variação da sua energia interna é…',
            opcoes: ['$+200\\,\\mathrm{J}$', '$+400\\,\\mathrm{J}$', '$-200\\,\\mathrm{J}$', '$-400\\,\\mathrm{J}$'],
            correta: 0,
            explicacao: 'Recebe calor: $Q = +300\\,\\mathrm{J}$; cede energia como trabalho: $W = -100\\,\\mathrm{J}$. $\\Delta U = W + Q = -100 + 300 = +200\\,\\mathrm{J}$.',
            errosTipicos: [
              { codigo: 'trabalho_realizado_com_sinal_positivo', opcao: 1, explicacao: 'Quando o gás realiza trabalho sobre a vizinhança, cede energia: $W = -100\\,\\mathrm{J}$, e $\\Delta U = +200\\,\\mathrm{J}$.' },
              { codigo: 'sinais_da_primeira_lei_trocados', opcao: 2, explicacao: 'Trocaste os sinais: o calor recebido é positivo ($+300$) e o trabalho realizado pelo gás é negativo ($-100$): $\\Delta U = +200\\,\\mathrm{J}$.' },
            ],
          },
          {
            id: 'balancos-q06',
            tipo: 'numerica',
            enunciado: 'Calcula a energia necessária para transformar 0,10 kg de gelo a −10 °C em água líquida a 0 °C, em joules ($c_{\\text{gelo}} = ' + cTex(cG) + unC + '$; $c_{\\text{água}} = ' + cTex(cA) + unC + '$; $\\Delta h_{\\text{fusão}} = ' + cient(H.fusaoGelo, 3) + unH + '$).',
            resposta: 35500,
            tolerancia: 50,
            resolucao: [
              'Aquecer o gelo até 0 °C: $Q_1 = 0{,}10 \\times ' + cTex(cG) + ' \\times 10 = ' + F.aquecimentoGelo({ m: 0.1, theta0: -10, thetaF: 0, P: 100, fundir: true })[0].Q + '\\,\\mathrm{J}$',
              'Fundir a 0 °C: $Q_2 = 0{,}10 \\times ' + cient(H.fusaoGelo, 3) + ' = ' + mil(F.aquecimentoGelo({ m: 0.1, theta0: -10, thetaF: 0, P: 100, fundir: true })[1].Q) + '\\,\\mathrm{J}$',
              '$Q = Q_1 + Q_2 = ' + mil(soma(F.aquecimentoGelo({ m: 0.1, theta0: -10, thetaF: 0, P: 100, fundir: true }).map((t) => t.Q))) + '\\,\\mathrm{J}$',
            ],
            verificar: () => soma(F.aquecimentoGelo({ m: 0.1, theta0: -10, thetaF: 0, P: 100, fundir: true }).map((t) => t.Q)),
            errosTipicos: [
              { codigo: 'esqueceu_a_fusao_no_balanco', valor: 2100, explicacao: '2100 J só aquecem o gelo até 0 °C; falta fundi-lo: $+33\\,400\\,\\mathrm{J}$, o que dá 35 500 J.' },
              { codigo: 'usou_c_da_agua_para_o_gelo', valor: 37580, explicacao: 'Usaste a capacidade térmica mássica da água líquida para o gelo e obtiveste 37 580 J. Para o gelo, $c = 2{,}1 \\times 10^{3}$: $Q_1 = 2100\\,\\mathrm{J}$ e $Q = 35\\,500\\,\\mathrm{J}$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'rendimento',
        titulo: 'Rendimento e Segunda Lei',
        ae: [
          'Investigar, experimentalmente, a influência da irradiância e da diferença de potencial elétrico na potência elétrica fornecida por um painel fotovoltaico, avaliando os procedimentos, interpretando os resultados e comunicando as conclusões.',
          'Explicitar que os processos que ocorrem espontaneamente na Natureza se dão sempre no sentido da diminuição da energia útil.',
          'Compreender o rendimento de um processo, interpretando a degradação de energia com base na Segunda Lei da Termodinâmica, analisando a responsabilidade individual e coletiva na utilização sustentável de recursos.',
        ],
        minutos: 16,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'Em qualquer aparelho ou processo, a energia fornecida reparte-se em **energia útil** (a que se aproveita para o fim pretendido) e **energia dissipada** (a que não se aproveita, quase sempre aquecimento da vizinhança): $E_{\\text{fornecida}} = E_{\\text{útil}} + E_{\\text{dissipada}}$. O **rendimento** é a fração útil: $$\\eta = \\dfrac{E_{\\text{útil}}}{E_{\\text{fornecida}}} = \\dfrac{P_{\\text{útil}}}{P_{\\text{fornecida}}}$$',
          },
          {
            tipo: 'texto',
            texto: 'O rendimento não tem unidades e dá-se muitas vezes em percentagem. Em qualquer processo real há energia dissipada, por isso $\\eta < 1$ (menos de 100 %).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'O motor de uma grua recebe 2000 J de energia elétrica para elevar, com velocidade constante, uma carga de 50 kg a 3,0 m de altura ($g = ' + D.constantes.g + '\\,\\mathrm{m\\,s^{-2}}$). Calcula o rendimento e a energia dissipada.',
            resolucao: [
              'Energia útil: $\\Delta E_{pg} = m g h = 50 \\times ' + D.constantes.g + ' \\times 3{,}0 = ' + F.epg(50, 3) + '\\,\\mathrm{J}$.',
              '$\\eta = \\dfrac{' + F.epg(50, 3) + '}{2000} = ' + dec(F.rendimento(F.epg(50, 3), 2000), 2) + '$, isto é, ' + Math.round(F.rendimento(F.epg(50, 3), 2000) * 100) + ' %.',
              'Energia dissipada: $2000 - ' + F.epg(50, 3) + ' = ' + (2000 - F.epg(50, 3)) + '\\,\\mathrm{J}$ (aquecimento do motor, atrito, som).',
            ],
            resultado: 0.75,
            verificar: () => F.rendimento(F.epg(50, 3), 2000),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma chaleira de 2000 W aquece 1,0 kg de água de 20 °C até 100 °C em 3 min 30 s. Calcula o rendimento ($c_{\\text{água}} = ' + cTex(cA) + unC + '$).',
            resolucao: [
              'Energia útil (recebida pela água): $Q = 1{,}0 \\times ' + cTex(cA) + ' \\times 80 \\approx ' + cient(F.calor(1, cA, 80), 3) + '\\,\\mathrm{J}$.',
              'Energia fornecida: $E = P\\,\\Delta t = 2000 \\times 210 = ' + cient(2000 * 210, 2) + '\\,\\mathrm{J}$.',
              '$\\eta = \\dfrac{' + cient(F.calor(1, cA, 80), 3) + '}{' + cient(2000 * 210, 2) + '} \\approx ' + dec(F.rendimento(F.calor(1, cA, 80), 2000 * 210), 2) + '$ (cerca de ' + Math.round(F.rendimento(F.calor(1, cA, 80), 2000 * 210) * 100) + ' %): o resto aqueceu a chaleira e o ar.',
            ],
            resultado: 0.8,
            verificar: () => arred(F.rendimento(F.calor(1, cA, 80), 2000 * 210), 2),
          },
          {
            tipo: 'definicao',
            texto: '**Degradação da energia e Segunda Lei da Termodinâmica.** A energia total conserva-se sempre (Primeira Lei), mas os processos que ocorrem **espontaneamente** na Natureza dão-se sempre no sentido da **diminuição da energia útil**: a energia acaba espalhada pela vizinhança, como energia interna a temperatura baixa, de onde já não se consegue aproveitar. Diz-se que a energia se **degradou**.',
          },
          {
            tipo: 'texto',
            texto: 'Exemplos: um café quente arrefece até à temperatura da sala, e nunca aquece sozinho à custa da sala; um carro que trava transforma energia cinética em aquecimento dos travões, que não volta a pôr o carro em movimento. Transferir energia de um corpo frio para um quente é possível (um frigorífico faz isso), mas não espontaneamente: gasta energia elétrica. É por isso que nenhuma máquina tem rendimento de 100 %.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Um rendimento **maior do que 1** (mais de 100 %) é impossível: significaria obter mais energia útil do que a fornecida. Se te der $\\eta > 1$, dividiste ao contrário. E a energia dissipada **não desaparece**: degrada-se, fica na vizinhança sob uma forma que já não se aproveita.',
          },
          {
            tipo: 'definicao',
            texto: '**Painel fotovoltaico.** Transforma energia da radiação solar em energia elétrica. A **irradiância** $G$ é a energia da radiação que incide por unidade de tempo e por unidade de área, em $\\mathrm{W\\,m^{-2}}$. Num painel de área $A$, a potência da radiação incidente é $G\\,A$ e o rendimento é: $$\\eta = \\dfrac{P_{\\text{elétrica}}}{G\\,A}$$',
          },
          {
            tipo: 'texto',
            texto: 'A potência elétrica, $P = U I$, depende do que está ligado ao painel. Com os terminais em curto-circuito, $U = 0$ e $P = 0$; em circuito aberto, $I = 0$ e $P = 0$. Entre os dois extremos, a curva $P$–$U$ tem um máximo, o **ponto de potência máxima**: é aí que se quer que o painel funcione (os equipamentos dos painéis reais procuram-no sozinhos). Quanto maior a irradiância, maior a potência.',
          },
          {
            tipo: 'texto',
            texto: '**AL: painel fotovoltaico.** Ilumina-se um pequeno painel com uma lâmpada e liga-se a um **reóstato**, com um **amperímetro** em série e um **voltímetro** aos terminais do painel. Variando a resistência do reóstato, registam-se pares $(U, I)$ e calcula-se $P = U I$; faz-se o gráfico $P$–$U$ e encontra-se o máximo. Repete-se com outra irradiância (afastando a lâmpada ou mudando o ângulo de incidência) para ver a sua influência. A tabela tem valores de um **modelo ilustrativo** de painel (área ' + decT(PAINEL.area, 3) + ' m², a ' + G0 + ' W m⁻²), não medições de um painel concreto.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['$R$ / $\\Omega$', '$U$ / V', '$I$ / A', '$P$ / W'],
            linhas: PONTOS.map((p) => ['$' + p.R + '$', '$' + dec(p.U, 2) + '$', '$' + dec(p.I, 3) + '$', '$' + dec(p.P, 2) + '$']),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Para o painel modelo da tabela ($A = ' + dec(PAINEL.area, 3) + '\\,\\mathrm{m^2}$, $G = ' + G0 + '\\,\\mathrm{W\\,m^{-2}}$), a curva completa tem o máximo em $U \\approx ' + dec(MAX.U, 2) + '\\,\\mathrm{V}$, com $I \\approx ' + dec(MAX.I, 3) + '\\,\\mathrm{A}$. Calcula a potência máxima e o rendimento do painel nesse ponto.',
            resolucao: [
              '$P_{\\text{máx}} = U I \\approx ' + dec(MAX.U, 2) + ' \\times ' + dec(MAX.I, 3) + ' \\approx ' + dec(MAX.P, 2) + '\\,\\mathrm{W}$. Na tabela, o maior valor é ' + decT(PONTOS.find((p) => p.R === 10).P, 2) + ' W, com $R = 10\\,\\Omega$; o máximo da curva fica entre $R = 10\\,\\Omega$ e $R = 12\\,\\Omega$ (em $R = U/I \\approx ' + dec(MAX.U / MAX.I, 1) + '\\,\\Omega$).',
              'Potência incidente: $G A = ' + G0 + ' \\times ' + dec(PAINEL.area, 3) + ' = ' + PINC + '\\,\\mathrm{W}$.',
              '$\\eta = \\dfrac{' + dec(MAX.P, 2) + '}{' + PINC + '} \\approx ' + dec(F.rendimento(MAX.P, PINC), 3) + '$, isto é, cerca de ' + Math.round(F.rendimento(MAX.P, PINC) * 100) + ' %.',
              'Com metade da irradiância (' + 500 + ' W m⁻²), a potência máxima do modelo desce para cerca de ' + decT(MAX500.P, 2) + ' W: a potência é aproximadamente proporcional à irradiância.',
            ],
            resultado: 0.149,
            verificar: () => arred(F.rendimento(MAX.P, PINC), 3),
          },
          {
            tipo: 'esquema',
            id: 'fqa-painel',
            opcoes: { G: G0, Rcarga: 10 },
            legenda: 'Muda a resistência de carga e procura o ponto de potência máxima da curva P–U; depois baixa a irradiância e repara que a curva inteira desce. O painel é um modelo ilustrativo.',
          },
          {
            tipo: 'esquema',
            id: 'fig-painel',
            legenda: 'Montagem da AL do painel fotovoltaico: toca na figura para separar o painel, a fonte de luz, o reóstato, o amperímetro e o voltímetro.',
          },
          {
            tipo: 'texto',
            texto: '**Uso sustentável da energia.** Como a energia útil se degrada, e muitos recursos (petróleo, gás natural, carvão) são limitados e poluem, importa usar menos energia para o mesmo serviço e preferir fontes renováveis. Na responsabilidade **individual**: escolher aparelhos de classe energética eficiente e lâmpadas LED, desligar o que não se usa, isolar bem as casas, andar a pé, de bicicleta ou de transportes públicos. Na responsabilidade **coletiva**: investir em renováveis, em transportes públicos e em edifícios eficientes. Ler as faturas (em kWh) e as etiquetas energéticas faz parte da literacia energética.',
          },
        ],
        resumo: [
          '$E_{\\text{fornecida}} = E_{\\text{útil}} + E_{\\text{dissipada}}$; $\\eta = E_{\\text{útil}}/E_{\\text{fornecida}} = P_{\\text{útil}}/P_{\\text{fornecida}}$, sempre menor do que 1.',
          'A energia conserva-se, mas degrada-se: os processos espontâneos diminuem a energia útil (Segunda Lei).',
          'O calor passa espontaneamente do quente para o frio; o inverso exige energia (frigorífico).',
          'Irradiância $G$: potência da radiação por unidade de área ($\\mathrm{W\\,m^{-2}}$); painel: $\\eta = P/(G A)$.',
          'Curva $P$–$U$ do painel: $P = 0$ em curto-circuito e em circuito aberto; máximo num $U$ intermédio. Mais irradiância, mais potência.',
          'Uso sustentável: eficiência, renováveis, responsabilidade individual e coletiva.',
        ],
        quiz: [
          {
            id: 'rendimento-q01',
            tipo: 'numerica',
            enunciado: 'Um motor recebe 800 J de energia elétrica e fornece 600 J de energia útil. Calcula o seu rendimento, em percentagem.',
            resposta: 75,
            tolerancia: 0.5,
            resolucao: [
              '$\\eta = \\dfrac{E_{\\text{útil}}}{E_{\\text{fornecida}}} = \\dfrac{600}{800} = ' + dec(F.rendimento(600, 800), 2) + '$',
              'Em percentagem: ' + F.rendimento(600, 800) * 100 + ' %',
            ],
            verificar: () => F.rendimento(600, 800) * 100,
            errosTipicos: [
              { codigo: 'rendimento_maior_do_que_1', valor: 133, explicacao: 'Calculaste $800/600 \\approx 133\\,\\%$: dividiste ao contrário. O rendimento é útil a dividir por fornecida, $600/800 = 75\\,\\%$.' },
              { codigo: 'deu_a_fracao_dissipada', valor: 25, explicacao: '25 % é a fração dissipada ($200/800$). O rendimento é a fração útil: 75 %.' },
            ],
          },
          {
            id: 'rendimento-q02',
            tipo: 'numerica',
            enunciado: 'Um aparelho de 1200 W, com rendimento de 85 %, funciona durante 10 s. Calcula a energia dissipada, em joules.',
            resposta: 1800,
            tolerancia: 5,
            resolucao: [
              'Energia fornecida: $E = P\\,\\Delta t = 1200 \\times 10 = 12\\,000\\,\\mathrm{J}$',
              'Útil: $0{,}85 \\times 12\\,000 = 10\\,200\\,\\mathrm{J}$; dissipada: $12\\,000 - 10\\,200 = ' + arred(1200 * 10 * (1 - 0.85), 6) + '\\,\\mathrm{J}$',
            ],
            verificar: () => 1200 * 10 - 1200 * 10 * F.rendimento(85, 100),
            errosTipicos: [
              { codigo: 'deu_energia_util_em_vez_de_dissipada', valor: 10200, explicacao: '10 200 J é a energia **útil** (85 %). A dissipada é o resto: $12\\,000 - 10\\,200 = 1800\\,\\mathrm{J}$.' },
              { codigo: 'confundiu_potencia_com_energia', valor: 180, explicacao: 'Calculaste $0{,}15 \\times 1200 = 180$, que é a potência dissipada (em W). A energia é potência vezes tempo: $180 \\times 10 = 1800\\,\\mathrm{J}$.' },
            ],
          },
          {
            id: 'rendimento-q03',
            tipo: 'numerica',
            enunciado: 'Um painel fotovoltaico com 1,6 m² de área, iluminado com uma irradiância de 1000 W m⁻², fornece uma potência elétrica de 320 W. Calcula o seu rendimento, em percentagem.',
            resposta: 20,
            tolerancia: 0.5,
            resolucao: [
              'Potência incidente: $G A = 1000 \\times 1{,}6 = 1600\\,\\mathrm{W}$',
              '$\\eta = \\dfrac{320}{1600} = ' + dec(F.rendimento(320, 1000 * 1.6), 2) + '$, isto é, ' + Math.round(F.rendimento(320, 1000 * 1.6) * 100) + ' %',
            ],
            verificar: () => F.rendimento(320, 1000 * 1.6) * 100,
            errosTipicos: [
              { codigo: 'esqueceu_a_area_do_painel', valor: 32, explicacao: 'Dividiste 320 por 1000 e obtiveste 32 %, esquecendo a área: a potência incidente é $G A = 1600\\,\\mathrm{W}$, e $\\eta = 20\\,\\%$.' },
              { codigo: 'rendimento_maior_do_que_1', valor: 500, explicacao: 'Calculaste $1600/320 = 500\\,\\%$: dividiste ao contrário. $\\eta = P_{\\text{elétrica}}/(G A) = 20\\,\\%$.' },
            ],
          },
          {
            id: 'rendimento-q04',
            tipo: 'escolha',
            enunciado: 'Na curva da potência elétrica de um painel fotovoltaico em função da diferença de potencial nos seus terminais, a potência é máxima…',
            opcoes: [
              'num valor intermédio de $U$, entre o curto-circuito e o circuito aberto.',
              'em circuito aberto, onde $U$ é máxima.',
              'em curto-circuito, onde $I$ é máxima.',
              'em qualquer valor de $U$: a potência só depende da irradiância.',
            ],
            correta: 0,
            explicacao: '$P = U I$: em curto-circuito $U = 0$ e em circuito aberto $I = 0$, por isso $P = 0$ nos dois extremos; o máximo fica num valor intermédio de $U$.',
            errosTipicos: [
              { codigo: 'potencia_maxima_em_circuito_aberto', opcao: 1, explicacao: 'Em circuito aberto não há corrente ($I = 0$), logo $P = U I = 0$. O máximo fica num $U$ intermédio.' },
              { codigo: 'potencia_maxima_em_curto_circuito', opcao: 2, explicacao: 'Em curto-circuito $U = 0$, logo $P = U I = 0$, apesar de a corrente ser máxima. O máximo fica num $U$ intermédio.' },
              { codigo: 'potencia_do_painel_independente_de_u', opcao: 3, explicacao: 'A irradiância fixa a curva, mas, numa mesma curva, $P$ varia com $U$ (é nula nos extremos). Por isso se procura o ponto de potência máxima.' },
            ],
          },
          {
            id: 'rendimento-q05',
            tipo: 'vf',
            enunciado: 'Uma máquina muito bem construída pode fornecer mais energia útil do que a energia que recebe.',
            correta: false,
            explicacao: 'A energia útil é só uma parte da energia fornecida, e há sempre alguma dissipada: o rendimento é sempre menor do que 100 %.',
            errosTipicos: [
              { codigo: 'rendimento_maior_do_que_1', explicacao: 'Isso seria um rendimento superior a 100 %, o que é impossível: a energia conserva-se e parte dela é sempre dissipada.' },
            ],
          },
          {
            id: 'rendimento-q06',
            tipo: 'escolha',
            enunciado: 'Um café quente arrefece numa sala até ficar à temperatura ambiente. Qual é a afirmação correta?',
            opcoes: [
              'A energia total conserva-se, mas a energia útil diminuiu: não volta espontaneamente ao café.',
              'A energia do café desapareceu.',
              'O frio da sala entrou no café.',
              'Se se esperar, o café volta a aquecer sozinho à custa da sala.',
            ],
            correta: 0,
            explicacao: 'A energia que o café cedeu ficou na sala, como energia interna a temperatura baixa: conservou-se, mas degradou-se. Os processos espontâneos dão-se no sentido da diminuição da energia útil (Segunda Lei).',
            errosTipicos: [
              { codigo: 'energia_desaparece_na_degradacao', opcao: 1, explicacao: 'A energia não desaparece: passou para a sala. O que diminuiu foi a energia útil (degradou-se).' },
              { codigo: 'frio_transferido', opcao: 2, explicacao: 'Não há "frio" a passar: o café, mais quente, cedeu energia à sala.' },
              { codigo: 'processo_espontaneo_reversivel', opcao: 3, explicacao: 'O calor passa espontaneamente só do quente para o frio. Para o café voltar a aquecer era preciso fornecer-lhe energia (por exemplo, no micro-ondas).' },
            ],
          },
        ],
      },
    ],
  });
})();
