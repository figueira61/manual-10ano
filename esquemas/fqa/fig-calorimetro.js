globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida de um calorímetro com resistência de aquecimento (esquema ilustrativo, sem escala).
// Partes: vaso, isolamento, tampa, termómetro, agitador, resistência de aquecimento.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

  // Isolamento: caixa exterior que envolve o vaso.
  const isolamento = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 60, y: 52, width: 170, height: 120, fill: 'var(--superficie)', 'stroke-dasharray': '5 3' })));
  };
  // Vaso: recipiente interior, com a água.
  const vaso = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 76, y: 64, width: 138, height: 98, fill: 'none' })));
    g.appendChild(cs('rect', { x: 77, y: 90, width: 136, height: 71, fill: 'var(--cor-1)', 'fill-opacity': 0.3, stroke: 'none' }));
  };
  // Resistência de aquecimento: fio em ziguezague no fundo, com dois terminais.
  const resistencia = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M104 56 V146 L114 152 L124 140 L134 152 L144 140 L154 152 L164 140 L174 152 L184 146 V56', stroke: 'var(--cor-3)' })));
  };
  // Termómetro: tubo com o bolbo mergulhado na água.
  const termometro = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 128, y: 24, width: 8, height: 96, fill: 'var(--superficie)' })));
    g.appendChild(cs('circle', Object.assign({}, TRACO, { cx: 132, cy: 124, r: 7, fill: 'var(--cor-3)' })));
  };
  // Agitador: haste com uma pá no fundo.
  const agitador = (g, cs) => {
    g.appendChild(cs('line', Object.assign({}, TRACO, { x1: 160, y1: 16, x2: 160, y2: 136 })));
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 150, y: 130, width: 20, height: 8, fill: 'var(--superficie)' })));
  };
  // Tampa: cobre o vaso e tem furos para o termómetro, o agitador e os fios.
  const tampa = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 56, y: 44, width: 178, height: 12, fill: 'var(--superficie)' })));
  };

  Manual.esquemas.registar('fig-calorimetro', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Calorímetro com resistência de aquecimento (sem escala)',
        largura: 290,
        altura: 190,
        partes: [
          { id: 'isolamento', rotulo: 'Isolamento', descricao: 'Material isolante à volta do vaso: reduz as trocas de energia com o exterior, para que a energia fornecida fique quase toda na água.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 230, y: 112 }, desenhar: isolamento },
          { id: 'vaso', rotulo: 'Vaso', descricao: 'Recipiente interior, de capacidade térmica pequena, onde está a água (ou outro líquido) cuja temperatura se mede.',
            explodir: { dx: 0, dy: 15 }, ancora: { x: 214, y: 130 }, desenhar: vaso },
          { id: 'resistencia', rotulo: 'Resistência de aquecimento', descricao: 'Resistência elétrica mergulhada na água: a energia elétrica é dissipada por efeito Joule e fornecida à água, com a potência P = U I.',
            explodir: { dx: 0, dy: 40 }, ancora: { x: 144, y: 146 }, desenhar: resistencia },
          { id: 'termometro', rotulo: 'Termómetro', descricao: 'Mede a temperatura da água ao longo do tempo; o bolbo tem de estar mergulhado na água, sem tocar no fundo nem nas paredes.',
            explodir: { dx: -45, dy: -20 }, ancora: { x: 132, y: 70 }, desenhar: termometro },
          { id: 'agitador', rotulo: 'Agitador', descricao: 'Mexe a água para que a temperatura seja uniforme e o termómetro meça o valor de toda a água.',
            explodir: { dx: 45, dy: -20 }, ancora: { x: 160, y: 70 }, desenhar: agitador },
          { id: 'tampa', rotulo: 'Tampa', descricao: 'Fecha o vaso, para reduzir perdas de energia por evaporação e convecção; tem furos para o termómetro, o agitador e os fios da resistência.',
            explodir: { dx: 0, dy: -38 }, ancora: { x: 234, y: 50 }, desenhar: tampa },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
