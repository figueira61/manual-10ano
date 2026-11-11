globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  const CHAVE_ARMAZENAMENTO = 'manual10.progresso.v1';

  function estadoVazio() {
    return { lidos: {}, quizzes: {} };
  }

  function ehObjeto(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  // Lê o estado guardado. Qualquer falha (armazenamento ausente, lançar exceções, JSON inválido)
  // devolve um estado vazio.
  function lerEstado(armazenamento) {
    if (!armazenamento) return estadoVazio();
    try {
      const bruto = armazenamento.getItem(CHAVE_ARMAZENAMENTO);
      if (!bruto) return estadoVazio();
      const lido = JSON.parse(bruto);
      if (!ehObjeto(lido)) return estadoVazio();
      return {
        lidos: ehObjeto(lido.lidos) ? lido.lidos : {},
        quizzes: ehObjeto(lido.quizzes) ? lido.quizzes : {},
      };
    } catch (erro) {
      return estadoVazio();
    }
  }

  // Progresso do aluno. Chave: "<disciplina>/<tema>/<subtema>".
  // Nunca lança erro: se o armazenamento falhar, o estado fica só em memória.
  Manual.criarProgresso = function (armazenamento) {
    const estado = lerEstado(armazenamento);

    function guardar() {
      if (!armazenamento) return;
      try {
        armazenamento.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estado));
      } catch (erro) {
        // Sem persistência: mantém-se o estado em memória.
      }
    }

    return {
      marcarLido: function (chave) {
        estado.lidos[chave] = true;
        guardar();
      },

      lido: function (chave) {
        return estado.lidos[chave] === true;
      },

      // Guarda o resultado só se a proporção certas/total for superior à anterior.
      registarQuiz: function (chave, certas, total) {
        if (!Number.isInteger(total) || total <= 0) return;
        if (!Number.isInteger(certas) || certas < 0 || certas > total) return;
        const anterior = estado.quizzes[chave];
        if (anterior && certas * anterior.total <= anterior.certas * total) return;
        estado.quizzes[chave] = { certas: certas, total: total };
        guardar();
      },

      melhorQuiz: function (chave) {
        const melhor = estado.quizzes[chave];
        return melhor ? { certas: melhor.certas, total: melhor.total } : null;
      },
    };
  };
})();
