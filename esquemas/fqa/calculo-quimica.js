globalThis.Manual = globalThis.Manual || {};

// Cálculos de Química do 10.º ano (funções puras). Valores de referência só de Manual.dadosQuimicos.
Manual.quimica = (function () {
  const D = () => {
    if (!Manual.dadosQuimicos) throw new Error('quimica: Manual.dadosQuimicos não carregado');
    return Manual.dadosQuimicos;
  };
  const K = () => D().constantes;

  const positivo = (v, nome) => {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`quimica: ${nome} tem de ser positivo`);
    return v;
  };
  const inteiroPositivo = (v, nome) => {
    if (!Number.isInteger(v) || v < 1) throw new Error(`quimica: ${nome} tem de ser um inteiro positivo`);
    return v;
  };

  // ---------- massas e quantidade de matéria ----------

  // Média pesada pelas abundâncias (em % ou em fração: divide-se pela soma).
  function massaAtomicaMedia(isotopos) {
    if (!Array.isArray(isotopos) || isotopos.length === 0) throw new Error('quimica: lista de isótopos vazia');
    let soma = 0, pesos = 0;
    for (const i of isotopos) {
      soma += i.massa * i.abundancia;
      pesos += i.abundancia;
    }
    return soma / positivo(pesos, 'a soma das abundâncias');
  }

  // formula: { H: 2, O: 1 } → g/mol, arredondado às centésimas (as massas da TP têm 2 casas)
  function massaMolar(formula) {
    const simbolos = Object.keys(formula || {});
    if (simbolos.length === 0) throw new Error('quimica: fórmula vazia');
    let M = 0;
    for (const s of simbolos) {
      const e = D().elementos[s];
      if (!e) throw new Error(`quimica: elemento desconhecido ${s}`);
      inteiroPositivo(formula[s], `o índice de ${s} (inteiro)`);
      M += formula[s] * e.massaAtomica;
    }
    return Math.round(M * 100) / 100;
  }

  const nDeMassa = (m, M) => m / positivo(M, 'M');
  const naoNegativo = (v, nome) => {
    if (!Number.isFinite(v) || v < 0) throw new Error(`quimica: ${nome} tem de ser um número não negativo`);
    return v;
  };
  const massaDeN = (n, M) => naoNegativo(n, 'n') * positivo(M, 'M');
  const entidades = (n) => n * K().NA;
  const nDeEntidades = (N) => N / K().NA;
  function atomosNaAmostra(n, formula, simbolo) {
    naoNegativo(n, 'n');
    if (!formula || typeof formula !== 'object') throw new Error('quimica: fórmula inválida');
    const indice = formula[simbolo] === undefined ? 0 : formula[simbolo];
    if (indice !== 0) inteiroPositivo(indice, `o índice de ${simbolo}`);
    return n * indice * K().NA;
  }

  // ---------- radiação e átomo de hidrogénio ----------

  // E = h f; c = λ f. Dá-se f ou λ (em m), nunca os dois.
  function energiaFotao({ f, lambda } = {}) {
    const temF = f !== undefined, temL = lambda !== undefined;
    if (temF === temL) throw new Error('quimica: energiaFotao precisa de f ou de lambda (só um)');
    const { h, c } = K();
    if (temF) {
      positivo(f, 'f');
      return { E: h * f, f, lambda: c / f };
    }
    positivo(lambda, 'lambda');
    const fr = c / lambda;
    return { E: h * fr, f: fr, lambda };
  }

  function zonaEspectro(lambda) {
    positivo(lambda, 'lambda');
    const z = D().espectro.find((x) => lambda >= x.min && lambda < x.max);
    return z.zona;
  }

  const energiaNivelH = (n) => K().EnH / (inteiroPositivo(n, 'n') ** 2);

  const SERIES = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen' };

  // ΔE = E(nf) − E(ni): negativo na emissão, positivo na absorção. λ = hc/|ΔE| (m).
  function transicaoH(ni, nf) {
    inteiroPositivo(ni, 'ni');
    inteiroPositivo(nf, 'nf');
    if (ni === nf) throw new Error('quimica: transição sem mudança de nível');
    const deltaE = energiaNivelH(nf) - energiaNivelH(ni);
    const { h, c } = K();
    return {
      deltaE,
      tipo: nf < ni ? 'emissao' : 'absorcao',
      serie: SERIES[Math.min(ni, nf)] || null,
      lambda: h * c / Math.abs(deltaE),
    };
  }

  // ---------- configurações eletrónicas (Z ≤ 23) ----------

  const ORDEM = [
    { nome: '1s', n: 1, l: 0 }, { nome: '2s', n: 2, l: 0 }, { nome: '2p', n: 2, l: 1 },
    { nome: '3s', n: 3, l: 0 }, { nome: '3p', n: 3, l: 1 }, { nome: '4s', n: 4, l: 0 },
    { nome: '3d', n: 3, l: 2 },
  ];
  const Z_MAX = 23;
  const NUM_ORBITAIS = [1, 3, 5];
  const GASES_NOBRES = [['He', 2], ['Ne', 10], ['Ar', 18]];

  // Regra de Hund: primeiro um eletrão em cada orbital, depois emparelha.
  function caixasDe(sub, e) {
    const k = NUM_ORBITAIS[sub.l];
    const orbitais = Array.from({ length: k }, () => []);
    for (let i = 0; i < e; i++) orbitais[i % k].push(i < k ? '↑' : '↓');
    return { subnivel: sub.nome, orbitais };
  }

  function configuracao(z, carga = 0) {
    if (!Number.isInteger(z) || z < 1) throw new Error('quimica: Z tem de ser um inteiro positivo');
    if (z > Z_MAX) throw new Error(`quimica: configuracao só até Z = ${Z_MAX}`);
    if (!Number.isInteger(carga)) throw new Error('quimica: carga tem de ser inteira');
    const total = z - carga;
    if (total < 1 || total > Z_MAX) throw new Error(`quimica: carga inválida (${total} eletrões)`);

    // Átomo neutro pela ordem de preenchimento; catião: tira de maior n (4s antes de 3d), e em
    // igualdade de n, de maior l; anião: continua o preenchimento.
    const ocup = ORDEM.map(() => 0);
    const preencher = (nEl) => {
      let resto = nEl;
      for (let i = 0; i < ORDEM.length && resto > 0; i++) {
        const cap = 2 * NUM_ORBITAIS[ORDEM[i].l];
        const add = Math.min(cap - ocup[i], resto);
        ocup[i] += add;
        resto -= add;
      }
    };
    preencher(z);
    if (carga < 0) preencher(-carga);
    for (let tirar = carga; tirar > 0; tirar--) {
      let melhor = -1;
      ORDEM.forEach((s, i) => {
        if (ocup[i] === 0) return;
        if (melhor === -1 || s.n > ORDEM[melhor].n || (s.n === ORDEM[melhor].n && s.l > ORDEM[melhor].l)) melhor = i;
      });
      ocup[melhor]--;
    }

    const usados = ORDEM.map((s, i) => ({ s, e: ocup[i] })).filter((x) => x.e > 0);
    const subniveis = usados.map((x) => ({ nome: x.s.nome, eletroes: x.e }));
    const caixas = usados.map((x) => caixasDe(x.s, x.e));
    const escrever = (lista) => lista.map((x) => x.nome + '^' + x.eletroes).join(' ');

    // Cerne: maior gás nobre com menos eletrões que a espécie e cujos subníveis estão todos completos.
    let cerne = null;
    for (const [sim, nG] of GASES_NOBRES) {
      if (nG >= total) continue;
      let conta = 0, completo = true;
      for (let i = 0; i < ORDEM.length && conta < nG; i++) {
        const cap = 2 * NUM_ORBITAIS[ORDEM[i].l];
        if (ocup[i] !== cap) completo = false;
        conta += cap;
      }
      if (completo && conta === nG) cerne = { sim, nG };
    }
    let resto = subniveis, valencia = total;
    if (cerne) {
      let conta = 0;
      resto = subniveis.filter((x) => {
        const dentro = conta < cerne.nG;
        conta += x.eletroes;
        return !dentro;
      });
      valencia = total - cerne.nG;
    }

    let desemparelhados = 0, orbitaisOcupadas = 0;
    for (const c of caixas) {
      for (const o of c.orbitais) {
        if (o.length > 0) orbitaisOcupadas++;
        if (o.length === 1) desemparelhados++;
      }
    }

    return {
      subniveis,
      caixas,
      spd: escrever(subniveis),
      cerne: cerne ? `[${cerne.sim}] ${escrever(resto)}` : escrever(subniveis),
      valencia,
      desemparelhados,
      orbitaisOcupadas,
    };
  }

  // Grupo (1–18), período e bloco a partir da configuração do átomo neutro.
  // Z ≤ 23: derivada da configuração; Z = 24–36: lida dos dados (configuracao só vai até 23).
  function posicaoTP(z) {
    if (!Number.isInteger(z) || z < 1 || z > 36) throw new Error('quimica: posicaoTP só para Z = 1–36');
    if (z > Z_MAX) {
      const e = Object.values(D().elementos).find((x) => x.z === z);
      return { grupo: e.grupo, periodo: e.periodo, bloco: e.bloco };
    }
    const c = configuracao(z);
    const ultimo = c.subniveis[c.subniveis.length - 1].nome;
    const bloco = ultimo.slice(-1);
    const periodo = Math.max(...c.subniveis.map((x) => Number(x.nome[0])));
    const deCamada = (letra) => c.subniveis
      .filter((x) => x.nome === periodo + letra).reduce((t, x) => t + x.eletroes, 0);
    let grupo;
    if (bloco === 's') grupo = z === 2 ? 18 : deCamada('s'); // He: 1s², bloco s, grupo 18
    else if (bloco === 'p') grupo = 10 + deCamada('s') + deCamada('p');
    else grupo = deCamada('s') + c.subniveis.find((x) => x.nome === (periodo - 1) + 'd').eletroes;
    return { grupo, periodo, bloco };
  }

  // ---------- AL: densidade relativa de um metal (picnómetro) ----------

  // m(metal) = mComMetal − mPicnometroVazio; m(água com o volume do metal) = mComAgua + m(metal) − mComMetalEAgua
  function densidadeRelativa({ mPicnometroVazio, mComAgua, mComMetal, mComMetalEAgua }) {
    const mMetal = positivo(mComMetal - mPicnometroVazio, 'a massa do metal');
    const mAgua = positivo(mComAgua + mMetal - mComMetalEAgua, 'a massa de água deslocada');
    return mMetal / mAgua;
  }

  // ---------- soluções ----------

  const parte = (a, b, nome) => {
    positivo(b, nome);
    if (a < 0 || a > b) throw new Error('quimica: a parte não pode exceder o todo');
    return a / b;
  };
  const concentracao = (n, V) => n / positivo(V, 'V');
  const concentracaoMassica = (m, V) => m / positivo(V, 'V');
  const percentagemMassa = (mSoluto, mSolucao) => 100 * parte(mSoluto, mSolucao, 'a massa da solução');
  const percentagemVolume = (vSoluto, vSolucao) => 100 * parte(vSoluto, vSolucao, 'o volume da solução');
  const ppm = (mSoluto, mSolucao) => 1e6 * parte(mSoluto, mSolucao, 'a massa da solução');

  // ci·Vi = cf·Vf: falta exatamente um valor; fator = ci/cf = Vf/Vi (≥ 1 numa diluição).
  function diluicao(dados) {
    const nomes = ['ci', 'Vi', 'cf', 'Vf'];
    const v = {};
    const falta = nomes.filter((k) => dados[k] === undefined);
    if (falta.length !== 1) throw new Error('quimica: diluicao precisa de exatamente três dos valores ci, Vi, cf, Vf');
    for (const k of nomes) if (dados[k] !== undefined) v[k] = positivo(dados[k], k);
    const k = falta[0];
    if (k === 'ci') v.ci = v.cf * v.Vf / v.Vi;
    else if (k === 'Vi') v.Vi = v.cf * v.Vf / v.ci;
    else if (k === 'cf') v.cf = v.ci * v.Vi / v.Vf;
    else v.Vf = v.ci * v.Vi / v.cf;
    const fator = v.ci / v.cf;
    if (fator < 1 - 1e-12) throw new Error('quimica: fator de diluição menor que 1');
    return { ci: v.ci, Vi: v.Vi, cf: v.cf, Vf: v.Vf, fator };
  }

  // ---------- gases (PTN) ----------

  const volumeGasPTN = (n) => n * K().Vm;
  const nDeVolumePTN = (V) => V / K().Vm;
  const massaVolumicaGas = (M) => M / K().Vm; // g/dm³
  const fracaoMolar = (nI, nTotal) => parte(nI, nTotal, 'a quantidade total');

  // ---------- entalpia de reação e fotoquímica ----------

  function somaLigacoes(lista) {
    let s = 0;
    for (const [chave, n] of Object.entries(lista || {})) {
      const l = D().ligacoes[chave];
      if (!l) throw new Error(`quimica: ligação desconhecida ${chave}`);
      s += n * l.energia;
    }
    return s;
  }

  // ΔH ≈ Σ E(ligações quebradas) − Σ E(ligações formadas), em kJ/mol
  function deltaHLigacoes({ quebradas, formadas }) {
    const somaQuebradas = somaLigacoes(quebradas);
    const somaFormadas = somaLigacoes(formadas);
    return { somaQuebradas, somaFormadas, deltaH: somaQuebradas - somaFormadas };
  }

  // λ máximo (m) de um fotão capaz de quebrar uma ligação: E por molécula = E(kJ/mol)·1000/NA
  function lambdaParaQuebrarLigacao(energiaKJmol) {
    const { h, c, NA } = K();
    const porMolecula = positivo(energiaKJmol, 'a energia de ligação') * 1000 / NA;
    return h * c / porMolecula;
  }

  // ---------- energia potencial de uma ligação (modelo de Morse, ilustrativo) ----------

  // Constante de forma ilustrativa: a = MORSE_K / r_e. Escolhida para a curva ter o aspeto dos manuais
  // (poço estreito à esquerda, patamar suave à direita); não é o ajuste espectroscópico de cada molécula.
  const MORSE_K = 1.8;

  // V(r) = De[(1 − e^(−a(r − re)))² − 1]; De = energia de ligação (kJ/mol) e re = comprimento de ligação (pm)
  // da tabela de ligações; r em pm. Zero de energia = átomos separados (r → ∞).
  function potencialMorse(chave, r) {
    const l = D().ligacoes[chave];
    if (!l) throw new Error(`quimica: ligação desconhecida ${chave}`);
    const De = l.energia, re = l.comprimento, a = MORSE_K / re;
    const x = 1 - Math.exp(-a * (positivo(r, 'a distância') - re));
    return { V: De * (x * x - 1), De, re, a };
  }

  return {
    potencialMorse, MORSE_K,
    massaAtomicaMedia, massaMolar, nDeMassa, massaDeN, entidades, nDeEntidades, atomosNaAmostra,
    energiaFotao, zonaEspectro, energiaNivelH, transicaoH,
    configuracao, posicaoTP, densidadeRelativa, Z_MAX_CONFIG: Z_MAX,
    concentracao, concentracaoMassica, percentagemMassa, percentagemVolume, ppm, diluicao,
    volumeGasPTN, nDeVolumePTN, massaVolumicaGas, fracaoMolar,
    deltaHLigacoes, lambdaParaQuebrarLigacao,
  };
})();
