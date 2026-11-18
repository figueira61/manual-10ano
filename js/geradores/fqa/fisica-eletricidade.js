globalThis.Manual = globalThis.Manual || {};

// Geradores de Física e Química A — Física, tema «Energia e fenómenos elétricos».
// Subtemas: circuitos, gerador (ids <subtema>-<tipo>).
// Os cálculos vêm de Manual.fisica (circuito, resistenciaSerie/Paralelo, gerador, caracteristicaDeDoisPontos) e o modelo
// da pilha de Manual.dadosFisica; verificarIndependente e a verificação usam outro caminho (soma das correntes dos ramos,
// produto sobre soma, regresso ao dado, balanço de potências…).
// Conversão de energia: 1 kWh = 1000 W × 3600 s = 3,6 × 10⁶ J (definição do quilowatt-hora).
// Manual.dadosFisica e Manual.fisica só são lidos dentro de gerar (carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const Fis = () => Manual.fisica;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const { tex, fechar, confere, entre } = A;
  const tentar = (construir) => A.tentar(construir, 'eletricidade');
  const KWH = 1000 * 3600; // J

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'fqa', tema: 'eletricidade', id: def.subtema + '-' + def.tipo }, def));
  }

  // ---------------------------------------------------------------- números (os mesmos de fisica-movimentos.js)
  const AS3 = ' Apresenta o resultado com três algarismos significativos.';
  const cient = (x, as) => Manual.formatar.cientifico(x, as);
  const aAS = (v, k) => Number(Number(v).toPrecision(k)) + 0;
  const exatoAS = (v, k) => Math.abs(aAS(v, k) - v) <= 1e-9 * Math.abs(v);
  // Valor a meio entre dois arredondamentos (…5 no 4.º algarismo): re-sortear, para não haver dúvida no arredondamento.
  function ambiguo(v, k) {
    const e = Math.floor(Math.log10(Math.abs(v)));
    const s = Math.abs(v) / Math.pow(10, e - k + 1);
    return Math.abs(s - Math.floor(s) - 0.5) < 1e-6;
  }
  // Menor número de algarismos significativos (até 3) que escreve v exatamente.
  const asMin = (v) => [1, 2, 3].find((k) => exatoAS(v, k)) || 3;
  // Valor em LaTeX: exato com os algarismos que tem; arredondado com 3 a.s.; notação científica se muito grande ou pequeno.
  function texN(v) {
    if (v === 0) return '0';
    const r = aAS(v, 3);
    const exato = exatoAS(v, 3);
    const a = Math.abs(r);
    if (a >= 1e4 || a < 1e-3) return cient(r, exato ? asMin(r) : 3);
    if (exato || a >= 100) return tex(r, 6);
    return (r < 0 ? '-' : '') + a.toPrecision(3).replace('.', '{,}');
  }
  // « = » se o valor mostrado é exato, « ≈ » se foi arredondado.
  const igual = (v) => (exatoAS(v, 3) ? ' = ' : ' \\approx ');
  // Valores intermédios (regra 15): exatos quando têm até 4 casas decimais, senão com 4 a.s.
  const exI = (v) => Math.abs(v - Math.round(v * 1e4) / 1e4) <= 1e-9 * Math.max(1, Math.abs(v));
  function texI(v) {
    if (exI(v)) return Math.abs(v) >= 1e5 ? cient(v, [1, 2, 3, 4].find((k) => exatoAS(v, k)) || 4) : tex(v, 4);
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) return cient(v, 4);
    if (a >= 1000) return tex(aAS(v, 4), 0);
    return (v < 0 ? '-' : '') + a.toPrecision(4).replace('.', '{,}');
  }
  // « = valor » ou « ≈ valor » de um resultado intermédio; ok = false quando algum operando já foi arredondado.
  const eqI = (v, ok = true) => (ok && exI(v) && exatoAS(v, 4) ? ' = ' : ' \\approx ') + texI(v);
  // O mesmo para um resultado mostrado com a precisão da resposta (3 a.s.).
  const eqN = (v, ok = true) => (ok && exatoAS(v, 3) ? ' = ' : ' \\approx ') + texN(v);
  // Dado do enunciado: $2,5\,V$.
  const q = (v, u) => '$' + tex(v) + '\\,' + u + '$';
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);

  const UN = {
    V: '\\mathrm{V}', A: '\\mathrm{A}', mA: '\\mathrm{mA}', ohm: '\\Omega', C: '\\mathrm{C}', s: '\\mathrm{s}', min: '\\mathrm{min}',
    h: '\\mathrm{h}', W: '\\mathrm{W}', kW: '\\mathrm{kW}', kWh: '\\mathrm{kWh}', J: '\\mathrm{J}', pct: '\\%',
  };
  // Texto de uma opção (regra 14): uma só notação por item, escolhida a partir das opções mostradas.
  // sci: todas em notação científica com 3 a.s.; senão todas em notação normal com 3 a.s.
  function texOp(v, sci) {
    if (sci) {
      // sempre com «× 10^e» (também 10^0), para todas as opções terem a mesma forma
      const [mant, e] = Math.abs(v).toExponential(2).split('e');
      return (v < 0 ? '-' : '') + mant.replace('.', '{,}') + ' \\times 10^{' + Number(e) + '}';
    }
    const r = aAS(v, 3);
    const a = Math.abs(r);
    if (a >= 1000) return tex(r, 0);
    return (r < 0 ? '-' : '') + a.toPrecision(3).replace('.', '{,}');
  }
  const precisaSci = (vals) => {
    const ab = vals.filter((x) => x !== 0).map(Math.abs);
    return Math.max(...ab) >= 1e4 || Math.min(...ab) < 1e-3;
  };
  const textoDe = (u, sci) => (v) => '$' + texOp(v, sci) + (u ? '\\,' + u : '') + '$';
  // Formatador das explicações: a mesma string da opção (sem unidade quando a explicação a dispensa).
  const vtDe = (sci) => (v, u) => '$' + texOp(v, sci) + (u ? '\\,' + u : '') + '$';
  // Explicação de um erro: função do formatador do item (ou texto fixo).
  const explicar = (e, f) => Object.assign({}, e, { explicacao: typeof e.explicacao === 'function' ? e.explicacao(f) : e.explicacao });

  // Fecha um item numérico (ou de escolha). Resposta exata quando tem até 3 a.s.; senão pede 3 a.s. (algarismos: 3).
  // Erros: arredondados a 3 a.s., e só os que ficam longe de 0 (um «0» escrito nunca é erro típico) e na escala da resposta.
  // o: { erros: [{ codigo, valor, explicacao(vt) }], unidade, u (LaTeX), verificacao(resposta) → { passo, calculo, valor } }.
  function fecharNum(rng, formato, ex, exato, o) {
    if (!Number.isFinite(exato) || exato === 0) return null;
    // Curto: exato com ≤ 3 a.s. e ≤ 3 casas decimais (o quiz, sem `algarismos`, mostra até 3 casas).
    const curto = exatoAS(exato, 3) && Math.abs(Number(exato.toFixed(3)) - exato) <= 1e-12;
    if (!curto && ambiguo(exato, 3)) return null;
    const resposta = aAS(exato, 3);
    const tol = A.tolMeiaUnidade(resposta, 3);
    const relativa = Math.abs(resposta) >= 1e4 || Math.abs(resposta) < 1e-3;
    const R = Math.abs(resposta);
    const esc = o.escala || 1e4; // fator máximo entre uma opção e a resposta (a troca kWh ↔ J pede 10⁷)
    const candidatos = o.erros
      .filter((e) => e && Number.isFinite(e.valor))
      .map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }))
      .filter((e) => (formato === 'escolha' || Math.abs(e.valor) > 10 * tol) && Math.abs(e.valor) > R / esc && Math.abs(e.valor) < R * esc);
    // As opções que vão ser mostradas (a certa e os primeiros erros distintos, com o mesmo filtro de `fechar`),
    // para escolher a notação do item.
    const filtrados = relativa ? A.filtrarErros(resposta, tol, candidatos, 1e-9 * R, tol / R) : A.filtrarErros(resposta, tol, candidatos);
    const mostrados = formato === 'escolha' ? filtrados.slice(0, 3) : filtrados;
    const sci = precisaSci([resposta].concat(mostrados.map((e) => e.valor)));
    const erros = candidatos.map((e) => explicar(e, vtDe(sci)));
    if (!curto && formato === 'numerica') ex.enunciado += AS3;
    ex.dados = Object.assign({}, ex.dados, { sci });
    const v = o.verificacao(resposta);
    const base = { resposta, unidade: o.unidade, texto: textoDe(o.u, sci), erros, verificacao: Object.assign({}, v, { valor: aAS(v.valor, 3) }) };
    if (!curto) base.algarismos = 3;
    if (relativa) base.toleranciaRelativa = tol / R; else base.tolerancia = tol;
    return fechar(rng, formato, ex, base);
  }
  // A mesma resposta, por outro caminho, comparada como o item a mostra (verificarIndependente).
  const confereN = (p, valor, u) => confere(p, aAS(valor, 3), textoDe(u, p.dados.sci));

  // ================================================================ circuitos
  const COMPONENTES = [['uma lâmpada', 'da lâmpada'], ['uma resistência', 'da resistência'], ['um fio de nicrómio', 'do fio de nicrómio']];
  const RESISTENCIAS = [10, 12, 15, 20, 22, 33, 47, 56, 68, 82, 100, 120, 150, 220];
  const MINUTOS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30];

  registar({
    subtema: 'circuitos', tipo: 'lei-ohm', nome: 'Resistência, diferença de potencial e corrente elétrica',
    formatos: ['numerica'], contextos: ['resistencia', 'tensao', 'carga'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'resistencia') {
          const deComp = escolher(rng, COMPONENTES)[1];
          const U = entre(rng, 1.5, 12, 0.5);
          const I = entre(rng, 0.05, 1.5, 0.05);
          const R = U / I;
          if (R < 2 || R > 200) return null;
          exato = R;
          unidade = 'Ω';
          u = UN.ohm;
          ex = {
            enunciado: 'Num circuito, um voltímetro ligado aos terminais ' + deComp + ' marca ' + q(U, UN.V) + ' e um amperímetro, ligado em série, marca ' + q(I, UN.A) + '. Calcula a resistência ' + deComp + ' nessas condições.',
            resolucao: [{ passo: 'Aplicar a definição de resistência', porque: 'A resistência é a razão entre a diferença de potencial nos terminais do componente e a corrente que o percorre, $R = U/I$; com $U$ em volts e $I$ em amperes, $R$ vem em ohms.', calculo: 'R = \\dfrac{U}{I} = \\dfrac{' + tex(U) + '}{' + tex(I) + '}' + igual(R) + texN(R) + '\\,\\Omega' }],
            dados: { contexto, U, I },
          };
          erros = [
            { codigo: 'multiplicou_em_vez_de_dividir', valor: U * I, explicacao: (vt) => 'Multiplicaste $U$ por $I$ e obtiveste ' + vt(U * I) + ' (esse produto é a potência, em watts). A resistência é $R = U/I$: divide-se.' },
            { codigo: 'dividiu_ao_contrario', valor: I / U, explicacao: (vt) => 'Calculaste $I/U$ e obtiveste ' + vt(I / U) + ' (em $\\Omega^{-1}$). É ao contrário: $R = U/I$.' },
          ];
          verificacao = () => ({ passo: 'Recalcular a leitura do voltímetro com $R$ (por arredondar): tem de dar $U$', calculo: 'U = R I = ' + texI(R) + ' \\times ' + tex(I) + eqI(R * I, exI(R)) + '\\,\\mathrm{V}', valor: 1 / (I / U) });
        } else if (contexto === 'tensao') {
          const [comp, deComp] = escolher(rng, COMPONENTES.slice(1, 3));
          const R = escolher(rng, RESISTENCIAS);
          const ImA = entre(rng, 10, 200, 5);
          const I = ImA / 1000;
          const Uv = A.limpo(R * I);
          if (Uv < 0.5 || Uv > 24) return null;
          exato = Uv;
          unidade = 'V';
          u = UN.V;
          ex = {
            enunciado: maiuscula(comp) + ' de ' + q(R, UN.ohm) + ' é percorrid' + (comp.startsWith('uma') ? 'a' : 'o') + ' por uma corrente de ' + q(ImA, UN.mA) + '. Calcula a diferença de potencial elétrico nos seus terminais.',
            resolucao: [
              { passo: 'Passar a corrente a amperes', porque: 'No SI a corrente exprime-se em amperes: $1\\,\\mathrm{mA} = 10^{-3}\\,\\mathrm{A}$.', calculo: 'I = ' + tex(ImA) + '\\,\\mathrm{mA} = ' + tex(I, 4) + '\\,\\mathrm{A}' },
              { passo: 'Isolar $U$ em $R = U/I$', porque: 'Multiplica-se a resistência pela corrente: com $R$ em ohms e $I$ em amperes, $U$ vem em volts.', calculo: 'U = R I = ' + tex(R) + ' \\times ' + tex(I, 4) + igual(Uv) + texN(Uv) + '\\,\\mathrm{V}' },
            ],
            dados: { contexto, R, ImA },
          };
          erros = [
            { codigo: 'corrente_em_miliamperes', valor: R * ImA, explicacao: (vt) => 'Usaste a corrente em miliamperes e obtiveste ' + vt(R * ImA, UN.V) + '. No SI a corrente está em amperes ($' + tex(ImA) + '\\,\\mathrm{mA} = ' + tex(I, 4) + '\\,\\mathrm{A}$).' },
            { codigo: 'dividiu_em_vez_de_multiplicar', valor: R / I, explicacao: (vt) => 'Dividiste $R$ por $I$ e obtiveste ' + vt(R / I) + '. De $R = U/I$ vem $U = R I$: multiplica-se.' },
          ];
          verificacao = () => ({ passo: 'Voltar à corrente, $I = U/R$ (com $U$ por arredondar): tem de dar a corrente dada', calculo: 'I = \\dfrac{' + texI(Uv) + '}{' + tex(R) + '}' + eqI(Uv / R) + '\\,\\mathrm{A} = ' + tex(ImA) + '\\,\\mathrm{mA}', valor: (R * ImA) / 1000 });
        } else {
          const I = entre(rng, 0.1, 3, 0.1);
          const tmin = escolher(rng, MINUTOS);
          const ts = tmin * 60;
          const Q = A.limpo(I * ts);
          exato = I;
          unidade = 'A';
          u = UN.A;
          ex = {
            enunciado: 'Pela secção reta de um fio passam ' + q(Q, UN.C) + ' de carga elétrica em ' + q(tmin, UN.min) + '. Calcula a corrente elétrica no fio.',
            resolucao: [
              { passo: 'Passar o tempo a segundos', porque: 'No SI o tempo exprime-se em segundos: $1\\,\\mathrm{min} = 60\\,\\mathrm{s}$.', calculo: '\\Delta t = ' + tex(tmin) + ' \\times 60 = ' + tex(ts) + '\\,\\mathrm{s}' },
              { passo: 'Aplicar a definição de corrente elétrica', porque: 'A corrente é a carga que atravessa a secção do condutor por unidade de tempo, $I = Q/\\Delta t$; em $\\mathrm{C\\,s^{-1}}$, isto é, em amperes.', calculo: 'I = \\dfrac{' + tex(Q) + '}{' + tex(ts) + '}' + igual(I) + texN(I) + '\\,\\mathrm{A}' },
            ],
            dados: { contexto, Q, tmin },
          };
          erros = [
            { codigo: 'tempo_em_minutos', valor: Q / tmin, explicacao: (vt) => 'Dividiste pelo tempo em minutos e obtiveste ' + vt(Q / tmin, UN.A) + '. No SI o tempo está em segundos: $' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$.' },
            { codigo: 'dividiu_ao_contrario', valor: ts / Q, explicacao: (vt) => 'Calculaste $\\Delta t / Q$ e obtiveste ' + vt(ts / Q) + '. É ao contrário: $I = Q/\\Delta t$.' },
          ];
          verificacao = (r) => ({ passo: 'Recalcular a carga que passa no tempo dado', calculo: 'Q = I\\,\\Delta t = ' + texN(r) + ' \\times ' + tex(ts) + igual(r * ts) + texN(r * ts) + '\\,\\mathrm{C}', valor: Q / tmin / 60 });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'resistencia') return confereN(p, 1 / (d.I / d.U), UN.ohm); // pela condutância
      if (d.contexto === 'tensao') return confereN(p, (d.R * d.ImA) / 1000, UN.V);
      return confereN(p, d.Q / d.tmin / 60, UN.A); // carga por minuto, a dividir por 60
    },
    limites(p) {
      const d = p.dados;
      if (d.contexto === 'resistencia') return d.U / d.I >= 2 && d.U / d.I <= 200;
      if (d.contexto === 'tensao') return (d.R * d.ImA) / 1000 <= 24;
      return d.Q / (d.tmin * 60) <= 3;
    },
  });

  // Resistências inteiras de 1 a 20 Ω e fonte ideal de 3 a 12 V: os valores do esquema fqa-circuito, que mostra o próprio item.
  const RS_ASSOC = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20];
  const NUM_RES = { 2: 'Duas', 3: 'Três' };
  const listaR = (rs) => {
    const l = rs.map((R, i) => '$R_' + (i + 1) + ' = ' + tex(R) + '\\,\\Omega$');
    return l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];
  };

  registar({
    subtema: 'circuitos', tipo: 'associacao', nome: 'Resistências em série e em paralelo: resistência equivalente, tensões e correntes',
    formatos: ['numerica', 'escolha'], contextos: ['paralelo-req', 'serie-tensao', 'paralelo-corrente'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const n = rng() < 0.6 ? 2 : 3;
        const rs = Array.from({ length: n }, () => escolher(rng, RS_ASSOC));
        if (new Set(rs).size < n) return null;
        const Rs = Fis().resistenciaSerie(rs);
        const Rp = Fis().resistenciaParalelo(rs);
        const somaInv = rs.reduce((a, R) => a + 1 / R, 0);
        const inicio = NUM_RES[n] + ' resistências, ' + listaR(rs) + ', estão ligadas ';
        const passoInv = { passo: 'Somar os inversos das resistências', porque: 'Em paralelo, o inverso da resistência equivalente é a soma dos inversos das resistências.', calculo: '\\dfrac{1}{R_{eq}} = ' + rs.map((R) => '\\dfrac{1}{' + tex(R) + '}').join(' + ') + eqI(somaInv) + '\\,\\Omega^{-1}' };
        const passoReq = { passo: 'Inverter', porque: 'Pede-se $R_{eq}$, não $1/R_{eq}$. Em paralelo, $R_{eq}$ é menor do que a menor das resistências: há mais caminhos para a corrente.', calculo: 'R_{eq} = \\dfrac{1}{' + texI(somaInv) + '}' + eqN(Rp, exI(somaInv)) + '\\,\\Omega' };
        let ex, exato, erros, verificacao, unidade, u, U;
        if (contexto === 'paralelo-req') {
          exato = Rp;
          unidade = 'Ω';
          u = UN.ohm;
          ex = {
            enunciado: inicio + 'em paralelo. Calcula a resistência equivalente da associação.',
            resolucao: [passoInv, passoReq],
          };
          erros = [
            { codigo: 'somou_resistencias_em_paralelo', valor: Rs, explicacao: (vt) => 'Somaste as resistências e obtiveste ' + vt(Rs, UN.ohm) + ', como se estivessem em série. Em paralelo somam-se os inversos, e $R_{eq}$ fica menor do que a menor das resistências.' },
            { codigo: 'esqueceu_inverter_resistencia_equivalente', valor: somaInv, explicacao: (vt) => 'Obtiveste ' + vt(somaInv) + ', que é $1/R_{eq}$ (em $\\Omega^{-1}$). Falta inverter.' },
          ];
          const prod = rs.reduce((a, R) => a * R, 1);
          if (n === 2) erros.push({ codigo: 'esqueceu_dividir_pela_soma', valor: prod, explicacao: (vt) => 'Calculaste só o produto $R_1 R_2$ e obtiveste ' + vt(prod, UN.ohm) + '. Para duas resistências em paralelo, $R_{eq} = \\dfrac{R_1 R_2}{R_1 + R_2}$.' });
          else erros.push({ codigo: 'produto_sobre_soma_com_tres', valor: prod / Rs, explicacao: (vt) => 'Aplicaste o «produto sobre a soma» às três resistências e obtiveste ' + vt(prod / Rs, UN.ohm) + '. Essa regra só vale para duas; com três, somam-se os inversos.' });
          verificacao = () => {
            const R12 = (rs[0] * rs[1]) / (rs[0] + rs[1]);
            if (n === 2) return { passo: 'Pela regra do produto sobre a soma', calculo: 'R_{eq} = \\dfrac{' + tex(rs[0]) + ' \\times ' + tex(rs[1]) + '}{' + tex(rs[0]) + ' + ' + tex(rs[1]) + '} = \\dfrac{' + tex(rs[0] * rs[1]) + '}{' + tex(rs[0] + rs[1]) + '}' + eqN(R12) + '\\,\\Omega', valor: R12 };
            const R = (R12 * rs[2]) / (R12 + rs[2]);
            return { passo: 'Associar duas de cada vez (produto sobre a soma)', calculo: 'R_{12} = \\dfrac{' + tex(rs[0] * rs[1]) + '}{' + tex(rs[0] + rs[1]) + '}' + eqI(R12) + '\\,\\Omega;\\ R_{eq} = \\dfrac{' + texI(R12) + ' \\times ' + tex(rs[2]) + '}{' + texI(R12) + ' + ' + tex(rs[2]) + '}' + eqN(R, exI(R12)) + '\\,\\Omega', valor: R };
          };
        } else if (contexto === 'serie-tensao') {
          U = inteiro(rng, 3, 12);
          const k = inteiro(rng, 0, n - 1);
          const Rk = rs[k];
          const I = U / Rs;
          const Uk = Rk * I;
          exato = Uk;
          unidade = 'V';
          u = UN.V;
          const nome = 'R_' + (k + 1);
          ex = {
            enunciado: inicio + 'em série a uma fonte que mantém $U = ' + tex(U) + '\\,\\mathrm{V}$ nos seus terminais. Calcula a diferença de potencial elétrico nos terminais de $' + nome + '$ (o que marca um voltímetro ligado em paralelo com $' + nome + '$).',
            resolucao: [
              { passo: 'Resistência equivalente', porque: 'Em série, a resistência equivalente é a soma das resistências.', calculo: 'R_{eq} = ' + rs.map((R) => tex(R)).join(' + ') + ' = ' + tex(Rs) + '\\,\\Omega' },
              { passo: 'Corrente no circuito', porque: 'Em série, a corrente é a mesma em todas as resistências: $I = U/R_{eq}$.', calculo: 'I = \\dfrac{' + tex(U) + '}{' + tex(Rs) + '}' + eqI(I) + '\\,\\mathrm{A}' },
              { passo: 'Diferença de potencial em $' + nome + '$', porque: '$U_' + (k + 1) + ' = ' + nome + ' I$: a tensão da fonte reparte-se pelas resistências, na proporção de cada uma.', calculo: 'U_' + (k + 1) + ' = ' + tex(Rk) + ' \\times ' + texI(I) + eqN(Uk, exI(I)) + '\\,\\mathrm{V}' },
            ],
            dados: { k },
          };
          erros = [
            { codigo: 'deu_a_tensao_da_fonte', valor: U, explicacao: (vt) => vt(U, UN.V) + ' é a tensão da fonte. Em série, essa tensão reparte-se pelas resistências: cada uma fica só com a sua parte.' },
            { codigo: 'dividiu_a_tensao_igualmente', valor: U / n, explicacao: (vt) => 'Dividiste a tensão por igual e obtiveste ' + vt(U / n, UN.V) + '. Isso só acontece com resistências iguais; a maior resistência fica com a maior parte da tensão.' },
            { codigo: 'deu_a_tensao_nas_outras_resistencias', valor: U - Uk, explicacao: (vt) => vt(U - Uk, UN.V) + ' é a diferença de potencial ' + (n === 2 ? 'na outra resistência' : 'nas outras duas resistências') + '. Em $' + nome + '$ é $' + nome + ' I$.' },
          ];
          verificacao = () => ({ passo: 'Pela proporção das resistências, $U_' + (k + 1) + ' = U \\times ' + nome + '/R_{eq}$', calculo: 'U_' + (k + 1) + ' = ' + tex(U) + ' \\times \\dfrac{' + tex(Rk) + '}{' + tex(Rs) + '}' + eqN((U * Rk) / Rs) + '\\,\\mathrm{V}', valor: (U * Rk) / Rs });
        } else {
          U = inteiro(rng, 3, 12);
          const I = U / Rp;
          if (I > 10) return null;
          const Rmin = Math.min(...rs);
          exato = I;
          unidade = 'A';
          u = UN.A;
          ex = {
            enunciado: inicio + 'em paralelo a uma fonte que mantém $U = ' + tex(U) + '\\,\\mathrm{V}$ nos seus terminais. Calcula a corrente que passa na fonte (o que marca um amperímetro no ramo principal).',
            resolucao: [passoInv, passoReq, { passo: 'Corrente no ramo principal', porque: '$I = U/R_{eq}$, com a diferença de potencial da fonte aplicada à associação.', calculo: 'I = \\dfrac{' + tex(U) + '}{' + texI(Rp) + '}' + eqN(I, exI(Rp)) + '\\,\\mathrm{A}' }],
          };
          erros = [
            { codigo: 'somou_resistencias_em_paralelo', valor: U / Rs, explicacao: (vt) => 'Somaste as resistências, como se estivessem em série, e obtiveste ' + vt(U / Rs, UN.A) + '. Em paralelo $R_{eq}$ é menor do que a menor das resistências, e a corrente é maior.' },
            { codigo: 'deu_a_corrente_de_um_ramo', valor: U / Rmin, explicacao: (vt) => vt(U / Rmin, UN.A) + ' é só a corrente no ramo de $' + tex(Rmin) + '\\,\\Omega$. No ramo principal passa a soma das correntes de todos os ramos.' },
            { codigo: 'esqueceu_inverter_resistencia_equivalente', valor: U / somaInv, explicacao: (vt) => 'Usaste $1/R_{eq} = ' + texI(somaInv) + '$ como se fosse $R_{eq}$ e obtiveste ' + vt(U / somaInv, UN.A) + '. Falta inverter a soma dos inversos.' },
          ];
          verificacao = () => {
            const is = rs.map((R) => U / R);
            const todos = is.every(exI);
            return { passo: 'Somar as correntes dos ramos (em paralelo, cada ramo tem a tensão $U$ da fonte)', calculo: rs.map((R, i) => 'I_' + (i + 1)).join(' + ') + ' = ' + is.map(texI).join(' + ') + eqN(is.reduce((a, x) => a + x, 0), todos) + '\\,\\mathrm{A}', valor: is.reduce((a, x) => a + x, 0) };
          };
        }
        ex.dados = Object.assign({ contexto, rs }, U === undefined ? {} : { U }, ex.dados);
        ex.esquema = { id: 'fqa-circuito', opcoes: Object.assign({ ligacao: contexto === 'serie-tensao' ? 'serie' : 'paralelo', n, rs }, U === undefined ? {} : { U }) };
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const { rs, U, k, contexto } = p.dados;
      if (contexto === 'paralelo-req') return confereN(p, rs.reduce((a, R) => a * R, 1) / rs.reduce((a, R, i) => a + rs.reduce((b, S, j) => (j === i ? b : b * S), 1), 0), UN.ohm);
      if (contexto === 'serie-tensao') return confereN(p, U - rs.reduce((a, R, i) => (i === k ? a : a + R), 0) * U / rs.reduce((a, R) => a + R, 0), UN.V);
      return confereN(p, rs.reduce((a, R) => a + U / R, 0), UN.A);
    },
    limites(p) {
      const { rs, U } = p.dados;
      return rs.every((R) => Number.isInteger(R) && R >= 1 && R <= 20) && (U === undefined || (U >= 1 && U <= 12));
    },
  });

  // ---------------------------------------------------------------- potência e energia
  const APARELHOS = ['Um aquecedor elétrico', 'Um secador de cabelo', 'Um forno elétrico', 'Um ferro de engomar', 'Uma torradeira'];
  const POTENCIAS_W = [400, 600, 800, 1000, 1200, 1500, 1800, 2000, 2200];
  const TEMPOS_MIN = [15, 30, 45, 60, 90, 120, 150, 180];
  const NOME_TEMPO = (min) => (min % 60 === 0 ? plural(min / 60, 'hora', 'horas') : plural(min, 'minuto', 'minutos'));

  registar({
    subtema: 'circuitos', tipo: 'potencia-energia', nome: 'Potência, efeito Joule e energia elétrica (kWh e J)',
    formatos: ['numerica', 'escolha'], contextos: ['potencia', 'efeito-joule', 'energia-kwh', 'energia-joule'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'potencia' || contexto === 'efeito-joule') {
          const R = escolher(rng, RESISTENCIAS.slice(0, 9));
          const I = entre(rng, 0.1, 1.5, 0.1);
          const I2 = A.limpo(I * I);
          const P = A.limpo(R * I2);
          if (P > 300) return null;
          const passoP = { passo: 'Calcular a potência dissipada', porque: 'Numa resistência, a potência dissipada por efeito Joule é $P = R I^2$ (a corrente é elevada ao quadrado).', calculo: 'I^2 = ' + tex(I) + '^2 = ' + tex(I2, 4) + ';\\ P = R I^2 = ' + tex(R) + ' \\times ' + tex(I2, 4) + igual(P) + texN(P) + '\\,\\mathrm{W}' };
          if (contexto === 'potencia') {
            exato = P;
            unidade = 'W';
            u = UN.W;
            ex = {
              enunciado: 'Uma resistência de ' + q(R, UN.ohm) + ' é percorrida por uma corrente de ' + q(I, UN.A) + '. Calcula a potência dissipada na resistência por efeito Joule.',
              resolucao: [passoP],
              dados: { contexto, R, I },
            };
            erros = [
              { codigo: 'esqueceu_quadrado_da_corrente', valor: R * I, explicacao: (vt) => 'Calculaste $R I$ e obtiveste ' + vt(R * I) + ', que é a diferença de potencial (em V), não a potência. $P = R I^2$: a corrente é elevada ao quadrado.' },
              { codigo: 'elevou_a_resistencia_ao_quadrado', valor: R * R * I, explicacao: (vt) => 'Elevaste a resistência ao quadrado ($R^2 I$) e obtiveste ' + vt(R * R * I) + '. É a corrente que se eleva ao quadrado: $P = R I^2$.' },
              { codigo: 'dobrou_em_vez_de_elevar_ao_quadrado', valor: 2 * R * I, explicacao: (vt) => 'Multiplicaste a corrente por 2 e obtiveste ' + vt(2 * R * I, UN.W) + '. Elevar ao quadrado não é multiplicar por 2: $I^2 = ' + tex(I) + ' \\times ' + tex(I) + '$.' },
            ];
            verificacao = () => {
              const U = A.limpo(R * I);
              return { passo: 'Por outro caminho: $U = R I$ e $P = U I$', calculo: 'U = ' + tex(R) + ' \\times ' + tex(I) + ' = ' + tex(U) + '\\,\\mathrm{V};\\ P = U I = ' + tex(U) + ' \\times ' + tex(I) + igual(P) + texN(P) + '\\,\\mathrm{W}', valor: U * I };
            };
          } else {
            const tmin = escolher(rng, [1, 2, 3, 5, 10, 15]);
            const ts = tmin * 60;
            const E = A.limpo(P * ts);
            exato = E;
            unidade = 'J';
            u = UN.J;
            ex = {
              enunciado: 'Uma resistência de ' + q(R, UN.ohm) + ' é percorrida por uma corrente de ' + q(I, UN.A) + ' durante ' + q(tmin, UN.min) + '. Calcula a energia dissipada na resistência por efeito Joule.',
              resolucao: [
                passoP,
                { passo: 'Passar o tempo a segundos e calcular a energia', porque: 'A energia dissipada é a potência vezes o tempo, $E = P\\,\\Delta t$, e em joules o tempo está em segundos ($1\\,\\mathrm{min} = 60\\,\\mathrm{s}$).', calculo: '\\Delta t = ' + tex(tmin) + ' \\times 60 = ' + tex(ts) + '\\,\\mathrm{s};\\ E = ' + texN(P) + ' \\times ' + tex(ts) + eqI(E, exatoAS(P, 3)) + '\\,\\mathrm{J}' },
              ],
              dados: { contexto, R, I, tmin },
            };
            erros = [
              { codigo: 'confundiu_potencia_com_energia', valor: P, explicacao: (vt) => vt(P) + ' é a potência dissipada (em watts), não a energia. A energia é a potência vezes o tempo: $E = P\\,\\Delta t$.' },
              { codigo: 'tempo_em_minutos', valor: P * tmin, explicacao: (vt) => 'Multiplicaste pelo tempo em minutos e obtiveste ' + vt(P * tmin, UN.J) + '. Em joules o tempo está em segundos: $' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$.' },
              { codigo: 'esqueceu_quadrado_da_corrente', valor: R * I * ts, explicacao: (vt) => 'Usaste $R I \\Delta t$ e obtiveste ' + vt(R * I * ts, UN.J) + '. A potência dissipada é $R I^2$: a corrente é elevada ao quadrado.' },
            ];
            verificacao = () => {
              const U = A.limpo(R * I);
              const UI = A.limpo(U * I);
              return { passo: 'Por outro caminho: $E = U I\\,\\Delta t$, com $U = R I$', calculo: 'U = ' + tex(U) + '\\,\\mathrm{V};\\ U I = ' + tex(U) + ' \\times ' + tex(I) + ' = ' + tex(UI) + '\\,\\mathrm{W};\\ E = ' + tex(UI) + ' \\times ' + tex(ts) + eqI(UI * ts) + '\\,\\mathrm{J}', valor: UI * ts };
            };
          }
        } else {
          const ap = escolher(rng, APARELHOS);
          const P = escolher(rng, POTENCIAS_W);
          const tmin = escolher(rng, TEMPOS_MIN);
          const kW = P / 1000;
          const th = tmin / 60;
          const Ekwh = A.limpo(kW * th);
          const ts = tmin * 60;
          const EJ = A.limpo(P * ts);
          const dados = ap + ' de potência ' + q(P, UN.W) + ' funciona durante ' + NOME_TEMPO(tmin) + '. ';
          if (contexto === 'energia-kwh') {
            exato = Ekwh;
            unidade = 'kWh';
            u = UN.kWh;
            ex = {
              enunciado: dados + 'Calcula a energia elétrica consumida, em quilowatts-hora (kWh).',
              resolucao: [
                { passo: 'Passar a potência a kW e o tempo a horas', porque: 'O quilowatt-hora é a energia de um aparelho de 1 kW ligado durante 1 h: a potência entra em kW e o tempo em horas.', calculo: 'P = ' + tex(P) + '\\,\\mathrm{W} = ' + tex(kW, 4) + '\\,\\mathrm{kW};\\ \\Delta t = ' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(th, 4) + '\\,\\mathrm{h}' },
                { passo: 'Multiplicar a potência pelo tempo', porque: '$E = P\\,\\Delta t$, com $P$ em kW e $\\Delta t$ em h dá $E$ em kWh.', calculo: 'E = ' + tex(kW, 4) + ' \\times ' + tex(th, 4) + eqN(Ekwh, exI(Ekwh)) + '\\,\\mathrm{kWh}' },
              ],
              dados: { contexto, P, tmin },
            };
            erros = [
              { codigo: 'potencia_em_watts_no_kwh', valor: P * th, explicacao: (vt) => 'Usaste a potência em watts e obtiveste ' + vt(P * th) + ' (são watts-hora). Para kWh, a potência entra em kW.' },
              { codigo: 'tempo_em_minutos', valor: kW * tmin, explicacao: (vt) => 'Usaste o tempo em minutos e obtiveste ' + vt(kW * tmin, UN.kWh) + '. Para kWh, o tempo entra em horas.' },
              { codigo: 'confundiu_potencia_com_energia', valor: kW, explicacao: (vt) => vt(kW) + ' é a potência do aparelho (em kW), não a energia. A energia é a potência vezes o tempo: $E = P\\,\\Delta t$.' },
              { codigo: 'dividiu_em_vez_de_multiplicar', valor: kW / th, explicacao: (vt) => 'Dividiste a potência pelo tempo e obtiveste ' + vt(kW / th) + '. A energia é a potência vezes o tempo: $E = P\\,\\Delta t$.' },
            ];
            verificacao = () => ({ passo: 'Por joules: $E = P\\,\\Delta t$ em unidades SI, e dividir por $1\\,\\mathrm{kWh} = 3{,}6 \\times 10^{6}\\,\\mathrm{J}$', calculo: 'E = ' + tex(P) + ' \\times ' + tex(ts) + ' = ' + texI(EJ) + '\\,\\mathrm{J};\\ \\dfrac{' + texI(EJ) + '}{3{,}6 \\times 10^{6}}' + eqN(EJ / KWH, exI(EJ)) + '\\,\\mathrm{kWh}', valor: EJ / KWH });
          } else {
            exato = EJ;
            unidade = 'J';
            u = UN.J;
            ex = {
              enunciado: dados + 'Calcula a energia elétrica consumida, em joules.',
              resolucao: [
                { passo: 'Passar o tempo a segundos', porque: 'No SI o tempo exprime-se em segundos: $1\\,\\mathrm{min} = 60\\,\\mathrm{s}$.', calculo: '\\Delta t = ' + tex(tmin) + ' \\times 60 = ' + tex(ts) + '\\,\\mathrm{s}' },
                { passo: 'Multiplicar a potência pelo tempo', porque: '$E = P\\,\\Delta t$, com $P$ em watts e $\\Delta t$ em segundos dá $E$ em joules.', calculo: 'E = ' + tex(P) + ' \\times ' + tex(ts) + eqI(EJ) + '\\,\\mathrm{J}' },
              ],
              dados: { contexto, P, tmin },
            };
            erros = [
              { codigo: 'tempo_em_minutos', valor: P * tmin, explicacao: (vt) => 'Usaste o tempo em minutos e obtiveste ' + vt(P * tmin, UN.J) + '. Em joules o tempo está em segundos: $' + tex(tmin) + '\\,\\mathrm{min} = ' + tex(ts) + '\\,\\mathrm{s}$.' },
              { codigo: 'kwh_como_3600_joules', valor: Ekwh * 3600, explicacao: (vt) => 'Passaste os kWh a joules com $1\\,\\mathrm{kWh} = 3600\\,\\mathrm{J}$ e obtiveste ' + vt(Ekwh * 3600, UN.J) + '. Mas $3600\\,\\mathrm{J}$ é $1\\,\\mathrm{W\\,h}$; $1\\,\\mathrm{kWh} = 3{,}6 \\times 10^{6}\\,\\mathrm{J}$.' },
              { codigo: 'converteu_minutos_em_segundos_com_3600', valor: P * tmin * 3600, explicacao: (vt) => 'Passaste os minutos a segundos multiplicando por 3600 e obtiveste ' + vt(P * tmin * 3600, UN.J) + '. Um minuto tem 60 s ($3600\\,\\mathrm{s}$ é uma hora).' },
            ];
            verificacao = () => ({ passo: 'Por kWh: $E = P\\,\\Delta t$ em kW e h, e multiplicar por $3{,}6 \\times 10^{6}\\,\\mathrm{J}$', calculo: 'E = ' + tex(kW, 4) + ' \\times ' + tex(th, 4) + ' = ' + tex(Ekwh, 4) + '\\,\\mathrm{kWh};\\ ' + tex(Ekwh, 4) + ' \\times 3{,}6 \\times 10^{6}' + eqN(EJ, true) + '\\,\\mathrm{J}', valor: Ekwh * 3.6e6 });
          }
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'potencia') return confereN(p, (d.R * d.I) * d.I, UN.W);
      if (d.contexto === 'efeito-joule') return confereN(p, (d.R * d.I) * d.I * d.tmin * 60, UN.J);
      if (d.contexto === 'energia-kwh') return confereN(p, (d.P * d.tmin * 60) / KWH, UN.kWh);
      return confereN(p, (d.P / 1000) * (d.tmin / 60) * KWH, UN.J);
    },
    limites(p) {
      const d = p.dados;
      if (d.R !== undefined) return d.R * d.I * d.I <= 300 && d.I <= 1.5;
      return d.P >= 400 && d.P <= 2200 && d.tmin >= 15 && d.tmin <= 180;
    },
  });

  function maiuscula(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
})();
