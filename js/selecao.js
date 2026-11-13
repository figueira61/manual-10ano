globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  function ordenar(lista) {
    return (Array.isArray(lista) ? lista : [])
      .filter((t) => t && typeof t === 'object' && Number.isFinite(Date.parse(t.criado_em)))
      .sort((a, b) => {
        const d = Date.parse(a.criado_em) - Date.parse(b.criado_em);
        if (d) return d;
        const ia = String(a.id), ib = String(b.id);
        return ia < ib ? -1 : ia > ib ? 1 : 0;
      });
  }

  function pesoTipo(tentativasDoTipo) {
    const ord = ordenar(tentativasDoTipo);
    if (Manual.aprendizagem.estadoTipo(ord) === 'nao_resolvido') return 4;
    if (ord.slice(-4).some((t) => t.resultado === 'errada')) return 3;
    if (!ord.length) return 2;
    const ult = ord.slice(-3);
    const limpa = (t) => t.resultado === 'certa' && t.primeira_tentativa && !t.viu_resolucao && !t.usou_pista;
    if (ult.length === 3 && ult.every(limpa)) return 0.5;
    return 1;
  }

  const semSemente = (c) => c.semente === undefined || c.semente === null;

  // Índice de `pesos` sorteado com probabilidade proporcional ao peso.
  function sortear(pesos, rng) {
    const total = pesos.reduce((s, p) => s + p, 0);
    let x = rng() * total;
    for (let i = 0; i < pesos.length; i++) {
      x -= pesos[i];
      if (x < 0) return i;
    }
    return pesos.length - 1;
  }

  function escolher(candidatos, historico, opcoes) {
    const { n = 1, rng, ultimoErro } = opcoes || {};
    const lista = Array.isArray(candidatos) ? candidatos.filter((c) => c && typeof c === 'object') : [];
    const porTipo = {};
    ordenar(historico).forEach((t) => { (porTipo[t.tipo] = porTipo[t.tipo] || []).push(t); });

    const visto = (c) => (porTipo[c.tipo] || []).some((t) => t.semente != null && t.semente === c.semente);
    const pesoDe = (c) => pesoTipo(porTipo[c.tipo] || []);
    const ultimoVisto = (c) => {
      const h = porTipo[c.tipo];
      return h && h.length ? Date.parse(h[h.length - 1].criado_em) : -Infinity;
    };

    let pool = lista.filter((c) => semSemente(c) || !visto(c));

    // Banco: entre perguntas com o mesmo peso, preferir as não vistas e depois as vistas
    // há mais tempo, sem nunca ficar com menos tipos do que os pedidos.
    const classes = {};
    pool.filter(semSemente).forEach((c) => { (classes[pesoDe(c)] = classes[pesoDe(c)] || []).push(c); });
    Object.keys(classes).forEach((k) => {
      const tempos = Array.from(new Set(classes[k].map(ultimoVisto))).sort((a, b) => a - b);
      for (let i = tempos.length - 1; i > 0; i--) {
        const fora = classes[k].filter((c) => ultimoVisto(c) === tempos[i]);
        const restantes = pool.filter((c) => !fora.includes(c));
        if (new Set(restantes.map((c) => c.tipo)).size < n) break;
        pool = restantes;
      }
    });

    const grupos = new Map();
    pool.forEach((c) => {
      if (!grupos.has(c.tipo)) grupos.set(c.tipo, []);
      grupos.get(c.tipo).push(c);
    });
    const resultado = [];
    const pesoGrupo = (tp) => pesoDe(grupos.get(tp)[0]);

    if (ultimoErro && n > 0 && grupos.size) {
      const diferente = (c) => c.formato !== ultimoErro.formato || c.contexto !== ultimoErro.contexto;
      const mesma = Array.from(grupos.keys()).filter((tp) => grupos.get(tp).some((c) => c.competencia === ultimoErro.competencia));
      const outro = mesma.filter((tp) => grupos.get(tp).some((c) => c.competencia === ultimoErro.competencia && diferente(c)));
      const alvo = outro.length ? outro : mesma;
      if (alvo.length) {
        const tipo = alvo[sortear(alvo.map(pesoGrupo), rng)];
        let g = grupos.get(tipo).filter((c) => c.competencia === ultimoErro.competencia);
        if (outro.length) g = g.filter(diferente);
        resultado.push(g[Math.floor(rng() * g.length)]);
        grupos.delete(tipo);
      }
    }
    while (resultado.length < n && grupos.size) {
      const tipos = Array.from(grupos.keys());
      const tipo = tipos[sortear(tipos.map(pesoGrupo), rng)];
      const g = grupos.get(tipo);
      resultado.push(g[Math.floor(rng() * g.length)]);
      grupos.delete(tipo);
    }
    return resultado;
  }

  function estratificar(candidatos, temas, n, rng) {
    const lista = Array.isArray(candidatos) ? candidatos : [];
    const ordem = Array.isArray(temas) ? temas : [];
    const k = ordem.length;
    if (!k || !(n > 0)) return [];
    const usados = new Set();
    const filas = ordem.map((tema) => Manual.aleatorio.baralhar(rng, lista.filter((c) => c && c.tema === tema)));
    const saida = [];
    const tirar = (i, max) => {
      let tirados = 0;
      while (tirados < max && filas[i].length) {
        const c = filas[i].shift();
        if (usados.has(c.tipo)) continue;
        usados.add(c.tipo);
        saida.push(c);
        tirados++;
      }
      return tirados;
    };
    const base = Math.floor(n / k), resto = n % k;
    let falta = 0;
    for (let i = 0; i < k; i++) {
      const quota = base + (i < resto ? 1 : 0) + falta;
      falta = quota - tirar(i, quota);
    }
    // Quota ainda por preencher: aproveitar sobras dos temas anteriores.
    for (let i = 0; i < k && falta > 0; i++) falta -= tirar(i, falta);
    return saida;
  }

  Manual.selecao = { pesoTipo, escolher, estratificar };
})();
