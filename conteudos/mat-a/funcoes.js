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
  ],
});
