globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  const SEGMENTO = /^[a-z0-9-]+$/;
  const NAO_ENCONTRADO = { vista: 'naoEncontrado' };
  // Nomes de um só segmento que são vistas próprias (não podem ser ids de disciplina).
  const RESERVADOS = ['entrar', 'registar', 'conta', 'privacidade', 'progresso', 'treino', 'teste', 'encarregado'];

  // Converte um hash (#/mat-a/funcoes/quadratica?...) numa rota. Não verifica se a rota existe.
  Manual.router = {
    reservados: RESERVADOS.slice(),

    analisar: function (hash) {
      let texto = String(hash || '');
      if (texto.charAt(0) === '#') texto = texto.slice(1);

      const indice = texto.indexOf('?');
      const parteCaminho = indice === -1 ? texto : texto.slice(0, indice);
      const query = indice === -1 ? '' : texto.slice(indice + 1);

      const segmentos = parteCaminho.replace(/^\/+|\/+$/g, '');
      if (segmentos === '') return { vista: 'inicio' };

      const partes = segmentos.split('/');
      if (partes.length > 3 || !partes.every((p) => SEGMENTO.test(p))) return NAO_ENCONTRADO;

      if (partes[0] === 'pesquisa') {
        if (partes.length !== 1) return NAO_ENCONTRADO;
        const termo = new URLSearchParams(query).get('q') || '';
        return { vista: 'pesquisa', termo: termo };
      }

      if (partes.length === 1 && RESERVADOS.indexOf(partes[0]) !== -1) return { vista: partes[0] };

      const [disciplina, segundo, terceiro] = partes;
      if (partes.length === 1) return { vista: 'disciplina', disciplina: disciplina };
      if (segundo === 'resumos') {
        return partes.length === 2
          ? { vista: 'resumos', disciplina: disciplina }
          : NAO_ENCONTRADO;
      }
      if (partes.length === 2) return { vista: 'tema', disciplina: disciplina, tema: segundo };
      return { vista: 'subtema', disciplina: disciplina, tema: segundo, subtema: terceiro };
    },

    // Inverso de analisar: rota -> hash canónico.
    caminho: function (rota) {
      switch (rota.vista) {
        case 'disciplina':
          return '#/' + rota.disciplina;
        case 'resumos':
          return '#/' + rota.disciplina + '/resumos';
        case 'tema':
          return '#/' + rota.disciplina + '/' + rota.tema;
        case 'subtema':
          return '#/' + rota.disciplina + '/' + rota.tema + '/' + rota.subtema;
        case 'pesquisa':
          return '#/pesquisa?q=' + encodeURIComponent(rota.termo || '');
        default:
          if (RESERVADOS.indexOf(rota.vista) !== -1) return '#/' + rota.vista;
          return '#/';
      }
    },
  };
})();
