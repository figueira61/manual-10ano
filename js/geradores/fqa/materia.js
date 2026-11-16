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
          confundiu_ligacao_com_interacao_intermolecular: '' + (tipo === 'ionica'
            ? 'A ligação de hidrogénio é uma interação entre moléculas, com H ligado a N, O ou F. ' + F + ' não é formado por moléculas: é uma rede de iões (ligação iónica).'
            : 'A ligação de hidrogénio é uma interação entre moléculas diferentes. Dentro de cada molécula, os átomos de ' + nomeEl('H') + ' e de ' + nomeEl(outro) + ' partilham pares de eletrões: ligação covalente.'),
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
        const e = escolher(rng, erros.filter((x) => !/A conclusão está certa/.test(x.explicacao)));
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
        const frase = (p, q) => 'O ponto de ebulição do ' + nomeF(p) + ' é mais elevado do que o do ' + nomeF(q) + '.';
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
})();
