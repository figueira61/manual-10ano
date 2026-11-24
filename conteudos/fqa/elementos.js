globalThis.Manual = globalThis.Manual || {};

// Física e Química A — Química: tema «Elementos químicos e sua organização».
// Os valores químicos de referência (massas atómicas, isótopos, energias de ionização, raios, constantes, riscas)
// vêm de Manual.dadosQuimicos e entram no texto pelos auxiliares abaixo; os resultados dos exemplos e das
// perguntas numéricas são confirmados pelo validador com Manual.quimica (verificar).
(function () {
  const D = Manual.dadosQuimicos;
  const Q = Manual.quimica;
  const K = D.constantes;
  const el = (s) => D.elementos[s];

  // número com vírgula decimal: em KaTeX ({,}) e em texto corrido (,)
  const dec = (x, casas) => x.toFixed(casas).replace('.', '{,}');
  const decT = (x, casas) => x.toFixed(casas).replace('.', ',');
  // notação científica em KaTeX, mantissa em [1, 10) com `as` algarismos significativos
  const cient = (x, as) => {
    const [m, e] = x.toExponential(as - 1).split('e');
    return m.replace('.', '{,}') +' \\times 10^{' + Number(e) + '}';
  };
  const Ar = (s) => dec(el(s).massaAtomica, 2); // massa atómica relativa (TP do IAVE)
  const EI = (s) => String(el(s).ei1); // 1.ª energia de ionização, kJ/mol (NIST)
  const raio = (s) => String(el(s).raio); // raio atómico, pm (Slater)
  const iso = (s, a) => D.isotopos[s].find((x) => x.a === a);
  // configurações eletrónicas de Manual.quimica (Z ≤ 23) em KaTeX: notação spd completa e com o cerne
  const cfg = (z, carga) => Q.configuracao(z, carga || 0).spd.replace(/ /g, '\\,');
  const cfgCerne = (z, carga) => Q.configuracao(z, carga || 0).cerne
    .replace(/\[([A-Za-z]+)\]/, '[\\mathrm{$1}]').replace(/ /g, '\\,');
  // energia de remoção (kJ/mol nos dados) em MJ/mol, com 3 algarismos significativos
  const MJ = (kJ) => (kJ / 1000).toPrecision(3).replace('.', ',');
  const NA = cient(K.NA, 3);
  const h = cient(K.h, 3);
  const c = cient(K.c, 3);
  const EnH = cient(-K.EnH, 3); // 2,18 × 10^-18 (o sinal escreve-se no texto)
  const visMin = Math.round(D.espectro.find((z) => z.zona === 'visivel').min * 1e9);
  const visMax = Math.round(D.espectro.find((z) => z.zona === 'visivel').max * 1e9);

  Manual.registarTema('fqa', {
    id: 'elementos',
    titulo: 'Elementos químicos e sua organização',
    subtemas: [
      // ------------------------------------------------------------------
      {
        id: 'atomo',
        titulo: 'Constituição do átomo',
        ae: [
          'Descrever a constituição dos átomos utilizando os conceitos de número de massa, número atómico e isótopos.',
          'Interpretar a escala atómica recorrendo a exemplos da microscopia de alta resolução e da nanotecnologia, comparando-a com outras estruturas da natureza.',
        ],
        minutos: 8,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Toda a matéria é formada por átomos. Cada átomo tem um **núcleo** muito pequeno, com **protões** (carga positiva) e **neutrões** (sem carga), rodeado por **eletrões** (carga negativa), que formam a **nuvem eletrónica**.',
          },
          {
            tipo: 'texto',
            texto: 'O protão e o neutrão têm massas quase iguais e a massa do eletrão é muito menor. Por isso, quase toda a massa do átomo está no núcleo, embora o núcleo ocupe uma parte minúscula do volume do átomo.',
          },
          {
            tipo: 'esquema',
            id: 'fig-atomo',
            legenda: 'Toca na figura para afastar as partes e ver o nome de cada uma: nuvem eletrónica, núcleo, protão, neutrão e eletrão. O desenho não está à escala: o núcleo real é muitíssimo mais pequeno.',
          },
          {
            tipo: 'definicao',
            texto: 'O **número atómico** $Z$ é o número de protões do núcleo: identifica o elemento químico. O **número de massa** $A$ é o número de protões mais o número de neutrões (os **nucleões**). Num átomo neutro, o número de eletrões é igual a $Z$.',
          },
          {
            tipo: 'formula',
            texto: 'Um átomo do elemento $\\mathrm{X}$ representa-se por ${}^{A}_{Z}\\mathrm{X}$. Número de neutrões: $N = A - Z$. Num ião, a carga é (número de protões) − (número de eletrões): um catião perdeu eletrões, um anião ganhou.',
          },
          {
            tipo: 'definicao',
            texto: '**Isótopos** são átomos do mesmo elemento (mesmo $Z$) com números de massa diferentes, isto é, com números de neutrões diferentes. Por exemplo, ${}^{35}_{17}\\mathrm{Cl}$ e ${}^{37}_{17}\\mathrm{Cl}$ são isótopos do cloro, com 18 e 20 neutrões.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Indica o número de protões, de neutrões e de eletrões do ião ${}^{37}_{17}\\mathrm{Cl^{-}}$.',
            resolucao: [
              'Protões: $Z = 17$.',
              'Neutrões: $N = A - Z = 37 - 17 = 20$.',
              'Eletrões: o átomo neutro tem 17; a carga $-1$ indica que ganhou 1 eletrão, logo tem $17 + 1 = 18$ eletrões.',
            ],
            resultado: 20,
            verificar: () => iso('Cl', 37).a - el('Cl').z,
          },
          {
            tipo: 'esquema',
            id: 'fqa-atomo',
            opcoes: { z: 17, a: 37, carga: -1 },
            legenda: 'Muda Z, A e a carga: Z muda o elemento, A muda só o número de neutrões (outro isótopo) e a carga muda só o número de eletrões.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não troques $A$ com $Z$: $Z$ (em baixo) conta só os protões; $A$ (em cima) conta protões e neutrões, por isso $A \\geq Z$. E a carga de um ião muda o número de **eletrões**, nunca o de protões: ${}^{24}_{12}\\mathrm{Mg^{2+}}$ tem 12 protões e 10 eletrões.',
          },
          {
            tipo: 'texto',
            texto: '**Escala atómica.** O raio atómico do hidrogénio é ' + raio('H') + ' pm e o do potássio é ' + raio('K') + ' pm: os átomos medem dezenas a centenas de picómetros, com ordem de grandeza $10^{-10}\\,\\mathrm{m}$. O núcleo é cerca de dez mil a cem mil vezes mais pequeno do que o átomo.',
          },
          {
            tipo: 'formula',
            texto: '$1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$ (nanómetro) e $1\\,\\mathrm{pm} = 10^{-12}\\,\\mathrm{m}$ (picómetro), logo $1\\,\\mathrm{nm} = 1000\\,\\mathrm{pm}$.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Estrutura', 'Ordem de grandeza do tamanho'],
            linhas: [
              ['Espessura de um cabelo', '$10^{-4}\\,\\mathrm{m}$'],
              ['Glóbulo vermelho', '$10^{-5}\\,\\mathrm{m}$'],
              ['Bactéria', '$10^{-6}\\,\\mathrm{m}$'],
              ['Vírus', '$10^{-7}\\,\\mathrm{m}$'],
              ['Diâmetro da molécula de DNA', '$10^{-9}\\,\\mathrm{m}$ (cerca de 2 nm)'],
              ['Átomo', '$10^{-10}\\,\\mathrm{m}$'],
              ['Núcleo atómico', '$10^{-14}$ a $10^{-15}\\,\\mathrm{m}$'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'Os átomos são pequenos demais para o microscópio ótico. A **microscopia de alta resolução** (por exemplo, o microscópio de efeito de túnel) dá imagens de átomos individuais e permite até movê-los um a um.',
          },
          {
            tipo: 'texto',
            texto: 'A **nanotecnologia** estuda e fabrica estruturas com dimensões entre cerca de 1 nm e 100 nm, onde os materiais ganham propriedades novas. Exemplos: nanotubos de carbono e grafeno (folhas com um só átomo de espessura).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'O raio atómico do sódio é ' + raio('Na') + ' pm. Exprime-o em nanómetros e em metros, em notação científica.',
            resolucao: [
              'Em nanómetros: $1\\,\\mathrm{nm} = 1000\\,\\mathrm{pm}$, logo $' + raio('Na') + '\\,\\mathrm{pm} = \\dfrac{' + raio('Na') + '}{1000}\\,\\mathrm{nm} = ' + dec(el('Na').raio / 1000, 3) + '\\,\\mathrm{nm}$.',
              'Em metros: $1\\,\\mathrm{pm} = 10^{-12}\\,\\mathrm{m}$, logo $' + raio('Na') + '\\,\\mathrm{pm} = ' + raio('Na') + ' \\times 10^{-12}\\,\\mathrm{m} = ' + cient(el('Na').raio * 1e-12, 3) + '\\,\\mathrm{m}$.',
            ],
            resultado: 0.18,
            verificar: () => (el('Na').raio * 1e-12) / 1e-9,
          },
          {
            tipo: 'erro-frequente',
            texto: 'Ao converter, confirma o sentido: a unidade maior dá um número menor. $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$, não $10^{-6}\\,\\mathrm{m}$ (isso é o micrómetro). Para passar de pm a nm divide-se por 1000.',
          },
        ],
        resumo: [
          'Átomo: núcleo (protões + neutrões) muito pequeno, onde está quase toda a massa, e nuvem eletrónica (eletrões).',
          '${}^{A}_{Z}\\mathrm{X}$: $Z$ = número de protões (identifica o elemento), $A$ = protões + neutrões, $N = A - Z$.',
          'Átomo neutro: eletrões = $Z$. Catião: perdeu eletrões; anião: ganhou eletrões.',
          'Isótopos: mesmo $Z$, diferente $A$ (diferente número de neutrões).',
          'Átomos: da ordem de $10^{-10}\\,\\mathrm{m}$ (100 pm); $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$, $1\\,\\mathrm{pm} = 10^{-12}\\,\\mathrm{m}$.',
          'Microscopia de alta resolução vê átomos; nanotecnologia trabalha entre cerca de 1 e 100 nm.',
        ],
        quiz: [
          {
            id: 'atomo-q01',
            tipo: 'escolha',
            enunciado: 'Qual é a constituição do ião ${}^{40}_{20}\\mathrm{Ca^{2+}}$?',
            opcoes: [
              '20 protões, 20 neutrões e 18 eletrões',
              '20 protões, 20 neutrões e 22 eletrões',
              '20 protões, 40 neutrões e 18 eletrões',
              '18 protões, 22 neutrões e 18 eletrões',
            ],
            correta: 0,
            explicacao: '$Z = 20$ protões; $N = 40 - 20 = 20$ neutrões; a carga $2+$ indica que perdeu 2 eletrões: $20 - 2 = 18$ eletrões.',
            errosTipicos: [
              { codigo: 'somou_a_carga_aos_eletroes', opcao: 1, explicacao: 'Somaste a carga: 22 eletrões seria um anião. Um catião $2+$ perdeu 2 eletrões, por isso tem $20 - 2 = 18$.' },
              { codigo: 'tomou_a_como_numero_de_neutroes', opcao: 2, explicacao: '40 é o número de massa (protões + neutrões). Os neutrões são $40 - 20 = 20$.' },
              { codigo: 'mudou_os_protoes_com_a_carga', opcao: 3, explicacao: 'A carga muda o número de eletrões, nunca o de protões: o cálcio tem sempre 20 protões.' },
            ],
          },
          {
            id: 'atomo-q02',
            tipo: 'vf',
            enunciado: 'Os átomos ${}^{12}_{6}\\mathrm{C}$ e ${}^{13}_{6}\\mathrm{C}$ têm o mesmo número de neutrões.',
            correta: false,
            explicacao: 'São isótopos: têm o mesmo número de protões (6) mas neutrões diferentes, $12 - 6 = 6$ e $13 - 6 = 7$.',
            errosTipicos: [
              { codigo: 'isotopos_com_os_mesmos_neutroes', explicacao: 'Isótopos têm o mesmo número de protões, não de neutrões: aqui 6 e 7 neutrões.' },
            ],
          },
          {
            id: 'atomo-q03',
            tipo: 'numerica',
            enunciado: 'Quantos neutrões tem um átomo de ${}^{37}_{17}\\mathrm{Cl}$?',
            resposta: 20,
            tolerancia: 0,
            resolucao: [
              '$N = A - Z$',
              '$N = 37 - 17 = 20$',
            ],
            verificar: () => iso('Cl', 37).a - el('Cl').z,
            errosTipicos: [
              { codigo: 'deu_o_numero_de_massa', valor: 37, explicacao: '37 é o número de massa (protões + neutrões). Os neutrões são $37 - 17 = 20$.' },
              { codigo: 'somou_a_com_z', valor: 54, explicacao: 'Somaste $A$ e $Z$ ($37 + 17 = 54$); os neutrões obtêm-se subtraindo: $37 - 17 = 20$.' },
            ],
          },
          {
            id: 'atomo-q04',
            tipo: 'numerica',
            enunciado: 'O raio atómico do potássio é ' + raio('K') + ' pm. Exprime-o em nanómetros.',
            resposta: 0.22,
            tolerancia: 0.001,
            resolucao: [
              '$1\\,\\mathrm{nm} = 1000\\,\\mathrm{pm}$',
              '$' + raio('K') + '\\,\\mathrm{pm} = \\dfrac{' + raio('K') + '}{1000}\\,\\mathrm{nm} = ' + dec(el('K').raio / 1000, 2) + '\\,\\mathrm{nm}$',
            ],
            verificar: () => el('K').raio * 1e-12 / 1e-9,
            errosTipicos: [
              { codigo: 'dividiu_por_100', valor: 2.2, explicacao: 'Dividiste por 100 e obtiveste 2,2 nm; $1\\,\\mathrm{nm} = 1000\\,\\mathrm{pm}$, por isso divide-se por 1000: 0,22 nm.' },
              { codigo: 'multiplicou_em_vez_de_dividir', valor: 220000, explicacao: 'Multiplicaste por 1000 e obtiveste 220 000; o nanómetro é a unidade maior, por isso o número fica menor: 0,22 nm.' },
            ],
          },
          {
            id: 'atomo-q05',
            tipo: 'escolha',
            enunciado: 'Qual é a ordem de grandeza do diâmetro de um átomo?',
            opcoes: ['$10^{-10}\\,\\mathrm{m}$', '$10^{-15}\\,\\mathrm{m}$', '$10^{-7}\\,\\mathrm{m}$', '$10^{-5}\\,\\mathrm{m}$'],
            correta: 0,
            explicacao: 'Os átomos medem cerca de $10^{-10}\\,\\mathrm{m}$ (100 pm). $10^{-15}\\,\\mathrm{m}$ é a ordem de grandeza do núcleo; $10^{-7}\\,\\mathrm{m}$ a de um vírus; $10^{-5}\\,\\mathrm{m}$ a de uma célula.',
            errosTipicos: [
              { codigo: 'confundiu_atomo_com_nucleo', opcao: 1, explicacao: '$10^{-15}\\,\\mathrm{m}$ é a ordem de grandeza do núcleo, muito mais pequeno do que o átomo ($10^{-10}\\,\\mathrm{m}$).' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'mole',
        titulo: 'Massa atómica e quantidade de matéria',
        ae: [
          'Definir a unidade de massa atómica e interpretar o significado de massa atómica relativa média.',
          'Definir a unidade de massa atómica e interpretar o significado de massa atómica relativa.',
          'Relacionar o número de entidades com a quantidade de matéria, identificando a constante de Avogadro como constante de proporcionalidade.',
          'Resolver, experimentalmente, problemas de medição de massas e de volumes, selecionando os instrumentos de medição mais adequados, apresentando os resultados atendendo à incerteza de leitura e ao número adequado de algarismos significativos.',
          'Relacionar a massa de uma amostra e a quantidade de matéria com a massa molar.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'A **unidade de massa atómica** (u) é $\\dfrac{1}{12}$ da massa de um átomo de carbono-12 (${}^{12}\\mathrm{C}$). A **massa atómica relativa** $A_r$ de um elemento indica quantas vezes a massa média dos seus átomos é maior do que essa unidade; não tem unidades.',
          },
          {
            tipo: 'texto',
            texto: 'Quase todos os elementos têm vários isótopos. Por isso, a massa atómica relativa da Tabela Periódica é uma **média ponderada** das massas isotópicas relativas, com as **abundâncias** (percentagem de átomos de cada isótopo) como pesos.',
          },
          {
            tipo: 'formula',
            texto: '$A_r = \\dfrac{m_1 \\times x_1 + m_2 \\times x_2 + \\dots}{100}$, com $m_i$ a massa isotópica relativa e $x_i$ a abundância (em %) de cada isótopo.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'O cloro tem dois isótopos: ${}^{35}\\mathrm{Cl}$ (massa isotópica relativa ' + decT(iso('Cl', 35).massa, 4) + ', abundância ' + decT(iso('Cl', 35).abundancia, 2) + ' %) e ${}^{37}\\mathrm{Cl}$ (' + decT(iso('Cl', 37).massa, 4) + ', ' + decT(iso('Cl', 37).abundancia, 2) + ' %). Calcula a massa atómica relativa do cloro.',
            resolucao: [
              '$' + dec(iso('Cl', 35).massa, 4) + ' \\times ' + dec(iso('Cl', 35).abundancia, 2) + ' = 2649{,}24$',
              '$' + dec(iso('Cl', 37).massa, 4) + ' \\times ' + dec(iso('Cl', 37).abundancia, 2) + ' = 896{,}05$',
              '$A_r(\\mathrm{Cl}) = \\dfrac{2649{,}24 + 896{,}05}{100} = 35{,}4529 \\approx ' + Ar('Cl') + '$, o valor da Tabela Periódica.',
            ],
            resultado: 35.45,
            verificar: () => Math.round(Q.massaAtomicaMedia(D.isotopos.Cl) * 100) / 100,
          },
          {
            tipo: 'esquema',
            id: 'fqa-isotopos',
            opcoes: { elemento: 'Cl' },
            legenda: 'Muda as abundâncias: a massa atómica relativa aproxima-se da massa do isótopo mais abundante.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não faças a média simples das massas isotópicas: $\\dfrac{' + dec(iso('Cl', 35).massa, 4) + ' + ' + dec(iso('Cl', 37).massa, 4) + '}{2} = 35{,}9674$, longe de ' + '$' + Ar('Cl') + '$. Há muito mais átomos de ${}^{35}\\mathrm{Cl}$, por isso a média fica mais perto de 35. E não confundas $A_r$ (média, com casas decimais) com o número de massa $A$ (inteiro, de um isótopo).',
          },
          {
            tipo: 'definicao',
            texto: 'A **massa molecular relativa** $M_r$ é a soma das massas atómicas relativas dos átomos da molécula (ou da unidade estrutural, num composto iónico). Exemplo: $M_r(\\mathrm{H_2O}) = 2 \\times ' + Ar('H') + ' + ' + Ar('O') + ' = ' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '$.',
          },
          {
            tipo: 'definicao',
            texto: 'A **quantidade de matéria** $n$ mede-se em **mole** (mol). Uma mole tem tantas entidades (átomos, moléculas, iões) quanto o valor numérico da **constante de Avogadro**, $' + NA + '$ ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$). O número de entidades é proporcional a $n$, e $N_A$ é a constante de proporcionalidade.',
          },
          {
            tipo: 'formula',
            texto: '$N = n \\times N_A$ (número de entidades) e $m = n \\times M$, com a **massa molar** $M$ em $\\mathrm{g\\,mol^{-1}}$, numericamente igual a $A_r$ ou a $M_r$. Exemplo: $M(\\mathrm{H_2O}) = ' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Numa amostra há $0{,}200\\,\\mathrm{mol}$ de dióxido de carbono, $\\mathrm{CO_2}$. Calcula o número de moléculas e o número de átomos de oxigénio ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$).',
            resolucao: [
              'Moléculas: $N = n \\times N_A = 0{,}200 \\times ' + NA + ' = ' + cient(Q.entidades(0.2), 4) + ' \\approx ' + cient(Q.entidades(0.2), 3) + '$.',
              'Cada molécula tem 2 átomos de O: $N(\\mathrm{O}) = 2 \\times ' + cient(Q.entidades(0.2), 4) + ' \\approx ' + cient(Q.atomosNaAmostra(0.2, { C: 1, O: 2 }, 'O'), 3) + '$.',
            ],
            resultado: 1.2,
            verificar: () => Number((Q.entidades(0.2) / 1e23).toFixed(2)),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a quantidade de matéria e o número de moléculas em $10{,}0\\,\\mathrm{g}$ de água ($A_r(\\mathrm{H}) = ' + Ar('H') + '$, $A_r(\\mathrm{O}) = ' + Ar('O') + '$, $N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$).',
            resolucao: [
              'Massa molar: $M(\\mathrm{H_2O}) = 2 \\times ' + Ar('H') + ' + ' + Ar('O') + ' = ' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$.',
              '$n = \\dfrac{m}{M} = \\dfrac{10{,}0}{' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '} = 0{,}5549 \\approx 0{,}555\\,\\mathrm{mol}$.',
              '$N = n \\times N_A = 0{,}5549 \\times ' + NA + ' \\approx ' + cient(Q.entidades(Q.nDeMassa(10, Q.massaMolar({ H: 2, O: 1 }))), 3) + '$ moléculas.',
            ],
            resultado: 0.555,
            verificar: () => Number(Q.nDeMassa(10, Q.massaMolar({ H: 2, O: 1 })).toFixed(3)),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não confundas gramas com moles. $n = \\dfrac{m}{M}$, não $m \\times M$: confirma pelas unidades, $\\dfrac{\\mathrm{g}}{\\mathrm{g\\,mol^{-1}}} = \\mathrm{mol}$. E conta os átomos pelos índices: em $0{,}200\\,\\mathrm{mol}$ de $\\mathrm{CO_2}$ há $0{,}400\\,\\mathrm{mol}$ de átomos de O.',
          },
          {
            tipo: 'texto',
            texto: '**Medir massas e volumes (AL).** A massa mede-se numa balança. Para volumes rigorosos usam-se a pipeta, a bureta ou o balão volumétrico; a proveta é menos rigorosa e o gobelé não serve para medir volumes com rigor. Lê-se o volume com os olhos ao nível da base do menisco.',
          },
          {
            tipo: 'definicao',
            texto: 'A **incerteza de leitura** é, num instrumento analógico, metade da menor divisão da escala; num instrumento digital, uma unidade do último algarismo. Uma medida escreve-se com a incerteza: $(23{,}5 \\pm 0{,}5)\\,\\mathrm{mL}$ numa proveta graduada de 1 em 1 mL.',
          },
          {
            tipo: 'texto',
            texto: '**Algarismos significativos** são os algarismos certos mais o primeiro incerto. Os zeros à esquerda não contam ($0{,}0250$ tem 3); os zeros no fim, depois da vírgula, contam. Num produto ou num quociente, o resultado fica com tantos algarismos significativos quantos o dado que tem menos.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Mediu-se a massa de um líquido numa balança digital, $18{,}62\\,\\mathrm{g}$, e o seu volume numa proveta graduada de 1 em 1 mL, $23{,}5\\,\\mathrm{mL}$. Indica as incertezas de leitura e calcula a massa volúmica com o número adequado de algarismos significativos.',
            resolucao: [
              'Balança digital: incerteza de uma unidade do último algarismo, $\\pm 0{,}01\\,\\mathrm{g}$; a massa tem 4 algarismos significativos.',
              'Proveta (analógica): metade da menor divisão, $\\pm 0{,}5\\,\\mathrm{mL}$; o volume tem 3 algarismos significativos.',
              '$\\rho = \\dfrac{m}{V} = \\dfrac{18{,}62}{23{,}5} = 0{,}79234\\ldots\\,\\mathrm{g\\,mL^{-1}}$.',
              'O dado com menos algarismos significativos tem 3, logo $\\rho \\approx 0{,}792\\,\\mathrm{g\\,mL^{-1}}$.',
            ],
            resultado: 0.792,
            verificar: () => Number((18.62 / 23.5).toFixed(3)),
          },
        ],
        resumo: [
          'Unidade de massa atómica: $\\dfrac{1}{12}$ da massa de um átomo de carbono-12.',
          '$A_r$: média ponderada das massas isotópicas relativas pelas abundâncias; sem unidades.',
          '$M_r$: soma das $A_r$ dos átomos da molécula.',
          '$N = n \\times N_A$, com $N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$; $m = n \\times M$, com $M$ em $\\mathrm{g\\,mol^{-1}}$.',
          'Incerteza de leitura: metade da menor divisão (analógico) ou uma unidade do último algarismo (digital).',
          'Produto e quociente: tantos algarismos significativos quantos os do dado com menos.',
        ],
        quiz: [
          {
            id: 'mole-q01',
            tipo: 'numerica',
            enunciado: 'O boro tem dois isótopos: ${}^{10}\\mathrm{B}$ (massa isotópica relativa ' + decT(iso('B', 10).massa, 4) + ', abundância ' + decT(iso('B', 10).abundancia, 1) + ' %) e ${}^{11}\\mathrm{B}$ (' + decT(iso('B', 11).massa, 4) + ', ' + decT(iso('B', 11).abundancia, 1) + ' %). Calcula a massa atómica relativa do boro, com duas casas decimais.',
            resposta: 10.81,
            tolerancia: 0.01,
            resolucao: [
              '$A_r = \\dfrac{' + dec(iso('B', 10).massa, 4) + ' \\times ' + dec(iso('B', 10).abundancia, 1) + ' + ' + dec(iso('B', 11).massa, 4) + ' \\times ' + dec(iso('B', 11).abundancia, 1) + '}{100}$',
              '$= \\dfrac{199{,}26 + 881{,}84}{100} = 10{,}811 \\approx 10{,}81$',
            ],
            verificar: () => Math.round(Q.massaAtomicaMedia(D.isotopos.B) * 100) / 100,
            errosTipicos: [
              { codigo: 'media_simples_sem_abundancias', valor: 10.51, explicacao: 'Fizeste a média simples das duas massas (10,51). É preciso pesar cada massa pela sua abundância: o ${}^{11}\\mathrm{B}$ é muito mais abundante, por isso a média fica perto de 11.' },
            ],
          },
          {
            id: 'mole-q02',
            tipo: 'numerica',
            enunciado: 'Calcula a quantidade de matéria (em mol) que existe em $22{,}0\\,\\mathrm{g}$ de dióxido de carbono, $\\mathrm{CO_2}$ ($A_r(\\mathrm{C}) = ' + Ar('C') + '$, $A_r(\\mathrm{O}) = ' + Ar('O') + '$). Apresenta o resultado com três algarismos significativos.',
            resposta: 0.5,
            algarismos: 3,
            tolerancia: 0.0005,
            resolucao: [
              '$M(\\mathrm{CO_2}) = ' + Ar('C') + ' + 2 \\times ' + Ar('O') + ' = ' + dec(Q.massaMolar({ C: 1, O: 2 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$',
              '$n = \\dfrac{m}{M} = \\dfrac{22{,}0}{' + dec(Q.massaMolar({ C: 1, O: 2 }), 2) + '} = 0{,}49989 \\approx 0{,}500\\,\\mathrm{mol}$',
            ],
            verificar: () => Number(Q.nDeMassa(22.0, Q.massaMolar({ C: 1, O: 2 })).toFixed(3)),
            errosTipicos: [
              { codigo: 'multiplicou_massa_pela_massa_molar', valor: 968.22, explicacao: 'Multiplicaste $22{,}0 \\times 44{,}01 = 968{,}22$. A quantidade de matéria é $n = \\dfrac{m}{M}$: as unidades confirmam, $\\mathrm{g} \\div \\mathrm{g\\,mol^{-1}} = \\mathrm{mol}$.' },
              { codigo: 'dividiu_ao_contrario', valor: 2, explicacao: 'Calculaste $\\dfrac{M}{m} = \\dfrac{44{,}01}{22{,}0} \\approx 2{,}00$; é ao contrário: $n = \\dfrac{m}{M}$.' },
              { codigo: 'esqueceu_o_indice', valor: 0.785, explicacao: 'Usaste $M = 28{,}01\\,\\mathrm{g\\,mol^{-1}}$ (só um O) e obtiveste 0,785 mol; o índice 2 conta: $M(\\mathrm{CO_2}) = 44{,}01\\,\\mathrm{g\\,mol^{-1}}$.' },
            ],
          },
          {
            id: 'mole-q03',
            tipo: 'escolha',
            enunciado: 'Quantos átomos há, no total, em $0{,}10\\,\\mathrm{mol}$ de água, $\\mathrm{H_2O}$ ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$)?',
            opcoes: ['$1{,}8 \\times 10^{23}$', '$6{,}0 \\times 10^{22}$', '$1{,}2 \\times 10^{23}$', '$6{,}0 \\times 10^{23}$'],
            correta: 0,
            explicacao: 'Há $0{,}10 \\times ' + NA + ' = ' + cient(Q.entidades(0.1), 2) + '$ moléculas e cada uma tem 3 átomos (2 de H e 1 de O): $3 \\times ' + cient(Q.entidades(0.1), 2) + ' \\approx ' + cient(Q.atomosNaAmostra(0.1, { H: 2, O: 1 }, 'H') + Q.atomosNaAmostra(0.1, { H: 2, O: 1 }, 'O'), 2) + '$ átomos.',
            errosTipicos: [
              { codigo: 'contou_moleculas_em_vez_de_atomos', opcao: 1, explicacao: '$6{,}0 \\times 10^{22}$ é o número de moléculas. Cada molécula de água tem 3 átomos, por isso multiplica por 3.' },
              { codigo: 'contou_so_os_atomos_de_h', opcao: 2, explicacao: '$1{,}2 \\times 10^{23}$ são só os átomos de hidrogénio (2 por molécula); falta o átomo de oxigénio de cada molécula.' },
              { codigo: 'ignorou_a_quantidade_de_materia', opcao: 3, explicacao: '$6{,}0 \\times 10^{23}$ é o número de entidades numa mole; aqui há só $0{,}10\\,\\mathrm{mol}$, e são átomos que se contam (3 por molécula).' },
            ],
          },
          {
            id: 'mole-q04',
            tipo: 'vf',
            enunciado: 'A massa molar da água e a sua massa molecular relativa têm o mesmo valor numérico, mas só a massa molar tem unidade ($\\mathrm{g\\,mol^{-1}}$).',
            correta: true,
            explicacao: '$M_r(\\mathrm{H_2O}) = ' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '$ (sem unidades) e $M(\\mathrm{H_2O}) = ' + dec(Q.massaMolar({ H: 2, O: 1 }), 2) + '\\,\\mathrm{g\\,mol^{-1}}$.',
          },
          {
            id: 'mole-q05',
            tipo: 'escolha',
            enunciado: 'Quantos algarismos significativos tem a medida $0{,}0250\\,\\mathrm{g}$?',
            opcoes: ['2', '3', '4', '5'],
            correta: 1,
            explicacao: 'Os zeros à esquerda (0,0…) só marcam a posição da vírgula e não contam; o zero final, depois da vírgula, conta. Ficam 2, 5 e 0: 3 algarismos significativos.',
            errosTipicos: [
              { codigo: 'nao_contou_o_zero_final', opcao: 0, explicacao: 'O zero no fim, depois da vírgula, é significativo: indica que a medida foi feita até essa casa. São 3 algarismos significativos (2, 5 e 0).' },
              { codigo: 'contou_os_zeros_a_esquerda', opcao: 3, explicacao: 'Os zeros à esquerda não são significativos (mudam com a unidade: 0,0250 g = 25,0 mg). São 3 algarismos significativos.' },
            ],
          },
          {
            id: 'mole-q06',
            tipo: 'escolha',
            enunciado: 'Uma balança digital indica $12{,}47\\,\\mathrm{g}$. Qual é a incerteza de leitura?',
            opcoes: ['$\\pm 0{,}01\\,\\mathrm{g}$', '$\\pm 0{,}005\\,\\mathrm{g}$', '$\\pm 0{,}1\\,\\mathrm{g}$', '$\\pm 1\\,\\mathrm{g}$'],
            correta: 0,
            explicacao: 'Num instrumento digital, a incerteza de leitura é uma unidade do último algarismo: $\\pm 0{,}01\\,\\mathrm{g}$.',
            errosTipicos: [
              { codigo: 'usou_metade_da_divisao_num_digital', opcao: 1, explicacao: 'Metade da menor divisão é a regra dos instrumentos analógicos (de escala). Num digital é uma unidade do último algarismo: $\\pm 0{,}01\\,\\mathrm{g}$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'espectros',
        titulo: 'Espectros e energia dos eletrões',
        ae: [
          'Relacionar as energias dos fotões correspondentes às zonas mais comuns do espectro eletromagnético e essas energias com a frequência da luz.',
          'Interpretar os espectros de emissão do átomo de hidrogénio a partir da quantização da energia e da transição entre níveis eletrónicos e generalizar para qualquer átomo.',
          'Comparar os espectros de absorção e emissão de vários elementos químicos, concluindo que são característicos de cada elemento.',
          'Explicar, a partir de informação selecionada, algumas aplicações da espectroscopia atómica (por exemplo, identificação de elementos químicos nas estrelas, determinação de quantidades vestigiais em química forense).',
          'Identificar, experimentalmente, elementos químicos em amostras desconhecidas de vários sais, usando testes de chama, comunicando as conclusões.',
        ],
        minutos: 15,
        essencial: [
          {
            tipo: 'texto',
            texto: 'A luz é **radiação eletromagnética**. Por ordem decrescente de comprimento de onda $\\lambda$: ondas de rádio, micro-ondas, infravermelho (IV), visível, ultravioleta (UV), raios X e raios gama. O visível vai de cerca de ' + visMin + ' nm (violeta) a ' + visMax + ' nm (vermelho).',
          },
          {
            tipo: 'texto',
            texto: 'A radiação é emitida e absorvida em "pacotes" de energia, os **fotões**. A energia de cada fotão é proporcional à frequência $f$: quanto maior a frequência (menor $\\lambda$), mais energético é o fotão. Os fotões de UV, X e gama têm energia suficiente para danificar moléculas da pele e do DNA.',
          },
          {
            tipo: 'formula',
            texto: '$E = h f$ e $c = \\lambda f$, logo $E = \\dfrac{h c}{\\lambda}$, com $h = ' + h + '\\,\\mathrm{J\\,s}$ (constante de Planck) e $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$ (velocidade da luz no vazio).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Calcula a frequência e a energia de um fotão de luz verde com $\\lambda = 500\\,\\mathrm{nm}$ ($h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$).',
            resolucao: [
              'Converter: $500\\,\\mathrm{nm} = 500 \\times 10^{-9}\\,\\mathrm{m} = 5{,}00 \\times 10^{-7}\\,\\mathrm{m}$.',
              '$f = \\dfrac{c}{\\lambda} = \\dfrac{' + c + '}{5{,}00 \\times 10^{-7}} = ' + cient(Q.energiaFotao({ lambda: 500e-9 }).f, 3) + '\\,\\mathrm{Hz}$.',
              '$E = h f = ' + h + ' \\times ' + cient(Q.energiaFotao({ lambda: 500e-9 }).f, 3) + ' \\approx ' + cient(Q.energiaFotao({ lambda: 500e-9 }).E, 3) + '\\,\\mathrm{J}$.',
            ],
            resultado: 3.98,
            verificar: () => Number((Q.energiaFotao({ lambda: 500e-9 }).E / 1e-19).toFixed(2)),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Converte sempre $\\lambda$ para metros antes de usar $c = \\lambda f$: $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$, logo $500\\,\\mathrm{nm} = 5{,}00 \\times 10^{-7}\\,\\mathrm{m}$ (não $5{,}00 \\times 10^{-4}$ nem $5{,}00 \\times 10^{-10}$). E lembra-te: maior $\\lambda$ significa **menor** energia.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-espectro',
            opcoes: { lambda: 500e-9 },
            legenda: 'Arrasta ao longo do espectro: vê a zona, a frequência e a energia do fotão mudarem. Em baixo, compara as riscas de emissão e de absorção do hidrogénio, do sódio e do hélio.',
          },
          {
            tipo: 'texto',
            texto: 'Um sólido muito quente (como o filamento de uma lâmpada) emite um **espectro contínuo**, com todas as cores. Um gás de átomos excitados emite só algumas radiações: é um **espectro de riscas** (descontínuo), com riscas brilhantes sobre fundo escuro.',
          },
          {
            tipo: 'texto',
            texto: 'Se luz branca atravessar um gás, os átomos absorvem algumas radiações: obtém-se um **espectro de absorção**, com riscas escuras sobre o espectro contínuo. Cada risca de absorção coincide com uma risca de emissão do mesmo elemento.',
          },
          {
            tipo: 'definicao',
            texto: 'O conjunto de riscas é **característico de cada elemento**, como uma impressão digital: não há dois elementos com o mesmo espectro. Por exemplo, o sódio tem duas riscas amarelas muito próximas, a ' + decT(D.riscas.Na.linhas[0], 1) + ' nm e a ' + decT(D.riscas.Na.linhas[1], 1) + ' nm.',
          },
          {
            tipo: 'texto',
            texto: '**Modelo de Bohr.** Para explicar as riscas do hidrogénio, Niels Bohr propôs em 1913 um modelo de átomo baseado em **postulados**, afirmações aceites sem demonstração e justificadas pelo acordo com os resultados experimentais. No modelo de Bohr, o eletrão move-se à volta do núcleo em **órbitas circulares** e só são permitidas certas órbitas, cada uma com uma energia bem definida: a energia do eletrão está **quantizada**.',
          },
          {
            tipo: 'definicao',
            texto: 'Cada órbita permitida corresponde a um **nível de energia**, numerado por $n = 1, 2, 3, \\dots$ A energia do eletrão no átomo é **negativa** e é tanto **maior** (menos negativa) quanto mais longe do núcleo estiver a órbita. O valor $0$ corresponde a $n = \\infty$: o eletrão deixou de estar ligado ao núcleo.',
          },
          {
            tipo: 'texto',
            texto: 'O eletrão só muda de órbita (faz uma **transição**) se o átomo **absorver** ou **emitir** energia com um valor bem definido, igual à diferença de energia entre os dois níveis. Para subir de nível, o átomo absorve energia; ao descer, emite-a, por exemplo como um fotão.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Situação', 'Nível do eletrão', 'Nome'],
            linhas: [
              ['Eletrão no nível de menor energia', '$n = 1$', '**estado fundamental** (o mais estável)'],
              ['Eletrão num nível de energia maior', '$n = 2, 3, 4, \\dots$', '**estado excitado**'],
              ['O eletrão volta a um nível mais baixo', 'desce de nível', '**desexcitação** (com emissão de energia)'],
              ['O eletrão sai do átomo', '$n = \\infty$ (energia $0$)', '**ionização** (o átomo passa a ião positivo)'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'Um átomo pode ser **excitado** por **aquecimento** (como nos testes de chama), por **colisões** com outros átomos, por **descargas elétricas** (como nos tubos de gás e nos letreiros luminosos) ou por **absorção de fotões**. Um átomo excitado desexcita-se depressa e emite a energia em excesso.',
          },
          {
            tipo: 'esquema',
            id: 'fig-bohr',
            legenda: 'Toca na figura para separar as partes e ver o nome de cada uma: o núcleo, as órbitas $n = 1$ a $n = 4$, o limite $n = \\infty$ (ionização) e as transições de absorção e de emissão. O desenho não está à escala.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'O estado fundamental é só o de $n = 1$; $n = 2$ já é um estado excitado. E a energia do eletrão no átomo nunca é positiva: é negativa e aumenta com $n$, até $0$ em $n = \\infty$. Hoje sabe-se que os eletrões **não** descrevem órbitas bem definidas, mas a ideia de **níveis de energia** do modelo de Bohr continua válida e explica os espectros de riscas.',
          },
          {
            tipo: 'texto',
            texto: '**Níveis de energia do hidrogénio.** Os níveis do modelo de Bohr (vê acima) podem calcular-se para o átomo de hidrogénio. Tal como lá, o estado fundamental é $n = 1$, os outros níveis são estados excitados e a energia $0$ corresponde ao eletrão já separado do átomo ($n = \\infty$).',
          },
          {
            tipo: 'formula',
            texto: 'No átomo de hidrogénio, $E_n = -\\dfrac{' + EnH + '}{n^2}\\,\\mathrm{J}$. Numa transição, $\\Delta E = E_{\\text{final}} - E_{\\text{inicial}}$ e o fotão emitido ou absorvido tem $E_{\\text{fotão}} = |\\Delta E| = \\dfrac{hc}{\\lambda}$.',
          },
          {
            tipo: 'texto',
            texto: 'Quando o eletrão **desce** de nível, o átomo **emite** um fotão ($\\Delta E < 0$); para **subir**, tem de **absorver** um fotão com exatamente essa energia ($\\Delta E > 0$). Como só há certos níveis, só há certas energias: daí as riscas.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Série (emissão)', 'Nível final', 'Zona do espectro'],
            linhas: [
              ['Lyman', '$n = 1$', 'ultravioleta'],
              ['Balmer', '$n = 2$', 'visível (as riscas de $n = 3, 4, 5, 6$ para $n = 2$) e ultravioleta próximo'],
              ['Paschen', '$n = 3$', 'infravermelho'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um eletrão do átomo de hidrogénio passa do nível $n = 3$ para o nível $n = 2$. Calcula a energia do fotão e o seu comprimento de onda ($E_n = -\\dfrac{' + EnH + '}{n^2}\\,\\mathrm{J}$, $h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$).',
            resolucao: [
              '$E_3 = -\\dfrac{' + EnH + '}{9} = ' + cient(Q.energiaNivelH(3), 3) + '\\,\\mathrm{J}$ e $E_2 = -\\dfrac{' + EnH + '}{4} = ' + cient(Q.energiaNivelH(2), 3) + '\\,\\mathrm{J}$.',
              '$\\Delta E = E_2 - E_3 = ' + cient(Q.transicaoH(3, 2).deltaE, 3) + '\\,\\mathrm{J}$: negativo, é uma **emissão**; o fotão tem $' + cient(-Q.transicaoH(3, 2).deltaE, 3) + '\\,\\mathrm{J}$.',
              '$\\lambda = \\dfrac{hc}{|\\Delta E|} = \\dfrac{' + h + ' \\times ' + c + '}{' + cient(-Q.transicaoH(3, 2).deltaE, 3) + '} \\approx ' + cient(Q.transicaoH(3, 2).lambda, 3) + '\\,\\mathrm{m} = ' + Math.round(Q.transicaoH(3, 2).lambda * 1e9) + '\\,\\mathrm{nm}$ (com $|\\Delta E|$ ainda por arredondar).',
              'Está no visível (vermelho): é uma risca da série de Balmer.',
            ],
            resultado: 657,
            verificar: () => Math.round(Q.transicaoH(3, 2).lambda * 1e9),
          },
          {
            tipo: 'esquema',
            id: 'fqa-niveis',
            opcoes: { ni: 3, nf: 2 },
            legenda: 'Escolhe o nível inicial e o final: vê se é emissão ou absorção, a energia e o comprimento de onda do fotão e a série. As riscas visíveis são todas da série de Balmer.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Que energia é preciso fornecer para remover o eletrão de um átomo de hidrogénio no estado fundamental? Exprime-a também por mole de átomos ($N_A = ' + NA + '\\,\\mathrm{mol^{-1}}$).',
            resolucao: [
              'O eletrão passa de $n = 1$ ($E_1 = ' + cient(Q.energiaNivelH(1), 3) + '\\,\\mathrm{J}$) para $E = 0$ (eletrão removido).',
              'Por átomo: $E = 0 - (' + cient(Q.energiaNivelH(1), 3) + ') = ' + EnH + '\\,\\mathrm{J}$.',
              'Por mole: $' + EnH + ' \\times ' + NA + ' = ' + cient(-K.EnH * K.NA, 4) + '\\,\\mathrm{J\\,mol^{-1}} \\approx ' + Math.round(-K.EnH * K.NA / 1000) + '\\,\\mathrm{kJ\\,mol^{-1}}$: é a energia de ionização do hidrogénio.',
            ],
            resultado: 1312,
            verificar: () => Math.round(-Q.energiaNivelH(1) * K.NA / 1000),
          },
          {
            tipo: 'erro-frequente',
            texto: 'A energia do fotão é a **diferença** entre os dois níveis, não a energia de um deles. E os níveis têm energia negativa: $E_3$ é **maior** que $E_2$ (menos negativa). A energia do fotão é sempre positiva, $|\\Delta E|$; o sinal de $\\Delta E$ só diz se é emissão ($-$) ou absorção ($+$).',
          },
          {
            tipo: 'texto',
            texto: 'O mesmo acontece em **qualquer átomo**: os eletrões só têm certas energias, e essas energias são diferentes de elemento para elemento. Por isso cada elemento tem riscas próprias.',
          },
          {
            tipo: 'texto',
            texto: '**Espectroscopia atómica.** Analisando as riscas de absorção da luz das estrelas, sabe-se de que elementos são feitas; o hélio foi identificado no espectro do Sol (1868) antes de ser encontrado na Terra. Em **química forense**, a espectroscopia deteta quantidades vestigiais de elementos (por exemplo, metais em resíduos de disparos ou em casos de envenenamento).',
          },
          {
            tipo: 'texto',
            texto: '**Testes de chama (AL).** Leva-se uma pequena amostra de um sal à chama: os eletrões do elemento metálico são excitados e, ao voltarem a níveis inferiores, emitem luz de cor característica. Compara-se a cor com a de sais conhecidos.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Elemento (no sal)', 'Cor da chama'],
            linhas: [
              ['Lítio', 'vermelho (carmim)'],
              ['Sódio', 'amarelo-alaranjado intenso'],
              ['Potássio', 'violeta (lilás)'],
              ['Cálcio', 'vermelho-alaranjado (cor de tijolo)'],
              ['Estrôncio', 'vermelho'],
              ['Bário', 'verde-amarelado'],
              ['Cobre', 'verde-azulado'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'O teste tem limites: cores parecidas (lítio e estrôncio) confundem-se, e uma impureza de sódio esconde as outras cores. Para identificar com segurança usa-se um espectroscópio, que mostra as riscas.',
          },
        ],
        resumo: [
          'Por ordem crescente de energia dos fotões: rádio, micro-ondas, IV, visível, UV, X, gama.',
          '$E = hf$, $c = \\lambda f$, $E = \\dfrac{hc}{\\lambda}$: maior frequência, menor $\\lambda$, maior energia.',
          'Espectro contínuo (sólido quente); de riscas, de emissão (riscas brilhantes) ou de absorção (riscas escuras).',
          'Modelo de Bohr (1913): órbitas de energia quantizada, negativa e maior longe do núcleo; $n = 1$ é o estado fundamental, $n \\geq 2$ são estados excitados e $n = \\infty$ é a ionização (energia $0$).',
          'A energia do eletrão é quantizada:$E_n = -\\dfrac{' + EnH + '}{n^2}\\,\\mathrm{J}$ no H. Emissão ao descer, absorção ao subir, $E_{\\text{fotão}} = |\\Delta E|$.',
          'Séries do H: Lyman (até $n = 1$, UV), Balmer (até $n = 2$, visível), Paschen (até $n = 3$, IV).',
          'Cada elemento tem um espectro próprio: estrelas, química forense e testes de chama.',
        ],
        quiz: [
          {
            id: 'espectros-q01',
            tipo: 'escolha',
            enunciado: 'Qual é a ordem **crescente** da energia dos fotões?',
            opcoes: [
              'infravermelho < visível < ultravioleta < raios X',
              'raios X < ultravioleta < visível < infravermelho',
              'visível < infravermelho < ultravioleta < raios X',
              'ultravioleta < visível < infravermelho < raios X',
            ],
            correta: 0,
            explicacao: 'A energia do fotão cresce com a frequência, isto é, quando o comprimento de onda diminui: IV, visível, UV, X.',
            errosTipicos: [
              { codigo: 'ordenou_por_comprimento_de_onda', opcao: 1, explicacao: 'Essa é a ordem crescente do comprimento de onda. A energia é inversa: $E = \\dfrac{hc}{\\lambda}$, por isso a ordem fica ao contrário.' },
            ],
          },
          {
            id: 'espectros-q02',
            tipo: 'numerica',
            enunciado: 'Um fotão tem energia $4{,}42 \\times 10^{-19}\\,\\mathrm{J}$. Calcula o seu comprimento de onda, em nanómetros ($h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$).',
            resposta: 450,
            tolerancia: 1,
            resolucao: [
              '$\\lambda = \\dfrac{hc}{E} = \\dfrac{' + h + ' \\times ' + c + '}{4{,}42 \\times 10^{-19}}$',
              '$= ' + cient(K.h * K.c / 4.42e-19, 3) + '\\,\\mathrm{m} = 450\\,\\mathrm{nm}$',
            ],
            verificar: () => Math.round(Q.energiaFotao({ f: 4.42e-19 / K.h }).lambda / 1e-9),
          },
          {
            id: 'espectros-q03',
            tipo: 'numerica',
            enunciado: 'No átomo de hidrogénio, $E_n = -\\dfrac{' + EnH + '}{n^2}\\,\\mathrm{J}$. Calcula o comprimento de onda, em nanómetros, da radiação emitida na transição de $n = 4$ para $n = 2$ ($h = ' + h + '\\,\\mathrm{J\\,s}$, $c = ' + c + '\\,\\mathrm{m\\,s^{-1}}$).',
            resposta: 487,
            tolerancia: 1,
            resolucao: [
              '$E_4 = -\\dfrac{' + EnH + '}{16} = ' + cient(Q.energiaNivelH(4), 4) + '\\,\\mathrm{J}$; $E_2 = -\\dfrac{' + EnH + '}{4} = ' + cient(Q.energiaNivelH(2), 3) + '\\,\\mathrm{J}$',
              '$|\\Delta E| = |E_2 - E_4| = ' + cient(-Q.transicaoH(4, 2).deltaE, 4) + '\\,\\mathrm{J}$',
              '$\\lambda = \\dfrac{hc}{|\\Delta E|} = ' + cient(Q.transicaoH(4, 2).lambda, 3) + '\\,\\mathrm{m} \\approx 487\\,\\mathrm{nm}$ (visível, série de Balmer)',
            ],
            verificar: () => Math.round(Q.transicaoH(4, 2).lambda * 1e9),
            errosTipicos: [
              { codigo: 'usou_so_a_energia_do_nivel_inicial', valor: 1460, explicacao: 'Usaste só $|E_4|$ e obtiveste cerca de 1460 nm. A energia do fotão é a diferença $|E_2 - E_4|$.' },
              { codigo: 'usou_so_a_energia_do_nivel_final', valor: 365, explicacao: 'Usaste só $|E_2|$ e obtiveste cerca de 365 nm. A energia do fotão é a diferença $|E_2 - E_4|$.' },
            ],
          },
          {
            id: 'espectros-q04',
            tipo: 'escolha',
            enunciado: 'No átomo de hidrogénio, a transição do eletrão de $n = 2$ para $n = 1$ origina uma risca…',
            opcoes: [
              'de emissão, da série de Lyman, no ultravioleta.',
              'de emissão, da série de Balmer, no visível.',
              'de absorção, da série de Lyman, no ultravioleta.',
              'de emissão, da série de Paschen, no infravermelho.',
            ],
            correta: 0,
            explicacao: 'O eletrão desce de nível (emissão) e termina em $n = 1$: série de Lyman, no ultravioleta (cerca de ' + Math.round(Q.transicaoH(2, 1).lambda * 1e9) + ' nm).',
            errosTipicos: [
              { codigo: 'serie_pelo_nivel_inicial', opcao: 1, explicacao: 'A série é dada pelo nível **final** da emissão: termina em $n = 1$, logo é Lyman (ultravioleta), não Balmer.' },
              { codigo: 'trocou_emissao_com_absorcao', opcao: 2, explicacao: 'O eletrão desce de nível ($n = 2 \\to n = 1$): perde energia e emite um fotão. Subir é que seria absorção.' },
            ],
          },
          {
            id: 'espectros-q05',
            tipo: 'vf',
            enunciado: 'Cada risca escura do espectro de absorção de um elemento coincide com uma risca brilhante do espectro de emissão desse elemento.',
            correta: true,
            explicacao: 'O átomo absorve e emite fotões com as mesmas energias, as diferenças entre os seus níveis; por isso as riscas aparecem nos mesmos comprimentos de onda.',
          },
          {
            id: 'espectros-q06',
            tipo: 'escolha',
            enunciado: 'Num teste de chama, um sal desconhecido deu uma chama amarelo-alaranjada intensa. Que elemento contém, provavelmente?',
            opcoes: ['Sódio', 'Potássio', 'Cobre', 'Lítio'],
            correta: 0,
            explicacao: 'O sódio dá uma chama amarelo-alaranjada intensa (riscas a ' + decT(D.riscas.Na.linhas[0], 1) + ' e ' + decT(D.riscas.Na.linhas[1], 1) + ' nm). O potássio dá violeta, o cobre verde-azulado e o lítio vermelho.',
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'configuracao',
        titulo: 'Configuração eletrónica',
        ae: [
          'Reconhecer que nos átomos poli-eletrónicos, para além da atração entre os eletrões e o núcleo que diminui a energia dos eletrões, existe a repulsão entre os eletrões que aumenta a sua energia.',
          'Interpretar o modelo da nuvem eletrónica.',
          'Interpretar valores de energia de remoção eletrónica com base nos níveis e subníveis de energia.',
          'Compreender que as orbitais s, p e d e as suas representações gráficas são distribuições probabilísticas; reconhecendo que as orbitais de um mesmo subnível são degeneradas.',
          'Estabelecer a configuração eletrónica de átomos de elementos até Z = 23, utilizando a notação spd, atendendo ao Princípio da Construção, ao Princípio da Exclusão de Pauli e à maximização do número de eletrões desemparelhados em orbitais degeneradas.',
        ],
        minutos: 12,
        essencial: [
          {
            tipo: 'texto',
            texto: '**Modelo da nuvem eletrónica.** Não é possível saber a trajetória de um eletrão: só a **probabilidade** de o encontrar em cada região à volta do núcleo. A nuvem é mais densa onde essa probabilidade é maior. Os eletrões não andam em órbitas fixas.',
          },
          {
            tipo: 'definicao',
            texto: 'Uma **orbital** descreve a distribuição de probabilidade de encontrar um eletrão à volta do núcleo. Os desenhos das orbitais limitam a região onde é grande essa probabilidade. Cada orbital tem, no máximo, 2 eletrões.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Subnível', 'Número de orbitais', 'Forma', 'Máximo de eletrões'],
            linhas: [
              ['s', '1', 'esférica', '2'],
              ['p', '3 ($p_x$, $p_y$, $p_z$)', 'dois lóbulos, segundo cada eixo', '6'],
              ['d', '5', 'formas mais complexas', '10'],
            ],
          },
          {
            tipo: 'texto',
            texto: 'Os eletrões distribuem-se por **níveis** de energia ($n = 1, 2, 3, \\dots$) e, dentro de cada nível, por **subníveis** (s, p, d). O nível $n$ tem $n$ subníveis: o nível 1 só tem 1s; o 2 tem 2s e 2p; o 3 tem 3s, 3p e 3d.',
          },
          {
            tipo: 'definicao',
            texto: 'As orbitais de um mesmo subnível têm a mesma energia: dizem-se **degeneradas**. Por exemplo, as três orbitais 2p ($2p_x$, $2p_y$, $2p_z$) só diferem na orientação.',
          },
          {
            tipo: 'texto',
            texto: 'Nos átomos com vários eletrões (**polieletrónicos**) há a **atração** entre cada eletrão e o núcleo, que diminui a energia do eletrão, e a **repulsão** entre eletrões, que a aumenta. Por isso, a energia depende do nível e do subnível: 2s tem menos energia do que 2p.',
          },
          {
            tipo: 'texto',
            texto: '**Energias de remoção eletrónica.** Na espectroscopia fotoeletrónica mede-se a energia necessária para remover eletrões de cada subnível de átomos isolados. Há um valor por subnível ocupado: os eletrões do mesmo subnível têm a mesma energia de remoção.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Subnível do sódio', 'Eletrões', 'Energia de remoção ($\\mathrm{MJ\\,mol^{-1}}$)'],
            linhas: D.energiasRemocao.Na.map((x) => [x.subnivel, String(x.eletroes), MJ(x.energia)]),
          },
          {
            tipo: 'texto',
            texto: 'Quanto menor a energia do eletrão no átomo, maior a energia necessária para o remover. Os eletrões 1s, os mais perto do núcleo, são os mais atraídos: têm a maior energia de remoção. No nível 2, o 2s tem maior energia de remoção do que o 2p, porque tem menor energia. O eletrão 3s é o mais fácil de remover.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Observa a tabela das energias de remoção eletrónica do sódio. Quantos subníveis estão ocupados? Qual é o eletrão mais fácil de remover e porquê?',
            resolucao: [
              'Há ' + D.energiasRemocao.Na.length + ' valores diferentes, logo há ' + D.energiasRemocao.Na.length + ' subníveis ocupados (1s, 2s, 2p, 3s). Os números de eletrões, 2, 2, 6 e 1, dão a configuração $' + cfg(11) + '$.',
              'O mais fácil de remover é o eletrão 3s (' + MJ(D.energiasRemocao.Na[3].energia) + ' $\\mathrm{MJ\\,mol^{-1}}$, o menor valor): está no nível 3, o mais afastado do núcleo, e os 10 eletrões interiores repelem-no, o que diminui o efeito da atração do núcleo.',
              'Esse valor, ' + D.energiasRemocao.Na[3].energia + ' $\\mathrm{kJ\\,mol^{-1}}$, é a energia de ionização do sódio.',
            ],
            resultado: 4,
            verificar: () => new Set(D.energiasRemocao.Na.map((x) => x.energia)).size,
          },
          {
            tipo: 'quadro',
            cabecalho: ['Ordem de preenchimento (energia crescente)'],
            linhas: [['$1s \\to 2s \\to 2p \\to 3s \\to 3p \\to 4s \\to 3d$']],
          },
          {
            tipo: 'definicao',
            texto: 'A **configuração eletrónica** de um átomo no estado fundamental indica como os eletrões se distribuem pelos subníveis. Obtém-se com as três regras do quadro.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Regra', 'O que diz'],
            linhas: [
              ['**Princípio da Construção** (Aufbau)', 'Os eletrões ocupam os subníveis por ordem crescente de energia.'],
              ['**Princípio da Exclusão de Pauli**', 'Cada orbital tem, no máximo, 2 eletrões, de spins opostos.'],
              ['**Regra de Hund**', 'Em orbitais degeneradas, entra primeiro um eletrão em cada orbital: maximiza-se o número de eletrões desemparelhados.'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Escreve a configuração eletrónica do oxigénio ($Z = 8$), desenha o diagrama de caixas do subnível 2p e indica o número de eletrões desemparelhados.',
            resolucao: [
              '8 eletrões por ordem de energia: 2 no 1s, 2 no 2s e os 4 restantes no 2p: $' + cfg(8) + '$.',
              'Regra de Hund no 2p: os 3 primeiros eletrões ficam um em cada orbital e o 4.º emparelha com um deles: $2p$: $[\\uparrow\\downarrow]\\,[\\uparrow]\\,[\\uparrow]$.',
              'Eletrões desemparelhados: ' + Q.configuracao(8).desemparelhados + '. Orbitais ocupadas: ' + Q.configuracao(8).orbitaisOcupadas + ' (1s, 2s e as três 2p).',
            ],
            resultado: 2,
            verificar: () => Q.configuracao(8).desemparelhados,
          },
          {
            tipo: 'esquema',
            id: 'fqa-configuracao',
            opcoes: { z: 8 },
            legenda: 'Escolhe o elemento e acompanha o preenchimento, eletrão a eletrão: no 2p e no 3d os eletrões espalham-se pelas orbitais antes de emparelhar.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Escreve a configuração eletrónica do vanádio ($Z = 23$) e indica o número de eletrões desemparelhados.',
            resolucao: [
              'Até ao 3p entram 18 eletrões: $1s^2\\,2s^2\\,2p^6\\,3s^2\\,3p^6$ (a configuração do árgon).',
              'Segue-se o 4s, de menor energia que o 3d: $4s^2$ (20 eletrões). Os 3 restantes vão para o 3d.',
              'Configuração: $' + cfg(23) + '$, ou, com o cerne do gás nobre, $' + cfgCerne(23) + '$.',
              'Os 3 eletrões 3d ficam em 3 orbitais diferentes (regra de Hund): ' + Q.configuracao(23).desemparelhados + ' eletrões desemparelhados.',
            ],
            resultado: 3,
            verificar: () => Q.configuracao(23).desemparelhados,
          },
          {
            tipo: 'erro-frequente',
            texto: 'O 4s preenche-se **antes** do 3d: o potássio ($Z = 19$) é $' + cfgCerne(19) + '$, não $[\\mathrm{Ar}]\\,3d^1$. Mas, ao formar catiões, os eletrões 4s saem **primeiro**: $\\mathrm{Ti^{2+}}$ é $' + cfgCerne(22, 2) + '$, não $[\\mathrm{Ar}]\\,4s^2$.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não emparelhes eletrões cedo demais: no nitrogénio (ou azoto), $' + cfg(7) + '$, o 2p é $[\\uparrow]\\,[\\uparrow]\\,[\\uparrow]$, com ' + Q.configuracao(7).desemparelhados + ' eletrões desemparelhados, e não $[\\uparrow\\downarrow]\\,[\\uparrow]\\,[\\ \\ ]$.',
          },
          {
            tipo: 'texto',
            texto: '**Iões.** Num anião, os eletrões a mais continuam o preenchimento; num catião, saem primeiro os eletrões do nível mais exterior (maior $n$). $\\mathrm{O^{2-}}$, $\\mathrm{F^{-}}$, $\\mathrm{Ne}$, $\\mathrm{Na^{+}}$ e $\\mathrm{Mg^{2+}}$ têm todos 10 eletrões e a mesma configuração, $' + cfg(10) + '$: são espécies **isoeletrónicas**.',
          },
          {
            tipo: 'texto',
            texto: 'Nos elementos representativos, os **eletrões de valência** são os do último nível: são eles que participam nas ligações químicas. O oxigénio tem ' + Q.configuracao(8).valencia + ' eletrões de valência ($2s^2\\,2p^4$).',
          },
        ],
        resumo: [
          'Nuvem eletrónica: só se conhece a probabilidade de encontrar o eletrão; orbital = distribuição dessa probabilidade.',
          'Subníveis s (1 orbital), p (3), d (5); cada orbital tem no máximo 2 eletrões. Orbitais do mesmo subnível são degeneradas.',
          'Polieletrónicos: atração núcleo-eletrão baixa a energia, repulsão entre eletrões aumenta-a; a energia depende do nível e do subnível.',
          'Energias de remoção: um valor por subnível ocupado; a maior é a do 1s e a menor a do eletrão de valência (no sódio, 3s).',
          'Ordem: $1s\\,2s\\,2p\\,3s\\,3p\\,4s\\,3d$. Construção, Pauli e Hund (máximo de eletrões desemparelhados).',
          'Catiões do bloco d perdem primeiro os eletrões 4s. Espécies isoeletrónicas têm a mesma configuração.',
        ],
        quiz: [
          {
            id: 'configuracao-q01',
            tipo: 'escolha',
            enunciado: 'Qual é a configuração eletrónica do potássio ($Z = 19$) no estado fundamental?',
            opcoes: [
              '$' + cfg(19) + '$',
              '$1s^2\\,2s^2\\,2p^6\\,3s^2\\,3p^6\\,3d^1$',
              '$1s^2\\,2s^2\\,2p^6\\,3s^2\\,3p^7$',
              '$1s^2\\,2s^2\\,2p^6\\,3s^2\\,3p^5\\,4s^2$',
            ],
            correta: 0,
            explicacao: 'Depois do 3p (18 eletrões), o subnível de menor energia é o 4s: o 19.º eletrão vai para o 4s.',
            errosTipicos: [
              { codigo: 'preencheu_3d_antes_de_4s', opcao: 1, explicacao: 'O 4s tem menor energia que o 3d e preenche-se primeiro: o 19.º eletrão vai para o 4s.' },
              { codigo: 'p_com_mais_de_seis_eletroes', opcao: 2, explicacao: 'Um subnível p tem 3 orbitais e, pelo Princípio da Exclusão de Pauli, no máximo 6 eletrões; $3p^7$ é impossível.' },
              { codigo: 'passou_ao_subnivel_seguinte_sem_completar', opcao: 3, explicacao: 'Pelo Princípio da Construção, o 3p (de menor energia) completa-se antes de se ocupar o 4s: $3p^6\\,4s^1$.' },
            ],
          },
          {
            id: 'configuracao-q02',
            tipo: 'escolha',
            enunciado: 'Qual é o diagrama de caixas correto para o subnível 2p do nitrogénio ($Z = 7$, $' + cfg(7) + '$)?',
            opcoes: [
              '$[\\uparrow]\\,[\\uparrow]\\,[\\uparrow]$',
              '$[\\uparrow\\downarrow]\\,[\\uparrow]\\,[\\ \\ ]$',
              '$[\\uparrow\\downarrow\\uparrow]\\,[\\ \\ ]\\,[\\ \\ ]$',
            ],
            correta: 0,
            explicacao: 'As três orbitais 2p são degeneradas: os 3 eletrões ficam um em cada orbital, com o máximo de eletrões desemparelhados (regra de Hund).',
            errosTipicos: [
              { codigo: 'nao_maximizou_os_desemparelhados', opcao: 1, explicacao: 'Em orbitais degeneradas, primeiro entra um eletrão em cada uma; só depois emparelham. O nitrogénio tem 3 eletrões desemparelhados.' },
              { codigo: 'violou_o_principio_de_pauli', opcao: 2, explicacao: 'Uma orbital tem no máximo 2 eletrões, de spins opostos (Princípio da Exclusão de Pauli).' },
            ],
          },
          {
            id: 'configuracao-q03',
            tipo: 'numerica',
            enunciado: 'Quantos eletrões desemparelhados tem o átomo de titânio ($Z = 22$) no estado fundamental?',
            resposta: 2,
            tolerancia: 0,
            resolucao: [
              'Configuração: $' + cfgCerne(22) + '$.',
              'O $4s^2$ está emparelhado; os 2 eletrões 3d ocupam duas das cinco orbitais 3d, um em cada (regra de Hund).',
              'Eletrões desemparelhados: 2.',
            ],
            verificar: () => Q.configuracao(22).desemparelhados,
            errosTipicos: [
              { codigo: 'emparelhou_os_eletroes_3d', valor: 0, explicacao: 'Os 2 eletrões 3d não emparelham: há 5 orbitais 3d degeneradas e cada eletrão ocupa uma (regra de Hund), por isso há 2 desemparelhados.' },
              { codigo: 'contou_os_eletroes_4s', valor: 4, explicacao: 'Os 2 eletrões 4s estão emparelhados na mesma orbital; só os 2 eletrões 3d estão desemparelhados.' },
            ],
          },
          {
            id: 'configuracao-q04',
            tipo: 'escolha',
            enunciado: 'As energias de remoção eletrónica do sódio são ' + D.energiasRemocao.Na.map((x) => MJ(x.energia)).join('; ') + ' $\\mathrm{MJ\\,mol^{-1}}$. A que subnível corresponde o valor de ' + MJ(D.energiasRemocao.Na[2].energia) + ' $\\mathrm{MJ\\,mol^{-1}}$?',
            opcoes: ['2p', '2s', '3s', '1s'],
            correta: 0,
            explicacao: 'Por ordem decrescente de energia de remoção: 1s (' + MJ(D.energiasRemocao.Na[0].energia) + '), 2s (' + MJ(D.energiasRemocao.Na[1].energia) + '), 2p (' + MJ(D.energiasRemocao.Na[2].energia) + ') e 3s (' + MJ(D.energiasRemocao.Na[3].energia) + '). O 2p tem mais energia do que o 2s, por isso é mais fácil remover os seus eletrões.',
            errosTipicos: [
              { codigo: 'trocou_a_ordem_de_2s_e_2p', opcao: 1, explicacao: 'No nível 2, o 2s tem menor energia do que o 2p, logo maior energia de remoção: o 2s é ' + MJ(D.energiasRemocao.Na[1].energia) + ' $\\mathrm{MJ\\,mol^{-1}}$ e o 2p é ' + MJ(D.energiasRemocao.Na[2].energia) + ' $\\mathrm{MJ\\,mol^{-1}}$.' },
              { codigo: 'maior_energia_de_remocao_mais_longe_do_nucleo', opcao: 2, explicacao: 'O eletrão 3s, o mais afastado do núcleo, é o mais fácil de remover: corresponde ao menor valor, ' + MJ(D.energiasRemocao.Na[3].energia) + ' $\\mathrm{MJ\\,mol^{-1}}$.' },
            ],
          },
          {
            id: 'configuracao-q05',
            tipo: 'escolha',
            enunciado: 'Qual destas espécies **não** tem a configuração eletrónica $' + cfg(10) + '$?',
            opcoes: ['$\\mathrm{Mg}$', '$\\mathrm{Na^{+}}$', '$\\mathrm{O^{2-}}$', '$\\mathrm{Ne}$'],
            correta: 0,
            explicacao: 'O átomo de magnésio tem 12 eletrões: $' + cfg(12) + '$. $\\mathrm{Na^{+}}$ (11 − 1), $\\mathrm{O^{2-}}$ (8 + 2) e $\\mathrm{Ne}$ têm 10 eletrões.',
            errosTipicos: [
              { codigo: 'nao_tirou_o_eletrao_do_catiao', opcao: 1, explicacao: '$\\mathrm{Na^{+}}$ perdeu um eletrão: tem $11 - 1 = 10$ eletrões, a configuração do néon. Quem tem 12 eletrões é o átomo de Mg.' },
              { codigo: 'nao_somou_os_eletroes_do_aniao', opcao: 2, explicacao: '$\\mathrm{O^{2-}}$ ganhou dois eletrões: tem $8 + 2 = 10$ eletrões, a configuração do néon. Quem tem 12 eletrões é o átomo de Mg.' },
            ],
          },
          {
            id: 'configuracao-q06',
            tipo: 'vf',
            enunciado: 'Quando o titânio forma o ião $\\mathrm{Ti^{2+}}$, perde os dois eletrões 3d e fica com a configuração $[\\mathrm{Ar}]\\,4s^2$.',
            correta: false,
            explicacao: 'Nos catiões dos elementos do bloco d saem primeiro os eletrões 4s: $\\mathrm{Ti^{2+}}$ é $' + cfgCerne(22, 2) + '$.',
            errosTipicos: [
              { codigo: 'tirou_3d_antes_de_4s', explicacao: 'O 4s enche-se antes do 3d, mas nos catiões é o primeiro a perder eletrões: $\\mathrm{Ti^{2+}}$ é $' + cfgCerne(22, 2) + '$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'tabela-periodica',
        titulo: 'Tabela Periódica',
        ae: [
          'Pesquisar o contributo dos vários cientistas para a construção da TP atual, comunicando as conclusões.',
          'Interpretar a organização da TP com base nas configurações eletrónicas dos elementos.',
          'Interpretar a energia de ionização e o raio atómico dos elementos representativos como propriedades periódicas, relacionando-as com as respetivas configurações eletrónicas.',
          'Interpretar a periodicidade das propriedades dos elementos químicos na TP e explicar a tendência de formação de iões.',
          'Determinar, experimentalmente, a densidade relativa de metais por picnometria, avaliando os procedimentos, interpretando e comunicando os resultados.',
          'Interpretar a baixa reatividade dos gases nobres, relacionando-a com a estrutura eletrónica destes elementos.',
        ],
        minutos: 14,
        essencial: [
          {
            tipo: 'texto',
            texto: '**Um pouco de história.** Döbereiner agrupou elementos semelhantes em tríades (1829) e Newlands reparou que as propriedades se repetiam de oito em oito elementos (1865). Em 1869, Mendeleiev ordenou os elementos pela massa atómica, deixou lugares vazios e previu elementos ainda por descobrir, como o germânio.',
          },
          {
            tipo: 'texto',
            texto: 'Em 1913, Moseley mostrou que a ordem certa é a do **número atómico**. A Tabela Periódica atual tem 118 elementos, ordenados por $Z$ crescente, em 7 **períodos** (linhas) e 18 **grupos** (colunas).',
          },
          {
            tipo: 'definicao',
            texto: 'A posição de um elemento lê-se na configuração eletrónica. **Período** = número do último nível ocupado. **Bloco** (s, p ou d) = subnível onde entrou o último eletrão. **Grupo**: nos blocos s e p, os grupos 1 e 2 têm 1 e 2 eletrões de valência e os grupos 13 a 18 têm 3 a 8 (grupo = 10 + eletrões de valência); o hélio, com 2, fica no grupo 18. No bloco d (até $Z = 23$), grupo = número de eletrões 4s + 3d.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'O cloro tem $Z = 17$. Indica o período, o bloco e o grupo da Tabela Periódica a que pertence.',
            resolucao: [
              'Configuração: $' + cfg(17) + '$, ou $' + cfgCerne(17) + '$.',
              'Último nível ocupado: $n = 3$, logo período ' + Q.posicaoTP(17).periodo + '. O último eletrão entrou num subnível p: bloco ' + Q.posicaoTP(17).bloco + '.',
              'Eletrões de valência: $3s^2\\,3p^5$, isto é, 7. Grupo $10 + 7 = 17$.',
            ],
            resultado: 17,
            verificar: () => Q.posicaoTP(17).grupo,
          },
          {
            tipo: 'quadro',
            cabecalho: ['Elemento', 'Configuração', 'Período', 'Bloco', 'Grupo'],
            linhas: [['Li', 3], ['Na', 11], ['Ca', 20], ['P', 15], ['V', 23]].map(([s, z]) => {
              const p = Q.posicaoTP(z);
              return [el(s).nome + ' ($Z = ' + z + '$)', '$' + cfgCerne(z) + '$', String(p.periodo), p.bloco, String(p.grupo)];
            }),
          },
          {
            tipo: 'texto',
            texto: 'Os elementos dos blocos s e p são os **elementos representativos**; os do bloco d são os metais de transição. Os metais ficam à esquerda e ao centro; os não metais, à direita. Elementos do mesmo grupo têm o mesmo número de eletrões de valência e, por isso, propriedades químicas semelhantes.',
          },
          {
            tipo: 'esquema',
            id: 'fqa-tabela',
            opcoes: { modo: 'blocos' },
            legenda: 'Toca num elemento para ver o grupo, o período, o bloco e a configuração. Muda o mapa de cor para energia de ionização ou raio atómico e procura as tendências.',
          },
          {
            tipo: 'definicao',
            texto: 'A **energia de ionização** (primeira) é a energia mínima necessária para remover um eletrão de um átomo isolado, no estado fundamental e em fase gasosa. Exprime-se em J por átomo ou, mais vezes, em $\\mathrm{kJ\\,mol^{-1}}$ (por mole de átomos). O **raio atómico** mede o tamanho do átomo.',
          },
          {
            tipo: 'texto',
            texto: '**Ao longo de um período** (para a direita), os eletrões de valência estão no mesmo nível, mas a carga do núcleo aumenta: são mais atraídos. O raio atómico **diminui** e a energia de ionização **aumenta**. Do sódio ao cloro, o raio passa de ' + raio('Na') + ' pm a ' + raio('Cl') + ' pm e a energia de ionização de ' + EI('Na') + ' a ' + EI('Cl') + ' $\\mathrm{kJ\\,mol^{-1}}$.',
          },
          {
            tipo: 'texto',
            texto: '**Ao longo de um grupo** (para baixo), há mais um nível ocupado em cada período: os eletrões de valência estão mais longe do núcleo e mais blindados pelos eletrões interiores. O raio **aumenta** e a energia de ionização **diminui**. No grupo 1: Li ' + raio('Li') + ' pm e ' + EI('Li') + ' $\\mathrm{kJ\\,mol^{-1}}$; Na ' + raio('Na') + ' pm e ' + EI('Na') + '; K ' + raio('K') + ' pm e ' + EI('K') + '.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Período 2', 'Raio atómico (pm)', 'Energia de ionização ($\\mathrm{kJ\\,mol^{-1}}$)'],
            linhas: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'].map((s) => [el(s).nome + ' (' + s + ')', raio(s), EI(s)]),
          },
          {
            tipo: 'texto',
            texto: 'Há duas **exceções** no período 2. Do berílio (' + EI('Be') + ') para o boro (' + EI('B') + '), a energia de ionização desce: no boro sai um eletrão 2p, de maior energia do que os 2s. Do nitrogénio (' + EI('N') + ') para o oxigénio (' + EI('O') + ') também desce: no oxigénio sai um eletrão de uma orbital 2p com dois eletrões, que se repelem. Há outras exceções do mesmo tipo (Mg > Al e P > S no período 3; Zn > Ga e As > Se no período 4), que o esquema abaixo também assinala.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não penses que um átomo maior tem maior energia de ionização: é ao contrário. Quanto **maior** o raio, mais longe do núcleo está o eletrão de valência e **menor** é a energia para o remover. O potássio (' + raio('K') + ' pm) tem menor energia de ionização (' + EI('K') + ' $\\mathrm{kJ\\,mol^{-1}}$) do que o lítio (' + raio('Li') + ' pm, ' + EI('Li') + ' $\\mathrm{kJ\\,mol^{-1}}$).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Compara a energia de ionização e o raio atómico do magnésio com os do sódio e com os do berílio, justificando a partir das configurações eletrónicas. Dados: raio atómico Be ' + raio('Be') + ' pm, Na ' + raio('Na') + ' pm, Mg ' + raio('Mg') + ' pm; energia de ionização Be ' + EI('Be') + ', Na ' + EI('Na') + ', Mg ' + EI('Mg') + ' $\\mathrm{kJ\\,mol^{-1}}$.',
            resolucao: [
              'Configurações: $\\mathrm{Be}$: $' + cfgCerne(4) + '$; $\\mathrm{Na}$: $' + cfgCerne(11) + '$; $\\mathrm{Mg}$: $' + cfgCerne(12) + '$.',
              'Mg e Na (mesmo período): os eletrões de valência estão ambos no nível 3, mas o Mg tem mais um protão no núcleo, por isso são mais atraídos. O Mg tem menor raio (' + raio('Mg') + ' < ' + raio('Na') + ' pm) e maior energia de ionização (' + EI('Mg') + ' > ' + EI('Na') + ' $\\mathrm{kJ\\,mol^{-1}}$).',
              'Mg e Be (mesmo grupo): o Mg tem os eletrões de valência no nível 3, mais um nível do que o Be (nível 2). Estão mais longe do núcleo e mais blindados pelos eletrões interiores. O Mg tem maior raio (' + raio('Mg') + ' > ' + raio('Be') + ' pm) e menor energia de ionização (' + EI('Mg') + ' < ' + EI('Be') + ' $\\mathrm{kJ\\,mol^{-1}}$).',
            ],
            resultado: 1,
            verificar: () => Q.posicaoTP(el('Mg').z).periodo - Q.posicaoTP(el('Be').z).periodo,
          },
          {
            tipo: 'esquema',
            id: 'fqa-tabela',
            opcoes: { modo: 'ei', simbolo: 'Na' },
            legenda: 'Mapa da energia de ionização: compara elementos do mesmo período e do mesmo grupo. O esquema assinala as exceções.',
          },
          {
            tipo: 'texto',
            texto: '**Tendência para formar iões.** Os metais dos grupos 1 e 2 têm energia de ionização baixa e perdem facilmente 1 ou 2 eletrões: formam catiões ($\\mathrm{Na^{+}}$, $\\mathrm{Mg^{2+}}$). Os não metais dos grupos 16 e 17 ganham 2 ou 1 eletrões: formam aniões ($\\mathrm{O^{2-}}$, $\\mathrm{Cl^{-}}$). Em ambos os casos ficam com a configuração do gás nobre mais próximo.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Que ião tende a formar o cloro ($Z = 17$)? Escreve a configuração eletrónica desse ião.',
            resolucao: [
              'O cloro, $' + cfgCerne(17) + '$, tem 7 eletrões de valência: falta 1 para completar o último nível.',
              'Ganha 1 eletrão e forma o anião $\\mathrm{Cl^{-}}$, com 18 eletrões.',
              'Configuração: $' + cfg(17, -1) + '$, a mesma do árgon.',
            ],
            resultado: 18,
            verificar: () => Q.configuracao(17, -1).subniveis.reduce((t, s) => t + s.eletroes, 0),
          },
          {
            tipo: 'texto',
            texto: 'A reatividade também é periódica: nos metais alcalinos (grupo 1) aumenta ao descer no grupo, porque a energia de ionização diminui (o potássio reage com a água mais violentamente do que o sódio). Nos halogéneos (grupo 17) diminui ao descer no grupo.',
          },
          {
            tipo: 'texto',
            texto: '**Gases nobres.** Têm os subníveis de valência ns e np completos ($ns^2\\,np^6$; o hélio, $1s^2$) e a maior energia de ionização do seu período (o néon, ' + EI('Ne') + ' $\\mathrm{kJ\\,mol^{-1}}$, no período 2). Não tendem a perder nem a ganhar eletrões: por isso são muito pouco reativos.',
          },
          {
            tipo: 'definicao',
            texto: '**Densidade relativa por picnometria (AL).** A densidade relativa de um metal é $d = \\dfrac{\\rho_{\\text{metal}}}{\\rho_{\\text{água}}}$, igual à razão entre a massa do metal e a massa de igual volume de água. Não tem unidades. O picnómetro é um frasco de volume rigoroso, fixado pela tampa com capilar.',
          },
          {
            tipo: 'esquema',
            id: 'fig-picnometro',
            legenda: 'Toca na figura para separar o corpo, a tampa com capilar e a marca. O volume fica definido quando o líquido enche o capilar até ao cimo.',
          },
          {
            tipo: 'texto',
            texto: 'Pesa-se o picnómetro vazio; depois cheio de água; depois vazio com o metal; por fim, com o metal e completado com água. A massa de água que o metal deslocou é a que "falta" no último caso. Como $\\rho_{\\text{água}}$ é próxima de $1\\,\\mathrm{g\\,cm^{-3}}$, $d$ é quase igual à massa volúmica do metal em $\\mathrm{g\\,cm^{-3}}$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Num ensaio obteve-se: picnómetro vazio, $25{,}32\\,\\mathrm{g}$; cheio de água, $75{,}48\\,\\mathrm{g}$; vazio com amostras de um metal, $36{,}04\\,\\mathrm{g}$; com o metal e completado com água, $85{,}00\\,\\mathrm{g}$. Calcula a densidade relativa do metal.',
            resolucao: [
              'Massa do metal: $m_{\\text{metal}} = 36{,}04 - 25{,}32 = 10{,}72\\,\\mathrm{g}$.',
              'Massa de água deslocada (com o mesmo volume do metal): $m_{\\text{água}} = 75{,}48 + 10{,}72 - 85{,}00 = 1{,}20\\,\\mathrm{g}$.',
              '$d = \\dfrac{m_{\\text{metal}}}{m_{\\text{água}}} = \\dfrac{10{,}72}{1{,}20} = 8{,}933\\ldots \\approx 8{,}93$ (3 algarismos significativos, como $1{,}20$).',
            ],
            resultado: 8.93,
            verificar: () => Number(Q.densidadeRelativa({ mPicnometroVazio: 25.32, mComAgua: 75.48, mComMetal: 36.04, mComMetalEAgua: 85.00 }).toFixed(2)),
          },
          {
            tipo: 'erro-frequente',
            texto: 'A massa de água deslocada **não** é a diferença entre "com metal e água" e "cheio de água" ($85{,}00 - 75{,}48$): essa diferença inclui a massa do metal. Avalia também o procedimento: bolhas de ar presas, metal ou picnómetro molhados por fora e mudanças de temperatura falseiam as pesagens.',
          },
        ],
        resumo: [
          'Mendeleiev (1869) ordenou pela massa atómica e previu elementos; Moseley (1913) mostrou que a ordem é a do número atómico.',
          'Período = último nível ocupado; bloco = subnível do último eletrão; grupo 1–2 ou 10 + eletrões de valência (13–18).',
          'Elementos representativos (blocos s e p): ao longo do período, o raio diminui e a energia de ionização aumenta; no grupo, ao contrário.',
          'Exceções no período 2: Be > B e N > O na energia de ionização.',
          'Metais dos grupos 1 e 2 formam catiões; não metais dos grupos 16 e 17 formam aniões, com a configuração de um gás nobre.',
          'Gases nobres: subníveis de valência ns e np completos, energia de ionização máxima no período, muito pouco reativos.',
          'Picnometria: $d = \\dfrac{m_{\\text{metal}}}{m_{\\text{água deslocada}}}$.',
        ],
        quiz: [
          {
            id: 'tabela-periodica-q01',
            tipo: 'escolha',
            enunciado: 'Um elemento tem a configuração eletrónica $' + cfgCerne(15) + '$. Onde fica na Tabela Periódica?',
            opcoes: ['Período 3, grupo 15', 'Período 3, grupo 3', 'Período 3, grupo 5', 'Período 2, grupo 15'],
            correta: 0,
            explicacao: 'Último nível ocupado $n = 3$: período 3. Bloco p com 5 eletrões de valência ($3s^2\\,3p^3$): grupo $10 + 5 = 15$. É o fósforo.',
            errosTipicos: [
              { codigo: 'grupo_pelos_eletroes_p', opcao: 1, explicacao: 'Contaste só os 3 eletrões 3p. Os eletrões de valência são os do último nível, $3s^2\\,3p^3$ (5), e no bloco p o grupo é $10 + 5 = 15$.' },
              { codigo: 'grupo_sem_somar_10', opcao: 2, explicacao: 'Tem 5 eletrões de valência, mas nos grupos do bloco p o número do grupo é $10 + 5 = 15$.' },
              { codigo: 'periodo_pelo_cerne', opcao: 3, explicacao: 'O cerne $[\\mathrm{Ne}]$ é do período 2, mas o período é o do último nível ocupado, $n = 3$.' },
            ],
          },
          {
            id: 'tabela-periodica-q02',
            tipo: 'escolha',
            enunciado: 'Qual destes elementos do 3.º período tem **maior** raio atómico?',
            opcoes: ['Sódio', 'Magnésio', 'Alumínio', 'Silício'],
            correta: 0,
            explicacao: 'Ao longo do período, a carga nuclear aumenta e os eletrões de valência (no nível 3) são mais atraídos: o raio diminui de Na para Si (' + ['Na', 'Mg', 'Al', 'Si'].map((s) => raio(s) + ' pm').join(', ') + ').',
            errosTipicos: [
              { codigo: 'raio_aumenta_ao_longo_do_periodo', opcao: 3, explicacao: 'O silício tem mais protões, mas os eletrões de valência estão no mesmo nível: são mais atraídos e o raio é menor. Ao longo do período o raio diminui.' },
            ],
          },
          {
            id: 'tabela-periodica-q03',
            tipo: 'escolha',
            enunciado: 'Qual é a ordem **crescente** da energia de ionização dos metais alcalinos lítio, sódio e potássio?',
            opcoes: ['K < Na < Li', 'Li < Na < K', 'Na < K < Li', 'Li < K < Na'],
            correta: 0,
            explicacao: 'Descendo no grupo, o eletrão de valência fica mais longe do núcleo e é removido mais facilmente: ' + ['K', 'Na', 'Li'].map((s) => s + ' ' + EI(s)).join(' < ') + ' $\\mathrm{kJ\\,mol^{-1}}$.',
            errosTipicos: [
              { codigo: 'maior_raio_maior_energia_de_ionizacao', opcao: 1, explicacao: 'O potássio é o maior, mas por isso o eletrão de valência está mais longe e é mais fácil de remover: a energia de ionização diminui ao descer no grupo.' },
            ],
          },
          {
            id: 'tabela-periodica-q04',
            tipo: 'escolha',
            enunciado: 'O oxigénio ($' + cfgCerne(8) + '$) e o enxofre ($' + cfgCerne(16) + '$) são do grupo 16. Qual das afirmações compara corretamente as suas energias de ionização?',
            opcoes: [
              'A do oxigénio é maior: os seus eletrões de valência estão no nível 2, mais perto do núcleo, e o átomo é menor.',
              'A do enxofre é maior, porque o átomo de enxofre tem maior raio.',
              'A do enxofre é maior, porque o seu núcleo tem mais protões.',
              'A do oxigénio é maior, porque tem mais eletrões de valência.',
            ],
            correta: 0,
            explicacao: 'Descendo no grupo há mais um nível ocupado: os eletrões de valência do enxofre (nível 3) estão mais longe do núcleo e mais blindados. O enxofre tem maior raio (' + raio('S') + ' contra ' + raio('O') + ' pm) e menor energia de ionização (' + EI('S') + ' contra ' + EI('O') + ' $\\mathrm{kJ\\,mol^{-1}}$).',
            errosTipicos: [
              { codigo: 'maior_raio_maior_energia_de_ionizacao', opcao: 1, explicacao: 'Um raio maior dá **menor** energia de ionização: o eletrão de valência está mais longe do núcleo e é mais fácil de remover. Por isso a do enxofre é menor.' },
              { codigo: 'so_contou_a_carga_nuclear', opcao: 2, explicacao: 'O enxofre tem mais protões, mas também mais um nível de eletrões: os de valência estão mais longe e mais blindados, por isso a energia de ionização é menor.' },
              { codigo: 'justificou_pelo_numero_de_eletroes_de_valencia', opcao: 3, explicacao: 'Os dois têm 6 eletrões de valência (mesmo grupo). A diferença vem do nível: no oxigénio é o 2, mais perto do núcleo.' },
            ],
          },
          {
            id: 'tabela-periodica-q05',
            tipo: 'escolha',
            enunciado: 'Que ião tende a formar o magnésio ($Z = 12$, $' + cfgCerne(12) + '$)?',
            opcoes: ['$\\mathrm{Mg^{2+}}$', '$\\mathrm{Mg^{2-}}$', '$\\mathrm{Mg^{6-}}$', '$\\mathrm{Mg^{+}}$'],
            correta: 0,
            explicacao: 'Perde os 2 eletrões de valência (3s) e fica com a configuração do néon, $' + cfg(12, 2) + '$.',
            errosTipicos: [
              { codigo: 'ganhou_em_vez_de_perder', opcao: 1, explicacao: 'Perder eletrões dá carga positiva. O magnésio perde 2 eletrões: $\\mathrm{Mg^{2+}}$.' },
              { codigo: 'completou_o_nivel_ganhando_eletroes', opcao: 2, explicacao: 'Ganhar 6 eletrões custaria muita energia; com só 2 eletrões de valência, é muito mais fácil perdê-los: $\\mathrm{Mg^{2+}}$.' },
              { codigo: 'perdeu_so_um_eletrao', opcao: 3, explicacao: 'Com um só eletrão perdido ficaria $3s^1$, sem a configuração de gás nobre; perde os 2 eletrões 3s: $\\mathrm{Mg^{2+}}$.' },
            ],
          },
          {
            id: 'tabela-periodica-q06',
            tipo: 'numerica',
            enunciado: 'Para determinar a densidade relativa de um metal, pesou-se: picnómetro vazio, $24{,}85\\,\\mathrm{g}$; cheio de água, $74{,}12\\,\\mathrm{g}$; vazio com o metal, $32{,}75\\,\\mathrm{g}$; com o metal e completado com água, $81{,}02\\,\\mathrm{g}$. Calcula a densidade relativa do metal, com três algarismos significativos.',
            resposta: 7.9,
            algarismos: 3,
            tolerancia: 0.01,
            resolucao: [
              '$m_{\\text{metal}} = 32{,}75 - 24{,}85 = 7{,}90\\,\\mathrm{g}$',
              '$m_{\\text{água deslocada}} = 74{,}12 + 7{,}90 - 81{,}02 = 1{,}00\\,\\mathrm{g}$',
              '$d = \\dfrac{7{,}90}{1{,}00} = 7{,}90$',
            ],
            verificar: () => Number(Q.densidadeRelativa({ mPicnometroVazio: 24.85, mComAgua: 74.12, mComMetal: 32.75, mComMetalEAgua: 81.02 }).toFixed(2)),
            errosTipicos: [
              { codigo: 'agua_deslocada_sem_somar_o_metal', valor: 1.14, explicacao: 'Usaste $81{,}02 - 74{,}12 = 6{,}90\\,\\mathrm{g}$ como água deslocada e obtiveste 1,14; essa diferença inclui a massa do metal. A água deslocada é $74{,}12 + 7{,}90 - 81{,}02 = 1{,}00\\,\\mathrm{g}$.' },
            ],
          },
        ],
      },
    ],
  });
})();
