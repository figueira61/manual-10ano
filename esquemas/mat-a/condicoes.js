globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { pontos: [[x, y], …] ou [{x, y}, …], sinal: '=' | '<' | '>' | '<=' | '>=', k, modo: 'explorar' | 'enunciado' }
// Condições f(x) □ k lidas no gráfico de uma função afim por troços (polilinha de domínio fechado).
// explorar: a reta y = k arrasta-se (ou muda com as setas) e a solução fica realçada no eixo Ox.
// enunciado: só o gráfico e a reta y = k, sem a solução (para a figura de um exercício).
Manual.esquemas.registar('condicoes', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const F = Manual.calc.funcoes;
    const T = Manual.formatar;
    opcoes = opcoes || {};

    const OMISSAO = [[-3, 2], [-1, -2], [1, 2], [3, -1]];
    const lidos = Array.isArray(opcoes.pontos) ? opcoes.pontos.map((p) => (Array.isArray(p) ? { x: Number(p[0]), y: Number(p[1]) } : { x: Number(p.x), y: Number(p.y) })) : [];
    const validos = lidos.length >= 2 && lidos.every((p, i) => Number.isFinite(p.x) && Number.isFinite(p.y) && (i === 0 || p.x > lidos[i - 1].x));
    const pontos = validos ? lidos : OMISSAO.map(([x, y]) => ({ x, y }));
    const SINAIS = ['=', '<', '>', '<=', '>='];
    const SIMBOLO = { '=': '=', '<': '<', '>': '>', '<=': '≤', '>=': '≥' };
    const enunciado = opcoes.modo === 'enunciado';
    const PASSO = 0.5;

    const xs = pontos.map((p) => p.x), ys = pontos.map((p) => p.y);
    const k0 = Number.isFinite(Number(opcoes.k)) ? Number(opcoes.k) : 0;
    const CAIXA = {
      xmin: Math.min(0, ...xs) - 1, xmax: Math.max(0, ...xs) + 1,
      ymin: Math.min(0, k0, ...ys) - 1, ymax: Math.max(0, k0, ...ys) + 1,
    };
    const limitarK = (v) => Math.min(Math.max(Math.round(v * 10) / 10, CAIXA.ymin), CAIXA.ymax);
    const est = { sinal: SINAIS.includes(opcoes.sinal) ? opcoes.sinal : '<', k: limitarK(k0) };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    // Número em texto: decimal exato com até 3 casas (−2; 0,5), fração de denominador ≤ 12 (7/3) ou ≈ decimal.
    function numTxt(v) {
      const r = T.arred(v);
      if (Math.abs(Math.round(r * 1000) - r * 1000) < 1e-6) return T.num(r);
      for (let d = 3; d <= 12; d++) {
        const n = r * d;
        if (Math.abs(n - Math.round(n)) < 1e-7) return (n < 0 ? '−' : '') + Math.abs(Math.round(n)) + '/' + d;
      }
      return '≈ ' + T.num(r);
    }
    const ptTxt = (p) => '(' + numTxt(p.x) + ', ' + numTxt(p.y) + ')';
    function conjuntoTxt(sol) {
      const partes = sol.intervalos.map((i) => ({ x: i.a, t: (i.fechadoA ? '[' : ']') + numTxt(i.a) + ', ' + numTxt(i.b) + (i.fechadoB ? ']' : '[') }))
        .concat(sol.pontosIsolados.map((x) => ({ x, t: '{' + numTxt(x) + '}' })))
        .sort((a, b) => a.x - b.x);
      return partes.length ? partes.map((p) => p.t).join(' ∪ ') : '∅ (não há soluções)';
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-condicoes');
    el.appendChild(raiz);

    let sel = null;
    if (!enunciado) {
      const zona = criar('div', 'esq-controlos');
      raiz.appendChild(zona);
      const rot = criar('label', null, 'Condição: f(x) ');
      sel = criar('select', 'campo-numero');
      sel.style.width = 'auto';
      SINAIS.forEach((s) => {
        const o = criar('option', null, SIMBOLO[s]);
        o.value = s;
        if (s === est.sinal) o.selected = true;
        sel.appendChild(o);
      });
      rot.appendChild(sel);
      rot.appendChild(document.createTextNode(' k'));
      zona.appendChild(rot);
    }

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', enunciado ? 'img' : 'group');
    const gSolucao = ref.camada('solucao');
    const gReta = ref.camada('reta');
    const gGrafico = ref.camada('grafico');
    const gPega = enunciado ? null : ref.camada('pega');

    // gráfico (fixo)
    const ecra = (p) => ref.t.paraEcra([p.x, p.y]).map((v) => v.toFixed(2)).join(',');
    const linha = N.criarElementoSvg('polyline', { points: pontos.map(ecra).join(' ') }, gGrafico);
    linha.style.stroke = 'var(--cor-1)';
    linha.style.strokeWidth = '2.5';
    linha.style.fill = 'none';
    pontos.forEach((p) => N.desenharCirculo(ref, gGrafico, [p.x, p.y], 0.14, { cor: 'var(--cor-1)', largura: 2, preenchimento: 'var(--cor-1)' }));

    // pega da reta y = k: arrasta-se na vertical; setas ↑/↓ (Shift: passo de 0,1), PageUp/PageDown de 1 em 1
    let pega = null;
    const ouvintes = [];
    const ouvir = (alvo, tipo, fn) => { alvo.addEventListener(tipo, fn); ouvintes.push([alvo, tipo, fn]); };
    if (!enunciado) {
      pega = N.criarElementoSvg('g', {
        tabindex: '0', role: 'slider', 'aria-orientation': 'vertical',
        'aria-valuemin': String(CAIXA.ymin), 'aria-valuemax': String(CAIXA.ymax),
        style: 'cursor:ns-resize;touch-action:none;outline:none',
      }, gPega);
      N.criarElementoSvg('circle', { r: 22, style: 'fill:transparent' }, pega);
      const aro = N.criarElementoSvg('circle', { r: 13, style: 'fill:none;stroke:var(--cor-eixos);stroke-width:2;display:none' }, pega);
      N.criarElementoSvg('circle', { r: 8, style: 'fill:var(--cor-2);stroke:var(--cor-eixos);stroke-width:1' }, pega);
      const rotK = N.criarElementoSvg('text', { x: -14, y: -12, 'text-anchor': 'end', style: 'fill:var(--cor-2);font-size:13px;font-weight:600;pointer-events:none' }, pega);
      pega.rotulo = rotK;
      let aArrastar = false;
      const mundo = (ev) => {
        const m = ref.svg.getScreenCTM && ref.svg.getScreenCTM();
        if (!m) return null;
        const p = ref.svg.createSVGPoint();
        p.x = ev.clientX; p.y = ev.clientY;
        const q = p.matrixTransform(m.inverse());
        return ref.t.paraMundo([q.x, q.y]);
      };
      ouvir(pega, 'pointerdown', (ev) => {
        aArrastar = true;
        if (pega.setPointerCapture) pega.setPointerCapture(ev.pointerId);
        pega.focus();
        if (ev.preventDefault) ev.preventDefault();
      });
      ouvir(pega, 'pointermove', (ev) => {
        if (!aArrastar) return;
        const m = mundo(ev);
        if (m) definirK(Math.round(m[1] / PASSO) * PASSO);
      });
      const fim = (ev) => {
        aArrastar = false;
        if (pega.hasPointerCapture && pega.hasPointerCapture(ev.pointerId)) pega.releasePointerCapture(ev.pointerId);
      };
      ouvir(pega, 'pointerup', fim);
      ouvir(pega, 'pointercancel', fim);
      ouvir(pega, 'keydown', (ev) => {
        const p = ev.shiftKey ? 0.1 : PASSO;
        let d = 0;
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') d = p;
        else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') d = -p;
        else if (ev.key === 'PageUp') d = 1;
        else if (ev.key === 'PageDown') d = -1;
        else return;
        if (ev.preventDefault) ev.preventDefault();
        definirK(est.k + d);
      });
      ouvir(pega, 'focus', () => { aro.style.display = ''; });
      ouvir(pega, 'blur', () => { aro.style.display = 'none'; });
    }

    // legenda
    const legenda = criar('div', 'esq-legenda');
    const item = (cor, texto, tracejado) => {
      const s = criar('span');
      const t = criar('span', 'traco' + (tracejado ? ' tracejado' : ''));
      t.style.color = cor;
      s.appendChild(t);
      s.appendChild(document.createTextNode(texto));
      legenda.appendChild(s);
    };
    item('var(--cor-1)', 'gráfico de f');
    item('var(--cor-2)', 'reta y = k' + (enunciado ? '' : ' (arrasta a bola ou usa as setas)'), true);
    if (!enunciado) item('var(--cor-3)', 'conjunto-solução no eixo Ox; bola cheia: incluído; bola vazia: excluído');
    raiz.appendChild(legenda);

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const painel = N.painelValores(zonaPainel);

    function definirK(v) {
      est.k = limitarK(v);
      atualizar();
    }

    function atualizar() {
      const { k, sinal } = est;
      const cond = 'f(x) ' + SIMBOLO[sinal] + ' ' + numTxt(k);
      N.limpar(gReta);
      N.desenharSegmento(ref, gReta, [CAIXA.xmin, k], [CAIXA.xmax, k], { cor: 'var(--cor-2)', largura: 2, tracejado: true });
      const linhas = [
        ['Gráfico de f', 'segmentos que unem ' + pontos.map(ptTxt).join(', ')],
        ['Domínio', '[' + numTxt(pontos[0].x) + ', ' + numTxt(pontos[pontos.length - 1].x) + ']'],
        ['Reta', 'y = ' + numTxt(k)],
      ];
      if (enunciado) {
        ref.svg.setAttribute('aria-label', 'Gráfico de f, de domínio [' + numTxt(pontos[0].x) + ', ' + numTxt(pontos[pontos.length - 1].x) + '], formado pelos segmentos que unem ' + pontos.map(ptTxt).join(', ') + ', e reta y = ' + numTxt(k) + '.');
        painel.definir(linhas);
        return;
      }
      const sol = F.resolverCondicao(pontos, sinal, k);
      const iguais = F.resolverCondicao(pontos, '=', k);
      N.limpar(gSolucao);
      // linhas de chamada: de cada ponto com f(x) = k até ao eixo Ox
      iguais.pontosIsolados.concat(...iguais.intervalos.map((i) => [i.a, i.b])).forEach((x) => {
        if (Math.abs(k) > 1e-9) N.desenharSegmento(ref, gSolucao, [x, k], [x, 0], { cor: 'var(--cor-eixos)', largura: 1, tracejado: true });
        N.desenharCirculo(ref, gSolucao, [x, k], 0.12, { cor: 'var(--cor-2)', largura: 2, preenchimento: 'var(--cor-2)' });
      });
      const bola = (x, cheia) => N.desenharCirculo(ref, gSolucao, [x, 0], 0.17, { cor: 'var(--cor-3)', largura: 2.5, preenchimento: cheia ? 'var(--cor-3)' : 'var(--fundo)' });
      sol.intervalos.forEach((i) => {
        N.desenharSegmento(ref, gSolucao, [i.a, 0], [i.b, 0], { cor: 'var(--cor-3)', largura: 6 });
        bola(i.a, i.fechadoA);
        bola(i.b, i.fechadoB);
      });
      sol.pontosIsolados.forEach((x) => bola(x, true));

      const sp = ref.t.paraEcra([CAIXA.xmax - 0.5, k]);
      pega.setAttribute('transform', 'translate(' + sp[0] + ',' + sp[1] + ')');
      pega.rotulo.textContent = 'y = ' + numTxt(k);
      pega.setAttribute('aria-label', 'Reta y = k (arrasta na vertical ou usa as setas)');
      pega.setAttribute('aria-valuenow', String(k));
      pega.setAttribute('aria-valuetext', 'k = ' + numTxt(k));
      ref.svg.setAttribute('aria-label', 'Gráfico de f e reta y = ' + numTxt(k) + '. Solução de ' + cond + ': ' + conjuntoTxt(sol) + '.');

      const pts = iguais.pontosIsolados.map(numTxt);
      linhas.push(['f(x) = ' + numTxt(k), iguais.intervalos.length
        ? 'em ' + conjuntoTxt(iguais)
        : pts.length ? 'x = ' + pts.join(', x = ') : 'nenhum ponto (a reta não corta o gráfico)']);
      linhas.push(['Conjunto-solução de ' + cond, conjuntoTxt(sol)]);
      painel.definir(linhas);
    }

    if (sel) ouvir(sel, 'change', () => { est.sinal = sel.value; atualizar(); });
    atualizar();

    return {
      definirK,
      destruir() {
        ouvintes.forEach(([alvo, tipo, fn]) => alvo.removeEventListener(tipo, fn));
        ouvintes.length = 0;
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
