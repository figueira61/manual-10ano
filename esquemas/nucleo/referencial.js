globalThis.Manual = globalThis.Manual || {};
Manual.nucleo = Manual.nucleo || {};

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const LARGURA = 600;

  // Puro: mapeia a caixa do mundo para um ecrã (largura x altura), 1:1, centrado, y invertido.
  function transformacao(caixa, largura, altura) {
    const dx = caixa.xmax - caixa.xmin;
    const dy = caixa.ymax - caixa.ymin;
    const escala = Math.min(largura / dx, altura / dy);
    const cx = (caixa.xmin + caixa.xmax) / 2;
    const cy = (caixa.ymin + caixa.ymax) / 2;
    return {
      escala,
      paraEcra([x, y]) {
        return [largura / 2 + (x - cx) * escala, altura / 2 - (y - cy) * escala];
      },
      paraMundo([px, py]) {
        return [cx + (px - largura / 2) / escala, cy - (py - altura / 2) / escala];
      },
    };
  }

  function el(nome, atributos, pai) {
    const e = document.createElementNS(NS, nome);
    for (const k in atributos) e.setAttribute(k, atributos[k]);
    if (pai) pai.appendChild(e);
    return e;
  }

  function passoGrelha(intervalo) {
    const alvo = intervalo / 12;
    const pot = Math.pow(10, Math.floor(Math.log10(alvo)));
    for (const m of [1, 2, 5, 10]) if (m * pot >= alvo) return m * pot;
    return 10 * pot;
  }

  function multiplos(min, max, passo) {
    const r = [];
    for (let k = Math.ceil(min / passo - 1e-9); k * passo <= max + 1e-9; k++) {
      r.push(Math.round(k * passo * 1e9) / 1e9);
    }
    return r;
  }

  function criarReferencial(pai, opcoes) {
    const caixa = opcoes.caixa;
    const mostrarGrelha = opcoes.grelha !== false;
    const mostrarEixos = opcoes.eixos !== false;
    const mostrarRotulos = opcoes.rotulos !== false;
    const altura = Math.round(LARGURA * (caixa.ymax - caixa.ymin) / (caixa.xmax - caixa.xmin));
    const t = transformacao(caixa, LARGURA, altura);

    const svg = el('svg', {
      viewBox: `0 0 ${LARGURA} ${altura}`,
      width: '100%',
      role: 'group',
      class: 'referencial',
    });
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';

    const camadas = {};
    function camada(nome) {
      if (!camadas[nome]) camadas[nome] = el('g', { 'data-camada': nome }, svg);
      return camadas[nome];
    }
    camada('grelha'); camada('eixos'); camada('rotulos');

    function redesenhar() {
      for (const n of ['grelha', 'eixos', 'rotulos']) camada(n).textContent = '';
      const canto1 = t.paraMundo([0, altura]);
      const canto2 = t.paraMundo([LARGURA, 0]);
      const px = passoGrelha(canto2[0] - canto1[0]);
      const py = passoGrelha(canto2[1] - canto1[1]);
      if (mostrarGrelha) {
        for (const x of multiplos(canto1[0], canto2[0], px)) {
          const a = t.paraEcra([x, 0])[0];
          el('line', { x1: a, y1: 0, x2: a, y2: altura, style: 'stroke:var(--cor-grelha);stroke-width:1' }, camada('grelha'));
        }
        for (const y of multiplos(canto1[1], canto2[1], py)) {
          const b = t.paraEcra([0, y])[1];
          el('line', { x1: 0, y1: b, x2: LARGURA, y2: b, style: 'stroke:var(--cor-grelha);stroke-width:1' }, camada('grelha'));
        }
      }
      const [ox, oy] = t.paraEcra([0, 0]);
      if (mostrarEixos) {
        const estilo = 'stroke:var(--cor-eixos);stroke-width:1.5';
        if (canto1[1] <= 0 && canto2[1] >= 0) el('line', { x1: 0, y1: oy, x2: LARGURA, y2: oy, style: estilo }, camada('eixos'));
        if (canto1[0] <= 0 && canto2[0] >= 0) el('line', { x1: ox, y1: 0, x2: ox, y2: altura, style: estilo }, camada('eixos'));
      }
      if (mostrarRotulos) {
        const ey = Math.min(Math.max(oy, 0), altura - 14) + 13;
        const ex = Math.min(Math.max(ox, 0), LARGURA - 30) - 4;
        const estilo = 'fill:var(--cor-eixos);font-size:11px';
        for (const x of multiplos(canto1[0], canto2[0], px)) {
          if (Math.abs(x) < 1e-9) continue;
          const a = t.paraEcra([x, 0])[0];
          const tx = el('text', { x: a, y: ey, 'text-anchor': 'middle', style: estilo }, camada('rotulos'));
          tx.textContent = x.toLocaleString('pt-PT');
        }
        for (const y of multiplos(canto1[1], canto2[1], py)) {
          if (Math.abs(y) < 1e-9) continue;
          const b = t.paraEcra([0, y])[1];
          const tx = el('text', { x: ex, y: b + 4, 'text-anchor': ex < 40 ? 'start' : 'end', style: estilo }, camada('rotulos'));
          tx.textContent = y.toLocaleString('pt-PT');
        }
      }
    }

    redesenhar();
    pai.appendChild(svg);

    return {
      svg,
      t,
      caixa,
      camada,
      redesenhar,
      destruir() { if (svg.parentNode) svg.parentNode.removeChild(svg); },
    };
  }

  Manual.nucleo.transformacao = transformacao;
  Manual.nucleo.criarReferencial = criarReferencial;
  Manual.nucleo.criarElementoSvg = el;
})();
