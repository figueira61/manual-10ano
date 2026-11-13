const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let validar;

let contador = 0;

beforeEach(() => {
  contador = 0;
  carregar('js/nucleo.js');
  delete require.cache[require.resolve('../tools/validar-conteudos.js')];
  ({ validar } = require('../tools/validar-conteudos.js'));
});

const escolha = () => ({
  id: 's1-q' + String(++contador).padStart(2, '0'),
  tipo: 'escolha',
  enunciado: 'Qual?',
  opcoes: ['a', 'b', 'c'],
  correta: 1,
  explicacao: 'x',
});

function base() {
  return {
    indice: [
      {
        id: 'mat',
        nome: 'Matemática',
        disponivel: true,
        temas: [{ id: 't1', titulo: 'Tema', subtemas: [{ id: 's1', titulo: 'Sub', palavras: [] }] }],
      },
    ],
    temas: {
      mat: [
        {
          id: 't1',
          subtemas: [
            {
              id: 's1',
              titulo: 'Sub',
              ae: ['AE1'],
              minutos: 10,
              essencial: [{ tipo: 'texto', texto: 'olá' }],
              resumo: ['r'],
              quiz: [escolha(), escolha(), escolha(), escolha()],
            },
          ],
        },
      ],
    },
    ae: { mat: ['AE1'] },
    existeFicheiro: () => true,
  };
}

const sub = (c) => c.temas.mat[0].subtemas[0];

function esperaErro(c, regex) {
  const erros = validar(c);
  assert.ok(erros.length > 0, 'esperava erros');
  assert.ok(erros.some((e) => regex.test(e)), erros.join('\n'));
  for (const e of erros) assert.match(e, /mat\/t1\/s1|mat\/t1|mat/);
  return erros;
}

test('conteúdo mínimo válido não tem erros', () => {
  assert.deepEqual(validar(base()), []);
});

test('regra 1: subtema do índice em falta no ficheiro de tema', () => {
  const c = base();
  c.indice[0].temas[0].subtemas.push({ id: 's2', titulo: 'Outro', palavras: [] });
  const erros = esperaErro(c, /s2/);
  assert.ok(erros.some((e) => e.includes('mat/t1/s2')));
});

test('regra 1: subtema no ficheiro e não no índice', () => {
  const c = base();
  c.temas.mat[0].subtemas.push({ ...sub(c), id: 's9' });
  esperaErro(c, /mat\/t1\/s9/);
});

test('regra 1: tema do índice sem ficheiro e tema extra no ficheiro', () => {
  const c = base();
  c.indice[0].temas.push({ id: 't2', titulo: 'T2', subtemas: [] });
  esperaErro(c, /mat\/t2/);
  const d = base();
  d.temas.mat.push({ id: 't3', subtemas: [] });
  esperaErro(d, /mat\/t3/);
});

test('regra 1: ids de subtema duplicados no tema', () => {
  const c = base();
  c.temas.mat[0].subtemas.push({ ...sub(c) });
  esperaErro(c, /duplicad/);
});

test('regra 7: pergunta sem id', () => {
  const c = base();
  delete sub(c).quiz[1].id;
  esperaErro(c, /sem id/);
});

test('regra 7: id repetido na disciplina', () => {
  const c = base();
  sub(c).quiz[1].id = sub(c).quiz[0].id;
  esperaErro(c, /id de pergunta repetido/);
});

test('regra 7: id fora do formato', () => {
  for (const mau of ['s1-q1', 'S1-q01', 's1_q01', 's1-q001', 'q01']) {
    const c = base();
    sub(c).quiz[0].id = mau;
    esperaErro(c, /formato/);
  }
});

test('regra 2: campos obrigatórios em falta', () => {
  for (const [campo, valor] of [
    ['titulo', ''],
    ['ae', []],
    ['minutos', undefined],
    ['essencial', []],
    ['resumo', []],
  ]) {
    const c = base();
    sub(c)[campo] = valor;
    const erros = esperaErro(c, new RegExp(campo));
    assert.ok(erros.some((e) => e.includes('mat/t1/s1')));
  }
});

test('regra 2: quiz com menos de 4 ou mais de 6 perguntas', () => {
  const c = base();
  sub(c).quiz = [escolha(), escolha(), escolha()];
  esperaErro(c, /4.6 perguntas/);
  const d = base();
  sub(d).quiz = Array.from({ length: 7 }, escolha);
  esperaErro(d, /4.6 perguntas/);
});

test('regra 3: escolha com correta fora do intervalo ou não inteira', () => {
  const c = base();
  sub(c).quiz[0].correta = 3;
  esperaErro(c, /mat\/t1\/s1.*correta/);
  const d = base();
  sub(d).quiz[0].correta = 1.5;
  esperaErro(d, /correta/);
});

test('regra 3: escolha com opções duplicadas', () => {
  const c = base();
  sub(c).quiz[0].opcoes = ['a', 'a', 'c'];
  esperaErro(c, /duplicad/);
});

const numerica = (extra) => ({
  id: 's1-q01',
  tipo: 'numerica',
  enunciado: 'Quanto?',
  resposta: 10,
  resolucao: ['passo'],
  explicacao: 'x',
  verificar: () => 10,
  ...extra,
});

