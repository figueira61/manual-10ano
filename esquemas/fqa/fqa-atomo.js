globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-atomo: escolhe Z, A (ou um isótopo da lista) e a carga; vê o núcleo e os eletrões.
// Opções: { z, a, carga }. Desenho ilustrativo (sem escala): os eletrões ficam na nuvem, não em órbitas.
Manual.esquemas.registar('fqa-atomo', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const D = Manual.dadosQuimicos;
    const NS = 'http://www.w3.org/2000/svg';
    const simbolos = Object.keys(D.elementos);
    const lim = (v, a, b, o) => { const x = Math.round(Number(v)); return Number.isFinite(x) ? Math.min(Math.max(x, a), b) : o; };

    const est = { z: lim(opcoes.z, 1, 36, 6), a: 0, carga: lim(opcoes.carga, -3, 3, 0) };
    est.a = Math.max(lim(opcoes.a, 1, 90, est.z * 2), est.z);
    est.carga = Math.min(est.carga, est.z); // a carga positiva nunca passa de Z (eletrões ≥ 0)

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
    const dinamicos = [];
    function ouvir(alvo, tipo, fn) { alvo.addEventListener(tipo, fn); dinamicos.push([alvo, tipo, fn]); }
    function limparDinamicos() { dinamicos.splice(0).forEach((r) => r[0].removeEventListener(r[1], r[2])); }

    el.textContent = '';
    const raiz = criar('div', 'esq-atomo');
    el.appendChild(raiz);
    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    let aguarda = false; // evita recursão ao corrigir A
    function corrigirCarga() {
      if (est.carga > est.z && !aguarda) { aguarda = true; est.carga = est.z; sQ.definir(est.z); aguarda = false; }
    }
    function corrigirA() {
      if (est.a < est.z && !aguarda) { aguarda = true; est.a = est.z; sA.definir(est.z); aguarda = false; }
    }
    const sZ = N.slider(zonaSliders, { rotulo: 'Número atómico Z', min: 1, max: 36, passo: 1, valor: est.z, aoMudar: (v) => { est.z = Math.round(v); corrigirA(); corrigirCarga(); atualizar(); } });
    const sA = N.slider(zonaSliders, { rotulo: 'Número de massa A', min: 1, max: 90, passo: 1, valor: est.a, aoMudar: (v) => { est.a = Math.round(v); corrigirA(); if (!aguarda) atualizar(); } });
    const sQ = N.slider(zonaSliders, { rotulo: 'Carga da espécie', min: -3, max: 3, passo: 1, valor: est.carga, aoMudar: (v) => { est.carga = Math.round(v); corrigirCarga(); if (!aguarda) atualizar(); } });

    zonaSliders.appendChild(criar('p', 'esq-nota', 'Podes escolher qualquer A ≥ Z; os botões abaixo mostram os isótopos que existem na realidade. Representação sem escala: o núcleo é muito menor do que o átomo e os eletrões não seguem órbitas.'));
    const zonaIsotopos = criar('div', 'esq-linha');
    raiz.appendChild(zonaIsotopos);
    const svg = svgEl('svg', { viewBox: '0 0 280 220', width: '100%', role: 'img', class: 'atomo-svg' });
    svg.style.maxWidth = '320px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    raiz.appendChild(svg);
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    // posição determinística em disco (disposição em girassol)
    const ponto = (i, n, R) => {
      const r = R * Math.sqrt((i + 0.5) / n), t = i * 2.399963;
      return [r * Math.cos(t), r * Math.sin(t)];
    };

    function desenhar(p, n, e) {
      svg.textContent = '';
      svgEl('circle', { cx: 140, cy: 110, r: 100, fill: 'var(--cor-1)', 'fill-opacity': 0.1, stroke: 'var(--cor-1)', 'stroke-dasharray': '5 4' }, svg);
      const A = p + n;
      const Rn = Math.max(14, 4.2 * Math.sqrt(A));
      svgEl('circle', { cx: 140, cy: 110, r: Rn + 3, fill: 'none', stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
      const rn = Math.min(6, Math.max(2.2, Rn / Math.sqrt(A) * 0.55));
      let rp = p, rnn = n;
      for (let i = 0; i < A; i++) {
        const [x, y] = ponto(i, A, Rn - rn);
        const eP = rp > 0 && (rnn === 0 || i % 2 === 0);
        if (eP) { rp--; svgEl('circle', { class: 'nucleao protao', cx: 140 + x, cy: 110 + y, r: rn, fill: 'var(--cor-2)', stroke: 'var(--texto)', 'stroke-width': 0.6 }, svg); }
        else { rnn--; svgEl('circle', { class: 'nucleao neutrao', cx: 140 + x, cy: 110 + y, r: rn, fill: 'var(--superficie)', stroke: 'var(--texto)', 'stroke-width': 1 }, svg); }
      }
      for (let i = 0; i < e; i++) {
        const t = i * 2.399963 + 0.6;
        const r = Math.min(98, Rn + 16 + 70 * Math.sqrt((i + 0.5) / e));
        svgEl('circle', { class: 'eletrao', cx: 140 + r * Math.cos(t), cy: 110 + r * Math.sin(t), r: 3, fill: 'var(--cor-3)', stroke: 'var(--texto)', 'stroke-width': 0.6 }, svg);
      }
    }

    function atualizar() {
      const z = est.z, a = est.a, q = est.carga;
      const n = a - z, e = z - q;
      const sim = simbolos[z - 1], nome = D.elementos[sim].nome;
      desenhar(z, n, Math.max(e, 0));
      const sinal = q === 0 ? '' : '^{' + (Math.abs(q) === 1 ? '' : Math.abs(q)) + (q > 0 ? '+' : '-') + '}';
      const notacao = '{}^{' + a + '}_{' + z + '}\\mathrm{' + sim + '}' + sinal;
      svg.setAttribute('aria-label', 'Átomo de ' + nome + ': ' + z + ' protões, ' + n + ' neutrões e ' + Math.max(e, 0) + ' eletrões.');

      limparDinamicos();
      zonaIsotopos.textContent = '';
      const lista = D.isotopos[sim];
      if (lista) {
        zonaIsotopos.appendChild(criar('span', 'nome', 'Isótopos de ' + nome + ':'));
        lista.forEach((i) => {
          const b = criar('button', 'btn', 'A = ' + i.a + ' (' + String(i.abundancia).replace('.', ',') + ' %)');
          b.type = 'button';
          b.setAttribute('aria-pressed', i.a === a ? 'true' : 'false');
          ouvir(b, 'click', () => sA.definir(i.a));
          zonaIsotopos.appendChild(b);
        });
      }

      zonaTexto.textContent = '';
      const resumo = criar('p', 'atomo-resumo');
      resumo.appendChild(document.createTextNode(nome + ' (' + sim + '): Z = ' + z + ', N = ' + n + ', A = ' + a + '. Notação: '));
      latex(resumo, notacao);
      zonaTexto.appendChild(resumo);
      const painel = criar('div');
      zonaTexto.appendChild(painel);
      N.painelValores(painel).definir([
        ['Protões (Z)', String(z)],
        ['Neutrões', 'N = A − Z = ' + a + ' − ' + z + ' = ' + n],
        ['Número de massa', 'A = Z + N = ' + z + ' + ' + n + ' = ' + a],
        ['Eletrões', e < 0 ? 'não pode haver menos de zero: diminui a carga' : e + (q === 0 ? ' (átomo neutro: tantos como protões)' : ' (Z − carga = ' + z + ' − (' + q + '))')],
        ['Tipo de espécie', q === 0 ? 'átomo neutro' : q > 0 ? 'catião (perdeu ' + q + (q === 1 ? ' eletrão)' : ' eletrões)') : 'anião (ganhou ' + (-q) + (q === -1 ? ' eletrão)' : ' eletrões)')],
      ]);
    }

    atualizar();

    return {
      destruir() {
        limparDinamicos();
        [sZ, sA, sQ].forEach((s) => s.destruir());
        el.textContent = '';
      },
    };
  },
});
