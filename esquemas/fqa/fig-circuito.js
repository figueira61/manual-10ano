globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida de um circuito elétrico simples (esquema ilustrativo, sem escala).
// Partes: fonte, interruptor, resistência, amperímetro (em série), voltímetro (em paralelo com a resistência), fios.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const linha = (g, cs, x1, y1, x2, y2, extra) => g.appendChild(cs('line', Object.assign({}, TRACO, { x1, y1, x2, y2 }, extra)));
  const letra = (g, cs, x, y, t) => {
    const e = cs('text', { x, y, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--texto)' });
    e.textContent = t;
    g.appendChild(e);
  };

  // Fios: o percurso fechado da corrente (os restantes componentes desenham-se por cima).
  const fios = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M40 100 V40 H260 V160 H40 V100' })));
  };
  // Fonte: duas placas, a maior é o terminal positivo.
  const fonte = (g, cs) => {
    g.appendChild(cs('rect', { x: 28, y: 86, width: 24, height: 28, fill: 'var(--superficie)', stroke: 'none' }));
    linha(g, cs, 28, 92, 52, 92, { 'stroke-width': 3 });
    linha(g, cs, 34, 106, 46, 106, { 'stroke-width': 3 });
    letra(g, cs, 22, 90, '+');
    letra(g, cs, 22, 114, '−');
  };
  // Interruptor: dois contactos e uma lâmina articulada.
  const interruptor = (g, cs) => {
    g.appendChild(cs('rect', { x: 98, y: 30, width: 44, height: 20, fill: 'var(--superficie)', stroke: 'none' }));
    g.appendChild(cs('circle', { cx: 100, cy: 40, r: 3.5, fill: 'var(--texto)' }));
    g.appendChild(cs('circle', { cx: 140, cy: 40, r: 3.5, fill: 'var(--texto)' }));
    linha(g, cs, 100, 40, 134, 24);
  };
  // Resistência: retângulo no ramo principal.
  const resistencia = (g, cs) => {
    g.appendChild(cs('rect', Object.assign({}, TRACO, { x: 180, y: 32, width: 50, height: 16, fill: 'var(--superficie)' })));
  };
  // Amperímetro: círculo com A, no fio de baixo (em série).
  const amperimetro = (g, cs) => {
    g.appendChild(cs('circle', Object.assign({}, TRACO, { cx: 140, cy: 160, r: 14, fill: 'var(--superficie)' })));
    letra(g, cs, 140, 165, 'A');
  };
  // Voltímetro: círculo com V ligado aos dois terminais da resistência (em paralelo).
  const voltimetro = (g, cs) => {
    g.appendChild(cs('path', Object.assign({}, TRACO, { d: 'M180 40 V100 H191 M219 100 H230 V40' })));
    g.appendChild(cs('circle', Object.assign({}, TRACO, { cx: 205, cy: 100, r: 14, fill: 'var(--superficie)' })));
    letra(g, cs, 205, 105, 'V');
  };

  Manual.esquemas.registar('fig-circuito', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Circuito elétrico simples (sem escala)',
        largura: 290,
        altura: 190,
        partes: [
          { id: 'fios', rotulo: 'Fios', descricao: 'Condutores que fecham o circuito e levam a corrente de um componente ao seguinte; têm resistência desprezável.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 150, y: 160 }, desenhar: fios },
          { id: 'fonte', rotulo: 'Fonte', descricao: 'Fonte de energia (pilha ou gerador): mantém uma diferença de potencial elétrico entre os terminais e faz circular a corrente.',
            explodir: { dx: -20, dy: 0 }, ancora: { x: 40, y: 100 }, desenhar: fonte },
          { id: 'interruptor', rotulo: 'Interruptor', descricao: 'Abre ou fecha o circuito: com o interruptor fechado há corrente, com ele aberto não há.',
            explodir: { dx: 0, dy: -30 }, ancora: { x: 120, y: 40 }, desenhar: interruptor },
          { id: 'resistencia', rotulo: 'Resistência', descricao: 'Componente onde a energia elétrica é dissipada por efeito Joule; limita a corrente.',
            explodir: { dx: 25, dy: -30 }, ancora: { x: 205, y: 40 }, desenhar: resistencia },
          { id: 'amperimetro', rotulo: 'Amperímetro', descricao: 'O amperímetro liga-se em série e mede a corrente; por isso tem resistência muito pequena.',
            explodir: { dx: 0, dy: 30 }, ancora: { x: 140, y: 160 }, desenhar: amperimetro },
          { id: 'voltimetro', rotulo: 'Voltímetro', descricao: 'O voltímetro liga-se em paralelo com o componente e mede a diferença de potencial elétrico entre os seus terminais; por isso tem resistência muito grande.',
            explodir: { dx: 0, dy: 25 }, ancora: { x: 205, y: 100 }, desenhar: voltimetro },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
