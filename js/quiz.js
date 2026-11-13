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
    respostaCorreta = String(pergunta.resposta).replace('.', ',').replace('-', '−');
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

Manual.quiz.construirTentativa = function (contexto, pergunta, indice, resultado, duracaoMs, sessaoId, erroTipico) {
  return {
    disciplina: contexto.disciplina,
    tema: contexto.tema,
    subtema: contexto.subtema,
    tipo: pergunta.id || contexto.subtema + '#q' + indice,
    semente: null,
    formato: pergunta.tipo,
    modo: 'quiz',
    nivel_ajuda: 2,
    resultado: resultado,
    primeira_tentativa: true,
    viu_resolucao: false,
    usou_pista: false,
    erro_tipico: erroTipico ? erroTipico.codigo : null,
    duracao_ms: limitarDuracao(duracaoMs),
    sessao_id: sessaoId,
  };
};

// Monta o quiz no DOM: uma pergunta de cada vez. aoTerminar(certas, total) no fim.
Manual.quiz.montar = function (el, perguntas, aoTerminar, aoResponder) {
  const R = Manual.render;
  let indice = 0;
  let certas = 0;
  let inicio = Date.now();

  function novaPergunta(focar) {
    el.textContent = '';
    const pergunta = perguntas[indice];
    const cartao = R.criar('div', 'pergunta');
    inicio = Date.now();
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
      const r = Manual.quiz.corrigir(pergunta, lerResposta());
      if (!r.valida) {
        mensagem.textContent = campo ? 'Escreve um número' : 'Escolhe uma opção';
        mensagem.hidden = false;
        return;
      }
      mensagem.hidden = true;
      if (r.certa) certas += 1;
      if (typeof aoResponder === 'function') {
        try {
          aoResponder({
            indice: indice,
            pergunta: pergunta,
            resultado: r.certa ? 'certa' : 'errada',
            duracaoMs: Date.now() - inicio,
            erroTipico: r.erroTipico,
          });
        } catch (e) {
          // o registo nunca impede o estudo
        }
      }
      opcoes.forEach(function (o) { o.radio.disabled = true; });
      if (campo) campo.disabled = true;

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
      if (r.resolucao.length) {
        feedback.appendChild(R.criar('p', 'feedback-titulo', 'Resolução'));
        R.passos(feedback, r.resolucao);
      }
      if (r.explicacao) R.paragrafo(feedback, r.explicacao, 'explicacao');

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

  function fim() {
    el.textContent = '';
    const cartao = R.criar('div', 'pergunta resultado');
    cartao.appendChild(R.criar('p', 'pontuacao', 'Acertaste ' + certas + ' de ' + perguntas.length + '.'));
    const repetir = R.criar('button', 'botao botao-principal', 'Repetir');
    repetir.type = 'button';
    repetir.addEventListener('click', function () {
      indice = 0;
      certas = 0;
      novaPergunta(true);
    });
    cartao.appendChild(repetir);
    el.appendChild(cartao);
    repetir.focus();
    if (typeof aoTerminar === 'function') aoTerminar(certas, perguntas.length);
  }

  novaPergunta();
};
