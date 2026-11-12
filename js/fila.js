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
    if (!cripto) {
      throw new Error('Manual.uuid: globalThis.crypto não está disponível');
    }
    if (typeof cripto.randomUUID === 'function') return cripto.randomUUID();
    if (typeof cripto.getRandomValues !== 'function') {
      throw new Error('Manual.uuid: crypto sem randomUUID nem getRandomValues');
    }
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

  // Converte o texto guardado numa lista de itens com id único (fica a primeira ocorrência).
  // JSON inválido ou que não é lista devolve lista vazia.
  function analisar(bruto) {
    if (!bruto) return [];
    let lido;
    try {
      lido = JSON.parse(bruto);
    } catch (erro) {
      return [];
    }
    if (!Array.isArray(lido)) return [];
    const vistos = new Set();
    const itens = [];
    for (const i of lido) {
      if (!ehObjeto(i) || typeof i.id !== 'string' || vistos.has(i.id)) continue;
      vistos.add(i.id);
      itens.push(i);
    }
    return itens;
  }

  // Fila de envios pendentes (ex.: tentativas de quiz). Nunca lança erro.
  // Cada operação relê o armazenamento, para que duas abas partilhadas não se apaguem.
  // Se o armazenamento falhar (ausente, a lançar exceções), a fila passa a viver em memória.
  Manual.criarFila = function (armazenamento, chave = CHAVE_PADRAO) {
    let falhou = !armazenamento;
    let memoria = [];

    function ler() {
      if (!falhou) {
        try {
          memoria = analisar(armazenamento.getItem(chave));
        } catch (erro) {
          falhou = true;
        }
      }
      return memoria.slice();
    }

    function guardar(itens) {
      memoria = itens;
      if (falhou) return;
      try {
        armazenamento.setItem(chave, JSON.stringify(itens));
      } catch (erro) {
        falhou = true;
      }
    }

    return {
      // Ignora um item cujo id já está na fila.
      juntar: function (item) {
        if (!ehObjeto(item) || typeof item.id !== 'string') return;
        const itens = ler();
        if (itens.some((i) => i.id === item.id)) return;
        itens.push(item);
        guardar(itens);
      },

      pendentes: function () {
        return ler();
      },

      marcarEnviados: function (ids) {
        const conjunto = new Set(ids);
        guardar(ler().filter((i) => !conjunto.has(i.id)));
      },

      tamanho: function () {
        return ler().length;
      },
    };
  };

  // Envia os pendentes em lotes de 50. `enviar(lote)` devolve os ids aceites.
  // Só os ids aceites saem da fila. Um lote com itens rejeitados não bloqueia os seguintes:
  // os rejeitados ficam pendentes e não são reenviados nesta chamada.
  // Um erro de envio (lança ou rejeita) para a chamada; nada se perde.
  Manual.enviarFila = async function (fila, enviar) {
    const aceitesTotal = new Set();
    const saltados = new Set();
    for (;;) {
      const lote = fila
        .pendentes()
        .filter((i) => !saltados.has(i.id))
        .slice(0, TAMANHO_LOTE);
      if (lote.length === 0) break;
      let aceites;
      try {
        aceites = await enviar(lote);
      } catch (erro) {
        break;
      }
      if (!Array.isArray(aceites)) break;
      const presentes = new Set(lote.map((i) => i.id));
      const validos = [...new Set(aceites)].filter((id) => presentes.has(id));
      if (validos.length > 0) {
        fila.marcarEnviados(validos);
        validos.forEach((id) => aceitesTotal.add(id));
      }
      lote.forEach((i) => {
        if (!validos.includes(i.id)) saltados.add(i.id);
      });
    }
    return { enviados: aceitesTotal.size, restantes: fila.tamanho() };
  };
})();
