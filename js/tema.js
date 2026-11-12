globalThis.Manual = globalThis.Manual || {};

// Tema claro/escuro. Sem preferência guardada, segue o sistema (CSS).
(function () {
  const Manual = globalThis.Manual;
  const CHAVE = 'manual10.tema';

  function lerGuardado() {
    try {
      const v = window.localStorage.getItem(CHAVE);
      return v === 'claro' ? 'light' : v === 'escuro' ? 'dark' : null;
    } catch (erro) {
      return null;
    }
  }

  function guardar(tema) {
    try {
      window.localStorage.setItem(CHAVE, tema === 'dark' ? 'escuro' : 'claro');
    } catch (erro) {
      // sem persistência
    }
  }

  function efetivo() {
    const definido = document.documentElement.dataset.theme;
    if (definido) return definido;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  Manual.tema = {
    aplicar: function (tema) {
      document.documentElement.dataset.theme = tema;
    },
    // Liga o botão: aplica a preferência guardada e alterna ao clicar.
    ligar: function (botao) {
      const guardado = lerGuardado();
      if (guardado) Manual.tema.aplicar(guardado);
      function atualizar() {
        const escuro = efetivo() === 'dark';
        botao.textContent = escuro ? '☀ Claro' : '☾ Escuro';
        botao.setAttribute('aria-label', escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
      }
      botao.addEventListener('click', function () {
        const novo = efetivo() === 'dark' ? 'light' : 'dark';
        Manual.tema.aplicar(novo);
        guardar(novo);
        atualizar();
      });
      atualizar();
      if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.addEventListener) mq.addEventListener('change', atualizar);
      }
    },
  };
})();
