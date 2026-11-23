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
  'trabalho-forca-constante', 'trabalho-tec', 'trabalho-travagem',
  'energia-mecanica-conservacao', 'energia-mecanica-nao-conservativas', 'energia-mecanica-ressalto',
];
const SUBTEMAS = ['sistema-mecanico', 'trabalho', 'energia-mecanica'];
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
  assert.match(p.enunciado, /massa total de \$60\{,\}0\\,\\mathrm\{kg\}\$\), que se move a \$36\{,\}0\\,\\mathrm\{km\\,h\^\{-1\}\}/);
  assert.equal(p.resposta, 3000); // ½ × 60 × 10²
  assert.equal(p.errosTipicos.find((e) => e.codigo === 'velocidade_em_km_h').valor, 38900); // ½ × 60 × 36² = 38 880
  p = g('sistema-mecanico-energia-mecanica');
  assert.match(p.enunciado, /0\{,\}200\\,\\mathrm\{kg\}\$ move-se a \$15\{,\}0/);
  assert.equal(p.resposta, 34.5); // ½ × 0,2 × 15² + 0,2 × 10 × 6 = 22,5 + 12
  p = g('sistema-mecanico-massa-velocidade');
  assert.match(p.enunciado, /1920\\,\\mathrm\{J\}/);
  assert.equal(p.resposta, 8); // √(2 × 1920 / 60)
  p = g('trabalho-forca-constante');
  assert.match(p.enunciado, /65\{,\}0\\,\\mathrm\{N\}\$, e faz um ângulo de 60,0°/);
  assert.equal(p.resposta, 32.5); // 65 × 1 × cos 60°
  assert.equal(p.algarismos, undefined); // exata: não pede a.s.
  assert.deepEqual(p.esquema, { id: 'fqa-trabalho', opcoes: { F: 65, d: 1, alfa: 60 } });
  p = g('trabalho-tec');
  assert.equal(p.resposta, 2850); // ½ × 60 × (12² − 7²)
  p = g('trabalho-travagem');
  assert.match(p.enunciado, /1250\\,\\mathrm\{kg\}\$ segue a \$36/);
  assert.equal(p.resposta, 8.93); // ½ × 1250 × 10² / 7000 = 8,929
  p = g('energia-mecanica-conservacao');
  assert.match(p.enunciado, /montanha-russa, de \$200\\,\\mathrm\{kg\}\$, passa com velocidade \$8\{,\}00/);
  assert.equal(p.resposta, 23.7); // √(8² + 2 × 10 × 25) = √564
  p = g('energia-mecanica-nao-conservativas');
  assert.equal(p.resposta, -122); // ½ × 5 × 3,5² − (½ × 5 × 1² + 5 × 10 × 3) = −121,9
  p = g('energia-mecanica-ressalto');
  assert.match(p.enunciado, /1\{,\}65\\,\\mathrm\{m\}\$ sobe, depois de bater no chão, até \$0\{,\}830/);
  assert.equal(p.resposta, 49.7); // (1 − 0,83/1,65) × 100
});

test('energia mecânica: W_FNC < 0 com atrito, > 0 com o motor; o sinal trocado é erro típico', () => {
  for (const p of itens('energia-mecanica-nao-conservativas', 60)) {
    if (p.formato !== 'numerica') continue;
    if (p.contexto === 'atrito') {
      assert.ok(p.resposta < 0);
      assert.ok(p.errosTipicos.some((e) => e.codigo === 'trabalho_dissipativo_com_sinal_positivo'));
    }
    if (p.contexto === 'motor') {
      assert.ok(p.resposta > 0);
      assert.equal(p.errosTipicos.find((e) => e.codigo === 'trabalho_fnc_sempre_negativo').valor, -p.resposta);
    }
    if (p.contexto === 'forca-atrito') assert.ok(p.resposta > 0); // intensidade
  }
});

test('conservação: a velocidade não depende da massa; o cenário «rampa» mostra o próprio item no esquema', () => {
  const g = M.dadosFisica.constantes.g;
  for (const p of itens('energia-mecanica-conservacao', 80)) {
    if (p.contexto !== 'velocidade') continue;
    const d = p.dados;
    const v = Math.sqrt(d.v0 * d.v0 + 2 * g * (d.h0 - d.h));
    if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - v) <= p.tolerancia + 1e-9);
    if (d.cenario === 'rampa') assert.deepEqual(p.esquema, { id: 'fqa-energias', opcoes: { percurso: 'rampa', h0: d.h0, v0: d.v0, Fa: 0 } });
    else assert.equal(p.esquema, undefined);
  }
});

test('ressalto: a altura depois de n ressaltos é h0 fⁿ e o esquema recebe h0 e a fração', () => {
  for (const p of itens('energia-mecanica-ressalto', 60)) {
    if (p.contexto !== 'altura') continue;
    const { h0, f, n } = p.dados;
    assert.deepEqual(p.esquema, { id: 'fqa-ressalto', opcoes: { h0, fracao: f } });
    if (p.formato === 'numerica') assert.ok(Math.abs(p.resposta - h0 * Math.pow(f, n)) <= p.tolerancia + 1e-9);
  }
});

