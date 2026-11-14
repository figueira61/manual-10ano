globalThis.Manual = globalThis.Manual || {};

// Páginas «O meu progresso» (#/progresso) e «Educandas» (#/encarregado, só leitura).
// Só DOM e texto (sem innerHTML). O modelo vem de Manual.painel.modelo; os estados usam
// Manual.painel.rotuloEstado e as mesmas classes `estado-*` do selo do subtema.
(function () {
  const Manual = globalThis.Manual;
  const R = Manual.render;
  const criar = R.criar;
  const V = Manual.vistasConta; // cabecalho, cartao, ligacao e os blocos de conta (não se duplicam aqui)

  const MS_DIA = 24 * 60 * 60 * 1000;
  const MENSAGEM_LEITURA = 'Não foi possível ler os dados desta educanda.';

  // ---------- datas ----------

  // 'AAAA-MM-DD...' -> 'dd/mm' (ou 'dd/mm/aaaa' com `ano`).
  function data(iso, ano) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? m[3] + '/' + m[2] + (ano ? '/' + m[1] : '') : '';
  }

  // Dia (calendário de Lisboa) de um instante, no formato AAAA-MM-DD.
  function diaDe(iso) {
    return Manual.aprendizagem.diaLisboa(iso) || '';
  }

  // ---------- índice ----------

  function temGeradores(chave) {
    const p = chave.split('/');
    try {
      return !!(Manual.geradores && Manual.geradores.doSubtema(p[0], p[2]).length > 0);
    } catch (erro) {
      return false;
    }
  }

  function tituloSubtema(chave) {
    const p = chave.split('/');
    const d = (Manual.indice || []).find(function (x) { return x.id === p[0]; });
    const t = d && (d.temas || []).find(function (x) { return x.id === p[1]; });
    const s = t && (t.subtemas || []).find(function (x) { return x.id === p[2]; });
    return s ? s.titulo : chave;
  }

  function chavesDoIndice() {
    const r = [];
    (Manual.indice || []).forEach(function (d) {
      if (!d.disponivel) return;
      (d.temas || []).forEach(function (t) {
        (t.subtemas || []).forEach(function (s) { r.push(d.id + '/' + t.id + '/' + s.id); });
      });
    });
    return r;
  }

  // ---------- desenho do modelo (partilhado pela aluna e pelo encarregado) ----------

  function selo(estado) {
    const r = Manual.painel.rotuloEstado(estado);
    return criar('span', 'selo-estado ' + r.classe, r.texto);
  }

  function resumo(pai, m) {
    const c = V.cartao(pai, 'Resumo');
    const ul = criar('ul', 'lista-contagens');
    ['domina', 'dificuldade', 'nao_resolvido', 'sem'].forEach(function (e) {
      const li = criar('li', 'item-contagem');
      li.appendChild(selo(e === 'sem' ? null : e));
      li.appendChild(criar('strong', 'contagem-valor', ' ' + m.contagens[e]));
      ul.appendChild(li);
    });
    c.appendChild(ul);
    return c;
  }

  function porTema(pai, m, treinar) {
    const c = V.cartao(pai, 'Por tema');
    m.disciplinas.forEach(function (d) {
      if (m.disciplinas.length > 1) c.appendChild(criar('h3', '', d.nome));
      d.temas.forEach(function (t) {
        c.appendChild(criar(m.disciplinas.length > 1 ? 'h4' : 'h3', '', t.titulo));
        const ul = criar('ul', 'lista-progresso');
        t.subtemas.forEach(function (s) {
          const li = criar('li', 'item-progresso');
          li.appendChild(V.ligacao('#/' + s.chave, s.titulo, 'ligacao-subtema'));
          li.appendChild(selo(s.estado));
          if (treinar && s.estado !== 'domina' && temGeradores(s.chave)) {
            li.appendChild(V.ligacao(Manual.router.caminho({ vista: 'treino', subtema: s.chave }), 'Treinar', 'botao'));
          }
          ul.appendChild(li);
        });
        c.appendChild(ul);
      });
    });
  }

  function errosFrequentes(pai, m) {
    const c = V.cartao(pai, 'Erros mais frequentes');
    if (!m.erros.length) {
      c.appendChild(criar('p', 'campo-ajuda', 'Ainda não há erros registados.'));
      return;
    }
    const ul = criar('ul', 'lista-resumo');
    m.erros.forEach(function (e) {
      const vezes = e.contagem === 1 ? '1 vez' : e.contagem + ' vezes';
      ul.appendChild(criar('li', '', e.texto + (e.onde ? ' — em ' + e.onde : '') + ' (' + vezes + ')'));
    });
    c.appendChild(ul);
  }

  function evolucao(pai, m) {
    const c = V.cartao(pai, 'Evolução');
    c.appendChild(criar('p', 'campo-ajuda', 'Últimas 4 semanas: tentativas e percentagem de respostas certas.'));
    const tabela = criar('table', 'tabela-evolucao');
    const cabeca = criar('tr');
    ['Semana', 'Tentativas', 'Certas'].forEach(function (t) {
      const th = criar('th', '', t);
      th.setAttribute('scope', 'col');
      cabeca.appendChild(th);
    });
    const thead = criar('thead');
    thead.appendChild(cabeca);
    tabela.appendChild(thead);
    const corpo = criar('tbody');
    m.evolucao.forEach(function (w) {
      const tr = criar('tr');
      const th = criar('th', '', 'Semana de ' + data(w.semana));
      th.setAttribute('scope', 'row');
      tr.appendChild(th);
      tr.appendChild(criar('td', '', String(w.tentativas)));
      const pc = w.tentativas ? Math.round(w.certas / w.tentativas * 100) : null;
      const td = criar('td', 'celula-barra');
      const pista = criar('div', 'barra-pista');
      const enchimento = criar('div', 'barra-enchimento');
      enchimento.setAttribute('style', 'width:' + (pc || 0) + '%;background:var(--certo)');
      pista.appendChild(enchimento);
      td.appendChild(pista);
      td.appendChild(criar('span', 'barra-valor', pc === null ? 'Sem tentativas' : pc + ' % (' + w.certas + ' de ' + w.tentativas + ')'));
      tr.appendChild(td);
      corpo.appendChild(tr);
    });
    tabela.appendChild(corpo);
    c.appendChild(tabela);
  }

  function sugestoes(pai, m) {
    const c = V.cartao(pai, 'Sugestões');
    if (m.sugestoes.length) {
      const ul = criar('ul', 'lista-resumo');
      m.sugestoes.forEach(function (k) {
        const li = criar('li');
        li.appendChild(V.ligacao(Manual.router.caminho({ vista: 'treino', subtema: k }), tituloSubtema(k)));
        ul.appendChild(li);
      });
      c.appendChild(ul);
    }
    c.appendChild(V.ligacao('#/treino', 'Ir para o Treino', 'botao botao-principal'));
  }

  function desenharModelo(pai, m, opcoes) {
    const o = opcoes || {};
    if (o.ultima !== false) {
      const dia = m.ultimaAtividade ? data(diaDe(m.ultimaAtividade), true) : '';
      pai.appendChild(criar('p', 'ultima-atividade', 'Última atividade: ' + (dia || 'ainda sem atividade')));
    }
    resumo(pai, m);
    porTema(pai, m, !!o.treinar);
    errosFrequentes(pai, m);
    evolucao(pai, m);
    if (o.treinar) sugestoes(pai, m);
  }

  // ---------- O meu progresso ----------

  function modeloLocal() {
    let historico = [];
    const estados = [];
    try { historico = Manual.motor ? Manual.motor.historico() : []; } catch (erro) { historico = []; }
    chavesDoIndice().forEach(function (k) {
      let e = null;
      try { e = Manual.motor ? Manual.motor.estadoDe(k) : null; } catch (erro) { e = null; }
      if (e && e.estado) estados.push({ chave: k, estado: e.estado, proxima_revisao: e.proxima_revisao });
    });
    return Manual.painel.modelo(historico, estados, Manual.indice, new Date());
  }

  function progresso(principal) {
    let vivo = true;
    const sair = { destruir: function () { vivo = false; } };
    if (Manual.conta.estado().papel === 'encarregado') {
      window.location.hash = '#/encarregado';
      return sair;
    }
    V.cabecalho(principal, 'O meu progresso');
    const dados = criar('div', 'progresso-dados');
    const conta = criar('div', 'progresso-conta');
    principal.appendChild(dados);
    principal.appendChild(conta);

    function desenharDados() {
      dados.textContent = '';
      desenharModelo(dados, modeloLocal(), { treinar: true });
    }

    function desenharConta() {
      conta.textContent = '';
      const est = Manual.conta.estado();
      if (!est.autenticado) {
        const c = V.cartao(conta, 'Sem conta');
        c.appendChild(criar('p', '', 'Este progresso só está guardado neste dispositivo.'));
        c.appendChild(V.ligacao('#/registar', 'Criar conta', 'botao botao-principal'));
        return;
      }
      if (est.papel === 'encarregado') {
        window.location.hash = '#/encarregado';
        return;
      }
      conta.appendChild(criar('h2', '', 'A minha conta e dados'));
      V.blocoDados(conta);
      V.blocoLigacoesAluna(conta, function () { return vivo; });
    }

    desenharDados();
    desenharConta();
    let autenticadoAntes = Manual.conta.estado().autenticado;
    let papelAntes = Manual.conta.estado().papel;
    const desligarConta = typeof Manual.conta.aoMudar === 'function' ? Manual.conta.aoMudar(function (e) {
      if (!vivo) return;
      if (e.autenticado !== autenticadoAntes || e.papel !== papelAntes) {
        autenticadoAntes = e.autenticado;
        papelAntes = e.papel;
        desenharConta();
        desenharDados();
      }
    }) : null;
    const desligarMotor = Manual.motor && typeof Manual.motor.aoMudar === 'function'
      ? Manual.motor.aoMudar(function () { if (vivo) desenharDados(); })
      : null;
    return {
      destruir: function () {
        vivo = false;
        if (typeof desligarConta === 'function') desligarConta();
        if (typeof desligarMotor === 'function') desligarMotor();
      },
    };
  }

  // ---------- Educandas (encarregado, só leitura) ----------

  function encarregado(principal) {
    let vivo = true;
    let geracao = 0; // descarta respostas antigas quando se muda de educanda ou de ecrã
    V.cabecalho(principal, 'Educandas');
    const corpo = criar('div', 'encarregado-corpo');
    principal.appendChild(corpo);
    const aindaVivo = function () { return vivo; };

    function erroDeLeitura(pai) {
      const p = criar('p', 'aviso-form aviso-erro', MENSAGEM_LEITURA);
      p.setAttribute('role', 'status');
      pai.appendChild(p);
    }

    function carregarEducanda(zona, alunaId) {
      const minha = ++geracao;
      zona.textContent = '';
      zona.appendChild(criar('p', 'campo-ajuda', 'A ler os dados…'));
      const desde = new Date(Date.now() - 90 * MS_DIA).toISOString();
      Promise.resolve()
        .then(function () {
          return Promise.all([Manual.conta.tentativas({ alunaId: alunaId, desde: desde }), Manual.conta.estados(alunaId)]);
        })
        .then(function (r) {
          if (!vivo || minha !== geracao) return;
          const m = Manual.painel.modelo(r[0], r[1], Manual.indice, new Date());
          zona.textContent = '';
          desenharModelo(zona, m, { treinar: false });
        })
        .catch(function () {
          if (!vivo || minha !== geracao) return;
          zona.textContent = '';
          erroDeLeitura(zona);
        });
    }

    function desenhar() {
      const minha = ++geracao;
      corpo.textContent = '';
      const est = Manual.conta.estado();
      if (!est.autenticado || est.papel !== 'encarregado') {
        const c = V.cartao(corpo);
        c.appendChild(criar('p', '', 'Esta página é para encarregados de educação.'));
        c.appendChild(V.ligacao('#/entrar', 'Entrar', 'botao botao-principal'));
        return;
      }
      Promise.resolve()
        .then(function () { return Manual.conta.ligacoes(); })
        .then(function (linhas) {
          if (!vivo || minha !== geracao) return;
          corpo.textContent = '';
          const ls = Array.isArray(linhas) ? linhas : [];
          if (!ls.length) {
            const c = V.cartao(corpo);
            c.appendChild(criar('p', '', 'Ainda não tens nenhuma educanda ligada. Escreve abaixo o código que a educanda gerou na página dela.'));
            V.blocoLigacoesEncarregado(corpo, aindaVivo, function () { if (vivo) desenhar(); });
            return;
          }
          const zona = criar('div', 'educanda-dados');
          const nomeDe = function (l) { return l.nome || 'Educanda sem nome'; };
          if (ls.length > 1) {
            const c = V.cartao(corpo);
            const linha = criar('div', 'campo-linha');
            const rotulo = criar('label', 'campo-rotulo', 'Educanda');
            rotulo.htmlFor = 'educanda-escolha';
            const sel = document.createElement('select');
            sel.id = 'educanda-escolha';
            sel.className = 'campo-texto';
            ls.forEach(function (l) {
              const op = document.createElement('option');
              op.value = String(l.aluna_id);
              op.textContent = nomeDe(l);
              sel.appendChild(op);
            });
            sel.value = String(ls[0].aluna_id);
            sel.addEventListener('change', function () { carregarEducanda(zona, sel.value); });
            linha.appendChild(rotulo);
            linha.appendChild(sel);
            c.appendChild(linha);
          } else {
            corpo.appendChild(criar('h2', '', nomeDe(ls[0])));
          }
          corpo.appendChild(zona);
          carregarEducanda(zona, ls[0].aluna_id);
        })
        .catch(function () {
          if (!vivo || minha !== geracao) return;
          corpo.textContent = '';
          erroDeLeitura(corpo);
        });
    }

    desenhar();
    let autenticadoAntes = Manual.conta.estado().autenticado;
    let papelAntes = Manual.conta.estado().papel;
    const desligar = typeof Manual.conta.aoMudar === 'function' ? Manual.conta.aoMudar(function (e) {
      if (!vivo) return;
      if (e.autenticado !== autenticadoAntes || e.papel !== papelAntes) {
        autenticadoAntes = e.autenticado;
        papelAntes = e.papel;
        desenhar();
      }
    }) : null;
    return {
      destruir: function () {
        vivo = false;
        if (typeof desligar === 'function') desligar();
      },
    };
  }

  Manual.vistasProgresso = { progresso: progresso, encarregado: encarregado };
})();
