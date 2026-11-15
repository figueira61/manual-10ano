# Fase 3A — Química de FQ-A e figuras explodidas: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Física e Química A passa a estar disponível com a componente de Química completa (12 subtemas: conteúdo, esquemas, banco, ≥ 36 geradores) e o manual ganha o componente partilhado de figura legendada com vista explodida.

**Architecture:** Mesmo modelo da Matemática A. Os dados e cálculos ficam em módulos puros: `esquemas/fqa/calculo-dados.js` e `esquemas/fqa/calculo-quimica.js`, carregados pela convenção `calculo-*.js`. O conteúdo vai para `conteudos/fqa/*.js`, os geradores para `js/geradores/fqa/*.js` e os esquemas para `esquemas/fqa/*.js`. Os componentes partilhados novos são `esquemas/nucleo/figura.js` (vista explodida) e o esquema `fqa-molecula`. O motor passa a funcionar com várias disciplinas e o quiz ganha uma figura no enunciado.

**Tech Stack:** O de sempre: JS clássico no namespace `Manual`, sem build, KaTeX vendorizado (sem mhchem), SVG, `node --test`, validador e harness de 2000 sementes.

**Spec:** `docs/superpowers/specs/2026-11-15-manual-10ano-fase3a-quimica-design.md`. Também se aplicam a Fase 1 (§5, §7, §8) e a Fase 2 (§6).

## Global Constraints

- PT-PT, tratamento por "tu", Acordo Ortográfico de 1990, nomenclatura dos manuais portugueses ("quantidade de matéria", "energia de ionização", "ligação de hidrogénio").
- Sem dependências novas, sem CDN e sem build. Cada ficheiro novo entra no `index.html` (se for de carregamento imediato) e no `lista-cache.js` (`npm run cache`).
- Fórmulas químicas em KaTeX com `\mathrm{}`; unidades SI com espaço fino; vírgula decimal; notação científica com mantissa em [1, 10).
- Valores químicos só a partir de `Manual.dadosQuimicos`, nunca escritos à mão noutros ficheiros. Cada bloco de dados tem a fonte (spec §8 e §11.2).
- Os enunciados dizem sempre os valores de dados de que a aluna precisa (massas atómicas, energias de ligação, constantes).
- Contrato e regras dos geradores da Fase 2C, todas em vigor:
  - erro típico só quando os dados o produzem, e a explicação mostra o valor exato apresentado;
  - opções plausíveis e na escala certa;
  - verificação feita por outro método;
  - "≈" quando o valor é arredondado;
  - nunca um coeficiente 1 escrito;
  - KaTeX estrito;
  - o esquema só aparece depois de "Verificar".
- Formatos: só `numerica`, `escolha` e `vf`. Uma figura no enunciado nunca pode revelar a resposta.
- O mini-quiz de Matemática A não muda ("mantém como está").
- Esquemas e figuras: teclado, valores também em texto, tema claro e escuro, 375 px sem deslocamento horizontal, `prefers-reduced-motion` respeitado.
- A disciplina `fqa` só passa a `disponivel: true` na Task 10. Até lá, o validador e o harness verificam `fqa` se o ficheiro de tema existir, e o site não a mostra.
- Commits com a identidade noreply e o trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, no ramo `fase-3a`. Não se faz push nem merge.
- O `npm test`, o `npm run validar` e o `npm run verificar` (todos os geradores, 0 erros) continuam a passar.

## Review Focus

