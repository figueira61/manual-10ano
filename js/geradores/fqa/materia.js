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
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);

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
  const NOME_TIPO = { covalente: 'Covalente', ionica: 'Iónica', metalica: 'Metálica', hidrogenio: 'Ligação de hidrogénio' };
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
        // Escolha: só iónicos e covalentes com H (cada opção errada é um erro típico real); vf: todos.
        const lista = formato === 'escolha'
          ? SUBST_LIGACAO.filter((x) => x[3] === 'ionica' || (x[3] === 'covalente' && x[2].includes('H')))
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
          confundiu_ligacao_com_interacao_intermolecular: tipo === 'ionica'
            ? 'A ligação de hidrogénio é uma interação entre moléculas, com H ligado a N, O ou F. ' + F + ' não é formado por moléculas: é uma rede de iões (ligação iónica).'
            : 'A ligação de hidrogénio é uma interação entre moléculas diferentes. Dentro de cada molécula, os átomos de ' + nomeEl('H') + ' e de ' + nomeEl(outro) + ' partilham pares de eletrões: ligação covalente.',
          ionica_entre_nao_metais: 'Para haver ligação iónica é preciso um metal que ceda eletrões. ' + (els.length === 1 ? 'Os dois átomos de ' + nomeEl(els[0]) + ' são iguais e não metálicos' : 'O ' + nomeEl(els[0]) + ' e o ' + nomeEl(els[1]) + ' são não metais') + ': partilham pares de eletrões, numa ligação covalente.',
          tomou_o_hidrogenio_por_metal: 'O hidrogénio está no grupo 1, mas não é um metal: com o ' + nomeEl(outro) + ' partilha pares de eletrões, numa ligação covalente. A ligação metálica é entre átomos de metais.',
          covalente_entre_atomos_iguais: 'Átomos iguais partilham pares de eletrões quando são de um não metal (como no $\\mathrm{Cl_2}$). O ' + nomeEl(els[0]) + ' é um metal: os eletrões de valência ficam deslocalizados por uma rede de catiões (ligação metálica).',
        };
        const errosPorTipo = {
          ionica: [['covalente', 'covalente_entre_metal_e_nao_metal'], ['metalica', 'metalica_por_ter_um_metal'], ['hidrogenio', 'confundiu_ligacao_com_interacao_intermolecular']],
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
            { codigo: 'contou_eletroes_em_vez_de_pares', valor: 2 * Pn, explicacao: 'Obtiveste ' + 2 * Pn + ', que é o número de eletrões não ligantes; cada par tem 2 eletrões, por isso há ' + Pn + ' pares.' },
            { codigo: 'somou_pares_ligantes_e_nao_ligantes', valor: Pl + Pn, explicacao: 'Obtiveste ' + (Pl + Pn) + ', que é o total de pares de valência (' + Pl + ' ligantes + ' + Pn + ' não ligantes); pedia-se só os não ligantes: ' + Pn + '.' },
            { codigo: 'deu_os_pares_ligantes', valor: Pl, explicacao: Pl + ' é o número de pares ligantes (os traços da fórmula de estrutura); os não ligantes são os ' + Pn + ' que sobram.' },
          ];
          if (centrais.length && paresCentrais !== Pn) erros.push({ codigo: 'contou_so_os_pares_do_atomo_central', valor: paresCentrais, explicacao: 'Obtiveste ' + paresCentrais + ' porque contaste só os pares não ligantes do átomo central; os átomos das pontas (exceto o H) também têm pares não ligantes: no total são ' + Pn + '.' });
          verificacao = { passo: 'Completar o octeto átomo a átomo (H com 2 eletrões)', calculo: m.atomos.map((a) => a.pares).join(' + ') + ' = ' + Pn, valor: naoLigantesPeloOcteto(id) };
        } else if (contexto === 'ligantes') {
          resposta = Pl;
          figuraEnunciado = { id: 'fqa-molecula', opcoes: { molecula: id, modo: 'estrutura' } };
          enunciado = 'A figura mostra a fórmula de estrutura da molécula ' + F + '. Quantos pares de eletrões ligantes tem a molécula?';
          resolucao = [passoPl];
          erros = [
            { codigo: 'contou_eletroes_em_vez_de_pares', valor: 2 * Pl, explicacao: 'Obtiveste ' + 2 * Pl + ', que é o número de eletrões ligantes; cada par tem 2 eletrões, por isso há ' + Pl + ' pares ligantes.' },
          ];
          if (multiplas) erros.push({ codigo: 'contou_ligacoes_em_vez_de_pares', valor: nLig, explicacao: 'Contaste ' + nLig + ' ligações, mas uma ligação dupla tem 2 pares ligantes e uma tripla tem 3: são ' + Pl + ' pares.' });
          if (Pn > 0) {
            erros.push({ codigo: 'somou_pares_ligantes_e_nao_ligantes', valor: Pl + Pn, explicacao: 'Obtiveste ' + (Pl + Pn) + ', que é o total de pares de valência (' + Pl + ' ligantes + ' + Pn + ' não ligantes); os ligantes são só os ' + Pl + ' partilhados entre átomos.' });
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
})();
