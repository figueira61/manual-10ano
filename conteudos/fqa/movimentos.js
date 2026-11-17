globalThis.Manual = globalThis.Manual || {};

// Física e Química A — Física: tema «Energia e movimentos».
// O valor de g vem de Manual.dadosFisica (g = 10 m s⁻², formulário do IAVE) e entra no texto pelos auxiliares abaixo.
// Os resultados dos exemplos e das perguntas numéricas são confirmados pelo validador com Manual.fisica (verificar).
// Convenções: W = F d cos α (sinal dado pelo ângulo); W_P = −ΔEpg; W_FR = ΔEc; W_FNC = ΔEm.
(function () {
  const D = Manual.dadosFisica;
  const F = Manual.fisica;
  const g = D.constantes.g;

  // número com vírgula decimal: em KaTeX ({,}) e em texto corrido (,); o menos tipográfico no texto corrido
  const dec = (x, casas) => x.toFixed(casas).replace('.', '{,}');
  const decT = (x, casas) => x.toFixed(casas).replace('.', ',').replace('-', '−');
  // notação científica em KaTeX, mantissa em [1, 10) com `as` algarismos significativos
  const cient = (x, as) => {
    const [m, e] = x.toExponential(as - 1).split('e');
    return m.replace('.', '{,}') + ' \\times 10^{' + Number(e) + '}';
  };
  const G = String(g); // 10
  // arredonda a `casas` casas decimais sem o artefacto de vírgula flutuante (0,1225 → 0,123, não 0,122)
  const arred = (x, casas) => Math.round((x + Math.sign(x) * 1e-9) * 10 ** casas) / 10 ** casas;
  const gTexto = '$g = ' + G + '\\,\\mathrm{m\\,s^{-2}}$';

  // AL «ΔEc em função da distância»: carrinho de 0,500 kg que parte do repouso, com resultante constante.
  // Velocidades ilustrativas (medidas com um sensor), ΔEc = ½ m v² (Manual.fisica.ec) e reta de mínimos quadrados.
  const AL = { m: 0.5, d: [0.2, 0.4, 0.6, 0.8, 1.0], v: [0.70, 0.97, 1.21, 1.38, 1.56], prevista: 0.6 };
  AL.dEc = AL.v.map((v) => F.ec(AL.m, v));
  AL.reta = (function (xs, ys) {
    const n = xs.length;
    const sx = xs.reduce((a, x) => a + x, 0), sy = ys.reduce((a, y) => a + y, 0);
    const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), sxx = xs.reduce((a, x) => a + x * x, 0);
    const declive = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    return { declive, ordenada: (sy - declive * sx) / n };
  })(AL.d, AL.dEc);

  // AL «queda e ressalto»: bola de 0,10 kg largada de 1,20 m que sobe a 0,90 m.
  const BOLA = { m: 0.1, hq: 1.2, hr: 0.9 };
  BOLA.fracao = BOLA.hr / BOLA.hq; // 0,75
  BOLA.dissipada = F.epg(BOLA.m, BOLA.hq) - F.epg(BOLA.m, BOLA.hr);

  // Bloco num plano inclinado com atrito (6,0 m de comprimento, 3,0 m de desnível), m = 2,0 kg, a partir do repouso.
  const PLANO = { m: 2, h0: 3, L: 6, Fa: 4 };
  PLANO.pontos = F.comAtrito({ m: PLANO.m, h0: PLANO.h0, v0: 0, Fa: PLANO.Fa, percurso: [{ tipo: 'plano', comprimento: PLANO.L, desnivel: -PLANO.h0 }] });
  PLANO.fim = PLANO.pontos[PLANO.pontos.length - 1];
  PLANO.dEm = F.em(PLANO.m, PLANO.fim.v, 0) - F.em(PLANO.m, 0, PLANO.h0);

  Manual.registarTema('fqa', {
    id: 'movimentos',
    titulo: 'Energia e movimentos',
    subtemas: [
      // ------------------------------------------------------------------
      {
        id: 'sistema-mecanico',
        titulo: 'Energia de um sistema mecânico',
        ae: [
          'Compreender as transformações de energia num sistema mecânico redutível ao seu centro de massa, em resultado da interação com outros sistemas.',
        ],
        minutos: 10,
        essencial: [
          {
            tipo: 'texto',
            texto: 'Para estudar a energia, escolhe-se primeiro o **sistema**: a parte do Universo em estudo (por exemplo, um carrinho numa rampa). A **fronteira** separa o sistema do resto, a **vizinhança** (a Terra, a rampa, o ar, a mão que empurra). O sistema interage com a vizinhança e troca energia com ela.',
          },
          {
            tipo: 'definicao',
            texto: '**Modelo do centro de massa.** Se todos os pontos de um corpo se movem da mesma maneira (translação, sem rodar nem se deformar), basta estudar o movimento de um ponto, o **centro de massa**, como se toda a massa estivesse lá. O corpo fica **redutível a uma partícula**. Neste modelo ignora-se a energia interna (a das partículas que formam o corpo), e só contam a energia cinética e a energia potencial gravítica.',
          },
          {
            tipo: 'definicao',
            texto: 'A **energia cinética** $E_c$ é a energia associada ao movimento. Depende da massa $m$ (em kg) e da velocidade $v$ (em $\\mathrm{m\\,s^{-1}}$). Nunca é negativa e mede-se em joules (J).',
          },
          {
            tipo: 'formula',
            texto: '$$E_c = \\tfrac{1}{2}\\, m\\, v^2$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um automóvel de 1200 kg circula a 72 km/h. Calcula a sua energia cinética, em joules e em quilojoules.',
            resolucao: [
              'Converter a velocidade: $72\\,\\mathrm{km/h} = \\dfrac{72\\,000\\,\\mathrm{m}}{3600\\,\\mathrm{s}} = 20\\,\\mathrm{m\\,s^{-1}}$.',
              '$E_c = \\tfrac{1}{2} \\times 1200 \\times 20^2 = ' + cient(F.ec(1200, 20), 2) + '\\,\\mathrm{J}$.',
              'Em quilojoules: $1\\,\\mathrm{kJ} = 1000\\,\\mathrm{J}$, logo $E_c = ' + F.ec(1200, 20) / 1000 + '\\,\\mathrm{kJ}$.',
            ],
            resultado: 240000,
            verificar: () => F.ec(1200, 72 / 3.6),
          },
          {
            tipo: 'erro-frequente',
            texto: 'Não te esqueças do $\\tfrac{1}{2}$ nem do quadrado: $E_c$ é proporcional a $v^2$, por isso, se a velocidade duplica, a energia cinética fica **quatro** vezes maior. Converte km/h em $\\mathrm{m\\,s^{-1}}$ (divide por 3,6) e gramas em quilogramas antes de calcular, e não confundas J com kJ: $240\\,000\\,\\mathrm{J} = 240\\,\\mathrm{kJ}$.',
          },
          {
            tipo: 'definicao',
            texto: 'A **energia potencial gravítica** $E_{pg}$ resulta da interação do corpo com a Terra (rigorosamente, é energia do sistema corpo + Terra). Depende da altura $h$ do centro de massa em relação a um **nível de referência** que se escolhe, onde $E_{pg} = 0$; abaixo desse nível $h$ e $E_{pg}$ são negativas.',
          },
          {
            tipo: 'formula',
            texto: '$$E_{pg} = m\\, g\\, h$$ com ' + gTexto + ' e $h$ medida a partir do nível de referência.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um livro de 0,50 kg está numa prateleira a 1,8 m do chão. Calcula a sua energia potencial gravítica em relação ao chão e em relação ao tampo de uma mesa a 0,80 m do chão (' + gTexto + '). Quanto varia $E_{pg}$ se o livro cair para o chão?',
            resolucao: [
              'Nível de referência no chão: $E_{pg} = 0{,}50 \\times ' + G + ' \\times 1{,}8 = ' + dec(F.epg(0.5, 1.8), 1) + '\\,\\mathrm{J}$.',
              'Nível de referência no tampo da mesa: $h = 1{,}8 - 0{,}80 = 1{,}0\\,\\mathrm{m}$, logo $E_{pg} = 0{,}50 \\times ' + G + ' \\times 1{,}0 = ' + dec(F.epg(0.5, 1.0), 1) + '\\,\\mathrm{J}$.',
              'A cair para o chão, com qualquer dos níveis: $\\Delta E_{pg} = m g (h_f - h_i) = 0{,}50 \\times ' + G + ' \\times (0 - 1{,}8) = ' + dec(F.epg(0.5, 0) - F.epg(0.5, 1.8), 1) + '\\,\\mathrm{J}$.',
            ],
            resultado: 9,
            verificar: () => F.epg(0.5, 1.8),
          },
          {
            tipo: 'texto',
            texto: 'O valor de $E_{pg}$ depende do nível de referência, mas a sua **variação** não: só as variações de energia têm significado físico. Por isso, diz sempre qual é o nível de referência que usas.',
          },
          {
            tipo: 'definicao',
            texto: 'A **energia mecânica** $E_m$ de um sistema é a soma da energia cinética com a energia potencial gravítica: $E_m = E_c + E_{pg}$.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma bola de 0,20 kg passa a 5,0 m do solo com velocidade de 6,0 m/s. Calcula a sua energia mecânica, com o nível de referência no solo (' + gTexto + ').',
            resolucao: [
              '$E_c = \\tfrac{1}{2} \\times 0{,}20 \\times 6{,}0^2 = ' + dec(F.ec(0.2, 6), 1) + '\\,\\mathrm{J}$.',
              '$E_{pg} = 0{,}20 \\times ' + G + ' \\times 5{,}0 = ' + dec(F.epg(0.2, 5), 1) + '\\,\\mathrm{J}$.',
              '$E_m = E_c + E_{pg} = ' + dec(F.ec(0.2, 6), 1) + ' + ' + dec(F.epg(0.2, 5), 1) + ' = ' + dec(F.em(0.2, 6, 5), 1) + '\\,\\mathrm{J}$.',
            ],
            resultado: 13.6,
            verificar: () => Number(F.em(0.2, 6, 5).toFixed(1)),
          },
          {
            tipo: 'esquema',
            id: 'fqa-energias',
            opcoes: { percurso: 'rampa', h0: 3, v0: 0, Fa: 0 },
            legenda: 'Desloca o carrinho ao longo da rampa: a energia potencial gravítica transforma-se em energia cinética. Sem atrito, a energia mecânica (a soma das duas) fica igual em todos os pontos.',
          },
          {
            tipo: 'texto',
            texto: '**Transformações e transferências.** Dentro do sistema, a energia pode **transformar-se** (de potencial gravítica em cinética, quando o carrinho desce). Entre o sistema e a vizinhança, a energia **transfere-se**. Num sistema mecânico, a energia transfere-se como **trabalho**, quando a vizinhança exerce forças sobre o sistema: a mão que empurra o carrinho aumenta a sua energia; o atrito diminui-a.',
          },
        ],
        resumo: [
          'Sistema, fronteira e vizinhança: o sistema troca energia com a vizinhança.',
          'Modelo do centro de massa: um corpo em translação estuda-se como uma partícula com toda a massa.',
          '$E_c = \\tfrac{1}{2} m v^2$ (nunca negativa; proporcional a $v^2$).',
          '$E_{pg} = m g h$, com $h$ medida a partir de um nível de referência ($g = ' + G + '\\,\\mathrm{m\\,s^{-2}}$).',
          '$E_m = E_c + E_{pg}$.',
          'Unidades SI: m em kg, v em $\\mathrm{m\\,s^{-1}}$, h em m, energia em J ($1\\,\\mathrm{kJ} = 1000\\,\\mathrm{J}$).',
        ],
        quiz: [
          {
            id: 'sistema-mecanico-q01',
            tipo: 'numerica',
            enunciado: 'Uma bola de ténis de 60 g é servida a 25 m/s. Calcula a sua energia cinética, em joules, com dois algarismos significativos.',
            resposta: 19,
            algarismos: 2,
            tolerancia: 0.5,
            resolucao: [
              '$m = 60\\,\\mathrm{g} = 0{,}060\\,\\mathrm{kg}$',
              '$E_c = \\tfrac{1}{2} \\times 0{,}060 \\times 25^2 = ' + dec(F.ec(0.06, 25), 2) + '\\,\\mathrm{J} \\approx 19\\,\\mathrm{J}$',
            ],
            verificar: () => Number(F.ec(0.06, 25).toPrecision(2)),
            errosTipicos: [
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 37.5, explicacao: 'Calculaste $m v^2 = 37{,}5\\,\\mathrm{J}$ e esqueceste o $\\tfrac{1}{2}$: $E_c = \\tfrac{1}{2} m v^2 \\approx 19\\,\\mathrm{J}$.' },
              { codigo: 'massa_em_gramas', valor: 18750, explicacao: 'Usaste a massa em gramas e obtiveste 18 750; no SI a massa está em kg: $60\\,\\mathrm{g} = 0{,}060\\,\\mathrm{kg}$, e $E_c \\approx 19\\,\\mathrm{J}$.' },
            ],
          },
          {
            id: 'sistema-mecanico-q02',
            tipo: 'escolha',
            enunciado: 'Um ciclista duplica a sua velocidade. A sua energia cinética…',
            opcoes: ['quadruplica.', 'duplica.', 'fica igual.', 'reduz-se a metade.'],
            correta: 0,
            explicacao: '$E_c = \\tfrac{1}{2} m v^2$: com $2v$, fica $\\tfrac{1}{2} m (2v)^2 = 4 \\times \\tfrac{1}{2} m v^2$.',
            errosTipicos: [
              { codigo: 'esqueceu_o_quadrado_da_velocidade', opcao: 1, explicacao: 'A energia cinética é proporcional a $v^2$, não a $v$: $(2v)^2 = 4v^2$, por isso quadruplica.' },
            ],
          },
          {
            id: 'sistema-mecanico-q03',
            tipo: 'numerica',
            enunciado: 'Um vaso de 2,0 kg cai de um parapeito a 3,5 m do chão até ao chão. Calcula a variação da sua energia potencial gravítica, em joules (' + gTexto + ').',
            resposta: -70,
            tolerancia: 0.5,
            resolucao: [
              '$\\Delta E_{pg} = m g (h_f - h_i)$',
              '$\\Delta E_{pg} = 2{,}0 \\times ' + G + ' \\times (0 - 3{,}5) = ' + dec(F.epg(2, 0) - F.epg(2, 3.5), 0) + '\\,\\mathrm{J}$ (a energia potencial gravítica diminui)',
            ],
            verificar: () => F.epg(2, 0) - F.epg(2, 3.5),
            errosTipicos: [
              { codigo: 'variacao_com_o_sinal_trocado', valor: 70, explicacao: 'Calculaste $h_i - h_f$ e obtiveste $+70\\,\\mathrm{J}$. A variação é final menos inicial: o vaso desce, por isso $\\Delta E_{pg} = -70\\,\\mathrm{J}$.' },
              { codigo: 'esqueceu_g_na_energia_potencial', valor: -7, explicacao: 'Calculaste só $m \\Delta h = -7{,}0$: falta multiplicar por $g = ' + G + '\\,\\mathrm{m\\,s^{-2}}$, o que dá $-70\\,\\mathrm{J}$.' },
            ],
          },
          {
            id: 'sistema-mecanico-q04',
            tipo: 'vf',
            enunciado: 'A energia potencial gravítica de um corpo numa dada posição tem o mesmo valor, qualquer que seja o nível de referência escolhido.',
            correta: false,
            explicacao: '$E_{pg} = m g h$ e $h$ mede-se a partir do nível de referência, por isso o valor muda com ele. O que não muda é a **variação** $\\Delta E_{pg}$ entre duas posições.',
            errosTipicos: [
              { codigo: 'epg_sem_nivel_de_referencia', explicacao: 'O valor de $E_{pg}$ depende do nível de referência ($h$ mede-se a partir dele); só a variação $\\Delta E_{pg}$ é a mesma para qualquer nível.' },
            ],
          },
          {
            id: 'sistema-mecanico-q05',
            tipo: 'escolha',
            enunciado: 'Quando se pode estudar um corpo como uma partícula, com toda a massa no centro de massa?',
            opcoes: [
              'Quando todos os seus pontos se movem da mesma maneira (translação), sem interessar a rotação nem a deformação.',
              'Só quando o corpo é muito pequeno, como um grão de areia.',
              'Só quando o corpo está parado.',
              'Só quando a massa do corpo é desprezável.',
            ],
            correta: 0,
            explicacao: 'O modelo do centro de massa serve para corpos em translação, de qualquer tamanho (um automóvel, um esquiador): o movimento de um ponto representa o de todo o corpo.',
            errosTipicos: [
              { codigo: 'centro_de_massa_so_para_corpos_pequenos', opcao: 1, explicacao: 'O tamanho não importa: um automóvel em translação também se estuda pelo seu centro de massa. O que importa é todos os pontos moverem-se da mesma maneira.' },
              { codigo: 'centro_de_massa_so_em_repouso', opcao: 2, explicacao: 'O modelo serve precisamente para estudar o movimento (de translação); não exige que o corpo esteja parado.' },
            ],
          },
          {
            id: 'sistema-mecanico-q06',
            tipo: 'numerica',
            enunciado: 'Um carrinho de 0,50 kg tem 9,0 J de energia cinética. Calcula a sua velocidade, em m/s.',
            resposta: 6,
            tolerancia: 0.05,
            resolucao: [
              '$E_c = \\tfrac{1}{2} m v^2 \\Leftrightarrow v = \\sqrt{\\dfrac{2 E_c}{m}}$',
              '$v = \\sqrt{\\dfrac{2 \\times 9{,}0}{0{,}50}} = \\sqrt{36} = ' + dec(F.vDeEc(9, 0.5), 1) + '\\,\\mathrm{m\\,s^{-1}}$',
            ],
            verificar: () => F.vDeEc(9, 0.5),
            errosTipicos: [
              { codigo: 'esqueceu_raiz', valor: 36, explicacao: 'Calculaste $v^2 = 36$ e paraste aí; falta a raiz quadrada: $v = \\sqrt{36} = 6{,}0\\,\\mathrm{m\\,s^{-1}}$.' },
              { codigo: 'esqueceu_o_fator_2', valor: 4.24, explicacao: 'Calculaste $\\sqrt{E_c/m} \\approx 4{,}2$, sem o 2: de $E_c = \\tfrac{1}{2} m v^2$ vem $v = \\sqrt{2E_c/m} = 6{,}0\\,\\mathrm{m\\,s^{-1}}$.' },
            ],
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'trabalho',
        titulo: 'Trabalho e Teorema da Energia Cinética',
        ae: [
          'Interpretar as transferências de energia como trabalho em sistemas mecânicos, e os conceitos de força conservativa (aplicando o conceito de energia potencial gravítica) e de força não conservativa (aplicando o conceito de energia mecânica).',
          'Calcular o trabalho realizado por uma força constante em movimentos retilíneos, definindo o trabalho como a medida da energia transferida entre sistemas por ação de forças.',
          'Aplicar o Teorema da Energia Cinética.',
          'Estabelecer, experimentalmente, a relação entre a variação de energia cinética e a distância percorrida por um corpo, sujeito a um sistema de forças de resultante constante, usando processos de medição e de tratamento estatístico de dados e comunicando os resultados.',
          'Aplicar, na resolução de problemas, a relação entre os trabalhos (soma dos trabalhos realizados pelas forças, trabalho realizado pelo peso e soma dos trabalhos realizados pelas forças não conservativas) e as variações de energia, explicando as estratégias de resolução e os raciocínios demonstrativos que fundamentam uma conclusão.',
        ],
        minutos: 14,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'O **trabalho** $W$ de uma força é a medida da energia transferida entre sistemas por ação dessa força. É uma grandeza escalar e mede-se em joules (J). Se $W > 0$, o sistema recebe energia; se $W < 0$, o sistema cede energia.',
          },
          {
            tipo: 'formula',
            texto: 'Para uma força constante num movimento retilíneo: $$W = F\\, d \\cos\\alpha$$ com $F$ a intensidade da força (N), $d$ o módulo do deslocamento (m) e $\\alpha$ o ângulo entre a força e o deslocamento.',
          },
          {
            tipo: 'texto',
            texto: 'Só a componente da força na direção do deslocamento, $F\\cos\\alpha$ (a **componente eficaz**), realiza trabalho. A componente perpendicular ao deslocamento não transfere energia. O sinal de $W$ vem só de $\\cos\\alpha$.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Ângulo $\\alpha$', '$\\cos\\alpha$', 'Trabalho', 'Exemplo'],
            linhas: [
              ['$0°$', '$1$', '$W = F d$, potente (máximo)', 'empurrar um carrinho no sentido do movimento'],
              ['$0° < \\alpha < 90°$', 'positivo', '$W > 0$, potente', 'puxar uma mala por uma pega inclinada'],
              ['$90°$', '$0$', '$W = 0$, nulo', 'peso e força normal num movimento horizontal'],
              ['$90° < \\alpha < 180°$', 'negativo', '$W < 0$, resistente', 'peso de um corpo que sobe uma rampa'],
              ['$180°$', '$-1$', '$W = -F d$, resistente', 'força de atrito num deslizamento'],
            ],
          },
          {
            tipo: 'exemplo',
            enunciado: 'Puxas uma caixa ao longo de 4,0 m de chão horizontal com uma corda que exerce uma força de 50 N e faz 60° com o chão. A força de atrito tem intensidade 12 N. Calcula o trabalho da força exercida pela corda e o da força de atrito.',
            resolucao: [
              'Corda: o deslocamento é horizontal, logo $\\alpha = 60°$ e $W = 50 \\times 4{,}0 \\times \\cos 60° = 50 \\times 4{,}0 \\times 0{,}5 = ' + F.trabalho(50, 4, 60) + '\\,\\mathrm{J}$ (potente).',
              'Atrito: tem o sentido oposto ao do deslocamento, $\\alpha = 180°$, e $W = 12 \\times 4{,}0 \\times \\cos 180° = ' + F.trabalho(12, 4, 180) + '\\,\\mathrm{J}$ (resistente).',
            ],
            resultado: 100,
            verificar: () => F.trabalho(50, 4, 60),
          },
          {
            tipo: 'esquema',
            id: 'fqa-trabalho',
            opcoes: { F: 50, d: 4, alfa: 60 },
            legenda: 'Muda o ângulo entre a força e o deslocamento: abaixo de 90° o trabalho é potente, a 90° é nulo e acima de 90° é resistente. Repara na componente eficaz, $F\\cos\\alpha$.',
          },
          {
            tipo: 'erro-frequente',
            texto: 'O ângulo $\\alpha$ é sempre o ângulo entre a **força** e o **deslocamento**. Se o enunciado der o ângulo com a vertical, num deslocamento horizontal, $\\alpha = 90° -$ esse ângulo: uma força a $30°$ da vertical faz $60°$ com o chão. Usar $\\sin$ em vez de $\\cos$ dá o trabalho da componente errada. E um trabalho negativo não é "energia negativa": diz que o sistema **perdeu** energia por ação dessa força.',
          },
          {
            tipo: 'texto',
            texto: '**Trabalho da resultante.** Quando atuam várias forças, a soma dos trabalhos de todas as forças é igual ao trabalho da força resultante, $W_{F_R} = W_1 + W_2 + \\dots$ Num movimento horizontal, o peso e a força normal são perpendiculares ao deslocamento e não realizam trabalho.',
          },
          {
            tipo: 'definicao',
            texto: '**Teorema da Energia Cinética (TEC).** O trabalho realizado pela resultante das forças que atuam num corpo (redutível a uma partícula) é igual à variação da sua energia cinética: $$W_{F_R} = \\Delta E_c = E_{c,f} - E_{c,i}$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma caixa de 4,0 kg, inicialmente parada, é puxada 5,0 m sobre o chão horizontal por uma força horizontal de 30 N; a força de atrito tem intensidade 10 N. Calcula a velocidade final da caixa.',
            resolucao: [
              'Força aplicada ($\\alpha = 0°$): $W = 30 \\times 5{,}0 = ' + F.trabalho(30, 5, 0) + '\\,\\mathrm{J}$. Atrito ($\\alpha = 180°$): $W = -10 \\times 5{,}0 = ' + F.trabalho(10, 5, 180) + '\\,\\mathrm{J}$. Peso e normal ($\\alpha = 90°$): $W = 0$.',
              '$W_{F_R} = ' + F.trabalho(30, 5, 0) + ' + (' + F.trabalho(10, 5, 180) + ') = ' + (F.trabalho(30, 5, 0) + F.trabalho(10, 5, 180)) + '\\,\\mathrm{J}$.',
              'TEC: $W_{F_R} = \\Delta E_c = \\tfrac{1}{2} \\times 4{,}0 \\times v^2 - 0$, logo $v = \\sqrt{\\dfrac{2 \\times 100}{4{,}0}} = \\sqrt{50} \\approx ' + dec(F.vDeEc(F.trabalho(30, 5, 0) + F.trabalho(10, 5, 180), 4), 1) + '\\,\\mathrm{m\\,s^{-1}}$.',
            ],
            resultado: 7.07,
            verificar: () => Number(F.vDeEc(F.trabalho(30, 5, 0) + F.trabalho(10, 5, 180), 4).toFixed(2)),
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um automóvel de 1000 kg circula a 20 m/s numa estrada horizontal e trava; a força de travagem (atrito) é constante, de intensidade 8000 N. Calcula a distância de travagem. Que distância seria precisa a 40 m/s?',
            resolucao: [
              'Só a força de atrito realiza trabalho ($\\alpha = 180°$): $W_{F_R} = -F_a d$.',
              'TEC: $-F_a d = 0 - \\tfrac{1}{2} m v_i^2$, logo $d = \\dfrac{m v_i^2}{2 F_a} = \\dfrac{1000 \\times 20^2}{2 \\times 8000} = ' + F.travagem({ m: 1000, v0: 20, Fa: 8000 }) + '\\,\\mathrm{m}$.',
              'A 40 m/s: $d = \\dfrac{1000 \\times 40^2}{2 \\times 8000} = ' + F.travagem({ m: 1000, v0: 40, Fa: 8000 }) + '\\,\\mathrm{m}$. A velocidade duplica e a distância de travagem fica **quatro** vezes maior: é por isso que o excesso de velocidade é tão perigoso.',
            ],
            resultado: 25,
            verificar: () => F.travagem({ m: 1000, v0: 20, Fa: 8000 }),
          },
          {
            tipo: 'texto',
            texto: '**AL: $\\Delta E_c$ em função da distância.** Um carrinho parte do repouso sujeito a forças de resultante constante (por exemplo, a descer um plano inclinado). Mede-se a velocidade em várias posições (com um sensor ou células fotoelétricas) e calcula-se $\\Delta E_c = \\tfrac{1}{2} m v^2$. Pelo TEC, $\\Delta E_c = F_R\\, d$: o gráfico de $\\Delta E_c$ em função de $d$ é uma **reta que passa pela origem** e o seu **declive é a intensidade da resultante**.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['$d$ / m', '$v$ / $\\mathrm{m\\,s^{-1}}$', '$\\Delta E_c$ / J'],
            linhas: AL.d.map((d, i) => ['$' + dec(d, 2) + '$', '$' + dec(AL.v[i], 2) + '$', '$' + dec(arred(AL.dEc[i], 3), 3) + '$']),
          },
          {
            tipo: 'exemplo',
            enunciado: 'A tabela tem dados ilustrativos para um carrinho de 0,500 kg que parte do repouso. Ajusta uma reta ao gráfico de $\\Delta E_c$ em função de $d$ e determina a intensidade da resultante das forças. Compara com o valor previsto, ' + decT(AL.prevista, 2) + ' N.',
            resolucao: [
              'Cada $\\Delta E_c$ calcula-se com $\\tfrac{1}{2} m v^2$; por exemplo, para $d = 0{,}60\\,\\mathrm{m}$: $\\tfrac{1}{2} \\times 0{,}500 \\times 1{,}21^2 = ' + dec(arred(AL.dEc[2], 3), 3) + '\\,\\mathrm{J}$.',
              'Na calculadora (regressão linear): $\\Delta E_c = ' + dec(AL.reta.declive, 3) + '\\, d ' + (AL.reta.ordenada < 0 ? '- ' : '+ ') + dec(Math.abs(AL.reta.ordenada), 3) + '$ (SI). A ordenada na origem é quase zero, como prevê o TEC.',
              'O declive é a intensidade da resultante: $F_R \\approx ' + dec(AL.reta.declive, 2) + '\\,\\mathrm{N}$.',
              'Erro relativo: $\\dfrac{|' + dec(AL.reta.declive, 3) + ' - ' + dec(AL.prevista, 2) + '|}{' + dec(AL.prevista, 2) + '} \\times 100 \\approx ' + dec(Math.abs(AL.reta.declive - AL.prevista) / AL.prevista * 100, 0) + '\\,\\%$.',
            ],
            resultado: 0.61,
            verificar: () => Number(AL.reta.declive.toFixed(2)),
          },
          {
            tipo: 'erro-frequente',
            texto: 'No gráfico, a distância conta-se a partir do ponto de partida (onde $\\Delta E_c = 0$), e o declive tem unidade $\\mathrm{J/m} = \\mathrm{N}$: é uma força, a **resultante**, e não uma força isolada (como só o peso).',
          },
        ],
        resumo: [
          'Trabalho: energia transferida por ação de uma força, em J.',
          '$W = F d \\cos\\alpha$: potente ($\\alpha < 90°$), nulo ($\\alpha = 90°$), resistente ($\\alpha > 90°$).',
          'Só a componente eficaz $F\\cos\\alpha$ realiza trabalho.',
          'Soma dos trabalhos de todas as forças = trabalho da resultante.',
          'TEC: $W_{F_R} = \\Delta E_c$. Distância de travagem proporcional a $v^2$.',
          'AL: $\\Delta E_c$ em função de $d$ é uma reta pela origem; declive = intensidade da resultante.',
        ],
        quiz: [
          {
            id: 'trabalho-q01',
            tipo: 'numerica',
            enunciado: 'Uma força constante de 40 N faz um ângulo de 60° com o deslocamento, de 3,0 m. Calcula o trabalho realizado pela força, em joules.',
            resposta: 60,
            tolerancia: 0.5,
            resolucao: [
              '$W = F d \\cos\\alpha$',
              '$W = 40 \\times 3{,}0 \\times \\cos 60° = 40 \\times 3{,}0 \\times 0{,}5 = ' + F.trabalho(40, 3, 60) + '\\,\\mathrm{J}$',
            ],
            verificar: () => F.trabalho(40, 3, 60),
            errosTipicos: [
              { codigo: 'usou_o_seno_em_vez_do_cosseno', valor: 104, explicacao: 'Usaste $\\sin 60°$ e obtiveste cerca de 104 J. O trabalho usa o cosseno do ângulo entre a força e o deslocamento: $40 \\times 3{,}0 \\times \\cos 60° = 60\\,\\mathrm{J}$.' },
              { codigo: 'esqueceu_o_cosseno', valor: 120, explicacao: 'Calculaste $F d = 120\\,\\mathrm{J}$, como se a força tivesse a direção do deslocamento. Só a componente eficaz realiza trabalho: $\\times \\cos 60°$, 60 J.' },
            ],
          },
          {
            id: 'trabalho-q02',
            tipo: 'escolha',
            enunciado: 'Um livro desliza sobre uma mesa até parar. O trabalho realizado pela força de atrito é…',
            opcoes: ['negativo (resistente).', 'positivo (potente).', 'nulo.', 'positivo ou negativo, conforme a massa do livro.'],
            correta: 0,
            explicacao: 'A força de atrito tem sentido oposto ao do deslocamento: $\\alpha = 180°$, $\\cos 180° = -1$, $W = -F_a d < 0$. O atrito retira energia ao livro.',
            errosTipicos: [
              { codigo: 'trabalho_do_atrito_positivo', opcao: 1, explicacao: 'O atrito opõe-se ao deslocamento ($\\alpha = 180°$), por isso o seu trabalho é negativo: o livro perde energia cinética até parar.' },
              { codigo: 'trabalho_do_atrito_nulo', opcao: 2, explicacao: 'O trabalho só é nulo se a força for perpendicular ao deslocamento ($\\alpha = 90°$). O atrito tem a direção do deslocamento e sentido oposto: $W < 0$.' },
            ],
          },
          {
            id: 'trabalho-q03',
            tipo: 'escolha',
            enunciado: 'Um carrinho de massa $m$ percorre uma distância $d$ num chão horizontal. O trabalho realizado pelo peso do carrinho é…',
            opcoes: ['nulo.', '$m g d$.', '$-m g d$.', 'positivo, porque o carrinho se desloca.'],
            correta: 0,
            explicacao: 'O peso é vertical e o deslocamento é horizontal: $\\alpha = 90°$ e $\\cos 90° = 0$, logo $W_P = 0$ (a altura não muda).',
            errosTipicos: [
              { codigo: 'esqueceu_que_cos_90_e_zero', opcao: 1, explicacao: 'O peso faz $90°$ com o deslocamento horizontal e $\\cos 90° = 0$: o peso não realiza trabalho, porque a altura do carrinho não muda.' },
              { codigo: 'peso_com_trabalho_por_haver_deslocamento', opcao: 3, explicacao: 'Haver deslocamento não chega: o peso é perpendicular ao deslocamento horizontal ($\\alpha = 90°$), por isso $W_P = 0$.' },
            ],
          },
          {
            id: 'trabalho-q04',
            tipo: 'numerica',
            enunciado: 'A velocidade de um corpo de 2,0 kg passa de 3,0 m/s para 5,0 m/s. Calcula o trabalho realizado pela resultante das forças, em joules.',
            resposta: 16,
            tolerancia: 0.5,
            resolucao: [
              'TEC: $W_{F_R} = \\Delta E_c = \\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2$',
              '$W_{F_R} = \\tfrac{1}{2} \\times 2{,}0 \\times 5{,}0^2 - \\tfrac{1}{2} \\times 2{,}0 \\times 3{,}0^2 = ' + F.ec(2, 5) + ' - ' + F.ec(2, 3) + ' = ' + (F.ec(2, 5) - F.ec(2, 3)) + '\\,\\mathrm{J}$',
            ],
            verificar: () => F.ec(2, 5) - F.ec(2, 3),
            errosTipicos: [
              { codigo: 'quadrado_da_diferenca_de_velocidades', valor: 4, explicacao: 'Calculaste $\\tfrac{1}{2} m (\\Delta v)^2 = 4{,}0\\,\\mathrm{J}$. A variação é das energias cinéticas: $\\tfrac{1}{2} m v_f^2 - \\tfrac{1}{2} m v_i^2 = 25 - 9{,}0 = 16\\,\\mathrm{J}$.' },
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 32, explicacao: 'Obtiveste 32 J por esqueceres o $\\tfrac{1}{2}$ de $E_c = \\tfrac{1}{2} m v^2$: o trabalho da resultante é 16 J.' },
            ],
          },
          {
            id: 'trabalho-q05',
            tipo: 'numerica',
            enunciado: 'Um automóvel de 800 kg circula a 54 km/h numa estrada horizontal e trava com uma força de atrito constante de 6000 N. Calcula a distância de travagem, em metros.',
            resposta: 15,
            tolerancia: 0.5,
            resolucao: [
              '$v_i = 54\\,\\mathrm{km/h} = \\dfrac{54}{3{,}6} = 15\\,\\mathrm{m\\,s^{-1}}$',
              'TEC: $-F_a d = 0 - \\tfrac{1}{2} m v_i^2$, logo $d = \\dfrac{m v_i^2}{2 F_a} = \\dfrac{800 \\times 15^2}{2 \\times 6000} = ' + F.travagem({ m: 800, v0: 15, Fa: 6000 }) + '\\,\\mathrm{m}$',
            ],
            verificar: () => F.travagem({ m: 800, v0: 54 / 3.6, Fa: 6000 }),
            errosTipicos: [
              { codigo: 'velocidade_em_km_h', valor: 194.4, explicacao: 'Usaste 54 sem converter e obtiveste 194,4 m. A velocidade tem de estar em $\\mathrm{m\\,s^{-1}}$: $54\\,\\mathrm{km/h} = 15\\,\\mathrm{m\\,s^{-1}}$, e $d = 15\\,\\mathrm{m}$.' },
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 30, explicacao: 'Obtiveste 30 m por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$: a distância de travagem é 15 m.' },
            ],
          },
          {
            id: 'trabalho-q06',
            tipo: 'vf',
            enunciado: 'No gráfico da variação de energia cinética em função da distância percorrida, para um corpo sujeito a uma resultante constante, o declive da reta é a intensidade da resultante das forças.',
            correta: true,
            explicacao: 'Pelo TEC, $\\Delta E_c = F_R\\, d$ (o corpo parte de $d = 0$): é uma reta que passa pela origem, de declive $F_R$ (em $\\mathrm{J/m} = \\mathrm{N}$).',
          },
        ],
      },
      // ------------------------------------------------------------------
      {
        id: 'energia-mecanica',
        titulo: 'Forças conservativas e conservação da energia mecânica',
        ae: [
          'Interpretar as transferências de energia como trabalho em sistemas mecânicos, e os conceitos de força conservativa (aplicando o conceito de energia potencial gravítica) e de força não conservativa (aplicando o conceito de energia mecânica).',
          'Analisar situações do quotidiano sob o ponto de vista da conservação ou da variação da energia mecânica, identificando transformações de energia e transferências de energia.',
          'Investigar, experimentalmente, o movimento vertical de queda e de ressalto de uma bola, com base em considerações energéticas, avaliando os resultados, tendo em conta as previsões do modelo teórico, e comunicando as conclusões.',
          'Aplicar, na resolução de problemas, a relação entre os trabalhos (soma dos trabalhos realizados pelas forças, trabalho realizado pelo peso e soma dos trabalhos realizados pelas forças não conservativas) e as variações de energia, explicando as estratégias de resolução e os raciocínios demonstrativos que fundamentam uma conclusão.',
          'Relacionar o trabalho realizado por forças dissipativas com a diminuição da energia mecânica, calculando rendimentos.',
        ],
        minutos: 15,
        essencial: [
          {
            tipo: 'definicao',
            texto: 'Uma **força conservativa** é uma força cujo trabalho entre duas posições só depende dessas posições, e não da trajetória seguida. Numa trajetória fechada (que volta ao ponto de partida), o seu trabalho é nulo. O **peso** é uma força conservativa.',
          },
          {
            tipo: 'formula',
            texto: 'Trabalho do peso: $$W_P = -\\Delta E_{pg} = m g\\,(h_i - h_f)$$',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma bola de 0,40 kg passa de 6,0 m para 1,0 m de altura, ou em queda vertical ou a rolar por uma rampa. Calcula o trabalho do peso e a variação da energia potencial gravítica (' + gTexto + ').',
            resolucao: [
              'Nos dois percursos o desnível é o mesmo: $W_P = m g (h_i - h_f) = 0{,}40 \\times ' + G + ' \\times (6{,}0 - 1{,}0) = ' + dec(F.epg(0.4, 6) - F.epg(0.4, 1), 0) + '\\,\\mathrm{J}$.',
              '$\\Delta E_{pg} = -W_P = ' + dec(F.epg(0.4, 1) - F.epg(0.4, 6), 0) + '\\,\\mathrm{J}$: a descer, o peso realiza trabalho positivo e a energia potencial gravítica diminui.',
            ],
            resultado: 20,
            verificar: () => -(F.epg(0.4, 1) - F.epg(0.4, 6)),
          },
          {
            tipo: 'erro-frequente',
            texto: '$W_P$ e $\\Delta E_{pg}$ têm sempre **sinais opostos**. A descer, $W_P > 0$ e $\\Delta E_{pg} < 0$; a subir, $W_P < 0$ e $\\Delta E_{pg} > 0$. Não escrevas $W_P = \\Delta E_{pg}$.',
          },
          {
            tipo: 'definicao',
            texto: 'As **forças não conservativas** são as outras: força de atrito, resistência do ar, força exercida por uma pessoa ou por um motor. O seu trabalho depende da trajetória. A soma dos trabalhos das forças não conservativas é igual à variação da energia mecânica: $$W_{FNC} = \\Delta E_m$$',
          },
          {
            tipo: 'texto',
            texto: 'Isto vem do TEC: $W_{F_R} = W_P + W_{FNC} = \\Delta E_c$. Como $W_P = -\\Delta E_{pg}$, fica $W_{FNC} = \\Delta E_c + \\Delta E_{pg} = \\Delta E_m$.',
          },
          {
            tipo: 'definicao',
            texto: '**Conservação da energia mecânica.** Se só o peso realiza trabalho (ou se as forças não conservativas não realizam trabalho, como a força normal perpendicular ao movimento), $W_{FNC} = 0$ e a energia mecânica mantém-se: $E_c + E_{pg}$ é igual em todos os pontos. A energia potencial gravítica transforma-se em cinética, e vice-versa.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um carrinho de montanha-russa parte do repouso a 20 m de altura. Desprezando o atrito e a resistência do ar, calcula a sua velocidade quando passa a 5,0 m de altura (' + gTexto + ').',
            resolucao: [
              'Só o peso realiza trabalho (a força normal é perpendicular ao movimento): $E_m$ conserva-se.',
              '$\\tfrac{1}{2} m v^2 + m g h = 0 + m g h_0 \\Leftrightarrow v = \\sqrt{2 g (h_0 - h)}$: a massa não interessa.',
              '$v = \\sqrt{2 \\times ' + G + ' \\times (20 - 5{,}0)} = \\sqrt{300} \\approx ' + dec(F.conservacao({ h0: 20, v0: 0, h: 5 }), 1) + '\\,\\mathrm{m\\,s^{-1}}$.',
            ],
            resultado: 17.3,
            verificar: () => Number(F.conservacao({ h0: 20, v0: 0, h: 5 }).toFixed(1)),
          },
          {
            tipo: 'esquema',
            id: 'fqa-energias',
            opcoes: { percurso: 'montanha-russa', h0: 3, v0: 0, Fa: 0 },
            legenda: 'Sem atrito, a energia mecânica é igual em todo o percurso. Aumenta a força de atrito: a energia mecânica diminui e a energia dissipada cresce com a distância percorrida.',
          },
          {
            tipo: 'texto',
            texto: 'As **forças dissipativas** (atrito, resistência do ar) realizam trabalho negativo e a energia mecânica **diminui**. Essa energia não desaparece: é dissipada, aumenta a energia interna do corpo e da vizinhança (aquecem). Uma força como a de um motor ou de uma pessoa pode realizar trabalho positivo e **aumentar** a energia mecânica.',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Um bloco de 2,0 kg parte do repouso no topo de um plano inclinado com 6,0 m de comprimento e 3,0 m de altura e chega à base com velocidade de ' + decT(PLANO.fim.v, 1) + ' m/s. Calcula o trabalho das forças não conservativas, a intensidade da força de atrito (constante) e o rendimento da transformação de energia potencial gravítica em cinética (' + gTexto + '; nível de referência na base).',
            resolucao: [
              '$E_{m,i} = m g h = 2{,}0 \\times ' + G + ' \\times 3{,}0 = ' + F.em(PLANO.m, 0, PLANO.h0) + '\\,\\mathrm{J}$; $E_{m,f} = \\tfrac{1}{2} \\times 2{,}0 \\times ' + dec(PLANO.fim.v, 1) + '^2 = ' + F.em(PLANO.m, PLANO.fim.v, 0) + '\\,\\mathrm{J}$.',
              '$W_{FNC} = \\Delta E_m = ' + F.em(PLANO.m, PLANO.fim.v, 0) + ' - ' + F.em(PLANO.m, 0, PLANO.h0) + ' = ' + PLANO.dEm + '\\,\\mathrm{J}$ (só o atrito: a normal não realiza trabalho).',
              '$W_{F_a} = -F_a d \\Leftrightarrow F_a = \\dfrac{' + (-PLANO.dEm) + '}{6{,}0} = ' + dec(-PLANO.dEm / PLANO.L, 1) + '\\,\\mathrm{N}$.',
              'Rendimento: $\\eta = \\dfrac{E_{c,f}}{|\\Delta E_{pg}|} = \\dfrac{' + F.em(PLANO.m, PLANO.fim.v, 0) + '}{' + F.em(PLANO.m, 0, PLANO.h0) + '} = ' + dec(F.rendimento(PLANO.fim.ec, PLANO.pontos[0].epg), 2) + '$, isto é, ' + Math.round(F.rendimento(PLANO.fim.ec, PLANO.pontos[0].epg) * 100) + ' %. Os outros ' + Math.round((1 - F.rendimento(PLANO.fim.ec, PLANO.pontos[0].epg)) * 100) + ' % (' + PLANO.fim.dissipada + ' J) foram dissipados.',
            ],
            resultado: -24,
            verificar: () => PLANO.dEm,
          },
          {
            tipo: 'erro-frequente',
            texto: 'Cuidado com as unidades: com a massa em kg, $g$ em $\\mathrm{m\\,s^{-2}}$ e a altura em m, a energia sai em **joules**. Se a pergunta pedir quilojoules, divide por 1000 ($3600\\,\\mathrm{J} = 3{,}6\\,\\mathrm{kJ}$); não mistures J com kJ na mesma conta.',
          },
          {
            tipo: 'quadro',
            cabecalho: ['Situação', 'O que acontece à energia mecânica'],
            linhas: [
              ['Montanha-russa real', 'diminui por atrito e resistência do ar: cada lomba tem de ser mais baixa do que a anterior'],
              ['Automóvel a travar numa estrada horizontal', '$E_c$ diminui e $E_{pg}$ não muda: a energia é dissipada nos travões e nos pneus, que aquecem'],
              ['Paraquedista a descer com velocidade constante', '$E_c$ constante e $E_{pg}$ a diminuir: $E_m$ diminui (resistência do ar)'],
              ['Elevador a subir com velocidade constante', '$E_c$ constante e $E_{pg}$ a aumentar: $E_m$ aumenta, pelo trabalho positivo do motor'],
              ['Pêndulo ou queda livre, sem resistência do ar', 'conserva-se: $E_{pg}$ e $E_c$ transformam-se uma na outra'],
            ],
          },
          {
            tipo: 'erro-frequente',
            texto: '"A energia mecânica conserva-se sempre" é falso. Só se conserva quando as forças não conservativas não realizam trabalho. O que se conserva sempre é a energia **total**: a energia mecânica que se perde aparece como energia interna (aquecimento) do corpo e da vizinhança.',
          },
          {
            tipo: 'texto',
            texto: '**AL: queda e ressalto de uma bola.** Larga-se uma bola de várias alturas e mede-se a altura de queda $h_q$ e a do ressalto $h_r$ (com um sensor de movimento ou um vídeo). Nos pontos mais altos a bola está parada, $E_c = 0$, e $E_m = m g h$. Desprezando a resistência do ar, a energia perde-se na colisão com o chão, e a **fração da energia mecânica que se mantém** em cada ressalto é $h_r / h_q$.',
          },
          {
            tipo: 'texto',
            texto: 'O gráfico de $h_r$ em função de $h_q$ é, aproximadamente, uma reta que passa pela origem: o declive é a fração da energia mecânica que se mantém na colisão, que depende da bola e do chão. A raiz quadrada dessa fração, $e = \\sqrt{h_r/h_q}$, é o **coeficiente de restituição** (a razão entre a velocidade logo após e logo antes da colisão).',
          },
          {
            tipo: 'exemplo',
            enunciado: 'Uma bola de 0,10 kg cai de 1,20 m e sobe até 0,90 m. Calcula a fração da energia mecânica que se mantém na colisão, a energia dissipada e a altura prevista para o ressalto seguinte (' + gTexto + ').',
            resolucao: [
              'Fração da energia mecânica que se mantém: $\\dfrac{h_r}{h_q} = \\dfrac{0{,}90}{1{,}20} = ' + dec(BOLA.fracao, 2) + '$ (' + Math.round(BOLA.fracao * 100) + ' %).',
              'Energia dissipada: $m g (h_q - h_r) = 0{,}10 \\times ' + G + ' \\times (1{,}20 - 0{,}90) = ' + dec(BOLA.dissipada, 2) + '\\,\\mathrm{J}$.',
              'Ressalto seguinte, com a mesma fração: $h = ' + dec(BOLA.fracao, 2) + ' \\times 0{,}90 \\approx ' + dec(F.ressalto(BOLA.hq, BOLA.fracao, 2)[1], 2) + '\\,\\mathrm{m}$.',
            ],
            resultado: 0.3,
            verificar: () => Number(BOLA.dissipada.toFixed(2)),
          },
          {
            tipo: 'esquema',
            id: 'fqa-ressalto',
            opcoes: { h0: BOLA.hq, fracao: BOLA.fracao },
            legenda: 'Muda a fração da energia mecânica que se mantém em cada ressalto: as alturas formam uma sequência que diminui sempre na mesma proporção, e a energia dissipada em cada colisão é cada vez menor.',
          },
        ],
        resumo: [
          'Força conservativa: o trabalho só depende das posições inicial e final (o peso).',
          '$W_P = -\\Delta E_{pg} = m g (h_i - h_f)$: sinais opostos.',
          '$W_{FNC} = \\Delta E_m$; forças dissipativas fazem diminuir $E_m$.',
          'Sem trabalho de forças não conservativas, $E_m$ conserva-se: $E_c + E_{pg}$ constante.',
          'Rendimento: energia útil a dividir pela energia fornecida; a restante é dissipada.',
          'AL ressalto: fração da energia mecânica que se mantém $= h_r / h_q$; dissipada $= m g (h_q - h_r)$.',
        ],
        quiz: [
          {
            id: 'energia-mecanica-q01',
            tipo: 'numerica',
            enunciado: 'Uma pedra de 0,50 kg cai do repouso de uma altura de 1,8 m. Desprezando a resistência do ar, calcula a velocidade com que chega ao chão, em m/s (' + gTexto + ').',
            resposta: 6,
            tolerancia: 0.05,
            resolucao: [
              'Só o peso realiza trabalho: $E_m$ conserva-se, $m g h = \\tfrac{1}{2} m v^2$',
              '$v = \\sqrt{2 g h} = \\sqrt{2 \\times ' + G + ' \\times 1{,}8} = \\sqrt{36} = ' + dec(F.conservacao({ h0: 1.8, v0: 0, h: 0 }), 1) + '\\,\\mathrm{m\\,s^{-1}}$',
            ],
            verificar: () => F.conservacao({ h0: 1.8, v0: 0, h: 0 }),
            errosTipicos: [
              { codigo: 'esqueceu_raiz', valor: 36, explicacao: 'Obtiveste $v^2 = 36$; falta a raiz quadrada: $v = 6{,}0\\,\\mathrm{m\\,s^{-1}}$.' },
              { codigo: 'esqueceu_o_fator_2', valor: 4.24, explicacao: 'Calculaste $\\sqrt{g h} \\approx 4{,}2$, sem o 2: de $m g h = \\tfrac{1}{2} m v^2$ vem $v = \\sqrt{2 g h} = 6{,}0\\,\\mathrm{m\\,s^{-1}}$.' },
            ],
          },
          {
            id: 'energia-mecanica-q02',
            tipo: 'numerica',
            enunciado: 'Um esquiador de 60 kg parte do repouso e desce uma pista com 20 m de desnível, chegando ao fim com velocidade de 15 m/s. Calcula a soma dos trabalhos das forças não conservativas, em **quilojoules** (' + gTexto + ').',
            resposta: -5.25,
            tolerancia: 0.01,
            resolucao: [
              '$W_{FNC} = \\Delta E_m = (E_{c,f} + E_{pg,f}) - (E_{c,i} + E_{pg,i})$, com o nível de referência no fim da pista',
              '$\\Delta E_m = \\tfrac{1}{2} \\times 60 \\times 15^2 - 60 \\times ' + G + ' \\times 20 = ' + F.ec(60, 15) + ' - ' + F.epg(60, 20) + ' = ' + (F.em(60, 15, 0) - F.em(60, 0, 20)) + '\\,\\mathrm{J}$',
              '$W_{FNC} = ' + dec((F.em(60, 15, 0) - F.em(60, 0, 20)) / 1000, 2) + '\\,\\mathrm{kJ}$ (negativo: as forças dissipativas retiraram energia ao esquiador)',
            ],
            verificar: () => (F.em(60, 15, 0) - F.em(60, 0, 20)) / 1000,
            errosTipicos: [
              { codigo: 'trabalho_dissipativo_com_sinal_positivo', valor: 5.25, explicacao: 'Deste $+5{,}25\\,\\mathrm{kJ}$; a energia mecânica diminuiu ($E_{m,f} < E_{m,i}$), por isso $W_{FNC} = \\Delta E_m = -5{,}25\\,\\mathrm{kJ}$.' },
              { codigo: 'respondeu_em_joules', valor: -5250, explicacao: 'Respondeste $-5250$, que é o valor em joules; pede-se em quilojoules: $-5250\\,\\mathrm{J} = -5{,}25\\,\\mathrm{kJ}$.' },
              { codigo: 'esqueceu_o_meio_na_energia_cinetica', valor: 1.5, explicacao: 'Obtiveste $+1{,}5\\,\\mathrm{kJ}$ por usares $m v^2$ em vez de $\\tfrac{1}{2} m v^2$: $E_{c,f} = 6750\\,\\mathrm{J}$ e $W_{FNC} = -5{,}25\\,\\mathrm{kJ}$.' },
            ],
          },
          {
            id: 'energia-mecanica-q03',
            tipo: 'escolha',
            enunciado: 'Um paraquedista desce com velocidade constante. Durante a descida…',
            opcoes: [
              'a energia cinética mantém-se e a energia mecânica diminui.',
              'a energia cinética mantém-se e a energia mecânica também.',
              'a energia cinética diminui e a energia mecânica mantém-se.',
              'a energia potencial gravítica transforma-se toda em energia cinética.',
            ],
            correta: 0,
            explicacao: 'Com velocidade constante, $E_c$ não muda; a altura diminui, logo $E_{pg}$ diminui e $E_m = E_c + E_{pg}$ diminui. A resistência do ar (força não conservativa) realiza trabalho negativo.',
            errosTipicos: [
              { codigo: 'ec_constante_implica_em_constante', opcao: 1, explicacao: '$E_c$ constante não chega: $E_m = E_c + E_{pg}$ e a $E_{pg}$ está a diminuir, por isso $E_m$ diminui.' },
              { codigo: 'energia_mecanica_conserva_se_sempre', opcao: 3, explicacao: 'Se toda a $E_{pg}$ passasse a $E_c$, a velocidade aumentaria. Aqui $E_c$ é constante: a energia potencial perdida é dissipada pela resistência do ar.' },
            ],
          },
          {
            id: 'energia-mecanica-q04',
            tipo: 'vf',
            enunciado: 'Quando um corpo desce, o trabalho realizado pelo seu peso é negativo, porque a energia potencial gravítica diminui.',
            correta: false,
            explicacao: 'A descer, o peso tem o sentido do movimento vertical e o seu trabalho é **positivo**; a energia potencial gravítica diminui. $W_P = -\\Delta E_{pg}$: sinais opostos.',
            errosTipicos: [
              { codigo: 'trabalho_do_peso_com_o_sinal_de_epg', explicacao: '$W_P = -\\Delta E_{pg}$: quando a $E_{pg}$ diminui ($\\Delta E_{pg} < 0$), o trabalho do peso é positivo.' },
            ],
          },
          {
            id: 'energia-mecanica-q05',
            tipo: 'numerica',
            enunciado: 'Numa AL de queda e ressalto, uma bola largada de 1,50 m sobe, depois do primeiro ressalto, até 1,05 m. Que percentagem da energia mecânica foi dissipada na colisão? (Despreza a resistência do ar.)',
            resposta: 30,
            tolerancia: 0.5,
            resolucao: [
              'Nos pontos mais altos $E_c = 0$, logo $E_m = m g h$ e a fração da energia mecânica que se mantém é $\\dfrac{h_r}{h_q} = \\dfrac{1{,}05}{1{,}50} = 0{,}70$',
              'Dissipada: $1 - 0{,}70 = 0{,}30$, isto é, 30 %',
            ],
            verificar: () => (F.epg(1, 1.5) - F.epg(1, 1.05)) / F.epg(1, 1.5) * 100,
            errosTipicos: [
              { codigo: 'deu_a_fracao_conservada', valor: 70, explicacao: '70 % é a fração da energia mecânica que **se mantém** ($h_r/h_q$). A dissipada é o resto: $100 - 70 = 30\\,\\%$.' },
              { codigo: 'tomou_a_diferenca_de_alturas_como_percentagem', valor: 45, explicacao: 'Calculaste a diferença das alturas, 0,45 m, e tomaste-a como percentagem; é preciso dividir pela altura de queda: $\\dfrac{1{,}50 - 1{,}05}{1{,}50} \\times 100 = 30\\,\\%$.' },
            ],
          },
          {
            id: 'energia-mecanica-q06',
            tipo: 'escolha',
            enunciado: 'Um caixote desce uma rampa com atrito: a sua energia potencial gravítica diminui 50 J e a sua energia cinética aumenta 40 J. Qual é o rendimento da transformação de energia potencial gravítica em energia cinética?',
            opcoes: ['80 %', '20 %', '125 %', '10 %'],
            correta: 0,
            explicacao: '$\\eta = \\dfrac{40}{50} = ' + dec(F.rendimento(40, 50), 2) + '$ (80 %). Os outros 10 J foram dissipados pelo atrito: $W_{FNC} = \\Delta E_m = 40 - 50 = -10\\,\\mathrm{J}$.',
            errosTipicos: [
              { codigo: 'deu_a_fracao_dissipada', opcao: 1, explicacao: '20 % é a fração **dissipada** ($10/50$). O rendimento é a fração útil: $40/50 = 80\\,\\%$.' },
              { codigo: 'rendimento_maior_do_que_1', opcao: 2, explicacao: 'Dividiste ao contrário ($50/40$). O rendimento nunca passa de 100 %: é energia útil a dividir pela fornecida, $40/50 = 80\\,\\%$.' },
              { codigo: 'tomou_a_energia_dissipada_como_rendimento', opcao: 3, explicacao: '10 J é a energia dissipada (e é uma energia, não uma percentagem). O rendimento é a energia útil a dividir pela fornecida: $40/50 = 80\\,\\%$.' },
            ],
          },
        ],
      },
    ],
  });
})();
