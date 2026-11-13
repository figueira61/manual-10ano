globalThis.Manual = globalThis.Manual || {};

Manual.registarTema('mat-a', {
  id: 'estatistica',
  titulo: 'Estatística',
  subtemas: [
    // ------------------------------------------------------------------
    {
      id: 'conceitos',
      titulo: 'Problema estatístico, população e amostra',
      ae: [
        'Reconhecer o papel relevante desempenhado pela Estatística em todos os campos do conhecimento.',
        'Reconhecer a variabilidade como um conceito chave de um problema estatístico.',
        'Conhecer e interpretar situações do mundo que nos rodeia em que a variabilidade está presente.',
        'Identificar num estudo estatístico, população, amostra e a(s) caraterística(s) a estudar, que se designa(m) por variável (variáveis).',
        'Reconhecer as fases de um procedimento estatístico: - Produção ou aquisição de dados; - Organização e representação de dados; - Interpretação tendo por base as representações obtidas.',
        'Reconhecer os métodos existentes para a seleção de amostras, no sentido de que estas sejam representativas das populações subjacentes, e de modo a evitar amostras enviesadas cujo estudo levaria a inferir conclusões erradas para as populações.',
        'Intuir que os problemas estatísticos em que se recorre a amostras para inferir para a população subjacente, não têm uma solução matemática única que se possa exprimir como verdadeiro ou falso.',
        'Identificar dados quantitativos discretos ou contínuos.',
      ],
      minutos: 5,
      essencial: [
        {
          tipo: 'texto',
          texto: 'A Estatística está em todas as áreas: medicina, economia, desporto, clima, política. Um **problema estatístico** é uma pergunta cuja resposta depende da recolha de dados que **variam** — por exemplo, «quantos pães deve o padeiro fazer por dia?».',
        },
        {
          tipo: 'definicao',
          texto: '**Variabilidade:** os dados não são todos iguais (as pessoas não têm todas a mesma altura, os dias não têm todos a mesma venda). Sem variabilidade não haveria problema estatístico: bastava observar um caso.',
        },
        {
          tipo: 'definicao',
          texto: '**População:** o conjunto de todas as unidades estatísticas (pessoas, objetos, dias…) sobre as quais se quer tirar conclusões. **Amostra:** a parte da população que é efetivamente observada. **Variável:** a caraterística que se estuda em cada unidade.',
        },
        {
          tipo: 'texto',
          texto: 'Observar toda a população é um **recenseamento** (como os Censos); observar só uma amostra é uma **sondagem**. Os termos população e amostra também se usam para os conjuntos de valores da variável.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'O diretor de um agrupamento com 1200 alunos quer saber a percentagem de alunos que almoçam diariamente na escola. Inquire 150 alunos escolhidos ao acaso. Identifica a população, a amostra e a variável.',
          resolucao: [
            'População: os 1200 alunos do agrupamento.',
            'Amostra: os 150 alunos inquiridos.',
            'Variável: «almoça diariamente na escola?» (sim/não), observada em cada aluno.',
            'A percentagem obtida na amostra serve para **estimar** a da população; não é garantido que seja igual.',
          ],
        },
        {
          tipo: 'quadro',
          cabecalho: ['Fase do procedimento estatístico', 'O que se faz'],
          linhas: [
            ['1. Produção ou aquisição de dados', 'Definir a população e a variável, escolher a amostra, recolher os dados.'],
            ['2. Organização e representação', 'Tabelas de frequências, gráficos, medidas.'],
            ['3. Interpretação', 'Tirar conclusões a partir das representações obtidas, no contexto do problema.'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Uma amostra deve ser **representativa** da população. A forma mais segura é escolhê-la **ao acaso** (amostra aleatória), com dimensão suficiente — tanto maior quanto maior for a variabilidade na população.',
        },
        {
          tipo: 'erro-frequente',
          texto: '**Amostras enviesadas** levam a conclusões erradas. Exemplos: **por conveniência** (inquirir só os alunos da tua turma sobre a cantina) e **por resposta voluntária** (um inquérito online a que só responde quem quer — normalmente quem tem opinião forte).',
        },
        {
          tipo: 'texto',
          texto: 'Quando se tira uma conclusão para a população a partir de uma amostra, a resposta **não é «verdadeiro ou falso»**: outra amostra daria um valor um pouco diferente. A probabilidade permite quantificar esse erro — é por isso que as sondagens indicam uma margem de erro.',
        },
        {
          tipo: 'definicao',
          texto: '**Dados quantitativos discretos:** a variável toma valores isolados e a observação é uma **contagem** (n.º de irmãos, golos num jogo). **Contínuos:** a variável pode tomar qualquer valor de um intervalo e a observação é uma **medição** (altura, tempo, massa).',
        },
        {
          tipo: 'texto',
          texto: 'A natureza dos dados depende da forma como se mede: a idade é contínua, mas é muitas vezes registada em anos completos (discreta); o tamanho de uma camisola é contínuo, mas é classificado em XS, S, M, L (dados qualitativos).',
        },
      ],
      resumo: [
        'Problema estatístico: resposta depende de dados que apresentam variabilidade.',
        'População (todas as unidades) · amostra (as observadas) · variável (caraterística estudada).',
        'Fases: produção de dados → organização e representação → interpretação.',
        'Amostra representativa: escolhida ao acaso; evitar amostras por conveniência e por resposta voluntária.',
        'Conclusões a partir de amostras têm sempre uma margem de erro.',
        'Discretos: contagens · contínuos: medições.',
      ],
      quiz: [
        {
          id: 'conceitos-q01',
          tipo: 'escolha',
          enunciado: 'Para estudar o tempo que os alunos de uma escola de 800 alunos gastam no telemóvel, mediu-se esse tempo em 60 alunos escolhidos ao acaso. Qual é a população?',
          opcoes: ['Os 800 alunos da escola.', 'Os 60 alunos escolhidos.', 'O tempo gasto no telemóvel.', 'Os telemóveis dos alunos.'],
          correta: 0,
          explicacao: 'A população é o conjunto de todas as unidades sobre as quais se quer concluir: os 800 alunos. Os 60 são a amostra; o tempo é a variável.',
        },
        {
          id: 'conceitos-q02',
          tipo: 'escolha',
          enunciado: 'Qual destas variáveis dá origem a dados quantitativos contínuos?',
          opcoes: ['Tempo (em segundos) que cada aluno demora a correr 100 m.', 'Número de livros lidos no último ano.', 'Número de irmãos.', 'Cor preferida.'],
          correta: 0,
          explicacao: 'O tempo é uma medição e pode tomar qualquer valor de um intervalo. Livros e irmãos são contagens (discretos); a cor é qualitativa.',
        },
        {
          id: 'conceitos-q03',
          tipo: 'escolha',
          enunciado: 'Um jornal publica no site a pergunta «Concorda com o novo horário escolar?» e recebe 5000 respostas. Porque é que a amostra é enviesada?',
          opcoes: [
            'É uma amostra por resposta voluntária: responde quem quer, em geral quem tem opinião forte.',
            'Porque 5000 respostas é um número demasiado grande.',
            'Porque a variável é qualitativa.',
            'Não é enviesada: qualquer pessoa pode responder.',
          ],
          correta: 0,
          explicacao: 'Em amostras por resposta voluntária, quem responde não foi escolhido ao acaso; o resultado não representa a população.',
        },
        {
          id: 'conceitos-q04',
          tipo: 'vf',
          enunciado: 'Numa sondagem bem feita, a percentagem obtida na amostra é exatamente igual à percentagem na população.',
          correta: false,
          explicacao: 'Outra amostra daria um valor um pouco diferente; a conclusão para a população tem uma margem de erro, não é «verdadeira ou falsa».',
        },
        {
          id: 'conceitos-q05',
          tipo: 'escolha',
          enunciado: 'Qual é a ordem correta das fases de um procedimento estatístico?',
          opcoes: [
            'Produção de dados → organização e representação → interpretação.',
            'Interpretação → produção de dados → organização e representação.',
            'Organização e representação → produção de dados → interpretação.',
            'Produção de dados → interpretação → organização e representação.',
          ],
          correta: 0,
          explicacao: 'Primeiro recolhem-se os dados, depois organizam-se em tabelas e gráficos e, por fim, interpretam-se.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'frequencias-histograma',
      titulo: 'Tabelas de frequências e histograma',
      ae: [
        'Organizar e representar a informação contida em dados quantitativos discretos e contínuos em tabelas de frequências absolutas, absolutas acumuladas, relativas e relativas acumuladas e interpretá-las.',
        'Selecionar representações gráficas adequadas para cada tipo de dados identificando vantagens/inconvenientes, relembrando a construção de gráficos de barras, diagramas de caule-e-folhas e diagramas de extremos-e-quartis.',
        'Reconhecer que o histograma é um diagrama de áreas, e que para a sua construção é necessária uma organização prévia dos dados em classes na forma de intervalos.',
        'Construir histogramas, considerando classes com a mesma amplitude.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Para $n$ dados: **frequência absoluta** $n_i$ = n.º de vezes que o valor aparece; **frequência relativa** $f_i = \\dfrac{n_i}{n}$ (soma 1, ou 100 %). As **acumuladas** somam as frequências desse valor e de todos os anteriores.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Perguntou-se a 20 alunos quantos irmãos têm: 4 responderam 0, 8 responderam 1, 5 responderam 2, 2 responderam 3 e 1 respondeu 4. Constrói a tabela de frequências. Que percentagem tem no máximo 2 irmãos?',
          resolucao: [
            'Frequências relativas: $\\dfrac{4}{20} = 0{,}2$; $\\dfrac{8}{20} = 0{,}4$; $\\dfrac{5}{20} = 0{,}25$; $\\dfrac{2}{20} = 0{,}1$; $\\dfrac{1}{20} = 0{,}05$.',
            'Acumuladas: $0{,}2$; $0{,}2 + 0{,}4 = 0{,}6$; $0{,}6 + 0{,}25 = 0{,}85$; $0{,}95$; $1$ (ver o quadro).',
            '«No máximo 2 irmãos» é a frequência relativa acumulada de 2: $0{,}85$, ou seja, **85 %**.',
          ],
          resultado: 0.85,
          verificar: () => Manual.calc.estatistica.tabelaFrequencias([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4])[2].relativaAcumulada,
        },
        {
          tipo: 'quadro',
          cabecalho: ['N.º de irmãos', '$n_i$', '$N_i$ (acumulada)', '$f_i$', '$F_i$ (acumulada)'],
          linhas: [
            ['0', '4', '4', '0,2', '0,2'],
            ['1', '8', '12', '0,4', '0,6'],
            ['2', '5', '17', '0,25', '0,85'],
            ['3', '2', '19', '0,1', '0,95'],
            ['4', '1', '20', '0,05', '1'],
          ],
        },
        {
          tipo: 'quadro',
          cabecalho: ['Representação', 'Adequada para', 'Vantagem / inconveniente'],
          linhas: [
            ['Gráfico de barras', 'Dados qualitativos e quantitativos discretos', 'Leitura imediata das frequências; barras separadas.'],
            ['Caule-e-folhas', 'Poucos dados quantitativos', 'Ordena rapidamente os dados e mantém os valores; pouco prático com muitos dados.'],
            ['Extremos e quartis', 'Comparar várias distribuições', 'Mostra centro, dispersão e simetria; esconde os valores individuais.'],
            ['Histograma', 'Dados quantitativos contínuos', 'Mostra a forma da distribuição; o aspeto depende das classes escolhidas.'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Alturas (cm) de 20 alunos, num **diagrama de caule-e-folhas** (caule = dezenas, folha = unidades): $15 \\mid 0\\ 3\\ 6\\ 8$; $16 \\mid 0\\ 1\\ 3\\ 4\\ 5\\ 6\\ 7\\ 8\\ 8$; $17 \\mid 0\\ 2\\ 3\\ 5\\ 8$; $18 \\mid 2\\ 9$. A linha $15 \\mid 0\\ 3\\ 6\\ 8$ representa 150, 153, 156 e 158.',
        },
        {
          tipo: 'definicao',
          texto: '**Histograma:** para dados contínuos, agrupam-se primeiro os dados em **classes** (intervalos $[a, b[$); sobre cada classe desenha-se um retângulo. É um **diagrama de áreas**: a área de cada retângulo é proporcional à frequência da classe. Com classes de igual amplitude, a altura também é.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Agrupa as 20 alturas acima em classes de amplitude 10, a começar em 150. Que percentagem de alunos mede menos de 170 cm?',
          resolucao: [
            'Classes: $[150, 160[$, $[160, 170[$, $[170, 180[$ e $[180, 190]$ (a última inclui o máximo, 189).',
            'Contagens: $[150, 160[$ → 4; $[160, 170[$ → 9; $[170, 180[$ → 5; $[180, 190]$ → 2. Total: 20.',
            'Frequências relativas: $0{,}2$; $0{,}45$; $0{,}25$; $0{,}1$.',
            'Menos de 170 cm: as duas primeiras classes, $0{,}2 + 0{,}45 = 0{,}65$, ou seja, **65 %**.',
          ],
          resultado: 65,
          verificar: () => {
            const cls = Manual.calc.estatistica.classes([150, 153, 156, 158, 160, 161, 163, 164, 165, 166, 167, 168, 168, 170, 172, 173, 175, 178, 182, 189], 10);
            return ((cls[0].absoluta + cls[1].absoluta) / 20) * 100;
          },
        },
        {
          tipo: 'esquema',
          id: 'histograma',
          opcoes: {
            dados: [150, 153, 156, 158, 160, 161, 163, 164, 165, 166, 167, 168, 168, 170, 172, 173, 175, 178, 182, 189],
            amplitudeClasse: 10,
          },
          legenda: 'Experimenta: muda a amplitude de classe para 2 e para 20. Com classes a mais vês só «ruído»; com classes a menos o padrão desaparece.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Um histograma **não** é um gráfico de barras: os retângulos ficam encostados (as classes são intervalos seguidos) e o eixo horizontal é uma escala numérica contínua. E cada valor pertence a uma só classe: 160 conta em $[160, 170[$, não em $[150, 160[$.',
        },
      ],
      resumo: [
        'Frequência relativa: $f_i = \\frac{n_i}{n}$; as acumuladas somam até esse valor.',
        'Gráfico de barras: discretos/qualitativos · histograma: contínuos.',
        'Caule-e-folhas: ordena poucos dados · extremos e quartis: compara distribuições.',
        'Histograma: classes $[a, b[$ com a mesma amplitude; área proporcional à frequência.',
        'O aspeto do histograma depende do número e da amplitude das classes.',
      ],
      quiz: [
        {
          id: 'frequencias-histograma-q01',
          tipo: 'numerica',
          enunciado: 'Dos 20 alunos do exemplo (4 com 0 irmãos, 8 com 1, 5 com 2, 2 com 3 e 1 com 4), quantos têm pelo menos 2 irmãos?',
          resposta: 8,
          tolerancia: 0,
          unidade: 'alunos',
          resolucao: [
            'Pelo menos 2 irmãos: 2, 3 ou 4.',
            '$5 + 2 + 1 = 8$ alunos.',
            'Em alternativa: $20 - 12 = 8$, sendo 12 a frequência absoluta acumulada de 1.',
          ],
          verificar: () => 20 - Manual.calc.estatistica.tabelaFrequencias([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4])[1].absolutaAcumulada,
        },
        {
          id: 'frequencias-histograma-q02',
          tipo: 'numerica',
          enunciado: 'Registou-se o número de golos em 10 jogos: 0, 1, 1, 2, 2, 2, 3, 3, 4, 5. Qual é a frequência relativa acumulada do valor 2 (em decimal)?',
          resposta: 0.6,
          tolerancia: 0,
          resolucao: [
            'Jogos com 2 golos ou menos: 1 (zero) + 2 (um) + 3 (dois) = 6.',
            'Frequência relativa acumulada: $\\dfrac{6}{10} = 0{,}6$.',
          ],
          verificar: () => Manual.calc.estatistica.tabelaFrequencias([0, 1, 1, 2, 2, 2, 3, 3, 4, 5])[2].relativaAcumulada,
        },
        {
          id: 'frequencias-histograma-q03',
          tipo: 'numerica',
          enunciado: 'Nas 20 alturas do exemplo, com classes de amplitude 10 a começar em 150, que percentagem de alunos mede pelo menos 170 cm?',
          resposta: 35,
          tolerancia: 0,
          unidade: '%',
          resolucao: [
            'Classes $[170, 180[$ → 5 alunos e $[180, 190]$ → 2 alunos: 7 alunos.',
            '$\\dfrac{7}{20} = 0{,}35$, ou seja, 35 %.',
            'Em alternativa: $100\\,\\% - 65\\,\\% = 35\\,\\%$.',
          ],
          verificar: () => {
            const cls = Manual.calc.estatistica.classes([150, 153, 156, 158, 160, 161, 163, 164, 165, 166, 167, 168, 168, 170, 172, 173, 175, 178, 182, 189], 10);
            return ((cls[2].absoluta + cls[3].absoluta) / 20) * 100;
          },
        },
        {
          id: 'frequencias-histograma-q04',
          tipo: 'escolha',
          enunciado: 'Mediu-se o tempo (em minutos) que 200 pessoas esperaram numa fila. Que representação é mais adequada para mostrar a forma da distribuição?',
          opcoes: ['Histograma', 'Gráfico de barras', 'Diagrama de caule-e-folhas', 'Gráfico circular'],
          correta: 0,
          explicacao: 'Os dados são contínuos e numerosos: agrupam-se em classes e representam-se num histograma. Um caule-e-folhas com 200 dados é pouco prático.',
        },
        {
          id: 'frequencias-histograma-q05',
          tipo: 'vf',
          enunciado: 'Num histograma com classes de igual amplitude, a classe com o retângulo mais alto é a que tem maior frequência.',
          correta: true,
          explicacao: 'A área é proporcional à frequência; com a mesma largura em todas as classes, a altura também é.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'localizacao',
      titulo: 'Medidas de localização',
      ae: [
        'Interpretar as medidas de localização: média (x̄), mediana (Me), moda(s) (Mo) e percentis (quartis como caso especial) na caraterização da distribuição dos dados, relacionando-as com as representações gráficas obtidas.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'formula',
          texto: '**Média:** $\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n} = \\dfrac{\\sum_{i=1}^{n} x_i}{n}$',
        },
        {
          tipo: 'definicao',
          texto: '**Mediana** ($\\mathrm{Me}$): com os dados ordenados, é o valor do meio (n ímpar) ou a média dos dois do meio (n par). Pelo menos 50 % dos dados são $\\le \\mathrm{Me}$ e pelo menos 50 % são $\\ge \\mathrm{Me}$.',
        },
        {
          tipo: 'definicao',
          texto: '**Moda** ($Mo$): o valor com maior frequência. Pode haver mais do que uma moda, ou nenhuma (se todos os valores tiverem a mesma frequência).',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Notas de 10 testes: 14, 8, 12, 17, 10, 15, 12, 18, 11, 13. Calcula a média, a mediana e a moda.',
          resolucao: [
            'Ordenar: 8, 10, 11, 12, 12, 13, 14, 15, 17, 18 ($n = 10$).',
            'Soma: $8 + 10 + 11 + 12 + 12 + 13 + 14 + 15 + 17 + 18 = 130$.',
            'Média: $\\bar{x} = \\dfrac{130}{10} = 13$.',
            'Mediana: $n$ é par; os dois do meio são o 5.º e o 6.º: $\\mathrm{Me} = \\dfrac{12 + 13}{2} = 12{,}5$.',
            'Moda: 12 (aparece duas vezes).',
          ],
          resultado: 12.5,
          verificar: () => Manual.calc.estatistica.mediana([14, 8, 12, 17, 10, 15, 12, 18, 11, 13]),
        },
        {
          tipo: 'definicao',
          texto: '**Percentil** de ordem $k$ ($P_k$): valor que deixa (aproximadamente) $k$ % dos dados abaixo ou iguais a ele. Os **quartis** são casos especiais: $Q_1 = P_{25}$, $Q_2 = P_{50} = \\mathrm{Me}$ e $Q_3 = P_{75}$.',
        },
        {
          tipo: 'formula',
          texto: 'Método (dados ordenados $x_1 \\le x_2 \\le \\cdots \\le x_n$): calcula $p = \\dfrac{n \\cdot k}{100}$. Se $p$ é **inteiro**, $P_k = \\dfrac{x_p + x_{p+1}}{2}$. Se $p$ **não é inteiro**, $P_k = x_{\\lceil p \\rceil}$ — o dado na posição a seguir à parte inteira de $p$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Para as mesmas notas (8, 10, 11, 12, 12, 13, 14, 15, 17, 18), calcula $Q_1$, $Q_3$ e $P_{90}$.',
          resolucao: [
            '$Q_1$: $p = \\dfrac{10 \\times 25}{100} = 2{,}5$, não inteiro → posição 3: $Q_1 = x_3 = 11$.',
            '$Q_3$: $p = \\dfrac{10 \\times 75}{100} = 7{,}5$, não inteiro → posição 8: $Q_3 = x_8 = 15$.',
            '$P_{90}$: $p = \\dfrac{10 \\times 90}{100} = 9$, inteiro → $P_{90} = \\dfrac{x_9 + x_{10}}{2} = \\dfrac{17 + 18}{2} = 17{,}5$.',
            'Confirmação da mediana com o mesmo método: $p = 5$, inteiro → $\\dfrac{x_5 + x_6}{2} = 12{,}5$.',
          ],
          resultado: 17.5,
          verificar: () => Manual.calc.estatistica.percentil([8, 10, 11, 12, 12, 13, 14, 15, 17, 18], 90),
        },
        {
          tipo: 'erro-frequente',
          texto: 'Quando $p$ não é inteiro, **não** arredondes ao inteiro mais próximo: usa sempre a posição seguinte. Com $n = 9$ e $k = 25$, $p = 2{,}25$ → usa-se $x_3$, não $x_2$. E não te esqueças de **ordenar** os dados antes de procurar posições.',
        },
        {
          tipo: 'texto',
          texto: 'Relação com os gráficos: numa distribuição **simétrica**, média e mediana são próximas. Se há uma cauda longa para a direita (alguns valores muito altos), a média é puxada para esse lado e fica **maior** do que a mediana.',
        },
        {
          tipo: 'esquema',
          id: 'medidas',
          opcoes: { dados: [8, 10, 11, 12, 12, 13, 14, 15, 17, 18] },
          legenda: 'Experimenta: arrasta o ponto com a nota 18 (o ponto 10) até 30. A média sobe, mas a mediana e os quartis não mudam.',
        },
        {
          tipo: 'texto',
          texto: 'Programa em Python (das AE, generalizado com len) que calcula a média, a mediana, o máximo e o mínimo de uma lista de idades:',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'idades = [14, 16, 14, 15, 17]',
            'idades.sort()',
            'n = len(idades)',
            'soma = 0',
            'for i in range(n):',
            '    soma = soma + idades[i]',
            'print("Idades:", idades)',
            'print("Média:", soma / n)',
            'if n % 2 == 1:',
            '    print("Mediana:", idades[n // 2])',
            'else:',
            '    print("Mediana:", (idades[n // 2 - 1] + idades[n // 2]) / 2)',
            'print("Máximo:", idades[n - 1])',
            'print("Mínimo:", idades[0])',
          ].join('\n'),
        },
      ],
      resumo: [
        'Média: $\\bar{x} = \\frac{\\sum x_i}{n}$.',
        'Mediana $\\mathrm{Me}$: valor do meio dos dados ordenados (média dos dois do meio se $n$ par).',
        'Moda $Mo$: valor mais frequente (pode haver várias ou nenhuma).',
        'Percentil $P_k$: $p = \\frac{nk}{100}$; inteiro → $\\frac{x_p + x_{p+1}}{2}$; não inteiro → $x_{\\lceil p \\rceil}$.',
        '$Q_1 = P_{25}$, $Q_2 = \\mathrm{Me}$, $Q_3 = P_{75}$.',
        'Cauda longa à direita: média > mediana.',
      ],
      quiz: [
        {
          id: 'localizacao-q01',
          tipo: 'numerica',
          enunciado: 'Número de mensagens recebidas por 9 alunos numa hora: 12, 7, 10, 16, 10, 13, 9, 15, 10. Calcula a média (arredondada às centésimas).',
          resposta: 11.33,
          tolerancia: 0.005,
          resolucao: [
            'Soma: $12 + 7 + 10 + 16 + 10 + 13 + 9 + 15 + 10 = 102$.',
            '$\\bar{x} = \\dfrac{102}{9} \\approx 11{,}33$.',
          ],
          verificar: () => Manual.calc.estatistica.media([12, 7, 10, 16, 10, 13, 9, 15, 10]),
        },
        {
          id: 'localizacao-q02',
          tipo: 'numerica',
          enunciado: 'Para os mesmos dados (12, 7, 10, 16, 10, 13, 9, 15, 10), qual é a mediana?',
          resposta: 10,
          tolerancia: 0,
          resolucao: [
            'Ordenar: 7, 9, 10, 10, 10, 12, 13, 15, 16 ($n = 9$).',
            '$p = \\dfrac{9 \\times 50}{100} = 4{,}5$, não inteiro → posição 5.',
            '$\\mathrm{Me} = x_5 = 10$.',
          ],
          verificar: () => Manual.calc.estatistica.mediana([12, 7, 10, 16, 10, 13, 9, 15, 10]),
        },
        {
          id: 'localizacao-q03',
          tipo: 'numerica',
          enunciado: 'Ainda para 7, 9, 10, 10, 10, 12, 13, 15, 16, calcula o 3.º quartil $Q_3$.',
          resposta: 13,
          tolerancia: 0,
          resolucao: [
            '$p = \\dfrac{9 \\times 75}{100} = 6{,}75$, não inteiro → posição 7.',
            '$Q_3 = x_7 = 13$.',
          ],
          verificar: () => Manual.calc.estatistica.quartis([12, 7, 10, 16, 10, 13, 9, 15, 10]).q3,
        },
        {
          id: 'localizacao-q04',
          tipo: 'escolha',
          enunciado: 'Qual é a moda de 7, 9, 10, 10, 10, 12, 13, 15, 16?',
          opcoes: ['10', '11,33', '12', 'Não há moda.'],
          correta: 0,
          explicacao: 'O 10 aparece três vezes; nenhum outro valor aparece mais do que uma vez.',
        },
        {
          id: 'localizacao-q05',
          tipo: 'vf',
          enunciado: 'A mediana de um conjunto de dados é sempre um dos dados.',
          correta: false,
          explicacao: 'Com $n$ par, a mediana é a média dos dois valores do meio, que pode não ser um dos dados (ex.: 12,5 nas notas do exemplo).',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'dispersao',
      titulo: 'Medidas de dispersão',
      ae: [
        'Interpretar as medidas de dispersão, amplitude, amplitude interquartil e desvio padrão amostral, s, (variância amostral s²) na caraterização da distribuição dos dados, relacionando-as com as representações gráficas obtidas.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Os conjuntos 9, 10, 11 e 1, 10, 19 têm a mesma média (10), mas no segundo os dados estão muito mais espalhados. As **medidas de dispersão** medem essa variabilidade.',
        },
        {
          tipo: 'definicao',
          texto: '**Amplitude:** $\\text{máximo} - \\text{mínimo}$. **Amplitude interquartil:** $AIQ = Q_3 - Q_1$, a largura do intervalo onde fica a metade central dos dados (a «caixa» do diagrama de extremos e quartis).',
        },
        {
          tipo: 'definicao',
          texto: '**Desvio** de cada dado em relação à média: $d_i = x_i - \\bar{x}$. É positivo para dados acima da média e negativo para dados abaixo.',
        },
        {
          tipo: 'formula',
          texto: '**Variância amostral:** $s^2 = \\dfrac{\\sum_{i=1}^{n} (x_i - \\bar{x})^2}{n - 1}$ · **Desvio padrão amostral:** $s = \\sqrt{s^2}$',
        },
        {
          tipo: 'texto',
          texto: 'Divide-se por $n - 1$ porque os dados são uma **amostra** (por isso se chamam variância e desvio padrão **amostrais**). O desvio padrão tem as mesmas unidades dos dados; a variância tem as unidades ao quadrado.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Calcula a variância e o desvio padrão amostrais de 4, 6, 7, 8, 10.',
          resolucao: [
            'Média: $\\bar{x} = \\dfrac{4 + 6 + 7 + 8 + 10}{5} = \\dfrac{35}{5} = 7$.',
            'Desvios: $-3$, $-1$, $0$, $1$, $3$ (soma 0). Quadrados: $9$, $1$, $0$, $1$, $9$ (ver o quadro).',
            'Soma dos quadrados: $9 + 1 + 0 + 1 + 9 = 20$.',
            '$s^2 = \\dfrac{20}{5 - 1} = 5$.',
            '$s = \\sqrt{5} \\approx 2{,}24$ (arredondado às centésimas).',
          ],
          resultado: 2.24,
          verificar: () => Math.round(Manual.calc.estatistica.desvioPadrao([4, 6, 7, 8, 10]) * 100) / 100,
        },
        {
          tipo: 'quadro',
          cabecalho: ['$x_i$', '$x_i - \\bar{x}$', '$(x_i - \\bar{x})^2$'],
          linhas: [
            ['4', '−3', '9'],
            ['6', '−1', '1'],
            ['7', '0', '0'],
            ['8', '1', '1'],
            ['10', '3', '9'],
            ['**Soma**', '**0**', '**20**'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Para os mesmos dados (4, 6, 7, 8, 10), calcula a amplitude e a amplitude interquartil.',
          resolucao: [
            'Amplitude: $10 - 4 = 6$.',
            '$Q_1$: $p = \\dfrac{5 \\times 25}{100} = 1{,}25$ → posição 2: $Q_1 = 6$.',
            '$Q_3$: $p = \\dfrac{5 \\times 75}{100} = 3{,}75$ → posição 4: $Q_3 = 8$.',
            '$AIQ = 8 - 6 = 2$.',
          ],
          resultado: 2,
          verificar: () => Manual.calc.estatistica.amplitudeInterquartil([4, 6, 7, 8, 10]),
        },
        {
          tipo: 'esquema',
          id: 'medidas',
          opcoes: { dados: [4, 6, 7, 8, 10] },
          legenda: 'Experimenta: afasta os pontos da média e vê a soma dos quadrados e o desvio padrão a crescer; depois junta-os todos no mesmo valor.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Erros típicos: dividir por $n$ em vez de $n - 1$ (isso dá o desvio padrão populacional), esquecer a raiz quadrada (dar $s^2$ em vez de $s$) e somar os desvios sem os elevar ao quadrado — essa soma é sempre 0.',
        },
        {
          tipo: 'texto',
          texto: 'Programa em Python (adaptado das AE) para a amplitude e o desvio padrão. No programa das AE divide-se por $n$ (desvio padrão populacional); aqui divide-se por $n - 1$, como no resto do manual.',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'from math import sqrt',
            'idades = [14, 16, 14, 15, 17, 23]',
            'n = len(idades)',
            'media = sum(idades) / n',
            'soma_quadrados = 0',
            'for x in idades:',
            '    soma_quadrados = soma_quadrados + (x - media) ** 2',
            'desvio_padrao = sqrt(soma_quadrados / (n - 1))  # amostral',
            'amplitude = max(idades) - min(idades)',
            'print("Desvio padrão:", desvio_padrao)',
            'print("Amplitude:", amplitude)',
          ].join('\n'),
        },
      ],
      resumo: [
        'Amplitude: máximo − mínimo.',
        'Amplitude interquartil: $AIQ = Q_3 - Q_1$ (metade central dos dados).',
        'Variância amostral: $s^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n - 1}$.',
        'Desvio padrão amostral: $s = \\sqrt{s^2}$, nas unidades dos dados.',
        'Quanto maior $s$, mais afastados da média estão os dados.',
      ],
      quiz: [
        {
          id: 'dispersao-q01',
          tipo: 'numerica',
          enunciado: 'Calcula a variância amostral $s^2$ de 3, 5, 7, 9, 11.',
          resposta: 10,
          tolerancia: 0,
          resolucao: [
            'Média: $\\bar{x} = \\dfrac{35}{5} = 7$.',
            'Desvios: $-4$, $-2$, $0$, $2$, $4$. Quadrados: $16$, $4$, $0$, $4$, $16$.',
            'Soma dos quadrados: $40$.',
            '$s^2 = \\dfrac{40}{5 - 1} = 10$.',
          ],
          verificar: () => Manual.calc.estatistica.variancia([3, 5, 7, 9, 11]),
        },
        {
          id: 'dispersao-q02',
          tipo: 'numerica',
          enunciado: 'Qual é o desvio padrão amostral $s$ de 3, 5, 7, 9, 11 (arredondado às centésimas)?',
          resposta: 3.16,
          tolerancia: 0.005,
          resolucao: [
            'Da pergunta anterior, $s^2 = 10$.',
            '$s = \\sqrt{10} \\approx 3{,}16$.',
          ],
          verificar: () => Manual.calc.estatistica.desvioPadrao([3, 5, 7, 9, 11]),
        },
        {
          id: 'dispersao-q03',
          tipo: 'numerica',
          enunciado: 'Calcula a amplitude interquartil de 3, 5, 7, 9, 11.',
          resposta: 4,
          tolerancia: 0,
          resolucao: [
            '$Q_1$: $p = \\dfrac{5 \\times 25}{100} = 1{,}25$ → posição 2: $Q_1 = 5$.',
            '$Q_3$: $p = \\dfrac{5 \\times 75}{100} = 3{,}75$ → posição 4: $Q_3 = 9$.',
            '$AIQ = 9 - 5 = 4$.',
          ],
          verificar: () => Manual.calc.estatistica.amplitudeInterquartil([3, 5, 7, 9, 11]),
        },
        {
          id: 'dispersao-q04',
          tipo: 'escolha',
          enunciado: 'Os conjuntos A = {9, 10, 11} e B = {1, 10, 19} têm média 10. O que se pode dizer dos desvios padrão?',
          opcoes: ['$s_B > s_A$', '$s_A > s_B$', '$s_A = s_B$, porque as médias são iguais.', 'Não se pode comparar sem calcular a mediana.'],
          correta: 0,
          explicacao: 'Em B os dados estão muito mais afastados da média: $s_A = 1$ e $s_B = 9$.',
          resolucao: [
            'A: desvios $-1, 0, 1$; $s_A^2 = \\dfrac{2}{2} = 1$, $s_A = 1$.',
            'B: desvios $-9, 0, 9$; $s_B^2 = \\dfrac{162}{2} = 81$, $s_B = 9$.',
          ],
          calculo: true,
        },
        {
          id: 'dispersao-q05',
          tipo: 'vf',
          enunciado: 'Se as alturas de um grupo forem medidas em centímetros, a variância vem em centímetros.',
          correta: false,
          explicacao: 'A variância vem em centímetros quadrados (cm²); é o desvio padrão $s$ que vem em centímetros.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'propriedades',
      titulo: 'Propriedades das medidas',
      ae: [
        'Interpretar e mostrar analiticamente as alterações provocadas na média por transformação dos dados pela multiplicação de cada um por uma constante “a” e pela adição de uma constante “b”.',
        'Compreender os conceitos e as seguintes propriedades das medidas: - Pouca resistência da média e do desvio padrão; - Soma dos desvios dos dados relativamente à média é igual a zero; - Desvio padrão é igual a zero se e só se todos os dados forem iguais; - Amplitude interquartil igual a zero, não implica a não existência de variabilidade;',
        'Conhecer que se os dados forem fornecidos já agrupados em classes, na forma de intervalos, torna-se necessário adequar as fórmulas ou os procedimentos existentes para dados não agrupados, para obter valores aproximados da média e do desvio padrão.',
        'Reconhecer que existem situações em que é preferível utilizar, como medida de localização do centro da distribuição dos dados, a mediana em vez da média, e como medida de dispersão a amplitude interquartil em vez do desvio padrão, apresentando exemplos simples.',
        'Reconhecer que algumas representações gráficas são mais adequadas que outras para comparar conjuntos de dados, nomeadamente o diagrama de extremos e quartis, para comparar a distribuição de dois ou mais conjuntos de dados, realçando aspetos de simetria, dispersão, concentração, etc.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'formula',
          texto: 'Se cada dado se transforma em $y_i = a x_i + b$, então $\\bar{y} = a\\bar{x} + b$ e $s_y = |a| \\, s_x$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Mostra que, se $y_i = a x_i + b$ para $i = 1, \\ldots, n$, então $\\bar{y} = a\\bar{x} + b$.',
          resolucao: [
            'Soma dos $y_i$: $(a x_1 + b) + \\cdots + (a x_n + b) = a(x_1 + \\cdots + x_n) + nb$.',
            'Dividir por $n$: $\\bar{y} = a \\cdot \\dfrac{x_1 + \\cdots + x_n}{n} + \\dfrac{nb}{n}$.',
            'Logo $\\bar{y} = a\\bar{x} + b$.',
            'Para o desvio padrão: os desvios passam a ser $y_i - \\bar{y} = a(x_i - \\bar{x})$; somar $b$ não os altera e multiplicar por $a$ multiplica $s$ por $|a|$.',
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Temperaturas máximas numa semana (°C): 13, 13, 15, 17, 17, com $\\bar{x} = 15$ e $s = 2$. Usando $F = 1{,}8\\,C + 32$, qual é a média e o desvio padrão em graus Fahrenheit?',
          resolucao: [
            'Aqui $a = 1{,}8$ e $b = 32$.',
            'Média: $\\bar{F} = 1{,}8 \\times 15 + 32 = 27 + 32 = 59$ °F.',
            'Desvio padrão: $s_F = 1{,}8 \\times 2 = 3{,}6$ °F (o $+32$ não altera a dispersão).',
          ],
          resultado: 59,
          verificar: () => Manual.calc.estatistica.media([13, 13, 15, 17, 17].map((c) => 1.8 * c + 32)),
        },
        {
          tipo: 'formula',
          texto: '**A soma dos desvios é zero:** $\\sum_{i=1}^{n} (x_i - \\bar{x}) = \\sum_{i=1}^{n} x_i - n\\bar{x} = n\\bar{x} - n\\bar{x} = 0$',
        },
        {
          tipo: 'texto',
          texto: '$s = 0$ **se e só se todos os dados forem iguais:** $s^2$ é uma soma de quadrados (todos $\\ge 0$) a dividir por $n - 1$; só é zero se todos os desvios forem zero, isto é, se todos os dados forem iguais à média.',
        },
        {
          tipo: 'erro-frequente',
          texto: '$AIQ = 0$ **não** quer dizer que não há variabilidade. Em 3, 5, 5, 5, 5, 5, 5, 9 tem-se $Q_1 = Q_3 = 5$, logo $AIQ = 0$, mas os dados variam ($s \\approx 1{,}67$).',
        },
        {
          tipo: 'definicao',
          texto: 'Uma medida é **resistente** se quase não muda quando aparecem **outliers** (dados muito diferentes dos restantes). A mediana e a $AIQ$ são resistentes; a média e o desvio padrão são **pouco resistentes**.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Nos dados 3, 4, 5, 5, 6, 7, 8 troca-se o 8 por 30 (um outlier). Compara a média, a mediana, o desvio padrão e a $AIQ$ antes e depois.',
          resolucao: [
            'Antes: $\\bar{x} = \\dfrac{38}{7} \\approx 5{,}43$; $\\mathrm{Me} = 5$; $s \\approx 1{,}72$; $AIQ = 7 - 4 = 3$.',
            'Depois: $\\bar{x} = \\dfrac{60}{7} \\approx 8{,}57$; $\\mathrm{Me} = 5$; $s \\approx 9{,}54$; $AIQ = 7 - 4 = 3$.',
            'A média passa a ser maior do que 6 dos 7 dados; a mediana e a $AIQ$ não mudaram.',
          ],
          resultado: 8.57,
          verificar: () => Math.round(Manual.calc.estatistica.media([3, 4, 5, 5, 6, 7, 30]) * 100) / 100,
        },
        {
          tipo: 'esquema',
          id: 'medidas',
          opcoes: { dados: [3, 4, 5, 5, 6, 7, 8] },
          legenda: 'Experimenta: arrasta o ponto com o valor 8 (o ponto 7) até 30, como no exemplo, e compara média/mediana e desvio padrão/AIQ; depois escreve a = 2 e b = 3 e vê a média e o desvio padrão a mudar.',
        },
        {
          tipo: 'texto',
          texto: 'Por isso, com outliers ou distribuições muito assimétricas, prefere-se a **mediana** para o centro e a **AIQ** para a dispersão. Exemplo: salários de 800, 850, 900, 900, 950, 1000 e 5000 € — a média ($\\approx 1485{,}71$ €) é maior do que 6 dos 7 salários; a mediana (900 €) representa melhor o grupo.',
        },
        {
          tipo: 'formula',
          texto: '**Dados agrupados em classes** (marcas $c_i$ = pontos médios, frequências $n_i$): $\\bar{x} \\approx \\dfrac{\\sum n_i c_i}{n}$ e $s \\approx \\sqrt{\\dfrac{\\sum n_i (c_i - \\bar{x})^2}{n - 1}}$',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Alturas de 20 alunos agrupadas: $[150, 160[$ → 4; $[160, 170[$ → 9; $[170, 180[$ → 5; $[180, 190]$ → 2. Calcula um valor aproximado da média.',
          resolucao: [
            'Marcas: 155, 165, 175, 185.',
            '$\\sum n_i c_i = 4 \\times 155 + 9 \\times 165 + 5 \\times 175 + 2 \\times 185 = 620 + 1485 + 875 + 370 = 3350$.',
            '$\\bar{x} \\approx \\dfrac{3350}{20} = 167{,}5$ cm.',
            'É um valor aproximado: com os 20 dados originais, a média é 166,9 cm.',
          ],
          resultado: 167.5,
          verificar: () => Manual.calc.estatistica.mediaAgrupada(Manual.calc.estatistica.classes([150, 153, 156, 158, 160, 161, 163, 164, 165, 166, 167, 168, 168, 170, 172, 173, 175, 178, 182, 189], 10)),
        },
        {
          tipo: 'texto',
          texto: 'Para **comparar** dois ou mais conjuntos de dados, o **diagrama de extremos e quartis** é o mais adequado: lado a lado, mostra logo qual tem o centro mais alto, qual é mais disperso e se a distribuição é simétrica.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Notas (10 alunos por turma)', 'Turma A', 'Turma B'],
          linhas: [
            ['Mínimo', '6', '9'],
            ['$Q_1$', '9', '12'],
            ['Mediana', '11,5', '13'],
            ['$Q_3$', '13', '14'],
            ['Máximo', '17', '16'],
            ['$AIQ$', '4', '2'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'A turma B tem mediana mais alta (13 contra 11,5) e notas mais concentradas ($AIQ$ 2 contra 4; amplitude 7 contra 11). Em A, a mediana está mais perto de $Q_3$ do que de $Q_1$: a metade central não é simétrica.',
        },
      ],
      resumo: [
        '$y = ax + b$: $\\bar{y} = a\\bar{x} + b$ e $s_y = |a|\\,s_x$.',
        'Soma dos desvios em relação à média: sempre 0.',
        '$s = 0$ se e só se todos os dados são iguais; $AIQ = 0$ não implica ausência de variabilidade.',
        'Média e desvio padrão: pouco resistentes · mediana e AIQ: resistentes.',
        'Dados agrupados: usar as marcas das classes (valores aproximados).',
        'Comparar distribuições: diagramas de extremos e quartis lado a lado.',
      ],
      quiz: [
        {
          id: 'propriedades-q01',
          tipo: 'numerica',
          enunciado: 'Os dados 9, 12, 15 têm média 12 e desvio padrão 3. Cada dado é multiplicado por 2 e depois somado 5. Qual é a nova média?',
          resposta: 29,
          tolerancia: 0,
          resolucao: [
            '$a = 2$, $b = 5$.',
            '$\\bar{y} = 2 \\times 12 + 5 = 29$.',
            'Confirmação: os novos dados são 23, 29, 35, com média 29.',
          ],
          verificar: () => Manual.calc.estatistica.media([9, 12, 15].map((x) => 2 * x + 5)),
        },
        {
          id: 'propriedades-q02',
          tipo: 'numerica',
          enunciado: 'Com a mesma transformação ($y = 2x + 5$ aplicada a 9, 12, 15, com $s_x = 3$), qual é o novo desvio padrão?',
          resposta: 6,
          tolerancia: 1e-9,
          resolucao: [
            '$s_y = |a| \\, s_x = 2 \\times 3 = 6$.',
            'Somar 5 desloca todos os dados por igual e não altera a dispersão.',
          ],
          verificar: () => Manual.calc.estatistica.desvioPadrao([9, 12, 15].map((x) => 2 * x + 5)),
        },
        {
          id: 'propriedades-q03',
          tipo: 'numerica',
          enunciado: 'Tempos de espera agrupados: $[0, 10[$ → 3 pessoas; $[10, 20[$ → 5 pessoas; $[20, 30]$ → 2 pessoas. Calcula um valor aproximado da média (em minutos).',
          resposta: 14,
          tolerancia: 0,
          unidade: 'min',
          resolucao: [
            'Marcas: 5, 15, 25.',
            '$\\sum n_i c_i = 3 \\times 5 + 5 \\times 15 + 2 \\times 25 = 15 + 75 + 50 = 140$.',
            '$\\bar{x} \\approx \\dfrac{140}{10} = 14$ minutos.',
          ],
          verificar: () => Manual.calc.estatistica.mediaAgrupada([
            { marca: 5, absoluta: 3 },
            { marca: 15, absoluta: 5 },
            { marca: 25, absoluta: 2 },
          ]),
        },
        {
          id: 'propriedades-q04',
          tipo: 'escolha',
          enunciado: 'Os salários numa pequena empresa são 800, 850, 900, 900, 950, 1000 e 5000 €. Que medidas descrevem melhor o centro e a dispersão destes salários?',
          opcoes: ['Mediana e amplitude interquartil.', 'Média e desvio padrão.', 'Média e amplitude.', 'Moda e desvio padrão.'],
          correta: 0,
          explicacao: 'O salário de 5000 € é um outlier: puxa a média (≈ 1485,71 €) e o desvio padrão para cima. A mediana (900 €) e a AIQ são resistentes.',
        },
        {
          id: 'propriedades-q05',
          tipo: 'vf',
          enunciado: 'Se a amplitude interquartil de um conjunto de dados é 0, então todos os dados são iguais.',
          correta: false,
          explicacao: 'Basta que a metade central dos dados seja igual: em 3, 5, 5, 5, 5, 5, 5, 9 a AIQ é 0, mas há 3 e 9.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'bivariada',
      titulo: 'Dados bivariados e regressão linear',
      ae: [
        'Reconhecer que, para estudar a associação entre duas variáveis quantitativas de uma população, se observam essas variáveis sobre cada unidade estatística, obtendo-se uma amostra de pares de dados.',
        'Reconhecer a importância da representação dos dados no diagrama de dispersão, nuvem de pontos, para interpretar a forma, direção e força da associação (linear) entre as duas variáveis.',
        'Identificar o coeficiente de correlação linear r, como medida dessa direção e grau de associação (linear), e saber que assume valores pertencentes a [−1, 1], dizendo-se com base nesse valor que a correlação é positiva, negativa ou nula. Recorrer à tecnologia para proceder ao cálculo do coeficiente de correlação linear.',
        'Compreender que no caso do diagrama de dispersão mostrar uma forte associação linear entre as variáveis, essa associação pode ser descrita pela reta de regressão ou reta dos mínimos quadrados. Utilizar a tecnologia para determinar uma equação da reta de regressão.',
        'Compreender que na construção da reta de regressão não é indiferente qual das variáveis é que se considera como variável independente ou explanatória.',
        'Compreender que a existência de outliers influencia estes procedimentos.',
        'Utilizar a reta de regressão para inferir o valor da variável dependente ou resposta, para um dado valor da variável independente ou explanatória, quando existe uma forte associação linear entre as variáveis, quer positiva, quer negativa, e desde que este esteja no domínio dos dados considerados.',
        'Compreender que não se pode confundir correlação com relação causa-efeito, pois podem existir variáveis “perturbadoras” que podem provocar uma aparente associação entre as variáveis em estudo.',
        'Entender que um gráfico de linhas é um caso particular de um diagrama de dispersão, em que se pretende estudar a evolução de uma das variáveis relativamente a outra variável, de um modo geral o tempo, e em que se unem, por linhas, os pontos representados.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Para estudar a **associação** entre duas variáveis quantitativas, observam-se as duas na **mesma** unidade estatística: obtém-se uma amostra de **pares** $(x_i, y_i)$ — por exemplo, idade e altura de cada aluno.',
        },
        {
          tipo: 'definicao',
          texto: '**Variável independente ou explanatória** ($x$): a que se usa para explicar ou prever. **Variável dependente ou resposta** ($y$): a que se quer prever. Na idade e altura, $x$ é a idade e $y$ é a altura.',
        },
        {
          tipo: 'definicao',
          texto: '**Diagrama de dispersão** (nuvem de pontos): cada par é um ponto $(x_i, y_i)$. Observa-se a **forma** (linear ou não), a **direção** (positiva: $y$ cresce com $x$; negativa: decresce) e a **força** (pontos mais ou menos perto de uma reta).',
        },
        {
          tipo: 'formula',
          texto: '**Coeficiente de correlação linear:** $r = \\dfrac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\cdot \\sum (y_i - \\bar{y})^2}}$, com $-1 \\le r \\le 1$.',
        },
        {
          tipo: 'texto',
          texto: '$r > 0$: correlação positiva; $r < 0$: negativa; $r \\approx 0$: nula (não há associação **linear**). Quanto mais perto de $-1$ ou $1$, mais forte; $r = \\pm 1$ só quando os pontos estão todos alinhados numa reta. Na prática, $r$ calcula-se com a tecnologia.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Calcula $r$ para os pares $(1, 2)$, $(2, 4)$, $(3, 5)$, $(4, 4)$, $(5, 7)$.',
          resolucao: [
            'Médias: $\\bar{x} = \\dfrac{15}{5} = 3$ e $\\bar{y} = \\dfrac{22}{5} = 4{,}4$.',
            'Desvios em $x$: $-2, -1, 0, 1, 2$. Desvios em $y$: $-2{,}4;\\ -0{,}4;\\ 0{,}6;\\ -0{,}4;\\ 2{,}6$.',
            '$\\sum (x_i - \\bar{x})(y_i - \\bar{y}) = 4{,}8 + 0{,}4 + 0 - 0{,}4 + 5{,}2 = 10$.',
            '$\\sum (x_i - \\bar{x})^2 = 4 + 1 + 0 + 1 + 4 = 10$ e $\\sum (y_i - \\bar{y})^2 = 5{,}76 + 0{,}16 + 0{,}36 + 0{,}16 + 6{,}76 = 13{,}2$.',
            '$r = \\dfrac{10}{\\sqrt{10 \\times 13{,}2}} = \\dfrac{10}{\\sqrt{132}} \\approx 0{,}87$: correlação positiva forte.',
          ],
          resultado: 0.87,
          verificar: () => Math.round(Manual.calc.estatistica.correlacao([[1, 2], [2, 4], [3, 5], [4, 4], [5, 7]]) * 100) / 100,
        },
        {
          tipo: 'definicao',
          texto: '**Reta de regressão** (ou **reta dos mínimos quadrados**) $y = ax + b$: a reta que torna mínima a soma dos quadrados das distâncias verticais dos pontos à reta. Só faz sentido quando a nuvem de pontos mostra uma associação aproximadamente linear.',
        },
        {
          tipo: 'formula',
          texto: '$a = \\dfrac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}$ e $b = \\bar{y} - a\\bar{x}$ (a reta passa por $(\\bar{x}, \\bar{y})$). No exemplo acima: $a = \\dfrac{10}{10} = 1$ e $b = 4{,}4 - 3 = 1{,}4$, ou seja, $y = x + 1{,}4$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Horas de estudo semanais ($x$) e nota no teste ($y$, de 0 a 20) de 8 alunos: $(1; 7)$, $(2; 7{,}5)$, $(3; 9)$, $(4; 11{,}5)$, $(5; 13)$, $(6; 13{,}5)$, $(7; 15)$, $(8; 17{,}5)$. A calculadora dá $r \\approx 0{,}99$ e a reta $y = 1{,}5x + 5$. Estima a nota de um aluno que estuda 5,5 horas.',
          resolucao: [
            '$r \\approx 0{,}99$: associação linear positiva muito forte, por isso pode usar-se a reta.',
            '$x = 5{,}5$ está dentro do intervalo dos dados ($[1, 8]$).',
            '$y = 1{,}5 \\times 5{,}5 + 5 = 8{,}25 + 5 = 13{,}25$ valores.',
          ],
          resultado: 13.25,
          verificar: () => {
            const reg = Manual.calc.estatistica.regressao([[1, 7], [2, 7.5], [3, 9], [4, 11.5], [5, 13], [6, 13.5], [7, 15], [8, 17.5]]);
            return reg.declive * 5.5 + reg.ordenada;
          },
        },
        {
          tipo: 'esquema',
          id: 'regressao',
          opcoes: { pares: [[1, 7], [2, 7.5], [3, 9], [4, 11.5], [5, 13], [6, 13.5], [7, 15], [8, 17.5]] },
          legenda: 'Experimenta: arrasta o ponto P8 de (8; 17,5) para (8; 6) — um outlier. O valor de r cai de 0,99 para cerca de 0,39 e a reta fica muito menos inclinada.',
        },
        {
          tipo: 'texto',
          texto: '**Outliers** influenciam muito $r$ e a reta: no exemplo, com o ponto $(8; 6)$ em vez de $(8; 17{,}5)$, $r$ passa de 0,99 para cerca de 0,39 e a reta passa a ser $y \\approx 0{,}54x + 7{,}88$. Conjuntos de dados com o mesmo $r$ podem ter nuvens muito diferentes (dados de Anscombe): **vê sempre o diagrama primeiro**.',
        },
        {
          tipo: 'erro-frequente',
          texto: '**Extrapolar:** a reta só serve para valores de $x$ **dentro** do intervalo dos dados. Para 20 horas de estudo, $y = 1{,}5 \\times 20 + 5 = 35$ — impossível numa escala de 0 a 20. Fora dos dados, nada garante que a relação continue linear.',
        },
        {
          tipo: 'erro-frequente',
          texto: '**Correlação não é causalidade.** As vendas de gelados e o número de afogamentos têm correlação positiva, mas um não causa o outro: ambos aumentam com o calor, uma **variável perturbadora**. Uma correlação forte só mostra que as variáveis variam em conjunto.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Trocar $x$ com $y$ **não** dá a mesma reta. Nos pares $(1, 2), \\ldots, (5, 7)$, a reta de $y$ sobre $x$ tem declive 1; a reta de $x$ sobre $y$, escrita na forma $y = \\ldots$, tem declive $\\dfrac{13{,}2}{10} = 1{,}32$. Escolhe como $x$ a variável explanatória.',
        },
        {
          tipo: 'definicao',
          texto: '**Gráfico de linhas:** caso particular do diagrama de dispersão em que $x$ é, em geral, o **tempo** e se unem os pontos por segmentos, para ver a evolução da outra variável — por exemplo, a temperatura às 12 h em cada dia de um mês.',
        },
      ],
      resumo: [
        'Dados bivariados: pares $(x_i, y_i)$ observados na mesma unidade estatística.',
        '$x$: variável explanatória · $y$: variável resposta.',
        '$r \\in [-1, 1]$: sinal = direção; $|r|$ perto de 1 = associação linear forte.',
        'Reta de regressão (mínimos quadrados) $y = ax + b$, passa por $(\\bar{x}, \\bar{y})$.',
        'Prever só dentro do intervalo dos dados e com associação linear forte.',
        'Outliers alteram $r$ e a reta; correlação ≠ causalidade.',
        'Gráfico de linhas: evolução ao longo do tempo.',
      ],
      quiz: [
        {
          id: 'bivariada-q01',
          tipo: 'numerica',
          enunciado: 'Idade de 4 carros ($x$, em anos) e preço ($y$, em milhares de euros): $(2; 27)$, $(4; 21)$, $(6; 17)$, $(8; 15)$. A reta de regressão é $y = -2x + 30$. Estima o preço de um carro com 5 anos.',
          resposta: 20,
          tolerancia: 0,
          unidade: 'mil €',
          resolucao: [
            '$x = 5$ está dentro do intervalo dos dados ($[2, 8]$).',
            '$y = -2 \\times 5 + 30 = -10 + 30 = 20$ milhares de euros.',
          ],
          verificar: () => {
            const reg = Manual.calc.estatistica.regressao([[2, 27], [4, 21], [6, 17], [8, 15]]);
            return reg.declive * 5 + reg.ordenada;
          },
        },
        {
          id: 'bivariada-q02',
          tipo: 'numerica',
          enunciado: 'Com a reta $y = 1{,}5x + 5$ do exemplo das horas de estudo, estima a nota de um aluno que estuda 6,5 horas por semana.',
          resposta: 14.75,
          tolerancia: 0.005,
          resolucao: [
            '$x = 6{,}5$ está dentro do intervalo dos dados ($[1, 8]$).',
            '$y = 1{,}5 \\times 6{,}5 + 5 = 9{,}75 + 5 = 14{,}75$ valores.',
          ],
          verificar: () => {
            const reg = Manual.calc.estatistica.regressao([[1, 7], [2, 7.5], [3, 9], [4, 11.5], [5, 13], [6, 13.5], [7, 15], [8, 17.5]]);
            return reg.declive * 6.5 + reg.ordenada;
          },
        },
        {
          id: 'bivariada-q03',
          tipo: 'escolha',
          enunciado: 'Num diagrama de dispersão, os pontos estão muito perto de uma reta que desce da esquerda para a direita. Qual é o valor mais provável de $r$?',
          opcoes: ['$-0{,}95$', '$0{,}95$', '$-0{,}2$', '$0$'],
          correta: 0,
          explicacao: 'Reta a descer: correlação negativa; pontos muito perto da reta: forte, ou seja, $r$ perto de $-1$.',
        },
        {
          id: 'bivariada-q04',
          tipo: 'escolha',
          enunciado: 'Com a reta $y = -2x + 30$ dos carros (idades de 2 a 8 anos), alguém estima o preço de um carro com 20 anos e obtém $-10$ mil euros. Qual é o erro?',
          opcoes: [
            'Extrapolou: 20 anos está fora do intervalo dos dados, onde a reta não é válida.',
            'Enganou-se nas contas: $-2 \\times 20 + 30 = 10$.',
            'Devia ter usado a reta de $x$ sobre $y$.',
            'Não há erro: os carros muito velhos têm preço negativo.',
          ],
          correta: 0,
          explicacao: 'As contas estão certas ($-40 + 30 = -10$), mas a reta só descreve os dados entre 2 e 8 anos; fora disso a relação não tem de ser linear.',
        },
        {
          id: 'bivariada-q05',
          tipo: 'vf',
          enunciado: 'Se há uma correlação positiva forte entre o número de bombeiros num incêndio e os prejuízos causados, então são os bombeiros que causam os prejuízos.',
          correta: false,
          explicacao: 'Correlação não é causalidade: a dimensão do incêndio é uma variável perturbadora que faz aumentar as duas.',
        },
        {
          id: 'bivariada-q06',
          tipo: 'vf',
          enunciado: 'Se $r \\approx 0$, as duas variáveis não têm qualquer relação.',
          correta: false,
          explicacao: '$r$ só mede associação linear: os pontos podem formar, por exemplo, uma parábola, com $r \\approx 0$ e uma relação forte (não linear).',
        },
      ],
    },
  ],
});
