const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { carregar } = require('./ajuda.js');

const FICHEIROS = ['js/aleatorio.js', 'esquemas/mat-a/formatar.js', 'js/geradores/registo.js', 'js/geradores/ajudas.js'];
const CAMINHO_HARNESS = path.join(__dirname, '..', 'tools', 'verificar-geradores.js');

let M, G, verificar;
beforeEach(() => {
  M = carregar(...FICHEIROS);
  G = M.geradores;
  delete require.cache[CAMINHO_HARNESS];
  verificar = require(CAMINHO_HARNESS).verificar;
});

// Gerador de teste trivial: soma de dois inteiros (numérica e escolha).
function defSoma(extra = {}) {
  return {
    id: 'teste-soma', disciplina: 'mat-a', tema: 'testes', subtema: 'somas', tipo: 'soma',
    nome: 'Soma de dois inteiros', formatos: ['numerica', 'escolha'], contextos: ['simples'],
    gerar(semente, { formato, rng }) {
      const A = G.ajudas;
      const a = A.entre(rng, 2, 20);
      const b = A.entre(rng, 2, 20);
      const s = a + b;
      const erros = [
        { codigo: 'subtraiu', valor: a - b === s ? s + 100 : a - b, explicacao: 'Subtraíste em vez de somar.' },
        { codigo: 'multiplicou', valor: a * b === s ? s + 200 : a * b, explicacao: 'Multiplicaste em vez de somar.' },
        { codigo: 'mais_um', valor: s + 1, explicacao: 'Contaste uma unidade a mais.' },
        { codigo: 'menos_um', valor: s - 1, explicacao: 'Contaste uma unidade a menos.' },
      ].filter((x, i, l) => l.findIndex((y) => y.valor === x.valor) === i);
      const ex = {
        enunciado: 'Calcula $' + a + ' + ' + b + '$.',
        resolucao: [{ passo: 'Somar', porque: 'Juntam-se as duas parcelas.', calculo: a + ' + ' + b + ' = ' + s }],
        verificacao: { passo: 'Subtrair', calculo: s + ' - ' + b + ' = ' + a, valor: s },
        dados: { a, b },
      };
      if (formato === 'numerica') {
        Object.assign(ex, { resposta: s, tolerancia: 0, errosTipicos: erros });
      } else {
        const e = A.escolhaDeErros(rng, A.fmt(s), erros.map((x) => ({ ...x, texto: A.fmt(x.valor) })));
        Object.assign(ex, e);
        ex.verificacao = { ...ex.verificacao, valor: e.correta };
      }
      return ex;
    },
    verificarIndependente(p) {
      const { a, b } = p.dados;
      return p.formato === 'numerica' ? p.resposta - b === a : p.opcoes[p.correta] === G.ajudas.fmt(a + b);
    },
    limites(p) {
      return p.dados.a >= 2 && p.dados.a <= 20 && p.dados.b >= 2 && p.dados.b <= 20;
    },
    ...extra,
  };
}

function defVf(extra = {}) {
  return {
    id: 'teste-vf', disciplina: 'mat-a', tema: 'testes', subtema: 'somas', tipo: 'paridade',
    nome: 'Paridade', formatos: ['vf'], contextos: [],
    gerar(semente, { rng }) {
      const A = G.ajudas;
      const n = 2 * A.entre(rng, 1, 30);
      const v = A.vfDe(rng, 'O número ' + n + ' é par.', 'O número ' + n + ' é ímpar.',
        { codigo: 'paridade_trocada', explicacao: 'Um número par é divisível por 2.' });
      return {
        ...v,
        resolucao: [{ passo: 'Dividir por 2', porque: 'Um número é par se o resto da divisão por 2 for 0.', calculo: n + ' = 2 \\times ' + n / 2 }],
        verificacao: { passo: 'Resto', calculo: n + ' \\bmod 2 = 0', valor: v.correta },
        dados: { n },
      };
    },
    verificarIndependente(p) {
      return p.dados.n % 2 === 0 && p.correta === /é par/.test(p.enunciado);
    },
    limites: (p) => p.dados.n <= 60,
    ...extra,
  };
}

