// Física: quando um item pede o resultado com 3 algarismos significativos (algarismos: 3), todos os dados medidos
// do enunciado estão escritos com pelo menos 3 a.s. (o resultado não pode ter mais a.s. do que os dados).
// Só ficam de fora g e as constantes de referência com nome, numa lista explícita.
// E, no formato numérico, as explicações dos erros usam a notação da resposta (regra 14).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregarTudo } = require('../tools/verificar-geradores.js');

const M = carregarTudo();
const G = M.geradores;
const TEMAS = ['movimentos', 'eletricidade', 'termica'];
const SEMENTES = 80;

// Constantes dadas no enunciado, tratadas como exatas (não limitam os a.s.): o texto LaTeX inteiro «nome = valor unidade».
const CONSTANTES = [
  { nome: 'g', re: /g = 10\\,\\mathrm\{m\\,s\^\{-2\}\}/g },
  { nome: 'capacidade térmica mássica de referência', re: /c_\{\\text\{[^}]*\}\} = [^$]*?\\mathrm\{J\\,kg\^\{-1\}\\,\{\}\^\{\\circ\}C\^\{-1\}\}/g },
  { nome: 'variação de entalpia mássica de referência', re: /\\Delta h_\{\\text\{[^}]*\}\} = [^$]*?\\mathrm\{J\\,kg\^\{-1\}\}/g },
];

// Tira de uma fórmula os grupos que não são dados: \mathrm{…}, \text{…}, índices e expoentes (com chavetas aninhadas).
function semUnidades(t) {
  let s = t.replace(/\\times\s*10\^\{-?\d+\}/g, ''); // a mantissa conta; a potência de 10 não
  for (;;) {
    const m = s.match(/(\\(?:mathrm|text|mathit|operatorname)|[_^])\{/);
    if (!m) break;
    let i = m.index + m[0].length, nivel = 1;
    while (i < s.length && nivel) { if (s[i] === '{') nivel++; else if (s[i] === '}') nivel--; i++; }
    s = s.slice(0, m.index) + ' ' + s.slice(i);
  }
  return s.replace(/[_^]\d/g, ' ');
}
// Algarismos significativos de um número escrito «12\,600», «0{,}450», «65{,}0», «1500» (os zeros finais contam).
const algarismos = (n) => n.replace(/\\,/g, '').replace(/\{,\}|,/g, '').replace(/^-/, '').replace(/^0+/, '').length;
const valor = (n) => Number(n.replace(/\\,/g, '').replace(/\{,\}|,/g, '.'));

// Números dos dados de um enunciado: dentro das fórmulas e no texto (ângulos, percentagens…), sem ordinais («2.º»).
function numeros(enunciado) {
  const r = [];
  const texto = enunciado.replace(/\$([^$]*)\$/g, (m, f) => {
    let s = f;
    for (const c of CONSTANTES) s = s.replace(c.re, ' ');
    for (const n of semUnidades(s).match(/\d(?:\d|\{,\}\d|\\,(?=\d{3}(?!\d)))*/g) || []) r.push(n);
    return ' ';
  });
  for (const n of texto.replace(/\d+\.º/g, ' ').match(/\d+(?:,\d+)?/g) || []) r.push(n);
  return r;
}

test('o leitor de números do teste conta bem os a.s. e ignora unidades e constantes', () => {
  assert.deepEqual(numeros('Uma massa de $1{,}00\\,\\mathrm{kg}$ a $65{,}0\\,\\mathrm{m\\,s^{-1}}$ ($g = 10\\,\\mathrm{m\\,s^{-2}}$), 30,0° e $12\\,600\\,\\mathrm{J}$.'), ['1{,}00', '65{,}0', '12\\,600', '30,0']);
  assert.deepEqual(numeros('$c_{\\text{água}} = 4{,}18 \\times 10^{3}\\,\\mathrm{J\\,kg^{-1}\\,{}^{\\circ}C^{-1}}$ depois do 2.º ressalto'), []);
  assert.deepEqual(['1', '65', '0{,}45', '1{,}00', '0{,}450', '1500', '10', '12\\,600'].map(algarismos), [1, 2, 2, 3, 3, 4, 2, 5]);
});

test('Física: com algarismos = 3, todos os dados medidos do enunciado têm pelo menos 3 a.s. (' + SEMENTES + ' sementes)', () => {
  const falhas = [];
  for (const d of G.todos().filter((x) => x.disciplina === 'fqa' && TEMAS.includes(x.tema) && x.formatos.includes('numerica'))) {
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= SEMENTES; s++) {
      const p = G.gerar(d.id, s, { formato: 'numerica', contexto });
      if (p.algarismos !== 3) continue;
      // o zero não tem algarismos significativos (por exemplo, água a 0 °C)
      const curtos = numeros(p.enunciado).filter((n) => valor(n) !== 0 && algarismos(n) < 3);
      if (curtos.length) falhas.push(d.id + ' ' + contexto + ' ' + s + ': ' + curtos.join(' ; ') + ' :: ' + p.enunciado);
    }
  }
  assert.deepEqual(falhas.slice(0, 15), [], falhas.length + ' itens com dados com menos de 3 a.s.');
});

test('Física, numérica: cada explicação mostra o valor do erro com o formatador e a notação da resposta (regra 14)', () => {
  const N = G.fisicaNumeros.criar();
  for (const d of G.todos().filter((x) => x.disciplina === 'fqa' && TEMAS.includes(x.tema) && x.formatos.includes('numerica'))) {
    for (const contexto of G.contextosDe(d)) for (let s = 1; s <= 40; s++) {
      const p = G.gerar(d.id, s, { formato: 'numerica', contexto });
      if (!p.dados || p.dados.sci === undefined) continue; // itens fechados fora de fecharNum
      assert.equal(p.dados.sci, N.precisaSci([p.resposta]), d.id + ' ' + contexto + ' ' + s);
      for (const e of p.errosTipicos) {
        if (e.valor === undefined) continue;
        const v = '$' + N.texOp(e.valor, p.dados.sci);
        assert.ok(e.explicacao.includes(v), d.id + ' ' + contexto + ' ' + s + ' ' + e.codigo + ': «' + v + '» :: ' + e.explicacao);
      }
    }
  }
});
