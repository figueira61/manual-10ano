// Geradores de Matemática A — Geometria analítica (js/geradores/mat-a/geometria-analitica.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-geometria.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/geometria-analitica.js',
];
const IDS = [
  'plano-referencial-distancia', 'plano-referencial-ponto-medio', 'plano-referencial-simetrico',
  'plano-condicoes-equacao-circunferencia', 'plano-condicoes-pertence', 'plano-condicoes-reta-paralela-eixo',
  'espaco-distancia-3d', 'espaco-esfera-centro-raio', 'espaco-plano-paralelo',
  'vetores-coordenadas-ab', 'vetores-norma', 'vetores-colinear-k',
  'reta-vetorial-ponto-lambda', 'reta-vetorial-pertence-reta', 'reta-vetorial-declive-vetor',
];

let M, G;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
});

// Aritmética e leitura próprias do teste (independentes do gerador).
const proximo = (a, b) => Math.abs(a - b) < 1e-9;
const menos = (P, Q) => P.map((x, i) => x - Q[i]);
const d2 = (P, Q) => menos(P, Q).reduce((s, x) => s + x * x, 0);
const iguais = (P, Q) => P.length === Q.length && P.every((x, i) => proximo(x, Q[i]));
// "$-\dfrac{3}{2}$" → -1.5; "$2\sqrt{5}$" → 2√5; "$2\sqrt{10} + 1$" → 2√10 + 1; "$7$ km" → 7
function lerNumero(t) {
  const s = String(t).replace(/\$/g, '').replace(/ km$/, '').replace(/\{,\}/g, '.').trim();
  const partes = s.replace(/ - /g, ' + -').split(' + ');
  return partes.reduce((soma, p) => {
    let m = p.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/);
    if (m) return soma + (m[1] ? -1 : 1) * Number(m[2]) / Number(m[3]);
    m = p.match(/^(-?)(\d*)\\sqrt\{(\d+)\}$/);
    if (m) return soma + (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1) * Math.sqrt(Number(m[3]));
    assert.match(p, /^-?\d+(\.\d+)?$/, 'não é número: ' + t);
    return soma + Number(p);
  }, 0);
}
// "$(3{,}5;\ -2)$" → [3.5, -2]; "(1, 2, 3)" → [1, 2, 3]
function lerPonto(t) {
  const s = String(t).replace(/\$/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\s/g, '');
  const m = s.match(/^\((-?[\d.]+(?:[,;]-?[\d.]+)+)\)$/);
  assert.ok(m, 'não é ponto: ' + t);
  return m[1].split(/[,;]/).map(Number);
}
const erro = (p, codigo) => p.errosTipicos.find((e) => e.codigo === codigo);
const certa = (p) => p.opcoes[p.correta];
const amostras = (id, n) => {
  const d = G.obter(id);
  const r = [];
  for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= n; s++) r.push(G.gerar(id, s, { formato, contexto }));
  return r;
};
const textosDoItem = (p) => [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.flatMap((r) => [r.passo, r.porque, r.calculo || '']), [p.verificacao.passo, p.verificacao.calculo], p.errosTipicos.map((e) => e.explicacao));
const formulas = (t) => (String(t).match(/\$[^$]*\$/g) || []).map((f) => f.slice(1, -1)).concat(/\$/.test(t) ? [] : [String(t)]);

test('regista os 15 geradores de geometria analítica, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'geometria-analitica').map((d) => d.id);
  assert.deepEqual(ids, IDS);
  for (const id of IDS) {
    const d = G.obter(id);
    assert.equal(d.disciplina, 'mat-a');
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, id);
  }
});

// A verificação de 200 sementes de cada gerador corre em tests/geradores-todos.test.js.

// Snapshots pequenos (semente 7), conferidos à mão.
test('snapshot: distância (pontos), semente 7', () => {
  const p = G.gerar('plano-referencial-distancia', 7, { formato: 'escolha', contexto: 'pontos' });
  assert.deepEqual([p.dados.A, p.dados.B], [[-3, 1], [0, -3]]);
  // √(3² + 4²) = 5; o ponto médio (−1,5; −1) tem decimais, por isso o item usa ponto e vírgula.
  assert.equal(certa(p), '$5$');
  assert.match(p.enunciado, /\$A\(-3;\\ 1\)\$ e \$B\(0;\\ -3\)\$/);
});

