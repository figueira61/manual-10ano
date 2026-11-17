globalThis.Manual = globalThis.Manual || {};

// Cálculos de Física do 10.º ano (funções puras). Valores de referência só de Manual.dadosFisica.
// Convenções: W = F d cos α (sinal dado pelo ângulo); W_P = −ΔEpg; W_FR = ΔEc; W_FNC = ΔEm;
// Q > 0 quando o corpo recebe energia (ΔU = W + Q + R, positivos quando o sistema recebe energia).
Manual.fisica = (function () {
  const D = () => {
    if (!Manual.dadosFisica) throw new Error('fisica: Manual.dadosFisica não carregado');
    return Manual.dadosFisica;
  };
  const g = () => D().constantes.g;

  const numero = (v, nome) => {
    if (!Number.isFinite(v)) throw new Error(`fisica: ${nome} tem de ser um número`);
    return v;
  };
  const positivo = (v, nome) => {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`fisica: ${nome} tem de ser positivo`);
    return v;
  };
  const naoNegativo = (v, nome) => {
    if (!Number.isFinite(v) || v < 0) throw new Error(`fisica: ${nome} tem de ser um número não negativo`);
    return v;
  };
  const lista = (rs, nome) => {
    if (!Array.isArray(rs) || rs.length === 0) throw new Error(`fisica: ${nome} tem de ser uma lista não vazia`);
    return rs;
  };
  // tira o ruído de vírgula flutuante (0,6400000000000001 → 0,64), sem mexer em valores reais
  const limpo = (x) => (x === 0 ? 0 : Number(x.toPrecision(12)));

  // ---------- energia mecânica e trabalho ----------

  const ec = (m, v) => 0.5 * positivo(m, 'm') * numero(v, 'v') ** 2;
  const epg = (m, h) => positivo(m, 'm') * g() * numero(h, 'h');
  const em = (m, v, h) => ec(m, v) + epg(m, h);
  const vDeEc = (Ec, m) => Math.sqrt((2 * naoNegativo(Ec, 'Ec')) / positivo(m, 'm'));

  // cos α em graus, exato nos ângulos notáveis (cos 90° = 0, não 6 × 10⁻¹⁷)
  function cosGraus(a) {
    const r = ((numero(a, 'o ângulo') % 360) + 360) % 360;
    const exatos = { 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1, 240: -0.5, 270: 0, 300: 0.5 };
    return r in exatos ? exatos[r] : Math.cos((r * Math.PI) / 180);
  }
  // F e d são intensidades (≥ 0); o sinal de W vem só do ângulo α entre a força e o deslocamento.
  const trabalho = (Fm, d, alfaGraus) => limpo(naoNegativo(Fm, 'F') * naoNegativo(d, 'd') * cosGraus(alfaGraus));

  // Distância de travagem num plano horizontal só com a força de atrito: Fa d = Ec0.
  function travagem({ m, v0, Fa } = {}) {
    return ec(m, naoNegativo(v0, 'v0')) / positivo(Fa, 'Fa');
  }

  // Conservação da energia mecânica (sem forças não conservativas): v² = v0² + 2 g (h0 − h).
  function conservacao({ h0, v0, h } = {}) {
    const v2 = numero(v0, 'v0') ** 2 + 2 * g() * (numero(h0, 'h0') - numero(h, 'h'));
    if (v2 < -1e-12) throw new Error('fisica: o corpo não chega a essa altura');
    return Math.sqrt(Math.max(0, v2));
  }

  // Percurso feito de planos inclinados e troços horizontais, com força de atrito de intensidade constante Fa
  // (energia dissipada = Fa × distância percorrida). desnivel < 0 a descer. Em cada ponto:
  // Em0 = Ec + Epg + dissipada. Se a energia cinética chega a zero a meio de um troço, o corpo para aí
  // (parou: true) e o percurso termina — não se modela o eventual regresso por um plano abaixo.
  function comAtrito({ m, h0, v0, Fa, percurso } = {}) {
    positivo(m, 'm');
    numero(h0, 'h0');
    naoNegativo(v0, 'v0');
    naoNegativo(Fa, 'Fa');
    lista(percurso, 'o percurso');
    const troços = percurso.map((t, i) => {
      if (!t || (t.tipo !== 'plano' && t.tipo !== 'horizontal')) throw new Error(`fisica: troço ${i + 1} tem de ser 'plano' ou 'horizontal'`);
      const L = positivo(t.comprimento, `o comprimento do troço ${i + 1}`);
      const dh = t.desnivel === undefined ? 0 : numero(t.desnivel, `o desnível do troço ${i + 1}`);
      if (t.tipo === 'horizontal' && dh !== 0) throw new Error(`fisica: o troço horizontal ${i + 1} não tem desnível`);
      if (Math.abs(dh) > L) throw new Error(`fisica: no troço ${i + 1} o desnível não pode ser maior do que o comprimento`);
      return { L, dh };
    });
    const Em0 = em(m, v0, h0);
    const ponto = (s, h, parou) => {
      const Epg = epg(m, h);
      const dissipada = Fa * s;
      let Ec = Em0 - Epg - dissipada;
      if (parou || Math.abs(Ec) < 1e-9 * Math.max(1, Math.abs(Em0))) Ec = 0;
      return { s, h, v: vDeEc(Ec, m), ec: Ec, epg: Epg, dissipada, parou };
    };
    const pontos = [ponto(0, h0, false)];
    let s = 0, h = h0;
    for (const { L, dh } of troços) {
      const Ec0 = pontos[pontos.length - 1].ec;
      // Ec(x) = Ec0 − k x, com k = m g dh/L + Fa (constante no troço)
      const k = (m * g() * dh) / L + Fa;
      // parado e sem nada que o ponha em movimento (horizontal, a subir, ou atrito ≥ componente do peso): para aqui
      if (Ec0 === 0 && k >= 0) {
        pontos[pontos.length - 1].parou = true;
        return pontos;
      }
      const EcFim = Ec0 - k * L;
      if (EcFim < -1e-9 * Math.max(1, Math.abs(Em0))) {
        const x = Ec0 / k; // k > 0, porque Ec0 ≥ 0 e EcFim < 0
        pontos.push(ponto(s + x, h + (dh * x) / L, true));
        return pontos;
      }
      s += L;
      h += dh;
      pontos.push(ponto(s, h, false));
    }
    return pontos;
  }

  // Alturas sucessivas de ressalto quando cada colisão conserva a fração `fracao` da energia mecânica.
  function ressalto(h0, fracao, n) {
    positivo(h0, 'h0');
    if (!Number.isFinite(fracao) || fracao <= 0 || fracao > 1) throw new Error('fisica: a fração tem de estar em ]0, 1]');
    if (!Number.isInteger(n) || n < 1) throw new Error('fisica: n tem de ser um inteiro positivo');
    return Array.from({ length: n }, (_, i) => limpo(h0 * fracao ** (i + 1)));
  }

  // ---------- circuitos ----------

  const resistencias = (rs) => lista(rs, 'a lista de resistências').map((R, i) => positivo(R, `a resistência ${i + 1}`));
  const resistenciaSerie = (rs) => limpo(resistencias(rs).reduce((a, R) => a + R, 0));
  const resistenciaParalelo = (rs) => limpo(1 / resistencias(rs).reduce((a, R) => a + 1 / R, 0));

  // Fonte ideal de tensão U com resistências todas em série ou todas em paralelo.
  function circuito({ U, rs, ligacao } = {}) {
    naoNegativo(U, 'U');
    let Req, porComponente;
    if (ligacao === 'serie') {
      Req = resistenciaSerie(rs);
      const I = U / Req;
      porComponente = rs.map((R) => ({ R, I: limpo(I), U: limpo(I * R), P: limpo(I * I * R) }));
    } else if (ligacao === 'paralelo') {
      Req = resistenciaParalelo(rs);
      porComponente = rs.map((R) => ({ R, I: limpo(U / R), U, P: limpo((U * U) / R) }));
    } else {
      throw new Error("fisica: a ligação tem de ser 'serie' ou 'paralelo'");
    }
    return { Req, I: limpo(U / Req), porComponente };
  }

  // Gerador (ε, r) com resistência exterior Rext: I = ε/(r + Rext), U = ε − r I = Rext I.
  // Balanço: ε I (total) = U I (útil) + r I² (dissipada no gerador); rendimento = U/ε.
  function gerador({ epsilon, r, Rext } = {}) {
    positivo(epsilon, 'ε');
    naoNegativo(r, 'r');
    naoNegativo(Rext, 'Rext');
    if (r + Rext === 0) throw new Error('fisica: r + Rext tem de ser positivo');
    const I = limpo(epsilon / (r + Rext));
    const U = limpo(I * Rext);
    return {
      I,
      U,
      Putil: limpo(U * I),
      Pdissipada: limpo(r * I * I),
      Ptotal: limpo(epsilon * I),
      rendimento: limpo(U / epsilon),
    };
  }

  // Reta característica U = ε − r I a partir de dois pontos (I, U).
  function caracteristicaDeDoisPontos(p1, p2) {
    const [I1, U1] = p1 || [], [I2, U2] = p2 || [];
    [I1, U1, I2, U2].forEach((v) => naoNegativo(v, 'I e U'));
    if (I1 === I2) throw new Error('fisica: os dois pontos têm de ter correntes diferentes');
    const r = limpo(-(U2 - U1) / (I2 - I1));
    if (r < 0) throw new Error('fisica: a resistência interna r não pode ser negativa (U tem de descer quando I sobe)');
    return { epsilon: limpo(U1 + r * I1), r };
  }

  // ---------- balanços térmicos ----------

  const calor = (m, c, dTheta) => positivo(m, 'm') * positivo(c, 'c') * numero(dTheta, 'Δθ');
  const calorFase = (m, dh) => positivo(m, 'm') * numero(dh, 'Δh');

  // Aquecimento de gelo (θ0 ≤ 0 °C) com potência constante P, à pressão normal.
  // Troços: 'gelo' (θ0 → 0), 'fusao' (a 0 °C), 'agua' (0 → θF, θF ≤ 100) e, com vaporizar (exige θF = 100), 'ebulicao'.
  // Com fundir (exige θF = 0), acaba depois da fusão completa a 0 °C (θ0 = θF = 0 é permitido).
  // Sem perdas: toda a energia fornecida é recebida pela água (t = Q/P).
  function aquecimentoGelo({ m, theta0, thetaF, P, vaporizar = false, fundir = false } = {}) {
    positivo(m, 'm');
    positivo(P, 'P');
    numero(theta0, 'θ0');
    numero(thetaF, 'θF');
    const { fusaoGelo: Tf, ebulicaoAgua: Te } = D().temperaturas;
    const c = D().capacidadeTermicaMassica, dh = D().entalpiaMassica;
    if (theta0 > Tf) throw new Error('fisica: θ0 tem de ser a temperatura do gelo (≤ 0 °C)');
    if (fundir && vaporizar) throw new Error('fisica: fundir e vaporizar não podem ser pedidos ao mesmo tempo');
    if (fundir && thetaF !== Tf) throw new Error('fisica: para acabar na fusão, θF tem de ser 0 °C');
    if ((fundir ? thetaF < theta0 : thetaF <= theta0) || thetaF > Te) throw new Error('fisica: θF tem de estar entre θ0 e 100 °C');
    if (vaporizar && thetaF !== Te) throw new Error('fisica: para vaporizar, θF tem de ser 100 °C');
    const troços = [];
    let t = 0;
    const junta = (fase, Q, a, b) => {
      troços.push({ fase, Q, t0: t, t1: t + Q / P, theta0: a, theta1: b });
      t += Q / P;
    };
    if (theta0 < Tf) junta('gelo', calor(m, c.gelo, Math.min(thetaF, Tf) - theta0), theta0, Math.min(thetaF, Tf));
    if (thetaF < Tf || (thetaF === Tf && !fundir)) return troços;
    junta('fusao', calorFase(m, dh.fusaoGelo), Tf, Tf);
    if (fundir) return troços;
    junta('agua', calor(m, c.agua, thetaF - Tf), Tf, thetaF);
    if (vaporizar) junta('ebulicao', calorFase(m, dh.vaporizacaoAgua), Te, Te);
    return troços;
  }

  // Mistura num recipiente isolado (sem perdas, capacidade térmica do recipiente desprezável).
  // Corpos: { m, c, theta } (líquido ou sólido sem mudança de estado) ou { m, theta: 0, fase: 'gelo' } (gelo a 0 °C;
  // o gelo abaixo de 0 °C não está implementado). Todas as temperaturas ≥ 0 °C e sem vaporização, por isso nenhuma
  // água congela. Devolve θeq, a massa de gelo derretida e restante, e a energia Q recebida por cada corpo
  // (Q > 0 recebida, Q < 0 cedida; Σ Q = 0).
  function mistura(corpos) {
    if (!Array.isArray(corpos) || corpos.length < 2) throw new Error('fisica: a mistura precisa de pelo menos 2 corpos');
    const { agua: cAgua } = D().capacidadeTermicaMassica;
    const Lf = D().entalpiaMassica.fusaoGelo;
    const { fusaoGelo: Tf, ebulicaoAgua: Te } = D().temperaturas;
    const lidos = corpos.map((k, i) => {
      if (!k) throw new Error(`fisica: corpo ${i + 1} inválido`);
      positivo(k.m, `a massa do corpo ${i + 1}`);
      numero(k.theta, `a temperatura do corpo ${i + 1}`);
      if (k.fase === 'gelo') {
        if (k.theta !== Tf) throw new Error('fisica: só está implementado gelo a 0 °C (nem abaixo, nem acima)');
        return { gelo: true, m: k.m, theta: Tf };
      }
      if (k.fase !== undefined && !['agua', 'liquido', 'solido'].includes(k.fase)) throw new Error(`fisica: fase desconhecida no corpo ${i + 1}`);
      const c = k.fase === 'agua' && k.c === undefined ? cAgua : k.c;
      positivo(c, `a capacidade térmica mássica do corpo ${i + 1}`);
      if (k.theta < Tf) throw new Error('fisica: as temperaturas têm de ser ≥ 0 °C (sem congelação)');
      // água líquida: fase 'agua', ou corpo sem fase com a capacidade térmica mássica da água
      const agua = k.fase === 'agua' || (k.fase === undefined && c === cAgua);
      if (agua && k.theta > Te) throw new Error('fisica: a água líquida não pode estar acima de 100 °C (sem vaporização)');
      return { gelo: false, m: k.m, c, theta: k.theta };
    });
    const outros = lidos.filter((k) => !k.gelo);
    const mGelo = lidos.filter((k) => k.gelo).reduce((a, k) => a + k.m, 0);
    const C = outros.reduce((a, k) => a + k.m * k.c, 0);
    // energia que os outros corpos cedem até chegarem a 0 °C
    const Qdisp = outros.reduce((a, k) => a + k.m * k.c * (k.theta - Tf), 0);
    let thetaEq, derretido;
    if (mGelo === 0) {
      thetaEq = outros.reduce((a, k) => a + k.m * k.c * k.theta, 0) / C;
      derretido = 0;
    } else if (Qdisp >= mGelo * Lf) {
      // todo o gelo funde e a água de fusão aquece de 0 °C a θeq
      thetaEq = Tf + (Qdisp - mGelo * Lf) / (C + mGelo * cAgua);
      derretido = mGelo;
    } else {
      thetaEq = Tf;
      derretido = Qdisp / Lf;
    }
    const fracao = mGelo > 0 ? derretido / mGelo : 0;
    const trocas = lidos.map((k) => (k.gelo
      ? { Q: k.m * fracao * (Lf + cAgua * (thetaEq - Tf)) }
      : { Q: k.m * k.c * (thetaEq - k.theta) }));
    return { thetaEq: limpo(thetaEq), geloDerretido: derretido, geloRestante: mGelo - derretido, trocas };
  }

  // ---------- rendimento e painel fotovoltaico ----------

  function rendimento(util, fornecida) {
    naoNegativo(util, 'a energia útil');
    positivo(fornecida, 'a energia fornecida');
    const eta = util / fornecida;
    // tolera ruído de vírgula flutuante (útil e fornecida calculadas por caminhos diferentes)
    if (eta > 1 + 1e-12) throw new Error('fisica: o rendimento não pode ser maior do que 1');
    return Math.min(eta, 1);
  }

  // Modelo de um díodo (ver fontes.modelos): IL = Isc·G/G0; I0 = Isc/(e^(Uoc0/UT) − 1), fixo;
  // I(U) = IL − I0·(e^(U/UT) − 1); Uoc(G) = UT·ln(1 + IL/I0). A G0 coincide com Isc·(1 − e^((U − Uoc)/UT)) a menos de I0.
  const modeloPainel = () => D().modelos.painel;
  function curvaPainel(irradiancia) {
    const p = modeloPainel();
    const IL = (p.Isc * irradiancia) / p.irradianciaReferencia;
    const I0 = p.Isc / Math.expm1(p.Uoc / p.UT);
    return { IL, I0, UT: p.UT, Uoc: p.UT * Math.log1p(IL / I0) };
  }
  function correntePainel(U, irradiancia) {
    const { IL, I0, UT } = curvaPainel(irradiancia);
    return IL - I0 * Math.expm1(U / UT);
  }
  const rendimentoPainel = (P, irradiancia) => rendimento(P, irradiancia * modeloPainel().area);

  // Ponto de funcionamento com uma resistência de carga: I(U) = U/R, por bissecção em U ∈ [0, Uoc(G)]
  // (f(U) = I(U) − U/R é decrescente, f(0) > 0 e f(Uoc) < 0).
  function painel({ irradiancia, Rcarga } = {}) {
    positivo(irradiancia, 'a irradiância');
    naoNegativo(Rcarga, 'a resistência de carga');
    let U = 0;
    if (Rcarga > 0) {
      let a = 0, b = curvaPainel(irradiancia).Uoc;
      for (let i = 0; i < 200 && b - a > 1e-13; i++) {
        const meio = (a + b) / 2;
        if (correntePainel(meio, irradiancia) - meio / Rcarga > 0) a = meio; else b = meio;
      }
      U = (a + b) / 2;
    }
    const I = correntePainel(U, irradiancia);
    const P = U * I;
    return { U, I, P, rendimento: rendimentoPainel(P, irradiancia) };
  }

  // Tensão em circuito aberto para a irradiância G.
  const painelUoc = (irradiancia) => curvaPainel(positivo(irradiancia, 'a irradiância')).Uoc;

  // Ponto de potência máxima da curva (P = U I é unimodal em [0, Uoc(G)]): pesquisa pela razão áurea.
  function painelPotenciaMaxima(irradiancia) {
    positivo(irradiancia, 'a irradiância');
    const P = (U) => U * correntePainel(U, irradiancia);
    const phi = (Math.sqrt(5) - 1) / 2;
    let a = 0, b = curvaPainel(irradiancia).Uoc;
    let x1 = b - phi * (b - a), x2 = a + phi * (b - a);
    let f1 = P(x1), f2 = P(x2);
    for (let i = 0; i < 200 && b - a > 1e-12; i++) {
      if (f1 < f2) { a = x1; x1 = x2; f1 = f2; x2 = a + phi * (b - a); f2 = P(x2); }
      else { b = x2; x2 = x1; f2 = f1; x1 = b - phi * (b - a); f1 = P(x1); }
    }
    const U = (a + b) / 2, I = correntePainel(U, irradiancia);
    return { U, I, P: U * I };
  }

  return {
    ec, epg, em, vDeEc, trabalho, travagem, conservacao, comAtrito, ressalto,
    resistenciaSerie, resistenciaParalelo, circuito, gerador, caracteristicaDeDoisPontos,
    calor, calorFase, aquecimentoGelo, mistura,
    rendimento, painel, painelPotenciaMaxima, painelUoc,
  };
})();
