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
        id: 'funcoes',
        titulo: 'Funções',
        subtemas: [
          {
            id: 'afim',
            titulo: 'Função afim',
            palavras: ['reta', 'declive', 'ordenada na origem', 'zeros', 'monotonia'],
          },
          { id: 'demo-esquemas', titulo: 'Demo de esquemas', palavras: ['demo'] }, // DEMO provisória (Task 18)
        ],
      },
    ],
  },
  { id: 'fqa', nome: 'Física e Química A', disponivel: false, temas: [] },
  { id: 'bg', nome: 'Biologia e Geologia', disponivel: false, temas: [] },
  { id: 'port', nome: 'Português', disponivel: false, temas: [] },
  { id: 'fil', nome: 'Filosofia', disponivel: false, temas: [] },
  { id: 'ing', nome: 'Inglês', disponivel: false, temas: [] },
]);
