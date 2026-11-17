globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-painel: painel fotovoltaico ligado a uma resistência de carga. A aluna muda a irradiância G e a resistência
// de carga; vê a curva P–U do painel, o ponto de funcionamento, o ponto de potência máxima e o rendimento η = P/(G A).
// Modelo ilustrativo (Manual.dadosFisica.modelos.painel), não um painel concreto. A curva obtém-se de Manual.fisica.painel,
// variando a resistência de carga de muito pequena a muito grande (U vai de 0 a Uoc(G)); o máximo vem de painelPotenciaMaxima.
// Opções: { G (W m⁻²), Rcarga (Ω) }.
Manual.esquemas.registar('fqa-painel', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const mod = Manual.dadosFisica.modelos.painel;
    const GMAX = mod.irradianciaReferencia, GMIN = 100;
    // a resistência de carga vai até 3 vezes a da potência máxima à irradiância mais baixa, para o máximo ser sempre alcançável
    const mxBaixo = F.painelPotenciaMaxima(GMIN);
    const RMAX = Math.ceil((3 * mxBaixo.U) / mxBaixo.I / 5) * 5;
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
    };
    const r1 = (v) => Math.round(v * 10) / 10;
    const est = { G: lim(opcoes.G, GMIN, GMAX, GMAX), R: lim(opcoes.Rcarga, 1, RMAX, 10) };
    const NPONTOS = 80;

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
    const raiz = criar('div', 'esq-painel');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sliders = [];
    const caixa = () => { const z = criar('div'); zonaCtl.appendChild(z); return z; };
    sliders.push(N.slider(caixa(), { rotulo: 'Resistência de carga R / Ω', min: 1, max: RMAX, passo: 1, valor: est.R, aoMudar: (v) => { est.R = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Irradiância G / W m⁻²', min: GMIN, max: GMAX, passo: 50, valor: est.G, aoMudar: (v) => { est.G = v; atualizar(); } }));

    const L = 320, ALT = 214;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'painel-svg' }, raiz);
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
      const e = svgEl('text', Object.assign({ x, y, 'text-anchor': ancora || 'middle', 'font-size': tam || 9, fill: 'var(--texto)' }, extra), svg);
      e.textContent = t;
      return e;
    };

    // escalas fixas (as da irradiância máxima), para a curva se mexer quando G muda
    const UMAX = F.painelUoc(GMAX);
    const PMAX_ESC = F.painelPotenciaMaxima(GMAX).P * 1.1;

    // pontos (U, P) da curva: resistências de carga em escala logarítmica, de muito pequena a muito grande
    function curva(G) {
      const pts = [[0, 0]];
      for (let k = 0; k <= NPONTOS; k++) {
        const R = 0.01 * Math.pow(1e6, k / NPONTOS);
        const p = F.painel({ irradiancia: G, Rcarga: R });
        pts.push([p.U, p.P]);
      }
      pts.push([F.painelUoc(G), 0]);
      return pts;
    }

    function atualizar() {
      const p = F.painel({ irradiancia: est.G, Rcarga: est.R });
      const mx = F.painelPotenciaMaxima(est.G);
      const etaMax = F.rendimento(mx.P, est.G * mod.area);
      const Pluz = est.G * mod.area;
      svg.textContent = '';

      const X0 = 46, X1 = 296, Y0 = 24, Y1 = 150;
      const px = (U) => X0 + (U / UMAX) * (X1 - X0);
      const py = (P) => Y1 - (P / PMAX_ESC) * (Y1 - Y0);
      svgEl('path', { d: 'M' + X0 + ' ' + Y0 + ' V' + Y1 + ' H' + X1, fill: 'none', stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      texto(X0 + 4, 14, 'P / W', 'start');
      texto(X1, Y1 + 24, 'U / V', 'end');
      texto(X0 - 4, Y1 + 3, '0', 'end');
      texto(X0, Y1 + 12, '0', 'middle');
      texto(X1, Y1 + 12, fmt(UMAX, 1), 'middle');
      texto(X0 - 4, Y0 + 3, fmt(PMAX_ESC, 1), 'end');
      const pts = curva(est.G).map(([U, P]) => r1(px(Math.min(U, UMAX))) + ' ' + r1(py(P)));
      svgEl('path', { class: 'curva', d: 'M' + pts.join(' L'), fill: 'none', stroke: 'var(--cor-1)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);
      // ponto de potência máxima e ponto de funcionamento
      const mxx = px(mx.U), mxy = py(mx.P), ox = px(p.U), oy = py(p.P);
      svgEl('line', { x1: r1(mxx), y1: r1(mxy), x2: r1(mxx), y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      svgEl('circle', { class: 'ponto-max', cx: r1(mxx), cy: r1(mxy), r: 5, fill: 'var(--superficie)', stroke: 'var(--cor-3)', 'stroke-width': 2.5 }, svg);
      svgEl('circle', { class: 'ponto', cx: r1(ox), cy: r1(oy), r: 5, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      texto(Math.min(Math.max(mxx, X0 + 40), X1 - 40), Math.max(mxy - 9, Y0 - 2), 'potência máxima', 'middle');
      texto(X0 + 6, Y1 + 38, 'ponto de funcionamento: ' + fmt(p.U, 2) + ' V; ' + fmt(p.P, 2) + ' W', 'start');
      svg.setAttribute('aria-label', 'Curva potência–tensão do painel: ponto de funcionamento a ' + fmt(p.U) + ' V e ' + fmt(p.P) + ' W; potência máxima ' + fmt(mx.P) + ' W a ' + fmt(mx.U) + ' V.');

      const eta = fmt(p.rendimento * 100, 1) + ' %';
      resumo.textContent = 'G = ' + fmt(est.G, 0) + ' W m⁻², R = ' + fmt(est.R, 0) + ' Ω: U = ' + fmt(p.U) + ' V, P = ' + fmt(p.P) + ' W, η = ' + eta + '.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Ponto de funcionamento', 'U = ' + fmt(p.U) + ' V; I = ' + fmt(p.I, 3) + ' A; P = U I = ' + fmt(p.P) + ' W');
      linha('Ponto de potência máxima', 'U = ' + fmt(mx.U) + ' V; I = ' + fmt(mx.I, 3) + ' A; P = ' + fmt(mx.P) + ' W');
      linha('Potência da radiação incidente G A', fmt(Pluz) + ' W (A = ' + fmt(mod.area * 1e4, 0) + ' cm²)');
      linha('Rendimento η = P/(G A)', eta);
      linha('Rendimento no ponto de potência máxima', fmt(etaMax * 100, 1) + ' %');
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Modelo ilustrativo de um pequeno painel de laboratório, não um painel concreto. A potência é máxima para uma só resistência de carga; o rendimento fica sempre abaixo de 100 %, porque só parte da radiação incidente é convertida em energia elétrica.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      sliders[0].definir(Math.min(Math.max(est.R + d * (ev.shiftKey ? 20 : 5), 1), RMAX));
    };
    svg.addEventListener('keydown', aoTecla);

    atualizar();

    return {
      destruir() {
        svg.removeEventListener('keydown', aoTecla);
        sliders.forEach((s) => s.destruir());
        el.textContent = '';
      },
    };
  },
});
