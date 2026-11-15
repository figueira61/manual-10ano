globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-espectro: espectro eletromagnético (escala logarítmica de 10 pm a 1 m). O slider dá log10(λ/m);
// mostra zona, f e E do fotão. Painel de riscas (emissão/absorção) do H (transicaoH), do Na e do He (dados fixos).
// Opções: { lambda } em metros (por omissão 500 nm). As cores do visível são aproximadas.
Manual.esquemas.registar('fqa-espectro', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const D = Manual.dadosQuimicos;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const L_MIN = -11, L_MAX = 0;
    const NOMES = { gama: 'Raios gama', X: 'Raios X', UV: 'Ultravioleta', visivel: 'Visível', IV: 'Infravermelho', 'micro-ondas': 'Micro-ondas', radio: 'Ondas de rádio' };
    const fmtNum = (v, d) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: d });

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
    // cor aproximada (RGB) de um comprimento de onda visível em nm
    function cor(nm) {
      let r = 0, g = 0, b = 0;
      if (nm < 440) { r = (440 - nm) / 40; b = 1; }
      else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
      else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
      else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
      else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
      else r = 1;
      const f = nm < 420 ? 0.3 + 0.7 * (nm - 400) / 20 : nm > 700 ? 0.3 : nm > 645 ? 0.3 + 0.7 * (700 - nm) / 55 : 1;
      const c = (x) => Math.round(255 * Math.pow(x * f, 0.8));
      return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
    }

    const est = {
      log: Number.isFinite(Number(opcoes.lambda)) && opcoes.lambda > 0
        ? Math.min(L_MAX, Math.max(L_MIN, Math.log10(opcoes.lambda))) : Math.log10(500e-9),
      elemento: 'H',
      modo: 'emissao',
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-espectro');
    el.appendChild(raiz);
    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const sl = N.slider(zonaSlider, {
      rotulo: 'log₁₀(λ / m)', min: L_MIN, max: L_MAX, passo: 0.01, valor: Math.round(est.log * 100) / 100,
      aoMudar: (v) => { est.log = v; atualizar(); },
    });

    // ---------- barra do espectro ----------
    const W = 300;
    const X = (l) => ((l - L_MIN) / (L_MAX - L_MIN)) * W;
    const svg = svgEl('svg', { viewBox: '0 0 300 118', width: '100%', role: 'img', class: 'espectro-svg' }, raiz);
    svg.style.maxWidth = '560px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonasCor = { gama: 'var(--cor-4)', X: 'var(--cor-1)', UV: 'var(--cor-4)', visivel: 'var(--cor-3)', IV: 'var(--cor-2)', 'micro-ondas': 'var(--cor-5)', radio: 'var(--cor-1)' };
    D.espectro.forEach((z) => {
      const a = Math.max(L_MIN, z.min > 0 ? Math.log10(z.min) : L_MIN);
      const b = Math.min(L_MAX, Number.isFinite(z.max) ? Math.log10(z.max) : L_MAX);
      if (b <= a) return;
      svgEl('rect', { class: 'zona-' + z.zona, x: X(a), y: 6, width: X(b) - X(a), height: 30, fill: zonasCor[z.zona], 'fill-opacity': 0.28, stroke: 'var(--texto)', 'stroke-width': 0.6 }, svg);
      if (X(b) - X(a) > 28) {
        const t = svgEl('text', { x: (X(a) + X(b)) / 2, y: 25, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)' }, svg);
        t.textContent = z.zona === 'visivel' ? 'Visível' : z.zona === 'micro-ondas' ? 'Micro-ondas' : NOMES[z.zona];
      }
    });
    // marcas de década
    for (let l = -11; l <= 0; l += 1) {
      svgEl('line', { x1: X(l), y1: 36, x2: X(l), y2: 40, stroke: 'var(--cor-eixos)', 'stroke-width': 0.8 }, svg);
    }
    [[-11, '10 pm'], [-9, '1 nm'], [-6, '1 µm'], [-3, '1 mm'], [0, '1 m']].forEach(([l, s]) => {
      const t = svgEl('text', { x: Math.min(Math.max(X(l), 14), 286), y: 50, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--cor-eixos)' }, svg);
      t.textContent = s;
    });
    const marca = svgEl('line', { class: 'marca-lambda', x1: 0, y1: 2, x2: 0, y2: 42, stroke: 'var(--cor-2)', 'stroke-width': 2.5 }, svg);
    // faixa do visível (400–700 nm, escala linear)
    const defs = svgEl('defs', {}, svg);
    const grad = svgEl('linearGradient', { id: 'grad-visivel-' + Math.round(Math.random() * 1e6), x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    for (let nm = 400; nm <= 700; nm += 25) svgEl('stop', { offset: (nm - 400) / 300, 'stop-color': cor(nm) }, grad);
    svgEl('rect', { class: 'faixa-visivel', x: 20, y: 66, width: 260, height: 18, fill: 'url(#' + grad.getAttribute('id') + ')', stroke: 'var(--texto)', 'stroke-width': 0.6 }, svg);
    [400, 500, 600, 700].forEach((nm) => {
      const x = 20 + ((nm - 400) / 300) * 260;
      svgEl('line', { x1: x, y1: 84, x2: x, y2: 88, stroke: 'var(--cor-eixos)', 'stroke-width': 0.8 }, svg);
      const t = svgEl('text', { x, y: 98, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--cor-eixos)' }, svg);
      t.textContent = nm + ' nm';
    });
    const t0 = svgEl('text', { x: 150, y: 62, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--texto)' }, svg);
    t0.textContent = 'Zona do visível (escala linear)';
    const marcaVis = svgEl('line', { class: 'marca-visivel', x1: 0, y1: 62, x2: 0, y2: 90, stroke: 'var(--texto)', 'stroke-width': 2.5 }, svg);

    const zonaValores = criar('div');
    zonaValores.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaValores);

    // ---------- riscas ----------
    raiz.appendChild(criar('p', 'esq-subtitulo', 'Riscas espectrais'));
    const barraRiscas = criar('div', 'esq-controlos');
    const labEl = criar('label', '', 'Elemento: ');
    const sel = criar('select');
    [['H', 'Hidrogénio'], ['Na', D.riscas.Na.nome], ['He', D.riscas.He.nome]].forEach(([s, n]) => {
      const o = criar('option', '', s + ' — ' + n);
      o.value = s;
      sel.appendChild(o);
    });
    labEl.appendChild(sel);
    barraRiscas.appendChild(labEl);
    const bE = criar('button', 'btn', 'Emissão');
    const bA = criar('button', 'btn', 'Absorção');
    bE.type = 'button';
    bA.type = 'button';
    barraRiscas.appendChild(bE);
    barraRiscas.appendChild(bA);
    raiz.appendChild(barraRiscas);
    const svgR = svgEl('svg', { viewBox: '0 0 300 50', width: '100%', role: 'img', class: 'riscas-svg' }, raiz);
    svgR.style.maxWidth = '560px';
    svgR.style.height = 'auto';
    svgR.style.display = 'block';
    svgR.style.margin = '4px auto';
    const zonaRiscas = criar('div');
    zonaRiscas.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaRiscas);

    const aoSel = () => { est.elemento = sel.value; atualizarRiscas(); };
    const aoE = () => { est.modo = 'emissao'; atualizarRiscas(); };
    const aoA = () => { est.modo = 'absorcao'; atualizarRiscas(); };
    sel.addEventListener('change', aoSel);
    bE.addEventListener('click', aoE);
    bA.addEventListener('click', aoA);

    function linhasDe(simbolo) {
      if (simbolo === 'H') {
        return [3, 4, 5, 6].map((ni) => ({ nm: Q.transicaoH(ni, 2).lambda * 1e9, nota: 'n = ' + ni + ' → 2' }))
          .filter((l) => Q.zonaEspectro(l.nm * 1e-9) === 'visivel');
      }
      return D.riscas[simbolo].linhas.map((nm) => ({ nm, nota: '' }));
    }

    function atualizarRiscas() {
      const ls = linhasDe(est.elemento);
      const emissao = est.modo === 'emissao';
      bE.setAttribute('aria-pressed', emissao ? 'true' : 'false');
      bA.setAttribute('aria-pressed', emissao ? 'false' : 'true');
      svgR.textContent = '';
      const defsR = svgEl('defs', {}, svgR);
      const g2 = svgEl('linearGradient', { id: 'grad-riscas-' + Math.round(Math.random() * 1e6), x1: 0, x2: 1, y1: 0, y2: 0 }, defsR);
      for (let nm = 400; nm <= 700; nm += 25) svgEl('stop', { offset: (nm - 400) / 300, 'stop-color': cor(nm) }, g2);
      svgEl('rect', { x: 10, y: 4, width: 280, height: 30, fill: emissao ? '#111' : 'url(#' + g2.getAttribute('id') + ')', stroke: 'var(--texto)', 'stroke-width': 0.6 }, svgR);
      ls.forEach((l) => {
        const x = 10 + ((l.nm - 400) / 300) * 280;
        svgEl('line', { class: 'risca', x1: x, y1: 4, x2: x, y2: 34, stroke: emissao ? cor(l.nm) : '#111', 'stroke-width': 2 }, svgR);
      });
      [400, 500, 600, 700].forEach((nm) => {
        const t = svgEl('text', { x: 10 + ((nm - 400) / 300) * 280, y: 46, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--cor-eixos)' }, svgR);
        t.textContent = nm + ' nm';
      });
      const nome = est.elemento === 'H' ? 'hidrogénio' : D.riscas[est.elemento].nome.toLowerCase();
      svgR.setAttribute('aria-label', 'Espetro de ' + (emissao ? 'emissão' : 'absorção') + ' do ' + nome + ' com ' + ls.length + ' riscas visíveis.');
      zonaRiscas.textContent = '';
      const dl = criar('dl', 'painel-valores');
      ls.forEach((l) => {
        dl.appendChild(criar('dt', '', 'Risca' + (l.nota ? ' (' + l.nota + ')' : '')));
        dl.appendChild(criar('dd', '', 'λ ≈ ' + Number(l.nm).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' nm'));
      });
      zonaRiscas.appendChild(dl);
      zonaRiscas.appendChild(criar('p', '', emissao
        ? 'No espetro de emissão, cada risca colorida corresponde a um fotão emitido numa transição para um nível de menor energia.'
        : 'No espetro de absorção, as riscas escuras estão exatamente nos comprimentos de onda das riscas de emissão do mesmo elemento.'));
      zonaRiscas.appendChild(criar('p', 'fonte', est.elemento === 'H'
        ? 'Riscas do H calculadas pelas transições para n = 2 (série de Balmer) com os valores de constantes dos dados.'
        : 'Fonte: ' + D.fontes.riscas));
    }

    function atualizar() {
      const lambda = Math.pow(10, est.log);
      const r = Q.energiaFotao({ lambda });
      const zona = Q.zonaEspectro(lambda);
      const x = X(est.log);
      marca.setAttribute('x1', x);
      marca.setAttribute('x2', x);
      const nm = lambda * 1e9;
      if (zona === 'visivel') {
        const xv = 20 + ((nm - 400) / 300) * 260;
        marcaVis.setAttribute('x1', xv);
        marcaVis.setAttribute('x2', xv);
        marcaVis.setAttribute('visibility', 'visible');
      } else marcaVis.setAttribute('visibility', 'hidden');
      svg.setAttribute('aria-label', 'Espectro eletromagnético: λ = ' + fmtNum(lambda, 12) + ' m, zona: ' + NOMES[zona] + '.');

      zonaValores.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, f) => { dl.appendChild(criar('dt', '', rot)); const dd = criar('dd'); f(dd); dl.appendChild(dd); };
      const cient = (v) => Manual.formatar.cientifico(v, 3);
      linha('Comprimento de onda', (dd) => latex(dd, '\\lambda = ' + cient(r.lambda) + '\\ \\mathrm{m}'));
      linha('Zona do espectro', (dd) => { dd.textContent = NOMES[zona] + (zona === 'visivel' ? ' (≈ ' + fmtNum(nm, 0) + ' nm)' : ''); });
      linha('Frequência', (dd) => latex(dd, 'f = c / \\lambda = ' + cient(r.f) + '\\ \\mathrm{Hz}'));
      linha('Energia do fotão', (dd) => latex(dd, 'E = h f = ' + cient(r.E) + '\\ \\mathrm{J}'));
      zonaValores.appendChild(dl);
      zonaValores.appendChild(criar('p', '', 'Quanto menor o comprimento de onda, maior a frequência e maior a energia do fotão. A escala é logarítmica: cada divisão é 10 vezes maior que a anterior. As fronteiras entre zonas são aproximadas e as cores do visível são aproximações.'));
    }

    atualizar();
    atualizarRiscas();

    return {
      destruir() {
        sl.destruir();
        sel.removeEventListener('change', aoSel);
        bE.removeEventListener('click', aoE);
        bA.removeEventListener('click', aoA);
        el.textContent = '';
      },
    };
  },
});
