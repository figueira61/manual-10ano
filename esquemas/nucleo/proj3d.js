globalThis.Manual = globalThis.Manual || {};
Manual.nucleo = Manual.nucleo || {};

(function () {
  // Puro: projeção ortográfica. Rotação em z por azimute, depois em x por elevação.
  // Devolve [u, v]: u para a direita, v para cima.
  function projetar([x, y, z], { azimute = 0, elevacao = 0 } = {}) {
    const ca = Math.cos(azimute), sa = Math.sin(azimute);
    const x1 = x * ca - y * sa;
    const y1 = x * sa + y * ca;
    const ce = Math.cos(elevacao), se = Math.sin(elevacao);
    return [x1, y1 * se + z * ce];
  }

  Manual.nucleo.projetar = projetar;
})();
