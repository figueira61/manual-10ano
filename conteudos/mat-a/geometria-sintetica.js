globalThis.Manual = globalThis.Manual || {};

Manual.registarTema('mat-a', {
  id: 'geometria-sintetica',
  titulo: 'Geometria sintética no plano',
  subtemas: [
    // ------------------------------------------------------------------
    {
      id: 'incentro-circuncentro',
      titulo: 'Incentro e circuncentro',
      ae: [
        'Definir e caracterizar: - incentro e circunferência inscrita (com demonstração); - circuncentro e circunferência circunscrita (com demonstração); - ortocentro; - baricentro.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Dois lugares geométricos que já conheces são a chave deste subtema. A **bissetriz** de um ângulo é o conjunto dos pontos equidistantes dos lados do ângulo. A **mediatriz** de um segmento $[AB]$ é o conjunto dos pontos equidistantes de $A$ e de $B$.',
        },
        {
          tipo: 'definicao',
          texto: '**Incentro** $I$: ponto de interseção das três bissetrizes dos ângulos internos do triângulo. Está à mesma distância $r$ dos três lados e é o centro da **circunferência inscrita** (tangente aos três lados), de raio $r$.',
        },
        {
          tipo: 'texto',
          texto: '**Demonstração.** Seja $I$ o ponto onde se cortam as bissetrizes dos ângulos $A$ e $B$. Como $I$ está na bissetriz de $A$, $d(I, AB) = d(I, AC)$; como está na bissetriz de $B$, $d(I, AB) = d(I, BC)$.',
        },
        {
          tipo: 'texto',
          texto: 'Logo $d(I, AC) = d(I, BC)$ e, como $I$ é interior ao ângulo $C$, está também na bissetriz de $C$: as três bissetrizes são concorrentes. A circunferência de centro $I$ e raio $r = d(I, AB)$ toca cada lado no pé da perpendicular — é a circunferência inscrita.',
        },
        {
          tipo: 'definicao',
          texto: '**Circuncentro** $O$: ponto de interseção das três mediatrizes dos lados do triângulo. Está à mesma distância $R$ dos três vértices e é o centro da **circunferência circunscrita** (passa pelos três vértices), de raio $R$.',
        },
        {
          tipo: 'texto',
          texto: '**Demonstração.** As mediatrizes de $[AB]$ e $[BC]$ cortam-se num ponto $O$ (os lados não são paralelos). $O$ na mediatriz de $[AB]$ dá $\\overline{OA} = \\overline{OB}$; na de $[BC]$ dá $\\overline{OB} = \\overline{OC}$. Logo $\\overline{OA} = \\overline{OC}$: $O$ está na mediatriz de $[AC]$ e a circunferência de centro $O$ e raio $\\overline{OA}$ passa pelos três vértices.',
        },
        {
          tipo: 'formula',
          texto: 'Raio da circunferência inscrita: $r = \\dfrac{\\text{Área}}{s}$, com $s$ o semiperímetro. Porquê: os triângulos $[IBC]$, $[ICA]$ e $[IAB]$ têm altura $r$, logo $\\text{Área} = \\dfrac{a\\,r + b\\,r + c\\,r}{2} = r\\,s$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'O triângulo $[ABC]$ tem $A(0, 0)$, $B(4, 0)$ e $C(0, 3)$. Calcula o raio da circunferência inscrita e as coordenadas do incentro.',
          resolucao: [
            'Lados: $\\overline{AB} = 4$, $\\overline{AC} = 3$, $\\overline{BC} = \\sqrt{4^2 + 3^2} = 5$.',
            'Área: $\\dfrac{4 \\times 3}{2} = 6$; semiperímetro: $s = \\dfrac{4 + 3 + 5}{2} = 6$.',
            '$r = \\dfrac{6}{6} = 1$.',
            '$I$ está à distância 1 do eixo $Ox$ (lado $[AB]$) e do eixo $Oy$ (lado $[AC]$), e é interior: $I(1, 1)$.',
          ],
          resultado: 1,
          verificar: () => Manual.calc.geometria.incentro([0, 0], [4, 0], [0, 3]).raio,
        },
        {
          tipo: 'exemplo',
          enunciado: 'No mesmo triângulo ($A(0, 0)$, $B(4, 0)$, $C(0, 3)$), determina o circuncentro e o raio da circunferência circunscrita.',
          resolucao: [
            'Mediatriz de $[AB]$: reta $x = 2$. Mediatriz de $[AC]$: reta $y = 1{,}5$.',
            'Interseção: $O(2;\\ 1{,}5)$, que é o ponto médio da hipotenusa $[BC]$.',
            '$R = \\overline{OA} = \\sqrt{2^2 + 1{,}5^2} = \\sqrt{6{,}25} = 2{,}5$ (metade da hipotenusa, 5).',
          ],
          resultado: 2.5,
          verificar: () => Manual.calc.geometria.circuncentro([0, 0], [4, 0], [0, 3]).raio,
        },
        {
          tipo: 'texto',
          texto: 'Num **triângulo retângulo**, o circuncentro é sempre o **ponto médio da hipotenusa** e $R$ é metade da hipotenusa: completando o triângulo até um retângulo, as diagonais são iguais e bissetam-se.',
        },
        {
          tipo: 'esquema',
          id: 'pontos-notaveis',
          opcoes: { A: [0, 0], B: [4, 0], C: [0, 3], camadas: ['incentro', 'circuncentro'] },
          legenda: 'Experimenta: arrasta C para (5 ; 3). O ângulo em B fica obtuso e O sai do triângulo; I continua sempre lá dentro.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Não troques as construções: **incentro ↔ bissetrizes ↔ lados** (circunferência inscrita, toca os lados); **circuncentro ↔ mediatrizes ↔ vértices** (circunferência circunscrita, passa pelos vértices). O raio $r$ mede-se de $I$ até um **lado**, na perpendicular — não até um vértice.',
        },
      ],
      resumo: [
        'Incentro $I$: interseção das bissetrizes; equidistante dos lados; centro da circunferência inscrita.',
        'Circuncentro $O$: interseção das mediatrizes; equidistante dos vértices; centro da circunferência circunscrita.',
        'Demonstrações: bissetriz = pontos equidistantes dos lados; mediatriz = pontos equidistantes dos extremos.',
        '$r = \\dfrac{\\text{Área}}{s}$ ($s$ = semiperímetro).',
        'Triângulo retângulo: $O$ é o ponto médio da hipotenusa e $R$ = hipotenusa ÷ 2.',
        '$I$ é sempre interior; $O$ pode ser exterior (triângulo obtusângulo).',
      ],
      quiz: [
        {
          id: 'incentro-circuncentro-q01',
          tipo: 'numerica',
          enunciado: 'Um triângulo retângulo tem catetos de 6 cm e 8 cm. Qual é o raio da circunferência inscrita?',
          resposta: 2,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            'Hipotenusa: $\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.',
            'Área: $\\dfrac{6 \\times 8}{2} = 24$; semiperímetro: $s = \\dfrac{6 + 8 + 10}{2} = 12$.',
            '$r = \\dfrac{24}{12} = 2$ cm.',
          ],
          verificar: () => Manual.calc.geometria.incentro([0, 0], [8, 0], [0, 6]).raio,
        },
        {
          id: 'incentro-circuncentro-q02',
          tipo: 'numerica',
          enunciado: 'No mesmo triângulo (catetos de 6 cm e 8 cm), qual é o raio da circunferência circunscrita?',
          resposta: 5,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            'Num triângulo retângulo, o circuncentro é o ponto médio da hipotenusa.',
            'Hipotenusa: 10 cm, logo $R = \\dfrac{10}{2} = 5$ cm.',
          ],
          verificar: () => Manual.calc.geometria.circuncentro([0, 0], [8, 0], [0, 6]).raio,
        },
        {
          id: 'incentro-circuncentro-q03',
          tipo: 'numerica',
          enunciado: 'Um triângulo isósceles tem lados de 5 cm, 5 cm e 6 cm. Qual é o raio da circunferência inscrita?',
          resposta: 1.5,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            'A altura relativa à base divide-a ao meio: $h = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4$.',
            'Área: $\\dfrac{6 \\times 4}{2} = 12$; semiperímetro: $s = \\dfrac{5 + 5 + 6}{2} = 8$.',
            '$r = \\dfrac{12}{8} = 1{,}5$ cm.',
          ],
          verificar: () => Manual.calc.geometria.incentro([-3, 0], [3, 0], [0, 4]).raio,
        },
        {
          id: 'incentro-circuncentro-q04',
          tipo: 'escolha',
          enunciado: 'Qual é o ponto que está à mesma distância dos três vértices de um triângulo?',
          opcoes: ['O circuncentro.', 'O incentro.', 'O ortocentro.', 'O baricentro.'],
          correta: 0,
          explicacao: 'O circuncentro está nas três mediatrizes, logo é equidistante dos três vértices. O incentro é equidistante dos três lados.',
        },
        {
          id: 'incentro-circuncentro-q05',
          tipo: 'vf',
          enunciado: 'O circuncentro de um triângulo está sempre no interior do triângulo.',
          correta: false,
          explicacao: 'Só nos triângulos acutângulos. Num triângulo retângulo é o ponto médio da hipotenusa e num obtusângulo é exterior.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'ortocentro-baricentro',
      titulo: 'Ortocentro, baricentro e medianas',
      ae: [
        'Definir e caracterizar: - incentro e circunferência inscrita (com demonstração); - circuncentro e circunferência circunscrita (com demonstração); - ortocentro; - baricentro.',
        'Conhecer propriedades das medianas e do baricentro: - as três medianas dividem o triângulo em seis triângulos equivalentes (com demonstração); - a distância do baricentro a qualquer dos vértices é 2/3 da mediana respetiva (com demonstração); - o baricentro é o centro de massa (gravidade, geométrico) de um triângulo.',
        'Localizar os pontos notáveis em triângulos equiláteros, isósceles e escalenos e em triângulos acutângulos, retângulos e obtusângulos.',
      ],
      minutos: 8,
      essencial: [
        {
          tipo: 'definicao',
          texto: '**Ortocentro** $H$: ponto de interseção das retas que contêm as três **alturas** do triângulo (a altura relativa a um vértice é perpendicular à reta do lado oposto).',
        },
        {
          tipo: 'definicao',
          texto: '**Baricentro** $G$: ponto de interseção das três **medianas** do triângulo (a mediana une um vértice ao ponto médio do lado oposto).',
        },
        {
          tipo: 'texto',
          texto: 'Num triângulo **retângulo** em $A$, os catetos são alturas, logo o ortocentro é o próprio vértice $A$. Num triângulo **obtusângulo**, as alturas relativas aos ângulos agudos caem fora do triângulo e $H$ é exterior.',
        },
        {
          tipo: 'texto',
          texto: '**Propriedade 1 — seis triângulos equivalentes (demonstração).** Sejam $M_a$, $M_b$, $M_c$ os pontos médios de $[BC]$, $[CA]$, $[AB]$. Os triângulos $[GBM_a]$ e $[GCM_a]$ têm bases iguais e a mesma altura: área $x$. Do mesmo modo, $[GCM_b]$ e $[GAM_b]$ têm área $y$, e $[GAM_c]$ e $[GBM_c]$ têm área $z$.',
        },
        {
          tipo: 'texto',
          texto: 'A mediana $[AM_a]$ divide $[ABC]$ em dois triângulos de igual área (bases iguais, mesma altura): $2z + x = 2y + x$, logo $y = z$. Com a mediana $[CM_c]$: $2x + z = 2y + z$, logo $x = y$. Os seis triângulos têm todos a mesma área: $\\dfrac{1}{6}$ da área de $[ABC]$.',
        },
        {
          tipo: 'texto',
          texto: '**Propriedade 2 — distância do baricentro ao vértice (demonstração).** Vamos provar que $\\overline{AG} = \\dfrac{2}{3}\\,\\overline{AM_a}$. Os triângulos $[ABG]$ e $[GBM_a]$ têm a mesma altura (a partir de $B$) e bases $[AG]$ e $[GM_a]$ na mesma reta. Pela propriedade 1, as áreas são $2x$ e $x$, logo $\\overline{AG} = 2\\,\\overline{GM_a}$, ou seja, $\\overline{AG} = \\dfrac{2}{3}\\,\\overline{AM_a}$. O mesmo vale para os outros vértices.',
        },
        {
          tipo: 'formula',
          texto: '$\\overline{AG} = \\dfrac{2}{3}\\,\\overline{AM_a}$ e $\\overline{GM_a} = \\dfrac{1}{3}\\,\\overline{AM_a}$. Em coordenadas, $G$ é a média dos vértices: $G\\left(\\dfrac{x_A + x_B + x_C}{3}, \\dfrac{y_A + y_B + y_C}{3}\\right)$.',
        },
        {
          tipo: 'texto',
          texto: '**Propriedade 3 — centro de massa.** Uma placa triangular homogénea fica em equilíbrio apoiada em $G$. Corta a placa em tiras finas paralelas a $[BC]$: o centro de cada tira está na mediana $[AM_a]$, logo o centro de massa está nessa mediana — e, pelo mesmo motivo, nas outras duas. Está, portanto, em $G$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Num triângulo $[ABC]$, a mediana $[AM]$ mede 12 cm. Calcula $\\overline{AG}$ e $\\overline{GM}$.',
          resolucao: [
            '$\\overline{AG} = \\dfrac{2}{3} \\times 12 = 8$ cm.',
            '$\\overline{GM} = 12 - 8 = 4$ cm (confirma: $\\dfrac{1}{3} \\times 12 = 4$).',
          ],
          resultado: 8,
          verificar: () => {
            const g = Manual.calc.geometria;
            // A(0, 0) e M(12, 0) = ponto médio de [BC], com B(12, 5) e C(12, −5): mediana de 12.
            return g.distancia([0, 0], g.baricentro([0, 0], [12, 5], [12, -5]));
          },
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina o baricentro do triângulo de vértices $A(1, 2)$, $B(5, -1)$ e $C(3, 8)$.',
          resolucao: [
            'Ponto médio de $[BC]$: $M\\left(\\dfrac{5 + 3}{2}, \\dfrac{-1 + 8}{2}\\right) = M(4;\\ 3{,}5)$.',
            '$G = A + \\dfrac{2}{3}\\,\\overrightarrow{AM} = (1, 2) + \\dfrac{2}{3}(3;\\ 1{,}5) = (1, 2) + (2, 1) = (3, 3)$.',
            'Confirmação pela média dos vértices: $\\left(\\dfrac{1 + 5 + 3}{3}, \\dfrac{2 - 1 + 8}{3}\\right) = (3, 3)$.',
          ],
          resultado: 3,
          verificar: () => Manual.calc.geometria.baricentro([1, 2], [5, -1], [3, 8])[0],
        },
        {
          tipo: 'esquema',
          id: 'pontos-notaveis',
          opcoes: { A: [0, 0], B: [6, 0], C: [2, 4], camadas: ['ortocentro', 'baricentro'] },
          legenda: 'Experimenta: leva C para (0 ; 4) e H coincide com A (ângulo reto); leva C para (−2 ; 3) e H sai do triângulo. Confirma no painel que AG = 2/3 × AM.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Triângulo', '$I$ e $G$', 'Circuncentro $O$', 'Ortocentro $H$'],
          linhas: [
            ['Acutângulo', 'Interiores', 'Interior', 'Interior'],
            ['Retângulo', 'Interiores', 'Ponto médio da hipotenusa', 'Vértice do ângulo reto'],
            ['Obtusângulo', 'Interiores', 'Exterior, para lá do maior lado', 'Exterior, para lá do vértice do ângulo obtuso'],
            ['Equilátero', 'Os quatro pontos coincidem', 'Coincide com $I$, $G$, $H$', 'Coincide com $I$, $G$, $O$'],
            ['Isósceles', 'No eixo de simetria', 'No eixo de simetria', 'No eixo de simetria'],
            ['Escaleno', 'Os quatro pontos são distintos', 'Alinhado com $G$ e $H$', 'Alinhado com $O$ e $G$'],
          ],
        },
        {
          tipo: 'erro-frequente',
          texto: '**Mediana**, **altura** e **mediatriz** são coisas diferentes: a mediana vai do vértice ao ponto médio do lado oposto; a altura vai do vértice, perpendicular ao lado oposto; a mediatriz é perpendicular ao lado no ponto médio e não tem de passar pelo vértice. E $G$ fica a $\\dfrac{2}{3}$ da mediana **a partir do vértice**, não do lado.',
        },
      ],
      resumo: [
        'Ortocentro $H$: interseção das alturas · baricentro $G$: interseção das medianas.',
        'As três medianas dividem o triângulo em 6 triângulos com a mesma área.',
        '$\\overline{AG} = \\dfrac{2}{3}\\,\\overline{AM_a}$ e $\\overline{GM_a} = \\dfrac{1}{3}\\,\\overline{AM_a}$.',
        '$G$ é o centro de massa; em coordenadas, a média dos três vértices.',
        '$I$ e $G$ sempre interiores; $O$ e $H$ exteriores no obtusângulo; no retângulo, $H$ é o vértice do ângulo reto.',
        'Equilátero: os quatro coincidem · isósceles: todos no eixo de simetria.',
      ],
      quiz: [
        {
          id: 'ortocentro-baricentro-q01',
          tipo: 'numerica',
          enunciado: 'Num triângulo $[ABC]$, a mediana $[BM]$ mede 15 cm. Quanto mede $[BG]$, sendo $G$ o baricentro?',
          resposta: 10,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            '$\\overline{BG} = \\dfrac{2}{3}\\,\\overline{BM}$.',
            '$\\dfrac{2}{3} \\times 15 = 10$ cm.',
          ],
          verificar: () => {
            const g = Manual.calc.geometria;
            // B(0, 0) e M(15, 0) = ponto médio de [AC], com A(15, 4) e C(15, −4).
            return g.distancia([0, 0], g.baricentro([15, 4], [0, 0], [15, -4]));
          },
        },
        {
          id: 'ortocentro-baricentro-q02',
          tipo: 'numerica',
          enunciado: 'Um triângulo $[ABC]$ tem 48 cm² de área e baricentro $G$. Qual é a área do triângulo $[ABG]$?',
          resposta: 16,
          tolerancia: 0,
          unidade: 'cm²',
          resolucao: [
            'As medianas dividem $[ABC]$ em 6 triângulos com a mesma área: $\\dfrac{48}{6} = 8$ cm² cada.',
            '$[ABG]$ é formado por dois deles ($[AGM_c]$ e $[GBM_c]$, sendo $M_c$ o ponto médio de $[AB]$).',
            'Área de $[ABG]$: $2 \\times 8 = 16$ cm² (um terço da área total).',
          ],
          verificar: () => (2 * 48) / 6,
        },
        {
          id: 'ortocentro-baricentro-q03',
          tipo: 'numerica',
          enunciado: 'Qual é a ordenada do baricentro do triângulo de vértices $A(-2, 1)$, $B(4, 3)$ e $C(1, -7)$?',
          resposta: -1,
          tolerancia: 0,
          resolucao: [
            'A ordenada de $G$ é a média das ordenadas dos vértices.',
            '$\\dfrac{1 + 3 + (-7)}{3} = \\dfrac{-3}{3} = -1$.',
          ],
          verificar: () => Manual.calc.geometria.baricentro([-2, 1], [4, 3], [1, -7])[1],
        },
        {
          id: 'ortocentro-baricentro-q04',
          tipo: 'escolha',
          enunciado: 'O triângulo $[ABC]$ é retângulo em $A$. Onde fica o ortocentro?',
          opcoes: ['No vértice $A$.', 'No ponto médio de $[BC]$.', 'No interior do triângulo.', 'Fora do triângulo.'],
          correta: 0,
          explicacao: 'Os catetos $[AB]$ e $[AC]$ são alturas e cortam-se em $A$. O ponto médio de $[BC]$ é o circuncentro.',
        },
        {
          id: 'ortocentro-baricentro-q05',
          tipo: 'vf',
          enunciado: 'Num triângulo obtusângulo, o baricentro fica fora do triângulo.',
          correta: false,
          explicacao: 'O baricentro (tal como o incentro) é sempre interior: está nas medianas, a $\\frac{2}{3}$ de cada uma a partir do vértice. Os que ficam fora são o circuncentro e o ortocentro.',
        },
        {
          id: 'ortocentro-baricentro-q06',
          tipo: 'escolha',
          enunciado: 'Num triângulo isósceles $[ABC]$, com $\\overline{AB} = \\overline{AC}$, onde ficam os pontos notáveis $I$, $O$, $H$ e $G$?',
          opcoes: [
            'Todos na mediana relativa a $[BC]$, que é o eixo de simetria.',
            'Todos no mesmo ponto.',
            'Todos no lado $[BC]$.',
            'Em posições sem qualquer relação entre si.',
          ],
          correta: 0,
          explicacao: 'A mediana relativa a $[BC]$ é também altura, bissetriz do ângulo $A$ e mediatriz de $[BC]$; os quatro pontos estão sobre ela. Só coincidem se o triângulo for equilátero.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'euler-nove-pontos',
      titulo: 'Reta de Euler e circunferência dos nove pontos',
      ae: [
        'Verificar a existência da reta de Euler e da circunferência dos nove pontos.',
        'Resolver problemas envolvendo relações métricas entre os pontos notáveis.',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'definicao',
          texto: '**Reta de Euler:** num triângulo não equilátero, o circuncentro $O$, o baricentro $G$ e o ortocentro $H$ estão alinhados. $G$ fica entre $O$ e $H$, com $\\overline{GH} = 2\\,\\overline{OG}$. O incentro, em geral, não está nesta reta.',
        },
        {
          tipo: 'texto',
          texto: '**Porquê (ideia).** Os pontos médios dos lados formam o triângulo medial, com lados paralelos aos de $[ABC]$ e metade do tamanho. As mediatrizes de $[ABC]$ são as alturas do triângulo medial, logo $O$ é o ortocentro do medial. Como o medial é $[ABC]$ «rodado meia-volta e reduzido a metade» à volta de $G$, $H$ passa para $O$: $O$, $G$, $H$ alinhados e $\\overline{OG} = \\dfrac{1}{2}\\,\\overline{GH}$.',
        },
        {
          tipo: 'definicao',
          texto: '**Circunferência dos nove pontos:** passa pelos 3 pontos médios dos lados, pelos 3 pés das alturas e pelos 3 pontos médios de $[AH]$, $[BH]$ e $[CH]$. O centro $N$ é o ponto médio de $[OH]$ e o raio é $\\dfrac{R}{2}$ (é a circunferência circunscrita ao triângulo medial).',
        },
        {
          tipo: 'formula',
          texto: '$\\overline{GH} = 2\\,\\overline{OG}$ · $\\overline{OH} = 3\\,\\overline{OG}$ · $N$ = ponto médio de $[OH]$ · $r_N = \\dfrac{R}{2}$. Na reta de Euler, a ordem é $O$, $G$, $N$, $H$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'O triângulo $[ABC]$ tem $A(0, 0)$, $B(8, 0)$ e $C(0, 6)$. Determina $O$, $H$, $G$ e a circunferência dos nove pontos, e verifica que $\\overline{GH} = 2\\,\\overline{OG}$.',
          resolucao: [
            'Retângulo em $A$: $H = A = (0, 0)$; $O$ = ponto médio de $[BC]$ $= (4, 3)$; $R = \\dfrac{10}{2} = 5$.',
            '$G = \\left(\\dfrac{0 + 8 + 0}{3}, \\dfrac{0 + 0 + 6}{3}\\right) = \\left(\\dfrac{8}{3}, 2\\right)$.',
            '$\\overline{OG} = \\sqrt{\\left(\\tfrac{4}{3}\\right)^2 + 1^2} = \\dfrac{5}{3}$ e $\\overline{GH} = \\sqrt{\\left(\\tfrac{8}{3}\\right)^2 + 2^2} = \\dfrac{10}{3} = 2 \\times \\dfrac{5}{3}$. ✓',
            '$N$ = ponto médio de $[OH]$ $= (2;\\ 1{,}5)$ e $r_N = \\dfrac{5}{2} = 2{,}5$.',
          ],
          resultado: 2.5,
          verificar: () => Manual.calc.geometria.circunferenciaNovePontos([0, 0], [8, 0], [0, 6]).raio,
        },
        {
          tipo: 'exemplo',
          enunciado: 'O triângulo isósceles $[ABC]$ tem $A(0, 8)$, $B(-4, 0)$ e $C(4, 0)$. Usa a reta de Euler para encontrar o ortocentro.',
          resolucao: [
            'Por simetria, $O$, $G$ e $H$ estão no eixo $Oy$. $O(0, k)$ com $\\overline{OB} = \\overline{OA}$: $16 + k^2 = (8 - k)^2 \\Leftrightarrow 16k = 48 \\Leftrightarrow k = 3$. $O(0, 3)$, $R = 5$.',
            '$G = \\left(0, \\dfrac{8 + 0 + 0}{3}\\right) = \\left(0, \\dfrac{8}{3}\\right)$, logo $\\overrightarrow{OG} = \\left(0, -\\dfrac{1}{3}\\right)$.',
            '$H = O + 3\\,\\overrightarrow{OG} = (0, 3) + (0, -1) = (0, 2)$.',
            '$N$ = ponto médio de $[OH]$ $= (0;\\ 2{,}5)$ e $r_N = 2{,}5$.',
          ],
          resultado: 2,
          verificar: () => Manual.calc.geometria.ortocentro([0, 8], [-4, 0], [4, 0])[1],
        },
        {
          tipo: 'esquema',
          id: 'pontos-notaveis',
          opcoes: { A: [0, 0], B: [6, 0], C: [2, 4], camadas: ['circuncentro', 'ortocentro', 'baricentro', 'euler', 'novePontos'] },
          legenda: 'Experimenta: arrasta os vértices e confirma que O, G e H ficam sempre alinhados e que N está a meio de [OH]. Põe C em (3 ; 4): a reta de Euler passa a ser o eixo de simetria.',
        },
        {
          tipo: 'erro-frequente',
          texto: '$G$ está **mais perto de $O$** do que de $H$ ($\\overline{OG} = \\dfrac{1}{3}\\,\\overline{OH}$). E o raio da circunferência dos nove pontos é metade de $R$ (circunscrita), não de $r$ (inscrita).',
        },
      ],
      resumo: [
        'Reta de Euler: $O$, $G$ e $H$ alinhados (exceto no equilátero, onde coincidem).',
        '$\\overline{GH} = 2\\,\\overline{OG}$ e $\\overline{OH} = 3\\,\\overline{OG}$.',
        'Nove pontos: pontos médios dos lados, pés das alturas e pontos médios de $[AH]$, $[BH]$, $[CH]$.',
        'Centro $N$ = ponto médio de $[OH]$; raio $= \\dfrac{R}{2}$.',
        'No triângulo retângulo: $H$ = vértice do ângulo reto, $O$ = ponto médio da hipotenusa, $\\overline{OH} = R$.',
      ],
      quiz: [
        {
          id: 'euler-nove-pontos-q01',
          tipo: 'numerica',
          enunciado: 'Num triângulo, a distância do circuncentro ao baricentro é $\\overline{OG} = 2$ cm. Quanto mede $\\overline{OH}$?',
          resposta: 6,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            '$\\overline{GH} = 2\\,\\overline{OG} = 2 \\times 2 = 4$ cm.',
            '$G$ está entre $O$ e $H$: $\\overline{OH} = \\overline{OG} + \\overline{GH} = 2 + 4 = 6$ cm.',
          ],
          verificar: () => {
            const g = Manual.calc.geometria;
            // Razão OH/OG num triângulo concreto (A(0, 0), B(6, 0), C(2, 4)), multiplicada por OG = 2.
            const A = [0, 0], B = [6, 0], C = [2, 4];
            const O = g.circuncentro(A, B, C).centro;
            return (2 * g.distancia(O, g.ortocentro(A, B, C))) / g.distancia(O, g.baricentro(A, B, C));
          },
        },
        {
          id: 'euler-nove-pontos-q02',
          tipo: 'numerica',
          enunciado: 'A circunferência circunscrita a um triângulo tem 7 cm de raio. Qual é o raio da circunferência dos nove pontos?',
          resposta: 3.5,
          tolerancia: 0,
          unidade: 'cm',
          resolucao: [
            'O raio da circunferência dos nove pontos é metade do raio da circunscrita.',
            '$\\dfrac{7}{2} = 3{,}5$ cm.',
          ],
          verificar: () => Manual.calc.geometria.circunferenciaNovePontos([7, 0], [-7, 0], [0, 7]).raio,
        },
        {
          id: 'euler-nove-pontos-q03',
          tipo: 'numerica',
          enunciado: 'Num triângulo, o circuncentro é $O(1, 2)$ e o ortocentro é $H(7, 5)$. Qual é a ordenada do centro $N$ da circunferência dos nove pontos?',
          resposta: 3.5,
          tolerancia: 0,
          resolucao: [
            '$N$ é o ponto médio de $[OH]$.',
            '$N\\left(\\dfrac{1 + 7}{2}, \\dfrac{2 + 5}{2}\\right) = N(4;\\ 3{,}5)$: a ordenada é $3{,}5$.',
          ],
          verificar: () => Manual.calc.geometria.pontoMedio([1, 2], [7, 5])[1],
        },
        {
          id: 'euler-nove-pontos-q04',
          tipo: 'numerica',
          enunciado: 'Com $O(1, 2)$ e $H(7, 5)$, qual é a abcissa do baricentro $G$?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            '$G$ está em $[OH]$, com $\\overline{OG} = \\dfrac{1}{3}\\,\\overline{OH}$: $G = O + \\dfrac{1}{3}\\,\\overrightarrow{OH}$.',
            '$\\overrightarrow{OH} = (6, 3)$, logo $G = (1, 2) + (2, 1) = (3, 3)$: a abcissa é 3.',
          ],
          verificar: () => {
            const g = Manual.calc.geometria;
            return g.somar([1, 2], g.escalar(1 / 3, g.vetor([1, 2], [7, 5])))[0];
          },
        },
        {
          id: 'euler-nove-pontos-q05',
          tipo: 'escolha',
          enunciado: 'Quais destes pontos pertencem sempre à circunferência dos nove pontos?',
          opcoes: [
            'Os pontos médios dos lados e os pés das alturas.',
            'Os vértices do triângulo.',
            'O incentro e o baricentro.',
            'Os pontos médios de $[OA]$, $[OB]$ e $[OC]$.',
          ],
          correta: 0,
          explicacao: 'Os nove pontos são os 3 pontos médios dos lados, os 3 pés das alturas e os pontos médios de $[AH]$, $[BH]$ e $[CH]$ (com $H$, não com $O$). Os vértices estão na circunscrita.',
        },
        {
          id: 'euler-nove-pontos-q06',
          tipo: 'vf',
          enunciado: 'Num triângulo retângulo, o centro da circunferência dos nove pontos é o ponto médio do segmento que une o vértice do ângulo reto ao ponto médio da hipotenusa.',
          correta: true,
          explicacao: 'O vértice do ângulo reto é o ortocentro $H$ e o ponto médio da hipotenusa é o circuncentro $O$; o centro $N$ é o ponto médio de $[OH]$.',
        },
      ],
    },
  ],
});
