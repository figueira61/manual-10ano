globalThis.Manual = globalThis.Manual || {};

// Vistas Treino e Teste. Só DOM e texto (sem innerHTML); a lógica está em Manual.treino e Manual.teste.
// Funcionam sem conta: o histórico local vem de Manual.motor. As tentativas são registadas por
// Manual.render.responderMiniquiz (contas de aluna e visitantes; não as de encarregado).
(function () {
  const Manual = globalThis.Manual;
  const R = Manual.render;
  const criar = R.criar;

  function partir(chave) {
    const p = String(chave).split('/');
    return { disciplina: p[0], tema: p[1], subtema: p[2] };
  }

  function ligacao(href, texto, classe) {
    const a = criar('a', classe || '', texto);
    a.href = href;
    return a;
  }

  function botao(texto, classe) {
    const b = criar('button', 'botao ' + (classe || ''), texto);
    b.type = 'button';
    return b;
  }

  function cartao(pai, titulo) {
    const c = criar('section', 'bloco cartao-conta');
    if (titulo) c.appendChild(criar('h2', '', titulo));
    pai.appendChild(c);
    return c;
  }

  function cabecalho(principal, texto) {
    document.title = texto + ' · Manual 10.º Ano';
    principal.appendChild(R.trilho([{ texto: 'Início', href: '#/' }, { texto: texto }]));
    principal.appendChild(criar('h1', '', texto));
  }

  // ---------- índice e estados ----------

  function disciplinasComGeradores() {
    return (Manual.indice || []).filter(function (d) {
      return d && d.disponivel && (d.temas || []).some(function (t) {
        return (t.subtemas || []).some(function (s) { return Manual.geradores.doSubtema(d.id, s.id).length > 0; });
      });
    });
  }

  function subtemasComGeradores(d, tema) {
    return (tema.subtemas || []).filter(function (s) { return Manual.geradores.doSubtema(d.id, s.id).length > 0; });
  }

  function tituloSubtema(chave) {
    const p = partir(chave);
    const d = (Manual.indice || []).find(function (x) { return x.id === p.disciplina; });
    const t = d && (d.temas || []).find(function (x) { return x.id === p.tema; });
    const s = t && (t.subtemas || []).find(function (x) { return x.id === p.subtema; });
    return s ? s.titulo : chave;
  }

  function tituloTema(disciplina, tema) {
    const d = (Manual.indice || []).find(function (x) { return x.id === disciplina; });
    const t = d && (d.temas || []).find(function (x) { return x.id === tema; });
    return t ? t.titulo : tema;
  }

  function todasAsChaves() {
    const r = [];
    (Manual.indice || []).forEach(function (d) {
      if (!d.disponivel) return;
      (d.temas || []).forEach(function (t) {
        (t.subtemas || []).forEach(function (s) { r.push(d.id + '/' + t.id + '/' + s.id); });
      });
    });
    return r;
  }

  function estadoDe(chave) {
    try {
      return Manual.motor ? Manual.motor.estadoDe(chave) : null;
    } catch (erro) {
      return null;
    }
  }

  function historico() {
    try {
      return Manual.motor ? Manual.motor.historico() : [];
    } catch (erro) {
      return [];
    }
  }

  // { chave: { estado, proxima_revisao } } só para as chaves dadas.
  function mapaEstados(chaves) {
    const m = {};
    chaves.forEach(function (k) {
      const e = estadoDe(k);
      if (e) m[k] = { estado: e.estado, proxima_revisao: e.proxima_revisao };
    });
    return m;
  }

  function dataCurta(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? m[3] + '/' + m[2] : '';
  }

  function virgula(n) {
    return n.toFixed(1).replace('.', ',');
  }

  // Disciplina da chave da pergunta (cada pergunta tem a sua); sem chave, a de recurso.
  function disciplinaDe(pergunta, recurso) {
    return pergunta && pergunta.chave ? partir(pergunta.chave).disciplina : recurso;
  }

  function ligacaoRever(pergunta) {
    return pergunta && pergunta.chave ? '#/' + pergunta.chave : null;
  }

  function caixa(pai, id, rotulo) {
    const linha = criar('label', 'escolha-linha');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    linha.appendChild(input);
    linha.appendChild(criar('span', '', ' ' + rotulo));
    pai.appendChild(linha);
    return input;
  }

  function lista(pai, titulo, itens) {
    if (!itens.length) return;
    pai.appendChild(criar('h3', '', titulo));
    const ul = criar('ul', 'lista-resumo');
    itens.forEach(function (t) { ul.appendChild(criar('li', '', t)); });
    pai.appendChild(ul);
  }

  // ---------- Treino ----------

  function treino(principal, rota) {
    let quiz = null;
    let vivo = true;
    cabecalho(principal, 'Treino');
    const corpo = criar('div');
    principal.appendChild(corpo);

    let desligarMotor = null;

    function desligar() {
      if (typeof desligarMotor === 'function') {
        try { desligarMotor(); } catch (erro) { /* ignora */ }
      }
      desligarMotor = null;
    }

    function parar() {
      desligar();
      if (quiz && typeof quiz.destruir === 'function') {
        try { quiz.destruir(); } catch (erro) { /* ignora */ }
      }
      quiz = null;
    }

    function mostrarResumo(cartaoFinal, certas, total, respostas, antes, chaves) {
      cartaoFinal.appendChild(criar('p', 'pontuacao', 'Acertaste ' + certas + ' de ' + total + '.'));
      const res = Manual.treino.resumo(respostas, antes, mapaEstados(chaves));
      lista(cartaoFinal, 'Melhoraste em…', res.melhorias.map(tituloSubtema));
      lista(cartaoFinal, 'Ainda com dificuldade em…', res.dificuldades.map(tituloSubtema));
      const proximas = res.proximas.filter(function (p) { return dataCurta(p.proxima_revisao); });
      if (proximas.length === 1) {
        cartaoFinal.appendChild(criar('p', '', 'Próxima revisão: ' + dataCurta(proximas[0].proxima_revisao)));
      } else if (proximas.length > 1) {
        cartaoFinal.appendChild(criar('h3', '', 'Próxima revisão:'));
        const ul = criar('ul', 'lista-resumo');
        proximas.forEach(function (p) {
          ul.appendChild(criar('li', '', tituloSubtema(p.chave) + ': ' + dataCurta(p.proxima_revisao)));
        });
        cartaoFinal.appendChild(ul);
      }
      const acoes = criar('div', 'acoes');
      const outra = botao('Treinar outra vez', 'botao-principal');
      outra.addEventListener('click', function () { if (vivo) escolher(); });
      acoes.appendChild(outra);
      acoes.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
      cartaoFinal.appendChild(acoes);
    }

    function comecar(chaves) {
      parar();
      corpo.textContent = '';
      const antes = mapaEstados(chaves);
      const perguntas = Manual.treino.montarTreino(chaves, historico(), {});
      if (!perguntas.length) {
        const c = cartao(corpo);
        c.appendChild(criar('p', '', 'Não foi possível preparar perguntas para esta escolha. Tenta outros subtemas.'));
        const voltar = botao('Escolher outra vez');
        voltar.addEventListener('click', escolher);
        c.appendChild(voltar);
        return;
      }
      const disciplinaId = partir(chaves[0]).disciplina;
      const area = criar('div', 'quiz');
      corpo.appendChild(area);
      quiz = Manual.quiz.montar(area, perguntas, null, function (r) {
        const chave = r.pergunta.chave;
        if (chave) {
          const p = partir(chave);
          R.responderMiniquiz({ disciplina: p.disciplina, tema: p.tema, subtema: p.subtema }, r, {
            modo: 'treino', nivel_ajuda: r.nivel, usou_pista: !!(r.usouPista || r.viuPassos), viu_resolucao: false,
          });
        }
        if (r.resultado === 'errada') Manual.treino.aposErro(perguntas, r.indice, historico());
      }, {
        modo: 'treino',
        nivel: function (pergunta) {
          const chave = pergunta.chave;
          const e = estadoDe(chave);
          return Manual.treino.nivelAtual(historico(), chave, e ? e.estado : null);
        },
        ligacaoRever: ligacaoRever,
        montarEsquema: function (pai, esquema, pergunta) {
          return vivo ? R.esquemaExercicio(pai, esquema, disciplinaDe(pergunta, disciplinaId)) : null;
        },
        fim: function (cartaoFinal, certas, total, respostas) {
          mostrarResumo(cartaoFinal, certas, total, respostas.map(function (x) {
            return Object.assign({}, x, { chave: x.pergunta && x.pergunta.chave });
          }), antes, chaves);
        },
      });
    }

    function escolher() {
      parar();
      corpo.textContent = '';
      const c1 = cartao(corpo);
      function sugestaoAgora() {
        return Manual.treino.sugestao(
          todasAsChaves().map(function (k) {
            const e = estadoDe(k);
            return { chave: k, estado: e ? e.estado : null, proxima_revisao: e ? e.proxima_revisao : null };
          }),
          Manual.indice, new Date());
      }
      function desenharSugestao() {
        c1.textContent = '';
        c1.appendChild(criar('h2', '', 'Sugestão de hoje'));
        const sug = sugestaoAgora();
        if (sug.length) {
          const ul = criar('ul', 'lista-resumo');
          sug.forEach(function (k) { ul.appendChild(criar('li', '', tituloSubtema(k))); });
          c1.appendChild(ul);
          c1.appendChild(criar('p', 'meta', '~10 min'));
          const ir = botao('Começar', 'botao-principal');
          ir.addEventListener('click', function () {
            const agora = sugestaoAgora(); // lê o histórico e os estados neste momento
            comecar(agora.length ? agora : sug);
          });
          c1.appendChild(ir);
        } else {
          c1.appendChild(criar('p', '', 'Ainda não há exercícios para sugerir.'));
        }
      }
      desenharSugestao();
      // O motor pode acabar de carregar depois de a vista abrir: refaz a sugestão, sem tocar na escolha livre.
      if (Manual.motor && typeof Manual.motor.aoMudar === 'function') {
        desligarMotor = Manual.motor.aoMudar(function () { if (vivo && desligarMotor) desenharSugestao(); });
      }

      const c2 = cartao(corpo, 'Escolha livre');
      c2.appendChild(criar('p', 'campo-ajuda', 'Escolhe até 3 subtemas.'));
      const caixas = [];
      disciplinasComGeradores().forEach(function (d) {
        c2.appendChild(criar('h3', 'escolha-disciplina', d.nome));
        (d.temas || []).forEach(function (t) {
          const subs = subtemasComGeradores(d, t);
          if (!subs.length) return;
          const grupo = criar('fieldset', 'escolha-grupo');
          grupo.appendChild(criar('legend', '', t.titulo));
          subs.forEach(function (s) {
            const chave = d.id + '/' + t.id + '/' + s.id;
            caixas.push({ chave: chave, input: caixa(grupo, 'treino-' + d.id + '-' + t.id + '-' + s.id, s.titulo) });
          });
          c2.appendChild(grupo);
        });
      });
      const iniciar = botao('Treinar a seleção', 'botao-principal');
      iniciar.disabled = true;
      const aviso = criar('p', 'campo-ajuda', '');
      aviso.setAttribute('aria-live', 'polite');
      aviso.hidden = true;
      function atualizar() {
        const n = caixas.filter(function (x) { return x.input.checked; }).length;
        caixas.forEach(function (x) { x.input.disabled = n >= 3 && !x.input.checked; });
        iniciar.disabled = n === 0;
        aviso.textContent = n >= 3 ? 'Já escolheste 3 subtemas.' : '';
        aviso.hidden = n < 3;
      }
      caixas.forEach(function (x) { x.input.addEventListener('change', atualizar); });
      iniciar.addEventListener('click', function () {
        const escolhidas = caixas.filter(function (x) { return x.input.checked; }).map(function (x) { return x.chave; });
        if (escolhidas.length) comecar(escolhidas);
      });
      c2.appendChild(aviso);
      c2.appendChild(iniciar);
    }

    const alvo = rota && rota.subtema;
    const p = alvo ? partir(alvo) : null;
    if (alvo && todasAsChaves().indexOf(alvo) >= 0 && Manual.geradores.doSubtema(p.disciplina, p.subtema).length) {
      comecar([alvo]);
    } else {
      escolher();
    }
    return { destruir: function () { vivo = false; parar(); } };
  }

  // ---------- Teste ----------

  function teste(principal) {
    let quiz = null;
    let vivo = true;
    cabecalho(principal, 'Teste');
    const corpo = criar('div');
    principal.appendChild(corpo);

    function parar() {
      if (quiz && typeof quiz.destruir === 'function') {
        try { quiz.destruir(); } catch (erro) { /* ignora */ }
      }
      quiz = null;
    }

    function fimDoTeste(cartaoFinal, certas, total, respostas, disciplinaId) {
      const n = Manual.teste.nota(certas, total);
      cartaoFinal.appendChild(criar('p', 'pontuacao', 'Nota: ' + virgula(n.valores) + ' valores (' + n.percentagem + ' %)'));
      cartaoFinal.appendChild(criar('p', '', 'Acertaste ' + certas + ' de ' + total + '.'));
      const rever = Manual.teste.temasARever(respostas);
      if (rever.length) {
        cartaoFinal.appendChild(criar('h3', '', 'Temas a rever'));
        const ul = criar('ul', 'lista-resumo');
        rever.forEach(function (t) {
          const erros = {};
          respostas.forEach(function (r) {
            const k = r && r.pergunta && r.pergunta.chave;
            if (!k || partir(k).tema !== t.tema || r.resultado === 'certa') return;
            erros[k] = (erros[k] || 0) + 1;
          });
          const pior = Object.keys(erros).sort(function (a, b) { return erros[b] - erros[a]; })[0];
          const li = criar('li');
          li.appendChild(document.createTextNode(tituloTema(disciplinaId, t.tema) + ' (' + t.certas + ' de ' + t.total + ') '));
          if (pior) li.appendChild(ligacao(Manual.router.caminho({ vista: 'treino', subtema: pior }), 'Treinar ' + tituloSubtema(pior)));
          ul.appendChild(li);
        });
        cartaoFinal.appendChild(ul);
      }
      const acoes = criar('div', 'acoes');
      const outro = botao('Novo teste', 'botao-principal');
      outro.addEventListener('click', function () { if (vivo) configurar(); });
      acoes.appendChild(outro);
      acoes.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
      cartaoFinal.appendChild(acoes);
    }

    function comecar(disciplinaId, temas, n, cronometro) {
      parar();
      corpo.textContent = '';
      const montado = Manual.teste.montarTeste(disciplinaId, temas, n, historico());
      const perguntas = montado.perguntas;
      if (!perguntas.length) {
        const c = cartao(corpo);
        c.appendChild(criar('p', '', 'Não foi possível preparar perguntas para estes temas.'));
        const voltar = botao('Voltar à configuração');
        voltar.addEventListener('click', configurar);
        c.appendChild(voltar);
        return;
      }
      if (perguntas.length < montado.pedidas) {
        const aviso = criar('p', 'aviso-form aviso-ok', 'Este teste tem ' + perguntas.length + ' perguntas');
        aviso.setAttribute('role', 'status');
        corpo.appendChild(aviso);
      }
      const area = criar('div', 'quiz');
      corpo.appendChild(area);
      quiz = Manual.quiz.montar(area, perguntas, null, function (r) {
        const chave = r.pergunta.chave;
        if (!chave) return;
        const p = partir(chave);
        R.responderMiniquiz({ disciplina: p.disciplina, tema: p.tema, subtema: p.subtema }, r, { modo: 'teste', nivel_ajuda: 2 });
      }, {
        modo: 'teste',
        cronometro: !!cronometro,
        ligacaoRever: ligacaoRever,
        montarEsquema: function (pai, esquema, pergunta) {
          return vivo ? R.esquemaExercicio(pai, esquema, disciplinaDe(pergunta, disciplinaId)) : null;
        },
        fim: function (cartaoFinal, certas, total, respostas) {
          fimDoTeste(cartaoFinal, certas, total, respostas, disciplinaId);
        },
      });
    }

    function configurar() {
      parar();
      corpo.textContent = '';
      const disciplinas = disciplinasComGeradores();
      const c = cartao(corpo, 'Configura o teste');
      if (!disciplinas.length) {
        c.appendChild(criar('p', '', 'Ainda não há exercícios para um teste.'));
        return;
      }
      c.appendChild(criar('p', 'campo-ajuda', 'Sem ajudas: só vês o resultado no fim.'));

      // Disciplina: só as disponíveis com geradores. Sem escolha, não há temas.
      let escolhida = null;
      let caixas = [];
      const grupoDisc = criar('fieldset', 'escolha-grupo');
      grupoDisc.appendChild(criar('legend', '', 'Disciplina'));
      const radiosDisc = [];
      disciplinas.forEach(function (d) {
        const linha = criar('label', 'escolha-linha');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'teste-disciplina';
        input.value = d.id;
        input.id = 'teste-disciplina-' + d.id;
        linha.appendChild(input);
        linha.appendChild(criar('span', '', ' ' + d.nome));
        grupoDisc.appendChild(linha);
        radiosDisc.push({ disciplina: d, input: input });
      });
      c.appendChild(grupoDisc);

      const grupoTemas = criar('fieldset', 'escolha-grupo');
      grupoTemas.hidden = true;
      c.appendChild(grupoTemas);

      const grupoN = criar('fieldset', 'escolha-grupo');
      grupoN.appendChild(criar('legend', '', 'Número de perguntas'));
      const radios = [];
      Manual.teste.TAMANHOS.forEach(function (n, i) {
        const linha = criar('label', 'escolha-linha');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'teste-tamanho';
        input.value = String(n);
        input.id = 'teste-tamanho-' + n;
        if (i === 0) input.checked = true;
        linha.appendChild(input);
        linha.appendChild(criar('span', '', ' ' + n));
        grupoN.appendChild(linha);
        radios.push(input);
      });
      c.appendChild(grupoN);

      const cron = caixa(c, 'teste-cronometro', 'Com cronómetro');
      const aviso = criar('p', 'aviso-form aviso-erro', '');
      aviso.setAttribute('aria-live', 'polite');
      aviso.hidden = true;
      const ir = botao('Começar o teste', 'botao-principal');
      function atualizar() {
        const algum = !!escolhida && caixas.some(function (x) { return x.input.checked; });
        ir.disabled = !algum;
        if (algum) { aviso.textContent = ''; aviso.hidden = true; }
      }

      // Os temas da disciplina escolhida (todos marcados à partida).
      function mostrarTemas(d) {
        escolhida = d;
        caixas = [];
        grupoTemas.textContent = '';
        grupoTemas.appendChild(criar('legend', '', 'Temas'));
        (d.temas || []).forEach(function (t) {
          if (!subtemasComGeradores(d, t).length) return;
          const input = caixa(grupoTemas, 'teste-tema-' + d.id + '-' + t.id, t.titulo);
          input.checked = true;
          input.addEventListener('change', atualizar);
          caixas.push({ tema: t.id, input: input });
        });
        grupoTemas.hidden = false;
        atualizar();
      }
      radiosDisc.forEach(function (x) {
        x.input.addEventListener('change', function () { if (x.input.checked) mostrarTemas(x.disciplina); });
      });
      if (disciplinas.length === 1) {
        // Só uma disciplina disponível: já vem escolhida, com os temas à vista.
        radiosDisc[0].input.checked = true;
        mostrarTemas(disciplinas[0]);
      }
      atualizar();

      ir.addEventListener('click', function () {
        if (!escolhida) { aviso.textContent = 'Escolhe uma disciplina.'; aviso.hidden = false; return; }
        const temas = caixas.filter(function (x) { return x.input.checked; }).map(function (x) { return x.tema; });
        if (!temas.length) { aviso.textContent = 'Escolhe pelo menos um tema.'; aviso.hidden = false; return; }
        const sel = radios.find(function (r) { return r.checked; });
        comecar(escolhida.id, temas, sel ? parseInt(sel.value, 10) : Manual.teste.TAMANHOS[0], cron.checked);
      });
      c.appendChild(aviso);
      c.appendChild(ir);
    }

    configurar();
    return { destruir: function () { vivo = false; parar(); } };
  }

  Manual.vistasEstudo = { treino: treino, teste: teste };
})();
