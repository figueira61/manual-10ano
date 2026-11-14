globalThis.Manual = globalThis.Manual || {};

// Motor de quiz: parte pura (leitura de números e correção). A montagem no DOM vem depois.
Manual.quiz = Manual.quiz || {};

// Lê um número escrito pelo aluno. NaN se inválido.
// Aceita sinal inicial e um único separador decimal (vírgula ou ponto); espaços são ignorados.
Manual.quiz.lerNumero = function (texto) {
  if (typeof texto !== 'string') return NaN;
  const limpo = texto.replace(/−/g, '-').replace(/\s/g, '');
  if (!/^[+-]?(\d+[.,]?\d*|[.,]\d+)$/.test(limpo)) return NaN;
  return Number(limpo.replace(',', '.'));
};

// Permutação aleatória de 0..n-1 (Fisher–Yates). `aleatorio` devolve um número em [0,1).
Manual.quiz.ordemOpcoes = function (n, aleatorio) {
  const rnd = aleatorio || Math.random;
  const ordem = [];
  for (let i = 0; i < n; i++) ordem.push(i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = ordem[i]; ordem[i] = ordem[j]; ordem[j] = t;
  }
  return ordem;
};

// Resposta numérica como texto (sem a unidade). Perguntas geradas: como no resto do item, pelo Manual.formatar
// (espaço dos milhares a partir de 5 algarismos, menos tipográfico; euros sempre com 2 casas: «3803,80», «18 440,00»).
// Perguntas do banco (e sem Manual.formatar carregado): a apresentação de sempre, vírgula no lugar do ponto.
Manual.quiz.textoNumero = function (pergunta) {
  const v = pergunta.resposta;
  if (!pergunta.gerador || !Manual.formatar || typeof v !== 'number') return String(v).replace('.', ',').replace('-', '−');
  if (pergunta.unidade === '€') {
    return Manual.formatar.arred(v).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/-/g, '−');
  }
  return Manual.formatar.num(v);
};

// Corrige uma pergunta com a resposta dada. Nunca lança erro.
Manual.quiz.corrigir = function (pergunta, resposta) {
  const resolucao = pergunta.resolucao || [];
  const explicacao = pergunta.explicacao || '';
  let valida = false;
  let certa = false;
  let respostaCorreta = '';

  if (pergunta.tipo === 'escolha') {
    respostaCorreta = pergunta.opcoes[pergunta.correta];
    valida = Number.isInteger(resposta) && resposta >= 0 && resposta < pergunta.opcoes.length;
    certa = valida && resposta === pergunta.correta;
  } else if (pergunta.tipo === 'vf') {
    respostaCorreta = pergunta.correta ? 'Verdadeiro' : 'Falso';
    valida = typeof resposta === 'boolean';
    certa = valida && resposta === pergunta.correta;
  } else if (pergunta.tipo === 'numerica') {
    const tolerancia = pergunta.tolerancia === undefined ? 1e-9 : pergunta.tolerancia;
    respostaCorreta = Manual.quiz.textoNumero(pergunta);
    if (pergunta.unidade) respostaCorreta += ' ' + pergunta.unidade;
    const x = Manual.quiz.lerNumero(resposta);
    valida = !Number.isNaN(x);
    certa = valida && Math.abs(x - pergunta.resposta) <= tolerancia + 1e-12;
  }

  let erroTipico = null;
  if (valida && !certa && Manual.aprendizagem && typeof Manual.aprendizagem.detetarErro === 'function') {
    erroTipico = Manual.aprendizagem.detetarErro(pergunta, resposta);
  }

  return { valida, certa, respostaCorreta, resolucao, explicacao, erroTipico };
};

// Tentativa a registar quando a aluna verifica uma pergunta do mini-quiz. Função pura.
// Duração máxima registada (1 hora): um separador esquecido aberto não gera um valor absurdo.
const DURACAO_MAXIMA_MS = 3600000;

function limitarDuracao(ms) {
  if (typeof ms !== 'number' || !isFinite(ms)) return null;
  return Math.min(DURACAO_MAXIMA_MS, Math.max(0, Math.round(ms)));
}

const MODOS = ['quiz', 'treino', 'teste'];

