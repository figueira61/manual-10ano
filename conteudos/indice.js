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