1. **Notação científica na resposta:** "6,02e23", "6.02E23", "6,02×10^23", "6,02 x 10^23" e "6,02×10²³" são aceites, e um expoente errado conta como errado. Teste na Task 1.
2. **Algarismos significativos:** com "2 a.s." e resposta 0,50, tanto "0,5" como "0,50" estão certos, e "0,6" está errado. Teste na Task 1 (`toleranciaRelativa`/meia unidade).
3. **Configuração de iões de metais de transição (Z ≤ 23):** os eletrões 4s saem antes dos 3d. Os geradores ou tratam isto bem (Ti²⁺ = [Ar] 3d²) ou não pedem iões do bloco d. Teste na Task 2.
4. **Sessão de Treino ou Teste com perguntas de Matemática A e de FQ-A:** cada pergunta carrega o esquema da sua própria disciplina. Teste na Task 1.
5. **Figura explodida a 375 px com legendas longas:** as legendas fazem quebra de linha e não há deslocamento horizontal. A Task 3 testa o modelo das posições (as legendas ficam dentro da largura) e o browser da Task 10 confirma.

---

### Task 1: Motor para várias disciplinas, notação científica e figura no enunciado

**Files:**
- Modify:
  - `js/quiz.js`: `lerNumero`, `corrigir` e a figura no enunciado;
  - `js/geradores/registo.js`: `toleranciaRelativa`, `figuraEnunciado`;
  - `tools/verificar-geradores.js`: carrega `esquemas/*/calculo-*.js` de todas as disciplinas e aceita `toleranciaRelativa`;
  - `tools/validar-conteudos.js`: geradores de todas as disciplinas presentes; `fqa` validada se tiver ficheiros de tema;
  - `js/vistas-estudo.js`: escolha da disciplina no Teste, agrupamento por disciplina no Treino, esquema pela disciplina de cada pergunta;
  - `js/render.js`: página da disciplina com a nota "Física — em breve" quando o índice a declara;
  - `conteudos/indice.js`: `fqa` com os 2 temas e os 12 subtemas da spec §4, ainda `disponivel: false`, e `porFazer: ['Física']`.
- Tests: `tests/quiz.test.js`, `tests/geradores.test.js`, `tests/vistas-estudo-fim.test.js` (ou um ficheiro novo), `tests/validador.test.js`, `tests/router.test.js` (se for preciso).

**Interfaces:**
- **`Manual.quiz.lerNumero(texto) -> number|NaN`** aceita, além do que já aceita:
  - `aEb` e `aeb` (com `E`/`e`, sinal no expoente);
  - `a×10^b`, `a x 10^b`, `a*10^b`, com espaços opcionais;
  - `a×10` seguido de expoente em sobrescrito Unicode (`⁰¹²³⁴⁵⁶⁷⁸⁹⁻`);
  - a mantissa usa vírgula ou ponto.
- **`Manual.quiz.corrigir`**: uma pergunta `numerica` com `toleranciaRelativa: r` está certa quando `|x − resposta| <= r·|resposta|`. Quando tem as duas tolerâncias, basta cumprir uma.
- **Contrato do gerador (registo):**
  - `ex.toleranciaRelativa` (opcional, número > 0) e `ex.figuraEnunciado` (opcional, `{ id, opcoes }`) passam para a pergunta;
  - o harness rejeita uma pergunta numérica sem `tolerancia` e sem `toleranciaRelativa`, e uma `figuraEnunciado` cujo esquema não exista.
- **Algarismos significativos:** novo helper `Manual.geradores.ajudas.tolMeiaUnidade(valor, as) -> number`, que devolve a tolerância absoluta de meia unidade do último algarismo significativo de `valor` arredondado a `as` algarismos.
- **Figura no enunciado:** o quiz, nos modos quiz, treino e teste, mostra `pergunta.figuraEnunciado` por baixo do enunciado e antes das opções, através de `opcoes.montarEsquema`, e destrói-a com as outras.
- **Teste:** o ecrã de configuração começa por "Disciplina", com botões de opção só para as disciplinas disponíveis que tenham geradores. Escolher uma mostra os temas dessa disciplina. `montarTeste(disciplina, …)` já recebe a disciplina.
- **Treino:** a escolha livre agrupa por disciplina (título da disciplina por cima dos temas).
- **Esquemas no feedback em Treino e Teste:** `montarEsquema` usa a disciplina da `chave` da pergunta, não a da primeira.
- **Índice:** `{ id: 'fqa', nome: 'Física e Química A', disponivel: false, porFazer: ['Física'], temas: [...] }`. A página da disciplina mostra, por baixo dos temas, "Física — em breve" sem ligação, para cada entrada de `porFazer`.

