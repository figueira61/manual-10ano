globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida do material de laboratório para preparar uma solução (esquema ilustrativo, sem escala).
// Partes: balança, espátula, vidro de relógio, gobelé, funil, balão volumétrico, pipeta, pompete, esguicho.
// Cada peça está desenhada numa célula de 120 × 90 (grelha 3 × 3); a vista explodida afasta-as do centro.
(function () {
  const TRACO = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const VIDRO = Object.assign({}, TRACO, { fill: 'var(--cor-1)', 'fill-opacity': 0.12 });
  const SOLIDO = Object.assign({}, TRACO, { fill: 'var(--superficie)' });

  // Desenha um conjunto de formas deslocado para a célula (ox, oy); cada forma é [tag, atributos].
  const celula = (ox, oy, formas) => (g, cs) => {
    const sub = cs('g', { transform: 'translate(' + ox + ' ' + oy + ')' });
    formas.forEach((f) => sub.appendChild(cs(f[0], f[1])));
    g.appendChild(sub);
  };
  const forma = (tag, base, extra) => [tag, Object.assign({}, base, extra)];

  const balanca = celula(0, 0, [
    forma('rect', SOLIDO, { x: 14, y: 52, width: 92, height: 26, rx: 4 }),
    forma('rect', Object.assign({}, TRACO, { fill: 'var(--cor-1)', 'fill-opacity': 0.25 }), { x: 62, y: 59, width: 36, height: 11, rx: 2 }),
    forma('line', TRACO, { x1: 44, y1: 44, x2: 44, y2: 52 }),
    forma('line', TRACO, { x1: 24, y1: 44, x2: 64, y2: 44 }),
  ]);
  const espatula = celula(120, 0, [
    forma('line', Object.assign({}, TRACO, { 'stroke-width': 5 }), { x1: 22, y1: 72, x2: 72, y2: 34 }),
    forma('ellipse', SOLIDO, { cx: 84, cy: 25, rx: 17, ry: 8, transform: 'rotate(-37 84 25)' }),
  ]);
  const vidroRelogio = celula(240, 0, [
    forma('path', VIDRO, { d: 'M14 46 Q60 92 106 46 Z' }),
  ]);
  const gobele = celula(0, 90, [
    forma('path', VIDRO, { d: 'M28 14 H38 M38 14 V76 H82 V14 M82 14 H92' }),
    forma('line', TRACO, { x1: 38, y1: 32, x2: 50, y2: 32, 'stroke-width': 1.5 }),
    forma('line', TRACO, { x1: 38, y1: 46, x2: 50, y2: 46, 'stroke-width': 1.5 }),
    forma('line', TRACO, { x1: 38, y1: 60, x2: 50, y2: 60, 'stroke-width': 1.5 }),
  ]);
  const funil = celula(120, 90, [
    forma('path', VIDRO, { d: 'M20 14 H100 L68 52 V80 H52 V52 Z' }),
  ]);
  const balao = celula(240, 90, [
    forma('path', VIDRO, { d: 'M52 4 V28 C52 40 26 46 26 62 C26 76 40 84 60 84 C80 84 94 76 94 62 C94 46 68 40 68 28 V4' }),
    forma('line', Object.assign({}, TRACO, { stroke: 'var(--cor-2)', 'stroke-width': 3 }), { x1: 48, y1: 16, x2: 72, y2: 16 }),
  ]);
  const pipeta = celula(0, 180, [
    forma('path', VIDRO, { d: 'M54 4 V50 C54 54 50 56 50 62 L60 86 L70 62 C70 56 66 54 66 50 V4' }),
    forma('line', Object.assign({}, TRACO, { stroke: 'var(--cor-2)', 'stroke-width': 3 }), { x1: 50, y1: 20, x2: 70, y2: 20 }),
  ]);
  const pompete = celula(120, 180, [
    forma('path', SOLIDO, { d: 'M48 38 C28 38 28 14 52 12 L68 12 C92 14 92 38 72 38 Z' }),
    forma('rect', SOLIDO, { x: 52, y: 38, width: 16, height: 10, rx: 2 }),
    forma('rect', SOLIDO, { x: 52, y: 52, width: 16, height: 10, rx: 2 }),
    forma('rect', SOLIDO, { x: 52, y: 66, width: 16, height: 10, rx: 2 }),
  ]);
  const esguicho = celula(240, 180, [
    forma('path', VIDRO, { d: 'M42 30 H70 V40 C78 44 80 50 80 56 V80 H34 V56 C34 50 36 44 42 40 Z' }),
    forma('path', TRACO, { d: 'M70 30 V20 H88 L98 12' }),
  ]);

  Manual.esquemas.registar('fig-material-solucao', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Material de laboratório para preparar uma solução (sem escala)',
        largura: 360,
        altura: 270,
        partes: [
          { id: 'balanca', rotulo: 'Balança', descricao: 'Mede a massa de soluto a dissolver (em gramas, com a incerteza do aparelho). Faz-se a tara com o recipiente vazio.',
            explodir: { dx: -40, dy: -30 }, ancora: { x: 60, y: 65 }, desenhar: balanca },
          { id: 'espatula', rotulo: 'Espátula', descricao: 'Transfere o soluto sólido para o vidro de relógio ou para o gobelé, sem lhe tocar com as mãos.',
            explodir: { dx: 0, dy: -40 }, ancora: { x: 180, y: 55 }, desenhar: espatula },
          { id: 'vidro-relogio', rotulo: 'Vidro de relógio', descricao: 'Recebe o sólido na balança; depois o soluto é passado para o gobelé.',
            explodir: { dx: 40, dy: -30 }, ancora: { x: 300, y: 55 }, desenhar: vidroRelogio },
          { id: 'gobele', rotulo: 'Gobelé', descricao: 'Recipiente onde se dissolve o soluto numa porção de água destilada, com agitação, antes de passar a solução para o balão.',
            explodir: { dx: -45, dy: 0 }, ancora: { x: 60, y: 135 }, desenhar: gobele },
          { id: 'funil', rotulo: 'Funil', descricao: 'Ajuda a transferir a solução do gobelé para o balão volumétrico sem perdas.',
            explodir: { dx: 0, dy: 0 }, ancora: { x: 180, y: 145 }, desenhar: funil },
          { id: 'balao', rotulo: 'Balão volumétrico', descricao: 'Prepara um volume rigoroso de solução: completa-se com água destilada até a parte de baixo do menisco ficar tangente à marca de aferição.',
            explodir: { dx: 45, dy: 0 }, ancora: { x: 300, y: 155 }, desenhar: balao },
          { id: 'pipeta', rotulo: 'Pipeta', descricao: 'Mede com rigor um volume fixo de líquido (por exemplo, de solução concentrada numa diluição), até à marca de aferição.',
            explodir: { dx: -40, dy: 35 }, ancora: { x: 60, y: 230 }, desenhar: pipeta },
          { id: 'pompete', rotulo: 'Pompete', descricao: 'Bomba de borracha que aspira o líquido para a pipeta; nunca se pipeta com a boca.',
            explodir: { dx: 0, dy: 40 }, ancora: { x: 180, y: 215 }, desenhar: pompete },
          { id: 'esguicho', rotulo: 'Esguicho', descricao: 'Frasco com água destilada: serve para lavar o gobelé e o funil e para completar o volume, gota a gota, até à marca.',
            explodir: { dx: 40, dy: 35 }, ancora: { x: 300, y: 235 }, desenhar: esguicho },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
