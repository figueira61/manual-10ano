globalThis.Manual = globalThis.Manual || {};

// Geradores de Matemática A — Geometria analítica (plano, espaço, vetores e equação vetorial da reta).
// Subtemas: plano-referencial, plano-condicoes, espaco, vetores, reta-vetorial (ids <subtema>-<tipo>).
// As respostas vêm de Manual.calc.geometria; verificarIndependente e a verificação usam outro método
// (ponto médio e metade das diferenças, Pitágoras em dois passos, forma desenvolvida, pontos diametralmente
// opostos, produtos cruzados das coordenadas, equação reduzida…). Só ferramentas do 10.º ano (sem produto escalar).
// Coordenadas dadas inteiras; resultados inteiros ou meios. Distâncias, normas e raios exatos (√n simplificada);
// na resposta numérica arredondam-se às centésimas quando não são inteiros.
// Manual.calc só é lido dentro de gerar (no index.html os módulos de cálculo carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const AJ = G.ajudas;
  const calc = () => Manual.calc.geometria;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const tex = AJ.tex;
  const { fechar, fecharTexto, chave, texQ, cx, vezesTex, cadeia, divTex, texPonto, notacaoPontos, lerPonto, fracao, SEP } = AJ;
  const limpo = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const proximo = (a, b) => Math.abs(a - b) < 1e-9;
  const r2 = (v) => Math.round(v * 100 + (v >= 0 ? 1e-7 : -1e-7)) / 100 + 0;
  const tentar = (construir) => AJ.tentar(construir, 'geometria analítica');
  const ARRED = 'às centésimas';
  const NAO_NULOS = (n) => Array.from({ length: 2 * n + 1 }, (_, i) => i - n).filter((v) => v !== 0);

  // Cada gerar passa por notacaoPontos: uma só notação de pontos e vetores por item.
  function registar(def) {
    const gerar = def.gerar;
    G.registar(Object.assign({ disciplina: 'mat-a', tema: 'geometria-analitica', id: def.subtema + '-' + def.tipo }, def, {
      gerar: (semente, opcoes) => notacaoPontos(gerar(semente, opcoes)),
    }));
  }

  // ---------------------------------------------------------------- pontos e vetores (aritmética própria, exata)
  const pt = (P) => P.map(limpo);
  const mais = (P, Q) => pt(P.map((x, i) => x + Q[i]));
  const menos = (P, Q) => pt(P.map((x, i) => x - Q[i]));
  const vezes = (k, P) => pt(P.map((x) => k * x));
  const medio = (P, Q) => pt(P.map((x, i) => (x + Q[i]) / 2));
  const soma2 = (u) => limpo(u.reduce((s, x) => s + x * x, 0));
  const d2 = (P, Q) => soma2(menos(Q, P));
  const iguais = (P, Q) => Array.isArray(P) && Array.isArray(Q) && P.length === Q.length && P.every((x, i) => proximo(x, Q[i]));
  const ehInt = (v) => Number.isFinite(v) && Number.isInteger(limpo(v));
  const meios = (P) => P.every((v) => ehInt(2 * v));
  const mdc = (a, b) => (b ? mdc(b, a % b) : Math.abs(a));
  const simples = (v) => { const f = fracao(v); return !!f && f.d <= 10; };
  const decimal2 = (v) => Number.isFinite(v) && Math.abs(Math.round(v * 100) - v * 100) < 1e-6;
  const quadrado = (n) => n >= 0 && Number.isInteger(Math.round(Math.sqrt(n) * 1e6) / 1e6);
  const dentro = (P, lim = 40) => Array.isArray(P) && P.every((v) => Number.isFinite(v) && Math.abs(v) <= lim);

  // ---------------------------------------------------------------- escrita
  const VAR = ['x', 'y', 'z'];
  const EIXO = ['abcissa', 'ordenada', 'cota'];
  const ORDINAL = ['primeira', 'segunda', 'terceira'];
  const par = (v) => (v < 0 ? '(' + tex(v) + ')' : tex(v));
  const parQ = (v) => (v < 0 ? (ehInt(v) ? '(' + texQ(v) + ')' : '\\left(' + texQ(v) + '\\right)') : texQ(v));
  const maisTex = (v) => (v === 0 ? '' : v < 0 ? ' - ' + tex(-v) : ' + ' + tex(v));
  const maisQ = (v) => (v === 0 ? '' : v < 0 ? ' - ' + texQ(-v) : ' + ' + texQ(v));
  // b − a com parênteses no negativo (e sem «− 0»).
  const difTex = (b, a) => (a === 0 ? tex(b) : tex(b) + ' - ' + par(a));
  // (p − c)², sem «− 0».
  const quadDif = (p, c) => (c === 0 ? par(p) + '^2' : '(' + difTex(p, c) + ')^2');
  // Soma de números com sinais: [25, 9, -20] → "25 + 9 - 20".
  const somaNum = (vs) => vs.map((v, i) => (i === 0 ? tex(v) : v < 0 ? ' - ' + tex(-v) : ' + ' + tex(v))).join('');
  const somaQuad = (vs) => vs.map((v) => par(v) + '^2').join(' + ');
  const relTex = (a, b) => (proximo(a, b) ? '=' : a < b ? '<' : '>');
  // (x − a)², (x + a)² ou x²
  const fatorTex = (v, a) => (a === 0 ? v + '^2' : '(' + v + (a < 0 ? ' + ' + tex(-a) : ' - ' + tex(a)) + ')^2');
  // Termos literais com coeficientes: [[k, 'x^2'], [k, 'x'], [k, '']].
  function polTex(termos) {
    let s = '';
    for (const [c0, lit] of termos) {
      const c = limpo(c0);
      if (c === 0) continue;
      const corpo = lit && Math.abs(c) === 1 ? lit : texQ(Math.abs(c)) + lit;
      s += s === '' ? (c < 0 ? '-' : '') + corpo : (c < 0 ? ' - ' : ' + ') + corpo;
    }
    return s === '' ? '0' : s;
  }
  const opPonto = (P) => '$' + texPonto(P) + '$';
  const nomeado = (n, P) => '$' + n + texPonto(P) + '$';
  const vet = (n) => '\\overrightarrow{' + n + '}';
  const tuplo = (dim) => '(' + VAR.slice(0, dim).join(SEP) + ')';
  // λ(u) sem o 1: cx(-1, '(3, 4)') = '-(3, 4)'.
  const lambdaVetor = (l, u) => cx(l, texPonto(u));
  // Parcela + λ(u) com o sinal de λ: ' + 2(3, 4)', ' - \dfrac{1}{2}(3, 4)'.
  const maisLambdaVetor = (l, u) => (l < 0 ? ' - ' + cx(-l, texPonto(u)) : ' + ' + cx(l, texPonto(u)));
  // Parcela + cλ com o sinal: ' + 2\lambda', ' - \lambda'.
  const maisCLambda = (c) => (c < 0 ? ' - ' + cx(-c, '\\lambda') : ' + ' + cx(c, '\\lambda'));
  // Soma de produtos k × x com sinais, sem parcelas nulas; x = null é uma constante k.
  // [[2, 4], [-1, 0], [-3, null]] → '2 \times 4 - 3'.
  function combTex(termos) {
    const t = termos.filter(([k, x]) => k !== 0 && !(x === 0 && Math.abs(k) === 1));
    if (!t.length) return '0';
    return t.map(([k, x], i) => {
      const corpo = x === null ? tex(Math.abs(k)) : vezesTex(Math.abs(k), Math.abs(k) === 1 && i === 0 && k > 0 ? tex(x) : par(x));
      return (i === 0 ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + ') + corpo;
    }).join('');
  }

  // √n simplificada: k√m (k omitido se 1) ou inteiro.
  function raizTex(n) {
    n = Math.round(n);
    if (n === 0) return '0';
    let k = 1;
    for (let d = Math.floor(Math.sqrt(n)); d > 1; d--) if (n % (d * d) === 0) { k = d; break; }
    const m = n / (k * k);
    if (m === 1) return tex(k);
    return (k === 1 ? '' : tex(k)) + '\\sqrt{' + tex(m) + '}';
  }
  // √n = k√m (≈ valor, na resposta numérica).
  function raizCadeia(n, aprox) {
    const t = cadeia('\\sqrt{' + tex(n) + '}', raizTex(n));
    return aprox && !quadrado(n) ? t + ' \\approx ' + tex(r2(Math.sqrt(n)), 2) : t;
  }
  // Soma de raízes [[coeficiente, n], …] simplificada: agrupa radicandos iguais.
  function somaRaizes(termos) {
    const grupos = [];
    for (const [c, n] of termos) {
      let k = 1;
      for (let d = Math.floor(Math.sqrt(n)); d > 1; d--) if (n % (d * d) === 0) { k = d; break; }
      const m = n / (k * k);
      const g = grupos.find((x) => x.m === m);
      if (g) g.k += c * k; else grupos.push({ m, k: c * k });
    }
    const partes = grupos.filter((g) => g.k !== 0);
    const valor = limpo(partes.reduce((s, g) => s + g.k * Math.sqrt(g.m), 0));
    const t = partes.map((g, i) => {
      const abs = Math.abs(g.k);
      const corpo = g.m === 1 ? tex(abs) : (abs === 1 ? '' : tex(abs)) + '\\sqrt{' + tex(g.m) + '}';
      return (i === 0 ? (g.k < 0 ? '-' : '') : g.k < 0 ? ' - ' : ' + ') + corpo;
    }).join('');
    return { texto: t || '0', valor };
  }
  // Leitura de um número em LaTeX: "-3", "2{,}5", "\dfrac{1}{2}", "2\sqrt{5}", "\sqrt{7}".
  function lerNumero(t) {
    const s = String(t).replace(/\$/g, '').replace(/\{,\}/g, '.').replace(/\s/g, '');
    let m = s.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/);
    if (m) return (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3]);
    m = s.match(/^(-?)(\d*)\\sqrt\{(\d+)\}$/);
    if (m) return (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1) * Math.sqrt(Number(m[3]));
    return /^-?[\d.]+$/.test(s) ? Number(s) : NaN;
  }

  // ---------------------------------------------------------------- fechos
  // Resposta da forma √n (distâncias, normas, raios). numerica: arredondada às centésimas se não for inteira;
  // escolha: forma exata. erros: [{ codigo, n | valor + texto, explicacao }]; verificacao: { passo, calculo, n }.
  const opRaiz = (unidade) => (n) => '$' + raizTex(n) + '$' + (unidade ? ' ' + unidade : '');
  function fecharMedida(rng, formato, ex, o) {
    const op = opRaiz(o.unidade);
    const erros = o.erros.filter(Boolean).map((e) => ({
      codigo: e.codigo, explicacao: e.explicacao,
      valor: e.valor !== undefined ? e.valor : Math.sqrt(e.n),
      texto: e.texto !== undefined ? '$' + e.texto + '$' + (o.unidade ? ' ' + o.unidade : '') : op(e.n),
    })).filter((e) => e.valor > 0);
    const verif = { passo: o.verificacao.passo, calculo: o.verificacao.calculo };
    if (formato === 'numerica') {
      const arred = !quadrado(o.n);
      if (arred) ex.enunciado += ' Apresenta o resultado arredondado às centésimas.';
      return fechar(rng, 'numerica', ex, {
        resposta: r2(Math.sqrt(o.n)), tolerancia: arred ? 0.01 : 0, unidade: o.unidade,
        erros: erros.map((e) => ({ codigo: e.codigo, valor: r2(e.valor), explicacao: e.explicacao })),
        verificacao: Object.assign(verif, { valor: r2(Math.sqrt(o.verificacao.n)) }),
        arredondamento: arred ? ARRED : undefined,
      });
    }
    ex.verificacao = verif;
    return fecharTexto(rng, ex, op(o.n), erros.map((e) => ({ codigo: e.codigo, texto: e.texto, explicacao: e.explicacao })), op(o.verificacao.n));
  }
  const confereMedida = (p, n) => (p.formato === 'numerica'
    ? Math.abs(p.resposta - r2(Math.sqrt(n))) <= p.tolerancia + 1e-9
    : chave(p.opcoes[p.correta]) === chave(opRaiz(p.dados.unidade)(n)));

  // Respostas que são pontos ou vetores: numerica pergunta a coordenada eixo; escolha, o ponto.
  // erros: [{ codigo, P, explicacao }] (só coordenadas inteiras ou meios); verificacao.P: o ponto do outro método.
  function fecharPonto(rng, formato, ex, o) {
    const erros = o.erros.filter((e) => e && meios(e.P) && dentro(e.P, 60));
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
    if (!Array.isArray(P)) return false;
    if (p.formato === 'numerica') return Math.abs(p.resposta - P[p.dados.eixo]) <= p.tolerancia + 1e-9;
    return iguais(lerPonto(p.opcoes[p.correta]), P);
  }
  const pedidoPonto = (formato, eixo, oQue) => (formato === 'numerica' ? 'Qual é a ' + EIXO[eixo] + ' ' + oQue + '?' : 'Quais são as coordenadas ' + oQue + '?');
  const pedidoVetor = (formato, eixo, oQue) => (formato === 'numerica' ? 'Qual é a ' + ORDINAL[eixo] + ' coordenada ' + oQue + '?' : 'Quais são as coordenadas ' + oQue + '?');

  // Respostas racionais (k, declive, ordenada na origem): numerica só com decimais de até 2 casas; escolha em fração.
  function fecharRacional(rng, formato, ex, o) {
    if (formato === 'numerica' && !decimal2(o.resposta)) return null;
    const erros = o.erros.filter((e) => e && Number.isFinite(e.valor) && simples(e.valor) && Math.abs(e.valor) <= 60);
    return fechar(rng, formato, ex, {
      resposta: o.resposta, tolerancia: 0, texto: (v) => '$' + texQ(v) + '$', erros, verificacao: o.verificacao,
    });
  }
  const confereRacional = (p, v) => (p.formato === 'numerica'
    ? Math.abs(p.resposta - v) <= p.tolerancia + 1e-9
    : proximo(lerNumero(p.opcoes[p.correta]), v));

  // ---------------------------------------------------------------- esquemas (só com valores que cabem nos controlos)
  const CAIXA_PLANO = { xmin: -3, xmax: 11, ymin: -3, ymax: 11 };
  const noPlano = (P) => P.length === 2 && meios(P) && P[0] >= CAIXA_PLANO.xmin && P[0] <= CAIXA_PLANO.xmax && P[1] >= CAIXA_PLANO.ymin && P[1] <= CAIXA_PLANO.ymax;
  const esquemaPlano = (A, B, modo) => (noPlano(A) && noPlano(B) ? { id: 'plano', opcoes: { A: A.slice(), B: B.slice(), modo } } : undefined);
  const noVetores = (u) => u.length === 2 && meios(u) && u.every((v) => Math.abs(v) <= 10);
  const noEspaco = (P) => P.length === 3 && meios(P) && P.every((v) => Math.abs(v) <= 6);

  // ================================================================ distância (plano e espaço)
  const PARES_NOMES = [['A', 'B'], ['P', 'Q'], ['R', 'S']];
  const LUGARES = [['E', 'a escola'], ['B', 'a biblioteca'], ['P', 'a piscina'], ['C', 'a câmara municipal'], ['F', 'a farmácia'], ['T', 'o teatro']];

  function diferencasTex(nA, nB, A, B) {
    return A.map((a, i) => cadeia(VAR[i] + '_{' + nB + '} - ' + VAR[i] + '_{' + nA + '}', difTex(B[i], a), tex(B[i] - a))).join(',\\quad ');
  }

  // Erros típicos da distância entre A e B (d = B − A), com a resposta exata √n.
  function errosDistancia(A, B, nA, nB, numerica, escolha) {
    const d = menos(B, A);
    const n = soma2(d);
    const dim = A.length;
    const seg = '\\overline{' + nA + nB + '}';
    const lista = [];
    const neg = A.map((a, i) => (a < 0 ? i : -1)).filter((i) => i >= 0);
    if (neg.length) {
      const dd = d.map((v, i) => (A[i] < 0 ? B[i] + A[i] : v));
      lista.push({
        codigo: 'sinal_negativo', n: soma2(dd),
        explicacao: 'Enganaste-te ao subtrair um número negativo: ' + neg.map((i) => 'em $' + difTex(B[i], A[i]) + '$ fizeste $' + tex(B[i]) + ' - ' + tex(-A[i]) + ' = ' + tex(B[i] + A[i]) + '$').join(' e ') +
          ', e obtiveste $\\sqrt{' + somaQuad(dd) + '} = ' + raizCadeia(soma2(dd), numerica) + '$. Subtrair um negativo é somar: ' + neg.map((i) => '$' + difTex(B[i], A[i]) + ' = ' + tex(B[i]) + ' + ' + tex(-A[i]) + ' = ' + tex(d[i]) + '$').join(' e ') + '.',
      });
    }
    const abs = d.filter((v) => v !== 0).map(Math.abs);
    const s = abs.reduce((a, b) => a + b, 0);
    lista.push({
      codigo: 'soma_catetos', n: s * s,
      explicacao: 'Somaste as diferenças sem as elevar ao quadrado, $' + abs.map(tex).join(' + ') + ' = ' + tex(s) + '$. Pelo teorema de Pitágoras, $' + seg + ' = \\sqrt{' + somaQuad(d) + '}$, que é menor do que essa soma.',
    });
    const neg2 = d.filter((v) => v < 0);
    if (neg2.length) {
      const sinais = d.filter((v) => v !== 0).map((v) => (v < 0 ? -v * v : v * v));
      const k = sinais.reduce((a, b) => a + b, 0);
      if (k > 0) {
        lista.push({
          codigo: 'quadrado_negativo', n: k,
          explicacao: 'Calculaste ' + neg2.map((v) => '$' + par(v) + '^2$ como $' + tex(-v * v) + '$').join(' e ') + ' e obtiveste $\\sqrt{' + somaNum(sinais) + '} = ' + raizCadeia(k, numerica) + '$. O quadrado de um número negativo é positivo: ' + neg2.map((v) => '$' + par(v) + '^2 = ' + tex(v * v) + '$').join(' e ') + '.',
        });
      }
    }
    const S = mais(A, B);
    if (soma2(S) > 0 && !iguais(S, d)) {
      lista.push({
        codigo: 'somou_coordenadas', n: soma2(S),
        explicacao: 'Somaste as coordenadas, como no ponto médio: $\\sqrt{' + A.map((a, i) => '(' + tex(a) + ' + ' + par(B[i]) + ')^2').join(' + ') + '} = \\sqrt{' + somaQuad(S) + '} = ' + raizCadeia(soma2(S), numerica) + '$. Na distância subtraem-se as coordenadas.',
      });
    }
    if (dim === 3 && d[2] !== 0 && (d[0] !== 0 || d[1] !== 0)) {
      const nxy = d[0] * d[0] + d[1] * d[1];
      lista.push({
        codigo: 'esqueceu_cota', n: nxy,
        explicacao: 'Usaste só as abcissas e as ordenadas, como no plano: $\\sqrt{' + somaQuad(d.slice(0, 2)) + '} = ' + raizCadeia(nxy, numerica) + '$. No espaço soma-se também o quadrado da diferença das cotas, $' + par(d[2]) + '^2$.',
      });
      const rp = somaRaizes([[1, nxy], [1, d[2] * d[2]]]);
      lista.push({
        codigo: 'somou_cota_a_diagonal', valor: rp.valor, texto: rp.texto,
        explicacao: 'Calculaste $\\sqrt{' + somaQuad(d.slice(0, 2)) + '} = ' + raizTex(nxy) + '$ e somaste-lhe a diferença das cotas, $' + tex(Math.abs(d[2])) + '$, obtendo $' + raizTex(nxy) + ' + ' + tex(Math.abs(d[2])) + (rp.texto === raizTex(nxy) + ' + ' + tex(Math.abs(d[2])) ? '' : ' = ' + rp.texto) + (numerica ? ' \\approx ' + tex(r2(rp.valor), 2) : '') + '$. Esses dois comprimentos são os catetos de um triângulo retângulo: aplica-se outra vez o teorema de Pitágoras.',
      });
    }
    if (!escolha || n <= 50) {
      lista.push({
        codigo: 'sem_raiz', n: n * n,
        explicacao: 'Esqueceste a raiz quadrada: $' + somaQuad(d) + ' = ' + tex(n) + '$ é o quadrado da distância, $' + seg + '^2$. A distância é $' + seg + ' = ' + raizCadeia(n, numerica) + '$.',
      });
    }
    return lista;
  }

  function distancia(rng, formato, contexto, dim) {
    let A, B, nA, nB, enunciado, unidade;
    if (contexto === 'paralelepipedo') {
      A = [0, 0, 0];
      B = [inteiro(rng, 1, 6), inteiro(rng, 1, 6), inteiro(rng, 1, 6)];
      nA = 'O'; nB = 'P';
      enunciado = 'Um paralelepípedo retângulo tem um vértice na origem $O$ do referencial o.n. $Oxyz$ e três arestas sobre os semieixos positivos. O vértice oposto a $O$ é ' + nomeado('P', B) + '. Qual é o comprimento da diagonal espacial $[OP]$?';
    } else {
      A = Array.from({ length: dim }, () => inteiro(rng, -6, 6));
      const d = Array.from({ length: dim }, () => inteiro(rng, -7, 7));
      if (d.filter((v) => v !== 0).length < 2 || (dim === 3 && d[2] === 0)) return null;
      B = mais(A, d);
      if (!dentro(B, 9)) return null;
      if (contexto === 'mapa') {
        const [l1, l2] = baralhar(rng, LUGARES.slice()).slice(0, 2);
        nA = l1[0]; nB = l2[0]; unidade = 'km';
        enunciado = 'Num mapa da cidade, com um referencial o.n. em que a unidade é 1 km, ' + l1[1] + ' está no ponto ' + nomeado(nA, A) + ' e ' + l2[1] + ' no ponto ' + nomeado(nB, B) + '. Qual é a distância, em linha reta e em quilómetros, entre os dois locais?';
      } else {
        [nA, nB] = escolher(rng, PARES_NOMES);
        enunciado = 'Considera os pontos ' + nomeado(nA, A) + ' e ' + nomeado(nB, B) + (dim === 3 ? ' do espaço' : '') + '. Qual é a distância entre $' + nA + '$ e $' + nB + '$?';
      }
    }
    const C = calc();
    const d = menos(B, A);
    const n = soma2(d);
    if (!proximo(C.distancia(A, B) * C.distancia(A, B), n)) return null;
    const numerica = formato === 'numerica';
    const seg = '\\overline{' + nA + nB + '}';
    const resolucao = [
      { passo: 'Calcular as diferenças das coordenadas', porque: 'Subtraem-se as coordenadas de $' + nA + '$ às de $' + nB + '$ (a ordem não importa, porque as diferenças vão ser elevadas ao quadrado).', calculo: diferencasTex(nA, nB, A, B) },
      {
        passo: 'Aplicar a fórmula da distância', porque: 'A distância é a raiz quadrada da soma dos quadrados das diferenças (teorema de Pitágoras' + (dim === 3 ? ', com as três coordenadas' : '') + ').',
        calculo: seg + ' = ' + cadeia('\\sqrt{' + somaQuad(d) + '}', '\\sqrt{' + d.map((v) => tex(v * v)).join(' + ') + '}', raizCadeia(n, numerica)),
      },
    ];
    let verificacao;
    if (dim === 2) {
      const M = medio(A, B);
      const h = menos(M, A);
      const q = soma2(h);
      verificacao = {
        passo: 'Confirmar com o ponto médio $M$ de $[' + nA + nB + ']$: $' + seg + ' = 2\\,\\overline{' + nA + 'M}$',
        calculo: 'M' + texPonto(M) + ',\\quad \\overline{' + nA + 'M} = \\sqrt{' + somaQuad(h) + '} = \\sqrt{' + tex(q) + '},\\quad 2\\,\\overline{' + nA + 'M} = \\sqrt{4 \\times ' + tex(q) + '} = ' + raizCadeia(4 * q, numerica),
        n: limpo(4 * q),
      };
    } else {
      const nxy = d[0] * d[0] + d[1] * d[1];
      const nInd = nxy + d[2] * d[2];
      verificacao = {
        passo: 'Confirmar em dois passos: primeiro a diagonal $D$ da projeção no plano $xOy$, depois o triângulo retângulo de catetos $D$ e a diferença das cotas',
        calculo: 'D^2 = ' + somaQuad(d.slice(0, 2)) + ' = ' + tex(nxy) + ',\\quad ' + seg + '^2 = D^2 + ' + par(d[2]) + '^2 = ' + tex(nxy) + ' + ' + tex(d[2] * d[2]) + ' = ' + tex(nInd) + ',\\quad ' + seg + ' = ' + raizCadeia(nInd, numerica),
        n: nInd,
      };
    }
    const erros = baralhar(rng, errosDistancia(A, B, nA, nB, numerica, formato === 'escolha'));
    const pontos = {};
    pontos[nA] = A; pontos[nB] = B;
    const ex = { enunciado, resolucao, dados: { contexto, A, B, pontos, unidade }, esquema: dim === 2 ? esquemaPlano(A, B, 'distancia') : undefined };
    return fecharMedida(rng, formato, ex, { n, unidade, erros, verificacao });
  }

  // Distância por outro caminho: 2D pelo ponto médio (2·AM), 3D por Pitágoras em dois passos.
  function distanciaIndependente(p) {
    const { A, B } = p.dados;
    if (A.length === 2) {
      const h = A.map((a, i) => (B[i] - a) / 2);
      return confereMedida(p, limpo(4 * (h[0] * h[0] + h[1] * h[1])));
    }
    const dxy = Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2);
    return confereMedida(p, dxy + Math.pow(B[2] - A[2], 2));
  }
  const limitesDistancia = (p) => dentro(p.dados.A, 9) && dentro(p.dados.B, 9) && (p.formato !== 'numerica' || (p.resposta > 0 && p.resposta <= 20));

  registar({
    subtema: 'plano-referencial', tipo: 'distancia', nome: 'Distância entre dois pontos do plano',
    formatos: ['numerica', 'escolha'], contextos: ['pontos', 'mapa'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => distancia(rng, formato, contexto, 2));
    },
    verificarIndependente: distanciaIndependente,
    limites: limitesDistancia,
  });

  // ================================================================ ponto médio
  const medioTex = (P, Q) => '\\left(' + P.map((p, i) => '\\dfrac{' + tex(p) + ' + ' + par(Q[i]) + '}{2}').join(SEP) + '\\right)';
  const somasTex = (P, Q) => '\\left(' + P.map((p, i) => '\\dfrac{' + tex(p + Q[i]) + '}{2}').join(SEP) + '\\right)';

  function pontoMedio(rng, formato, contexto) {
    const C = calc();
    const A = [inteiro(rng, -7, 8), inteiro(rng, -7, 8)];
    const B = [inteiro(rng, -7, 8), inteiro(rng, -7, 8)];
    if (A[0] === B[0] || A[1] === B[1]) return null;
    const M = pt(C.pontoMedio(A, B));
    const eixo = formato === 'numerica' ? inteiro(rng, 0, 1) : null;
    const pontos = { A, B, M };
    if (contexto === 'medio') {
      const neg = A.concat(B).some((v) => v < 0);
      const enunciado = 'Considera os pontos ' + nomeado('A', A) + ' e ' + nomeado('B', B) + '. ' + pedidoPonto(formato, eixo, 'do ponto médio $M$ de $[AB]$');
      const resolucao = [
        { passo: 'Fazer a média das coordenadas', porque: 'Cada coordenada do ponto médio é a média das coordenadas correspondentes dos extremos: somam-se e divide-se por 2.', calculo: 'M = ' + cadeia(medioTex(A, B), somasTex(A, B), texPonto(M)) },
      ];
      const dif = vezes(0.5, menos(B, A));
      const erros = [
        { codigo: 'subtraiu_coordenadas', P: dif, explicacao: 'Subtraíste as coordenadas de A às de B, $\\left(' + A.map((a, i) => '\\dfrac{' + difTex(B[i], a) + '}{2}').join(SEP) + '\\right) = ' + texPonto(dif) + '$, em vez de as somar. No ponto médio somam-se: $M' + texPonto(M) + '$.' },
        { codigo: 'nao_dividiu_por_2', P: mais(A, B), explicacao: 'Somaste as coordenadas, ' + opPonto(mais(A, B)) + ', mas não dividiste por 2. O ponto médio é $M' + texPonto(M) + '$.' },
        neg ? { codigo: 'ignorou_sinais', P: pt(A.map((a, i) => (Math.abs(a) + Math.abs(B[i])) / 2)), explicacao: 'Ignoraste os sinais menos e somaste ' + A.map((a, i) => '$' + tex(Math.abs(a)) + ' + ' + tex(Math.abs(B[i])) + '$').join(' e ') + ', o que dá ' + opPonto(pt(A.map((a, i) => (Math.abs(a) + Math.abs(B[i])) / 2))) + '. Com os sinais: $M' + texPonto(M) + '$.' } : null,
        { codigo: 'trocou_coordenadas', P: [M[1], M[0]], explicacao: 'Trocaste a ordem das coordenadas: ' + opPonto([M[1], M[0]]) + ' tem na abcissa a média das ordenadas. A abcissa de M é a média das abcissas, $M' + texPonto(M) + '$.' },
      ];
      const viaVetor = mais(A, vezes(0.5, menos(B, A)));
      const ex = { enunciado, resolucao, dados: { contexto, A, B, eixo, pontos }, esquema: esquemaPlano(A, B, 'pontoMedio') };
      return fecharPonto(rng, formato, ex, {
        certo: M, eixo, erros,
        verificacao: {
          passo: 'Confirmar que $M$ fica a meio caminho, isto é, que $' + vet('AM') + ' = ' + vet('MB') + '$',
          calculo: vet('AM') + ' = M - A = ' + texPonto(menos(M, A)) + ',\\quad ' + vet('MB') + ' = B - M = ' + texPonto(menos(B, M)),
          P: viaVetor,
        },
      });
    }
    // extremo: dados A e M, determinar B = 2M − A
    const enunciado = 'O ponto ' + nomeado('M', M) + ' é o ponto médio do segmento $[AB]$, com ' + nomeado('A', A) + '. ' + pedidoPonto(formato, eixo, 'de $B$');
    const resolucao = [
      {
        passo: 'Usar a fórmula do ponto médio', porque: 'Como $\\dfrac{x_A + x_B}{2} = x_M$, tem-se $x_B = 2x_M - x_A$ (e o mesmo para as ordenadas).',
        calculo: A.map((a, i) => VAR[i] + '_B = ' + cadeia(combTex([[2, M[i]], [-1, a]]), tex(B[i]))).join(',\\quad '),
      },
    ];
    const erros = [
      { codigo: 'esqueceu_dobro', P: menos(M, A), explicacao: 'De $\\dfrac{x_A + x_B}{2} = x_M$ passaste para $x_B = x_M - x_A$, esquecendo multiplicar por 2, e obtiveste ' + opPonto(menos(M, A)) + '. Primeiro multiplica-se por 2: $x_B = 2x_M - x_A$.' },
      { codigo: 'ponto_medio_de_am', P: medio(A, M), explicacao: opPonto(medio(A, M)) + ' é o ponto médio de $[AM]$. M é o ponto médio de $[AB]$: B fica do outro lado de M, à mesma distância que A.' },
      { codigo: 'sinal_trocado', P: mais(vezes(2, M), A), explicacao: 'Passaste $x_A$ para o outro membro sem trocar o sinal, $x_B = 2x_M + x_A$, e obtiveste ' + opPonto(mais(vezes(2, M), A)) + '. O certo é $x_B = 2x_M - x_A$.' },
      { codigo: 'devolveu_a_soma', P: mais(M, A), explicacao: 'Somaste as coordenadas de M e de A, ' + opPonto(mais(M, A)) + '. B obtém-se de $2M - A$: $B' + texPonto(B) + '$.' },
    ];
    const viaVetor = mais(M, menos(M, A));
    const ex = { enunciado, resolucao, dados: { contexto, A, M, eixo, pontos }, esquema: esquemaPlano(A, B, 'pontoMedio') };
    return fecharPonto(rng, formato, ex, {
      certo: B, eixo, erros,
      verificacao: {
        passo: 'Confirmar que o ponto médio de $[AB]$ é $M$',
        calculo: cadeia(medioTex(A, B), somasTex(A, B), texPonto(medio(A, B))),
        P: viaVetor,
      },
    });
  }

  registar({
    subtema: 'plano-referencial', tipo: 'ponto-medio', nome: 'Ponto médio de um segmento',
    formatos: ['escolha', 'numerica'], contextos: ['medio', 'extremo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => pontoMedio(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      // Médio: M = A + metade de AB; extremo: B = M + AM.
      if (d.contexto === 'medio') return conferePonto(p, d.A.map((a, i) => a + (d.B[i] - a) / 2));
      return conferePonto(p, d.M.map((m, i) => m + (m - d.A[i])));
    },
    limites: (p) => dentro(p.dados.A, 8) && dentro(p.dados.contexto === 'medio' ? p.dados.B : p.dados.M, 8),
  });

  // ================================================================ simétrico
  const TRANSFORMACOES = {
    Ox: { nome: 'pela reflexão de eixo $Ox$', imagem: (P) => [P[0], -P[1]], porque: 'Na reflexão de eixo $Ox$ a abcissa mantém-se e a ordenada troca de sinal.', eixo: 1 },
    Oy: { nome: 'pela reflexão de eixo $Oy$', imagem: (P) => [-P[0], P[1]], porque: 'Na reflexão de eixo $Oy$ a ordenada mantém-se e a abcissa troca de sinal.', eixo: 0 },
    O: { nome: 'pela meia-volta de centro na origem $O$', imagem: (P) => [-P[0], -P[1]], porque: 'Na meia-volta de centro $O$ (rotação de $180°$) trocam de sinal as duas coordenadas.', eixo: null },
  };

  function simetrico(rng, formato, contexto) {
    const P = [escolher(rng, NAO_NULOS(7)), escolher(rng, NAO_NULOS(7))];
    if (Math.abs(P[0]) === Math.abs(P[1])) return null;
    const pontos = { P };
    if (contexto === 'eixos') {
      const t = escolher(rng, ['Ox', 'Oy', 'O']);
      const T = TRANSFORMACOES[t];
      const Q = pt(T.imagem(P));
      const eixo = formato === 'numerica' ? (T.eixo === null ? inteiro(rng, 0, 1) : T.eixo) : null;
      const enunciado = 'Considera o ponto ' + nomeado('P', P) + '. Seja $P\'$ o transformado de $P$ ' + T.nome + '. ' + pedidoPonto(formato, eixo, 'de $P\'$');
      const resolucao = [{ passo: 'Aplicar a transformação', porque: T.porque, calculo: 'P' + texPonto(P) + ' \\to P\'' + texPonto(Q) }];
      const outro = { Ox: 'Oy', Oy: 'Ox' };
      const erros = t === 'O'
        ? [
          { codigo: 'so_trocou_ordenada', P: [P[0], -P[1]], explicacao: 'Trocaste só o sinal da ordenada, ' + opPonto([P[0], -P[1]]) + ': isso é a reflexão de eixo $Ox$. Na meia-volta trocam de sinal as duas coordenadas, $P\'' + texPonto(Q) + '$.' },
          { codigo: 'so_trocou_abcissa', P: [-P[0], P[1]], explicacao: 'Trocaste só o sinal da abcissa, ' + opPonto([-P[0], P[1]]) + ': isso é a reflexão de eixo $Oy$. Na meia-volta trocam de sinal as duas coordenadas, $P\'' + texPonto(Q) + '$.' },
          { codigo: 'rodou_90', P: pt([-P[1], P[0]]), explicacao: opPonto(pt([-P[1], P[0]])) + ' é o transformado de P pela rotação de $90°$. A meia-volta é a rotação de $180°$: $P\'' + texPonto(Q) + '$.' },
        ]
        : [
          { codigo: 'trocou_o_eixo', P: pt(TRANSFORMACOES[outro[t]].imagem(P)), explicacao: opPonto(pt(TRANSFORMACOES[outro[t]].imagem(P))) + ' é o transformado ' + TRANSFORMACOES[outro[t]].nome + '. ' + T.porque + ' Logo $P\'' + texPonto(Q) + '$.' },
          { codigo: 'meia_volta', P: pt([-P[0], -P[1]]), explicacao: 'Trocaste o sinal das duas coordenadas, ' + opPonto(pt([-P[0], -P[1]])) + ', como na meia-volta de centro $O$. ' + T.porque },
          { codigo: 'trocou_coordenadas', P: [P[1], P[0]], explicacao: 'Trocaste a abcissa com a ordenada, ' + opPonto([P[1], P[0]]) + '. Numa reflexão de eixo $Ox$ ou $Oy$ as coordenadas não mudam de lugar: ' + T.porque.charAt(0).toLowerCase() + T.porque.slice(1) },
        ];
      // Outro método: P' = P + 2 × (vetor de P até ao pé no eixo / centro).
      const pe = t === 'Ox' ? [P[0], 0] : t === 'Oy' ? [0, P[1]] : [0, 0];
      const viaPe = mais(P, vezes(2, menos(pe, P)));
      const Mpp = medio(P, Q);
      const ex = { enunciado, resolucao, dados: { contexto, P, t, eixo, pontos: Object.assign(pontos, { "P'": Q }) } };
      return fecharPonto(rng, formato, ex, {
        certo: Q, eixo, erros,
        verificacao: {
          passo: t === 'O' ? 'Confirmar que $O$ é o ponto médio de $[PP\']$' : 'Confirmar que o ponto médio de $[PP\']$ está no eixo $' + t + '$ e que $P$ e $P\'$ têm a mesma ' + (t === 'Ox' ? 'abcissa' : 'ordenada'),
          calculo: cadeia(medioTex(P, Q), somasTex(P, Q), texPonto(Mpp)),
          P: viaPe,
        },
      });
    }
    // reflexão de eixo x = c ou y = c
    const i = inteiro(rng, 0, 1);
    const c = escolher(rng, NAO_NULOS(5));
    const a = P[i];
    if (a === c) return null;
    const Q = P.slice();
    Q[i] = 2 * c - a;
    if (!dentro(Q, 15)) return null;
    const v = VAR[i];
    const comQ = (k) => { const R = P.slice(); R[i] = k; return pt(R); };
    const eixo = formato === 'numerica' ? i : null;
    const enunciado = 'Considera o ponto ' + nomeado('P', P) + '. Seja $P\'$ o transformado de $P$ pela reflexão de eixo $' + v + ' = ' + tex(c) + '$. ' + pedidoPonto(formato, eixo, 'de $P\'$');
    const fixa = EIXO[1 - i];
    const resolucao = [
      { passo: 'Ver o que se mantém', porque: 'O eixo $' + v + ' = ' + tex(c) + '$ é ' + (i === 0 ? 'vertical' : 'horizontal') + ', por isso a ' + fixa + ' mantém-se.' },
      { passo: 'Calcular a coordenada que muda', porque: 'O eixo fica a meio caminho entre $P$ e $P\'$: $\\dfrac{' + v + '_P + ' + v + '_{P\'}}{2} = ' + tex(c) + '$, logo $' + v + '_{P\'} = 2 \\times ' + par(c) + ' - ' + v + '_P$.', calculo: v + '_{P\'} = ' + cadeia(combTex([[2, c], [-1, a]]), tex(2 * c - a)) + ',\\quad P\'' + texPonto(Q) },
    ];
    const erros = [
      { codigo: i === 0 ? 'refletiu_em_oy' : 'refletiu_em_ox', P: comQ(-a), explicacao: 'Ignoraste o eixo $' + v + ' = ' + tex(c) + '$ e refletiste no eixo $' + (i === 0 ? 'Oy' : 'Ox') + '$, obtendo ' + opPonto(comQ(-a)) + '. O eixo é $' + v + ' = ' + tex(c) + '$: $' + v + '_{P\'} = ' + combTex([[2, c], [-1, a]]) + ' = ' + tex(2 * c - a) + '$.' },
      { codigo: 'sinal_trocado', P: comQ(2 * c + a), explicacao: 'Passaste $' + v + '_P$ para o outro membro sem trocar o sinal: $' + combTex([[2, c], [1, a]]) + ' = ' + tex(2 * c + a) + '$, o que dá ' + opPonto(comQ(2 * c + a)) + '. De $\\dfrac{' + v + '_P + ' + v + '_{P\'}}{2} = ' + tex(c) + '$ vem $' + v + '_{P\'} = ' + combTex([[2, c], [-1, a]]) + ' = ' + tex(2 * c - a) + '$.' },
      { codigo: 'esqueceu_dobro', P: comQ(c - a), explicacao: 'Calculaste $' + v + '_{P\'} = ' + difTex(c, a) + ' = ' + tex(c - a) + '$, esquecendo multiplicar $' + tex(c) + '$ por 2, e obtiveste ' + opPonto(comQ(c - a)) + '. De $\\dfrac{' + v + '_P + ' + v + '_{P\'}}{2} = ' + tex(c) + '$ vem $' + v + '_{P\'} = ' + combTex([[2, c], [-1, a]]) + ' = ' + tex(2 * c - a) + '$.' },
      { codigo: 'mudou_as_duas', P: pt(P.map((x, k) => (k === i ? 2 * c - x : -x))), explicacao: 'Calculaste bem a ' + EIXO[i] + ', mas também trocaste o sinal da ' + fixa + ', obtendo ' + opPonto(pt(P.map((x, k) => (k === i ? 2 * c - x : -x)))) + '. Numa reflexão de eixo ' + (i === 0 ? 'vertical' : 'horizontal') + ' a ' + fixa + ' mantém-se.' },
    ];
    const pe = P.slice();
    pe[i] = c;
    const viaPe = mais(P, vezes(2, menos(pe, P)));
    const ex = { enunciado, resolucao, dados: { contexto, P, i, c, eixo, pontos: Object.assign(pontos, { "P'": Q }) }, esquema: esquemaPlano(P, Q, 'pontoMedio') };
    return fecharPonto(rng, formato, ex, {
      certo: Q, eixo, erros,
      verificacao: {
        passo: 'Confirmar que o ponto médio de $[PP\']$ está no eixo $' + v + ' = ' + tex(c) + '$',
        calculo: cadeia(medioTex(P, Q), somasTex(P, Q), texPonto(medio(P, Q))),
        P: viaPe,
      },
    });
  }

  registar({
    subtema: 'plano-referencial', tipo: 'simetrico', nome: 'Transformado de um ponto (reflexões e meia-volta)',
    formatos: ['escolha', 'numerica'], contextos: ['eixos', 'reta'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => simetrico(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      // Pé da perpendicular no eixo (ou o centro O) e P' = P + 2 × (pé − P).
      let pe;
      if (d.contexto === 'eixos') pe = d.t === 'Ox' ? [d.P[0], 0] : d.t === 'Oy' ? [0, d.P[1]] : [0, 0];
      else { pe = d.P.slice(); pe[d.i] = d.c; }
      return conferePonto(p, d.P.map((x, k) => x + 2 * (pe[k] - x)));
    },
    limites: (p) => dentro(p.dados.P, 7) && (p.formato !== 'numerica' || Math.abs(p.resposta) <= 17),
  });

  // ================================================================ equação da circunferência
  const eqCirc = (C, rhs) => fatorTex('x', C[0]) + ' + ' + fatorTex('y', C[1]) + ' = ' + rhs;
  // Forma desenvolvida x² + y² + Dx + Ey + F = 0 e substituição de um ponto (outro método).
  function desenvolvida(C, rr) {
    const lin = C.map((c) => -2 * c);
    const cte = limpo(soma2(C) - rr);
    const termos = [[1, 'x^2'], [1, 'y^2'], [1, 'z^2']].slice(0, C.length).concat(lin.map((k, i) => [k, VAR[i]]), [[cte, '']]);
    return { lin, cte, tex: polTex(termos) };
  }
  function substDes(P, lin, cte) {
    const partes = [];
    const valores = [];
    P.forEach((p) => { partes.push([1, par(p) + '^2']); valores.push(p * p); });
    P.forEach((p, i) => {
      if (!lin[i]) return;
      partes.push([lin[i], (Math.abs(lin[i]) === 1 ? '' : tex(Math.abs(lin[i])) + ' \\times ') + par(p)]);
      valores.push(lin[i] * p);
    });
    if (cte) { partes.push([cte, tex(Math.abs(cte))]); valores.push(cte); }
    const s = partes.map(([k, c], j) => (j === 0 ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + ') + c).join('');
    const total = limpo(valores.reduce((a, b) => a + b, 0));
    return { tex: s + ' = ' + somaNum(valores) + ' = ' + tex(total), total };
  }
  // "(x - 2)^2 + (y + 1)^2 = 25" → { C: [2, -1], valor: 25 } (valor: o número do segundo membro).
  function lerCircunferencia(t) {
    const s = String(t).replace(/\$/g, '').trim();
    const m = s.match(/^(x\^2|\(x [+-] \d+\)\^2) \+ (y\^2|\(y [+-] \d+\)\^2) = (.+)$/);
    if (!m) return null;
    const lerFator = (f, v) => {
      if (f === v + '^2') return 0;
      const k = f.match(new RegExp('^\\(' + v + ' ([+-]) (\\d+)\\)\\^2$'));
      return k ? (k[1] === '-' ? 1 : -1) * Number(k[2]) : NaN;
    };
    return { C: [lerFator(m[1], 'x'), lerFator(m[2], 'y')], valor: lerNumero(m[3]) };
  }
  const satisfaz = (e, P) => !!e && e.C.every(Number.isFinite) && proximo(d2(P, e.C), e.valor);

  function equacaoCircunferencia(rng, contexto) {
    const pontos = {};
    let Cc, rr, enunciado, resolucao, erros, verifPontos, esq;
    if (contexto === 'centro-ponto') {
      Cc = [inteiro(rng, -5, 6), inteiro(rng, -5, 6)];
      const d = [inteiro(rng, -5, 5), inteiro(rng, -5, 5)];
      if (d[0] === 0 || d[1] === 0 || (Cc[0] === 0 && Cc[1] === 0)) return null;
      const P = mais(Cc, d);
      rr = soma2(d);
      pontos.C = Cc; pontos.P = P;
      enunciado = 'Qual é a equação da circunferência de centro ' + nomeado('C', Cc) + ' que passa pelo ponto ' + nomeado('P', P) + '?';
      resolucao = [
        { passo: 'Calcular o quadrado do raio', porque: 'O raio é a distância do centro a um ponto da circunferência, $r = \\overline{CP}$.', calculo: 'r^2 = \\overline{CP}^2 = ' + cadeia(quadDif(P[0], Cc[0]) + ' + ' + quadDif(P[1], Cc[1]), somaQuad(d), tex(rr)) },
        { passo: 'Escrever a equação', porque: 'A circunferência de centro $(a' + SEP + 'b)$ e raio $r$ tem equação $(x - a)^2 + (y - b)^2 = r^2$.', calculo: eqCirc(Cc, tex(rr)) },
      ];
      const viz = Cc.map((c, i) => (c < 0 ? i : -1)).filter((i) => i >= 0);
      const dd = d.map((v, i) => (Cc[i] < 0 ? P[i] + Cc[i] : v));
      erros = [
        { codigo: 'sinais_trocados', texto: eqCirc(vezes(-1, Cc), tex(rr)), explicacao: 'Trocaste os sinais do centro: essa circunferência tem centro ' + opPonto(vezes(-1, Cc)) + '. Com centro $C' + texPonto(Cc) + '$ escreve-se $' + fatorTex('x', Cc[0]) + '$ e $' + fatorTex('y', Cc[1]) + '$.' },
        { codigo: 'raio_no_segundo_membro', texto: eqCirc(Cc, raizTex(rr)), explicacao: 'Escreveste o raio, $r = ' + raizCadeia(rr) + '$, no segundo membro. O segundo membro é o quadrado do raio, $r^2 = ' + tex(rr) + '$.' },
        { codigo: 'centro_no_ponto', texto: eqCirc(P, tex(rr)), explicacao: 'Usaste o ponto $P' + texPonto(P) + '$ como centro. O centro é $C' + texPonto(Cc) + '$; $P$ é um ponto da circunferência.' },
        viz.length ? { codigo: 'sinal_negativo_no_raio', texto: eqCirc(Cc, tex(soma2(dd))), explicacao: 'Enganaste-te no raio ao subtrair um número negativo: ' + viz.map((i) => 'em $' + difTex(P[i], Cc[i]) + '$ fizeste $' + tex(P[i]) + ' - ' + tex(-Cc[i]) + ' = ' + tex(dd[i]) + '$').join(' e ') + ', e obtiveste $r^2 = ' + somaQuad(dd) + ' = ' + tex(soma2(dd)) + '$. Subtrair um negativo é somar: $r^2 = ' + tex(rr) + '$.' } : null,
      ];
      verifPontos = [['P', P]];
      esq = esquemaPlano(Cc, P, 'circunferencia');
    } else {
      const A = [inteiro(rng, -5, 6), inteiro(rng, -5, 6)];
      const d = [escolher(rng, NAO_NULOS(4)) * 2, escolher(rng, NAO_NULOS(4)) * 2];
      const B = mais(A, d);
      if (!dentro(B, 9)) return null;
      Cc = medio(A, B);
      if (Cc[0] === 0 && Cc[1] === 0) return null;
      const h = menos(A, Cc);
      rr = soma2(h);
      pontos.A = A; pontos.B = B;
      enunciado = 'Os pontos ' + nomeado('A', A) + ' e ' + nomeado('B', B) + ' são os extremos de um diâmetro de uma circunferência. Qual é a equação dessa circunferência?';
      resolucao = [
        { passo: 'Encontrar o centro', porque: 'O centro é o ponto médio do diâmetro $[AB]$.', calculo: 'C = ' + cadeia(medioTex(A, B), somasTex(A, B), texPonto(Cc)) },
        { passo: 'Calcular o quadrado do raio', porque: 'O raio é a distância do centro a um extremo do diâmetro.', calculo: 'r^2 = \\overline{CA}^2 = ' + cadeia(quadDif(A[0], Cc[0]) + ' + ' + quadDif(A[1], Cc[1]), somaQuad(h), tex(rr)) },
        { passo: 'Escrever a equação', porque: 'A circunferência de centro $(a' + SEP + 'b)$ e raio $r$ tem equação $(x - a)^2 + (y - b)^2 = r^2$.', calculo: eqCirc(Cc, tex(rr)) },
      ];
      erros = [
        { codigo: 'sinais_trocados', texto: eqCirc(vezes(-1, Cc), tex(rr)), explicacao: 'Trocaste os sinais do centro: essa circunferência tem centro ' + opPonto(vezes(-1, Cc)) + '. O centro é o ponto médio de $[AB]$, $C' + texPonto(Cc) + '$, e escreve-se $' + fatorTex('x', Cc[0]) + '$ e $' + fatorTex('y', Cc[1]) + '$.' },
        { codigo: 'diametro_como_raio', texto: eqCirc(Cc, tex(4 * rr)), explicacao: 'Usaste o diâmetro como raio: $\\overline{AB}^2 = ' + somaQuad(d) + ' = ' + tex(4 * rr) + '$. O raio é metade do diâmetro, $r^2 = \\overline{CA}^2 = ' + tex(rr) + '$.' },
        { codigo: 'nao_dividiu_centro', texto: eqCirc(mais(A, B), tex(rr)), explicacao: 'Somaste as coordenadas de A e de B, ' + opPonto(mais(A, B)) + ', mas não dividiste por 2. O centro é o ponto médio, $C' + texPonto(Cc) + '$.' },
        { codigo: 'raio_no_segundo_membro', texto: eqCirc(Cc, raizTex(rr)), explicacao: 'Escreveste o raio, $r = ' + raizCadeia(rr) + '$, no segundo membro. O segundo membro é o quadrado do raio, $r^2 = ' + tex(rr) + '$.' },
      ];
      verifPontos = [['A', A], ['B', B]];
      esq = esquemaPlano(Cc, A, 'circunferencia');
    }
    const D = desenvolvida(Cc, rr);
    const subs = verifPontos.map(([n, Q]) => [n, Q, substDes(Q, D.lin, D.cte)]);
    if (subs.some((s) => s[2].total !== 0)) return null;
    const certa = '$' + eqCirc(Cc, tex(rr)) + '$';
    const ex = {
      enunciado, resolucao, esquema: esq,
      dados: { contexto, C: Cc, r2: rr, pontos, dados: verifPontos.map((x) => x[1]) },
      verificacao: {
        passo: 'Confirmar na forma desenvolvida, $' + D.tex + ' = 0$, que ' + (subs.length === 1 ? 'o ponto $P$ a verifica' : 'os pontos $A$ e $B$ a verificam'),
        calculo: subs.map(([n, , s]) => n + '\\colon\\ ' + s.tex).join(',\\quad '),
      },
    };
    return fecharTexto(rng, ex, certa, erros.filter(Boolean).map((e) => ({ codigo: e.codigo, texto: '$' + e.texto + '$', explicacao: e.explicacao })), certa);
  }

  registar({
    subtema: 'plano-condicoes', tipo: 'equacao-circunferencia', nome: 'Equação da circunferência',
    formatos: ['escolha'], contextos: ['centro-ponto', 'diametro'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => equacaoCircunferencia(rng, contexto));
    },
    verificarIndependente(p) {
      // Os pontos dados verificam a equação escolhida; centro dado (centro-ponto) ou
      // dois pontos da circunferência a uma distância igual ao diâmetro (diâmetro).
      const e = lerCircunferencia(p.opcoes[p.correta]);
      if (!e || !p.dados.dados.every((Q) => satisfaz(e, Q))) return false;
      if (p.dados.contexto === 'centro-ponto') return iguais(e.C, p.dados.pontos.C);
      const { A, B } = p.dados.pontos;
      return proximo(d2(A, B), 4 * e.valor);
    },
    limites: (p) => dentro(p.dados.C, 9) && p.dados.r2 > 0 && p.dados.r2 <= 64,
  });

  // ================================================================ pertence (mediatriz, semiplano, círculo)
  const OPS = { '<': '<', '>': '>', '<=': '\\leq', '>=': '\\geq' };
  const vale = (op, a, b) => (op === '<' ? a < b - 1e-9 : op === '>' ? a > b + 1e-9 : op === '<=' ? a <= b + 1e-9 : a >= b - 1e-9);
  const resultado = (v) => '\\ \\text{(' + (v ? 'verdadeiro' : 'falso') + ')}';

  function pertenceMediatriz(rng) {
    const A = [inteiro(rng, -4, 6), inteiro(rng, -4, 6)];
    const d = [escolher(rng, NAO_NULOS(3)) * 2, escolher(rng, NAO_NULOS(3)) * 2];
    const B = mais(A, d);
    if (!dentro(B, 9)) return null;
    const M = medio(A, B);
    const g = mdc(Math.abs(d[0]), Math.abs(d[1]));
    const w = [-d[1] / g, d[0] / g];
    const Pv = mais(M, vezes(escolher(rng, [-2, -1, 1, 2]), w));
    const vertical = rng() < 0.5;
    const s = escolher(rng, NAO_NULOS(4));
    const Pf = mais(M, vertical ? [0, s] : [s, 0]);
    if (!dentro(Pv, 12) || !dentro(Pf, 12)) return null;
    if (d2(Pf, A) === d2(Pf, B) || d2(Pv, A) !== d2(Pv, B)) return null; // a falsa é mesmo falsa
    const frase = (P) => 'O ponto ' + nomeado('P', P) + ' pertence à mediatriz de $[AB]$.';
    const erroF = {
      codigo: vertical ? 'mediatriz_vertical' : 'mediatriz_horizontal',
      explicacao: '$P$ tem a mesma ' + (vertical ? 'abcissa' : 'ordenada') + ' que o ponto médio $M' + texPonto(M) + '$ de $[AB]$, mas a mediatriz só é ' + (vertical ? 'vertical quando $[AB]$ é horizontal' : 'horizontal quando $[AB]$ é vertical') +
        '. Aqui $\\overline{PA}^2 = ' + tex(d2(Pf, A)) + '$ e $\\overline{PB}^2 = ' + tex(d2(Pf, B)) + '$: $P$ não está à mesma distância de $A$ e de $B$.',
    };
    const v = AJ.vfDe(rng, frase(Pv), frase(Pf), erroF);
    const P = v.correta ? Pv : Pf;
    const nA = d2(P, A), nB = d2(P, B);
    const dist = (Q, n) => '\\overline{P' + n + '}^2 = ' + cadeia(quadDif(P[0], Q[0]) + ' + ' + quadDif(P[1], Q[1]), somaQuad(menos(P, Q)), tex(d2(P, Q)));
    // Equação da mediatriz (desenvolvendo PA² = PB²): ax + by = c, simplificada.
    const m = calc().mediatriz(A, B);
    const k = mdc(mdc(Math.abs(m.a), Math.abs(m.b)), Math.abs(m.c)) * (m.a < 0 ? -1 : 1);
    const [a, b, c] = [m.a / k, m.b / k, limpo(m.c / k)];
    const eq = cx(a, 'x') + (b < 0 ? ' - ' : ' + ') + cx(Math.abs(b), 'y') + ' = ' + tex(c);
    const val = limpo(a * P[0] + b * P[1]);
    return {
      enunciado: 'Considera os pontos ' + nomeado('A', A) + ' e ' + nomeado('B', B) + '. Afirmação: «' + v.enunciado + '»',
      correta: v.correta, errosTipicos: v.errosTipicos,
      resolucao: [
        { passo: 'Calcular as distâncias de $P$ a $A$ e a $B$ (ao quadrado)', porque: 'Um ponto pertence à mediatriz de $[AB]$ se e só se está à mesma distância de $A$ e de $B$.', calculo: '\\begin{array}{l} ' + dist(A, 'A') + ' \\\\ ' + dist(B, 'B') + ' \\end{array}', bloco: true },
        { passo: 'Comparar', porque: nA === nB ? 'As distâncias são iguais, logo $P$ pertence à mediatriz.' : 'As distâncias são diferentes, logo $P$ não pertence à mediatriz.', calculo: '\\overline{PA}^2 ' + (nA === nB ? '=' : '\\neq') + ' \\overline{PB}^2' },
      ],
      verificacao: {
        passo: 'Confirmar com a equação da mediatriz, $' + eq + '$ (obtém-se desenvolvendo $(x - x_A)^2 + (y - y_A)^2 = (x - x_B)^2 + (y - y_B)^2$), substituindo as coordenadas de $P$',
        calculo: cadeia(combTex([[a, P[0]], [b, P[1]]]), tex(val)) + (val === c ? '' : ' \\neq ' + tex(c)),
        valor: val === c,
      },
      dados: { contexto: 'mediatriz', A, B, P, pontos: { A, B, P } },
      esquema: esquemaPlano(A, B, 'mediatriz'),
    };
  }

  function pertenceSemiplano(rng) {
    const m = escolher(rng, NAO_NULOS(3));
    const b = escolher(rng, NAO_NULOS(4));
    const op = escolher(rng, ['<', '>', '<=', '>=']);
    const estrita = op.length === 1;
    const dir = op[0] === '>' ? 1 : -1;
    const rhs = cx(m, 'x') + maisTex(b);
    const cond = 'y ' + OPS[op] + ' ' + rhs;
    const na = (x) => limpo(m * x + b);
    const x1 = escolher(rng, NAO_NULOS(3)), x2 = escolher(rng, NAO_NULOS(3));
    const Pv = [x1, na(x1) + dir * inteiro(rng, estrita ? 1 : 0, 3)];
    const tipoF = estrita && rng() < 0.5 ? 'fronteira' : 'lado';
    const Pf = [x2, na(x2) + (tipoF === 'fronteira' ? 0 : -dir * inteiro(rng, 1, 3))];
    if (vale(op, Pf[1], na(Pf[0])) || !vale(op, Pv[1], na(Pv[0]))) return null;
    const frase = (P) => 'O ponto ' + nomeado('P', P) + ' pertence ao semiplano definido por $' + cond + '$.';
    const lado = (s) => (s > 0 ? 'acima' : 'abaixo');
    const erroF = tipoF === 'fronteira'
      ? { codigo: 'fronteira_estrita', explicacao: 'Para $x = ' + tex(Pf[0]) + '$, $' + vezesTex(m, par(Pf[0])) + maisTex(b) + ' = ' + tex(Pf[1]) + '$: $P$ está na reta $y = ' + rhs + '$, a fronteira. Com «$' + OPS[op] + '$» a fronteira não pertence ao semiplano.' }
      : { codigo: 'trocou_o_sentido', explicacao: 'Para $x = ' + tex(Pf[0]) + '$, $' + vezesTex(m, par(Pf[0])) + maisTex(b) + ' = ' + tex(na(Pf[0])) + '$ e a ordenada de $P$ é $' + tex(Pf[1]) + '$: $P$ está ' + lado(-dir) + ' da reta. A condição $' + cond + '$ define o semiplano ' + lado(dir) + ' da reta.' };
    const v = AJ.vfDe(rng, frase(Pv), frase(Pf), erroF);
    const P = v.correta ? Pv : Pf;
    const y0 = na(P[0]);
    const holds = vale(op, P[1], y0);
    const val = limpo(P[1] - m * P[0] - b);
    const cond0 = polTex([[1, 'y'], [-m, 'x'], [-b, '']]) + ' ' + OPS[op] + ' 0';
    const subst = combTex([[1, P[1]], [-m, P[0]], [-b, null]]);
    return {
      enunciado: 'Afirmação: «' + v.enunciado + '»',
      correta: v.correta, errosTipicos: v.errosTipicos,
      resolucao: [
        { passo: 'Substituir $x$ pela abcissa de $P$ no segundo membro', porque: 'Obtém-se a ordenada do ponto da reta $y = ' + rhs + '$ com a mesma abcissa de $P$.', calculo: cadeia(vezesTex(m, par(P[0])) + maisTex(b), tex(y0)) },
        { passo: 'Comparar com a ordenada de $P$', porque: 'Como $' + tex(P[1]) + ' ' + relTex(P[1], y0) + ' ' + tex(y0) + '$, ' + (holds ? 'a condição verifica-se e $P$ pertence ao semiplano.' : 'a condição $' + tex(P[1]) + ' ' + OPS[op] + ' ' + tex(y0) + '$ não se verifica e $P$ não pertence ao semiplano.'), calculo: tex(P[1]) + ' ' + OPS[op] + ' ' + tex(y0) + resultado(holds) },
      ],
      verificacao: {
        passo: 'Confirmar escrevendo a condição na forma $' + cond0 + '$ e substituindo as coordenadas de $P$',
        calculo: cadeia(subst, tex(val)) + ',\\quad ' + tex(val) + ' ' + OPS[op] + ' 0' + resultado(vale(op, val, 0)),
        valor: vale(op, val, 0),
      },
      dados: { contexto: 'semiplano', m, b, op, P, pontos: { P } },
    };
  }

  const RAIOS2 = [4, 5, 9, 10, 13, 16, 17, 20, 25];
  function pertenceCirculo(rng) {
    const Cc = [inteiro(rng, -4, 4), inteiro(rng, -4, 4)];
    if (Cc[0] === 0 && Cc[1] === 0) return null;
    const rr = escolher(rng, RAIOS2);
    const op = escolher(rng, ['<=', '<']);
    const cond = eqCirc(Cc, '').replace(/ = $/, '') + ' ' + OPS[op] + ' ' + tex(rr);
    const grelha = [];
    for (let x = -9; x <= 9; x++) for (let y = -9; y <= 9; y++) grelha.push([x, y]);
    const verdadeiros = grelha.filter((P) => vale(op, d2(P, Cc), rr) && !iguais(P, Cc));
    const anti = vezes(-1, Cc);
    const falsos = {
      fronteira_estrita: op === '<' ? grelha.filter((P) => d2(P, Cc) === rr) : [],
      centro_sinais_trocados: grelha.filter((P) => d2(P, Cc) > rr && vale(op, d2(P, anti), rr)),
      comparou_distancia_com_r2: grelha.filter((P) => d2(P, Cc) > rr && Math.sqrt(d2(P, Cc)) <= rr && d2(P, Cc) <= 2.5 * rr),
    };
    const tipos = Object.keys(falsos).filter((k) => falsos[k].length);
    if (!verdadeiros.length || !tipos.length) return null;
    const tipoF = escolher(rng, tipos);
    const Pv = escolher(rng, verdadeiros);
    const Pf = escolher(rng, falsos[tipoF]);
    const r = raizCadeia(rr, true);
    const somaDe = (P, Q) => cadeia(quadDif(P[0], Q[0]) + ' + ' + quadDif(P[1], Q[1]), somaQuad(menos(P, Q)), tex(d2(P, Q)));
    const nf = d2(Pf, Cc);
    const explic = {
      fronteira_estrita: '$P$ verifica $' + eqCirc(Cc, tex(rr)) + '$: está na circunferência. Com «$<$» só contam os pontos do interior, por isso $P$ não pertence ao conjunto.',
      centro_sinais_trocados: 'Trocaste os sinais do centro e usaste ' + opPonto(anti) + ': $' + somaDe(Pf, anti) + '$. O centro é $C' + texPonto(Cc) + '$, e $' + somaDe(Pf, Cc) + '$, que é maior do que $' + tex(rr) + '$.',
      comparou_distancia_com_r2: 'Comparaste a distância $\\overline{CP} = ' + raizCadeia(nf, true) + '$ com $' + tex(rr) + '$, mas $' + tex(rr) + '$ é o quadrado do raio. O raio é $r = ' + r + '$ e $\\overline{CP} > r$ (ou seja, $' + tex(nf) + ' > ' + tex(rr) + '$).',
    };
    const frase = (P) => 'O ponto ' + nomeado('P', P) + ' pertence ao ' + (op === '<=' ? 'círculo' : 'conjunto de pontos') + ' definido por $' + cond + '$.';
    const v = AJ.vfDe(rng, frase(Pv), frase(Pf), { codigo: tipoF, explicacao: explic[tipoF] });
    const P = v.correta ? Pv : Pf;
    const n = d2(P, Cc);
    const holds = vale(op, n, rr);
    const viaRaiz = vale(op, Math.sqrt(n), Math.sqrt(rr));
    return {
      enunciado: 'Afirmação: «' + v.enunciado + '»',
      correta: v.correta, errosTipicos: v.errosTipicos,
      resolucao: [
        { passo: 'Substituir as coordenadas de $P$ no primeiro membro', porque: '$P$ pertence ao conjunto se e só se as suas coordenadas verificam a condição.', calculo: somaDe(P, Cc) },
        { passo: 'Comparar com o segundo membro', porque: 'Como $' + tex(n) + ' ' + relTex(n, rr) + ' ' + tex(rr) + '$, ' + (holds ? 'a condição verifica-se e $P$ pertence ao conjunto.' : 'a condição não se verifica e $P$ não pertence ao conjunto.'), calculo: tex(n) + ' ' + OPS[op] + ' ' + tex(rr) + resultado(holds) },
      ],
      verificacao: {
        passo: 'Confirmar comparando a distância de $P$ ao centro $C' + texPonto(Cc) + '$ com o raio',
        calculo: '\\overline{CP} = ' + raizCadeia(n, true) + ',\\quad r = ' + r + ',\\quad \\overline{CP} ' + OPS[op] + ' r' + resultado(viaRaiz),
        valor: viaRaiz,
      },
      dados: { contexto: 'circulo', C: Cc, r2: rr, op, P, pontos: { C: Cc, P } },
      esquema: noPlano(Cc) && noPlano(P) ? { id: 'plano', opcoes: { A: Cc.slice(), B: P.slice(), modo: 'circunferencia' } } : undefined,
    };
  }

  registar({
    subtema: 'plano-condicoes', tipo: 'pertence', nome: 'Pertence ao conjunto? (mediatriz, semiplano, círculo)',
    formatos: ['vf'], contextos: ['mediatriz', 'semiplano', 'circulo'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => (contexto === 'mediatriz' ? pertenceMediatriz(rng) : contexto === 'semiplano' ? pertenceSemiplano(rng) : pertenceCirculo(rng)));
    },
    verificarIndependente(p) {
      const d = p.dados;
      let pertence;
      if (d.contexto === 'mediatriz') {
        const m = calc().mediatriz(d.A, d.B);
        pertence = proximo(m.a * d.P[0] + m.b * d.P[1], m.c);
      } else if (d.contexto === 'semiplano') pertence = vale(d.op, d.P[1] - d.m * d.P[0] - d.b, 0);
      else pertence = vale(d.op, calc().distancia(d.P, d.C), Math.sqrt(d.r2));
      return pertence === p.correta;
    },
    limites: (p) => dentro(p.dados.P, 20),
  });

  // ================================================================ reta paralela a um eixo
  function retaParalelaEixo(rng, formato, contexto) {
    let certa, erros, enunciado, resolucao, verificacao, dados;
    const eqTex = (v, k) => v + ' = ' + tex(k);
    if (contexto === 'ponto') {
      const P = [escolher(rng, NAO_NULOS(7)), escolher(rng, NAO_NULOS(7))];
      if (P[0] === P[1]) return null;
      const vertical = rng() < 0.5; // paralela a Oy
      const i = vertical ? 0 : 1;
      const eixoNome = vertical ? 'Oy' : 'Ox';
      const outroEixo = vertical ? 'Ox' : 'Oy';
      const v = VAR[i], w = VAR[1 - i];
      certa = { v, k: P[i] };
      erros = [
        { codigo: 'trocou_o_eixo', v: w, k: P[1 - i], explicacao: '$' + eqTex(w, P[1 - i]) + '$ é a reta paralela ao eixo $' + outroEixo + '$ que passa por $P$. A reta paralela ao eixo $' + eixoNome + '$ é ' + (vertical ? 'vertical' : 'horizontal') + ' e todos os seus pontos têm a ' + EIXO[i] + ' de $P$, $' + eqTex(v, P[i]) + '$.' },
        { codigo: 'coordenada_errada', v, k: P[1 - i], explicacao: 'Usaste a ' + EIXO[1 - i] + ' de $P$ e escreveste $' + eqTex(v, P[1 - i]) + '$. Na reta paralela ao eixo $' + eixoNome + '$ o que se mantém é a ' + EIXO[i] + ', a de $P$: $' + eqTex(v, P[i]) + '$.' },
        { codigo: 'o_proprio_eixo', v, k: 0, explicacao: '$' + eqTex(v, 0) + '$ é o próprio eixo $' + eixoNome + '$, que não passa por $P$ (a ' + EIXO[i] + ' de $P$ é $' + tex(P[i]) + '$). A paralela que passa por $P$ é $' + eqTex(v, P[i]) + '$.' },
      ];
      const Q = P.slice(); Q[1 - i] = 0;
      enunciado = 'A reta $r$ é paralela ao eixo $' + eixoNome + '$ e passa pelo ponto ' + nomeado('P', P) + '. ' + (formato === 'numerica' ? 'Uma equação de $r$ é $' + v + ' = k$. Qual é o valor de $k$?' : 'Qual é uma equação de $r$?');
      resolucao = [{ passo: 'Identificar a direção da reta', porque: 'Uma reta paralela ao eixo $' + eixoNome + '$ é ' + (vertical ? 'vertical' : 'horizontal') + ': todos os seus pontos têm a mesma ' + EIXO[i] + ', a de $P$.', calculo: eqTex(v, P[i]) }];
      verificacao = {
        passo: 'Confirmar com dois pontos de $r$: $P$ e o ponto $Q$ onde $r$ corta o eixo $' + outroEixo + '$ têm a mesma ' + EIXO[i] + ', por isso $PQ$ é ' + (vertical ? 'vertical' : 'horizontal'),
        calculo: 'P' + texPonto(P) + ',\\quad Q' + texPonto(Q) + ',\\quad ' + v + '_P = ' + v + '_Q = ' + tex(Q[i]),
        k: Q[i],
      };
      dados = { contexto, P, i, pontos: { P, Q } };
    } else {
      // mediatriz de um segmento paralelo a um eixo
      const i = inteiro(rng, 0, 1); // A e B diferem nesta coordenada: a mediatriz é v = k
      const A = [inteiro(rng, -6, 7), inteiro(rng, -6, 7)];
      const B = A.slice();
      B[i] = A[i] + escolher(rng, NAO_NULOS(9));
      if (!dentro(B, 9) || A[i] === 0 || B[i] === 0 || A[1 - i] === 0) return null;
      const k = limpo((A[i] + B[i]) / 2);
      const v = VAR[i], w = VAR[1 - i];
      const pos = i === 0 ? 'horizontal' : 'vertical';
      const posM = i === 0 ? 'vertical' : 'horizontal';
      certa = { v, k };
      erros = [
        { codigo: 'nao_dividiu_por_2', v, k: A[i] + B[i], explicacao: 'Somaste $' + tex(A[i]) + ' + ' + par(B[i]) + ' = ' + tex(A[i] + B[i]) + '$ e não dividiste por 2, escrevendo $' + eqTex(v, A[i] + B[i]) + '$. A mediatriz passa pelo ponto médio de $[AB]$: $' + v + ' = \\dfrac{' + tex(A[i]) + ' + ' + par(B[i]) + '}{2} = ' + tex(k) + '$.' },
        { codigo: 'subtraiu_coordenadas', v, k: limpo((B[i] - A[i]) / 2), explicacao: 'Calculaste $\\dfrac{' + difTex(B[i], A[i]) + '}{2} = ' + tex((B[i] - A[i]) / 2) + '$, metade do comprimento de $[AB]$, e escreveste $' + eqTex(v, limpo((B[i] - A[i]) / 2)) + '$. A mediatriz passa pelo ponto médio, cuja ' + EIXO[i] + ' é a média $\\dfrac{' + tex(A[i]) + ' + ' + par(B[i]) + '}{2} = ' + tex(k) + '$.' },
        { codigo: 'reta_ab', v: w, k: A[1 - i], explicacao: '$' + eqTex(w, A[1 - i]) + '$ é a reta $AB$, que contém o segmento. A mediatriz é perpendicular a $[AB]$: é a reta ' + posM + ' $' + eqTex(v, k) + '$.' },
      ];
      const Q = A.slice(); Q[i] = k; Q[1 - i] = A[1 - i] + 3;
      enunciado = 'Considera os pontos ' + nomeado('A', A) + ' e ' + nomeado('B', B) + '. ' + (formato === 'numerica' ? 'A mediatriz de $[AB]$ tem uma equação da forma $x = k$ ou $y = k$. Qual é o valor de $k$?' : 'Qual é uma equação da mediatriz de $[AB]$?');
      resolucao = [
        { passo: 'Ver a posição de $[AB]$', porque: '$A$ e $B$ têm a mesma ' + EIXO[1 - i] + ', logo $[AB]$ é ' + pos + ' e a mediatriz, perpendicular a $[AB]$, é ' + posM + '.' },
        { passo: 'Passar pelo ponto médio', porque: 'A mediatriz passa pelo ponto médio de $[AB]$, cuja ' + EIXO[i] + ' é a média das ' + EIXO[i] + 's de $A$ e de $B$.', calculo: v + ' = ' + cadeia('\\dfrac{' + tex(A[i]) + ' + ' + par(B[i]) + '}{2}', '\\dfrac{' + tex(A[i] + B[i]) + '}{2}', tex(k)) },
      ];
      const QA = d2(Q, A), QB = d2(Q, B);
      verificacao = {
        passo: 'Confirmar que um ponto da reta, $Q' + texPonto(Q) + '$, está à mesma distância de $A$ e de $B$',
        calculo: '\\overline{QA}^2 = ' + somaQuad(menos(A, Q)) + ' = ' + tex(QA) + ',\\quad \\overline{QB}^2 = ' + somaQuad(menos(B, Q)) + ' = ' + tex(QB),
        k: QA === QB ? Q[i] : NaN,
      };
      dados = { contexto, A, B, i, pontos: { A, B, Q } };
    }
    const op = (e) => '$' + eqTex(e.v, e.k) + '$';
    const ex = { enunciado, resolucao, dados: Object.assign(dados, { v: certa.v }) };
    if (formato === 'numerica') {
      return fechar(rng, 'numerica', ex, {
        resposta: certa.k, tolerancia: 0,
        erros: erros.map((e) => ({ codigo: e.codigo, valor: e.k, explicacao: e.explicacao })),
        verificacao: { passo: verificacao.passo, calculo: verificacao.calculo, valor: verificacao.k },
      });
    }
    ex.verificacao = { passo: verificacao.passo, calculo: verificacao.calculo };
    return fecharTexto(rng, ex, op(certa), erros.map((e) => ({ codigo: e.codigo, texto: op(e), explicacao: e.explicacao })), op({ v: certa.v, k: verificacao.k }));
  }
  function lerEquacaoSimples(t) {
    const m = String(t).replace(/\$/g, '').trim().match(/^([xyz]) = (.+)$/);
    return m ? { v: m[1], k: lerNumero(m[2]) } : null;
  }

  registar({
    subtema: 'plano-condicoes', tipo: 'reta-paralela-eixo', nome: 'Reta paralela a um eixo',
    formatos: ['escolha', 'numerica'], contextos: ['ponto', 'mediatriz'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => retaParalelaEixo(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      // ponto: dois pontos da reta (P e o corte com o outro eixo); mediatriz: ponto equidistante de A e de B.
      let v, k;
      if (d.contexto === 'ponto') { v = VAR[d.i]; k = d.P[d.i]; } else {
        v = VAR[d.i];
        k = NaN;
        for (let t = -40; t <= 40; t++) {
          const Q = d.A.slice(); Q[d.i] = t / 2; Q[1 - d.i] = 0;
          if (proximo(d2(Q, d.A), d2(Q, d.B))) k = t / 2;
        }
      }
      if (p.formato === 'numerica') return Math.abs(p.resposta - k) <= p.tolerancia + 1e-9;
      const e = lerEquacaoSimples(p.opcoes[p.correta]);
      return !!e && e.v === v && proximo(e.k, k);
    },
    limites: (p) => (p.dados.P ? dentro(p.dados.P, 7) : dentro(p.dados.A, 9) && dentro(p.dados.B, 9)),
  });

  // ================================================================ espaço: distância
  registar({
    subtema: 'espaco', tipo: 'distancia-3d', nome: 'Distância entre dois pontos do espaço',
    formatos: ['numerica', 'escolha'], contextos: ['pontos', 'paralelepipedo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => distancia(rng, formato, contexto, 3));
    },
    verificarIndependente: distanciaIndependente,
    limites: limitesDistancia,
  });

  // ================================================================ esfera: centro e raio
  const RAIOS2_3D = [3, 5, 6, 9, 11, 13, 14, 17, 18, 21, 25, 26, 29];
  const repr3 = (n) => {
    const r = [];
    for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) for (let k = -5; k <= 5; k++) {
      if (i * i + j * j + k * k === n && [i, j, k].filter((x) => x !== 0).length >= 2) r.push([i, j, k]);
    }
    return r;
  };
  const eqEsfera = (C, rhs) => fatorTex('x', C[0]) + ' + ' + fatorTex('y', C[1]) + ' + ' + fatorTex('z', C[2]) + ' = ' + rhs;
  const opEsfera = (C, rr) => '$C' + texPonto(C) + '$ e $r = ' + raizTex(rr) + '$';
  function lerEsfera(t) {
    const m = String(t).match(/^\$C(\([^$]*\))\$ e \$r = ([^$]+)\$$/);
    if (!m) return null;
    const C = lerPonto('$' + m[1] + '$');
    const r = lerNumero(m[2]);
    return C && Number.isFinite(r) ? { C, r } : null;
  }

  function esfera(rng, formato, contexto) {
    const Cc = [inteiro(rng, -4, 4), inteiro(rng, -4, 4), inteiro(rng, -4, 4)];
    const rr = escolher(rng, RAIOS2_3D);
    const numerica = formato === 'numerica';
    const s = soma2(Cc);
    if (s === 0) return null;
    if (contexto === 'reduzida' && formato === 'escolha' && !(Cc.some((c) => c < 0) && Cc.some((c) => c > 0))) return null;
    const des = desenvolvida(Cc, rr);
    const lin = des.lin;
    const k = -des.cte; // x² + y² + z² + Dx + Ey + Fz = k
    const r = raizCadeia(rr, numerica);
    const C = Cc;
    let enunciado, resolucao;
    const pedido = numerica ? 'Qual é o raio da superfície esférica?' : 'Quais são o centro $C$ e o raio $r$ da superfície esférica?';
    if (contexto === 'reduzida') {
      enunciado = 'Considera a superfície esférica de equação $' + eqEsfera(C, tex(rr)) + '$. ' + pedido;
      resolucao = [
        { passo: 'Ler o centro', porque: 'Em $(x - a)^2 + (y - b)^2 + (z - c)^2 = r^2$ o centro é $(a' + SEP + 'b' + SEP + 'c)$; por exemplo, $(x + 2)^2 = (x - (-2))^2$.', calculo: 'C' + texPonto(C) },
        { passo: 'Calcular o raio', porque: 'O segundo membro é o quadrado do raio.', calculo: 'r = ' + r },
      ];
    } else {
      const vs = [0, 1, 2].filter((i) => lin[i] !== 0);
      enunciado = 'Considera a superfície esférica de equação $' + polTex([[1, 'x^2'], [1, 'y^2'], [1, 'z^2']].concat(lin.map((c, i) => [c, VAR[i]]))) + ' = ' + tex(k) + '$. ' + pedido;
      resolucao = [
        {
          passo: 'Completar os quadrados', porque: 'A cada par $x^2 + Dx$ junta-se o quadrado de metade de $D$: $x^2 + Dx = \\left(x + \\dfrac{D}{2}\\right)^2 - \\dfrac{D^2}{4}$.',
          calculo: '\\begin{array}{l} ' + vs.map((i) => polTex([[1, VAR[i] + '^2'], [lin[i], VAR[i]]]) + ' = ' + fatorTex(VAR[i], C[i]) + ' - ' + tex(C[i] * C[i])).join(' \\\\ ') + ' \\end{array}', bloco: true,
        },
        { passo: 'Escrever a equação reduzida', porque: 'Os quadrados subtraídos passam para o segundo membro a somar.', calculo: eqEsfera(C, tex(k) + ' + ' + vs.map((i) => tex(C[i] * C[i])).join(' + ')) + ' \\Leftrightarrow ' + eqEsfera(C, tex(rr)) },
        { passo: 'Ler o centro e o raio', porque: 'O centro é $(a' + SEP + 'b' + SEP + 'c)$ e o segundo membro é $r^2$.', calculo: 'C' + texPonto(C) + ',\\quad r = ' + r },
      ];
    }
    // Verificação: dois pontos diametralmente opostos verificam a equação dada e distam 2r.
    const ws = repr3(rr);
    if (!ws.length) return null;
    const w = escolher(rng, ws);
    const Q = mais(C, w), Q2 = menos(C, w);
    const naEq = (X) => (contexto === 'reduzida'
      ? cadeia(X.map((x, i) => quadDif(x, C[i])).join(' + '), somaQuad(menos(X, C)), tex(d2(X, C)))
      : (() => { const sd = substDes(X, lin, 0); return sd.tex; })());
    const alvo = contexto === 'reduzida' ? rr : k;
    const valQ = contexto === 'reduzida' ? d2(Q, C) : substDes(Q, lin, 0).total;
    const valQ2 = contexto === 'reduzida' ? d2(Q2, C) : substDes(Q2, lin, 0).total;
    if (valQ !== alvo || valQ2 !== alvo) return null;
    const QQ = d2(Q, Q2);
    const verif = {
      passo: 'Confirmar com os pontos $Q' + texPonto(Q) + '$ e $Q\'' + texPonto(Q2) + '$, simétricos em relação a $C$: ambos verificam a equação dada (o primeiro membro dá $' + tex(alvo) + '$) e $\\overline{QQ\'} = 2r$',
      calculo: 'Q\\colon\\ ' + naEq(Q) + ',\\quad Q\'\\colon\\ ' + naEq(Q2) + ',\\quad \\overline{QQ\'}^2 = ' + tex(QQ) + ' = 4 \\times ' + tex(rr),
    };
    const dados = { contexto, C, r2: rr, lin, k, pontos: { C, Q, "Q'": Q2 } };
    const esq = noEspaco(C) && quadrado(rr) && Math.sqrt(rr) <= 6 ? { id: 'espaco3d', opcoes: { P: C.slice(), raio: Math.sqrt(rr), mostrar: ['esfera', 'ponto'] } } : undefined;
    const ex = { enunciado, resolucao, dados, esquema: esq };
    const somaC = C.filter((c) => c !== 0).map((c) => tex(c * c)).join(' + ');
    if (numerica) {
      const erros = [
        { codigo: 'raio_e_o_segundo_membro', n: rr * rr, explicacao: 'Tomaste o segundo membro, $' + tex(rr) + '$, como raio. Esse número é $r^2$, por isso $r = ' + r + '$.' },
      ];
      if (contexto === 'desenvolvida') {
        if (k > 0) erros.push({ codigo: 'esqueceu_somar_quadrados', n: k, explicacao: 'Completaste os quadrados mas não passaste $' + somaC + '$ para o segundo membro: ficaste com $r^2 = ' + tex(k) + '$ e $r = ' + raizCadeia(k, true) + '$. O certo é $r^2 = ' + tex(k) + ' + ' + somaC + ' = ' + tex(rr) + '$.' });
        if (k - s > 0) erros.push({ codigo: 'subtraiu_quadrados', n: k - s, explicacao: 'Passaste $' + somaC + '$ para o segundo membro a subtrair: $r^2 = ' + tex(k) + ' - ' + tex(s) + ' = ' + tex(k - s) + '$ e $r = ' + raizCadeia(k - s, true) + '$. Os quadrados subtraídos no primeiro membro passam a somar: $r^2 = ' + tex(rr) + '$.' });
        erros.push({ codigo: 'nao_dividiu_coeficientes', n: k + 4 * s, explicacao: 'Não dividiste os coeficientes de $x$, $y$ e $z$ por 2: somaste os quadrados de ' + lin.filter((c) => c !== 0).map((c) => '$' + tex(c) + '$').join(', ') + ' e obtiveste $r^2 = ' + tex(k) + ' + ' + tex(4 * s) + ' = ' + tex(k + 4 * s) + '$, $r = ' + raizCadeia(k + 4 * s, true) + '$. Soma-se o quadrado de metade de cada coeficiente.' });
      }
      return fecharMedida(rng, formato, ex, { n: rr, erros, verificacao: Object.assign(verif, { n: QQ / 4 }) });
    }
    const anti = vezes(-1, C);
    const erros = [
      { codigo: 'sinais_trocados', texto: opEsfera(anti, rr), explicacao: contexto === 'reduzida' ? 'Trocaste os sinais do centro. Em $' + fatorTex('x', C[0]) + '$ a abcissa do centro é $' + tex(C[0]) + '$: o centro é $C' + texPonto(C) + '$.' : 'Trocaste os sinais do centro. Ao completar os quadrados, ' + [0, 1, 2].filter((i) => lin[i] !== 0).map((i) => 'de $' + polTex([[1, VAR[i] + '^2'], [lin[i], VAR[i]]]) + '$ vem $' + fatorTex(VAR[i], C[i]) + '$').join(', ') + ': o centro é $C' + texPonto(C) + '$.' },
      { codigo: 'raio_e_o_segundo_membro', texto: opEsfera(C, rr * rr), explicacao: 'Tomaste $' + tex(rr) + '$ como raio. Esse número é $r^2$, por isso $r = ' + raizCadeia(rr) + '$.' },
    ];
    if (contexto === 'reduzida') {
      const lido = C.map(Math.abs);
      erros.push({ codigo: 'ignorou_sinal_mais', texto: opEsfera(lido, rr), explicacao: 'Leste os números dentro dos parênteses sem o sinal: ' + C.filter((c) => c < 0).map((c, j) => '$' + fatorTex(VAR[C.indexOf(c)], c) + '$').join(' e ') + ' dá' + (C.filter((c) => c < 0).length > 1 ? 'm' : '') + ' coordenada' + (C.filter((c) => c < 0).length > 1 ? 's' : '') + ' negativa' + (C.filter((c) => c < 0).length > 1 ? 's' : '') + ' do centro, porque $(x + a)^2 = (x - (-a))^2$. O centro é $C' + texPonto(C) + '$.' });
    } else {
      if (k > 0) erros.push({ codigo: 'esqueceu_somar_quadrados', texto: opEsfera(C, k), explicacao: 'Não passaste $' + somaC + '$ para o segundo membro: ficaste com $r^2 = ' + tex(k) + '$, $r = ' + raizCadeia(k) + '$. O certo é $r^2 = ' + tex(k) + ' + ' + somaC + ' = ' + tex(rr) + '$.' });
      if (k - s > 0) erros.push({ codigo: 'subtraiu_quadrados', texto: opEsfera(C, k - s), explicacao: 'Passaste $' + somaC + '$ para o segundo membro a subtrair: $r^2 = ' + tex(k) + ' - ' + tex(s) + ' = ' + tex(k - s) + '$. Os quadrados subtraídos passam a somar: $r^2 = ' + tex(rr) + '$.' });
      erros.push({ codigo: 'nao_dividiu_coeficientes', texto: opEsfera(vezes(2, C), k + 4 * s), explicacao: 'Não dividiste os coeficientes por 2: tomaste o centro ' + opPonto(vezes(2, C)) + ' e $r^2 = ' + tex(k) + ' + ' + tex(4 * s) + ' = ' + tex(k + 4 * s) + '$. O centro tem coordenadas iguais a metade dos coeficientes, com o sinal trocado: $C' + texPonto(C) + '$.' });
    }
    ex.verificacao = verif;
    return fecharTexto(rng, ex, opEsfera(C, rr), erros, opEsfera(C, QQ / 4));
  }
  // f(X) = primeiro membro − segundo membro da equação dada.
  function fEsfera(d) {
    if (d.contexto === 'reduzida') return (X) => d2(X, d.C) - d.r2;
    return (X) => soma2(X) + d.lin.reduce((s, c, i) => s + c * X[i], 0) - d.k;
  }

  registar({
    subtema: 'espaco', tipo: 'esfera-centro-raio', nome: 'Centro e raio de uma superfície esférica',
    formatos: ['escolha', 'numerica'], contextos: ['reduzida', 'desenvolvida'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => esfera(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro método: avaliar a equação em pontos. Cada coordenada do centro é (f(−eᵢ) − f(eᵢ))/4 e r² = −f(C).
      const f = fEsfera(p.dados);
      const e = (i, s) => [0, 1, 2].map((j) => (j === i ? s : 0));
      const C = [0, 1, 2].map((i) => limpo((f(e(i, -1)) - f(e(i, 1))) / 4));
      const rr = limpo(-f(C));
      if (!(rr > 0)) return false;
      if (p.formato === 'numerica') return Math.abs(p.resposta - r2(Math.sqrt(rr))) <= p.tolerancia + 1e-9;
      const o = lerEsfera(p.opcoes[p.correta]);
      return !!o && iguais(o.C, C) && proximo(o.r, Math.sqrt(rr));
    },
    limites: (p) => dentro(p.dados.C, 4) && p.dados.r2 >= 3 && p.dados.r2 <= 29,
  });

  // ================================================================ plano paralelo a um plano coordenado
  const PLANOS = ['yOz', 'xOz', 'xOy']; // PLANOS[i]: o plano coordenado perpendicular ao eixo de VAR[i]
  const EIXOS = ['Ox', 'Oy', 'Oz'];
  function planoParalelo(rng, contexto) {
    const P = [escolher(rng, NAO_NULOS(6)), escolher(rng, NAO_NULOS(6)), escolher(rng, NAO_NULOS(6))];
    if (new Set(P.map(Math.abs)).size < 3) return null;
    const i = inteiro(rng, 0, 2);
    const [j, k] = [0, 1, 2].filter((x) => x !== i);
    const eq = (a, v) => VAR[a] + ' = ' + tex(v);
    const certa = '$' + eq(i, P[i]) + '$';
    const reta = '$' + eq(j, P[j]) + ' \\wedge ' + eq(k, P[k]) + '$';
    const letra = escolher(rng, [j, k]);
    let enunciado, porque, erros;
    if (contexto === 'paralelo') {
      enunciado = 'Qual é uma equação do plano que passa pelo ponto ' + nomeado('P', P) + ' e é paralelo ao plano coordenado $' + PLANOS[i] + '$?';
      porque = 'O plano $' + PLANOS[i] + '$ tem equação $' + VAR[i] + ' = 0$: os seus pontos têm ' + EIXO[i] + ' $0$. Num plano paralelo a $' + PLANOS[i] + '$ todos os pontos têm a mesma ' + EIXO[i] + ', a de $P$.';
      erros = [
        { codigo: 'letra_do_plano', texto: '$' + eq(letra, P[letra]) + '$', explicacao: '$' + eq(letra, P[letra]) + '$ é o plano paralelo a $' + PLANOS[letra] + '$. Nos pontos de $' + PLANOS[i] + '$ variam $' + VAR[j] + '$ e $' + VAR[k] + '$; o que se mantém é a ' + EIXO[i] + ', por isso a equação é $' + eq(i, P[i]) + '$.' },
        { codigo: 'plano_coordenado', texto: '$' + eq(i, 0) + '$', explicacao: '$' + eq(i, 0) + '$ é o próprio plano $' + PLANOS[i] + '$, que não passa por $P$ (a ' + EIXO[i] + ' de $P$ é $' + tex(P[i]) + '$). O plano paralelo que passa por $P$ é $' + eq(i, P[i]) + '$.' },
        { codigo: 'reta_duas_condicoes', texto: reta, explicacao: 'Com duas condições, ' + reta + ' define a reta paralela ao eixo $' + EIXOS[i] + '$ que passa por $P$, não um plano. O plano paralelo a $' + PLANOS[i] + '$ define-se só com $' + eq(i, P[i]) + '$.' },
        { codigo: 'coordenada_errada', texto: '$' + eq(i, P[letra]) + '$', explicacao: 'Usaste a ' + EIXO[letra] + ' de $P$, $' + tex(P[letra]) + '$. No plano paralelo a $' + PLANOS[i] + '$ mantém-se a ' + EIXO[i] + ' de $P$, $' + tex(P[i]) + '$.' },
      ];
    } else {
      enunciado = 'Qual é uma equação do plano que passa pelo ponto ' + nomeado('P', P) + ' e é perpendicular ao eixo $' + EIXOS[i] + '$?';
      porque = 'Um plano perpendicular ao eixo $' + EIXOS[i] + '$ é paralelo ao plano $' + PLANOS[i] + '$: todos os seus pontos têm a mesma ' + EIXO[i] + ', a de $P$.';
      erros = [
        { codigo: 'reta_paralela_ao_eixo', texto: reta, explicacao: reta + ' é a reta que passa por $P$ e é paralela ao eixo $' + EIXOS[i] + '$ (só a ' + EIXO[i] + ' varia). O plano perpendicular ao eixo $' + EIXOS[i] + '$ tem a ' + EIXO[i] + ' fixa: $' + eq(i, P[i]) + '$.' },
        { codigo: 'outro_eixo', texto: '$' + eq(letra, P[letra]) + '$', explicacao: '$' + eq(letra, P[letra]) + '$ é o plano que passa por $P$ e é perpendicular ao eixo $' + EIXOS[letra] + '$. Perpendicular ao eixo $' + EIXOS[i] + '$ é $' + eq(i, P[i]) + '$.' },
        { codigo: 'plano_coordenado', texto: '$' + eq(i, 0) + '$', explicacao: '$' + eq(i, 0) + '$ é o plano coordenado $' + PLANOS[i] + '$, perpendicular ao eixo $' + EIXOS[i] + '$ mas sem passar por $P$. O plano pedido é $' + eq(i, P[i]) + '$.' },
      ];
    }
    // Verificação: P e dois pontos obtidos de P por deslocamentos paralelos ao plano (só mudam as outras duas coordenadas).
    const u = [0, 0, 0]; u[j] = 2; u[k] = -1;
    const w = [0, 0, 0]; w[j] = -1; w[k] = 3;
    const Q = mais(P, u), R = mais(P, w);
    const ex = {
      enunciado,
      resolucao: [{ passo: 'Ver que coordenada se mantém', porque, calculo: eq(i, P[i]) }],
      dados: { contexto, P, i, pontos: { P, Q, R } },
      verificacao: {
        passo: 'Confirmar que $P$ e os pontos $Q$ e $R$, obtidos de $P$ mudando só $' + VAR[j] + '$ e $' + VAR[k] + '$ (deslocamentos paralelos a $' + PLANOS[i] + '$), verificam a equação, e que o plano não é $' + PLANOS[i] + '$ ($' + tex(P[i]) + ' \\neq 0$)',
        calculo: 'P' + texPonto(P) + ',\\ Q' + texPonto(Q) + ',\\ R' + texPonto(R) + '\\colon\\ ' + VAR[i] + ' = ' + tex(P[i]),
      },
      esquema: noEspaco(P) ? { id: 'espaco3d', opcoes: { P: P.slice(), mostrar: ['ponto', 'planos'] } } : undefined,
    };
    return fecharTexto(rng, ex, certa, erros, '$' + eq(i, Q[i]) + '$');
  }

  registar({
    subtema: 'espaco', tipo: 'plano-paralelo', nome: 'Plano paralelo a um plano coordenado',
    formatos: ['escolha'], contextos: ['paralelo', 'perpendicular'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => planoParalelo(rng, contexto));
    },
    verificarIndependente(p) {
      // A equação escolhida é verificada por P e pelos pontos P + eⱼ, P + eₖ, e não por P + eᵢ.
      const e = lerEquacaoSimples(p.opcoes[p.correta]);
      if (!e) return false;
      const a = VAR.indexOf(e.v);
      const P = p.dados.P;
      const ok = (X) => proximo(X[a], e.k);
      const desl = (b) => P.map((x, c) => (c === b ? x + 1 : x));
      const [j, k] = [0, 1, 2].filter((x) => x !== p.dados.i);
      return ok(P) && ok(desl(j)) && ok(desl(k)) && !ok(desl(p.dados.i));
    },
    limites: (p) => dentro(p.dados.P, 6),
  });

  // ================================================================ vetores: coordenadas de AB / ponto + vetor
  const PARES_VETOR = [['A', 'B'], ['P', 'Q'], ['C', 'D'], ['E', 'F']];
  function coordenadasAB(rng, formato, contexto) {
    const dim = contexto === 'espaco' ? 3 : 2;
    const [nA, nB] = escolher(rng, PARES_VETOR);
    const A = Array.from({ length: dim }, () => inteiro(rng, -6, 6));
    const eixo = formato === 'numerica' ? inteiro(rng, 0, dim - 1) : null;
    const C = calc();
    if (contexto === 'ponto-mais-vetor') {
      const u = Array.from({ length: dim }, () => escolher(rng, NAO_NULOS(6)));
      const B = pt(C.pontoMaisVetor(A, u));
      if (!dentro(B, 9) || A.every((a) => a === 0)) return null;
      const enunciado = 'Considera o ponto ' + nomeado(nA, A) + ' e o vetor $' + vet(nA + nB) + ' = ' + texPonto(u) + '$. ' + pedidoPonto(formato, eixo, 'do ponto $' + nB + '$');
      const resolucao = [{ passo: 'Somar ao ponto o vetor', porque: 'Como $' + vet(nA + nB) + ' = ' + nB + ' - ' + nA + '$, tem-se $' + nB + ' = ' + nA + ' + ' + vet(nA + nB) + '$: parte-se de $' + nA + '$ e desloca-se segundo o vetor.', calculo: nB + ' = ' + texPonto(A) + ' + ' + texPonto(u) + ' = ' + texPonto(B) }];
      const erros = [
        { codigo: 'subtraiu_o_vetor', P: menos(A, u), explicacao: 'Subtraíste o vetor ao ponto, $' + texPonto(A) + ' - ' + texPonto(u) + ' = ' + texPonto(menos(A, u)) + '$. De $' + vet(nA + nB) + ' = ' + nB + ' - ' + nA + '$ vem $' + nB + ' = ' + nA + ' + ' + vet(nA + nB) + '$.' },
        { codigo: 'vetor_menos_ponto', P: menos(u, A), explicacao: 'De $' + vet(nA + nB) + ' = ' + nB + ' - ' + nA + '$ tiraste $' + nB + ' = ' + vet(nA + nB) + ' - ' + nA + ' = ' + texPonto(menos(u, A)) + '$; ao passar $' + nA + '$ para o outro membro, troca-se o sinal: $' + nB + ' = ' + nA + ' + ' + vet(nA + nB) + '$.' },
        { codigo: 'vetor_como_ponto', P: u.slice(), explicacao: 'Tomaste as coordenadas do vetor, ' + opPonto(u) + ', como as do ponto $' + nB + '$; isso só acontece quando $' + nA + '$ é a origem. Aqui $' + nB + ' = ' + nA + ' + ' + vet(nA + nB) + ' = ' + texPonto(B) + '$.' },
      ];
      const pontos = {}; pontos[nA] = A; pontos[nB] = B;
      const ex = { enunciado, resolucao, dados: { contexto, A, u, eixo, pontos }, esquema: dim === 2 && noVetores(A) && noVetores(u) && noVetores(B) ? { id: 'vetores', opcoes: { u: A.slice(), v: u.slice(), operacao: 'soma' } } : undefined };
      return fecharPonto(rng, formato, ex, {
        certo: B, eixo, erros,
        verificacao: { passo: 'Confirmar que $' + nB + ' - ' + nA + '$ dá o vetor $' + vet(nA + nB) + '$', calculo: nB + ' - ' + nA + ' = ' + texPonto(B) + ' - ' + texPonto(A) + ' = ' + texPonto(menos(B, A)) + ' = ' + vet(nA + nB), P: mais(A, menos(B, A)) },
      });
    }
    const u = Array.from({ length: dim }, () => escolher(rng, NAO_NULOS(7)));
    const B = mais(A, u);
    if (!dentro(B, 9) || !A.some((a) => a < 0)) return null;
    const AB = pt(C.vetor(A, B));
    const enunciado = 'Considera os pontos ' + nomeado(nA, A) + ' e ' + nomeado(nB, B) + '. ' + pedidoVetor(formato, eixo, 'do vetor $' + vet(nA + nB) + '$');
    const resolucao = [{ passo: 'Subtrair as coordenadas', porque: 'As coordenadas de $' + vet(nA + nB) + '$ são as de $' + nB + '$ menos as de $' + nA + '$ (extremidade menos origem).', calculo: vet(nA + nB) + ' = ' + nB + ' - ' + nA + ' = ' + cadeia('(' + B.map((b, i) => difTex(b, A[i])).join(SEP) + ')', texPonto(AB)) }];
    const neg = A.map((a, i) => (a < 0 ? i : -1)).filter((i) => i >= 0);
    const deslize = pt(AB.map((v, i) => (A[i] < 0 ? B[i] + A[i] : v)));
    const erros = [
      { codigo: 'ordem_trocada', P: menos(A, B), explicacao: 'Calculaste $' + nA + ' - ' + nB + ' = ' + texPonto(menos(A, B)) + '$, que é o vetor $' + vet(nB + nA) + '$, de sentido contrário. $' + vet(nA + nB) + ' = ' + nB + ' - ' + nA + '$.' },
      { codigo: 'somou_coordenadas', P: mais(A, B), explicacao: 'Somaste as coordenadas dos dois pontos, ' + opPonto(mais(A, B)) + '. As coordenadas de um vetor obtêm-se subtraindo: $' + vet(nA + nB) + ' = ' + nB + ' - ' + nA + '$.' },
      { codigo: 'sinal_negativo', P: deslize, explicacao: 'Enganaste-te ao subtrair um número negativo: ' + neg.map((i) => 'em $' + difTex(B[i], A[i]) + '$ fizeste $' + tex(B[i]) + ' - ' + tex(-A[i]) + ' = ' + tex(B[i] + A[i]) + '$').join(' e ') + ', e obtiveste ' + opPonto(deslize) + '. Subtrair um negativo é somar: ' + neg.map((i) => '$' + difTex(B[i], A[i]) + ' = ' + tex(AB[i]) + '$').join(' e ') + '.' },
    ];
    const pontos = {}; pontos[nA] = A; pontos[nB] = B;
    const ex = { enunciado, resolucao, dados: { contexto, A, B, eixo, pontos } };
    return fecharPonto(rng, formato, ex, {
      certo: AB, eixo, erros,
      verificacao: { passo: 'Confirmar que $' + nA + ' + ' + vet(nA + nB) + ' = ' + nB + '$', calculo: nA + ' + ' + vet(nA + nB) + ' = ' + texPonto(A) + ' + ' + texPonto(AB) + ' = ' + texPonto(mais(A, AB)), P: AB },
    });
  }

  registar({
    subtema: 'vetores', tipo: 'coordenadas-ab', nome: 'Coordenadas de um vetor e ponto mais vetor',
    formatos: ['escolha', 'numerica'], contextos: ['plano', 'espaco', 'ponto-mais-vetor'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => coordenadasAB(rng, formato, contexto));
    },
    verificarIndependente(p) {
      const d = p.dados;
      // Ponto + vetor: B − A = u; vetor AB: A + AB = B (resolve-se para a resposta coordenada a coordenada).
      if (d.contexto === 'ponto-mais-vetor') {
        if (p.formato === 'numerica') return proximo(p.resposta - d.A[d.eixo], d.u[d.eixo]);
        const X = lerPonto(p.opcoes[p.correta]);
        return !!X && iguais(menos(X, d.A), d.u);
      }
      if (p.formato === 'numerica') return proximo(d.A[d.eixo] + p.resposta, d.B[d.eixo]);
      const X = lerPonto(p.opcoes[p.correta]);
      return !!X && iguais(mais(d.A, X), d.B);
    },
    limites: (p) => dentro(p.dados.A, 6) && Object.values(p.dados.pontos).every((P) => dentro(P, 9)),
  });

  // ================================================================ vetores: norma
  const nv = (u) => '\\|' + u + '\\|';
  function norma(rng, formato, contexto) {
    const numerica = formato === 'numerica';
    const fim = (k) => '$' + raizCadeia(k, numerica) + '$';
    const escolha = formato === 'escolha';
    if (contexto === 'vetor') {
      const dim = rng() < 0.6 ? 2 : 3;
      const u = Array.from({ length: dim }, () => inteiro(rng, -7, 7));
      if (u.filter((v) => v !== 0).length < 2 || !u.some((v) => v < 0)) return null;
      const n = soma2(u);
      if (!proximo(Math.pow(calc().norma(u), 2), n)) return null;
      const nz = u.filter((v) => v !== 0);
      const sAbs = nz.reduce((a, b) => a + Math.abs(b), 0);
      const sSin = nz.reduce((a, b) => a + b, 0);
      const comSinal = nz.map((v) => (v < 0 ? -v * v : v * v));
      const kNeg = comSinal.reduce((a, b) => a + b, 0);
      const erros = [
        { codigo: 'somou_coordenadas', n: sAbs * sAbs, explicacao: 'Somaste os valores absolutos das coordenadas, $' + nz.map((v) => tex(Math.abs(v))).join(' + ') + ' = ' + tex(sAbs) + '$. A norma é a raiz quadrada da soma dos quadrados (teorema de Pitágoras), que é menor do que essa soma.' },
        sSin !== 0 ? { codigo: 'quadrado_da_soma', n: sSin * sSin, explicacao: 'Elevaste ao quadrado a soma das coordenadas, $\\sqrt{(' + somaNum(nz) + ')^2} = \\sqrt{' + par(sSin) + '^2} = ' + tex(Math.abs(sSin)) + '$. Somam-se os quadrados de cada coordenada, $' + somaQuad(u) + '$.' } : null,
        kNeg > 0 ? { codigo: 'quadrado_negativo', n: kNeg, explicacao: 'Calculaste ' + u.filter((v) => v < 0).map((v) => '$' + par(v) + '^2$ como $' + tex(-v * v) + '$').join(' e ') + ' e obtiveste $\\sqrt{' + somaNum(comSinal) + '} = ' + raizCadeia(kNeg, numerica) + '$. O quadrado de um número negativo é positivo.' } : null,
        !escolha || n <= 50 ? { codigo: 'sem_raiz', n: n * n, explicacao: 'Esqueceste a raiz quadrada: $' + somaQuad(u) + ' = ' + tex(n) + '$ é o quadrado da norma. $' + nv('\\vec{u}') + ' = ' + raizCadeia(n, numerica) + '$.' } : null,
      ];
      const enunciado = 'Considera o vetor $\\vec{u} = ' + texPonto(u) + '$. Qual é a norma de $\\vec{u}$?';
      const resolucao = [{ passo: 'Aplicar a fórmula da norma', porque: 'A norma é a raiz quadrada da soma dos quadrados das coordenadas.', calculo: nv('\\vec{u}') + ' = ' + cadeia('\\sqrt{' + somaQuad(u) + '}', '\\sqrt{' + u.map((v) => tex(v * v)).join(' + ') + '}', raizCadeia(n, numerica)) }];
      const aprox = numerica && !quadrado(n);
      const verificacao = {
        passo: 'Confirmar elevando a norma ao quadrado: tem de dar a soma dos quadrados das coordenadas',
        calculo: aprox ? tex(r2(Math.sqrt(n)), 2) + '^2 \\approx ' + tex(Math.pow(r2(Math.sqrt(n)), 2), 2) + ' \\approx ' + tex(n) + ' = ' + somaQuad(u) : (quadrado(n) ? raizTex(n) : '(' + raizTex(n) + ')') + '^2 = ' + tex(n) + ' = ' + somaQuad(u),
        n,
      };
      const ex = { enunciado, resolucao, dados: { contexto, u, pontos: {} }, esquema: undefined };
      return fecharMedida(rng, formato, ex, { n, erros: baralhar(rng, erros.filter(Boolean)), verificacao });
    }
    // combinação: ‖k·u + l·v‖
    const u = [escolher(rng, NAO_NULOS(4)), inteiro(rng, -4, 4)];
    const v = [inteiro(rng, -4, 4), escolher(rng, NAO_NULOS(4))];
    const k = escolher(rng, [2, 3, -2]);
    const l = escolher(rng, [1, -1]);
    const C = calc();
    const ku = pt(C.escalar(k, u));
    const w = pt(l === 1 ? C.somar(ku, v) : C.subtrair(ku, v));
    const n = soma2(w);
    if (n === 0 || w.some((x) => x === 0)) return null;
    const expr = cx(k, '\\vec{u}') + (l === 1 ? ' + ' : ' - ') + '\\vec{v}';
    const nu = soma2(u), nvv = soma2(v);
    const sn = somaRaizes([[Math.abs(k), nu], [l, nvv]]);
    const semK = pt(l === 1 ? C.somar(u, v) : C.subtrair(u, v));
    const kSo = [k * u[0], u[1]];
    const wSo = pt(l === 1 ? C.somar(kSo, v) : C.subtrair(kSo, v));
    const erros = [
      sn.valor > 0 ? { codigo: l === 1 ? 'soma_das_normas' : 'diferenca_das_normas', valor: sn.valor, texto: sn.texto, explicacao: 'Calculaste $' + nv(cx(k, '\\vec{u}')) + (l === 1 ? ' + ' : ' - ') + nv('\\vec{v}') + ' = ' + cadeia(raizTex(k * k * nu) + (l === 1 ? ' + ' : ' - ') + raizTex(nvv), sn.texto) + (numerica ? ' \\approx ' + tex(r2(sn.valor), 2) : '') + '$. A norma ' + (l === 1 ? 'da soma não é a soma' : 'da diferença não é a diferença') + ' das normas: primeiro calcula-se o vetor $' + expr + '$ e só depois a norma.' } : null,
      soma2(semK) > 0 ? { codigo: 'esqueceu_o_fator', n: soma2(semK), explicacao: 'Não multiplicaste $\\vec{u}$ por $' + tex(k) + '$: calculaste $\\vec{u}' + (l === 1 ? ' + ' : ' - ') + '\\vec{v} = ' + texPonto(semK) + '$, de norma ' + fim(soma2(semK)) + '. Primeiro $' + cx(k, '\\vec{u}') + ' = ' + texPonto(ku) + '$.' } : null,
      u[1] !== 0 && soma2(wSo) > 0 ? { codigo: 'fator_so_na_primeira', n: soma2(wSo), explicacao: 'Multiplicaste por $' + tex(k) + '$ só a primeira coordenada de $\\vec{u}$, ficando com ' + opPonto(kSo) + ' e $' + texPonto(wSo) + '$, de norma ' + fim(soma2(wSo)) + '. Multiplicam-se as duas coordenadas: $' + cx(k, '\\vec{u}') + ' = ' + texPonto(ku) + '$.' } : null,
      !escolha || n <= 50 ? { codigo: 'sem_raiz', n: n * n, explicacao: 'Esqueceste a raiz quadrada: $' + somaQuad(w) + ' = ' + tex(n) + '$ é o quadrado da norma. $' + nv(expr) + ' = ' + raizCadeia(n, numerica) + '$.' } : null,
    ];
    const enunciado = 'Considera os vetores $\\vec{u} = ' + texPonto(u) + '$ e $\\vec{v} = ' + texPonto(v) + '$. Qual é a norma de $' + expr + '$?';
    const resolucao = [
      { passo: 'Multiplicar $\\vec{u}$ por $' + tex(k) + '$', porque: 'Multiplica-se cada coordenada de $\\vec{u}$ por $' + tex(k) + '$.', calculo: cx(k, '\\vec{u}') + ' = ' + cx(k, texPonto(u)) + ' = ' + texPonto(ku) },
      { passo: l === 1 ? 'Somar $\\vec{v}$' : 'Subtrair $\\vec{v}$', porque: (l === 1 ? 'Somam-se' : 'Subtraem-se') + ' as coordenadas correspondentes.', calculo: expr + ' = ' + texPonto(ku) + (l === 1 ? ' + ' : ' - ') + texPonto(v) + ' = ' + texPonto(w) },
      { passo: 'Calcular a norma', porque: 'A norma é a raiz quadrada da soma dos quadrados das coordenadas.', calculo: nv(expr) + ' = ' + cadeia('\\sqrt{' + somaQuad(w) + '}', '\\sqrt{' + w.map((x) => tex(x * x)).join(' + ') + '}', raizCadeia(n, numerica)) },
    ];
    const wInd = u.map((x, i) => k * x + l * v[i]);
    const aprox = numerica && !quadrado(n);
    const verificacao = {
      passo: 'Confirmar calculando cada coordenada de $' + expr + '$ numa só conta e elevando a norma ao quadrado',
      calculo: expr + ' = (' + u.map((x, i) => combTex([[k, x], [l, v[i]]])).join(SEP) + ') = ' + texPonto(wInd) + ',\\quad ' +
        (aprox ? tex(r2(Math.sqrt(n)), 2) + '^2 \\approx ' + tex(Math.pow(r2(Math.sqrt(n)), 2), 2) + ' \\approx ' + tex(n) : (quadrado(n) ? raizTex(n) : '(' + raizTex(n) + ')') + '^2 = ' + tex(n)) + ' = ' + somaQuad(wInd),
      n: soma2(wInd),
    };
    const ex = {
      enunciado, resolucao, dados: { contexto, u, v, k, l, pontos: {} },
      esquema: noVetores(u) && noVetores(v) ? { id: 'vetores', opcoes: { u: u.slice(), v: v.slice(), k, operacao: l === 1 ? 'soma' : 'diferenca' } } : undefined,
    };
    return fecharMedida(rng, formato, ex, { n, erros: baralhar(rng, erros.filter(Boolean)), verificacao });
  }

  registar({
    subtema: 'vetores', tipo: 'norma', nome: 'Norma de um vetor',
    formatos: ['numerica', 'escolha'], contextos: ['vetor', 'combinacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => norma(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro caminho: Math.hypot das coordenadas calculadas de novo, comparada com o quadrado exato.
      const d = p.dados;
      const w = d.contexto === 'vetor' ? d.u : d.u.map((x, i) => d.k * x + d.l * d.v[i]);
      const n = Math.round(Math.pow(Math.hypot(...w), 2));
      return confereMedida(p, n);
    },
    limites: (p) => dentro(p.dados.u, 7) && (!p.dados.v || dentro(p.dados.v, 4)),
  });

  // ================================================================ vetores: colinearidade (determinar k)
  const RAZOES = [-3, -2, 2, 3, 0.5, -0.5, 1.5, -1.5];
  function colinearK(rng, formato, contexto) {
    const t = escolher(rng, RAZOES);
    const i = inteiro(rng, 0, 1); // coordenada desconhecida
    const j = 1 - i;
    const tTex = texQ(t);
    let enunciado, resolucao, verificacao, erros, k, dados;
    if (contexto === 'vetores') {
      const u = [escolher(rng, NAO_NULOS(6).filter((x) => Math.abs(x) > 1)), escolher(rng, NAO_NULOS(6).filter((x) => Math.abs(x) > 1))];
      const vj = limpo(t * u[j]);
      k = limpo(t * u[i]);
      if (!ehInt(vj) || Math.abs(vj) === 1 || Math.abs(u[0]) === Math.abs(u[1])) return null;
      const vTex = (x) => (i === 0 ? '(' + x + SEP + tex(vj) + ')' : '(' + tex(vj) + SEP + x + ')');
      enunciado = 'Considera os vetores $\\vec{u} = ' + texPonto(u) + '$ e $\\vec{v} = ' + vTex('k') + '$. Qual é o valor de $k$ para o qual $\\vec{u}$ e $\\vec{v}$ são colineares?';
      resolucao = [
        { passo: 'Escrever $\\vec{v} = t\\vec{u}$', porque: 'Dois vetores não nulos são colineares se e só se um é múltiplo do outro.', calculo: vTex('k') + ' = t' + texPonto(u) },
        { passo: 'Calcular $t$ pela coordenada conhecida', porque: 'Na ' + ORDINAL[j] + ' coordenada não há incógnitas.', calculo: tex(vj) + ' = ' + (u[j] === 1 ? 't' : u[j] === -1 ? '-t' : 't \\times ' + par(u[j])) + ' \\Leftrightarrow t = ' + divTex(vj, u[j]) },
        { passo: 'Calcular $k$', porque: '$k$ é a ' + ORDINAL[i] + ' coordenada de $t\\vec{u}$.', calculo: 'k = ' + cadeia(tTex + ' \\times ' + par(u[i]), texQ(k)) },
      ];
      erros = [
        { codigo: 'razao_invertida', valor: limpo(u[i] * u[j] / vj), explicacao: 'Escreveste a proporção com uma das razões invertida, $\\dfrac{k}{' + tex(u[i]) + '} = \\dfrac{' + tex(u[j]) + '}{' + tex(vj) + '}$, e obtiveste $k = ' + texQ(limpo(u[i] * u[j] / vj)) + '$. Coordenadas proporcionais: $\\dfrac{k}{' + tex(u[i]) + '} = \\dfrac{' + tex(vj) + '}{' + tex(u[j]) + '}$.' },
        { codigo: 'cruzou_mal', valor: limpo(u[j] * vj / u[i]), explicacao: 'Multiplicaste em cruz os termos errados, $k \\times ' + par(u[i]) + ' = ' + par(u[j]) + ' \\times ' + par(vj) + '$, e obtiveste $k = ' + texQ(limpo(u[j] * vj / u[i])) + '$. De $\\dfrac{k}{' + tex(u[i]) + '} = \\dfrac{' + tex(vj) + '}{' + tex(u[j]) + '}$ vem $k \\times ' + par(u[j]) + ' = ' + par(u[i]) + ' \\times ' + par(vj) + '$.' },
        { codigo: 'somou_em_vez_de_multiplicar', valor: limpo(u[i] + vj - u[j]), explicacao: 'Somaste a $' + tex(u[i]) + '$ a diferença $' + difTex(vj, u[j]) + ' = ' + tex(vj - u[j]) + '$, obtendo $' + texQ(limpo(u[i] + vj - u[j])) + '$, como se colineares quisesse dizer «somar o mesmo». Colineares quer dizer multiplicar pelo mesmo número: $\\vec{v} = ' + cx(t, '\\vec{u}') + '$.' },
        t < 0 ? { codigo: 'sinal_da_razao', valor: limpo(-t * u[i]), explicacao: 'Em $t = ' + divTex(vj, u[j]) + '$ perdeste o sinal e usaste $t = ' + texQ(-t) + '$, obtendo $k = ' + texQ(limpo(-t * u[i])) + '$. Com $t = ' + tTex + '$, $k = ' + texQ(k) + '$.' } : null,
      ];
      const vFinal = i === 0 ? [k, vj] : [vj, k];
      verificacao = {
        passo: 'Confirmar que as coordenadas são proporcionais: os produtos cruzados $u_1 v_2$ e $u_2 v_1$ são iguais',
        calculo: 'u_1 v_2 = ' + texQ(u[0]) + ' \\times ' + parQ(vFinal[1]) + ' = ' + texQ(limpo(u[0] * vFinal[1])) + ',\\quad u_2 v_1 = ' + texQ(u[1]) + ' \\times ' + parQ(vFinal[0]) + ' = ' + texQ(limpo(u[1] * vFinal[0])),
        valor: limpo(u[i] * vj / u[j]),
      };
      dados = { contexto, u, vj, i, pontos: {} };
    } else {
      const A = [inteiro(rng, -5, 5), inteiro(rng, -5, 5)];
      const d = [escolher(rng, NAO_NULOS(5).filter((x) => Math.abs(x) > 1)), escolher(rng, NAO_NULOS(5).filter((x) => Math.abs(x) > 1))];
      const B = mais(A, d);
      const Cc = mais(A, vezes(t, d));
      k = Cc[i];
      if (!ehInt(Cc[j]) || !dentro(B, 9) || !dentro(Cc, 12) || Math.abs(d[0]) === Math.abs(d[1]) || A[i] === 0) return null;
      const cj = Cc[j];
      const ac = cj - A[j];
      if (Math.abs(ac) === 1) return null;
      const cTex = (x) => (i === 0 ? '(' + x + SEP + tex(cj) + ')' : '(' + tex(cj) + SEP + x + ')');
      const kMenos = 'k' + maisTex(-A[i]);
      enunciado = 'Considera os pontos ' + nomeado('A', A) + ', ' + nomeado('B', B) + ' e $C' + cTex('k') + '$. Qual é o valor de $k$ para o qual $A$, $B$ e $C$ são colineares (estão na mesma reta)?';
      const acTex = i === 0 ? '(' + kMenos + SEP + tex(ac) + ')' : '(' + tex(ac) + SEP + kMenos + ')';
      resolucao = [
        { passo: 'Calcular $' + vet('AB') + '$ e $' + vet('AC') + '$', porque: 'Os três pontos são colineares se e só se $' + vet('AC') + '$ é colinear com $' + vet('AB') + '$.', calculo: vet('AB') + ' = ' + texPonto(d) + ',\\quad ' + vet('AC') + ' = ' + acTex },
        { passo: 'Calcular $t$ com $' + vet('AC') + ' = t\\,' + vet('AB') + '$', porque: 'Na ' + ORDINAL[j] + ' coordenada não há incógnitas.', calculo: tex(ac) + ' = ' + (d[j] === 1 ? 't' : d[j] === -1 ? '-t' : 't \\times ' + par(d[j])) + ' \\Leftrightarrow t = ' + divTex(ac, d[j]) },
        { passo: 'Calcular $k$', porque: 'A ' + ORDINAL[i] + ' coordenada de $' + vet('AC') + '$ é $t$ vezes a de $' + vet('AB') + '$.', calculo: kMenos + ' = ' + tTex + ' \\times ' + par(d[i]) + ' \\Leftrightarrow k = ' + cadeia(texQ(limpo(t * d[i])) + maisQ(A[i]), texQ(k)) },
      ];
      erros = [
        { codigo: 'esqueceu_somar_a', valor: limpo(t * d[i]), explicacao: 'Calculaste $' + tTex + ' \\times ' + par(d[i]) + ' = ' + texQ(limpo(t * d[i])) + '$, que é a ' + ORDINAL[i] + ' coordenada de $' + vet('AC') + '$, isto é, $' + kMenos + '$. Falta somar $' + tex(A[i]) + '$: $k = ' + texQ(k) + '$.' },
        Math.abs(B[j]) > 1 ? { codigo: 'pontos_como_vetores', valor: limpo(B[i] * cj / B[j]), explicacao: 'Usaste as coordenadas de $B$ e de $C$ como se fossem vetores, $\\dfrac{k}{' + tex(B[i]) + '} = \\dfrac{' + tex(cj) + '}{' + tex(B[j]) + '}$, e obtiveste $k = ' + texQ(limpo(B[i] * cj / B[j])) + '$. Os vetores a comparar são $' + vet('AB') + '$ e $' + vet('AC') + '$.' } : null,
        ac !== 0 ? { codigo: 'razao_invertida', valor: limpo(A[i] + d[i] * d[j] / ac), explicacao: 'Invertiste uma das razões, $\\dfrac{' + kMenos + '}{' + tex(d[i]) + '} = \\dfrac{' + tex(d[j]) + '}{' + tex(ac) + '}$, e obtiveste $k = ' + texQ(limpo(A[i] + d[i] * d[j] / ac)) + '$. A proporção certa é $\\dfrac{' + kMenos + '}{' + tex(d[i]) + '} = \\dfrac{' + tex(ac) + '}{' + tex(d[j]) + '}$.' } : null,
        t < 0 ? { codigo: 'sinal_da_razao', valor: limpo(A[i] - t * d[i]), explicacao: 'Em $t = ' + divTex(ac, d[j]) + '$ perdeste o sinal e usaste $t = ' + texQ(-t) + '$, obtendo $k = ' + texQ(limpo(A[i] - t * d[i])) + '$. Com $t = ' + tTex + '$, $k = ' + texQ(k) + '$.' } : null,
      ];
      const acF = menos(Cc, A);
      verificacao = {
        passo: 'Confirmar com $C' + (ehInt(k) ? texPonto(Cc) : '') + '$ que os produtos cruzados das coordenadas de $' + vet('AB') + '$ e $' + vet('AC') + '$ são iguais',
        calculo: vet('AC') + ' = ' + (ehInt(k) ? texPonto(acF) : '\\left(' + acF.map(texQ).join(SEP) + '\\right)') + ',\\quad ' + texQ(d[0]) + ' \\times ' + parQ(acF[1]) + ' = ' + texQ(limpo(d[0] * acF[1])) + ',\\quad ' + texQ(d[1]) + ' \\times ' + parQ(acF[0]) + ' = ' + texQ(limpo(d[1] * acF[0])),
        valor: limpo(A[i] + d[i] * ac / d[j]),
      };
      dados = { contexto, A, B, cj, i, pontos: { A, B } };
    }
    if (!simples(k) || Math.abs(k) > 30) return null;
    const ex = { enunciado, resolucao, dados };
    return fecharRacional(rng, formato, ex, { resposta: k, erros: erros.filter(Boolean), verificacao });
  }

  registar({
    subtema: 'vetores', tipo: 'colinear-k', nome: 'Vetores colineares: determinar uma coordenada',
    formatos: ['numerica', 'escolha'], contextos: ['vetores', 'pontos'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => colinearK(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro método: o «determinante» u₁v₂ − u₂v₁ = 0, resolvido em ordem a k.
      const d = p.dados;
      const resposta = p.formato === 'numerica' ? p.resposta : lerNumero(p.opcoes[p.correta]);
      if (!Number.isFinite(resposta)) return false;
      let u, w;
      if (d.contexto === 'vetores') {
        u = d.u;
        w = d.i === 0 ? [resposta, d.vj] : [d.vj, resposta];
      } else {
        u = menos(d.B, d.A);
        const Cc = d.i === 0 ? [resposta, d.cj] : [d.cj, resposta];
        w = menos(Cc, d.A);
      }
      return Math.abs(u[0] * w[1] - u[1] * w[0]) < 1e-9;
    },
    limites: (p) => (p.dados.u ? dentro(p.dados.u, 6) : dentro(p.dados.A, 5) && dentro(p.dados.B, 9)) && (p.formato !== 'numerica' || Math.abs(p.resposta) <= 30),
  });

  // ================================================================ reta vetorial: ponto para um dado λ
  const LAMBDAS = [-3, -2, -1, 2, 3, 0.5, -0.5, 1.5];
  const eqVetorial = (A, u) => tuplo(A.length) + ' = ' + texPonto(A) + ' + \\lambda' + texPonto(u) + ',\\ \\lambda \\in \\mathbb{R}';
  function pontoLambda(rng, formato, contexto) {
    const dim = contexto === 'espaco' ? 3 : 2;
    const A = Array.from({ length: dim }, () => inteiro(rng, -5, 5));
    const u = Array.from({ length: dim }, () => escolher(rng, NAO_NULOS(4)));
    const l = escolher(rng, LAMBDAS);
    const C = calc();
    const P = pt(C.retaVetorial(A, u, l));
    const lu = vezes(l, u);
    if (!dentro(P, 15) || A.every((a) => a === 0)) return null;
    const eixo = formato === 'numerica' ? inteiro(rng, 0, dim - 1) : null;
    const lTex = texQ(l);
    const enunciado = 'Considera a reta $r$ definida por $' + eqVetorial(A, u) + '$. ' + pedidoPonto(formato, eixo, 'do ponto $P$ de $r$ que corresponde a $\\lambda = ' + lTex + '$');
    const resolucao = [
      { passo: 'Substituir $\\lambda$ por $' + lTex + '$', porque: 'Cada valor de $\\lambda$ dá um ponto da reta: $P = A + \\lambda\\vec{u}$, com $A' + texPonto(A) + '$ e $\\vec{u} = ' + texPonto(u) + '$.', calculo: 'P = ' + texPonto(A) + maisLambdaVetor(l, u) + ' = ' + texPonto(A) + ' + ' + texPonto(lu) + ' = ' + texPonto(P) },
    ];
    const erros = [
      { codigo: 'lambda_no_ponto', P: mais(vezes(l, A), u), explicacao: 'Multiplicaste $\\lambda$ pelo ponto em vez de pelo vetor: $' + lambdaVetor(l, A) + ' + ' + texPonto(u) + ' = ' + texPonto(mais(vezes(l, A), u)) + '$. Na equação, $\\lambda$ multiplica o vetor diretor: $' + texPonto(A) + maisLambdaVetor(l, u) + '$.' },
      { codigo: 'esqueceu_o_ponto', P: lu, explicacao: 'Calculaste só $' + lambdaVetor(l, u) + ' = ' + texPonto(lu) + '$ e esqueceste somar o ponto $' + texPonto(A) + '$. $P = ' + texPonto(A) + ' + ' + texPonto(lu) + ' = ' + texPonto(P) + '$.' },
      l < 0 ? { codigo: 'sinal_de_lambda', P: mais(A, vezes(-l, u)), explicacao: 'Usaste $\\lambda = ' + texQ(-l) + '$ em vez de $' + lTex + '$, obtendo $' + texPonto(A) + maisLambdaVetor(-l, u) + ' = ' + texPonto(mais(A, vezes(-l, u))) + '$. Com $\\lambda = ' + lTex + '$ o ponto fica do outro lado de $A$: $' + texPonto(P) + '$.' } : null,
      { codigo: 'somou_lambda', P: mais(mais(A, u), A.map(() => l)), explicacao: 'Somaste $' + lTex + '$ a cada coordenada de $' + texPonto(A) + ' + ' + texPonto(u) + ' = ' + texPonto(mais(A, u)) + '$, obtendo ' + opPonto(mais(mais(A, u), A.map(() => l))) + '. $\\lambda$ multiplica o vetor: $' + lambdaVetor(l, u) + ' = ' + texPonto(lu) + '$.' },
    ];
    const ex = {
      enunciado, resolucao, dados: { contexto, A, u, l, eixo, pontos: { A, P } },
      esquema: dim === 3 && noEspaco(A) && noEspaco(u) ? { id: 'espaco3d', opcoes: { P: A.slice(), v: u.slice(), mostrar: ['reta'] } } : undefined,
    };
    const AP = menos(P, A);
    return fecharPonto(rng, formato, ex, {
      certo: P, eixo, erros,
      verificacao: {
        passo: 'Confirmar que $' + vet('AP') + '$ é $' + lTex + '$ vezes $\\vec{u}$',
        calculo: vet('AP') + ' = P - A = ' + texPonto(AP) + ' = ' + lambdaVetor(l, u),
        P: A.map((a, i) => a + l * u[i]),
      },
    });
  }

  registar({
    subtema: 'reta-vetorial', tipo: 'ponto-lambda', nome: 'Ponto da reta para um valor de λ',
    formatos: ['escolha', 'numerica'], contextos: ['plano', 'espaco'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => pontoLambda(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro caminho: (P − A)/u = λ em cada coordenada.
      const d = p.dados;
      if (p.formato === 'numerica') return proximo((p.resposta - d.A[d.eixo]) / d.u[d.eixo], d.l);
      const X = lerPonto(p.opcoes[p.correta]);
      return !!X && X.length === d.A.length && X.every((x, i) => proximo((x - d.A[i]) / d.u[i], d.l));
    },
    limites: (p) => dentro(p.dados.A, 5) && dentro(p.dados.u, 4) && dentro(p.dados.pontos.P, 15),
  });

  // ================================================================ reta vetorial: o ponto pertence? (vf) / valor de λ
  function pertenceReta(rng, formato, contexto) {
    const dim = contexto === 'espaco' ? 3 : 2;
    const A = Array.from({ length: dim }, () => inteiro(rng, -5, 5));
    const u = Array.from({ length: dim }, () => escolher(rng, NAO_NULOS(4)));
    const pares = u.every((x) => x % 2 === 0);
    const l0 = escolher(rng, pares ? [-3, -2, -1, 1, 2, 3, 0.5, -0.5, 1.5] : [-3, -2, -1, 1, 2, 3]);
    const Pv = mais(A, vezes(l0, u));
    if (!dentro(Pv, 15) || A.every((a) => a === 0)) return null;
    const C = calc();
    const lambdas = (P) => P.map((p, i) => limpo((p - A[i]) / u[i]));
    const linha = (P, i) => (A[i] === 0 ? cx(u[i], '\\lambda') : tex(A[i]) + maisCLambda(u[i])) + ' = ' + tex(P[i]) + ' \\Leftrightarrow \\lambda = ' + (Math.abs(u[i]) === 1 ? texQ(limpo((P[i] - A[i]) / u[i])) : divTex(limpo(P[i] - A[i]), u[i]));
    const sistema = (P) => '\\begin{array}{l} ' + P.map((_, i) => linha(P, i)).join(' \\\\ ') + ' \\end{array}';
    const enunciadoBase = 'Considera a reta $r$ definida por $' + eqVetorial(A, u) + '$.';
    const esq = dim === 3 && noEspaco(A) && noEspaco(u) ? { id: 'espaco3d', opcoes: { P: A.slice(), v: u.slice(), mostrar: ['reta'] } } : undefined;
    if (formato === 'vf') {
      const jf = dim - 1;
      const delta = escolher(rng, NAO_NULOS(2));
      const Pf = Pv.slice(); Pf[jf] = limpo(Pf[jf] + delta);
      if (C.colineares(menos(Pf, A), u)) return null; // a falsa é mesmo falsa
      const lf = lambdas(Pf);
      const frase = (P) => 'O ponto ' + nomeado('P', P) + ' pertence à reta $r$.';
      const erroF = {
        codigo: 'so_uma_coordenada',
        explicacao: 'Pela primeira coordenada obtém-se $\\lambda = ' + texQ(lf[0]) + '$, mas pela ' + ORDINAL[jf] + ' obtém-se $\\lambda = ' + texQ(lf[jf]) + '$. Não há um único $\\lambda$ que sirva para todas as coordenadas, logo $P$ não pertence a $r$: não basta verificar uma coordenada.',
      };
      const v = AJ.vfDe(rng, frase(Pv), frase(Pf), erroF);
      const P = v.correta ? Pv : Pf;
      const ls = lambdas(P);
      const unico = ls.every((x) => proximo(x, ls[0]));
      let verificacao;
      if (dim === 2) {
        const m = limpo(u[1] / u[0]);
        const b = limpo(A[1] - A[0] * u[1] / u[0]);
        const y = limpo(A[1] + (P[0] - A[0]) * u[1] / u[0]);
        verificacao = {
          passo: 'Confirmar com a equação reduzida de $r$: declive $m = \\dfrac{u_2}{u_1} = ' + divTex(u[1], u[0]) + '$ e $y = ' + polTex([[m, 'x'], [b, '']]) + '$ (passa por $A' + texPonto(A) + '$), substituindo a abcissa de $P$',
          calculo: cadeia(P[0] === 0 ? texQ(b) : vezesTex(m, m === 1 ? texQ(P[0]) : parQ(P[0])) + maisQ(b), texQ(y)) + (proximo(y, P[1]) ? ' = y_P' : ' \\neq ' + tex(P[1]) + ' = y_P'),
          valor: proximo(y, P[1]),
        };
      } else {
        const Q = A.map((a, i) => limpo(a + ls[0] * u[i]));
        verificacao = {
          passo: 'Confirmar substituindo $\\lambda = ' + texQ(ls[0]) + '$ (o valor dado pela primeira coordenada) na equação e comparando com $P$',
          calculo: texPonto(A) + maisLambdaVetor(ls[0], u) + ' = ' + texPonto(Q) + (iguais(Q, P) ? ' = P' : ' \\neq P'),
          valor: iguais(Q, P),
        };
      }
      return {
        enunciado: enunciadoBase + ' Afirmação: «' + v.enunciado + '»',
        correta: v.correta, errosTipicos: v.errosTipicos,
        resolucao: [
          { passo: 'Procurar $\\lambda$ com $P = A + \\lambda\\vec{u}$, coordenada a coordenada', porque: '$P$ pertence a $r$ se e só se existe um mesmo $\\lambda$ que verifica todas as coordenadas.', calculo: sistema(P), bloco: true },
          { passo: 'Concluir', porque: unico ? 'Todas as coordenadas dão $\\lambda = ' + texQ(ls[0]) + '$, logo $P$ pertence a $r$.' : 'As coordenadas dão valores diferentes de $\\lambda$, logo $P$ não pertence a $r$.' },
        ],
        verificacao, dados: { contexto, A, u, P, pontos: { A, P } }, esquema: esq,
      };
    }
    // numerica: o valor de λ
    const P = Pv;
    const i0 = u.findIndex((x) => Math.abs(x) !== 1);
    if (i0 < 0) return null;
    const enunciado = enunciadoBase + ' O ponto ' + nomeado('P', P) + ' pertence a $r$. Qual é o valor de $\\lambda$ que corresponde a $P$?';
    const resolucao = [
      { passo: 'Resolver $P = A + \\lambda\\vec{u}$ numa coordenada', porque: 'Como $P$ pertence a $r$, todas as coordenadas dão o mesmo $\\lambda$; basta uma para o calcular.', calculo: linha(P, i0) },
    ];
    const di = limpo(P[i0] - A[i0]);
    const erros = [
      { codigo: 'esqueceu_subtrair', valor: limpo(P[i0] / u[i0]), explicacao: 'Dividiste $' + tex(P[i0]) + '$ por $' + tex(u[i0]) + '$ sem subtrair primeiro a coordenada de $A$, e obtiveste $' + divTex(P[i0], u[i0]) + '$. De $' + (A[i0] === 0 ? cx(u[i0], '\\lambda') : tex(A[i0]) + maisCLambda(u[i0])) + ' = ' + tex(P[i0]) + '$ vem $\\lambda = ' + divTex(di, u[i0]) + '$.' },
      { codigo: 'subtraiu_ao_contrario', valor: limpo(-di / u[i0]), explicacao: 'Calculaste $\\dfrac{' + difTex(A[i0], P[i0]) + '}{' + tex(u[i0]) + '} = ' + texQ(limpo(-di / u[i0])) + '$, com a subtração ao contrário. É $\\lambda = \\dfrac{' + difTex(P[i0], A[i0]) + '}{' + tex(u[i0]) + '} = ' + texQ(l0) + '$.' },
      di !== 0 && Math.abs(di) !== Math.abs(u[i0]) ? { codigo: 'dividiu_ao_contrario', valor: limpo(u[i0] / di), explicacao: 'Dividiste $' + tex(u[i0]) + '$ por $' + tex(di) + '$, ao contrário, e obtiveste $' + divTex(u[i0], di) + '$. De $' + cx(u[i0], '\\lambda') + ' = ' + tex(di) + '$ vem $\\lambda = ' + divTex(di, u[i0]) + '$.' } : null,
    ];
    const j = i0 === dim - 1 ? 0 : dim - 1;
    const ex = { enunciado, resolucao, dados: { contexto, A, u, P, pontos: { A, P } }, esquema: esq };
    const Q = A.map((a, i) => limpo(a + l0 * u[i]));
    return fechar(rng, 'numerica', ex, {
      resposta: l0, tolerancia: 0,
      erros: erros.filter((e) => e && simples(e.valor)),
      verificacao: {
        passo: 'Confirmar substituindo $\\lambda = ' + texQ(l0) + '$ na equação: tem de dar $P$ (a ' + ORDINAL[j] + ' coordenada dá o mesmo $\\lambda$)',
        calculo: texPonto(A) + maisLambdaVetor(l0, u) + ' = ' + texPonto(Q) + ',\\quad ' + linha(P, j),
        valor: limpo((P[j] - A[j]) / u[j]),
      },
    });
  }

  registar({
    subtema: 'reta-vetorial', tipo: 'pertence-reta', nome: 'Um ponto pertence à reta? / valor de λ',
    formatos: ['vf', 'numerica'], contextos: ['plano', 'espaco'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => pertenceReta(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro método: colinearidade de AP com u pelos produtos cruzados; λ pela última coordenada.
      const d = p.dados;
      const w = menos(d.P, d.A);
      const col = calc().colineares(w, d.u);
      if (p.formato === 'vf') return col === p.correta;
      const j = d.A.length - 1;
      return col && proximo(p.resposta, w[j] / d.u[j]);
    },
    limites: (p) => dentro(p.dados.A, 5) && dentro(p.dados.u, 4) && dentro(p.dados.P, 17),
  });

  // ================================================================ reta vetorial: declive e ordenada na origem
  function decliveVetor(rng, formato, contexto) {
    const sem1 = (n) => NAO_NULOS(n).filter((x) => Math.abs(x) > 1);
    const A = [escolher(rng, sem1(5)), inteiro(rng, -5, 5)];
    const u = [escolher(rng, sem1(6)), escolher(rng, sem1(6))];
    if (Math.abs(u[0]) === Math.abs(u[1]) || Math.abs(u[0]) === 1) return null;
    const C = calc();
    const red = C.equacaoReduzida(A, u);
    const m = limpo(red.m);
    const b = limpo(red.b);
    if (!simples(m) || !simples(b)) return null;
    const eq = eqVetorial(A, u);
    const mTex = 'm = ' + cadeia('\\dfrac{' + tex(u[1]) + '}{' + tex(u[0]) + '}', texQ(m));
    if (contexto === 'declive') {
      const enunciado = 'Considera a reta $r$ definida por $' + eq + '$. Qual é o declive de $r$?';
      const resolucao = [{ passo: 'Usar as coordenadas do vetor diretor', porque: 'Com $\\vec{u} = (u_1' + SEP + 'u_2)$ e $u_1 \\neq 0$, o declive é $m = \\dfrac{u_2}{u_1}$ (variação de $y$ sobre variação de $x$).', calculo: mTex }];
      const erros = [
        { codigo: 'declive_invertido', valor: limpo(u[0] / u[1]), explicacao: 'Dividiste $u_1$ por $u_2$, $\\dfrac{' + tex(u[0]) + '}{' + tex(u[1]) + '} = ' + texQ(limpo(u[0] / u[1])) + '$. O declive é $\\dfrac{u_2}{u_1} = ' + divTex(u[1], u[0]) + '$.' },
        { codigo: 'so_a_segunda_coordenada', valor: u[1], explicacao: 'Tomaste a segunda coordenada, $' + tex(u[1]) + '$, como declive. Isso só vale com $u_1 = 1$, como em $(1' + SEP + 'm)$; aqui $u_1 = ' + tex(u[0]) + '$, por isso divide-se: $m = ' + divTex(u[1], u[0]) + '$.' },
        { codigo: 'usou_o_ponto', valor: limpo(A[1] / A[0]), explicacao: 'Dividiste as coordenadas do ponto $' + texPonto(A) + '$, $' + divTex(A[1], A[0]) + '$. O declive vem do vetor diretor, $m = \\dfrac{u_2}{u_1} = ' + texQ(m) + '$.' },
      ];
      const B = mais(A, vezes(2, u));
      const ex = { enunciado, resolucao, dados: { contexto, A, u, pontos: { A, B } } };
      return fecharRacional(rng, formato, ex, {
        resposta: m, erros,
        verificacao: {
          passo: 'Confirmar com dois pontos de $r$: $A' + texPonto(A) + '$ ($\\lambda = 0$) e $B' + texPonto(B) + '$ ($\\lambda = 2$)',
          calculo: 'm = \\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{' + difTex(B[1], A[1]) + '}{' + difTex(B[0], A[0]) + '} = ' + divTex(limpo(B[1] - A[1]), limpo(B[0] - A[0])),
          valor: limpo((B[1] - A[1]) / (B[0] - A[0])),
        },
      });
    }
    // ordenada na origem
    const enunciado = 'Considera a reta $r$ definida por $' + eq + '$. A equação reduzida de $r$ é $y = mx + b$. Qual é o valor de $b$?';
    const ma = limpo(m * A[0]);
    const resolucao = [
      { passo: 'Calcular o declive', porque: 'Com $\\vec{u} = (u_1' + SEP + 'u_2)$ e $u_1 \\neq 0$, $m = \\dfrac{u_2}{u_1}$.', calculo: mTex },
      { passo: 'Substituir o ponto $A' + texPonto(A) + '$ em $y = mx + b$', porque: '$A$ pertence a $r$, por isso as suas coordenadas verificam a equação.', calculo: tex(A[1]) + ' = ' + vezesTex(m, par(A[0])) + ' + b \\Leftrightarrow b = ' + cadeia(tex(A[1]) + ' - ' + parQ(ma), texQ(b)) },
    ];
    const mi = limpo(u[0] / u[1]);
    const erros = [
      { codigo: 'ordenada_do_ponto', valor: A[1], explicacao: 'Tomaste a ordenada de $A$, $' + tex(A[1]) + '$, como ordenada na origem. Isso só vale se $A$ estiver no eixo $Oy$; aqui $x_A = ' + tex(A[0]) + '$, por isso $b = ' + tex(A[1]) + ' - ' + parQ(ma) + ' = ' + texQ(b) + '$.' },
      { codigo: 'sinal_trocado', valor: limpo(A[1] + ma), explicacao: 'Passaste $' + vezesTex(m, par(A[0])) + '$ para o outro membro sem trocar o sinal: $' + tex(A[1]) + ' + ' + parQ(ma) + ' = ' + texQ(limpo(A[1] + ma)) + '$. O certo é $b = ' + tex(A[1]) + ' - ' + parQ(ma) + ' = ' + texQ(b) + '$.' },
      { codigo: 'declive_invertido', valor: limpo(A[1] - mi * A[0]), explicacao: 'Usaste o declive invertido, $\\dfrac{u_1}{u_2} = ' + texQ(mi) + '$, e obtiveste $b = ' + tex(A[1]) + ' - ' + parQ(limpo(mi * A[0])) + ' = ' + texQ(limpo(A[1] - mi * A[0])) + '$. O declive é $m = \\dfrac{u_2}{u_1} = ' + texQ(m) + '$.' },
    ];
    const lz = limpo(-A[0] / u[0]);
    const yz = limpo(A[1] - A[0] * u[1] / u[0]);
    const ex = { enunciado, resolucao, dados: { contexto, A, u, pontos: { A } } };
    return fecharRacional(rng, formato, ex, {
      resposta: b, erros,
      verificacao: {
        passo: 'Confirmar com o ponto de $r$ que está no eixo $Oy$ (abcissa $0$): a sua ordenada é $b$',
        calculo: tex(A[0]) + maisCLambda(u[0]) + ' = 0 \\Leftrightarrow \\lambda = ' + texQ(lz) + ',\\quad y = ' + cadeia((A[1] === 0 ? '' : tex(A[1]) + (lz < 0 ? ' - ' : ' + ')) + vezesTex(A[1] === 0 ? lz : Math.abs(lz), par(u[1])), texQ(yz)),
        valor: yz,
      },
    });
  }

  registar({
    subtema: 'reta-vetorial', tipo: 'declive-vetor', nome: 'Declive e ordenada na origem a partir do vetor diretor',
    formatos: ['numerica', 'escolha'], contextos: ['declive', 'ordenada-origem'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => decliveVetor(rng, formato, contexto));
    },
    verificarIndependente(p) {
      // Outro caminho: dois pontos da reta (λ = 0 e λ = 1) e a reta que passa por eles.
      const { A, u } = p.dados;
      const B = [A[0] + u[0], A[1] + u[1]];
      const m = (B[1] - A[1]) / (B[0] - A[0]);
      const v = p.dados.contexto === 'declive' ? m : B[1] - m * B[0];
      return confereRacional(p, limpo(v));
    },
    limites: (p) => dentro(p.dados.A, 5) && dentro(p.dados.u, 6) && (p.formato !== 'numerica' || Math.abs(p.resposta) <= 60),
  });
})();
