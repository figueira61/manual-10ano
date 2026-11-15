const { test } = require('node:test');
const assert = require('node:assert/strict');
const { carregar } = require('./ajuda.js');
const { criarDocumento } = require('./dom-minimo.js');

const BASE = ['esquemas/fqa/calculo-dados.js', 'esquemas/fqa/calculo-quimica.js', 'esquemas/mat-a/formatar.js',
  'js/nucleo.js', 'esquemas/nucleo/controlos.js', 'esquemas/nucleo/figura.js'];

// Monta um esquema com o documento falso e regista todos os elementos criados (para contar ouvintes).
function montar(id, opcoes) {
  globalThis.document = criarDocumento();
  const criados = [];
  const cria = document.createElement;
  const criaNS = document.createElementNS;
  document.createElement = (t) => { const e = cria(t); criados.push(e); return e; };
  document.createElementNS = (n, t) => { const e = criaNS(n, t); criados.push(e); return e; };
  const M = carregar(...BASE, 'esquemas/fqa/' + id + '.js');
  const el = document.createElement('div');
  const montado = M.esquemas.obter(id).montar(el, opcoes);
  const ouvintes = () => criados.reduce((n, e) => n + Object.values(e.ouvintes).reduce((a, l) => a + l.length, 0), 0);
  return { M, el, montado, ouvintes };
}
const ver = (el) => el.textContent;
const slider = (el, k) => el.querySelectorAll('input')[k];
function mexer(el, k, v) { const s = slider(el, k); s.value = String(v); s.dispatch('input'); }
function botao(el, txt) { const b = el.querySelectorAll('button').find((x) => x.textContent.includes(txt)); assert.ok(b, txt); b.click(); }

function ciclo(id, opcoes) {
  const { el, montado, ouvintes } = montar(id, opcoes);
  assert.ok(ouvintes() > 0, 'tem ouvintes ativos');
  montado.destruir();
  assert.equal(ouvintes(), 0, 'zero ouvintes depois de destruir');
}

test('fig-atomo: monta com as 5 partes e desmonta sem ouvintes', () => {
  const { el } = montar('fig-atomo', {});
  for (const r of ['Núcleo', 'Protão', 'Neutrão', 'Eletrão', 'Nuvem eletrónica']) assert.ok(ver(el).includes(r), r);
  ciclo('fig-atomo', {});
});

test('fqa-atomo: Z = 8 e A = 17 dão N = 9; monta e desmonta sem ouvintes', () => {
  const { el } = montar('fqa-atomo', {});
  mexer(el, 0, 8);
  mexer(el, 1, 17);
  assert.ok(ver(el).includes('N = 9'));
  assert.ok(ver(el).includes('N = A − Z = 17 − 8 = 9'));
  assert.equal(el.querySelectorAll('circle.protao').length, 8);
  assert.equal(el.querySelectorAll('circle.neutrao').length, 9);
  assert.equal(el.querySelectorAll('circle.eletrao').length, 8);
  mexer(el, 2, 2); // O²⁺ → 6 eletrões
  assert.equal(el.querySelectorAll('circle.eletrao').length, 6);
  ciclo('fqa-atomo', {});
});

test('fqa-atomo: aumentar Z acima de A corrige A; botão de isótopo muda A', () => {
  const { el } = montar('fqa-atomo', { z: 6, a: 12 });
  mexer(el, 0, 20);
  assert.ok(ver(el).includes('Z = 20') && ver(el).includes('N = 0'));
  mexer(el, 0, 17);
  const b = el.querySelectorAll('button').find((x) => x.textContent.includes('A = 37'));
  b.click();
  assert.ok(ver(el).includes('N = 20'));
});

test('fqa-isotopos: média ponderada escrita muda com a abundância; soma 100 %', () => {
  const { M, el } = montar('fqa-isotopos', { elemento: 'Cl' });
  const D = M.dadosQuimicos;
  const fmt = (v) => Number(v).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  assert.ok(ver(el).includes('Ar(Cl) = ' + fmt(M.quimica.massaAtomicaMedia(D.isotopos.Cl))));
  mexer(el, 0, 50);
  const iso = [{ massa: D.isotopos.Cl[0].massa, abundancia: 50 }, { massa: D.isotopos.Cl[1].massa, abundancia: 50 }];
  assert.ok(ver(el).includes('Ar(Cl) = ' + fmt(M.quimica.massaAtomicaMedia(iso))));
  assert.ok(ver(el).includes('/ 100'));
  assert.equal(el.querySelectorAll('rect.barra-iso').length, 2);
  ciclo('fqa-isotopos', { elemento: 'O' });
});

