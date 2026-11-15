globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida da constituição do átomo (esquema ilustrativo, sem escala).
// Partes: nuvem eletrónica, núcleo, protão, neutrão, eletrão. Protão = círculo cheio com "+"; neutrão = círculo vazio.
(function () {
  const circ = (cx, cy, r, extra) => (g, cs) => g.appendChild(cs('circle', Object.assign({ cx, cy, r }, extra)));
  const mais = (cx, cy) => (g, cs) => {
    g.appendChild(cs('circle', { cx, cy, r: 9, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }));
    g.appendChild(cs('path', { d: 'M' + (cx - 4) + ' ' + cy + 'H' + (cx + 4) + 'M' + cx + ' ' + (cy - 4) + 'V' + (cy + 4), stroke: 'var(--superficie)', 'stroke-width': 2, fill: 'none' }));
  };
  const nuvem = (g, cs) => {
    g.appendChild(cs('circle', { cx: 140, cy: 100, r: 90, fill: 'var(--cor-1)', 'fill-opacity': 0.12, stroke: 'var(--cor-1)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }));
  };
  const nucleo = (g, cs) => {
    g.appendChild(cs('circle', { cx: 140, cy: 100, r: 28, fill: 'var(--superficie)', 'fill-opacity': 0.6, stroke: 'var(--texto)', 'stroke-width': 1.5 }));
  };
  const protao = (g, cs) => mais(140 - 8, 100 - 4)(g, cs);
  const neutrao = (g, cs) => g.appendChild(cs('circle', { cx: 140 + 9, cy: 100 + 8, r: 9, fill: 'var(--superficie)', stroke: 'var(--texto)', 'stroke-width': 2 }));
  const eletrao = (g, cs) => {
    [[200, 60], [78, 130], [150, 172]].forEach((p) => g.appendChild(cs('circle', { cx: p[0], cy: p[1], r: 5, fill: 'var(--cor-3)', stroke: 'var(--texto)', 'stroke-width': 1 })));
  };

  Manual.esquemas.registar('fig-atomo', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Constituição do átomo (sem escala)',
        largura: 280,
        altura: 200,
        partes: [
          { id: 'nuvem', rotulo: 'Nuvem eletrónica', descricao: 'Região à volta do núcleo onde é provável encontrar os eletrões (carga negativa).',
            explodir: { dx: 0, dy: 40 }, ancora: { x: 140, y: 170 }, desenhar: nuvem },
          { id: 'nucleo', rotulo: 'Núcleo', descricao: 'Parte central, minúscula e muito densa; tem os protões e os neutrões e quase toda a massa do átomo.',
            explodir: { dx: 0, dy: -10 }, ancora: { x: 140, y: 100 }, desenhar: nucleo },
          { id: 'protao', rotulo: 'Protão', descricao: 'Partícula do núcleo com carga elétrica positiva; o número de protões é o número atómico Z.',
            explodir: { dx: -60, dy: -40 }, ancora: { x: 132, y: 96 }, desenhar: protao },
          { id: 'neutrao', rotulo: 'Neutrão', descricao: 'Partícula do núcleo sem carga elétrica; o número de neutrões é N = A − Z.',
            explodir: { dx: 60, dy: -40 }, ancora: { x: 149, y: 108 }, desenhar: neutrao },
          { id: 'eletrao', rotulo: 'Eletrão', descricao: 'Partícula com carga elétrica negativa, de massa muito menor que a do protão; num átomo neutro há tantos eletrões como protões.',
            explodir: { dx: 40, dy: 10 }, ancora: { x: 200, y: 60 }, desenhar: eletrao },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
