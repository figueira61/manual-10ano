globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-gerador: gerador (ε, r) ligado a uma resistência exterior Rext variável. Mostra a reta característica
// U = ε − r I, o ponto de funcionamento, I, U, as potências (útil UI, dissipada no gerador rI², total εI) e o rendimento U/ε.
// Com Rext = 0 há curto-circuito: I = ε/r, U = 0, rendimento 0. Tudo vem de Manual.fisica.gerador;
// os valores por defeito de ε e r vêm de Manual.dadosFisica.modelos.pilha.
// Opções: { epsilon (V), r (Ω), Rext (Ω) }.
Manual.esquemas.registar('fqa-gerador', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const pilha = Manual.dadosFisica.modelos.pilha;
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
    };
    const f1 = (v) => Math.round(v * 10) / 10;
    const est = {
      epsilon: lim(opcoes.epsilon, 1, 12, pilha.epsilon),
      r: lim(opcoes.r, 0.5, 5, pilha.r),
      Rext: lim(opcoes.Rext, 0, 20, 3),
    };

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
    const raiz = criar('div', 'esq-gerador');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sliders = [];
    const caixa = () => { const z = criar('div'); zonaCtl.appendChild(z); return z; };
    sliders.push(N.slider(caixa(), { rotulo: 'Resistência exterior Rext / Ω (0 = curto-circuito)', min: 0, max: 20, passo: 0.5, valor: est.Rext, aoMudar: (v) => { est.Rext = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Força eletromotriz ε / V', min: 1, max: 12, passo: 0.5, valor: est.epsilon, aoMudar: (v) => { est.epsilon = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Resistência interna r / Ω', min: 0.5, max: 5, passo: 0.5, valor: est.r, aoMudar: (v) => { est.r = v; atualizar(); } }));

    const L = 320, ALT = 226;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'gerador-svg' }, raiz);
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
      const g = F.gerador({ epsilon: est.epsilon, r: est.r, Rext: est.Rext });
      const curto = est.Rext === 0;
      const Icc = est.epsilon / est.r;
      svg.textContent = '';

      // gráfico U(I): eixos de (0, 0) a (ε/r, ε)
      const X0 = 46, X1 = 296, Y0 = 22, Y1 = 142;
      const px = (I) => X0 + (I / Icc) * (X1 - X0);
      const py = (U) => Y1 - (U / est.epsilon) * (Y1 - Y0);
      svgEl('path', { d: 'M' + X0 + ' ' + Y0 + ' V' + Y1 + ' H' + X1, fill: 'none', stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      texto(X0 + 4, 12, 'U / V', 'start', 9);
      texto(X1, Y1 + 24, 'I / A', 'end', 9);
      texto(X0 - 4, Y0 + 3, fmt(est.epsilon, 1), 'end', 9);
      texto(X0 - 4, Y1 + 3, '0', 'end', 9);
      texto(X1, Y1 + 12, fmt(Icc, 1), 'middle', 9);
      svgEl('line', { class: 'reta', x1: f1(px(0)), y1: f1(py(est.epsilon)), x2: f1(px(Icc)), y2: f1(py(0)), stroke: 'var(--cor-1)', 'stroke-width': 2.5 }, svg);
      texto(X0 + 6, Y0 + 14, 'U = ε − r I', 'start', 9);
      const ox = px(g.I), oy = py(g.U);
      svgEl('line', { x1: f1(ox), y1: f1(oy), x2: f1(ox), y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      svgEl('line', { x1: X0, y1: f1(oy), x2: f1(ox), y2: f1(oy), stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      svgEl('circle', { class: 'ponto', cx: f1(ox), cy: f1(oy), r: 5, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
      const rotulo = '(' + fmt(g.I, 1) + ' A; ' + fmt(g.U, 1) + ' V)';
      const direita = ox < (X0 + X1) / 2;
      texto(direita ? ox + 9 : ox - 9, Math.max(oy - 8, Y0 + 28), rotulo, direita ? 'start' : 'end', 9);

      // barras de potência (escala: potência total máxima, em curto-circuito, ε²/r)
      const BX = 74, BW = 150, PMAX = (est.epsilon * est.epsilon) / est.r;
      const barras = [
        ['P total', g.Ptotal, 'var(--cor-3)'],
        ['P útil', g.Putil, 'var(--cor-2)'],
        ['P dissipada', g.Pdissipada, 'var(--cor-eixos)'],
      ];
      barras.forEach(([nome, v, cor], i) => {
        const y = 170 + i * 18;
        texto(8, y + 9, nome, 'start', 9);
        svgEl('rect', { class: 'barra', x: BX, y, width: f1(Math.max(0, Math.min(v / PMAX, 1)) * BW), height: 11, fill: cor, stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
        texto(BX + BW + 6, y + 9, fmt(v) + ' W', 'start', 9);
      });
      svg.setAttribute('aria-label', 'Reta característica do gerador e ponto de funcionamento: I = ' + fmt(g.I) + ' A, U = ' + fmt(g.U) + ' V. Potência útil ' + fmt(g.Putil)
        + ' W, dissipada no gerador ' + fmt(g.Pdissipada) + ' W, total ' + fmt(g.Ptotal) + ' W.');

      const eta = fmt(g.rendimento * 100, 1) + ' %';
      resumo.textContent = (curto ? 'Curto-circuito (Rext = 0): ' : 'Rext = ' + fmt(est.Rext, 1) + ' Ω: ') + 'I = ' + fmt(g.I) + ' A, U = ' + fmt(g.U) + ' V, rendimento = ' + eta + '.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Gerador', 'ε = ' + fmt(est.epsilon, 1) + ' V; r = ' + fmt(est.r, 1) + ' Ω; Rext = ' + fmt(est.Rext, 1) + ' Ω');
      linha('Corrente I', fmt(g.I) + ' A' + (curto ? ' (I = ε/r, a corrente máxima)' : ''));
      linha('Tensão nos terminais U', fmt(g.U) + ' V' + (curto ? ' (U = 0: toda a tensão fica no gerador)' : ''));
      linha('Potência útil UI', fmt(g.Putil) + ' W');
      linha('Potência dissipada no gerador rI²', fmt(g.Pdissipada) + ' W');
      linha('Potência total εI', fmt(g.Ptotal) + ' W');
      linha('Rendimento η = U/ε', eta);
      zonaTexto.appendChild(dl);
      if (curto) {
        const aviso = criar('p', 'esq-aviso', 'Curto-circuito: com Rext = 0 a corrente é I = ε/r = ' + fmt(g.I) + ' A, U = 0, a potência útil é nula e o rendimento é 0; toda a energia é dissipada no gerador.');
        aviso.setAttribute('data-estado', 'curto-circuito');
        zonaTexto.appendChild(aviso);
      }
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'A potência útil é máxima quando Rext = r (aqui r = ' + fmt(est.r, 1) + ' Ω), mas então o rendimento é só 50 %. Valores iniciais de ε e r: pilha de ' + fmt(pilha.epsilon, 1) + ' V e ' + fmt(pilha.r, 1) + ' Ω.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      const v = Math.min(Math.max(est.Rext + d * (ev.shiftKey ? 1 : 0.5), 0), 20);
      sliders[0].definir(v);
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
