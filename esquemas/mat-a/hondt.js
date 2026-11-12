globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('hondt', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const C = Manual.calc.cidadania;
    opcoes = opcoes || {};
    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });
    const MIN_PARTIDOS = 3, MAX_PARTIDOS = 6, MAX_MANDATOS = 30, PASSO_VOTOS = 500;
    const LETRAS = 'ABCDEF';

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function inteiro(v, min, max, omissao) {
      let n = Math.floor(Number(v));
      if (!Number.isFinite(n)) n = omissao;
      return Math.min(Math.max(n, min), max);
    }

    const iniciais = Array.isArray(opcoes.partidos) && opcoes.partidos.length
      ? opcoes.partidos
      : [{ nome: 'A', votos: 10000 }, { nome: 'B', votos: 6000 }, { nome: 'C', votos: 3500 }, { nome: 'D', votos: 1500 }];
    const partidos = iniciais.slice(0, MAX_PARTIDOS).map((p, i) => ({
      nome: String(p.nome || LETRAS[i]),
      votos: inteiro(p.votos, 0, 1e9, 0),
    }));
    while (partidos.length < MIN_PARTIDOS) partidos.push({ nome: LETRAS[partidos.length], votos: 0 });
    if (partidos.every((p) => p.votos === 0)) partidos[0].votos = 1;
    let mandatos = inteiro(opcoes.mandatos, 1, MAX_MANDATOS, 7);
    let metodo = opcoes.metodo === 'stlague' ? 'stlague' : 'hondt';
    let comparar = false;
    let passo = mandatos;

    const nomeMetodo = (m) => (m === 'stlague' ? 'St. Laguë' : "D'Hondt");
    const calcular = (m) => (m === 'stlague' ? C.stLague : C.hondt)(partidos.map((p) => p.votos), mandatos);
    const semOutros = (i) => partidos.every((p, j) => j === i || p.votos === 0);

    el.textContent = '';
    const raiz = criar('div', 'esq-hondt');
    el.appendChild(raiz);

    // ---------- controlos ----------
    const zonaMetodo = criar('div', 'esq-controlos');
    zonaMetodo.setAttribute('role', 'group');
    zonaMetodo.setAttribute('aria-label', 'Método de conversão de votos em mandatos');
    const botoesMetodo = {};
    for (const m of ['hondt', 'stlague']) {
      const b = criar('button', 'botao', nomeMetodo(m));
      b.type = 'button';
      b.addEventListener('click', () => { metodo = m; passo = mandatos; atualizar(); });
      botoesMetodo[m] = b;
      zonaMetodo.appendChild(b);
    }
    const botaoComparar = criar('button', 'botao', 'Comparar os dois métodos');
    botaoComparar.type = 'button';
    botaoComparar.addEventListener('click', () => { comparar = !comparar; atualizar(); });
    zonaMetodo.appendChild(botaoComparar);
    raiz.appendChild(zonaMetodo);

    const zonaMandatos = criar('div', 'esq-controlos');
    const rotMand = criar('label', null, 'Mandatos (1 a ' + MAX_MANDATOS + '): ');
    const campoMand = criar('input', 'campo-numero');
    campoMand.type = 'number'; campoMand.min = '1'; campoMand.max = String(MAX_MANDATOS); campoMand.step = '1';
    campoMand.value = String(mandatos);
    campoMand.addEventListener('input', () => {
      if (campoMand.value.trim() === '') return;
      mandatos = inteiro(campoMand.value, 1, MAX_MANDATOS, mandatos);
      passo = mandatos;
      atualizar();
    });
    campoMand.addEventListener('change', () => { campoMand.value = String(mandatos); });
    rotMand.appendChild(campoMand);
    zonaMandatos.appendChild(rotMand);
    raiz.appendChild(zonaMandatos);

    const zonaPartidos = criar('div', 'esq-partidos');
    raiz.appendChild(zonaPartidos);
    const zonaAjustar = criar('div', 'esq-controlos');
    const botaoMais = criar('button', 'botao', 'Adicionar partido');
    botaoMais.type = 'button';
    const botaoMenos = criar('button', 'botao', 'Remover último partido');
    botaoMenos.type = 'button';
    const podeRemover = () => partidos.length > MIN_PARTIDOS && partidos.slice(0, -1).some((p) => p.votos > 0);
    botaoMais.addEventListener('click', () => {
      if (partidos.length >= MAX_PARTIDOS) return;
      partidos.push({ nome: LETRAS[partidos.length], votos: 1000 });
      passo = mandatos;
      construirPartidos();
      atualizar();
    });
    botaoMenos.addEventListener('click', () => {
      if (!podeRemover()) return;
      partidos.pop();
      passo = mandatos;
      construirPartidos();
      atualizar();
    });
    zonaAjustar.appendChild(botaoMais);
    zonaAjustar.appendChild(botaoMenos);
    raiz.appendChild(zonaAjustar);

    function definirVotos(i, v) {
      let n = inteiro(v, 0, 1e9, 0);
      if (n === 0 && semOutros(i)) n = 1; // mantém pelo menos um partido com votos
      partidos[i].votos = n;
      passo = mandatos;
    }
    function construirPartidos() {
      zonaPartidos.textContent = '';
      partidos.forEach((p, i) => {
        const linha = criar('div', 'esq-linha');
        linha.appendChild(criar('span', 'nome', 'Partido ' + p.nome));
        const menos = criar('button', 'botao', '−');
        menos.type = 'button';
        menos.setAttribute('aria-label', 'Menos ' + PASSO_VOTOS + ' votos para o partido ' + p.nome);
        const campo = criar('input', 'campo-numero');
        campo.type = 'number'; campo.min = '0'; campo.step = '1';
        campo.value = String(p.votos);
        campo.setAttribute('aria-label', 'Votos do partido ' + p.nome);
        const mais = criar('button', 'botao', '+');
        mais.type = 'button';
        mais.setAttribute('aria-label', 'Mais ' + PASSO_VOTOS + ' votos para o partido ' + p.nome);
        campo.addEventListener('input', () => {
          if (campo.value.trim() === '') return;
          definirVotos(i, campo.value);
          if (inteiro(campo.value, 0, 1e9, 0) !== partidos[i].votos) campo.value = String(partidos[i].votos);
          atualizar();
        });
        campo.addEventListener('change', () => { campo.value = String(partidos[i].votos); });
        menos.addEventListener('click', () => { definirVotos(i, partidos[i].votos - PASSO_VOTOS); campo.value = String(partidos[i].votos); atualizar(); });
        mais.addEventListener('click', () => { definirVotos(i, partidos[i].votos + PASSO_VOTOS); campo.value = String(partidos[i].votos); atualizar(); });
        linha.appendChild(menos);
        linha.appendChild(campo);
        linha.appendChild(mais);
        zonaPartidos.appendChild(linha);
      });
    }

    const zonaPassos = criar('div', 'esq-controlos');
    const botaoPasso = criar('button', 'botao botao-principal', 'Passo seguinte');
    botaoPasso.type = 'button';
    const botaoTudo = criar('button', 'botao', 'Mostrar tudo');
    botaoTudo.type = 'button';
    const botaoRecomecar = criar('button', 'botao', 'Recomeçar');
    botaoRecomecar.type = 'button';
    botaoPasso.addEventListener('click', () => { if (passo < mandatos) { passo += 1; atualizar(); } });
    botaoTudo.addEventListener('click', () => { passo = mandatos; atualizar(); });
    botaoRecomecar.addEventListener('click', () => { passo = 0; atualizar(); });
    zonaPassos.appendChild(botaoPasso);
    zonaPassos.appendChild(botaoTudo);
    zonaPassos.appendChild(botaoRecomecar);
    raiz.appendChild(zonaPassos);

    const zonaResultado = criar('div', 'esq-resultado');
    zonaResultado.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaResultado);

    // ---------- vistas ----------
    function barras(titulo, mandatosPorPartido, total, cor) {
      const caixa = criar('div', 'barras');
      caixa.appendChild(criar('div', 'esq-subtitulo', titulo));
      const max = Math.max(1, total);
      partidos.forEach((p, i) => {
        const linha = criar('div', 'barra-linha');
        linha.appendChild(criar('span', null, 'Partido ' + p.nome));
        const pista = criar('div', 'barra-pista');
        const enc = criar('div', 'barra-enchimento');
        enc.style.width = (100 * mandatosPorPartido[i] / max) + '%';
        enc.style.background = cor;
        pista.appendChild(enc);
        linha.appendChild(pista);
        linha.appendChild(criar('span', 'barra-valor', mandatosPorPartido[i] + (mandatosPorPartido[i] === 1 ? ' mandato' : ' mandatos')));
        caixa.appendChild(linha);
      });
      return caixa;
    }

    function contarAte(res, n) {
      const c = new Array(partidos.length).fill(0);
      for (let i = 0; i < n; i++) c[res.atribuicoes[i].partido] += 1;
      return c;
    }

    function tabelaQuocientes(res, n) {
      const envol = criar('div', 'quadro-envolvente');
      const t = criar('table');
      t.setAttribute('aria-label', 'Quocientes de ' + nomeMetodo(metodo));
      const cab = criar('tr');
      cab.appendChild(criar('th', null, 'Partido (votos)'));
      for (let k = 0; k < mandatos; k++) {
        const divisor = metodo === 'stlague' ? 2 * k + 1 : k + 1;
        cab.appendChild(criar('th', 'numero', '÷' + divisor));
      }
      const th = criar('thead');
      th.appendChild(cab);
      t.appendChild(th);
      // partido -> índice do divisor -> n.º do mandato (só passos visíveis)
      const vence = partidos.map(() => ({}));
      const contagem = new Array(partidos.length).fill(0);
      for (let i = 0; i < n; i++) {
        const p = res.atribuicoes[i].partido;
        vence[p][contagem[p]] = i + 1;
        contagem[p] += 1;
      }
      const tb = criar('tbody');
      partidos.forEach((p, i) => {
        const tr = criar('tr');
        tr.appendChild(criar('th', null, p.nome + ' (' + fmt(p.votos) + ')'));
        for (let k = 0; k < mandatos; k++) {
          const td = criar('td', 'numero', fmt(res.quocientes[i][k]));
          if (vence[i][k]) {
            td.className = 'numero vencedor';
            td.appendChild(criar('sup', null, ' ' + vence[i][k] + '.º'));
            td.title = vence[i][k] + '.º mandato';
          }
          tr.appendChild(td);
        }
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      envol.appendChild(t);
      return envol;
    }

    function listaPassos(res, n) {
      const ol = criar('ol');
      for (let i = 0; i < n; i++) {
        const a = res.atribuicoes[i];
        const p = partidos[a.partido];
        ol.appendChild(criar('li', null,
          'Partido ' + p.nome + ' (' + fmt(p.votos) + ' ÷ ' + a.divisor + ' = ' + fmt(a.quociente) + ')'));
      }
      return ol;
    }

    function atualizar() {
      for (const m in botoesMetodo) botoesMetodo[m].setAttribute('aria-pressed', String(metodo === m));
      botaoComparar.setAttribute('aria-pressed', String(comparar));
      botaoPasso.disabled = passo >= mandatos;
      botaoTudo.disabled = passo >= mandatos;
      botaoRecomecar.disabled = passo === 0;
      botaoMais.disabled = partidos.length >= MAX_PARTIDOS;
      botaoMenos.disabled = !podeRemover();

      zonaResultado.textContent = '';
      const res = calcular(metodo);
      const cont = contarAte(res, passo);
      const totalVotos = partidos.reduce((s, p) => s + p.votos, 0);

      const painelEl = criar('div');
      zonaResultado.appendChild(painelEl);
      const linhas = [
        ['Método', nomeMetodo(metodo) + (metodo === 'stlague' ? ' (divisores 1, 3, 5, …)' : ' (divisores 1, 2, 3, …)')],
        ['Total de votos', fmt(totalVotos)],
        ['Mandatos atribuídos', passo + ' de ' + mandatos],
      ];
      partidos.forEach((p, i) => linhas.push(['Partido ' + p.nome, fmt(p.votos) + ' votos → ' + cont[i] + ' mandato(s)']));
      N.painelValores(painelEl).definir(linhas);

      zonaResultado.appendChild(criar('div', 'esq-subtitulo', 'Tabela de quocientes (votos ÷ divisor)'));
      zonaResultado.appendChild(tabelaQuocientes(res, passo));
      if (passo > 0) {
        zonaResultado.appendChild(criar('div', 'esq-subtitulo', 'Ordem de atribuição'));
        zonaResultado.appendChild(listaPassos(res, passo));
      }
      zonaResultado.appendChild(barras('Mandatos (' + nomeMetodo(metodo) + ')', cont, mandatos, 'var(--cor-1)'));

      if (comparar) {
        const h = calcular('hondt');
        const s = calcular('stlague');
        zonaResultado.appendChild(criar('div', 'esq-subtitulo', "Comparar: D'Hondt e St. Laguë (resultado final)"));
        N.tabela(zonaResultado, ['Partido', 'Votos', "D'Hondt", 'St. Laguë', 'Resultado'],
          partidos.map((p, i) => ['Partido ' + p.nome, fmt(p.votos), h.mandatos[i], s.mandatos[i],
            h.mandatos[i] === s.mandatos[i] ? 'igual' : 'difere']));
        const col = criar('div', 'esq-colunas');
        col.appendChild(barras("D'Hondt", h.mandatos, mandatos, 'var(--cor-1)'));
        col.appendChild(barras('St. Laguë', s.mandatos, mandatos, 'var(--cor-2)'));
        zonaResultado.appendChild(col);
        const diferem = partidos.some((p, i) => h.mandatos[i] !== s.mandatos[i]);
        zonaResultado.appendChild(criar('p', diferem ? 'esq-aviso' : null,
          diferem ? 'Os dois métodos dão resultados diferentes: St. Laguë favorece menos os partidos grandes.'
            : 'Neste caso os dois métodos dão o mesmo resultado.'));
      }
    }

    construirPartidos();
    atualizar();

    return { destruir() { el.textContent = ''; } };
  },
});