// 8.º argumento (opcional): { modo, nivel_ajuda, usou_pista, viu_resolucao }. Um modo desconhecido é um erro de programação.
Manual.quiz.construirTentativa = function (contexto, pergunta, indice, resultado, duracaoMs, sessaoId, erroTipico, extra) {
  const o = Object.assign({ modo: 'quiz', nivel_ajuda: 2, usou_pista: false, viu_resolucao: false }, extra);
  if (MODOS.indexOf(o.modo) < 0) throw new Error('Modo de tentativa desconhecido: ' + o.modo);
  const t = {
    disciplina: contexto.disciplina,
    tema: contexto.tema,
    subtema: contexto.subtema,
    tipo: pergunta.id || contexto.subtema + '#q' + indice,
    semente: Number.isInteger(pergunta.semente) ? pergunta.semente : null,
    formato: pergunta.formato || pergunta.tipo,
    modo: o.modo,
    nivel_ajuda: o.nivel_ajuda,
    resultado: resultado,
    primeira_tentativa: true,
    viu_resolucao: o.viu_resolucao,
    usou_pista: o.usou_pista,
    erro_tipico: erroTipico ? erroTipico.codigo : null,
    duracao_ms: limitarDuracao(duracaoMs),
    sessao_id: sessaoId,
  };
  if (typeof pergunta.contexto === 'string') t.contexto = pergunta.contexto;
  return t;
};

// "passo — porquê" de um passo da resolução detalhada (sem o cálculo). O porquê passa por R.texto, por isso o $…$ compõe-se com KaTeX.
function linhaPasso(R, p) {
  const linha = R.criar('p', 'passo-texto');
  linha.appendChild(R.criar('strong', '', ''));
  R.texto(linha.lastChild, p.passo);
  if (p.porque) R.texto(linha, ' — ' + p.porque);
  return linha;
}

// Resolução detalhada de um exercício gerado: cada passo "passo — porquê" e, por baixo, o cálculo
// (bloco: true → matemática de bloco). O cálculo fica numa caixa com scroll horizontal próprio.
function resolucaoDetalhada(R, pai, lista) {
  const ol = R.criar('ol', 'passos');
  lista.forEach(function (p) {
    const li = document.createElement('li');
    li.appendChild(linhaPasso(R, p));
    if (p.calculo) {
      const calc = R.criar('div', 'passo-calculo');
      R.texto(calc, p.bloco ? '$$' + p.calculo + '$$' : '$' + p.calculo + '$');
      li.appendChild(calc);
    }
    ol.appendChild(li);
  });
  pai.appendChild(ol);
}

function verificacao(R, pai, v) {
  if (!v || !v.passo) return;
  const caixa = R.criar('div', 'verificacao');
  const linha = R.criar('p', 'passo-texto');
  linha.appendChild(R.criar('strong', '', 'Verificação: '));
  R.texto(linha, v.passo);
  caixa.appendChild(linha);
  if (v.calculo) {
    const calc = R.criar('div', 'passo-calculo');
    R.texto(calc, v.bloco ? '$$' + v.calculo + '$$' : '$' + v.calculo + '$');
    caixa.appendChild(calc);
  }
  pai.appendChild(caixa);
}

function passosDe(pergunta) {
  return Array.isArray(pergunta.resolucaoDetalhada) && pergunta.resolucaoDetalhada.length
    ? pergunta.resolucaoDetalhada : null;
}

