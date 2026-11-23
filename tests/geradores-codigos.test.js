// Códigos de erro típico: cada código quer dizer uma só coisa em todos os temas (ficam guardados nas tentativas).
// Um código usado por geradores de temas diferentes só é aceite se constar de PARTILHADOS, com o seu significado.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Todas as pastas de temas de geradores (mat-a, fqa, …): um código partilhado entre disciplinas também tem de ter o mesmo significado.
const BASE = path.join(__dirname, '..', 'js', 'geradores');
const FICHEIROS = fs.readdirSync(BASE, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  .flatMap((d) => fs.readdirSync(path.join(BASE, d)).filter((x) => x.endsWith('.js')).sort().map((f) => path.join(BASE, d, f)));

// Códigos com o mesmo significado em mais de um tema.
const PARTILHADOS = {
  nao_dividiu: 'faltou a divisão final (por n − 1, pelo coeficiente…)',
  dividiu_por_2: 'dividiu por 2 onde não devia (expoente tratado como fator, média de 3 pontos)',
  dividiu_ao_contrario: 'fez a divisão com dividendo e divisor trocados',
  esqueceu_raiz: 'faltou a raiz quadrada (variância em vez de desvio padrão, x² = k sem raiz)',
  sem_raiz: 'deu o quadrado da medida em vez da medida (faltou a raiz quadrada)',
  subtraiu_ao_contrario: 'fez a subtração pela ordem trocada (Q₁ − Q₃, A − P)',
  sinal_trocado: 'passou um termo para o outro membro sem trocar o sinal',
  soma_catetos: 'somou os catetos em vez de aplicar o teorema de Pitágoras',
  subtraiu_coordenadas: 'subtraiu as coordenadas em vez de as somar (ponto médio)',
  nao_dividiu_por_2: 'somou as coordenadas sem dividir por 2 (ponto médio)',
  razao_invertida: 'inverteu uma razão (proporção ou razão de Euler)',
  multiplicou_em_vez_de_dividir: 'multiplicou onde devia dividir (abcissa pelo fator, picómetros por 1000)',
  dividiu_em_vez_de_multiplicar: 'dividiu onde devia multiplicar (quantidade pela massa molar, R por I)',
  massa_em_gramas: 'usou a massa em gramas em vez de quilogramas',
  tempo_em_minutos: 'usou o tempo em minutos onde devia usar segundos',
  confundiu_potencia_com_energia: 'deu a potência em vez da energia (faltou multiplicar pelo tempo)',
  rendimento_maior_do_que_1: 'obteve um rendimento acima de 100 % (dividiu ao contrário)',
  deu_a_fracao_dissipada: 'deu a fração dissipada em vez do rendimento',
  nao_dividiu_a_percentagem_por_100: 'usou a percentagem sem a dividir por 100',
  converteu_minutos_em_segundos_com_3600: 'multiplicou os minutos por 3600 para os passar a segundos',
};

// Tabela código → ficheiros de geradores que o usam (leitura estática de «codigo: …», incluindo ternários).
function tabela() {
  const t = {};
  for (const abs of FICHEIROS) {
    const f = path.basename(abs);
    const s = fs.readFileSync(abs, 'utf8');
    for (const m of s.matchAll(/codigo: ([^,}]+)/g)) {
      for (const q of m[1].matchAll(/'([a-z0-9_]+)'/g)) (t[q[1]] = t[q[1]] || new Set()).add(f);
    }
    // Códigos como chaves de um objeto de explicações (p. ex. plano-condicoes-pertence).
    for (const m of s.matchAll(/^\s+([a-z][a-z0-9_]*): '/gm)) if (/_/.test(m[1])) (t[m[1]] = t[m[1]] || new Set()).add(f);
  }
  return t;
}

test('a tabela de códigos lê os ficheiros de geradores', () => {
  const t = tabela();
  assert.ok(Object.keys(t).length > 300);
  assert.deepEqual([...t.sinal_do_declive_trocado], ['estatistica.js']);
  assert.deepEqual([...t.dois_tercos_dos_votos], ['cidadania.js']);
  assert.deepEqual([...t.dois_tercos], ['geometria-sintetica.js']);
});

test('nenhum código de erro é partilhado por temas diferentes com outro significado', () => {
  const t = tabela();
  const maus = Object.entries(t).filter(([c, fs_]) => fs_.size > 1 && !(c in PARTILHADOS)).map(([c, fs_]) => c + ': ' + [...fs_].join(', '));
  assert.deepEqual(maus, []);
  // A lista de partilhados não fica desatualizada: cada um é mesmo usado em mais de um tema.
  for (const c of Object.keys(PARTILHADOS)) assert.ok(t[c] && t[c].size > 1, c + ' já não é partilhado');
});
