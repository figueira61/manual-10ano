globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { u, v, k, operacao } — operações com vetores no plano (pontas arrastáveis).
Manual.esquemas.registar('vetores', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const G = Manual.calc.geometria;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -10, xmax: 10, ymin: -10, ymax: 10 };
    const OPERACOES = {
      soma: 'Soma u + v',
      diferenca: 'Diferença u − v',
      escalar: 'Multiplicação por escalar k·u',
      colinearidade: 'Colinearidade',
    };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function ponto(p, omissao) {
      const ok = Array.isArray(p) && p.length === 2 && p.every((x) => Number.isFinite(Number(x)));
      const q = ok ? p.map(Number) : omissao;
      return [
        Math.min(Math.max(Math.round(q[0] * 2) / 2, CAIXA.xmin), CAIXA.xmax),
        Math.min(Math.max(Math.round(q[1] * 2) / 2, CAIXA.ymin), CAIXA.ymax),
      ];
    }
    const num = T.num;
    const par = (p) => '(' + num(p[0]) + ' ; ' + num(p[1]) + ')';
    const igual = (x) => (Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6 ? '= ' : '≈ ');
    // norma como texto: 5, ou √20 ≈ 4,472
    function normaTxt(w) {
      const n = G.norma(w);
      const q = w[0] * w[0] + w[1] * w[1];
      return Math.abs(n - Math.round(n)) < 1e-9 ? '= ' + num(n) : '= √' + num(q) + ' ≈ ' + num(n);
    }

    const k0 = Number(opcoes.k);
    const est = {
      u: ponto(opcoes.u, [3, 1]),
      v: ponto(opcoes.v, [1, 3]),
      k: Number.isFinite(k0) ? Math.min(Math.max(Math.round(k0 * 2) / 2, -3), 3) : 2,
      op: OPERACOES[opcoes.operacao] ? opcoes.operacao : 'soma',
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-vetores');
    el.appendChild(raiz);

    const zonaControlos = criar('div', 'esq-controlos');
    raiz.appendChild(zonaControlos);
    const rotSel = criar('label', null, 'Operação: ');
    const sel = criar('select', 'campo-numero');
    sel.style.width = 'auto';
    Object.keys(OPERACOES).forEach((id) => {
      const o = criar('option', null, OPERACOES[id]);
      o.value = id;
      if (id === est.op) o.selected = true;
      sel.appendChild(o);
    });
    const aoSelecionar = () => { est.op = sel.value; montarPontos(); atualizar(); };
    sel.addEventListener('change', aoSelecionar);
    rotSel.appendChild(sel);
    zonaControlos.appendChild(rotSel);

    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const sliderK = N.slider(zonaSlider, { rotulo: 'k', min: -3, max: 3, passo: 0.5, valor: est.k, aoMudar: (x) => { est.k = x; atualizar(); } });

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'group');
    const gVetores = ref.camada('vetores');

    const zonaLegenda = criar('div', 'esq-legenda');
    raiz.appendChild(zonaLegenda);
    const zonaAviso = criar('div');
    raiz.appendChild(zonaAviso);
    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const painel = N.painelValores(zonaPainel);

    let pU = null, pV = null;
    function montarPontos() {
      if (pU) pU.destruir();
      if (pV) pV.destruir();
      pU = N.pontoArrastavel(ref, { x: est.u[0], y: est.u[1], rotulo: 'u', passo: 0.5, cor: 'var(--cor-1)', aoMover: (x, y) => { est.u = [x, y]; atualizar(); } });
      pV = est.op === 'escalar' ? null
        : N.pontoArrastavel(ref, { x: est.v[0], y: est.v[1], rotulo: 'v', passo: 0.5, cor: 'var(--cor-2)', aoMover: (x, y) => { est.v = [x, y]; atualizar(); } });
    }

    const vet = (o, w, cor, rotulo, tracejado) => {
      const g = N.desenharVetor(ref, gVetores, o, w, { cor, rotulo });
      if (tracejado) g.querySelector('line').setAttribute('stroke-dasharray', '6 4');
    };
    const seg = (A, B, tracejado) => N.desenharSegmento(ref, gVetores, A, B, { cor: 'var(--cor-eixos)', largura: 1.3, tracejado });
    const legenda = (...itens) => {
      zonaLegenda.textContent = '';
      itens.forEach(([cor, texto, tr]) => {
        const s = criar('span');
        const t = criar('span', 'traco' + (tr ? ' tracejado' : ''));
        t.style.color = cor;
        s.appendChild(t);
        s.appendChild(document.createTextNode(texto));
        zonaLegenda.appendChild(s);
      });
    };

    function atualizar() {
      const { u, v, k, op } = est;
      N.limpar(gVetores);
      zonaAviso.textContent = '';
      zonaSlider.style.display = op === 'escalar' ? '' : 'none';
      ref.svg.setAttribute('aria-label', OPERACOES[op] + ' com u' + par(u) + (op === 'escalar' ? ' e k = ' + num(k) : ' e v' + par(v)) + '.');
      const O = [0, 0];
      const linhas = [['u', par(u) + '  ‖u‖ ' + normaTxt(u)]];
      if (op !== 'escalar') linhas.push(['v', par(v) + '  ‖v‖ ' + normaTxt(v)]);

      if (op === 'soma') {
        const s = G.somar(u, v);
        seg(u, s, true);
        seg(v, s, true);
        vet(O, u, 'var(--cor-1)', 'u');
        vet(O, v, 'var(--cor-2)', 'v');
        vet(O, s, 'var(--cor-3)', 'u + v');
        legenda(['var(--cor-3)', 'u + v: diagonal do paralelogramo (ou v colocado na ponta de u)']);
        linhas.push(['u + v', '(' + num(u[0]) + ' + ' + (v[0] < 0 ? '(' + num(v[0]) + ')' : num(v[0])) + ' ; ' + num(u[1]) + ' + ' + (v[1] < 0 ? '(' + num(v[1]) + ')' : num(v[1])) + ') = ' + par(s)]);
        linhas.push(['‖u + v‖', normaTxt(s)]);
      } else if (op === 'diferenca') {
        const d = G.subtrair(u, v);
        vet(O, u, 'var(--cor-1)', 'u');
        vet(O, v, 'var(--cor-2)', 'v');
        vet(v, d, 'var(--cor-3)', 'u − v');
        vet(O, d, 'var(--cor-3)', '', true);
        legenda(['var(--cor-3)', 'u − v: vai da ponta de v até à ponta de u (a tracejado, o mesmo vetor na origem)']);
        linhas.push(['u − v', '(' + num(u[0]) + ' − ' + (v[0] < 0 ? '(' + num(v[0]) + ')' : num(v[0])) + ' ; ' + num(u[1]) + ' − ' + (v[1] < 0 ? '(' + num(v[1]) + ')' : num(v[1])) + ') = ' + par(d)]);
        linhas.push(['‖u − v‖', normaTxt(d)]);
      } else if (op === 'escalar') {
        const w = G.escalar(k, u);
        vet(O, u, 'var(--cor-1)', 'u');
        vet(O, w, 'var(--cor-3)', num(k) + 'u', false);
        legenda(['var(--cor-3)', k < 0 ? 'k < 0: sentido contrário ao de u' : k === 0 ? 'k = 0: vetor nulo' : k > 1 ? 'k > 1: mais comprido, mesmo sentido' : k === 1 ? 'k = 1: o próprio u' : '0 < k < 1: mais curto, mesmo sentido']);
        linhas.push(['k · u', num(k) + ' × ' + par(u) + ' = ' + par(w)]);
        linhas.push(['‖k · u‖', '|' + num(k) + '| × ‖u‖ ' + igual(G.norma(w)) + num(G.norma(w))]);
      } else {
        vet(O, u, 'var(--cor-1)', 'u');
        vet(O, v, 'var(--cor-2)', 'v');
        const col = G.colineares(u, v);
        const det = u[0] * v[1] - u[1] * v[0];
        legenda(['var(--cor-1)', 'u'], ['var(--cor-2)', 'v']);
        linhas.push(['u₁v₂ − u₂v₁', num(u[0]) + ' × ' + (v[1] < 0 ? '(' + num(v[1]) + ')' : num(v[1])) + ' − ' + (u[1] < 0 ? '(' + num(u[1]) + ')' : num(u[1])) + ' × ' + (v[0] < 0 ? '(' + num(v[0]) + ')' : num(v[0])) + ' = ' + num(det)]);
        if (!col) {
          linhas.push(['Conclusão', 'u e v não são colineares (determinante ≠ 0)']);
        } else if (G.norma(u) < 1e-9 && G.norma(v) < 1e-9) {
          linhas.push(['Conclusão', 'u e v são colineares (ambos nulos)']);
        } else if (G.norma(u) < 1e-9) {
          linhas.push(['Conclusão', 'u e v são colineares: u = 0 × v (u é o vetor nulo)']);
        } else {
          const i = Math.abs(u[0]) > 1e-9 ? 0 : 1;
          const kk = v[i] / u[i];
          linhas.push(['Conclusão', 'u e v são colineares: v = k·u com k ' + igual(kk) + num(kk)]);
        }
      }
      painel.definir(linhas);
    }

    montarPontos();
    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoSelecionar);
        if (pU) pU.destruir();
        if (pV) pV.destruir();
        sliderK.destruir();
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
