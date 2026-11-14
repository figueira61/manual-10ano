globalThis.Manual = globalThis.Manual || {};

// Geradores de Matemática A — Estatística.
// Subtemas: conceitos, frequencias-histograma, localizacao, dispersao, propriedades, bivariada (ids <subtema>-<tipo>).
// As respostas numéricas vêm de Manual.calc.estatistica; verificarIndependente e a verificação usam outro método
// (contagens sem ordenar, média por valor de referência, fórmula alternativa da variância, reta pelo ponto médio,
// diferença de imagens, simulação com dois valores…).
// Manual.calc só é lido dentro de gerar (no index.html os módulos de cálculo carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const calc = () => Manual.calc.estatistica;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const soma = (l) => l.reduce((s, v) => s + v, 0);
  const ordenar = (l) => l.slice().sort((a, b) => a - b);
  const fmt = A.fmt;
  const tex = A.tex;
  const { limpo, r2 } = A;
  const exato = (v, casas) => Math.abs(Math.round(v * Math.pow(10, casas)) / Math.pow(10, casas) - v) < 1e-9;
  const igualOuAprox = (v, casas = 2) => (exato(v, casas) ? ' = ' : ' \\approx ') + tex(v, casas);
  // Valor a meio de duas centésimas: o arredondamento seria ambíguo — o gerador re-sorteia.
  const meioCentesimo = (v) => Math.abs((v * 100 - Math.floor(v * 100)) - 0.5) < 1e-6;
  const temDecimais = (l) => l.some((v) => !Number.isInteger(limpo(v)));
  const listaTxt = (l) => l.map((v) => fmt(v)).join(temDecimais(l) ? '; ' : ', ');
  const texLista = (l) => l.map((v) => tex(v)).join(',\\ ');
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const minuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const semPonto = (t) => t.replace(/\.$/, '');
  const texNum = (v, casas = 2) => '$' + tex(v, casas) + '$';
  const ARRED_2 = 'às centésimas';

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'mat-a', tema: 'estatistica', id: def.subtema + '-' + def.tipo }, def));
  }

  // Utilitários partilhados (Manual.geradores.ajudas).
  const tentar = (construir) => A.tentar(construir, 'estatística');
  const { fechar, fecharTexto, confere } = A;

  // ---------------------------------------------------------------- métodos independentes (sem Manual.calc)
  // j-ésimo menor valor (j a partir de 1), por contagem, sem ordenar.
  function kesimo(xs, j) {
    for (const v of xs) {
      const menores = xs.filter((x) => x < v).length;
      const iguais = xs.filter((x) => x === v).length;
      if (menores < j && j <= menores + iguais) return v;
    }
    return NaN;
  }

  function medianaContagem(xs) {
    const n = xs.length;
    return n % 2 ? kesimo(xs, (n + 1) / 2) : (kesimo(xs, n / 2) + kesimo(xs, n / 2 + 1)) / 2;
  }

  // Percentil k pelo método do projeto, com aritmética inteira e contagem.
  function percentilContagem(xs, k) {
    const n = xs.length;
    if ((n * k) % 100 === 0) {
      const p = (n * k) / 100;
      return (kesimo(xs, p) + kesimo(xs, p + 1)) / 2;
    }
    let i = 1;
    while (i * 100 < n * k) i++;
    return kesimo(xs, i);
  }

  // Média por valor de referência: x0 + média dos desvios a x0.
  function mediaReferencia(xs) {
    const x0 = xs[0];
    return x0 + soma(xs.map((x) => x - x0)) / xs.length;
  }

  // Desvio padrão amostral pela fórmula s² = (Σx² − n·x̄²)/(n − 1).
  function desvioAlternativo(xs) {
    const n = xs.length;
    const m = soma(xs) / n;
    return Math.sqrt(Math.max(0, soma(xs.map((x) => x * x)) - n * m * m) / (n - 1));
  }

  // Composição de n em k partes ≥ 1.
  function composicao(rng, n, k) {
    const c = Array(k).fill(1);
    for (let i = 0; i < n - k; i++) c[inteiro(rng, 0, k - 1)]++;
    return c;
  }

  const ESQUEMA_MEDIDAS = (xs) => ({ id: 'medidas', opcoes: { dados: xs.slice() } });

  // ================================================================ conceitos
  // Estudos escritos à mão: objetivo, recolha aleatória, população, amostra, variável e recolhas enviesadas.
  const ESTUDOS = [
    {
      id: 'telemovel', N: [500, 1500], n: [40, 120], tipo: 'continua',
      objetivo: (N) => 'A direção de uma escola com ' + fmt(N) + ' alunos quer estimar o tempo que cada aluno passa, por dia, ao telemóvel.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' alunos a partir da lista de todos os alunos da escola e regista o tempo de cada um.',
      populacao: (N) => 'Os ' + fmt(N) + ' alunos da escola.',
      amostra: (n) => 'Os ' + fmt(n) + ' alunos sorteados.',
      variavel: 'O tempo passado ao telemóvel, por dia, por cada aluno.',
      alargada: 'Todos os jovens portugueses em idade escolar.',
      unidades: 'alunos sorteados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, regista o tempo dos ' + fmt(n) + ' alunos que encontra no bar da escola ao intervalo.', razao: 'só podem ser escolhidos os alunos que estão no bar ao intervalo; quem passa o intervalo noutros sítios fica de fora' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, publica um inquérito na página da escola e usa as primeiras ' + fmt(n) + ' respostas.', razao: 'só responde quem quer, e quem passa mais tempo online tende a responder primeiro' },
      ],
    },
    {
      id: 'transportes', N: [2000, 9000], n: [150, 400], tipo: 'qualitativa',
      objetivo: (N) => 'A câmara municipal de uma vila quer saber que meio de transporte usam os ' + fmt(N) + ' habitantes que trabalham fora de casa para ir para o trabalho.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' desses habitantes a partir do recenseamento e pergunta-lhes que meio de transporte usam.',
      populacao: (N) => 'Os ' + fmt(N) + ' habitantes da vila que trabalham fora de casa.',
      amostra: (n) => 'Os ' + fmt(n) + ' habitantes sorteados.',
      variavel: 'O meio de transporte usado para ir para o trabalho.',
      alargada: 'Todos os habitantes do distrito.',
      unidades: 'habitantes sorteados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pergunta aos ' + fmt(n) + ' primeiros passageiros que entram no autocarro das 8 h.', razao: 'só são inquiridas pessoas que andam de autocarro; quem vai de carro, a pé ou de bicicleta fica de fora' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, deixa um formulário na página da câmara e usa as ' + fmt(n) + ' respostas recebidas.', razao: 'só responde quem visita a página e quer responder; essas pessoas não representam os outros habitantes' },
      ],
    },
    {
      id: 'lampadas', N: [2000, 8000], n: [20, 60], tipo: 'continua',
      objetivo: (N) => 'Uma fábrica produziu ' + fmt(N) + ' lâmpadas num dia e quer estimar a duração, em horas, dessas lâmpadas.',
      aleatoria: (n) => 'Para isso, escolhe ao acaso ' + fmt(n) + ' lâmpadas de toda a produção desse dia e mede quanto tempo dura cada uma.',
      populacao: (N) => 'As ' + fmt(N) + ' lâmpadas produzidas nesse dia.',
      amostra: (n) => 'As ' + fmt(n) + ' lâmpadas testadas.',
      variavel: 'A duração, em horas, de cada lâmpada.',
      alargada: 'Todas as lâmpadas à venda em Portugal.',
      unidades: 'lâmpadas testadas',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, testa as ' + fmt(n) + ' lâmpadas que estavam no topo da última caixa embalada nesse dia.', razao: 'as lâmpadas vêm todas da mesma caixa, do fim da produção; se a máquina se desregular durante o dia, as outras lâmpadas não são representadas' },
      ],
    },
    {
      id: 'biblioteca', N: [800, 3000], n: [60, 150], tipo: 'discreta',
      objetivo: (N) => 'A biblioteca municipal tem ' + fmt(N) + ' sócios e quer saber quantos livros cada sócio leu no último ano.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' sócios a partir do ficheiro de sócios e telefona-lhes.',
      populacao: (N) => 'Os ' + fmt(N) + ' sócios da biblioteca.',
      amostra: (n) => 'Os ' + fmt(n) + ' sócios contactados.',
      variavel: 'O número de livros lidos no último ano por cada sócio.',
      alargada: 'Todos os habitantes do concelho.',
      unidades: 'sócios contactados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pergunta aos ' + fmt(n) + ' sócios que estão na biblioteca num sábado de manhã.', razao: 'quem está na biblioteca a um sábado de manhã lê, em geral, mais do que os outros sócios' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, deixa um questionário no balcão para quem o quiser preencher e usa os primeiros ' + fmt(n) + '.', razao: 'só responde quem passa no balcão e quer responder, normalmente os sócios que mais leem' },
      ],
    },
    {
      id: 'ginasio', N: [300, 1200], n: [30, 90], tipo: 'discreta',
      objetivo: (N) => 'Um ginásio com ' + fmt(N) + ' sócios quer saber quantas vezes por semana cada sócio treina.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' sócios da lista de inscritos e pergunta-lhes.',
      populacao: (N) => 'Os ' + fmt(N) + ' sócios do ginásio.',
      amostra: (n) => 'Os ' + fmt(n) + ' sócios sorteados.',
      variavel: 'O número de treinos por semana de cada sócio.',
      alargada: 'Todas as pessoas que praticam desporto na cidade.',
      unidades: 'sócios sorteados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pergunta aos ' + fmt(n) + ' sócios que estão a treinar numa segunda-feira ao fim da tarde.', razao: 'quem está no ginásio a essa hora treina mais vezes; os sócios que quase nunca vão dificilmente são apanhados' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, envia um inquérito por correio eletrónico a todos e usa as primeiras ' + fmt(n) + ' respostas.', razao: 'só responde quem quer, e quem treina muito tem mais vontade de responder a um inquérito do ginásio' },
      ],
    },
    {
      id: 'mochilas', N: [200, 600], n: [30, 80], tipo: 'continua',
      objetivo: (N) => 'Uma escola quer estudar a massa, em quilogramas, das mochilas dos seus ' + fmt(N) + ' alunos do 2.º ciclo.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' desses alunos e pesa as respetivas mochilas.',
      populacao: (N) => 'Os ' + fmt(N) + ' alunos do 2.º ciclo da escola.',
      amostra: (n) => 'Os ' + fmt(n) + ' alunos cujas mochilas foram pesadas.',
      variavel: 'A massa, em quilogramas, da mochila de cada aluno.',
      alargada: 'Todos os alunos do 2.º ciclo do país.',
      unidades: 'alunos cujas mochilas foram pesadas',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pesa as mochilas dos alunos de uma só turma do 5.º ano (' + fmt(n) + ' alunos).', razao: 'uma só turma tem o mesmo horário e os mesmos livros; os alunos do 6.º ano e das outras turmas ficam de fora' },
      ],
    },
    {
      id: 'clube', N: [3000, 20000], n: [200, 600], tipo: 'qualitativa',
      objetivo: (N) => 'Um clube desportivo com ' + fmt(N) + ' sócios quer saber se os sócios são a favor ou contra a mudança do emblema.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' sócios a partir da lista de sócios e pergunta-lhes a opinião.',
      populacao: (N) => 'Os ' + fmt(N) + ' sócios do clube.',
      amostra: (n) => 'Os ' + fmt(n) + ' sócios sorteados.',
      variavel: 'A opinião (a favor ou contra) sobre a mudança do emblema.',
      alargada: 'Todos os adeptos de futebol do país.',
      unidades: 'sócios sorteados',
      enviesadas: [
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, abre uma votação no site do clube e conta os ' + fmt(n) + ' votos recebidos.', razao: 'só vota quem quer, normalmente quem tem uma opinião forte sobre o emblema' },
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pergunta a opinião aos ' + fmt(n) + ' sócios que encontra à saída de um jogo em casa.', razao: 'só são ouvidos os sócios que vão ao estádio; os que não vão aos jogos ficam de fora' },
      ],
    },
    {
      id: 'agregados', N: [1500, 6000], n: [100, 300], tipo: 'discreta',
      objetivo: (N) => 'Uma junta de freguesia quer conhecer o número de pessoas de cada um dos ' + fmt(N) + ' agregados familiares da freguesia.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' agregados a partir da lista de moradas e visita-os.',
      populacao: (N) => 'Os ' + fmt(N) + ' agregados familiares da freguesia.',
      amostra: (n) => 'Os ' + fmt(n) + ' agregados visitados.',
      variavel: 'O número de pessoas de cada agregado familiar.',
      alargada: 'Todos os agregados familiares do país.',
      unidades: 'agregados visitados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, visita os ' + fmt(n) + ' agregados de dois prédios da rua principal.', razao: 'os agregados de dois prédios vizinhos vivem em casas parecidas; as moradias e as outras ruas ficam de fora' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, publica um formulário na página da junta e usa as ' + fmt(n) + ' respostas recebidas.', razao: 'só responde quem visita a página e quer responder, o que deixa de fora muitos agregados' },
      ],
    },
    {
      id: 'urgencias', N: [3000, 9000], n: [100, 300], tipo: 'continua',
      objetivo: (N) => 'Um hospital atendeu ' + fmt(N) + ' doentes nas urgências num mês e quer estimar o tempo de espera desses doentes.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' fichas de atendimento desse mês e regista o tempo de espera de cada doente.',
      populacao: (N) => 'Os ' + fmt(N) + ' doentes atendidos nas urgências nesse mês.',
      amostra: (n) => 'Os ' + fmt(n) + ' doentes cujas fichas foram sorteadas.',
      variavel: 'O tempo de espera de cada doente.',
      alargada: 'Todos os doentes atendidos em hospitais portugueses.',
      unidades: 'doentes cujas fichas foram sorteadas',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, regista o tempo de espera dos ' + fmt(n) + ' doentes atendidos na manhã de um domingo.', razao: 'o tempo de espera depende muito do dia e da hora; um só turno não representa o mês inteiro' },
        { codigo: 'resposta_voluntaria', texto: (n) => 'Para isso, pede aos doentes que preencham um inquérito opcional sobre a espera e usa as primeiras ' + fmt(n) + ' respostas.', razao: 'responde sobretudo quem ficou muito satisfeito ou muito insatisfeito com a espera' },
      ],
    },
    {
      id: 'desporto', N: [500, 1500], n: [50, 120], tipo: 'qualitativa',
      objetivo: (N) => 'A associação de estudantes de uma escola com ' + fmt(N) + ' alunos quer saber qual é o desporto preferido dos alunos.',
      aleatoria: (n) => 'Para isso, sorteia ' + fmt(n) + ' alunos a partir das listas de turma e pergunta-lhes.',
      populacao: (N) => 'Os ' + fmt(N) + ' alunos da escola.',
      amostra: (n) => 'Os ' + fmt(n) + ' alunos sorteados.',
      variavel: 'O desporto preferido de cada aluno.',
      alargada: 'Todos os estudantes do concelho.',
      unidades: 'alunos sorteados',
      enviesadas: [
        { codigo: 'conveniencia', texto: (n) => 'Para isso, pergunta aos ' + fmt(n) + ' alunos que estão no pavilhão desportivo depois das aulas.', razao: 'quem está no pavilhão depois das aulas pratica, em geral, um desporto de pavilhão; a preferência fica puxada para esses desportos' },
      ],
    },
  ];
  const estudo = (id) => ESTUDOS.find((e) => e.id === id);
  const IDS_ESTUDOS = ESTUDOS.map((e) => e.id);

  function sortearNs(rng, e) {
    const N = 10 * inteiro(rng, e.N[0] / 10, e.N[1] / 10);
    const n = inteiro(rng, e.n[0], e.n[1]);
    return { N, n };
  }

  function descricoes(e, N, n) {
    return {
      populacao: e.populacao(N),
      amostra: e.amostra(n),
      variavel: e.variavel,
      alargada: e.alargada,
      dimensao: 'O número de ' + e.unidades + ' (' + fmt(n) + ').',
    };
  }

  const PERGUNTA_PA = { populacao: 'Qual é a população deste estudo?', amostra: 'Qual é a amostra?', variavel: 'Qual é a variável em estudo?' };

  function errosPopulacaoAmostra(pergunta, d, n) {
    const q = (t) => '«' + semPonto(t) + '»';
    const m = (t) => minuscula(semPonto(t));
    if (pergunta === 'populacao') {
      return [
        { codigo: 'amostra_como_populacao', texto: d.amostra, explicacao: q(d.amostra) + ' são só os que foram observados: são a amostra. A população é o conjunto de todos sobre quem se quer concluir: ' + m(d.populacao) + '.' },
        { codigo: 'variavel_como_populacao', texto: d.variavel, explicacao: q(d.variavel) + ' é a caraterística que se observa (a variável), não um conjunto de unidades estatísticas.' },
        { codigo: 'populacao_alargada', texto: d.alargada, explicacao: 'O estudo só quer tirar conclusões sobre ' + m(d.populacao) + '; ' + q(d.alargada) + ' vai além do que foi definido.' },
      ];
    }
    if (pergunta === 'amostra') {
      return [
        { codigo: 'populacao_como_amostra', texto: d.populacao, explicacao: q(d.populacao) + ' é a população (todos sobre quem se quer concluir); a amostra é só a parte observada: ' + m(d.amostra) + '.' },
        { codigo: 'variavel_como_amostra', texto: d.variavel, explicacao: q(d.variavel) + ' é a variável (o que se mede ou pergunta), não as unidades observadas.' },
        { codigo: 'alargada_como_amostra', texto: d.alargada, explicacao: q(d.alargada) + ' nem sequer é a população do estudo; a amostra é a parte que foi de facto observada: ' + m(d.amostra) + '.' },
      ];
    }
    return [
      { codigo: 'populacao_como_variavel', texto: d.populacao, explicacao: q(d.populacao) + ' é a população; a variável é a caraterística observada em cada unidade.' },
      { codigo: 'amostra_como_variavel', texto: d.amostra, explicacao: q(d.amostra) + ' é a amostra (quem foi observado); a variável é o que se observou em cada um.' },
      { codigo: 'dimensao_como_variavel', texto: d.dimensao, explicacao: fmt(n) + ' é a dimensão da amostra (quantos foram observados), não a caraterística estudada.' },
    ];
  }

  registar({
    subtema: 'conceitos', tipo: 'populacao-amostra', nome: 'População, amostra e variável',
    formatos: ['escolha'], contextos: IDS_ESTUDOS,
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const e = estudo(contexto);
        const { N, n } = sortearNs(rng, e);
        const pergunta = escolher(rng, ['populacao', 'amostra', 'variavel']);
        const d = descricoes(e, N, n);
        const enunciado = e.objetivo(N) + ' ' + e.aleatoria(n) + ' ' + PERGUNTA_PA[pergunta];
        const resolucao = [
          { passo: 'Identificar a população', porque: 'É o conjunto de todos sobre quem se quer tirar conclusões: ' + minuscula(semPonto(d.populacao)) + '.' },
          { passo: 'Identificar a amostra', porque: 'É a parte da população que é de facto observada: ' + minuscula(semPonto(d.amostra)) + '.' },
          { passo: 'Identificar a variável', porque: 'É a caraterística observada em cada unidade: ' + minuscula(semPonto(d.variavel)) + '.' },
        ];
        const verificacao = { passo: 'Confirmar que a amostra é uma parte da população', calculo: 'n = ' + tex(n) + ' < N = ' + tex(N) };
        return fecharTexto(rng, { enunciado, resolucao, verificacao, dados: { estudo: e.id, N, n, pergunta } }, d[pergunta], errosPopulacaoAmostra(pergunta, d, n), d[pergunta]);
      });
    },
    verificarIndependente(p) {
      const { N, n, pergunta } = p.dados;
      const e = estudo(p.dados.estudo);
      if (!e || !(n < N)) return false;
      const esperado = { populacao: e.populacao(N), amostra: e.amostra(n), variavel: e.variavel }[pergunta];
      return A.chave(p.opcoes[p.correta]) === A.chave(esperado);
    },
    limites(p) {
      const e = estudo(p.dados.estudo);
      return !!e && p.dados.N >= e.N[0] && p.dados.N <= e.N[1] && p.dados.n >= e.n[0] && p.dados.n <= e.n[1];
    },
  });

  // Variáveis para classificar (nomes únicos).
  const VARIAVEIS = [
    { nome: 'Cor preferida', tipo: 'qualitativa', razao: 'os valores são cores (categorias), não números' },
    { nome: 'Meio de transporte usado para ir para a escola', tipo: 'qualitativa', razao: 'os valores são categorias (a pé, autocarro, carro…)' },
    { nome: 'Clube de futebol preferido', tipo: 'qualitativa', razao: 'os valores são nomes de clubes' },
    { nome: 'Grupo sanguíneo', tipo: 'qualitativa', razao: 'os valores são categorias (A, B, AB, O)' },
    { nome: 'Distrito onde nasceu', tipo: 'qualitativa', razao: 'os valores são nomes de distritos' },
    { nome: 'Número da camisola de cada jogador', tipo: 'qualitativa', codigo: true, razao: 'o número só identifica o jogador, e não faz sentido somá-lo nem calcular a média' },
    { nome: 'Código postal da residência', tipo: 'qualitativa', codigo: true, razao: 'o código só identifica uma zona, e não faz sentido fazer contas com ele' },
    { nome: 'Número de aluno na pauta', tipo: 'qualitativa', codigo: true, razao: 'o número só identifica o aluno e não mede nem conta nada' },
    { nome: 'Número de irmãos', tipo: 'discreta', poucos: true, razao: 'resulta de uma contagem (0, 1, 2, …)' },
    { nome: 'Número de golos marcados num jogo', tipo: 'discreta', poucos: true, razao: 'resulta de uma contagem (0, 1, 2, …)' },
    { nome: 'Número de pessoas do agregado familiar', tipo: 'discreta', poucos: true, razao: 'resulta de uma contagem (1, 2, 3, …)' },
    { nome: 'Número de livros lidos num ano', tipo: 'discreta', razao: 'resulta de uma contagem e só toma valores inteiros isolados' },
    { nome: 'Número de mensagens enviadas num dia', tipo: 'discreta', razao: 'resulta de uma contagem e só toma valores inteiros isolados' },
    { nome: 'Número de visitantes de um museu por dia', tipo: 'discreta', razao: 'resulta de uma contagem e só toma valores inteiros isolados' },
    { nome: 'Altura, em centímetros', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
    { nome: 'Tempo, em segundos, para correr 100 m', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
    { nome: 'Massa, em quilogramas', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
    { nome: 'Temperatura máxima diária, em graus Celsius', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
    { nome: 'Distância de casa à escola, em quilómetros', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
    { nome: 'Tempo de sono por noite, em horas', tipo: 'continua', razao: 'resulta de uma medição e pode tomar qualquer valor de um intervalo' },
  ];
  const NOME_TIPO = { qualitativa: 'qualitativa', discreta: 'quantitativa discreta', continua: 'quantitativa contínua' };
  const variavelPorNome = (nome) => VARIAVEIS.find((v) => v.nome === nome);
  const descreverVariavel = (v) => '«' + v.nome + '» é ' + NOME_TIPO[v.tipo] + ', pois ' + v.razao + '.';

  registar({
    subtema: 'conceitos', tipo: 'tipo-variavel', nome: 'Tipo de variável',
    formatos: ['escolha'], contextos: ['qualitativa', 'discreta', 'continua'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const alvo = contexto;
        const de = (f) => escolher(rng, VARIAVEIS.filter(f));
        let certa, erros;
        if (alvo === 'qualitativa') {
          certa = rng() < 0.5 ? de((v) => v.tipo === 'qualitativa' && v.codigo) : de((v) => v.tipo === 'qualitativa' && !v.codigo);
          const pouco = de((v) => v.tipo === 'discreta' && v.poucos);
          const cont = de((v) => v.tipo === 'continua');
          const disc = de((v) => v.tipo === 'discreta' && !v.poucos);
          erros = [
            { codigo: 'contagem_como_categoria', texto: pouco.nome, explicacao: '«' + pouco.nome + '» toma poucos valores, mas não são categorias: é quantitativa discreta, porque ' + pouco.razao + '.' },
            { codigo: 'continua_como_qualitativa', texto: cont.nome, explicacao: descreverVariavel(cont) },
            { codigo: 'discreta_como_qualitativa', texto: disc.nome, explicacao: '«' + disc.nome + '» tem valores numéricos com significado (faz sentido calcular a média): é quantitativa discreta, porque ' + disc.razao + '.' },
          ];
        } else {
          certa = de((v) => v.tipo === alvo);
          const outra = de((v) => v.tipo === (alvo === 'continua' ? 'discreta' : 'continua'));
          const qual = de((v) => v.tipo === 'qualitativa' && !v.codigo);
          const cod = de((v) => v.codigo);
          erros = [
            alvo === 'continua'
              ? { codigo: 'discreta_como_continua', texto: outra.nome, explicacao: '«' + outra.nome + '» é quantitativa discreta, não contínua, pois ' + outra.razao + '.' }
              : { codigo: 'continua_como_discreta', texto: outra.nome, explicacao: '«' + outra.nome + '» é quantitativa contínua, não discreta, pois ' + outra.razao + ' (mesmo que se arredonde).' },
            { codigo: 'qualitativa_como_quantitativa', texto: qual.nome, explicacao: descreverVariavel(qual) },
            { codigo: 'codigo_numerico_como_quantitativa', texto: cod.nome, explicacao: '«' + cod.nome + '» escreve-se com algarismos, mas é qualitativa, pois ' + cod.razao + '.' },
          ];
        }
        const resolucao = [
          { passo: 'Distinguir os tipos de variável', porque: 'Uma variável é qualitativa quando os valores são categorias (mesmo que escritas com algarismos). É quantitativa discreta quando os valores resultam de contagens e quantitativa contínua quando resultam de medições.' },
          { passo: 'Classificar cada opção', porque: descreverVariavel(certa) },
        ];
        const verificacao = {
          passo: 'Confirmar pela natureza dos valores (categorias, contagens ou medições)',
          calculo: alvo === 'qualitativa' ? '\\text{categorias} \\Rightarrow \\text{qualitativa}' : alvo === 'discreta' ? '\\text{contagem: } 0, 1, 2, \\ldots' : '\\text{medida: qualquer valor de um intervalo}',
        };
        return fecharTexto(rng, { enunciado: 'Num inquérito registaram-se várias variáveis. Qual das seguintes variáveis é ' + NOME_TIPO[alvo] + '?', resolucao, verificacao, dados: { alvo } }, certa.nome, erros, certa.nome);
      });
    },
    verificarIndependente(p) {
      const tipos = p.opcoes.map((o) => (variavelPorNome(o) || {}).tipo);
      if (tipos.some((t) => !t)) return false;
      const certas = tipos.map((t, i) => (t === p.dados.alvo ? i : -1)).filter((i) => i >= 0);
      return certas.length === 1 && certas[0] === p.correta;
    },
    limites(p) {
      return p.opcoes.every((o) => !!variavelPorNome(o));
    },
  });

  registar({
    subtema: 'conceitos', tipo: 'enviesamento', nome: 'Amostra enviesada?',
    formatos: ['vf'], contextos: IDS_ESTUDOS,
    gerar(semente, { contexto, rng }) {
      const e = estudo(contexto);
      const { N, n } = sortearNs(rng, e);
      const metodo = rng() < 0.4 ? null : escolher(rng, e.enviesadas);
      const enviesada = !!metodo;
      const recolha = enviesada ? metodo.texto(n) : e.aleatoria(n);
      const SIM = 'A amostra obtida é enviesada.';
      const NAO = 'A amostra obtida não é enviesada.';
      const v = enviesada
        ? A.vfDe(rng, SIM, NAO, { codigo: 'nao_viu_' + metodo.codigo, explicacao: 'A amostra é enviesada: ' + metodo.razao + '.' })
        : A.vfDe(rng, NAO, SIM, { codigo: 'aleatoria_vista_como_enviesada', explicacao: 'A amostra foi escolhida ao acaso entre todos: cada elemento da população tinha a mesma probabilidade de ser escolhido, por isso não é enviesada. Uma amostra pequena dá estimativas menos precisas, mas isso não é enviesamento.' });
      const afirmaEnviesada = v.enunciado === SIM;
      const resolucao = [
        { passo: 'Ver como foi escolhida a amostra', porque: enviesada ? 'A amostra não foi sorteada: ' + metodo.razao + '.' : 'A amostra foi sorteada entre todos: todos tinham a mesma probabilidade de ser escolhidos.' },
        { passo: 'Concluir', porque: enviesada ? 'Uma amostra que favorece uma parte da população é enviesada: as conclusões não se podem estender à população.' : 'Uma amostra aleatória não é enviesada; a dimensão da amostra só influencia a precisão das estimativas.' },
      ];
      const verificacao = {
        passo: 'Confirmar se todos tinham a mesma probabilidade de ser escolhidos',
        calculo: enviesada ? 'P(\\text{ser escolhido})\\ \\text{diferente de elemento para elemento}' : 'P(\\text{ser escolhido}) = \\dfrac{' + tex(n) + '}{' + tex(N) + '}\\ \\text{para todos}',
        valor: afirmaEnviesada === enviesada,
      };
      return {
        enunciado: e.objetivo(N) + ' ' + recolha + ' Afirmação: «' + v.enunciado + '»',
        correta: v.correta, errosTipicos: v.errosTipicos, resolucao, verificacao,
        dados: { estudo: e.id, N, n, metodo: enviesada ? metodo.codigo : 'aleatoria', afirmaEnviesada },
      };
    },
    verificarIndependente(p) {
      const e = estudo(p.dados.estudo);
      if (!e) return false;
      const m = p.dados.metodo;
      if (m !== 'aleatoria' && !e.enviesadas.some((x) => x.codigo === m)) return false;
      const ehEnviesada = m !== 'aleatoria';
      return p.correta === (p.dados.afirmaEnviesada === ehEnviesada);
    },
    limites(p) {
      const e = estudo(p.dados.estudo);
      return !!e && p.dados.N >= e.N[0] && p.dados.N <= e.N[1] && p.dados.n >= e.n[0] && p.dados.n <= e.n[1];
    },
  });

  // ================================================================ frequências e histogramas
  const DISCRETOS = [
    { id: 'irmaos', intro: (n) => 'Perguntou-se a ' + fmt(n) + ' alunos quantos irmãos têm.', valores: [0, 4], sujeito: ['aluno', 'alunos'], perguntaAbs: 'Quantos alunos têm', perguntaPct: 'Que percentagem dos alunos tem', item: (v) => (v === 1 ? '1 irmão' : fmt(v) + ' irmãos') },
    { id: 'golos', intro: (n) => 'Registou-se o número de golos marcados por uma equipa em cada um dos ' + fmt(n) + ' jogos de uma época.', valores: [0, 5], sujeito: ['jogo', 'jogos'], perguntaAbs: 'Em quantos jogos a equipa marcou', perguntaPct: 'Em que percentagem dos jogos a equipa marcou', item: (v) => (v === 1 ? '1 golo' : fmt(v) + ' golos') },
    { id: 'animais', intro: (n) => 'Perguntou-se a ' + fmt(n) + ' famílias quantos animais de estimação têm.', valores: [0, 4], sujeito: ['família', 'famílias'], perguntaAbs: 'Quantas famílias têm', perguntaPct: 'Que percentagem das famílias tem', item: (v) => (v === 1 ? '1 animal' : fmt(v) + ' animais') },
    { id: 'livros', intro: (n) => 'Perguntou-se a ' + fmt(n) + ' alunos quantos livros leram nas férias.', valores: [0, 5], sujeito: ['aluno', 'alunos'], perguntaAbs: 'Quantos alunos leram', perguntaPct: 'Que percentagem dos alunos leu', item: (v) => (v === 1 ? '1 livro' : fmt(v) + ' livros') },
  ];
  const discreto = (id) => DISCRETOS.find((d) => d.id === id);
  const valoresDe = (t) => Array.from({ length: t.valores[1] - t.valores[0] + 1 }, (_, i) => t.valores[0] + i);
  const sujeito = (t, c) => (c === 1 ? t.sujeito[0] : t.sujeito[1]);
  const linhasTabela = (t, vals, cont) => vals.map((v, i) => t.item(v) + ' — ' + fmt(cont[i]) + ' ' + sujeito(t, cont[i])).join('; ');

  // Dados discretos: contagens ≥ 1 para cada valor do tema, total n.
  function dadosDiscretos(rng, t, n) {
    const vals = valoresDe(t);
    const cont = composicao(rng, n, vals.length);
    const xs = [];
    vals.forEach((v, i) => { for (let j = 0; j < cont[i]; j++) xs.push(v); });
    return { vals, cont, xs };
  }

  const tabelaArray = (vals, linhas) => '\\begin{array}{c|' + 'c'.repeat(vals.length) + '} x_i & ' + vals.map((v) => tex(v)).join(' & ') + ' \\\\ \\hline ' + linhas.map((l) => l[0] + ' & ' + l[1].map((v) => tex(v, 3)).join(' & ')).join(' \\\\ ') + ' \\end{array}';

  registar({
    subtema: 'frequencias-histograma', tipo: 'freq-relativa', nome: 'Frequência relativa',
    formatos: ['numerica', 'escolha'], contextos: ['tabela', 'lista'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, DISCRETOS);
        const n = contexto === 'lista' ? 20 : escolher(rng, [20, 25, 50]);
        const d = dadosDiscretos(rng, t, n);
        const xs = contexto === 'lista' ? baralhar(rng, d.xs) : d.xs;
        const v = escolher(rng, d.vals);
        const linhas = C.tabelaFrequencias(xs);
        const linha = linhas.find((l) => l.valor === v);
        const c = linha.absoluta;
        const f = limpo(linha.relativa);
        const k = d.vals.length;
        const apresentacao = contexto === 'lista' ? ' Os resultados foram: ' + listaTxt(xs) + '.' : ' Os resultados foram: ' + linhasTabela(t, d.vals, d.cont) + '.';
        const enunciado = t.intro(n) + apresentacao + ' Qual é a frequência relativa de «' + t.item(v) + '»? Apresenta-a na forma de dízima.';
        const resolucao = [
          contexto === 'lista'
            ? { passo: 'Contar as observações iguais a ' + fmt(v), porque: 'A frequência absoluta é o número de vezes que o valor aparece nos dados.', calculo: 'n_i = ' + tex(c) }
            : { passo: 'Ler a frequência absoluta', porque: 'Na tabela, «' + t.item(v) + '» aparece ' + fmt(c) + (c === 1 ? ' vez.' : ' vezes.'), calculo: 'n_i = ' + tex(c) },
          { passo: 'Dividir pelo número total de observações', porque: 'A frequência relativa é a fração do total que corresponde ao valor.', calculo: 'f_i = \\dfrac{n_i}{n} = \\dfrac{' + tex(c) + '}{' + tex(n) + '} = ' + tex(f) },
        ];
        // Verificação: total obtido somando as frequências absolutas (contadas nos dados).
        const contagens = d.vals.map((x) => xs.filter((y) => y === x).length);
        const total = soma(contagens);
        const erros = [
          { codigo: 'frequencia_absoluta', valor: c, explicacao: fmt(c) + ' é a frequência absoluta (quantas vezes aparece); a relativa divide-a pelo total: ' + fmt(c) + '/' + fmt(n) + '.' },
          { codigo: 'percentagem_sem_dividir', valor: limpo(f * 100), explicacao: fmt(limpo(f * 100)) + ' é a frequência relativa em percentagem; pedia-se em forma de dízima: ' + fmt(c) + '/' + fmt(n) + ' = ' + fmt(f) + '.' },
          { codigo: 'relativa_acumulada', valor: limpo(linha.relativaAcumulada), explicacao: 'Somaste as frequências de todos os valores até ' + fmt(v) + ': isso é a frequência relativa acumulada, não a de «' + t.item(v) + '».' },
          { codigo: 'dividiu_pelo_numero_de_valores', valor: r2(c / k), explicacao: 'Dividiste pelo número de valores diferentes (' + fmt(k) + '); a frequência relativa divide pelo número de observações (' + fmt(n) + ').' },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs, v } }, {
          resposta: f, tolerancia: 0, texto: (x) => texNum(x, 3), erros,
          verificacao: {
            passo: 'Confirmar o total somando as frequências absolutas',
            calculo: 'n = ' + contagens.map((x) => tex(x)).join(' + ') + ' = ' + tex(total) + ' \\Rightarrow f_i = \\dfrac{' + tex(c) + '}{' + tex(total) + '} = ' + tex(c / total, 3),
            valor: limpo(c / total),
          },
        });
      });
    },
    verificarIndependente(p) {
      const xs = p.dados.xs;
      const f = xs.filter((x) => x === p.dados.v).length / xs.length;
      return confere(p, limpo(f), (x) => texNum(x, 3));
    },
    limites(p) {
      const t = discreto(p.dados.tema);
      return !!t && [20, 25, 50].includes(p.dados.xs.length) && p.dados.xs.every((x) => x >= t.valores[0] && x <= t.valores[1]);
    },
  });

  const RELACOES = {
    max: { txt: 'no máximo', teste: (x, k) => x <= k },
    min: { txt: 'pelo menos', teste: (x, k) => x >= k },
    menos: { txt: 'menos de', teste: (x, k) => x < k },
  };

  registar({
    subtema: 'frequencias-histograma', tipo: 'freq-acumulada', nome: 'Frequência acumulada',
    formatos: ['numerica', 'escolha'], contextos: ['absoluta', 'relativa'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, DISCRETOS);
        const n = escolher(rng, [20, 25, 50]);
        const d = dadosDiscretos(rng, t, n);
        const rel = escolher(rng, ['max', 'min', 'menos']);
        const [v0, v1] = t.valores;
        const k = rel === 'menos' ? inteiro(rng, v0 + 2, v1) : inteiro(rng, v0 + 1, v1 - 1);
        const linhas = C.tabelaFrequencias(d.xs);
        const Nac = (v) => (v < v0 ? 0 : linhas.find((l) => l.valor === v).absolutaAcumulada);
        const nk = linhas.find((l) => l.valor === k).absoluta;
        const abs = rel === 'max' ? Nac(k) : rel === 'min' ? n - Nac(k - 1) : Nac(k - 1);
        const pct = contexto === 'relativa';
        const conv = (c) => (pct ? limpo((c / n) * 100) : c);
        const resposta = conv(abs);
        const R = RELACOES[rel];
        const item = t.item(k);
        const lado = rel === 'max' ? 'abaixo' : 'acima';
        let erros;
        if (rel === 'max') {
          erros = [
            { codigo: 'excluiu_extremo', valor: conv(Nac(k - 1)), explicacao: '«No máximo ' + item + '» inclui as observações com exatamente ' + item + ': soma-se até ' + fmt(k) + ', inclusive.' },
            { codigo: 'contou_o_complementar', valor: conv(n - Nac(k)), explicacao: 'Contaste as observações com mais de ' + item + ', que é o contrário do pedido.' },
            { codigo: 'so_o_valor', valor: conv(nk), explicacao: 'Contaste só as observações com exatamente ' + item + '; é preciso somar também as dos valores ' + lado + '.' },
          ];
        } else if (rel === 'min') {
          erros = [
            { codigo: 'excluiu_extremo', valor: conv(n - Nac(k)), explicacao: '«Pelo menos ' + item + '» inclui as observações com exatamente ' + item + ': soma-se de ' + fmt(k) + ' para cima, inclusive.' },
            { codigo: 'contou_o_complementar', valor: conv(Nac(k - 1)), explicacao: 'Contaste as observações com menos de ' + item + ', que é o contrário do pedido.' },
            { codigo: 'so_o_valor', valor: conv(nk), explicacao: 'Contaste só as observações com exatamente ' + item + '; é preciso somar também as dos valores ' + lado + '.' },
          ];
        } else {
          erros = [
            { codigo: 'incluiu_extremo', valor: conv(Nac(k)), explicacao: '«Menos de ' + item + '» não inclui as observações com ' + item + ': soma-se só até ' + fmt(k - 1) + '.' },
            { codigo: 'contou_o_complementar', valor: conv(n - Nac(k - 1)), explicacao: 'Contaste as observações com ' + item + ' ou mais, que é o contrário do pedido.' },
          ];
          if (!pct) erros.push({ codigo: 'contou_valores', valor: k - v0, explicacao: 'Contaste quantos valores diferentes há abaixo de ' + fmt(k) + '; pedia-se o número de observações (a soma das frequências).' });
        }
        if (pct) erros.push({ codigo: 'contagem_em_vez_de_percentagem', valor: abs, explicacao: fmt(abs) + ' é o número de ' + t.sujeito[1] + '; falta dividir pelo total (' + fmt(n) + ') e multiplicar por 100 para obter a percentagem.' });
        const pergunta = (pct ? t.perguntaPct : t.perguntaAbs) + ' ' + R.txt + ' ' + item + '?';
        const enunciado = t.intro(n) + ' Os resultados foram: ' + linhasTabela(t, d.vals, d.cont) + '. ' + pergunta;
        const pedidos = d.vals.filter((x) => R.teste(x, k));
        const outros = d.vals.filter((x) => !R.teste(x, k));
        const contDe = (x) => d.cont[d.vals.indexOf(x)];
        const resolucao = [
          {
            passo: 'Organizar as frequências absolutas e acumuladas',
            porque: 'A frequência absoluta acumulada de um valor é o número de observações menores ou iguais a esse valor.',
            calculo: tabelaArray(d.vals, [['n_i', d.cont], ['N_i', d.vals.map((x) => Nac(x))]]),
            bloco: true,
          },
          {
            passo: 'Somar as frequências dos valores pedidos',
            porque: '«' + maiuscula(R.txt) + ' ' + item + '» corresponde ' + (pedidos.length === 1 ? 'ao valor ' : 'aos valores ') + listaTxt(pedidos) + '.',
            calculo: pedidos.map((x) => tex(contDe(x))).join(' + ') + ' = ' + tex(abs),
          },
        ];
        if (pct) resolucao.push({ passo: 'Converter em percentagem', porque: 'Divide-se pelo total e multiplica-se por 100.', calculo: '\\dfrac{' + tex(abs) + '}{' + tex(n) + '} \\times 100 = ' + tex(resposta) + '\\,\\%' });
        // Verificação: pelo complementar, contado diretamente nos dados.
        const comp = d.xs.filter((x) => !R.teste(x, k)).length;
        const compTermos = outros.map((x) => tex(contDe(x))).join(' + ');
        const valor = pct ? limpo(100 - (comp / n) * 100) : n - comp;
        const calculo = pct
          ? '100 - \\dfrac{' + compTermos + '}{' + tex(n) + '} \\times 100 = 100 - ' + tex(limpo((comp / n) * 100)) + ' = ' + tex(valor)
          : tex(n) + ' - (' + compTermos + ') = ' + tex(n) + ' - ' + tex(comp) + ' = ' + tex(valor);
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs: d.xs, rel, k } }, {
          resposta, tolerancia: 0, unidade: pct ? '%' : t.sujeito[1],
          texto: pct ? (x) => fmt(x) + ' %' : (x) => fmt(x) + ' ' + sujeito(t, x),
          erros,
          verificacao: { passo: 'Confirmar pelo complementar (as observações que ficam de fora)', calculo, valor },
        });
      });
    },
    verificarIndependente(p) {
      const { xs, rel, k } = p.dados;
      const c = xs.filter((x) => RELACOES[rel].teste(x, k)).length;
      const v = p.contexto === 'relativa' ? limpo((c * 100) / xs.length) : c;
      const t = discreto(p.dados.tema);
      return confere(p, v, p.contexto === 'relativa' ? (x) => fmt(x) + ' %' : (x) => fmt(x) + ' ' + sujeito(t, x));
    },
    limites(p) {
      const t = discreto(p.dados.tema);
      return !!t && [20, 25, 50].includes(p.dados.xs.length) && p.dados.xs.every((x) => x >= t.valores[0] && x <= t.valores[1]);
    },
  });

  // Dados contínuos agrupados em classes [a + jh, a + (j + 1)h[.
  const CONTINUOS = [
    { id: 'alturas', intro: (n) => 'Mediu-se a altura, em centímetros, de ' + fmt(n) + ' alunos', inicios: [140, 145, 150], h: [5, 10] },
    { id: 'tempos', intro: (n) => 'Registou-se o tempo, em minutos, que ' + fmt(n) + ' alunos demoram de casa à escola', inicios: [5, 10], h: [5, 10] },
    { id: 'pulsacoes', intro: (n) => 'Registou-se a pulsação em repouso, em batimentos por minuto, de ' + fmt(n) + ' atletas', inicios: [50, 55, 60], h: [5, 10] },
    { id: 'pontuacoes', intro: (n) => 'Registaram-se as pontuações, de 0 a 100, de ' + fmt(n) + ' alunos num jogo', inicios: [20, 30, 40], h: [10] },
  ];
  const continuo = (id) => CONTINUOS.find((c) => c.id === id);
  const classeTex = (a, h, j) => '[' + tex(a + j * h) + ', ' + tex(a + (j + 1) * h) + '[';
  const classeTxt = (a, h, j) => '$' + classeTex(a, h, j) + '$';
  const unicoMaximo = (l) => {
    const max = Math.max(...l);
    return l.indexOf(max) === l.lastIndexOf(max) ? l.indexOf(max) : -1;
  };

  // Classe modal: lista de dados brutos ou tabela de frequências acumuladas.
  // Valores inteiros de uma classe [lo, hi]: fixos + pares + (triplo) + simples, todos os do interior distintos entre si.
  function valoresClasse(rng, lo, hi, total, fixos, pares, triplo) {
    const simples = total - fixos.length - 2 * pares - (triplo ? 3 : 0);
    if (simples < 0) return null;
    const precisos = pares + (triplo ? 1 : 0) + simples;
    const interior = baralhar(rng, Array.from({ length: hi - lo }, (_, i) => lo + 1 + i));
    if (precisos > interior.length) return null;
    const usados = interior.slice(0, precisos);
    const vals = fixos.slice();
    let i = 0;
    let vt = null;
    if (triplo) { vt = usados[i++]; vals.push(vt, vt, vt); }
    for (let k = 0; k < pares; k++) { const v = usados[i++]; vals.push(v, v); }
    while (i < usados.length) vals.push(usados[i++]);
    return { vals, vt };
  }

  function construirModalLista(rng) {
    const C = calc();
    const t = escolher(rng, CONTINUOS);
    const k = 5;
    const h = 10;
    const a = escolher(rng, t.inicios);
    // Classe modal num dos lados (1 ou 4) e as outras classes bem povoadas: a mediana cai noutra classe.
    const m = escolher(rng, [1, k - 1]);
    // comRepetidos: uma classe não modal (jd) com um valor repetido fica com mais valores diferentes do que
    // todas as outras (a modal e a anterior têm dois pares além dos valores de fronteira) — é a classe que
    // escolhe quem conta valores diferentes em vez de observações.
    const comRepetidos = rng() < 0.5;
    const cm = comRepetidos ? inteiro(rng, 6, 7) : inteiro(rng, 5, 7);
    const cont = Array(k).fill(0);
    cont[m] = cm;
    cont[m - 1] = cm - 1;
    const livres = [];
    for (let j = 0; j < k; j++) if (j !== m && j !== m - 1) livres.push(j);
    for (const j of livres) cont[j] = inteiro(rng, cm - 3, cm - 2);
    const jd = comRepetidos ? escolher(rng, livres) : -1;
    if (jd >= 0) cont[jd] = cm - 1;
    // Classe da mediana (só depende das contagens): a classe do valor que se repete tem de ser outra.
    const n = soma(cont);
    const acum = [];
    cont.reduce((s0, c) => { acum.push(s0 + c); return s0 + c; }, 0);
    const posMed = n % 2 ? [(n + 1) / 2] : [n / 2, n / 2 + 1];
    const classesMed = posMed.map((q) => acum.findIndex((N) => N >= q));
    if (classesMed.some((j) => j !== classesMed[0])) return null;
    const tc = escolher(rng, livres.filter((j) => j !== classesMed[0] && j !== jd));
    if (tc === undefined || cont[tc] < (tc === 0 ? 4 : 3)) return null;
    const xs = [];
    let vt = null;
    for (let j = 0; j < k; j++) {
      const lo = a + j * h;
      const fixos = j === m ? [lo, lo] : j === 0 ? [lo] : [];
      let pares = 0;
      if (comRepetidos) pares = j === m || j === m - 1 ? 2 : j === tc ? 0 : 1;
      const r = valoresClasse(rng, lo, lo + h - 1, cont[j], fixos, pares, j === tc);
      if (!r) return null;
      if (j === tc) vt = r.vt;
      xs.push(...r.vals);
    }
    const cls = C.classes(xs, h, a);
    if (cls.length !== k) return null;
    const counts = cls.map((c) => c.absoluta);
    const modal = unicoMaximo(counts);
    if (modal !== m) return null;
    const moda = C.moda(xs);
    if (moda.length !== 1 || moda[0] !== vt) return null;
    const me = C.mediana(xs);
    const classeDe = (x) => Math.min(Math.floor((x - a) / h + 1e-9), k - 1);
    // Erro: valores iguais ao limite inferior contados na classe anterior (classes ]a, b]).
    const errado = Array(k).fill(0);
    for (const x of xs) {
      let j = classeDe(x);
      if (j > 0 && Math.abs(x - (a + j * h)) < 1e-9) j--;
      errado[j]++;
    }
    const mFront = unicoMaximo(errado);
    // Erro «valores diferentes»: só se a classe que ganha em valores diferentes tem mesmo valores repetidos.
    const distintos = Array.from({ length: k }, (_, j) => new Set(xs.filter((x) => classeDe(x) === j)).size);
    const jMax = unicoMaximo(distintos);
    const jDist = jMax >= 0 && jMax !== m && distintos[jMax] < counts[jMax] ? jMax : -1;
    const ordem = baralhar(rng, xs);
    return {
      t, k, h, a, xs: ordem, counts, modal,
      erros: [
        { codigo: 'fronteira_na_classe_anterior', j: mFront, explicacao: 'Contaste os valores iguais ao limite inferior de uma classe (como ' + fmt(a + m * h) + ') na classe anterior; numa classe [a, b[ o valor b já pertence à classe seguinte.' },
        { codigo: 'classe_da_mediana', j: classeDe(me), explicacao: 'Essa é a classe onde fica a mediana (' + fmt(me) + '); a classe modal é a que tem maior frequência.' },
        { codigo: 'classe_do_valor_mais_frequente', j: classeDe(vt), explicacao: 'O valor que mais se repete (' + fmt(vt) + ') está nessa classe, mas a classe modal é a que tem mais valores no total.' },
        { codigo: 'contou_valores_diferentes', j: jDist, explicacao: jDist < 0 ? '' : 'Contaste os valores diferentes de cada classe, mas os repetidos também contam. A classe ' + classeTxt(a, h, jDist) + ' tem ' + fmt(distintos[jDist]) + ' valores diferentes e ' + fmt(counts[jDist]) + ' observações; a classe ' + classeTxt(a, h, m) + ' tem só ' + fmt(distintos[m]) + ' valores diferentes, mas ' + fmt(counts[m]) + ' observações.' },
      ],
    };
  }

  function construirModalAcumulada(rng) {
    const C = calc();
    const t = escolher(rng, CONTINUOS);
    const k = 5;
    const h = escolher(rng, t.h);
    const a = escolher(rng, t.inicios);
    const m = inteiro(rng, 1, 3);
    const cm = inteiro(rng, 5, 9);
    const cont = Array.from({ length: k }, (_, j) => (j === m ? cm : inteiro(rng, 1, cm - 1)));
    // xs: marcas de classe repetidas (servem para o cálculo e para o esquema).
    const xs = [];
    cont.forEach((c, j) => { for (let i = 0; i < c; i++) xs.push(a + j * h + h / 2); });
    const cls = C.classes(xs, h, a);
    if (cls.length !== k) return null;
    const counts = cls.map((c) => c.absoluta);
    const modal = unicoMaximo(counts);
    if (modal !== m) return null;
    const n = xs.length;
    const acum = [];
    counts.reduce((s, c) => { acum.push(s + c); return s + c; }, 0);
    const jMed = acum.findIndex((N) => 2 * N >= n);
    // Erro: diferenças atribuídas à classe anterior (n'_j = N_{j+1} − N_j).
    const desf = counts.slice(1).concat([0]);
    return {
      t, k, h, a, xs, counts, acum, modal,
      erros: [
        { codigo: 'leu_acumulada', j: k - 1, explicacao: 'A última classe tem a maior frequência acumulada (é sempre o total, ' + fmt(n) + '); a classe modal tem a maior frequência absoluta, que é a diferença entre a acumulada dessa classe e a da anterior.' },
        { codigo: 'diferenca_desfasada', j: unicoMaximo(desf), explicacao: 'A frequência de uma classe é a acumulada dessa classe menos a da anterior; atribuíste cada diferença à classe errada.' },
        { codigo: 'classe_da_mediana', j: jMed, explicacao: 'Essa é a classe onde a frequência acumulada passa metade do total (a classe da mediana); a classe modal é a de maior frequência absoluta.' },
      ],
    };
  }

  registar({
    subtema: 'frequencias-histograma', tipo: 'classe-modal', nome: 'Classe modal',
    formatos: ['escolha'], contextos: ['lista', 'acumulada'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const r = contexto === 'lista' ? construirModalLista(rng) : construirModalAcumulada(rng);
        if (!r) return null;
        const { t, k, h, a, xs, counts, modal } = r;
        const vistos = [modal];
        const erros = [];
        // Lista: quatro erros candidatos, por ordem aleatória (ficam os três primeiros que dão classes diferentes).
        const candidatos = contexto === 'lista' ? baralhar(rng, r.erros) : r.erros;
        for (const e of candidatos) {
          if (e.j < 0 || vistos.includes(e.j)) continue;
          vistos.push(e.j);
          erros.push({ codigo: e.codigo, texto: classeTxt(a, h, e.j), explicacao: e.explicacao });
        }
        if (erros.length < 3) return null;
        const classesTxt = Array.from({ length: k }, (_, j) => classeTxt(a, h, j)).join(', ');
        let enunciado, resolucao, verificacao;
        if (contexto === 'lista') {
          enunciado = t.intro(xs.length) + '. Os valores foram: ' + listaTxt(xs) + '. Agrupando os dados nas classes ' + classesTxt + ', qual é a classe modal?';
          resolucao = [
            {
              passo: 'Contar os valores de cada classe',
              porque: 'Cada valor conta numa só classe; um valor igual ao limite inferior de uma classe pertence a essa classe (as classes são da forma [a, b[).',
              calculo: '\\begin{array}{c|c} \\text{classe} & n_i \\\\ \\hline ' + counts.map((c, j) => classeTex(a, h, j) + ' & ' + tex(c)).join(' \\\\ ') + ' \\end{array}',
              bloco: true,
            },
            { passo: 'Escolher a classe com maior frequência', porque: 'A classe modal é a classe com maior frequência absoluta.', calculo: classeTex(a, h, modal) + ':\\ n_i = ' + tex(counts[modal]) },
          ];
          verificacao = { passo: 'Confirmar que as frequências das classes somam o total de dados', calculo: counts.map((c) => tex(c)).join(' + ') + ' = ' + tex(xs.length) };
        } else {
          const acum = r.acum;
          enunciado = t.intro(xs.length) + '. Os dados foram agrupados em classes e as frequências absolutas acumuladas foram: ' + acum.map((N, j) => classeTxt(a, h, j) + ' → ' + fmt(N)).join('; ') + '. Qual é a classe modal?';
          resolucao = [
            {
              passo: 'Obter a frequência absoluta de cada classe',
              porque: 'A frequência de uma classe é a acumulada dessa classe menos a acumulada da classe anterior.',
              calculo: '\\begin{array}{c|c|c} \\text{classe} & N_i & n_i \\\\ \\hline ' + acum.map((N, j) => classeTex(a, h, j) + ' & ' + tex(N) + ' & ' + (j === 0 ? tex(N) : tex(N) + ' - ' + tex(acum[j - 1]) + ' = ' + tex(counts[j]))).join(' \\\\ ') + ' \\end{array}',
              bloco: true,
            },
            { passo: 'Escolher a classe com maior frequência absoluta', porque: 'A classe modal é a classe com maior frequência absoluta (não a de maior frequência acumulada).', calculo: classeTex(a, h, modal) + ':\\ n_i = ' + tex(counts[modal]) },
          ];
          verificacao = { passo: 'Confirmar que as frequências absolutas somam o total', calculo: counts.map((c) => tex(c)).join(' + ') + ' = ' + tex(acum[k - 1]) };
        }
        // Valor da verificação: contagem independente por classe.
        const jInd = contexto === 'lista' ? modalPorContagem(xs, a, h, k) : modalPorDiferencas(r.acum);
        return fecharTexto(rng, {
          enunciado, resolucao, verificacao,
          dados: contexto === 'lista' ? { tema: t.id, xs, a, h, k } : { tema: t.id, acum: r.acum, a, h, k },
          esquema: { id: 'histograma', opcoes: { dados: xs.slice(), amplitudeClasse: h } },
        }, classeTxt(a, h, modal), erros, classeTxt(a, h, jInd));
      });
    },
    verificarIndependente(p) {
      const { a, h, k } = p.dados;
      const j = p.contexto === 'lista' ? modalPorContagem(p.dados.xs, a, h, k) : modalPorDiferencas(p.dados.acum);
      return j >= 0 && A.chave(p.opcoes[p.correta]) === A.chave(classeTxt(a, h, j));
    },
    limites(p) {
      const n = p.contexto === 'lista' ? p.dados.xs.length : p.dados.acum[p.dados.acum.length - 1];
      return !!continuo(p.dados.tema) && n >= 10 && n <= 45 && p.dados.k >= 4 && p.dados.k <= 5;
    },
  });

  function modalPorContagem(xs, a, h, k) {
    const c = Array(k).fill(0);
    for (const x of xs) {
      let j = 0;
      while (j < k - 1 && x >= a + (j + 1) * h) j++;
      c[j]++;
    }
    return unicoMaximo(c);
  }

  function modalPorDiferencas(acum) {
    return unicoMaximo(acum.map((N, j) => N - (j ? acum[j - 1] : 0)));
  }

  const AMPLITUDES = [
    { id: 'alturas', desc: 'a altura de um grupo de alunos', unidade: 'cm', min: [140, 160, 1], h: [2, 2.5, 4, 5] },
    { id: 'tempos100', desc: 'o tempo, em segundos, de um grupo de atletas nos 100 m', unidade: 's', min: [11, 14, 0.5], h: [0.25, 0.4, 0.5] },
    { id: 'massas', desc: 'a massa de um grupo de pessoas', unidade: 'kg', min: [40, 55, 1], h: [2, 2.5, 4, 5] },
    { id: 'pontuacoes', desc: 'a pontuação de um grupo de jogadores', unidade: 'pontos', min: [10, 30, 5], h: [5, 10, 15] },
  ];

  registar({
    subtema: 'frequencias-histograma', tipo: 'amplitude-classe', nome: 'Amplitude de classe',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, AMPLITUDES);
        const k = escolher(rng, [4, 5, 6, 8]);
        const hEsc = escolher(rng, t.h);
        const min = A.entre(rng, t.min[0], t.min[1], t.min[2]);
        const max = limpo(min + k * hEsc);
        const amp = limpo(C.amplitude([min, max]));
        const h = limpo(amp / k);
        const u = t.unidade;
        const inteiros = Number.isInteger(min) && Number.isInteger(max);
        const erros = [
          { codigo: 'dividiu_k_menos_1', valor: r2(amp / (k - 1)), explicacao: 'As ' + fmt(k) + ' classes cobrem a distância de ' + fmt(min) + ' a ' + fmt(max) + ' com ' + fmt(k) + ' amplitudes (não ' + fmt(k - 1) + '): divide-se por ' + fmt(k) + '.' },
          { codigo: 'sem_subtrair_minimo', valor: r2(max / k), explicacao: 'Dividiste o máximo pelo número de classes; o que se reparte pelas classes é a amplitude dos dados, ' + fmt(max) + ' − ' + fmt(min) + ' = ' + fmt(amp) + '.' },
          { codigo: 'esqueceu_dividir', valor: amp, explicacao: fmt(amp) + ' é a amplitude dos dados (de todas as classes juntas); cada classe fica com uma parte: divide-se por ' + fmt(k) + '.' },
        ];
        if (inteiros) erros.push({ codigo: 'contou_valores', valor: r2((amp + 1) / k), explicacao: 'Contaste os valores inteiros de ' + fmt(min) + ' a ' + fmt(max) + ' (' + fmt(amp + 1) + '); a amplitude de uma classe é uma distância: (' + fmt(max) + ' − ' + fmt(min) + ')/' + fmt(k) + '.' });
        const enunciado = 'Num estudo sobre ' + t.desc + ', os valores observados variaram entre ' + fmt(min) + ' ' + u + ' e ' + fmt(max) + ' ' + u + '. Queres agrupar os dados em ' + fmt(k) + ' classes com a mesma amplitude, a primeira a começar em ' + fmt(min) + ' e a última a terminar em ' + fmt(max) + '. Qual deve ser a amplitude de cada classe?';
        const resolucao = [
          { passo: 'Calcular a amplitude dos dados', porque: 'É a distância entre o máximo e o mínimo, que as classes têm de cobrir.', calculo: tex(max) + ' - ' + tex(min) + ' = ' + tex(amp) },
          { passo: 'Dividir pelo número de classes', porque: 'As ' + fmt(k) + ' classes têm todas a mesma amplitude.', calculo: 'h = \\dfrac{' + tex(amp) + '}{' + tex(k) + '} = ' + tex(h) },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, min, max, k } }, {
          resposta: h, tolerancia: 0, unidade: u, texto: (v) => fmt(v, 2) + ' ' + u, erros,
          verificacao: {
            passo: 'Confirmar que as ' + fmt(k) + ' classes terminam no máximo',
            calculo: tex(min) + ' + ' + tex(k) + ' \\times ' + tex(h) + ' = ' + tex(limpo(min + k * h)),
            valor: limpo((max - min) / k),
          },
        });
      });
    },
    verificarIndependente(p) {
      const { min, max, k } = p.dados;
      if (p.formato === 'numerica') return p.resposta > 0 && Math.abs(min + k * p.resposta - max) < 1e-9;
      const u = p.unidade || (AMPLITUDES.find((t) => t.id === p.dados.tema) || {}).unidade;
      let h = 0;
      while (min + k * h < max - 1e-9) h = limpo(h + 0.01);
      return confere(p, h, (v) => fmt(v, 2) + ' ' + u);
    },
    limites(p) {
      const { min, max, k } = p.dados;
      const h = (max - min) / k;
      return h > 0 && h <= 15 && min >= 10 && max <= 250;
    },
  });

  // ================================================================ medidas de localização
  const NUMERICOS = [
    // atipico: valores possíveis para um valor atípico (as classificações não passam de 20, por isso não há atípicos acima).
    { id: 'notas', intro: (n) => 'As classificações, em valores, de um aluno em ' + fmt(n) + ' testes foram', lim: [6, 20], unidade: 'valores', atipico: [0, 20] },
    { id: 'pontos', intro: (n) => 'Os pontos marcados por um jogador de basquetebol em ' + fmt(n) + ' jogos foram', lim: [4, 30], unidade: 'pontos', atipico: [0, 60] },
    { id: 'visitantes', intro: (n) => 'O número de visitantes de uma exposição em ' + fmt(n) + ' dias foi', lim: [40, 190], unidade: 'visitantes', atipico: [0, 400] },
    { id: 'tempos', intro: (n) => 'Os tempos, em minutos, que um aluno demorou a chegar à escola em ' + fmt(n) + ' dias foram', lim: [8, 30], unidade: 'minutos', atipico: [2, 90] },
  ];
  const numerico = (id) => NUMERICOS.find((t) => t.id === id);
  const sortearDados = (rng, t, n) => Array.from({ length: n }, () => inteiro(rng, t.lim[0], t.lim[1]));
  const dentro = (t, xs) => !!t && xs.every((x) => x >= t.lim[0] && x <= t.lim[1]);

  registar({
    subtema: 'localizacao', tipo: 'media', nome: 'Média',
    formatos: ['numerica', 'escolha'], contextos: ['lista', 'tabela'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        let xs, enunciado, resolucao, erros, tema;
        if (contexto === 'lista') {
          const t = escolher(rng, NUMERICOS);
          tema = t.id;
          const n = inteiro(rng, 5, 9);
          xs = sortearDados(rng, t, n);
          if ((soma(xs) * 10) % n !== 0) return null;
          const m = limpo(C.media(xs));
          enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Qual é a média destes valores?';
          resolucao = [{
            passo: 'Somar os valores e dividir pelo número de valores',
            porque: 'A média é a soma de todos os valores a dividir pelo número de valores.',
            calculo: '\\bar{x} = \\dfrac{' + xs.map((x) => tex(x)).join(' + ') + '}{' + tex(n) + '} = \\dfrac{' + tex(soma(xs)) + '}{' + tex(n) + '} = ' + tex(m),
            bloco: true,
          }];
          const o = ordenar(xs);
          erros = [
            { codigo: 'dividiu_n_menos_1', valor: r2(soma(xs) / (n - 1)), explicacao: 'Dividiste por ' + fmt(n - 1) + '; a média divide a soma pelo número de valores, ' + fmt(n) + '.' },
            { codigo: 'mediana_em_vez_de_media', valor: C.mediana(xs), explicacao: fmt(C.mediana(xs)) + ' é a mediana (o valor do meio dos dados ordenados); a média usa a soma de todos os valores.' },
            { codigo: 'media_dos_extremos', valor: (o[0] + o[n - 1]) / 2, explicacao: 'Fizeste a média só do mínimo e do máximo (' + fmt(o[0]) + ' e ' + fmt(o[n - 1]) + '); a média usa todos os valores.' },
          ];
        } else {
          const t = escolher(rng, DISCRETOS);
          tema = t.id;
          const n = escolher(rng, [10, 20]);
          const d = dadosDiscretos(rng, t, n);
          xs = d.xs;
          const m = limpo(C.media(xs));
          const k = d.vals.length;
          enunciado = t.intro(n) + ' Os resultados foram: ' + linhasTabela(t, d.vals, d.cont) + '. Qual é a média?';
          resolucao = [{
            passo: 'Multiplicar cada valor pela sua frequência, somar e dividir pelo total',
            porque: 'Cada valor conta tantas vezes quantas foi observado: $\\bar{x} = \\frac{\\sum x_i n_i}{n}$.',
            calculo: '\\bar{x} = \\dfrac{' + d.vals.map((v, i) => tex(v) + ' \\times ' + tex(d.cont[i])).join(' + ') + '}{' + tex(n) + '} = \\dfrac{' + tex(soma(xs)) + '}{' + tex(n) + '} = ' + tex(m),
            bloco: true,
          }];
          erros = [
            { codigo: 'media_dos_valores', valor: r2(soma(d.vals) / k), explicacao: 'Fizeste a média dos valores diferentes (' + listaTxt(d.vals) + ') sem ter em conta quantas vezes cada um aparece.' },
            { codigo: 'dividiu_pelo_numero_de_valores', valor: r2(soma(xs) / k), explicacao: 'A soma ' + fmt(soma(xs)) + ' está certa, mas divide-se pelo número de observações (' + fmt(n) + '), não pelo número de valores diferentes (' + fmt(k) + ').' },
            { codigo: 'media_das_frequencias', valor: r2(n / k), explicacao: 'Calculaste a média das frequências (' + fmt(n) + '/' + fmt(k) + '); pedia-se a média dos valores observados.' },
            { codigo: 'somou_sem_multiplicar', valor: r2(soma(d.vals) / n), explicacao: 'Somaste só os valores diferentes, sem os multiplicar pelas frequências, e dividiste por ' + fmt(n) + '.' },
          ];
        }
        const n = xs.length;
        const m = limpo(C.media(xs));
        const mInd = mediaReferencia(xs);
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema, xs }, esquema: ESQUEMA_MEDIDAS(xs) }, {
          resposta: m, tolerancia: 0.005, texto: (v) => texNum(v), erros,
          verificacao: { passo: 'Confirmar que o número de valores vezes a média dá a soma', calculo: tex(n) + ' \\times ' + tex(m) + ' = ' + tex(limpo(n * m)) + ' = \\sum x_i', valor: limpo(mInd) },
        });
      });
    },
    verificarIndependente(p) {
      return confere(p, limpo(mediaReferencia(p.dados.xs)), (v) => texNum(v));
    },
    limites(p) {
      const xs = p.dados.xs;
      if (p.contexto === 'lista') return xs.length >= 5 && xs.length <= 9 && dentro(numerico(p.dados.tema), xs);
      const t = discreto(p.dados.tema);
      return !!t && (xs.length === 10 || xs.length === 20) && xs.every((x) => x >= t.valores[0] && x <= t.valores[1]);
    },
  });

  registar({
    subtema: 'localizacao', tipo: 'mediana', nome: 'Mediana',
    formatos: ['numerica', 'escolha'], contextos: ['impar', 'par'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, NUMERICOS);
        const n = contexto === 'impar' ? escolher(rng, [7, 9, 11]) : escolher(rng, [6, 8, 10]);
        const xs = sortearDados(rng, t, n);
        const o = ordenar(xs);
        const me = C.mediana(xs);
        const par = n % 2 === 0;
        const pos = (n + 1) / 2;
        const meio = par ? (xs[n / 2 - 1] + xs[n / 2]) / 2 : xs[(n - 1) / 2];
        const enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Qual é a mediana destes valores?';
        const resolucao = [
          { passo: 'Ordenar os dados', porque: 'A mediana é o valor do meio dos dados ordenados.', calculo: texLista(o), bloco: n > 8 },
          par
            ? { passo: 'Localizar as posições do meio', porque: 'Com ' + fmt(n) + ' valores (número par) há dois valores ao meio.', calculo: '\\dfrac{n}{2} = ' + tex(n / 2) + ' \\text{ e } \\dfrac{n}{2} + 1 = ' + tex(n / 2 + 1) }
            : { passo: 'Localizar a posição do meio', porque: 'Com ' + fmt(n) + ' valores (número ímpar) há um só valor ao meio.', calculo: '\\dfrac{n + 1}{2} = \\dfrac{' + tex(n) + ' + 1}{2} = ' + tex(pos) },
          par
            ? { passo: 'Fazer a média dos dois valores do meio', porque: 'A mediana fica a meio dos dois valores centrais.', calculo: '\\mathrm{Me} = \\dfrac{' + tex(o[n / 2 - 1]) + ' + ' + tex(o[n / 2]) + '}{2} = ' + tex(me) }
            : { passo: 'Ler o valor nessa posição', porque: 'É o ' + fmt(pos) + '.º valor dos dados ordenados.', calculo: '\\mathrm{Me} = x_{(' + tex(pos) + ')} = ' + tex(me) },
        ];
        const erros = [
          { codigo: 'nao_ordenou', valor: meio, explicacao: 'Usaste o meio da lista tal como foi dada; é preciso ordenar os dados primeiro.' },
          { codigo: 'posicao_como_valor', valor: pos, explicacao: fmt(pos) + ' é a posição do meio, não a mediana: a mediana é o valor que está nessa posição nos dados ordenados.' },
        ];
        if (par) erros.push({ codigo: 'par_so_um_valor', valor: o[n / 2 - 1], explicacao: 'Com ' + fmt(n) + ' valores há dois ao meio (' + fmt(o[n / 2 - 1]) + ' e ' + fmt(o[n / 2]) + '); a mediana é a média dos dois.' });
        const media = C.media(xs);
        erros.push({ codigo: 'media_em_vez_de_mediana', valor: r2(media), explicacao: 'Calculaste a média (' + (exato(media, 2) ? '' : '≈ ') + fmt(media, 2) + '); a mediana é o valor do meio dos dados ordenados.' });
        const abaixo = xs.filter((x) => x < me).length;
        const acima = xs.filter((x) => x > me).length;
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs }, esquema: ESQUEMA_MEDIDAS(xs) }, {
          resposta: me, tolerancia: 0, texto: (v) => texNum(v), erros,
          verificacao: {
            passo: 'Confirmar que não há mais de metade dos valores de cada lado',
            calculo: '\\text{abaixo: } ' + tex(abaixo) + ',\\ \\text{acima: } ' + tex(acima) + ',\\ \\text{ambos} \\leq \\dfrac{' + tex(n) + '}{2}',
            valor: medianaContagem(xs),
          },
        });
      });
    },
    verificarIndependente(p) {
      return confere(p, medianaContagem(p.dados.xs), (v) => texNum(v));
    },
    limites(p) {
      const xs = p.dados.xs;
      return xs.length >= 6 && xs.length <= 11 && dentro(numerico(p.dados.tema), xs);
    },
  });

  // Quartil pelo método das metades (outro método, que não é o do programa).
  function quartilMetades(xs, k) {
    const o = ordenar(xs);
    const h = Math.floor(o.length / 2);
    return calc().mediana(k === 25 ? o.slice(0, h) : o.slice(o.length - h));
  }

  // Passos do cálculo de um quartil pelo método do programa (p = nk/100).
  function passosQuartil(o, k, nome) {
    const n = o.length;
    const p = (n * k) / 100;
    const inteiroP = Number.isInteger(limpo(p));
    const Q = calc().percentil(o, k);
    const passos = [{ passo: 'Calcular ' + (k === 25 ? 'p para o 1.º quartil' : 'p para o 3.º quartil'), porque: 'Pelo método do programa, $p = \\frac{n \\times k}{100}$ com $k = ' + k + '$.', calculo: 'p = \\dfrac{' + tex(n) + ' \\times ' + k + '}{100} = ' + tex(p, 2) }];
    if (inteiroP) {
      passos.push({ passo: 'p é inteiro: média de dois valores', porque: 'Quando p é inteiro, o quartil é a média dos valores nas posições p e p + 1.', calculo: nome + ' = \\dfrac{x_{(' + tex(p) + ')} + x_{(' + tex(p + 1) + ')}}{2} = \\dfrac{' + tex(o[p - 1]) + ' + ' + tex(o[p]) + '}{2} = ' + tex(Q) });
    } else {
      const c = Math.ceil(p);
      passos.push({ passo: 'p não é inteiro: arredondar para cima', porque: 'Quando p não é inteiro, o quartil é o valor na posição ⌈p⌉ (o inteiro imediatamente acima).', calculo: nome + ' = x_{(' + tex(c) + ')} = ' + tex(Q) });
    }
    return { passos, Q, p, inteiroP };
  }

  registar({
    subtema: 'localizacao', tipo: 'quartil', nome: 'Quartis',
    formatos: ['numerica', 'escolha'], contextos: ['q1', 'q3'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, NUMERICOS);
        const n = inteiro(rng, 8, 15);
        const xs = sortearDados(rng, t, n);
        const o = ordenar(xs);
        const k = contexto === 'q1' ? 25 : 75;
        const nome = contexto === 'q1' ? 'Q_1' : 'Q_3';
        const q = passosQuartil(o, k, nome);
        const enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Qual é o ' + (k === 25 ? '1.º' : '3.º') + ' quartil, pelo método estudado ($p = \\frac{nk}{100}$)?';
        const resolucao = [{ passo: 'Ordenar os dados', porque: 'Os quartis calculam-se sobre os dados ordenados.', calculo: texLista(o), bloco: true }].concat(q.passos);
        const outro = C.percentil(xs, 100 - k);
        const erros = [];
        if (q.inteiroP) erros.push({ codigo: 'p_inteiro_sem_media', valor: o[q.p - 1], explicacao: 'Como p = ' + fmt(q.p) + ' é inteiro, o quartil é a média dos valores nas posições ' + fmt(q.p) + ' e ' + fmt(q.p + 1) + ', não só o da posição ' + fmt(q.p) + '.' });
        else erros.push({ codigo: 'arredondou_p_para_baixo', valor: o[Math.floor(q.p) - 1], explicacao: 'Quando p = ' + fmt(q.p, 2) + ' não é inteiro, usa-se a posição seguinte, ' + fmt(Math.ceil(q.p)) + ', e não ' + fmt(Math.floor(q.p)) + '.' });
        erros.push({ codigo: 'metodo_das_metades', valor: quartilMetades(xs, k), explicacao: 'Calculaste a mediana da metade ' + (k === 25 ? 'inferior' : 'superior') + ' dos dados; o método do programa usa p = nk/100.' });
        // Erro: método aplicado à lista por ordenar.
        const pr = q.p;
        const naoOrd = Number.isInteger(limpo(pr)) ? (xs[pr - 1] + xs[pr]) / 2 : xs[Math.ceil(pr) - 1];
        erros.push({ codigo: 'nao_ordenou', valor: naoOrd, explicacao: 'Aplicaste o método à lista tal como foi dada; é preciso ordenar os dados primeiro.' });
        erros.push({ codigo: 'trocou_q1_q3', valor: outro, explicacao: fmt(outro) + ' é o ' + (k === 25 ? '3.º' : '1.º') + ' quartil; o ' + (k === 25 ? '1.º usa k = 25' : '3.º usa k = 75') + '.' });
        erros.push({ codigo: 'mediana_em_vez_de_quartil', valor: C.mediana(xs), explicacao: fmt(C.mediana(xs)) + ' é a mediana (k = 50); o ' + (k === 25 ? '1.º' : '3.º') + ' quartil usa k = ' + k + '.' });
        const Qi = percentilContagem(xs, k);
        const cLE = xs.filter((x) => x <= Qi).length;
        const cGE = xs.filter((x) => x >= Qi).length;
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs, k }, esquema: ESQUEMA_MEDIDAS(xs) }, {
          resposta: q.Q, tolerancia: 0, texto: (v) => texNum(v), erros,
          verificacao: {
            passo: 'Confirmar contando: pelo menos ' + k + ' % dos dados são menores ou iguais e pelo menos ' + (100 - k) + ' % são maiores ou iguais',
            calculo: tex(cLE) + ' \\geq ' + tex(q.p, 2) + ' \\quad \\text{e} \\quad ' + tex(cGE) + ' \\geq ' + tex(limpo(n - q.p), 2),
            valor: Qi,
          },
        });
      });
    },
    verificarIndependente(p) {
      return confere(p, percentilContagem(p.dados.xs, p.dados.k), (v) => texNum(v));
    },
    limites(p) {
      const xs = p.dados.xs;
      return xs.length >= 8 && xs.length <= 15 && dentro(numerico(p.dados.tema), xs);
    },
  });

  // ================================================================ medidas de dispersão
  registar({
    subtema: 'dispersao', tipo: 'amplitude-aiq', nome: 'Amplitude e amplitude interquartil',
    formatos: ['numerica', 'escolha'], contextos: ['amplitude', 'aiq'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, NUMERICOS);
        const n = inteiro(rng, 8, 14);
        const xs = sortearDados(rng, t, n);
        const o = ordenar(xs);
        const min = o[0];
        const max = o[n - 1];
        let enunciado, resolucao, erros, resposta, verificacao;
        if (contexto === 'amplitude') {
          resposta = C.amplitude(xs);
          enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Qual é a amplitude destes dados?';
          resolucao = [
            { passo: 'Encontrar o mínimo e o máximo', porque: 'A amplitude só depende dos valores extremos.', calculo: '\\min = ' + tex(min) + ',\\ \\max = ' + tex(max) },
            { passo: 'Subtrair', porque: 'A amplitude é a diferença entre o máximo e o mínimo.', calculo: 'A = ' + tex(max) + ' - ' + tex(min) + ' = ' + tex(resposta) },
          ];
          erros = [
            { codigo: 'ultimo_menos_primeiro', valor: xs[n - 1] - xs[0], explicacao: 'Subtraíste o primeiro valor da lista ao último, mas a lista não está ordenada: usa-se o máximo (' + fmt(max) + ') e o mínimo (' + fmt(min) + ').' },
            { codigo: 'contou_valores', valor: resposta + 1, explicacao: 'Contaste os inteiros de ' + fmt(min) + ' a ' + fmt(max) + '; a amplitude é a distância entre eles: ' + fmt(max) + ' − ' + fmt(min) + '.' },
            { codigo: 'so_o_maximo', valor: max, explicacao: fmt(max) + ' é o máximo; a amplitude é a diferença entre o máximo e o mínimo.' },
          ];
          const ind = xs.reduce((m, x) => Math.max(m, x), -Infinity) - xs.reduce((m, x) => Math.min(m, x), Infinity);
          verificacao = { passo: 'Confirmar que o mínimo mais a amplitude dá o máximo', calculo: tex(min) + ' + ' + tex(resposta) + ' = ' + tex(min + resposta), valor: ind };
        } else {
          resposta = C.amplitudeInterquartil(xs);
          const q1 = passosQuartil(o, 25, 'Q_1');
          const q3 = passosQuartil(o, 75, 'Q_3');
          enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Qual é a amplitude interquartil destes dados (quartis pelo método $p = \\frac{nk}{100}$)?';
          resolucao = [{ passo: 'Ordenar os dados', porque: 'Os quartis calculam-se sobre os dados ordenados.', calculo: texLista(o), bloco: true }]
            .concat(q1.passos, q3.passos, [{ passo: 'Subtrair os quartis', porque: 'A amplitude interquartil é a diferença entre o 3.º e o 1.º quartis.', calculo: 'AIQ = ' + tex(q3.Q) + ' - ' + tex(q1.Q) + ' = ' + tex(resposta) }]);
          const naoOrd = (k) => {
            const p = (n * k) / 100;
            return Number.isInteger(limpo(p)) ? (xs[p - 1] + xs[p]) / 2 : xs[Math.ceil(p) - 1];
          };
          erros = [
            { codigo: 'amplitude_total', valor: max - min, explicacao: fmt(max - min) + ' é a amplitude (máximo − mínimo); a amplitude interquartil é Q₃ − Q₁.' },
            { codigo: 'metodo_das_metades', valor: limpo(quartilMetades(xs, 75) - quartilMetades(xs, 25)), explicacao: 'Calculaste os quartis como medianas das metades dos dados; o método do programa usa p = nk/100.' },
            { codigo: 'nao_ordenou', valor: limpo(naoOrd(75) - naoOrd(25)), explicacao: 'Calculaste os quartis na lista tal como foi dada; é preciso ordenar os dados primeiro.' },
            { codigo: 'subtraiu_ao_contrario', valor: -resposta, explicacao: 'Fizeste Q₁ − Q₃; a amplitude interquartil é Q₃ − Q₁ (nunca é negativa).' },
          ];
          const a1 = percentilContagem(xs, 25);
          const a3 = percentilContagem(xs, 75);
          verificacao = {
            passo: 'Confirmar os quartis por contagem dos dados',
            calculo: 'Q_1 = ' + tex(a1) + ',\\ Q_3 = ' + tex(a3) + ' \\Rightarrow AIQ = ' + tex(limpo(a3 - a1)),
            valor: limpo(a3 - a1),
          };
        }
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs }, esquema: ESQUEMA_MEDIDAS(xs) }, {
          resposta, tolerancia: 0, texto: (v) => texNum(v), erros, verificacao,
        });
      });
    },
    verificarIndependente(p) {
      const xs = p.dados.xs;
      const v = p.contexto === 'amplitude'
        ? kesimo(xs, xs.length) - kesimo(xs, 1)
        : limpo(percentilContagem(xs, 75) - percentilContagem(xs, 25));
      return confere(p, v, (x) => texNum(x));
    },
    limites(p) {
      const xs = p.dados.xs;
      return xs.length >= 8 && xs.length <= 14 && dentro(numerico(p.dados.tema), xs);
    },
  });

  // Tabela de desvios em array (para passo em bloco).
  function tabelaDesvios(xs, m) {
    const linhas = xs.map((x) => tex(x) + ' & ' + tex(x - m) + ' & ' + tex((x - m) * (x - m)));
    const ss = soma(xs.map((x) => (x - m) * (x - m)));
    return '\\begin{array}{c|c|c} x_i & x_i - \\bar{x} & (x_i - \\bar{x})^2 \\\\ \\hline ' + linhas.join(' \\\\ ') + ' \\\\ \\hline \\text{soma} & 0 & ' + tex(ss) + ' \\end{array}';
  }

  registar({
    subtema: 'dispersao', tipo: 'desvio-padrao', nome: 'Desvio padrão',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const t = escolher(rng, NUMERICOS.filter((x) => x.id !== 'visitantes'));
        const n = inteiro(rng, 4, 6);
        const xs = sortearDados(rng, t, n);
        const S = soma(xs);
        if (S % n !== 0) return null;
        const m = S / n;
        const ss = soma(xs.map((x) => (x - m) * (x - m)));
        if (ss === 0) return null;
        const s = C.desvioPadrao(xs);
        if (meioCentesimo(s)) return null;
        const resp = r2(s);
        const enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Calcula o desvio padrão (amostral) destes dados, arredondado às centésimas.';
        const resolucao = [
          { passo: 'Calcular a média', porque: 'Os desvios medem-se em relação à média.', calculo: '\\bar{x} = \\dfrac{' + tex(S) + '}{' + tex(n) + '} = ' + tex(m) },
          { passo: 'Calcular os desvios e os seus quadrados', porque: 'Elevar ao quadrado evita que os desvios positivos e negativos se anulem.', calculo: tabelaDesvios(xs, m), bloco: true },
          { passo: 'Dividir por n − 1 e tirar a raiz quadrada', porque: 'No desvio padrão amostral divide-se a soma dos quadrados por $n - 1$; a raiz volta às unidades dos dados.', calculo: 's = \\sqrt{\\dfrac{' + tex(ss) + '}{' + tex(n - 1) + '}}' + igualOuAprox(s, 2) },
        ];
        const absDesv = soma(xs.map((x) => Math.abs(x - m))) / n;
        const erros = [
          { codigo: 'dividiu_por_n', valor: r2(Math.sqrt(ss / n)), explicacao: 'Dividiste a soma dos quadrados por n = ' + fmt(n) + '; no desvio padrão amostral divide-se por n − 1 = ' + fmt(n - 1) + '.' },
          { codigo: 'esqueceu_raiz', valor: r2(ss / (n - 1)), explicacao: fmt(r2(ss / (n - 1)), 2) + ' é a variância; o desvio padrão é a raiz quadrada da variância.' },
          { codigo: 'desvio_medio', valor: r2(absDesv), explicacao: 'Fizeste a média dos desvios em valor absoluto; o desvio padrão usa os quadrados dos desvios, divide por n − 1 e tira a raiz.' },
          { codigo: 'nao_dividiu', valor: r2(Math.sqrt(ss)), explicacao: 'Tiraste a raiz da soma dos quadrados sem dividir por n − 1 = ' + fmt(n - 1) + '.' },
        ];
        const sAlt = desvioAlternativo(xs);
        const sx2 = soma(xs.map((x) => x * x));
        return fechar(rng, formato, { enunciado, resolucao, dados: { tema: t.id, xs }, esquema: ESQUEMA_MEDIDAS(xs) }, {
          resposta: resp, tolerancia: 0.005, texto: (v) => texNum(v), erros, arredondamento: ARRED_2,
          verificacao: {
            passo: 'Confirmar com a fórmula alternativa $s^2 = \\frac{\\sum x_i^2 - n\\bar{x}^2}{n - 1}$',
            calculo: 's = \\sqrt{\\dfrac{' + tex(sx2) + ' - ' + tex(n) + ' \\times ' + tex(m) + '^2}{' + tex(n - 1) + '}}' + igualOuAprox(sAlt, 2),
            valor: r2(sAlt),
          },
        });
      });
    },
    verificarIndependente(p) {
      return confere(p, r2(desvioAlternativo(p.dados.xs)), (v) => texNum(v));
    },
    limites(p) {
      const xs = p.dados.xs;
      return xs.length >= 4 && xs.length <= 6 && dentro(numerico(p.dados.tema), xs);
    },
  });

  // Dispersão de um conjunto (medida 's' ou 'aiq') — método independente.
  const dispersaoInd = (xs, medida) => (medida === 'desvio-padrao' ? desvioAlternativo(xs) : percentilContagem(xs, 75) - percentilContagem(xs, 25));

  registar({
    subtema: 'dispersao', tipo: 'comparar', nome: 'Comparar dispersões',
    formatos: ['escolha'], contextos: ['desvio-padrao', 'aiq'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const n = inteiro(rng, 6, 8);
        const lo = inteiro(rng, 2, 10);
        const hi = lo + inteiro(rng, 12, 20);
        const L = hi - lo;
        // Conjunto disperso: valores perto dos extremos (mais perto do mínimo); concentrado: valores ao centro.
        const disperso = [lo, hi];
        const concentrado = [lo, hi];
        for (let i = 0; i < n - 2; i++) {
          disperso.push(rng() < 0.6 ? inteiro(rng, lo, lo + Math.floor(L / 4)) : inteiro(rng, hi - Math.floor(L / 4), hi));
          concentrado.push(inteiro(rng, lo + Math.floor(L / 3), hi - Math.floor(L / 4)));
        }
        const medida = contexto;
        const md = medida === 'desvio-padrao' ? C.desvioPadrao(disperso) : C.amplitudeInterquartil(disperso);
        const mc = medida === 'desvio-padrao' ? C.desvioPadrao(concentrado) : C.amplitudeInterquartil(concentrado);
        if (medida === 'desvio-padrao' ? md < 1.25 * mc : md - mc < 2) return null;
        const xd = C.media(disperso);
        const xc = C.media(concentrado);
        if (!(xd < xc - 0.5)) return null;
        const dispersoA = rng() < 0.5;
        const cA = ordenar(dispersoA ? disperso : concentrado);
        const cB = ordenar(dispersoA ? concentrado : disperso);
        const X = dispersoA ? 'A' : 'B';
        const Y = dispersoA ? 'B' : 'A';
        const nomeMedida = medida === 'desvio-padrao' ? 'pelo desvio padrão' : 'pela amplitude interquartil';
        const oMedida = medida === 'desvio-padrao' ? 'o desvio padrão' : 'a amplitude interquartil';
        const simb = medida === 'desvio-padrao' ? 's' : 'AIQ';
        const enunciado = 'Considera o conjunto de dados A, com os valores ' + listaTxt(cA) + ', e o conjunto B, com os valores ' + listaTxt(cB) + '. Qual dos conjuntos tem maior dispersão, medida ' + nomeMedida + '?';
        const certa = 'O conjunto ' + X + '.';
        const erros = [
          { codigo: 'maior_media_maior_dispersao', texto: 'O conjunto ' + Y + '.', explicacao: 'O conjunto ' + Y + ' tem valores maiores (média ' + (exato(xc, 2) ? '' : '≈ ') + fmt(xc, 2) + '), mas a dispersão mede quão afastados estão os valores entre si, não o seu tamanho.' },
          { codigo: 'mesma_amplitude_mesma_dispersao', texto: 'Os dois conjuntos têm a mesma dispersão.', explicacao: 'Os dois conjuntos têm a mesma amplitude (' + fmt(L) + '), mas a amplitude só olha para os extremos; ' + oMedida + ' mostra que ' + X + ' está mais espalhado.' },
          { codigo: 'medias_diferentes_nao_comparam', texto: 'Não se pode comparar, porque as médias são diferentes.', explicacao: oMedida.charAt(0).toUpperCase() + oMedida.slice(1) + ' mede a dispersão de cada conjunto em torno do seu centro: pode comparar-se mesmo com médias diferentes.' },
        ];
        const dA = medida === 'desvio-padrao' ? C.desvioPadrao(cA) : C.amplitudeInterquartil(cA);
        const dB = medida === 'desvio-padrao' ? C.desvioPadrao(cB) : C.amplitudeInterquartil(cB);
        const mA = C.media(cA);
        const mB = C.media(cB);
        const resolucao = [
          { passo: 'Calcular as médias', porque: 'Servem para ver qual conjunto tem valores maiores — o que não é o mesmo que ter mais dispersão.', calculo: '\\bar{x}_A' + igualOuAprox(mA) + ',\\ \\bar{x}_B' + igualOuAprox(mB) },
          medida === 'desvio-padrao'
            ? { passo: 'Calcular os desvios padrão', porque: 'O desvio padrão mede o afastamento dos valores em relação à média de cada conjunto.', calculo: 's_A' + igualOuAprox(dA) + ',\\ s_B' + igualOuAprox(dB) }
            : { passo: 'Calcular as amplitudes interquartis', porque: 'A amplitude interquartil é a amplitude dos 50 % centrais dos dados: Q₃ − Q₁.', calculo: 'AIQ_A = ' + tex(C.percentil(cA, 75)) + ' - ' + tex(C.percentil(cA, 25)) + ' = ' + tex(dA) + ',\\ AIQ_B = ' + tex(C.percentil(cB, 75)) + ' - ' + tex(C.percentil(cB, 25)) + ' = ' + tex(dB) },
          { passo: 'Comparar', porque: 'Tem maior dispersão o conjunto com ' + oMedida + ' maior, independentemente da média.', calculo: simb + '_' + X + ' > ' + simb + '_' + Y },
        ];
        const iA = dispersaoInd(cA, medida);
        const iB = dispersaoInd(cB, medida);
        const verificacao = {
          passo: medida === 'desvio-padrao' ? 'Confirmar com a fórmula alternativa da variância' : 'Confirmar os quartis por contagem',
          calculo: simb + '_A' + igualOuAprox(iA) + ',\\ ' + simb + '_B' + igualOuAprox(iB),
        };
        return fecharTexto(rng, { enunciado, resolucao, verificacao, dados: { A: cA, B: cB, medida } }, certa, erros, 'O conjunto ' + (iA > iB ? 'A' : 'B') + '.');
      });
    },
    verificarIndependente(p) {
      const { A: a, B: b, medida } = p.dados;
      const iA = dispersaoInd(a, medida);
      const iB = dispersaoInd(b, medida);
      if (Math.abs(iA - iB) < 1e-9) return false;
      return A.chave(p.opcoes[p.correta]) === A.chave('O conjunto ' + (iA > iB ? 'A' : 'B') + '.');
    },
    limites(p) {
      const { A: a, B: b } = p.dados;
      return a.length === b.length && a.length >= 6 && a.length <= 8 && a.concat(b).every((x) => x >= 2 && x <= 30);
    },
  });

  // ================================================================ propriedades (transformações a·x + b)
  // Cada contexto sorteia a, b, a média e o desvio padrão iniciais.
  const TRANSFORMACOES = {
    temperatura: (rng) => {
      const xm = A.entre(rng, 12, 30, 0.1);
      const s = A.entre(rng, 1.5, 6, 0.1);
      return {
        a: 1.8, b: 32, xm, s, unidade: '°F',
        intro: 'As temperaturas máximas diárias numa cidade, durante um mês, tiveram média de ' + fmt(xm) + ' °C e desvio padrão de ' + fmt(s) + ' °C. Para um site americano, cada temperatura é convertida para graus Fahrenheit com a fórmula $F = 1{,}8C + 32$.',
        perguntaMedia: 'Qual é a média das temperaturas em °F?',
        perguntaDesvio: 'Qual é o desvio padrão das temperaturas em °F?',
        formula: 'y = 1{,}8x + 32',
        errosMedia: [
          { codigo: 'esqueceu_b', valor: r2(1.8 * xm), explicacao: 'Multiplicaste por 1,8, mas esqueceste de somar 32: a média sofre a mesma transformação que cada valor.' },
          { codigo: 'esqueceu_a', valor: r2(xm + 32), explicacao: 'Somaste 32, mas esqueceste de multiplicar por 1,8: a média sofre a mesma transformação que cada valor.' },
          { codigo: 'aplicou_b_antes', valor: r2(1.8 * (xm + 32)), explicacao: 'Somaste 32 antes de multiplicar; a fórmula manda multiplicar por 1,8 e só depois somar 32.' },
        ],
        errosDesvio: [
          { codigo: 'somou_b', valor: r2(1.8 * s + 32), explicacao: 'Somar 32 a todos os valores desloca-os, mas não os afasta entre si: o desvio padrão não muda com a soma; só é multiplicado por 1,8.' },
          { codigo: 'nao_alterou', valor: s, explicacao: 'Multiplicar todos os valores por 1,8 multiplica as distâncias entre eles por 1,8: o desvio padrão também é multiplicado.' },
          { codigo: 'a_ao_quadrado', valor: r2(3.24 * s), explicacao: 'É a variância que fica multiplicada por 1,8² = 3,24; o desvio padrão é multiplicado por 1,8.' },
          { codigo: 'somou_b_sem_a', valor: r2(s + 32), explicacao: 'Somaste 32 ao desvio padrão; a soma não altera a dispersão, e a multiplicação por 1,8 sim.' },
        ],
      };
    },
    salarios: (rng) => {
      const xm = 10 * inteiro(rng, 80, 150);
      const s = 5 * inteiro(rng, 10, 60);
      const p = escolher(rng, [2, 3, 4, 5]);
      const b = escolher(rng, [10, 20, 25, 30, 40, 50]);
      const a = limpo(1 + p / 100);
      return {
        a, b, xm, s, unidade: '€',
        intro: 'Numa empresa, os salários têm média de ' + fmt(xm) + ' € e desvio padrão de ' + fmt(s) + ' €. A empresa aumenta todos os salários em ' + fmt(p) + ' % e, depois, dá a cada trabalhador um prémio fixo de ' + fmt(b) + ' €.',
        perguntaMedia: 'Qual é a nova média dos salários (em euros)?',
        perguntaDesvio: 'Qual é o novo desvio padrão dos salários (em euros)?',
        formula: 'y = ' + tex(a, 2) + 'x + ' + tex(b),
        errosMedia: [
          { codigo: 'esqueceu_b', valor: r2(a * xm), explicacao: 'Aplicaste o aumento, mas esqueceste o prémio de ' + fmt(b) + ' €, que também entra na média.' },
          { codigo: 'esqueceu_a', valor: r2(xm + b), explicacao: 'Esqueceste o aumento de ' + fmt(p) + ' %: cada salário é multiplicado por ' + fmt(a) + ' antes de somar o prémio.' },
          { codigo: 'percentagem_como_euros', valor: r2(xm + p + b), explicacao: 'Somaste ' + fmt(p) + ' € em vez de aumentar ' + fmt(p) + ' %: um aumento de ' + fmt(p) + ' % multiplica o salário por ' + fmt(a) + '.' },
          { codigo: 'aplicou_b_antes', valor: r2(a * (xm + b)), explicacao: 'Aplicaste o aumento depois de somar o prémio; o prémio é dado depois do aumento, por isso não é aumentado.' },
        ],
        errosDesvio: [
          { codigo: 'somou_b', valor: r2(a * s + b), explicacao: 'O prémio igual para todos desloca os salários, mas não os afasta entre si: o desvio padrão não muda com a soma; só é multiplicado por ' + fmt(a) + '.' },
          { codigo: 'nao_alterou', valor: s, explicacao: 'O aumento de ' + fmt(p) + ' % multiplica todos os salários por ' + fmt(a) + ', e com eles as distâncias entre os salários: o desvio padrão também é multiplicado.' },
          { codigo: 'percentagem_como_euros', valor: r2(s + p), explicacao: 'Somaste ' + fmt(p) + ' ao desvio padrão; um aumento de ' + fmt(p) + ' % multiplica os salários, e o desvio padrão, por ' + fmt(a) + '.' },
          { codigo: 'a_ao_quadrado', valor: r2(a * a * s), explicacao: 'É a variância que fica multiplicada por ' + fmt(a) + '²; o desvio padrão é multiplicado por ' + fmt(a) + '.' },
        ],
      };
    },
    pontuacao: (rng) => {
      const xm = A.entre(rng, 40, 85, 0.5);
      const s = A.entre(rng, 5, 20, 0.5);
      const b = escolher(rng, [0.5, 1, 1.5, 2]);
      return {
        a: 0.2, b, xm, s, unidade: 'valores',
        intro: 'As classificações de um teste, numa escala de 0 a 100, tiveram média ' + fmt(xm) + ' e desvio padrão ' + fmt(s) + '. O professor converteu-as para a escala de 0 a 20 (dividindo por 5) e, depois, deu a todos uma bonificação de ' + fmt(b) + (b === 1 ? ' valor.' : ' valores.'),
        perguntaMedia: 'Qual é a nova média?',
        perguntaDesvio: 'Qual é o novo desvio padrão?',
        formula: 'y = 0{,}2x + ' + tex(b),
        errosMedia: [
          { codigo: 'esqueceu_b', valor: r2(xm / 5), explicacao: 'Converteste para a escala de 0 a 20, mas esqueceste a bonificação de ' + fmt(b) + ', que também entra na média.' },
          { codigo: 'esqueceu_a', valor: r2(xm + b), explicacao: 'Somaste a bonificação, mas não converteste para a escala de 0 a 20 (dividir por 5).' },
          { codigo: 'aplicou_b_antes', valor: r2((xm + b) / 5), explicacao: 'Somaste a bonificação antes de dividir por 5; a bonificação é dada depois da conversão.' },
          { codigo: 'multiplicou_por_5', valor: r2(5 * xm + b), explicacao: 'Para passar da escala 0–100 para 0–20 divide-se por 5 (multiplica-se por 0,2), não se multiplica por 5.' },
        ],
        errosDesvio: [
          { codigo: 'somou_b', valor: r2(s / 5 + b), explicacao: 'A bonificação igual para todos desloca as notas, mas não as afasta entre si: o desvio padrão não muda com a soma; só é dividido por 5.' },
          { codigo: 'nao_alterou', valor: s, explicacao: 'Dividir todas as notas por 5 divide também as distâncias entre elas: o desvio padrão também é dividido por 5.' },
          { codigo: 'a_ao_quadrado', valor: r2(0.04 * s), explicacao: 'É a variância que fica multiplicada por 0,2² = 0,04; o desvio padrão é multiplicado por 0,2.' },
          { codigo: 'multiplicou_por_5', valor: r2(5 * s), explicacao: 'A conversão divide por 5 (multiplica por 0,2), não multiplica por 5.' },
        ],
      };
    },
  };

  // Simulação com dois valores simétricos em torno da média (com o desvio padrão pedido).
  function doisValores(xm, s) {
    const d = s / Math.SQRT2;
    return [xm - d, xm + d];
  }

  function limitesTransformacao(p) {
    const { contexto } = p;
    const { xm, s } = p.dados;
    if (contexto === 'temperatura') return xm >= 12 && xm <= 30 && s >= 1.5 && s <= 6;
    if (contexto === 'salarios') return xm >= 800 && xm <= 1500 && s >= 50 && s <= 300;
    return xm >= 40 && xm <= 85 && s >= 5 && s <= 20;
  }

  registar({
    subtema: 'propriedades', tipo: 'media-transformada', nome: 'Média de dados transformados',
    formatos: ['numerica', 'escolha'], contextos: ['temperatura', 'salarios', 'pontuacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const T = TRANSFORMACOES[contexto](rng);
        const f = (x) => T.a * x + T.b;
        const resp = r2(C.media(doisValores(T.xm, T.s).map(f)));
        const resolucao = [
          { passo: 'Identificar a transformação', porque: 'Cada valor x passa a y = ax + b.', calculo: T.formula },
          { passo: 'Aplicar a mesma transformação à média', porque: 'Se cada valor passa a ax + b, a média também: $\\bar{y} = a\\bar{x} + b$.', calculo: '\\bar{y} = ' + tex(T.a, 2) + ' \\times ' + tex(T.xm, 2) + ' + ' + tex(T.b, 2) + ' = ' + tex(resp, 2) },
        ];
        // Verificação: dois valores à mesma distância de x̄ (a média deles é x̄), transformados.
        const x1 = limpo(T.xm - 1);
        const x2 = limpo(T.xm + 1);
        const y1 = r2(f(x1));
        const y2 = r2(f(x2));
        return fechar(rng, formato, { enunciado: T.intro + ' ' + T.perguntaMedia, resolucao, dados: { a: T.a, b: T.b, xm: T.xm, s: T.s, unidade: T.unidade } }, {
          resposta: resp, tolerancia: 0.005, unidade: T.unidade, texto: (v) => fmt(v, 2) + ' ' + T.unidade, erros: T.errosMedia,
          verificacao: {
            passo: 'Confirmar com dois valores de média ' + fmt(T.xm),
            calculo: tex(x1, 2) + ' \\to ' + tex(y1, 2) + ',\\ ' + tex(x2, 2) + ' \\to ' + tex(y2, 2) + ';\\ \\dfrac{' + tex(y1, 2) + ' + ' + tex(y2, 2) + '}{2} = ' + tex(r2((y1 + y2) / 2), 2),
            valor: r2((y1 + y2) / 2),
          },
        });
      });
    },
    verificarIndependente(p) {
      const { a, b, xm } = p.dados;
      return confere(p, r2(a * xm + b), (v) => fmt(v, 2) + ' ' + p.dados.unidade);
    },
    limites: limitesTransformacao,
  });

  registar({
    subtema: 'propriedades', tipo: 'desvio-transformado', nome: 'Desvio padrão de dados transformados',
    formatos: ['numerica', 'escolha'], contextos: ['temperatura', 'salarios', 'pontuacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const T = TRANSFORMACOES[contexto](rng);
        const f = (x) => T.a * x + T.b;
        const resp = r2(C.desvioPadrao(doisValores(T.xm, T.s).map(f)));
        const resolucao = [
          { passo: 'Identificar a transformação', porque: 'Cada valor x passa a y = ax + b.', calculo: T.formula },
          { passo: 'Ver o efeito de cada parte', porque: 'Somar b desloca todos os valores por igual (não muda a dispersão); multiplicar por a multiplica as distâncias entre os valores por |a|.', calculo: 's_y = |a| \\times s_x' },
          { passo: 'Calcular', porque: 'Só o fator a interessa para o desvio padrão.', calculo: 's_y = ' + tex(T.a, 2) + ' \\times ' + tex(T.s, 2) + ' = ' + tex(resp, 2) },
        ];
        // Verificação: dois valores à distância 1 ficam à distância a.
        const d = r2(f(T.xm + 1) - f(T.xm));
        return fechar(rng, formato, { enunciado: T.intro + ' ' + T.perguntaDesvio, resolucao, dados: { a: T.a, b: T.b, xm: T.xm, s: T.s, unidade: T.unidade } }, {
          resposta: resp, tolerancia: 0.005, unidade: T.unidade, texto: (v) => fmt(v, 2) + ' ' + T.unidade, erros: T.errosDesvio,
          verificacao: {
            passo: 'Confirmar que dois valores à distância 1 ficam à distância a',
            calculo: tex(r2(f(T.xm + 1)), 2) + ' - ' + tex(r2(f(T.xm)), 2) + ' = ' + tex(d, 2) + ' \\Rightarrow s_y = ' + tex(d, 2) + ' \\times ' + tex(T.s, 2) + ' = ' + tex(r2(d * T.s), 2),
            valor: r2(d * T.s),
          },
        });
      });
    },
    verificarIndependente(p) {
      const { a, s } = p.dados;
      return confere(p, r2(Math.abs(a) * s), (v) => fmt(v, 2) + ' ' + p.dados.unidade);
    },
    limites: limitesTransformacao,
  });

  // Média e mediana por métodos próprios (para a verificação independente do outlier).
  const mediaSimples = (xs) => soma(xs) / xs.length;

  registar({
    subtema: 'propriedades', tipo: 'outlier', nome: 'Valores extremos: média e mediana',
    formatos: ['vf'], contextos: ['maximo', 'minimo'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const maximo = contexto === 'maximo';
        const t = escolher(rng, NUMERICOS.filter((x) => (maximo ? x.atipico[1] > x.lim[1] : true)));
        const n = inteiro(rng, 5, 9);
        // Dados na metade de baixo (máximo) ou de cima (mínimo) da escala, para haver espaço para um atípico.
        const meio = Math.round((t.lim[0] + t.lim[1]) / 2);
        const xs = Array.from({ length: n }, () => (maximo ? inteiro(rng, t.lim[0], meio) : inteiro(rng, meio, t.lim[1])));
        if ((soma(xs) * 10) % n !== 0) return null;
        const o = ordenar(xs);
        if (maximo ? o[n - 1] === o[n - 2] : o[0] === o[1]) return null;
        const velho = maximo ? o[n - 1] : o[0];
        const i = xs.indexOf(velho);
        // O valor corrigido fica bem para lá da barreira dos atípicos (pelo menos mais uma AIQ além de 1,5 × AIQ).
        const q1 = C.percentil(xs, 25);
        const q3 = C.percentil(xs, 75);
        const aiq = q3 - q1;
        if (aiq < 2) return null;
        const barreira = maximo ? q3 + 1.5 * aiq : q1 - 1.5 * aiq;
        const alvo = maximo ? q3 + 2.5 * aiq : q1 - 2.5 * aiq;
        const d = Math.max(2, Math.ceil((maximo ? alvo - velho : velho - alvo) / n)) + inteiro(rng, 0, 2);
        const D = n * d;
        const novo = maximo ? velho + D : velho - D;
        if (novo < t.atipico[0] || novo > t.atipico[1]) return null;
        const ys = xs.slice();
        ys[i] = novo;
        const m1 = C.media(xs);
        const m2 = C.media(ys);
        const me1 = C.mediana(xs);
        const me2 = C.mediana(ys);
        if (Math.abs(me1 - me2) > 1e-9) return null;
        const sg = maximo ? 1 : -1;
        const dir = maximo ? 'aumenta' : 'diminui';
        const dirPl = maximo ? 'aumentam' : 'diminuem';
        const extremo = maximo ? 'maior' : 'menor';
        const certa = { texto: 'Com a correção, a média ' + dir + ' ' + fmt(d) + ' e a mediana não se altera.', dMedia: sg * d, dMediana: 0 };
        const falsas = [
          { texto: 'Com a correção, a média ' + dir + ' ' + fmt(D) + ' e a mediana não se altera.', dMedia: sg * D, dMediana: 0, codigo: 'media_varia_diferenca', explicacao: 'A diferença de ' + fmt(D) + ' num só valor reparte-se pelos ' + fmt(n) + ' valores: a média ' + dir + ' ' + fmt(D) + '/' + fmt(n) + ' = ' + fmt(d) + '.' },
          { texto: 'Com a correção, a média e a mediana ' + dirPl + ' ambas ' + fmt(d) + '.', dMedia: sg * d, dMediana: sg * d, codigo: 'mediana_afetada', explicacao: 'A mediana só depende dos valores do meio dos dados ordenados; mudar o ' + extremo + ' valor não a altera.' },
          { texto: 'Com a correção, a média não se altera e a mediana ' + dir + ' ' + fmt(d) + '.', dMedia: 0, dMediana: sg * d, codigo: 'trocou_media_mediana', explicacao: 'Trocaste os papéis: a média usa todos os valores (por isso muda); a mediana é resistente a valores extremos.' },
        ];
        const falsa = escolher(rng, falsas);
        const v = A.vfDe(rng, certa.texto, falsa.texto, { codigo: falsa.codigo, explicacao: falsa.explicacao });
        const afirmacao = v.correta ? certa : falsa;
        const enunciado = t.intro(n) + ': ' + listaTxt(xs) + '. Verificou-se depois que o valor ' + fmt(velho) + ' estava errado: o valor correto é ' + fmt(novo) + '. Afirmação: «' + v.enunciado + '»';
        const resolucao = [
          {
            passo: 'Ver que o valor corrigido é atípico',
            porque: 'Um valor é atípico quando fica ' + (maximo ? 'acima de $Q_3 + 1{,}5 \\times AIQ$' : 'abaixo de $Q_1 - 1{,}5 \\times AIQ$') + '; ' + fmt(novo) + ' fica muito para lá dessa barreira.',
            calculo: maximo
              ? 'Q_3 + 1{,}5 \\times AIQ = ' + tex(q3) + ' + 1{,}5 \\times ' + tex(aiq) + ' = ' + tex(barreira) + ' < ' + tex(novo)
              : 'Q_1 - 1{,}5 \\times AIQ = ' + tex(q1) + ' - 1{,}5 \\times ' + tex(aiq) + ' = ' + tex(barreira) + ' > ' + tex(novo),
          },
          { passo: 'Calcular a variação da média', porque: 'A soma varia ' + fmt(novo - velho) + ' e divide-se pelos ' + fmt(n) + ' valores.', calculo: '\\Delta\\bar{x} = \\dfrac{' + tex(novo - velho) + '}{' + tex(n) + '} = ' + tex(sg * d) },
          { passo: 'Ver a mediana', porque: 'O valor corrigido continua a ser o ' + extremo + ' de todos, por isso os valores do meio dos dados ordenados não mudam.', calculo: '\\mathrm{Me} = ' + tex(me1) + ' \\to ' + tex(me2) },
          { passo: 'Comparar com a afirmação', porque: v.correta ? 'A afirmação descreve exatamente estas variações.' : 'A afirmação não corresponde a estas variações.' },
        ];
        const iM1 = mediaSimples(xs);
        const iM2 = mediaSimples(ys);
        const verdade = Math.abs((iM2 - iM1) - afirmacao.dMedia) < 1e-9 && Math.abs((medianaContagem(ys) - medianaContagem(xs)) - afirmacao.dMediana) < 1e-9;
        return {
          enunciado, correta: v.correta, errosTipicos: v.errosTipicos, resolucao,
          verificacao: {
            passo: 'Calcular as duas médias e as duas medianas',
            calculo: '\\bar{x}: ' + tex(m1, 2) + ' \\to ' + tex(m2, 2) + ';\\ \\mathrm{Me}: ' + tex(me1) + ' \\to ' + tex(me2),
            valor: verdade,
          },
          dados: { tema: t.id, xs, i, novo, afirmacao: { dMedia: afirmacao.dMedia, dMediana: afirmacao.dMediana } },
          esquema: ESQUEMA_MEDIDAS(xs),
        };
      });
    },
    verificarIndependente(p) {
      const { xs, i, novo, afirmacao } = p.dados;
      const ys = xs.slice();
      ys[i] = novo;
      const ok = Math.abs((mediaSimples(ys) - mediaSimples(xs)) - afirmacao.dMedia) < 1e-9
        && Math.abs((medianaContagem(ys) - medianaContagem(xs)) - afirmacao.dMediana) < 1e-9;
      return p.correta === ok;
    },
    limites(p) {
      const { xs, novo } = p.dados;
      const t = numerico(p.dados.tema);
      return xs.length >= 5 && xs.length <= 9 && dentro(t, xs) && novo >= t.atipico[0] && novo <= t.atipico[1];
    },
  });

  // ================================================================ estatística bivariada
  const singular = (v, s, pl) => fmt(v) + (Math.abs(v) === 1 ? s : pl);
  const BIV = {
    estudo: {
      x0: 1, passo: 1, m: [0.8, 1.2, 1.5], b: [4, 5, 6], e: 0.5, yLim: [0, 20],
      xNome: 'o número de horas de estudo por semana', yNome: 'a classificação no teste (de 0 a 20)',
      incX: 'por cada hora a mais de estudo por semana', yPrev: 'a classificação prevista', yUnid: (v) => singular(v, ' valor', ' valores'),
      incY: 'por cada valor a mais na classificação', xPrev: 'o número previsto de horas de estudo', xUnid: (v) => singular(v, ' hora', ' horas'),
      zero: 'para 0 horas de estudo por semana',
      causal: (v) => 'Qualquer aluno que passe a estudar mais uma hora por semana tem, com certeza, mais ' + singular(v, ' valor', ' valores') + ' no teste.',
      pergunta: (x) => 'Que classificação prevês para um aluno que estude ' + fmt(x) + ' horas por semana?', unidade: 'valores',
    },
    temperatura: {
      x0: 18, passo: 2, m: [4, 5, 6], b: [10, 20, 30], e: 3, yLim: [0, 300], contagem: true,
      xNome: 'a temperatura máxima do dia (em °C)', yNome: 'o número de gelados vendidos nesse dia',
      incX: 'por cada grau a mais de temperatura máxima', yPrev: 'o número previsto de gelados vendidos', yUnid: (v) => singular(v, ' gelado', ' gelados'),
      incY: 'por cada gelado a mais vendido', xPrev: 'a temperatura máxima prevista', xUnid: (v) => singular(v, ' grau', ' graus'),
      zero: 'para uma temperatura máxima de 0 °C',
      causal: (v) => 'Em qualquer dia, um grau a mais faz vender exatamente mais ' + singular(v, ' gelado', ' gelados') + '.',
      pergunta: (x) => 'Quantos gelados prevês vender num dia com temperatura máxima de ' + fmt(x) + ' °C?', unidade: 'gelados',
    },
    preco: {
      x0: 2, passo: 1, m: [-8, -10, -12], b: [150, 180, 200], e: 2, yLim: [0, 300], contagem: true,
      xNome: 'o preço do bilhete (em euros)', yNome: 'o número de bilhetes vendidos por dia',
      incX: 'por cada euro a mais no preço do bilhete', yPrev: 'o número previsto de bilhetes vendidos por dia', yUnid: (v) => singular(v, ' bilhete', ' bilhetes'),
      incY: 'por cada bilhete a mais vendido por dia', xPrev: 'o preço previsto do bilhete', xUnid: (v) => singular(v, ' euro', ' euros'),
      zero: 'para um bilhete gratuito (0 €)',
      causal: (v) => 'Subir o preço 1 € faz perder exatamente ' + singular(v, ' bilhete', ' bilhetes') + ' em qualquer dia.',
      pergunta: (x) => 'Quantos bilhetes prevês vender por dia com o bilhete a ' + fmt(x) + ' €?', unidade: 'bilhetes',
    },
    carro: {
      x0: 1, passo: 1, m: [-1.2, -1.5, -1.8], b: [20, 22, 25], e: 0.5, yLim: [0, 40],
      xNome: 'a idade do carro (em anos)', yNome: 'o preço de venda (em milhares de euros)',
      incX: 'por cada ano a mais de idade do carro', yPrev: 'o preço de venda previsto', yUnid: (v) => fmt(v) + ' mil euros',
      incY: 'por cada mil euros a mais no preço', xPrev: 'a idade prevista do carro', xUnid: (v) => singular(v, ' ano', ' anos'),
      zero: 'para um carro novo (0 anos)',
      causal: (v) => 'Cada ano a mais faz qualquer carro perder exatamente ' + fmt(v) + ' mil euros de valor.',
      pergunta: (x) => 'Que preço de venda prevês, em milhares de euros, para um carro com ' + fmt(x) + ' anos?', unidade: 'mil euros',
    },
  };
  const IDS_BIV = Object.keys(BIV);

  const semParenteses = (t) => t.replace(/ \(.*\)$/, '');
  const retaTex = (m, b) => (m === 1 ? '' : m === -1 ? '-' : tex(m)) + 'x' + (b < 0 ? ' - ' + tex(-b) : ' + ' + tex(b));

  // 8 pares com reta de regressão exatamente y = mx + b: resíduos simétricos (e_i = e_{9−i}) e de soma nula.
  function paresExatos(rng, ctx, m, b, escala) {
    const xs = Array.from({ length: 8 }, (_, i) => ctx.x0 + i * ctx.passo);
    const meia = [inteiro(rng, -2, 2), inteiro(rng, -2, 2), inteiro(rng, -2, 2)];
    meia.push(-soma(meia));
    const e = meia.concat(meia.slice().reverse()).map((v) => limpo(v * escala));
    const pares = xs.map((x, i) => [x, limpo(m * x + b + e[i])]);
    if (pares.some(([, y]) => y < ctx.yLim[0] || y > ctx.yLim[1])) return null;
    return pares;
  }

  function somasPares(pares) {
    const n = pares.length;
    const sx = soma(pares.map((p) => p[0]));
    const sy = soma(pares.map((p) => p[1]));
    const sxx = soma(pares.map((p) => p[0] * p[0])) - (sx * sx) / n;
    const syy = soma(pares.map((p) => p[1] * p[1])) - (sy * sy) / n;
    const sxy = soma(pares.map((p) => p[0] * p[1])) - (sx * sy) / n;
    return { mx: sx / n, my: sy / n, sxx, syy, sxy };
  }

  registar({
    subtema: 'bivariada', tipo: 'previsao', nome: 'Previsão com a reta de regressão',
    formatos: ['numerica', 'escolha'], contextos: IDS_BIV,
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const ctx = BIV[contexto];
        const m = escolher(rng, ctx.m);
        const b = escolher(rng, ctx.b);
        const pares = paresExatos(rng, ctx, m, b, ctx.e);
        if (!pares) return null;
        const reg = C.regressao(pares);
        const xMin = pares[0][0];
        const xMax = pares[pares.length - 1][0];
        const x0 = inteiro(rng, xMin, xMax);
        const resp = r2(reg.declive * x0 + reg.ordenada);
        if (resp < ctx.yLim[0]) return null;
        const enunciado = 'Num estudo, a reta de regressão de y sobre x é $y = ' + retaTex(m, b) + '$, em que x é ' + ctx.xNome + ' e y é ' + ctx.yNome + '. Os valores de x observados vão de ' + fmt(xMin) + ' a ' + fmt(xMax) + '. ' + ctx.pergunta(x0);
        const resolucao = [
          { passo: 'Verificar que x está dentro dos dados', porque: 'Só se deve prever para valores de x dentro do intervalo observado (sem extrapolar).', calculo: tex(xMin) + ' \\leq ' + tex(x0) + ' \\leq ' + tex(xMax) },
          { passo: 'Substituir x na equação da reta', porque: 'O valor previsto é a ordenada do ponto da reta com essa abcissa.', calculo: '\\hat{y} = ' + tex(m) + ' \\times ' + tex(x0) + ' + ' + tex(b) + ' = ' + tex(resp) },
        ];
        const erros = [
          { codigo: 'trocou_m_b', valor: r2(b * x0 + m), explicacao: 'Trocaste o declive com a ordenada na origem: é o declive (' + fmt(m) + ') que multiplica x; a ordenada na origem (' + fmt(b) + ') soma-se.' },
          { codigo: 'esqueceu_b', valor: r2(m * x0), explicacao: 'Esqueceste de somar a ordenada na origem, ' + fmt(b) + '.' },
          { codigo: 'resolveu_para_x', valor: r2((x0 - b) / m), explicacao: 'Substituíste ' + fmt(x0) + ' em y e resolveste para x; o valor dado é o de x, e pede-se o y previsto.' },
        ];
        if (m < 0) erros.push({ codigo: 'sinal_do_declive', valor: r2(-m * x0 + b), explicacao: 'O declive é negativo (' + fmt(m) + '): quando x aumenta, y diminui. Não ignores o sinal.' });
        let errosFinais = erros;
        if (formato === 'escolha') {
          // Na escolha só ficam valores possíveis no contexto (dentro da escala; contagens inteiras): um valor
          // impossível eliminava-se sem pensar. Juntam-se mais dois erros reais para haver opções suficientes.
          errosFinais = erros.concat([
            { codigo: 'esqueceu_multiplicar_por_x', valor: r2(m + b), explicacao: 'Somaste o declive à ordenada na origem sem o multiplicar por ' + fmt(x0) + '; isso é a previsão para x = 1.' },
            { codigo: 'ordenada_como_previsao', valor: b, explicacao: fmt(b) + ' é a ordenada na origem, o valor previsto para x = 0; para x = ' + fmt(x0) + ' falta somar ' + fmt(m) + ' × ' + fmt(x0) + '.' },
          ]).filter((e) => e.valor > ctx.yLim[0] && e.valor <= ctx.yLim[1] && (!ctx.contagem || Number.isInteger(e.valor)));
        }
        const { mx, my } = somasPares(pares);
        const val = r2(my + m * (x0 - mx));
        return fechar(rng, formato, { enunciado, resolucao, dados: { pares, m, b, x0 }, esquema: { id: 'regressao', opcoes: { pares: pares.map((p) => p.slice()) } } }, {
          resposta: resp, tolerancia: 0.005, unidade: ctx.unidade, texto: (v) => fmt(v, 2) + ' ' + ctx.unidade, erros: errosFinais,
          verificacao: {
            passo: 'Confirmar com a reta que passa pelo ponto médio $(\\bar{x}, \\bar{y})$',
            calculo: '\\hat{y} = \\bar{y} + m(x - \\bar{x}) = ' + tex(my, 2) + ' + (' + tex(m) + ') \\times (' + tex(x0) + ' - ' + tex(mx, 2) + ') = ' + tex(val, 2),
            valor: val,
          },
        });
      });
    },
    verificarIndependente(p) {
      const { pares, m, x0 } = p.dados;
      const { mx, my, sxx, sxy } = somasPares(pares);
      if (Math.abs(sxy / sxx - m) > 1e-6) return false;
      return confere(p, r2(my + m * (x0 - mx)), (v) => fmt(v, 2) + ' ' + BIV[p.contexto].unidade);
    },
    limites(p) {
      const ctx = BIV[p.contexto];
      return p.dados.pares.every(([, y]) => y >= ctx.yLim[0] && y <= ctx.yLim[1]) && (p.formato !== 'numerica' || (p.resposta >= ctx.yLim[0] && p.resposta <= ctx.yLim[1]));
    },
  });

  const textoR = (v) => '$r = ' + tex(v, 2) + '$';

  registar({
    subtema: 'bivariada', tipo: 'sinal-r', nome: 'Coeficiente de correlação',
    formatos: ['escolha'], contextos: ['dados', 'descrito'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const id = escolher(rng, IDS_BIV);
        const ctx = BIV[id];
        const m = escolher(rng, ctx.m);
        const b = escolher(rng, ctx.b);
        const forte = rng() < 0.5;
        const escala = forte ? ctx.e : ctx.e * A.entre(rng, 4, 8, 1);
        const pares = paresExatos(rng, ctx, m, b, escala);
        if (!pares) return null;
        const r = C.correlacao(pares);
        if (!Number.isFinite(r)) return null;
        const ar = Math.abs(r);
        if (forte ? ar < 0.85 || ar > 0.99 : ar < 0.3 || ar > 0.6) return null;
        const rr = r2(r);
        const sg = Math.sign(r);
        const cresce = sg > 0;
        const erros = [
          { codigo: 'trocou_sinal', valor: -rr, explicacao: 'O sinal de r é o da tendência: quando x aumenta, y tende a ' + (cresce ? 'aumentar' : 'diminuir') + ', por isso r é ' + (cresce ? 'positivo' : 'negativo') + '.' },
        ];
        if (contexto === 'dados') erros.push({ codigo: 'declive_como_r', valor: m, explicacao: 'O declive da reta de regressão (' + fmt(m) + ') não é o coeficiente de correlação: r está entre −1 e 1 e mede quão alinhados estão os pontos.' });
        erros.push(forte
          ? { codigo: 'forca_subestimada', valor: sg * A.entre(rng, 0.2, 0.45, 0.01), explicacao: 'Os pontos estão muito próximos de uma reta: a associação é forte e |r| fica perto de 1.' }
          : { codigo: 'forca_sobrestimada', valor: sg * A.entre(rng, 0.9, 0.98, 0.01), explicacao: 'Os pontos estão bastante espalhados em torno da reta: a associação é fraca e |r| fica longe de 1.' });
        erros.push(forte
          ? { codigo: 'alinhado_como_perfeito', valor: sg, explicacao: 'r = ' + (cresce ? '1' : '−1') + ' só quando todos os pontos estão exatamente sobre uma reta; aqui estão próximos, mas não alinhados.' }
          : { codigo: 'fraca_como_nula', valor: 0, explicacao: 'Há uma tendência, ainda que fraca, por isso r não é 0.' });
        const xs = pares.map((p) => p[0]);
        const ys = pares.map((p) => p[1]);
        const enunciado = contexto === 'dados'
          ? 'Num estudo, x é ' + ctx.xNome + ' e y é ' + ctx.yNome + '. Os valores observados de x foram ' + listaTxt(xs) + ' e os valores de y correspondentes foram ' + listaTxt(ys) + '. A reta de regressão é $y = ' + retaTex(m, b) + '$. Qual é o coeficiente de correlação linear, arredondado às centésimas?'
          : 'Num diagrama de dispersão em que x é ' + ctx.xNome + ' e y é ' + ctx.yNome + ', os pontos estão ' + (forte ? 'muito próximos de uma reta ' : 'bastante espalhados, mas com uma tendência ') + (cresce ? 'crescente' : 'decrescente') + ' (sem estarem todos alinhados). Qual dos valores seguintes pode ser o coeficiente de correlação linear?';
        const resolucao = [
          { passo: 'Ver a direção da associação', porque: 'Quando x aumenta, y tende a ' + (cresce ? 'aumentar: a associação é positiva e r > 0.' : 'diminuir: a associação é negativa e r < 0.') },
          { passo: 'Ver a força da associação', porque: forte ? 'Os pontos estão muito próximos de uma reta: |r| é próximo de 1, mas não igual a 1.' : 'Os pontos estão espalhados em torno da reta: |r| fica longe de 1, mas não é 0.' },
        ];
        if (contexto === 'dados') resolucao.push({ passo: 'Calcular r (na calculadora)', porque: 'Com os pares de dados, a calculadora dá o coeficiente de correlação linear.', calculo: 'r' + igualOuAprox(r, 2) });
        const s = somasPares(pares);
        const rInd = s.sxy / Math.sqrt(s.sxx * s.syy);
        const verificacao = {
          passo: 'Confirmar com a fórmula de r',
          calculo: 'r = \\dfrac{S_{xy}}{\\sqrt{S_{xx} S_{yy}}} = \\dfrac{' + tex(s.sxy, 2) + '}{\\sqrt{' + tex(s.sxx, 2) + ' \\times ' + tex(s.syy, 2) + '}}' + igualOuAprox(rInd, 2),
          valor: r2(rInd),
        };
        return fechar(rng, 'escolha', { enunciado, resolucao, dados: { pares, m, contexto: id }, esquema: { id: 'regressao', opcoes: { pares: pares.map((p) => p.slice()) } } }, {
          resposta: rr, tolerancia: 0, texto: textoR, erros, verificacao,
        });
      });
    },
    verificarIndependente(p) {
      const s = somasPares(p.dados.pares);
      return confere(p, r2(s.sxy / Math.sqrt(s.sxx * s.syy)), textoR);
    },
    limites(p) {
      const ctx = BIV[p.dados.contexto];
      return !!ctx && p.dados.pares.every(([, y]) => y >= ctx.yLim[0] && y <= ctx.yLim[1]);
    },
  });

  // Interpretação do declive a partir da variação Δ de y quando x aumenta 1.
  function interpretacao(ctx, delta) {
    return maiuscula(ctx.incX) + ', ' + ctx.yPrev + (delta > 0 ? ' aumenta ' : ' diminui ') + ctx.yUnid(Math.abs(delta)) + '.';
  }

  registar({
    subtema: 'bivariada', tipo: 'interpretar-declive', nome: 'Interpretar o declive da reta de regressão',
    formatos: ['escolha'], contextos: IDS_BIV,
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const ctx = BIV[contexto];
        const m = escolher(rng, ctx.m);
        const b = escolher(rng, ctx.b);
        const am = Math.abs(m);
        if (Math.abs(b - am) < 1e-9) return null;
        const certa = interpretacao(ctx, m);
        const pool = baralhar(rng, [
          { codigo: 'sinal_trocado', texto: interpretacao(ctx, -m), explicacao: 'O declive é ' + (m > 0 ? 'positivo' : 'negativo') + ' (' + fmt(m) + '): quando x aumenta, y ' + (m > 0 ? 'aumenta' : 'diminui') + '.' },
          { codigo: 'trocou_variaveis', texto: maiuscula(ctx.incY) + ', ' + ctx.xPrev + (m > 0 ? ' aumenta ' : ' diminui ') + ctx.xUnid(am) + '.', explicacao: 'O declive diz quanto varia y (' + semParenteses(ctx.yNome) + ') por cada unidade a mais de x (' + semParenteses(ctx.xNome) + '), não o contrário.' },
          { codigo: 'causalidade', texto: ctx.causal(am), explicacao: 'A reta dá valores previstos (uma tendência média): não garante o que acontece em cada caso nem prova que x causa y.' },
          { codigo: 'ordenada_como_declive', texto: maiuscula(ctx.incX) + ', ' + ctx.yPrev + (m > 0 ? ' aumenta ' : ' diminui ') + ctx.yUnid(b) + '.', explicacao: fmt(b) + ' é a ordenada na origem (o valor previsto ' + ctx.zero + '); a variação por cada unidade de x é dada pelo declive, ' + fmt(m) + '.' },
        ]);
        const enunciado = 'Num estudo, a reta de regressão de y sobre x é $y = ' + retaTex(m, b) + '$, em que x é ' + ctx.xNome + ' e y é ' + ctx.yNome + '. Qual é a interpretação correta do declive?';
        const resolucao = [
          { passo: 'Identificar o declive', porque: 'Na reta y = mx + b, o declive é o coeficiente de x.', calculo: 'm = ' + tex(m) },
          { passo: 'Interpretar', porque: 'O declive é a variação prevista de y quando x aumenta uma unidade; ' + (m > 0 ? 'como é positivo, y aumenta.' : 'como é negativo, y diminui.') },
        ];
        const x1 = ctx.x0 + ctx.passo;
        const y1 = m * x1 + b;
        const y2 = m * (x1 + 1) + b;
        const delta = limpo(y2 - y1);
        const verificacao = {
          passo: 'Confirmar com dois valores de x que diferem uma unidade',
          calculo: 'y(' + tex(x1 + 1) + ') - y(' + tex(x1) + ') = ' + tex(y2) + ' - ' + tex(y1) + ' = ' + tex(delta),
        };
        return fecharTexto(rng, { enunciado, resolucao, verificacao, dados: { m, b } }, certa, pool, interpretacao(ctx, delta));
      });
    },
    verificarIndependente(p) {
      const ctx = BIV[p.contexto];
      const { m, b } = p.dados;
      const delta = limpo((m * 6 + b) - (m * 5 + b));
      return A.chave(p.opcoes[p.correta]) === A.chave(interpretacao(ctx, delta));
    },
    limites(p) {
      const ctx = BIV[p.contexto];
      return ctx.m.includes(p.dados.m) && ctx.b.includes(p.dados.b);
    },
  });
})();
