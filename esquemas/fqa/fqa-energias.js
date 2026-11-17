globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-energias: um carrinho (massa fixa, 0,5 kg) num percurso de planos e troços horizontais, com ou sem
// força de atrito constante. A aluna escolhe o percurso, a altura inicial, a velocidade inicial e a força de atrito,
// e percorre o trajeto com o slider (ou as setas do teclado); vê barras de Ec, Epg, Em e da energia dissipada.
// Tudo vem de Manual.fisica.comAtrito (g de Manual.dadosFisica). Se o carrinho para, diz onde; numa subida diz
// que para momentaneamente (o regresso por um plano abaixo não está modelado).
// Opções: { percurso: 'rampa' | 'rampa-plano' | 'montanha-russa', h0 (m), v0 (m/s), Fa (N), s (m) }.
Manual.esquemas.registar('fqa-energias', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const NS = 'http://www.w3.org/2000/svg';
    const M = 0.5; // kg, massa do carrinho (fixa e dita no esquema)
    const PERCURSOS = {
      'rampa': { nome: 'Rampa', troços: [{ tipo: 'plano', comprimento: 5, desnivel: -2 }] },
      'rampa-plano': { nome: 'Rampa + plano', troços: [{ tipo: 'plano', comprimento: 4, desnivel: -2 }, { tipo: 'horizontal', comprimento: 6 }] },
      'montanha-russa': { nome: 'Montanha-russa', troços: [{ tipo: 'plano', comprimento: 4, desnivel: -2 }, { tipo: 'plano', comprimento: 3, desnivel: 1.5 }, { tipo: 'plano', comprimento: 3, desnivel: -1.5 }, { tipo: 'plano', comprimento: 4, desnivel: 2 }] },
    };
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
    };
    const f1 = (v) => Math.round(v * 10) / 10;

    const queda = (id) => { let h = 0, m = 0; PERCURSOS[id].troços.forEach((t) => { h += t.desnivel || 0; m = Math.min(m, h); }); return -m; };
    const comprimento = (id) => PERCURSOS[id].troços.reduce((a, t) => a + t.comprimento, 0);
    const est = { id: PERCURSOS[opcoes.percurso] ? opcoes.percurso : 'rampa', h0: 0, v0: 0, Fa: 0, s: 0 };
    est.v0 = lim(opcoes.v0, 0, 6, 0);
    est.Fa = lim(opcoes.Fa, 0, 3, 0);
    est.h0 = lim(opcoes.h0, queda(est.id), queda(est.id) + 3, queda(est.id) + 1);
    est.s = lim(opcoes.s, 0, comprimento(est.id), 0);

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
    const raiz = criar('div', 'esq-energias');
    el.appendChild(raiz);
    const zonaBotoes = criar('div', 'esq-controlos');
    zonaBotoes.setAttribute('role', 'group');
    zonaBotoes.setAttribute('aria-label', 'Percurso');
    raiz.appendChild(zonaBotoes);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);

    const botoes = {};
    const aoBotao = {};
    Object.keys(PERCURSOS).forEach((id) => {
      const b = criar('button', 'btn', PERCURSOS[id].nome);
      b.type = 'button';
      aoBotao[id] = () => { est.id = id; est.s = 0; refazerSliders(); atualizar(); };
      b.addEventListener('click', aoBotao[id]);
      botoes[id] = b;
      zonaBotoes.appendChild(b);
    });

    let sH = null, sV = null, sF = null, sS = null;
    const zH = criar('div'), zV = criar('div'), zF = criar('div'), zS = criar('div');
    [zH, zV, zF, zS].forEach((z) => zonaCtl.appendChild(z));
    function refazerSliders() {
      [sH, sV, sF, sS].forEach((s) => { if (s) s.destruir(); });
      const q = queda(est.id);
      est.h0 = Math.min(Math.max(est.h0, q), q + 3);
      sH = N.slider(zH, { rotulo: 'Altura inicial h₀ / m', min: q, max: q + 3, passo: 0.1, valor: est.h0, aoMudar: (v) => { est.h0 = v; atualizar(); } });
      sV = N.slider(zV, { rotulo: 'Velocidade inicial v₀ / m s⁻¹', min: 0, max: 6, passo: 0.5, valor: est.v0, aoMudar: (v) => { est.v0 = v; atualizar(); } });
      sF = N.slider(zF, { rotulo: 'Força de atrito Fₐ / N (0 = sem atrito)', min: 0, max: 3, passo: 0.1, valor: est.Fa, aoMudar: (v) => { est.Fa = v; atualizar(); } });
      sS = N.slider(zS, { rotulo: 'Posição s no percurso / m', min: 0, max: comprimento(est.id), passo: 0.1, valor: est.s, aoMudar: (v) => { est.s = v; atualizar(); } });
    }

    const L = 320, ALT = 250;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'energias-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const resumo = criar('p', 'esq-resumo');
    resumo.setAttribute('aria-live', 'polite');
    raiz.appendChild(resumo);
    const zonaTexto = criar('div');
    raiz.appendChild(zonaTexto);

    // estado do carrinho à distância s: interpola linearmente os pontos de comAtrito (Ec, Epg e dissipada são lineares em cada troço)
    function estadoEm(pontos, s) {
      const ult = pontos[pontos.length - 1];
      const sc = Math.min(s, ult.s);
      for (let i = 1; i < pontos.length; i++) {
        if (sc <= pontos[i].s + 1e-12) {
          const a = pontos[i - 1], b = pontos[i];
          const t = b.s > a.s ? (sc - a.s) / (b.s - a.s) : 0;
          const l = (k) => a[k] + (b[k] - a[k]) * t;
          return { s: sc, h: l('h'), ec: Math.max(0, l('ec')), epg: l('epg'), dissipada: l('dissipada') };
        }
      }
      return { s: ult.s, h: ult.h, ec: ult.ec, epg: ult.epg, dissipada: ult.dissipada };
    }

    function atualizar() {
      Object.keys(botoes).forEach((id) => { botoes[id].setAttribute('aria-pressed', id === est.id ? 'true' : 'false'); });
      const troços = PERCURSOS[est.id].troços;
      const pontos = F.comAtrito({ m: M, h0: est.h0, v0: est.v0, Fa: est.Fa, percurso: troços });
      const ult = pontos[pontos.length - 1];
      const Em0 = F.em(M, est.v0, est.h0);
      const p = estadoEm(pontos, est.s);
      const parou = ult.parou;

      // geometria do percurso
      const X0 = 14, X1 = 306, Y1 = 130, Y0 = 14;
      const hs = [est.h0];
      let hh = est.h0;
      troços.forEach((t) => { hh += t.desnivel || 0; hs.push(hh); });
      const hmax = Math.max(...hs, 1);
      const ey = (Y1 - Y0 - 8) / hmax;
      // o plano tem projeção horizontal sqrt(L² − dh²)
      const proj = troços.map((t) => Math.sqrt(t.comprimento ** 2 - (t.desnivel || 0) ** 2));
      const xtot = proj.reduce((a, b) => a + b, 0);
      const kx = (X1 - X0) / xtot;
      const xs = [0];
      proj.forEach((q) => xs.push(xs[xs.length - 1] + q));
      const px = (x) => X0 + x * kx;
      const py = (h) => Y1 - h * ey;

      svg.textContent = '';
      svgEl('line', { x1: X0, y1: Y1, x2: X1, y2: Y1, stroke: 'var(--cor-eixos)', 'stroke-dasharray': '3 3' }, svg);
      const tn = svgEl('text', { x: X1, y: Y1 + 11, 'text-anchor': 'end', 'font-size': 9, fill: 'var(--texto)' }, svg);
      tn.textContent = 'h = 0';
      const d = hs.map((h, i) => (i ? 'L' : 'M') + f1(px(xs[i])) + ' ' + f1(py(h))).join(' ');
      svgEl('path', { class: 'percurso', d, fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2.5 }, svg);
      // posição do carrinho
      let acum = 0, cx = X0, cy = py(est.h0);
      for (let i = 0; i < troços.length; i++) {
        if (p.s <= acum + troços[i].comprimento + 1e-12) {
          const t = (p.s - acum) / troços[i].comprimento;
          cx = px(xs[i] + proj[i] * t);
          cy = py(hs[i] + (hs[i + 1] - hs[i]) * t);
          break;
        }
        acum += troços[i].comprimento;
        cx = px(xs[i + 1]);
        cy = py(hs[i + 1]);
      }
      svgEl('circle', { class: 'carrinho', cx: f1(cx), cy: f1(cy - 5), r: 5.5, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);

      // barras
      const BY = 150, BH = 70, BX = 40, BW = 36, GAP = 20;
      const escala = BH / Math.max(Em0, 1e-9);
      const barras = [
        ['Ec', p.ec, 'var(--cor-1)'],
        ['Epg', p.epg, 'var(--cor-3)'],
        ['Em', p.ec + p.epg, 'var(--cor-2)'],
        ['Dissipada', p.dissipada, 'var(--cor-eixos)'],
      ];
      svgEl('line', { x1: BX - 10, y1: BY + BH, x2: L - 10, y2: BY + BH, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      barras.forEach(([nome, v, cor], i) => {
        const x = BX + i * (BW + GAP);
        const h = Math.max(0, Math.min(v * escala, BH));
        svgEl('rect', { class: 'barra', x, y: f1(BY + BH - h), width: BW, height: f1(h), fill: cor, stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
        const t1 = svgEl('text', { x: x + BW / 2, y: BY + BH + 13, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
        t1.textContent = nome;
        const t2 = svgEl('text', { x: x + BW / 2, y: f1(BY + BH - h - 4), 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--texto)' }, svg);
        t2.textContent = fmt(v, 1) + ' J';
      });
      svg.setAttribute('aria-label', PERCURSOS[est.id].nome + '. Posição s = ' + fmt(p.s, 1) + ' m. Ec = ' + fmt(p.ec) + ' J, Epg = ' + fmt(p.epg) + ' J, Em = ' + fmt(p.ec + p.epg) + ' J, energia dissipada = ' + fmt(p.dissipada) + ' J.');

      resumo.textContent = 's = ' + fmt(p.s, 1) + ' m: Ec = ' + fmt(p.ec) + ' J, Epg = ' + fmt(p.epg) + ' J, Em = ' + fmt(p.ec + p.epg) + ' J, dissipada = ' + fmt(p.dissipada) + ' J' + (parou ? '; o carrinho para em s = ' + fmt(ult.s) + ' m' : '') + '.';
      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Posição s', fmt(p.s, 1) + ' m (altura h = ' + fmt(p.h) + ' m)');
      linha('Energia cinética Ec', fmt(p.ec) + ' J');
      linha('Energia potencial gravítica Epg', fmt(p.epg) + ' J');
      linha('Energia mecânica Em = Ec + Epg', fmt(p.ec + p.epg) + ' J');
      linha('Energia dissipada', fmt(p.dissipada) + ' J');
      linha('Energia inicial', fmt(Em0) + ' J (Ec + Epg + dissipada é sempre igual a este valor)');
      zonaTexto.appendChild(dl);
      if (parou) {
        // troço onde o carrinho para: o que contém ult.s (num vértice, o seguinte)
        let a = 0, subida = false;
        for (let i = 0; i < troços.length; i++) {
          if (ult.s < a + troços[i].comprimento - 1e-9) { subida = (troços[i].desnivel || 0) > 0; break; }
          a += troços[i].comprimento;
        }
        let msg = 'O carrinho para em s = ' + fmt(ult.s) + ' m' + (subida ? ' (momentaneamente, no ponto mais alto que atinge).' : '.');
        if (subida) msg += ' Se a força de atrito for menor do que a componente do peso ao longo do plano, voltaria a descer; esse regresso não está modelado.';
        const aviso = criar('p', 'esq-aviso', msg);
        aviso.setAttribute('data-estado', 'parou');
        zonaTexto.appendChild(aviso);
      } else if (est.Fa > 0) {
        zonaTexto.appendChild(criar('p', 'esq-legenda', 'A força de atrito é não conservativa: a energia mecânica diminui e a energia dissipada aumenta, W(FNC) = ΔEm.'));
      } else {
        zonaTexto.appendChild(criar('p', 'esq-legenda', 'Sem atrito só atua o peso (força conservativa): a energia mecânica conserva-se e Ec + Epg é constante.'));
      }
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Massa do carrinho: ' + fmt(M, 1) + ' kg; g = ' + fmt(Manual.dadosFisica.constantes.g, 0) + ' m s⁻²; alturas medidas a partir do nível mais baixo do percurso.'));
    }

    const aoTecla = (ev) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[ev.key];
      if (!d) return;
      ev.preventDefault();
      const v = Math.min(Math.max(Math.round((est.s + d * (ev.shiftKey ? 1 : 0.1)) * 10) / 10, 0), comprimento(est.id));
      if (sS) sS.definir(v);
    };
    svg.addEventListener('keydown', aoTecla);

    refazerSliders();
    atualizar();

    return {
      destruir() {
        Object.keys(botoes).forEach((id) => botoes[id].removeEventListener('click', aoBotao[id]));
        svg.removeEventListener('keydown', aoTecla);
        [sH, sV, sF, sS].forEach((s) => { if (s) s.destruir(); });
        el.textContent = '';
      },
    };
  },
});