test('trabalho com α = 90°: W = 0, e uma resposta 0 não é tomada por erro típico', () => {
  let visto = 0;
  for (let s = 1; s <= 200; s++) {
    const p = G.gerar('trabalho-forca-constante', s, { formato: 'numerica', contexto: 'angulo' });
    if (p.dados.alfa !== 90) continue;
    visto++;
    assert.equal(p.resposta, 0);
    assert.equal(M.aprendizagem.detetarErro(p, '0'), null);
    assert.ok(M.quiz.corrigir(p, '0').certa);
    assert.ok(p.errosTipicos.length >= 1 && p.errosTipicos.every((e) => Math.abs(e.valor) > 10 * p.tolerancia));
    assert.equal(M.quiz.corrigir(p, String(p.dados.F * p.dados.d).replace('.', ',')).erroTipico.codigo, 'esqueceu_o_cosseno');
  }
  assert.ok(visto >= 10, 'poucos itens com α = 90°: ' + visto);
});

test('α = 180°: +F·d é o sinal trocado; α = 0° não sai e α = 90° fica em ≤ 15 % dos itens', () => {
  let n180 = 0;
  for (let s = 1; s <= 300; s++) {
    const p = G.gerar('trabalho-forca-constante', s, { formato: 'numerica', contexto: 'resistente' });
    if (p.dados.alfa !== 180) continue;
    n180++;
    const det = M.aprendizagem.detetarErro(p, String(p.dados.F * p.dados.d).replace('.', ','));
    assert.equal(det.codigo, 'sinal_do_trabalho_trocado');
  }
  assert.ok(n180 > 10);
  const conta = {};
  for (let s = 1; s <= 300; s++) {
    const a = G.gerar('trabalho-forca-constante', s, { formato: 'numerica', contexto: 'angulo' }).dados.alfa;
    conta[a] = (conta[a] || 0) + 1;
  }
  assert.equal(conta[0], undefined);
  assert.ok(conta[90] > 0 && conta[90] <= 45, JSON.stringify(conta));
});

test('travagem plausível: desaceleração entre 2 e 8 m s⁻² (300 sementes)', () => {
  for (const formato of ['numerica', 'escolha']) for (const contexto of ['distancia', 'forca']) for (let s = 1; s <= 300; s++) {
    const d = G.gerar('trabalho-travagem', s, { formato, contexto }).dados;
    const a = contexto === 'distancia' ? d.Fa / d.m : (d.v * d.v) / (2 * d.d);
    assert.ok(a >= 2 - 1e-9 && a <= 8 + 1e-9, contexto + ' ' + s + ': ' + a);
  }
});

test('sinal do trabalho: potente abaixo de 90°, resistente acima; o atrito na travagem é negativo', () => {
  for (const p of itens('trabalho-forca-constante', 80)) {
    if (p.formato !== 'numerica') continue;
    const a = p.dados.alfa;
    assert.equal(Math.sign(p.resposta), a < 90 ? 1 : a === 90 ? 0 : -1, 'α = ' + a);
  }
  for (const p of itens('trabalho-travagem', 60)) {
    if (p.contexto !== 'trabalho') continue;
    const v = p.formato === 'numerica' ? p.resposta : Number(certa(p).replace(/[$]/g, '').replace('{,}', '.').match(/-?[\d.]+/)[0]);
    assert.ok(v < 0, 'W do atrito ' + v);
    assert.ok(p.errosTipicos.some((e) => e.codigo === 'trabalho_do_atrito_positivo'));
  }
  for (const p of itens('trabalho-tec', 60)) {
    if (p.contexto !== 'w-de-v' || p.formato !== 'numerica') continue;
    assert.equal(Math.sign(p.resposta), Math.sign(p.dados.vf - p.dados.vi)); // W_FR = ΔEc
  }
});

test('trabalho: seno, cosseno esquecido, ângulo com a vertical e calculadora em radianos aparecem como erros típicos', () => {
  const codigos = new Set();
  for (const id of ['trabalho-forca-constante', 'trabalho-tec', 'trabalho-travagem']) for (const p of itens(id, 40)) p.errosTipicos.forEach((e) => codigos.add(e.codigo));
  for (const c of ['usou_o_seno_em_vez_do_cosseno', 'esqueceu_o_cosseno', 'usou_o_angulo_com_a_vertical', 'calculadora_em_radianos', 'sinal_do_trabalho_trocado',
    'quadrado_da_diferenca_de_velocidades', 'esqueceu_o_trabalho_do_atrito', 'esqueceu_a_velocidade_inicial', 'velocidade_em_km_h', 'respondeu_em_joules']) assert.ok(codigos.has(c), c);
});

