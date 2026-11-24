globalThis.Manual = globalThis.Manual || {};

// Geradores de Física e Química A — Química, tema «Elementos químicos e sua organização».
// Subtemas: atomo, mole, espectros, configuracao, tabela-periodica (ids <subtema>-<tipo>).
// Os valores químicos (massas atómicas, isótopos, raios, energias de ionização, constantes) vêm só de
// Manual.dadosQuimicos; os cálculos de Manual.quimica. verificarIndependente e a verificação usam outro caminho
// (contagens, conversões em dois passos, desvios a uma massa de referência, dados da Tabela Periódica…).
// Manual.dadosQuimicos e Manual.quimica só são lidos dentro de gerar (no index.html carregam depois deste ficheiro).
(function () {
  const G = Manual.geradores;
  const A = G.ajudas;
  const D = () => Manual.dadosQuimicos;
  const Q = () => Manual.quimica;
  const K = () => Manual.dadosQuimicos.constantes;
  const inteiro = (rng, a, b) => Manual.aleatorio.inteiro(rng, a, b);
  const baralhar = (rng, l) => Manual.aleatorio.baralhar(rng, l);
  const escolher = (rng, l) => l[inteiro(rng, 0, l.length - 1)];
  const soma = (l) => l.reduce((s, v) => s + v, 0);
  const { fmt, tex, fechar, fecharTexto, confere, vfDe, chave } = A;
  const tentar = (construir) => A.tentar(construir, 'elementos');
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  // Concordância com o número: pl(1, 'eletrão', 'eletrões') = '1 eletrão'.
  const pl = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  const PROT = ['protão', 'protões'];
  const NEUT = ['neutrão', 'neutrões'];
  const ELET = ['eletrão', 'eletrões'];

  function registar(def) {
    G.registar(Object.assign({ disciplina: 'fqa', tema: 'elementos', id: def.subtema + '-' + def.tipo }, def));
  }

  // ---------------------------------------------------------------- números
  // «pm» escreve-se em duas caixas: a palavra solta «pm» é tomada pelo verificador por um \pm sem barra.
  const PM = '\\mathrm{p}\\mathrm{m}';
  const cient = (x, as) => Manual.formatar.cientifico(x, as);
  // Valor arredondado a k algarismos significativos.
  const aAS = (v, k) => Number(Number(v).toPrecision(k));
  // O arredondamento a k algarismos significativos fica a meio de dois valores (ambíguo): o gerador re-sorteia.
  function ambiguo(v, k) {
    const e = Math.floor(Math.log10(Math.abs(v)));
    const s = Math.abs(v) / Math.pow(10, e - k + 1);
    return Math.abs(s - Math.floor(s) - 0.5) < 1e-6;
  }
  const meioCasa = (v, casas) => {
    const s = Math.abs(v) * Math.pow(10, casas);
    return Math.abs(s - Math.floor(s) - 0.5) < 1e-6;
  };
  const rCasas = (v, casas) => Math.round(v * Math.pow(10, casas)) / Math.pow(10, casas) + 0;
  // Número com k algarismos significativos em LaTeX: decimal, ou notação científica se for muito grande ou pequeno.
  function texAS(v, k) {
    if (v === 0) return '0';
    const t = Math.abs(v).toPrecision(k);
    if (/e/.test(t) || Math.abs(v) >= 1e4 || Math.abs(v) < 1e-3) return cient(v, k);
    return (v < 0 ? '-' : '') + t.replace('.', '{,}');
  }
  // O mesmo em texto corrido (vírgula decimal).
  const txtAS = (v, k) => '$' + texAS(v, k) + '$';
  // Notação científica com os algarismos que o número tem (25 → 2,5; 145 → 1,45; 100 → 1).
  function cientMin(v) {
    const m = Math.abs(v).toExponential(12).split('e')[0].replace(/\.?0+$/, '');
    const as = m.replace('.', '').replace(/^0+/, '').length;
    return cient(v, Math.max(1, as));
  }
  // Número com um número fixo de casas decimais (mantém os zeros finais): em LaTeX e em texto.
  const texF = (v, casas) => (v < 0 ? '-' : '') + Math.abs(v).toFixed(casas).replace('.', '{,}');
  const fx = (v, casas) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(casas).replace('.', ',');
  const igualOuAprox = (exato, mostrado) => (Math.abs(exato - mostrado) <= 1e-12 * Math.max(1, Math.abs(exato)) ? ' = ' : ' \\approx ');

  // ---------------------------------------------------------------- elementos, espécies e notações
  const el = (s) => D().elementos[s];
  const simboloDeZ = (z) => Object.keys(D().elementos).find((s) => D().elementos[s].z === z);
  const nome = (s) => el(s).nome.toLowerCase();
  const cargaTex = (q) => (q === 0 ? '' : '^{' + (Math.abs(q) === 1 ? '' : Math.abs(q)) + (q > 0 ? '+' : '-') + '}');
  const especie = (s, q = 0) => '\\mathrm{' + s + cargaTex(q) + '}';
  const nuclideo = (s, a, z, q = 0) => '{}^{' + a + '}_{' + z + '}' + especie(s, q);
  // Carga do ião mais provável (grupos 1, 2, 13 e 15–17 dos períodos 2 e 3; o cobre forma Cu²⁺); null se não há ião simples.
  function cargaTipica(s) {
    const e = el(s);
    if (s === 'H' || e.grupo === 18) return null;
    if (s === 'Cu') return 2;
    if (e.grupo <= 2) return e.grupo;
    if (e.grupo === 13 && s !== 'B') return 3;
    if (e.grupo >= 15 && e.grupo <= 17 && e.periodo <= 3) return e.grupo - 18;
    return null;
  }

  // ================================================================ atomo
  // Isótopos dos dados (Manual.dadosQuimicos.isotopos): só átomos reais.
  const isotoposDe = (s) => D().isotopos[s];
  const ELEMENTOS_ISO = () => Object.keys(D().isotopos);

  registar({
    subtema: 'atomo', tipo: 'particulas', nome: 'Protões, neutrões, eletrões e número de massa',
    formatos: ['numerica', 'escolha'], contextos: ['neutroes', 'eletroes', 'numero-massa'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const comIao = ELEMENTOS_ISO().filter((s) => cargaTipica(s) !== null);
        const s = escolher(rng, contexto === 'neutroes' ? ELEMENTOS_ISO() : comIao);
        const z = el(s).z;
        const a = escolher(rng, isotoposDe(s)).a;
        const n = a - z;
        const qT = cargaTipica(s);
        const q = contexto === 'eletroes' ? qT : (qT !== null && rng() < 0.5 ? qT : 0);
        const e = z - q;
        const tipoEsp = q === 0 ? 'o átomo' : 'o ião';
        const notacao = nuclideo(s, a, z, q);
        let enunciado, resolucao, resposta, erros, verificacao;
        if (contexto === 'neutroes') {
          resposta = n;
          enunciado = 'Quantos neutrões tem ' + tipoEsp + ' $' + notacao + '$?';
          resolucao = [
            { passo: 'Ler A e Z na notação', porque: 'Em ${}^{A}_{Z}\\mathrm{X}$, o número de cima é o número de massa $A$ (protões + neutrões) e o de baixo é o número atómico $Z$ (protões).', calculo: 'A = ' + a + ',\\ Z = ' + z },
            { passo: 'Subtrair Z a A', porque: 'Os neutrões são os nucleões que não são protões' + (q === 0 ? '.' : '; a carga do ião só muda o número de eletrões, não o de neutrões.'), calculo: 'N = A - Z = ' + a + ' - ' + z + ' = ' + n },
          ];
          erros = [
            { codigo: 'deu_o_numero_de_massa', valor: a, explicacao: a + ' é o número de massa (protões + neutrões). Os neutrões são $' + a + ' - ' + z + ' = ' + n + '$.' },
            { codigo: 'deu_o_numero_atomico', valor: z, explicacao: z + ' é o número atómico, o número de protões. Os neutrões são $A - Z = ' + a + ' - ' + z + ' = ' + n + '$.' },
            { codigo: 'somou_a_com_z', valor: a + z, explicacao: 'Somaste $A$ e $Z$ ($' + a + ' + ' + z + ' = ' + (a + z) + '$); os neutrões obtêm-se subtraindo: $' + a + ' - ' + z + ' = ' + n + '$.' },
          ];
          if (q !== 0) erros.push({ codigo: 'aplicou_a_carga_aos_neutroes', valor: n - q, explicacao: 'Obtiveste ' + (n - q) + ' porque aplicaste a carga do ião aos neutrões. A carga só muda o número de eletrões: $N = ' + a + ' - ' + z + ' = ' + n + '$.' });
          verificacao = { passo: 'Confirmar que protões mais neutrões dá o número de massa', calculo: 'Z + N = ' + z + ' + ' + n + ' = ' + a + ' = A', valor: a - z };
        } else if (contexto === 'eletroes') {
          resposta = e;
          const perdeu = q > 0;
          const qa = Math.abs(q);
          enunciado = 'Quantos eletrões tem o ião $' + notacao + '$?';
          resolucao = [
            { passo: 'Ler o número de protões', porque: 'O número atómico $Z$ (em baixo) é o número de protões; o átomo neutro tem tantos eletrões como protões.', calculo: 'Z = ' + z },
            { passo: perdeu ? 'Tirar os eletrões perdidos' : 'Somar os eletrões ganhos', porque: 'A carga ' + (perdeu ? 'positiva' : 'negativa') + ' $' + qa + (perdeu ? '+' : '-') + '$ indica que o átomo ' + (perdeu ? 'perdeu ' : 'ganhou ') + qa + ' eletr' + (qa === 1 ? 'ão' : 'ões') + ' (carga = protões − eletrões).', calculo: 'e = ' + z + (perdeu ? ' - ' : ' + ') + qa + ' = ' + e },
          ];
          erros = [
            { codigo: 'trocou_o_sinal_da_carga', valor: z + q, explicacao: 'Obtiveste ' + (z + q) + ': ' + (perdeu ? 'somaste a carga aos eletrões, mas um catião perdeu eletrões' : 'tiraste eletrões, mas um anião ganhou eletrões') + ', por isso tem $' + z + (perdeu ? ' - ' : ' + ') + qa + ' = ' + e + '$.' },
            { codigo: 'ignorou_a_carga', valor: z, explicacao: z + ' é o número de eletrões do átomo neutro; o ião ' + (perdeu ? 'perdeu ' : 'ganhou ') + qa + ', por isso tem ' + e + '.' },
            { codigo: 'deu_o_numero_de_neutroes', valor: n, explicacao: n + ' é o número de neutrões ($' + a + ' - ' + z + '$); os eletrões contam-se a partir dos protões e da carga: ' + e + '.' },
            { codigo: 'subtraiu_a_carga_ao_numero_de_massa', valor: a - q, explicacao: 'Partiste do número de massa (' + a + ') e obtiveste ' + (a - q) + '; os eletrões contam-se a partir do número de protões, $Z = ' + z + '$.' },
          ];
          verificacao = { passo: 'Confirmar a carga: protões menos eletrões', calculo: z + ' - ' + e + ' = ' + (q > 0 ? q : '-' + qa), valor: z - q };
        } else {
          resposta = a;
          const ehIao = q !== 0;
          enunciado = 'Um' + (ehIao ? ' ião' : ' átomo') + ' de ' + nome(s) + ' tem ' + pl(z, ...PROT) + ', ' + pl(n, ...NEUT) + ' e ' + pl(e, ...ELET) + '. Qual é o seu número de massa?';
          resolucao = [
            { passo: 'Somar protões e neutrões', porque: 'O número de massa $A$ conta os nucleões (protões e neutrões); os eletrões não contam' + (ehIao ? ', e a carga do ião também não muda $A$.' : '.'), calculo: 'A = Z + N = ' + z + ' + ' + n + ' = ' + a },
          ];
          erros = [
            { codigo: 'somou_os_eletroes', valor: z + n + e, explicacao: 'Somaste também os eletrões ($' + z + ' + ' + n + ' + ' + e + ' = ' + (z + n + e) + '$); o número de massa só conta protões e neutrões: ' + a + '.' },
            { codigo: 'deu_o_numero_de_neutroes', valor: n, explicacao: n + ' é o número de neutrões; o número de massa soma-lhe os ' + z + ' protões: ' + a + '.' },
            { codigo: 'subtraiu_em_vez_de_somar', valor: Math.abs(n - z), explicacao: 'Subtraíste ($' + Math.max(n, z) + ' - ' + Math.min(n, z) + ' = ' + Math.abs(n - z) + '$); o número de massa é a soma dos protões com os neutrões: ' + a + '.' },
          ];
          if (ehIao) erros.push({ codigo: 'somou_eletroes_e_neutroes', valor: e + n, explicacao: 'Somaste os eletrões aos neutrões ($' + e + ' + ' + n + ' = ' + (e + n) + '$); num ião o número de eletrões é diferente do de protões, e $A$ soma os protões: ' + a + '.' });
          erros = erros.filter((x) => x.valor > 0);
          verificacao = { passo: 'Confirmar com a notação do nuclídeo', calculo: notacao + ':\\ N = A - Z = ' + a + ' - ' + z + ' = ' + n, valor: z + n };
        }
        return fechar(rng, formato, {
          enunciado, resolucao, dados: { simbolo: s, a, carga: q, contexto },
          esquema: { id: 'fqa-atomo', opcoes: { z, a, carga: q } },
        }, { resposta, tolerancia: 0, texto: (v) => fmt(v), erros, verificacao });
      });
    },
    verificarIndependente(p) {
      const { simbolo, a, carga, contexto } = p.dados;
      // Z lido da Tabela Periódica dos dados; contagem a partir da carga e do número de massa.
      const z = D().elementos[simbolo].z;
      const v = contexto === 'neutroes' ? a - z : contexto === 'eletroes' ? z - carga : z + (a - z);
      return confere(p, v, (x) => fmt(x));
    },
    limites(p) {
      const { simbolo, a, carga } = p.dados;
      return !!D().isotopos[simbolo] && D().isotopos[simbolo].some((i) => i.a === a) && (carga === 0 || carga === cargaTipica(simbolo));
    },
  });

  // Isótopos: mesmo Z, A diferente. Distratores: mesmo A (outro elemento), mesmo N (outro elemento), ião do mesmo átomo.
  const descreverParticulas = (x) => pl(x.z, ...PROT) + ', ' + pl(x.a - x.z, ...NEUT) + ' e ' + pl(x.z - x.q, ...ELET);
  function textoEspecie(x, contexto) {
    return contexto === 'notacao' ? '$' + nuclideo(simboloDeZ(x.z), x.a, x.z, x.q) + '$' : maiuscula(descreverParticulas(x));
  }

  registar({
    subtema: 'atomo', tipo: 'isotopos', nome: 'Identificar isótopos',
    formatos: ['escolha', 'vf'], contextos: ['notacao', 'particulas'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const candidatos = ELEMENTOS_ISO().filter((s) => s !== 'H' && (formato === 'vf' || cargaTipica(s) !== null));
        const s = escolher(rng, candidatos);
        const z = el(s).z;
        const [i1, i2] = baralhar(rng, isotoposDe(s)).slice(0, 2);
        const alvo = { z, a: i1.a, q: 0 };
        const outro = { z, a: i2.a, q: 0 };
        const n1 = alvo.a - z;
        const zA = z + (rng() < 0.5 ? 1 : -1);
        const zN = z + (rng() < 0.5 ? 1 : -1);
        if (zA < 1 || zN < 1) return null;
        const isobaro = { z: zA, a: alvo.a, q: 0 };
        const isotono = { z: zN, a: zN + n1, q: 0 };
        if (isobaro.a - isobaro.z < 1) return null;
        // Só nuclídeos que existem (estáveis ou radioativos com meia-vida ≥ 1 min, dos dados): nada de ⁸Be ou ¹⁸N.
        const existe = (x) => [D().nuclideosEstaveis, D().nuclideosRadioativos].some((l) => (l[simboloDeZ(x.z)] || []).includes(x.a));
        if (!existe(isobaro) || !existe(isotono)) return null;
        const t = (x) => textoEspecie(x, contexto);
        const desc = (x) => (contexto === 'notacao' ? '$' + nuclideo(simboloDeZ(x.z), x.a, x.z, x.q) + '$' : 'A espécie com ' + descreverParticulas(x));
        const resolucao = [
          { passo: 'Lembrar a definição', porque: 'Isótopos são átomos do mesmo elemento, isto é, com o mesmo número atómico $Z$ (mesmo número de protões), mas com números de massa diferentes (números de neutrões diferentes).' },
          { passo: 'Comparar o número de protões', porque: 'Só conta o número de protões: o número de massa e o de neutrões têm de ser diferentes, e um ião é o mesmo átomo com eletrões a mais ou a menos.', calculo: 'Z_1 = ' + z + ',\\ A_1 = ' + alvo.a + ';\\quad Z_2 = ' + z + ',\\ A_2 = ' + outro.a },
        ];
        const dados = { contexto, alvo, outro, especies: {} };
        if (formato === 'escolha') {
          const q = cargaTipica(s);
          const iao = { z, a: alvo.a, q };
          const enunciado = contexto === 'notacao'
            ? 'Qual destas espécies é um isótopo de $' + nuclideo(s, alvo.a, z) + '$?'
            : 'Um átomo tem ' + descreverParticulas(alvo) + '. Qual destas espécies é um isótopo desse átomo?';
          const erros = [
            { codigo: 'mesmo_numero_de_massa', texto: t(isobaro), explicacao: desc(isobaro) + ' tem o mesmo número de massa (' + alvo.a + '), mas ' + isobaro.z + ' protões: é de outro elemento (' + simboloDeZ(isobaro.z) + '). Isótopos têm o mesmo número de protões.' },
            { codigo: 'isotopos_com_os_mesmos_neutroes', texto: t(isotono), explicacao: desc(isotono) + ' tem o mesmo número de neutrões (' + n1 + '), mas ' + isotono.z + ' protões: é de outro elemento. Isótopos têm o mesmo número de protões e neutrões diferentes.' },
            { codigo: 'confundiu_iao_com_isotopo', texto: t(iao), explicacao: desc(iao) + ' tem os mesmos protões e neutrões: é o mesmo átomo, que ' + (q > 0 ? 'perdeu' : 'ganhou') + ' eletrões (um ião), não outro isótopo.' },
          ];
          [alvo, outro, isobaro, isotono, iao].forEach((x) => { dados.especies[chave(t(x))] = x; });
          const certa = t(outro);
          return fecharTexto(rng, {
            enunciado, resolucao, dados,
            verificacao: { passo: 'Confirmar que tem o mesmo Z e um A diferente', calculo: 'Z = ' + z + ',\\ A = ' + outro.a + ' \\neq ' + alvo.a, valor: null },
            esquema: { id: 'fqa-atomo', opcoes: { z, a: outro.a, carga: 0 } },
          }, certa, erros, certa);
        }
        const falso = rng() < 0.5 ? isobaro : isotono;
        const par = (x) => (contexto === 'notacao'
          ? 'Os átomos $' + nuclideo(s, alvo.a, z) + '$ e $' + nuclideo(simboloDeZ(x.z), x.a, x.z) + '$ são isótopos.'
          : 'Um átomo com ' + z + ' protões e ' + n1 + ' neutrões e um átomo com ' + x.z + ' protões e ' + (x.a - x.z) + ' neutrões são isótopos.');
        const erroFalso = falso === isobaro
          ? { codigo: 'mesmo_numero_de_massa', explicacao: 'Os dois têm o mesmo número de massa (' + alvo.a + '), mas números de protões diferentes (' + z + ' e ' + falso.z + '): são de elementos diferentes, não são isótopos.' }
          : { codigo: 'isotopos_com_os_mesmos_neutroes', explicacao: 'Os dois têm ' + n1 + ' neutrões, mas números de protões diferentes (' + z + ' e ' + falso.z + '): são de elementos diferentes. Isótopos têm o mesmo número de protões.' };
        const v = vfDe(rng, par(outro), par(falso), erroFalso);
        const segundo = v.correta ? outro : falso;
        dados.par = [alvo, segundo];
        return Object.assign({ resolucao: resolucao.slice(0, 1).concat([{
          passo: 'Comparar o número de protões', porque: v.correta ? 'Os dois têm ' + z + ' protões e números de massa diferentes: são isótopos.' : 'Têm números de protões diferentes (' + z + ' e ' + segundo.z + '): são átomos de elementos diferentes.',
          calculo: 'Z_1 = ' + z + ',\\ Z_2 = ' + segundo.z,
        }]), dados }, v, {
          verificacao: { passo: 'Confirmar pelo símbolo químico: o mesmo Z dá o mesmo elemento', calculo: '\\mathrm{' + s + '}' + (v.correta ? ' = ' : ' \\neq ') + '\\mathrm{' + simboloDeZ(segundo.z) + '}', valor: v.correta },
        });
      });
    },
    verificarIndependente(p) {
      if (p.formato === 'vf') {
        const [x, y] = p.dados.par;
        return p.correta === (simboloDeZ(x.z) === simboloDeZ(y.z) && x.a !== y.a);
      }
      const ok = p.opcoes.map((o) => {
        const x = p.dados.especies[chave(o)];
        return !!x && x.z === p.dados.alvo.z && x.a !== p.dados.alvo.a && x.q === 0;
      });
      return ok.filter(Boolean).length === 1 && ok[p.correta];
    },
    limites(p) {
      const { alvo, outro } = p.dados;
      const s = simboloDeZ(alvo.z);
      return [alvo, outro].every((x) => D().isotopos[s].some((i) => i.a === x.a));
    },
  });

  registar({
    subtema: 'atomo', tipo: 'escala', nome: 'Escala atómica: pm, nm e m',
    formatos: ['numerica', 'escolha'], contextos: ['nm', 'm'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const comRaio = Object.keys(D().elementos).filter((s) => el(s).raio !== undefined);
        const s = escolher(rng, comRaio);
        const r = el(s).raio;
        const pede = contexto === 'nm' ? 'em nanómetros' : 'em metros, em notação científica';
        const enunciado = 'O raio atómico do ' + nome(s) + ' é $' + r + '\\,' + PM + '$. Exprime-o ' + pede + ' ($1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$ e $1\\,' + PM + ' = 10^{-12}\\,\\mathrm{m}$).';
        if (contexto === 'nm') {
          const v = r / 1000;
          const t = (x) => '$' + tex(x, 6) + '\\,\\mathrm{nm}$';
          return fechar(rng, formato, {
            enunciado,
            resolucao: [
              { passo: 'Relacionar o nanómetro com o picómetro', porque: 'Como $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$ e $1\\,' + PM + ' = 10^{-12}\\,\\mathrm{m}$, um nanómetro tem mil picómetros.', calculo: '1\\,\\mathrm{nm} = 1000\\,' + PM },
              { passo: 'Dividir por 1000', porque: 'O nanómetro é a unidade maior, por isso o número fica menor.', calculo: r + '\\,' + PM + ' = \\dfrac{' + r + '}{1000}\\,\\mathrm{nm} = ' + tex(v, 6) + '\\,\\mathrm{nm}' },
            ],
            dados: { simbolo: s, r },
          }, {
            resposta: v, toleranciaRelativa: 0.0005 / v, unidade: 'nm', texto: t, // relativa: o erro «micrómetros» vale perto de 0
            erros: [
              { codigo: 'dividiu_por_100', valor: r / 100, explicacao: 'Dividiste por 100 e obtiveste ' + fmt(r / 100, 6) + ' nm; $1\\,\\mathrm{nm} = 1000\\,' + PM + '$, por isso divide-se por 1000: ' + fmt(v, 6) + ' nm.' },
              { codigo: 'multiplicou_em_vez_de_dividir', valor: r * 1000, explicacao: 'Multiplicaste por 1000 e obtiveste ' + fmt(r * 1000) + ' nm; o nanómetro é a unidade maior, por isso o número fica menor: ' + fmt(v, 6) + ' nm.' },
              { codigo: 'confundiu_nm_com_micrometro', valor: r / 1e6, explicacao: 'Obtiveste ' + fmt(r / 1e6, 8) + ', que é o valor em micrómetros ($1\\,\\mu\\mathrm{m} = 10^{-6}\\,\\mathrm{m}$). Em nanómetros divide-se por 1000: ' + fmt(v, 6) + ' nm.' },
            ],
            verificacao: { passo: 'Converter em dois passos, passando pelo metro', calculo: r + ' \\times 10^{-12}\\,\\mathrm{m} = ' + cientMin(r * 1e-12) + '\\,\\mathrm{m} = \\dfrac{' + cientMin(r * 1e-12) + '}{10^{-9}}\\,\\mathrm{nm} = ' + tex(v, 6) + '\\,\\mathrm{nm}', valor: v },
          });
        }
        const v = r * 1e-12;
        const t = (x) => '$' + cientMin(x) + '\\,\\mathrm{m}$';
        const e = Math.floor(Math.log10(r));
        const mant = r / Math.pow(10, e);
        const errado = mant * Math.pow(10, -12 - e);
        return fechar(rng, formato, {
          enunciado,
          resolucao: [
            { passo: 'Substituir o prefixo pela potência de 10', porque: 'O prefixo pico (p) vale $10^{-12}$.', calculo: r + '\\,' + PM + ' = ' + r + ' \\times 10^{-12}\\,\\mathrm{m}' },
            { passo: 'Passar a notação científica', porque: 'A mantissa fica entre 1 e 10: deslocar a vírgula ' + e + (e === 1 ? ' casa' : ' casas') + ' para a esquerda soma ' + e + ' ao expoente.', calculo: r + ' \\times 10^{-12} = ' + cientMin(mant) + ' \\times 10^{' + e + '} \\times 10^{-12} = ' + cientMin(v) + '\\,\\mathrm{m}' },
          ],
          dados: { simbolo: s, r },
        }, {
          resposta: v, toleranciaRelativa: 0.005, unidade: 'm', texto: t,
          erros: [
            { codigo: 'confundiu_pm_com_nm', valor: r * 1e-9, explicacao: 'Usaste $10^{-9}$ e obtiveste $' + cientMin(r * 1e-9) + '\\,\\mathrm{m}$; esse é o fator do nanómetro. O picómetro é $10^{-12}\\,\\mathrm{m}$: $' + cientMin(v) + '\\,\\mathrm{m}$.' },
            { codigo: 'trocou_o_sinal_do_expoente', valor: r * 1e12, explicacao: 'Obtiveste $' + cientMin(r * 1e12) + '\\,\\mathrm{m}$, com o expoente positivo; um átomo é minúsculo, por isso o expoente é negativo: $' + cientMin(v) + '\\,\\mathrm{m}$.' },
            { codigo: 'errou_o_expoente_na_notacao_cientifica', valor: errado, explicacao: 'Obtiveste $' + cientMin(errado) + '\\,\\mathrm{m}$: ao passar $' + r + ' \\times 10^{-12}$ a notação científica, a vírgula andou para a esquerda e o expoente tinha de aumentar (de $-12$ para $' + (-12 + e) + '$), não diminuir.' },
          ],
          verificacao: { passo: 'Converter em dois passos, passando pelo nanómetro', calculo: r + '\\,' + PM + ' = ' + tex(r / 1000, 6) + '\\,\\mathrm{nm} = ' + tex(r / 1000, 6) + ' \\times 10^{-9}\\,\\mathrm{m} = ' + cientMin(v) + '\\,\\mathrm{m}', valor: (r / 1000) * 1e-9 },
        });
      });
    },
    verificarIndependente(p) {
      const r = D().elementos[p.dados.simbolo].raio;
      const nm = r / 1000;
      return p.contexto === 'nm'
        ? confere(p, nm, (x) => '$' + tex(x, 6) + '\\,\\mathrm{nm}$')
        : confere(p, nm * 1e-9, (x) => '$' + cientMin(x) + '\\,\\mathrm{m}$');
    },
    limites(p) {
      return p.dados.r >= 25 && p.dados.r <= 220;
    },
  });

  // Figura explodida do átomo (fig-atomo) em modo exercício: as partes pela ordem da figura (números 1 a 5).
  const PARTES_ATOMO = [
    { id: 'nuvem', art: 'a nuvem eletrónica', nome: 'Nuvem eletrónica', desc: 'Região à volta do núcleo onde é provável encontrar os eletrões.', pista: 'é a região tracejada que envolve tudo', carga: 'q < 0', codigo: 'confundiu_com_a_nuvem_eletronica', confusoes: ['eletrao', 'nucleo', 'protao'] },
    { id: 'nucleo', art: 'o núcleo', nome: 'Núcleo', desc: 'Parte central, muito pequena e densa, que contém os protões e os neutrões.', pista: 'é o círculo central que contém as partículas mais pesadas', carga: 'q > 0', codigo: 'confundiu_com_o_nucleo', confusoes: ['protao', 'neutrao', 'nuvem'] },
    { id: 'protao', art: 'o protão', nome: 'Protão', desc: 'Partícula do núcleo com carga elétrica positiva.', pista: 'é o círculo cheio, com o sinal +, dentro do núcleo', carga: 'q = +e', codigo: 'confundiu_com_o_protao', confusoes: ['neutrao', 'nucleo', 'eletrao'] },
    { id: 'neutrao', art: 'o neutrão', nome: 'Neutrão', desc: 'Partícula do núcleo sem carga elétrica.', pista: 'é o círculo vazio, sem sinal, dentro do núcleo', carga: 'q = 0', codigo: 'confundiu_com_o_neutrao', confusoes: ['protao', 'nucleo', 'eletrao'] },
    { id: 'eletrao', art: 'o eletrão', nome: 'Eletrão', desc: 'Partícula com carga elétrica negativa, de massa muito menor do que a do protão.', pista: 'é um dos pontos pequenos fora do núcleo', carga: 'q = -e', codigo: 'confundiu_com_o_eletrao', confusoes: ['nuvem', 'protao', 'neutrao'] },
  ];
  const parte = (id) => PARTES_ATOMO.find((x) => x.id === id);

  registar({
    subtema: 'atomo', tipo: 'figura', nome: 'Partes do átomo na figura',
    formatos: ['escolha'], contextos: ['nome', 'descricao'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        const i = inteiro(rng, 0, PARTES_ATOMO.length - 1);
        const c = PARTES_ATOMO[i];
        const num = i + 1;
        const campo = contexto === 'nome' ? 'nome' : 'desc';
        const enunciado = 'Na figura do átomo (sem escala), uma das partes está assinalada com o número ' + num + '. '
          + (contexto === 'nome' ? 'Que parte está assinalada?' : 'Qual das descrições corresponde à parte assinalada?');
        const erros = c.confusoes.map((id) => {
          const w = parte(id);
          const inicio = contexto === 'nome'
            ? maiuscula(w.art) + ' ' + w.pista + ', não é a parte assinalada.'
            : 'Essa é a descrição d' + w.art + ', que ' + w.pista + '.';
          return { codigo: w.codigo, texto: w[campo], explicacao: inicio + ' A parte ' + num + ' ' + c.pista + ': é ' + c.art + '.' };
        });
        return fecharTexto(rng, {
          enunciado,
          figuraEnunciado: { id: 'fig-atomo', opcoes: { modo: 'exercicio', destacar: c.id } },
          resolucao: [
            { passo: 'Observar a parte assinalada', porque: 'A parte ' + num + ' ' + c.pista + '.' },
            { passo: 'Identificar a parte', porque: c.nome + ': ' + c.desc.charAt(0).toLowerCase() + c.desc.slice(1) },
          ],
          dados: { destacar: c.id, numero: num, contexto },
          verificacao: { passo: 'Confirmar pela carga elétrica da parte assinalada', calculo: c.carga, valor: null },
          esquema: { id: 'fig-atomo' },
        }, c[campo], erros, c[campo]);
      });
    },
    verificarIndependente(p) {
      // Pela ordem das partes na figura (o número do enunciado) e não pelo id destacado.
      const n = Number((p.enunciado.match(/número (\d)/) || [])[1]);
      const c = PARTES_ATOMO[n - 1];
      if (!c || c.id !== p.figuraEnunciado.opcoes.destacar) return false;
      return p.opcoes[p.correta] === (p.dados.contexto === 'nome' ? c.nome : c.desc);
    },
    limites(p) {
      return p.figuraEnunciado.id === 'fig-atomo' && p.figuraEnunciado.opcoes.modo === 'exercicio' && PARTES_ATOMO.some((x) => x.id === p.dados.destacar);
    },
  });

  // ================================================================ mole
  const casasDe = (v) => {
    const t = String(v);
    return t.includes('.') ? t.split('.')[1].length : 0;
  };
  const txt = (v, casas) => fmt(v, casas === undefined ? casasDe(v) : casas);
  const Ar = (s) => texF(el(s).massaAtomica, 2);

  registar({
    subtema: 'mole', tipo: 'massa-atomica', nome: 'Massa atómica relativa e abundâncias',
    formatos: ['numerica', 'escolha'], contextos: ['dois', 'tres', 'abundancia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const lista = contexto === 'tres' ? ['O', 'Ne', 'Mg'] : contexto === 'dois' ? ['H', 'Li', 'B', 'C', 'N', 'Cl', 'Cu'] : ['Li', 'B', 'Cl', 'Cu'];
        const s = escolher(rng, lista);
        const isos = isotoposDe(s).map((i) => ({ a: i.a, m: rCasas(i.massa, 4), x: i.abundancia }));
        const k = isos.length;
        const sup = (i) => '${}^{' + i.a + '}\\mathrm{' + s + '}$';
        // Casas decimais iguais em todas as massas (4) e em todas as abundâncias do elemento (10,00 % ao lado de 78,99 %).
        const casasAb = Math.max(...isos.map((i) => casasDe(i.x)));
        const listaIsos = isos.map((i) => sup(i) + ' (massa isotópica relativa ' + fx(i.m, 4) + (contexto === 'abundancia' ? ')' : ' e abundância ' + fx(i.x, casasAb) + ' %)'));
        const juntar = (l) => l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];
        const esquema = { id: 'fqa-isotopos', opcoes: { elemento: s } };
        if (contexto !== 'abundancia') {
          const produtos = isos.map((i) => i.m * i.x);
          const exato = soma(produtos) / 100;
          if (meioCasa(exato, 2)) return null;
          const resposta = rCasas(exato, 2);
          const maisAbundante = isos.reduce((b, i) => (i.x > b.x ? i : b));
          const inv = isos.slice().reverse();
          const enunciado = 'O ' + nome(s) + ' tem ' + (k === 2 ? 'dois' : 'três') + ' isótopos estáveis: ' + juntar(listaIsos) + '. Calcula a massa atómica relativa do ' + nome(s) + ', com duas casas decimais.';
          const r2 = (v) => rCasas(v, 2);
          const mediaSimples = r2(soma(isos.map((i) => i.m)) / k);
          const trocado = r2(soma(isos.map((i, j) => i.m * inv[j].x)) / 100);
          const comA = r2(soma(isos.map((i) => i.a * i.x)) / 100);
          const soMais = r2(maisAbundante.m);
          const semDividir = r2(soma(produtos));
          const erros = [
            { codigo: 'media_simples_sem_abundancias', valor: mediaSimples, explicacao: 'Fizeste a média simples das massas isotópicas (' + fx(mediaSimples, 2) + '). É preciso pesar cada massa pela sua abundância: o ' + sup(maisAbundante) + ' é o mais abundante, por isso a média fica perto da sua massa.' },
            { codigo: 'trocou_as_abundancias', valor: trocado, explicacao: 'Associaste as abundâncias aos isótopos pela ordem inversa e obtiveste ' + fx(trocado, 2) + '; cada massa multiplica-se pela abundância do seu próprio isótopo.' },
            { codigo: 'usou_so_o_isotopo_mais_abundante', valor: soMais, explicacao: fx(soMais, 2) + ' é só a massa do isótopo mais abundante (' + sup(maisAbundante) + '); os outros isótopos também contam, cada um com a sua abundância.' },
            { codigo: 'usou_os_numeros_de_massa', valor: comA, explicacao: 'Usaste os números de massa (' + isos.map((i) => i.a).join(', ') + ') em vez das massas isotópicas relativas e obtiveste ' + fx(comA, 2) + '.' },
          ];
          if (formato === 'numerica') erros.push({ codigo: 'nao_dividiu_por_100', valor: semDividir, explicacao: 'Não dividiste por 100 (' + fx(semDividir, 2) + '); as abundâncias estão em percentagem, por isso a soma dos produtos divide-se por 100.' });
          const ref = maisAbundante;
          const desvio = ref.m + soma(isos.map((i) => (i.m - ref.m) * i.x)) / 100;
          return fechar(rng, formato, {
            enunciado,
            resolucao: [
              { passo: 'Multiplicar cada massa isotópica pela sua abundância', porque: 'A massa atómica relativa é a média das massas isotópicas pesada pelas abundâncias (percentagem de átomos de cada isótopo).', calculo: isos.map((i) => tex(i.m, 4) + ' \\times ' + tex(i.x, 4) + igualOuAprox(i.m * i.x, rCasas(i.m * i.x, 2)) + tex(i.m * i.x, 2)).join(';\\quad '), bloco: true },
              { passo: 'Somar e dividir por 100', porque: 'As abundâncias somam 100 %.', calculo: 'A_r(\\mathrm{' + s + '}) = \\dfrac{' + isos.map((i) => tex(i.m * i.x, 2)).join(' + ') + '}{100}' + igualOuAprox(exato, resposta) + texF(resposta, 2), bloco: true },
            ],
            dados: { simbolo: s, isos }, esquema,
          }, {
            resposta, tolerancia: 0.005, texto: (v) => '$' + texF(v, 2) + '$', erros,
            verificacao: { passo: 'Calcular pelos desvios à massa do isótopo mais abundante', calculo: 'A_r = ' + tex(ref.m, 4) + ' + \\dfrac{' + isos.filter((i) => i !== ref).map((i) => '(' + tex(i.m - ref.m, 4) + ') \\times ' + tex(i.x, 4)).join(' + ') + '}{100}' + igualOuAprox(desvio, rCasas(desvio, 2)) + texF(rCasas(desvio, 2), 2), valor: rCasas(desvio, 2) },
          });
        }
        // Abundância a partir da massa atómica relativa da Tabela Periódica.
        const ArTP = el(s).massaAtomica;
        const [i1, i2] = isos;
        const pedido = rng() < 0.5 ? 0 : 1;
        const ip = isos[pedido];
        const io = isos[1 - pedido];
        const exato = 100 * (ArTP - io.m) / (ip.m - io.m);
        if (meioCasa(exato, 1)) return null;
        const resposta = rCasas(exato, 1);
        const outroIso = rCasas(100 - exato, 1);
        const comA = rCasas(100 * (ArTP - io.a) / (ip.a - io.a), 1);
        const fracao = rCasas(exato / 100, 3);
        const enunciado = 'O ' + nome(s) + ' tem dois isótopos estáveis: ' + juntar(listaIsos) + '. A massa atómica relativa do ' + nome(s) + ' é $' + Ar(s) + '$. Calcula a abundância do isótopo ' + sup(ip) + ', em percentagem, com uma casa decimal.';
        const erros = [
          { codigo: 'deu_a_abundancia_do_outro_isotopo', valor: outroIso, explicacao: fx(outroIso, 1) + ' % é a abundância do outro isótopo (' + sup(io) + '); a de ' + sup(ip) + ' é ' + fx(resposta, 1) + ' %.' },
          { codigo: 'usou_os_numeros_de_massa', valor: comA, explicacao: 'Usaste os números de massa (' + i1.a + ' e ' + i2.a + ') em vez das massas isotópicas relativas e obtiveste ' + fx(comA, 1) + ' %.' },
          { codigo: 'deu_a_fracao_em_vez_da_percentagem', valor: fracao, explicacao: fx(fracao, 3) + ' é a fração de átomos; em percentagem multiplica-se por 100: ' + fx(resposta, 1) + ' %.' },
        ].filter((e) => e.valor > 0 && e.valor < 100);
        const x = 'x';
        const verificado = (ip.m * resposta + io.m * (100 - resposta)) / 100;
        const textoPct = (v) => (v < 1 ? fx(v, 3) : fx(v, 1)) + ' %';
        return fechar(rng, formato, {
          enunciado,
          resolucao: [
            { passo: 'Escrever a média pesada com a abundância desconhecida', porque: 'Se ' + sup(ip) + ' tem abundância $' + x + '$ (em %), o outro isótopo tem $100 - ' + x + '$.', calculo: texF(ArTP, 2) + ' = \\dfrac{' + tex(ip.m, 4) + x + ' + ' + tex(io.m, 4) + '(100 - ' + x + ')}{100}', bloco: true },
            { passo: 'Resolver em ordem a x', porque: 'Multiplica-se por 100 e juntam-se os termos em $' + x + '$.', calculo: x + ' = \\dfrac{100 \\times (' + texF(ArTP, 2) + ' - ' + tex(io.m, 4) + ')}{' + tex(ip.m, 4) + ' - ' + tex(io.m, 4) + '}' + igualOuAprox(exato, resposta) + texF(resposta, 1) + '\\,\\%', bloco: true },
          ],
          dados: { simbolo: s, isos, pedido }, esquema,
        }, {
          resposta, tolerancia: 0.05, unidade: '%', texto: textoPct, erros,
          verificacao: { passo: 'Substituir a abundância na média pesada', calculo: '\\dfrac{' + tex(ip.m, 4) + ' \\times ' + texF(resposta, 1) + ' + ' + tex(io.m, 4) + ' \\times ' + texF(100 - resposta, 1) + '}{100} \\approx ' + texF(verificado, 2), valor: rCasas(100 * (io.m - ArTP) / (io.m - ip.m), 1) },
        });
      });
    },
    verificarIndependente(p) {
      const { simbolo, isos, pedido } = p.dados;
      if (p.contexto === 'abundancia') {
        const ip = isos[pedido];
        const io = isos[1 - pedido];
        const ArTP = D().elementos[simbolo].massaAtomica;
        // Fração pelo outro isótopo: 1 − (Ar − mp)/(mo − mp).
        const v = rCasas(100 * (1 - (ArTP - ip.m) / (io.m - ip.m)), 1);
        return confere(p, v, (x) => (x < 1 ? fx(x, 3) : fx(x, 1)) + ' %');
      }
      // Média pesada com as abundâncias normalizadas pela sua soma (Manual.quimica).
      const v = rCasas(Q().massaAtomicaMedia(isos.map((i) => ({ massa: i.m, abundancia: i.x }))), 2);
      return confere(p, v, (x) => '$' + texF(x, 2) + '$');
    },
    limites(p) {
      return !!D().isotopos[p.dados.simbolo];
    },
  });

  // Substâncias (fórmula química: índices de cada elemento, pela ordem em que se escrevem).
  const SUBSTANCIAS = [
    { f: [['H', 2], ['O', 1]], nome: 'água', molecular: true },
    { f: [['C', 1], ['O', 2]], nome: 'dióxido de carbono', molecular: true },
    { f: [['N', 1], ['H', 3]], nome: 'amoníaco', molecular: true },
    { f: [['C', 1], ['H', 4]], nome: 'metano', molecular: true },
    { f: [['S', 1], ['O', 2]], nome: 'dióxido de enxofre', molecular: true },
    { f: [['C', 2], ['H', 6], ['O', 1]], nome: 'etanol', molecular: true },
    { f: [['C', 6], ['H', 12], ['O', 6]], nome: 'glicose', molecular: true },
    { f: [['H', 2], ['S', 1], ['O', 4]], nome: 'ácido sulfúrico', molecular: true },
    { f: [['C', 3], ['H', 8]], nome: 'propano', molecular: true },
    { f: [['O', 2]], nome: 'oxigénio', molecular: true },
    { f: [['N', 2]], nome: 'nitrogénio', molecular: true },
    { f: [['Na', 1], ['Cl', 1]], nome: 'cloreto de sódio', molecular: false },
    { f: [['Ca', 1], ['C', 1], ['O', 3]], nome: 'carbonato de cálcio', molecular: false },
    { f: [['Mg', 1], ['O', 1]], nome: 'óxido de magnésio', molecular: false },
  ];
  const formulaTex = (sb) => '\\mathrm{' + sb.f.map(([s, k]) => s + (k === 1 ? '' : '_{' + k + '}')).join('') + '}';
  const formulaObj = (sb) => Object.fromEntries(sb.f);
  const somaIndices = (sb) => soma(sb.f.map(([, k]) => k));
  // M pela soma das massas atómicas (Manual.quimica) e variantes erradas: sem os índices, com Z em vez de A_r.
  const massaMolar = (sb) => Q().massaMolar(formulaObj(sb));
  const massaSemIndices = (sb) => rCasas(soma(sb.f.map(([s]) => el(s).massaAtomica)), 2);
  const massaComZ = (sb) => soma(sb.f.map(([s, k]) => k * el(s).z));
  const temIndice = (sb) => sb.f.some(([, k]) => k > 1);
  const dadosAr = (sb) => sb.f.map(([s]) => '$A_r(\\mathrm{' + s + '}) = ' + Ar(s) + '$').join(', ');
  const texM = (sb) => sb.f.map(([s, k]) => (k === 1 ? '' : k + ' \\times ') + Ar(s)).join(' + ');
  const passoM = (sb) => ({
    passo: 'Calcular a massa molar', porque: 'A massa molar (em $\\mathrm{g\\,mol^{-1}}$) é a soma das massas atómicas relativas de todos os átomos da fórmula, cada uma multiplicada pelo seu índice.',
    calculo: 'M(' + formulaTex(sb) + ') = ' + A.cadeia(texM(sb), texF(massaMolar(sb), 2)) + '\\,\\mathrm{g\\,mol^{-1}}',
  });
  // M somando átomo a átomo, sem Manual.quimica (verificação independente).
  const massaAtomoAAtomo = (sb) => {
    let m = 0;
    for (const [s, k] of sb.f) for (let i = 0; i < k; i++) m += D().elementos[s].massaAtomica;
    return rCasas(m, 2);
  };
  // Valor com 3 algarismos significativos para um enunciado: [min, max, passo] de uma das faixas.
  function valor3AS(rng, faixas) {
    const [min, max, passo] = escolher(rng, faixas);
    return A.entre(rng, min, max, passo);
  }
  const UN = { m: '\\,\\mathrm{g}', n: '\\,\\mathrm{mol}' };
  const AS3 = ' Apresenta o resultado com três algarismos significativos.';

  registar({
    subtema: 'mole', tipo: 'quantidade', nome: 'Massa, quantidade de matéria e número de entidades',
    formatos: ['numerica', 'escolha'], contextos: ['n-de-m', 'm-de-n', 'N-de-m'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const sb = escolher(rng, SUBSTANCIAS.filter((x) => contexto !== 'N-de-m' || x.molecular));
        const M = massaMolar(sb);
        const Mt = texF(M, 2);
        const MsI = massaSemIndices(sb);
        const MZ = massaComZ(sb);
        const F = formulaTex(sb);
        const NA = K().NA;
        const NAtex = cient(NA, 3);
        const t3 = (v, u) => '$' + texAS(v, 3) + u + '$';
        let exato, enunciado, resolucao, erros, unidade, u, verificacao, dado, dadoTex;
        const errosM = (f, un) => [
          temIndice(sb) && { codigo: 'esqueceu_o_indice', valor: aAS(f(MsI), 3), explicacao: 'Calculaste a massa molar sem os índices ($' + texF(MsI, 2) + '\\,\\mathrm{g\\,mol^{-1}}$) e obtiveste ' + t3(f(MsI), un) + '. Cada índice conta: $M(' + F + ') = ' + Mt + '\\,\\mathrm{g\\,mol^{-1}}$.' },
          { codigo: 'usou_z_em_vez_da_massa_atomica', valor: aAS(f(MZ), 3), explicacao: 'Usaste os números atómicos em vez das massas atómicas relativas ($M = ' + MZ + '$) e obtiveste ' + t3(f(MZ), un) + '; a massa molar soma os $A_r$: $' + Mt + '\\,\\mathrm{g\\,mol^{-1}}$.' },
        ].filter(Boolean);
        if (contexto === 'n-de-m') {
          dado = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          dadoTex = texAS(dado, 3);
          exato = dado / M;
          unidade = 'mol';
          u = UN.n;
          enunciado = 'Calcula a quantidade de matéria que existe em $' + dadoTex + UN.m + '$ de ' + sb.nome + ', $' + F + '$ (' + dadosAr(sb) + ').' + AS3;
          resolucao = [passoM(sb), { passo: 'Dividir a massa pela massa molar', porque: 'A massa molar é a massa de uma mole: $n = \\dfrac{m}{M}$ (as unidades confirmam, $\\mathrm{g} \\div \\mathrm{g\\,mol^{-1}} = \\mathrm{mol}$).', calculo: 'n = \\dfrac{' + dadoTex + '}{' + Mt + '} \\approx ' + texAS(exato, 3) + u }];
          erros = [
            { codigo: 'dividiu_ao_contrario', valor: aAS(M / dado, 3), explicacao: 'Calculaste $\\dfrac{M}{m} \\approx ' + texAS(M / dado, 3) + '$; é ao contrário: $n = \\dfrac{m}{M}$.' },
            ...errosM((x) => dado / x, u),
          ];
          if (formato === 'numerica') erros.push({ codigo: 'multiplicou_massa_pela_massa_molar', valor: aAS(dado * M, 3), explicacao: 'Multiplicaste a massa pela massa molar (' + t3(dado * M, '') + '); a quantidade de matéria é $n = \\dfrac{m}{M}$.' });
          verificacao = (r) => ({ passo: 'Confirmar que a quantidade de matéria vezes a massa molar dá a massa', calculo: texAS(r, 3) + ' \\times ' + Mt + ' \\approx ' + texAS(r * M, 3) + UN.m, valor: aAS(dado / massaAtomoAAtomo(sb), 3) });
        } else if (contexto === 'm-de-n') {
          dado = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 9.99, 0.01]]);
          dadoTex = texAS(dado, 3);
          exato = dado * M;
          unidade = 'g';
          u = UN.m;
          enunciado = 'Que massa de ' + sb.nome + ', $' + F + '$, corresponde a $' + dadoTex + UN.n + '$ (' + dadosAr(sb) + ')?' + AS3;
          resolucao = [passoM(sb), { passo: 'Multiplicar a quantidade de matéria pela massa molar', porque: 'Cada mole tem a massa $M$: $m = n \\times M$.', calculo: 'm = ' + dadoTex + ' \\times ' + Mt + ' \\approx ' + texAS(exato, 3) + u }];
          erros = [
            { codigo: 'dividiu_em_vez_de_multiplicar', valor: aAS(dado / M, 3), explicacao: 'Dividiste $n$ pela massa molar e obtiveste ' + t3(dado / M, '') + '; a massa é $m = n \\times M$.' },
            { codigo: 'dividiu_a_massa_molar_por_n', valor: aAS(M / dado, 3), explicacao: 'Calculaste $\\dfrac{M}{n} \\approx ' + texAS(M / dado, 3) + '$; a massa é $m = n \\times M$.' },
            ...errosM((x) => dado * x, u),
          ];
          verificacao = (r) => ({ passo: 'Confirmar que a massa a dividir pela massa molar dá a quantidade de matéria', calculo: '\\dfrac{' + texAS(r, 3) + '}{' + Mt + '} \\approx ' + texAS(r / M, 3) + UN.n, valor: aAS(dado * massaAtomoAAtomo(sb), 3) });
        } else {
          dado = valor3AS(rng, [[1, 9.99, 0.01], [10, 99.9, 0.1]]);
          dadoTex = texAS(dado, 3);
          const n = dado / M;
          exato = n * NA;
          unidade = 'moléculas';
          u = '';
          enunciado = 'Quantas moléculas há em $' + dadoTex + UN.m + '$ de ' + sb.nome + ', $' + F + '$ (' + dadosAr(sb) + ', $N_A = ' + NAtex + '\\,\\mathrm{mol^{-1}}$)?' + AS3;
          resolucao = [
            passoM(sb),
            { passo: 'Converter a massa em quantidade de matéria', porque: 'O número de entidades obtém-se a partir de $n$, por isso primeiro $n = \\dfrac{m}{M}$.', calculo: 'n = \\dfrac{' + dadoTex + '}{' + Mt + '} \\approx ' + texAS(n, 4) + UN.n },
            { passo: 'Multiplicar pela constante de Avogadro', porque: 'Uma mole tem $N_A$ entidades: $N = n \\times N_A$ (com $n$ ainda por arredondar).', calculo: 'N = ' + texAS(n, 4) + ' \\times ' + NAtex + ' \\approx ' + cient(exato, 3) },
          ];
          const nAt = somaIndices(sb);
          erros = [
            { codigo: 'nao_converteu_massa_em_quantidade', valor: aAS(dado * NA, 3), explicacao: 'Multiplicaste a massa em gramas por $N_A$ ($' + cient(dado * NA, 3) + '$); primeiro converte-se a massa em quantidade de matéria, $n = \\dfrac{m}{M}$.' },
            nAt > 1 && { codigo: 'contou_atomos_em_vez_de_moleculas', valor: aAS(exato * nAt, 3), explicacao: '$' + cient(exato * nAt, 3) + '$ é o número de átomos (' + nAt + ' por molécula); pedia-se o número de moléculas.' },
            { codigo: 'dividiu_ao_contrario', valor: aAS(M / dado * NA, 3), explicacao: 'Usaste $\\dfrac{M}{m}$ em vez de $\\dfrac{m}{M}$ e obtiveste $' + cient(M / dado * NA, 3) + '$.' },
            ...errosM((x) => dado / x * NA, ''),
          ].filter(Boolean);
          if (formato === 'numerica') erros.push({ codigo: 'dividiu_pela_constante_de_avogadro', valor: aAS(n / NA, 3), explicacao: 'Dividiste por $N_A$ ($' + cient(n / NA, 3) + '$); o número de moléculas é $N = n \\times N_A$.' });
          verificacao = (r) => ({ passo: 'Voltar à massa: $N / N_A$ dá $n$, e $n \\times M$ dá $m$', calculo: '\\dfrac{' + cient(r, 3) + '}{' + NAtex + '} \\times ' + Mt + ' \\approx ' + texAS(r / NA * M, 3) + UN.m, valor: aAS(dado / massaAtomoAAtomo(sb) * NA, 3) });
        }
        if (ambiguo(exato, 3)) return null;
        const resposta = aAS(exato, 3);
        const tol = A.tolMeiaUnidade(resposta, 3);
        const t = (v) => (contexto === 'N-de-m' ? '$' + cient(v, 3) + '$' : t3(v, u));
        return fechar(rng, formato, {
          enunciado, resolucao, dados: { substancia: SUBSTANCIAS.indexOf(sb), dado, contexto },
        }, Object.assign({
          resposta, unidade, algarismos: 3, texto: t, erros, verificacao: verificacao(resposta),
        }, { toleranciaRelativa: tol / resposta })); // relativa: alguns erros valem perto de 0 (m / M), e uma resposta 0 não é um erro típico
      });
    },
    verificarIndependente(p) {
      const sb = SUBSTANCIAS[p.dados.substancia];
      const M = massaAtomoAAtomo(sb);
      const d = p.dados.dado;
      const v = p.dados.contexto === 'n-de-m' ? d / M : p.dados.contexto === 'm-de-n' ? d * M : d / M * K().NA;
      const u = p.dados.contexto === 'n-de-m' ? UN.n : UN.m;
      return confere(p, aAS(v, 3), (x) => (p.dados.contexto === 'N-de-m' ? '$' + cient(x, 3) + '$' : '$' + texAS(x, 3) + u + '$'));
    },
    limites(p) {
      return p.dados.dado >= 0.1 && p.dados.dado < 100;
    },
  });

  registar({
    subtema: 'mole', tipo: 'atomos', nome: 'Número de átomos numa amostra de um composto',
    formatos: ['numerica', 'escolha'], contextos: ['elemento', 'total'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const sb = escolher(rng, SUBSTANCIAS.filter((x) => x.molecular && x.f.length >= 2));
        const n = valor3AS(rng, [[0.1, 0.999, 0.001], [1, 9.99, 0.01]]);
        const nTex = texAS(n, 3);
        const NA = K().NA;
        const NAtex = cient(NA, 3);
        const F = formulaTex(sb);
        const moleculas = n * NA;
        const nAt = somaIndices(sb);
        let exato, enunciado, resolucao, erros, por, alvo;
        const passoMol = { passo: 'Calcular o número de moléculas', porque: 'Uma mole tem $N_A$ entidades: $N = n \\times N_A$.', calculo: 'N(' + F + ') = ' + nTex + ' \\times ' + NAtex + ' \\approx ' + cient(moleculas, 4) };
        if (contexto === 'elemento') {
          const comIndice = sb.f.filter(([, k]) => k > 1);
          if (!comIndice.length) return null;
          [alvo, por] = escolher(rng, comIndice);
          exato = moleculas * por;
          enunciado = 'Quantos átomos de ' + nome(alvo) + ' há em $' + nTex + '\\,\\mathrm{mol}$ de ' + sb.nome + ', $' + F + '$ ($N_A = ' + NAtex + '\\,\\mathrm{mol^{-1}}$)?' + AS3;
          resolucao = [passoMol, { passo: 'Multiplicar pelo índice de ' + alvo, porque: 'Cada molécula de $' + F + '$ tem ' + por + ' átomos de ' + nome(alvo) + '.', calculo: 'N(\\mathrm{' + alvo + '}) = ' + por + ' \\times ' + cient(moleculas, 4) + ' \\approx ' + cient(exato, 3) }];
          erros = [
            { codigo: 'contou_moleculas_em_vez_de_atomos', valor: aAS(moleculas, 3), explicacao: '$' + cient(moleculas, 3) + '$ é o número de moléculas; cada uma tem ' + por + ' átomos de ' + nome(alvo) + ', por isso multiplica-se por ' + por + '.' },
            { codigo: 'contou_todos_os_atomos', valor: aAS(moleculas * nAt, 3), explicacao: '$' + cient(moleculas * nAt, 3) + '$ é o número total de átomos (' + nAt + ' por molécula); pedia-se só os de ' + nome(alvo) + ' (' + por + ' por molécula).' },
            { codigo: 'dividiu_pelo_indice', valor: aAS(moleculas / por, 3), explicacao: 'Dividiste pelo índice e obtiveste $' + cient(moleculas / por, 3) + '$; cada molécula tem ' + por + ' átomos de ' + nome(alvo) + ', por isso multiplica-se.' },
          ];
          if (formato === 'numerica') erros.push({ codigo: 'deu_a_quantidade_de_atomos_em_mol', valor: aAS(n * por, 3), explicacao: txtAS(n * por, 3) + ' é a quantidade de matéria de átomos de ' + nome(alvo) + ' (em mol); o número de átomos obtém-se multiplicando por $N_A$.' });
        } else {
          exato = moleculas * nAt;
          por = nAt;
          enunciado = 'Quantos átomos há, no total, em $' + nTex + '\\,\\mathrm{mol}$ de ' + sb.nome + ', $' + F + '$ ($N_A = ' + NAtex + '\\,\\mathrm{mol^{-1}}$)?' + AS3;
          const partes = sb.f.map(([s, k]) => k + ' de ' + s);
          resolucao = [passoMol, { passo: 'Multiplicar pelo número de átomos de cada molécula', porque: 'Cada molécula de $' + F + '$ tem ' + partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1] + ', ou seja, ' + nAt + ' átomos.', calculo: 'N(\\mathrm{total}) = ' + nAt + ' \\times ' + cient(moleculas, 4) + ' \\approx ' + cient(exato, 3) }];
          const [sM, kM] = sb.f.reduce((b, x) => (x[1] > b[1] ? x : b));
          const nEl = sb.f.length;
          erros = [
            { codigo: 'contou_moleculas_em_vez_de_atomos', valor: aAS(moleculas, 3), explicacao: '$' + cient(moleculas, 3) + '$ é o número de moléculas; cada uma tem ' + nAt + ' átomos.' },
            { codigo: 'contou_so_um_elemento', valor: aAS(moleculas * kM, 3), explicacao: '$' + cient(moleculas * kM, 3) + '$ são só os átomos de ' + nome(sM) + ' (' + kM + ' por molécula); faltam os dos outros elementos.' },
            { codigo: 'contou_os_elementos_em_vez_dos_atomos', valor: aAS(moleculas * nEl, 3), explicacao: 'Multiplicaste pelo número de elementos (' + nEl + ') e obtiveste $' + cient(moleculas * nEl, 3) + '$; conta-se cada átomo, ' + nAt + ' por molécula.' },
          ];
        }
        if (ambiguo(exato, 3)) return null;
        const resposta = aAS(exato, 3);
        return fechar(rng, formato, {
          enunciado, resolucao, dados: { substancia: SUBSTANCIAS.indexOf(sb), n, alvo: alvo || null, contexto },
        }, {
          resposta, toleranciaRelativa: A.tolMeiaUnidade(resposta, 3) / resposta, algarismos: 3, unidade: 'átomos',
          texto: (v) => '$' + cient(v, 3) + '$', erros,
          verificacao: { passo: 'Contar primeiro em mol de átomos e só depois multiplicar por $N_A$', calculo: 'n(\\mathrm{' + (alvo || 'total') + '}) = ' + por + ' \\times ' + nTex + ' = ' + texAS(n * por, 4) + '\\,\\mathrm{mol};\\quad ' + texAS(n * por, 4) + ' \\times ' + NAtex + ' \\approx ' + cient(n * por * NA, 3), valor: aAS(n * por * NA, 3) },
        });
      });
    },
    verificarIndependente(p) {
      const sb = SUBSTANCIAS[p.dados.substancia];
      let k = 0;
      for (const [s, i] of sb.f) if (p.dados.contexto === 'total' || s === p.dados.alvo) k += i;
      return confere(p, aAS(Q().entidades(p.dados.n * k), 3), (x) => '$' + cient(x, 3) + '$');
    },
    limites(p) {
      return p.dados.n >= 0.1 && p.dados.n < 10;
    },
  });

  // Algarismos significativos, incerteza de leitura e resultado de um quociente.
  const UNIDADES_MEDIDA = [['g', '\\mathrm{g}'], ['mL', '\\mathrm{mL}'], ['cm', '\\mathrm{cm}'], ['s', '\\mathrm{s}']];
  const GRAUS = '{}^{\\circ}\\mathrm{C}';
  const INSTRUMENTOS = [
    { nome: 'Uma balança digital', digital: true, passo: 0.01, u: '\\mathrm{g}', casas: 2, min: 10, max: 99 },
    { nome: 'Uma balança digital', digital: true, passo: 0.001, u: '\\mathrm{g}', casas: 3, min: 1, max: 9 },
    { nome: 'Uma balança digital', digital: true, passo: 0.1, u: '\\mathrm{g}', casas: 1, min: 100, max: 900 },
    { nome: 'Um cronómetro digital', digital: true, passo: 0.01, u: '\\mathrm{s}', casas: 2, min: 10, max: 59 },
    { nome: 'Um termómetro digital', digital: true, passo: 0.1, u: GRAUS, casas: 1, min: 15, max: 40 },
    { nome: 'Uma proveta graduada de 1 em 1 mL', digital: false, passo: 1, u: '\\mathrm{mL}', casas: 1, min: 10, max: 90 },
    { nome: 'Uma proveta graduada de 2 em 2 mL', digital: false, passo: 2, u: '\\mathrm{mL}', casas: 0, min: 20, max: 90 },
    { nome: 'Uma bureta graduada de 0,1 em 0,1 mL', digital: false, passo: 0.1, u: '\\mathrm{mL}', casas: 2, min: 5, max: 45 },
    { nome: 'Um termómetro graduado de 1 em 1 °C', digital: false, passo: 1, u: GRAUS, casas: 1, min: 15, max: 40 },
  ];
  // Algarismos significativos de uma medida escrita com ponto decimal (sem zeros finais ambíguos num inteiro).
  const sigDe = (t) => t.replace('.', '').replace(/^0+/, '').length;
  const textoIncerteza = (u, ins) => '$\\pm ' + tex(u, 4) + '\\,' + ins.u + '$';
  const textoRho = (v, k) => '$' + Number(v).toPrecision(k).replace('.', '{,}') + '\\,\\mathrm{g\\,mL^{-1}}$';

  function contarAS(rng) {
    const k = inteiro(rng, 2, 5);
    const dig = [inteiro(rng, 1, 9)];
    for (let i = 1; i < k; i++) dig.push(rng() < 0.35 ? 0 : inteiro(rng, 0, 9));
    const forma = rng() < 0.5 ? 'esquerda' : 'meio';
    let medida;
    let zerosEsq = 0;
    if (forma === 'esquerda') {
      zerosEsq = inteiro(rng, 1, 3);
      medida = '0,' + '0'.repeat(zerosEsq) + dig.join('');
    } else {
      const i = inteiro(rng, 1, k - 1);
      medida = dig.slice(0, i).join('') + ',' + dig.slice(i).join('');
    }
    const decimais = medida.split(',')[1];
    // Zeros finais: só os que estão depois da vírgula (em 6030,0 o zero antes da vírgula conta como zero do meio).
    const finais = (decimais.match(/0+$/) || [''])[0].length;
    const interiores = dig.slice(0, k - finais).filter((x) => x === 0).length;
    const naoZero = dig.filter((x) => x !== 0).length;
    if (!finais && !interiores && !zerosEsq) return null;
    const [un, uTex] = escolher(rng, UNIDADES_MEDIDA);
    const medTex = medida.replace(',', '{,}');
    const valor = Number(medida.replace(',', '.'));
    const expo = Math.floor(Math.log10(valor));
    const mant = dig.join('');
    const mantTex = mant[0] + (mant.length > 1 ? '{,}' + mant.slice(1) : '');
    const erros = [
      zerosEsq && { codigo: 'contou_os_zeros_a_esquerda', texto: String(k + zerosEsq + 1), explicacao: 'Contaste os zeros à esquerda (' + (k + zerosEsq + 1) + ' algarismos). Esses zeros só marcam a posição da vírgula: mudam com a unidade e não são significativos.' },
      finais && { codigo: 'nao_contou_o_zero_final', texto: String(k - finais), explicacao: 'Não contaste ' + (finais === 1 ? 'o zero final' : 'os zeros finais') + ' (' + (k - finais) + '); depois da vírgula, os zeros no fim são significativos: indicam que a medida foi feita até essa casa.' },
      interiores && { codigo: 'nao_contou_os_zeros_do_meio', texto: String(k - interiores), explicacao: 'Não contaste ' + (interiores === 1 ? 'o zero' : 'os zeros') + ' entre algarismos significativos (' + (k - interiores) + '); esses zeros são sempre significativos.' },
      { codigo: 'contou_so_as_casas_decimais', texto: String(decimais.length), explicacao: decimais.length + ' é o número de casas decimais, não o de algarismos significativos; ' + (zerosEsq ? 'os zeros à esquerda não contam' : 'os algarismos antes da vírgula também contam') + '.' },
      { codigo: 'contou_so_os_algarismos_diferentes_de_zero', texto: String(naoZero), explicacao: 'Contaste só os algarismos diferentes de zero (' + naoZero + '); os zeros ' + (finais ? 'finais, depois da vírgula,' : 'entre algarismos') + ' também são significativos.' },
    ].filter((e) => e && Number(e.texto) > 0);
    return fecharTexto(rng, {
      enunciado: 'Quantos algarismos significativos tem a medida $' + medTex + '\\,' + uTex + '$?',
      resolucao: [
        { passo: 'Encontrar o primeiro algarismo diferente de zero', porque: 'Os algarismos significativos começam no primeiro algarismo diferente de zero' + (zerosEsq ? '; os zeros à esquerda só marcam a posição da vírgula.' : '.') },
        { passo: 'Contar até ao último algarismo escrito', porque: 'Contam todos os algarismos a partir daí, incluindo os zeros entre algarismos e os zeros finais depois da vírgula: ' + k + ' algarismos significativos.' },
      ],
      dados: { contexto: 'contar', medida, unidade: un },
      verificacao: { passo: 'Escrever a medida em notação científica: a mantissa tem só os algarismos significativos', calculo: medTex + ' = ' + mantTex + ' \\times 10^{' + expo + '}', valor: null },
    }, String(k), erros, String(k));
  }

  function incertezaLeitura(rng) {
    const i = inteiro(rng, 0, INSTRUMENTOS.length - 1);
    const ins = INSTRUMENTOS[i];
    const passoLeitura = ins.digital ? ins.passo : ins.passo / 2;
    const leitura = rCasas(A.entre(rng, ins.min, ins.max, passoLeitura), 4);
    if (!ins.digital && ins.casas > 0 && Math.abs(leitura / ins.passo - Math.round(leitura / ins.passo)) < 1e-9) return null;
    const u = ins.digital ? ins.passo : ins.passo / 2;
    const ultima = Math.pow(10, -ins.casas);
    const leituraTex = leitura.toFixed(ins.casas).replace('.', '{,}');
    const t = (v) => textoIncerteza(v, ins);
    const erros = ins.digital
      ? [
        { codigo: 'usou_metade_da_divisao_num_digital', texto: t(u / 2), explicacao: 'Metade da menor divisão é a regra dos instrumentos analógicos (de escala). Num instrumento digital a incerteza é uma unidade do último algarismo: ' + t(u) + '.' },
        { codigo: 'incerteza_na_casa_decimal_anterior', texto: t(u * 10), explicacao: t(u * 10) + ' corresponde à casa decimal anterior; o último algarismo do mostrador vale ' + t(u).replace('\\pm ', '') + ', e essa é a incerteza.' },
        u < 1 && { codigo: 'usou_uma_unidade_inteira', texto: t(1), explicacao: 'O instrumento mostra ' + ins.casas + (ins.casas === 1 ? ' casa decimal' : ' casas decimais') + ', por isso a incerteza é uma unidade do último algarismo, ' + t(u) + ', e não uma unidade inteira.' },
        { codigo: 'incerteza_na_casa_decimal_seguinte', texto: t(u / 10), explicacao: t(u / 10) + ' corresponde a uma casa decimal que o mostrador não tem; a incerteza é uma unidade do último algarismo mostrado: ' + t(u) + '.' },
      ]
      : [
        { codigo: 'usou_a_divisao_inteira_num_analogico', texto: t(ins.passo), explicacao: t(ins.passo) + ' é a menor divisão da escala; num instrumento analógico a incerteza de leitura é metade dela: ' + t(u) + '.' },
        { codigo: 'usou_a_ultima_casa_da_leitura', texto: t(ultima), explicacao: 'Usaste a última casa da leitura (' + t(ultima) + '); a incerteza de um instrumento de escala é metade da menor divisão: ' + t(u) + '.' },
        { codigo: 'usou_um_quarto_da_divisao', texto: t(ins.passo / 4), explicacao: 'Dividiste a menor divisão por 4 (' + t(ins.passo / 4) + '); a incerteza de leitura é metade da menor divisão: ' + t(u) + '.' },
        { codigo: 'incerteza_na_casa_decimal_anterior', texto: t(u * 10), explicacao: t(u * 10) + ' é dez vezes a incerteza; a menor divisão é $' + tex(ins.passo, 4) + '\\,' + ins.u + '$, e metade dela dá ' + t(u) + '.' },
      ];
    return fecharTexto(rng, {
      enunciado: ins.nome + ' indica $' + leituraTex + '\\,' + ins.u + '$. Qual é a incerteza de leitura?',
      resolucao: [
        { passo: ins.digital ? 'O instrumento é digital' : 'O instrumento é analógico (de escala)', porque: ins.digital ? 'Num instrumento digital, a incerteza de leitura é uma unidade do último algarismo que mostra.' : 'Num instrumento analógico, a incerteza de leitura é metade da menor divisão da escala.' },
        { passo: 'Calcular a incerteza', porque: ins.digital ? 'O último algarismo do mostrador está na casa de $' + tex(ins.passo, 4) + '\\,' + ins.u + '$.' : 'A menor divisão é $' + tex(ins.passo, 4) + '\\,' + ins.u + '$.', calculo: ins.digital ? 'u = ' + tex(u, 4) + '\\,' + ins.u : 'u = \\dfrac{' + tex(ins.passo, 4) + '}{2} = ' + tex(u, 4) + '\\,' + ins.u },
      ],
      dados: { contexto: 'incerteza', instrumento: i, leitura },
      verificacao: { passo: 'Escrever a medida com a incerteza', calculo: '(' + leituraTex + ' \\pm ' + tex(u, 4) + ')\\,' + ins.u, valor: null },
    }, t(u), erros.filter(Boolean), t(u));
  }

  function resultadoAS(rng) {
    const am = inteiro(rng, 3, 4);
    const av = inteiro(rng, 2, 4);
    const m = A.entre(rng, 10, 60, Math.pow(10, 2 - am));
    const v = A.entre(rng, 10, 60, Math.pow(10, 2 - av));
    if (av === 2 && v % 10 === 0) return null;
    const mTxt = m.toFixed(am - 2);
    const vTxt = v.toFixed(av - 2);
    const rho = m / v;
    const k = Math.min(am, av);
    const kMax = Math.max(am, av);
    if (ambiguo(rho, k) || rho >= 10) return null;
    const casasMin = Math.min(am - 2, av - 2);
    const porCasas = rCasas(rho, casasMin);
    const t = (x, kk) => textoRho(x, kk);
    // Valor como a calculadora o mostra (até 6 algarismos, sem zeros finais acrescentados).
    const calc = (x) => '$' + String(Number(x.toPrecision(6))).replace('.', '{,}') + '\\,\\mathrm{g\\,mL^{-1}}$';
    const erros = [
      kMax > k && { codigo: 'usou_o_dado_com_mais_algarismos', texto: t(rho, kMax), explicacao: t(rho, kMax) + ' tem ' + kMax + ' algarismos significativos, como o dado mais preciso; num quociente, o resultado fica com tantos quantos o dado que tem menos (' + k + ').' },
      { codigo: 'nao_arredondou', texto: calc(rho), explicacao: calc(rho) + ' é o valor da calculadora sem arredondar; o resultado fica com ' + k + ' algarismos significativos, como o dado que tem menos.' },
      k > 1 && { codigo: 'arredondou_a_menos_algarismos', texto: t(rho, k - 1), explicacao: t(rho, k - 1) + ' tem só ' + (k - 1) + (k - 1 === 1 ? ' algarismo significativo' : ' algarismos significativos') + '; o dado com menos tem ' + k + ', por isso o resultado fica com ' + k + '.' },
      porCasas > 0 && { codigo: 'usou_a_regra_das_casas_decimais', texto: '$' + texF(porCasas, casasMin) + '\\,\\mathrm{g\\,mL^{-1}}$', explicacao: 'Arredondaste ao número de casas decimais do dado com menos casas (' + casasMin + '); essa regra é a das somas e subtrações. Num quociente contam os algarismos significativos: ' + k + '.' },
    ].filter(Boolean);
    const certa = t(rho, k);
    const mT = mTxt.replace('.', '{,}');
    const vT = vTxt.replace('.', '{,}');
    return fecharTexto(rng, {
      enunciado: 'Mediu-se a massa de uma amostra de um líquido, $m = ' + mT + '\\,\\mathrm{g}$, e o seu volume, $V = ' + vT + '\\,\\mathrm{mL}$. Qual é a massa volúmica do líquido, com o número adequado de algarismos significativos?',
      resolucao: [
        { passo: 'Contar os algarismos significativos dos dados', porque: 'A massa tem ' + am + ' e o volume tem ' + av + ' algarismos significativos.' },
        { passo: 'Calcular e arredondar', porque: 'Num produto ou num quociente, o resultado fica com tantos algarismos significativos quantos o dado que tem menos (' + k + ').', calculo: '\\rho = \\dfrac{m}{V} = \\dfrac{' + mT + '}{' + vT + '} \\approx ' + rho.toPrecision(6).replace('.', '{,}') + ' \\approx ' + rho.toPrecision(k).replace('.', '{,}') + '\\,\\mathrm{g\\,mL^{-1}}' },
      ],
      dados: { contexto: 'resultado', mTxt, vTxt },
      verificacao: { passo: 'Ver qual dos dados tem menos algarismos significativos', calculo: '\\min(' + am + ', ' + av + ') = ' + k, valor: null },
    }, certa, erros, certa);
  }

  registar({
    subtema: 'mole', tipo: 'algarismos-incerteza', nome: 'Algarismos significativos e incerteza de leitura',
    formatos: ['escolha'], contextos: ['contar', 'incerteza', 'resultado'],
    gerar(semente, { contexto, rng }) {
      return tentar(() => {
        if (contexto === 'contar') return contarAS(rng);
        if (contexto === 'incerteza') return incertezaLeitura(rng);
        return resultadoAS(rng);
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'contar') {
        // Pela notação científica: a mantissa mostra só os algarismos significativos.
        const sem = d.medida.replace(',', '').replace(/^0+/, '');
        return p.opcoes[p.correta] === String(sem.length);
      }
      if (d.contexto === 'incerteza') {
        const ins = INSTRUMENTOS[d.instrumento];
        const u = ins.digital ? ins.passo : ins.passo / 2;
        return chave(p.opcoes[p.correta]) === chave(textoIncerteza(u, ins));
      }
      const k = Math.min(sigDe(d.mTxt), sigDe(d.vTxt));
      return chave(p.opcoes[p.correta]) === chave(textoRho(Number(d.mTxt) / Number(d.vTxt), k));
    },
    limites(p) {
      const d = p.dados;
      if (d.contexto === 'incerteza') return !!INSTRUMENTOS[d.instrumento];
      if (d.contexto === 'resultado') return Number(d.mTxt) >= 10 && Number(d.vTxt) >= 10;
      return d.medida.length <= 10;
    },
  });

  // ---------------------------------------------------------------- AL 1.1: volume e número de moléculas de uma gota de água
  // Balança: pesa-se o gobelé vazio e com N gotas. Proveta: lê-se o volume de N gotas e usa-se ρ (em g dm⁻³, para que
  // o volume tenha de passar de mL a dm³). Os números de gotas evitam 10, 30 e 100 (× N daria a mantissa de outra opção).
  const AGUA = SUBSTANCIAS[0];
  const GOTAS = { balanca: [20, 25, 40, 50], proveta: [50, 60, 75, 80, 120] };
  // Comparação relativa (os valores vão de 10⁻²⁷ a 10²⁶; igualOuAprox é absoluta): «=» só quando o mostrado é o exato.
  const igualRel = (exato, mostrado) => (Math.abs(exato - mostrado) <= 1e-12 * Math.abs(exato) ? ' = ' : ' \\approx ');
  // Decimal exato, sem zeros de calculadora (4,8403), e valor intermédio com 4 algarismos significativos.
  const texDec = (v) => String(Number(v.toPrecision(10))).replace('.', '{,}');
  const tex4 = (v) => texAS(v, 4);
  const tGota = (v) => '$' + cient(v, 3) + '$';
  const MOL = '\\,\\mathrm{mol}';
  const GR = '\\,\\mathrm{g}';
  const ML = '\\,\\mathrm{mL}';

  registar({
    subtema: 'mole', tipo: 'gota', nome: 'AL 1.1: volume e número de moléculas de uma gota de água',
    formatos: ['numerica', 'escolha'], contextos: ['balanca', 'proveta'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const rho = D().massaVolumicaAgua; // g cm⁻³ = g mL⁻¹
        const rhoL = Math.round(rho * 1000); // g dm⁻³
        const NA = K().NA;
        const NAtex = cient(NA, 3);
        const M = massaMolar(AGUA);
        const Mt = texF(M, 2);
        const H = el('H').massaAtomica;
        const O = el('O').massaAtomica;
        const nG = escolher(rng, GOTAS[contexto]);
        const dadosEnunciado = '(' + dadosAr(AGUA) + ', $N_A = ' + NAtex + '\\,\\mathrm{mol^{-1}}$)';
        let mTot, mTex, enunciado, resolucao, dados;
        const extra = []; // erros típicos que só existem num dos procedimentos
        if (contexto === 'balanca') {
          const lo = Math.max(1, Math.ceil(nG * 3.02) / 100);
          const hi = Math.floor(nG * 6.95) / 100;
          const m0 = A.entre(rng, 30, 60, 0.01);
          const m1 = rCasas(m0 + A.entre(rng, lo, hi, 0.01), 2);
          mTot = rCasas(m1 - m0, 2);
          mTex = texF(mTot, 2);
          enunciado = 'Na AL 1.1, deixaram-se cair ' + nG + ' gotas de água de uma bureta para um gobelé, numa balança digital. O gobelé vazio tinha $'
            + texF(m0, 2) + GR + '$ e, com as ' + nG + ' gotas, $' + texF(m1, 2) + GR + '$. Calcula o número de moléculas de água numa gota ' + dadosEnunciado + '.' + AS3;
          resolucao = [{ passo: 'Calcular a massa das gotas', porque: 'É a diferença entre a pesagem do gobelé com as gotas e a do gobelé vazio.', calculo: 'm = ' + texF(m1, 2) + ' - ' + texF(m0, 2) + ' = ' + mTex + GR }];
          dados = { contexto, nGotas: nG, m0, m1, volumeGota: (m1 - m0) / nG / rho };
          extra.push({ codigo: 'nao_descontou_a_massa_do_gobele', x: m1 / nG / M * NA, ex: (tv) => 'Usaste a massa do gobelé com as gotas ($' + texF(m1, 2) + GR + '$) como se fosse a das gotas e obtiveste ' + tv + '; a massa das gotas é a diferença $' + texF(m1, 2) + ' - ' + texF(m0, 2) + ' = ' + mTex + GR + '$.' });
        } else {
          const lo = Math.max(1, Math.ceil(nG * 0.0302 / 0.05 - 1e-9) * 0.05);
          const hi = Math.floor(Math.min(9.95, nG * 0.0695) / 0.05 + 1e-9) * 0.05;
          const V = rCasas(A.entre(rng, lo, hi, 0.05), 2);
          const Vt = texF(V, 2);
          mTot = Number((rhoL * V / 1000).toPrecision(10));
          mTex = texDec(mTot);
          const vG = V / nG;
          enunciado = 'Na AL 1.1, contaram-se ' + nG + ' gotas de água que caíram de uma bureta para uma proveta de 10 mL, graduada de 0,1 em 0,1 mL; o volume lido foi $'
            + Vt + ML + '$. Calcula o número de moléculas de água numa gota ($\\rho(\\mathrm{H_2O}) = ' + rhoL + '\\,\\mathrm{g\\,dm^{-3}}$, ' + dadosEnunciado.slice(1) + '.' + AS3;
          resolucao = [
            { passo: 'Calcular o volume de uma gota', porque: 'As gotas são todas iguais (em média), por isso divide-se o volume lido pelo número de gotas.', calculo: 'V_{\\mathrm{gota}} = \\dfrac{' + Vt + '}{' + nG + '}' + igualRel(vG, aAS(vG, 4)) + tex4(vG) + ML },
            { passo: 'Passar o volume das gotas para decímetros cúbicos', porque: 'A massa volúmica está em $\\mathrm{g\\,dm^{-3}}$ e $1\\,\\mathrm{mL} = 1\\,\\mathrm{cm^3} = 10^{-3}\\,\\mathrm{dm^3}$.', calculo: 'V = ' + Vt + ML + ' = ' + Vt + ' \\times 10^{-3}\\,\\mathrm{dm^{3}}' },
            { passo: 'Calcular a massa das gotas', porque: 'A massa volúmica é a massa por unidade de volume, $\\rho = \\dfrac{m}{V}$, logo $m = \\rho V$.', calculo: 'm = ' + rhoL + ' \\times ' + Vt + ' \\times 10^{-3} = ' + mTex + GR },
          ];
          dados = { contexto, nGotas: nG, volume: V, volumeGota: vG };
          extra.push({ codigo: 'usou_ml_como_litro', x: mTot * 1000 / nG / M * NA, ex: (tv) => 'Usaste o volume em mililitros como se estivesse em decímetros cúbicos (litros) e obtiveste ' + tv + '; com $\\rho$ em $\\mathrm{g\\,dm^{-3}}$, o volume passa a $\\mathrm{dm^3}$ ($1\\,\\mathrm{mL} = 10^{-3}\\,\\mathrm{dm^3}$).' });
          extra.push({ codigo: 'dividiu_o_volume_pela_massa_volumica', x: (V / 1000 / rhoL) / nG / M * NA, ex: (tv) => 'Dividiste o volume pela massa volúmica e obtiveste ' + tv + '; como $\\rho = \\dfrac{m}{V}$, a massa é $m = \\rho V$.' });
        }
        const mg = mTot / nG;
        const exato = mg / M * NA;
        if (ambiguo(exato, 3)) return null;
        const resposta = aAS(exato, 3);
        // Passos com os valores mostrados: cada conta bate certo com os operandos escritos (regra 15).
        const mg4 = aAS(mg, 4);
        const n4 = aAS(mg4 / M, 4);
        if (aAS(n4 * NA, 3) !== resposta) return null;
        resolucao.push(
          { passo: 'Calcular a massa de uma gota', porque: 'Pesar (ou medir) muitas gotas e dividir pelo número de gotas dá a massa média de uma gota com muito menos incerteza relativa.', calculo: 'm_{\\mathrm{gota}} = \\dfrac{' + mTex + '}{' + nG + '}' + igualRel(mg, mg4) + tex4(mg4) + GR },
          passoM(AGUA),
          { passo: 'Converter a massa de uma gota em quantidade de matéria', porque: 'O número de moléculas obtém-se a partir de $n$, e $n = \\dfrac{m}{M}$.', calculo: 'n = \\dfrac{' + tex4(mg4) + '}{' + Mt + '}' + igualRel(mg4 / M, n4) + tex4(n4) + MOL },
          { passo: 'Multiplicar pela constante de Avogadro', porque: 'Uma mole tem $N_A$ moléculas: $N = n \\times N_A$.', calculo: 'N = ' + tex4(n4) + ' \\times ' + NAtex + igualRel(n4 * NA, resposta) + cient(resposta, 3) },
        );
        const err = ({ codigo }, x, ex) => ({ codigo, valor: aAS(x, 3), explicacao: ex(tGota(aAS(x, 3))) });
        const comM = (Mm) => mg / Mm * NA;
        const E = {
          N: err({ codigo: 'nao_dividiu_pelo_numero_de_gotas' }, mTot / M * NA, (tv) => 'Não dividiste pelo número de gotas e obtiveste ' + tv + ', o número de moléculas das ' + nG + ' gotas juntas; numa gota há ' + nG + ' vezes menos.'),
          mol: err({ codigo: 'esqueceu_a_constante_de_avogadro' }, mg / M, (tv) => tv + ' é a quantidade de matéria de uma gota, em mol; falta multiplicar por $N_A$ para chegar ao número de moléculas.'),
          divNA: err({ codigo: 'dividiu_pela_constante_de_avogadro' }, mg / M / NA, (tv) => 'Dividiste por $N_A$ e obtiveste ' + tv + '; o número de moléculas é $N = n \\times N_A$.'),
          Z: err({ codigo: 'usou_z_em_vez_da_massa_atomica' }, comM(massaComZ(AGUA)), (tv) => 'Usaste os números atómicos ($M = 2 \\times 1 + 8 = ' + massaComZ(AGUA) + '$) e obtiveste ' + tv + '; a massa molar soma as massas atómicas relativas, $M(\\mathrm{H_2O}) = ' + Mt + '\\,\\mathrm{g\\,mol^{-1}}$.'),
          I: err({ codigo: 'esqueceu_o_indice' }, comM(massaSemIndices(AGUA)), (tv) => 'Esqueceste o índice do hidrogénio ($M = ' + Ar('H') + ' + ' + Ar('O') + ' = ' + texF(massaSemIndices(AGUA), 2) + '$) e obtiveste ' + tv + '; a molécula de água tem 2 átomos de H, $M = ' + Mt + '\\,\\mathrm{g\\,mol^{-1}}$.'),
          T: err({ codigo: 'trocou_os_indices' }, comM(rCasas(H + 2 * O, 2)), (tv) => 'Trocaste os índices ($M = ' + Ar('H') + ' + 2 \\times ' + Ar('O') + ' = ' + texF(rCasas(H + 2 * O, 2), 2) + '$, a massa molar de $\\mathrm{HO_2}$) e obtiveste ' + tv + '; a água tem 2 átomos de H e 1 de O, $M = ' + Mt + '\\,\\mathrm{g\\,mol^{-1}}$.'),
          O2: err({ codigo: 'usou_a_massa_molar_do_o2' }, comM(rCasas(2 * H + 2 * O, 2)), (tv) => 'Usaste $' + texF(2 * O, 2) + '$ para o oxigénio, que é a massa molar do $\\mathrm{O_2}$ ($M = 2 \\times ' + Ar('H') + ' + ' + texF(2 * O, 2) + ' = ' + texF(rCasas(2 * H + 2 * O, 2), 2) + '$), e obtiveste ' + tv + '; a molécula de água tem um só átomo de O.'),
          H2: err({ codigo: 'usou_a_massa_molar_do_h2' }, comM(rCasas(4 * H + O, 2)), (tv) => 'Usaste $' + texF(2 * H, 2) + '$ (a massa molar do $\\mathrm{H_2}$) para cada átomo de H ($M = 2 \\times ' + texF(2 * H, 2) + ' + ' + Ar('O') + ' = ' + texF(rCasas(4 * H + O, 2), 2) + '$) e obtiveste ' + tv + '; cada átomo de H conta com $A_r = ' + Ar('H') + '$.'),
          A3: err({ codigo: 'contou_atomos_em_vez_de_moleculas' }, exato * somaIndices(AGUA), (tv) => tv + ' é o número de átomos (3 por molécula de água); pede-se o número de moléculas.'),
          Mx: err({ codigo: 'nao_converteu_massa_em_quantidade' }, mg * NA, (tv) => 'Multiplicaste a massa de uma gota, em gramas, por $N_A$ e obtiveste ' + tv + '; primeiro converte-se a massa em quantidade de matéria, $n = \\dfrac{m}{M}$.'),
          M2: err({ codigo: 'multiplicou_massa_pela_massa_molar' }, mg * M * NA, (tv) => 'Multiplicaste a massa pela massa molar e obtiveste ' + tv + '; a quantidade de matéria é $n = \\dfrac{m}{M}$, e não $m \\times M$.'),
          DC: err({ codigo: 'dividiu_ao_contrario' }, M / mg * NA, (tv) => 'Calculaste $\\dfrac{M}{m}$ em vez de $\\dfrac{m}{M}$ e obtiveste ' + tv + '.'),
          K: err({ codigo: 'converteu_a_massa_para_quilogramas' }, exato / 1000, (tv) => 'Passaste a massa para quilogramas, mas com a massa molar em $\\mathrm{g\\,mol^{-1}}$, e obtiveste ' + tv + '; com $M$ em $\\mathrm{g\\,mol^{-1}}$, a massa fica em gramas.'),
        };
        const proprios = extra.map((e) => err(e, e.x, e.ex));
        let erros;
        if (formato === 'numerica') {
          erros = [E.N].concat(proprios, [E.mol, E.divNA, E.I, E.Z, E.T, E.O2, E.H2, E.A3, E.Mx, E.M2, E.DC, E.K]);
        } else {
          // Escolha: só erros na escala de uma contagem e sem a mantissa da certa (mL/L e kg são × 10^±3, o mol é < 1).
          // O número de opções abaixo da certa sorteia-se de 0 a 3, para que a posição da certa entre as opções
          // ordenadas não dê a resposta; Z e «sem M» nunca juntos (diferem × 10, a mesma mantissa).
          const b = inteiro(rng, 0, 3);
          const abaixo = baralhar(rng, [E.T, E.O2, E.H2]).slice(0, b);
          let acima = baralhar(rng, [E.N, rng() < 0.5 ? E.Z : E.Mx, E.A3, E.M2, E.DC].concat(proprios.filter((e) => e.codigo === 'nao_descontou_a_massa_do_gobele')));
          // Na maior parte dos itens vêm primeiro os erros da mesma ordem de grandeza (Z, átomos): o expoente da certa não a denuncia.
          if (rng() < 0.7) acima = acima.filter((e) => e === E.Z || e === E.A3).concat(acima.filter((e) => e !== E.Z && e !== E.A3));
          erros = abaixo.concat(acima.slice(0, 3 - b));
          const mant = [resposta].concat(erros.map((e) => e.valor)).map((v) => cient(v, 3).split(' \\times')[0]);
          if (new Set(mant).size < 4) return null;
        }
        const Nt = mTot / M * NA;
        const Nt4 = aAS(Nt, 4);
        if (aAS(Nt4 / nG, 3) !== resposta) return null;
        return fechar(rng, formato, { enunciado, resolucao, dados }, {
          resposta, unidade: 'moléculas', algarismos: 3, texto: tGota, erros,
          toleranciaRelativa: A.tolMeiaUnidade(resposta, 3) / resposta, // relativa: valores de 10²¹ (e erros perto de 0, em mol)
          verificacao: { passo: 'Contar primeiro as moléculas de todas as gotas e só depois dividir pelo número de gotas', calculo: 'N_{\\mathrm{total}} = \\dfrac{' + mTex + '}{' + Mt + '} \\times ' + NAtex + ' \\approx ' + cient(Nt4, 4) + ';\\quad N = \\dfrac{' + cient(Nt4, 4) + '}{' + nG + '} \\approx ' + cient(resposta, 3), valor: resposta },
        });
      });
    },
    verificarIndependente(p) {
      // Outro caminho: massa total pela massa volúmica em g mL⁻¹ (sem passar a dm³) e M somada átomo a átomo.
      const d = p.dados;
      const mTot = d.contexto === 'balanca' ? d.m1 - d.m0 : D().massaVolumicaAgua * d.volume;
      return confere(p, aAS(mTot * K().NA / (d.nGotas * massaAtomoAAtomo(AGUA)), 3), tGota);
    },
    limites(p) {
      const d = p.dados;
      return GOTAS[d.contexto].includes(d.nGotas) && d.volumeGota >= 0.03 && d.volumeGota <= 0.07;
    },
  });

  // ================================================================ espectros
  const texH = () => cient(K().h, 3);
  const texC = () => cient(K().c, 3);
  const texEnH = () => cient(-K().EnH, 3);
  const dadosHC = () => '$h = ' + texH() + '\\,\\mathrm{J\\,s}$, $c = ' + texC() + '\\,\\mathrm{m\\,s^{-1}}$';
  const sciU = (v, u) => '$' + cient(v, 3) + '\\,' + u + '$';

  registar({
    subtema: 'espectros', tipo: 'energia-foton', nome: 'Energia, frequência e comprimento de onda de um fotão',
    formatos: ['numerica', 'escolha'], contextos: ['E-de-lambda', 'f-de-lambda', 'lambda-de-E'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const { h, c } = K();
        const l0 = A.entre(rng, 200, 900, 10);
        const lm = l0 * 1e-9;
        let exato, enunciado, resolucao, erros, unidade, texto, verificacao, dados, tolerancias;
        const passoConv = { passo: 'Converter o comprimento de onda para metros', porque: 'Nas fórmulas $c = \\lambda f$ e $E = \\dfrac{hc}{\\lambda}$, $\\lambda$ entra em metros: $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$.', calculo: '\\lambda = ' + l0 + '\\,\\mathrm{nm} = ' + l0 + ' \\times 10^{-9}\\,\\mathrm{m} = ' + cientMin(lm) + '\\,\\mathrm{m}' };
        if (contexto === 'E-de-lambda') {
          exato = h * c / lm;
          unidade = 'J';
          texto = (v) => sciU(v, '\\mathrm{J}');
          enunciado = 'Calcula a energia de um fotão de uma radiação com comprimento de onda $\\lambda = ' + l0 + '\\,\\mathrm{nm}$ (' + dadosHC() + '). Apresenta o resultado em notação científica, com três algarismos significativos.';
          resolucao = [passoConv, { passo: 'Calcular a energia do fotão', porque: 'De $E = hf$ e $c = \\lambda f$ resulta $E = \\dfrac{hc}{\\lambda}$.', calculo: 'E = \\dfrac{' + texH() + ' \\times ' + texC() + '}{' + cientMin(lm) + '} \\approx ' + cient(exato, 3) + '\\,\\mathrm{J}', bloco: true }];
          erros = [
            { codigo: 'usou_h_sobre_lambda', valor: aAS(h / lm, 3), explicacao: 'Calculaste $\\dfrac{h}{\\lambda}$ e obtiveste ' + sciU(h / lm, '\\mathrm{J}') + '; falta a velocidade da luz: $E = \\dfrac{hc}{\\lambda}$.' },
            { codigo: 'nao_converteu_nm_em_m', valor: aAS(h * c / l0, 3), explicacao: 'Usaste $\\lambda$ em nanómetros ($' + l0 + '$) e obtiveste ' + sciU(h * c / l0, '\\mathrm{J}') + '; $\\lambda$ tem de estar em metros: $' + cientMin(lm) + '\\,\\mathrm{m}$.' },
            { codigo: 'converteu_nm_como_micrometro', valor: aAS(h * c / (l0 * 1e-6), 3), explicacao: 'Usaste $1\\,\\mathrm{nm} = 10^{-6}\\,\\mathrm{m}$ e obtiveste ' + sciU(h * c / (l0 * 1e-6), '\\mathrm{J}') + '; o nanómetro vale $10^{-9}\\,\\mathrm{m}$ ($10^{-6}\\,\\mathrm{m}$ é o micrómetro).' },
            { codigo: 'deu_a_frequencia_em_vez_da_energia', valor: aAS(c / lm, 3), explicacao: '$' + cient(c / lm, 3) + '$ é a frequência, em hertz ($f = \\dfrac{c}{\\lambda}$); a energia do fotão é $E = hf$.' },
          ];
          const f = Q().energiaFotao({ lambda: lm }).f;
          verificacao = { passo: 'Calcular em dois passos: primeiro a frequência, depois E = hf', calculo: 'f = \\dfrac{' + texC() + '}{' + cientMin(lm) + '} \\approx ' + cient(f, 4) + '\\,\\mathrm{Hz};\\quad E = ' + texH() + ' \\times ' + cient(f, 4) + ' \\approx ' + cient(h * f, 3) + '\\,\\mathrm{J}', valor: aAS(h * f, 3) };
          dados = { lambdaNm: l0, contexto };
          tolerancias = (r) => ({ toleranciaRelativa: A.tolMeiaUnidade(r, 3) / r });
        } else if (contexto === 'f-de-lambda') {
          exato = c / lm;
          unidade = 'Hz';
          texto = (v) => sciU(v, '\\mathrm{Hz}');
          enunciado = 'Calcula a frequência de uma radiação com comprimento de onda $\\lambda = ' + l0 + '\\,\\mathrm{nm}$ ($c = ' + texC() + '\\,\\mathrm{m\\,s^{-1}}$). Apresenta o resultado em notação científica, com três algarismos significativos.';
          resolucao = [passoConv, { passo: 'Calcular a frequência', porque: 'A velocidade da luz é $c = \\lambda f$, logo $f = \\dfrac{c}{\\lambda}$.', calculo: 'f = \\dfrac{' + texC() + '}{' + cientMin(lm) + '} \\approx ' + cient(exato, 3) + '\\,\\mathrm{Hz}' }];
          erros = [
            { codigo: 'nao_converteu_nm_em_m', valor: aAS(c / l0, 3), explicacao: 'Usaste $\\lambda$ em nanómetros e obtiveste ' + sciU(c / l0, '\\mathrm{Hz}') + '; $\\lambda$ tem de estar em metros: $' + cientMin(lm) + '\\,\\mathrm{m}$.' },
            { codigo: 'dividiu_ao_contrario', valor: aAS(lm / c, 3), explicacao: 'Calculaste $\\dfrac{\\lambda}{c}$ e obtiveste ' + sciU(lm / c, '\\mathrm{Hz}') + '; de $c = \\lambda f$ vem $f = \\dfrac{c}{\\lambda}$.' },
            { codigo: 'converteu_nm_como_micrometro', valor: aAS(c / (l0 * 1e-6), 3), explicacao: 'Usaste $1\\,\\mathrm{nm} = 10^{-6}\\,\\mathrm{m}$ e obtiveste ' + sciU(c / (l0 * 1e-6), '\\mathrm{Hz}') + '; o nanómetro vale $10^{-9}\\,\\mathrm{m}$.' },
          ];
          if (formato === 'numerica') erros.push({ codigo: 'multiplicou_c_por_lambda', valor: aAS(c * lm, 3), explicacao: 'Multiplicaste $c$ por $\\lambda$ ($' + cient(c * lm, 3) + '$); a frequência é $f = \\dfrac{c}{\\lambda}$.' });
          verificacao = { passo: 'Confirmar que o produto do comprimento de onda pela frequência dá a velocidade da luz', calculo: cientMin(lm) + ' \\times ' + cient(aAS(exato, 3), 3) + ' \\approx ' + cient(lm * aAS(exato, 3), 3) + '\\,\\mathrm{m\\,s^{-1}}', valor: aAS(Q().energiaFotao({ lambda: lm }).f, 3) };
          dados = { lambdaNm: l0, contexto };
          tolerancias = (r) => ({ toleranciaRelativa: A.tolMeiaUnidade(r, 3) / r });
        } else {
          const E = aAS(h * c / lm, 3);
          const ET = cient(E, 3);
          exato = h * c / E * 1e9;
          unidade = 'nm';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{nm}$';
          enunciado = 'Um fotão tem energia $E = ' + ET + '\\,\\mathrm{J}$. Calcula o comprimento de onda da radiação, em nanómetros, com três algarismos significativos (' + dadosHC() + ').';
          const lmE = h * c / E;
          resolucao = [
            { passo: 'Calcular o comprimento de onda em metros', porque: 'De $E = \\dfrac{hc}{\\lambda}$ resulta $\\lambda = \\dfrac{hc}{E}$.', calculo: '\\lambda = \\dfrac{' + texH() + ' \\times ' + texC() + '}{' + ET + '} \\approx ' + cient(lmE, 4) + '\\,\\mathrm{m}', bloco: true },
            { passo: 'Converter para nanómetros', porque: 'Como $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$, divide-se por $10^{-9}$ (multiplica-se por $10^{9}$).', calculo: '\\lambda \\approx ' + cient(lmE, 4) + ' \\times 10^{9}\\,\\mathrm{nm} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{nm}' },
          ];
          erros = [
            { codigo: 'nao_converteu_m_em_nm', valor: aAS(lmE, 3), explicacao: '$' + cient(lmE, 3) + '$ é o comprimento de onda em metros; em nanómetros multiplica-se por $10^{9}$: $' + texAS(exato, 3) + '\\,\\mathrm{nm}$.' },
            { codigo: 'converteu_m_em_nm_ao_contrario', valor: aAS(lmE * 1e-9, 3), explicacao: 'Multiplicaste por $10^{-9}$ e obtiveste $' + cient(lmE * 1e-9, 3) + '$; para passar de metros a nanómetros (unidade menor) o número aumenta: multiplica-se por $10^{9}$.' },
            { codigo: 'usou_h_sobre_a_energia', valor: aAS(h / E * 1e9, 3), explicacao: 'Calculaste $\\dfrac{h}{E}$ e obtiveste $' + cient(h / E * 1e9, 3) + '\\,\\mathrm{nm}$; falta a velocidade da luz: $\\lambda = \\dfrac{hc}{E}$.' },
          ];
          const v = Q().energiaFotao({ f: E / h }).lambda * 1e9;
          verificacao = { passo: 'Confirmar pela frequência: f = E/h e depois λ = c/f', calculo: 'f = \\dfrac{' + ET + '}{' + texH() + '} \\approx ' + cient(E / h, 4) + '\\,\\mathrm{Hz};\\quad \\lambda = \\dfrac{' + texC() + '}{' + cient(E / h, 4) + '} \\approx ' + texAS(v, 3) + '\\,\\mathrm{nm}', valor: aAS(v, 3) };
          dados = { E, contexto };
          // Relativa: os erros (em metros, ou divididos por 10⁹) são muito pequenos e de ordens de grandeza diferentes.
          tolerancias = (r) => ({ toleranciaRelativa: A.tolMeiaUnidade(r, 3) / r });
        }
        if (ambiguo(exato, 3)) return null;
        const resposta = aAS(exato, 3);
        return fechar(rng, formato, {
          enunciado, resolucao, dados,
          esquema: { id: 'fqa-espectro', opcoes: { lambda: contexto === 'lambda-de-E' ? resposta * 1e-9 : lm } },
        }, Object.assign({ resposta, unidade, algarismos: 3, texto, erros, verificacao }, tolerancias(resposta)));
      });
    },
    verificarIndependente(p) {
      const { h, c } = K();
      const d = p.dados;
      if (d.contexto === 'E-de-lambda') {
        const f = c / (d.lambdaNm * 1e-9);
        return confere(p, aAS(h * f, 3), (v) => sciU(v, '\\mathrm{J}'));
      }
      if (d.contexto === 'f-de-lambda') {
        // f = E/h com E = hc/λ.
        return confere(p, aAS((h * c / (d.lambdaNm * 1e-9)) / h, 3), (v) => sciU(v, '\\mathrm{Hz}'));
      }
      return confere(p, aAS(c / (d.E / h) * 1e9, 3), (v) => '$' + texAS(v, 3) + '\\,\\mathrm{nm}$');
    },
    limites(p) {
      const d = p.dados;
      return d.contexto === 'lambda-de-E' ? d.E > 2e-19 && d.E < 1.1e-18 : d.lambdaNm >= 200 && d.lambdaNm <= 900;
    },
  });

  // Zonas do espectro: valores escolhidos longe das fronteiras (Manual.dadosQuimicos.espectro).
  const ZONAS = ['gama', 'X', 'UV', 'visivel', 'IV', 'micro-ondas', 'radio'];
  const NOME_ZONA = {
    gama: 'Raios gama', X: 'Raios X', UV: 'Ultravioleta', visivel: 'Visível', IV: 'Infravermelho', 'micro-ondas': 'Micro-ondas', radio: 'Ondas de rádio',
  };
  const LAMBDAS_ZONA = {
    X: [5e-11, 1e-10, 2e-10, 5e-10, 1e-9, 2e-9],
    UV: [3e-8, 5e-8, 1e-7, 1.5e-7, 2e-7, 2.5e-7, 3e-7],
    visivel: [4.5e-7, 5e-7, 5.5e-7, 6e-7, 6.5e-7],
    IV: [2e-6, 5e-6, 1e-5, 2e-5, 5e-5, 1e-4, 2e-4],
    'micro-ondas': [5e-3, 1e-2, 2e-2, 5e-2, 1e-1, 2e-1],
  };
  // λ em texto: nanómetros abaixo de 1 µm, metros (notação científica) a partir daí.
  const texLambda = (l) => (l < 1e-6 ? tex(l * 1e9, 3) + '\\,\\mathrm{nm}' : cientMin(l) + '\\,\\mathrm{m}');
  const limitesZona = (z) => D().espectro.find((x) => x.zona === z);
  const textoLimites = (z) => {
    const x = limitesZona(z);
    const t = (v) => (v < 1e-6 ? tex(v * 1e9, 3) + '\\,\\mathrm{nm}' : cientMin(v) + '\\,\\mathrm{m}');
    if (x.min === 0) return 'abaixo de $' + t(x.max) + '$';
    if (x.max === Infinity) return 'acima de $' + t(x.min) + '$';
    return 'de $' + t(x.min) + '$ a $' + t(x.max) + '$';
  };
  const ZONA_ART = { gama: 'os raios gama', X: 'os raios X', UV: 'o ultravioleta', visivel: 'o visível', IV: 'o infravermelho', 'micro-ondas': 'as micro-ondas', radio: 'as ondas de rádio' };
  const plural = (z) => /^(os|as) /.test(ZONA_ART[z]);
  // Zona pela energia do fotão (outro caminho que não a tabela de comprimentos de onda).
  function zonaPelaEnergia(l) {
    const { h, c } = K();
    const E = h * c / l;
    const z = D().espectro.find((x) => E <= h * c / x.min && E > (x.max === Infinity ? 0 : h * c / x.max));
    return z.zona;
  }

  registar({
    subtema: 'espectros', tipo: 'zona', nome: 'Zonas do espectro e energia dos fotões',
    formatos: ['escolha', 'vf'], contextos: ['lambda', 'frequencia'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const { c } = K();
        const comF = contexto === 'frequencia';
        const descrever = (l) => (comF ? '$f = ' + cient(aAS(c / l, 2), 2) + '\\,\\mathrm{Hz}$' : '$\\lambda = ' + texLambda(l) + '$');
        if (formato === 'escolha') {
          const z = escolher(rng, Object.keys(LAMBDAS_ZONA));
          const l = escolher(rng, LAMBDAS_ZONA[z]);
          const lUsado = comF ? c / aAS(c / l, 2) : l;
          if (Q().zonaEspectro(lUsado) !== z) return null;
          const i = ZONAS.indexOf(z);
          const erros = [];
          const intervalo = maiuscula(ZONA_ART[z]) + (plural(z) ? ' vão ' : ' vai ') + textoLimites(z) + '.';
          if (i - 1 >= 0) erros.push({ codigo: 'escolheu_a_zona_de_menor_comprimento_de_onda', texto: NOME_ZONA[ZONAS[i - 1]], explicacao: maiuscula(ZONA_ART[ZONAS[i - 1]]) + (plural(ZONAS[i - 1]) ? ' têm' : ' tem') + ' comprimentos de onda ' + textoLimites(ZONAS[i - 1]) + ', menores do que este. ' + intervalo });
          if (i + 1 < ZONAS.length) erros.push({ codigo: 'escolheu_a_zona_de_maior_comprimento_de_onda', texto: NOME_ZONA[ZONAS[i + 1]], explicacao: maiuscula(ZONA_ART[ZONAS[i + 1]]) + (plural(ZONAS[i + 1]) ? ' têm' : ' tem') + ' comprimentos de onda ' + textoLimites(ZONAS[i + 1]) + ', maiores do que este. ' + intervalo });
          const esp = ZONAS[ZONAS.length - 1 - i];
          if (esp !== z) erros.push({ codigo: 'trocou_o_sentido_do_espectro', texto: NOME_ZONA[esp], explicacao: 'Trocaste o sentido do espectro: ' + ZONA_ART[esp] + (plural(esp) ? ' ficam' : ' fica') + ' do outro lado do visível (' + textoLimites(esp) + '). ' + intervalo });
          if (!comF && l < 1e-6) {
            const zErro = Q().zonaEspectro(l * 1e9);
            if (zErro !== z) erros.push({ codigo: 'nao_converteu_nm_em_m', texto: NOME_ZONA[zErro], explicacao: 'Leste o valor em nanómetros como se estivesse em metros (' + fmt(aAS(l * 1e9, 3)) + ' m seria ' + NOME_ZONA[zErro].toLowerCase() + '); $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$. ' + intervalo });
          }
          if (comF) {
            const zErro = Q().zonaEspectro(aAS(c / l, 2));
            if (zErro !== z) erros.push({ codigo: 'tomou_a_frequencia_por_comprimento_de_onda', texto: NOME_ZONA[zErro], explicacao: 'Usaste o valor da frequência como se fosse o comprimento de onda; primeiro calcula-se $\\lambda = \\dfrac{c}{f}$. ' + intervalo });
          }
          const enunciado = 'Uma radiação eletromagnética tem ' + descrever(l) + '. A que zona do espectro eletromagnético pertence?' + (comF ? ' ($c = ' + texC() + '\\,\\mathrm{m\\,s^{-1}}$)' : '');
          const resolucao = [];
          if (comF) resolucao.push({ passo: 'Calcular o comprimento de onda', porque: 'De $c = \\lambda f$ vem $\\lambda = \\dfrac{c}{f}$.', calculo: '\\lambda = \\dfrac{' + texC() + '}{' + cient(aAS(c / l, 2), 2) + '} \\approx ' + texLambda(aAS(lUsado, 2)) });
          else if (l < 1e-6) resolucao.push({ passo: 'Passar o comprimento de onda a metros', porque: 'As fronteiras das zonas comparam-se na mesma unidade: $1\\,\\mathrm{nm} = 10^{-9}\\,\\mathrm{m}$.', calculo: '\\lambda = ' + texLambda(l) + ' = ' + cientMin(l) + '\\,\\mathrm{m}' });
          resolucao.push({ passo: 'Comparar com os limites das zonas', porque: intervalo + ' Por ordem crescente de comprimento de onda: raios gama, raios X, ultravioleta, visível, infravermelho, micro-ondas e ondas de rádio.' });
          return fecharTexto(rng, {
            enunciado, resolucao, dados: { lambda: lUsado, zona: z, contexto },
            verificacao: { passo: 'Confirmar pela energia do fotão, E = hc/λ', calculo: 'E = \\dfrac{hc}{\\lambda} \\approx ' + cient(K().h * c / lUsado, 2) + '\\,\\mathrm{J}', valor: null },
            esquema: { id: 'fqa-espectro', opcoes: { lambda: lUsado } },
          }, NOME_ZONA[z], erros, NOME_ZONA[zonaPelaEnergia(lUsado)]);
        }
        // vf: comparar a energia dos fotões de duas radiações de zonas diferentes.
        const [z1, z2] = baralhar(rng, Object.keys(LAMBDAS_ZONA)).slice(0, 2);
        const l1 = escolher(rng, LAMBDAS_ZONA[z1]);
        const l2 = escolher(rng, LAMBDAS_ZONA[z2]);
        const maisEnergetica1 = l1 < l2;
        const frase = (a, b) => 'Os fotões da radiação com ' + descrever(a) + ' têm mais energia do que os da radiação com ' + descrever(b) + '.';
        const erro = comF
          ? { codigo: 'menor_frequencia_maior_energia', explicacao: 'A energia do fotão é proporcional à frequência, $E = hf$: tem mais energia o fotão de maior frequência.' }
          : { codigo: 'maior_comprimento_de_onda_maior_energia', explicacao: 'A energia do fotão é inversamente proporcional ao comprimento de onda, $E = \\dfrac{hc}{\\lambda}$: tem mais energia o fotão de menor comprimento de onda.' };
        const [ma, me] = maisEnergetica1 ? [l1, l2] : [l2, l1];
        const v = vfDe(rng, frase(ma, me), frase(me, ma), erro);
        const primeiro = v.correta ? ma : me;
        const segundo = v.correta ? me : ma;
        const { h } = K();
        return Object.assign({
          resolucao: [
            { passo: comF ? 'Comparar as frequências' : 'Comparar os comprimentos de onda', porque: comF ? 'De $E = hf$: maior frequência, maior energia do fotão.' : 'De $E = \\dfrac{hc}{\\lambda}$: menor comprimento de onda, maior energia do fotão.' },
            { passo: 'Concluir', porque: 'A radiação com ' + descrever(ma) + ' (' + NOME_ZONA[Q().zonaEspectro(ma)].toLowerCase() + ') tem fotões mais energéticos do que a radiação com ' + descrever(me) + ' (' + NOME_ZONA[Q().zonaEspectro(me)].toLowerCase() + ').' },
          ],
          dados: { primeiro, segundo, contexto },
          esquema: { id: 'fqa-espectro', opcoes: { lambda: ma } },
        }, v, {
          verificacao: { passo: 'Calcular a energia de cada fotão, E = hc/λ', calculo: 'E_1 \\approx ' + cient(h * K().c / primeiro, 2) + '\\,\\mathrm{J};\\quad E_2 \\approx ' + cient(h * K().c / segundo, 2) + '\\,\\mathrm{J}', valor: v.correta },
        });
      });
    },
    verificarIndependente(p) {
      if (p.formato === 'vf') {
        const { h, c } = K();
        return p.correta === (h * c / p.dados.primeiro > h * c / p.dados.segundo);
      }
      return p.opcoes[p.correta] === NOME_ZONA[zonaPelaEnergia(p.dados.lambda)];
    },
    limites(p) {
      return p.formato === 'vf' || ZONAS.includes(p.dados.zona);
    },
  });

  // Átomo de hidrogénio: E_n = EnH/n² (Manual.dadosQuimicos.constantes.EnH).
  const SERIE = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen' };
  const ZONA_SERIE = { 1: 'no ultravioleta', 2: 'no visível', 3: 'no infravermelho' };
  const dadosH = () => '$E_n = -\\dfrac{' + texEnH() + '}{n^2}\\,\\mathrm{J}$';
  const EnTex = (n) => cient(Q().energiaNivelH(n), 3);
  // E_n escrita a partir da expressão (n = 1: o próprio valor da constante).
  const nivelTex = (n) => (n === 1
    ? 'E_{1} = -' + texEnH() + '\\,\\mathrm{J}'
    : 'E_{' + n + '} = -\\dfrac{' + texEnH() + '}{' + n * n + '} \\approx ' + cient(Q().energiaNivelH(n), 4) + '\\,\\mathrm{J}');
  const inversoN2 = (n) => (n === 1 ? '1' : '\\dfrac{1}{' + n * n + '}');
  function niveisAoAcaso(rng, sentido) {
    const a = inteiro(rng, 1, 6);
    let b = inteiro(rng, 1, 6);
    if (a === b) return null;
    if (sentido === 'emissao' && b > a) return [b, a];
    if (sentido === 'absorcao' && b < a) return [b, a];
    return [a, b];
  }

  // Modelo de Bohr (conceitos): sentido da transição (absorção/emissão) e estado em que o átomo fica.
  // Níveis n = 1 a 4 e n = ∞ (ionização, energia 0). Convenção do site: E < 0 no átomo, 0 com o eletrão removido.
  // escolha: as 4 opções são sempre as 4 combinações possíveis (sentido × estado final), por isso a estrutura das
  // opções não revela a resposta; só a transição a decide. vf: só afirmações cuja verdade depende da transição.
  const INF_N = 'inf';
  const nBohr = (n) => (n === INF_N ? '\\infty' : String(n));
  const sobeBohr = (ni, nf) => nf === INF_N || nf > ni;
  const estadoBohr = (nf) => (nf === INF_N ? 'I' : nf === 1 ? 'F' : 'E');
  const FIM_BOHR = { F: 'fica no estado fundamental', E: 'fica num estado excitado', I: 'fica ionizado' };
  const NOME_ESTADO = { F: 'no estado fundamental', E: 'num estado excitado', I: 'ionizado' };
  // As 4 combinações possíveis: absorver leva a um estado excitado ou à ionização; emitir, ao fundamental ou a um excitado.
  const COMBOS_BOHR = [[true, 'E'], [true, 'I'], [false, 'F'], [false, 'E']];
  const textoCombo = (absorve, estado) => 'O átomo ' + (absorve ? 'absorve' : 'emite') + ' energia e ' + FIM_BOHR[estado] + '.';
  // Transições: emissão com os 6 pares uniformes; absorção com n = ∞ em 1/3 dos casos e os 6 pares finitos no resto.
  const PARES_SOBE = [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
  const PARES_DESCE = [[2, 1], [3, 1], [3, 2], [4, 1], [4, 2], [4, 3]];
  // Erro de estado (mesmo sentido, estado final trocado), pelo estado certo e pelo mostrado.
  function erroEstadoBohr(certo, mostrado, nfT) {
    if (certo === 'F') return { codigo: 'fundamental_como_excitado', explicacao: 'Com o eletrão em $n = 1$, o nível de menor energia, o átomo fica no estado fundamental, não num estado excitado.' };
    if (certo === 'I') return { codigo: 'ionizacao_como_excitacao', explicacao: 'Em $n = \\infty$ o eletrão já não está ligado ao núcleo (energia 0): o átomo fica ionizado, não num estado excitado.' };
    if (mostrado === 'F') return { codigo: 'excitado_como_fundamental', explicacao: 'O estado fundamental é só o de $n = 1$; com o eletrão em ' + nfT + ' o átomo fica num estado excitado, não no estado fundamental.' };
    return { codigo: 'excitacao_como_ionizacao', explicacao: 'Em ' + nfT + ' o eletrão continua ligado ao núcleo (a energia ainda é negativa): o átomo fica num estado excitado, não ionizado. Só fica ionizado em $n = \\infty$.' };
  }

  registar({
    subtema: 'espectros', tipo: 'bohr', nome: 'Modelo de Bohr: absorção, emissão e estados do átomo',
    formatos: ['escolha', 'vf'], contextos: ['absorcao', 'emissao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let ni, nf;
        if (contexto === 'absorcao') {
          if (rng() < 1 / 3) { ni = inteiro(rng, 1, 4); nf = INF_N; } else [ni, nf] = escolher(rng, PARES_SOBE);
        } else [ni, nf] = escolher(rng, PARES_DESCE);
        const sobe = sobeBohr(ni, nf);
        const est = estadoBohr(nf);
        const nfT = '$n = ' + nBohr(nf) + '$';
        const preambulo = 'No modelo de Bohr, o eletrão de um átomo de hidrogénio passa do nível $n = ' + ni + '$ para o nível ' + nfT + '.';
        const resolucao = [
          { passo: 'Ver o sentido da transição', porque: sobe
            ? 'O eletrão sobe de nível, afasta-se do núcleo e fica com mais energia (menos negativa): o átomo tem de absorver energia.'
            : 'O eletrão desce de nível, aproxima-se do núcleo e fica com menos energia (mais negativa): o átomo emite a diferença de energia (um fotão).' },
          { passo: 'Identificar o estado final', porque: est === 'F'
            ? 'Com o eletrão em $n = 1$, o nível de menor energia, o átomo fica no estado fundamental.'
            : est === 'E' ? 'Com o eletrão em ' + nfT + ' (acima de $n = 1$), o átomo fica num estado excitado.'
              : 'Em $n = \\infty$ o eletrão deixa de estar ligado ao núcleo (energia 0): o átomo fica ionizado.' },
        ];
        // Verificação pelas energias E_n = EnH/n² (0 em n = ∞); «=» quando o valor mostrado é exato.
        const En = (n) => (n === INF_N ? 0 : K().EnH / (n * n));
        const EnT = (n) => (n === INF_N ? 'E_{\\infty} = 0'
          : 'E_{' + n + '}' + (Math.abs(En(n) - aAS(En(n), 3)) <= 1e-9 * Math.abs(En(n)) ? ' = ' : ' \\approx ') + cient(En(n), 3) + '\\,\\mathrm{J}');
        const ver = {
          passo: 'Comparar as energias dos dois níveis, com $E_n = -\\dfrac{' + texEnH() + '}{n^2}\\,\\mathrm{J}$ e $E_{\\infty} = 0$',
          calculo: EnT(ni) + (sobe ? ' < ' : ' > ') + EnT(nf) + ',\\quad \\Delta E' + (sobe ? ' > 0' : ' < 0'),
        };
        const esquema = { id: 'fig-bohr' };
        if (formato === 'escolha') {
          const certa = textoCombo(sobe, est);
          const combos = {};
          const erros = [];
          COMBOS_BOHR.forEach(([absorve, estado]) => {
            const texto = textoCombo(absorve, estado);
            combos[chave(texto)] = { absorve, estado };
            if (absorve === sobe && estado === est) return;
            let erro;
            if (estado === est) {
              erro = { codigo: 'trocou_emissao_com_absorcao', explicacao: sobe
                ? 'O eletrão sobe de nível: fica com mais energia, por isso o átomo absorve energia, não a emite.'
                : 'O eletrão desce de nível: fica com menos energia, e o átomo emite essa diferença de energia, não a absorve.' };
            } else if (absorve === sobe) {
              erro = erroEstadoBohr(est, estado, nfT);
            } else if (estado === estadoBohr(ni)) {
              // Descreve a transição inversa (de n = nf para n = ni).
              erro = { codigo: 'leu_a_transicao_ao_contrario', explicacao: 'Essa é a transição ao contrário, de ' + nfT + ' para $n = ' + ni
                + '$. Aqui o eletrão vai de $n = ' + ni + '$ para ' + nfT + ', por isso o átomo ' + (sobe ? 'absorve' : 'emite')
                + ' energia e fica ' + NOME_ESTADO[est] + '.' };
            } else {
              erro = { codigo: 'trocou_sentido_e_estado_final', explicacao: 'Trocaste o sentido e o estado final: o eletrão '
                + (sobe ? 'sobe' : 'desce') + ' de nível, por isso o átomo ' + (sobe ? 'absorve' : 'emite') + ' energia (não a '
                + (sobe ? 'emite' : 'absorve') + '), e em ' + nfT + ' fica ' + NOME_ESTADO[est] + ', não ' + NOME_ESTADO[estado] + '.' };
            }
            erros.push(Object.assign({ texto }, erro));
          });
          return fecharTexto(rng, {
            enunciado: preambulo + ' O que acontece?', resolucao,
            dados: { ni, nf, contexto, combos }, verificacao: Object.assign({ valor: null }, ver), esquema,
          }, certa, erros, certa);
        }
        // vf: o sentido (absorve/emite ou a energia aumenta/diminui), equilibrado entre verdadeiro e falso,
        // ou «fica num estado excitado» (verdadeiro em cerca de metade das transições).
        const tipo = escolher(rng, ['sentido', 'energia', 'estado']);
        let v, afirmacao;
        if (tipo === 'estado') {
          const correta = est === 'E';
          v = { enunciado: preambulo + ' No fim, o átomo ' + FIM_BOHR.E + '.', correta, errosTipicos: correta ? [] : [erroEstadoBohr(est, 'E', nfT)] };
          afirmacao = { estado: 'E' };
        } else if (tipo === 'sentido') {
          const frase = (absorve) => preambulo + ' O átomo ' + (absorve ? 'absorve' : 'emite') + ' energia.';
          v = vfDe(rng, frase(sobe), frase(!sobe), { codigo: 'trocou_emissao_com_absorcao', explicacao: sobe
            ? 'O eletrão sobe de nível: fica com mais energia, por isso o átomo absorve energia, não a emite.'
            : 'O eletrão desce de nível: fica com menos energia, e o átomo emite essa diferença de energia, não a absorve.' });
          afirmacao = { absorve: v.correta ? sobe : !sobe };
        } else {
          const frase = (aumenta) => preambulo + ' A energia do eletrão ' + (aumenta ? 'aumenta' : 'diminui') + '.';
          v = vfDe(rng, frase(sobe), frase(!sobe), { codigo: 'energia_diminui_com_n', explicacao: 'A energia do eletrão é negativa e tanto maior (menos negativa) quanto maior for $n$, até 0 em $n = \\infty$. Ao '
            + (sobe ? 'subir' : 'descer') + ' de nível, a energia ' + (sobe ? 'aumenta, não diminui.' : 'diminui, não aumenta.') });
          afirmacao = { aumenta: v.correta ? sobe : !sobe };
        }
        const dados = { ni, nf, contexto, afirmacao };
        return Object.assign({ resolucao, dados, esquema }, v, { verificacao: Object.assign({}, ver, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const { ni, nf } = p.dados;
      // Pelas energias EnH/n² (0 em n = ∞), sem as regras de «sobe/desce» do gerador.
      const E = (n) => (n === INF_N ? 0 : K().EnH / (n * n));
      const aumenta = E(nf) > E(ni);
      const estado = E(nf) === 0 ? 'I' : E(nf) === K().EnH ? 'F' : 'E';
      if (p.formato === 'vf') {
        const a = p.dados.afirmacao;
        const verdade = 'absorve' in a ? a.absorve === aumenta : 'aumenta' in a ? a.aumenta === aumenta : a.estado === estado;
        return p.correta === verdade;
      }
      const v = p.opcoes.map((o) => p.dados.combos[chave(o)]);
      if (v.some((c) => !c)) return false;
      return v.every((c, i) => (c.absorve === aumenta && c.estado === estado) === (i === p.correta));
    },
    limites(p) {
      const { ni, nf, contexto } = p.dados;
      if (!Number.isInteger(ni) || ni < 1 || ni > 4) return false;
      if (nf === INF_N) return contexto === 'absorcao';
      if (!Number.isInteger(nf) || nf < 1 || nf > 4 || nf === ni) return false;
      return contexto === 'absorcao' ? nf > ni : nf < ni;
    },
  });

  registar({
    subtema: 'espectros', tipo: 'transicao-h', nome: 'Energia e comprimento de onda numa transição do átomo de hidrogénio',
    formatos: ['numerica', 'escolha'], contextos: ['energia', 'comprimento'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const par = niveisAoAcaso(rng, rng() < 0.5 ? 'emissao' : 'absorcao');
        if (!par) return null;
        const [ni, nf] = par;
        const t = Q().transicaoH(ni, nf);
        const { h, c, EnH } = K();
        const Ei = Q().energiaNivelH(ni);
        const Ef = Q().energiaNivelH(nf);
        const Efot = Math.abs(t.deltaE);
        const emissao = t.tipo === 'emissao';
        const acao = emissao ? 'emitido' : 'absorvido';
        const comLambda = contexto === 'comprimento';
        const enunciado = 'No átomo de hidrogénio, ' + dadosH() + '. O eletrão passa do nível $n = ' + ni + '$ para o nível $n = ' + nf + '$. Calcula '
          + (comLambda ? 'o comprimento de onda, em nanómetros, da radiação ' + (emissao ? 'emitida' : 'absorvida') + ' (' + dadosHC() + ')' : 'a energia do fotão ' + acao)
          + '. Apresenta o resultado com três algarismos significativos.';
        const resolucao = [
          { passo: 'Calcular a energia dos dois níveis', porque: 'Substitui-se $n$ na expressão de $E_n$ (as energias dos níveis são negativas).', calculo: nivelTex(ni) + ';\\quad ' + nivelTex(nf), bloco: true },
          { passo: 'Calcular a variação de energia do eletrão', porque: '$\\Delta E = E_{\\text{final}} - E_{\\text{inicial}}$: ' + (emissao ? 'é negativa, o eletrão desce de nível e o átomo emite um fotão.' : 'é positiva, o eletrão sobe de nível e o átomo absorve um fotão.') + ' A energia do fotão é $|\\Delta E|$.', calculo: '\\Delta E = E_{' + nf + '} - E_{' + ni + '} \\approx ' + cient(t.deltaE, 4) + '\\,\\mathrm{J}', bloco: true },
        ];
        const errosE = [
          { codigo: 'usou_so_a_energia_do_nivel_inicial', E: Math.abs(Ei), quem: 'só $|E_{' + ni + '}|$', comoE: true },
          { codigo: 'usou_so_a_energia_do_nivel_final', E: Math.abs(Ef), quem: 'só $|E_{' + nf + '}|$', comoE: true },
          { codigo: 'somou_as_energias_dos_niveis', E: Math.abs(Ei) + Math.abs(Ef), quem: 'a soma $|E_{' + ni + '}| + |E_{' + nf + '}|$', comoE: true },
          { codigo: 'usou_n_em_vez_de_n_ao_quadrado', E: -EnH * Math.abs(1 / nf - 1 / ni), quem: '$n$ em vez de $n^2$ no denominador de $E_n$', comoE: false },
        ];
        let exato, erros, unidade, texto, verificacao, tolerancias;
        if (!comLambda) {
          exato = Efot;
          unidade = 'J';
          texto = (v) => sciU(v, '\\mathrm{J}');
          erros = errosE.map((x) => ({ codigo: x.codigo, valor: aAS(x.E, 3), explicacao: 'Usaste ' + x.quem + ' e obtiveste ' + sciU(x.E, '\\mathrm{J}') + '; a energia do fotão é a diferença entre os dois níveis, $|E_{' + nf + '} - E_{' + ni + '}|$.' }));
          resolucao.push({ passo: 'Energia do fotão ' + acao, porque: 'O fotão leva (ou traz) exatamente a diferença de energia entre os níveis.', calculo: 'E_{\\mathrm{f}} = |\\Delta E| \\approx ' + cient(Efot, 3) + '\\,\\mathrm{J}' });
          const v = -EnH * Math.abs(1 / (nf * nf) - 1 / (ni * ni));
          verificacao = { passo: 'Calcular de uma só vez, pondo em evidência a constante', calculo: 'E_{\\mathrm{f}} = ' + texEnH() + ' \\times \\left|' + inversoN2(nf) + ' - ' + inversoN2(ni) + '\\right| \\approx ' + cient(v, 3) + '\\,\\mathrm{J}', valor: aAS(v, 3) };
          tolerancias = (r) => ({ toleranciaRelativa: A.tolMeiaUnidade(r, 3) / r });
        } else {
          exato = t.lambda * 1e9;
          unidade = 'nm';
          texto = (v) => '$' + texAS(v, 3) + '\\,\\mathrm{nm}$';
          erros = errosE.map((x) => {
            const l = h * c / x.E * 1e9;
            return { codigo: x.codigo, valor: aAS(l, 3), explicacao: 'Usaste ' + x.quem + (x.comoE ? ' como energia do fotão' : '') + ' e obtiveste $' + texAS(l, 3) + '\\,\\mathrm{nm}$; a energia do fotão é a diferença entre os dois níveis, $|E_{' + nf + '} - E_{' + ni + '}|$.' };
          });
          if (formato === 'numerica') erros.push({ codigo: 'nao_converteu_m_em_nm', valor: aAS(t.lambda, 3), explicacao: '$' + cient(t.lambda, 3) + '$ é o comprimento de onda em metros; em nanómetros multiplica-se por $10^{9}$.' });
          resolucao.push({ passo: 'Calcular o comprimento de onda', porque: 'O fotão tem $E = |\\Delta E| = \\dfrac{hc}{\\lambda}$, logo $\\lambda = \\dfrac{hc}{|\\Delta E|}$ (com $|\\Delta E|$ por arredondar); depois passa-se a nanómetros.', calculo: '\\lambda = \\dfrac{' + texH() + ' \\times ' + texC() + '}{' + cient(Efot, 4) + '} \\approx ' + cient(t.lambda, 4) + '\\,\\mathrm{m} \\approx ' + texAS(exato, 3) + '\\,\\mathrm{nm}', bloco: true });
          const r = aAS(exato, 3);
          verificacao = { passo: 'Confirmar que hc/λ dá a diferença de energia entre os níveis', calculo: '\\dfrac{' + texH() + ' \\times ' + texC() + '}{' + texAS(r, 3) + ' \\times 10^{-9}} \\approx ' + cient(h * c / (r * 1e-9), 3) + '\\,\\mathrm{J} \\approx |\\Delta E|', valor: aAS(h * c / (Math.abs(Ef - Ei)) * 1e9, 3) };
          // Relativa: o erro «em metros» vale ~10⁻⁷ e, com tolerância absoluta, uma resposta 0 seria tomada por ele.
          tolerancias = (x) => ({ toleranciaRelativa: A.tolMeiaUnidade(x, 3) / x });
        }
        if (ambiguo(exato, 3)) return null;
        const resposta = aAS(exato, 3);
        return fechar(rng, formato, {
          enunciado, resolucao, dados: { ni, nf, contexto },
          esquema: { id: 'fqa-niveis', opcoes: { ni, nf } },
        }, Object.assign({ resposta, unidade, algarismos: 3, texto, erros, verificacao }, tolerancias(resposta)));
      });
    },
    verificarIndependente(p) {
      const { ni, nf, contexto } = p.dados;
      const { h, c, EnH } = K();
      const E = Math.abs(EnH / (nf * nf) - EnH / (ni * ni));
      if (contexto === 'energia') return confere(p, aAS(E, 3), (v) => sciU(v, '\\mathrm{J}'));
      return confere(p, aAS(h * c / E * 1e9, 3), (v) => '$' + texAS(v, 3) + '\\,\\mathrm{nm}$');
    },
    limites(p) {
      const { ni, nf } = p.dados;
      return ni !== nf && ni >= 1 && ni <= 6 && nf >= 1 && nf <= 6;
    },
  });

  const textoRisca = (tipo, n) => 'De ' + tipo + ', da série de ' + SERIE[n] + ', ' + ZONA_SERIE[n] + '.';
  const textoFotao = (verbo, E) => maiuscula(verbo) + ' um fotão de energia ' + sciU(E, '\\mathrm{J}') + '.';

  registar({
    subtema: 'espectros', tipo: 'classificar-transicao', nome: 'Emissão ou absorção, série e energia numa transição do H',
    formatos: ['escolha', 'vf'], contextos: ['emissao', 'absorcao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const emissao = contexto === 'emissao';
        let ni, nf;
        if (emissao) {
          nf = inteiro(rng, 1, 3);
          ni = inteiro(rng, nf + 1, 6);
        } else {
          ni = inteiro(rng, 1, 5);
          nf = inteiro(rng, ni + 1, 6);
        }
        const t = Q().transicaoH(ni, nf);
        const Efot = Math.abs(t.deltaE);
        const Ei = Math.abs(Q().energiaNivelH(ni));
        const Ef = Math.abs(Q().energiaNivelH(nf));
        const zonaReal = Q().zonaEspectro(t.lambda);
        const ZONA_ID = { 1: 'UV', 2: 'visivel', 3: 'IV' };
        if (emissao && zonaReal !== ZONA_ID[nf]) return null;
        const resolucao = [
          { passo: 'Ver o sentido da transição', porque: emissao ? 'O eletrão desce de $n = ' + ni + '$ para $n = ' + nf + '$: perde energia, por isso o átomo emite um fotão.' : 'O eletrão sobe de $n = ' + ni + '$ para $n = ' + nf + '$: ganha energia, por isso o átomo tem de absorver um fotão.' },
        ];
        if (emissao) resolucao.push({ passo: 'Identificar a série', porque: 'Nas riscas de emissão, a série é dada pelo nível final: $n = ' + nf + '$ é a série de ' + SERIE[nf] + ', ' + ZONA_SERIE[nf] + '.', calculo: '\\lambda = \\dfrac{hc}{|\\Delta E|} \\approx ' + Math.round(t.lambda * 1e9) + '\\,\\mathrm{nm}' });
        else resolucao.push({ passo: 'Calcular a energia do fotão', porque: 'O fotão absorvido tem exatamente a diferença de energia entre os níveis, $|E_{' + nf + '} - E_{' + ni + '}|$.', calculo: '|\\Delta E| = \\left|' + EnTex(nf) + ' - (' + EnTex(ni) + ')\\right| \\approx ' + cient(Efot, 3) + '\\,\\mathrm{J}', bloco: true });
        const transicaoConj = 'o eletrão do átomo de hidrogénio passe do nível $n = ' + ni + '$ para o nível $n = ' + nf + '$';
        const transicao = 'o eletrão do átomo de hidrogénio passa do nível $n = ' + ni + '$ para o nível $n = ' + nf + '$';
        const dados = { ni, nf, contexto, afirmacao: null };
        const ver = { passo: 'Confirmar pelo sinal de ΔE = E(final) − E(inicial)', calculo: '\\Delta E \\approx ' + cient(t.deltaE, 3) + '\\,\\mathrm{J}' + (t.deltaE < 0 ? ' < 0' : ' > 0') };
        if (formato === 'escolha') {
          if (emissao) {
            const certa = textoRisca('emissão', nf);
            const outras = [1, 2, 3].filter((n) => n !== nf && n !== ni);
            const erros = [
              { codigo: 'trocou_emissao_com_absorcao', texto: textoRisca('absorção', nf), explicacao: 'O eletrão desce de nível ($n = ' + ni + ' \\to n = ' + nf + '$): perde energia e emite um fotão. Subir é que seria absorção.' },
              ni <= 3 && { codigo: 'serie_pelo_nivel_inicial', texto: textoRisca('emissão', ni), explicacao: 'A série é dada pelo nível **final** da emissão: termina em $n = ' + nf + '$, logo é a série de ' + SERIE[nf] + ', não a de ' + SERIE[ni] + '.' },
              { codigo: 'confundiu_as_series', texto: textoRisca('emissão', outras[0]), explicacao: 'A série de ' + SERIE[outras[0]] + ' é a das transições que terminam em $n = ' + outras[0] + '$; esta termina em $n = ' + nf + '$: série de ' + SERIE[nf] + ', ' + ZONA_SERIE[nf] + '.' },
              { codigo: 'associou_a_zona_errada', texto: 'De emissão, da série de ' + SERIE[nf] + ', ' + ZONA_SERIE[nf === 2 ? 3 : 4 - nf] + '.', explicacao: 'A série está certa, mas as riscas de ' + SERIE[nf] + ' ficam ' + ZONA_SERIE[nf] + ' (esta tem cerca de ' + Math.round(t.lambda * 1e9) + ' nm).' },
            ].filter(Boolean);
            return fecharTexto(rng, {
              enunciado: 'Quando ' + transicao + ', origina-se uma risca…', resolucao, dados,
              verificacao: Object.assign({ valor: null }, ver),
              esquema: { id: 'fqa-niveis', opcoes: { ni, nf } },
            }, certa, erros, certa);
          }
          const certa = textoFotao('absorve', Efot);
          const erros = [
            { codigo: 'trocou_emissao_com_absorcao', texto: textoFotao('emite', Efot), explicacao: 'O eletrão sobe de nível: ganha energia, por isso o átomo absorve o fotão (não o emite).' },
            { codigo: 'usou_so_a_energia_do_nivel_final', texto: textoFotao('absorve', Ef), explicacao: sciU(Ef, '\\mathrm{J}') + ' é só $|E_{' + nf + '}|$; o fotão tem a diferença entre os dois níveis, $|E_{' + nf + '} - E_{' + ni + '}|$.' },
            { codigo: 'usou_so_a_energia_do_nivel_inicial', texto: textoFotao('absorve', Ei), explicacao: sciU(Ei, '\\mathrm{J}') + ' é só $|E_{' + ni + '}|$ (a energia para remover o eletrão desse nível); o fotão tem a diferença entre os dois níveis.' },
            { codigo: 'somou_as_energias_dos_niveis', texto: textoFotao('absorve', Ei + Ef), explicacao: 'Somaste $|E_{' + ni + '}|$ e $|E_{' + nf + '}|$ (' + sciU(Ei + Ef, '\\mathrm{J}') + '); o fotão tem a diferença entre os dois níveis.' },
          ];
          return fecharTexto(rng, {
            enunciado: 'No átomo de hidrogénio, ' + dadosH() + '. Para que ' + transicaoConj + ', o átomo…', resolucao, dados,
            verificacao: Object.assign({ valor: null }, ver, { calculo: ver.calculo + ';\\quad |\\Delta E| \\approx ' + cient(Efot, 3) + '\\,\\mathrm{J}' }),
            esquema: { id: 'fqa-niveis', opcoes: { ni, nf } },
          }, certa, erros, certa);
        }
        // vf: o sentido (emite/absorve) ou, nas emissões, a série.
        const sobreSerie = emissao && ni <= 3 && rng() < 0.5;
        let certaTxt, falsaTxt, erro, afirmacoes;
        if (sobreSerie) {
          certaTxt = 'Quando ' + transicao + ', origina-se uma risca da série de ' + SERIE[nf] + '.';
          falsaTxt = 'Quando ' + transicao + ', origina-se uma risca da série de ' + SERIE[ni] + '.';
          erro = { codigo: 'serie_pelo_nivel_inicial', explicacao: 'A série é dada pelo nível final da emissão ($n = ' + nf + '$): é a série de ' + SERIE[nf] + ', não a de ' + SERIE[ni] + '.' };
          afirmacoes = [{ serie: nf }, { serie: ni }];
        } else {
          const verbo = (emite) => (emite ? 'emite' : 'absorve');
          certaTxt = 'Quando ' + transicao + ', o átomo ' + verbo(emissao) + ' um fotão.';
          falsaTxt = 'Quando ' + transicao + ', o átomo ' + verbo(!emissao) + ' um fotão.';
          erro = { codigo: 'trocou_emissao_com_absorcao', explicacao: emissao ? 'O eletrão desce de nível: perde energia e o átomo emite um fotão.' : 'O eletrão sobe de nível: ganha energia, por isso o átomo absorve um fotão.' };
          afirmacoes = [{ emite: emissao }, { emite: !emissao }];
        }
        const v = vfDe(rng, certaTxt, falsaTxt, erro);
        dados.afirmacao = v.correta ? afirmacoes[0] : afirmacoes[1];
        return Object.assign({ resolucao, dados, esquema: { id: 'fqa-niveis', opcoes: { ni, nf } } }, v, {
          verificacao: Object.assign({}, ver, { valor: v.correta }),
        });
      });
    },
    verificarIndependente(p) {
      const { ni, nf } = p.dados;
      // Pelo sinal de ΔE calculado com E_n = EnH/n² (sem Manual.quimica.transicaoH).
      const EnH = K().EnH;
      const dE = EnH / (nf * nf) - EnH / (ni * ni);
      const emite = dE < 0;
      if (p.formato === 'vf') {
        const a = p.dados.afirmacao;
        const verdade = a.serie !== undefined ? a.serie === Math.min(ni, nf) : a.emite === emite;
        return p.correta === verdade;
      }
      if (emite) return p.opcoes[p.correta] === textoRisca('emissão', Math.min(ni, nf));
      return chave(p.opcoes[p.correta]) === chave(textoFotao('absorve', Math.abs(dE)));
    },
    limites(p) {
      const { ni, nf, contexto } = p.dados;
      return contexto === 'emissao' ? ni > nf && nf <= 3 && ni <= 6 : ni < nf && nf <= 6;
    },
  });

  // ================================================================ configuracao
  // Configurações como listas [[subnível, eletrões], …] pela ordem de preenchimento (1s 2s 2p 3s 3p 4s 3d; 4p só nos estados excitados).
  const SUBS = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p'];
  const CAP = { s: 2, p: 6, d: 10 };
  const ORB = { s: 1, p: 3, d: 5 };
  const capDe = (nome) => CAP[nome.slice(-1)];
  const orbDe = (nome) => ORB[nome.slice(-1)];
  const NUCLEOS = [['Ar', 5], ['Ne', 3], ['He', 1]];
  const totalE = (l) => soma(l.map(([, e]) => e));
  const limpar = (l) => l.filter(([, e]) => e > 0).sort((a, b) => SUBS.indexOf(a[0]) - SUBS.indexOf(b[0]));
  const cfgQ = (z, q = 0) => Q().configuracao(z, q).subniveis.map((x) => [x.nome, x.eletroes]);
  // Escrita em KaTeX (\mathrm{1s}^{2}: o «1s» em \mathrm não se confunde com um coeficiente 1), com ou sem o cerne de gás nobre.
  function escreverCfg(lista, comCerne) {
    let resto = lista;
    let pre = '';
    if (comCerne) {
      for (const [g, k] of NUCLEOS) {
        if (lista.length > k && lista.slice(0, k).every(([n, e], i) => n === SUBS[i] && e === capDe(n))) {
          pre = '[\\mathrm{' + g + '}]\\,';
          resto = lista.slice(k);
          break;
        }
      }
    }
    return pre + resto.map(([n, e]) => '\\mathrm{' + n + '}^{' + e + '}').join('\\,');
  }
  // Preenchimento independente de Manual.quimica: Aufbau; catiões perdem primeiro os eletrões de maior n (4s antes de 3d).
  function aufbau(z, q = 0) {
    const l = SUBS.slice(0, 7).map((n) => [n, 0]);
    let resto = z - (q < 0 ? q : 0);
    for (const x of l) {
      const e = Math.min(capDe(x[0]), resto);
      x[1] = e;
      resto -= e;
    }
    for (let i = 0; i < q; i++) {
      const ocupados = l.filter(([, e]) => e > 0);
      const maxN = Math.max(...ocupados.map(([n]) => Number(n[0])));
      const doNivel = ocupados.filter(([n]) => Number(n[0]) === maxN);
      doNivel[doNivel.length - 1][1]--;
    }
    return limpar(l);
  }
  // Estado excitado: um eletrão do último subnível ocupado passa para o subnível seguinte.
  function excitar(lista) {
    const l = lista.map((x) => x.slice());
    const ultimo = l[l.length - 1];
    const prox = SUBS[SUBS.indexOf(ultimo[0]) + 1];
    if (!prox) return null;
    ultimo[1]--;
    const ja = l.find(([n]) => n === prox);
    if (ja) ja[1]++;
    else l.push([prox, 1]);
    return limpar(l);
  }
  // 3d antes de 4s (ordem 1s 2s 2p 3s 3p 3d 4s), para Z ≥ 19.
  function tresDAntes(z) {
    const ordem = ['1s', '2s', '2p', '3s', '3p', '3d', '4s'];
    let resto = z;
    const l = [];
    for (const n of ordem) {
      const e = Math.min(capDe(n), resto);
      if (e > 0) l.push([n, e]);
      resto -= e;
    }
    return limpar(l);
  }
  const igualCfg = (a, b) => a.length === b.length && a.every(([n, e], i) => b[i][0] === n && b[i][1] === e);
  const IOES = [
    ['Li', 1], ['N', -3], ['O', -2], ['F', -1], ['Na', 1], ['Mg', 2], ['Al', 3], ['P', -3], ['S', -2], ['Cl', -1],
    ['K', 1], ['Ca', 2], ['Sc', 3], ['Ti', 2], ['V', 2], ['V', 3],
  ];
  const caixasTex = (nome, e) => {
    const k = orbDe(nome);
    const caixas = [];
    for (let i = 0; i < k; i++) {
      const n = (i < e ? 1 : 0) + (i + k < e ? 1 : 0);
      caixas.push('[' + (n === 2 ? '\\uparrow\\downarrow' : n === 1 ? '\\uparrow' : '\\ \\ ') + ']');
    }
    return '\\mathrm{' + nome + '}\\colon\\ ' + caixas.join('\\,');
  };

  registar({
    subtema: 'configuracao', tipo: 'escrever', nome: 'Configuração eletrónica de átomos e iões',
    formatos: ['escolha', 'vf'], contextos: ['atomo', 'iao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        let s, z, q, correta, comCerne, enunciadoEsp, resolucao;
        const erros = [];
        if (contexto === 'atomo') {
          z = inteiro(rng, 1, 23);
          s = simboloDeZ(z);
          q = 0;
          correta = cfgQ(z);
          comCerne = z > 10 && rng() < 0.5;
          enunciadoEsp = 'do átomo de ' + nome(s) + ' ($Z = ' + z + '$)';
          resolucao = [
            { passo: 'Contar os eletrões', porque: 'O átomo neutro tem tantos eletrões como protões: ' + z + '.' },
            { passo: 'Distribuir pela ordem de energia', porque: 'Princípio da Construção: $' + SUBS.slice(0, 7).map((n) => '\\mathrm{' + n + '}').join(' \\to ') + '$, com no máximo 2 eletrões num subnível s, 6 num p e 10 num d.', calculo: escreverCfg(correta, false) + (comCerne ? ' = ' + escreverCfg(correta, true) : '') },
          ];
          const exc = excitar(correta);
          if (z >= 19) erros.push({ codigo: 'preencheu_3d_antes_de_4s', lista: tresDAntes(z), explicacao: (l) => 'Puseste eletrões no 3d antes de encher o 4s ($' + escreverCfg(l, comCerne) + '$); o 4s tem menor energia que o 3d e preenche-se primeiro.' });
          const ult = correta[correta.length - 1];
          const pen = correta[correta.length - 2];
          if (pen && pen[0].endsWith('p') && pen[1] === 6 && ult[0].endsWith('s') && ult[1] <= 2) {
            const l = correta.slice(0, -2).concat([[pen[0], 6 + ult[1]]]);
            erros.push({ codigo: 'p_com_mais_de_seis_eletroes', lista: l, explicacao: (x) => 'Em $' + escreverCfg(x, comCerne) + '$ o subnível ' + pen[0] + ' tem ' + (6 + ult[1]) + ' eletrões; um subnível p tem 3 orbitais e, pelo Princípio da Exclusão de Pauli, no máximo 6 eletrões.' });
          }
          if (pen && pen[1] === capDe(pen[0]) && ult[0].endsWith('s') && ult[1] === 1) {
            const l = correta.slice(0, -2).concat([[pen[0], pen[1] - 1], [ult[0], 2]]);
            erros.push({ codigo: 'passou_ao_subnivel_seguinte_sem_completar', lista: limpar(l), explicacao: (x) => 'Em $' + escreverCfg(x, comCerne) + '$ o ' + pen[0] + ' ficou incompleto e o ' + ult[0] + ' com 2 eletrões; pelo Princípio da Construção, o ' + pen[0] + ' (de menor energia) completa-se antes.' });
          }
          if (exc) erros.push({ codigo: 'configuracao_de_estado_excitado', lista: exc, explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ é um estado excitado: um eletrão está num subnível de maior energia enquanto há lugar num de menor energia.' });
          if (z + 1 <= 23) erros.push({ codigo: 'contou_um_eletrao_a_mais', lista: cfgQ(z + 1), explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ tem ' + pl(z + 1, ...ELET) + '; o átomo de ' + nome(s) + ' tem ' + z + '.' });
          if (z - 1 >= 1) erros.push({ codigo: 'contou_um_eletrao_a_menos', lista: cfgQ(z - 1), explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ tem ' + pl(z - 1, ...ELET) + '; o átomo de ' + nome(s) + ' tem ' + z + '.' });
        } else {
          [s, q] = escolher(rng, IOES);
          z = el(s).z;
          correta = cfgQ(z, q);
          const blocoD = el(s).bloco === 'd';
          comCerne = blocoD;
          const nE = z - q;
          enunciadoEsp = 'do ião $' + especie(s, q) + '$ ($Z = ' + z + '$)';
          resolucao = [
            { passo: 'Contar os eletrões do ião', porque: (q > 0 ? 'Um catião $' + q + '+$ perdeu ' + q : 'Um anião $' + -q + '-$ ganhou ' + -q) + (Math.abs(q) === 1 ? ' eletrão' : ' eletrões') + ' em relação ao átomo.', calculo: 'e = ' + z + (q > 0 ? ' - ' + q : ' + ' + -q) + ' = ' + nE },
          ];
          if (blocoD) {
            resolucao.push({ passo: 'Escrever a configuração do átomo', porque: 'Pela ordem de energia, o 4s preenche-se antes do 3d.', calculo: escreverCfg(cfgQ(z), true) });
            resolucao.push({ passo: 'Tirar primeiro os eletrões 4s', porque: 'Nos catiões, saem primeiro os eletrões do nível mais exterior ($n = 4$), mesmo que o 4s se tenha preenchido antes do 3d.', calculo: '\\mathrm{' + s + cargaTex(q) + '}\\colon\\ ' + escreverCfg(correta, true) });
          } else {
            resolucao.push({ passo: q > 0 ? 'Tirar os eletrões do nível mais exterior' : 'Continuar o preenchimento', porque: q > 0 ? 'Num catião saem os eletrões de valência; fica a configuração de um gás nobre.' : 'Num anião os eletrões a mais continuam o preenchimento; fica a configuração de um gás nobre.', calculo: escreverCfg(correta, false) });
          }
          erros.push({ codigo: 'ignorou_a_carga', lista: cfgQ(z), explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ é a configuração do átomo neutro (' + pl(z, ...ELET) + '); o ião tem ' + nE + '.' });
          if (blocoD) {
            const l = cfgQ(z).map((x) => x.slice());
            let tirar = q;
            for (const nomeS of ['3d', '4s']) {
              const x = l.find(([n]) => n === nomeS);
              const t = Math.min(x ? x[1] : 0, tirar);
              if (x) x[1] -= t;
              tirar -= t;
            }
            erros.push({ codigo: 'tirou_3d_antes_de_4s', lista: limpar(l), explicacao: (x) => 'Tiraste os eletrões ao 3d ($' + escreverCfg(x, comCerne) + '$); o 4s enche-se antes do 3d, mas nos catiões é o primeiro a perder eletrões.' });
          }
          if (z + q >= 1 && z + q <= 23 && q !== 0) erros.push({ codigo: 'trocou_o_sinal_da_carga', lista: cfgQ(z, -q), explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ tem ' + pl(z + q, ...ELET) + ': ' + (q > 0 ? 'somaste os eletrões que o catião perdeu' : 'tiraste os eletrões que o anião ganhou') + '. O ião tem ' + nE + '.' });
          const exc = excitar(correta);
          if (exc) erros.push({ codigo: 'configuracao_de_estado_excitado', lista: exc, explicacao: (x) => '$' + escreverCfg(x, comCerne) + '$ é um estado excitado do ião: um eletrão está num subnível de maior energia enquanto há lugar num de menor energia.' });
        }
        const certaTxt = '$' + escreverCfg(correta, comCerne) + '$';
        const errosT = erros
          .filter((e) => !igualCfg(e.lista, correta))
          .map((e) => ({ codigo: e.codigo, texto: '$' + escreverCfg(e.lista, comCerne) + '$', explicacao: e.explicacao(e.lista), lista: e.lista }));
        const dados = { simbolo: s, z, carga: q, comCerne, listas: {} };
        errosT.forEach((e) => { dados.listas[chave(e.texto)] = e.lista; });
        dados.listas[chave(certaTxt)] = correta;
        const verificacao = { passo: 'Confirmar o número de eletrões somando os expoentes', calculo: correta.map(([, e]) => e).join(' + ') + ' = ' + totalE(correta), valor: null };
        const esquema = { id: 'fqa-configuracao', opcoes: { z } };
        const limpa = (e) => ({ codigo: e.codigo, texto: e.texto, explicacao: e.explicacao });
        if (formato === 'escolha') {
          return fecharTexto(rng, {
            enunciado: 'Qual é a configuração eletrónica ' + enunciadoEsp + ' no estado fundamental?', resolucao, dados, verificacao, esquema,
          }, certaTxt, errosT.map(limpa), certaTxt);
        }
        if (!errosT.length) return null;
        const falsa = escolher(rng, errosT);
        const frase = (t) => 'A configuração eletrónica ' + enunciadoEsp + ' no estado fundamental é ' + t + '.';
        const v = vfDe(rng, frase(certaTxt), frase(falsa.texto), { codigo: falsa.codigo, explicacao: falsa.explicacao });
        dados.mostrada = v.correta ? correta : falsa.lista;
        return Object.assign({ resolucao, dados, esquema }, v, { verificacao: Object.assign({}, verificacao, { valor: v.correta }) });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      const certa = aufbau(d.z, d.carga);
      if (p.formato === 'vf') return p.correta === igualCfg(d.mostrada, certa);
      const l = d.listas[chave(p.opcoes[p.correta])];
      return !!l && igualCfg(l, certa) && p.opcoes.filter((o) => igualCfg(d.listas[chave(o)] || [], certa)).length === 1;
    },
    limites(p) {
      return p.dados.z >= 1 && p.dados.z <= 23 && p.dados.z - p.dados.carga <= 23;
    },
  });

  // Eletrões desemparelhados e orbitais ocupadas por subnível (regra de Hund), sem Manual.quimica.
  const desemparelhadosDe = (l) => soma(l.map(([n, e]) => (e <= orbDe(n) ? e : 2 * orbDe(n) - e)));
  const orbitaisDe = (l) => soma(l.map(([n, e]) => Math.min(e, orbDe(n))));
  const ultimoNivel = (l) => Math.max(...l.map(([n]) => Number(n[0])));
  const doNivel = (l, n) => l.filter(([s]) => Number(s[0]) === n);

  registar({
    subtema: 'configuracao', tipo: 'contar', nome: 'Eletrões de valência, eletrões desemparelhados e orbitais ocupadas',
    formatos: ['numerica', 'escolha'], contextos: ['desemparelhados', 'valencia', 'orbitais'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const z = contexto === 'valencia' ? inteiro(rng, 1, 20) : inteiro(rng, 1, 23);
        const s = simboloDeZ(z);
        const cQ = Q().configuracao(z);
        const l = cfgQ(z);
        const cfgT = escreverCfg(l, false);
        const nU = ultimoNivel(l);
        const ultimo = l[l.length - 1];
        const parciais = l.filter(([n, e]) => e < capDe(n));
        const caixas = (parciais.length ? parciais : [ultimo]).map(([n, e]) => caixasTex(n, e)).join(';\\quad ');
        const enunciado = {
          desemparelhados: 'Quantos eletrões desemparelhados tem o átomo de ' + nome(s) + ' ($Z = ' + z + '$) no estado fundamental?',
          valencia: 'Quantos eletrões de valência tem o átomo de ' + nome(s) + ' ($Z = ' + z + '$)?',
          orbitais: 'Quantas orbitais estão ocupadas no átomo de ' + nome(s) + ' ($Z = ' + z + '$) no estado fundamental?',
        }[contexto];
        const resolucao = [{ passo: 'Escrever a configuração eletrónica', porque: 'Os ' + z + (z === 1 ? ' eletrão distribui-se' : ' eletrões distribuem-se') + ' pela ordem de energia dos subníveis.', calculo: cfgT }];
        let resposta, erros, verificacao;
        if (contexto === 'desemparelhados') {
          resposta = cQ.desemparelhados;
          resolucao.push({ passo: 'Aplicar a regra de Hund aos subníveis incompletos', porque: parciais.length ? 'Nas orbitais degeneradas entra primeiro um eletrão em cada orbital; só depois emparelham. Os subníveis completos não têm eletrões desemparelhados.' : 'Todos os subníveis estão completos: todos os eletrões estão emparelhados.', calculo: caixas });
          const pares = soma(parciais.map(([, e]) => e % 2));
          erros = [
            { codigo: 'nao_maximizou_os_desemparelhados', valor: pares, explicacao: 'Emparelhaste os eletrões antes de ocupar todas as orbitais (' + pares + (pares === 1 ? ' desemparelhado' : ' desemparelhados') + '); pela regra de Hund, entra primeiro um eletrão em cada orbital degenerada.' },
            { codigo: 'contou_os_eletroes_de_valencia', valor: cQ.valencia, explicacao: cQ.valencia + ' é o número de eletrões de valência; desemparelhados são só os que estão sozinhos numa orbital.' },
            { codigo: 'contou_os_eletroes_do_ultimo_subnivel', valor: ultimo[1], explicacao: 'Contaste todos os eletrões do ' + ultimo[0] + ' (' + ultimo[1] + '); só estão desemparelhados os que ficam sozinhos numa orbital (regra de Hund).' },
          ].filter((x) => formato !== 'numerica' || x.valor !== 0); // na numérica, um erro de valor 0 confundir-se-ia com uma resposta 0
          verificacao = { passo: 'Contar subnível a subnível: desemparelhados = e se e ≤ nº de orbitais, senão 2 × orbitais − e', calculo: l.map(([n, e]) => (e <= orbDe(n) ? e : 2 * orbDe(n) - e)).join(' + ') + ' = ' + desemparelhadosDe(l), valor: desemparelhadosDe(l) };
        } else if (contexto === 'valencia') {
          resposta = cQ.valencia;
          const ult = doNivel(l, nU);
          resolucao.push({ passo: 'Contar os eletrões do último nível', porque: 'Nos elementos representativos, os eletrões de valência são os do último nível ocupado ($n = ' + nU + '$).', calculo: escreverCfg(ult, false) + '\\colon\\ ' + ult.map(([, e]) => e).join(' + ') + ' = ' + resposta });
          const sP = ult.filter(([n]) => n.endsWith('p'));
          erros = [
            sP.length && { codigo: 'contou_so_os_eletroes_p', valor: sP[0][1], explicacao: 'Contaste só os eletrões ' + sP[0][0] + ' (' + sP[0][1] + '); os do ' + nU + 's também são do último nível e contam.' },
            sP.length && { codigo: 'contou_so_os_eletroes_s', valor: ult[0][1], explicacao: 'Contaste só os eletrões ' + ult[0][0] + ' (' + ult[0][1] + '); os eletrões ' + sP[0][0] + ' também são do último nível.' },
            { codigo: 'deu_o_numero_do_ultimo_nivel', valor: nU, explicacao: nU + ' é o número do último nível (o período); os eletrões de valência são ' + (resposta === 1 ? 'o único eletrão' : 'os ' + resposta + ' eletrões') + ' desse nível.' },
            z - resposta > 0 && { codigo: 'contou_os_eletroes_do_cerne', valor: z - resposta, explicacao: z - resposta + ' são os eletrões interiores (do cerne); os de valência são os do último nível: ' + resposta + '.' },
            { codigo: 'contou_todos_os_eletroes', valor: z, explicacao: z + ' é o número total de eletrões; os de valência são só os do último nível: ' + resposta + '.' },
          ].filter(Boolean);
          const cerne = z - totalE(doNivel(l, nU));
          verificacao = cerne > 0
            ? { passo: 'Tirar ao total os eletrões do cerne (níveis interiores)', calculo: z + ' - ' + cerne + ' = ' + (z - cerne), valor: z - cerne }
            : { passo: 'Sem níveis interiores: todos os eletrões são de valência', calculo: 'e_{\\mathrm{total}} = ' + z, valor: z };
        } else {
          resposta = cQ.orbitaisOcupadas;
          resolucao.push({ passo: 'Contar as orbitais com pelo menos um eletrão', porque: 'Os subníveis s, p e d têm 1, 3 e 5 orbitais. Nos subníveis completos estão todas ocupadas; nos incompletos, pela regra de Hund, cada eletrão ocupa primeiro uma orbital vazia.', calculo: l.map(([n, e]) => Math.min(e, orbDe(n))).join(' + ') + ' = ' + resposta });
          const emparelhadas = soma(l.map(([, e]) => Math.ceil(e / 2)));
          const doUlt = soma(doNivel(l, nU).map(([n, e]) => Math.min(e, orbDe(n))));
          erros = [
            { codigo: 'contou_subniveis_em_vez_de_orbitais', valor: l.length, explicacao: l.length + ' é o número de subníveis ocupados; cada subnível p tem 3 orbitais e cada d tem 5.' },
            { codigo: 'emparelhou_antes_de_ocupar_as_orbitais', valor: emparelhadas, explicacao: 'Emparelhaste os eletrões antes de ocupar as orbitais vazias (' + emparelhadas + ' orbitais); pela regra de Hund, nas orbitais degeneradas entra primeiro um eletrão em cada uma.' },
            { codigo: 'contou_os_eletroes_em_vez_das_orbitais', valor: z, explicacao: z + ' é o número de eletrões; cada orbital tem no máximo 2.' },
            { codigo: 'contou_so_as_orbitais_do_ultimo_nivel', valor: doUlt, explicacao: doUlt + ' são só as orbitais ocupadas do último nível; as dos níveis interiores também contam.' },
          ];
          verificacao = { passo: 'Contar as caixas do diagrama que têm pelo menos uma seta', calculo: 'n_{\\mathrm{orbitais}} = ' + orbitaisDe(l), valor: orbitaisDe(l) };
        }
        return fechar(rng, formato, { enunciado, resolucao, dados: { z, contexto }, esquema: { id: 'fqa-configuracao', opcoes: { z } } }, {
          resposta, tolerancia: 0, texto: (v) => fmt(v), erros: erros.filter((e) => e.valor >= 0), verificacao,
        });
      });
    },
    verificarIndependente(p) {
      const l = aufbau(p.dados.z);
      const v = p.dados.contexto === 'desemparelhados' ? desemparelhadosDe(l)
        : p.dados.contexto === 'orbitais' ? orbitaisDe(l) : totalE(doNivel(l, ultimoNivel(l)));
      return confere(p, v, (x) => fmt(x));
    },
    limites(p) {
      return p.dados.z >= 1 && p.dados.z <= (p.dados.contexto === 'valencia' ? 20 : 23);
    },
  });

  // Fundamental, excitada, impossível (subnível com eletrões a mais) ou de outro átomo (número de eletrões ≠ Z).
  const TIPOS_CFG = {
    F: 'Representa o átomo no estado fundamental.',
    E: 'Representa o átomo num estado excitado.',
    I: 'É impossível: um subnível tem mais eletrões do que o máximo permitido.',
    N: 'Não pode ser deste átomo: o número de eletrões é diferente de Z.',
  };
  // Código do erro de quem, perante uma configuração do tipo «de», escolhe o tipo «para».
  const ERROS_CFG = [
    { de: 'F', para: 'E', codigo: 'fundamental_como_excitado' },
    { de: 'F', para: 'I', codigo: 'fundamental_como_impossivel' },
    { de: 'F', para: 'N', codigo: 'contou_mal_os_eletroes' },
    { de: 'E', para: 'F', codigo: 'nao_reconheceu_o_estado_excitado' },
    { de: 'E', para: 'I', codigo: 'excitado_como_impossivel' },
    { de: 'E', para: 'N', codigo: 'excitado_julgado_de_outro_atomo' },
    { de: 'I', para: 'F', codigo: 'nao_viu_o_limite_de_eletroes' },
    { de: 'I', para: 'E', codigo: 'impossivel_como_excitado' },
    { de: 'I', para: 'N', codigo: 'impossivel_julgado_de_outro_atomo' },
    { de: 'N', para: 'F', codigo: 'nao_contou_os_eletroes' },
    { de: 'N', para: 'E', codigo: 'outro_atomo_julgado_excitado' },
    { de: 'N', para: 'I', codigo: 'outro_atomo_julgado_impossivel' },
  ];
  const CODIGOS_CFG = {};
  for (const e of ERROS_CFG) (CODIGOS_CFG[e.de] = CODIGOS_CFG[e.de] || {})[e.para] = e.codigo;
  function impossivel(lista) {
    // Um eletrão do último subnível passa para um subnível anterior já completo (fica com eletrões a mais).
    const cheios = lista.slice(0, -1).filter(([n, e]) => e === capDe(n));
    if (!cheios.length) return null;
    const alvo = cheios[cheios.length - 1][0];
    const l = lista.map((x) => x.slice());
    l[l.length - 1][1]--;
    l.find(([n]) => n === alvo)[1]++;
    return limpar(l);
  }
  function classificarCfg(l, z) {
    if (totalE(l) !== z) return 'N';
    if (l.some(([n, e]) => e > capDe(n))) return 'I';
    return igualCfg(l, aufbau(z)) ? 'F' : 'E';
  }
  // Porquê de cada tipo, com os números da configuração mostrada.
  function porqueCfg(tipo, l, z) {
    if (tipo === 'N') return 'tem ' + pl(totalE(l), ...ELET) + ', e o átomo tem ' + z;
    if (tipo === 'I') {
      const [n, e] = l.find(([s, x]) => x > capDe(s));
      return 'tem ' + e + ' eletrões no ' + n + ', mas um subnível ' + n.slice(-1) + ' tem no máximo ' + capDe(n);
    }
    if (tipo === 'E') {
      const f = aufbau(z);
      const falta = f.find(([n, e]) => { const x = l.find(([s]) => s === n); return !x || x[1] < e; });
      const acima = l.find(([n, e]) => { const x = f.find(([s]) => s === n); return !x || x[1] < e; });
      return 'tem ' + pl(z, ...ELET) + ', mas um eletrão está no ' + acima[0] + ', de maior energia, quando ainda cabia no ' + falta[0];
    }
    return 'tem ' + pl(z, ...ELET) + ', distribuídos pela ordem de energia, sem ultrapassar o máximo de cada subnível';
  }
  const CURTO_CFG = { F: 'o estado fundamental', E: 'um estado excitado', I: 'uma configuração impossível', N: 'a configuração de outro átomo' };
  const conclusaoCfg = (tipo, l, z) => 'Esta configuração ' + porqueCfg(tipo, l, z) + ': é ' + CURTO_CFG[tipo];

  registar({
    subtema: 'configuracao', tipo: 'identificar', nome: 'Configuração fundamental, excitada ou impossível',
    formatos: ['escolha', 'vf'], contextos: ['classificar', 'escolher'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const z = inteiro(rng, 3, 23);
        const s = simboloDeZ(z);
        const fund = cfgQ(z);
        const exc = excitar(fund);
        const imp = impossivel(fund);
        const outroZ = z + (z === 23 || rng() < 0.5 ? -1 : 1);
        const outro = cfgQ(outroZ);
        if (!exc || !imp) return null;
        const porTipo = { F: fund, E: exc, I: imp, N: outro };
        const T = (l) => '$' + escreverCfg(l, false) + '$';
        const doAtomo = 'do átomo de ' + nome(s) + ' ($Z = ' + z + '$)';
        const resolucaoDe = (tipo, l) => [
          { passo: 'Contar os eletrões', porque: 'Somam-se os expoentes e compara-se com $Z = ' + z + '$.', calculo: l.map(([, e]) => e).join(' + ') + ' = ' + totalE(l) },
          { passo: 'Ver os subníveis', porque: 'Cabem no máximo 2 eletrões num subnível s, 6 num p e 10 num d; no estado fundamental ocupam-se por ordem de energia.' },
          { passo: 'Concluir', porque: conclusaoCfg(tipo, l, z) + '.' },
        ];
        const ver = (valor) => ({ passo: 'Comparar com a configuração do estado fundamental, obtida pela ordem de energia', calculo: escreverCfg(fund, false), valor });
        const esquema = { id: 'fqa-configuracao', opcoes: { z } };
        const dados = { z, contexto, listas: {} };
        if (contexto === 'classificar' && formato === 'escolha') {
          const tipo = escolher(rng, ['F', 'E', 'I', 'N']);
          const l = porTipo[tipo];
          dados.mostrada = l;
          const erros = Object.keys(TIPOS_CFG).filter((x) => x !== tipo).map((x) => ({
            codigo: CODIGOS_CFG[tipo][x], texto: TIPOS_CFG[x],
            explicacao: conclusaoCfg(tipo, l, z) + ', e não ' + CURTO_CFG[x] + '.',
          }));
          return fecharTexto(rng, {
            enunciado: 'A configuração eletrónica ' + T(l) + ' foi atribuída ao átomo de ' + nome(s) + ' ($Z = ' + z + '$). O que se pode concluir?',
            resolucao: resolucaoDe(tipo, l), dados, verificacao: ver(null), esquema,
          }, TIPOS_CFG[tipo], erros, TIPOS_CFG[classificarCfg(l, z)]);
        }
        if (contexto === 'escolher' && formato === 'escolha') {
          const erros = ['F', 'I', 'N'].map((x) => ({
            codigo: CODIGOS_CFG[x].E, texto: T(porTipo[x]),
            explicacao: 'A configuração ' + T(porTipo[x]) + ' ' + porqueCfg(x, porTipo[x], z) + ': é ' + CURTO_CFG[x] + ', não um estado excitado.',
          }));
          Object.keys(porTipo).forEach((x) => { dados.listas[chave(T(porTipo[x]))] = porTipo[x]; });
          return fecharTexto(rng, {
            enunciado: 'Qual destas configurações eletrónicas representa um estado excitado ' + doAtomo + '?', resolucao: resolucaoDe('E', exc), dados, verificacao: ver(null), esquema,
          }, T(exc), erros, T(exc));
        }
        // vf: «representa o átomo no estado fundamental» (classificar) ou «num estado excitado» (escolher).
        const alvo = contexto === 'classificar' ? 'F' : 'E';
        const tipoFalso = escolher(rng, Object.keys(porTipo).filter((x) => x !== alvo));
        const frase = (l) => 'A configuração eletrónica ' + T(l) + (alvo === 'F' ? ' representa o estado fundamental ' : ' representa um estado excitado ') + doAtomo + '.';
        const v = vfDe(rng, frase(porTipo[alvo]), frase(porTipo[tipoFalso]), {
          codigo: CODIGOS_CFG[tipoFalso][alvo], explicacao: conclusaoCfg(tipoFalso, porTipo[tipoFalso], z) + ', e não ' + CURTO_CFG[alvo] + '.',
        });
        const tipoMostrado = v.correta ? alvo : tipoFalso;
        dados.mostrada = porTipo[tipoMostrado];
        return Object.assign({ resolucao: resolucaoDe(tipoMostrado, dados.mostrada), dados, esquema }, v, { verificacao: ver(v.correta) });
      });
    },
    verificarIndependente(p) {
      const d = p.dados;
      if (d.contexto === 'classificar') {
        const tipo = classificarCfg(d.mostrada, d.z);
        if (p.formato === 'vf') return p.correta === (tipo === 'F');
        return p.opcoes[p.correta] === TIPOS_CFG[tipo];
      }
      if (p.formato === 'vf') return p.correta === (classificarCfg(d.mostrada, d.z) === 'E');
      const l = d.listas[chave(p.opcoes[p.correta])];
      return !!l && classificarCfg(l, d.z) === 'E' && p.opcoes.filter((o) => classificarCfg(d.listas[chave(o)] || [], d.z) === 'E').length === 1;
    },
    limites(p) {
      return p.dados.z >= 3 && p.dados.z <= 23;
    },
  });

  // ================================================================ tabela-periodica
  const posTexto = (p, g) => 'Período ' + p + ', grupo ' + g;

  registar({
    subtema: 'tabela-periodica', tipo: 'posicao', nome: 'Período, grupo e bloco a partir de Z ou da configuração',
    formatos: ['escolha', 'numerica'], contextos: ['z', 'configuracao'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const z = inteiro(rng, 1, 23);
        const s = simboloDeZ(z);
        const pos = Q().posicaoTP(z);
        const { grupo: G0, periodo: P, bloco: B } = pos;
        const l = cfgQ(z);
        const cfgT = escreverCfg(l, true);
        const ult = doNivel(l, P);
        const v = totalE(ult);
        const pE = (ult.find(([n]) => n.endsWith('p')) || [null, 0])[1];
        const d3 = (l.find(([n]) => n === '3d') || [null, 0])[1];
        const pergunta = formato === 'numerica' ? (rng() < 0.5 ? 'grupo' : 'periodo') : 'ambos';
        const dadoTxt = contexto === 'z' ? 'Um elemento tem número atómico $Z = ' + z + '$.' : 'Um elemento tem, no estado fundamental, a configuração eletrónica $' + cfgT + '$.';
        const enunciado = dadoTxt + ' ' + (pergunta === 'ambos' ? 'Em que período e em que grupo da Tabela Periódica se encontra?' : pergunta === 'grupo' ? 'A que grupo da Tabela Periódica pertence?' : 'A que período da Tabela Periódica pertence?');
        const resolucao = [];
        if (contexto === 'z') resolucao.push({ passo: 'Escrever a configuração eletrónica', porque: 'A posição na Tabela Periódica lê-se na configuração do átomo.', calculo: cfgT });
        resolucao.push({ passo: 'Período: último nível ocupado', porque: 'O último nível com eletrões é o $n = ' + P + '$.', calculo: '\\text{período} = ' + P });
        resolucao.push({ passo: 'Bloco e grupo', porque: B === 's'
          ? (z === 2 ? 'O último eletrão entrou no 1s (bloco s), mas o hélio, com o nível 1 completo, fica no grupo 18, com os gases nobres.' : 'O último eletrão entrou num subnível s (bloco s): o grupo é o número de eletrões de valência, ' + v + '.')
          : B === 'p' ? 'O último eletrão entrou num subnível p (bloco p): o grupo é 10 + eletrões de valência ($' + escreverCfg(ult, false) + '$, ' + v + ' eletrões).'
            : 'O último eletrão entrou no 3d (bloco d): o grupo é o número de eletrões 4s + 3d.',
        calculo: B === 'p' ? '\\text{grupo} = 10 + ' + v + ' = ' + G0 : B === 'd' ? '\\text{grupo} = 2 + ' + d3 + ' = ' + G0 : '\\text{grupo} = ' + G0 });
        const comb = [];
        if (B === 'p') {
          comb.push({ codigo: 'grupo_sem_somar_10', p: P, g: v, explicacao: 'Tem ' + v + ' eletrões de valência, mas nos grupos do bloco p o número do grupo é $10 + ' + v + ' = ' + G0 + '$.' });
          comb.push({ codigo: 'grupo_pelos_eletroes_p', p: P, g: pE, explicacao: 'Contaste só ' + (pE === 1 ? 'o eletrão p' : 'os ' + pE + ' eletrões p') + '. Os eletrões de valência são todos os do último nível (' + v + ') e no bloco p o grupo é $10 + ' + v + ' = ' + G0 + '$.' });
        }
        if (B === 's' && z !== 2) comb.push({ codigo: 'somou_10_no_bloco_s', p: P, g: G0 + 10, explicacao: 'Somaste 10 (grupo ' + (G0 + 10) + '), mas isso só se faz no bloco p; no bloco s o grupo é o número de eletrões de valência: ' + G0 + '.' });
        if (z === 2) comb.push({ codigo: 'grupo_pelos_eletroes_de_valencia', p: P, g: 2, explicacao: 'O hélio tem 2 eletrões de valência, mas o seu nível está completo, como nos gases nobres: fica no grupo 18.' });
        if (B === 'd') {
          comb.push({ codigo: 'grupo_so_pelos_eletroes_3d', p: P, g: d3, explicacao: 'Contaste só ' + (d3 === 1 ? 'o eletrão 3d' : 'os ' + d3 + ' eletrões 3d') + '; no bloco d o grupo é o número de eletrões 4s + 3d: $2 + ' + d3 + ' = ' + G0 + '$.' });
          comb.push({ codigo: 'periodo_pelo_subnivel_3d', p: 3, g: G0, explicacao: 'O 3d é do nível 3, mas o período é o do último nível ocupado: o 4s, $n = 4$.' });
        }
        if (P >= 2) comb.push({ codigo: 'periodo_pelo_cerne', p: P - 1, g: G0, explicacao: 'O período ' + (P - 1) + ' é o do gás nobre do cerne; o período do elemento é o do último nível ocupado, $n = ' + P + '$.' });
        if (G0 <= 7 && G0 !== P) comb.push({ codigo: 'trocou_periodo_com_grupo', p: G0, g: P, explicacao: 'Trocaste o período com o grupo: o período é a linha (último nível, ' + P + ') e o grupo é a coluna (' + G0 + ').' });
        let resposta, erros;
        if (pergunta === 'ambos') {
          erros = comb.map((c) => ({ codigo: c.codigo, texto: posTexto(c.p, c.g), explicacao: c.explicacao }));
        } else {
          resposta = pergunta === 'grupo' ? G0 : P;
          erros = comb.map((c) => ({ codigo: c.codigo, valor: pergunta === 'grupo' ? c.g : c.p, explicacao: c.explicacao })).filter((e) => e.valor > 0);
        }
        const dados = { z, simbolo: s, pergunta, contexto };
        const verificacao = { passo: 'Confirmar na Tabela Periódica', calculo: '\\mathrm{' + s + '}\\ (Z = ' + z + ')\\colon\\ \\text{período } ' + P + ',\\ \\text{grupo } ' + G0 + ',\\ \\text{bloco } ' + B };
        const esquema = { id: 'fqa-tabela', opcoes: { modo: 'blocos', simbolo: s } };
        if (pergunta === 'ambos') {
          const certa = posTexto(P, G0);
          return fecharTexto(rng, { enunciado, resolucao, dados, verificacao: Object.assign({ valor: null }, verificacao), esquema }, certa, erros, posTexto(el(s).periodo, el(s).grupo));
        }
        return fechar(rng, 'numerica', { enunciado, resolucao, dados, esquema }, {
          resposta, tolerancia: 0, texto: (x) => fmt(x), erros,
          verificacao: Object.assign({}, verificacao, { valor: pergunta === 'grupo' ? el(s).grupo : el(s).periodo }),
        });
      });
    },
    verificarIndependente(p) {
      // Pela tabela de dados (IUPAC), não pela configuração.
      const e = D().elementos[p.dados.simbolo];
      if (p.formato === 'escolha') return p.opcoes[p.correta] === posTexto(e.periodo, e.grupo);
      return confere(p, p.dados.pergunta === 'grupo' ? e.grupo : e.periodo, (x) => fmt(x));
    },
    limites(p) {
      return p.dados.z >= 1 && p.dados.z <= 23;
    },
  });

  // Comparação de raio e energia de ionização (só representativos com Z ≤ 20, sem gases nobres e sem o H; nunca os pares
  // de excecoesEI / excecoesEIGrupo nem raios iguais).
  const REPRESENTATIVOS = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca'];
  function excecao(a, b) {
    const lista = D().excecoesEI.concat(D().excecoesEIGrupo);
    return lista.includes(a + '>' + b) || lista.includes(b + '>' + a);
  }
  function paresComparaveis(modo) {
    const r = [];
    for (const a of REPRESENTATIVOS) for (const b of REPRESENTATIVOS) {
      const ea = el(a);
      const eb = el(b);
      if (ea.z >= eb.z) continue;
      if (modo === 'periodo' ? ea.periodo !== eb.periodo : ea.grupo !== eb.grupo) continue;
      if (excecao(a, b) || ea.raio === eb.raio) continue;
      // As tendências ensinadas têm de se ver nos dados (sem exceções escondidas).
      const tendenciaOk = modo === 'periodo' ? ea.raio > eb.raio && ea.ei1 < eb.ei1 : ea.raio < eb.raio && ea.ei1 > eb.ei1;
      if (tendenciaOk) r.push([a, b]);
    }
    return r;
  }

  registar({
    subtema: 'tabela-periodica', tipo: 'comparar', nome: 'Comparar raio atómico e energia de ionização (com justificação)',
    formatos: ['escolha', 'vf'], contextos: ['periodo', 'grupo'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const [x, y] = escolher(rng, paresComparaveis(contexto));
        const prop = rng() < 0.5 ? 'ei' : 'raio';
        const cx = escreverCfg(cfgQ(el(x).z), true);
        const cy = escreverCfg(cfgQ(el(y).z), true);
        const nivelX = el(x).periodo;
        const nivelY = el(y).periodo;
        const periodo = contexto === 'periodo';
        // Pela posição: no período, X (à esquerda) é maior e tem menor EI; no grupo, Y (em baixo) é maior e tem menor EI.
        const maiorRaio = periodo ? x : y;
        const menorRaio = periodo ? y : x;
        const maiorEI = menorRaio;
        const N = (s) => 'o ' + nome(s);
        const doEl = (s) => 'do ' + nome(s);
        const intro = 'O ' + nome(x) + ' ($' + cx + '$) e o ' + nome(y) + ' ($' + cy + '$) são do mesmo ' + (periodo ? 'período' : 'grupo') + '.';
        const just = periodo
          ? 'Os eletrões de valência dos dois átomos estão no mesmo nível ($n = ' + nivelX + '$), mas ' + N(y) + ' tem mais protões no núcleo, por isso atrai-os mais.'
          : 'Os eletrões de valência ' + doEl(y) + ' estão no nível ' + nivelY + ', mais afastado do núcleo e mais blindado pelos eletrões interiores do que o nível ' + nivelX + ' ' + doEl(x) + '.';
        let certa, erros, afirmacao;
        if (prop === 'ei') {
          certa = periodo
            ? 'A energia de ionização ' + doEl(y) + ' é maior: tem maior carga nuclear e os eletrões de valência, no mesmo nível, são mais atraídos.'
            : 'A energia de ionização ' + doEl(x) + ' é maior: os seus eletrões de valência estão num nível mais próximo do núcleo e menos blindados.';
          erros = periodo ? [
            { codigo: 'maior_raio_maior_energia_de_ionizacao', texto: 'A energia de ionização ' + doEl(x) + ' é maior, porque o átomo ' + doEl(x) + ' é maior.', explicacao: 'Um átomo maior tem **menor** energia de ionização: o eletrão de valência está mais longe do núcleo. Aqui o maior é ' + N(x) + ', e a energia de ionização maior é a ' + doEl(y) + '.' },
            { codigo: 'raio_aumenta_ao_longo_do_periodo', texto: 'A energia de ionização ' + doEl(y) + ' é maior, porque o átomo ' + doEl(y) + ' é maior.', explicacao: 'A conclusão está certa, mas ao longo do período o raio diminui: ' + N(y) + ' é o menor, e é por isso que o eletrão é mais difícil de remover.' },
            { codigo: 'achou_que_mudava_de_nivel_no_periodo', texto: 'A energia de ionização ' + doEl(y) + ' é maior, porque os seus eletrões de valência estão num nível mais próximo do núcleo.', explicacao: 'No mesmo período os eletrões de valência estão no mesmo nível ($n = ' + nivelX + '$); a diferença vem da carga nuclear, maior no ' + nome(y) + '.' },
            { codigo: 'justificou_pela_repulsao_entre_eletroes', texto: 'A energia de ionização ' + doEl(x) + ' é maior, porque tem menos eletrões a repelirem-se.', explicacao: 'O ' + nome(y) + ' tem mais eletrões, mas também mais protões, e esse aumento da carga nuclear pesa mais: a energia de ionização maior é a ' + doEl(y) + '.' },
          ] : [
            { codigo: 'maior_raio_maior_energia_de_ionizacao', texto: 'A energia de ionização ' + doEl(y) + ' é maior, porque o átomo ' + doEl(y) + ' é maior.', explicacao: 'Um átomo maior tem **menor** energia de ionização: o eletrão de valência ' + doEl(y) + ' está mais longe do núcleo e é mais fácil de remover.' },
            { codigo: 'so_contou_a_carga_nuclear', texto: 'A energia de ionização ' + doEl(y) + ' é maior, porque o seu núcleo tem mais protões.', explicacao: 'O ' + nome(y) + ' tem mais protões, mas também mais um nível de eletrões: os de valência estão mais longe e mais blindados, por isso a energia de ionização é menor.' },
            { codigo: 'justificou_pelo_numero_de_eletroes_de_valencia', texto: 'A energia de ionização ' + doEl(x) + ' é maior, porque tem mais eletrões de valência.', explicacao: 'Os dois têm o mesmo número de eletrões de valência (mesmo grupo). A diferença vem do nível: no ' + nome(x) + ' é o ' + nivelX + ', mais perto do núcleo.' },
          ];
          afirmacao = { prop, maior: maiorEI };
        } else {
          certa = periodo
            ? 'O átomo ' + doEl(x) + ' é maior: os eletrões de valência estão no mesmo nível, mas o núcleo ' + doEl(x) + ' tem menos carga e atrai-os menos.'
            : 'O átomo ' + doEl(y) + ' é maior: tem os eletrões de valência no nível ' + nivelY + ', mais afastado do núcleo.';
          erros = periodo ? [
            { codigo: 'raio_aumenta_ao_longo_do_periodo', texto: 'O átomo ' + doEl(y) + ' é maior, porque tem mais eletrões.', explicacao: 'Ao longo do período os eletrões entram no mesmo nível, mas a carga nuclear aumenta e atrai-os mais: o raio diminui. O maior é ' + N(x) + '.' },
            { codigo: 'maior_raio_maior_energia_de_ionizacao', texto: 'O átomo ' + doEl(y) + ' é maior, porque tem maior energia de ionização.', explicacao: 'É ao contrário: um átomo maior tem menor energia de ionização. O ' + nome(y) + ' tem maior energia de ionização porque é menor.' },
            { codigo: 'justificou_com_a_carga_nuclear_ao_contrario', texto: 'O átomo ' + doEl(x) + ' é maior, porque o seu núcleo tem mais carga.', explicacao: 'A conclusão está certa, mas o ' + nome(x) + ' tem **menos** protões; com menor carga nuclear, os eletrões de valência são menos atraídos.' },
            { codigo: 'achou_que_mudava_de_nivel_no_periodo', texto: 'O átomo ' + doEl(x) + ' é maior, porque tem os eletrões de valência num nível mais afastado do núcleo.', explicacao: 'No mesmo período os eletrões de valência estão no mesmo nível ($n = ' + nivelX + '$); a diferença vem da carga nuclear, menor no ' + nome(x) + '.' },
          ] : [
            { codigo: 'so_contou_a_carga_nuclear', texto: 'O átomo ' + doEl(x) + ' é maior, porque o seu núcleo tem menos protões e atrai menos os eletrões.', explicacao: 'Descendo no grupo há mais um nível ocupado: os eletrões de valência ' + doEl(y) + ' estão mais longe do núcleo, e isso pesa mais do que a carga nuclear. O maior é ' + N(y) + '.' },
            { codigo: 'maior_raio_maior_energia_de_ionizacao', texto: 'O átomo ' + doEl(x) + ' é maior, porque tem maior energia de ionização.', explicacao: 'Um átomo maior tem **menor** energia de ionização. O ' + nome(x) + ' tem maior energia de ionização precisamente por ser menor.' },
            { codigo: 'justificou_pelo_numero_de_eletroes_de_valencia', texto: 'O átomo ' + doEl(y) + ' é maior, porque tem mais eletrões de valência.', explicacao: 'A conclusão está certa, mas os dois têm o mesmo número de eletrões de valência (mesmo grupo); o ' + nome(y) + ' é maior porque tem mais um nível ocupado.' },
          ];
          afirmacao = { prop, maior: maiorRaio };
        }
        const resolucao = [
          { passo: 'Situar os dois elementos', porque: periodo ? 'Estão no mesmo período: os eletrões de valência ocupam o mesmo nível e a carga nuclear aumenta da esquerda para a direita.' : 'Estão no mesmo grupo: descendo no grupo há mais um nível ocupado em cada período.' },
          { passo: 'Justificar', porque: just },
          { passo: 'Concluir', porque: periodo ? maiuscula(N(x)) + ' tem maior raio e menor energia de ionização do que ' + N(y) + '.' : maiuscula(N(y)) + ' tem maior raio e menor energia de ionização do que ' + N(x) + '.' },
        ];
        const valores = 'r(\\mathrm{' + x + '}) = ' + el(x).raio + '\\,' + PM + ',\\ r(\\mathrm{' + y + '}) = ' + el(y).raio + '\\,' + PM + ';\\quad E_i(\\mathrm{' + x + '}) = ' + el(x).ei1 + ',\\ E_i(\\mathrm{' + y + '}) = ' + el(y).ei1 + '\\,\\mathrm{kJ\\,mol^{-1}}';
        const verificacao = { passo: 'Confirmar com os valores tabelados', calculo: valores };
        const esquema = { id: 'fqa-tabela', opcoes: { modo: prop === 'ei' ? 'ei' : 'raio', simbolo: x } };
        const dados = { x, y, contexto, afirmacao };
        if (formato === 'escolha') {
          return fecharTexto(rng, { enunciado: intro + ' Qual das afirmações compara corretamente ' + (prop === 'ei' ? 'as suas energias de ionização' : 'os seus raios atómicos') + '?', resolucao, dados, verificacao: Object.assign({ valor: null }, verificacao), esquema }, certa, baralhar(rng, erros), certa);
        }
        const fraseVF = (maior, menor) => (prop === 'ei'
          ? 'A energia de ionização ' + doEl(maior) + ' é maior do que a ' + doEl(menor) + '.'
          : 'O raio atómico ' + doEl(maior) + ' é maior do que o ' + doEl(menor) + '.');
        const grande = prop === 'ei' ? maiorEI : maiorRaio;
        const pequeno = grande === x ? y : x;
        const erroVF = prop === 'ei'
          ? (periodo
            ? { codigo: 'energia_de_ionizacao_diminui_ao_longo_do_periodo', explicacao: 'Ao longo do período a carga nuclear aumenta e os eletrões de valência, no mesmo nível, são mais atraídos: a energia de ionização ' + doEl(y) + ' é maior.' }
            : { codigo: 'maior_raio_maior_energia_de_ionizacao', explicacao: 'O ' + nome(y) + ' é maior, mas por isso o eletrão de valência está mais longe e é mais fácil de remover: a energia de ionização ' + doEl(x) + ' é maior.' })
          : (periodo
            ? { codigo: 'raio_aumenta_ao_longo_do_periodo', explicacao: 'Ao longo do período a carga nuclear aumenta e atrai mais os eletrões do mesmo nível: o raio diminui, por isso o ' + nome(x) + ' é maior.' }
            : { codigo: 'raio_diminui_ao_descer_no_grupo', explicacao: 'Descendo no grupo há mais um nível ocupado: o raio aumenta, por isso o ' + nome(y) + ' é maior.' });
        const v = vfDe(rng, fraseVF(grande, pequeno), fraseVF(pequeno, grande), erroVF);
        dados.afirmacao = { prop, maior: v.correta ? grande : pequeno };
        return Object.assign({ resolucao, dados, esquema }, v, {
          enunciado: intro + ' ' + v.enunciado,
          verificacao: Object.assign({}, verificacao, { valor: v.correta }),
        });
      });
    },
    verificarIndependente(p) {
      // Pelos valores tabelados (Manual.dadosQuimicos), não pela posição na Tabela Periódica.
      const { x, y, afirmacao } = p.dados;
      const campo = afirmacao.prop === 'ei' ? 'ei1' : 'raio';
      const outro = afirmacao.maior === x ? y : x;
      const verdade = D().elementos[afirmacao.maior][campo] > D().elementos[outro][campo];
      if (p.formato === 'vf') return p.correta === verdade;
      if (!verdade) return false;
      const nomeMaior = Manual.dadosQuimicos.elementos[afirmacao.maior].nome.toLowerCase();
      return new RegExp('^(A energia de ionização|O átomo) do ' + nomeMaior + ' é maior:').test(p.opcoes[p.correta]);
    },
    limites(p) {
      const { x, y } = p.dados;
      return REPRESENTATIVOS.includes(x) && REPRESENTATIVOS.includes(y) && !excecao(x, y) && el(x).raio !== el(y).raio;
    },
  });

  const METAIS_IAO = ['Li', 'Na', 'K', 'Mg', 'Ca', 'Al'];
  const NAO_METAIS_IAO = ['N', 'O', 'F', 'P', 'S', 'Cl'];

  registar({
    subtema: 'tabela-periodica', tipo: 'iao', nome: 'Ião mais provável de um elemento representativo',
    formatos: ['escolha', 'vf'], contextos: ['metal', 'nao-metal'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const metal = contexto === 'metal';
        const s = escolher(rng, metal ? METAIS_IAO : NAO_METAIS_IAO);
        const z = el(s).z;
        const q = cargaTipica(s);
        const l = cfgQ(z);
        const v = totalE(doNivel(l, ultimoNivel(l)));
        const ion = (c) => '$' + especie(s, c) + '$';
        const cfgIao = escreverCfg(cfgQ(z, q), false);
        const gas = { 2: 'hélio', 10: 'néon', 18: 'árgon' }[z - q];
        const erros = metal ? [
          { codigo: 'ganhou_em_vez_de_perder', texto: ion(-q), explicacao: 'Perder eletrões dá carga positiva. O ' + nome(s) + ' perde ' + q + (q === 1 ? ' eletrão' : ' eletrões') + ': ' + ion(q) + '.' },
          q >= 2 && { codigo: 'perdeu_so_um_eletrao', texto: ion(1), explicacao: 'Com um só eletrão perdido não ficaria com a configuração de um gás nobre; perde os ' + q + ' eletrões de valência: ' + ion(q) + '.' },
          { codigo: 'perdeu_eletroes_a_mais', texto: ion(q + 1), explicacao: 'Depois de perder ' + (v === 1 ? 'o eletrão' : 'os ' + v + ' eletrões') + ' de valência fica com a configuração do ' + gas + '; tirar mais um eletrão, de um nível interior, exige muita energia.' },
        ] : [
          { codigo: 'perdeu_em_vez_de_ganhar', texto: ion(-q), explicacao: 'Ganhar eletrões dá carga negativa. O ' + nome(s) + ' ganha ' + -q + (q === -1 ? ' eletrão' : ' eletrões') + ': ' + ion(q) + '.' },
          q <= -2 && { codigo: 'ganhou_so_um_eletrao', texto: ion(-1), explicacao: 'Com um só eletrão ganho não ficaria com a configuração de um gás nobre; faltam ' + -q + ' eletrões para 8: ' + ion(q) + '.' },
          { codigo: 'ganhou_eletroes_a_mais', texto: ion(q - 1), explicacao: 'Com ' + v + ' eletrões de valência faltam ' + -q + ' para 8; ganhando ' + (1 - q) + ' ficaria com um eletrão a mais do que o ' + gas + '.' },
        ];
        // Só cargas plausíveis (|carga| ≤ 3): nada de Li⁷⁻ ou F⁷⁺. A escolha múltipla re-sorteia o elemento se faltarem opções.
        const plausivel = (x) => {
          const m = x.texto.match(/\^\{?(\d*)([+-])\}?/);
          return !m || Number(m[1] || 1) <= 3;
        };
        const errosPlausiveis = erros.filter(Boolean).filter(plausivel);
        const resolucao = [
          { passo: 'Contar os eletrões de valência', porque: 'A configuração do ' + nome(s) + ' é $' + escreverCfg(l, true) + '$: tem ' + v + (v === 1 ? ' eletrão' : ' eletrões') + ' de valência.' },
          { passo: metal ? 'Perder os eletrões de valência' : 'Ganhar os eletrões que faltam', porque: metal ? 'Os metais têm energia de ionização baixa: perdem os eletrões de valência e ficam com a configuração do gás nobre anterior.' : 'Os não metais ganham os eletrões que faltam para 8 e ficam com a configuração do gás nobre seguinte.', calculo: especie(s, q) + '\\colon\\ ' + cfgIao },
        ];
        const verificacao = { passo: 'Confirmar que o ião tem a configuração do ' + gas, calculo: z + (q > 0 ? ' - ' + q : ' + ' + -q) + ' = ' + (z - q) + '\\ \\text{eletrões}' };
        const dados = { simbolo: s, contexto };
        const esquema = { id: 'fqa-tabela', opcoes: { modo: 'blocos', simbolo: s } };
        if (formato === 'escolha') {
          return fecharTexto(rng, { enunciado: 'Que ião tende a formar o ' + nome(s) + ' ($Z = ' + z + '$)?', resolucao, dados, verificacao: Object.assign({ valor: null }, verificacao), esquema }, ion(q), errosPlausiveis, ion(q));
        }
        const falso = escolher(rng, errosPlausiveis);
        const frase = (t) => 'O ' + nome(s) + ' ($Z = ' + z + '$) tende a formar o ião ' + t + '.';
        const vv = vfDe(rng, frase(ion(q)), frase(falso.texto), { codigo: falso.codigo, explicacao: falso.explicacao });
        dados.mostrado = vv.correta ? ion(q) : falso.texto;
        return Object.assign({ resolucao, dados, esquema }, vv, { verificacao: Object.assign({}, verificacao, { valor: vv.correta }) });
      });
    },
    verificarIndependente(p) {
      // Pelo grupo (dados) e pelo número de eletrões de um gás nobre.
      const e = D().elementos[p.dados.simbolo];
      const q = p.dados.contexto === 'metal' ? (e.grupo === 13 ? 3 : e.grupo) : e.grupo - 18;
      if (![2, 10, 18].includes(e.z - q)) return false;
      const certo = '$' + especie(p.dados.simbolo, q) + '$';
      return p.formato === 'vf' ? p.correta === (p.dados.mostrado === certo) : p.opcoes[p.correta] === certo;
    },
    limites(p) {
      return (p.dados.contexto === 'metal' ? METAIS_IAO : NAO_METAIS_IAO).includes(p.dados.simbolo);
    },
  });

  registar({
    subtema: 'tabela-periodica', tipo: 'picnometro', nome: 'Densidade relativa de um metal por picnometria',
    formatos: ['numerica', 'escolha'], contextos: ['densidade', 'agua-deslocada'],
    gerar(semente, { formato, contexto, rng }) {
      return tentar(() => {
        const m0 = A.entre(rng, 20, 35, 0.01);
        const vol = A.entre(rng, 25, 50, 0.01);
        const mMetal = A.entre(rng, 5, 20, 0.01);
        const dAlvo = A.entre(rng, 2.5, 11.5, 0.1);
        const mw = rCasas(mMetal / dAlvo, 2);
        if (mw < 1 || mw > vol - 5) return null;
        const mA = rCasas(m0 + vol, 2);
        const m1 = rCasas(m0 + mMetal, 2);
        const m2 = rCasas(mA + mMetal - mw, 2);
        const T = (v) => texF(v, 2);
        const enunciado = 'Para determinar a densidade relativa de um metal, pesou-se: picnómetro vazio, $' + T(m0) + '\\,\\mathrm{g}$; picnómetro cheio de água, $' + T(mA) + '\\,\\mathrm{g}$; picnómetro vazio com amostras do metal, $' + T(m1) + '\\,\\mathrm{g}$; picnómetro com o metal e completado com água, $' + T(m2) + '\\,\\mathrm{g}$. '
          + (contexto === 'densidade' ? 'Calcula a densidade relativa do metal, com três algarismos significativos.' : 'Calcula a massa de água deslocada pelo metal (com o mesmo volume do metal), com duas casas decimais.');
        const resolucao = [
          { passo: 'Massa do metal', porque: 'É a diferença entre o picnómetro com o metal e o picnómetro vazio.', calculo: 'm_{\\mathrm{metal}} = ' + T(m1) + ' - ' + T(m0) + ' = ' + T(mMetal) + '\\,\\mathrm{g}' },
          { passo: 'Massa de água deslocada', porque: 'Com o metal lá dentro cabe menos água: a que "falta" ocupa o volume do metal. Ao picnómetro cheio de água soma-se o metal e tira-se a última pesagem.', calculo: 'm_{\\mathrm{agua}} = ' + T(mA) + ' + ' + T(mMetal) + ' - ' + T(m2) + ' = ' + T(mw) + '\\,\\mathrm{g}' },
        ];
        const dados = { m0, mA, m1, m2, contexto };
        const esquema = { id: 'fig-picnometro' };
        if (contexto === 'densidade') {
          const exato = mMetal / mw;
          if (ambiguo(exato, 3)) return null;
          const resposta = aAS(exato, 3);
          resolucao.push({ passo: 'Densidade relativa', porque: 'É a razão entre a massa do metal e a massa de igual volume de água (não tem unidades); fica com 3 algarismos significativos, como a massa de água.', calculo: 'd = \\dfrac{' + T(mMetal) + '}{' + T(mw) + '} \\approx ' + texAS(resposta, 3) });
          const sem = rCasas(m2 - mA, 2);
          const cheio = rCasas(mA - m0, 2);
          const erros = [
            sem > 0 && { codigo: 'agua_deslocada_sem_somar_o_metal', valor: aAS(mMetal / sem, 3), explicacao: 'Usaste $' + T(m2) + ' - ' + T(mA) + ' = ' + T(sem) + '\\,\\mathrm{g}$ como água deslocada e obtiveste ' + txtAS(mMetal / sem, 3) + '; essa diferença inclui a massa do metal. A água deslocada é $' + T(mA) + ' + ' + T(mMetal) + ' - ' + T(m2) + ' = ' + T(mw) + '\\,\\mathrm{g}$.' },
            { codigo: 'dividiu_ao_contrario', valor: aAS(mw / mMetal, 3), explicacao: 'Calculaste $\\dfrac{m_{\\mathrm{agua}}}{m_{\\mathrm{metal}}} \\approx ' + texAS(mw / mMetal, 3) + '$; a densidade relativa do metal é $\\dfrac{m_{\\mathrm{metal}}}{m_{\\mathrm{agua}}}$.' },
            { codigo: 'usou_a_massa_do_picnometro_com_metal', valor: aAS(m1 / mw, 3), explicacao: 'Usaste a massa do picnómetro com o metal ($' + T(m1) + '\\,\\mathrm{g}$) e obtiveste ' + txtAS(m1 / mw, 3) + '; falta tirar a massa do picnómetro vazio.' },
            { codigo: 'usou_a_agua_do_picnometro_cheio', valor: aAS(mMetal / cheio, 3), explicacao: 'Dividiste pela massa de água que enche o picnómetro ($' + T(cheio) + '\\,\\mathrm{g}$) e obtiveste ' + txtAS(mMetal / cheio, 3) + '; o que interessa é a água com o mesmo volume do metal.' },
          ].filter(Boolean);
          const vInd = (m1 - m0) / ((mA - m0) - (m2 - m1));
          return fechar(rng, formato, { enunciado, resolucao, dados, esquema }, {
            resposta, tolerancia: A.tolMeiaUnidade(resposta, 3), algarismos: 3, texto: (v) => txtAS(v, 3), erros,
            verificacao: { passo: 'Calcular a água deslocada por outro caminho: a água do picnómetro cheio menos a água que ficou com o metal', calculo: 'd = \\dfrac{' + T(m1) + ' - ' + T(m0) + '}{(' + T(mA) + ' - ' + T(m0) + ') - (' + T(m2) + ' - ' + T(m1) + ')} \\approx ' + texAS(vInd, 3), valor: aAS(vInd, 3) },
          });
        }
        const resposta = mw;
        const erros = [
          { codigo: 'agua_deslocada_sem_somar_o_metal', valor: rCasas(m2 - mA, 2), explicacao: 'Calculaste $' + T(m2) + ' - ' + T(mA) + ' = ' + T(m2 - mA) + '\\,\\mathrm{g}$; essa diferença inclui a massa do metal. A água deslocada é $' + T(mA) + ' + ' + T(mMetal) + ' - ' + T(m2) + '$.' },
          { codigo: 'usou_a_agua_do_picnometro_cheio', valor: rCasas(mA - m0, 2), explicacao: T(mA - m0).replace('{,}', ',') + ' g é a água que enche o picnómetro vazio; a água deslocada é só a que tem o volume do metal.' },
          { codigo: 'deu_a_agua_que_ficou_com_o_metal', valor: rCasas(m2 - m1, 2), explicacao: T(m2 - m1).replace('{,}', ',') + ' g é a água que ficou no picnómetro junto do metal; a água deslocada é a que deixou de caber: ' + T(mw).replace('{,}', ',') + ' g.' },
        ].filter((e) => e.valor > 0);
        const vInd = rCasas((mA - m0) - (m2 - m1), 2);
        return fechar(rng, formato, { enunciado, resolucao, dados, esquema }, {
          resposta, tolerancia: 0.005, unidade: 'g', texto: (v) => '$' + T(v) + '\\,\\mathrm{g}$', erros,
          verificacao: { passo: 'Calcular por outro caminho: a água do picnómetro cheio menos a água que ficou com o metal', calculo: '(' + T(mA) + ' - ' + T(m0) + ') - (' + T(m2) + ' - ' + T(m1) + ') = ' + T(vInd) + '\\,\\mathrm{g}', valor: vInd },
        });
      });
    },
    verificarIndependente(p) {
      const { m0, mA, m1, m2, contexto } = p.dados;
      if (contexto === 'densidade') {
        const v = aAS(Q().densidadeRelativa({ mPicnometroVazio: m0, mComAgua: mA, mComMetal: m1, mComMetalEAgua: m2 }), 3);
        return confere(p, v, (x) => txtAS(x, 3));
      }
      return confere(p, rCasas(mA + (m1 - m0) - m2, 2), (x) => '$' + texF(x, 2) + '\\,\\mathrm{g}$');
    },
    limites(p) {
      const { m0, mA, m1, m2 } = p.dados;
      return m0 > 0 && mA > m0 && m1 > m0 && m2 > mA;
    },
  });
})();
