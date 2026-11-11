globalThis.Manual = globalThis.Manual || {};

// Parte uma string em pedaços { tipo: 'texto'|'negrito'|'math', valor, display? }.
// Sintaxe: $...$ (math inline), $$...$$ (math display), **...** (negrito), \$ (cifrão literal).
Manual.texto = {
  partir(s) {
    const pedacos = [];
    let texto = '';
    const fechar = () => {
      if (texto) pedacos.push({ tipo: 'texto', valor: texto });
      texto = '';
    };
    let i = 0;
    while (i < s.length) {
      if (s[i] === '\\' && s[i + 1] === '$') {
        texto += '$';
        i += 2;
      } else if (s.startsWith('$$', i)) {
        const fim = s.indexOf('$$', i + 2);
        if (fim === -1) {
          texto += '$$';
          i += 2;
        } else {
          fechar();
          pedacos.push({ tipo: 'math', valor: s.slice(i + 2, fim), display: true });
          i = fim + 2;
        }
      } else if (s[i] === '$') {
        const fim = s.indexOf('$', i + 1);
        if (fim === -1) {
          texto += '$';
          i += 1;
        } else {
          fechar();
          pedacos.push({ tipo: 'math', valor: s.slice(i + 1, fim), display: false });
          i = fim + 1;
        }
      } else if (s.startsWith('**', i)) {
        const fim = s.indexOf('**', i + 2);
        if (fim === -1) {
          texto += '**';
          i += 2;
        } else {
          fechar();
          pedacos.push({ tipo: 'negrito', valor: s.slice(i + 2, fim) });
          i = fim + 2;
        }
      } else {
        texto += s[i];
        i += 1;
      }
    }
    fechar();
    return pedacos;
  },
};
