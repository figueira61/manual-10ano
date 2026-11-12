const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let validar;

beforeEach(() => {
  carregar('js/nucleo.js');
  delete require.cache[require.resolve('../tools/validar-conteudos.js')];
  ({ validar } = require('../tools/validar-conteudos.js'));
});

const escolha = () => ({
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
