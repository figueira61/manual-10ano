globalThis.Manual = globalThis.Manual || {};

(function () {
  const Manual = globalThis.Manual;

  const CHAVE_PADRAO = 'manual10.fila.v1';
  const TAMANHO_LOTE = 50;

  function ehObjeto(x) {
    return x !== null && typeof x === 'object' && !Array.isArray(x);
  }

  // Identificador v4. Usa crypto.randomUUID quando existe; senão, getRandomValues.
  Manual.uuid = function () {
    const cripto = globalThis.crypto;
    if (typeof cripto.randomUUID === 'function') return cripto.randomUUID();
    const bytes = new Uint8Array(16);
    cripto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return (
      hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' +
      hex.slice(16, 20) + '-' + hex.slice(20)
    );
  };

  // Lê a fila guardada. Qualquer falha devolve uma fila vazia.
  function lerItens(armazenamento, chave) {
    if (!armazenamento) return [];
    try {
      const bruto = armazenamento.getItem(chave);
      if (!bruto) return [];
      const lido = JSON.parse(bruto);
      if (!Array.isArray(lido)) return [];
      return lido.filter((i) => ehObjeto(i) && typeof i.id === 'string');
    } catch (erro) {
      return [];
    }
  }

  // Fila de envios pendentes (ex.: tentativas de quiz). Nunca lança erro:
  // se o armazenamento falhar, a fila fica só em memória.
  Manual.criarFila = function (armazenamento, chave = CHAVE_PADRAO) {
    const itens = lerItens(armazenamento, chave);

    function guardar() {
      if (!armazenamento) return;
      try {
        armazenamento.setItem(chave, JSON.stringify(itens));
      } catch (erro) {
        // Sem persistência: mantém-se a fila em memória.
      }
    }

    return {
      // Ignora um item cujo id já está na fila.
      juntar: function (item) {
        if (!ehObjeto(item) || typeof item.id !== 'string') return;
        if (itens.some((i) => i.id === item.id)) return;
        itens.push(item);
        guardar();
      },

      pendentes: function () {
        return itens.slice();
      },

      marcarEnviados: function (ids) {
        const conjunto = new Set(ids);
        const restantes = itens.filter((i) => !conjunto.has(i.id));
        itens.length = 0;
        itens.push(...restantes);
        guardar();
      },

      tamanho: function () {
        return itens.length;
      },
    };
  };

  // Envia os pendentes em lotes de 50. `enviar(lote)` devolve os ids aceites.
  // Em erro, ou quando nada é aceite, para: os itens não aceites ficam na fila.
  Manual.enviarFila = async function (fila, enviar) {
    let enviados = 0;
    for (;;) {
      const lote = fila.pendentes().slice(0, TAMANHO_LOTE);
      if (lote.length === 0) break;
      let aceites;
      try {
        aceites = await enviar(lote);
      } catch (erro) {
        break;
      }
      if (!Array.isArray(aceites)) break;
      const presentes = new Set(lote.map((i) => i.id));
      const validos = aceites.filter((id) => presentes.has(id));
      if (validos.length === 0) break;
      fila.marcarEnviados(validos);
      enviados += validos.length;
    }
    return { enviados: enviados, restantes: fila.tamanho() };
  };
})();
