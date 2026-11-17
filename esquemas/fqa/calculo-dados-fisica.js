globalThis.Manual = globalThis.Manual || {};

// Dados de Física de referência (energia, circuitos, balanços térmicos). Fonte de cada bloco em `fontes`.
// Nenhum outro ficheiro escreve valores de Física à mão: usam sempre Manual.dadosFisica.
Manual.dadosFisica = (function () {
  // m s⁻²
  const constantes = { g: 10 };

  // J kg⁻¹ °C⁻¹ (= J kg⁻¹ K⁻¹)
  const capacidadeTermicaMassica = {
    agua: 4.18e3,
    gelo: 2.1e3,
    aluminio: 900,
    cobre: 386,
    ferro: 450,
    chumbo: 128,
  };

  // J kg⁻¹
  const entalpiaMassica = { fusaoGelo: 3.34e5, vaporizacaoAgua: 2.26e6 };

  // °C, à pressão normal (1 atm)
  const temperaturas = { fusaoGelo: 0, ebulicaoAgua: 100 };

  // Modelos ilustrativos (não são medições de um aparelho concreto).
  // pilha: força eletromotriz (V) e resistência interna (Ω).
  // painel: modelo de um díodo; Isc e Uoc a 1000 W m⁻² (irradianciaReferencia); Isc em A, Uoc e UT em V, área em m².
  const modelos = {
    pilha: { epsilon: 4.5, r: 1.5 },
    painel: { Isc: 0.5, Uoc: 6, UT: 0.33, area: 0.016, irradianciaReferencia: 1000 },
  };

  const fontes = {
    constantes: 'g = 10 m s⁻², valor do formulário do IAVE (Informação-Prova de Física e Química A, 715); os enunciados dizem sempre o valor usado.',
    capacidadeTermicaMassica: 'Água (4,18 × 10³) e gelo (2,1 × 10³ J kg⁻¹ °C⁻¹): valores de referência habituais nos manuais e exames portugueses '
      + '(HyperPhysics, "Table of Specific Heats", hyperphysics.gsu.edu, dá 4186 a 20 °C e 2050 a −10 °C). '
      + 'Alumínio 900, cobre 386 e chumbo 128 J kg⁻¹ °C⁻¹: HyperPhysics, "Table of Specific Heats" (valores a 20 °C; consultada em 2026-11-17). '
      + 'Ferro 450 J kg⁻¹ °C⁻¹: The Engineering Toolbox, "Metals – Specific Heats" (engineeringtoolbox.com, linha "Iron", 0,45 kJ kg⁻¹ K⁻¹; '
      + 'consultada em 2026-11-17). Os valores variam pouco com a temperatura no intervalo usado nos exercícios.',
    entalpiaMassica: 'Variação de entalpia mássica de fusão do gelo (3,34 × 10⁵ J kg⁻¹, a 0 °C) e de vaporização da água (2,26 × 10⁶ J kg⁻¹, '
      + 'a 100 °C), à pressão normal: valores de referência habituais nos manuais e exames portugueses. The Engineering Toolbox '
      + '(engineeringtoolbox.com; consultada em 2026-11-17): "Latent Heat of Melting common Materials", Water/Ice 334 kJ kg⁻¹; '
      + '"Liquids – Latent Heat of Evaporation", água a 100 °C e pressão atmosférica 2256 kJ kg⁻¹ (arredondado a 2,26 × 10⁶ J kg⁻¹).',
    temperaturas: 'Temperaturas de fusão do gelo (0 °C) e de ebulição da água (100 °C) à pressão normal (1 atm = 101 325 Pa); '
      + 'a de ebulição a 1 atm é 99,97 °C na ITS-90, arredondada a 100 °C como nos manuais.',
    modelos: 'Modelos ilustrativos, não medições: a pilha (ε = 4,5 V, r = 1,5 Ω) tem valores plausíveis de uma pilha plana de 4,5 V '
      + 'usada nas atividades laboratoriais. O painel é um pequeno painel de AL (10 a 12 células em série), descrito pela curva '
      + 'modelo de um díodo, I = IL − I0 (e^(U/UT) − 1), com Isc = 0,5 A e Uoc = 6 V a 1000 W m⁻², UT = 0,33 V (≈ fator de idealidade × '
      + 'n.º de células × kT/e) e área 0,016 m²; dá fator de forma ≈ 0,79 e rendimento máximo ≈ 15 %, como num painel real de silício. '
      + 'A corrente fotogerada é proporcional à irradiância, IL = Isc × irradiância/(1000 W m⁻²); a corrente de saturação '
      + 'I0 = Isc/(e^(Uoc/UT) − 1) é fixa, por isso Uoc(G) = UT ln(1 + IL/I0) desce um pouco quando a irradiância baixa '
      + '(≈ −0,23 V a 500 W m⁻² e ≈ −0,76 V a 100 W m⁻²), como num painel real. A 1000 W m⁻² a curva coincide com '
      + 'I = Isc (1 − e^((U − Uoc)/UT)) a menos de I0 (≈ 6 × 10⁻⁹ A). Sem resistências série e paralelo nem efeito da temperatura.',
  };

  return { constantes, capacidadeTermicaMassica, entalpiaMassica, temperaturas, modelos, fontes };
})();
