globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes.taxa é a taxa anual em percentagem (4 = 4 %).
Manual.esquemas.registar('juros', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const C = Manual.calc.cidadania;
    opcoes = opcoes || {};
    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });
    const eur = (v) => fmt(v) + ' €';

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function limitar(v, min, max, omissao) {
      const x = Number(v);
      return Number.isFinite(x) ? Math.min(Math.max(x, min), max) : omissao;
    }

    const est = {
      capital: Math.round(limitar(opcoes.capital, 100, 100000, 1000) / 100) * 100,
      taxa: limitar(opcoes.taxa, 0, 20, 4),
      anos: Math.round(limitar(opcoes.anos, 1, 30, 10)),
      periodos: Math.round(limitar(opcoes.periodosPorAno, 1, 12, 4)),
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-juros');
    el.appendChild(raiz);
    const zonaSliders = criar('div');
    raiz.appendChild(zonaSliders);
    const sliders = [
      N.slider(zonaSliders, { rotulo: 'Capital inicial (€)', min: 100, max: Math.max(10000, est.capital), passo: 100, valor: est.capital, aoMudar: (v) => { est.capital = v; atualizar(); } }),
      N.slider(zonaSliders, { rotulo: 'Taxa anual (%)', min: 0, max: 20, passo: 0.5, valor: est.taxa, aoMudar: (v) => { est.taxa = v; atualizar(); } }),
      N.slider(zonaSliders, { rotulo: 'Duração (anos)', min: 1, max: 30, passo: 1, valor: est.anos, aoMudar: (v) => { est.anos = Math.round(v); atualizar(); } }),
      N.slider(zonaSliders, { rotulo: 'Períodos de capitalização por ano', min: 1, max: 12, passo: 1, valor: est.periodos, aoMudar: (v) => { est.periodos = Math.max(1, Math.round(v)); atualizar(); } }),
    ];

    // ---------- gráfico (coordenadas normalizadas: x em 0..10, y em 0..6) ----------
    const ref = N.criarReferencial(raiz, {
      caixa: { xmin: -2.5, xmax: 10.6, ymin: -1.7, ymax: 6.9 },
      grelha: false, eixos: false, rotulos: false,
    });
    ref.svg.setAttribute('role', 'img');
    ref.svg.setAttribute('aria-label', 'Gráfico do montante ao longo do tempo: juros simples (reta) e compostos (degraus).');
    const camada = ref.camada('juros');

    const legenda = criar('div', 'esq-legenda');
    const l1 = criar('span');
    const t1 = criar('span', 'traco tracejado');
    t1.style.color = 'var(--cor-2)';
    l1.appendChild(t1);
    l1.appendChild(document.createTextNode('Juros simples (linear)'));
    const l2 = criar('span');
    const t2 = criar('span', 'traco');
    t2.style.color = 'var(--cor-1)';
    l2.appendChild(t2);
    l2.appendChild(document.createTextNode('Juros compostos (degraus por período)'));
    legenda.appendChild(l1);
    legenda.appendChild(l2);
    raiz.appendChild(legenda);

    const zonaValores = criar('div');
    zonaValores.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaValores);

    function texto(P, s, ancora) {
      const t = N.desenharTexto(ref, camada, P, s);
      if (ancora) t.setAttribute('text-anchor', ancora);
      t.style.fontSize = '17px';
      return t;
    }

    function atualizar() {
      const taxa = est.taxa / 100;
      const simples = C.jurosSimples(est.capital, taxa, est.anos);
      const comp = C.jurosCompostos(est.capital, taxa, est.anos, est.periodos);
      const maxReal = Math.max(simples.montante, comp.montante, est.capital, 1);
      // eixo y com passo "redondo" (1, 2, 5 × 10^k)
      const bruto = maxReal / 4;
      const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
      const passoY = [1, 2, 5, 10].map((m) => m * pot).find((v) => v >= bruto);
      const nTicks = Math.ceil(maxReal / passoY - 1e-9);
      const ymax = nTicks * passoY;
      const X = (anos) => (anos / est.anos) * 10;
      const Y = (m) => (m / ymax) * 6;
      const ecra = (anos, m) => ref.t.paraEcra([X(anos), Y(m)]).map((v) => v.toFixed(2)).join(',');

      N.limpar(camada);
      // grelha, eixos e rótulos
      const passoAnos = Math.max(1, Math.ceil(est.anos / 6));
      for (let a = 0; a <= est.anos; a += passoAnos) {
        N.desenharSegmento(ref, camada, [X(a), 0], [X(a), 6], { cor: 'var(--cor-grelha)', largura: 1 });
        texto([X(a), -0.6], String(a), 'middle');
      }
      for (let i = 0; i <= nTicks; i++) {
        const v = passoY * i;
        N.desenharSegmento(ref, camada, [0, Y(v)], [10, Y(v)], { cor: 'var(--cor-grelha)', largura: 1 });
        texto([-0.15, Y(v) - 0.1], fmt(v), 'end');
      }
      N.desenharSegmento(ref, camada, [0, 0], [10, 0], { cor: 'var(--cor-eixos)', largura: 1.5 });
      N.desenharSegmento(ref, camada, [0, 0], [0, 6], { cor: 'var(--cor-eixos)', largura: 1.5 });
      texto([5, -1.3], 'Tempo (anos)', 'middle');
      texto([-2.4, 6.6], 'Montante (€)', 'start');

      // simples: reta
      const sPts = ecra(0, est.capital) + ' ' + ecra(est.anos, simples.montante);
      const sPol = N.criarElementoSvg('polyline', { points: sPts, fill: 'none', 'stroke-dasharray': '7 5' }, camada);
      sPol.style.stroke = 'var(--cor-2)';
      sPol.style.strokeWidth = '3';
      // composto: degraus
      const pts = [ecra(0, est.capital)];
      let anterior = est.capital;
      comp.passos.forEach((p) => {
        const t = p.periodo / est.periodos;
        pts.push(ecra(t, anterior));
        pts.push(ecra(t, p.montante));
        anterior = p.montante;
      });
      const cPol = N.criarElementoSvg('polyline', { points: pts.join(' '), fill: 'none' }, camada);
      cPol.style.stroke = 'var(--cor-1)';
      cPol.style.strokeWidth = '2.5';

      zonaValores.textContent = '';
      const painelEl = criar('div');
      zonaValores.appendChild(painelEl);
      const r = fmt(taxa);
      N.painelValores(painelEl).definir([
        ['Simples: fórmula', 'M = C·(1 + r·t)'],
        ['Simples: substituição', 'M = ' + fmt(est.capital) + '·(1 + ' + r + '·' + est.anos + ') = ' + eur(simples.montante)],
        ['Simples: juro', eur(simples.juro)],
        ['Composto: fórmula', 'M = C·(1 + r/n)^(n·t)'],
        ['Composto: substituição', 'M = ' + fmt(est.capital) + '·(1 + ' + r + '/' + est.periodos + ')^(' + est.periodos + '·' + est.anos + ') = ' + eur(comp.montante)],
        ['Composto: períodos', String(comp.passos.length)],
        ['Composto: juro', eur(comp.juro)],
        ['Diferença (composto − simples)', eur(comp.montante - simples.montante)],
      ]);

      const linhas = [];
      for (let a = 1; a <= est.anos; a++) {
        linhas.push([String(a), eur(C.jurosSimples(est.capital, taxa, a).montante), eur(comp.passos[a * est.periodos - 1].montante)]);
      }
      const envol = criar('div', 'quadro-envolvente');
      N.tabela(envol, ['Fim do ano', 'Montante simples', 'Montante composto'], linhas);
      zonaValores.appendChild(envol);
    }

    atualizar();

    return {
      destruir() {
        sliders.forEach((s) => s.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
