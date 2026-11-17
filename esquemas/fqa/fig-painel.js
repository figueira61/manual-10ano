globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida de uma montagem de AL com um painel fotovoltaico (esquema ilustrativo, sem escala).
// Partes: painel, fonte de luz, reóstato (resistência de carga variável), amperímetro (em série), voltímetro (em paralelo).
// Circuito: terminal + do painel → amperímetro → reóstato → terminal − do painel; o voltímetro liga aos dois terminais do painel.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const letra = (g, cs, x, y, t) => {
    const e = cs('text', { x, y, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--texto)' });
    e.textContent = t;
    g.appendChild(e);
  };

  // Fonte de luz: lâmpada com raios dirigidos para o painel.
  const fonte = (g, cs) => {
    g.appendChild(cs('circle', Object.assign({}, TRACO, { cx: 40, cy: 30, r: 13, fill: 'var(--cor-2)', 'fill-opacity': 0.5 })));
    [[50, 42, 66, 58], [40, 46, 40, 66], [28, 42, 18, 58]].forEach(([x1, y1, x2, y2]) => {
      g.appendChild(cs('line', Object.assign({}, TRACO, { x1, y1, x2, y2, 'stroke-dasharray': '4 3' })));
    });
  };
  // Painel: retângulo com grelha de células e os dois terminais, na aresta direita: T+ (128, 80) e T− (128, 120).
  const painel = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 18, y: 70, width: 110, height: 60, fill: 'var(--cor-1)', 'fill-opacity': 0.25 })));
    g.appendChild(cs('path', Object.assign({}, TRACO, { 'stroke-width': 1, d: 'M55 70 V130 M92 70 V130 M18 100 H128' })));
    [[128, 80], [128, 120]].forEach(([cx, cy]) => {
      g.appendChild(cs('circle', { class: 'terminal', cx, cy, r: 3, fill: 'var(--texto)' }));
    });
  };
  // Reóstato: resistência com cursor, em série na parte de baixo (extremos (170, 153) e (260, 153)).
  const reostato = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 170, y: 144, width: 90, height: 18, fill: 'var(--superficie)' })));
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M215 126 V144 M215 144 L209 132 M215 144 L221 132' })));
    g.appendChild(cs('line', Object.assign({}, TRACO, { x1: 190, y1: 126, x2: 240, y2: 126 })));
  };
  // Amperímetro: círculo com A no fio de cima (em série), centro (215, 60), extremos (201, 60) e (229, 60).
  const amperimetro = (g, cs) => {
    g.appendChild(cs('circle', Object.assign({}, TRACO, { class: 'amperimetro', cx: 215, cy: 60, r: 14, fill: 'var(--superficie)' })));
    letra(g, cs, 215, 65, 'A');
  };
  // Voltímetro: círculo com V entre os terminais do painel (em paralelo): os dois fios saem de T+ e de T−.
  const voltimetro = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { class: 'fio-voltimetro', 'stroke-width': 1.5, d: 'M128 80 H160 V86 M128 120 H160 V114' })));
    g.appendChild(cs('circle', Object.assign({}, TRACO, { class: 'voltimetro', cx: 160, cy: 100, r: 14, fill: 'var(--superficie)' })));
    letra(g, cs, 160, 105, 'V');
  };
  // Fios do circuito principal (em série): T+ → amperímetro → reóstato → T−.
  const fios = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { class: 'fio-principal', 'stroke-width': 1.5, d: 'M128 80 V60 H201 M229 60 H270 V153 H260 M170 153 H128 V120' })));
  };

  Manual.esquemas.registar('fig-painel', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Painel fotovoltaico em montagem de AL (sem escala)',
        largura: 290,
        altura: 190,
        partes: [
          { id: 'fios', rotulo: 'Fios', descricao: 'Condutores que ligam o painel ao amperímetro e ao reóstato, fechando o circuito em série.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 270, y: 110 }, desenhar: fios },
          { id: 'painel', rotulo: 'Painel', descricao: 'Painel fotovoltaico: converte parte da energia da radiação incidente em energia elétrica; é o gerador do circuito.',
            explodir: { dx: -10, dy: 20 }, ancora: { x: 73, y: 100 }, desenhar: painel },
          { id: 'fonte', rotulo: 'Fonte de luz', descricao: 'Lâmpada que ilumina o painel; a irradiância depende da potência da lâmpada e da distância ao painel.',
            explodir: { dx: -10, dy: -20 }, ancora: { x: 40, y: 30 }, desenhar: fonte },
          { id: 'reostato', rotulo: 'Reóstato', descricao: 'Resistência variável ligada ao painel (a carga): ao mudar o cursor muda-se a resistência de carga e, com ela, o ponto de funcionamento do painel.',
            explodir: { dx: 10, dy: 25 }, ancora: { x: 215, y: 153 }, desenhar: reostato },
          { id: 'amperimetro', rotulo: 'Amperímetro', descricao: 'O amperímetro liga-se em série e mede a corrente que o painel fornece à carga.',
            explodir: { dx: 0, dy: -25 }, ancora: { x: 215, y: 60 }, desenhar: amperimetro },
          { id: 'voltimetro', rotulo: 'Voltímetro', descricao: 'O voltímetro liga-se em paralelo com o painel e mede a diferença de potencial elétrico entre os seus terminais.',
            explodir: { dx: 15, dy: 10 }, ancora: { x: 160, y: 100 }, desenhar: voltimetro },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
