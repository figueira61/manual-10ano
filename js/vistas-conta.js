globalThis.Manual = globalThis.Manual || {};

// Vistas de conta (entrar, registar, a minha conta, privacidade) e o botão da conta no topo.
// Só DOM e texto: toda a comunicação passa por Manual.conta. Sem innerHTML.
(function () {
  const Manual = globalThis.Manual;
  const R = Manual.render;
  const criar = R.criar;

  const MENSAGENS = {
    credenciais: 'Email ou palavra-passe incorretos.',
    email_por_confirmar: 'Ainda não confirmaste o email. Abre a mensagem que te enviámos e clica na ligação de confirmação.',
    rede: 'Sem ligação ao servidor. Verifica a internet e tenta outra vez. O estudo continua a funcionar sem conta.',
    codigo_invalido: 'Este código não é válido, já foi usado ou expirou. Pede um código novo à educanda.',
    papel_invalido: 'Este código só pode ser usado por uma conta de encarregado de educação.',
    sem_sessao: 'A tua sessão terminou. Entra outra vez.',
    ja_registado: 'Já existe uma conta com este email. Tenta entrar.',
    palavra_passe_fraca: 'A palavra-passe é demasiado fraca. Usa pelo menos 8 caracteres, com letras e números.',
    demasiados_pedidos: 'Demasiadas tentativas num curto espaço de tempo. Espera um pouco e tenta outra vez.',
    desconhecido: 'Algo correu mal. Tenta outra vez dentro de instantes.',
  };

  function mensagemDe(erro) {
    return MENSAGENS[erro && erro.codigo] || MENSAGENS.desconhecido;
  }

  function dataCurta(iso) {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-PT');
  }

  function ligacao(href, texto, classe) {
    const a = criar('a', classe || '', texto);
    a.href = href;
    return a;
  }

  function irPara(hash) {
    window.location.hash = hash;
  }

  // ---------- peças de formulário ----------

  // Par label + input, com id estável. Devolve o input.
  function campo(form, o) {
    const linha = criar('div', 'campo-linha');
    const label = criar('label', 'campo-rotulo', o.rotulo);
    label.htmlFor = o.id;
    const input = document.createElement('input');
    input.id = o.id;
    input.name = o.id;
    input.type = o.tipo || 'text';
    input.className = 'campo-texto';
    if (o.autocomplete) input.autocomplete = o.autocomplete;
    if (o.minimo) input.minLength = o.minimo;
    linha.appendChild(label);
    linha.appendChild(input);
    if (o.ajuda) {
      const ajuda = criar('p', 'campo-ajuda', o.ajuda);
      ajuda.id = o.id + '-ajuda';
      input.setAttribute('aria-describedby', ajuda.id);
      linha.appendChild(ajuda);
    }
    form.appendChild(linha);
    return input;
  }

  // Região de mensagens (aria-live). `mostrar(texto, tipo)`; sem texto limpa.
  function regiaoMensagem(pai, id) {
    const p = criar('p', 'aviso-form');
    p.id = id;
    p.setAttribute('aria-live', 'polite');
    p.hidden = true;
    pai.appendChild(p);
    return function (texto, tipo) {
      p.textContent = texto || '';
      p.hidden = !texto;
      p.className = 'aviso-form ' + (tipo === 'ok' ? 'aviso-ok' : 'aviso-erro');
    };
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

  function botaoAcao(texto, classe) {
    const b = criar('button', 'botao ' + (classe || ''), texto);
    b.type = 'button';
    return b;
  }

  // Executa `tarefa` com o botão desativado; erros viram mensagem.
  function comEspera(botao, mostrar, tarefa) {
    botao.disabled = true;
    mostrar('');
    return Promise.resolve()
      .then(tarefa)
      .catch(function (e) { mostrar(mensagemDe(e)); })
      .then(function () { botao.disabled = false; });
  }

  // ---------- vistas ----------

  function vistaEntrar(principal) {
    cabecalho(principal, 'Entrar');
    const c = cartao(principal);
    c.appendChild(criar('p', '', 'Com conta, o teu progresso fica guardado e pode ser acompanhado por quem escolheres. Sem conta, o manual continua a funcionar como sempre.'));
    const form = criar('form', 'formulario');
    form.noValidate = true;
    const email = campo(form, { id: 'entrar-email', rotulo: 'Email', tipo: 'email', autocomplete: 'email' });
    const senha = campo(form, { id: 'entrar-senha', rotulo: 'Palavra-passe', tipo: 'password', autocomplete: 'current-password' });
    const mostrar = regiaoMensagem(form, 'entrar-mensagem');
    const botao = criar('button', 'botao botao-principal', 'Entrar');
    botao.type = 'submit';
    form.appendChild(botao);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!email.value.trim() || !senha.value) {
        mostrar('Preenche o email e a palavra-passe.');
        return;
      }
      comEspera(botao, mostrar, function () {
        return Manual.conta.entrar(email.value.trim(), senha.value).then(function () { irPara('#/conta'); });
      });
    });
    c.appendChild(form);
    const rodape = criar('p', 'campo-ajuda');
    rodape.appendChild(document.createTextNode('Ainda não tens conta? '));
    rodape.appendChild(ligacao('#/registar', 'Cria uma conta'));
    rodape.appendChild(document.createTextNode('.'));
    c.appendChild(rodape);
  }

  function vistaRegistar(principal) {
    cabecalho(principal, 'Criar conta');
    const c = cartao(principal);
    const form = criar('form', 'formulario');
    form.noValidate = true;
    const email = campo(form, { id: 'registar-email', rotulo: 'Email', tipo: 'email', autocomplete: 'email' });
    const senha = campo(form, {
      id: 'registar-senha', rotulo: 'Palavra-passe', tipo: 'password', autocomplete: 'new-password',
      minimo: 8, ajuda: 'Mínimo de 8 caracteres.',
    });
    const nome = campo(form, { id: 'registar-nome', rotulo: 'Nome a mostrar', autocomplete: 'nickname' });

    const grupo = document.createElement('fieldset');
    grupo.className = 'campo-grupo';
    grupo.appendChild(criar('legend', 'campo-rotulo', 'Tipo de conta'));
    const papeis = [
      { valor: 'aluna', rotulo: 'Sou aluna' },
      { valor: 'encarregado', rotulo: 'Sou encarregado de educação' },
    ];
    const radios = papeis.map(function (p, i) {
      const label = criar('label', 'opcao');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'registar-papel';
      radio.id = 'registar-papel-' + p.valor;
      radio.value = p.valor;
      radio.checked = i === 0;
      label.appendChild(radio);
      label.appendChild(criar('span', '', p.rotulo));
      grupo.appendChild(label);
      return radio;
    });
    form.appendChild(grupo);

    const labelPriv = criar('label', 'opcao');
    const caixa = document.createElement('input');
    caixa.type = 'checkbox';
    caixa.id = 'registar-privacidade';
    labelPriv.appendChild(caixa);
    const textoPriv = criar('span');
    textoPriv.appendChild(document.createTextNode('Li a '));
    textoPriv.appendChild(ligacao('#/privacidade', 'informação de privacidade'));
    textoPriv.appendChild(document.createTextNode('.'));
    labelPriv.appendChild(textoPriv);
    form.appendChild(labelPriv);

    const mostrar = regiaoMensagem(form, 'registar-mensagem');
    const botao = criar('button', 'botao botao-principal', 'Criar conta');
    botao.type = 'submit';
    form.appendChild(botao);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const endereco = email.value.trim();
      if (!endereco || endereco.indexOf('@') < 1) { mostrar('Escreve um email válido.'); return; }
      if (senha.value.length < 8) { mostrar('A palavra-passe tem de ter pelo menos 8 caracteres.'); return; }
      if (!nome.value.trim()) { mostrar('Escreve o nome a mostrar.'); return; }
      if (!caixa.checked) { mostrar('Tens de confirmar que leste a informação de privacidade.'); return; }
      const papel = radios.find(function (r) { return r.checked; }).value;
      comEspera(botao, mostrar, function () {
        return Manual.conta.registar(endereco, senha.value, papel, nome.value.trim()).then(function (r) {
          if (r && r.precisaConfirmar) {
            form.hidden = true;
            const ok = criar('p', 'aviso-form aviso-ok', 'Enviámos um email de confirmação para ' + endereco + '. Abre a mensagem e clica na ligação para ativar a conta.');
            ok.setAttribute('role', 'status');
            c.appendChild(ok);
            c.appendChild(ligacao('#/entrar', 'Ir para Entrar', 'botao'));
          } else {
            irPara('#/conta');
          }
        });
      });
    });
    c.appendChild(form);
  }

  function vistaPrivacidade(principal) {
    cabecalho(principal, 'Privacidade');
    const c = cartao(principal);
    const itens = [
      ['Que dados guardamos', 'Só o mínimo: o teu email, o nome a mostrar, o tipo de conta (aluna ou encarregado de educação) e as tuas tentativas e estados de estudo (que perguntas respondeste, se acertaste e quanto tempo demoraste).'],
      ['Para quê', 'Para guardar o teu progresso, adaptar o treino ao que ainda não dominas e, se quiseres, permitir que o teu encarregado de educação o acompanhe. Não usamos os dados para publicidade nem os partilhamos com terceiros.'],
      ['Quem tem acesso', 'Tu; o encarregado de educação que ligares à tua conta com um código (podes revogar a ligação quando quiseres); e a administração do projeto, apenas a pedido e para resolver um problema.'],
      ['Exportar e apagar', 'Em "A minha conta" podes descarregar todos os teus dados (JSON) e apagar a conta. Ao apagar, os dados são removidos definitivamente.'],
      ['Idade de consentimento', 'Em Portugal, o consentimento próprio para serviços online é válido a partir dos 13 anos (Lei n.º 58/2019). Abaixo dessa idade é necessária a autorização dos pais ou do representante legal.'],
      ['Sem conta', 'Podes estudar sem criar conta. Nesse caso, o progresso fica só guardado neste dispositivo.'],
    ];
    itens.forEach(function (i) {
      c.appendChild(criar('h2', '', i[0]));
      c.appendChild(criar('p', '', i[1]));
    });
  }

  function descarregarJson(dados, nomeFicheiro) {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeFicheiro;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // Lista de ligações com botão "Revogar" (aluna) ou só texto (encarregado).
  function listaLigacoes(pai, vivo, textoItem, revogavel) {
    const lista = criar('ul', 'lista-ligacoes');
    pai.appendChild(lista);
    const mostrar = regiaoMensagem(pai, 'conta-ligacoes-mensagem');
    function carregar() {
      Manual.conta.ligacoes().then(function (linhas) {
        if (!vivo()) return;
        lista.textContent = '';
        if (!linhas.length) {
          lista.appendChild(criar('li', 'campo-ajuda', 'Ainda não há nenhuma ligação.'));
          return;
        }
        linhas.forEach(function (l) {
          const li = criar('li', 'item-ligacao');
          li.appendChild(criar('span', '', textoItem + ' desde ' + dataCurta(l.criado_em)));
          if (revogavel) {
            const revogar = botaoAcao('Revogar');
            revogar.addEventListener('click', function () {
              comEspera(revogar, mostrar, function () {
                return Manual.conta.revogarLigacao(l.id).then(carregar);
              });
            });
            li.appendChild(revogar);
          }
          lista.appendChild(li);
        });
      }).catch(function (e) { if (vivo()) mostrar(mensagemDe(e)); });
    }
    carregar();
    return carregar;
  }

  function blocoLigacoesAluna(pai, vivo) {
    const c = cartao(pai, 'Encarregado de educação');
    c.appendChild(criar('p', '', 'Gera um código e entrega-o ao teu encarregado de educação para ele poder acompanhar o teu progresso. O código é de uso único e vale 48 horas.'));
    const gerar = criar('button', 'botao botao-principal', 'Gerar código para o encarregado');
    gerar.type = 'button';
    c.appendChild(gerar);
    const mostrar = regiaoMensagem(c, 'conta-codigo-mensagem');
    const zonaCodigo = criar('div', 'codigo-ligacao');
    zonaCodigo.setAttribute('aria-live', 'polite');
    c.appendChild(zonaCodigo);
    gerar.addEventListener('click', function () {
      comEspera(gerar, mostrar, function () {
        return Manual.conta.gerarCodigoLigacao().then(function (codigo) {
          if (!vivo()) return;
          zonaCodigo.textContent = '';
          zonaCodigo.appendChild(criar('p', 'codigo-valor', String(codigo)));
          zonaCodigo.appendChild(criar('p', 'campo-ajuda', 'Válido durante 48 horas e só pode ser usado uma vez.'));
        });
      });
    });
    c.appendChild(criar('h3', '', 'Encarregados ligados'));
    listaLigacoes(c, vivo, 'Encarregado ligado', true);
  }

  function blocoLigacoesEncarregado(pai, vivo) {
    const c = cartao(pai, 'Educandas');
    c.appendChild(criar('p', '', 'Escreve o código que a educanda gerou na página dela.'));
    const form = criar('form', 'formulario');
    form.noValidate = true;
    const codigo = campo(form, { id: 'conta-codigo', rotulo: 'Código da educanda', autocomplete: 'off' });
    codigo.maxLength = 12;
    codigo.classList.add('campo-codigo');
    const mostrar = regiaoMensagem(form, 'conta-ligar-mensagem');
    const botao = criar('button', 'botao botao-principal', 'Ligar');
    botao.type = 'submit';
    form.appendChild(botao);
    c.appendChild(form);
    c.appendChild(criar('h3', '', 'Educandas ligadas'));
    const recarregar = listaLigacoes(c, vivo, 'Educanda ligada', false);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const valor = codigo.value.trim().toUpperCase();
      if (!valor) { mostrar('Escreve o código.'); return; }
      comEspera(botao, mostrar, function () {
        return Manual.conta.ligarEncarregado(valor).then(function () {
          if (!vivo()) return;
          codigo.value = '';
          mostrar('Ligação criada.', 'ok');
          recarregar();
        });
      });
    });
  }

  function blocoDados(pai) {
    const c = cartao(pai, 'Os meus dados');
    const exportar = botaoAcao('Exportar os meus dados');
    c.appendChild(exportar);
    const mostrar = regiaoMensagem(c, 'conta-dados-mensagem');
    exportar.addEventListener('click', function () {
      comEspera(exportar, mostrar, function () {
        return Manual.conta.exportar().then(function (dados) {
          descarregarJson(dados, 'manual-10ano-dados.json');
          mostrar('Ficheiro descarregado.', 'ok');
        });
      });
    });

    c.appendChild(criar('h3', 'titulo-perigo', 'Apagar a minha conta'));
    c.appendChild(criar('p', '', 'Remove a conta e todos os dados associados, de forma definitiva. Para confirmar, escreve APAGAR.'));
    const form = criar('form', 'formulario');
    form.noValidate = true;
    const confirmacao = campo(form, { id: 'conta-apagar-confirmar', rotulo: 'Escreve APAGAR para confirmar', autocomplete: 'off' });
    const mostrarApagar = regiaoMensagem(form, 'conta-apagar-mensagem');
    const apagar = criar('button', 'botao botao-perigo', 'Apagar a minha conta');
    apagar.type = 'submit';
    form.appendChild(apagar);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (confirmacao.value.trim() !== 'APAGAR') {
        mostrarApagar('Para apagar, escreve APAGAR (em maiúsculas).');
        return;
      }
      comEspera(apagar, mostrarApagar, function () {
        return Manual.conta.apagarConta().then(function () { irPara('#/'); });
      });
    });
    c.appendChild(form);
  }

  function vistaConta(principal) {
    let vivo = true;
    cabecalho(principal, 'A minha conta');
    const corpo = criar('div');
    principal.appendChild(corpo);
    const aindaVivo = function () { return vivo; };

    function desenhar() {
      corpo.textContent = '';
      const est = Manual.conta.estado();
      if (!est.autenticado) {
        const c = cartao(corpo);
        c.appendChild(criar('p', '', 'Não tens sessão iniciada.'));
        c.appendChild(ligacao('#/entrar', 'Entrar', 'botao botao-principal'));
        return;
      }
      const perfil = cartao(corpo, 'Perfil');
      const dl = criar('dl', 'dados-perfil');
      dl.appendChild(criar('dt', '', 'Nome'));
      dl.appendChild(criar('dd', '', est.perfil && est.perfil.nome ? est.perfil.nome : '—'));
      dl.appendChild(criar('dt', '', 'Tipo de conta'));
      dl.appendChild(criar('dd', '', est.papel === 'encarregado' ? 'Encarregado de educação' : 'Aluna'));
      perfil.appendChild(dl);
      const sair = botaoAcao('Sair');
      sair.addEventListener('click', function () {
        sair.disabled = true;
        Promise.resolve(Manual.conta.sair()).then(function () { irPara('#/'); });
      });
      perfil.appendChild(sair);

      if (est.papel === 'encarregado') blocoLigacoesEncarregado(corpo, aindaVivo);
      else blocoLigacoesAluna(corpo, aindaVivo);
      blocoDados(corpo);
      corpo.appendChild(ligacao('#/privacidade', 'Informação de privacidade', 'botao'));
    }

    desenhar();
    // Só redesenha quando a sessão ou o papel mudam, para não perder o que a pessoa escreveu.
    let autenticadoAntes = Manual.conta.estado().autenticado;
    let papelAntes = Manual.conta.estado().papel;
    const desligar = Manual.conta.aoMudar(function (e) {
      if (!vivo) return;
      if (e.autenticado !== autenticadoAntes || e.papel !== papelAntes) {
        autenticadoAntes = e.autenticado;
        papelAntes = e.papel;
        desenhar();
      }
    });
    return {
      destruir: function () {
        vivo = false;
        desligar();
      },
    };
  }

  const TITULOS_BREVE = { progresso: 'O meu progresso', treino: 'Treino', teste: 'Teste', encarregado: 'Encarregado' };

  // Devolve { destruir } quando a vista precisa de limpeza.
  function montar(vista, principal) {
    switch (vista) {
      case 'entrar': vistaEntrar(principal); return null;
      case 'registar': vistaRegistar(principal); return null;
      case 'privacidade': vistaPrivacidade(principal); return null;
      case 'conta': return vistaConta(principal);
      default:
        cabecalho(principal, TITULOS_BREVE[vista] || 'Em breve');
        principal.appendChild(criar('p', '', 'Disponível em breve.'));
        principal.appendChild(ligacao('#/', 'Voltar ao início', 'botao'));
        return null;
    }
  }

  // ---------- botão da conta no topo ----------

  function montarTopo(zona) {
    let desligarDoc = null;

    function desenhar(est) {
      if (desligarDoc) { desligarDoc(); desligarDoc = null; }
      zona.textContent = '';
      if (!est.autenticado) {
        zona.appendChild(ligacao('#/entrar', 'Entrar', 'botao botao-topo'));
        return;
      }
      const nome = est.perfil && est.perfil.nome ? est.perfil.nome : 'Conta';
      const botao = criar('button', 'botao botao-topo botao-conta', nome);
      botao.type = 'button';
      botao.id = 'botao-conta';
      botao.setAttribute('aria-haspopup', 'true');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-controls', 'menu-conta');
      const menu = criar('div', 'menu-conta');
      menu.id = 'menu-conta';
      menu.hidden = true;
      const minha = ligacao('#/conta', 'A minha conta', 'menu-item');
      const sair = criar('button', 'menu-item', 'Sair');
      sair.type = 'button';
      menu.appendChild(minha);
      menu.appendChild(sair);
      zona.appendChild(botao);
      zona.appendChild(menu);

      function alternar(abrir) {
        menu.hidden = !abrir;
        botao.setAttribute('aria-expanded', String(abrir));
      }
      botao.addEventListener('click', function (e) { e.stopPropagation(); alternar(menu.hidden); });
      minha.addEventListener('click', function () { alternar(false); });
      sair.addEventListener('click', function () {
        alternar(false);
        Promise.resolve(Manual.conta.sair()).then(function () { irPara('#/'); });
      });
      const fora = function (e) { if (!menu.hidden && !zona.contains(e.target)) alternar(false); };
      document.addEventListener('click', fora);
      desligarDoc = function () { document.removeEventListener('click', fora); };
    }

    zona.addEventListener('keydown', function (e) {
      const menu = zona.querySelector('.menu-conta');
      if (e.key === 'Escape' && menu && !menu.hidden) {
        menu.hidden = true;
        const botao = zona.querySelector('.botao-conta');
        botao.setAttribute('aria-expanded', 'false');
        botao.focus();
      }
    });
    desenhar(Manual.conta.estado());
    Manual.conta.aoMudar(desenhar);
  }

  Manual.vistasConta = { montar: montar, montarTopo: montarTopo, mensagemDe: mensagemDe };
})();
