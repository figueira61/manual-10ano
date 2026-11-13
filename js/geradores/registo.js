globalThis.Manual = globalThis.Manual || {};

// Registo de geradores de exercícios (contrato da spec §6.1) e normalização para a forma do quiz.
Manual.geradores = Object.assign(Manual.geradores || {}, (function () {
  const FORMATOS = ['numerica', 'escolha', 'vf'];
  const defs = [];
  const porId = {};

  function registar(def) {
    if (!def || typeof def.id !== 'string' || def.id === '') throw new Error('gerador sem id');
    if (porId[def.id]) throw new Error('gerador com id repetido: ' + def.id);
    for (const f of ['gerar', 'verificarIndependente', 'limites']) {
      if (typeof def[f] !== 'function') throw new Error('gerador ' + def.id + ' sem ' + f);
    }
    if (!Array.isArray(def.formatos) || def.formatos.length === 0 || def.formatos.some((f) => !FORMATOS.includes(f))) {
      throw new Error('gerador ' + def.id + ' com formatos inválidos (use ' + FORMATOS.join('/') + ')');
    }
    defs.push(def);
    porId[def.id] = def;
    return def;
  }

  function obter(id) {
    return porId[id];
  }

  function todos() {
    return defs.slice();
  }

  function doSubtema(disciplina, subtema) {
    return defs.filter((d) => d.disciplina === disciplina && d.subtema === subtema);
  }

  function contextosDe(def) {
    return Array.isArray(def.contextos) && def.contextos.length ? def.contextos : [null];
  }

  function textoPasso(p) {
    return '**' + p.passo + '** — ' + p.porque + (p.calculo ? ' $' + p.calculo + '$' : '');
  }

  // Gera e normaliza um exercício a partir de uma definição (registada ou não).
  function gerarDe(def, semente, opcoes) {
    const o = opcoes || {};
    const formato = o.formato === undefined ? def.formatos[0] : o.formato;
    if (!def.formatos.includes(formato)) throw new Error('gerador ' + def.id + ' não tem o formato ' + formato);
    const contexto = o.contexto === undefined ? contextosDe(def)[0] : o.contexto;
    const nivel = o.nivel === undefined ? 2 : o.nivel;
    const rng = Manual.aleatorio.criar(semente);
    const ex = def.gerar(semente, { formato, contexto, nivel, rng });
    const detalhada = (ex.resolucao || []).map((p) => {
      const passo = { passo: p.passo, porque: p.porque };
      if (p.calculo) passo.calculo = p.calculo;
      return passo;
    });
    const pergunta = {
      id: def.id, tipo: formato, gerador: def.id, semente, formato, contexto, nivel,
      competencia: def.tipo, enunciado: ex.enunciado,
    };
    for (const campo of ['resposta', 'tolerancia', 'unidade', 'opcoes', 'correta', 'arredondamento']) {
      if (ex[campo] !== undefined) pergunta[campo] = ex[campo];
    }
    pergunta.resolucao = detalhada.map(textoPasso);
    pergunta.resolucaoDetalhada = detalhada;
    pergunta.verificacao = ex.verificacao;
    pergunta.explicacao = '';
    pergunta.errosTipicos = ex.errosTipicos || [];
    for (const campo of ['esquema', 'rever', 'dados']) {
      if (ex[campo] !== undefined) pergunta[campo] = ex[campo];
    }
    return pergunta;
  }

  function gerar(id, semente, opcoes) {
    const def = porId[id];
    if (!def) throw new Error('gerador desconhecido: ' + id);
    return gerarDe(def, semente, opcoes);
  }

  return { FORMATOS, registar, obter, todos, doSubtema, contextosDe, gerarDe, gerar };
})());
