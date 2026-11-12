globalThis.Manual = globalThis.Manual || {};
Manual.esquemas = Manual.esquemas || {};

Manual.esquemas.registar('salario', {
  montar(el, opcoes) {
    const N = Manual.nucleo;
    const C = Manual.calc.cidadania;
    opcoes = opcoes || {};
    const MESES = 14; // 12 meses + subsídios de férias e de Natal
    const fmt = (v) => Number(v).toLocaleString('pt-PT', { maximumFractionDigits: 2 });
    const eur = (v) => fmt(v) + ' €';
    const pct = (v) => fmt(v * 100) + ' %';

    function criar(tag, classe, texto) {
      const e = document.createElement(tag);
      if (classe) e.className = classe;
      if (texto !== undefined) e.textContent = texto;
      return e;
    }

    const brutoInicial = Number.isFinite(Number(opcoes.bruto)) && Number(opcoes.bruto) >= 0
      ? Math.round(Number(opcoes.bruto) / 10) * 10 : 1200;
    let bruto = brutoInicial;

    el.textContent = '';
    const raiz = criar('div', 'esq-salario');
    el.appendChild(raiz);

    const zonaSlider = criar('div');
    raiz.appendChild(zonaSlider);
    const slider = N.slider(zonaSlider, {
      rotulo: 'Salário bruto mensal (€)',
      min: 0, max: Math.max(10000, brutoInicial), passo: 10, valor: brutoInicial,
      aoMudar: (v) => { bruto = v; atualizar(); },
    });

    raiz.appendChild(criar('p', 'esq-aviso', 'Valores ilustrativos: consulta as tabelas oficiais do ano no Portal das Finanças.'));
    raiz.appendChild(criar('p', 'esq-aviso', 'Nesta tabela simplificada, passar para o escalão seguinte pode baixar o salário líquido; as tabelas oficiais evitam isto com a parcela a abater.'));

    const zonaResultado = criar('div');
    zonaResultado.setAttribute('aria-live', 'polite');
    raiz.appendChild(zonaResultado);

    function atualizar() {
      zonaResultado.textContent = '';
      const s = C.salario(bruto);
      const anual = bruto * MESES;
      const irs = C.irsAnual(anual, C.ESCALOES_IRS_ILUSTRATIVOS);

      zonaResultado.appendChild(criar('div', 'esq-subtitulo', 'Do bruto ao líquido (por mês)'));
      const painelEl = criar('div');
      zonaResultado.appendChild(painelEl);
      N.painelValores(painelEl).definir([
        ['Bruto', eur(s.bruto)],
        ['− Segurança Social (11 %)', '− ' + eur(s.ss)],
        ['− Retenção na fonte (' + pct(s.taxaRetencao) + ')', '− ' + eur(s.retencao)],
        ['Líquido', eur(s.liquido)],
      ]);
      zonaResultado.appendChild(criar('p', null,
        eur(s.bruto) + ' − ' + eur(s.ss) + ' − ' + eur(s.retencao) + ' = ' + eur(s.liquido)));

      // barras do bruto repartido
      const caixa = criar('div', 'barras');
      const partes = [['Segurança Social', s.ss, 'var(--cor-2)'], ['Retenção', s.retencao, 'var(--cor-5)'], ['Líquido', s.liquido, 'var(--cor-3)']];
      for (const [nome, valor, cor] of partes) {
        const linha = criar('div', 'barra-linha');
        linha.appendChild(criar('span', null, nome));
        const pista = criar('div', 'barra-pista');
        const enc = criar('div', 'barra-enchimento');
        enc.style.width = (s.bruto > 0 ? 100 * valor / s.bruto : 0) + '%';
        enc.style.background = cor;
        pista.appendChild(enc);
        linha.appendChild(pista);
        linha.appendChild(criar('span', 'barra-valor', eur(valor) + (s.bruto > 0 ? ' (' + pct(valor / s.bruto) + ' do bruto)' : '')));
        caixa.appendChild(linha);
      }
      zonaResultado.appendChild(caixa);

      // IRS anual por escalões
      zonaResultado.appendChild(criar('div', 'esq-subtitulo', 'IRS anual por escalões (ilustrativo)'));
      zonaResultado.appendChild(criar('p', null,
        'Rendimento anual = ' + fmt(bruto) + ' × ' + MESES + ' = ' + eur(anual) + '. Cada taxa aplica-se só à parte do rendimento dentro do escalão.'));
      const maxImposto = Math.max(1, ...irs.parcelas.map((p) => p.valor));
      const linhas = C.ESCALOES_IRS_ILUSTRATIVOS.map((e, i) => {
        const p = irs.parcelas[i];
        const base = p ? p.base : 0;
        const valor = p ? p.valor : 0;
        const de = i === 0 ? 0 : C.ESCALOES_IRS_ILUSTRATIVOS[i - 1].ate;
        const intervalo = Number.isFinite(e.ate) ? 'de ' + fmt(de) + ' a ' + fmt(e.ate) + ' €' : 'acima de ' + fmt(de) + ' €';
        return [intervalo, pct(e.taxa), eur(base), eur(valor)];
      });
      const envol = criar('div', 'quadro-envolvente');
      N.tabela(envol, ['Escalão', 'Taxa', 'Rendimento no escalão', 'Imposto'], linhas);
      zonaResultado.appendChild(envol);

      const barras = criar('div', 'barras');
      C.ESCALOES_IRS_ILUSTRATIVOS.forEach((e, i) => {
        const p = irs.parcelas[i];
        const valor = p ? p.valor : 0;
        const linha = criar('div', 'barra-linha');
        linha.appendChild(criar('span', null, 'Escalão ' + (i + 1)));
        const pista = criar('div', 'barra-pista');
        const enc = criar('div', 'barra-enchimento');
        enc.style.width = (100 * valor / maxImposto) + '%';
        enc.style.background = 'var(--cor-1)';
        pista.appendChild(enc);
        linha.appendChild(pista);
        linha.appendChild(criar('span', 'barra-valor', eur(valor) + ' (taxa ' + pct(e.taxa) + ')'));
        barras.appendChild(linha);
      });
      zonaResultado.appendChild(barras);

      const painel2 = criar('div');
      zonaResultado.appendChild(painel2);
      N.painelValores(painel2).definir([
        ['Imposto total (ilustrativo)', eur(irs.imposto)],
        ['Taxa média', anual > 0 ? pct(irs.imposto / anual) : '—'],
      ]);
    }

    atualizar();

    return {
      destruir() {
        slider.destruir();
        el.textContent = '';
      },
    };
  },
});