test('fqa-isotopos: com 3 isótopos o primeiro slider não passa o que resta; trocar de elemento', () => {
  const { el } = montar('fqa-isotopos', { elemento: 'Mg' });
  assert.equal(el.querySelectorAll('input').length, 2);
  mexer(el, 0, 95); // o segundo tem 10 %: só cabem 90
  assert.equal(Number(slider(el, 0).value), 90);
  const sel = el.querySelector('select');
  sel.value = 'Li';
  sel.dispatch('change');
  assert.equal(el.querySelectorAll('input').length, 1);
  assert.ok(ver(el).includes('Ar(Li)'));
});

test('fqa-espectro: λ = 500 nm mostra zona, f e E (cientifico, 3 a.s.); riscas do H, Na e He', () => {
  const { M, el } = montar('fqa-espectro', { lambda: 500e-9 });
  const r = M.quimica.energiaFotao({ lambda: 500e-9 });
  const c = (v) => M.formatar.cientifico(v, 3);
  assert.ok(ver(el).includes(c(r.E)), 'E');
  assert.ok(ver(el).includes(c(r.f)), 'f');
  assert.ok(ver(el).includes('Visível'));
  // pelo slider
  mexer(el, 0, Math.log10(100e-9));
  const r2 = M.quimica.energiaFotao({ lambda: Math.pow(10, Math.log10(100e-9)) });
  assert.ok(ver(el).includes(c(r2.E)));
  assert.ok(ver(el).includes('Ultravioleta'));
  mexer(el, 0, -3);
  assert.ok(ver(el).includes('Micro-ondas'));
  // riscas: H = 4 linhas de Balmer visíveis
  assert.equal(el.querySelectorAll('line.risca').length, 4);
  const sel = el.querySelector('select');
  sel.value = 'Na';
  sel.dispatch('change');
  assert.equal(el.querySelectorAll('line.risca').length, 2);
  assert.ok(ver(el).includes('589,0 nm'));
  sel.value = 'He';
  sel.dispatch('change');
  assert.equal(el.querySelectorAll('line.risca').length, 5);
  botao(el, 'Absorção');
  assert.ok(ver(el).includes('riscas escuras'));
  assert.equal(sel.value, 'H'); // He sem absorção visível: volta ao H
  assert.ok(ver(el).includes('já estão no nível n = 2'));
  assert.ok(sel.querySelectorAll('option').find((o) => o.value === 'He').disabled);
  sel.value = 'Na';
  sel.dispatch('change');
  assert.ok(ver(el).includes('589,0 nm') && !ver(el).includes('já estão no nível'));
  botao(el, 'Emissão');
  assert.ok(!sel.querySelectorAll('option').find((o) => o.value === 'He').disabled);
  mexer(el, 0, -12);
  assert.ok(ver(el).includes('Raios gama'));
  ciclo('fqa-espectro', {});
});

test('fqa-espectro: riscas de Balmer do H vêm de transicaoH, com λ a 1 nm', () => {
  const { M, el } = montar('fqa-espectro', {});
  const nm = Math.round(M.quimica.transicaoH(3, 2).lambda * 1e9);
  assert.ok(ver(el).includes('λ ≈ ' + nm + ' nm'));
  assert.ok(ver(el).includes('n = 3 → 2'));
});

test('fqa-niveis: 3 → 2 é Balmer, visível, emissão, com ΔE e λ de transicaoH', () => {
  const { M, el } = montar('fqa-niveis', {});
  const t = M.quimica.transicaoH(3, 2);
  assert.ok(ver(el).includes(M.formatar.cientifico(t.deltaE, 3)));
  assert.ok(ver(el).includes(M.formatar.cientifico(t.lambda, 3)));
  assert.ok(ver(el).includes('Balmer') && ver(el).includes('emissão') && ver(el).includes('visível (a risca vê-se)'));
  mexer(el, 0, 1); mexer(el, 1, 3); // 1 → 3: absorção, Lyman, UV
  assert.ok(ver(el).includes('absorção') && ver(el).includes('Lyman') && ver(el).includes('fora do visível (ultravioleta)'));
  mexer(el, 0, 6); mexer(el, 1, 4); // 6 → 4: outra série
  assert.ok(ver(el).includes('outra série') && !ver(el).includes('Paschen'));
  mexer(el, 1, 6);
  assert.ok(ver(el).includes('Escolhe dois níveis diferentes'));
  assert.equal(el.querySelectorAll('line.nivel').length, 6);
  ciclo('fqa-niveis', {});
});

