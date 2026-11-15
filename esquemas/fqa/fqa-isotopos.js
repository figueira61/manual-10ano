globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-isotopos: ajusta as abundâncias dos isótopos de um elemento e vê a massa atómica relativa
// média (média ponderada escrita). A última abundância é o que falta para 100 %.
// Opções: { elemento: 'Cl' }.
Manual.esquemas.registar('fqa-isotopos', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const D = Manual.dadosQuimicos;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const fmt = (v, d) => Number(v).toLocaleString('pt-PT', { minimumFractionDigits: d, maximumFractionDigits: d });
    const elementos = Object.keys(D.isotopos);

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function latex(pai, t) {
      if (Manual.render && Manual.render.texto) Manual.render.texto(pai, '$' + t + '$');
      else pai.appendChild(document.createTextNode(t));
    }
    const nuclideo = (a) => '{}^{' + a + '}\\mathrm{' + simbolo + '}';
    const sup = (a) => String(a).replace(/\d/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]);
    function svgEl(nome, atributos, pai) {
      const e = document.createElementNS(NS, nome);
      for (const k in atributos) e.setAttribute(k, atributos[k]);
      if (pai) pai.appendChild(e);
      return e;
    }

    let simbolo = elementos.includes(opcoes.elemento) ? opcoes.elemento : 'Cl';
    let abund = [];
    let sliders = [];
    const fixos = [];
    const dinamicos = [];
    function ouvir(alvo, tipo, fn, lista) { alvo.addEventListener(tipo, fn); (lista || dinamicos).push([alvo, tipo, fn]); }
    function soltar(lista) { lista.splice(0).forEach((r) => r[0].removeEventListener(r[1], r[2])); }

    el.textContent = '';
    const raiz = criar('div', 'esq-isotopos');
    el.appendChild(raiz);

    const linhaEl = criar('div', 'esq-controlos');
    const lab = criar('label', '', 'Elemento: ');
    const sel = criar('select');
    elementos.forEach((s) => {
      const o = criar('option', '', s + ' — ' + D.elementos[s].nome);
      o.value = s;
      sel.appendChild(o);
    });
    sel.value = simbolo;
    lab.appendChild(sel);
    linhaEl.appendChild(lab);
    raiz.appendChild(linhaEl);
    ouvir(sel, 'change', () => { simbolo = sel.value; reiniciar(); }, fixos);

    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    const btnReal = criar('button', 'btn', 'Valores reais (Tabela)');
    btnReal.type = 'button';
    raiz.appendChild(btnReal);
    ouvir(btnReal, 'click', () => { abund = D.isotopos[simbolo].map((i) => i.abundancia); sincronizar(); }, fixos);

    const svg = svgEl('svg', { viewBox: '0 0 300 110', width: '100%', role: 'img', class: 'isotopos-svg' });
    svg.style.maxWidth = '420px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    raiz.appendChild(svg);
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    let aguarda = false;
    function reiniciar() {
      sliders.forEach((s) => s.destruir());
      sliders = [];
      soltar(dinamicos);
      const lista = D.isotopos[simbolo];
      abund = lista.map((i) => i.abundancia);
      lista.slice(0, -1).forEach((iso, k) => {
        const tit = criar('p', 'esq-subtitulo');
        tit.appendChild(document.createTextNode('Isótopo '));
        latex(tit, nuclideo(iso.a));
        zonaSliders.appendChild(tit);
        sliders.push(N.slider(zonaSliders, {
          rotulo: 'Abundância (%)', min: 0, max: 100, passo: 0.01, valor: abund[k],
          aoMudar: (v) => {
            if (aguarda) return;
            const outros = abund.reduce((t, x, j) => (j === k || j === lista.length - 1 ? t : t + x), 0);
            const ok = Math.min(v, 100 - outros);
            abund[k] = ok;
            if (ok !== v) { aguarda = true; sliders[k].definir(ok); aguarda = false; }
            abund[lista.length - 1] = Math.max(0, 100 - abund.slice(0, -1).reduce((t, x) => t + x, 0));
            atualizar();
          },
        }));
      });
      atualizar();
    }
    function sincronizar() {
      aguarda = true;
      sliders.forEach((s, k) => s.definir(abund[k]));
      aguarda = false;
      atualizar();
    }

    function atualizar() {
      const lista = D.isotopos[simbolo];
      const nome = D.elementos[simbolo].nome;
      abund[lista.length - 1] = Math.max(0, 100 - abund.slice(0, -1).reduce((t, x) => t + x, 0));
      const iso = lista.map((i, k) => ({ a: i.a, massa: i.massa, abundancia: abund[k] }));
      const ar = Q.massaAtomicaMedia(iso);

      svg.textContent = '';
      const cores = ['var(--cor-1)', 'var(--cor-2)', 'var(--cor-3)'];
      iso.forEach((i, k) => {
        const larg = 260 / iso.length - 12;
        const x = 20 + k * (larg + 12);
        const h = Math.round((i.abundancia / 100) * 70);
        svgEl('rect', { class: 'barra-iso', x, y: 80 - h, width: larg, height: h, fill: cores[k % 3] }, svg);
        const t = svgEl('text', { x: x + larg / 2, y: 98, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--texto)' }, svg);
        t.textContent = sup(i.a) + simbolo + ' ' + fmt(i.abundancia, 2) + ' %';
      });
      svg.setAttribute('aria-label', 'Barras das abundâncias dos isótopos de ' + nome + '.');

      zonaTexto.textContent = '';
      const soma = iso.map((i) => fmt(i.massa, 4) + ' × ' + fmt(i.abundancia, 2)).join(' + ');
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, f) => { dl.appendChild(criar('dt', '', rot)); const dd = criar('dd'); f(dd); dl.appendChild(dd); };
      iso.forEach((i) => linha('Massa isotópica relativa', (dd) => latex(dd, 'm(' + nuclideo(i.a) + ') = ' + fmt(i.massa, 4).replace(',', '{,}'))));
      linha('Média ponderada', (dd) => { dd.textContent = 'Ar = (' + soma + ') / 100'; });
      linha('Massa atómica relativa', (dd) => { dd.textContent = 'Ar(' + simbolo + ') = ' + fmt(ar, 2); });
      linha('Tabela Periódica', (dd) => { dd.textContent = 'Ar(' + simbolo + ') = ' + fmt(D.elementos[simbolo].massaAtomica, 2); });
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', '', 'A soma das abundâncias é 100 %: a última é o que falta. Quanto mais abundante é um isótopo, mais perto dele fica a massa atómica relativa.'));
    }

    reiniciar();

    return {
      destruir() {
        sliders.forEach((s) => s.destruir());
        soltar(dinamicos);
        soltar(fixos);
        el.textContent = '';
      },
    };
  },
});