const regras = (erros) => [...new Set(erros.map((e) => (e.match(/\[regra (\d)\]/) || [])[1]).filter(Boolean))];

test('registar, obter, todos e doSubtema', () => {
  G.registar(defSoma());
  G.registar(defVf());
  G.registar({ ...defSoma(), id: 'outro', subtema: 'produtos' });
  assert.equal(G.obter('teste-soma').nome, 'Soma de dois inteiros');
  assert.equal(G.obter('nada'), undefined);
  assert.deepEqual(G.todos().map((d) => d.id), ['teste-soma', 'teste-vf', 'outro']);
  assert.deepEqual(G.doSubtema('mat-a', 'somas').map((d) => d.id), ['teste-soma', 'teste-vf']);
  assert.deepEqual(G.doSubtema('mat-a', 'nada'), []);
});

test('registar lança com id repetido ou campos em falta', () => {
  G.registar(defSoma());
  assert.throws(() => G.registar(defSoma()), /repetido/);
  for (const campo of ['id', 'gerar', 'verificarIndependente', 'formatos', 'limites']) {
    const d = { ...defSoma(), id: 'x-' + campo };
    delete d[campo];
    assert.throws(() => G.registar(d), new RegExp(campo));
  }
  assert.throws(() => G.registar({ ...defSoma(), id: 'x-vazio', formatos: [] }), /formatos/);
  assert.throws(() => G.registar({ ...defSoma(), id: 'x-formato', formatos: ['ensaio'] }), /formatos/);
});

test('gerar normaliza para a forma do quiz', () => {
  G.registar(defSoma());
  const p = G.gerar('teste-soma', 42, { formato: 'numerica', contexto: 'simples' });
  const { a, b } = p.dados;
  assert.equal(p.id, 'teste-soma');
  assert.equal(p.tipo, 'numerica');
  assert.equal(p.gerador, 'teste-soma');
  assert.equal(p.semente, 42);
  assert.equal(p.formato, 'numerica');
  assert.equal(p.contexto, 'simples');
  assert.equal(p.nivel, 2);
  assert.equal(p.competencia, 'soma');
  assert.equal(p.resposta, a + b);
  assert.equal(p.tolerancia, 0);
  assert.equal(p.explicacao, '');
  assert.deepEqual(p.resolucao, ['**Somar** — Juntam-se as duas parcelas. $' + a + ' + ' + b + ' = ' + (a + b) + '$']);
  assert.deepEqual(p.resolucaoDetalhada, [{ passo: 'Somar', porque: 'Juntam-se as duas parcelas.', calculo: a + ' + ' + b + ' = ' + (a + b) }]);
  assert.equal(p.verificacao.valor, a + b);
  assert.equal(p.errosTipicos.length, 4);
  assert.ok(!('opcoes' in p));
  // o quiz corrige a pergunta gerada
  const Mq = carregar('js/aleatorio.js', 'js/quiz.js');
  assert.equal(Mq.quiz.corrigir(p, String(a + b)).certa, true);
});

test('gerar usa o primeiro formato/contexto por omissão e rejeita formato desconhecido', () => {
  G.registar(defSoma());
  const p = G.gerar('teste-soma', 7);
  assert.equal(p.formato, 'numerica');
  assert.equal(p.contexto, 'simples');
  const e = G.gerar('teste-soma', 7, { formato: 'escolha' });
  assert.equal(e.tipo, 'escolha');
  assert.equal(e.opcoes.length, 4);
  assert.throws(() => G.gerar('teste-soma', 7, { formato: 'vf' }), /formato/);
  assert.throws(() => G.gerar('nada', 7), /nada/);
});

test('gerar é determinista: mesma semente, mesmo exercício', () => {
  G.registar(defSoma());
  const um = G.gerar('teste-soma', 123, { formato: 'escolha' });
  const dois = G.gerar('teste-soma', 123, { formato: 'escolha' });
  assert.equal(JSON.stringify(um), JSON.stringify(dois));
  const enunciados = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => G.gerar('teste-soma', s).enunciado));
  assert.ok(enunciados.size > 1);
});

test('verificar aceita os geradores bons', () => {
  assert.deepEqual(verificar(defSoma(), { sementes: 200 }), []);
  assert.deepEqual(verificar(defVf(), { sementes: 200 }), []);
});