test('fqa-configuracao: Z = 23 mostra a cadeia spd de configuracao(23); passo a passo', () => {
  const { M, el } = montar('fqa-configuracao', {});
  mexer(el, 0, 23);
  const c = M.quimica.configuracao(23);
  assert.ok(ver(el).includes(c.spd));
  assert.ok(ver(el).includes(c.cerne));
  assert.equal(el.querySelectorAll('rect.caixa').length, 15);
  botao(el, 'Retirar eletrão');
  assert.ok(ver(el).includes(M.quimica.configuracao(22).spd));
  assert.ok(ver(el).includes('Eletrões colocados: 22 de 23'));
  botao(el, 'Colocar eletrão');
  assert.ok(ver(el).includes('Eletrões colocados: 23 de 23'));
  mexer(el, 0, 7); // N: 2p³, Hund
  assert.ok(ver(el).includes('regra de Hund'));
  mexer(el, 0, 8); // O: o 8.º emparelha
  assert.ok(ver(el).includes('princípio de exclusão'));
  assert.ok(ver(el).includes('Eletrões desemparelhados2'));
  ciclo('fqa-configuracao', { z: 12 });
});

function escolher(el, sim) {
  const b = el.querySelectorAll('button.tp-el').find((x) => x.getAttribute('data-simbolo') === sim);
  assert.ok(b, sim);
  b.click();
}
const modo = (el, id) => el.querySelectorAll('button.tp-modo').find((x) => x.getAttribute('data-modo') === id).click();

test('fqa-tabela: desenha Z 1–36 e, ao escolher Na, mostra grupo 1 e período 3', () => {
  const { el } = montar('fqa-tabela', {});
  assert.equal(el.querySelectorAll('button.tp-el').length, 36);
  escolher(el, 'Na');
  assert.ok(ver(el).includes('grupo 1, período 3, bloco s'));
  assert.ok(ver(el).includes('Grupo1') && ver(el).includes('Período3'));
  assert.ok(ver(el).includes('1s^2 2s^2 2p^6 3s^1'));
  ciclo('fqa-tabela', { simbolo: 'Na' });
});

test('fqa-tabela: Z > 23 não mostra configuração; sem valor de raio é dito', () => {
  const { el } = montar('fqa-tabela', {});
  escolher(el, 'Fe');
  assert.ok(ver(el).includes('configuração fora do programa (Z > 23)'));
  assert.ok(!ver(el).includes('1s^2'));
  assert.ok(ver(el).includes('Raio atómicosem valor'));
  modo(el, 'raio');
  const fe = el.querySelectorAll('button.tp-el').find((x) => x.getAttribute('data-simbolo') === 'Fe');
  assert.ok(fe.getAttribute('aria-label').includes('sem valor'));
  assert.equal(fe.style.borderStyle, 'dashed');
});

test('fqa-tabela: exceções de EI e empates de raio não afirmam tendência', () => {
  const { M, el } = montar('fqa-tabela', { modo: 'ei' });
  for (const par of M.dadosQuimicos.excecoesEI) {
    const [a, b] = par.split('>');
    escolher(el, b);
    const t = ver(el);
    assert.ok(t.includes('exceção'), par);
    assert.ok(!t.includes('a energia de ionização aumenta (') || !t.includes('Do ' + a + ' para o ' + b + ' (mesmo período) a energia de ionização aumenta'), par);
  }
  escolher(el, 'Ga');
  assert.ok(ver(el).includes('Do Al para o Ga (mesmo grupo) a energia de ionização é ligeiramente maior'));
  assert.ok(!ver(el).includes('Do Al para o Ga (mesmo grupo) a energia de ionização diminui'));
  escolher(el, 'Li'); // sem exceção: tendência confirmada pelos dados
  assert.ok(ver(el).includes('diminui'));
  modo(el, 'raio');
  escolher(el, 'S'); // P = S = 100 pm
  assert.ok(ver(el).includes('mesmo raio atómico (100 pm): não se indica tendência'));
  assert.ok(!ver(el).includes('Do P para o S'));
  escolher(el, 'Cl');
  assert.ok(ver(el).includes('mesmo raio atómico (100 pm)'));
});

