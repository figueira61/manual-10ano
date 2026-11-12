globalThis.Manual = globalThis.Manual || {};
Manual.nucleo = Manual.nucleo || {};

(function () {
  const N = Manual.nucleo;
  // Puro: remove ruído de vírgula flutuante (0.1+0.2).
  const arredondar = (v) => Math.round(v * 1e9) / 1e9;
  const fmt = (v) => (Math.round(v * 100) / 100).toLocaleString('pt-PT');

  function pontoArrastavel(ref, opcoes) {
    const cor = opcoes.cor || 'var(--cor-1)';
    const rotulo = opcoes.rotulo || 'Ponto';
    const passo = opcoes.passo || 0.5;
    const aoMover = opcoes.aoMover;
    const restringir = opcoes.restringir;

    const g = N.criarElementoSvg('g', {
      tabindex: '0',
      role: 'slider',
      style: 'cursor:grab;touch-action:none;outline:none',
    }, ref.camada('pontos'));
    // área de toque generosa (invisível)
    N.criarElementoSvg('circle', { r: 22, style: 'fill:transparent' }, g);
    const aro = N.criarElementoSvg('circle', { r: 12, style: 'fill:none;stroke:var(--cor-eixos);stroke-width:2;display:none' }, g);
    N.criarElementoSvg('circle', { r: 7, style: 'fill:' + cor + ';stroke:var(--cor-eixos);stroke-width:1' }, g);
    const texto = N.criarElementoSvg('text', { x: 11, y: -11, style: 'fill:' + cor + ';font-size:13px;font-weight:600;pointer-events:none' }, g);

    let px = opcoes.x, py = opcoes.y;

    function aplicar() {
      const s = ref.t.paraEcra([px, py]);
      g.setAttribute('transform', 'translate(' + s[0] + ',' + s[1] + ')');
      texto.textContent = rotulo;
      g.setAttribute('aria-label', rotulo + ' (' + fmt(px) + '; ' + fmt(py) + ')');
      g.setAttribute('aria-valuenow', String(px));
      g.setAttribute('aria-valuemin', String(ref.caixa.xmin));
      g.setAttribute('aria-valuemax', String(ref.caixa.xmax));
      g.setAttribute('aria-valuetext', fmt(px) + '; ' + fmt(py));
    }

    function definir(nx, ny, notificar) {
      if (restringir) {
        const r = restringir(nx, ny); nx = r[0]; ny = r[1];
      } else {
        const c = ref.caixa;
        nx = Math.min(Math.max(nx, c.xmin), c.xmax);
        ny = Math.min(Math.max(ny, c.ymin), c.ymax);
      }
      px = arredondar(nx); py = arredondar(ny);
      aplicar();
      if (notificar && aoMover) aoMover(px, py);
    }

    function mundoDoEvento(ev) {
      const m = ref.svg.getScreenCTM();
      if (!m) return null;
      const p = ref.svg.createSVGPoint();
      p.x = ev.clientX; p.y = ev.clientY;
      const q = p.matrixTransform(m.inverse());
      return ref.t.paraMundo([q.x, q.y]);
    }

    let aArrastar = false;
    g.addEventListener('pointerdown', (ev) => {
      aArrastar = true;
      g.setPointerCapture(ev.pointerId);
      g.style.cursor = 'grabbing';
      g.focus();
      ev.preventDefault();
    });
    g.addEventListener('pointermove', (ev) => {
      if (!aArrastar) return;
      const m = mundoDoEvento(ev);
      if (!m) return;
      definir(Math.round(m[0] / passo) * passo, Math.round(m[1] / passo) * passo, true);
    });
    const fim = (ev) => {
      aArrastar = false;
      g.style.cursor = 'grab';
      if (g.hasPointerCapture(ev.pointerId)) g.releasePointerCapture(ev.pointerId);
    };
    g.addEventListener('pointerup', fim);
    g.addEventListener('pointercancel', fim);

    g.addEventListener('keydown', (ev) => {
      const p = ev.shiftKey ? passo * 0.2 : passo;
      let dx = 0, dy = 0;
      if (ev.key === 'ArrowRight') dx = p;
      else if (ev.key === 'ArrowLeft') dx = -p;
      else if (ev.key === 'ArrowUp') dy = p;
      else if (ev.key === 'ArrowDown') dy = -p;
      else return;
      ev.preventDefault();
      definir(px + dx, py + dy, true);
    });
    g.addEventListener('focus', () => { aro.style.display = ''; });
    g.addEventListener('blur', () => { aro.style.display = 'none'; });

    definir(px, py, false);
    return {
      x: () => px,
      y: () => py,
      definir: (nx, ny) => definir(nx, ny, true),
      destruir() { if (g.parentNode) g.parentNode.removeChild(g); },
    };
  }

  N.arredondar = arredondar;
  N.pontoArrastavel = pontoArrastavel;
})();
