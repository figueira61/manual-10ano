globalThis.Manual = globalThis.Manual || {};

Manual.registarIndice([
  {
    id: 'mat-a',
    nome: 'Matemática A',
    disponivel: true,
    temas: [
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
