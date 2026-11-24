// Geradores de Matemática A — Modelos Matemáticos para a Cidadania (js/geradores/mat-a/cidadania.js).
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

const FICHEIROS = [
  'js/aleatorio.js', 'esquemas/mat-a/calculo-cidadania.js', 'esquemas/mat-a/formatar.js',
  'js/geradores/registo.js', 'js/geradores/ajudas.js', 'js/geradores/mat-a/cidadania.js',
];
const IDS = [
  'maiorias-limiar', 'maiorias-vencedor', 'maiorias-em-falta',
  'borda-pontos', 'borda-vencedor', 'borda-divergencia',
  'hondt-stlague-hondt-mandatos', 'hondt-stlague-stlague-mandatos', 'hondt-stlague-ultimo-mandato', 'hondt-stlague-partilha',
  'salarios-ss', 'salarios-liquido', 'salarios-irs-anual', 'salarios-hora',
  'juros-simples-montante', 'juros-composto-montante', 'juros-capital-inicial',
];

let M, G;
before(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
});

test('regista os 17 geradores de cidadania, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  const ids = G.todos().filter((d) => d.tema === 'cidadania').map((d) => d.id);
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
test('snapshot: maiorias-limiar (votos), semente 7', () => {
  const p = G.gerar('maiorias-limiar', 7, { formato: 'numerica', contexto: 'votos' });
  assert.match(p.enunciado, /Joana teve 162 votos, Helena teve 131 votos e Rita teve 230 votos/);
  assert.equal(p.resposta, 262); // ⌊523/2⌋ + 1
  assert.equal(p.verificacao.valor, 262);
});

test('snapshot: hondt-stlague-hondt-mandatos, semente 7', () => {
  const p = G.gerar('hondt-stlague-hondt-mandatos', 7, { formato: 'numerica' });
  assert.deepEqual(p.dados, { votos: [430, 1020, 11730, 8480], M: 8, partido: 1 });
  assert.equal(p.resposta, 0); // C 5, D 3, A 0, B 0
  assert.deepEqual(p.esquema.opcoes.mandatos, 8);
});

test('snapshot: salarios-irs-anual, semente 7', () => {
  const p = G.gerar('salarios-irs-anual', 7, { formato: 'numerica' });
  assert.match(p.enunciado, /ilustrativ/);
  assert.equal(p.dados.R, 10000);
  assert.equal(p.resposta, 1440); // 8000 × 0,13 + 2000 × 0,20
  assert.equal(p.tolerancia, 0.005);
});

test('snapshot: juros-composto-montante (mensal), semente 7', () => {
  const p = G.gerar('juros-composto-montante', 7, { formato: 'numerica', contexto: 'mensal' });
  assert.deepEqual(p.dados, { C0: 600, r: 0.01, t: 6, n: 12 });
  assert.equal(p.resposta, 637.09); // 600 × (1 + 0,01/12)^72
});

test('snapshot: hondt-stlague-stlague-mandatos (escolha: distribuição), semente 7', () => {
  const p = G.gerar('hondt-stlague-stlague-mandatos', 7, { formato: 'escolha' });
  assert.match(p.enunciado, /Como ficam distribuídos os 8 mandatos/);
  assert.equal(p.opcoes[p.correta], 'A 0 – B 0 – C 5 – D 3'); // ímpares: C 11 730/1, /3, /5, /7, /9; D 8480/1, /3, /5
  assert.ok(p.resolucaoDetalhada[0].bloco && p.resolucaoDetalhada[0].calculo.startsWith('\\begin{array}'));
  assert.ok(p.resolucao[0].includes('$$\\begin{array}'));
});

test('mandatos: só erros reais (sem códigos contagem_*), em numérica e escolha', () => {
  for (const id of ['hondt-stlague-hondt-mandatos', 'hondt-stlague-stlague-mandatos']) {
    for (const formato of ['numerica', 'escolha']) {
      for (let s = 1; s <= 100; s++) {
        const p = G.gerar(id, s, { formato });
        assert.ok(p.errosTipicos.every((e) => !/^contagem_/.test(e.codigo)), id + ' ' + formato + ' ' + s);
      }
    }
  }
});

// ---------------------------------------------------------------- partilha proporcional fora das eleições
// Palavras do contexto eleitoral («repartidos» não conta: \b antes de «partido»).
const ELEITORAL = /elei[çc]|\bpartidos?\b|mandat|\bvotos?\b|assembleia/i;
const distTexto = (nomes, m) => nomes.map((n, i) => n + ' ' + m[i]).join(' – ');

test('partilha: gerador hondt-stlague-partilha com formatos numérica e escolha', () => {
  const d = G.obter('hondt-stlague-partilha');
  assert.ok(d, 'gerador em falta');
  assert.equal(d.subtema, 'hondt-stlague');
  assert.equal(d.tipo, 'partilha');
  assert.deepEqual(d.formatos, ['numerica', 'escolha']);
});

test('partilha: em 500 sementes, soma = total, resposta = calc() pelo método pedido, contexto não eleitoral', () => {
  const C = M.calc.cidadania;
  const metodos = new Set();
  for (const formato of ['numerica', 'escolha']) {
    for (let s = 1; s <= 500; s++) {
      const p = G.gerar('hondt-stlague-partilha', s, { formato });
      const { tamanhos, N, metodo, nomes, item } = p.dados;
      metodos.add(metodo);
      assert.ok(metodo === 'hondt' || metodo === 'stlague', 'método ' + metodo);
      const m = (metodo === 'hondt' ? C.hondt : C.stLague)(tamanhos, N).mandatos;
      assert.equal(m.reduce((a, b) => a + b, 0), N, formato + ' ' + s);
      assert.ok(p.enunciado.includes(' ' + N + ' '), 'o total ' + N + ' está no enunciado: ' + p.enunciado);
      if (formato === 'escolha') assert.equal(p.opcoes[p.correta], distTexto(nomes, m), formato + ' ' + s);
      else assert.equal(p.resposta, m[p.dados.entidade], formato + ' ' + s);
      // Contexto não eleitoral: computadores, bolsas, vagas, lugares…
      assert.match(p.enunciado, /computador|bolsa|vaga|lugar/, p.enunciado);
      const textos = [p.enunciado].concat(p.opcoes || [], p.errosTipicos.map((e) => e.explicacao), p.resolucao);
      for (const t of textos) assert.doesNotMatch(t, ELEITORAL, formato + ' ' + s + ': ' + t);
      assert.ok(typeof item === 'string' && item.length > 0);
    }
  }
  assert.deepEqual([...metodos].sort(), ['hondt', 'stlague']);
});

test('partilha: erros reais — outro método (sempre na numérica, quase sempre na escolha); arredondar as quotas só quando o total sai errado; nada perto de 0', () => {
  let comOutro = 0;
  for (const formato of ['numerica', 'escolha']) {
    for (let s = 1; s <= 300; s++) {
      const p = G.gerar('hondt-stlague-partilha', s, { formato });
      const { tamanhos, N, metodo } = p.dados;
      const T = tamanhos.reduce((a, b) => a + b, 0);
      const somaArred = tamanhos.reduce((a, v) => a + Math.round((N * v) / T), 0);
      const codigos = p.errosTipicos.map((e) => e.codigo);
      if (codigos.includes('arredondou_as_quotas')) assert.notEqual(somaArred, N, formato + ' ' + s);
      const outro = codigos.includes(metodo === 'hondt' ? 'divisores_impares' : 'divisores_hondt');
      if (formato === 'escolha') {
        if (outro) comOutro++;
      } else {
        assert.ok(outro, formato + ' ' + s + ': ' + codigos);
        // Regra 7: nenhum erro típico com valor 0 (um «0» escrito não pode ser marcado como erro típico).
        for (const e of p.errosTipicos) assert.ok(e.valor >= 1, 'erro ' + e.codigo + ' com valor ' + e.valor);
      }
    }
  }
  assert.ok(comOutro >= 0.8 * 300, 'escolha com o outro método: ' + comOutro + '/300');
});

test('partilha: caso fixo (semente 7, escolha) em que Hondt e St. Laguë diferem, e a explicação diz isso', () => {
  const C = M.calc.cidadania;
  const p = G.gerar('hondt-stlague-partilha', 7, { formato: 'escolha' });
  const { tamanhos, N, metodo, nomes } = p.dados;
  const h = C.hondt(tamanhos, N).mandatos;
  const sl = C.stLague(tamanhos, N).mandatos;
  assert.notDeepEqual(h, sl);
  const outro = metodo === 'hondt' ? sl : h;
  const e = p.errosTipicos.find((x) => x.codigo === (metodo === 'hondt' ? 'divisores_impares' : 'divisores_hondt'));
  assert.ok(e, 'falta o erro do outro método');
  assert.equal(p.opcoes[e.opcao], distTexto(nomes, outro));
  assert.ok(e.explicacao.includes(distTexto(nomes, outro)), e.explicacao);
  assert.match(e.explicacao, /distribuição diferente/);
});

// Na numérica conta só o valor de uma entidade, por isso arredondar as quotas raramente se distingue (≈ 1 em 400).
test('partilha (numérica): há sementes com arredondamento das quotas (total errado) oferecido como erro', () => {
  let visto = 0;
  for (let s = 1; s <= 2000; s++) {
    const p = G.gerar('hondt-stlague-partilha', s, { formato: 'numerica' });
    const e = p.errosTipicos.find((x) => x.codigo === 'arredondou_as_quotas');
    if (!e) continue;
    visto++;
    assert.ok(e.explicacao.includes(String(e.valor)), e.explicacao);
  }
  assert.ok(visto >= 2, 'só ' + visto + ' sementes com arredondou_as_quotas');
});

// "Norte 3 – Sul 5 – Centro 2" → [3, 5, 2]
const lerPartilha = (o) => o.split(' – ').map((x) => Number(x.match(/(\d+)$/)[1]));

test('partilha (escolha): todas as opções repartem exatamente N, com erros reais que respeitam o total', () => {
  const C = M.calc.cidadania;
  const codigos = {};
  const metodos = { hondt: 0, stlague: 0 };
  // Maiores quocientes com outra sequência de divisores (para conferir saltou_o_divisor_1).
  const porDivisores = (t, n, div) => {
    const m = t.map(() => 0);
    for (let k = 0; k < n; k++) {
      let j = 0;
      for (let i = 1; i < t.length; i++) if (t[i] / div(m[i]) > t[j] / div(m[j])) j = i;
      m[j]++;
    }
    return m;
  };
  for (let s = 1; s <= 2000; s++) {
    const p = G.gerar('hondt-stlague-partilha', s, { formato: 'escolha' });
    const { tamanhos, N, metodo } = p.dados;
    metodos[metodo]++;
    const h = (metodo === 'hondt' ? C.hondt : C.stLague)(tamanhos, N);
    for (const o of p.opcoes) assert.equal(lerPartilha(o).reduce((a, b) => a + b, 0), N, 'semente ' + s + ': ' + o);
    for (const e of p.errosTipicos) {
      codigos[e.codigo] = (codigos[e.codigo] || 0) + 1;
      assert.ok(e.explicacao.includes(p.opcoes[e.opcao]), e.codigo + ': ' + e.explicacao);
      const m = lerPartilha(p.opcoes[e.opcao]);
      if (e.codigo === 'proporcional_restos_maiores') assert.deepEqual(m, C.restosMaiores(tamanhos, N).mandatos);
      if (e.codigo === 'um_por_partido') assert.deepEqual(m, (metodo === 'hondt' ? C.hondt : C.stLague)(tamanhos, N - tamanhos.length).mandatos.map((x) => x + 1));
      if (e.codigo === 'saltou_o_divisor_1') assert.deepEqual(m, porDivisores(tamanhos, N, metodo === 'hondt' ? (k) => k + 2 : (k) => 2 * k + 3));
      if (e.codigo === 'deu_as_sobras_ao_maior') {
        const T = tamanhos.reduce((a, b) => a + b, 0);
        const g = tamanhos.indexOf(Math.max(...tamanhos));
        m.forEach((x, i) => { if (i !== g) assert.equal(x, Math.floor((N * tamanhos[i]) / T)); });
      }
      if (e.codigo === 'trocou_o_ultimo_quociente') {
        // a certa com um só item mudado: sai de quem tem o N.º quociente, vai para quem tem o (N + 1).º
        const dif = m.map((x, i) => x - h.mandatos[i]);
        assert.deepEqual(dif.filter((x) => x !== 0).sort(), [-1, 1]);
      }
    }
  }
  // o método sorteia-se por semente: metade e metade
  assert.ok(metodos.hondt > 900 && metodos.stlague > 900, JSON.stringify(metodos));
  for (const c of ['divisores_impares', 'divisores_hondt', 'um_por_partido', 'saltou_o_divisor_1', 'deu_as_sobras_ao_maior', 'trocou_o_ultimo_quociente']) assert.ok(codigos[c] > 200, c + ': ' + codigos[c]);
  assert.ok(codigos.proporcional_restos_maiores > 10, 'proporcional_restos_maiores: ' + codigos.proporcional_restos_maiores);
  for (const c of ['arredondou_as_quotas', 'parou_um_antes', 'incluiu_quociente_seguinte']) assert.equal(codigos[c], undefined, c);
});

// Quem não calcula quocientes: elimina as opções com o total errado e escolhe pela regra de bolso
// «o Hondt dá mais aos grandes, o St. Laguë dá mais aos pequenos» (empates repartidos ao acaso).
test('partilha (escolha): soma + «Hondt favorece os grandes» acerta ≤ 0,35 (2000 sementes)', () => {
  const ps = [];
  for (let s = 1; s <= 2000; s++) ps.push(G.gerar('hondt-stlague-partilha', s, { formato: 'escolha' }));
  const regra = (alvo, maisNoHondt) => (p) => {
    const { tamanhos, N, metodo } = p.dados;
    const g = tamanhos.indexOf(alvo === 'maior' ? Math.max(...tamanhos) : Math.min(...tamanhos));
    const ok = p.opcoes.map((o, i) => ({ i, m: lerPartilha(o) })).filter((x) => x.m.reduce((a, b) => a + b, 0) === N);
    const quer = (metodo === 'hondt') === maisNoHondt ? Math.max : Math.min;
    const alvoV = quer(...ok.map((x) => x.m[g]));
    const cand = ok.filter((x) => x.m[g] === alvoV).map((x) => x.i);
    return cand.includes(p.correta) ? 1 / cand.length : 0;
  };
  const adivinhos = {
    'Hondt: mais ao maior; St. Laguë: menos ao maior': regra('maior', true),
    'Hondt: menos ao menor; St. Laguë: mais ao menor': regra('menor', false),
  };
  const acima = [];
  for (const [nome, f] of Object.entries(adivinhos)) {
    for (const metodo of ['hondt', 'stlague', null]) {
      const q = ps.filter((p) => metodo === null || p.dados.metodo === metodo);
      const t = q.reduce((a, p) => a + f(p), 0) / q.length;
      console.log('adivinho por estrutura, partilha ' + (metodo || 'todos') + ', ' + nome + ': ' + t.toFixed(3));
      if (t > 0.35) acima.push((metodo || 'todos') + ', ' + nome + ': ' + t.toFixed(3));
    }
  }
  assert.deepEqual(acima, []);
});
