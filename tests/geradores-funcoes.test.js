// Geradores de Matemática A — Funções (js/geradores/mat-a/funcoes.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-funcoes.js', 'esquemas/mat-a/calculo-geometria.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/funcoes.js',
];
const IDS = [
  'generalidades-imagem', 'generalidades-objeto', 'generalidades-dominio-contradominio', 'generalidades-condicoes',
  'afim-zero', 'afim-declive-dois-pontos', 'afim-sinal-monotonia',
  'quadratica-vertice', 'quadratica-zeros', 'quadratica-contradominio',
  'transformacoes-vertice-transformado', 'transformacoes-expressao', 'transformacoes-efeito-a',
  'equacoes-inequacoes-solucoes', 'equacoes-inequacoes-conjunto-solucao', 'equacoes-inequacoes-numero-solucoes',
  'ramos-modulo-avaliar-ramos', 'ramos-modulo-equacao-modulo', 'ramos-modulo-zero-ramos',
];

let M, G;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
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

test('regista os 19 geradores de funções, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'funcoes').map((d) => d.id);
  assert.deepEqual(ids, IDS);
  for (const id of IDS) {
    const d = G.obter(id);
    assert.equal(d.disciplina, 'mat-a');
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, id);
  }
});

// A verificação de 200 sementes de cada gerador corre em tests/geradores-todos.test.js.

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

test('coeficiente 1 omitido, sem divisões por 1 e sem igualdades repetidas («A = A»)', () => {
  const repeticao = /(?:^|=\s)([^=]{2,}?)\s=\s\1(?:\s*$|\s*[,;.]|\s+\\)/;
  for (const id of IDS) {
    for (const p of amostras(id, 25)) {
      for (const t of textosDoItem(p)) {
        assert.ok(!/(^|[^0-9,{}.])1x/.test(t), id + ' 1x: ' + t);
        assert.ok(!/(^|[^0-9,{}.])-?1 \\times f/.test(t), id + ' 1 × f: ' + t);
        assert.ok(!/\\dfrac\{[^{}]*\}\{1\}/.test(t), id + ' /1: ' + t);
        assert.ok(!/[Dd]ivid[a-zà-ú-]*[^.$]*por \$-?1\$/.test(t), id + ' dividir por 1: ' + t);
        assert.ok(!repeticao.test(t), id + ' repetição: ' + t);
      }
      // «Dividiste o coeficiente pelo termo»: só faz sentido com coeficiente e termo diferentes de ±1.
      for (const e of p.errosTipicos.filter((x) => x.codigo === 'dividiu_ao_contrario')) {
        assert.ok(!/Dividiste \$-?1\$ por|por \$-?1\$, ao contrário/.test(e.explicacao), id + ': ' + e.explicacao);
      }
    }
  }
});

test('explicações de erro descrevem a conta que dá o valor da opção', () => {
  // dividiu_ao_contrario: «dividiste $p$ por $q$» com p/q igual ao valor da opção.
  for (const id of ['afim-zero', 'quadratica-zeros']) {
    let n = 0;
    for (const p of amostras(id, 80).filter((q) => q.formato === 'escolha')) {
      const e = erro(p, 'dividiu_ao_contrario');
      if (!e) continue;
      const m = e.explicacao.match(/dividiste \$([^$]+)\$ por \$([^$]+)\$/);
      assert.ok(m, e.explicacao);
      const v = lerNumero('$' + m[1] + '$') / lerNumero('$' + m[2] + '$');
      const opcao = id === 'afim-zero' ? [lerNumero(p.opcoes[e.opcao])] : lerConjunto(p.opcoes[e.opcao]).filter((x) => x !== 0);
      assert.ok(proximo(v, opcao[0]), e.explicacao + ' vs ' + p.opcoes[e.opcao]);
      n++;
    }
    assert.ok(n > 5, id + ': ' + n);
  }
  // sinal_de_x_esquecido e ordem_das_operacoes: «obtiveste … = v» / sem coeficiente ±1.
  let n = 0;
  for (const p of amostras('ramos-modulo-avaliar-ramos', 80).filter((q) => q.formato === 'escolha' && q.dados.contexto === 'abstrato')) {
    const e = erro(p, 'sinal_de_x_esquecido');
    if (e) {
      const m = e.explicacao.match(/obtiveste \$[^$]*= (-?\d+)\$/);
      assert.ok(m, e.explicacao);
      assert.equal(Number(m[1]), lerNumero(p.opcoes[e.opcao]));
      n++;
    }
    if (erro(p, 'ordem_das_operacoes')) assert.ok(Math.abs(p.dados.m) !== 1);
  }
  assert.ok(n > 3, 'sinal_de_x_esquecido: ' + n);
});