test('regra 1: verificarIndependente falso', () => {
  const e = verificar(defSoma({ verificarIndependente: (p) => p.dados.a !== 7 }), { sementes: 200 });
  assert.deepEqual(regras(e), ['1']);
});

test('regra 2: verificação incoerente com a resposta', () => {
  const mau = defSoma();
  const gerar = mau.gerar;
  mau.gerar = function (s, o) {
    const ex = gerar(s, o);
    ex.verificacao = { ...ex.verificacao, valor: o.formato === 'numerica' ? ex.resposta + 1 : (ex.correta + 1) % 4 };
    return ex;
  };
  assert.deepEqual(regras(verificar(mau, { sementes: 50 })), ['2']);
});

test('regra 3: opções repetidas, erro típico igual à resposta ou opção sem erro típico', () => {
  const mau = defSoma();
  const gerar = mau.gerar;
  mau.gerar = function (s, o) {
    const ex = gerar(s, o);
    if (o.formato === 'numerica') ex.errosTipicos = [...ex.errosTipicos, { codigo: 'igual', valor: ex.resposta, explicacao: 'x' }];
    else {
      ex.opcoes = ex.opcoes.slice();
      const errada = (ex.correta + 2) % 4; // não é a opção usada pela mutação da regra 1
      ex.opcoes[errada] = ex.opcoes[ex.correta];
    }
    return ex;
  };
  const e = verificar(mau, { sementes: 5 });
  assert.deepEqual(regras(e), ['3']);
  assert.ok(e.some((x) => /numerica/.test(x)) && e.some((x) => /escolha/.test(x)));

  const semErro = defSoma({ formatos: ['escolha'] });
  const g2 = semErro.gerar;
  semErro.gerar = function (s, o) {
    const ex = g2(s, o);
    ex.errosTipicos = ex.errosTipicos.slice(1);
    return ex;
  };
  assert.deepEqual(regras(verificar(semErro, { sementes: 20 })), ['3']);

  const codigoMau = defSoma({ formatos: ['numerica'] });
  const g3 = codigoMau.gerar;
  codigoMau.gerar = function (s, o) {
    const ex = g3(s, o);
    ex.errosTipicos = ex.errosTipicos.map((x) => ({ ...x, codigo: 'Código Mau' }));
    return ex;
  };
  assert.deepEqual(regras(verificar(codigoMau, { sementes: 20 })), ['3']);
});

test('regra 4: textos com sinais duplos, NaN ou fórmulas que o KaTeX rejeita', () => {
  const sinais = defSoma({ formatos: ['numerica'] });
  const g1 = sinais.gerar;
  sinais.gerar = function (s, o) {
    const ex = g1(s, o);
    ex.enunciado = 'Calcula $x − −2$ com x = ' + ex.dados.a + '.';
    return ex;
  };
  assert.deepEqual(regras(verificar(sinais, { sementes: 20 })), ['4']);

  const nan = defSoma({ formatos: ['numerica'] });
  const g2 = nan.gerar;
  nan.gerar = function (s, o) {
    const ex = g2(s, o);
    ex.resolucao = [{ ...ex.resolucao[0], porque: 'Dá ' + (0 / 0) + '.' }];
    return ex;
  };
  assert.deepEqual(regras(verificar(nan, { sementes: 20 })), ['4']);

  const katex = defSoma({ formatos: ['numerica'] });
  const g3 = katex.gerar;
  katex.gerar = function (s, o) {
    const ex = g3(s, o);
    ex.resolucao = [{ ...ex.resolucao[0], calculo: '\\frac{' + ex.dados.a + '}{' }];
    return ex;
  };
  assert.deepEqual(regras(verificar(katex, { sementes: 20 })), ['4']);

  const cifrao = defSoma({ formatos: ['numerica'] });
  const g4 = cifrao.gerar;
  cifrao.gerar = function (s, o) {
    const ex = g4(s, o);
    ex.enunciado = 'Calcula $' + ex.dados.a + ' + ' + ex.dados.b + '.';
    return ex;
  };
  assert.deepEqual(regras(verificar(cifrao, { sementes: 20 })), ['4']);
});

