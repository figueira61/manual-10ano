# Fase 3B — Física de FQ-A: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar Física e Química A com a componente de Física: 3 temas e 8 subtemas, com conteúdo, esquemas, figuras explodidas e pelo menos 24 geradores. A nota "Física — em breve" deixa de aparecer.

**Architecture:** Segue exatamente o modelo da Fase 3A:
- dados e cálculos puros em `esquemas/fqa/calculo-dados-fisica.js` e `esquemas/fqa/calculo-fisica.js`, carregados pela convenção `calculo-*.js`;
- conteúdo em `conteudos/fqa/{movimentos,eletricidade,termica}.js`;
- geradores em `js/geradores/fqa/fisica-*.js`;
- esquemas em `esquemas/fqa/`;
- figuras feitas com `Manual.figura.criarEsquema`.

**Tech Stack:** O de sempre: JS clássico no namespace `Manual`, sem build, KaTeX vendorizado, SVG, `node --test`, validador e harness de 2000 sementes.

**Spec:** `docs/superpowers/specs/2026-11-17-manual-10ano-fase3b-fisica-design.md`. Também valem as regras da Fase 3A: spec `2026-11-15-…-fase3a-quimica-design.md` §11 e a secção Global Constraints do plano `2026-11-15-manual-10ano-fase3a.md`.

## Global Constraints

- **Língua:** PT-PT, tratamento por "tu", Acordo Ortográfico de 1990, terminologia das AE: energia cinética, energia potencial gravítica, energia mecânica, trabalho, força conservativa e força não conservativa, diferença de potencial elétrico, força eletromotriz, resistência interna, efeito Joule, capacidade térmica mássica, variação de entalpia mássica, rendimento, irradiância.
- **Sem dependências novas:**
  - nada de CDN nem de passo de build;
  - cada ficheiro novo entra no `index.html` (se for de carregamento imediato) e no `lista-cache.js` (`npm run cache`).
- **Valores:**
  - os valores de Física vêm só de `Manual.dadosFisica`, e cada bloco tem a sua fonte;
  - $g = 10\ \mathrm{m\,s^{-2}}$;
  - os enunciados dizem sempre os valores de que a aluna precisa.
- **Convenções:**
  - $\Delta U = W + Q + R$, com tudo positivo quando o sistema recebe energia;
  - $W = F d\cos\alpha$;
  - $W_P = -\Delta E_{pg}$;
  - $W_{F_R} = \Delta E_c$;
  - $W_{FNC} = \Delta E_m$.
- **Regras de autoria dos geradores** (Fase 3A, regras-autoria-geradores):
  - concordância com 1 ("1 eletrão", "1 resistência");
  - opções plausíveis e na escala certa;
  - nenhum erro típico com valor perto de 0;
  - sem zeros finais de calculadora;
  - "≈" quando o valor está arredondado;
  - `algarismos` quando se pedem algarismos significativos;
  - `toleranciaRelativa` para valores muito grandes ou muito pequenos;
  - códigos de erro com texto em `EXCECOES` (js/painel.js) e no snapshot;
  - cada opção errada é um erro típico real, cuja explicação diz o valor mostrado.
- **Fórmulas e equações:** as longas têm de poder quebrar (lição da Fase 3A). Nada de um único grupo `\mathrm{}` com operadores lá dentro; usar `\text{}` curto ou fórmulas de bloco quando forem longas.
- **Esquemas e figuras:**
  - funcionam com o teclado e mostram os valores também em texto;
  - funcionam no tema claro e no escuro;
  - a 375 px não há deslocamento horizontal;
  - respeitam `prefers-reduced-motion`;
  - o DOM falso devolve NodeList sem métodos de array.
- **Índice:** `fqa` continua `disponivel: true`. Os temas novos entram no índice na tarefa de conteúdo que os escreve (Tasks 5 e 6), nunca antes, e `porFazer` sai na Task 9.
- **Git:**
  - commits com a identidade noreply e o trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - ramo `fase-3b`;
  - nada de push nem de merge.
- **Verificações:** `npm test`, `npm run validar` e `npm run verificar` (todos os geradores, 0 erros) continuam a passar.

## Review Focus

