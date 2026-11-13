// Geradores de Matemática A — Geometria sintética (js/geradores/mat-a/geometria-sintetica.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-geometria.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/geometria-sintetica.js',
];
const IDS = [
  'incentro-circuncentro-circuncentro-retangulo', 'incentro-circuncentro-raio-inscrito', 'incentro-circuncentro-qual-ponto',
  'ortocentro-baricentro-baricentro', 'ortocentro-baricentro-dois-tercos', 'ortocentro-baricentro-ortocentro-retangulo',
  'euler-nove-pontos-centro-nove-pontos', 'euler-nove-pontos-raio-nove-pontos', 'euler-nove-pontos-razao-euler',
];

let M, G, verificar;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
  const harness = path.join(__dirname, '..', 'tools', 'verificar-geradores.js');
  delete require.cache[harness];
  verificar = require(harness).verificar;
});

// Aritmética própria do teste (exata: coordenadas inteiras ou meios).
const menos = (P, Q) => [P[0] - Q[0], P[1] - Q[1]];
const escalar = (u, v) => u[0] * v[0] + u[1] * v[1];
const d2 = (P, Q) => escalar(menos(P, Q), menos(P, Q));
const proximo = (a, b) => Math.abs(a - b) < 1e-9;
const iguais = (P, Q) => proximo(P[0], Q[0]) && proximo(P[1], Q[1]);
// "$(3{,}5;\ -2)$" → [3.5, -2]
function lerPonto(t) {
  const s = String(t).replace(/\$/g, '').replace(/\\ /g, '').replace(/\{,\}/g, '.').replace(/\s/g, '');
  const m = s.match(/^\((-?[\d.]+)[,;](-?[\d.]+)\)$/);
  assert.ok(m, 'opção não é um ponto: ' + t);
  return [Number(m[1]), Number(m[2])];
}
const lerNumero = (t) => Number(String(t).replace(/\$/g, '').replace('{,}', '.').replace(' cm', ''));
// Vértice do ângulo reto (recíproco de Pitágoras), ou -1.
function verticeReto(vs) {
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3, k = (i + 2) % 3;
    if (proximo(d2(vs[i], vs[j]) + d2(vs[i], vs[k]), d2(vs[j], vs[k]))) return i;
  }
  return -1;
}
// Ortocentro conferido por perpendicularidade: (H − A)·(C − B) = 0 e (H − B)·(C − A) = 0.
const ehOrtocentro = (H, [A, B, C]) => proximo(escalar(menos(H, A), menos(C, B)), 0) && proximo(escalar(menos(H, B), menos(C, A)), 0);
// Circuncentro conferido por distâncias iguais aos três vértices.
const ehCircuncentro = (O, [A, B, C]) => proximo(d2(O, A), d2(O, B)) && proximo(d2(O, B), d2(O, C));
const erro = (p, codigo) => p.errosTipicos.find((e) => e.codigo === codigo);

test('regista os 9 geradores de geometria sintética, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'geometria-sintetica').map((d) => d.id);
  assert.deepEqual(ids, IDS);
  for (const id of IDS) {
    const d = G.obter(id);
    assert.equal(d.disciplina, 'mat-a');
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, id);
  }
});

for (const id of IDS) {
  test(id + ' passa a verificação (200 sementes)', () => {
    assert.deepEqual(verificar(G.obter(id), { sementes: 200 }), []);
  });
}

// Snapshots pequenos (semente 7), conferidos à mão.
test('snapshot: circuncentro-retangulo (coordenadas), semente 7', () => {
  const p = G.gerar('incentro-circuncentro-circuncentro-retangulo', 7, { formato: 'escolha', contexto: 'coordenadas' });
  assert.deepEqual(p.dados.vertices, [[4, 5], [2, -1], [2, 5]]);
  // Ângulo reto em C: AC² + BC² = 4 + 36 = 40 = AB²; O = ponto médio de [AB] = (3, 2).
  assert.equal(p.opcoes[p.correta], '$(3, 2)$');
  assert.equal(p.esquema.id, 'pontos-notaveis');
});