test('regra 5: valores fora dos limites declarados', () => {
  const e = verificar(defSoma({ limites: (p) => p.dados.a <= 15 }), { sementes: 200 });
  assert.deepEqual(regras(e), ['5']);
});

test('regra 6: não determinismo (Math.random dentro de gerar)', () => {
  const mau = defSoma();
  const gerar = mau.gerar;
  mau.gerar = function (s, o) {
    const ex = gerar(s, o);
    ex.enunciado = ex.enunciado + (Math.random() < 0.5 ? '' : ' ');
    return ex;
  };
  assert.deepEqual(regras(verificar(mau, { sementes: 50 })), ['6']);
});

test('verificar reporta exceções de gerar e limita o número de mensagens', () => {
  const e = verificar(defSoma({ gerar() { throw new Error('rebentou'); } }), { sementes: 200 });
  assert.ok(e.some((x) => /rebentou/.test(x)));
  assert.ok(e.length <= 21);
});

test('escolhaDeErros: 4 opções distintas, a certa no índice registado, erros com opcao', () => {
  const A = G.ajudas;
  for (let s = 1; s <= 50; s++) {
    const rng = M.aleatorio.criar(s);
    const erros = [
      { codigo: 'a', texto: '3', explicacao: 'a' },
      { codigo: 'b', texto: '5', explicacao: 'b' }, // igual à certa: descartado
      { codigo: 'c', texto: '7', explicacao: 'c' },
      { codigo: 'd', texto: '3', explicacao: 'd' }, // repetido: descartado
      { codigo: 'e', texto: '9', explicacao: 'e' },
      { codigo: 'f', texto: '11', explicacao: 'f' }, // excedente
    ];
    const r = A.escolhaDeErros(rng, '5', erros);
    assert.equal(r.opcoes.length, 4);
    assert.equal(new Set(r.opcoes).size, 4);
    assert.equal(r.opcoes[r.correta], '5');
    assert.deepEqual(r.errosTipicos.map((e) => e.codigo).sort(), ['a', 'c', 'e']);
    for (const e of r.errosTipicos) {
      assert.notEqual(e.opcao, r.correta);
      assert.equal(r.opcoes[e.opcao], erros.find((x) => x.codigo === e.codigo).texto);
      assert.ok(!('texto' in e));
    }
  }
  assert.throws(() => A.escolhaDeErros(M.aleatorio.criar(1), '5', [{ codigo: 'a', texto: '5', explicacao: 'a' }]), /escolhaDeErros/);
});

test('vfDe, entre, diferenteDe e fmt', () => {
  const A = G.ajudas;
  const vistos = new Set();
  for (let s = 1; s <= 40; s++) {
    const v = A.vfDe(M.aleatorio.criar(s), 'certa', 'falsa', { codigo: 'x', explicacao: 'y' });
    vistos.add(v.correta);
    assert.equal(v.enunciado, v.correta ? 'certa' : 'falsa');
    assert.deepEqual(v.errosTipicos, v.correta ? [] : [{ codigo: 'x', explicacao: 'y' }]);
  }
  assert.deepEqual([...vistos].sort(), [false, true]);

  const rng = M.aleatorio.criar(9);
  for (let i = 0; i < 200; i++) {
    const x = A.entre(rng, -1, 1, 0.25);
    assert.ok(x >= -1 && x <= 1 && Number.isInteger(x * 4) && String(x).length <= 5);
    const n = A.entre(rng, 3, 5);
    assert.ok([3, 4, 5].includes(n));
    const d = A.diferenteDe(rng, (r) => A.entre(r, 0, 3), [0, 1, 2]);
    assert.equal(d, 3);
  }
  assert.throws(() => A.diferenteDe(rng, () => 1, [1]), /diferenteDe/);

  assert.equal(A.fmt(-2.5), '−2,5');
  assert.equal(A.fmt(1 / 3), '0,333');
  assert.equal(A.fmt(1 / 3, 2), '0,33');
  assert.equal(A.fmt(12.5, 2), '12,5');
  assert.equal(A.fmt(-0.001, 2), '0');
});

// ——— Ronda de correções 1: harness mais exigente ———

function comAlteracao(def, alterar) {
  const gerar = def.gerar;
  def.gerar = function (s, o) {
    const ex = gerar(s, o);
    alterar(ex, o);
    return ex;
  };
  return def;
}

