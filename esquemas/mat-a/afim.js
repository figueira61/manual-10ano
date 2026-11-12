globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { m, b } — função afim f(x) = mx + b.
Manual.esquemas.registar('afim', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const F = Manual.calc.funcoes;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -10, xmax: 10, ymin: -10, ymax: 10 };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function limitar(v, min, max, omissao) {
      const x = Number(v);
      return Number.isFinite(x) ? Math.min(Math.max(Math.round(x * 2) / 2, min), max) : omissao;
    }

    const est = { m: limitar(opcoes.m, -5, 5, 2), b: limitar(opcoes.b, -10, 10, -1) };

    el.textContent = '';
    const raiz = criar('div', 'esq-afim');
    el.appendChild(raiz);
    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    const sliders = [
      N.slider(zonaSliders, { rotulo: 'm', min: -5, max: 5, passo: 0.5, valor: est.m, aoMudar: (v) => { est.m = v; atualizar(); } }),
      N.slider(zonaSliders, { rotulo: 'b', min: -10, max: 10, passo: 0.5, valor: est.b, aoMudar: (v) => { est.b = v; atualizar(); } }),
    ];

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'img');
    const gGrafico = ref.camada('grafico');
    const gSinal = ref.camada('sinal');

    const legenda = criar('div', 'esq-legenda');
    const lp = criar('span');
    const tp = criar('span', 'traco');
    tp.style.color = 'var(--cor-3)';
    lp.appendChild(tp);
    lp.appendChild(document.createTextNode('f(x) > 0 (sinal +)'));
    const ln = criar('span');
    const tn = criar('span', 'traco');
    tn.style.color = 'var(--cor-2)';
    ln.appendChild(tn);
    ln.appendChild(document.createTextNode('f(x) < 0 (sinal −)'));
    legenda.appendChild(lp);
    legenda.appendChild(ln);
    raiz.appendChild(legenda);

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);

    function regiao(de, ate, positivo) {
      if (ate - de < 1e-9) return;
      const cor = positivo ? 'var(--cor-3)' : 'var(--cor-2)';
      N.desenharSegmento(ref, gSinal, [de, 0], [ate, 0], { cor, largura: 6 });
      const t = N.desenharTexto(ref, gSinal, [(de + ate) / 2, 0.9], positivo ? '+' : '−');
      t.setAttribute('text-anchor', 'middle');
      t.style.fill = cor;
      t.style.fontSize = '20px';
      t.style.fontWeight = '700';
    }

    function atualizar() {
      const { m, b } = est;
      const r = F.afim(m, b);
      const expr = 'f(x) = ' + T.soma([[m, 'x'], [b, '']]);
      ref.svg.setAttribute('aria-label', 'Gráfico de ' + expr + '.');

      N.limpar(gGrafico);
      N.limpar(gSinal);
      N.desenharFuncao(ref, gGrafico, (x) => m * x + b, { cor: 'var(--cor-1)' });

      const linhas = [['Expressão', expr]];
      if (r.zero === null) {
        const rotuloSinal = b > 0 ? 'positivo' : b < 0 ? 'negativo' : 'nulo';
        regiao(CAIXA.xmin, CAIXA.xmax, b > 0);
        if (b === 0) N.limpar(gSinal);
        linhas.push(['Zero', b === 0 ? 'todos os x (f é a função nula)' : 'não tem zeros']);
        linhas.push(['Sinal', b === 0 ? 'f(x) = 0 para todo o x' : 'f(x) ' + (b > 0 ? '> 0' : '< 0') + ' para todo o x (' + rotuloSinal + ')']);
      } else {
        const z = r.zero;
        const zc = Math.min(Math.max(z, CAIXA.xmin), CAIXA.xmax);
        regiao(CAIXA.xmin, zc, m < 0);
        regiao(zc, CAIXA.xmax, m > 0);
        if (z >= CAIXA.xmin && z <= CAIXA.xmax) {
          N.desenharCirculo(ref, gSinal, [z, 0], 0.22, { cor: 'var(--cor-5)', largura: 2.5, preenchimento: 'var(--fundo)' });
          const t = N.desenharTexto(ref, gSinal, [z, -1.1], 'x = ' + T.num(z));
          t.setAttribute('text-anchor', 'middle');
        }
        const zs = T.num(z);
        linhas.push(['Zero', 'x = ' + zs]);
        const pos = m > 0 ? 'x > ' + zs : 'x < ' + zs;
        const neg = m > 0 ? 'x < ' + zs : 'x > ' + zs;
        linhas.push(['Sinal', 'f(x) > 0 se ' + pos + '; f(x) < 0 se ' + neg + '; f(' + zs + ') = 0']);
      }
      linhas.push(['Monotonia', r.monotonia === 'constante' ? 'constante em ℝ' : r.monotonia + ' em ℝ' + (m > 0 ? ' (m > 0)' : ' (m < 0)')]);

      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir(linhas);
    }

    atualizar();

    return {
      destruir() {
        sliders.forEach((s) => s.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
