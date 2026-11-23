// Bateria comum aos testes dos geradores de Física (eletricidade e térmica): as regras de autoria verificadas em
// todos os geradores de uma lista de ids. Não é um ficheiro de teste (não acaba em .test.js): é chamado por eles.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { verificar } = require('../tools/verificar-geradores.js');

function* itensDe(G, id, sementes, formatos) {
  const d = G.obter(id);
  for (const formato of d.formatos) {
    if (formatos && !formatos.includes(formato)) continue;
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= sementes; s++) yield G.gerar(id, s, { formato, contexto });
  }
}

// Número LaTeX como o item o mostra: 12\,600 · 0{,}503 · -1{,}23 \times 10^{4}.
// (o espaço de milhares \, só conta entre algarismos, para não engolir o \, antes da unidade)
const NUM = String.raw`(-?\d(?:[\d{},]|\\,(?=\d))*(?:\s*\\times\s*10\^\{-?\d+\})?)`;
const lerTex = (t) => {
  const s = t.replace(/\\,/g, '').replace(/\{,\}/g, '.').trim();
  const m = s.match(/^(-?[\d.]+)(?:\s*\\times\s*10\^\{(-?\d+)\})?$/);
  return m ? Number(m[1]) * (m[2] ? Math.pow(10, Number(m[2])) : 1) : NaN;
};
// Núcleo numérico de uma opção «$1{,}23\,\mathrm{A}$» (sem os $ e sem a unidade, que começa no último «\,» sem algarismo a seguir).
const nucleo = (o) => o.replace(/^\$/, '').replace(/\$$/, '').replace(/\\,(?!\d).*$/, '');

