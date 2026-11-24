globalThis.Manual = globalThis.Manual || {};

// Geradores de Matemática A — Modelos Matemáticos para a Cidadania.
// Subtemas: maiorias, borda, hondt-stlague, salarios, juros (ids <subtema>-<tipo>).
// A resposta vem sempre de Manual.calc.cidadania; verificarIndependente e a verificação usam outro método
// (desigualdades, comparações dois a dois, método do divisor, parcela a abater, conta período a período…).
// Manual.calc só é lido dentro de gerar (no index.html os módulos de cálculo carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const calc = () => Manual.calc.cidadania;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const soma = (l) => l.reduce((s, v) => s + v, 0);
  const fmt = A.fmt;
  const tex = A.tex;
  const TOL_EUR = 0.005;
  const ARRED_EUR = 'às centésimas (ao cêntimo)';
  // Nomes sem acentos: aparecem dentro de \text{} nas fórmulas.
  const NOMES = ['Ana', 'Bruno', 'Carla', 'Duarte', 'Eva', 'Filipe', 'Gil', 'Helena', 'Joana', 'Marta', 'Nuno', 'Rita', 'Tiago', 'Vera'];
  const CENARIOS = [
    'Na eleição do delegado de turma',
    'Na eleição do presidente do clube de teatro',
    'Na eleição do representante dos alunos no conselho geral',
    'Na eleição do capitão da equipa de voleibol',
  ];

  // ---------------------------------------------------------------- utilitários
  const cent = (v) => Math.round(v * 100 + (v >= 0 ? 1e-7 : -1e-7)) / 100;
  // Valor a meio de dois cêntimos: o arredondamento seria ambíguo — o gerador re-sorteia.
  const meioCentimo = (v) => Math.abs((v * 100 - Math.floor(v * 100)) - 0.5) < 1e-6;
  function eur(v) {
    let s = fmt(cent(v), 2);
    if (!s.includes(',')) s += ',00';
    else if (/,\d$/.test(s)) s += '0';
    return s + ' €';
  }
  function texEur(v) {
    let s = tex(cent(v), 2);
    if (!s.includes('{,}')) s += '{,}00';
    else if (/\{,\}\d$/.test(s)) s += '0';
    return s;
  }
  const pct = (t) => fmt(t * 100, 2) + ' %';
  const texPct = (t) => tex(t * 100, 2) + '\\,\\%';
  const txt = (nome) => '\\text{' + nome + '}';
  const votosTxt = (v) => fmt(v) + (v === 1 ? ' voto' : ' votos');
  const mandatosTxt = (v) => fmt(v) + (v === 1 ? ' mandato' : ' mandatos');
  const pontosTxt = (v) => fmt(v) + (v === 1 ? ' ponto' : ' pontos');

  function listaPt(l) {
    return l.length <= 1 ? l.join('') : l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];
  }

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'mat-a', tema: 'cidadania', id: def.subtema + '-' + def.tipo }, def));
  }

  // Utilitários partilhados (Manual.geradores.ajudas).
  const tentar = (construir) => A.tentar(construir, 'cidadania');
  const { fechar, fecharTexto, confere } = A;

  // ---------------------------------------------------------------- maiorias
  // Reparte resto por partes inteiras distintas, cada uma entre 5 e max − 1 (null se impossível).
  function repartir(rng, resto, partes, max) {
    for (let i = 0; i < 30; i++) {
      const r = [];
      let falta = resto;
      let ok = true;
      for (let k = 0; k < partes - 1; k++) {
        const depois = partes - 1 - k;
        const lo = Math.max(5, falta - (max - 1) * depois);
        const hi = Math.min(max - 1, falta - 5 * depois);
        if (lo > hi) { ok = false; break; }
        const v = inteiro(rng, lo, hi);
        r.push(v);
        falta -= v;
      }
      if (!ok) continue;
      r.push(falta);
      if (r.every((v) => v >= 5 && v < max) && new Set(r).size === r.length) return r;
    }
    return null;
  }

  // Eleição com n candidatos, total T e o mais votado com X votos (único máximo).
  function eleicao(rng, n, T, X) {
    const outros = repartir(rng, T - X, n - 1, X);
    if (!outros) return null;
    const votos = baralhar(rng, [X].concat(outros));
    const nomes = baralhar(rng, NOMES).slice(0, n);
    return { nomes, votos, iX: votos.indexOf(X) };
  }

  function textoVotos(nomes, votos) {
    return listaPt(nomes.map((n, i) => n + ' teve ' + votosTxt(votos[i])));
  }

  // Segundo método: o menor inteiro k com 2k > T, pela paridade de T.
  const menorAcimaDeMetade = (T) => (T % 2 === 0 ? T / 2 + 1 : (T + 1) / 2);

  function passoTotal(votos) {
    return { passo: 'Somar os votos', porque: 'A maioria absoluta conta-se sobre o total de votos validamente expressos.', calculo: 'T = ' + votos.map((v) => tex(v)).join(' + ') + ' = ' + tex(soma(votos)) };
  }

  function passosLimiar(T, L) {
    const f = Math.floor(T / 2);
    return [
      { passo: 'Calcular metade do total', porque: 'Ter maioria absoluta é ter mais de metade dos votos.', calculo: '\\dfrac{' + tex(T) + '}{2} = ' + tex(T / 2, 1) },
      {
        passo: 'Tomar o primeiro inteiro acima de metade',
        porque: T % 2 === 0 ? 'Metade é um número inteiro e ter exatamente metade não chega: é preciso mais um voto.' : 'Metade não é inteira, e o primeiro inteiro acima dela é a parte inteira mais um.',
        calculo: '\\left\\lfloor \\dfrac{' + tex(T) + '}{2} \\right\\rfloor + 1 = ' + tex(f) + ' + 1 = ' + tex(L),
      },
    ];
  }

  registar({
    subtema: 'maiorias', tipo: 'limiar', nome: 'Votos que garantem a maioria absoluta',
    formatos: ['numerica', 'escolha'], contextos: ['total', 'votos'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const cenario = escolher(rng, CENARIOS);
        let T, votos = null, nomes = null, enunciado;
        const resolucao = [];
        if (contexto === 'votos') {
          const n = inteiro(rng, 3, 4);
          nomes = baralhar(rng, NOMES).slice(0, n);
          votos = nomes.map(() => inteiro(rng, 12, 420));
          T = soma(votos);
          enunciado = cenario + ', ' + textoVotos(nomes, votos) + '. Quantos votos, no mínimo, garantem a maioria absoluta?';
          resolucao.push(passoTotal(votos));
        } else {
          T = inteiro(rng, 41, 2400);
          enunciado = cenario + ' houve ' + votosTxt(T) + ' validamente expressos. Quantos votos, no mínimo, garantem a maioria absoluta?';
        }
        const L = C.maioria(votos || [T]).limiarAbsoluta;
        resolucao.push(...passosLimiar(T, L));
        const f = Math.floor(T / 2);
        const erros = [
          { codigo: 'esqueceu_mais_um', valor: f, explicacao: 'Com ' + votosTxt(f) + ' não se tem mais de metade de ' + fmt(T) + ': a maioria absoluta exige mais de metade, por isso soma-se 1 à parte inteira de metade.' },
          { codigo: 'dois_tercos_dos_votos', valor: Math.ceil((2 * T) / 3), explicacao: 'Calculaste dois terços do total; a maioria absoluta é só mais de metade dos votos.' },
        ];
        if (votos) {
          const semUltimo = T - votos[votos.length - 1];
          erros.push({ codigo: 'esqueceu_um_candidato', valor: Math.floor(semUltimo / 2) + 1, explicacao: 'Faltou somar os votos de ' + nomes[nomes.length - 1] + ': a maioria conta-se sobre o total de votos validamente expressos.' });
        }
        erros.push(T % 2
          ? { codigo: 'arredondou_e_somou_um', valor: L + 1, explicacao: 'Metade de ' + fmt(T) + ' é ' + fmt(T / 2) + '; ' + votosTxt(L) + ' já são mais de metade, não é preciso somar mais 1 depois de arredondar.' }
          : { codigo: 'somou_dois', valor: L + 1, explicacao: 'Basta um voto a mais do que metade: ' + votosTxt(L) + ' já são mais de metade de ' + fmt(T) + '.' });
        const K = menorAcimaDeMetade(T);
        return fechar(rng, formato, {
          enunciado, resolucao, dados: { T, votos, nomes },
        }, {
          resposta: L, tolerancia: 0, unidade: 'votos', texto: votosTxt, erros,
          verificacao: {
            passo: 'Confirmar que ' + votosTxt(K) + ' é o menor número com mais de metade',
            calculo: '2 \\times ' + tex(K) + ' = ' + tex(2 * K) + ' > ' + tex(T) + ' \\quad \\text{e} \\quad 2 \\times ' + tex(K - 1) + ' = ' + tex(2 * (K - 1)) + ' \\leq ' + tex(T),
            valor: K,
          },
        });
      });
    },
    verificarIndependente(p) {
      const T = p.dados.votos ? soma(p.dados.votos) : p.dados.T;
      if (T !== p.dados.T) return false;
      if (p.formato === 'numerica') return 2 * p.resposta > T && 2 * (p.resposta - 1) <= T;
      return confere(p, Math.ceil((T + 1) / 2), votosTxt);
    },
    limites(p) {
      return p.dados.T >= 36 && p.dados.T <= 2400 && (!p.dados.votos || p.dados.votos.every((v) => v >= 12 && v <= 420));
    },
  });

  // Conclusões sobre o vencedor (texto partilhado pela geração e pela verificação).
  const afAbsoluta = (n) => n + ' tem maioria absoluta.';
  const afSimples = (n) => n + ' vence por maioria simples, mas não tem maioria absoluta.';
  const afSegundoSimples = (n) => n + ' vence por maioria simples.';

  // Segundo método: o mais votado tem maioria absoluta se o dobro dos seus votos passa o total.
  function conclusaoVencedor(nomes, votos) {
    let i = 0;
    for (let k = 1; k < votos.length; k++) if (votos[k] > votos[i]) i = k;
    const T = soma(votos);
    return 2 * votos[i] > T ? afAbsoluta(nomes[i]) : afSimples(nomes[i]);
  }

  registar({
    subtema: 'maiorias', tipo: 'vencedor', nome: 'Há maioria absoluta?',
    formatos: ['escolha', 'vf'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const n = inteiro(rng, 3, 4);
        const caso = escolher(rng, ['absoluta', 'absoluta', 'metade', 'abaixo', 'abaixo']);
        let T, X;
        if (caso === 'metade') {
          T = 2 * inteiro(rng, 40, 600);
          X = T / 2;
        } else {
          T = inteiro(rng, 80, 1200);
          const f = Math.floor(T / 2);
          X = caso === 'absoluta' ? f + inteiro(rng, 1, Math.max(1, Math.round(T / 12))) : inteiro(rng, Math.ceil(T / 3) + 4, f - 1);
        }
        const el = eleicao(rng, n, T, X);
        if (!el) return null;
        const { nomes, votos, iX } = el;
        const m = C.maioria(votos);
        if (m.simples !== iX) return null;
        const L = m.limiarAbsoluta;
        const absoluta = m.absoluta === iX;
        let iY = -1;
        votos.forEach((v, i) => { if (i !== iX && (iY < 0 || v > votos[iY])) iY = i; });
        const nX = nomes[iX];
        const nY = nomes[iY];
        const certa = absoluta ? afAbsoluta(nX) : afSimples(nX);
        const erroX = absoluta
          ? { codigo: 'nao_viu_absoluta', texto: afSimples(nX), explicacao: nX + ' tem ' + votosTxt(X) + ', pelo menos ' + fmt(L) + ' (mais de metade de ' + fmt(T) + '): tem maioria absoluta.' }
          : caso === 'metade'
            ? { codigo: 'metade_nao_chega', texto: afAbsoluta(nX), explicacao: nX + ' tem exatamente metade dos votos (' + fmt(X) + ' de ' + fmt(T) + '); a maioria absoluta exige mais de metade, ou seja, pelo menos ' + votosTxt(L) + '.' }
            : { codigo: 'mais_votos_nao_chega', texto: afAbsoluta(nX), explicacao: nX + ' tem mais votos do que cada adversário, mas ' + fmt(X) + ' é menos do que ' + fmt(L) + ' (mais de metade de ' + fmt(T) + '): só tem maioria simples.' };
        const erroYAbs = { codigo: 'segundo_com_absoluta', texto: afAbsoluta(nY), explicacao: nY + ' tem ' + votosTxt(votos[iY]) + ', menos do que ' + nX + ' (' + fmt(X) + ') e menos de metade de ' + fmt(T) + '.' };
        const erroYSimp = { codigo: 'segundo_com_simples', texto: afSegundoSimples(nY), explicacao: 'A maioria simples é de quem tem mais votos: ' + nX + ' tem ' + fmt(X) + ', mais do que ' + nY + ' (' + fmt(votos[iY]) + ').' };
        const cenario = escolher(rng, CENARIOS);
        const intro = cenario + ', ' + textoVotos(nomes, votos) + '.';
        const resolucao = [passoTotal(votos)].concat(passosLimiar(T, L), [{
          passo: 'Comparar o mais votado com o limiar',
          porque: 'Só há maioria absoluta se o mais votado chegar ao limiar; senão vence apenas por maioria simples.',
          calculo: txt(nX) + ': ' + tex(X) + (absoluta ? ' \\geq ' : ' < ') + tex(L),
        }]);
        const conclusao = conclusaoVencedor(nomes, votos);
        const verificacao = {
          passo: 'Confirmar comparando o dobro dos votos com o total',
          calculo: '2 \\times ' + tex(X) + ' = ' + tex(2 * X) + (2 * X > T ? ' > ' : ' \\leq ') + tex(T),
        };
        const dados = { nomes, votos, caso };
        if (formato === 'escolha') {
          return fecharTexto(rng, { enunciado: intro + ' Que conclusão é correta?', resolucao, verificacao, dados }, certa, [erroX, erroYAbs, erroYSimp], conclusao);
        }
        const falsa = rng() < 0.7 ? erroX : erroYAbs;
        const v = A.vfDe(rng, certa, falsa.texto, { codigo: falsa.codigo, explicacao: falsa.explicacao });
        dados.afirmacao = v.enunciado;
        return {
          enunciado: intro + ' ' + v.enunciado, correta: v.correta, errosTipicos: v.errosTipicos, resolucao,
          verificacao: Object.assign(verificacao, { valor: v.enunciado === conclusao }), dados,
        };
      });
    },
    verificarIndependente(p) {
      const conclusao = conclusaoVencedor(p.dados.nomes, p.dados.votos);
      if (p.formato === 'vf') return p.correta === (p.dados.afirmacao === conclusao);
      return A.chave(p.opcoes[p.correta]) === A.chave(conclusao);
    },
    limites(p) {
      const T = soma(p.dados.votos);
      return T >= 80 && T <= 1200 && p.dados.votos.every((v) => v >= 5);
    },
  });

  registar({
    subtema: 'maiorias', tipo: 'em-falta', nome: 'Votos em falta para a maioria absoluta',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const n = inteiro(rng, 3, 4);
        const T = inteiro(rng, 120, 2000);
        const f = Math.floor(T / 2);
        const lo = Math.floor(T / n) + 4;
        if (lo > f - 3) return null;
        const X = inteiro(rng, lo, f - 3);
        const el = eleicao(rng, n, T, X);
        if (!el) return null;
        const { nomes, votos, iX } = el;
        const m = C.maioria(votos);
        if (m.simples !== iX || m.absoluta !== null) return null;
        const L = m.limiarAbsoluta;
        const k = L - X;
        const nX = nomes[iX];
        const cenario = escolher(rng, CENARIOS);
        const enunciado = cenario + ', ' + textoVotos(nomes, votos) + '. ' + nX + ' teve mais votos, mas não teve maioria absoluta. Se alguns eleitores tivessem votado em ' + nX + ' em vez de noutro candidato (o total de votos não muda), quantos votos a mais precisaria ' + nX + ', no mínimo, para ter maioria absoluta?';
        const resolucao = [passoTotal(votos)].concat(passosLimiar(T, L), [{
          passo: 'Subtrair os votos que ' + nX + ' já tem',
          porque: 'Faltam os votos que separam ' + nX + ' do limiar da maioria absoluta.',
          calculo: tex(L) + ' - ' + tex(X) + ' = ' + tex(k),
        }]);
        // Segundo método: acrescentar votos um a um até o dobro passar o total.
        let K = 0;
        while (2 * (X + K) <= T) K++;
        const erros = [
          { codigo: 'esqueceu_mais_um', valor: f - X, explicacao: 'Com ' + fmt(f) + ' votos, ' + nX + ' não teria mais de metade de ' + fmt(T) + ': o limiar é a parte inteira de metade mais um (' + fmt(L) + ').' },
          { codigo: 'votos_novos', valor: T - 2 * X + 1, explicacao: 'Contaste votos novos (o total aumentaria); aqui os votos passam de outros candidatos para ' + nX + ' e o total mantém-se em ' + fmt(T) + '.' },
          { codigo: 'nao_subtraiu', valor: L, explicacao: fmt(L) + ' é o limiar da maioria absoluta; falta subtrair os ' + fmt(X) + ' votos que ' + nX + ' já tem.' },
          { codigo: 'votos_dos_outros', valor: T - X, explicacao: 'Não é preciso ficar com todos os votos dos adversários: basta passar de metade do total.' },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { nomes, votos } }, {
          resposta: k, tolerancia: 0, unidade: 'votos', texto: votosTxt, erros,
          verificacao: {
            passo: 'Confirmar que com ' + votosTxt(K) + ' a mais há maioria e com menos um não há',
            calculo: '2 \\times ' + tex(X + K) + ' = ' + tex(2 * (X + K)) + ' > ' + tex(T) + ' \\quad \\text{e} \\quad 2 \\times ' + tex(X + K - 1) + ' = ' + tex(2 * (X + K - 1)) + ' \\leq ' + tex(T),
            valor: K,
          },
        });
      });
    },
    verificarIndependente(p) {
      const v = p.dados.votos;
      const T = soma(v);
      const X = Math.max(...v);
      if (p.formato === 'numerica') return 2 * (X + p.resposta) > T && 2 * (X + p.resposta - 1) <= T;
      let K = 0;
      while (2 * (X + K) <= T) K++;
      return confere(p, K, votosTxt);
    },
    limites(p) {
      const T = soma(p.dados.votos);
      return T >= 120 && T <= 2000 && p.dados.votos.every((v) => v >= 5);
    },
  });

  // ---------------------------------------------------------------- Borda
  function permutacoes(n) {
    if (n === 1) return [[0]];
    const r = [];
    for (const p of permutacoes(n - 1)) {
      for (let i = 0; i <= p.length; i++) r.push(p.slice(0, i).concat([n - 1], p.slice(i)));
    }
    return r;
  }

  // Boletins de preferência: n candidatos, tipos distintos de boletim, 2 a 12 boletins de cada tipo.
  function dadosBorda(rng, n, tipos) {
    const nomes = baralhar(rng, NOMES).slice(0, n);
    const ordens = baralhar(rng, permutacoes(n)).slice(0, tipos);
    const boletins = ordens.map((ordem) => ({ ordem, quantidade: inteiro(rng, 2, 12) }));
    return { n, nomes, boletins };
  }

  // Índice do único máximo (ou null se houver empate).
  function unicoMaximo(l) {
    const max = Math.max(...l);
    const i = l.indexOf(max);
    return l.lastIndexOf(max) === i ? i : null;
  }

  function analisarBorda(d) {
    const C = calc();
    const b = C.borda(d.boletins, d.n);
    const primeiros = d.nomes.map((_, c) => soma(d.boletins.filter((x) => x.ordem[0] === c).map((x) => x.quantidade)));
    const V = soma(d.boletins.map((x) => x.quantidade));
    return { pontos: b.pontos, vencedor: b.vencedor, primeiros, pluralidade: unicoMaximo(primeiros), V, total: (V * d.n * (d.n + 1)) / 2 };
  }

  // Segundo método (comparações dois a dois): em cada boletim, um candidato recebe 1 ponto
  // por cada candidato que fica abaixo dele, mais 1.
  function bordaPorPares(boletins, n) {
    const pts = new Array(n).fill(0);
    for (const b of boletins) {
      for (let c = 0; c < n; c++) {
        let abaixo = 0;
        for (let d = 0; d < n; d++) if (d !== c && b.ordem.indexOf(c) < b.ordem.indexOf(d)) abaixo++;
        pts[c] += (abaixo + 1) * b.quantidade;
      }
    }
    return pts;
  }

  function primeirosPorContagem(boletins, n) {
    const r = new Array(n).fill(0);
    for (const b of boletins) r[b.ordem[0]] += b.quantidade;
    return r;
  }

  function textoBoletins(d) {
    return d.boletins.map((b) => b.quantidade + ' boletins ' + b.ordem.map((i) => d.nomes[i]).join(' > ')).join('; ');
  }

  function introBorda(rng, d, an) {
    const cenario = escolher(rng, ['Na eleição do delegado de turma', 'Na escolha do porta-voz do clube de ciência', 'Na eleição do representante da turma no desporto escolar']);
    return cenario + ', ' + an.V + ' alunos ordenaram ' + d.n + ' candidatos: ' + textoBoletins(d) + '.';
  }

  const passoPosicoes = (n) => ({
    passo: 'Pontos de cada posição',
    porque: 'Com ' + n + ' candidatos, o 1.º lugar vale ' + n + ' pontos e cada lugar abaixo vale menos 1, até 1 ponto no último.',
  });

  function parcelasBorda(d, c) {
    return d.boletins.map((b) => ({ q: b.quantidade, p: d.n - b.ordem.indexOf(c) }));
  }

  function passoPontosCandidato(d, c, pts, porque) {
    return {
      passo: 'Pontos de ' + d.nomes[c],
      porque,
      calculo: txt(d.nomes[c]) + ': ' + parcelasBorda(d, c).map((x) => tex(x.q) + ' \\times ' + x.p).join(' + ') + ' = ' + tex(pts[c]),
    };
  }

  function verificacaoTotalBorda(d, an, pares) {
    return {
      passo: 'Confirmar pelo total de pontos (cada boletim distribui ' + an.total / an.V + ' pontos)',
      calculo: tex(an.V) + ' \\times \\dfrac{' + d.n + ' \\times ' + (d.n + 1) + '}{2} = ' + tex(an.total) + ' = ' + pares.map((v) => tex(v)).join(' + '),
    };
  }

  // Verificação do vencedor pelo método "pontos dos outros": os pontos do vencedor são o total menos os
  // dos adversários (contados por comparações dois a dois) e têm de ser mais do que os de cada um.
  function verificacaoVencedorBorda(d, an, pares) {
    const Wv = unicoMaximo(pares);
    const outros = pares.filter((_, i) => i !== Wv);
    return {
      Wv,
      verificacao: {
        passo: 'Confirmar o vencedor pelo total: os pontos de ' + d.nomes[Wv] + ' são o total (' + an.V + ' boletins × ' + an.total / an.V + ' pontos) menos os dos adversários, e são mais do que os de cada um',
        calculo: tex(an.total) + ' - (' + outros.map((v) => tex(v)).join(' + ') + ') = ' + tex(an.total - soma(outros)) + ' > ' + tex(Math.max(...outros)),
      },
    };
  }

  const ESQUEMA_BORDA = (d) => ({ id: 'borda', opcoes: { candidatos: d.nomes.slice(), boletins: d.boletins.map((b) => ({ ordem: b.ordem.slice(), quantidade: b.quantidade })) } });
  const contextoN = (contexto) => (contexto === 'quatro-candidatos' ? 4 : 3);
  const limitesBorda = (p) => p.dados.boletins.every((b) => b.quantidade >= 2 && b.quantidade <= 12) && [3, 4].includes(p.dados.n);

  registar({
    subtema: 'borda', tipo: 'pontos', nome: 'Pontos de Borda de um candidato',
    formatos: ['numerica', 'escolha'], contextos: ['tres-candidatos', 'quatro-candidatos'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const n = contextoN(contexto);
        const d = dadosBorda(rng, n, n === 3 ? 3 : 4);
        const an = analisarBorda(d);
        const c = inteiro(rng, 0, n - 1);
        const pts = an.pontos[c];
        const parc = parcelasBorda(d, c);
        const enunciado = introBorda(rng, d, an) + ' Pelo método de Borda (' + n + ' pontos para o 1.º lugar, …, 1 ponto para o último), quantos pontos tem ' + d.nomes[c] + '?';
        const resolucao = [
          passoPosicoes(n),
          { passo: 'Multiplicar pelo número de boletins', porque: 'Cada tipo de boletim conta tantas vezes quantos os boletins desse tipo.', calculo: parc.map((x) => tex(x.q) + ' \\times ' + x.p + ' = ' + tex(x.q * x.p)).join(',\\quad ') },
          { passo: 'Somar as parcelas', porque: 'Os pontos de Borda são a soma dos pontos obtidos em todos os boletins.', calculo: parc.map((x) => tex(x.q * x.p)).join(' + ') + ' = ' + tex(pts) },
        ];
        const pares = bordaPorPares(d.boletins, n);
        const outros = pares.filter((_, i) => i !== c);
        const valor = an.total - soma(outros);
        const ver = verificacaoTotalBorda(d, an, pares);
        ver.calculo += ';\\quad ' + tex(an.total) + ' - (' + outros.map((v) => tex(v)).join(' + ') + ') = ' + tex(valor);
        ver.valor = valor;
        const erros = [
          { codigo: 'nao_multiplicou_boletins', valor: soma(parc.map((x) => x.p)), explicacao: 'Contaste cada tipo de boletim uma só vez; é preciso multiplicar os pontos da posição pelo número de boletins.' },
          { codigo: 'pontos_desde_zero', valor: pts - an.V, explicacao: 'Deste ' + (n - 1) + ' pontos ao 1.º lugar e 0 ao último; aqui o 1.º lugar vale ' + n + ' pontos e o último vale 1.' },
          { codigo: 'ordem_invertida', valor: (n + 1) * an.V - pts, explicacao: 'Deste 1 ponto ao 1.º lugar e ' + n + ' ao último: a ordem dos pontos está ao contrário.' },
          { codigo: 'so_primeiros_lugares', valor: an.primeiros[c], explicacao: 'Contaste só os boletins em que ' + d.nomes[c] + ' fica em 1.º lugar; no método de Borda todas as posições dão pontos.' },
        ];
        // O erro dos 1.ºs lugares tem de ser um número próprio: se coincidir com a resposta ou com outro erro, re-sorteia.
        const vPrim = an.primeiros[c];
        if (vPrim === pts || erros.slice(0, 3).some((e) => e.valor === vPrim)) return null;
        return fechar(rng, formato, { enunciado, resolucao, dados: { n, nomes: d.nomes, boletins: d.boletins, candidato: c }, esquema: ESQUEMA_BORDA(d) }, {
          resposta: pts, tolerancia: 0, unidade: 'pontos', texto: pontosTxt, erros, verificacao: ver,
        });
      });
    },
    verificarIndependente(p) {
      const pares = bordaPorPares(p.dados.boletins, p.dados.n);
      return confere(p, pares[p.dados.candidato], pontosTxt);
    },
    limites: limitesBorda,
  });

  registar({
    subtema: 'borda', tipo: 'vencedor', nome: 'Vencedor pelo método de Borda',
    formatos: ['escolha', 'vf'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const n = 4;
        const d = dadosBorda(rng, n, 4);
        const an = analisarBorda(d);
        const W = an.vencedor;
        const P = an.pluralidade;
        if (W === null || P === null) return null;
        if (rng() < 0.6 && P === W) return null; // privilegiar os casos em que os métodos divergem
        const p = an.pontos;
        const nome = (i) => d.nomes[i];
        const semMult = d.nomes.map((_, c) => soma(parcelasBorda(d, c).map((x) => x.p)));
        const U = unicoMaximo(semMult);
        const I = unicoMaximo(p.map((v) => -v));
        const papel = {};
        const dar = (i, e) => { if (i !== null && i !== W && !papel[i]) papel[i] = e; };
        dar(P, { codigo: 'maioria_simples', explicacao: nome(P) + ' tem mais 1.ºs lugares (' + an.primeiros[P] + '), mas o método de Borda conta todas as posições: ' + nome(P) + ' tem ' + pontosTxt(p[P]) + ' e ' + nome(W) + ' tem ' + p[W] + '.' });
        dar(U, { codigo: 'nao_multiplicou_boletins', explicacao: 'Sem multiplicar pelo número de boletins, ' + nome(U) + ' ficaria à frente; com os boletins contados, tem ' + pontosTxt(p[U]) + ', menos do que ' + nome(W) + ' (' + p[W] + ').' });
        dar(I, { codigo: 'ordem_invertida', explicacao: nome(I) + ' só ganharia dando 1 ponto ao 1.º lugar e ' + n + ' ao último; com a ordem certa tem ' + pontosTxt(p[I]) + ', o menor total.' });
        for (let i = 0; i < n; i++) dar(i, { codigo: 'menos_pontos', explicacao: nome(i) + ' tem ' + pontosTxt(p[i]) + ', menos do que ' + nome(W) + ' (' + p[W] + '); revê as somas.' });
        const resolucao = [passoPosicoes(n)];
        for (let c = 0; c < n; c++) {
          resolucao.push(passoPontosCandidato(d, c, p, c === 0 ? 'Somam-se, em cada tipo de boletim, os pontos da posição vezes o número de boletins.' : 'Faz-se o mesmo para cada candidato.'));
        }
        const ordem = d.nomes.map((_, i) => i).sort((a, b) => p[b] - p[a]);
        resolucao.push({ passo: 'Comparar os totais', porque: 'Vence quem tiver mais pontos de Borda.', calculo: ordem.map((i) => txt(nome(i)) + ' = ' + tex(p[i])).join(' > ') });
        const pares = bordaPorPares(d.boletins, n);
        const { Wv, verificacao } = verificacaoVencedorBorda(d, an, pares);
        const intro = introBorda(rng, d, an);
        const dados = { n, nomes: d.nomes, boletins: d.boletins };
        const esquema = ESQUEMA_BORDA(d);
        const afirmacao = (i) => 'Pelo método de Borda, vence ' + nome(i) + '.';
        if (formato === 'escolha') {
          const erros = Object.keys(papel).map((i) => Object.assign({ texto: nome(Number(i)) }, papel[i]));
          return fecharTexto(rng, { enunciado: intro + ' Quem vence pelo método de Borda?', resolucao, verificacao, dados, esquema }, nome(W), erros, nome(Wv));
        }
        const outro = escolher(rng, Object.keys(papel).map(Number));
        const v = A.vfDe(rng, afirmacao(W), afirmacao(outro), papel[outro]);
        dados.alvo = v.correta ? W : outro;
        return {
          enunciado: intro + ' ' + v.enunciado, correta: v.correta, errosTipicos: v.errosTipicos, resolucao,
          verificacao: Object.assign(verificacao, { valor: dados.alvo === Wv }), dados, esquema,
        };
      });
    },
    verificarIndependente(p) {
      const Wv = unicoMaximo(bordaPorPares(p.dados.boletins, p.dados.n));
      if (Wv === null) return false;
      if (p.formato === 'vf') return p.correta === (p.dados.alvo === Wv);
      return p.opcoes[p.correta] === p.dados.nomes[Wv];
    },
    limites: limitesBorda,
  });

  registar({
    subtema: 'borda', tipo: 'divergencia', nome: 'Maioria simples e Borda coincidem?',
    formatos: ['vf'], contextos: ['tres-candidatos', 'quatro-candidatos'],
    gerar(semente, { contexto, rng }) {
      const n = contextoN(contexto);
      const coincideAlvo = rng() < 0.5;
      const diz = rng() < 0.5 ? 'coincide' : 'diverge';
      return tentar(() => {
        const d = dadosBorda(rng, n, n === 3 ? 3 : 4);
        const an = analisarBorda(d);
        const W = an.vencedor;
        const P = an.pluralidade;
        if (W === null || P === null || (P === W) !== coincideAlvo) return null;
        const nome = (i) => d.nomes[i];
        const p = an.pontos;
        const afirmacao = diz === 'coincide'
          ? 'Nesta eleição, o vencedor por maioria simples é também o vencedor pelo método de Borda.'
          : 'Nesta eleição, o vencedor por maioria simples não é o vencedor pelo método de Borda.';
        const correta = (diz === 'coincide') === coincideAlvo;
        let errosTipicos = [];
        if (!correta) {
          errosTipicos = [diz === 'coincide'
            ? { codigo: 'assumiu_coincidencia', explicacao: nome(P) + ' tem mais 1.ºs lugares (' + an.primeiros[P] + '), mas ' + nome(W) + ' tem mais pontos de Borda (' + p[W] + ' contra ' + p[P] + '): os métodos dão vencedores diferentes.' }
            : { codigo: 'assumiu_divergencia', explicacao: nome(P) + ' tem mais 1.ºs lugares (' + an.primeiros[P] + ') e também mais pontos de Borda (' + p[P] + '): aqui os dois métodos coincidem.' }];
        }
        const resolucao = [
          { passo: 'Contar os 1.ºs lugares', porque: 'Por maioria simples vence quem fica em 1.º lugar em mais boletins.', calculo: an.primeiros.map((v, i) => txt(nome(i)) + ' = ' + tex(v)).join(',\\quad ') },
          passoPosicoes(n),
        ];
        for (let c = 0; c < n; c++) resolucao.push(passoPontosCandidato(d, c, p, c === 0 ? 'Somam-se, em cada tipo de boletim, os pontos da posição vezes o número de boletins.' : 'Faz-se o mesmo para cada candidato.'));
        resolucao.push({
          passo: 'Comparar os vencedores',
          porque: 'Os métodos coincidem só se o mesmo candidato ganhar pelos dois.',
          calculo: '\\text{maioria simples: }' + txt(nome(P)) + (P === W ? ' = ' : ' \\neq ') + txt(nome(W)) + '\\text{ (Borda)}',
        });
        const pares = bordaPorPares(d.boletins, n);
        const prim = primeirosPorContagem(d.boletins, n);
        const { Wv, verificacao } = verificacaoVencedorBorda(d, an, pares);
        const Pv = unicoMaximo(prim);
        verificacao.passo += '; ' + d.nomes[Pv] + ' continua a ser quem tem mais 1.ºs lugares (' + prim[Pv] + ')';
        const coincide = Pv === Wv;
        verificacao.valor = (diz === 'coincide') === coincide;
        return {
          enunciado: introBorda(rng, d, an) + ' ' + afirmacao, correta, errosTipicos, resolucao, verificacao,
          dados: { n, nomes: d.nomes, boletins: d.boletins, diz }, esquema: ESQUEMA_BORDA(d),
        };
      });
    },
    verificarIndependente(p) {
      const { boletins, n, diz } = p.dados;
      const P = unicoMaximo(primeirosPorContagem(boletins, n));
      const W = unicoMaximo(bordaPorPares(boletins, n));
      if (P === null || W === null) return false;
      return p.correta === ((diz === 'coincide') === (P === W));
    },
    limites: limitesBorda,
  });

  // ---------------------------------------------------------------- Hondt e St. Laguë
  const PARTIDOS = ['A', 'B', 'C', 'D'];
  const NOME_METODO = { hondt: 'método de Hondt', stlague: 'método de St. Laguë' };
  const divisorDe = (metodo) => (metodo === 'hondt' ? (k) => k + 1 : (k) => 2 * k + 1);
  const distribuir = (metodo, votos, M) => (metodo === 'hondt' ? calc().hondt(votos, M) : calc().stLague(votos, M));
  // Maiores quocientes com uma sequência de divisores qualquer (para erros como saltar o divisor 1):
  // { mandatos, quocientes } com os M quocientes atribuídos, por ordem (empate: o menor leva, como em calc()).
  function porDivisores(votos, M, divisor) {
    const mandatos = votos.map(() => 0);
    const quocientes = [];
    for (let k = 0; k < M; k++) {
      let j = 0;
      for (let i = 1; i < votos.length; i++) {
        const qi = votos[i] / divisor(mandatos[i]), qj = votos[j] / divisor(mandatos[j]);
        if (qi > qj + 1e-9 || (Math.abs(qi - qj) <= 1e-9 && votos[i] < votos[j])) j = i;
      }
      quocientes.push(votos[j] / divisor(mandatos[j]));
      mandatos[j]++;
    }
    return { mandatos, quocientes };
  }

  // Votos de 4 partidos e M mandatos sem empates perto da fronteira:
  // (M−1).º, M.º e (M+1).º quocientes separados por pelo menos 1 voto e 1 %.
  function dadosProporcional(rng, metodo) {
    const votos = PARTIDOS.map(() => 10 * inteiro(rng, 30, 1200));
    if (new Set(votos).size !== votos.length) return null;
    const M = inteiro(rng, 5, 10);
    const r = distribuir(metodo, votos, M + 1);
    const q = r.atribuicoes.map((a) => a.quociente);
    const separado = (a, b) => a - b >= Math.max(1, 0.01 * a);
    if (!separado(q[M - 2], q[M - 1]) || !separado(q[M - 1], q[M])) return null;
    return { votos, M, dist: distribuir(metodo, votos, M), seguinte: r.atribuicoes[M] };
  }

  // Segundo método: lista de todos os quocientes ordenada; M.º maior quociente e mandatos por limiar.
  function quocientesOrdenados(votos, M, metodo) {
    const div = divisorDe(metodo);
    const l = [];
    votos.forEach((v, i) => { for (let k = 0; k <= M; k++) l.push({ partido: i, q: v / div(k) }); });
    return l.sort((a, b) => b.q - a.q);
  }

  function mandatosPorLimiar(votos, M, metodo) {
    const l = quocientesOrdenados(votos, M, metodo);
    const qM = l[M - 1].q;
    return { qM, ultimo: l[M - 1].partido, mandatos: votos.map((_, i) => l.filter((x) => x.partido === i && x.q >= qM - 1e-9).length) };
  }

  // Mandatos pelo divisor q_M: Hondt ⌊v/q⌋, St. Laguë ⌊(v/q + 1)/2⌋ (n.º de ímpares ≤ v/q).
  function mandatosPorDivisor(v, qM, metodo) {
    const x = v / qM;
    return metodo === 'hondt' ? Math.floor(x + 1e-9) : Math.floor((x + 1) / 2 + 1e-9);
  }

  // Número em LaTeX precedido de "=" se for exato com as casas mostradas, ou de "\approx" se foi arredondado.
  const igualOuAprox = (x, casas) => (Math.abs(x - Math.round(x * Math.pow(10, casas)) / Math.pow(10, casas)) < 1e-9 ? ' = ' : ' \\approx ') + tex(x, casas);

  const distTxt = (m) => PARTIDOS.map((p, i) => p + ' ' + m[i]).join(' – ');

  function enunciadoProporcional(rng, votos, M, metodo) {
    const orgao = escolher(rng, ['assembleia municipal', 'assembleia de freguesia', 'assembleia da associação de pais']);
    return 'Numa eleição para a ' + orgao + ', os partidos A, B, C e D tiveram, respetivamente, ' + listaPt(votos.map((v) => fmt(v))) + ' votos. Distribuem-se ' + M + ' mandatos pelo ' + NOME_METODO[metodo] + '.';
  }

  // Quadro de quocientes (matemática de bloco): linhas = partidos, colunas = divisores; os M maiores a negrito.
  function passosProporcional(votos, M, metodo, dist, seguinte) {
    const div = divisorDe(metodo);
    const colunas = Math.max(...dist.mandatos) + 1;
    const cab = Array.from({ length: colunas }, (_, k) => '\\div ' + div(k)).join(' & ');
    const linhas = votos.map((v, i) => txt(PARTIDOS[i]) + ' & ' + Array.from({ length: colunas }, (_, k) => {
      const q = tex(v / div(k), 2);
      return k < dist.mandatos[i] ? '\\mathbf{' + q + '}' : q;
    }).join(' & '));
    const ult = dist.atribuicoes[M - 1];
    return [
      {
        passo: 'Calcular os quocientes',
        porque: metodo === 'hondt'
          ? 'No método de Hondt dividem-se os votos de cada partido por 1, 2, 3, …; a negrito estão os ' + M + ' maiores quocientes.'
          : 'No método de St. Laguë dividem-se os votos de cada partido pelos ímpares 1, 3, 5, …; a negrito estão os ' + M + ' maiores quocientes.',
        calculo: '\\begin{array}{c|' + 'c'.repeat(colunas) + '} & ' + cab + ' \\\\ \\hline ' + linhas.join(' \\\\ ') + ' \\end{array}',
        bloco: true,
      },
      {
        passo: 'Ver onde fica o corte',
        porque: 'Os mandatos vão, um a um, para os ' + M + ' maiores quocientes; o seguinte já não elege ninguém.',
        calculo: 'q_{' + M + '}' + igualOuAprox(ult.quociente, 2) + '\\ (' + txt(PARTIDOS[ult.partido]) + ') > q_{' + (M + 1) + '}' + igualOuAprox(seguinte.quociente, 2) + '\\ (' + txt(PARTIDOS[seguinte.partido]) + ')',
      },
    ];
  }

  // Parcela do método do divisor para um partido: Hondt ⌊v/q⌋, St. Laguë ⌊(v/q + 1)/2⌋.
  function parcelaDivisor(v, M, metodo) {
    const fr = '\\tfrac{' + tex(v) + '}{q_{' + M + '}}';
    return metodo === 'hondt' ? '\\left\\lfloor ' + fr + ' \\right\\rfloor' : '\\left\\lfloor \\tfrac{1}{2}\\left(' + fr + ' + 1\\right) \\right\\rfloor';
  }

  // q_M escrito como divisão exata (votos do dono do último mandato ÷ divisor usado), com o valor aproximado.
  function definicaoQ(votos, M, metodo, r) {
    const d = divisorDe(metodo)(r.mandatos[r.ultimo] - 1);
    return 'q_{' + M + '} = \\tfrac{' + tex(votos[r.ultimo]) + '}{' + d + '}' + igualOuAprox(r.qM, 2);
  }

  // Verificação pelo método do divisor (q_M): mostra a divisão de um partido (i) ou de todos (i = null).
  function verificacaoDivisor(votos, M, metodo, i) {
    const r = mandatosPorLimiar(votos, M, metodo);
    const regra = metodo === 'hondt' ? 'a parte inteira de votos ÷ divisor' : 'a parte inteira de (votos ÷ divisor + 1) ÷ 2, ou seja, os ímpares até votos ÷ divisor';
    let calculo;
    if (i === null) {
      calculo = definicaoQ(votos, M, metodo, r) + ';\\quad ' + votos.map((v) => parcelaDivisor(v, M, metodo)).join(' + ') + ' = ' + r.mandatos.join(' + ') + ' = ' + soma(r.mandatos);
    } else {
      const x = votos[i] / r.qM;
      const dentro = metodo === 'hondt' ? x : (x + 1) / 2;
      calculo = definicaoQ(votos, M, metodo, r) + ';\\ \\dfrac{' + tex(votos[i]) + '}{q_{' + M + '}}' + igualOuAprox(x, 3) +
        (metodo === 'hondt' ? '' : ';\\ \\dfrac{' + tex(x, 3) + ' + 1}{2}' + igualOuAprox(dentro, 3)) +
        ';\\ \\lfloor ' + tex(dentro, 3) + ' \\rfloor = ' + r.mandatos[i] + ';\\quad ' + r.mandatos.join(' + ') + ' = ' + soma(r.mandatos);
    }
    return {
      r,
      verificacao: {
        passo: 'Confirmar pelo método do divisor: com o divisor ' + (Math.abs(r.qM * 100 - Math.round(r.qM * 100)) < 1e-6 ? '' : '≈ ') + fmt(r.qM, 2) + ' (o ' + M + '.º quociente), cada partido elege ' + regra + ', e os mandatos somam ' + M,
        calculo,
      },
    };
  }

  // Erros reais de distribuição (escolha: distribuição inteira; numérica: mandatos do partido i).
  function errosDistribuicao(votos, M, metodo, outro) {
    const menor = votos.indexOf(Math.min(...votos));
    const semMenor = votos.map((v, j) => (j === menor ? 0 : v));
    const lista = [
      metodo === 'hondt'
        ? { codigo: 'divisores_impares', m: distribuir(outro, votos, M).mandatos, explicacao: 'Usaste os divisores 1, 3, 5, … (St. Laguë); no método de Hondt os divisores são 1, 2, 3, 4, …' }
        : { codigo: 'divisores_hondt', m: distribuir(outro, votos, M).mandatos, explicacao: 'Usaste os divisores 1, 2, 3, … (Hondt); no método de St. Laguë os divisores são os ímpares 1, 3, 5, 7, …' },
      { codigo: 'parou_um_antes', m: distribuir(metodo, votos, M - 1).mandatos, explicacao: 'Paraste um quociente antes: assim só se distribuem ' + (M - 1) + ' mandatos, e são ' + M + '.' },
      { codigo: 'incluiu_quociente_seguinte', m: distribuir(metodo, votos, M + 1).mandatos, explicacao: 'Incluíste o ' + (M + 1) + '.º quociente, que já fica de fora: isso daria ' + (M + 1) + ' mandatos.' },
      { codigo: 'proporcional_restos_maiores', m: calc().restosMaiores(votos, M).mandatos, explicacao: 'Repartiste em proporção direta (quota ' + M + ' × votos ÷ total, com os restos maiores): é o método de Hamilton, não o ' + NOME_METODO[metodo] + '.' },
      { codigo: 'um_por_partido', m: distribuir(metodo, votos, M - 4).mandatos.map((x) => x + 1), explicacao: 'Não se dá primeiro um mandato a cada partido: cada mandato vai para o maior quociente, mesmo que o partido já tenha mandatos.' },
      { codigo: 'esqueceu_partido_menor', m: distribuir(metodo, semMenor, M).mandatos, explicacao: 'Esqueceste os quocientes do partido ' + PARTIDOS[menor] + ' (o menos votado); também entram na comparação.' },
    ];
    return lista;
  }

  function esquemaHondt(votos, M, metodo) {
    return { id: 'hondt', opcoes: { partidos: votos.map((v, j) => ({ nome: PARTIDOS[j], votos: v })), mandatos: M, metodo } };
  }

  function geradorMandatos(metodo) {
    const outro = metodo === 'hondt' ? 'stlague' : 'hondt';
    return {
      subtema: 'hondt-stlague', tipo: metodo + '-mandatos', nome: 'Mandatos pelo ' + NOME_METODO[metodo],
      formatos: ['numerica', 'escolha'],
      gerar(semente, { formato, rng }) {
        return tentar(() => {
          const dp = dadosProporcional(rng, metodo);
          if (!dp) return null;
          const { votos, M, dist, seguinte } = dp;
          const lista = errosDistribuicao(votos, M, metodo, outro);
          const resolucao = passosProporcional(votos, M, metodo, dist, seguinte);
          const esquema = esquemaHondt(votos, M, metodo);
          if (formato === 'escolha') {
            resolucao.push({ passo: 'Contar os mandatos de cada partido', porque: 'Cada quociente a negrito vale um mandato para o partido dessa linha.', calculo: PARTIDOS.map((p, j) => txt(p) + ' = ' + dist.mandatos[j]).join(',\\ ') });
            const { r, verificacao } = verificacaoDivisor(votos, M, metodo, null);
            const erros = lista.map((e) => ({ codigo: e.codigo, texto: distTxt(e.m), explicacao: e.explicacao }));
            return fecharTexto(rng, {
              enunciado: enunciadoProporcional(rng, votos, M, metodo) + ' Como ficam distribuídos os ' + M + ' mandatos (A – B – C – D)?',
              resolucao, verificacao, dados: { votos, M }, esquema,
            }, distTxt(dist.mandatos), erros, distTxt(r.mandatos));
          }
          // Numérica: um partido em que pelo menos um erro real dá outro número de mandatos.
          const comErro = votos.map((_, j) => j).filter((j) => lista.some((e) => e.m[j] !== dist.mandatos[j]));
          if (!comErro.length) return null;
          const i = escolher(rng, comErro);
          const k = dist.mandatos[i];
          const P = PARTIDOS[i];
          resolucao.push({ passo: 'Contar os mandatos de ' + P, porque: 'Cada quociente de ' + P + ' a negrito vale um mandato.', calculo: '\\text{mandatos de ' + P + '} = ' + k });
          const { r, verificacao } = verificacaoDivisor(votos, M, metodo, i);
          verificacao.valor = r.mandatos[i];
          const erros = lista.map((e) => ({ codigo: e.codigo, valor: e.m[i], explicacao: e.explicacao }));
          return fechar(rng, formato, {
            enunciado: enunciadoProporcional(rng, votos, M, metodo) + ' Quantos mandatos obtém o partido ' + P + '?',
            resolucao, dados: { votos, M, partido: i }, esquema,
          }, { resposta: k, tolerancia: 0, unidade: 'mandatos', texto: mandatosTxt, erros, verificacao });
        });
      },
      verificarIndependente(p) {
        const { votos, M, partido } = p.dados;
        const r = mandatosPorLimiar(votos, M, metodo);
        if (soma(r.mandatos) !== M) return false;
        if (votos.some((v, j) => mandatosPorDivisor(v, r.qM, metodo) !== r.mandatos[j])) return false;
        if (p.formato === 'escolha') return p.opcoes[p.correta] === distTxt(r.mandatos);
        return confere(p, r.mandatos[partido], mandatosTxt);
      },
      limites(p) {
        return p.dados.M >= 5 && p.dados.M <= 10 && p.dados.votos.every((v) => v >= 300 && v <= 12000);
      },
    };
  }

  registar(geradorMandatos('hondt'));
  registar(geradorMandatos('stlague'));

  registar({
    subtema: 'hondt-stlague', tipo: 'ultimo-mandato', nome: 'Quem recebe o último mandato',
    formatos: ['escolha'], contextos: ['hondt', 'stlague'],
    gerar(semente, { contexto, rng }) {
      const metodo = contexto;
      const outro = metodo === 'hondt' ? 'stlague' : 'hondt';
      return tentar(() => {
        const dp = dadosProporcional(rng, metodo);
        if (!dp) return null;
        const { votos, M, dist, seguinte } = dp;
        const ult = dist.atribuicoes[M - 1];
        const pen = dist.atribuicoes[M - 2];
        const L = ult.partido;
        const papel = {};
        const dar = (i, e) => { if (i !== null && i !== L && !papel[i]) papel[i] = e; };
        const q2 = (q) => fmt(q, 2);
        dar(seguinte.partido, { codigo: 'incluiu_quociente_seguinte', explicacao: 'O quociente ' + q2(seguinte.quociente) + ' de ' + PARTIDOS[seguinte.partido] + ' é o ' + (M + 1) + '.º maior: já fica de fora.' });
        dar(pen.partido, { codigo: 'penultimo_mandato', explicacao: PARTIDOS[pen.partido] + ' recebe o ' + (M - 1) + '.º mandato (quociente ' + q2(pen.quociente) + '), não o último.' });
        const ultOutro = distribuir(outro, votos, M).atribuicoes[M - 1].partido;
        dar(ultOutro, { codigo: 'outro_metodo', explicacao: PARTIDOS[ultOutro] + ' receberia o último mandato pelo ' + NOME_METODO[outro] + '; aqui usa-se o ' + NOME_METODO[metodo] + '.' });
        dar(votos.indexOf(Math.max(...votos)), { codigo: 'maior_partido', explicacao: 'O último mandato vai para o maior quociente ainda disponível, não para o partido mais votado.' });
        const div = divisorDe(metodo);
        for (let i = 0; i < 4; i++) {
          dar(i, { codigo: 'quociente_menor', explicacao: 'O maior quociente de ' + PARTIDOS[i] + ' ainda por usar é ' + q2(votos[i] / div(dist.mandatos[i])) + ', menor do que ' + q2(ult.quociente) + ' de ' + PARTIDOS[L] + '.' });
        }
        const resolucao = passosProporcional(votos, M, metodo, dist, seguinte);
        resolucao.push({ passo: 'Identificar o ' + M + '.º quociente', porque: 'O último mandato vai para o partido dono do ' + M + '.º maior quociente.', calculo: 'q_{' + M + '}' + igualOuAprox(ult.quociente, 2) + ' \\to ' + txt(PARTIDOS[L]) });
        // Método do divisor: com o divisor q_M os mandatos somam M, e só o dono do último mandato
        // tem votos ÷ q_M exatamente igual a um divisor do método (o que usou no último mandato).
        const r = mandatosPorLimiar(votos, M, metodo);
        const dono = r.ultimo;
        const ver = {
          passo: 'Confirmar pelo método do divisor: com o divisor ' + (Math.abs(r.qM * 100 - Math.round(r.qM * 100)) < 1e-6 ? '' : '≈ ') + fmt(r.qM, 2) + ' os mandatos somam ' + M + ', e só ' + PARTIDOS[dono] + ' tem votos ÷ divisor exatamente igual a um divisor do método (o do último mandato)',
          calculo: definicaoQ(votos, M, metodo, r) + ';\\ \\dfrac{' + tex(votos[dono]) + '}{q_{' + M + '}} = ' + tex(votos[dono] / r.qM, 3) + ';\\quad ' + votos.map((v) => parcelaDivisor(v, M, metodo)).join(' + ') + ' = ' + r.mandatos.join(' + ') + ' = ' + soma(r.mandatos),
        };
        const texto = (i) => 'Partido ' + PARTIDOS[i];
        const erros = Object.keys(papel).map((i) => Object.assign({ texto: texto(Number(i)) }, papel[i]));
        return fecharTexto(rng, {
          enunciado: enunciadoProporcional(rng, votos, M, metodo) + ' Que partido recebe o último (' + M + '.º) mandato?',
          resolucao, verificacao: ver, dados: { votos, M }, esquema: esquemaHondt(votos, M, metodo),
        }, texto(L), erros, texto(dono));
      });
    },
    verificarIndependente(p) {
      const { votos, M } = p.dados;
      const r = mandatosPorLimiar(votos, M, p.contexto);
      if (soma(r.mandatos) !== M) return false;
      // O dono do último mandato é o único partido cujo votos ÷ q_M é exatamente um divisor usado.
      const div = divisorDe(p.contexto);
      const exatos = votos.map((v, i) => i).filter((i) => r.mandatos[i] > 0 && Math.abs(votos[i] / r.qM - div(r.mandatos[i] - 1)) < 1e-9);
      return exatos.length === 1 && p.opcoes[p.correta] === 'Partido ' + PARTIDOS[exatos[0]];
    },
    limites(p) {
      return p.dados.M >= 5 && p.dados.M <= 10 && p.dados.votos.every((v) => v >= 300 && v <= 12000);
    },
  });

  // ---------------------------------------------------------------- partilha proporcional fora das eleições
  // Os mesmos métodos (Hondt, St. Laguë) a repartir objetos por entidades de dimensões diferentes:
  // a dimensão (professores, alunos, pré-inscrições, trabalhadores) faz o papel dos votos.
  const CENARIOS_PARTILHA = {
    computadores: {
      item: 'computadores', um: 'computador', fem: false, grupo: 'departamento', dimensao: 'professores', dimFem: false,
      entidades: ['Matemática', 'Ciências', 'Línguas', 'Expressões', 'Humanidades'], min: 5, max: 60, passo: 1,
      o: (n) => 'o departamento de ' + n, ao: (n) => 'ao departamento de ' + n, de: (n) => 'do departamento de ' + n,
      abertura: (N, nomes, t) => 'Uma escola recebeu ' + N + ' computadores novos para repartir pelos departamentos de ' + listaPt(nomes) + ', que têm, respetivamente, ' + listaPt(t) + ' professores.',
    },
    bolsas: {
      item: 'bolsas', um: 'bolsa', fem: true, grupo: 'escola', dimensao: 'alunos', dimFem: false,
      entidades: ['Norte', 'Sul', 'Centro', 'Ribeira', 'Planalto'], min: 60, max: 900, passo: 10,
      o: (n) => 'a escola ' + n, ao: (n) => 'à escola ' + n, de: (n) => 'da escola ' + n,
      abertura: (N, nomes, t) => 'Um município tem ' + N + ' bolsas de estudo para repartir pelas escolas ' + listaPt(nomes) + ', que têm, respetivamente, ' + listaPt(t) + ' alunos no ensino secundário.',
    },
    vagas: {
      item: 'vagas', um: 'vaga', fem: true, grupo: 'turno', dimensao: 'pré-inscrições', dimFem: true, fixas: true,
      entidades: ['Manhã', 'Tarde', 'Noite'], min: 8, max: 90, passo: 1,
      o: (n) => 'o turno da ' + n.toLowerCase(), ao: (n) => 'ao turno da ' + n.toLowerCase(), de: (n) => 'do turno da ' + n.toLowerCase(),
      abertura: (N, nomes, t) => 'Um clube de natação abriu ' + N + ' vagas num curso de verão, a repartir pelos turnos da manhã, da tarde e da noite, que tiveram, respetivamente, ' + listaPt(t) + ' pré-inscrições.',
    },
    lugares: {
      item: 'lugares', um: 'lugar', fem: false, grupo: 'empresa', dimensao: 'trabalhadores', dimFem: false,
      entidades: ['Alfa', 'Beta', 'Gama', 'Delta', 'Sigma'], min: 15, max: 300, passo: 5,
      o: (n) => 'a empresa ' + n, ao: (n) => 'à empresa ' + n, de: (n) => 'da empresa ' + n,
      abertura: (N, nomes, t) => 'Um edifício de escritórios tem ' + N + ' lugares de estacionamento para repartir pelas empresas ' + listaPt(nomes) + ', que têm, respetivamente, ' + listaPt(t) + ' trabalhadores.',
    },
  };
  const qtdPartilha = (c) => (k) => fmt(k) + ' ' + (k === 1 ? c.um : c.item);
  const distPartilha = (nomes, m) => nomes.map((n, i) => n + ' ' + m[i]).join(' – ');
  const NOME_CURTO = { hondt: 'Hondt', stlague: 'St. Laguë' };

  // Dados sem empates perto do corte (pelo método pedido e pelo outro) e com Hondt ≠ St. Laguë.
  function dadosPartilha(rng, metodoFixo) {
    const cenario = escolher(rng, Object.keys(CENARIOS_PARTILHA));
    const c = CENARIOS_PARTILHA[cenario];
    const nomes = c.fixas ? c.entidades.slice() : baralhar(rng, c.entidades).slice(0, 3);
    const tamanhos = nomes.map(() => c.passo * inteiro(rng, c.min / c.passo, c.max / c.passo));
    if (new Set(tamanhos).size !== tamanhos.length) return null;
    const N = inteiro(rng, 6, 15);
    const metodo = metodoFixo || escolher(rng, ['hondt', 'stlague']);
    const outro = metodo === 'hondt' ? 'stlague' : 'hondt';
    const separado = (a, b) => a - b >= 0.01 * a;
    const q = distribuir(metodo, tamanhos, N + 2).atribuicoes.map((a) => a.quociente);
    if (!separado(q[N - 2], q[N - 1]) || !separado(q[N - 1], q[N]) || !separado(q[N], q[N + 1])) return null;
    const qo = distribuir(outro, tamanhos, N + 1).atribuicoes.map((a) => a.quociente);
    if (!separado(qo[N - 1], qo[N])) return null;
    const dist = distribuir(metodo, tamanhos, N);
    const distOutro = distribuir(outro, tamanhos, N).mandatos;
    if (dist.mandatos.every((k, i) => k === distOutro[i])) return null;
    return { cenario, c, nomes, tamanhos, N, metodo, outro, dist, distOutro, seguinte: distribuir(metodo, tamanhos, N + 1).atribuicoes[N] };
  }

  // Erros reais: o outro método, arredondar as quotas (só quando o total sai errado), Hamilton, parar antes, incluir o seguinte.
  // Cada erro: { codigo, m (distribuição), explicar(textoMostrado) }; o do outro método vem sempre primeiro.
  function errosPartilha(rng, d) {
    const { c, tamanhos, N, metodo, outro } = d;
    const T = soma(tamanhos);
    const quotas = tamanhos.map((t) => (N * t) / T);
    const qtd = qtdPartilha(c);
    const quota = 'quota = ' + N + ' × ' + c.dimensao + ' ÷ ' + fmt(T);
    const codigoOutro = { hondt: 'divisores_impares', stlague: 'divisores_hondt' }[metodo];
    const lista = [{
      codigo: codigoOutro,
      m: d.distOutro,
      explicar: (mostrado) => 'No ' + NOME_METODO[metodo] + ' os divisores são ' + (metodo === 'hondt' ? '1, 2, 3, 4, …' : 'os ímpares 1, 3, 5, 7, …') + '; usaste ' +
        (outro === 'hondt' ? '1, 2, 3, …' : '1, 3, 5, …') + ' (' + NOME_CURTO[outro] + '), que aqui dão ' + mostrado + ': uma distribuição diferente da do ' + NOME_METODO[metodo] + '.',
    }];
    const ambiguo = quotas.some((x) => Math.abs(x - Math.floor(x) - 0.5) < 0.01);
    const arred = quotas.map((x) => Math.round(x));
    if (!ambiguo && soma(arred) !== N) {
      lista.push({
        codigo: 'arredondou_as_quotas', m: arred,
        explicar: (mostrado) => 'Repartiste em proporção direta (' + quota + ') e arredondaste cada quota: isso dá ' + mostrado +
          ', mas arredondar todas as quotas dá ' + arred.join(' + ') + ' = ' + qtd(soma(arred)) + ', e são ' + N + '. Arredondar as quotas nem sempre respeita o total.',
      });
    }
    const restos = quotas.map((x) => x - Math.floor(x));
    const empateRestos = restos.some((r, i) => restos.some((s, j) => j !== i && Math.abs(r - s) < 0.01));
    const outros = [];
    if (!empateRestos) {
      outros.push({
        codigo: 'proporcional_restos_maiores', m: calc().restosMaiores(tamanhos, N).mandatos,
        explicar: (mostrado) => 'Repartiste em proporção direta (' + quota + ') e deste o que sobrava aos maiores restos: isso dá ' + mostrado + ', pelo método de Hamilton, não pelo ' + NOME_METODO[metodo] + '.',
      });
    }
    // Dar primeiro um a cada grupo e só depois repartir os restantes pelo método (total certo).
    const nG = tamanhos.length;
    const qUm = distribuir(metodo, tamanhos, N - nG + 1).atribuicoes.map((a) => a.quociente);
    if (N - nG >= 1 && qUm[N - nG - 1] - qUm[N - nG] >= 0.01 * qUm[N - nG - 1]) {
      outros.push({
        codigo: 'um_por_partido', m: distribuir(metodo, tamanhos, N - nG).mandatos.map((x) => x + 1),
        explicar: (mostrado) => 'Deste primeiro ' + (c.fem ? 'uma' : 'um') + ' ' + c.um + ' a cada ' + c.grupo + ' e só depois repartiste ' + (c.fem ? 'as ' : 'os ') + (N - nG) + ' ' + c.item + ' que sobravam: isso dá ' + mostrado + '. No ' + NOME_METODO[metodo] + ' não há nada garantido à partida: cada ' + c.um + ' vai para o maior quociente.',
      });
    }
    // Deixar de fora a coluna ÷ 1 (começar a dividir por 2 no Hondt, por 3 no St. Laguë): total certo.
    const salta = porDivisores(tamanhos, N + 1, (k) => divisorDe(metodo)(k + 1));
    if (salta.quocientes[N - 1] - salta.quocientes[N] >= 0.01 * salta.quocientes[N - 1]) {
      outros.push({
        codigo: 'saltou_o_divisor_1', m: porDivisores(tamanhos, N, (k) => divisorDe(metodo)(k + 1)).mandatos,
        explicar: (mostrado) => 'Começaste a dividir por ' + (metodo === 'hondt' ? '2 (2, 3, 4, …)' : '3 (3, 5, 7, …)') + ' e deixaste de fora a coluna ÷ 1: isso dá ' + mostrado + '. No ' + NOME_METODO[metodo] + ' os divisores começam em 1 (' + (metodo === 'hondt' ? '1, 2, 3, …' : '1, 3, 5, …') + '), e ' + (c.dimFem ? 'as ' : 'os ') + c.dimensao + ' de cada ' + c.grupo + ' (÷ 1) também entram na comparação.',
      });
    }
    // Proporção direta, arredondar para baixo e dar o que sobra ao maior grupo (total certo).
    const baixo = quotas.map((x) => Math.floor(x + 1e-9));
    const sobra = N - soma(baixo);
    const gMaior = tamanhos.indexOf(Math.max(...tamanhos));
    if (sobra >= 1) {
      outros.push({
        codigo: 'deu_as_sobras_ao_maior', m: baixo.map((x, i) => (i === gMaior ? x + sobra : x)),
        explicar: (mostrado) => 'Repartiste em proporção direta (' + quota + '), arredondaste para baixo e deste ' + (sobra === 1 ? (c.fem ? 'a ' : 'o ') + c.um + ' que sobrava ' : (c.fem ? 'as ' : 'os ') + qtd(sobra) + ' que sobravam ') + c.ao(d.nomes[gMaior]) + ', que tem mais ' + c.dimensao + ': isso dá ' + mostrado + '. No ' + NOME_METODO[metodo] + ' cada ' + c.um + ' vai para o maior quociente.',
      });
    }
    // Trocar os dois últimos quocientes na comparação: o N.º vai para quem tem o (N + 1).º (total certo).
    const ultimo = d.dist.atribuicoes[N - 1], seg = d.seguinte;
    if (ultimo.partido !== seg.partido) {
      const aprox = (q) => (Math.abs(q * 100 - Math.round(q * 100)) < 1e-6 ? '' : '≈ ') + fmt(q, 2);
      outros.push({
        codigo: 'trocou_o_ultimo_quociente', m: d.dist.mandatos.map((x, i) => x - (i === ultimo.partido ? 1 : 0) + (i === seg.partido ? 1 : 0)),
        explicar: (mostrado) => 'Trocaste os dois últimos quocientes, o que dá ' + mostrado + '. O ' + N + '.º maior quociente é ' + aprox(ultimo.quociente) + ' (' + d.nomes[ultimo.partido] + '); o seguinte, ' + aprox(seg.quociente) + ' (' + d.nomes[seg.partido] + '), já fica de fora. Por isso, ' + (c.fem ? 'a última ' : 'o último ') + c.um + ' vai ' + c.ao(d.nomes[ultimo.partido]) + ', e não ' + c.ao(d.nomes[seg.partido]) + '.',
      });
    }
    outros.push({
      codigo: 'parou_um_antes', m: distribuir(metodo, tamanhos, N - 1).mandatos,
      explicar: (mostrado) => 'Paraste um quociente antes: só repartiste ' + (N - 1) + (c.fem ? ' das ' : ' dos ') + N + ' ' + c.item + ', o que dá ' + mostrado + '.',
    });
    outros.push({
      codigo: 'incluiu_quociente_seguinte', m: distribuir(metodo, tamanhos, N + 1).mandatos,
      explicar: (mostrado) => 'Incluíste o ' + (N + 1) + '.º quociente, que já fica de fora: assim repartes ' + (N + 1) + ' ' + c.item + ' (' + mostrado + '), e são ' + N + '.',
    });
    return lista.concat(baralhar(rng, outros));
  }

  // Escolha: o outro método e mais 2 erros com o total certo. Quem não calcula pode usar a regra de bolso
  // «o Hondt dá mais aos grandes, o St. Laguë aos pequenos» (no maior ou no menor grupo); para cada par de
  // distratores calcula-se quanto essa regra acertaria (empates repartidos) e sorteia-se entre os pares em
  // que acerta menos. null se não houver 2 distratores distintos além do outro método.
  function escolhaPartilha(rng, d, cands, limite) {
    const { tamanhos, metodo, dist } = d;
    const chaveM = (m) => m.join(',');
    const vistos = new Set([chaveM(dist.mandatos)]);
    const unicos = cands.filter((e) => { const k = chaveM(e.m); if (vistos.has(k)) return false; vistos.add(k); return true; });
    if (unicos.length < 3) return null;
    const gMaior = tamanhos.indexOf(Math.max(...tamanhos)), gMenor = tamanhos.indexOf(Math.min(...tamanhos));
    // palpites pelo maior e pelo menor grupo: a opção que lhe dá mais, a que lhe dá menos e «nem uma nem outra»
    const palpites = (ms) => [gMaior, gMenor].flatMap((g) => {
      const v = ms.map((m) => m[g]);
      const mx = Math.max(...v), mn = Math.min(...v);
      const prob = (f) => { const n = v.filter(f).length; return !n ? 0.25 : f(v[0]) ? 1 / n : 0; };
      return [prob((x) => x === mx), prob((x) => x === mn), prob((x) => x !== mx && x !== mn)];
    });
    const pares = [];
    const u = unicos;
    for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) for (let l = j + 1; l < u.length; l++) {
      pares.push({ tres: [u[i], u[j], u[l]], p: palpites([dist.mandatos, u[i].m, u[j].m, u[l].m]) });
    }
    // Jogo contra os palpites (pesos multiplicativos): mistura de pares em que nenhum palpite acerta muito.
    let peso = pares[0].p.map(() => 1);
    const media = peso.map(() => 0), escolhidos = [];
    for (let t = 0; t < 40; t++) {
      const s = pares.map((x) => x.p.reduce((a, v, g) => a + v * peso[g], 0));
      const mn = Math.min(...s);
      const x = escolher(rng, pares.filter((_, i) => s[i] <= mn + 1e-12));
      escolhidos.push(x);
      x.p.forEach((v, g) => { media[g] += v; });
      peso = peso.map((w, g) => w * Math.exp(1.5 * x.p[g]));
      const tot = peso.reduce((a, b) => a + b, 0);
      peso = peso.map((w) => w / tot);
    }
    if (Math.max(...media) / escolhidos.length > limite) return null;
    return escolher(rng, escolhidos).tres;
  }

  // Quadro de quocientes com os nomes das entidades nas linhas; os N maiores a negrito.
  function passosPartilha(d) {
    const { c, nomes, tamanhos, N, metodo, dist, seguinte } = d;
    const div = divisorDe(metodo);
    const colunas = Math.max(...dist.mandatos) + 1;
    const cab = Array.from({ length: colunas }, (_, k) => '\\div ' + div(k)).join(' & ');
    const linhas = tamanhos.map((t, i) => txt(nomes[i]) + ' & ' + Array.from({ length: colunas }, (_, k) => {
      const q = tex(t / div(k), 2);
      return k < dist.mandatos[i] ? '\\mathbf{' + q + '}' : q;
    }).join(' & '));
    const ult = dist.atribuicoes[N - 1];
    return [
      {
        passo: 'Calcular os quocientes',
        porque: 'No ' + NOME_METODO[metodo] + ' dividem-se ' + (c.dimFem ? 'as ' : 'os ') + c.dimensao + ' de cada ' + c.grupo + ' por ' + (metodo === 'hondt' ? '1, 2, 3, …' : '1, 3, 5, … (os ímpares)') + '; a negrito estão os ' + N + ' maiores quocientes.',
        calculo: '\\begin{array}{c|' + 'c'.repeat(colunas) + '} & ' + cab + ' \\\\ \\hline ' + linhas.join(' \\\\ ') + ' \\end{array}',
        bloco: true,
      },
      {
        passo: 'Ver onde fica o corte',
        porque: (c.fem ? 'As ' : 'Os ') + N + ' ' + c.item + ' vão, ' + (c.fem ? 'uma a uma' : 'um a um') + ', para os ' + N + ' maiores quocientes; o seguinte já não recebe nada.',
        calculo: 'q_{' + N + '}' + igualOuAprox(ult.quociente, 2) + '\\ (' + txt(nomes[ult.partido]) + ') > q_{' + (N + 1) + '}' + igualOuAprox(seguinte.quociente, 2) + '\\ (' + txt(nomes[seguinte.partido]) + ')',
      },
    ];
  }

  // Verificação pelo método do divisor: com o divisor q_N cada entidade recebe ⌊t/q⌋ (Hondt) ou ⌊(t/q + 1)/2⌋ (St. Laguë).
  function verificacaoPartilha(d, i) {
    const { c, nomes, tamanhos, N, metodo } = d;
    const r = mandatosPorLimiar(tamanhos, N, metodo);
    const regra = metodo === 'hondt' ? 'a parte inteira de ' + c.dimensao + ' ÷ divisor' : 'a parte inteira de (' + c.dimensao + ' ÷ divisor + 1) ÷ 2';
    let calculo = definicaoQ(tamanhos, N, metodo, r) + ';\\quad ' + tamanhos.map((t) => parcelaDivisor(t, N, metodo)).join(' + ') + ' = ' + r.mandatos.join(' + ') + ' = ' + soma(r.mandatos);
    if (i !== null) calculo += ';\\quad ' + txt(nomes[i]) + ' = ' + r.mandatos[i];
    return {
      r,
      verificacao: {
        passo: 'Confirmar pelo método do divisor: com o divisor ' + (Math.abs(r.qM * 100 - Math.round(r.qM * 100)) < 1e-6 ? '' : '≈ ') + fmt(r.qM, 2) + ' (o ' + N + '.º quociente), cada ' + c.grupo + ' recebe ' + regra + ', e o total dá ' + N,
        calculo,
      },
    };
  }

  registar({
    subtema: 'hondt-stlague', tipo: 'partilha', nome: 'Partilha proporcional fora das eleições',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      // Escolha: o método sorteia-se uma vez por semente (os dados com 3 erros de total certo são mais raros no
      // Hondt, e re-sortear o método enviesaria a proporção). Nas primeiras 150 escolhas exige-se que nenhum
      // palpite pelo maior ou pelo menor grupo passe de 1/2; depois aceita-se o que houver.
      const metodoFixo = formato === 'escolha' ? escolher(rng, ['hondt', 'stlague']) : null;
      let n = 0;
      const construir = () => {
        const d = dadosPartilha(rng, metodoFixo);
        if (!d) return null;
        const { cenario, c, nomes, tamanhos, N, metodo, dist } = d;
        const qtd = qtdPartilha(c);
        const lista = errosPartilha(rng, d);
        const resolucao = passosPartilha(d);
        const enunciado = c.abertura(N, nomes, tamanhos.map((t) => fmt(t))) + ' A partilha faz-se pelo ' + NOME_METODO[metodo] + ', aplicado ao número de ' + c.dimensao + ' de cada ' + c.grupo + '.';
        const dados = { cenario, item: c.item, nomes, tamanhos, N, metodo };
        const vale = 'vale ' + (c.fem ? 'uma ' : 'um ') + c.um;
        if (formato === 'escolha') {
          resolucao.push({ passo: 'Contar ' + (c.fem ? 'as ' : 'os ') + c.item + ' de cada ' + c.grupo, porque: 'Cada quociente a negrito ' + vale + ' para ' + (c.fem ? 'a ' : 'o ') + c.grupo + ' dessa linha.', calculo: nomes.map((n, j) => txt(n) + ' = ' + dist.mandatos[j]).join(',\\ ') });
          const { r, verificacao } = verificacaoPartilha(d, null);
          // Só erros que repartem exatamente N (a soma não elimina nenhuma opção), escolhidos sem pista de método.
          const tres = escolhaPartilha(rng, d, lista.filter((e) => soma(e.m) === N), n++ < 150 ? 0.5 : 1);
          if (!tres) return null;
          const erros = tres.map((e) => { const t = distPartilha(nomes, e.m); return { codigo: e.codigo, texto: t, explicacao: e.explicar(t) }; });
          return fecharTexto(rng, {
            enunciado: enunciado + ' Como ficam ' + (c.fem ? 'repartidas as ' : 'repartidos os ') + N + ' ' + c.item + ' (' + nomes.join(' – ') + ')?',
            resolucao, verificacao, dados,
          }, distPartilha(nomes, dist.mandatos), erros, distPartilha(nomes, r.mandatos));
        }
        // Numérica: uma entidade em que o outro método dá outro número (≥ 1), para o erro do outro método estar sempre disponível.
        const comErro = nomes.map((_, j) => j).filter((j) => d.distOutro[j] !== dist.mandatos[j] && d.distOutro[j] >= 1);
        if (!comErro.length) return null;
        const i = escolher(rng, comErro);
        const k = dist.mandatos[i];
        resolucao.push({ passo: 'Contar ' + (c.fem ? 'as ' : 'os ') + c.item + ' ' + c.de(nomes[i]), porque: 'Cada quociente a negrito na linha de ' + nomes[i] + ' ' + vale + '.', calculo: txt(nomes[i]) + ' = ' + k });
        const { r, verificacao } = verificacaoPartilha(d, i);
        verificacao.valor = r.mandatos[i];
        // Regra 7: nenhum erro típico com valor 0.
        const erros = lista.filter((e) => e.m[i] >= 1).map((e) => ({ codigo: e.codigo, valor: e.m[i], explicacao: e.explicar(qtd(e.m[i]) + ' ' + c.ao(nomes[i])) }));
        dados.entidade = i;
        return fechar(rng, formato, {
          enunciado: enunciado + (c.fem ? ' Quantas ' : ' Quantos ') + c.item + ' recebe ' + c.o(nomes[i]) + '?',
          resolucao, dados,
        }, { resposta: k, tolerancia: 0, unidade: c.item, texto: qtd, erros, verificacao });
      };
      // Cada tentativa experimenta até 8 conjuntos de dados (no Hondt, só cerca de 1 em 7 tem 3 erros de total certo).
      return tentar(() => { for (let k = 0; k < 8; k++) { const r = construir(); if (r) return r; } return null; });
    },
    verificarIndependente(p) {
      const { cenario, nomes, tamanhos, N, metodo, entidade } = p.dados;
      const r = mandatosPorLimiar(tamanhos, N, metodo);
      if (soma(r.mandatos) !== N) return false;
      if (tamanhos.some((t, j) => mandatosPorDivisor(t, r.qM, metodo) !== r.mandatos[j])) return false;
      if (p.formato === 'escolha') return p.opcoes[p.correta] === distPartilha(nomes, r.mandatos);
      return confere(p, r.mandatos[entidade], qtdPartilha(CENARIOS_PARTILHA[cenario]));
    },
    limites(p) {
      const c = CENARIOS_PARTILHA[p.dados.cenario];
      return !!c && p.dados.N >= 6 && p.dados.N <= 15 && p.dados.tamanhos.every((t) => t >= c.min && t <= c.max);
    },
  });

  // ---------------------------------------------------------------- salários
  const TAXA_SS = 0.11;
  const AVISO_ILUSTRATIVO = '(Tabela ilustrativa do manual — não é a tabela oficial.)';

  function textoTabela(tabela) {
    let de = 0;
    return tabela.map((e) => {
      const s = (de === 0 ? 'até ' + fmt(e.ate) + ' € (inclusive)' : e.ate === Infinity ? 'mais de ' + fmt(de) + ' €' : 'mais de ' + fmt(de) + ' € até ' + fmt(e.ate) + ' €') + ': ' + pct(e.taxa);
      de = e.ate;
      return s;
    }).join('; ');
  }

  function descreverEscalao(tabela, i) {
    const de = i === 0 ? 0 : tabela[i - 1].ate;
    const e = tabela[i];
    return i === 0 ? 'até ' + fmt(e.ate) + ' €' : e.ate === Infinity ? 'mais de ' + fmt(de) + ' €' : 'mais de ' + fmt(de) + ' € até ' + fmt(e.ate) + ' €';
  }

  // Segundo método: procurar o escalão percorrendo a tabela (taxa sobre todo o bruto).
  function taxaRetencaoTabela(b) {
    for (const e of calc().TABELA_RETENCAO_ILUSTRATIVA) if (b <= e.ate) return e.taxa;
    return calc().TABELA_RETENCAO_ILUSTRATIVA.at(-1).taxa;
  }

  const limitesEur = (v, min, max) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

  registar({
    subtema: 'salarios', tipo: 'ss', nome: 'Contribuição para a Segurança Social',
    formatos: ['numerica', 'escolha'], contextos: ['mensal', 'anual'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const b = 10 * inteiro(rng, 80, 350);
        const nome = escolher(rng, NOMES);
        const s = C.salario(b);
        const anual = contexto === 'anual';
        const meses = 14;
        const ss = cent(anual ? C.salario(C.salarioAnual(b, meses)).ss : s.ss);
        const base = anual ? C.salarioAnual(b, meses) : b;
        const enunciado = nome + ' tem um salário bruto de ' + fmt(b) + ' € por mês. A taxa de contribuição do trabalhador para a Segurança Social é 11 % do salário bruto. ' +
          (anual ? 'Quanto desconta ' + nome + ' para a Segurança Social num ano (14 salários: 12 meses e os subsídios de férias e de Natal)?' : 'Quanto desconta ' + nome + ' por mês para a Segurança Social?') + ' Responde em euros, ao cêntimo.';
        const resolucao = [];
        if (anual) resolucao.push({ passo: 'Calcular o salário bruto anual', porque: 'Em Portugal recebem-se 14 salários por ano (12 meses e dois subsídios), e todos descontam.', calculo: tex(b) + ' \\times 14 = ' + tex(base) });
        resolucao.push(
          { passo: 'Escrever a taxa em forma decimal', porque: 'Uma percentagem divide-se por 100 para entrar nas contas.', calculo: '11\\,\\% = 0{,}11' },
          { passo: 'Aplicar a taxa ao salário bruto', porque: 'A contribuição incide sobre o salário bruto, antes de qualquer outro desconto.', calculo: tex(base) + ' \\times 0{,}11 = ' + texEur(ss) },
        );
        const resto = base - base * 0.89;
        const erros = [
          { codigo: 'taxa_1_1', valor: cent(base * 0.011), explicacao: '11 % escreve-se 0,11, não 0,011.' },
          { codigo: 'deu_o_restante', valor: cent(base * 0.89), explicacao: 'Esse é o valor que sobra depois do desconto (89 %); a contribuição é 11 % do bruto.' },
          { codigo: 'taxa_da_entidade', valor: cent(base * 0.2375), explicacao: '23,75 % é a taxa paga pela entidade empregadora; o trabalhador desconta 11 %.' },
        ];
        if (anual) {
          erros.unshift(
            { codigo: 'doze_meses', valor: cent(12 * s.ss), explicacao: 'O ano tem 14 salários (com os subsídios de férias e de Natal), e todos descontam para a Segurança Social.' },
            { codigo: 'so_um_mes', valor: cent(s.ss), explicacao: 'Esse é o desconto de um mês; pede-se o desconto do ano inteiro (14 salários).' },
          );
        }
        return fechar(rng, formato, { enunciado, resolucao, dados: { b, anual }, esquema: { id: 'salario', opcoes: { bruto: b } } }, {
          resposta: ss, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: 'Confirmar: o desconto mais o que sobra (89 %) tem de dar o bruto',
            calculo: tex(base) + ' - ' + tex(base) + ' \\times 0{,}89 = ' + tex(base) + ' - ' + texEur(base * 0.89) + ' = ' + texEur(resto),
            valor: cent(resto),
          },
        });
      });
    },
    verificarIndependente(p) {
      const base = p.dados.anual ? 14 * p.dados.b : p.dados.b;
      return confere(p, (Math.round(base * 100) * 11) / 10000, eur);
    },
    limites: (p) => p.dados.b >= 800 && p.dados.b <= 3500 && (p.formato !== 'numerica' || limitesEur(p.resposta, 80, 5400)),
  });

  registar({
    subtema: 'salarios', tipo: 'liquido', nome: 'Do salário bruto ao líquido (tabela ilustrativa)',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const T = C.TABELA_RETENCAO_ILUSTRATIVA;
        const b = 10 * inteiro(rng, 70, 400);
        const s = C.salario(b);
        const t = s.taxaRetencao;
        const iE = T.findIndex((e) => b <= e.ate);
        const ss = cent(s.ss);
        const ret = cent(s.retencao);
        const liq = cent(s.liquido);
        const nome = escolher(rng, NOMES);
        const enunciado = nome + ' tem um salário bruto de ' + fmt(b) + ' € por mês. Desconta 11 % para a Segurança Social e tem retenção na fonte de IRS segundo a tabela ilustrativa (taxa aplicada a todo o salário bruto): ' + textoTabela(T) + '. ' + AVISO_ILUSTRATIVO + ' Qual é o salário líquido mensal? Responde em euros, ao cêntimo.';
        const resolucao = [
          { passo: 'Segurança Social', porque: 'O trabalhador desconta 11 % do salário bruto.', calculo: tex(b) + ' \\times 0{,}11 = ' + texEur(ss) },
          { passo: 'Encontrar o escalão de retenção', porque: fmt(b) + ' € está no escalão ' + descreverEscalao(T, iE) + ', com taxa de ' + pct(t) + '.', calculo: '\\text{taxa} = ' + texPct(t) },
          { passo: 'Retenção na fonte', porque: 'Na tabela ilustrativa a taxa aplica-se a todo o salário bruto.', calculo: tex(b) + ' \\times ' + tex(t, 2) + ' = ' + texEur(ret) },
          ret > 0
            ? { passo: 'Subtrair os descontos', porque: 'O líquido é o bruto menos a Segurança Social e a retenção de IRS.', calculo: tex(b) + ' - ' + texEur(ss) + ' - ' + texEur(ret) + ' = ' + texEur(liq) }
            : { passo: 'Subtrair os descontos', porque: 'Sem retenção, o líquido é o bruto menos a Segurança Social.', calculo: tex(b) + ' - ' + texEur(ss) + ' = ' + texEur(liq) },
        ];
        const tVizinha = iE + 1 < T.length ? T[iE + 1].taxa : T[iE - 1].taxa;
        const erros = [
          { codigo: 'ss_depois_irs', valor: cent(b - ret - TAXA_SS * (b - ret)), explicacao: 'A Segurança Social incide sobre o bruto, não sobre o que sobra depois da retenção de IRS.' },
          { codigo: 'irs_depois_ss', valor: cent(b - ss - t * (b - ss)), explicacao: 'Na tabela ilustrativa a taxa de retenção aplica-se a todo o salário bruto, não ao valor depois da Segurança Social.' },
          { codigo: 'esqueceu_ss', valor: cent(b - ret), explicacao: 'Falta descontar os 11 % para a Segurança Social.' },
          { codigo: 'esqueceu_retencao', valor: cent(b - ss), explicacao: 'Falta descontar a retenção na fonte de IRS (' + pct(t) + ' do bruto).' },
          { codigo: 'escalao_errado', valor: cent(b - ss - tVizinha * b), explicacao: fmt(b) + ' € está no escalão ' + descreverEscalao(T, iE) + ': a taxa é ' + pct(t) + ', não ' + pct(tVizinha) + '.' },
          { codigo: 'so_descontos', valor: cent(ss + ret), explicacao: 'Esse valor é o total dos descontos; o líquido é o que fica depois de os subtrair ao bruto.' },
        ];
        const fator = 1 - TAXA_SS - t;
        return fechar(rng, formato, { enunciado, resolucao, dados: { b }, esquema: { id: 'salario', opcoes: { bruto: b } } }, {
          resposta: liq, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: 'Confirmar numa só conta: o líquido é ' + pct(fator) + ' do bruto',
            calculo: tex(b) + ' \\times (1 - 0{,}11' + (t > 0 ? ' - ' + tex(t, 2) : '') + ') = ' + tex(b) + ' \\times ' + tex(fator, 2) + ' = ' + texEur(b * fator),
            valor: cent(b * fator),
          },
        });
      });
    },
    verificarIndependente(p) {
      const b = p.dados.b;
      return confere(p, (Math.round(b * 100) * Math.round((1 - TAXA_SS - taxaRetencaoTabela(b)) * 100)) / 10000, eur);
    },
    limites: (p) => p.dados.b >= 700 && p.dados.b <= 4000 && (p.formato !== 'numerica' || limitesEur(p.resposta, 400, 3000)),
  });

  // Segundo método do IRS: R × taxa do escalão − parcela a abater.
  function irsParcelaAbater(R, escaloes) {
    let j = escaloes.findIndex((e) => R <= e.ate);
    if (j < 0) j = escaloes.length - 1;
    let abater = 0;
    let de = 0;
    const termos = [];
    for (let i = 0; i < j; i++) {
      termos.push({ largura: escaloes[i].ate - de, taxa: escaloes[i].taxa });
      abater += (escaloes[i].ate - de) * (escaloes[j].taxa - escaloes[i].taxa);
      de = escaloes[i].ate;
    }
    return { j, taxa: escaloes[j].taxa, abater, termos, imposto: R * escaloes[j].taxa - abater };
  }

  registar({
    subtema: 'salarios', tipo: 'irs-anual', nome: 'IRS anual por escalões (ilustrativos)',
    formatos: ['numerica', 'escolha'],
    gerar(semente, { formato, rng }) {
      return tentar(() => {
        const C = calc();
        const E = C.ESCALOES_IRS_ILUSTRATIVOS;
        const R = 500 * inteiro(rng, 18, 190);
        const irs = C.irsAnual(R, E);
        const imposto = cent(irs.imposto);
        const parcelas = irs.parcelas.filter((x) => x.base > 0);
        const enunciado = 'Com os escalões de IRS ilustrativos do manual (cada taxa aplica-se só à parte do rendimento dentro do escalão): ' + textoTabela(E) + '. ' + AVISO_ILUSTRATIVO + ' Qual é o IRS anual de um rendimento coletável de ' + fmt(R) + ' €? Responde em euros.';
        const resolucao = parcelas.map((x, i) => ({
          passo: (i + 1) + '.º escalão',
          porque: i === 0 ? 'A taxa do 1.º escalão aplica-se à parte do rendimento até ' + fmt(x.ate) + ' €.' : 'Esta taxa só incide sobre a parte do rendimento dentro deste escalão.',
          calculo: (i === 0 ? tex(x.base) : '(' + tex(Math.min(R, x.ate)) + ' - ' + tex(x.de) + ')') + ' \\times ' + tex(x.taxa, 2) + (i === 0 ? '' : ' = ' + tex(x.base) + ' \\times ' + tex(x.taxa, 2)) + ' = ' + texEur(x.valor),
        }));
        resolucao.push({ passo: 'Somar as parcelas', porque: 'O imposto é a soma do que se paga em cada escalão.', calculo: parcelas.map((x) => texEur(x.valor)).join(' + ') + ' = ' + texEur(imposto) });
        const ultimo = parcelas[parcelas.length - 1];
        const alt = irsParcelaAbater(R, E);
        const erros = [
          { codigo: 'taxa_unica_ultimo_escalao', valor: cent(R * ultimo.taxa), explicacao: 'Não se aplica a taxa do último escalão (' + pct(ultimo.taxa) + ') a todo o rendimento: cada taxa só incide sobre a parte dentro do seu escalão.' },
          { codigo: 'limites_em_vez_de_partes', valor: cent(soma(parcelas.map((x) => Math.min(R, x.ate) * x.taxa))), explicacao: 'Aplicaste cada taxa ao limite superior do escalão; aplica-se só à parte do rendimento entre o limite inferior e o superior.' },
          { codigo: 'so_ultimo_escalao', valor: cent(ultimo.valor), explicacao: 'Esse é só o imposto do último escalão; falta somar o dos escalões anteriores.' },
          { codigo: 'esqueceu_ultimo_escalao', valor: cent(irs.imposto - ultimo.valor), explicacao: 'Falta o imposto da parte do rendimento acima de ' + fmt(ultimo.de) + ' € (taxa de ' + pct(ultimo.taxa) + ').' },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { R } }, {
          resposta: imposto, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: alt.abater > 0
              ? 'Confirmar com a parcela a abater: aplica-se a taxa do escalão (' + pct(alt.taxa) + ') a todo o rendimento e abate-se D, o que assim se cobraria a mais em cada escalão abaixo (largura do escalão × diferença de taxas)'
              : 'Confirmar: o rendimento fica todo no 1.º escalão, por isso é só a taxa vezes o rendimento',
            calculo: (alt.abater > 0
              ? 'D = ' + alt.termos.map((t) => tex(t.largura) + ' \\times (' + tex(alt.taxa, 2) + ' - ' + tex(t.taxa, 2) + ')').join(' + ') + ' = ' + texEur(alt.abater) + ';\\quad ' + tex(R) + ' \\times ' + tex(alt.taxa, 2) + ' - ' + texEur(alt.abater)
              : tex(R) + ' \\times ' + tex(alt.taxa, 2)) + ' = ' + texEur(alt.imposto),
            valor: cent(alt.imposto),
          },
        });
      });
    },
    verificarIndependente(p) {
      return confere(p, irsParcelaAbater(p.dados.R, calc().ESCALOES_IRS_ILUSTRATIVOS).imposto, eur);
    },
    limites: (p) => p.dados.R >= 9000 && p.dados.R <= 95000,
  });

  registar({
    subtema: 'salarios', tipo: 'hora', nome: 'Salário por hora',
    formatos: ['numerica', 'escolha'], contextos: ['mensal', 'anual'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const C = calc();
        const Rm = 10 * inteiro(rng, 80, 300);
        const h = escolher(rng, [35, 36, 37, 38, 39, 40]);
        const exato = C.salarioHora(Rm, h);
        if (meioCentimo(exato)) return null;
        const valor = cent(exato);
        const anual = contexto === 'anual';
        const An = C.salarioAnual(Rm);
        const nome = escolher(rng, NOMES);
        const enunciado = (anual
          ? 'O contrato de ' + nome + ' prevê um salário bruto anual de ' + fmt(An) + ' €, pago em 14 meses (12 meses e os subsídios de férias e de Natal), e um horário de ' + h + ' horas por semana.'
          : 'O contrato de ' + nome + ' prevê ' + fmt(Rm) + ' € brutos por mês e um horário de ' + h + ' horas por semana.') + ' Usa a fórmula do manual: valor por hora = (Rm × 12) ÷ (52 × h), sendo Rm o salário mensal e h as horas semanais. Qual é o valor por hora? Arredonda às centésimas.';
        const resolucao = [];
        if (anual) resolucao.push({ passo: 'Calcular o salário mensal', porque: 'O salário anual corresponde a 14 pagamentos iguais.', calculo: '\\dfrac{' + tex(An) + '}{14} = ' + tex(Rm) });
        resolucao.push(
          { passo: 'Salário dos 12 meses de trabalho', porque: 'É a convenção da lei e do manual: o salário de 12 meses a dividir pelas horas de 52 semanas (os subsídios ficam de fora).', calculo: tex(Rm) + ' \\times 12 = ' + tex(Rm * 12) },
          { passo: 'Horas trabalhadas num ano', porque: 'Um ano tem 52 semanas.', calculo: '52 \\times ' + h + ' = ' + tex(52 * h) },
          { passo: 'Dividir o salário pelas horas', porque: 'O valor por hora é o que se recebe por cada hora de trabalho.', calculo: '\\dfrac{' + tex(Rm * 12) + '}{' + tex(52 * h) + '} \\approx ' + texEur(valor) },
        );
        const horasMes = (52 * h) / 12;
        const erros = [
          { codigo: 'quatro_semanas', valor: cent(Rm / (4 * h)), explicacao: 'Um mês não tem exatamente 4 semanas: usa-se 12 meses ÷ 52 semanas, ou seja, (salário × 12) ÷ (52 × horas semanais).' },
          { codigo: 'catorze_meses', valor: cent((Rm * 14) / (52 * h)), explicacao: anual ? 'Dividiste o salário anual (14 pagamentos) pelas horas do ano; os subsídios não são horas de trabalho: usa o salário mensal × 12.' : 'Os subsídios de férias e de Natal não correspondem a horas de trabalho: usa o salário mensal × 12, não × 14.' },
          { codigo: 'so_horas_semana', valor: cent(Rm / h), explicacao: 'Dividiste o salário de um mês pelas horas de uma semana; compara o salário de 12 meses com as horas de 52 semanas.' },
        ];
        if (anual) erros.push({ codigo: 'nao_dividiu_por_14', valor: cent((An * 12) / (52 * h)), explicacao: 'Usaste o salário anual como se fosse mensal; primeiro divide-se por 14.' });
        return fechar(rng, formato, { enunciado, resolucao, dados: { Rm, h, anual }, esquema: { id: 'salario', opcoes: { bruto: Rm } } }, {
          resposta: valor, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: 'às centésimas',
          verificacao: {
            passo: 'Confirmar pelas horas de um mês: 52 × ' + h + ' ÷ 12 horas por mês',
            calculo: '\\dfrac{52 \\times ' + h + '}{12} \\approx ' + tex(horasMes, 2) + ';\\quad \\dfrac{' + tex(Rm) + '}{' + tex(horasMes, 2) + '} \\approx ' + texEur(Rm / horasMes),
            valor: Rm / horasMes,
          },
        });
      });
    },
    verificarIndependente(p) {
      const { Rm, h } = p.dados;
      // Substituição: valor por hora × horas do ano ≈ salário de 12 meses.
      if (p.formato === 'numerica') return Math.abs(p.resposta * 52 * h - 12 * Rm) <= 52 * h * (p.tolerancia + 1e-9);
      return confere(p, Rm / ((52 * h) / 12), eur);
    },
    limites: (p) => p.dados.Rm >= 800 && p.dados.Rm <= 3000 && p.dados.h >= 35 && p.dados.h <= 40,
  });

  // ---------------------------------------------------------------- juros
  const TAXAS = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.06];
  const CAPITALIZACOES = { anual: 1, semestral: 2, trimestral: 4, mensal: 12 };
  const NOME_CAP = { 1: 'anual', 2: 'semestral', 4: 'trimestral', 12: 'mensal' };
  const PERIODO = { 1: 'ano', 2: 'semestre', 4: 'trimestre', 12: 'mês' };
  const ESQUEMA_JUROS = (C0, r, t, n) => ({ id: 'juros', opcoes: { capital: C0, taxa: Math.round(r * 1000) / 10, anos: t, periodosPorAno: n } });

  // Fator (1 + r/n) em LaTeX.
  const texFator = (r, n) => (n === 1 ? tex(1 + r, 4) : '\\left(1 + \\dfrac{' + tex(r, 4) + '}{' + n + '}\\right)');

  // Conta período a período (segundo método do juro composto).
  function periodoAPeriodo(C0, r, n, N) {
    const l = [];
    let m = C0;
    for (let k = 0; k < N; k++) { m *= 1 + r / n; l.push(m); }
    return l;
  }

  registar({
    subtema: 'juros', tipo: 'simples-montante', nome: 'Montante com juro simples',
    formatos: ['numerica', 'escolha'], contextos: ['deposito', 'emprestimo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const Cc = calc();
        const C0 = 100 * inteiro(rng, 5, 100);
        const r = escolher(rng, TAXAS);
        const t = inteiro(rng, 2, 10);
        const js = Cc.jurosSimples(C0, r, t);
        const M = cent(js.montante);
        const juroAno = C0 * r;
        const enunciado = contexto === 'deposito'
          ? 'Depositas ' + fmt(C0) + ' € a uma taxa anual de ' + pct(r) + ', em regime de juro simples, durante ' + t + ' anos. Qual é o montante no fim do prazo? Responde em euros, ao cêntimo.'
          : 'Pedes ' + fmt(C0) + ' € emprestados a uma taxa anual de ' + pct(r) + ', em regime de juro simples, para pagar tudo de uma vez ao fim de ' + t + ' anos. Quanto vais pagar? Responde em euros, ao cêntimo.';
        const resolucao = [
          { passo: 'Escrever a taxa em forma decimal', porque: 'Uma percentagem divide-se por 100 para entrar nas contas.', calculo: texPct(r) + ' = ' + tex(r, 4) },
          { passo: 'Juro de um ano', porque: 'No juro simples, o juro de cada ano calcula-se sempre sobre o capital inicial.', calculo: tex(C0) + ' \\times ' + tex(r, 4) + ' = ' + texEur(juroAno) },
          { passo: 'Juro de ' + t + ' anos', porque: 'Todos os anos rende o mesmo juro.', calculo: texEur(juroAno) + ' \\times ' + t + ' = ' + texEur(js.juro) },
          { passo: 'Somar ao capital', porque: 'O montante é o capital inicial mais os juros.', calculo: tex(C0) + ' + ' + texEur(js.juro) + ' = ' + texEur(M) },
        ];
        let acum = C0;
        for (let k = 0; k < t; k++) acum += juroAno;
        const erros = [
          { codigo: 'juro_composto', valor: cent(Cc.jurosCompostos(C0, r, t, 1).montante), explicacao: 'Usaste juro composto (o juro também rende juros); no juro simples o juro calcula-se sempre sobre o capital inicial.' },
          { codigo: 'so_juro', valor: cent(js.juro), explicacao: 'Esse é só o juro; o montante é o capital mais o juro.' },
          { codigo: 'juro_de_um_ano', valor: cent(C0 + juroAno), explicacao: 'Contaste o juro de um só ano; o capital rende juro durante ' + t + ' anos.' },
          { codigo: 'taxa_mal_convertida', valor: cent(C0 * (1 + 10 * r * t)), explicacao: pct(r) + ' escreve-se ' + fmt(r, 4) + ' em forma decimal (divide-se por 100).' },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { C0, r, t }, esquema: ESQUEMA_JUROS(C0, r, t, 1) }, {
          resposta: M, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: 'Confirmar ano a ano, somando ' + eur(juroAno) + ' por ano',
            calculo: 'C_1 = ' + tex(C0) + ' + ' + texEur(juroAno) + ' = ' + texEur(C0 + juroAno) + ',\\ \\ldots,\\ C_{' + t + '} = ' + texEur(acum),
            valor: acum,
          },
        });
      });
    },
    verificarIndependente(p) {
      const { C0, r, t } = p.dados;
      let m = C0;
      for (let k = 0; k < t; k++) m += C0 * r;
      return confere(p, m, eur);
    },
    limites: (p) => p.dados.C0 >= 500 && p.dados.C0 <= 10000 && p.dados.t >= 2 && p.dados.t <= 10 && TAXAS.includes(p.dados.r),
  });

  registar({
    subtema: 'juros', tipo: 'composto-montante', nome: 'Montante com juro composto',
    formatos: ['numerica', 'escolha'], contextos: ['anual', 'semestral', 'trimestral', 'mensal'],
    gerar(semente, { formato, contexto, rng }) {
      const n = CAPITALIZACOES[contexto];
      return tentar(() => {
        const Cc = calc();
        const C0 = 100 * inteiro(rng, 5, 100);
        const r = escolher(rng, TAXAS);
        const t = n === 1 ? inteiro(rng, 2, 10) : inteiro(rng, 1, 6);
        const N = n * t;
        const jc = Cc.jurosCompostos(C0, r, t, n);
        if (meioCentimo(jc.montante)) return null;
        const M = cent(jc.montante);
        const enunciado = 'Depositas ' + fmt(C0) + ' € a uma taxa anual de ' + pct(r) + ', em regime de juro composto com capitalização ' + NOME_CAP[n] + ', durante ' + t + (t === 1 ? ' ano' : ' anos') + '. Qual é o montante no fim do prazo? Arredonda ao cêntimo.';
        const resolucao = [];
        if (n > 1) {
          resolucao.push(
            { passo: 'Taxa por ' + PERIODO[n], porque: 'Com capitalização ' + NOME_CAP[n] + ', a taxa anual divide-se pelos ' + n + ' períodos do ano.', calculo: '\\dfrac{' + tex(r, 4) + '}{' + n + '}' + (Number.isInteger(Math.round(r / n * 1e8) / 1e8 * 1e4) ? ' = ' + tex(r / n, 4) : '') },
            { passo: 'Número de períodos', porque: 'Os juros juntam-se ao capital ' + n + ' vezes por ano.', calculo: n + ' \\times ' + t + ' = ' + N },
          );
        } else {
          resolucao.push({ passo: 'Fator de cada ano', porque: 'Em cada ano o capital fica multiplicado por 1 + taxa, porque o juro se junta ao capital.', calculo: '1 + ' + tex(r, 4) + ' = ' + tex(1 + r, 4) });
        }
        resolucao.push({ passo: 'Aplicar a fórmula do juro composto', porque: 'O capital é multiplicado pelo fator em cada um dos ' + N + ' períodos.', calculo: 'C_{' + N + '} = ' + tex(C0) + ' \\times ' + texFator(r, n) + '^{' + N + '} \\approx ' + texEur(M) });
        const passos = periodoAPeriodo(C0, r, n, N);
        const erros = [
          { codigo: 'juro_simples', valor: cent(Cc.jurosSimples(C0, r, t).montante), explicacao: 'Usaste juro simples; no juro composto o juro de cada período junta-se ao capital e também rende juros.' },
          n > 1 ? { codigo: 'taxa_anual_por_periodo', valor: cent(C0 * Math.pow(1 + r, N)), explicacao: 'A taxa é anual: com capitalização ' + NOME_CAP[n] + ' divide-se por ' + n + ' antes de a aplicar a cada período.' } : null,
          n > 1 ? { codigo: 'expoente_em_anos', valor: cent(C0 * Math.pow(1 + r / n, t)), explicacao: 'O expoente é o número de períodos (' + N + '), não o número de anos.' } : null,
          n > 1 ? { codigo: 'capitalizacao_anual', valor: cent(Cc.jurosCompostos(C0, r, t, 1).montante), explicacao: 'Calculaste com capitalização anual; aqui os juros juntam-se ao capital ' + n + ' vezes por ano.' } : null,
          { codigo: 'so_juro', valor: cent(jc.montante - C0), explicacao: 'Esse é só o juro; o montante é o capital mais o juro.' },
          { codigo: 'periodo_a_menos', valor: cent(C0 * Math.pow(1 + r / n, N - 1)), explicacao: 'Faltou um período: o capital é multiplicado pelo fator ' + N + ' vezes.' },
        ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { C0, r, t, n }, esquema: ESQUEMA_JUROS(C0, r, t, n) }, {
          resposta: M, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: 'Confirmar ' + PERIODO[n] + ' a ' + PERIODO[n] + ', juntando o juro ao capital em cada período',
            calculo: 'C_1 = ' + tex(C0) + ' \\times ' + texFator(r, n) + ' \\approx ' + texEur(passos[0]) + ',\\ C_2 \\approx ' + texEur(passos[1]) + ',\\ \\ldots,\\ C_{' + N + '} \\approx ' + texEur(passos[N - 1]),
            valor: passos[N - 1],
          },
        });
      });
    },
    verificarIndependente(p) {
      const { C0, r, t, n } = p.dados;
      const l = periodoAPeriodo(C0, r, n, n * t);
      return confere(p, l[l.length - 1], eur);
    },
    limites: (p) => p.dados.C0 >= 500 && p.dados.C0 <= 10000 && p.dados.t >= 1 && p.dados.t <= 10 && TAXAS.includes(p.dados.r) && [1, 2, 4, 12].includes(p.dados.n),
  });

  registar({
    subtema: 'juros', tipo: 'capital-inicial', nome: 'Capital inicial (problema inverso)',
    formatos: ['numerica', 'escolha'], contextos: ['simples', 'composto'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const Cc = calc();
        const C0 = 100 * inteiro(rng, 5, 100);
        const r = escolher(rng, TAXAS);
        const simples = contexto === 'simples';
        const n = simples ? 1 : escolher(rng, [1, 2, 4, 12]);
        const t = inteiro(rng, 2, simples ? 10 : 8);
        const N = n * t;
        const Mexato = simples ? Cc.jurosSimples(C0, r, t).montante : Cc.jurosCompostos(C0, r, t, n).montante;
        if (meioCentimo(Mexato)) return null;
        const M = cent(Mexato);
        const exato = simples ? Cc.capitalInicialSimples(M, r, t) : Cc.capitalInicialComposto(M, r, t, n);
        if (meioCentimo(exato)) return null;
        const C = cent(exato);
        const g = simples ? 1 + r * t : Math.pow(1 + r / n, N);
        const enunciado = 'Que capital deves depositar hoje, a uma taxa anual de ' + pct(r) + ' em regime de ' + (simples ? 'juro simples' : 'juro composto com capitalização ' + NOME_CAP[n]) + ', para teres ' + eur(M) + ' daqui a ' + t + ' anos? Arredonda ao cêntimo.';
        const resolucao = simples
          ? [
            { passo: 'Escrever a fórmula do montante', porque: 'No juro simples o montante é o capital multiplicado por 1 + taxa × anos.', calculo: 'M = C \\times (1 + r \\times t)' },
            { passo: 'Calcular o fator', porque: 'Junta-se ao capital o juro de todos os anos.', calculo: '1 + ' + tex(r, 4) + ' \\times ' + t + ' = ' + tex(g, 4) },
            { passo: 'Dividir o montante pelo fator', porque: 'Para obter o capital desfaz-se a multiplicação, dividindo.', calculo: 'C = \\dfrac{' + texEur(M) + '}{' + tex(g, 4) + '} \\approx ' + texEur(C) },
          ]
          : [
            { passo: 'Escrever a fórmula do montante', porque: 'No juro composto o capital é multiplicado pelo fator em cada um dos ' + N + ' períodos.', calculo: 'M = C \\times ' + texFator(r, n) + '^{' + N + '}' },
            { passo: 'Calcular o fator', porque: 'O fator total é o fator de cada período elevado ao número de períodos.', calculo: texFator(r, n) + '^{' + N + '} \\approx ' + tex(g, 6) },
            { passo: 'Dividir o montante pelo fator', porque: 'Para obter o capital desfaz-se a multiplicação, dividindo.', calculo: 'C = \\dfrac{' + texEur(M) + '}{' + tex(g, 6) + '} \\approx ' + texEur(C) },
          ];
        // Segundo método: desfazer a capitalização período a período (composto) ou retirar o juro (simples).
        let indep = M;
        if (simples) indep = (M * 100) / (100 + 100 * r * t);
        else for (let k = 0; k < N; k++) indep /= 1 + r / n;
        const erros = simples
          ? [
            { codigo: 'subtraiu_percentagem', valor: cent(M * (1 - r * t)), explicacao: 'Retirar ' + pct(r * t) + ' ao montante não dá o capital: os juros foram calculados sobre o capital, por isso divide-se por ' + fmt(g, 4) + '.' },
            { codigo: 'multiplicou_pelo_fator', valor: cent(M * g), explicacao: 'Multiplicaste pelo fator; para voltar ao capital divide-se.' },
            { codigo: 'inverso_composto', valor: cent(M / Math.pow(1 + r, t)), explicacao: 'Usaste a fórmula do juro composto; aqui o regime é de juro simples.' },
            { codigo: 'deu_o_juro', valor: cent(M - C), explicacao: 'Esse é o juro; pede-se o capital a depositar.' },
          ]
          : [
            { codigo: 'multiplicou_pelo_fator', valor: cent(M * g), explicacao: 'Multiplicaste pelo fator; para voltar ao capital divide-se.' },
            { codigo: 'subtraiu_taxa', valor: cent(M * Math.pow(1 - r / n, N)), explicacao: 'Multiplicar por (1 − taxa) não desfaz o aumento: divide-se pelo fator (1 + taxa).' },
            { codigo: 'inverso_juro_simples', valor: cent(M / (1 + r * t)), explicacao: 'Usaste a fórmula do juro simples; aqui os juros também rendem juros (juro composto).' },
            n > 1 ? { codigo: 'taxa_anual_por_periodo', valor: cent(M / Math.pow(1 + r, N)), explicacao: 'A taxa é anual: com capitalização ' + NOME_CAP[n] + ' divide-se por ' + n + ' antes de a aplicar.' } : null,
            n > 1 ? { codigo: 'expoente_em_anos', valor: cent(M / Math.pow(1 + r / n, t)), explicacao: 'O expoente é o número de períodos (' + N + '), não o número de anos.' } : null,
            { codigo: 'deu_o_juro', valor: cent(M - C), explicacao: 'Esse é o juro; pede-se o capital a depositar.' },
          ];
        return fechar(rng, formato, { enunciado, resolucao, dados: { M, r, t, n, simples }, esquema: ESQUEMA_JUROS(C0, r, t, n) }, {
          resposta: C, tolerancia: TOL_EUR, unidade: '€', texto: eur, erros, arredondamento: ARRED_EUR,
          verificacao: {
            passo: simples ? 'Confirmar fazendo a conta ao contrário: o capital mais os juros dá o montante' : 'Confirmar desfazendo a capitalização ' + PERIODO[n] + ' a ' + PERIODO[n] + ' (dividir ' + N + ' vezes pelo fator)',
            calculo: simples
              ? texEur(C) + ' \\times ' + tex(g, 4) + ' \\approx ' + texEur(C * g)
              : '\\dfrac{' + texEur(M) + '}{' + texFator(r, n) + '} \\approx ' + texEur(M / (1 + r / n)) + ',\\ \\ldots \\approx ' + texEur(indep),
            valor: indep,
          },
        });
      });
    },
    verificarIndependente(p) {
      const { M, r, t, n, simples } = p.dados;
      const g = simples ? 1 + r * t : Math.pow(1 + r / n, n * t);
      // Substituição: o capital, capitalizado, tem de dar o montante (que foi arredondado ao cêntimo).
      if (p.formato === 'numerica') return Math.abs(p.resposta * g - M) <= (p.tolerancia + 1e-9) * g;
      let c = M;
      for (let k = 0; k < (simples ? 0 : n * t); k++) c /= 1 + r / n;
      if (simples) c = M - (M * r * t) / (1 + r * t);
      return confere(p, c, eur);
    },
    limites: (p) => p.dados.M >= 500 && p.dados.M <= 20000 && TAXAS.includes(p.dados.r) && p.dados.t >= 2 && p.dados.t <= 10,
  });
})();
