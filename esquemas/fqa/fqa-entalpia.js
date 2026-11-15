globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-entalpia: diagrama de energia reagentes → átomos isolados → produtos para uma reação em fase gasosa.
// As ligações quebradas e formadas são contadas a partir das estruturas do catálogo (Manual.moleculas) e as energias
// vêm de Manual.dadosQuimicos.ligacoes (tabela de Huheey et al., energias médias de ligação); ΔH = Σ E(quebradas) − Σ E(formadas)
// (Manual.quimica.deltaHLigacoes). O resultado é aproximado: usa energias médias de ligação.
// Opções: { reacao: 'HCl' | 'H2O' | 'CH4' | 'NH3' (omissão 'HCl') }.
Manual.esquemas.registar('fqa-entalpia', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const Q = Manual.quimica;
    const Mol = Manual.moleculas;
    const NS = 'http://www.w3.org/2000/svg';

    // reagentes e produtos: [id do catálogo, coeficiente]
    const REACOES = {
      HCl: { reag: [['H2', 1], ['Cl2', 1]], prod: [['HCl', 2]] },
      H2O: { reag: [['H2', 2], ['O2', 1]], prod: [['H2O', 2]] },
      CH4: { reag: [['CH4', 1], ['O2', 2]], prod: [['CO2', 1], ['H2O', 2]] },
      NH3: { reag: [['N2', 1], ['H2', 3]], prod: [['NH3', 2]] },
    };
    const ids = Object.keys(REACOES);
    const est = { id: ids.includes(opcoes.reacao) ? opcoes.reacao : 'HCl' };

    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 0 });
    const sinal = (v) => (v < 0 ? '−' : v > 0 ? '+' : '') + fmt(Math.abs(v));
    const sub = (s) => s.replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);
    const formulaTexto = (id) => sub(Mol.obter(id).formula.replace(/\\mathrm\{/g, '').replace(/_\{?(\d+)\}?/g, '$1').replace(/[{}]/g, ''));
    const lado = (l) => l.map(([id, n]) => (n > 1 ? n + ' ' : '') + formulaTexto(id) + '(g)').join(' + ');
    const equacao = (r) => lado(r.reag) + ' → ' + lado(r.prod);
    const ladoTex = (l) => l.map(([id, n]) => (n > 1 ? n + '\\ ' : '') + Mol.obter(id).formula + '(g)').join(' + ');

    // Chave da tabela de ligações para uma ligação do catálogo (por exemplo 'O-H' ou 'C=O').
    function chave(a, b, ordem) {
      const s = { 1: '-', 2: '=', 3: '≡' }[ordem];
      const t = Manual.dadosQuimicos.ligacoes;
      for (const k of [a + s + b, b + s + a]) if (t[k]) return k;
      throw new Error('fqa-entalpia: ligação sem dados ' + a + s + b);
    }
    // Conta as ligações de um lado da equação: { chave: número } (coeficiente × ligações da molécula).
    function contarLigacoes(lista) {
      const r = {};
      for (const [id, n] of lista) {
        const m = Mol.obter(id);
        for (const [i, j, ordem] of m.ligacoes) {
          const k = chave(m.atomos[i].el, m.atomos[j].el, ordem);
          r[k] = (r[k] || 0) + n;
        }
      }
      return r;
    }
    const desc = (cont) => Object.keys(cont).map((k) => cont[k] + ' × ' + k.replace('-', '–') + ' (' + fmt(Manual.dadosQuimicos.ligacoes[k].energia) + ' kJ/mol)').join(' + ');
    const nomeLig = (k) => k.replace('-', '–');

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

    el.textContent = '';
    const raiz = criar('div', 'esq-entalpia');
    el.appendChild(raiz);

    const zonaSel = criar('div', 'esq-controlos');
    raiz.appendChild(zonaSel);
    const lab = criar('label', '', 'Reação ');
    const sel = criar('select');
    sel.setAttribute('aria-label', 'Reação');
    ids.forEach((id) => {
      const o = criar('option', '', equacao(REACOES[id]));
      o.value = id;
      if (id === est.id) o.selected = true;
      sel.appendChild(o);
    });
    lab.appendChild(sel);
    zonaSel.appendChild(lab);

    const L = 320, ALT = 240;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'img', class: 'entalpia-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    function texto(pai, x, y, t, extra) {
      const e = svgEl('text', Object.assign({ x, y, 'font-size': 10, fill: 'var(--texto)', 'text-anchor': 'middle' }, extra || {}), pai);
      e.textContent = t;
      return e;
    }
    function seta(pai, x, y1, y2, cor, classe) {
      const s = y2 > y1 ? 1 : -1;
      svgEl('line', { class: classe, x1: x, y1, x2: x, y2: y2 - s * 8, stroke: cor, 'stroke-width': 3 }, pai);
      svgEl('polygon', { points: x + ',' + y2 + ' ' + (x - 6) + ',' + (y2 - s * 11) + ' ' + (x + 6) + ',' + (y2 - s * 11), fill: cor }, pai);
    }

    function atualizar() {
      const r = REACOES[est.id];
      const quebradas = contarLigacoes(r.reag), formadas = contarLigacoes(r.prod);
      const res = Q.deltaHLigacoes({ quebradas, formadas });
      const dH = res.deltaH;
      // energia relativa aos reagentes: reagentes 0, átomos isolados +Σ quebradas, produtos ΔH
      const topo = res.somaQuebradas, fundo = Math.min(0, dH);
      const Y0 = 36, Y1 = 196; // topo e fundo do gráfico
      const y = (e) => Y1 - ((e - fundo) / (topo - fundo)) * (Y1 - Y0);
      svg.textContent = '';

      svgEl('line', { x1: 24, y1: 14, x2: 24, y2: 206, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      texto(svg, 14, 110, 'energia', { transform: 'rotate(-90 14 110)' });
      const niveis = [
        { x: 40, e: 0, t: 'Reagentes' },
        { x: 130, e: topo, t: 'Átomos isolados' },
        { x: 220, e: dH, t: 'Produtos' },
      ];
      niveis.forEach((n) => {
        svgEl('line', { class: 'nivel-energia', x1: n.x, y1: y(n.e), x2: n.x + 70, y2: y(n.e), stroke: 'var(--texto)', 'stroke-width': 2.5 }, svg);
        texto(svg, n.x + 35, y(n.e) + (n.e >= 0 && n.e === topo ? -6 : 14), n.t);
      });
      // ruptura (sobe) e formação (desce)
      seta(svg, 85, y(0), y(topo) , 'var(--cor-2)', 'seta-ruptura');
      seta(svg, 175, y(topo), y(dH), 'var(--cor-1)', 'seta-formacao');
      texto(svg, 85, (y(0) + y(topo)) / 2 + 4, '+' + fmt(res.somaQuebradas), { 'text-anchor': 'end', x: 79 });
      texto(svg, 175, (y(topo) + y(dH)) / 2 + 4, '−' + fmt(res.somaFormadas), { 'text-anchor': 'start', x: 181 });
      // ΔH global
      svgEl('line', { class: 'seta-deltaH', x1: 300, y1: y(0), x2: 300, y2: y(dH), stroke: 'var(--cor-3)', 'stroke-width': 3, 'stroke-dasharray': '5 3' }, svg);
      svgEl('line', { x1: 290, y1: y(0), x2: 300, y2: y(0), stroke: 'var(--cor-3)', 'stroke-width': 1.5 }, svg);
      svgEl('line', { x1: 290, y1: y(dH), x2: 300, y2: y(dH), stroke: 'var(--cor-3)', 'stroke-width': 1.5 }, svg);
      texto(svg, 304, (y(0) + y(dH)) / 2 + 4, 'ΔH', { 'text-anchor': 'start', 'font-weight': 700 });
      texto(svg, 160, ALT - 8, 'ΔH = ' + sinal(dH) + ' kJ/mol (' + (dH < 0 ? 'exotérmica' : dH > 0 ? 'endotérmica' : 'sem variação') + ')', { 'font-weight': 700 });

      svg.setAttribute('aria-label', 'Diagrama de energia da reação ' + equacao(r) + ': os reagentes absorvem ' + fmt(res.somaQuebradas) + ' kJ para quebrar as ligações (átomos isolados) e libertam ' + fmt(res.somaFormadas) + ' kJ ao formar as ligações dos produtos; ΔH = ' + sinal(dH) + ' kJ/mol.');

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, f) => { dl.appendChild(criar('dt', '', rot)); const dd = criar('dd'); f(dd); dl.appendChild(dd); };
      linha('Equação', (dd) => latex(dd, ladoTex(r.reag) + ' \\rightarrow ' + ladoTex(r.prod)));
      linha('Ligações quebradas', (dd) => { dd.textContent = desc(quebradas) + ' = ' + fmt(res.somaQuebradas) + ' kJ'; });
      linha('Ligações formadas', (dd) => { dd.textContent = desc(formadas) + ' = ' + fmt(res.somaFormadas) + ' kJ'; });
      linha('Variação de entalpia', (dd) => { dd.textContent = 'ΔH = ' + fmt(res.somaQuebradas) + ' − ' + fmt(res.somaFormadas) + ' = ' + sinal(dH) + ' kJ/mol'; });
      linha('Tipo de reação', (dd) => { dd.textContent = dH < 0 ? 'exotérmica (ΔH < 0): liberta-se mais energia a formar ligações do que a quebrar' : dH > 0 ? 'endotérmica (ΔH > 0): é preciso mais energia para quebrar ligações do que a libertada ao formar' : 'ΔH = 0'; });
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'ΔH = Σ E(ligações quebradas) − Σ E(ligações formadas), por mole de reação tal como está escrita. Todas as espécies estão em fase gasosa. Valores a partir da tabela de energias médias de ligação (Huheey et al.): o resultado é aproximado e pode diferir do valor medido a partir das entalpias de formação.'));
      // ligações quebradas/formadas por nome, para quem lê só texto
      const nomes = (c) => Object.keys(c).map((k) => c[k] + ' ' + nomeLig(k)).join(', ');
      svg.setAttribute('aria-label', svg.getAttribute('aria-label') + ' Ligações quebradas: ' + nomes(quebradas) + '. Ligações formadas: ' + nomes(formadas) + '.');
    }

    const aoEscolher = () => { est.id = sel.value; atualizar(); };
    sel.addEventListener('change', aoEscolher);
    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoEscolher);
        el.textContent = '';
      },
    };
  },
});
