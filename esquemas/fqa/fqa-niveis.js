globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-niveis: diagrama de níveis de energia do átomo de H (n = 1 a 6, à escala de E_n = E_1 / n²).
// A aluna escolhe o nível inicial e o final; vê emissão/absorção, ΔE, λ, a série (só Lyman, Balmer e Paschen)
// e se a risca é visível. Opções: { ni, nf } (por omissão 3 → 2).
Manual.esquemas.registar('fqa-niveis', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const NOMES = { gama: 'raios gama', X: 'raios X', UV: 'ultravioleta', visivel: 'visível', IV: 'infravermelho', 'micro-ondas': 'micro-ondas', radio: 'ondas de rádio' };
    const nivel = (v, o) => { const x = Math.round(Number(v)); return Number.isInteger(x) && x >= 1 && x <= 6 ? x : o; };
    const est = { ni: nivel(opcoes.ni, 3), nf: nivel(opcoes.nf, 2) };

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
    const cient = (v) => Manual.formatar.cientifico(v, 3);
    const fmtNm = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 1 });

    el.textContent = '';
    const raiz = criar('div', 'esq-niveis');
    el.appendChild(raiz);
    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    const sI = N.slider(zonaSliders, { rotulo: 'Nível inicial n', min: 1, max: 6, passo: 1, valor: est.ni, aoMudar: (v) => { est.ni = Math.round(v); atualizar(); } });
    const sF = N.slider(zonaSliders, { rotulo: 'Nível final n', min: 1, max: 6, passo: 1, valor: est.nf, aoMudar: (v) => { est.nf = Math.round(v); atualizar(); } });

    const H = 230, TOPO = 24, FUNDO = 214;
    const E1 = Math.abs(Q.energiaNivelH(1));
    // n = 1 em baixo (FUNDO), E = 0 em cima (TOPO)
    const y = (n) => TOPO + (Math.abs(Q.energiaNivelH(n)) / E1) * (FUNDO - TOPO);
    const svg = svgEl('svg', { viewBox: '0 0 300 ' + H, width: '100%', role: 'img', class: 'niveis-svg' }, raiz);
    svg.style.maxWidth = '420px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    function atualizar() {
      svg.textContent = '';
      svgEl('line', { x1: 60, y1: TOPO, x2: 290, y2: TOPO, stroke: 'var(--cor-eixos)', 'stroke-dasharray': '4 3' }, svg);
      const t0 = svgEl('text', { x: 4, y: TOPO + 4, 'font-size': 11, fill: 'var(--texto)' }, svg);
      t0.textContent = 'E = 0';
      for (let n = 1; n <= 6; n++) {
        const cl = (n === est.ni || n === est.nf) ? 'var(--texto)' : 'var(--cor-eixos)';
        svgEl('line', { class: 'nivel', x1: 60, y1: y(n), x2: 290, y2: y(n), stroke: cl, 'stroke-width': n === est.ni || n === est.nf ? 2.5 : 1.5 }, svg);
        const t = svgEl('text', { x: 40, y: y(n) + (n <= 3 ? 4 : (n - 5) * 9 + 4), 'text-anchor': 'end', 'font-size': 11, fill: 'var(--texto)' }, svg);
        t.textContent = 'n = ' + n;
      }
      const dif = est.ni !== est.nf;
      let r = null;
      if (dif) {
        r = Q.transicaoH(est.ni, est.nf);
        const emissao = r.tipo === 'emissao';
        const cor = emissao ? 'var(--cor-2)' : 'var(--cor-1)';
        const x = 175, y1 = y(est.ni), y2 = y(est.nf);
        const sentido = y2 > y1 ? 1 : -1;
        svgEl('line', { class: 'seta', x1: x, y1, x2: x, y2: y2 - sentido * 8, stroke: cor, 'stroke-width': 3 }, svg);
        svgEl('polygon', { points: x + ',' + y2 + ' ' + (x - 6) + ',' + (y2 - sentido * 11) + ' ' + (x + 6) + ',' + (y2 - sentido * 11), fill: cor }, svg);
      }
      svg.setAttribute('aria-label', 'Níveis de energia do hidrogénio de n = 1 a 6' + (dif ? '; seta de n = ' + est.ni + ' para n = ' + est.nf + '.' : '.'));

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, f) => { dl.appendChild(criar('dt', '', rot)); const dd = criar('dd'); f(dd); dl.appendChild(dd); };
      linha('Energia dos níveis', (dd) => latex(dd, 'E_{' + est.ni + '} = ' + cient(Q.energiaNivelH(est.ni)) + '\\ \\mathrm{J};\\ E_{' + est.nf + '} = ' + cient(Q.energiaNivelH(est.nf)) + '\\ \\mathrm{J}'));
      if (!dif) {
        zonaTexto.appendChild(dl);
        zonaTexto.appendChild(criar('p', 'esq-aviso', 'Escolhe dois níveis diferentes para haver uma transição.'));
        return;
      }
      const emissao = r.tipo === 'emissao';
      const zona = Q.zonaEspectro(r.lambda);
      linha('Transição', (dd) => { dd.textContent = 'n = ' + est.ni + ' → n = ' + est.nf + ': ' + (emissao ? 'emissão (o eletrão desce e o átomo emite um fotão)' : 'absorção (o átomo absorve um fotão e o eletrão sobe)'); });
      linha('Variação de energia', (dd) => latex(dd, '\\Delta E = E_{' + est.nf + '} - E_{' + est.ni + '} = ' + cient(r.deltaE) + '\\ \\mathrm{J}'));
      linha('Comprimento de onda', (dd) => latex(dd, '\\lambda = h c / |\\Delta E| = ' + cient(r.lambda) + '\\ \\mathrm{m}\\ (\\approx ' + fmtNm(r.lambda * 1e9) + '\\ \\mathrm{nm})'));
      linha('Série', (dd) => { dd.textContent = r.serie ? r.serie + ' (nível ' + Math.min(est.ni, est.nf) + ')' : 'outra série'; });
      linha('Zona do espectro', (dd) => { dd.textContent = zona === 'visivel' ? 'visível (a risca vê-se)' : 'fora do visível (' + NOMES[zona] + ')'; });
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', '', 'Só as transições entre níveis com diferença de energia bem determinada (valores quantizados) dão riscas; o átomo de H só emite ou absorve fotões com estas energias.'));
    }

    atualizar();

    return {
      destruir() {
        sI.destruir();
        sF.destruir();
        el.textContent = '';
      },
    };
  },
});
