globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('histograma', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const E = Manual.calc.estatistica;
    opcoes = opcoes || {};
    const PASSO = 0.5;
    const fmt = (v, d) => (Math.round(v * 1e9) / 1e9 + 0).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 2 : d });
    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }

    let dados = (Array.isArray(opcoes.dados) ? opcoes.dados : []).map(Number).filter(Number.isFinite);
    if (dados.length < 2) dados = [12, 15, 17, 18, 21, 22, 22, 24, 25, 27, 28, 31, 33, 34, 38, 41, 45, 47];
    const minimo = Math.min(...dados);
    const intervalo = Math.max(...dados) - minimo;
    // Evita centenas de classes: pelo menos intervalo/20 (arredondado ao passo).
    const ampMin = Math.max(PASSO, Math.ceil(intervalo / 20 / PASSO) * PASSO);
    const ampMax = Math.max(ampMin, Math.ceil(intervalo / PASSO) * PASSO);
    let amp = Number(opcoes.amplitudeClasse);
    if (!(amp > 0)) amp = Math.max(ampMin, Math.round(intervalo / 5 / PASSO) * PASSO);
    amp = Math.min(Math.max(Math.round(amp / PASSO) * PASSO, ampMin), ampMax);

    el.textContent = '';
    const raiz = criar('div', 'esq-histograma');
    el.appendChild(raiz);
    raiz.appendChild(criar('p', null, 'Dados (' + dados.length + '): ' + dados.slice().sort((a, b) => a - b).map((v) => fmt(v)).join('; ')));

    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const slider = N.slider(zonaSlider, {
      rotulo: 'Amplitude de classe', min: ampMin, max: ampMax, passo: PASSO, valor: amp,
      aoMudar(v) { amp = v; atualizar(); },
    });
    const zonaGrafico = criar('div');
    raiz.appendChild(zonaGrafico);
    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const zonaTabela = criar('div', 'quadro-envolvente');
    raiz.appendChild(zonaTabela);
    raiz.appendChild(criar('p', null,
      'Todas as classes têm a mesma amplitude, por isso a área de cada retângulo é proporcional à frequência da classe. Cada classe é [a, b[ ; a última inclui o máximo.'));

    let ref = null;
    function atualizar() {
      if (ref) ref.destruir();
      const cls = E.classes(dados, amp);
      const n = dados.length;
      const fmax = Math.max(...cls.map((c) => c.absoluta), 1);
      const inicio = cls[0].de, fim = cls[cls.length - 1].ate;
      const folga = amp * 0.4;
      const dx = fim - inicio + 2 * folga;
      const H = dx * 0.4; // altura (em unidades de desenho) da barra mais alta
      ref = N.criarReferencial(zonaGrafico, {
        caixa: { xmin: inicio - folga, xmax: fim + folga, ymin: -0.22 * H, ymax: 1.18 * H },
        grelha: false, eixos: false, rotulos: false,
      });
      ref.svg.setAttribute('aria-label', 'Histograma com ' + cls.length + ' classes de amplitude ' + fmt(amp));
      const g = ref.camada('desenho');
      const eco = (P) => ref.t.paraEcra(P);
      cls.forEach((c) => {
        const h = (c.absoluta / fmax) * H;
        const a = eco([c.de, h]), b = eco([c.ate, 0]);
        N.criarElementoSvg('rect', {
          x: a[0], y: a[1], width: Math.max(b[0] - a[0], 0), height: Math.max(b[1] - a[1], 0),
          style: 'fill:var(--cor-1);fill-opacity:0.55;stroke:var(--cor-eixos);stroke-width:1.5',
        }, g);
        const t = N.criarElementoSvg('text', {
          x: (a[0] + b[0]) / 2, y: a[1] - 4, 'text-anchor': 'middle',
          style: 'fill:var(--cor-eixos);font-size:12px;font-weight:600',
        }, g);
        t.textContent = String(c.absoluta);
        {
          const e = N.criarElementoSvg('text', {
            x: a[0], y: b[1] + 15, 'text-anchor': 'middle', style: 'fill:var(--cor-eixos);font-size:11px',
          }, g);
          e.textContent = fmt(c.de);
        }
      });
      const ult = eco([fim, 0]);
      N.criarElementoSvg('text', { x: ult[0], y: ult[1] + 15, 'text-anchor': 'middle', style: 'fill:var(--cor-eixos);font-size:11px' }, g)
        .textContent = fmt(fim);
      const p0 = eco([inicio - folga, 0]), p1 = eco([fim + folga, 0]);
      N.criarElementoSvg('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], style: 'stroke:var(--cor-eixos);stroke-width:1.5' }, g);

      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir([
        ['Número de classes', String(cls.length)],
        ['Amplitude de classe', fmt(amp)],
        ['Frequência máxima', String(fmax)],
        ['Média (dados agrupados)', fmt(E.mediaAgrupada(cls))],
        ['Desvio padrão (dados agrupados)', fmt(E.desvioPadraoAgrupado(cls))],
      ]);

      zonaTabela.textContent = '';
      let acum = 0;
      const linhas = cls.map((c) => {
        acum += c.absoluta;
        return [
          '[' + fmt(c.de) + ', ' + fmt(c.ate) + (c === cls[cls.length - 1] ? ']' : '['),
          String(c.absoluta), String(acum),
          fmt(c.absoluta / n, 3), fmt(acum / n, 3),
        ];
      });
      const tab = criar('div');
      N.tabela(tab, ['Classe', 'Freq. absoluta', 'Freq. absoluta acumulada', 'Freq. relativa', 'Freq. relativa acumulada'], linhas);
      const t = tab.firstChild;
      t.setAttribute('aria-label', 'Tabela de frequências por classe');
      zonaTabela.appendChild(t);
    }
    atualizar();

    return {
      destruir() {
        slider.destruir();
        if (ref) ref.destruir();
        el.textContent = '';
      },
    };
  },
});
