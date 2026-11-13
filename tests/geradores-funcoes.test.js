// Geradores de Matemática A — Funções (js/geradores/mat-a/funcoes.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/calculo-geometria.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/funcoes.js',
];
const IDS = [
  'generalidades-imagem', 'generalidades-objeto', 'generalidades-dominio-contradominio',
  'afim-zero', 'afim-declive-dois-pontos', 'afim-sinal-monotonia',
  'quadratica-vertice', 'quadratica-zeros', 'quadratica-contradominio',
  'transformacoes-vertice-transformado', 'transformacoes-expressao', 'transformacoes-efeito-a',
  'equacoes-inequacoes-solucoes', 'equacoes-inequacoes-conjunto-solucao', 'equacoes-inequacoes-numero-solucoes',
  'ramos-modulo-avaliar-ramos', 'ramos-modulo-equacao-modulo', 'ramos-modulo-zero-ramos',
];

let M, G, verificar;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
  const harness = path.join(__dirname, '..', 'tools', 'verificar-geradores.js');
  delete require.cache[harness];
  verificar = require(harness).verificar;
});

const proximo = (a, b) => Math.abs(a - b) < 1e-9;
// "$-\dfrac{3}{2}$" → -1.5; "$7$" → 7; "$12{,}5$ km" → 12.5
function lerNumero(t) {
  const s = String(t).replace(/\$/g, '').replace(/ (km|m|cm|€)$/, '').replace('{,}', '.').trim();
  const f = s.match(/^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/);
  if (f) return (f[1] ? -1 : 1) * Number(f[2]) / Number(f[3]);
  assert.match(s, /^-?\d+(\.\d+)?$/, 'não é número: ' + t);
  return Number(s);
}
const lerConjunto = (t) => {
  const s = String(t).replace(/\$/g, '');
  if (s === '\\emptyset') return [];
  const m = s.match(/^\\\{(.*)\\\}$/);
  assert.ok(m, 'não é conjunto: ' + t);
  return m[1].split(', ').map((x) => lerNumero(x));
};
const lerPonto = (t) => {
  const m = String(t).replace(/\$/g, '').match(/^\((-?\d+), (-?\d+)\)$/);
  assert.ok(m, 'não é ponto: ' + t);
  return [Number(m[1]), Number(m[2])];
};
const erro = (p, codigo) => p.errosTipicos.find((e) => e.codigo === codigo);
const certa = (p) => p.opcoes[p.correta];
const amostras = (id, n, extra = {}) => {
  const d = G.obter(id);
  const r = [];
  for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= n; s++) r.push(G.gerar(id, s, Object.assign({ formato, contexto }, extra)));
  return r;
};
const textosDoItem = (p) => [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.flatMap((r) => [r.passo, r.porque, r.calculo || '']), [p.verificacao.passo, p.verificacao.calculo], p.errosTipicos.map((e) => e.explicacao));

