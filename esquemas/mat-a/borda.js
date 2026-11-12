globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('borda', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const C = Manual.calc.cidadania;
    opcoes = opcoes || {};
    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function inteiro(v, omissao) {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 0 ? Math.min(n, 1e6) : omissao;
    }

    const candidatos = Array.isArray(opcoes.candidatos) && opcoes.candidatos.length >= 2
      ? opcoes.candidatos.map(String) : ['Ana', 'Bruno', 'Carla'];
    const n = candidatos.length;
    const ordemValida = (o) => Array.isArray(o) && o.length === n
      && new Set(o).size === n && o.every((c) => Number.isInteger(c) && c >= 0 && c < n);
    let boletins = Array.isArray(opcoes.boletins) && opcoes.boletins.some((b) => ordemValida(b.ordem))
      ? opcoes.boletins.filter((b) => ordemValida(b.ordem)).map((b) => ({ ordem: b.ordem.slice(), quantidade: inteiro(b.quantidade, 0) }))
      : null;
    if (!boletins) {
      if (n === 3 && !opcoes.candidatos) {
        boletins = [
          { ordem: [0, 1, 2], quantidade: 4 },
          { ordem: [1, 2, 0], quantidade: 3 },
          { ordem: [2, 1, 0], quantidade: 3 },
        ];
      } else {
        // rotações cíclicas da ordem de candidatos
        boletins = candidatos.map((_, i) => ({
          ordem: candidatos.map((__, j) => (i + j) % n),
          quantidade: 3,
        }));
      }
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-borda');
    el.appendChild(raiz);

    raiz.appendChild(criar('p', null, 'Edita a quantidade de boletins de cada tipo. A ordem indica a preferência, do 1.º ao último lugar.'));
    const zonaCampos = criar('div');
    boletins.forEach((b, i) => {
      const linha = criar('div', 'esq-linha');
      const campo = criar('input', 'campo-numero');
      const nomeOrdem = b.ordem.map((c) => candidatos[c]).join(' > ');
      campo.type = 'number'; campo.min = '0'; campo.step = '1';
      campo.value = String(b.quantidade);
      campo.setAttribute('aria-label', 'Quantidade de boletins ' + nomeOrdem);
      campo.addEventListener('input', () => {
        if (campo.value.trim() === '') return;
        boletins[i].quantidade = inteiro(campo.value, 0);
        atualizar();
      });
      campo.addEventListener('change', () => { campo.value = String(boletins[i].quantidade); });
      linha.appendChild(criar('span', 'nome', nomeOrdem));
      linha.appendChild(campo);
      zonaCampos.appendChild(linha);
    });
    raiz.appendChild(zonaCampos);

    const zonaResultado = criar('div');
    zonaResultado.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaResultado);

    function barras(titulo, valores, rotulo, cor) {
      const caixa = criar('div', 'barras');
      caixa.appendChild(criar('div', 'esq-subtitulo', titulo));
      const max = Math.max(1, ...valores);
      candidatos.forEach((c, i) => {
        const linha = criar('div', 'barra-linha');
        linha.appendChild(criar('span', null, c));
        const pista = criar('div', 'barra-pista');
        const enc = criar('div', 'barra-enchimento');
        enc.style.width = (100 * valores[i] / max) + '%';
        enc.style.background = cor;
        pista.appendChild(enc);
        linha.appendChild(pista);
        linha.appendChild(criar('span', 'barra-valor', fmt(valores[i]) + ' ' + rotulo));
        caixa.appendChild(linha);
      });
      return caixa;
    }

    const nome = (i, vazio) => (i === null ? vazio : candidatos[i]);

    function atualizar() {
      zonaResultado.textContent = '';
      const total = boletins.reduce((s, b) => s + b.quantidade, 0);
      if (total === 0) {
        zonaResultado.appendChild(criar('p', 'esq-aviso', 'Sem boletins: indica pelo menos um voto.'));
        return;
      }
      const primeiros = new Array(n).fill(0);
      for (const b of boletins) primeiros[b.ordem[0]] += b.quantidade;
      const mai = C.maioria(primeiros);
      const bor = C.borda(boletins, n);

      // pontos de Borda por candidato, com a soma explícita
      zonaResultado.appendChild(criar('div', 'esq-subtitulo', 'Pontos de Borda (1.º lugar = ' + n + ' pontos, …, último = 1 ponto)'));
      const linhasSoma = candidatos.map((c, i) => {
        const termos = boletins.filter((b) => b.quantidade > 0).map((b) => {
          const pts = C.borda([{ ordem: b.ordem, quantidade: 1 }], n).pontos[i];
          return b.quantidade + '×' + pts;
        });
        return [c, termos.join(' + ') + ' = ' + fmt(bor.pontos[i]), primeiros[i]];
      });
      N.tabela(zonaResultado, ['Candidato', 'Soma (quantidade × pontos)', '1.os lugares'], linhasSoma);

      const painelEl = criar('div');
      zonaResultado.appendChild(painelEl);
      const vMai = nome(mai.simples, 'empate (sem vencedor único)');
      const vAbs = nome(mai.absoluta, 'ninguém atinge ' + fmt(mai.limiarAbsoluta) + ' votos');
      const vBor = nome(bor.vencedor, 'empate (sem vencedor único)');
      N.painelValores(painelEl).definir([
        ['Total de boletins', fmt(total)],
        ['Limiar da maioria absoluta', fmt(mai.limiarAbsoluta) + ' (mais de metade de ' + fmt(mai.total) + ')'],
        ['Maioria simples (mais 1.os lugares)', vMai],
        ['Maioria absoluta', vAbs],
        ['Borda (mais pontos)', vBor],
      ]);

      const vencedores = new Set([mai.simples, mai.absoluta, bor.vencedor].filter((v) => v !== null));
      const nomes = [];
      if (mai.simples !== null) nomes.push('maioria simples: ' + candidatos[mai.simples]);
      if (mai.absoluta !== null) nomes.push('maioria absoluta: ' + candidatos[mai.absoluta]);
      if (bor.vencedor !== null) nomes.push('Borda: ' + candidatos[bor.vencedor]);
      if (vencedores.size > 1) {
        zonaResultado.appendChild(criar('p', 'esq-aviso', 'Os métodos divergem (' + nomes.join('; ') + '): o vencedor depende do sistema de votação.'));
      } else if (mai.absoluta === null) {
        zonaResultado.appendChild(criar('p', null, 'Não há maioria absoluta; os restantes métodos coincidem.'));
      } else {
        zonaResultado.appendChild(criar('p', null, 'Os métodos coincidem no vencedor.'));
      }

      const col = criar('div', 'esq-colunas');
      col.appendChild(barras('1.os lugares', primeiros, 'votos', 'var(--cor-1)'));
      col.appendChild(barras('Pontos de Borda', bor.pontos, 'pontos', 'var(--cor-2)'));
      zonaResultado.appendChild(col);
    }

    atualizar();

    return { destruir() { el.textContent = ''; } };
  },
});
