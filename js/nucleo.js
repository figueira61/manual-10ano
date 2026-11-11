globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  // Índice: disciplinas → temas → subtemas.
  Manual.indice = [];
  Manual.registarIndice = function (disciplinas) {
    Manual.indice = disciplinas;
  };

  // Temas por disciplina: { [disciplinaId]: { [temaId]: tema } }.
  const temas = {};
  Manual.registarTema = function (disciplinaId, tema) {
    const porDisciplina = temas[disciplinaId] || (temas[disciplinaId] = {});
    if (porDisciplina[tema.id]) {
      throw new Error('Tema duplicado: ' + disciplinaId + '/' + tema.id);
    }
    porDisciplina[tema.id] = tema;
  };
  Manual.obterTema = function (disciplinaId, temaId) {
    const porDisciplina = temas[disciplinaId];
    return porDisciplina ? porDisciplina[temaId] : undefined;
  };

  // Esquemas interativos registados por id.
  const esquemas = {};
  Manual.esquemas = {
    registar: function (id, def) {
      if (esquemas[id]) {
        throw new Error('Esquema duplicado: ' + id);
      }
      esquemas[id] = def;
    },
    obter: function (id) {
      return esquemas[id];
    },
  };

  // Só browser: injeta um <script>. Cache por src; falha permite nova tentativa.
  const carregados = {};
  Manual.carregarScript = function (src) {
    if (!carregados[src]) {
      carregados[src] = new Promise(function (resolve, reject) {
        const el = document.createElement('script');
        el.src = src;
        el.onload = function () {
          resolve();
        };
        el.onerror = function () {
          delete carregados[src];
          reject(new Error('Falha ao carregar ' + src));
        };
        document.head.appendChild(el);
      });
    }
    return carregados[src];
  };

  Manual.ficheiroTema = function (disciplinaId, temaId) {
    return 'conteudos/' + disciplinaId + '/' + temaId + '.js';
  };
  Manual.ficheiroEsquema = function (disciplinaId, id) {
    return 'esquemas/' + disciplinaId + '/' + id + '.js';
  };
})();