- [ ] **Step 1: Testes que falham**
  - `lerNumero`:
    - `'6,02e23'`, `'6.02E23'`, `'6,02×10^23'`, `'6,02 x 10^23'` e `'6,02×10²³'` dão todos `6.02e23`;
    - `'1,6×10⁻¹⁹'` dá `1.6e-19`;
    - `'6,02×10^'` dá NaN.
  - `corrigir` com `{ resposta: 6.02e23, toleranciaRelativa: 0.005 }`: `'6,03e23'` está certo e `'6,02e22'` está errado.
  - `tolMeiaUnidade(0.5, 2)` é `0.005` e `tolMeiaUnidade(1234, 2)` é `50`.
  - O harness falha com um gerador falso numérico sem tolerâncias e passa com `toleranciaRelativa`.
  - O quiz com `figuraEnunciado` chama `montarEsquema` antes de "Verificar" (DOM falso), e o esquema da resposta continua a aparecer só depois de "Verificar".
  - Teste:
    - sem disciplina escolhida não há temas;
    - escolher `mat-a` mostra os 5 temas de Matemática A.
  - Uma sessão de Treino com uma pergunta de chave `fqa/...` e outra `mat-a/...` faz `montarEsquema` receber a disciplina certa em cada uma.
  - A página da disciplina `fqa` (DOM falso, com disponível forçado no teste) mostra "Física — em breve".
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test`, `npm run validar`, `npm run cache`, e `npm run verificar` em segundo plano, que tem de continuar com 0 erros.
- [ ] **Step 5:** Commit `feat: motor para várias disciplinas, notação científica e figura no enunciado`.

### Task 2: Dados e cálculos de Química

**Files:** Create `esquemas/fqa/calculo-dados.js`, `esquemas/fqa/calculo-quimica.js`, `tests/calculo-quimica.test.js`, `tests/dados-quimicos.test.js`. Modify `esquemas/mat-a/formatar.js` (`cientifico`).

**Interfaces:**
- **`Manual.dadosQuimicos`:**
  - `elementos: { [simbolo]: { z, nome, massaAtomica, grupo, periodo, bloco, ei1?, raio? } }` para Z = 1–36. `massaAtomica` vem da Tabela Periódica do IAVE (exame 715). `ei1` está em kJ/mol (NIST), `raio` em pm (raios empíricos, Slater 1964), só para os representativos;
  - `isotopos: { [simbolo]: [{ a, massa, abundancia }] }` para H, C, N, O, Ne, Mg, Cl, Cu, B, Li (abundâncias IUPAC);
  - `ligacoes: { 'H-H': { energia, comprimento }, 'C-C', 'C=C', 'C≡C', 'O=O', 'N≡N', 'C-H', 'O-H', 'N-H', 'C=O', 'C-O', 'H-Cl', 'Cl-Cl', 'C-Cl', 'H-Br', 'Br-Br', 'H-I', 'I-I', 'H-F', 'F-F', 'O-O', 'N-N', 'N=N', 'C-N', 'C≡N' }`, com energia em kJ/mol, comprimento em pm e uma única tabela de valores médios;
  - `constantes: { NA: 6.02e23, h: 6.63e-34, c: 3.00e8, Vm: 22.4, EnH: -2.18e-18 }`, com os valores do formulário do IAVE e `Vm` em dm³/mol nas condições PTN;
  - `fontes: { [bloco]: texto }`;
  - `excecoesEI: ['Be>B','N>O','Mg>Al','P>S','Zn>Ga','As>Se']`.
  - Ir buscar os valores à web é permitido; cada bloco guarda a sua fonte.
- **`Manual.quimica`** (funções puras, todas testadas):
  - `massaAtomicaMedia(isotopos) -> number`
  - `massaMolar(formula: {[simbolo]: n}) -> number`, que usa `dadosQuimicos.elementos`
  - `nDeMassa(m, M)`, `massaDeN(n, M)`, `entidades(n)`, `nDeEntidades(N)`, `atomosNaAmostra(n, formula, simbolo)`
  - `energiaFotao({ f?, lambda? }) -> { E, f, lambda }`
  - `zonaEspectro(lambda) -> 'gama'|'X'|'UV'|'visivel'|'IV'|'micro-ondas'|'radio'`
  - `energiaNivelH(n) -> J`
  - `transicaoH(ni, nf) -> { deltaE, tipo: 'emissao'|'absorcao', serie: 'Lyman'|'Balmer'|'Paschen'|null, lambda }`
  - `configuracao(z, carga = 0) -> { subniveis: [{ nome:'1s', eletroes }], caixas: [{ subnivel, orbitais: [[↑,↓]...] }], spd: '1s^2 2s^2 2p^4', cerne: '[He] 2s^2 2p^4', valencia, desemparelhados, orbitaisOcupadas }`
    - ordem de construção 1s 2s 2p 3s 3p 4s 3d;
    - nos catiões tira primeiro de 4s;
    - lança erro para Z > 23 e para cargas inválidas.
  - `posicaoTP(z) -> { grupo, periodo, bloco }` a partir da configuração, coerente com `dados`.
  - `densidadeRelativa({ mPicnometroVazio, mComAgua, mComMetal, mComMetalEAgua }) -> number`, pelo método da AL.
  - `concentracao(n, V)`, `concentracaoMassica(m, V)`, `percentagemMassa(mSoluto, mSolucao)`, `percentagemVolume`, `ppm(mSoluto, mSolucao)`, `diluicao({ ci, Vi, cf?, Vf? })`, que resolve a incógnita e dá também o `fator`.
  - `volumeGasPTN(n)`, `nDeVolumePTN(V)`, `massaVolumicaGas(M) = M/Vm`, `fracaoMolar(nI, nTotal)`.
  - `deltaHLigacoes({ quebradas: {chave: n}, formadas: {chave: n} }) -> { soma quebradas, soma formadas, deltaH }`.
  - `lambdaParaQuebrarLigacao(energiaKJmol) -> m`, por molécula: E/NA.
- **`Manual.formatar.cientifico(x, as) -> string`** em LaTeX, por exemplo `6{,}02 \times 10^{23}`. Para `as` algarismos usa mantissa em [1, 10) e vírgula.

- [ ] **Step 1: Testes que falham**
  - Valores pedidos pela spec:
    - `massaMolar({H:2,O:1})` dá `18.02` com a TP do IAVE, ±0,005;
    - `massaAtomicaMedia(isotopos.Cl)` fica em [35,44; 35,46];
    - `energiaFotao({lambda: 500e-9}).E` dá ≈ `3.98e-19`;
    - `transicaoH(3, 2)` é emissão Balmer com λ ≈ 656 nm (±3 nm);
    - `transicaoH(1, 4)` é absorção Lyman.
  - Configurações:
    - `configuracao(8).spd === '1s^2 2s^2 2p^4'` com 2 eletrões desemparelhados;
    - `configuracao(23).cerne === '[Ar] 4s^2 3d^3'`: a escrita segue a ordem de preenchimento, como nos manuais portugueses;
    - `configuracao(22, 2)` dá `[Ar] 3d^2`;
    - `configuracao(24)` lança erro.
  - `posicaoTP(17)` é `{ grupo: 17, periodo: 3, bloco: 'p' }`.
  - `diluicao({ci: 0.5, Vi: 10, Vf: 50})` dá `cf` 0,1 e fator 5.
  - `deltaHLigacoes` para H₂ + Cl₂ → 2 HCl, com os dados da tabela, dá o valor esperado calculado à mão no teste.
  - **Dados:**
    - a EI cresce ao longo do período nos representativos dos períodos 2–4, exceto nos pares de `excecoesEI`;
    - a EI decresce ao descer no grupo (grupos 1, 2, 13–18);
    - o raio varia no sentido inverso (sem exceções);
    - para C–C, C=C e C≡C, e para N–N, N=N e N≡N, a energia cresce e o comprimento decresce;
    - todos os elementos de 1 a 36 têm `massaAtomica` e `fontes` cobre todos os blocos.
  - `cientifico(6.022e23, 3) === '6{,}02 \\times 10^{23}'`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: dados e cálculos de Química (com fontes)`.

