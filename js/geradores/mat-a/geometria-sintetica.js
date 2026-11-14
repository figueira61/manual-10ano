globalThis.Manual = globalThis.Manual || {};

// Geradores de Matemática A — Geometria sintética (pontos notáveis do triângulo).
// Subtemas: incentro-circuncentro, ortocentro-baricentro, euler-nove-pontos (ids <subtema>-<tipo>).
// As respostas vêm de Manual.calc.geometria; verificarIndependente e a verificação usam outro método
// (mediatrizes e alturas resolvidas pela regra de Cramer, fórmula de Heron, vetor 2/3 da mediana,
// circunferência que passa pelos pontos médios dos lados…).
// Coordenadas sempre exatas: inteiros ou meios (triângulos com vértices inteiros escolhidos para isso).
// Manual.calc só é lido dentro de gerar (no index.html os módulos de cálculo carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const AJ = G.ajudas;
  const calc = () => Manual.calc.geometria;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const fmt = AJ.fmt;
  const tex = AJ.tex;
  const limpo = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const r2 = (v) => Math.round(v * 100 + (v >= 0 ? 1e-7 : -1e-7)) / 100 + 0;
  const exato = (v, casas) => Math.abs(Math.round(v * Math.pow(10, casas)) / Math.pow(10, casas) - v) < 1e-9;
  const igualOuAprox = (v, casas = 2) => (exato(v, casas) ? ' = ' : ' \\approx ') + tex(v, casas);
  const fmtAprox = (v) => (exato(v, 2) ? '' : '≈ ') + fmt(v, 2);
  const ARRED_2 = 'às centésimas';
  const tentar = (construir) => AJ.tentar(construir, 'geometria sintética');
  const { fechar, fecharTexto } = AJ;

  // Cada gerar passa por notacaoPontos: uma só notação de pontos por item.
  function registar(def) {
    const gerar = def.gerar;
    G.registar(Object.assign({ disciplina: 'mat-a', tema: 'geometria-sintetica', id: def.subtema + '-' + def.tipo }, def, {
      gerar: (semente, opcoes) => notacaoPontos(gerar(semente, opcoes)),
    }));
  }

  // ---------------------------------------------------------------- pontos e vetores (sem Manual.calc)
  const ponto = (P) => [limpo(P[0]), limpo(P[1])];
  const mais = (P, Q) => ponto([P[0] + Q[0], P[1] + Q[1]]);
  const menos = (P, Q) => ponto([P[0] - Q[0], P[1] - Q[1]]);
  const vezes = (k, P) => ponto([k * P[0], k * P[1]]);
  const medio = (P, Q) => ponto([(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]);
  const somaP = (vs) => vs.reduce((s, P) => mais(s, P), [0, 0]);
  const escalar = (u, v) => limpo(u[0] * v[0] + u[1] * v[1]);
  const d2 = (P, Q) => escalar(menos(Q, P), menos(Q, P));
  const iguais = (P, Q) => !!P && !!Q && Math.abs(P[0] - Q[0]) < 1e-9 && Math.abs(P[1] - Q[1]) < 1e-9;
  const inteiroV = (v) => Number.isInteger(limpo(v));
  // Coordenadas inteiras ou meios (as únicas que os geradores mostram).
  const simpatico = (P) => P.every((v) => inteiroV(2 * v));
  const area2 = (P, Q, R) => Math.abs((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0]));

  // Circuncentro pela interseção de duas mediatrizes (regra de Cramer).
  function circuncentroCramer(P, Q, R) {
    const a1 = Q[0] - P[0], b1 = Q[1] - P[1], c1 = (Q[0] * Q[0] + Q[1] * Q[1] - P[0] * P[0] - P[1] * P[1]) / 2;
    const a2 = R[0] - P[0], b2 = R[1] - P[1], c2 = (R[0] * R[0] + R[1] * R[1] - P[0] * P[0] - P[1] * P[1]) / 2;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) return null;
    return ponto([(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det]);
  }

  // Ortocentro pela interseção de duas alturas: (X − P)·(R − Q) = 0 e (X − Q)·(R − P) = 0.
  function ortocentroCramer(P, Q, R) {
    const a1 = R[0] - Q[0], b1 = R[1] - Q[1], c1 = a1 * P[0] + b1 * P[1];
    const a2 = R[0] - P[0], b2 = R[1] - P[1], c2 = a2 * Q[0] + b2 * Q[1];
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) return null;
    return ponto([(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det]);
  }

  // ---------------------------------------------------------------- escrita
  const NOMES = ['A', 'B', 'C'];
  const seg = (i, j) => NOMES[Math.min(i, j)] + NOMES[Math.max(i, j)];
  const par = (v) => (v < 0 ? '(' + tex(v) + ')' : tex(v));
  const somaTex = (vs) => vs.map((v, i) => (i === 0 ? tex(v) : (v < 0 ? ' - ' + tex(-v) : ' + ' + tex(v)))).join('');
  // Notação de pontos (uma só por item) e leitura de opções: Manual.geradores.ajudas.
  const { texPonto, notacaoPontos, lerPonto } = AJ;
  const opPonto = (P) => '$' + texPonto(P) + '$';
  const nomeado = (n, P) => '$' + n + texPonto(P) + '$';
  const listaVertices = (vs) => nomeado('A', vs[0]) + ', ' + nomeado('B', vs[1]) + ' e ' + nomeado('C', vs[2]);
  const medioTex = (P, Q) => '\\left(\\dfrac{' + somaTex([P[0], Q[0]]) + '}{2}, \\dfrac{' + somaTex([P[1], Q[1]]) + '}{2}\\right) = ' + texPonto(medio(P, Q));
  function dist2Tex(nome, P, Q) {
    const w = menos(Q, P);
    return '\\overline{' + nome + '}^2 = ' + par(w[0]) + '^2 + ' + par(w[1]) + '^2 = ' + tex(d2(P, Q));
  }
  // Quadrados dos três lados, em array (passo em bloco).
  function ladosTex(vs) {
    const pares = [[0, 1], [1, 2], [0, 2]];
    return '\\begin{array}{l} ' + pares.map(([i, j]) => dist2Tex(seg(i, j), vs[i], vs[j])).join(' \\\\ ') + ' \\end{array}';
  }
  // Declive da reta PQ como fração irredutível { n, d } (d > 0); null se a reta for vertical.
  const mdc = (a, b) => (b ? mdc(b, a % b) : a);
  function declive(P, Q) {
    let n = Q[1] - P[1];
    let d = Q[0] - P[0];
    if (Math.abs(d) < 1e-9) return null;
    while (!inteiroV(n) || !inteiroV(d)) { n *= 2; d *= 2; } // coordenadas com meios
    n = limpo(n);
    d = limpo(d);
    if (d < 0) { n = -n; d = -d; }
    const g = mdc(Math.abs(n), d) || 1;
    return { n: limpo(n / g), d: limpo(d / g) };
  }
  const fracTex = (f) => (f.d === 1 ? tex(f.n) : (f.n < 0 ? '-' : '') + '\\dfrac{' + tex(Math.abs(f.n)) + '}{' + tex(f.d) + '}');
  const fatorFrac = (f) => (f.n < 0 ? '\\left(' + fracTex(f) + '\\right)' : fracTex(f));
  // Perpendicularidade das retas PQ e RS pelos declives (10.º ano): m₁ × m₂ = −1,
  // ou, sem declive, uma reta vertical e a outra horizontal.
  function perpendicularTex(n1, P, Q, n2, R, S) {
    const m1 = declive(P, Q);
    const m2 = declive(R, S);
    if (!m1 || !m2) {
      const [nv, V, nh, Hz] = !m1 ? [n1, P, n2, R] : [n2, R, n1, P];
      return '\\text{reta } ' + nv + '\\colon x = ' + tex(V[0]) + '\\ \\text{(vertical)},\\quad \\text{reta } ' + nh + '\\colon y = ' + tex(Hz[1]) + '\\ \\text{(horizontal)}';
    }
    const prod = { n: m1.n * m2.n, d: m1.d * m2.d };
    return 'm_{' + n1 + '} = ' + fracTex(m1) + ',\\quad m_{' + n2 + '} = ' + fracTex(m2) + ',\\quad m_{' + n1 + '} \\times m_{' + n2 + '} = ' +
      fatorFrac(m1) + ' \\times ' + fatorFrac(m2) + ' = ' + tex(prod.n / prod.d);
  }
  const comp = (v) => '$' + tex(v, 2) + '$';
  const compCm = (v) => '$' + tex(v, 2) + '$ cm';
  const EIXO = ['abcissa', 'ordenada'];
  const pedido = (formato, eixo, oQue) => (formato === 'numerica' ? 'Qual é a ' + EIXO[eixo] + ' ' + oQue + '?' : 'Quais são as coordenadas ' + oQue + '?');

  // ---------------------------------------------------------------- esquema
  const CAIXA = { xmin: -3, xmax: 9, ymin: -3, ymax: 8 };
  const naCaixa = (P) => simpatico(P) && P[0] >= CAIXA.xmin && P[0] <= CAIXA.xmax && P[1] >= CAIXA.ymin && P[1] <= CAIXA.ymax;
  function esquema(vs, camadas) {
    if (!vs.every(naCaixa)) return undefined;
    return { id: 'pontos-notaveis', opcoes: { A: vs[0].slice(), B: vs[1].slice(), C: vs[2].slice(), camadas: camadas.slice() } };
  }

  // ---------------------------------------------------------------- fecho de exercícios cuja resposta é um ponto
  // numerica: pergunta-se uma coordenada (eixo); escolha: o ponto. erros: [{ codigo, P, explicacao }]
  // (só entram pontos de coordenadas inteiras ou meios). verificacao.P: o ponto obtido pelo outro método.
  function fecharPonto(rng, formato, ex, o) {
    const erros = o.erros.filter((e) => e && simpatico(e.P));
    const verif = { passo: o.verificacao.passo, calculo: o.verificacao.calculo };
    if (formato === 'numerica') {
      return fechar(rng, 'numerica', ex, {
        resposta: o.certo[o.eixo], tolerancia: 0,
        erros: erros.map((e) => ({ codigo: e.codigo, valor: e.P[o.eixo], explicacao: e.explicacao })),
        verificacao: Object.assign(verif, { valor: o.verificacao.P[o.eixo] }),
      });
    }
    ex.verificacao = verif;
    return fecharTexto(rng, ex, opPonto(o.certo), erros.map((e) => ({ codigo: e.codigo, texto: opPonto(e.P), explicacao: e.explicacao })), opPonto(o.verificacao.P));
  }

  function conferePonto(p, P) {
    if (!P) return false;
    if (p.formato === 'numerica') return Math.abs(p.resposta - P[p.dados.eixo]) <= p.tolerancia + 1e-9;
    return iguais(lerPonto(p.opcoes[p.correta]), P);
  }

  const dentro = (P, lim = 40) => Array.isArray(P) && P.every((v) => Number.isFinite(v) && Math.abs(v) <= lim);
  const verticesNaCaixa = (vs) => Array.isArray(vs) && vs.length === 3 && vs.every(naCaixa) && area2(vs[0], vs[1], vs[2]) > 0;

  // ---------------------------------------------------------------- triângulos retângulos
  const DIRECOES_EIXOS = [[1, 0], [0, 1]];
  const DIRECOES_OBLIQUAS = [[1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2]];

  function translacao(rng, rel) {
    const xs = rel.map((p) => p[0]);
    const ys = rel.map((p) => p[1]);
    const x0 = CAIXA.xmin - Math.min(...xs), x1 = CAIXA.xmax - Math.max(...xs);
    const y0 = CAIXA.ymin - Math.min(...ys), y1 = CAIXA.ymax - Math.max(...ys);
    if (x0 > x1 || y0 > y1) return null;
    return [inteiro(rng, x0, x1), inteiro(rng, y0, y1)];
  }

  // Triângulo retângulo com o ângulo reto em V e catetos u = s·d e v = ±t·d⊥, dentro da caixa do esquema.
  // Os nomes A, B, C são sorteados: devolve { vs, iV, iU, iW } (índices em vs dos vértices V, U, W).
  function retangulo(rng, s, t, d) {
    const sg = rng() < 0.5 ? 1 : -1;
    const u = [s * d[0], s * d[1]];
    const v = [-sg * t * d[1], sg * t * d[0]];
    const rel = [[0, 0], u, v];
    const T = translacao(rng, rel);
    if (!T) return null;
    const pts = rel.map((p) => mais(T, p));
    const ordem = baralhar(rng, [0, 1, 2]);
    const vs = [];
    ordem.forEach((pos, k) => { vs[pos] = pts[k]; });
    return { vs, iV: ordem[0], iU: ordem[1], iW: ordem[2] };
  }

  // Vértice do ângulo reto, pelo recíproco do teorema de Pitágoras (sem Manual.calc); -1 se não houver.
  function verticeReto(vs) {
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3, k = (i + 2) % 3;
      if (Math.abs(d2(vs[i], vs[j]) + d2(vs[i], vs[k]) - d2(vs[j], vs[k])) < 1e-9) return i;
    }
    return -1;
  }

  function pitagorasTex(T) {
    const { vs, iV, iU, iW } = T;
    return '\\overline{' + seg(iV, iU) + '}^2 + \\overline{' + seg(iV, iW) + '}^2 = ' + tex(d2(vs[iV], vs[iU])) + ' + ' + tex(d2(vs[iV], vs[iW])) +
      ' = ' + tex(d2(vs[iU], vs[iW])) + ' = \\overline{' + seg(iU, iW) + '}^2';
  }

  // ================================================================ incentro e circuncentro
  function circuncentroCoordenadas(rng, formato) {
    const C = calc();
    const d = escolher(rng, DIRECOES_EIXOS.concat(DIRECOES_OBLIQUAS));
    // Catetos com componentes pares: pontos médios inteiros.
    const s = escolher(rng, [2, 4, 6]);
    const t = escolher(rng, [2, 4, 6]);
    const T = retangulo(rng, s, t, d);
    if (!T) return null;
    const { vs, iV, iU, iW } = T;
    const [V, U, W] = [vs[iV], vs[iU], vs[iW]];
    const nV = NOMES[iV], nU = NOMES[iU], nW = NOMES[iW];
    const O = ponto(C.circuncentro(vs[0], vs[1], vs[2]).centro);
    const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
    const hip = '$[' + seg(iU, iW) + ']$';
    const Gb = ponto(C.baricentro(vs[0], vs[1], vs[2]));
    const Mc = medio(V, U);
    const enunciado = 'Considera o triângulo de vértices ' + listaVertices(vs) + '. ' + pedido(formato, eixo, 'do circuncentro $O$ deste triângulo');
    const resolucao = [
      { passo: 'Calcular os quadrados dos lados', porque: 'Com eles vê-se se o triângulo é retângulo e onde está o ângulo reto.', calculo: ladosTex(vs), bloco: true },
      { passo: 'Encontrar o ângulo reto', porque: 'Pelo recíproco do teorema de Pitágoras, o ângulo em ' + nV + ' é reto e ' + hip + ' é a hipotenusa.', calculo: pitagorasTex(T) },
      { passo: 'Usar a propriedade do triângulo retângulo', porque: 'Num triângulo retângulo, o circuncentro é o ponto médio da hipotenusa (a hipotenusa é um diâmetro da circunferência circunscrita).' },
      { passo: 'Calcular o ponto médio da hipotenusa', porque: 'O ponto médio tem por coordenadas a média das coordenadas dos extremos.', calculo: 'O = ' + medioTex(U, W) },
    ];
    const erros = [
      { codigo: 'vertice_angulo_reto', P: V, explicacao: 'Escolheste o vértice do ângulo reto, ' + nomeado(nV, V) + '. Esse é o ortocentro (os catetos são alturas). O circuncentro é o ponto médio da hipotenusa ' + hip + ', ' + nomeado('O', O) + '.' },
      { codigo: 'ponto_medio_cateto', P: Mc, explicacao: opPonto(Mc) + ' é o ponto médio do cateto $[' + seg(iV, iU) + ']$. O circuncentro é o ponto médio da hipotenusa ' + hip + ', o lado oposto ao ângulo reto.' },
      { codigo: 'nao_dividiu_por_2', P: mais(U, W), explicacao: 'Somaste as coordenadas de ' + nU + ' e de ' + nW + ', ' + opPonto(mais(U, W)) + ', mas não dividiste por 2. O ponto médio de ' + hip + ' é ' + opPonto(O) + '.' },
      { codigo: 'baricentro', P: Gb, explicacao: 'Fizeste a média dos três vértices, que dá o baricentro ' + nomeado('G', Gb) + ' (encontro das medianas). O circuncentro é o encontro das mediatrizes, aqui o ponto médio da hipotenusa ' + hip + '.' },
      { codigo: 'ponto_medio_outro_cateto', P: medio(V, W), explicacao: opPonto(medio(V, W)) + ' é o ponto médio do cateto $[' + seg(iV, iW) + ']$, não da hipotenusa ' + hip + '.' },
    ];
    const Oind = circuncentroCramer(vs[0], vs[1], vs[2]);
    const ex = { enunciado, resolucao, dados: { contexto: 'coordenadas', vertices: vs, eixo }, esquema: esquema(vs, ['circuncentro']) };
    return fecharPonto(rng, formato, ex, {
      certo: O, eixo, erros,
      verificacao: {
        passo: 'Confirmar que $O$ está à mesma distância dos três vértices',
        calculo: dist2Tex('O' + nV, O, V) + ',\\quad ' + dist2Tex('O' + nU, O, U) + ',\\quad ' + dist2Tex('O' + nW, O, W),
        P: Oind,
      },
    });
  }

  // [direção, s, t] com hipotenusa inteira: |d|²(s² + t²) quadrado perfeito.
  const CASOS_OBLIQUOS = [
    [[1, 1], 2, 2], [[1, 1], 3, 3], [[1, 1], 4, 4], [[1, -1], 3, 3], [[2, 1], 1, 2], [[2, 1], 2, 1],
    [[1, 2], 2, 4], [[2, 1], 2, 4], [[1, -2], 1, 2], [[2, -1], 4, 2],
  ];

  function circuncentroRaio(rng, formato) {
    const C = calc();
    // Hipotenusa inteira: catetos 3-4-5 / 6-8-10 paralelos aos eixos, ou oblíquos (catetos irracionais, só na numérica).
    const [d, s, t] = formato === 'escolha' || rng() < 0.5
      ? [escolher(rng, DIRECOES_EIXOS)].concat(escolher(rng, [[3, 4], [4, 3], [6, 8], [8, 6]]))
      : escolher(rng, CASOS_OBLIQUOS);
    const T = retangulo(rng, s, t, d);
    if (!T) return null;
    const { vs, iV, iU, iW } = T;
    const [V, U, W] = [vs[iV], vs[iU], vs[iW]];
    const nV = NOMES[iV];
    const c = Math.sqrt(d2(U, W));
    if (!inteiroV(c)) return null;
    const R = limpo(C.circuncentro(vs[0], vs[1], vs[2]).raio);
    const a = Math.sqrt(d2(V, U));
    const b = Math.sqrt(d2(V, W));
    const catetosExatos = exato(a, 2) && exato(b, 2);
    const hip = '$[' + seg(iU, iW) + ']$';
    const segH = seg(iU, iW);
    const enunciado = 'Considera o triângulo de vértices ' + listaVertices(vs) + '. Qual é o raio da circunferência circunscrita a este triângulo?';
    const resolucao = [
      { passo: 'Calcular os quadrados dos lados', porque: 'Com eles vê-se se o triângulo é retângulo e onde está o ângulo reto.', calculo: ladosTex(vs), bloco: true },
      { passo: 'Encontrar o ângulo reto', porque: 'Pelo recíproco do teorema de Pitágoras, o ângulo em ' + nV + ' é reto e ' + hip + ' é a hipotenusa.', calculo: pitagorasTex(T) },
      { passo: 'Usar a propriedade do triângulo retângulo', porque: 'O circuncentro é o ponto médio da hipotenusa, por isso a hipotenusa é um diâmetro e o raio é metade dela.', calculo: 'R = \\dfrac{\\overline{' + segH + '}}{2} = \\dfrac{\\sqrt{' + tex(d2(U, W)) + '}}{2} = \\dfrac{' + tex(c) + '}{2} = ' + tex(R, 2) },
    ];
    const erros = [
      { codigo: 'hipotenusa_como_raio', valor: c, explicacao: 'Tomaste a hipotenusa, ' + fmt(c) + ', como raio. A hipotenusa é um diâmetro da circunferência circunscrita (o centro é o seu ponto médio), por isso $R = ' + tex(c) + ' \\div 2 = ' + tex(R, 2) + '$.' },
    ];
    if (catetosExatos) {
      const maior = Math.max(a, b);
      erros.push(
        { codigo: 'metade_cateto', valor: maior / 2, explicacao: 'Dividiste por 2 o cateto que mede ' + fmt(maior) + '. O diâmetro da circunferência circunscrita é a hipotenusa ' + hip + ', que mede ' + fmt(c) + ', não um cateto.' },
        { codigo: 'soma_catetos', valor: (a + b) / 2, explicacao: 'Usaste ' + fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) + ' como hipotenusa, o que dá ' + fmt((a + b) / 2, 2) + '. Pelo teorema de Pitágoras, a hipotenusa é $\\sqrt{' + tex(a * a) + ' + ' + tex(b * b) + '} = ' + tex(c) + '$, e $R = ' + tex(R, 2) + '$.' },
        { codigo: 'raio_inscrito', valor: (a + b - c) / 2, explicacao: 'Calculaste $\\dfrac{' + tex(a) + ' + ' + tex(b) + ' - ' + tex(c) + '}{2} = ' + tex((a + b - c) / 2, 2) + '$, o raio da circunferência inscrita (tangente aos lados). A circunscrita passa pelos vértices e tem raio igual a metade da hipotenusa.' },
      );
    }
    erros.push({ codigo: 'sem_raiz', valor: d2(U, W) / 2, explicacao: 'Esqueceste a raiz quadrada: $\\overline{' + segH + '}^2 = ' + tex(d2(U, W)) + '$, logo $\\overline{' + segH + '} = ' + tex(c) + '$ e $R = ' + tex(R, 2) + '$.' });
    const O = medio(U, W);
    const Oind = circuncentroCramer(vs[0], vs[1], vs[2]);
    const Rind = Math.sqrt(d2(Oind, V));
    const w = menos(V, O);
    return fechar(rng, formato, { enunciado, resolucao, dados: { contexto: 'raio', vertices: vs }, esquema: esquema(vs, ['circuncentro']) }, {
      resposta: R, tolerancia: 0.01, texto: comp, erros,
      verificacao: {
        passo: 'Confirmar que o ponto médio da hipotenusa está à distância $R$ do vértice do ângulo reto',
        calculo: 'O' + texPonto(O) + ',\\quad \\overline{O' + nV + '} = \\sqrt{' + par(w[0]) + '^2 + ' + par(w[1]) + '^2}' + igualOuAprox(Rind, 2),
        valor: limpo(Rind),
      },
    });
  }

  registar({
    subtema: 'incentro-circuncentro', tipo: 'circuncentro-retangulo', nome: 'Circuncentro de um triângulo retângulo',
    formatos: ['escolha', 'numerica'], contextos: ['coordenadas', 'raio'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => (contexto === 'raio' ? circuncentroRaio(rng, formato) : circuncentroCoordenadas(rng, formato)));
    },
    verificarIndependente(p) {
      const vs = p.dados.vertices;
      const O = circuncentroCramer(vs[0], vs[1], vs[2]);
      if (!O || verticeReto(vs) < 0) return false;
      if (p.dados.contexto === 'raio') return AJ.confere(p, limpo(Math.sqrt(d2(O, vs[0]))), comp);
      return conferePonto(p, O);
    },
    limites(p) {
      return verticesNaCaixa(p.dados.vertices) && (p.formato !== 'numerica' || (p.resposta >= -20 && p.resposta <= 20));
    },
  });

  // Triângulos de lados inteiros com vértices inteiros: base [(0, 0), (b, 0)] e terceiro vértice (x, h).
  const TRIANGULOS_HERON = [
    [4, 0, 3], [8, 0, 6], [6, 0, 8], [12, 0, 5], [5, 0, 12], [15, 0, 8], [9, 0, 12], [12, 0, 9], [7, 0, 24],
    [6, 3, 4], [12, 6, 8], [14, 5, 12], [14, 9, 12], [16, 8, 15], [24, 12, 5], [18, 9, 12], [21, 6, 8], [21, 15, 8],
  ];
  // Rotações de 90° e reflexões (mantêm coordenadas inteiras e comprimentos).
  const SIMETRIAS = [
    (p) => [p[0], p[1]], (p) => [-p[1], p[0]], (p) => [-p[0], -p[1]], (p) => [p[1], -p[0]],
    (p) => [p[0], -p[1]], (p) => [-p[0], p[1]], (p) => [p[1], p[0]], (p) => [-p[1], -p[0]],
  ];

  // Raio da circunferência inscrita pela fórmula de Heron: r = √((s − a)(s − b)(s − c)/s).
  function raioHeron(a, b, c) {
    const s = (a + b + c) / 2;
    return Math.sqrt(((s - a) * (s - b) * (s - c)) / s);
  }

  registar({
    subtema: 'incentro-circuncentro', tipo: 'raio-inscrito', nome: 'Raio da circunferência inscrita',
    formatos: ['numerica', 'escolha'], contextos: ['coordenadas', 'lados'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const [b, x, h] = escolher(rng, TRIANGULOS_HERON);
        const base = [[0, 0], [b, 0], [x, h]];
        const coords = contexto === 'coordenadas';
        let vs;
        let iBase; // índices em vs da base (lado paralelo a um eixo) e do vértice oposto
        if (coords) {
          const sim = escolher(rng, SIMETRIAS);
          const rel = base.map((p) => ponto(sim(p)));
          const T = [inteiro(rng, -3, 3), inteiro(rng, -3, 3)];
          const pts = rel.map((p) => mais(T, p));
          const ordem = baralhar(rng, [0, 1, 2]);
          vs = [];
          ordem.forEach((pos, k) => { vs[pos] = pts[k]; });
          iBase = [ordem[0], ordem[1], ordem[2]];
        } else {
          vs = base.map(ponto);
          iBase = [0, 1, 2];
        }
        const lado = (i, j) => limpo(Math.sqrt(d2(vs[i], vs[j])));
        const la = lado(1, 2), lb = lado(0, 2), lc = lado(0, 1);
        const P = limpo(la + lb + lc);
        const Ar = limpo((b * h) / 2);
        const r = limpo(C.incentro(vs[0], vs[1], vs[2]).raio);
        if (!exato(r, 2)) return null;
        const lb0 = b; // comprimento da base
        const ladosOrd = [la, lb, lc].slice().sort((u, v) => u - v);
        const ret = Math.abs(ladosOrd[0] * ladosOrd[0] + ladosOrd[1] * ladosOrd[1] - ladosOrd[2] * ladosOrd[2]) < 1e-9;
        const unid = coords ? '' : ' cm';
        const texto = coords ? comp : compCm;
        let enunciado;
        const resolucao = [];
        if (coords) {
          const nb = seg(iBase[0], iBase[1]);
          const nOp = NOMES[iBase[2]];
          enunciado = 'Considera o triângulo de vértices ' + listaVertices(vs) + '. Qual é o raio da circunferência inscrita neste triângulo?';
          const ladoTex = (i, j) => {
            const w = menos(vs[j], vs[i]);
            return '\\overline{' + seg(i, j) + '} = \\sqrt{' + par(w[0]) + '^2 + ' + par(w[1]) + '^2} = ' + tex(lado(i, j));
          };
          resolucao.push(
            { passo: 'Calcular os comprimentos dos lados', porque: 'A distância entre dois pontos vem do teorema de Pitágoras.', calculo: '\\begin{array}{l} ' + [[0, 1], [1, 2], [0, 2]].map(([i, j]) => ladoTex(i, j)).join(' \\\\ ') + ' \\end{array}', bloco: true },
            { passo: 'Calcular o perímetro', porque: 'O perímetro é a soma dos três lados.', calculo: 'P = ' + somaTex([lc, la, lb]) + ' = ' + tex(P) },
            { passo: 'Calcular a área', porque: 'O lado $[' + nb + ']$ é paralelo a um eixo e mede ' + fmt(lb0) + '; a altura relativa a esse lado é a distância de ' + nOp + ' à reta ' + nb + ', ' + fmt(h) + '.', calculo: 'A = \\dfrac{' + tex(lb0) + ' \\times ' + tex(h) + '}{2} = ' + tex(Ar) },
          );
        } else {
          const ls = baralhar(rng, [la, lb, lc]);
          enunciado = 'Os lados de um triângulo medem ' + fmt(ls[0]) + ' cm, ' + fmt(ls[1]) + ' cm e ' + fmt(ls[2]) + ' cm. A altura relativa ao lado de ' + fmt(lb0) + ' cm mede ' + fmt(h) + ' cm. Qual é o raio da circunferência inscrita neste triângulo?';
          resolucao.push(
            { passo: 'Calcular o perímetro', porque: 'O perímetro é a soma dos três lados.', calculo: 'P = ' + somaTex(ls) + ' = ' + tex(P) },
            { passo: 'Calcular a área', porque: 'A área é metade do produto de um lado pela altura relativa a esse lado.', calculo: 'A = \\dfrac{' + tex(lb0) + ' \\times ' + tex(h) + '}{2} = ' + tex(Ar) },
          );
        }
        resolucao.push({
          passo: 'Aplicar $r = \\dfrac{2A}{P}$',
          porque: 'Unindo o incentro aos vértices, o triângulo divide-se em três triângulos com altura $r$ e bases nos três lados, logo $A = \\dfrac{r \\times P}{2}$.',
          calculo: 'r = \\dfrac{2 \\times ' + tex(Ar) + '}{' + tex(P) + '} = ' + tex(r, 2),
        });
        const erros = [
          { codigo: 'area_sobre_perimetro', valor: limpo(Ar / P), explicacao: 'Dividiste a área pelo perímetro, $' + tex(Ar) + ' \\div ' + tex(P) + ' = ' + tex(Ar / P, 2) + '$. Como $A = r \\times s$, em que $s$ é o semiperímetro, $r = \\dfrac{A}{s} = \\dfrac{2A}{P} = ' + tex(r, 2) + '$.' },
          { codigo: 'area_sem_metade', valor: limpo((4 * Ar) / P), explicacao: 'Calculaste a área como ' + fmt(lb0) + ' × ' + fmt(h) + ' = ' + fmt(lb0 * h) + ', sem dividir por 2. A área é ' + fmt(Ar) + unid + (unid ? '²' : '') + ', e $r = \\dfrac{2 \\times ' + tex(Ar) + '}{' + tex(P) + '} = ' + tex(r, 2) + '$.' },
          { codigo: 'distancia_do_baricentro', valor: limpo(h / 3), explicacao: '$\\dfrac{' + tex(h) + '}{3} = ' + tex(h / 3, 2) + '$ é a distância do baricentro ao lado de comprimento ' + fmt(lb0) + ' (o baricentro fica a um terço da altura). O incentro é o ponto equidistante dos três lados, e essa distância é $r = \\dfrac{2A}{P} = ' + tex(r, 2) + '$.' },
        ];
        if (ret) {
          erros.push({ codigo: 'raio_circunscrito', valor: limpo(ladosOrd[2] / 2), explicacao: 'Metade da hipotenusa, ' + fmt(ladosOrd[2] / 2, 2) + ', é o raio da circunferência circunscrita (o circuncentro é o ponto médio da hipotenusa). A circunferência inscrita é tangente aos lados e tem raio $r = \\dfrac{2A}{P} = ' + tex(r, 2) + '$.' });
        }
        // Verificação (10.º ano): no triângulo retângulo, r = (a + b − c)/2 (tangentes iguais a partir de cada vértice);
        // nos outros, os três triângulos com vértice no incentro e altura r somam a área. verificarIndependente usa Heron.
        const rH = raioHeron(la, lb, lc);
        const verificacao = ret
          ? {
            passo: 'Confirmar com $r = \\dfrac{a + b - c}{2}$, válida no triângulo retângulo (catetos $a$ e $b$, hipotenusa $c$), porque as tangentes tiradas de cada vértice à circunferência inscrita são iguais',
            calculo: 'r = \\dfrac{' + tex(ladosOrd[0]) + ' + ' + tex(ladosOrd[1]) + ' - ' + tex(ladosOrd[2]) + '}{2} = ' + tex((ladosOrd[0] + ladosOrd[1] - ladosOrd[2]) / 2, 2),
            valor: limpo((ladosOrd[0] + ladosOrd[1] - ladosOrd[2]) / 2),
          }
          : {
            passo: 'Confirmar que os três triângulos com vértice no incentro, de bases nos lados e altura $r$, somam a área do triângulo, que é ' + fmt(Ar),
            calculo: '\\dfrac{' + tex(la) + ' \\times ' + tex(r, 2) + '}{2} + \\dfrac{' + tex(lb) + ' \\times ' + tex(r, 2) + '}{2} + \\dfrac{' + tex(lc) + ' \\times ' + tex(r, 2) + '}{2} = ' +
              somaTex([la * rH / 2, lb * rH / 2, lc * rH / 2].map((v) => limpo(v))) + ' = ' + tex(limpo(P * rH / 2), 2),
            valor: r2(rH),
          };
        return fechar(rng, formato, { enunciado, resolucao, dados: { contexto, vertices: vs, lados: [la, lb, lc], base: lb0, altura: h }, esquema: esquema(vs, ['incentro']) }, {
          resposta: r, tolerancia: 0.01, unidade: coords ? undefined : 'cm', texto, erros: erros.filter((e) => exato(e.valor, 2)), verificacao,
        });
      });
    },
    verificarIndependente(p) {
      let lados = p.dados.lados;
      if (p.dados.contexto === 'coordenadas') {
        const vs = p.dados.vertices;
        lados = [[1, 2], [0, 2], [0, 1]].map(([i, j]) => Math.sqrt(d2(vs[i], vs[j])));
      }
      const r = raioHeron(lados[0], lados[1], lados[2]);
      return AJ.confere(p, r2(r), p.dados.contexto === 'coordenadas' ? comp : compCm);
    },
    limites(p) {
      const { lados, altura } = p.dados;
      return lados.every((l) => l > 0 && l <= 30) && altura > 0 && altura <= 24 && (p.formato !== 'numerica' || (p.resposta > 0 && p.resposta <= 6));
    },
  });

  // Qual dos pontos notáveis? (bissetrizes, mediatrizes, alturas, medianas)
  const PONTOS = {
    incentro: {
      opcao: 'O incentro.',
      retas: ['bissetrizes dos ângulos internos', 'semirretas que dividem cada ângulo interno em dois ângulos iguais'],
      prop: ['É equidistante dos três lados do triângulo.', 'É o centro da circunferência tangente aos três lados do triângulo.'],
      resumo: 'o ponto de encontro das bissetrizes dos ângulos internos e é equidistante dos três lados',
      verif: '\\text{bissetrizes} \\Rightarrow \\text{mesma distância aos três lados}',
      ensina: ['A bissetriz de um ângulo', 'Cada ponto da bissetriz de um ângulo está à mesma distância dos dois lados desse ângulo. O ponto comum às três bissetrizes está, por isso, à mesma distância dos três lados e é o centro da circunferência inscrita.'],
    },
    circuncentro: {
      opcao: 'O circuncentro.',
      retas: ['mediatrizes dos lados', 'retas perpendiculares a cada lado que passam pelo seu ponto médio'],
      prop: ['É equidistante dos três vértices do triângulo.', 'É o centro da circunferência que passa pelos três vértices do triângulo.', 'Num triângulo retângulo, é o ponto médio da hipotenusa.'],
      resumo: 'o ponto de encontro das mediatrizes dos lados e é equidistante dos três vértices',
      verif: '\\text{mediatrizes} \\Rightarrow \\text{mesma distância aos três vértices}',
      ensina: ['A mediatriz de um segmento', 'A mediatriz de um segmento é a reta perpendicular a ele no ponto médio, e cada ponto dela está à mesma distância dos dois extremos. O ponto comum às três mediatrizes está, por isso, à mesma distância dos três vértices.'],
    },
    ortocentro: {
      opcao: 'O ortocentro.',
      retas: ['retas que contêm as alturas', 'retas perpendiculares a cada lado que passam pelo vértice oposto'],
      prop: ['Num triângulo retângulo, coincide com o vértice do ângulo reto.', 'Num triângulo obtusângulo, fica fora do triângulo, do lado do vértice do ângulo obtuso.'],
      resumo: 'o ponto de encontro das retas que contêm as alturas',
      verif: '\\text{alturas} \\Rightarrow \\text{perpendiculares aos lados, pelos vértices opostos}',
      ensina: ['A altura de um triângulo', 'A altura relativa a um lado é o segmento que vai do vértice oposto até à reta desse lado, perpendicular a ela. Num triângulo retângulo, cada cateto é a altura relativa ao outro, por isso as alturas cruzam-se no vértice do ângulo reto.'],
    },
    baricentro: {
      opcao: 'O baricentro.',
      retas: ['medianas', 'segmentos que unem cada vértice ao ponto médio do lado oposto'],
      prop: ['É o centro de massa de uma placa triangular homogénea.', 'Está em cada mediana, a dois terços do seu comprimento a contar do vértice.', 'Tem por coordenadas a média das coordenadas dos três vértices.'],
      resumo: 'o ponto de encontro das medianas e está a dois terços de cada uma a partir do vértice',
      verif: '\\text{medianas} \\Rightarrow \\text{a dois terços de cada mediana, a contar do vértice}',
      ensina: ['A mediana de um triângulo', 'A mediana une um vértice ao ponto médio do lado oposto e divide o triângulo em duas partes com a mesma área. Por isso, o ponto comum às três medianas é o ponto de equilíbrio (centro de massa) do triângulo.'],
    },
  };
  const CHAVES_PONTOS = Object.keys(PONTOS);
  const pontoDoTexto = (contexto, texto) => CHAVES_PONTOS.filter((k) => PONTOS[k][contexto === 'retas' ? 'retas' : 'prop'].includes(texto));

  registar({
    subtema: 'incentro-circuncentro', tipo: 'qual-ponto', nome: 'Qual é o ponto notável?',
    formatos: ['escolha'], contextos: ['retas', 'propriedade'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const k = escolher(rng, CHAVES_PONTOS);
        const Pt = PONTOS[k];
        const retas = contexto === 'retas';
        const texto = escolher(rng, retas ? Pt.retas : Pt.prop);
        const enunciado = retas
          ? 'As três ' + texto + ' de um triângulo intersetam-se num só ponto. Como se chama esse ponto?'
          : 'Qual dos pontos notáveis de um triângulo tem a propriedade seguinte? «' + texto + '»';
        const resolucao = [
          { passo: 'Lembrar a definição', porque: Pt.opcao.replace(/\.$/, '') + ' é ' + Pt.resumo + '.' },
          { passo: Pt.ensina[0], porque: Pt.ensina[1] },
        ];
        const erros = CHAVES_PONTOS.filter((x) => x !== k).map((x) => ({
          codigo: 'escolheu_' + x, texto: PONTOS[x].opcao,
          explicacao: PONTOS[x].opcao.replace(/\.$/, '') + ' é ' + PONTOS[x].resumo + '. O ponto pedido é ' + Pt.opcao.charAt(0).toLowerCase() + Pt.opcao.slice(1, -1) + ', que é ' + Pt.resumo + '.',
        }));
        const ex = { enunciado, resolucao, verificacao: { passo: 'Confirmar pela ligação entre as retas que definem o ponto e a sua propriedade', calculo: Pt.verif }, dados: { contexto, texto } };
        return fecharTexto(rng, ex, Pt.opcao, erros, Pt.opcao);
      });
    },
    verificarIndependente(p) {
      const k = pontoDoTexto(p.dados.contexto, p.dados.texto);
      return k.length === 1 && p.opcoes[p.correta] === PONTOS[k[0]].opcao;
    },
    limites(p) {
      return pontoDoTexto(p.dados.contexto, p.dados.texto).length === 1;
    },
  });

  // ================================================================ ortocentro e baricentro
  // Triângulo de vértices inteiros (na caixa do esquema) com baricentro inteiro; paridade: B + C par (ponto médio inteiro).
  function trianguloBaricentro(rng, mediaInteira) {
    const Gp = [inteiro(rng, 0, 6), inteiro(rng, 0, 5)];
    const coord = (lo, hi, paridade) => {
      const v = inteiro(rng, lo, hi);
      return paridade === null || ((v - paridade) % 2 + 2) % 2 === 0 ? v : (v + 1 <= hi ? v + 1 : v - 1);
    };
    const A = [coord(CAIXA.xmin, CAIXA.xmax, mediaInteira ? Gp[0] % 2 : null), coord(CAIXA.ymin, CAIXA.ymax, mediaInteira ? Gp[1] % 2 : null)];
    const B = [inteiro(rng, CAIXA.xmin, CAIXA.xmax), inteiro(rng, CAIXA.ymin, CAIXA.ymax)];
    const C = menos(menos(vezes(3, Gp), A), B);
    const vs = [ponto(A), ponto(B), C];
    if (!vs.every(naCaixa)) return null;
    if (area2(vs[0], vs[1], vs[2]) < 8) return null;
    if (iguais(vs[0], vs[1]) || iguais(vs[1], vs[2]) || iguais(vs[0], vs[2])) return null;
    return vs;
  }

  registar({
    subtema: 'ortocentro-baricentro', tipo: 'baricentro', nome: 'Coordenadas do baricentro',
    formatos: ['escolha', 'numerica'], contextos: ['vertices', 'mediana'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const med = contexto === 'mediana';
        const vs = trianguloBaricentro(rng, med);
        if (!vs) return null;
        const [Av, Bv, Cv] = vs;
        const Gb = ponto(C.baricentro(Av, Bv, Cv));
        const M = medio(Bv, Cv);
        if (!simpatico(M)) return null;
        const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
        const AM = menos(M, Av);
        const viaMediana = mais(Av, vezes(2 / 3, AM));
        let enunciado, resolucao, erros, verificacao;
        if (!med) {
          const S = somaP(vs);
          enunciado = 'Considera o triângulo de vértices ' + listaVertices(vs) + '. ' + pedido(formato, eixo, 'do baricentro $G$ deste triângulo');
          resolucao = [
            { passo: 'Lembrar onde fica o baricentro', porque: 'O baricentro é o ponto de encontro das medianas; em coordenadas, é a média dos três vértices.' },
            { passo: 'Calcular a média das coordenadas', porque: 'Somam-se as abcissas (e as ordenadas) dos três vértices e divide-se por 3.', calculo: 'G = \\left(\\dfrac{' + somaTex(vs.map((P) => P[0])) + '}{3}, \\dfrac{' + somaTex(vs.map((P) => P[1])) + '}{3}\\right) = ' + texPonto(Gb) },
          ];
          erros = [
            { codigo: 'nao_dividiu_por_3', P: S, explicacao: 'Somaste as coordenadas dos três vértices, ' + opPonto(S) + ', mas não dividiste por 3. O baricentro é a média dos vértices, ' + nomeado('G', Gb) + '.' },
            { codigo: 'dividiu_por_2', P: vezes(1 / 2, S), explicacao: 'Dividiste a soma ' + opPonto(S) + ' por 2, como no ponto médio de um segmento. Com três vértices divide-se por 3, o que dá ' + nomeado('G', Gb) + '.' },
            { codigo: 'ponto_medio_lado', P: M, explicacao: opPonto(M) + ' é o ponto médio de $[BC]$, o extremo da mediana. O baricentro está nessa mediana, a dois terços a partir de A, em ' + nomeado('G', Gb) + '.' },
            { codigo: 'um_terco_do_vertice', P: mais(Av, vezes(1 / 3, AM)), explicacao: 'Andaste só um terço da mediana $[AM]$ a partir de A. O baricentro fica a dois terços a partir do vértice (e a um terço a partir de M).' },
          ];
          verificacao = {
            passo: 'Confirmar pela mediana $[AM]$, com $G$ a dois terços a partir de $A$',
            calculo: 'M = ' + medioTex(Bv, Cv) + ',\\quad G = A + \\tfrac{2}{3}\\overrightarrow{AM} = ' + texPonto(Av) + ' + \\tfrac{2}{3}' + texPonto(AM) + ' = ' + texPonto(viaMediana),
            P: viaMediana,
          };
        } else {
          enunciado = 'No triângulo $[ABC]$, o vértice é ' + nomeado('A', Av) + ' e o ponto médio de $[BC]$ é ' + nomeado('M', M) + '. ' + pedido(formato, eixo, 'do baricentro $G$ do triângulo');
          resolucao = [
            { passo: 'Usar a propriedade do baricentro', porque: 'O baricentro está na mediana $[AM]$, a dois terços do seu comprimento a partir do vértice $A$.' },
            { passo: 'Calcular o vetor $\\overrightarrow{AM}$', porque: 'Subtraem-se as coordenadas de A às de M.', calculo: '\\overrightarrow{AM} = ' + texPonto(AM) },
            { passo: 'Somar a A dois terços do vetor', porque: 'Assim chega-se ao ponto da mediana a dois terços de A.', calculo: 'G = ' + texPonto(Av) + ' + \\tfrac{2}{3}' + texPonto(AM) + ' = ' + texPonto(Av) + ' + ' + texPonto(vezes(2 / 3, AM)) + ' = ' + texPonto(Gb) },
          ];
          const umTerco = mais(Av, vezes(1 / 3, AM));
          erros = [
            { codigo: 'um_terco_do_vertice', P: umTerco, explicacao: 'Somaste a A só um terço de $\\overrightarrow{AM}$, ' + opPonto(umTerco) + '. O baricentro fica a dois terços a partir do vértice, ' + nomeado('G', Gb) + '.' },
            { codigo: 'ponto_medio_mediana', P: medio(Av, M), explicacao: opPonto(medio(Av, M)) + ' é o ponto médio de $[AM]$. O baricentro não divide a mediana ao meio, porque $\\overline{AG} = 2\\,\\overline{GM}$.' },
            { codigo: 'esqueceu_dividir_por_3', P: mais(Av, vezes(2, AM)), explicacao: 'Somaste a A o dobro de $\\overrightarrow{AM}$, ' + opPonto(mais(Av, vezes(2, AM))) + ', sem dividir por 3. É $\\tfrac{2}{3}\\overrightarrow{AM} = ' + texPonto(vezes(2 / 3, AM)) + '$.' },
          ];
          const Gind = vezes(1 / 3, mais(Av, vezes(2, M)));
          verificacao = {
            passo: 'Confirmar que $\\overrightarrow{AG} = 2\\overrightarrow{GM}$',
            calculo: '\\overrightarrow{AG} = ' + texPonto(menos(Gind, Av)) + ',\\quad 2\\overrightarrow{GM} = 2' + texPonto(menos(M, Gind)) + ' = ' + texPonto(vezes(2, menos(M, Gind))),
            P: Gind,
          };
        }
        const ex = { enunciado, resolucao, dados: { contexto, vertices: vs, eixo }, esquema: esquema(vs, ['baricentro']) };
        return fecharPonto(rng, formato, ex, { certo: Gb, eixo, erros, verificacao });
      });
    },
    verificarIndependente(p) {
      const [Av, Bv, Cv] = p.dados.vertices;
      const M = medio(Bv, Cv);
      // G = A + 2/3 AM (a partir da mediana, não da média dos vértices).
      return conferePonto(p, mais(Av, vezes(2 / 3, menos(M, Av))));
    },
    limites(p) {
      return verticesNaCaixa(p.dados.vertices) && (p.formato !== 'numerica' || (p.resposta >= -3 && p.resposta <= 9));
    },
  });

  // AG, GM e AM a partir da propriedade dos dois terços.
  const PERGUNTAS_DOIS_TERCOS = { AG: 'AG', GM: 'GM', AM: 'AM' };

  registar({
    subtema: 'ortocentro-baricentro', tipo: 'dois-tercos', nome: 'O baricentro a dois terços da mediana',
    formatos: ['numerica', 'escolha'], contextos: Object.keys(PERGUNTAS_DOIS_TERCOS),
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const iv = inteiro(rng, 0, 2);
        const X = NOMES[iv];
        const lado = NOMES.filter((_, i) => i !== iv).join('');
        const k = inteiro(rng, 2, 10);
        // Razão AG/AM lida num triângulo concreto: A(0, 0), B(m, t), C(m, −t), mediana [AM] sobre o eixo.
        const m0 = 3 * k;
        const t = inteiro(rng, 1, 6);
        const Am = [0, 0], Bm = [m0, t], Cm = [m0, -t];
        const razao = C.distancia(Am, C.baricentro(Am, Bm, Cm)) / C.distancia(Am, C.pontoMedio(Bm, Cm));
        const ag = '\\overline{' + X + 'G}';
        const gm = '\\overline{GM}';
        const am = '\\overline{' + X + 'M}';
        const intro = 'No triângulo $[ABC]$, M é o ponto médio de $[' + lado + ']$ e G é o baricentro. ';
        let dado, resp, enunciado, resolucao, erros, verif;
        if (contexto === 'AG' || contexto === 'GM') {
          const m = m0;
          dado = m;
          const AG = limpo(m * razao);
          resp = contexto === 'AG' ? AG : limpo(m - AG);
          enunciado = intro + 'A mediana $[' + X + 'M]$ mede ' + fmt(m) + ' cm. Quanto mede $' + (contexto === 'AG' ? ag : gm) + '$?';
          resolucao = [
            { passo: 'Usar a propriedade do baricentro', porque: 'O baricentro divide cada mediana em duas partes, a do lado do vértice com o dobro da outra.', calculo: ag + ' = \\tfrac{2}{3}\\,' + am + ',\\quad ' + gm + ' = \\tfrac{1}{3}\\,' + am },
            contexto === 'AG'
              ? { passo: 'Calcular $' + ag + '$', porque: 'Toma-se dois terços da mediana.', calculo: ag + ' = \\dfrac{2}{3} \\times ' + tex(m) + ' = ' + tex(resp, 2) }
              : { passo: 'Calcular $' + gm + '$', porque: 'Toma-se um terço da mediana.', calculo: gm + ' = \\dfrac{1}{3} \\times ' + tex(m) + ' = ' + tex(resp, 2) },
          ];
          if (contexto === 'AG') {
            erros = [
              { codigo: 'um_terco', valor: m / 3, explicacao: fmt(m / 3, 2) + ' cm é um terço da mediana, o comprimento de $' + gm + '$ (a parte junto ao lado). $' + ag + '$ é a parte junto ao vértice, dois terços, ' + fmt(resp, 2) + ' cm.' },
              { codigo: 'metade', valor: m / 2, explicacao: 'O baricentro não é o ponto médio da mediana. Fica a dois terços a partir do vértice, logo $' + ag + ' = \\dfrac{2}{3} \\times ' + tex(m) + ' = ' + tex(resp, 2) + '$ cm.' },
              { codigo: 'tres_meios', valor: (3 * m) / 2, explicacao: 'Multiplicaste por $\\dfrac{3}{2}$ em vez de $\\dfrac{2}{3}$, e obtiveste um segmento maior do que a própria mediana. $' + ag + ' = \\dfrac{2}{3} \\times ' + tex(m) + ' = ' + tex(resp, 2) + '$ cm.' },
            ];
          } else {
            erros = [
              { codigo: 'dois_tercos', valor: (2 * m) / 3, explicacao: fmt((2 * m) / 3, 2) + ' cm é dois terços da mediana, o comprimento de $' + ag + '$ (a parte junto ao vértice). $' + gm + '$ é a parte junto ao lado, um terço, ' + fmt(resp, 2) + ' cm.' },
              { codigo: 'metade', valor: m / 2, explicacao: 'O baricentro não é o ponto médio da mediana. $' + gm + '$ é um terço dela, $\\dfrac{' + tex(m) + '}{3} = ' + tex(resp, 2) + '$ cm.' },
              { codigo: 'um_sexto', valor: m / 6, explicacao: 'As três medianas dividem o triângulo em seis triângulos com a mesma área, cada um com um sexto da área total. Esse «um sexto» é das áreas, não dos comprimentos, e $' + gm + ' = \\dfrac{1}{3} \\times ' + tex(m) + ' = ' + tex(resp, 2) + '$ cm.' },
            ];
          }
          const outro = limpo(m - resp);
          verif = {
            passo: 'Confirmar que as duas partes somam a mediana e que uma é o dobro da outra',
            calculo: (contexto === 'AG' ? gm : ag) + ' = ' + tex(m) + ' - ' + tex(resp, 2) + ' = ' + tex(outro, 2) + ',\\quad ' + (contexto === 'AG' ? tex(resp, 2) + ' = 2 \\times ' + tex(outro, 2) : tex(outro, 2) + ' = 2 \\times ' + tex(resp, 2)),
            valor: contexto === 'AG' ? limpo(2 * outro) : limpo(outro / 2),
          };
        } else {
          const g = 2 * k;
          dado = g;
          resp = limpo(g / razao);
          enunciado = intro + 'Sabe-se que $' + ag + ' = ' + tex(g) + '$ cm. Quanto mede a mediana $[' + X + 'M]$?';
          resolucao = [
            { passo: 'Usar a propriedade do baricentro', porque: '$' + ag + '$ é dois terços da mediana.', calculo: ag + ' = \\tfrac{2}{3}\\,' + am },
            { passo: 'Resolver em ordem à mediana', porque: 'Divide-se por $\\dfrac{2}{3}$, ou seja, multiplica-se por $\\dfrac{3}{2}$.', calculo: am + ' = \\dfrac{3}{2} \\times ' + tex(g) + ' = ' + tex(resp, 2) },
          ];
          erros = [
            { codigo: 'aplicou_dois_tercos', valor: limpo((2 * g) / 3), explicacao: 'Multiplicaste $' + ag + '$ por $\\dfrac{2}{3}$, mas a relação é ao contrário. É $' + ag + '$ que mede dois terços da mediana, por isso a mediana é maior do que $' + ag + '$ e $' + am + ' = \\dfrac{3}{2} \\times ' + tex(g) + ' = ' + tex(resp, 2) + '$ cm.' },
            { codigo: 'calculou_gm', valor: g / 2, explicacao: fmt(g / 2) + ' cm é $' + gm + '$, metade de $' + ag + '$. A mediana é a soma das duas partes, ' + fmt(g) + ' + ' + fmt(g / 2) + ' = ' + fmt(resp, 2) + ' cm.' },
            { codigo: 'ag_como_metade', valor: 2 * g, explicacao: 'Tomaste $' + ag + '$ como metade da mediana. O baricentro fica a dois terços do vértice, logo a mediana é $\\dfrac{3}{2} \\times ' + tex(g) + ' = ' + tex(resp, 2) + '$ cm.' },
            { codigo: 'ag_como_terco', valor: 3 * g, explicacao: 'Tomaste $' + ag + '$ como um terço da mediana (esse é $' + gm + '$). $' + ag + '$ é dois terços, logo a mediana é ' + fmt(resp, 2) + ' cm.' },
          ];
          const gmv = limpo(resp - g);
          verif = {
            passo: 'Confirmar que $' + ag + ' = 2\\,' + gm + '$',
            calculo: gm + ' = ' + tex(resp, 2) + ' - ' + tex(g) + ' = ' + tex(gmv, 2) + ',\\quad 2 \\times ' + tex(gmv, 2) + ' = ' + tex(2 * gmv, 2),
            valor: limpo(g + g / 2),
          };
        }
        return fechar(rng, formato, { enunciado, resolucao, dados: { contexto, dado } }, {
          resposta: resp, tolerancia: 0.01, unidade: 'cm', texto: compCm, erros: erros.filter((e) => exato(e.valor, 2)), verificacao: verif,
        });
      });
    },
    verificarIndependente(p) {
      const d = p.dados.dado;
      // Frações: AG = 2·GM e AG + GM = AM.
      const v = { AG: (d * 2) / 3, GM: d / 3, AM: d + d / 2 }[p.dados.contexto];
      return v !== undefined && AJ.confere(p, limpo(v), compCm);
    },
    limites(p) {
      const d = p.dados.dado;
      return d >= 4 && d <= 30 && (p.formato !== 'numerica' || (p.resposta > 0 && p.resposta <= 30));
    },
  });

  // Ortocentro de um triângulo retângulo.
  function errosOrtocentro(T, C) {
    const { vs, iV, iU, iW } = T;
    const [V, U, W] = [vs[iV], vs[iU], vs[iW]];
    const nV = NOMES[iV];
    const O = medio(U, W);
    const Gb = ponto(C.baricentro(vs[0], vs[1], vs[2]));
    const pe = ponto(C.peAltura(V, U, W));
    const naoReto = (i) => {
      const j = (i + 1) % 3, k = (i + 2) % 3;
      const s = d2(vs[i], vs[j]) + d2(vs[i], vs[k]);
      return 'Em ' + NOMES[i] + ' o ângulo não é reto, porque $\\overline{' + seg(i, j) + '}^2 + \\overline{' + seg(i, k) + '}^2 = ' + tex(s) + '$ e $\\overline{' + seg(j, k) + '}^2 = ' + tex(d2(vs[j], vs[k])) + '$. O ângulo reto é em ' + nV + ', e aí os dois catetos são alturas, por isso cruzam-se em ' + nomeado(nV, V) + '.';
    };
    const hip = '$[' + seg(iU, iW) + ']$';
    return [
      { codigo: 'circuncentro', P: O, explicacao: opPonto(O) + ' é o ponto médio da hipotenusa ' + hip + ', o circuncentro (equidistante dos vértices). As alturas cruzam-se no vértice do ângulo reto, ' + nomeado(nV, V) + '.' },
      { codigo: 'angulo_reto_errado', P: U, explicacao: naoReto(iU) },
      { codigo: 'baricentro', P: Gb, explicacao: opPonto(Gb) + ' é a média dos três vértices, o baricentro (encontro das medianas). O ortocentro é o encontro das alturas, aqui o vértice do ângulo reto ' + nomeado(nV, V) + '.' },
      { codigo: 'pe_da_altura', P: pe, explicacao: opPonto(pe) + ' é o pé da altura tirada de ' + nV + ' para a hipotenusa. O ortocentro é o ponto onde as três alturas se cruzam, e não o pé de uma delas.' },
      { codigo: 'outro_angulo_reto_errado', P: W, explicacao: naoReto(iW) },
    ].filter((e) => simpatico(e.P));
  }

  registar({
    subtema: 'ortocentro-baricentro', tipo: 'ortocentro-retangulo', nome: 'Ortocentro de um triângulo retângulo',
    formatos: ['escolha', 'vf'], contextos: ['eixos', 'obliquo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const d = escolher(rng, contexto === 'eixos' ? DIRECOES_EIXOS : DIRECOES_OBLIQUAS);
        const T = retangulo(rng, inteiro(rng, 1, 6), inteiro(rng, 1, 6), d);
        if (!T) return null;
        const { vs, iV, iU, iW } = T;
        const [V, U, W] = [vs[iV], vs[iU], vs[iW]];
        const nV = NOMES[iV];
        const H = ponto(C.ortocentro(vs[0], vs[1], vs[2]));
        const erros = errosOrtocentro(T, C);
        const Hind = ortocentroCramer(vs[0], vs[1], vs[2]);
        const resolucao = [
          { passo: 'Calcular os quadrados dos lados', porque: 'Com eles vê-se se o triângulo é retângulo e onde está o ângulo reto.', calculo: ladosTex(vs), bloco: true },
          { passo: 'Encontrar o ângulo reto', porque: 'Pelo recíproco do teorema de Pitágoras, o ângulo em ' + nV + ' é reto.', calculo: pitagorasTex(T) },
          { passo: 'Concluir', porque: 'Num triângulo retângulo, cada cateto é a altura relativa ao outro cateto, por isso as alturas cruzam-se no vértice do ângulo reto.', calculo: 'H = ' + nV + texPonto(H) },
        ];
        // Outro método: declives dos catetos (perpendiculares ⇒ cada um é a altura relativa ao outro, e cruzam-se no vértice).
        // verificarIndependente usa as alturas resolvidas pela regra de Cramer.
        const verifCalc = perpendicularTex(seg(iV, iU), V, U, seg(iV, iW), V, W);
        const verifPasso = 'Confirmar pelos declives que os catetos $[' + seg(iV, iU) + ']$ e $[' + seg(iV, iW) + ']$ são perpendiculares, logo são duas alturas e cruzam-se em $H' + texPonto(Hind) + '$';
        const base = { resolucao, dados: { vertices: vs }, esquema: esquema(vs, ['ortocentro']) };
        const intro = 'Considera o triângulo de vértices ' + listaVertices(vs) + '. ';
        if (formato === 'vf') {
          if (!erros.length) return null;
          const e = escolher(rng, erros);
          const v = AJ.vfDe(rng, 'O ortocentro deste triângulo é o ponto ' + opPonto(H) + '.', 'O ortocentro deste triângulo é o ponto ' + opPonto(e.P) + '.', { codigo: e.codigo, explicacao: e.explicacao });
          const afirmado = v.correta ? H : e.P;
          return Object.assign(base, {
            enunciado: intro + 'Afirmação: «' + v.enunciado + '»',
            correta: v.correta, errosTipicos: v.errosTipicos,
            verificacao: { passo: verifPasso, calculo: verifCalc, valor: iguais(afirmado, Hind) },
            dados: { vertices: vs, afirmado },
          });
        }
        return fecharTexto(rng, Object.assign(base, {
          enunciado: intro + 'Quais são as coordenadas do ortocentro $H$ deste triângulo?',
          verificacao: { passo: verifPasso, calculo: verifCalc },
        }), opPonto(H), erros.map((x) => ({ codigo: x.codigo, texto: opPonto(x.P), explicacao: x.explicacao })), opPonto(Hind));
      });
    },
    verificarIndependente(p) {
      const vs = p.dados.vertices;
      const H = ortocentroCramer(vs[0], vs[1], vs[2]);
      if (!H || verticeReto(vs) < 0) return false;
      if (p.formato === 'vf') return p.correta === iguais(p.dados.afirmado, H);
      return iguais(lerPonto(p.opcoes[p.correta]), H);
    },
    limites(p) {
      return verticesNaCaixa(p.dados.vertices);
    },
  });

  // ================================================================ reta de Euler e circunferência dos nove pontos
  // Pontos inteiros das circunferências x² + y² = R² (raio² pequeno, para caber na caixa do esquema).
  const RAIOS2 = [5, 10, 13, 17, 20, 25];
  const RETICULADO = {};
  for (const R2 of RAIOS2) {
    RETICULADO[R2] = [];
    for (let x = -5; x <= 5; x++) for (let y = -5; y <= 5; y++) if (x * x + y * y === R2) RETICULADO[R2].push([x, y]);
  }

  // Triângulo inscrito numa circunferência de centro O inteiro, com vértices inteiros na caixa,
  // não retângulo; cond({ O, S, vs }) filtra (S = A + B + C).
  function trianguloInscrito(rng, cond) {
    for (let n = 0; n < 80; n++) {
      const R2 = escolher(rng, RAIOS2);
      const R = Math.sqrt(R2);
      const O = [inteiro(rng, Math.ceil(CAIXA.xmin + R), Math.floor(CAIXA.xmax - R)), inteiro(rng, Math.ceil(CAIXA.ymin + R), Math.floor(CAIXA.ymax - R))];
      const pts = baralhar(rng, RETICULADO[R2]).slice(0, 3);
      const vs = pts.map((p) => mais(O, p));
      if (area2(vs[0], vs[1], vs[2]) < 6) continue;
      if (verticeReto(vs) >= 0) continue;
      const S = somaP(vs);
      if (cond({ O, S, vs })) return { O, R2, vs, S };
    }
    return null;
  }

  const mult3 = (v) => ((v % 3) + 3) % 3 === 0;

  registar({
    subtema: 'euler-nove-pontos', tipo: 'centro-nove-pontos', nome: 'Centro da circunferência dos nove pontos',
    formatos: ['escolha', 'numerica'], contextos: ['OH', 'OG'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const comG = contexto === 'OG';
        // N = (A + B + C − O)/2 tem coordenadas inteiras ou meios; G = (A + B + C)/3 inteiro (dado em OG, distrator em OH).
        const T = trianguloInscrito(rng, ({ S }) => mult3(S[0]) && mult3(S[1]));
        if (!T) return null;
        const { vs } = T;
        const O = ponto(C.circuncentro(vs[0], vs[1], vs[2]).centro);
        const H = ponto(C.ortocentro(vs[0], vs[1], vs[2]));
        const N = ponto(C.circunferenciaNovePontos(vs[0], vs[1], vs[2]).centro);
        const Gt = vezes(1 / 3, T.S);
        const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
        const oQue = 'do centro $N$ da circunferência dos nove pontos';
        let enunciado, resolucao, erros;
        if (!comG) {
          enunciado = 'Num triângulo $[ABC]$, o circuncentro é ' + nomeado('O', O) + ' e o ortocentro é ' + nomeado('H', H) + '. ' + pedido(formato, eixo, oQue);
          resolucao = [
            { passo: 'Lembrar onde fica N', porque: 'O centro da circunferência dos nove pontos é o ponto médio de $[OH]$, na reta de Euler.' },
            { passo: 'Calcular o ponto médio de $[OH]$', porque: 'O ponto médio tem por coordenadas a média das coordenadas dos extremos.', calculo: 'N = ' + medioTex(O, H) },
          ];
          const dif = vezes(1 / 2, menos(H, O));
          erros = [
            { codigo: 'nao_dividiu_por_2', P: mais(O, H), explicacao: 'Somaste as coordenadas de O e de H, ' + opPonto(mais(O, H)) + ', mas não dividiste por 2. N é o ponto médio de $[OH]$, ' + nomeado('N', N) + '.' },
            { codigo: 'subtraiu_coordenadas', P: dif, explicacao: 'Subtraíste as coordenadas em vez de as somar, $\\dfrac{H - O}{2} = ' + texPonto(dif) + '$. Isso é metade do vetor $\\overrightarrow{OH}$, não um ponto. O ponto médio é $\\dfrac{O + H}{2} = ' + texPonto(N) + '$.' },
            { codigo: 'confundiu_com_baricentro', P: Gt, explicacao: opPonto(Gt) + ' fica a um terço de $[OH]$ a partir de O, que é o baricentro G. O centro N fica a meio de $[OH]$, em ' + nomeado('N', N) + '.' },
          ];
        } else {
          enunciado = 'Num triângulo $[ABC]$, o circuncentro é ' + nomeado('O', O) + ' e o baricentro é ' + nomeado('G', Gt) + '. ' + pedido(formato, eixo, oQue);
          const OG = menos(Gt, O);
          resolucao = [
            { passo: 'Encontrar o ortocentro', porque: 'Na reta de Euler, G está entre O e H com $\\overline{GH} = 2\\,\\overline{OG}$, logo $\\overrightarrow{OH} = 3\\overrightarrow{OG}$.', calculo: '\\overrightarrow{OG} = ' + texPonto(OG) + ',\\quad H = O + 3\\overrightarrow{OG} = ' + texPonto(O) + ' + ' + texPonto(vezes(3, OG)) + ' = ' + texPonto(H) },
            { passo: 'Calcular o ponto médio de $[OH]$', porque: 'O centro da circunferência dos nove pontos é o ponto médio de $[OH]$.', calculo: 'N = ' + medioTex(O, H) },
          ];
          const H2 = menos(vezes(2, Gt), O);
          erros = [
            { codigo: 'ponto_medio_og', P: medio(O, Gt), explicacao: opPonto(medio(O, Gt)) + ' é o ponto médio de $[OG]$. N é o ponto médio de $[OH]$, e H está mais longe, com $H = O + 3\\overrightarrow{OG} = ' + texPonto(H) + '$.' },
            { codigo: 'calculou_h', P: H, explicacao: opPonto(H) + ' é o ortocentro H. Falta o último passo, porque N é o ponto médio de $[OH]$, ' + nomeado('N', N) + '.' },
            { codigo: 'g_ponto_medio_oh', P: Gt, explicacao: 'Tomaste G como ponto médio de $[OH]$, mas $\\overline{OG} : \\overline{GH} = 1 : 2$. Com $H' + texPonto(H) + '$, o ponto médio de $[OH]$ é ' + nomeado('N', N) + '.' },
            { codigo: 'simetrico_de_o', P: H2, explicacao: 'Puseste G a meio de $[OH]$ e assim H ficou em ' + opPonto(H2) + '. Mas G está mais perto de O do que de H, porque $\\overline{GH} = 2\\,\\overline{OG}$, e por isso $H' + texPonto(H) + '$ e $N' + texPonto(N) + '$.' },
          ];
        }
        // Outro método: N é o circuncentro do triângulo medial (passa pelos pontos médios dos lados).
        const Ms = [medio(vs[1], vs[2]), medio(vs[0], vs[2]), medio(vs[0], vs[1])];
        const Nind = circuncentroCramer(Ms[0], Ms[1], Ms[2]);
        const nomesM = ['M_a', 'M_b', 'M_c'];
        const ex = { enunciado, resolucao, dados: { contexto, vertices: vs, eixo }, esquema: esquema(vs, ['circuncentro', 'ortocentro', 'baricentro', 'euler', 'novePontos']) };
        return fecharPonto(rng, formato, ex, {
          certo: N, eixo, erros,
          verificacao: {
            passo: 'Por exemplo, o triângulo de vértices ' + listaVertices(vs) + ' tem estes pontos notáveis. Confirmar que $N$ está à mesma distância dos pontos médios dos seus lados ($M_a$ de $[BC]$, $M_b$ de $[AC]$, $M_c$ de $[AB]$), por onde passa a circunferência dos nove pontos',
            calculo: Ms.map((M, i) => nomesM[i] + texPonto(M)).join(',\\ ') + ',\\quad ' + Ms.map((M, i) => '\\overline{N' + nomesM[i] + '}^2').join(' = ') + ' = ' + tex(d2(N, Ms[0])),
            P: Nind,
          },
        });
      });
    },
    verificarIndependente(p) {
      const vs = p.dados.vertices;
      return conferePonto(p, circuncentroCramer(medio(vs[1], vs[2]), medio(vs[0], vs[2]), medio(vs[0], vs[1])));
    },
    limites(p) {
      return verticesNaCaixa(p.dados.vertices) && (p.formato !== 'numerica' || Math.abs(p.resposta) <= 20);
    },
  });

  const TERNOS = [[3, 4], [6, 8], [5, 12], [9, 12], [8, 15], [12, 16], [7, 24], [15, 20]];

  registar({
    subtema: 'euler-nove-pontos', tipo: 'raio-nove-pontos', nome: 'Raio da circunferência dos nove pontos',
    formatos: ['numerica', 'escolha'], contextos: ['retangulo', 'coordenadas'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        if (contexto === 'retangulo') {
          const [a, b] = baralhar(rng, escolher(rng, TERNOS));
          const vs = [[0, 0], [a, 0], [0, b]];
          const r9 = limpo(C.circunferenciaNovePontos(vs[0], vs[1], vs[2]).raio);
          const c = limpo(Math.sqrt(a * a + b * b));
          const R = c / 2;
          const enunciado = 'Os catetos de um triângulo retângulo medem ' + fmt(a) + ' cm e ' + fmt(b) + ' cm. Qual é o raio da circunferência dos nove pontos deste triângulo?';
          const resolucao = [
            { passo: 'Calcular a hipotenusa', porque: 'Pelo teorema de Pitágoras.', calculo: 'c = \\sqrt{' + tex(a) + '^2 + ' + tex(b) + '^2} = \\sqrt{' + tex(a * a + b * b) + '} = ' + tex(c) },
            { passo: 'Calcular o raio da circunferência circunscrita', porque: 'Num triângulo retângulo, o circuncentro é o ponto médio da hipotenusa, que é um diâmetro.', calculo: 'R = \\dfrac{' + tex(c) + '}{2} = ' + tex(R, 2) },
            { passo: 'Dividir R por 2', porque: 'O raio da circunferência dos nove pontos é metade do raio da circunferência circunscrita.', calculo: 'r_N = \\dfrac{' + tex(R, 2) + '}{2} = ' + tex(r9, 2) },
          ];
          const rIns = (a + b - c) / 2;
          const erros = [
            { codigo: 'raio_circunscrito', valor: R, explicacao: fmt(R, 2) + ' cm é o raio R da circunferência circunscrita. O raio da circunferência dos nove pontos é metade, $\\dfrac{' + tex(R, 2) + '}{2} = ' + tex(r9, 2) + '$ cm.' },
            { codigo: 'metade_do_raio_inscrito', valor: rIns / 2, explicacao: 'Dividiste por 2 o raio da circunferência inscrita, $r = \\dfrac{' + tex(a) + ' + ' + tex(b) + ' - ' + tex(c) + '}{2} = ' + tex(rIns, 2) + '$. O raio dos nove pontos é metade de R (circunscrita), não de r (inscrita).' },
            { codigo: 'soma_catetos', valor: (a + b) / 4, explicacao: 'Usaste ' + fmt(a) + ' + ' + fmt(b) + ' = ' + fmt(a + b) + ' como hipotenusa. Pelo teorema de Pitágoras, a hipotenusa mede ' + fmt(c) + ' cm, logo $r_N = \\dfrac{' + tex(c) + '}{4} = ' + tex(r9, 2) + '$ cm.' },
            { codigo: 'multiplicou_por_2', valor: c, explicacao: 'Multiplicaste R por 2 em vez de dividir. ' + fmt(c) + ' cm é o diâmetro da circunferência circunscrita, e o raio dos nove pontos é $\\dfrac{R}{2} = ' + tex(r9, 2) + '$ cm.' },
          ];
          // Outro método: N é o ponto médio de [OH] (H no vértice do ângulo reto) e dista r_N do ponto médio de um cateto.
          const N = medio(medio(vs[1], vs[2]), vs[0]);
          const Mab = medio(vs[0], vs[1]);
          const rInd = Math.sqrt(d2(N, Mab));
          const w = menos(Mab, N);
          return fechar(rng, formato, { enunciado, resolucao, dados: { contexto, catetos: [a, b] }, esquema: esquema(vs, ['circuncentro', 'ortocentro', 'novePontos']) }, {
            resposta: r9, tolerancia: 0.01, unidade: 'cm', texto: compCm, erros,
            verificacao: {
              passo: 'Por exemplo, põe o triângulo com ' + listaVertices(vs) + ' (ângulo reto em A). O circuncentro O é o ponto médio de $[BC]$ e o ortocentro H é A. Confirmar que N, ponto médio de $[OH]$, dista $r_N$ do ponto médio M de $[AB]$ (a circunferência dos nove pontos passa por M)',
              calculo: 'O' + texPonto(medio(vs[1], vs[2])) + ',\\quad H' + texPonto(vs[0]) + ',\\quad N' + texPonto(N) + ',\\quad M' + texPonto(Mab) + ',\\quad \\overline{NM} = \\sqrt{' + par(w[0]) + '^2 + ' + par(w[1]) + '^2}' + igualOuAprox(rInd, 2),
              valor: r2(rInd),
            },
          });
        }
        const T = trianguloInscrito(rng, () => true);
        if (!T) return null;
        const { vs } = T;
        const O = ponto(C.circuncentro(vs[0], vs[1], vs[2]).centro);
        const r9 = C.circunferenciaNovePontos(vs[0], vs[1], vs[2]).raio;
        const resp = r2(r9);
        const R2v = d2(O, vs[0]);
        const R = Math.sqrt(R2v);
        const w0 = menos(vs[0], O);
        const enunciado = 'O triângulo de vértices ' + listaVertices(vs) + ' tem circuncentro ' + nomeado('O', O) + '. Qual é o raio da circunferência dos nove pontos deste triângulo, arredondado às centésimas?';
        const resolucao = [
          { passo: 'Calcular o raio da circunferência circunscrita', porque: 'É a distância do circuncentro a qualquer vértice.', calculo: 'R = \\overline{OA} = \\sqrt{' + par(w0[0]) + '^2 + ' + par(w0[1]) + '^2} = \\sqrt{' + tex(R2v) + '}' },
          { passo: 'Dividir R por 2', porque: 'O raio da circunferência dos nove pontos é metade do raio da circunferência circunscrita.', calculo: 'r_N = \\dfrac{\\sqrt{' + tex(R2v) + '}}{2}' + igualOuAprox(r9, 2) },
        ];
        const somaComp = (Math.abs(w0[0]) + Math.abs(w0[1])) / 2;
        const erros = [
          { codigo: 'raio_circunscrito', valor: r2(R), explicacao: '$R = \\sqrt{' + tex(R2v) + '}' + igualOuAprox(R, 2) + '$ é o raio da circunferência circunscrita. O raio da circunferência dos nove pontos é metade, ' + fmtAprox(r9) + '.' },
          { codigo: 'sem_raiz', valor: r2(R2v / 2), explicacao: 'Esqueceste a raiz quadrada, porque $\\overline{OA}^2 = ' + tex(R2v) + '$ e não $\\overline{OA}$. Com $R = \\sqrt{' + tex(R2v) + '}$, o raio pedido é ' + fmtAprox(r9) + '.' },
          { codigo: 'soma_componentes', valor: r2(somaComp), explicacao: 'Somaste as diferenças das coordenadas, ' + fmt(Math.abs(w0[0])) + ' + ' + fmt(Math.abs(w0[1])) + ' = ' + fmt(2 * somaComp) + ', em vez de usar o teorema de Pitágoras, e obtiveste $R = ' + tex(2 * somaComp) + '$. $\\overline{OA} = \\sqrt{' + tex(R2v) + '}$, e o raio pedido é ' + fmtAprox(r9) + '.' },
          { codigo: 'multiplicou_por_2', valor: r2(2 * R), explicacao: 'Multiplicaste R por 2 em vez de dividir. $2R' + igualOuAprox(2 * R, 2) + '$ é o diâmetro da circunferência circunscrita, e o raio dos nove pontos é $\\dfrac{R}{2}$, ' + fmtAprox(r9) + '.' },
        ];
        // Outro método: N = ponto médio de [OH] (H pelas alturas) e distância de N ao ponto médio de [BC].
        const Hind = ortocentroCramer(vs[0], vs[1], vs[2]);
        const Oind = circuncentroCramer(vs[0], vs[1], vs[2]);
        const N = medio(Oind, Hind);
        const Ma = medio(vs[1], vs[2]);
        const rInd = Math.sqrt(d2(N, Ma));
        const w = menos(Ma, N);
        return fechar(rng, formato, { enunciado, resolucao, dados: { contexto, vertices: vs }, esquema: esquema(vs, ['circuncentro', 'ortocentro', 'novePontos']) }, {
          resposta: resp, tolerancia: 0.005, texto: comp, erros, arredondamento: exato(r9, 2) ? undefined : ARRED_2,
          verificacao: {
            passo: 'Confirmar que $N$, ponto médio de $[OH]$, dista $r_N$ do ponto médio $M_a$ de $[BC]$',
            calculo: 'H = (A + B + C) - 2O = ' + texPonto(Hind) + ',\\quad N = ' + texPonto(N) + ',\\quad M_a' + texPonto(Ma) + ',\\quad \\overline{NM_a} = \\sqrt{' + par(w[0]) + '^2 + ' + par(w[1]) + '^2}' + igualOuAprox(rInd, 2),
            valor: r2(rInd),
          },
        });
      });
    },
    verificarIndependente(p) {
      if (p.dados.contexto === 'retangulo') {
        const [a, b] = p.dados.catetos;
        // r_N = R/2 = c/4, com c pelo teorema de Pitágoras.
        return AJ.confere(p, limpo(Math.sqrt(a * a + b * b) / 4), compCm);
      }
      const vs = p.dados.vertices;
      const N = medio(circuncentroCramer(vs[0], vs[1], vs[2]), ortocentroCramer(vs[0], vs[1], vs[2]));
      return AJ.confere(p, r2(Math.sqrt(d2(N, medio(vs[0], vs[1])))), comp);
    },
    limites(p) {
      if (p.dados.contexto === 'retangulo') return p.dados.catetos.every((x) => x > 0 && x <= 24);
      return verticesNaCaixa(p.dados.vertices);
    },
  });

  // Razão de Euler OG : GH = 1 : 2.
  const COMPRIMENTOS = {
    GH_de_OG: { dado: 'OG', pedido: 'GH' },
    OG_de_GH: { dado: 'GH', pedido: 'OG' },
    GH_de_OH: { dado: 'OH', pedido: 'GH' },
  };

  function eulerComprimentos(rng) {
    const q = escolher(rng, Object.keys(COMPRIMENTOS));
    const { dado, pedido: ped } = COMPRIMENTOS[q];
    const ol = (s) => '\\overline{' + s + '}';
    let d, resp, erros, calculo;
    if (q === 'GH_de_OG') {
      d = inteiro(rng, 2, 18) / 2;
      resp = 2 * d;
      calculo = ol('GH') + ' = 2 \\times ' + tex(d, 2) + ' = ' + tex(resp, 2);
      erros = [
        { codigo: 'g_ponto_medio', valor: d, explicacao: 'Tomaste G como ponto médio de $[OH]$. G fica entre O e H, mas $' + ol('GH') + '$ é o dobro de $' + ol('OG') + '$, ' + fmt(resp, 2) + ' cm.' },
        { codigo: 'razao_invertida', valor: d / 2, explicacao: 'Inverteste a razão. G está mais perto de O do que de H, logo $' + ol('GH') + ' = 2\\,' + ol('OG') + ' = ' + tex(resp, 2) + '$ cm.' },
        { codigo: 'calculou_oh', valor: 3 * d, explicacao: 'Calculaste $' + ol('OH') + ' = 3\\,' + ol('OG') + ' = ' + tex(3 * d, 2) + '$ cm, todo o segmento. Pede-se só $' + ol('GH') + ' = 2\\,' + ol('OG') + ' = ' + tex(resp, 2) + '$ cm.' },
      ];
    } else if (q === 'OG_de_GH') {
      d = inteiro(rng, 2, 18);
      resp = d / 2;
      calculo = ol('OG') + ' = \\dfrac{' + tex(d) + '}{2} = ' + tex(resp, 2);
      erros = [
        { codigo: 'g_ponto_medio', valor: d, explicacao: 'Tomaste G como ponto médio de $[OH]$. $' + ol('OG') + '$ é metade de $' + ol('GH') + '$, ' + fmt(resp, 2) + ' cm.' },
        { codigo: 'razao_invertida', valor: 2 * d, explicacao: 'Inverteste a razão. É $' + ol('GH') + '$ que é o dobro de $' + ol('OG') + '$, logo $' + ol('OG') + ' = ' + tex(d) + ' \\div 2 = ' + tex(resp, 2) + '$ cm.' },
        { codigo: 'calculou_oh', valor: (3 * d) / 2, explicacao: fmt((3 * d) / 2, 2) + ' cm é $' + ol('OH') + ' = ' + ol('OG') + ' + ' + ol('GH') + '$, todo o segmento. Pede-se só $' + ol('OG') + ' = ' + tex(resp, 2) + '$ cm.' },
      ];
    } else {
      d = 3 * inteiro(rng, 1, 9);
      resp = (2 * d) / 3;
      calculo = ol('OG') + ' = ' + tex(d) + ' \\div 3 = ' + tex(d / 3) + ',\\quad ' + ol('GH') + ' = 2 \\times ' + tex(d / 3) + ' = ' + tex(resp, 2);
      erros = [
        { codigo: 'g_ponto_medio', valor: d / 2, explicacao: 'Tomaste G como ponto médio de $[OH]$. Como $' + ol('OG') + ' : ' + ol('GH') + ' = 1 : 2$, $' + ol('GH') + '$ é dois terços de $' + ol('OH') + '$, ' + fmt(resp, 2) + ' cm.' },
        { codigo: 'razao_invertida', valor: d / 3, explicacao: fmt(d / 3, 2) + ' cm é um terço de $' + ol('OH') + '$, que é $' + ol('OG') + '$. $' + ol('GH') + '$ é a parte maior, dois terços, ' + fmt(resp, 2) + ' cm.' },
        { codigo: 'oh_como_og', valor: 2 * d, explicacao: 'Trataste $' + ol('OH') + '$ como se fosse $' + ol('OG') + '$ e duplicaste. $' + ol('OH') + '$ é o segmento todo, por isso $' + ol('GH') + ' = \\dfrac{2}{3} \\times ' + tex(d) + ' = ' + tex(resp, 2) + '$ cm.' },
      ];
    }
    resp = limpo(resp);
    // Os três comprimentos (OG, GH, OH) para a verificação: OG + GH = OH e GH = 2 OG.
    const og = { GH_de_OG: d, OG_de_GH: resp, GH_de_OH: d / 3 }[q];
    return { q, dado, ped, d, resp, erros, calculo, og: limpo(og) };
  }

  // Valor pedido calculado pela soma OG + GH = OH, com GH = 2·OG (outro caminho).
  function eulerInd(q, d) {
    if (q === 'GH_de_OG') return limpo(3 * d - d); // GH = OH − OG, com OH = 3·OG
    if (q === 'OG_de_GH') return limpo((d + d / 2) / 3); // OH = GH + GH/2, OG = OH/3
    if (q === 'GH_de_OH') return limpo(d - d / 3); // GH = OH − OG
    return NaN;
  }

  registar({
    subtema: 'euler-nove-pontos', tipo: 'razao-euler', nome: 'Reta de Euler (OG : GH = 1 : 2)',
    formatos: ['escolha', 'vf'], contextos: ['comprimentos', 'coordenadas'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        if (contexto === 'comprimentos') {
          const e = eulerComprimentos(rng);
          const ol = (s) => '\\overline{' + s + '}';
          const intro = 'Num triângulo não equilátero, O é o circuncentro, G o baricentro e H o ortocentro. Sabe-se que $' + ol(e.dado) + ' = ' + tex(e.d, 2) + '$ cm.';
          const resolucao = [
            { passo: 'Usar a reta de Euler', porque: 'O, G e H estão alinhados, com G entre O e H e $' + ol('GH') + ' = 2\\,' + ol('OG') + '$, logo $' + ol('OH') + ' = 3\\,' + ol('OG') + '$.' },
            { passo: 'Calcular $' + ol(e.ped) + '$', porque: 'Aplica-se a razão $' + ol('OG') + ' : ' + ol('GH') + ' : ' + ol('OH') + ' = 1 : 2 : 3$.', calculo: e.calculo },
          ];
          const verifCalc = ol('OG') + ' = ' + tex(e.og, 2) + ',\\quad ' + ol('GH') + ' = ' + tex(2 * e.og, 2) + ',\\quad ' + ol('OG') + ' + ' + ol('GH') + ' = ' + tex(3 * e.og, 2) + ' = ' + ol('OH');
          const verifPasso = 'Confirmar que $' + ol('OG') + ' + ' + ol('GH') + ' = ' + ol('OH') + '$ com $' + ol('GH') + ' = 2\\,' + ol('OG') + '$';
          const dados = { contexto, q: e.q, d: e.d };
          if (formato === 'vf') {
            const er = escolher(rng, e.erros);
            const afirma = (v) => 'Então $' + ol(e.ped) + ' = ' + tex(v, 2) + '$ cm.';
            const v = AJ.vfDe(rng, afirma(e.resp), afirma(er.valor), { codigo: er.codigo, explicacao: er.explicacao });
            const afirmado = v.correta ? e.resp : er.valor;
            return {
              enunciado: intro + ' Afirmação: «' + v.enunciado + '»', resolucao, correta: v.correta, errosTipicos: v.errosTipicos,
              verificacao: { passo: verifPasso, calculo: verifCalc, valor: Math.abs(afirmado - eulerInd(e.q, e.d)) < 1e-9 },
              dados: Object.assign(dados, { afirmado: limpo(afirmado) }),
            };
          }
          return fechar(rng, 'escolha', { enunciado: intro + ' Quanto mede $' + ol(e.ped) + '$?', resolucao, dados }, {
            resposta: e.resp, tolerancia: 0.01, texto: compCm, erros: e.erros,
            verificacao: { passo: verifPasso, calculo: verifCalc, valor: eulerInd(e.q, e.d) },
          });
        }
        const T = trianguloInscrito(rng, ({ S }) => mult3(S[0]) && mult3(S[1]));
        if (!T) return null;
        const { vs } = T;
        const O = ponto(C.circuncentro(vs[0], vs[1], vs[2]).centro);
        const Gb = ponto(C.baricentro(vs[0], vs[1], vs[2]));
        const H = ponto(C.ortocentro(vs[0], vs[1], vs[2]));
        const OG = menos(Gb, O);
        const intro = 'Num triângulo $[ABC]$, o circuncentro é ' + nomeado('O', O) + ' e o baricentro é ' + nomeado('G', Gb) + '.';
        const resolucao = [
          { passo: 'Usar a reta de Euler', porque: 'O, G e H estão alinhados, com G entre O e H e $\\overline{GH} = 2\\,\\overline{OG}$, logo $\\overrightarrow{GH} = 2\\overrightarrow{OG}$.' },
          { passo: 'Calcular $\\overrightarrow{OG}$', porque: 'Subtraem-se as coordenadas de O às de G.', calculo: '\\overrightarrow{OG} = ' + texPonto(OG) },
          { passo: 'Somar a G o dobro do vetor', porque: 'Partindo de G, anda-se duas vezes $\\overrightarrow{OG}$ no mesmo sentido.', calculo: 'H = G + 2\\overrightarrow{OG} = ' + texPonto(Gb) + ' + ' + texPonto(vezes(2, OG)) + ' = ' + texPonto(H) },
        ];
        const Hm = menos(vezes(2, Gb), O);
        const Hi = mais(Gb, vezes(1 / 2, OG));
        const Ht = mais(Gb, vezes(3, OG));
        const H3 = vezes(3, Gb);
        const erros = [
          { codigo: 'g_ponto_medio', P: Hm, explicacao: 'Puseste G a meio de $[OH]$ e assim H ficou em ' + opPonto(Hm) + '. Mas G está mais perto de O do que de H, porque $\\overline{GH} = 2\\,\\overline{OG}$, e por isso $H = G + 2\\overrightarrow{OG} = ' + texPonto(H) + '$.' },
          { codigo: 'razao_invertida', P: Hi, explicacao: 'Somaste a G só metade de $\\overrightarrow{OG}$, como se $\\overline{GH} = \\tfrac{1}{2}\\,\\overline{OG}$. A razão é $\\overline{OG} : \\overline{GH} = 1 : 2$, logo $H = ' + texPonto(H) + '$.' },
          { codigo: 'triplicou_a_partir_de_g', P: Ht, explicacao: 'Somaste $3\\overrightarrow{OG}$ a G. $\\overrightarrow{OH} = 3\\overrightarrow{OG}$ conta-se a partir de O, e a partir de G soma-se só $2\\overrightarrow{OG}$, o que dá ' + nomeado('H', H) + '.' },
          { codigo: 'h_igual_3g', P: H3, explicacao: 'Usaste $H = 3G$, que só vale quando O está na origem. Em geral, $H = 3G - 2O = ' + texPonto(H) + '$.' },
        ].filter((x) => simpatico(x.P));
        const Hind = ortocentroCramer(vs[0], vs[1], vs[2]);
        const GH = menos(Hind, Gb);
        const verificacao = {
          passo: 'Por exemplo, o triângulo de vértices ' + listaVertices(vs) + ' tem estes O e G. Confirmar pelos declives que $H' + texPonto(Hind) + '$ está nas alturas tiradas de A e de B ($AH \\perp BC$ e $BH \\perp AC$) e que $\\overrightarrow{GH} = 2\\overrightarrow{OG}$',
          calculo: perpendicularTex('AH', vs[0], Hind, 'BC', vs[1], vs[2]) + ';\\quad ' + perpendicularTex('BH', vs[1], Hind, 'AC', vs[0], vs[2]) + ';\\quad \\overrightarrow{GH} = ' + texPonto(GH) + ' = 2' + texPonto(OG),
        };
        const ex = { resolucao, esquema: esquema(vs, ['circuncentro', 'ortocentro', 'baricentro', 'euler']) };
        if (formato === 'vf') {
          if (!erros.length) return null;
          const er = escolher(rng, erros);
          const afirma = (P) => 'O ortocentro do triângulo é o ponto ' + opPonto(P) + '.';
          const v = AJ.vfDe(rng, afirma(H), afirma(er.P), { codigo: er.codigo, explicacao: er.explicacao });
          const afirmado = v.correta ? H : er.P;
          return Object.assign(ex, {
            enunciado: intro + ' Afirmação: «' + v.enunciado + '»', correta: v.correta, errosTipicos: v.errosTipicos,
            verificacao: Object.assign(verificacao, { valor: iguais(afirmado, Hind) }),
            dados: { contexto, vertices: vs, afirmado },
          });
        }
        return fecharTexto(rng, Object.assign(ex, { enunciado: intro + ' Quais são as coordenadas do ortocentro H?', verificacao, dados: { contexto, vertices: vs } }),
          opPonto(H), erros.map((x) => ({ codigo: x.codigo, texto: opPonto(x.P), explicacao: x.explicacao })), opPonto(Hind));
      });
    },
    verificarIndependente(p) {
      if (p.dados.contexto === 'comprimentos') {
        const v = eulerInd(p.dados.q, p.dados.d);
        if (p.formato === 'vf') return p.correta === (Math.abs(p.dados.afirmado - v) < 1e-9);
        return AJ.confere(p, v, compCm);
      }
      const vs = p.dados.vertices;
      const H = ortocentroCramer(vs[0], vs[1], vs[2]);
      if (p.formato === 'vf') return p.correta === iguais(p.dados.afirmado, H);
      return iguais(lerPonto(p.opcoes[p.correta]), H);
    },
    limites(p) {
      if (p.dados.contexto === 'comprimentos') return p.dados.d > 0 && p.dados.d <= 27;
      return verticesNaCaixa(p.dados.vertices);
    },
  });
})();
