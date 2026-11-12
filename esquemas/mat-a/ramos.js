globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { ramos: 'modulo' | 'escada' | 'mista', mostrarModulo } — funções definidas por ramos.
Manual.esquemas.registar('ramos', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const F = Manual.calc.funcoes;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -6, xmax: 6, ymin: -3, ymax: 9 };
    const INF = Infinity;

    const EXEMPLOS = {
      modulo: {
        nome: 'Módulo: f(x) = |x|', x: -2,
        ramos: [
          { de: -INF, ate: 0, incluiDe: false, incluiAte: false, f: (x) => -x, txt: '−x' },
          { de: 0, ate: INF, incluiDe: true, incluiAte: false, f: (x) => x, txt: 'x' },
        ],
      },
      escada: {
        nome: 'Escada (com saltos)', x: 1,
        ramos: [
          { de: -INF, ate: 0, incluiDe: false, incluiAte: false, f: () => 1, txt: '1' },
          { de: 0, ate: 2, incluiDe: true, incluiAte: false, f: () => 2, txt: '2' },
          { de: 2, ate: INF, incluiDe: true, incluiAte: false, f: () => 3, txt: '3' },
        ],
      },
      mista: {
        nome: 'Mista (reta, parábola, constante)', x: 2,
        ramos: [
          { de: -INF, ate: 0, incluiDe: false, incluiAte: false, f: (x) => x + 2, txt: 'x + 2' },
          { de: 0, ate: 2, incluiDe: true, incluiAte: false, f: (x) => x * x, txt: 'x²' },
          { de: 2, ate: INF, incluiDe: true, incluiAte: false, f: () => 3, txt: '3' },
        ],
      },
    };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }

    const est = {
      id: EXEMPLOS[opcoes.ramos] ? opcoes.ramos : 'modulo',
      modulo: opcoes.mostrarModulo === true,
      x: null,
    };
    est.x = EXEMPLOS[est.id].x;

    function condicao(r) {
      const de = Number.isFinite(r.de), ate = Number.isFinite(r.ate);
      if (de && ate) return T.num(r.de) + (r.incluiDe ? ' ≤ ' : ' < ') + 'x' + (r.incluiAte ? ' ≤ ' : ' < ') + T.num(r.ate);
      if (de) return 'x ' + (r.incluiDe ? '≥ ' : '> ') + T.num(r.de);
      if (ate) return 'x ' + (r.incluiAte ? '≤ ' : '< ') + T.num(r.ate);
      return 'x ∈ ℝ';
    }
    const dentro = (r, x) => F.avaliarRamos([r], x) !== undefined;

    el.textContent = '';
    const raiz = criar('div', 'esq-ramos');
    el.appendChild(raiz);

    const zonaControlos = criar('div', 'esq-controlos');
    raiz.appendChild(zonaControlos);

    const rotSel = criar('label', null, 'Exemplo: ');
    const sel = criar('select', 'campo-numero');
    sel.style.width = 'auto';
    Object.keys(EXEMPLOS).forEach((id) => {
      const o = criar('option', null, EXEMPLOS[id].nome);
      o.value = id;
      if (id === est.id) o.selected = true;
      sel.appendChild(o);
    });
    rotSel.appendChild(sel);
    zonaControlos.appendChild(rotSel);

    const botaoModulo = criar('button', 'botao', 'Mostrar |f(x)|');
    botaoModulo.type = 'button';
    botaoModulo.setAttribute('aria-pressed', String(est.modulo));
    zonaControlos.appendChild(botaoModulo);

    const zonaX = criar('div', 'esq-controlos');
    raiz.appendChild(zonaX);
    const rotX = criar('label', null, 'x = ');
    const campo = criar('input', 'campo-numero');
    campo.type = 'text';
    campo.value = T.num(est.x).replace('−', '-');
    campo.setAttribute('aria-label', 'Valor de x');
    rotX.appendChild(campo);
    zonaX.appendChild(rotX);

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'img');
    const gGrafico = ref.camada('grafico');
    const gMarcas = ref.camada('marcas');

    const legenda = criar('div', 'esq-legenda');
    const l1 = criar('span');
    const t1 = criar('span', 'traco');
    t1.style.color = 'var(--cor-1)';
    l1.appendChild(t1);
    l1.appendChild(document.createTextNode('f(x); bola cheia: ponto incluído; bola vazia: ponto excluído'));
    legenda.appendChild(l1);
    const l2 = criar('span');
    const t2 = criar('span', 'traco tracejado');
    t2.style.color = 'var(--cor-2)';
    l2.appendChild(t2);
    l2.appendChild(document.createTextNode('|f(x)|'));
    legenda.appendChild(l2);
    raiz.appendChild(legenda);

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);

    function lerX() {
      const v = Manual.quiz.lerNumero(campo.value);
      return Number.isNaN(v) ? null : v;
    }

    function atualizar() {
      const ex = EXEMPLOS[est.id];
      const ramos = ex.ramos;
      ref.svg.setAttribute('aria-label', 'Gráfico da função por ramos: ' + ex.nome + '.');
      botaoModulo.setAttribute('aria-pressed', String(est.modulo));

      N.limpar(gGrafico);
      N.limpar(gMarcas);

      ramos.forEach((r) => {
        N.desenharFuncao(ref, gGrafico, (x) => (x >= r.de && x <= r.ate ? r.f(x) : NaN), { cor: 'var(--cor-1)' });
      });
      if (est.modulo) {
        const n0 = gGrafico.querySelectorAll('polyline').length;
        N.desenharFuncao(ref, gGrafico, (x) => {
          const y = F.avaliarRamos(ramos, x);
          return y === undefined ? NaN : Math.abs(y);
        }, { cor: 'var(--cor-2)' });
        Array.from(gGrafico.querySelectorAll('polyline')).slice(n0).forEach((p) => p.setAttribute('stroke-dasharray', '6 4'));
      }

      // bolas nas pontas finitas de cada ramo
      ramos.forEach((r) => {
        [[r.de, r.incluiDe], [r.ate, r.incluiAte]].forEach(([e, inclui]) => {
          if (!Number.isFinite(e)) return;
          const y = r.f(e);
          if (y < CAIXA.ymin || y > CAIXA.ymax) return;
          N.desenharCirculo(ref, gMarcas, [e, y], 0.17, {
            cor: 'var(--cor-1)', largura: 2.5, preenchimento: inclui ? 'var(--cor-1)' : 'var(--fundo)',
          });
        });
      });

      const linhas = ramos.map((r, i) => ['Ramo ' + (i + 1), 'f(x) = ' + r.txt + ', se ' + condicao(r)]);

      const x = lerX();
      let resultado;
      if (x === null) {
        resultado = 'Escreve um número';
      } else {
        const idx = ramos.findIndex((r) => dentro(r, x));
        const y = F.avaliarRamos(ramos, x);
        if (idx < 0 || y === undefined) {
          resultado = 'x = ' + T.num(x) + ' está fora do domínio';
        } else {
          const yr = T.arred(y);
          resultado = 'f(' + T.num(x) + ') = ' + T.num(yr) + ' (ramo ' + (idx + 1) + ': ' + ramos[idx].txt + ', porque ' + condicao(ramos[idx]) + ')';
          if (est.modulo) resultado += '; |f(' + T.num(x) + ')| = ' + T.num(Math.abs(yr));
          if (Math.abs(x) <= CAIXA.xmax && yr >= CAIXA.ymin && yr <= CAIXA.ymax) {
            N.desenharSegmento(ref, gMarcas, [x, 0], [x, yr], { cor: 'var(--cor-5)', largura: 1.5, tracejado: true });
            N.desenharSegmento(ref, gMarcas, [0, yr], [x, yr], { cor: 'var(--cor-5)', largura: 1.5, tracejado: true });
            N.desenharCirculo(ref, gMarcas, [x, yr], 0.2, { cor: 'var(--cor-5)', largura: 2, preenchimento: 'var(--cor-5)' });
          }
        }
      }
      linhas.push(['Imagem', resultado]);

      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir(linhas);
    }

    const aoSelecionar = () => {
      est.id = sel.value;
      campo.value = T.num(EXEMPLOS[est.id].x).replace('−', '-');
      atualizar();
    };
    const aoModulo = () => { est.modulo = !est.modulo; atualizar(); };
    sel.addEventListener('change', aoSelecionar);
    botaoModulo.addEventListener('click', aoModulo);
    campo.addEventListener('input', atualizar);

    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoSelecionar);
        botaoModulo.removeEventListener('click', aoModulo);
        campo.removeEventListener('input', atualizar);
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
