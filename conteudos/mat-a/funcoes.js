globalThis.Manual = globalThis.Manual || {};

// Tema provisório: só um subtema de demonstração (substituído na Task 18).
Manual.registarTema('mat-a', {
  id: 'funcoes',
  titulo: 'Funções',
  subtemas: [
    {
      id: 'afim',
      titulo: 'Função afim',
      ae: ['Estudar gráfica e analiticamente a função afim em termos de zeros, sinal e monotonia.'],
      minutos: 4,
      essencial: [
        {
          tipo: 'definicao',
          texto: 'Uma **função afim** é uma função da forma $f(x)=mx+b$, com $m$ e $b$ reais. O gráfico é uma reta de declive $m$ e ordenada na origem $b$.',
        },
        {
          tipo: 'texto',
          texto: 'Se $m>0$, a função é crescente; se $m<0$, é decrescente; se $m=0$, é constante. O zero obtém-se resolvendo $mx+b=0$, ou seja, $x=-\\dfrac{b}{m}$.',
        },
        {
          tipo: 'exemplo',
          enunciado: 'Determina o zero da função $f(x)=2x-5$.',
          resolucao: [
            'Resolver $f(x)=0$: $2x-5=0$.',
            'Somar 5 a ambos os membros: $2x=5$.',
            'Dividir por 2: $x=\\dfrac{5}{2}=2{,}5$.',
          ],
          resultado: 2.5,
          verificar: () => 5 / 2,
        },
        {
          tipo: 'erro-frequente',
          texto: 'O declive é o coeficiente de $x$, não o termo independente: em $f(x)=3-x$ o declive é $-1$, e a função é decrescente.',
        },
      ],
      resumo: [
        '$f(x)=mx+b$: gráfico é uma reta.',
        '$m>0$ crescente; $m<0$ decrescente.',
        'Zero: $x=-\\dfrac{b}{m}$ (se $m\\neq0$).',
      ],
      quiz: [
        {
          tipo: 'escolha',
          enunciado: 'Qual é o declive da reta $y=-3x+1$?',
          opcoes: ['$-3$', '$1$', '$3$', '$-1$'],
          correta: 0,
          explicacao: 'O declive é o coeficiente de $x$.',
        },
        {
          tipo: 'vf',
          enunciado: 'A função $f(x)=4-2x$ é crescente.',
          correta: false,
          explicacao: 'O declive é $-2<0$, logo a função é decrescente.',
        },
        {
          tipo: 'escolha',
          enunciado: 'A que ponto o gráfico de $f(x)=2x+7$ interseta o eixo $Oy$?',
          opcoes: ['$(0,7)$', '$(7,0)$', '$(0,2)$', '$(-3{,}5;0)$'],
          correta: 0,
          explicacao: 'Em $x=0$ tem-se $f(0)=b=7$.',
        },
        {
          tipo: 'numerica',
          enunciado: 'Determina o zero de $f(x)=2x-5$.',
          resposta: 2.5,
          tolerancia: 0.01,
          resolucao: [
            '$2x-5=0$',
            '$2x=5$',
            '$x=\\dfrac{5}{2}=2{,}5$',
          ],
          verificar: () => 5 / 2,
          explicacao: 'O zero é o valor de $x$ para o qual $f(x)=0$.',
        },
      ],
    },
    // DEMO provisória (remover na Task 18)
    {
      id: 'demo-esquemas',
      titulo: 'Demo de esquemas',
      ae: ['Estudar gráfica e analiticamente a função afim em termos de zeros, sinal e monotonia.'],
      minutos: 4,
      essencial: [
        { tipo: 'esquema', id: 'hondt', opcoes: { partidos: [{nome:'A',votos:10000},{nome:'B',votos:6000},{nome:'C',votos:3500},{nome:'D',votos:1500}], mandatos: 7 }, legenda: 'Demo hondt.' },
        { tipo: 'esquema', id: 'borda', opcoes: {}, legenda: 'Demo borda.' },
        { tipo: 'esquema', id: 'juros', opcoes: { capital: 1000, taxa: 4, anos: 10, periodosPorAno: 4 }, legenda: 'Demo juros.' },
        { tipo: 'esquema', id: 'salario', opcoes: { bruto: 1200 }, legenda: 'Demo salario.' },
        { tipo: 'esquema', id: 'histograma', opcoes: { dados: [12,15,17,18,21,22,22,24,25,27,28,31,33,34,38,41,45,47], amplitudeClasse: 10 }, legenda: 'Demo histograma.' },
        { tipo: 'esquema', id: 'medidas', opcoes: { dados: [2,4,4,4,5,5,7,9] }, legenda: 'Demo medidas.' },
        { tipo: 'esquema', id: 'regressao', opcoes: { pares: [[1,2],[2,3],[3,4]] }, legenda: 'Demo regressao.' },
        { tipo: 'esquema', id: 'afim', opcoes: { m: 2, b: -1 }, legenda: 'Demo afim.' },
        { tipo: 'esquema', id: 'parabola', opcoes: { a: 1, h: 1, k: -4, mostrarBase: true }, legenda: 'Demo parabola.' },
        { tipo: 'esquema', id: 'ramos', opcoes: { ramos: 'modulo' }, legenda: 'Demo ramos.' },
        { tipo: 'esquema', id: 'pontos-notaveis', opcoes: { A: [0,0], B: [4,0], C: [0,3], camadas: ['incentro','circuncentro','ortocentro','baricentro','euler','novePontos'] }, legenda: 'Demo pontos-notaveis.' },
        { tipo: 'esquema', id: 'plano', opcoes: { A: [1,1], B: [4,5], modo: 'distancia' }, legenda: 'Demo plano.' },
        { tipo: 'esquema', id: 'vetores', opcoes: { u: [3,1], v: [1,3], k: 2, operacao: 'soma' }, legenda: 'Demo vetores.' },
        { tipo: 'esquema', id: 'espaco3d', opcoes: { P: [1,2,3], v: [2,1,1], raio: 2, mostrar: ['ponto','reta','esfera','planos'] }, legenda: 'Demo espaco3d.' },
      ],
      resumo: ['Página provisória para verificar os esquemas.'],
      quiz: [
        { tipo: 'vf', enunciado: 'Pergunta 1.', correta: true, explicacao: 'Demo.' },
        { tipo: 'vf', enunciado: 'Pergunta 2.', correta: true, explicacao: 'Demo.' },
        { tipo: 'vf', enunciado: 'Pergunta 3.', correta: true, explicacao: 'Demo.' },
        { tipo: 'vf', enunciado: 'Pergunta 4.', correta: true, explicacao: 'Demo.' },
      ],
    },
  ],
});