// O feedback de uma pergunta corrigida: veredicto, resposta correta, erro típico, resolução, verificação,
// esquema e ligação "Rever no manual". Usado no quiz (depois de Verificar) e na revisão do teste.
// r: resultado de Manual.quiz.corrigir. registarEsquema(montagem) guarda o que é preciso destruir.
function construirFeedback(R, feedback, pergunta, r, o, registarEsquema) {
  feedback.className = 'feedback ' + (r.certa ? 'certo' : 'errado');
  feedback.appendChild(R.criar('p', 'veredicto', r.certa ? '✔ Certo!' : '✘ Errado.'));
  const correta = R.criar('p', 'resposta-correta');
  correta.appendChild(document.createTextNode('Resposta correta: '));
  const valor = document.createElement('span');
  R.texto(valor, r.respostaCorreta);
  correta.appendChild(valor);
  feedback.appendChild(correta);
  if (r.erroTipico) {
    const bloco = R.criar('div', 'erro-tipico');
    bloco.appendChild(R.criar('p', 'feedback-titulo', 'O que provavelmente aconteceu'));
    R.paragrafo(bloco, r.erroTipico.explicacao, 'explicacao');
    feedback.appendChild(bloco);
  }
  const detalhada = passosDe(pergunta);
  if (detalhada) {
    feedback.appendChild(R.criar('p', 'feedback-titulo', 'Resolução'));
    resolucaoDetalhada(R, feedback, detalhada);
    verificacao(R, feedback, pergunta.verificacao);
  } else if (r.resolucao.length) {
    feedback.appendChild(R.criar('p', 'feedback-titulo', 'Resolução'));
    R.passos(feedback, r.resolucao);
  }
  if (r.explicacao) R.paragrafo(feedback, r.explicacao, 'explicacao');
  // O esquema só aparece depois de verificar: pode mostrar a resposta.
  if (pergunta.esquema && pergunta.esquema.id && typeof o.montarEsquema === 'function') {
    try {
      registarEsquema(o.montarEsquema(feedback, pergunta.esquema));
    } catch (erro) {
      // sem esquema
    }
  }
  if (typeof o.ligacaoRever === 'function') {
    let href = null;
    try {
      href = o.ligacaoRever(pergunta);
    } catch (erro) {
      // sem ligação
    }
    if (href) {
      const a = R.criar('a', 'ligacao-rever', 'Rever no manual');
      a.href = href;
      feedback.appendChild(a);
    }
  }
}

function doisAlgarismos(n) {
  return (n < 10 ? '0' : '') + n;
}