function bateria(M, IDS) {
  const G = M.geradores;
  const itens = (id, s, f) => itensDe(G, id, s, f);
  const numericos = () => IDS.filter((id) => G.obter(id).formatos.includes('numerica'));

  for (const id of IDS) {
    test('gerador ' + id + ' passa a verificação (200 sementes)', () => {
      assert.deepEqual(verificar(G.obter(id), { sementes: 200 }), []);
    });
  }

  test('aritmética mostrada: «a ± b = c» é exata e «a ± b ≈ c» fica a menos de 0,6 % (300 sementes, regra 15)', () => {
    const RE = new RegExp(String.raw`(?:^|=\s*|;\\ |\(\s*)` + NUM + String.raw`\s*([-+])\s*\(?` + NUM + String.raw`\)?\s*(=|\\approx)\s*` + NUM, 'g');
    for (const id of IDS) for (const p of itens(id, 300)) {
      for (const t of [p.verificacao.calculo].concat(p.resolucaoDetalhada.map((r) => r.calculo || ''))) {
        for (const m of String(t).matchAll(RE)) {
          const a = lerTex(m[1]), b = lerTex(m[3]), c = lerTex(m[5]);
          if ([a, b, c].some(Number.isNaN)) continue;
          const v = m[2] === '-' ? a - b : a + b;
          const erro = Math.abs(v - c) / Math.max(Math.abs(c), 1e-12);
          assert.ok(m[4] === '=' ? erro < 1e-9 : erro < 0.006, id + ' ' + p.contexto + ' ' + p.semente + ': ' + m[0]);
        }
      }
    }
  });

  test('aritmética mostrada: «a × b = c» e «a / b = c» são exatas (300 sementes, regra 15)', () => {
    // produtos e frações simples entre números: a \times b = c, \dfrac{a}{b} = c
    const RE_X = new RegExp(String.raw`(?:^|=\s*|;\\ |\(\s*)` + NUM + String.raw`\s*\\times\s*` + NUM + String.raw`\s*(=|\\approx)\s*` + NUM + String.raw`(?![\d{]|\s*\\times\s*10)`, 'g');
    const RE_F = new RegExp(String.raw`(?:^|=\s*|;\\ |\(\s*)\\dfrac\{` + NUM + String.raw`\}\{` + NUM + String.raw`\}\s*(=|\\approx)\s*` + NUM + String.raw`(?![\d{]|\s*\\times\s*10)`, 'g');
    for (const id of IDS) for (const p of itens(id, 300)) {
      for (const t of [p.verificacao.calculo].concat(p.resolucaoDetalhada.map((r) => r.calculo || ''))) {
        for (const [re, op] of [[RE_X, (a, b) => a * b], [RE_F, (a, b) => a / b]]) {
          for (const m of String(t).matchAll(re)) {
            const a = lerTex(m[1]), b = lerTex(m[2]), c = lerTex(m[4]);
            if ([a, b, c].some(Number.isNaN)) continue;
            const v = op(a, b);
            const erro = Math.abs(v - c) / Math.max(Math.abs(c), 1e-12);
            assert.ok(m[3] === '=' ? erro < 1e-9 : erro < 0.006, id + ' ' + p.contexto + ' ' + p.semente + ': ' + m[0] + ' (' + v + ')');
          }
        }
      }
    }
  });

  test('opções numéricas (regra 14): a mesma notação e 3 a.s. em todas, e cada explicação mostra a string da sua opção', () => {
    for (const id of IDS) for (const p of itens(id, 100, ['escolha'])) {
      if (!p.dados || p.dados.sci === undefined) continue; // opções de texto
      const ns = p.opcoes.map(nucleo);
      const sci = ns.map((o) => /\\times 10\^/.test(o));
      assert.ok(sci.every((x) => x === sci[0]), id + ' ' + p.semente + ': ' + p.opcoes.join(' ; '));
      for (const o of ns) {
        const mant = o.replace(/\s*\\times 10\^\{-?\d+\}$/, '').replace(/^-/, '').replace(/\\,/g, '').replace('{,}', '.');
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

  test('nenhuma opção, resposta ou texto contém NaN, Infinity ou undefined', () => {
    for (const id of IDS) for (const p of itens(id, 60)) {
      if (p.formato === 'numerica') assert.ok(Number.isFinite(p.resposta), id);
      const textos = [p.enunciado].concat(p.opcoes || [], p.resolucaoDetalhada.map((r) => r.porque + ' ' + (r.calculo || '')), p.errosTipicos.map((e) => e.explicacao), [p.verificacao.calculo]);
      for (const t of textos) assert.ok(!/NaN|Infinity|undefined/.test(String(t)), id + ': ' + t);
      for (const e of p.errosTipicos) if (e.valor !== undefined) assert.ok(Number.isFinite(e.valor), id + ' ' + e.codigo);
      assert.ok(!/NaN|Infinity/.test(JSON.stringify(p.esquema || {})), id + ' esquema');
    }
  });

  test('uma resposta 0 (ou em branco) nunca é tomada por um erro típico', () => {
    for (const id of numericos()) {
      const d = G.obter(id);
      for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 80; s++) {
        const q = G.gerar(id, s, { formato: 'numerica', contexto });
        assert.equal(M.aprendizagem.detetarErro(q, '0'), null, id + ' ' + contexto + ' ' + s);
        if (Math.abs(q.resposta) >= 1e4) assert.ok(q.toleranciaRelativa > 0 && q.tolerancia === undefined, id + ' ' + s);
      }
    }
  });

  test('«com três algarismos significativos»: algarismos = 3 e a resposta já arredondada', () => {
    for (const id of numericos()) {
      const d = G.obter(id);
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

  test('cada código de erro emitido tem texto escrito à mão em EXCECOES', () => {
    for (const id of IDS) for (const p of itens(id, 40)) for (const e of p.errosTipicos) assert.ok(e.codigo in M.painel.EXCECOES, 'código sem texto em EXCECOES: ' + e.codigo);
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
    for (const id of numericos()) {
      const d = G.obter(id);
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
}

module.exports = { bateria, itensDe, nucleo, lerTex };
