# Manual Interativo do 10.º Ano — Fase 3B: Física e Química A, componente de Física

- **Data:** 2026-11-17
- **Estado:** o utilizador mandou continuar ("continua") depois da Fase 3A, com as mesmas regras de execução. Todas as escolhas abaixo são **[decisões minhas]**, no seguimento direto da Fase 3A.
- **Depende de:** Fase 3A (`2026-11-15-manual-10ano-fase3a-quimica-design.md`), cujas regras se mantêm todas: formatos de pergunta, notação científica, `toleranciaRelativa`, `algarismos`, figura no enunciado, figuras explodidas, dados com fonte, autoria dos geradores, browser a 375 px em claro e escuro.

## 1. Intenção

A componente de Física do 10.º ano de FQ-A completa a disciplina. A aluna passa a ter, para a energia, o mesmo que tem em Química:
- páginas curtas com o essencial e esquemas que se mexem;
- exercícios sempre diferentes, verificados por código;
- Treino, Teste e progresso.

A nota "Física — em breve" desaparece.

## 2. Referencial curricular

- AE de FQ-A 10.º ano, 2018, domínio **"Energia e sua conservação"**, com três subdomínios:
  - Energia e movimentos;
  - Energia e fenómenos elétricos;
  - Energia, fenómenos térmicos e radiação.
- A revisão de março de 2026 torna explícitos alguns objetivos e entram como frases próprias marcadas `// revisão 2026`:
  - calcular o trabalho de uma força constante;
  - aplicar o Teorema da Energia Cinética;
  - potência e efeito Joule;
  - temperatura e equilíbrio térmico;
  - calor como energia transferida espontaneamente;
  - variação de energia interna com o seu sinal.
- Cobre-se a união das duas versões, como na Química. Textos em `docs/referencias/`.

## 3. Âmbito

### Incluído

- **Conteúdo:** 3 temas novos em `fqa`, um por subdomínio, com 8 subtemas, no modelo de página habitual (essencial, resumo, mini-quiz de 4–6 perguntas com erros típicos).
- **Esquemas e figuras:** os esquemas da secção 5 e pelo menos 3 figuras explodidas.
- **Exercícios:** geradores, pelo menos 3 por subtema (≥ 24), cada um com ≥ 2 formatos ou contextos; verificação de 2000 sementes sem erros.
- **Dados de Física com fonte:** num bloco próprio, `esquemas/fqa/calculo-dados-fisica.js`, com os cálculos em `calculo-fisica.js`.
- **Disciplina completa:** `porFazer` sai do índice.

### Fora do âmbito

- Cinemática e dinâmica vetorial: são do 11.º ano.
- Circuitos com mais de um gerador.
- Simulações numéricas de movimento: os esquemas usam fórmulas fechadas.

## 4. Conteúdos

**Tema "Energia e movimentos" (`movimentos`)**

| Subtema (id) | Conteúdo |
|---|---|
| Energia de um sistema mecânico (`sistema-mecanico`) | Sistema, fronteira e vizinhança; modelo do centro de massa; energia cinética $E_c = \tfrac12 m v^2$; energia potencial gravítica $E_{pg} = m g h$ (com nível de referência); energia mecânica; transferências por trabalho. |
| Trabalho e Teorema da Energia Cinética (`trabalho`) | Trabalho de uma força constante $W = F\,d\cos\alpha$, com o sinal conforme o ângulo; trabalho da resultante; Teorema da Energia Cinética $W_{F_R} = \Delta E_c$; AL: $\Delta E_c$ em função da distância (tratamento de dados, reta). |
| Forças conservativas e conservação da energia mecânica (`energia-mecanica`) | Força conservativa: o peso, $W_P = -\Delta E_{pg}$; forças não conservativas, $W_{FNC} = \Delta E_m$; conservação da energia mecânica; situações do quotidiano (planos inclinados, montanha-russa, travagem); AL: queda e ressalto de uma bola (coeficiente de restituição em energia, dissipação). |

**Tema "Energia e fenómenos elétricos" (`eletricidade`)**

| Subtema (id) | Conteúdo |
|---|---|
| Corrente, diferença de potencial e resistência (`circuitos`) | Corrente elétrica $I = Q/\Delta t$; diferença de potencial $U$; resistência $R = U/I$ e resistência de um condutor; associação de resistências em série e em paralelo; medição com amperímetro e voltímetro; potência $P = U I$; efeito Joule, $P = R I^2$. |
| Geradores e energia num circuito (`gerador`) | Força eletromotriz e resistência interna; característica do gerador $U = \varepsilon - r I$ (gráfico U–I; corrente de curto-circuito); AL: características de uma pilha; conservação da energia num circuito, $\varepsilon I = U I + r I^2$; rendimento do gerador; importância e impactos da energia elétrica. |

