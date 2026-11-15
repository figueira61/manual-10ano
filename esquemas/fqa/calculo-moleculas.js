globalThis.Manual = globalThis.Manual || {};

// Catálogo de moléculas do 10.º ano (escrito à mão) e contagens de pares de eletrões. Puro: sem DOM.
//
// Cada molécula: { nome, formula (LaTeX), atomos: [{ el, x, y, pares }], ligacoes: [[i, j, ordem]],
//   geometria, angulo, polar, grupoFuncional, tipo, ... }.
//   - x, y: coordenadas 2D em unidades de comprimento de ligação (x para a direita, y para baixo), à mão.
//   - pares: número de pares de eletrões não ligantes do átomo.
//   - Convenção de geometria/ângulo (uma só, para todo o catálogo):
//       * moléculas diatómicas: geometria 'linear', angulo null (não há ângulo);
//       * um só átomo central (≥ 2 vizinhos): geometria e angulo (em graus, valor aproximado) da molécula;
//       * mais de um átomo central (C2H6, álcoois, ...): geometria null e angulo null, e o campo
//         centros: [{ atomo, geometria, angulo }] dá a geometria à volta de cada átomo central.
//   - excecaoOcteto: true quando há um átomo sem octeto completo (B em BF3).
//   - ressonancia: true quando se desenha só uma das estruturas de ressonância (O3).
//   - atomos3d: opcional, preenchido pela Task 6 (geometria 3D); a sua ausência é válida.
// Os eletrões de valência vêm de Manual.dadosQuimicos / Manual.quimica.configuracao (resolvidos só ao chamar).
Manual.moleculas = (function () {
  const A = (el, x, y, pares) => ({ el, x, y, pares });

  // Hidrogénios de um CH3 terminal à esquerda / à direita do carbono em (x, 0), e de um CH2 intermédio.
  const ch3Esq = (x) => [A('H', x - 0.5, -0.87, 0), A('H', x - 1, 0, 0), A('H', x - 0.5, 0.87, 0)];
  const ch3Dir = (x) => [A('H', x + 0.5, -0.87, 0), A('H', x + 1, 0, 0), A('H', x + 0.5, 0.87, 0)];
  const ch2 = (x) => [A('H', x, -1, 0), A('H', x, 1, 0)];
  const tetra = (atomo) => ({ atomo, geometria: 'tetraédrica', angulo: 109.5 });
  const plana = (atomo) => ({ atomo, geometria: 'triangular plana', angulo: 120 });
  const angularO = (atomo) => ({ atomo, geometria: 'angular', angulo: 105 });

  const catalogo = {
    H2: {
      nome: 'hidrogénio', formula: '\\mathrm{H_2}',
      atomos: [A('H', 0, 0, 0), A('H', 1, 0, 0)],
      ligacoes: [[0, 1, 1]],
      geometria: 'linear', angulo: null, polar: false, grupoFuncional: null, tipo: null,
    },
    O2: {
      nome: 'oxigénio', formula: '\\mathrm{O_2}',
      atomos: [A('O', 0, 0, 2), A('O', 1, 0, 2)],
      ligacoes: [[0, 1, 2]],
      geometria: 'linear', angulo: null, polar: false, grupoFuncional: null, tipo: null,
    },
    N2: {
      nome: 'azoto', formula: '\\mathrm{N_2}',
      atomos: [A('N', 0, 0, 1), A('N', 1, 0, 1)],
      ligacoes: [[0, 1, 3]],
      geometria: 'linear', angulo: null, polar: false, grupoFuncional: null, tipo: null,
    },
    Cl2: {
      nome: 'cloro', formula: '\\mathrm{Cl_2}',
      atomos: [A('Cl', 0, 0, 3), A('Cl', 1, 0, 3)],
      ligacoes: [[0, 1, 1]],
      geometria: 'linear', angulo: null, polar: false, grupoFuncional: null, tipo: null,
    },
    HCl: {
      nome: 'cloreto de hidrogénio', formula: '\\mathrm{HCl}',
      atomos: [A('H', 0, 0, 0), A('Cl', 1, 0, 3)],
      ligacoes: [[0, 1, 1]],
      geometria: 'linear', angulo: null, polar: true, grupoFuncional: null, tipo: null,
    },
    HF: {
      nome: 'fluoreto de hidrogénio', formula: '\\mathrm{HF}',
      atomos: [A('H', 0, 0, 0), A('F', 1, 0, 3)],
      ligacoes: [[0, 1, 1]],
      geometria: 'linear', angulo: null, polar: true, grupoFuncional: null, tipo: null,
    },
    H2O: {
      nome: 'água', formula: '\\mathrm{H_2O}',
      atomos: [A('O', 0, 0, 2), A('H', -0.79, 0.61, 0), A('H', 0.79, 0.61, 0)],
      ligacoes: [[0, 1, 1], [0, 2, 1]],
      geometria: 'angular', angulo: 104.5, polar: true, grupoFuncional: null, tipo: null,
    },
    NH3: {
      nome: 'amoníaco', formula: '\\mathrm{NH_3}',
      atomos: [A('N', 0, 0, 1), A('H', -0.95, 0.4, 0), A('H', 0.95, 0.4, 0), A('H', 0, 1, 0)],
      ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
      geometria: 'piramidal trigonal', angulo: 107, polar: true, grupoFuncional: null, tipo: null,
    },
    CH4: {
      nome: 'metano', formula: '\\mathrm{CH_4}',
      atomos: [A('C', 0, 0, 0), A('H', 0, -1, 0), A('H', 1, 0, 0), A('H', 0, 1, 0), A('H', -1, 0, 0)],
      ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]],
      geometria: 'tetraédrica', angulo: 109.5, polar: false, grupoFuncional: null, tipo: 'hidrocarboneto-saturado',
    },
    CO2: {
      nome: 'dióxido de carbono', formula: '\\mathrm{CO_2}',
      atomos: [A('O', 0, 0, 2), A('C', 1, 0, 0), A('O', 2, 0, 2)],
      ligacoes: [[0, 1, 2], [1, 2, 2]],
      geometria: 'linear', angulo: 180, polar: false, grupoFuncional: null, tipo: null,
    },
    BF3: {
      nome: 'trifluoreto de boro', formula: '\\mathrm{BF_3}',
      atomos: [A('B', 0, 0, 0), A('F', 0, -1, 3), A('F', 0.87, 0.5, 3), A('F', -0.87, 0.5, 3)],
      ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1]],
      geometria: 'triangular plana', angulo: 120, polar: false, grupoFuncional: null, tipo: null,
      excecaoOcteto: true, // o boro fica com 6 eletrões
    },
    HCN: {
      nome: 'cianeto de hidrogénio', formula: '\\mathrm{HCN}',
      atomos: [A('H', 0, 0, 0), A('C', 1, 0, 0), A('N', 2, 0, 1)],
      ligacoes: [[0, 1, 1], [1, 2, 3]],
      geometria: 'linear', angulo: 180, polar: true, grupoFuncional: null, tipo: null,
    },
    C2H6: {
      nome: 'etano', formula: '\\mathrm{C_2H_6}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), ...ch3Esq(0), ...ch3Dir(1)],
      ligacoes: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]],
      geometria: null, angulo: null, centros: [tetra(0), tetra(1)],
      polar: false, grupoFuncional: null, tipo: 'hidrocarboneto-saturado',
    },
    C2H4: {
      nome: 'eteno', formula: '\\mathrm{C_2H_4}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('H', -0.5, -0.87, 0), A('H', -0.5, 0.87, 0), A('H', 1.5, -0.87, 0), A('H', 1.5, 0.87, 0)],
      ligacoes: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
      geometria: null, angulo: null, centros: [plana(0), plana(1)],
      polar: false, grupoFuncional: null, tipo: 'insaturado',
    },
    C2H2: {
      nome: 'etino', formula: '\\mathrm{C_2H_2}',
      atomos: [A('H', 0, 0, 0), A('C', 1, 0, 0), A('C', 2, 0, 0), A('H', 3, 0, 0)],
      ligacoes: [[0, 1, 1], [1, 2, 3], [2, 3, 1]],
      geometria: null, angulo: null,
      centros: [{ atomo: 1, geometria: 'linear', angulo: 180 }, { atomo: 2, geometria: 'linear', angulo: 180 }],
      polar: false, grupoFuncional: null, tipo: 'insaturado',
    },
    C3H8: {
      nome: 'propano', formula: '\\mathrm{C_3H_8}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('C', 2, 0, 0), ...ch3Esq(0), ...ch2(1), ...ch3Dir(2)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [1, 7, 1], [2, 8, 1], [2, 9, 1], [2, 10, 1]],
      geometria: null, angulo: null, centros: [tetra(0), tetra(1), tetra(2)],
      polar: false, grupoFuncional: null, tipo: 'hidrocarboneto-saturado',
    },
    C3H6: {
      // propeno: CH3-CH=CH2
      nome: 'propeno', formula: '\\mathrm{C_3H_6}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('C', 2, 0, 0), ...ch3Esq(0), A('H', 1, -1, 0), A('H', 2.5, -0.87, 0), A('H', 2.5, 0.87, 0)],
      ligacoes: [[0, 1, 1], [1, 2, 2], [0, 3, 1], [0, 4, 1], [0, 5, 1], [1, 6, 1], [2, 7, 1], [2, 8, 1]],
      geometria: null, angulo: null, centros: [tetra(0), plana(1), plana(2)],
      polar: false, grupoFuncional: null, tipo: 'insaturado',
      polarNota: 'momento dipolar muito pequeno (≈ 0,4 D): tratado como apolar, como os hidrocarbonetos no 10.º ano',
    },
    C4H10: {
      // butano: CH3-CH2-CH2-CH3
      nome: 'butano', formula: '\\mathrm{C_4H_{10}}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('C', 2, 0, 0), A('C', 3, 0, 0), ...ch3Esq(0), ...ch2(1), ...ch2(2), ...ch3Dir(3)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1], [2, 9, 1], [2, 10, 1], [3, 11, 1], [3, 12, 1], [3, 13, 1]],
      geometria: null, angulo: null, centros: [tetra(0), tetra(1), tetra(2), tetra(3)],
      polar: false, grupoFuncional: null, tipo: 'hidrocarboneto-saturado',
    },
    CH3OH: {
      nome: 'metanol', formula: '\\mathrm{CH_3OH}',
      atomos: [A('C', 0, 0, 0), A('O', 1, 0, 2), A('H', 1.7, 0.7, 0), ...ch3Esq(0)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1]],
      geometria: null, angulo: null, centros: [tetra(0), angularO(1)],
      polar: true, grupoFuncional: 'alcool', tipo: null,
    },
    C2H5OH: {
      nome: 'etanol', formula: '\\mathrm{C_2H_5OH}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('O', 2, 0, 2), A('H', 2.7, 0.7, 0), ...ch3Esq(0), ...ch2(1)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]],
      geometria: null, angulo: null, centros: [tetra(0), tetra(1), angularO(2)],
      polar: true, grupoFuncional: 'alcool', tipo: null,
    },
    CH3CHO: {
      nome: 'etanal', formula: '\\mathrm{CH_3CHO}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('O', 1, -1, 2), A('H', 1, 1, 0), ...ch3Esq(0)],
      ligacoes: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]],
      geometria: null, angulo: null, centros: [tetra(0), plana(1)],
      polar: true, grupoFuncional: 'aldeido', tipo: null,
    },
    CH3COCH3: {
      nome: 'propanona', formula: '\\mathrm{CH_3COCH_3}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('C', 2, 0, 0), A('O', 1, -1, 2), ...ch3Esq(0), ...ch3Dir(2)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [1, 3, 2], [0, 4, 1], [0, 5, 1], [0, 6, 1], [2, 7, 1], [2, 8, 1], [2, 9, 1]],
      geometria: null, angulo: null, centros: [tetra(0), plana(1), tetra(2)],
      polar: true, grupoFuncional: 'cetona', tipo: null,
    },
    CH3COOH: {
      nome: 'ácido etanoico', formula: '\\mathrm{CH_3COOH}',
      atomos: [A('C', 0, 0, 0), A('C', 1, 0, 0), A('O', 1, -1, 2), A('O', 2, 0, 2), A('H', 2.7, 0.7, 0), ...ch3Esq(0)],
      ligacoes: [[0, 1, 1], [1, 2, 2], [1, 3, 1], [3, 4, 1], [0, 5, 1], [0, 6, 1], [0, 7, 1]],
      geometria: null, angulo: null, centros: [tetra(0), plana(1), angularO(3)],
      polar: true, grupoFuncional: 'acido', tipo: null,
    },
    CH3NH2: {
      nome: 'metilamina', formula: '\\mathrm{CH_3NH_2}',
      atomos: [A('C', 0, 0, 0), A('N', 1, 0, 1), A('H', 1, 1, 0), A('H', 2, 0, 0), ...ch3Esq(0)],
      ligacoes: [[0, 1, 1], [1, 2, 1], [1, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]],
      geometria: null, angulo: null,
      centros: [tetra(0), { atomo: 1, geometria: 'piramidal trigonal', angulo: 107 }],
      polar: true, grupoFuncional: 'amina', tipo: null,
    },
    O3: {
      // uma só estrutura de ressonância: O=O–O (a outra tem a dupla do lado oposto)
      nome: 'ozono', formula: '\\mathrm{O_3}',
      atomos: [A('O', 0.15, 0.52, 2), A('O', 1, 0, 1), A('O', 1.85, 0.52, 3)],
      ligacoes: [[0, 1, 2], [1, 2, 1]],
      geometria: 'angular', angulo: 117, polar: true, grupoFuncional: null, tipo: null,
      ressonancia: true,
    },
  };

  // ---------- valências e contagens ----------

  // Eletrões de valência de um átomo (grupo principal), a partir da configuração eletrónica.
  function eletroesValenciaAtomo(el) {
    const e = Manual.dadosQuimicos && Manual.dadosQuimicos.elementos[el];
    if (!e) throw new Error('moleculas: elemento desconhecido ' + el);
    return Manual.quimica.configuracao(e.z).valencia;
  }

  function obter(id) {
    const m = catalogo[id];
    if (!m) throw new Error('moleculas: molécula desconhecida ' + id);
    return m;
  }

  function contar(id) {
    const m = obter(id);
    let paresLigantes = 0, ligacoesSimples = 0, duplas = 0, triplas = 0, paresNaoLigantes = 0, eletroesValencia = 0;
    for (const lig of m.ligacoes) {
      const ordem = lig[2];
      paresLigantes += ordem;
      if (ordem === 1) ligacoesSimples++;
      else if (ordem === 2) duplas++;
      else if (ordem === 3) triplas++;
    }
    for (const a of m.atomos) {
      paresNaoLigantes += a.pares;
      eletroesValencia += eletroesValenciaAtomo(a.el);
    }
    return { paresLigantes, paresNaoLigantes, ligacoesSimples, duplas, triplas, eletroesValencia };
  }

  // Eletrões à volta de cada átomo (cada ligação conta 2 por ordem, cada par não ligante 2).
  function eletroesAtomos(id) {
    const m = obter(id);
    const n = m.atomos.map((a) => 2 * a.pares);
    for (const [i, j, ordem] of m.ligacoes) { n[i] += 2 * ordem; n[j] += 2 * ordem; }
    return n;
  }

  // Regra do octeto: H com 2, os outros com 8; a única exceção admitida é o B com 6, se declarada.
  function octeto(id) {
    const m = obter(id);
    const n = eletroesAtomos(id);
    const excecoes = [];
    m.atomos.forEach((a, i) => {
      if (n[i] !== (a.el === 'H' ? 2 : 8)) excecoes.push({ atomo: i, el: a.el, eletroes: n[i] });
    });
    const cumpre = excecoes.every((x) => m.excecaoOcteto === true && x.el === 'B' && x.eletroes === 6);
    return { cumpre, excecoes };
  }

  // Átomos centrais: com 2 ou mais vizinhos.
  function centrais(id) {
    const m = obter(id);
    const viz = m.atomos.map(() => 0);
    for (const [i, j] of m.ligacoes) { viz[i]++; viz[j]++; }
    return viz.map((v, i) => (v >= 2 ? i : -1)).filter((i) => i >= 0);
  }

  // Erros de construção (lista vazia = válida). atomos3d é opcional.
  function validar(id) {
    const m = obter(id);
    const erros = [];
    const n = m.atomos.length;
    for (const [i, j, o] of m.ligacoes) {
      if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= n || j >= n || i === j) erros.push('ligação inválida ' + i + '-' + j);
      if (![1, 2, 3].includes(o)) erros.push('ordem inválida ' + o);
    }
    const chaves = m.ligacoes.map(([i, j]) => Math.min(i, j) + '-' + Math.max(i, j));
    if (new Set(chaves).size !== chaves.length) erros.push('ligação repetida');
    m.atomos.forEach((a, i) => {
      if (!Manual.dadosQuimicos.elementos[a.el]) erros.push('elemento desconhecido ' + a.el);
      if (!Number.isInteger(a.pares) || a.pares < 0) erros.push('pares inválidos no átomo ' + i);
    });
    if (m.atomos3d !== undefined && !Array.isArray(m.atomos3d)) erros.push('atomos3d tem de ser uma lista');
    if (erros.length) return erros;
    const c = contar(id);
    if (c.eletroesValencia !== 2 * (c.paresLigantes + c.paresNaoLigantes)) erros.push('eletrões de valência não batem');
    if (!octeto(id).cumpre) erros.push('octeto não cumprido');
    const cs = centrais(id);
    if (cs.length > 1) {
      if (m.geometria !== null || m.angulo !== null) erros.push('mais de um átomo central: geometria e angulo têm de ser null');
      const lista = (m.centros || []).map((x) => x.atomo).sort((x, y) => x - y);
      if (JSON.stringify(lista) !== JSON.stringify(cs)) erros.push('centros não coincidem com os átomos centrais');
    } else if (!m.geometria) erros.push('falta a geometria');
    return erros;
  }

  // ---------- disposição (pura): posições e direções dos pares não ligantes ----------

  const GRAUS = 180 / Math.PI;
  const norm = (a) => ((a % 360) + 360) % 360;

  // Os pares não ligantes de um átomo ficam igualmente espaçados no maior intervalo livre entre ligações.
  function angulosPares(m, i) {
    const a = m.atomos[i];
    if (!a.pares) return [];
    const dirs = [];
    for (const [p, q] of m.ligacoes) {
      const o = p === i ? q : q === i ? p : -1;
      if (o >= 0) dirs.push(norm(Math.atan2(m.atomos[o].y - a.y, m.atomos[o].x - a.x) * GRAUS));
    }
    if (!dirs.length) return Array.from({ length: a.pares }, (_, k) => norm(90 + (360 * k) / a.pares));
    dirs.sort((x, y) => x - y);
    let melhor = { inicio: 0, tam: -1 };
    dirs.forEach((d, k) => {
      const seguinte = k + 1 < dirs.length ? dirs[k + 1] : dirs[0] + 360;
      if (seguinte - d > melhor.tam + 1e-9) melhor = { inicio: d, tam: seguinte - d };
    });
    return Array.from({ length: a.pares }, (_, k) => norm(melhor.inicio + (melhor.tam * (k + 1)) / (a.pares + 1)));
  }

  function disposicao(id) {
    const m = obter(id);
    const xs = m.atomos.map((a) => a.x), ys = m.atomos.map((a) => a.y);
    return {
      atomos: m.atomos.map((a, i) => ({ el: a.el, x: a.x, y: a.y, paresAngulos: angulosPares(m, i) })),
      ligacoes: m.ligacoes.map((l) => l.slice()),
      caixa: { xmin: Math.min(...xs), xmax: Math.max(...xs), ymin: Math.min(...ys), ymax: Math.max(...ys) },
    };
  }

  return { catalogo, obter, contar, eletroesValenciaAtomo, eletroesAtomos, octeto, centrais, validar, disposicao };
})();
