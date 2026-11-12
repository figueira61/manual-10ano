globalThis.Manual = globalThis.Manual || {};

Manual.registarTema('mat-a', {
  id: 'funcoes',
  titulo: 'Funções',
  subtemas: [
    // ------------------------------------------------------------------
    {
      id: 'generalidades',
      titulo: 'Generalidades acerca de funções',
      ae: [
        'Analisar elementos da evolução histórica do conceito de função e as diversas formas de representação: diagramas, tabelas, gráficos e expressões analíticas.',
        'Identificar domínio, conjunto de chegada, contradomínio, objeto e imagem de uma função em contextos históricos, de modelação, ou abstratos, com recurso a vários tipos de representações (tabelas, gráficos e expressões analíticas).',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'texto',
          texto: 'A ideia de função é antiga: os babilónios usavam tabelas de quadrados e de cubos e Ptolomeu construiu tabelas trigonométricas para a astronomia. Galileu estudou o lançamento de projéteis relacionando a posição com o tempo.',
        },
        {
          tipo: 'texto',
          texto: 'A palavra **função** surge com Leibniz, no final do século XVII, e a notação $f(x)$ com Euler, em 1734. No século XIX, Dirichlet deu a definição geral: uma correspondência que a cada valor de uma variável associa um único valor de outra.',
        },
        {
          tipo: 'definicao',
          texto: 'Uma **função** $f$ de $A$ em $B$ é uma correspondência que a **cada** elemento $x$ de $A$ associa **um único** elemento de $B$, representado por $f(x)$. $x$ é um **objeto** e $f(x)$ é a sua **imagem**.',
        },
        {
          tipo: 'definicao',
          texto: '$A$ é o **domínio** ($D_f$) e $B$ é o **conjunto de chegada**. O **contradomínio** ($D\'_f$) é o conjunto das imagens: $D\'_f = \\{f(x) : x \\in D_f\\}$, que está contido em $B$. Em $y = f(x)$, $x$ é a **variável independente** e $y$ a **variável dependente**.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Representação', 'Exemplo para $f(x) = x^2 + 1$, com $D_f = \\{-2, -1, 0, 1, 2\\}$'],
          linhas: [
            ['Diagrama de setas', 'Setas de $-2 \\to 5$, $-1 \\to 2$, $0 \\to 1$, $1 \\to 2$, $2 \\to 5$.'],
            ['Tabela', '$x$: $-2, -1, 0, 1, 2$ · $f(x)$: $5, 2, 1, 2, 5$'],
            ['Gráfico', 'Pontos $(-2, 5)$, $(-1, 2)$, $(0, 1)$, $(1, 2)$, $(2, 5)$.'],
            ['Expressão analítica', '$f(x) = x^2 + 1$'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Considera $f: \\{-2, -1, 0, 1, 2\\} \\to \\{0, 1, 2, 3, 4, 5\\}$, com $f(x) = x^2 + 1$. Indica o domínio, o conjunto de chegada e o contradomínio, calcula $f(-1)$ e indica os objetos cuja imagem é 5.',
          resolucao: [
            'Domínio: $D_f = \\{-2, -1, 0, 1, 2\\}$; conjunto de chegada: $\\{0, 1, 2, 3, 4, 5\\}$.',
            'Imagens: $f(-2) = 5$, $f(-1) = 2$, $f(0) = 1$, $f(1) = 2$, $f(2) = 5$.',
            'Contradomínio: $D\'_f = \\{1, 2, 5\\}$ (não inclui 0, 3 nem 4, que não são imagem de nenhum objeto).',
            '$f(-1) = (-1)^2 + 1 = 2$. Objetos com imagem 5: $-2$ e $2$.',
          ],
          resultado: 2,
          verificar: () => (-1) ** 2 + 1,
        },
        {
          tipo: 'exemplo',
          enunciado: 'Um táxi cobra 3,25 € de bandeirada e 0,50 € por quilómetro. Numa viagem de 0 a 40 km, o preço é $P(d) = 3{,}25 + 0{,}5d$. Identifica as variáveis, calcula $P(12)$ e o contradomínio.',
          resolucao: [
            'Variável independente: a distância $d$ (km). Variável dependente: o preço $P$ (€). Domínio: $[0, 40]$.',
            '$P(12) = 3{,}25 + 0{,}5 \\times 12 = 3{,}25 + 6 = 9{,}25$ €.',
            'O preço aumenta com $d$: $P(0) = 3{,}25$ e $P(40) = 3{,}25 + 20 = 23{,}25$.',
            'Contradomínio: $[3{,}25;\\ 23{,}25]$.',
          ],
          resultado: 9.25,
          verificar: () => 3.25 + 0.5 * 12,
        },
        {
          tipo: 'erro-frequente',
          texto: 'Não confundas **conjunto de chegada** com **contradomínio**: o contradomínio só tem os valores que são mesmo imagem de algum objeto. E se um objeto tiver duas imagens, a correspondência **não** é uma função (num gráfico: uma reta vertical não pode cortá-lo em dois pontos).',
        },
      ],
      resumo: [
        'Função: a cada objeto do domínio corresponde uma única imagem.',
        'Domínio $D_f$ (objetos), conjunto de chegada $B$, contradomínio $D\'_f$ (imagens), com $D\'_f \\subseteq B$.',
        'Representações: diagrama de setas, tabela, gráfico e expressão analítica.',
        'Em $y = f(x)$: $x$ é a variável independente, $y$ a variável dependente.',
        'História: tabelas antigas, Galileu (projéteis), Leibniz (palavra), Euler ($f(x)$), Dirichlet (definição geral).',
      ],
      quiz: [
        {
          tipo: 'escolha',
          enunciado: 'Qual das correspondências de $A = \\{1, 2, 3\\}$ em $B = \\{4, 5, 6\\}$, dadas pelos pares (objeto, imagem), **não** é uma função?',
          opcoes: [
            '$\\{(1, 4), (2, 5), (3, 6)\\}$',
            '$\\{(1, 4), (2, 4), (3, 4)\\}$',
            '$\\{(1, 4), (1, 5), (2, 6), (3, 6)\\}$',
            '$\\{(1, 6), (2, 5), (3, 4)\\}$',
          ],
          correta: 2,
          explicacao: 'O objeto 1 tem duas imagens (4 e 5), logo não é função. Objetos diferentes com a mesma imagem (segunda opção) são permitidos.',
        },
        {
          tipo: 'vf',
          enunciado: 'O contradomínio de uma função é sempre igual ao conjunto de chegada.',
          correta: false,
          explicacao: 'O contradomínio é o conjunto das imagens e está contido no conjunto de chegada, mas pode ser menor.',
        },
        {
          tipo: 'numerica',
          enunciado: 'Seja $g(x) = 3 - 2x$. Calcula $g(-4)$.',
          resposta: 11,
          tolerancia: 0,
          resolucao: [
            '$g(-4) = 3 - 2 \\times (-4)$',
            '$= 3 + 8 = 11$',
          ],
          verificar: () => 3 - 2 * -4,
        },
        {
          tipo: 'numerica',
          enunciado: 'A função $h$, de domínio $\\{-2, -1, 0, 1, 2\\}$, é definida por $h(x) = x^2 - 3$. Quantos elementos tem o contradomínio de $h$?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            'Imagens: $h(-2) = 1$, $h(-1) = -2$, $h(0) = -3$, $h(1) = -2$, $h(2) = 1$.',
            'Sem repetições: $D\'_h = \\{-3, -2, 1\\}$, com 3 elementos.',
          ],
          verificar: () => new Set([-2, -1, 0, 1, 2].map((x) => x * x - 3)).size,
        },
        {
          tipo: 'escolha',
          enunciado: 'A temperatura $T$ (°C) de um forno, $t$ minutos depois de ligado, é dada por $T(t) = 20 + 15t$, para $0 \\leq t \\leq 12$. Qual é a variável dependente?',
          opcoes: ['O tempo $t$.', 'A temperatura $T$.', 'O número 15.', 'O intervalo $[0, 12]$.'],
          correta: 1,
          explicacao: 'A temperatura depende do tempo decorrido: $t$ é a variável independente e $T$ a dependente. $[0, 12]$ é o domínio.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'afim',
      titulo: 'Função afim',
      ae: [
        'Estudar gráfica e analiticamente a função afim em termos de zeros, sinal e monotonia.',
        'Determinar expressões analíticas de funções representadas graficamente.',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Uma **função afim** é definida por $f(x) = mx + b$, com $m$ e $b$ reais e domínio $\\mathbb{R}$. O gráfico é uma reta de **declive** $m$ e **ordenada na origem** $b$ (corta o eixo $Oy$ em $(0, b)$).',
        },
        {
          tipo: 'texto',
          texto: '**Monotonia:** se $m > 0$, $f$ é crescente; se $m < 0$, é decrescente; se $m = 0$, é constante ($f(x) = b$). Se $b = 0$, a função diz-se **linear** e a reta passa na origem.',
        },
        {
          tipo: 'formula',
          texto: 'Se $m \\neq 0$, o **zero** é $x = -\\dfrac{b}{m}$. O **sinal** muda no zero: com $m > 0$, $f(x) < 0$ à esquerda e $f(x) > 0$ à direita; com $m < 0$, é ao contrário. Declive a partir de dois pontos: $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Estuda a função $f(x) = -2x + 6$ quanto a zeros, sinal e monotonia.',
          resolucao: [
            'Zero: $-2x + 6 = 0 \\Leftrightarrow -2x = -6 \\Leftrightarrow x = 3$.',
            'Monotonia: $m = -2 < 0$, logo $f$ é decrescente em $\\mathbb{R}$.',
            'Sinal: sendo decrescente, é positiva antes do zero e negativa depois. $f(x) > 0$ em $]-\\infty, 3[$; $f(x) < 0$ em $]3, +\\infty[$.',
            'Confirmação: $f(0) = 6 > 0$ e $f(5) = -4 < 0$.',
          ],
          resultado: 3,
          verificar: () => Manual.calc.funcoes.afim(-2, 6).zero,
        },
        {
          tipo: 'quadro',
          cabecalho: ['$x$', '$]-\\infty, 3[$', '$3$', '$]3, +\\infty[$'],
          linhas: [
            ['Sinal de $f(x) = -2x + 6$', '$+$', '$0$', '$-$'],
            ['Monotonia', 'decrescente', '', 'decrescente'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Uma reta passa nos pontos $(0, -1)$ e $(2, 3)$. Determina a expressão analítica da função afim representada e o seu zero.',
          resolucao: [
            'Declive: $m = \\dfrac{3 - (-1)}{2 - 0} = \\dfrac{4}{2} = 2$.',
            'O ponto $(0, -1)$ está no eixo $Oy$: $b = -1$. Logo $f(x) = 2x - 1$.',
            'Zero: $2x - 1 = 0 \\Leftrightarrow x = \\dfrac{1}{2} = 0{,}5$.',
          ],
          resultado: 0.5,
          verificar: () => Manual.calc.funcoes.afim(2, -1).zero,
        },
        {
          tipo: 'esquema',
          id: 'afim',
          opcoes: { m: -2, b: 6 },
          legenda: 'Experimenta: muda o sinal de m e vê a monotonia e o sinal trocarem de lado em relação ao zero; depois põe m = 0 para obteres uma função constante, sem zero quando b ≠ 0.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'O declive é o coeficiente de $x$, não o termo isolado: em $f(x) = 3 - x$ o declive é $-1$ (a função é decrescente) e a ordenada na origem é $3$. Escreve primeiro na forma $mx + b$: $f(x) = -x + 3$.',
        },
      ],
      resumo: [
        '$f(x) = mx + b$: reta de declive $m$ e ordenada na origem $b$.',
        '$m > 0$ crescente; $m < 0$ decrescente; $m = 0$ constante.',
        'Zero: $x = -\\dfrac{b}{m}$ (se $m \\neq 0$); o sinal muda no zero.',
        'Declive por dois pontos: $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$.',
        'Sinal num quadro: intervalos de $x$ separados pelo zero.',
      ],
      quiz: [
        {
          tipo: 'numerica',
          enunciado: 'Determina o zero de $f(x) = 3x + 4{,}5$.',
          resposta: -1.5,
          tolerancia: 0,
          resolucao: [
            '$3x + 4{,}5 = 0$',
            '$3x = -4{,}5$',
            '$x = -\\dfrac{4{,}5}{3} = -1{,}5$',
          ],
          verificar: () => Manual.calc.funcoes.afim(3, 4.5).zero,
        },
        {
          tipo: 'numerica',
          enunciado: 'Um depósito tem 60 L de água e perde 4 L por hora: $V(t) = 60 - 4t$. Ao fim de quantas horas fica vazio?',
          resposta: 15,
          tolerancia: 0,
          unidade: 'h',
          resolucao: [
            'Fica vazio quando $V(t) = 0$: $60 - 4t = 0$.',
            '$4t = 60 \\Leftrightarrow t = 15$ horas.',
          ],
          verificar: () => Manual.calc.funcoes.afim(-4, 60).zero,
        },
        {
          tipo: 'vf',
          enunciado: 'A função $f(x) = 4 - 2x$ é crescente.',
          correta: false,
          explicacao: 'Na forma $mx + b$ fica $f(x) = -2x + 4$: o declive é $-2 < 0$, logo é decrescente.',
        },
        {
          tipo: 'escolha',
          enunciado: 'Em que conjunto é $f(x) = 2x - 8$ positiva?',
          opcoes: ['$]-\\infty, 4[$', '$]4, +\\infty[$', '$]-\\infty, -4[$', '$]-4, +\\infty[$'],
          correta: 1,
          explicacao: 'O zero é $x = 4$ e, como $m = 2 > 0$, a função é crescente: positiva à direita do zero.',
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é a expressão da reta que passa em $(0, 5)$ e $(1, 2)$?',
          opcoes: ['$y = 3x + 5$', '$y = -3x + 2$', '$y = -3x + 5$', '$y = 5x - 3$'],
          correta: 2,
          explicacao: '$m = \\dfrac{2 - 5}{1 - 0} = -3$ e $b = 5$ (ponto no eixo $Oy$): $y = -3x + 5$.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'quadratica',
      titulo: 'Função quadrática',
      ae: [
        'Estudar famílias de funções quadráticas relativamente ao sentido das concavidades do seu gráfico, eixo de simetria, contradomínio, zeros, sinal, monotonia e extremos, gráfica e analiticamente.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Uma **função quadrática** é definida por $f(x) = ax^2 + bx + c$, com $a \\neq 0$ e domínio $\\mathbb{R}$. O gráfico é uma **parábola**, curva já estudada na Grécia antiga (o nome vem de Apolónio); Galileu mostrou que é a trajetória de um projétil.',
        },
        {
          tipo: 'formula',
          texto: 'Vértice $V(h, k)$: $h = -\\dfrac{b}{2a}$ e $k = f(h)$. Eixo de simetria: a reta $x = h$. Forma canónica: $f(x) = a(x - h)^2 + k$. Binómio discriminante: $\\Delta = b^2 - 4ac$.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['', '$a > 0$ (concavidade para cima)', '$a < 0$ (concavidade para baixo)'],
          linhas: [
            ['Extremo', 'mínimo $k$, em $x = h$', 'máximo $k$, em $x = h$'],
            ['Contradomínio', '$[k, +\\infty[$', '$]-\\infty, k]$'],
            ['Monotonia', 'decrescente em $]-\\infty, h]$, crescente em $[h, +\\infty[$', 'crescente em $]-\\infty, h]$, decrescente em $[h, +\\infty[$'],
          ],
        },
        {
          tipo: 'quadro',
          cabecalho: ['$\\Delta$', 'Zeros', 'Sinal (para $a > 0$)'],
          linhas: [
            ['$\\Delta > 0$', 'dois zeros $x_1 < x_2$', 'positiva fora de $[x_1, x_2]$, negativa em $]x_1, x_2[$'],
            ['$\\Delta = 0$', 'um zero, $x = h$ (o vértice está em $Ox$)', 'positiva em $\\mathbb{R} \\setminus \\{h\\}$'],
            ['$\\Delta < 0$', 'nenhum zero', 'positiva em $\\mathbb{R}$'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Para $a < 0$, o sinal inverte-se: entre os zeros a função é positiva e fora deles é negativa (sem zeros, é negativa em $\\mathbb{R}$). Basta esboçares a parábola para leres o sinal.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Estuda $f(x) = x^2 - 2x - 3$: concavidade, vértice, eixo, zeros, sinal, monotonia, extremo e contradomínio.',
          resolucao: [
            '$a = 1 > 0$: concavidade voltada para cima.',
            '$h = -\\dfrac{-2}{2 \\times 1} = 1$; $k = f(1) = 1 - 2 - 3 = -4$. Vértice $V(1, -4)$; eixo $x = 1$.',
            '$\\Delta = (-2)^2 - 4 \\times 1 \\times (-3) = 4 + 12 = 16$; zeros: $x = \\dfrac{2 \\pm 4}{2}$, ou seja, $x = -1$ ou $x = 3$.',
            'Sinal: $f(x) > 0$ em $]-\\infty, -1[ \\cup ]3, +\\infty[$; $f(x) < 0$ em $]-1, 3[$.',
            'Decrescente em $]-\\infty, 1]$, crescente em $[1, +\\infty[$; mínimo $-4$ em $x = 1$; $D\'_f = [-4, +\\infty[$.',
          ],
          resultado: -4,
          verificar: () => Manual.calc.funcoes.quadratica(1, -2, -3).extremo.valor,
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina o máximo e o contradomínio de $g(x) = -2x^2 + 8x - 6$.',
          resolucao: [
            '$a = -2 < 0$: concavidade para baixo, logo há máximo no vértice.',
            '$h = -\\dfrac{8}{2 \\times (-2)} = 2$; $k = g(2) = -8 + 16 - 6 = 2$.',
            'Máximo: $2$, em $x = 2$. Contradomínio: $]-\\infty, 2]$.',
          ],
          resultado: 2,
          verificar: () => Manual.calc.funcoes.quadratica(-2, 8, -6).extremo.valor,
        },
        {
          tipo: 'esquema',
          id: 'parabola',
          opcoes: { a: 1, h: 1, k: -4, mostrarBase: false },
          legenda: 'Experimenta: muda o sinal de a e vê a concavidade, o extremo e o contradomínio trocarem; depois sobe k até a parábola deixar de cortar o eixo Ox (Δ < 0, sem zeros).',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Cuidado com o sinal em $h = -\\dfrac{b}{2a}$: em $f(x) = x^2 - 4x + 1$ tem-se $h = -\\dfrac{-4}{2} = 2$, não $-2$. E o contradomínio depende de $k$ (a ordenada do vértice), não de $c$.',
        },
      ],
      resumo: [
        '$f(x) = ax^2 + bx + c$ ($a \\neq 0$): parábola; $a > 0$ concavidade para cima, $a < 0$ para baixo.',
        'Vértice: $h = -\\dfrac{b}{2a}$, $k = f(h)$; eixo de simetria $x = h$.',
        '$\\Delta = b^2 - 4ac$: dois, um ou nenhum zero conforme $\\Delta > 0$, $= 0$ ou $< 0$.',
        'Extremo $k$ (mínimo se $a > 0$, máximo se $a < 0$); contradomínio $[k, +\\infty[$ ou $]-\\infty, k]$.',
        'A monotonia muda no vértice; o sinal lê-se num esboço da parábola.',
      ],
      quiz: [
        {
          tipo: 'numerica',
          enunciado: 'Calcula o binómio discriminante de $f(x) = 2x^2 - 3x - 2$.',
          resposta: 25,
          tolerancia: 0,
          resolucao: [
            '$\\Delta = b^2 - 4ac = (-3)^2 - 4 \\times 2 \\times (-2)$',
            '$= 9 + 16 = 25$',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(2, -3, -2).delta,
        },
        {
          tipo: 'numerica',
          enunciado: 'Qual é a ordenada do vértice da parábola $y = x^2 + 6x + 5$?',
          resposta: -4,
          tolerancia: 0,
          resolucao: [
            '$h = -\\dfrac{6}{2 \\times 1} = -3$.',
            '$k = (-3)^2 + 6 \\times (-3) + 5 = 9 - 18 + 5 = -4$.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(1, 6, 5).vertice[1],
        },
        {
          tipo: 'numerica',
          enunciado: 'Qual é o maior zero de $f(x) = x^2 - x - 6$?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            '$\\Delta = (-1)^2 - 4 \\times 1 \\times (-6) = 1 + 24 = 25$.',
            '$x = \\dfrac{1 \\pm 5}{2}$: $x = -2$ ou $x = 3$. O maior é $3$.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(1, -1, -6).zeros[1],
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é o contradomínio de $f(x) = -x^2 + 4x - 1$?',
          opcoes: ['$[3, +\\infty[$', '$]-\\infty, -1]$', '$]-\\infty, 3]$', '$\\mathbb{R}$'],
          correta: 2,
          explicacao: '$a = -1 < 0$ (máximo). $h = -\\dfrac{4}{-2} = 2$, $k = -4 + 8 - 1 = 3$. Contradomínio: $]-\\infty, 3]$.',
        },
        {
          tipo: 'vf',
          enunciado: 'Se $a > 0$ e $\\Delta < 0$, então $f(x) = ax^2 + bx + c$ é positiva para todo o $x$ real.',
          correta: true,
          explicacao: 'A parábola tem concavidade para cima e não corta o eixo $Ox$, logo fica toda acima dele.',
        },
        {
          tipo: 'escolha',
          enunciado: 'Em que intervalo é crescente $f(x) = (x - 1)^2 + 2$?',
          opcoes: ['$]-\\infty, 1]$', '$[1, +\\infty[$', '$[2, +\\infty[$', '$]-\\infty, 2]$'],
          correta: 1,
          explicacao: 'Vértice $(1, 2)$ e $a = 1 > 0$: decresce até $x = 1$ e cresce a partir daí.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'transformacoes',
      titulo: 'Transformações do gráfico de y = x²',
      ae: [
        'Interpretar e prever as alterações no gráfico de uma função f(x − a), f(x) + b, c . f(x), com a, b e c números reais, c não nulo, a partir do gráfico da função de domínio ℝ, definida por f(x) = x², e descrever o resultado com recurso à linguagem das transformações geométricas.',
        'Determinar expressões analíticas de funções representadas graficamente.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Parte do gráfico de $f(x) = x^2$, de vértice $(0, 0)$. Aqui usamos $h$, $k$ e $a$ (nas AE: $a$, $b$ e $c$), as mesmas letras da forma canónica $a(x - h)^2 + k$.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Nova função', 'Transformação do gráfico de $f$'],
          linhas: [
            ['$f(x - h)$', 'translação de vetor $(h, 0)$: para a direita se $h > 0$, para a esquerda se $h < 0$'],
            ['$f(x) + k$', 'translação de vetor $(0, k)$: para cima se $k > 0$, para baixo se $k < 0$'],
            ['$a \\cdot f(x)$, $|a| > 1$', 'dilatação vertical de coeficiente $|a|$ (o gráfico "estica" na vertical)'],
            ['$a \\cdot f(x)$, $0 < |a| < 1$', 'contração vertical de coeficiente $|a|$ (o gráfico "encolhe" na vertical)'],
            ['$a \\cdot f(x)$, $a < 0$', 'reflexão no eixo $Ox$ (e dilatação ou contração de coeficiente $|a|$)'],
          ],
        },
        {
          tipo: 'formula',
          texto: '$y = a(x - h)^2 + k$ obtém-se de $y = x^2$ aplicando primeiro $a \\cdot f(x)$ (obtém-se $y = ax^2$) e depois a **translação de vetor** $(h, k)$. O vértice passa de $(0, 0)$ para $(h, k)$. Estas regras valem para qualquer função $f$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Descreve como se obtém o gráfico de $g(x) = -2(x + 1)^2 + 3$ a partir do de $f(x) = x^2$ e escreve $g(x)$ na forma $ax^2 + bx + c$.',
          resolucao: [
            '$a = -2$: reflexão no eixo $Ox$ e dilatação vertical de coeficiente 2, obtendo $y = -2x^2$.',
            '$x + 1 = x - (-1)$, logo $h = -1$; $k = 3$: translação de vetor $(-1, 3)$. Vértice $(-1, 3)$, máximo 3, $D\'_g = ]-\\infty, 3]$.',
            'Forma geral: $-2(x^2 + 2x + 1) + 3 = -2x^2 - 4x - 2 + 3 = -2x^2 - 4x + 1$.',
          ],
          resultado: 1,
          verificar: () => Manual.calc.funcoes.canonicaParaGeral(-2, -1, 3).c,
        },
        {
          tipo: 'exemplo',
          enunciado: 'Uma parábola tem vértice $(2, -1)$ e passa no ponto $(0, 3)$. Determina a sua expressão analítica.',
          resolucao: [
            'Com o vértice: $y = a(x - 2)^2 - 1$.',
            'O ponto $(0, 3)$ verifica a equação: $3 = a(0 - 2)^2 - 1 \\Leftrightarrow 4a = 4 \\Leftrightarrow a = 1$.',
            'Logo $y = (x - 2)^2 - 1$, ou seja, $y = x^2 - 4x + 3$.',
          ],
          resultado: 1,
          verificar: () => (3 - -1) / (0 - 2) ** 2,
        },
        {
          tipo: 'esquema',
          id: 'parabola',
          opcoes: { a: -2, h: -1, k: 3, mostrarBase: true },
          legenda: 'Experimenta: com y = x² visível, mexe só em h e confirma que a parábola desliza na horizontal (h > 0 para a direita); depois põe a entre 0 e 1 para veres a contração vertical, e a < 0 para a reflexão no eixo Ox.',
        },
        {
          tipo: 'erro-frequente',
          texto: '$f(x - 3)$ desloca o gráfico 3 unidades para a **direita**, não para a esquerda: o ponto que antes estava em $x = 0$ está agora em $x = 3$. Do mesmo modo, $(x + 2)^2 = (x - (-2))^2$ corresponde a $h = -2$ (para a esquerda).',
        },
      ],
      resumo: [
        '$f(x - h)$: translação de vetor $(h, 0)$; $f(x) + k$: translação de vetor $(0, k)$.',
        '$a \\cdot f(x)$: dilatação vertical se $|a| > 1$, contração vertical se $0 < |a| < 1$.',
        '$a < 0$: também reflexão no eixo $Ox$.',
        '$y = a(x - h)^2 + k$: de $y = ax^2$ por translação de vetor $(h, k)$; vértice $(h, k)$.',
        'Expressão a partir do gráfico: usa o vértice e mais um ponto para obter $a$.',
      ],
      quiz: [
        {
          tipo: 'escolha',
          enunciado: 'O gráfico de $g(x) = (x - 4)^2$ obtém-se do de $f(x) = x^2$ por:',
          opcoes: [
            'translação de vetor $(-4, 0)$',
            'translação de vetor $(0, 4)$',
            'translação de vetor $(4, 0)$',
            'dilatação vertical de coeficiente 4',
          ],
          correta: 2,
          explicacao: '$g(x) = f(x - 4)$, com $h = 4$: translação de vetor $(4, 0)$, para a direita.',
        },
        {
          tipo: 'vf',
          enunciado: 'O gráfico de $y = 0{,}5x^2$ obtém-se do de $y = x^2$ por uma dilatação vertical.',
          correta: false,
          explicacao: 'Como $0 < 0{,}5 < 1$, é uma contração vertical de coeficiente $0{,}5$.',
        },
        {
          tipo: 'numerica',
          enunciado: 'Qual é a abcissa do vértice da parábola $y = (x + 3)^2 + 1$?',
          resposta: -3,
          tolerancia: 0,
          resolucao: [
            '$(x + 3)^2 = (x - (-3))^2$, logo $h = -3$.',
            'Vértice $(-3, 1)$: abcissa $-3$.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(1, 6, 10).vertice[0],
        },
        {
          tipo: 'numerica',
          enunciado: 'Escreve $g(x) = 2(x - 1)^2 - 8$ na forma $ax^2 + bx + c$. Qual é o valor de $c$?',
          resposta: -6,
          tolerancia: 0,
          resolucao: [
            '$2(x^2 - 2x + 1) - 8 = 2x^2 - 4x + 2 - 8$',
            '$= 2x^2 - 4x - 6$, logo $c = -6$.',
          ],
          verificar: () => Manual.calc.funcoes.canonicaParaGeral(2, 1, -8).c,
        },
        {
          tipo: 'numerica',
          enunciado: 'Uma parábola tem vértice $(1, 2)$ e passa em $(3, -6)$. Na forma $y = a(x - 1)^2 + 2$, qual é o valor de $a$?',
          resposta: -2,
          tolerancia: 0,
          resolucao: [
            '$-6 = a(3 - 1)^2 + 2 \\Leftrightarrow -6 = 4a + 2$',
            '$4a = -8 \\Leftrightarrow a = -2$',
          ],
          verificar: () => (-6 - 2) / (3 - 1) ** 2,
        },
        {
          tipo: 'escolha',
          enunciado: 'Que transformação leva o gráfico de $y = x^2$ no de $y = -x^2$?',
          opcoes: ['Reflexão no eixo $Ox$', 'Reflexão no eixo $Oy$', 'Translação de vetor $(0, -1)$', 'Contração vertical'],
          correta: 0,
          explicacao: 'Multiplicar por $-1$ troca o sinal de cada imagem: cada ponto $(x, y)$ passa a $(x, -y)$, uma reflexão no eixo $Ox$.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'equacoes-inequacoes',
      titulo: 'Equações e inequações do 2.º grau',
      ae: ['Resolver equações e inequações do 2.º grau, em contextos de resolução de problemas.'],
      minutos: 8,
      essencial: [
        {
          tipo: 'formula',
          texto: '**Fórmula resolvente.** Se $a \\neq 0$: $ax^2 + bx + c = 0 \\Leftrightarrow x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, com $\\Delta = b^2 - 4ac$. Há duas soluções se $\\Delta > 0$, uma se $\\Delta = 0$ e nenhuma se $\\Delta < 0$.',
        },
        {
          tipo: 'texto',
          texto: '**De onde vem.** Divide por $a$ e completa o quadrado: $x^2 + \\dfrac{b}{a}x = -\\dfrac{c}{a} \\Leftrightarrow \\left(x + \\dfrac{b}{2a}\\right)^2 = \\dfrac{b^2 - 4ac}{4a^2}$. Se $\\Delta \\geq 0$, extrai a raiz: $x + \\dfrac{b}{2a} = \\pm\\dfrac{\\sqrt{\\Delta}}{2a}$.',
        },
        {
          tipo: 'texto',
          texto: '**Equações incompletas** resolvem-se mais depressa: se $c = 0$, fatoriza, $x(ax + b) = 0 \\Leftrightarrow x = 0 \\lor x = -\\dfrac{b}{a}$ (lei do anulamento do produto); se $b = 0$, isola $x^2$, por exemplo $x^2 = 9 \\Leftrightarrow x = -3 \\lor x = 3$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Resolve a equação $2x^2 + x - 3 = 0$.',
          resolucao: [
            '$a = 2$, $b = 1$, $c = -3$; $\\Delta = 1^2 - 4 \\times 2 \\times (-3) = 1 + 24 = 25$.',
            '$x = \\dfrac{-1 \\pm \\sqrt{25}}{2 \\times 2} = \\dfrac{-1 \\pm 5}{4}$.',
            '$x = \\dfrac{-6}{4} = -1{,}5$ ou $x = \\dfrac{4}{4} = 1$. C.S. $= \\{-1{,}5;\\ 1\\}$.',
          ],
          resultado: 1,
          verificar: () => Manual.calc.funcoes.quadratica(2, 1, -3).zeros[1],
        },
        {
          tipo: 'texto',
          texto: 'O programa em Python das AE aplica a fórmula resolvente. Com $a = 2$, $b = 1$ e $c = -3$ (o exemplo acima), escreve as duas soluções, $-1{,}5$ e $1$.',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'from math import sqrt',
            'a=2',
            'b=1',
            'c=-3',
            'delta=b**2-4*a*c',
            'if delta<0:',
            '    print("Não tem soluções")',
            'elif delta==0:',
            '    x1=(-b)/(2*a)',
            "    print('Tem só uma solução: ',x1)",
            'else:',
            '    x1=(-b-sqrt(delta))/(2*a)',
            '    x2=(-b+sqrt(delta))/(2*a)',
            "    print('Tem 2 soluções: ',x1,' e ',x2)",
          ].join('\n'),
        },
        {
          tipo: 'texto',
          texto: '**Inequações do 2.º grau** ($ax^2 + bx + c > 0$, $< 0$, $\\geq 0$ ou $\\leq 0$): (1) calcula os zeros; (2) esboça a parábola com a concavidade dada pelo sinal de $a$; (3) lê no esboço onde está acima ou abaixo do eixo $Ox$ e escreve o resultado em intervalos.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Resolve $-x^2 + x + 6 < 0$.',
          resolucao: [
            'Zeros: $-x^2 + x + 6 = 0$; $\\Delta = 1 + 24 = 25$; $x = \\dfrac{-1 \\pm 5}{-2}$, ou seja, $x = -2$ ou $x = 3$.',
            '$a = -1 < 0$: parábola com concavidade para baixo, acima de $Ox$ entre os zeros e abaixo fora deles.',
            'Queremos onde é negativa: C.S. $= ]-\\infty, -2[ \\cup ]3, +\\infty[$.',
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'A altura (m) de uma bola lançada na vertical é $h(t) = -5t^2 + 20t$, com $t$ em segundos. Durante quanto tempo está a mais de 15 m de altura?',
          resolucao: [
            '$-5t^2 + 20t > 15 \\Leftrightarrow -5t^2 + 20t - 15 > 0$.',
            'Zeros: dividindo por $-5$, $t^2 - 4t + 3 = 0$; $\\Delta = 16 - 12 = 4$; $t = \\dfrac{4 \\pm 2}{2}$, ou seja, $t = 1$ ou $t = 3$.',
            '$a = -5 < 0$: a expressão é positiva entre os zeros. C.S. $= ]1, 3[$.',
            'Está acima de 15 m durante $3 - 1 = 2$ segundos.',
          ],
          resultado: 2,
          verificar: () => {
            const i = Manual.calc.funcoes.inequacao2(-5, 20, -15, '>').intervalos[0];
            return i.ate - i.de;
          },
        },
        {
          tipo: 'esquema',
          id: 'parabola',
          opcoes: { a: 1, h: 1, k: -4, mostrarBase: false },
          legenda: 'Experimenta: esta é y = x² − 2x − 3; a parte abaixo do eixo Ox, entre os zeros −1 e 3, é a solução de x² − 2x − 3 < 0, ou seja, ]−1, 3[. Sobe k e vê o intervalo encolher até desaparecer.',
        },
        {
          tipo: 'erro-frequente',
          texto: '$x^2 > 4$ não é só $x > 2$: os zeros de $x^2 - 4$ são $-2$ e $2$ e a parábola é positiva fora deles, logo C.S. $= ]-\\infty, -2[ \\cup ]2, +\\infty[$. E ao dividir uma inequação por um número negativo, troca o sentido da desigualdade.',
        },
      ],
      resumo: [
        'Resolvente: $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, com $\\Delta = b^2 - 4ac$.',
        '$\\Delta > 0$: duas soluções; $\\Delta = 0$: uma; $\\Delta < 0$: nenhuma.',
        'Incompletas: fatorizar ($c = 0$) ou isolar $x^2$ ($b = 0$).',
        'Inequações: zeros → esboço da parábola (sinal de $a$) → intervalos.',
        'Em contexto, confirma se as soluções fazem sentido (tempo, comprimentos positivos…).',
      ],
      quiz: [
        {
          tipo: 'numerica',
          enunciado: 'Qual é a maior solução de $x^2 - 5x + 6 = 0$?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            '$\\Delta = 25 - 24 = 1$.',
            '$x = \\dfrac{5 \\pm 1}{2}$: $x = 2$ ou $x = 3$. A maior é $3$.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(1, -5, 6).zeros[1],
        },
        {
          tipo: 'numerica',
          enunciado: 'Um retângulo tem 20 cm de perímetro e 21 cm² de área. Quanto mede o lado menor?',
          resposta: 3,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            'Se um lado mede $x$, o outro mede $10 - x$ (semiperímetro 10).',
            '$x(10 - x) = 21 \\Leftrightarrow x^2 - 10x + 21 = 0$; $\\Delta = 100 - 84 = 16$.',
            '$x = \\dfrac{10 \\pm 4}{2}$: $x = 3$ ou $x = 7$. Os lados são 3 cm e 7 cm; o menor mede 3 cm.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(1, -10, 21).zeros[0],
        },
        {
          tipo: 'numerica',
          enunciado: 'Calcula o binómio discriminante $\\Delta$ da equação $3x^2 - 6x + 3 = 0$.',
          resposta: 0,
          tolerancia: 0,
          resolucao: [
            '$\\Delta = (-6)^2 - 4 \\times 3 \\times 3 = 36 - 36 = 0$.',
            'Com $\\Delta = 0$ há uma só solução: $x = \\dfrac{6}{6} = 1$.',
          ],
          verificar: () => Manual.calc.funcoes.quadratica(3, -6, 3).delta,
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é o conjunto-solução de $x^2 - 9 \\geq 0$?',
          opcoes: [
            '$[-3, 3]$',
            '$[3, +\\infty[$',
            '$]-\\infty, -3[ \\cup ]3, +\\infty[$',
            '$]-\\infty, -3] \\cup [3, +\\infty[$',
          ],
          correta: 3,
          explicacao: 'Zeros $-3$ e $3$; concavidade para cima, logo $x^2 - 9 \\geq 0$ fora do intervalo entre os zeros, incluindo-os (desigualdade larga).',
        },
        {
          tipo: 'vf',
          enunciado: 'A inequação $x^2 + 1 < 0$ é impossível.',
          correta: true,
          explicacao: '$x^2 \\geq 0$, logo $x^2 + 1 \\geq 1 > 0$ para todo o $x$: não há soluções (C.S. $= \\varnothing$).',
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é o conjunto-solução de $x^2 - 2x - 3 < 0$?',
          opcoes: ['$]-1, 3[$', '$]-3, 1[$', '$]-\\infty, -1[ \\cup ]3, +\\infty[$', '$[-1, 3]$'],
          correta: 0,
          explicacao: 'Zeros $-1$ e $3$; com $a = 1 > 0$, a parábola está abaixo de $Ox$ entre os zeros, que não se incluem (desigualdade estrita).',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'ramos-modulo',
      titulo: 'Funções definidas por ramos e módulo',
      ae: [
        'Estudar gráfica e analiticamente funções definidas por ramos e utilizá-las em contextos de modelação.',
        'Estudar funções definidas por ramos relativamente ao domínio, contradomínio, coordenadas dos pontos de interseção com os eixos coordenados e sinal, em casos simples.',
        'Reconhecer a função módulo como um caso particular de uma função definida por ramos.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Uma **função definida por ramos** usa expressões diferentes em partes diferentes do domínio. Para calcular $f(x)$, vê primeiro a que condição obedece $x$ e só depois usa a expressão desse ramo.',
        },
        {
          tipo: 'texto',
          texto: 'Surgem em muitos contextos: tarifas de estacionamento ou de água, escalões de impostos, um automóvel que acelera, mantém a velocidade e trava. No gráfico, uma bola cheia marca um ponto incluído e uma bola vazia um ponto excluído.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Seja $f(x) = x + 2$ se $x < 0$; $f(x) = x^2$ se $0 \\leq x < 2$; $f(x) = 3$ se $x \\geq 2$. Calcula $f(-3)$, $f(1)$ e $f(2)$ e estuda o contradomínio, os zeros, a interseção com $Oy$ e o sinal.',
          resolucao: [
            '$f(-3) = -3 + 2 = -1$ (1.º ramo); $f(1) = 1^2 = 1$ (2.º ramo); $f(2) = 3$ (3.º ramo, porque $2 \\geq 2$).',
            'Imagens por ramo: $]-\\infty, 2[$, $[0, 4[$ e $\\{3\\}$. Contradomínio: a reunião, $]-\\infty, 4[$. Domínio: $\\mathbb{R}$.',
            'Zeros: $x + 2 = 0 \\Leftrightarrow x = -2$ (serve, $-2 < 0$); $x^2 = 0 \\Leftrightarrow x = 0$ (serve); o 3.º ramo não se anula. Zeros: $-2$ e $0$.',
            'Interseção com $Oy$: $f(0) = 0$, ponto $(0, 0)$. Com $Ox$: $(-2, 0)$ e $(0, 0)$.',
            'Sinal: $f(x) < 0$ em $]-\\infty, -2[$; $f(x) > 0$ em $]-2, 0[ \\cup ]0, +\\infty[$.',
          ],
          resultado: -1,
          verificar: () => Manual.calc.funcoes.avaliarRamos([
            { de: -Infinity, ate: 0, incluiDe: false, incluiAte: false, f: (x) => x + 2 },
            { de: 0, ate: 2, incluiDe: true, incluiAte: false, f: (x) => x * x },
            { de: 2, ate: Infinity, incluiDe: true, incluiAte: false, f: () => 3 },
          ], -3),
        },
        {
          tipo: 'quadro',
          cabecalho: ['$x$', '$]-\\infty, -2[$', '$-2$', '$]-2, 0[$', '$0$', '$]0, +\\infty[$'],
          linhas: [['Sinal de $f(x)$', '$-$', '$0$', '$+$', '$0$', '$+$']],
        },
        {
          tipo: 'esquema',
          id: 'ramos',
          opcoes: { ramos: 'mista' },
          legenda: 'Experimenta: escreve x = 0 e depois x = 2 e confirma, pelas bolas cheias e vazias, que ramo dá a imagem em cada extremo; experimenta também x = −3.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Um aluguer de bicicletas custa 5 € até 2 horas (inclusive) e mais 2 € por cada hora além das 2: $C(t) = 5$ se $0 < t \\leq 2$; $C(t) = 5 + 2(t - 2)$ se $t > 2$. Quanto se paga por 3,5 horas?',
          resolucao: [
            '$3{,}5 > 2$: usa-se o 2.º ramo.',
            '$C(3{,}5) = 5 + 2 \\times (3{,}5 - 2) = 5 + 2 \\times 1{,}5 = 5 + 3 = 8$ €.',
          ],
          resultado: 8,
          verificar: () => Manual.calc.funcoes.avaliarRamos([
            { de: 0, ate: 2, incluiDe: false, incluiAte: true, f: () => 5 },
            { de: 2, ate: Infinity, incluiDe: false, incluiAte: false, f: (t) => 5 + 2 * (t - 2) },
          ], 3.5),
        },
        {
          tipo: 'definicao',
          texto: 'A **função módulo** é a função definida por ramos $|x| = x$ se $x \\geq 0$ e $|x| = -x$ se $x < 0$. $|x|$ é a distância de $x$ a 0: $|-5| = 5$, $|5| = 5$. O gráfico tem forma de V, com vértice $(0, 0)$.',
        },
        {
          tipo: 'texto',
          texto: 'Para $f(x) = |x|$: domínio $\\mathbb{R}$, contradomínio $[0, +\\infty[$, único zero $0$, decrescente em $]-\\infty, 0]$ e crescente em $[0, +\\infty[$. O programa das AE define o módulo com os mesmos dois ramos:',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'def modulo(x):',
            '    if x<0:',
            '        return -x',
            '    else:',
            '        return x',
            '',
            "x=float(input('x = '))",
            "print('A imagem de ',x,' é: ',modulo(x))",
          ].join('\n'),
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve $g(x) = |x - 3|$ sem módulo, por ramos, e calcula $g(1)$.',
          resolucao: [
            'Se $x - 3 \\geq 0$, ou seja, $x \\geq 3$: $g(x) = x - 3$.',
            'Se $x - 3 < 0$, ou seja, $x < 3$: $g(x) = -(x - 3) = -x + 3$.',
            '$1 < 3$: $g(1) = -1 + 3 = 2$ (confirma: $|1 - 3| = |-2| = 2$).',
          ],
          resultado: 2,
          verificar: () => Manual.calc.funcoes.avaliarRamos([
            { de: -Infinity, ate: 3, incluiDe: false, incluiAte: false, f: (x) => -x + 3 },
            { de: 3, ate: Infinity, incluiDe: true, incluiAte: false, f: (x) => x - 3 },
          ], 1),
        },
        {
          tipo: 'esquema',
          id: 'ramos',
          opcoes: { ramos: 'modulo' },
          legenda: 'Experimenta: escreve x = −2 e depois x = 2 e confirma que têm a mesma imagem; depois escolhe o exemplo «Mista» e carrega em «Mostrar |f(x)|»: a parte do gráfico abaixo do eixo Ox reflete-se para cima.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'O ramo escolhe-se pela **condição** sobre $x$, e num extremo só conta o ramo que o inclui: na função do primeiro exemplo, $f(2) = 3$ e não $2^2 = 4$. E $|-x|$ não é $-x$: $|-x| = |x|$, que nunca é negativo.',
        },
      ],
      resumo: [
        'Por ramos: identifica o ramo pela condição sobre $x$ e só depois calcula.',
        'Bola cheia: ponto incluído; bola vazia: ponto excluído.',
        'Contradomínio: reunião das imagens de cada ramo.',
        'Zeros: resolve em cada ramo e verifica se a solução obedece à condição.',
        'Módulo: $|x| = x$ se $x \\geq 0$, $|x| = -x$ se $x < 0$; contradomínio $[0, +\\infty[$.',
      ],
      quiz: [
        {
          tipo: 'numerica',
          enunciado: 'Na função $f(x) = x + 2$ se $x < 0$; $x^2$ se $0 \\leq x < 2$; $3$ se $x \\geq 2$, calcula $f(1{,}5)$.',
          resposta: 2.25,
          tolerancia: 0,
          resolucao: [
            '$0 \\leq 1{,}5 < 2$: 2.º ramo.',
            '$f(1{,}5) = 1{,}5^2 = 2{,}25$',
          ],
          verificar: () => Manual.calc.funcoes.avaliarRamos([
            { de: -Infinity, ate: 0, incluiDe: false, incluiAte: false, f: (x) => x + 2 },
            { de: 0, ate: 2, incluiDe: true, incluiAte: false, f: (x) => x * x },
            { de: 2, ate: Infinity, incluiDe: true, incluiAte: false, f: () => 3 },
          ], 1.5),
        },
        {
          tipo: 'numerica',
          enunciado: 'No aluguer de bicicletas ($C(t) = 5$ se $0 < t \\leq 2$; $C(t) = 5 + 2(t - 2)$ se $t > 2$), quanto se paga por 5 horas?',
          resposta: 11,
          tolerancia: 0,
          unidade: '€',
          resolucao: [
            '$5 > 2$: 2.º ramo.',
            '$C(5) = 5 + 2 \\times (5 - 2) = 5 + 6 = 11$ €',
          ],
          verificar: () => Manual.calc.funcoes.avaliarRamos([
            { de: 0, ate: 2, incluiDe: false, incluiAte: true, f: () => 5 },
            { de: 2, ate: Infinity, incluiDe: false, incluiAte: false, f: (t) => 5 + 2 * (t - 2) },
          ], 5),
        },
        {
          tipo: 'numerica',
          enunciado: 'Seja $h(x) = -2x + 4$ se $x < 1$ e $h(x) = x - 5$ se $x \\geq 1$. Qual é o zero de $h$?',
          resposta: 5,
          tolerancia: 0,
          resolucao: [
            '1.º ramo: $-2x + 4 = 0 \\Leftrightarrow x = 2$, mas $2 < 1$ é falso: não serve.',
            '2.º ramo: $x - 5 = 0 \\Leftrightarrow x = 5$, e $5 \\geq 1$: serve. O zero é $5$.',
          ],
          verificar: () => Manual.calc.funcoes.afim(1, -5).zero,
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é o contradomínio de $f(x) = |x| - 2$?',
          opcoes: ['$[0, +\\infty[$', '$[-2, +\\infty[$', '$[2, +\\infty[$', '$\\mathbb{R}$'],
          correta: 1,
          explicacao: '$|x| \\geq 0$, logo $|x| - 2 \\geq -2$, com $-2$ atingido em $x = 0$: translação de vetor $(0, -2)$ do gráfico de $|x|$.',
        },
        {
          tipo: 'vf',
          enunciado: 'Para todo o número real $x$, $|x| = x$.',
          correta: false,
          explicacao: 'Só para $x \\geq 0$. Por exemplo, $|-3| = 3 \\neq -3$.',
        },
        {
          tipo: 'escolha',
          enunciado: 'Qual é a expressão por ramos de $|x + 1|$?',
          opcoes: [
            '$x + 1$ se $x \\geq -1$; $-x - 1$ se $x < -1$',
            '$x + 1$ se $x \\geq 0$; $-x + 1$ se $x < 0$',
            '$x + 1$ se $x \\geq 1$; $-x - 1$ se $x < 1$',
            '$x - 1$ se $x \\geq -1$; $x + 1$ se $x < -1$',
          ],
          correta: 0,
          explicacao: '$x + 1 \\geq 0 \\Leftrightarrow x \\geq -1$. Quando $x + 1 < 0$, o módulo é $-(x + 1) = -x - 1$.',
        },
      ],
    },
  ],
});