test('snapshot: esfera (desenvolvida), semente 7', () => {
  const p = G.gerar('espaco-esfera-centro-raio', 7, { formato: 'escolha', contexto: 'desenvolvida' });
  assert.match(p.enunciado, /x\^2 \+ y\^2 \+ z\^2 \+ 8x \+ 8y - 8z = -27/);
  // (x + 4)² + (y + 4)² + (z − 4)² = −27 + 48 = 21
  assert.equal(certa(p), '$C(-4, -4, 4)$ e $r = \\sqrt{21}$');
});

test('snapshot: colinear-k (pontos), semente 7', () => {
  const p = G.gerar('vetores-colinear-k', 7, { formato: 'numerica', contexto: 'pontos' });
  assert.deepEqual([p.dados.A, p.dados.B], [[1, 3], [-2, -1]]);
  assert.equal(p.resposta, -8); // AB = (−3, −4), AC = (k − 1, −12) = 3·AB
});

test('distâncias, normas e raios exatos (√n conferida pelos dados)', () => {
  for (const id of ['plano-referencial-distancia', 'espaco-distancia-3d']) {
    for (const p of amostras(id, 80)) {
      const n = d2(p.dados.A, p.dados.B);
      if (p.formato === 'escolha') assert.ok(proximo(lerNumero(certa(p)), Math.sqrt(n)), certa(p));
      else assert.ok(Math.abs(p.resposta - Math.sqrt(n)) <= 0.005 + 1e-9, String(p.resposta));
      if (p.formato === 'numerica' && !Number.isInteger(Math.sqrt(n))) assert.match(p.enunciado, /arredondado às centésimas/);
    }
  }
  for (const p of amostras('vetores-norma', 80)) {
    const d = p.dados;
    const w = d.contexto === 'vetor' ? d.u : d.u.map((x, i) => d.k * x + d.l * d.v[i]);
    const n = w.reduce((s, x) => s + x * x, 0);
    if (p.formato === 'escolha') assert.ok(proximo(lerNumero(certa(p)), Math.sqrt(n)), certa(p));
    else assert.ok(Math.abs(p.resposta - Math.sqrt(n)) <= 0.005 + 1e-9);
  }
  // Esfera: centro e raio conferidos completando o quadrado à mão (a partir do enunciado).
  for (const p of amostras('espaco-esfera-centro-raio', 80)) {
    const d = p.dados;
    let C, rr;
    if (d.contexto === 'reduzida') { C = d.C; rr = d.r2; } else {
      C = d.lin.map((c) => -c / 2);
      rr = d.k + C.reduce((s, c) => s + c * c, 0);
    }
    assert.ok(rr > 0);
    if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - Math.sqrt(rr)) <= 0.005 + 1e-9);
    else {
      const m = certa(p).match(/^\$C(\([^$]*\))\$ e \$r = ([^$]+)\$$/);
      assert.ok(m, certa(p));
      assert.ok(iguais(lerPonto(m[1]), C) && proximo(lerNumero(m[2]), Math.sqrt(rr)), certa(p));
    }
  }
});

