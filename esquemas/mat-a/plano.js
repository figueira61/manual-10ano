globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { A, B, modo } — distância, ponto médio, mediatriz e circunferência no plano.
Manual.esquemas.registar('plano', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const G = Manual.calc.geometria;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -3, xmax: 11, ymin: -3, ymax: 11 };
    const MODOS = {
      distancia: 'Distância entre dois pontos',
      pontoMedio: 'Ponto médio',
      mediatriz: 'Mediatriz',
      circunferencia: 'Circunferência',
    };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function ponto(p, omissao) {
      const ok = Array.isArray(p) && p.length === 2 && p.every((v) => Number.isFinite(Number(v)));
      const q = ok ? p.map(Number) : omissao;
      return [
        Math.min(Math.max(Math.round(q[0] * 2) / 2, CAIXA.xmin), CAIXA.xmax),
        Math.min(Math.max(Math.round(q[1] * 2) / 2, CAIXA.ymin), CAIXA.ymax),
      ];
    }
    const num = T.num;
    const par = (p) => '(' + num(p[0]) + ' ; ' + num(p[1]) + ')';
    const igual = (v) => (Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6 ? '= ' : '≈ ');
    // número entre parênteses se for negativo, para substituir em fórmulas
    const sub = (v) => (T.arred(v) < 0 ? '(' + num(v) + ')' : num(v));
    // "x − a" substituído: x − 3, x + 3, ou x se a = 0

    const est = {
      A: ponto(opcoes.A, [1, 1]),
      B: ponto(opcoes.B, [4, 5]),
      modo: MODOS[opcoes.modo] ? opcoes.modo : 'distancia',
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-plano');
    el.appendChild(raiz);

    const zonaControlos = criar('div', 'esq-controlos');
    raiz.appendChild(zonaControlos);
    const rotSel = criar('label', null, 'Modo: ');
    const sel = criar('select', 'campo-numero');
    sel.style.width = 'auto';
    Object.keys(MODOS).forEach((id) => {
      const o = criar('option', null, MODOS[id]);
      o.value = id;
      if (id === est.modo) o.selected = true;
      sel.appendChild(o);
    });
    const aoSelecionar = () => { est.modo = sel.value; atualizar(); };
    sel.addEventListener('change', aoSelecionar);
    rotSel.appendChild(sel);
    zonaControlos.appendChild(rotSel);

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'group');
    const gDesenho = ref.camada('desenho');
    const zonaAviso = criar('div');
    raiz.appendChild(zonaAviso);
    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const painel = N.painelValores(zonaPainel);

    const pA = N.pontoArrastavel(ref, { x: est.A[0], y: est.A[1], rotulo: 'A', passo: 0.5, cor: 'var(--cor-1)', aoMover: (x, y) => { est.A = [x, y]; atualizar(); } });
    const pB = N.pontoArrastavel(ref, { x: est.B[0], y: est.B[1], rotulo: 'B', passo: 0.5, cor: 'var(--cor-2)', aoMover: (x, y) => { est.B = [x, y]; atualizar(); } });

    function marca(p, cor, letra) {
      N.desenharCirculo(ref, gDesenho, p, 0.14, { cor, largura: 2, preenchimento: cor });
      const t = N.desenharTexto(ref, gDesenho, [p[0] + 0.2, p[1] + 0.3], letra);
      t.style.fill = cor;
      t.style.fontWeight = '700';
    }

    function atualizar() {
      const { A, B, modo } = est;
      N.limpar(gDesenho);
      zonaAviso.textContent = '';
      ref.svg.setAttribute('aria-label', MODOS[modo] + ': A' + par(A) + ' e B' + par(B) + '.');
      const v = G.vetor(A, B);
      const linhas = [['A', par(A)], ['B', par(B)]];
      const eixo = 'var(--cor-eixos)';

      if (modo === 'distancia') {
        const C = [B[0], A[1]];
        N.desenharSegmento(ref, gDesenho, A, C, { cor: eixo, largura: 1.5, tracejado: true });
        N.desenharSegmento(ref, gDesenho, C, B, { cor: eixo, largura: 1.5, tracejado: true });
        N.desenharSegmento(ref, gDesenho, A, B, { cor: 'var(--cor-3)', largura: 3 });
        const d = G.distancia(A, B);
        const s = v[0] * v[0] + v[1] * v[1];
        linhas.push(['Fórmula', 'd = √((x₂ − x₁)² + (y₂ − y₁)²)']);
        const subst = 'd = √((' + num(B[0]) + ' − ' + sub(A[0]) + ')² + (' + num(B[1]) + ' − ' + sub(A[1]) + ')²)';
        const meio = ' = √(' + num(v[0] * v[0]) + ' + ' + num(v[1] * v[1]) + ')';
        const exato = Math.abs(d - Math.round(d)) < 1e-9;
        const fim = ' = √' + num(s) + (exato ? ' = ' + num(d) : ' ' + igual(d).trim() + ' ' + num(d));
        linhas.push(['Substituindo', subst + meio + fim]);
      } else if (modo === 'pontoMedio') {
        const M = G.pontoMedio(A, B);
        N.desenharSegmento(ref, gDesenho, A, B, { cor: 'var(--cor-3)', largura: 2.5 });
        marca(M, 'var(--cor-3)', 'M');
        linhas.push(['Fórmula', 'M = ((x₁ + x₂)/2 ; (y₁ + y₂)/2)']);
        linhas.push(['Substituindo', 'M = ((' + num(A[0]) + ' + ' + sub(B[0]) + ')/2 ; (' + num(A[1]) + ' + ' + sub(B[1]) + ')/2) = ' + par(M)]);
      } else if (modo === 'mediatriz') {
        N.desenharSegmento(ref, gDesenho, A, B, { cor: eixo, largura: 2 });
        const M = G.pontoMedio(A, B);
        if (G.distancia(A, B) < 1e-9) {
          zonaAviso.appendChild(criar('div', 'esq-aviso', 'A e B coincidem: não há mediatriz.'));
        } else {
          const m = G.mediatriz(A, B);
          const dir = [-m.b, m.a];
          const k = 40 / Math.hypot(dir[0], dir[1]);
          N.desenharSegmento(ref, gDesenho, [M[0] - dir[0] * k, M[1] - dir[1] * k], [M[0] + dir[0] * k, M[1] + dir[1] * k], { cor: 'var(--cor-3)', largura: 2.5 });
          marca(M, 'var(--cor-3)', 'M');
          linhas.push(['Definição', 'P(x, y) com d(P, A) = d(P, B)']);
          linhas.push(['Equação', T.soma([[m.a, 'x'], [m.b, 'y']]) + ' = ' + num(m.c)]);
          const r = G.equacaoReduzida(M, dir);
          if (r && r.vertical !== undefined) linhas.push(['Reta vertical', 'x = ' + num(r.vertical)]);
          else if (r) {
            const exato = Math.abs(r.m * 1000 - Math.round(r.m * 1000)) < 1e-6 && Math.abs(r.b * 1000 - Math.round(r.b * 1000)) < 1e-6;
            linhas.push(['Reduzida', 'y = ' + T.soma([[r.m, 'x'], [r.b, '']]) + (exato ? '' : ' (valores aproximados)')]);
          }
        }
      } else {
        const r = G.distancia(A, B);
        const r2 = v[0] * v[0] + v[1] * v[1];
        N.desenharSegmento(ref, gDesenho, A, B, { cor: eixo, largura: 1.5, tracejado: true });
        if (r > 1e-9) N.desenharCirculo(ref, gDesenho, A, r, { cor: 'var(--cor-3)', largura: 2.5 });
        linhas.push(['Equação geral', '(x − a)² + (y − b)² = r²']);
        linhas.push(['Raio', 'r = |AB| ' + (Math.abs(r - Math.round(r)) < 1e-9 ? '= ' + num(r) : '= √' + num(r2) + ' ' + igual(r).trim() + ' ' + num(r))]);
        linhas.push(['Equação', T.fator('x', A[0]) + ' + ' + T.fator('y', A[1]) + ' = ' + num(r2)]);
      }
      painel.definir(linhas);
    }

    atualizar();

    return {
      destruir() {
        sel.removeEventListener('change', aoSelecionar);
        pA.destruir();
        pB.destruir();
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
