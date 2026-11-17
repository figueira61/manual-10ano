globalThis.Manual = globalThis.Manual || {};

// Geradores de Física e Química A — Química, tema «Propriedades e transformações da matéria».
// Subtemas: ligacao, geometria, carbono, gases, solucoes, entalpia, fotoquimica (ids <subtema>-<tipo>).
// Os valores químicos (massas atómicas, energias e comprimentos de ligação, constantes, composição do ar) vêm só de
// Manual.dadosQuimicos; os cálculos de Manual.quimica; as estruturas, geometrias e polaridades de Manual.moleculas.
// verificarIndependente e a verificação usam outro caminho (contagem de ligações a partir das estruturas do catálogo,
// classificação pelos grupos da Tabela Periódica, octeto átomo a átomo, conversões em dois passos…).
// Manual.dadosQuimicos, Manual.quimica e Manual.moleculas só são lidos dentro de gerar (carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const D = () => Manual.dadosQuimicos;
  const Q = () => Manual.quimica;
  const K = () => Manual.dadosQuimicos.constantes;
  const Mol = () => Manual.moleculas;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const soma = (l) => l.reduce((s, v) => s + v, 0);
  const { fmt, tex, fechar, fecharTexto, confere, vfDe, chave } = A;
  const tentar = (construir) => A.tentar(construir, 'materia');
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'fqa', tema: 'materia', id: def.subtema + '-' + def.tipo }, def));
  }

  // ---------------------------------------------------------------- números
  // «pm» escreve-se em duas caixas: a palavra solta «pm» é tomada pelo verificador por um \pm sem barra.
  const PM = '\\mathrm{p}\\mathrm{m}';
  const cient = (x, as) => Manual.formatar.cientifico(x, as);
  const aAS = (v, k) => Number(Number(v).toPrecision(k));
  function ambiguo(v, k) {
    const e = Math.floor(Math.log10(Math.abs(v)));
    const s = Math.abs(v) / Math.pow(10, e - k + 1);
    return Math.abs(s - Math.floor(s) - 0.5) < 1e-6;
  }
  // Número com k algarismos significativos em LaTeX (decimal, ou notação científica se muito grande ou pequeno).
  function texAS(v, k) {
    if (v === 0) return '0';
    const t = Math.abs(v).toPrecision(k);
    if (/e/.test(t) || Math.abs(v) >= 1e4 || Math.abs(v) < 1e-3) return cient(v, k);
    return (v < 0 ? '-' : '') + t.replace('.', '{,}');
  }
  const txtAS = (v, k) => '$' + texAS(v, k) + '$';
  const texF = (v, casas) => (v < 0 ? '-' : '') + Math.abs(v).toFixed(casas).replace('.', '{,}');
  const sinalTex = (v) => (v > 0 ? '+' : v < 0 ? '-' : '') + tex(Math.abs(v));

  // ---------------------------------------------------------------- elementos e moléculas
  const el = (s) => D().elementos[s];
  const nomeEl = (s) => el(s).nome.toLowerCase();
  const mol = (id) => Mol().obter(id);
  const formula = (id) => mol(id).formula;
  // Metal pela posição na Tabela Periódica: grupos 1 e 2 (exceto o H), bloco d e grupo 13 a partir do Al.
  const ehMetal = (s) => s !== 'H' && (el(s).grupo <= 2 || el(s).bloco === 'd' || (el(s).grupo === 13 && s !== 'B'));
  // Ligação no texto corrido: C–H, C=O, N≡N (traço tipográfico).
  const ligTxt = (k) => k.replace('-', '–');
  // Ligação em LaTeX: \mathrm{C{-}H}, \mathrm{C{=}O}, \mathrm{N{\equiv}N}.
  const ligTex = (k) => '\\mathrm{' + k.replace('-', '{-}').replace('=', '{=}').replace('≡', '{\\equiv}') + '}';
  const SIMB_ORDEM = { 1: '-', 2: '=', 3: '≡' };
  // Chave da tabela de ligações para dois elementos e uma ordem (tenta as duas ordens de escrita).
  function chaveLigacao(a, b, ordem) {
    const s = SIMB_ORDEM[ordem];
    const k1 = a + s + b;
    const k2 = b + s + a;
    if (D().ligacoes[k1]) return k1;
    if (D().ligacoes[k2]) return k2;
    return null;
  }
  // Ligações de uma molécula do catálogo, contadas na estrutura: { 'C-H': 4, ... }.
  function ligacoesDe(id) {
    const m = mol(id);
    const r = {};
    for (const [i, j, o] of m.ligacoes) {
      const k = chaveLigacao(m.atomos[i].el, m.atomos[j].el, o);
      if (!k) throw new Error('materia: ligação sem energia na tabela em ' + id);
      r[k] = (r[k] || 0) + 1;
    }
    return r;
  }
  const valencia = (s) => Mol().eletroesValenciaAtomo(s);
  // Átomos da fórmula: { C: 1, H: 4 } a partir da estrutura.
  function atomosDe(id) {
    const r = {};
    for (const a of mol(id).atomos) r[a.el] = (r[a.el] || 0) + 1;
    return r;
  }
  const dadosZ = (id) => Object.keys(atomosDe(id)).map((s) => '$Z(\\mathrm{' + s + '}) = ' + el(s).z + '$').join(', ');
  const juntar = (l) => (l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1]);
  // Concordância com o número: plural(1, 'par', 'pares') = '1 par', plural(3, 'par', 'pares') = '3 pares'.
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  // « = » se o valor mostrado com 3 a.s. é exato, « ≈ » se foi arredondado.
  const igualAprox = (v) => (Math.abs(aAS(v, 3) - v) < 1e-9 * Math.max(1, Math.abs(v)) ? ' = ' : ' \\approx ');
  // Artigo definido pelo género do nome (os nomes do catálogo terminados em -a são femininos: água, propanona, metilamina).
  const artigo = (nome) => (/a$/.test(nome) ? 'a' : 'o');

  // ================================================================ ligacao
  // Substâncias para o tipo de ligação: [fórmula LaTeX, nome, elementos, tipo]. Só iónicos claros (metais dos grupos 1 e 2).
  const SUBST_LIGACAO = [
    ['NaCl', 'cloreto de sódio', ['Na', 'Cl'], 'ionica'],
    ['KCl', 'cloreto de potássio', ['K', 'Cl'], 'ionica'],
    ['LiF', 'fluoreto de lítio', ['Li', 'F'], 'ionica'],
    ['NaF', 'fluoreto de sódio', ['Na', 'F'], 'ionica'],
    ['MgO', 'óxido de magnésio', ['Mg', 'O'], 'ionica'],
    ['CaO', 'óxido de cálcio', ['Ca', 'O'], 'ionica'],
    ['MgCl_2', 'cloreto de magnésio', ['Mg', 'Cl'], 'ionica'],
    ['CaCl_2', 'cloreto de cálcio', ['Ca', 'Cl'], 'ionica'],
    ['Na_2O', 'óxido de sódio', ['Na', 'O'], 'ionica'],
    ['KBr', 'brometo de potássio', ['K', 'Br'], 'ionica'],
    ['H_2O', 'água', ['H', 'O'], 'covalente'],
    ['NH_3', 'amoníaco', ['N', 'H'], 'covalente'],
    ['HCl', 'cloreto de hidrogénio', ['H', 'Cl'], 'covalente'],
    ['HF', 'fluoreto de hidrogénio', ['H', 'F'], 'covalente'],
    ['CH_4', 'metano', ['C', 'H'], 'covalente'],
    ['H_2S', 'sulfureto de hidrogénio', ['H', 'S'], 'covalente'],
    ['HBr', 'brometo de hidrogénio', ['H', 'Br'], 'covalente'],
    ['Cl_2', 'cloro', ['Cl'], 'covalente'],
    ['O_2', 'oxigénio', ['O'], 'covalente'],
    ['N_2', 'nitrogénio', ['N'], 'covalente'],
    ['CO_2', 'dióxido de carbono', ['C', 'O'], 'covalente'],
    ['Na', 'sódio', ['Na'], 'metalica'],
    ['Mg', 'magnésio', ['Mg'], 'metalica'],
    ['K', 'potássio', ['K'], 'metalica'],
    ['Al', 'alumínio', ['Al'], 'metalica'],
    ['Cu', 'cobre', ['Cu'], 'metalica'],
    ['Fe', 'ferro', ['Fe'], 'metalica'],
  ];
  const NOME_TIPO = { covalente: 'Covalente', ionica: 'Iónica', metalica: 'Metálica', hidrogenio: 'Ligação de hidrogénio', covalentePolar: 'Covalente polar' };
  const tipoPorGrupos = (els) => {
    const metais = els.filter(ehMetal).length;
    if (metais === els.length) return 'metalica';
    return metais === 0 ? 'covalente' : 'ionica';
  };

  registar({
    subtema: 'ligacao', tipo: 'tipo', nome: 'Tipo de ligação química entre elementos',
    formatos: ['escolha', 'vf'], contextos: ['elementos', 'substancia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        // Escolha: só iónicos e covalentes com H ligado a N, O ou F (só aí «ligação de hidrogénio» é uma confusão real); vf: todos.
        const lista = formato === 'escolha'
          ? SUBST_LIGACAO.filter((x) => x[3] === 'ionica' || (x[3] === 'covalente' && x[2].includes('H') && x[2].some((y) => ['N', 'O', 'F'].includes(y))))
          : SUBST_LIGACAO;
        const [f, nome, els, tipo] = escolher(rng, lista);
        const F = '$\\mathrm{' + f + '}$';
        const metal = els.find(ehMetal);
        const naoMetal = els.find((s) => !ehMetal(s));
        const outro = els.find((s) => s !== 'H') || 'H';
        const descricao = els.length === 1
          ? 'entre os átomos de ' + nomeEl(els[0]) + (tipo === 'metalica' ? ' no ' + nome + ' metálico' : ' na molécula ' + F)
          : 'entre os átomos de ' + nomeEl(els[0]) + ' e de ' + nomeEl(els[1]) + ' n' + (/^[aá]/.test(nome) ? 'a ' : 'o ') + nome + ', ' + F;
        const enunciado = contexto === 'elementos'
          ? 'Que tipo de ligação química se estabelece ' + descricao + '?'
          : 'Que tipo de ligação química existe n' + (/^[aá]/.test(nome) ? 'a ' : 'o ') + nome + ', ' + F + '?';
        const classes = els.map((s) => maiuscula(nomeEl(s)) + (ehMetal(s) ? ' — metal (grupo ' + el(s).grupo + ')' : ' — não metal')).join('; ');
        const porque = ({
          ionica: () => 'O ' + nomeEl(metal) + ' é um metal e cede eletrões, formando catiões; o ' + nomeEl(naoMetal) + ' é um não metal e recebe-os, formando aniões. Os iões de cargas opostas atraem-se numa rede: ligação iónica.',
          covalente: () => els.length === 1
            ? 'Os dois átomos de ' + nomeEl(els[0]) + ' (não metal) partilham pares de eletrões de valência: ligação covalente.'
            : 'O ' + nomeEl(els[0]) + ' e o ' + nomeEl(els[1]) + ' são não metais: partilham pares de eletrões de valência, formando moléculas. É uma ligação covalente.',
          metalica: () => 'Os átomos de ' + nomeEl(els[0]) + ' são todos de um metal: os eletrões de valência ficam deslocalizados por uma rede de catiões. É uma ligação metálica.',
        })[tipo]();
        const resolucao = [
          { passo: 'Classificar os elementos', porque: classes + '.' },
          { passo: 'Decidir o tipo de ligação', porque: porque },
        ];
        const certa = NOME_TIPO[tipo];
        const dados = { formula: f, elementos: els, contexto };
        const verificacao = { passo: 'Confirmar pelos grupos da Tabela Periódica', calculo: els.map((s) => '\\mathrm{' + s + '}\\colon\\ \\text{grupo } ' + el(s).grupo).join(';\\ '), valor: null };
        const E = {
          covalente_entre_metal_e_nao_metal: 'A ligação covalente (partilha de pares de eletrões) é típica entre não metais. Aqui o ' + (metal ? nomeEl(metal) : '') + ' é um metal: cede eletrões e formam-se iões, numa ligação iónica.',
          metalica_por_ter_um_metal: 'A ligação metálica é entre átomos de metais. Aqui só o ' + (metal ? nomeEl(metal) : '') + ' é metal; o ' + (naoMetal ? nomeEl(naoMetal) : '') + ' recebe eletrões e forma-se uma rede de iões: ligação iónica.',
          confundiu_ligacao_com_interacao_intermolecular: '' + (tipo === 'ionica'
            ? 'A ligação de hidrogénio é uma interação entre moléculas, com H ligado a N, O ou F. ' + F + ' não é formado por moléculas: é uma rede de iões (ligação iónica).'
            : 'A ligação de hidrogénio é uma interação entre moléculas diferentes. Dentro de cada molécula, os átomos de ' + nomeEl('H') + ' e de ' + nomeEl(outro) + ' partilham pares de eletrões: ligação covalente.'),
          ionica_entre_nao_metais: 'Para haver ligação iónica é preciso um metal que ceda eletrões. ' + (els.length === 1 ? 'Os dois átomos de ' + nomeEl(els[0]) + ' são iguais e não metálicos' : 'O ' + nomeEl(els[0]) + ' e o ' + nomeEl(els[1]) + ' são não metais') + ': partilham pares de eletrões, numa ligação covalente.',
          covalente_polar_entre_metal_e_nao_metal: 'A diferença de eletronegatividade entre o ' + (metal ? nomeEl(metal) : '') + ' e o ' + (naoMetal ? nomeEl(naoMetal) : '') + ' é tão grande que o metal cede eletrões: não há pares partilhados (nem polares), formam-se iões. É uma ligação iónica.',
          tomou_o_hidrogenio_por_metal: 'O hidrogénio está no grupo 1, mas não é um metal: com o ' + nomeEl(outro) + ' partilha pares de eletrões, numa ligação covalente. A ligação metálica é entre átomos de metais.',
          covalente_entre_atomos_iguais: 'Átomos iguais partilham pares de eletrões quando são de um não metal (como no $\\mathrm{Cl_2}$). O ' + nomeEl(els[0]) + ' é um metal: os eletrões de valência ficam deslocalizados por uma rede de catiões (ligação metálica).',
        };
        const errosPorTipo = {
          ionica: [['covalente', 'covalente_entre_metal_e_nao_metal'], ['metalica', 'metalica_por_ter_um_metal'], ['covalentePolar', 'covalente_polar_entre_metal_e_nao_metal']],
          covalente: [['ionica', 'ionica_entre_nao_metais'], ['metalica', 'tomou_o_hidrogenio_por_metal'], ['hidrogenio', 'confundiu_ligacao_com_interacao_intermolecular']],
          metalica: [['covalente', 'covalente_entre_atomos_iguais']],
        };
        if (formato === 'escolha') {
          const erros = errosPorTipo[tipo].map(([t, c]) => ({ codigo: c, texto: NOME_TIPO[t], explicacao: E[c] }));
          return fecharTexto(rng, { enunciado, resolucao, dados, verificacao }, certa, erros, certa);
        }
        const opcoesFalsas = errosPorTipo[tipo].filter(([t, c]) => t !== 'hidrogenio' && (c !== 'tomou_o_hidrogenio_por_metal' || els.includes('H')));
        const [tf, cf] = escolher(rng, opcoesFalsas);
        const frase = (t) => 'A ligação química ' + (contexto === 'elementos' ? descricao : 'n' + (/^[aá]/.test(nome) ? 'a ' : 'o ') + nome + ', ' + F + ',') + ' é ' + NOME_TIPO[t].toLowerCase() + '.';
        const v = vfDe(rng, frase(tipo), frase(tf), { codigo: cf, explicacao: E[cf] });
        dados.afirmado = v.correta ? tipo : tf;
        return Object.assign({ resolucao, dados, verificacao: Object.assign({}, verificacao, { valor: v.correta }) }, v);
      });
    },
    verificarIndependente(p) {
      const tipo = tipoPorGrupos(p.dados.elementos);
      if (p.formato === 'vf') return p.correta === (p.dados.afirmado === tipo);
      return p.opcoes[p.correta] === NOME_TIPO[tipo];
    },
    limites(p) {
      return SUBST_LIGACAO.some((x) => x[0] === p.dados.formula);
    },
  });

  // Estruturas de Lewis: pares ligantes, não ligantes e eletrões de valência.
  const MOL_LEWIS = ['O2', 'N2', 'Cl2', 'HCl', 'HF', 'H2O', 'NH3', 'CH4', 'CO2', 'HCN', 'C2H4', 'C2H2', 'CH3OH'];
  // Pares não ligantes pelo octeto, átomo a átomo (H fica com 2 eletrões; B com 6 no BF3).
  function naoLigantesPeloOcteto(id) {
    const m = mol(id);
    const lig = m.atomos.map(() => 0);
    for (const [i, j, o] of m.ligacoes) { lig[i] += o; lig[j] += o; }
    return soma(m.atomos.map((a, i) => ((a.el === 'H' ? 2 : 8) - 2 * lig[i]) / 2));
  }

  registar({
    subtema: 'ligacao', tipo: 'lewis', nome: 'Pares ligantes, pares não ligantes e eletrões de valência (Lewis)',
    formatos: ['numerica', 'escolha'], contextos: ['nao-ligantes', 'ligantes', 'valencia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const id = escolher(rng, MOL_LEWIS);
        const m = mol(id);
        const c = Mol().contar(id);
        const F = '$' + m.formula + '$';
        const ats = atomosDe(id);
        const simbs = Object.keys(ats);
        const ve = c.eletroesValencia;
        const Pl = c.paresLigantes;
        const Pn = c.paresNaoLigantes;
        if (contexto === 'nao-ligantes' && Pn === 0) return null;
        const nLig = m.ligacoes.length;
        const passoVe = {
          passo: 'Contar os eletrões de valência', porque: 'Cada átomo contribui com os eletrões do último nível (' + simbs.map((s) => s + ' com ' + valencia(s)).join(', ') + ').',
          calculo: simbs.map((s) => (ats[s] === 1 ? '' : ats[s] + ' \\times ') + valencia(s)).join(' + ') + ' = ' + ve,
        };
        const multiplas = c.duplas + c.triplas > 0;
        const passoPl = {
          passo: 'Contar os pares ligantes na fórmula de estrutura', porque: 'Cada ligação simples é 1 par ligante, cada dupla 2 e cada tripla 3' + (multiplas ? ' (há ' + juntar([c.ligacoesSimples && plural(c.ligacoesSimples, 'simples', 'simples'), c.duplas && plural(c.duplas, 'dupla', 'duplas'), c.triplas && plural(c.triplas, 'tripla', 'triplas')].filter(Boolean)) + ').' : '; aqui só há ligações simples.'),
          calculo: '' + (c.ligacoesSimples ? c.ligacoesSimples + ' \\times 1' : '') + (c.duplas ? (c.ligacoesSimples ? ' + ' : '') + c.duplas + ' \\times 2' : '') + (c.triplas ? (c.ligacoesSimples || c.duplas ? ' + ' : '') + c.triplas + ' \\times 3' : '') + ' = ' + Pl,
        };
        let resposta, enunciado, resolucao, erros, verificacao, figuraEnunciado;
        const centrais = Mol().centrais(id);
        const paresCentrais = soma(centrais.map((i) => m.atomos[i].pares));
        if (contexto === 'nao-ligantes') {
          resposta = Pn;
          figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } };
          enunciado = 'A figura mostra a fórmula de estrutura da molécula ' + F + ', sem os pares não ligantes (' + dadosZ(id) + '). Quantos pares de eletrões não ligantes tem a molécula, no total?';
          resolucao = [passoVe, passoPl, { passo: 'Os eletrões que sobram formam pares não ligantes', porque: 'Os eletrões de valência que não estão em pares ligantes ficam em pares não ligantes; confirma-se que cada átomo (exceto o H) fica com 8 eletrões.', calculo: '\\dfrac{' + ve + ' - 2 \\times ' + Pl + '}{2} = ' + Pn }];
          erros = [
            { codigo: 'contou_eletroes_em_vez_de_pares', valor: 2 * Pn, explicacao: 'Obtiveste ' + 2 * Pn + ', que é o número de eletrões não ligantes; cada par tem 2 eletrões, por isso há ' + plural(Pn, 'par', 'pares') + '.' },
            { codigo: 'somou_pares_ligantes_e_nao_ligantes', valor: Pl + Pn, explicacao: 'Obtiveste ' + (Pl + Pn) + ', que é o total de pares de valência (' + plural(Pl, 'par ligante', 'pares ligantes') + ' + ' + plural(Pn, 'par não ligante', 'pares não ligantes') + '); pedia-se só o número de pares não ligantes: ' + Pn + '.' },
            { codigo: 'deu_os_pares_ligantes', valor: Pl, explicacao: Pl + ' é o número de pares ligantes (os traços da fórmula de estrutura); os pares que sobram, não ligantes, são ' + Pn + '.' },
          ];
          // Só quando o átomo central tem pares não ligantes: um erro de valor 0 confundir-se-ia com uma resposta em branco.
          if (centrais.length && paresCentrais > 0 && paresCentrais !== Pn) erros.push({ codigo: 'contou_so_os_pares_do_atomo_central', valor: paresCentrais, explicacao: 'Obtiveste ' + paresCentrais + ' porque contaste só os pares não ligantes do átomo central; os átomos das pontas (exceto o H) também têm pares não ligantes: no total há ' + plural(Pn, 'par não ligante', 'pares não ligantes') + '.' });
          verificacao = { passo: 'Completar o octeto átomo a átomo (H com 2 eletrões)', calculo: m.atomos.map((a) => a.pares).join(' + ') + ' = ' + Pn, valor: naoLigantesPeloOcteto(id) };
        } else if (contexto === 'ligantes') {
          resposta = Pl;
          figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } };
          enunciado = 'A figura mostra a fórmula de estrutura da molécula ' + F + '. Quantos pares de eletrões ligantes tem a molécula?';
          resolucao = [passoPl];
          erros = [
            { codigo: 'contou_eletroes_em_vez_de_pares', valor: 2 * Pl, explicacao: 'Obtiveste ' + 2 * Pl + ', que é o número de eletrões ligantes; cada par tem 2 eletrões, por isso há ' + plural(Pl, 'par ligante', 'pares ligantes') + '.' },
          ];
          if (multiplas) erros.push({ codigo: 'contou_ligacoes_em_vez_de_pares', valor: nLig, explicacao: 'Contaste ' + plural(nLig, 'ligação', 'ligações') + ', mas uma ligação dupla tem 2 pares ligantes e uma tripla tem 3: são ' + plural(Pl, 'par', 'pares') + '.' });
          if (Pn > 0) {
            erros.push({ codigo: 'somou_pares_ligantes_e_nao_ligantes', valor: Pl + Pn, explicacao: 'Obtiveste ' + (Pl + Pn) + ', que é o total de pares de valência (' + plural(Pl, 'par ligante', 'pares ligantes') + ' + ' + plural(Pn, 'par não ligante', 'pares não ligantes') + '); os ligantes são só os partilhados entre átomos: ' + Pl + '.' });
            erros.push({ codigo: 'deu_os_pares_nao_ligantes', valor: Pn, explicacao: Pn + ' é o número de pares não ligantes; os pares ligantes são os das ligações: ' + Pl + '.' });
          }
          verificacao = Pn > 0
            ? { passo: 'Pares de valência menos pares não ligantes', calculo: '\\dfrac{' + ve + '}{2} - ' + Pn + ' = ' + Pl, valor: ve / 2 - Pn }
            : { passo: 'Sem pares não ligantes, todos os pares de valência são ligantes', calculo: '\\dfrac{' + ve + '}{2} = ' + Pl, valor: ve / 2 };
        } else {
          resposta = ve;
          enunciado = 'Quantos eletrões de valência há, no total, na molécula ' + F + ' (' + dadosZ(id) + ')?';
          const confs = simbs.map((s) => '\\mathrm{' + s + '}\\colon\\ ' + Q().configuracao(el(s).z).spd.replace(/(\d)([spd])\^(\d+)/g, '\\mathrm{$1$2}^{$3}').replace(/ /g, '\\,'));
          resolucao = [
            { passo: 'Escrever a configuração de cada elemento', porque: 'Os eletrões de valência são os do último nível ocupado.', calculo: confs.join(';\\quad '), bloco: true },
            passoVe,
          ];
          const somaZ = soma(simbs.map((s) => ats[s] * el(s).z));
          const umaVez = soma(simbs.map((s) => valencia(s)));
          erros = [
            { codigo: 'usou_z_em_vez_dos_eletroes_de_valencia', valor: somaZ, explicacao: 'Obtiveste ' + somaZ + ' porque somaste os números atómicos (todos os eletrões); só contam os de valência: ' + ve + '.' },
            { codigo: 'deu_o_numero_de_pares', valor: ve / 2, explicacao: ve / 2 + ' é o número de pares de valência; pedia-se o número de eletrões: ' + ve + '.' },
          ];
          if (simbs.some((s) => ats[s] > 1)) erros.push({ codigo: 'contou_cada_elemento_uma_vez', valor: umaVez, explicacao: 'Obtiveste ' + umaVez + ' porque contaste cada elemento uma só vez; cada átomo contribui com os seus eletrões de valência (multiplica pelos índices): ' + ve + '.' });
          verificacao = { passo: 'Dois eletrões por cada par, ligante ou não ligante', calculo: '2 \\times (' + Pl + ' + ' + Pn + ') = ' + 2 * (Pl + Pn), valor: 2 * (Pl + Pn) };
        }
        const ex = {
          enunciado, resolucao, dados: { molecula: id, contexto },
          esquema: { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'lewis' } },
        };
        if (figuraEnunciado) ex.figuraEnunciado = figuraEnunciado;
        return fechar(rng, formato, ex, { resposta, tolerancia: 0, texto: (v) => fmt(v), erros, verificacao });
      });
    },
    verificarIndependente(p) {
      const id = p.dados.molecula;
      const m = mol(id);
      // Eletrões de valência pelos grupos da TP; pares ligantes pela soma das ordens; não ligantes pelo resto.
      const ve = soma(m.atomos.map((a) => (el(a.el).grupo > 12 ? el(a.el).grupo - 10 : el(a.el).grupo)));
      const pl = soma(m.ligacoes.map((l) => l[2]));
      const v = p.dados.contexto === 'valencia' ? ve : p.dados.contexto === 'ligantes' ? pl : (ve - 2 * pl) / 2;
      return confere(p, v, (x) => fmt(x));
    },
    limites(p) {
      return MOL_LEWIS.includes(p.dados.molecula) && Mol().octeto(p.dados.molecula).cumpre;
    },
  });

  // Ordem de ligação, energia e comprimento (ligações entre os mesmos elementos).
  const FAMILIAS = [['C-C', 'C=C', 'C≡C'], ['N-N', 'N=N', 'N≡N'], ['O-O', 'O=O']];
  const ORDEM_DE = (k) => (k.includes('≡') ? 3 : k.includes('=') ? 2 : 1);
  const NOME_ORDEM = { 1: 'simples', 2: 'dupla', 3: 'tripla' };
  // Moléculas do catálogo com uma só ligação carbono–carbono.
  const MOL_CC = { C2H6: 'C-C', C2H4: 'C=C', C2H2: 'C≡C' };

  registar({
    subtema: 'ligacao', tipo: 'parametros', nome: 'Ordem de ligação, energia de ligação e comprimento de ligação',
    formatos: ['escolha', 'vf'], contextos: ['familia', 'molecula'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let x, y, nomeX, nomeY, ids;
        if (contexto === 'familia') {
          const fam = escolher(rng, FAMILIAS);
          [x, y] = baralhar(rng, fam).slice(0, 2);
          nomeX = 'a ligação $' + ligTex(x) + '$';
          nomeY = 'a ligação $' + ligTex(y) + '$';
        } else {
          ids = baralhar(rng, Object.keys(MOL_CC)).slice(0, 2);
          [x, y] = ids.map((i) => MOL_CC[i]);
          nomeX = 'a ligação carbono–carbono no ' + mol(ids[0]).nome + ', $' + formula(ids[0]) + '$';
          nomeY = 'a ligação carbono–carbono no ' + mol(ids[1]).nome + ', $' + formula(ids[1]) + '$';
        }
        const ox = ORDEM_DE(x);
        const oy = ORDEM_DE(y);
        const maior = ox > oy;
        const afirm = (forte, curta) => maiuscula(nomeX) + ' é mais ' + (forte ? 'forte' : 'fraca') + ' e mais ' + (curta ? 'curta' : 'comprida') + ' do que ' + nomeY + '.';
        const enunciado = 'Compara ' + nomeX + ' com ' + nomeY + '. Qual das afirmações está correta?';
        const resolucao = [
          { passo: 'Identificar a ordem de cada ligação', porque: (contexto === 'molecula' ? 'Nas fórmulas de estrutura, o ' + mol(ids[0]).nome + ' tem uma ligação C' + SIMB_ORDEM[ox].replace('-', '–') + 'C e o ' + mol(ids[1]).nome + ' uma ligação C' + SIMB_ORDEM[oy].replace('-', '–') + 'C. ' : '') + 'A ligação $' + ligTex(x) + '$ é ' + NOME_ORDEM[ox] + ' (' + plural(ox, 'par ligante', 'pares ligantes') + ') e a $' + ligTex(y) + '$ é ' + NOME_ORDEM[oy] + ' (' + plural(oy, 'par ligante', 'pares ligantes') + ').' },
          { passo: 'Aplicar a relação com a ordem de ligação', porque: 'Entre átomos dos mesmos elementos, mais pares ligantes atraem mais os núcleos: a ligação fica mais forte (maior energia de ligação) e mais curta. Por isso a $' + ligTex(maior ? x : y) + '$ é a mais forte e a mais curta.' },
        ];
        const lx = D().ligacoes[x];
        const ly = D().ligacoes[y];
        const verificacao = { passo: 'Confirmar com a tabela de energias e comprimentos de ligação', calculo: ligTex(x) + '\\colon\\ ' + lx.energia + '\\,\\mathrm{kJ\\,mol^{-1}},\\ ' + lx.comprimento + '\\,' + PM + ';\\quad ' + ligTex(y) + '\\colon\\ ' + ly.energia + '\\,\\mathrm{kJ\\,mol^{-1}},\\ ' + ly.comprimento + '\\,' + PM, valor: null };
        const certa = afirm(maior, maior);
        const quemMais = '$' + ligTex(maior ? x : y) + '$';
        const E = {
          achou_que_mais_pares_alongam_a_ligacao: 'A relação com a energia está certa, mas mais pares ligantes aproximam os núcleos: a ligação ' + quemMais + ' é a mais curta, não a mais comprida.',
          achou_que_mais_pares_enfraquecem_a_ligacao: 'O comprimento está certo, mas mais pares ligantes tornam a ligação mais forte: a ' + quemMais + ' tem maior energia de ligação.',
          inverteu_o_efeito_da_ordem_de_ligacao: 'Trocaste as duas relações: é a ligação com mais pares ligantes, ' + quemMais + ', que é mais forte e mais curta.',
        };
        const erros = [
          { codigo: 'achou_que_mais_pares_alongam_a_ligacao', texto: afirm(maior, !maior), explicacao: E.achou_que_mais_pares_alongam_a_ligacao },
          { codigo: 'achou_que_mais_pares_enfraquecem_a_ligacao', texto: afirm(!maior, maior), explicacao: E.achou_que_mais_pares_enfraquecem_a_ligacao },
          { codigo: 'inverteu_o_efeito_da_ordem_de_ligacao', texto: afirm(!maior, !maior), explicacao: E.inverteu_o_efeito_da_ordem_de_ligacao },
        ];
        const dados = { x, y, contexto, ids: ids || null };
        const esquema = contexto === 'molecula' ? { id: 'fqa-molecula', opcoes: { molecula: ids[0], modo: 'estrutura' } } : undefined;
        if (formato === 'escolha') {
          const ex = { enunciado, resolucao, dados, verificacao };
          if (esquema) ex.esquema = esquema;
          return fecharTexto(rng, ex, certa, erros, certa);
        }
        const e = escolher(rng, erros);
        const v = vfDe(rng, certa, e.texto, { codigo: e.codigo, explicacao: e.explicacao });
        const ex = Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
        if (esquema) ex.esquema = esquema;
        return ex;
      });
    },
    verificarIndependente(p) {
      const lx = D().ligacoes[p.dados.x];
      const ly = D().ligacoes[p.dados.y];
      const forte = lx.energia > ly.energia;
      const curta = lx.comprimento < ly.comprimento;
      const certo = (t) => t.includes('mais ' + (forte ? 'forte' : 'fraca') + ' e mais ' + (curta ? 'curta' : 'comprida'));
      if (p.formato === 'vf') return p.correta === certo(p.enunciado);
      return p.opcoes.filter(certo).length === 1 && certo(p.opcoes[p.correta]);
    },
    limites(p) {
      return p.dados.x !== p.dados.y && p.dados.x[0] === p.dados.y[0] && ORDEM_DE(p.dados.x) !== ORDEM_DE(p.dados.y);
    },
  });

  // ================================================================ geometria
  // Ângulo em texto corrido: 104,5°.
  const grau = (v) => String(v).replace('.', ',') + '°';
  const geoTexto = (g, a) => maiuscula(g) + ', com ângulo de ligação de cerca de ' + grau(a);
  // Átomo central (um só), ligações e pares não ligantes à volta dele.
  function central(id) {
    const m = mol(id);
    const i = Mol().centrais(id)[0];
    const viz = m.ligacoes.filter(([p, q]) => p === i || q === i).length;
    return { i, el: m.atomos[i].el, ligados: viz, pares: m.atomos[i].pares };
  }
  // Geometria pelo número de átomos ligados e de pares não ligantes do átomo central (modelo de repulsão dos pares).
  const GEO_REGRA = { '2-0': 'linear', '3-0': 'triangular plana', '4-0': 'tetraédrica', '3-1': 'piramidal trigonal', '2-2': 'angular', '2-1': 'angular' };
  // Ângulo de ligação a partir das coordenadas 3D do catálogo (arredondado a 0,5°).
  function angulo3d(id) {
    const m = mol(id);
    const c = central(id);
    const outros = m.ligacoes.filter(([p, q]) => p === c.i || q === c.i).map(([p, q]) => (p === c.i ? q : p)).slice(0, 2);
    const a = m.atomos3d;
    const v = outros.map((k) => [a[k].x - a[c.i].x, a[k].y - a[c.i].y, a[k].z - a[c.i].z]);
    const dot = soma(v[0].map((x, j) => x * v[1][j]));
    const n = (u) => Math.sqrt(soma(u.map((x) => x * x)));
    return Math.round(2 * Math.acos(dot / (n(v[0]) * n(v[1]))) * 180 / Math.PI) / 2;
  }
  // Erros típicos de geometria por molécula: [geometria, ângulo, código, explicação].
  const GEO_ERROS = {
    H2O: [
      { g: 'linear', a: 180, codigo: 'ignorou_os_pares_nao_ligantes', explicacao: 'Com duas ligações e sem pares não ligantes seria linear (como o $\\mathrm{CO_2}$); mas o oxigénio tem 2 pares não ligantes, que empurram as ligações O–H: a molécula é angular.' },
      { g: 'tetraédrica', a: 109.5, codigo: 'deu_a_geometria_dos_pares', explicacao: 'Os 4 pares à volta do oxigénio dispõem-se como num tetraedro, mas a geometria descreve só a posição dos átomos: com 3 átomos, a molécula é angular.' },
      { g: 'angular', a: 109.5, codigo: 'usou_o_angulo_ideal_dos_pares', explicacao: 'A geometria está certa, mas 109,5° é o ângulo do tetraedro perfeito. Os 2 pares não ligantes repelem mais e fecham o ângulo para cerca de 104,5°.' },
    ],
    NH3: [
      { g: 'triangular plana', a: 120, codigo: 'ignorou_os_pares_nao_ligantes', explicacao: 'Com 3 ligações e sem pares não ligantes seria triangular plana (como o $\\mathrm{BF_3}$); mas o nitrogénio tem um par não ligante, que empurra as ligações N–H para baixo: piramidal trigonal.' },
      { g: 'tetraédrica', a: 109.5, codigo: 'deu_a_geometria_dos_pares', explicacao: 'Os 4 pares à volta do nitrogénio dispõem-se como num tetraedro, mas a geometria descreve só a posição dos átomos: o N no vértice e 3 H por baixo formam uma pirâmide trigonal.' },
      { g: 'piramidal trigonal', a: 109.5, codigo: 'usou_o_angulo_ideal_dos_pares', explicacao: 'A geometria está certa, mas 109,5° é o ângulo do tetraedro perfeito. O par não ligante repele mais e fecha o ângulo para cerca de 107°.' },
    ],
    CH4: [
      { g: 'quadrangular plana', a: 90, codigo: 'seguiu_o_desenho_no_plano', explicacao: 'A fórmula desenhada no papel parece uma cruz plana (ângulos de 90°), mas no espaço os 4 pares ligantes afastam-se mais: ficam num tetraedro, com 109,5°.' },
      { g: 'piramidal trigonal', a: 107, codigo: 'piramidal_sem_par_nao_ligante', explicacao: 'A geometria piramidal trigonal é a do $\\mathrm{NH_3}$, com 3 ligações e um par não ligante. O carbono do metano faz 4 ligações e não tem pares não ligantes: tetraédrica.' },
      { g: 'tetraédrica', a: 90, codigo: 'leu_o_angulo_no_desenho', explicacao: 'A geometria está certa, mas os 90° são os do desenho no papel. Num tetraedro o ângulo entre as ligações é de cerca de 109,5°.' },
    ],
    O3: [
      { g: 'linear', a: 180, codigo: 'ignorou_os_pares_nao_ligantes', explicacao: 'Com duas ligações e sem pares não ligantes no átomo central seria linear; mas o oxigénio central tem um par não ligante, que empurra as ligações: a molécula é angular.' },
      { g: 'triangular plana', a: 120, codigo: 'deu_a_geometria_dos_pares', explicacao: 'As duas ligações e o par não ligante do oxigénio central dispõem-se num triângulo, mas a geometria descreve só a posição dos átomos: com 3 átomos, a molécula é angular.' },
      { g: 'angular', a: 120, codigo: 'usou_o_angulo_ideal_dos_pares', explicacao: 'A geometria está certa, mas 120° é o ângulo do triângulo perfeito. O par não ligante repele mais e fecha o ângulo para cerca de 117°.' },
    ],
    CO2: [
      { g: 'angular', a: 104.5, codigo: 'pos_pares_nao_ligantes_no_carbono', explicacao: 'Imaginaste o $\\mathrm{CO_2}$ como a água. O carbono faz duas ligações duplas e não tem pares não ligantes: as duas ligações afastam-se o mais possível e a molécula é linear (180°).' },
    ],
    BF3: [
      { g: 'piramidal trigonal', a: 107, codigo: 'pos_um_par_nao_ligante_no_boro', explicacao: 'Imaginaste o $\\mathrm{BF_3}$ como o $\\mathrm{NH_3}$. O boro faz 3 ligações e não tem pares não ligantes (fica só com 6 eletrões): a molécula é triangular plana (120°).' },
    ],
  };
  const GEO_ESCOLHA = ['H2O', 'NH3', 'CH4', 'O3'];

  registar({
    subtema: 'geometria', tipo: 'forma', nome: 'Geometria molecular e ângulo de ligação',
    formatos: ['escolha', 'vf'], contextos: ['formula', 'lewis'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const id = escolher(rng, formato === 'escolha' ? GEO_ESCOLHA : Object.keys(GEO_ERROS));
        const m = mol(id);
        const c = central(id);
        const F = '$' + m.formula + '$';
        const certa = geoTexto(m.geometria, m.angulo);
        const pergunta = 'Qual é a geometria da molécula ' + F + ' e o valor aproximado do ângulo de ligação?';
        const intro = contexto === 'lewis'
          ? 'A figura mostra a estrutura de Lewis da molécula ' + F + '. '
          : 'Considera a molécula ' + F + ' (' + dadosZ(id) + '). ';
        const dominios = c.ligados + c.pares;
        const resolucao = [
          { passo: 'Contar, no átomo central, as ligações e os pares não ligantes', porque: 'O ' + nomeEl(c.el) + ' (' + c.el + ') está ligado a ' + plural(c.ligados, 'átomo', 'átomos') + ' e tem ' + (c.pares === 0 ? 'nenhum par não ligante' : plural(c.pares, 'par não ligante', 'pares não ligantes')) + ': ' + dominios + ' zonas de eletrões à volta dele (uma ligação dupla conta como uma só zona).' },
          { passo: 'Afastar as zonas de eletrões o mais possível', porque: c.pares === 0
            ? 'Sem pares não ligantes, a geometria é a das ligações: ' + m.geometria + ', com cerca de ' + grau(m.angulo) + '.'
            : 'As ' + dominios + ' zonas afastam-se, mas a geometria só descreve a posição dos átomos: a molécula é ' + m.geometria + '. Os pares não ligantes repelem mais do que os ligantes e fecham o ângulo para cerca de ' + grau(m.angulo) + '.' },
        ];
        const verificacao = { passo: 'Confirmar o ângulo pelas posições dos átomos no espaço', calculo: '\\theta \\approx ' + tex(angulo3d(id), 1) + '^{\\circ}', valor: null };
        const dados = { molecula: id, contexto };
        const base = { resolucao, dados, esquema: { id: 'fqa-geometria', opcoes: { molecula: id } } };
        if (contexto === 'lewis') base.figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'lewis' } };
        const erros = GEO_ERROS[id].map((x) => ({ codigo: x.codigo, texto: geoTexto(x.g, x.a), explicacao: x.explicacao }));
        if (formato === 'escolha') {
          return fecharTexto(rng, Object.assign(base, { enunciado: intro + pergunta, verificacao }), certa, erros, certa);
        }
        const e = escolher(rng, erros);
        const frase = (t) => intro + 'A molécula é ' + t.charAt(0).toLowerCase() + t.slice(1) + '.';
        const v = vfDe(rng, frase(certa), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        return Object.assign(base, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const id = p.dados.molecula;
      const c = central(id);
      const t = geoTexto(GEO_REGRA[c.ligados + '-' + c.pares], angulo3d(id));
      if (p.formato === 'vf') return p.correta === p.enunciado.includes(t.charAt(0).toLowerCase() + t.slice(1) + '.');
      return p.opcoes[p.correta] === t;
    },
    limites(p) {
      return !!GEO_ERROS[p.dados.molecula] && Mol().centrais(p.dados.molecula).length === 1;
    },
  });

  // Polaridade das moléculas.
  const APOLARES = ['CO2', 'CH4', 'BF3', 'Cl2', 'N2', 'O2', 'H2'];
  const POLARES_ERRO = {
    H2O: { codigo: 'achou_a_agua_linear', explicacao: 'A água é angular (cerca de 104,5°), por causa dos 2 pares não ligantes do oxigénio: as ligações O–H, polares, não se anulam e a molécula é polar.' },
    NH3: { codigo: 'ignorou_os_pares_nao_ligantes', explicacao: 'O $\\mathrm{NH_3}$ é piramidal trigonal: o par não ligante do nitrogénio tira-lhe a simetria e as ligações N–H, polares, não se anulam. É polar.' },
    HCl: { codigo: 'diatomica_de_atomos_diferentes_apolar', explicacao: 'No $\\mathrm{HCl}$ há uma só ligação, entre átomos diferentes: é polar e nada a compensa, logo a molécula é polar.' },
    HCN: { codigo: 'linear_logo_apolar', explicacao: 'O $\\mathrm{HCN}$ é linear, mas as pontas são diferentes (H de um lado, N do outro): as ligações polares não se anulam e a molécula é polar.' },
  };
  // Justificações: [ligação, geometria, átomo com pares (apolares) | átomo exterior (polares)].
  const JUSTIF = {
    CO2: { lig: 'C=O', exterior: 'oxigénio' },
    BF3: { lig: 'B–F', exterior: 'flúor' },
    H2O: { lig: 'O–H', exterior: 'hidrogénio', simetrica: 'linear', codigo: 'achou_a_agua_linear' },
    NH3: { lig: 'N–H', exterior: 'hidrogénio', simetrica: 'triangular plana', codigo: 'ignorou_os_pares_nao_ligantes' },
  };
  // Polaridade pela simetria (sem o campo polar do catálogo): diatómica de átomos iguais, ou um átomo central sem pares
  // não ligantes rodeado de átomos todos iguais, é apolar.
  function apolarPelaSimetria(id) {
    const m = mol(id);
    if (m.atomos.length === 2) return m.atomos[0].el === m.atomos[1].el;
    const c = central(id);
    const fora = m.atomos.filter((a, i) => i !== c.i).map((a) => a.el);
    return c.pares === 0 && fora.every((s) => s === fora[0]);
  }

  registar({
    subtema: 'geometria', tipo: 'polaridade', nome: 'Molécula polar ou apolar',
    formatos: ['escolha', 'vf'], contextos: ['apolar', 'justificacao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let id, enunciado, certa, erros, resolucao;
        const descreve = (x) => 'a molécula ' + '$' + formula(x) + '$ é ' + mol(x).geometria;
        if (contexto === 'apolar') {
          id = escolher(rng, formato === 'escolha' ? APOLARES : APOLARES.concat(Object.keys(POLARES_ERRO)));
          const m = mol(id);
          const homo = m.atomos.every((a) => a.el === m.atomos[0].el);
          resolucao = [
            { passo: 'Ver se as ligações são polares', porque: homo ? 'As ligações são entre átomos iguais: são apolares.' : 'As ligações são entre átomos diferentes: são polares.' },
            { passo: 'Ver se a geometria anula as cargas parciais', porque: m.polar
              ? maiuscula(descreve(id)) + ': as cargas parciais não se anulam, por isso é polar.'
              : (homo ? 'Sem ligações polares, a molécula é apolar.' : maiuscula(descreve(id)) + ' e simétrica: as ligações polares anulam-se, por isso é apolar.') },
          ];
          if (formato === 'escolha') {
            const outros = baralhar(rng, Object.keys(POLARES_ERRO)).slice(0, 3);
            erros = outros.map((x) => Object.assign({ texto: '$' + formula(x) + '$' }, POLARES_ERRO[x]));
            enunciado = 'Qual destas moléculas é apolar?';
            certa = '$' + m.formula + '$';
            return fecharTexto(rng, {
              enunciado, resolucao, dados: { molecula: id, contexto, opcoes: [id].concat(outros) },
              verificacao: { passo: 'Confirmar pela simetria', calculo: '\\text{' + m.geometria + '}', valor: null },
              esquema: id === 'H2' || id === 'N2' || id === 'O2' || id === 'Cl2' ? { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'lewis' } } : { id: 'fqa-geometria', opcoes: { molecula: id } },
            }, certa, erros, certa);
          }
          const frase = (polar) => 'A molécula de ' + m.nome + ', $' + m.formula + '$, é ' + (polar ? 'polar' : 'apolar') + '.';
          const erro = m.polar ? POLARES_ERRO[id]
            : homo ? { codigo: 'achou_polar_uma_molecula_de_atomos_iguais', explicacao: 'A molécula $' + m.formula + '$ tem dois átomos iguais: os eletrões partilhados ficam igualmente distribuídos, não há cargas parciais e a molécula é apolar.' }
              : { codigo: 'ligacoes_polares_logo_molecula_polar', explicacao: 'As ligações do $' + m.formula + '$ são polares, mas a molécula é ' + m.geometria + ' e simétrica: as cargas parciais anulam-se e a molécula é apolar.' };
          const v = vfDe(rng, frase(m.polar), frase(!m.polar), erro);
          return Object.assign({ resolucao, dados: { molecula: id, contexto, afirmaPolar: v.correta ? m.polar : !m.polar } }, v, {
            verificacao: { passo: 'Confirmar pela simetria', calculo: '\\text{' + m.geometria + '}', valor: v.correta },
          });
        }
        id = escolher(rng, Object.keys(JUSTIF));
        const m = mol(id);
        const j = JUSTIF[id];
        const L = '$\\mathrm{' + j.lig.replace('–', '{-}').replace('=', '{=}') + '}$';
        if (!m.polar) {
          certa = 'É apolar: as ligações ' + L + ' são polares, mas a molécula é ' + m.geometria + ' e simétrica, por isso as cargas parciais anulam-se.';
          erros = [
            { codigo: 'ligacoes_polares_logo_molecula_polar', texto: 'É polar, porque as ligações ' + L + ' são polares.', explicacao: 'Ter ligações polares não chega: no $' + m.formula + '$ (' + m.geometria + ') as ligações estão dispostas simetricamente e as cargas parciais anulam-se. A molécula é apolar.' },
            { codigo: 'achou_apolares_as_ligacoes', texto: 'É apolar, porque as ligações ' + L + ' são apolares.', explicacao: 'A conclusão está certa, mas a razão não: as ligações ' + L + ' são entre átomos diferentes, logo são polares. A molécula é apolar porque a geometria ' + m.geometria + ' anula as cargas parciais.' },
            { codigo: 'pares_nao_ligantes_logo_polar', texto: 'É polar, porque os átomos de ' + j.exterior + ' têm pares não ligantes.', explicacao: 'Os pares não ligantes dos átomos das pontas não tornam a molécula polar. O que conta é se as cargas parciais das ligações se anulam: na geometria ' + m.geometria + ' anulam-se.' },
          ];
        } else {
          certa = 'É polar: as ligações ' + L + ' são polares e, como a molécula é ' + m.geometria + ', as cargas parciais não se anulam.';
          erros = [
            { codigo: j.codigo, texto: 'É apolar, porque é ' + j.simetrica + ' e as cargas parciais anulam-se.', explicacao: 'A molécula não é ' + j.simetrica + ': os pares não ligantes do átomo central tornam-na ' + m.geometria + ', e as cargas parciais não se anulam. É polar.' },
            { codigo: 'atomos_iguais_logo_apolar', texto: 'É apolar, porque os átomos de ' + j.exterior + ' são todos iguais.', explicacao: 'Ter átomos exteriores iguais só torna a molécula apolar se a geometria for simétrica. A molécula é ' + m.geometria + ': as cargas parciais não se anulam.' },
            { codigo: 'ligacoes_polares_logo_molecula_polar', texto: 'É polar, porque todas as moléculas com ligações polares são polares.', explicacao: 'A conclusão está certa, mas a razão não: o $\\mathrm{CO_2}$ tem ligações polares e é apolar. Esta molécula é polar porque, sendo ' + m.geometria + ', as cargas parciais não se anulam.' },
          ];
        }
        enunciado = 'A molécula $' + m.formula + '$ é ' + m.geometria + '. Qual é a afirmação correta sobre a sua polaridade?';
        resolucao = [
          { passo: 'Ver se as ligações são polares', porque: 'As ligações ' + L + ' são entre átomos diferentes: são polares.' },
          { passo: 'Ver se a geometria anula as cargas parciais', porque: m.polar ? 'Na geometria ' + m.geometria + ' as cargas parciais não se anulam: a molécula é polar.' : 'Na geometria ' + m.geometria + ', simétrica, as cargas parciais anulam-se: a molécula é apolar.' },
        ];
        const dados = { molecula: id, contexto };
        const verificacao = { passo: 'Confirmar pela simetria à volta do átomo central', calculo: '\\text{pares não ligantes no átomo central: } ' + central(id).pares, valor: null };
        const esquema = { id: 'fqa-geometria', opcoes: { molecula: id } };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado, resolucao, dados, verificacao, esquema }, certa, erros, certa);
        // Sem a afirmação «é linear…» numa frase que já diz a geometria (contradição) e sem as de conclusão certa.
        const e = escolher(rng, erros.filter((x) => !/A conclusão está certa/.test(x.explicacao) && x.codigo !== j.codigo));
        const inicio = 'A molécula $' + m.formula + '$, que é ' + m.geometria + ', ';
        const v = vfDe(rng, inicio + certa.replace(/^É (a?polar): /, 'é $1, já que '), inicio + e.texto.charAt(0).toLowerCase() + e.texto.slice(1), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmaPolar = /, é polar/.test(v.enunciado);
        return Object.assign({ resolucao, dados, esquema }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const id = p.dados.molecula;
      const apolar = apolarPelaSimetria(id);
      if (p.formato === 'vf') {
        if (p.dados.contexto === 'apolar') return p.correta === (p.dados.afirmaPolar === !apolar);
        // Justificação: a certa diz a polaridade certa e que as cargas parciais (não) se anulam por causa da geometria.
        const ok = p.dados.afirmaPolar === !apolar && /já que/.test(p.enunciado) && !/porque/.test(p.enunciado);
        return p.correta === ok;
      }
      if (p.dados.contexto === 'apolar') {
        const marcadas = p.dados.opcoes.filter((x) => apolarPelaSimetria(x));
        return marcadas.length === 1 && p.opcoes[p.correta] === '$' + formula(marcadas[0]) + '$';
      }
      const t = p.opcoes[p.correta];
      return t.startsWith(apolar ? 'É apolar:' : 'É polar:') && p.opcoes.filter((o) => /^É (a)?polar:/.test(o)).length === 1;
    },
    limites(p) {
      return !!mol(p.dados.molecula);
    },
  });

  // Interações intermoleculares.
  const INTERMOL = {
    H2O: 'hidrogenio', NH3: 'hidrogenio', HF: 'hidrogenio', CH3OH: 'hidrogenio', C2H5OH: 'hidrogenio', CH3COOH: 'hidrogenio', CH3NH2: 'hidrogenio',
    HCl: 'dipolo', HCN: 'dipolo', CH3CHO: 'dipolo', CH3COCH3: 'dipolo',
    CH4: 'dispersao', CO2: 'dispersao', Cl2: 'dispersao', N2: 'dispersao', O2: 'dispersao', C2H6: 'dispersao', C3H8: 'dispersao', BF3: 'dispersao',
  };
  const TXT_INTERMOL = {
    hidrogenio: 'Dispersão de London, dipolo–dipolo e ligações de hidrogénio',
    dipolo: 'Dispersão de London e dipolo–dipolo',
    dispersao: 'Só dispersão de London',
    covalente: 'Ligações covalentes entre as moléculas',
  };
  // Pela estrutura: H ligado a N, O ou F → ligações de hidrogénio; senão, polar pela simetria → dipolo–dipolo.
  function intermolPelaEstrutura(id) {
    const m = mol(id);
    const hNOF = m.ligacoes.some(([i, j]) => {
      const a = m.atomos[i].el;
      const b = m.atomos[j].el;
      return (a === 'H' && ['N', 'O', 'F'].includes(b)) || (b === 'H' && ['N', 'O', 'F'].includes(a));
    });
    if (hNOF) return 'hidrogenio';
    if (m.atomos.length <= 3 || Mol().centrais(id).length === 1) return apolarPelaSimetria(id) ? 'dispersao' : 'dipolo';
    return m.polar ? 'dipolo' : 'dispersao';
  }
  // Pares para comparar pontos de ebulição: [mais alto, mais baixo].
  const PARES_EBULICAO = [['H2O', 'CH4'], ['NH3', 'CH4'], ['CH3OH', 'C2H6'], ['C2H5OH', 'C3H8'], ['C4H10', 'CH4'], ['C3H8', 'CH4'], ['C4H10', 'C2H6'], ['C3H8', 'C2H6'], ['C2H6', 'CH4']];
  const eletroesDe = (id) => soma(mol(id).atomos.map((a) => el(a.el).z));
  const nAtomos = (id) => mol(id).atomos.length;

  registar({
    subtema: 'geometria', tipo: 'intermoleculares', nome: 'Interações intermoleculares e ponto de ebulição',
    formatos: ['escolha', 'vf'], contextos: ['tipo', 'comparar'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        if (contexto === 'tipo') {
          const id = escolher(rng, Object.keys(INTERMOL));
          const m = mol(id);
          const t = INTERMOL[id];
          const F = '$' + m.formula + '$';
          const temH = m.atomos.some((a) => a.el === 'H');
          const hCom = m.ligacoes.map(([i, j]) => [m.atomos[i].el, m.atomos[j].el]).filter((x) => x.includes('H')).map((x) => (x[0] === 'H' ? x[1] : x[0]));
          const E = {
            esqueceu_a_ligacao_de_hidrogenio: 'Faltam as ligações de hidrogénio: no ' + F + ' há H ligado a ' + (hCom.find((s) => ['N', 'O', 'F'].includes(s)) || '') + ', e esse H atrai um par não ligante de uma molécula vizinha.',
            tomou_uma_molecula_polar_por_apolar: 'Só há dispersão de London entre moléculas apolares. O ' + F + ' é polar, por isso há também interações dipolo–dipolo' + (t === 'hidrogenio' ? ' e ligações de hidrogénio.' : '.'),
            confundiu_intramolecular_com_intermolecular: 'As ligações covalentes estão dentro de cada molécula (são intramoleculares). Entre moléculas há interações muito mais fracas.',
            ligacao_de_hidrogenio_com_h_ligado_a_c: 'A ligação de hidrogénio exige H ligado a N, O ou F. No ' + F + ' os átomos de hidrogénio estão ligados ao carbono, por isso não há ligações de hidrogénio.',
            ligacao_de_hidrogenio_com_h_ligado_a_cl: 'A ligação de hidrogénio exige H ligado a N, O ou F. No $\\mathrm{HCl}$ o hidrogénio está ligado ao cloro, por isso não há ligações de hidrogénio.',
            molecula_apolar_com_dipolo_dipolo: 'As interações dipolo–dipolo exigem moléculas polares. O ' + F + ' é apolar (' + (m.geometria ? m.geometria + ' e simétrica' : 'hidrocarboneto') + '), por isso só há dispersão de London.',
            ligacao_de_hidrogenio_sem_h: 'Não há hidrogénio no ' + F + '; a ligação de hidrogénio exige H ligado a N, O ou F.',
          };
          const codigos = {
            hidrogenio: [['dipolo', 'esqueceu_a_ligacao_de_hidrogenio'], ['dispersao', 'tomou_uma_molecula_polar_por_apolar'], ['covalente', 'confundiu_intramolecular_com_intermolecular']],
            dipolo: [['hidrogenio', id === 'HCl' ? 'ligacao_de_hidrogenio_com_h_ligado_a_cl' : 'ligacao_de_hidrogenio_com_h_ligado_a_c'], ['dispersao', 'tomou_uma_molecula_polar_por_apolar'], ['covalente', 'confundiu_intramolecular_com_intermolecular']],
            dispersao: [['dipolo', 'molecula_apolar_com_dipolo_dipolo'], ['hidrogenio', temH ? 'ligacao_de_hidrogenio_com_h_ligado_a_c' : 'ligacao_de_hidrogenio_sem_h'], ['covalente', 'confundiu_intramolecular_com_intermolecular']],
          }[t];
          const erros = codigos.map(([x, codigo]) => ({ codigo, texto: TXT_INTERMOL[x], explicacao: E[codigo] }));
          const resolucao = [
            { passo: 'Há sempre dispersão de London', porque: 'Existe entre quaisquer moléculas; entre moléculas apolares é a única.' },
            { passo: 'Ver se a molécula é polar', porque: t === 'dispersao' ? 'O ' + F + ' é apolar: não há dipolo–dipolo.' : 'O ' + F + ' é polar: há também interações dipolo–dipolo.' },
            { passo: 'Procurar H ligado a N, O ou F', porque: t === 'hidrogenio' ? 'No ' + F + ' há H ligado a ' + hCom.find((s) => ['N', 'O', 'F'].includes(s)) + ': há ligações de hidrogénio entre as moléculas.' : (temH ? 'Os átomos de H do ' + F + ' não estão ligados a N, O nem F: não há ligações de hidrogénio.' : 'Não há H no ' + F + ': não há ligações de hidrogénio.') },
          ];
          const dados = { molecula: id, contexto };
          const verificacao = { passo: 'Confirmar na estrutura da molécula', calculo: '\\text{H ligado a N, O ou F: ' + (t === 'hidrogenio' ? 'sim' : 'não') + '}', valor: null };
          const esquema = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'lewis' } };
          const enunciado = 'Que interações intermoleculares existem entre as moléculas de ' + m.nome + ', ' + F + '?';
          if (formato === 'escolha') return fecharTexto(rng, { enunciado, resolucao, dados, verificacao, esquema }, TXT_INTERMOL[t], erros, TXT_INTERMOL[t]);
          const e = escolher(rng, erros.filter((x) => x.codigo !== 'confundiu_intramolecular_com_intermolecular'));
          const frase = (x) => 'Entre as moléculas de ' + m.nome + ', ' + F + ', há ' + x.charAt(0).toLowerCase() + x.slice(1) + '.';
          const v = vfDe(rng, frase(TXT_INTERMOL[t]), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
          dados.afirmado = v.correta ? t : Object.keys(TXT_INTERMOL).find((k) => TXT_INTERMOL[k] === e.texto);
          return Object.assign({ resolucao, dados, esquema }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
        }
        const [x, y] = escolher(rng, PARES_EBULICAO);
        const [a, b] = baralhar(rng, [x, y]);
        const mx = mol(x);
        const my = mol(y);
        const Fx = '$' + mx.formula + '$';
        const Fy = '$' + my.formula + '$';
        const hb = INTERMOL[x] === 'hidrogenio';
        const nomeF = (i) => mol(i).nome + ' (' + '$' + formula(i) + '$)';
        const enunciado = 'Qual destas substâncias tem o ponto de ebulição mais elevado, ' + nomeF(a) + ' ou ' + nomeF(b) + '? Escolhe a resposta com a justificação correta.';
        let certa, erros;
        if (hb) {
          const ligXH = mx.ligacoes.map(([i, j]) => [mx.atomos[i].el, mx.atomos[j].el]).find((p) => p.includes('H') && (p.includes('O') || p.includes('N')));
          const L = '$\\mathrm{' + (ligXH[0] === 'H' ? ligXH[1] : ligXH[0]) + '{-}H}$';
          certa = maiuscula(mx.nome) + ': entre as suas moléculas há ligações de hidrogénio, mais fortes do que as forças de dispersão de London entre as moléculas de ' + my.nome + '.';
          erros = [
            { codigo: 'contou_os_atomos_em_vez_das_interacoes', texto: maiuscula(my.nome) + ': as suas moléculas têm mais átomos.', explicacao: 'O ' + Fy + ' tem mais átomos (' + nAtomos(y) + ' contra ' + nAtomos(x) + '), mas o ponto de ebulição depende das interações entre moléculas: no ' + Fx + ' há ligações de hidrogénio, que são mais fortes.' },
            { codigo: 'confundiu_intramolecular_com_intermolecular', texto: maiuscula(mx.nome) + ': as ligações covalentes ' + L + ' são mais fortes do que as ligações covalentes $\\mathrm{C{-}H}$.', explicacao: 'Na ebulição não se quebram ligações covalentes: as moléculas só se afastam umas das outras. O que conta são as interações intermoleculares (aqui, as ligações de hidrogénio).' },
            { codigo: 'achou_a_dispersao_mais_forte', texto: maiuscula(my.nome) + ': as forças de dispersão de London são as interações intermoleculares mais fortes.', explicacao: 'Para moléculas de tamanho parecido, as ligações de hidrogénio são as interações intermoleculares mais fortes; a dispersão de London é a mais fraca. Por isso o ' + Fx + ' ferve a temperatura mais alta.' },
          ];
        } else {
          certa = maiuscula(mx.nome) + ': as suas moléculas são maiores (têm mais eletrões), por isso as forças de dispersão de London são mais intensas.';
          erros = [
            { codigo: 'achou_que_moleculas_menores_se_atraem_mais', texto: maiuscula(my.nome) + ': as suas moléculas, mais pequenas, aproximam-se mais e atraem-se mais.', explicacao: 'As duas são apolares e só têm dispersão de London, que aumenta com o tamanho da molécula (número de eletrões): ' + eletroesDe(x) + ' eletrões no ' + Fx + ' contra ' + eletroesDe(y) + ' no ' + Fy + '.' },
            { codigo: 'confundiu_intramolecular_com_intermolecular', texto: maiuscula(mx.nome) + ': tem mais ligações covalentes $\\mathrm{C{-}H}$ para quebrar.', explicacao: 'Na ebulição não se quebram ligações covalentes: as moléculas só se afastam umas das outras. O que conta é a intensidade da dispersão de London, maior nas moléculas maiores.' },
            { codigo: 'apolares_com_o_mesmo_ponto_de_ebulicao', texto: 'Têm o mesmo ponto de ebulição, porque ambas são apolares.', explicacao: 'Ser apolar não dá o mesmo ponto de ebulição: a dispersão de London aumenta com o tamanho da molécula, por isso o ' + Fx + ', maior, ferve a temperatura mais alta.' },
          ];
        }
        const resolucao = [
          { passo: 'Comparar as interações intermoleculares', porque: hb
            ? 'No ' + Fx + ' há H ligado a ' + (INTERMOL[x] === 'hidrogenio' ? (mx.atomos.some((q) => q.el === 'O') ? 'O' : 'N') : '') + ': ligações de hidrogénio. O ' + Fy + ' é apolar: só dispersão de London.'
            : 'As duas são apolares: só têm dispersão de London, que é mais intensa nas moléculas maiores (' + eletroesDe(x) + ' eletrões no ' + Fx + ', ' + eletroesDe(y) + ' no ' + Fy + ').' },
          { passo: 'Interações mais fortes, ponto de ebulição mais alto', porque: 'Para ferver é preciso afastar as moléculas umas das outras: quanto mais fortes as interações entre elas, mais energia é preciso e mais alto é o ponto de ebulição. O ' + Fx + ' ferve a temperatura mais alta.' },
        ];
        const dados = { x, y, contexto, primeiro: a };
        const verificacao = { passo: 'Confirmar pela força das interações e pelo número de eletrões', calculo: '\\text{' + mx.nome + ': ' + eletroesDe(x) + ' eletrões;\\ ' + my.nome + ': ' + eletroesDe(y) + ' eletrões}', valor: null };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado, resolucao, dados, verificacao }, certa, erros, certa);
        const frase = (p, q) => 'O ponto de ebulição d' + artigo(mol(p).nome) + ' ' + nomeF(p) + ' é mais elevado do que o d' + artigo(mol(q).nome) + ' ' + nomeF(q) + '.';
        const erro = erros[0];
        const v = vfDe(rng, frase(x, y), frase(y, x), { codigo: erro.codigo, explicacao: erro.explicacao });
        dados.afirmadoMaior = v.correta ? x : y;
        return Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      if (p.dados.contexto === 'tipo') {
        const t = intermolPelaEstrutura(p.dados.molecula);
        if (p.formato === 'vf') return p.correta === (p.dados.afirmado === t);
        return p.opcoes[p.correta] === TXT_INTERMOL[t];
      }
      // Força das interações (ligação de hidrogénio > dipolo > só dispersão) e, em empate, mais eletrões.
      const forca = (i) => ({ hidrogenio: 2, dipolo: 1, dispersao: 0 })[intermolPelaEstrutura(i)] * 1000 + eletroesDe(i);
      const maior = forca(p.dados.x) > forca(p.dados.y) ? p.dados.x : p.dados.y;
      if (p.formato === 'vf') return p.correta === (p.dados.afirmadoMaior === maior);
      return p.opcoes[p.correta].startsWith(maiuscula(mol(maior).nome) + ':') && /há ligações de hidrogénio, mais fortes|London são mais intensas/.test(p.opcoes[p.correta]);
    },
    limites(p) {
      return p.dados.contexto === 'tipo' ? !!INTERMOL[p.dados.molecula] : PARES_EBULICAO.some(([a, b]) => a === p.dados.x && b === p.dados.y);
    },
  });

  // ================================================================ carbono
  const PREFIXO = { 1: 'met', 2: 'et', 3: 'prop', 4: 'but' };
  const FAMILIA = {
    alcano: { term: 'ano', h: (n) => 2 * n + 2, nome: 'alcano', geral: 'C_nH_{2n+2}', lig: 'só ligações simples entre átomos de carbono' },
    alceno: { term: 'eno', h: (n) => 2 * n, nome: 'alceno', geral: 'C_nH_{2n}', lig: 'uma ligação dupla entre átomos de carbono' },
    alcino: { term: 'ino', h: (n) => 2 * n - 2, nome: 'alcino', geral: 'C_nH_{2n-2}', lig: 'uma ligação tripla entre átomos de carbono' },
  };
  const formulaHC = (n, h) => '\\mathrm{' + (n === 1 ? 'C' : 'C_' + n) + 'H_{' + h + '}}';
  const nomeHC = (n, fam) => PREFIXO[n] + FAMILIA[fam].term;
  // Hidrocarbonetos de cadeia aberta com nome sem número de posição (alcenos e alcinos só com 2 ou 3 carbonos).
  const HCS = [[1, 'alcano'], [2, 'alcano'], [3, 'alcano'], [4, 'alcano'], [2, 'alceno'], [3, 'alceno'], [2, 'alcino'], [3, 'alcino']];
  // Hidrocarbonetos do catálogo (fórmula de estrutura desenhada).
  const HC_CATALOGO = { CH4: [1, 'alcano'], C2H6: [2, 'alcano'], C3H8: [3, 'alcano'], C4H10: [4, 'alcano'], C2H4: [2, 'alceno'], C3H6: [3, 'alceno'], C2H2: [2, 'alcino'] };
  const TXT_FAM = {
    alcano: 'Alcano: saturado, só com ligações simples entre carbonos',
    alceno: 'Alceno: insaturado, com uma ligação dupla entre carbonos',
    alcino: 'Alcino: insaturado, com uma ligação tripla entre carbonos',
  };
  const TXT_FAM_SAT = {
    alceno: 'Alceno: saturado, com uma ligação dupla entre carbonos',
    alcino: 'Alcino: saturado, com uma ligação tripla entre carbonos',
  };
  // Hidrogénios contados átomo a átomo: cada C faz 4 ligações; a cadeia de n carbonos usa 2(n − 1) e cada ligação
  // múltipla gasta mais 2 (dupla) ou 4 (tripla) posições.
  const hPelasValencias = (n, fam) => 4 * n - 2 * (n - 1) - (fam === 'alceno' ? 2 : fam === 'alcino' ? 4 : 0);
  // Família pelo número de hidrogénios: insaturações = (2n + 2 − h)/2.
  const famDeH = (n, h) => ['alcano', 'alceno', 'alcino'][(2 * n + 2 - h) / 2];

  registar({
    subtema: 'carbono', tipo: 'hidrocarboneto', nome: 'Hidrocarbonetos saturados e insaturados',
    formatos: ['escolha', 'vf'], contextos: ['formula', 'estrutura'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let n, fam, id = null;
        if (contexto === 'estrutura') {
          id = escolher(rng, Object.keys(HC_CATALOGO));
          [n, fam] = HC_CATALOGO[id];
        } else {
          [n, fam] = escolher(rng, HCS);
        }
        // Com um só carbono não há alcenos nem alcinos: os distratores não existiriam (CH₂, CH₀).
        if (n === 1) return null;
        const h = FAMILIA[fam].h(n);
        const F = '$' + formulaHC(n, h) + '$';
        const enunciado = contexto === 'estrutura'
          ? 'A figura mostra a fórmula de estrutura de um hidrocarboneto. Como se classifica?'
          : 'Como se classifica o hidrocarboneto de cadeia aberta ' + F + '?';
        const resolucao = contexto === 'estrutura'
          ? [
            { passo: 'Observar as ligações entre átomos de carbono', porque: n === 1 ? 'Só há um carbono, ligado a 4 hidrogénios por ligações simples.' : 'Entre os carbonos há ' + FAMILIA[fam].lig + '.' },
            { passo: 'Classificar', porque: fam === 'alcano' ? 'Só ligações simples: é um alcano, saturado.' : 'Uma ligação ' + (fam === 'alceno' ? 'dupla' : 'tripla') + ' entre carbonos torna o hidrocarboneto insaturado: é um ' + FAMILIA[fam].nome + '.' },
          ]
          : [
            { passo: 'Comparar com as fórmulas gerais', porque: 'Com $n = ' + n + '$ carbonos: um alcano teria $2 \\times ' + n + ' + 2 = ' + (2 * n + 2) + '$ hidrogénios, um alceno $2 \\times ' + n + ' = ' + 2 * n + '$ e um alcino $2 \\times ' + n + ' - 2 = ' + (2 * n - 2) + '$.' },
            { passo: 'Classificar', porque: 'Tem ' + h + ' hidrogénios: é um ' + FAMILIA[fam].nome + ', com ' + FAMILIA[fam].lig + (fam === 'alcano' ? ' (saturado).' : ' (insaturado).') },
          ];
        const E = {
          usou_a_formula_do_alcano: 'Um alcano com ' + n + ' carbonos teria ' + (2 * n + 2) + ' hidrogénios ($' + formulaHC(n, 2 * n + 2) + '$). Este tem ' + h + ': é um ' + FAMILIA[fam].nome + ', insaturado.',
          usou_a_formula_do_alceno: 'Um alceno com ' + n + ' carbonos teria ' + 2 * n + ' hidrogénios ($' + formulaHC(n, 2 * n) + '$). Este tem ' + h + ': é um ' + FAMILIA[fam].nome + '.',
          usou_a_formula_do_alcino: 'Um alcino com ' + n + ' carbonos teria ' + (2 * n - 2) + ' hidrogénios ($' + formulaHC(n, 2 * n - 2) + '$). Este tem ' + h + ': é um ' + FAMILIA[fam].nome + '.',
          confundiu_saturado_com_insaturado: '«Saturado» quer dizer só com ligações simples (o máximo de hidrogénios). Uma ligação ' + (fam === 'alcino' ? 'tripla' : 'dupla') + ' entre carbonos torna o hidrocarboneto insaturado.',
        };
        if (contexto === 'estrutura') {
          E.usou_a_formula_do_alcano = 'Na fórmula de estrutura há ' + FAMILIA[fam].lig + ': não é um alcano (só simples), é um ' + FAMILIA[fam].nome + ', insaturado.';
          E.usou_a_formula_do_alceno = 'Um alceno tem uma ligação dupla entre carbonos. Na figura há ' + FAMILIA[fam].lig + ': é um ' + FAMILIA[fam].nome + '.';
          E.usou_a_formula_do_alcino = 'Um alcino tem uma ligação tripla entre carbonos. Na figura há ' + FAMILIA[fam].lig + ': é um ' + FAMILIA[fam].nome + '.';
        }
        const outras = ['alcano', 'alceno', 'alcino'].filter((x) => x !== fam);
        const cod = { alcano: 'usou_a_formula_do_alcano', alceno: 'usou_a_formula_do_alceno', alcino: 'usou_a_formula_do_alcino' };
        const erros = outras.map((x) => ({ codigo: cod[x], texto: TXT_FAM[x], explicacao: E[cod[x]] }));
        const famSat = fam === 'alcano' ? (rng() < 0.5 ? 'alceno' : 'alcino') : fam;
        erros.push({ codigo: 'confundiu_saturado_com_insaturado', texto: TXT_FAM_SAT[famSat], explicacao: E.confundiu_saturado_com_insaturado.replace(fam === 'alcino' ? 'tripla' : 'dupla', famSat === 'alcino' ? 'tripla' : 'dupla') });
        const dados = { n, fam, contexto, molecula: id };
        const verificacao = { passo: 'Contar os hidrogénios pelas valências do carbono', calculo: '4 \\times ' + n + ' - 2 \\times ' + (n - 1) + (fam === 'alcano' ? '' : ' - ' + (fam === 'alceno' ? 2 : 4)) + ' = ' + hPelasValencias(n, fam), valor: null };
        const ex = { enunciado, resolucao, dados, verificacao, esquema: id ? { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } } : undefined };
        if (!id) delete ex.esquema;
        if (id) ex.figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } };
        if (formato === 'escolha') return fecharTexto(rng, ex, TXT_FAM[fam], erros, TXT_FAM[fam]);
        const e = escolher(rng, erros.filter((x) => n > 1 || x.codigo !== 'confundiu_saturado_com_insaturado'));
        const frase = (t) => (id ? 'O hidrocarboneto representado na figura é um ' : 'O hidrocarboneto ' + F + ' é um ') + t.charAt(0).toLowerCase() + t.slice(1).replace(':', ',') + '.';
        const v = vfDe(rng, frase(TXT_FAM[fam]), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmado = v.correta ? TXT_FAM[fam] : e.texto;
        delete ex.enunciado;
        return Object.assign(ex, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const { n, contexto, molecula } = p.dados;
      let fam;
      if (contexto === 'estrutura') {
        const m = mol(molecula);
        const ordens = m.ligacoes.filter(([i, j]) => m.atomos[i].el === 'C' && m.atomos[j].el === 'C').map((l) => l[2]);
        fam = ordens.includes(3) ? 'alcino' : ordens.includes(2) ? 'alceno' : 'alcano';
      } else {
        fam = famDeH(n, hPelasValencias(n, p.dados.fam));
      }
      if (p.formato === 'vf') return p.correta === (p.dados.afirmado === TXT_FAM[fam]);
      return p.opcoes[p.correta] === TXT_FAM[fam];
    },
    limites(p) {
      return p.dados.n >= 2 && p.dados.n <= 4 && !!FAMILIA[p.dados.fam];
    },
  });

  // Grupos funcionais (moléculas do catálogo com grupoFuncional).
  const NOME_GRUPO = { alcool: 'Álcool', aldeido: 'Aldeído', cetona: 'Cetona', acido: 'Ácido carboxílico', amina: 'Amina' };
  // Fórmula condensada (como nos manuais), sem revelar o nome.
  const CONDENSADA = { CH3OH: 'CH_3OH', C2H5OH: 'CH_3CH_2OH', CH3CHO: 'CH_3CHO', CH3COCH3: 'CH_3COCH_3', CH3COOH: 'CH_3COOH', CH3NH2: 'CH_3NH_2' };
  const GRUPO_ERROS = {
    alcool: [
      { codigo: 'acido_por_ter_oh', texto: 'Ácido carboxílico', explicacao: 'O ácido carboxílico tem C=O e −OH no mesmo carbono (−COOH). Aqui há só −OH ligado a um carbono com ligações simples: é um álcool.' },
      { codigo: 'confundiu_hidroxilo_com_hidroxido', texto: 'Hidróxido (base)', explicacao: 'O −OH de um álcool está ligado covalentemente ao carbono: não é o ião hidróxido, $\\mathrm{OH^-}$, das bases. É um álcool.' },
      { codigo: 'confundiu_alcool_com_aldeido', texto: 'Aldeído', explicacao: 'O aldeído tem C=O na ponta da cadeia (−CHO). Aqui o oxigénio está ligado a um H por uma ligação simples (−OH): é um álcool (terminação -ol, não -al).' },
    ],
    aldeido: [
      { codigo: 'confundiu_aldeido_com_cetona', texto: 'Cetona', explicacao: 'Na cetona o C=O está entre dois carbonos. Aqui está na ponta da cadeia, com o carbono ligado a um H (−CHO): é um aldeído.' },
      { codigo: 'acido_sem_oh', texto: 'Ácido carboxílico', explicacao: 'O ácido carboxílico tem C=O e −OH no mesmo carbono (−COOH). Aqui não há −OH: é um aldeído.' },
      { codigo: 'alcool_por_ter_oxigenio', texto: 'Álcool', explicacao: 'O álcool tem −OH (oxigénio ligado a H). Aqui o oxigénio está em dupla com o carbono, sem H: é um aldeído.' },
    ],
    cetona: [
      { codigo: 'confundiu_aldeido_com_cetona', texto: 'Aldeído', explicacao: 'No aldeído o C=O está na ponta da cadeia, com o carbono ligado a um H (−CHO). Aqui está entre dois carbonos: é uma cetona.' },
      { codigo: 'acido_sem_oh', texto: 'Ácido carboxílico', explicacao: 'O ácido carboxílico tem C=O e −OH no mesmo carbono (−COOH). Aqui não há −OH: é uma cetona.' },
      { codigo: 'alcool_por_ter_oxigenio', texto: 'Álcool', explicacao: 'O álcool tem −OH (oxigénio ligado a H). Aqui o oxigénio está em dupla com o carbono, sem H: é uma cetona.' },
    ],
    acido: [
      { codigo: 'viu_so_o_hidroxilo', texto: 'Álcool', explicacao: 'Há um −OH, mas o mesmo carbono tem também um C=O: o conjunto −COOH é o grupo carboxilo de um ácido carboxílico.' },
      { codigo: 'viu_so_o_carbonilo', texto: 'Aldeído', explicacao: 'Há um C=O na ponta da cadeia, mas o mesmo carbono tem também um −OH (não um H): o conjunto −COOH é o grupo carboxilo.' },
      { codigo: 'separou_o_carboxilo_em_dois_grupos', texto: 'Álcool e cetona', explicacao: 'O C=O e o −OH estão no mesmo carbono: juntos formam um só grupo, o carboxilo (−COOH), de um ácido carboxílico.' },
    ],
    amina: [
      { codigo: 'confundiu_amino_com_hidroxilo', texto: 'Álcool', explicacao: 'O grupo é −NH₂ (nitrogénio ligado a um carbono), não −OH: é uma amina.' },
    ],
  };
  const MOL_GRUPO = ['CH3OH', 'C2H5OH', 'CH3CHO', 'CH3COCH3', 'CH3COOH', 'CH3NH2'];
  // Grupo funcional pela estrutura: O em dupla com C (carbonilo), O ligado a H (hidroxilo), N ligado a C.
  function grupoPelaEstrutura(id) {
    const m = mol(id);
    const lig = m.ligacoes.map(([i, j, o]) => [m.atomos[i].el, m.atomos[j].el, o, i, j]);
    const co2 = lig.find((l) => l[2] === 2 && l.includes('O') && l.includes('C'));
    const oh = lig.some((l) => l.slice(0, 2).includes('O') && l.slice(0, 2).includes('H'));
    if (lig.some((l) => l.slice(0, 2).includes('N'))) return 'amina';
    if (!co2) return oh ? 'alcool' : null;
    if (oh) return 'acido';
    const c = m.atomos[co2[3]].el === 'C' ? co2[3] : co2[4];
    const vizC = lig.filter((l) => (l[3] === c || l[4] === c)).map((l) => m.atomos[l[3] === c ? l[4] : l[3]].el).filter((x) => x === 'C').length;
    return vizC >= 2 ? 'cetona' : 'aldeido';
  }

  registar({
    subtema: 'carbono', tipo: 'grupo-funcional', nome: 'Grupo funcional a partir da fórmula de estrutura',
    formatos: ['escolha', 'vf'], contextos: ['estrutura', 'condensada'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const id = escolher(rng, formato === 'escolha' ? MOL_GRUPO.filter((x) => mol(x).grupoFuncional !== 'amina') : MOL_GRUPO);
        const m = mol(id);
        const g = m.grupoFuncional;
        const quem = contexto === 'estrutura' ? 'a molécula representada na figura' : 'o composto de fórmula $\\mathrm{' + CONDENSADA[id] + '}$';
        const enunciado = 'A que família de compostos pertence ' + quem + '?';
        const DESC = {
          alcool: 'Há um grupo −OH (hidroxilo) ligado a um carbono que só faz ligações simples.',
          aldeido: 'Há um C=O na ponta da cadeia, com o carbono ligado a um H (grupo −CHO).',
          cetona: 'Há um C=O (carbonilo) entre dois átomos de carbono.',
          acido: 'Há um C=O e um −OH no mesmo carbono: o grupo carboxilo, −COOH.',
          amina: 'Há um grupo −NH₂ (amino): nitrogénio ligado a um carbono.',
        };
        const resolucao = [
          { passo: 'Procurar o grupo funcional', porque: DESC[g] },
          { passo: 'Identificar a família', porque: 'É ' + (g === 'cetona' || g === 'amina' ? 'uma ' : 'um ') + NOME_GRUPO[g].toLowerCase() + ': o composto é ' + artigo(m.nome) + ' ' + m.nome + ', $' + m.formula + '$.' },
        ];
        const dados = { molecula: id, contexto };
        const verificacao = { passo: 'Confirmar pelo nome do composto (terminação)', calculo: '\\text{' + m.nome + '}', valor: null };
        const ex = { enunciado, resolucao, dados, verificacao, esquema: { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } } };
        if (contexto === 'estrutura') ex.figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } };
        if (formato === 'escolha') return fecharTexto(rng, ex, NOME_GRUPO[g], GRUPO_ERROS[g], NOME_GRUPO[g]);
        const e = escolher(rng, GRUPO_ERROS[g].filter((x) => x.codigo !== 'separou_o_carboxilo_em_dois_grupos' && x.codigo !== 'confundiu_hidroxilo_com_hidroxido'));
        const art = (t) => (/^(Cetona|Amina)$/.test(t) ? 'uma ' : 'um ') + t.toLowerCase();
        const frase = (t) => maiuscula(quem) + ' é ' + art(t) + '.';
        const v = vfDe(rng, frase(NOME_GRUPO[g]), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmado = v.correta ? g : Object.keys(NOME_GRUPO).find((k) => NOME_GRUPO[k] === e.texto);
        delete ex.enunciado;
        return Object.assign(ex, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const g = grupoPelaEstrutura(p.dados.molecula);
      if (p.formato === 'vf') return p.correta === (p.dados.afirmado === g);
      return p.opcoes[p.correta] === NOME_GRUPO[g];
    },
    limites(p) {
      return MOL_GRUPO.includes(p.dados.molecula);
    },
  });

  registar({
    subtema: 'carbono', tipo: 'nome', nome: 'Nome e fórmula de alcanos, alcenos e alcinos simples',
    formatos: ['escolha', 'vf'], contextos: ['nome', 'formula'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const [n, fam] = escolher(rng, HCS);
        if (formato === 'escolha' && n === 1) return null;
        const h = FAMILIA[fam].h(n);
        const F = '$' + formulaHC(n, h) + '$';
        const nome = nomeHC(n, fam);
        // Erro de prefixo: n − 1 ou n + 1 carbonos, com nome que existe (alcenos e alcinos com 2 a 4 carbonos; buteno e butino também existem).
        const nP = fam === 'alcano' ? (n === 4 ? 3 : n + 1) : (n === 2 ? 3 : 2);
        const outras = ['alcano', 'alceno', 'alcino'].filter((x) => x !== fam);
        const codTerm = {};
        [{ fam: 'alcano', codigo: 'deu_a_terminacao_ano' }, { fam: 'alceno', codigo: 'deu_a_terminacao_eno' }, { fam: 'alcino', codigo: 'deu_a_terminacao_ino' }].forEach((x) => { codTerm[x.fam] = x.codigo; });
        const codForm = { alcano: 'usou_a_formula_do_alcano', alceno: 'usou_a_formula_do_alceno', alcino: 'usou_a_formula_do_alcino' };
        let enunciado, certa, erros;
        const resolucao = [
          { passo: 'Contar os carbonos (prefixo)', porque: 'Com ' + n + (n === 1 ? ' carbono' : ' carbonos') + ', o prefixo é ' + PREFIXO[n] + '-.' },
          { passo: 'Ver o tipo de ligação (terminação)', porque: 'Com $n = ' + n + '$, a fórmula geral $\\mathrm{' + FAMILIA[fam].geral + '}$ dá ' + h + ' hidrogénios: é um ' + FAMILIA[fam].nome + ' (' + FAMILIA[fam].lig + '), terminação -' + FAMILIA[fam].term + '.', calculo: formulaHC(n, h) + '\\colon\\ \\text{' + nome + '}' },
        ];
        if (contexto === 'nome') {
          enunciado = 'Qual é o nome do hidrocarboneto de cadeia aberta ' + F + '?';
          certa = maiuscula(nome);
          erros = outras.map((x) => ({ codigo: codTerm[x], texto: maiuscula(nomeHC(n, x)), explicacao: 'O ' + nomeHC(n, x) + ' é um ' + FAMILIA[x].nome + ' (' + FAMILIA[x].lig + ') e teria a fórmula $' + formulaHC(n, FAMILIA[x].h(n)) + '$. Com ' + h + ' hidrogénios, é um ' + FAMILIA[fam].nome + ': ' + nome + '.' }));
          erros.push({ codigo: 'confundiu_o_prefixo', texto: maiuscula(nomeHC(nP, fam)), explicacao: 'O prefixo ' + PREFIXO[nP] + '- é de ' + nP + ' carbonos ($' + formulaHC(nP, FAMILIA[fam].h(nP)) + '$); com ' + plural(n, 'carbono', 'carbonos') + ' é ' + PREFIXO[n] + '-: ' + nome + '.' });
        } else {
          enunciado = 'Qual é a fórmula molecular do ' + nome + '?';
          certa = F;
          erros = outras.map((x) => ({ codigo: codForm[x], texto: '$' + formulaHC(n, FAMILIA[x].h(n)) + '$', explicacao: '$' + formulaHC(n, FAMILIA[x].h(n)) + '$ segue a fórmula geral do ' + FAMILIA[x].nome + ' ($\\mathrm{' + FAMILIA[x].geral + '}$). A terminação -' + FAMILIA[fam].term + ' indica um ' + FAMILIA[fam].nome + ': ' + F + '.' }));
          erros.push({ codigo: 'confundiu_o_prefixo', texto: '$' + formulaHC(nP, FAMILIA[fam].h(nP)) + '$', explicacao: '$' + formulaHC(nP, FAMILIA[fam].h(nP)) + '$ tem ' + nP + ' carbonos (prefixo ' + PREFIXO[nP] + '-); o prefixo ' + PREFIXO[n] + '- indica ' + n + (n === 1 ? ' carbono' : ' carbonos') + ': ' + F + '.' });
        }
        const dados = { n, fam, contexto };
        const verificacao = { passo: 'Contar os hidrogénios pelas valências do carbono', calculo: '4 \\times ' + n + ' - 2 \\times ' + (n - 1) + (fam === 'alcano' ? '' : ' - ' + (fam === 'alceno' ? 2 : 4)) + ' = ' + hPelasValencias(n, fam), valor: null };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado, resolucao, dados, verificacao }, certa, erros, certa);
        const e = escolher(rng, erros.filter((x) => n > 1 || x.codigo === 'confundiu_o_prefixo'));
        const frase = (t) => (contexto === 'nome' ? 'O hidrocarboneto de cadeia aberta ' + F + ' chama-se ' + t.toLowerCase() + '.' : 'A fórmula molecular do ' + nome + ' é ' + t + '.');
        const v = vfDe(rng, frase(certa), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmado = v.correta ? certa : e.texto;
        return Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const { n, fam, contexto } = p.dados;
      const h = hPelasValencias(n, fam);
      const certo = contexto === 'nome' ? maiuscula(PREFIXO[n] + FAMILIA[famDeH(n, h)].term) : '$' + formulaHC(n, h) + '$';
      if (p.formato === 'vf') return p.correta === (p.dados.afirmado === certo);
      return p.opcoes[p.correta] === certo;
    },
    limites(p) {
      return HCS.some(([n, f]) => n === p.dados.n && f === p.dados.fam);
    },
  });

  // ================================================================ gases
  const AS3 = ' Apresenta o resultado com três algarismos significativos.';
  function valor3AS(rng, faixas) {
    const [min, max, passo] = escolher(rng, faixas);
    return A.entre(rng, min, max, passo);
  }
  // Gases (fórmula como objeto para Manual.quimica.massaMolar): [id, nome, { elemento: índice }].
  const GASES = [
    ['O_2', 'oxigénio', { O: 2 }], ['N_2', 'nitrogénio', { N: 2 }], ['CO_2', 'dióxido de carbono', { C: 1, O: 2 }],
    ['CH_4', 'metano', { C: 1, H: 4 }], ['H_2', 'hidrogénio', { H: 2 }], ['Cl_2', 'cloro', { Cl: 2 }],
    ['NH_3', 'amoníaco', { N: 1, H: 3 }], ['SO_2', 'dióxido de enxofre', { S: 1, O: 2 }], ['C_3H_8', 'propano', { C: 3, H: 8 }],
  ];
  const gasTex = (g) => '$\\mathrm{' + g[0] + '}$';
  const dadosAr = (f) => Object.keys(f).map((s) => '$A_r(\\mathrm{' + s + '}) = ' + texF(el(s).massaAtomica, 2) + '$').join(', ');
  const texM = (f) => Object.keys(f).map((s) => (f[s] === 1 ? '' : f[s] + ' \\times ') + texF(el(s).massaAtomica, 2)).join(' + ');
  const temIndice = (f) => Object.keys(f).some((s) => f[s] > 1);
  const massaSemIndices = (f) => Math.round(soma(Object.keys(f).map((s) => el(s).massaAtomica)) * 100) / 100;
  // Massa molar somada átomo a átomo (verificação independente de Manual.quimica.massaMolar).
  const massaAtomoAAtomo = (f) => {
    let m = 0;
    for (const s of Object.keys(f)) for (let i = 0; i < f[s]; i++) m += D().elementos[s].massaAtomica;
    return Math.round(m * 100) / 100;
  };
  const VmTex = () => tex(K().Vm, 1);
  const dadoVm = () => '$V_m = ' + VmTex() + '\\,\\mathrm{dm^3\\,mol^{-1}}$';
  const passoMM = (g) => ({
    passo: 'Calcular a massa molar', porque: 'Soma das massas atómicas relativas, cada uma multiplicada pelo seu índice.',
    calculo: 'M(\\mathrm{' + g[0] + '}) = ' + A.cadeia(texM(g[2]), texF(Q().massaMolar(g[2]), 2)) + '\\,\\mathrm{g\\,mol^{-1}}',
  });
  // Fecha um item numérico (ou de escolha) com resposta arredondada a 3 a.s.; null se o arredondamento for ambíguo.
  function fechar3(rng, formato, ex, exato, o) {
    if (ambiguo(exato, 3)) return null;
    const resposta = aAS(exato, 3);
    const tol = A.tolMeiaUnidade(resposta, 3);
    const erros = o.erros.map((e) => Object.assign({}, e, { valor: aAS(e.valor, 3) }));
    // Tolerância relativa para valores muito grandes ou pequenos e também quando um erro típico tem um valor próximo
    // de zero (com tolerância absoluta, uma resposta 0 seria tomada por esse erro).
    const relativa = Math.abs(resposta) >= 1e4 || Math.abs(resposta) < 1e-3 || erros.some((e) => Math.abs(e.valor) <= 10 * tol);
    return fechar(rng, formato, ex, Object.assign({ resposta, algarismos: 3, unidade: o.unidade, texto: o.texto, erros, verificacao: o.verificacao(resposta) },
      relativa ? { toleranciaRelativa: tol / Math.abs(resposta) } : { tolerancia: tol }));
  }

  registar({
    subtema: 'gases', tipo: 'volume-molar', nome: 'Volume, quantidade de matéria e massa de um gás em PTN',
    formatos: ['numerica', 'escolha'], contextos: ['V-de-n', 'n-de-V', 'V-de-m'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = escolher(rng, GASES);
        const Vm = K().Vm;
        const G_ = gasTex(g);
        const t = (u) => (v) => '$' + texAS(v, 3) + '\\,' + u + '$';
        let ex, exato, erros, unidade, texto, verificacao;
        if (contexto === 'V-de-n') {
          const n = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 9.99, 0.01]]);
          exato = n * Vm;
          unidade = 'dm³';
          texto = t('\\mathrm{dm^3}');
          ex = {
            enunciado: 'Que volume ocupam $' + texAS(n, 3) + '\\,\\mathrm{mol}$ de ' + g[1] + ', ' + G_ + ', em condições PTN (' + dadoVm() + ')?' + AS3,
            resolucao: [{ passo: 'Multiplicar a quantidade de matéria pelo volume molar', porque: 'Em PTN cada mole de qualquer gás ocupa $' + VmTex() + '\\,\\mathrm{dm^3}$: $V = n\\,V_m$.', calculo: 'V = ' + texAS(n, 3) + ' \\times ' + VmTex() + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{dm^3}' }],
          };
          erros = [
            { codigo: 'dividiu_pelo_volume_molar', valor: n / Vm, explicacao: 'Dividiste $n$ pelo volume molar e obtiveste ' + txtAS(n / Vm, 3) + '; o volume é $V = n\\,V_m$ (mais moles, mais volume).' },
            { codigo: 'deu_o_volume_de_uma_mole', valor: Vm, explicacao: VmTex().replace('{,}', ',') + ' dm³ é o volume de uma mole; para ' + texAS(n, 3).replace('{,}', ',') + ' mol multiplica-se: $V = n\\,V_m$.' },
            { codigo: 'dividiu_o_volume_molar_por_n', valor: Vm / n, explicacao: 'Calculaste $V_m / n \\approx ' + texAS(Vm / n, 3) + '$; o volume é $V = n\\,V_m$.' },
          ];
          verificacao = (r) => ({ passo: 'Voltar à quantidade de matéria', calculo: 'n = \\dfrac{' + texAS(r, 3) + '}{' + VmTex() + '} \\approx ' + texAS(r / Vm, 3) + '\\,\\mathrm{mol}', valor: aAS(Q().volumeGasPTN(n), 3) });
          ex.dados = { gas: g[0], n, contexto };
        } else if (contexto === 'n-de-V') {
          const emCm3 = rng() < 0.5;
          const Vd = emCm3 ? valor3AS(rng, [[100, 999, 1]]) : valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          const V = emCm3 ? Vd / 1000 : Vd;
          exato = V / Vm;
          unidade = 'mol';
          texto = t('\\mathrm{mol}');
          ex = {
            enunciado: 'Que quantidade de ' + g[1] + ', ' + G_ + ', há em $' + texAS(Vd, 3) + '\\,\\mathrm{' + (emCm3 ? 'cm^3' : 'dm^3') + '}$ desse gás, em condições PTN (' + dadoVm() + ')?' + AS3,
            resolucao: (emCm3 ? [{ passo: 'Passar o volume a decímetros cúbicos', porque: 'O volume molar está em $\\mathrm{dm^3\\,mol^{-1}}$ e $1\\,\\mathrm{dm^3} = 1000\\,\\mathrm{cm^3}$.', calculo: texAS(Vd, 3) + '\\,\\mathrm{cm^3} = ' + texAS(V, 3) + '\\,\\mathrm{dm^3}' }] : []).concat([
              { passo: 'Dividir o volume pelo volume molar', porque: '$V = n\\,V_m$, logo $n = \\dfrac{V}{V_m}$.', calculo: 'n = \\dfrac{' + texAS(V, 3) + '}{' + VmTex() + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{mol}' },
            ]),
          };
          erros = [
            { codigo: 'multiplicou_pelo_volume_molar', valor: V * Vm, explicacao: 'Multiplicaste pelo volume molar e obtiveste ' + txtAS(V * Vm, 3) + '; a quantidade de matéria é $n = V / V_m$.' },
            { codigo: 'dividiu_ao_contrario', valor: Vm / V, explicacao: 'Calculaste $V_m / V \\approx ' + texAS(Vm / V, 3) + '$; é ao contrário: $n = V / V_m$.' },
          ];
          if (emCm3) erros.push({ codigo: 'nao_converteu_cm3_em_dm3', valor: Vd / Vm, explicacao: 'Usaste o volume em $\\mathrm{cm^3}$ e obtiveste ' + txtAS(Vd / Vm, 3) + '; o volume molar está em $\\mathrm{dm^3\\,mol^{-1}}$, por isso primeiro $' + texAS(Vd, 3) + '\\,\\mathrm{cm^3} = ' + texAS(V, 3) + '\\,\\mathrm{dm^3}$.' });
          verificacao = (r) => ({ passo: 'Voltar ao volume', calculo: 'V = ' + texAS(r, 3) + ' \\times ' + VmTex() + ' \\approx ' + texAS(r * Vm, 3) + '\\,\\mathrm{dm^3}', valor: aAS(Q().nDeVolumePTN(V), 3) });
          ex.dados = { gas: g[0], V, contexto };
        } else {
          const m = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          const M = Q().massaMolar(g[2]);
          const n = m / M;
          exato = n * Vm;
          unidade = 'dm³';
          texto = t('\\mathrm{dm^3}');
          ex = {
            enunciado: 'Que volume ocupam $' + texAS(m, 3) + '\\,\\mathrm{g}$ de ' + g[1] + ', ' + G_ + ', em condições PTN (' + dadosAr(g[2]) + ', ' + dadoVm() + ')?' + AS3,
            resolucao: [
              passoMM(g),
              { passo: 'Converter a massa em quantidade de matéria', porque: 'O volume molar é o volume de uma mole: primeiro $n = \\dfrac{m}{M}$.', calculo: 'n = \\dfrac{' + texAS(m, 3) + '}{' + texF(M, 2) + '} \\approx ' + texAS(n, 4) + '\\,\\mathrm{mol}' },
              { passo: 'Multiplicar pelo volume molar', porque: '$V = n\\,V_m$ (com $n$ ainda por arredondar).', calculo: 'V = ' + texAS(n, 4) + ' \\times ' + VmTex() + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{dm^3}' },
            ],
          };
          erros = [
            { codigo: 'usou_o_volume_molar_com_a_massa', valor: m * Vm, explicacao: 'Multiplicaste a massa pelo volume molar e obtiveste ' + txtAS(m * Vm, 3) + '; $V_m$ é o volume de uma mole, por isso primeiro converte-se a massa: $n = m / M$.' },
            { codigo: 'deu_a_quantidade_de_materia', valor: n, explicacao: txtAS(n, 3) + ' é a quantidade de matéria (em mol); falta multiplicar pelo volume molar.' },
            { codigo: 'dividiu_pelo_volume_molar', valor: n / Vm, explicacao: 'Dividiste $n$ pelo volume molar e obtiveste ' + txtAS(n / Vm, 3) + '; o volume é $V = n\\,V_m$.' },
          ];
          if (temIndice(g[2])) erros.push({ codigo: 'esqueceu_o_indice_na_massa_molar', valor: m / massaSemIndices(g[2]) * Vm, explicacao: 'Calculaste a massa molar sem os índices ($' + texF(massaSemIndices(g[2]), 2) + '\\,\\mathrm{g\\,mol^{-1}}$) e obtiveste ' + txtAS(m / massaSemIndices(g[2]) * Vm, 3) + '; $M(\\mathrm{' + g[0] + '}) = ' + texF(M, 2) + '\\,\\mathrm{g\\,mol^{-1}}$.' });
          verificacao = (r) => ({ passo: 'Voltar à massa: $V / V_m$ dá $n$, e $n \\times M$ dá $m$', calculo: '\\dfrac{' + texAS(r, 3) + '}{' + VmTex() + '} \\times ' + texF(M, 2) + ' \\approx ' + texAS(r / Vm * M, 3) + '\\,\\mathrm{g}', valor: aAS(m / massaAtomoAAtomo(g[2]) * Vm, 3) });
          ex.dados = { gas: g[0], m, contexto };
        }
        return fechar3(rng, formato, ex, exato, { erros, unidade, texto, verificacao });
      });
    },
    verificarIndependente(p) {
      const g = GASES.find((x) => x[0] === p.dados.gas);
      const Vm = K().Vm;
      // Proporção direta com uma mole (22,4 dm³ por mol), sem Manual.quimica.
      const v = p.dados.contexto === 'V-de-n' ? Vm * p.dados.n : p.dados.contexto === 'n-de-V' ? p.dados.V * (1 / Vm) : (p.dados.m / massaAtomoAAtomo(g[2])) * Vm;
      const u = p.dados.contexto === 'n-de-V' ? '\\mathrm{mol}' : '\\mathrm{dm^3}';
      return confere(p, aAS(v, 3), (x) => '$' + texAS(x, 3) + '\\,' + u + '$');
    },
    limites(p) {
      return !!GASES.find((x) => x[0] === p.dados.gas);
    },
  });

  registar({
    subtema: 'gases', tipo: 'massa-volumica', nome: 'Massa volúmica de um gás em PTN',
    formatos: ['numerica', 'escolha'], contextos: ['rho', 'comparar'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const g = escolher(rng, GASES);
        const Vm = K().Vm;
        const M = Q().massaMolar(g[2]);
        const G_ = gasTex(g);
        if (contexto === 'rho') {
          const exato = Q().massaVolumicaGas(M);
          const ex = {
            enunciado: 'Calcula a massa volúmica do ' + g[1] + ', ' + G_ + ', em condições PTN (' + dadosAr(g[2]) + ', ' + dadoVm() + '), em $\\mathrm{g\\,dm^{-3}}$.' + AS3,
            resolucao: [
              passoMM(g),
              { passo: 'Dividir a massa molar pelo volume molar', porque: 'Uma mole tem a massa $M$ e ocupa $V_m$: $\\rho = \\dfrac{m}{V} = \\dfrac{n\\,M}{n\\,V_m} = \\dfrac{M}{V_m}$.', calculo: '\\rho = \\dfrac{' + texF(M, 2) + '}{' + VmTex() + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{g\\,dm^{-3}}' },
            ],
            dados: { gas: g[0], contexto },
          };
          const erros = [
            { codigo: 'dividiu_ao_contrario', valor: Vm / M, explicacao: 'Calculaste $V_m / M \\approx ' + texAS(Vm / M, 3) + '$; a massa volúmica é massa a dividir por volume: $\\rho = M / V_m$.' },
            { codigo: 'multiplicou_pelo_volume_molar', valor: M * Vm, explicacao: 'Multiplicaste a massa molar pelo volume molar (' + txtAS(M * Vm, 3) + '); a massa volúmica é $\\rho = M / V_m$.' },
            { codigo: 'deu_a_massa_molar', valor: M, explicacao: txtAS(M, 3) + ' é a massa molar (em $\\mathrm{g\\,mol^{-1}}$); a massa volúmica divide-a pelo volume molar.' },
          ];
          if (temIndice(g[2])) erros.push({ codigo: 'esqueceu_o_indice_na_massa_molar', valor: massaSemIndices(g[2]) / Vm, explicacao: 'Calculaste a massa molar sem os índices ($' + texF(massaSemIndices(g[2]), 2) + '\\,\\mathrm{g\\,mol^{-1}}$) e obtiveste ' + txtAS(massaSemIndices(g[2]) / Vm, 3) + '; $M(\\mathrm{' + g[0] + '}) = ' + texF(M, 2) + '\\,\\mathrm{g\\,mol^{-1}}$.' });
          return fechar3(rng, formato, ex, exato, {
            erros, unidade: 'g/dm³', texto: (v) => '$' + texAS(v, 3) + '\\,\\mathrm{g\\,dm^{-3}}$',
            verificacao: (r) => ({ passo: 'Massa de 1 dm³: a fração de mole que cabe em 1 dm³ vezes M', calculo: '\\dfrac{1}{' + VmTex() + '}\\,\\mathrm{mol} \\times ' + texF(M, 2) + '\\,\\mathrm{g\\,mol^{-1}} \\approx ' + texAS(r, 3) + '\\,\\mathrm{g}', valor: aAS(massaAtomoAAtomo(g[2]) * (1 / Vm), 3) }),
          });
        }
        // Comparar dois gases à mesma pressão e temperatura: ρ_A / ρ_B = M_A / M_B (o volume molar é o mesmo).
        const maisLeves = GASES.filter((x) => Q().massaMolar(x[2]) < M - 1);
        if (!maisLeves.length) return null;
        const b = escolher(rng, maisLeves);
        const Mb = Q().massaMolar(b[2]);
        const exato = M / Mb;
        const ex = {
          enunciado: 'À mesma pressão e à mesma temperatura, quantas vezes é a massa volúmica do ' + g[1] + ', ' + G_ + ', maior do que a do ' + b[1] + ', ' + gasTex(b) + ' (' + dadosAr(Object.assign({}, g[2], b[2])) + ')?' + AS3,
          resolucao: [
            { passo: 'O volume molar é o mesmo para os dois gases', porque: 'Pela lei de Avogadro, à mesma pressão e temperatura uma mole de qualquer gás ocupa o mesmo volume $V_m$. Como $\\rho = \\dfrac{M}{V_m}$, a razão das massas volúmicas é a razão das massas molares.' },
            { passo: 'Calcular as massas molares e dividir', porque: '$\\dfrac{\\rho_A}{\\rho_B} = \\dfrac{M_A / V_m}{M_B / V_m} = \\dfrac{M_A}{M_B}$.', calculo: '\\dfrac{' + texF(M, 2) + '}{' + texF(Mb, 2) + '} \\approx ' + texAS(exato, 3) },
          ],
          dados: { gas: g[0], outro: b[0], contexto },
        };
        const erros = [
          { codigo: 'razao_invertida', valor: Mb / M, explicacao: 'Calculaste $M_B / M_A \\approx ' + texAS(Mb / M, 3) + '$; o gás mais denso é o de maior massa molar, por isso a razão pedida é $' + texF(M, 2) + ' / ' + texF(Mb, 2) + '$.' },
          { codigo: 'achou_iguais_as_massas_volumicas', valor: 1, explicacao: 'Obtiveste 1: à mesma pressão e temperatura o volume molar é igual, mas a massa de cada mole não. As massas volúmicas estão na razão das massas molares.' },
          { codigo: 'subtraiu_as_massas_molares', valor: M - Mb, explicacao: 'Subtraíste as massas molares ($' + texF(M, 2) + ' - ' + texF(Mb, 2) + '$) e obtiveste ' + txtAS(M - Mb, 3) + '; «quantas vezes» pede o quociente.' },
        ];
        return fechar3(rng, formato, ex, exato, {
          erros, unidade: '', texto: (v) => '$' + texAS(v, 3) + '$',
          verificacao: (r) => ({ passo: 'Calcular cada massa volúmica em PTN e dividir', calculo: '\\dfrac{' + texF(M, 2) + ' / ' + VmTex() + '}{' + texF(Mb, 2) + ' / ' + VmTex() + '} \\approx ' + texAS(r, 3), valor: aAS((M / K().Vm) / (Mb / K().Vm), 3) }),
        });
      });
    },
    verificarIndependente(p) {
      const g = GASES.find((x) => x[0] === p.dados.gas);
      const Vm = K().Vm;
      if (p.dados.contexto === 'comparar') {
        const b = GASES.find((x) => x[0] === p.dados.outro);
        return confere(p, aAS(massaAtomoAAtomo(g[2]) / massaAtomoAAtomo(b[2]), 3), (x) => '$' + texAS(x, 3) + '$');
      }
      return confere(p, aAS(massaAtomoAAtomo(g[2]) * (1 / Vm), 3), (x) => '$' + texAS(x, 3) + '\\,\\mathrm{g\\,dm^{-3}}$');
    },
    limites(p) {
      return !!GASES.find((x) => x[0] === p.dados.gas);
    },
  });

  registar({
    subtema: 'gases', tipo: 'fracao-molar', nome: 'Fração molar numa mistura gasosa e composição do ar',
    formatos: ['numerica', 'escolha'], contextos: ['quantidades', 'massas', 'ar'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const t3 = (v) => '$' + texAS(v, 3) + '$';
        if (contexto === 'ar') {
          const gas = escolher(rng, D().atmosfera.filter((x) => x.percentagem > 0.9));
          const pct = gas.percentagem;
          const V = valor3AS(rng, [[10, 99.9, 0.1], [100, 999, 1]]);
          const Vm = K().Vm;
          const x = pct / 100;
          const exato = x * V / Vm;
          const nomeG = gas.nome;
          const F = '$\\mathrm{' + gas.gas.replace(/(\d)/, '_$1') + '}$';
          const ex = {
            enunciado: 'O ar seco tem ' + String(pct).replace('.', ',') + ' % (em volume) de ' + nomeG + ', ' + F + '. Que quantidade de ' + nomeG + ' há em $' + texAS(V, 3) + '\\,\\mathrm{dm^3}$ de ar seco, em condições PTN (' + dadoVm() + ')?' + AS3,
            resolucao: [
              { passo: 'Calcular a quantidade total de gás', porque: 'Em PTN, $n = \\dfrac{V}{V_m}$ para a mistura toda.', calculo: 'n_{\\text{total}} = \\dfrac{' + texAS(V, 3) + '}{' + VmTex() + '} \\approx ' + texAS(V / Vm, 4) + '\\,\\mathrm{mol}' },
              { passo: 'Multiplicar pela fração molar', porque: 'Num gás, a percentagem em volume é igual à percentagem em quantidade de matéria: $x = ' + tex(x, 6) + '$.', calculo: 'n = ' + tex(x, 6) + ' \\times ' + texAS(V / Vm, 4) + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{mol}' },
            ],
            dados: { gas: gas.gas, V, contexto },
          };
          const erros = [
            { codigo: 'nao_dividiu_a_percentagem_por_100', valor: pct * V / Vm, explicacao: 'Usaste ' + String(pct).replace('.', ',') + ' em vez de ' + String(x).replace('.', ',') + ' e obtiveste ' + t3(pct * V / Vm) + '; a percentagem divide-se por 100 para dar a fração molar.' },
            { codigo: 'nao_multiplicou_pela_fracao', valor: V / Vm, explicacao: t3(V / Vm) + ' é a quantidade de todo o ar; o ' + nomeG + ' é só ' + String(pct).replace('.', ',') + ' % dessa quantidade.' },
            { codigo: 'multiplicou_pelo_volume_molar', valor: x * V * Vm, explicacao: 'Multiplicaste pelo volume molar e obtiveste ' + t3(x * V * Vm) + '; a quantidade de matéria é $n = V / V_m$.' },
          ];
          return fechar3(rng, formato, ex, exato, {
            erros, unidade: 'mol', texto: (v) => '$' + texAS(v, 3) + '\\,\\mathrm{mol}$',
            verificacao: (r) => ({ passo: 'Calcular primeiro o volume do gás no ar e só depois a quantidade', calculo: 'V = ' + tex(x, 6) + ' \\times ' + texAS(V, 3) + ' \\approx ' + texAS(x * V, 4) + '\\,\\mathrm{dm^3};\\quad n = \\dfrac{' + texAS(x * V, 4) + '}{' + VmTex() + '} \\approx ' + texAS(r, 3) + '\\,\\mathrm{mol}', valor: aAS(Q().nDeVolumePTN(x * V), 3) }),
          });
        }
        const [a, b] = baralhar(rng, GASES.filter((g) => g[0] !== 'C_3H_8')).slice(0, 2);
        let na, nb, enunciado, resolucao, erros, dados;
        if (contexto === 'quantidades') {
          na = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 9.99, 0.01]]);
          nb = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 9.99, 0.01]]);
          enunciado = 'Uma mistura gasosa tem $' + texAS(na, 3) + '\\,\\mathrm{mol}$ de ' + a[1] + ', ' + gasTex(a) + ', e $' + texAS(nb, 3) + '\\,\\mathrm{mol}$ de ' + b[1] + ', ' + gasTex(b) + '. Calcula a fração molar do ' + a[1] + '.' + AS3;
          resolucao = [];
          erros = [];
          dados = { a: a[0], b: b[0], na, nb, contexto };
        } else {
          const ma = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          const mb = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          const Ma = Q().massaMolar(a[2]);
          const Mb = Q().massaMolar(b[2]);
          na = ma / Ma;
          nb = mb / Mb;
          enunciado = 'Uma mistura gasosa tem $' + texAS(ma, 3) + '\\,\\mathrm{g}$ de ' + a[1] + ', ' + gasTex(a) + ', e $' + texAS(mb, 3) + '\\,\\mathrm{g}$ de ' + b[1] + ', ' + gasTex(b) + ' (' + dadosAr(Object.assign({}, a[2], b[2])) + '). Calcula a fração molar do ' + a[1] + '.' + AS3;
          resolucao = [
            { passo: 'Converter as massas em quantidades de matéria', porque: 'A fração molar compara quantidades de matéria, não massas: $n = \\dfrac{m}{M}$, com $M(\\mathrm{' + a[0] + '}) = ' + texF(Ma, 2) + '$ e $M(\\mathrm{' + b[0] + '}) = ' + texF(Mb, 2) + '\\,\\mathrm{g\\,mol^{-1}}$.', calculo: 'n_A = \\dfrac{' + texAS(ma, 3) + '}{' + texF(Ma, 2) + '} \\approx ' + texAS(na, 4) + '\\,\\mathrm{mol};\\quad n_B = \\dfrac{' + texAS(mb, 3) + '}{' + texF(Mb, 2) + '} \\approx ' + texAS(nb, 4) + '\\,\\mathrm{mol}', bloco: true },
          ];
          erros = [{ codigo: 'usou_as_massas_em_vez_de_n', valor: ma / (ma + mb), explicacao: 'Dividiste as massas ($' + texAS(ma, 3) + ' / ' + texAS(ma + mb, 4) + ' \\approx ' + texAS(ma / (ma + mb), 3) + '$); a fração molar usa quantidades de matéria, e as massas molares dos dois gases são diferentes.' }];
          dados = { a: a[0], b: b[0], ma, mb, contexto };
        }
        const exato = na / (na + nb);
        const nT = (v) => texAS(v, contexto === 'massas' ? 4 : 3);
        resolucao.push({ passo: 'Dividir pela quantidade total', porque: 'A fração molar de A é $x_A = \\dfrac{n_A}{n_{\\text{total}}}$ (não tem unidades; as frações somam 1).', calculo: 'x = \\dfrac{' + nT(na) + '}{' + nT(na) + ' + ' + nT(nb) + '} \\approx ' + texAS(exato, 3) });
        erros.push(
          { codigo: 'dividiu_pela_quantidade_do_outro_componente', valor: na / nb, explicacao: 'Dividiste pela quantidade do outro gás ($' + nT(na) + ' / ' + nT(nb) + ' \\approx ' + texAS(na / nb, 3) + '$); a fração molar divide pela quantidade total.' },
          { codigo: 'deu_a_fracao_do_outro_componente', valor: nb / (na + nb), explicacao: txtAS(nb / (na + nb), 3) + ' é a fração molar do outro gás; pedia-se a do ' + a[1] + '.' },
        );
        erros.push({ codigo: 'deu_a_percentagem', valor: 100 * exato, explicacao: txtAS(100 * exato, 3) + ' é a percentagem em quantidade de matéria; a fração molar é um número entre 0 e 1 (sem multiplicar por 100).' });
        return fechar3(rng, formato, { enunciado, resolucao, dados }, exato, {
          erros, unidade: '', texto: (v) => '$' + texAS(v, 3) + '$',
          verificacao: (r) => ({ passo: 'Confirmar que as duas frações somam 1', calculo: texAS(r, 3) + ' + ' + texAS(nb / (na + nb), 3) + ' \\approx 1', valor: aAS(1 - nb / (na + nb), 3) }),
        });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      let v;
      if (d.contexto === 'ar') {
        const pct = D().atmosfera.find((x) => x.gas === d.gas).percentagem;
        v = (d.V * pct / 100) / K().Vm;
      } else {
        const ga = GASES.find((x) => x[0] === d.a);
        const gb = GASES.find((x) => x[0] === d.b);
        const na = d.contexto === 'quantidades' ? d.na : d.ma / massaAtomoAAtomo(ga[2]);
        const nb = d.contexto === 'quantidades' ? d.nb : d.mb / massaAtomoAAtomo(gb[2]);
        v = 1 / (1 + nb / na);
      }
      const u = d.contexto === 'ar' ? '\\,\\mathrm{mol}' : '';
      return confere(p, aAS(v, 3), (x) => '$' + texAS(x, 3) + u + '$');
    },
    limites(p) {
      return p.dados.contexto === 'ar' ? D().atmosfera.some((x) => x.gas === p.dados.gas) : p.dados.a !== p.dados.b;
    },
  });

  // ================================================================ solucoes
  // Solutos: [fórmula LaTeX, nome, { elemento: índice }].
  const SOLUTOS = [
    ['NaCl', 'cloreto de sódio', { Na: 1, Cl: 1 }], ['KCl', 'cloreto de potássio', { K: 1, Cl: 1 }],
    ['NaOH', 'hidróxido de sódio', { Na: 1, O: 1, H: 1 }], ['KNO_3', 'nitrato de potássio', { K: 1, N: 1, O: 3 }],
    ['CuSO_4', 'sulfato de cobre(II)', { Cu: 1, S: 1, O: 4 }], ['C_6H_{12}O_6', 'glicose', { C: 6, H: 12, O: 6 }],
    ['Na_2CO_3', 'carbonato de sódio', { Na: 2, C: 1, O: 3 }],
  ];
  const BALOES = [50, 100, 250, 500];
  const PIPETAS = [5, 10, 20, 25, 50];
  const texV = (v) => texF(v, 1); // volumes de material volumétrico com uma casa decimal (100,0 mL)
  const solTex = (s) => '$\\mathrm{' + s[0] + '}$';
  const passoMMs = (s) => ({
    passo: 'Calcular a massa molar do soluto', porque: 'Soma das massas atómicas relativas, cada uma multiplicada pelo seu índice.',
    calculo: 'M(\\mathrm{' + s[0] + '}) = ' + A.cadeia(texM(s[2]), texF(Q().massaMolar(s[2]), 2)) + '\\,\\mathrm{g\\,mol^{-1}}',
  });
  const passoMl = (Vml) => ({ passo: 'Passar o volume a decímetros cúbicos', porque: 'A concentração exprime-se por $\\mathrm{dm^3}$ e $1\\,\\mathrm{dm^3} = 1000\\,\\mathrm{mL}$.', calculo: texV(Vml) + '\\,\\mathrm{mL} = ' + tex(Vml / 1000, 4) + '\\,\\mathrm{dm^3}' });

  registar({
    subtema: 'solucoes', tipo: 'concentracao', nome: 'Concentração molar, concentração mássica e massa de soluto a pesar',
    formatos: ['numerica', 'escolha'], contextos: ['c-de-m', 'massa-a-pesar', 'concentracao-massica'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const s = escolher(rng, SOLUTOS);
        const Vml = escolher(rng, BALOES);
        const V = Vml / 1000;
        const M = Q().massaMolar(s[2]);
        const S_ = s[1] + ', ' + solTex(s);
        let ex, exato, erros, unidade, texto, verificacao;
        if (contexto === 'c-de-m') {
          const m = valor3AS(rng, [[1, 9.99, 0.01], [10, 29.9, 0.1]]);
          const n = m / M;
          exato = Q().concentracao(n, V);
          if (exato < 0.01 || exato > 1) return null; // concentrações usuais (e abaixo da solubilidade)
          unidade = 'mol/dm³';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$';
          ex = {
            enunciado: 'Dissolveram-se $' + texAS(m, 3) + '\\,\\mathrm{g}$ de ' + S_ + ', em água, até perfazer $' + texV(Vml) + '\\,\\mathrm{mL}$ de solução. Calcula a concentração da solução (' + dadosAr(s[2]) + ').' + AS3,
            resolucao: [
              passoMMs(s),
              { passo: 'Calcular a quantidade de soluto', porque: '$n = \\dfrac{m}{M}$.', calculo: 'n = \\dfrac{' + texAS(m, 3) + '}{' + texF(M, 2) + '} \\approx ' + texAS(n, 4) + '\\,\\mathrm{mol}' },
              passoMl(Vml),
              { passo: 'Dividir pelo volume da solução', porque: '$c = \\dfrac{n}{V}$ (com $n$ ainda por arredondar).', calculo: 'c = \\dfrac{' + texAS(n, 4) + '}{' + tex(V, 4) + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{mol\\,dm^{-3}}' },
            ],
            dados: { soluto: s[0], m, Vml, contexto },
          };
          erros = [
            { codigo: 'nao_converteu_ml_em_dm3', valor: n / Vml, explicacao: 'Dividiste pelo volume em mL e obtiveste ' + txtAS(n / Vml, 3) + '; em $\\mathrm{dm^3}$ o volume é $' + tex(V, 4) + '\\,\\mathrm{dm^3}$.' },
            { codigo: 'usou_a_massa_em_vez_de_n', valor: m / V, explicacao: 'Dividiste a massa pelo volume (' + txtAS(m / V, 3) + '): isso é a concentração mássica, em $\\mathrm{g\\,dm^{-3}}$. A concentração molar usa a quantidade de matéria, $n = m / M$.' },
            { codigo: 'dividiu_ao_contrario', valor: V / n, explicacao: 'Calculaste $V / n \\approx ' + texAS(V / n, 3) + '$; a concentração é $c = n / V$.' },
          ];
          verificacao = (r) => ({ passo: 'Voltar à massa: c vezes V dá n, e n vezes M dá m', calculo: texAS(r, 3) + ' \\times ' + tex(V, 4) + ' \\times ' + texF(M, 2) + ' \\approx ' + texAS(r * V * M, 3) + '\\,\\mathrm{g}', valor: aAS(m / massaAtomoAAtomo(s[2]) / V, 3) });
        } else if (contexto === 'massa-a-pesar') {
          const c = valor3AS(rng, [[0.1, 0.5, 0.005], [0.01, 0.099, 0.001]]);
          const n = c * V;
          exato = n * M;
          unidade = 'g';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{g}$';
          ex = {
            enunciado: 'Que massa de ' + S_ + ' é preciso pesar para preparar $' + texV(Vml) + '\\,\\mathrm{mL}$ de uma solução aquosa de concentração $' + texAS(c, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$ (' + dadosAr(s[2]) + ')?' + AS3,
            resolucao: [
              passoMl(Vml),
              { passo: 'Calcular a quantidade de soluto', porque: '$n = c\\,V$.', calculo: 'n = ' + texAS(c, 3) + ' \\times ' + tex(V, 4) + ' \\approx ' + texAS(n, 4) + '\\,\\mathrm{mol}' },
              passoMMs(s),
              { passo: 'Converter em massa', porque: '$m = n\\,M$.', calculo: 'm = ' + texAS(n, 4) + ' \\times ' + texF(M, 2) + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{g}' },
            ],
            dados: { soluto: s[0], c, Vml, contexto },
            esquema: { id: 'fig-material-solucao' },
          };
          erros = [
            { codigo: 'nao_converteu_ml_em_dm3', valor: c * Vml * M, explicacao: 'Usaste o volume em mL e obtiveste ' + txtAS(c * Vml * M, 3) + ' g; com $V = ' + tex(V, 4) + '\\,\\mathrm{dm^3}$ a massa é mil vezes menor.' },
            { codigo: 'deu_n_em_vez_da_massa', valor: n, explicacao: txtAS(n, 3) + ' é a quantidade de soluto (em mol); a massa a pesar é $m = n\\,M$.' },
            { codigo: 'dividiu_pela_massa_molar', valor: n / M, explicacao: 'Dividiste pela massa molar e obtiveste ' + txtAS(n / M, 3) + '; a massa é $m = n \\times M$.' },
          ];
          verificacao = (r) => ({ passo: 'Confirmar a concentração com a massa calculada', calculo: '\\dfrac{' + texAS(r, 3) + ' / ' + texF(M, 2) + '}{' + tex(V, 4) + '} \\approx ' + texAS(r / M / V, 3) + '\\,\\mathrm{mol\\,dm^{-3}}', valor: aAS(c * V * massaAtomoAAtomo(s[2]), 3) });
        } else {
          const m = valor3AS(rng, [[1, 9.99, 0.01], [10, 29.9, 0.1]]);
          exato = Q().concentracaoMassica(m, V);
          unidade = 'g/dm³';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{g\\,dm^{-3}}$';
          ex = {
            enunciado: 'Dissolveram-se $' + texAS(m, 3) + '\\,\\mathrm{g}$ de ' + S_ + ', em água, até perfazer $' + texV(Vml) + '\\,\\mathrm{mL}$ de solução. Calcula a concentração mássica da solução, em $\\mathrm{g\\,dm^{-3}}$ (' + dadosAr(s[2]) + ').' + AS3,
            resolucao: [
              passoMl(Vml),
              { passo: 'Dividir a massa de soluto pelo volume da solução', porque: '$c_m = \\dfrac{m_{\\text{soluto}}}{V_{\\text{solução}}}$ (não é preciso a massa molar).', calculo: 'c_m = \\dfrac{' + texAS(m, 3) + '}{' + tex(V, 4) + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{g\\,dm^{-3}}' },
            ],
            dados: { soluto: s[0], m, Vml, contexto },
          };
          erros = [
            { codigo: 'nao_converteu_ml_em_dm3', valor: m / Vml, explicacao: 'Dividiste pelo volume em mL e obtiveste ' + txtAS(m / Vml, 3) + '; em $\\mathrm{dm^3}$ o volume é $' + tex(V, 4) + '\\,\\mathrm{dm^3}$.' },
            { codigo: 'calculou_a_concentracao_molar', valor: m / M / V, explicacao: txtAS(m / M / V, 3) + ' é a concentração molar (em $\\mathrm{mol\\,dm^{-3}}$); a concentração mássica divide a massa, não a quantidade, pelo volume.' },
            { codigo: 'multiplicou_pelo_volume', valor: m * V, explicacao: 'Multiplicaste a massa pelo volume (' + txtAS(m * V, 3) + '); a concentração mássica é $c_m = m / V$.' },
          ];
          verificacao = (r) => ({ passo: 'Massa de soluto em 1 dm³ de solução (regra de três)', calculo: '\\dfrac{' + texAS(m, 3) + '\\,\\mathrm{g}}{' + texV(Vml) + '\\,\\mathrm{mL}} \\times 1000\\,\\mathrm{mL} \\approx ' + texAS(r, 3) + '\\,\\mathrm{g}', valor: aAS(m * (1000 / Vml), 3) });
        }
        return fechar3(rng, formato, ex, exato, { erros, unidade, texto, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const s = SOLUTOS.find((x) => x[0] === d.soluto);
      const M = massaAtomoAAtomo(s[2]);
      const v = d.contexto === 'c-de-m' ? (d.m / M) * (1000 / d.Vml) : d.contexto === 'massa-a-pesar' ? d.c * d.Vml / 1000 * M : d.m * 1000 / d.Vml;
      const u = { 'c-de-m': '\\mathrm{mol\\,dm^{-3}}', 'massa-a-pesar': '\\mathrm{g}', 'concentracao-massica': '\\mathrm{g\\,dm^{-3}}' }[d.contexto];
      return confere(p, aAS(v, 3), (x) => '$' + texAS(x, 3) + '\\,' + u + '$');
    },
    limites(p) {
      return BALOES.includes(p.dados.Vml) && !!SOLUTOS.find((x) => x[0] === p.dados.soluto);
    },
  });

  registar({
    subtema: 'solucoes', tipo: 'diluicao', nome: 'Diluição: volume a pipetar, concentração final e fator de diluição',
    formatos: ['numerica', 'escolha'], contextos: ['volume-a-pipetar', 'concentracao-final', 'fator'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const Vf = escolher(rng, BALOES);
        const Vi = escolher(rng, PIPETAS.filter((v) => v < Vf));
        const ci = valor3AS(rng, [[0.1, 2, 0.01]]);
        const cfEx = Q().diluicao({ ci, Vi, Vf }).cf;
        const cfTex = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$';
        const esquema = { id: 'fqa-diluicao', opcoes: { ci, Vi, Vf } };
        let ex, exato, erros, unidade, texto, verificacao;
        if (contexto === 'volume-a-pipetar') {
          const cf = aAS(cfEx, 3);
          exato = Q().diluicao({ ci, cf, Vf }).Vi;
          unidade = 'mL';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{mL}$';
          ex = {
            enunciado: 'Pretende-se preparar $' + texV(Vf) + '\\,\\mathrm{mL}$ de uma solução de concentração $' + texAS(cf, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$ a partir de uma solução de concentração $' + texAS(ci, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$. Que volume da solução inicial é preciso pipetar?' + AS3,
            resolucao: [
              { passo: 'A quantidade de soluto não muda na diluição', porque: 'Só se junta água: $n = c_i V_i = c_f V_f$ (os volumes podem ficar em mL, desde que na mesma unidade).' },
              { passo: 'Resolver em ordem a $V_i$', porque: '$V_i = \\dfrac{c_f V_f}{c_i}$.', calculo: 'V_i = \\dfrac{' + texAS(cf, 3) + ' \\times ' + texV(Vf) + '}{' + texAS(ci, 3) + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{mL}' },
            ],
            dados: { ci, cf, Vf, contexto },
            esquema,
          };
          erros = [
            { codigo: 'trocou_os_volumes_na_diluicao', valor: ci * Vf / cf, explicacao: 'Usaste $c_i V_f = c_f V_i$ e obtiveste ' + txtAS(ci * Vf / cf, 3) + ' mL, mais do que o próprio balão. A quantidade de soluto conserva-se: $c_i V_i = c_f V_f$.' },
            { codigo: 'nao_dividiu_pela_concentracao_inicial', valor: cf * Vf, explicacao: 'Calculaste só $c_f V_f \\approx ' + texAS(cf * Vf, 3) + '$; falta dividir pela concentração inicial: $V_i = c_f V_f / c_i$.' },
            { codigo: 'deu_o_volume_de_agua_a_juntar', valor: Vf - exato, explicacao: txtAS(Vf - exato, 3) + ' mL é o volume de água a juntar (aproximadamente); pedia-se o volume de solução inicial a pipetar.' },
          ];
          verificacao = (r) => ({ passo: 'Confirmar pelo fator de diluição', calculo: 'f = \\dfrac{' + texAS(ci, 3) + '}{' + texAS(cf, 3) + '} \\approx ' + texAS(ci / cf, 4) + ';\\quad \\dfrac{' + texV(Vf) + '}{' + texAS(ci / cf, 4) + '} \\approx ' + texAS(r, 3) + '\\,\\mathrm{mL}', valor: aAS(Vf / (ci / cf), 3) });
        } else if (contexto === 'concentracao-final') {
          exato = cfEx;
          unidade = 'mol/dm³';
          texto = cfTex;
          const f = Vf / Vi;
          ex = {
            enunciado: 'Pipetaram-se $' + texV(Vi) + '\\,\\mathrm{mL}$ de uma solução de concentração $' + texAS(ci, 3) + '\\,\\mathrm{mol\\,dm^{-3}}$ para um balão volumétrico de $' + texV(Vf) + '\\,\\mathrm{mL}$, que se completou com água até à marca. Qual é a concentração da solução obtida?' + AS3,
            resolucao: [
              { passo: 'A quantidade de soluto não muda na diluição', porque: '$c_i V_i = c_f V_f$.' },
              { passo: 'Resolver em ordem a $c_f$', porque: '$c_f = \\dfrac{c_i V_i}{V_f}$ (os volumes na mesma unidade).', calculo: 'c_f = \\dfrac{' + texAS(ci, 3) + ' \\times ' + texV(Vi) + '}{' + texV(Vf) + '} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{mol\\,dm^{-3}}' },
            ],
            dados: { ci, Vi, Vf, contexto },
            esquema,
          };
          erros = [
            { codigo: 'trocou_os_volumes_na_diluicao', valor: ci * Vf / Vi, explicacao: 'Usaste $c_i V_f = c_f V_i$ e obtiveste ' + cfTex(ci * Vf / Vi) + ', mais concentrada do que a inicial; ao juntar água a concentração diminui: $c_f = c_i V_i / V_f$.' },
            { codigo: 'usou_o_volume_de_agua_adicionado', valor: ci * Vi / (Vf - Vi), explicacao: 'Dividiste pelo volume de água junto ($' + texV(Vf - Vi) + '\\,\\mathrm{mL}$) e obtiveste ' + cfTex(ci * Vi / (Vf - Vi)) + '; o volume final é o da solução, $' + texV(Vf) + '\\,\\mathrm{mL}$.' },
            { codigo: 'misturou_ml_e_dm3', valor: ci * Vi / (Vf / 1000), explicacao: 'Passaste só o volume final a $\\mathrm{dm^3}$ ($' + tex(Vf / 1000, 3) + '\\,\\mathrm{dm^3}$) e deixaste o pipetado em mL, obtendo ' + cfTex(ci * Vi / (Vf / 1000)) + '; os dois volumes têm de estar na mesma unidade.' },
          ];
          verificacao = (r) => ({ passo: 'Dividir a concentração inicial pelo fator de diluição', calculo: 'f = \\dfrac{' + texV(Vf) + '}{' + texV(Vi) + '} = ' + tex(f, 2) + ';\\quad \\dfrac{' + texAS(ci, 3) + '}{' + tex(f, 2) + '} \\approx ' + texAS(r, 3) + '\\,\\mathrm{mol\\,dm^{-3}}', valor: aAS(ci / f, 3) });
        } else {
          exato = Q().diluicao({ ci, Vi, Vf }).fator;
          unidade = '';
          texto = (v) => '$' + texAS(v, 3) + '$';
          ex = {
            enunciado: 'Pipetaram-se $' + texV(Vi) + '\\,\\mathrm{mL}$ de uma solução para um balão volumétrico de $' + texV(Vf) + '\\,\\mathrm{mL}$, que se completou com água até à marca. Qual é o fator de diluição?' + AS3,
            resolucao: [{ passo: 'Dividir o volume final pelo volume pipetado', porque: 'O fator de diluição é $f = \\dfrac{V_f}{V_i} = \\dfrac{c_i}{c_f}$; é sempre maior do que 1.', calculo: 'f = \\dfrac{' + texV(Vf) + '}{' + texV(Vi) + '}' + igualAprox(exato) + texAS(exato, 3) }],
            dados: { Vi, Vf, contexto },
            esquema,
          };
          erros = [
            { codigo: 'inverteu_o_fator_de_diluicao', valor: Vi / Vf, explicacao: 'Calculaste $V_i / V_f \\approx ' + texAS(Vi / Vf, 3) + '$; o fator de diluição é $V_f / V_i$ e é sempre maior do que 1.' },
            { codigo: 'usou_o_volume_de_agua_adicionado', valor: (Vf - Vi) / Vi, explicacao: 'Usaste o volume de água junto ($' + texV(Vf - Vi) + '\\,\\mathrm{mL}$) e obtiveste ' + txtAS((Vf - Vi) / Vi, 3) + '; o fator usa o volume final da solução, $' + texV(Vf) + '\\,\\mathrm{mL}$.' },
            { codigo: 'usou_a_diferenca_de_volumes', valor: Vf - Vi, explicacao: 'O fator não é a diferença entre os volumes (' + txtAS(Vf - Vi, 3) + '): é o quociente $V_f / V_i$.' },
          ];
          verificacao = (r) => ({ passo: 'Confirmar que o volume pipetado vezes o fator dá o volume do balão', calculo: texV(Vi) + '\\,\\mathrm{mL} \\times ' + texAS(r, 3) + ' \\approx ' + texV(Vi * r) + '\\,\\mathrm{mL}', valor: aAS(Vf * (1 / Vi), 3) });
        }
        return fechar3(rng, formato, ex, exato, { erros, unidade, texto, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      // Pela quantidade de soluto (em mmol), sem Manual.quimica.diluicao.
      let v;
      if (d.contexto === 'volume-a-pipetar') v = (d.cf * d.Vf) / d.ci;
      else if (d.contexto === 'concentracao-final') v = (d.ci * d.Vi) / d.Vf;
      else v = d.Vf / d.Vi;
      const u = { 'volume-a-pipetar': '\\,\\mathrm{mL}', 'concentracao-final': '\\,\\mathrm{mol\\,dm^{-3}}', fator: '' }[d.contexto];
      return confere(p, aAS(v, 3), (x) => '$' + texAS(x, 3) + u + '$');
    },
    limites(p) {
      return BALOES.includes(p.dados.Vf) && (p.dados.Vi === undefined || PIPETAS.includes(p.dados.Vi));
    },
  });

  registar({
    subtema: 'solucoes', tipo: 'composicao', nome: 'Percentagem em massa, percentagem em volume e partes por milhão',
    formatos: ['numerica', 'escolha'], contextos: ['massa', 'volume', 'ppm'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ex, exato, erros, unidade, texto, verificacao;
        if (contexto === 'massa') {
          const s = escolher(rng, SOLUTOS);
          const ms = valor3AS(rng, [[1, 9.99, 0.01], [10, 49.9, 0.1]]);
          const ma = valor3AS(rng, [[100, 500, 1]]);
          const mt = ms + ma;
          exato = Q().percentagemMassa(ms, mt);
          unidade = '%';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\%$';
          ex = {
            enunciado: 'Dissolveram-se $' + texAS(ms, 3) + '\\,\\mathrm{g}$ de ' + s[1] + ', ' + solTex(s) + ', em $' + texAS(ma, 3) + '\\,\\mathrm{g}$ de água. Calcula a percentagem em massa de soluto na solução.' + AS3,
            resolucao: [
              { passo: 'Calcular a massa da solução', porque: 'A solução é o soluto mais o solvente.', calculo: 'm_{\\text{solução}} = ' + texAS(ms, 3) + ' + ' + texAS(ma, 3) + ' = ' + tex(mt, 2) + '\\,\\mathrm{g}' },
              { passo: 'Dividir a massa de soluto pela massa da solução e multiplicar por 100', porque: '$\\%(m/m) = \\dfrac{m_{\\text{soluto}}}{m_{\\text{solução}}} \\times 100$.', calculo: '\\dfrac{' + texAS(ms, 3) + '}{' + tex(mt, 2) + '} \\times 100 \\approx ' + texAS(exato, 3) + '\\,\\%' },
            ],
            dados: { ms, ma, contexto },
          };
          erros = [
            { codigo: 'usou_a_massa_do_solvente', valor: 100 * ms / ma, explicacao: 'Dividiste pela massa de água ($' + texAS(ma, 3) + '\\,\\mathrm{g}$) e obtiveste ' + txtAS(100 * ms / ma, 3) + ' %; divide-se pela massa da solução, soluto mais água: $' + tex(mt, 2) + '\\,\\mathrm{g}$.' },
            { codigo: 'nao_multiplicou_por_100', valor: ms / mt, explicacao: txtAS(ms / mt, 3) + ' é a fração mássica; em percentagem multiplica-se por 100.' },
            { codigo: 'deu_a_percentagem_do_solvente', valor: 100 * ma / mt, explicacao: txtAS(100 * ma / mt, 3) + ' % é a percentagem de água; pedia-se a do soluto.' },
          ];
          verificacao = (r) => ({ passo: 'Confirmar que as percentagens de soluto e de água somam 100 %', calculo: texAS(r, 3) + ' + ' + texAS(100 * ma / mt, 3) + ' \\approx 100', valor: aAS(100 - 100 * ma / mt, 3) });
        } else if (contexto === 'volume') {
          const vs = valor3AS(rng, [[10, 99.9, 0.1]]);
          const Vml = escolher(rng, [250, 500]);
          exato = Q().percentagemVolume(vs, Vml);
          unidade = '%';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\%$';
          ex = {
            enunciado: 'Misturaram-se $' + texAS(vs, 3) + '\\,\\mathrm{mL}$ de etanol com água, obtendo-se $' + texV(Vml) + '\\,\\mathrm{mL}$ de solução. Calcula a percentagem em volume de etanol na solução.' + AS3,
            resolucao: [{ passo: 'Dividir o volume de etanol pelo volume da solução e multiplicar por 100', porque: '$\\%(V/V) = \\dfrac{V_{\\text{soluto}}}{V_{\\text{solução}}} \\times 100$ (usa-se o volume da solução, não o da água: os volumes de líquidos diferentes não se somam exatamente).', calculo: '\\dfrac{' + texAS(vs, 3) + '}{' + texV(Vml) + '} \\times 100 \\approx ' + texAS(exato, 3) + '\\,\\%' }],
            dados: { vs, Vml, contexto },
          };
          erros = [
            { codigo: 'usou_o_volume_do_solvente', valor: 100 * vs / (Vml - vs), explicacao: 'Dividiste pelo volume de água ($' + tex(Vml - vs, 1) + '\\,\\mathrm{mL}$, por diferença) e obtiveste ' + txtAS(100 * vs / (Vml - vs), 3) + ' %; divide-se pelo volume da solução, $' + texV(Vml) + '\\,\\mathrm{mL}$.' },
            { codigo: 'nao_multiplicou_por_100', valor: vs / Vml, explicacao: txtAS(vs / Vml, 3) + ' é a fração em volume; em percentagem multiplica-se por 100.' },
            { codigo: 'dividiu_ao_contrario', valor: 100 * Vml / vs, explicacao: 'Calculaste $V_{\\text{solução}} / V_{\\text{soluto}} \\times 100 \\approx ' + texAS(100 * Vml / vs, 3) + '$, mais de 100 %; é o volume de soluto a dividir pelo da solução.' },
          ];
          verificacao = (r) => ({ passo: 'Volume de etanol em 100 mL de solução (regra de três)', calculo: '\\dfrac{' + texAS(vs, 3) + '}{' + texV(Vml) + '} \\times 100\\,\\mathrm{mL} \\approx ' + texAS(r, 3) + '\\,\\mathrm{mL}', valor: aAS(vs * (100 / Vml), 3) });
        } else {
          const ESP = [['F^-', 'ião fluoreto'], ['Na^+', 'ião sódio'], ['Ca^{2+}', 'ião cálcio'], ['NO_3^-', 'ião nitrato']];
          const e = escolher(rng, ESP);
          const mg = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          const kg = escolher(rng, [0.5, 2, 2.5, 5]);
          exato = Q().ppm(mg / 1000, kg * 1000);
          unidade = 'ppm';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{ppm}$';
          ex = {
            enunciado: 'Uma amostra de $' + tex(kg, 1) + '\\,\\mathrm{kg}$ de água contém $' + texAS(mg, 3) + '\\,\\mathrm{mg}$ de ' + e[1] + ', $\\mathrm{' + e[0] + '}$. Exprime a composição em partes por milhão (ppm), em massa.' + AS3,
            resolucao: [
              { passo: 'Pôr as massas na mesma unidade', porque: '$1\\,\\mathrm{mg} = 10^{-3}\\,\\mathrm{g}$ e $1\\,\\mathrm{kg} = 10^{3}\\,\\mathrm{g}$.', calculo: texAS(mg, 3) + '\\,\\mathrm{mg} = ' + cient(mg / 1000, 3) + '\\,\\mathrm{g};\\quad ' + tex(kg, 1) + '\\,\\mathrm{kg} = ' + cient(kg * 1000, 2) + '\\,\\mathrm{g}' },
              { passo: 'Dividir e multiplicar por um milhão', porque: '$\\mathrm{ppm} = \\dfrac{m_{\\text{soluto}}}{m_{\\text{solução}}} \\times 10^{6}$.', calculo: '\\dfrac{' + cient(mg / 1000, 3) + '}{' + cient(kg * 1000, 2) + '} \\times 10^{6} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{ppm}' },
            ],
            dados: { mg, kg, contexto },
          };
          erros = [
            { codigo: 'usou_10_elevado_a_3_no_ppm', valor: exato / 1000, explicacao: 'Multiplicaste por $10^{3}$ e obtiveste ' + txtAS(exato / 1000, 3) + '; partes por milhão multiplica-se por $10^{6}$.' },
            { codigo: 'calculou_a_percentagem', valor: exato / 1e4, explicacao: txtAS(exato / 1e4, 3) + ' é a percentagem em massa (× 100); em ppm multiplica-se por $10^{6}$.' },
            { codigo: 'nao_converteu_mg_e_kg', valor: (mg / kg) * 1e6, explicacao: 'Dividiste mg por kg sem pôr as massas na mesma unidade e ainda multiplicaste por $10^{6}$, obtendo ' + txtAS((mg / kg) * 1e6, 3) + '; 1 mg em 1 kg já é 1 ppm.' },
          ];
          verificacao = (r) => ({ passo: '1 ppm é 1 mg de soluto por kg de solução', calculo: '\\dfrac{' + texAS(mg, 3) + '\\,\\mathrm{mg}}{' + tex(kg, 1) + '\\,\\mathrm{kg}} \\approx ' + texAS(r, 3) + '\\,\\mathrm{mg\\,kg^{-1}}', valor: aAS(mg / kg, 3) });
        }
        return fechar3(rng, formato, ex, exato, { erros, unidade, texto, verificacao });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const v = d.contexto === 'massa' ? d.ms * 100 / (d.ms + d.ma) : d.contexto === 'volume' ? d.vs * 100 / d.Vml : d.mg / d.kg;
      const u = d.contexto === 'ppm' ? '\\,\\mathrm{ppm}' : '\\,\\%';
      return confere(p, aAS(v, 3), (x) => '$' + texAS(x, 3) + u + '$');
    },
    limites(p) {
      return ['massa', 'volume', 'ppm'].includes(p.dados.contexto);
    },
  });

  // Figura explodida do material para preparar uma solução (fig-material-solucao) em modo exercício.
  // As partes pela ordem da figura (números 1 a 9).
  const PARTES_MATERIAL = [
    { id: 'balanca', nome: 'Balança', art: 'a balança', funcao: 'Mede a massa de soluto.', codigo: 'confundiu_com_a_balanca', confusoes: ['vidro-relogio', 'espatula', 'gobele'] },
    { id: 'espatula', nome: 'Espátula', art: 'a espátula', funcao: 'Transfere o soluto sólido.', codigo: 'confundiu_com_a_espatula', confusoes: ['vidro-relogio', 'pipeta', 'balanca'] },
    { id: 'vidro-relogio', nome: 'Vidro de relógio', art: 'o vidro de relógio', funcao: 'Recebe o sólido na balança.', codigo: 'confundiu_com_o_vidro_de_relogio', confusoes: ['gobele', 'balanca', 'espatula'] },
    { id: 'gobele', nome: 'Gobelé', art: 'o gobelé', funcao: 'Dissolve o soluto numa porção de água.', codigo: 'confundiu_com_o_gobele', confusoes: ['balao', 'vidro-relogio', 'funil'] },
    { id: 'funil', nome: 'Funil', art: 'o funil', funcao: 'Transfere a solução para o balão sem perdas.', codigo: 'confundiu_com_o_funil', confusoes: ['balao', 'gobele', 'pipeta'] },
    { id: 'balao', nome: 'Balão volumétrico', art: 'o balão volumétrico', funcao: 'Mede com rigor o volume final da solução.', codigo: 'confundiu_com_o_balao_volumetrico', confusoes: ['gobele', 'pipeta', 'funil'] },
    { id: 'pipeta', nome: 'Pipeta', art: 'a pipeta', funcao: 'Mede com rigor um volume de líquido a transferir.', codigo: 'confundiu_com_a_pipeta', confusoes: ['balao', 'pompete', 'funil'] },
    { id: 'pompete', nome: 'Pompete', art: 'a pompete', funcao: 'Aspira o líquido para a pipeta.', codigo: 'confundiu_com_a_pompete', confusoes: ['pipeta', 'esguicho', 'funil'] },
    { id: 'esguicho', nome: 'Esguicho', art: 'o esguicho', funcao: 'Lava o material e completa o volume com água destilada.', codigo: 'confundiu_com_o_esguicho', confusoes: ['pompete', 'gobele', 'balao'] },
  ];
  const parteMat = (id) => PARTES_MATERIAL.find((x) => x.id === id);

  registar({
    subtema: 'solucoes', tipo: 'material', nome: 'Material de laboratório para preparar uma solução (figura)',
    formatos: ['escolha'], contextos: ['nome', 'funcao'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const i = inteiro(rng, 0, PARTES_MATERIAL.length - 1);
        const c = PARTES_MATERIAL[i];
        const num = i + 1;
        const campo = contexto === 'nome' ? 'nome' : 'funcao';
        const enunciado = 'Na figura do material para preparar uma solução (sem escala), uma das peças está assinalada com o número ' + num + '. '
          + (contexto === 'nome' ? 'Que material está assinalado?' : 'Para que serve a peça assinalada?');
        const erros = c.confusoes.map((id) => {
          const w = parteMat(id);
          return { codigo: w.codigo, texto: w[campo], explicacao: (contexto === 'nome' ? maiuscula(w.art) + ' é outra peça da figura' : 'Essa é a função d' + w.art) + '. A peça ' + num + ' é ' + c.art + ': ' + c.funcao.charAt(0).toLowerCase() + c.funcao.slice(1) };
        });
        return fecharTexto(rng, {
          enunciado,
          figuraEnunciado: { id: 'fig-material-solucao', opcoes: { modo: 'exercicio', destacar: c.id } },
          resolucao: [
            { passo: 'Observar a peça assinalada', porque: 'A peça ' + num + ' é ' + c.art + '.' },
            { passo: 'Lembrar a sua função', porque: maiuscula(c.art) + ' ' + c.funcao.charAt(0).toLowerCase() + c.funcao.slice(1) },
          ],
          dados: { destacar: c.id, numero: num, contexto },
          verificacao: { passo: 'Confirmar pela ordem das peças na figura', calculo: '\\text{peça ' + num + '}', valor: null },
          esquema: { id: 'fig-material-solucao' },
        }, c[campo], erros, c[campo]);
      });
    },
    verificarIndependente(p) {
      const n = Number((p.enunciado.match(/número (\d)/) || [])[1]);
      const c = PARTES_MATERIAL[n - 1];
      if (!c || c.id !== p.figuraEnunciado.opcoes.destacar) return false;
      return p.opcoes[p.correta] === (p.dados.contexto === 'nome' ? c.nome : c.funcao);
    },
    limites(p) {
      return p.figuraEnunciado.id === 'fig-material-solucao' && p.figuraEnunciado.opcoes.modo === 'exercicio' && !!parteMat(p.dados.destacar);
    },
  });

  // ================================================================ entalpia
  // Reações em fase gasosa com moléculas do catálogo: reagentes e produtos [id, coeficiente].
  const REACOES = [
    { id: 'sintese-hcl', tipo: 'formacao', reag: [['H2', 1], ['Cl2', 1]], prod: [['HCl', 2]], esquema: 'HCl' },
    { id: 'sintese-agua', tipo: 'formacao', reag: [['H2', 2], ['O2', 1]], prod: [['H2O', 2]], esquema: 'H2O' },
    { id: 'sintese-amoniaco', tipo: 'formacao', reag: [['N2', 1], ['H2', 3]], prod: [['NH3', 2]], esquema: 'NH3' },
    { id: 'hidrogenacao-eteno', tipo: 'formacao', reag: [['C2H4', 1], ['H2', 1]], prod: [['C2H6', 1]] },
    { id: 'hidrogenacao-etino', tipo: 'formacao', reag: [['C2H2', 1], ['H2', 2]], prod: [['C2H6', 1]] },
    { id: 'hidratacao-eteno', tipo: 'formacao', reag: [['C2H4', 1], ['H2O', 1]], prod: [['C2H5OH', 1]] },
    { id: 'combustao-metano', tipo: 'combustao', reag: [['CH4', 1], ['O2', 2]], prod: [['CO2', 1], ['H2O', 2]], esquema: 'CH4' },
    { id: 'combustao-etano', tipo: 'combustao', reag: [['C2H6', 2], ['O2', 7]], prod: [['CO2', 4], ['H2O', 6]] },
    { id: 'combustao-propano', tipo: 'combustao', reag: [['C3H8', 1], ['O2', 5]], prod: [['CO2', 3], ['H2O', 4]] },
    { id: 'combustao-eteno', tipo: 'combustao', reag: [['C2H4', 1], ['O2', 3]], prod: [['CO2', 2], ['H2O', 2]] },
    { id: 'combustao-etino', tipo: 'combustao', reag: [['C2H2', 2], ['O2', 5]], prod: [['CO2', 4], ['H2O', 2]] },
    { id: 'combustao-metanol', tipo: 'combustao', reag: [['CH3OH', 2], ['O2', 3]], prod: [['CO2', 2], ['H2O', 4]] },
    { id: 'combustao-etanol', tipo: 'combustao', reag: [['C2H5OH', 1], ['O2', 3]], prod: [['CO2', 2], ['H2O', 3]] },
    { id: 'decomposicao-hcl', tipo: 'decomposicao', reag: [['HCl', 2]], prod: [['H2', 1], ['Cl2', 1]] },
    { id: 'decomposicao-agua', tipo: 'decomposicao', reag: [['H2O', 2]], prod: [['H2', 2], ['O2', 1]] },
    { id: 'decomposicao-amoniaco', tipo: 'decomposicao', reag: [['NH3', 2]], prod: [['N2', 1], ['H2', 3]] },
  ];
  const reacao = (id) => REACOES.find((r) => r.id === id);
  const ladoTex = (l) => l.map(([id, k]) => (k === 1 ? '' : k + '\\,') + mol(id).formula.replace(/^\\mathrm\{/, '\\mathrm{') + '(\\mathrm{g})').join(' + ');
  const equacaoTex = (r) => ladoTex(r.reag) + ' \\longrightarrow ' + ladoTex(r.prod);
  // Ligações de um lado da equação: { chave: número } (coeficientes × ligações de cada molécula).
  function ligacoesLado(l, comCoef = true, umaPorTipo = false) {
    const t = {};
    for (const [id, k] of l) {
      const b = ligacoesDe(id);
      for (const c of Object.keys(b)) t[c] = (t[c] || 0) + (comCoef ? k : 1) * (umaPorTipo ? 1 : b[c]);
    }
    return t;
  }
  const somaE = (t) => soma(Object.keys(t).map((c) => t[c] * D().ligacoes[c].energia));
  const listaTex = (t) => Object.keys(t).map((c) => (t[c] === 1 ? '' : t[c] + ' \\times ') + D().ligacoes[c].energia).join(' + ');
  const descLig = (t) => juntar(Object.keys(t).map((c) => t[c] + ' ' + ligTxt(c)));
  function balanco(r, comCoef = true, umaPorTipo = false) {
    const q = ligacoesLado(r.reag, comCoef, umaPorTipo);
    const f = ligacoesLado(r.prod, comCoef, umaPorTipo);
    return { q, f, Eq: somaE(q), Ef: somaE(f), dH: somaE(q) - somaE(f) };
  }
  // Energias de ligação de que a reação precisa, para o enunciado.
  function dadosLigacoes(r) {
    const usadas = Object.keys(Object.assign({}, ligacoesLado(r.reag), ligacoesLado(r.prod)));
    return usadas.map((c) => '$' + ligTex(c) + '$' + (c === 'C=O' ? ' (no $\\mathrm{CO_2}$)' : '') + ' ' + D().ligacoes[c].energia).join(', ');
  }
  // ΔH pela diferença, ligação a ligação (quebradas menos formadas de cada tipo), sem Manual.quimica.
  function deltaHPorTipo(r) {
    const q = ligacoesLado(r.reag);
    const f = ligacoesLado(r.prod);
    const tipos = new Set(Object.keys(q).concat(Object.keys(f)));
    let s = 0;
    for (const c of tipos) s += ((q[c] || 0) - (f[c] || 0)) * D().ligacoes[c].energia;
    return s;
  }
  const kJmol = '\\,\\mathrm{kJ\\,mol^{-1}}';

  registar({
    subtema: 'entalpia', tipo: 'variacao', nome: 'Variação de entalpia a partir das energias de ligação',
    formatos: ['numerica', 'escolha'], contextos: ['formacao', 'combustao', 'decomposicao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const r = escolher(rng, REACOES.filter((x) => x.tipo === contexto));
        const b = balanco(r);
        const dH = Q().deltaHLigacoes({ quebradas: b.q, formadas: b.f }).deltaH;
        const enunciado = 'Estima a variação de entalpia da reação $' + equacaoTex(r) + '$ a partir das energias de ligação (em $\\mathrm{kJ\\,mol^{-1}}$): ' + dadosLigacoes(r) + '.';
        const resolucao = [
          { passo: 'Contar as ligações quebradas (reagentes)', porque: 'Multiplica-se o número de ligações de cada molécula pelo seu coeficiente: ' + descLig(b.q) + '.', calculo: '\\sum E_{\\text{quebradas}} = ' + A.cadeia(listaTex(b.q), tex(b.Eq)) + '\\,\\mathrm{kJ}' },
          { passo: 'Contar as ligações formadas (produtos)', porque: 'Da mesma forma nos produtos: ' + descLig(b.f) + '.', calculo: '\\sum E_{\\text{formadas}} = ' + A.cadeia(listaTex(b.f), tex(b.Ef)) + '\\,\\mathrm{kJ}' },
          { passo: 'Quebradas menos formadas', porque: '$\\Delta H \\approx \\sum E(\\text{quebradas}) - \\sum E(\\text{formadas})$ (aproximado: energias médias de ligação). ' + (dH < 0 ? 'É negativo: a reação é exotérmica.' : 'É positivo: a reação é endotérmica.'), calculo: '\\Delta H \\approx ' + tex(b.Eq) + ' - ' + tex(b.Ef) + ' = ' + sinalTex(dH).replace(/^\+/, '') + kJmol },
        ];
        const semCoef = balanco(r, false);
        const umaLig = balanco(r, true, true);
        const erros = [
          { codigo: 'inverteu_quebradas_e_formadas', valor: -dH, explicacao: 'Fizeste formadas − quebradas e obtiveste ' + fmt(-dH) + ' kJ/mol, com o sinal trocado. É quebradas − formadas: $\\Delta H \\approx ' + tex(dH) + kJmol + '$.' },
          { codigo: 'esqueceu_os_coeficientes', valor: semCoef.dH, explicacao: 'Não multiplicaste pelos coeficientes da equação e obtiveste ' + fmt(semCoef.dH) + ' kJ/mol; cada coeficiente diz quantas moléculas, e portanto quantas ligações, se quebram ou formam.' },
          { codigo: 'contou_uma_ligacao_de_cada_tipo', valor: umaLig.dH, explicacao: 'Contaste uma só ligação de cada tipo por molécula e obtiveste ' + fmt(umaLig.dH) + ' kJ/mol; por exemplo, cada $\\mathrm{H_2O}$ tem 2 ligações O–H e cada $\\mathrm{CH_4}$ tem 4 ligações C–H.' },
        ];
        if (formato === 'numerica') erros.push({ codigo: 'deu_so_as_ligacoes_quebradas', valor: b.Eq, explicacao: fmt(b.Eq) + ' kJ é só a energia das ligações quebradas; falta subtrair a das ligações formadas (' + fmt(b.Ef) + ' kJ).' });
        const ex = { enunciado, resolucao, dados: { reacao: r.id, contexto } };
        if (r.esquema) ex.esquema = { id: 'fqa-entalpia', opcoes: { reacao: r.esquema } };
        return fechar(rng, formato, ex, {
          resposta: dH, tolerancia: 0.5, unidade: 'kJ/mol', texto: (v) => '$' + tex(v) + kJmol + '$', erros,
          verificacao: { passo: 'Somar ligação a ligação: (quebradas − formadas) de cada tipo × energia', calculo: '\\Delta H \\approx ' + tex(deltaHPorTipo(r)) + kJmol, valor: deltaHPorTipo(r) },
        });
      });
    },
    verificarIndependente(p) {
      const r = reacao(p.dados.reacao);
      return confere(p, deltaHPorTipo(r), (v) => '$' + tex(v) + kJmol + '$');
    },
    limites(p) {
      const r = reacao(p.dados.reacao);
      return !!r && (r.tipo !== 'decomposicao' || deltaHPorTipo(r) > 0) && (r.tipo !== 'combustao' || deltaHPorTipo(r) < 0);
    },
  });

  const TXT_TERMICO = {
    exo: 'Exotérmica: o sistema liberta energia para o exterior.',
    endo: 'Endotérmica: o sistema absorve energia do exterior.',
    exoAbsorve: 'Exotérmica: o sistema absorve energia do exterior.',
    endoLiberta: 'Endotérmica: o sistema liberta energia para o exterior.',
  };

  registar({
    subtema: 'entalpia', tipo: 'sinal', nome: 'Reação exotérmica ou endotérmica pelo sinal de ΔH',
    formatos: ['escolha', 'vf'], contextos: ['sinal', 'ligacoes'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const r = escolher(rng, REACOES);
        const b = balanco(r);
        const dH = b.dH;
        const exo = dH < 0;
        const eq = '$' + equacaoTex(r) + '$';
        const enunciado = contexto === 'sinal'
          ? 'Para a reação ' + eq + ', $\\Delta H \\approx ' + tex(dH) + kJmol + '$. Como se classifica a reação?'
          : 'Na reação ' + eq + ', quebrar as ligações dos reagentes exige $' + tex(b.Eq) + '\\,\\mathrm{kJ}$ e formar as ligações dos produtos liberta $' + tex(b.Ef) + '\\,\\mathrm{kJ}$. Como se classifica a reação?';
        const resolucao = contexto === 'sinal'
          ? [{ passo: 'Ler o sinal de ΔH', porque: exo ? '$\\Delta H < 0$: os produtos têm menos energia do que os reagentes; a diferença sai do sistema para o exterior. A reação é exotérmica.' : '$\\Delta H > 0$: os produtos têm mais energia do que os reagentes; o sistema recebe essa energia do exterior. A reação é endotérmica.' }]
          : [
            { passo: 'Comparar a energia absorvida com a libertada', porque: 'Quebrar ligações absorve energia; formar ligações liberta energia.', calculo: '\\Delta H \\approx ' + tex(b.Eq) + ' - ' + tex(b.Ef) + ' = ' + tex(dH) + kJmol },
            { passo: 'Classificar', porque: exo ? 'Liberta-se mais energia a formar do que se absorve a quebrar: $\\Delta H < 0$, reação exotérmica.' : 'Absorve-se mais energia a quebrar do que se liberta a formar: $\\Delta H > 0$, reação endotérmica.' },
          ];
        const E = {
          trocou_o_significado_do_sinal: contexto === 'sinal'
            ? (exo ? 'Um $\\Delta H$ negativo quer dizer que os produtos ficam com menos energia: o sistema perde energia para o exterior (exotérmica).' : 'Um $\\Delta H$ positivo quer dizer que os produtos ficam com mais energia: o sistema recebe energia do exterior (endotérmica).')
            : (exo ? 'Formar as ligações liberta mais energia (' + tex(b.Ef) + ' kJ) do que a que se gasta a quebrar (' + tex(b.Eq) + ' kJ): sobra energia libertada, a reação é exotérmica.' : 'Quebrar as ligações gasta mais energia (' + tex(b.Eq) + ' kJ) do que a que se liberta a formar (' + tex(b.Ef) + ' kJ): falta energia, que vem do exterior. É endotérmica.'),
          exotermica_absorve: 'Uma reação exotérmica liberta energia (o exterior aquece); absorver energia do exterior é próprio de uma reação endotérmica.',
          endotermica_liberta: 'Uma reação endotérmica absorve energia do exterior; libertar energia é próprio de uma reação exotérmica.',
        };
        const certa = exo ? TXT_TERMICO.exo : TXT_TERMICO.endo;
        const erros = [
          { codigo: 'trocou_o_significado_do_sinal', texto: exo ? TXT_TERMICO.endo : TXT_TERMICO.exo, explicacao: E.trocou_o_significado_do_sinal },
          { codigo: 'exotermica_absorve', texto: TXT_TERMICO.exoAbsorve, explicacao: E.exotermica_absorve },
          { codigo: 'endotermica_liberta', texto: TXT_TERMICO.endoLiberta, explicacao: E.endotermica_liberta },
        ];
        const dados = { reacao: r.id, contexto };
        const verificacao = { passo: 'Comparar a energia das ligações dos produtos com a dos reagentes', calculo: '\\sum E_{\\text{formadas}} = ' + tex(b.Ef) + (exo ? ' > ' : ' < ') + tex(b.Eq) + ' = \\sum E_{\\text{quebradas}}', valor: null };
        const ex = { enunciado, resolucao, dados, verificacao };
        if (r.esquema) ex.esquema = { id: 'fqa-entalpia', opcoes: { reacao: r.esquema } };
        if (formato === 'escolha') return fecharTexto(rng, ex, certa, erros, certa);
        const frase = (eExo) => (contexto === 'sinal' ? 'Para a reação ' + eq + ', com $\\Delta H \\approx ' + tex(dH) + kJmol + '$, ' : 'Na reação ' + eq + ', em que quebrar as ligações exige $' + tex(b.Eq) + '\\,\\mathrm{kJ}$ e formar as novas liberta $' + tex(b.Ef) + '\\,\\mathrm{kJ}$, ') + 'o sistema ' + (eExo ? 'liberta energia para o exterior (reação exotérmica).' : 'absorve energia do exterior (reação endotérmica).');
        const v = vfDe(rng, frase(exo), frase(!exo), { codigo: 'trocou_o_significado_do_sinal', explicacao: E.trocou_o_significado_do_sinal });
        dados.afirmaExo = v.correta ? exo : !exo;
        delete ex.enunciado;
        return Object.assign(ex, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const exo = deltaHPorTipo(reacao(p.dados.reacao)) < 0;
      if (p.formato === 'vf') return p.correta === (p.dados.afirmaExo === exo);
      return p.opcoes[p.correta] === (exo ? TXT_TERMICO.exo : TXT_TERMICO.endo);
    },
    limites(p) {
      return !!reacao(p.dados.reacao) && deltaHPorTipo(reacao(p.dados.reacao)) !== 0;
    },
  });

  registar({
    subtema: 'entalpia', tipo: 'energia-quantidade', nome: 'Energia libertada ou absorvida para uma dada quantidade',
    formatos: ['numerica', 'escolha'], contextos: ['quantidade', 'massa'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const r = escolher(rng, REACOES);
        const dH = deltaHPorTipo(r);
        const [id, nu] = escolher(rng, r.reag.concat(r.prod));
        const m0 = mol(id);
        const F = '$' + m0.formula + '$';
        const ats = atomosDe(id);
        const M = Q().massaMolar(ats);
        const reagente = r.reag.some((x) => x[0] === id);
        const verbo = dH < 0 ? 'libertada' : 'absorvida';
        let n, dadoTxt, m = null;
        const passos = [];
        if (contexto === 'quantidade') {
          n = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 2.99, 0.01]]);
          dadoTxt = '$' + texAS(n, 3) + '\\,\\mathrm{mol}$ de ' + m0.nome + ', ' + F;
        } else {
          m = valor3AS(rng, [[1, 9.99, 0.01], [10, 49.9, 0.1]]);
          n = m / M;
          dadoTxt = '$' + texAS(m, 3) + '\\,\\mathrm{g}$ de ' + m0.nome + ', ' + F + ' (' + dadosAr(ats) + ')';
          passos.push({ passo: 'Converter a massa em quantidade de matéria', porque: '$n = \\dfrac{m}{M}$, com $M(' + m0.formula + ') = ' + texF(M, 2) + '\\,\\mathrm{g\\,mol^{-1}}$.', calculo: 'n = \\dfrac{' + texAS(m, 3) + '}{' + texF(M, 2) + '} \\approx ' + texAS(n, 4) + '\\,\\mathrm{mol}' });
        }
        const E1 = Math.abs(dH);
        const exato = E1 * n / nu;
        const acao = reagente ? 'reagem ' : 'se formam ';
        const enunciado = 'Para a reação $' + equacaoTex(r) + '$, $\\Delta H \\approx ' + tex(dH) + kJmol + '$ (valor estimado a partir das energias de ligação, para a equação tal como está escrita). Que energia é ' + verbo + ' quando ' + acao + dadoTxt + '?' + AS3;
        const resolucao = passos.concat([
          { passo: 'Ler o que corresponde ao ΔH da equação', porque: 'O valor de $\\Delta H$ refere-se às quantidades da equação: ' + (nu === 1 ? '1 mol' : nu + ' mol') + ' de $' + m0.formula + '$ ' + (nu === 1 ? 'corresponde' : 'correspondem') + ' a ' + fmt(E1) + ' kJ ' + (dH < 0 ? 'libertados' : 'absorvidos') + '.' },
          { passo: 'Proporção direta', porque: 'A energia é proporcional à quantidade que reage ou se forma.', calculo: 'E = \\dfrac{' + texAS(n, contexto === 'massa' ? 4 : 3) + '}{' + nu + '} \\times ' + tex(E1) + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{kJ}' },
        ]);
        if (nu === 1) resolucao[resolucao.length - 1].calculo = 'E = ' + texAS(n, contexto === 'massa' ? 4 : 3) + ' \\times ' + tex(E1) + ' \\approx ' + texAS(exato, 3) + '\\,\\mathrm{kJ}';
        const erros = [];
        if (nu !== 1) {
          erros.push({ codigo: 'esqueceu_o_coeficiente_da_especie', valor: E1 * n, explicacao: 'Multiplicaste $n$ por ' + fmt(E1) + ' kJ e obtiveste ' + txtAS(E1 * n, 3) + ' kJ; mas esse valor corresponde a ' + nu + ' mol de $' + m0.formula + '$ (o coeficiente da equação), por isso divide-se por ' + nu + '.' });
          erros.push({ codigo: 'multiplicou_pelo_coeficiente', valor: E1 * n * nu, explicacao: 'Multiplicaste pelo coeficiente ' + nu + ' e obtiveste ' + txtAS(E1 * n * nu, 3) + ' kJ; ' + nu + ' mol correspondem a ' + fmt(E1) + ' kJ, por isso divide-se.' });
        }
        erros.push({ codigo: 'deu_o_deltah_da_equacao', valor: E1, explicacao: txtAS(E1, 3) + ' kJ é (com três algarismos significativos) a energia para as quantidades da equação; para a quantidade dada faz-se a proporção.' });
        erros.push({ codigo: 'dividiu_o_deltah_pela_quantidade', valor: E1 / n * nu, explicacao: 'Dividiste em vez de multiplicar e obtiveste ' + txtAS(E1 / n * nu, 3) + ' kJ; a energia é proporcional à quantidade: $E = ' + (nu === 1 ? 'n' : '\\dfrac{n}{' + nu + '}') + ' \\times ' + tex(E1) + '$.' });
        if (contexto === 'massa') erros.unshift({ codigo: 'usou_a_massa_em_vez_de_n', valor: E1 * m / nu, explicacao: 'Usaste a massa ($' + texAS(m, 3) + '\\,\\mathrm{g}$) como se fosse a quantidade de matéria e obtiveste ' + txtAS(E1 * m / nu, 3) + ' kJ; primeiro $n = m / M$.' });
        const ex = { enunciado, resolucao, dados: { reacao: r.id, especie: id, n: contexto === 'quantidade' ? n : null, m: contexto === 'massa' ? m : null, contexto } };
        return fechar3(rng, formato, ex, exato, {
          erros, unidade: 'kJ', texto: (v) => '$' + texAS(v, 3) + '\\,\\mathrm{kJ}$',
          verificacao: (rr) => ({ passo: 'Energia por mole da espécie e depois vezes n', calculo: (nu === 1 ? '' : '\\dfrac{' + tex(E1) + '}{' + nu + '} = ') + tex(E1 / nu, 2) + '\\,\\mathrm{kJ\\,mol^{-1}};\\quad ' + tex(E1 / nu, 2) + ' \\times ' + texAS(n, 4) + ' \\approx ' + texAS(rr, 3) + '\\,\\mathrm{kJ}', valor: aAS((E1 / nu) * n, 3) }),
        });
      });
    },
    verificarIndependente(p) {
      const r = reacao(p.dados.reacao);
      const nu = r.reag.concat(r.prod).find((x) => x[0] === p.dados.especie)[1];
      const n = p.dados.contexto === 'quantidade' ? p.dados.n : p.dados.m / massaAtomoAAtomo(atomosDe(p.dados.especie));
      const E = Math.abs(Q().deltaHLigacoes({ quebradas: ligacoesLado(r.reag), formadas: ligacoesLado(r.prod) }).deltaH);
      return confere(p, aAS(n * E / nu, 3), (x) => '$' + texAS(x, 3) + '\\,\\mathrm{kJ}$');
    },
    limites(p) {
      return !!reacao(p.dados.reacao);
    },
  });

  // ================================================================ fotoquimica
  // Átomos e iões (configuração até Z = 23): radical se tiver eletrões desemparelhados.
  const ATOMOS_RADICAIS = [
    { s: 'Cl', iao: ['Cl', -1], molecula: 'Cl_2', gasNobre: 'Ar' },
    { s: 'F', iao: ['F', -1], molecula: 'F_2', gasNobre: 'Ne' },
    { s: 'N', iao: ['N', -3], molecula: 'N_2', gasNobre: 'Ne' },
    { s: 'O', iao: ['O', -2], molecula: 'H_2O', gasNobre: 'Ne' },
    { s: 'H', iao: ['Li', 1], molecula: 'H_2', gasNobre: 'He' },
  ];
  // Moléculas e iões poliatómicos: [LaTeX, nome, elementos (com repetição), carga].
  const POLIATOMICAS = {
    NO: ['NO', 'monóxido de nitrogénio', ['N', 'O'], 0], NO2: ['NO_2', 'dióxido de nitrogénio', ['N', 'O', 'O'], 0],
    ClO: ['ClO', 'monóxido de cloro', ['Cl', 'O'], 0], HO: ['HO', 'hidroxilo', ['H', 'O'], 0],
    OHm: ['OH^-', 'ião hidróxido', ['O', 'H'], -1], NO3m: ['NO_3^-', 'ião nitrato', ['N', 'O', 'O', 'O'], -1],
    H2O: ['H_2O', 'água', ['H', 'H', 'O'], 0], O3: ['O_3', 'ozono', ['O', 'O', 'O'], 0], CO2: ['CO_2', 'dióxido de carbono', ['C', 'O', 'O'], 0],
  };
  const nEletroes = (k) => soma(POLIATOMICAS[k][2].map((s) => el(s).z)) - POLIATOMICAS[k][3];
  const cargaTxt = (q) => (q === 0 ? '' : '^{' + (Math.abs(q) === 1 ? '' : Math.abs(q)) + (q > 0 ? '+' : '-') + '}');

  registar({
    subtema: 'fotoquimica', tipo: 'radicais', nome: 'Identificar radicais livres (eletrões desemparelhados)',
    formatos: ['escolha', 'vf'], contextos: ['atomos', 'moleculas'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const resolucaoBase = { passo: 'Lembrar a definição', porque: 'Um radical livre é uma espécie com eletrões desemparelhados; por isso é muito reativo.' };
        if (contexto === 'atomos') {
          const a = escolher(rng, ATOMOS_RADICAIS.filter((x) => formato === 'vf' || x.s !== 'H'));
          const z = el(a.s).z;
          const cfg = Q().configuracao(z);
          const spd = (c) => c.spd.replace(/(\d)([spd])\^(\d+)/g, '\\mathrm{$1$2}^{$3}').replace(/ /g, '\\,');
          const [si, qi] = a.iao;
          const cfgI = Q().configuracao(el(si).z, qi);
          const certa = '$\\mathrm{' + a.s + '}$ (átomo isolado)';
          const erros = [
            { codigo: 'confundiu_iao_com_radical', texto: '$\\mathrm{' + si + cargaTxt(qi) + '}$', explicacao: 'Ter carga não faz de uma espécie um radical. O $\\mathrm{' + si + cargaTxt(qi) + '}$ tem ' + (el(si).z - qi) + ' eletrões, todos emparelhados ($' + spd(cfgI) + '$).' },
            { codigo: 'confundiu_molecula_com_radical', texto: '$\\mathrm{' + a.molecula + '}$', explicacao: 'Na molécula $\\mathrm{' + a.molecula + '}$ os eletrões desemparelhados dos átomos formaram pares ligantes: todos os eletrões estão emparelhados.' },
            { codigo: 'achou_radical_qualquer_atomo_isolado', texto: '$\\mathrm{' + a.gasNobre + '}$ (átomo isolado)', explicacao: 'Nem todos os átomos isolados são radicais: o ' + nomeEl(a.gasNobre) + ' tem todos os subníveis completos, sem eletrões desemparelhados.' },
          ];
          const resolucao = [resolucaoBase, { passo: 'Escrever a configuração e procurar eletrões desemparelhados', porque: 'O átomo de ' + nomeEl(a.s) + ' tem ' + plural(cfg.desemparelhados, 'eletrão desemparelhado', 'eletrões desemparelhados') + ': é um radical, $\\mathrm{' + a.s + '}^{\\bullet}$.', calculo: '\\mathrm{' + a.s + '}\\colon\\ ' + spd(cfg) }];
          const dados = { contexto, atomo: a.s };
          const verificacao = { passo: 'Contar os eletrões desemparelhados nas orbitais', calculo: '\\text{desemparelhados: } ' + cfg.desemparelhados, valor: null };
          if (formato === 'escolha') {
            return fecharTexto(rng, { enunciado: 'Qual destas espécies é um radical livre?', resolucao, dados, verificacao, esquema: { id: 'fqa-configuracao', opcoes: { z } } }, certa, erros, certa);
          }
          const e = escolher(rng, erros);
          const frase = (t) => 'A espécie ' + t + ' é um radical livre.';
          const v = vfDe(rng, frase(certa), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
          dados.afirmado = v.correta ? a.s : e.texto;
          return Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
        }
        const RADS = ['NO', 'NO2', 'ClO', 'HO'];
        const k = escolher(rng, RADS);
        const P = POLIATOMICAS[k];
        const t = (x) => '$\\mathrm{' + POLIATOMICAS[x][0] + '}$';
        const contaTex = (x) => POLIATOMICAS[x][2].map((s) => el(s).z).join(' + ') + (POLIATOMICAS[x][3] ? ' + ' + -POLIATOMICAS[x][3] : '') + ' = ' + nEletroes(x);
        const iao = k === 'HO' ? 'OHm' : 'NO3m';
        const erros = [
          { codigo: 'confundiu_iao_com_radical', texto: t(iao), explicacao: 'Ter carga não faz de uma espécie um radical. O ' + t(iao) + ' tem ' + nEletroes(iao) + ' eletrões (número par), todos emparelhados.' },
          { codigo: 'achou_o_ozono_um_radical', texto: t('O3'), explicacao: 'O ozono é muito reativo, mas não é um radical: tem ' + nEletroes('O3') + ' eletrões (número par), todos emparelhados.' },
          { codigo: 'achou_radical_uma_molecula_estavel', texto: t(k === 'HO' ? 'H2O' : 'CO2'), explicacao: 'A molécula ' + t(k === 'HO' ? 'H2O' : 'CO2') + ' tem ' + nEletroes(k === 'HO' ? 'H2O' : 'CO2') + ' eletrões (número par), todos emparelhados: não é um radical.' },
        ];
        const certa = t(k);
        const resolucao = [resolucaoBase, { passo: 'Contar os eletrões da espécie', porque: 'Com um número ímpar de eletrões, pelo menos um fica desemparelhado. O ' + P[1] + ' tem ' + nEletroes(k) + ' eletrões: é um radical, $\\mathrm{' + P[0] + '}^{\\bullet}$.', calculo: contaTex(k) }];
        const dados = { contexto, especie: k, opcoes: [k, iao, 'O3', k === 'HO' ? 'H2O' : 'CO2'] };
        const verificacao = { passo: 'Número de eletrões ímpar', calculo: nEletroes(k) + ' = 2 \\times ' + (nEletroes(k) - 1) / 2 + ' + 1', valor: null };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado: 'Qual destas espécies é um radical livre?', resolucao, dados, verificacao }, certa, erros, certa);
        const e = escolher(rng, erros);
        const frase = (x) => 'A espécie ' + x + ' é um radical livre.';
        const v = vfDe(rng, frase(certa), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmado = v.correta ? k : dados.opcoes.find((x) => t(x) === e.texto);
        return Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      if (p.dados.contexto === 'atomos') {
        const a = p.dados.atomo;
        const radical = Q().configuracao(el(a).z).desemparelhados > 0;
        if (p.formato === 'vf') return p.correta === (p.dados.afirmado === a && radical);
        return radical && p.opcoes[p.correta].startsWith('$\\mathrm{' + a + '}$');
      }
      const impar = (x) => nEletroes(x) % 2 === 1;
      if (p.formato === 'vf') return p.correta === impar(p.dados.afirmado);
      const radicais = p.dados.opcoes.filter(impar);
      return radicais.length === 1 && p.opcoes[p.correta] === '$\\mathrm{' + POLIATOMICAS[radicais[0]][0] + '}$';
    },
    limites(p) {
      return p.dados.contexto === 'atomos' ? el(p.dados.atomo).z <= 23 : !!POLIATOMICAS[p.dados.especie];
    },
  });

  // Fotão capaz de quebrar uma ligação: energia por molécula e comprimento de onda máximo.
  const LIG_FOTO = ['O=O', 'Cl-Cl', 'C-Cl', 'Br-Br', 'H-H', 'N≡N', 'H-Cl', 'F-F', 'I-I', 'C-H'];
  const NM = 1e9;

  registar({
    subtema: 'fotoquimica', tipo: 'foton-ligacao', nome: 'Energia e comprimento de onda do fotão que quebra uma ligação',
    formatos: ['numerica', 'escolha'], contextos: ['energia', 'lambda'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const k = escolher(rng, LIG_FOTO);
        const E = D().ligacoes[k].energia;
        const { h, c, NA } = K();
        const Em = E * 1000 / NA;
        const L = '$' + ligTex(k) + '$';
        const dadosK = '$N_A = ' + cient(NA, 3) + '\\,\\mathrm{mol^{-1}}$, $h = ' + cient(h, 3) + '\\,\\mathrm{J\\,s}$, $c = ' + cient(c, 3) + '\\,\\mathrm{m\\,s^{-1}}$';
        const passoJ = { passo: 'Passar a energia de ligação a joules por molécula', porque: 'A energia de ligação refere-se a uma mole de ligações: multiplica-se por 1000 (kJ → J) e divide-se por $N_A$.', calculo: 'E = \\dfrac{' + E + ' \\times 10^{3}}{' + cient(NA, 3) + '} \\approx ' + cient(Em, 4) + '\\,\\mathrm{J}' };
        if (contexto === 'energia') {
          const ex = {
            enunciado: 'A energia da ligação ' + L + ' é $' + E + '\\,\\mathrm{kJ\\,mol^{-1}}$. Qual é a energia mínima de um fotão capaz de quebrar a ligação numa só molécula (' + dadosK.split(', $h')[0] + ')?' + AS3,
            resolucao: [passoJ],
            dados: { ligacao: k, contexto },
          };
          const erros = [
            { codigo: 'nao_dividiu_por_na', valor: E * 1000, explicacao: '$' + cient(E * 1000, 3) + '\\,\\mathrm{J}$ é a energia para uma mole de ligações; para uma molécula divide-se pela constante de Avogadro.' },
            { codigo: 'nao_converteu_kj_em_j', valor: E / NA, explicacao: 'Não converteste kJ em J e obtiveste $' + cient(E / NA, 3) + '$; a energia de ligação está em kJ/mol, por isso multiplica-se por 1000.' },
            { codigo: 'dividiu_por_1000_em_vez_de_multiplicar', valor: E / 1000 / NA, explicacao: 'Dividiste por 1000 ao passar de kJ a J e obtiveste $' + cient(E / 1000 / NA, 3) + '\\,\\mathrm{J}$; o joule é a unidade menor, por isso $1\\,\\mathrm{kJ} = 1000\\,\\mathrm{J}$ e multiplica-se.' },
          ];
          return fechar3(rng, formato, ex, Em, {
            erros, unidade: 'J', texto: (v) => '$' + cient(v, 3) + '\\,\\mathrm{J}$',
            verificacao: (r) => ({ passo: 'Voltar à energia por mole', calculo: cient(r, 3) + ' \\times ' + cient(NA, 3) + ' \\approx ' + texAS(r * NA, 3) + '\\,\\mathrm{J\\,mol^{-1}}', valor: aAS(E / (NA / 1000), 3) }),
          });
        }
        const lam = h * c / Em;
        const exato = lam * NM;
        const zona = Q().zonaEspectro(lam);
        const ZONA = { UV: 'ultravioleta', visivel: 'visível', IV: 'infravermelho', X: 'raios X' };
        const ex = {
          enunciado: 'A energia da ligação ' + L + ' é $' + E + '\\,\\mathrm{kJ\\,mol^{-1}}$. Qual é o comprimento de onda máximo, em nanómetros, de um fotão capaz de quebrar essa ligação numa molécula (' + dadosK + ')?' + AS3,
          resolucao: [
            passoJ,
            { passo: 'Calcular o comprimento de onda', porque: 'O fotão tem de ter pelo menos essa energia: $E = \\dfrac{hc}{\\lambda}$, logo $\\lambda = \\dfrac{hc}{E}$ (a energia maior corresponde a $\\lambda$ menor; por isso este é o $\\lambda$ máximo).', calculo: '\\lambda = \\dfrac{' + cient(h, 3) + ' \\times ' + cient(c, 3) + '}{' + cient(Em, 4) + '} \\approx ' + cient(lam, 4) + '\\,\\mathrm{m}' },
            { passo: 'Passar a nanómetros', porque: '$1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$. É radiação ' + (ZONA[zona] || zona) + '.', calculo: '\\lambda \\approx ' + texAS(exato, 3) + '\\,\\mathrm{nm}' },
          ],
          dados: { ligacao: k, contexto },
          esquema: { id: 'fqa-espectro', opcoes: { lambda: lam } },
        };
        const erros = [
          { codigo: 'nao_converteu_kj_em_j', valor: exato * 1000, explicacao: 'Não converteste kJ em J e obtiveste ' + txtAS(exato * 1000, 3) + ' nm, mil vezes mais; a energia por molécula é $' + cient(Em, 3) + '\\,\\mathrm{J}$.' },
          { codigo: 'deu_lambda_em_metros', valor: lam, explicacao: '$' + cient(lam, 3) + '$ é o comprimento de onda em metros; em nanómetros multiplica-se por $10^{9}$.' },
          { codigo: 'deu_a_frequencia', valor: Em / h, explicacao: '$' + cient(Em / h, 3) + '$ é a frequência do fotão, $f = E / h$, em hertz; o comprimento de onda é $\\lambda = c / f$, e em nanómetros.' },
        ];
        return fechar3(rng, formato, ex, exato, {
          erros, unidade: 'nm', texto: (v) => txtAS(v, 3).replace(/\$$/, '\\,\\mathrm{nm}$'),
          verificacao: (r) => ({ passo: 'Usar a energia por mole: $\\lambda = h\\,c\\,N_A / E$', calculo: '\\lambda = \\dfrac{' + cient(h, 3) + ' \\times ' + cient(c, 3) + ' \\times ' + cient(NA, 3) + '}{' + E + ' \\times 10^{3}} \\approx ' + texAS(r, 3) + '\\,\\mathrm{nm}', valor: aAS(Q().lambdaParaQuebrarLigacao(E) * NM, 3) }),
        });
      });
    },
    verificarIndependente(p) {
      const E = D().ligacoes[p.dados.ligacao].energia;
      const { h, c, NA } = K();
      if (p.dados.contexto === 'energia') return confere(p, aAS(E * 1e3 / NA, 3), (x) => '$' + cient(x, 3) + '\\,\\mathrm{J}$');
      return confere(p, aAS(h * c * NA / (E * 1e3) * NM, 3), (x) => txtAS(x, 3).replace(/\$$/, '\\,\\mathrm{nm}$'));
    },
    limites(p) {
      return LIG_FOTO.includes(p.dados.ligacao);
    },
  });

  // Equações do ozono e do ciclo do cloro: reagentes, produtos e se há um fotão (hν) nos reagentes.
  const EQ_OZONO = {
    fotolise_o2: { reag: ['O_2'], prod: ['2\\,O'], luz: true },
    formacao: { reag: ['O', 'O_2'], prod: ['O_3'], luz: false },
    fotolise_o3: { reag: ['O_3'], prod: ['O_2', 'O'], luz: true },
    o_mais_o3: { reag: ['O', 'O_3'], prod: ['2\\,O_2'], luz: false },
    cl_o3: { reag: ['Cl^{\\bullet}', 'O_3'], prod: ['ClO^{\\bullet}', 'O_2'], luz: false },
    clo_o: { reag: ['ClO^{\\bullet}', 'O'], prod: ['Cl^{\\bullet}', 'O_2'], luz: false },
    cfc: { reag: ['CCl_2F_2'], prod: ['CClF_2^{\\bullet}', 'Cl^{\\bullet}'], luz: true },
  };
  const eqTex = (k) => {
    const q = EQ_OZONO[k];
    return '$\\mathrm{' + q.reag.join(' + ') + '}' + (q.luz ? ' + h\\nu' : '') + ' \\longrightarrow \\mathrm{' + q.prod.join(' + ') + '}$';
  };
  // Cada pergunta: o que se pede, a equação certa, e os erros [equação, código, explicação].
  const PERGUNTAS_OZONO = {
    estratosfera: [
      { id: 'formacao', pede: 'a formação de ozono na estratosfera', certa: 'formacao', erros: [
        { eq: 'fotolise_o3', codigo: 'trocou_formacao_com_decomposicao', explicacao: 'Essa equação é a decomposição do ozono pela radiação UV: o $\\mathrm{O_3}$ está nos reagentes. Na formação, o $\\mathrm{O_3}$ é o produto.' },
        { eq: 'fotolise_o2', codigo: 'confundiu_com_a_fotolise_do_o2', explicacao: 'Essa equação forma oxigénio atómico a partir de $\\mathrm{O_2}$ e luz UV; é o passo anterior. O ozono forma-se quando esse O se junta a uma molécula de $\\mathrm{O_2}$.' },
        { eq: 'cl_o3', codigo: 'confundiu_com_a_destruicao_pelo_cloro', explicacao: 'Essa equação é a destruição do ozono por um radical cloro (o $\\mathrm{O_3}$ é reagente).' },
      ] },
      { id: 'decomposicao', pede: 'a decomposição do ozono pela radiação ultravioleta', certa: 'fotolise_o3', erros: [
        { eq: 'formacao', codigo: 'trocou_formacao_com_decomposicao', explicacao: 'Essa equação é a formação do ozono: o $\\mathrm{O_3}$ é o produto. Na decomposição pela luz, o $\\mathrm{O_3}$ absorve um fotão e parte-se.' },
        { eq: 'o_mais_o3', codigo: 'esqueceu_o_foton', explicacao: 'Essa equação destrói ozono, mas por reação com oxigénio atómico, sem luz. A decomposição pela radiação UV tem um fotão ($h\\nu$) nos reagentes.' },
        { eq: 'fotolise_o2', codigo: 'confundiu_o2_com_o3', explicacao: 'Nessa equação é o $\\mathrm{O_2}$ que se parte com a luz UV, não o ozono.' },
      ] },
      { id: 'oxigenio', pede: 'a quebra das moléculas de oxigénio pela radiação ultravioleta', certa: 'fotolise_o2', erros: [
        { eq: 'fotolise_o3', codigo: 'confundiu_o2_com_o3', explicacao: 'Nessa equação é o ozono, $\\mathrm{O_3}$, que se parte com a luz UV, não o $\\mathrm{O_2}$.' },
        { eq: 'formacao', codigo: 'trocou_formacao_com_decomposicao', explicacao: 'Essa equação junta O e $\\mathrm{O_2}$ para formar ozono; não quebra o $\\mathrm{O_2}$.' },
        { eq: 'cfc', codigo: 'confundiu_com_a_fotolise_dos_cfc', explicacao: 'Essa equação é a quebra de uma ligação C–Cl de um CFC pela luz UV, não a do $\\mathrm{O_2}$.' },
      ] },
    ],
    cloro: [
      { id: 'destruicao', pede: 'a destruição de uma molécula de ozono por um radical cloro', certa: 'cl_o3', erros: [
        { eq: 'clo_o', codigo: 'confundiu_com_a_regeneracao_do_cloro', explicacao: 'Essa equação regenera o radical cloro (o $\\mathrm{Cl}^{\\bullet}$ é produto); o ozono não entra nela.' },
        { eq: 'cfc', codigo: 'confundiu_com_a_fotolise_dos_cfc', explicacao: 'Essa equação liberta o radical cloro a partir de um CFC; o ozono não entra nela.' },
        { eq: 'fotolise_o3', codigo: 'esqueceu_o_papel_do_cloro', explicacao: 'Essa equação é a decomposição natural do ozono pela luz, sem cloro.' },
      ] },
      { id: 'regeneracao', pede: 'a regeneração do radical cloro no ciclo de destruição do ozono', certa: 'clo_o', erros: [
        { eq: 'cl_o3', codigo: 'confundiu_com_a_destruicao_pelo_cloro', explicacao: 'Nessa equação o radical cloro é consumido (é reagente): é a destruição do ozono, não a regeneração do $\\mathrm{Cl}^{\\bullet}$.' },
        { eq: 'cfc', codigo: 'confundiu_com_a_fotolise_dos_cfc', explicacao: 'Essa equação forma o radical cloro pela primeira vez, a partir de um CFC; a regeneração acontece no fim de cada ciclo, a partir do $\\mathrm{ClO}^{\\bullet}$.' },
        { eq: 'o_mais_o3', codigo: 'deu_o_balanco_do_ciclo', explicacao: 'Essa é a equação global (o balanço) do ciclo; o cloro não aparece porque é regenerado, mas pedia-se o passo em que isso acontece.' },
      ] },
      { id: 'cfc', pede: 'a libertação de radicais cloro a partir de um CFC, na estratosfera', certa: 'cfc', erros: [
        { eq: 'cl_o3', codigo: 'confundiu_com_a_destruicao_pelo_cloro', explicacao: 'Nessa equação o radical cloro já existe e destrói ozono; não é a sua libertação a partir do CFC.' },
        { eq: 'clo_o', codigo: 'confundiu_com_a_regeneracao_do_cloro', explicacao: 'Essa equação regenera o radical cloro a partir do $\\mathrm{ClO}^{\\bullet}$; não envolve o CFC.' },
        { eq: 'fotolise_o2', codigo: 'confundiu_com_a_fotolise_do_o2', explicacao: 'Essa equação quebra o $\\mathrm{O_2}$ com a luz UV; não envolve o CFC.' },
      ] },
    ],
  };
  // Predicados pela estrutura da equação (verificação independente do mapa de respostas).
  const tem = (l, x) => l.some((y) => y.replace(/^\d\\,/, '') === x);
  const PREDICADO = {
    formacao: (q) => tem(q.prod, 'O_3') && !tem(q.reag, 'O_3'),
    decomposicao: (q) => q.luz && tem(q.reag, 'O_3'),
    oxigenio: (q) => q.luz && q.reag.length === 1 && tem(q.reag, 'O_2'),
    destruicao: (q) => tem(q.reag, 'Cl^{\\bullet}') && tem(q.reag, 'O_3'),
    regeneracao: (q) => tem(q.prod, 'Cl^{\\bullet}') && tem(q.reag, 'ClO^{\\bullet}'),
    cfc: (q) => q.luz && tem(q.reag, 'CCl_2F_2'),
  };

  registar({
    subtema: 'fotoquimica', tipo: 'ozono', nome: 'Equações da formação e da decomposição do ozono',
    formatos: ['escolha', 'vf'], contextos: ['estratosfera', 'cloro'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const pq = escolher(rng, PERGUNTAS_OZONO[contexto]);
        const certa = eqTex(pq.certa);
        const erros = pq.erros.map((x) => ({ codigo: x.codigo, texto: eqTex(x.eq), explicacao: x.explicacao, eq: x.eq }));
        const resolucao = [
          { passo: 'Ver o que se pede', porque: 'Pede-se ' + pq.pede + '.' },
          { passo: 'Escolher pelos reagentes e pelos produtos', porque: {
            formacao: 'O ozono forma-se quando um átomo de oxigénio (vindo da quebra do $\\mathrm{O_2}$ pela luz UV) se junta a uma molécula de $\\mathrm{O_2}$: o $\\mathrm{O_3}$ é produto.',
            decomposicao: 'O ozono absorve radiação UV ($h\\nu$) e parte-se em $\\mathrm{O_2}$ e O: o $\\mathrm{O_3}$ e o fotão são reagentes. É assim que a camada de ozono filtra a radiação UV.',
            oxigenio: 'A radiação UV mais energética parte o $\\mathrm{O_2}$ em dois átomos de oxigénio.',
            destruicao: 'O radical cloro reage com o ozono e forma $\\mathrm{ClO}^{\\bullet}$ e $\\mathrm{O_2}$.',
            regeneracao: 'O $\\mathrm{ClO}^{\\bullet}$ reage com oxigénio atómico e devolve o $\\mathrm{Cl}^{\\bullet}$, que volta a destruir ozono (atua como catalisador).',
            cfc: 'A radiação UV quebra uma ligação C–Cl do CFC e liberta um radical cloro.',
          }[pq.id] },
        ];
        const dados = { contexto, pergunta: pq.id, equacoes: {} };
        [pq.certa].concat(pq.erros.map((e) => e.eq)).forEach((k) => { dados.equacoes[chave(eqTex(k))] = k; });
        const verificacao = { passo: 'Confirmar pelos reagentes, pelos produtos e pela presença do fotão', calculo: '\\text{' + (EQ_OZONO[pq.certa].luz ? 'com' : 'sem') + ' fotão nos reagentes}', valor: null };
        if (formato === 'escolha') return fecharTexto(rng, { enunciado: 'Que equação traduz ' + pq.pede + '?', resolucao, dados, verificacao }, certa, erros, certa);
        const e = escolher(rng, erros);
        const frase = (t) => 'A equação ' + t + ' traduz ' + pq.pede + '.';
        const v = vfDe(rng, frase(certa), frase(e.texto), { codigo: e.codigo, explicacao: e.explicacao });
        dados.afirmada = v.correta ? pq.certa : e.eq;
        return Object.assign({ resolucao, dados }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const pred = PREDICADO[p.dados.pergunta];
      if (p.formato === 'vf') return p.correta === pred(EQ_OZONO[p.dados.afirmada]);
      const ok = p.opcoes.map((o) => pred(EQ_OZONO[p.dados.equacoes[chave(o)]]));
      return ok.filter(Boolean).length === 1 && ok[p.correta];
    },
    limites(p) {
      return !!PREDICADO[p.dados.pergunta];
    },
  });
})();