test('pertence-reta (vf, plano): a verificação mostra sempre a substituição da abcissa', () => {
  let comZero = 0;
  for (const p of amostras('reta-vetorial-pertence-reta', 200).filter((q) => q.formato === 'vf' && q.dados.contexto === 'plano')) {
    const c = p.verificacao.calculo;
    // Ou uma conta (produto e/ou parcela) ou «x_P = … ⇒ y = …»; nunca só «−13 = y_P».
    assert.match(c, /\\times | [+-] |^-\(|^x_P = -?\d+ \\Rightarrow y = /, c);
    if (p.dados.P[0] === 0) {
      comZero++;
      assert.match(c, /^x_P = 0 \\Rightarrow y = /, c);
      assert.match(p.verificacao.passo, /ordenada na origem/);
    }
  }
  assert.ok(comZero > 0, 'nenhuma amostra com x_P = 0');
});

test('simétrico: a rotação de 90° do distrator é a do sentido positivo (anti-horário)', () => {
  let n = 0;
  for (const p of amostras('plano-referencial-simetrico', 80)) {
    const e = erro(p, 'rodou_90');
    if (!e) continue;
    n++;
    assert.match(e.explicacao, /rotação de \$90°\$ no sentido positivo \(anti-horário\)/);
    if (p.formato === 'escolha') assert.deepEqual(lerPonto(p.opcoes[e.opcao]), [-p.dados.P[1], p.dados.P[0]].map((x) => x + 0));
  }
  assert.ok(n > 0);
});

test('norma: a verificação usa o teorema de Pitágoras (não eleva a norma ao quadrado)', () => {
  for (const p of amostras('vetores-norma', 60)) {
    const v = p.verificacao;
    assert.match(v.passo, /triângulo retângulo|Pitágoras/, v.passo);
    assert.doesNotMatch(v.passo, /elevando a norma ao quadrado/, v.passo);
    // Sem «a ≈ b ≈ b» nem a norma arredondada ao quadrado.
    assert.doesNotMatch(v.calculo, /\\approx [^=]*\\approx/, v.calculo);
    assert.doesNotMatch(v.calculo, /\)\^2 = |\{,\}\d+\^2/, v.calculo);
    const w = p.dados.contexto === 'vetor' ? p.dados.u : p.dados.u.map((x, i) => p.dados.k * x + p.dados.l * p.dados.v[i]);
    const nz = w.filter((x) => x !== 0);
    // Catetos: os valores absolutos das coordenadas (não nulas), sem parênteses de sinal.
    if (nz.length === 2) for (const x of nz) assert.ok(v.calculo.includes(Math.abs(x) + '^2'), v.calculo);
    if (nz.length === 3) assert.match(v.calculo, /d\^2 = .*d\^2 \+ /, v.calculo);
  }
});

test('pontos e vetores exatos (ponto médio, simétrico, AB, ponto + vetor, λ)', () => {
  for (const p of amostras('plano-referencial-ponto-medio', 60).filter((q) => q.formato === 'escolha')) {
    const X = lerPonto(certa(p));
    if (p.dados.contexto === 'medio') assert.ok(iguais(X.map((x) => 2 * x), p.dados.A.map((a, i) => a + p.dados.B[i])));
    else assert.ok(iguais(p.dados.A.map((a, i) => (a + X[i]) / 2), p.dados.M));
  }
  for (const p of amostras('plano-referencial-simetrico', 60).filter((q) => q.formato === 'escolha')) {
    const X = lerPonto(certa(p));
    const P = p.dados.P;
    const Mpp = P.map((x, i) => (x + X[i]) / 2);
    if (p.dados.contexto === 'reta') {
      assert.equal(Mpp[p.dados.i], p.dados.c);
      assert.equal(X[1 - p.dados.i], P[1 - p.dados.i]);
    } else if (p.dados.t === 'O') assert.ok(iguais(Mpp, [0, 0]));
    else {
      const k = p.dados.t === 'Ox' ? 1 : 0; // coordenada que troca de sinal
      assert.equal(Mpp[k], 0);
      assert.equal(X[1 - k], P[1 - k]);
    }
  }
  for (const p of amostras('vetores-coordenadas-ab', 60).filter((q) => q.formato === 'escolha')) {
    const X = lerPonto(certa(p));
    if (p.dados.contexto === 'ponto-mais-vetor') assert.ok(iguais(menos(X, p.dados.A), p.dados.u));
    else assert.ok(iguais(X, menos(p.dados.B, p.dados.A)));
  }
  for (const p of amostras('reta-vetorial-ponto-lambda', 60).filter((q) => q.formato === 'escolha')) {
    const { A, u, l } = p.dados;
    assert.ok(iguais(lerPonto(certa(p)), A.map((a, i) => a + l * u[i])));
  }
});

