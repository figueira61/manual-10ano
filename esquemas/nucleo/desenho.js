globalThis.Manual = globalThis.Manual || {};
Manual.nucleo = Manual.nucleo || {};

(function () {
  // Puro: parte o traçado em segmentos quando y não é finito ou há salto grande.
  // limites opcional: { ymin, ymax }; sem ele usa o intervalo observado dos y finitos.
  function amostrarFuncao(f, xmin, xmax, n = 400, limites) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = xmin + ((xmax - xmin) * i) / n;
      pts.push([x, f(x)]);
    }
    let ymin, ymax;
    if (limites && Number.isFinite(limites.ymin) && Number.isFinite(limites.ymax)) {
      ymin = limites.ymin; ymax = limites.ymax;
    } else {
      ymin = Infinity; ymax = -Infinity;
      for (const p of pts) {
        if (Number.isFinite(p[1])) { if (p[1] < ymin) ymin = p[1]; if (p[1] > ymax) ymax = p[1]; }
      }
    }
    const salto = 50 * (ymax - ymin) / n;
    const segmentos = [];
    let atual = [];
    let anterior = null;
    for (const p of pts) {
      if (!Number.isFinite(p[1])) {
        if (atual.length) segmentos.push(atual);
        atual = []; anterior = null;
        continue;
      }
      if (anterior && Math.abs(p[1] - anterior[1]) > salto) {
        if (atual.length) segmentos.push(atual);
        atual = [];
      }
      atual.push(p);
      anterior = p;
    }
    if (atual.length) segmentos.push(atual);
    return segmentos;
  }

  const N = Manual.nucleo;

  function aplicarEstilo(e, estilo) {
    estilo = estilo || {};
    e.style.stroke = estilo.cor || 'var(--cor-1)';
    e.style.strokeWidth = String(estilo.largura || 2);
    e.style.fill = estilo.preenchimento || 'none';
    if (estilo.tracejado) e.setAttribute('stroke-dasharray', '6 4');
    return e;
  }

  function desenharFuncao(ref, camada, f, opcoes) {
    const cor = (opcoes && opcoes.cor) || 'var(--cor-1)';
    const vb = ref.svg.viewBox.baseVal;
    const c = ref.t.paraMundo([0, vb.height]);
    const d = ref.t.paraMundo([vb.width, 0]);
    const segs = amostrarFuncao(f, c[0], d[0], 400, { ymin: c[1], ymax: d[1] });
    for (const seg of segs) {
      if (seg.length < 2) continue;
      const pontos = seg.map((p) => ref.t.paraEcra(p).map((v) => v.toFixed(2)).join(',')).join(' ');
      aplicarEstilo(N.criarElementoSvg('polyline', { points: pontos }, camada), { cor });
    }
  }

  function desenharSegmento(ref, camada, A, B, estilo) {
    const p = ref.t.paraEcra(A);
    const q = ref.t.paraEcra(B);
    return aplicarEstilo(N.criarElementoSvg('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, camada), estilo);
  }

  function desenharCirculo(ref, camada, centro, raio, estilo) {
    const c = ref.t.paraEcra(centro);
    return aplicarEstilo(N.criarElementoSvg('circle', { cx: c[0], cy: c[1], r: raio * ref.t.escala }, camada), estilo);
  }

  function desenharTexto(ref, camada, P, texto) {
    const p = ref.t.paraEcra(P);
    const e = N.criarElementoSvg('text', { x: p[0], y: p[1], style: 'fill:var(--cor-eixos);font-size:13px' }, camada);
    e.textContent = texto;
    return e;
  }

  function desenharVetor(ref, camada, origem, v, opcoes) {
    opcoes = opcoes || {};
    const cor = opcoes.cor || 'var(--cor-2)';
    const [x1, y1] = ref.t.paraEcra(origem);
    const [x2, y2] = ref.t.paraEcra([origem[0] + v[0], origem[1] + v[1]]);
    const g = N.criarElementoSvg('g', {}, camada);
    N.criarElementoSvg('line', { x1, y1, x2, y2, style: 'stroke:' + cor + ';stroke-width:2.5' }, g);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const s = 10;
    const pa = [x2 - s * Math.cos(ang - 0.4), y2 - s * Math.sin(ang - 0.4)];
    const pb = [x2 - s * Math.cos(ang + 0.4), y2 - s * Math.sin(ang + 0.4)];
    N.criarElementoSvg('polygon', { points: x2 + ',' + y2 + ' ' + pa.join(',') + ' ' + pb.join(','), style: 'fill:' + cor }, g);
    if (opcoes.rotulo) {
      const tx = N.criarElementoSvg('text', { x: (x1 + x2) / 2 + 6, y: (y1 + y2) / 2 - 6, style: 'fill:' + cor + ';font-size:13px' }, g);
      tx.textContent = opcoes.rotulo;
    }
    return g;
  }

  function limpar(camada) { camada.textContent = ''; }

  N.amostrarFuncao = amostrarFuncao;
  N.desenharFuncao = desenharFuncao;
  N.desenharVetor = desenharVetor;
  N.desenharSegmento = desenharSegmento;
  N.desenharCirculo = desenharCirculo;
  N.desenharTexto = desenharTexto;
  N.limpar = limpar;
})();