### Task 3: Figura legendada com vista explodida

**Files:** Create `esquemas/nucleo/figura.js`, `tests/figura.test.js`. Modify `index.html` (carregar a seguir aos outros ficheiros do núcleo), `css/base.css`, `lista-cache.js`.

**Interfaces:**
- `Manual.figura.criarEsquema(definicao) -> { montar(el, opcoes) -> { destruir() } }`, que se regista com `Manual.esquemas.registar(id, ...)` nos ficheiros de figura.
- `definicao`:
  - `{ titulo, largura, altura, partes: [{ id, rotulo, descricao?, desenhar(svg, criarSvg) | svg: string, explodir: { dx, dy } }] }`;
  - `svg` é marcação SVG escrita no projeto, nunca de terceiros, e entra através de um parser seguro: `DOMParser` com tipo SVG, sem script nem atributos `on*`.
- `opcoes`: `{ modo: 'normal'|'exercicio', destacar?: idParte, esconderRotulos?: boolean }`.
- Funções puras exportadas para testes:
  - `Manual.figura.posicoes(definicao, estado: 'montada'|'explodida', larguraDisponivel) -> { [id]: { x, y, legenda: { x, y, largura } } }` — as legendas ficam dentro de `larguraDisponivel`, e abaixo de 480 px vão para uma lista por baixo, numerada e ligada por número;
  - `Manual.figura.proximoEstado(estado, evento) -> estado`.