test('snapshot: raio-nove-pontos (retangulo), semente 7', () => {
  const p = G.gerar('euler-nove-pontos-raio-nove-pontos', 7, { formato: 'numerica', contexto: 'retangulo' });
  assert.deepEqual(p.dados.catetos, [4, 3]);
  assert.equal(p.resposta, 1.25); // c = 5, R = 2,5, r_N = 1,25
});

test('snapshot: centro-nove-pontos (OG), semente 7', () => {
  const p = G.gerar('euler-nove-pontos-centro-nove-pontos', 7, { formato: 'numerica', contexto: 'OG' });
  assert.match(p.enunciado, /\$O\(4, 3\)\$ e o baricentro é \$G\(5, 3\)\$/);
  assert.equal(p.resposta, 5.5); // H = O + 3·OG = (7, 3), N = (5,5; 3)
});

test('snapshot: dois-tercos (AM), semente 7', () => {
  const p = G.gerar('ortocentro-baricentro-dois-tercos', 7, { formato: 'numerica', contexto: 'AM' });
  assert.equal(p.dados.dado, 4);
  assert.equal(p.resposta, 6); // AM = 3/2 × 4
});

test('pontos notáveis exatos e conferidos por outro método (distâncias, perpendicularidade, média, reta de Euler)', () => {
  for (let s = 1; s <= 150; s++) {
    for (const contexto of ['coordenadas']) {
      const p = G.gerar('incentro-circuncentro-circuncentro-retangulo', s, { formato: 'escolha', contexto });
      assert.ok(ehCircuncentro(lerPonto(p.opcoes[p.correta]), p.dados.vertices), 'circuncentro ' + s);
    }
    for (const contexto of ['eixos', 'obliquo']) {
      const p = G.gerar('ortocentro-baricentro-ortocentro-retangulo', s, { formato: 'escolha', contexto });
      assert.ok(ehOrtocentro(lerPonto(p.opcoes[p.correta]), p.dados.vertices), 'ortocentro ' + s);
    }
    for (const contexto of ['vertices', 'mediana']) {
      const p = G.gerar('ortocentro-baricentro-baricentro', s, { formato: 'escolha', contexto });
      const [A, B, C] = p.dados.vertices;
      const Gp = lerPonto(p.opcoes[p.correta]);
      assert.ok(iguais([3 * Gp[0], 3 * Gp[1]], [A[0] + B[0] + C[0], A[1] + B[1] + C[1]]), 'baricentro ' + s);
    }
    for (const contexto of ['OH', 'OG']) {
      const p = G.gerar('euler-nove-pontos-centro-nove-pontos', s, { formato: 'escolha', contexto });
      const vs = p.dados.vertices;
      const N = lerPonto(p.opcoes[p.correta]);
      const [O, H] = p.enunciado.match(/\$[OHG]\([^$]*\)\$/g).map((t) => lerPonto(t.replace(/^\$[OHG]/, '$')));
      assert.ok(ehCircuncentro(O, vs), 'O ' + s);
      const S = [vs[0][0] + vs[1][0] + vs[2][0], vs[0][1] + vs[1][1] + vs[2][1]];
      if (contexto === 'OH') {
        assert.ok(ehOrtocentro(H, vs), 'H ' + s);
        assert.ok(iguais(N, [(O[0] + H[0]) / 2, (O[1] + H[1]) / 2]), 'N ' + s);
      } else {
        assert.ok(iguais([3 * H[0], 3 * H[1]], S), 'G ' + s); // aqui o segundo ponto dado é G
      }
      // Os pontos médios dos lados estão todos à mesma distância de N.
      const Ms = [[1, 2], [0, 2], [0, 1]].map(([i, j]) => [(vs[i][0] + vs[j][0]) / 2, (vs[i][1] + vs[j][1]) / 2]);
      assert.ok(proximo(d2(N, Ms[0]), d2(N, Ms[1])) && proximo(d2(N, Ms[1]), d2(N, Ms[2])), 'nove pontos ' + s);
    }
    {
      const p = G.gerar('euler-nove-pontos-razao-euler', s, { formato: 'escolha', contexto: 'coordenadas' });
      const vs = p.dados.vertices;
      const H = lerPonto(p.opcoes[p.correta]);
      const [O, Gp] = p.enunciado.match(/\$[OG]\([^$]*\)\$/g).map((t) => lerPonto(t.replace(/^\$[OG]/, '$')));
      assert.ok(ehCircuncentro(O, vs) && ehOrtocentro(H, vs), 'O, H ' + s);
      assert.ok(iguais([3 * Gp[0], 3 * Gp[1]], [vs[0][0] + vs[1][0] + vs[2][0], vs[0][1] + vs[1][1] + vs[2][1]]), 'G ' + s);
      // O, G, H alinhados com GH = 2·OG (vetorialmente).
      assert.ok(iguais(menos(H, Gp), [2 * (Gp[0] - O[0]), 2 * (Gp[1] - O[1])]), 'Euler ' + s);
    }
  }
});

