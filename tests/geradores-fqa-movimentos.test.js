// Geradores de Física — Energia e movimentos (js/geradores/fqa/fisica-movimentos.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { verificar, carregarTudo } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
require('../js/quiz.js');
require('../js/aprendizagem.js');
const G = M.geradores;

const IDS = [
  'sistema-mecanico-ec-epg', 'sistema-mecanico-energia-mecanica', 'sistema-mecanico-massa-velocidade',
];
const SUBTEMAS = ['sistema-mecanico'];
const defs = () => G.todos().filter((d) => d.disciplina === 'fqa' && d.tema === 'movimentos');
function* itens(id, sementes) {
  const d = G.obter(id);
  for (const formato of d.formatos) for (const contexto of G.contextosDe(d)) for (let s = 1; s <= sementes; s++) {
    yield G.gerar(id, s, { formato, contexto });
  }
}
const certa = (p) => p.opcoes[p.correta];
const textos = (p) => [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque + ' ' + (r.calculo || '')), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.calculo]);

test('regista os geradores de energia e movimentos, ≥ 3 por subtema, cada um com ≥ 2 formatos ou ≥ 2 contextos', () => {
  assert.deepEqual(defs().map((d) => d.id), IDS);
  for (const sub of SUBTEMAS) assert.ok(G.doSubtema('fqa', sub).length >= 3, sub);
  for (const d of defs()) {
    assert.equal(d.id, d.subtema + '-' + d.tipo);
    assert.ok(SUBTEMAS.includes(d.subtema), d.id);
    assert.ok(d.formatos.length >= 2 || G.contextosDe(d).length >= 2, d.id);
  }
});

for (const id of IDS) {
  test('gerador ' + id + ' passa a verificação (200 sementes)', () => {
    assert.deepEqual(verificar(G.obter(id), { sementes: 200 }), []);
  });
}

// Snapshots da semente 1 (primeiro formato e primeiro contexto), conferidos à mão.
test('snapshots da semente 1', () => {
  const g = (id) => G.gerar(id, 1);
  let p = g('sistema-mecanico-ec-epg');
  assert.match(p.enunciado, /massa total de \$60\\,\\mathrm\{kg\}\$\), que se move a \$36\\,\\mathrm\{km\\,h\^\{-1\}\}/);
  assert.equal(p.resposta, 3000); // ½ × 60 × 10²
  assert.equal(p.errosTipicos.find((e) => e.codigo === 'velocidade_em_km_h').valor, 38900); // ½ × 60 × 36² = 38 880
  p = g('sistema-mecanico-energia-mecanica');
  assert.match(p.enunciado, /0\{,\}2\\,\\mathrm\{kg\}\$ move-se a \$15/);
  assert.equal(p.resposta, 34.5); // ½ × 0,2 × 15² + 0,2 × 10 × 6 = 22,5 + 12
  p = g('sistema-mecanico-massa-velocidade');
  assert.match(p.enunciado, /1920\\,\\mathrm\{J\}/);
  assert.equal(p.resposta, 8); // √(2 × 1920 / 60)
});

test('nenhuma opção, resposta ou texto contém NaN ou Infinity', () => {
  for (const id of IDS) for (const p of itens(id, 60)) {
    if (p.formato === 'numerica') assert.ok(Number.isFinite(p.resposta), id);
    for (const t of textos(p)) assert.ok(!/NaN|Infinity|undefined/.test(String(t)), id + ': ' + t);
    for (const e of p.errosTipicos) if (e.valor !== undefined) assert.ok(Number.isFinite(e.valor), id + ' ' + e.codigo);
  }
});

test('uma resposta 0 (ou em branco) nunca é tomada por um erro típico', () => {
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 80; s++) {
      const q = G.gerar(id, s, { formato: 'numerica', contexto });
      assert.equal(M.aprendizagem.detetarErro(q, '0'), null, id + ' ' + contexto + ' ' + s);
      if (Math.abs(q.resposta) >= 1e4) assert.ok(q.toleranciaRelativa > 0 && q.tolerancia === undefined, id + ' ' + s);
    }
  }
});

test('«com três algarismos significativos»: algarismos = 3 e a resposta já arredondada', () => {
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 30; s++) {
      const p = G.gerar(id, s, { formato: 'numerica', contexto });
      const pede = /três algarismos significativos/.test(p.enunciado);
      assert.equal(p.algarismos === 3, pede, id + ' ' + contexto + ' ' + s);
      if (pede) assert.equal(Number(p.resposta.toPrecision(3)), p.resposta);
    }
  }
});

test('cada código de erro emitido em tempo de execução tem texto no snapshot', () => {
  const linhas = new Set(fs.readFileSync(path.join(__dirname, 'fixtures', 'erros-humanizados.txt'), 'utf8').split(/\r?\n/).map((l) => l.split(' → ')[0]));
  for (const id of IDS) for (const p of itens(id, 40)) for (const e of p.errosTipicos) assert.ok(linhas.has(e.codigo), 'código sem texto no snapshot: ' + e.codigo);
});

test('escolha: cada opção errada tem um código próprio; explicações sem dois «dois pontos» numa frase', () => {
  const semFormulas = (t) => String(t).replace(/\$\$[\s\S]*?\$\$/g, 'F').replace(/\$[^$]*\$/g, 'F');
  for (const id of IDS) for (const p of itens(id, 25)) {
    if (p.formato === 'escolha') {
      const codigos = p.errosTipicos.map((e) => e.codigo);
      assert.equal(new Set(codigos).size, codigos.length, id + ' ' + p.contexto + ' ' + p.semente);
    }
    const ts = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque), p.errosTipicos.map((e) => e.explicacao));
    for (const t of ts) for (const frase of semFormulas(t).split(/(?<=[.?!])\s+/)) assert.ok((frase.match(/:\s/g) || []).length < 2, id + ': ' + frase);
  }
});

test('as explicações dos erros numéricos mostram o valor do erro', () => {
  for (const id of IDS) {
    const d = G.obter(id);
    if (!d.formatos.includes('numerica')) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 20; s++) {
      const p = G.gerar(id, s, { formato: 'numerica', contexto });
      for (const e of p.errosTipicos) {
        const a = Math.abs(e.valor);
        const mant = a.toExponential(2).split('e')[0].replace('.', '{,}');
        const formas = [String(a).replace('.', '{,}'), a.toPrecision(3).replace('.', '{,}'), mant, mant.replace(/0+$/, '').replace(/\{,\}$/, '')];
        assert.ok(formas.some((f) => e.explicacao.includes(f)), id + ' ' + contexto + ' ' + s + ' ' + e.codigo + ' ' + e.valor + ': ' + e.explicacao);
      }
    }
  }
});

test('energia cinética: m v², ½ m v e as unidades por converter aparecem como erros típicos', () => {
  const codigos = new Set();
  for (const p of itens('sistema-mecanico-ec-epg', 60)) p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  for (const c of ['esqueceu_o_meio_na_energia_cinetica', 'esqueceu_o_quadrado_da_velocidade', 'massa_em_gramas', 'velocidade_em_km_h', 'epg_sem_nivel_de_referencia', 'variacao_com_o_sinal_trocado']) assert.ok(codigos.has(c), c);
});

test('variação da energia potencial gravítica: positiva a subir, negativa a descer', () => {
  for (const p of itens('sistema-mecanico-ec-epg', 60)) {
    if (p.contexto !== 'variacao-epg' || p.formato !== 'numerica') continue;
    const { hi, hf } = p.dados;
    assert.equal(Math.sign(p.resposta), Math.sign(hf - hi));
  }
});
