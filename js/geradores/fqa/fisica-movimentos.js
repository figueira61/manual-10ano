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
  // Valor com unidade para as explicações: $≈ 17,8 J$.
  const vt = (v, u) => '$' + (exatoAS(v, 3) ? '' : '\\approx ') + texN(v) + (u ? '\\,' + u : '') + '$';
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
  // Texto de uma opção: $17,8\,J$ (a verificação independente usa o mesmo texto).
  const textoDe = (u) => (v) => '$' + texN(v) + (u ? '\\,' + u : '') + '$';

  // Fecha um item numérico (ou de escolha). Resposta exata quando tem até 3 a.s.; senão pede 3 a.s. (algarismos: 3).
  // Erros: arredondados a 3 a.s., e só os que ficam longe de 0 (um «0» escrito nunca é erro típico) e na escala da resposta.
  // o: { erros: [{ codigo, valor, explicacao }], unidade, u (LaTeX), verificacao(resposta) → { passo, calculo, valor } }.
  function fecharNum(rng, formato, ex, exato, o) {
    if (!Number.isFinite(exato) || exato === 0) return null;
    const curto = exatoAS(exato, 3);
    if (!curto && ambiguo(exato, 3)) return null;
    const resposta = aAS(exato, 3);
    const tol = A.tolMeiaUnidade(resposta, 3);
    const relativa = Math.abs(resposta) >= 1e4 || Math.abs(resposta) < 1e-3;
    const R = Math.abs(resposta);
    const erros = o.erros
      .filter((e) => e && Number.isFinite(e.valor))
      .map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }))
      .filter((e) => Math.abs(e.valor) > 10 * tol && Math.abs(e.valor) > 1e-4 * R && Math.abs(e.valor) < 1e4 * R);
    if (!curto && formato === 'numerica') ex.enunciado += AS3;
    const v = o.verificacao(resposta);
    const base = { resposta, unidade: o.unidade, texto: textoDe(o.u), erros, verificacao: Object.assign({}, v, { valor: aAS(v.valor, 3) }) };
    if (!curto) base.algarismos = 3;
    if (relativa) base.toleranciaRelativa = tol / R; else base.tolerancia = tol;
    return fechar(rng, formato, ex, base);
  }
  // A mesma resposta, por outro caminho, comparada como o item a mostra (verificarIndependente).
  const confereN = (p, valor, u) => confere(p, aAS(valor, 3), textoDe(u));

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
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: m * v * v, explicacao: 'Calculaste $m v^2$ e obtiveste ' + vt(m * v * v, U.J) + '. Falta o $\\tfrac{1}{2}$ de $E_c = \\tfrac{1}{2} m v^2$.' },
            { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 0.5 * m * v, explicacao: 'Obtiveste ' + vt(0.5 * m * v, U.J) + ' porque não elevaste a velocidade ao quadrado. A energia cinética é proporcional a $v^2$.' },
          ];
          if (emG) erros.push({ codigo: 'massa_em_gramas', valor: 0.5 * mG * v * v, explicacao: 'Usaste a massa em gramas e obtiveste ' + vt(0.5 * mG * v * v, U.J) + '. No SI a massa está em kg ($' + tex(mG) + '\\,\\mathrm{g} = ' + tex(m) + '\\,\\mathrm{kg}$).' });
          else erros.push({ codigo: 'velocidade_em_km_h', valor: 0.5 * m * vk * vk, explicacao: 'Usaste a velocidade em $\\mathrm{km\\,h^{-1}}$ e obtiveste ' + vt(0.5 * m * vk * vk, U.J) + '. Primeiro passa-se a $\\mathrm{m\\,s^{-1}}$ ($' + tex(vk) + '\\,\\mathrm{km\\,h^{-1}} = ' + tex(v) + '\\,\\mathrm{m\\,s^{-1}}$).' });
          verificacao = (r) => ({ passo: 'Voltar à velocidade, com $v = \\sqrt{2E_c/m}$', calculo: 'v = \\sqrt{' + sobre('2 \\times ' + texN(r), tex(m)) + '}' + igual(Math.sqrt(2 * r / m)) + texN(Math.sqrt(2 * r / m)) + '\\,\\mathrm{m\\,s^{-1}}', valor: Fis().ec(m, v) });
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
            { codigo: 'epg_sem_nivel_de_referencia', valor: m * g * h1, explicacao: 'Mediste a altura a partir do chão e obtiveste ' + vt(m * g * h1, U.J) + '. O nível de referência é ' + cen.ref + ', por isso $h = ' + tex(h1) + ' - ' + tex(h2) + ' = ' + tex(h) + '\\,\\mathrm{m}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: m * h, explicacao: 'Calculaste só $m h$ e obtiveste ' + vt(m * h, U.J) + '. Falta multiplicar por $g = ' + tex(g) + '\\,\\mathrm{m\\,s^{-2}}$.' },
            { codigo: 'somou_as_alturas', valor: m * g * (h1 + h2), explicacao: 'Somaste as duas alturas e obtiveste ' + vt(m * g * (h1 + h2), U.J) + '. O nível de referência está acima do chão, por isso a altura em relação a ele é a diferença, $' + tex(h) + '\\,\\mathrm{m}$.' },
          ];
          verificacao = (r) => ({ passo: 'Diferença das energias medidas a partir do chão', calculo: 'm g h_1 - m g h_2 = ' + texN(m * g * h1) + ' - ' + texN(m * g * h2) + igual(m * g * h1 - m * g * h2) + texN(m * g * h1 - m * g * h2) + '\\,\\mathrm{J}', valor: Fis().epg(m, h1) - Fis().epg(m, h2) });
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
            { codigo: 'variacao_com_o_sinal_trocado', valor: -exato, explicacao: 'Fizeste inicial menos final e obtiveste ' + vt(-exato, U.J) + '. A variação é final menos inicial e a pessoa ' + (sobe ? 'sobe' : 'desce') + ', por isso $\\Delta E_{pg}$ é ' + (sobe ? 'positiva' : 'negativa') + '.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: m * (hf - hi), explicacao: 'Calculaste só $m \\Delta h$ e obtiveste ' + vt(m * (hf - hi), U.J) + '. Falta multiplicar por $g = ' + tex(g) + '\\,\\mathrm{m\\,s^{-2}}$.' },
            { codigo: 'deu_a_energia_potencial_final', valor: m * g * hf, explicacao: vt(m * g * hf, U.J) + ' é a energia potencial gravítica no andar final (em relação ao chão). Pede-se a variação, $m g (h_f - h_i)$.' },
          ];
          verificacao = (r) => ({ passo: 'Energias em relação ao chão, subtraídas', calculo: m * g * hf + ' - ' + m * g * hi + ' = ' + texN(m * g * hf - m * g * hi) + '\\,\\mathrm{J}', valor: Fis().epg(m, hf) - Fis().epg(m, hi) });
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
              { passo: 'Somar as duas energias', porque: 'A energia mecânica é a soma da energia cinética com a energia potencial gravítica: $E_m = E_c + E_{pg}$.', calculo: 'E_m = ' + tex(Ec) + ' + ' + tex(Epg) + igual(Em) + texN(Em) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, v, h },
          };
          erros = [
            { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: m * v * v + Epg, explicacao: 'Usaste $m v^2$ na energia cinética e obtiveste ' + vt(m * v * v + Epg, U.J) + '. A energia cinética é $\\tfrac{1}{2} m v^2$.' },
            { codigo: 'deu_so_a_energia_cinetica', valor: Ec, explicacao: vt(Ec, U.J) + ' é só a energia cinética. A energia mecânica soma-lhe a energia potencial gravítica, $' + texN(Epg) + '\\,\\mathrm{J}$.' },
            { codigo: 'deu_so_a_energia_potencial', valor: Epg, explicacao: vt(Epg, U.J) + ' é só a energia potencial gravítica. A energia mecânica soma-lhe a energia cinética, $' + texN(Ec) + '\\,\\mathrm{J}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Ec + m * h, explicacao: 'Usaste $m h$ na energia potencial gravítica e obtiveste ' + vt(Ec + m * h, U.J) + '. Falta multiplicar por $g$: $E_{pg} = m g h$.' },
          ];
          verificacao = (r) => ({ passo: 'Pôr a massa em evidência: $E_m = m\\left(\\tfrac{1}{2} v^2 + g h\\right)$', calculo: tex(m) + ' \\times ' + '(' + tex(v * v / 2) + ' + ' + tex(g * h) + ')' + igual(m * (v * v / 2 + g * h)) + texN(m * (v * v / 2 + g * h)) + '\\,\\mathrm{J}', valor: Fis().em(m, v, h) });
        } else {
          exato = Ec;
          ex = {
            enunciado: c.nome + ' de ' + q(m, U.kg) + ' está a ' + q(h, U.m) + ' do solo, e a energia mecânica d' + sis + ' é $' + tex(Em) + '\\,\\mathrm{J}$ (nível de referência no solo; ' + gTxt() + '). Calcula a energia cinética nesse instante.',
            resolucao: [
              passoEpg,
              { passo: 'Tirar a energia potencial à energia mecânica', porque: 'De $E_m = E_c + E_{pg}$ vem $E_c = E_m - E_{pg}$.', calculo: 'E_c = ' + tex(Em) + ' - ' + tex(Epg) + igual(Ec) + texN(Ec) + '\\,\\mathrm{J}' },
            ],
            dados: { contexto, m, Em, h },
          };
          erros = [
            { codigo: 'somou_a_energia_potencial', valor: Em + Epg, explicacao: 'Somaste a energia potencial gravítica e obtiveste ' + vt(Em + Epg, U.J) + '. Como $E_m = E_c + E_{pg}$, a energia cinética é a diferença, $E_m - E_{pg}$.' },
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Em - m * h, explicacao: 'Usaste $m h$ como energia potencial gravítica e obtiveste ' + vt(Em - m * h, U.J) + '. Falta multiplicar por $g$: $E_{pg} = ' + texN(Epg) + '\\,\\mathrm{J}$.' },
            { codigo: 'deu_a_energia_potencial', valor: Epg, explicacao: vt(Epg, U.J) + ' é a energia potencial gravítica. A energia cinética é o que falta para a energia mecânica, $E_m - E_{pg}$.' },
          ];
          const vel = Math.sqrt(2 * Ec / m);
          verificacao = (r) => ({ passo: 'Velocidade correspondente e de novo a soma $E_c + E_{pg}$', calculo: 'v = \\sqrt{' + sobre('2 \\times ' + texN(r), tex(m)) + '}' + igual(vel) + texN(vel) + '\\,\\mathrm{m\\,s^{-1}}', valor: Fis().ec(m, vel) });
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
            { codigo: 'esqueceu_g_na_energia_potencial', valor: Epg / m, explicacao: 'Dividiste só pela massa e obtiveste ' + vt(Epg / m, U.m) + '. Em $E_{pg} = m g h$ também está $g$: $h = E_{pg}/(m g)$.' },
            { codigo: 'esqueceu_a_massa', valor: Epg / g, explicacao: 'Dividiste só por $g$ e obtiveste ' + vt(Epg / g, U.m) + '. Falta a massa: $h = E_{pg}/(m g)$.' },
            { codigo: 'dividiu_ao_contrario', valor: (m * g) / Epg, explicacao: 'Calculaste $m g / E_{pg}$ e obtiveste ' + vt((m * g) / Epg, U.m) + '. É ao contrário: $h = E_{pg}/(m g)$.' },
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
              { codigo: 'esqueceu_raiz', valor: v * v, explicacao: 'Obtiveste ' + vt(v * v) + ', que é $v^2$ (em $\\mathrm{m^2\\,s^{-2}}$). Falta a raiz quadrada.' },
              { codigo: 'esqueceu_o_fator_2', valor: Math.sqrt(Ec / m), explicacao: 'Calculaste $\\sqrt{E_c/m}$ e obtiveste ' + vt(Math.sqrt(Ec / m), U.ms) + ', sem o 2. De $E_c = \\tfrac{1}{2} m v^2$ vem $v = \\sqrt{2E_c/m}$.' },
              { codigo: 'multiplicou_pelo_meio_em_vez_de_dividir', valor: Math.sqrt(Ec / (2 * m)), explicacao: 'Multiplicaste por $\\tfrac{1}{2}$ em vez de dividir e obtiveste ' + vt(Math.sqrt(Ec / (2 * m)), U.ms) + '. Para isolar $v^2$, o $\\tfrac{1}{2}$ passa a multiplicar por 2: $v = \\sqrt{2E_c/m}$.' },
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
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: Ec / (v * v), explicacao: 'Calculaste $E_c / v^2$ e obtiveste ' + vt(Ec / (v * v), U.kg) + ', como se fosse $E_c = m v^2$. Com o $\\tfrac{1}{2}$, $m = 2E_c/v^2$.' },
              { codigo: 'esqueceu_o_quadrado_da_velocidade', valor: 2 * Ec / v, explicacao: 'Dividiste por $v$ e não por $v^2$, e obtiveste ' + vt(2 * Ec / v, U.kg) + '. A energia cinética depende do quadrado da velocidade.' },
              { codigo: 'multiplicou_pelo_meio_em_vez_de_dividir', valor: Ec / (2 * v * v), explicacao: 'Multiplicaste por $\\tfrac{1}{2}$ em vez de dividir e obtiveste ' + vt(Ec / (2 * v * v), U.kg) + '. Para isolar $m$, o $\\tfrac{1}{2}$ passa a multiplicar por 2: $m = 2E_c/v^2$.' },
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
})();
