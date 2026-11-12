globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { P, v, raio, mostrar } — ponto, reta, esfera e planos no espaço (projeção ortográfica, rotação interativa).
Manual.esquemas.registar('espaco3d', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const G = Manual.calc.geometria;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const L = 640, ALT = 420, ESC = 30, ALCANCE = 6;
    const PASSO = Math.PI / 12;
    const ELEV_MAX = 1.5;

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function vetor3(p, omissao) {
      const ok = Array.isArray(p) && p.length === 3 && p.every((x) => Number.isFinite(Number(x)));
      return (ok ? p.map(Number) : omissao).map((x) => Math.min(Math.max(Math.round(x * 2) / 2, -ALCANCE), ALCANCE));
    }
    const num = T.num;
    const trio = (p) => '(' + num(p[0]) + ' ; ' + num(p[1]) + ' ; ' + num(p[2]) + ')';
    const MOSTRAR = ['ponto', 'reta', 'esfera', 'planos'];
    const r0 = Number(opcoes.raio);

    const est = {
      P: vetor3(opcoes.P, [1, 2, 3]),
      v: vetor3(opcoes.v, [2, 1, 1]),
      raio: Number.isFinite(r0) && r0 > 0 ? Math.min(r0, ALCANCE) : 2,
      mostrar: new Set((Array.isArray(opcoes.mostrar) ? opcoes.mostrar : ['ponto', 'reta']).filter((m) => MOSTRAR.includes(m))),
      lambda: 1,
      azimute: -0.6,
      elevacao: 0.5,
    };
    if (G.norma(est.v) < 1e-9) est.v = [1, 0, 0];

    el.textContent = '';
    const raiz = criar('div', 'esq-espaco3d');
    el.appendChild(raiz);

    const zonaMostrar = criar('div', 'esq-controlos');
    raiz.appendChild(zonaMostrar);
    const NOMES = { ponto: 'Ponto', reta: 'Reta', esfera: 'Esfera', planos: 'Planos' };
    const caixas = MOSTRAR.map((m) => {
      const lab = criar('label');
      const cb = criar('input');
      cb.type = 'checkbox';
      cb.checked = est.mostrar.has(m);
      cb.addEventListener('change', () => {
        if (cb.checked) est.mostrar.add(m); else est.mostrar.delete(m);
        atualizar();
      });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(' ' + NOMES[m]));
      zonaMostrar.appendChild(lab);
      return cb;
    });

    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const sliderL = N.slider(zonaSlider, { rotulo: 'λ', min: -3, max: 3, passo: 0.5, valor: est.lambda, aoMudar: (x) => { est.lambda = x; atualizar(); } });

    const svg = N.criarElementoSvg('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'referencial espaco3d-svg' }, raiz);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    // Só o gesto horizontal roda; o gesto vertical continua a deslocar a página (rato/caneta rodam nos dois eixos).
    svg.style.touchAction = 'pan-y';
    svg.style.cursor = 'grab';
    const gPlanos = N.criarElementoSvg('g', {}, svg);
    const gEixos = N.criarElementoSvg('g', {}, svg);
    const gObjetos = N.criarElementoSvg('g', {}, svg);

    const barra = criar('div', 'esq-controlos');
    raiz.appendChild(barra);
    const mkBotao = (txt, rotulo, fn) => {
      const b = criar('button', 'botao', txt);
      b.type = 'button';
      b.setAttribute('aria-label', rotulo);
      b.addEventListener('click', fn);
      barra.appendChild(b);
      return b;
    };
    const rodar = (da, de) => {
      est.azimute += da;
      est.elevacao = Math.min(Math.max(est.elevacao + de, -ELEV_MAX), ELEV_MAX);
      atualizar();
    };
    mkBotao('◀', 'Rodar para a esquerda', () => rodar(-PASSO, 0));
    mkBotao('▶', 'Rodar para a direita', () => rodar(PASSO, 0));
    mkBotao('▲', 'Inclinar para cima', () => rodar(0, PASSO));
    mkBotao('▼', 'Inclinar para baixo', () => rodar(0, -PASSO));
    mkBotao('Repor vista', 'Repor a vista inicial', () => { est.azimute = -0.6; est.elevacao = 0.5; atualizar(); });
    barra.appendChild(criar('span', 'esq-legenda', 'Arrasta o desenho ou usa as setas do teclado para rodar.'));

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const painel = N.painelValores(zonaPainel);

    // --- projeção ---
    const proj = (p) => {
      const q = N.projetar(p, { azimute: est.azimute, elevacao: est.elevacao });
      return [L / 2 + q[0] * ESC, ALT / 2 - q[1] * ESC];
    };
    const f2 = (x) => x.toFixed(1);
    const linha = (pai, A, B, estilo, extra) => {
      const a = proj(A), b = proj(B);
      return N.criarElementoSvg('line', Object.assign({ x1: f2(a[0]), y1: f2(a[1]), x2: f2(b[0]), y2: f2(b[1]), style: estilo }, extra || {}), pai);
    };
    const texto = (pai, p, t, cor, dx, dy) => {
      const a = proj(p);
      const e = N.criarElementoSvg('text', { x: f2(a[0] + (dx || 6)), y: f2(a[1] + (dy || -6)), style: 'fill:' + cor + ';font-size:13px;font-weight:600;pointer-events:none' }, pai);
      e.textContent = t;
      return e;
    };
    const bolinha = (pai, p, cor, r) => {
      const a = proj(p);
      return N.criarElementoSvg('circle', { cx: f2(a[0]), cy: f2(a[1]), r: r || 4.5, style: 'fill:' + cor + ';stroke:var(--cor-eixos);stroke-width:1' }, pai);
    };

    function atualizar() {
      gPlanos.textContent = '';
      gEixos.textContent = '';
      gObjetos.textContent = '';
      const { P, v, raio, lambda } = est;
      const on = (m) => est.mostrar.has(m);
      svg.setAttribute('aria-label', 'Eixos coordenados no espaço, vista com azimute ' + Math.round(est.azimute * 180 / Math.PI) + '° e elevação ' + Math.round(est.elevacao * 180 / Math.PI) + '°.');

      // planos x = a, y = b, z = c (a azul, b laranja, c verde), por trás do resto
      if (on('planos')) {
        const R = 5;
        const defs = [
          { cor: 'var(--cor-1)', cantos: [[P[0], -R, -R], [P[0], R, -R], [P[0], R, R], [P[0], -R, R]], rot: 'x = ' + num(P[0]), rp: [P[0], R, R] },
          { cor: 'var(--cor-2)', cantos: [[-R, P[1], -R], [R, P[1], -R], [R, P[1], R], [-R, P[1], R]], rot: 'y = ' + num(P[1]), rp: [R, P[1], R] },
          { cor: 'var(--cor-3)', cantos: [[-R, -R, P[2]], [R, -R, P[2]], [R, R, P[2]], [-R, R, P[2]]], rot: 'z = ' + num(P[2]), rp: [R, R, P[2]] },
        ];
        defs.forEach((d) => {
          const pts = d.cantos.map((c) => proj(c).map(f2).join(',')).join(' ');
          N.criarElementoSvg('polygon', { points: pts, style: 'fill:' + d.cor + ';fill-opacity:0.14;stroke:' + d.cor + ';stroke-width:1.2' }, gPlanos);
          texto(gPlanos, d.rp, d.rot, d.cor, -4, -4);
        });
      }

      // eixos
      const EX = 'stroke:var(--cor-eixos);stroke-width:1.6';
      const tenue = 'stroke:var(--cor-eixos);stroke-width:1;stroke-dasharray:3 4;opacity:0.7';
      ['x', 'y', 'z'].forEach((nome, i) => {
        const neg = [0, 0, 0], pos = [0, 0, 0];
        neg[i] = -ALCANCE; pos[i] = ALCANCE;
        linha(gEixos, neg, [0, 0, 0], tenue);
        linha(gEixos, [0, 0, 0], pos, EX);
        const t = texto(gEixos, pos, nome, 'var(--cor-eixos)', 6, 4);
        t.style.fontSize = '15px';
        for (let k = 1; k <= ALCANCE; k++) {
          const q = [0, 0, 0]; q[i] = k;
          const a = proj(q);
          N.criarElementoSvg('circle', { cx: f2(a[0]), cy: f2(a[1]), r: 1.6, style: 'fill:var(--cor-eixos)' }, gEixos);
        }
      });
      texto(gEixos, [0, 0, 0], 'O', 'var(--cor-eixos)', -12, 14);

      const linhas = [];

      if (on('esfera')) {
        const c = proj(P);
        N.criarElementoSvg('circle', { cx: f2(c[0]), cy: f2(c[1]), r: f2(raio * ESC), style: 'fill:var(--cor-4);fill-opacity:0.10;stroke:var(--cor-4);stroke-width:2' }, gObjetos);
        bolinha(gObjetos, P, 'var(--cor-4)', 3.5);
        linhas.push(['Superfície esférica', T.fator('x', P[0]) + ' + ' + T.fator('y', P[1]) + ' + ' + T.fator('z', P[2]) + ' = ' + num(raio * raio)]);
        linhas.push(['Centro e raio', 'P' + trio(P) + ' · r = ' + num(raio)]);
      }

      if (on('ponto')) {
        const pes = [[P[0], P[1], 0], [0, P[1], P[2]], [P[0], 0, P[2]]];
        const cores = ['var(--cor-3)', 'var(--cor-1)', 'var(--cor-2)'];
        pes.forEach((f, i) => {
          linha(gObjetos, P, f, 'stroke:' + cores[i] + ';stroke-width:1.5;stroke-dasharray:5 4');
          bolinha(gObjetos, f, cores[i], 3);
        });
        bolinha(gObjetos, P, 'var(--cor-5)', 6);
        texto(gObjetos, P, 'P', 'var(--cor-5)', 8, -8);
        linhas.push(['Ponto', 'P' + trio(P)]);
        linhas.push(['Projeções', 'em xOy: (' + num(P[0]) + ' ; ' + num(P[1]) + ' ; 0) · em yOz: (0 ; ' + num(P[1]) + ' ; ' + num(P[2]) + ') · em xOz: (' + num(P[0]) + ' ; 0 ; ' + num(P[2]) + ')']);
      }

      if (on('reta')) {
        const a = G.retaVetorial(P, v, -6), b = G.retaVetorial(P, v, 6);
        linha(gObjetos, a, b, 'stroke:var(--cor-2);stroke-width:2.5');
        const Q = G.retaVetorial(P, v, lambda);
        linha(gObjetos, P, G.pontoMaisVetor(P, v), 'stroke:var(--cor-5);stroke-width:3');
        bolinha(gObjetos, Q, 'var(--cor-2)', 5.5);
        texto(gObjetos, Q, 'Q', 'var(--cor-2)', 8, -8);
        if (!on('ponto')) { bolinha(gObjetos, P, 'var(--cor-5)', 4.5); texto(gObjetos, P, 'P', 'var(--cor-5)', 8, -8); }
        linhas.push(['Equação vetorial', '(x ; y ; z) = ' + trio(P) + ' + λ' + trio(v)]);
        linhas.push(['Ponto para λ = ' + num(lambda), 'Q = ' + trio(P) + ' + ' + (lambda < 0 ? '(' + num(lambda) + ')' : num(lambda)) + ' × ' + trio(v) + ' = ' + trio(Q)]);
      }

      zonaSlider.style.display = on('reta') ? '' : 'none';
      if (!linhas.length) linhas.push(['Nada para mostrar', 'Liga uma das caixas acima.']);
      painel.definir(linhas);
    }

    // --- rotação por arrasto (rato, caneta e toque) ---
    let arrasto = null;
    const aoPremir = (ev) => {
      arrasto = { x: ev.clientX, y: ev.clientY, toque: ev.pointerType === 'touch' };
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sem captura */ }
      svg.style.cursor = 'grabbing';
      svg.focus({ preventScroll: true });
    };
    const aoMover = (ev) => {
      if (!arrasto) return;
      const caixa = svg.getBoundingClientRect();
      const k = caixa.width > 0 ? L / caixa.width : 1;
      const dx = (ev.clientX - arrasto.x) * k, dy = (ev.clientY - arrasto.y) * k;
      arrasto.x = ev.clientX; arrasto.y = ev.clientY;
      rodar(dx * 0.01, arrasto.toque ? 0 : dy * 0.01);
    };
    const aoSoltar = (ev) => {
      arrasto = null;
      svg.style.cursor = 'grab';
      try { if (svg.hasPointerCapture(ev.pointerId)) svg.releasePointerCapture(ev.pointerId); } catch (e) { /* ok */ }
    };
    const aoTecla = (ev) => {
      const m = { ArrowLeft: [-PASSO, 0], ArrowRight: [PASSO, 0], ArrowUp: [0, PASSO], ArrowDown: [0, -PASSO] }[ev.key];
      if (!m) return;
      ev.preventDefault();
      rodar(m[0], m[1]);
    };
    svg.addEventListener('pointerdown', aoPremir);
    svg.addEventListener('pointermove', aoMover);
    svg.addEventListener('pointerup', aoSoltar);
    svg.addEventListener('pointercancel', aoSoltar);
    svg.addEventListener('keydown', aoTecla);

    atualizar();

    return {
      destruir() {
        svg.removeEventListener('pointerdown', aoPremir);
        svg.removeEventListener('pointermove', aoMover);
        svg.removeEventListener('pointerup', aoSoltar);
        svg.removeEventListener('pointercancel', aoSoltar);
        svg.removeEventListener('keydown', aoTecla);
        sliderL.destruir();
        el.textContent = '';
      },
    };
  },
});