- **Interface:**
  - botões "Separar as partes" ⇄ "Juntar" e "Ampliar", que abre um diálogo com o mesmo comportamento e fecha com "Fechar" ou Esc;
  - cada parte é focável (Tab), com `aria-label`; Enter foca a parte (destaca, esbate as outras e mostra a descrição); Esc ou tocar fora volta atrás;
  - a lista de legendas numerada está sempre presente em texto;
  - a animação dura ≤ 400 ms e não acontece com `prefers-reduced-motion`;
  - no modo exercício os rótulos ficam escondidos e a parte `destacar` tem contorno e o número.

- [ ] **Step 1: Testes que falham**
  - `proximoEstado`:
    - montada + separar → explodida;
    - explodida + juntar → montada;
    - qualquer estado + focar(id) → foco;
    - foco + esc → estado anterior.
  - `posicoes`:
    - com 375, nenhuma legenda passa de x + largura > 375;
    - com 375 as legendas vão para a lista (modo lista);
    - na vista explodida cada parte fica deslocada exatamente pelo seu `explodir`.
  - Montar no DOM falso:
    - há N botões de parte com `aria-label`;
    - o clique em "Separar as partes" muda o estado;
    - o Esc volta;
    - `destruir()` remove os ouvintes;
    - o modo exercício esconde os rótulos e marca o destaque.
  - Um `svg` com `<script>` ou `onload` é rejeitado (lança erro).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: figura legendada com vista explodida (componente partilhado)`.

### Task 4: Desenho de moléculas (`fqa-molecula`)

**Files:** Create `esquemas/fqa/fqa-molecula.js`, `esquemas/fqa/calculo-moleculas.js` (catálogo, puro), `tests/moleculas.test.js`.

**Interfaces:**
- `Manual.moleculas.catalogo`:
  - `{ [id]: { nome, formula (LaTeX), atomos: [{ el, x, y, pares: n }], ligacoes: [[i, j, ordem]], geometria, angulo, polar: boolean, grupoFuncional?: 'alcool'|'aldeido'|'cetona'|'acido'|'amina'|null, tipo: 'hidrocarboneto-saturado'|'insaturado'|null } }`;
  - pelo menos: H2, O2, N2, Cl2, HCl, HF, H2O, NH3, CH4, CO2, BF3, HCN, C2H6, C2H4, C2H2, C3H8, C3H6, C4H10, CH3OH, C2H5OH, CH3CHO, CH3COCH3, CH3COOH, CH3NH2, O3.
- `Manual.moleculas.contar(id) -> { paresLigantes, paresNaoLigantes, ligacoesSimples, duplas, triplas, eletroesValencia }`.
- Esquema `fqa-molecula`:
  - opções `{ molecula: id, modo: 'lewis'|'estrutura' }`;
  - desenha em SVG com coordenadas fixas;
  - os pares não ligantes só aparecem em `lewis`;
  - texto alternativo com o nome e as contagens.

- [ ] **Step 1: Testes que falham**
  - Para cada molécula do catálogo:
    - a soma dos eletrões de valência dos átomos é igual a 2 × (pares ligantes + não ligantes);
    - a regra do octeto é cumprida (H com 2; exceção declarada para BF₃);
    - `polar` é coerente com a geometria (CO₂, CH₄ e BF₃ apolares; H₂O, NH₃ e HCl polares).
  - `contar('H2O')` dá 2 pares ligantes e 2 não ligantes.
  - O DOM falso desenha N círculos/textos de átomos e o número certo de traços.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: catálogo e desenho de moléculas (Lewis e fórmula de estrutura)`.