test('fqa-tabela: nenhuma comparação afirma uma tendência contrária aos dados', () => {
  const { M, el } = montar('fqa-tabela', {});
  for (const m of ['ei', 'raio']) {
    modo(el, m);
    for (const s of Object.keys(M.dadosQuimicos.elementos)) {
      escolher(el, s);
      for (const p of el.querySelectorAll('p.tp-comparacao')) {
        const t = p.textContent;
        const mm = /\((\d+) → (\d+)/.exec(t);
        if (!mm) continue;
        const sobe = Number(mm[2]) > Number(mm[1]);
        if (/ aumenta /.test(t)) assert.ok(sobe, s + ': ' + t);
        if (/ diminui /.test(t)) assert.ok(!sobe, s + ': ' + t);
      }
    }
  }
});

test('fqa-tabela: select de elemento e setas (roving tabindex)', () => {
  const { el } = montar('fqa-tabela', {});
  const sel = el.querySelector('select');
  assert.equal(sel.querySelectorAll('option').length, 37);
  assert.ok(sel.querySelectorAll('option').some((o) => o.textContent === '1 — H — Hidrogénio'));
  sel.value = 'Na';
  sel.dispatch('change');
  assert.ok(ver(el).includes('grupo 1, período 3'));
  const cel = (s) => el.querySelectorAll('button.tp-el').find((x) => x.getAttribute('data-simbolo') === s);
  assert.equal(el.querySelectorAll('button.tp-el').filter((b) => b.getAttribute('tabindex') === '0').length, 1);
  assert.equal(cel('Na').getAttribute('tabindex'), '0');
  cel('Na').dispatch('keydown', { key: 'ArrowRight' });
  assert.ok(ver(el).includes('Mg (magnésio)'));
  assert.equal(cel('Mg').getAttribute('tabindex'), '0');
  cel('Mg').dispatch('keydown', { key: 'ArrowDown' });
  assert.ok(ver(el).includes('Ca (cálcio)'));
  cel('Ca').dispatch('keydown', { key: 'ArrowLeft' });
  assert.ok(ver(el).includes('K (potássio)'));
  cel('K').dispatch('keydown', { key: 'ArrowUp' });
  assert.ok(ver(el).includes('Na (sódio)'));
  assert.equal(sel.value, 'Na');
  // letra do bloco no modo blocos
  assert.ok(cel('Na').querySelector('small.tp-bloco'));
  modo(el, 'ei');
  assert.ok(!cel('Na').querySelector('small.tp-bloco'));
});

test('fqa-configuracao: caixas dentro do viewBox (Z = 21–23) e mensagens corretas (1s/2s sem Hund)', () => {
  for (const z of [21, 22, 23]) {
    const { el } = montar('fqa-configuracao', { z });
    const larg = Number(el.querySelector('svg').getAttribute('viewBox').split(' ')[2]);
    const caixas = el.querySelectorAll('rect.caixa');
    assert.equal(caixas.length, 15);
    for (const c of caixas) assert.ok(Number(c.getAttribute('x')) >= 0 && Number(c.getAttribute('x')) + Number(c.getAttribute('width')) <= larg, 'z=' + z);
  }
  const { el } = montar('fqa-configuracao', { z: 6 });
  const regra = (k) => { botao(el, 'Todos os eletrões'); while (el.textContent.includes('Eletrões colocados: ' + k + ' de') === false) botao(el, 'Retirar eletrão'); return el.querySelector('p.config-regra').textContent; };
  const r1 = regra(1);
  assert.ok(r1.includes('subnível 1s') && !r1.includes('Hund'));
  const r3 = regra(3);
  assert.ok(r3.includes('subnível 2s') && !r3.includes('Hund'));
  const r5 = regra(5);
  assert.ok(r5.includes('subnível 2p') && r5.includes('Hund'));
  const r6 = regra(6);
  assert.ok(r6.includes('2p') && r6.includes('Hund'));
});

test('fqa-atomo: carga limitada a Z; singular/plural; nota sem escala', () => {
  const { el } = montar('fqa-atomo', { z: 3, carga: 3 });
  mexer(el, 0, 1); // H: a carga desce para +1
  assert.equal(Number(slider(el, 2).value), 1);
  assert.ok(ver(el).includes('catião (perdeu 1 eletrão)'));
  assert.equal(el.querySelectorAll('circle.eletrao').length, 0);
  mexer(el, 2, 3); // tentativa de +3 com Z = 1
  assert.equal(Number(slider(el, 2).value), 1);
  mexer(el, 2, -1);
  assert.ok(ver(el).includes('anião (ganhou 1 eletrão)'));
  mexer(el, 2, -2);
  assert.ok(ver(el).includes('ganhou 2 eletrões'));
  assert.ok(ver(el).includes('Representação sem escala'));
  assert.ok(!ver(el).includes('menos de zero'));
});

test('fqa-isotopos: notação {}^{A}X em KaTeX e "massa isotópica relativa"', () => {
  const { el } = montar('fqa-isotopos', { elemento: 'Cl' });
  assert.ok(ver(el).includes('{}^{35}\\mathrm{Cl}'));
  assert.ok(ver(el).includes('Massa isotópica relativa'));
  assert.ok(ver(el).includes('34{,}9689'));
});
