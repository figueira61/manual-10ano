globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-tabela: tabela periódica (períodos 1–4, Z = 1–36, em 18 colunas) com mapa de cor para blocos,
// energia de ionização ou raio atómico. Tocar num elemento mostra grupo, período, bloco, valores e, se Z ≤ 23,
// a configuração eletrónica. Só se indica uma tendência quando os dados a confirmam e o par não é exceção
// (excecoesEI, excecoesEIGrupo) nem empate de raios. Opções: { simbolo, modo: 'blocos' | 'ei' | 'raio' }.
Manual.esquemas.registar('fqa-tabela', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const D = Manual.dadosQuimicos;
    const Q = Manual.quimica;
    const simbolos = Object.keys(D.elementos);
    const E = (s) => D.elementos[s];
    const fmt = (v) => Number(v).toLocaleString('pt-PT');
    const MODOS = [['blocos', 'Blocos'], ['ei', 'Energia de ionização'], ['raio', 'Raio atómico']];
    const est = { modo: MODOS.some((m) => m[0] === opcoes.modo) ? opcoes.modo : 'blocos', sel: simbolos.includes(opcoes.simbolo) ? opcoes.simbolo : null, foco: null };
    est.foco = est.sel || 'H';

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function latex(pai, s) {
      if (Manual.render && Manual.render.texto) Manual.render.texto(pai, '$' + s + '$');
      else pai.appendChild(document.createTextNode(s));
    }
    const repr = (s) => E(s).bloco === 's' || E(s).bloco === 'p';

    // ---------- comparações (só com dados que as confirmam) ----------
    function comparar(s, modo) {
      const z = E(s).z, e = E(s), r = [];
      const prev = z > 1 ? simbolos[z - 2] : null;
      const periodoPrev = prev && E(prev).periodo === e.periodo ? prev : null;
      const acima = simbolos.find((x) => E(x).grupo === e.grupo && E(x).periodo === e.periodo - 1 && repr(x) && repr(s));
      if (modo === 'ei' || modo === 'blocos') {
        if (periodoPrev) {
          const a = E(periodoPrev).ei1, b = e.ei1;
          const par = periodoPrev + '>' + s;
          if (D.excecoesEI.includes(par)) {
            r.push('Do ' + periodoPrev + ' para o ' + s + ' (mesmo período) a energia de ionização diminui (' + fmt(a) + ' → ' + fmt(b) + ' kJ/mol): exceção à tendência geral de aumentar ao longo do período.');
          } else if (repr(periodoPrev) && repr(s) && b > a) {
            r.push('Do ' + periodoPrev + ' para o ' + s + ' (mesmo período) a energia de ionização aumenta (' + fmt(a) + ' → ' + fmt(b) + ' kJ/mol), como é a tendência ao longo do período.');
          }
        }
        if (acima) {
          const a = E(acima).ei1, b = e.ei1;
          if (D.excecoesEIGrupo.includes(s + '>' + acima)) {
            r.push('Do ' + acima + ' para o ' + s + ' (mesmo grupo) a energia de ionização é ligeiramente maior (' + fmt(a) + ' → ' + fmt(b) + ' kJ/mol): exceção à tendência geral de diminuir descendo no grupo.');
          } else if (b < a) {
            r.push('Do ' + acima + ' para o ' + s + ' (mesmo grupo) a energia de ionização diminui (' + fmt(a) + ' → ' + fmt(b) + ' kJ/mol), como é a tendência descendo no grupo.');
          }
        }
      }
      if (modo === 'raio' || modo === 'blocos') {
        if (periodoPrev && E(periodoPrev).raio !== undefined && e.raio !== undefined) {
          const a = E(periodoPrev).raio, b = e.raio;
          if (a === b) r.push('O ' + periodoPrev + ' e o ' + s + ' têm o mesmo raio atómico (' + a + ' pm): não se indica tendência para este par.');
          else if (b < a) r.push('Do ' + periodoPrev + ' para o ' + s + ' (mesmo período) o raio atómico diminui (' + a + ' → ' + b + ' pm), como é a tendência ao longo do período.');
        }
        if (acima && E(acima).raio !== undefined && e.raio !== undefined) {
          const a = E(acima).raio, b = e.raio;
          if (a === b) r.push('O ' + acima + ' e o ' + s + ' têm o mesmo raio atómico (' + a + ' pm): não se indica tendência para este par.');
          else if (b > a) r.push('Do ' + acima + ' para o ' + s + ' (mesmo grupo) o raio atómico aumenta (' + a + ' → ' + b + ' pm), como é a tendência descendo no grupo.');
        }
      }
      return r;
    }

    // Navegação por setas: esquerda/direita no mesmo período; cima/baixo para o período vizinho, na coluna mais próxima.
    function vizinho(s, tecla) {
      const e = E(s);
      const doPeriodo = (p) => simbolos.filter((x) => E(x).periodo === p);
      if (tecla === 'ArrowRight' || tecla === 'ArrowLeft') {
        const linha = doPeriodo(e.periodo);
        const i = linha.indexOf(s) + (tecla === 'ArrowRight' ? 1 : -1);
        return linha[i] || null;
      }
      if (tecla === 'ArrowDown' || tecla === 'ArrowUp') {
        const p = e.periodo + (tecla === 'ArrowDown' ? 1 : -1);
        const linha = doPeriodo(p);
        if (!linha.length) return null;
        return linha.reduce((m, x) => (Math.abs(E(x).grupo - e.grupo) < Math.abs(E(m).grupo - e.grupo) ? x : m));
      }
      return null;
    }

    // ---------- estrutura ----------
    el.textContent = '';
    const raiz = criar('div', 'esq-tabela');
    el.appendChild(raiz);
    const barra = criar('div', 'esq-controlos');
    barra.setAttribute('role', 'group');
    barra.setAttribute('aria-label', 'Mapa de cor');
    const botoesModo = MODOS.map(([id, rot]) => {
      const b = criar('button', 'btn tp-modo', rot);
      b.type = 'button';
      b.setAttribute('data-modo', id);
      barra.appendChild(b);
      return b;
    });
    raiz.appendChild(barra);

    const linhaSel = criar('div', 'esq-controlos');
    const labSel = criar('label', '', 'Escolher elemento: ');
    const selEl = criar('select', 'tp-select');
    const opVazia = criar('option', '', '—');
    opVazia.value = '';
    selEl.appendChild(opVazia);
    simbolos.forEach((s) => {
      const o = criar('option', '', E(s).z + ' — ' + s + ' — ' + E(s).nome);
      o.value = s;
      selEl.appendChild(o);
    });
    labSel.appendChild(selEl);
    linhaSel.appendChild(labSel);
    raiz.appendChild(linhaSel);
    const aoSelect = () => { est.sel = selEl.value || null; if (est.sel) est.foco = est.sel; atualizar(); };
    selEl.addEventListener('change', aoSelect);

    const grelha = criar('div', 'tp-grelha');
    grelha.style.display = 'grid';
    grelha.style.gridTemplateColumns = 'repeat(18, minmax(0, 1fr))';
    grelha.style.gap = '2px';
    grelha.setAttribute('role', 'group');
    grelha.setAttribute('aria-label', 'Tabela periódica, períodos 1 a 4');
    const celulas = {};
    const regs = [];
    simbolos.forEach((s) => {
      const e = E(s);
      const b = criar('button', 'tp-el', s);
      b.type = 'button';
      b.setAttribute('data-simbolo', s);
      b.style.gridColumn = String(e.grupo);
      b.style.gridRow = String(e.periodo);
      b.style.padding = '4px 0';
      b.style.minWidth = '0';
      b.style.fontSize = '0.72rem';
      b.style.border = '1px solid var(--borda)';
      b.style.color = 'var(--texto)';
      b.style.cursor = 'pointer';
      b.title = e.nome;
      const fn = () => { est.sel = s; est.foco = s; atualizar(); };
      b.addEventListener('click', fn);
      regs.push([b, 'click', fn]);
      const tecla = (ev) => {
        const alvo = vizinho(s, ev.key);
        if (!alvo) return;
        if (ev.preventDefault) ev.preventDefault();
        est.sel = alvo;
        est.foco = alvo;
        atualizar();
        celulas[alvo].focus();
      };
      b.addEventListener('keydown', tecla);
      regs.push([b, 'keydown', tecla]);
      grelha.appendChild(b);
      celulas[s] = b;
    });
    botoesModo.forEach((b) => {
      const fn = () => { est.modo = b.getAttribute('data-modo'); atualizar(); };
      b.addEventListener('click', fn);
      regs.push([b, 'click', fn]);
    });
    raiz.appendChild(grelha);
    const legenda = criar('p', 'esq-legenda');
    raiz.appendChild(legenda);
    const zonaSel = criar('div');
    zonaSel.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaSel);

    const valor = (s, modo) => (modo === 'ei' ? E(s).ei1 : E(s).raio);
    const MISTURA = { s: 'var(--cor-1)', p: 'var(--cor-2)', d: 'var(--cor-3)' };

    function atualizar() {
      const modo = est.modo;
      botoesModo.forEach((b) => b.setAttribute('aria-pressed', b.getAttribute('data-modo') === modo ? 'true' : 'false'));
      const vals = modo === 'blocos' ? [] : simbolos.map((s) => valor(s, modo)).filter((v) => v !== undefined);
      const min = Math.min(...vals), max = Math.max(...vals);
      simbolos.forEach((s) => {
        const b = celulas[s], e = E(s);
        let desc = s + ', ' + e.nome.toLowerCase() + ', Z = ' + e.z + ', grupo ' + e.grupo + ', período ' + e.periodo + ', bloco ' + e.bloco;
        let fundo = 'var(--superficie)';
        let tracejado = false;
        if (modo === 'blocos') {
          fundo = 'color-mix(in srgb, ' + MISTURA[e.bloco] + ' 30%, var(--superficie))';
        } else {
          const v = valor(s, modo);
          const un = modo === 'ei' ? ' kJ/mol' : ' pm';
          if (v === undefined) { tracejado = true; desc += ', sem valor'; }
          else {
            const pct = max === min ? 50 : Math.round(8 + ((v - min) / (max - min)) * 47);
            fundo = 'color-mix(in srgb, var(--cor-1) ' + pct + '%, var(--superficie))';
            desc += ', ' + (modo === 'ei' ? 'energia de ionização ' : 'raio atómico ') + fmt(v) + un;
          }
        }
        b.style.background = fundo;
        b.style.borderStyle = tracejado ? 'dashed' : 'solid';
        b.style.borderWidth = s === est.sel ? '3px' : '1px';
        b.setAttribute('aria-label', desc);
        b.setAttribute('aria-pressed', s === est.sel ? 'true' : 'false');
        b.setAttribute('tabindex', s === est.foco ? '0' : '-1');
        b.textContent = s;
        if (modo === 'blocos') {
          const l = criar('small', 'tp-bloco', e.bloco);
          l.style.opacity = '0.6';
          l.style.fontSize = '0.6rem';
          l.style.marginLeft = '1px';
          b.appendChild(l);
        }
      });
      selEl.value = est.sel || '';
      legenda.textContent = modo === 'blocos'
        ? 'Cor e letra por bloco: s (azul), p (laranja), d (verde). Os valores aparecem ao tocar num elemento.'
        : (modo === 'ei' ? 'Energia de ionização' : 'Raio atómico') + ': do mais claro (' + fmt(min) + (modo === 'ei' ? ' kJ/mol' : ' pm')
          + ') ao mais escuro (' + fmt(max) + (modo === 'ei' ? ' kJ/mol' : ' pm') + '). Tracejado = sem valor.';

      zonaSel.textContent = '';
      if (!est.sel) {
        zonaSel.appendChild(criar('p', '', 'Toca num elemento para ver o grupo, o período, o bloco e os valores.'));
        return;
      }
      const s = est.sel, e = E(s);
      const pos = Q.posicaoTP(e.z);
      zonaSel.appendChild(criar('p', 'tp-resumo', s + ' (' + e.nome.toLowerCase() + '): Z = ' + e.z + ', grupo ' + pos.grupo + ', período ' + pos.periodo + ', bloco ' + pos.bloco + '.'));
      const painel = criar('div');
      zonaSel.appendChild(painel);
      N.painelValores(painel).definir([
        ['Número atómico', String(e.z)],
        ['Grupo', String(pos.grupo)],
        ['Período', String(pos.periodo)],
        ['Bloco', pos.bloco],
        ['Massa atómica relativa', e.massaAtomica.toFixed(2).replace('.', ',')],
        ['1.ª energia de ionização', fmt(e.ei1) + ' kJ/mol'],
        ['Raio atómico', e.raio !== undefined ? e.raio + ' pm' : 'sem valor'],
      ]);
      const pc = criar('p', 'tp-config');
      if (e.z <= Q.Z_MAX_CONFIG) {
        const c = Q.configuracao(e.z);
        pc.appendChild(document.createTextNode('Configuração eletrónica: '));
        latex(pc, c.spd);
        zonaSel.appendChild(pc);
      } else {
        pc.textContent = 'Configuração eletrónica: configuração fora do programa (Z > ' + Q.Z_MAX_CONFIG + ').';
        zonaSel.appendChild(pc);
      }
      const cs = comparar(s, modo);
      if (cs.length) {
        zonaSel.appendChild(criar('p', 'esq-subtitulo', 'Comparação com elementos vizinhos'));
        cs.forEach((t) => zonaSel.appendChild(criar('p', 'tp-comparacao', t)));
      }
    }

    atualizar();

    return {
      destruir() {
        selEl.removeEventListener('change', aoSelect);
        regs.splice(0).forEach((r) => r[0].removeEventListener(r[1], r[2]));
        el.textContent = '';
      },
    };
  },
});