test('raio dos nove pontos é metade do raio da circunscrita (coordenadas)', () => {
  for (let s = 1; s <= 100; s++) {
    const p = G.gerar('euler-nove-pontos-raio-nove-pontos', s, { formato: 'numerica', contexto: 'coordenadas' });
    const vs = p.dados.vertices;
    const O = lerPonto(p.enunciado.match(/\$O\([^$]*\)\$/)[0].replace(/^\$O/, '$'));
    assert.ok(ehCircuncentro(O, vs));
    assert.ok(Math.abs(p.resposta - Math.sqrt(d2(O, vs[0])) / 2) <= 0.005 + 1e-9, 'semente ' + s);
    if (!Number.isInteger(Math.sqrt(d2(O, vs[0])) * 50)) assert.equal(p.arredondamento, 'às centésimas');
  }
});

test('circuncentro (coordenadas): cada opção errada é o ponto que o erro descreve', () => {
  for (let s = 1; s <= 100; s++) {
    const p = G.gerar('incentro-circuncentro-circuncentro-retangulo', s, { formato: 'escolha', contexto: 'coordenadas' });
    const vs = p.dados.vertices;
    const iV = verticeReto(vs);
    assert.ok(iV >= 0);
    const [U, W] = vs.filter((_, i) => i !== iV);
    for (const e of p.errosTipicos) {
      const P = lerPonto(p.opcoes[e.opcao]);
      if (e.codigo === 'vertice_angulo_reto') assert.ok(iguais(P, vs[iV]), s + '');
      if (e.codigo === 'nao_dividiu_por_2') assert.ok(iguais(P, [U[0] + W[0], U[1] + W[1]]), s + '');
      if (e.codigo === 'baricentro') assert.ok(iguais([3 * P[0], 3 * P[1]], [vs[0][0] + vs[1][0] + vs[2][0], vs[0][1] + vs[1][1] + vs[2][1]]), s + '');
      if (e.codigo === 'ponto_medio_cateto' || e.codigo === 'ponto_medio_outro_cateto') {
        // Ponto médio de um lado com extremo no vértice do ângulo reto (um cateto).
        assert.ok([U, W].some((X) => iguais(P, [(X[0] + vs[iV][0]) / 2, (X[1] + vs[iV][1]) / 2])), s + '');
      }
    }
  }
});

test('circuncentro (raio): erros com catetos só quando os catetos são inteiros, com os números do item', () => {
  let vistos = 0;
  for (let s = 1; s <= 200; s++) {
    const p = G.gerar('incentro-circuncentro-circuncentro-retangulo', s, { formato: 'numerica', contexto: 'raio' });
    const vs = p.dados.vertices;
    const iV = verticeReto(vs);
    const [U, W] = vs.filter((_, i) => i !== iV);
    const a = Math.sqrt(d2(vs[iV], U)), b = Math.sqrt(d2(vs[iV], W)), c = Math.sqrt(d2(U, W));
    assert.equal(p.resposta, c / 2);
    const inteiros = Number.isInteger(a) && Number.isInteger(b);
    for (const codigo of ['metade_cateto', 'soma_catetos', 'raio_inscrito']) {
      const e = erro(p, codigo);
      if (!inteiros) assert.equal(e, undefined, codigo + ' com catetos irracionais, semente ' + s);
    }
    const sc = erro(p, 'soma_catetos');
    if (sc) {
      vistos++;
      assert.equal(sc.valor, (a + b) / 2);
      assert.ok(sc.explicacao.includes(String(a + b).replace('.', ',')), sc.explicacao);
    }
  }
  assert.ok(vistos > 20, 'soma_catetos em ' + vistos + ' itens');
});

