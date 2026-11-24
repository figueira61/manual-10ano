globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-corrente: gráfico qualitativo I(t) da corrente contínua (CC) e da corrente alternada (CA), com dois botões
// (e as setas do teclado) para alternar entre as duas. Em CC o sentido da corrente é constante; em CA muda de sentido
// periodicamente. A frequência da rede vem de Manual.dadosFisica.rede (50 Hz, a tomada de casa dá 230 V): a corrente muda
// de sentido 2 × 50 = 100 vezes por segundo e o período é 1/50 s = 20 ms. O eixo de I não tem valores: sem valor eficaz
// nem amplitude, que ficam fora das AE. Opções: { modo: 'cc' | 'ca' }.
Manual.esquemas.registar('fqa-corrente', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const NS = 'http://www.w3.org/2000/svg';
    const rede = Manual.dadosFisica.rede;
    const f = rede.frequencia;
    const T = 1000 / f; // período em ms
    const mudancas = 2 * f; // mudanças de sentido por segundo
    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 1 });
    const f1 = (v) => Math.round(v * 10) / 10;
    const est = { modo: opcoes.modo === 'ca' ? 'ca' : 'cc' };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function svgEl(nome, atributos, pai) {
      const e = document.createElementNS(NS, nome);
      for (const k in atributos) e.setAttribute(k, atributos[k]);
      if (pai) pai.appendChild(e);
      return e;
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-corrente');
    el.appendChild(raiz);
    const zModo = criar('div', 'esq-controlos');
    zModo.setAttribute('role', 'group');
    zModo.setAttribute('aria-label', 'Tipo de corrente');
    raiz.appendChild(zModo);
    const botoes = [];
    const botao = (rotulo, modo) => {
      const b = criar('button', 'btn', rotulo);
      b.type = 'button';
      const aoClicar = () => { est.modo = modo; atualizar(); };
      b.addEventListener('click', aoClicar);
      zModo.appendChild(b);
      botoes.push({ b, aoClicar, modo });
    };
    botao('Corrente contínua', 'cc');
    botao('Corrente alternada', 'ca');

    const L = 320, ALT = 170;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'img', tabindex: '0', class: 'corrente-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const resumo = criar('p', 'esq-resumo');
    resumo.setAttribute('aria-live', 'polite');
    raiz.appendChild(resumo);
    const zonaTexto = criar('div');
    raiz.appendChild(zonaTexto);

    const texto = (x, y, t, ancora, tam, extra) => {
      const e = svgEl('text', Object.assign({ x, y, 'text-anchor': ancora || 'middle', 'font-size': tam || 9, fill: 'var(--texto)' }, extra), svg);
      e.textContent = t;
      return e;
    };

    // Eixos: t de 0 a 2 períodos (40 ms a 50 Hz); I sem escala, com o sentido positivo para cima.
    const X0 = 40, X1 = 300, YT = 26, YB = 136, YM = (YT + YB) / 2;
    const TMAX = 2 * T;
    const px = (t) => X0 + (t / TMAX) * (X1 - X0);
    const A = 40; // altura do desenho (sem significado numérico)

    function atualizar() {
      botoes.forEach((r) => r.b.setAttribute('aria-pressed', r.modo === est.modo ? 'true' : 'false'));
      const ca = est.modo === 'ca';
      svg.textContent = '';
      svgEl('path', { d: 'M' + X0 + ' ' + YT + ' V' + YB, fill: 'none', stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      svgEl('line', { x1: X0, y1: YM, x2: X1, y2: YM, stroke: 'var(--cor-eixos)', 'stroke-width': 1.5 }, svg);
      texto(X0 + 4, 14, 'I', 'start', 10, { 'font-style': 'italic' });
      texto(X1, YM + 22, 't / ms', 'end', 9);
      texto(X0 - 4, YM + 3, '0', 'end', 9);
      texto(X0 - 4, YT + 8, '+', 'end', 11);
      texto(X0 - 4, YB, '−', 'end', 11);
      for (let k = 1; k <= 4; k++) {
        const t = (k * T) / 2;
        svgEl('line', { x1: f1(px(t)), y1: YM - 3, x2: f1(px(t)), y2: YM + 3, stroke: 'var(--cor-eixos)', 'stroke-width': 1 }, svg);
        if (k < 4) texto(f1(px(t)), YM + 13, fmt(t), 'middle', 8);
      }

      // Curva I(t): reta acima do eixo (CC) ou sinusoide de frequência f (CA).
      const pts = [];
      const N = 96;
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * TMAX;
        const y = ca ? YM - A * Math.sin(2 * Math.PI * (t / T) + 0.0001) : YM - A * 0.7;
        pts.push((i ? 'L' : 'M') + f1(px(t)) + ' ' + f1(y));
      }
      svgEl('path', { class: 'grafico-i', 'data-eixo': YM, d: pts.join(' '), fill: 'none', stroke: 'var(--cor-1)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);

      if (ca) {
        // período marcado entre dois máximos consecutivos
        const ya = YT - 6 + 0;
        svgEl('line', { x1: f1(px(T / 4)), y1: ya + 4, x2: f1(px(T / 4 + T)), y2: ya + 4, stroke: 'var(--cor-2)', 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, svg);
        texto(f1(px(T / 4 + T / 2)), ya, 'período T = ' + fmt(T) + ' ms', 'middle', 9);
        texto(X1, YB + 22, 'muda de sentido ' + mudancas + ' vezes por segundo (' + f + ' Hz)', 'end', 9);
      } else {
        texto(X1, YB + 22, 'sentido constante: I > 0 sempre', 'end', 9);
      }
      svg.setAttribute('aria-label', ca
        ? 'Gráfico da corrente alternada em função do tempo: a corrente muda de sentido ' + mudancas + ' vezes por segundo (' + f + ' Hz), período ' + fmt(T) + ' ms.'
        : 'Gráfico da corrente contínua em função do tempo: a corrente tem sempre o mesmo sentido.');

      resumo.textContent = ca
        ? 'Corrente alternada: muda de sentido ' + mudancas + ' vezes por segundo (' + f + ' Hz), como a da tomada de casa.'
        : 'Corrente contínua: sentido constante, como a de uma pilha, de uma bateria ou de um painel fotovoltaico.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Tipo de corrente', ca ? 'alternada (CA)' : 'contínua (CC)');
      linha('Sentido da corrente', ca ? 'muda periodicamente: ora num sentido, ora no sentido oposto' : 'constante: a corrente percorre o circuito sempre no mesmo sentido');
      linha('Mudanças de sentido por segundo', ca ? String(mudancas) : '0');
      if (ca) {
        linha('Frequência', f + ' Hz (' + f + ' ciclos por segundo)');
        linha('Período', fmt(T) + ' ms (T = 1/f)');
      }
      linha('Exemplos', ca ? 'tomada de casa, alternador de uma central elétrica' : 'pilha, bateria de um telemóvel, painel fotovoltaico');
      zonaTexto.appendChild(dl);
      zonaTexto.appendChild(criar('p', 'esq-legenda', ca
        ? 'A tomada de casa fornece ' + rede.tensao + ' V a ' + f + ' Hz: em cada ciclo a corrente vai num sentido e depois no oposto, por isso muda de sentido ' + mudancas + ' vezes por segundo.'
        : 'Numa corrente contínua o gráfico I(t) fica sempre do mesmo lado do eixo do tempo: a corrente nunca muda de sentido.'));
    }

    const aoTecla = (ev) => {
      const modo = { ArrowLeft: 'cc', ArrowUp: 'cc', ArrowRight: 'ca', ArrowDown: 'ca' }[ev.key];
      if (!modo) return;
      ev.preventDefault();
      est.modo = modo;
      atualizar();
    };
    svg.addEventListener('keydown', aoTecla);

    atualizar();

    return {
      destruir() {
        botoes.forEach((r) => r.b.removeEventListener('click', r.aoClicar));
        svg.removeEventListener('keydown', aoTecla);
        el.textContent = '';
      },
    };
  },
});
