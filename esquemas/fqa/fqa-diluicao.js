globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-diluicao: diluição de uma solução (ci·Vi = cf·Vf). A aluna escolhe a concentração inicial, o volume
// a pipetar (Vi) e o volume do balão volumétrico (Vf); vê o balão cheio até à marca, a concentração final (cf) e o
// fator de diluição. Os pontos representam as partículas de soluto: o número é o mesmo antes e depois; só se
// espalham por um volume maior. A cor mais ou menos intensa acompanha a concentração.
// Opções: { ci (mol/dm³, omissão 1), Vi (mL, omissão 10), Vf (mL, omissão 100) }.
let contadorDiluicao = 0; // identificador único do clipPath por instância
Manual.esquemas.registar('fqa-diluicao', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const idClip = 'dil-clip-' + (++contadorDiluicao);
    const BALOES = [25, 50, 100, 200, 250, 500, 1000]; // mL, balões volumétricos usuais
    const CI_MIN = 0.1, CI_MAX = 2;
    const fmt = (v, d) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 4 : d });
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) ? Math.min(Math.max(x, a), b) : o; };

    const Vf0 = Number(opcoes.Vf) > 0 ? Number(opcoes.Vf) : 100;
    const baloes = BALOES.includes(Vf0) ? BALOES.slice() : BALOES.concat([Vf0]).sort((a, b) => a - b);
    const est = { ci: lim(opcoes.ci, CI_MIN, CI_MAX, 1), Vf: Vf0, Vi: 0 };
    est.Vi = Math.min(Math.max(Math.round(lim(opcoes.Vi, 1, est.Vf, 10)), 1), Math.round(est.Vf));

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
    function latex(pai, s) {
      if (Manual.render && Manual.render.texto) Manual.render.texto(pai, '$' + s + '$');
      else pai.appendChild(document.createTextNode(s));
    }
    const tex = (v) => fmt(v).replace(',', '{,}');

    el.textContent = '';
    const raiz = criar('div', 'esq-diluicao');
    el.appendChild(raiz);
    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);

    const sCi = N.slider(zonaCtl, { rotulo: 'Concentração inicial ci / mol dm⁻³', min: CI_MIN, max: CI_MAX, passo: 0.05, valor: est.ci, aoMudar: (v) => { est.ci = v; atualizar(); } });
    let sVi = null;
    const zonaVi = criar('div');
    zonaCtl.appendChild(zonaVi);
    function novoSliderVi() {
      if (sVi) sVi.destruir();
      est.Vi = Math.min(Math.max(est.Vi, 1), Math.floor(est.Vf));
      sVi = N.slider(zonaVi, { rotulo: 'Volume pipetado Vi / mL', min: 1, max: Math.floor(est.Vf), passo: 1, valor: est.Vi, aoMudar: (v) => { est.Vi = Math.round(v); atualizar(); } });
    }
    novoSliderVi();

    const zonaSel = criar('div', 'esq-controlos');
    zonaCtl.appendChild(zonaSel);
    const lab = criar('label', '', 'Balão volumétrico (Vf) ');
    const sel = criar('select');
    sel.setAttribute('aria-label', 'Volume do balão volumétrico em mililitros');
    baloes.forEach((v) => {
      const o = criar('option', '', fmt(v, 0) + ' mL');
      o.value = String(v);
      if (v === est.Vf) o.selected = true;
      sel.appendChild(o);
    });
    lab.appendChild(sel);
    zonaSel.appendChild(lab);
    const aoEscolher = () => { est.Vf = Number(sel.value); novoSliderVi(); atualizar(); };
    sel.addEventListener('change', aoEscolher);

    const L = 320, ALT = 220;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'img', class: 'diluicao-svg' }, raiz);
    svg.style.maxWidth = '420px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    // N pontos (partículas de soluto) por uma grelha deterministica dentro de um retângulo
    const NPONTOS = 16;
    function pontos(pai, x, y, w, h, cor) {
      const colunas = Math.ceil(Math.sqrt(NPONTOS * w / Math.max(h, 1)));
      const linhas = Math.ceil(NPONTOS / colunas);
      for (let k = 0; k < NPONTOS; k++) {
        const c = k % colunas, l = Math.floor(k / colunas);
        const jx = ((k * 7) % 5 - 2) * (w / colunas) * 0.08, jy = ((k * 3) % 5 - 2) * (h / linhas) * 0.08;
        svgEl('circle', { class: 'soluto', cx: Math.round((x + (c + 0.5) * (w / colunas) + jx) * 10) / 10, cy: Math.round((y + h - (l + 0.5) * (h / linhas) + jy) * 10) / 10, r: 2.6, fill: cor }, pai);
      }
    }

    function atualizar() {
      const d = Q.diluicao({ ci: est.ci, Vi: est.Vi, Vf: est.Vf });
      const intensidade = d.cf / d.ci; // 1 → solução inicial
      svg.textContent = '';

      // vaso da solução pipetada (esquerda): altura proporcional a Vi/Vf na mesma escala do balão
      const HB = 120, YB = 60; // altura útil do balão (até à marca) e topo
      const hVi = Math.max(6, HB * (est.Vi / est.Vf));
      svgEl('rect', { x: 28, y: YB + HB - hVi - 0, width: 52, height: hVi, rx: 2, fill: 'var(--cor-1)', 'fill-opacity': 0.55, stroke: 'none' }, svg);
      svgEl('path', { d: 'M28 ' + (YB + HB - 100) + 'V' + (YB + HB) + 'H80V' + (YB + HB - 100), fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2 }, svg);
      pontos(svg, 28, YB + HB - hVi, 52, hVi, 'var(--texto)');
      const t1 = svgEl('text', { x: 54, y: YB + HB + 16, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t1.textContent = 'Vi = ' + fmt(est.Vi, 0) + ' mL';
      const t1b = svgEl('text', { x: 54, y: YB + HB + 29, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t1b.textContent = 'ci = ' + fmt(est.ci) + ' mol/dm³';

      // seta
      svgEl('path', { d: 'M96 ' + (YB + 70) + 'H134', stroke: 'var(--texto)', 'stroke-width': 2, fill: 'none' }, svg);
      svgEl('polygon', { points: '142,' + (YB + 70) + ' 133,' + (YB + 65) + ' 133,' + (YB + 75), fill: 'var(--texto)' }, svg);
      const ta = svgEl('text', { x: 119, y: YB + 56, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      ta.textContent = '+ água';

      // balão volumétrico (direita): corpo e gargalo; líquido até à marca
      const cx = 235;
      const corpo = 'M' + (cx - 14) + ' ' + (YB - 30) + 'V' + YB + 'C' + (cx - 14) + ' ' + (YB + 12) + ' ' + (cx - 52) + ' ' + (YB + 28) + ' ' + (cx - 52) + ' ' + (YB + 82) + 'C' + (cx - 52) + ' ' + (YB + 130) + ' ' + (cx - 30) + ' ' + (YB + 140) + ' ' + cx + ' ' + (YB + 140) + 'C' + (cx + 30) + ' ' + (YB + 140) + ' ' + (cx + 52) + ' ' + (YB + 130) + ' ' + (cx + 52) + ' ' + (YB + 82) + 'C' + (cx + 52) + ' ' + (YB + 28) + ' ' + (cx + 14) + ' ' + (YB + 12) + ' ' + (cx + 14) + ' ' + YB + 'V' + (YB - 30);
      const nivel = YB + 12; // marca de aferição, no gargalo
      svgEl('clipPath', { id: idClip }, svg);
      const clip = svg.childNodes[svg.childNodes.length - 1];
      svgEl('path', { d: corpo + 'Z' }, clip);
      svgEl('rect', { class: 'liquido', x: cx - 60, y: nivel, width: 120, height: 140, fill: 'var(--cor-1)', 'fill-opacity': Math.round((0.12 + 0.55 * intensidade) * 100) / 100, 'clip-path': 'url(#' + idClip + ')' }, svg);
      pontos(svg, cx - 44, YB + 30, 88, 106, 'var(--texto)');
      svgEl('path', { d: corpo, fill: 'none', stroke: 'var(--texto)', 'stroke-width': 2 }, svg);
      svgEl('line', { x1: cx - 18, y1: nivel, x2: cx + 18, y2: nivel, stroke: 'var(--cor-2)', 'stroke-width': 2.5 }, svg);
      const tm = svgEl('text', { x: cx + 22, y: nivel + 4, 'font-size': 10, fill: 'var(--texto)' }, svg);
      tm.textContent = 'marca';
      const t2 = svgEl('text', { x: cx, y: YB + 160, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t2.textContent = 'Vf = ' + fmt(est.Vf, 0) + ' mL';
      const t2b = svgEl('text', { x: cx, y: YB + 173, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
      t2b.textContent = 'cf = ' + fmt(d.cf) + ' mol/dm³';

      svg.setAttribute('aria-label', 'Diluição: pipetam-se ' + fmt(est.Vi, 0) + ' mL de solução de concentração ' + fmt(est.ci) + ' mol/dm³ para um balão volumétrico de ' + fmt(est.Vf, 0) + ' mL e completa-se com água até à marca; a concentração final é ' + fmt(d.cf) + ' mol/dm³ e o fator de diluição é ' + fmt(d.fator) + '. O número de partículas de soluto não muda.');

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, f) => { dl.appendChild(criar('dt', '', rot)); const dd = criar('dd'); f(dd); dl.appendChild(dd); };
      linha('Concentração final', (dd) => { dd.textContent = fmt(d.cf) + ' mol/dm³'; });
      linha('Fator de diluição', (dd) => { dd.textContent = fmt(d.fator); });
      linha('Cálculo', (dd) => latex(dd, '\\mathrm{c_f} = \\dfrac{\\mathrm{c_i} \\times V_i}{V_f} = \\dfrac{' + tex(est.ci) + ' \\times ' + tex(est.Vi) + '}{' + tex(est.Vf) + '} = ' + tex(d.cf) + '\\ \\mathrm{mol\\,dm^{-3}}'));
      linha('Fator (verificação)', (dd) => latex(dd, 'F = \\dfrac{\\mathrm{c_i}}{\\mathrm{c_f}} = \\dfrac{V_f}{V_i} = \\dfrac{' + tex(est.Vf) + '}{' + tex(est.Vi) + '} = ' + tex(d.fator)));
      linha('Soluto (não muda)', (dd) => { dd.textContent = 'n = ci × Vi = ' + fmt(est.ci * est.Vi / 1000, 5) + ' mol, antes e depois'; });
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Os pontos são partículas de soluto: o número é o mesmo, mas ficam espalhadas por um volume maior, por isso a cor (concentração) fica mais clara.'));
    }

    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoEscolher);
        sCi.destruir();
        if (sVi) sVi.destruir();
        el.textContent = '';
      },
    };
  },
});
