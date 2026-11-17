globalThis.Manual = globalThis.Manual || {};

Manual.registarIndice([
  {
    id: 'mat-a',
    nome: 'Matemática A',
    disponivel: true,
    temas: [
      {
        id: 'cidadania',
        titulo: 'Modelos Matemáticos para a Cidadania',
        subtemas: [
          {
            id: 'maiorias',
            titulo: 'Maioria simples e maioria absoluta',
            palavras: ['eleições', 'maioria simples', 'maioria relativa', 'maioria absoluta', 'segunda volta', 'votos'],
          },
          {
            id: 'borda',
            titulo: 'Método de Borda',
            palavras: ['eleições', 'boletins de preferência', 'pontos', 'Borda', 'votação'],
          },
          {
            id: 'hondt-stlague',
            titulo: 'Métodos de Hondt e de St. Laguë',
            palavras: ['Hondt', 'St. Laguë', 'Sainte-Laguë', 'mandatos', 'quocientes', 'proporcional', 'eleições'],
          },
          {
            id: 'salarios',
            titulo: 'Salários, Segurança Social e IRS',
            palavras: ['salário bruto', 'salário líquido', 'Segurança Social', 'IRS', 'retenção na fonte', 'escalões', 'progressividade', 'impostos'],
          },
          {
            id: 'juros',
            titulo: 'Juro simples e juro composto',
            palavras: ['juros', 'juro simples', 'juro composto', 'capitalização', 'poupança', 'crédito', 'montante', 'taxa de juro'],
          },
        ],
      },
      {
        id: 'estatistica',
        titulo: 'Estatística',
        subtemas: [
          {
            id: 'conceitos',
            titulo: 'Problema estatístico, população e amostra',
            palavras: ['problema estatístico', 'variabilidade', 'população', 'amostra', 'variável', 'recenseamento', 'sondagem', 'amostra enviesada', 'dados discretos', 'dados contínuos'],
          },
          {
            id: 'frequencias-histograma',
            titulo: 'Tabelas de frequências e histograma',
            palavras: ['frequência absoluta', 'frequência relativa', 'frequência acumulada', 'histograma', 'classes', 'gráfico de barras', 'caule-e-folhas'],
          },
          {
            id: 'localizacao',
            titulo: 'Medidas de localização',
            palavras: ['média', 'mediana', 'moda', 'percentis', 'quartis', 'medidas de localização'],
          },
          {
            id: 'dispersao',
            titulo: 'Medidas de dispersão',
            palavras: ['amplitude', 'amplitude interquartil', 'AIQ', 'desvio padrão', 'variância', 'desvios', 'medidas de dispersão'],
          },
          {
            id: 'propriedades',
            titulo: 'Propriedades das medidas',
            palavras: ['transformação linear', 'resistência', 'outliers', 'soma dos desvios', 'dados agrupados', 'diagrama de extremos e quartis', 'mediana ou média'],
          },
          {
            id: 'bivariada',
            titulo: 'Dados bivariados e regressão linear',
            palavras: ['diagrama de dispersão', 'correlação', 'coeficiente de correlação', 'reta de regressão', 'mínimos quadrados', 'variável explanatória', 'variável resposta', 'causalidade', 'extrapolação', 'gráfico de linhas'],
          },
        ],
      },
      {
        id: 'geometria-sintetica',
        titulo: 'Geometria sintética no plano',
        subtemas: [
          {
            id: 'incentro-circuncentro',
            titulo: 'Incentro e circuncentro',
            palavras: ['incentro', 'circuncentro', 'bissetriz', 'mediatriz', 'circunferência inscrita', 'circunferência circunscrita', 'pontos notáveis', 'triângulo'],
          },
          {
            id: 'ortocentro-baricentro',
            titulo: 'Ortocentro, baricentro e medianas',
            palavras: ['ortocentro', 'baricentro', 'alturas', 'medianas', 'centro de massa', '2/3 da mediana', 'triângulos equivalentes', 'pontos notáveis', 'acutângulo', 'obtusângulo'],
          },
          {
            id: 'euler-nove-pontos',
            titulo: 'Reta de Euler e circunferência dos nove pontos',
            palavras: ['reta de Euler', 'circunferência dos nove pontos', 'relações métricas', 'pontos notáveis', 'triângulo medial'],
          },
        ],
      },
      {
        id: 'funcoes',
        titulo: 'Funções',
        subtemas: [
          {
            id: 'generalidades',
            titulo: 'Generalidades acerca de funções',
            palavras: ['função', 'domínio', 'conjunto de chegada', 'contradomínio', 'objeto', 'imagem', 'variável independente', 'variável dependente', 'diagrama de setas', 'tabela', 'gráfico', 'expressão analítica', 'história'],
          },
          {
            id: 'afim',
            titulo: 'Função afim',
            palavras: ['reta', 'declive', 'ordenada na origem', 'zeros', 'sinal', 'monotonia', 'crescente', 'decrescente', 'função linear', 'função constante'],
          },
          {
            id: 'quadratica',
            titulo: 'Função quadrática',
            palavras: ['parábola', 'concavidade', 'vértice', 'eixo de simetria', 'binómio discriminante', 'delta', 'zeros', 'sinal', 'extremos', 'máximo', 'mínimo', 'contradomínio', 'monotonia'],
          },
          {
            id: 'transformacoes',
            titulo: 'Transformações do gráfico de y = x²',
            palavras: ['parábola', 'translação', 'vetor', 'dilatação vertical', 'contração vertical', 'reflexão', 'forma canónica', 'transformações geométricas', 'expressão analítica'],
          },
          {
            id: 'equacoes-inequacoes',
            titulo: 'Equações e inequações do 2.º grau',
            palavras: ['parábola', 'fórmula resolvente', 'equação do 2.º grau', 'inequação', 'binómio discriminante', 'conjunto-solução', 'intervalos', 'Python', 'completar o quadrado'],
          },
          {
            id: 'ramos-modulo',
            titulo: 'Funções definidas por ramos e módulo',
            palavras: ['ramos', 'função por ramos', 'módulo', 'valor absoluto', 'tarifas', 'quadro de sinal', 'contradomínio', 'zeros', 'Python'],
          },
        ],
      },
      {
        id: 'geometria-analitica',
        titulo: 'Geometria analítica',
        subtemas: [
          {
            id: 'plano-referencial',
            titulo: 'Referencial, ponto médio e distância no plano',
            palavras: ['referencial ortonormado', 'coordenadas', 'abcissa', 'ordenada', 'quadrantes', 'reflexão', 'meia-volta', 'ponto médio', 'distância entre dois pontos'],
          },
          {
            id: 'plano-condicoes',
            titulo: 'Conjuntos de pontos no plano',
            palavras: ['condições', 'reta vertical', 'equação reduzida', 'declive', 'semiplano', 'fronteira', 'mediatriz', 'circunferência', 'círculo', 'conjunção', 'disjunção', 'conjunto vazio'],
          },
          {
            id: 'espaco',
            titulo: 'Geometria analítica no espaço',
            palavras: ['referencial no espaço', 'cota', 'planos coordenados', 'planos paralelos', 'retas paralelas aos eixos', 'plano mediador', 'superfície esférica', 'esfera', 'distância', 'ponto médio'],
          },
          {
            id: 'vetores',
            titulo: 'Vetores no plano e no espaço',
            palavras: ['vetor', 'coordenadas de um vetor', 'norma', 'soma de vetores', 'diferença', 'produto por um escalar', 'simétrico', 'colineares', 'ponto mais vetor', 'paralelogramo'],
          },
          {
            id: 'reta-vetorial',
            titulo: 'Equação vetorial da reta',
            palavras: ['equação vetorial', 'vetor diretor', 'declive', 'equação reduzida', 'retas paralelas', 'reta no espaço', 'reta vertical', 'Python'],
          },
        ],
      },
    ],
  },
  {
    id: 'fqa',
    nome: 'Física e Química A',
    disponivel: true,
    porFazer: ['Física'],
    temas: [
      {
        id: 'elementos',
        titulo: 'Elementos químicos e sua organização',
        subtemas: [
          {
            id: 'atomo',
            titulo: 'Constituição do átomo',
            palavras: ['protão', 'neutrão', 'eletrão', 'número atómico', 'número de massa', 'isótopos', 'escala atómica', 'nanotecnologia'],
          },
          {
            id: 'mole',
            titulo: 'Massa atómica e quantidade de matéria',
            palavras: ['massa atómica relativa', 'massa molecular relativa', 'quantidade de matéria', 'mole', 'constante de Avogadro', 'massa molar', 'unidade de massa atómica', 'algarismos significativos'],
          },
          {
            id: 'espectros',
            titulo: 'Espectros e energia dos eletrões',
            palavras: ['espectro eletromagnético', 'energia do fotão', 'espectro de emissão', 'espectro de absorção', 'espectro do hidrogénio', 'transições eletrónicas', 'níveis de energia', 'ionização'],
          },
          {
            id: 'configuracao',
            titulo: 'Configuração eletrónica',
            palavras: ['nuvem eletrónica', 'subníveis', 'orbitais', 'configuração eletrónica', 'princípio da energia mínima', 'princípio de exclusão de Pauli', 'regra de Hund', 'eletrões de valência'],
          },
          {
            id: 'tabela-periodica',
            titulo: 'Tabela Periódica',
            palavras: ['grupos', 'períodos', 'blocos s p d', 'energia de ionização', 'raio atómico', 'elementos representativos', 'propriedades periódicas', 'metais e não metais'],
          },
        ],
      },
      {
        id: 'materia',
        titulo: 'Propriedades e transformações da matéria',
        subtemas: [
          {
            id: 'ligacao',
            titulo: 'Ligação química',
            palavras: ['ligação covalente', 'ligação iónica', 'ligação metálica', 'energia de ligação', 'comprimento de ligação', 'estrutura de Lewis', 'ligação simples dupla tripla', 'regra do octeto'],
          },
          {
            id: 'geometria',
            titulo: 'Geometria e polaridade das moléculas',
            palavras: ['geometria molecular', 'linear', 'angular', 'tetraédrica', 'piramidal trigonal', 'polaridade', 'momento dipolar', 'ligação de hidrogénio', 'forças intermoleculares'],
          },
          {
            id: 'carbono',
            titulo: 'Compostos de carbono',
            palavras: ['hidrocarbonetos', 'alcanos', 'alcenos', 'alcinos', 'álcoois', 'aldeídos', 'cetonas', 'ácidos carboxílicos', 'grupos funcionais', 'isomeria'],
          },
          {
            id: 'gases',
            titulo: 'Gases',
            palavras: ['lei de Avogadro', 'volume molar', 'massa volúmica', 'fração molar', 'composição da atmosfera', 'poluentes', 'efeito de estufa', 'PTN'],
          },
          {
            id: 'solucoes',
            titulo: 'Soluções e dispersões',
            palavras: ['soluções', 'coloides', 'suspensões', 'concentração', 'concentração em massa', 'percentagem em massa', 'partes por milhão', 'diluição', 'fator de diluição'],
          },
          {
            id: 'entalpia',
            titulo: 'Energia nas reações químicas',
            palavras: ['entalpia', 'variação de entalpia', 'reação exotérmica', 'reação endotérmica', 'energias de ligação', 'quebra e formação de ligações', 'calor de reação'],
          },
          {
            id: 'fotoquimica',
            titulo: 'Reações fotoquímicas e ozono',
            palavras: ['reações fotoquímicas', 'fotodecomposição', 'cloreto de prata', 'ozono', 'estratosfera', 'troposfera', 'CFC', 'radiação ultravioleta'],
          },
        ],
      },
      {
        id: 'movimentos',
        titulo: 'Energia e movimentos',
        subtemas: [
          {
            id: 'sistema-mecanico',
            titulo: 'Energia de um sistema mecânico',
            palavras: ['sistema mecânico', 'centro de massa', 'energia cinética', 'energia potencial gravítica', 'nível de referência', 'energia mecânica', 'sistema e vizinhança'],
          },
          {
            id: 'trabalho',
            titulo: 'Trabalho e Teorema da Energia Cinética',
            palavras: ['trabalho', 'força constante', 'componente eficaz', 'trabalho potente', 'trabalho resistente', 'força resultante', 'teorema da energia cinética', 'distância de travagem'],
          },
          {
            id: 'energia-mecanica',
            titulo: 'Forças conservativas e conservação da energia mecânica',
            palavras: ['força conservativa', 'força não conservativa', 'trabalho do peso', 'conservação da energia mecânica', 'forças dissipativas', 'energia dissipada', 'ressalto', 'rendimento'],
          },
        ],
      },
    ],
  },
  { id: 'bg', nome: 'Biologia e Geologia', disponivel: false, temas: [] },
  { id: 'port', nome: 'Português', disponivel: false, temas: [] },
  { id: 'fil', nome: 'Filosofia', disponivel: false, temas: [] },
  { id: 'ing', nome: 'Inglês', disponivel: false, temas: [] },
]);