test('raio inscrito: «raio circunscrito» só em triângulos retângulos e «baricentro» = altura/3', () => {
  for (const contexto of ['coordenadas', 'lados']) {
    for (let s = 1; s <= 150; s++) {
      const p = G.gerar('incentro-circuncentro-raio-inscrito', s, { formato: 'numerica', contexto });
      const l = p.dados.lados.slice().sort((x, y) => x - y);
      const reto = proximo(l[0] * l[0] + l[1] * l[1], l[2] * l[2]);
      const rc = erro(p, 'raio_circunscrito');
      if (rc) {
        assert.ok(reto, 'raio_circunscrito num triângulo não retângulo, semente ' + s);
        assert.equal(rc.valor, l[2] / 2);
      }
      const b = erro(p, 'distancia_do_baricentro');
      if (b) {
        assert.ok(proximo(b.valor, p.dados.altura / 3));
        assert.ok(b.explicacao.includes('\\dfrac{' + p.dados.altura + '}{3}'), b.explicacao);
      }
      // r = 2A/P com os números do item.
      const P = l[0] + l[1] + l[2];
      assert.ok(proximo(p.resposta, (p.dados.base * p.dados.altura) / P));
    }
  }
});

test('ortocentro: «ângulo reto errado» aponta um vértice onde Pitágoras falha, com as somas certas', () => {
  for (const contexto of ['eixos', 'obliquo']) {
    for (let s = 1; s <= 100; s++) {
      const p = G.gerar('ortocentro-baricentro-ortocentro-retangulo', s, { formato: 'escolha', contexto });
      const vs = p.dados.vertices;
      for (const codigo of ['angulo_reto_errado', 'outro_angulo_reto_errado']) {
        const e = erro(p, codigo);
        if (!e) continue;
        const P = lerPonto(p.opcoes[e.opcao]);
        const i = vs.findIndex((X) => iguais(X, P));
        assert.ok(i >= 0 && i !== verticeReto(vs), s + '');
        const j = (i + 1) % 3, k = (i + 2) % 3;
        assert.ok(e.explicacao.includes('= ' + (d2(vs[i], vs[j]) + d2(vs[i], vs[k])) + '$'), e.explicacao);
        assert.ok(e.explicacao.includes('= ' + d2(vs[j], vs[k]) + '$'), e.explicacao);
      }
    }
  }
});

test('escolha: cada opção errada tem um código próprio; comprimentos sempre positivos', () => {
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('escolha')) continue;
    for (const contexto of G.contextosDe(d)) {
      for (let s = 1; s <= 30; s++) {
        const p = G.gerar(id, s, { formato: 'escolha', contexto });
        const codigos = p.errosTipicos.map((e) => e.codigo);
        assert.equal(new Set(codigos).size, codigos.length, id + ' ' + contexto + ' ' + s);
        for (const o of p.opcoes) {
          if (/^\$-?[\d{},]+\$( cm)?$/.test(o)) assert.ok(lerNumero(o) > 0, id + ': ' + o);
        }
      }
    }
  }
});

test('sem frases com dois «dois pontos» nas explicações e passos', () => {
  const semFormulas = (t) => String(t).replace(/\$\$[\s\S]*?\$\$/g, 'F').replace(/\$[^$]*\$/g, 'F');
  for (const id of IDS) {
    const d = G.obter(id);
    for (const formato of d.formatos) {
      for (const contexto of G.contextosDe(d)) {
        for (let s = 1; s <= 20; s++) {
          const p = G.gerar(id, s, { formato, contexto });
          const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.passo]);
          for (const t of textos) {
            for (const frase of semFormulas(t).split(/(?<=[.?!])\s+/)) {
              assert.ok((frase.match(/:\s/g) || []).length < 2, id + ': ' + frase);
            }
          }
        }
      }
    }
  }
});
