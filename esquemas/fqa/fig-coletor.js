globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida de um coletor solar plano, em corte (esquema ilustrativo, sem escala).
// Partes, de cima para baixo: cobertura de vidro, placa absorsora escura, tubos com fluido, isolamento térmico e caixa;
// a água fria entra pela esquerda (ponta (50, 114) do tubo) e a água quente sai pela direita (ponta (240, 114)).
// Os deslocamentos da vista explodida mantêm tudo dentro dos 290 × 190 da figura montada.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };

  // Caixa: fundo e paredes laterais, aberta em cima (a cobertura de vidro fecha-a).
  const caixa = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M40 60 V150 H250 V60' })));
  };
  // Isolamento térmico: camada tracejada no fundo da caixa.
  const isolamento = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 44, y: 124, width: 202, height: 22, fill: 'var(--superficie)', 'stroke-dasharray': '5 3' })));
  };
  // Tubos com fluido: tubo em corte longitudinal, com a água (cor-1) lá dentro.
  const tubos = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 50, y: 108, width: 190, height: 12, fill: 'var(--cor-1)', 'fill-opacity': 0.35 })));
  };
  // Placa absorsora: placa fina e escura, por cima dos tubos.
  const placa = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 46, y: 100, width: 198, height: 6, fill: 'var(--texto)' })));
  };
  // Cobertura de vidro: placa transparente que fecha a caixa por cima.
  const vidro = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 40, y: 54, width: 210, height: 6, fill: 'var(--cor-1)', 'fill-opacity': 0.15 })));
  };
  // Entrada de água fria: cano que chega à ponta esquerda do tubo, com seta para dentro.
  const entrada = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M14 136 H34 V114 H50', stroke: 'var(--cor-1)', 'stroke-width': 3 })));
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M20 131 L26 136 L20 141', stroke: 'var(--cor-1)' })));
  };
  // Saída de água quente: cano que sai da ponta direita do tubo, com seta para fora.
  const saida = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M240 114 H262 V80 H284', stroke: 'var(--cor-3)', 'stroke-width': 3 })));
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M278 75 L284 80 L278 85', stroke: 'var(--cor-3)' })));
  };

  Manual.esquemas.registar('fig-coletor', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Coletor solar plano, em corte (sem escala)',
        largura: 290,
        altura: 190,
        partes: [
          { id: 'vidro', rotulo: 'Cobertura de vidro', descricao: 'Vidro transparente que fecha a caixa por cima e deixa passar a luz visível do Sol. Reduz as perdas de energia por convecção, porque abriga do vento o ar por cima da placa, e por radiação infravermelha, porque o vidro deixa passar pouco do infravermelho emitido pela placa quente (efeito de estufa).',
            explodir: { dx: 0, dy: -40 }, ancora: { x: 145, y: 57 }, desenhar: vidro },
          { id: 'placa', rotulo: 'Placa absorsora', descricao: 'Placa metálica escura (preta e baça), que absorve a maior parte da radiação solar que chega; a sua energia interna aumenta e ela aquece.',
            explodir: { dx: 0, dy: -18 }, ancora: { x: 145, y: 103 }, desenhar: placa },
          { id: 'tubos', rotulo: 'Tubos com fluido', descricao: 'Tubos metálicos encostados à placa, por onde circula um fluido (água). A energia passa da placa quente para o fluido por condução, através das paredes dos tubos, e o fluido em movimento transporta-a para fora do coletor.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 145, y: 114 }, desenhar: tubos },
          { id: 'isolamento', rotulo: 'Isolamento térmico', descricao: 'Camada de material mau condutor térmico (lã mineral, espuma) por baixo dos tubos: reduz as perdas de energia por condução através do fundo da caixa.',
            explodir: { dx: 0, dy: 34 }, ancora: { x: 145, y: 135 }, desenhar: isolamento },
          { id: 'caixa', rotulo: 'Caixa', descricao: 'Suporta as outras peças e, fechada pela cobertura de vidro, protege-as da chuva, do pó e do vento.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 248, y: 140 }, desenhar: caixa },
          { id: 'entrada', rotulo: 'Entrada de água fria', descricao: 'Por aqui entra a água fria, vinda da parte de baixo do depósito; vai aquecer ao passar nos tubos.',
            explodir: { dx: -6, dy: 0 }, ancora: { x: 22, y: 136 }, desenhar: entrada },
          { id: 'saida', rotulo: 'Saída de água quente', descricao: 'Por aqui sai a água aquecida nos tubos, que leva a energia recebida até ao depósito.',
            explodir: { dx: 4, dy: -20 }, ancora: { x: 270, y: 80 }, desenhar: saida },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