1. **Ângulo de 90° no trabalho:** $\cos 90° = 0$ dá trabalho nulo. O enunciado e a resposta lidam com $W = 0$ sem tratar um "0" escrito pela aluna como erro típico (teste na Task 7).
2. **Mistura térmica com mudança de fase:** quando o gelo não chega a derreter todo, a temperatura de equilíbrio é 0 °C. Os geradores ou tratam esse caso bem ou não o geram (teste na Task 8).
3. **Gerador com resistência exterior nula:** a corrente de curto-circuito é $\varepsilon/r$. O esquema e o gerador não dividem por zero (testes nas Tasks 3 e 8).
4. **Rendimento nunca acima de 100 %:** em todos os geradores e esquemas (teste na Task 8).
5. **Atrito maior do que a energia disponível:** o carrinho para antes do fim do percurso. O esquema mostra onde para e nunca mostra uma velocidade imaginária (teste na Task 2).

---

### Task 1: Dados e cálculos de Física

**Files:**
- Create: `esquemas/fqa/calculo-dados-fisica.js`, `esquemas/fqa/calculo-fisica.js`, `tests/calculo-fisica.test.js`.

**Interfaces:**
- **`Manual.dadosFisica`:**
  - `constantes: { g: 10 }`;
  - `capacidadeTermicaMassica: { agua: 4.18e3, gelo: 2.1e3, aluminio, cobre, ferro, chumbo }`, em J kg⁻¹ °C⁻¹;
  - `entalpiaMassica: { fusaoGelo: 3.34e5, vaporizacaoAgua: 2.26e6 }`, em J kg⁻¹;
  - `modelos: { pilha: { epsilon, r }, painel: { Isc, Uoc, UT, area } }`, declarados como modelos ilustrativos;
  - `fontes: { … }`, uma por bloco.
- **`Manual.fisica`**, funções puras, todas testadas:
  - `ec(m, v)`, `epg(m, h)`, `em(m, v, h)`, `vDeEc(ec, m)`, `trabalho(F, d, alfaGraus)`;
  - `travagem({ m, v0, Fa }) -> d`;
  - `conservacao({ h0, v0, h }) -> v` (sem atrito);
  - `comAtrito({ m, h0, v0, Fa, percurso: [{ tipo: 'plano'|'horizontal', comprimento, desnivel }] }) -> [{ s, h, v, ec, epg, dissipada, parou: boolean }]`. Quando a energia acaba, `parou` passa a true e não há raízes de números negativos;
  - `ressalto(h0, fracao, n) -> [h1..hn]`;
  - `resistenciaSerie(rs)`, `resistenciaParalelo(rs)`;
  - `circuito({ U, rs, ligacao }) -> { Req, I, porComponente: [{ R, I, U, P }] }`;
  - `gerador({ epsilon, r, Rext }) -> { I, U, Putil, Pdissipada, Ptotal, rendimento }`. Com `Rext = 0`, `I = epsilon/r`, `U = 0` e `rendimento = 0`;
  - `caracteristicaDeDoisPontos([I1, U1], [I2, U2]) -> { epsilon, r }`;
  - `calor(m, c, dTheta)`, `calorFase(m, dh)`;
  - `aquecimentoGelo({ m, theta0, thetaF, P }) -> troços [{ fase, Q, t0, t1, theta0, theta1 }]`;
  - `mistura([{ m, c, theta, fase? }]) -> { thetaEq, gelo derretido }`. Inclui o caso do gelo que não derrete todo, em que $\theta_{eq} = 0$ °C;
  - `rendimento(util, fornecida)`, que lança erro se o resultado passar de 1;
  - `painel({ irradiancia, Rcarga }) -> { U, I, P, rendimento }`, por bissecção sobre a curva modelo;
  - `painelPotenciaMaxima(irradiancia) -> { U, I, P }`.

- [ ] **Step 1: Testes que falham, com os valores do enunciado**
  - Energia mecânica:
    - `ec(2, 3) === 9`;
    - `epg(2, 5) === 100` com g = 10;
    - `conservacao({ h0: 5, v0: 0, h: 0 })` ≈ 10 m/s;
    - `trabalho(10, 2, 60)` ≈ 10 e `trabalho(10, 2, 90) === 0`;
    - `comAtrito` com o atrito a gastar mais energia do que a disponível dá `parou: true` e nunca devolve NaN;
    - `ressalto(1, 0.8, 3)` dá `[0.8, 0.64, 0.512]`.
  - Circuitos:
    - `resistenciaParalelo([6, 3]) === 2`;
    - `gerador({ epsilon: 9, r: 1, Rext: 0 })` dá `I = 9` e `rendimento = 0`;
    - `gerador({ epsilon: 9, r: 1, Rext: 8 })` dá `I = 1`, `U = 8` e `rendimento` ≈ 0,889;
    - `caracteristicaDeDoisPontos([1, 8], [2, 7])` dá `{ epsilon: 9, r: 1 }`.
  - Térmica:
    - `calor(0.5, 4180, 20) === 41800`;
    - `mistura` de 0,1 kg de água a 80 °C com 0,1 kg a 20 °C dá 50 °C;
    - `mistura` de 0,5 kg de água a 20 °C com 0,5 kg de gelo a 0 °C dá 0 °C, com o gelo só parcialmente derretido (massa derretida calculada).
  - Rendimento: `rendimento(5, 4)` lança erro.
  - Painel: `painel` com uma carga maior aumenta $U$ e diminui $I$, e a potência máxima fica entre os extremos.
  - Dados: cada bloco de `fontes` existe e é um texto não vazio.
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar. As fontes podem ser procuradas na web, desde que públicas.
- [ ] **Step 4:** Correr `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: dados e cálculos de Física (com fontes)`.

