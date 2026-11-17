globalThis.Manual = globalThis.Manual || {};

// Física e Química A — Física: tema «Energia e fenómenos elétricos».
// Os resultados dos exemplos e das perguntas numéricas são confirmados pelo validador com Manual.fisica (verificar).
// A pilha da AL e do esquema é o modelo ilustrativo de Manual.dadosFisica.modelos.pilha (ε = 4,5 V, r = 1,5 Ω), não uma
// medição; os dados da tabela da AL são ilustrativos (gerados à volta desse modelo) e ajustados por mínimos quadrados.
// Conversão de energia: 1 kWh = 1000 W × 3600 s = 3,6 × 10⁶ J (definição do quilowatt-hora).
(function () {
  const D = Manual.dadosFisica;
  const F = Manual.fisica;
  const PILHA = D.modelos.pilha;

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
  const KWH = 1000 * 3600; // J

  // reta de mínimos quadrados y = declive x + ordenada
  const reta = (xs, ys) => {
    const n = xs.length;
    const sx = xs.reduce((a, x) => a + x, 0), sy = ys.reduce((a, y) => a + y, 0);
    const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), sxx = xs.reduce((a, x) => a + x * x, 0);
    const declive = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return { declive, ordenada: (sy - declive * sx) / n };
  };

  // Exemplos do circuito: 6 Ω e 3 Ω com uma fonte de 6,0 V.
  const SERIE = F.circuito({ U: 6, rs: [6, 3], ligacao: 'serie' });
  const PARALELO = F.circuito({ U: 6, rs: [6, 3], ligacao: 'paralelo' });

  // Pilha do modelo com uma resistência exterior de 3,0 Ω.
  const GER = F.gerador({ epsilon: PILHA.epsilon, r: PILHA.r, Rext: 3 });
  const ICC = PILHA.epsilon / PILHA.r; // corrente de curto-circuito

  // AL «características de uma pilha»: dados ilustrativos (I, U) à volta do modelo, reta de mínimos quadrados.
  const AL = { I: [0.15, 0.3, 0.45, 0.6, 0.75], U: [4.27, 4.06, 3.81, 3.62, 3.38] };
  AL.reta = reta(AL.I, AL.U);
  AL.epsilon = AL.reta.ordenada;
  AL.r = -AL.reta.declive;

  Manual.registarTema('fqa', {
    id: 'eletricidade',
    titulo: 'Energia e fenómenos elétricos',
    subtemas: [
      // ------------------------------------------------------------------
      {
        id: 'circuitos',
        titulo: 'Corrente, diferença de potencial e resistência',
        ae: [
          'Interpretar o significado das grandezas: corrente elétrica, diferença de potencial elétrico e resistência elétrica.',
          'Montar circuitos elétricos, associando componentes elétricos em série e em paralelo, e, a partir de medições, caracterizá-los quanto à corrente elétrica que os percorre e à diferença de potencial elétrico aos seus terminais.',
          'Aplicar a definição de potência a sistemas elétricos e, em particular, ao efeito de Joule.',
        ],
        minutos: 16,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'A **corrente elétrica** é um movimento orientado de partículas com carga elétrica (nos metais, eletrões livres). A **intensidade da corrente** $I$ é a carga $Q$ que atravessa uma secção do condutor por unidade de tempo. Mede-se em amperes (A): $1\\,\\mathrm{A} = 1\\,\\mathrm{C\\,s^{-1}}$.',
          },
          {
            tipo: 'formula',
            texto: '$$I = \\dfrac{Q}{\\Delta t}$$',
          },
          {
            tipo: 'texto',
            texto: 'O **sentido convencional** da corrente é, no circuito exterior, do terminal positivo para o negativo da fonte; os eletrões movem-se no sentido contrário. Numa **corrente contínua** (pilhas, baterias, painéis fotovoltaicos) o sentido não muda.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Durante 2,0 min, atravessa a secção de um fio uma carga de 180 C. Calcula a intensidade da corrente.',
            resolucao: [
              '$\\Delta t = 2{,}0\\,\\mathrm{min} = 120\\,\\mathrm{s}$.',
              '$I = \\dfrac{Q}{\\Delta t} = \\dfrac{180}{120} = ' + dec(180 / 120, 1) + '\\,\\mathrm{A}$.',
            ],
            resultado: 1.5,
            verificar: () => 180 / (2 * 60),
          },
          {
            tipo: 'definicao',
            texto: 'A **diferença de potencial elétrico** $U$ (ou tensão) entre dois pontos é a energia transferida por unidade de carga que passa entre eles, $U = \\dfrac{E}{Q}$. Mede-se em volts (V): $1\\,\\mathrm{V} = 1\\,\\mathrm{J\\,C^{-1}}$. É a fonte que mantém uma diferença de potencial entre os seus terminais e assim faz circular a corrente.',
          },
          {
            tipo: 'definicao',
            texto: 'A **resistência elétrica** $R$ de um componente mede a oposição que ele faz à passagem da corrente: é o quociente entre a diferença de potencial nos seus terminais e a corrente que o percorre. Mede-se em ohms ($\\Omega$): $1\\,\\Omega = 1\\,\\mathrm{V\\,A^{-1}}$.',
          },
          {
            tipo: 'formula',
            texto: '$$R = \\dfrac{U}{I}$$ Num **condutor óhmico** (como um fio metálico a temperatura constante), $R$ não depende de $U$ (**lei de Ohm**): o gráfico $U$–$I$ é uma reta que passa pela origem, de declive $R$.',
          },
          {
            tipo: 'texto',
            texto: '**Resistência de um condutor.** Num fio, $R = \\rho\\,\\dfrac{\\ell}{A}$: a resistência é tanto maior quanto mais **comprido** ($\\ell$) e mais **fino** (área de secção $A$ menor) for o fio, e depende do **material**, pela resistividade $\\rho$. O cobre tem resistividade baixa, por isso se usa nos fios. Nos metais, a resistividade aumenta com a temperatura.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma lâmpada de um farol de bicicleta funciona com uma diferença de potencial de 12 V e é percorrida por uma corrente de 0,50 A. Calcula a sua resistência.',
            resolucao: [
              '$R = \\dfrac{U}{I} = \\dfrac{12}{0{,}50} = ' + 12 / 0.5 + '\\,\\Omega$.',
            ],
            resultado: 24,
            verificar: () => 12 / 0.5,
          },
          {
            tipo: 'quadro',
            cabecalho: ['', 'Em série', 'Em paralelo'],
            linhas: [
              ['Ligação', 'uns a seguir aos outros, num só caminho', 'em ramos diferentes, entre os mesmos dois pontos'],
              ['Corrente', 'a mesma em todos: $I = I_1 = I_2$', 'divide-se pelos ramos: $I = I_1 + I_2$'],
              ['Diferença de potencial', 'reparte-se: $U = U_1 + U_2$', 'a mesma em todos: $U = U_1 = U_2$'],
              ['Resistência equivalente', '$R_{eq} = R_1 + R_2$ (maior do que a maior)', '$\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$ (menor do que a menor)'],
              ['Se um componente avariar (abrir)', 'os outros deixam de funcionar', 'os outros continuam a funcionar (é assim nas casas)'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Duas resistências, de 6,0 Ω e de 3,0 Ω, ligam-se a uma fonte de 6,0 V, primeiro em série e depois em paralelo. Em cada caso, calcula a resistência equivalente e a corrente na fonte.',
            resolucao: [
              'Em série: $R_{eq} = 6{,}0 + 3{,}0 = ' + dec(SERIE.Req, 1) + '\\,\\Omega$ e $I = \\dfrac{6{,}0}{' + dec(SERIE.Req, 1) + '} \\approx ' + dec(SERIE.I, 2) + '\\,\\mathrm{A}$. A tensão reparte-se: $U_1 = 6{,}0 \\times ' + dec(SERIE.I, 2) + ' \\approx ' + dec(SERIE.porComponente[0].U, 1) + '\\,\\mathrm{V}$ e $U_2 \\approx ' + dec(SERIE.porComponente[1].U, 1) + '\\,\\mathrm{V}$ (soma: 6,0 V).',
              'Em paralelo: $\\dfrac{1}{R_{eq}} = \\dfrac{1}{6{,}0} + \\dfrac{1}{3{,}0} = \\dfrac{1}{2{,}0}$, logo $R_{eq} = ' + dec(PARALELO.Req, 1) + '\\,\\Omega$ e $I = \\dfrac{6{,}0}{' + dec(PARALELO.Req, 1) + '} = ' + dec(PARALELO.I, 1) + '\\,\\mathrm{A}$.',
              'Em paralelo, cada resistência tem 6,0 V: $I_1 = ' + dec(PARALELO.porComponente[0].I, 1) + '\\,\\mathrm{A}$ e $I_2 = ' + dec(PARALELO.porComponente[1].I, 1) + '\\,\\mathrm{A}$, e $I_1 + I_2 = ' + dec(PARALELO.I, 1) + '\\,\\mathrm{A}$.',
            ],
            resultado: 2,
            verificar: () => PARALELO.Req,
          },
          {
            tipo: 'esquema',
            id: 'fqa-circuito',
            opcoes: { ligacao: 'paralelo', n: 2, rs: [6, 3], U: 6 },
            legenda: 'Muda a ligação e os valores das resistências: em série a corrente é a mesma em todas e a tensão reparte-se; em paralelo a tensão é a mesma e a corrente divide-se pelos ramos.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Em **paralelo** as resistências **não se somam**: somam-se os **inversos**, e no fim é preciso inverter outra vez. Com 6,0 Ω e 3,0 Ω, $\\tfrac{1}{6{,}0} + \\tfrac{1}{3{,}0} = 0{,}50\\,\\Omega^{-1}$, e $R_{eq} = 2{,}0\\,\\Omega$ (não 9,0 Ω nem 0,50 Ω). Confirma sempre: em paralelo, $R_{eq}$ é menor do que a menor das resistências.',
          },
          {
            tipo: 'esquema',
            id: 'fig-circuito',
            legenda: 'Circuito com amperímetro e voltímetro: toca na figura para separar os componentes e ver como se liga cada aparelho de medida.',
          },
          {
            tipo: 'texto',
            texto: '**Medições.** O **amperímetro** liga-se **em série** com o componente (a corrente tem de passar por ele) e tem resistência muito pequena. O **voltímetro** liga-se **em paralelo**, aos terminais do componente, e tem resistência muito grande. Num multímetro, escolhe-se a grandeza e começa-se pela escala maior; o resultado escreve-se com a incerteza de leitura do aparelho.',
          },
          {
            tipo: 'definicao',
            texto: 'A **potência** $P$ é a energia transferida por unidade de tempo, $P = \\dfrac{E}{\\Delta t}$, em watts ($1\\,\\mathrm{W} = 1\\,\\mathrm{J\\,s^{-1}}$). Num componente elétrico, $P = U I$.',
          },
          {
            tipo: 'definicao',
            texto: '**Efeito Joule.** Quando a corrente percorre uma resistência, a energia elétrica é transferida para a vizinhança como energia térmica: a resistência aquece. É o que se aproveita em aquecedores, chaleiras e torradeiras, e o que se perde nos fios e nos aparelhos. Numa resistência, como $U = R I$: $$P = R I^2 = \\dfrac{U^2}{R}$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma resistência de 10 Ω é percorrida por uma corrente de 2,0 A. Calcula a potência dissipada por efeito Joule e a energia transferida em 5,0 min.',
            resolucao: [
              '$P = R I^2 = 10 \\times 2{,}0^2 = ' + 10 * 2 ** 2 + '\\,\\mathrm{W}$.',
              '$E = P\\, \\Delta t = ' + 10 * 2 ** 2 + ' \\times 300 = ' + cient(10 * 2 ** 2 * 300, 2) + '\\,\\mathrm{J}$ ($\\Delta t = 5{,}0\\,\\mathrm{min} = 300\\,\\mathrm{s}$).',
            ],
            resultado: 12000,
            verificar: () => 10 * 2 ** 2 * 300,
          },
          {
            tipo: 'texto',
            texto: '**O quilowatt-hora.** Nas faturas, a energia elétrica mede-se em quilowatts-hora: 1 kWh é a energia transferida por um aparelho de 1 kW durante 1 h. $$1\\,\\mathrm{kWh} = 1000\\,\\mathrm{W} \\times 3600\\,\\mathrm{s} = 3{,}6 \\times 10^{6}\\,\\mathrm{J}$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma chaleira de 2000 W está ligada durante 3,0 min. Calcula a energia elétrica que consome, em joules e em kWh.',
            resolucao: [
              '$E = P\\, \\Delta t = 2000 \\times 180 = ' + cient(2000 * 180, 2) + '\\,\\mathrm{J}$.',
              'Em kWh: $\\dfrac{' + cient(2000 * 180, 2) + '}{3{,}6 \\times 10^{6}} = ' + dec(2000 * 180 / KWH, 2) + '\\,\\mathrm{kWh}$. Ou, diretamente: $2{,}0\\,\\mathrm{kW} \\times 0{,}050\\,\\mathrm{h} = 0{,}10\\,\\mathrm{kWh}$.',
            ],
            resultado: 0.1,
            verificar: () => (2000 * 3 * 60) / KWH,
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não confundas **potência** com **energia**. O watt (W) e o quilowatt (kW) são unidades de potência (energia por segundo); o joule (J) e o quilowatt-hora (kWh) são unidades de energia. Um aparelho mais potente não gasta, por isso, mais energia: depende também do tempo, $E = P\\,\\Delta t$. Para kWh, usa $P$ em kW e $\\Delta t$ em h; para J, $P$ em W e $\\Delta t$ em s.',
          },
        ],
        resumo: [
          '$I = Q/\\Delta t$ (A); $U$ é energia por unidade de carga (V); $R = U/I$ ($\\Omega$).',
          'Condutor óhmico: $U$–$I$ é uma reta pela origem. Num fio, $R = \\rho\\,\\ell/A$.',
          'Série: $I$ igual, $U$ reparte-se, $R_{eq} = R_1 + R_2$.',
          'Paralelo: $U$ igual, $I$ divide-se, $1/R_{eq} = 1/R_1 + 1/R_2$ ($R_{eq}$ menor do que a menor).',
          'Amperímetro em série; voltímetro em paralelo.',
          '$P = U I$; efeito Joule: $P = R I^2 = U^2/R$; $E = P\\,\\Delta t$; $1\\,\\mathrm{kWh} = 3{,}6 \\times 10^6\\,\\mathrm{J}$.',
        ],
        quiz: [
          {
            id: 'circuitos-q01',
            tipo: 'numerica',
            enunciado: 'Duas resistências, de 6,0 Ω e de 12 Ω, estão ligadas em paralelo. Calcula a resistência equivalente, em ohms.',
            resposta: 4,
            tolerancia: 0.05,
            resolucao: [
              '$\\dfrac{1}{R_{eq}} = \\dfrac{1}{6{,}0} + \\dfrac{1}{12} = \\dfrac{3}{12} = 0{,}25\\,\\Omega^{-1}$',
              '$R_{eq} = \\dfrac{1}{0{,}25} = ' + dec(F.resistenciaParalelo([6, 12]), 1) + '\\,\\Omega$',
            ],
            verificar: () => F.resistenciaParalelo([6, 12]),
            errosTipicos: [
              { codigo: 'somou_resistencias_em_paralelo', valor: 18, explicacao: 'Somaste as resistências (18 Ω), como se estivessem em série. Em paralelo somam-se os inversos: $R_{eq} = 4{,}0\\,\\Omega$, menor do que a menor.' },
              { codigo: 'esqueceu_inverter_resistencia_equivalente', valor: 0.25, explicacao: '0,25 é $\\dfrac{1}{R_{eq}}$ (em $\\Omega^{-1}$); falta inverter: $R_{eq} = \\dfrac{1}{0{,}25} = 4{,}0\\,\\Omega$.' },
            ],
          },
          {
            id: 'circuitos-q02',
            tipo: 'numerica',
            enunciado: 'Num fio, passam 1200 C de carga em 10 min. Calcula a intensidade da corrente, em amperes.',
            resposta: 2,
            tolerancia: 0.05,
            resolucao: [
              '$\\Delta t = 10\\,\\mathrm{min} = 600\\,\\mathrm{s}$',
              '$I = \\dfrac{Q}{\\Delta t} = \\dfrac{1200}{600} = ' + dec(1200 / 600, 1) + '\\,\\mathrm{A}$',
            ],
            verificar: () => 1200 / (10 * 60),
            errosTipicos: [
              { codigo: 'tempo_em_minutos', valor: 120, explicacao: 'Dividiste por 10 (minutos) e obtiveste 120. No SI o tempo está em segundos: $10\\,\\mathrm{min} = 600\\,\\mathrm{s}$, e $I = 2{,}0\\,\\mathrm{A}$.' },
            ],
          },
          {
            id: 'circuitos-q03',
            tipo: 'escolha',
            enunciado: 'Para medir a corrente que percorre uma lâmpada e a diferença de potencial nos seus terminais, liga-se…',
            opcoes: [
              'o amperímetro em série e o voltímetro em paralelo com a lâmpada.',
              'o amperímetro em paralelo e o voltímetro em série com a lâmpada.',
              'os dois aparelhos em série com a lâmpada.',
              'os dois aparelhos em paralelo com a lâmpada.',
            ],
            correta: 0,
            explicacao: 'A corrente tem de atravessar o amperímetro, por isso fica em série; o voltímetro compara o potencial dos dois terminais da lâmpada, por isso fica em paralelo com ela.',
            errosTipicos: [
              { codigo: 'trocou_ligacao_amperimetro_voltimetro', opcao: 1, explicacao: 'Está ao contrário: o amperímetro liga-se em série (a corrente passa por ele) e o voltímetro em paralelo (aos terminais da lâmpada).' },
              { codigo: 'voltimetro_em_serie', opcao: 2, explicacao: 'O voltímetro, com a sua resistência muito grande, em série quase anularia a corrente. Liga-se em paralelo, aos terminais da lâmpada.' },
              { codigo: 'amperimetro_em_paralelo', opcao: 3, explicacao: 'O amperímetro tem resistência muito pequena: em paralelo, quase toda a corrente passaria por ele e não mediria a corrente na lâmpada. Liga-se em série.' },
            ],
          },
          {
            id: 'circuitos-q04',
            tipo: 'numerica',
            enunciado: 'Um aquecedor de 1500 W está ligado durante 2,0 h. Calcula a energia que consome, em kWh.',
            resposta: 3,
            tolerancia: 0.05,
            resolucao: [
              '$P = 1500\\,\\mathrm{W} = 1{,}5\\,\\mathrm{kW}$',
              '$E = P\\,\\Delta t = 1{,}5 \\times 2{,}0 = ' + dec(1.5 * 2, 1) + '\\,\\mathrm{kWh}$',
            ],
            verificar: () => (1500 * 2 * 3600) / KWH,
            errosTipicos: [
              { codigo: 'potencia_em_watts_no_kwh', valor: 3000, explicacao: 'Usaste a potência em watts e obtiveste 3000 (são watts-hora). Para kWh, a potência entra em kW: $1{,}5 \\times 2{,}0 = 3{,}0\\,\\mathrm{kWh}$.' },
              { codigo: 'respondeu_em_joules_em_vez_de_kwh', valor: 10800000, explicacao: '$1{,}08 \\times 10^{7}$ é a energia em joules ($1500\\,\\mathrm{W} \\times 7200\\,\\mathrm{s}$). Pede-se em kWh: divide por $3{,}6 \\times 10^{6}$, o que dá 3,0 kWh.' },
            ],
          },
          {
            id: 'circuitos-q05',
            tipo: 'numerica',
            enunciado: 'Uma resistência de 20 Ω é percorrida por uma corrente de 0,50 A. Calcula a potência dissipada por efeito Joule, em watts.',
            resposta: 5,
            tolerancia: 0.05,
            resolucao: [
              '$P = R I^2$',
              '$P = 20 \\times 0{,}50^2 = ' + dec(20 * 0.5 ** 2, 1) + '\\,\\mathrm{W}$',
            ],
            verificar: () => 20 * 0.5 ** 2,
            errosTipicos: [
              { codigo: 'esqueceu_quadrado_da_corrente', valor: 10, explicacao: 'Calculaste $R I = 10$, que é a diferença de potencial (em V), não a potência. $P = R I^2 = 20 \\times 0{,}25 = 5{,}0\\,\\mathrm{W}$.' },
            ],
          },
          {
            id: 'circuitos-q06',
            tipo: 'vf',
            enunciado: 'Quando se liga mais uma lâmpada em paralelo com as que já estão ligadas a uma tomada, a resistência equivalente do circuito aumenta.',
            correta: false,
            explicacao: 'Cada ramo novo em paralelo abre mais um caminho à corrente: $\\dfrac{1}{R_{eq}}$ aumenta, logo $R_{eq}$ **diminui**, e a corrente total aumenta (com a mesma tensão).',
            errosTipicos: [
              { codigo: 'paralelo_aumenta_resistencia_equivalente', explicacao: 'Em paralelo somam-se os inversos: mais um ramo faz aumentar $1/R_{eq}$ e diminuir $R_{eq}$, que é sempre menor do que a menor das resistências.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'gerador',
        titulo: 'Geradores e energia num circuito',
        ae: [
          'Compreender a função e as características de um gerador e determinar as características de uma pilha numa atividade experimental, avaliando os procedimentos e comunicando os resultados.',
          'Aplicar, na resolução de problemas, a conservação da energia num circuito elétrico, tendo em conta o efeito Joule, explicando as estratégias de resolução.',
          'Avaliar, numa perspetiva intra e interdisciplinar, como a energia elétrica e as suas diversas aplicações são vitais na sociedade actual e as repercurssões a nível social, económico, político e ambiental.',
        ],
        minutos: 16,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'Um **gerador** transforma outra forma de energia em energia elétrica e fornece-a ao circuito: uma pilha transforma energia química; um dínamo, energia mecânica; um painel fotovoltaico, energia da radiação.',
          },
          {
            tipo: 'definicao',
            texto: 'A **força eletromotriz** $\\varepsilon$ de um gerador é a energia que ele fornece por unidade de carga que o atravessa; mede-se em volts. A **resistência interna** $r$ é a resistência do próprio gerador: parte da energia é dissipada dentro dele, por efeito Joule (a pilha aquece).',
          },
          {
            tipo: 'formula',
            texto: 'Diferença de potencial nos terminais de um gerador que fornece a corrente $I$: $$U = \\varepsilon - r I$$',
          },
          {
            tipo: 'texto',
            texto: '**Característica do gerador.** O gráfico de $U$ em função de $I$ é uma **reta decrescente**: a **ordenada na origem** é $\\varepsilon$ (com $I = 0$, em circuito aberto, $U = \\varepsilon$) e o **declive** é $-r$. A reta corta o eixo das correntes na **corrente de curto-circuito**, $I_{cc} = \\dfrac{\\varepsilon}{r}$ (terminais ligados por um fio, $U = 0$). Um gerador ideal teria $r = 0$ e $U = \\varepsilon$ sempre.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma pilha com $\\varepsilon = ' + dec(PILHA.epsilon, 1) + '\\,\\mathrm{V}$ e $r = ' + dec(PILHA.r, 1) + '\\,\\Omega$ alimenta uma resistência de 3,0 Ω. Calcula a corrente, a diferença de potencial nos terminais da pilha e a corrente de curto-circuito.',
            resolucao: [
              'A corrente atravessa a resistência exterior e a interna, em série: $I = \\dfrac{\\varepsilon}{R + r} = \\dfrac{' + dec(PILHA.epsilon, 1) + '}{3{,}0 + ' + dec(PILHA.r, 1) + '} = ' + dec(GER.I, 1) + '\\,\\mathrm{A}$.',
              '$U = \\varepsilon - r I = ' + dec(PILHA.epsilon, 1) + ' - ' + dec(PILHA.r, 1) + ' \\times ' + dec(GER.I, 1) + ' = ' + dec(GER.U, 1) + '\\,\\mathrm{V}$ (confirma: $U = R I = 3{,}0 \\times ' + dec(GER.I, 1) + '$).',
              '$I_{cc} = \\dfrac{\\varepsilon}{r} = \\dfrac{' + dec(PILHA.epsilon, 1) + '}{' + dec(PILHA.r, 1) + '} = ' + dec(ICC, 1) + '\\,\\mathrm{A}$.',
            ],
            resultado: 3,
            verificar: () => GER.U,
          },
          {
            tipo: 'esquema',
            id: 'fqa-gerador',
            opcoes: { epsilon: PILHA.epsilon, r: PILHA.r, Rext: 3 },
            legenda: 'Muda a resistência exterior: o ponto de funcionamento desliza ao longo da reta $U = \\varepsilon - rI$. Com mais corrente, a tensão nos terminais desce, a potência dissipada na pilha aumenta e o rendimento baixa.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'A diferença de potencial nos terminais de um gerador que fornece corrente é **menor** do que a força eletromotriz: $U = \\varepsilon - r I$, **não** $\\varepsilon + r I$. A parcela $r I$ é a "perda" dentro do gerador. E no gráfico $U$–$I$ o declive é $-r$: a resistência interna é o **simétrico** do declive (um número positivo).',
          },
          {
            tipo: 'texto',
            texto: '**Conservação da energia no circuito.** Multiplicando $U = \\varepsilon - r I$ pela corrente obtém-se o balanço de potências do gerador: $$\\varepsilon I = U I + r I^2$$ A potência total ($\\varepsilon I$) reparte-se entre a potência útil fornecida ao circuito exterior ($U I$) e a potência dissipada no gerador por efeito Joule ($r I^2$). No circuito exterior, $U I$ é a soma das potências dos recetores (numa resistência, $R I^2$).',
          },
          {
            tipo: 'formula',
            texto: 'Rendimento do gerador: $$\\eta = \\dfrac{U I}{\\varepsilon I} = \\dfrac{U}{\\varepsilon}$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Para a pilha do exemplo anterior ($\\varepsilon = ' + dec(PILHA.epsilon, 1) + '\\,\\mathrm{V}$, $r = ' + dec(PILHA.r, 1) + '\\,\\Omega$, $I = ' + dec(GER.I, 1) + '\\,\\mathrm{A}$), faz o balanço de potências e calcula o rendimento. Que energia recebe a resistência exterior em 10 min?',
            resolucao: [
              'Total: $\\varepsilon I = ' + dec(PILHA.epsilon, 1) + ' \\times ' + dec(GER.I, 1) + ' = ' + dec(GER.Ptotal, 1) + '\\,\\mathrm{W}$. Útil: $U I = ' + dec(GER.U, 1) + ' \\times ' + dec(GER.I, 1) + ' = ' + dec(GER.Putil, 1) + '\\,\\mathrm{W}$. Dissipada na pilha: $r I^2 = ' + dec(PILHA.r, 1) + ' \\times ' + dec(GER.I, 1) + '^2 = ' + dec(GER.Pdissipada, 1) + '\\,\\mathrm{W}$.',
              'Confirma: $' + dec(GER.Putil, 1) + ' + ' + dec(GER.Pdissipada, 1) + ' = ' + dec(GER.Ptotal, 1) + '\\,\\mathrm{W}$.',
              '$\\eta = \\dfrac{U}{\\varepsilon} = \\dfrac{' + dec(GER.U, 1) + '}{' + dec(PILHA.epsilon, 1) + '} \\approx ' + dec(GER.rendimento, 2) + '$, isto é, cerca de ' + Math.round(GER.rendimento * 100) + ' %.',
              'Em 10 min (600 s): $E = U I\\,\\Delta t = ' + dec(GER.Putil, 1) + ' \\times 600 = ' + cient(GER.Putil * 600, 2) + '\\,\\mathrm{J}$.',
            ],
            resultado: 1800,
            verificar: () => GER.Putil * 600,
          },
          {
            tipo: 'texto',
            texto: '**AL: características de uma pilha.** Liga-se a pilha a um **reóstato** (resistência variável), com um **amperímetro** em série e um **voltímetro** aos terminais da pilha. Variando a resistência do reóstato, registam-se vários pares $(I, U)$. O gráfico $U$–$I$ e a reta de ajuste (regressão linear) dão $\\varepsilon$ (ordenada na origem) e $r$ (simétrico do declive). O circuito fecha-se só durante as leituras, para a pilha não aquecer nem se descarregar, o que mudaria $\\varepsilon$ e $r$.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['$I$ / A', '$U$ / V'],
            linhas: AL.I.map((I, i) => ['$' + dec(I, 2) + '$', '$' + dec(AL.U[i], 2) + '$']),
          },
          {
            tipo: 'exemplo',
            enunciado: 'A tabela tem dados ilustrativos de uma AL com uma pilha plana de 4,5 V. Determina a força eletromotriz e a resistência interna da pilha.',
            resolucao: [
              'Na calculadora (regressão linear de $U$ em função de $I$): $U = ' + dec(AL.reta.declive, 2) + '\\, I + ' + dec(AL.reta.ordenada, 2) + '$ (SI).',
              'Ordenada na origem: $\\varepsilon \\approx ' + dec(AL.epsilon, 2) + '\\,\\mathrm{V}$.',
              'Declive $= -r$: $r \\approx ' + dec(AL.r, 2) + '\\,\\Omega$.',
              'A força eletromotriz é próxima do valor indicado na pilha (4,5 V). A resistência interna de uma pilha aumenta à medida que ela se gasta.',
            ],
            resultado: 1.48,
            verificar: () => arred(AL.r, 2),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não calcules $r$ com um só par de valores, como $U/I$: isso dá a resistência **exterior** nesse ponto, não a interna. A resistência interna vem do **declive** da reta (ou de dois pontos da reta): $r = -\\dfrac{\\Delta U}{\\Delta I}$.',
          },
          {
            tipo: 'texto',
            texto: '**Energia elétrica e sociedade.** A energia elétrica transporta-se facilmente a grandes distâncias e transforma-se com facilidade noutras formas: é vital na iluminação, nas comunicações, na saúde, nos transportes e na indústria. Mas a sua produção tem impactos: as centrais a combustíveis fósseis emitem dióxido de carbono e poluentes; as barragens alteram rios e ecossistemas; as fontes renováveis (eólica, solar) dependem do tempo e precisam de armazenamento. O acesso à eletricidade, o seu preço e a dependência de outros países são também questões sociais, económicas e políticas.',
          },
        ],
        resumo: [
          'Gerador: transforma outra energia em energia elétrica; força eletromotriz $\\varepsilon$ (V) e resistência interna $r$ ($\\Omega$).',
          '$U = \\varepsilon - r I$: reta $U$–$I$ com ordenada na origem $\\varepsilon$ e declive $-r$.',
          'Corrente de curto-circuito $I_{cc} = \\varepsilon / r$; com $I = 0$, $U = \\varepsilon$.',
          'Balanço: $\\varepsilon I = U I + r I^2$ (total = útil + dissipada no gerador).',
          'Rendimento do gerador: $\\eta = U/\\varepsilon$.',
          'AL: reta de ajuste de $U$ em função de $I$ dá $\\varepsilon$ e $r$.',
        ],
        quiz: [
          {
            id: 'gerador-q01',
            tipo: 'numerica',
            enunciado: 'Uma bateria com força eletromotriz 9,0 V e resistência interna 2,0 Ω fornece uma corrente de 0,50 A. Calcula a diferença de potencial nos seus terminais, em volts.',
            resposta: 8,
            tolerancia: 0.05,
            resolucao: [
              '$U = \\varepsilon - r I$',
              '$U = 9{,}0 - 2{,}0 \\times 0{,}50 = ' + dec(F.gerador({ epsilon: 9, r: 2, Rext: 16 }).U, 1) + '\\,\\mathrm{V}$',
            ],
            verificar: () => F.gerador({ epsilon: 9, r: 2, Rext: 16 }).U,
            errosTipicos: [
              { codigo: 'somou_queda_de_tensao_interna', valor: 10, explicacao: 'Calculaste $\\varepsilon + r I = 10\\,\\mathrm{V}$. Dentro do gerador há uma "perda" $r I$, por isso $U = \\varepsilon - r I = 8{,}0\\,\\mathrm{V}$, menor do que $\\varepsilon$.' },
              { codigo: 'deu_a_queda_de_tensao_interna', valor: 1, explicacao: '1,0 V é só $r I$, a parte que fica dentro da bateria. Nos terminais: $U = 9{,}0 - 1{,}0 = 8{,}0\\,\\mathrm{V}$.' },
            ],
          },
          {
            id: 'gerador-q02',
            tipo: 'numerica',
            enunciado: 'Na AL das características de uma pilha, dois pontos da reta de ajuste são (0,20 A; 4,20 V) e (0,60 A; 3,40 V). Calcula a resistência interna da pilha, em ohms.',
            resposta: 2,
            tolerancia: 0.05,
            resolucao: [
              'Declive da reta: $\\dfrac{\\Delta U}{\\Delta I} = \\dfrac{3{,}40 - 4{,}20}{0{,}60 - 0{,}20} = -2{,}0\\,\\Omega$',
              '$r = -\\text{declive} = ' + dec(F.caracteristicaDeDoisPontos([0.2, 4.2], [0.6, 3.4]).r, 1) + '\\,\\Omega$ (e $\\varepsilon = 4{,}20 + 2{,}0 \\times 0{,}20 = ' + dec(F.caracteristicaDeDoisPontos([0.2, 4.2], [0.6, 3.4]).epsilon, 1) + '\\,\\mathrm{V}$)',
            ],
            verificar: () => F.caracteristicaDeDoisPontos([0.2, 4.2], [0.6, 3.4]).r,
            errosTipicos: [
              { codigo: 'r_igual_ao_declive', valor: -2, explicacao: '−2,0 é o declive da reta. Como $U = \\varepsilon - r I$, o declive é $-r$, por isso $r = 2{,}0\\,\\Omega$ (positiva).' },
              { codigo: 'r_como_u_sobre_i', valor: 21, explicacao: 'Calculaste $U/I = 4{,}20/0{,}20 = 21$: é a resistência exterior nesse ponto. A resistência interna vem do declive: $r = 2{,}0\\,\\Omega$.' },
            ],
          },
          {
            id: 'gerador-q03',
            tipo: 'escolha',
            enunciado: 'No gráfico da diferença de potencial nos terminais de um gerador em função da corrente, $U = \\varepsilon - rI$, a ordenada na origem e o declive da reta são, respetivamente…',
            opcoes: ['$\\varepsilon$ e $-r$.', '$r$ e $\\varepsilon$.', '$\\varepsilon$ e $r$.', '$I_{cc}$ e $-r$.'],
            correta: 0,
            explicacao: 'Com $I = 0$, $U = \\varepsilon$ (ordenada na origem); por cada ampere a mais, $U$ desce $r$ volts: o declive é $-r$.',
            errosTipicos: [
              { codigo: 'trocou_epsilon_e_r', opcao: 1, explicacao: 'A ordenada na origem é uma tensão, $\\varepsilon$ (com $I = 0$, $U = \\varepsilon$); a resistência interna está no declive, $-r$.' },
              { codigo: 'declive_igual_a_r', opcao: 2, explicacao: 'A reta desce quando $I$ aumenta: o declive é negativo, $-r$. A resistência interna é o simétrico do declive.' },
              { codigo: 'ordenada_como_corrente_de_curto_circuito', opcao: 3, explicacao: 'A corrente de curto-circuito é onde a reta corta o eixo das correntes ($U = 0$). A ordenada na origem (no eixo de $U$) é $\\varepsilon$.' },
            ],
          },
          {
            id: 'gerador-q04',
            tipo: 'numerica',
            enunciado: 'Um gerador com $\\varepsilon = 6{,}0\\,\\mathrm{V}$ e $r = 1{,}0\\,\\Omega$ fornece uma corrente de 0,50 A. Calcula a potência útil que fornece ao circuito exterior, em watts.',
            resposta: 2.75,
            tolerancia: 0.01,
            resolucao: [
              'Balanço: $\\varepsilon I = U I + r I^2$, logo $P_{\\text{útil}} = \\varepsilon I - r I^2$',
              '$P_{\\text{útil}} = 6{,}0 \\times 0{,}50 - 1{,}0 \\times 0{,}50^2 = ' + dec(F.gerador({ epsilon: 6, r: 1, Rext: 11 }).Ptotal, 2) + ' - ' + dec(F.gerador({ epsilon: 6, r: 1, Rext: 11 }).Pdissipada, 2) + ' = ' + dec(F.gerador({ epsilon: 6, r: 1, Rext: 11 }).Putil, 2) + '\\,\\mathrm{W}$',
            ],
            verificar: () => F.gerador({ epsilon: 6, r: 1, Rext: 11 }).Putil,
            errosTipicos: [
              { codigo: 'esqueceu_potencia_dissipada_no_gerador', valor: 3, explicacao: '3,0 W é a potência total, $\\varepsilon I$. Parte dela, $r I^2 = 0{,}25\\,\\mathrm{W}$, é dissipada no gerador: a útil é 2,75 W.' },
              { codigo: 'esqueceu_quadrado_da_corrente', valor: 2.5, explicacao: 'Subtraíste $r I = 0{,}50$ em vez de $r I^2 = 0{,}25\\,\\mathrm{W}$: a potência dissipada no gerador é $r I^2$, e a útil é 2,75 W.' },
            ],
          },
          {
            id: 'gerador-q05',
            tipo: 'numerica',
            enunciado: 'A bateria de um automóvel tem força eletromotriz de 12,0 V; durante o arranque, a diferença de potencial nos seus terminais desce para 10,8 V. Calcula o rendimento da bateria nesse momento, em percentagem.',
            resposta: 90,
            tolerancia: 0.5,
            resolucao: [
              '$\\eta = \\dfrac{U}{\\varepsilon} = \\dfrac{10{,}8}{12{,}0} = ' + dec(F.rendimento(10.8, 12), 2) + '$',
              'Em percentagem: ' + Math.round(F.rendimento(10.8, 12) * 100) + ' %',
            ],
            verificar: () => F.rendimento(10.8, 12) * 100,
            errosTipicos: [
              { codigo: 'rendimento_maior_do_que_1', valor: 111, explicacao: 'Calculaste $\\varepsilon / U \\approx 111\\,\\%$: dividiste ao contrário. O rendimento nunca passa de 100 %: $U/\\varepsilon = 90\\,\\%$.' },
              { codigo: 'deu_a_fracao_dissipada', valor: 10, explicacao: '10 % é a fração dissipada dentro da bateria ($rI/\\varepsilon$). O rendimento é a fração útil: 90 %.' },
            ],
          },
          {
            id: 'gerador-q06',
            tipo: 'vf',
            enunciado: 'Quando uma pilha real fornece corrente a um circuito, a diferença de potencial nos seus terminais é maior do que a sua força eletromotriz.',
            correta: false,
            explicacao: '$U = \\varepsilon - r I$: com corrente, parte da energia fica na resistência interna e $U < \\varepsilon$. Só em circuito aberto ($I = 0$) se tem $U = \\varepsilon$.',
            errosTipicos: [
              { codigo: 'somou_queda_de_tensao_interna', explicacao: 'A parcela $r I$ subtrai-se: $U = \\varepsilon - r I$, por isso $U$ é menor (nunca maior) do que $\\varepsilon$.' },
            ],
          },
        ],
      },
    ],
  });
})();
