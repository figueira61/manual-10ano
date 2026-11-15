globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-geometria: geometria molecular em 3D (projeção ortográfica com rotação por arrasto, setas e botões).
// Moléculas do catálogo (Manual.moleculas) com atomos3d e um só átomo central (ou diatómicas). Mostra, para o átomo
// central: geometria, ângulo de ligação, pares ligantes e não ligantes, domínios eletrónicos e polaridade.
// É um diagrama de aprendizagem (a informação aparece sempre); não é para figuras de enunciado.
// Opções: { molecula: id (omissão 'H2O') }.
Manual.esquemas.registar('fqa-geometria', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const Mol = Manual.moleculas;
    const NS = 'http://www.w3.org/2000/svg';
    const L = 320, ALT = 250, ESC = 62;
    const PASSO = Math.PI / 12, ELEV_MAX = 1.5;
    const AZ0 = -0.6, EL0 = 0.35;

    const ids = Object.keys(Mol.catalogo).filter((id) => {
      const m = Mol.catalogo[id];
      return Array.isArray(m.atomos3d) && (m.atomos.length === 2 || Mol.centrais(id).length === 1);
    });
    const est = { id: ids.includes(opcoes.molecula) ? opcoes.molecula : (ids.includes('H2O') ? 'H2O' : ids[0]), azimute: AZ0, elevacao: EL0 };

    const sub = (s) => s.replace(/\d/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);
    const formulaTexto = (latex) => sub(latex.replace(/\\mathrm\{/g, '').replace(/_\{?(\d+)\}?/g, '$1').replace(/[{}]/g, ''));
    const num = (v) => String(v).replace('.', ',');
    const r1 = (v) => Math.round(v * 10) / 10;

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

    // ---------- geometria (sem DOM) ----------

    const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const soma3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const cruz3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norma3 = (a) => Math.hypot(a[0], a[1], a[2]);
    const unit3 = (a) => mul3(a, 1 / norma3(a));
    const pos = (a) => [a.x, a.y, a.z];

    // Átomo central: o único com ≥ 2 vizinhos; numa diatómica, o que não é H (ou o primeiro).
    function centroDe(id) {
      const m = Mol.catalogo[id];
      const cs = Mol.centrais(id);
      if (cs.length === 1) return cs[0];
      const i = m.atomos.findIndex((a) => a.el !== 'H');
      return i >= 0 ? i : 0;
    }

    // Direções (unitárias) dos pares não ligantes do átomo central, no arranjo tetraédrico/trigonal de domínios:
    // 1 par → oposto à soma das ligações; 2 pares → no plano perpendicular às ligações; 3 pares → cone à volta do eixo.
    function direcoesPares(id) {
      const m = Mol.catalogo[id];
      const c = centroDe(id);
      const p = m.atomos[c].pares;
      if (!p) return [];
      const o = pos(m.atomos3d[c]);
      const ligs = [];
      for (const [i, j] of m.ligacoes) {
        const k = i === c ? j : j === c ? i : -1;
        if (k >= 0) ligs.push(unit3(sub3(pos(m.atomos3d[k]), o)));
      }
      let soma = [0, 0, 0];
      ligs.forEach((v) => { soma = soma3(soma, v); });
      const u = unit3(mul3(soma, -1));
      if (p === 1) return [u];
      // base perpendicular a u
      const pior = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      let e1 = unit3(cruz3(u, pior));
      if (p === 2 && ligs.length >= 2) {
        const n = cruz3(ligs[0], ligs[1]);
        if (norma3(n) > 1e-6) e1 = unit3(n);
      }
      const e2 = cruz3(u, e1);
      const teta = p === 2 ? 54.75 : 70.5; // meio ângulo tetraédrico / ângulo ao eixo oposto
      const R = Math.PI / 180;
      if (p === 2) return [-1, 1].map((s) => soma3(mul3(u, Math.cos(teta * R)), mul3(e1, s * Math.sin(teta * R))));
      return Array.from({ length: p }, (_, k) => {
        const f = (2 * Math.PI * k) / p;
        return soma3(mul3(u, Math.cos(teta * R)), soma3(mul3(e1, Math.sin(teta * R) * Math.cos(f)), mul3(e2, Math.sin(teta * R) * Math.sin(f))));
      });
    }

    // ---------- DOM ----------

    el.textContent = '';
    const raiz = criar('div', 'esq-geometria');
    el.appendChild(raiz);

    const zonaSel = criar('div', 'esq-controlos');
    raiz.appendChild(zonaSel);
    const lab = criar('label', '', 'Molécula ');
    const sel = criar('select');
    sel.setAttribute('aria-label', 'Molécula');
    ids.forEach((id) => {
      const o = criar('option', '', formulaTexto(Mol.catalogo[id].formula) + ' — ' + Mol.catalogo[id].nome);
      o.value = id;
      if (id === est.id) o.selected = true;
      sel.appendChild(o);
    });
    lab.appendChild(sel);
    zonaSel.appendChild(lab);

    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'geometria-svg' }, raiz);
    svg.style.maxWidth = '420px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    // Só o gesto horizontal roda; o vertical continua a deslocar a página (rato/caneta rodam nos dois eixos).
    svg.style.touchAction = 'pan-y';
    svg.style.cursor = 'grab';

    const barra = criar('div', 'esq-controlos');
    raiz.appendChild(barra);
    const botoes = [];
    const mkBotao = (txt, rotulo, fn) => {
      const b = criar('button', 'botao', txt);
      b.type = 'button';
      b.setAttribute('aria-label', rotulo);
      b.addEventListener('click', fn);
      barra.appendChild(b);
      botoes.push([b, fn]);
      return b;
    };
    const rodar = (da, de) => {
      est.azimute += da;
      est.elevacao = Math.min(Math.max(est.elevacao + de, -ELEV_MAX), ELEV_MAX);
      desenhar();
    };
    const repor = () => { est.azimute = AZ0; est.elevacao = EL0; desenhar(); };
    mkBotao('◀', 'Rodar para a esquerda', () => rodar(-PASSO, 0));
    mkBotao('▶', 'Rodar para a direita', () => rodar(PASSO, 0));
    mkBotao('▲', 'Inclinar para cima', () => rodar(0, PASSO));
    mkBotao('▼', 'Inclinar para baixo', () => rodar(0, -PASSO));
    mkBotao('Repor vista', 'Repor a vista inicial', repor);
    raiz.appendChild(criar('p', 'esq-legenda', 'Arrasta o desenho ou usa as setas do teclado para rodar. Os lóbulos tracejados são os pares não ligantes do átomo central.'));

    const zonaTexto = criar('div');
    zonaTexto.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaTexto);

    const COR = { H: 'var(--superficie)', C: 'var(--cor-eixos)', N: 'var(--cor-1)', O: 'var(--cor-2)', B: 'var(--cor-4)', F: 'var(--cor-3)', Cl: 'var(--cor-3)' };
    const RAIO = { H: 9, C: 14, N: 14, O: 14, B: 14, F: 13, Cl: 17 };

    function projetar(p) {
      const q = N.projetar(p, { azimute: est.azimute, elevacao: est.elevacao });
      const a = Math.cos(est.azimute), s = Math.sin(est.azimute);
      const y1 = p[0] * s + p[1] * a;
      const prof = y1 * Math.cos(est.elevacao) - p[2] * Math.sin(est.elevacao); // maior = mais longe
      return { x: L / 2 + q[0] * ESC, y: ALT / 2 - q[1] * ESC, prof };
    }

    function desenhar() {
      const id = est.id;
      const m = Mol.catalogo[id];
      const c = centroDe(id);
      const centro = pos(m.atomos3d[c]);
      svg.textContent = '';
      const itens = [];
      const P = m.atomos3d.map((a) => projetar(sub3(pos(a), centro)));

      // ligações (linhas paralelas para ligações duplas e triplas)
      for (const [i, j, ordem] of m.ligacoes) {
        const a = P[i], b = P[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
        const nx = -dy / d, ny = dx / d;
        itens.push({ prof: (a.prof + b.prof) / 2 - 0.01, desenhar() {
          for (let k = 0; k < ordem; k++) {
            const off = (k - (ordem - 1) / 2) * 5;
            svgEl('line', { class: 'ligacao3d', x1: r1(a.x + nx * off), y1: r1(a.y + ny * off), x2: r1(b.x + nx * off), y2: r1(b.y + ny * off), stroke: 'var(--texto)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
          }
        } });
      }
      // átomos
      m.atomos3d.forEach((a, i) => {
        const q = P[i];
        itens.push({ prof: q.prof, desenhar() {
          svgEl('circle', { class: 'atomo3d', cx: r1(q.x), cy: r1(q.y), r: RAIO[a.el] || 14, fill: COR[a.el] || 'var(--cor-5)', stroke: 'var(--texto)', 'stroke-width': 1.5 }, svg);
          const t = svgEl('text', { x: r1(q.x), y: r1(q.y + 4.5), 'text-anchor': 'middle', 'font-size': a.el === 'H' ? 11 : 13, 'font-weight': 700, fill: 'var(--texto)', 'pointer-events': 'none' }, svg);
          t.textContent = a.el;
        } });
      });
      // pares não ligantes do átomo central
      direcoesPares(id).forEach((dir) => {
        const q = projetar(mul3(dir, 0.8));
        const q0 = P[c];
        const ex = q.x - q0.x, ey = q.y - q0.y;
        itens.push({ prof: q.prof, desenhar() {
          svgEl('circle', { class: 'par-nl', cx: r1(q.x), cy: r1(q.y), r: 13, fill: 'var(--cor-3)', 'fill-opacity': 0.25, stroke: 'var(--cor-3)', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, svg);
          const t = svgEl('text', { x: r1(q0.x + ex * 1.0), y: r1(q0.y + ey * 1.0 + 3.5), 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--texto)', 'pointer-events': 'none' }, svg);
          t.textContent = '••';
        } });
      });
      itens.sort((u, v) => v.prof - u.prof).forEach((it) => it.desenhar());

      // texto
      const nPares = m.atomos[c].pares;
      let ligantes = 0, vizinhos = 0;
      for (const [i, j, o] of m.ligacoes) if (i === c || j === c) { ligantes += o; vizinhos++; }
      const geo = m.geometria;
      const polarTxt = m.polar ? 'polar' : 'apolar';
      const centroSimbolo = m.atomos[c].el;
      const ang = m.angulo === null ? 'não se aplica (molécula diatómica)' : '≈ ' + num(m.angulo) + '°';
      const polarPorque = m.atomos.length === 2
        ? (m.polar ? 'a ligação é polar e não há outra para a compensar' : 'os dois átomos são iguais (ligação apolar)')
        : (m.polar ? 'os dipolos das ligações não se anulam, por causa da geometria e dos pares não ligantes' : 'os dipolos das ligações anulam-se, por causa da geometria');

      svg.setAttribute('aria-label', 'Modelo 3D de ' + m.nome + ' (' + formulaTexto(m.formula) + '): geometria ' + geo + (m.angulo !== null ? ', ângulo ≈ ' + num(m.angulo) + '°' : '') + '; ' + nPares + ' pares não ligantes no ' + centroSimbolo + '; molécula ' + polarTxt + '. Vista com azimute ' + Math.round(est.azimute * 180 / Math.PI) + '° e elevação ' + Math.round(est.elevacao * 180 / Math.PI) + '°.');

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Molécula', m.nome.charAt(0).toUpperCase() + m.nome.slice(1) + ' (' + formulaTexto(m.formula) + ')');
      linha('Geometria', geo);
      linha('Ângulo de ligação', ang);
      linha('Átomo central', centroSimbolo);
      linha('Pares ligantes no ' + centroSimbolo, ligantes + (ligantes !== vizinhos ? ' (' + vizinhos + ' ligações com ' + ligantes + ' pares)' : ''));
      linha('Pares não ligantes no ' + centroSimbolo, String(nPares));
      linha('Domínios eletrónicos', String(vizinhos + nPares));
      linha('Polaridade', 'molécula ' + polarTxt + ' (' + polarPorque + ')');
      zonaTexto.appendChild(dl);
      const notas = [];
      if (m.excecaoOcteto) notas.push('O boro fica com 6 eletrões (exceção à regra do octeto).');
      if (m.ressonancia) notas.push('O ozono tem duas estruturas de ressonância; as duas ligações O–O são equivalentes e o ângulo é o mesmo.');
      if (m.polarNota) notas.push(m.polarNota);
      if (notas.length) zonaTexto.appendChild(criar('p', 'esq-aviso', notas.join(' ')));
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Os pares de eletrões (ligantes e não ligantes) afastam-se o mais possível uns dos outros; a geometria descreve só a posição dos átomos.'));
    }

    // arrasto, teclado
    let arrasto = null;
    const aoPremir = (ev) => {
      arrasto = { x: ev.clientX, y: ev.clientY, toque: ev.pointerType === 'touch' };
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* sem captura */ }
      svg.style.cursor = 'grabbing';
      svg.focus({ preventScroll: true });
    };
    const aoMover = (ev) => {
      if (!arrasto) return;
      const caixa = svg.getBoundingClientRect();
      const k = caixa.width > 0 ? L / caixa.width : 1;
      const dx = (ev.clientX - arrasto.x) * k, dy = (ev.clientY - arrasto.y) * k;
      arrasto.x = ev.clientX; arrasto.y = ev.clientY;
      rodar(dx * 0.01, arrasto.toque ? 0 : dy * 0.01);
    };
    const aoSoltar = (ev) => {
      arrasto = null;
      svg.style.cursor = 'grab';
      try { if (svg.hasPointerCapture(ev.pointerId)) svg.releasePointerCapture(ev.pointerId); } catch (e) { /* ok */ }
    };
    const aoTecla = (ev) => {
      const d = { ArrowLeft: [-PASSO, 0], ArrowRight: [PASSO, 0], ArrowUp: [0, PASSO], ArrowDown: [0, -PASSO] }[ev.key];
      if (!d) return;
      ev.preventDefault();
      rodar(d[0], d[1]);
    };
    const aoEscolher = () => { est.id = sel.value; repor(); };
    svg.addEventListener('pointerdown', aoPremir);
    svg.addEventListener('pointermove', aoMover);
    svg.addEventListener('pointerup', aoSoltar);
    svg.addEventListener('pointercancel', aoSoltar);
    svg.addEventListener('keydown', aoTecla);
    sel.addEventListener('change', aoEscolher);

    desenhar();

    return {
      destruir() {
        svg.removeEventListener('pointerdown', aoPremir);
        svg.removeEventListener('pointermove', aoMover);
        svg.removeEventListener('pointerup', aoSoltar);
        svg.removeEventListener('pointercancel', aoSoltar);
        svg.removeEventListener('keydown', aoTecla);
        sel.removeEventListener('change', aoEscolher);
        botoes.forEach(([b, fn]) => b.removeEventListener('click', fn));
        el.textContent = '';
      },
    };
  },
});
