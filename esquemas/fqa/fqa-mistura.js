globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

// Esquema fqa-mistura: mistura num recipiente isolado (sem perdas) de água com água, com um metal (Al, Cu, Fe ou Pb)
// ou com gelo a 0 °C. Mostra a temperatura de equilíbrio e o balanço Q cedido + Q recebido = 0. Com gelo em excesso,
// θeq = 0 °C e sobra gelo por derreter. Tudo vem de Manual.fisica.mistura e de Manual.dadosFisica.
// Opções: { tipo: 'agua-agua' | 'agua-metal' | 'agua-gelo', metal: 'aluminio'|'cobre'|'ferro'|'chumbo', m1, theta1, m2, theta2 }.
Manual.esquemas.registar('fqa-mistura', {
  montar(el, opcoes) {
    opcoes = opcoes || {};
    const N = Manual.nucleo;
    const F = Manual.fisica;
    const D = Manual.dadosFisica;
    const NS = 'http://www.w3.org/2000/svg';
    const lim = (v, a, b, o) => { const x = Number(v); return Number.isFinite(x) && v !== undefined && v !== null ? Math.min(Math.max(x, a), b) : o; };
    const fmt = (v, d) => {
      const x = Math.abs(v) < 5e-10 ? 0 : v;
      return Number(x).toLocaleString('pt-PT', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
    };
    const r1 = (v) => Math.round(v * 10) / 10;
    const TIPOS = [['agua-agua', 'Água + água'], ['agua-metal', 'Água + metal'], ['agua-gelo', 'Água + gelo a 0 °C']];
    const METAIS = [['aluminio', 'Alumínio'], ['cobre', 'Cobre'], ['ferro', 'Ferro'], ['chumbo', 'Chumbo']];
    const est = {
      tipo: TIPOS.some((t) => t[0] === opcoes.tipo) ? opcoes.tipo : 'agua-agua',
      metal: METAIS.some((t) => t[0] === opcoes.metal) ? opcoes.metal : 'aluminio',
      m1: lim(opcoes.m1, 0.05, 1, 0.2),
      theta1: lim(opcoes.theta1, 0, 100, 20),
      m2: lim(opcoes.m2, 0.05, 1, 0.1),
      theta2: lim(opcoes.theta2, 0, 100, 80),
    };

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }
    function svgEl(nome, atributos, pai) {
      const e = document.createElementNS(NS, nome);
      for (const k in atributos) e.setAttribute(k, atributos[k]);
      if (pai) pai.appendChild(e);
      return e;
    }

    el.textContent = '';
    const raiz = criar('div', 'esq-mistura');
    el.appendChild(raiz);
    const zonaBotoes = criar('div', 'esq-botoes');
    raiz.appendChild(zonaBotoes);
    const botoes = [];
    const ligar = (rot, aoClicar) => {
      const b = criar('button', '', rot);
      b.type = 'button';
      b.addEventListener('click', aoClicar);
      zonaBotoes.appendChild(b);
      botoes.push({ b, aoClicar });
      return b;
    };
    const btTipo = TIPOS.map(([id, rot]) => ligar(rot, () => { est.tipo = id; atualizar(); }));
    const btMetal = METAIS.map(([id, rot]) => ligar(rot, () => { est.metal = id; atualizar(); }));

    const zonaCtl = criar('div');
    raiz.appendChild(zonaCtl);
    const sliders = [];
    const caixa = () => { const z = criar('div'); zonaCtl.appendChild(z); return z; };
    sliders.push(N.slider(caixa(), { rotulo: 'Massa da água m₁ / kg', min: 0.05, max: 1, passo: 0.05, valor: est.m1, aoMudar: (v) => { est.m1 = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Temperatura da água θ₁ / °C', min: 0, max: 100, passo: 5, valor: est.theta1, aoMudar: (v) => { est.theta1 = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Massa do segundo corpo m₂ / kg', min: 0.05, max: 1, passo: 0.05, valor: est.m2, aoMudar: (v) => { est.m2 = v; atualizar(); } }));
    sliders.push(N.slider(caixa(), { rotulo: 'Temperatura do segundo corpo θ₂ / °C (o gelo está a 0 °C)', min: 0, max: 100, passo: 5, valor: est.theta2, aoMudar: (v) => { est.theta2 = v; atualizar(); } }));
    const entradas = Array.from(zonaCtl.querySelectorAll('input'));

    const L = 320, ALT = 112;
    const svg = svgEl('svg', { viewBox: '0 0 ' + L + ' ' + ALT, width: '100%', role: 'group', tabindex: '0', class: 'mistura-svg' }, raiz);
    svg.style.maxWidth = '460px';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.margin = '8px auto';
    const resumo = criar('p', 'esq-resumo');
    resumo.setAttribute('aria-live', 'polite');
    raiz.appendChild(resumo);
    const zonaTexto = criar('div');
    raiz.appendChild(zonaTexto);

    const texto = (x, y, t, ancora, tam, extra) => {
      const e = svgEl('text', Object.assign({ x, y, 'text-anchor': ancora || 'middle', 'font-size': tam || 9, fill: 'var(--texto)' }, extra), svg);
      e.textContent = t;
      return e;
    };

    function atualizar() {
      const gelo = est.tipo === 'agua-gelo', metal = est.tipo === 'agua-metal';
      const nomeMetal = METAIS.find((t) => t[0] === est.metal)[1];
      const nome2 = gelo ? 'gelo' : metal ? nomeMetal.toLowerCase() : 'água 2';
      const theta2 = gelo ? 0 : est.theta2;
      btTipo.forEach((b, i) => b.setAttribute('aria-pressed', TIPOS[i][0] === est.tipo ? 'true' : 'false'));
      btMetal.forEach((b, i) => { b.setAttribute('aria-pressed', metal && METAIS[i][0] === est.metal ? 'true' : 'false'); b.disabled = !metal; });
      if (entradas[3]) entradas[3].disabled = gelo;

      const corpo1 = { m: est.m1, fase: 'agua', theta: est.theta1 };
      const corpo2 = gelo ? { m: est.m2, fase: 'gelo', theta: 0 }
        : metal ? { m: est.m2, c: D.capacidadeTermicaMassica[est.metal], theta: theta2 }
          : { m: est.m2, fase: 'agua', theta: theta2 };
      const r = F.mistura([corpo1, corpo2]);
      const Q = r.trocas.map((t) => t.Q / 1000);
      const soma = Q[0] + Q[1];
      const porDerreter = gelo && r.geloRestante > 1e-9;
      svg.textContent = '';

      // barras de temperatura: θ1, θ2 e θeq (escala 0 a 100 °C)
      const BX = 86, BW = 170;
      const barras = [['θ₁ (água)', est.theta1, 'var(--cor-3)'], ['θ₂ (' + nome2 + ')', theta2, 'var(--cor-1)'], ['θeq', r.thetaEq, 'var(--cor-2)']];
      barras.forEach(([rot, T, cor], i) => {
        const y = 14 + i * 30;
        texto(8, y + 11, rot, 'start', 10);
        svgEl('rect', { class: 'barra', x: BX, y, width: r1(Math.max(0, Math.min(T / 100, 1)) * BW), height: 14, fill: cor, stroke: 'var(--texto)', 'stroke-width': 1 }, svg);
        texto(BX + BW + 8, y + 11, fmt(T, 1) + ' °C', 'start', 10);
      });
      svg.setAttribute('aria-label', 'Temperaturas iniciais ' + fmt(est.theta1, 1) + ' °C e ' + fmt(theta2, 1) + ' °C e temperatura de equilíbrio ' + fmt(r.thetaEq, 1) + ' °C.');

      resumo.textContent = porDerreter
        ? 'θeq = 0 °C: há gelo por derreter (restam ' + fmt(r.geloRestante * 1000) + ' g de ' + fmt(est.m2 * 1000) + ' g).'
        : 'θeq = ' + fmt(r.thetaEq, 1) + ' °C; ΣQ = ' + fmt(soma, 1) + ' kJ.';

      zonaTexto.textContent = '';
      const dl = criar('dl', 'painel-valores');
      const linha = (rot, v) => { dl.appendChild(criar('dt', '', rot)); dl.appendChild(criar('dd', '', v)); };
      linha('Temperatura de equilíbrio θeq', fmt(r.thetaEq, 1) + ' °C' + (porDerreter ? ' (gelo por derreter)' : ''));
      linha('Água: Q', fmt(Q[0], 2) + ' kJ (' + (Q[0] < 0 ? 'cede' : Q[0] > 0 ? 'recebe' : 'não troca') + ' energia)');
      linha('Segundo corpo (' + nome2 + '): Q', fmt(Q[1], 2) + ' kJ (' + (Q[1] < 0 ? 'cede' : Q[1] > 0 ? 'recebe' : 'não troca') + ' energia)');
      linha('Balanço Q cedido + Q recebido', fmt(Q[0], 2) + ' + (' + fmt(Q[1], 2) + ') = ' + fmt(soma, 2) + ' kJ');
      if (metal) linha('Capacidade térmica mássica do ' + nomeMetal.toLowerCase(), fmt(D.capacidadeTermicaMassica[est.metal]) + ' J kg⁻¹ °C⁻¹');
      if (gelo) {
        linha('Gelo derretido', fmt(r.geloDerretido * 1000) + ' g de ' + fmt(est.m2 * 1000) + ' g');
        if (porDerreter) linha('Gelo por derreter', fmt(r.geloRestante * 1000) + ' g (a água cedeu toda a energia que podia sem chegar a congelar)');
      }
      zonaTexto.appendChild(dl);
      if (porDerreter) {
        const aviso = criar('p', 'esq-aviso', 'Gelo em excesso: a água arrefece até 0 °C e não tem energia para derreter todo o gelo. A mistura fica a θeq = 0 °C, com água líquida e gelo por derreter (' + fmt(r.geloRestante * 1000) + ' g).');
        aviso.setAttribute('data-estado', 'gelo-por-derreter');
        zonaTexto.appendChild(aviso);
      }
      zonaTexto.appendChild(criar('p', 'esq-legenda', 'Recipiente isolado e sem perdas: o corpo mais quente cede energia (Q < 0) e o mais frio recebe (Q > 0), com Q cedido + Q recebido = 0. Cada Q = m c Δθ; o gelo recebe ainda m Δh de fusão.'));
    }

    atualizar();

    return {
      destruir() {
        botoes.forEach((x) => x.b.removeEventListener('click', x.aoClicar));
        sliders.forEach((s) => s.destruir());
        el.textContent = '';
      },
    };
  },
});
