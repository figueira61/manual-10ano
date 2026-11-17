globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-ressalto: uma bola cai de uma altura h₀ e, em cada colisão com o chão, conserva uma fração da energia
// mecânica. A aluna escolhe h₀ e essa fração; vê as alturas dos 5 primeiros ressaltos, a energia dissipada em cada
// colisão e um desenho dos máximos da trajetória. Massa fixa de 0,10 kg (dita no esquema). Usa Manual.fisica.
// Opções: { h0 (m, omissão 1), fracao (0,1 a 0,95, omissão 0,8) }.
Manual.esquemas.registar('fqa-ressalto', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const M = 0.1; // kg
    const NR = 5;
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
    };
    const f1 = (v) => Math.round(v * 10) / 10;
    const est = { h0: lim(opcoes.h0, 0.5, 5, 1), fracao: lim(opcoes.fracao, 0.1, 0.95, 0.8) };

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
    const raiz = criar('div', 'esq-ressalto');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sH = N.slider(zonaCtl, { rotulo: 'Altura de queda h₀ / m', min: 0.5, max: 5, passo: 0.1, valor: est.h0, aoMudar: (v) => { est.h0 = v; atualizar(); } });
    const sK = N.slider(zonaCtl, { rotulo: 'Fração da energia conservada em cada ressalto', min: 0.1, max: 0.95, passo: 0.05, valor: est.fracao, aoMudar: (v) => { est.fracao = v; atualizar(); } });

    const L = 320, ALT = 150;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'img', class: 'ressalto-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    function atualizar() {
      const alturas = F.ressalto(est.h0, est.fracao, NR);
      const todas = [est.h0].concat(alturas);
      const E = todas.map((h) => F.epg(M, h)); // energia mecânica no ponto mais alto de cada trajetória
      const diss = alturas.map((h, i) => E[i] - E[i + 1]);
      const Y1 = 130, Y0 = 14, X0 = 14, X1 = 306;
      const ey = (Y1 - Y0) / est.h0;
      // largura de cada arco proporcional ao tempo de voo (√h)
      const larg = todas.map((h, i) => (i === 0 ? Math.sqrt(h) : 2 * Math.sqrt(h)));
      const tot = larg.reduce((a, b) => a + b, 0);
      const kx = (X1 - X0) / tot;
      svg.textContent = '';
      svgEl('line', { x1: X0, y1: Y1, x2: X1, y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-width': 2 }, svg);
      svgEl('line', { x1: X0, y1: f1(Y1 - est.h0 * ey), x2: X1, y2: f1(Y1 - est.h0 * ey), stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      let x = X0;
      let d = '';
      todas.forEach((h, i) => {
        const w = larg[i] * kx;
        const topo = Y1 - h * ey;
        if (i === 0) d += 'M' + f1(x) + ' ' + f1(topo) + ' Q' + f1(x + w * 0.5) + ' ' + f1(topo) + ' ' + f1(x + w) + ' ' + Y1;
        else d += ' Q' + f1(x + w / 2) + ' ' + f1(Y1 - 2 * h * ey) + ' ' + f1(x + w) + ' ' + Y1;
        const cx = i === 0 ? x : x + w / 2;
        svgEl('circle', { class: 'pico', cx: f1(cx), cy: f1(topo), r: 3.5, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
        const t = svgEl('text', { x: f1(cx + (i === 0 ? 6 : 0)), y: f1(topo - 6), 'text-anchor': i === 0 ? 'start' : 'middle', 'font-size': 9, fill: 'var(--texto)' }, svg);
        t.textContent = (i === 0 ? 'h₀ = ' : 'h' + i + ' = ') + fmt(h);
        x += w;
      });
      svgEl('path', { class: 'trajetoria', d, fill: 'none', stroke: 'var(--cor-1)', 'stroke-width': 2 }, svg);
      svg.setAttribute('aria-label', 'Bola largada de ' + fmt(est.h0) + ' m; alturas dos ' + NR + ' primeiros ressaltos: ' + alturas.map((h) => fmt(h) + ' m').join(', ') + '.');

      zonaTexto.textContent = '';
      const tab = criar('table', 'tabela-ressalto');
      const cab = criar('tr');
      ['Ressalto', 'Altura / m', 'Energia dissipada na colisão / J'].forEach((c) => cab.appendChild(criar('th', '', c)));
      const th = criar('thead');
      th.appendChild(cab);
      tab.appendChild(th);
      const tb = criar('tbody');
      alturas.forEach((h, i) => {
        const tr = criar('tr');
        tr.appendChild(criar('td', '', String(i + 1)));
        tr.appendChild(criar('td', '', fmt(h)));
        tr.appendChild(criar('td', '', fmt(diss[i], 3)));
        tb.appendChild(tr);
      });
      tab.appendChild(tb);
      zonaTexto.appendChild(tab);
      const total = E[0] - E[NR];
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Energia mecânica inicial: ' + fmt(E[0], 3) + ' J. Depois dos ' + NR + ' ressaltos já se dissiparam ' + fmt(total, 3) + ' J. Em cada colisão fica ' + fmt(est.fracao * 100, 0) + ' % da energia, por isso cada altura é ' + fmt(est.fracao) + ' vezes a anterior. Massa da bola: ' + fmt(M) + ' kg; g = ' + fmt(Manual.dadosFisica.constantes.g, 0) + ' m s⁻².'));
    }
    atualizar();

    return {
      destruir() {
        sH.destruir();
        sK.destruir();
        el.textContent = '';
      },
    };
  },
});
