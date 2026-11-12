globalThis.Manual = globalThis.Manual || {};

// Ícones em traço (SVG 24×24), desenhados para o manual. Construídos com DOM
// (createElementNS), sem innerHTML. A cor vem de `currentColor`.
(function () {
  const NS = 'http://www.w3.org/2000/svg';

  // Cada ícone é uma lista de [elemento, atributos].
  const FORMAS = {
    // Matemática A: eixos e parábola
    'mat-a': [
      ['path', { d: 'M3 3v18h18' }],
      ['path', { d: 'M6 5c1.6 7.5 3.6 11 6.5 11S17.4 12.5 19 5' }],
    ],
    // Física e Química A: átomo
    'fqa': [
      ['ellipse', { cx: 12, cy: 12, rx: 10, ry: 4 }],
      ['ellipse', { cx: 12, cy: 12, rx: 10, ry: 4, transform: 'rotate(60 12 12)' }],
      ['ellipse', { cx: 12, cy: 12, rx: 10, ry: 4, transform: 'rotate(-60 12 12)' }],
      ['circle', { cx: 12, cy: 12, r: 1.6, fill: 'currentColor' }],
    ],
    // Biologia e Geologia: folha e montanha
    'bg': [
      ['path', { d: 'M4 20c0-8.5 5.5-15 16-16 0 10-6 16-16 16z' }],
      ['path', { d: 'M4 20 13 11' }],
    ],
    // Português: livro aberto com linhas de texto
    'port': [
      ['path', { d: 'M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5z' }],
      ['path', { d: 'M12 6.5v13' }],
      ['path', { d: 'M6 9h3M6 12h3M15 9h3M15 12h3' }],
    ],
    // Filosofia: templo clássico (pórtico com colunas)
    'fil': [
      ['path', { d: 'M3 8 12 3l9 5z' }],
      ['path', { d: 'M6 8v9M10 8v9M14 8v9M18 8v9' }],
      ['path', { d: 'M4 17h16M3 21h18' }],
    ],
    // Inglês: dois balões de diálogo
    'ing': [
      ['path', { d: 'M3 5h11a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 14 14H8l-4 3v-3H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 5z' }],
      ['path', { d: 'M18 9h2.5A1.5 1.5 0 0 1 22 10.5v6a1.5 1.5 0 0 1-1.5 1.5H20v3l-4-3h-4.5a1.5 1.5 0 0 1-1.5-1.5V17' }],
    ],
    // Utilitários
    'procurar': [
      ['circle', { cx: 11, cy: 11, r: 7 }],
      ['path', { d: 'm20 20-4-4' }],
    ],
    'seta': [
      ['path', { d: 'M5 12h14M13 6l6 6-6 6' }],
    ],
    'escudo': [
      ['path', { d: 'M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z' }],
      ['path', { d: 'm9 12 2 2 4-4' }],
    ],
  };

  function svg(id, classe) {
    const formas = FORMAS[id];
    if (!formas) return null;
    const raiz = document.createElementNS(NS, 'svg');
    raiz.setAttribute('viewBox', '0 0 24 24');
    raiz.setAttribute('fill', 'none');
    raiz.setAttribute('stroke', 'currentColor');
    raiz.setAttribute('stroke-width', '1.8');
    raiz.setAttribute('stroke-linecap', 'round');
    raiz.setAttribute('stroke-linejoin', 'round');
    raiz.setAttribute('aria-hidden', 'true');
    raiz.setAttribute('focusable', 'false');
    raiz.setAttribute('class', 'icone' + (classe ? ' ' + classe : ''));
    formas.forEach(function (f) {
      const el = document.createElementNS(NS, f[0]);
      Object.keys(f[1]).forEach(function (k) { el.setAttribute(k, String(f[1][k])); });
      raiz.appendChild(el);
    });
    return raiz;
  }

  Manual.icones = {
    svg: svg,
    existe: function (id) { return Object.prototype.hasOwnProperty.call(FORMAS, id); },
  };
})();