// Monta o quiz no DOM: uma pergunta de cada vez. aoTerminar(certas, total, respostas) no fim.
// perguntas: lista ou função que devolve a lista (chamada de novo em cada "Repetir").
// opcoes (todas opcionais; sem elas o comportamento é o do mini-quiz):
//   montarEsquema(pai, esquema) -> { destruir }: mostra o esquema do exercício no feedback.
//   modo: 'quiz' (por omissão), 'treino' ou 'teste' (sem feedback até ao fim; revisão no fim).
//   nivel(pergunta) -> 0|1|2 (treino): 1 = pista, 0 = por passos, 2 (ou outro valor) = sem ajuda.
//   cronometro: boolean (teste): mm:ss a contar.
//   ligacaoRever(pergunta) -> href|null: "Rever no manual" no feedback (treino) e na revisão (teste).
//   fim(cartao, certas, total, respostas): substitui o conteúdo do cartão final (sem "Repetir").
Manual.quiz.montar = function (el, perguntasOuFn, aoTerminar, aoResponder, opcoes) {
  const R = Manual.render;
  const o = opcoes || {};
  const modo = MODOS.indexOf(o.modo) >= 0 ? o.modo : 'quiz';
  const teste = modo === 'teste';
  const treino = modo === 'treino';
  const obter = typeof perguntasOuFn === 'function' ? perguntasOuFn : function () { return perguntasOuFn; };
  let perguntas = obter();
  let indice = 0;
  let certas = 0;
  let inicio = Date.now();
  let esquemas = [];
  let respostas = [];
  let intervalo = null;
  let cronometroEl = null;

  function registarEsquema(m) {
    esquemas.push(m);
  }

  function destruirEsquemas() {
    esquemas.forEach(function (m) {
      try {
        if (m && typeof m.destruir === 'function') m.destruir();
      } catch (erro) {
        // ignora
      }
    });
    esquemas = [];
  }

  function pararCronometro() {
    if (intervalo !== null) {
      clearInterval(intervalo);
      intervalo = null;
    }
  }

  function iniciarCronometro() {
    pararCronometro();
    if (!(teste && o.cronometro)) return;
    const t0 = Date.now();
    if (!cronometroEl) {
      cronometroEl = R.criar('p', 'cronometro', '00:00');
      cronometroEl.setAttribute('role', 'timer');
      cronometroEl.setAttribute('aria-live', 'off');
    }
    const atualizar = function () {
      const s = Math.max(0, Math.floor((Date.now() - t0) / 1000));
      cronometroEl.textContent = doisAlgarismos(Math.floor(s / 60)) + ':' + doisAlgarismos(s % 60);
    };
    atualizar();
    intervalo = setInterval(atualizar, 1000);
  }

  function destruir() {
    destruirEsquemas();
    pararCronometro();
  }

  // Nível de ajuda pedido para a pergunta (só no treino): 0, 1 ou 2 (por omissão e para qualquer outro valor).
  function nivelDe(pergunta) {
    if (!treino || typeof o.nivel !== 'function') return 2;
    try {
      const n = o.nivel(pergunta);
      return n === 0 || n === 1 ? n : 2;
    } catch (erro) {
      return 2;
    }
  }

  function novaPergunta(focar) {
    destruirEsquemas();
    el.textContent = '';
    const pergunta = perguntas[indice];
    const cartao = R.criar('div', 'pergunta');
    inicio = Date.now();
    if (cronometroEl && intervalo !== null) cartao.appendChild(cronometroEl);
    const numero = R.criar('p', 'pergunta-n', 'Pergunta ' + (indice + 1) + ' de ' + perguntas.length);
    numero.tabIndex = -1;
    cartao.appendChild(numero);
    R.paragrafo(cartao, pergunta.enunciado, 'enunciado');

    const nomeGrupo = 'q' + Math.random().toString(36).slice(2);
    const opcoes = [];
    let campo = null;
    const grupo = R.criar('div', 'opcoes');

    function opcao(rotulo, valor) {
      const label = R.criar('label', 'opcao');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = nomeGrupo;
      label.appendChild(radio);
      const span = document.createElement('span');
      R.texto(span, rotulo);
      label.appendChild(span);
      grupo.appendChild(label);
      opcoes.push({ radio: radio, valor: valor });
    }

    if (pergunta.tipo === 'escolha') {
      Manual.quiz.ordemOpcoes(pergunta.opcoes.length).forEach(function (i) { opcao(pergunta.opcoes[i], i); });
    } else if (pergunta.tipo === 'vf') {
      opcao('Verdadeiro', true);
      opcao('Falso', false);
    } else {
      campo = document.createElement('input');
      campo.type = 'text';
      campo.className = 'campo-numero';
      campo.autocomplete = 'off';
      campo.setAttribute('aria-label', 'Resposta');
      grupo.appendChild(campo);
      if (pergunta.unidade) grupo.appendChild(R.criar('span', 'unidade', ' ' + pergunta.unidade));
    }
    cartao.appendChild(grupo);

    // Ajuda do treino (só com resolução detalhada): nível 1 = pista, nível 0 = passos um a um.
    const nivel = nivelDe(pergunta);
    const passosAjuda = treino ? passosDe(pergunta) : null;
    let usouPista = false;
    let viuPassos = false;
    const botoesAjuda = [];
    if (passosAjuda && nivel === 1) {
      const caixa = R.criar('div', 'ajuda');
      const pista = R.criar('button', 'botao', 'Dá-me uma pista');
      pista.type = 'button';
      pista.onclick = function () {
        const texto = R.criar('div', 'pista');
        texto.appendChild(linhaPasso(R, passosAjuda[0]));
        caixa.appendChild(texto);
        pista.disabled = true;
        usouPista = true;
      };
      caixa.appendChild(pista);
      botoesAjuda.push(pista);
      cartao.appendChild(caixa);
    } else if (passosAjuda && nivel === 0) {
      const caixa = R.criar('div', 'ajuda ajuda-passos');
      caixa.appendChild(R.criar('p', 'feedback-titulo', 'Vamos por passos'));
      const ol = R.criar('ol', 'passos');
      caixa.appendChild(ol);
      const proximo = R.criar('button', 'botao', 'Próximo passo');
      proximo.type = 'button';
      proximo.onclick = function () {
        const li = document.createElement('li');
        li.appendChild(linhaPasso(R, passosAjuda[ol.children.length]));
        ol.appendChild(li);
        viuPassos = true;
        if (ol.children.length >= passosAjuda.length) proximo.disabled = true;
      };
      caixa.appendChild(proximo);
      botoesAjuda.push(proximo);
      cartao.appendChild(caixa);
    }

    const mensagem = R.criar('p', 'aviso-erro');
    mensagem.setAttribute('role', 'alert');
    mensagem.hidden = true;
    cartao.appendChild(mensagem);

    const botao = R.criar('button', 'botao botao-principal', 'Verificar');
    botao.type = 'button';
    cartao.appendChild(botao);
    const feedback = R.criar('div', 'feedback');
    feedback.setAttribute('aria-live', 'polite');
    cartao.appendChild(feedback);
    el.appendChild(cartao);
    if (focar) numero.focus();

    function lerResposta() {
      if (campo) return campo.value;
      const escolhida = opcoes.find(function (o) { return o.radio.checked; });
      return escolhida ? escolhida.valor : undefined;
    }

    function verificar() {
      const resposta = lerResposta();
      const r = Manual.quiz.corrigir(pergunta, resposta);
      if (!r.valida) {
        mensagem.textContent = campo ? 'Escreve um número' : 'Escolhe uma opção';
        mensagem.hidden = false;
        return;
      }
      mensagem.hidden = true;
      if (r.certa) certas += 1;
      respostas[indice] = {
        pergunta: pergunta,
        resposta: resposta,
        resultado: r.certa ? 'certa' : 'errada',
        erroTipico: r.erroTipico,
      };
      if (typeof aoResponder === 'function') {
        try {
          aoResponder({
            indice: indice,
            pergunta: pergunta,
            resultado: r.certa ? 'certa' : 'errada',
            duracaoMs: Date.now() - inicio,
            erroTipico: r.erroTipico,
            nivel: nivel,
            usouPista: usouPista,
            viuPassos: viuPassos,
          });
        } catch (e) {
          // o registo nunca impede o estudo
        }
      }
      opcoes.forEach(function (o) { o.radio.disabled = true; });
      if (campo) campo.disabled = true;
      botoesAjuda.forEach(function (b) { b.disabled = true; });

      if (teste) {
        // Sem veredicto, resolução nem esquema: só se vê no ecrã de revisão.
        feedback.appendChild(R.criar('p', 'registada', 'Resposta registada.'));
      } else {
        construirFeedback(R, feedback, pergunta, r, o, registarEsquema);
      }

      const ultima = indice === perguntas.length - 1;
      botao.textContent = ultima ? 'Ver resultado' : 'Seguinte';
      botao.onclick = function () {
        indice += 1;
        if (ultima) fim();
        else novaPergunta(true);
      };
    }

    botao.onclick = verificar;
    if (campo) {
      campo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') botao.click();
      });
    }
  }

  // Ecrã de revisão do teste: por pergunta, o mesmo feedback que o quiz mostra depois de Verificar.
  function revisao() {
    const caixa = R.criar('div', 'revisao');
    caixa.appendChild(R.criar('h3', 'revisao-titulo', 'Revisão'));
    respostas.forEach(function (x, i) {
      const item = R.criar('div', 'revisao-item');
      item.appendChild(R.criar('p', 'pergunta-n', 'Pergunta ' + (i + 1) + ' de ' + respostas.length));
      R.paragrafo(item, x.pergunta.enunciado, 'enunciado');
      const feedback = R.criar('div', 'feedback');
      const r = Manual.quiz.corrigir(x.pergunta, x.resposta);
      construirFeedback(R, feedback, x.pergunta, r, o, registarEsquema);
      item.appendChild(feedback);
      caixa.appendChild(item);
    });
    return caixa;
  }

  function fim() {
    pararCronometro();
    destruirEsquemas();
    el.textContent = '';
    const cartao = R.criar('div', 'pergunta resultado');
    if (typeof o.fim === 'function') {
      o.fim(cartao, certas, perguntas.length, respostas);
      cartao.tabIndex = -1;
      el.appendChild(cartao);
      cartao.focus();
    } else {
      cartao.appendChild(R.criar('p', 'pontuacao', 'Acertaste ' + certas + ' de ' + perguntas.length + '.'));
      const repetir = R.criar('button', 'botao botao-principal', 'Repetir');
      repetir.type = 'button';
      repetir.addEventListener('click', function () {
        perguntas = obter();
        indice = 0;
        certas = 0;
        respostas = [];
        iniciarCronometro();
        novaPergunta(true);
      });
      cartao.appendChild(repetir);
      el.appendChild(cartao);
      repetir.focus();
    }
    if (teste) el.appendChild(revisao());
    if (typeof aoTerminar === 'function') aoTerminar(certas, perguntas.length, respostas);
  }

  iniciarCronometro();
  novaPergunta();
  return { destruir: destruir };
};
