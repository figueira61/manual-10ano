const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');

let Manual;

beforeEach(() => {
  Manual = carregar('js/nucleo.js', 'js/router.js');
});

test('hash vazio ou só "#/" é o início', () => {
  assert.deepEqual(Manual.router.analisar(''), { vista: 'inicio' });
  assert.deepEqual(Manual.router.analisar('#/'), { vista: 'inicio' });
});

test('#/mat-a é uma disciplina', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a'), { vista: 'disciplina', disciplina: 'mat-a' });
});

test('#/mat-a/resumos são os resumos da disciplina', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/resumos'), { vista: 'resumos', disciplina: 'mat-a' });
});

test('#/mat-a/funcoes é um tema', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/funcoes'), {
    vista: 'tema',
    disciplina: 'mat-a',
    tema: 'funcoes',
  });
});

test('#/mat-a/funcoes/quadratica é um subtema', () => {
  assert.deepEqual(Manual.router.analisar('#/mat-a/funcoes/quadratica'), {
    vista: 'subtema',
    disciplina: 'mat-a',
    tema: 'funcoes',
    subtema: 'quadratica',
  });
});

test('#/pesquisa?q=... é pesquisa com o termo decodificado', () => {
  assert.deepEqual(Manual.router.analisar('#/pesquisa?q=parab%C3%B3la'), {
    vista: 'pesquisa',
    termo: 'parabóla',
  });
});

test('mais de 3 segmentos é naoEncontrado', () => {
  assert.equal(Manual.router.analisar('#/mat-a/a/b/c').vista, 'naoEncontrado');
});

test('segmento com maiúsculas ou espaços é naoEncontrado', () => {
  assert.equal(Manual.router.analisar('#/MAT A').vista, 'naoEncontrado');
  assert.equal(Manual.router.analisar('#/mat-a/Funcoes').vista, 'naoEncontrado');
});

test('caminho inverte analisar para os formatos suportados', () => {
  const hashes = [
    '#/',
    '#/mat-a',
    '#/mat-a/resumos',
    '#/mat-a/funcoes',
    '#/mat-a/funcoes/quadratica',
    '#/pesquisa?q=x%20y',
  ];
  for (const h of hashes) {
    assert.equal(Manual.router.caminho(Manual.router.analisar(h)), h, h);
  }
});

test('caminho codifica o termo de pesquisa', () => {
  assert.equal(
    Manual.router.caminho({ vista: 'pesquisa', termo: 'parabóla' }),
    '#/pesquisa?q=parab%C3%B3la'
  );
});

test('nomes reservados são vistas de um só segmento', () => {
  for (const nome of ['entrar', 'registar', 'conta', 'privacidade', 'progresso', 'treino', 'teste', 'encarregado']) {
    assert.deepEqual(Manual.router.analisar('#/' + nome), { vista: nome });
    assert.equal(Manual.router.caminho({ vista: nome }), '#/' + nome);
  }
  assert.deepEqual(Manual.router.analisar('#/mat-a'), { vista: 'disciplina', disciplina: 'mat-a' });
  assert.deepEqual(Manual.router.analisar('#/conta/x'), { vista: 'tema', disciplina: 'conta', tema: 'x' });
});

test('regresso do email de confirmação (hash do Supabase) vai para o início', () => {
  const hashes = [
    '#access_token=abc&refresh_token=def&type=signup',
    '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
    '#error_description=x',
    '#type=recovery',
  ];
  for (const h of hashes) assert.deepEqual(Manual.router.analisar(h), { vista: 'inicio' }, h);
});

test('erroAutenticacao lê o erro do hash do Supabase; null nos outros casos', () => {
  assert.deepEqual(
    Manual.router.erroAutenticacao('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'),
    { erro: 'access_denied', codigo: 'otp_expired', descricao: 'Email link is invalid or has expired' }
  );
  assert.deepEqual(Manual.router.erroAutenticacao('#error_description=Algo%20falhou'), { erro: null, codigo: null, descricao: 'Algo falhou' });
  assert.equal(Manual.router.erroAutenticacao('#access_token=abc&type=signup'), null);
  assert.equal(Manual.router.erroAutenticacao('#/mat-a'), null);
  assert.equal(Manual.router.erroAutenticacao(''), null);
});