// Número LaTeX como o item o mostra: 12\,600 · 0{,}503 · -1{,}23 \times 10^{4}.
// (o espaço de milhares \, só conta entre algarismos, para não engolir o \, antes da unidade)
const NUM = String.raw`(-?\d(?:[\d{},]|\\,(?=\d))*(?:\s*\\times\s*10\^\{-?\d+\})?)`;
const lerTex = (t) => {
  const s = t.replace(/\\,/g, '').replace(/\{,\}/g, '.').trim();
  const m = s.match(/^(-?[\d.]+)(?:\s*\\times\s*10\^\{(-?\d+)\})?$/);
  return m ? Number(m[1]) * (m[2] ? Math.pow(10, Number(m[2])) : 1) : NaN;
};

test('aritmética mostrada: «a ± b = c» é exata e «a ± b ≈ c» fica a menos de 0,6 % (300 sementes, regra 15)', () => {
  const RE = new RegExp(String.raw`(?:^|=\s*|;\\ |\(\s*)` + NUM + String.raw`\s*([-+])\s*\(?` + NUM + String.raw`\)?\s*(=|\\approx)\s*` + NUM, 'g');
  for (const id of IDS) for (const p of itens(id, 300)) {
    for (const t of [p.verificacao.calculo].concat(p.resolucaoDetalhada.map((r) => r.calculo || ''))) {
      for (const m of t.matchAll(RE)) {
        const a = lerTex(m[1]), b = lerTex(m[3]), c = lerTex(m[5]);
        if ([a, b, c].some(Number.isNaN)) continue;
        const v = m[2] === '-' ? a - b : a + b;
        const erro = Math.abs(v - c) / Math.max(Math.abs(c), 1e-12);
        assert.ok(m[4] === '=' ? erro < 1e-9 : erro < 0.006, id + ' ' + p.contexto + ' ' + p.semente + ': ' + m[0]);
      }
    }
  }
});

test('opções (regra 14): a mesma notação e 3 a.s. em todas, e cada explicação mostra a string da sua opção', () => {
  const nucleo = (o) => o.replace(/^\$/, '').replace(/\$$/, '').replace(/\\,(\\mathrm\{.*\}|\\%)$/, '');
  for (const id of IDS) for (const p of itens(id, 100)) {
    if (p.formato !== 'escolha') continue;
    const ns = p.opcoes.map(nucleo);
    const sci = ns.map((o) => /\\times 10\^/.test(o));
    assert.ok(sci.every((x) => x === sci[0]), id + ' ' + p.semente + ': ' + p.opcoes.join(' ; '));
    for (const o of ns) {
      const mant = o.replace(/\s*\\times 10\^\{-?\d+\}$/, '').replace(/^-/, '').replace(/\\,/g, '').replace('{,}', '.');
      // 3 a.s.: mantissa d,dd; em notação normal, 3 algarismos depois dos zeros à esquerda (inteiros ≥ 1000 arredondados a 3 a.s.)
      const digitos = mant.replace('.', '').replace(/^0+/, '');
      if (Number(mant) >= 1000) assert.equal(Number(Number(mant).toPrecision(3)), Number(mant), id + ': ' + o);
      else assert.equal(digitos.length, 3, id + ' ' + p.semente + ': ' + o);
    }
    for (const e of p.errosTipicos) {
      const op = p.opcoes[e.opcao];
      assert.ok(e.explicacao.includes(op) || e.explicacao.includes('$' + nucleo(op) + '$'), id + ' ' + p.semente + ' ' + e.codigo + ': «' + op + '» :: ' + e.explicacao);
    }
  }
});

test('verificações que recalculam um dado do enunciado mostram esse mesmo dado', () => {
  for (const p of itens('sistema-mecanico-energia-mecanica', 100)) {
    if (p.contexto !== 'ec-de-em') continue;
    assert.ok(p.verificacao.calculo.includes('= ' + M.geradores.ajudas.tex(p.dados.Em, 4) + '\\,\\mathrm{J} = E_m'), p.verificacao.calculo);
  }
  for (const p of itens('trabalho-tec', 100)) {
    if (p.contexto !== 'v-de-w') continue;
    assert.ok(p.verificacao.calculo.includes('= ' + M.geradores.ajudas.tex(p.dados.FR * p.dados.d, 4) + '\\,\\mathrm{J} = W_{F_R}'), p.verificacao.calculo);
  }
  for (const p of itens('energia-mecanica-conservacao', 100)) {
    if (p.contexto !== 'altura') continue;
    assert.ok(p.verificacao.calculo.includes('= ' + M.geradores.ajudas.tex(p.dados.v0) + '\\,\\mathrm{m\\,s^{-1}}'), p.verificacao.calculo);
  }
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
        // (inteiros grandes em notação normal com o espaço de milhares: 3\,480\,000)
        const formas = [String(a).replace('.', '{,}'), a.toPrecision(3).replace('.', '{,}'), mant, mant.replace(/0+$/, '').replace(/\{,\}$/, ''), M.geradores.ajudas.tex(Number(a.toPrecision(3)), 0)];
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
