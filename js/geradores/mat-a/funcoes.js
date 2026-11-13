globalThis.Manual = globalThis.Manual || {};

// Geradores de Matemática A — Funções.
// Subtemas: generalidades, afim, quadratica, transformacoes, equacoes-inequacoes, ramos-modulo (ids <subtema>-<tipo>).
// As respostas vêm de Manual.calc.funcoes (zeros, vértice, Δ, inequações, ramos) e de Manual.calc.geometria
// (declive); verificarIndependente e a verificação usam outro caminho (substituição, simetria da parábola,
// −Δ/(4a), forma canónica, pontos de teste, imagem de pontos pelas transformações, pesquisa exaustiva…).
// Valores exatos: inteiros ou frações de denominador ≤ 10 (escritas com \dfrac); todos os pontos têm
// coordenadas inteiras, por isso a notação é sempre (a, b).
// Manual.calc só é lido dentro de gerar (no index.html os módulos de cálculo carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const AJ = G.ajudas;
  const calc = () => Manual.calc.funcoes;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const fmt = AJ.fmt;
  const tex = AJ.tex;
  const limpo = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const proximo = (a, b) => Math.abs(a - b) < 1e-9;
  const tentar = (construir) => AJ.tentar(construir, 'funções');
  const { fechar, fecharTexto, confere, chave } = AJ;
  const NAO_NULOS = (n) => Array.from({ length: 2 * n + 1 }, (_, i) => i - n).filter((v) => v !== 0);
  const sinal = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'mat-a', tema: 'funcoes', id: def.subtema + '-' + def.tipo }, def));
  }

  // ---------------------------------------------------------------- frações e escrita
  const mdc = (a, b) => (b ? mdc(b, a % b) : Math.abs(a));
  // v = n/d com d ≥ 1 mínimo (null se não houver d ≤ 1000).
  function fracao(v) {
    if (!Number.isFinite(v)) return null;
    for (let d = 1; d <= 1000; d++) {
      const n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-7) return { n: Math.round(n) + 0, d };
    }
    return null;
  }
  // Fração "simpática": denominador ≤ 10.
  const simples = (v) => { const f = fracao(v); return !!f && f.d <= 10; };
  // Decimal com no máximo 2 casas (respostas numéricas que o aluno escreve).
  const decimal2 = (v) => Number.isFinite(v) && Math.abs(Math.round(v * 100) - v * 100) < 1e-6;
  const ehInteiro = (v) => Number.isFinite(v) && Number.isInteger(limpo(v));

  // Número racional para LaTeX: inteiro ou \dfrac{n}{d}.
  function texQ(v) {
    const f = fracao(limpo(v));
    if (!f) throw new Error('funções: valor não racional ' + v);
    if (f.d === 1) return tex(f.n);
    return (f.n < 0 ? '-' : '') + '\\dfrac{' + tex(Math.abs(f.n)) + '}{' + tex(f.d) + '}';
  }
  // Entre parênteses se for negativo (para produtos e potências).
  const parQ = (v) => (v < 0 ? (ehInteiro(v) ? '(' + texQ(v) + ')' : '\\left(' + texQ(v) + '\\right)') : texQ(v));
  // Base de uma potência: frações sempre entre parênteses.
  const baseQ = (v) => (ehInteiro(v) && v >= 0 ? texQ(v) : ehInteiro(v) ? '(' + texQ(v) + ')' : '\\left(' + texQ(v) + '\\right)');
  // Parcela com sinal para continuar uma soma: " + 3", " - \dfrac{1}{2}".
  const maisQ = (v) => (v < 0 ? ' - ' + texQ(-v) : ' + ' + texQ(v));
  const somaNumTex = (vs) => vs.map((v, i) => (i === 0 ? texQ(v) : maisQ(v))).join('');
  const opQ = (v) => '$' + texQ(v) + '$';
  // Argumento de uma função: f(2), f\left(\dfrac{1}{2}\right).
  const argQ = (v) => (ehInteiro(v) ? '(' + texQ(v) + ')' : '\\left(' + texQ(v) + '\\right)');

  // termos: [[coeficiente, 'x^2'], [coeficiente, 'x'], [coeficiente, '']]
  function somaTex(termos) {
    let s = '';
    for (const [c0, lit] of termos) {
      const c = limpo(c0);
      if (c === 0) continue;
      const abs = Math.abs(c);
      const corpo = lit && abs === 1 ? lit : texQ(abs) + lit;
      s += s === '' ? (c < 0 ? '-' : '') + corpo : (c < 0 ? ' - ' : ' + ') + corpo;
    }
    return s === '' ? '0' : s;
  }
  const poliTex = (a, b, c, v = 'x') => somaTex([[a, v + '^2'], [b, v], [c, '']]);
  const afimTex = (m, b) => somaTex([[m, 'x'], [b, '']]);
  // a(x − h)² + k
  function canonicaTex(a, h, k) {
    const base = h === 0 ? 'x^2' : '(x ' + (h < 0 ? '+ ' : '- ') + texQ(Math.abs(h)) + ')^2';
    const coef = a === 1 ? '' : a === -1 ? '-' : texQ(a);
    return coef + base + (k === 0 ? '' : maisQ(k));
  }
  // Pontos: coordenadas sempre inteiras neste ficheiro.
  function ptTex(x, y) {
    if (!ehInteiro(x) || !ehInteiro(y)) throw new Error('funções: ponto com coordenadas não inteiras');
    return '(' + tex(x) + ', ' + tex(y) + ')';
  }
  const opPt = (P) => '$' + ptTex(P[0], P[1]) + '$';
  // Conjuntos finitos de números (ordenados, sem repetições).
  const ordenar = (S) => S.map(limpo).filter((v, i, l) => l.findIndex((u) => proximo(u, v)) === i).sort((a, b) => a - b);
  const conjTex = (S) => (S.length ? '\\{' + ordenar(S).map(texQ).join(', ') + '\\}' : '\\emptyset');
  const opConj = (S) => '$' + conjTex(S) + '$';
  // Intervalos { de, ate, fechadoDe, fechadoAte } (notação portuguesa).
  function intervaloTex(i) {
    if (i.de === -Infinity && i.ate === Infinity) return '\\mathbb{R}';
    const de = i.de === -Infinity ? '-\\infty' : texQ(i.de);
    const ate = i.ate === Infinity ? '+\\infty' : texQ(i.ate);
    return (i.fechadoDe ? '[' : ']') + de + ', ' + ate + (i.fechadoAte ? ']' : '[');
  }
  const uniaoTex = (is) => (is.length === 0 ? '\\emptyset' : is.map(intervaloTex).join(' \\cup '));
  const opUniao = (is) => '$' + uniaoTex(is) + '$';
  const semiReta = (z, direita, fechado) => (direita
    ? { de: z, ate: Infinity, fechadoDe: fechado, fechadoAte: false }
    : { de: -Infinity, ate: z, fechadoDe: false, fechadoAte: fechado });
  const SIMBOLO = { '<': '<', '>': '>', '<=': '\\leq', '>=': '\\geq' };

  // ax² + bx + c (direto) e pondo x em evidência, (ax + b)x + c (outro caminho, para verificações).
  const valorP = (a, b, c, x) => limpo(a * x * x + b * x + c);
  const evidencia = (a, b, c, x) => limpo((a * x + b) * x + c);

  // f(x0) = a × (x0)² + b × x0 + c = parcelas = valor (frações com parênteses).
  function substituicaoTex(nome, a, b, c, x, constanteAntes = false) {
    if (x === 0) return nome + '(0) = ' + texQ(c);
    const partes = [];
    const coefTex = (k) => (Math.abs(k) === 1 ? '' : texQ(Math.abs(k)) + ' \\times ');
    if (a !== 0) partes.push([a, coefTex(a) + baseQ(x) + '^2', limpo(a * x * x)]);
    if (b !== 0) partes.push([b, coefTex(b) + parQ(x), limpo(b * x)]);
    if (c !== 0) partes.push([c, texQ(Math.abs(c)), c]);
    if (constanteAntes) partes.reverse();
    const linha = partes.map(([k, corpo], i) => (i === 0 ? (k < 0 ? '-' : '') : (k < 0 ? ' - ' : ' + ')) + corpo).join('');
    const valores = somaNumTex(partes.map((p) => p[2]));
    const total = valorP(a, b, c, x);
    return nome + argQ(x) + ' = ' + linha + (partes.length > 1 ? ' = ' + valores : '') + ' = ' + texQ(total);
  }
  // Mesma conta, com x em evidência: ((a × x0) + b) × x0 + c.
  function evidenciaTex(a, b, c, x) {
    const dentro = limpo(a * x + b);
    return '(' + texQ(a) + ' \\times ' + parQ(x) + maisQ(b) + ') \\times ' + parQ(x) + (c === 0 ? '' : maisQ(c)) +
      ' = ' + parQ(dentro) + ' \\times ' + parQ(x) + (c === 0 ? '' : maisQ(c)) + ' = ' + texQ(evidencia(a, b, c, x));
  }

  // Respostas que são conjuntos (zeros, soluções). erros: [{ codigo, S, explicacao }].
  // numerica: pergunta-se um elemento, dado por o.pega(S) (NaN = erro sem valor nessa pergunta); escolha: o conjunto.
  function fecharConjunto(rng, formato, ex, o) {
    const verif = { passo: o.verificacao.passo, calculo: o.verificacao.calculo };
    if (formato === 'numerica') {
      const resposta = o.pega(o.certo);
      if (!decimal2(resposta)) return null;
      return fechar(rng, 'numerica', ex, {
        resposta, tolerancia: 0,
        erros: o.erros.map((e) => ({ codigo: e.codigo, valor: o.pega(e.S), explicacao: e.explicacao })),
        verificacao: Object.assign(verif, { valor: o.pega(o.verificacao.S) }),
      });
    }
    ex.verificacao = verif;
    const erros = o.erros.filter((e) => e.S.every(simples)).map((e) => ({ codigo: e.codigo, texto: opConj(e.S), explicacao: e.explicacao }));
    return fecharTexto(rng, ex, opConj(o.certo), erros, opConj(o.verificacao.S));
  }
  const maior = (S) => (S.length ? Math.max(...S) : NaN);
  const menor = (S) => (S.length ? Math.min(...S) : NaN);
  const confereConjunto = (p, S, pega) => (p.formato === 'numerica'
    ? Math.abs(p.resposta - pega(S)) <= p.tolerancia + 1e-9
    : chave(p.opcoes[p.correta]) === chave(opConj(S)));
  const mesmoConjunto = (S, T) => S.length === T.length && ordenar(S).every((v, i) => proximo(v, ordenar(T)[i]));

  // Pontos (vértices): numerica pergunta uma coordenada (eixo), escolha o ponto. erros: [{ codigo, P, explicacao }].
  function fecharPonto(rng, formato, ex, o) {
    const verif = { passo: o.verificacao.passo, calculo: o.verificacao.calculo };
    const erros = o.erros.filter((e) => e.P.every(ehInteiro));
    if (formato === 'numerica') {
      return fechar(rng, 'numerica', ex, {
        resposta: o.certo[o.eixo], tolerancia: 0,
        erros: erros.map((e) => ({ codigo: e.codigo, valor: e.P[o.eixo], explicacao: e.explicacao })),
        verificacao: Object.assign(verif, { valor: o.verificacao.P[o.eixo] }),
      });
    }
    ex.verificacao = verif;
    return fecharTexto(rng, ex, opPt(o.certo), erros.map((e) => ({ codigo: e.codigo, texto: opPt(e.P), explicacao: e.explicacao })), opPt(o.verificacao.P));
  }
  function lerPonto(t) {
    const m = String(t).replace(/\$/g, '').replace(/\s/g, '').match(/^\((-?\d+),(-?\d+)\)$/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  }
  const confereVertice = (p, P) => (p.formato === 'numerica'
    ? Math.abs(p.resposta - P[p.dados.eixo]) <= p.tolerancia + 1e-9
    : (() => { const Q = lerPonto(p.opcoes[p.correta]); return !!Q && proximo(Q[0], P[0]) && proximo(Q[1], P[1]); })());
  const EIXO = ['abcissa', 'ordenada'];
  const pedidoVertice = (formato, eixo, oQue) => (formato === 'numerica' ? 'Qual é a ' + EIXO[eixo] + ' ' + oQue + '?' : 'Quais são as coordenadas ' + oQue + '?');

  // Esquemas (só quando os valores cabem nos controlos do esquema).
  const passo05 = (v) => ehInteiro(2 * v);
  const esquemaAfim = (m, b) => (Math.abs(m) <= 5 && Math.abs(b) <= 10 && passo05(m) && passo05(b) ? { id: 'afim', opcoes: { m, b } } : undefined);
  const esquemaParabola = (a, h, k, mostrarBase) => (Math.abs(a) <= 3 && ehInteiro(10 * a) && Math.abs(h) <= 5 && Math.abs(k) <= 5 && passo05(h) && passo05(k)
    ? { id: 'parabola', opcoes: { a, h, k, mostrarBase } } : undefined);

  const dentro = (vs, lim) => vs.every((v) => Number.isFinite(v) && Math.abs(v) <= lim);

  // ================================================================ generalidades

  // Imagem de x0 por ax² + bx + c (expressão abstrata ou lançamento vertical h(t) = c + bt − 5t²).
  function imagem(rng, formato, contexto) {
    const modelo = contexto === 'modelacao';
    let a, b, c, x0, intro, pergunta;
    const nome = modelo ? 'h' : 'f';
    const v = modelo ? 't' : 'x';
    if (!modelo) {
      a = escolher(rng, [-3, -2, -1, 1, 2, 3]);
      b = escolher(rng, NAO_NULOS(5));
      c = inteiro(rng, -9, 9);
      x0 = escolher(rng, [-4, -3, -2, -1, 3, 4]);
      intro = 'Considera a função $f$ definida por $f(x) = ' + poliTex(a, b, c) + '$.';
      pergunta = ' Qual é a imagem de $' + tex(x0) + '$ por $f$?';
    } else {
      a = -5;
      b = escolher(rng, [15, 20, 25, 30]);
      c = inteiro(rng, 2, 20);
      x0 = inteiro(rng, 1, b / 5 - 1);
      intro = 'Uma bola é lançada na vertical, para cima, de uma varanda. A altura da bola ao solo, em metros, $t$ segundos depois do lançamento, é dada por $h(t) = ' + tex(c) + ' + ' + tex(b) + 't - 5t^2$.';
      pergunta = ' A que altura do solo está a bola $' + tex(x0) + '$ segundos depois do lançamento?';
    }
    const y = valorP(a, b, c, x0);
    const res = ' Assim, $' + nome + '(' + tex(x0) + ') = ' + tex(y) + '$.';
    const sq = x0 * x0;
    const erros = [];
    if (x0 < 0) {
      erros.push({ codigo: 'quadrado_sem_parenteses', valor: limpo(-a * sq + b * x0 + c), explicacao: 'Calculaste $' + tex(x0) + '^2$ como $' + tex(-sq) + '$, sem parênteses. O quadrado aplica-se ao número todo, com o sinal, $(' + tex(x0) + ')^2 = ' + tex(sq) + '$.' + res });
    }
    if (x0 !== 2) {
      erros.push({ codigo: 'dobro_em_vez_de_quadrado', valor: limpo(a * 2 * x0 + b * x0 + c), explicacao: 'Calculaste $' + baseQ(x0) + '^2$ como $2 \\times ' + parQ(x0) + ' = ' + tex(2 * x0) + '$. O quadrado é o produto do número por si próprio, $' + parQ(x0) + ' \\times ' + parQ(x0) + ' = ' + tex(sq) + '$.' + res });
    }
    if (x0 !== 1) {
      erros.push({ codigo: 'esqueceu_quadrado', valor: limpo(a * x0 + b * x0 + c), explicacao: 'Substituíste $' + v + '^2$ por $' + tex(x0) + '$, esquecendo o expoente. Em $' + texQ(a) + v + '^2$ entra $' + baseQ(x0) + '^2 = ' + tex(sq) + '$.' + res });
    }
    if (Math.abs(a) !== 1) {
      const errado = limpo(sinal(a) * a * a * sq + b * x0 + c);
      erros.push({ codigo: 'quadrou_coeficiente', valor: errado, explicacao: 'Calculaste $' + (a < 0 ? '-' : '') + '(' + tex(Math.abs(a)) + ' \\times ' + parQ(x0) + ')^2 = ' + tex(sinal(a) * a * a * sq) + '$, elevando ao quadrado também o ' + fmt(Math.abs(a)) + '. Só $' + v + '$ está ao quadrado, $' + tex(a) + ' \\times ' + baseQ(x0) + '^2 = ' + tex(a * sq) + '$.' + res });
    }
    if (modelo) {
      erros.push(
        { codigo: 'somou_termo_quadratico', valor: limpo(c + b * x0 + 5 * sq), explicacao: 'Somaste $5 \\times ' + baseQ(x0) + '^2 = ' + tex(5 * sq) + '$, mas na expressão esse termo tem sinal menos, $-5t^2$, e subtrai-se.' + res },
        { codigo: 'esqueceu_altura_inicial', valor: limpo(b * x0 - 5 * sq), explicacao: 'Deixaste de fora a parcela $' + tex(c) + '$, a altura da varanda (a altura no instante $t = 0$, $h(0) = ' + tex(c) + '$). Ela soma-se em todos os instantes.' + res },
      );
    }
    if (b < 0 && x0 < 0) {
      erros.push({ codigo: 'sinal_produto', valor: limpo(a * sq - b * x0 + c), explicacao: '$' + tex(b) + ' \\times (' + tex(x0) + ')$ é o produto de dois números negativos, por isso é positivo, $' + tex(b * x0) + '$, e não $' + tex(-b * x0) + '$.' + res });
    }
    // Numa altura, só valores positivos são plausíveis.
    const errosOk = baralhar(rng, erros).filter((e) => !modelo || e.valor > 0);
    const resolucao = [
      { passo: 'Calcular a potência', porque: 'Nas contas, as potências fazem-se antes dos produtos e das somas; o sinal faz parte do número.', calculo: baseQ(x0) + '^2 = ' + tex(sq) },
      { passo: 'Substituir $' + v + '$ por $' + tex(x0) + '$ e calcular', porque: 'A imagem de um objeto obtém-se substituindo a variável por esse objeto na expressão.', calculo: substituicaoTex(nome, a, b, c, x0, modelo) },
    ];
    const ex = { enunciado: intro + pergunta, resolucao, dados: { contexto, a, b, c, x0 } };
    return fechar(rng, formato, ex, {
      resposta: y, tolerancia: 0, unidade: modelo ? 'm' : undefined, texto: modelo ? (u) => '$' + tex(u) + '$ m' : opQ, erros: errosOk,
      verificacao: {
        passo: 'Confirmar com $' + v + '$ em evidência nas duas primeiras parcelas, $' + nome + '(' + v + ') = (' + afimTex(a, b).replace(/x/g, v) + ')' + v + (c === 0 ? '' : maisQ(c)) + '$',
        calculo: evidenciaTex(a, b, c, x0),
        valor: evidencia(a, b, c, x0),
      },
    });
  }

  registar({
    subtema: 'generalidades', tipo: 'imagem', nome: 'Imagem de um objeto',
    formatos: ['numerica', 'escolha'], contextos: ['expressao', 'modelacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => imagem(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { a, b, c, x0, contexto } = p.dados;
      return confere(p, evidencia(a, b, c, x0), contexto === 'modelacao' ? (u) => '$' + tex(u) + '$ m' : opQ);
    },
    limites(p) {
      const { a, b, c, x0 } = p.dados;
      return dentro([a, b, c, x0], 30) && Math.abs(valorP(a, b, c, x0)) <= 200;
    },
  });

  // Objeto dada a imagem: f(x) = mx + b (abstrata) ou preço de uma viagem de táxi.
  const texDin = (v) => (ehInteiro(v) ? tex(v) : Math.abs(v).toFixed(2).replace('.', '{,}'));
  function objeto(rng, formato, contexto) {
    const taxi = contexto === 'taxi';
    let m, b, xs, y0, intro, texto;
    if (!taxi) {
      m = escolher(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
      b = escolher(rng, NAO_NULOS(9));
      xs = escolher(rng, NAO_NULOS(6));
      y0 = m * xs + b;
      intro = 'Considera a função $f$ definida por $f(x) = ' + afimTex(m, b) + '$. Qual é o objeto cuja imagem por $f$ é $' + tex(y0) + '$?';
      texto = opQ;
    } else {
      b = escolher(rng, [2, 2.5, 3, 3.5, 4]);
      m = escolher(rng, [0.5, 1, 1.5, 2]);
      xs = inteiro(rng, 4, 25);
      y0 = limpo(b + m * xs);
      intro = 'Um táxi cobra $' + texDin(b) + '$ € de bandeirada e $' + texDin(m) + '$ € por quilómetro, por isso o preço, em euros, de uma viagem de $d$ km é $P(d) = ' + tex(b) + ' + ' + (m === 1 ? '' : tex(m)) + 'd$. Uma viagem custou $' + texDin(y0) + '$ €. Quantos quilómetros tem essa viagem?';
      texto = (u) => '$' + tex(u, 2) + '$ km';
    }
    if (proximo(y0, xs)) return null;
    const resp = limpo(calc().afim(m, b - y0).zero);
    const f = taxi ? 'P' : 'f';
    const x = taxi ? 'd' : 'x';
    // No táxi os valores escrevem-se em decimal (euros e quilómetros); na função abstrata, em fração.
    const N = taxi ? (u) => tex(u, 2) : texQ;
    const maisN = (u) => (u < 0 ? ' - ' + N(-u) : ' + ' + N(u));
    const argN = (u) => (taxi || ehInteiro(u) ? N(u) : '\left(' + N(u) + '\right)');
    const coefX = (taxi && m === 1) ? x : N(m) + x;
    const exprTex = taxi ? N(b) + ' + ' + coefX : afimTex(m, b);
    const fim = ' Assim, $' + x + ' = ' + N(resp) + '$.';
    const erros = [
      { codigo: 'calculou_imagem', valor: limpo(m * y0 + b), explicacao: 'Calculaste $' + f + '(' + argN(y0) + ') = ' + N(limpo(m * y0 + b)) + '$, a imagem de $' + N(y0) + '$. Pede-se o contrário, o ' + (taxi ? 'valor de $d$' : 'objeto $x$') + ' tal que $' + f + '(' + x + ') = ' + N(y0) + '$.' + fim },
      { codigo: 'nao_trocou_sinal', valor: limpo((y0 + b) / m), explicacao: 'Passaste $' + N(b) + '$ para o outro membro sem trocar o sinal. Fica $' + coefX + ' = ' + N(y0) + maisN(-b) + ' = ' + N(y0 - b) + '$.' + fim },
      { codigo: 'dividiu_antes', valor: limpo(y0 / m - b), explicacao: 'Dividiste $' + N(y0) + '$ por $' + N(m) + '$ antes de tirar $' + N(b) + '$. Primeiro isola-se o termo em $' + x + '$, $' + coefX + ' = ' + N(y0 - b) + '$, e só depois se divide por $' + N(m) + '$.' + fim },
      { codigo: 'multiplicou_pelo_declive', valor: limpo((y0 - b) * m), explicacao: 'Multiplicaste $' + N(y0 - b) + '$ por $' + N(m) + '$. Para desfazer o produto $' + N(m) + ' \times ' + x + '$ divide-se por $' + N(m) + '$.' + fim },
    ].filter((e) => (taxi ? e.valor > 0 && decimal2(e.valor) : simples(e.valor)));
    const resolucao = [
      { passo: 'Escrever a equação', porque: 'Procura-se o ' + (taxi ? 'valor de $d$' : 'objeto') + ' cuja imagem é $' + N(y0) + '$.', calculo: exprTex + ' = ' + N(y0) },
      { passo: 'Isolar o termo em $' + x + '$', porque: 'Passa-se a parcela $' + N(b) + '$ para o outro membro, trocando-lhe o sinal.', calculo: coefX + ' = ' + N(y0) + maisN(-b) + ' = ' + N(y0 - b) },
      { passo: 'Dividir pelo coeficiente', porque: 'Dividem-se os dois membros por $' + N(m) + '$.', calculo: x + ' = \dfrac{' + N(y0 - b) + '}{' + N(m) + '} = ' + N(resp) },
    ];
    const produto = (m === 1 && taxi ? '' : N(Math.abs(m)) + ' \times ') + (taxi ? N(resp) : parQ(resp));
    const verifCalc = taxi
      ? f + '(' + N(resp) + ') = ' + N(b) + ' + ' + produto + ' = ' + N(b) + ' + ' + N(limpo(m * resp)) + ' = ' + N(limpo(b + m * resp))
      : f + '(' + argN(resp) + ') = ' + (m < 0 ? '-' : '') + produto + maisN(b) + ' = ' + N(limpo(m * resp)) + maisN(b) + ' = ' + N(limpo(b + m * resp));
    return fechar(rng, formato, { enunciado: intro, resolucao, dados: { contexto, m, b, y0 } }, {
      resposta: resp, tolerancia: 0, unidade: taxi ? 'km' : undefined, texto, erros,
      verificacao: {
        passo: 'Confirmar que a imagem de $' + N(resp) + '$ é $' + N(y0) + '$',
        calculo: verifCalc,
        valor: limpo((y0 - b) / m),
      },
    });
  }

  registar({
    subtema: 'generalidades', tipo: 'objeto', nome: 'Objeto dada a imagem',
    formatos: ['numerica', 'escolha'], contextos: ['afim', 'taxi'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => objeto(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { m, b, y0, contexto } = p.dados;
      // Pesquisa: o inteiro x com m·x + b = y0 (as respostas são inteiras).
      let x = null;
      for (let t = -60; t <= 60; t++) if (proximo(m * t + b, y0)) x = t;
      if (x === null) return false;
      return confere(p, x, contexto === 'taxi' ? (u) => '$' + tex(u, 2) + '$ km' : opQ);
    },
    limites(p) {
      const { m, b, y0 } = p.dados;
      return dentro([m, b], 10) && Math.abs(y0) <= 60 && (p.formato !== 'numerica' || Math.abs(p.resposta) <= 30);
    },
  });

  // Domínio / contradomínio de uma função de domínio finito (tabela ou expressão).
  const tabelaTex = (D, I) => '\\begin{array}{c|' + 'c'.repeat(D.length) + '} x & ' + D.map(tex).join(' & ') + ' \\\\ \\hline f(x) & ' + I.map(tex).join(' & ') + ' \\end{array}';
  const paresTex = (D, I) => '\\{' + D.map((x, i) => ptTex(x, I[i])).join(', ') + '\\}';
  function intervaloFechado(S) {
    return '$[' + tex(Math.min(...S)) + ', ' + tex(Math.max(...S)) + ']$';
  }
  // Um valor entre o mínimo e o máximo de S que não está em S (inteiro, se houver).
  function lacuna(S) {
    const o = ordenar(S);
    for (let v = o[0] + 1; v < o[o.length - 1]; v++) if (!o.some((u) => proximo(u, v))) return v;
    return limpo(o[0] + 0.5);
  }
  function dominioContradominio(rng, contexto) {
    let D, I, enunciado, pedeDominio, q;
    if (contexto === 'tabela') {
      D = ordenar(baralhar(rng, Array.from({ length: 11 }, (_, i) => i - 4)).slice(0, 5));
      I = D.map(() => inteiro(rng, -3, 9));
      const i = inteiro(rng, 0, 4);
      let j = inteiro(rng, 0, 3);
      if (j >= i) j++;
      I[j] = I[i];
      pedeDominio = rng() < 0.5;
    } else {
      D = ordenar(baralhar(rng, [-3, -2, -1, 0, 1, 2, 3]).slice(0, 5));
      q = inteiro(rng, -4, 4);
      I = D.map((x) => x * x + q);
      pedeDominio = false;
    }
    const Dimg = ordenar(I);
    // Conjunto de chegada: as imagens e mais dois valores que não são imagem.
    const fora = baralhar(rng, Array.from({ length: Dimg[Dimg.length - 1] - Dimg[0] + 5 }, (_, k) => Dimg[0] - 2 + k).filter((v) => !Dimg.includes(v))).slice(0, 2);
    const B = ordenar(Dimg.concat(fora));
    const exemploFora = fora[0];
    const S = (l) => '$' + conjTex(l) + '$';
    if (contexto === 'tabela') {
      enunciado = 'A função $f$, com conjunto de chegada $B = ' + conjTex(B) + '$, é dada pela tabela seguinte.$$' + tabelaTex(D, I) + '$$' + (pedeDominio ? 'Qual é o domínio de $f$?' : 'Qual é o contradomínio de $f$?');
    } else {
      enunciado = 'Considera a função $f$, de domínio $D = ' + conjTex(D) + '$ e conjunto de chegada $B = ' + conjTex(B) + '$, definida por $f(x) = ' + poliTex(1, 0, q) + '$. Qual é o contradomínio de $f$?';
    }
    const resolucao = [];
    let certo, erros, verif;
    if (pedeDominio) {
      certo = D;
      if (mesmoConjunto(D, Dimg) || mesmoConjunto(D, B)) return null;
      const g = lacuna(D);
      erros = [
        { codigo: 'deu_o_contradominio', texto: S(Dimg), explicacao: 'Indicaste o conjunto das imagens (a linha de $f(x)$), que é o contradomínio. O domínio é o conjunto dos objetos, a linha de $x$, $' + conjTex(D) + '$.' },
        { codigo: 'conjunto_de_chegada', texto: S(B), explicacao: 'Indicaste o conjunto de chegada $B$, onde estão as imagens. O domínio é o conjunto dos objetos, os valores de $x$ da tabela.' },
        { codigo: 'intervalo_entre_extremos', texto: intervaloFechado(D), explicacao: 'A tabela só tem ' + fmt(D.length) + ' objetos, por isso o domínio é um conjunto finito. O intervalo ' + intervaloFechado(D) + ' tem valores como $' + texQ(g) + '$, que não estão na tabela.' },
      ];
      resolucao.push({ passo: 'Ler os objetos', porque: 'O domínio é o conjunto dos objetos, os valores de $x$ na primeira linha da tabela.', calculo: 'D_f = ' + conjTex(D) });
      verif = { passo: 'Escrever $f$ como conjunto de pares (objeto, imagem) e juntar as primeiras coordenadas', calculo: 'f = ' + paresTex(D, I) + ',\\quad D_f = ' + conjTex(D), valor: S(D) };
    } else {
      certo = Dimg;
      if (mesmoConjunto(D, Dimg)) return null;
      const g = lacuna(Dimg);
      erros = [
        { codigo: 'deu_o_dominio', texto: S(D), explicacao: 'Indicaste o conjunto dos objetos, que é o domínio. O contradomínio é o conjunto das imagens, $D\'_f = ' + conjTex(Dimg) + '$.' },
        { codigo: 'conjunto_de_chegada', texto: S(B), explicacao: 'Indicaste o conjunto de chegada $B$. O contradomínio só tem os valores que são imagem de algum objeto, e $' + tex(exemploFora) + '$ está em $B$ sem ser imagem de nenhum objeto.' },
        { codigo: 'intervalo_entre_extremos', texto: intervaloFechado(Dimg), explicacao: 'O domínio é finito, por isso o contradomínio também é um conjunto finito, só com as imagens. O intervalo ' + intervaloFechado(Dimg) + ' tem valores como $' + texQ(g) + '$, que não são imagem de nenhum objeto.' },
      ];
      if (contexto === 'expressao') {
        const Ierr = ordenar(D.map((x) => (x < 0 ? -x * x : x * x) + q));
        const xn = D.find((x) => x < 0);
        if (xn !== undefined && !mesmoConjunto(Ierr, Dimg)) {
          erros.push({ codigo: 'quadrado_sem_parenteses', texto: S(Ierr), explicacao: 'Calculaste $' + tex(xn) + '^2$ como $' + tex(-xn * xn) + '$. O quadrado de um número negativo é positivo, $(' + tex(xn) + ')^2 = ' + tex(xn * xn) + '$, e as imagens são $' + conjTex(Dimg) + '$.' });
        }
        resolucao.push({ passo: 'Calcular as imagens dos objetos', porque: 'O contradomínio é o conjunto das imagens dos objetos do domínio.', calculo: '\\begin{array}{l} ' + D.map((x) => 'f(' + tex(x) + ') = ' + baseQ(x) + '^2' + maisQ(q).replace(' + 0', '') + ' = ' + tex(x * x + q)).join(' \\\\ ') + ' \\end{array}', bloco: true });
      } else {
        resolucao.push({ passo: 'Ler as imagens', porque: 'O contradomínio é o conjunto das imagens, os valores na segunda linha da tabela.', calculo: tex(I[0]) + I.slice(1).map((v) => ',\\ ' + tex(v)).join('') });
      }
      resolucao.push({ passo: 'Escrever o conjunto das imagens', porque: 'Num conjunto cada elemento escreve-se uma só vez; os valores de $B$ que não são imagem ficam de fora.', calculo: 'D\'_f = ' + conjTex(Dimg) });
      verif = { passo: 'Escrever $f$ como conjunto de pares (objeto, imagem) e juntar as segundas coordenadas', calculo: 'f = ' + paresTex(D, I) + ',\\quad D\'_f = ' + conjTex(Dimg), valor: S(Dimg) };
    }
    const ex = { enunciado, resolucao, verificacao: { passo: verif.passo, calculo: verif.calculo }, dados: { contexto, D, I, pedeDominio } };
    return fecharTexto(rng, ex, S(certo), baralhar(rng, erros), verif.valor);
  }

  registar({
    subtema: 'generalidades', tipo: 'dominio-contradominio', nome: 'Domínio e contradomínio',
    formatos: ['escolha'], contextos: ['tabela', 'expressao'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => dominioContradominio(rng, contexto));
    },
    verificarIndependente(p) {
      const { D, I, pedeDominio } = p.dados;
      // Pares (objeto, imagem): primeiras ou segundas coordenadas, sem repetições.
      const coords = D.map((x, i) => (pedeDominio ? x : I[i]));
      const unicos = [];
      for (const v of coords) if (!unicos.includes(v)) unicos.push(v);
      return chave(p.opcoes[p.correta]) === chave('$' + conjTex(unicos) + '$');
    },
    limites(p) {
      return p.dados.D.length === 5 && dentro(p.dados.D, 6) && dentro(p.dados.I, 15);
    },
  });

  // ================================================================ afim

  // Zero de f(x) = mx + b, escrita mx + b (reduzida) ou b + mx (constante primeiro).
  function afimZero(rng, formato, contexto) {
    const m = escolher(rng, NAO_NULOS(6));
    const b = escolher(rng, NAO_NULOS(9));
    const z = limpo(calc().afim(m, b).zero);
    if (formato === 'numerica' ? !decimal2(z) : !simples(z)) return null;
    const trocada = contexto === 'constante-primeiro';
    const expr = trocada ? somaTex([[b, ''], [m, 'x']]) : afimTex(m, b);
    const fim = ' O zero é $' + texQ(z) + '$.';
    const erros = [
      { codigo: 'sinal_trocado', valor: limpo(b / m), explicacao: 'Passaste $' + texQ(b) + '$ para o outro membro sem trocar o sinal. De $' + afimTex(m, b) + ' = 0$ vem $' + texQ(m) + 'x = ' + texQ(-b) + '$, logo $x = ' + texQ(z) + '$.' },
      trocada
        ? { codigo: 'declive_e_termo_trocados', valor: limpo(-m / b), explicacao: 'Tomaste $' + texQ(b) + '$ como declive e $' + texQ(m) + '$ como ordenada na origem, porque $' + texQ(b) + '$ vem primeiro. O declive é o coeficiente de $x$, $' + texQ(m) + '$, e $f(x) = ' + afimTex(m, b) + '$.' + fim }
        : { codigo: 'dividiu_ao_contrario', valor: limpo(-m / b), explicacao: 'Dividiste $' + texQ(m) + '$ por $' + texQ(b) + '$, ao contrário. De $' + texQ(m) + 'x = ' + texQ(-b) + '$ divide-se por $' + texQ(m) + '$, o coeficiente de $x$.' + fim },
      { codigo: 'ordenada_na_origem', valor: b, explicacao: '$' + texQ(b) + '$ é a ordenada na origem, $f(0)$, onde o gráfico corta o eixo $Oy$. O zero é onde o gráfico corta o eixo $Ox$, ou seja, a solução de $f(x) = 0$.' + fim },
    ];
    const resolucao = [
      { passo: 'Igualar a expressão a zero', porque: 'Os zeros de $f$ são as soluções de $f(x) = 0$.', calculo: expr + ' = 0' },
      { passo: 'Isolar o termo em $x$', porque: 'Passa-se $' + texQ(b) + '$ para o outro membro, trocando-lhe o sinal.', calculo: texQ(m) + 'x = ' + texQ(-b) },
      { passo: 'Dividir pelo declive', porque: 'Dividem-se os dois membros por $' + texQ(m) + '$, o coeficiente de $x$.', calculo: 'x = \\dfrac{' + texQ(-b) + '}{' + texQ(m) + '} = ' + texQ(z) },
    ];
    const ex = { enunciado: 'Considera a função afim $f$ definida por $f(x) = ' + expr + '$. Qual é o zero de $f$?', resolucao, dados: { contexto, m, b }, esquema: esquemaAfim(m, b) };
    return fechar(rng, formato, ex, {
      resposta: z, tolerancia: 0, texto: opQ, erros,
      verificacao: {
        passo: 'Confirmar que a imagem de $' + texQ(z) + '$ é zero',
        calculo: 'f' + argQ(z) + ' = ' + texQ(m) + ' \\times ' + parQ(z) + maisQ(b) + ' = ' + texQ(limpo(m * z)) + maisQ(b) + ' = ' + texQ(limpo(m * z + b)),
        valor: limpo(-b / m),
      },
    });
  }

  registar({
    subtema: 'afim', tipo: 'zero', nome: 'Zero de uma função afim',
    formatos: ['numerica', 'escolha'], contextos: ['reduzida', 'constante-primeiro'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => afimZero(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { m, b } = p.dados;
      // Substituição: a resposta anula f.
      if (p.formato === 'numerica') return proximo(m * p.resposta + b, 0);
      const v = fracao(-b / m);
      return !!v && proximo(m * (v.n / v.d) + b, 0) && confere(p, v.n / v.d, opQ);
    },
    limites(p) {
      return dentro([p.dados.m, p.dados.b], 9);
    },
  });

  // Declive da reta que passa por dois pontos (coordenadas ou volume de um depósito ao longo do tempo).
  function decliveDoisPontos(rng, formato, contexto) {
    const modelo = contexto === 'deposito';
    let A, B;
    if (!modelo) {
      A = [inteiro(rng, -6, 6), inteiro(rng, -6, 6)];
      B = [inteiro(rng, -6, 6), inteiro(rng, -6, 6)];
    } else {
      const t1 = inteiro(rng, 0, 4);
      const t2 = t1 + inteiro(rng, 1, 5);
      const taxa = escolher(rng, [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20]);
      const V1 = 10 * inteiro(rng, 10, 30);
      A = [t1, V1];
      B = [t2, V1 + taxa * (t2 - t1)];
      if (B[1] <= 0) return null;
    }
    const dx = B[0] - A[0];
    const dy = B[1] - A[1];
    if (dx === 0 || dy === 0) return null;
    const m = limpo(Manual.calc.geometria.equacaoReduzida(A, [dx, dy]).m);
    if (formato === 'numerica' ? !decimal2(m) : !simples(m)) return null;
    const [nA, nB] = modelo ? ['P', 'Q'] : ['A', 'B'];
    const fim = ' O declive é $' + texQ(m) + '$.';
    const erros = [
      { codigo: 'inverteu_razao', valor: limpo(dx / dy), explicacao: 'Dividiste a diferença das abcissas pela das ordenadas. O declive é a variação de $y$ a dividir pela variação de $x$, $\\dfrac{' + tex(dy) + '}{' + tex(dx) + '}$.' + fim },
      { codigo: 'subtracao_trocada', valor: limpo(-m), explicacao: 'Subtraíste por ordens diferentes, $' + tex(B[1]) + maisQ(-A[1]) + '$ em cima e $' + tex(A[0]) + maisQ(-B[0]) + '$ em baixo. As duas diferenças têm de começar no mesmo ponto, $\\dfrac{' + tex(B[1]) + maisQ(-A[1]) + '}{' + tex(B[0]) + maisQ(-A[0]) + '}$.' + fim },
    ];
    if (B[0] !== 0) {
      erros.push({ codigo: 'quociente_de_um_ponto', valor: limpo(B[1] / B[0]), explicacao: 'Dividiste a ordenada de $' + nB + '$ pela sua abcissa, $\\dfrac{' + tex(B[1]) + '}{' + tex(B[0]) + '}$. Isso só dá o declive se a reta passar pela origem, e esta não passa. Usam-se as diferenças entre os dois pontos.' + fim });
    }
    const errosOk = erros.filter((e) => simples(e.valor));
    const intro = modelo
      ? 'O volume de água num depósito, em litros, varia de forma linear com o tempo, em horas. Às $' + tex(A[0]) + '$ h o depósito tinha $' + tex(A[1]) + '$ L e às $' + tex(B[0]) + '$ h tinha $' + tex(B[1]) + '$ L. No gráfico do volume em função do tempo estão os pontos $P' + ptTex(A[0], A[1]) + '$ e $Q' + ptTex(B[0], B[1]) + '$. Qual é o declive da reta $PQ$?'
      : 'Uma função afim $f$ tem um gráfico que passa pelos pontos $A' + ptTex(A[0], A[1]) + '$ e $B' + ptTex(B[0], B[1]) + '$. Qual é o declive do gráfico de $f$?';
    const resolucao = [
      { passo: 'Escrever a fórmula do declive', porque: 'O declive é a variação das ordenadas a dividir pela variação das abcissas, entre dois pontos da reta.', calculo: 'm = \\dfrac{y_{' + nB + '} - y_{' + nA + '}}{x_{' + nB + '} - x_{' + nA + '}}' },
      { passo: 'Substituir e calcular', porque: 'As duas diferenças fazem-se pela mesma ordem, de ' + nA + ' para ' + nB + '.', calculo: 'm = \\dfrac{' + tex(B[1]) + ' - ' + parQ(A[1]) + '}{' + tex(B[0]) + ' - ' + parQ(A[0]) + '} = \\dfrac{' + tex(dy) + '}{' + tex(dx) + '} = ' + texQ(m) },
    ];
    if (modelo) resolucao.push({ passo: 'Interpretar', porque: 'O declive é a variação do volume por hora: ' + (m < 0 ? 'o depósito perde ' + fmt(-m) : 'o depósito ganha ' + fmt(m)) + ' litros por hora.' });
    const bb = limpo(A[1] - m * A[0]);
    const ex = { enunciado: intro, resolucao, dados: { contexto, A, B } };
    return fechar(rng, formato, ex, {
      resposta: m, tolerancia: 0, texto: opQ, erros: errosOk,
      verificacao: {
        passo: 'Confirmar que a reta $y = ' + texQ(m) + 'x' + (bb === 0 ? '' : maisQ(bb)) + '$, que passa em ' + nA + ', também passa em ' + nB,
        calculo: 'b = ' + tex(A[1]) + ' - ' + parQ(m) + ' \\times ' + parQ(A[0]) + ' = ' + texQ(bb) + ',\\quad ' + parQ(m) + ' \\times ' + parQ(B[0]) + maisQ(bb) + ' = ' + texQ(limpo(m * B[0] + bb)) + ' = y_{' + nB + '}',
        valor: limpo((A[1] - B[1]) / (A[0] - B[0])),
      },
    });
  }

  registar({
    subtema: 'afim', tipo: 'declive-dois-pontos', nome: 'Declive a partir de dois pontos',
    formatos: ['numerica', 'escolha'], contextos: ['pontos', 'deposito'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => decliveDoisPontos(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const [A, B] = [p.dados.A, p.dados.B];
      // A reta de declive m que passa em A tem de passar em B.
      const m = p.formato === 'numerica' ? p.resposta : (() => {
        const t = String(p.opcoes[p.correta]).replace(/\$/g, '');
        const f = t.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/);
        if (f) return (f[1] ? -1 : 1) * Number(f[2]) / Number(f[3]);
        return Number(t);
      })();
      return Number.isFinite(m) && proximo(A[1] + m * (B[0] - A[0]), B[1]);
    },
    limites(p) {
      return dentro(p.dados.A.concat(p.dados.B), p.dados.contexto === 'deposito' ? 500 : 6);
    },
  });

  // Sinal (escolha) e monotonia/sinal (vf) de f(x) = mx + b.
  function afimSinalMonotonia(rng, formato, contexto) {
    const m = escolher(rng, NAO_NULOS(5));
    const b = escolher(rng, NAO_NULOS(8));
    const F = calc().afim(m, b);
    const z = limpo(F.zero);
    if (!simples(z)) return null;
    const trocada = contexto === 'constante-primeiro';
    const expr = trocada ? somaTex([[b, ''], [m, 'x']]) : afimTex(m, b);
    const sg = escolher(rng, ['>', '<', '>=', '<=']);
    const quer = sg[0] === '>' ? 1 : -1;
    const fechado = sg.length === 2;
    // Do lado direito do zero, f tem o sinal de m.
    const direita = sinal(m) === quer;
    const certo = semiReta(z, direita, fechado);
    const ineq = 'f(x) ' + SIMBOLO[sg] + ' 0';
    const mon = F.monotonia;
    const fim = ' Como $m = ' + texQ(m) + '$, $f$ é ' + mon + ' e $' + ineq + '$ para $x \\in ' + intervaloTex(certo) + '$.';
    const erros = [];
    if (trocada) {
      const z2 = limpo(-m / b);
      const dir2 = sinal(b) === quer;
      erros.push({ codigo: 'declive_e_termo_trocados', I: semiReta(z2, dir2, fechado), mon: b > 0 ? 'crescente' : 'decrescente', explicacao: 'Tomaste $' + texQ(b) + '$ como declive porque vem primeiro. O declive é o coeficiente de $x$, $' + texQ(m) + '$, e o zero é $' + texQ(z) + '$.' + fim });
    }
    erros.push(
      { codigo: 'lado_trocado', I: semiReta(z, !direita, fechado), explicacao: 'Escolheste o lado errado do zero. Como $f$ é ' + mon + ', ' + (direita ? 'à direita' : 'à esquerda') + ' do zero tem ' + (quer > 0 ? 'imagens positivas' : 'imagens negativas') + '.' + fim },
      { codigo: 'zero_com_sinal_trocado', I: semiReta(-z, direita, fechado), explicacao: 'O zero é $' + texQ(z) + '$, não $' + texQ(-z) + '$. De $' + texQ(m) + 'x' + maisQ(b) + ' = 0$ vem $x = ' + texQ(z) + '$.' + fim },
      { codigo: 'extremo_errado', I: semiReta(z, direita, !fechado), explicacao: 'Em $x = ' + texQ(z) + '$ tem-se $f(x) = 0$, que ' + (fechado ? 'satisfaz' : 'não satisfaz') + ' $' + ineq + '$, por isso o zero ' + (fechado ? 'pertence' : 'não pertence') + ' ao conjunto (intervalo ' + (fechado ? 'fechado' : 'aberto') + ' nesse extremo).' + fim },
    );
    if (!proximo(b, z)) {
      erros.push({ codigo: 'ordenada_como_fronteira', I: semiReta(b, direita, fechado), explicacao: 'Usaste a ordenada na origem, $' + texQ(b) + '$, como fronteira. O sinal muda no zero de $f$, $x = ' + texQ(z) + '$, onde o gráfico corta o eixo $Ox$.' + fim });
    }
    // Pontos de teste, um de cada lado do zero.
    const tE = Math.floor(z) - 1;
    const tD = Math.ceil(z) + 1;
    const fE = limpo(m * tE + b);
    const fD = limpo(m * tD + b);
    const verifIntervalo = () => {
      const lado = sinal(fD) === quer;
      return semiReta(z, lado, fechado);
    };
    const testeTex = 'f(' + tex(tE) + ') = ' + texQ(fE) + (fE > 0 ? ' > 0' : ' < 0') + ',\\quad f' + argQ(z) + ' = 0,\\quad f(' + tex(tD) + ') = ' + texQ(fD) + (fD > 0 ? ' > 0' : ' < 0');
    const resolucao = [
      { passo: 'Calcular o zero', porque: 'O sinal de uma função afim só pode mudar no zero.', calculo: expr + ' = 0 \\Leftrightarrow ' + texQ(m) + 'x = ' + texQ(-b) + ' \\Leftrightarrow x = ' + texQ(z) },
      { passo: 'Ver a monotonia', porque: 'O declive é o coeficiente de $x$, $m = ' + texQ(m) + '$; como $m ' + (m > 0 ? '> 0' : '< 0') + '$, $f$ é ' + mon + '.', calculo: 'm = ' + texQ(m) },
      { passo: 'Ler o sinal', porque: 'Sendo ' + mon + ', $f$ é ' + (m > 0 ? 'negativa antes do zero e positiva depois' : 'positiva antes do zero e negativa depois') + '; ' + (fechado ? 'o zero entra porque a desigualdade é larga.' : 'o zero fica de fora porque a desigualdade é estrita.'), calculo: ineq + ' \\Leftrightarrow x \\in ' + intervaloTex(certo) },
    ];
    const dados = { contexto, m, b, sg };
    const ex = { resolucao, esquema: esquemaAfim(m, b) };
    if (formato === 'vf') {
      const tipo = rng() < 0.5 ? 'monotonia' : 'sinal';
      const enunciadoBase = 'Considera a função afim $f$ definida por $f(x) = ' + expr + '$.';
      if (tipo === 'monotonia' && sinal(b) !== sinal(m)) {
        const outra = mon === 'crescente' ? 'decrescente' : 'crescente';
        const erro = trocada
          ? { codigo: 'declive_e_termo_trocados', explicacao: 'Olhaste para $' + texQ(b) + '$, que vem primeiro, como se fosse o declive. O declive é o coeficiente de $x$, $m = ' + texQ(m) + '$, por isso $f$ é ' + mon + '.' }
          : { codigo: 'monotonia_pelo_b', explicacao: 'O sinal da ordenada na origem, $b = ' + texQ(b) + '$, não diz nada sobre a monotonia. Ela depende do declive, $m = ' + texQ(m) + '$, por isso $f$ é ' + mon + '.' };
        const v = AJ.vfDe(rng, '$f$ é ' + mon + '.', '$f$ é ' + outra + '.', erro);
        const afirmado = v.correta ? mon : outra;
        const f0 = b;
        const f1 = limpo(m + b);
        return Object.assign(ex, {
          enunciado: enunciadoBase + ' Afirmação: «' + v.enunciado + '»', correta: v.correta, errosTipicos: v.errosTipicos,
          resolucao: resolucao.slice(1, 2),
          verificacao: { passo: 'Comparar duas imagens, $f(0)$ e $f(1)$', calculo: 'f(0) = ' + texQ(f0) + ',\\quad f(1) = ' + texQ(f1) + ',\\quad f(1) ' + (f1 > f0 ? '>' : '<') + ' f(0)', valor: (f1 > f0 ? 'crescente' : 'decrescente') === afirmado },
          dados: Object.assign(dados, { tipo, afirmado }),
        });
      }
      const er = escolher(rng, erros.filter((e) => intervaloTex(e.I) !== intervaloTex(certo)));
      const afirma = (I) => '$' + ineq + '$ se e só se $x \\in ' + intervaloTex(I) + '$.';
      const v = AJ.vfDe(rng, afirma(certo), afirma(er.I), { codigo: er.codigo, explicacao: er.explicacao });
      const afirmado = intervaloTex(v.correta ? certo : er.I);
      return Object.assign(ex, {
        enunciado: enunciadoBase + ' Afirmação: «' + v.enunciado + '»', correta: v.correta, errosTipicos: v.errosTipicos,
        verificacao: { passo: 'Confirmar com um valor de cada lado do zero', calculo: testeTex, valor: intervaloTex(verifIntervalo()) === afirmado },
        dados: Object.assign(dados, { tipo: 'sinal', afirmado }),
      });
    }
    const opErros = (trocada ? erros.slice(0, 1).concat(baralhar(rng, erros.slice(1))) : baralhar(rng, erros))
      .map((e) => ({ codigo: e.codigo, texto: opUniao([e.I]), explicacao: e.explicacao }));
    return fecharTexto(rng, Object.assign(ex, {
      enunciado: 'Considera a função afim $f$ definida por $f(x) = ' + expr + '$. Qual é o conjunto dos valores de $x$ para os quais $' + ineq + '$?',
      verificacao: { passo: 'Confirmar com um valor de cada lado do zero', calculo: testeTex },
      dados,
    }), opUniao([certo]), opErros, opUniao([verifIntervalo()]));
  }

  // Conjunto-solução de mx + b (sinal) ≷ 0 por pontos de teste (outro método).
  function sinalPorTeste(m, b, sg) {
    const z = -b / m;
    const quer = sg[0] === '>' ? 1 : -1;
    const lado = sinal(m * (z + 1) + b) === quer;
    return semiReta(limpo(z), lado, sg.length === 2);
  }

  registar({
    subtema: 'afim', tipo: 'sinal-monotonia', nome: 'Sinal e monotonia de uma função afim',
    formatos: ['escolha', 'vf'], contextos: ['reduzida', 'constante-primeiro'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => afimSinalMonotonia(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { m, b, sg, tipo, afirmado } = p.dados;
      if (p.formato === 'vf') {
        if (tipo === 'monotonia') return p.correta === ((m + b > b ? 'crescente' : 'decrescente') === afirmado);
        return p.correta === (intervaloTex(sinalPorTeste(m, b, sg)) === afirmado);
      }
      return chave(p.opcoes[p.correta]) === chave(opUniao([sinalPorTeste(m, b, sg)]));
    },
    limites(p) {
      return dentro([p.dados.m, p.dados.b], 9);
    },
  });

  // ================================================================ quadratica

  const COEF_A = [-3, -2, -1, 1, 2, 3];
  // Δ = b² − 4ac, escrito com os valores.
  function deltaTex(a, b, c) {
    const d = limpo(b * b - 4 * a * c);
    return '\\Delta = ' + baseQ(b) + '^2 - 4 \\times ' + parQ(a) + ' \\times ' + parQ(c) + ' = ' + texQ(b * b) + maisQ(limpo(-4 * a * c)) + ' = ' + texQ(d);
  }

  // Vértice de ax² + bx + c (forma geral) ou de a(x − h)² + k (forma canónica).
  function quadraticaVertice(rng, formato, contexto) {
    const a = escolher(rng, COEF_A);
    const h = escolher(rng, NAO_NULOS(4));
    const k = inteiro(rng, -6, 6);
    const { b, c } = calc().canonicaParaGeral(a, h, k);
    const Q = calc().quadratica(a, b, c);
    const V = Q.vertice.map(limpo);
    const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
    const f = (x) => valorP(a, b, c, x);
    const fim = ' O vértice é $' + ptTex(V[0], V[1]) + '$.';
    const canon = contexto === 'canonica';
    const expr = canon ? canonicaTex(a, h, k) : poliTex(a, b, c);
    let resolucao, erros, verif;
    if (!canon) {
      resolucao = [
        { passo: 'Calcular a abcissa do vértice', porque: 'A abcissa do vértice é $h = -\\dfrac{b}{2a}$; aqui $a = ' + tex(a) + '$ e $b = ' + tex(b) + '$.', calculo: 'h = -\\dfrac{' + tex(b) + '}{2 \\times ' + parQ(a) + '} = -\\dfrac{' + tex(b) + '}{' + tex(2 * a) + '} = ' + tex(V[0]) },
        { passo: 'Calcular a ordenada do vértice', porque: 'A ordenada do vértice é a imagem de $h$, $k = f(h)$.', calculo: substituicaoTex('f', a, b, c, V[0]) },
      ];
      erros = [
        { codigo: 'sinal_de_h', P: [-h, f(-h)], explicacao: 'Esqueceste o sinal menos em $h = -\\dfrac{b}{2a}$ e obtiveste $' + tex(-h) + '$ em vez de $h = -\\dfrac{' + tex(b) + '}{' + tex(2 * a) + '} = ' + tex(h) + '$.' + fim },
        { codigo: 'esqueceu_2_no_denominador', P: [2 * h, f(2 * h)], explicacao: 'Dividiste $-b$ só por $a$, o que dá $' + tex(2 * h) + '$. A fórmula é $h = -\\dfrac{b}{2a} = -\\dfrac{' + tex(b) + '}{' + tex(2 * a) + '} = ' + tex(h) + '$.' + fim },
        { codigo: 'ordenada_igual_a_c', P: [h, c], explicacao: 'Tomaste o termo independente, $c = ' + tex(c) + '$, como ordenada do vértice. $c = f(0)$ é onde o gráfico corta o eixo $Oy$; a ordenada do vértice é $f(' + tex(h) + ') = ' + tex(k) + '$.' + fim },
      ];
      if (k !== 0) {
        erros.push({ codigo: 'delta_sem_sinal', P: [h, -k], explicacao: 'Calculaste a ordenada como $\\dfrac{\\Delta}{4a}$, sem o sinal menos. A fórmula é $k = -\\dfrac{\\Delta}{4a}$, e $f(' + tex(h) + ') = ' + tex(k) + '$ confirma.' + fim });
      }
      const fe = f(h - 1);
      const fd = f(h + 1);
      verif = {
        passo: 'Confirmar o eixo de simetria com dois pontos à mesma distância de $x = ' + tex(h) + '$, e a ordenada com $k = -\\dfrac{\\Delta}{4a}$',
        calculo: '\\begin{array}{l} f(' + tex(h - 1) + ') = ' + tex(fe) + ',\\quad f(' + tex(h + 1) + ') = ' + tex(fd) + ' \\\\ ' + deltaTex(a, b, c) + ',\\quad k = -\\dfrac{' + tex(Q.delta) + '}{4 \\times ' + parQ(a) + '} = ' + tex(limpo(-Q.delta / (4 * a))) + ' \\end{array}',
        P: [limpo((h - 1 + h + 1) / 2), limpo(-Q.delta / (4 * a))],
      };
      if (!proximo(fe, fd)) return null;
    } else {
      resolucao = [
        { passo: 'Comparar com $a(x - h)^2 + k$', porque: 'Na forma canónica o vértice é $(h, k)$. ' + (h < 0 ? '$(x + ' + tex(-h) + ')$ é $(x - (' + tex(h) + '))$, logo $h = ' + tex(h) + '$.' : '$(x - ' + tex(h) + ')$ dá $h = ' + tex(h) + '$.'), calculo: 'h = ' + tex(h) + ',\\quad k = ' + tex(k) },
      ];
      erros = [
        { codigo: 'sinal_de_h', P: [-h, k], explicacao: 'Leste $h$ com o sinal trocado. Em $a(x - h)^2$ o vértice está em $x = h$, e ' + (h < 0 ? '$(x + ' + tex(-h) + ')$ corresponde a $h = ' + tex(h) + '$.' : '$(x - ' + tex(h) + ')$ corresponde a $h = ' + tex(h) + '$.') + fim },
        { codigo: 'coordenadas_trocadas', P: [k, h], explicacao: 'Trocaste as coordenadas. A abcissa do vértice é $h$ (dentro do parênteses) e a ordenada é $k$ (a parcela de fora).' + fim },
      ];
      if (k !== 0) erros.push({ codigo: 'ambos_os_sinais_trocados', P: [-h, -k], explicacao: 'Trocaste os dois sinais. Só $h$ aparece com o sinal trocado dentro do parênteses; $k$ lê-se tal como está, $' + tex(k) + '$.' + fim });
      const G2 = calc().canonicaParaGeral(a, h, k);
      const hh = limpo(-G2.b / (2 * a));
      verif = {
        passo: 'Desenvolver a expressão e usar $h = -\\dfrac{b}{2a}$ e $k = f(h)$',
        calculo: 'f(x) = ' + poliTex(a, G2.b, G2.c) + ',\\quad h = -\\dfrac{' + tex(G2.b) + '}{' + tex(2 * a) + '} = ' + tex(hh) + ',\\quad ' + substituicaoTex('f', a, G2.b, G2.c, hh),
        P: [hh, valorP(a, G2.b, G2.c, hh)],
      };
    }
    const ex = {
      enunciado: 'Considera a função quadrática $f$ definida por $f(x) = ' + expr + '$. ' + pedidoVertice(formato, eixo, 'do vértice do gráfico de $f$'),
      resolucao, dados: { contexto, a, h, k, eixo }, esquema: esquemaParabola(a, h, k, false),
    };
    return fecharPonto(rng, formato, ex, { certo: V, eixo, erros: baralhar(rng, erros), verificacao: verif });
  }

  registar({
    subtema: 'quadratica', tipo: 'vertice', nome: 'Vértice da parábola',
    formatos: ['numerica', 'escolha'], contextos: ['geral', 'canonica'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => quadraticaVertice(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { a, h, k } = p.dados;
      const { b, c } = calc().canonicaParaGeral(a, h, k);
      // Simetria: a abcissa do vértice é o ponto médio de dois objetos com a mesma imagem (as raízes de f(x) = c).
      const x2 = -b / a; // f(0) = f(−b/a) = c
      const hv = limpo(x2 / 2);
      return proximo(valorP(a, b, c, 0), valorP(a, b, c, x2)) && confereVertice(p, [hv, valorP(a, b, c, hv)]);
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.h, p.dados.k], 6);
    },
  });

  // Zeros: equação completa (resolvente) ou incompleta (b = 0 ou c = 0).
  function fracaoAleatoria(rng, dens) {
    const q = escolher(rng, dens);
    let p;
    do { p = inteiro(rng, -5 * q, 5 * q); } while (p === 0 || mdc(p, q) !== 1);
    return { p, q };
  }
  // ax² + bx + c com zeros p1/q1 e p2/q2: s·k·(q1x − p1)(q2x − p2).
  function comZeros(rng, dens) {
    const r1 = fracaoAleatoria(rng, dens);
    const r2 = fracaoAleatoria(rng, dens);
    const v1 = r1.p / r1.q, v2 = r2.p / r2.q;
    if (proximo(v1, v2) || proximo(v1, -v2)) return null;
    if (Math.abs(v1) > 6 || Math.abs(v2) > 6) return null;
    const s = rng() < 0.5 ? 1 : -1;
    const k = r1.q === 1 && r2.q === 1 ? escolher(rng, [1, 2]) : 1;
    const a = s * k * r1.q * r2.q;
    const b = -s * k * (r1.q * r2.p + r2.q * r1.p);
    const c = s * k * r1.p * r2.p;
    if (Math.abs(a) > 9 || Math.abs(b) > 40 || Math.abs(c) > 40) return null;
    return { a, b, c, zeros: ordenar([v1, v2]) };
  }
  // Raízes racionais de ax² + bx + c (null se Δ não for quadrado perfeito; [] se Δ < 0).
  function raizesRacionais(a, b, c) {
    const d = limpo(b * b - 4 * a * c);
    if (d < 0) return [];
    const r = Math.round(Math.sqrt(d));
    if (r * r !== d) return null;
    return ordenar([(-b - r) / (2 * a), (-b + r) / (2 * a)]);
  }
  function resolventeTex(a, b, c) {
    const d = limpo(b * b - 4 * a * c);
    const r = Math.sqrt(d);
    const x1 = limpo((-b - r) / (2 * a));
    const x2 = limpo((-b + r) / (2 * a));
    return 'x = \\dfrac{-' + parQ(b) + ' \\pm \\sqrt{' + tex(d) + '}}{2 \\times ' + parQ(a) + '} = \\dfrac{' + tex(-b) + ' \\pm ' + tex(r) + '}{' + tex(2 * a) + '} \\Leftrightarrow x = ' + texQ(x1) + ' \\vee x = ' + texQ(x2);
  }
  // Substituição de cada valor na expressão (verificação), em array.
  const substituicoesTex = (nome, a, b, c, S) => '\\begin{array}{l} ' + S.map((r) => substituicaoTex(nome, a, b, c, r)).join(' \\\\ ') + ' \\end{array}';

  function quadraticaZeros(rng, formato, contexto) {
    let a, b, c, certo, resolucao, erros, pega, pergunta;
    const fimZ = (S) => ' Os zeros são ' + (S.length === 2 ? '$' + texQ(S[0]) + '$ e $' + texQ(S[1]) + '$' : '$' + texQ(S[0]) + '$') + '.';
    if (contexto === 'completa') {
      const P = comZeros(rng, formato === 'numerica' ? [1, 1, 2] : [1, 1, 2, 3]);
      if (!P) return null;
      ({ a, b, c } = P);
      certo = calc().quadratica(a, b, c).zeros.map(limpo);
      if (!mesmoConjunto(certo, P.zeros)) return null;
      const d = limpo(b * b - 4 * a * c);
      const r = Math.sqrt(d);
      const fim = fimZ(certo);
      erros = [
        { codigo: 'sinais_trocados', S: certo.map((x) => -x), explicacao: 'Usaste $b$ em vez de $-b$ na fórmula resolvente. O numerador é $-b \\pm \\sqrt{\\Delta} = ' + tex(-b) + ' \\pm ' + tex(r) + '$.' + fim },
        { codigo: 'dividiu_so_por_a', S: certo.map((x) => 2 * x), explicacao: 'Dividiste por $a = ' + tex(a) + '$ em vez de $2a = ' + tex(2 * a) + '$. O denominador da fórmula resolvente é $2a$.' + fim },
        { codigo: 'dividiu_so_a_raiz', S: [limpo(-b - r / (2 * a)), limpo(-b + r / (2 * a))], explicacao: 'Dividiste só $\\sqrt{\\Delta}$ por $2a$. A fração $\\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$ divide o numerador todo, $' + tex(-b) + ' \\pm ' + tex(r) + '$, por $' + tex(2 * a) + '$.' + fim },
      ];
      const errado = raizesRacionais(a, b, -c);
      if (errado && !mesmoConjunto(errado, certo)) {
        erros.push({ codigo: 'sinal_de_4ac', S: errado, explicacao: 'Calculaste $\\Delta = b^2 + 4ac = ' + tex(limpo(b * b + 4 * a * c)) + '$, com o sinal de $4ac$ trocado. $\\Delta = b^2 - 4ac = ' + tex(d) + '$.' + (errado.length ? '' : ' Com $\\Delta < 0$ concluíste que não há zeros, mas há.') + fim });
      }
      resolucao = [
        { passo: 'Calcular o discriminante', porque: 'Com $a = ' + tex(a) + '$, $b = ' + tex(b) + '$ e $c = ' + tex(c) + '$, $\\Delta = b^2 - 4ac$ diz quantos zeros há.', calculo: deltaTex(a, b, c) },
        { passo: 'Aplicar a fórmula resolvente', porque: 'Como $\\Delta > 0$, há dois zeros, $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.', calculo: resolventeTex(a, b, c), bloco: true },
      ];
      const qual = rng() < 0.5 ? 'maior' : 'menor';
      pega = qual === 'maior' ? maior : menor;
      pergunta = formato === 'numerica' ? 'Qual é o ' + qual + ' zero de $f$?' : 'Qual é o conjunto dos zeros de $f$?';
    } else if (rng() < 0.5) {
      // c = 0: x(ax + b) = 0.
      a = escolher(rng, COEF_A);
      b = escolher(rng, NAO_NULOS(9));
      c = 0;
      const z = limpo(-b / a);
      if (formato === 'numerica' ? !decimal2(z) : !simples(z)) return null;
      certo = calc().quadratica(a, b, c).zeros.map(limpo);
      const fim = fimZ(certo);
      erros = [
        { codigo: 'perdeu_zero_nulo', S: [z], explicacao: 'Dividiste os dois membros por $x$ e perdeste a solução $x = 0$. Põe-se $x$ em evidência, $x(' + afimTex(a, b) + ') = 0$, e pela lei do anulamento do produto $x = 0$ ou $' + afimTex(a, b) + ' = 0$.' + fim },
        { codigo: 'sinal_trocado', S: [0, limpo(b / a)], explicacao: 'Em $' + afimTex(a, b) + ' = 0$ passaste $' + texQ(b) + '$ para o outro membro sem trocar o sinal. Fica $' + texQ(a) + 'x = ' + texQ(-b) + '$.' + fim },
        { codigo: 'dividiu_ao_contrario', S: [0, limpo(-a / b)], explicacao: 'Em $' + texQ(a) + 'x = ' + texQ(-b) + '$ dividiste $' + texQ(a) + '$ por $' + texQ(-b) + '$. Divide-se pelo coeficiente de $x$, $x = \\dfrac{' + texQ(-b) + '}{' + texQ(a) + '} = ' + texQ(z) + '$.' + fim },
      ];
      resolucao = [
        { passo: 'Pôr $x$ em evidência', porque: 'Não há termo independente, por isso $x$ é fator comum.', calculo: poliTex(a, b, 0) + ' = 0 \\Leftrightarrow x(' + afimTex(a, b) + ') = 0' },
        { passo: 'Usar a lei do anulamento do produto', porque: 'Um produto é zero quando algum dos fatores é zero.', calculo: 'x = 0 \\vee ' + afimTex(a, b) + ' = 0 \\Leftrightarrow x = 0 \\vee x = ' + texQ(z) },
      ];
      pega = (S) => { const nz = S.filter((x) => !proximo(x, 0)); return nz.length === 1 ? nz[0] : NaN; };
      pergunta = formato === 'numerica' ? 'Um dos zeros de $f$ é $0$. Qual é o outro?' : 'Qual é o conjunto dos zeros de $f$?';
    } else {
      // b = 0: ax² + c = 0, com x² = s².
      a = escolher(rng, COEF_A);
      const s = inteiro(rng, 1, 6);
      b = 0;
      c = -a * s * s;
      certo = calc().quadratica(a, b, c).zeros.map(limpo);
      const fim = fimZ(certo);
      erros = [
        { codigo: 'so_raiz_positiva', S: [s], explicacao: 'De $x^2 = ' + tex(s * s) + '$ ficaste só com $x = ' + tex(s) + '$. Também $(' + tex(-s) + ')^2 = ' + tex(s * s) + '$, por isso $x = \\pm\\sqrt{' + tex(s * s) + '}$.' + fim },
        { codigo: 'esqueceu_raiz', S: [-s * s, s * s], explicacao: 'De $x^2 = ' + tex(s * s) + '$ escreveste $x = \\pm ' + tex(s * s) + '$, sem a raiz quadrada. $x = \\pm\\sqrt{' + tex(s * s) + '} = \\pm ' + tex(s) + '$.' + fim },
        { codigo: 'dividiu_por_2', S: [limpo(-s * s / 2), limpo(s * s / 2)], explicacao: 'De $x^2 = ' + tex(s * s) + '$ dividiste $' + tex(s * s) + '$ por 2. O expoente 2 desfaz-se com a raiz quadrada, $x = \\pm\\sqrt{' + tex(s * s) + '} = \\pm ' + tex(s) + '$.' + fim },
        { codigo: 'sinal_ao_isolar', S: [], explicacao: 'Ao passar $' + tex(c) + '$ para o outro membro não trocaste o sinal e ficaste com $x^2 = ' + tex(-s * s) + '$, sem soluções. Fica $' + texQ(a) + 'x^2 = ' + tex(-c) + '$, $x^2 = ' + tex(s * s) + '$.' + fim },
      ];
      resolucao = [
        { passo: 'Isolar $x^2$', porque: 'Não há termo em $x$, por isso isola-se $x^2$.', calculo: poliTex(a, 0, c) + ' = 0 \\Leftrightarrow ' + texQ(a) + 'x^2 = ' + tex(-c) + ' \\Leftrightarrow x^2 = ' + tex(s * s) },
        { passo: 'Tirar a raiz quadrada', porque: 'Há dois números com quadrado $' + tex(s * s) + '$, um positivo e um negativo.', calculo: 'x = -\\sqrt{' + tex(s * s) + '} \\vee x = \\sqrt{' + tex(s * s) + '} \\Leftrightarrow x = ' + tex(-s) + ' \\vee x = ' + tex(s) },
      ];
      pega = (S) => { const pos = S.filter((x) => x > 0); return pos.length === 1 ? pos[0] : NaN; };
      pergunta = formato === 'numerica' ? 'Qual é o zero positivo de $f$?' : 'Qual é o conjunto dos zeros de $f$?';
    }
    const S = raizesRacionais(a, b, c);
    const ex = { enunciado: 'Considera a função $f$ definida por $f(x) = ' + poliTex(a, b, c) + '$. ' + pergunta, resolucao, dados: { contexto, a, b, c, pega: pergunta } };
    return fecharConjunto(rng, formato, ex, {
      certo, pega, erros: baralhar(rng, erros),
      verificacao: { passo: 'Confirmar que as imagens dos zeros são nulas', calculo: substituicoesTex('f', a, b, c, S), S },
    });
  }

  // Conjunto dos zeros por pesquisa nas frações p/q (q ≤ 6) que anulam a expressão (outro método).
  function zerosPorPesquisa(a, b, c) {
    const S = [];
    for (let q = 1; q <= 6; q++) {
      for (let p = -60; p <= 60; p++) {
        const x = p / q;
        if (Math.abs(a * x * x + b * x + c) < 1e-9 && !S.some((u) => proximo(u, x))) S.push(x);
      }
    }
    return ordenar(S);
  }

  registar({
    subtema: 'quadratica', tipo: 'zeros', nome: 'Zeros de uma função quadrática',
    formatos: ['numerica', 'escolha'], contextos: ['completa', 'incompleta'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => quadraticaZeros(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { a, b, c } = p.dados;
      const S = zerosPorPesquisa(a, b, c);
      if (p.formato === 'escolha') return confereConjunto(p, S);
      const pergunta = p.dados.pega;
      const valor = /maior/.test(pergunta) ? maior(S) : /menor/.test(pergunta) ? menor(S)
        : /positivo/.test(pergunta) ? S.find((x) => x > 0) : S.find((x) => !proximo(x, 0));
      return Math.abs(p.resposta - valor) <= p.tolerancia + 1e-9;
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.b, p.dados.c], 108);
    },
  });

  // Contradomínio (escolha), a partir da forma geral ou da canónica.
  function quadraticaContradominio(rng, contexto) {
    const a = escolher(rng, COEF_A);
    const h = escolher(rng, NAO_NULOS(4));
    const k = escolher(rng, NAO_NULOS(6));
    const canon = contexto === 'canonica';
    const { b, c } = calc().canonicaParaGeral(a, h, k);
    const Q = calc().quadratica(a, b, c);
    const kk = limpo(Q.extremo.valor);
    const cima = a > 0;
    const D = (x, aberto = false) => (cima ? { de: x, ate: Infinity, fechadoDe: !aberto, fechadoAte: false } : { de: -Infinity, ate: x, fechadoDe: false, fechadoAte: !aberto });
    const certo = D(kk);
    const fim = ' Como $a ' + (cima ? '> 0' : '< 0') + '$, $' + tex(kk) + '$ é o ' + (cima ? 'mínimo' : 'máximo') + ' e $D\'_f = ' + intervaloTex(certo) + '$.';
    const erros = [];
    if (!canon && c !== kk) erros.push({ codigo: 'usou_c', I: D(c), explicacao: 'Usaste o termo independente, $c = ' + tex(c) + '$, que é $f(0)$. O contradomínio depende da ordenada do vértice, $k = f(' + tex(h) + ') = ' + tex(kk) + '$.' + fim });
    if (canon && h !== k) erros.push({ codigo: 'usou_h', I: D(h), explicacao: 'Usaste $h = ' + tex(h) + '$, a abcissa do vértice. O contradomínio lê-se no eixo $Oy$, a partir da ordenada do vértice, $k = ' + tex(kk) + '$.' + fim });
    if (canon) erros.push({ codigo: 'sinal_de_k', I: D(-k), explicacao: 'Trocaste o sinal de $k$. Na forma $a(x - h)^2 + k$ só $h$ aparece com o sinal trocado; $k = ' + tex(k) + '$ lê-se tal como está.' + fim });
    erros.push(
      { codigo: 'concavidade_trocada', I: cima ? { de: -Infinity, ate: kk, fechadoDe: false, fechadoAte: true } : { de: kk, ate: Infinity, fechadoDe: true, fechadoAte: false }, explicacao: 'Trocaste o sentido. Com $a = ' + tex(a) + '$ a concavidade está voltada para ' + (cima ? 'cima' : 'baixo') + ' e o vértice é o ponto mais ' + (cima ? 'baixo' : 'alto') + ' do gráfico.' + fim },
      { codigo: 'intervalo_aberto', I: D(kk, true), explicacao: 'Deixaste $' + tex(kk) + '$ de fora, mas $f(' + tex(h) + ') = ' + tex(kk) + '$ é uma imagem, por isso o intervalo é fechado em $' + tex(kk) + '$.' + fim },
      { codigo: 'todos_os_reais', I: { de: -Infinity, ate: Infinity }, explicacao: '$\\mathbb{R}$ é o domínio de $f$. As imagens de uma função quadrática ficam todas de um só lado do extremo.' + fim },
    );
    const expr = canon ? canonicaTex(a, h, k) : poliTex(a, b, c);
    const resolucao = canon
      ? [
        { passo: 'Ler o vértice', porque: 'Na forma $a(x - h)^2 + k$ o vértice é $(h, k)$.', calculo: 'V' + ptTex(h, k) },
        { passo: 'Ver a concavidade', porque: 'Com $a = ' + tex(a) + '$, a concavidade está voltada para ' + (cima ? 'cima e $k$ é o mínimo.' : 'baixo e $k$ é o máximo.'), calculo: "D'_f = " + intervaloTex(certo) },
      ]
      : [
        { passo: 'Calcular a abcissa do vértice', porque: '$h = -\\dfrac{b}{2a}$.', calculo: 'h = -\\dfrac{' + tex(b) + '}{' + tex(2 * a) + '} = ' + tex(h) },
        { passo: 'Calcular o extremo', porque: 'O extremo é a ordenada do vértice, $f(h)$.', calculo: substituicaoTex('f', a, b, c, h) },
        { passo: 'Ver a concavidade', porque: 'Com $a = ' + tex(a) + '$, a concavidade está voltada para ' + (cima ? 'cima e o extremo é um mínimo.' : 'baixo e o extremo é um máximo.'), calculo: "D'_f = " + intervaloTex(certo) },
      ];
    const kv = limpo(-(b * b - 4 * a * c) / (4 * a));
    const verif = canon
      ? { passo: 'Confirmar com o quadrado', calculo: '(x ' + (h < 0 ? '+ ' + tex(-h) : '- ' + tex(h)) + ')^2 \\geq 0 \\Rightarrow ' + texQ(a) + '(x ' + (h < 0 ? '+ ' + tex(-h) : '- ' + tex(h)) + ')^2 ' + (cima ? '\\geq' : '\\leq') + ' 0 \\Rightarrow f(x) ' + (cima ? '\\geq' : '\\leq') + ' ' + tex(k) + ',\\quad f(' + tex(h) + ') = ' + tex(k) }
      : { passo: 'Confirmar o extremo com $k = -\\dfrac{\\Delta}{4a}$', calculo: deltaTex(a, b, c) + ',\\quad k = -\\dfrac{' + tex(Q.delta) + '}{' + tex(4 * a) + '} = ' + tex(kv) };
    const ex = { enunciado: 'Considera a função quadrática $f$ definida por $f(x) = ' + expr + '$. Qual é o contradomínio de $f$?', resolucao, verificacao: verif, dados: { contexto, a, h, k }, esquema: esquemaParabola(a, h, k, false) };
    const prioridade = erros.slice(0, 1).concat(baralhar(rng, erros.slice(1)));
    return fecharTexto(rng, ex, opUniao([certo]), prioridade.map((e) => ({ codigo: e.codigo, texto: opUniao([e.I]), explicacao: e.explicacao })), opUniao([D(canon ? k : kv)]));
  }

  registar({
    subtema: 'quadratica', tipo: 'contradominio', nome: 'Contradomínio de uma função quadrática',
    formatos: ['escolha'], contextos: ['geral', 'canonica'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => quadraticaContradominio(rng, contexto));
    },
    verificarIndependente(p) {
      const { a, h, k } = p.dados;
      const { b, c } = calc().canonicaParaGeral(a, h, k);
      // Extremo por −Δ/(4a) e sentido pelo sinal de f(h + 1) − f(h).
      const e = limpo(-(b * b - 4 * a * c) / (4 * a));
      const sobe = valorP(a, b, c, h + 1) > e;
      const I = sobe ? { de: e, ate: Infinity, fechadoDe: true, fechadoAte: false } : { de: -Infinity, ate: e, fechadoDe: false, fechadoAte: true };
      return chave(p.opcoes[p.correta]) === chave(opUniao([I]));
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.h, p.dados.k], 6);
    },
  });

  // ================================================================ transformacoes

  const fArg = (h) => (h === 0 ? 'x' : 'x ' + (h > 0 ? '- ' + tex(h) : '+ ' + tex(-h)));
  const unidades = (n) => fmt(n) + (n === 1 ? ' unidade' : ' unidades');
  const mais = (k) => (k === 0 ? '' : k > 0 ? ' + ' + tex(k) : ' - ' + tex(-k));
  const fatorTex = (A) => (A === 1 ? '' : A === -1 ? '-' : texQ(A));

  // Vértice do gráfico de g, obtido do de f por translação ou dilatação/reflexão.
  function verticeTransformado(rng, formato, contexto) {
    const p = inteiro(rng, -4, 4);
    const q = inteiro(rng, -4, 4);
    const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
    let g, V, erros, resolucao, verif, dadosT;
    const intro = 'O gráfico de uma função quadrática $f$ tem vértice no ponto $' + ptTex(p, q) + '$. ';
    if (contexto === 'translacao') {
      const h = escolher(rng, NAO_NULOS(4));
      const k = escolher(rng, NAO_NULOS(5));
      g = 'f(' + fArg(h) + ')' + mais(k);
      V = [p + h, q + k];
      const fim = ' O vértice de $g$ é $' + ptTex(V[0], V[1]) + '$.';
      erros = [
        { codigo: 'sentido_horizontal_trocado', P: [p - h, q + k], explicacao: '$f(' + fArg(h) + ')$ desloca o gráfico ' + unidades(Math.abs(h)) + ' para a ' + (h > 0 ? 'direita' : 'esquerda') + ', não para a ' + (h > 0 ? 'esquerda' : 'direita') + '. O que estava em $x = ' + tex(p) + '$ passa para $x = ' + tex(p + h) + '$.' + fim },
        { codigo: 'ambos_os_sentidos_trocados', P: [p - h, q - k], explicacao: 'Trocaste os dois sentidos. Só o deslocamento horizontal tem o sinal ao contrário do que está escrito; $' + mais(k).trim() + '$ fora do parênteses ' + (k > 0 ? 'sobe' : 'desce') + ' o gráfico ' + unidades(Math.abs(k)) + '.' + fim },
      ];
      if (h !== k) erros.push({ codigo: 'trocou_eixos', P: [p + k, q + h], explicacao: 'Trocaste as direções. A alteração dentro do parênteses, no argumento de $f$, mexe nas abcissas; a parcela de fora mexe nas ordenadas.' + fim });
      resolucao = [
        { passo: 'Identificar as transformações', porque: '$f(' + fArg(h) + ')$ é uma translação horizontal de ' + fmt(Math.abs(h)) + ' para a ' + (h > 0 ? 'direita' : 'esquerda') + ' e $' + mais(k).trim() + '$ uma translação vertical de ' + fmt(Math.abs(k)) + ' para ' + (k > 0 ? 'cima' : 'baixo') + ', ou seja, uma translação de vetor $' + ptTex(h, k) + '$.' },
        { passo: 'Transformar o vértice', porque: 'Somam-se as coordenadas do vetor às do vértice de $f$.', calculo: ptTex(p, q) + ' + ' + ptTex(h, k) + ' = ' + ptTex(V[0], V[1]) },
      ];
      verif = {
        passo: 'Confirmar que em $x = ' + tex(V[0]) + '$ o argumento de $f$ é $' + tex(p) + '$, a abcissa do vértice de $f$',
        calculo: 'g(' + tex(V[0]) + ') = f(' + tex(V[0]) + (h > 0 ? ' - ' + tex(h) : ' + ' + tex(-h)) + ')' + mais(k) + ' = f(' + tex(p) + ')' + mais(k) + ' = ' + tex(q) + mais(k) + ' = ' + tex(q + k),
        P: [p + h, q + k],
      };
      dadosT = { tipo: 'translacao', h, k };
    } else if (rng() < 0.5) {
      const A = escolher(rng, [-3, -2, -1, 2, 3]);
      const k = inteiro(rng, -4, 4);
      if (q === 0) return null;
      g = fatorTex(A) + 'f(x)' + mais(k);
      V = [p, A * q + k];
      const fim = ' O vértice de $g$ é $' + ptTex(V[0], V[1]) + '$.';
      erros = [
        { codigo: 'ignorou_fator', P: [p, q + k], explicacao: 'Não aplicaste o fator $' + tex(A) + '$. Multiplicar $f(x)$ por $' + tex(A) + '$ multiplica as ordenadas por $' + tex(A) + '$, e $' + tex(A) + ' \\times ' + parQ(q) + ' = ' + tex(A * q) + '$.' + fim },
      ];
      if (k !== 0) erros.push({ codigo: 'somou_antes_de_multiplicar', P: [p, A * (q + k)], explicacao: 'Somaste $' + tex(k) + '$ antes de multiplicar por $' + tex(A) + '$. Em $' + g + '$ primeiro multiplica-se $f(x)$ por $' + tex(A) + '$ e só depois se soma, $' + tex(A) + ' \\times ' + parQ(q) + mais(k) + ' = ' + tex(A * q + k) + '$.' + fim });
      if (p !== 0) erros.push({ codigo: 'multiplicou_abcissa', P: [A * p, A * q + k], explicacao: 'Multiplicaste também a abcissa por $' + tex(A) + '$. Em $' + fatorTex(A) + 'f(x)$ o fator está fora de $f$ e só mexe nas ordenadas; as abcissas ficam iguais.' + fim });
      resolucao = [
        { passo: 'Identificar as transformações', porque: (A < 0 ? 'O fator negativo reflete o gráfico no eixo $Ox$; ' : '') + (Math.abs(A) !== 1 ? (A < 0 ? 'o' : 'O') + ' fator $' + tex(A) + '$ multiplica as ordenadas (dilatação vertical de fator ' + fmt(Math.abs(A)) + '); ' : '') + (k !== 0 ? 'a parcela $' + mais(k).trim() + '$ é uma translação vertical.' : 'não há translação vertical.') },
        { passo: 'Transformar o vértice', porque: 'A abcissa fica igual; a ordenada é multiplicada por $' + tex(A) + '$ e depois soma-se $' + tex(k) + '$.', calculo: ptTex(p, q) + ' \\to ' + ptTex(p, A * q + k) },
      ];
      verif = {
        passo: 'Confirmar a imagem de $' + tex(p) + '$ por $g$',
        calculo: 'g(' + tex(p) + ') = ' + tex(A) + ' \\times f(' + tex(p) + ')' + mais(k) + ' = ' + tex(A) + ' \\times ' + parQ(q) + mais(k) + ' = ' + tex(A * q + k),
        P: [p, A * q + k],
      };
      dadosT = { tipo: 'vertical', A, k };
    } else {
      const B = escolher(rng, [-2, -1, 2, 3]);
      const k = inteiro(rng, -4, 4);
      if (p % B !== 0 || p === 0) return null;
      g = 'f(' + (B === -1 ? '-' : tex(B)) + 'x)' + mais(k);
      V = [p / B, q + k];
      const fim = ' O vértice de $g$ é $' + ptTex(V[0], V[1]) + '$.';
      erros = [
        { codigo: 'ignorou_fator', P: [p, q + k], explicacao: 'Não aplicaste o fator $' + tex(B) + '$ do argumento. Em $g$ o argumento de $f$ é $' + tex(p) + '$ quando $' + tex(B) + 'x = ' + tex(p) + '$, ou seja, $x = ' + tex(p / B) + '$.' + fim },
      ];
      if (Math.abs(B) !== 1) erros.push({ codigo: 'multiplicou_em_vez_de_dividir', P: [B * p, q + k], explicacao: 'Multiplicaste a abcissa por $' + tex(B) + '$. Em $f(' + tex(B) + 'x)$ as abcissas dividem-se por $' + tex(B) + '$, porque $' + tex(B) + ' \\times ' + parQ(p / B) + ' = ' + tex(p) + '$.' + fim });
      if (q !== 0 && B !== 1) erros.push({ codigo: 'fator_na_ordenada', P: [p, B * q + k], explicacao: 'Aplicaste o fator $' + tex(B) + '$ às ordenadas, como se fosse $' + tex(B) + 'f(x)$. Dentro do argumento, o fator mexe nas abcissas.' + fim });
      resolucao = [
        { passo: 'Identificar as transformações', porque: '$f(' + (B === -1 ? '-' : tex(B)) + 'x)$ mexe só nas abcissas, que ficam divididas por $' + tex(B) + '$' + (k !== 0 ? '; a parcela $' + mais(k).trim() + '$ é uma translação vertical.' : '.') },
        { passo: 'Transformar o vértice', porque: 'A abcissa divide-se por $' + tex(B) + '$ e à ordenada soma-se $' + tex(k) + '$.', calculo: ptTex(p, q) + ' \\to ' + ptTex(p / B, q + k) },
      ];
      verif = {
        passo: 'Confirmar que em $x = ' + tex(p / B) + '$ o argumento de $f$ é $' + tex(p) + '$, a abcissa do vértice de $f$',
        calculo: 'g(' + tex(p / B) + ') = f(' + tex(B) + ' \\times ' + parQ(p / B) + ')' + mais(k) + ' = f(' + tex(p) + ')' + mais(k) + ' = ' + tex(q + k),
        P: [p / B, q + k],
      };
      dadosT = { tipo: 'horizontal', B, k };
    }
    const ex = { enunciado: intro + 'Seja $g$ a função definida por $g(x) = ' + g + '$. ' + pedidoVertice(formato, eixo, 'do vértice do gráfico de $g$'), resolucao, dados: Object.assign({ contexto, p, q, eixo }, dadosT) };
    return fecharPonto(rng, formato, ex, { certo: V, eixo, erros: baralhar(rng, erros), verificacao: verif });
  }

  registar({
    subtema: 'transformacoes', tipo: 'vertice-transformado', nome: 'Vértice depois de uma transformação',
    formatos: ['numerica', 'escolha'], contextos: ['translacao', 'dilatacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => verticeTransformado(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      // Com uma f concreta, f(x) = (x − p)² + q, procura-se o mínimo/máximo de g numa grelha de inteiros.
      const f = (x) => (x - d.p) * (x - d.p) + d.q;
      const gx = d.tipo === 'translacao' ? (x) => f(x - d.h) + d.k : d.tipo === 'vertical' ? (x) => d.A * f(x) + d.k : (x) => f(d.B * x) + d.k;
      const sinalA = d.tipo === 'vertical' && d.A < 0 ? -1 : 1;
      let melhor = null;
      for (let x = -20; x <= 20; x++) {
        const y = gx(x);
        if (melhor === null || sinalA * y < sinalA * melhor[1]) melhor = [x, y];
      }
      return confereVertice(p, melhor);
    },
    limites(p) {
      return dentro([p.dados.p, p.dados.q], 4);
    },
  });

  // Expressão de g a partir das transformações de y = x² (escolha).
  function expressaoTransformada(rng, contexto) {
    const h = escolher(rng, NAO_NULOS(4));
    const k = escolher(rng, NAO_NULOS(5));
    let A = 1, refl = false, descricao;
    if (contexto === 'translacao') {
      descricao = 'uma translação de vetor $' + ptTex(h, k) + '$';
    } else {
      A = escolher(rng, [2, 3, 0.5]);
      refl = rng() < 0.6;
      descricao = (A > 1 ? 'uma dilatação vertical de fator $' : 'uma contração vertical de fator $') + texQ(A) + '$, ' + (refl ? 'seguida de uma reflexão no eixo $Ox$ e de ' : 'seguida de ') + 'uma translação de vetor $' + ptTex(h, k) + '$';
    }
    const a = refl ? -A : A;
    const opc = (aa, hh, kk) => '$g(x) = ' + canonicaTex(aa, hh, kk) + '$';
    const params = {};
    const reg = (aa, hh, kk) => { params[opc(aa, hh, kk)] = [aa, hh, kk]; return opc(aa, hh, kk); };
    const certo = reg(a, h, k);
    const fim = ' Fica $g(x) = ' + canonicaTex(a, h, k) + '$.';
    const erros = [
      { codigo: 'sinal_de_h', texto: reg(a, -h, k), explicacao: 'Uma translação de ' + unidades(Math.abs(h)) + ' para a ' + (h > 0 ? 'direita' : 'esquerda') + ' escreve-se $(x ' + (h > 0 ? '- ' + tex(h) : '+ ' + tex(-h)) + ')^2$. O vértice passa para $x = ' + tex(h) + '$, onde o parênteses se anula.' + fim },
    ];
    if (contexto === 'translacao') {
      if (h !== k) erros.push({ codigo: 'trocou_h_k', texto: reg(a, k, h), explicacao: 'Trocaste as coordenadas do vetor. A primeira, $' + tex(h) + '$, é o deslocamento horizontal e vai dentro do parênteses; a segunda, $' + tex(k) + '$, é o vertical e vai fora.' + fim });
      erros.push({ codigo: 'ambos_os_sinais_trocados', texto: reg(a, -h, -k), explicacao: 'Trocaste os dois sinais. Só o deslocamento horizontal aparece com o sinal trocado, dentro do parênteses; o vertical soma-se tal como está, $' + mais(k).trim() + '$.' + fim });
    } else {
      erros.push({ codigo: 'fator_invertido', texto: reg((refl ? -1 : 1) / A, h, k), explicacao: 'Usaste $' + texQ(1 / A) + '$ em vez de $' + texQ(A) + '$. Uma ' + (A > 1 ? 'dilatação' : 'contração') + ' vertical de fator $' + texQ(A) + '$ multiplica as ordenadas por $' + texQ(A) + '$.' + fim });
      if (refl) {
        erros.push(
          { codigo: 'esqueceu_reflexao', texto: reg(A, h, k), explicacao: 'Esqueceste a reflexão no eixo $Ox$, que troca o sinal das ordenadas e põe o coeficiente $' + texQ(-A) + '$.' + fim },
          { codigo: 'refletiu_a_translacao', texto: reg(-A, h, -k), explicacao: 'Refletiste também a translação, trocando o sinal de $' + tex(k) + '$. A reflexão vem antes da translação, por isso só afeta $' + texQ(A) + 'x^2$; depois soma-se $' + tex(k) + '$.' + fim },
        );
      } else {
        erros.push({ codigo: 'ambos_os_sinais_trocados', texto: reg(a, -h, -k), explicacao: 'Trocaste os dois sinais. Só o deslocamento horizontal aparece com o sinal trocado, dentro do parênteses; o vertical soma-se tal como está.' + fim });
        if (h !== k) erros.push({ codigo: 'trocou_h_k', texto: reg(a, k, h), explicacao: 'Trocaste as coordenadas do vetor. A primeira, $' + tex(h) + '$, vai dentro do parênteses; a segunda, $' + tex(k) + '$, fora.' + fim });
      }
    }
    // Pontos (0, 0) e (1, 1) de y = x², transformados.
    const P1 = [1 + h, a + k];
    const resolucao = [];
    if (contexto !== 'translacao') {
      resolucao.push({ passo: 'Aplicar a ' + (A > 1 ? 'dilatação' : 'contração') + (refl ? ' e a reflexão' : ''), porque: 'Multiplicar as ordenadas por $' + texQ(A) + '$ dá $' + texQ(A) + 'x^2$' + (refl ? '; a reflexão no eixo $Ox$ troca-lhes o sinal.' : '.'), calculo: 'y = ' + canonicaTex(a, 0, 0) });
    }
    resolucao.push({ passo: 'Aplicar a translação', porque: 'Uma translação de vetor $' + ptTex(h, k) + '$ troca $x$ por $' + fArg(h) + '$ e soma $' + tex(k) + '$ à expressão.', calculo: 'g(x) = ' + canonicaTex(a, h, k) });
    const verif = {
      passo: 'Seguir os pontos $(0, 0)$ e $(1, 1)$ de $y = x^2$ e confirmar que estão no gráfico de $g$',
      calculo: '(0, 0) \\to ' + ptTex(h, k) + ',\\ g(' + tex(h) + ') = ' + tex(k) + ';\\quad (1, 1) \\to ' + (ehInteiro(P1[1]) ? ptTex(P1[0], P1[1]) : '\\left(' + tex(P1[0]) + ', ' + texQ(P1[1]) + '\\right)') + ',\\ g(' + tex(P1[0]) + ') = ' + texQ(a) + ' \\times 1^2' + mais(k) + ' = ' + texQ(P1[1]),
    };
    const ex = {
      enunciado: 'O gráfico de $g$ obtém-se do gráfico de $y = x^2$ por ' + descricao + '. Qual é a expressão de $g$?',
      resolucao, verificacao: verif, dados: { contexto, a, h, k, params }, esquema: esquemaParabola(a, h, k, true),
    };
    return fecharTexto(rng, ex, certo, baralhar(rng, erros), certo);
  }

  registar({
    subtema: 'transformacoes', tipo: 'expressao', nome: 'Expressão a partir das transformações',
    formatos: ['escolha'], contextos: ['translacao', 'dilatacao-reflexao'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => expressaoTransformada(rng, contexto));
    },
    verificarIndependente(p) {
      const { a, h, k, params } = p.dados;
      const op = params[p.opcoes[p.correta]];
      if (!op) return false;
      const g = (x) => op[0] * (x - op[1]) * (x - op[1]) + op[2];
      // Imagens de (0, 0), (1, 1) e (−1, 1) de y = x² (três pontos determinam a parábola).
      return [[0, 0], [1, 1], [-1, 1]].every(([x, y]) => proximo(g(x + h), a * y + k));
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.h, p.dados.k], 5);
    },
  });

  // Efeito de a·f(x) e de f(bx) (vf): descrição ou imagem de um ponto.
  function descricaoEfeito(direcao, fator) {
    const vert = direcao === 'vertical';
    const eixoR = vert ? 'Ox' : 'Oy';
    const mod = Math.abs(fator);
    const fatorEf = vert ? mod : limpo(1 / mod); // fator da dilatação/contração
    const partes = [];
    if (fator < 0) partes.push('uma reflexão no eixo $' + eixoR + '$');
    if (mod !== 1) partes.push('uma ' + (fatorEf > 1 ? 'dilatação' : 'contração') + ' ' + direcao + ' de fator $' + texQ(fatorEf) + '$');
    return partes.join(' seguida de ');
  }
  function efeitoFator(rng, contexto) {
    const vert = contexto === 'vertical';
    const fator = escolher(rng, vert ? [2, 3, 0.5, -1, -2, -0.5] : [2, 3, 0.5, -1, -2, -0.5]);
    const gTex = vert ? fatorTex(fator) + 'f(x)' : 'f(' + (fator === -1 ? '-' : texQ(fator)) + 'x)';
    const intro = 'Seja $f$ uma função e $g$ a função definida por $g(x) = ' + gTex + '$. ';
    const tipo = rng() < 0.5 ? 'descricao' : 'ponto';
    const mod = Math.abs(fator);
    let certa, falsas, verif, afirmadoCerto;
    // Ponto P de f com coordenadas que dão imagens inteiras.
    const x0 = vert ? escolher(rng, NAO_NULOS(4)) : (mod === 0.5 ? escolher(rng, NAO_NULOS(4)) : fator * escolher(rng, NAO_NULOS(2)));
    const y0 = vert ? (mod === 0.5 ? 2 * escolher(rng, NAO_NULOS(3)) : escolher(rng, NAO_NULOS(4))) : escolher(rng, NAO_NULOS(4));
    const img = vert ? [x0, limpo(fator * y0)] : [limpo(x0 / fator), y0];
    const verifPonto = vert
      ? 'g(' + tex(x0) + ') = ' + texQ(fator) + ' \\times f(' + tex(x0) + ') = ' + texQ(fator) + ' \\times ' + parQ(y0) + ' = ' + tex(img[1])
      : 'g(' + tex(img[0]) + ') = f(' + texQ(fator) + ' \\times ' + parQ(img[0]) + ') = f(' + tex(x0) + ') = ' + tex(y0);
    if (tipo === 'descricao') {
      certa = descricaoEfeito(contexto, fator);
      falsas = [];
      const direcao = contexto;
      const outra = vert ? 'horizontal' : 'vertical';
      if (mod !== 1) {
        const fEf = vert ? mod : 1 / mod;
        const trocada = (fator < 0 ? 'uma reflexão no eixo $' + (vert ? 'Ox' : 'Oy') + '$ seguida de ' : '') + 'uma ' + (fEf > 1 ? 'contração' : 'dilatação') + ' ' + direcao + ' de fator $' + texQ(fEf) + '$';
        falsas.push({ texto: trocada, codigo: 'dilatacao_contracao_trocadas', explicacao: (vert ? 'Multiplicar as ordenadas por $' + texQ(mod) + '$' : 'Dividir as abcissas por $' + texQ(mod) + '$') + (fEf > 1 ? ' afasta' : ' aproxima') + ' os pontos do eixo $' + (vert ? 'Ox' : 'Oy') + '$, o que é uma ' + (fEf > 1 ? 'dilatação' : 'contração') + '. O correto é ' + certa + '.' });
        if (!vert) {
          const naoInv = (fator < 0 ? 'uma reflexão no eixo $Oy$ seguida de ' : '') + 'uma ' + (mod > 1 ? 'dilatação' : 'contração') + ' horizontal de fator $' + texQ(mod) + '$';
          falsas.push({ texto: naoInv, codigo: 'fator_nao_invertido', explicacao: 'Em $f(' + texQ(fator) + 'x)$ as abcissas dividem-se por $' + texQ(mod) + '$ (multiplicam-se por $' + texQ(1 / mod) + '$), por isso o fator é $' + texQ(1 / mod) + '$, não $' + texQ(mod) + '$. O correto é ' + certa + '.' });
          falsas.push({ texto: descricaoEfeito(outra, fator).replace('$Oy$', '$Ox$'), codigo: 'direcao_trocada', explicacao: 'O fator está dentro do argumento de $f$, por isso mexe nas abcissas (efeito horizontal), não nas ordenadas como em $' + fatorTex(fator) + 'f(x)$. O correto é ' + certa + '.' });
        }
      }
      if (fator < 0) {
        falsas.push({ texto: certa.replace(vert ? '$Ox$' : '$Oy$', vert ? '$Oy$' : '$Ox$'), codigo: 'eixo_reflexao_trocado', explicacao: (vert ? 'O sinal menos fora de $f$ troca o sinal das ordenadas, $(x, y) \\to (x, -y)$, o que é uma reflexão no eixo $Ox$.' : 'O sinal menos dentro do argumento troca o sinal das abcissas, $(x, y) \\to (-x, y)$, o que é uma reflexão no eixo $Oy$.') + ' O correto é ' + certa + '.' });
      }
      const verifDesc = 'Seguir o ponto $P' + ptTex(x0, y0) + '$ do gráfico de $f$, que passa para $' + ptTex(img[0], img[1]) + '$';
      verif = { passo: verifDesc, calculo: verifPonto };
      afirmadoCerto = certa;
    } else {
      certa = '$' + ptTex(img[0], img[1]) + '$';
      falsas = [];
      if (vert) {
        if (ehInteiro(fator * x0) && x0 * fator !== x0) falsas.push({ texto: '$' + ptTex(fator * x0, y0) + '$', codigo: 'aplicou_na_abcissa', explicacao: 'Multiplicaste a abcissa por $' + texQ(fator) + '$. Em $' + gTex + '$ o fator está fora de $f$ e multiplica as ordenadas; a abcissa fica $' + tex(x0) + '$.' });
        if (ehInteiro(y0 / fator) && mod !== 1) falsas.push({ texto: '$' + ptTex(x0, y0 / fator) + '$', codigo: 'dividiu_a_ordenada', explicacao: 'Dividiste a ordenada por $' + texQ(fator) + '$. A imagem de $' + tex(x0) + '$ por $g$ é $' + texQ(fator) + ' \\times f(' + tex(x0) + ')$, por isso a ordenada multiplica-se.' });
      } else {
        if (ehInteiro(fator * x0) && mod !== 1) falsas.push({ texto: '$' + ptTex(fator * x0, y0) + '$', codigo: 'multiplicou_em_vez_de_dividir', explicacao: 'Multiplicaste a abcissa por $' + texQ(fator) + '$. Procura-se $x$ com $' + texQ(fator) + 'x = ' + tex(x0) + '$, ou seja, $x = ' + tex(img[0]) + '$.' });
        if (ehInteiro(fator * y0) && fator !== 1) falsas.push({ texto: '$' + ptTex(x0, fator * y0) + '$', codigo: 'aplicou_na_ordenada', explicacao: 'Multiplicaste a ordenada por $' + texQ(fator) + '$, como em $' + fatorTex(fator) + 'f(x)$. Dentro do argumento, o fator mexe nas abcissas.' });
      }
      verif = { passo: 'Confirmar que o ponto afirmado está no gráfico de $g$', calculo: verifPonto };
      afirmadoCerto = certa;
    }
    falsas = falsas.filter((e) => chave(e.texto) !== chave(certa));
    if (!falsas.length) return null;
    const er = escolher(rng, falsas);
    const frase = (t) => (tipo === 'descricao' ? 'O gráfico de $g$ obtém-se do gráfico de $f$ por ' + t + '.' : 'O ponto $P' + ptTex(x0, y0) + '$ do gráfico de $f$ corresponde ao ponto ' + t + ' do gráfico de $g$.');
    const v = AJ.vfDe(rng, frase(certa), frase(er.texto), { codigo: er.codigo, explicacao: er.explicacao });
    const afirmado = v.correta ? afirmadoCerto : er.texto;
    const resolucao = tipo === 'descricao'
      ? [{ passo: 'Ver onde está o fator', porque: vert ? 'Um fator fora de $f$ multiplica as ordenadas, $(x, y) \\to (x, ' + somaTex([[fator, 'y']]) + ')$.' : 'Um fator dentro do argumento divide as abcissas por $' + texQ(fator) + '$, $(x, y) \\to (' + somaTex([[1 / fator, 'x']]) + ', y)$.', calculo: 'g(x) = ' + gTex }, { passo: 'Descrever a transformação', porque: 'O efeito é ' + certa + '.' }]
      : [{ passo: 'Aplicar a transformação ao ponto', porque: vert ? 'Um fator fora de $f$ multiplica as ordenadas e mantém as abcissas.' : 'Um fator dentro do argumento divide as abcissas e mantém as ordenadas.', calculo: ptTex(x0, y0) + ' \\to ' + ptTex(img[0], img[1]) }];
    return {
      enunciado: intro + (tipo === 'ponto' ? '' : '') + 'Afirmação: «' + v.enunciado + '»', resolucao, correta: v.correta, errosTipicos: v.errosTipicos,
      verificacao: Object.assign(verif, { valor: afirmado === (tipo === 'ponto' ? '$' + ptTex(img[0], img[1]) + '$' : descricaoEfeito(contexto, fator)) }),
      dados: { contexto, fator, tipo, x0, y0, afirmado },
    };
  }

  registar({
    subtema: 'transformacoes', tipo: 'efeito-a', nome: 'Efeito de um fator no gráfico',
    formatos: ['vf'], contextos: ['vertical', 'horizontal'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => efeitoFator(rng, contexto));
    },
    verificarIndependente(p) {
      const { contexto, fator, tipo, x0, y0, afirmado } = p.dados;
      const vert = contexto === 'vertical';
      if (tipo === 'ponto') {
        // O ponto (x, y) está no gráfico de g quando y = g(x), com f conhecida só em x0 (f(x0) = y0).
        const m = String(afirmado).replace(/\$/g, '').match(/^\((-?\d+), (-?\d+)\)$/);
        if (!m) return false;
        const [x, y] = [Number(m[1]), Number(m[2])];
        const ok = vert ? x === x0 && proximo(y, fator * y0) : proximo(fator * x, x0) && y === y0;
        return p.correta === ok;
      }
      // Imagem de (1, 1): (1, fator) ou (1/fator, 1); sinal → reflexão, distância ao eixo → dilatação/contração.
      const Q = vert ? [1, fator] : [1 / fator, 1];
      const c = vert ? Q[1] : Q[0];
      const partes = [];
      if (c < 0) partes.push('uma reflexão no eixo $' + (vert ? 'Ox' : 'Oy') + '$');
      if (Math.abs(c) !== 1) partes.push('uma ' + (Math.abs(c) > 1 ? 'dilatação' : 'contração') + ' ' + contexto + ' de fator $' + texQ(Math.abs(c)) + '$');
      return p.correta === (partes.join(' seguida de ') === afirmado);
    },
    limites(p) {
      return Math.abs(p.dados.fator) <= 3 && dentro([p.dados.x0, p.dados.y0], 8);
    },
  });

  // ================================================================ equacoes-inequacoes

  // Soluções de ax² + bx = d (equação) ou de um problema de áreas (retângulo).
  function equacaoSolucoes(rng, formato, contexto) {
    if (contexto === 'equacao') {
      const P = comZeros(rng, [1, 1, 2]);
      if (!P) return null;
      const { a, b, c } = P;
      if (c === 0) return null;
      const d = -c; // ax² + bx = d
      const certo = calc().quadratica(a, b, c).zeros.map(limpo);
      if (!mesmoConjunto(certo, P.zeros)) return null;
      const r = Math.sqrt(b * b - 4 * a * c);
      const fim = ' O conjunto-solução é $' + conjTex(certo) + '$.';
      const erros = [
        { codigo: 'sinais_trocados', S: certo.map((x) => -x), explicacao: 'Usaste $b$ em vez de $-b$ na fórmula resolvente. O numerador é $-b \\pm \\sqrt{\\Delta} = ' + tex(-b) + ' \\pm ' + tex(r) + '$.' + fim },
        { codigo: 'dividiu_so_por_a', S: certo.map((x) => 2 * x), explicacao: 'Dividiste por $a = ' + tex(a) + '$ em vez de $2a = ' + tex(2 * a) + '$.' + fim },
        { codigo: 'so_uma_solucao', S: [limpo((-b + r) / (2 * a))], explicacao: 'Usaste só o sinal $+$ da fórmula. Com $\\Delta > 0$ há duas soluções, uma com $+\\sqrt{\\Delta}$ e outra com $-\\sqrt{\\Delta}$.' + fim },
      ];
      const errado = raizesRacionais(a, b, d);
      if (errado && !mesmoConjunto(errado, certo)) {
        erros.push({ codigo: 'nao_passou_para_zero', S: errado, explicacao: 'Usaste $c = ' + tex(d) + '$ sem passar $' + tex(d) + '$ para o primeiro membro. A fórmula resolvente aplica-se a $ax^2 + bx + c = 0$, aqui $' + poliTex(a, b, c) + ' = 0$, com $c = ' + tex(c) + '$.' + fim });
      }
      const qual = rng() < 0.5 ? 'maior' : 'menor';
      const resolucao = [
        { passo: 'Passar tudo para o primeiro membro', porque: 'A fórmula resolvente aplica-se a equações da forma $ax^2 + bx + c = 0$.', calculo: poliTex(a, b, 0) + ' = ' + tex(d) + ' \\Leftrightarrow ' + poliTex(a, b, c) + ' = 0' },
        { passo: 'Calcular o discriminante', porque: '$\\Delta = b^2 - 4ac$, com $a = ' + tex(a) + '$, $b = ' + tex(b) + '$ e $c = ' + tex(c) + '$.', calculo: deltaTex(a, b, c) },
        { passo: 'Aplicar a fórmula resolvente', porque: 'Como $\\Delta > 0$, há duas soluções.', calculo: resolventeTex(a, b, c), bloco: true },
      ];
      const S = raizesRacionais(a, b, c);
      const verifS = '\\begin{array}{l} ' + S.map((x) => substituicaoTex('', a, b, 0, x).replace(/^\(/, '').replace(/^[^=]*= /, '')).join(' \\\\ ') + ' \\end{array}';
      const ex = { enunciado: 'Resolve a equação $' + poliTex(a, b, 0) + ' = ' + tex(d) + '$. ' + (formato === 'numerica' ? 'Qual é a ' + qual + ' solução?' : 'Qual é o conjunto-solução?'), resolucao, dados: { contexto, a, b, c, qual } };
      return fecharConjunto(rng, formato, ex, {
        certo, pega: qual === 'maior' ? maior : menor, erros: baralhar(rng, erros),
        verificacao: { passo: 'Substituir cada solução no primeiro membro da equação dada, que tem de dar $' + tex(d) + '$', calculo: verifS, S },
      });
    }
    // Retângulo com lados x e x + p e área A.
    const pp = inteiro(rng, 1, 6);
    const r = inteiro(rng, 2, 12);
    const A = r * (r + pp);
    const certo = calc().quadratica(1, pp, -A).zeros.map(limpo);
    const pos = certo.filter((x) => x > 0);
    if (pos.length !== 1 || pos[0] !== r) return null;
    const fim = ' O lado menor mede $' + tex(r) + '$ cm.';
    const erros = [
      { codigo: 'sinais_trocados', valor: r + pp, explicacao: 'Usaste $b$ em vez de $-b$ na fórmula resolvente e obtiveste as soluções $' + tex(-r) + '$ e $' + tex(r + pp) + '$. As soluções de $' + poliTex(1, pp, -A) + ' = 0$ são $' + tex(-(r + pp)) + '$ e $' + tex(r) + '$.' + fim },
      { codigo: 'dividiu_so_por_a', valor: 2 * r, explicacao: 'Dividiste por $a = 1$ em vez de $2a = 2$ na fórmula resolvente.' + fim },
      { codigo: 'area_como_perimetro', valor: limpo((A - 2 * pp) / 4), explicacao: 'Usaste a fórmula do perímetro, $2x + 2(x + ' + tex(pp) + ') = ' + tex(A) + '$. A área do retângulo é o produto dos lados, $x(x + ' + tex(pp) + ') = ' + tex(A) + '$.' + fim },
    ];
    if (formato === 'numerica') {
      erros.push({ codigo: 'nao_rejeitou_negativa', valor: -(r + pp), explicacao: '$' + tex(-(r + pp)) + '$ é solução da equação, mas um comprimento não pode ser negativo, por isso rejeita-se.' + fim });
    }
    const errosOk = erros.filter((e) => decimal2(e.valor) && (formato === 'numerica' || e.valor > 0));
    const resolucao = [
      { passo: 'Escrever a equação', porque: 'A área do retângulo é o produto dos lados.', calculo: 'x(x + ' + tex(pp) + ') = ' + tex(A) + ' \\Leftrightarrow ' + poliTex(1, pp, -A) + ' = 0' },
      { passo: 'Calcular o discriminante', porque: '$\\Delta = b^2 - 4ac$, com $a = 1$, $b = ' + tex(pp) + '$ e $c = ' + tex(-A) + '$.', calculo: deltaTex(1, pp, -A) },
      { passo: 'Aplicar a fórmula resolvente', porque: 'Há duas soluções da equação.', calculo: resolventeTex(1, pp, -A), bloco: true },
      { passo: 'Interpretar no contexto', porque: 'Um comprimento é positivo, por isso rejeita-se $' + tex(-(r + pp)) + '$.', calculo: 'x = ' + tex(r) },
    ];
    const ex = { enunciado: 'Um retângulo tem um lado ' + fmt(pp) + ' cm maior do que o outro e área ' + fmt(A) + ' cm². Quanto mede o lado menor?', resolucao, dados: { contexto, p: pp, A } };
    return fechar(rng, formato, ex, {
      resposta: r, tolerancia: 0, unidade: 'cm', texto: (u) => '$' + tex(u, 2) + '$ cm', erros: errosOk,
      verificacao: { passo: 'Confirmar a área com os dois lados', calculo: tex(r) + ' \\times (' + tex(r) + ' + ' + tex(pp) + ') = ' + tex(r) + ' \\times ' + tex(r + pp) + ' = ' + tex(A), valor: r },
    });
  }

  registar({
    subtema: 'equacoes-inequacoes', tipo: 'solucoes', nome: 'Soluções de uma equação do 2.º grau',
    formatos: ['numerica', 'escolha'], contextos: ['equacao', 'problema'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => equacaoSolucoes(rng, formato, contexto));
    },
    verificarIndependente(p) {
      if (p.dados.contexto === 'problema') {
        // Pesquisa do comprimento inteiro positivo com x(x + p) = A.
        let x = null;
        for (let t = 1; t <= 50; t++) if (t * (t + p.dados.p) === p.dados.A) x = t;
        return x !== null && confere(p, x, (u) => '$' + tex(u, 2) + '$ cm');
      }
      const { a, b, c, qual } = p.dados;
      return confereConjunto(p, zerosPorPesquisa(a, b, c), qual === 'maior' ? maior : menor);
    },
    limites(p) {
      if (p.dados.contexto === 'problema') return p.dados.A <= 216 && p.dados.p <= 6;
      return dentro([p.dados.a, p.dados.b, p.dados.c], 40);
    },
  });

  // Conjunto-solução de uma inequação do 2.º grau (escolha), em notação de intervalos.
  function conjuntoSolucao(rng, contexto) {
    const r1 = inteiro(rng, -6, 5);
    const r2 = inteiro(rng, r1 + 1, 6);
    const a = escolher(rng, [-2, -1, 1, 2]);
    const b = -a * (r1 + r2);
    const c = a * r1 * r2;
    const dentroZ = contexto === 'entre-zeros';
    const largo = rng() < 0.5;
    // Solução entre os zeros: f < 0 com a > 0, ou f > 0 com a < 0.
    const procuraPositivo = dentroZ ? a < 0 : a > 0;
    const sg = (procuraPositivo ? '>' : '<') + (largo ? '=' : '');
    const certo = calc().inequacao2(a, b, c, sg).intervalos;
    const fimT = ' O conjunto-solução é $' + uniaoTex(certo) + '$.';
    const entre = (f) => [{ de: r1, ate: r2, fechadoDe: f, fechadoAte: f }];
    const fora = (f) => [{ de: -Infinity, ate: r1, fechadoDe: false, fechadoAte: f }, { de: r2, ate: Infinity, fechadoDe: f, fechadoAte: false }];
    const regiao = (dz, f, s1 = r1, s2 = r2) => (dz
      ? [{ de: s1, ate: s2, fechadoDe: f, fechadoAte: f }]
      : [{ de: -Infinity, ate: s1, fechadoDe: false, fechadoAte: f }, { de: s2, ate: Infinity, fechadoDe: f, fechadoAte: false }]);
    void entre; void fora;
    const conc = a > 0 ? 'para cima' : 'para baixo';
    const erros = [
      { codigo: 'regiao_trocada', I: regiao(!dentroZ, largo), explicacao: (a < 0 ? 'Com $a = ' + tex(a) + ' < 0$ a concavidade está voltada para baixo' : 'Com $a = ' + tex(a) + ' > 0$ a concavidade está voltada para cima') + ', por isso a função é ' + (a > 0 ? 'negativa entre os zeros e positiva fora deles' : 'positiva entre os zeros e negativa fora deles') + '.' + fimT },
      { codigo: 'extremos_errados', I: regiao(dentroZ, !largo), explicacao: 'Nos zeros, $' + tex(r1) + '$ e $' + tex(r2) + '$, a expressão vale $0$, que ' + (largo ? 'satisfaz' : 'não satisfaz') + ' uma desigualdade ' + (largo ? 'larga' : 'estrita') + '. Por isso os intervalos são ' + (largo ? 'fechados' : 'abertos') + ' nos zeros.' + fimT },
    ];
    if (r1 + r2 !== 0) {
      erros.push({ codigo: 'zeros_com_sinal_trocado', I: regiao(dentroZ, largo, -r2, -r1), explicacao: 'Os zeros são $' + tex(r1) + '$ e $' + tex(r2) + '$, não $' + tex(-r2) + '$ e $' + tex(-r1) + '$; confirma, $f(' + tex(r1) + ') = 0$.' + fimT });
    }
    if (dentroZ) {
      erros.push({ codigo: 'so_um_lado', I: [{ de: -Infinity, ate: r2, fechadoDe: false, fechadoAte: largo }], explicacao: 'Ficaste só com a condição sobre o zero maior, $x ' + (largo ? '\\leq' : '<') + ' ' + tex(r2) + '$ (como quem passa de $x^2 < 4$ para $x < 2$). Para $x < ' + tex(r1) + '$ a expressão tem o outro sinal, por isso também é preciso $x ' + (largo ? '\\geq' : '>') + ' ' + tex(r1) + '$.' + fimT });
    } else {
      erros.push({ codigo: 'so_um_lado', I: [{ de: r2, ate: Infinity, fechadoDe: largo, fechadoAte: false }], explicacao: 'Ficaste só com $x ' + (largo ? '\\geq' : '>') + ' ' + tex(r2) + '$ (como quem passa de $x^2 > 4$ para $x > 2$). A expressão tem o mesmo sinal à esquerda de $' + tex(r1) + '$, por isso esse lado também faz parte do conjunto-solução.' + fimT });
    }
    // Pontos de teste: um em cada região.
    const tE = r1 - 1, tM = r2 - r1 >= 2 ? r1 + 1 : limpo((r1 + r2) / 2), tD = r2 + 1;
    const f = (x) => valorP(a, b, c, x);
    const sgTex = (v) => (v > 0 ? ' > 0' : ' < 0');
    const testes = '\\begin{array}{l} f(' + tex(tE) + ') = ' + texQ(f(tE)) + sgTex(f(tE)) + ',\\quad f' + argQ(tM) + ' = ' + texQ(f(tM)) + sgTex(f(tM)) + ',\\quad f(' + tex(tD) + ') = ' + texQ(f(tD)) + sgTex(f(tD)) + ' \\\\ f(' + tex(r1) + ') = f(' + tex(r2) + ') = 0 \\end{array}';
    const resolucao = [
      { passo: 'Calcular os zeros', porque: 'O sinal da expressão só pode mudar nos zeros.', calculo: b === 0
        ? poliTex(a, 0, c) + ' = 0 \\Leftrightarrow x^2 = ' + tex(-c / a) + ' \\Leftrightarrow x = ' + tex(r1) + ' \\vee x = ' + tex(r2)
        : deltaTex(a, b, c) + ',\\quad ' + resolventeTex(a, b, c), bloco: b !== 0 },
      { passo: 'Esboçar a parábola', porque: 'Com $a = ' + tex(a) + '$ a concavidade está voltada ' + conc + ': a expressão é ' + (a > 0 ? 'negativa entre os zeros e positiva fora deles.' : 'positiva entre os zeros e negativa fora deles.') },
      { passo: 'Escrever o conjunto-solução', porque: 'Procuram-se os valores onde a expressão é ' + (procuraPositivo ? 'positiva' : 'negativa') + (largo ? ' ou nula (os zeros entram).' : ' (os zeros ficam de fora).'), calculo: '\\text{C.S.} = ' + uniaoTex(certo) },
    ];
    const porTeste = solucaoPorTeste(a, b, c, sg, r1, r2);
    const ex = {
      enunciado: 'Qual é o conjunto-solução da inequação $' + poliTex(a, b, c) + ' ' + SIMBOLO[sg] + ' 0$?',
      resolucao, verificacao: { passo: 'Confirmar o sinal com um valor em cada região', calculo: testes },
      dados: { contexto, a, r1, r2, sg }, esquema: esquemaParabola(a, limpo((r1 + r2) / 2), calc().quadratica(a, b, c).vertice[1], false),
    };
    return fecharTexto(rng, ex, opUniao(certo), baralhar(rng, erros).map((e) => ({ codigo: e.codigo, texto: opUniao(e.I), explicacao: e.explicacao })), opUniao(porTeste));
  }

  // Conjunto-solução pelo sinal num ponto de cada região (outro método).
  function solucaoPorTeste(a, b, c, sg, r1, r2) {
    const ok = (x) => { const v = a * x * x + b * x + c; return sg[0] === '>' ? v > 0 : v < 0; };
    const f = sg.length === 2;
    const meio = ok((r1 + r2) / 2);
    if (meio) return [{ de: r1, ate: r2, fechadoDe: f, fechadoAte: f }];
    return [{ de: -Infinity, ate: r1, fechadoDe: false, fechadoAte: f && ok(r1 - 1) }, { de: r2, ate: Infinity, fechadoDe: f && ok(r2 + 1), fechadoAte: false }].filter(() => ok(r1 - 1));
  }

  registar({
    subtema: 'equacoes-inequacoes', tipo: 'conjunto-solucao', nome: 'Conjunto-solução de uma inequação do 2.º grau',
    formatos: ['escolha'], contextos: ['entre-zeros', 'fora-dos-zeros'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => conjuntoSolucao(rng, contexto));
    },
    verificarIndependente(p) {
      const { a, r1, r2, sg } = p.dados;
      return chave(p.opcoes[p.correta]) === chave(opUniao(solucaoPorTeste(a, -a * (r1 + r2), a * r1 * r2, sg, r1, r2)));
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.r1, p.dados.r2], 6);
    },
  });

  // Número de soluções de uma equação do 2.º grau pelo discriminante.
  const N_SOL = ['não tem soluções', 'tem exatamente uma solução', 'tem exatamente duas soluções'];
  const nPorDelta = (d) => (d > 0 ? 2 : d === 0 ? 1 : 0);
  function numeroSolucoes(rng, formato, contexto) {
    const alvo = inteiro(rng, 0, 2);
    const a = escolher(rng, COEF_A);
    const h = inteiro(rng, -4, 4);
    const k = alvo === 1 ? 0 : (alvo === 2 ? -sinal(a) : sinal(a)) * inteiro(rng, 1, 6);
    const { b, c } = calc().canonicaParaGeral(a, h, k);
    const membros = contexto === 'membros';
    if (membros && c === 0) return null;
    const Q = calc().quadratica(a, b, c);
    const n = Q.zeros.length;
    const eq = membros ? poliTex(a, b, 0) + ' = ' + tex(-c) : poliTex(a, b, c) + ' = 0';
    const fim = ' Como $\\Delta = ' + tex(Q.delta) + '$, a equação ' + N_SOL[n] + '.';
    const erros = [];
    if (membros) {
      erros.push({ codigo: 'nao_passou_para_zero', valor: nPorDelta(limpo(b * b + 4 * a * c)), explicacao: 'Usaste $c = ' + tex(-c) + '$ sem passar esse termo para o primeiro membro. A equação fica $' + poliTex(a, b, c) + ' = 0$, com $c = ' + tex(c) + '$.' + fim });
    } else {
      erros.push({ codigo: 'sinal_de_4ac', valor: nPorDelta(limpo(b * b + 4 * a * c)), explicacao: 'Calculaste $b^2 + 4ac = ' + tex(limpo(b * b + 4 * a * c)) + '$. O discriminante é $b^2 - 4ac$.' + fim });
    }
    if (b < 0) erros.push({ codigo: 'quadrado_de_negativo', valor: nPorDelta(limpo(-b * b - 4 * a * c)), explicacao: 'Calculaste $' + tex(b) + '^2 = ' + tex(-b * b) + '$. O quadrado de um número negativo é positivo, $(' + tex(b) + ')^2 = ' + tex(b * b) + '$.' + fim });
    if (n === 1) erros.push({ codigo: 'raiz_dupla_contada_duas_vezes', valor: 2, explicacao: 'Com $\\Delta = 0$ a fórmula resolvente dá $\\dfrac{-b \\pm 0}{2a}$, o mesmo valor duas vezes: há uma única solução (raiz dupla).' });
    const errosOk = erros.filter((e) => e.valor !== n);
    if (!errosOk.length) return null;
    const veredicto = Q.delta > 0 ? '\\Delta > 0' : Q.delta === 0 ? '\\Delta = 0' : '\\Delta < 0';
    const resolucao = [];
    if (membros) resolucao.push({ passo: 'Passar tudo para o primeiro membro', porque: 'O discriminante calcula-se na forma $ax^2 + bx + c = 0$.', calculo: poliTex(a, b, c) + ' = 0' });
    resolucao.push(
      { passo: 'Calcular o discriminante', porque: '$\\Delta = b^2 - 4ac$, com $a = ' + tex(a) + '$, $b = ' + tex(b) + '$ e $c = ' + tex(c) + '$.', calculo: deltaTex(a, b, c) },
      { passo: 'Concluir', porque: 'Com $\\Delta > 0$ há duas soluções, com $\\Delta = 0$ uma e com $\\Delta < 0$ nenhuma.', calculo: veredicto + ' \\Rightarrow ' + tex(n) + '\\ \\text{soluções}' },
    );
    // Outro método: forma canónica, (x − h)² = −k/a.
    const hv = limpo(-b / (2 * a));
    const kv = valorP(a, b, c, hv);
    const q = limpo(-kv / a);
    const nCan = q > 0 ? 2 : q === 0 ? 1 : 0;
    const verif = {
      passo: 'Confirmar pela forma canónica, $a(x - h)^2 + k = 0 \\Leftrightarrow (x - h)^2 = -\\dfrac{k}{a}$. ' + (nCan === 2 ? 'O segundo membro é positivo, por isso há duas soluções' : nCan === 1 ? 'O segundo membro é zero, por isso há uma só solução' : 'O segundo membro é negativo e um quadrado nunca é negativo, por isso não há soluções'),
      calculo: 'h = -\\dfrac{' + tex(b) + '}{' + tex(2 * a) + '} = ' + texQ(hv) + ',\\quad k = f' + argQ(hv) + ' = ' + texQ(kv) + ',\\quad ' + canonicaTex(a, hv, kv) + ' = 0 \\Leftrightarrow ' + (hv === 0 ? 'x^2' : '(x ' + (hv < 0 ? '+ ' + texQ(-hv) : '- ' + texQ(hv)) + ')^2') + ' = ' + texQ(q),
      valor: nCan,
    };
    const dados = { contexto, a, b, c };
    const intro = 'Considera a equação $' + eq + '$.';
    if (formato === 'vf') {
      const er = escolher(rng, errosOk);
      const v = AJ.vfDe(rng, 'A equação ' + N_SOL[n] + '.', 'A equação ' + N_SOL[er.valor] + '.', { codigo: er.codigo, explicacao: er.explicacao });
      const afirmado = v.correta ? n : er.valor;
      return {
        enunciado: intro + ' Afirmação: «' + v.enunciado + '»', resolucao, correta: v.correta, errosTipicos: v.errosTipicos,
        verificacao: Object.assign(verif, { valor: nCan === afirmado }), dados: Object.assign(dados, { afirmado }),
      };
    }
    return fechar(rng, 'numerica', { enunciado: intro + ' Quantas soluções tem?', resolucao, dados }, {
      resposta: n, tolerancia: 0, erros: errosOk, verificacao: verif,
    });
  }

  registar({
    subtema: 'equacoes-inequacoes', tipo: 'numero-solucoes', nome: 'Número de soluções pelo discriminante',
    formatos: ['numerica', 'vf'], contextos: ['reduzida', 'membros'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => numeroSolucoes(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { a, b, c } = p.dados;
      // Contagem pela forma canónica (sinal de −k/a), sem o discriminante.
      const hv = -b / (2 * a);
      const q = limpo(-(a * hv * hv + b * hv + c) / a);
      const n = q > 0 ? 2 : q === 0 ? 1 : 0;
      if (p.formato === 'vf') return p.correta === (n === p.dados.afirmado);
      return p.resposta === n;
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.b, p.dados.c], 60);
    },
  });

  // ================================================================ ramos-modulo

  const ramosTex = (nome, v, ramos) => nome + '(' + v + ') = \\begin{cases} ' + ramos.map((r) => r.expr + ' & \\text{se } ' + r.cond).join(' \\\\ ') + ' \\end{cases}';
  const condTex = (op, c, v = 'x') => v + ' ' + ({ '<': '<', '<=': '\\leq', '>': '>', '>=': '\\geq' })[op] + ' ' + tex(c);
  const satisfaz = (op, x, c) => (op === '<' ? x < c : op === '<=' ? x <= c : op === '>' ? x > c : x >= c);

  // Imagem num ponto de uma função definida por ramos (abstrata ou tarifário).
  function avaliarRamos(rng, formato, contexto) {
    if (contexto === 'tarifario') {
      const B = escolher(rng, [3, 4, 5, 6]);
      const T = escolher(rng, [1, 2, 3]);
      const r = escolher(rng, [1, 1.5, 2, 2.5]);
      const t0 = limpo(T + 0.5 * inteiro(rng, 1, 8));
      const ramos = [
        { de: 0, ate: T, incluiDe: false, incluiAte: true, f: () => B },
        { de: T, ate: Infinity, incluiDe: false, incluiAte: false, f: (t) => B + r * (t - T) },
      ];
      const C = limpo(calc().avaliarRamos(ramos, t0));
      const din = (u) => '$' + tex(u, 2) + '$ €';
      const fim = ' Paga-se $' + tex(C, 2) + '$ €.';
      const erros = [
        { codigo: 'ramo_errado', valor: B, explicacao: 'Usaste o primeiro ramo, $C(t) = ' + tex(B) + '$, que só vale até ' + (T === 1 ? '1 hora' : fmt(T) + ' horas') + '. Como $' + tex(t0) + ' > ' + tex(T) + '$, usa-se o segundo ramo.' + fim },
        { codigo: 'cobrou_todas_as_horas', valor: limpo(B + r * t0), explicacao: 'Calculaste $' + tex(B) + ' + ' + tex(r) + ' \\times ' + tex(t0) + '$, cobrando todas as horas. Só se pagam à parte as horas além ' + (T === 1 ? 'da primeira' : 'das primeiras ' + fmt(T)) + ', $' + tex(t0) + ' - ' + tex(T) + ' = ' + tex(t0 - T) + '$.' + fim },
        { codigo: 'esqueceu_valor_base', valor: limpo(r * (t0 - T)), explicacao: 'Calculaste só o custo das horas extra, $' + tex(r) + ' \\times ' + tex(t0 - T) + ' = ' + tex(r * (t0 - T)) + '$. O segundo ramo inclui os $' + tex(B) + '$ € das primeiras horas.' + fim },
      ];
      const ex = {
        enunciado: 'Um aluguer de bicicletas custa $' + tex(B) + '$ € até ' + fmt(T) + ' ' + (T === 1 ? 'hora' : 'horas') + ' (inclusive) e mais $' + tex(r) + '$ € por cada hora além disso. O custo, em euros, de $t$ horas de aluguer é dado por $$' + ramosTex('C', 't', [{ expr: tex(B), cond: '0 < t \\leq ' + tex(T) }, { expr: tex(B) + ' + ' + (r === 1 ? '' : tex(r)) + '(t - ' + tex(T) + ')', cond: 't > ' + tex(T) }]) + '$$Quanto se paga por $' + tex(t0) + '$ horas de aluguer?',
        resolucao: [
          { passo: 'Escolher o ramo', porque: 'Como $' + tex(t0) + ' > ' + tex(T) + '$, a condição do segundo ramo é a que se verifica.', calculo: tex(t0) + ' > ' + tex(T) },
          { passo: 'Calcular', porque: 'Substitui-se $t$ por $' + tex(t0) + '$ na expressão do segundo ramo.', calculo: 'C(' + tex(t0) + ') = ' + tex(B) + ' + ' + tex(r) + ' \\times (' + tex(t0) + ' - ' + tex(T) + ') = ' + tex(B) + ' + ' + tex(r) + ' \\times ' + tex(t0 - T) + ' = ' + tex(C, 2) },
        ],
        dados: { contexto, B, T, r, t0 },
      };
      return fechar(rng, formato, ex, {
        resposta: C, tolerancia: 0, unidade: '€', texto: din, erros: baralhar(rng, erros),
        verificacao: { passo: 'Fazer a conta ao contrário, do custo para o tempo', calculo: '\\dfrac{' + tex(C, 2) + ' - ' + tex(B) + '}{' + tex(r) + '} + ' + tex(T) + ' = ' + tex(limpo((C - B) / r)) + ' + ' + tex(T) + ' = ' + tex(t0), valor: limpo(B + r * (t0 - T)) },
      });
    }
    const c = inteiro(rng, -2, 3);
    const p = escolher(rng, [-1, 1]);
    const q = inteiro(rng, -5, 5);
    const m = escolher(rng, NAO_NULOS(4));
    const bb = inteiro(rng, -6, 6);
    const esqInclui = rng() < 0.5;
    const opE = esqInclui ? '<=' : '<';
    const opD = esqInclui ? '>' : '>=';
    const L = (x) => limpo(p * x * x + q);
    const R = (x) => limpo(bb + m * x);
    if (proximo(L(c), R(c))) return null;
    const x0 = rng() < 0.5 ? c : c + escolher(rng, [-3, -2, -1, 1, 2, 3]);
    const ramos = [
      { de: -Infinity, ate: c, incluiDe: false, incluiAte: esqInclui, f: L },
      { de: c, ate: Infinity, incluiDe: !esqInclui, incluiAte: false, f: R },
    ];
    const y = limpo(calc().avaliarRamos(ramos, x0));
    const naEsq = satisfaz(opE, x0, c);
    const exprL = poliTex(p, 0, q);
    const exprR = somaTex([[bb, ''], [m, 'x']]);
    const fim = ' Assim, $f(' + tex(x0) + ') = ' + tex(y) + '$.';
    const erros = [];
    const [exprOutro, condOutro, outroV] = naEsq ? [exprR, condTex(opD, c), R(x0)] : [exprL, condTex(opE, c), L(x0)];
    erros.push({ codigo: 'ramo_errado', valor: outroV, explicacao: 'Usaste o ramo $' + exprOutro + '$, mas a sua condição, $' + condOutro + '$, é falsa para $x = ' + tex(x0) + '$' + (x0 === c ? ' (nesse extremo a bola é vazia)' : '') + '.' + fim });
    if (naEsq) {
      if (x0 !== 0 && p === -1) erros.push({ codigo: 'menos_dentro_do_quadrado', valor: limpo(x0 * x0 + q), explicacao: 'Calculaste $-x^2$ como $(-x)^2$. Em $-x^2$ primeiro faz-se o quadrado e depois troca-se o sinal, $-' + baseQ(x0) + '^2 = ' + tex(-x0 * x0) + '$.' + fim });
      if (x0 < 0 && p === 1) erros.push({ codigo: 'quadrado_sem_parenteses', valor: limpo(-x0 * x0 + q), explicacao: 'Calculaste $' + tex(x0) + '^2 = ' + tex(-x0 * x0) + '$, sem parênteses. O quadrado de um número negativo é positivo, $(' + tex(x0) + ')^2 = ' + tex(x0 * x0) + '$.' + fim });
      if (x0 !== 0 && x0 !== 2) erros.push({ codigo: 'dobro_em_vez_de_quadrado', valor: limpo(p * 2 * x0 + q), explicacao: 'Calculaste $' + baseQ(x0) + '^2$ como $2 \\times ' + parQ(x0) + '$. O quadrado é o produto do número por si próprio, $' + parQ(x0) + ' \\times ' + parQ(x0) + ' = ' + tex(x0 * x0) + '$.' + fim });
    } else {
      if (bb !== 0) erros.push({ codigo: 'ordem_das_operacoes', valor: limpo((bb + m) * x0), explicacao: 'Fizeste primeiro a soma, $(' + tex(bb) + maisQ(m) + ') \\times ' + parQ(x0) + '$. A multiplicação faz-se antes da soma, $' + tex(bb) + ' + ' + parQ(m) + ' \\times ' + parQ(x0) + '$.' + fim });
      if (m < 0 && x0 < 0) erros.push({ codigo: 'sinal_produto', valor: limpo(bb - m * x0), explicacao: '$' + tex(m) + ' \\times (' + tex(x0) + ')$ é o produto de dois números negativos, por isso é positivo, $' + tex(m * x0) + '$.' + fim });
    }
    const [exprCerto, condCerto, condErrada] = naEsq ? [exprL, condTex(opE, c), condTex(opD, c)] : [exprR, condTex(opD, c), condTex(opE, c)];
    const inverso = naEsq
      ? (p === 1 ? tex(y) + maisQ(-q) + ' = ' + tex(y - q) + ' = ' + baseQ(x0) + '^2' : tex(q) + maisQ(-y) + ' = ' + tex(q - y) + ' = ' + baseQ(x0) + '^2')
      : '\\dfrac{' + tex(y) + maisQ(-bb) + '}{' + tex(m) + '} = ' + texQ(limpo((y - bb) / m));
    const ex = {
      enunciado: 'Considera a função $f$ definida por $$' + ramosTex('f', 'x', [{ expr: exprL, cond: condTex(opE, c) }, { expr: exprR, cond: condTex(opD, c) }]) + '$$Qual é o valor de $f(' + tex(x0) + ')$?',
      resolucao: [
        { passo: 'Escolher o ramo', porque: 'Para $x = ' + tex(x0) + '$ é verdadeira a condição $' + condCerto + '$' + (x0 === c ? ', a do ramo que inclui o extremo $' + tex(c) + '$.' : '.'), calculo: condCerto.replace(/^x/, tex(x0)) },
        { passo: 'Calcular', porque: 'Substitui-se $x$ por $' + tex(x0) + '$ na expressão desse ramo, $' + exprCerto + '$.', calculo: naEsq ? substituicaoTex('f', p, 0, q, x0) : x0 === 0 ? 'f(0) = ' + tex(bb) : 'f(' + tex(x0) + ') = ' + tex(bb) + (m < 0 ? ' - ' : ' + ') + (Math.abs(m) === 1 ? '' : tex(Math.abs(m)) + ' \\times ') + parQ(x0) + ' = ' + tex(y) },
      ],
      dados: { contexto, c, p, q, m, b: bb, esqInclui, x0 },
    };
    return fechar(rng, formato, ex, {
      resposta: y, tolerancia: 0, texto: opQ, erros: baralhar(rng, erros),
      verificacao: {
        passo: 'Confirmar que $' + tex(x0) + '$ falha a outra condição ($' + condErrada + '$) e voltar de $' + tex(y) + '$ a $x$ desfazendo as operações do ramo',
        calculo: inverso,
        valor: naEsq ? limpo(p * x0 * x0 + q) : limpo(m * x0 + bb),
      },
    });
  }

  registar({
    subtema: 'ramos-modulo', tipo: 'avaliar-ramos', nome: 'Imagem numa função definida por ramos',
    formatos: ['numerica', 'escolha'], contextos: ['abstrato', 'tarifario'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => avaliarRamos(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'tarifario') {
        const v = d.t0 <= d.T ? d.B : limpo(d.B + d.r * (d.t0 - d.T));
        return confere(p, v, (u) => '$' + tex(u, 2) + '$ €');
      }
      const esquerda = d.esqInclui ? d.x0 <= d.c : d.x0 < d.c;
      const v = esquerda ? d.p * d.x0 * d.x0 + d.q : d.b + d.m * d.x0;
      return confere(p, limpo(v), opQ);
    },
    limites(p) {
      const d = p.dados;
      if (d.contexto === 'tarifario') return d.t0 <= 7 && d.B <= 6;
      return dentro([d.c, d.q, d.m, d.b, d.x0], 6);
    },
  });

  // Equação com módulo, |x − a| = d (simples) ou com uma constante a isolar.
  function equacaoModulo(rng, formato, contexto) {
    const a = escolher(rng, NAO_NULOS(6));
    const d = inteiro(rng, 1, 7);
    const certo = [a - d, a + d];
    const absTex = '\\left|' + fArg(a) + '\\right|';
    let eq, passos = [], extra = [];
    const fim = ' As soluções são $' + tex(a - d) + '$ e $' + tex(a + d) + '$.';
    if (contexto === 'simples') {
      eq = absTex + ' = ' + tex(d);
      extra.push({ codigo: 'ignorou_a', S: [-d, d], explicacao: 'Resolveste $|x| = ' + tex(d) + '$, ignorando o $' + tex(-a) + '$ dentro do módulo. As soluções estão à distância ' + fmt(d) + ' de $' + tex(a) + '$, não de $0$.' + fim });
    } else if (rng() < 0.5) {
      const e = escolher(rng, NAO_NULOS(5));
      const f = d + e;
      eq = absTex + mais(e) + ' = ' + tex(f);
      passos.push({ passo: 'Isolar o módulo', porque: 'Passa-se $' + tex(e) + '$ para o segundo membro, trocando-lhe o sinal.', calculo: absTex + ' = ' + tex(f) + maisQ(-e) + ' = ' + tex(d) });
      extra.push({ codigo: 'nao_isolou_o_modulo', S: [a - f, a + f], explicacao: 'Tiraste o módulo sem antes isolar, usando $' + tex(f) + '$ como distância. Primeiro passa-se $' + tex(e) + '$ para o outro membro, $' + absTex + ' = ' + tex(d) + '$.' + fim });
      if (f + e > 0 && f + e !== d) extra.push({ codigo: 'sinal_ao_isolar', S: [a - (f + e), a + (f + e)], explicacao: 'Passaste $' + tex(e) + '$ para o segundo membro sem trocar o sinal e ficaste com $' + absTex + ' = ' + tex(f + e) + '$. Fica $' + tex(f) + maisQ(-e) + ' = ' + tex(d) + '$.' + fim });
    } else {
      const kk = escolher(rng, [2, 3]);
      const f = kk * d;
      eq = tex(kk) + absTex + ' = ' + tex(f);
      passos.push({ passo: 'Isolar o módulo', porque: 'Dividem-se os dois membros por $' + tex(kk) + '$.', calculo: absTex + ' = \\dfrac{' + tex(f) + '}{' + tex(kk) + '} = ' + tex(d) });
      extra.push({ codigo: 'nao_dividiu', S: [a - f, a + f], explicacao: 'Usaste $' + tex(f) + '$ como distância sem dividir por $' + tex(kk) + '$. Primeiro isola-se o módulo, $' + absTex + ' = ' + tex(d) + '$.' + fim });
      extra.push({ codigo: 'multiplicou', S: [a - f * kk, a + f * kk], explicacao: 'Multiplicaste $' + tex(f) + '$ por $' + tex(kk) + '$. Para desfazer o produto divide-se, $' + absTex + ' = ' + tex(d) + '$.' + fim });
    }
    const erros = [
      { codigo: 'so_uma_solucao', S: [a + d], explicacao: 'Esqueceste o caso negativo. $|y| = ' + tex(d) + '$ quando $y = ' + tex(d) + '$ ou $y = ' + tex(-d) + '$, por isso há duas soluções.' + fim },
      { codigo: 'sinal_de_a_trocado', S: [-a - d, -a + d], explicacao: 'Trocaste o sinal de $' + tex(a) + '$. $' + absTex + '$ é a distância de $x$ a $' + tex(a) + '$, por isso as soluções são $' + tex(a) + ' \\pm ' + tex(d) + '$.' + fim },
      { codigo: 'menos_so_no_x', S: [a + d, -a - d], explicacao: 'No caso negativo escreveste $-x ' + (a > 0 ? '- ' + tex(a) : '+ ' + tex(-a)) + ' = ' + tex(d) + '$, trocando só o sinal de $x$. O caso negativo é $-(' + fArg(a) + ') = ' + tex(d) + '$, ou seja, $' + fArg(a) + ' = ' + tex(-d) + '$.' + fim },
    ].concat(extra);
    const qual = rng() < 0.5 ? 'maior' : 'menor';
    const resolucao = passos.concat([
      { passo: 'Tirar o módulo', porque: 'Um número tem módulo $' + tex(d) + '$ quando é $' + tex(d) + '$ ou $' + tex(-d) + '$.', calculo: fArg(a) + ' = ' + tex(d) + ' \\vee ' + fArg(a) + ' = ' + tex(-d) },
      { passo: 'Resolver as duas equações', porque: 'Passa-se $' + tex(-a) + '$ para o segundo membro em cada uma.', calculo: 'x = ' + tex(a + d) + ' \\vee x = ' + tex(a - d) },
    ]);
    const ex = { enunciado: 'Resolve a equação $' + eq + '$. ' + (formato === 'numerica' ? 'Qual é a ' + qual + ' solução?' : 'Qual é o conjunto-solução?'), resolucao, dados: { contexto, a, d, qual } };
    return fecharConjunto(rng, formato, ex, {
      certo, pega: qual === 'maior' ? maior : menor, erros: baralhar(rng, erros),
      verificacao: {
        passo: 'Substituir cada solução no módulo',
        calculo: '\\left|' + tex(a + d) + maisQ(-a) + '\\right| = |' + tex(d) + '| = ' + tex(d) + ',\\quad \\left|' + tex(a - d) + maisQ(-a) + '\\right| = |' + tex(-d) + '| = ' + tex(d),
        S: [a - d, a + d],
      },
    });
  }

  registar({
    subtema: 'ramos-modulo', tipo: 'equacao-modulo', nome: 'Equação com módulo',
    formatos: ['escolha', 'numerica'], contextos: ['simples', 'com-constante'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => equacaoModulo(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { a, d, qual } = p.dados;
      // Pesquisa: inteiros a distância d de a.
      const S = [];
      for (let x = -30; x <= 30; x++) if (Math.abs(x - a) === d) S.push(x);
      return confereConjunto(p, S, qual === 'maior' ? maior : menor);
    },
    limites(p) {
      return dentro([p.dados.a, p.dados.d], 7);
    },
  });

  // Zeros de uma função definida por ramos (com zeros a rejeitar pela condição).
  function zeroRamos(rng, formato, contexto) {
    const c = inteiro(rng, -3, 3);
    const m2 = escolher(rng, NAO_NULOS(3));
    const z2 = inteiro(rng, -6, 6);
    const b2 = -m2 * z2;
    const opE = '<';
    const opD = '>=';
    let ramos, cands, exprL, exprR;
    exprR = afimTex(m2, b2);
    if (contexto === 'lineares') {
      const m1 = escolher(rng, NAO_NULOS(3));
      const z1 = inteiro(rng, -6, 6);
      const b1 = -m1 * z1;
      exprL = afimTex(m1, b1);
      ramos = { L: (x) => m1 * x + b1, R: (x) => m2 * x + b2, m1, b1 };
      cands = [{ x: z1, ramo: 'L', ok: z1 < c, linear: true, m: m1, b: b1 }, { x: z2, ramo: 'R', ok: z2 >= c, linear: true, m: m2, b: b2 }];
    } else {
      const s = inteiro(rng, 1, 5);
      if (!(c > -s && c <= s)) return null;
      exprL = poliTex(1, 0, -s * s);
      ramos = { L: (x) => x * x - s * s, R: (x) => m2 * x + b2, s };
      cands = [{ x: -s, ramo: 'L', ok: true }, { x: s, ramo: 'L', ok: s < c, quad: true }, { x: z2, ramo: 'R', ok: z2 >= c, linear: true, m: m2, b: b2 }];
    }
    const validos = cands.filter((k) => k.ok).map((k) => k.x);
    const invalidos = cands.filter((k) => !k.ok);
    if (!invalidos.length || !validos.length) return null;
    if (formato === 'numerica' && validos.length !== 1) return null;
    if (new Set(cands.map((k) => k.x)).size !== cands.length) return null;
    const certo = ordenar(validos);
    const fim = certo.length === 1 ? ' O único zero de $f$ é $' + tex(certo[0]) + '$.' : ' Os zeros de $f$ são $' + tex(certo[0]) + '$ e $' + tex(certo[1]) + '$.';
    const descr = (k) => '$' + tex(k.x) + '$ anula o ramo ' + (k.ramo === 'L' ? '$' + exprL + '$' : '$' + exprR + '$') + ', mas não satisfaz a condição $' + (k.ramo === 'L' ? condTex(opE, c) : condTex(opD, c)) + '$';
    // Na numérica, o aluno que não confirma a condição dá um dos valores rejeitados.
    const erros = formato === 'numerica'
      ? invalidos.map((k, i) => ({ codigo: 'nao_verificou_condicao' + (i ? '_' + (i + 1) : ''), S: [k.x], explicacao: 'Não confirmaste a condição do ramo. ' + descr(k) + ', por isso não é zero de $f$.' + fim }))
      : [{ codigo: 'nao_verificou_condicao', S: cands.map((k) => k.x), explicacao: 'Não confirmaste as condições dos ramos. ' + invalidos.map(descr).join('; ') + ', por isso não é zero de $f$.' + fim }];
    if (contexto === 'lineares') {
      erros.push({ codigo: 'trocou_as_condicoes', S: invalidos.map((k) => k.x), explicacao: 'Ficaste com o valor que devias rejeitar e rejeitaste o outro. Cada valor confere-se com a condição do seu próprio ramo.' + fim });
    } else {
      const S = cands.filter((k) => k.ok && k.x !== -ramos.s).map((k) => k.x);
      erros.push({ codigo: 'so_raiz_positiva', S, explicacao: 'De $x^2 = ' + tex(ramos.s * ramos.s) + '$ ficaste só com $x = ' + tex(ramos.s) + '$, que depois rejeitaste. Também $x = ' + tex(-ramos.s) + '$ anula $' + exprL + '$, e esse satisfaz $' + condTex(opE, c) + '$.' + fim });
    }
    for (const k of cands.filter((u) => u.linear && u.ok && u.x !== 0)) {
      const zErr = -k.x;
      const okErr = satisfaz(k.ramo === 'L' ? opE : opD, zErr, c);
      const S = validos.filter((x) => x !== k.x).concat(okErr ? [zErr] : []);
      erros.push({ codigo: k.ramo === 'L' ? 'sinal_no_zero_do_1_ramo' : 'sinal_no_zero_do_2_ramo', S, explicacao: 'Em $' + afimTex(k.m, k.b) + ' = 0$ passaste $' + tex(k.b) + '$ para o outro membro sem trocar o sinal e obtiveste $x = ' + tex(zErr) + '$. Fica $' + texQ(k.m) + 'x = ' + tex(-k.b) + '$, $x = ' + tex(k.x) + '$.' + fim });
    }
    const resolucao = [
      { passo: 'Resolver em cada ramo', porque: 'Um zero de $f$ anula a expressão de um ramo.', calculo: (contexto === 'lineares' ? exprL + ' = 0 \\Leftrightarrow x = ' + tex(cands[0].x) : exprL + ' = 0 \\Leftrightarrow x = ' + tex(-ramos.s) + ' \\vee x = ' + tex(ramos.s)) + ';\\quad ' + exprR + ' = 0 \\Leftrightarrow x = ' + tex(z2) },
      { passo: 'Confirmar as condições', porque: 'Só conta o valor que satisfaz a condição do ramo onde foi obtido.', calculo: cands.map((k) => tex(k.x) + (k.ramo === 'L' ? ' < ' : ' \\geq ') + tex(c) + '\\ ' + (k.ok ? '\\checkmark' : '\\text{(falso)}')).join(',\\quad ') },
    ];
    const f = (x) => (x < c ? ramos.L(x) : ramos.R(x));
    const verifCalc = cands.map((k) => 'f(' + tex(k.x) + ') = ' + tex(f(k.x))).join(',\\quad ');
    const ex = {
      enunciado: 'Considera a função $f$ definida por $$' + ramosTex('f', 'x', [{ expr: exprL, cond: condTex(opE, c) }, { expr: exprR, cond: condTex(opD, c) }]) + '$$' + (formato === 'numerica' ? 'A função $f$ tem um único zero. Qual é?' : 'Qual é o conjunto dos zeros de $f$?'),
      resolucao, dados: { contexto, c, ramos: contexto === 'lineares' ? { m1: ramos.m1, b1: ramos.b1, m2, b2 } : { s: ramos.s, m2, b2 } },
    };
    return fecharConjunto(rng, formato, ex, {
      certo, pega: (S) => (S.length === 1 ? S[0] : NaN), erros: baralhar(rng, erros),
      verificacao: { passo: 'Calcular $f$ em cada candidato, escolhendo o ramo pela condição', calculo: verifCalc, S: cands.filter((k) => f(k.x) === 0).map((k) => k.x) },
    });
  }

  registar({
    subtema: 'ramos-modulo', tipo: 'zero-ramos', nome: 'Zeros de uma função definida por ramos',
    formatos: ['escolha', 'numerica'], contextos: ['lineares', 'quadratico'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => zeroRamos(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const { c, ramos: r } = p.dados;
      const L = p.dados.contexto === 'lineares' ? (x) => r.m1 * x + r.b1 : (x) => x * x - r.s * r.s;
      const f = (x) => (x < c ? L(x) : r.m2 * x + r.b2);
      // Pesquisa exaustiva nos inteiros (todos os zeros possíveis são inteiros).
      const S = [];
      for (let x = -30; x <= 30; x++) if (f(x) === 0) S.push(x);
      return confereConjunto(p, S, (T) => (T.length === 1 ? T[0] : NaN));
    },
    limites(p) {
      return Math.abs(p.dados.c) <= 3;
    },
  });
})();
