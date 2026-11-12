globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('regressao', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const E = Manual.calc.estatistica;
    opcoes = opcoes || {};
    const PASSO = 0.5, MIN_PONTOS = 2, MAX_PONTOS = 30, RAIO_PX = 22;
    const fmt = (v, d) => (Math.round(v * 1e9) / 1e9 + 0).toLocaleString('pt-PT', { maximumFractionDigits: d === undefined ? 3 : d });
    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    const arred = (v) => Math.round(v / PASSO) * PASSO;

    let pares = (Array.isArray(opcoes.pares) ? opcoes.pares : [])
      .filter((p) => Array.isArray(p) && Number.isFinite(Number(p[0])) && Number.isFinite(Number(p[1])))
      .map((p) => [Number(p[0]), Number(p[1])]).slice(0, MAX_PONTOS);
    if (pares.length < MIN_PONTOS) pares = [[1, 2], [2, 3.5], [3, 3], [4, 5.5], [5, 6], [6, 7]];

    const todos = pares.reduce((l, p) => l.concat(p), []);
    const xmin = Math.min(0, Math.floor(Math.min(...todos)) - 1);
    const xmax = Math.max(10, Math.ceil(Math.max(...todos)) + 1);
    const caixa = { xmin, xmax, ymin: xmin, ymax: xmax }; // quadrado: escala 1:1

    el.textContent = '';
    const raiz = criar('div', 'esq-regressao');
    el.appendChild(raiz);
    raiz.appendChild(criar('p', null,
      'Clica no plano para adicionar um ponto; faz duplo clique num ponto para o remover; arrasta (ou usa as setas) para o mover. ' +
      'Em alternativa, usa os botões. Mínimo de ' + MIN_PONTOS + ' pontos.'));

    const zonaBotoes = criar('div', 'esq-controlos');
    const botaoMais = criar('button', 'botao', 'Adicionar ponto');
    botaoMais.type = 'button';
    const botaoMenos = criar('button', 'botao', 'Remover ponto selecionado');
    botaoMenos.type = 'button';
    zonaBotoes.appendChild(botaoMais);
    zonaBotoes.appendChild(botaoMenos);
    const estadoSel = criar('span', 'esq-estado');
    estadoSel.setAttribute('aria-live', 'polite');
    zonaBotoes.appendChild(estadoSel);
    raiz.appendChild(zonaBotoes);

    const ref = N.criarReferencial(raiz, { caixa });
    ref.svg.setAttribute('aria-label', 'Nuvem de pontos e reta de regressão');
    ref.svg.style.cursor = 'crosshair';
    const gReta = ref.camada('reta');
    const gSel = ref.camada('selecao');
    let pontos = [];
    let sel = -1; // índice do ponto selecionado

    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);

    function classificar(r) {
      const forca = Math.abs(r) >= 0.7 ? 'forte' : Math.abs(r) >= 0.3 ? 'moderada' : 'fraca';
      return 'correlação ' + forca + (Math.abs(r) < 1e-9 ? '' : r > 0 ? ' positiva' : ' negativa');
    }

    function atualizar() {
      botaoMais.disabled = pares.length >= MAX_PONTOS;
      botaoMenos.disabled = pares.length <= MIN_PONTOS;
      estadoSel.textContent = sel >= 0 && sel < pares.length
        ? 'Selecionado: ponto ' + (sel + 1)
        : 'Nenhum ponto selecionado (remove o último)';

      N.limpar(gReta);
      N.limpar(gSel);
      const reg = E.regressao(pares);
      if (reg) {
        N.desenharSegmento(ref, gReta,
          [caixa.xmin, reg.declive * caixa.xmin + reg.ordenada],
          [caixa.xmax, reg.declive * caixa.xmax + reg.ordenada],
          { cor: 'var(--cor-2)', largura: 2.5 });
      }
      if (sel >= 0 && sel < pares.length) {
        N.desenharCirculo(ref, gSel, pares[sel], 16 / ref.t.escala, { cor: 'var(--cor-5)', largura: 2, tracejado: true });
      }

      const r = E.correlacao(pares);
      const rr = Math.round(r * 1e9) / 1e9;
      const linhas = [['Número de pontos', String(pares.length)]];
      if (Number.isNaN(r)) {
        linhas.push(['Coeficiente de correlação', 'r indefinido (variância nula)']);
      } else {
        linhas.push(['Coeficiente de correlação r', fmt(rr)]);
        linhas.push(['Classificação', classificar(rr)]);
      }
      if (reg) {
        const m = reg.declive, c = reg.ordenada;
        linhas.push(['Reta de regressão', 'y = ' + fmt(m) + 'x ' + (c < 0 ? '−' : '+') + ' ' + fmt(Math.abs(c))]);
      } else {
        linhas.push(['Reta de regressão', 'não definida (todos os x são iguais)']);
      }
      zonaPainel.textContent = '';
      N.painelValores(zonaPainel).definir(linhas);
    }

    function criarPontos() {
      pontos.forEach((p) => p.destruir());
      pontos = pares.map((p, i) => N.pontoArrastavel(ref, {
        x: p[0], y: p[1], passo: PASSO, rotulo: 'P' + (i + 1), cor: 'var(--cor-1)',
        aoMover(nx, ny) { pares[i] = [nx, ny]; sel = i; atualizar(); },
      }));
    }

    function adicionar(x, y) {
      if (pares.length >= MAX_PONTOS) return;
      pares.push([Math.min(Math.max(arred(x), caixa.xmin), caixa.xmax), Math.min(Math.max(arred(y), caixa.ymin), caixa.ymax)]);
      sel = pares.length - 1;
      criarPontos();
      atualizar();
    }
    function remover(i) {
      if (pares.length <= MIN_PONTOS || i < 0 || i >= pares.length) return;
      pares.splice(i, 1);
      sel = -1;
      criarPontos();
      atualizar();
    }
    function coordenadas(ev) {
      const m = ref.svg.getScreenCTM();
      if (!m) return null;
      const p = ref.svg.createSVGPoint();
      p.x = ev.clientX; p.y = ev.clientY;
      const q = p.matrixTransform(m.inverse());
      return { mundo: ref.t.paraMundo([q.x, q.y]), ecra: [q.x, q.y] };
    }
    const emPonto = (ev) => ev.target.closest && ev.target.closest('[role="slider"]');

    function aoClicar(ev) {
      if (emPonto(ev) || ev.detail > 1) return;
      const m = coordenadas(ev);
      if (m) adicionar(m.mundo[0], m.mundo[1]);
    }
    function aoDuploClique(ev) {
      const m = coordenadas(ev);
      if (!m) return;
      let melhor = -1, dmin = RAIO_PX;
      pares.forEach((p, i) => {
        const s = ref.t.paraEcra(p);
        const d = Math.hypot(s[0] - m.ecra[0], s[1] - m.ecra[1]);
        if (d <= dmin) { dmin = d; melhor = i; }
      });
      if (melhor >= 0) remover(melhor);
    }
    function aoFocar(ev) {
      const g = emPonto(ev);
      if (!g) return;
      const k = /^P(\d+)/.exec(g.getAttribute('aria-label') || '');
      if (k) { sel = Number(k[1]) - 1; atualizar(); }
    }
    ref.svg.addEventListener('click', aoClicar);
    ref.svg.addEventListener('dblclick', aoDuploClique);
    ref.svg.addEventListener('focusin', aoFocar);

    botaoMais.addEventListener('click', () => {
      if (pares.length >= MAX_PONTOS) return;
      const mx = E.media(pares.map((p) => p[0]));
      const my = E.media(pares.map((p) => p[1]));
      adicionar(mx + PASSO, my + PASSO);
      const ultimo = ref.camada('pontos').lastChild;
      if (ultimo && ultimo.focus) ultimo.focus();
    });
    botaoMenos.addEventListener('click', () => remover(sel >= 0 && sel < pares.length ? sel : pares.length - 1));

    criarPontos();
    atualizar();

    return {
      destruir() {
        ref.svg.removeEventListener('click', aoClicar);
        ref.svg.removeEventListener('dblclick', aoDuploClique);
        ref.svg.removeEventListener('focusin', aoFocar);
        pontos.forEach((p) => p.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