**Tema "Energia, fenómenos térmicos e radiação" (`termica`)**

| Subtema (id) | Conteúdo |
|---|---|
| Sistemas termodinâmicos e transferências de energia (`transferencias`) | Sistema termodinâmico; energia interna; temperatura e equilíbrio térmico (a temperatura sobe com a energia cinética média das partículas); calor e trabalho; condução, convecção e radiação; todos os corpos emitem radiação e, à temperatura ambiente, sobretudo no infravermelho (termografia, aplicações); condutividade térmica (qualitativa). |
| Balanços energéticos (`balancos`) | Primeira Lei da Termodinâmica $\Delta U = W + Q + R$, com sinais e contexto histórico (Joule, Mayer); capacidade térmica mássica $Q = m c \Delta\theta$; variação de entalpia mássica de fusão e de vaporização $Q = m\,\Delta h$; curvas de aquecimento; misturas e equilíbrio térmico; AL: capacidade térmica mássica de um material e entalpia mássica de fusão do gelo. |
| Rendimento e Segunda Lei (`rendimento`) | Energia útil e dissipada; rendimento $\eta = E_{útil}/E_{fornecida}$; degradação da energia e Segunda Lei (os processos espontâneos diminuem a energia útil); painel fotovoltaico: irradiância, potência em função de $U$ (ponto de potência máxima), rendimento (AL); uso sustentável e literacia energética. |

## 5. Esquemas interativos

| Esquema (id) | Subtema | O que a aluna faz |
|---|---|---|
| `fqa-energias` | sistema-mecanico, energia-mecanica | Escolhe a altura e a velocidade de um carrinho numa rampa ou montanha-russa simples, com ou sem atrito, e vê barras de $E_c$, $E_{pg}$ e $E_m$ (e a energia dissipada) ao longo do percurso. |
| `fqa-trabalho` | trabalho | Ajusta a força, o ângulo e o deslocamento; vê a componente eficaz e $W$ com o seu sinal. |
| `fqa-ressalto` | energia-mecanica | Escolhe a altura de queda e a fração de energia conservada em cada ressalto; vê as alturas sucessivas e a energia dissipada (AL). |
| `fqa-circuito` | circuitos | Monta resistências em série ou em paralelo com uma fonte; vê $I$ e $U$ em cada componente (leituras de amperímetro e voltímetro) e a potência dissipada. |
| `fqa-gerador` | gerador | Muda a resistência exterior; vê o ponto na característica $U = \varepsilon - rI$, a potência útil, a potência dissipada no gerador e o rendimento. |
| `fqa-aquecimento` | balancos | Aquece uma massa de gelo a partir de $-\theta_0$ com uma potência dada; vê a curva temperatura–tempo com os patamares de fusão e de ebulição e a energia de cada troço. |
| `fqa-mistura` | balancos | Mistura duas massas de água, ou água e um metal, a temperaturas diferentes; vê a temperatura de equilíbrio e o balanço $Q_{cedido} + Q_{recebido} = 0$. |
| `fqa-painel` | rendimento | Muda a irradiância e a resistência de carga; vê a curva P–U do painel, o ponto de potência máxima e o rendimento. |

**Figuras explodidas (mínimo 3):** circuito com amperímetro e voltímetro (fonte, interruptor, resistência, amperímetro em série, voltímetro em paralelo, fios); calorímetro (vaso, isolamento, tampa, termómetro, agitador, resistência de aquecimento); painel fotovoltaico em montagem de AL (painel, fonte de luz, reóstato, amperímetro, voltímetro).

## 6. Dados de Física **[decisões minhas]**

- $g = 10\ \mathrm{m\,s^{-2}}$, como no formulário do IAVE (exame 715); os enunciados dizem sempre o valor.
- Capacidades térmicas mássicas (água, gelo, alumínio, cobre, ferro, chumbo) e entalpias mássicas de fusão e de vaporização da água vêm de uma tabela de referência citada (as usadas nos exames, quando existirem), cada bloco com a sua fonte.
- Os dados de uma pilha típica (ε, r) e de um painel típico (curva I–U ilustrativa) são **modelos**, declarados como tal no texto e no ficheiro, com parâmetros plausíveis e citados.

## 7. Geradores (≥ 3 por subtema)

