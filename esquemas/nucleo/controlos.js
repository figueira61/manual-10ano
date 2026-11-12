globalThis.Manual = globalThis.Manual || {};
Manual.nucleo = Manual.nucleo || {};

(function () {
  const N = Manual.nucleo;
  let contador = 0;
  const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 3 });

  function slider(el, opcoes) {
    const id = 'slider-' + (++contador);
    const caixa = document.createElement('div');
    caixa.className = 'controlo-slider';
    const lab = document.createElement('label');
    lab.setAttribute('for', id);
    lab.textContent = opcoes.rotulo + ' = ';
    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = String(opcoes.min);
    input.max = String(opcoes.max);
    input.step = String(opcoes.passo || 1);
    input.value = String(opcoes.valor);
    input.style.width = '100%';
    const saida = document.createElement('output');
    saida.setAttribute('for', id);
    saida.textContent = fmt(input.value);
    lab.appendChild(saida);
    caixa.appendChild(lab);
    caixa.appendChild(input);
    el.appendChild(caixa);
    const aoInput = () => {
      saida.textContent = fmt(input.value);
      if (opcoes.aoMudar) opcoes.aoMudar(Number(input.value));
    };
    input.addEventListener('input', aoInput);
    return {
      valor: () => Number(input.value),
      definir(v) {
        input.value = String(v);
        saida.textContent = fmt(input.value);
        if (opcoes.aoMudar) opcoes.aoMudar(Number(input.value));
      },
      destruir() {
        input.removeEventListener('input', aoInput);
        if (caixa.parentNode) caixa.parentNode.removeChild(caixa);
      },
    };
  }

  function painelValores(el) {
    const caixa = document.createElement('dl');
    caixa.className = 'painel-valores';
    caixa.setAttribute('aria-live', 'polite');
    el.appendChild(caixa);
    return {
      definir(linhas) {
        caixa.textContent = '';
        for (const [rotulo, valor] of linhas) {
          const dt = document.createElement('dt');
          dt.textContent = rotulo;
          const dd = document.createElement('dd');
          dd.textContent = valor;
          caixa.appendChild(dt);
          caixa.appendChild(dd);
        }
      },
    };
  }

  function tabela(el, cabecalho, linhas) {
    const t = document.createElement('table');
    const th = document.createElement('thead');
    const tr = document.createElement('tr');
    for (const c of cabecalho) {
      const e = document.createElement('th');
      e.textContent = c;
      tr.appendChild(e);
    }
    th.appendChild(tr);
    t.appendChild(th);
    const tb = document.createElement('tbody');
    for (const l of linhas) {
      const r = document.createElement('tr');
      for (const c of l) {
        const e = document.createElement('td');
        e.textContent = typeof c === 'number' ? c.toLocaleString('pt-PT') : String(c);
        r.appendChild(e);
      }
      tb.appendChild(r);
    }
    t.appendChild(tb);
    el.appendChild(t);
    return t;
  }

  N.slider = slider;
  N.painelValores = painelValores;
  N.tabela = tabela;
})();