### Task 5: Esquemas interativos — tema Elementos

**Files:** Create `esquemas/fqa/fqa-atomo.js`, `fqa-isotopos.js`, `fqa-espectro.js`, `fqa-niveis.js`, `fqa-configuracao.js`, `fqa-tabela.js`, `fig-atomo.js` (figura explodida da constituição do átomo); `tests/esquemas-fqa-elementos.test.js`.

**Interfaces:** Cada um regista `Manual.esquemas.registar('<id>', { montar(el, opcoes) -> { destruir } })` com o comportamento da spec §5. Todos os números vêm de `Manual.quimica`/`Manual.dadosQuimicos`, e cada valor mostrado também aparece em texto. `fig-atomo` usa `Manual.figura.criarEsquema` com as partes núcleo, protão, neutrão, eletrão e nuvem eletrónica.

- [ ] **Step 1: Testes que falham** (DOM falso; um teste por esquema):
  - monta e desmonta sem erros, com zero ouvintes ativos depois de `destruir`;
  - mudar o controlo principal atualiza o texto: `fqa-atomo` com Z=8 e A=17 mostra "N = 9"; `fqa-espectro` com λ=500 nm mostra a energia `cientifico(...)` de `energiaFotao`; `fqa-configuracao` com Z=23 mostra a cadeia spd de `configuracao(23)`; `fqa-tabela` ao selecionar Na mostra o grupo 1 e o período 3.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: esquemas de Química — átomo, isótopos, espectro, níveis, configuração, tabela periódica`.

### Task 6: Esquemas interativos — tema Matéria

**Files:** Create `esquemas/fqa/fqa-energia-distancia.js`, `fqa-geometria.js` (usa `esquemas/nucleo/proj3d.js` e o catálogo), `fqa-diluicao.js`, `fqa-entalpia.js`, `fig-material-solucao.js` e `fig-picnometro.js` (figuras explodidas); `tests/esquemas-fqa-materia.test.js`.

**Interfaces:**
- Comportamento da spec §5.
- A curva energia–distância usa um potencial de Morse com os parâmetros (energia e comprimento de ligação) de `dadosQuimicos.ligacoes`, para H–H, Cl–Cl e H–Cl.
- A geometria 3D precisa de coordenadas 3D: acrescentar ao catálogo da Task 4 o campo `atomos3d` para as moléculas com geometria tridimensional (NH₃, CH₄, H₂O; e BF₃, CO₂ e HCN no plano). A Task 4 aceita que o campo seja opcional.

- [ ] **Step 1: Testes que falham** (DOM falso):
  - montar e desmontar sem erros;
  - `fqa-energia-distancia` com H–H marca o mínimo em 74 pm (o valor de `dados`);
  - `fqa-geometria` com NH₃ mostra "piramidal trigonal" e "polar";
  - `fqa-diluicao` com ci=0,5, Vi=10 e Vf=50 mostra 0,1 e fator 5;
  - `fqa-entalpia` para a síntese do HCl mostra o ΔH de `deltaHLigacoes`;
  - as figuras têm as partes da spec §6 (material de laboratório: balança, espátula, vidro de relógio, gobelé, funil, balão volumétrico, pipeta, pompete, esguicho; picnómetro: corpo, tampa com capilar, marca).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache`.
