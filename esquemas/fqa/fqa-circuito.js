globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-circuito: fonte ideal de tensão U com 2 ou 3 resistências, todas em série ou todas em paralelo.
// A aluna escolhe a ligação, o número de resistências, os valores de R e a tensão U; vê R_eq, a corrente total e,
// para cada resistência, I, U e P, com um amperímetro (corrente total) e um voltímetro (R₁ ou o ramo) desenhados.
// Tudo vem de Manual.fisica.circuito. Opções: { ligacao: 'serie' | 'paralelo', n: 2 | 3, rs: [Ω], U (V) }.
Manual.esquemas.registar('fqa-circuito', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
    };
    const rsIni = Array.isArray(opcoes.rs) ? opcoes.rs : [];
    const est = {
      ligacao: opcoes.ligacao === 'serie' ? 'serie' : 'paralelo',
      n: opcoes.n === 3 ? 3 : 2,
      rs: [lim(rsIni[0], 1, 20, 6), lim(rsIni[1], 1, 20, 3), lim(rsIni[2], 1, 20, 6)].map(Math.round),
      U: lim(opcoes.U, 1, 12, 6),
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
    const raiz = criar('div', 'esq-circuito');
    el.appendChild(raiz);
    const zLig = criar('div', 'esq-controlos');
    zLig.setAttribute('role', 'group');
    zLig.setAttribute('aria-label', 'Ligação das resistências');
    raiz.appendChild(zLig);
    const zNum = criar('div', 'esq-controlos');
    zNum.setAttribute('role', 'group');
    zNum.setAttribute('aria-label', 'Número de resistências');
    raiz.appendChild(zNum);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);

    const botoes = [];
    const botao = (zona, rotulo, pressionado, aoClicar) => {
      const b = criar('button', 'btn', rotulo);
      b.type = 'button';
      b.addEventListener('click', aoClicar);
      zona.appendChild(b);
      botoes.push({ b, aoClicar, pressionado });
    };
    botao(zLig, 'Em série', () => est.ligacao === 'serie', () => { est.ligacao = 'serie'; atualizar(); });
    botao(zLig, 'Em paralelo', () => est.ligacao === 'paralelo', () => { est.ligacao = 'paralelo'; atualizar(); });
    botao(zNum, '2 resistências', () => est.n === 2, () => { est.n = 2; refazerSliders(); atualizar(); });
    botao(zNum, '3 resistências', () => est.n === 3, () => { est.n = 3; refazerSliders(); atualizar(); });

    let sliders = [];
    function refazerSliders() {
      sliders.forEach((s) => s.destruir());
      sliders = [];
      zonaCtl.textContent = '';
      const caixa = () => { const z = criar('div'); zonaCtl.appendChild(z); return z; };
      sliders.push(N.slider(caixa(), { rotulo: 'Tensão da fonte U / V', min: 1, max: 12, passo: 0.5, valor: est.U, aoMudar: (v) => { est.U = v; atualizar(); } }));
      for (let i = 0; i < est.n; i++) {
        sliders.push(N.slider(caixa(), { rotulo: 'R' + (i + 1) + ' / Ω', min: 1, max: 20, passo: 1, valor: est.rs[i], aoMudar: (v) => { est.rs[i] = v; atualizar(); } }));
      }
    }

    const L = 320, ALT = 190;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'circuito-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const resumo = criar('p', 'esq-resumo');
    resumo.setAttribute('aria-live', 'polite');
    raiz.appendChild(resumo);
    const zonaTexto = criar('div');
    raiz.appendChild(zonaTexto);

    const TR = { fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const traco = (d) => svgEl('path', Object.assign({ d }, TR), svg);
    const texto = (x, y, t, ancora, tam, extra) => {
      const e = svgEl('text', Object.assign({ x, y, 'text-anchor': ancora || 'middle', 'font-size': tam || 9, fill: 'var(--texto)' }, extra), svg);
      e.textContent = t;
      return e;
    };
    function medidor(cx, cy, letra) {
      svgEl('circle', Object.assign({ cx, cy, r: 11, fill: 'var(--superficie)' }, TR), svg);
      texto(cx, cy + 4, letra, 'middle', 12, { 'font-weight': 700 });
    }
    // fonte: fio vertical interrompido por duas placas (a maior é o terminal positivo), rótulo à esquerda
    function fonte(x, y0, y1) {
      const ym = (y0 + y1) / 2;
      traco('M' + x + ' ' + y0 + ' V' + (ym - 6));
      traco('M' + x + ' ' + (ym + 6) + ' V' + y1);
      svgEl('line', { x1: x - 11, y1: ym - 6, x2: x + 11, y2: ym - 6, stroke: 'var(--texto)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      svgEl('line', { x1: x - 6, y1: ym + 6, x2: x + 6, y2: ym + 6, stroke: 'var(--texto)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      texto(x - 14, ym + 3, fmt(est.U, 1) + ' V', 'end', 9);
    }

    function atualizar() {
      botoes.forEach((r) => r.b.setAttribute('aria-pressed', r.pressionado() ? 'true' : 'false'));
      const rs = est.rs.slice(0, est.n);
      const c = F.circuito({ U: est.U, rs, ligacao: est.ligacao });
      const serie = est.ligacao === 'serie';
      svg.textContent = '';

      if (serie) {
        const cs = est.n === 2 ? [110, 220] : [100, 170, 240];
        const YT = 44, YB = 134, XL = 56, XR = 296;
        fonte(XL, YT, YB);
        traco('M' + XL + ' ' + YT + ' H' + XR + ' V' + YB + ' H' + XL);
        cs.forEach((cx, i) => {
          svgEl('rect', Object.assign({ x: cx - 18, y: YT - 8, width: 36, height: 16, fill: 'var(--superficie)' }, TR), svg);
          texto(cx, YT - 16, 'R' + (i + 1) + ' = ' + fmt(rs[i], 0) + ' Ω', 'middle', 9);
        });
        // amperímetro: em série a corrente é a mesma em todo o circuito
        medidor(XR - 100, YB, 'A');
        texto(XR - 100, YB + 26, 'I = ' + fmt(c.I) + ' A', 'middle', 9);
        // voltímetro em paralelo com R1
        const c1 = cs[0];
        traco('M' + (c1 - 18) + ' ' + YT + ' V92 H' + (c1 - 11));
        traco('M' + (c1 + 11) + ' 92 H' + (c1 + 18) + ' V' + YT);
        medidor(c1, 92, 'V');
        texto(c1, 114, 'U₁ = ' + fmt(c.porComponente[0].U, 1) + ' V', 'middle', 9);
      } else {
        const cs = est.n === 2 ? [120, 190] : [110, 160, 210];
        const YT = 38, YB = 150, XL = 56, XR = 296, XV = 270;
        fonte(XL, YT, YB);
        traco('M' + XL + ' ' + YT + ' H' + XR + ' V' + YB + ' H' + XL);
        cs.forEach((cx, i) => {
          traco('M' + cx + ' ' + YT + ' V' + YB);
          svgEl('rect', Object.assign({ x: cx - 8, y: 80, width: 16, height: 38, fill: 'var(--superficie)' }, TR), svg);
          texto(cx, YB + 16, 'R' + (i + 1) + ' = ' + fmt(rs[i], 0) + ' Ω', 'middle', 9);
        });
        // amperímetro no fio principal, junto à fonte: corrente total
        medidor(88, YT, 'A');
        texto(88, YT - 17, 'I = ' + fmt(c.I) + ' A', 'middle', 9);
        // voltímetro num ramo em paralelo com as resistências
        traco('M' + XV + ' ' + YT + ' V82');
        traco('M' + XV + ' 104 V' + YB);
        medidor(XV, 93, 'V');
        texto(XV, 126, 'U = ' + fmt(est.U, 1) + ' V', 'middle', 9);
      }
      svg.setAttribute('aria-label', (serie ? 'Circuito em série' : 'Circuito em paralelo') + ' com ' + est.n + ' resistências. Amperímetro: I = ' + fmt(c.I) + ' A. Voltímetro: '
        + (serie ? 'U₁ = ' + fmt(c.porComponente[0].U) + ' V, em R₁' : 'U = ' + fmt(est.U) + ' V, nas resistências') + '.');

      const ramos = c.porComponente.map((k, i) => (serie ? 'U' : 'I') + (i + 1) + ' = ' + fmt(serie ? k.U : k.I) + (serie ? ' V' : ' A')).join(', ');
      resumo.textContent = (serie ? 'Em série' : 'Em paralelo') + ' a ' + fmt(est.U, 1) + ' V: Req = ' + fmt(c.Req) + ' Ω, I = ' + fmt(c.I) + ' A; ' + ramos + '.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Resistência equivalente Req', fmt(c.Req) + ' Ω');
      linha('Corrente total I (amperímetro)', fmt(c.I) + ' A');
      c.porComponente.forEach((k, i) => linha('Resistência R' + (i + 1) + ' = ' + fmt(k.R, 0) + ' Ω', 'I = ' + fmt(k.I) + ' A; U = ' + fmt(k.U) + ' V; P = ' + fmt(k.P) + ' W'));
      linha('Potência fornecida pela fonte', fmt(est.U * c.I) + ' W (igual à soma das potências dissipadas por efeito Joule)');
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', serie
        ? 'Em série a corrente é a mesma em todas as resistências, Req é a soma das resistências e a tensão da fonte divide-se por elas. O voltímetro está ligado a R₁.'
        : 'Em paralelo todas as resistências ficam sujeitas à tensão da fonte, a corrente total divide-se pelos ramos e o inverso de Req é a soma dos inversos. O amperímetro mede a corrente total.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      const v = Math.min(Math.max(est.U + d * (ev.shiftKey ? 1 : 0.5), 1), 12);
      if (sliders[0]) sliders[0].definir(v);
    };
    svg.addEventListener('keydown', aoTecla);

    refazerSliders();
    atualizar();

    return {
      destruir() {
        botoes.forEach((r) => r.b.removeEventListener('click', r.aoClicar));
        svg.removeEventListener('keydown', aoTecla);
        sliders.forEach((s) => s.destruir());
        el.textContent = '';
      },
    };
  },
});