### Task 2: Esquemas de movimentos e figuras

**Files:**
- Create:
  - `esquemas/fqa/fqa-energias.js`, `fqa-trabalho.js`, `fqa-ressalto.js`;
  - `tests/esquemas-fqa-movimentos.test.js`.

**Interfaces:** O comportamento é o da spec §5 e §9.3. Usa `Manual.fisica`.

- [ ] **Step 1: Testes que falham** (DOM falso)
  - Cada esquema monta e desmonta sem deixar ouvintes ativos.
  - `fqa-energias`:
    - sem atrito, a soma $E_c + E_{pg}$ mostrada é constante;
    - com um atrito grande, aparece "O carrinho para em s = … m" e nenhum valor é NaN.
  - `fqa-trabalho` a 90° mostra "W = 0 J".
  - `fqa-ressalto` com h0 = 1 e fração 0,8 mostra as alturas 0,80, 0,64 e 0,51.
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: esquemas de Física — energias, trabalho, ressalto`.

### Task 3: Esquemas de eletricidade e figura do circuito

**Files:**
- Create:
  - `esquemas/fqa/fqa-circuito.js`, `fqa-gerador.js`;
  - a figura explodida `fig-circuito.js`, com as partes fonte, interruptor, resistência, amperímetro em série, voltímetro em paralelo e fios;
  - `tests/esquemas-fqa-eletricidade.test.js`.

- [ ] **Step 1: Testes que falham**
  - Montar e desmontar sem ouvintes ativos.
  - `fqa-circuito` em paralelo com 6 Ω e 3 Ω a 6 V mostra $R_{eq}$ = 2 Ω, $I$ = 3 A e 1 A e 2 A nos ramos.
  - `fqa-gerador` com Rext = 0 mostra "curto-circuito", $I = \varepsilon/r$ e nunca "Infinity" nem NaN.
  - A figura `fig-circuito` tem as 6 partes.
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: esquemas de Física — circuito, gerador e figura do circuito`.

### Task 4: Esquemas de térmica e figuras do calorímetro e do painel

**Files:**
- Create:
  - `esquemas/fqa/fqa-transferencias.js`, `fqa-aquecimento.js`, `fqa-mistura.js`, `fqa-painel.js`;
  - as figuras `fig-calorimetro.js` (vaso, isolamento, tampa, termómetro, agitador, resistência de aquecimento) e `fig-painel.js` (painel, fonte de luz, reóstato, amperímetro, voltímetro);
  - `tests/esquemas-fqa-termica.test.js`.