- [ ] **Step 5:** Commit `feat: esquemas de Química — energia de ligação, geometria 3D, diluição, entalpia e figuras de laboratório`.

### Task 7: Conteúdo — tema Elementos químicos e sua organização

**Files:** Create `conteudos/fqa/ae.js` (todos os objetivos de Química: as frases literais de `docs/referencias/ae-fqa-10-2018.txt` e, à parte, as frases novas da revisão de 2026 de `ae-fqa-10-2026.txt`, com o comentário `// revisão 2026`) e `conteudos/fqa/elementos.js` (5 subtemas: atomo, mole, espectros, configuracao, tabela-periodica). Tests: as do validador (`npm run validar`).

**Interfaces:**
- O modelo de subtema é o da Fase 1 §5.1: `ae` com frases literais de `Manual.ae.fqa`, minutos, essencial, resumo e quiz com 4–6 perguntas.
- Os blocos `esquema` usam os ids das Tasks 3–5.
- Os exemplos resolvidos e as perguntas numéricas usam `verificar: () => Manual.quimica...` (como `Manual.calc` em Matemática A), para o validador confirmar os valores.
- As perguntas de escolha múltipla têm `errosTipicos` nas opções erradas quando o erro é identificável.

- [ ] **Step 1:** Escrever o conteúdo. Cada parágrafo tem 3–4 linhas no máximo, há um exemplo resolvido por conceito principal com os valores intermédios, os erros frequentes estão assinalados e há pelo menos um esquema por subtema.
- [ ] **Step 2:** `npm run validar` passa. Nesta fase só se verifica `fqa/elementos`; a cobertura de AE completa só fecha na Task 8.
- [ ] **Step 3:** Revisão de factos. O implementador lista no relatório cada afirmação quantitativa ou factual (valores, regras, exceções) com a origem (AE, `dadosQuimicos` ou cálculo), para a revisão conferir.
- [ ] **Step 4:** Commit `feat: conteúdo de Química — elementos químicos e sua organização`.

### Task 8: Conteúdo — tema Propriedades e transformações da matéria

**Files:** Create `conteudos/fqa/materia.js` (7 subtemas: ligacao, geometria, carbono, gases, solucoes, entalpia, fotoquimica).

**Interfaces:** As da Task 7. Os esquemas são os das Tasks 4 e 6.

- [ ] **Step 1:** Escrever o conteúdo com as mesmas regras da Task 7.
- [ ] **Step 2:** `npm run validar` passa, com a cobertura completa de `Manual.ae.fqa`: cada objetivo está em pelo menos um subtema.
- [ ] **Step 3:** A mesma lista de factos com a origem, no relatório.
- [ ] **Step 4:** Commit `feat: conteúdo de Química — propriedades e transformações da matéria`.

