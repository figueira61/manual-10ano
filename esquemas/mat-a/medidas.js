globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('medidas', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const E = Manual.calc.estatistica;
    opcoes = opcoes || {};
    const PASSO = 0.5, MIN_PONTOS = 2, MAX_PONTOS = 20;
    const fmt = (v, d) => (Math.round(v * 1e9) / 1e9 + 0).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 2 : d });
    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    const arred = (v) => Math.round(v / PASSO) * PASSO;

    let dados = (Array.isArray(opcoes.dados) ? opcoes.dados : []).map(Number).filter(Number.isFinite).slice(0, MAX_PONTOS);
    if (dados.length < MIN_PONTOS) dados = [2, 4, 4, 4, 5, 5, 7, 9];
    let a = 1, b = 0;

    const xmin = Math.min(0, Math.floor(Math.min(...dados)) - 1);
    const xmax = Math.max(32, Math.ceil(Math.max(...dados)) + 5);
    const H = (xmax - xmin) * 0.22;
    const Y_PONTOS = 0.84 * H, Y_CAIXA = 0.46 * H, MEIA = 0.12 * H;

    el.textContent = '';
    const raiz = criar('div', 'esq-medidas');
    el.appendChild(raiz);
    raiz.appendChild(criar('p', null,
      'Arrasta os pontos (ou usa as setas do teclado quando um ponto está selecionado). Mínimo de ' + MIN_PONTOS + ' pontos.'));

    const zonaBotoes = criar('div', 'esq-controlos');
    const botaoMais = criar('button', 'botao', 'Adicionar');
    botaoMais.type = 'button';
    const botaoMenos = criar('button', 'botao', 'Remover');
    botaoMenos.type = 'button';
    zonaBotoes.appendChild(botaoMais);
    zonaBotoes.appendChild(botaoMenos);
    raiz.appendChild(zonaBotoes);

    const ref = N.criarReferencial(raiz, {
      caixa: { xmin: xmin - 1, xmax: xmax + 1, ymin: 0, ymax: H }, grelha: false, eixos: false, rotulos: false,
    });
    ref.svg.setAttribute('aria-label', 'Reta numérica com os pontos e o diagrama de extremos e quartis');
    const gFundo = ref.camada('fundo');
    const gCaixa = ref.camada('caixa');
    let pontos = [];

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    raiz.appendChild(criar('div', 'esq-subtitulo', 'Tabela de desvios'));
    const zonaDesvios = criar('div', 'quadro-envolvente');
    raiz.appendChild(zonaDesvios);

    raiz.appendChild(criar('div', 'esq-subtitulo', 'Transformação a·x + b'));
    const zonaTransf = criar('div', 'esq-controlos');
    function campo(rotulo, valor, aoMudar) {
      const l = criar('label', null, rotulo + ' = ');
      const c = criar('input', 'campo-numero');
      c.type = 'number'; c.step = String(PASSO); c.value = String(valor);
      c.setAttribute('aria-label', 'Valor de ' + rotulo);
      c.addEventListener('input', () => {
        const v = Number(c.value);
        if (c.value.trim() === '' || !Number.isFinite(v)) return;
        aoMudar(v);
        atualizar();
      });
      l.appendChild(c);
      zonaTransf.appendChild(l);
    }
    campo('a', a, (v) => { a = v; });
    campo('b', b, (v) => { b = v; });
    raiz.appendChild(zonaTransf);
    const zonaAntesDepois = criar('div');
    raiz.appendChild(zonaAntesDepois);
    raiz.appendChild(criar('p', null,
      'Somar b a todos os valores desloca a média em b mas não altera o desvio padrão; multiplicar por a multiplica a média por a e o desvio padrão por |a|.'));

    function eixoBase() {
      N.limpar(gFundo);
      const range = xmax - xmin;
      const passo = [1, 2, 5, 10, 20].find((p) => range / p <= 16) || 50;
      const y0 = ref.t.paraEcra([0, 0])[1];
      for (let x = Math.ceil(xmin / passo) * passo; x <= xmax + 1e-9; x += passo) {
        const s = ref.t.paraEcra([x, 0])[0];
        N.criarElementoSvg('line', { x1: s, y1: 0, x2: s, y2: y0, style: 'stroke:var(--cor-grelha);stroke-width:1' }, gFundo);
        N.criarElementoSvg('text', { x: s, y: y0 - 4, 'text-anchor': 'middle', style: 'fill:var(--cor-eixos);font-size:11px' }, gFundo)
          .textContent = fmt(x);
      }
      const yr = ref.t.paraEcra([0, Y_PONTOS])[1];
      const p0 = ref.t.paraEcra([xmin, Y_PONTOS]), p1 = ref.t.paraEcra([xmax, Y_PONTOS]);
      N.criarElementoSvg('line', { x1: p0[0], y1: yr, x2: p1[0], y2: yr, style: 'stroke:var(--cor-eixos);stroke-width:1.5' }, gFundo);
    }

    function desenharCaixa() {
      N.limpar(gCaixa);
      const q = E.extremosQuartis(dados);
      const eco = (x, y) => ref.t.paraEcra([x, y]);
      const traco = { cor: 'var(--cor-2)', largura: 2 };
      N.desenharSegmento(ref, gCaixa, [q.min, Y_CAIXA], [q.q1, Y_CAIXA], traco);
      N.desenharSegmento(ref, gCaixa, [q.q3, Y_CAIXA], [q.max, Y_CAIXA], traco);
      N.desenharSegmento(ref, gCaixa, [q.min, Y_CAIXA - MEIA / 2], [q.min, Y_CAIXA + MEIA / 2], traco);
      N.desenharSegmento(ref, gCaixa, [q.max, Y_CAIXA - MEIA / 2], [q.max, Y_CAIXA + MEIA / 2], traco);
      const a1 = eco(q.q1, Y_CAIXA + MEIA), a2 = eco(q.q3, Y_CAIXA - MEIA);
      N.criarElementoSvg('rect', {
        x: a1[0], y: a1[1], width: Math.max(a2[0] - a1[0], 0), height: a2[1] - a1[1],
        style: 'fill:var(--cor-2);fill-opacity:0.25;stroke:var(--cor-2);stroke-width:2',
      }, gCaixa);
      N.desenharSegmento(ref, gCaixa, [q.q2, Y_CAIXA - MEIA], [q.q2, Y_CAIXA + MEIA], { cor: 'var(--cor-eixos)', largura: 3 });
      const rotulos = [['mín', q.min], ['Q1', q.q1], ['Q2', q.q2], ['Q3', q.q3], ['máx', q.max]];
      rotulos.forEach(([nome, x], i) => {
        const p = eco(x, Y_CAIXA - MEIA);
        N.criarElementoSvg('text', {
          x: p[0], y: p[1] + 13 + (i % 2) * 12, 'text-anchor': 'middle',
          style: 'fill:var(--cor-eixos);font-size:11px',
        }, gCaixa).textContent = nome;
      });
    }

    function tabelaDesvios() {
      zonaDesvios.textContent = '';
      const ds = E.desvios(dados);
      const m = E.media(dados);
      const somaDesv = ds.reduce((s, d) => s + d.desvio, 0);
      const somaQuad = ds.reduce((s, d) => s + d.quadrado, 0);
      const t = criar('table');
      t.setAttribute('aria-label', 'Tabela de desvios em relação à média ' + fmt(m));
      const th = criar('thead'), trh = criar('tr');
      for (const c of ['x', 'x − x̄', '(x − x̄)²']) trh.appendChild(criar('th', 'numero', c));
      th.appendChild(trh);
      t.appendChild(th);
      const tb = criar('tbody');
      const linha = (cel, forte) => {
        const tr = criar('tr');
        cel.forEach((c) => { const td = criar('td', 'numero', c); if (forte) td.style.fontWeight = '700'; tr.appendChild(td); });
        tb.appendChild(tr);
      };
      ds.forEach((d) => linha([fmt(d.x), fmt(d.desvio), fmt(d.quadrado)]));
      linha(['Soma', fmt(somaDesv), fmt(somaQuad)], true);
      t.appendChild(tb);
      zonaDesvios.appendChild(t);
    }

    function atualizar() {
      botaoMais.disabled = dados.length >= MAX_PONTOS;
      botaoMenos.disabled = dados.length <= MIN_PONTOS;
      eixoBase();
      desenharCaixa();
      const q = E.quartis(dados);
      const moda = E.moda(dados);
      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir([
        ['Número de dados', String(dados.length)],
        ['Média', fmt(E.media(dados))],
        ['Mediana', fmt(E.mediana(dados))],
        ['Moda', moda.length ? moda.map((v) => fmt(v)).join('; ') : 'não há moda'],
        ['Q1', fmt(q.q1)],
        ['Q3', fmt(q.q3)],
        ['Amplitude', fmt(E.amplitude(dados))],
        ['Amplitude interquartil', fmt(E.amplitudeInterquartil(dados))],
        ['Desvio padrão', fmt(E.desvioPadrao(dados))],
      ]);
      tabelaDesvios();
      const novos = dados.map((x) => a * x + b);
      zonaAntesDepois.textContent = '';
      N.tabela(zonaAntesDepois, ['', 'Antes (x)', 'Depois (' + Manual.formatar.soma([[a, '·x'], [b, '']]) + ')'], [
        ['Média', fmt(E.media(dados)), fmt(E.media(novos))],
        ['Desvio padrão', fmt(E.desvioPadrao(dados)), fmt(E.desvioPadrao(novos))],
      ]);
    }

    function criarPontos() {
      pontos.forEach((p) => p.destruir());
      pontos = dados.map((x, i) => N.pontoArrastavel(ref, {
        x, y: Y_PONTOS, passo: PASSO, rotulo: String(i + 1), cor: 'var(--cor-1)',
        restringir: (nx) => [Math.min(Math.max(nx, xmin), xmax), Y_PONTOS],
        aoMover(nx) { dados[i] = nx; atualizar(); },
      }));
    }

    botaoMais.addEventListener('click', () => {
      if (dados.length >= MAX_PONTOS) return;
      dados.push(Math.min(Math.max(arred(E.media(dados)), xmin), xmax));
      criarPontos();
      atualizar();
    });
    botaoMenos.addEventListener('click', () => {
      if (dados.length <= MIN_PONTOS) return;
      dados.pop();
      criarPontos();
      atualizar();
    });

    criarPontos();
    atualizar();

    return {
      destruir() {
        pontos.forEach((p) => p.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