test('tex: números para LaTeX ({,} decimal, \\, milhares, menos ASCII)', () => {
  const A = G.ajudas;
  assert.equal(A.tex(12345.5), '12\\,345{,}5');
  assert.equal(A.tex(-1.5), '-1{,}5');
  assert.equal(A.tex(1234), '1234');
  assert.equal(A.tex(1234567), '1\\,234\\,567');
  assert.equal(A.tex(100, 0), '100');
  assert.equal(A.tex(1 / 3, 2), '0{,}33');
  assert.equal(A.tex(-0.001, 2), '0');
});

test('regra 4: vírgula decimal sem {,} e espaços não ASCII dentro de fórmulas', () => {
  const virgula = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.enunciado = 'Calcula $2,5 + ' + ex.dados.a + '$.'; });
  assert.deepEqual(regras(verificar(virgula, { sementes: 10 })), ['4']);
  const nbsp = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.resolucao[0].calculo = '12 345 + ' + ex.dados.a; });
  assert.deepEqual(regras(verificar(nbsp, { sementes: 10 })), ['4']);
  const estreito = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.verificacao.calculo = '12 345'; });
  assert.deepEqual(regras(verificar(estreito, { sementes: 10 })), ['4']);
  // fora das fórmulas, a vírgula decimal é a norma
  const texto = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.enunciado += ' (2,5 não entra.)'; });
  assert.deepEqual(verificar(texto, { sementes: 10 }), []);
});

test('regra 4: + +, − +, −0 isolado, ∞ e Infinity', () => {
  for (const mau of ['x + +2', 'x − +2', 'vale −0.', 'tende para ∞', 'é Infinity']) {
    const d = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.resolucao[0].porque = 'Aqui ' + mau; });
    assert.deepEqual(regras(verificar(d, { sementes: 5 })), ['4'], mau);
  }
  const bom = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.resolucao[0].porque = 'Vale −0,5 e $x \\to +\\infty$; 10 − 3.'; });
  assert.deepEqual(verificar(bom, { sementes: 5 }), []);
});

test('regra 1: verificarIndependente que aceita tudo falha a mutação', () => {
  for (const def of [defSoma({ verificarIndependente: () => true }), defVf({ verificarIndependente: () => true })]) {
    const e = verificar(def, { sementes: 20 });
    assert.deepEqual(regras(e), ['1']);
    assert.ok(e.some((x) => /mutação/.test(x)));
  }
});

test('verificarIndependente e limites recebem cópias (não alteram a pergunta)', () => {
  const def = defSoma();
  const vi = def.verificarIndependente;
  def.verificarIndependente = (p) => { const r = vi(p); p.enunciado = 'NaN'; p.resposta = 0; return r; };
  def.limites = (p) => { p.opcoes = ['NaN']; return true; };
  assert.deepEqual(verificar(def, { sementes: 20 }), []);
});

test('chave canónica: opções iguais escritas de formas diferentes', () => {
  const A = G.ajudas;
  const k = A.chave('$-1{,}5$');
  for (const t of ['−1,5', '-1.5', ' −1,50 ', '$-1{,}50$']) assert.equal(A.chave(t), k, t);
  assert.notEqual(A.chave('1,5'), k);
  assert.equal(A.chave('$12\\,345$'), A.chave('12345'));
  assert.notEqual(A.chave('x + 1'), A.chave('x − 1'));
  assert.throws(() => A.escolhaDeErros(M.aleatorio.criar(1), '−3', [
    { codigo: 'a', texto: '$-3$', explicacao: 'a' }, { codigo: 'b', texto: '4', explicacao: 'b' }, { codigo: 'c', texto: '5', explicacao: 'c' },
  ]), /escolhaDeErros/);
  const mau = comAlteracao(defSoma({ formatos: ['escolha'] }), (ex) => {
    const i = (ex.correta + 2) % 4;
    ex.opcoes[i] = '$' + ex.opcoes[ex.correta].replace('−', '-') + '{,}0$';
  });
  assert.deepEqual(regras(verificar(mau, { sementes: 10 })), ['3']);
});

