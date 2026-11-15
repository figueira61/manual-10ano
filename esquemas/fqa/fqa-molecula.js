globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-molecula: fórmula de estrutura ('estrutura') ou de Lewis ('lewis') de uma molécula do catálogo
// (Manual.moleculas). Coordenadas fixas escritas à mão no catálogo; sem algoritmo de disposição.
// Opções: { molecula: id, modo: 'estrutura' | 'lewis', mostrarInfo: boolean }.
// Por omissão só mostra a estrutura (átomos, ligações e, em Lewis, pares não ligantes): nada de nome,
// geometria ou polaridade, para a figura poder ir num enunciado sem revelar a resposta.
Manual.esquemas.registar('fqa-molecula', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const NS = 'http://www.w3.org/2000/svg';
    const Mol = Manual.moleculas;
    const id = opcoes.molecula;
    const m = Mol.obter(id); // lança se for desconhecida
    const lewis = opcoes.modo === 'lewis';
    const mostrarInfo = opcoes.mostrarInfo === true;

    const ESCALA = 64; // px por comprimento de ligação
    const MARGEM = 40; // espaço para o átomo e para os pares não ligantes
    const RAIO = 14; // círculo do átomo
    const FOLGA = 3; // folga entre o traço e o círculo
    const DIST_PAR = 21; // do centro do átomo ao centro do par
    const SEP_PAR = 4.5; // meia separação dos dois pontos de um par
    const DIST_TRACOS = 3.6; // meia separação entre traços paralelos

    const d = Mol.disposicao(id);
    const largura = Math.round((d.caixa.xmax - d.caixa.xmin) * ESCALA + 2 * MARGEM);
    const altura = Math.round((d.caixa.ymax - d.caixa.ymin) * ESCALA + 2 * MARGEM);
    const px = (a) => MARGEM + (a.x - d.caixa.xmin) * ESCALA;
    const py = (a) => MARGEM + (a.y - d.caixa.ymin) * ESCALA;
    const r2 = (v) => Math.round(v * 100) / 100;

    function criar(nome, atributos, pai) {
      const e = document.createElementNS(NS, nome);
      for (const k in atributos) e.setAttribute(k, atributos[k]);
      if (pai) pai.appendChild(e);
      return e;
    }
    function p(texto, classe) {
      const e = document.createElement('p');
      if (classe) e.className = classe;
      e.textContent = texto;
      return e;
    }

    // ---------- texto alternativo e informação ----------

    const sub = (s) => s.replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);
    const formulaTexto = (latex) => sub(latex.replace(/\\mathrm\{/g, '').replace(/_\{?(\d+)\}?/g, '$1').replace(/[{}]/g, ''));
    const num = (v) => String(v).replace('.', ',');
    const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
    const juntar = (itens) => (itens.length < 2 ? itens.join('') : itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1]);

    function textoEstrutura() {
      const c = Mol.contar(id);
      const partes = [];
      if (c.ligacoesSimples) partes.push(plural(c.ligacoesSimples, 'ligação simples', 'ligações simples'));
      if (c.duplas) partes.push(plural(c.duplas, 'ligação dupla', 'ligações duplas'));
      if (c.triplas) partes.push(plural(c.triplas, 'ligação tripla', 'ligações triplas'));
      if (lewis) partes.push(c.paresNaoLigantes ? plural(c.paresNaoLigantes, 'par não ligante', 'pares não ligantes') : 'nenhum par não ligante');
      return 'Estrutura de uma molécula com ' + plural(m.atomos.length, 'átomo', 'átomos') + ', ' + juntar(partes) + '.';
    }

    function textoInfo() {
      const cab = m.nome.charAt(0).toUpperCase() + m.nome.slice(1) + ' (' + formulaTexto(m.formula) + ')';
      const pol = m.polar ? 'molécula polar' : 'molécula apolar';
      if (m.geometria !== null) {
        return cab + ': geometria ' + m.geometria + (m.angulo !== null ? ', ângulo ≈ ' + num(m.angulo) + '°' : '') + '; ' + pol + '.';
      }
      const total = {}, vistos = {};
      m.centros.forEach((c) => { const s = m.atomos[c.atomo].el; total[s] = (total[s] || 0) + 1; });
      const centros = m.centros.map((c) => {
        const simbolo = m.atomos[c.atomo].el;
        vistos[simbolo] = (vistos[simbolo] || 0) + 1;
        const rotulo = total[simbolo] > 1 ? vistos[simbolo] + '.º ' + simbolo : simbolo;
        return rotulo + ': ' + c.geometria + ' (≈ ' + num(c.angulo) + '°)';
      });
      return cab + ': geometria à volta de cada átomo central — ' + centros.join('; ') + '; ' + pol + '.';
    }

    // ---------- desenho ----------

    el.textContent = '';
    const raiz = document.createElement('div');
    raiz.className = 'esq-molecula';
    el.appendChild(raiz);

    const svg = criar('svg', {
      viewBox: '0 0 ' + largura + ' ' + altura,
      width: '100%',
      role: 'img',
      class: 'mol-svg',
      'aria-label': textoEstrutura() + (mostrarInfo ? ' ' + textoInfo() : ''),
    });
    svg.style.maxWidth = largura + 'px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    raiz.appendChild(svg);

    const gTracos = criar('g', { 'data-camada': 'ligacoes' }, svg);
    const gPares = criar('g', { 'data-camada': 'pares' }, svg);
    const gAtomos = criar('g', { 'data-camada': 'atomos' }, svg);
    const estiloTraco = 'stroke:var(--texto);stroke-width:2.2;stroke-linecap:round';

    // Traços: ordem 1 → 1 linha; 2 → 2 paralelas; 3 → 3 paralelas. Param à beira do círculo dos átomos.
    for (const [i, j, ordem] of d.ligacoes) {
      const a = d.atomos[i], b = d.atomos[j];
      const x1 = px(a), y1 = py(a), x2 = px(b), y2 = py(b);
      const comp = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / comp, uy = (y2 - y1) / comp;
      const recuo = RAIO + FOLGA;
      for (let k = 0; k < ordem; k++) {
        const off = (k - (ordem - 1) / 2) * 2 * DIST_TRACOS;
        const nx = -uy * off, ny = ux * off;
        criar('line', {
          class: 'mol-traco',
          x1: r2(x1 + ux * recuo + nx), y1: r2(y1 + uy * recuo + ny),
          x2: r2(x2 - ux * recuo + nx), y2: r2(y2 - uy * recuo + ny),
          style: estiloTraco,
        }, gTracos);
      }
    }

    // Pares não ligantes (só em Lewis): dois pontos por par, na direção livre.
    if (lewis) {
      for (const a of d.atomos) {
        for (const ang of a.paresAngulos) {
          const rad = (ang * Math.PI) / 180;
          const cx = px(a) + Math.cos(rad) * DIST_PAR, cy = py(a) + Math.sin(rad) * DIST_PAR;
          const tx = -Math.sin(rad) * SEP_PAR, ty = Math.cos(rad) * SEP_PAR;
          for (const s of [-1, 1]) {
            criar('circle', { class: 'mol-par', cx: r2(cx + s * tx), cy: r2(cy + s * ty), r: 2.3, style: 'fill:var(--cor-2)' }, gPares);
          }
        }
      }
    }

    // Átomos: círculo (esconde o fim dos traços) e símbolo.
    for (const a of d.atomos) {
      criar('circle', {
        class: 'mol-atomo', cx: r2(px(a)), cy: r2(py(a)), r: RAIO,
        style: 'fill:var(--superficie);stroke:none',
      }, gAtomos);
      const t = criar('text', {
        class: 'mol-simbolo', x: r2(px(a)), y: r2(py(a) + 5.5), 'text-anchor': 'middle',
        style: 'fill:var(--texto);font-size:17px;font-weight:700;font-family:inherit',
      }, gAtomos);
      t.textContent = a.el;
    }

    if (mostrarInfo) raiz.appendChild(p(textoInfo(), 'mol-info'));

    return { destruir() { el.textContent = ''; } };
  },
});
