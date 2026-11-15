globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-energia-distancia: energia potencial de dois átomos em função da distância internuclear
// (H–H, Cl–Cl, H–Cl). Curva de Morse com De = energia de ligação e re = comprimento de ligação de
// Manual.dadosQuimicos.ligacoes; a forma é ilustrativa (a = 1,8 / re). A aluna arrasta o ponto ou usa o slider/setas
// e vê se predomina a atração ou a repulsão; o mínimo (re, −De) está marcado e escrito.
// Opções: { ligacao: 'H-H' | 'Cl-Cl' | 'H-Cl' (omissão 'H-H'), r (pm) }.
Manual.esquemas.registar('fqa-energia-distancia', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const LIGACOES = ['H-H', 'Cl-Cl', 'H-Cl'];
    const NOMES = { 'H-H': 'H–H (H₂)', 'Cl-Cl': 'Cl–Cl (Cl₂)', 'H-Cl': 'H–Cl (HCl)' };
    const est = { lig: LIGACOES.includes(opcoes.ligacao) ? opcoes.ligacao : 'H-H', r: null };

    const L = 320, ALT = 230, X0 = 52, X1 = 308, Y0 = 14, Y1 = 188;
    const f1 = (v) => Math.round(v * 10) / 10;
    const fmt = (v, d) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 0 : d });
    const sinal = (v) => (v < 0 ? '−' : '') + fmt(Math.abs(v));

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
    const dadosLig = () => Q.potencialMorse(est.lig, 100);
    const limites = () => {
      const { re, De } = dadosLig();
      return { rmin: Math.ceil(0.5 * re), rmax: Math.floor(3 * re), vmin: -1.2 * De, vmax: 1.2 * De };
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-energia-distancia');
    el.appendChild(raiz);

    const zonaSel = criar('div', 'esq-controlos');
    raiz.appendChild(zonaSel);
    const lab = criar('label', '', 'Ligação ');
    const sel = criar('select');
    sel.setAttribute('aria-label', 'Ligação');
    LIGACOES.forEach((l) => {
      const o = criar('option', '', NOMES[l]);
      o.value = l;
      if (l === est.lig) o.selected = true;
      sel.appendChild(o);
    });
    lab.appendChild(sel);
    zonaSel.appendChild(lab);

    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    let slider = null;

    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'img', tabindex: '0', class: 'energia-distancia-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    svg.style.touchAction = 'pan-y';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    const px = (r) => { const b = limites(); return X0 + ((r - b.rmin) / (b.rmax - b.rmin)) * (X1 - X0); };
    const py = (v) => { const b = limites(); return Y1 - ((v - b.vmin) / (b.vmax - b.vmin)) * (Y1 - Y0); };

    function estado(r, m) {
      const dist = Math.abs(r - m.re);
      if (dist < 0.5) return { chave: 'eq', texto: 'Equilíbrio: a atração e a repulsão compensam-se; a energia é mínima. Esta distância é o comprimento de ligação.' };
      if (r < m.re) return { chave: 'rep', texto: 'Predomina a repulsão: os núcleos aproximam-se demasiado e repelem-se; a energia sobe quando a distância diminui.' };
      if (m.V > -0.1 * m.De) return { chave: 'longe', texto: 'Átomos praticamente independentes: a atração já é pequena (energia perto de zero).' };
      return { chave: 'atr', texto: 'Predomina a atração: cada núcleo atrai os eletrões do outro átomo; os átomos tendem a aproximar-se.' };
    }

    function atualizar() {
      const b = limites();
      const m = Q.potencialMorse(est.lig, est.r);
      const m0 = dadosLig();
      svg.textContent = '';
      // eixos e zero
      svgEl('line', { x1: X0, y1: Y0, x2: X0, y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      svgEl('line', { x1: X0, y1: Y1, x2: X1, y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      const y0 = py(0);
      svgEl('line', { class: 'zero', x1: X0, y1: f1(y0), x2: X1, y2: f1(y0), stroke: 'var(--cor-eixos)', 'stroke-dasharray': '4 3' }, svg);
      const tz = svgEl('text', { x: X1, y: f1(y0 - 4), 'text-anchor': 'end', 'font-size': 10, fill: 'var(--texto)' }, svg);
      tz.textContent = 'átomos separados: E = 0';
      const tx = svgEl('text', { x: (X0 + X1) / 2, y: ALT - 6, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--texto)' }, svg);
      tx.textContent = 'distância internuclear r / pm';
      const ty = svgEl('text', { x: 12, y: (Y0 + Y1) / 2, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--texto)', transform: 'rotate(-90 12 ' + (Y0 + Y1) / 2 + ')' }, svg);
      ty.textContent = 'energia potencial / kJ mol⁻¹';
      // curva
      const pts = [];
      for (let i = 0; i <= 120; i++) {
        const r = b.rmin + ((b.rmax - b.rmin) * i) / 120;
        const v = Math.min(Q.potencialMorse(est.lig, r).V, b.vmax);
        pts.push((i ? 'L' : 'M') + f1(px(r)) + ' ' + f1(py(v)));
      }
      svgEl('path', { class: 'curva', d: pts.join(' '), fill: 'none', stroke: 'var(--cor-1)', 'stroke-width': 2.5 }, svg);
      // mínimo (re, −De)
      svgEl('line', { x1: f1(px(m0.re)), y1: f1(py(-m0.De)), x2: f1(px(m0.re)), y2: Y1, stroke: 'var(--cor-3)', 'stroke-dasharray': '3 3' }, svg);
      svgEl('circle', { class: 'minimo', cx: f1(px(m0.re)), cy: f1(py(-m0.De)), r: 4.5, fill: 'var(--cor-3)', stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
      const tm = svgEl('text', { x: f1(px(m0.re) + 8), y: f1(py(-m0.De) + 14), 'font-size': 10, fill: 'var(--texto)' }, svg);
      tm.textContent = 'mínimo: ' + fmt(m0.re) + ' pm; −' + fmt(m0.De) + ' kJ/mol';
      // ponto arrastável
      const dentro = Math.min(m.V, b.vmax);
      svgEl('circle', { class: 'ponto', cx: f1(px(est.r)), cy: f1(py(dentro)), r: 6.5, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      svg.setAttribute('aria-label', 'Energia potencial da ligação ' + NOMES[est.lig] + ' em função da distância internuclear; mínimo de ' + sinal(-m0.De) + ' kJ/mol a ' + fmt(m0.re) + ' pm. Distância escolhida: ' + fmt(est.r) + ' pm.');

      const e = estado(est.r, m);
      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Distância r', fmt(est.r) + ' pm');
      linha('Energia potencial', sinal(m.V) + ' kJ/mol');
      linha('Mínimo da curva', fmt(m0.re) + ' pm e ' + sinal(-m0.De) + ' kJ/mol');
      linha('Comprimento de ligação', fmt(m0.re) + ' pm');
      linha('Energia de ligação', fmt(m0.De) + ' kJ/mol');
      zonaTexto.appendChild(dl);
      const aviso = criar('p', 'esq-aviso ed-estado', e.texto);
      aviso.setAttribute('data-estado', e.chave);
      zonaTexto.appendChild(aviso);
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Curva de Morse com a = ' + fmt(m0.a, 4) + ' pm⁻¹ (a = ' + fmt(Q.MORSE_K, 1) + ' / rₑ): a forma é ilustrativa; a profundidade e a posição do mínimo vêm da tabela de energias e comprimentos de ligação. Energia de ligação = energia a fornecer para separar os átomos (o zero é com os átomos afastados).'));
    }

    function novoSlider() {
      if (slider) slider.destruir();
      const b = limites();
      if (est.r === null || !Number.isFinite(est.r)) est.r = dadosLig().re;
      est.r = Math.min(Math.max(Math.round(est.r), b.rmin), b.rmax);
      slider = N.slider(zonaSlider, { rotulo: 'Distância r / pm', min: b.rmin, max: b.rmax, passo: 1, valor: est.r, aoMudar: (v) => { est.r = Math.round(v); atualizar(); } });
    }

    const aoEscolher = () => {
      est.lig = sel.value;
      est.r = dadosLig().re;
      novoSlider();
      atualizar();
    };
    sel.addEventListener('change', aoEscolher);

    // arrastar o ponto (ou clicar na curva) e setas do teclado
    let arrasto = false;
    const rDoRato = (ev) => {
      const caixa = svg.getBoundingClientRect();
      const k = caixa.width > 0 ? L / caixa.width : 1;
      const x = (ev.clientX - caixa.left) * k;
      const b = limites();
      return b.rmin + ((x - X0) / (X1 - X0)) * (b.rmax - b.rmin);
    };
    const definirR = (r) => { if (slider) slider.definir(Math.round(r)); };
    const aoPremir = (ev) => {
      arrasto = true;
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sem captura */ }
      svg.focus({ preventScroll: true });
      definirR(rDoRato(ev));
    };
    const aoMover = (ev) => { if (arrasto) definirR(rDoRato(ev)); };
    const aoSoltar = (ev) => {
      arrasto = false;
      try { if (svg.hasPointerCapture(ev.pointerId)) svg.releasePointerCapture(ev.pointerId); } catch (e) { /* ok */ }
    };
    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      definirR(est.r + d * (ev.shiftKey ? 1 : 5));
    };
    svg.addEventListener('pointerdown', aoPremir);
    svg.addEventListener('pointermove', aoMover);
    svg.addEventListener('pointerup', aoSoltar);
    svg.addEventListener('pointercancel', aoSoltar);
    svg.addEventListener('keydown', aoTecla);

    est.r = Number.isFinite(Number(opcoes.r)) && opcoes.r !== undefined ? Number(opcoes.r) : null;
    novoSlider();
    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoEscolher);
        svg.removeEventListener('pointerdown', aoPremir);
        svg.removeEventListener('pointermove', aoMover);
        svg.removeEventListener('pointerup', aoSoltar);
        svg.removeEventListener('pointercancel', aoSoltar);
        svg.removeEventListener('keydown', aoTecla);
        if (slider) slider.destruir();
        el.textContent = '';
      },
    };
  },
});
