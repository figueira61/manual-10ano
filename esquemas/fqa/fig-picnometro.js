globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida do picnómetro (esquema ilustrativo, sem escala).
// Partes: corpo, tampa com capilar, marca. A densidade relativa obtém-se pesando o picnómetro vazio e cheio
// com a amostra e com o líquido de referência (água); o volume fica definido pela marca/capilar cheio.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

  // Corpo: balão de vidro com gargalo (aberto em cima).
  const corpo = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { fill: 'var(--cor-1)', 'fill-opacity': 0.14,
      d: 'M112 70 V112 C112 124 84 132 84 160 C84 186 104 200 130 200 C156 200 176 186 176 160 C176 132 148 124 148 112 V70' })));
    g.appendChild(cs('path', { d: 'M96 164 C100 184 114 192 130 192 C146 192 160 184 164 164 Z', fill: 'var(--cor-1)', 'fill-opacity': 0.25, stroke: 'none' }));
  };
  // Tampa esmerilada com capilar (tubo fino) que a atravessa.
  const tampa = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { fill: 'var(--superficie)', d: 'M116 34 H144 L148 70 H112 Z' })));
    g.appendChild(cs('rect', Object.assign({}, TRACO, { fill: 'var(--superficie)', x: 126, y: 6, width: 8, height: 60, rx: 2 })));
    g.appendChild(cs('line', { x1: 130, y1: 10, x2: 130, y2: 62, stroke: 'var(--cor-1)', 'stroke-width': 2 }));
  };
  // Marca de aferição: risca à volta do gargalo (volume rigoroso quando o líquido chega a ela).
  const marca = (g, cs) => {
    g.appendChild(cs('line', { x1: 106, y1: 92, x2: 154, y2: 92, stroke: 'var(--cor-2)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  };

  Manual.esquemas.registar('fig-picnometro', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Picnómetro (sem escala)',
        largura: 260,
        altura: 210,
        partes: [
          { id: 'corpo', rotulo: 'Corpo', descricao: 'Balão de vidro de volume bem conhecido; pesa-se vazio e cheio com a amostra e com a água.',
            explodir: { dx: 0, dy: 20 }, ancora: { x: 130, y: 165 }, desenhar: corpo },
          { id: 'tampa', rotulo: 'Tampa com capilar', descricao: 'Rolha de vidro esmerilada atravessada por um tubo fino (capilar): ao fechar, o excesso de líquido sai pelo capilar e o volume fica sempre o mesmo.',
            explodir: { dx: 0, dy: -35 }, ancora: { x: 130, y: 40 }, desenhar: tampa },
          { id: 'marca', rotulo: 'Marca', descricao: 'Risca no gargalo que indica o nível até onde se enche; garante o mesmo volume em todas as pesagens.',
            explodir: { dx: 70, dy: 0 }, ancora: { x: 154, y: 92 }, desenhar: marca },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