test('colinearidade, λ e declive exatos', () => {
  for (const p of amostras('vetores-colinear-k', 60)) {
    const k = p.formato === 'numerica' ? p.resposta : lerNumero(certa(p));
    const d = p.dados;
    const [u, w] = d.contexto === 'vetores'
      ? [d.u, d.i === 0 ? [k, d.vj] : [d.vj, k]]
      : [menos(d.B, d.A), menos(d.i === 0 ? [k, d.cj] : [d.cj, k], d.A)];
    assert.ok(proximo(u[0] * w[1], u[1] * w[0]), JSON.stringify([u, w]));
  }
  for (const p of amostras('reta-vetorial-pertence-reta', 60).filter((q) => q.formato === 'numerica')) {
    const { A, u, P } = p.dados;
    assert.ok(iguais(P, A.map((a, i) => a + p.resposta * u[i])));
  }
  for (const p of amostras('reta-vetorial-declive-vetor', 60)) {
    const { A, u } = p.dados;
    const v = p.dados.contexto === 'declive' ? u[1] / u[0] : A[1] - (u[1] / u[0]) * A[0];
    assert.ok(proximo(p.formato === 'numerica' ? p.resposta : lerNumero(certa(p)), v));
  }
});

test('vf: as afirmações falsas são mesmo falsas e as verdadeiras mesmo verdadeiras (aritmética exata)', () => {
  const vistos = new Set();
  for (const p of amostras('plano-condicoes-pertence', 120)) {
    const d = p.dados;
    let pertence;
    if (d.contexto === 'mediatriz') pertence = d2(d.P, d.A) === d2(d.P, d.B);
    else if (d.contexto === 'semiplano') {
      const v = d.m * d.P[0] + d.b;
      pertence = { '<': d.P[1] < v, '>': d.P[1] > v, '<=': d.P[1] <= v, '>=': d.P[1] >= v }[d.op];
    } else pertence = d.op === '<' ? d2(d.P, d.C) < d.r2 : d2(d.P, d.C) <= d.r2;
    assert.equal(pertence, p.correta, p.enunciado);
    if (!p.correta) vistos.add(p.errosTipicos[0].codigo);
  }
  for (const c of ['mediatriz_vertical', 'mediatriz_horizontal', 'fronteira_estrita', 'trocou_o_sentido', 'centro_sinais_trocados', 'comparou_distancia_com_r2']) assert.ok(vistos.has(c), c);
  for (const p of amostras('reta-vetorial-pertence-reta', 120).filter((q) => q.formato === 'vf')) {
    const { A, u, P } = p.dados;
    const w = menos(P, A);
    // AP colinear com u ⇔ todos os produtos cruzados nulos (inteiros).
    const col = [[0, 1], [0, 2], [1, 2]].filter(([i, j]) => j < A.length).every(([i, j]) => w[i] * u[j] === w[j] * u[i]);
    assert.equal(col, p.correta);
  }
});

test('equação da circunferência: os pontos dados verificam a equação certa', () => {
  for (const p of amostras('plano-condicoes-equacao-circunferencia', 80)) {
    const m = certa(p).replace(/\$/g, '').match(/^(x\^2|\(x ([+-]) (\d+)\)\^2) \+ (y\^2|\(y ([+-]) (\d+)\)\^2) = (\d+)$/);
    assert.ok(m, certa(p));
    const C = [m[2] ? (m[2] === '-' ? 1 : -1) * Number(m[3]) : 0, m[5] ? (m[5] === '-' ? 1 : -1) * Number(m[6]) : 0];
    for (const Q of p.dados.dados) assert.equal(d2(Q, C), Number(m[7]));
    if (p.dados.contexto === 'diametro') assert.equal(d2(p.dados.pontos.A, p.dados.pontos.B), 4 * Number(m[7]));
  }
});

test('vetores, declives e normas escritos batem com o rótulo (extremidade menos origem)', () => {
  let n = 0;
  for (const id of IDS) {
    for (const p of amostras(id, 30)) {
      const P = p.dados.pontos || {};
      for (const t of textosDoItem(p)) {
        for (const f of formulas(t)) {
          // \overrightarrow{XY} = (…) ou \overrightarrow{XY} = Y - X = (…) (não «X + \overrightarrow{XY} = X + …»)
          const re = /(?<![A-Z] \+ )\\overrightarrow\{([A-Z])([A-Z])\} = (?:[A-Z] - [A-Z] = )?(\([^()]*\))/g;
          let m;
          while ((m = re.exec(f))) {
            if (!P[m[1]] || !P[m[2]]) continue;
            assert.ok(iguais(lerPonto(m[3]), menos(P[m[2]], P[m[1]])), id + ': ' + m[0]);
            n++;
          }
        }
      }
      if (id === 'vetores-norma' && p.dados.contexto === 'vetor') {
        const s = p.dados.u.reduce((a, x) => a + x * x, 0);
        assert.ok(p.resolucaoDetalhada[0].calculo.includes('\\sqrt{' + s + '}'));
      }
      if (id === 'reta-vetorial-declive-vetor') {
        const { u } = p.dados;
        assert.ok(p.resolucaoDetalhada[0].calculo.startsWith('m = \\dfrac{' + u[1] + '}{' + u[0] + '}'), p.resolucaoDetalhada[0].calculo);
      }
    }
  }
  assert.ok(n > 300, 'vetores conferidos: ' + n);
});

