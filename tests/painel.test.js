const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { carregar } = require('./ajuda.js');

const RAIZ = path.join(__dirname, '..');
const PASTA = path.join(RAIZ, 'js', 'geradores', 'mat-a');
const SNAPSHOT = path.join(__dirname, 'fixtures', 'erros-humanizados.txt');

function M() {
  const temas = fs.readdirSync(PASTA).filter((x) => x.endsWith('.js')).sort().map((x) => 'js/geradores/mat-a/' + x);
  return carregar('js/nucleo.js', 'conteudos/indice.js', 'js/aprendizagem.js', 'js/geradores/registo.js', 'js/geradores/ajudas.js', ...temas, 'js/treino.js', 'js/painel.js');
}

// Mesma leitura estática de «codigo: …» que geradores-codigos.test.js; ignora fragmentos de códigos compostos (p. ex. 'escolheu_' + x).
function codigos() {
  const t = new Set();
  for (const f of fs.readdirSync(PASTA).filter((x) => x.endsWith('.js')).sort()) {
    const s = fs.readFileSync(path.join(PASTA, f), 'utf8');
    for (const m of s.matchAll(/codigo: ([^,}]+)/g)) for (const q of m[1].matchAll(/'([a-z0-9_]+)'/g)) t.add(q[1]);
    for (const m of s.matchAll(/^\s+([a-z][a-z0-9_]*): '/gm)) if (/_/.test(m[1])) t.add(m[1]);
  }
  // Famílias construídas em tempo de execução: 'escolheu_' + ponto notável e 'nao_viu_' + método de amostragem.
  const geo = fs.readFileSync(path.join(PASTA, 'geometria-sintetica.js'), 'utf8');
  const pontos = geo.slice(geo.indexOf('const PONTOS = {'), geo.indexOf('const CHAVES_PONTOS'));
  for (const m of pontos.matchAll(/^    ([a-z]+): \{/gm)) t.add('escolheu_' + m[1]);
  const est = fs.readFileSync(path.join(PASTA, 'estatistica.js'), 'utf8');
  for (const m of est.matchAll(/\{ codigo: '([a-z_]+)', texto: \(n\) =>/g)) t.add('nao_viu_' + m[1]);
  return [...t].filter((c) => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(c)).sort();
}

const PARTILHADOS = ['nao_dividiu', 'dividiu_por_2', 'dividiu_ao_contrario', 'esqueceu_raiz', 'sem_raiz', 'subtraiu_ao_contrario',
  'sinal_trocado', 'soma_catetos', 'subtraiu_coordenadas', 'nao_dividiu_por_2', 'razao_invertida'];

test('todos os códigos dos geradores dão um texto simples', () => {
  const { painel } = M();
  const cs = codigos();
  assert.ok(cs.length > 300);
  for (const c of cs) {
    const t = painel.humanizarErro(c);
    assert.ok(t && !t.includes('_') && t === t.charAt(0).toUpperCase() + t.slice(1), c + ' -> ' + t);
  }
});

test('o mapa de exceções cobre os códigos partilhados', () => {
  const { painel } = M();
  for (const c of PARTILHADOS) assert.ok(c in painel.EXCECOES, c);
});

test('o texto de cada código bate com o snapshot (ATUALIZAR_SNAPSHOT=1 para o regenerar)', () => {
  const { painel } = M();
  const atual = codigos().map((c) => c + ' → ' + painel.humanizarErro(c)).join('\n') + '\n';
  if (process.env.ATUALIZAR_SNAPSHOT) {
    fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
    fs.writeFileSync(SNAPSHOT, atual);
  }
  assert.ok(fs.existsSync(SNAPSHOT), 'falta o snapshot; corre: ATUALIZAR_SNAPSHOT=1 node --test tests/painel.test.js');
  assert.equal(fs.readFileSync(SNAPSHOT, 'utf8'), atual, 'snapshot desatualizado; corre: ATUALIZAR_SNAPSHOT=1 node --test tests/painel.test.js e relê o ficheiro');
});

test('humanizarErro usa a forma acentuada', () => {
  const { painel } = M();
  assert.equal(painel.humanizarErro('nao_dividiu_por_2'), 'Não dividiu por 2');
  assert.equal(painel.humanizarErro('divisao_trocada'), 'Divisão trocada');
  assert.equal(painel.humanizarErro('media_dos_tercos'), 'Média dos terços');
  assert.equal(painel.humanizarErro('xpto_qualquer'), 'Xpto qualquer');
});

test('rotuloEstado: texto e classe, também sem estado', () => {
  const { painel } = M();
  assert.deepEqual(painel.rotuloEstado('domina'), { texto: 'Domina', classe: 'estado-domina' });
  assert.deepEqual(painel.rotuloEstado('dificuldade'), { texto: 'Com dificuldade', classe: 'estado-dificuldade' });
  assert.deepEqual(painel.rotuloEstado('nao_resolvido'), { texto: 'Não conseguiu resolver', classe: 'estado-nao-resolvido' });
  assert.deepEqual(painel.rotuloEstado(null), { texto: 'Sem tentativas', classe: 'estado-sem' });
});

function totalSubtemas(indice) {
  let n = 0;
  indice.filter((d) => d.disponivel).forEach((d) => d.temas.forEach((t) => { n += t.subtemas.length; }));
  return n;
}

test('modelo sem dados: tudo «sem tentativas», 4 semanas a zero', () => {
  const Manual = M();
  const agora = new Date('2026-11-14T12:00:00Z'); // sábado
  const m = Manual.painel.modelo([], [], Manual.indice, agora);
  assert.equal(m.contagens.sem, totalSubtemas(Manual.indice));
  assert.equal(m.contagens.domina + m.contagens.dificuldade + m.contagens.nao_resolvido, 0);
  assert.deepEqual(m.erros, []);
  assert.equal(m.evolucao.length, 4);
  assert.deepEqual(m.evolucao.map((s) => s.semana), ['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09']);
  assert.ok(m.evolucao.every((s) => s.tentativas === 0 && s.certas === 0));
  assert.equal(m.ultimaAtividade, null);
  assert.ok(m.sugestoes.length > 0);
  m.disciplinas.forEach((d) => d.temas.forEach((t) => t.subtemas.forEach((s) => {
    assert.equal(s.estado, null);
    assert.equal(s.proxima_revisao, null);
  })));
});

function tent(extra) {
  return Object.assign({
    disciplina: 'mat-a', tema: 't', subtema: 's', tipo: 'x', semente: 1, formato: 'numerica', modo: 'treino',
    resultado: 'certa', erro_tipico: null, criado_em: '2026-11-10T10:00:00Z',
  }, extra);
}

test('uma tentativa de segunda-feira às 23:30 em Lisboa conta nessa semana', () => {
  const Manual = M();
  const agora = new Date('2026-11-14T12:00:00Z');
  // 2026-11-09 é segunda-feira; 23:30Z = 23:30 em Lisboa (inverno, UTC+0)
  const m = Manual.painel.modelo([tent({ criado_em: '2026-11-09T23:30:00Z' })], [], Manual.indice, agora);
  assert.equal(m.evolucao[3].semana, '2026-11-09');
  assert.equal(m.evolucao[3].tentativas, 1);
  assert.equal(m.evolucao[3].certas, 1);
});

test('em horário de verão, 23:30 UTC de domingo já é segunda-feira em Lisboa', () => {
  const Manual = M();
  const agora = new Date('2026-07-15T12:00:00Z');
  // 2026-07-12 (domingo) 23:30Z = 2026-07-13 00:30 em Lisboa (segunda-feira)
  const m = Manual.painel.modelo([tent({ criado_em: '2026-07-12T23:30:00Z', resultado: 'errada' })], [], Manual.indice, agora);
  const semana = m.evolucao.find((s) => s.semana === '2026-07-13');
  assert.equal(semana.tentativas, 1);
  assert.equal(semana.certas, 0);
});

test('tentativas fora das últimas 4 semanas não contam; ultimaAtividade é o maior criado_em', () => {
  const Manual = M();
  const agora = new Date('2026-11-14T12:00:00Z');
  const m = Manual.painel.modelo([
    tent({ criado_em: '2026-09-01T10:00:00Z' }),
    tent({ criado_em: '2026-11-12T08:00:00Z' }),
    tent({ criado_em: '2026-11-03T08:00:00Z' }),
  ], [], Manual.indice, agora);
  assert.equal(m.evolucao.reduce((n, s) => n + s.tentativas, 0), 2);
  assert.equal(m.ultimaAtividade, '2026-11-12T08:00:00Z');
});

test('estados entram nos subtemas e nas contagens; erros com nome do gerador', () => {
  const Manual = M();
  const agora = new Date('2026-11-14T12:00:00Z');
  const d = Manual.indice.find((x) => x.disponivel);
  const t0 = d.temas[0];
  const chave = d.id + '/' + t0.id + '/' + t0.subtemas[0].id;
  const total = totalSubtemas(Manual.indice);
  const gerador = Manual.geradores.todos()[0];
  const m = Manual.painel.modelo([
    tent({ tipo: gerador.id, resultado: 'errada', erro_tipico: 'nao_dividiu_por_2', criado_em: '2026-11-11T10:00:00Z' }),
    tent({ tipo: 'inexistente', resultado: 'errada', erro_tipico: 'nao_dividiu_por_2', criado_em: '2026-11-12T10:00:00Z' }),
    tent({ tipo: 'inexistente', resultado: 'errada', erro_tipico: 'sem_raiz', criado_em: '2026-11-12T11:00:00Z' }),
  ], [{ chave, estado: 'dificuldade', proxima_revisao: '2026-11-15' }], Manual.indice, agora);
  assert.equal(m.contagens.dificuldade, 1);
  assert.equal(m.contagens.sem, total - 1);
  const sub = m.disciplinas.find((x) => x.id === d.id).temas[0].subtemas[0];
  assert.deepEqual(sub, { chave, titulo: t0.subtemas[0].titulo, estado: 'dificuldade', proxima_revisao: '2026-11-15' });
  assert.equal(m.erros[0].codigo, 'nao_dividiu_por_2');
  assert.equal(m.erros[0].contagem, 2);
  assert.equal(m.erros[0].texto, 'Não dividiu por 2');
  assert.equal(m.erros[0].onde, ''); // a mais recente com este código não é de um gerador
  assert.equal(m.erros[1].onde, '');
  const so = Manual.painel.modelo([tent({ tipo: gerador.id, resultado: 'errada', erro_tipico: 'sem_raiz' })], [], Manual.indice, agora);
  assert.equal(so.erros[0].onde, gerador.nome);
});

test('erros: no máximo 5', () => {
  const Manual = M();
  const ts = ['a_1', 'b_2', 'c_3', 'd_4', 'e_5', 'f_6', 'g_7'].map((c, i) => tent({ resultado: 'errada', erro_tipico: c, criado_em: '2026-11-1' + (i % 3) + 'T10:00:00Z' }));
  assert.equal(Manual.painel.modelo(ts, [], Manual.indice, new Date('2026-11-14T12:00:00Z')).erros.length, 5);
});

test('os códigos construídos em tempo de execução estão no snapshot e têm texto próprio', () => {
  const { painel } = M();
  const cs = codigos();
  const esperados = {
    escolheu_incentro: 'Escolheu o incentro', escolheu_circuncentro: 'Escolheu o circuncentro',
    escolheu_ortocentro: 'Escolheu o ortocentro', escolheu_baricentro: 'Escolheu o baricentro',
    nao_viu_conveniencia: 'Não viu que a amostra era por conveniência',
    nao_viu_resposta_voluntaria: 'Não viu que a amostra era de resposta voluntária',
  };
  for (const c of Object.keys(esperados)) {
    assert.ok(cs.includes(c), c + ' falta na recolha');
    assert.equal(painel.humanizarErro(c), esperados[c]);
  }
});

test('textos de erro sem números de um exercício concreto e sem frases soltas', () => {
  const { painel } = M();
  const vagos = ['metade', 'um_terco', 'intervalo_aberto', 'media_dos_valores', 'ordem_trocada', 'maioria_simples', 'esqueceu_a', 'esqueceu_somar_a'];
  for (const c of vagos) {
    const t = painel.humanizarErro(c);
    assert.ok(/^(Deu|Tomou|Deixou|Fez|Subtraiu|Esqueceu|Escolheu)/.test(t) && t.split(' ').length >= 5, c + ' -> ' + t);
  }
  for (const c of codigos()) {
    const t = painel.humanizarErro(c);
    if (c in painel.EXCECOES) assert.ok(!/(32|1,8|11 %)/.test(t) || c === 'taxa_1_1', c + ' -> ' + t);
  }
});
