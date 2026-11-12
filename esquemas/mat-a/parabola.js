globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { a, h, k, mostrarBase } — parábola y = a(x − h)² + k.
Manual.esquemas.registar('parabola', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const F = Manual.calc.funcoes;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -8, xmax: 8, ymin: -8, ymax: 8 };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function limitar(v, min, max, passo, omissao) {
      const x = Number(v);
      if (!Number.isFinite(x)) return omissao;
      return T.arred(Math.min(Math.max(Math.round(x / passo) * passo, min), max));
    }
    const semZero = (a) => (Math.abs(a) < 1e-9 ? 0.1 : a);

    const est = {
      a: semZero(limitar(opcoes.a, -3, 3, 0.1, 1)),
      h: limitar(opcoes.h, -5, 5, 0.5, 1),
      k: limitar(opcoes.k, -5, 5, 0.5, -4),
      base: opcoes.mostrarBase !== false,
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-parabola');
    el.appendChild(raiz);

    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    let sa, sh, sk;
    sa = N.slider(zonaSliders, {
      rotulo: 'a', min: -3, max: 3, passo: 0.1, valor: est.a,
      aoMudar(v) {
        if (Math.abs(v) < 1e-9) {
          // a = 0 não é parábola: salta para o valor não nulo mais próximo, no sentido do movimento
          const novo = est.a < 0 ? 0.1 : -0.1;
          est.a = novo;
          sa.definir(novo);
          return;
        }
        est.a = T.arred(v);
        atualizar();
      },
    });
    sh = N.slider(zonaSliders, { rotulo: 'h', min: -5, max: 5, passo: 0.5, valor: est.h, aoMudar: (v) => { est.h = v; atualizar(); } });
    sk = N.slider(zonaSliders, { rotulo: 'k', min: -5, max: 5, passo: 0.5, valor: est.k, aoMudar: (v) => { est.k = v; atualizar(); } });

    const botaoBase = criar('button', 'botao', 'Mostrar y = x²');
    botaoBase.type = 'button';
    botaoBase.setAttribute('aria-pressed', String(est.base));
    const zonaBotoes = criar('div', 'esq-controlos');
    zonaBotoes.appendChild(botaoBase);
    raiz.appendChild(zonaBotoes);
    const aoBase = () => {
      est.base = !est.base;
      botaoBase.setAttribute('aria-pressed', String(est.base));
      atualizar();
    };
    botaoBase.addEventListener('click', aoBase);

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'img');
    const gGrafico = ref.camada('grafico');
    const gMarcas = ref.camada('marcas');

    const legenda = criar('div', 'esq-legenda');
    const l1 = criar('span');
    const t1 = criar('span', 'traco');
    t1.style.color = 'var(--cor-1)';
    l1.appendChild(t1);
    l1.appendChild(document.createTextNode('y = a(x − h)² + k'));
    const l2 = criar('span');
    const t2 = criar('span', 'traco tracejado');
    t2.style.color = 'var(--cor-2)';
    l2.appendChild(t2);
    l2.appendChild(document.createTextNode('y = x² (base)'));
    const l3 = criar('span');
    const t3 = criar('span', 'traco tracejado');
    t3.style.color = 'var(--cor-4)';
    l3.appendChild(t3);
    l3.appendChild(document.createTextNode('eixo de simetria'));
    legenda.appendChild(l1);
    legenda.appendChild(l2);
    legenda.appendChild(l3);
    raiz.appendChild(legenda);

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);

    function marca(P, cor, rotulo, dx, dy) {
      N.desenharCirculo(ref, gMarcas, P, 0.2, { cor, largura: 2, preenchimento: cor });
      if (rotulo) {
        const t = N.desenharTexto(ref, gMarcas, [P[0] + dx, P[1] + dy], rotulo);
        t.setAttribute('text-anchor', 'middle');
      }
    }

    function atualizar() {
      const { a, h, k } = est;
      const g = F.canonicaParaGeral(a, h, k);
      const b = T.arred(g.b), c = T.arred(g.c);
      const q = F.quadratica(a, b, c);
      const delta = q.delta;
      const vh = q.vertice[0];
      const vk = q.vertice[1];

      const canonica = 'f(x) = ' + T.canonica(a, h, k);
      const geral = 'f(x) = ' + T.polinomio(a, b, c);
      ref.svg.setAttribute('aria-label', 'Gráfico de ' + canonica + ', vértice (' + T.num(vh) + '; ' + T.num(vk) + ').');

      N.limpar(gGrafico);
      N.limpar(gMarcas);
      if (est.base) {
        // desenharFuncao não aceita tracejado: aplica-o às polilinhas da base
        N.desenharFuncao(ref, gGrafico, (x) => x * x, { cor: 'var(--cor-2)' });
        gGrafico.querySelectorAll('polyline').forEach((p) => p.setAttribute('stroke-dasharray', '6 4'));
      }
      N.desenharFuncao(ref, gGrafico, (x) => a * (x - h) * (x - h) + k, { cor: 'var(--cor-1)' });
      N.desenharSegmento(ref, gMarcas, [vh, CAIXA.ymin], [vh, CAIXA.ymax], { cor: 'var(--cor-4)', largura: 1.5, tracejado: true });

      if (vk >= CAIXA.ymin && vk <= CAIXA.ymax && vh >= CAIXA.xmin && vh <= CAIXA.xmax) {
        marca([vh, vk], 'var(--cor-5)', 'V (' + T.num(vh) + '; ' + T.num(vk) + ')', 0, a > 0 ? -0.7 : 0.9);
      }
      const zeros = q.zeros.map(T.arred);
      zeros.forEach((z) => {
        if (z >= CAIXA.xmin && z <= CAIXA.xmax) marca([z, 0], 'var(--cor-3)', T.num(z), 0, a > 0 ? 0.9 : -0.9);
      });

      const concav = a > 0 ? 'voltada para cima (a > 0)' : 'voltada para baixo (a < 0)';
      const contra = a > 0 ? '[' + T.num(vk) + ', +∞[' : ']−∞, ' + T.num(vk) + ']';
      const extremo = (a > 0 ? 'mínimo ' : 'máximo ') + T.num(vk) + ' em x = ' + T.num(vh);
      const zerosTxt = zeros.length === 0 ? 'não tem zeros (Δ < 0)'
        : zeros.length === 1 ? 'x = ' + T.num(zeros[0]) + ' (zero duplo, Δ = 0)'
        : 'x = ' + T.num(zeros[0]) + ' e x = ' + T.num(zeros[1]) + ' (Δ > 0)';

      const passos = [];
      if (Math.abs(a) !== 1) passos.push('dilatação vertical de fator |a| = ' + T.num(Math.abs(a)));
      if (a < 0) passos.push('reflexão no eixo Ox');
      passos.push('translação de vetor (' + T.num(h) + '; ' + T.num(k) + ')');
      const frase = 'Obtém-se de y = x² por ' + (passos.length > 1
        ? passos.slice(0, -1).join(', ') + ' e ' + passos[passos.length - 1]
        : passos[0]) + '.';

      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir([
        ['Forma canónica', canonica],
        ['Forma geral', geral],
        ['Discriminante Δ', 'Δ = b² − 4ac = ' + T.num(delta)],
        ['Zeros', zerosTxt],
        ['Vértice', '(' + T.num(vh) + '; ' + T.num(vk) + ')'],
        ['Eixo de simetria', 'x = ' + T.num(q.eixo)],
        ['Concavidade', concav],
        ['Extremo', extremo],
        ['Contradomínio', contra],
        ['Transformações', frase],
      ]);
    }

    atualizar();

    return {
      destruir() {
        botaoBase.removeEventListener('click', aoBase);
        [sa, sh, sk].forEach((s) => s.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
