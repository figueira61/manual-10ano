globalThis.Manual = globalThis.Manual || {};

// Motor de quiz: parte pura (leitura de números e correção). A montagem no DOM vem depois.
Manual.quiz = Manual.quiz || {};

// Lê um número escrito pelo aluno. NaN se inválido.
// Aceita sinal inicial e um único separador decimal (vírgula ou ponto); espaços são ignorados.
Manual.quiz.lerNumero = function (texto) {
  if (typeof texto !== 'string') return NaN;
  const limpo = texto.replace(/\s/g, '');
  if (!/^[+-]?(\d+[.,]?\d*|[.,]\d+)$/.test(limpo)) return NaN;
  return Number(limpo.replace(',', '.'));
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
    respostaCorreta = String(pergunta.resposta).replace('.', ',');
    if (pergunta.unidade) respostaCorreta += ' ' + pergunta.unidade;
    const x = Manual.quiz.lerNumero(resposta);
    valida = !Number.isNaN(x);
    certa = valida && Math.abs(x - pergunta.resposta) <= tolerancia;
  }

  return { valida, certa, respostaCorreta, resolucao, explicacao };
};
