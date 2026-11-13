globalThis.Manual = globalThis.Manual || {};

Manual.registarTema('mat-a', {
  id: 'geometria-analitica',
  titulo: 'Geometria analítica',
  subtemas: [
    // ------------------------------------------------------------------
    {
      id: 'plano-referencial',
      titulo: 'Referencial, ponto médio e distância no plano',
      ae: [
        'Identificar coordenadas de pontos do plano num referencial cartesiano, ortogonal e monométrico.',
        'Reconhecer, analisar e aplicar na resolução de problemas: - transformados de pontos, por uma reflexão de eixo vertical ou horizontal, ou por uma meia-volta de centro na origem; - coordenadas do ponto médio de um segmento de reta; - fórmula da distância entre dois pontos; - condições que definem conjuntos de pontos: - equações de retas verticais e não verticais; - semiplanos; - mediatriz de um segmento de reta; - circunferência e círculo; - outros conjuntos definidos por conjunções e disjunções, em casos simples.',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Um referencial cartesiano é **ortogonal e monométrico** (ou **ortonormado**, o.n.) quando os eixos $Ox$ e $Oy$ são perpendiculares e têm a mesma unidade de comprimento. Cada ponto $P$ tem coordenadas $(x, y)$: $x$ é a **abcissa** e $y$ a **ordenada**.',
        },
        {
          tipo: 'texto',
          texto: 'Os pontos do eixo $Ox$ têm ordenada $0$, como $(4, 0)$; os do eixo $Oy$ têm abcissa $0$, como $(0, -2)$. O 1.º quadrante tem $x > 0$ e $y > 0$; o 2.º, $x < 0$ e $y > 0$; o 3.º, ambas negativas; o 4.º, $x > 0$ e $y < 0$.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Transformação', 'Transformado de $P(a, b)$'],
          linhas: [
            ['Reflexão de eixo $Ox$', '$(a, -b)$'],
            ['Reflexão de eixo $Oy$', '$(-a, b)$'],
            ['Meia-volta de centro $O$', '$(-a, -b)$'],
            ['Reflexão de eixo vertical $x = c$', '$(2c - a, b)$'],
            ['Reflexão de eixo horizontal $y = c$', '$(a, 2c - b)$'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Na reflexão de eixo $x = c$, a ordenada mantém-se e o eixo fica a meio caminho entre $P$ e o transformado $P\'$: $\\dfrac{a + x\'}{2} = c$, logo $x\' = 2c - a$. A meia-volta de centro $O$ é a rotação de $180°$ e equivale a fazer as duas reflexões nos eixos.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina os transformados de $P(3, -2)$ pela reflexão de eixo $Oy$, pela meia-volta de centro $O$ e pela reflexão de eixo $x = 1$.',
          resolucao: [
            'Reflexão de eixo $Oy$: troca-se o sinal da abcissa, $(-3, -2)$.',
            'Meia-volta de centro $O$: trocam-se os dois sinais, $(-3, 2)$.',
            'Reflexão de eixo $x = 1$: a ordenada mantém-se e $x\' = 2 \\times 1 - 3 = -1$, logo $(-1, -2)$.',
            'Confirmação: o ponto médio de $(3, -2)$ e $(-1, -2)$ é $\\left(\\dfrac{3 + (-1)}{2}, -2\\right) = (1, -2)$, que está no eixo $x = 1$.',
          ],
          resultado: -1,
          verificar: () => {
            const G = Manual.calc.geometria;
            // P' = P + 2 × (vetor de P até ao pé no eixo, (1, −2))
            return G.somar([3, -2], G.escalar(2, G.vetor([3, -2], [1, -2])))[0];
          },
        },
        {
          tipo: 'formula',
          texto: 'Dados $A(x_1, y_1)$ e $B(x_2, y_2)$: ponto médio $M\\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$ e distância $d(A, B) = \\overline{AB} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.',
        },
        {
          tipo: 'texto',
          texto: 'A fórmula da distância é o teorema de Pitágoras: $|x_2 - x_1|$ e $|y_2 - y_1|$ são os catetos de um triângulo retângulo cuja hipotenusa é $[AB]$. Como os catetos aparecem ao quadrado, a ordem da subtração não importa.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Dados $A(-2, 3)$ e $B(4, -5)$, calcula as coordenadas do ponto médio de $[AB]$ e a distância entre $A$ e $B$.',
          resolucao: [
            '$M\\left(\\dfrac{-2 + 4}{2}, \\dfrac{3 + (-5)}{2}\\right) = M\\left(\\dfrac{2}{2}, \\dfrac{-2}{2}\\right) = M(1, -1)$.',
            '$x_2 - x_1 = 4 - (-2) = 6$ e $y_2 - y_1 = -5 - 3 = -8$.',
            '$d(A, B) = \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.',
          ],
          resultado: 10,
          verificar: () => Manual.calc.geometria.distancia([-2, 3], [4, -5]),
        },
        {
          tipo: 'esquema',
          id: 'plano',
          opcoes: { A: [1, 1], B: [4, 5], modo: 'distancia' },
          legenda: 'Experimenta: arrasta B e vê o triângulo retângulo mudar; põe B em (7 ; 9) e confirma que d = 10. Muda o modo para «Ponto médio» e vê M acompanhar.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'No ponto médio **somam-se** as coordenadas e divide-se por 2 — não se subtraem. Na distância, cuidado com os negativos: $4 - (-2) = 6$, não $2$. E a reflexão de eixo $Ox$ troca o sinal da **ordenada** (o eixo $Ox$ não se mexe), não o da abcissa.',
        },
      ],
      resumo: [
        'Referencial o.n.: eixos perpendiculares com a mesma unidade; $P(x, y)$, abcissa e ordenada.',
        'Reflexões: eixo $Ox$ → $(a, -b)$; eixo $Oy$ → $(-a, b)$; eixo $x = c$ → $(2c - a, b)$; eixo $y = c$ → $(a, 2c - b)$.',
        'Meia-volta de centro $O$: $(a, b) \\to (-a, -b)$.',
        'Ponto médio: $M\\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$.',
        'Distância: $\\overline{AB} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ (Pitágoras).',
      ],
      quiz: [
        {
          id: 'plano-referencial-q01',
          tipo: 'numerica',
          enunciado: 'Qual é a distância entre $A(-1, 2)$ e $B(5, 10)$?',
          resposta: 10,
          tolerancia: 0,
          resolucao: [
            '$x_2 - x_1 = 5 - (-1) = 6$; $y_2 - y_1 = 10 - 2 = 8$.',
            '$\\overline{AB} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.',
          ],
          verificar: () => Manual.calc.geometria.distancia([-1, 2], [5, 10]),
        },
        {
          id: 'plano-referencial-q02',
          tipo: 'numerica',
          enunciado: 'Qual é a ordenada do ponto médio de $[AB]$, com $A(-3, 7)$ e $B(5, -1)$?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            '$y_M = \\dfrac{7 + (-1)}{2} = \\dfrac{6}{2} = 3$.',
            '(A abcissa é $\\dfrac{-3 + 5}{2} = 1$, logo $M(1, 3)$.)',
          ],
          verificar: () => Manual.calc.geometria.pontoMedio([-3, 7], [5, -1])[1],
        },
        {
          id: 'plano-referencial-q03',
          tipo: 'numerica',
          enunciado: '$M(2, 1)$ é o ponto médio de $[AB]$ e $A(-1, 4)$. Qual é a abcissa de $B$?',
          resposta: 5,
          tolerancia: 0,
          resolucao: [
            '$\\dfrac{-1 + x_B}{2} = 2 \\Leftrightarrow -1 + x_B = 4 \\Leftrightarrow x_B = 5$.',
            'Da mesma forma, $\\dfrac{4 + y_B}{2} = 1 \\Leftrightarrow y_B = -2$, logo $B(5, -2)$.',
          ],
          verificar: () => {
            const G = Manual.calc.geometria;
            // B = M + vetor AM
            return G.pontoMaisVetor([2, 1], G.vetor([-1, 4], [2, 1]))[0];
          },
        },
        {
          id: 'plano-referencial-q04',
          tipo: 'escolha',
          enunciado: 'Qual é o transformado de $P(-2, 5)$ pela meia-volta de centro na origem?',
          opcoes: ['$(-2, -5)$', '$(2, 5)$', '$(2, -5)$', '$(5, -2)$'],
          correta: 2,
          explicacao: 'A meia-volta de centro $O$ troca o sinal das duas coordenadas: $(-2, 5) \\to (2, -5)$.',
        },
        {
          id: 'plano-referencial-q05',
          tipo: 'vf',
          enunciado: 'O transformado de $(3, 4)$ pela reflexão de eixo $Oy$ é $(3, -4)$.',
          correta: false,
          explicacao: 'Na reflexão de eixo $Oy$ muda o sinal da abcissa: o transformado é $(-3, 4)$. O ponto $(3, -4)$ obtém-se pela reflexão de eixo $Ox$.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'plano-condicoes',
      titulo: 'Conjuntos de pontos no plano',
      ae: [
        'Reconhecer, analisar e aplicar na resolução de problemas: - transformados de pontos, por uma reflexão de eixo vertical ou horizontal, ou por uma meia-volta de centro na origem; - coordenadas do ponto médio de um segmento de reta; - fórmula da distância entre dois pontos; - condições que definem conjuntos de pontos: - equações de retas verticais e não verticais; - semiplanos; - mediatriz de um segmento de reta; - circunferência e círculo; - outros conjuntos definidos por conjunções e disjunções, em casos simples.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Uma condição em $x$ e $y$ define o conjunto dos pontos cujas coordenadas a tornam verdadeira. Por exemplo, $y = 2$ define a reta horizontal que passa por $(0, 2)$; $x^2 + y^2 < 0$ não é verificada por nenhum ponto e define o **conjunto vazio**.',
        },
        {
          tipo: 'definicao',
          texto: '**Reta vertical**: $x = a$ (paralela a $Oy$). **Reta não vertical**: $y = mx + b$ (equação reduzida), com $m$ o declive e $b$ a ordenada na origem; se $m = 0$, é horizontal, $y = b$. Os eixos: $Ox$ é $y = 0$ e $Oy$ é $x = 0$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve a equação reduzida da reta que passa por $A(-1, 5)$ e $B(2, -1)$.',
          resolucao: [
            'Declive: $m = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{-1 - 5}{2 - (-1)} = \\dfrac{-6}{3} = -2$.',
            'Substituindo $A$ em $y = -2x + b$: $5 = -2 \\times (-1) + b \\Leftrightarrow 5 = 2 + b \\Leftrightarrow b = 3$.',
            'Equação reduzida: $y = -2x + 3$. Confirmação com $B$: $-2 \\times 2 + 3 = -1$.',
          ],
          resultado: 3,
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.equacaoReduzida([-1, 5], G.vetor([-1, 5], [2, -1])).b;
          },
        },
        {
          tipo: 'texto',
          texto: 'Uma reta divide o plano em dois **semiplanos**; a reta é a **fronteira**. $y > mx + b$ é o semiplano acima da reta e $y < mx + b$ o semiplano abaixo; $x > a$ fica à direita de $x = a$. Com $<$ ou $>$ a fronteira não pertence ao conjunto; com $\\leq$ ou $\\geq$ pertence.',
        },
        {
          tipo: 'definicao',
          texto: '**Mediatriz** de $[AB]$: conjunto dos pontos $P$ equidistantes de $A$ e de $B$, isto é, $d(P, A) = d(P, B)$. É a reta perpendicular a $[AB]$ que passa pelo seu ponto médio.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina a equação reduzida da mediatriz de $[AB]$, com $A(1, 1)$ e $B(5, 3)$.',
          resolucao: [
            '$d(P, A) = d(P, B) \\Leftrightarrow (x - 1)^2 + (y - 1)^2 = (x - 5)^2 + (y - 3)^2$ (elevámos ao quadrado as duas distâncias).',
            'Desenvolvendo: $x^2 - 2x + 1 + y^2 - 2y + 1 = x^2 - 10x + 25 + y^2 - 6y + 9$.',
            '$x^2$ e $y^2$ cancelam-se: $-2x - 2y + 2 = -10x - 6y + 34 \\Leftrightarrow 8x + 4y = 32$.',
            '$4y = -8x + 32 \\Leftrightarrow y = -2x + 8$.',
            'Confirmação: o ponto médio $M(3, 2)$ verifica $-2 \\times 3 + 8 = 2$.',
          ],
          resultado: 8,
          verificar: () => {
            const m = Manual.calc.geometria.mediatriz([1, 1], [5, 3]);
            // m.a·x + m.b·y = m.c  ⇒  ordenada na origem c/b
            return m.c / m.b;
          },
        },
        {
          tipo: 'esquema',
          id: 'plano',
          opcoes: { A: [1, 1], B: [5, 3], modo: 'mediatriz' },
          legenda: 'Experimenta: arrasta A e B e vê a mediatriz passar sempre por M, perpendicular a [AB]; põe A e B com a mesma ordenada e a mediatriz fica vertical (x = …).',
        },
        {
          tipo: 'definicao',
          texto: '**Circunferência** de centro $C(a, b)$ e raio $r$: pontos a distância $r$ de $C$, $(x - a)^2 + (y - b)^2 = r^2$. **Círculo**: pontos a distância menor ou igual a $r$, $(x - a)^2 + (y - b)^2 \\leq r^2$. Com $<$, só o interior (sem a circunferência).',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve a equação da circunferência de centro $C(2, -1)$ que passa por $P(5, 3)$.',
          resolucao: [
            'O raio é a distância de $C$ a $P$: $r = \\sqrt{(5 - 2)^2 + (3 - (-1))^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
            'Equação: $(x - 2)^2 + (y - (-1))^2 = 5^2$, ou seja, $(x - 2)^2 + (y + 1)^2 = 25$.',
          ],
          resultado: 5,
          verificar: () => Manual.calc.geometria.distancia([2, -1], [5, 3]),
        },
        {
          tipo: 'esquema',
          id: 'plano',
          opcoes: { A: [2, 2], B: [5, 6], modo: 'circunferencia' },
          legenda: 'Experimenta: A é o centro e B um ponto da circunferência. Arrasta B e vê o raio e o segundo membro (r²) mudarem; arrasta A e vê os sinais dentro dos parênteses.',
        },
        {
          tipo: 'texto',
          texto: 'A **conjunção** ($\\wedge$, «e») dá a interseção dos conjuntos; a **disjunção** ($\\vee$, «ou») dá a reunião. Por exemplo, $x^2 + y^2 \\leq 4 \\wedge y \\geq 0$ é o semicírculo superior de centro $O$ e raio 2; $x \\leq -1 \\vee x \\geq 1$ são dois semiplanos fechados.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Condição', 'Conjunto de pontos'],
          linhas: [
            ['$x = 3$', 'Reta vertical que passa por $(3, 0)$'],
            ['$y = 2x - 1$', 'Reta de declive 2 e ordenada na origem $-1$'],
            ['$y > 2x - 1$', 'Semiplano aberto acima dessa reta'],
            ['$x \\leq 3$', 'Semiplano fechado à esquerda de $x = 3$'],
            ['$(x - 1)^2 + (y + 2)^2 = 9$', 'Circunferência de centro $(1, -2)$ e raio 3'],
            ['$(x - 1)^2 + (y + 2)^2 \\leq 9$', 'Círculo de centro $(1, -2)$ e raio 3'],
            ['$x \\geq 0 \\wedge y \\geq 0 \\wedge x^2 + y^2 \\leq 4$', 'Quarto de círculo no 1.º quadrante'],
          ],
        },
        {
          tipo: 'erro-frequente',
          texto: 'Em $(x + 3)^2 + (y - 4)^2 = 7$ o centro é $(-3, 4)$, não $(3, -4)$: $(x + 3)^2 = (x - (-3))^2$. E o segundo membro é $r^2$: aqui $r = \\sqrt{7}$, não $7$.',
        },
      ],
      resumo: [
        'Reta vertical: $x = a$ · reta não vertical: $y = mx + b$ · horizontal: $y = b$.',
        'Semiplanos: $y > mx + b$ (acima), $y < mx + b$ (abaixo); $\\leq$/$\\geq$ incluem a fronteira.',
        'Mediatriz de $[AB]$: $d(P, A) = d(P, B)$; perpendicular a $[AB]$ no ponto médio.',
        'Circunferência: $(x - a)^2 + (y - b)^2 = r^2$ · círculo: $\\leq r^2$.',
        'Conjunção $\\wedge$ → interseção; disjunção $\\vee$ → reunião.',
      ],
      quiz: [
        {
          id: 'plano-condicoes-q01',
          tipo: 'numerica',
          enunciado: 'Qual é o raio da circunferência $(x + 3)^2 + (y - 4)^2 = 49$?',
          resposta: 7,
          tolerancia: 0,
          resolucao: [
            'O segundo membro é $r^2$: $r^2 = 49$.',
            '$r = \\sqrt{49} = 7$ (o centro é $(-3, 4)$).',
          ],
          verificar: () => Math.sqrt(49),
        },
        {
          id: 'plano-condicoes-q02',
          tipo: 'numerica',
          enunciado: 'Qual é a ordenada na origem da reta que passa por $(2, 1)$ e $(4, 7)$?',
          resposta: -5,
          tolerancia: 0,
          resolucao: [
            '$m = \\dfrac{7 - 1}{4 - 2} = \\dfrac{6}{2} = 3$.',
            '$1 = 3 \\times 2 + b \\Leftrightarrow b = 1 - 6 = -5$, logo $y = 3x - 5$.',
          ],
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.equacaoReduzida([2, 1], G.vetor([2, 1], [4, 7])).b;
          },
        },
        {
          id: 'plano-condicoes-q03',
          tipo: 'numerica',
          enunciado: 'Qual é o declive da mediatriz de $[AB]$, com $A(0, 0)$ e $B(4, 2)$?',
          resposta: -2,
          tolerancia: 0,
          resolucao: [
            '$x^2 + y^2 = (x - 4)^2 + (y - 2)^2 \\Leftrightarrow 0 = -8x + 16 - 4y + 4$.',
            '$4y = -8x + 20 \\Leftrightarrow y = -2x + 5$: declive $-2$.',
            '(Confirmação: $[AB]$ tem declive $\\dfrac{2}{4} = \\dfrac{1}{2}$ e a mediatriz é perpendicular.)',
          ],
          verificar: () => {
            const m = Manual.calc.geometria.mediatriz([0, 0], [4, 2]);
            return -m.a / m.b;
          },
        },
        {
          id: 'plano-condicoes-q04',
          tipo: 'escolha',
          enunciado: 'Qual dos pontos pertence ao semiplano definido por $y < 2x - 1$?',
          opcoes: ['$(0, 0)$', '$(1, 1)$', '$(3, 2)$', '$(-2, -4)$'],
          correta: 2,
          explicacao: 'Para $(3, 2)$: $2 < 2 \\times 3 - 1 = 5$, verdadeiro. $(0, 0)$: $0 < -1$, falso. $(1, 1)$: $1 < 1$, falso (está na fronteira). $(-2, -4)$: $-4 < -5$, falso.',
          resolucao: [
            'Substitui-se cada ponto: $(0, 0)$ dá $0 < -1$; $(1, 1)$ dá $1 < 1$; $(3, 2)$ dá $2 < 5$; $(-2, -4)$ dá $-4 < -5$.',
            'Só $(3, 2)$ torna a condição verdadeira.',
          ],
          calculo: true,
        },
        {
          id: 'plano-condicoes-q05',
          tipo: 'vf',
          enunciado: 'A condição $x^2 + y^2 \\leq 9 \\wedge y \\geq 0$ define um semicírculo.',
          correta: true,
          explicacao: '$x^2 + y^2 \\leq 9$ é o círculo de centro $O$ e raio 3; a conjunção com $y \\geq 0$ fica só com a metade de cima.',
        },
        {
          id: 'plano-condicoes-q06',
          tipo: 'escolha',
          enunciado: 'Qual das condições define o conjunto vazio?',
          opcoes: ['$(x - 1)^2 + y^2 = 0$', '$(x - 1)^2 + y^2 = -4$', '$x > 2 \\vee x < 1$', '$y \\leq 0 \\wedge x \\geq 0$'],
          correta: 1,
          explicacao: 'Uma soma de quadrados nunca é negativa, logo $(x - 1)^2 + y^2 = -4$ não tem soluções. A condição $(x - 1)^2 + y^2 = 0$ define só o ponto $(1, 0)$.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'espaco',
      titulo: 'Geometria analítica no espaço',
      ae: [
        'Identificar coordenadas de pontos do espaço num referencial cartesiano ortogonal e monométrico.',
        'Reconhecer, analisar e aplicar na resolução de problemas: - coordenadas do ponto médio de um segmento de reta; - fórmula da distância entre dois pontos; - condições que definem conjuntos de pontos: - planos paralelos aos planos coordenados; - retas paralelas a um dos eixos; - planos mediadores; - superfície esférica e esfera.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Num referencial o.n. do espaço $Oxyz$, os três eixos são perpendiculares dois a dois e têm a mesma unidade. Cada ponto é $P(x, y, z)$: **abcissa**, **ordenada** e **cota**. Os planos coordenados são $xOy$ ($z = 0$), $yOz$ ($x = 0$) e $xOz$ ($y = 0$).',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Condição', 'Conjunto de pontos'],
          linhas: [
            ['$z = 3$', 'Plano paralelo a $xOy$'],
            ['$x = -2$', 'Plano paralelo a $yOz$'],
            ['$y = 1$', 'Plano paralelo a $xOz$'],
            ['$x = 1 \\wedge y = 2$', 'Reta paralela ao eixo $Oz$'],
            ['$y = 0 \\wedge z = 4$', 'Reta paralela ao eixo $Ox$ (no plano $xOz$)'],
            ['$x = 2 \\wedge z = -1$', 'Reta paralela ao eixo $Oy$'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Considera $P(1, 2, 3)$. Escreve uma condição do plano paralelo a $xOy$ que passa por $P$, uma condição da reta paralela a $Oz$ que passa por $P$ e as coordenadas da projeção de $P$ no plano $xOy$.',
          resolucao: [
            'Os pontos do plano paralelo a $xOy$ têm todos a cota de $P$: $z = 3$.',
            'Na reta paralela a $Oz$ só a cota varia: $x = 1 \\wedge y = 2$.',
            'A projeção em $xOy$ mantém $x$ e $y$ e tem cota $0$: $(1, 2, 0)$.',
          ],
        },
        {
          tipo: 'esquema',
          id: 'espaco3d',
          opcoes: { P: [1, 2, 3], mostrar: ['ponto', 'planos'] },
          legenda: 'Experimenta: roda a figura e vê que P é a interseção dos planos x = 1, y = 2 e z = 3; desliga «Planos» e segue as projeções de P nos planos coordenados.',
        },
        {
          tipo: 'formula',
          texto: 'Dados $A(x_1, y_1, z_1)$ e $B(x_2, y_2, z_2)$: $M\\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}, \\dfrac{z_1 + z_2}{2}\\right)$ e $\\overline{AB} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Dados $A(1, -2, 3)$ e $B(3, 2, -1)$, calcula o ponto médio de $[AB]$ e $\\overline{AB}$.',
          resolucao: [
            '$M\\left(\\dfrac{1 + 3}{2}, \\dfrac{-2 + 2}{2}, \\dfrac{3 + (-1)}{2}\\right) = M(2, 0, 1)$.',
            'Diferenças: $3 - 1 = 2$, $2 - (-2) = 4$, $-1 - 3 = -4$.',
            '$\\overline{AB} = \\sqrt{2^2 + 4^2 + (-4)^2} = \\sqrt{4 + 16 + 16} = \\sqrt{36} = 6$.',
          ],
          resultado: 6,
          verificar: () => Manual.calc.geometria.distancia([1, -2, 3], [3, 2, -1]),
        },
        {
          tipo: 'definicao',
          texto: '**Plano mediador** de $[AB]$: conjunto dos pontos $P$ do espaço equidistantes de $A$ e de $B$, $d(P, A) = d(P, B)$. É o plano perpendicular a $[AB]$ que passa pelo ponto médio (no plano, o mesmo raciocínio dá a mediatriz).',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina uma equação do plano mediador de $[AB]$, com $A(1, 0, 2)$ e $B(3, 4, 0)$.',
          resolucao: [
            '$(x - 1)^2 + y^2 + (z - 2)^2 = (x - 3)^2 + (y - 4)^2 + z^2$.',
            'Desenvolvendo e cancelando $x^2$, $y^2$, $z^2$: $-2x + 1 - 4z + 4 = -6x + 9 - 8y + 16$.',
            '$4x + 8y - 4z = 20 \\Leftrightarrow x + 2y - z = 5$.',
            'Confirmação: o ponto médio $M(2, 2, 1)$ verifica $2 + 2 \\times 2 - 1 = 5$.',
          ],
          resultado: 5,
          verificar: () => {
            const M = Manual.calc.geometria.pontoMedio([1, 0, 2], [3, 4, 0]);
            return M[0] + 2 * M[1] - M[2];
          },
        },
        {
          tipo: 'definicao',
          texto: '**Superfície esférica** de centro $C(a, b, c)$ e raio $r$: $(x - a)^2 + (y - b)^2 + (z - c)^2 = r^2$. **Esfera**: $(x - a)^2 + (y - b)^2 + (z - c)^2 \\leq r^2$ (a superfície esférica e o seu interior).',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve a equação da superfície esférica de diâmetro $[AB]$, com $A(1, -2, 3)$ e $B(3, 2, -1)$.',
          resolucao: [
            'O centro é o ponto médio do diâmetro: $C(2, 0, 1)$ (exemplo anterior).',
            'O raio é metade do diâmetro: $r = \\dfrac{6}{2} = 3$ (ou $\\overline{CA} = \\sqrt{1^2 + 2^2 + 2^2} = \\sqrt{9} = 3$).',
            'Equação: $(x - 2)^2 + y^2 + (z - 1)^2 = 9$.',
          ],
          resultado: 3,
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.distancia(G.pontoMedio([1, -2, 3], [3, 2, -1]), [1, -2, 3]);
          },
        },
        {
          tipo: 'exemplo',
          enunciado: 'Que conjunto de pontos é a interseção da superfície esférica $x^2 + y^2 + z^2 = 25$ com o plano $z = 3$?',
          resolucao: [
            'Substituindo $z = 3$: $x^2 + y^2 + 9 = 25 \\Leftrightarrow x^2 + y^2 = 16$.',
            'No plano $z = 3$ é uma circunferência de centro $(0, 0, 3)$ e raio $\\sqrt{16} = 4$.',
          ],
          resultado: 4,
          verificar: () => Math.sqrt(25 - 3 * 3),
        },
        {
          tipo: 'esquema',
          id: 'espaco3d',
          opcoes: { P: [2, 0, 1], raio: 3, mostrar: ['esfera', 'ponto'] },
          legenda: 'Experimenta: liga «Planos» para ver os planos x = 2, y = 0 e z = 1 a passar pelo centro; roda a vista e compara a equação no painel com a do exemplo.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'No espaço, $x = 2$ é um **plano** (no plano cartesiano era uma reta). Para uma reta paralela a um eixo são precisas **duas** condições, como $x = 2 \\wedge y = 1$. E não confundas superfície esférica ($=$) com esfera ($\\leq$).',
        },
      ],
      resumo: [
        'Referencial o.n. $Oxyz$: $P(x, y, z)$, abcissa, ordenada e cota.',
        'Planos paralelos aos coordenados: $x = a$, $y = b$, $z = c$.',
        'Retas paralelas a um eixo: duas condições, por exemplo $x = a \\wedge y = b$ (paralela a $Oz$).',
        'Ponto médio e distância: as fórmulas do plano com mais uma coordenada.',
        'Plano mediador de $[AB]$: $d(P, A) = d(P, B)$.',
        'Superfície esférica: $(x - a)^2 + (y - b)^2 + (z - c)^2 = r^2$ · esfera: $\\leq r^2$.',
      ],
      quiz: [
        {
          id: 'espaco-q01',
          tipo: 'numerica',
          enunciado: 'Qual é a distância da origem ao ponto $P(2, 3, 6)$?',
          resposta: 7,
          tolerancia: 0,
          resolucao: [
            '$\\overline{OP} = \\sqrt{2^2 + 3^2 + 6^2} = \\sqrt{4 + 9 + 36} = \\sqrt{49} = 7$.',
          ],
          verificar: () => Manual.calc.geometria.distancia([0, 0, 0], [2, 3, 6]),
        },
        {
          id: 'espaco-q02',
          tipo: 'numerica',
          enunciado: 'Qual é a cota do ponto médio de $[AB]$, com $A(1, 4, -3)$ e $B(5, 0, 7)$?',
          resposta: 2,
          tolerancia: 0,
          resolucao: [
            '$z_M = \\dfrac{-3 + 7}{2} = \\dfrac{4}{2} = 2$, logo $M(3, 2, 2)$.',
          ],
          verificar: () => Manual.calc.geometria.pontoMedio([1, 4, -3], [5, 0, 7])[2],
        },
        {
          id: 'espaco-q03',
          tipo: 'numerica',
          enunciado: 'Qual é o raio da superfície esférica $(x - 1)^2 + (y + 2)^2 + z^2 = 16$?',
          resposta: 4,
          tolerancia: 0,
          resolucao: [
            '$r^2 = 16$, logo $r = \\sqrt{16} = 4$; o centro é $(1, -2, 0)$.',
          ],
          verificar: () => Math.sqrt(16),
        },
        {
          id: 'espaco-q04',
          tipo: 'escolha',
          enunciado: 'No espaço, o que representa a condição $y = 3$?',
          opcoes: ['Uma reta paralela ao eixo $Ox$.', 'Um plano paralelo a $xOz$.', 'Um plano paralelo a $xOy$.', 'Um ponto do eixo $Oy$.'],
          correta: 1,
          explicacao: 'Só a ordenada está fixa; $x$ e $z$ variam livremente: é o plano paralelo a $xOz$ que passa por $(0, 3, 0)$.',
        },
        {
          id: 'espaco-q05',
          tipo: 'vf',
          enunciado: 'A condição $x = 1 \\wedge z = 2$ define uma reta paralela ao eixo $Oy$.',
          correta: true,
          explicacao: 'Com $x$ e $z$ fixos, só a ordenada varia: os pontos $(1, y, 2)$ formam uma reta paralela a $Oy$.',
        },
        {
          id: 'espaco-q06',
          tipo: 'vf',
          enunciado: 'O ponto $P(2, -1, 5)$ pertence à esfera $x^2 + y^2 + z^2 \\leq 25$.',
          correta: false,
          explicacao: '$2^2 + (-1)^2 + 5^2 = 4 + 1 + 25 = 30 > 25$: $P$ está fora da esfera.',
          resolucao: [
            '$2^2 + (-1)^2 + 5^2 = 4 + 1 + 25 = 30$.',
            '$30 \\leq 25$ é falso, logo $P$ não pertence à esfera.',
          ],
          calculo: true,
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'vetores',
      titulo: 'Vetores no plano e no espaço',
      ae: [
        'Reconhecer, analisar e aplicar na resolução de problemas: - norma de um vetor; - propriedades algébricas das operações com vetores; - coordenadas de um vetor; - coordenadas da soma e da diferença de vetores; - coordenadas do produto de um escalar por um vetor e do simétrico de um vetor; - relação entre as coordenadas de vetores colineares; - vetor definido por dois pontos e cálculo das respetivas coordenadas; - coordenadas do ponto resultante da soma de um ponto com um vetor; - cálculo da norma de um vetor por meio das suas coordenadas.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Um **vetor** $\\vec{u}$ tem direção, sentido e comprimento (a **norma**, $\\|\\vec{u}\\|$). Todos os segmentos orientados com a mesma direção, sentido e comprimento representam o mesmo vetor. Forças, deslocamentos e velocidades da Física são grandezas vetoriais.',
        },
        {
          tipo: 'definicao',
          texto: 'Num referencial o.n., as **coordenadas** de $\\vec{u}$ são as do ponto $P$ tal que $\\overrightarrow{OP} = \\vec{u}$: $\\vec{u} = (u_1, u_2)$ no plano e $(u_1, u_2, u_3)$ no espaço. O vetor definido por dois pontos é $\\overrightarrow{AB} = B - A$ (coordenadas de $B$ menos as de $A$).',
        },
        {
          tipo: 'formula',
          texto: '$\\vec{u} + \\vec{v} = (u_1 + v_1, u_2 + v_2)$ · $\\vec{u} - \\vec{v} = (u_1 - v_1, u_2 - v_2)$ · $k\\vec{u} = (ku_1, ku_2)$ · $-\\vec{u} = (-u_1, -u_2)$ · $\\|\\vec{u}\\| = \\sqrt{u_1^2 + u_2^2}$ (no espaço, $+\\,u_3^2$) · ponto + vetor: $A + \\vec{u} = (a_1 + u_1, a_2 + u_2)$.',
        },
        {
          tipo: 'texto',
          texto: 'Como $B = A + \\overrightarrow{AB}$, somar um vetor a um ponto dá outro ponto: «parte-se de $A$ e desloca-se segundo $\\vec{u}$». A norma de $\\overrightarrow{AB}$ é a distância $\\overline{AB}$. Se $k < 0$, $k\\vec{u}$ tem sentido contrário ao de $\\vec{u}$; em todos os casos $\\|k\\vec{u}\\| = |k|\\,\\|\\vec{u}\\|$.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Propriedade', 'Expressão'],
          linhas: [
            ['Comutativa da soma', '$\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$'],
            ['Associativa da soma', '$(\\vec{u} + \\vec{v}) + \\vec{w} = \\vec{u} + (\\vec{v} + \\vec{w})$'],
            ['Elemento neutro', '$\\vec{u} + \\vec{0} = \\vec{u}$'],
            ['Simétrico', '$\\vec{u} + (-\\vec{u}) = \\vec{0}$'],
            ['Distributivas', '$k(\\vec{u} + \\vec{v}) = k\\vec{u} + k\\vec{v}$ e $(k + l)\\vec{u} = k\\vec{u} + l\\vec{u}$'],
            ['Associativa mista', '$k(l\\vec{u}) = (kl)\\vec{u}$; e $1\\vec{u} = \\vec{u}$'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Dados $A(2, -1)$ e $B(5, 3)$, determina as coordenadas de $\\overrightarrow{AB}$ e a sua norma.',
          resolucao: [
            '$\\overrightarrow{AB} = B - A = (5 - 2, 3 - (-1)) = (3, 4)$.',
            '$\\|\\overrightarrow{AB}\\| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$ (é a distância entre $A$ e $B$).',
          ],
          resultado: 5,
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.norma(G.vetor([2, -1], [5, 3]));
          },
        },
        {
          tipo: 'exemplo',
          enunciado: 'Dados $\\vec{u} = (3, -1)$ e $\\vec{v} = (-2, 4)$, calcula $\\vec{u} + \\vec{v}$, $2\\vec{u} - \\vec{v}$ e $\\|2\\vec{u} - \\vec{v}\\|$.',
          resolucao: [
            '$\\vec{u} + \\vec{v} = (3 + (-2), -1 + 4) = (1, 3)$.',
            '$2\\vec{u} = (6, -2)$, logo $2\\vec{u} - \\vec{v} = (6 - (-2), -2 - 4) = (8, -6)$.',
            '$\\|2\\vec{u} - \\vec{v}\\| = \\sqrt{8^2 + (-6)^2} = \\sqrt{64 + 36} = \\sqrt{100} = 10$.',
          ],
          resultado: 10,
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.norma(G.subtrair(G.escalar(2, [3, -1]), [-2, 4]));
          },
        },
        {
          tipo: 'esquema',
          id: 'vetores',
          opcoes: { u: [3, -1], v: [-2, 4], operacao: 'soma' },
          legenda: 'Experimenta: arrasta as pontas de u e v e vê u + v como diagonal do paralelogramo; muda para «Multiplicação por escalar» e põe k negativo para inverter o sentido.',
        },
        {
          tipo: 'definicao',
          texto: 'Dois vetores não nulos $\\vec{u}$ e $\\vec{v}$ são **colineares** (têm a mesma direção) se e só se existe $k \\in \\mathbb{R}$ tal que $\\vec{v} = k\\vec{u}$, isto é, se as coordenadas são proporcionais: $\\dfrac{v_1}{u_1} = \\dfrac{v_2}{u_2}$ (quando $u_1, u_2 \\neq 0$). O vetor nulo é colinear com qualquer vetor.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina $k$ de modo que $\\vec{u} = (2, -3)$ e $\\vec{v} = (k, 6)$ sejam colineares.',
          resolucao: [
            'Procura-se $t$ com $\\vec{v} = t\\vec{u}$: pela 2.ª coordenada, $6 = t \\times (-3) \\Leftrightarrow t = -2$.',
            'Pela 1.ª coordenada: $k = t \\times 2 = -2 \\times 2 = -4$.',
            'Confirmação: $\\vec{v} = (-4, 6) = -2\\,(2, -3)$, com sentido contrário ao de $\\vec{u}$.',
          ],
          resultado: -4,
          verificar: () => {
            const G = Manual.calc.geometria;
            const k = G.escalar(6 / -3, [2, -3])[0];
            return G.colineares([2, -3], [k, 6]) ? k : NaN;
          },
        },
        {
          tipo: 'exemplo',
          enunciado: '$[ABCD]$ é um paralelogramo com $A(1, 1)$, $B(4, 2)$ e $C(5, 5)$. Determina as coordenadas de $D$.',
          resolucao: [
            'Num paralelogramo, $\\overrightarrow{AD} = \\overrightarrow{BC}$, logo $D = A + \\overrightarrow{BC}$.',
            '$\\overrightarrow{BC} = C - B = (5 - 4, 5 - 2) = (1, 3)$.',
            '$D = (1, 1) + (1, 3) = (2, 4)$.',
          ],
          resultado: 4,
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.pontoMaisVetor([1, 1], G.vetor([4, 2], [5, 5]))[1];
          },
        },
        {
          tipo: 'esquema',
          id: 'vetores',
          opcoes: { u: [2, -3], v: [-4, 6], operacao: 'colinearidade' },
          legenda: 'Experimenta: estes vetores são colineares (v = −2u). Arrasta a ponta de v para (−4 ; 5) e vê o painel deixar de dar colinearidade; procura outra posição colinear, como (4 ; −6).',
        },
        {
          tipo: 'erro-frequente',
          texto: '$\\overrightarrow{AB} = B - A$, não $A - B$: trocar a ordem dá o vetor simétrico, $\\overrightarrow{BA} = -\\overrightarrow{AB}$. E a norma da soma não é a soma das normas: com $\\vec{u} = (3, 0)$ e $\\vec{v} = (0, 4)$, $\\|\\vec{u} + \\vec{v}\\| = 5$, mas $\\|\\vec{u}\\| + \\|\\vec{v}\\| = 7$.',
        },
      ],
      resumo: [
        'Coordenadas: $\\overrightarrow{AB} = B - A$; ponto + vetor: $B = A + \\overrightarrow{AB}$.',
        'Soma, diferença e produto por um escalar: coordenada a coordenada; $-\\vec{u} = (-u_1, -u_2)$.',
        'Norma: $\\|\\vec{u}\\| = \\sqrt{u_1^2 + u_2^2}$ (no espaço, $\\sqrt{u_1^2 + u_2^2 + u_3^2}$).',
        '$\\|k\\vec{u}\\| = |k|\\,\\|\\vec{u}\\|$; $k < 0$ inverte o sentido.',
        'Colineares: $\\vec{v} = k\\vec{u}$, coordenadas proporcionais.',
        'A soma é comutativa e associativa; o produto por um escalar é distributivo.',
      ],
      quiz: [
        {
          id: 'vetores-q01',
          tipo: 'numerica',
          enunciado: 'Qual é a norma do vetor $\\vec{w} = (2, -3, 6)$?',
          resposta: 7,
          tolerancia: 0,
          resolucao: [
            '$\\|\\vec{w}\\| = \\sqrt{2^2 + (-3)^2 + 6^2} = \\sqrt{4 + 9 + 36} = \\sqrt{49} = 7$.',
          ],
          verificar: () => Manual.calc.geometria.norma([2, -3, 6]),
        },
        {
          id: 'vetores-q02',
          tipo: 'numerica',
          enunciado: 'Com $\\vec{u} = (1, 2)$ e $\\vec{v} = (-2, 5)$, qual é a 2.ª coordenada de $3\\vec{u} - 2\\vec{v}$?',
          resposta: -4,
          tolerancia: 0,
          resolucao: [
            '$3\\vec{u} = (3, 6)$ e $2\\vec{v} = (-4, 10)$.',
            '$3\\vec{u} - 2\\vec{v} = (3 - (-4), 6 - 10) = (7, -4)$: a 2.ª coordenada é $-4$.',
          ],
          verificar: () => {
            const G = Manual.calc.geometria;
            return G.subtrair(G.escalar(3, [1, 2]), G.escalar(2, [-2, 5]))[1];
          },
        },
        {
          id: 'vetores-q03',
          tipo: 'numerica',
          enunciado: 'Para que valor de $k$ são colineares $\\vec{u} = (3, -6)$ e $\\vec{v} = (k, 4)$?',
          resposta: -2,
          tolerancia: 0,
          resolucao: [
            '$\\vec{v} = t\\vec{u}$: $4 = t \\times (-6) \\Leftrightarrow t = -\\dfrac{2}{3}$.',
            '$k = t \\times 3 = -\\dfrac{2}{3} \\times 3 = -2$.',
          ],
          verificar: () => {
            const G = Manual.calc.geometria;
            const k = G.escalar(4 / -6, [3, -6])[0];
            return G.colineares([3, -6], [k, 4]) ? k : NaN;
          },
        },
        {
          id: 'vetores-q04',
          tipo: 'escolha',
          enunciado: 'Dados $A(2, -1, 0)$ e $\\vec{u} = (-3, 4, 1)$, quais são as coordenadas do ponto $A + \\vec{u}$?',
          opcoes: ['$(5, -5, -1)$', '$(-1, 3, 1)$', '$(-6, -4, 0)$', '$(-5, 5, 1)$'],
          correta: 1,
          explicacao: 'Soma-se coordenada a coordenada: $(2 + (-3), -1 + 4, 0 + 1) = (-1, 3, 1)$.',
          resolucao: [
            '$A + \\vec{u} = (2 + (-3), -1 + 4, 0 + 1) = (-1, 3, 1)$.',
          ],
          calculo: true,
        },
        {
          id: 'vetores-q05',
          tipo: 'vf',
          enunciado: 'Para qualquer vetor $\\vec{u}$, $\\|-2\\vec{u}\\| = -2\\|\\vec{u}\\|$.',
          correta: false,
          explicacao: 'A norma nunca é negativa: $\\|-2\\vec{u}\\| = |-2|\\,\\|\\vec{u}\\| = 2\\|\\vec{u}\\|$.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'reta-vetorial',
      titulo: 'Equação vetorial da reta',
      ae: [
        'Reconhecer que uma reta fica definida se for conhecido um ponto da reta e um vetor diretor.',
        'Escrever uma equação vetorial de uma reta.',
        'Estabelecer a relação entre: - as coordenadas de um vetor diretor e o declive da reta. - paralelismo de retas, igualdade do declive e colinearidade de vetores diretores das retas; - equação reduzida e equação vetorial de uma reta.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Um **vetor diretor** de uma reta é qualquer vetor não nulo com a direção da reta. Conhecidos um ponto $A$ da reta e um vetor diretor $\\vec{u}$, a reta fica definida: $P$ pertence à reta se e só se $\\overrightarrow{AP}$ é colinear com $\\vec{u}$, isto é, $\\overrightarrow{AP} = \\lambda\\vec{u}$, ou seja, $P = A + \\lambda\\vec{u}$.',
        },
        {
          tipo: 'definicao',
          texto: '**Equação vetorial** da reta que passa por $A$ e tem a direção de $\\vec{u}$: no plano, $(x, y) = (a_1, a_2) + \\lambda(u_1, u_2),\\ \\lambda \\in \\mathbb{R}$; no espaço, $(x, y, z) = (a_1, a_2, a_3) + \\lambda(u_1, u_2, u_3),\\ \\lambda \\in \\mathbb{R}$. Cada valor de $\\lambda$ dá um ponto da reta.',
        },
        {
          tipo: 'texto',
          texto: 'A equação vetorial não é única: serve qualquer ponto da reta e qualquer vetor colinear com $\\vec{u}$. Por exemplo, $(x, y) = (1, 3) + \\lambda(3, -6)$ e $(x, y) = (4, -3) + \\lambda(-1, 2)$ definem a mesma reta.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve uma equação vetorial da reta $AB$, com $A(1, 3)$ e $B(4, -3)$. Determina o ponto correspondente a $\\lambda = 2$ e verifica se $C(-1, 7)$ pertence à reta.',
          resolucao: [
            'Vetor diretor: $\\overrightarrow{AB} = (4 - 1, -3 - 3) = (3, -6)$.',
            'Equação vetorial: $(x, y) = (1, 3) + \\lambda(3, -6),\\ \\lambda \\in \\mathbb{R}$.',
            '$\\lambda = 2$: $(1, 3) + 2(3, -6) = (1 + 6, 3 - 12) = (7, -9)$.',
            '$C$: $(-1, 7) = (1, 3) + \\lambda(3, -6) \\Leftrightarrow -2 = 3\\lambda \\wedge 4 = -6\\lambda \\Leftrightarrow \\lambda = -\\dfrac{2}{3} \\wedge \\lambda = -\\dfrac{2}{3}$. O mesmo $\\lambda$ serve nas duas coordenadas, logo $C$ pertence à reta.',
          ],
          resultado: -9,
          verificar: () => Manual.calc.geometria.retaVetorial([1, 3], [3, -6], 2)[1],
        },
        {
          tipo: 'formula',
          texto: 'Se $\\vec{u} = (u_1, u_2)$ com $u_1 \\neq 0$, o declive da reta é $m = \\dfrac{u_2}{u_1}$. Se $u_1 = 0$, a reta é vertical: $x = a_1$. Reciprocamente, a reta $y = mx + b$ passa por $(0, b)$ e tem vetor diretor $(1, m)$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve a equação reduzida da reta $(x, y) = (2, 1) + \\lambda(4, -2),\\ \\lambda \\in \\mathbb{R}$.',
          resolucao: [
            'Declive: $m = \\dfrac{u_2}{u_1} = \\dfrac{-2}{4} = -\\dfrac{1}{2}$.',
            'A reta passa por $(2, 1)$: $1 = -\\dfrac{1}{2} \\times 2 + b \\Leftrightarrow 1 = -1 + b \\Leftrightarrow b = 2$.',
            'Equação reduzida: $y = -\\dfrac{1}{2}x + 2$.',
          ],
          resultado: 2,
          verificar: () => Manual.calc.geometria.equacaoReduzida([2, 1], [4, -2]).b,
        },
        {
          tipo: 'exemplo',
          enunciado: 'Escreve uma equação vetorial da reta $y = 3x - 5$.',
          resolucao: [
            'Um ponto: para $x = 0$, $y = -5$, logo $(0, -5)$.',
            'Um vetor diretor: $(1, m) = (1, 3)$.',
            'Equação vetorial: $(x, y) = (0, -5) + \\lambda(1, 3),\\ \\lambda \\in \\mathbb{R}$.',
          ],
          resultado: 3,
          verificar: () => Manual.calc.geometria.equacaoReduzida([0, -5], [1, 3]).m,
        },
        {
          tipo: 'texto',
          texto: '**Paralelismo.** Duas retas não verticais são paralelas se e só se têm o mesmo declive, o que equivale a terem vetores diretores colineares. Por exemplo, $(x, y) = (0, 1) + \\lambda(2, 6)$ tem $m = \\dfrac{6}{2} = 3$ e é paralela a $y = 3x - 5$: $(2, 6) = 2\\,(1, 3)$.',
        },
        {
          tipo: 'texto',
          texto: 'No espaço não há equação reduzida, mas a equação vetorial funciona da mesma forma. Para $(x, y, z) = (1, 2, 3) + \\lambda(2, 1, 1)$: $Q(5, 4, 5)$ pertence à reta, porque $1 + 2\\lambda = 5$, $2 + \\lambda = 4$ e $3 + \\lambda = 5$ dão todas $\\lambda = 2$.',
        },
        {
          tipo: 'esquema',
          id: 'espaco3d',
          opcoes: { P: [1, 2, 3], v: [2, 1, 1], mostrar: ['reta'] },
          legenda: 'Experimenta: mexe em λ e vê Q percorrer a reta; com λ = 2 obténs Q(5 ; 4 ; 5), e com λ negativo Q fica do outro lado de P.',
        },
        {
          tipo: 'texto',
          texto: 'Programa em Python que, dados dois pontos, escreve uma equação vetorial e a equação reduzida da reta (ou indica que é vertical). Para $A(1, 3)$ e $B(4, -3)$ escreve o vetor diretor $(3, -6)$ e a reta $y = -2x + 5$ (o Python mostra «-2.0» e «5.0», com ponto decimal).',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'x1 = float(input("x1: "))',
            'y1 = float(input("y1: "))',
            'x2 = float(input("x2: "))',
            'y2 = float(input("y2: "))',
            'u1 = x2 - x1',
            'u2 = y2 - y1',
            'print("Equação vetorial: (x, y) =", (x1, y1), "+ λ", (u1, u2))',
            'if u1 == 0:',
            '    print("Reta vertical: x =", x1)',
            'else:',
            '    m = u2 / u1',
            '    b = y1 - m * x1',
            '    print("Equação reduzida: y =", m, "x +", b)',
          ].join('\n'),
        },
        {
          tipo: 'erro-frequente',
          texto: 'O declive é $m = \\dfrac{u_2}{u_1}$ («variação de $y$ sobre variação de $x$»), não $\\dfrac{u_1}{u_2}$: o vetor $(2, 4)$ dá $m = 2$, não $\\dfrac{1}{2}$. E um vetor $(0, u_2)$ não dá declive nenhum: a reta é vertical.',
        },
      ],
      resumo: [
        'Uma reta fica definida por um ponto $A$ e um vetor diretor $\\vec{u} \\neq \\vec{0}$.',
        'Equação vetorial: $(x, y) = (a_1, a_2) + \\lambda(u_1, u_2),\\ \\lambda \\in \\mathbb{R}$ (no espaço, com três coordenadas).',
        'Declive a partir do vetor diretor: $m = \\dfrac{u_2}{u_1}$ ($u_1 \\neq 0$); $u_1 = 0$ → reta vertical $x = a_1$.',
        '$y = mx + b$ → ponto $(0, b)$ e vetor diretor $(1, m)$.',
        'Retas paralelas ⇔ mesmo declive ⇔ vetores diretores colineares.',
      ],
      quiz: [
        {
          id: 'reta-vetorial-q01',
          tipo: 'numerica',
          enunciado: 'Qual é o declive da reta $(x, y) = (-1, 4) + \\lambda(2, -6),\\ \\lambda \\in \\mathbb{R}$?',
          resposta: -3,
          tolerancia: 0,
          resolucao: [
            '$m = \\dfrac{u_2}{u_1} = \\dfrac{-6}{2} = -3$.',
          ],
          verificar: () => Manual.calc.geometria.equacaoReduzida([-1, 4], [2, -6]).m,
        },
        {
          id: 'reta-vetorial-q02',
          tipo: 'numerica',
          enunciado: 'Qual é a ordenada na origem da mesma reta, $(x, y) = (-1, 4) + \\lambda(2, -6)$?',
          resposta: 1,
          tolerancia: 0,
          resolucao: [
            '$m = -3$ e a reta passa por $(-1, 4)$.',
            '$4 = -3 \\times (-1) + b \\Leftrightarrow 4 = 3 + b \\Leftrightarrow b = 1$, logo $y = -3x + 1$.',
          ],
          verificar: () => Manual.calc.geometria.equacaoReduzida([-1, 4], [2, -6]).b,
        },
        {
          id: 'reta-vetorial-q03',
          tipo: 'numerica',
          enunciado: 'Na reta $(x, y, z) = (2, 0, -1) + \\lambda(1, -2, 3)$, qual é o valor de $\\lambda$ para o ponto de cota 8?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            'Cota: $-1 + 3\\lambda = 8 \\Leftrightarrow 3\\lambda = 9 \\Leftrightarrow \\lambda = 3$.',
            'O ponto é $(2, 0, -1) + 3(1, -2, 3) = (5, -6, 8)$.',
          ],
          verificar: () => (Manual.calc.geometria.retaVetorial([2, 0, -1], [1, -2, 3], 3)[2] === 8 ? 3 : NaN),
        },
        {
          id: 'reta-vetorial-q04',
          tipo: 'escolha',
          enunciado: 'Qual dos vetores é um vetor diretor da reta $y = 2x + 1$?',
          opcoes: ['$(2, 1)$', '$(-2, 1)$', '$(0, 1)$', '$(1, 2)$'],
          correta: 3,
          explicacao: 'Um vetor diretor de $y = mx + b$ é $(1, m) = (1, 2)$: dá $m = \\dfrac{2}{1} = 2$. $(2, 1)$ daria $m = \\dfrac{1}{2}$.',
        },
        {
          id: 'reta-vetorial-q05',
          tipo: 'vf',
          enunciado: 'As retas $(x, y) = (0, 0) + \\lambda(2, -4)$ e $y = -2x + 7$ são paralelas.',
          correta: true,
          explicacao: 'A primeira tem declive $\\dfrac{-4}{2} = -2$, igual ao da segunda; os vetores diretores $(2, -4)$ e $(1, -2)$ são colineares. Como $(0, 0)$ não está na segunda reta, são paralelas e distintas.',
        },
        {
          id: 'reta-vetorial-q06',
          tipo: 'escolha',
          enunciado: 'Qual é a equação reduzida da reta $(x, y) = (3, 1) + \\lambda(0, 2)$?',
          opcoes: ['$y = 2x + 1$', '$x = 3$', '$y = 1$', '$y = 3x$'],
          correta: 1,
          explicacao: 'O vetor diretor tem 1.ª coordenada nula: a reta é vertical e todos os pontos têm abcissa 3.',
        },
      ],
    },
  ],
});
