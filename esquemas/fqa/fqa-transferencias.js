globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-transferencias: três painéis pequenos (condução, convecção, radiação) com um corpo quente cuja temperatura
// a aluna muda; o corpo frio está a uma temperatura fixa de referência (ambiente). O calor passa espontaneamente do corpo
// mais quente para o mais frio; com temperaturas iguais (equilíbrio térmico) não há calor transferido.
// Sem animação: as setas só mudam com a temperatura, por isso respeita prefers-reduced-motion.
// Opções: { Tquente (°C) }.
Manual.esquemas.registar('fqa-transferencias', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const NS = 'http://www.w3.org/2000/svg';
    const T_FRIO = 20, T_MIN = 20, T_MAX = 200;
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => Number(v).toLocaleString('pt-PT', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    const r1 = (v) => Math.round(v * 10) / 10;
    const est = { T: Math.round(lim(opcoes.Tquente, T_MIN, T_MAX, 80) / 5) * 5 };

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
    const raiz = criar('div', 'esq-transferencias');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const slider = N.slider(zonaCtl, { rotulo: 'Temperatura do corpo quente / °C (o frio está a ' + T_FRIO + ' °C)', min: T_MIN, max: T_MAX, passo: 5, valor: est.T, aoMudar: (v) => { est.T = v; atualizar(); } });

    const L = 320, ALT = 342;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'transferencias-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const resumo = criar('p', 'esq-resumo');
    resumo.setAttribute('aria-live', 'polite');
    raiz.appendChild(resumo);
    const zonaTexto = criar('div');
    raiz.appendChild(zonaTexto);

    const texto = (x, y, t, ancora, tam, extra) => {
      const e = svgEl('text', Object.assign({ x, y, 'text-anchor': ancora || 'middle', 'font-size': tam || 10, fill: 'var(--texto)' }, extra), svg);
      e.textContent = t;
      return e;
    };
    // seta de (x1, y1) para (x2, y2), com a ponta em (x2, y2)
    function seta(x1, y1, x2, y2, cor, larg) {
      svgEl('line', { class: 'seta', x1, y1, x2, y2, stroke: cor, 'stroke-width': r1(larg) }, svg);
      const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
      const ux = dx / n, uy = dy / n, h = 6 + larg;
      svgEl('path', {
        d: 'M' + x2 + ' ' + y2 + ' L' + r1(x2 - ux * h - uy * h / 2) + ' ' + r1(y2 - uy * h + ux * h / 2)
          + ' L' + r1(x2 - ux * h + uy * h / 2) + ' ' + r1(y2 - uy * h - ux * h / 2) + ' L' + x2 + ' ' + y2,
        fill: cor, stroke: cor, 'stroke-width': 1,
      }, svg);
    }

    function atualizar() {
      const dT = est.T - T_FRIO;
      const equilibrio = dT === 0;
      const forca = 1.5 + (dT / (T_MAX - T_FRIO)) * 3.5; // espessura das setas
      const quente = 'var(--cor-3)';
      const frio = 'var(--cor-1)';
      const calor = 'var(--cor-2)';
      svg.textContent = '';

      // ----- condução (y 0 a 108)
      texto(8, 14, '1. Condução', 'start', 11, { 'font-weight': 700 });
      svgEl('rect', { class: 'corpo-quente', x: 12, y: 36, width: 56, height: 44, fill: quente, 'fill-opacity': equilibrio ? 0.25 : 0.6, stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      svgEl('rect', { class: 'corpo-frio', x: 252, y: 36, width: 56, height: 44, fill: frio, 'fill-opacity': 0.45, stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      svgEl('rect', { class: 'barra', x: 68, y: 50, width: 184, height: 16, fill: 'var(--superficie)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      texto(40, 62, fmt(est.T) + ' °C', 'middle', 10);
      texto(280, 62, fmt(T_FRIO) + ' °C', 'middle', 10);
      if (equilibrio) texto(160, 98, 'Equilíbrio térmico: não há calor', 'middle', 10);
      else {
        seta(84, 30, 236, 30, calor, forca);
        texto(160, 98, 'Q: do corpo quente para o frio', 'middle', 10);
      }

      // ----- convecção (y 112 a 222)
      texto(8, 126, '2. Convecção', 'start', 11, { 'font-weight': 700 });
      svgEl('rect', { x: 100, y: 136, width: 120, height: 62, fill: 'var(--superficie)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      svgEl('path', { d: 'M110 210 L120 204 L130 210 L140 204 L150 210 L160 204 L170 210 L180 204 L190 210 L200 204 L210 210', fill: 'none', stroke: equilibrio ? 'var(--cor-eixos)' : quente, 'stroke-width': 2.5 }, svg);
      texto(160, 224, 'fonte de calor em baixo a ' + fmt(est.T) + ' °C', 'middle', 10);
      if (!equilibrio) {
        seta(160, 192, 160, 144, quente, forca); // sobe o fluido quente, menos denso
        seta(112, 144, 112, 190, frio, forca); // desce o fluido frio, mais denso
        seta(208, 144, 208, 190, frio, forca);
      } else texto(160, 170, 'sem circulação', 'middle', 10);

      // ----- radiação (y 232 a 342)
      texto(8, 246, '3. Radiação', 'start', 11, { 'font-weight': 700 });
      svgEl('circle', { class: 'corpo-quente', cx: 54, cy: 288, r: 24, fill: quente, 'fill-opacity': equilibrio ? 0.25 : 0.6, stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      texto(54, 292, fmt(est.T) + ' °C', 'middle', 10);
      svgEl('circle', { class: 'corpo-frio', cx: 266, cy: 288, r: 24, fill: frio, 'fill-opacity': 0.45, stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      texto(266, 292, fmt(T_FRIO) + ' °C', 'middle', 10);
      if (equilibrio) texto(160, 332, 'Equilíbrio térmico: não há calor', 'middle', 10);
      else {
        [274, 288, 302].forEach((y) => svgEl('path', {
          d: 'M86 ' + y + ' L98 ' + (y - 5) + ' L110 ' + (y + 5) + ' L122 ' + (y - 5) + ' L134 ' + (y + 5) + ' L146 ' + (y - 5) + ' L158 ' + (y + 5) + ' L170 ' + (y - 5) + ' L182 ' + (y + 5) + ' L194 ' + y,
          fill: 'none', stroke: calor, 'stroke-width': 1.5,
        }, svg));
        seta(198, 288, 234, 288, calor, forca);
        texto(160, 332, 'sobretudo radiação infravermelha (IV)', 'middle', 10);
      }
      svg.setAttribute('aria-label', 'Três mecanismos de transferência de energia por calor, do corpo a ' + fmt(est.T) + ' °C para o corpo a ' + fmt(T_FRIO) + ' °C: condução, convecção e radiação.');

      resumo.textContent = equilibrio
        ? 'Os dois corpos estão a ' + fmt(T_FRIO) + ' °C: equilíbrio térmico, não há calor transferido.'
        : 'Corpo quente a ' + fmt(est.T) + ' °C e corpo frio a ' + fmt(T_FRIO) + ' °C: o calor passa do quente para o frio.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Temperaturas', 'corpo quente ' + fmt(est.T) + ' °C; corpo frio ' + fmt(T_FRIO) + ' °C; diferença ' + fmt(dT) + ' °C');
      linha('Condução', 'transferência sem transporte de matéria, de partícula para partícula, num sólido (a barra).');
      linha('Convecção', 'transferência com movimento do próprio fluido: o fluido quente, menos denso, sobe e o frio, mais denso, desce.');
      linha('Radiação', 'transferência por ondas eletromagnéticas, mesmo no vazio; a temperaturas habituais é sobretudo radiação infravermelha.');
      linha('Sentido do calor', equilibrio ? 'não há (equilíbrio térmico)' : 'do corpo quente (' + fmt(est.T) + ' °C) para o corpo frio (' + fmt(T_FRIO) + ' °C)');
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', equilibrio
        ? 'Quando as temperaturas são iguais, o sistema está em equilíbrio térmico e não há calor transferido em termos líquidos.'
        : 'O calor passa espontaneamente do corpo mais quente para o mais frio, e a transferência pára quando as temperaturas se igualam (equilíbrio térmico). Baixa a temperatura até ' + fmt(T_FRIO) + ' °C para o veres.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      slider.definir(Math.min(Math.max(est.T + d * (ev.shiftKey ? 10 : 5), T_MIN), T_MAX));
    };
    svg.addEventListener('keydown', aoTecla);

    atualizar();

    return {
      destruir() {
        svg.removeEventListener('keydown', aoTecla);
        slider.destruir();
        el.textContent = '';
      },
    };
  },
});