test('regras 4 e 5: numérica válida passa', () => {
  const c = base();
  sub(c).quiz[0] = numerica();
  assert.deepEqual(validar(c), []);
});

test('regra 4: numérica ou calculo:true sem resolucao', () => {
  const c = base();
  sub(c).quiz[0] = numerica({ resolucao: [] });
  esperaErro(c, /resolucao/);
  const d = base();
  sub(d).quiz[0] = { ...escolha(), calculo: true };
  esperaErro(d, /resolucao/);
});

test('regra 5: verificar não coincide com resposta', () => {
  const c = base();
  sub(c).quiz[0] = numerica({ verificar: () => 11 });
  esperaErro(c, /não coincide/);
});

test('regra 5: tolerância permite diferença; fronteira exata aceite', () => {
  const c = base();
  sub(c).quiz[0] = numerica({ resposta: 0.3, tolerancia: 0.1, verificar: () => 0.4 });
  assert.deepEqual(validar(c), []);
});

test('regra 5: verificar ausente ou que lança é erro, não crash', () => {
  const c = base();
  sub(c).quiz[0] = numerica({ verificar: undefined });
  esperaErro(c, /verificar/);
  const d = base();
  sub(d).quiz[0] = numerica({
    verificar: () => {
      throw new Error('boom');
    },
  });
  esperaErro(d, /boom/);
});

test('regra 5: bloco exemplo com resultado e verificar', () => {
  const c = base();
  sub(c).essencial.push({ tipo: 'exemplo', resultado: 5, verificar: () => 6 });
  esperaErro(c, /não coincide/);
  const d = base();
  sub(d).essencial.push({ tipo: 'exemplo', resultado: 5, verificar: () => 5 });
  assert.deepEqual(validar(d), []);
});

test('regra 6: esquema sem ficheiro', () => {
  const c = base();
  sub(c).essencial.push({ tipo: 'esquema', id: 'calculo-x', opcoes: {}, legenda: 'l' });
  c.existeFicheiro = (p) => p !== 'esquemas/mat/calculo-x.js';
  esperaErro(c, /calculo-x/);
  c.existeFicheiro = () => true;
  assert.deepEqual(validar(c), []);
});

test('regra 7: tipo de bloco desconhecido', () => {
  const c = base();
  sub(c).essencial.push({ tipo: 'video' });
  esperaErro(c, /video/);
});

test('regra 8: objetivo AE não coberto', () => {
  const c = base();
  c.ae.mat.push('AE2');
  const erros = esperaErro(c, /AE2/);
  assert.ok(erros.some((e) => e.includes('mat')));
});

test('id de disciplina reservado (rota) falha', () => {
  const c = base();
  c.indice[0].id = 'entrar';
  c.temas.entrar = c.temas.mat;
  c.ae.entrar = c.ae.mat;
  const erros = validar(c);
  assert.ok(erros.some((e) => /entrar.*reservad/.test(e)), erros.join('\n'));
});

// ---------- M4: errosTipicos ----------
test('M4: errosTipicos válidos passam (numérica e escolha)', () => {
  const c = base();
  sub(c).quiz[0] = numerica({ errosTipicos: [{ codigo: 'sinal_trocado', valor: -10, explicacao: 'x' }] });
  sub(c).quiz[1].errosTipicos = [{ codigo: 'ordem_2', opcao: 2, explicacao: 'y' }];
  assert.deepEqual(validar(c), []);
});
test('M4: codigo vazio, longo ou com caracteres inválidos', () => {
  for (const codigo of ['', 'a'.repeat(81), 'Sinal-Trocado', undefined]) {
    const c = base();
    sub(c).quiz[1].errosTipicos = [{ codigo, opcao: 2, explicacao: 'y' }];
    esperaErro(c, /mat\/t1\/s1.*codigo/);
  }
  const ok = base();
  sub(ok).quiz[1].errosTipicos = [{ codigo: 'a'.repeat(80), opcao: 2, explicacao: 'y' }];
  assert.deepEqual(validar(ok), []);
});
test('M4: explicacao vazia', () => {
  const c = base();
  sub(c).quiz[1].errosTipicos = [{ codigo: 'x', opcao: 2, explicacao: '' }];
  esperaErro(c, /explicacao/);
});
test('M4: numérica com valor não finito ou dentro da tolerância da resposta', () => {
  for (const valor of [Infinity, NaN, '3', 10, 10.05]) {
    const c = base();
    sub(c).quiz[0] = numerica({ tolerancia: 0.1, errosTipicos: [{ codigo: 'x', valor, explicacao: 'e' }] });
    esperaErro(c, /valor/);
  }
});
test('M4: escolha com opcao fora do intervalo, não inteira ou igual à correta', () => {
  for (const opcao of [3, -1, 1.5, 1, undefined]) {
    const c = base();
    sub(c).quiz[1].errosTipicos = [{ codigo: 'x', opcao, explicacao: 'e' }];
    esperaErro(c, /opcao/);
  }
});
test('M4: errosTipicos que não é lista', () => {
  const c = base();
  sub(c).quiz[1].errosTipicos = { codigo: 'x' };
  esperaErro(c, /errosTipicos/);
});
