globalThis.Manual = globalThis.Manual || {};

// Dados químicos de referência (Z = 1–36). Fonte de cada bloco em `fontes`.
// Nenhum outro ficheiro escreve valores químicos à mão: usam sempre Manual.dadosQuimicos.
Manual.dadosQuimicos = (function () {
  // 1 eV por partícula = 96,485 kJ/mol (F/1000 = e·NA/1000)
  const EV_PARA_KJ_MOL = 96.485;

  // [símbolo, nome, massa atómica relativa (TP do IAVE), grupo, período, bloco,
  //  1.ª energia de ionização em eV (NIST ASD), raio atómico em pm (Slater 1964) ou null]
  const TABELA = [
    ['H', 'Hidrogénio', 1.01, 1, 1, 's', 13.598434599702, 25],
    ['He', 'Hélio', 4.00, 18, 1, 's', 24.587389011, null],
    ['Li', 'Lítio', 6.94, 1, 2, 's', 5.391714996, 145],
    ['Be', 'Berílio', 9.01, 2, 2, 's', 9.322699, 105],
    ['B', 'Boro', 10.81, 13, 2, 'p', 8.298019, 85],
    ['C', 'Carbono', 12.01, 14, 2, 'p', 11.260288, 70],
    ['N', 'Nitrogénio', 14.01, 15, 2, 'p', 14.53413, 65],
    ['O', 'Oxigénio', 16.00, 16, 2, 'p', 13.618055, 60],
    ['F', 'Flúor', 19.00, 17, 2, 'p', 17.42282, 50],
    ['Ne', 'Néon', 20.18, 18, 2, 'p', 21.564541, null],
    ['Na', 'Sódio', 22.99, 1, 3, 's', 5.13907696, 180],
    ['Mg', 'Magnésio', 24.31, 2, 3, 's', 7.646236, 150],
    ['Al', 'Alumínio', 26.98, 13, 3, 'p', 5.985769, 125],
    ['Si', 'Silício', 28.09, 14, 3, 'p', 8.15168, 110],
    ['P', 'Fósforo', 30.97, 15, 3, 'p', 10.486686, 100],
    ['S', 'Enxofre', 32.06, 16, 3, 'p', 10.3600167, 100],
    ['Cl', 'Cloro', 35.45, 17, 3, 'p', 12.967633, 100],
    ['Ar', 'Árgon', 39.95, 18, 3, 'p', 15.7596119, null],
    ['K', 'Potássio', 39.10, 1, 4, 's', 4.34066373, 220],
    ['Ca', 'Cálcio', 40.08, 2, 4, 's', 6.113154921, 180],
    ['Sc', 'Escândio', 44.96, 3, 4, 'd', 6.56149, null],
    ['Ti', 'Titânio', 47.87, 4, 4, 'd', 6.82812, null],
    ['V', 'Vanádio', 50.94, 5, 4, 'd', 6.746187, null],
    ['Cr', 'Crómio', 52.00, 6, 4, 'd', 6.76651, null],
    ['Mn', 'Manganês', 54.94, 7, 4, 'd', 7.434038, null],
    ['Fe', 'Ferro', 55.85, 8, 4, 'd', 7.9024681, null],
    ['Co', 'Cobalto', 58.93, 9, 4, 'd', 7.88101, null],
    ['Ni', 'Níquel', 58.69, 10, 4, 'd', 7.639878, null],
    ['Cu', 'Cobre', 63.55, 11, 4, 'd', 7.72638, null],
    ['Zn', 'Zinco', 65.38, 12, 4, 'd', 9.394197, null],
    ['Ga', 'Gálio', 69.72, 13, 4, 'p', 5.999302, 130],
    ['Ge', 'Germânio', 72.63, 14, 4, 'p', 7.899435, 125],
    ['As', 'Arsénio', 74.92, 15, 4, 'p', 9.78855, 115],
    ['Se', 'Selénio', 78.97, 16, 4, 'p', 9.752368, 115],
    ['Br', 'Bromo', 79.90, 17, 4, 'p', 11.81381, 115],
    ['Kr', 'Crípton', 83.80, 18, 4, 'p', 13.9996055, null],
  ];

  const elementos = {};
  TABELA.forEach(([simbolo, nome, massaAtomica, grupo, periodo, bloco, eiEV, raio], i) => {
    const e = { z: i + 1, nome, massaAtomica, grupo, periodo, bloco, ei1: Math.round(eiEV * EV_PARA_KJ_MOL) };
    if (raio !== null) e.raio = raio;
    elementos[simbolo] = e;
  });

  // a = número de massa; massa = massa isotópica relativa; abundancia em % (fração de átomos × 100)
  const isotopos = {
    H: [{ a: 1, massa: 1.00782503223, abundancia: 99.9885 }, { a: 2, massa: 2.01410177812, abundancia: 0.0115 }],
    Li: [{ a: 6, massa: 6.0151228874, abundancia: 7.59 }, { a: 7, massa: 7.0160034366, abundancia: 92.41 }],
    B: [{ a: 10, massa: 10.01293695, abundancia: 19.9 }, { a: 11, massa: 11.00930536, abundancia: 80.1 }],
    C: [{ a: 12, massa: 12, abundancia: 98.93 }, { a: 13, massa: 13.00335483507, abundancia: 1.07 }],
    N: [{ a: 14, massa: 14.00307400443, abundancia: 99.636 }, { a: 15, massa: 15.00010889888, abundancia: 0.364 }],
    O: [
      { a: 16, massa: 15.99491461957, abundancia: 99.757 },
      { a: 17, massa: 16.9991317565, abundancia: 0.038 },
      { a: 18, massa: 17.99915961286, abundancia: 0.205 },
    ],
    Ne: [
      { a: 20, massa: 19.9924401762, abundancia: 90.48 },
      { a: 21, massa: 20.993846685, abundancia: 0.27 },
      { a: 22, massa: 21.991385114, abundancia: 9.25 },
    ],
    Mg: [
      { a: 24, massa: 23.985041697, abundancia: 78.99 },
      { a: 25, massa: 24.985836976, abundancia: 10.0 },
      { a: 26, massa: 25.982592968, abundancia: 11.01 },
    ],
    Cl: [{ a: 35, massa: 34.968852682, abundancia: 75.76 }, { a: 37, massa: 36.965902602, abundancia: 24.24 }],
    Cu: [{ a: 63, massa: 62.92959772, abundancia: 69.15 }, { a: 65, massa: 64.9277897, abundancia: 30.85 }],
  };

  // energia média de ligação em kJ/mol; comprimento em pm (uma única tabela de valores médios)
  const ligacoes = {
    'H-H': { energia: 432, comprimento: 74 },
    'C-C': { energia: 346, comprimento: 154 },
    'C=C': { energia: 602, comprimento: 134 },
    'C≡C': { energia: 835, comprimento: 120 },
    'O=O': { energia: 494, comprimento: 121 },
    'N≡N': { energia: 942, comprimento: 110 },
    'C-H': { energia: 411, comprimento: 109 },
    'O-H': { energia: 459, comprimento: 96 },
    'N-H': { energia: 386, comprimento: 101 },
    'C=O': { energia: 799, comprimento: 120 }, // valor em CO2
    'C-O': { energia: 358, comprimento: 143 },
    'H-Cl': { energia: 428, comprimento: 127 },
    'Cl-Cl': { energia: 240, comprimento: 199 },
    'C-Cl': { energia: 327, comprimento: 177 },
    'H-Br': { energia: 362, comprimento: 141 },
    'Br-Br': { energia: 190, comprimento: 228 },
    'H-I': { energia: 295, comprimento: 161 },
    'I-I': { energia: 148, comprimento: 267 },
    'H-F': { energia: 565, comprimento: 92 },
    'F-F': { energia: 155, comprimento: 142 },
    'O-O': { energia: 142, comprimento: 148 },
    'N-N': { energia: 167, comprimento: 145 },
    'N=N': { energia: 418, comprimento: 125 },
    'C-N': { energia: 305, comprimento: 147 },
    'C≡N': { energia: 887, comprimento: 116 },
  };

  // NA em mol⁻¹, h em J s, c em m s⁻¹, Vm em dm³ mol⁻¹ (PTN), EnH em J (E_n = EnH/n² no átomo de H)
  const constantes = { NA: 6.02e23, h: 6.63e-34, c: 3.0e8, Vm: 22.4, EnH: -2.18e-18 };

  // Zonas do espetro eletromagnético por comprimento de onda (m), intervalos [min, max[.
  const espectro = [
    { zona: 'gama', min: 0, max: 1e-11 },
    { zona: 'X', min: 1e-11, max: 1e-8 },
    { zona: 'UV', min: 1e-8, max: 4e-7 },
    { zona: 'visivel', min: 4e-7, max: 7e-7 },
    { zona: 'IV', min: 7e-7, max: 1e-3 },
    { zona: 'micro-ondas', min: 1e-3, max: 1 },
    { zona: 'radio', min: 1, max: Infinity },
  ];

  // Pares de Z consecutivos (períodos 2–4, pelo menos um representativo) em que a EI desce.
  const excecoesEI = ['Be>B', 'N>O', 'Mg>Al', 'P>S', 'Zn>Ga', 'As>Se'];
  // Descendo no grupo, a EI do Ga é ligeiramente maior que a do Al (contração devida aos eletrões 3d).
  const excecoesEIGrupo = ['Ga>Al'];

  const fontes = {
    elementos: 'Nomes em português (IUPAC, como nos manuais portugueses); grupo (1–18, numeração IUPAC), período e bloco '
      + 'da Tabela Periódica da IUPAC. O hélio (1s²) é do bloco s pela configuração, mas fica no grupo 18.',
    massaAtomica: 'Tabela Periódica do IAVE, Anexo 3 da Informação-Prova de Física e Química A (715), 2025 '
      + '(IAVE, novembro de 2024; tabela igual à da Informação-Prova de 2024), massas atómicas relativas com 2 casas decimais.',
    ei1: 'NIST Atomic Spectra Database, Ionization Energies (consultada em 2026-11-15), primeira energia de ionização dos átomos '
      + 'neutros em eV, convertida para kJ/mol (× 96,485) e arredondada às unidades.',
    raio: 'J. C. Slater, "Atomic Radii in Crystals", J. Chem. Phys. 41, 3199 (1964), raios atómicos empíricos (pm, '
      + 'arredondados a 5 pm), só para os elementos representativos; Slater não dá valores para os gases nobres.',
    isotopos: 'NIST, Atomic Weights and Isotopic Compositions (massas isotópicas relativas AME e composições isotópicas '
      + 'representativas da IUPAC CIAAW); abundância em percentagem de átomos.',
    ligacoes: 'Tabela de energias médias de ligação (kJ/mol) e comprimentos de ligação (pm) de J. E. Huheey, E. A. Keiter '
      + 'e R. L. Keiter, Inorganic Chemistry, 4.ª ed., HarperCollins, 1993, Apêndice E (pp. A-21 a A-34), tal como '
      + 'transcrita em wiredchemist.com. C=O é o valor em CO₂.',
    constantes: 'NA, c e Vm (PTN): Tabela de constantes do IAVE (Anexo 1 da Informação-Prova 715, 2025). h e EnH não '
      + 'constam dos anexos do IAVE: valores CODATA arredondados a 3 algarismos significativos (h = 6,626 × 10⁻³⁴ J s; '
      + 'energia de Rydberg 2,180 × 10⁻¹⁸ J), como nos manuais portugueses.',
    espectro: 'Fronteiras convencionais aproximadas entre as zonas do espetro (visível 400–700 nm, como nos manuais); '
      + 'as fronteiras não são nítidas, por isso os exercícios devem usar valores afastados delas.',
    excecoesEI: 'Derivadas dos valores de ei1 (NIST): pares de Z consecutivos dos períodos 2–4 em que a EI desce.',
    excecoesEIGrupo: 'Derivada dos valores de ei1 (NIST): EI(Ga) = 579 kJ/mol > EI(Al) = 578 kJ/mol.',
  };

  return { elementos, isotopos, ligacoes, constantes, espectro, excecoesEI, excecoesEIGrupo, fontes };
})();