- [ ] **Step 1: Testes que falham**
  - Montar e desmontar sem ouvintes ativos.
  - `fqa-aquecimento` mostra os patamares a 0 °C e a 100 °C, e a energia de cada troço é igual à de `aquecimentoGelo`.
  - `fqa-mistura` com gelo em excesso mostra $\theta_{eq}$ = 0 °C e "gelo por derreter".
  - `fqa-painel` mostra o ponto de potência máxima e um rendimento que nunca passa de 100 %.
  - `fqa-transferencias` mostra os 3 mecanismos e o sentido do calor, do corpo quente para o frio.
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: esquemas de Física — transferências, aquecimento, mistura, painel e figuras`.

### Task 5: Conteúdo — tema Energia e movimentos

**Files:**
- Create: `conteudos/fqa/movimentos.js` (subtemas sistema-mecanico, trabalho e energia-mecanica).
- Modify: `conteudos/indice.js`, onde entra o tema `movimentos` com os 3 subtemas, e `conteudos/fqa/ae.js`, onde se acrescentam as frases de "Energia e movimentos" de 2018 e as de 2026 que forem novas.

**Interfaces:**
- O modelo é o de `conteudos/fqa/elementos.js` e `materia.js`:
  - helpers que leem `Manual.dadosFisica`;
  - `verificar` com `Manual.fisica`;
  - mini-quiz com `errosTipicos` e `algarismos`.
- Cada subtema tem pelo menos um esquema ou figura.

- [ ] **Step 1:** Escrever um subtema de cada vez e correr `npm run validar` depois de cada um. A cobertura dos objetivos AE fecha no fim desta tarefa para o subdomínio.
- [ ] **Step 2:** Pôr no relatório a lista de factos, cada um com a sua origem.
- [ ] **Step 3:** Correr `npm test` e `npm run cache`. Commit `feat: conteúdo de Física — energia e movimentos`.

### Task 6: Conteúdo — eletricidade e térmica

**Files:**
- Create: `conteudos/fqa/eletricidade.js` (circuitos, gerador) e `conteudos/fqa/termica.js` (transferencias, balancos, rendimento).
- Modify: `conteudos/indice.js`, onde entram os 2 temas, e `conteudos/fqa/ae.js`.

- [ ] **Step 1:** Seguir as mesmas regras da Task 5. Incluir as AL:
  - características de uma pilha;
  - capacidade térmica mássica e entalpia de fusão do gelo;
  - painel fotovoltaico.
- [ ] **Step 2:** Correr `npm run validar` com cobertura completa de `Manual.ae.fqa`. Pôr a lista de factos no relatório.
- [ ] **Step 3:** Correr `npm test` e `npm run cache`. Commit `feat: conteúdo de Física — eletricidade e térmica`.

### Task 7: Geradores — Energia e movimentos

**Files:**
- Create: `js/geradores/fqa/fisica-movimentos.js` (pelo menos 9 geradores) e `tests/geradores-fqa-movimentos.test.js`.
- Modify: `index.html` (o script entra depois de `js/geradores/fqa/materia.js`), `js/painel.js` (EXCECOES), o snapshot e a allowlist.

**Interfaces:**
- Tipos da spec §7. O modelo é `js/geradores/fqa/elementos.js` e `materia.js`, incluindo os helpers `plural` e `artigo`.

- [ ] **Step 1: Testes que falham**
  - Um verificar com 200 sementes por gerador e o snapshot da semente 1.
  - Um item com α = 90° dá `resposta === 0`, e `detetarErro(p, '0')` devolve null.
  - Nenhuma opção ou resposta contém "NaN" nem "Infinity".
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test`, `npm run validar` e `npm run cache`. Arrancar `npm run verificar` em segundo plano.
- [ ] **Step 5:** Commit `feat: geradores de Física — energia e movimentos`.

### Task 8: Geradores — eletricidade e térmica

**Files:**
- Create: `js/geradores/fqa/fisica-eletricidade.js` (pelo menos 6 geradores), `js/geradores/fqa/fisica-termica.js` (pelo menos 9 geradores) e os respetivos testes.

- [ ] **Step 1: Testes que falham**
  - O mesmo estilo da Task 7.
  - Nenhum rendimento passa de 100 %.
  - Uma mistura com gelo em excesso dá 0 °C.
  - Um gerador com Rext = 0, quando é gerado, dá `I = ε/r` e não há divisão por zero.
  - Os geradores qualitativos de transferências têm pelo menos 10 situações cada, sem situações repetidas.
- [ ] **Step 2:** Ver os testes a falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test`, `npm run validar` e `npm run cache`. Arrancar `npm run verificar` em segundo plano.
- [ ] **Step 5:** Commit `feat: geradores de Física — eletricidade e térmica`.

### Task 9: Fecho da disciplina

**Files:** Modify `conteudos/indice.js` (remover `porFazer`) e os testes que esperam "Física — em breve" (passam a esperar que a nota não apareça quando `porFazer` está vazio).

- [ ] **Step 1:** Remover `porFazer`. Correr `npm run validar`, `npm test` e `npm run cache`.
- [ ] **Step 2: Browser** (feito pelo controlador, com o CDP e o servidor Node). Verificar a 375 px, no tema claro e no escuro:
  - os 8 subtemas;
  - os esquemas e as figuras, incluindo separar e ampliar;
  - o mini-quiz;
  - o Treino e o Teste de FQ-A com temas de Física.
  
  Não pode haver deslocamento horizontal nem fórmulas com erro.
- [ ] **Step 3:** Commit `feat: Física e Química A completa (Física)`.
