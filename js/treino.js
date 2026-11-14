globalThis.Manual = globalThis.Manual || {};

// Treino: lógica pura (sugestão diária, níveis de ajuda, montagem e resumo). Sem DOM.
(function () {
  const Manual = globalThis.Manual;
  const N_MIN = 8, N_MAX = 10, N_OMISSAO = 9;
  const ORDEM = { nao_resolvido: 0, dificuldade: 1, domina: 2 };

  function nivelInicial(estado) {
    return estado === 'nao_resolvido' ? 0 : estado === 'domina' ? 2 : 1;
  }

  function nivelAtual(historico, chave, estado) {
    const tentativas = (Array.isArray(historico) ? historico : []).filter(function (t) {
      return t && t.modo === 'treino' && t.disciplina + '/' + t.tema + '/' + t.subtema === chave
        && Number.isFinite(Date.parse(t.criado_em));
    }).sort(function (a, b) { return Date.parse(a.criado_em) - Date.parse(b.criado_em); });
    let nivel = nivelInicial(estado);
    let janela = [];
    tentativas.forEach(function (t) {
      janela.push(t.resultado);
      const novo = Manual.aprendizagem.proximoNivel(nivel, janela);
      if (novo !== nivel) { nivel = novo; janela = []; }
    });
    return nivel;
  }

  function partir(chave) {
    const p = String(chave).split('/');
    return { disciplina: p[0], tema: p[1], subtema: p[2] };
  }

  function temGeradores(chave) {
    const p = partir(chave);
    return !!(p.subtema && Manual.geradores.doSubtema(p.disciplina, p.subtema).length);
  }

  function chavesDoIndice(indice) {
    const r = [];
    (Array.isArray(indice) ? indice : []).forEach(function (d) {
      if (!d || !d.disponivel) return;
      (d.temas || []).forEach(function (t) {
        (t.subtemas || []).forEach(function (s) { r.push(d.id + '/' + t.id + '/' + s.id); });
      });
    });
    return r;
  }

  function sugestao(estados, indice, agora, max) {
    const limite = max === undefined ? 3 : max;
    const lista = (Array.isArray(estados) ? estados : []).filter(function (e) { return e && e.chave; });
    const saida = [];
    function juntar(chaves) {
      chaves.forEach(function (k) {
        if (saida.length < limite && !saida.includes(k) && temGeradores(k)) saida.push(k);
      });
    }
    juntar(Manual.aprendizagem.emRevisao(lista, agora));
    ['nao_resolvido', 'dificuldade'].forEach(function (est) {
      juntar(lista.filter(function (e) { return e.estado === est; }).map(function (e) { return e.chave; }));
    });
    const comEstado = new Set(lista.filter(function (e) { return e.estado; }).map(function (e) { return e.chave; }));
    const doIndice = chavesDoIndice(indice);
    juntar(doIndice.filter(function (k) { return !comEstado.has(k); }));
    juntar(doIndice); // tudo com estado: nunca devolver vazio
    return saida;
  }

  function materializar(c) {
    try {
      return Manual.geradores.gerar(c.gerador, c.semente, { formato: c.formato, contexto: c.contexto });
    } catch (erro) {
      return null; // um gerador com problemas nunca impede o treino
    }
  }

  function montarTreino(chaves, historico, opcoes) {
    const o = opcoes || {};
    const rng = o.rng;
    const pedido = Number.isFinite(o.n) ? Math.round(o.n) : N_OMISSAO;
    const n = Math.min(N_MAX, Math.max(N_MIN, pedido));
    const hist = Array.isArray(historico) ? historico : [];
    const unicas = Array.from(new Set(Array.isArray(chaves) ? chaves : []));

    const fontes = unicas.map(function (chave) {
      const p = partir(chave);
      const doSubtema = hist.filter(function (t) { return t && t.disciplina === p.disciplina && t.subtema === p.subtema; });
      return {
        chave: chave, hist: doSubtema, rondas: 0, pares: new Set(), perguntas: [], tipos: new Set(), tentados: new Set(), esgotada: false,
        cands: Manual.miniquiz.candidatos(p.disciplina, p.subtema, [], rng),
        ultimoErro: Manual.miniquiz.ultimoErroDe(p.disciplina, p.subtema, doSubtema) || undefined,
      };
    });
    if (!fontes.length) return [];

    // Um subtema com poucas combinações (gerador × formato × contexto) recebe candidatos com sementes novas.
    function reabastecer(f) {
      if (f.rondas >= 8) return false;
      f.rondas++;
      const p = partir(f.chave);
      Manual.miniquiz.candidatos(p.disciplina, p.subtema, [], rng).forEach(function (c) { f.cands.push(c); });
      return true;
    }

    // Tira até `quantas` perguntas da fonte, preferindo tipos ainda não usados nela.
    function tirar(f, quantas, primeira) {
      let feitas = 0;
      while (feitas < quantas) {
        const livres = f.cands.filter(function (c) { return !f.tentados.has(c); });
        if (!livres.length) { if (reabastecer(f)) continue; f.esgotada = true; break; }
        let pool = livres.filter(function (c) { return !f.tipos.has(c.tipo); });
        if (!pool.length) pool = livres;
        const escolha = Manual.selecao.escolher(pool, f.hist, {
          n: Math.min(quantas - feitas, 1 + (primeira ? quantas : 0)), rng: rng, ultimoErro: primeira && !feitas ? f.ultimoErro : undefined,
        });
        if (!escolha.length) {
          // tudo o que sobra já foi visto: tenta sementes novas
          livres.forEach(function (c) { f.tentados.add(c); });
          continue;
        }
        escolha.forEach(function (c) {
          if (feitas >= quantas) return;
          f.tentados.add(c);
          const par = c.tipo + ':' + c.semente;
          if (f.pares.has(par)) return;
          const p = materializar(c);
          if (!p) return;
          f.perguntas.push(Object.assign({}, p, { chave: f.chave }));
          f.tipos.add(c.tipo);
          f.pares.add(par);
          feitas++;
        });
      }
      return feitas;
    }

    const base = Math.floor(n / fontes.length), resto = n % fontes.length;
    fontes.forEach(function (f, i) { tirar(f, base + (i < resto ? 1 : 0), true); });

    // Vagas por preencher (gerador que falha, poucos tipos) passam às outras chaves.
    let total = fontes.reduce(function (s, f) { return s + f.perguntas.length; }, 0);
    while (total < n) {
      let avancou = false;
      fontes.forEach(function (f) {
        if (total >= n || f.esgotada) return;
        const t = tirar(f, 1, false);
        total += t;
        if (t) avancou = true;
      });
      if (!avancou) break;
    }

    // intercala as chaves para a sessão não vir em blocos
    const saida = [];
    for (let i = 0; saida.length < total; i++) {
      fontes.forEach(function (f) { if (f.perguntas[i]) saida.push(f.perguntas[i]); });
    }
    return saida;
  }

  function resumo(respostas, estadosAntes, estadosDepois) {
    const antes = estadosAntes || {}, depois = estadosDepois || {};
    const chaves = [];
    const erros = new Set();
    (Array.isArray(respostas) ? respostas : []).forEach(function (r) {
      if (!r || !r.chave) return;
      if (!chaves.includes(r.chave)) chaves.push(r.chave);
      if (r.resultado === 'errada') erros.add(r.chave);
    });
    const rank = function (e) { return e && ORDEM[e] !== undefined ? ORDEM[e] : ORDEM.dificuldade; };
    const melhorias = [], dificuldades = [], proximas = [];
    chaves.forEach(function (k) {
      const d = depois[k];
      const melhorou = !!(d && d.estado && rank(d.estado) > rank(antes[k]));
      if (melhorou) melhorias.push(k);
      else if (erros.has(k)) dificuldades.push(k);
      if (d && d.proxima_revisao) proximas.push({ chave: k, proxima_revisao: d.proxima_revisao });
    });
    return { melhorias: melhorias, dificuldades: dificuldades, proximas: proximas };
  }

  Manual.treino = { nivelInicial: nivelInicial, nivelAtual: nivelAtual, sugestao: sugestao, montarTreino: montarTreino, resumo: resumo };
})();
