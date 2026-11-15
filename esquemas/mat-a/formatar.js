globalThis.Manual = globalThis.Manual || {};

// Formatação de expressões algébricas para texto (sinal "−" unicode, coeficiente 1 omitido).
Manual.formatar = (function () {
  const arred = (v) => Math.round(v * 1e9) / 1e9 + 0;
  const num = (v) => arred(v).toLocaleString('pt-PT', { maximumFractionDigits: 3 }).replace(/-/g, '−');

  // termos: [[coeficiente, 'x²'], [coeficiente, 'x'], [coeficiente, '']] (parte literal '' = constante)
  function soma(termos) {
    let s = '';
    for (const [c0, lit] of termos) {
      const c = arred(c0);
      if (c === 0) continue;
      const abs = Math.abs(c);
      const corpo = lit && abs === 1 ? lit : num(abs) + lit;
      if (s === '') s = (c < 0 ? '−' : '') + corpo;
      else s += (c < 0 ? ' − ' : ' + ') + corpo;
    }
    return s === '' ? '0' : s;
  }

  // ax² + bx + c
  function polinomio(a, b, c) {
    return soma([[a, 'x²'], [b, 'x'], [c, '']]);
  }

  // a(x − h)² + k
  function canonica(a, h, k) {
    const ra = arred(a), rh = arred(h);
    const base = rh === 0 ? 'x²' : '(x ' + (rh < 0 ? '+ ' : '− ') + num(Math.abs(rh)) + ')²';
    const coef = ra === 1 ? '' : ra === -1 ? '−' : num(ra);
    const parte = coef + base;
    const rk = arred(k);
    return rk === 0 ? parte : parte + (rk < 0 ? ' − ' : ' + ') + num(Math.abs(rk));
  }

  // (x − a)², (x + a)² ou x² (se a = 0); termo é o nome da variável
  function fator(termo, a) {
    const ra = arred(a);
    if (ra === 0) return termo + '²';
    return '(' + termo + (ra < 0 ? ' + ' : ' − ') + num(Math.abs(ra)) + ')²';
  }

  // "≈ " quando o valor mostrado (3 casas decimais) difere do valor real
  const aprox = (v) => (Math.abs(Math.round(v * 1000) / 1000 - v) > 1e-9 ? '≈ ' : '');

  // Notação científica em LaTeX: mantissa em [1, 10) com `as` algarismos significativos e vírgula
  // decimal, ex.: cientifico(6.022e23, 3) → '6{,}02 \times 10^{23}'. Com expoente 0 só a mantissa.
  function cientifico(x, as = 3) {
    if (!Number.isFinite(x)) throw new Error('cientifico: valor não finito');
    if (!Number.isInteger(as) || as < 1) throw new Error('cientifico: algarismos significativos inválidos');
    if (x === 0) return '0';
    // toExponential arredonda a mantissa e já trata 9,999… → 1,00 × 10^(e+1)
    const [mant, exp] = Math.abs(x).toExponential(as - 1).split('e');
    const m = (x < 0 ? '-' : '') + mant.replace('.', '{,}');
    return Number(exp) === 0 ? m : m + ' \\times 10^{' + Number(exp) + '}';
  }

  return { arred, num, soma, polinomio, canonica, fator, aprox, cientifico };
})();
