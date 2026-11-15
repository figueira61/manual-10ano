globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-configuracao: escolhe o elemento (Z ≤ 23) e vê o preenchimento das caixas (orbitais) por ordem de
// energia, eletrão a eletrão, com a notação spd. Opções: { z } (por omissão 8).
Manual.esquemas.registar('fqa-configuracao', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const D = Manual.dadosQuimicos;
    const Q = Manual.quimica;
    const NS = 'http://www.w3.org/2000/svg';
    const Z_MAX = 23;
    const simbolos = Object.keys(D.elementos);
    const zIni = Math.round(Number(opcoes.z));
    const est = { z: Number.isInteger(zIni) && zIni >= 1 && zIni <= Z_MAX ? zIni : 8, k: 0 };
    est.k = est.z;

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
    function latex(pai, s) {
      if (Manual.render && Manual.render.texto) Manual.render.texto(pai, '$' + s + '$');
      else pai.appendChild(document.createTextNode(s));
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-configuracao');
    el.appendChild(raiz);
    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const sZ = N.slider(zonaSlider, { rotulo: 'Número atómico Z', min: 1, max: Z_MAX, passo: 1, valor: est.z, aoMudar: (v) => { est.z = Math.round(v); est.k = est.z; atualizar(); } });

    const barra = criar('div', 'esq-controlos');
    const bAnt = criar('button', 'btn', 'Retirar eletrão');
    const bSeg = criar('button', 'btn', 'Colocar eletrão');
    const bTodos = criar('button', 'btn', 'Todos os eletrões');
    [bAnt, bSeg, bTodos].forEach((b) => { b.type = 'button'; barra.appendChild(b); });
    raiz.appendChild(barra);
    const aoAnt = () => { if (est.k > 0) { est.k--; atualizar(); } };
    const aoSeg = () => { if (est.k < est.z) { est.k++; atualizar(); } };
    const aoTodos = () => { est.k = est.z; atualizar(); };
    bAnt.addEventListener('click', aoAnt);
    bSeg.addEventListener('click', aoSeg);
    bTodos.addEventListener('click', aoTodos);

    const svg = svgEl('svg', { viewBox: '0 0 340 96', width: '100%', role: 'img', class: 'config-svg' }, raiz);
    svg.style.maxWidth = '560px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    const TAM = 18, FOLGA = 2, SEP = 10;
    function desenhar(completa, parcial) {
      svg.textContent = '';
      const n = completa.caixas.reduce((t, c) => t + c.orbitais.length, 0) + (completa.caixas.length - 1) * (SEP / (TAM + FOLGA));
      const larg = n * (TAM + FOLGA);
      let x = Math.max(4, (340 - larg) / 2);
      const parcByNome = {};
      if (parcial) parcial.caixas.forEach((c) => { parcByNome[c.subnivel] = c; });
      const resumo = [];
      completa.caixas.forEach((c) => {
        const p = parcByNome[c.subnivel];
        const x0 = x;
        c.orbitais.forEach((_, j) => {
          const eletroes = p ? p.orbitais[j] : [];
          svgEl('rect', { class: 'caixa', x, y: 30, width: TAM, height: TAM, fill: eletroes.length ? 'var(--cor-1)' : 'var(--superficie)', 'fill-opacity': eletroes.length ? 0.18 : 1, stroke: 'var(--texto)', 'stroke-width': 1.2 }, svg);
          const t = svgEl('text', { class: 'setas', x: x + TAM / 2, y: 44, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--texto)' }, svg);
          t.textContent = eletroes.join('');
          x += TAM + FOLGA;
        });
        const nome = svgEl('text', { x: (x0 + x - FOLGA) / 2, y: 66, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: 'var(--texto)' }, svg);
        nome.textContent = c.subnivel;
        const e = p ? p.orbitais.reduce((t, o) => t + o.length, 0) : 0;
        resumo.push(c.subnivel + ': ' + e);
        x += SEP;
      });
      const en = svgEl('text', { x: 4, y: 12, 'font-size': 10, fill: 'var(--cor-eixos)' }, svg);
      en.textContent = 'Energia crescente →';
      svg.setAttribute('aria-label', 'Caixas dos subníveis por ordem de energia, com ' + (parcial ? resumo.join(', ') : 'nenhum eletrão') + '.');
    }

    function atualizar() {
      const z = est.z, k = est.k;
      const sim = simbolos[z - 1], nome = D.elementos[sim].nome;
      const completa = Q.configuracao(z);
      const parcial = k > 0 ? Q.configuracao(k) : null;
      desenhar(completa, parcial);
      bAnt.disabled = k === 0;
      bSeg.disabled = k === z;
      bTodos.disabled = k === z;

      zonaTexto.textContent = '';
      zonaTexto.appendChild(criar('p', 'config-passo', k === 0
        ? 'Ainda não há eletrões colocados (' + nome + ' tem ' + z + ').'
        : 'Eletrões colocados: ' + k + ' de ' + z + '.'));
      if (k > 0) {
        const antes = k > 1 ? Q.configuracao(k - 1) : { subniveis: [], orbitaisOcupadas: 0 };
        const dep = parcial.subniveis.find((s) => {
          const a = antes.subniveis.find((x) => x.nome === s.nome);
          return !a || a.eletroes !== s.eletroes;
        });
        const novaCaixa = parcial.orbitaisOcupadas > antes.orbitaisOcupadas;
        zonaTexto.appendChild(criar('p', 'config-regra', 'O eletrão ' + k + ' entra no subnível ' + dep.nome + ': ' + (novaCaixa
          ? 'ocupa uma caixa vazia (regra de Hund: primeiro um eletrão em cada caixa do subnível, com o mesmo spin).'
          : 'emparelha numa caixa já ocupada, com spin oposto (princípio de exclusão de Pauli).')));
      }
      const c = parcial;
      if (c) {
        const p1 = criar('p', 'config-spd');
        p1.appendChild(document.createTextNode('Configuração eletrónica' + (k < z ? ' parcial' : ' de ' + nome + ' (' + sim + ')') + ': '));
        latex(p1, c.spd);
        zonaTexto.appendChild(p1);
        const p2 = criar('p', 'config-cerne');
        p2.appendChild(document.createTextNode('Notação condensada: '));
        latex(p2, c.cerne);
        zonaTexto.appendChild(p2);
        const painel = criar('div');
        zonaTexto.appendChild(painel);
        N.painelValores(painel).definir([
          ['Eletrões de valência', String(c.valencia)],
          ['Eletrões desemparelhados', String(c.desemparelhados)],
          ['Orbitais ocupadas', String(c.orbitaisOcupadas)],
        ]);
      }
      zonaTexto.appendChild(criar('p', '', 'Ordem de energia crescente dos subníveis: 1s < 2s < 2p < 3s < 3p < 4s < 3d (princípio da construção).'));
    }

    atualizar();

    return {
      destruir() {
        sZ.destruir();
        bAnt.removeEventListener('click', aoAnt);
        bSeg.removeEventListener('click', aoSeg);
        bTodos.removeEventListener('click', aoTodos);
        el.textContent = '';
      },
    };
  },
});
