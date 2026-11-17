globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-aquecimento: aquece-se uma massa de gelo, a partir de uma temperatura inicial entre −20 °C e 0 °C, com uma
// potência constante P, até a água ferver a 100 °C. Mostra a curva temperatura–tempo, com os patamares de fusão (0 °C)
// e de ebulição (100 °C), e a energia e o tempo de cada troço. Tudo vem de Manual.fisica.aquecimentoGelo (sem perdas).
// Opções: { m (kg), theta0 (°C), P (W) }.
Manual.esquemas.registar('fqa-aquecimento', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    };
    const r1 = (v) => Math.round(v * 10) / 10;
    const est = {
      m: lim(opcoes.m, 0.1, 1, 0.5),
      theta0: lim(opcoes.theta0, -20, 0, -20),
      P: lim(opcoes.P, 100, 1000, 500),
    };
    const NOMES = { gelo: 'Aquecimento do gelo', fusao: 'Fusão', agua: 'Aquecimento da água', ebulicao: 'Ebulição' };
    const tempo = (t) => (t >= 600 ? fmt(t) + ' s (≈ ' + fmt(t / 60, 1) + ' min)' : fmt(t, t < 10 ? 1 : 0) + ' s');

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
    const raiz = criar('div', 'esq-aquecimento');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sliders = [];
    const caixa = () => { const z = criar('div'); zonaCtl.appendChild(z); return z; };
    sliders.push(N.slider(caixa(), { rotulo: 'Massa de gelo m / kg', min: 0.1, max: 1, passo: 0.1, valor: est.m, aoMudar: (v) => { est.m = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Temperatura inicial θ₀ / °C', min: -20, max: 0, passo: 5, valor: est.theta0, aoMudar: (v) => { est.theta0 = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Potência P / W', min: 100, max: 1000, passo: 50, valor: est.P, aoMudar: (v) => { est.P = v; atualizar(); } }));

    const L = 320, ALT = 220;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'aquecimento-svg' }, raiz);
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

    function atualizar() {
      const tr = F.aquecimentoGelo({ m: est.m, theta0: est.theta0, thetaF: 100, P: est.P, vaporizar: true });
      const total = tr[tr.length - 1].t1;
      const Qtotal = tr.reduce((a, s) => a + s.Q, 0);
      svg.textContent = '';

      // eixos: tempo (0 a total) e temperatura (−25 a 110 °C)
      const X0 = 44, X1 = 300, Y0 = 20, Y1 = 170, TMIN = -25, TMAX = 110;
      const px = (t) => X0 + (t / total) * (X1 - X0);
      const py = (T) => Y1 - ((T - TMIN) / (TMAX - TMIN)) * (Y1 - Y0);
      svgEl('path', { d: 'M' + X0 + ' ' + Y0 + ' V' + Y1 + ' H' + X1, fill: 'none', stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      texto(X0 + 4, 12, 'θ / °C', 'start');
      texto(X1, Y1 + 24, 't / s', 'end');
      texto(X0, Y1 + 12, '0', 'middle');
      texto(X1, Y1 + 12, fmt(total), 'middle');
      [0, 100].forEach((T) => {
        texto(X0 - 4, py(T) + 3, fmt(T), 'end');
        svgEl('line', { class: 'guia', x1: X0, y1: r1(py(T)), x2: X1, y2: r1(py(T)), stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      });
      if (est.theta0 < 0) texto(X0 - 4, py(est.theta0) + 3, fmt(est.theta0), 'end');
      // curva (segmentos retos, um por troço)
      tr.forEach((s) => {
        svgEl('line', { class: 'troco troco-' + s.fase, x1: r1(px(s.t0)), y1: r1(py(s.theta0)), x2: r1(px(s.t1)), y2: r1(py(s.theta1)), stroke: (s.fase === 'fusao' || s.fase === 'ebulicao') ? 'var(--cor-2)' : 'var(--cor-1)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, svg);
      });
      const fus = tr.find((s) => s.fase === 'fusao'), ebu = tr.find((s) => s.fase === 'ebulicao');
      texto((px(fus.t0) + px(fus.t1)) / 2, py(0) + 13, 'fusão', 'middle');
      texto((px(ebu.t0) + px(ebu.t1)) / 2, py(100) - 6, 'ebulição', 'middle');
      svg.setAttribute('aria-label', 'Curva temperatura–tempo: gelo a ' + fmt(est.theta0) + ' °C aquece até 0 °C, funde a 0 °C, a água aquece até 100 °C e ferve a 100 °C. Tempo total ' + tempo(total) + '.');

      resumo.textContent = 'm = ' + fmt(est.m, 1) + ' kg, θ₀ = ' + fmt(est.theta0) + ' °C, P = ' + fmt(est.P) + ' W: Q total = ' + fmt(Qtotal / 1000, 1) + ' kJ em ' + tempo(total) + '.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      tr.forEach((s) => {
        const T = s.theta0 === s.theta1 ? ' a ' + fmt(s.theta0) + ' °C' : ' de ' + fmt(s.theta0) + ' a ' + fmt(s.theta1) + ' °C';
        linha(NOMES[s.fase] + T, 'Q = ' + fmt(s.Q / 1000, 1) + ' kJ; Δt = ' + tempo(s.t1 - s.t0));
      });
      linha('Total', 'Q = ' + fmt(Qtotal / 1000, 1) + ' kJ; t = ' + tempo(total));
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Nos patamares (fusão a 0 °C e ebulição a 100 °C) a energia fornecida muda o estado físico e a temperatura não varia. Modelo sem perdas: toda a energia fornecida, E = P Δt, é recebida pela água, por isso Δt = Q/P.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      sliders[2].definir(Math.min(Math.max(est.P + d * (ev.shiftKey ? 100 : 50), 100), 1000));
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
