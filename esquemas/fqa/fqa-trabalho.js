globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-trabalho: trabalho de uma força constante, W = F d cos α. A aluna ajusta F, d e o ângulo α entre a
// força e o deslocamento (0° a 180°); vê a força, o deslocamento e a componente eficaz F cos α (paralela ao
// deslocamento), e W com o seu sinal: potente (α < 90°), resistente (α > 90°) ou nulo (α = 90°, ou F ou d nulos).
// Opções: { F (N, omissão 20), d (m, omissão 5), alfa (°, omissão 30) }.
Manual.esquemas.registar('fqa-trabalho', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const Fis = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 2 : d }).replace('-', '−');
    };
    const f1 = (v) => Math.round(v * 10) / 10;
    const est = { F: lim(opcoes.F, 0, 100, 20), d: lim(opcoes.d, 0, 10, 5), alfa: Math.round(lim(opcoes.alfa, 0, 180, 30)) };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function svgEl(nome, atributos, pai) {
      const e = document.createElementNS(NS, nome);
      for (const k in atributos) e.setAttribute(k, atributos[k]);
      if (pai) pai.appendChild(e);
      return e;
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-trabalho');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sF = N.slider(zonaCtl, { rotulo: 'Intensidade da força F / N', min: 0, max: 100, passo: 1, valor: est.F, aoMudar: (v) => { est.F = v; atualizar(); } });
    const sD = N.slider(zonaCtl, { rotulo: 'Deslocamento d / m', min: 0, max: 10, passo: 0.5, valor: est.d, aoMudar: (v) => { est.d = v; atualizar(); } });
    const sA = N.slider(zonaCtl, { rotulo: 'Ângulo α entre a força e o deslocamento / °', min: 0, max: 180, passo: 1, valor: est.alfa, aoMudar: (v) => { est.alfa = Math.round(v); atualizar(); } });

    const L = 320, ALT = 170;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'trabalho-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    function seta(x1, y1, x2, y2, cor, largura, classe) {
      svgEl('line', { class: classe, x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: cor, 'stroke-width': largura }, svg);
      const c = Math.hypot(x2 - x1, y2 - y1);
      if (c < 4) return;
      const ux = (x2 - x1) / c, uy = (y2 - y1) / c;
      svgEl('polygon', { points: f1(x2) + ',' + f1(y2) + ' ' + f1(x2 - 8 * ux + 4 * uy) + ',' + f1(y2 - 8 * uy - 4 * ux) + ' ' + f1(x2 - 8 * ux - 4 * uy) + ',' + f1(y2 - 8 * uy + 4 * ux), fill: cor }, svg);
    }

    function atualizar() {
      const W = Fis.trabalho(est.F, est.d, est.alfa);
      const Fef = Fis.trabalho(est.F, 1, est.alfa); // F cos α (trabalho por metro)
      const tipo = W > 0 ? 'potente' : W < 0 ? 'resistente' : 'nulo';
      const rad = (est.alfa * Math.PI) / 180;
      svg.textContent = '';
      const Y = 110, X0 = 60;
      svgEl('line', { x1: 14, y1: Y + 12, x2: 306, y2: Y + 12, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      svgEl('rect', { x: X0 - 14, y: Y - 14, width: 28, height: 26, fill: 'var(--cor-1)', 'fill-opacity': 0.35, stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      // deslocamento (por baixo do corpo) e força (a partir do centro do corpo)
      const dl = (est.d / 10) * 200;
      seta(X0, Y + 24, X0 + dl, Y + 24, 'var(--cor-3)', 2.5, 'desloc');
      const t1 = svgEl('text', { x: X0 + dl / 2, y: Y + 38, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t1.textContent = 'deslocamento d = ' + fmt(est.d) + ' m';
      const cl = (est.F / 100) * 90;
      const fx = cl * Math.cos(rad), fy = -cl * Math.sin(rad);
      const cx = X0, cy = Y - 1;
      seta(cx, cy, cx + fx, cy + fy, 'var(--cor-2)', 2.5, 'forca');
      const t2 = svgEl('text', { x: f1(cx + fx + (fx >= 0 ? 4 : -4)), y: f1(cy + fy - 4), 'text-anchor': fx >= 0 ? 'start' : 'end', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t2.textContent = 'F = ' + fmt(est.F) + ' N';
      // componente eficaz F cos α, paralela ao deslocamento
      svgEl('line', { x1: f1(cx + fx), y1: f1(cy + fy), x2: f1(cx + fx), y2: cy, stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      seta(cx, cy, cx + fx, cy, 'var(--cor-1)', 2, 'componente');
      const t3 = svgEl('text', { x: f1(cx + fx / 2), y: cy + 13, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--texto)' }, svg);
      t3.textContent = 'F cos α = ' + fmt(Fef) + ' N';
      const t4 = svgEl('text', { x: 14, y: 16, 'font-size': 11, fill: 'var(--texto)' }, svg);
      t4.textContent = 'α = ' + fmt(est.alfa, 0) + '°';
      svg.setAttribute('aria-label', 'Força de ' + fmt(est.F) + ' N a ' + fmt(est.alfa, 0) + '° do deslocamento de ' + fmt(est.d) + ' m. Componente eficaz F cos α = ' + fmt(Fef) + ' N. Trabalho W = ' + fmt(W) + ' J, trabalho ' + tipo + '.');

      zonaTexto.textContent = '';
      const lista = criar('dl', 'painel-valores');
      const linha = (rot, v) => { lista.appendChild(criar('dt', '', rot)); lista.appendChild(criar('dd', '', v)); };
      linha('Componente eficaz F cos α', fmt(Fef) + ' N');
      linha('Cálculo', 'W = F d cos α = ' + fmt(est.F) + ' × ' + fmt(est.d) + ' × cos ' + fmt(est.alfa, 0) + '°');
      linha('Trabalho', 'W = ' + fmt(W) + ' J');
      linha('Tipo', 'trabalho ' + tipo);
      zonaTexto.appendChild(lista);
      const exp = tipo === 'potente' ? 'A componente da força tem o sentido do deslocamento (α < 90°): a força favorece o movimento e o trabalho é positivo.'
        : tipo === 'resistente' ? 'A componente da força tem sentido oposto ao deslocamento (α > 90°): a força opõe-se ao movimento e o trabalho é negativo.'
          : (est.F === 0 || est.d === 0) ? 'Sem força ou sem deslocamento, não há trabalho.' : 'A força é perpendicular ao deslocamento (α = 90°): não realiza trabalho.';
      zonaTexto.appendChild(criar('p', 'esq-legenda', exp));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      sA.definir(Math.min(Math.max(est.alfa + d * (ev.shiftKey ? 10 : 1), 0), 180));
    };
    svg.addEventListener('keydown', aoTecla);
    atualizar();

    return {
      destruir() {
        svg.removeEventListener('keydown', aoTecla);
        sF.destruir();
        sD.destruir();
        sA.destruir();
        el.textContent = '';
      },
    };
  },
});