test('regista os 18 geradores de funções, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'funcoes').map((d) => d.id);
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

// ---------------------------------------------------------------- snapshots (semente 3), conferidos à mão
test('snapshot: imagem (expressão), semente 3', () => {
  const p = G.gerar('generalidades-imagem', 3, { formato: 'numerica', contexto: 'expressao' });
  assert.match(p.enunciado, /f\(x\) = 2x\^2 - 5x - 1\$\. Qual é a imagem de \$-4\$/);
  // 2 × 16 + 20 − 1 = 51
  assert.equal(p.resposta, 51);
  assert.equal(erro(p, 'quadrado_sem_parenteses').valor, -13); // −32 + 20 − 1
});

test('snapshot: vértice (forma geral), semente 4', () => {
  const p = G.gerar('quadratica-vertice', 4, { formato: 'escolha', contexto: 'geral' });
  assert.match(p.enunciado, /3x\^2 \+ 12x \+ 8/);
  // h = −12/6 = −2, f(−2) = 12 − 24 + 8 = −4
  assert.equal(certa(p), '$(-2, -4)$');
  assert.deepEqual(p.esquema, { id: 'parabola', opcoes: { a: 3, h: -2, k: -4, mostrarBase: false } });
});

test('snapshot: inequação, semente 8', () => {
  const p = G.gerar('equacoes-inequacoes-conjunto-solucao', 8, { formato: 'escolha', contexto: 'entre-zeros' });
  assert.match(p.enunciado, /-x\^2 - 3x \+ 10 > 0/);
  // zeros −5 e 2, concavidade para baixo: positiva entre os zeros
  assert.equal(certa(p), '$]-5, 2[$');
});

// ---------------------------------------------------------------- correção matemática (aritmética do teste)
test('imagem: resposta e erros correspondem às contas que descrevem', () => {
  for (const p of amostras('generalidades-imagem', 40)) {
    const { a, b, c, x0 } = p.dados;
    const y = a * x0 * x0 + b * x0 + c;
    if (p.formato === 'numerica') assert.equal(p.resposta, y);
    else assert.equal(lerNumero(certa(p)), y);
    const sp = erro(p, 'quadrado_sem_parenteses');
    if (sp) { assert.ok(x0 < 0); if (sp.valor !== undefined) assert.equal(sp.valor, -a * x0 * x0 + b * x0 + c); }
    const pr = erro(p, 'sinal_produto');
    if (pr) assert.ok(b < 0 && x0 < 0, 'sinal_produto só com dois negativos');
    if (p.dados.contexto === 'modelacao' && p.formato === 'escolha') {
      for (const o of p.opcoes) assert.ok(lerNumero(o) > 0, 'altura negativa como opção');
    }
  }
});

test('objeto: a imagem da resposta é a dada', () => {
  for (const p of amostras('generalidades-objeto', 40)) {
    const { m, b, y0 } = p.dados;
    const x = p.formato === 'numerica' ? p.resposta : lerNumero(certa(p));
    assert.ok(proximo(m * x + b, y0));
  }
});

test('domínio/contradomínio: a opção certa é o conjunto das imagens (ou dos objetos)', () => {
  for (const p of amostras('generalidades-dominio-contradominio', 40)) {
    const { D, I, pedeDominio } = p.dados;
    const esperado = [...new Set(pedeDominio ? D : I)].sort((u, v) => u - v);
    assert.deepEqual(lerConjunto(certa(p)), esperado);
  }
});

test('afim: zero anula f; declive reconstrói B; sinal confirmado por pontos', () => {
  for (const p of amostras('afim-zero', 40)) {
    const z = p.formato === 'numerica' ? p.resposta : lerNumero(certa(p));
    assert.ok(proximo(p.dados.m * z + p.dados.b, 0));
  }
  for (const p of amostras('afim-declive-dois-pontos', 40)) {
    const m = p.formato === 'numerica' ? p.resposta : lerNumero(certa(p));
    const [A, B] = [p.dados.A, p.dados.B];
    assert.ok(proximo((B[1] - A[1]) / (B[0] - A[0]), m));
    // O declive escrito na verificação é o mesmo.
    assert.ok(p.verificacao.passo.includes('y = '), p.verificacao.passo);
  }
  for (const p of amostras('afim-sinal-monotonia', 40).filter((q) => q.formato === 'escolha')) {
    const { m, b, sg } = p.dados;
    const t = certa(p).replace(/\$/g, '');
    const g = t.match(/^([\]\[])(.+), (.+)([\]\[])$/);
    assert.ok(g, t);
    const ok = (x) => { const v = m * x + b; return sg === '>' ? v > 0 : sg === '<' ? v < 0 : sg === '>=' ? v >= -1e-12 : v <= 1e-12; };
    const direita = g[3] === '+\\infty';
    const z = lerNumero(direita ? g[2] : g[3]);
    assert.ok(proximo(m * z + b, 0), 'extremo é o zero');
    assert.equal(ok(direita ? z + 1 : z - 1), true);
    assert.equal(ok(direita ? z - 1 : z + 1), false);
    assert.equal(ok(z), direita ? g[1] === '[' : g[4] === ']');
  }
});

test('quadrática: vértice por simetria, zeros por substituição, contradomínio pelo extremo', () => {
  for (const p of amostras('quadratica-vertice', 40).filter((q) => q.formato === 'escolha')) {
    const { a, h, k } = p.dados;
    const f = (x) => a * (x - h) * (x - h) + k;
    const [vx, vy] = lerPonto(certa(p));
    assert.ok(proximo(f(vx - 1), f(vx + 1)) && proximo(f(vx), vy));
    const c = erro(p, 'ordenada_igual_a_c');
    if (c) assert.equal(lerPonto(p.opcoes[c.opcao])[1], a * h * h + k);
  }
  for (const p of amostras('quadratica-zeros', 40).filter((q) => q.formato === 'escolha')) {
    const { a, b, c } = p.dados;
    const S = lerConjunto(certa(p));
    assert.ok(S.length >= 1);
    for (const x of S) assert.ok(proximo(a * x * x + b * x + c, 0), certa(p));
    const e4 = erro(p, 'sinal_de_4ac');
    if (e4) {
      // Erro só quando b² + 4ac dá raízes racionais (ou é negativo): confere-se com as contas do aluno.
      const T = lerConjunto(p.opcoes[e4.opcao]);
      for (const x of T) assert.ok(proximo(a * x * x + b * x - c, 0));
      if (!T.length) assert.ok(b * b + 4 * a * c < 0);
    }
  }
  for (const p of amostras('quadratica-contradominio', 40)) {
    const { a, k } = p.dados;
    assert.equal(certa(p), a > 0 ? '$[' + k + ', +\\infty[$' : '$]-\\infty, ' + k + ']$');
  }
});

test('transformações: vértice de g por pesquisa; expressão passa pelos pontos transformados', () => {
  for (const p of amostras('transformacoes-vertice-transformado', 40).filter((q) => q.formato === 'escolha')) {
    const d = p.dados;
    const V = d.tipo === 'translacao' ? [d.p + d.h, d.q + d.k] : d.tipo === 'vertical' ? [d.p, d.A * d.q + d.k] : [d.p / d.B, d.q + d.k];
    assert.deepEqual(lerPonto(certa(p)), V);
  }
  for (const p of amostras('transformacoes-expressao', 40)) {
    const m = certa(p).replace(/\$/g, '').match(/^g\(x\) = (.*)$/);
    assert.ok(m);
    const { a, h, k } = p.dados;
    // vértice (0, 0) → (h, k) e (1, 1) → (1 + h, a + k)
    assert.ok(m[1].includes(h > 0 ? '(x - ' + h + ')^2' : '(x + ' + -h + ')^2'), m[1]);
    assert.ok(m[1].endsWith(k > 0 ? ' + ' + k : ' - ' + -k), m[1]);
    assert.deepEqual(p.dados.params[certa(p)], [a, h, k]);
  }
});

test('equações: soluções anulam a equação; inequações conferidas por pontos; Δ e contagem', () => {
  for (const p of amostras('equacoes-inequacoes-solucoes', 30).filter((q) => q.formato === 'escolha' && q.dados.contexto === 'equacao')) {
    const { a, b, c } = p.dados;
    for (const x of lerConjunto(certa(p))) assert.ok(proximo(a * x * x + b * x + c, 0));
  }
  for (const p of amostras('equacoes-inequacoes-numero-solucoes', 30)) {
    const { a, b, c } = p.dados;
    const d = b * b - 4 * a * c;
    const n = d > 0 ? 2 : d === 0 ? 1 : 0;
    if (p.formato === 'numerica') assert.equal(p.resposta, n);
    else assert.equal(p.correta, n === p.dados.afirmado);
  }
  for (const p of amostras('equacoes-inequacoes-conjunto-solucao', 30)) {
    const { a, r1, r2, sg } = p.dados;
    const f = (x) => a * (x - r1) * (x - r2);
    const dentro = f((r1 + r2) / 2);
    const quer = sg[0] === '>' ? 1 : -1;
    const t = certa(p);
    if (Math.sign(dentro) === quer) assert.ok(t.startsWith('$' + (sg.length === 2 ? '[' : ']') + r1 + ', ' + r2), t);
    else assert.ok(t.includes('\\cup'), t);
  }
});

test('ramos e módulo: imagem pela condição, soluções a distância d, zeros por pesquisa', () => {
  for (const p of amostras('ramos-modulo-avaliar-ramos', 30).filter((q) => q.dados.contexto === 'abstrato')) {
    const d = p.dados;
    const esq = d.esqInclui ? d.x0 <= d.c : d.x0 < d.c;
    const y = esq ? d.p * d.x0 * d.x0 + d.q : d.b + d.m * d.x0;
    assert.equal(p.formato === 'numerica' ? p.resposta : lerNumero(certa(p)), y);
  }
  for (const p of amostras('ramos-modulo-equacao-modulo', 30).filter((q) => q.formato === 'escolha')) {
    for (const x of lerConjunto(certa(p))) assert.equal(Math.abs(x - p.dados.a), p.dados.d);
  }
  for (const p of amostras('ramos-modulo-zero-ramos', 30).filter((q) => q.formato === 'escolha')) {
    const nao = erro(p, 'nao_verificou_condicao');
    assert.ok(nao, 'há sempre um candidato a rejeitar');
    assert.ok(lerConjunto(p.opcoes[nao.opcao]).length > lerConjunto(certa(p)).length);
  }
});

// ---------------------------------------------------------------- escrita
test('pontos com coordenadas inteiras escritos (a, b), nunca com ponto e vírgula', () => {
  for (const id of IDS) {
    for (const p of amostras(id, 8)) {
      for (const t of textosDoItem(p)) assert.ok(!/\(-?[\d{},]+;\\? /.test(t), id + ': ' + t);
    }
  }
});

test('códigos de erro únicos por item e sem frases com dois «dois pontos»', () => {
  const semFormulas = (t) => String(t).replace(/\$\$[\s\S]*?\$\$/g, 'F').replace(/\$[^$]*\$/g, 'F');
  for (const id of IDS) {
    for (const p of amostras(id, 15)) {
      const codigos = p.errosTipicos.map((e) => e.codigo);
      assert.equal(new Set(codigos).size, codigos.length, id);
      const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.passo]);
      for (const t of textos) {
        for (const frase of semFormulas(t).split(/(?<=[.?!])\s+/)) {
          assert.ok((frase.match(/:\s/g) || []).length < 2, id + ': ' + frase);
        }
      }
    }
  }
});

test('esquemas só com valores que cabem nos controlos', () => {
  for (const id of ['afim-zero', 'quadratica-vertice', 'quadratica-contradominio', 'transformacoes-expressao']) {
    for (const p of amostras(id, 20)) {
      if (!p.esquema) continue;
      const o = p.esquema.opcoes;
      if (p.esquema.id === 'afim') assert.ok(Math.abs(o.m) <= 5 && Math.abs(o.b) <= 10);
      else assert.ok(Math.abs(o.a) <= 3 && Math.abs(o.h) <= 5 && Math.abs(o.k) <= 5);
    }
  }
});
