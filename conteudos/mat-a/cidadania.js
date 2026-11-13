globalThis.Manual = globalThis.Manual || {};

Manual.registarTema('mat-a', {
  id: 'cidadania',
  titulo: 'Modelos Matemáticos para a Cidadania',
  subtemas: [
    // ------------------------------------------------------------------
    {
      id: 'maiorias',
      titulo: 'Maioria simples e maioria absoluta',
      ae: [
        'Reconhecer o papel da matemática na escolha de representantes em sistemas políticos e sociais.',
        'Perceber que existem modelos matemáticos que permitem criar procedimentos para transformar as preferências individuais numa decisão coletiva.',
        'Identificar o vencedor de um processo eleitoral através de maioria simples e maioria absoluta.',
      ],
      minutos: 4,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Numa eleição, cada pessoa tem a sua preferência; é preciso um **método eleitoral** — uma regra matemática — para transformar essas preferências numa decisão coletiva. Métodos diferentes podem dar vencedores diferentes.',
        },
        {
          tipo: 'definicao',
          texto: '**Maioria simples (ou relativa):** vence o candidato com mais votos, mesmo que não chegue a metade.',
        },
        {
          tipo: 'definicao',
          texto: '**Maioria absoluta:** vence o candidato com **mais de metade** dos votos validamente expressos.',
        },
        {
          tipo: 'formula',
          texto: 'Votos que garantem a maioria absoluta, sendo $T$ o total de votos: $\\left\\lfloor \\dfrac{T}{2} \\right\\rfloor + 1$ (a parte inteira de metade, mais um).',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Numa eleição com três candidatos, A teve 270 votos, B teve 153 e C teve 201. Quantos votos garantem a maioria absoluta? Há vencedor por maioria absoluta?',
          resolucao: [
            'Total de votos: $T = 270 + 153 + 201 = 624$.',
            'Metade: $\\dfrac{624}{2} = 312$; a maioria absoluta exige mais do que isso: $312 + 1 = 313$ votos.',
            'O mais votado é A, com 270 votos: vence por maioria simples.',
            'Como $270 < 313$, ninguém tem maioria absoluta.',
          ],
          resultado: 313,
          verificar: () => Manual.calc.cidadania.maioria([270, 153, 201]).limiarAbsoluta,
        },
        {
          tipo: 'texto',
          texto: 'Quando se exige maioria absoluta e ninguém a obtém, pode fazer-se uma **segunda volta** entre os dois mais votados. É o que acontece na eleição do Presidente da República: em 1986, Freitas do Amaral foi o mais votado na 1.ª volta, mas sem maioria absoluta, e Mário Soares venceu a 2.ª volta.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Maioria absoluta não é "metade dos votos": com 624 votos, 312 é exatamente metade e **não** chega. São precisos 313. Com um total ímpar, por exemplo 625, metade é 312,5 e também bastam 313.',
        },
        {
          tipo: 'texto',
          texto: 'Programa em Python (das AE) que calcula os votos que garantem a maioria absoluta e verifica se algum candidato a obteve:',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'cA = int(input("N.º de votos do candidato A: "))',
            'cB = int(input("N.º de votos do candidato B: "))',
            'cC = int(input("N.º de votos do candidato C: "))',
            'ma = int((cA + cB + cC) / 2) + 1',
            'print("Maioria absoluta:", ma, "votos")',
            'if cA >= ma or cB >= ma or cC >= ma:',
            '    print("Há um vencedor por maioria absoluta.")',
            'else:',
            '    print("Ninguém tem maioria absoluta.")',
          ].join('\n'),
        },
      ],
      resumo: [
        'Um método eleitoral transforma preferências individuais numa decisão coletiva.',
        'Maioria simples: vence quem tem mais votos.',
        'Maioria absoluta: mais de metade dos votos, isto é, $\\left\\lfloor \\frac{T}{2} \\right\\rfloor + 1$ votos.',
        'Sem maioria absoluta, pode haver segunda volta (ex.: eleição presidencial de 1986).',
      ],
      quiz: [
        {
          id: 'maiorias-q01',
          tipo: 'numerica',
          enunciado: 'Numa eleição para a Associação de Estudantes, a lista A teve 412 votos, a B 305 e a C 183. Quantos votos garantem a maioria absoluta?',
          resposta: 451,
          tolerancia: 0,
          resolucao: [
            'Total: $412 + 305 + 183 = 900$.',
            'Metade: $\\dfrac{900}{2} = 450$.',
            'Maioria absoluta: $450 + 1 = 451$ votos.',
          ],
          verificar: () => Manual.calc.cidadania.maioria([412, 305, 183]).limiarAbsoluta,
        },
        {
          id: 'maiorias-q02',
          tipo: 'numerica',
          enunciado: 'Na mesma eleição (412, 305 e 183 votos), quantos votos faltaram a A para ter maioria absoluta?',
          resposta: 39,
          tolerancia: 0,
          resolucao: [
            'Maioria absoluta: 451 votos.',
            'A teve 412 votos: faltaram $451 - 412 = 39$ votos.',
          ],
          verificar: () => Manual.calc.cidadania.maioria([412, 305, 183]).limiarAbsoluta - 412,
        },
        {
          id: 'maiorias-q03',
          tipo: 'vf',
          enunciado: 'Um candidato com maioria absoluta tem sempre também maioria simples.',
          correta: true,
          explicacao: 'Se tem mais de metade dos votos, nenhum outro pode ter mais votos do que ele.',
        },
        {
          id: 'maiorias-q04',
          tipo: 'escolha',
          enunciado: 'Votaram 1000 pessoas. Qual destes resultados dá maioria absoluta ao candidato?',
          opcoes: ['500 votos', '501 votos', '499 votos', '334 votos'],
          correta: 1,
          explicacao: 'Metade de 1000 é 500; é preciso mais do que metade, logo pelo menos 501.',
        },
        {
          id: 'maiorias-q05',
          tipo: 'vf',
          enunciado: 'Numa eleição com três candidatos, há sempre um vencedor por maioria absoluta.',
          correta: false,
          explicacao: 'Com três ou mais candidatos os votos dividem-se e pode ninguém passar de metade (como 270, 153 e 201).',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'borda',
      titulo: 'Método de Borda',
      ae: [
        'Identificar o vencedor de processos eleitorais que recorram a boletins de preferência (método de Borda).',
        'Perceber que existem modelos matemáticos que permitem criar procedimentos para transformar as preferências individuais numa decisão coletiva.',
      ],
      minutos: 5,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Num **boletim de preferência**, cada eleitor ordena todos os candidatos, do preferido ao menos preferido. Assim, o método usa mais informação do que apenas o 1.º lugar.',
        },
        {
          tipo: 'definicao',
          texto: '**Método de Borda:** com $n$ candidatos, cada boletim dá $n$ pontos ao 1.º lugar, $n-1$ ao 2.º, …, e 1 ponto ao último. Somam-se os pontos de todos os boletins; vence quem tiver mais pontos.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Dez alunos ordenaram três candidatos: 4 boletins Ana > Bruno > Carla; 3 boletins Bruno > Carla > Ana; 3 boletins Carla > Bruno > Ana. Quem vence por maioria simples? E pelo método de Borda?',
          resolucao: [
            'Primeiros lugares: Ana 4, Bruno 3, Carla 3. Por maioria simples vence a **Ana** (sem maioria absoluta: precisava de 6).',
            'Borda (3, 2 e 1 pontos). Ana: $4 \\times 3 + 3 \\times 1 + 3 \\times 1 = 18$.',
            'Bruno: $4 \\times 2 + 3 \\times 3 + 3 \\times 2 = 23$.',
            'Carla: $4 \\times 1 + 3 \\times 2 + 3 \\times 3 = 19$.',
            'Pelo método de Borda vence o **Bruno**, com 23 pontos.',
          ],
          resultado: 23,
          verificar: () => Manual.calc.cidadania.borda([
            { ordem: [0, 1, 2], quantidade: 4 },
            { ordem: [1, 2, 0], quantidade: 3 },
            { ordem: [2, 1, 0], quantidade: 3 },
          ], 3).pontos[1],
        },
        {
          tipo: 'texto',
          texto: 'A mesma votação deu vencedores diferentes: a Ana é a preferida de muitos, mas é a última escolha de 6 eleitores; o Bruno nunca fica em último. Todos os métodos eleitorais têm limitações — a escolha do método influencia o resultado.',
        },
        {
          tipo: 'esquema',
          id: 'borda',
          opcoes: {},
          legenda: 'Experimenta: muda as quantidades de boletins e vê quando a maioria simples e o método de Borda deixam de coincidir.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Não te esqueças de multiplicar os pontos pelo **número de boletins** de cada tipo. Há também quem use $n-1, \\ldots, 1, 0$ pontos: os totais mudam, mas a ordem final dos candidatos é a mesma.',
        },
      ],
      resumo: [
        'Boletim de preferência: cada eleitor ordena todos os candidatos.',
        'Borda com $n$ candidatos: $n$ pontos ao 1.º, …, 1 ao último.',
        'Pontos de um candidato: soma de (pontos da posição × n.º de boletins).',
        'Métodos diferentes podem eleger vencedores diferentes para a mesma votação.',
      ],
      quiz: [
        {
          id: 'borda-q01',
          tipo: 'numerica',
          enunciado: 'Na eleição do exemplo (4 Ana > Bruno > Carla; 3 Bruno > Carla > Ana; 3 Carla > Bruno > Ana), quantos pontos de Borda tem a Carla?',
          resposta: 19,
          tolerancia: 0,
          resolucao: [
            'A Carla fica em 3.º nos 4 primeiros boletins: $4 \\times 1 = 4$.',
            'Fica em 2.º nos 3 boletins seguintes: $3 \\times 2 = 6$.',
            'Fica em 1.º nos últimos 3: $3 \\times 3 = 9$.',
            'Total: $4 + 6 + 9 = 19$ pontos.',
          ],
          verificar: () => Manual.calc.cidadania.borda([
            { ordem: [0, 1, 2], quantidade: 4 },
            { ordem: [1, 2, 0], quantidade: 3 },
            { ordem: [2, 1, 0], quantidade: 3 },
          ], 3).pontos[2],
        },
        {
          id: 'borda-q02',
          tipo: 'numerica',
          enunciado: 'Quatro candidatos para a Associação de Estudantes: 8 boletins A > B > C > D; 6 boletins B > C > D > A; 5 boletins C > B > D > A; 2 boletins D > B > C > A. Quantos pontos de Borda tem B (4, 3, 2, 1 pontos)?',
          resposta: 69,
          tolerancia: 0,
          resolucao: [
            'B em 2.º em 8 boletins: $8 \\times 3 = 24$.',
            'B em 1.º em 6 boletins: $6 \\times 4 = 24$.',
            'B em 2.º em 5 boletins: $5 \\times 3 = 15$.',
            'B em 2.º em 2 boletins: $2 \\times 3 = 6$.',
            'Total: $24 + 24 + 15 + 6 = 69$ pontos.',
          ],
          verificar: () => Manual.calc.cidadania.borda([
            { ordem: [0, 1, 2, 3], quantidade: 8 },
            { ordem: [1, 2, 3, 0], quantidade: 6 },
            { ordem: [2, 1, 3, 0], quantidade: 5 },
            { ordem: [3, 1, 2, 0], quantidade: 2 },
          ], 4).pontos[1],
        },
        {
          id: 'borda-q03',
          tipo: 'escolha',
          enunciado: 'Numa eleição com 21 eleitores e quatro candidatos houve 8 boletins A > B > C > D, 6 boletins B > C > D > A, 5 boletins C > B > D > A e 2 boletins D > B > C > A. Os pontos de Borda são A 45, B 69, C 58 e D 38. Que conclusão é correta?',
          opcoes: [
            'A vence por maioria simples, mas B vence pelo método de Borda.',
            'A vence pelos dois métodos.',
            'B vence pelos dois métodos.',
            'A tem maioria absoluta.',
          ],
          correta: 0,
          explicacao: 'A tem mais primeiros lugares (8 em 21, sem maioria absoluta), mas é último em 13 boletins; B tem mais pontos de Borda.',
        },
        {
          id: 'borda-q04',
          tipo: 'vf',
          enunciado: 'No método de Borda, um candidato que nunca é o 1.º de ninguém pode ganhar a eleição.',
          correta: true,
          explicacao: 'Se ficar em 2.º lugar em quase todos os boletins pode acumular mais pontos do que os outros.',
        },
        {
          id: 'borda-q05',
          tipo: 'escolha',
          enunciado: 'Com 5 candidatos, quantos pontos dá cada boletim ao candidato colocado em 2.º lugar?',
          opcoes: ['4', '2', '5', '3'],
          correta: 0,
          explicacao: 'O 1.º recebe 5 pontos, o 2.º recebe 4, …, o último recebe 1.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'hondt-stlague',
      titulo: 'Métodos de Hondt e de St. Laguë',
      ae: [
        'Perceber que existem modelos matemáticos que permitem criar procedimentos para fazer distribuições proporcionais.',
        'Conhecer e aplicar o método de Hondt e o método de St. Laguë.',
        'Identificar vantagens e limitações dos métodos de Hondt e St. Laguë.',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'texto',
          texto: 'Quando se elegem vários representantes (deputados, vereadores), queremos que os mandatos sejam **proporcionais** aos votos. Como os mandatos são números inteiros, a proporção exata é quase sempre impossível; os métodos de Hondt e de St. Laguë dizem como arredondar.',
        },
        {
          tipo: 'definicao',
          texto: '**Método de Hondt:** divide-se o número de votos de cada partido por $1, 2, 3, 4, \\ldots$ Os mandatos são atribuídos, um a um, aos **maiores quocientes**.',
        },
        {
          tipo: 'definicao',
          texto: '**Método de St. Laguë:** igual, mas os divisores são os ímpares $1, 3, 5, 7, \\ldots$',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Distribui 7 mandatos pelo método de Hondt: A tem 10 000 votos, B 6000, C 3500 e D 1500.',
          resolucao: [
            'Calcular os quocientes (votos ÷ 1, 2, 3, 4) — ver o quadro abaixo.',
            'Ordenar os quocientes: 10 000 (A), 6000 (B), 5000 (A), 3500 (C), 3333,33 (A), 3000 (B), 2500 (A).',
            'O 8.º quociente seria 2000 (B), que já não entra.',
            'Resultado: A 4 mandatos, B 2, C 1, D 0.',
          ],
          resultado: 4,
          verificar: () => Manual.calc.cidadania.hondt([10000, 6000, 3500, 1500], 7).mandatos[0],
        },
        {
          tipo: 'quadro',
          cabecalho: ['Divisor', 'A', 'B', 'C', 'D'],
          linhas: [
            ['÷ 1', '**10 000**', '**6000**', '**3500**', '1500'],
            ['÷ 2', '**5000**', '**3000**', '1750', '750'],
            ['÷ 3', '**3333,33**', '2000', '1166,67', '500'],
            ['÷ 4', '**2500**', '1500', '875', '375'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Com St. Laguë (divisores 1, 3, 5, …) a mesma eleição dá A 3, B 2, C 1 e D 1: o partido D, pequeno, consegue um mandato. Métodos de partilha diferentes geram distribuições diferentes.',
        },
        {
          tipo: 'esquema',
          id: 'hondt',
          opcoes: {
            partidos: [
              { nome: 'A', votos: 10000 },
              { nome: 'B', votos: 6000 },
              { nome: 'C', votos: 3500 },
              { nome: 'D', votos: 1500 },
            ],
            mandatos: 7,
          },
          legenda: 'Experimenta: usa «Passo seguinte» para ver cada mandato a ser atribuído e depois «Comparar os dois métodos»; muda os votos e os mandatos.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Método', 'Vantagens', 'Limitações'],
          linhas: [
            ['Hondt', 'Simples; favorece maiorias estáveis; usado em Portugal na Assembleia da República e nas autárquicas.', 'Favorece os partidos maiores; os pequenos precisam de muitos votos por mandato.'],
            ['St. Laguë', 'Mais próximo da proporcionalidade; trata melhor os partidos pequenos.', 'Pode fragmentar mais a assembleia e dificultar maiorias.'],
          ],
        },
        {
          tipo: 'texto',
          texto: 'Limitação comum: com poucos mandatos (círculos pequenos), nenhum método é muito proporcional e muitos votos não elegem ninguém.',
        },
        {
          tipo: 'erro-frequente',
          texto: 'Não se dá "um mandato por partido e depois o resto": em cada passo o mandato vai para o **maior quociente** ainda não usado, mesmo que esse partido já tenha mandatos.',
        },
      ],
      resumo: [
        'Objetivo: distribuir mandatos de forma (aproximadamente) proporcional aos votos.',
        'Hondt: divisores $1, 2, 3, \\ldots$; mandatos para os maiores quocientes.',
        'St. Laguë: divisores $1, 3, 5, \\ldots$',
        'Hondt favorece os grandes partidos; St. Laguë é mais favorável aos pequenos.',
        'Métodos diferentes podem dar distribuições diferentes para a mesma eleição.',
      ],
      quiz: [
        {
          id: 'hondt-stlague-q01',
          tipo: 'numerica',
          enunciado: 'Numa pequena assembleia de freguesia (exemplo simplificado) elegem-se 5 mandatos. A lista A teve 4200 votos, B 2700 e C 1500. Quantos mandatos tem A pelo método de Hondt?',
          resposta: 3,
          tolerancia: 0,
          resolucao: [
            'Quocientes de A: 4200, 2100, 1400, 1050.',
            'Quocientes de B: 2700, 1350. Quocientes de C: 1500, 750.',
            'Os 5 maiores: 4200 (A), 2700 (B), 2100 (A), 1500 (C), 1400 (A).',
            'A fica com 3 mandatos (B 1, C 1).',
          ],
          verificar: () => Manual.calc.cidadania.hondt([4200, 2700, 1500], 5).mandatos[0],
        },
        {
          id: 'hondt-stlague-q02',
          tipo: 'numerica',
          enunciado: 'Na mesma eleição (4200, 2700 e 1500 votos, 5 mandatos), quantos mandatos tem B pelo método de St. Laguë?',
          resposta: 2,
          tolerancia: 0,
          resolucao: [
            'Quocientes de A (÷1, 3, 5): 4200, 1400, 840.',
            'Quocientes de B: 2700, 900, 540. Quocientes de C: 1500, 500.',
            'Os 5 maiores: 4200 (A), 2700 (B), 1500 (C), 1400 (A), 900 (B).',
            'B fica com 2 mandatos (A 2, C 1).',
          ],
          verificar: () => Manual.calc.cidadania.stLague([4200, 2700, 1500], 5).mandatos[1],
        },
        {
          id: 'hondt-stlague-q03',
          tipo: 'escolha',
          enunciado: 'No método de Hondt, os votos de cada partido são divididos por…',
          opcoes: ['1, 2, 3, 4, …', '1, 3, 5, 7, …', '2, 4, 6, 8, …', 'o total de votos'],
          correta: 0,
          explicacao: 'Hondt usa os naturais 1, 2, 3, …; St. Laguë usa os ímpares.',
        },
        {
          id: 'hondt-stlague-q04',
          tipo: 'vf',
          enunciado: 'Em comparação com o método de Hondt, o método de St. Laguë tende a favorecer os partidos mais pequenos.',
          correta: true,
          explicacao: 'Os divisores crescem mais depressa (1, 3, 5, …), o que penaliza mais o 2.º e 3.º mandatos dos partidos grandes.',
        },
        {
          id: 'hondt-stlague-q05',
          tipo: 'vf',
          enunciado: 'Para a mesma votação, os métodos de Hondt e de St. Laguë dão sempre a mesma distribuição de mandatos.',
          correta: false,
          explicacao: 'Com 10 000, 6000, 3500 e 1500 votos e 7 mandatos: Hondt dá 4, 2, 1, 0 e St. Laguë dá 3, 2, 1, 1.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'salarios',
      titulo: 'Salários, Segurança Social e IRS',
      ae: [
        'Calcular o valor dos salários mensal, anual e por hora, dadas as condições de um contrato.',
        'Reconhecer as diferenças entre salário bruto e salário líquido.',
        'Calcular contribuições obrigatórias para sistemas de segurança social.',
        'Calcular a retenção na fonte para IRS.',
        'Calcular o IRS anual em casos simples em função do rendimento coletável.',
        'Compreender o caráter provisório da taxa mensal de retenção na fonte (IRS).',
        'Identificar a progressividade do IRS e a relevância dos escalões.',
      ],
      minutos: 7,
      essencial: [
        {
          tipo: 'texto',
          texto: '**Aviso:** as tabelas de retenção e os escalões de IRS desta página são **ilustrativos**, escolhidos para facilitar as contas. Os valores reais mudam todos os anos: consulta sempre as tabelas oficiais no Portal das Finanças.',
        },
        {
          tipo: 'definicao',
          texto: '**Salário bruto:** o valor acordado no contrato, antes de descontos.',
        },
        {
          tipo: 'definicao',
          texto: '**Salário líquido:** o que o trabalhador recebe, depois dos descontos obrigatórios: $\\text{líquido} = \\text{bruto} - \\text{Segurança Social} - \\text{retenção de IRS}$.',
        },
        {
          tipo: 'texto',
          texto: 'Em Portugal, o salário anual corresponde normalmente a **14 meses** (12 meses + subsídio de férias + subsídio de Natal). O valor por hora calcula-se a partir do salário mensal $R_m$ e do horário semanal $h$:',
        },
        {
          tipo: 'formula',
          texto: '$\\text{valor por hora} = \\dfrac{R_m \\times 12}{52 \\times h}$',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Um contrato prevê 1050 € brutos por mês, 40 horas por semana. Calcula o salário anual e o valor por hora (às centésimas).',
          resolucao: [
            'Salário anual: $1050 \\times 14 = 14\\,700$ €.',
            'Valor por hora: $\\dfrac{1050 \\times 12}{52 \\times 40} = \\dfrac{12\\,600}{2080} \\approx 6{,}06$ €.',
          ],
          resultado: 6.06,
          verificar: () => Math.round((1050 * 12) / (52 * 40) * 100) / 100,
        },
        {
          tipo: 'texto',
          texto: 'O trabalhador desconta **11 %** do salário bruto para a **Segurança Social** (a entidade empregadora também contribui). Além disso, todos os meses é retida uma parte para o IRS: a **retenção na fonte**. Na tabela ilustrativa abaixo, a taxa aplica-se a **todo** o salário bruto; nas tabelas oficiais há também uma parcela a abater, e as taxas dependem da situação familiar. Por isso, nesta tabela simplificada, subir de escalão pode até baixar o salário líquido; com a parcela a abater, as tabelas oficiais evitam isso.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Salário bruto mensal (ilustrativo)', 'Taxa de retenção'],
          linhas: [
            ['até 900 € (inclusive)', '0 %'],
            ['mais de 900 € até 1200 €', '10 %'],
            ['mais de 1200 € até 1800 €', '20 %'],
            ['mais de 1800 € até 3000 €', '25 %'],
            ['mais de 3000 €', '30 %'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Com a tabela ilustrativa, calcula o salário líquido mensal correspondente a 1050 € brutos.',
          resolucao: [
            'Segurança Social: $1050 \\times 0{,}11 = 115{,}50$ €.',
            '1050 € está no escalão de mais de 900 € até 1200 €: taxa de 10 %. Retenção: $1050 \\times 0{,}10 = 105$ €.',
            'Líquido: $1050 - 115{,}50 - 105 = 829{,}50$ €.',
          ],
          resultado: 829.5,
          verificar: () => Manual.calc.cidadania.salario(1050).liquido,
        },
        {
          tipo: 'texto',
          texto: 'A retenção na fonte é **provisória**: é um adiantamento do imposto. No ano seguinte, na declaração de IRS, calcula-se o imposto anual a partir do **rendimento coletável**; se foi retido a mais, o Estado reembolsa; se foi retido a menos, o contribuinte paga a diferença.',
        },
        {
          tipo: 'texto',
          texto: 'O IRS é **progressivo**: o rendimento é dividido em **escalões** e cada taxa aplica-se apenas à parte do rendimento que está dentro desse escalão. Quem ganha mais paga uma percentagem média maior.',
        },
        {
          tipo: 'quadro',
          cabecalho: ['Rendimento coletável anual (ilustrativo)', 'Taxa'],
          linhas: [
            ['até 8000 € (inclusive)', '13 %'],
            ['mais de 8000 € até 20 000 €', '20 %'],
            ['mais de 20 000 € até 40 000 €', '30 %'],
            ['mais de 40 000 € até 80 000 €', '40 %'],
            ['mais de 80 000 €', '48 %'],
          ],
        },
        {
          tipo: 'exemplo',
          enunciado: 'Com os escalões ilustrativos, calcula o IRS anual de um rendimento coletável de 25 000 € e a taxa média.',
          resolucao: [
            '1.º escalão: $8000 \\times 0{,}13 = 1040$ €.',
            '2.º escalão: $(20\\,000 - 8000) \\times 0{,}20 = 12\\,000 \\times 0{,}20 = 2400$ €.',
            '3.º escalão: $(25\\,000 - 20\\,000) \\times 0{,}30 = 5000 \\times 0{,}30 = 1500$ €.',
            'Imposto: $1040 + 2400 + 1500 = 4940$ €.',
            'Taxa média: $\\dfrac{4940}{25\\,000} = 0{,}1976 = 19{,}76\\ \\%$ (menor do que os 30 % do último escalão).',
          ],
          resultado: 4940,
          verificar: () => Manual.calc.cidadania.irsAnual(25000, Manual.calc.cidadania.ESCALOES_IRS_ILUSTRATIVOS).imposto,
        },
        {
          tipo: 'erro-frequente',
          texto: 'Não apliques a taxa do último escalão a todo o rendimento: $25\\,000 \\times 0{,}30 = 7500$ € está errado. Cada taxa só incide sobre a parte do rendimento dentro do respetivo escalão.',
        },
        {
          tipo: 'esquema',
          id: 'salario',
          opcoes: { bruto: 1050 },
          legenda: 'Experimenta: muda o salário bruto e observa a decomposição bruto → SS → retenção → líquido e como a taxa média de IRS sobe com o rendimento. (No esquema, o rendimento anual de 14 meses é usado como rendimento coletável — uma simplificação.)',
        },
      ],
      resumo: [
        'Líquido = bruto − Segurança Social (11 %) − retenção na fonte.',
        'Anual: 14 meses; por hora: $\\dfrac{R_m \\times 12}{52 \\times h}$.',
        'Retenção na fonte: na tabela ilustrativa, taxa aplicada a todo o bruto (nas oficiais há parcela a abater); é provisória.',
        'IRS anual: taxas por escalões, cada uma só sobre a parte do rendimento no escalão.',
        'IRS progressivo: a taxa média cresce com o rendimento.',
        'Tabelas reais mudam todos os anos: consulta o Portal das Finanças.',
      ],
      quiz: [
        {
          id: 'salarios-q01',
          tipo: 'numerica',
          enunciado: 'Com a tabela de retenção ilustrativa, qual é o salário líquido mensal de quem ganha 1500 € brutos?',
          resposta: 1035,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            'Segurança Social: $1500 \\times 0{,}11 = 165$ €.',
            '1500 € está no escalão de mais de 1200 € até 1800 €: taxa de 20 %. Retenção: $1500 \\times 0{,}20 = 300$ €.',
            'Líquido: $1500 - 165 - 300 = 1035$ €.',
          ],
          verificar: () => Manual.calc.cidadania.salario(1500).liquido,
        },
        {
          id: 'salarios-q02',
          tipo: 'numerica',
          enunciado: 'Com os escalões ilustrativos, qual é o IRS anual de um rendimento coletável de 12 000 €?',
          resposta: 1840,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            '1.º escalão: $8000 \\times 0{,}13 = 1040$ €.',
            '2.º escalão: $(12\\,000 - 8000) \\times 0{,}20 = 4000 \\times 0{,}20 = 800$ €.',
            'Imposto: $1040 + 800 = 1840$ €.',
          ],
          verificar: () => Manual.calc.cidadania.irsAnual(12000, Manual.calc.cidadania.ESCALOES_IRS_ILUSTRATIVOS).imposto,
        },
        {
          id: 'salarios-q03',
          tipo: 'numerica',
          enunciado: 'Um contrato de 900 € brutos mensais e 40 horas semanais. Qual é o valor por hora, arredondado às centésimas?',
          resposta: 5.19,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            '$\\dfrac{900 \\times 12}{52 \\times 40} = \\dfrac{10\\,800}{2080}$',
            '$\\approx 5{,}19$ €',
          ],
          verificar: () => (900 * 12) / (52 * 40),
        },
        {
          id: 'salarios-q04',
          tipo: 'vf',
          enunciado: 'A retenção na fonte é o valor final do IRS do ano: nunca há acertos.',
          correta: false,
          explicacao: 'É provisória. Na declaração anual calcula-se o imposto devido; a diferença é reembolsada ou paga.',
        },
        {
          id: 'salarios-q05',
          tipo: 'escolha',
          enunciado: 'O que significa dizer que o IRS é progressivo?',
          opcoes: [
            'A taxa média de imposto aumenta quando o rendimento aumenta.',
            'Todos pagam a mesma percentagem do rendimento.',
            'Todos pagam o mesmo valor de imposto.',
            'O imposto diminui quando o rendimento aumenta.',
          ],
          correta: 0,
          explicacao: 'As partes mais altas do rendimento estão sujeitas a taxas maiores, logo a percentagem média sobe.',
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'juros',
      titulo: 'Juro simples e juro composto',
      ae: [
        'Calcular o juro simples e o juro composto (com diferentes períodos de capitalização dos juros).',
        'Calcular o montante obtido numa poupança ou a pagar num crédito, tendo em conta os juros.',
      ],
      minutos: 6,
      essencial: [
        {
          tipo: 'texto',
          texto: 'O **juro** é o "preço" do dinheiro: quem deposita recebe juros (poupança); quem pede emprestado paga juros (crédito). O **montante** (ou capital final) é o capital inicial mais os juros.',
        },
        {
          tipo: 'definicao',
          texto: '**Juro simples:** o juro de cada ano é sempre calculado sobre o capital inicial.',
        },
        {
          tipo: 'definicao',
          texto: '**Juro composto:** no fim de cada período o juro junta-se ao capital (**capitalização**) e passa também a render juros.',
        },
        {
          tipo: 'formula',
          texto: 'Juro simples: $J = C \\times r \\times n$ e montante $C + J$, sendo $C$ o capital inicial, $r$ a taxa de juro anual e $n$ o número de anos.',
        },
        {
          tipo: 'formula',
          texto: 'Juro composto (capitalização anual): $C_n = C \\times (1 + r)^n$, sendo $C_n$ o capital final ao fim de $n$ anos.',
        },
        {
          tipo: 'formula',
          texto: 'Capitalização mensal: $C_n = C \\times \\left(1 + \\dfrac{r}{12}\\right)^n$, onde $n$ é o número de meses.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Depositas 2000 € a uma taxa anual de 3 %, durante 5 anos. Calcula o montante com juro simples e com juro composto (capitalização anual).',
          resolucao: [
            'Juro simples: $J = 2000 \\times 0{,}03 \\times 5 = 300$ €; montante $2000 + 300 = 2300$ €.',
            'Juro composto: $C_5 = 2000 \\times 1{,}03^5 = 2000 \\times 1{,}159274\\ldots$',
            '$C_5 \\approx 2318{,}55$ € (às centésimas).',
            'O juro composto rende mais 18,55 €, porque os juros também rendem juros.',
          ],
          resultado: 2318.55,
          verificar: () => Math.round(Manual.calc.cidadania.jurosCompostos(2000, 0.03, 5, 1).montante * 100) / 100,
        },
        {
          tipo: 'exemplo',
          enunciado: 'O mesmo depósito (2000 €, 3 % ao ano, 5 anos), mas com capitalização mensal.',
          resolucao: [
            'Taxa mensal: $\\dfrac{0{,}03}{12} = 0{,}0025$; número de meses: $5 \\times 12 = 60$.',
            '$C_{60} = 2000 \\times 1{,}0025^{60} = 2000 \\times 1{,}161617\\ldots$',
            '$C_{60} \\approx 2323{,}23$ € (às centésimas): capitalizar mais vezes rende um pouco mais.',
          ],
          resultado: 2323.23,
          verificar: () => Math.round(Manual.calc.cidadania.jurosCompostos(2000, 0.03, 5, 12).montante * 100) / 100,
        },
        {
          tipo: 'esquema',
          id: 'juros',
          opcoes: { capital: 2000, taxa: 3, anos: 5, periodosPorAno: 1 },
          legenda: 'Experimenta: aumenta a duração e vê as curvas do juro simples e do juro composto a afastarem-se; muda os períodos de capitalização para 12.',
        },
        {
          tipo: 'texto',
          texto: 'Num **crédito** as contas são as mesmas, mas do lado de quem paga. Também se pode "andar para trás": o capital a depositar hoje para ter $C_n$ daqui a $n$ anos é $C = \\dfrac{C_n}{(1 + r)^n}$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Pedes 1500 € emprestados a 6 % ao ano, com juro composto e capitalização mensal, para pagar tudo ao fim de 2 anos. Quanto vais pagar (às centésimas)?',
          resolucao: [
            'Taxa mensal: $\\dfrac{0{,}06}{12} = 0{,}005$; meses: $2 \\times 12 = 24$.',
            '$C_{24} = 1500 \\times 1{,}005^{24} = 1500 \\times 1{,}127160\\ldots$',
            '$C_{24} \\approx 1690{,}74$ €, ou seja, 190,74 € de juros.',
          ],
          resultado: 1690.74,
          verificar: () => Math.round(Manual.calc.cidadania.jurosCompostos(1500, 0.06, 2, 12).montante * 100) / 100,
        },
        {
          tipo: 'erro-frequente',
          texto: 'Na capitalização mensal, divide a taxa **anual** por 12 e usa o expoente em **meses**: $1{,}0025^{60}$, e não $1{,}03^{60}$ nem $1{,}0025^{5}$. A taxa escreve-se em forma decimal: 3 % $= 0{,}03$.',
        },
        {
          tipo: 'texto',
          texto: 'Programa em Python que calcula o juro simples e o montante com juro composto:',
        },
        {
          tipo: 'codigo',
          linguagem: 'python',
          codigo: [
            'C = float(input("Capital inicial (€): "))',
            'r = float(input("Taxa de juro anual (ex.: 0.03): "))',
            'n = int(input("Número de anos: "))',
            'J = C * r * n',
            'Cn = C * (1 + r) ** n',
            'print("Juro simples:", round(J, 2))',
            'print("Montante com juro simples:", round(C + J, 2))',
            'print("Montante com juro composto:", round(Cn, 2))',
          ].join('\n'),
        },
      ],
      resumo: [
        'Montante = capital inicial + juros.',
        'Juro simples: $J = C \\times r \\times n$.',
        'Juro composto: $C_n = C \\times (1 + r)^n$.',
        'Capitalização mensal: $C_n = C \\times \\left(1 + \\frac{r}{12}\\right)^n$, com $n$ em meses.',
        'Capital a depositar: $C = \\dfrac{C_n}{(1 + r)^n}$.',
      ],
      quiz: [
        {
          id: 'juros-q01',
          tipo: 'numerica',
          enunciado: 'Depositas 5000 € a 2 % ao ano, com juro composto e capitalização anual, durante 3 anos. Qual é o montante final, às centésimas?',
          resposta: 5306.04,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            '$C_3 = 5000 \\times 1{,}02^3$',
            '$1{,}02^3 = 1{,}061208$',
            '$C_3 = 5000 \\times 1{,}061208 = 5306{,}04$ €',
          ],
          verificar: () => Manual.calc.cidadania.jurosCompostos(5000, 0.02, 3, 1).montante,
        },
        {
          id: 'juros-q02',
          tipo: 'numerica',
          enunciado: 'Um empréstimo de 1500 € a 6 % ao ano em regime de juro simples, durante 2 anos. Quanto se paga de juros?',
          resposta: 180,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            '$J = 1500 \\times 0{,}06 \\times 2$',
            '$J = 180$ €',
          ],
          verificar: () => Manual.calc.cidadania.jurosSimples(1500, 0.06, 2).juro,
        },
        {
          id: 'juros-q03',
          tipo: 'numerica',
          enunciado: 'Que capital deves depositar hoje, a 4 % ao ano com capitalização anual, para teres 5000 € daqui a 3 anos? Arredonda às centésimas.',
          resposta: 4444.98,
          tolerancia: 0.005,
          unidade: '€',
          resolucao: [
            '$C \\times 1{,}04^3 = 5000$',
            '$1{,}04^3 = 1{,}124864$',
            '$C = \\dfrac{5000}{1{,}124864} \\approx 4444{,}98$ €',
          ],
          verificar: () => 5000 / Math.pow(1.04, 3),
        },
        {
          id: 'juros-q04',
          tipo: 'numerica',
          enunciado: 'Depositas 1000 € a 5 % ao ano com capitalização anual. Ao fim de quantos anos, no mínimo, o montante atinge 1500 €?',
          resposta: 9,
          tolerancia: 0,
          resolucao: [
            'Procura-se o menor $n$ inteiro com $1000 \\times 1{,}05^n \\geq 1500$, isto é, $1{,}05^n \\geq 1{,}5$.',
            '$n = 8$: $1{,}05^8 \\approx 1{,}4775 < 1{,}5$ (montante $\\approx 1477{,}46$ €).',
            '$n = 9$: $1{,}05^9 \\approx 1{,}5513 \\geq 1{,}5$ (montante $\\approx 1551{,}33$ €).',
            'São precisos 9 anos.',
          ],
          verificar: () => {
            let n = 0;
            while (Manual.calc.cidadania.jurosCompostos(1000, 0.05, n, 1).montante < 1500) n++;
            return n;
          },
        },
        {
          id: 'juros-q05',
          tipo: 'vf',
          enunciado: 'Com a mesma taxa anual, a capitalização mensal dá um montante maior do que a capitalização anual (para mais de um ano de prazo).',
          correta: true,
          explicacao: 'Os juros juntam-se ao capital mais cedo e começam a render juros mais cedo (2323,23 € contra 2318,55 € no exemplo).',
        },
      ],
    },
  ],
});
