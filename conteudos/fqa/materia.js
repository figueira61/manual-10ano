globalThis.Manual = globalThis.Manual || {};

// Física e Química A — Química: tema «Propriedades e transformações da matéria».
// Os valores químicos (massas atómicas, energias e comprimentos de ligação, constantes, composição do ar) vêm de
// Manual.dadosQuimicos; as moléculas (geometria, ângulo, polaridade, pares de eletrões) vêm de Manual.moleculas.catalogo.
// Os resultados dos exemplos e das perguntas numéricas são confirmados pelo validador com Manual.quimica (verificar).
(function () {
  const D = Manual.dadosQuimicos;
  const Q = Manual.quimica;
  const Mol = Manual.moleculas;
  const K = D.constantes;
  const el = (s) => D.elementos[s];

  // número com vírgula decimal: em KaTeX ({,}) e em texto corrido (,)
  const dec = (x, casas) => x.toFixed(casas).replace('.', '{,}');
  const decT = (x, casas) => x.toFixed(casas).replace('.', ',');
  // notação científica em KaTeX, mantissa em [1, 10) com `as` algarismos significativos
  const cient = (x, as) => {
    const [m, e] = x.toExponential(as - 1).split('e');
    return m.replace('.', '{,}') + ' \\times 10^{' + Number(e) + '}';
  };
  const arred = (x, as) => Number(x.toPrecision(as));
  const Ar = (s) => dec(el(s).massaAtomica, 2); // massa atómica relativa (TP do IAVE)
  const M = (f) => Q.massaMolar(f); // massa molar em g/mol
  // energia (kJ/mol) e comprimento (pm) médios de ligação (tabela de Huheey)
  const E = (k) => D.ligacoes[k].energia;
  const comp = (k) => D.ligacoes[k].comprimento;
  const lig = (k) => k.replace('-', '–'); // C-C → C–C para o texto
  // molécula do catálogo: geometria, ângulo (graus) e polaridade
  const mol = (id) => Mol.obter(id);
  const angulo = (id) => decT(mol(id).angulo, mol(id).angulo % 1 === 0 ? 0 : 1) + '°';
  const polar = (id) => (mol(id).polar ? 'polar' : 'apolar');
  // átomo central de uma molécula com um só centro: pares ligantes (ligações) e não ligantes à volta dele
  const central = (id) => {
    const m = mol(id);
    const i = Mol.centrais(id)[0];
    const ligacoes = m.ligacoes.filter(([a, b]) => a === i || b === i).length;
    return { el: m.atomos[i].el, ligacoes, pares: m.atomos[i].pares };
  };
  const NA = cient(K.NA, 3);
  const h = cient(K.h, 3);
  const c = cient(K.c, 3);
  const Vm = dec(K.Vm, 1);
  const VmT = decT(K.Vm, 1);
  // composição do ar seco (percentagem em volume)
  const ar = (g) => D.atmosfera.find((x) => x.gas === g).percentagem;
  const pct = (g) => String(ar(g)).replace('.', ',');

  Manual.registarTema('fqa', {
    id: 'materia',
    titulo: 'Propriedades e transformações da matéria',
    subtemas: [
      // ------------------------------------------------------------------
      {
        id: 'ligacao',
        titulo: 'Ligação química',
        ae: [
          'Compreender que a formação de ligações químicas é um processo que aumenta a estabilidade de um sistema de dois ou mais átomos, interpretando-a em termos de forças de atração e de repulsão no sistema núcleos-eletrões.',
          'Interpretar os gráficos de energia em função da distância internuclear de moléculas diatómicas.',
          'Interpretar os gráficos de energia em função da distância internuclear de moléculas diatómicas, verificando que na formação de uma ligação há libertação de energia e na quebra há absorção.',
          'Distinguir, recorrendo a exemplos, os vários tipos de ligação química: covalente, iónica e metálica.',
          'Explicar a ligação covalente com base no modelo de Lewis.',
          'Representar, com base na regra do octeto, as fórmulas de estrutura de Lewis de algumas moléculas, interpretando a ocorrência de ligações covalentes simples, duplas ou triplas.',
          'Interpretar e relacionar os parâmetros de ligação, energia e comprimento, para ligações entre átomos dos mesmos elementos.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Os átomos ligam-se quando o conjunto que formam fica **mais estável**, isto é, com **menor energia** do que os átomos separados. Uma **ligação química** é o resultado das forças elétricas entre os núcleos e os eletrões dos átomos.',
          },
          {
            tipo: 'texto',
            texto: 'Quando dois átomos se aproximam há **atração** entre o núcleo de cada um e os eletrões do outro, e **repulsão** entre os dois núcleos e entre os eletrões dos dois átomos. A ligação forma-se à distância em que estas forças se equilibram.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-energia-distancia',
            opcoes: { ligacao: 'H-H' },
            legenda: 'Arrasta a distância entre os dois núcleos. Longe, a energia é quase zero; ao aproximar, predomina a atração e a energia desce; muito perto, predomina a repulsão e a energia sobe. O mínimo marca o comprimento e a energia de ligação.',
          },
          {
            tipo: 'definicao',
            texto: 'O **comprimento de ligação** é a distância entre os núcleos quando a energia é mínima. A **energia de ligação** é a energia necessária para quebrar uma mole de ligações (com as substâncias no estado gasoso); é igual à energia libertada quando essa mole de ligações se forma.',
          },
          {
            tipo: 'texto',
            texto: 'No gráfico da molécula de hidrogénio, o mínimo está a ' + comp('H-H') + ' pm e a $-' + E('H-H') + '\\,\\mathrm{kJ\\,mol^{-1}}$: o comprimento da ligação H–H é ' + comp('H-H') + ' pm e a sua energia de ligação é ' + E('H-H') + ' kJ/mol. **Formar** a ligação liberta energia; **quebrá-la** exige que se forneça essa energia.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'A energia de ligação H–H é $' + E('H-H') + '\\,\\mathrm{kJ\\,mol^{-1}}$. Calcula a energia necessária para quebrar a ligação de **uma** molécula de $\\mathrm{H_2}$ ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$).',
            resolucao: [
              'A energia de ligação refere-se a uma mole de ligações: passa a joules, $' + E('H-H') + '\\,\\mathrm{kJ\\,mol^{-1}} = ' + cient(E('H-H') * 1000, 3) + '\\,\\mathrm{J\\,mol^{-1}}$.',
              'Uma mole tem $N_A$ moléculas: $E = \\dfrac{' + cient(E('H-H') * 1000, 3) + '}{' + NA + '} \\approx ' + cient(E('H-H') * 1000 / K.NA, 3) + '\\,\\mathrm{J}$ por molécula.',
            ],
            resultado: 7.18e-19,
            verificar: () => arred(E('H-H') * 1000 / K.NA, 3),
          },
          {
            tipo: 'quadro',
            cabecalho: ['Ligação', 'Entre', 'Como se forma', 'Exemplos'],
            linhas: [
              ['**Covalente**', 'átomos de não metais', 'os átomos partilham pares de eletrões de valência', '$\\mathrm{H_2}$, $\\mathrm{H_2O}$, $\\mathrm{CO_2}$'],
              ['**Iónica**', 'um metal e um não metal', 'o metal cede eletrões e forma catiões; o não metal recebe-os e forma aniões; os iões de cargas opostas atraem-se numa rede (cristal iónico)', '$\\mathrm{NaCl}$ ($\\mathrm{Na^+}$ e $\\mathrm{Cl^-}$), $\\mathrm{MgO}$'],
              ['**Metálica**', 'átomos de metais', 'os eletrões de valência ficam deslocalizados, partilhados por uma rede de catiões; por isso os metais conduzem a corrente elétrica', '$\\mathrm{Cu}$, $\\mathrm{Fe}$, $\\mathrm{Na}$'],
            ],
          },
          {
            tipo: 'definicao',
            texto: 'No **modelo de Lewis**, representam-se só os **eletrões de valência**, por pontos ou traços. Um par partilhado entre dois átomos é um **par ligante** (um traço); um par que pertence a um só átomo é um **par não ligante**.',
          },
          {
            tipo: 'definicao',
            texto: '**Regra do octeto:** nas moléculas, cada átomo tende a ficar rodeado por 8 eletrões de valência (4 pares), como o gás nobre do seu período. O hidrogénio fica com 2 (um par), como o hélio. Há exceções: no $\\mathrm{BF_3}$ o boro fica só com 6.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Escreve a estrutura de Lewis do amoníaco, $\\mathrm{NH_3}$, e indica o número de pares não ligantes ($Z(\\mathrm{N}) = 7$, $Z(\\mathrm{H}) = 1$).',
            resolucao: [
              'Eletrões de valência: o N ($' + Q.configuracao(7).spd.replace(/ /g, '\\,') + '$) tem ' + Mol.eletroesValenciaAtomo('N') + ' e cada H tem 1: $' + Mol.eletroesValenciaAtomo('N') + ' + 3 \\times 1 = ' + Mol.contar('NH3').eletroesValencia + '$ eletrões, ou seja, ' + Mol.contar('NH3').eletroesValencia / 2 + ' pares.',
              'O N fica no centro e liga-se a cada H por um par ligante: ' + Mol.contar('NH3').paresLigantes + ' pares ligantes.',
              'Sobra ' + Mol.contar('NH3').paresNaoLigantes + ' par, que fica no N como par não ligante. Confirma: o N tem 8 eletrões à volta (octeto) e cada H tem 2.',
            ],
            resultado: 1,
            verificar: () => Mol.contar('NH3').paresNaoLigantes,
          },
          {
            tipo: 'esquema',
            id: 'fqa-molecula',
            opcoes: { molecula: 'NH3', modo: 'lewis' },
            legenda: 'Estrutura de Lewis do amoníaco: três pares ligantes (os traços N–H) e um par não ligante no nitrogénio.',
          },
          {
            tipo: 'texto',
            texto: 'Dois átomos podem partilhar mais de um par: uma **ligação dupla** tem 2 pares ligantes e uma **ligação tripla** tem 3. No $\\mathrm{O_2}$ a ligação é dupla ($\\mathrm{O{=}O}$); no $\\mathrm{N_2}$ é tripla ($\\mathrm{N{\\equiv}N}$); no $\\mathrm{CO_2}$ o carbono faz duas ligações duplas, $\\mathrm{O{=}C{=}O}$.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-molecula',
            opcoes: { molecula: 'N2', modo: 'lewis' },
            legenda: 'Estrutura de Lewis do nitrogénio, N₂: uma ligação tripla (3 pares ligantes) e um par não ligante em cada átomo. Cada N fica com 8 eletrões.',
          },
          {
            tipo: 'texto',
            texto: '**Parâmetros de ligação.** Para ligações entre átomos **dos mesmos elementos**, quanto mais pares ligantes (maior a ordem de ligação), mais forte e mais curta é a ligação: os núcleos ficam mais ligados e mais próximos.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Ligação', 'Energia de ligação (kJ/mol)', 'Comprimento de ligação (pm)'],
            linhas: ['C-C', 'C=C', 'C≡C', 'N-N', 'N=N', 'N≡N'].map((k) => [lig(k), String(E(k)), String(comp(k))]),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Quebrar uma ligação **não** liberta energia: absorve. É ao **formar** ligações que se liberta energia. E uma ligação dupla não vale o dobro da simples: $E(\\mathrm{C{=}C}) = ' + E('C=C') + '\\,\\mathrm{kJ\\,mol^{-1}}$, menos do que $2 \\times ' + E('C-C') + ' = ' + 2 * E('C-C') + '\\,\\mathrm{kJ\\,mol^{-1}}$.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'A regra "mais pares, mais curta e mais forte" só compara ligações entre os **mesmos elementos** (C–C, C=C, C≡C). Entre elementos diferentes, o tamanho dos átomos também conta: a ligação simples Cl–Cl (' + comp('Cl-Cl') + ' pm) é muito mais comprida do que a H–H (' + comp('H-H') + ' pm).',
          },
        ],
        resumo: [
          'Ligação química: o sistema de átomos ligados tem menor energia (é mais estável) do que os átomos separados.',
          'Atração núcleo–eletrões de átomos diferentes; repulsão núcleo–núcleo e eletrão–eletrão. Equilíbrio no mínimo de energia.',
          'Mínimo do gráfico energia × distância: comprimento de ligação (distância) e energia de ligação (profundidade).',
          'Formar ligações liberta energia; quebrá-las absorve energia.',
          'Covalente: partilha de pares de eletrões (não metais). Iónica: atração entre iões (metal + não metal). Metálica: eletrões deslocalizados numa rede de catiões.',
          'Lewis: só eletrões de valência; pares ligantes e não ligantes; regra do octeto (H fica com 2).',
          'Mesmos elementos: simples → dupla → tripla, a energia de ligação aumenta e o comprimento diminui.',
        ],
        quiz: [
          {
            id: 'ligacao-q01',
            tipo: 'escolha',
            enunciado: 'Que tipo de ligação existe no cloreto de sódio, $\\mathrm{NaCl}$, sólido?',
            opcoes: ['Iónica', 'Covalente', 'Metálica', 'Ligação de hidrogénio'],
            correta: 0,
            explicacao: 'O sódio (metal) cede um eletrão ao cloro (não metal): formam-se iões $\\mathrm{Na^+}$ e $\\mathrm{Cl^-}$, que se atraem numa rede. É uma ligação iónica.',
            errosTipicos: [
              { codigo: 'covalente_entre_metal_e_nao_metal', opcao: 1, explicacao: 'A ligação covalente (partilha de pares) é típica entre não metais. Entre um metal e um não metal há transferência de eletrões e formam-se iões: ligação iónica.' },
              { codigo: 'metalica_por_ter_um_metal', opcao: 2, explicacao: 'A ligação metálica é entre átomos de metais. No NaCl só o sódio é metal; o cloro recebe o eletrão e forma-se uma rede de iões.' },
              { codigo: 'confundiu_ligacao_com_interacao_intermolecular', opcao: 3, explicacao: 'A ligação de hidrogénio é uma interação **entre moléculas**, com H ligado a N, O ou F. O NaCl não é formado por moléculas: é uma rede de iões.' },
            ],
          },
          {
            id: 'ligacao-q02',
            tipo: 'escolha',
            enunciado: 'Na estrutura de Lewis do dióxido de carbono, $\\mathrm{O{=}C{=}O}$, quantos pares de eletrões não ligantes há no total?',
            opcoes: [String(Mol.contar('CO2').paresNaoLigantes), '0', '2', String(2 * Mol.contar('CO2').paresNaoLigantes)],
            correta: 0,
            explicacao: 'Há ' + Mol.contar('CO2').eletroesValencia + ' eletrões de valência (' + Mol.contar('CO2').eletroesValencia / 2 + ' pares). As duas ligações duplas usam ' + Mol.contar('CO2').paresLigantes + ' pares; sobram ' + Mol.contar('CO2').paresNaoLigantes + ', dois em cada oxigénio. O carbono não tem pares não ligantes.',
            errosTipicos: [
              { codigo: 'contou_so_o_atomo_central', opcao: 1, explicacao: 'O carbono (átomo central) não tem pares não ligantes, mas cada oxigénio tem 2: no total são 4.' },
              { codigo: 'contou_so_um_oxigenio', opcao: 2, explicacao: 'Contaste só os 2 pares de um oxigénio; o outro oxigénio também tem 2.' },
              { codigo: 'contou_eletroes_em_vez_de_pares', opcao: 3, explicacao: '8 é o número de **eletrões** não ligantes. Em pares são $8 \\div 2 = 4$.' },
            ],
          },
          {
            id: 'ligacao-q03',
            tipo: 'escolha',
            enunciado: 'Qual é a ordem **crescente** do comprimento das ligações carbono–carbono?',
            opcoes: ['C≡C < C=C < C–C', 'C–C < C=C < C≡C', 'C=C < C–C < C≡C', 'São todas iguais: os átomos são os mesmos.'],
            correta: 0,
            explicacao: 'Mais pares ligantes entre os mesmos átomos aproximam os núcleos: ' + ['C≡C', 'C=C', 'C-C'].map((k) => lig(k) + ' ' + comp(k) + ' pm').join(' < ') + '. A energia de ligação varia ao contrário (' + ['C-C', 'C=C', 'C≡C'].map((k) => E(k)).join(' < ') + ' kJ/mol).',
            errosTipicos: [
              { codigo: 'ligacao_multipla_mais_comprida', opcao: 1, explicacao: 'É ao contrário: mais pares ligantes atraem mais os núcleos, que ficam mais próximos. A tripla é a mais curta.' },
              { codigo: 'comprimento_independente_da_ordem', opcao: 3, explicacao: 'Os átomos são os mesmos, mas o número de pares partilhados muda o comprimento: ' + comp('C-C') + ', ' + comp('C=C') + ' e ' + comp('C≡C') + ' pm.' },
            ],
          },
          {
            id: 'ligacao-q04',
            tipo: 'vf',
            enunciado: 'Quando dois átomos de hidrogénio se ligam para formar $\\mathrm{H_2}$, o sistema absorve energia.',
            correta: false,
            explicacao: 'Na formação de uma ligação há **libertação** de energia (' + E('H-H') + ' kJ por mole de ligações H–H): a molécula tem menor energia do que os átomos separados. É a quebra que absorve energia.',
            errosTipicos: [
              { codigo: 'formacao_de_ligacao_absorve_energia', explicacao: 'Formar uma ligação liberta energia; quebrá-la é que absorve. A molécula é mais estável (menor energia) do que os átomos separados.' },
            ],
          },
          {
            id: 'ligacao-q05',
            tipo: 'numerica',
            enunciado: 'A energia de ligação Cl–Cl é $' + E('Cl-Cl') + '\\,\\mathrm{kJ\\,mol^{-1}}$. Que energia, em kJ, é necessária para quebrar todas as ligações em $2{,}00\\,\\mathrm{mol}$ de $\\mathrm{Cl_2}$?',
            resposta: 480,
            tolerancia: 0.5,
            resolucao: [
              'Cada molécula de $\\mathrm{Cl_2}$ tem uma ligação Cl–Cl, logo há $2{,}00\\,\\mathrm{mol}$ de ligações.',
              '$E = 2{,}00 \\times ' + E('Cl-Cl') + ' = ' + 2 * E('Cl-Cl') + '\\,\\mathrm{kJ}$',
            ],
            verificar: () => 2 * E('Cl-Cl'),
            errosTipicos: [
              { codigo: 'dividiu_pela_quantidade', valor: 120, explicacao: 'Dividiste $' + E('Cl-Cl') + ' \\div 2{,}00 = 120$. A energia de ligação é por mole: para 2 mol de ligações multiplica-se, $2{,}00 \\times ' + E('Cl-Cl') + ' = ' + 2 * E('Cl-Cl') + '\\,\\mathrm{kJ}$.' },
              { codigo: 'contou_duas_ligacoes_por_molecula', valor: 960, explicacao: 'Contaste duas ligações por molécula e obtiveste 960 kJ; o $\\mathrm{Cl_2}$ tem dois átomos mas só **uma** ligação Cl–Cl.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'geometria',
        titulo: 'Geometria e polaridade das moléculas',
        ae: [
          'Prever a geometria das moléculas com base na repulsão dos pares de eletrões da camada de valência e prever a polaridade de moléculas simples.',
          'Interpretar as forças de Van der Waals e pontes de hidrogénio em interações intermoleculares, discutindo as suas implicações na estrutura e propriedades da matéria e a sua importância em sistemas biológicos.',
        ],
        minutos: 12,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Os pares de eletrões de valência à volta do átomo central (ligantes e não ligantes) **repelem-se** e afastam-se o mais possível uns dos outros. A posição dos átomos que daí resulta é a **geometria** da molécula.',
          },
          {
            tipo: 'texto',
            texto: 'Para prever a geometria: desenha a estrutura de Lewis, conta à volta do átomo central as ligações (uma ligação dupla ou tripla conta como uma direção) e os pares não ligantes. Os pares não ligantes repelem mais do que os ligantes e "fecham" os ângulos.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Molécula', 'Átomo central: ligações + pares não ligantes', 'Geometria', 'Ângulo de ligação'],
            linhas: ['CO2', 'BF3', 'CH4', 'NH3', 'H2O'].map((id) => {
              const ce = central(id);
              return ['$' + mol(id).formula + '$', ce.el + ': ' + ce.ligacoes + ' + ' + ce.pares, mol(id).geometria, angulo(id)];
            }),
          },
          {
            tipo: 'esquema',
            id: 'fqa-geometria',
            opcoes: { molecula: 'H2O' },
            legenda: 'Roda a molécula e escolhe outras: vê os pares não ligantes, o ângulo de ligação, a geometria e se a molécula é polar.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Prevê a geometria da molécula de amoníaco, $\\mathrm{NH_3}$, e explica porque é que o ângulo de ligação é menor do que no metano.',
            resolucao: [
              'Estrutura de Lewis: o N faz ' + central('NH3').ligacoes + ' ligações simples com H e tem ' + central('NH3').pares + ' par não ligante; são 4 pares à volta do N, que se dispõem como num tetraedro.',
              'Os átomos ocupam só 3 desses vértices (o 4.º é o par não ligante): a molécula é **' + mol('NH3').geometria + '**.',
              'O par não ligante repele mais do que os pares ligantes e aproxima as ligações N–H: o ângulo é cerca de ' + angulo('NH3') + ', menor do que ' + angulo('CH4') + ' no $\\mathrm{CH_4}$ (sem pares não ligantes).',
            ],
          },
          {
            tipo: 'definicao',
            texto: 'Uma ligação covalente entre átomos **diferentes** é **polar**: um dos átomos atrai mais os eletrões partilhados e fica com carga parcial negativa ($\\delta-$); o outro fica com carga parcial positiva ($\\delta+$). No $\\mathrm{HCl}$, o cloro atrai mais o par ligante. Entre átomos iguais (H–H, Cl–Cl) a ligação é **apolar**.',
          },
          {
            tipo: 'texto',
            texto: 'Uma molécula é **polar** quando as cargas parciais não se compensam, por causa da geometria. No $\\mathrm{CO_2}$ (' + mol('CO2').geometria + ') as duas ligações C=O são polares mas opostas: anulam-se e a molécula é ' + polar('CO2') + '. Na água (' + mol('H2O').geometria + ') não se anulam: a molécula é ' + polar('H2O') + '.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Molécula', 'Geometria', 'Ligações polares?', 'Polaridade da molécula'],
            linhas: ['H2', 'HCl', 'CO2', 'BF3', 'CH4', 'NH3', 'H2O'].map((id) => {
              const m = mol(id);
              const polares = m.atomos.some((a) => a.el !== m.atomos[0].el);
              return ['$' + m.formula + '$', m.geometria, polares ? 'sim' : 'não', polar(id)];
            }),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não é verdade que todas as moléculas com ligações polares sejam polares. $\\mathrm{CO_2}$, $\\mathrm{BF_3}$ e $\\mathrm{CH_4}$ têm ligações polares, mas a geometria simétrica faz com que se anulem: as moléculas são apolares. Olha sempre para a geometria.',
          },
          {
            tipo: 'texto',
            texto: '**Ligações e interações intermoleculares.** As ligações covalentes unem os átomos **dentro** de cada molécula (são intramoleculares). Entre moléculas vizinhas há também atrações, as **interações intermoleculares**, muito mais fracas. São elas que mantêm as moléculas juntas nos líquidos e nos sólidos.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Interação', 'Entre', 'Exemplo'],
            linhas: [
              ['**Dispersão de London** (Van der Waals)', 'todas as moléculas; são as únicas entre moléculas apolares. Aumentam com o tamanho da molécula (número de eletrões).', '$\\mathrm{Cl_2}$, $\\mathrm{CH_4}$, $\\mathrm{CO_2}$'],
              ['**Dipolo–dipolo** (Van der Waals)', 'moléculas polares: o $\\delta+$ de uma atrai o $\\delta-$ da outra', '$\\mathrm{HCl}$'],
              ['**Dipolo–dipolo induzido** (Van der Waals)', 'uma molécula polar e uma apolar: a polar deforma a nuvem eletrónica da apolar', '$\\mathrm{O_2}$ dissolvido na água'],
              ['**Ligação de hidrogénio**', 'um H ligado a N, O ou F de uma molécula e um par não ligante de N, O ou F de outra', '$\\mathrm{H_2O}$, $\\mathrm{NH_3}$, $\\mathrm{HF}$, etanol'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'A **ligação de hidrogénio** (em textos mais antigos, "ponte de hidrogénio") é a mais forte das interações intermoleculares, mas é muito mais fraca do que uma ligação covalente.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Que interações intermoleculares existem entre moléculas de amoníaco, $\\mathrm{NH_3}$? Qual é a mais forte?',
            resolucao: [
              'Há dispersão de London, como entre quaisquer moléculas.',
              'A molécula é ' + polar('NH3') + ' (' + mol('NH3').geometria + '): há também interações dipolo–dipolo.',
              'Cada H está ligado ao N, e o N tem um par não ligante: formam-se **ligações de hidrogénio**, que são as mais fortes.',
            ],
          },
          {
            tipo: 'texto',
            texto: '**Consequências.** Quanto mais fortes as interações intermoleculares, mais energia é preciso para afastar as moléculas e mais alto é o ponto de ebulição. A água é líquida à temperatura ambiente, enquanto o sulfureto de hidrogénio, $\\mathrm{H_2S}$, com moléculas maiores mas sem ligações de hidrogénio, é um gás.',
          },
          {
            tipo: 'texto',
            texto: 'Na **solubilidade**, "semelhante dissolve semelhante": o etanol mistura-se com a água porque forma ligações de hidrogénio com ela; o azeite (apolar) não se mistura. Nos halogénios (apolares), a dispersão aumenta com o tamanho: à temperatura ambiente o cloro é gás, o bromo é líquido e o iodo é sólido.',
          },
          {
            tipo: 'texto',
            texto: '**Nos seres vivos**, as ligações de hidrogénio mantêm unidas as duas cadeias da dupla hélice do DNA e dão a forma às proteínas. São também a razão de o gelo ser menos denso do que a água líquida e flutuar, o que protege a vida nos lagos gelados.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não confundas ligações intramoleculares com interações intermoleculares. Quando a água ferve, quebram-se as ligações de hidrogénio **entre** moléculas; as ligações O–H **dentro** de cada molécula ficam intactas (o vapor continua a ser $\\mathrm{H_2O}$, não $\\mathrm{H_2}$ e $\\mathrm{O_2}$).',
          },
        ],
        resumo: [
          'Os pares de eletrões à volta do átomo central repelem-se e afastam-se o mais possível; os não ligantes repelem mais.',
          ['CO2', 'BF3', 'CH4', 'NH3', 'H2O'].map((id) => '$' + mol(id).formula + '$ ' + mol(id).geometria + ' (' + angulo(id) + ')').join('; ') + '.',
          'Ligação entre átomos diferentes: polar. A molécula é polar se as cargas parciais não se anularem (depende da geometria).',
          'Ligações polares numa molécula simétrica ($\\mathrm{CO_2}$, $\\mathrm{BF_3}$, $\\mathrm{CH_4}$) dão uma molécula apolar.',
          'Van der Waals: dispersão de London (todas), dipolo–dipolo (polares), dipolo–dipolo induzido (polar + apolar).',
          'Ligação de hidrogénio: H ligado a N, O ou F com um par não ligante de N, O ou F de outra molécula; a mais forte das intermoleculares.',
          'Interações intermoleculares mais fortes: maior ponto de ebulição. Ferver quebra interações entre moléculas, não ligações covalentes.',
        ],
        quiz: [
          {
            id: 'geometria-q01',
            tipo: 'escolha',
            enunciado: 'Qual é a geometria da molécula de metano, $\\mathrm{CH_4}$?',
            opcoes: ['Tetraédrica', 'Quadrangular plana', 'Piramidal trigonal', 'Triangular plana'],
            correta: 0,
            explicacao: 'O carbono tem ' + central('CH4').ligacoes + ' pares ligantes e nenhum não ligante; afastam-se o mais possível no espaço, para os vértices de um tetraedro, com ângulos de ' + angulo('CH4') + '.',
            errosTipicos: [
              { codigo: 'geometria_pela_formula_no_plano', opcao: 1, explicacao: 'A fórmula de estrutura desenhada no papel parece uma cruz plana (ângulos de 90°), mas no espaço os 4 pares afastam-se mais: ficam num tetraedro, com ' + angulo('CH4') + '.' },
              { codigo: 'piramidal_sem_par_nao_ligante', opcao: 2, explicacao: 'A geometria piramidal trigonal é a do $\\mathrm{NH_3}$: 3 ligações e um par não ligante. O carbono do metano faz 4 ligações e não tem pares não ligantes.' },
            ],
          },
          {
            id: 'geometria-q02',
            tipo: 'escolha',
            enunciado: 'Qual destas moléculas é **apolar**, apesar de ter ligações polares?',
            opcoes: ['$\\mathrm{CO_2}$', '$\\mathrm{H_2O}$', '$\\mathrm{NH_3}$', '$\\mathrm{HCl}$'],
            correta: 0,
            explicacao: 'O $\\mathrm{CO_2}$ é ' + mol('CO2').geometria + ' (' + angulo('CO2') + '): as duas ligações C=O, polares, ficam em sentidos opostos e anulam-se.',
            errosTipicos: [
              { codigo: 'agua_linear', opcao: 1, explicacao: 'A água é ' + mol('H2O').geometria + ' (cerca de ' + angulo('H2O') + '), por causa dos 2 pares não ligantes do oxigénio: as ligações O–H não se anulam e a molécula é polar.' },
              { codigo: 'ignorou_o_par_nao_ligante', opcao: 2, explicacao: 'O $\\mathrm{NH_3}$ é ' + mol('NH3').geometria + ': o par não ligante do N tira-lhe a simetria e as ligações N–H não se anulam. É polar.' },
              { codigo: 'diatomica_heteronuclear_apolar', opcao: 3, explicacao: 'No $\\mathrm{HCl}$ há uma só ligação, polar: nada a compensa, logo a molécula é polar.' },
            ],
          },
          {
            id: 'geometria-q03',
            tipo: 'vf',
            enunciado: 'O ângulo de ligação no $\\mathrm{NH_3}$ é menor do que no $\\mathrm{CH_4}$ porque o par não ligante do nitrogénio repele mais os pares ligantes.',
            correta: true,
            explicacao: 'Ambos têm 4 pares à volta do átomo central, mas o par não ligante do N repele mais e fecha as ligações: ' + angulo('NH3') + ' no $\\mathrm{NH_3}$ contra ' + angulo('CH4') + ' no $\\mathrm{CH_4}$.',
          },
          {
            id: 'geometria-q04',
            tipo: 'escolha',
            enunciado: 'Que interações intermoleculares existem entre as moléculas de cloro, $\\mathrm{Cl_2}$, no estado líquido?',
            opcoes: ['Só forças de dispersão de London', 'Interações dipolo–dipolo', 'Ligações de hidrogénio', 'Ligações covalentes Cl–Cl'],
            correta: 0,
            explicacao: 'O $\\mathrm{Cl_2}$ é ' + polar('Cl2') + ' (dois átomos iguais): entre as suas moléculas só há forças de dispersão de London.',
            errosTipicos: [
              { codigo: 'molecula_apolar_com_dipolo_dipolo', opcao: 1, explicacao: 'As interações dipolo–dipolo exigem moléculas polares. A ligação Cl–Cl é entre átomos iguais, logo a molécula é apolar.' },
              { codigo: 'ligacao_de_hidrogenio_sem_h', opcao: 2, explicacao: 'Não há hidrogénio no $\\mathrm{Cl_2}$; a ligação de hidrogénio exige H ligado a N, O ou F.' },
              { codigo: 'confundiu_intramolecular_com_intermolecular', opcao: 3, explicacao: 'A ligação covalente Cl–Cl é **dentro** de cada molécula (intramolecular). Entre moléculas só há forças de dispersão.' },
            ],
          },
          {
            id: 'geometria-q05',
            tipo: 'escolha',
            enunciado: 'Quando a água ferve, o que é que se quebra?',
            opcoes: [
              'Interações entre moléculas de água, sobretudo ligações de hidrogénio',
              'As ligações covalentes O–H, formando-se hidrogénio e oxigénio',
              'As ligações iónicas entre os iões da água',
              'Nada: a água muda de estado sem que nada se quebre',
            ],
            correta: 0,
            explicacao: 'Na ebulição as moléculas afastam-se umas das outras: vencem-se as interações intermoleculares (sobretudo ligações de hidrogénio). As moléculas de $\\mathrm{H_2O}$ mantêm-se inteiras.',
            errosTipicos: [
              { codigo: 'confundiu_intramolecular_com_intermolecular', opcao: 1, explicacao: 'O vapor de água continua a ser $\\mathrm{H_2O}$: as ligações O–H dentro das moléculas não se quebram. O que se vence são as interações entre moléculas.' },
              { codigo: 'agua_como_composto_ionico', opcao: 2, explicacao: 'A água é formada por moléculas, com ligações covalentes; não é um composto iónico.' },
            ],
          },
          {
            id: 'geometria-q06',
            tipo: 'escolha',
            enunciado: 'Qual é a geometria da molécula de água?',
            opcoes: ['Angular', 'Linear', 'Triangular plana', 'Tetraédrica'],
            correta: 0,
            explicacao: 'O oxigénio tem ' + central('H2O').ligacoes + ' pares ligantes e ' + central('H2O').pares + ' não ligantes (4 pares, como num tetraedro); só 2 vértices têm átomos, por isso a molécula é ' + mol('H2O').geometria + ', com cerca de ' + angulo('H2O') + '.',
            errosTipicos: [
              { codigo: 'ignorou_os_pares_nao_ligantes', opcao: 1, explicacao: 'Com só duas ligações e sem pares não ligantes seria linear (como o $\\mathrm{CO_2}$); mas o oxigénio tem 2 pares não ligantes, que empurram as ligações O–H: a molécula é angular.' },
              { codigo: 'deu_a_disposicao_dos_pares', opcao: 3, explicacao: 'Os 4 pares dispõem-se como num tetraedro, mas a geometria descreve só a posição dos **átomos**: com 3 átomos, a molécula é angular.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'carbono',
        titulo: 'Compostos de carbono',
        ae: [
          'Reconhecer a importância química dos compostos de carbono, a variabilidade das suas estruturas moleculares e a multiplicidade das ligações estabelecidas.',
          'Distinguir hidrocarbonetos saturados de insaturados.',
          'Identificar, com base em informação selecionada, grupos funcionais (álcoois, aldeídos, cetonas, ácidos carboxílicos e aminas) em moléculas orgânicas, biomoléculas e fármacos, a partir das suas fórmulas de estrutura.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'texto',
            texto: 'O carbono ($Z = 6$, $' + Q.configuracao(6).spd.replace(/ /g, '\\,') + '$) tem ' + Q.configuracao(6).valencia + ' eletrões de valência e faz 4 ligações covalentes. Pode ligar-se a outros átomos de carbono por ligações **simples, duplas ou triplas**, formando cadeias lineares, ramificadas ou em anel.',
          },
          {
            tipo: 'texto',
            texto: 'Por isso há milhões de compostos de carbono, com estruturas muito variadas. Estão nos seres vivos (glícidos, lípidos, proteínas, ácidos nucleicos), nos combustíveis, nos plásticos, nos medicamentos e nos alimentos.',
          },
          {
            tipo: 'definicao',
            texto: 'Os **hidrocarbonetos** são compostos formados só por carbono e hidrogénio. São **saturados** se só têm ligações simples entre átomos de carbono (**alcanos**) e **insaturados** se têm pelo menos uma ligação dupla (**alcenos**) ou tripla (**alcinos**) entre átomos de carbono.',
          },
          {
            tipo: 'formula',
            texto: 'Com $n$ átomos de carbono numa cadeia aberta: alcano $\\mathrm{C_nH_{2n+2}}$; alceno (uma dupla) $\\mathrm{C_nH_{2n}}$; alcino (uma tripla) $\\mathrm{C_nH_{2n-2}}$.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Átomos de C', 'Prefixo', 'Alcano', 'Alceno', 'Alcino'],
            linhas: [
              ['1', 'met-', 'metano, $\\mathrm{CH_4}$', '—', '—'],
              ['2', 'et-', 'etano, $\\mathrm{C_2H_6}$', 'eteno, $\\mathrm{C_2H_4}$', 'etino, $\\mathrm{C_2H_2}$'],
              ['3', 'prop-', 'propano, $\\mathrm{C_3H_8}$', 'propeno, $\\mathrm{C_3H_6}$', 'propino, $\\mathrm{C_3H_4}$'],
              ['4', 'but-', 'butano, $\\mathrm{C_4H_{10}}$', 'buteno, $\\mathrm{C_4H_8}$', 'butino, $\\mathrm{C_4H_6}$'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'O nome tem o prefixo do número de átomos de carbono e a terminação **-ano** (só simples), **-eno** (dupla) ou **-ino** (tripla). A partir de 4 carbonos a posição da ligação múltipla indica-se com um número: but-1-eno e but-2-eno são compostos diferentes.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-molecula',
            opcoes: { molecula: 'C2H4', modo: 'estrutura' },
            legenda: 'Fórmula de estrutura do eteno: uma ligação dupla entre os dois carbonos, por isso é um hidrocarboneto insaturado.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'O hidrocarboneto $\\mathrm{C_3H_4}$, de cadeia aberta, é saturado ou insaturado? Dá-lhe o nome.',
            resolucao: [
              'Com $n = 3$: um alcano teria $2 \\times 3 + 2 = 8$ hidrogénios e um alceno $2 \\times 3 = 6$.',
              'Tem $2 \\times 3 - 2 = 4$ hidrogénios: é um alcino, com uma ligação tripla. É **insaturado**.',
              'Três carbonos e tripla: **propino**.',
            ],
            resultado: 4,
            verificar: () => 2 * 3 - 2,
          },
          {
            tipo: 'definicao',
            texto: 'Um **grupo funcional** é um átomo ou grupo de átomos que dá a uma família de compostos propriedades químicas semelhantes. Reconhece-se na fórmula de estrutura.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Família', 'Grupo funcional', 'Terminação do nome', 'Exemplo'],
            linhas: [
              ['Álcool', '$\\mathrm{-OH}$ (hidroxilo) ligado a um carbono com só ligações simples', '-ol', mol('C2H5OH').nome + ', $' + mol('C2H5OH').formula + '$'],
              ['Aldeído', '$\\mathrm{-CHO}$: C=O na ponta da cadeia, com o carbono ligado a um H', '-al', mol('CH3CHO').nome + ', $' + mol('CH3CHO').formula + '$'],
              ['Cetona', 'C=O (carbonilo) entre dois átomos de carbono', '-ona', mol('CH3COCH3').nome + ', $' + mol('CH3COCH3').formula + '$'],
              ['Ácido carboxílico', '$\\mathrm{-COOH}$ (carboxilo): C=O e −OH no mesmo carbono', 'ácido …-oico', mol('CH3COOH').nome + ', $' + mol('CH3COOH').formula + '$'],
              ['Amina', '$\\mathrm{-NH_2}$ (amino): nitrogénio ligado a um carbono', '-amina', mol('CH3NH2').nome + ', $' + mol('CH3NH2').formula + '$'],
            ],
          },
          {
            tipo: 'esquema',
            id: 'fqa-molecula',
            opcoes: { molecula: 'CH3COOH', modo: 'estrutura' },
            legenda: 'Fórmula de estrutura do ácido etanoico (o ácido do vinagre): o grupo carboxilo, −COOH, tem C=O e −OH no mesmo carbono.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-molecula',
            opcoes: { molecula: 'CH3CHO', modo: 'estrutura' },
            legenda: 'Fórmula de estrutura do etanal, um aldeído: o C=O está na ponta da cadeia, com o carbono ligado a um H.',
          },
          {
            tipo: 'texto',
            texto: '**Em biomoléculas e fármacos.** Os aminoácidos, que formam as proteínas, têm um grupo amina e um grupo ácido carboxílico. A glicose tem vários grupos álcool e, na forma de cadeia aberta, um grupo aldeído. A aspirina (ácido acetilsalicílico) tem um grupo ácido carboxílico, entre outros que não estudas este ano.',
          },
          {
            tipo: 'texto',
            texto: 'Alguns compostos do dia a dia: o etanol está nas bebidas alcoólicas e no álcool etílico; a propanona (acetona) está em removedores de verniz; o ácido etanoico (ácido acético) dá o sabor ao vinagre.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não confundas aldeído com cetona: os dois têm C=O, mas no **aldeído** o C=O está na ponta da cadeia (ligado a um H) e na **cetona** está entre dois carbonos. E o −OH de um álcool não é o ião hidróxido, $\\mathrm{OH^-}$: está ligado covalentemente ao carbono.',
          },
        ],
        resumo: [
          'O carbono faz 4 ligações covalentes (simples, duplas ou triplas) e forma cadeias: daí a enorme variedade de compostos de carbono.',
          'Hidrocarbonetos: só C e H. Saturados (alcanos, só simples) e insaturados (alcenos com dupla, alcinos com tripla).',
          'Alcano $\\mathrm{C_nH_{2n+2}}$, alceno $\\mathrm{C_nH_{2n}}$, alcino $\\mathrm{C_nH_{2n-2}}$; prefixos met-, et-, prop-, but-.',
          'Álcool −OH (-ol); aldeído −CHO (-al); cetona C=O entre carbonos (-ona); ácido carboxílico −COOH (ácido …-oico); amina −NH₂ (-amina).',
          'Biomoléculas e fármacos têm vários grupos funcionais: aminoácidos (amina + ácido carboxílico), glicose (álcool + aldeído).',
        ],
        quiz: [
          {
            id: 'carbono-q01',
            tipo: 'escolha',
            enunciado: 'Qual destes hidrocarbonetos é **insaturado**?',
            opcoes: ['$\\mathrm{C_2H_4}$', '$\\mathrm{C_2H_6}$', '$\\mathrm{C_3H_8}$', '$\\mathrm{CH_4}$'],
            correta: 0,
            explicacao: 'Com 2 carbonos, $2 \\times 2 = 4$ hidrogénios corresponde a um alceno: o ' + mol('C2H4').nome + ' tem uma ligação dupla C=C. Os outros seguem $\\mathrm{C_nH_{2n+2}}$: são alcanos, saturados.',
            errosTipicos: [
              { codigo: 'mais_hidrogenios_insaturado', opcao: 1, explicacao: 'O $\\mathrm{C_2H_6}$ (etano) tem o número máximo de hidrogénios, $2 \\times 2 + 2 = 6$: só ligações simples, é saturado. "Insaturado" quer dizer que tem menos H do que o máximo.' },
            ],
          },
          {
            id: 'carbono-q02',
            tipo: 'escolha',
            enunciado: 'Qual é o nome do hidrocarboneto $\\mathrm{C_4H_{10}}$?',
            opcoes: ['Butano', 'Buteno', 'Butino', 'Propano'],
            correta: 0,
            explicacao: '4 carbonos: prefixo but-. $2 \\times 4 + 2 = 10$ hidrogénios: é um alcano (só ligações simples), terminação -ano.',
            errosTipicos: [
              { codigo: 'terminacao_eno_num_alcano', opcao: 1, explicacao: 'O buteno, com uma dupla, seria $\\mathrm{C_4H_8}$. Com 10 hidrogénios só há ligações simples: butano.' },
              { codigo: 'terminacao_ino_num_alcano', opcao: 2, explicacao: 'O butino, com uma tripla, seria $\\mathrm{C_4H_6}$. Com 10 hidrogénios é um alcano: butano.' },
              { codigo: 'prefixo_errado', opcao: 3, explicacao: 'O prefixo prop- é de 3 carbonos ($\\mathrm{C_3H_8}$); com 4 é but-.' },
            ],
          },
          {
            id: 'carbono-q03',
            tipo: 'escolha',
            enunciado: 'A propanona, $\\mathrm{CH_3{-}CO{-}CH_3}$, tem um grupo C=O ligado a dois átomos de carbono. A que família pertence?',
            opcoes: ['Cetona', 'Aldeído', 'Ácido carboxílico', 'Álcool'],
            correta: 0,
            explicacao: 'O carbonilo (C=O) entre dois carbonos é o grupo das cetonas; daí a terminação -ona.',
            errosTipicos: [
              { codigo: 'confundiu_aldeido_com_cetona', opcao: 1, explicacao: 'No aldeído o C=O está na ponta da cadeia, com o carbono ligado a um H (−CHO). Aqui está entre dois carbonos: é uma cetona.' },
              { codigo: 'acido_sem_oh', opcao: 2, explicacao: 'O ácido carboxílico tem C=O **e** −OH no mesmo carbono (−COOH). Na propanona não há −OH.' },
              { codigo: 'alcool_por_ter_oxigenio', opcao: 3, explicacao: 'O álcool tem −OH (oxigénio ligado a H). Na propanona o oxigénio está em dupla com o carbono, sem H.' },
            ],
          },
          {
            id: 'carbono-q04',
            tipo: 'escolha',
            enunciado: 'Os aminoácidos, que formam as proteínas, têm na sua estrutura os grupos funcionais:',
            opcoes: ['amina e ácido carboxílico', 'álcool e aldeído', 'cetona e amina', 'só amina'],
            correta: 0,
            explicacao: 'O nome diz tudo: amino (grupo −NH₂, amina) e ácido (grupo −COOH, ácido carboxílico).',
            errosTipicos: [
              { codigo: 'esqueceu_o_grupo_acido', opcao: 3, explicacao: 'Têm o grupo amina, mas também um grupo ácido carboxílico, −COOH: são amino**ácidos**.' },
            ],
          },
          {
            id: 'carbono-q05',
            tipo: 'vf',
            enunciado: 'O etanol, $\\mathrm{C_2H_5OH}$, e o etanal, $\\mathrm{CH_3CHO}$, pertencem à mesma família de compostos.',
            correta: false,
            explicacao: 'O ' + mol('C2H5OH').nome + ' tem o grupo −OH (álcool, -ol); o ' + mol('CH3CHO').nome + ' tem o grupo −CHO (aldeído, -al). Têm o mesmo número de carbonos, mas grupos funcionais diferentes.',
            errosTipicos: [
              { codigo: 'mesmo_prefixo_mesma_familia', explicacao: 'O prefixo et- só diz que ambos têm 2 carbonos; a família vem do grupo funcional (−OH no etanol, −CHO no etanal), que se lê na terminação.' },
            ],
          },
          {
            id: 'carbono-q06',
            tipo: 'escolha',
            enunciado: 'Qual é a fórmula molecular do propino?',
            opcoes: ['$\\mathrm{C_3H_4}$', '$\\mathrm{C_3H_6}$', '$\\mathrm{C_3H_8}$', '$\\mathrm{C_3H_2}$'],
            correta: 0,
            explicacao: 'Alcino com $n = 3$: $\\mathrm{C_nH_{2n-2}} = \\mathrm{C_3H_4}$.',
            errosTipicos: [
              { codigo: 'formula_do_alceno', opcao: 1, explicacao: '$\\mathrm{C_3H_6}$ ($\\mathrm{C_nH_{2n}}$) é o propeno, com uma dupla. A terminação -ino indica uma tripla: $\\mathrm{C_nH_{2n-2}} = \\mathrm{C_3H_4}$.' },
              { codigo: 'formula_do_alcano', opcao: 2, explicacao: '$\\mathrm{C_3H_8}$ é o propano (só simples). O propino tem uma tripla: $\\mathrm{C_3H_4}$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'gases',
        titulo: 'Gases',
        ae: [
          'Compreender o conceito de volume molar de gases a partir da lei de Avogadro e concluir que este só depende da pressão e temperatura e não do gás em concreto.',
          'Aplicar, na resolução de problemas, os conceitos de massa, massa molar, fração molar, volume molar e massa volúmica de gases, explicando as estratégias de resolução.',
          'Pesquisar a composição da troposfera terrestre, identificando os gases poluentes e suas fontes, designadamente os gases que provocam efeitos de estufa e alternativas para minorar as fontes de poluição, comunicando as conclusões.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'definicao',
            texto: '**Lei de Avogadro:** volumes iguais de gases diferentes, à mesma pressão e à mesma temperatura, contêm o mesmo número de partículas. Ou seja, a $p$ e $T$ constantes, o volume de um gás é diretamente proporcional à quantidade de matéria, $V \\propto n$.',
          },
          {
            tipo: 'definicao',
            texto: 'O **volume molar**, $V_m$, é o volume ocupado por uma mole de gás: $V_m = \\dfrac{V}{n}$, em $\\mathrm{dm^3\\,mol^{-1}}$. Pela lei de Avogadro, **não depende do gás**, só da pressão e da temperatura (para gases com comportamento ideal).',
          },
          {
            tipo: 'formula',
            texto: 'Nas condições **PTN** (pressão e temperatura normais: $0\\,\\mathrm{°C}$ e $1\\,\\mathrm{atm}$): $V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$. Em quaisquer condições: $V = n\\,V_m$.',
          },
          {
            tipo: 'texto',
            texto: 'Se a temperatura aumenta (à mesma pressão), o gás expande-se e o volume molar aumenta; se a pressão aumenta (à mesma temperatura), diminui. Por exemplo, a $25\\,\\mathrm{°C}$ e $1\\,\\mathrm{atm}$ o volume molar é maior do que ' + VmT + ' dm³/mol.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Que volume ocupam $0{,}500\\,\\mathrm{mol}$ de oxigénio, $\\mathrm{O_2}$, em condições PTN ($V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$)?',
            resolucao: [
              '$V = n\\,V_m = 0{,}500 \\times ' + Vm + ' = ' + dec(Q.volumeGasPTN(0.5), 1) + '\\,\\mathrm{dm^3}$',
              'Nota: o resultado seria o mesmo para $0{,}500\\,\\mathrm{mol}$ de qualquer outro gás nas mesmas condições.',
            ],
            resultado: 11.2,
            verificar: () => arred(Q.volumeGasPTN(0.5), 3),
          },
          {
            tipo: 'formula',
            texto: 'Massa volúmica de um gás: $\\rho = \\dfrac{m}{V} = \\dfrac{n\\,M}{n\\,V_m} = \\dfrac{M}{V_m}$, em $\\mathrm{g\\,dm^{-3}}$. À mesma $p$ e $T$, o gás com maior massa molar é o mais denso.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a massa volúmica do dióxido de carbono, $\\mathrm{CO_2}$, em condições PTN ($A_r(\\mathrm{C}) = ' + Ar('C') + '$, $A_r(\\mathrm{O}) = ' + Ar('O') + '$, $V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$), com três algarismos significativos.',
            resolucao: [
              '$M(\\mathrm{CO_2}) = ' + Ar('C') + ' + 2 \\times ' + Ar('O') + ' = ' + dec(M({ C: 1, O: 2 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$',
              '$\\rho = \\dfrac{M}{V_m} = \\dfrac{' + dec(M({ C: 1, O: 2 }), 2) + '}{' + Vm + '} \\approx ' + dec(arred(Q.massaVolumicaGas(M({ C: 1, O: 2 })), 3), 2) + '\\,\\mathrm{g\\,dm^{-3}}$',
              'É mais denso do que o ar (cuja massa molar média é menor), por isso o $\\mathrm{CO_2}$ acumula-se junto ao chão em caves e grutas.',
            ],
            resultado: 1.96,
            verificar: () => arred(Q.massaVolumicaGas(M({ C: 1, O: 2 })), 3),
          },
          {
            tipo: 'definicao',
            texto: 'A **fração molar** de um componente A de uma mistura é $x_A = \\dfrac{n_A}{n_{\\text{total}}}$. Não tem unidades e a soma das frações molares de todos os componentes é 1. Numa mistura gasosa, pela lei de Avogadro, a fração molar é igual à fração em volume.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Gás (ar seco, troposfera)', 'Percentagem em volume', 'Fração molar'],
            linhas: D.atmosfera.slice(0, 4).map((x) => ['$\\mathrm{' + x.gas.replace(/(\d)/, '_$1') + '}$ (' + x.nome + ')', pct(x.gas) + ' %', String(Number((x.percentagem / 100).toPrecision(6))).replace('.', ',')]),
          },
          {
            tipo: 'texto',
            texto: 'A **troposfera** é a camada da atmosfera junto à superfície, onde vivemos. Além destes gases tem vapor de água, em quantidade muito variável, e vestígios de outros gases, como o metano.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Que volume de oxigénio existe em $20{,}0\\,\\mathrm{dm^3}$ de ar seco, sabendo que a percentagem em volume do $\\mathrm{O_2}$ é ' + pct('O2') + ' %?',
            resolucao: [
              'Fração molar (= fração em volume): $x(\\mathrm{O_2}) = \\dfrac{' + dec(ar('O2'), 2) + '}{100} = ' + dec(ar('O2') / 100, 4) + '$',
              '$V(\\mathrm{O_2}) = ' + dec(ar('O2') / 100, 4) + ' \\times 20{,}0 \\approx ' + dec(arred(20 * ar('O2') / 100, 3), 2) + '\\,\\mathrm{dm^3}$',
            ],
            resultado: 4.19,
            verificar: () => arred(Q.fracaoMolar(ar('O2'), 100) * 20.0, 3),
          },
          {
            tipo: 'quadro',
            cabecalho: ['Poluente', 'Principais fontes', 'Efeitos'],
            linhas: [
              ['monóxido de carbono, $\\mathrm{CO}$', 'combustões incompletas (motores, lareiras)', 'tóxico: impede o transporte de oxigénio no sangue'],
              ['óxidos de nitrogénio, $\\mathrm{NO}$ e $\\mathrm{NO_2}$', 'motores de combustão, centrais térmicas', 'chuva ácida, smog fotoquímico, problemas respiratórios'],
              ['dióxido de enxofre, $\\mathrm{SO_2}$', 'queima de carvão e de combustíveis com enxofre, vulcões', 'chuva ácida, problemas respiratórios'],
              ['partículas em suspensão', 'tráfego, indústria, incêndios', 'problemas respiratórios e cardiovasculares'],
              ['ozono troposférico, $\\mathrm{O_3}$', 'formado pela luz solar a partir de $\\mathrm{NO_2}$ e outros poluentes', 'smog fotoquímico, irritação respiratória, danos nas plantas'],
            ],
          },
          {
            tipo: 'texto',
            texto: '**Gases com efeito de estufa** absorvem a radiação infravermelha emitida pela Terra e aquecem a atmosfera: vapor de água, $\\mathrm{CO_2}$ (combustíveis fósseis, desflorestação), $\\mathrm{CH_4}$ (pecuária, aterros, arrozais), $\\mathrm{N_2O}$ (fertilizantes), CFC e ozono. O efeito de estufa natural torna a Terra habitável; o aumento destes gases intensifica-o e provoca o aquecimento global.',
          },
          {
            tipo: 'texto',
            texto: '**Alternativas** para reduzir a poluição: energias renováveis, eficiência energética, transportes públicos e veículos elétricos, catalisadores nos escapes, combustíveis com menos enxofre, reflorestação e menos desperdício.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'O valor $V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$ só vale em **PTN**. Noutras condições de pressão ou de temperatura o volume molar é outro (o enunciado tem de o dar). E atenção às unidades: $1\\,\\mathrm{dm^3} = 1\\,\\mathrm{L} = 1000\\,\\mathrm{mL} = 1000\\,\\mathrm{cm^3}$.',
          },
        ],
        resumo: [
          'Lei de Avogadro: à mesma $p$ e $T$, volumes iguais de gases têm o mesmo número de partículas; $V \\propto n$.',
          'Volume molar $V_m = V/n$: só depende de $p$ e $T$, não do gás. Em PTN ($0\\,\\mathrm{°C}$, $1\\,\\mathrm{atm}$), $V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$.',
          'Massa volúmica de um gás: $\\rho = M / V_m$; à mesma $p$ e $T$, maior $M$ dá gás mais denso.',
          'Fração molar $x_A = n_A / n_{\\text{total}}$, sem unidades; nos gases é igual à fração em volume.',
          'Ar seco: cerca de ' + Math.round(ar('N2')) + ' % de $\\mathrm{N_2}$, ' + Math.round(ar('O2')) + ' % de $\\mathrm{O_2}$, ' + pct('Ar') + ' % de árgon e ' + pct('CO2') + ' % de $\\mathrm{CO_2}$.',
          'Poluentes: CO, NOₓ, SO₂, partículas, ozono troposférico. Efeito de estufa: CO₂, CH₄, N₂O, vapor de água, CFC.',
        ],
        quiz: [
          {
            id: 'gases-q01',
            tipo: 'numerica',
            enunciado: 'Que volume ocupam $2{,}50\\,\\mathrm{mol}$ de nitrogénio, $\\mathrm{N_2}$, em condições PTN ($V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$)? Apresenta o resultado em $\\mathrm{dm^3}$, com três algarismos significativos.',
            resposta: 56,
            algarismos: 3,
            tolerancia: 0.05,
            resolucao: [
              '$V = n\\,V_m$',
              '$V = 2{,}50 \\times ' + Vm + ' = ' + dec(Q.volumeGasPTN(2.5), 1) + '\\,\\mathrm{dm^3}$',
            ],
            verificar: () => arred(Q.volumeGasPTN(2.5), 3),
            errosTipicos: [
              { codigo: 'dividiu_n_pelo_volume_molar', valor: 0.112, explicacao: 'Calculaste $2{,}50 \\div ' + Vm + ' \\approx 0{,}112$. O volume é $V = n\\,V_m$: multiplica-se, $2{,}50 \\times ' + Vm + ' = 56{,}0\\,\\mathrm{dm^3}$.' },
            ],
          },
          {
            id: 'gases-q02',
            tipo: 'numerica',
            enunciado: 'Que quantidade de matéria de metano, $\\mathrm{CH_4}$, existe em $5{,}60\\,\\mathrm{dm^3}$ deste gás, em condições PTN ($V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$)? Apresenta o resultado em mol, com três algarismos significativos.',
            resposta: 0.25,
            algarismos: 3,
            tolerancia: 0.0005,
            resolucao: [
              '$n = \\dfrac{V}{V_m}$',
              '$n = \\dfrac{5{,}60}{' + Vm + '} = ' + dec(Q.nDeVolumePTN(5.6), 3) + '\\,\\mathrm{mol}$',
            ],
            verificar: () => arred(Q.nDeVolumePTN(5.6), 3),
            errosTipicos: [
              { codigo: 'multiplicou_pelo_volume_molar', valor: 125, explicacao: 'Multiplicaste $5{,}60 \\times ' + Vm + ' \\approx 125$. A quantidade de matéria é $n = V / V_m$; as unidades confirmam: $\\mathrm{dm^3} \\div \\mathrm{dm^3\\,mol^{-1}} = \\mathrm{mol}$.' },
            ],
          },
          {
            id: 'gases-q03',
            tipo: 'numerica',
            enunciado: 'Calcula a massa volúmica do oxigénio, $\\mathrm{O_2}$, em condições PTN ($A_r(\\mathrm{O}) = ' + Ar('O') + '$, $V_m = ' + Vm + '\\,\\mathrm{dm^3\\,mol^{-1}}$). Apresenta o resultado em $\\mathrm{g\\,dm^{-3}}$, com três algarismos significativos.',
            resposta: 1.43,
            algarismos: 3,
            tolerancia: 0.005,
            resolucao: [
              '$M(\\mathrm{O_2}) = 2 \\times ' + Ar('O') + ' = ' + dec(M({ O: 2 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$',
              '$\\rho = \\dfrac{M}{V_m} = \\dfrac{' + dec(M({ O: 2 }), 2) + '}{' + Vm + '} \\approx ' + dec(arred(Q.massaVolumicaGas(M({ O: 2 })), 3), 2) + '\\,\\mathrm{g\\,dm^{-3}}$',
            ],
            verificar: () => arred(Q.massaVolumicaGas(M({ O: 2 })), 3),
            errosTipicos: [
              { codigo: 'dividiu_ao_contrario', valor: 0.7, explicacao: 'Calculaste $V_m / M = ' + Vm + ' \\div 32{,}00 = 0{,}700$. A massa volúmica é massa a dividir por volume: $\\rho = M / V_m \\approx 1{,}43\\,\\mathrm{g\\,dm^{-3}}$.' },
              { codigo: 'usou_a_massa_atomica_do_o', valor: 0.714, explicacao: 'Usaste $M = 16{,}00\\,\\mathrm{g\\,mol^{-1}}$ (um só átomo) e obtiveste 0,714; a molécula $\\mathrm{O_2}$ tem dois átomos: $M = 32{,}00\\,\\mathrm{g\\,mol^{-1}}$.' },
            ],
          },
          {
            id: 'gases-q04',
            tipo: 'vf',
            enunciado: 'À mesma pressão e temperatura, uma mole de hidrogénio, $\\mathrm{H_2}$, ocupa menos volume do que uma mole de dióxido de carbono, $\\mathrm{CO_2}$, porque as suas moléculas são mais pequenas.',
            correta: false,
            explicacao: 'Pela lei de Avogadro, à mesma $p$ e $T$, uma mole de qualquer gás ocupa o mesmo volume: o volume molar não depende do gás. Nos gases, as moléculas estão muito afastadas e o seu tamanho quase não conta.',
            errosTipicos: [
              { codigo: 'volume_molar_depende_do_gas', explicacao: 'O volume molar só depende da pressão e da temperatura. As moléculas de um gás ocupam uma parte mínima do volume, por isso o tamanho delas não importa.' },
            ],
          },
          {
            id: 'gases-q05',
            tipo: 'escolha',
            enunciado: 'A $25\\,\\mathrm{°C}$ e $1\\,\\mathrm{atm}$, o volume molar de um gás é:',
            opcoes: [
              'maior do que ' + VmT + ' dm³/mol',
              'igual a ' + VmT + ' dm³/mol',
              'menor do que ' + VmT + ' dm³/mol',
              'diferente para cada gás',
            ],
            correta: 0,
            explicacao: VmT + ' dm³/mol é o valor em PTN ($0\\,\\mathrm{°C}$). À mesma pressão, a uma temperatura maior o gás expande-se: o volume molar é maior.',
            errosTipicos: [
              { codigo: 'volume_molar_fora_de_ptn', opcao: 1, explicacao: VmT + ' dm³/mol só vale em PTN ($0\\,\\mathrm{°C}$ e $1\\,\\mathrm{atm}$). A $25\\,\\mathrm{°C}$ o gás ocupa mais espaço.' },
              { codigo: 'temperatura_contrai_o_gas', opcao: 2, explicacao: 'Aquecer um gás à mesma pressão faz com que se expanda, não que se contraia: o volume molar aumenta.' },
              { codigo: 'volume_molar_depende_do_gas', opcao: 3, explicacao: 'Pela lei de Avogadro, o volume molar só depende de $p$ e $T$, não do gás.' },
            ],
          },
          {
            id: 'gases-q06',
            tipo: 'numerica',
            enunciado: 'Uma mistura gasosa tem $2{,}0\\,\\mathrm{mol}$ de $\\mathrm{N_2}$ e $0{,}50\\,\\mathrm{mol}$ de $\\mathrm{O_2}$. Calcula a fração molar do oxigénio.',
            resposta: 0.2,
            tolerancia: 0.005,
            resolucao: [
              '$n_{\\text{total}} = 2{,}0 + 0{,}50 = 2{,}5\\,\\mathrm{mol}$',
              '$x(\\mathrm{O_2}) = \\dfrac{0{,}50}{2{,}5} = 0{,}20$',
            ],
            verificar: () => Q.fracaoMolar(0.5, 2.5),
            errosTipicos: [
              { codigo: 'dividiu_pela_quantidade_do_outro_componente', valor: 0.25, explicacao: 'Dividiste pela quantidade de $\\mathrm{N_2}$ ($0{,}50 / 2{,}0 = 0{,}25$). A fração molar divide pela quantidade **total**: $0{,}50 / 2{,}5 = 0{,}20$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'solucoes',
        titulo: 'Soluções e dispersões',
        ae: [
          'Resolver problemas envolvendo cálculos numéricos sobre a composição quantitativa de soluções aquosas e gasosas, exprimindo-a nas principais unidades, explicando as estratégias de resolução.',
          'Preparar soluções aquosas a partir de solutos sólidos e por diluição, avaliando procedimentos e comunicando os resultados.',
        ],
        minutos: 12,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Uma **dispersão** é uma mistura em que uma substância (o **disperso**) está espalhada noutra (o **dispersante**). Classifica-se pelo tamanho das partículas dispersas.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Dispersão', 'Partículas (aproximadamente)', 'Aspeto e comportamento', 'Exemplos'],
            linhas: [
              ['**Solução**', 'menores do que 1 nm', 'homogénea; não sedimenta nem se separa por filtração', 'água com sal ou açúcar, ar, latão'],
              ['**Coloide**', 'entre 1 nm e 1 µm', 'parece homogéneo a olho nu, mas é heterogéneo ao microscópio; dispersa a luz (efeito Tyndall)', 'leite, maionese, nevoeiro, gelatina'],
              ['**Suspensão**', 'maiores do que 1 µm', 'heterogénea; as partículas sedimentam e separam-se por filtração', 'água com areia, sumo com polpa'],
            ],
          },
          {
            tipo: 'definicao',
            texto: 'Numa **solução**, o **solvente** é o componente em maior quantidade (ou o que tem o mesmo estado físico da solução) e os **solutos** são os outros. Numa solução **aquosa** o solvente é a água.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Grandeza', 'Expressão', 'Unidade usual'],
            linhas: [
              ['Concentração (molar)', '$c = \\dfrac{n_{\\text{soluto}}}{V_{\\text{solução}}}$', '$\\mathrm{mol\\,dm^{-3}}$'],
              ['Concentração mássica', '$c_m = \\dfrac{m_{\\text{soluto}}}{V_{\\text{solução}}}$', '$\\mathrm{g\\,dm^{-3}}$'],
              ['Percentagem em massa', '$\\%(m/m) = \\dfrac{m_{\\text{soluto}}}{m_{\\text{solução}}} \\times 100$', '%'],
              ['Percentagem em volume', '$\\%(V/V) = \\dfrac{V_{\\text{soluto}}}{V_{\\text{solução}}} \\times 100$', '%'],
              ['Partes por milhão', '$\\mathrm{ppm} = \\dfrac{m_{\\text{soluto}}}{m_{\\text{solução}}} \\times 10^{6}$ (nos gases, em volume)', 'ppm'],
              ['Fração molar', '$x_A = \\dfrac{n_A}{n_{\\text{total}}}$', 'sem unidades'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Dissolveram-se $5{,}85\\,\\mathrm{g}$ de cloreto de sódio, $\\mathrm{NaCl}$, em água, até perfazer $250{,}0\\,\\mathrm{mL}$ de solução. Calcula a concentração, com três algarismos significativos ($A_r(\\mathrm{Na}) = ' + Ar('Na') + '$, $A_r(\\mathrm{Cl}) = ' + Ar('Cl') + '$).',
            resolucao: [
              '$M(\\mathrm{NaCl}) = ' + Ar('Na') + ' + ' + Ar('Cl') + ' = ' + dec(M({ Na: 1, Cl: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$',
              '$n = \\dfrac{m}{M} = \\dfrac{5{,}85}{' + dec(M({ Na: 1, Cl: 1 }), 2) + '} \\approx ' + dec(Q.nDeMassa(5.85, M({ Na: 1, Cl: 1 })), 4) + '\\,\\mathrm{mol}$',
              'Volume em $\\mathrm{dm^3}$: $250{,}0\\,\\mathrm{mL} = 0{,}2500\\,\\mathrm{dm^3}$.',
              '$c = \\dfrac{n}{V} = \\dfrac{' + dec(Q.nDeMassa(5.85, M({ Na: 1, Cl: 1 })), 4) + '}{0{,}2500} \\approx ' + dec(arred(Q.concentracao(Q.nDeMassa(5.85, M({ Na: 1, Cl: 1 })), 0.25), 3), 3) + '\\,\\mathrm{mol\\,dm^{-3}}$',
            ],
            resultado: 0.4,
            verificar: () => arred(Q.concentracao(Q.nDeMassa(5.85, M({ Na: 1, Cl: 1 })), 0.25), 3),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma água tem $2{,}5\\,\\mathrm{mg}$ de ião fluoreto em cada $1{,}0\\,\\mathrm{kg}$. Exprime a composição em ppm.',
            resolucao: [
              'Mesma unidade de massa: $2{,}5\\,\\mathrm{mg} = 2{,}5 \\times 10^{-3}\\,\\mathrm{g}$ e $1{,}0\\,\\mathrm{kg} = 1{,}0 \\times 10^{3}\\,\\mathrm{g}$.',
              '$\\mathrm{ppm} = \\dfrac{2{,}5 \\times 10^{-3}}{1{,}0 \\times 10^{3}} \\times 10^{6} = 2{,}5\\,\\mathrm{ppm}$ (1 ppm é 1 mg por kg).',
            ],
            resultado: 2.5,
            verificar: () => arred(Q.ppm(2.5e-3, 1.0e3), 2),
          },
          {
            tipo: 'texto',
            texto: 'Nos gases, ppm e percentagens referem-se normalmente ao volume. O ar seco tem ' + pct('CO2') + ' % de $\\mathrm{CO_2}$ em volume, ou seja, $' + dec(ar('CO2'), 3) + ' \\times 10^{4} = ' + Math.round(ar('CO2') * 1e4) + '\\,\\mathrm{ppm}$ (1 % corresponde a $10^{4}$ ppm).',
          },
          {
            tipo: 'definicao',
            texto: 'Numa **diluição** junta-se solvente a uma solução. A quantidade de soluto não muda, só o volume aumenta: $n = c_i V_i = c_f V_f$. O **fator de diluição** é $f = \\dfrac{c_i}{c_f} = \\dfrac{V_f}{V_i}$ (sempre maior do que 1).',
          },
          {
            tipo: 'esquema',
            id: 'fqa-diluicao',
            opcoes: { ci: 0.5, Vi: 20, Vf: 100 },
            legenda: 'Escolhe o volume a pipetar e o balão: o número de partículas de soluto é o mesmo antes e depois; espalham-se por um volume maior e a concentração diminui.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Pretendes preparar $100{,}0\\,\\mathrm{mL}$ de uma solução $0{,}100\\,\\mathrm{mol\\,dm^{-3}}$ a partir de uma solução $0{,}500\\,\\mathrm{mol\\,dm^{-3}}$. Que volume tens de pipetar? Qual é o fator de diluição?',
            resolucao: [
              '$c_i V_i = c_f V_f \\Rightarrow V_i = \\dfrac{c_f V_f}{c_i} = \\dfrac{0{,}100 \\times 100{,}0}{0{,}500} = ' + dec(Q.diluicao({ ci: 0.5, cf: 0.1, Vf: 100 }).Vi, 1) + '\\,\\mathrm{mL}$ (podes manter os volumes em mL dos dois lados).',
              'Fator: $f = \\dfrac{V_f}{V_i} = \\dfrac{100{,}0}{' + dec(Q.diluicao({ ci: 0.5, cf: 0.1, Vf: 100 }).Vi, 1) + '} = ' + Math.round(Q.diluicao({ ci: 0.5, cf: 0.1, Vf: 100 }).fator) + '$; confirma: $\\dfrac{c_i}{c_f} = \\dfrac{0{,}500}{0{,}100} = 5$.',
            ],
            resultado: 20,
            verificar: () => arred(Q.diluicao({ ci: 0.5, cf: 0.1, Vf: 100 }).Vi, 3),
          },
          {
            tipo: 'esquema',
            id: 'fig-material-solucao',
            legenda: 'Material para preparar uma solução: toca na figura para separar as peças e ver para que serve cada uma.',
          },
          {
            tipo: 'texto',
            texto: '**Preparar uma solução a partir de um soluto sólido:** (1) calcula a massa de soluto; (2) mede-a na **balança**, num **vidro de relógio**, com a **espátula**; (3) dissolve-a num **gobelé** com pouca água destilada; (4) transfere a solução para o **balão volumétrico** com o **funil**, lavando o gobelé e o funil com o **esguicho** e juntando as águas de lavagem.',
          },
          {
            tipo: 'texto',
            texto: '(5) Completa com água destilada até a parte de baixo do menisco ficar tangente ao traço de aferição (olhos ao nível do traço; as últimas gotas com o esguicho); (6) tapa e inverte o balão várias vezes para homogeneizar.',
          },
          {
            tipo: 'texto',
            texto: '**Preparar uma solução por diluição:** mede o volume da solução inicial com uma **pipeta** volumétrica e a **pompete** (nunca com a boca); passa-o para o balão volumétrico do volume final; completa com água destilada até ao traço e homogeneíza.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'A concentração usa o volume em **dm³**: $250\\,\\mathrm{mL} = 0{,}250\\,\\mathrm{dm^3}$, não 250. Na diluição, não troques os pares: é $c_i V_i = c_f V_f$ (cada concentração com o seu volume), nunca $c_i V_f$. E $V_f$ é o volume **final** da solução, não o volume de água que juntaste.',
          },
        ],
        resumo: [
          'Solução (partículas < 1 nm, homogénea), coloide (1 nm a 1 µm, efeito Tyndall) e suspensão (> 1 µm, sedimenta).',
          '$c = n/V$ ($\\mathrm{mol\\,dm^{-3}}$); $c_m = m/V$ ($\\mathrm{g\\,dm^{-3}}$); %(m/m), %(V/V), ppm ($\\times 10^{6}$), fração molar.',
          'O volume da solução entra em dm³: $1\\,\\mathrm{dm^3} = 1000\\,\\mathrm{mL}$.',
          'Diluição: $c_i V_i = c_f V_f$; fator $f = c_i / c_f = V_f / V_i > 1$.',
          'Soluto sólido: pesar, dissolver no gobelé, transferir para o balão volumétrico, lavar, completar até ao traço, homogeneizar.',
          'Diluição: pipeta volumétrica com pompete, balão volumétrico, completar até ao traço, homogeneizar.',
        ],
        quiz: [
          {
            id: 'solucoes-q01',
            tipo: 'numerica',
            enunciado: 'Uma solução tem $0{,}250\\,\\mathrm{mol}$ de soluto em $500\\,\\mathrm{mL}$ de solução. Calcula a concentração, em $\\mathrm{mol\\,dm^{-3}}$, com três algarismos significativos.',
            resposta: 0.5,
            algarismos: 3,
            tolerancia: 0.0005,
            resolucao: [
              '$V = 500\\,\\mathrm{mL} = 0{,}500\\,\\mathrm{dm^3}$',
              '$c = \\dfrac{n}{V} = \\dfrac{0{,}250}{0{,}500} = 0{,}500\\,\\mathrm{mol\\,dm^{-3}}$',
            ],
            verificar: () => Q.concentracao(0.25, 0.5),
            errosTipicos: [
              { codigo: 'volume_em_ml', valor: 0.0005, explicacao: 'Dividiste por 500 (o volume em mL) e obtiveste $5{,}00 \\times 10^{-4}$. A concentração usa dm³: $500\\,\\mathrm{mL} = 0{,}500\\,\\mathrm{dm^3}$.' },
              { codigo: 'dividiu_ao_contrario', valor: 2, explicacao: 'Calculaste $V/n = 0{,}500 / 0{,}250 = 2{,}00$; é $c = n / V$.' },
            ],
          },
          {
            id: 'solucoes-q02',
            tipo: 'numerica',
            enunciado: 'Que massa de hidróxido de sódio, $\\mathrm{NaOH}$, tens de pesar para preparar $250{,}0\\,\\mathrm{mL}$ de solução $0{,}200\\,\\mathrm{mol\\,dm^{-3}}$ ($A_r(\\mathrm{Na}) = ' + Ar('Na') + '$, $A_r(\\mathrm{O}) = ' + Ar('O') + '$, $A_r(\\mathrm{H}) = ' + Ar('H') + '$)? Apresenta o resultado em gramas, com três algarismos significativos.',
            resposta: 2,
            algarismos: 3,
            tolerancia: 0.005,
            resolucao: [
              '$n = c\\,V = 0{,}200 \\times 0{,}2500 = 0{,}0500\\,\\mathrm{mol}$',
              '$M(\\mathrm{NaOH}) = ' + Ar('Na') + ' + ' + Ar('O') + ' + ' + Ar('H') + ' = ' + dec(M({ Na: 1, O: 1, H: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$',
              '$m = n\\,M = 0{,}0500 \\times ' + dec(M({ Na: 1, O: 1, H: 1 }), 2) + ' = ' + dec(Q.massaDeN(0.05, M({ Na: 1, O: 1, H: 1 })), 2) + '\\,\\mathrm{g}$',
            ],
            verificar: () => arred(Q.massaDeN(0.2 * 0.25, M({ Na: 1, O: 1, H: 1 })), 3),
            errosTipicos: [
              { codigo: 'volume_em_ml', valor: 2000, explicacao: 'Usaste $V = 250$ (em mL) e obtiveste 2000 g. Em dm³, $V = 0{,}2500\\,\\mathrm{dm^3}$, e $m = 2{,}00\\,\\mathrm{g}$.' },
              { codigo: 'deu_a_quantidade_de_materia', valor: 0.05, explicacao: '0,0500 é a quantidade de matéria (mol). Para a massa multiplica por $M = ' + dec(M({ Na: 1, O: 1, H: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$: $2{,}00\\,\\mathrm{g}$.' },
            ],
          },
          {
            id: 'solucoes-q03',
            tipo: 'numerica',
            enunciado: 'Que volume, em mL, de uma solução $1{,}00\\,\\mathrm{mol\\,dm^{-3}}$ tens de pipetar para preparar $250{,}0\\,\\mathrm{mL}$ de solução $0{,}0500\\,\\mathrm{mol\\,dm^{-3}}$? Apresenta o resultado com três algarismos significativos.',
            resposta: 12.5,
            algarismos: 3,
            tolerancia: 0.05,
            resolucao: [
              '$c_i V_i = c_f V_f \\Rightarrow V_i = \\dfrac{c_f V_f}{c_i}$',
              '$V_i = \\dfrac{0{,}0500 \\times 250{,}0}{1{,}00} = ' + dec(Q.diluicao({ ci: 1, cf: 0.05, Vf: 250 }).Vi, 1) + '\\,\\mathrm{mL}$',
            ],
            verificar: () => arred(Q.diluicao({ ci: 1, cf: 0.05, Vf: 250 }).Vi, 3),
            errosTipicos: [
              { codigo: 'trocou_as_concentracoes', valor: 5000, explicacao: 'Calculaste $\\dfrac{c_i V_f}{c_f} = \\dfrac{1{,}00 \\times 250{,}0}{0{,}0500} = 5000$: mais do que o próprio balão. Cada concentração vai com o seu volume: $V_i = \\dfrac{c_f V_f}{c_i} = 12{,}5\\,\\mathrm{mL}$.' },
            ],
          },
          {
            id: 'solucoes-q04',
            tipo: 'escolha',
            enunciado: 'Para medir com rigor $10{,}00\\,\\mathrm{mL}$ de uma solução, numa diluição, qual é o material mais adequado?',
            opcoes: ['Pipeta volumétrica com pompete', 'Proveta', 'Gobelé', 'Balão volumétrico de 100 mL'],
            correta: 0,
            explicacao: 'A pipeta volumétrica mede um volume fixo com grande rigor (até à marca de aferição); a pompete aspira o líquido em segurança.',
            errosTipicos: [
              { codigo: 'proveta_para_volume_rigoroso', opcao: 1, explicacao: 'A proveta mede volumes de forma aproximada (incerteza maior). Para um volume rigoroso numa diluição usa-se a pipeta volumétrica.' },
              { codigo: 'gobele_para_medir', opcao: 2, explicacao: 'As marcas de um gobelé são só indicativas: não serve para medir volumes rigorosos.' },
              { codigo: 'balao_para_medir_o_volume_a_retirar', opcao: 3, explicacao: 'O balão volumétrico serve para o volume **final** da solução (aqui, 100 mL), não para medir os 10,00 mL a retirar.' },
            ],
          },
          {
            id: 'solucoes-q05',
            tipo: 'numerica',
            enunciado: 'Dissolveram-se $3{,}0\\,\\mathrm{g}$ de glicose em água, obtendo-se $200\\,\\mathrm{mL}$ de solução. Calcula a concentração mássica, em $\\mathrm{g\\,dm^{-3}}$.',
            resposta: 15,
            tolerancia: 0.05,
            resolucao: [
              '$V = 200\\,\\mathrm{mL} = 0{,}200\\,\\mathrm{dm^3}$',
              '$c_m = \\dfrac{m}{V} = \\dfrac{3{,}0}{0{,}200} = 15\\,\\mathrm{g\\,dm^{-3}}$',
            ],
            verificar: () => Q.concentracaoMassica(3.0, 0.2),
            errosTipicos: [
              { codigo: 'volume_em_ml', valor: 0.015, explicacao: 'Dividiste por 200 (em mL) e obtiveste 0,015. Em dm³, $V = 0{,}200\\,\\mathrm{dm^3}$: $c_m = 15\\,\\mathrm{g\\,dm^{-3}}$.' },
            ],
          },
          {
            id: 'solucoes-q06',
            tipo: 'escolha',
            enunciado: 'Pipetaram-se $10{,}0\\,\\mathrm{mL}$ de uma solução para um balão volumétrico de $100{,}0\\,\\mathrm{mL}$, que se completou com água até ao traço. Qual é o fator de diluição?',
            opcoes: ['10', '0,1', '9', '90'],
            correta: 0,
            explicacao: '$f = \\dfrac{V_f}{V_i} = \\dfrac{100{,}0}{10{,}0} = ' + Math.round(Q.diluicao({ ci: 1, Vi: 10, Vf: 100 }).fator) + '$: a solução final é 10 vezes menos concentrada.',
            errosTipicos: [
              { codigo: 'fator_invertido', opcao: 1, explicacao: 'Calculaste $V_i / V_f$. O fator de diluição é $V_f / V_i$ (ou $c_i / c_f$) e é sempre maior do que 1.' },
              { codigo: 'usou_o_volume_de_agua_adicionado', opcao: 2, explicacao: 'Usaste os 90 mL de água juntos em vez do volume final: $90 / 10 = 9$. O fator usa o volume final da solução, 100,0 mL.' },
              { codigo: 'usou_a_diferenca_de_volumes', opcao: 3, explicacao: 'O fator não é a diferença entre os volumes: é o quociente $V_f / V_i = 100{,}0 / 10{,}0 = 10$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'entalpia',
        titulo: 'Energia nas reações químicas',
        ae: [
          'Interpretar as reações químicas em termos de quebra e formação de ligações.',
          'Explicar, no contexto de uma reação química, o que é um processo exotérmico e endotérmico.',
          'Designar a variação de energia entre reagentes e produtos como entalpia, interpretar o seu sinal e reconhecer que, a pressão constante, a variação de entalpia é igual ao calor trocado com o exterior.',
          'Relacionar a variação de entalpia com as energias de ligação de reagentes e de produtos.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Numa reação química, as ligações dos reagentes **quebram-se** e formam-se **ligações novas** nos produtos. Quebrar ligações **absorve** energia; formar ligações **liberta** energia. O balanço entre as duas decide se a reação liberta ou absorve energia.',
          },
          {
            tipo: 'definicao',
            texto: 'Um processo é **exotérmico** quando o sistema (reagentes e produtos) **liberta** energia para o exterior (a vizinhança aquece), como nas combustões. É **endotérmico** quando o sistema **absorve** energia do exterior, como na decomposição do carbonato de cálcio por aquecimento ou na decomposição do cloreto de prata pela luz.',
          },
          {
            tipo: 'definicao',
            texto: 'A **variação de entalpia**, $\\Delta H$, é a variação de energia entre os produtos e os reagentes: $\\Delta H = H_{\\text{produtos}} - H_{\\text{reagentes}}$. A **pressão constante**, $\\Delta H$ é igual ao calor trocado entre o sistema e o exterior.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Reação', 'Energia', 'Sinal de ΔH', 'Ligações'],
            linhas: [
              ['**Exotérmica**', 'libertada para o exterior', '$\\Delta H < 0$ (produtos com menos energia)', 'a energia libertada a formar é maior do que a absorvida a quebrar'],
              ['**Endotérmica**', 'absorvida do exterior', '$\\Delta H > 0$ (produtos com mais energia)', 'a energia absorvida a quebrar é maior do que a libertada a formar'],
            ],
          },
          {
            tipo: 'formula',
            texto: '$\\Delta H \\approx \\sum E(\\text{ligações quebradas}) - \\sum E(\\text{ligações formadas})$. O resultado é **aproximado**: as energias de ligação são valores médios (a mesma ligação tem energias um pouco diferentes em moléculas diferentes) e referem-se a substâncias gasosas.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-entalpia',
            opcoes: { reacao: 'HCl' },
            legenda: 'Escolhe a reação: sobe-se até aos átomos isolados (energia das ligações quebradas) e desce-se até aos produtos (energia das ligações formadas). A diferença é ΔH.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a variação de entalpia da reação $\\mathrm{H_2(g) + Cl_2(g) \\longrightarrow 2\\,HCl(g)}$ a partir das energias de ligação: H–H ' + E('H-H') + ', Cl–Cl ' + E('Cl-Cl') + ' e H–Cl ' + E('H-Cl') + ' $\\mathrm{kJ\\,mol^{-1}}$.',
            resolucao: [
              'Quebradas: uma H–H e uma Cl–Cl, $' + E('H-H') + ' + ' + E('Cl-Cl') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).somaQuebradas + '\\,\\mathrm{kJ}$.',
              'Formadas: duas H–Cl (o coeficiente é 2), $2 \\times ' + E('H-Cl') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).somaFormadas + '\\,\\mathrm{kJ}$.',
              '$\\Delta H \\approx ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).somaQuebradas + ' - ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).somaFormadas + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).deltaH + '\\,\\mathrm{kJ\\,mol^{-1}}$ (para a equação tal como está escrita).',
              '$\\Delta H < 0$: a reação é exotérmica; liberta cerca de ' + -Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).deltaH + ' kJ por cada 2 mol de HCl formado.',
            ],
            resultado: -184,
            verificar: () => Q.deltaHLigacoes({ quebradas: { 'H-H': 1, 'Cl-Cl': 1 }, formadas: { 'H-Cl': 2 } }).deltaH,
          },
          {
            tipo: 'exemplo',
            enunciado: 'Estima $\\Delta H$ da combustão do metano, $\\mathrm{CH_4(g) + 2\\,O_2(g) \\longrightarrow CO_2(g) + 2\\,H_2O(g)}$ (energias de ligação em $\\mathrm{kJ\\,mol^{-1}}$: C–H ' + E('C-H') + ', O=O ' + E('O=O') + ', C=O no $\\mathrm{CO_2}$ ' + E('C=O') + ', O–H ' + E('O-H') + ').',
            resolucao: [
              'Quebradas: 4 C–H e 2 O=O, $4 \\times ' + E('C-H') + ' + 2 \\times ' + E('O=O') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).somaQuebradas + '\\,\\mathrm{kJ}$.',
              'Formadas: 2 C=O (no $\\mathrm{CO_2}$) e 4 O–H (2 em cada uma das 2 moléculas de água), $2 \\times ' + E('C=O') + ' + 4 \\times ' + E('O-H') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).somaFormadas + '\\,\\mathrm{kJ}$.',
              '$\\Delta H \\approx ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).somaQuebradas + ' - ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).somaFormadas + ' = ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH + '\\,\\mathrm{kJ\\,mol^{-1}}$: combustão exotérmica.',
            ],
            resultado: -802,
            verificar: () => Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH,
          },
          {
            tipo: 'erro-frequente',
            texto: 'Cuidado com o sinal: é **quebradas − formadas**. Se fizeres formadas − quebradas, obténs o sinal trocado e uma reação exotérmica parece endotérmica. Lembra-te: exotérmica, $\\Delta H < 0$.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Conta todas as ligações: multiplica pelos coeficientes da equação ($2\\,\\mathrm{HCl}$ são 2 ligações H–Cl) e pelo número de ligações em cada molécula (cada $\\mathrm{H_2O}$ tem 2 ligações O–H; o $\\mathrm{CO_2}$ tem 2 ligações C=O). Uma ligação dupla conta como uma ligação C=O, com a sua energia própria.',
          },
        ],
        resumo: [
          'Reação química: quebra de ligações (absorve energia) e formação de ligações (liberta energia).',
          'Exotérmica: liberta energia, $\\Delta H < 0$. Endotérmica: absorve energia, $\\Delta H > 0$.',
          '$\\Delta H = H_{\\text{produtos}} - H_{\\text{reagentes}}$; a pressão constante, é igual ao calor trocado com o exterior.',
          '$\\Delta H \\approx \\sum E(\\text{quebradas}) - \\sum E(\\text{formadas})$: aproximado, porque usa energias médias de ligação.',
          'Contar as ligações com os coeficientes e o número de ligações de cada molécula.',
        ],
        quiz: [
          {
            id: 'entalpia-q01',
            tipo: 'numerica',
            enunciado: 'Estima $\\Delta H$, em $\\mathrm{kJ\\,mol^{-1}}$, para $\\mathrm{2\\,H_2(g) + O_2(g) \\longrightarrow 2\\,H_2O(g)}$ (energias de ligação em $\\mathrm{kJ\\,mol^{-1}}$: H–H ' + E('H-H') + ', O=O ' + E('O=O') + ', O–H ' + E('O-H') + ').',
            resposta: -478,
            tolerancia: 0.5,
            resolucao: [
              'Quebradas: $2 \\times ' + E('H-H') + ' + ' + E('O=O') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).somaQuebradas + '\\,\\mathrm{kJ}$',
              'Formadas: 2 moléculas de água com 2 O–H cada, $4 \\times ' + E('O-H') + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).somaFormadas + '\\,\\mathrm{kJ}$',
              '$\\Delta H \\approx ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).somaQuebradas + ' - ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).somaFormadas + ' = ' + Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).deltaH + '\\,\\mathrm{kJ\\,mol^{-1}}$',
            ],
            verificar: () => Q.deltaHLigacoes({ quebradas: { 'H-H': 2, 'O=O': 1 }, formadas: { 'O-H': 4 } }).deltaH,
            errosTipicos: [
              { codigo: 'sinal_trocado_formadas_menos_quebradas', valor: 478, explicacao: 'Fizeste formadas − quebradas e obtiveste +478. É quebradas − formadas: $1358 - 1836 = -478\\,\\mathrm{kJ\\,mol^{-1}}$ (exotérmica).' },
              { codigo: 'uma_ligacao_oh_por_molecula', valor: 440, explicacao: 'Contaste só 2 ligações O–H ($2 \\times ' + E('O-H') + '$) e obtiveste 440; cada molécula de água tem 2 ligações O–H e há 2 moléculas: 4 ligações.' },
            ],
          },
          {
            id: 'entalpia-q02',
            tipo: 'vf',
            enunciado: 'Numa reação endotérmica, a entalpia dos produtos é maior do que a dos reagentes.',
            correta: true,
            explicacao: 'O sistema absorve energia do exterior, por isso os produtos ficam com mais energia: $\\Delta H = H_{\\text{produtos}} - H_{\\text{reagentes}} > 0$.',
          },
          {
            id: 'entalpia-q03',
            tipo: 'escolha',
            enunciado: 'Uma reação que ocorre a pressão constante tem $\\Delta H < 0$. O que podes concluir?',
            opcoes: [
              'É exotérmica: o sistema liberta calor para o exterior.',
              'É endotérmica: o sistema absorve calor do exterior.',
              'A energia absorvida a quebrar ligações é maior do que a libertada a formar ligações.',
              'Não há troca de calor com o exterior.',
            ],
            correta: 0,
            explicacao: '$\\Delta H < 0$: os produtos têm menos energia do que os reagentes; a diferença sai do sistema como calor (a pressão constante, $\\Delta H$ é o calor trocado). Formaram-se ligações que libertam mais energia do que a absorvida a quebrar as dos reagentes.',
            errosTipicos: [
              { codigo: 'sinal_negativo_endotermica', opcao: 1, explicacao: 'O sinal negativo indica que o sistema **perde** energia: é exotérmica. Endotérmica tem $\\Delta H > 0$.' },
              { codigo: 'inverteu_o_balanco_das_ligacoes', opcao: 2, explicacao: 'Se a energia absorvida a quebrar fosse maior, $\\Delta H$ seria positivo. Com $\\Delta H < 0$, a energia libertada a formar ligações é maior.' },
            ],
          },
          {
            id: 'entalpia-q04',
            tipo: 'numerica',
            enunciado: 'Para a combustão do metano, $\\mathrm{CH_4(g) + 2\\,O_2(g) \\longrightarrow CO_2(g) + 2\\,H_2O(g)}$, $\\Delta H \\approx ' + Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH + '\\,\\mathrm{kJ\\,mol^{-1}}$. Que energia, em kJ, é libertada na combustão de $0{,}50\\,\\mathrm{mol}$ de metano?',
            resposta: 401,
            tolerancia: 0.5,
            resolucao: [
              'Por cada mole de $\\mathrm{CH_4}$ (coeficiente 1 na equação) libertam-se ' + -Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH + ' kJ.',
              '$E = 0{,}50 \\times ' + -Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH + ' = ' + 0.5 * -Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH + '\\,\\mathrm{kJ}$',
            ],
            verificar: () => 0.5 * -Q.deltaHLigacoes({ quebradas: { 'C-H': 4, 'O=O': 2 }, formadas: { 'C=O': 2, 'O-H': 4 } }).deltaH,
            errosTipicos: [
              { codigo: 'nao_usou_a_quantidade', valor: 802, explicacao: '802 kJ é a energia para 1 mol de metano. Para 0,50 mol é metade: 401 kJ.' },
              { codigo: 'dividiu_pela_quantidade', valor: 1604, explicacao: 'Dividiste $802 \\div 0{,}50 = 1604$. A energia é proporcional à quantidade: $0{,}50 \\times 802 = 401\\,\\mathrm{kJ}$.' },
            ],
          },
          {
            id: 'entalpia-q05',
            tipo: 'escolha',
            enunciado: 'Durante uma reação química, a quebra das ligações dos reagentes:',
            opcoes: [
              'absorve energia',
              'liberta energia',
              'não envolve energia: só a formação de ligações envolve energia',
              'liberta energia nas reações exotérmicas e absorve nas endotérmicas',
            ],
            correta: 0,
            explicacao: 'Quebrar uma ligação exige sempre energia (a energia de ligação). A formação de ligações liberta sempre energia; ser exo ou endotérmica depende do balanço das duas.',
            errosTipicos: [
              { codigo: 'quebra_de_ligacao_liberta_energia', opcao: 1, explicacao: 'É a formação de ligações que liberta energia. Para afastar dois átomos ligados é preciso fornecer energia.' },
              { codigo: 'quebra_depende_do_tipo_de_reacao', opcao: 3, explicacao: 'A quebra absorve sempre energia e a formação liberta sempre; o tipo de reação depende só de qual das duas é maior.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'fotoquimica',
        titulo: 'Reações fotoquímicas e ozono',
        ae: [
          'Identificar a luz como fonte de energia das reações fotoquímicas.',
          'Investigar, experimentalmente, o efeito da luz sobre o cloreto de prata, avaliando procedimentos e comunicando os resultados.',
          'Pesquisar, numa perspetiva intra e interdisciplinar, os papéis do ozono na troposfera e na estratosfera, interpretando a formação e destruição do ozono estratosférico e comunicando as suas conclusões.',
          'Relacionar a elevada reatividade dos radicais livres com a particularidade de serem espécies que possuem eletrões desemparelhados e explicitar alguns dos seus efeitos na atmosfera e sobre os seres vivos, por exemplo, o envelhecimento.',
        ],
        minutos: 12,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'Uma **reação fotoquímica** é uma reação em que a energia necessária vem da **luz** (radiação eletromagnética). Exemplos: a fotossíntese, o escurecimento do cloreto de prata e a formação e decomposição do ozono na estratosfera.',
          },
          {
            tipo: 'texto',
            texto: 'Muitas reações fotoquímicas começam pela **fotodissociação**: um fotão é absorvido e quebra uma ligação. Para isso, a energia do fotão, $E = \\dfrac{hc}{\\lambda}$, tem de ser pelo menos igual à energia de ligação **por molécula** (além disso, a molécula tem de absorver essa radiação).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'A energia de ligação O=O é $' + E('O=O') + '\\,\\mathrm{kJ\\,mol^{-1}}$. Calcula o comprimento de onda máximo de um fotão capaz de quebrar a ligação numa molécula de $\\mathrm{O_2}$ ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$, $h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$). Em que zona do espectro está?',
            resolucao: [
              'Energia por molécula: $E = \\dfrac{' + cient(E('O=O') * 1000, 3) + '\\,\\mathrm{J\\,mol^{-1}}}{' + NA + '\\,\\mathrm{mol^{-1}}} \\approx ' + cient(E('O=O') * 1000 / K.NA, 3) + '\\,\\mathrm{J}$',
              '$\\lambda = \\dfrac{hc}{E} = \\dfrac{' + h + ' \\times ' + c + '}{' + cient(E('O=O') * 1000 / K.NA, 3) + '} \\approx ' + cient(Q.lambdaParaQuebrarLigacao(E('O=O')), 3) + '\\,\\mathrm{m} = ' + Math.round(Q.lambdaParaQuebrarLigacao(E('O=O')) * 1e9) + '\\,\\mathrm{nm}$',
              'Só fotões com $\\lambda \\leq ' + Math.round(Q.lambdaParaQuebrarLigacao(E('O=O')) * 1e9) + '\\,\\mathrm{nm}$ (com energia igual ou maior) quebram a ligação: radiação **ultravioleta**.',
            ],
            resultado: 242,
            verificar: () => Math.round(Q.lambdaParaQuebrarLigacao(E('O=O')) * 1e9),
          },
          {
            tipo: 'texto',
            texto: '**O cloreto de prata e a luz (atividade laboratorial).** O cloreto de prata, $\\mathrm{AgCl}$, é um sólido branco. Exposto à luz, decompõe-se e escurece (fica cinzento-violeta), porque se forma prata metálica finamente dividida:',
          },
          {
            tipo: 'formula',
            texto: '$\\mathrm{2\\,AgCl(s)} \\xrightarrow{\\text{luz}} \\mathrm{2\\,Ag(s) + Cl_2(g)}$',
          },
          {
            tipo: 'texto',
            texto: 'Na atividade, obtém-se $\\mathrm{AgCl}$ (precipitado) juntando soluções de nitrato de prata e de cloreto de sódio. Divide-se em amostras: uma fica tapada (por exemplo, com papel de alumínio) como **controlo**, as outras expõem-se à luz (ou a luz de cores diferentes). Só as amostras iluminadas escurecem: a luz é a fonte de energia da reação.',
          },
          {
            tipo: 'texto',
            texto: 'Por isso, o nitrato de prata e outros sais de prata guardam-se em frascos escuros. A sensibilidade dos sais de prata à luz foi a base da fotografia tradicional e é usada em algumas lentes fotocromáticas.',
          },
          {
            tipo: 'definicao',
            texto: 'Um **radical livre** é uma espécie química com **eletrões desemparelhados**. Representa-se com um ponto: $\\mathrm{Cl}^{\\bullet}$, $\\mathrm{HO}^{\\bullet}$. Os radicais são muito **reativos**, porque o eletrão desemparelhado tende a emparelhar, reagindo com outras espécies.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Mostra que o átomo de cloro ($Z = 17$) é um radical e o ião cloreto, $\\mathrm{Cl^-}$, não é.',
            resolucao: [
              '$\\mathrm{Cl}$: $' + Q.configuracao(17).spd.replace(/ /g, '\\,') + '$. As 3 orbitais 3p têm 5 eletrões: fica ' + Q.configuracao(17).desemparelhados + ' eletrão desemparelhado, logo é um radical.',
              '$\\mathrm{Cl^-}$: $' + Q.configuracao(17, -1).spd.replace(/ /g, '\\,') + '$. Todos os eletrões estão emparelhados (' + Q.configuracao(17, -1).desemparelhados + ' desemparelhados): não é um radical.',
            ],
            resultado: 1,
            verificar: () => Q.configuracao(17).desemparelhados,
          },
          {
            tipo: 'texto',
            texto: '**O ozono na estratosfera** (entre cerca de 15 e 50 km de altitude) forma a **camada de ozono**, que absorve a maior parte da radiação ultravioleta do Sol e protege os seres vivos (cancro de pele, cataratas, danos nas plantas). Forma-se e decompõe-se continuamente:',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Passo', 'Equação'],
            linhas: [
              ['Fotodissociação do oxigénio (UV de maior energia)', '$\\mathrm{O_2} + h\\nu \\longrightarrow 2\\,\\mathrm{O}$'],
              ['Formação do ozono', '$\\mathrm{O + O_2 \\longrightarrow O_3}$'],
              ['Decomposição do ozono pela luz (absorve UV)', '$\\mathrm{O_3} + h\\nu \\longrightarrow \\mathrm{O_2 + O}$'],
              ['Decomposição do ozono com oxigénio atómico', '$\\mathrm{O + O_3 \\longrightarrow 2\\,O_2}$'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'Sem poluição, a formação e a decomposição equilibram-se e a quantidade de ozono mantém-se. O símbolo $h\\nu$ representa um fotão (energia $E = h\\nu$, com $\\nu$ a frequência).',
          },
          {
            tipo: 'texto',
            texto: '**CFC e o "buraco do ozono".** Os clorofluorocarbonetos (CFC), como o $\\mathrm{CCl_2F_2}$, usados em aerossóis e frigoríficos, são muito estáveis e chegam à estratosfera. Aí a radiação UV quebra uma ligação C–Cl e liberta radicais cloro: $\\mathrm{CCl_2F_2} + h\\nu \\longrightarrow \\mathrm{CClF_2}^{\\bullet} + \\mathrm{Cl}^{\\bullet}$.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Ciclo do cloro', 'Equação'],
            linhas: [
              ['O radical cloro destrói uma molécula de ozono', '$\\mathrm{Cl}^{\\bullet} + \\mathrm{O_3} \\longrightarrow \\mathrm{ClO}^{\\bullet} + \\mathrm{O_2}$'],
              ['O radical cloro é regenerado', '$\\mathrm{ClO}^{\\bullet} + \\mathrm{O} \\longrightarrow \\mathrm{Cl}^{\\bullet} + \\mathrm{O_2}$'],
              ['Balanço', '$\\mathrm{O_3 + O \\longrightarrow 2\\,O_2}$'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'Como o $\\mathrm{Cl}^{\\bullet}$ volta a formar-se no fim de cada ciclo (atua como catalisador), um só átomo de cloro destrói milhares de moléculas de ozono. Por isso o Protocolo de Montreal (1987) proibiu os CFC; os seus substitutos não destroem o ozono, mas alguns são gases com efeito de estufa.',
          },
          {
            tipo: 'texto',
            texto: '**O ozono na troposfera** é um **poluente**: forma-se perto do solo, em dias de sol, a partir de poluentes dos automóveis ($\\mathrm{NO_2} + h\\nu \\longrightarrow \\mathrm{NO + O}$, seguido de $\\mathrm{O + O_2 \\longrightarrow O_3}$). Faz parte do smog fotoquímico, irrita os olhos e as vias respiratórias, danifica as plantas e é um gás com efeito de estufa.',
          },
          {
            tipo: 'texto',
            texto: '**Radicais livres nos seres vivos.** Formam-se no metabolismo e por ação da radiação UV, do tabaco e da poluição. Atacam membranas, proteínas e DNA das células e contribuem para o **envelhecimento** e para algumas doenças. Os **antioxidantes** (por exemplo, as vitaminas C e E) reagem com os radicais e reduzem esses danos.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não confundas: o ozono **estratosférico** é benéfico (filtra a radiação UV); o ozono **troposférico** é um poluente. E o "buraco do ozono" não é o mesmo que o efeito de estufa: um é a diminuição da camada de ozono (por CFC); o outro é o aquecimento causado por gases que absorvem radiação infravermelha.',
          },
        ],
        resumo: [
          'Reação fotoquímica: a energia vem da luz. Para quebrar uma ligação, o fotão precisa de energia ≥ energia de ligação por molécula ($E = hc/\\lambda$).',
          'Cloreto de prata (branco) exposto à luz: $\\mathrm{2\\,AgCl \\longrightarrow 2\\,Ag + Cl_2}$, escurece; o controlo tapado não muda.',
          'Radicais livres: espécies com eletrões desemparelhados ($\\mathrm{Cl}^{\\bullet}$, $\\mathrm{HO}^{\\bullet}$), muito reativos.',
          'Estratosfera: $\\mathrm{O_2} + h\\nu \\longrightarrow 2\\,\\mathrm{O}$; $\\mathrm{O + O_2 \\longrightarrow O_3}$; $\\mathrm{O_3} + h\\nu \\longrightarrow \\mathrm{O_2 + O}$. A camada de ozono filtra o UV.',
          'CFC: a luz UV liberta $\\mathrm{Cl}^{\\bullet}$, que destrói o ozono num ciclo em que é regenerado (um Cl destrói milhares de $\\mathrm{O_3}$).',
          'Troposfera: o ozono é poluente (smog fotoquímico). Nos seres vivos, os radicais contribuem para o envelhecimento.',
        ],
        quiz: [
          {
            id: 'fotoquimica-q01',
            tipo: 'escolha',
            enunciado: 'Qual destas espécies é um radical livre?',
            opcoes: ['Átomo de cloro, $\\mathrm{Cl}$', 'Ião cloreto, $\\mathrm{Cl^-}$', 'Molécula de cloro, $\\mathrm{Cl_2}$', 'Cloreto de hidrogénio, $\\mathrm{HCl}$'],
            correta: 0,
            explicacao: 'O átomo de cloro tem 17 eletrões ($' + Q.configuracao(17).cerne.replace('[Ne]', '[\\mathrm{Ne}]').replace(/ /g, '\\,') + '$) e um deles está desemparelhado. Nas outras espécies os eletrões estão todos emparelhados.',
            errosTipicos: [
              { codigo: 'confundiu_iao_com_radical', opcao: 1, explicacao: 'Ter carga não faz de uma espécie um radical. O $\\mathrm{Cl^-}$ tem 18 eletrões, todos emparelhados (configuração do árgon).' },
              { codigo: 'molecula_de_atomos_radicais', opcao: 2, explicacao: 'No $\\mathrm{Cl_2}$ os eletrões desemparelhados dos dois átomos formaram o par ligante: não há eletrões desemparelhados.' },
            ],
          },
          {
            id: 'fotoquimica-q02',
            tipo: 'numerica',
            enunciado: 'A energia de ligação Cl–Cl é $' + E('Cl-Cl') + '\\,\\mathrm{kJ\\,mol^{-1}}$. Calcula o comprimento de onda máximo, em nm, de um fotão capaz de quebrar a ligação numa molécula de $\\mathrm{Cl_2}$ ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$, $h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$). Apresenta o resultado com três algarismos significativos.',
            resposta: 499,
            algarismos: 3,
            tolerancia: 0.5,
            resolucao: [
              '$E = \\dfrac{' + cient(E('Cl-Cl') * 1000, 3) + '}{' + NA + '} \\approx ' + cient(E('Cl-Cl') * 1000 / K.NA, 3) + '\\,\\mathrm{J}$ por molécula',
              '$\\lambda = \\dfrac{hc}{E} = \\dfrac{' + h + ' \\times ' + c + '}{' + cient(E('Cl-Cl') * 1000 / K.NA, 3) + '} \\approx ' + cient(Q.lambdaParaQuebrarLigacao(E('Cl-Cl')), 3) + '\\,\\mathrm{m} = ' + Math.round(Q.lambdaParaQuebrarLigacao(E('Cl-Cl')) * 1e9) + '\\,\\mathrm{nm}$ (luz visível)',
            ],
            verificar: () => arred(Q.lambdaParaQuebrarLigacao(E('Cl-Cl')) * 1e9, 3),
            errosTipicos: [
              { codigo: 'nao_converteu_kj_em_j', valor: arred(Q.lambdaParaQuebrarLigacao(E('Cl-Cl') / 1000) * 1e9, 3), explicacao: 'Usaste a energia em kJ sem passar a J e obtiveste um valor 1000 vezes maior, cerca de $' + cient(Q.lambdaParaQuebrarLigacao(E('Cl-Cl') / 1000) * 1e9, 3) + '\\,\\mathrm{nm}$. Primeiro: $' + E('Cl-Cl') + '\\,\\mathrm{kJ\\,mol^{-1}} = ' + cient(E('Cl-Cl') * 1000, 3) + '\\,\\mathrm{J\\,mol^{-1}}$.' },
            ],
          },
          {
            id: 'fotoquimica-q03',
            tipo: 'escolha',
            enunciado: 'Que equação traduz a **formação** de ozono na estratosfera?',
            opcoes: [
              '$\\mathrm{O + O_2 \\longrightarrow O_3}$',
              '$\\mathrm{O_3} + h\\nu \\longrightarrow \\mathrm{O_2 + O}$',
              '$\\mathrm{Cl}^{\\bullet} + \\mathrm{O_3} \\longrightarrow \\mathrm{ClO}^{\\bullet} + \\mathrm{O_2}$',
              '$\\mathrm{O + O_3 \\longrightarrow 2\\,O_2}$',
            ],
            correta: 0,
            explicacao: 'O oxigénio atómico, obtido pela fotodissociação do $\\mathrm{O_2}$, reage com $\\mathrm{O_2}$ e forma $\\mathrm{O_3}$. As outras equações são de decomposição do ozono.',
            errosTipicos: [
              { codigo: 'confundiu_formacao_com_decomposicao', opcao: 1, explicacao: 'Aqui o ozono é um **reagente**: é a decomposição do ozono pela radiação UV.' },
              { codigo: 'confundiu_formacao_com_ciclo_do_cloro', opcao: 2, explicacao: 'Esta é a destruição do ozono pelo radical cloro (ciclo dos CFC).' },
              { codigo: 'confundiu_formacao_com_decomposicao', opcao: 3, explicacao: 'O ozono está nos reagentes: é uma reação que o destrói.' },
            ],
          },
          {
            id: 'fotoquimica-q04',
            tipo: 'vf',
            enunciado: 'Na troposfera, junto ao solo, o ozono é um poluente.',
            correta: true,
            explicacao: 'O ozono troposférico forma-se a partir de poluentes (como o $\\mathrm{NO_2}$) com a luz solar; faz parte do smog fotoquímico e irrita as vias respiratórias. Só na estratosfera é benéfico.',
          },
          {
            id: 'fotoquimica-q05',
            tipo: 'escolha',
            enunciado: 'Na atividade com cloreto de prata, uma das amostras fica tapada com papel de alumínio. Para que serve?',
            opcoes: [
              'É o controlo: mostra que o escurecimento das outras amostras é causado pela luz.',
              'Protege a amostra do ar, porque o cloreto de prata reage com o oxigénio.',
              'Aquece a amostra para a reação ser mais rápida.',
              'Serve para recolher o cloro libertado.',
            ],
            correta: 0,
            explicacao: 'A amostra tapada passa pelas mesmas condições, exceto a luz. Se só as iluminadas escurecem, a causa é a luz: $\\mathrm{2\\,AgCl(s)} \\xrightarrow{\\text{luz}} \\mathrm{2\\,Ag(s) + Cl_2(g)}$.',
            errosTipicos: [
              { codigo: 'atribuiu_o_escurecimento_ao_ar', opcao: 1, explicacao: 'O escurecimento deve-se à luz, que decompõe o cloreto de prata em prata e cloro, não ao oxigénio do ar. A amostra tapada é o controlo.' },
            ],
          },
          {
            id: 'fotoquimica-q06',
            tipo: 'vf',
            enunciado: 'Um único radical cloro pode destruir muitas moléculas de ozono, porque é regenerado no fim de cada ciclo.',
            correta: true,
            explicacao: '$\\mathrm{Cl}^{\\bullet} + \\mathrm{O_3} \\longrightarrow \\mathrm{ClO}^{\\bullet} + \\mathrm{O_2}$ e $\\mathrm{ClO}^{\\bullet} + \\mathrm{O} \\longrightarrow \\mathrm{Cl}^{\\bullet} + \\mathrm{O_2}$: o cloro volta a ficar livre e o ciclo repete-se (atua como catalisador).',
          },
        ],
      },
    ],
  });
})();
