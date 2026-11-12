globalThis.Manual = globalThis.Manual || {};

// Renderização em DOM. Conteúdo nunca entra por innerHTML: só createElement/textContent e KaTeX.
(function () {
  const Manual = globalThis.Manual;

  function criar(etiqueta, classe, texto) {
    const el = document.createElement(etiqueta);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  // Acrescenta a el uma string com $math$, $$math$$ e **negrito**.
  function texto(el, s) {
    Manual.texto.partir(String(s)).forEach(function (p) {
      if (p.tipo === 'math') {
        const span = document.createElement('span');
        span.className = p.display ? 'math math-bloco' : 'math';
        try {
          katex.render(p.valor, span, { displayMode: !!p.display, throwOnError: false });
        } catch (erro) {
          span.textContent = p.valor;
        }
        el.appendChild(span);
      } else if (p.tipo === 'negrito') {
        el.appendChild(criar('strong', '', p.valor));
      } else {
        el.appendChild(document.createTextNode(p.valor));
      }
    });
  }

  function paragrafo(pai, s, classe) {
    const p = criar('p', classe || '');
    texto(p, s);
    pai.appendChild(p);
    return p;
  }

  function passos(pai, lista) {
    const ol = criar('ol', 'passos');
    lista.forEach(function (s) {
      const li = document.createElement('li');
      texto(li, s);
      ol.appendChild(li);
    });
    pai.appendChild(ol);
    return ol;
  }

  function blocoEsquema(pai, bloco, disciplinaId, montados, estado) {
    const fig = criar('figure', 'esquema');
    const alvo = criar('div', 'esquema-area');
    fig.appendChild(alvo);
    if (bloco.legenda) {
      const leg = criar('figcaption');
      texto(leg, bloco.legenda);
      fig.appendChild(leg);
    }
    pai.appendChild(fig);
    Manual.carregarScript(Manual.ficheiroEsquema(disciplinaId, bloco.id))
      .then(function () {
        if (estado.destruido) return;
        const def = Manual.esquemas.obter(bloco.id);
        if (!def) throw new Error('Esquema não registado: ' + bloco.id);
        montados.push(def.montar(alvo, bloco.opcoes || {}));
      })
      .catch(function () {
        if (estado.destruido) return;
        alvo.textContent = '';
        alvo.appendChild(criar('p', 'aviso-erro', 'Não foi possível carregar o esquema.'));
      });
  }

  function blocoExemplo(pai, bloco) {
    const caixa = criar('div', 'bloco exemplo');
    caixa.appendChild(criar('div', 'bloco-titulo', 'Exemplo'));
    paragrafo(caixa, bloco.enunciado);
    const botao = criar('button', 'botao', 'Ver resolução');
    botao.type = 'button';
    const area = criar('div', 'resolucao');
    area.hidden = true;
    passos(area, bloco.resolucao || []);
    botao.setAttribute('aria-expanded', 'false');
    botao.addEventListener('click', function () {
      area.hidden = !area.hidden;
      botao.setAttribute('aria-expanded', String(!area.hidden));
      botao.textContent = area.hidden ? 'Ver resolução' : 'Esconder resolução';
    });
    caixa.appendChild(botao);
    caixa.appendChild(area);
    pai.appendChild(caixa);
  }

  function blocoQuadro(pai, bloco) {
    const envolvente = criar('div', 'quadro-envolvente');
    const tabela = criar('table', 'quadro');
    if (bloco.cabecalho) {
      const tr = document.createElement('tr');
      bloco.cabecalho.forEach(function (c) {
        const th = document.createElement('th');
        texto(th, c);
        tr.appendChild(th);
      });
      const thead = document.createElement('thead');
      thead.appendChild(tr);
      tabela.appendChild(thead);
    }
    const corpo = document.createElement('tbody');
    (bloco.linhas || []).forEach(function (linha) {
      const tr = document.createElement('tr');
      linha.forEach(function (c) {
        const td = document.createElement('td');
        texto(td, c);
        tr.appendChild(td);
      });
      corpo.appendChild(tr);
    });
    tabela.appendChild(corpo);
    envolvente.appendChild(tabela);
    pai.appendChild(envolvente);
  }

  function caixaTexto(pai, classe, titulo, s) {
    const c = criar('div', 'bloco ' + classe);
    if (titulo) c.appendChild(criar('div', 'bloco-titulo', titulo));
    paragrafo(c, s);
    pai.appendChild(c);
  }

  function bloco(pai, b, disciplinaId, montados, estado) {
    switch (b.tipo) {
      case 'texto':
        paragrafo(pai, b.texto);
        break;
      case 'definicao':
        caixaTexto(pai, 'definicao', 'Definição', b.texto);
        break;
      case 'erro-frequente':
        caixaTexto(pai, 'erro-frequente', 'Erro frequente', b.texto);
        break;
      case 'formula':
        caixaTexto(pai, 'formula', '', b.texto);
        break;
      case 'exemplo':
        blocoExemplo(pai, b);
        break;
      case 'quadro':
        blocoQuadro(pai, b);
        break;
      case 'codigo': {
        const pre = criar('pre', 'codigo');
        pre.appendChild(criar('code', '', b.codigo));
        pai.appendChild(pre);
        break;
      }
      case 'esquema':
        blocoEsquema(pai, b, disciplinaId, montados, estado);
        break;
      default:
        break;
    }
  }

  function vizinhos(disciplinaId, temaId, subtemaId) {
    const disciplina = Manual.indice.find(function (d) { return d.id === disciplinaId; });
    const lista = [];
    ((disciplina && disciplina.temas) || []).forEach(function (t) {
      t.subtemas.forEach(function (s) {
        lista.push({ tema: t.id, id: s.id, titulo: s.titulo });
      });
    });
    const i = lista.findIndex(function (x) { return x.tema === temaId && x.id === subtemaId; });
    return {
      anterior: i > 0 ? lista[i - 1] : null,
      seguinte: i >= 0 && i < lista.length - 1 ? lista[i + 1] : null,
    };
  }

  function ligacaoNav(disciplinaId, alvo, rotulo, classe) {
    const a = criar('a', 'nav-' + classe);
    a.href = Manual.router.caminho({ vista: 'subtema', disciplina: disciplinaId, tema: alvo.tema, subtema: alvo.id });
    a.appendChild(criar('span', 'nav-rotulo', rotulo));
    a.appendChild(criar('span', 'nav-titulo', alvo.titulo));
    return a;
  }

  // Trilho de navegação: itens [{ texto, href }]; o último é a página atual (sem href).
  function trilho(itens) {
    const nav = criar('nav', 'trilho');
    nav.setAttribute('aria-label', 'Localização');
    const ol = criar('ol');
    itens.forEach(function (item) {
      const li = document.createElement('li');
      if (item.href) {
        const a = criar('a', '', item.texto);
        a.href = item.href;
        li.appendChild(a);
      } else {
        const atual = criar('span', '', item.texto);
        atual.setAttribute('aria-current', 'page');
        li.appendChild(atual);
      }
      ol.appendChild(li);
    });
    nav.appendChild(ol);
    return nav;
  }

  // Um identificador por carregamento de página.
  let sessaoId = null;
  function idSessao() {
    if (!sessaoId) sessaoId = Manual.uuid();
    return sessaoId;
  }

  Manual.render = {
    criar: criar,
    texto: texto,
    paragrafo: paragrafo,
    passos: passos,
    trilho: trilho,

    subtema: function (el, disciplinaId, temaId, subtema, progresso) {
      const montados = [];
      const estado = { destruido: false };
      const disciplina = Manual.indice.find(function (d) { return d.id === disciplinaId; });
      const tema = Manual.obterTema(disciplinaId, temaId);
      const chave = disciplinaId + '/' + temaId + '/' + subtema.id;

      el.textContent = '';
      const artigo = criar('article', 'subtema');

      const temaIndice = disciplina && disciplina.temas.find(function (t) { return t.id === temaId; });
      const tituloTema = temaIndice ? temaIndice.titulo : (tema && tema.titulo) || temaId;
      const hrefDisciplina = Manual.router.caminho({ vista: 'disciplina', disciplina: disciplinaId });
      const hrefTema = Manual.router.caminho({ vista: 'tema', disciplina: disciplinaId, tema: temaId });
      artigo.appendChild(trilho([
        { texto: 'Início', href: '#/' },
        { texto: disciplina ? disciplina.nome : disciplinaId, href: hrefDisciplina },
        { texto: tituloTema, href: hrefTema },
        { texto: subtema.titulo },
      ]));

      const cab = criar('header', 'subtema-cab');
      cab.appendChild(criar('h1', '', subtema.titulo));
      const meta = criar('p', 'meta');
      const etiqueta = criar('span', 'emblema etiqueta d-' + disciplinaId);
      const simbolo = Manual.icones && Manual.icones.svg(disciplinaId);
      if (simbolo) etiqueta.appendChild(simbolo);
      etiqueta.appendChild(criar('span', '', 'AE ' + (disciplina ? disciplina.nome : disciplinaId) + ' 10.º · ' + tituloTema));
      meta.appendChild(etiqueta);
      meta.appendChild(criar('span', 'minutos', '~' + subtema.minutos + ' min'));
      cab.appendChild(meta);
      artigo.appendChild(cab);

      const essencial = criar('section', 'seccao');
      essencial.appendChild(criar('h2', '', 'O essencial'));
      subtema.essencial.forEach(function (b) {
        bloco(essencial, b, disciplinaId, montados, estado);
      });
      artigo.appendChild(essencial);

      const resumo = criar('section', 'seccao resumo');
      resumo.appendChild(criar('h2', '', 'Resumo rápido'));
      const ul = criar('ul', 'lista-resumo');
      subtema.resumo.forEach(function (s) {
        const li = document.createElement('li');
        texto(li, s);
        ul.appendChild(li);
      });
      resumo.appendChild(ul);
      artigo.appendChild(resumo);

      const seccaoQuiz = criar('section', 'seccao');
      seccaoQuiz.appendChild(criar('h2', '', 'Mini-quiz'));
      const areaQuiz = criar('div', 'quiz');
      seccaoQuiz.appendChild(areaQuiz);
      artigo.appendChild(seccaoQuiz);
      Manual.quiz.montar(areaQuiz, subtema.quiz, function (certas, total) {
        progresso.registarQuiz(chave, certas, total);
      }, function (r) {
        if (!Manual.conta || typeof Manual.conta.guardarTentativa !== 'function') return;
        // Só contas de aluna registam tentativas.
        if (typeof Manual.conta.estado === 'function' && Manual.conta.estado().papel === 'encarregado') return;
        const contexto = { disciplina: disciplinaId, tema: temaId, subtema: subtema.id };
        const tentativa = Manual.quiz.construirTentativa(contexto, r.pergunta, r.indice, r.resultado, r.duracaoMs, idSessao());
        Promise.resolve(Manual.conta.guardarTentativa(tentativa)).catch(function () {});
      });

      const nav = criar('nav', 'nav-subtemas');
      nav.setAttribute('aria-label', 'Subtemas');
      const v = vizinhos(disciplinaId, temaId, subtema.id);
      if (v.anterior) nav.appendChild(ligacaoNav(disciplinaId, v.anterior, '← Anterior', 'anterior'));
      if (v.seguinte) nav.appendChild(ligacaoNav(disciplinaId, v.seguinte, 'Seguinte →', 'seguinte'));
      const voltar = criar('a', 'nav-tema');
      voltar.href = hrefTema;
      voltar.appendChild(criar('span', 'nav-rotulo', '↑ Voltar ao tema'));
      voltar.appendChild(criar('span', 'nav-titulo', tituloTema));
      nav.appendChild(voltar);
      artigo.appendChild(nav);

      el.appendChild(artigo);
      progresso.marcarLido(chave);

      return {
        destruir: function () {
          estado.destruido = true;
          montados.forEach(function (m) {
            if (m && typeof m.destruir === 'function') {
              try {
                m.destruir();
              } catch (erro) {
                // ignora
              }
            }
          });
          montados.length = 0;
        },
      };
    },
  };
})();
