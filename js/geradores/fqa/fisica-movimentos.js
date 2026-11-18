globalThis.Manual = globalThis.Manual || {};

// Geradores de Física e Química A — Física, tema «Energia e movimentos».
// Subtemas: sistema-mecanico, trabalho, energia-mecanica (ids <subtema>-<tipo>).
// Os valores físicos vêm só de Manual.dadosFisica (g) e os cálculos de Manual.fisica; verificarIndependente e a
// verificação usam outro caminho (contas diretas com os dados do item, componentes da força, regresso ao dado…).
// Convenções: W = F d cos α (sinal dado pelo ângulo); W_P = −ΔEpg; W_FR = ΔEc; W_FNC = ΔEm.
// Manual.dadosFisica e Manual.fisica só são lidos dentro de gerar (carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const Fis = () => Manual.fisica;
  const gv = () => Manual.dadosFisica.constantes.g;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const { tex, fechar, confere, entre } = A;
  const tentar = (construir) => A.tentar(construir, 'movimentos');

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'fqa', tema: 'movimentos', id: def.subtema + '-' + def.tipo }, def));
  }

  // ---------------------------------------------------------------- números
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
    if (exI(v)) return tex(v, 4);
    const a = Math.abs(v);
    if (a >= 1e5 || a < 1e-3) return cient(v, 4);
    if (a >= 1000) return tex(aAS(v, 4), 0);
    return (v < 0 ? '-' : '') + a.toPrecision(4).replace('.', '{,}');
  }
  // « = valor » ou « ≈ valor » de um resultado intermédio; ok = false quando algum operando já foi arredondado.
  const eqI = (v, ok = true) => (ok && exI(v) ? ' = ' : ' \\approx ') + texI(v);
  // O mesmo para um resultado mostrado com a precisão da resposta (3 a.s.).
  const eqN = (v, ok = true) => (ok && exatoAS(v, 3) ? ' = ' : ' \\approx ') + texN(v);
  const parI = (v) => (v < 0 ? '(' + texI(v) + ')' : texI(v));
  // Dado do enunciado: $2,5\,kg$.
  const q = (v, u) => '$' + tex(v) + '\\,' + u + '$';
  // Número entre parênteses se for negativo (sem sinais duplos nas contas).
  const par = (v) => (v < 0 ? '(' + tex(v) + ')' : tex(v));
  const parN = (v) => (v < 0 ? '(' + texN(v) + ')' : texN(v));
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  // Fração em LaTeX, sem «/1» (com denominador 1 fica só o numerador).
  const sobre = (num, den) => (den === '1' ? num : '\\dfrac{' + num + '}{' + den + '}');
  // «um atleta de 50 kg»; com acompanhante, «um ciclista com a sua bicicleta (massa total de 70 kg)».
  const comMassa = (nome, mTxt) => (/ com /.test(nome) ? nome + ' (massa total de ' + mTxt + ')' : nome + ' de ' + mTxt);

  const U = {
    J: '\\mathrm{J}', kJ: '\\mathrm{kJ}', ms: '\\mathrm{m\\,s^{-1}}', m: '\\mathrm{m}', kg: '\\mathrm{kg}', g: '\\mathrm{g}',
    N: '\\mathrm{N}', kmh: '\\mathrm{km\\,h^{-1}}', pct: '\\%',
  };
  const gTxt = () => '$g = ' + tex(gv()) + '\\,\\mathrm{m\\,s^{-2}}$';
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
    const candidatos = o.erros
      .filter((e) => e && Number.isFinite(e.valor))
      .map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }))
      .filter((e) => Math.abs(e.valor) > 10 * tol && Math.abs(e.valor) > 1e-4 * R && Math.abs(e.valor) < 1e4 * R);
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

  // ================================================================ sistema-mecanico
  // Corpos para a energia cinética: massa em gramas (g) ou velocidade em km/h (kmh, v em m/s com 3,6 v inteiro).
  const CORPOS_EC = [
    { nome: 'uma bola de ténis', g: [55, 60, 1], v: [20, 25, 30, 35, 40] },
    { nome: 'uma bola de golfe', g: [44, 46, 1], v: [30, 40, 50, 60] },
    { nome: 'uma bola de futebol', g: [410, 450, 10], v: [10, 15, 20, 25, 30] },
    { nome: 'um carrinho de laboratório', g: [200, 800, 50], v: [0.5, 1, 1.5, 2, 2.5, 3] },
    { nome: 'um ciclista com a sua bicicleta', kg: [60, 95, 5], v: [5, 7.5, 10, 12.5] },
    { nome: 'um atleta', kg: [50, 80, 5], v: [2.5, 5] },
    { nome: 'um automóvel', kg: [900, 1500, 100], v: [10, 12.5, 15, 20, 25] },
  ];
  const kmh = (v) => A.limpo(v * 3.6);

  registar({
    subtema: 'sistema-mecanico', tipo: 'ec-epg', nome: 'Energia cinética, energia potencial gravítica e a sua variação',
    formatos: ['numerica', 'escolha'], contextos: ['ec', 'epg', 'variacao-epg'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        let ex, exato, erros, verificacao;
        if (contexto === 'ec') {
          const c = escolher(rng, CORPOS_EC);
          const emG = !!c.g;
          const mG = emG ? entre(rng, c.g[0], c.g[1], c.g[2]) : null;
          const m = emG ? A.limpo(mG / 1000) : entre(rng, c.kg[0], c.kg[1], c.kg[2]);
          const v = escolher(rng, c.v);
          const vk = kmh(v);
          exato = 0.5 * m * v * v;
          const conv = emG
            ? { passo: 'Passar a massa a quilogramas', porque: 'No SI a massa exprime-se em kg, e $1\\,\\mathrm{kg} = 1000\\,\\mathrm{g}$.', calculo: 'm = ' + tex(mG) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}' }
            : { passo: 'Passar a velocidade a metros por segundo', porque: '$1\\,\\mathrm{km\\,h^{-1}} = \\dfrac{1000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}$, por isso divide-se por 3,6.', calculo: 'v = \\dfrac{' + tex(vk) + '}{3{,}6} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}' };
          ex = {
            enunciado: 'Calcula a energia cinética de ' + comMassa(c.nome, emG ? q(mG, U.g) : q(m, U.kg)) + ', que se move a ' + (emG ? q(v, U.ms) : q(vk, U.kmh)) + ', em joules.',
            resolucao: [conv, {
              passo: 'Aplicar a expressão da energia cinética', porque: '$E_c = \\tfrac{1}{2} m v^2$, com a massa em kg e a velocidade em $\\mathrm{m\\,s^{-1}}$: a energia sai em joules.',
              calculo: 'E_c = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(v) + '^2' + igual(exato) + texN(exato) + '\\,\\mathrm{J}',
            }],
            dados: { contexto, m, v },
          };
          erros = [
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: m * v * v, explicacao: (vt) => 'Calculaste $m v^2$ e obtiveste ' + vt(m * v * v, U.J) + '. Falta o $\\tfrac{1}{2}$ de $E_c = \\tfrac{1}{2} m v^2$.' },
            { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 0.5 * m * v, explicacao: (vt) => 'Obtiveste ' + vt(0.5 * m * v, U.J) + ' porque não elevaste a velocidade ao quadrado. A energia cinética é proporcional a $v^2$.' },
          ];
          if (emG) erros.push({ codigo: 'massa_em_gramas', valor: 0.5 * mG * v * v, explicacao: (vt) => 'Usaste a massa em gramas e obtiveste ' + vt(0.5 * mG * v * v, U.J) + '. No SI a massa está em kg ($' + tex(mG) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}$).' });
          else erros.push({ codigo: 'velocidade_em_km_h', valor: 0.5 * m * vk * vk, explicacao: (vt) => 'Usaste a velocidade em $\\mathrm{km\\,h^{-1}}$ e obtiveste ' + vt(0.5 * m * vk * vk, U.J) + '. Primeiro passa-se a $\\mathrm{m\\,s^{-1}}$ ($' + tex(vk) + '\\,\\mathrm{km\\,h^{-1}} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}$).' });
          verificacao = () => ({ passo: 'Voltar à velocidade, com $v = \\sqrt{2E_c/m}$ (com $E_c$ por arredondar)', calculo: 'v = \\sqrt{' + sobre('2 \\times ' + texI(exato), tex(m)) + '}' + eqI(Math.sqrt(2 * exato / m), exI(exato)) + '\\,\\mathrm{m\\,s^{-1}}', valor: Fis().ec(m, v) });
        } else if (contexto === 'epg') {
          // Nível de referência acima do chão: h = h1 − h2.
          const cen = escolher(rng, [
            { obj: 'Um livro', m: [0.3, 1.5, 0.1], onde: 'numa prateleira', h1: [1.5, 2.2, 0.1], ref: 'o tampo de uma mesa', h2: [0.7, 0.8, 0.05] },
            { obj: 'Um vaso', m: [1, 5, 0.5], onde: 'numa varanda', h1: [4, 12, 0.5], ref: 'o topo de um muro', h2: [1, 2, 0.5] },
            { obj: 'Uma mochila', m: [2, 8, 0.5], onde: 'no cimo de um armário', h1: [1.8, 2.4, 0.1], ref: 'o assento de uma cadeira', h2: [0.4, 0.5, 0.05] },
          ]);
          const m = entre(rng, cen.m[0], cen.m[1], cen.m[2]);
          const h1 = entre(rng, cen.h1[0], cen.h1[1], cen.h1[2]);
          const h2 = entre(rng, cen.h2[0], cen.h2[1], cen.h2[2]);
          const h = A.limpo(h1 - h2);
          exato = m * g * h;
          ex = {
            enunciado: cen.obj + ' de ' + q(m, U.kg) + ' está ' + cen.onde + ', a ' + q(h1, U.m) + ' do chão. Calcula a energia potencial gravítica do sistema ' + cen.obj.split(' ')[1] + ' + Terra, tomando como nível de referência ' + cen.ref + ', a ' + q(h2, U.m) + ' do chão (' + gTxt() + ').',
            resolucao: [
              { passo: 'Medir a altura a partir do nível de referência', porque: 'Em $E_{pg} = m g h$, a altura $h$ conta-se a partir do nível de referência escolhido, não do chão.', calculo: 'h = ' + tex(h1) + ' - ' + tex(h2) + ' = ' + tex(h) + '\\,\\mathrm{m}' },
              { passo: 'Aplicar a expressão da energia potencial gravítica', porque: '$E_{pg} = m g h$, com $m$ em kg, $g$ em $\\mathrm{m\\,s^{-2}}$ e $h$ em m.', calculo: 'E_{pg} = ' + tex(m) + ' \\times ' + tex(g) + ' \\times ' + tex(h) + igual(exato) + texN(exato) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, h1, h2 },
          };
          erros = [
            { codigo: 'epg_sem_nivel_de_referencia', valor: m * g * h1, explicacao: (vt) => 'Mediste a altura a partir do chão e obtiveste ' + vt(m * g * h1, U.J) + '. O nível de referência é ' + cen.ref + ', por isso $h = ' + tex(h1) + ' - ' + tex(h2) + ' = ' + tex(h) + '\\,\\mathrm{m}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: m * h, explicacao: (vt) => 'Calculaste só $m h$ e obtiveste ' + vt(m * h, U.J) + '. Falta multiplicar por $g = ' + tex(g) + '\\,\\mathrm{m\\,s^{-2}}$.' },
            { codigo: 'somou_as_alturas', valor: m * g * (h1 + h2), explicacao: (vt) => 'Somaste as duas alturas e obtiveste ' + vt(m * g * (h1 + h2), U.J) + '. O nível de referência está acima do chão, por isso a altura em relação a ele é a diferença, $' + tex(h) + '\\,\\mathrm{m}$.' },
          ];
          verificacao = (r) => ({ passo: 'Diferença das energias medidas a partir do chão', calculo: 'm g h_1 - m g h_2 = ' + texI(m * g * h1) + ' - ' + texI(m * g * h2) + eqI(m * g * h1 - m * g * h2, exI(m * g * h1) && exI(m * g * h2)) + '\\,\\mathrm{J}', valor: Fis().epg(m, h1) - Fis().epg(m, h2) });
        } else {
          // Variação da energia potencial gravítica entre dois andares (alturas a partir do chão).
          const m = entre(rng, 40, 90, 5);
          const hi = 3 * inteiro(rng, 1, 10);
          const hf = 3 * inteiro(rng, 1, 10);
          if (hf === hi) return null;
          const sobe = hf > hi;
          exato = m * g * (hf - hi);
          ex = {
            enunciado: 'Uma pessoa de ' + q(m, U.kg) + ' ' + (sobe ? 'sobe' : 'desce') + ' de elevador de um andar a ' + q(hi, U.m) + ' do chão para outro a ' + q(hf, U.m) + ' do chão. Calcula a variação da energia potencial gravítica do sistema pessoa + Terra (' + gTxt() + ').',
            resolucao: [
              { passo: 'Variação = final − inicial', porque: '$\\Delta E_{pg} = m g h_f - m g h_i = m g (h_f - h_i)$; o resultado não depende do nível de referência.', calculo: '\\Delta h = ' + tex(hf) + ' - ' + tex(hi) + ' = ' + tex(hf - hi) + '\\,\\mathrm{m}' },
              { passo: 'Calcular e interpretar o sinal', porque: sobe ? 'A pessoa sobe, por isso a energia potencial gravítica aumenta: $\\Delta E_{pg} > 0$.' : 'A pessoa desce, por isso a energia potencial gravítica diminui: $\\Delta E_{pg} < 0$.', calculo: '\\Delta E_{pg} = ' + tex(m) + ' \\times ' + tex(g) + ' \\times ' + par(hf - hi) + igual(exato) + texN(exato) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, hi, hf },
          };
          erros = [
            { codigo: 'variacao_com_o_sinal_trocado', valor: -exato, explicacao: (vt) => 'Fizeste inicial menos final e obtiveste ' + vt(-exato, U.J) + '. A variação é final menos inicial e a pessoa ' + (sobe ? 'sobe' : 'desce') + ', por isso $\\Delta E_{pg}$ é ' + (sobe ? 'positiva' : 'negativa') + '.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: m * (hf - hi), explicacao: (vt) => 'Calculaste só $m \\Delta h$ e obtiveste ' + vt(m * (hf - hi), U.J) + '. Falta multiplicar por $g = ' + tex(g) + '\\,\\mathrm{m\\,s^{-2}}$.' },
            { codigo: 'deu_a_energia_potencial_final', valor: m * g * hf, explicacao: (vt) => vt(m * g * hf, U.J) + ' é a energia potencial gravítica no andar final (em relação ao chão). Pede-se a variação, $m g (h_f - h_i)$.' },
          ];
          verificacao = (r) => ({ passo: 'Energias em relação ao chão, subtraídas', calculo: texI(m * g * hf) + ' - ' + texI(m * g * hi) + eqI(m * g * hf - m * g * hi) + '\\,\\mathrm{J}', valor: Fis().epg(m, hf) - Fis().epg(m, hi) });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade: 'J', u: U.J, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      const v = d.contexto === 'ec' ? (d.m * d.v * d.v) / 2 : d.contexto === 'epg' ? d.m * g * d.h1 - d.m * g * d.h2 : d.m * g * d.hf - d.m * g * d.hi;
      return confereN(p, v, U.J);
    },
    limites(p) {
      const d = p.dados;
      return d.m > 0 && d.m <= 1500 && (d.contexto !== 'epg' || d.h1 > d.h2);
    },
  });

  // Corpos para a energia mecânica (nível de referência no solo).
  const CORPOS_EM = [
    { nome: 'Um drone', curto: 'drone', m: [0.5, 2, 0.1], h: [5, 40, 1], v: [2, 12, 1] },
    { nome: 'Uma gaivota', curto: 'gaivota', m: [0.6, 1.2, 0.1], h: [10, 60, 5], v: [5, 15, 1] },
    { nome: 'Uma bola', curto: 'bola', m: [0.2, 0.6, 0.05], h: [1, 10, 0.5], v: [2, 15, 1] },
    { nome: 'Um esquiador', curto: 'esquiador', m: [50, 90, 5], h: [10, 200, 10], v: [5, 20, 1] },
  ];

  registar({
    subtema: 'sistema-mecanico', tipo: 'energia-mecanica', nome: 'Energia mecânica de um sistema',
    formatos: ['numerica', 'escolha'], contextos: ['em', 'ec-de-em'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        const c = escolher(rng, CORPOS_EM);
        const m = entre(rng, c.m[0], c.m[1], c.m[2]);
        const h = entre(rng, c.h[0], c.h[1], c.h[2]);
        const v = entre(rng, c.v[0], c.v[1], c.v[2]);
        const Ec = 0.5 * m * v * v;
        const Epg = m * g * h;
        const Em = A.limpo(Ec + Epg);
        const sis = 'o sistema ' + c.curto + ' + Terra';
        const passoEpg = { passo: 'Energia potencial gravítica', porque: '$E_{pg} = m g h$, com o nível de referência no solo.', calculo: 'E_{pg} = ' + tex(m) + ' \\times ' + tex(g) + ' \\times ' + tex(h) + igual(Epg) + texN(Epg) + '\\,\\mathrm{J}' };
        let ex, exato, erros, verificacao;
        if (contexto === 'em') {
          exato = Em;
          ex = {
            enunciado: c.nome + ' de ' + q(m, U.kg) + ' move-se a ' + q(v, U.ms) + ', a ' + q(h, U.m) + ' do solo. Calcula a energia mecânica d' + sis + ', com o nível de referência no solo (' + gTxt() + ').',
            resolucao: [
              { passo: 'Energia cinética', porque: '$E_c = \\tfrac{1}{2} m v^2$.', calculo: 'E_c = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(v) + '^2' + igual(Ec) + texN(Ec) + '\\,\\mathrm{J}' },
              passoEpg,
              { passo: 'Somar as duas energias', porque: 'A energia mecânica é a soma da energia cinética com a energia potencial gravítica: $E_m = E_c + E_{pg}$.', calculo: 'E_m = ' + texI(Ec) + ' + ' + texI(Epg) + eqN(Em) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, v, h },
          };
          erros = [
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: m * v * v + Epg, explicacao: (vt) => 'Usaste $m v^2$ na energia cinética e obtiveste ' + vt(m * v * v + Epg, U.J) + '. A energia cinética é $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'deu_so_a_energia_cinetica', valor: Ec, explicacao: (vt) => vt(Ec, U.J) + ' é só a energia cinética. A energia mecânica soma-lhe a energia potencial gravítica, $' + texI(Epg) + '\\,\\mathrm{J}$.' },
            { codigo: 'deu_so_a_energia_potencial', valor: Epg, explicacao: (vt) => vt(Epg, U.J) + ' é só a energia potencial gravítica. A energia mecânica soma-lhe a energia cinética, $' + texI(Ec) + '\\,\\mathrm{J}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Ec + m * h, explicacao: (vt) => 'Usaste $m h$ na energia potencial gravítica e obtiveste ' + vt(Ec + m * h, U.J) + '. Falta multiplicar por $g$: $E_{pg} = m g h$.' },
          ];
          verificacao = (r) => ({ passo: 'Pôr a massa em evidência: $E_m = m\\left(\\tfrac{1}{2} v^2 + g h\\right)$', calculo: '\\tfrac{1}{2} v^2 + g h = ' + texI(v * v / 2) + ' + ' + texI(g * h) + ' = ' + texI(v * v / 2 + g * h) + '\\,\\mathrm{J\\,kg^{-1}};\\ E_m = ' + tex(m) + ' \\times ' + texI(v * v / 2 + g * h) + eqN(m * (v * v / 2 + g * h)) + '\\,\\mathrm{J}', valor: Fis().em(m, v, h) });
        } else {
          exato = Ec;
          ex = {
            enunciado: c.nome + ' de ' + q(m, U.kg) + ' está a ' + q(h, U.m) + ' do solo, e a energia mecânica d' + sis + ' é $' + tex(Em) + '\\,\\mathrm{J}$ (nível de referência no solo; ' + gTxt() + '). Calcula a energia cinética nesse instante.',
            resolucao: [
              passoEpg,
              { passo: 'Tirar a energia potencial à energia mecânica', porque: 'De $E_m = E_c + E_{pg}$ vem $E_c = E_m - E_{pg}$.', calculo: 'E_c = ' + texI(Em) + ' - ' + texI(Epg) + eqN(Ec) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, Em, h },
          };
          erros = [
            { codigo: 'somou_a_energia_potencial', valor: Em + Epg, explicacao: (vt) => 'Somaste a energia potencial gravítica e obtiveste ' + vt(Em + Epg, U.J) + '. Como $E_m = E_c + E_{pg}$, a energia cinética é a diferença, $E_m - E_{pg}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Em - m * h, explicacao: (vt) => 'Usaste $m h$ como energia potencial gravítica e obtiveste ' + vt(Em - m * h, U.J) + '. Falta multiplicar por $g$: $E_{pg} = ' + texI(Epg) + '\\,\\mathrm{J}$.' },
            { codigo: 'deu_a_energia_potencial', valor: Epg, explicacao: (vt) => vt(Epg, U.J) + ' é a energia potencial gravítica. A energia cinética é o que falta para a energia mecânica, $E_m - E_{pg}$.' },
          ];
          verificacao = () => ({ passo: 'Somar de novo $E_c + E_{pg}$ (com $E_c$ por arredondar): tem de dar a energia mecânica dada', calculo: texI(Ec) + ' + ' + texI(Epg) + ' = ' + texI(Ec + Epg) + '\\,\\mathrm{J} = E_m', valor: Fis().ec(m, v) });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade: 'J', u: U.J, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      return confereN(p, d.contexto === 'em' ? d.m * (d.v * d.v / 2 + g * d.h) : d.Em - d.m * g * d.h, U.J);
    },
    limites(p) {
      return p.dados.m > 0 && p.dados.h > 0;
    },
  });

  // Corpos para obter a massa, a velocidade ou a altura a partir da energia (valores que dão respostas exatas).
  const CORPOS_MV = [
    { nome: 'um carrinho', m: [0.2, 0.8, 0.1], v: [1, 4, 0.5] },
    { nome: 'um skater com o seu skate', m: [40, 80, 5], v: [2, 8, 1] },
    { nome: 'um ciclista com a sua bicicleta', m: [60, 95, 5], v: [4, 12, 1] },
    { nome: 'um automóvel', m: [800, 1500, 50], v: [5, 30, 5] },
  ];

  registar({
    subtema: 'sistema-mecanico', tipo: 'massa-velocidade', nome: 'Velocidade, massa ou altura a partir da energia',
    formatos: ['numerica', 'escolha'], contextos: ['v-de-ec', 'm-de-ec', 'h-de-epg'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'h-de-epg') {
          const cen = escolher(rng, [['Um vaso', 'vaso', [1, 5, 0.5], [1, 12, 0.5]], ['Uma caixa', 'caixa', [2, 20, 1], [0.5, 3, 0.5]], ['Um alpinista', 'alpinista', [50, 90, 5], [20, 500, 10]]]);
          const m = entre(rng, cen[2][0], cen[2][1], cen[2][2]);
          const h = entre(rng, cen[3][0], cen[3][1], cen[3][2]);
          const Epg = A.limpo(m * g * h);
          exato = h;
          unidade = 'm';
          u = U.m;
          ex = {
            enunciado: cen[0] + ' de ' + q(m, U.kg) + ' está a uma altura $h$ do chão. A energia potencial gravítica do sistema ' + cen[1] + ' + Terra, com o nível de referência no chão, é $' + tex(Epg) + '\\,\\mathrm{J}$ (' + gTxt() + '). Calcula $h$.',
            resolucao: [{ passo: 'Isolar $h$ em $E_{pg} = m g h$', porque: 'Divide-se a energia pelo produto $m g$ (a massa em kg e $g$ em $\\mathrm{m\\,s^{-2}}$ dão a altura em m).', calculo: 'h = \\dfrac{E_{pg}}{m g} = \\dfrac{' + tex(Epg) + '}{' + tex(m) + ' \\times ' + tex(g) + '}' + igual(h) + texN(h) + '\\,\\mathrm{m}' }],
            dados: { contexto, m, Epg },
          };
          erros = [
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Epg / m, explicacao: (vt) => 'Dividiste só pela massa e obtiveste ' + vt(Epg / m, U.m) + '. Em $E_{pg} = m g h$ também está $g$: $h = E_{pg}/(m g)$.' },
            { codigo: 'esqueceu_a_massa', valor: Epg / g, explicacao: (vt) => 'Dividiste só por $g$ e obtiveste ' + vt(Epg / g, U.m) + '. Falta a massa: $h = E_{pg}/(m g)$.' },
            { codigo: 'dividiu_ao_contrario', valor: (m * g) / Epg, explicacao: (vt) => 'Calculaste $m g / E_{pg}$ e obtiveste ' + vt((m * g) / Epg, U.m) + '. É ao contrário: $h = E_{pg}/(m g)$.' },
          ];
          verificacao = (r) => ({ passo: 'Recalcular a energia com a altura obtida', calculo: 'E_{pg} = ' + tex(m) + ' \\times ' + tex(g) + ' \\times ' + texN(r) + igual(m * g * r) + texN(m * g * r) + '\\,\\mathrm{J}', valor: Epg / (m * g) });
        } else {
          const c = escolher(rng, CORPOS_MV);
          const m = entre(rng, c.m[0], c.m[1], c.m[2]);
          const v = entre(rng, c.v[0], c.v[1], c.v[2]);
          const Ec = A.limpo(0.5 * m * v * v);
          if (contexto === 'v-de-ec') {
            exato = v;
            unidade = 'm/s';
            u = U.ms;
            ex = {
              enunciado: 'A energia cinética de ' + comMassa(c.nome, q(m, U.kg)) + ' é $' + tex(Ec) + '\\,\\mathrm{J}$. Com que velocidade se move?',
              resolucao: [
                { passo: 'Isolar $v^2$ em $E_c = \\tfrac{1}{2} m v^2$', porque: 'Multiplica-se por 2 e divide-se pela massa.', calculo: 'v^2 = \\dfrac{2 E_c}{m} = ' + sobre('2 \\times ' + tex(Ec), tex(m)) + ' = ' + tex(v * v) + '\\,\\mathrm{m^2\\,s^{-2}}' },
                { passo: 'Tirar a raiz quadrada', porque: 'Pede-se $v$, não $v^2$.', calculo: 'v = \\sqrt{' + tex(v * v) + '}' + igual(v) + texN(v) + '\\,\\mathrm{m\\,s^{-1}}' },
              ],
              dados: { contexto, m, Ec },
            };
            erros = [
              { codigo: 'esqueceu_raiz', valor: v * v, explicacao: (vt) => 'Obtiveste ' + vt(v * v) + ', que é $v^2$ (em $\\mathrm{m^2\\,s^{-2}}$). Falta a raiz quadrada.' },
              { codigo: 'esqueceu_o_fator_2', valor: Math.sqrt(Ec / m), explicacao: (vt) => 'Calculaste $\\sqrt{E_c/m}$ e obtiveste ' + vt(Math.sqrt(Ec / m), U.ms) + ', sem o 2. De $E_c = \\tfrac{1}{2} m v^2$ vem $v = \\sqrt{2E_c/m}$.' },
              { codigo: 'multiplicou_pelo_meio_em_vez_de_dividir', valor: Math.sqrt(Ec / (2 * m)), explicacao: (vt) => 'Multiplicaste por $\\tfrac{1}{2}$ em vez de dividir e obtiveste ' + vt(Math.sqrt(Ec / (2 * m)), U.ms) + '. Para isolar $v^2$, o $\\tfrac{1}{2}$ passa a multiplicar por 2: $v = \\sqrt{2E_c/m}$.' },
            ];
            verificacao = (r) => ({ passo: 'Recalcular a energia cinética com a velocidade obtida', calculo: '\\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + texN(r) + '^2' + igual(0.5 * m * r * r) + texN(0.5 * m * r * r) + '\\,\\mathrm{J}', valor: Fis().vDeEc(Ec, m) });
          } else {
            exato = m;
            unidade = 'kg';
            u = U.kg;
            ex = {
              enunciado: c.nome.charAt(0).toUpperCase() + c.nome.slice(1) + ' move-se a ' + q(v, U.ms) + ' e tem $' + tex(Ec) + '\\,\\mathrm{J}$ de energia cinética. Calcula a sua massa.',
              resolucao: [{ passo: 'Isolar $m$ em $E_c = \\tfrac{1}{2} m v^2$', porque: 'Multiplica-se por 2 e divide-se por $v^2$.', calculo: 'm = \\dfrac{2 E_c}{v^2} = \\dfrac{2 \\times ' + tex(Ec) + '}{' + tex(v) + '^2}' + igual(m) + texN(m) + '\\,\\mathrm{kg}' }],
              dados: { contexto, v, Ec },
            };
            erros = [
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: Ec / (v * v), explicacao: (vt) => 'Calculaste $E_c / v^2$ e obtiveste ' + vt(Ec / (v * v), U.kg) + ', como se fosse $E_c = m v^2$. Com o $\\tfrac{1}{2}$, $m = 2E_c/v^2$.' },
              { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 2 * Ec / v, explicacao: (vt) => 'Dividiste por $v$ e não por $v^2$, e obtiveste ' + vt(2 * Ec / v, U.kg) + '. A energia cinética depende do quadrado da velocidade.' },
              { codigo: 'multiplicou_pelo_meio_em_vez_de_dividir', valor: Ec / (2 * v * v), explicacao: (vt) => 'Multiplicaste por $\\tfrac{1}{2}$ em vez de dividir e obtiveste ' + vt(Ec / (2 * v * v), U.kg) + '. Para isolar $m$, o $\\tfrac{1}{2}$ passa a multiplicar por 2: $m = 2E_c/v^2$.' },
            ];
            verificacao = (r) => ({ passo: 'Recalcular a energia cinética com a massa obtida', calculo: '\\tfrac{1}{2} \\times ' + texN(r) + ' \\times ' + tex(v) + '^2' + igual(0.5 * r * v * v) + texN(0.5 * r * v * v) + '\\,\\mathrm{J}', valor: (2 * Ec) / (v * v) });
          }
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      if (d.contexto === 'h-de-epg') return confereN(p, d.Epg / d.m / g, U.m);
      if (d.contexto === 'v-de-ec') return confereN(p, Math.sqrt(d.Ec / (d.m / 2)), U.ms);
      return confereN(p, d.Ec / (d.v * d.v / 2), U.kg);
    },
    limites(p) {
      return (p.dados.Ec || p.dados.Epg) > 0;
    },
  });

  // ================================================================ trabalho
  const rad = (a) => (a * Math.PI) / 180;
  // Trabalho pelas componentes: W = F_x d, com F_x = F cos α (Math.cos; o ruído de vírgula flutuante perto de 0 conta como 0).
  const trabalhoComponentes = (F, d, a) => {
    const w = F * Math.cos(rad(a)) * d;
    return Math.abs(w) < 1e-9 ? 0 : w;
  };
  const cosTex = (a) => '\\cos ' + a + '°';
  const tipoTrabalho = (a) => (a < 90 ? 'potente ($W > 0$)' : a === 90 ? 'nulo ($W = 0$)' : 'resistente ($W < 0$)');

  registar({
    subtema: 'trabalho', tipo: 'forca-constante', nome: 'Trabalho de uma força constante e o seu sinal',
    formatos: ['numerica', 'escolha'], contextos: ['angulo', 'resistente', 'vertical'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const F = entre(rng, 10, 100, 5);
        const d = entre(rng, 1, 10, 0.5);
        let alfa, theta = null, enunciado;
        if (contexto === 'angulo') {
          // α = 0° nunca dá erros típicos distintos; α = 90° (W = 0) só em numérica e em cerca de 12 % dos itens
          alfa = formato === 'numerica' && rng() < 0.12 ? 90 : escolher(rng, [30, 45, 60]);
          enunciado = 'Um caixote desloca-se ' + q(d, U.m) + ' num chão horizontal. Uma das forças que atuam nele é constante, de intensidade ' + q(F, U.N) + ', e faz um ângulo de ' + alfa + '° com o deslocamento. Calcula o trabalho realizado por essa força.';
        } else if (contexto === 'resistente') {
          alfa = escolher(rng, [120, 135, 150, 180]);
          enunciado = 'Um carrinho desloca-se ' + q(d, U.m) + ' em linha reta. Uma pessoa exerce nele uma força constante de ' + q(F, U.N) + ', que faz um ângulo de ' + alfa + '° com o sentido do deslocamento. Calcula o trabalho realizado por essa força.';
        } else {
          theta = escolher(rng, [30, 45, 60]);
          alfa = 90 - theta;
          enunciado = 'Um trenó é puxado ' + q(d, U.m) + ' num chão horizontal por uma corda que exerce uma força constante de ' + q(F, U.N) + ' e faz um ângulo de ' + theta + '° com a vertical. Calcula o trabalho realizado pela força que a corda exerce.';
        }
        const exato = Fis().trabalho(F, d, alfa);
        const Fd = F * d;
        const resolucao = [];
        if (theta !== null) resolucao.push({ passo: 'Ângulo entre a força e o deslocamento', porque: 'O deslocamento é horizontal e a vertical é perpendicular a ele, por isso a força faz com o deslocamento o complementar do ângulo dado.', calculo: '\\alpha = 90° - ' + theta + '° = ' + alfa + '°' });
        resolucao.push({
          passo: 'Aplicar $W = F d \\cos\\alpha$', porque: 'Só a componente da força na direção do deslocamento, $F\\cos\\alpha$, realiza trabalho. Com $\\alpha = ' + alfa + '°$ o trabalho é ' + tipoTrabalho(alfa) + '.',
          calculo: 'W = ' + tex(F) + ' \\times ' + tex(d) + ' \\times ' + cosTex(alfa) + (exato === 0 ? ' = 0' : igual(exato) + texN(exato)) + '\\,\\mathrm{J}',
        });
        const erros = [];
        if (theta !== null) erros.push({ codigo: 'usou_o_angulo_com_a_vertical', valor: Fd * Math.cos(rad(theta)), explicacao: (vt) => 'Usaste o ângulo com a vertical ($' + theta + '°$) e obtiveste ' + vt(Fd * Math.cos(rad(theta)), U.J) + '. O ângulo do trabalho é o que a força faz com o deslocamento, $\\alpha = 90° - ' + theta + '° = ' + alfa + '°$.' });
        // O sinal trocado vem antes de «esqueceu o cosseno»: a 180° os dois dão +F d, e o erro é o do sinal.
        if (alfa > 90) erros.push({ codigo: 'sinal_do_trabalho_trocado', valor: -exato, explicacao: (vt) => 'Obtiveste ' + vt(-exato, U.J) + ', com o sinal trocado. Com $\\alpha = ' + alfa + '°$ (maior do que $90°$) o cosseno é negativo e o trabalho é resistente.' });
        erros.push({ codigo: 'esqueceu_o_cosseno', valor: Fd, explicacao: (vt) => 'Calculaste $F d$ e obtiveste ' + vt(Fd, U.J) + ', como se a força tivesse a direção do deslocamento. Só a componente eficaz realiza trabalho, por isso multiplica-se por $' + cosTex(alfa) + '$.' });
        if (theta === null) erros.push({ codigo: 'usou_o_seno_em_vez_do_cosseno', valor: Fd * Math.sin(rad(alfa)), explicacao: (vt) => 'Usaste $\\sin ' + alfa + '°$ e obtiveste ' + vt(Fd * Math.sin(rad(alfa)), U.J) + '. O trabalho usa o cosseno do ângulo entre a força e o deslocamento.' });
        erros.push({ codigo: 'calculadora_em_radianos', valor: Fd * Math.cos(alfa), explicacao: (vt) => 'Obtiveste ' + vt(Fd * Math.cos(alfa), U.J) + ' com a calculadora em radianos (calculaste o cosseno de ' + alfa + ' radianos). O ângulo está em graus.' });
        const ex = { enunciado, resolucao, dados: { contexto, F, d, alfa }, esquema: { id: 'fqa-trabalho', opcoes: { F, d, alfa } } };
        const verificacao = (r) => {
          const Fx = F * Math.cos(rad(alfa));
          const zero = Math.abs(Fx) < 1e-9;
          return { passo: 'Pela componente da força na direção do deslocamento, $F_x = F\\cos\\alpha$', calculo: 'F_x = ' + tex(F) + ' \\times ' + cosTex(alfa) + (zero ? ' = 0' : eqI(Fx)) + '\\,\\mathrm{N};\\ W = F_x\\,d' + (r === 0 ? ' = 0' : (exI(Fx) ? ' = ' + texI(Fx) + ' \\times ' + tex(d) : '') + eqN(Fx * d, exI(Fx))) + '\\,\\mathrm{J}', valor: trabalhoComponentes(F, d, alfa) };
        };
        if (exato !== 0) return fecharNum(rng, formato, ex, exato, { erros, unidade: 'J', u: U.J, verificacao });
        // α = 90°: W = 0 (só em numérica; na escolha não há 3 erros distintos e tentar re-sorteia).
        const v = verificacao(0);
        const errosZero = erros.map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) })).filter((e) => Math.abs(e.valor) > 5);
        const sci = precisaSci(errosZero.map((e) => e.valor).concat([1]));
        ex.dados.sci = sci;
        return fechar(rng, formato, ex, {
          resposta: 0, tolerancia: 0.5, unidade: 'J', texto: textoDe(U.J, sci), verificacao: Object.assign({}, v, { valor: 0 }),
          erros: errosZero.map((e) => explicar(e, vtDe(sci))),
        });
      });
    },
    verificarIndependente(p) {
      const { F, d, alfa } = p.dados;
      const w = trabalhoComponentes(F, d, alfa);
      return w === 0 ? confere(p, 0, textoDe(U.J, p.dados.sci)) : confereN(p, w, U.J);
    },
    limites(p) {
      const { F, d, alfa } = p.dados;
      return F > 0 && F <= 100 && d > 0 && d <= 10 && alfa >= 0 && alfa <= 180;
    },
  });

  const CORPOS_TEC = [
    { nome: 'Um carrinho', m: [0.5, 2, 0.5], v: [1, 6] },
    { nome: 'Um ciclista com a sua bicicleta', m: [60, 90, 5], v: [2, 12] },
    { nome: 'Um automóvel', m: [900, 1500, 100], v: [5, 30] },
  ];

  registar({
    subtema: 'trabalho', tipo: 'tec', nome: 'Trabalho da resultante e Teorema da Energia Cinética',
    formatos: ['numerica', 'escolha'], contextos: ['w-de-v', 'soma-trabalhos', 'v-de-w'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ex, exato, erros, verificacao, unidade = 'J', u = U.J;
        if (contexto === 'w-de-v') {
          const c = escolher(rng, CORPOS_TEC);
          const m = entre(rng, c.m[0], c.m[1], c.m[2]);
          const vi = inteiro(rng, c.v[0], c.v[1]);
          const vf = inteiro(rng, c.v[0], c.v[1]);
          if (Math.abs(vf - vi) < 2) return null;
          const Eci = 0.5 * m * vi * vi, Ecf = 0.5 * m * vf * vf;
          exato = Ecf - Eci;
          const acelera = vf > vi;
          ex = {
            enunciado: comMassa(c.nome, q(m, U.kg)) + ' desloca-se em linha reta e a sua velocidade passa de ' + q(vi, U.ms) + ' para ' + q(vf, U.ms) + '. Calcula o trabalho realizado pela resultante das forças que nele atuam.',
            resolucao: [
              { passo: 'Energias cinéticas inicial e final', porque: '$E_c = \\tfrac{1}{2} m v^2$ em cada instante.', calculo: 'E_{c,i} = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(vi) + '^2' + eqI(Eci) + '\\,\\mathrm{J};\\ E_{c,f} = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(vf) + '^2' + eqI(Ecf) + '\\,\\mathrm{J}' },
              { passo: 'Teorema da Energia Cinética', porque: '$W_{F_R} = \\Delta E_c = E_{c,f} - E_{c,i}$. ' + (acelera ? 'A velocidade aumenta, por isso o trabalho da resultante é positivo.' : 'A velocidade diminui, por isso o trabalho da resultante é negativo.'), calculo: 'W_{F_R} = ' + texI(Ecf) + ' - ' + texI(Eci) + eqN(exato, exI(Ecf) && exI(Eci)) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, vi, vf },
          };
          erros = [
            { codigo: 'quadrado_da_diferenca_de_velocidades', valor: 0.5 * m * (vf - vi) * (vf - vi), explicacao: (vt) => 'Calculaste $\\tfrac{1}{2} m (\\Delta v)^2$ e obtiveste ' + vt(0.5 * m * (vf - vi) * (vf - vi), U.J) + '. A variação é das energias cinéticas, $\\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2$.' },
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 2 * exato, explicacao: (vt) => 'Obtiveste ' + vt(2 * exato, U.J) + ' por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'variacao_com_o_sinal_trocado', valor: -exato, explicacao: (vt) => 'Fizeste inicial menos final e obtiveste ' + vt(-exato, U.J) + '. $\\Delta E_c = E_{c,f} - E_{c,i}$, ' + (acelera ? 'positivo porque o corpo acelera' : 'negativo porque o corpo trava') + '.' },
            { codigo: 'deu_a_energia_cinetica_final', valor: Ecf, explicacao: (vt) => vt(Ecf, U.J) + ' é a energia cinética final. O trabalho da resultante é a variação, $E_{c,f} - E_{c,i}$.' },
          ];
          verificacao = (r) => ({ passo: 'Fatorizar: $\\Delta E_c = \\tfrac{1}{2} m (v_f - v_i)(v_f + v_i)$', calculo: '\\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + par(vf - vi) + ' \\times ' + tex(vf + vi) + eqN(0.5 * m * (vf - vi) * (vf + vi)) + '\\,\\mathrm{J}', valor: Fis().ec(m, vf) - Fis().ec(m, vi) });
        } else if (contexto === 'soma-trabalhos') {
          const m = entre(rng, 5, 30, 1);
          const F = entre(rng, 20, 100, 5);
          const alfa = escolher(rng, [0, 30, 45, 60]); // com 0°, «esqueceu o cosseno» coincide com o atrito esquecido: só em numérica
          const Fa = entre(rng, 5, 40, 5);
          const d = entre(rng, 2, 10, 1);
          const WF = Fis().trabalho(F, d, alfa);
          const Wa = Fis().trabalho(Fa, d, 180);
          if (WF + Wa < 0.2 * F * d) return null;
          exato = WF + Wa;
          ex = {
            enunciado: 'Um caixote de ' + q(m, U.kg) + ' é arrastado ' + q(d, U.m) + ' num chão horizontal por uma força constante de ' + q(F, U.N) + (alfa === 0 ? ' paralela ao chão' : ' que faz ' + alfa + '° com o deslocamento') + '. A força de atrito tem intensidade constante de ' + q(Fa, U.N) + '. Calcula o trabalho realizado pela resultante das forças.',
            resolucao: [
              { passo: 'Peso e força normal', porque: 'São perpendiculares ao deslocamento horizontal ($\\alpha = 90°$, $\\cos 90° = 0$): não realizam trabalho.' },
              { passo: 'Trabalho da força aplicada', porque: '$W = F d \\cos\\alpha$.', calculo: 'W_F = ' + tex(F) + ' \\times ' + tex(d) + ' \\times ' + cosTex(alfa) + eqI(WF) + '\\,\\mathrm{J}' },
              { passo: 'Trabalho da força de atrito', porque: 'O atrito tem sentido oposto ao do deslocamento ($\\alpha = 180°$): o seu trabalho é negativo.', calculo: 'W_{F_a} = ' + tex(Fa) + ' \\times ' + tex(d) + ' \\times \\cos 180° = ' + tex(Wa) + '\\,\\mathrm{J}' },
              { passo: 'Somar os trabalhos', porque: 'O trabalho da resultante é a soma dos trabalhos de todas as forças.', calculo: 'W_{F_R} = ' + texI(WF) + ' + ' + par(Wa) + eqN(exato, exI(WF)) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, F, alfa, Fa, d },
            esquema: { id: 'fqa-trabalho', opcoes: { F, d, alfa } },
          };
          erros = [
            { codigo: 'esqueceu_o_trabalho_do_atrito', valor: WF, explicacao: (vt) => vt(WF, U.J) + ' é só o trabalho da força aplicada. Falta somar o trabalho da força de atrito, $' + tex(Wa) + '\\,\\mathrm{J}$.' },
            { codigo: 'trabalho_do_atrito_positivo', valor: WF - Wa, explicacao: (vt) => 'Somaste o trabalho do atrito como positivo e obtiveste ' + vt(WF - Wa, U.J) + '. O atrito opõe-se ao deslocamento ($\\alpha = 180°$), por isso o seu trabalho é negativo.' },
            { codigo: 'esqueceu_o_cosseno', valor: F * d + Wa, explicacao: (vt) => 'Usaste $F d$ sem o $' + cosTex(alfa) + '$ e obtiveste ' + vt(F * d + Wa, U.J) + '. Só a componente da força na direção do deslocamento realiza trabalho.' },
          ];
          verificacao = (r) => {
            const FR = F * Math.cos(rad(alfa)) - Fa;
            return { passo: 'Pela resultante na direção do deslocamento, $F_R = F\\cos\\alpha - F_a$', calculo: 'F_R = ' + tex(F) + ' \\times ' + cosTex(alfa) + ' - ' + tex(Fa) + eqI(FR) + '\\,\\mathrm{N};\\ W_{F_R} = F_R\\,d' + eqN(FR * d, exI(FR)) + '\\,\\mathrm{J}', valor: FR * d };
          };
        } else {
          const c = escolher(rng, CORPOS_TEC);
          const m = entre(rng, c.m[0], c.m[1], c.m[2]);
          const vi = inteiro(rng, 0, 5);
          const d = entre(rng, 2, 20, 1);
          const FR = A.limpo(m * entre(rng, 0.5, 3, 0.5));
          const W = FR * d;
          const v2 = vi * vi + 2 * W / m;
          exato = Math.sqrt(v2);
          unidade = 'm/s';
          u = U.ms;
          ex = {
            enunciado: comMassa(c.nome, q(m, U.kg)) + (vi === 0 ? ' parte do repouso' : ' move-se a ' + q(vi, U.ms)) + ' e, ao longo de ' + q(d, U.m) + ' em linha reta, a resultante das forças que nele atuam é constante, com intensidade ' + q(FR, U.N) + ' e o sentido do movimento. Calcula a velocidade no fim desse percurso.',
            resolucao: [
              { passo: 'Trabalho da resultante', porque: 'A resultante tem o sentido do deslocamento ($\\alpha = 0°$).', calculo: 'W_{F_R} = ' + tex(FR) + ' \\times ' + tex(d) + ' = ' + tex(W) + '\\,\\mathrm{J}' },
              { passo: 'Teorema da Energia Cinética', porque: '$W_{F_R} = \\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2$, logo $v_f^2 = v_i^2 + \\dfrac{2 W_{F_R}}{m}$.', calculo: 'v_f^2 = ' + tex(vi) + '^2 + ' + sobre('2 \\times ' + tex(W), tex(m)) + eqI(v2) + '\\,\\mathrm{m^2\\,s^{-2}}' },
              { passo: 'Tirar a raiz quadrada', porque: 'Pede-se $v_f$.', calculo: 'v_f = \\sqrt{' + texI(v2) + '}' + eqN(exato, exI(v2)) + '\\,\\mathrm{m\\,s^{-1}}' },
            ],
            dados: { contexto, m, vi, d, FR },
          };
          erros = [
            { codigo: 'esqueceu_raiz', valor: v2, explicacao: (vt) => 'Obtiveste ' + vt(v2) + ', que é $v_f^2$ (em $\\mathrm{m^2\\,s^{-2}}$). Falta a raiz quadrada.' },
            { codigo: 'esqueceu_o_fator_2', valor: Math.sqrt(vi * vi + W / m), explicacao: (vt) => 'Esqueceste o 2 e obtiveste ' + vt(Math.sqrt(vi * vi + W / m), U.ms) + '. De $W = \\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2$ vem $v_f^2 = v_i^2 + 2W/m$.' },
          ];
          if (vi > 0) {
            const semVi = Math.sqrt(2 * W / m);
            erros.push({ codigo: 'esqueceu_a_velocidade_inicial', valor: semVi, explicacao: (vt) => 'Obtiveste ' + vt(semVi, U.ms) + ', como se partisse do repouso. O corpo já tinha $' + tex(vi) + '\\,\\mathrm{m\\,s^{-1}}$, por isso $v_f^2 = v_i^2 + 2W/m$.' });
            erros.push({ codigo: 'somou_as_velocidades', valor: vi + semVi, explicacao: (vt) => 'Somaste a velocidade inicial à velocidade ganha a partir do repouso e obtiveste ' + vt(vi + semVi, U.ms) + '. Somam-se as energias cinéticas (os quadrados), não as velocidades.' });
          }
          // Com v_f² por arredondar, a variação da energia cinética volta a dar o trabalho dado.
          verificacao = () => ({ passo: 'Variação da energia cinética com $v_f^2$ (por arredondar), que tem de dar $W_{F_R}$', calculo: (vi === 0 ? '' : 'v_f^2 - v_i^2 = ' + texI(v2) + ' - ' + tex(vi * vi) + eqI(v2 - vi * vi, exI(v2)) + '\\,\\mathrm{m^2\\,s^{-2}};\\ ') + '\\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + texI(v2 - vi * vi) + eqI(0.5 * m * (v2 - vi * vi), exI(v2)) + '\\,\\mathrm{J} = W_{F_R}', valor: Fis().vDeEc(Fis().ec(m, vi) + W, m) });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'w-de-v') return confereN(p, (d.m / 2) * (d.vf - d.vi) * (d.vf + d.vi), U.J);
      if (d.contexto === 'soma-trabalhos') return confereN(p, (d.F * Math.cos(rad(d.alfa)) - d.Fa) * d.d, U.J);
      // aceleração constante: v² = v0² + 2 a d, com a = F_R / m
      return confereN(p, Math.sqrt(d.vi * d.vi + 2 * (d.FR / d.m) * d.d), U.ms);
    },
    limites(p) {
      return p.dados.contexto !== 'soma-trabalhos' || p.dados.F <= 100;
    },
  });

  // Travagem de um automóvel numa estrada horizontal, só com a força de atrito (constante): F_a d = E_c0.
  registar({
    subtema: 'trabalho', tipo: 'travagem', nome: 'Travagem: distância, força de atrito e trabalho do atrito',
    formatos: ['numerica', 'escolha'], contextos: ['distancia', 'forca', 'trabalho'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const m = entre(rng, 800, 1500, 50);
        const v = escolher(rng, [10, 12.5, 15, 17.5, 20, 25, 30]);
        const vk = kmh(v);
        const Ec = 0.5 * m * v * v;
        const conv = { passo: 'Passar a velocidade a metros por segundo', porque: 'Divide-se por 3,6, porque $1\\,\\mathrm{km\\,h^{-1}} = \\dfrac{1000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}$.', calculo: 'v = \\dfrac{' + tex(vk) + '}{3{,}6} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}' };
        const passoEc = { passo: 'Energia cinética inicial', porque: '$E_c = \\tfrac{1}{2} m v^2$; no fim o automóvel está parado ($E_c = 0$).', calculo: 'E_{c,i} = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(v) + '^2' + eqI(Ec) + '\\,\\mathrm{J}' };
        const porqueTEC = 'O peso e a força normal são perpendiculares ao deslocamento e não realizam trabalho; só o atrito ($\\alpha = 180°$) realiza trabalho, $W_{F_a} = -F_a d$. Pelo Teorema da Energia Cinética, $-F_a d = 0 - E_{c,i}$.';
        const inicio = 'Um automóvel de ' + q(m, U.kg) + ' segue a ' + q(vk, U.kmh) + ' numa estrada horizontal e trava até parar. Considera que só a força de atrito, constante, realiza trabalho durante a travagem.';
        const Ek = 0.5 * m * vk * vk;
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'distancia') {
          const Fa = entre(rng, 4000, 10000, 500);
          // travagem plausível (regra 16): desaceleração F_a/m entre 2 e 8 m s⁻²
          if (Fa / m > 8 || Fa / m < 2) return null;
          exato = Ec / Fa;
          unidade = 'm';
          u = U.m;
          ex = {
            enunciado: inicio + ' A força de atrito tem intensidade ' + q(Fa, U.N) + '. Calcula a distância de travagem.',
            resolucao: [conv, passoEc, { passo: 'Teorema da Energia Cinética', porque: porqueTEC, calculo: 'd = \\dfrac{E_{c,i}}{F_a} = \\dfrac{' + texI(Ec) + '}{' + tex(Fa) + '}' + eqN(exato, exI(Ec)) + '\\,\\mathrm{m}' }],
            dados: { contexto, m, v, Fa },
          };
          erros = [
            { codigo: 'velocidade_em_km_h', valor: Ek / Fa, explicacao: (vt) => 'Usaste a velocidade em $\\mathrm{km\\,h^{-1}}$ e obtiveste ' + vt(Ek / Fa, U.m) + '. Primeiro passa-se a $\\mathrm{m\\,s^{-1}}$ ($' + tex(vk) + '\\,\\mathrm{km\\,h^{-1}} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}$).' },
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 2 * Ec / Fa, explicacao: (vt) => 'Obtiveste ' + vt(2 * Ec / Fa, U.m) + ' por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 0.5 * m * v / Fa, explicacao: (vt) => 'Não elevaste a velocidade ao quadrado e obtiveste ' + vt(0.5 * m * v / Fa, U.m) + '. A energia cinética, e por isso a distância de travagem, é proporcional a $v^2$.' },
          ];
          verificacao = () => ({ passo: 'Trabalho do atrito nessa distância (por arredondar), que tem de anular a energia cinética', calculo: 'W_{F_a} = -' + tex(Fa) + ' \\times ' + texI(exato) + eqI(-Fa * exato, exI(exato)) + '\\,\\mathrm{J} = -E_{c,i}', valor: Fis().travagem({ m, v0: v, Fa }) });
        } else if (contexto === 'forca') {
          const d = entre(rng, 10, 120, 5);
          // travagem plausível (regra 16): desaceleração v²/(2d) entre 2 e 8 m s⁻²
          if (v * v / (2 * d) > 8 || v * v / (2 * d) < 2) return null;
          exato = Ec / d;
          unidade = 'N';
          u = U.N;
          ex = {
            enunciado: inicio + ' A distância de travagem é ' + q(d, U.m) + '. Calcula a intensidade da força de atrito.',
            resolucao: [conv, passoEc, { passo: 'Teorema da Energia Cinética', porque: porqueTEC, calculo: 'F_a = \\dfrac{E_{c,i}}{d} = \\dfrac{' + texI(Ec) + '}{' + tex(d) + '}' + eqN(exato, exI(Ec)) + '\\,\\mathrm{N}' }],
            dados: { contexto, m, v, d },
          };
          erros = [
            { codigo: 'velocidade_em_km_h', valor: Ek / d, explicacao: (vt) => 'Usaste a velocidade em $\\mathrm{km\\,h^{-1}}$ e obtiveste ' + vt(Ek / d, U.N) + '. Primeiro passa-se a $\\mathrm{m\\,s^{-1}}$ ($' + tex(vk) + '\\,\\mathrm{km\\,h^{-1}} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}$).' },
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 2 * Ec / d, explicacao: (vt) => 'Obtiveste ' + vt(2 * Ec / d, U.N) + ' por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 0.5 * m * v / d, explicacao: (vt) => 'Não elevaste a velocidade ao quadrado e obtiveste ' + vt(0.5 * m * v / d, U.N) + '. A energia cinética é proporcional a $v^2$.' },
          ];
          verificacao = () => ({ passo: 'Distância de travagem com essa força (por arredondar): tem de dar a distância dada', calculo: 'd = \\dfrac{' + texI(Ec) + '}{' + texI(exato) + '}' + eqI(Ec / exato, exI(exato)) + '\\,\\mathrm{m}', valor: Fis().ec(m, v) / d });
        } else {
          exato = -Ec / 1000;
          unidade = 'kJ';
          u = U.kJ;
          ex = {
            enunciado: inicio + ' Calcula o trabalho realizado pela força de atrito durante a travagem, em quilojoules.',
            resolucao: [conv, passoEc, { passo: 'Teorema da Energia Cinética', porque: 'Só o atrito realiza trabalho, por isso $W_{F_a} = \\Delta E_c = 0 - E_{c,i}$: é negativo, porque o atrito retira energia ao automóvel.', calculo: 'W_{F_a} = -' + texN(Ec) + '\\,\\mathrm{J}' + igual(exato) + texN(exato) + '\\,\\mathrm{kJ}' }],
            dados: { contexto, m, v },
          };
          erros = [
            { codigo: 'trabalho_do_atrito_positivo', valor: -exato, explicacao: (vt) => 'Obtiveste ' + vt(-exato, U.kJ) + ', positivo. O atrito opõe-se ao deslocamento ($\\alpha = 180°$) e o automóvel perde energia cinética, por isso $W_{F_a} < 0$.' },
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 2 * exato, explicacao: (vt) => 'Obtiveste ' + vt(2 * exato, U.kJ) + ' por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'velocidade_em_km_h', valor: -Ek / 1000, explicacao: (vt) => 'Usaste a velocidade em $\\mathrm{km\\,h^{-1}}$ e obtiveste ' + vt(-Ek / 1000, U.kJ) + '. Primeiro passa-se a $\\mathrm{m\\,s^{-1}}$ ($' + tex(vk) + '\\,\\mathrm{km\\,h^{-1}} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}$).' },
            { codigo: 'respondeu_em_joules', valor: -Ec, explicacao: (vt) => 'Respondeste ' + vt(-Ec) + ', que é o valor em joules. Pede-se em quilojoules (divide-se por 1000).' },
          ];
          verificacao = (r) => ({ passo: 'Variação da energia cinética escrita em kJ desde o início', calculo: '0 - \\tfrac{1}{2} \\times ' + tex(m / 1000) + '\\,\\mathrm{t} \\times ' + tex(v) + '^2' + igual(-0.5 * (m / 1000) * v * v) + texN(-0.5 * (m / 1000) * v * v) + '\\,\\mathrm{kJ}', valor: (0 - Fis().ec(m, v)) / 1000 });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const Ec = (d.m * d.v * d.v) / 2;
      if (d.contexto === 'distancia') return confereN(p, Ec / d.Fa, U.m);
      if (d.contexto === 'forca') return confereN(p, Ec / d.d, U.N);
      return confereN(p, -(d.m / 1000) * d.v * d.v / 2, U.kJ);
    },
    limites(p) {
      return p.dados.m >= 800 && p.dados.m <= 1500 && p.dados.v <= 30;
    },
  });

  // ================================================================ energia-mecanica
  // Cenários de conservação (alturas a partir do solo ou do ponto mais baixo). 'rampa' é o percurso do esquema
  // fqa-energias (carrinho de 0,5 kg, rampa com 2 m de desnível), por isso o esquema mostra o próprio item.
  const CEN_CONS = [
    { id: 'rampa', m: () => [0.5], h0: [2.5, 5, 0.5], dh: () => 2, v0: [0, 6, 0.5] },
    { id: 'montanha-russa', m: () => [200, 300, 400, 500], h0: [15, 40, 5], dh: (rng, h0) => entre(rng, 5, h0 - 5, 5), v0: [0, 8, 1] },
    { id: 'escorrega', m: () => [20, 25, 30, 35, 40], h0: [2, 4, 0.5], dh: (rng, h0) => A.limpo(h0 - 0.5), v0: [0, 0, 1] },
  ];

  registar({
    subtema: 'energia-mecanica', tipo: 'conservacao', nome: 'Conservação da energia mecânica: velocidade e altura máxima',
    formatos: ['numerica', 'escolha'], contextos: ['velocidade', 'altura'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'velocidade') {
          const c = escolher(rng, CEN_CONS);
          const m = escolher(rng, c.m());
          const h0 = entre(rng, c.h0[0], c.h0[1], c.h0[2]);
          const dh = c.dh(rng, h0);
          const h = A.limpo(h0 - dh);
          const v0 = entre(rng, c.v0[0], c.v0[1], c.v0[2]);
          exato = Fis().conservacao({ h0, v0, h });
          const v2 = v0 * v0 + 2 * g * dh;
          unidade = 'm/s';
          u = U.ms;
          const partida = v0 === 0 ? 'parte do repouso' : 'passa com velocidade ' + q(v0, U.ms);
          const enunciado = ({
            rampa: 'Um carrinho de ' + q(m, U.kg) + ' ' + partida + ' no ponto A, no topo de uma rampa, a ' + q(h0, U.m) + ' do chão, e desce a rampa até ao ponto B, na base da rampa, a ' + q(h, U.m) + ' do chão.',
            'montanha-russa': 'Uma carruagem de montanha-russa, de ' + q(m, U.kg) + ', ' + partida + ' num ponto A, a ' + q(h0, U.m) + ' do solo, e desce até um ponto B a ' + q(h, U.m) + ' do solo.',
            escorrega: 'Uma criança de ' + q(m, U.kg) + ' parte do repouso no topo de um escorrega, a ' + q(h0, U.m) + ' do chão, e desce até à base, a ' + q(h, U.m) + ' do chão.',
          })[c.id] + ' Desprezando o atrito e a resistência do ar, calcula a velocidade ' + (c.id === 'escorrega' ? 'na base' : 'em B') + ' (' + gTxt() + ').';
          ex = {
            enunciado,
            resolucao: [
              { passo: 'A energia mecânica conserva-se', porque: 'Sem atrito nem resistência do ar, só o peso (força conservativa) realiza trabalho; a força normal é perpendicular ao deslocamento. Logo $\\tfrac{1}{2} m v_0^2 + m g h_0 = \\tfrac{1}{2} m v^2 + m g h$ e a massa simplifica-se.' },
              { passo: 'Isolar $v^2$', porque: '$v^2 = v_0^2 + 2 g (h_0 - h)$: a energia potencial perdida passa a cinética.', calculo: 'v^2 = ' + tex(v0) + '^2 + 2 \\times ' + tex(g) + ' \\times ' + tex(dh) + eqI(v2) + '\\,\\mathrm{m^2\\,s^{-2}}' },
              { passo: 'Tirar a raiz quadrada', porque: 'Pede-se $v$.', calculo: 'v = \\sqrt{' + texI(v2) + '}' + eqN(exato, exI(v2)) + '\\,\\mathrm{m\\,s^{-1}}' },
            ],
            dados: { contexto, cenario: c.id, m, h0, h, v0 },
          };
          if (c.id === 'rampa') ex.esquema = { id: 'fqa-energias', opcoes: { percurso: 'rampa', h0, v0, Fa: 0 } };
          erros = [
            { codigo: 'esqueceu_raiz', valor: v2, explicacao: (vt) => 'Obtiveste ' + vt(v2) + ', que é $v^2$ (em $\\mathrm{m^2\\,s^{-2}}$). Falta a raiz quadrada.' },
            { codigo: 'esqueceu_o_fator_2', valor: Math.sqrt(v0 * v0 + g * dh), explicacao: (vt) => 'Esqueceste o 2 e obtiveste ' + vt(Math.sqrt(v0 * v0 + g * dh), U.ms) + '. De $\\tfrac{1}{2} m v^2 = m g \\Delta h$ vem $v^2 = 2 g \\Delta h$.' },
            { codigo: 'usou_a_altura_em_vez_do_desnivel', valor: Math.sqrt(v0 * v0 + 2 * g * h0), explicacao: (vt) => 'Usaste a altura inicial ($' + tex(h0) + '\\,\\mathrm{m}$) em vez do desnível e obtiveste ' + vt(Math.sqrt(v0 * v0 + 2 * g * h0), U.ms) + '. A energia potencial que passa a cinética corresponde à descida, $h_0 - h = ' + tex(dh) + '\\,\\mathrm{m}$.' },
          ];
          if (v0 > 0) {
            const semV0 = Math.sqrt(2 * g * dh);
            erros.push({ codigo: 'esqueceu_a_velocidade_inicial', valor: semV0, explicacao: (vt) => 'Obtiveste ' + vt(semV0, U.ms) + ', como se partisse do repouso. Em A já havia energia cinética: $v^2 = v_0^2 + 2 g \\Delta h$.' });
            erros.push({ codigo: 'somou_as_velocidades', valor: v0 + semV0, explicacao: (vt) => 'Somaste $v_0$ à velocidade ganha na descida e obtiveste ' + vt(v0 + semV0, U.ms) + '. Somam-se as energias (os quadrados das velocidades), não as velocidades.' });
          }
          verificacao = () => {
            const Emi = Fis().em(m, v0, h0), Epf = Fis().epg(m, h), Ecf = Emi - Epf, vf = Math.sqrt(2 * Ecf / m);
            return { passo: 'Pelas energias, com a massa dada: $E_{c,f} = E_{m,i} - m g h$', calculo: 'E_{c,f} = ' + texI(Emi) + ' - ' + texI(Epf) + eqI(Ecf) + '\\,\\mathrm{J};\\ v = \\sqrt{' + sobre('2 \\times ' + texI(Ecf), tex(m)) + '}' + eqN(vf, exI(Ecf)) + '\\,\\mathrm{m\\,s^{-1}}', valor: Fis().vDeEc(Ecf, m) };
          };
        } else {
          const h0 = entre(rng, 1, 20, 0.5);
          const v0 = entre(rng, 2, 15, 1);
          const sobe = v0 * v0 / (2 * g);
          exato = h0 + sobe;
          unidade = 'm';
          u = U.m;
          ex = {
            enunciado: 'Uma bola é lançada verticalmente para cima, a ' + q(h0, U.m) + ' do solo, com velocidade de ' + q(v0, U.ms) + '. Desprezando a resistência do ar, calcula a altura máxima, em relação ao solo, a que a bola chega (' + gTxt() + ').',
            resolucao: [
              { passo: 'A energia mecânica conserva-se', porque: 'Só o peso realiza trabalho. No ponto mais alto a bola para por um instante: toda a energia cinética de lançamento passou a potencial gravítica.', calculo: '\\tfrac{1}{2} m v_0^2 = m g \\Delta h \\Leftrightarrow \\Delta h = \\dfrac{v_0^2}{2 g} = \\dfrac{' + tex(v0) + '^2}{2 \\times ' + tex(g) + '}' + eqI(sobe) + '\\,\\mathrm{m}' },
              { passo: 'Somar a altura de lançamento', porque: 'A subida conta a partir do ponto de lançamento, que já está acima do solo.', calculo: 'h_{max} = ' + tex(h0) + ' + ' + texI(sobe) + eqN(exato, exI(sobe)) + '\\,\\mathrm{m}' },
            ],
            dados: { contexto, h0, v0 },
          };
          erros = [
            { codigo: 'esqueceu_a_altura_de_lancamento', valor: sobe, explicacao: (vt) => vt(sobe, U.m) + ' é só o que a bola sobe acima do ponto de lançamento. Pede-se a altura em relação ao solo: soma-se $' + tex(h0) + '\\,\\mathrm{m}$.' },
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: h0 + v0 * v0 / g, explicacao: (vt) => 'Usaste $m v_0^2$ em vez de $\\tfrac{1}{2} m v_0^2$ e obtiveste ' + vt(h0 + v0 * v0 / g, U.m) + '. A subida é $v_0^2/(2g)$.' },
            { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: h0 + v0 / (2 * g), explicacao: (vt) => 'Não elevaste a velocidade ao quadrado e obtiveste ' + vt(h0 + v0 / (2 * g), U.m) + '. A energia cinética é proporcional a $v^2$: a subida é $v_0^2/(2g)$.' },
            { codigo: 'nao_dividiu_por_g', valor: h0 + v0 * v0 / 2, explicacao: (vt) => 'Não dividiste por $g$ e obtiveste ' + vt(h0 + v0 * v0 / 2, U.m) + '. De $\\tfrac{1}{2} m v_0^2 = m g \\Delta h$ vem $\\Delta h = v_0^2/(2g)$.' },
          ];
          // Com a altura por arredondar, a queda até ao ponto de lançamento volta a dar a velocidade dada.
          verificacao = () => ({ passo: 'Velocidade com que a bola, caindo do ponto mais alto, passa pelo ponto de lançamento: tem de ser $v_0$', calculo: 'h_{max} - h_0 = ' + texI(exato) + ' - ' + tex(h0) + eqI(sobe, exI(exato)) + '\\,\\mathrm{m};\\ v = \\sqrt{2 \\times ' + tex(g) + ' \\times ' + texI(sobe) + '}' + eqI(Math.sqrt(2 * g * sobe), exI(sobe)) + '\\,\\mathrm{m\\,s^{-1}}', valor: h0 + Fis().ec(1, v0) / Fis().epg(1, 1) });
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      if (d.contexto === 'velocidade') {
        // pelas energias com a massa (e não pela fórmula já simplificada)
        const Ec = 0.5 * d.m * d.v0 * d.v0 + d.m * g * d.h0 - d.m * g * d.h;
        return confereN(p, Math.sqrt(2 * Ec / d.m), U.ms);
      }
      // Torricelli: 0 = v0² − 2 g Δh
      return confereN(p, d.h0 + (d.v0 * d.v0) / (2 * g), U.m);
    },
    limites(p) {
      const d = p.dados;
      return d.contexto !== 'velocidade' || (d.h < d.h0 && (d.cenario !== 'rampa' || (d.h0 <= 5 && d.v0 <= 6)));
    },
  });

  registar({
    subtema: 'energia-mecanica', tipo: 'nao-conservativas', nome: 'Trabalho das forças não conservativas a partir da variação da energia mecânica',
    formatos: ['numerica', 'escolha'], contextos: ['atrito', 'forca-atrito', 'motor'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        let ex, exato, erros, verificacao, unidade = 'J', u = U.J;
        if (contexto === 'motor') {
          const m = entre(rng, 20, 200, 10);
          const h = entre(rng, 2, 15, 1);
          const vf = entre(rng, 0.5, 3, 0.5);
          const Epg = m * g * h, Ec = 0.5 * m * vf * vf;
          exato = Epg + Ec;
          ex = {
            enunciado: 'Um guindaste eleva uma carga de ' + q(m, U.kg) + ', a partir do repouso, até ' + q(h, U.m) + ' de altura; nesse ponto a carga sobe a ' + q(vf, U.ms) + '. Desprezando a resistência do ar, calcula o trabalho realizado pela força que o cabo exerce na carga (' + gTxt() + ').',
            resolucao: [
              { passo: 'A força do cabo é a força não conservativa', porque: 'O peso é conservativo; o trabalho do cabo é o trabalho das forças não conservativas, $W_{FNC} = \\Delta E_m = \\Delta E_c + \\Delta E_{pg}$.' },
              { passo: 'Variações das energias', porque: 'Parte do repouso no nível de referência.', calculo: '\\Delta E_c = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(vf) + '^2' + eqI(Ec) + '\\,\\mathrm{J};\\ \\Delta E_{pg} = ' + tex(m) + ' \\times ' + tex(g) + ' \\times ' + tex(h) + ' = ' + texI(Epg) + '\\,\\mathrm{J}' },
              { passo: 'Somar', porque: 'A energia mecânica aumenta, por isso o trabalho do cabo é positivo.', calculo: 'W_{FNC} = ' + texI(Ec) + ' + ' + texI(Epg) + eqN(exato) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, h, vf },
          };
          erros = [
            { codigo: 'trabalho_fnc_sempre_negativo', valor: -exato, explicacao: (vt) => 'Deste o trabalho com sinal negativo, ' + vt(-exato, U.J) + '. O cabo puxa no sentido do movimento e a energia mecânica aumenta, por isso $W_{FNC} = \\Delta E_m > 0$.' },
            { codigo: 'esqueceu_a_energia_cinetica', valor: Epg, explicacao: (vt) => vt(Epg, U.J) + ' é só a variação da energia potencial gravítica. A carga também ganhou energia cinética, $' + texI(Ec) + '\\,\\mathrm{J}$.' },
            { codigo: 'confundiu_com_o_trabalho_da_resultante', valor: Ec, explicacao: (vt) => vt(Ec, U.J) + ' é a variação da energia cinética, igual ao trabalho da resultante. O trabalho do cabo é a variação da energia mecânica, $\\Delta E_c + \\Delta E_{pg}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: m * h + Ec, explicacao: (vt) => 'Usaste $m h$ na energia potencial gravítica e obtiveste ' + vt(m * h + Ec, U.J) + '. Falta multiplicar por $g$.' },
          ];
          verificacao = () => ({ passo: 'Pelo Teorema da Energia Cinética: $W_{cabo} + W_P = \\Delta E_c$, com $W_P = -m g h$', calculo: 'W_{cabo} = ' + texI(Ec) + ' - (' + texI(-Epg) + ')' + eqI(Ec + Epg) + '\\,\\mathrm{J}', valor: Fis().ec(m, vf) - Fis().trabalho(m * g, h, 180) });
        } else {
          const m = entre(rng, 1, 10, 0.5);
          const h = entre(rng, 1, 5, 0.5);
          const L = A.limpo(h * escolher(rng, [1.5, 2, 2.5, 3]));
          const v0 = inteiro(rng, 0, 2);
          const vf = entre(rng, 1, 12, 0.5);
          const vmax2 = v0 * v0 + 2 * g * h;
          if (vf * vf < 0.15 * vmax2 || vf * vf > 0.85 * vmax2 || vf <= v0) return null;
          const Emi = 0.5 * m * v0 * v0 + m * g * h, Emf = 0.5 * m * vf * vf;
          const W = Emf - Emi;
          const dEc = 0.5 * m * (vf * vf - v0 * v0);
          const inicio = 'Um bloco de ' + q(m, U.kg) + ' desce um plano inclinado com ' + q(L, U.m) + ' de comprimento e ' + q(h, U.m) + ' de altura. ' + (v0 === 0 ? 'Parte do repouso no topo' : 'Passa no topo com velocidade ' + q(v0, U.ms)) + ' e chega à base com ' + q(vf, U.ms) + '. Despreza a resistência do ar (nível de referência na base; ' + gTxt() + ').';
          const resolucaoW = [
            { passo: 'Energia mecânica no topo e na base', porque: '$E_m = E_c + E_{pg}$, com a altura medida a partir da base.', calculo: 'E_{m,i} = ' + (v0 === 0 ? '' : '\\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(v0) + '^2 + ') + tex(m) + ' \\times ' + tex(g) + ' \\times ' + tex(h) + eqI(Emi) + '\\,\\mathrm{J};\\ E_{m,f} = \\tfrac{1}{2} \\times ' + tex(m) + ' \\times ' + tex(vf) + '^2' + eqI(Emf) + '\\,\\mathrm{J}' },
            { passo: 'Trabalho das forças não conservativas', porque: '$W_{FNC} = \\Delta E_m$. A normal é perpendicular ao deslocamento; só o atrito realiza este trabalho, que é negativo (a energia mecânica diminui e a energia dissipada aquece o bloco e o plano).', calculo: 'W_{FNC} = ' + texI(Emf) + ' - ' + texI(Emi) + eqN(W) + '\\,\\mathrm{J}' },
          ];
          if (contexto === 'atrito') {
            exato = W;
            ex = { enunciado: inicio + ' Calcula o trabalho realizado pelas forças não conservativas.', resolucao: resolucaoW, dados: { contexto, m, h, L, v0, vf } };
            erros = [
              { codigo: 'trabalho_dissipativo_com_sinal_positivo', valor: -W, explicacao: (vt) => 'Deste ' + vt(-W, U.J) + ', positivo. A energia mecânica diminuiu ($E_{m,f} < E_{m,i}$), por isso $W_{FNC} = \\Delta E_m < 0$.' },
              { codigo: 'confundiu_com_o_trabalho_da_resultante', valor: dEc, explicacao: (vt) => vt(dEc, U.J) + ' é a variação da energia cinética, igual ao trabalho da resultante. O trabalho das forças não conservativas é a variação da energia mecânica, que inclui a energia potencial gravítica.' },
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 2 * Emf - (m * v0 * v0 + m * g * h), explicacao: (vt) => 'Usaste $m v^2$ nas energias cinéticas e obtiveste ' + vt(2 * Emf - (m * v0 * v0 + m * g * h), U.J) + '. A energia cinética é $\\tfrac{1}{2} m v^2$.' },
              { codigo: 'esqueceu_g_na_energia_potencial', valor: Emf - (0.5 * m * v0 * v0 + m * h), explicacao: (vt) => 'Usaste $m h$ na energia potencial gravítica e obtiveste ' + vt(Emf - (0.5 * m * v0 * v0 + m * h), U.J) + '. Falta multiplicar por $g$.' },
            ];
            verificacao = () => ({ passo: 'Pelo Teorema da Energia Cinética: $W_P + W_{FNC} = \\Delta E_c$, com $W_P = m g h$ (o bloco desce)', calculo: 'W_{FNC} = ' + texI(dEc) + ' - ' + texI(m * g * h) + eqN(dEc - m * g * h) + '\\,\\mathrm{J}', valor: (Fis().ec(m, vf) - Fis().ec(m, v0)) - Fis().trabalho(m * g, h, 0) });
          } else {
            exato = -W / L;
            unidade = 'N';
            u = U.N;
            ex = {
              enunciado: inicio + ' Calcula a intensidade da força de atrito, que se supõe constante.',
              resolucao: resolucaoW.concat([{ passo: 'Intensidade da força de atrito', porque: 'O atrito tem o sentido oposto ao do deslocamento ao longo do plano: $W_{F_a} = -F_a L$.', calculo: 'F_a = \\dfrac{' + texI(-W) + '}{' + tex(L) + '}' + eqN(exato) + '\\,\\mathrm{N}' }]),
              dados: { contexto, m, h, L, v0, vf },
            };
            erros = [
              { codigo: 'dividiu_pela_altura', valor: -W / h, explicacao: (vt) => 'Dividiste pela altura e obtiveste ' + vt(-W / h, U.N) + '. O atrito atua ao longo de todo o plano, por isso divide-se pelo comprimento, $' + tex(L) + '\\,\\mathrm{m}$.' },
              { codigo: 'esqueceu_dividir_pela_distancia', valor: -W, explicacao: (vt) => 'Respondeste ' + vt(-W) + ', que é o valor do trabalho do atrito em joules, e não a força. Como $|W_{F_a}| = F_a L$, divide-se por $' + tex(L) + '\\,\\mathrm{m}$.' },
              { codigo: 'confundiu_com_o_trabalho_da_resultante', valor: dEc / L, explicacao: (vt) => 'Usaste a variação da energia cinética e obtiveste ' + vt(dEc / L, U.N) + '. O trabalho do atrito é a variação da energia mecânica, que inclui a energia potencial gravítica.' },
            ];
            verificacao = () => ({ passo: 'Energia dissipada pelo atrito ao longo do plano ($F_a$ por arredondar), somada à energia final: tem de dar $E_{m,i}$', calculo: texI(exato) + ' \\times ' + tex(L) + ' + ' + texI(Emf) + eqI(exato * L + Emf, exI(exato)) + '\\,\\mathrm{J} = E_{m,i}', valor: (Fis().em(m, v0, h) - Fis().em(m, vf, 0)) / L });
          }
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      if (d.contexto === 'motor') return confereN(p, d.m * (g * d.h + d.vf * d.vf / 2), U.J); // W_cabo = ΔEm
      const W = (d.m / 2) * (d.vf - d.v0) * (d.vf + d.v0) - d.m * g * d.h; // ΔEc − W_P
      return d.contexto === 'atrito' ? confereN(p, W, U.J) : confereN(p, -W / d.L, U.N);
    },
    limites(p) {
      const d = p.dados;
      return d.contexto === 'motor' || (d.L >= d.h && d.vf > d.v0);
    },
  });

  // AL «queda e ressalto»: nos pontos mais altos a bola está parada, E_m = m g h; a fração da energia mecânica que
  // se mantém em cada colisão é h_r / h_q (desprezando a resistência do ar).
  const BOLAS = [['uma bola de ténis', 55, 60, 1], ['uma bola de pingue-pongue', 2.7, 2.7, 0.1], ['uma bola de basquetebol', 580, 620, 10], ['uma bola de borracha', 40, 120, 10]];

  registar({
    subtema: 'energia-mecanica', tipo: 'ressalto', nome: 'Queda e ressalto de uma bola: energia dissipada e alturas',
    formatos: ['numerica', 'escolha'], contextos: ['percentagem', 'altura', 'energia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = gv();
        let ex, exato, erros, verificacao, unidade, u;
        if (contexto === 'altura') {
          const h0 = entre(rng, 1, 3, 0.1);
          const f = entre(rng, 0.5, 0.9, 0.05);
          const n = inteiro(rng, 2, 3);
          const pf = Math.round(f * 100);
          const alturas = Fis().ressalto(h0, f, n);
          exato = alturas[n - 1];
          unidade = 'm';
          u = U.m;
          ex = {
            enunciado: 'Uma bola é largada de ' + q(h0, U.m) + ' de altura. Em cada colisão com o chão mantém-se ' + pf + ' % da energia mecânica (despreza a resistência do ar). A que altura sobe a bola depois do ' + n + '.º ressalto?',
            resolucao: [
              { passo: 'Em cada ressalto a altura é multiplicada pela mesma fração', porque: 'No ponto mais alto $E_m = m g h$, por isso a altura é proporcional à energia mecânica: cada ressalto sobe ' + pf + ' % da altura anterior.' },
              { passo: 'Aplicar ' + plural(n, 'vez', 'vezes') + ' a fração', porque: 'A fração aplica-se à altura do ressalto anterior, não à altura inicial.', calculo: 'h_' + n + ' = ' + tex(h0) + ' \\times ' + tex(f) + '^' + n + igual(exato) + texN(exato) + '\\,\\mathrm{m}' },
            ],
            dados: { contexto, h0, f, n },
            esquema: { id: 'fqa-ressalto', opcoes: { h0, fracao: f } },
          };
          const linear = h0 - n * h0 * (1 - f);
          erros = [
            { codigo: 'aplicou_a_fracao_uma_so_vez', valor: h0 * f, explicacao: (vt) => vt(h0 * f, U.m) + ' é a altura do 1.º ressalto. Depois de ' + plural(n, 'ressalto', 'ressaltos') + ' a fração aplica-se ' + plural(n, 'vez', 'vezes') + ': $h_0 \\times ' + tex(f) + '^' + n + '$.' },
            { codigo: 'usou_a_fracao_dissipada', valor: h0 * Math.pow(1 - f, n), explicacao: (vt) => 'Usaste a fração dissipada ($' + tex(A.limpo(1 - f)) + '$) e obtiveste ' + vt(h0 * Math.pow(1 - f, n), U.m) + '. A altura do ressalto depende da energia que se mantém, ' + pf + ' %.' },
            { codigo: 'subtraiu_sempre_a_mesma_altura', valor: linear > 0 ? linear : NaN, explicacao: (vt) => 'Tiraste sempre a mesma altura em cada ressalto e obtiveste ' + (linear > 0 ? vt(linear, U.m) : '') + '. Perde-se sempre a mesma fração da energia, por isso a altura perdida diminui de ressalto para ressalto.' },
          ];
          verificacao = () => {
            let h = h0;
            const passos = [];
            for (let i = 0; i < n; i++) { h *= f; passos.push(texI(h)); }
            return { passo: 'Ressalto a ressalto', calculo: tex(h0) + ' \\to ' + passos.join(' \\to ') + '\\,\\mathrm{m}', valor: h };
          };
        } else {
          const hq = entre(rng, 1, 2, 0.05);
          const f = entre(rng, 0.5, 0.9, 0.05);
          const hr = A.r2(hq * f);
          const fr = hr / hq;
          if (contexto === 'percentagem') {
            exato = (1 - fr) * 100;
            unidade = '%';
            u = U.pct;
            ex = {
              enunciado: 'Numa atividade laboratorial, uma bola largada de ' + q(hq, U.m) + ' sobe, depois de bater no chão, até ' + q(hr, U.m) + '. Desprezando a resistência do ar, que percentagem da energia mecânica da bola foi dissipada na colisão?',
              resolucao: [
                { passo: 'Fração da energia mecânica que se mantém', porque: 'Nos pontos mais altos a bola está parada: $E_m = m g h$, por isso a razão das energias é a razão das alturas.', calculo: '\\dfrac{h_r}{h_q} = \\dfrac{' + tex(hr) + '}{' + tex(hq) + '}' + eqI(fr) },
                { passo: 'A fração dissipada é o resto', porque: 'O que não se mantém foi dissipado na colisão (aquece a bola e o chão).', calculo: '(1 - ' + texI(fr) + ') \\times 100' + eqN(exato, exI(fr)) + '\\,\\%' },
              ],
              dados: { contexto, hq, hr },
            };
            erros = [
              { codigo: 'deu_a_fracao_conservada', valor: fr * 100, explicacao: (vt) => vt(fr * 100, U.pct) + ' é a fração da energia mecânica que **se mantém** ($h_r/h_q$). A dissipada é o resto, $100 - ' + texN(fr * 100) + '$.' },
              { codigo: 'tomou_a_diferenca_de_alturas_como_percentagem', valor: (hq - hr) * 100, explicacao: (vt) => 'Tomaste a diferença das alturas, $' + tex(A.limpo(hq - hr)) + '\\,\\mathrm{m}$, como percentagem (' + vt((hq - hr) * 100, U.pct) + '). É preciso dividir pela altura de queda.' },
              { codigo: 'dividiu_pela_altura_do_ressalto', valor: (hq - hr) / hr * 100, explicacao: (vt) => 'Dividiste a diferença das alturas pela altura do ressalto e obtiveste ' + vt((hq - hr) / hr * 100, U.pct) + '. A energia inicial é a da queda, por isso divide-se por $h_q = ' + tex(hq) + '\\,\\mathrm{m}$.' },
            ];
            verificacao = () => ({ passo: 'Diferença das alturas em relação à altura de queda', calculo: '\\dfrac{' + tex(hq) + ' - ' + tex(hr) + '}{' + tex(hq) + '} \\times 100' + igual((hq - hr) / hq * 100) + texN((hq - hr) / hq * 100) + '\\,\\%', valor: (hq - hr) / hq * 100 });
          } else {
            const b = escolher(rng, BOLAS);
            const mg = entre(rng, b[1], b[2], b[3]);
            const m = mg / 1000;
            exato = m * g * (hq - hr);
            unidade = 'J';
            u = U.J;
            ex = {
              enunciado: 'Numa atividade laboratorial, ' + b[0] + ' de ' + q(mg, U.g) + ' é largada de ' + q(hq, U.m) + ' e sobe, depois de bater no chão, até ' + q(hr, U.m) + '. Desprezando a resistência do ar, calcula a energia dissipada na colisão (' + gTxt() + ').',
              resolucao: [
                { passo: 'Passar a massa a quilogramas', porque: 'No SI a massa exprime-se em kg.', calculo: 'm = ' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m, 4) + '\\,\\mathrm{kg}' },
                { passo: 'Energia dissipada = energia mecânica perdida', porque: 'Nos pontos mais altos $E_c = 0$, por isso $E_m = m g h$; a perda é $m g (h_q - h_r)$.', calculo: 'h_q - h_r = ' + tex(hq) + ' - ' + tex(hr) + ' = ' + tex(A.limpo(hq - hr)) + '\\,\\mathrm{m};\\ E_{diss} = ' + tex(m, 4) + ' \\times ' + tex(g) + ' \\times ' + tex(A.limpo(hq - hr)) + eqN(exato) + '\\,\\mathrm{J}' },
              ],
              dados: { contexto, m, hq, hr },
            };
            erros = [
              { codigo: 'massa_em_gramas', valor: mg * g * (hq - hr), explicacao: (vt) => 'Usaste a massa em gramas e obtiveste ' + vt(mg * g * (hq - hr), U.J) + '. No SI a massa está em kg ($' + tex(mg) + '\\,\\mathrm{g} = ' + tex(m, 4) + '\\,\\mathrm{kg}$).' },
              { codigo: 'deu_a_energia_apos_o_ressalto', valor: m * g * hr, explicacao: (vt) => vt(m * g * hr, U.J) + ' é a energia mecânica depois do ressalto (no ponto mais alto). A dissipada é a diferença, $m g (h_q - h_r)$.' },
              { codigo: 'deu_a_energia_antes_da_colisao', valor: m * g * hq, explicacao: (vt) => vt(m * g * hq, U.J) + ' é a energia mecânica inicial. A dissipada é só a parte perdida, $m g (h_q - h_r)$.' },
              { codigo: 'esqueceu_g_na_energia_potencial', valor: m * (hq - hr), explicacao: (vt) => 'Calculaste $m (h_q - h_r)$ e obtiveste ' + vt(m * (hq - hr), U.J) + '. Falta multiplicar por $g$.' },
            ];
            verificacao = () => ({ passo: 'Diferença das energias potenciais nos dois pontos mais altos', calculo: texI(m * g * hq) + ' - ' + texI(m * g * hr) + eqI(m * g * hq - m * g * hr, exI(m * g * hq) && exI(m * g * hr)) + '\\,\\mathrm{J}', valor: Fis().epg(m, hq) - Fis().epg(m, hr) });
          }
        }
        return fecharNum(rng, formato, ex, exato, { erros, unidade, u, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const g = Manual.dadosFisica.constantes.g;
      if (d.contexto === 'altura') {
        let h = d.h0;
        for (let i = 0; i < d.n; i++) h *= d.f;
        return confereN(p, h, U.m);
      }
      if (d.contexto === 'percentagem') return confereN(p, 100 - (100 * d.hr) / d.hq, U.pct);
      return confereN(p, d.m * g * d.hq - d.m * g * d.hr, U.J);
    },
    limites(p) {
      const d = p.dados;
      return d.contexto === 'altura' ? d.f > 0 && d.f < 1 && d.h0 <= 5 : d.hr < d.hq;
    },
  });
})();
