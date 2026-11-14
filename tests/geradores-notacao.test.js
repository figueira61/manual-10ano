// Notação de pontos: um item usa (a, b) ou (a; b), nunca os dois — incluindo nas formas \left(…\right)
// (p. ex. o ponto médio \left(\dfrac{…}{2}; \dfrac{…}{2}\right)).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregarTudo, extrairFormulas } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
const G = M.geradores;

function textos(v, r = []) {
  if (typeof v === 'string') r.push(v);
  else if (Array.isArray(v)) v.forEach((x) => textos(x, r));
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => textos(v[k], r));
  return r;
}

const LEFT_RIGHT = /\\left\((?:(?!\\right\)).)*\\right\)/g;
// Uma coordenada: número, fração ou raiz, com somas e diferenças (sem letras fora dos comandos).
const COORDENADA = /^[-+\d{},. ]+$/;

// Separadores dos grupos de coordenadas de uma fórmula — (…) sem parênteses lá dentro e \left(…\right):
// ',' (vírgula e espaço) e ';' (ponto e vírgula). Grupos não numéricos (f(x, y), d(A, B)) não contam.
function separadores(f) {
  const r = new Set();
  const grupos = (f.match(LEFT_RIGHT) || []).concat(f.replace(LEFT_RIGHT, ' ').match(/\([^()]*\)/g) || []);
  for (const g of grupos) {
    const corpo = g.replace(/^\\left\(|\\right\)$|^\(|\)$/g, '');
    const partes = corpo.split(/, |;\\ /);
    if (partes.length < 2) continue;
    if (!partes.every((p) => COORDENADA.test(p.replace(/\\(?:dfrac|sqrt)/g, '')))) continue;
    if (/, /.test(corpo)) r.add(',');
    if (/;\\ /.test(corpo)) r.add(';');
  }
  return r;
}

test('separadores(): reconhece as duas notações', () => {
  assert.deepEqual([...separadores('M = (1, 2)')], [',']);
  assert.deepEqual([...separadores('M = (1{,}5;\\ 2)')], [';']);
  assert.deepEqual([...separadores('\\left(\\dfrac{1 + 2}{2}, \\dfrac{3 - 4}{2}\\right)')], [',']);
  assert.deepEqual([...separadores('\\left(\\dfrac{1 + 2}{2};\\ \\dfrac{3 - 4}{2}\\right) = (1{,}5;\\ -0{,}5)')], [';']);
  assert.deepEqual([...separadores('f(x, y) = d(A, B)')], []);
});

test('nenhum item mistura (a, b) e (a; b)', () => {
  const maus = [];
  for (const def of G.todos()) {
    for (const formato of def.formatos) for (const contexto of G.contextosDe(def)) for (const nivel of G.niveisDe(def)) {
      for (let s = 1; s <= 60; s++) {
        const p = G.gerarDe(def, s, { formato, contexto, nivel });
        const usados = new Set();
        for (const t of textos(p)) {
          const formulas = /\$/.test(t) ? extrairFormulas(t).formulas : [t];
          for (const f of formulas) separadores(f).forEach((x) => usados.add(x));
        }
        if (usados.size > 1) maus.push(def.id + ' semente ' + s + ' ' + formato + ' ' + contexto);
      }
    }
  }
  assert.deepEqual(maus.slice(0, 10), []);
});