test('regra 3: número de opções = def.nOpcoes || 4', () => {
  const tres = defSoma({ formatos: ['escolha'] });
  tres.gerar = function (s, o) {
    const ex = defSoma().gerar(s, { ...o, formato: 'numerica' });
    const A = G.ajudas;
    const e = A.escolhaDeErros(o.rng, A.fmt(ex.resposta), ex.errosTipicos.map((x) => ({ ...x, texto: A.fmt(x.valor) })), 3);
    delete ex.resposta; delete ex.tolerancia;
    return { ...ex, ...e, verificacao: { ...ex.verificacao, valor: e.correta } };
  };
  assert.deepEqual(regras(verificar(tres, { sementes: 20 })), ['3']);
  assert.deepEqual(verificar({ ...tres, nOpcoes: 3 }, { sementes: 20 }), []);
});

test('regra 3: numérica sem erros típicos ou com dois erros do mesmo valor', () => {
  const sem = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => { ex.errosTipicos = []; });
  assert.deepEqual(regras(verificar(sem, { sementes: 5 })), ['3']);
  const iguais = comAlteracao(defSoma({ formatos: ['numerica'] }), (ex) => {
    ex.errosTipicos = [...ex.errosTipicos, { ...ex.errosTipicos[0], codigo: 'outro' }];
  });
  assert.deepEqual(regras(verificar(iguais, { sementes: 5 })), ['3']);
});

test('regra 3: vf falsa sem erro típico, ou sempre a mesma resposta', () => {
  const semErro = comAlteracao(defVf(), (ex) => { ex.errosTipicos = []; });
  assert.deepEqual(regras(verificar(semErro, { sementes: 50 })), ['3']);
  const sempre = defVf();
  sempre.gerar = function (s, o) {
    const n = 2 * G.ajudas.entre(o.rng, 1, 30);
    return {
      enunciado: 'O número ' + n + ' é par.', correta: true, errosTipicos: [],
      resolucao: [{ passo: 'Dividir por 2', porque: 'O resto é 0.' }],
      verificacao: { passo: 'Resto', calculo: n + ' \\bmod 2 = 0', valor: true },
      dados: { n },
    };
  };
  const e = verificar(sempre, { sementes: 50 });
  assert.deepEqual(regras(e), ['3']);
  assert.ok(e.some((x) => /sempre true/.test(x)));
  // com poucas sementes não se exige a distribuição
  assert.deepEqual(verificar(sempre, { sementes: 5 }), []);
});

test('niveis: o harness verifica cada nível declarado (por omissão só o 2)', () => {
  const porNivel = () => comAlteracao(defSoma({ formatos: ['numerica'] }), (ex, o) => { if (o.nivel === 0) ex.enunciado = 'undefined'; });
  assert.deepEqual(verificar(porNivel(), { sementes: 5 }), []);
  const e = verificar({ ...porNivel(), niveis: [0, 2] }, { sementes: 5 });
  assert.deepEqual(regras(e), ['4']);
  assert.ok(e.every((x) => /nivel 0/.test(x)));
});

test('registar valida disciplina/subtema/tipo/nome, niveis e nOpcoes; ids especiais não colidem', () => {
  for (const campo of ['disciplina', 'subtema', 'tipo', 'nome']) {
    assert.throws(() => G.registar({ ...defSoma(), id: 'x-' + campo, [campo]: '' }), new RegExp(campo));
  }
  assert.throws(() => G.registar({ ...defSoma(), id: 'x-niveis', niveis: [3] }), /niveis/);
  assert.throws(() => G.registar({ ...defSoma(), id: 'x-nopcoes', nOpcoes: 1 }), /nOpcoes/);
  assert.equal(G.obter('toString'), undefined);
  G.registar({ ...defSoma(), id: 'constructor' });
  assert.equal(G.obter('constructor').id, 'constructor');
});

test('CLI: --min N falha quando há menos geradores', () => {
  const { spawnSync } = require('node:child_process');
  const correr = (...args) => spawnSync(process.execPath, [CAMINHO_HARNESS, '--sementes', '1', ...args], { encoding: 'utf8' });
  assert.equal(correr().status, 0);
  const r = correr('--min', '100000');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /pelo menos 100000/);
});