### Task 9: Geradores de Química

**Files:**
- Create `js/geradores/fqa/elementos.js` (≥ 15 geradores) e `js/geradores/fqa/materia.js` (≥ 21 geradores), com testes em `tests/geradores-fqa-elementos.test.js` e `tests/geradores-fqa-materia.test.js`.
- Modify `index.html` (carregar depois dos geradores de Matemática A, antes do `miniquiz.js`), `tests/geradores-codigos.test.js` (allowlist) e `tests/fixtures/erros-humanizados.txt` (os códigos novos ficam com texto em `js/painel.js` `EXCECOES`).

**Interfaces:**
- O contrato da Fase 2 §6.1 e da Task 1: `toleranciaRelativa`, `figuraEnunciado` (por exemplo `fqa-molecula` em modo `estrutura` para "qual é o grupo funcional", e `fig-atomo` em modo exercício para "que parte é a 2").
- Os tipos são os da spec §7, pelo menos 3 por subtema e cada um com ≥ 2 formatos ou contextos.
- As regras de autoria da Fase 2C aplicam-se todas (ver Global Constraints). Os erros típicos de Química são os reais, por exemplo:
  - confundir A com Z;
  - massa em g sem converter para n;
  - $E = h/\lambda$ em vez de $hc/\lambda$;
  - nm não convertidos para m;
  - eletrões tirados de 3d antes de 4s;
  - "maior raio → maior EI";
  - ΔH com o sinal trocado (formadas − quebradas);
  - $c_iV_f = c_fV_i$;
  - mL em vez de L;
  - V_m usado fora das condições PTN quando o enunciado dá outro valor.
- Os textos dos códigos novos vão para `EXCECOES` em `js/painel.js`, no snapshot.
- Esta tarefa é grande: o implementador pode dividi-la em dois commits, um por ficheiro, e o controlador pode despachá-la em duas partes (Elementos e Matéria) com revisões separadas.

- [ ] **Step 1: Testes que falham** por gerador, no estilo da Fase 2C:
  - um snapshot da semente 1;
  - verificações específicas, entre elas:
    - "Ti²⁺ = [Ar] 3d²" nunca aparece como opção errada marcada certa;
    - a resposta de ΔH tem o sinal certo;
    - a resposta em notação científica corrige com `toleranciaRelativa`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test`, `npm run validar` (≥ 3 por subtema de `fqa`) e `npm run verificar` com todos os geradores e 0 erros (corre em segundo plano, ~30 min).
- [ ] **Step 5:** Commit(s) `feat: geradores de Química — elementos` e `feat: geradores de Química — matéria`.

### Task 10: Ativar Física e Química A

**Files:** Modify `conteudos/indice.js` (`fqa.disponivel: true`), `lista-cache.js`, `tests/` (o que o validador e a cache exigirem).

- [ ] **Step 1:** `disponivel: true`. Depois `npm run validar`, `npm test`, `npm run cache` e `npm run verificar`.
- [ ] **Step 2: Browser** (o controlador, em Chrome sem janela via CDP, `scratchpad/cdp.js`). Verificar:
  - início, página da disciplina com "Física — em breve" e os 12 subtemas: cada página abre sem erros de KaTeX nem na consola;
  - cada esquema e cada figura a 375 px e no tema escuro, incluindo separar e juntar, ampliar e Esc na figura, sem deslocamento horizontal;
  - mini-quiz de 2 subtemas;
  - Treino com sugestão e escolha de FQ-A;
  - Teste com a disciplina FQ-A, 2 temas e 10 perguntas;
  - O meu progresso com as duas disciplinas.
- [ ] **Step 3:** Commit `feat: Física e Química A disponível (componente de Química)`.