| Subtema | Tipos de gerador (exemplos) |
|---|---|
| sistema-mecanico | $E_c$ e $E_{pg}$ (todas as direções); energia mecânica; massa ou velocidade a partir da energia |
| trabalho | $W$ com o ângulo e o seu sinal; trabalho da resultante e TEC; distância de travagem |
| energia-mecanica | conservação (velocidade no fundo, altura máxima); trabalho das forças não conservativas a partir de $\Delta E_m$; ressalto (fração de energia, altura) |
| circuitos | lei $R = U/I$; série e paralelo (resistência equivalente, $I$, $U$); potência e efeito Joule, energia em kWh |
| gerador | $U = \varepsilon - rI$ (cada incógnita); ε e r a partir de dois pontos ou da reta; rendimento do gerador e balanço $\varepsilon I = UI + rI^2$ |
| transferencias | mecanismo de transferência numa situação; equilíbrio térmico e sentido do calor; radiação IV (afirmações V/F) |
| balancos | $Q = mc\Delta\theta$ (cada incógnita); fusão e vaporização $Q = m\Delta h$; mistura e temperatura de equilíbrio; sinais na Primeira Lei |
| rendimento | rendimento e energia dissipada; potência do painel e ponto de potência máxima; rendimento do painel (irradiância × área) |

Erros típicos reais a usar, quando os dados os produzem:
- esquecer $\tfrac12$ ou o quadrado de $v$;
- $\cos\alpha$ em vez de $\sin\alpha$, ou o sinal do trabalho;
- somar resistências em paralelo;
- $U = \varepsilon + rI$;
- trocar °C por K quando não interessa e esquecer $\Delta$;
- esquecer a fusão no balanço;
- confundir potência com energia;
- kWh ↔ J;
- rendimento > 1.

## 8. Qualidade

Igual à Fase 3A §10:
- testes dos cálculos e dos dados;
- testes dos esquemas com o DOM falso, que devolve NodeList sem métodos de array;
- harness de 2000 sementes sem erros;
- revisão científica de cada tarefa;
- browser real a 375 px, em claro e escuro, sem fórmulas com erro e sem deslocamento horizontal. As equações e fórmulas longas têm de poder quebrar (lição da Fase 3A).

## 9. Decisões de construção (resposta à verificação do construtor) **[decisões minhas]**

1. **Objetivos AE:**
   - As frases de Física juntam-se à mesma lista `Manual.ae.fqa` (`conteudos/fqa/ae.js`), literais e pela ordem das AE de 2018. As frases partidas pela extração do PDF voltam a juntar-se.
   - As frases de 2026 só entram quando dizem algo novo. Entram como frases próprias, com o comentário `// revisão 2026`, e cada frase composta de 2026 conta como um objetivo.
   - A cobertura é validada como na Química: a mesma frase tem de estar num subtema.
2. **Esquemas por subtema:**
   - Pelo menos um esquema ou uma figura em cada subtema.
   - `transferencias` recebe um esquema simples, `fqa-transferencias`: três painéis animados (condução numa barra, convecção num recipiente, radiação de um corpo quente). Pode-se mudar a temperatura e aparece o mecanismo dominante e o sentido do calor.
   - As AL de reta ($\Delta E_c$ em função de $d$; característica da pilha) não têm esquema de ajuste. Ficam no texto, com um exemplo resolvido, e nos geradores. O esquema `fqa-gerador` já mostra a reta $U$–$I$.
3. **Modelos dos esquemas:**
   - `fqa-energias` usa percursos feitos de planos inclinados e troços horizontais (com o comprimento conhecido), com atrito de força constante. Assim o trabalho do atrito é $F_a \cdot d$, em fórmula fechada.
   - `fqa-painel` usa uma curva I–U modelo, $I = I_{sc}\,(1 - e^{(U - U_{oc})/U_T})$ com parâmetros declarados. O ponto de funcionamento, para uma resistência de carga, encontra-se por bissecção, o que é aceitável. A potência máxima obtém-se pela curva.
4. **Convenções de sinal:**
   - Primeira Lei: $\Delta U = W + Q + R$, positivos quando a energia é recebida pelo sistema, como nos exames do IAVE.
   - Trabalho: $W = F\,d\cos\alpha$ com o sinal dado pelo ângulo.
   - TEC: $W_{F_R} = \Delta E_c$.
   - Peso: $W_P = -\Delta E_{pg}$.
5. **Geradores qualitativos:** corpus escrito à mão com cerca de 10 situações por gerador. Cada situação tem uma fonte de verdade escrita no gerador (o mecanismo, o sentido do calor, verdadeiro ou falso), e os testes confirmam que não há duas iguais.
6. **Dados:**
   - Um bloco por grandeza, cada um com a sua fonte.
   - Calor: $c$(água) = 4,18 × 10³ J kg⁻¹ °C⁻¹; $c$(gelo) = 2,1 × 10³; $\Delta h$ de fusão = 3,34 × 10⁵ J kg⁻¹; $\Delta h$ de vaporização = 2,26 × 10⁶ J kg⁻¹. Valores de referência habituais, citados por fonte.
   - Metais: de uma tabela citada.
   - Constantes: $g$ = 10 m s⁻² em todo o lado. Os enunciados dizem sempre os valores.
