globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// opcoes: { A, B, C, camadas } — pontos notáveis de um triângulo com vértices arrastáveis.
Manual.esquemas.registar('pontos-notaveis', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const G = Manual.calc.geometria;
    const T = Manual.formatar;
    opcoes = opcoes || {};
    const CAIXA = { xmin: -3, xmax: 9, ymin: -3, ymax: 8 };
    const MSG_DEGENERADO = 'Triângulo degenerado: os vértices estão alinhados.';

    const CAMADAS = [
      { id: 'incentro', nome: 'Incentro (bissetrizes)', cor: 'var(--cor-1)', letra: 'I' },
      { id: 'circuncentro', nome: 'Circuncentro (mediatrizes)', cor: 'var(--cor-2)', letra: 'O' },
      { id: 'ortocentro', nome: 'Ortocentro (alturas)', cor: 'var(--cor-3)', letra: 'H' },
      { id: 'baricentro', nome: 'Baricentro (medianas)', cor: 'var(--cor-4)', letra: 'G' },
      { id: 'euler', nome: 'Reta de Euler', cor: 'var(--cor-5)', letra: '' },
      { id: 'novePontos', nome: 'Circunferência dos nove pontos', cor: 'var(--cor-5)', letra: 'N' },
    ];
    const IDS = CAMADAS.map((c) => c.id);

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function ponto(p, omissao) {
      const ok = Array.isArray(p) && p.length === 2 && p.every((v) => Number.isFinite(Number(v)));
      const q = ok ? p.map(Number) : omissao;
      return [
        Math.min(Math.max(Math.round(q[0] * 2) / 2, CAIXA.xmin), CAIXA.xmax),
        Math.min(Math.max(Math.round(q[1] * 2) / 2, CAIXA.ymin), CAIXA.ymax),
      ];
    }
    const par = (p) => '(' + T.num(p[0]) + ' ; ' + T.num(p[1]) + ')';
    // "=" se o valor é exato com 3 casas, "≈" caso contrário.
    const pt = (p) => (p.every((x) => Math.abs(x * 1000 - Math.round(x * 1000)) < 1e-6) ? '' : '≈ ') + par(p);
    const igual = (v) => (Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-6 ? '= ' : '≈ ');

    const est = {
      P: { A: ponto(opcoes.A, [0, 0]), B: ponto(opcoes.B, [4, 0]), C: ponto(opcoes.C, [0, 3]) },
      camadas: new Set((Array.isArray(opcoes.camadas) ? opcoes.camadas : ['incentro', 'circuncentro', 'ortocentro', 'baricentro']).filter((c) => IDS.includes(c))),
    };

    el.textContent = '';
    const raiz = criar('div', 'esq-pontos-notaveis');
    el.appendChild(raiz);

    const zonaCaixas = criar('div', 'esq-controlos');
    raiz.appendChild(zonaCaixas);
    const caixas = {};
    CAMADAS.forEach((c) => {
      const lab = criar('label');
      const cb = criar('input');
      cb.type = 'checkbox';
      cb.checked = est.camadas.has(c.id);
      cb.addEventListener('change', () => {
        if (cb.checked) est.camadas.add(c.id); else est.camadas.delete(c.id);
        atualizar();
      });
      caixas[c.id] = cb;
      lab.appendChild(cb);
      const marca = criar('span', null, '●');
      marca.style.color = c.cor;
      lab.appendChild(marca);
      lab.appendChild(document.createTextNode(' ' + c.nome));
      zonaCaixas.appendChild(lab);
    });

    const ref = N.criarReferencial(raiz, { caixa: CAIXA });
    ref.svg.setAttribute('role', 'group');
    const gTriangulo = ref.camada('triangulo');
    const gConstrucoes = ref.camada('construcoes');
    const gCentros = ref.camada('centros');

    const zonaAviso = criar('div');
    raiz.appendChild(zonaAviso);
    const zonaPainel = criar('div');
    raiz.appendChild(zonaPainel);
    const painel = N.painelValores(zonaPainel);

    const pontos = ['A', 'B', 'C'].map((nome) => N.pontoArrastavel(ref, {
      x: est.P[nome][0], y: est.P[nome][1], rotulo: nome, passo: 0.5,
      cor: 'var(--cor-1)',
      aoMover: (x, y) => { est.P[nome] = [x, y]; atualizar(); },
    }));

    function marcar(p, cor, letra) {
      N.desenharCirculo(ref, gCentros, p, 0.14, { cor, largura: 2, preenchimento: cor });
      if (letra) {
        const t = N.desenharTexto(ref, gCentros, [p[0] + 0.2, p[1] + 0.25], letra);
        t.style.fill = cor;
        t.style.fontWeight = '700';
      }
    }
    const seg = (A, B, cor, opc) => N.desenharSegmento(ref, gConstrucoes, A, B, Object.assign({ cor, largura: 1.8, tracejado: true }, opc));

    function atualizar() {
      const { A, B, C } = est.P;
      N.limpar(gTriangulo);
      N.limpar(gConstrucoes);
      N.limpar(gCentros);
      zonaAviso.textContent = '';
      ref.svg.setAttribute('aria-label', 'Triângulo ABC com A' + par(A) + ', B' + par(B) + ' e C' + par(C) + '.');

      [[A, B], [B, C], [C, A]].forEach(([P, Q]) => N.desenharSegmento(ref, gTriangulo, P, Q, { cor: 'var(--cor-eixos)', largura: 2.5 }));

      const linhas = [['A', par(A)], ['B', par(B)], ['C', par(C)]];

      if (G.degenerado(A, B, C)) {
        zonaAviso.appendChild(criar('div', 'esq-aviso', MSG_DEGENERADO));
        painel.definir(linhas);
        return;
      }

      const on = (id) => est.camadas.has(id);
      const inc = G.incentro(A, B, C);
      const circ = G.circuncentro(A, B, C);
      const H = G.ortocentro(A, B, C);
      const Gb = G.baricentro(A, B, C);
      const nove = G.circunferenciaNovePontos(A, B, C);
      const cor = (id) => CAMADAS.find((c) => c.id === id).cor;

      if (on('incentro')) {
        const c = cor('incentro');
        [[A, B, C], [B, C, A], [C, A, B]].forEach(([V, P, Q]) => seg(V, G.peBissetriz(V, P, Q), c));
        N.desenharCirculo(ref, gConstrucoes, inc.centro, inc.raio, { cor: c, largura: 2 });
        marcar(inc.centro, c, 'I');
        linhas.push(['Incentro I', pt(inc.centro) + ' · raio da inscrita ' + igual(inc.raio) + T.num(inc.raio)]);
      }
      if (on('circuncentro')) {
        const c = cor('circuncentro');
        [[A, B], [B, C], [C, A]].forEach(([P, Q]) => seg(G.pontoMedio(P, Q), circ.centro, c));
        N.desenharCirculo(ref, gConstrucoes, circ.centro, circ.raio, { cor: c, largura: 2 });
        marcar(circ.centro, c, 'O');
        linhas.push(['Circuncentro O', pt(circ.centro) + ' · raio da circunscrita ' + igual(circ.raio) + T.num(circ.raio)]);
      }
      if (on('ortocentro')) {
        const c = cor('ortocentro');
        [[A, B, C], [B, C, A], [C, A, B]].forEach(([V, P, Q]) => seg(V, G.peAltura(V, P, Q), c));
        marcar(H, c, 'H');
        linhas.push(['Ortocentro H', pt(H)]);
      }
      if (on('baricentro')) {
        const c = cor('baricentro');
        [[A, B, C], [B, C, A], [C, A, B]].forEach(([V, P, Q]) => seg(V, G.pontoMedio(P, Q), c));
        marcar(Gb, c, 'G');
        linhas.push(['Baricentro G', pt(Gb)]);
        const M = G.pontoMedio(B, C);
        const am = G.distancia(A, M);
        const ag = G.distancia(A, Gb);
        const dois = (2 / 3) * am;
        linhas.push(['Mediana [AM]', 'M ' + pt(M) + ' · AM ' + igual(am) + T.num(am)]);
        linhas.push(['AG = 2/3 da mediana', 'AG ' + igual(ag) + T.num(ag) + ' ; 2/3 × AM ' + igual(dois) + T.num(dois) + (Math.abs(ag - dois) < 1e-9 ? ' ✓' : '')]);
      }
      if (on('euler')) {
        const c = cor('euler');
        if (G.distancia(circ.centro, H) < 1e-9) {
          linhas.push(['Reta de Euler', 'O, G e H coincidem (triângulo equilátero)']);
        } else {
          N.desenharSegmento(ref, gConstrucoes, circ.centro, H, { cor: c, largura: 3 });
          if (!on('circuncentro')) marcar(circ.centro, cor('circuncentro'), 'O');
          if (!on('ortocentro')) marcar(H, cor('ortocentro'), 'H');
          if (!on('baricentro')) marcar(Gb, cor('baricentro'), 'G');
          linhas.push(['Reta de Euler', 'passa por O ' + pt(circ.centro) + ', G ' + pt(Gb) + ' e H ' + pt(H)]);
        }
      }
      if (on('novePontos')) {
        const c = cor('novePontos');
        N.desenharCirculo(ref, gConstrucoes, nove.centro, nove.raio, { cor: c, largura: 2 });
        marcar(nove.centro, c, 'N');
        linhas.push(['Nove pontos', 'centro N ' + pt(nove.centro) + ' · raio ' + igual(nove.raio) + T.num(nove.raio)]);
      }
      painel.definir(linhas);
    }

    atualizar();

    return {
      destruir() {
        pontos.forEach((p) => p.destruir());
        ref.destruir();
        el.textContent = '';
      },
    };
  },
});
