globalThis.Manual = globalThis.Manual || {};

// Arranque, navegação e vistas.
(function () {
  const Manual = globalThis.Manual;
  const R = Manual.render;
  const criar = R.criar;

  let armazenamento = null;
  try {
    armazenamento = window.localStorage;
  } catch (erro) {
    armazenamento = null;
  }
  const progresso = Manual.criarProgresso(armazenamento);

  const principal = document.getElementById('principal');
  const lateral = document.getElementById('lateral');
  const campoPesquisa = document.getElementById('campo-pesquisa');

  let vistaAtual = null; // { destruir }
  let geracao = 0; // descarta renderizações assíncronas obsoletas

  // ---------- utilitários ----------

  function disciplina(id) {
    return Manual.indice.find(function (d) { return d.id === id; });
  }

  function ligacao(href, texto, classe) {
    const a = criar('a', classe || '', texto);
    a.href = href;
    return a;
  }

  function hashDe(vista, campos) {
    return Manual.router.caminho(Object.assign({ vista: vista }, campos));
  }

  function chaveSubtema(d, t, s) {
    return d + '/' + t + '/' + s;
  }

  function titulo(t) {
    document.title = t ? t + ' · Manual 10.º Ano' : 'Manual 10.º Ano';
  }

  // Carrega o ficheiro do tema se necessário. Resolve com o tema ou rejeita.
  function garantirTema(d, t) {
    const existente = Manual.obterTema(d, t);
    if (existente) return Promise.resolve(existente);
    return Manual.carregarScript(Manual.ficheiroTema(d, t)).then(function () {
      const tema = Manual.obterTema(d, t);
      if (!tema) throw new Error('Tema não registado: ' + d + '/' + t);
      return tema;
    });
  }

  function limparVista() {
    if (vistaAtual && typeof vistaAtual.destruir === 'function') vistaAtual.destruir();
    vistaAtual = null;
    principal.textContent = '';
    window.scrollTo(0, 0);
  }

  function selo(chave) {
    const span = criar('span', 'selo');
    const melhor = progresso.melhorQuiz(chave);
    if (progresso.lido(chave)) {
      span.appendChild(criar('span', 'lido', '✓'));
      span.lastChild.setAttribute('title', 'Lido');
    }
    if (melhor) span.appendChild(criar('span', 'melhor', melhor.certas + '/' + melhor.total));
    return span;
  }

  // ---------- vistas ----------

  function vistaNaoEncontrado() {
    titulo('Página não encontrada');
    principal.appendChild(criar('h1', '', 'Página não encontrada'));
    principal.appendChild(criar('p', '', 'Não existe nada neste endereço.'));
    principal.appendChild(ligacao('#/', 'Voltar ao início', 'botao botao-principal'));
  }

  function vistaInicio() {
    titulo('');
    principal.appendChild(criar('h1', '', 'Manual 10.º Ano'));
    principal.appendChild(criar('p', 'subtitulo', 'Resumos, esquemas interativos e mini-quizzes para estudar.'));
    const grelha = criar('div', 'cartoes');
    Manual.indice.forEach(function (d) {
      const cartao = d.disponivel
        ? ligacao(hashDe('disciplina', { disciplina: d.id }), '', 'cartao')
        : criar('div', 'cartao cartao-indisponivel');
      cartao.appendChild(criar('span', 'cartao-nome', d.nome));
      cartao.appendChild(criar('span', 'cartao-estado', d.disponivel ? 'Abrir' : 'Em breve'));
      grelha.appendChild(cartao);
    });
    principal.appendChild(grelha);
  }

  function listaSubtemas(d, tema) {
    const ul = criar('ul', 'lista-subtemas');
    tema.subtemas.forEach(function (s) {
      const li = document.createElement('li');
      const a = ligacao(hashDe('subtema', { disciplina: d.id, tema: tema.id, subtema: s.id }), '');
      a.appendChild(criar('span', 'subtema-titulo', s.titulo));
      a.appendChild(selo(chaveSubtema(d.id, tema.id, s.id)));
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }

  function vistaDisciplina(rota) {
    const d = disciplina(rota.disciplina);
    if (!d) return vistaNaoEncontrado();
    titulo(d.nome);
    principal.appendChild(criar('h1', '', d.nome));
    if (!d.disponivel) {
      principal.appendChild(criar('p', '', 'Em breve.'));
      principal.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
      return undefined;
    }
    principal.appendChild(ligacao(hashDe('resumos', { disciplina: d.id }), 'Resumos da disciplina', 'botao'));
    d.temas.forEach(function (t) {
      const sec = criar('section', 'seccao');
      const h2 = criar('h2');
      h2.appendChild(ligacao(hashDe('tema', { disciplina: d.id, tema: t.id }), t.titulo));
      sec.appendChild(h2);
      sec.appendChild(listaSubtemas(d, t));
      principal.appendChild(sec);
    });
    return undefined;
  }

  function vistaTema(rota) {
    const d = disciplina(rota.disciplina);
    const t = d && d.temas.find(function (x) { return x.id === rota.tema; });
    if (!d || !t) return vistaNaoEncontrado();
    titulo(t.titulo);
    principal.appendChild(ligacao(hashDe('disciplina', { disciplina: d.id }), '← ' + d.nome, 'migalha'));
    principal.appendChild(criar('h1', '', t.titulo));
    principal.appendChild(listaSubtemas(d, t));
    return undefined;
  }

  function vistaSubtema(rota, minhaGeracao) {
    const d = disciplina(rota.disciplina);
    const t = d && d.temas.find(function (x) { return x.id === rota.tema; });
    const s = t && t.subtemas.find(function (x) { return x.id === rota.subtema; });
    if (!s) return vistaNaoEncontrado();
    titulo(s.titulo);
    principal.appendChild(criar('p', 'a-carregar', 'A carregar…'));
    garantirTema(d.id, t.id)
      .then(function (tema) {
        if (minhaGeracao !== geracao) return;
        const dados = tema.subtemas.find(function (x) { return x.id === s.id; });
        if (!dados) throw new Error('Subtema em falta');
        vistaAtual = R.subtema(principal, d.id, t.id, dados, progresso);
      })
      .catch(function () {
        if (minhaGeracao !== geracao) return;
        principal.textContent = '';
        principal.appendChild(criar('p', 'aviso-erro', 'Não foi possível carregar este tema.'));
        principal.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
      });
    return undefined;
  }

  function vistaResumos(rota, minhaGeracao) {
    const d = disciplina(rota.disciplina);
    if (!d || !d.disponivel) return vistaNaoEncontrado();
    titulo('Resumos · ' + d.nome);
    principal.appendChild(ligacao(hashDe('disciplina', { disciplina: d.id }), '← ' + d.nome, 'migalha'));
    principal.appendChild(criar('h1', '', 'Resumos · ' + d.nome));
    const zona = criar('div');
    principal.appendChild(zona);
    zona.appendChild(criar('p', 'a-carregar', 'A carregar…'));
    Promise.all(d.temas.map(function (t) { return garantirTema(d.id, t.id); }))
      .then(function (temas) {
        if (minhaGeracao !== geracao) return;
        zona.textContent = '';
        temas.forEach(function (tema) {
          zona.appendChild(criar('h2', '', tema.titulo));
          tema.subtemas.forEach(function (s) {
            const cartao = criar('div', 'bloco resumo-cartao');
            const h3 = criar('h3');
            h3.appendChild(ligacao(hashDe('subtema', { disciplina: d.id, tema: tema.id, subtema: s.id }), s.titulo));
            cartao.appendChild(h3);
            const ul = criar('ul', 'lista-resumo');
            s.resumo.forEach(function (item) {
              const li = document.createElement('li');
              R.texto(li, item);
              ul.appendChild(li);
            });
            cartao.appendChild(ul);
            zona.appendChild(cartao);
          });
        });
      })
      .catch(function () {
        if (minhaGeracao !== geracao) return;
        zona.textContent = '';
        zona.appendChild(criar('p', 'aviso-erro', 'Não foi possível carregar os resumos.'));
        zona.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
      });
    return undefined;
  }

  function vistaPesquisa(rota) {
    titulo('Pesquisa');
    campoPesquisa.value = rota.termo;
    principal.appendChild(criar('h1', '', 'Pesquisa'));
    const resultados = Manual.pesquisa.procurar(Manual.indice, rota.termo);
    if (rota.termo.trim().length < 2) {
      principal.appendChild(criar('p', '', 'Escreve pelo menos 2 letras para pesquisar.'));
      return undefined;
    }
    if (!resultados.length) {
      principal.appendChild(criar('p', '', 'Sem resultados para "' + rota.termo + '".'));
      return undefined;
    }
    const ul = criar('ul', 'lista-subtemas');
    resultados.forEach(function (r) {
      const li = document.createElement('li');
      const a = ligacao(r.caminho, '');
      a.appendChild(criar('span', 'subtema-titulo', r.titulo));
      li.appendChild(a);
      ul.appendChild(li);
    });
    principal.appendChild(ul);
    return undefined;
  }

  // ---------- barra lateral ----------

  function construirLateral() {
    lateral.textContent = '';
    lateral.appendChild(ligacao('#/', 'Início', 'lateral-inicio'));
    Manual.indice.forEach(function (d) {
      const bloco = criar('div', 'lateral-disciplina');
      if (d.disponivel) {
        bloco.appendChild(ligacao(hashDe('disciplina', { disciplina: d.id }), d.nome, 'lateral-nome'));
        d.temas.forEach(function (t) {
          bloco.appendChild(ligacao(hashDe('tema', { disciplina: d.id, tema: t.id }), t.titulo, 'lateral-tema'));
        });
      } else {
        bloco.appendChild(criar('span', 'lateral-nome desativado', d.nome + ' (em breve)'));
      }
      lateral.appendChild(bloco);
    });
  }

  function fecharGaveta() {
    document.body.classList.remove('gaveta-aberta');
    document.getElementById('botao-menu').setAttribute('aria-expanded', 'false');
  }

  // ---------- encaminhamento ----------

  function navegar() {
    geracao += 1;
    const minhaGeracao = geracao;
    limparVista();
    fecharGaveta();
    const rota = Manual.router.analisar(window.location.hash);
    if (rota.vista !== 'pesquisa') campoPesquisa.value = '';
    switch (rota.vista) {
      case 'inicio':
        vistaInicio();
        break;
      case 'disciplina':
        vistaDisciplina(rota);
        break;
      case 'tema':
        vistaTema(rota);
        break;
      case 'subtema':
        vistaSubtema(rota, minhaGeracao);
        break;
      case 'resumos':
        vistaResumos(rota, minhaGeracao);
        break;
      case 'pesquisa':
        vistaPesquisa(rota);
        break;
      default:
        vistaNaoEncontrado();
    }
    principal.focus({ preventScroll: true });
  }

  function arrancar() {
    construirLateral();
    Manual.tema.ligar(document.getElementById('botao-tema'));

    const botaoMenu = document.getElementById('botao-menu');
    botaoMenu.addEventListener('click', function () {
      const aberta = document.body.classList.toggle('gaveta-aberta');
      botaoMenu.setAttribute('aria-expanded', String(aberta));
    });
    document.getElementById('cortina').addEventListener('click', fecharGaveta);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('gaveta-aberta')) {
        fecharGaveta();
        botaoMenu.focus();
      }
    });

    document.getElementById('form-pesquisa').addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.hash = hashDe('pesquisa', { termo: campoPesquisa.value.trim() });
    });

    window.addEventListener('hashchange', navegar);
    navegar();
  }

  arrancar();

  if ((location.protocol === 'http:' || location.protocol === 'https:') && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      try {
        navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
      } catch (e) { /* sem modo offline */ }
    });
  }
})();