test('explicações de erro mostram o valor da opção', () => {
  // Nos geradores cujas opções são números ou pontos, o texto da opção aparece numa fórmula da explicação.
  const ids = ['plano-referencial-distancia', 'espaco-distancia-3d', 'plano-referencial-ponto-medio', 'plano-referencial-simetrico',
    'plano-condicoes-reta-paralela-eixo', 'espaco-plano-paralelo', 'vetores-coordenadas-ab', 'vetores-norma', 'vetores-colinear-k',
    'reta-vetorial-ponto-lambda', 'reta-vetorial-declive-vetor'];
  let n = 0;
  for (const id of ids) {
    for (const p of amostras(id, 40).filter((q) => q.formato === 'escolha')) {
      for (const e of p.errosTipicos) {
        const op = p.opcoes[e.opcao].replace(/ km$/, '').replace(/^\$|\$$/g, '');
        const fs = formulas(e.explicacao);
        assert.ok(fs.some((f) => f === op || f.endsWith('= ' + op) || f.includes(' = ' + op + ' ') || f.includes(op)), id + ' ' + e.codigo + ': «' + op + '» em ' + e.explicacao);
        n++;
      }
    }
  }
  assert.ok(n > 500, String(n));
  // A distância com o erro de sinal: os números do √ da explicação dão o valor da opção.
  let k = 0;
  for (const p of amostras('plano-referencial-distancia', 120).filter((q) => q.formato === 'escolha')) {
    const e = erro(p, 'sinal_negativo');
    if (!e) continue;
    const m = e.explicacao.match(/obtiveste \$\\sqrt\{([^}]*)\}/);
    assert.ok(m, e.explicacao);
    const soma = m[1].split(' + ').reduce((s, t) => s + Math.pow(Number(t.replace(/[()]/g, '').replace('^2', '')), 2), 0);
    assert.ok(proximo(Math.sqrt(soma), lerNumero(p.opcoes[e.opcao])), e.explicacao);
    k++;
  }
  assert.ok(k > 10, 'sinal_negativo: ' + k);
});

test('uma só notação de pontos por item, sem produto escalar nem coeficiente 1', () => {
  for (const id of IDS) {
    for (const p of amostras(id, 30)) {
      const t = textosDoItem(p).join(' ');
      const virgula = /\(-?\d+(\{,\}\d+)?, -?\d/.test(t);
      const ponto = /\(-?\d+(\{,\}\d+)?;\\ -?\d/.test(t);
      assert.ok(!(virgula && ponto), id + ': notações misturadas: ' + t);
      if (ponto) assert.match(t, /\d\{,\}\d/);
      assert.ok(!/\\cdot|produto escalar|1\\vec|1\\lambda|\\dfrac\{[^}]*\}\{1\}/.test(t), id + ': ' + t);
    }
  }
});

test('esquemas só com valores que cabem nos controlos', () => {
  for (const id of IDS) {
    for (const p of amostras(id, 20)) {
      if (!p.esquema) continue;
      const o = p.esquema.opcoes;
      if (p.esquema.id === 'plano') for (const P of [o.A, o.B]) assert.ok(P[0] >= -3 && P[0] <= 11 && P[1] >= -3 && P[1] <= 11, id);
      else if (p.esquema.id === 'vetores') for (const P of [o.u, o.v]) assert.ok(P.every((x) => Math.abs(x) <= 10), id);
      else {
        assert.equal(p.esquema.id, 'espaco3d');
        assert.ok(o.P.every((x) => Math.abs(x) <= 6) && (!o.v || o.v.every((x) => Math.abs(x) <= 6)) && (!o.raio || o.raio <= 6), id);
      }
    }
  }
});
