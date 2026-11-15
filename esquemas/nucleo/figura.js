globalThis.Manual = globalThis.Manual || {};

// Figura legendada com vista explodida (componente partilhado por todas as disciplinas).
// Estados: 'montada' | 'explodida' | { foco: idParte, anterior: 'montada'|'explodida' }.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const LIMITE_LISTA = 480; // abaixo disto as legendas vão para a lista por baixo
  const LARGURA_MAX_LEGENDA = 160;
  const ESPACO = 8;
  const ALTURA_LINHA = 24;

  // ---------- funções puras ----------

  function proximoEstado(estado, evento) {
    const tipo = typeof evento === 'string' ? evento : evento && evento.tipo;
    const emFoco = estado && typeof estado === 'object';
    const base = emFoco ? estado.anterior : estado;
    if (tipo === 'focar') return { foco: evento.id, anterior: base };
    if (tipo === 'esc' || tipo === 'fora') return base;
    let novo = base;
    if (tipo === 'separar') novo = 'explodida';
    else if (tipo === 'juntar') novo = 'montada';
    else if (tipo === 'alternar') novo = base === 'explodida' ? 'montada' : 'explodida';
    else return estado;
    return emFoco ? { foco: estado.foco, anterior: novo } : novo;
  }

  function modoLegendas(larguraDisponivel) {
    return larguraDisponivel < LIMITE_LISTA ? 'lista' : 'lateral';
  }

  const ancora = (def, p) => p.ancora || { x: def.largura / 2, y: def.altura / 2 };

  // Geometria completa: escala, tamanho da vista, deslocamentos e legendas (em coordenadas da vista).
  function geometria(def, estado, larguraDisponivel) {
    const W = larguraDisponivel;
    const modo = modoLegendas(W);
    const explodida = estado === 'explodida' || (estado && estado.anterior === 'explodida');
    const legL = modo === 'lateral' ? Math.min(LARGURA_MAX_LEGENDA, Math.floor(W * 0.35)) : 0;
    // Caixa que contém a figura montada e todas as posições explodidas (a escala é fixa entre estados).
    let minX = 0; let maxX = def.largura; let minY = 0; let maxY = def.altura;
    for (const p of def.partes) {
      minX = Math.min(minX, p.explodir.dx); maxX = Math.max(maxX, def.largura + p.explodir.dx);
      minY = Math.min(minY, p.explodir.dy); maxY = Math.max(maxY, def.altura + p.explodir.dy);
    }
    const disponivel = Math.max(1, W - (legL ? legL + ESPACO : 0));
    const escala = Math.min(1, disponivel / (maxX - minX));
    const alturaFig = (maxY - minY) * escala;
    const altura = modo === 'lateral' ? Math.max(alturaFig, def.partes.length * ALTURA_LINHA) : alturaFig;
    // Legendas ordenadas pela altura da âncora (menos cruzamentos).
    const ordem = def.partes.map((p, i) => ({ p, i, y: (ancora(def, p).y + p.explodir.dy - minY) * escala }))
      .sort((a, b) => a.y - b.y || a.i - b.i);
    const slot = {};
    ordem.forEach((o, k) => { slot[o.p.id] = k; });
    const passo = altura / def.partes.length;
    const pos = {};
    for (const p of def.partes) {
      const a = ancora(def, p);
      const legenda = modo === 'lateral'
        ? { x: W - legL, y: slot[p.id] * passo + passo / 2, largura: legL, lista: false }
        : { x: 0, y: 0, largura: 0, lista: true };
      pos[p.id] = {
        x: explodida ? p.explodir.dx : 0,
        y: explodida ? p.explodir.dy : 0,
        legenda,
        ancora: { x: (a.x - minX) * escala, y: (a.y - minY) * escala },
      };
    }
    return { modo, escala, origem: { x: minX, y: minY }, largura: W, altura, posicoes: pos };
  }

  function posicoes(def, estado, larguraDisponivel) {
    const g = geometria(def, estado, larguraDisponivel);
    const r = {};
    for (const p of def.partes) {
      const q = g.posicoes[p.id];
      r[p.id] = { x: q.x, y: q.y, legenda: q.legenda };
    }
    return r;
  }

  // Verificação textual (Node não tem DOMParser). Só aceita marcação sem script, on*=, javascript:,
  // foreignObject, entidades/doctype nem referências externas.
  function svgSeguro(texto) {
    const t = String(texto);
    if (/<\s*(script|foreignobject|iframe|object|embed)\b/i.test(t)) return false;
    if (/<!\s*(doctype|entity)/i.test(t)) return false;
    if (/[\s"'/]on[a-z]+\s*=/i.test(t)) return false;
    if (/javascript\s*:/i.test(t)) return false;
    if (/\bdata\s*:/i.test(t)) return false;
    for (const m of t.matchAll(/(?:^|[\s"'/:])href\s*=\s*["']?\s*([^"'\s>]*)/gi)) if (m[1].charAt(0) !== '#') return false;
    for (const m of t.matchAll(/url\(\s*["']?\s*([^"')\s]*)/gi)) if (m[1].charAt(0) !== '#') return false;
    return true;
  }

  function validarDefinicao(def) {
    if (!def || !Array.isArray(def.partes) || !def.partes.length) throw new Error('Figura sem partes');
    for (const p of def.partes) {
      if (!p.id || !p.rotulo || !p.explodir) throw new Error('Parte inválida: ' + (p.id || '?'));
      if (typeof p.svg === 'string' && !svgSeguro(p.svg)) throw new Error('SVG inseguro na parte ' + p.id);
      if (typeof p.svg !== 'string' && typeof p.desenhar !== 'function') throw new Error('Parte sem desenho: ' + p.id);
    }
  }

  // ---------- DOM ----------

  function criarSvg(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k of Object.keys(attrs || {})) e.setAttribute(k, String(attrs[k]));
    return e;
  }

  function criar(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function importarSvg(g, texto) {
    if (!svgSeguro(texto)) throw new Error('SVG inseguro');
    if (typeof DOMParser === 'undefined') throw new Error('DOMParser indisponível');
    const doc = new DOMParser().parseFromString(
      '<svg xmlns="' + NS + '" xmlns:xlink="http://www.w3.org/1999/xlink">' + texto + '</svg>', 'image/svg+xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('SVG inválido');
    const filhos = Array.from(doc.documentElement.childNodes);
    for (const f of filhos) g.appendChild(document.importNode(f, true));
  }

  function emParte(no) {
    for (let n = no; n; n = n.parentNode) if (n.classes && n.classes.has && n.classes.has('figura-parte')) return true;
    return false;
  }
  function emParteReal(no) {
    for (let n = no; n; n = n.parentNode) {
      if (n.classList && n.classList.contains('figura-parte')) return true;
    }
    return false;
  }

  function montarFigura(el, def, opcoes, interno) {
    opcoes = opcoes || {};
    const exercicio = opcoes.modo === 'exercicio';
    const esconder = opcoes.esconderRotulos !== undefined ? opcoes.esconderRotulos : exercicio;
    const regs = []; // [alvo, tipo, fn] para destruir
    const ouvir = (alvo, tipo, fn) => { alvo.addEventListener(tipo, fn); regs.push([alvo, tipo, fn]); };
    const nomeParte = (p, i) => (esconder ? 'Parte ' + (i + 1) : p.rotulo);

    let estado = 'montada';
    let geo = null;
    let largura = 0;
    let dialogo = null;
    let instAmpliada = null;
    let observador = null;
    const ouvintesSvg = []; // ouvintes das partes (re)criadas

    const raiz = criar('div', 'figura');
    raiz.classList.add(exercicio ? 'figura-exercicio' : 'figura-normal');
    raiz.setAttribute('role', 'group');
    raiz.setAttribute('aria-label', def.titulo || 'Figura');

    const barra = criar('div', 'figura-barra');
    const btnSep = criar('button', 'figura-separar btn', 'Separar as partes');
    btnSep.type = 'button';
    barra.appendChild(btnSep);
    let btnAmp = null;
    if (!interno) {
      btnAmp = criar('button', 'figura-ampliar btn', 'Ampliar');
      btnAmp.type = 'button';
      btnAmp.setAttribute('aria-haspopup', 'dialog');
      barra.appendChild(btnAmp);
    }
    raiz.appendChild(barra);

    const svg = criarSvg('svg', { class: 'figura-svg', role: 'group', 'aria-label': def.titulo || 'Figura' });
    svg.classList.add('figura-svg');
    raiz.appendChild(svg);

    const descricao = criar('p', 'figura-descricao', '');
    descricao.setAttribute('aria-live', 'polite');
    raiz.appendChild(descricao);

    const lista = criar('ol', 'figura-lista');
    raiz.appendChild(lista);

    let partesEl = {};
    let itensEl = {};
    let legendasEl = {};
    let ligacoesEl = {};

    function limparOuvintesDinamicos() {
      for (const [alvo, tipo, fn] of ouvintesSvg) alvo.removeEventListener(tipo, fn);
      ouvintesSvg.length = 0;
    }
    function ouvirDin(alvo, tipo, fn) { alvo.addEventListener(tipo, fn); ouvintesSvg.push([alvo, tipo, fn]); }

    function focar(id) { aplicar({ tipo: 'focar', id }); }
    function aplicar(ev) { estado = proximoEstado(estado, ev); atualizar(); }

    function construir() {
      limparOuvintesDinamicos();
      svg.textContent = '';
      lista.textContent = '';
      partesEl = {}; itensEl = {}; legendasEl = {}; ligacoesEl = {};
      geo = geometria(def, estado, largura);
      svg.setAttribute('viewBox', '0 0 ' + geo.largura + ' ' + Math.ceil(geo.altura));
      svg.setAttribute('width', String(geo.largura));
      svg.setAttribute('height', String(Math.ceil(geo.altura)));
      const s = geo.escala;
      const ligacoes = criarSvg('g', { class: 'figura-ligacoes' });
      const corpo = criarSvg('g', { transform: 'translate(' + (-geo.origem.x * s) + ' ' + (-geo.origem.y * s) + ') scale(' + s + ')' });
      const legendas = criarSvg('g', { class: 'figura-legendas', 'aria-hidden': 'true' });
      svg.appendChild(ligacoes); svg.appendChild(corpo); svg.appendChild(legendas);

      def.partes.forEach((p, i) => {
        const g = criarSvg('g', { tabindex: '0', role: 'button', 'aria-label': nomeParte(p, i) + (esconder ? '' : ', parte ' + (i + 1)), 'data-id': p.id });
        g.classList.add('figura-parte');
        if (typeof p.svg === 'string') importarSvg(g, p.svg); else p.desenhar(g, criarSvg);
        const mostraNum = exercicio ? opcoes.destacar === p.id : !esconder;
        if (opcoes.destacar === p.id) g.classList.add('figura-destaque');
        if (opcoes.destacar === p.id && exercicio) {
          const a = ancora(def, p);
          g.appendChild(criarSvg('circle', { class: 'figura-contorno', cx: a.x, cy: a.y, r: 16 / s }));
        }
        if (mostraNum) {
          const a = ancora(def, p);
          const num = criarSvg('g', { class: 'figura-num-grupo', 'aria-hidden': 'true' });
          num.appendChild(criarSvg('circle', { class: 'figura-num-fundo', cx: a.x, cy: a.y, r: 10 / s }));
          const t = criarSvg('text', { class: 'figura-num', x: a.x, y: a.y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11 / s });
          t.classList.add('figura-num');
          t.textContent = String(i + 1);
          num.appendChild(t);
          g.appendChild(num);
        }
        ouvirDin(g, 'click', () => focar(p.id));
        ouvirDin(g, 'keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { if (ev.preventDefault) ev.preventDefault(); focar(p.id); }
        });
        corpo.appendChild(g);
        partesEl[p.id] = g;

        if (geo.modo === 'lateral' && !esconder) {
          const q = geo.posicoes[p.id];
          const lg = criarSvg('g', { class: 'figura-legenda' });
          const max = Math.max(6, Math.floor(q.legenda.largura / 6.5));
          const txt = (i + 1) + '. ' + p.rotulo;
          const t = criarSvg('text', { x: q.legenda.x, y: q.legenda.y, 'dominant-baseline': 'central', 'font-size': 12 });
          t.textContent = txt.length > max ? txt.slice(0, max - 1) + '…' : txt;
          const titulo = criarSvg('title', {});
          titulo.textContent = txt;
          lg.appendChild(titulo);
          lg.appendChild(t);
          ouvirDin(lg, 'click', () => focar(p.id));
          legendas.appendChild(lg);
          legendasEl[p.id] = lg;
          const l = criarSvg('line', { class: 'figura-ligacao', x1: q.legenda.x - 4, y1: q.legenda.y, x2: q.ancora.x, y2: q.ancora.y });
          ligacoes.appendChild(l);
          ligacoesEl[p.id] = l;
        }

        const li = criar('li', 'figura-li');
        const b = criar('button', 'figura-item', esconder ? 'Parte ' + (i + 1) : p.rotulo);
        b.type = 'button';
        li.appendChild(b);
        lista.appendChild(li);
        itensEl[p.id] = b;
        ouvirDin(b, 'click', () => focar(p.id));
      });
      atualizar();
    }

    function atualizar() {
      const foco = estado && typeof estado === 'object' ? estado.foco : null;
      const explodida = estado === 'explodida' || (foco && estado.anterior === 'explodida');
      geo = geometria(def, estado, largura);
      raiz.classList.toggle('figura-explodida', !!explodida);
      raiz.classList.toggle('figura-em-foco', !!foco);
      btnSep.textContent = explodida ? 'Juntar' : 'Separar as partes';
      btnSep.setAttribute('aria-pressed', explodida ? 'true' : 'false');
      def.partes.forEach((p) => {
        const q = geo.posicoes[p.id];
        const g = partesEl[p.id];
        if (!g) return;
        g.style.transform = 'translate(' + q.x + 'px, ' + q.y + 'px)';
        g.classList.toggle('figura-foco', foco === p.id);
        g.classList.toggle('figura-esbatida', !!foco && foco !== p.id);
        if (legendasEl[p.id]) {
          legendasEl[p.id].classList.toggle('figura-visivel', !!explodida);
          legendasEl[p.id].classList.toggle('figura-esbatida', !!foco && foco !== p.id);
          ligacoesEl[p.id].classList.toggle('figura-visivel', !!explodida);
          const a = geo.posicoes[p.id].ancora;
          ligacoesEl[p.id].setAttribute('x2', String(a.x + q.x * geo.escala));
          ligacoesEl[p.id].setAttribute('y2', String(a.y + q.y * geo.escala));
        }
        itensEl[p.id].classList.toggle('figura-foco', foco === p.id);
      });
      let texto = '';
      if (foco && !esconder) {
        const i = def.partes.findIndex((p) => p.id === foco);
        const p = def.partes[i];
        if (p) texto = (i + 1) + '. ' + p.rotulo + (p.descricao ? ': ' + p.descricao : '');
      }
      descricao.textContent = texto;
    }

    function relayout() {
      const w = Math.floor(raiz.clientWidth || (el && el.clientWidth) || 600);
      if (w === largura) return;
      largura = w;
      construir();
    }

    // ---------- ligações de eventos ----------
    ouvir(btnSep, 'click', () => aplicar('alternar'));
    ouvir(raiz, 'keydown', (ev) => {
      if (ev.key === 'Escape' && estado && typeof estado === 'object') {
        if (ev.preventDefault) ev.preventDefault();
        if (ev.stopPropagation) ev.stopPropagation();
        aplicar('esc');
      }
    });
    ouvir(svg, 'click', (ev) => {
      if (emParteReal(ev.target) || emParte(ev.target)) return;
      if (estado && typeof estado === 'object') aplicar('fora');
      else if (estado === 'montada') aplicar('separar');
    });

    // ---------- Ampliar ----------
    function fechar() {
      if (!dialogo) return;
      const d = dialogo;
      dialogo = null;
      if (instAmpliada) { instAmpliada.destruir(); instAmpliada = null; }
      for (const r of d.regs) r[0].removeEventListener(r[1], r[2]);
      if (d.nativo && d.no.open && d.no.close) { try { d.no.close(); } catch (e) { /* ignorar */ } }
      if (d.no.parentNode) d.no.parentNode.removeChild(d.no);
      if (btnAmp) { btnAmp.setAttribute('aria-expanded', 'false'); btnAmp.focus(); }
    }

    function abrir() {
      if (dialogo) return;
      const teste = document.createElement('dialog');
      const nativo = typeof teste.showModal === 'function';
      const no = nativo ? teste : criar('div');
      no.classList.add('figura-dialogo');
      if (!nativo) no.classList.add('figura-dialogo-sobreposto');
      no.setAttribute('role', 'dialog');
      no.setAttribute('aria-modal', 'true');
      no.setAttribute('aria-label', (def.titulo || 'Figura') + ' (ampliada)');
      const fechaBtn = criar('button', 'figura-fechar btn', 'Fechar');
      fechaBtn.type = 'button';
      const corpo = criar('div', 'figura-dialogo-corpo');
      no.appendChild(fechaBtn);
      no.appendChild(corpo);
      const d = { no, nativo, regs: [] };
      const reg = (alvo, tipo, fn) => { alvo.addEventListener(tipo, fn); d.regs.push([alvo, tipo, fn]); };
      reg(fechaBtn, 'click', fechar);
      reg(no, 'keydown', (ev) => {
        if (ev.key === 'Escape') {
          if (instAmpliada && instAmpliada.estado() && typeof instAmpliada.estado() === 'object') return; // o Esc interno desfaz o foco
          if (ev.preventDefault) ev.preventDefault();
          fechar();
        }
      });
      reg(no, 'cancel', (ev) => { if (ev.preventDefault) ev.preventDefault(); fechar(); });
      dialogo = d;
      raiz.appendChild(no);
      if (nativo) no.showModal();
      instAmpliada = montarFigura(corpo, def, opcoes, true);
      btnAmp.setAttribute('aria-expanded', 'true');
      fechaBtn.focus();
    }
    if (btnAmp) ouvir(btnAmp, 'click', abrir);

    // ---------- arranque ----------
    el.appendChild(raiz);
    relayout();
    if (!largura) { largura = 600; construir(); }
    if (typeof ResizeObserver !== 'undefined') {
      observador = new ResizeObserver(() => relayout());
      observador.observe(raiz);
    }

    return {
      estado: () => estado,
      destruir() {
        fechar();
        if (observador) { observador.disconnect(); observador = null; }
        limparOuvintesDinamicos();
        for (const [alvo, tipo, fn] of regs) alvo.removeEventListener(tipo, fn);
        regs.length = 0;
        if (raiz.parentNode) raiz.parentNode.removeChild(raiz);
      },
    };
  }

  function criarEsquema(definicao) {
    validarDefinicao(definicao);
    return {
      montar(el, opcoes) { return montarFigura(el, definicao, opcoes, false); },
    };
  }

  Manual.figura = { criarEsquema, posicoes, proximoEstado, svgSeguro, modoLegendas, geometria };
})();
