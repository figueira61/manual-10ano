globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Figura explodida do modelo de Bohr do átomo de hidrogénio (esquema ilustrativo, sem escala).
// Partes: núcleo (+), órbitas n = 1, 2, 3, 4, limite n = ∞ (ionização), absorção (sobe, com fotão a entrar)
// e emissão (desce, com fotão a sair). As órbitas desenham-se como meias circunferências, à direita do núcleo.
(function () {
  const CX = 56;
  const CY = 115;
  const RAIO = { 1: 24, 2: 44, 3: 66, 4: 90, inf: 110 };
  const r2 = (v) => Math.round(v * 100) / 100;
  const ponto = (r, graus) => {
    const a = (graus * Math.PI) / 180;
    return [r2(CX + r * Math.cos(a)), r2(CY + r * Math.sin(a))];
  };
  const caminho = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  // Meia circunferência (de −90° a +90°) feita de segmentos de reta.
  const arco = (r) => {
    const pts = [];
    for (let g = -90; g <= 90; g += 7.5) pts.push(ponto(r, g));
    return caminho(pts);
  };
  // Ponta de seta em P, a apontar no sentido de Q → P.
  const ponta = (q, p, tam) => {
    const ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
    const lado = (s) => [r2(p[0] - tam * Math.cos(ang + s * 0.45)), r2(p[1] - tam * Math.sin(ang + s * 0.45))];
    const a = lado(1);
    const b = lado(-1);
    return 'M' + p[0] + ' ' + p[1] + ' L' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + ' L' + p[0] + ' ' + p[1];
  };
  // Fotão: linha ondulada (em ziguezague) de A para B, com ponta em B.
  const onda = (a, b) => {
    const n = 10;
    const dx = (b[0] - a[0]) / n;
    const dy = (b[1] - a[1]) / n;
    const comp = Math.hypot(dx, dy);
    const [px, py] = [-dy / comp, dx / comp];
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const amp = i === 0 || i === n ? 0 : (i % 2 ? 4 : -4);
      pts.push([r2(a[0] + dx * i + px * amp), r2(a[1] + dy * i + py * amp)]);
    }
    return caminho(pts);
  };
  const TRACO = { fill: 'none', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const texto = (g, cs, x, y, t) => {
    const e = cs('text', { x, y, 'text-anchor': 'end', 'font-size': 9, fill: 'var(--texto)' });
    e.textContent = t;
    g.appendChild(e);
  };
  const eletrao = (g, cs, p) => g.appendChild(cs('circle', { cx: p[0], cy: p[1], r: 4, fill: 'var(--cor-3)', stroke: 'var(--texto)', 'stroke-width': 1 }));

  const nucleo = (g, cs) => {
    g.appendChild(cs('circle', { cx: CX, cy: CY, r: 10, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }));
    g.appendChild(cs('path', { d: 'M' + (CX - 5) + ' ' + CY + ' H' + (CX + 5) + ' M' + CX + ' ' + (CY - 5) + ' V' + (CY + 5), stroke: 'var(--superficie)', 'stroke-width': 2, fill: 'none' }));
  };
  const nivel = (n) => (g, cs) => {
    const r = RAIO[n];
    const extra = n === 'inf' ? { stroke: 'var(--texto-suave)', 'stroke-dasharray': '5 4' } : { stroke: 'var(--texto)' };
    g.appendChild(cs('path', Object.assign({}, TRACO, extra, { d: arco(r) })));
    texto(g, cs, CX - 4, CY - r + 4, n === 'inf' ? 'n = ∞' : 'n = ' + n);
  };
  // Absorção: o fotão chega de fora e o eletrão sobe de n = 1 para n = 3.
  const ABS = { de: ponto(RAIO[1] + 5, -35), ate: ponto(RAIO[3], -35), fotao: [[230, 30], [150, 58]] };
  const absorcao = (g, cs) => {
    const cor = { stroke: 'var(--cor-1)' };
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: onda(ABS.fotao[0], ABS.fotao[1]) })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: ponta(ABS.fotao[0], ABS.fotao[1], 8), fill: 'var(--cor-1)' })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: caminho([ABS.de, ABS.ate]) })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: ponta(ABS.de, ABS.ate, 8), fill: 'var(--cor-1)' })));
    eletrao(g, cs, ponto(RAIO[1], -35));
  };
  // Emissão: o eletrão desce de n = 4 para n = 2 e o fotão sai para fora.
  const EMI = { de: ponto(RAIO[4] - 5, 35), ate: ponto(RAIO[2], 35), fotao: [[150, 175], [230, 205]] };
  const emissao = (g, cs) => {
    const cor = { stroke: 'var(--cor-4)' };
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: caminho([EMI.de, EMI.ate]) })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: ponta(EMI.de, EMI.ate, 8), fill: 'var(--cor-4)' })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: onda(EMI.fotao[0], EMI.fotao[1]) })));
    g.appendChild(cs('path', Object.assign({}, TRACO, cor, { d: ponta(EMI.fotao[0], EMI.fotao[1], 8), fill: 'var(--cor-4)' })));
    eletrao(g, cs, ponto(RAIO[4], 35));
  };
  const ancoraNivel = (n) => {
    const p = ponto(RAIO[n], -62);
    return { x: p[0], y: p[1] };
  };

  Manual.esquemas.registar('fig-bohr', {
    montar(el, opcoes) {
      const def = {
        titulo: 'Modelo de Bohr do átomo de hidrogénio (sem escala)',
        largura: 300,
        altura: 230,
        partes: [
          { id: 'nucleo', rotulo: 'Núcleo (+)', descricao: 'Centro do átomo, com carga positiva, que atrai o eletrão. No modelo de Bohr, o eletrão move-se à volta do núcleo em órbitas circulares, cada uma com uma energia bem definida.',
            explodir: { dx: -20, dy: 0 }, ancora: { x: CX, y: CY }, desenhar: nucleo },
          { id: 'n1', rotulo: 'n = 1 (fundamental)', descricao: 'Órbita mais próxima do núcleo e de menor energia (a mais negativa): com o eletrão aqui, o átomo está no estado fundamental.',
            explodir: { dx: 8, dy: 0 }, ancora: ancoraNivel(1), desenhar: nivel(1) },
          { id: 'n2', rotulo: 'n = 2 (excitado)', descricao: 'Órbita de energia maior (menos negativa) do que a de n = 1: com o eletrão aqui, o átomo está num estado excitado.',
            explodir: { dx: 16, dy: 0 }, ancora: ancoraNivel(2), desenhar: nivel(2) },
          { id: 'n3', rotulo: 'n = 3 (excitado)', descricao: 'Órbita de energia maior do que a de n = 2: o átomo está num estado excitado. Quanto mais longe do núcleo, maior (menos negativa) é a energia.',
            explodir: { dx: 24, dy: 0 }, ancora: ancoraNivel(3), desenhar: nivel(3) },
          { id: 'n4', rotulo: 'n = 4 (excitado)', descricao: 'Órbita de energia ainda maior: o átomo está num estado excitado. Em energia, os níveis ficam cada vez mais próximos uns dos outros à medida que n aumenta (no desenho, sem escala, as órbitas não o mostram).',
            explodir: { dx: 32, dy: 0 }, ancora: ancoraNivel(4), desenhar: nivel(4) },
          { id: 'ninf', rotulo: 'n = ∞ (ionização)', descricao: 'Limite em que o eletrão deixa de estar ligado ao núcleo, com energia 0: o átomo fica ionizado. Todos os níveis do átomo têm energia negativa, abaixo deste.',
            explodir: { dx: 40, dy: 0 }, ancora: ancoraNivel('inf'), desenhar: nivel('inf') },
          { id: 'absorcao', rotulo: 'Absorção de um fotão', descricao: 'O átomo absorve um fotão com energia igual à diferença entre dois níveis e o eletrão sobe de nível (aqui, de n = 1 para n = 3).',
            explodir: { dx: 50, dy: -30 }, ancora: { x: 150, y: 58 }, desenhar: absorcao },
          { id: 'emissao', rotulo: 'Emissão de um fotão', descricao: 'O eletrão desce de nível (aqui, de n = 4 para n = 2) e o átomo emite um fotão com energia igual à diferença entre os dois níveis.',
            explodir: { dx: 50, dy: 30 }, ancora: { x: 150, y: 175 }, desenhar: emissao },
        ],
      };
      return Manual.figura.criarEsquema(def).montar(el, opcoes);
    },
  });
})();