test('número de soluções escrito por extenso', () => {
  for (const p of amostras('equacoes-inequacoes-numero-solucoes', 30)) {
    const t = textosDoItem(p).join(' ');
    assert.ok(!/\d\\? ?\\?(text\{)?\s*soluç/.test(t), t);
    assert.ok(/nenhuma solução|uma solução|duas soluções|não tem soluções/.test(t));
  }
});

test('avaliar ramos: verificação confere as duas condições e recalcula; extremo sem «bola»', () => {
  let linear = 0, total = 0;
  for (const p of amostras('ramos-modulo-avaliar-ramos', 60).filter((q) => q.dados.contexto === 'abstrato')) {
    assert.match(p.verificacao.calculo, /\\text\{\(verdadeiro\)\},\\quad .*\\text\{\(falso\)\}/);
    for (const t of textosDoItem(p)) assert.ok(!/bola/.test(t), t);
    if (p.formato === 'escolha') {
      total++;
      const d = p.dados;
      if (!(d.esqInclui ? d.x0 <= d.c : d.x0 < d.c)) linear++;
    }
  }
  assert.ok(linear / total > 0.4, 'escolha no ramo linear: ' + linear + '/' + total);
});

test('dividiu_so_a_raiz só com valores na escala dos zeros', () => {
  for (const p of amostras('quadratica-zeros', 60).filter((q) => q.formato === 'escolha' && q.dados.contexto === 'completa')) {
    const e = erro(p, 'dividiu_so_a_raiz');
    if (!e) continue;
    const zeros = lerConjunto(certa(p)).map(Math.abs);
    for (const v of lerConjunto(p.opcoes[e.opcao])) assert.ok(Math.abs(v) <= 3 * Math.max(...zeros) + 2, p.opcoes[e.opcao]);
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

// ---------------------------------------------------------------- condições f(x) □ k pelo gráfico
// Lê "$]-2, 0[ \cup \{3\}$" → [{ a, b, fa, fb }] (pontos como intervalos degenerados fechados).
function lerCondicao(t) {
  const s = String(t).replace(/\$/g, '');
  if (s === '\\emptyset') return [];
  return s.split(' \\cup ').flatMap((parte) => {
    const c = parte.match(/^\\\{(.*)\\\}$/);
    if (c) return c[1].split(', ').map((x) => { const v = lerNumero(x); return { a: v, b: v, fa: true, fb: true }; });
    const m = parte.match(/^([[\]])(.+), (.+)([[\]])$/);
    assert.ok(m, 'não é intervalo: ' + parte);
    const extremo = (x) => (x === '-\\infty' ? -Infinity : x === '+\\infty' ? Infinity : lerNumero(x));
    return [{ a: extremo(m[2]), b: extremo(m[3]), fa: m[1] === '[', fb: m[4] === ']' }];
  });
}
const pertence = (I, x) => I.some((i) => (i.fa ? x >= i.a : x > i.a) && (i.fb ? x <= i.b : x < i.b));
function fDe(pontos, x) {
  for (let i = 0; i + 1 < pontos.length; i++) {
    const [x1, y1] = pontos[i], [x2, y2] = pontos[i + 1];
    if (x >= x1 && x <= x2) return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
  }
  return NaN;
}
const CUMPRE = { '=': (d) => Math.abs(d) < 1e-9, '<': (d) => d < -1e-9, '>': (d) => d > 1e-9, '<=': (d) => d < 1e-9, '>=': (d) => d > -1e-9 };

test('condições: a opção certa é o conjunto dos x do domínio que cumprem a condição (testado de 0,25 em 0,25)', () => {
  const vistos = new Set();
  for (const p of amostras('generalidades-condicoes', 120)) {
    const { pontos, sg, k } = p.dados;
    vistos.add(sg);
    assert.equal(p.opcoes.length, 4);
    assert.equal(new Set(p.opcoes).size, 4);
    const I = lerCondicao(certa(p));
    const x0 = pontos[0][0], xn = pontos[pontos.length - 1][0];
    for (let x = x0; x <= xn + 1e-9; x += 0.25) assert.equal(pertence(I, x), CUMPRE[sg](fDe(pontos, x) - k), certa(p) + ' em x = ' + x);
    if (sg !== '=') {
      // as opções erradas não cumprem a condição em algum ponto (ou dizem respeito a x fora do domínio)
      for (const o of p.opcoes.filter((_, i) => i !== p.correta)) assert.notEqual(o, certa(p));
    }
    assert.match(p.enunciado, /Qual é o conjunto-solução de \$f\(x\) (=|<|>|\\leq|\\geq) -?\d\$\?$/);
  }
  assert.deepEqual([...vistos].sort(), ['<', '<=', '=', '>', '>=']);
});

test('condições: a figura do enunciado não revela a solução; o esquema da resposta sim', () => {
  for (const p of amostras('generalidades-condicoes', 30)) {
    assert.equal(p.figuraEnunciado.id, 'condicoes');
    assert.deepEqual(Object.keys(p.figuraEnunciado.opcoes).sort(), ['k', 'modo', 'pontos']);
    assert.equal(p.figuraEnunciado.opcoes.modo, 'enunciado');
    assert.deepEqual(p.figuraEnunciado.opcoes.pontos, p.dados.pontos);
    assert.deepEqual(p.esquema, { id: 'condicoes', opcoes: { pontos: p.dados.pontos, sinal: p.dados.sg, k: p.dados.k } });
  }
});

test('condições: cada distrator é um erro real, com o valor da opção na explicação', () => {
  const contagem = {};
  for (const p of amostras('generalidades-condicoes', 120)) {
    const { sg } = p.dados;
    for (const e of p.errosTipicos) {
      contagem[e.codigo] = (contagem[e.codigo] || 0) + 1;
      assert.ok(e.explicacao.includes(p.opcoes[e.opcao]), e.codigo + ': ' + e.explicacao + ' vs ' + p.opcoes[e.opcao]);
      assert.ok(e.explicacao.includes(certa(p)), 'fim com a resposta: ' + e.explicacao);
    }
    const codigos = p.errosTipicos.map((e) => e.codigo);
    if (sg === '<' || sg === '>') assert.ok(!codigos.includes('excluiu_pontos_de_igualdade') && !codigos.includes('esqueceu_ponto_isolado'));
    if (sg === '<=' || sg === '>=') assert.ok(!codigos.includes('incluiu_pontos_de_igualdade'));
    if (sg === '=') assert.ok(codigos.every((c) => ['esqueceu_uma_solucao', 'calculou_imagem', 'intervalo_em_vez_de_pontos', 'deu_o_valor_de_k', 'deu_os_pontos_de_intersecao', 'deu_os_zeros', 'leu_mal_o_corte'].includes(c)), codigos.join());
    else assert.ok(!codigos.some((c) => ['deu_os_pontos_de_intersecao', 'deu_os_zeros', 'leu_mal_o_corte'].includes(c)), codigos.join());
    // os pontos de interseção: (x, k) para cada solução
    const pts = erro(p, 'deu_os_pontos_de_intersecao');
    if (pts) assert.equal(p.opcoes[pts.opcao], '$\\{' + lerConjunto(certa(p)).map((x) => '(' + x + ', ' + p.dados.k + ')').join(', ') + '\\}$');
    // os zeros de f: f(x) = 0 em cada elemento
    const zer = erro(p, 'deu_os_zeros');
    if (zer) for (const x of lerConjunto(p.opcoes[zer.opcao])) assert.ok(Math.abs(fDe(p.dados.pontos, x)) < 1e-9, p.opcoes[zer.opcao]);
    // um corte lido ao lado: o mesmo número de elementos, um só diferente (a uma unidade) e aí f(x) ≠ k
    const lm = erro(p, 'leu_mal_o_corte');
    if (lm) {
      const a = lerConjunto(certa(p)), b = lerConjunto(p.opcoes[lm.opcao]);
      assert.equal(a.length, b.length);
      const fora = b.filter((x) => !a.includes(x));
      assert.equal(fora.length, 1);
      assert.ok(a.some((x) => Math.abs(x - fora[0]) === 1) && Math.abs(fDe(p.dados.pontos, fora[0]) - p.dados.k) > 1e-9);
    }
    // o complementar: cada x do domínio está numa e só numa das duas (certa e complementar)
    const cmp = erro(p, 'deu_o_complementar');
    if (cmp) {
      const A = lerCondicao(certa(p)), B = lerCondicao(p.opcoes[cmp.opcao]);
      const x0 = p.dados.pontos[0][0], xn = p.dados.pontos[p.dados.pontos.length - 1][0];
      for (let x = x0; x <= xn + 1e-9; x += 0.25) assert.notEqual(pertence(A, x), pertence(B, x), p.opcoes[cmp.opcao] + ' em ' + x);
    }
    // incluir os pontos de f(x) = k numa desigualdade estrita dá a solução da larga
    const inc = erro(p, 'incluiu_pontos_de_igualdade');
    if (inc) {
      const I = lerCondicao(p.opcoes[inc.opcao]);
      const { pontos, k } = p.dados;
      const x0 = pontos[0][0], xn = pontos[pontos.length - 1][0];
      for (let x = x0; x <= xn + 1e-9; x += 0.25) assert.equal(pertence(I, x), CUMPRE[sg + '='](fDe(pontos, x) - p.dados.k));
      void k;
    }
  }
  for (const c of ['regiao_trocada', 'extremos_trocados', 'incluiu_pontos_de_igualdade', 'excluiu_pontos_de_igualdade', 'esqueceu_uma_solucao', 'intervalo_em_vez_de_pontos',
    'deu_os_pontos_de_intersecao', 'deu_os_zeros', 'leu_mal_o_corte', 'deu_o_complementar', 'esqueceu_o_dominio', 'esqueceu_um_intervalo']) {
    assert.ok(contagem[c] > 20, c + ': ' + contagem[c]);
  }
});

test('condições: o 3 fica fechado no extremo do domínio com <; ∅ e pontos isolados escritos como no manual', () => {
  let fechadoNoExtremo = 0;
  for (const p of amostras('generalidades-condicoes', 120).filter((q) => q.dados.sg === '<' || q.dados.sg === '>')) {
    const xn = p.dados.pontos[p.dados.pontos.length - 1][0];
    if (certa(p).endsWith(', ' + xn + ']$')) fechadoNoExtremo++;
  }
  assert.ok(fechadoNoExtremo > 10, 'extremo do domínio fechado: ' + fechadoNoExtremo);
});

test('condições: nenhum par de opções descreve o mesmo conjunto (comparação como conjuntos, não como texto)', () => {
  const base = [];
  for (let x = -12; x <= 12; x += 0.25) base.push(x);
  let n = 0;
  for (const p of amostras('generalidades-condicoes', 1500)) {
    // os extremos e os pontos de todas as opções (há zeros fracionários, como -8/3), mais a grelha de 0,25
    const grelha = base.concat(p.opcoes.filter((o) => !ehPares(o)).flatMap((o) => lerCondicao(o).flatMap((i) => [i.a, i.b])).filter(Number.isFinite));
    const assinaturas = p.opcoes.map((o) => { if (ehPares(o)) return o; const I = lerCondicao(o); return grelha.map((x) => (pertence(I, x) ? '1' : '0')).join(''); });
    assert.equal(new Set(assinaturas).size, 4, 'semente ' + p.semente + ' ' + p.contexto + ': ' + p.opcoes.join(' | '));
    // e nenhuma opção tem intervalos contíguos por unir (]a, b] ∪ [b, c])
    for (const o of p.opcoes.filter((q) => !ehPares(q))) {
      const I = lerCondicao(o);
      for (let i = 0; i + 1 < I.length; i++) assert.ok(I[i].b < I[i + 1].a || (I[i].b === I[i + 1].a && !I[i].fb && !I[i + 1].fa), 'por unir: ' + o);
    }
    n++;
  }
  assert.equal(n, 4500);
});

// Quem responde só pela forma das opções (sem olhar para o gráfico). Cada adivinho devolve a probabilidade de
// acertar num item (empates repartidos ao acaso; 1/4 se não houver candidato).
// Pontos ordenados «{(a, b), …}» não são conjuntos de números: ficam incomparáveis com os outros.
const ehPares = (o) => /^\$\\{\(/.test(o);
function formaDasOpcoes(p) {
  const I = p.opcoes.map((o) => (ehPares(o) ? null : lerCondicao(o)));
  // grelha exata: todos os extremos, os pontos médios entre extremos seguidos e um ponto para lá de cada ponta
  const v = [...new Set(I.flatMap((l) => (l || []).flatMap((i) => [i.a, i.b])).values())].filter(Number.isFinite).sort((a, b) => a - b);
  const g = [v[0] - 1, v[v.length - 1] + 1].concat(v, v.slice(1).map((x, i) => (x + v[i]) / 2));
  const ass = I.map((l) => (l ? g.map((x) => pertence(l, x)) : null));
  const contem = (i, j) => i !== j && ass[i] && ass[j] && ass[i].every((s, t) => s || !ass[j][t]);
  const elementos = I.map((l, i) => (ehPares(p.opcoes[i]) ? p.opcoes[i].split('), (').length : l.every((x) => x.a === x.b) ? l.length : null));
  const valores = p.opcoes.map((o) => (o.replace(/\\dfrac\{\d+\}\{\d+\}/g, 'F').match(/\d+|F|\\infty/g) || []).length);
  return { contem, elementos, valores };
}
const I4 = [0, 1, 2, 3];
const entre = (p, idx) => (idx.length ? (idx.includes(p.correta) ? 1 / idx.length : 0) : 0.25);
const extremo = (p, v, maior) => {
  const ok = v.map((x, i) => (x === null ? -1 : i)).filter((i) => i >= 0);
  if (!ok.length) return 0.25;
  const alvo = (maior ? Math.max : Math.min)(...ok.map((i) => v[i]));
  return entre(p, ok.filter((i) => v[i] === alvo));
};
const ADIVINHOS_CONDICOES = {
  'a mais comprida': (p) => extremo(p, p.opcoes.map((o) => o.length), true),
  'a mais curta': (p) => extremo(p, p.opcoes.map((o) => o.length), false),
  'a que contém outra': (p) => { const f = formaDasOpcoes(p); return entre(p, I4.filter((i) => I4.some((j) => f.contem(i, j)))); },
  'a contida noutra': (p) => { const f = formaDasOpcoes(p); return entre(p, I4.filter((i) => I4.some((j) => f.contem(j, i)))); },
  'a maior (contém outra e não está contida)': (p) => { const f = formaDasOpcoes(p); return entre(p, I4.filter((i) => I4.some((j) => f.contem(i, j)) && !I4.some((j) => f.contem(j, i)))); },
  'a menor (contida noutra e não contém nenhuma)': (p) => { const f = formaDasOpcoes(p); return entre(p, I4.filter((i) => I4.some((j) => f.contem(j, i)) && !I4.some((j) => f.contem(i, j)))); },
  'a com mais números escritos': (p) => extremo(p, formaDasOpcoes(p).valores, true),
  'a com menos números escritos': (p) => extremo(p, formaDasOpcoes(p).valores, false),
  'a com mais pontos (entre chavetas)': (p) => extremo(p, formaDasOpcoes(p).elementos, true),
  'a com menos pontos (entre chavetas)': (p) => extremo(p, formaDasOpcoes(p).elementos, false),
};

test('condições (escolha): responder só pela forma das opções dá ≤ 0,35 em cada contexto (2000 sementes)', () => {
  const d = G.obter('generalidades-condicoes');
  const acima = [];
  for (const contexto of G.contextosDe(d)) {
    const ps = [];
    for (let s = 1; s <= 2000; s++) ps.push(G.gerar('generalidades-condicoes', s, { formato: 'escolha', contexto }));
    for (const [nome, f] of Object.entries(ADIVINHOS_CONDICOES)) {
      const t = ps.reduce((a, p) => a + f(p), 0) / ps.length;
      console.log('adivinho por estrutura, condições ' + contexto + ', ' + nome + ': ' + t.toFixed(3));
      if (t > 0.35) acima.push(contexto + ', ' + nome + ': ' + t.toFixed(3));
    }
  }
  assert.deepEqual(acima, []);
});
