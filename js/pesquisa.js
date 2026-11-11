globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  // Minúsculas e sem acentos, para comparar "parábola" com "PARABOLA".
  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }

  // Procura subtemas por título e palavras-chave nas disciplinas disponíveis.
  Manual.pesquisa = {
    procurar: function (indice, termo) {
      const alvo = normalizar(termo);
      if (alvo.length < 2) return [];

      const resultados = [];
      (indice || []).forEach(function (disciplina) {
        if (!disciplina.disponivel) return;
        (disciplina.temas || []).forEach(function (tema) {
          (tema.subtemas || []).forEach(function (subtema) {
            const encontra =
              normalizar(subtema.titulo).includes(alvo) ||
              (subtema.palavras || []).some((p) => normalizar(p).includes(alvo));
            if (!encontra) return;
            resultados.push({
              disciplina: disciplina.id,
              tema: tema.id,
              subtema: subtema.id,
              titulo: subtema.titulo,
              caminho: Manual.router.caminho({
                vista: 'subtema',
                disciplina: disciplina.id,
                tema: tema.id,
                subtema: subtema.id,
              }),
            });
          });
        });
      });
      return resultados;
    },
  };
})();
