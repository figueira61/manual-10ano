globalThis.Manual = globalThis.Manual || {};
Manual.calc = Manual.calc || {};

Manual.calc.geometria = (function () {
  const EPS = 1e-9;

  const subtrair = (u, v) => u.map((x, i) => x - v[i]);
  const somar = (u, v) => u.map((x, i) => x + v[i]);
  const escalar = (k, u) => u.map((x) => k * x);
  const vetor = (A, B) => subtrair(B, A);
  const norma = (u) => Math.sqrt(u.reduce((s, x) => s + x * x, 0));
  const distancia = (A, B) => norma(vetor(A, B));
  const pontoMedio = (A, B) => A.map((x, i) => (x + B[i]) / 2);
  const pontoMaisVetor = (P, v) => somar(P, v);
  const retaVetorial = (P, v, lambda) => somar(P, escalar(lambda, v));

  // Norma do produto vetorial (em 2D, o módulo do determinante).
  function normaCruzado(u, v) {
    if (u.length < 3) return Math.abs(u[0] * v[1] - u[1] * v[0]);
    const cx = u[1] * v[2] - u[2] * v[1];
    const cy = u[2] * v[0] - u[0] * v[2];
    const cz = u[0] * v[1] - u[1] * v[0];
    return Math.sqrt(cx * cx + cy * cy + cz * cz);
  }

  const colineares = (u, v) => normaCruzado(u, v) < EPS;

  function equacaoReduzida(P, v) {
    if (norma(v) < EPS) return null;
    if (Math.abs(v[0]) < EPS) return { vertical: P[0] };
    const m = v[1] / v[0];
    return { m, b: P[1] - m * P[0] };
  }

  // Mediatriz de [AB]: ax + by = c (a, b = componentes de AB).
  function mediatriz(A, B) {
    const a = B[0] - A[0];
    const b = B[1] - A[1];
    const M = pontoMedio(A, B);
    return { a, b, c: a * M[0] + b * M[1] };
  }

  const area = (A, B, C) => normaCruzado(vetor(A, B), vetor(A, C)) / 2;
  const degenerado = (A, B, C) => area(A, B, C) < EPS;

  function baricentro(A, B, C) {
    if (degenerado(A, B, C)) return null;
    return A.map((x, i) => (x + B[i] + C[i]) / 3);
  }

  function circuncentro(A, B, C) {
    if (degenerado(A, B, C)) return null;
    const b = vetor(A, B);
    const c = vetor(A, C);
    const d = 2 * (b[0] * c[1] - b[1] * c[0]);
    const b2 = b[0] * b[0] + b[1] * b[1];
    const c2 = c[0] * c[0] + c[1] * c[1];
    const ux = (c[1] * b2 - b[1] * c2) / d;
    const uy = (b[0] * c2 - c[0] * b2) / d;
    const centro = [A[0] + ux, A[1] + uy];
    return { centro, raio: Math.sqrt(ux * ux + uy * uy) };
  }

  function incentro(A, B, C) {
    if (degenerado(A, B, C)) return null;
    const a = distancia(B, C);
    const b = distancia(C, A);
    const c = distancia(A, B);
    const p = a + b + c;
    const centro = [
      (a * A[0] + b * B[0] + c * C[0]) / p,
      (a * A[1] + b * B[1] + c * C[1]) / p,
    ];
    return { centro, raio: (2 * area(A, B, C)) / p };
  }

  // H = A + B + C - 2O
  function ortocentro(A, B, C) {
    const o = circuncentro(A, B, C);
    if (!o) return null;
    return [A[0] + B[0] + C[0] - 2 * o.centro[0], A[1] + B[1] + C[1] - 2 * o.centro[1]];
  }

  function circunferenciaNovePontos(A, B, C) {
    const o = circuncentro(A, B, C);
    if (!o) return null;
    const h = ortocentro(A, B, C);
    return { centro: pontoMedio(o.centro, h), raio: o.raio / 2 };
  }

  return {
    distancia, pontoMedio, vetor, somar, subtrair, escalar, norma, colineares,
    pontoMaisVetor, retaVetorial, equacaoReduzida, mediatriz, baricentro,
    circuncentro, incentro, ortocentro, circunferenciaNovePontos, degenerado,
  };
})();
